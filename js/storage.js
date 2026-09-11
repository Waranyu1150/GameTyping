// Typing Quest / Typing Chicken - Storage Module
// Manages local persistence for Classic and Minecraft modes, stars, progress, and settings.

const STORAGE_KEY = "typing_quest_save_v1";

const DEFAULT_MODE_STATE = {
  highestUnlockedLevel: 1,
  lastPlayedLevel: 1,
  starsByLevel: {},      // e.g. { 1: 3, 2: 2 }
  completedLevels: {}    // e.g. { 1: true, 2: true }
};

const DEFAULT_ENDLESS_STATE = {
  highScore: { words: 0, wpm: 0, maxStreak: 0, accuracy: 0, date: null }
};

const DEFAULT_STATE = {
  currentMode: "classic", // "classic" | "minecraft" | "endless"
  modes: {
    classic: { ...DEFAULT_MODE_STATE },
    minecraft: { ...DEFAULT_MODE_STATE },
    endless: { ...DEFAULT_ENDLESS_STATE }
  },
  settings: {
    soundEnabled: true,
    volume: 0.8,
    theme: "dark"
  }
};

class StorageManager {
  constructor() {
    this.state = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        
        // Migrate or load mode-specific states
        const modes = parsed.modes || {};
        
        // Migrate legacy flat state to classic mode if needed
        const classicState = modes.classic || {
          highestUnlockedLevel: Math.max(1, Math.min(30, parsed.highestUnlockedLevel || 1)),
          lastPlayedLevel: Math.max(1, Math.min(30, parsed.lastPlayedLevel || 1)),
          starsByLevel: parsed.starsByLevel || {},
          completedLevels: parsed.completedLevels || {}
        };

        const minecraftState = modes.minecraft || {
          highestUnlockedLevel: 1,
          lastPlayedLevel: 1,
          starsByLevel: {},
          completedLevels: {}
        };

        const endlessState = modes.endless || {};
        let endlessHighScore = endlessState.highScore;
        if (!endlessHighScore && endlessState.highScores) {
          let bestWords = 0;
          let bestObj = { words: 0, wpm: 0, maxStreak: 0, accuracy: 0, date: null };
          for (const s of Object.values(endlessState.highScores)) {
            if ((s.words || 0) > bestWords) {
              bestWords = s.words;
              bestObj = { ...s };
            }
          }
          endlessHighScore = bestObj;
        }
        if (!endlessHighScore) {
          endlessHighScore = { words: 0, wpm: 0, maxStreak: 0, accuracy: 0, date: null };
        }

        const validModes = ["classic", "minecraft", "endless"];
        const currentMode = validModes.includes(parsed.currentMode) ? parsed.currentMode : "classic";

        return {
          currentMode: currentMode,
          modes: {
            classic: {
              highestUnlockedLevel: Math.max(1, Math.min(30, classicState.highestUnlockedLevel || 1)),
              lastPlayedLevel: Math.max(1, Math.min(30, classicState.lastPlayedLevel || 1)),
              starsByLevel: classicState.starsByLevel || {},
              completedLevels: classicState.completedLevels || {}
            },
            minecraft: {
              highestUnlockedLevel: Math.max(1, Math.min(20, minecraftState.highestUnlockedLevel || 1)),
              lastPlayedLevel: Math.max(1, Math.min(20, minecraftState.lastPlayedLevel || 1)),
              starsByLevel: minecraftState.starsByLevel || {},
              completedLevels: minecraftState.completedLevels || {}
            },
            endless: {
              highScore: endlessHighScore
            }
          },
          settings: {
            ...DEFAULT_STATE.settings,
            ...(parsed.settings || {})
          }
        };
      }
    } catch (e) {
      console.warn("LocalStorage unavailable, falling back to memory state:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Failed to write to localStorage:", e);
    }
  }

  getCurrentMode() {
    return this.state.currentMode || "classic";
  }

  setCurrentMode(mode) {
    if (mode === "minecraft" || mode === "classic" || mode === "endless") {
      this.state.currentMode = mode;
      this.save();
    }
  }

  getModeState(mode = this.getCurrentMode()) {
    if (!this.state.modes[mode]) {
      if (mode === "endless") {
        this.state.modes[mode] = JSON.parse(JSON.stringify(DEFAULT_ENDLESS_STATE));
      } else {
        this.state.modes[mode] = JSON.parse(JSON.stringify(DEFAULT_MODE_STATE));
      }
    }
    return this.state.modes[mode];
  }

  /**
   * Save the result of a level attempt.
   * @param {number} levelId 1 to 30 (Classic) or 1 to 20 (Minecraft)
   * @param {boolean} passed whether all words were completed before time ran out
   * @param {number} earnedStars 0 to 3
   * @param {string} mode "classic" | "minecraft"
   */
  saveLevelResult(levelId, passed, earnedStars, mode = this.getCurrentMode()) {
    const mState = this.getModeState(mode);
    const maxLevel = mode === "minecraft" ? 20 : 30;
    
    mState.lastPlayedLevel = levelId;

    if (passed) {
      mState.completedLevels[levelId] = true;

      // Update max stars - never decrease previously earned stars!
      const currentBest = mState.starsByLevel[levelId] || 0;
      mState.starsByLevel[levelId] = Math.max(currentBest, earnedStars);

      // Unlock next level if currently highest
      if (levelId < maxLevel && mState.highestUnlockedLevel <= levelId) {
        mState.highestUnlockedLevel = levelId + 1;
      }
    }

    this.save();
  }

  getHighestUnlockedLevel(mode = this.getCurrentMode()) {
    return this.getModeState(mode).highestUnlockedLevel;
  }

  getLastPlayedLevel(mode = this.getCurrentMode()) {
    return this.getModeState(mode).lastPlayedLevel;
  }

  getStars(levelId, mode = this.getCurrentMode()) {
    const state = this.getModeState(mode);
    return (state && state.starsByLevel) ? (state.starsByLevel[levelId] || 0) : 0;
  }

  isLevelCompleted(levelId, mode = this.getCurrentMode()) {
    const state = this.getModeState(mode);
    return (state && state.completedLevels) ? !!state.completedLevels[levelId] : false;
  }

  isLevelUnlocked(levelId, mode = this.getCurrentMode()) {
    const state = this.getModeState(mode);
    return (state && state.highestUnlockedLevel !== undefined) ? levelId <= state.highestUnlockedLevel : true;
  }

  getTotalStars(mode = this.getCurrentMode()) {
    if (mode === "endless") {
      const best = this.getEndlessHighScore();
      return best.words || 0;
    }
    if (mode === "all") {
      const classicStars = Object.values(this.getModeState("classic").starsByLevel || {}).reduce((s, v) => s + v, 0);
      const mcStars = Object.values(this.getModeState("minecraft").starsByLevel || {}).reduce((s, v) => s + v, 0);
      return classicStars + mcStars;
    }
    const modeState = this.getModeState(mode);
    if (!modeState || !modeState.starsByLevel) return 0;
    return Object.values(modeState.starsByLevel).reduce((sum, s) => sum + s, 0);
  }

  getMaxStars(mode = this.getCurrentMode()) {
    if (mode === "endless") return "Words";
    return mode === "minecraft" ? 60 : 90; // 20 * 3 or 30 * 3
  }

  getMaxLevels(mode = this.getCurrentMode()) {
    return mode === "minecraft" ? 20 : 30;
  }

  // --- Endless Mode Storage Methods ---
  getEndlessHighScore() {
    const eState = this.getModeState("endless");
    if (!eState.highScore) {
      eState.highScore = { words: 0, wpm: 0, maxStreak: 0, accuracy: 0, date: null };
    }
    return eState.highScore;
  }

  getAllEndlessHighScores() {
    const best = this.getEndlessHighScore();
    return { all: best };
  }

  /**
   * Save an Endless run result. Returns true if a new high score was set.
   * @param {Object|string} statsOrCategory
   * @param {Object} [optionalStats]
   * @returns {boolean} isNewRecord
   */
  saveEndlessResult(statsOrCategory, optionalStats) {
    const stats = (optionalStats && typeof optionalStats === "object") ? optionalStats : (statsOrCategory || {});
    const eState = this.getModeState("endless");
    if (!eState.highScore) {
      eState.highScore = { words: 0, wpm: 0, maxStreak: 0, accuracy: 0, date: null };
    }
    const prev = eState.highScore;
    const words = stats.words || 0;
    const wpm = stats.wpm || 0;

    // New record if completed more words, or same words with higher WPM
    const isNewRecord = words > prev.words || (words === prev.words && wpm > prev.wpm);
    if (isNewRecord) {
      eState.highScore = {
        words: Math.max(prev.words, words),
        wpm: Math.max(prev.wpm, wpm),
        maxStreak: Math.max(prev.maxStreak || 0, stats.maxStreak || 0),
        accuracy: stats.accuracy || 0,
        date: new Date().toISOString()
      };
      this.save();
    }
    return isNewRecord;
  }


  getSetting(key) {
    return this.state.settings[key];
  }

  setSetting(key, value) {
    this.state.settings[key] = value;
    this.save();
  }

  resetProgress(mode = null) {
    const preservedSettings = { ...this.state.settings };
    if (mode && this.state.modes[mode]) {
      this.state.modes[mode] = JSON.parse(JSON.stringify(DEFAULT_MODE_STATE));
    } else {
      this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
    this.state.settings = preservedSettings;
    this.save();
  }
}

export const storage = new StorageManager();

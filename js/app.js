// Typing Quest - Main Application Controller
// Glues Engine, UI, Storage, Audio, and Input Events together.
// Supports Light/Dark mode, Browser History navigation (Back/Forward), Pause (P/Enter), and Spacebar Skip Helper.
import { LEVELS, getLevel as getClassicLevel } from "./data/levels.js";
import { MINECRAFT_LEVELS, getMinecraftLevel } from "./data/minecraft_levels.js";
import { getRandomEndlessWord } from "./data/endless_words.js";
import { storage } from "./storage.js";
import { sound } from "./audio.js";
import { TypingEngine } from "./engine.js";
import { UIManager } from "./ui.js";

function getLevel(levelId, mode = storage.getCurrentMode()) {
  if (mode === "minecraft") {
    return getMinecraftLevel(levelId);
  }
  return getClassicLevel(levelId);
}

class App {
  constructor() {
    this.ui = new UIManager();
    this.currentLevelId = 1;
    this.lastWarnedSecond = -1;
    this.lastResult = null;
    this.currentMode = storage.getCurrentMode();
    this.ui.updateModeUI(this.currentMode);
    this.ui.updateMenuStats();

    this.engine = new TypingEngine({
      onTick: (remaining, elapsed, liveWpm) => this.handleTick(remaining, elapsed, liveWpm),
      onWordChanged: (targetWord, wordIdx, total) => this.handleWordChanged(targetWord, wordIdx, total),
      onInputFeedback: (feedback) => this.handleInputFeedback(feedback),
      onWordCompleted: (data) => this.handleWordCompleted(data),
      onWordSkipped: (data) => this.handleWordSkipped(data),
      onBonusTimeAwarded: (bonusSec) => this.handleBonusTime(bonusSec),
      onPauseStatusChange: (isPaused) => this.handlePauseStatusChange(isPaused),
      onLevelEnd: (result) => this.handleLevelEnd(result)
    });

    this.initEventListeners();
    this.ui.setLevelSelectCallback((lvlId) => this.navigateTo("play", lvlId));

    // Handle initial route (supports both ?screen=... query params and #screen hash routes)
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash.replace(/^#/, "");
    const hashParts = hash.split("?");
    const hashScreen = hashParts[0] || "";
    const hashParams = new URLSearchParams(hashParts[1] || "");

    const modeParam = urlParams.get("mode") || hashParams.get("mode");
    if (modeParam === "minecraft" || modeParam === "classic" || modeParam === "endless") {
      this.setGameMode(modeParam, false);
    }

    const themeParam = urlParams.get("theme") || hashParams.get("theme");
    if (themeParam === "light" || themeParam === "dark") {
      this.ui.applyTheme(themeParam);
    }

    const screenParam = urlParams.get("screen") || hashScreen || null;
    const levelParam = parseInt(urlParams.get("level") || hashParams.get("level"), 10);

    if (screenParam === "levels") {
      if (this.currentMode === "endless") {
        this.navigateTo("menu", null, false);
      } else {
        this.navigateTo("levels", null, false);
      }
    } else if (screenParam === "play") {
      if (this.currentMode === "endless") {
        this.startEndlessRun();
      } else if (levelParam) {
        this.navigateTo("play", levelParam, false);
      } else {
        this.navigateTo("menu", null, false);
      }
    } else if (screenParam === "settings") {
      this.navigateTo("settings", null, false);
    } else if (screenParam === "result") {
      if (this.currentMode === "endless") {
        this.ui.showResult({
          passed: true,
          isEndless: true,
          elapsedTime: 60.0,
          completedWords: 28,
          accuracy: 94,
          wpm: 48,
          maxStreak: 12,
          isNewRecord: true,
          highScore: { words: 28, wpm: 48, maxStreak: 12, accuracy: 94 }
        });
      } else {
        this.ui.showResult({
          passed: true,
          levelId: 1,
          stars: 3,
          elapsedTime: 32.4,
          timeLimit: 60,
          accuracy: 95,
          completedWords: 10,
          totalWords: 10,
          wpm: 52,
          maxStreak: 8
        });
      }
    } else {
      this.navigateTo("menu", null, false);
    }

    if (urlParams.get("pause") === "1") {
      setTimeout(() => this.handleTogglePause(), 400);
    }

    // Browser History popstate (browser back/forward arrow support)
    window.addEventListener("popstate", (e) => {
      this.handlePopState(e.state);
    });
  }

  setGameMode(mode, updateUrl = true) {
    if (mode !== "minecraft" && mode !== "classic" && mode !== "endless") return;
    storage.setCurrentMode(mode);
    this.currentMode = mode;
    this.ui.updateModeUI(mode);
    this.ui.updateHeaderStats();
    this.ui.updateMenuStats();
    if (this.ui.currentScreen === "levels") {
      if (mode === "endless") {
        this.navigateTo("menu", null, false);
      } else {
        this.ui.renderLevelsGrid();
      }
    }
    if (updateUrl && this.ui.currentScreen !== "play") {
      this.navigateTo(this.ui.currentScreen || "menu", null, false);
    }
  }

  /**
   * Router / History API navigation
   */
  navigateTo(screen, param = null, push = true) {
    if (this.engine.status === "PLAYING" || this.engine.status === "PAUSED") {
      if (screen !== "play" && screen !== "result") {
        this.engine.abort();
      }
    }

    const currentMode = storage.getCurrentMode();
    const maxLevels = storage.getMaxLevels(currentMode);

    if (currentMode === "endless" && (screen === "levels" || screen === "categories")) {
      screen = "menu";
    }

    if (screen === "levels") {
      this.ui.renderLevelsGrid();
    }

    // Route Guard: Block access to locked levels
    if (screen === "play") {
      if (currentMode === "endless") {
        this.startEndlessRun();
        return;
      }
      const targetLevel = parseInt(param, 10) || storage.getHighestUnlockedLevel(currentMode);
      if (targetLevel < 1 || targetLevel > maxLevels || !storage.isLevelUnlocked(targetLevel, currentMode)) {
        this.ui.showToast(`Level ${targetLevel} is locked! Complete previous levels first.`, "warning");
        this.navigateTo("levels", null, false);
        return;
      }
      param = targetLevel;
    }

    let url = "?screen=" + screen;
    if (currentMode === "minecraft") {
      url += "&mode=minecraft";
    } else if (currentMode === "endless") {
      url += "&mode=endless";
    }
    if (screen === "play" && param && currentMode !== "endless") {
      url += "&level=" + param;
    }

    const state = { screen, param, mode: currentMode };
    if (push) {
      try {
        history.pushState(state, "", url);
      } catch (e) {}
    } else {
      try {
        history.replaceState(state, "", url);
      } catch (e) {}
    }

    if (screen === "play") {
      if (currentMode === "endless") {
        this.startEndlessRun();
      } else {
        this.startLevel(param);
      }
    } else {
      this.ui.showScreen(screen);
    }
  }

  handlePopState(state) {
    if (this.engine.status === "PLAYING" || this.engine.status === "PAUSED") {
      this.engine.abort();
    }

    if (this.ui.isPauseModalOpen()) {
      this.ui.closePauseModal();
    }
    if (this.ui.modalLeave.classList.contains("active")) {
      this.ui.closeLeaveModal();
    }
    if (this.ui.modalReset.classList.contains("active")) {
      this.ui.closeResetModal();
    }

    if (state && state.mode && state.mode !== storage.getCurrentMode()) {
      this.setGameMode(state.mode, false);
    }

    const currentMode = storage.getCurrentMode();

    if (state && state.screen) {
      if (state.screen === "play") {
        if (currentMode === "endless") {
          this.startEndlessRun();
        } else if (state.param && storage.isLevelUnlocked(state.param, currentMode)) {
          this.startLevel(state.param);
        } else {
          this.navigateTo("levels", null, false);
        }
      } else if (state.screen === "levels" && currentMode === "endless") {
        this.navigateTo("menu", null, false);
      } else {
        this.ui.showScreen(state.screen);
      }
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const modeParam = urlParams.get("mode");
      if (modeParam && ["minecraft", "classic", "endless"].includes(modeParam)) {
        if (modeParam !== storage.getCurrentMode()) {
          this.setGameMode(modeParam, false);
        }
      }
      const screenParam = urlParams.get("screen") || "menu";
      const levelParam = parseInt(urlParams.get("level"), 10);
      if (screenParam === "play") {
        if (storage.getCurrentMode() === "endless") {
          this.startEndlessRun();
        } else if (levelParam && storage.isLevelUnlocked(levelParam, storage.getCurrentMode())) {
          this.startLevel(levelParam);
        } else {
          this.navigateTo("levels", null, false);
        }
      } else {
        this.navigateTo(screenParam, null, false);
      }
    }
  }

  initEventListeners() {
    // Mode Switcher actions
    if (this.ui.modeCardClassic) {
      this.ui.modeCardClassic.addEventListener("click", () => {
        this.setGameMode("classic");
      });
    }
    if (this.ui.modeCardMinecraft) {
      this.ui.modeCardMinecraft.addEventListener("click", () => {
        this.setGameMode("minecraft");
      });
    }
    if (this.ui.modeCardEndless) {
      this.ui.modeCardEndless.addEventListener("click", () => {
        this.setGameMode("endless");
      });
    }
    if (this.ui.headerModeIndicator) {
      this.ui.headerModeIndicator.addEventListener("click", () => {
        const current = storage.getCurrentMode();
        const nextMode = current === "classic" ? "minecraft" : current === "minecraft" ? "endless" : "classic";
        this.setGameMode(nextMode);
      });
    }
    if (this.ui.btnCategoriesBack) {
      this.ui.btnCategoriesBack.addEventListener("click", () => {
        this.navigateTo("menu");
      });
    }

    // Header actions
    document.getElementById("nav-brand").addEventListener("click", () => {
      this.engine.abort();
      this.ui.closePauseModal();
      this.ui.closeLeaveModal();
      this.navigateTo("menu");
    });

    document.getElementById("btn-sound-toggle").addEventListener("click", () => {
      sound.toggleMute();
      this.ui.updateHeaderStats();
    });

    this.ui.btnThemeToggle.addEventListener("click", () => {
      this.ui.toggleTheme();
    });

    document.getElementById("btn-header-settings").addEventListener("click", () => {
      this.engine.abort();
      this.ui.closePauseModal();
      this.ui.closeLeaveModal();
      this.navigateTo("settings");
    });

    // Main Menu actions
    this.ui.btnMenuStart.addEventListener("click", () => {
      sound.initContext();
      if (storage.getCurrentMode() === "endless") {
        this.startEndlessRun();
      } else {
        const nextLvl = storage.getHighestUnlockedLevel();
        this.navigateTo("play", nextLvl);
      }
    });

    this.ui.btnMenuLevels.addEventListener("click", () => {
      sound.initContext();
      if (storage.getCurrentMode() === "endless") {
        this.navigateTo("menu");
      } else {
        this.navigateTo("levels");
      }
    });

    this.ui.btnMenuSettings.addEventListener("click", () => {
      sound.initContext();
      this.navigateTo("settings");
    });

    // Level Select back
    document.getElementById("btn-levels-back").addEventListener("click", () => {
      this.navigateTo("menu");
    });

    // Pause button in game top bar
    this.ui.btnGamePause.addEventListener("click", () => {
      this.handleTogglePause();
    });

    // Skip Word helper button
    this.ui.btnSkipWord.addEventListener("click", () => {
      this.handleSkipWord();
    });

    // Touch/click target card or arena to auto-focus typing input (mobile ergonomics)
    const targetCard = document.getElementById("target-card");
    if (targetCard) {
      targetCard.addEventListener("click", () => {
        if (this.currentScreen === "play") this.ui.focusInput();
      });
    }
    const typingArena = document.getElementById("typing-arena");
    if (typingArena) {
      typingArena.addEventListener("click", (e) => {
        if (this.currentScreen === "play" && !e.target.closest("button")) {
          this.ui.focusInput();
        }
      });
    }

    // Pause Modal actions
    this.ui.btnPauseResume.addEventListener("click", () => {
      this.handleTogglePause();
    });

    this.ui.btnPauseRetry.addEventListener("click", () => {
      this.ui.closePauseModal();
      if (this.engine.isEndless) {
        this.startEndlessRun();
      } else {
        this.startLevel(this.currentLevelId);
      }
    });

    this.ui.btnPauseLevels.addEventListener("click", () => {
      this.ui.closePauseModal();
      this.handleRequestLeave();
    });

    // Typing Input Event
    this.ui.typingInput.addEventListener("input", (e) => {
      if (this.engine.status !== "PLAYING") return;

      // Filter out accidental spacebar characters
      if (e.target.value.includes(" ")) {
        e.target.value = e.target.value.replace(/\s+/g, "");
      }

      const val = e.target.value;
      if (!val) {
        this.engine.handleInput("");
        return;
      }

      const res = this.engine.handleInput(val);
      if (res.completed) {
        e.target.value = "";
      }

      if (res.isError) {
        sound.playError();
      } else if (!res.completed) {
        sound.playKeyStroke();
      }
    });

    // Refocus input if player clicks arena during gameplay
    document.getElementById("typing-arena").addEventListener("click", () => {
      if (this.engine.status === "PLAYING") {
        this.ui.typingInput.focus();
      }
    });

    // Leave Game button (prompts confirmation modal)
    this.ui.btnGameLeave.addEventListener("click", () => {
      this.handleRequestLeave();
    });

    // Leave Modal actions
    this.ui.btnLeaveCancel.addEventListener("click", () => {
      this.ui.closeLeaveModal();
      if (this._pausedByLeaveModal && this.engine.status === "PAUSED") {
        this.engine.resume();
        this._pausedByLeaveModal = false;
      }
      this.ui.focusInput();
    });

    this.ui.btnLeaveConfirm.addEventListener("click", () => {
      this.ui.closeLeaveModal();
      this._pausedByLeaveModal = false;
      if (this.engine.isEndless) {
        this.engine.endEndlessRun();
      } else {
        this.engine.abort();
        this.navigateTo("levels");
      }
    });

    // Result Screen actions
    this.ui.btnResultNext.addEventListener("click", () => {
      if (this.lastResult && this.lastResult.isEndless) {
        this.startEndlessRun();
        return;
      }
      const maxLevels = storage.getMaxLevels();
      if (this.currentLevelId < maxLevels) {
        this.navigateTo("play", this.currentLevelId + 1);
      } else {
        this.navigateTo("levels");
      }
    });

    this.ui.btnResultRetry.addEventListener("click", () => {
      if (this.lastResult && this.lastResult.isEndless) {
        this.startEndlessRun();
        return;
      }
      this.startLevel(this.currentLevelId);
    });

    this.ui.btnResultLevels.addEventListener("click", () => {
      if (this.lastResult && this.lastResult.isEndless) {
        this.navigateTo("menu");
        return;
      }
      this.navigateTo("levels");
    });

    this.ui.btnResultMenu.addEventListener("click", () => {
      this.navigateTo("menu");
    });

    // Settings actions
    this.ui.btnSettingsBack.addEventListener("click", () => {
      this.navigateTo("menu");
    });

    this.ui.btnSettingsTheme.addEventListener("click", () => {
      this.ui.toggleTheme();
    });

    this.ui.settingSoundToggle.addEventListener("change", (e) => {
      sound.setMuted(!e.target.checked);
      this.ui.updateHeaderStats();
    });

    this.ui.btnSettingsReset.addEventListener("click", () => {
      this.ui.openResetModal();
    });

    // Reset Modal actions
    this.ui.btnResetCancel.addEventListener("click", () => {
      this.ui.closeResetModal();
    });

    this.ui.btnResetConfirm.addEventListener("click", () => {
      this.ui.closeResetModal();
      storage.resetProgress();
      this.ui.updateHeaderStats();
      this.ui.updateMenuStats();
      this.navigateTo("menu");
    });

    // Global Keydown: Spacebar, Enter for Pause, ESC for Leave
    window.addEventListener("keydown", (e) => {
      // 1. Spacebar handling
      if (e.code === "Space" || e.key === " ") {
        // Prevent holding down spacebar autorepeat
        if (e.repeat) {
          e.preventDefault();
          return;
        }
        // Skip word helper
        if (this.engine.status === "PLAYING" && this.engine.canSkip()) {
          e.preventDefault();
          this.handleSkipWord();
          return;
        }
        // In gameplay, prevent spacebar from inserting spaces into the input
        if (this.engine.status === "PLAYING") {
          e.preventDefault();
          return;
        }
      }

      // 2. Enter for Pause / Resume (Enter only, so typing words with 'p' is never interrupted)
      if (e.key === "Enter") {
        if (this.engine.status === "PLAYING" || this.engine.status === "PAUSED") {
          e.preventDefault();
          this.handleTogglePause();
          return;
        }
      }

      // 3. Escape key to leave or close modals
      if (e.key === "Escape") {
        if (this.ui.isLeaveModalOpen()) {
          this.ui.closeLeaveModal();
          if (this._pausedByLeaveModal && this.engine.status === "PAUSED") {
            this.engine.resume();
            this._pausedByLeaveModal = false;
          }
          this.ui.focusInput();
        } else if (this.engine.status === "PAUSED" && this.ui.isPauseModalOpen()) {
          this.handleTogglePause(); // Unpause
        } else if (this.engine.status === "PLAYING") {
          this.handleRequestLeave();
        } else if (this.ui.modalReset.classList.contains("active")) {
          this.ui.closeResetModal();
        }
      }
    });
  }

  handleRequestLeave() {
    if (this.ui.currentScreen !== "play") return;

    this.ui.closePauseModal();

    if (this.engine.status === "PLAYING") {
      this._pausedByLeaveModal = true;
      this.engine.pause();
    } else {
      this._pausedByLeaveModal = false;
    }

    const modalTitle = document.getElementById("modal-leave-title");
    const modalText = document.getElementById("modal-leave-text");
    const confirmBtn = document.getElementById("btn-leave-confirm");

    if (this.engine.isEndless) {
      if (modalTitle) modalTitle.textContent = "End Endless Run?";
      if (modalText) modalText.textContent = "Are you sure you want to finish? Your survival score will be recorded.";
      if (confirmBtn) confirmBtn.textContent = "Finish Run";
    } else {
      if (modalTitle) modalTitle.textContent = "Leave this level?";
      if (modalText) modalText.textContent = "Your current level progress will not be saved as completed.";
      if (confirmBtn) confirmBtn.textContent = "Leave";
    }

    this.ui.openLeaveModal();
  }

  handleSkipWord() {
    if (!this.engine.canSkip()) return;
    const res = this.engine.skipCurrentWord();
    if (res.skipped) {
      sound.playSkip();
      this.ui.updateSkipButton(false);
      this.ui.animateWordSuccess();
      this.ui.typingInput.value = "";
      this.ui.typingInput.focus();
    }
  }

  handleTogglePause() {
    if (this.engine.status === "PLAYING") {
      this.engine.pause();
      sound.playPause();
      this.ui.openPauseModal();
    } else if (this.engine.status === "PAUSED") {
      this.engine.resume();
      sound.playPause();
      this.ui.closePauseModal();
    }
  }

  startLevel(levelId) {
    const currentMode = storage.getCurrentMode();
    const level = getLevel(levelId, currentMode);
    if (!level) {
      this.navigateTo("levels", null, false);
      return;
    }

    if (!storage.isLevelUnlocked(levelId, currentMode)) {
      this.ui.showToast(`Level ${levelId} is locked! Complete previous levels first.`, "warning");
      this.navigateTo("levels", null, false);
      return;
    }

    this.currentLevelId = levelId;
    this.lastWarnedSecond = -1;

    sound.initContext();
    this.ui.preparePlayScreen(level);
    this.engine.startLevel(level);
  }

  startEndlessRun() {
    if (storage.getCurrentMode() !== "endless") {
      this.setGameMode("endless", false);
    }

    // Initial words batch: 10 random words from unified pool
    const initialWords = [];
    let prev = "";
    for (let i = 0; i < 10; i++) {
      const w = getRandomEndlessWord(prev);
      initialWords.push(w);
      prev = w;
    }

    const mockLevel = {
      id: "endless",
      difficulty: "Survival",
      timeLimit: 60.0,
      words: initialWords
    };

    sound.initContext();
    this.ui.preparePlayScreen(mockLevel, { isEndless: true });
    this.engine.startLevel(mockLevel, {
      isEndless: true,
      wordGenerator: (p) => getRandomEndlessWord(p)
    });

    try {
      history.replaceState({ screen: "play", mode: "endless" }, "", "?screen=play&mode=endless");
    } catch (e) {}
  }

  handleBonusTime(bonusSec) {
    this.ui.flashBonusTime(bonusSec);
    sound.playWordSuccess();
  }

  handleTick(remainingTime, elapsedTime, liveWpm) {
    this.ui.updateTimer(remainingTime);
    this.ui.updateLiveMetrics(liveWpm || 0, this.engine.currentStreak || 0);

    // Audio warning ticks in the final 5 seconds
    const secFloor = Math.floor(remainingTime);
    if (secFloor <= 5 && secFloor > 0 && secFloor !== this.lastWarnedSecond) {
      this.lastWarnedSecond = secFloor;
      sound.playWarningTick();
    }
  }

  handleWordChanged(targetWord, wordIndex, totalWords) {
    this.ui.typingInput.value = "";
    this.ui.renderTargetWord(targetWord, "", false);
    this.ui.updateProgress(
      wordIndex,
      totalWords,
      this.engine.getLiveAccuracy(),
      this.engine.completedWords
    );
    this.ui.updateLiveMetrics(this.engine.getLiveWpm(), this.engine.currentStreak);
  }

  handleInputFeedback(feedback) {
    this.ui.renderTargetWord(feedback.targetWord, feedback.currentInput, feedback.isError);
    if (feedback.isError) {
      this.ui.updateLiveMetrics(feedback.liveWpm || 0, 0);
    }
  }

  handleWordCompleted(data) {
    this.ui.animateWordSuccess();
    this.ui.updateProgress(
      this.engine.currentWordIndex,
      data.totalWords,
      data.liveAccuracy,
      data.completedWords
    );
    this.ui.updateLiveMetrics(data.liveWpm, data.streak);
  }

  handleWordSkipped(data) {
    this.ui.updateProgress(
      this.engine.currentWordIndex,
      data.totalWords,
      data.liveAccuracy,
      data.completedWords
    );
    this.ui.updateLiveMetrics(data.liveWpm, 0);
  }

  handlePauseStatusChange(isPaused) {
    // Sync UI with engine state
    if (isPaused) {
      if (!this._pausedByLeaveModal) {
        this.ui.openPauseModal();
      }
    } else {
      this.ui.closePauseModal();
    }
  }

  handleLevelEnd(result) {
    this.lastResult = result;

    if (result.isEndless) {
      const isNewRecord = storage.saveEndlessResult({
        words: result.completedWords,
        wpm: result.wpm,
        maxStreak: result.maxStreak,
        accuracy: result.accuracy
      });
      result.isNewRecord = isNewRecord;
      result.highScore = storage.getEndlessHighScore();
      result.categoryName = "Endless";
    } else {
      // Save progress to LocalStorage
      storage.saveLevelResult(result.levelId, result.passed, result.stars);
    }

    // Update displays
    this.ui.updateHeaderStats();
    this.ui.updateMenuStats();
    this.ui.showResult(result);
  }
}

// Start application when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.typingApp = new App();
    window.app = window.typingApp;
  });
} else {
  window.typingApp = new App();
  window.app = window.typingApp;
}


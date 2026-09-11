// Typing Chicken - UI Manager
// Coordinates screen transitions, animations, DOM bindings, and visual feedback.

import { LEVELS } from "./data/levels.js";
import { storage } from "./storage.js";
import { sound } from "./audio.js";
import { ICONS } from "./icons.js";

export class UIManager {
  constructor() {
    this.currentScreen = "screen-menu";
    this.initDOMElements();
    const savedTheme = storage.getSetting("theme") || "dark";
    this.applyTheme(savedTheme);
  }

  initDOMElements() {
    // Screens
    this.screens = {
      menu: document.getElementById("screen-menu"),
      levels: document.getElementById("screen-levels"),
      play: document.getElementById("screen-play"),
      result: document.getElementById("screen-result"),
      settings: document.getElementById("screen-settings")
    };

    // Header elements
    this.headerStarsVal = document.getElementById("header-stars-val");
    this.headerStarsMax = document.getElementById("header-stars-max");
    this.headerModeIndicator = document.getElementById("header-mode-indicator");
    this.headerModeIcon = document.getElementById("header-mode-icon");
    this.headerModeText = document.getElementById("header-mode-text");
    this.soundIcon = document.getElementById("sound-icon");
    this.btnSoundToggle = document.getElementById("btn-sound-toggle");
    this.btnThemeToggle = document.getElementById("btn-theme-toggle");
    this.themeIcon = document.getElementById("theme-icon");

    // Menu elements
    this.modeCardClassic = document.getElementById("mode-card-classic");
    this.modeCardMinecraft = document.getElementById("mode-card-minecraft");
    this.modeCardEndless = document.getElementById("mode-card-endless");
    this.menuMainLogo = document.getElementById("menu-main-logo");
    this.menuTagline = document.getElementById("menu-tagline");
    this.btnMenuStart = document.getElementById("btn-menu-start");
    this.btnMenuStartText = document.getElementById("btn-menu-start-text");
    this.btnMenuLevels = document.getElementById("btn-menu-levels");
    this.btnMenuSettings = document.getElementById("btn-menu-settings");
    this.menuHighestLevel = document.getElementById("menu-highest-level");
    this.menuTotalStars = document.getElementById("menu-total-stars");

    // Levels grid container
    this.levelsContainer = document.getElementById("levels-container");
    this.levelsContainer.addEventListener("click", (e) => {
      const card = e.target.closest(".level-card");
      if (!card || card.classList.contains("locked")) return;
      const id = parseInt(card.getAttribute("data-level"), 10);
      if (id && this.onLevelSelectCallback) {
        this.onLevelSelectCallback(id);
      }
    });

    // Endless Categories grid
    this.categoriesGrid = document.getElementById("categories-grid");
    if (this.categoriesGrid) {
      this.categoriesGrid.addEventListener("click", (e) => {
        const card = e.target.closest(".category-card");
        if (!card) return;
        const catId = card.getAttribute("data-category");
        if (catId && this.onCategorySelectCallback) {
          this.onCategorySelectCallback(catId);
        }
      });
    }
    this.btnCategoriesBack = document.getElementById("btn-categories-back");

    // Play screen elements
    this.gameLevelLabel = document.getElementById("game-level-label");
    this.gameDiffBadge = document.getElementById("game-diff-badge");
    this.gameTimerVal = document.getElementById("game-timer-val");
    this.gameTimerContainer = document.getElementById("game-timer-container");
    this.timerBonusBadge = document.getElementById("timer-bonus-badge");
    this.gameProgressLabel = document.getElementById("game-progress-label");
    this.gameWordCounter = document.getElementById("game-word-counter");
    this.targetCard = document.getElementById("target-card");
    this.targetWordDisplay = document.getElementById("target-word-display");
    this.errorIndicator = document.getElementById("error-indicator");
    this.typingInput = document.getElementById("typing-input");
    this.gameLiveAccuracy = document.getElementById("game-live-accuracy");
    this.gameWordsMetric = document.getElementById("game-words-metric");
    this.gameLiveWpm = document.getElementById("game-live-wpm");
    this.gameLiveStreak = document.getElementById("game-live-streak");
    this.gameProgressFill = document.getElementById("game-progress-fill");
    this.btnGameLeave = document.getElementById("btn-game-leave");
    this.btnGameLeaveText = document.getElementById("btn-game-leave-text");
    this.btnGamePause = document.getElementById("btn-game-pause");
    this.btnSkipWord = document.getElementById("btn-skip-word");
    this.skipWordText = document.getElementById("skip-word-text");

    // Result screen elements
    this.resultStatusTag = document.getElementById("result-status-tag");
    this.resultLevelTitle = document.getElementById("result-level-title");
    this.resultStarsRow = document.getElementById("result-stars-row");
    this.starElements = [
      document.getElementById("star-1"),
      document.getElementById("star-2"),
      document.getElementById("star-3")
    ];
    this.resultTimeVal = document.getElementById("result-time-val");
    this.resultWpmVal = document.getElementById("result-wpm-val");
    this.resultAccuracyVal = document.getElementById("result-accuracy-val");
    this.resultStreakVal = document.getElementById("result-streak-val");
    this.resultWordsVal = document.getElementById("result-words-val");
    this.resultStatusVal = document.getElementById("result-status-val");
    this.resultHintBox = document.getElementById("result-hint-box");
    this.btnResultNext = document.getElementById("btn-result-next");
    this.btnResultRetry = document.getElementById("btn-result-retry");
    this.btnResultLevels = document.getElementById("btn-result-levels");
    this.btnResultMenu = document.getElementById("btn-result-menu");

    // Settings screen elements
    this.settingSoundToggle = document.getElementById("setting-sound-toggle");
    this.btnSettingsReset = document.getElementById("btn-settings-reset");
    this.btnSettingsBack = document.getElementById("btn-settings-back");
    this.btnSettingsTheme = document.getElementById("btn-settings-theme");
    this.settingsThemeIcon = document.getElementById("settings-theme-icon");
    this.settingsThemeText = document.getElementById("settings-theme-text");

    // Modals
    this.modalPause = document.getElementById("modal-pause");
    this.btnPauseResume = document.getElementById("btn-pause-resume");
    this.btnPauseRetry = document.getElementById("btn-pause-retry");
    this.btnPauseLevels = document.getElementById("btn-pause-levels");

    this.modalLeave = document.getElementById("modal-leave");
    this.btnLeaveCancel = document.getElementById("btn-leave-cancel");
    this.btnLeaveConfirm = document.getElementById("btn-leave-confirm");

    this.modalReset = document.getElementById("modal-reset");
    this.btnResetCancel = document.getElementById("btn-reset-cancel");
    this.btnResetConfirm = document.getElementById("btn-reset-confirm");

    // Star Guide in settings
    this.renderSettingsStarGuide();
  }

  renderSettingsStarGuide() {
    // Fill any dynamic icons in settings if needed
  }

  /**
   * Screen Navigation
   */
  showScreen(screenName) {
    Object.values(this.screens).forEach(screen => {
      if (screen) {
        screen.classList.remove("active");
        screen.style.display = "none";
      }
    });

    const targetScreen = this.screens[screenName];
    if (targetScreen) {
      targetScreen.classList.add("active");
      targetScreen.style.display = "";
    }

    this.currentScreen = screenName;
    this.updateHeaderStats();

    if (screenName === "menu") {
      this.updateMenuStats();
    } else if (screenName === "levels") {
      this.renderLevelsGrid();
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const isLight = theme === "light";
    if (this.themeIcon) {
      this.themeIcon.innerHTML = isLight ? ICONS.themeSun : ICONS.themeMoon;
    }
    if (this.settingsThemeIcon) {
      this.settingsThemeIcon.innerHTML = isLight ? ICONS.themeSun : ICONS.themeMoon;
    }
    if (this.settingsThemeText) {
      this.settingsThemeText.textContent = isLight ? "Light Mode" : "Dark Mode";
    }
    storage.setSetting("theme", theme);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const nextTheme = current === "light" ? "dark" : "light";
    this.applyTheme(nextTheme);
    return nextTheme;
  }

  updateHeaderStats() {
    const totalStars = storage.getTotalStars();
    this.headerStarsVal.textContent = totalStars;
    if (this.headerStarsMax) {
      this.headerStarsMax.textContent = `/ ${storage.getMaxStars()}`;
    }
    const isSoundOn = !sound.isMuted;
    this.soundIcon.innerHTML = isSoundOn ? ICONS.soundOn : ICONS.soundOff;
    this.settingSoundToggle.checked = isSoundOn;
  }

  updateMenuStats() {
    const currentMode = storage.getCurrentMode();
    if (currentMode === "endless") {
      const best = storage.getEndlessHighScore();
      this.menuHighestLevel.textContent = best.words > 0 ? `${best.words}` : "0";
      if (this.menuHighestLevel.nextElementSibling) {
        this.menuHighestLevel.nextElementSibling.textContent = "Best Words";
      }
      this.menuTotalStars.textContent = best.wpm > 0 ? `${best.wpm} WPM` : "0 WPM";
      if (this.menuTotalStars.nextElementSibling) {
        this.menuTotalStars.nextElementSibling.textContent = "Best Speed";
      }
      this.btnMenuStartText.textContent = "Start Endless Run";
      if (this.btnMenuLevels) this.btnMenuLevels.style.display = "none";
    } else {
      const highest = storage.getHighestUnlockedLevel();
      const totalStars = storage.getTotalStars();
      this.menuHighestLevel.textContent = highest;
      if (this.menuHighestLevel.nextElementSibling) {
        this.menuHighestLevel.nextElementSibling.textContent = "Unlocked Level";
      }
      this.menuTotalStars.textContent = totalStars;
      if (this.menuTotalStars.nextElementSibling) {
        this.menuTotalStars.nextElementSibling.textContent = "Stars Earned";
      }
      if (this.btnMenuLevels) this.btnMenuLevels.style.display = "inline-flex";
      if (highest > 1) {
        this.btnMenuStartText.textContent = `Continue (Level ${highest})`;
      } else {
        this.btnMenuStartText.textContent = "Start Game";
      }
    }
  }

  updateModeUI(mode) {
    const isMc = mode === "minecraft";
    const isEndless = mode === "endless";
    document.documentElement.setAttribute("data-game-mode", mode);

    if (this.headerModeIcon) {
      this.headerModeIcon.textContent = isEndless ? "♾️" : isMc ? "⛏️" : "🐔";
    }
    if (this.headerModeText) {
      this.headerModeText.textContent = isEndless ? "Endless" : isMc ? "Minecraft" : "Classic";
    }
    if (this.headerStarsMax) {
      if (isEndless) {
        this.headerStarsMax.textContent = "Words";
      } else {
        this.headerStarsMax.textContent = `/ ${storage.getMaxStars(mode)}`;
      }
    }
    if (this.modeCardClassic) this.modeCardClassic.classList.toggle("active", mode === "classic");
    if (this.modeCardMinecraft) this.modeCardMinecraft.classList.toggle("active", isMc);
    if (this.modeCardEndless) this.modeCardEndless.classList.toggle("active", isEndless);

    if (this.menuMainLogo) {
      this.menuMainLogo.src = isMc ? "assets/minecraft_banner.jpg" : "assets/typing_chicken.jpg";
      this.menuMainLogo.alt = isMc ? "Minecraft Edition" : "Typing Chicken";
    }
    if (this.menuTagline) {
      if (isEndless) {
        this.menuTagline.textContent = "Endless Typing Survival! Continuous random vocabulary across all topics. Type for your highest streak.";
      } else if (isMc) {
        this.menuTagline.textContent = "Mine, craft, and type! Master 20 levels of legendary Minecraft gear.";
      } else {
        this.menuTagline.textContent = "Cluck your way through 30 levels! Type fast, spell sharp.";
      }
    }
  }

  setCategorySelectCallback(callback) {
    this.onCategorySelectCallback = callback;
  }

  /**
   * Render Endless categories grid
   */
  renderCategoriesGrid(categories, highScores) {
    if (!this.categoriesGrid) return;
    this.categoriesGrid.innerHTML = "";

    Object.values(categories).forEach(cat => {
      const best = highScores[cat.id] || { words: 0, wpm: 0, maxStreak: 0 };
      const card = document.createElement("div");
      card.className = "category-card";
      card.setAttribute("data-category", cat.id);

      const bestText = best.words > 0 
        ? `${best.words} words • ${best.wpm} WPM`
        : "No runs yet";

      card.innerHTML = `
        <div>
          <div class="category-card-top">
            <span class="category-card-icon">${cat.icon}</span>
            <div class="category-card-titles">
              <span class="category-card-name">${cat.name}</span>
              <span class="category-card-th">${cat.nameTh}</span>
            </div>
          </div>
          <p class="category-card-desc">${cat.description}</p>
        </div>
        <div class="category-card-footer">
          <div class="category-highscore">
            <span>🏆</span>
            <span>${bestText}</span>
          </div>
          <div class="category-card-play-btn">
            <span>Play</span>
            ${ICONS.arrowRight}
          </div>
        </div>
      `;
      this.categoriesGrid.appendChild(card);
    });
  }

  /**
   * Visual +2s bonus time floating flash
   */
  flashBonusTime(bonusSec = 2.0) {
    if (!this.timerBonusBadge) return;
    this.timerBonusBadge.textContent = `+${bonusSec.toFixed(0)}s`;
    this.timerBonusBadge.classList.add("flash");
    setTimeout(() => {
      if (this.timerBonusBadge) {
        this.timerBonusBadge.classList.remove("flash");
      }
    }, 650);
  }

  /**
   * Render the level selection screen grouped by difficulty tier (Classic or Minecraft)
   */
  renderLevelsGrid() {
    this.levelsContainer.innerHTML = "";
    const isMc = storage.getCurrentMode() === "minecraft";

    const classicTiers = [
      { name: "Beginner", range: [1, 5], desc: "10 words • 3-6 letters" },
      { name: "Easy", range: [6, 10], desc: "12 words • 5-8 letters" },
      { name: "Intermediate", range: [11, 15], desc: "14 words • 7-11 letters" },
      { name: "Upper Intermediate", range: [16, 20], desc: "16 words • 8-12 letters" },
      { name: "Advanced", range: [21, 25], desc: "18 words • 10-14 letters" },
      { name: "Hard", range: [26, 30], desc: "20 words • 12-16 letters" }
    ];

    const minecraftTiers = [
      { name: "Beginner", range: [1, 4], desc: "10 words • Basic Tools & Resources" },
      { name: "Easy", range: [5, 8], desc: "12 words • Camp & Overworld Threats" },
      { name: "Intermediate", range: [9, 12], desc: "14 words • Mining & Redstone" },
      { name: "Advanced", range: [13, 16], desc: "16 words • The Nether & Alchemy" },
      { name: "Master", range: [17, 20], desc: "18 words • The End & Netherite" }
    ];

    const tiers = isMc ? minecraftTiers : classicTiers;

    tiers.forEach(tier => {
      const section = document.createElement("div");
      section.className = "tier-section";

      section.innerHTML = `
        <div class="tier-header">
          <div class="tier-title">
            <span>${tier.name}</span>
            <span class="tier-badge">Levels ${tier.range[0]}-${tier.range[1]}</span>
          </div>
          <div class="tier-badge">${tier.desc}</div>
        </div>
        <div class="levels-grid" id="tier-grid-${tier.name.replace(/\s+/g, '-')}"></div>
      `;

      this.levelsContainer.appendChild(section);

      const grid = section.querySelector(".levels-grid");

      for (let id = tier.range[0]; id <= tier.range[1]; id++) {
        const isUnlocked = storage.isLevelUnlocked(id);
        const isCompleted = storage.isLevelCompleted(id);
        const stars = storage.getStars(id);

        const card = document.createElement("div");
        card.className = "level-card";
        card.setAttribute("data-level", id);

        if (!isUnlocked) {
          card.classList.add("locked");
          card.innerHTML = `
            <div class="lvl-number">Level ${id}</div>
            <div class="lvl-stars"><span class="lvl-lock-icon">${ICONS.lock}</span></div>
            <span class="lvl-status-tag tag-locked">Locked</span>
          `;
        } else if (isCompleted) {
          card.classList.add("completed");
          const starsHtml = [1, 2, 3].map(s => 
            `<span class="lvl-star ${s <= stars ? 'star-filled' : 'star-empty'}">${s <= stars ? ICONS.starFilled : ICONS.starEmpty}</span>`
          ).join("");

          card.innerHTML = `
            <div class="lvl-number">Level ${id}</div>
            <div class="lvl-stars">${starsHtml}</div>
            <span class="lvl-status-tag tag-completed">Completed</span>
          `;
        } else {
          card.classList.add("available");
          const starsHtml = [1, 2, 3].map(() => 
            `<span class="lvl-star star-empty">${ICONS.starEmpty}</span>`
          ).join("");

          card.innerHTML = `
            <div class="lvl-number">Level ${id}</div>
            <div class="lvl-stars">${starsHtml}</div>
            <span class="lvl-status-tag tag-available">Available</span>
          `;
        }

        grid.appendChild(card);
      }
    });
  }

  setLevelSelectCallback(callback) {
    this.onLevelSelectCallback = callback;
  }

  /**
   * Initialize and prepare the Play Screen
   */
  preparePlayScreen(level, options = {}) {
    this._currentTargetWord = null;
    this._charSpans = [];
    this._lastTimerText = null;
    this._lastTimerState = null;

    const isEndless = Boolean(options.isEndless);
    const category = options.category || null;

    if (isEndless) {
      this.gameLevelLabel.textContent = "ENDLESS";
      this.gameDiffBadge.textContent = "RANDOM VOCAB";
      if (this.gameProgressLabel) this.gameProgressLabel.textContent = "WORDS";
      this.gameWordCounter.textContent = "0";
      this.gameWordsMetric.textContent = "0";
      if (this.btnGameLeaveText) this.btnGameLeaveText.textContent = "Finish";
    } else {
      this.gameLevelLabel.textContent = `LEVEL ${level.id}`;
      this.gameDiffBadge.textContent = level.difficulty;
      if (this.gameProgressLabel) this.gameProgressLabel.textContent = "PROGRESS";
      this.gameWordCounter.textContent = `1 / ${level.words.length}`;
      this.gameWordsMetric.textContent = `0 / ${level.words.length}`;
      if (this.btnGameLeaveText) this.btnGameLeaveText.textContent = "Leave";
    }

    this.gameTimerVal.textContent = `${(level.timeLimit || 60.0).toFixed(1)}s`;
    this.gameTimerContainer.className = "timer-container";
    this.gameLiveAccuracy.textContent = "--";
    this.gameLiveAccuracy.className = "metric-val";
    this.gameProgressFill.style.width = "0%";
    this.errorIndicator.classList.remove("visible");
    this.targetCard.className = "target-word-card";

    this.typingInput.value = "";
    this.typingInput.placeholder = "Type to start timer...";
    this.typingInput.disabled = false;
    this.typingInput.className = "typing-input";

    this.updateSkipButton(true);
    this.updateLiveMetrics(0, 0);
    if (this.modalPause) {
      this.modalPause.classList.remove("active");
    }

    this.showScreen("play");
    setTimeout(() => this.typingInput.focus(), 30);
  }

  focusInput() {
    if (this.typingInput && !this.typingInput.disabled) {
      this.typingInput.focus();
    }
  }

  updateSkipButton(isAvailable) {
    if (!this.btnSkipWord) return;
    if (isAvailable) {
      this.btnSkipWord.disabled = false;
      this.btnSkipWord.classList.remove("used");
      if (this.skipWordText) this.skipWordText.textContent = "Skip Word (1 Left)";
    } else {
      this.btnSkipWord.disabled = true;
      this.btnSkipWord.classList.add("used");
      if (this.skipWordText) this.skipWordText.textContent = "Skip Used";
    }
  }

  /**
   * Render target word character badges with high-performance span reuse (zero DOM recreation)
   */
  renderTargetWord(targetWord, typedText = "", isError = false) {
    // Only rebuild DOM spans when the word changes
    if (this._currentTargetWord !== targetWord) {
      this._currentTargetWord = targetWord;
      this.targetWordDisplay.innerHTML = "";
      this._charSpans = [];
      for (let i = 0; i < targetWord.length; i++) {
        const charSpan = document.createElement("span");
        charSpan.textContent = targetWord[i];
        charSpan.className = "char-badge char-remaining";
        this.targetWordDisplay.appendChild(charSpan);
        this._charSpans.push(charSpan);
      }
    }

    const normTarget = targetWord.toLowerCase();
    const normTyped = typedText.toLowerCase();

    // Find the first index where typed diverges from target
    let firstMismatch = -1;
    const minLen = Math.min(normTarget.length, normTyped.length);
    for (let i = 0; i < minLen; i++) {
      if (normTarget[i] !== normTyped[i]) {
        firstMismatch = i;
        break;
      }
    }
    if (firstMismatch === -1 && normTyped.length > normTarget.length) {
      firstMismatch = normTarget.length;
    }

    // High performance className updates on existing spans
    for (let i = 0; i < this._charSpans.length; i++) {
      let cls = "char-badge ";
      if (firstMismatch === -1) {
        if (i < normTyped.length) {
          cls += "char-matched";
        } else if (i === normTyped.length) {
          cls += "char-current";
        } else {
          cls += "char-remaining";
        }
      } else {
        if (i < firstMismatch) {
          cls += "char-matched";
        } else if (i === firstMismatch) {
          cls += "char-wrong";
        } else {
          cls += "char-remaining";
        }
      }
      if (this._charSpans[i].className !== cls) {
        this._charSpans[i].className = cls;
      }
    }

    // Toggle error indicator
    if (isError) {
      this.errorIndicator.classList.add("visible");
      this.targetCard.classList.add("shake-error");
      this.typingInput.classList.add("input-error");
      if (this._errorTimer) clearTimeout(this._errorTimer);
      this._errorTimer = setTimeout(() => {
        this.targetCard.classList.remove("shake-error");
      }, 300);
    } else {
      this.errorIndicator.classList.remove("visible");
      this.typingInput.classList.remove("input-error");
    }
  }

  /**
   * Trigger word completed animation
   */
  animateWordSuccess() {
    this.targetCard.classList.add("word-complete-anim");
    sound.playWordSuccess();
    setTimeout(() => {
      this.targetCard.classList.remove("word-complete-anim");
    }, 250);
  }

  /**
   * Update live timer UI with throttled DOM writes
   */
  updateTimer(remainingSeconds) {
    const safeSec = Math.max(0, remainingSeconds);
    const text = `${safeSec.toFixed(1)}s`;
    if (this._lastTimerText !== text) {
      this._lastTimerText = text;
      this.gameTimerVal.textContent = text;
    }

    const state = safeSec <= 10 ? "danger" : safeSec <= 20 ? "warning" : "normal";
    if (this._lastTimerState !== state) {
      this._lastTimerState = state;
      if (state === "danger") {
        this.gameTimerContainer.className = "timer-container danger";
      } else if (state === "warning") {
        this.gameTimerContainer.className = "timer-container warning";
      } else {
        this.gameTimerContainer.className = "timer-container";
      }
    }
  }

  /**
   * Update real-time word counter and metrics
   */
  updateProgress(currentIdx, totalWords, firstTryAccuracy, completedWords) {
    if (totalWords === null || totalWords === undefined) {
      const wordsCount = completedWords !== undefined ? completedWords : currentIdx;
      this.gameWordCounter.textContent = `${wordsCount}`;
      this.gameWordsMetric.textContent = `${wordsCount}`;
      this.gameProgressFill.style.width = "100%";
    } else {
      const humanCurrent = Math.min(currentIdx + 1, totalWords);
      this.gameWordCounter.textContent = `${humanCurrent} / ${totalWords}`;
      this.gameWordsMetric.textContent = `${currentIdx} / ${totalWords}`;
      const pct = totalWords > 0 ? (currentIdx / totalWords) * 100 : 0;
      this.gameProgressFill.style.width = `${pct}%`;
    }

    if (firstTryAccuracy !== null && !isNaN(firstTryAccuracy)) {
      this.gameLiveAccuracy.textContent = `${firstTryAccuracy}%`;
      if (firstTryAccuracy >= 80) {
        this.gameLiveAccuracy.className = "metric-val high";
      } else if (firstTryAccuracy >= 60) {
        this.gameLiveAccuracy.className = "metric-val mid";
      } else {
        this.gameLiveAccuracy.className = "metric-val low";
      }
    } else {
      this.gameLiveAccuracy.textContent = "--";
      this.gameLiveAccuracy.className = "metric-val";
    }
  }

  /**
   * Update live WPM and typing streak
   */
  updateLiveMetrics(wpm = 0, streak = 0) {
    if (this.gameLiveWpm) {
      this.gameLiveWpm.textContent = `${wpm} WPM`;
    }
    if (this.gameLiveStreak) {
      this.gameLiveStreak.textContent = `${streak}x`;
      if (streak >= 3) {
        this.gameLiveStreak.className = "metric-val streak-pill on-fire";
      } else {
        this.gameLiveStreak.className = "metric-val streak-pill";
      }
    }
  }

  /**
   * Render final result dialog with star animations
   */
  showResult(result) {
    this.typingInput.disabled = true;

    if (result.isEndless) {
      this.resultStarsRow.style.display = "none";
      this.resultLevelTitle.textContent = "ENDLESS SURVIVAL";
      this.resultTimeVal.textContent = `${result.elapsedTime.toFixed(1)}s survived`;
      if (this.resultWpmVal) {
        this.resultWpmVal.textContent = `${result.wpm || 0} WPM`;
      }
      this.resultAccuracyVal.textContent = `${result.accuracy}%`;
      if (this.resultStreakVal) {
        this.resultStreakVal.textContent = `${result.maxStreak || 0}x`;
      }
      if (this.resultWordsVal) {
        this.resultWordsVal.textContent = `${result.completedWords} words`;
      }

      if (result.isNewRecord) {
        this.resultStatusTag.textContent = "NEW HIGH SCORE! 🏆";
        this.resultStatusTag.className = "result-status-tag pass";
        if (this.resultStatusVal) {
          this.resultStatusVal.innerHTML = `<span class="status-icon-inline">${ICONS.trophy}</span> <span>RECORD!</span>`;
          this.resultStatusVal.style.color = "#fbbf24";
        }
        this.resultHintBox.innerHTML = `<div class="hint-content">${ICONS.trophy} <span>Outstanding! You set a brand new Endless High Score!</span></div>`;
        this.resultHintBox.style.color = "var(--star-gold)";
      } else {
        this.resultStatusTag.textContent = "RUN FINISHED";
        this.resultStatusTag.className = "result-status-tag pass";
        if (this.resultStatusVal) {
          this.resultStatusVal.innerHTML = `<span class="status-icon-inline">${ICONS.check}</span> <span>FINISHED</span>`;
          this.resultStatusVal.style.color = "var(--success)";
        }
        const bestWords = (result.highScore && result.highScore.words) || result.completedWords;
        this.resultHintBox.innerHTML = `<div class="hint-content">${ICONS.alert} <span>Great survival run! Best score: ${bestWords} words. Keep practicing to beat it!</span></div>`;
        this.resultHintBox.style.color = "var(--text-muted)";
      }
      sound.playLevelComplete();

      this.btnResultNext.style.display = "flex";
      this.btnResultNext.innerHTML = `<span>Play Again</span> ${ICONS.arrowRight}`;
      this.btnResultLevels.style.display = "none";

      this.showScreen("result");
      return;
    }

    // Classic / Minecraft Level Result
    this.btnResultLevels.style.display = "inline-flex";
    this.resultStarsRow.style.display = "flex";
    this.resultLevelTitle.textContent = `LEVEL ${result.levelId}`;
    this.resultTimeVal.textContent = `${result.elapsedTime.toFixed(1)}s / ${result.timeLimit}s`;
    if (this.resultWpmVal) {
      this.resultWpmVal.textContent = `${result.wpm || 0} WPM`;
    }
    this.resultAccuracyVal.textContent = `${result.accuracy}%`;
    if (this.resultStreakVal) {
      this.resultStreakVal.textContent = `${result.maxStreak || 0}x`;
    }
    if (this.resultWordsVal) {
      this.resultWordsVal.textContent = `${result.completedWords} / ${result.totalWords}`;
    }

    if (result.passed) {
      this.resultStatusTag.textContent = "COMPLETED!";
      this.resultStatusTag.className = "result-status-tag pass";
      if (this.resultStatusVal) {
        this.resultStatusVal.innerHTML = `<span class="status-icon-inline">${ICONS.check}</span> <span>PASSED</span>`;
        this.resultStatusVal.style.color = "var(--success)";
      }
      sound.playLevelComplete();
    } else {
      this.resultStatusTag.textContent = "TIME'S UP!";
      this.resultStatusTag.className = "result-status-tag fail";
      if (this.resultStatusVal) {
        this.resultStatusVal.innerHTML = `<span class="status-icon-inline">${ICONS.cross}</span> <span>FAILED</span>`;
        this.resultStatusVal.style.color = "var(--error)";
      }
      sound.playLevelFailed();
    }

    // Reset stars visuals with empty big stars
    this.starElements.forEach(el => {
      el.className = "result-star";
      el.innerHTML = ICONS.starBigEmpty;
    });

    // Pop stars sequentially
    for (let i = 0; i < result.stars; i++) {
      setTimeout(() => {
        if (this.starElements[i]) {
          this.starElements[i].classList.add("earned");
          this.starElements[i].innerHTML = ICONS.starBigFilled;
          sound.playStar(i);
        }
      }, (i + 1) * 350);
    }

    // Configure next level button
    const maxLevels = storage.getMaxLevels();
    if (result.passed) {
      if (result.levelId < maxLevels) {
        this.btnResultNext.style.display = "flex";
        this.btnResultNext.innerHTML = `<span>Next Level (Level ${result.levelId + 1})</span> ${ICONS.arrowRight}`;
      } else {
        this.btnResultNext.style.display = "flex";
        this.btnResultNext.innerHTML = `${ICONS.trophy} <span>All Levels Completed! View Levels</span>`;
      }
    } else {
      this.btnResultNext.style.display = "none";
    }

    this.btnResultLevels.innerHTML = `<svg class="icon-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> <span>Levels</span>`;

    // Star hint guidance
    if (result.stars === 3) {
      this.resultHintBox.innerHTML = `<div class="hint-content">${ICONS.trophy} <span>Outstanding! You mastered this level with a 3-Star perfect run!</span></div>`;
      this.resultHintBox.style.color = "var(--star-gold)";
    } else if (result.stars === 2) {
      this.resultHintBox.innerHTML = `<div class="hint-content">${ICONS.alert} <span>Great job! To get 3 Stars, complete all words within 48 seconds while keeping accuracy ≥ 80%.</span></div>`;
      this.resultHintBox.style.color = "var(--text-muted)";
    } else if (result.stars === 1) {
      this.resultHintBox.innerHTML = `<div class="hint-content">${ICONS.alert} <span>Good attempt! To earn 2 or 3 Stars, raise your first-try typing accuracy to at least 80%.</span></div>`;
      this.resultHintBox.style.color = "var(--text-muted)";
    } else if (result.passed) {
      this.resultHintBox.innerHTML = `<div class="hint-content">${ICONS.alert} <span>Level passed! However, you need at least 60% first-try accuracy to earn stars.</span></div>`;
      this.resultHintBox.style.color = "var(--warning)";
    } else {
      this.resultHintBox.innerHTML = `<div class="hint-content">${ICONS.alert} <span>Time expired! Complete all words before the 60-second timer hits zero.</span></div>`;
      this.resultHintBox.style.color = "var(--error)";
    }

    this.showScreen("result");
  }

  // Modals
  openPauseModal() {
    this.modalPause.classList.add("active");
    this.typingInput.disabled = true;
  }

  closePauseModal() {
    this.modalPause.classList.remove("active");
    this.typingInput.disabled = false;
    this.typingInput.focus();
  }

  isPauseModalOpen() {
    return this.modalPause && this.modalPause.classList.contains("active");
  }

  openLeaveModal() {
    this.modalLeave.classList.add("active");
    if (this.typingInput) this.typingInput.disabled = true;
  }

  closeLeaveModal() {
    this.modalLeave.classList.remove("active");
    if (this.typingInput) this.typingInput.disabled = false;
  }

  isLeaveModalOpen() {
    return this.modalLeave && this.modalLeave.classList.contains("active");
  }

  openResetModal() {
    this.modalReset.classList.add("active");
  }

  closeResetModal() {
    this.modalReset.classList.remove("active");
  }

  /**
   * Floating toast notification for warnings and route guards
   */
  showToast(message, type = "warning", duration = 3500) {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    const icon = type === "warning" ? ICONS.lock : ICONS.alert;
    toast.innerHTML = `
      ${icon}
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast-hiding");
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }
}

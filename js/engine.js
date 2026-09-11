// Typing Quest - Core Game Engine
// Handles timer, input validation, backspace logic, first-try accuracy tracking, and star scoring.

export class TypingEngine {
  constructor(callbacks = {}) {
    this.callbacks = {
      onTick: () => {},
      onWordChanged: () => {},
      onInputFeedback: () => {},
      onWordCompleted: () => {},
      onWordSkipped: () => {},
      onBonusTimeAwarded: () => {},
      onPauseStatusChange: () => {},
      onLevelEnd: () => {},
      ...callbacks
    };

    this.reset();
  }

  reset() {
    this.level = null;
    this.isEndless = false;
    this.endlessCategory = null;
    this.wordGenerator = null;
    this.bonusTime = 0;
    this.currentWordIndex = 0;
    this.currentWordHadError = false;
    this.completedWords = 0;
    this.completedCharacters = 0;
    this.firstTryCorrectWords = 0;
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.skipAvailable = true;
    this.timerStarted = false;
    this.startTime = null;
    this.pauseTime = null;
    this.elapsedTime = 0;
    this.remainingTime = 60.0;
    this.status = "IDLE"; // "IDLE" | "PLAYING" | "PAUSED" | "LEVEL_COMPLETE" | "LEVEL_FAILED"
    this.isFinalized = false;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Start playing a level
   * @param {Object} level Level object { id, difficulty, timeLimit, words }
   * @param {Object} [options] Optional configuration e.g. { isEndless, endlessCategory, wordGenerator }
   */
  startLevel(level, options = {}) {
    this.reset();
    this.level = level;
    this.isEndless = Boolean(options.isEndless);
    this.endlessCategory = options.endlessCategory || null;
    this.wordGenerator = options.wordGenerator || null;
    this.bonusTime = 0;
    this.remainingTime = level.timeLimit || 60.0;
    this.status = "PLAYING";
    this.timerStarted = false;
    this.startTime = null;
    this.isFinalized = false;
    this.skipAvailable = true;

    // Notify initial word
    this.callbacks.onWordChanged(this.getCurrentWord(), this.currentWordIndex, this.isEndless ? null : this.level.words.length);
    this.callbacks.onTick(this.remainingTime, this.elapsedTime, 0);

    // Note: Timer loop is NOT started here; it starts on the first character typed!
    this.tick = this.tick.bind(this);
  }

  /**
   * Start countdown timer upon player's first action (typing or skip)
   */
  startTimerIfNeeded() {
    if (!this.timerStarted && this.status === "PLAYING" && !this.isFinalized) {
      this.timerStarted = true;
      this.startTime = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
      if (!this.rafId && typeof requestAnimationFrame !== "undefined") {
        this.rafId = requestAnimationFrame(this.tick);
      }
    }
  }

  getCurrentWord() {
    if (!this.level || this.currentWordIndex >= this.level.words.length) {
      return "";
    }
    return this.level.words[this.currentWordIndex];
  }

  getTotalWords() {
    return this.level ? this.level.words.length : 0;
  }

  /**
   * Animation frame loop for precise countdown
   */
  tick() {
    if (this.status !== "PLAYING" || this.isFinalized) return;

    const now = performance.now();
    this.elapsedTime = Math.max(0, (now - this.startTime) / 1000);
    if (this.isEndless) {
      this.remainingTime = Math.max(0, Math.min(60.0, (this.level.timeLimit + this.bonusTime) - this.elapsedTime));
    } else {
      this.remainingTime = Math.max(0, this.level.timeLimit - this.elapsedTime);
    }

    this.callbacks.onTick(this.remainingTime, this.elapsedTime, this.getLiveWpm());

    if (this.remainingTime <= 0) {
      this.remainingTime = 0;
      this.finalizeLevel(this.isEndless ? (this.completedWords > 0) : false);
      return;
    }

    this.rafId = requestAnimationFrame(this.tick);
  }

  /**
   * Process typing input
   * @param {string} rawInput 
   */
  handleInput(rawInput) {
    if (this.status !== "PLAYING" || this.isFinalized) return { valid: false };

    const targetWord = this.getCurrentWord();
    if (!targetWord || targetWord.trim().length === 0) {
      return { isError: false, completed: false };
    }

    // Guard against empty input or whitespace: never count as match or completion
    if (rawInput === undefined || rawInput === null || rawInput.trim().length === 0) {
      this.callbacks.onInputFeedback({
        isMatch: true,
        isError: false,
        currentInput: "",
        targetWord: targetWord,
        typedPrefixLength: 0,
        streak: this.currentStreak,
        liveWpm: this.getLiveWpm()
      });
      return { isError: false, completed: false };
    }

    // Start timer on the first character typed
    if (!this.timerStarted) {
      this.startTimerIfNeeded();
    }

    if (this.timerStarted && this.startTime && typeof performance !== "undefined") {
      const now = performance.now();
      this.elapsedTime = Math.max(0, (now - this.startTime) / 1000);
      if (this.isEndless) {
        this.remainingTime = Math.max(0, Math.min(60.0, (this.level.timeLimit + this.bonusTime) - this.elapsedTime));
      } else {
        this.remainingTime = Math.max(0, this.level.timeLimit - this.elapsedTime);
      }

      if (this.remainingTime <= 0) {
        this.remainingTime = 0;
        this.finalizeLevel(this.isEndless ? (this.completedWords > 0) : false);
        return { isError: false, completed: false, levelFinished: true };
      }
    }

    const normalizedInput = rawInput.toLowerCase();
    const normalizedTarget = targetWord.toLowerCase();

    // Check if current input matches the prefix of target
    const isPrefix = normalizedTarget.startsWith(normalizedInput);

    if (!isPrefix) {
      // Diverged from target word: player made an error!
      this.currentWordHadError = true;
      this.currentStreak = 0;
      this.callbacks.onInputFeedback({
        isMatch: false,
        isError: true,
        currentInput: rawInput,
        targetWord: targetWord,
        typedPrefixLength: 0,
        streak: 0,
        liveWpm: this.getLiveWpm()
      });
      return { isError: true, completed: false };
    }

    // Input is a valid prefix
    if (normalizedInput === normalizedTarget) {
      // Word successfully completed!
      this.completedWords++;
      this.completedCharacters += targetWord.length;
      const isFirstTry = !this.currentWordHadError;
      if (isFirstTry) {
        this.firstTryCorrectWords++;
        this.currentStreak++;
        if (this.currentStreak > this.maxStreak) {
          this.maxStreak = this.currentStreak;
        }
      } else {
        this.currentStreak = 0;
      }

      const totalWords = this.isEndless ? null : this.level.words.length;
      const liveAccuracy = this.getLiveAccuracy();
      const liveWpm = this.getLiveWpm();

      if (this.isEndless) {
        // Endless survival bonus time: +2.0s (capped at 60s)
        const bonusAmount = 2.0;
        this.bonusTime += bonusAmount;
        const potentialRemaining = (this.level.timeLimit + this.bonusTime) - this.elapsedTime;
        if (potentialRemaining > 60.0) {
          this.bonusTime = 60.0 + this.elapsedTime - this.level.timeLimit;
        }
        this.remainingTime = Math.max(0, Math.min(60.0, (this.level.timeLimit + this.bonusTime) - this.elapsedTime));
        
        try {
          this.callbacks.onBonusTimeAwarded(bonusAmount, this.remainingTime);
        } catch (e) {
          console.error("onBonusTimeAwarded error:", e);
        }

        // Recharge skip helper if used every 5 completed words
        if (!this.skipAvailable && this.completedWords % 5 === 0) {
          this.skipAvailable = true;
        }

        // Push next dynamic word
        const nextWord = this.wordGenerator ? this.wordGenerator(targetWord) : "endless";
        this.level.words.push(nextWord);

        this.currentWordIndex++;
        this.currentWordHadError = false;

        try {
          this.callbacks.onWordCompleted({
            word: targetWord,
            isFirstTry: isFirstTry,
            completedWords: this.completedWords,
            totalWords: null,
            liveAccuracy: liveAccuracy,
            liveWpm: liveWpm,
            streak: this.currentStreak,
            maxStreak: this.maxStreak,
            isEndless: true
          });
        } catch (e) {
          console.error("onWordCompleted error:", e);
        }

        try {
          this.callbacks.onWordChanged(this.getCurrentWord(), this.currentWordIndex, null);
        } catch (e) {
          console.error("onWordChanged error:", e);
        }

        return { isError: false, completed: true, levelFinished: false };
      }

      this.callbacks.onWordCompleted({
        word: targetWord,
        isFirstTry: isFirstTry,
        completedWords: this.completedWords,
        totalWords: totalWords,
        liveAccuracy: liveAccuracy,
        liveWpm: liveWpm,
        streak: this.currentStreak,
        maxStreak: this.maxStreak
      });

      // Advance to next word
      this.currentWordIndex++;
      this.currentWordHadError = false;

      if (this.currentWordIndex >= totalWords) {
        // All words completed before time ran out! Pass!
        this.finalizeLevel(true);
        return { isError: false, completed: true, levelFinished: true };
      } else {
        this.callbacks.onWordChanged(this.getCurrentWord(), this.currentWordIndex, totalWords);
        return { isError: false, completed: true, levelFinished: false };
      }
    }

    // Valid partial prefix (in progress)
    this.callbacks.onInputFeedback({
      isMatch: true,
      isError: false,
      currentInput: rawInput,
      targetWord: targetWord,
      typedPrefixLength: rawInput.length,
      streak: this.currentStreak,
      liveWpm: this.getLiveWpm()
    });

    return { isError: false, completed: false };
  }

  /**
   * Check if word skip helper is available
   */
  canSkip() {
    return this.status === "PLAYING" && this.skipAvailable && !this.isFinalized;
  }

  /**
   * Skip current target word
   */
  skipCurrentWord() {
    if (!this.canSkip()) return { skipped: false };

    // Start timer if skipping on first word before typing
    this.startTimerIfNeeded();

    if (this.timerStarted && this.startTime && typeof performance !== "undefined") {
      const now = performance.now();
      this.elapsedTime = Math.max(0, (now - this.startTime) / 1000);
      if (this.isEndless) {
        this.remainingTime = Math.max(0, Math.min(60.0, (this.level.timeLimit + this.bonusTime) - this.elapsedTime));
      } else {
        this.remainingTime = Math.max(0, this.level.timeLimit - this.elapsedTime);
      }
    }

    this.skipAvailable = false;
    this.currentStreak = 0;
    const targetWord = this.getCurrentWord();
    this.completedWords++;

    if (this.isEndless) {
      const liveAccuracy = this.getLiveAccuracy();
      this.callbacks.onWordSkipped({
        word: targetWord,
        completedWords: this.completedWords,
        totalWords: null,
        liveAccuracy: liveAccuracy,
        liveWpm: this.getLiveWpm(),
        streak: 0,
        isEndless: true
      });

      const nextWord = this.wordGenerator ? this.wordGenerator(targetWord) : "endless";
      this.level.words.push(nextWord);

      this.currentWordIndex++;
      this.currentWordHadError = false;
      this.callbacks.onWordChanged(this.getCurrentWord(), this.currentWordIndex, null);
      return { skipped: true, levelFinished: false };
    }

    const totalWords = this.level.words.length;
    const liveAccuracy = this.getLiveAccuracy();

    this.callbacks.onWordSkipped({
      word: targetWord,
      completedWords: this.completedWords,
      totalWords: totalWords,
      liveAccuracy: liveAccuracy,
      liveWpm: this.getLiveWpm(),
      streak: 0
    });

    this.currentWordIndex++;
    this.currentWordHadError = false;

    if (this.currentWordIndex >= totalWords) {
      this.finalizeLevel(true);
      return { skipped: true, levelFinished: true };
    } else {
      this.callbacks.onWordChanged(this.getCurrentWord(), this.currentWordIndex, totalWords);
      return { skipped: true, levelFinished: false };
    }
  }

  /**
   * Pause gameplay and freeze countdown
   */
  pause() {
    if (this.status !== "PLAYING" || this.isFinalized) return false;
    this.status = "PAUSED";
    this.pauseTime = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.callbacks.onPauseStatusChange(true);
    return true;
  }

  /**
   * Resume gameplay and unfreeze countdown
   */
  resume() {
    if (this.status !== "PAUSED" || this.isFinalized) return false;
    if (this.timerStarted && this.startTime) {
      const now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
      const pauseDuration = now - this.pauseTime;
      this.startTime += pauseDuration;
      if (!this.rafId && typeof requestAnimationFrame !== "undefined") {
        this.rafId = requestAnimationFrame(this.tick);
      }
    }
    this.status = "PLAYING";
    this.callbacks.onPauseStatusChange(false);
    return true;
  }

  /**
   * Toggle between paused and playing states
   */
  togglePause() {
    if (this.status === "PLAYING") return this.pause();
    if (this.status === "PAUSED") return this.resume();
    return false;
  }

  /**
   * Calculate real-time accuracy during gameplay:
   * Returns null if no words have been completed yet (display as "--")
   * Otherwise returns percentage integer (0-100) based on completed words
   */
  getLiveAccuracy() {
    if (this.completedWords === 0) return null;
    return Math.round((this.firstTryCorrectWords / this.completedWords) * 100);
  }

  /**
   * Calculate typing speed in Words Per Minute (WPM)
   * Standard metric: (completedCharacters / 5) / (elapsedSeconds / 60)
   */
  getLiveWpm() {
    if (!this.timerStarted || this.elapsedTime <= 0 || this.completedCharacters === 0) {
      return 0;
    }
    const minutes = this.elapsedTime / 60;
    const words = this.completedCharacters / 5;
    return Math.round(words / minutes);
  }

  getFinalWpm() {
    return this.getLiveWpm();
  }

  /**
   * Calculate final accuracy of the level:
   * (firstTryCorrect / totalWords) * 100
   */
  getFinalAccuracy() {
    if (this.isEndless) {
      if (this.completedWords === 0) return 0;
      return Math.round((this.firstTryCorrectWords / this.completedWords) * 100);
    }
    const total = this.getTotalWords();
    if (total === 0) return 0;
    return Math.round((this.firstTryCorrectWords / total) * 100);
  }

  /**
   * Calculate star rating according to exact requirements:
   * Passed = all words completed before time limit (60s).
   * If not passed: 0 stars (Failed)
   * If passed:
   *   Accuracy < 60%: 0 stars
   *   Accuracy >= 60% and < 80%: 1 star
   *   Accuracy >= 80% and time > 48s: 2 stars
   *   Accuracy >= 80% and time <= 48s: 3 stars
   */
  static calculateStars(passed, accuracy, elapsedTime, timeLimit = 60) {
    if (!passed) return 0;
    if (accuracy < 60) return 0;
    if (accuracy < 80) return 1;
    // Accuracy >= 80% (3 stars if within 80% of time limit, e.g. <= 48s for 60s)
    const threeStarThreshold = timeLimit ? (timeLimit * 0.8) : 48.0;
    if (elapsedTime <= threeStarThreshold) return 3;
    return 2;
  }

  /**
   * Finalize the level (preventing race conditions)
   */
  finalizeLevel(passed) {
    if (this.isFinalized) return;
    this.isFinalized = true;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.status = passed ? "LEVEL_COMPLETE" : "LEVEL_FAILED";

    const totalWords = this.isEndless ? this.completedWords : this.getTotalWords();
    const finalAccuracy = this.getFinalAccuracy();
    const finalElapsed = this.isEndless ? parseFloat(this.elapsedTime.toFixed(1)) : Math.min(this.level.timeLimit, parseFloat(this.elapsedTime.toFixed(2)));
    const stars = this.isEndless ? 0 : TypingEngine.calculateStars(passed, finalAccuracy, finalElapsed, this.level.timeLimit);
    const finalWpm = this.getFinalWpm();

    const result = {
      isEndless: Boolean(this.isEndless),
      category: this.endlessCategory,
      levelId: this.isEndless ? "endless" : this.level.id,
      difficulty: this.isEndless ? "Endless" : this.level.difficulty,
      passed: this.isEndless ? (this.completedWords > 0) : passed,
      stars: stars,
      timeLimit: this.level.timeLimit,
      elapsedTime: finalElapsed,
      remainingTime: parseFloat(this.remainingTime.toFixed(2)),
      completedWords: this.completedWords,
      completedCharacters: this.completedCharacters,
      firstTryCorrectWords: this.firstTryCorrectWords,
      totalWords: totalWords,
      accuracy: finalAccuracy,
      wpm: finalWpm,
      maxStreak: this.maxStreak
    };

    this.callbacks.onLevelEnd(result);
  }

  /**
   * Manually end an Endless run to bank the score
   */
  endEndlessRun() {
    if (this.isEndless && this.status === "PLAYING" && !this.isFinalized) {
      this.finalizeLevel(this.completedWords > 0);
    }
  }

  /**
   * Terminate game early (e.g. user leaves level)
   */
  abort() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.status = "IDLE";
    this.isFinalized = true;
  }
}

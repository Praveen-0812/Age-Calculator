/* ═══════════════════════════════════════════
   Age Calculator — script.js
   Pure-JS, no dependencies
   ═══════════════════════════════════════════ */

(() => {
  "use strict";

  // ── DOM refs ──────────────────────────────
  const dobInput      = document.getElementById("dobInput");
  const calcBtn       = document.getElementById("calcBtn");
  const resetBtn      = document.getElementById("resetBtn");
  const errorMsg      = document.getElementById("errorMsg");
  const resultsEl     = document.getElementById("results");

  const elYears       = document.getElementById("ageYears");
  const elMonths      = document.getElementById("ageMonths");
  const elDays        = document.getElementById("ageDays");

  const elTotalDays   = document.getElementById("totalDays");
  const elTotalWeeks  = document.getElementById("totalWeeks");
  const elTotalHours  = document.getElementById("totalHours");
  const elTotalMins   = document.getElementById("totalMinutes");
  const elTotalSecs   = document.getElementById("totalSeconds");

  const elBirthDay    = document.getElementById("birthDay");
  const elNextBday    = document.getElementById("nextBirthday");
  const elDaysUntil   = document.getElementById("daysUntil");

  // ── Prevent future dates ──────────────────
  const today = new Date();
  const yyyy  = today.getFullYear();
  const mm    = String(today.getMonth() + 1).padStart(2, "0");
  const dd    = String(today.getDate()).padStart(2, "0");
  dobInput.setAttribute("max", `${yyyy}-${mm}-${dd}`);

  // ── State ─────────────────────────────────
  let liveTimer = null;   // setInterval id for live seconds
  let birthDate = null;   // stored Date object

  // ── Utility: format number with commas ────
  const fmt = (n) => n.toLocaleString("en-US");

  // ── Day-of-week names ─────────────────────
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MONTHS_LONG = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  // ── Core: compute age components ──────────
  function computeAge(dob, now) {
    let years  = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    let days   = now.getDate() - dob.getDate();

    if (days < 0) {
      months--;
      // days in previous month
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  }

  // ── Core: total milliseconds lived ────────
  function msDiff(dob, now) {
    return now.getTime() - dob.getTime();
  }

  // ── Next birthday ─────────────────────────
  function getNextBirthday(dob, now) {
    let nextYear = now.getFullYear();
    let next = new Date(nextYear, dob.getMonth(), dob.getDate());

    // If birthday already passed this year, use next year
    if (next <= now) {
      nextYear++;
      next = new Date(nextYear, dob.getMonth(), dob.getDate());
    }

    const diffMs = next.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return {
      date: next,
      daysLeft,
    };
  }

  // ── Animated count-up ─────────────────────
  function animateValue(el, end, duration = 800) {
    const start = 0;
    const range = end - start;
    if (range === 0) { el.textContent = fmt(end); return; }

    const startTime = performance.now();

    function step(timestamp) {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.floor(start + range * eased);
      el.textContent = fmt(current);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = fmt(end);
    }

    requestAnimationFrame(step);
  }

  // ── Render results ────────────────────────
  function render() {
    const now = new Date();
    const age = computeAge(birthDate, now);
    const ms  = msDiff(birthDate, now);

    const totalSecs = Math.floor(ms / 1000);
    const totalMins = Math.floor(totalSecs / 60);
    const totalHrs  = Math.floor(totalMins / 60);
    const totalDays = Math.floor(totalHrs / 24);
    const totalWks  = Math.floor(totalDays / 7);

    // Primary
    animateValue(elYears,  age.years, 600);
    animateValue(elMonths, age.months, 600);
    animateValue(elDays,   age.days, 600);

    // Stats (animate once; seconds updated live)
    animateValue(elTotalDays,  totalDays, 900);
    animateValue(elTotalWeeks, totalWks, 900);
    animateValue(elTotalHours, totalHrs, 1000);
    animateValue(elTotalMins,  totalMins, 1100);
    elTotalSecs.textContent = fmt(totalSecs);

    // Birthday info
    const dayName = DAYS[birthDate.getDay()];
    const dobFormatted = `${dayName}, ${MONTHS_LONG[birthDate.getMonth()]} ${birthDate.getDate()}, ${birthDate.getFullYear()}`;
    elBirthDay.textContent = dobFormatted;

    const nb = getNextBirthday(birthDate, now);
    const nbFormatted = `${DAYS[nb.date.getDay()]}, ${MONTHS_LONG[nb.date.getMonth()]} ${nb.date.getDate()}, ${nb.date.getFullYear()}`;
    elNextBday.textContent = nbFormatted;
    elDaysUntil.textContent = `${fmt(nb.daysLeft)} day${nb.daysLeft !== 1 ? "s" : ""}`;
  }

  // ── Live seconds ticker ───────────────────
  function startLiveTicker() {
    stopLiveTicker();
    liveTimer = setInterval(() => {
      if (!birthDate) return;
      const now = new Date();
      const ms  = msDiff(birthDate, now);
      const totalSecs = Math.floor(ms / 1000);
      const totalMins = Math.floor(totalSecs / 60);
      elTotalSecs.textContent = fmt(totalSecs);
      elTotalMins.textContent = fmt(totalMins);
    }, 1000);
  }

  function stopLiveTicker() {
    if (liveTimer) {
      clearInterval(liveTimer);
      liveTimer = null;
    }
  }

  // ── Show error ────────────────────────────
  function showError(msg) {
    errorMsg.textContent = msg;
    dobInput.style.borderColor = "var(--clr-error)";
    dobInput.style.boxShadow   = "0 0 0 4px rgba(251,113,133,.25)";
  }

  function clearError() {
    errorMsg.textContent = "";
    dobInput.style.borderColor = "";
    dobInput.style.boxShadow   = "";
  }

  // ── Re-trigger fade-up on result cards ────
  function replayFadeUp() {
    resultsEl.querySelectorAll(".fade-up").forEach((el) => {
      el.style.animation = "none";
      // Force reflow
      void el.offsetWidth;
      el.style.animation = "";
    });
  }

  // ── Event: Calculate ──────────────────────
  calcBtn.addEventListener("click", () => {
    clearError();

    const val = dobInput.value;
    if (!val) {
      showError("🚫 Please select your date of birth first.");
      return;
    }

    const selected = new Date(val + "T00:00:00");
    const now      = new Date();

    if (selected > now) {
      showError("🚫 The selected date is in the future. Please pick a valid date.");
      return;
    }

    birthDate = selected;
    resultsEl.classList.remove("hidden");
    replayFadeUp();
    render();
    startLiveTicker();

    // Smooth-scroll to results
    resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ── Event: Reset ──────────────────────────
  resetBtn.addEventListener("click", () => {
    clearError();
    stopLiveTicker();
    birthDate = null;
    dobInput.value = "";
    resultsEl.classList.add("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ── Clear error styling on input change ───
  dobInput.addEventListener("change", clearError);
})();

import { AssessmentAnswer, AssessmentEvent, ConsistencyBreakdown } from "@/types";

export function calculateConsistencyScore(
  events: AssessmentEvent[],
  answers: AssessmentAnswer[]
): ConsistencyBreakdown {
  let score = 100;
  const signals: ConsistencyBreakdown["signals"] = [];

  // 1. Tab & Window Focus Analysis
  const tabSwitches = events.filter(
    (e) => e.type === "TAB_HIDDEN" || e.type === "WINDOW_BLUR"
  ).length;

  if (tabSwitches === 0) {
    signals.push({
      title: "Continuous Window Focus",
      description: "Candidate maintained uninterrupted focus in the assessment browser window.",
      level: "positive",
    });
  } else if (tabSwitches <= 2) {
    score -= tabSwitches * 4;
    signals.push({
      title: "Minor Focus Variations",
      description: `${tabSwitches} window or tab focus changes recorded during the session.`,
      level: "neutral",
    });
  } else {
    score -= Math.min(25, tabSwitches * 5);
    signals.push({
      title: "Frequent Tab Transitions",
      description: `${tabSwitches} focus departures from the active test view.`,
      level: "warning",
    });
  }

  // 2. Clipboard Activity
  const clipboardAttempts = events.filter((e) =>
    ["COPY_ATTEMPT", "PASTE_ATTEMPT", "CUT_ATTEMPT"].includes(e.type)
  ).length;

  if (clipboardAttempts === 0) {
    signals.push({
      title: "Clean Clipboard Log",
      description: "No clipboard copy or paste actions attempted on question content.",
      level: "positive",
    });
  } else {
    score -= Math.min(20, clipboardAttempts * 6);
    signals.push({
      title: "Clipboard Events Recorded",
      description: `${clipboardAttempts} copy/paste interactions intercepted by assessment client.`,
      level: "warning",
    });
  }

  // 3. Timing & Historical Anomaly Detection
  let timingAnomalies = 0;
  let consecutiveFastCount = 0;
  let maxConsecutiveFast = 0;

  answers.forEach((ans) => {
    // Under 4.5 seconds for a technical question is flagged as a statistical timing deviation
    if (ans.timeSpentMs < 4500) {
      timingAnomalies++;
      consecutiveFastCount++;
      if (consecutiveFastCount > maxConsecutiveFast) {
        maxConsecutiveFast = consecutiveFastCount;
      }
    } else {
      consecutiveFastCount = 0;
    }
  });

  if (timingAnomalies === 0) {
    signals.push({
      title: "Consistent Timing Distribution",
      description: "Response times aligned with natural reading and problem comprehension paces.",
      level: "positive",
    });
  } else {
    score -= Math.min(20, timingAnomalies * 5);
    signals.push({
      title: "Pacing Variation",
      description: `${timingAnomalies} question(s) completed significantly faster than normal comprehension distribution.`,
      level: timingAnomalies > 2 ? "warning" : "neutral",
    });
  }

  // 4. Sequence Detection (Pattern of fast bursts)
  if (maxConsecutiveFast >= 3) {
    score -= 10;
    signals.push({
      title: "Rapid Sequence Burst",
      description: `Observed a sequence of ${maxConsecutiveFast} consecutive questions answered in rapid succession.`,
      level: "warning",
    });
  }

  // 5. Answer Change Tracking
  const totalAnswerChanges = answers.reduce(
    (sum, a) => sum + (a.answerChangeCount || 0),
    0
  );

  if (totalAnswerChanges <= 4) {
    signals.push({
      title: "Deliberate Answer Selection",
      description: "Questions were solved decisively with minimal answer vacillation.",
      level: "positive",
    });
  } else {
    signals.push({
      title: "Multiple Option Revisions",
      description: `Candidate revised options ${totalAnswerChanges} times before final confirmation.`,
      level: "neutral",
    });
  }

  // 6. Difficulty vs Time Correlation
  let difficultyTimeCorrelation: ConsistencyBreakdown["difficultyTimeCorrelation"] = "Normal";
  if (timingAnomalies > answers.length / 2) {
    difficultyTimeCorrelation = "Uniform";
  }

  // Clamp final consistency score between 35 and 100
  const finalScore = Math.max(35, Math.min(100, Math.round(score)));

  return {
    score: finalScore,
    timingAnomalies,
    tabSwitches,
    clipboardAttempts,
    answerChanges: totalAnswerChanges,
    difficultyTimeCorrelation,
    disclaimer:
      "These are assessment-behavior signals and should be considered alongside the candidate's result. They do not establish cheating.",
    signals,
  };
}

import {
  AssessmentAnswer,
  AssessmentEvent,
  BehavioralSignal,
  ConsistencyBreakdown,
  ConsistencyCategoryDeductions,
  RawIntegrityEvent,
} from "@/types";

export const MANDATORY_INTEGRITY_DISCLAIMER =
  "These are assessment-behavior signals and should be considered alongside the candidate's result. They do not establish cheating.";

export function formatEventTimestamp(timestamp?: string | number): string {
  if (timestamp === undefined || timestamp === null) return "0:00";
  if (typeof timestamp === "number") {
    try {
      const d = new Date(timestamp);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString([], { hour12: false, minute: "2-digit", second: "2-digit" });
      }
    } catch {}
    return String(timestamp);
  }
  // If already mm:ss or hh:mm:ss format
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timestamp)) {
    return timestamp;
  }
  try {
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour12: false, minute: "2-digit", second: "2-digit" });
    }
  } catch {}
  return timestamp;
}

export interface ConsistencyScoreOptions {
  serverStartedAt?: string | number;
  serverSubmittedAt?: string | number;
}

/**
 * Formalized Consistency/Integrity scoring model:
 * - Base score starts at 100
 * - 1 free occurrence per deduction category before penalties start applying
 * - Tab switches / window blur: -5 each after 1st free occurrence (capped at -20 total)
 * - Clipboard interaction: -8 each after 1st free occurrence
 * - Fullscreen exits: -10 each after 1st free occurrence
 * - Timing anomalies (> 2 std dev from baseline mean): -6 each after 1st free occurrence
 * - Excessive revisions (> 3 revisions on a question): -4 each after 1st free occurrence
 * - Server timing mismatch (> 10% wall-clock divergence): -10 pts
 * - Floor at 0: Math.max(0, finalScore)
 */
export function calculateConsistencyScore(
  events: (AssessmentEvent | RawIntegrityEvent)[] = [],
  answers: AssessmentAnswer[] = [],
  options?: ConsistencyScoreOptions
): ConsistencyBreakdown {
  let score = 100;
  const signals: BehavioralSignal[] = [];

  // 1. Tab switches / window blur: 1st free, then -5 each, capped at -20 total deduction
  const tabEvents = events.filter(
    (e) =>
      e.type === "TAB_HIDDEN" ||
      e.type === "WINDOW_BLUR" ||
      e.type === "tab_switch" ||
      e.type === "window_blur"
  );
  const tabCount = tabEvents.length;
  // Grace threshold: 1 free occurrence
  const penalizedTabCount = Math.max(0, tabCount - 1);
  const rawTabDeduction = penalizedTabCount * 5;
  const tabDeduction = Math.min(20, rawTabDeduction);
  score -= tabDeduction;

  if (tabCount === 0) {
    signals.push({
      title: "Continuous Window Focus",
      description: "Candidate maintained uninterrupted focus in assessment browser tab (0 pts).",
      level: "positive",
      pointsDeducted: 0,
    });
  } else {
    // Record individual events in signals timeline
    tabEvents.forEach((ev, idx) => {
      const ts = formatEventTimestamp(ev.timestamp);
      if (idx === 0) {
        // 1st occurrence is free under grace threshold
        signals.push({
          title: `${ts} - Tab switch / window blur detected (0 pts - grace threshold applied)`,
          description: `${ts} - Focus departed from active assessment view (first occurrence forgiven by grace policy).`,
          level: "warning",
          timestamp: String(ev.timestamp),
          pointsDeducted: 0,
        });
      } else {
        // Events idx 1, 2, 3, 4 are penalized (-5 each = 20 total)
        // Events idx >= 5 are capped
        const isCapped = idx > 4;
        const deductionForThisEvent = isCapped ? 0 : 5;
        signals.push({
          title: isCapped
            ? `${ts} - Tab switch / window blur detected (0 pts - category cap reached)`
            : `${ts} - Tab switch / window blur detected (-5 pts)`,
          description: isCapped
            ? `${ts} - Window focus departure (tab deduction cap of -20 pts reached).`
            : `${ts} - Focus departed from active assessment view (-5 pts).`,
          level: "warning",
          timestamp: String(ev.timestamp),
          pointsDeducted: deductionForThisEvent,
        });
      }
    });
  }

  // 2. Clipboard interactions: 1st free, then -8 each
  const clipboardEvents = events.filter((e) =>
    ["COPY_ATTEMPT", "PASTE_ATTEMPT", "CUT_ATTEMPT", "clipboard"].includes(e.type)
  );
  const clipboardCount = clipboardEvents.length;
  const penalizedClipboardCount = Math.max(0, clipboardCount - 1);
  const clipboardDeduction = penalizedClipboardCount * 8;
  score -= clipboardDeduction;

  if (clipboardCount === 0) {
    signals.push({
      title: "Clean Clipboard Log",
      description: "No copy, paste, or cut attempts detected during session (0 pts).",
      level: "positive",
      pointsDeducted: 0,
    });
  } else {
    clipboardEvents.forEach((ev, idx) => {
      const ts = formatEventTimestamp(ev.timestamp);
      const actionName =
        (ev as RawIntegrityEvent).meta?.action
          ? String((ev as RawIntegrityEvent).meta?.action)
          : ev.type.replace("_ATTEMPT", "").toLowerCase();
      if (idx === 0) {
        signals.push({
          title: `${ts} - Clipboard ${actionName} interaction (0 pts - grace threshold applied)`,
          description: `${ts} - Clipboard interaction intercepted (first occurrence forgiven by grace policy).`,
          level: "warning",
          timestamp: String(ev.timestamp),
          pointsDeducted: 0,
        });
      } else {
        signals.push({
          title: `${ts} - Clipboard ${actionName} interaction (-8 pts)`,
          description: `${ts} - Clipboard interaction (${ev.type}) intercepted by client sandbox.`,
          level: "warning",
          timestamp: String(ev.timestamp),
          pointsDeducted: 8,
        });
      }
    });
  }

  // 3. Fullscreen exits: 1st free, then -10 each
  const fullscreenEvents = events.filter(
    (e) => e.type === "FULLSCREEN_EXIT" || e.type === "fullscreen_exit"
  );
  const fullscreenCount = fullscreenEvents.length;
  const penalizedFullscreenCount = Math.max(0, fullscreenCount - 1);
  const fullscreenDeduction = penalizedFullscreenCount * 10;
  score -= fullscreenDeduction;

  if (fullscreenCount > 0) {
    fullscreenEvents.forEach((ev, idx) => {
      const ts = formatEventTimestamp(ev.timestamp);
      if (idx === 0) {
        signals.push({
          title: `${ts} - Fullscreen exit detected (0 pts - grace threshold applied)`,
          description: `${ts} - Candidate exited fullscreen view (first occurrence forgiven by grace policy).`,
          level: "warning",
          timestamp: String(ev.timestamp),
          pointsDeducted: 0,
        });
      } else {
        signals.push({
          title: `${ts} - Fullscreen exit detected (-10 pts)`,
          description: `${ts} - Candidate exited required fullscreen assessment sandbox.`,
          level: "warning",
          timestamp: String(ev.timestamp),
          pointsDeducted: 10,
        });
      }
    });
  }

  // 4. Question Navigation Events (Informational / telemetry pattern)
  const navigationEvents = events.filter((e) => e.type === "question_navigation");
  if (navigationEvents.length > 0) {
    navigationEvents.forEach((ev) => {
      const ts = formatEventTimestamp(ev.timestamp);
      const rawEv = ev as RawIntegrityEvent;
      const dir = (rawEv.meta?.direction as string) || "navigation";
      const fromIdx = rawEv.meta?.fromIndex !== undefined ? Number(rawEv.meta.fromIndex) + 1 : "?";
      const toIdx = rawEv.meta?.toIndex !== undefined ? Number(rawEv.meta.toIndex) + 1 : "?";
      signals.push({
        title: `${ts} - Question ${dir} (Q${fromIdx} -> Q${toIdx})`,
        description: `Candidate navigated ${dir} from question ${fromIdx} to ${toIdx}.`,
        level: "neutral",
        timestamp: String(ev.timestamp),
        pointsDeducted: 0,
      });
    });
  }

  // 4b. Presence Verification Telemetry (§4.8)
  const isAbsent = (e: AssessmentEvent | RawIntegrityEvent) =>
    e.type === "face_not_detected" ||
    (e.type === "presence_signal" &&
      ((e as RawIntegrityEvent).meta?.status === "face_not_detected" ||
        (e as RawIntegrityEvent).meta?.status === "face_absent"));

  const isMultipleFaces = (e: AssessmentEvent | RawIntegrityEvent) =>
    e.type === "multiple_faces" ||
    (e.type === "presence_signal" &&
      (e as RawIntegrityEvent).meta?.status === "multiple_faces");

  const isLowConfidence = (e: AssessmentEvent | RawIntegrityEvent) =>
    e.type === "low_confidence" ||
    (e.type === "presence_signal" &&
      (e as RawIntegrityEvent).meta?.status === "low_confidence");

  const isConfirmed = (e: AssessmentEvent | RawIntegrityEvent) =>
    e.type === "presence_confirmed" ||
    (e.type === "presence_signal" &&
      (e as RawIntegrityEvent).meta?.status === "presence_confirmed");

  const isPresenceEvent = (e: AssessmentEvent | RawIntegrityEvent) =>
    isAbsent(e) || isMultipleFaces(e) || isLowConfidence(e) || isConfirmed(e);

  const presenceEvents = events.filter(isPresenceEvent);
  const absentEvents = events.filter(isAbsent);
  const multipleFacesEvents = events.filter(isMultipleFaces);
  const lowConfidenceEvents = events.filter(isLowConfidence);

  let presenceDeduction = 0;

  if (presenceEvents.length > 0) {
    // 1. Sustained Face Not Detected: 1st free, then -6 each, capped at 18 pts
    if (absentEvents.length > 0) {
      absentEvents.forEach((ev, idx) => {
        const ts = formatEventTimestamp(ev.timestamp);
        if (idx === 0) {
          signals.push({
            title: `${ts} - Temporary presence departure (0 pts - grace threshold applied)`,
            description: "Candidate temporarily out of camera frame (first occurrence forgiven by grace policy).",
            level: "warning",
            timestamp: String(ev.timestamp),
            pointsDeducted: 0,
          });
        } else {
          const isCapped = idx > 3; // idx 1, 2, 3 penalized (-6 * 3 = -18 pts)
          const deductionForThis = isCapped ? 0 : 6;
          signals.push({
            title: isCapped
              ? `${ts} - Face not detected (0 pts - presence absence cap reached)`
              : `${ts} - Face not detected (-6 pts)`,
            description: isCapped
              ? "Candidate unconfirmed in camera frame (maximum presence deduction cap reached)."
              : "Candidate unconfirmed in camera frame during assessment execution (-6 pts).",
            level: "warning",
            timestamp: String(ev.timestamp),
            pointsDeducted: deductionForThis,
          });
        }
      });
      const penalizedAbsent = Math.max(0, absentEvents.length - 1);
      const absentDeduction = Math.min(18, penalizedAbsent * 6);
      presenceDeduction += absentDeduction;
    }

    // 2. Multiple Faces Detected: 1st free, then -10 each, capped at 20 pts
    if (multipleFacesEvents.length > 0) {
      multipleFacesEvents.forEach((ev, idx) => {
        const ts = formatEventTimestamp(ev.timestamp);
        if (idx === 0) {
          signals.push({
            title: `${ts} - Additional face detected in frame (0 pts - grace threshold applied)`,
            description: "More than one person temporarily detected in camera frame (first occurrence forgiven by grace policy).",
            level: "warning",
            timestamp: String(ev.timestamp),
            pointsDeducted: 0,
          });
        } else {
          const isCapped = idx > 2; // idx 1, 2 penalized (-10 * 2 = -20 pts)
          const deductionForThis = isCapped ? 0 : 10;
          signals.push({
            title: isCapped
              ? `${ts} - Additional person detected (0 pts - multiple faces cap reached)`
              : `${ts} - Additional person detected (-10 pts)`,
            description: isCapped
              ? "Multiple persons detected in camera frame (maximum multiple faces deduction cap reached)."
              : "More than one person in camera frame during assessment (-10 pts).",
            level: "warning",
            timestamp: String(ev.timestamp),
            pointsDeducted: deductionForThis,
          });
        }
      });
      const penalizedMultiple = Math.max(0, multipleFacesEvents.length - 1);
      const multipleDeduction = Math.min(20, penalizedMultiple * 10);
      presenceDeduction += multipleDeduction;
    }

    // 3. Low Confidence - verify manually: DOES NOT deduct points (§4.8)
    if (lowConfidenceEvents.length > 0) {
      lowConfidenceEvents.forEach((ev) => {
        const ts = formatEventTimestamp(ev.timestamp);
        signals.push({
          title: `${ts} - Low confidence — verify manually (0 pts)`,
          description: "Optical presence confidence below threshold (e.g. lighting or angle). Flagged for human review without penalty.",
          level: "neutral",
          timestamp: String(ev.timestamp),
          pointsDeducted: 0,
        });
      });
    }

    // 4. Clean continuous presence verified
    if (absentEvents.length === 0 && multipleFacesEvents.length === 0) {
      signals.push({
        title: "Continuous Presence Verified",
        description: "Candidate verified continuously present in camera frame throughout assessment.",
        level: "positive",
        pointsDeducted: 0,
      });
    }

    score -= presenceDeduction;
  }

  // 5. Timing anomalies: > 2 std dev from question mean: 1st free, then -6 each
  let timingAnomalies = 0;
  if (answers.length > 0) {
    const times = answers.map((a) => a.timeSpentMs);
    let mean = 15000;
    let stdDev = 4000;

    if (times.length >= 3) {
      const sum = times.reduce((acc, t) => acc + t, 0);
      mean = sum / times.length;
      const variance =
        times.reduce((acc, t) => acc + Math.pow(t - mean, 2), 0) / (times.length - 1);
      stdDev = Math.sqrt(variance);
    }

    const lowerBound = Math.max(1000, mean - 2 * stdDev);
    const upperBound = mean + 2 * stdDev;

    answers.forEach((ans, idx) => {
      if (stdDev > 0 && (ans.timeSpentMs < lowerBound || ans.timeSpentMs > upperBound)) {
        timingAnomalies++;
        const seconds = (ans.timeSpentMs / 1000).toFixed(1);
        if (timingAnomalies === 1) {
          signals.push({
            title: `Question ${idx + 1} timing anomaly (0 pts - grace threshold applied)`,
            description: `Question ${idx + 1} answered in ${seconds}s (statistical anomaly, first occurrence forgiven by grace policy).`,
            level: "warning",
            pointsDeducted: 0,
          });
        } else {
          signals.push({
            title: `Question ${idx + 1} timing anomaly (-6 pts)`,
            description: `Question ${idx + 1} answered in ${seconds}s (statistical anomaly >2 std dev from mean pacing).`,
            level: "warning",
            pointsDeducted: 6,
          });
        }
      }
    });
  }
  const penalizedTimingAnomalies = Math.max(0, timingAnomalies - 1);
  const timingDeduction = penalizedTimingAnomalies * 6;
  score -= timingDeduction;

  if (timingAnomalies === 0 && answers.length > 0) {
    signals.push({
      title: "Consistent Timing Distribution",
      description: "Response times aligned with natural reading and problem comprehension paces (0 pts).",
      level: "positive",
      pointsDeducted: 0,
    });
  }

  // 6. Excessive revisions: changing answers > 3 times on a question: 1st free, then -4 each
  let excessiveRevisions = 0;
  answers.forEach((ans, idx) => {
    if ((ans.answerChangeCount || 0) > 3) {
      excessiveRevisions++;
      if (excessiveRevisions === 1) {
        signals.push({
          title: `Question ${idx + 1} excessive revisions (0 pts - grace threshold applied)`,
          description: `Candidate altered selected option ${ans.answerChangeCount} times (first occurrence forgiven by grace policy).`,
          level: "warning",
          pointsDeducted: 0,
        });
      } else {
        signals.push({
          title: `Question ${idx + 1} excessive revisions (-4 pts)`,
          description: `Candidate altered selected option ${ans.answerChangeCount} times before confirming answer.`,
          level: "warning",
          pointsDeducted: 4,
        });
      }
    }
  });
  const penalizedExcessiveRevisions = Math.max(0, excessiveRevisions - 1);
  const revisionDeduction = penalizedExcessiveRevisions * 4;
  score -= revisionDeduction;

  const totalAnswerChanges = answers.reduce(
    (sum, a) => sum + (a.answerChangeCount || 0),
    0
  );

  if (excessiveRevisions === 0 && answers.length > 0) {
    signals.push({
      title: "Deliberate Answer Selection",
      description: `Questions completed decisively without excessive revisions (${totalAnswerChanges} total revisions across assessment).`,
      level: "positive",
      pointsDeducted: 0,
    });
  }

  // 7. Server-side timing sanity check: wall-clock vs client question times sum
  let timingMismatchDeduction = 0;
  if (options?.serverStartedAt && options?.serverSubmittedAt && answers.length > 0) {
    const startMs =
      typeof options.serverStartedAt === "number"
        ? options.serverStartedAt
        : new Date(options.serverStartedAt).getTime();
    const submitMs =
      typeof options.serverSubmittedAt === "number"
        ? options.serverSubmittedAt
        : new Date(options.serverSubmittedAt).getTime();

    if (!isNaN(startMs) && !isNaN(submitMs) && submitMs > startMs) {
      const serverElapsedMs = submitMs - startMs;
      const clientTotalMs = answers.reduce((sum, a) => sum + (a.timeSpentMs || 0), 0);
      const divergence = Math.abs(serverElapsedMs - clientTotalMs);
      const divergenceRatio = divergence / serverElapsedMs;

      // > 10% divergence triggers timing mismatch penalty
      if (divergenceRatio > 0.1) {
        timingMismatchDeduction = 10;
        score -= timingMismatchDeduction;
        signals.push({
          title: "Server timing mismatch detected (-10 pts)",
          description: `Server wall-clock elapsed time (${(serverElapsedMs / 1000).toFixed(1)}s) diverged from client question time sum (${(clientTotalMs / 1000).toFixed(1)}s) by ${(divergenceRatio * 100).toFixed(1)}% (exceeds 10% tolerance limit).`,
          level: "warning",
          pointsDeducted: 10,
        });
      } else {
        signals.push({
          title: "Server Timing Verification Passed",
          description: `Server wall-clock time aligns with client-reported question duration within ${(divergenceRatio * 100).toFixed(1)}% (tolerance: 10%).`,
          level: "positive",
          pointsDeducted: 0,
        });
      }
    }
  }

  // 8. Floor at 0
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  let difficultyTimeCorrelation: ConsistencyBreakdown["difficultyTimeCorrelation"] = "Normal";
  if (answers.length > 0 && timingAnomalies > answers.length / 2) {
    difficultyTimeCorrelation = "Unusual";
  }

  const breakdownDeductions: ConsistencyCategoryDeductions = {
    tabSwitches: tabDeduction,
    clipboard: clipboardDeduction,
    fullscreenExits: fullscreenDeduction,
    timingAnomalies: timingDeduction,
    excessiveRevisions: revisionDeduction,
    presence: presenceDeduction,
    timingMismatch: timingMismatchDeduction,
  };

  return {
    score: finalScore,
    timingAnomalies,
    tabSwitches: tabCount,
    clipboardAttempts: clipboardCount,
    fullscreenExits: fullscreenCount,
    excessiveRevisions,
    presenceAnomalies: absentEvents.length + multipleFacesEvents.length,
    timingMismatch: timingMismatchDeduction,
    answerChanges: totalAnswerChanges,
    difficultyTimeCorrelation,
    disclaimer: MANDATORY_INTEGRITY_DISCLAIMER,
    breakdown: breakdownDeductions,
    deductions: breakdownDeductions,
    signals,
  };
}

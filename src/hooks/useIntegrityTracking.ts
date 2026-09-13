"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RawIntegrityEvent } from "@/types";

export interface UseIntegrityTrackingOptions {
  attemptId: string;
  currentQuestionId?: string;
  currentQuestionIndex?: number;
  enabled?: boolean;
}

export interface UseIntegrityTrackingReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  eventsCount: number;
  isFullscreen: boolean;
  requestFullscreen: () => Promise<void>;
  recordQuestionNavigation: (
    fromIndex: number,
    toIndex: number,
    direction: "forward" | "back" | "jump",
    questionId?: string
  ) => void;
  recordAnswerRevision: (
    questionId: string,
    fromOptionId?: string,
    toOptionId?: string
  ) => void;
  getRawEvents: () => RawIntegrityEvent[];
  flushEventsSync: () => Promise<void>;
}

export function useIntegrityTracking({
  attemptId,
  currentQuestionId,
  currentQuestionIndex = 0,
  enabled = true,
}: UseIntegrityTrackingOptions): UseIntegrityTrackingReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const eventsRef = useRef<RawIntegrityEvent[]>([]);
  const pendingSyncEventsRef = useRef<RawIntegrityEvent[]>([]);
  const lastVisibilityChangeTimeRef = useRef<number>(0);
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestionIdRef = useRef<string | undefined>(currentQuestionId);
  const currentQuestionIndexRef = useRef<number>(currentQuestionIndex);

  const [eventsCount, setEventsCount] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Keep references updated
  useEffect(() => {
    currentQuestionIdRef.current = currentQuestionId;
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionId, currentQuestionIndex]);

  // Flush pending events incrementally to server
  const flushEventsSync = useCallback(async () => {
    if (pendingSyncEventsRef.current.length === 0) return;
    const batch = [...pendingSyncEventsRef.current];
    pendingSyncEventsRef.current = [];

    try {
      await fetch(`/api/assessments/${attemptId}/events`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: batch }),
      });
    } catch {
      // Re-queue on failure so it is preserved for subsequent sync or final submit
      pendingSyncEventsRef.current = [...batch, ...pendingSyncEventsRef.current];
    }
  }, [attemptId]);

  // Append an event to memory and schedule debounced sync
  const appendEvent = useCallback(
    (event: RawIntegrityEvent) => {
      eventsRef.current.push(event);
      pendingSyncEventsRef.current.push(event);
      setEventsCount((c) => c + 1);

      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
      syncTimerRef.current = setTimeout(() => {
        flushEventsSync();
      }, 2000);
    },
    [flushEventsSync]
  );

  // 1. Tab switches (visibilitychange primary) & window blur (secondary with 500ms deduplication)
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      const now = Date.now();
      lastVisibilityChangeTimeRef.current = now;
      if (document.hidden) {
        appendEvent({
          type: "tab_switch",
          timestamp: now,
          questionId: currentQuestionIdRef.current,
          meta: { state: "hidden" },
        });
      }
    };

    const handleBlur = () => {
      const now = Date.now();
      // Deduplicate: ignore blur if visibilitychange fired within 500ms
      if (now - lastVisibilityChangeTimeRef.current < 500) {
        return;
      }
      appendEvent({
        type: "window_blur",
        timestamp: now,
        questionId: currentQuestionIdRef.current,
        meta: { state: "blur" },
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled, appendEvent]);

  // 2. Clipboard interactions: copy, cut, paste
  useEffect(() => {
    if (!enabled) return;

    const handleClipboard = (e: ClipboardEvent) => {
      appendEvent({
        type: "clipboard",
        timestamp: Date.now(),
        questionId: currentQuestionIdRef.current,
        meta: { action: e.type },
      });
    };

    // Attach to assessment container if available, otherwise document
    const target = containerRef.current || document;
    target.addEventListener("copy", handleClipboard as EventListener);
    target.addEventListener("cut", handleClipboard as EventListener);
    target.addEventListener("paste", handleClipboard as EventListener);

    return () => {
      target.removeEventListener("copy", handleClipboard as EventListener);
      target.removeEventListener("cut", handleClipboard as EventListener);
      target.removeEventListener("paste", handleClipboard as EventListener);
    };
  }, [enabled, appendEvent]);

  // 3. Fullscreen API with graceful degradation
  useEffect(() => {
    if (!enabled) return;

    const handleFullscreenChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element;
        mozFullScreenElement?: Element;
      };
      const isNowFullscreen = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement
      );
      setIsFullscreen(isNowFullscreen);

      if (!isNowFullscreen) {
        appendEvent({
          type: "fullscreen_exit",
          timestamp: Date.now(),
          questionId: currentQuestionIdRef.current,
          meta: { reason: "fullscreenchange" },
        });
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
    };
  }, [enabled, appendEvent]);

  const requestFullscreen = useCallback(async () => {
    try {
      const element = (containerRef.current || document.documentElement) as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
        mozRequestFullScreen?: () => Promise<void>;
      };
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else {
        console.warn("Fullscreen API unavailable on this browser");
      }
    } catch (err) {
      console.warn("Fullscreen unavailable or declined by user:", err);
    }
  }, []);

  // 4. Question navigation tracker
  const recordQuestionNavigation = useCallback(
    (
      fromIndex: number,
      toIndex: number,
      direction: "forward" | "back" | "jump",
      questionId?: string
    ) => {
      appendEvent({
        type: "question_navigation",
        timestamp: Date.now(),
        questionId: questionId || currentQuestionIdRef.current,
        meta: { direction, fromIndex, toIndex },
      });
    },
    [appendEvent]
  );

  // 5. Answer revision tracker
  const recordAnswerRevision = useCallback(
    (questionId: string, fromOptionId?: string, toOptionId?: string) => {
      appendEvent({
        type: "answer_revision",
        timestamp: Date.now(),
        questionId,
        meta: { from: fromOptionId, to: toOptionId },
      });
    },
    [appendEvent]
  );

  // 6. Access complete raw events log
  const getRawEvents = useCallback(() => {
    return [...eventsRef.current];
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    eventsCount,
    isFullscreen,
    requestFullscreen,
    recordQuestionNavigation,
    recordAnswerRevision,
    getRawEvents,
    flushEventsSync,
  };
}

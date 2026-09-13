import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { AssessmentEventSchema } from "@/lib/validation/schemas";
import { ApiError, ApiSuccess, AssessmentEvent } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attemptId } = await params;
    const body = await req.json();

    const parsed = AssessmentEventSchema.safeParse(body);
    if (!parsed.success) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid event payload", details: parsed.error.format() },
      };
      return NextResponse.json(errorRes, { status: 400 });
    }

    const attempt = db.attempts.find((a) => a.id === attemptId);
    if (!attempt) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "NOT_FOUND", message: "Attempt not found" },
      };
      return NextResponse.json(errorRes, { status: 404 });
    }

    if (attempt.status !== "in_progress") {
      const errorRes: ApiError = {
        success: false,
        error: { code: "ATTEMPT_CLOSED", message: "Attempt is no longer active." },
      };
      return NextResponse.json(errorRes, { status: 400 });
    }

    const event: AssessmentEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      attemptId,
      ...parsed.data,
    };

    if (!db.attemptEvents[attemptId]) {
      db.attemptEvents[attemptId] = [];
    }
    db.attemptEvents[attemptId].push(event);

    const response: ApiSuccess<{ recorded: boolean }> = {
      success: true,
      data: { recorded: true },
    };
    return NextResponse.json(response);
  } catch {
    const errorRes: ApiError = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to record event." },
    };
    return NextResponse.json(errorRes, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attemptId } = await params;
    const body = await req.json();
    const newEvents: any[] = Array.isArray(body.events) ? body.events : [];

    const attempt = db.attempts.find((a) => a.id === attemptId);
    if (!attempt) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "NOT_FOUND", message: "Attempt not found" },
      };
      return NextResponse.json(errorRes, { status: 404 });
    }

    if (attempt.status !== "in_progress") {
      const errorRes: ApiError = {
        success: false,
        error: { code: "ATTEMPT_CLOSED", message: "Attempt is no longer active." },
      };
      return NextResponse.json(errorRes, { status: 400 });
    }

    if (!db.attemptEvents[attemptId]) {
      db.attemptEvents[attemptId] = [];
    }
    if (!attempt.rawEvents) {
      attempt.rawEvents = [];
    }

    for (const ev of newEvents) {
      const formattedEvent: AssessmentEvent = {
        id: ev.id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        attemptId,
        type: ev.type,
        timestamp:
          typeof ev.timestamp === "number"
            ? new Date(ev.timestamp).toISOString()
            : ev.timestamp || new Date().toISOString(),
        questionId: ev.questionId,
        metadata: ev.meta || ev.metadata || {},
      };
      db.attemptEvents[attemptId].push(formattedEvent);
      attempt.rawEvents.push(ev);
    }

    const response: ApiSuccess<{ appendedCount: number; totalEvents: number }> = {
      success: true,
      data: {
        appendedCount: newEvents.length,
        totalEvents: db.attemptEvents[attemptId].length,
      },
    };
    return NextResponse.json(response);
  } catch {
    const errorRes: ApiError = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to append incremental events." },
    };
    return NextResponse.json(errorRes, { status: 500 });
  }
}


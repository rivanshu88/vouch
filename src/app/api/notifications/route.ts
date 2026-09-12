import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { ApiSuccess, InAppNotification } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "usr-01";

  const notifications = db.notifications.filter((n) => n.userId === userId);

  const response: ApiSuccess<InAppNotification[]> = {
    success: true,
    data: notifications,
  };
  return NextResponse.json(response);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const notifId = body.id;

  if (notifId === "all") {
    db.notifications.forEach((n) => (n.read = true));
  } else {
    const notif = db.notifications.find((n) => n.id === notifId);
    if (notif) {
      notif.read = true;
    }
  }

  const response: ApiSuccess<{ success: boolean }> = {
    success: true,
    data: { success: true },
  };
  return NextResponse.json(response);
}

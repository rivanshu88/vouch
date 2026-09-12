import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { AddCertificateSchema } from "@/lib/validation/schemas";
import { ApiError, ApiSuccess, Certificate } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const candidateId = body.candidateId || "usr-01";

    const parsed = AddCertificateSchema.safeParse(body);
    if (!parsed.success) {
      const errorRes: ApiError = {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid certificate parameters", details: parsed.error.format() },
      };
      return NextResponse.json(errorRes, { status: 400 });
    }

    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      candidateId,
      ...parsed.data,
      createdAt: new Date().toISOString(),
    };

    db.certificates.push(newCert);

    const response: ApiSuccess<Certificate> = {
      success: true,
      data: newCert,
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    const errorRes: ApiError = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to add certificate." },
    };
    return NextResponse.json(errorRes, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/server/config";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  return NextResponse.json({ ok: true }, { status: 200, headers: corsHeaders(request) });
}

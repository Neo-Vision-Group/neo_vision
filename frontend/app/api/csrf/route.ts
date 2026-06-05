import { NextResponse } from "next/server";
import { generateCsrfToken, setCsrfCookie, getCsrfHeaderName } from "@/lib/csrf";

export async function GET() {
  const token = generateCsrfToken();
  await setCsrfCookie(token);
  
  return NextResponse.json({
    token,
    headerName: getCsrfHeaderName(),
  });
}

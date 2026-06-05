import { NextResponse } from "next/server";

export async function GET() {
  const securityTxt = `Contact: mailto:security@neovision.dev
Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}
Preferred-Languages: en
Canonical: https://neovision.dev/.well-known/security.txt
Policy: https://neovision.dev/security-policy
Acknowledgments: https://neovision.dev/security-acknowledgments`;

  return new NextResponse(securityTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

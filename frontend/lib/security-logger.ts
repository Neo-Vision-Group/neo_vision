import { NextRequest } from "next/server";

export interface SecurityLogEntry {
  timestamp: string;
  correlationId: string;
  ip: string;
  userAgent: string;
  endpoint: string;
  method: string;
  status: "success" | "failure" | "blocked";
  reason?: string;
  metadata?: Record<string, unknown>;
}

function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

function getIP(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (xff) {
    return xff.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return "unknown";
}

export function logSecurityEvent(
  request: NextRequest,
  status: SecurityLogEntry["status"],
  reason?: string,
  metadata?: Record<string, unknown>
): string {
  const correlationId = generateCorrelationId();
  
  const logEntry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    correlationId,
    ip: getIP(request),
    userAgent: request.headers.get("user-agent") || "unknown",
    endpoint: request.url,
    method: request.method,
    status,
    reason,
    metadata,
  };
  
  if (status === "failure" || status === "blocked") {
    console.warn("[SECURITY]", JSON.stringify(logEntry));
  } else if (process.env.NODE_ENV === "development") {
    console.log("[SECURITY]", JSON.stringify(logEntry));
  }
  
  return correlationId;
}

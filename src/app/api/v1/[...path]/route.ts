import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://localhost:3001/api/v1";

export const maxDuration = 60; // Vercel Pro: 60s, Hobby: 10s

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(req, path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(req, path);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(req, path);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(req, path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(req, path);
}

async function proxyRequest(req: NextRequest, path: string[]) {
  const url = `${BACKEND_URL}/${path.join("/")}${req.nextUrl.search}`;
  
  try {
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      // Skip compression-related headers to avoid double-encoding
      if (!["host", "connection", "accept-encoding"].includes(lowerKey)) {
        headers[key] = value;
      }
    });

    const body = req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined;

    const response = await fetch(url, {
      method: req.method,
      headers,
      body,
    });

    const data = await response.text();
    const responseHeaders = new Headers();
    
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      // Remove compression headers since we already decompressed
      if (!["content-encoding", "transfer-encoding"].includes(lowerKey)) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: error.message || "Proxy request failed" },
      { status: 502 }
    );
  }
}

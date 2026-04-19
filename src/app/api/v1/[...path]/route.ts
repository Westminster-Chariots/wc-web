import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "https://wc-backend-ayx0.onrender.com/api/v1";

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
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!["host", "connection", "content-length", "accept-encoding"].includes(lowerKey)) {
        headers.set(key, value);
      }
    });

    const body = req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined;

    const response = await fetch(url, {
      method: req.method,
      headers,
      body,
    });

    // Read response as text/json to avoid compression issues
    const contentType = response.headers.get("content-type") || "";
    let responseBody;
    
    if (contentType.includes("application/json")) {
      responseBody = await response.text();
    } else {
      responseBody = response.body;
    }

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!["connection", "transfer-encoding", "content-encoding"].includes(lowerKey)) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
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

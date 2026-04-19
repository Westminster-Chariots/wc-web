"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function CookieDebugPage() {
  const [cookies, setCookies] = useState<string>("");
  const [loginResponse, setLoginResponse] = useState<any>(null);
  const [meResponse, setMeResponse] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setCookies(document.cookie);
  }, []);

  const testLogin = async () => {
    try {
      const response = await api.post("/auth/login", {
        email: "test@example.com",
        password: "password123",
      });
      setLoginResponse(response.data);
      setTimeout(() => setCookies(document.cookie), 1000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const testMe = async () => {
    try {
      const response = await api.get("/auth/me");
      setMeResponse(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cookie Debug</h1>
      <div className="space-y-4">
        <div className="p-4 bg-card border rounded">
          <h2 className="font-semibold mb-2">Cookies:</h2>
          <pre className="text-xs bg-secondary p-2 rounded">{cookies || "None"}</pre>
        </div>
        <div className="flex gap-4">
          <button onClick={testLogin} className="px-4 py-2 bg-primary text-primary-foreground rounded">Test Login</button>
          <button onClick={testMe} className="px-4 py-2 bg-secondary rounded">Test /auth/me</button>
        </div>
        {loginResponse && (
          <div className="p-4 bg-card border rounded">
            <h2 className="font-semibold mb-2">Login:</h2>
            <pre className="text-xs bg-secondary p-2 rounded">{JSON.stringify(loginResponse, null, 2)}</pre>
          </div>
        )}
        {meResponse && (
          <div className="p-4 bg-card border rounded">
            <h2 className="font-semibold mb-2">/auth/me:</h2>
            <pre className="text-xs bg-secondary p-2 rounded">{JSON.stringify(meResponse, null, 2)}</pre>
          </div>
        )}
        {error && <div className="p-4 bg-destructive/10 border border-destructive rounded"><pre className="text-xs">{error}</pre></div>}
      </div>
    </div>
  );
}

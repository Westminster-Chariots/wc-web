"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import axios from "axios";

export default function CookieDebugPage() {
  const [tokens, setTokens] = useState<string>("");
  const [loginResponse, setLoginResponse] = useState<any>(null);
  const [meResponse, setMeResponse] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [headers, setHeaders] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkTokens();
  }, []);

  const checkTokens = () => {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");
    setTokens(JSON.stringify({ accessToken: accessToken ? "***" + accessToken.slice(-10) : null, refreshToken: refreshToken ? "***" + refreshToken.slice(-10) : null }, null, 2));
  };

  const testLogin = async () => {
    setError("");
    setHeaders(null);
    setLoading(true);
    console.log("Calling: /api/v1/auth/login");
    try {
      const response = await axios.post("http://localhost:3001/api/v1/auth/login", {
        email: "admin@westminsterchariots.com",
        password: "admin123",
      }, { 
        timeout: 60000
      });
      console.log("Response:", response);
      setLoginResponse(response.data);
      setHeaders({
        'all': Object.keys(response.headers)
      });
      
      // Store tokens
      if (response.data.accessToken) {
        localStorage.setItem("access_token", response.data.accessToken);
        localStorage.setItem("refresh_token", response.data.refreshToken);
      }
      
      setTimeout(checkTokens, 100);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.response?.data?.error || err.message);
      setHeaders(err.response?.headers || null);
    } finally {
      setLoading(false);
    }
  };

  const testMe = async () => {
    setError("");
    try {
      const response = await api.get("/auth/me");
      setMeResponse(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug (localStorage)</h1>
      <div className="space-y-4">
        <div className="p-4 bg-card border rounded">
          <h2 className="font-semibold mb-2">Tokens in localStorage:</h2>
          <pre className="text-xs bg-secondary p-2 rounded">{tokens || "None"}</pre>
        </div>
        <div className="p-4 bg-card border rounded">
          <h2 className="font-semibold mb-2">Config:</h2>
          <pre className="text-xs bg-secondary p-2 rounded">
            Backend: http://localhost:3001
            {"\n"}Current: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}
          </pre>
        </div>
        <div className="flex gap-4">
          <button onClick={testLogin} disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50">
            {loading ? "Loading..." : "Test Login"}
          </button>
          <button onClick={testMe} className="px-4 py-2 bg-secondary rounded">Test /auth/me</button>
          <button onClick={checkTokens} className="px-4 py-2 bg-secondary rounded">Refresh</button>
        </div>
        {headers && (
          <div className="p-4 bg-card border rounded">
            <h2 className="font-semibold mb-2">Response Headers:</h2>
            <pre className="text-xs bg-secondary p-2 rounded">{JSON.stringify(headers, null, 2)}</pre>
          </div>
        )}
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

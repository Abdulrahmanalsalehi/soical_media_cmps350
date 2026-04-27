"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "@/css/auth.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.className = "login-page";
    return () => { document.body.className = ""; };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (res.ok) {
        router.push("/home");
      } else {
        setError(json.error?.message || json.error || "Invalid credentials");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h2>Welcome to SocialX</h2>
      <div className="form-container">
        <div className="form-box">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="user-input">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="user-input">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p style={{ color: "#ff6b6b", marginBottom: "10px", fontSize: "14px" }}>
                {error}
              </p>
            )}
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <p className="sign-up-message">
              Don&apos;t have an account?{" "}
              <span id="sign-up" onClick={() => router.push("/register")}>
                Sign up
              </span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

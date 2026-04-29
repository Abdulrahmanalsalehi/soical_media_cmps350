"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "@/css/auth.css";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullname: "", username: "", email: "",
    phone: "", dob: "", gender: "",
    password: "", confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.className = "register-page";
    return () => { document.body.className = ""; };
  }, []);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: form.fullname,
          username: form.username,
          email: form.email,
          phone: form.phone || undefined,
          dob: form.dob || undefined,
          gender: form.gender || undefined,
          password: form.password,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        router.push("/login");
      } else {
        setError("Registration failed");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container">
      <div className="form-box">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="user-input">
            <label htmlFor="fullname">Full Name</label>
            <input type="text" id="fullname" placeholder="Enter your full name"
              value={form.fullname} onChange={set("fullname")} required />
          </div>
          <div className="user-input">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" placeholder="Choose a username"
              value={form.username} onChange={set("username")} required />
          </div>
          <div className="user-input">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email"
              value={form.email} onChange={set("email")} required />
          </div>
          <div className="user-input">
            <label htmlFor="phone">Phone Number</label>
            <input type="tel" id="phone" placeholder="Enter your phone number"
              value={form.phone} onChange={set("phone")} />
          </div>
          <div className="user-input">
            <label htmlFor="dob">Date of Birth</label>
            <input type="date" id="dob" value={form.dob} onChange={set("dob")} />
          </div>
          <div className="user-input">
            <label>Gender</label>
            <div className="radio-button">
              <label>
                <input type="radio" name="gender" value="Male"
                  checked={form.gender === "Male"} onChange={set("gender")} /> Male
              </label>
              <label>
                <input type="radio" name="gender" value="Female"
                  checked={form.gender === "Female"} onChange={set("gender")} /> Female
              </label>
            </div>
          </div>
          <div className="user-input">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Create a password"
              value={form.password} onChange={set("password")} required />
          </div>
          <div className="user-input">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input type="password" id="confirm-password" placeholder="Confirm your password"
              value={form.confirmPassword} onChange={set("confirmPassword")} required />
          </div>
          {error && (
            <p style={{ color: "#ff6b6b", marginBottom: "10px", fontSize: "14px", gridColumn: "span 2" }}>
              {error}
            </p>
          )}
          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
          <p className="sign-in-message">
            Already have an account?{" "}
            <span id="sign-in" onClick={() => router.push("/login")}>login</span>
          </p>
        </form>
      </div>
    </div>
  );
}

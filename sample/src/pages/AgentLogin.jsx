import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const sanitizeInput = (val) =>
  typeof val === "string"
    ? val.replace(/(['";\\]|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION)\b)/gi, "")
    : val;

const AgentLogin = () => {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5002";

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errorStatus, setErrorStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showForgotPopup, setShowForgotPopup] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetStatus, setResetStatus] = useState("");

  const resetForgotFlow = () => {
    setForgotEmail("");
    setOtp("");
    setOtpGenerated(false);
    setOtpVerified(false);
    setNewPassword("");
    setConfirmPassword("");
    setResetStatus("");
  };

  const handleChange = (e) => {
    const value = sanitizeInput(e.target.value);
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
    setErrorStatus("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setErrorStatus("❌ Please enter both Username and Password");
      return;
    }

    setErrorStatus("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/agent-auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem("agentUser", JSON.stringify(data.agent));
        navigate("/agent-dashboard");
      } else {
        setErrorStatus("❌ " + (data.message || "Login failed"));
      }
    } catch (error) {
      setErrorStatus("❌ Server error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateOTP = async () => {
    if (!forgotEmail.trim()) {
      setResetStatus("❌ Please enter your email.");
      return;
    }

    setIsSubmitting(true);
    setResetStatus("");

    try {
      const response = await fetch(`${API_BASE}/api/agent-auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpGenerated(true);
        setOtpVerified(false);
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setResetStatus("✅ OTP sent to your email. Enter the code to continue.");
      } else {
        setResetStatus("❌ " + (data.message || "Unable to send OTP"));
      }
    } catch (error) {
      setResetStatus("❌ Server error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 5) {
      setResetStatus("❌ Enter a valid 5-digit OTP");
      return;
    }

    setIsSubmitting(true);
    setResetStatus("");

    try {
      const response = await fetch(`${API_BASE}/api/agent-auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim(), otp }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpVerified(true);
        setResetStatus("✅ OTP verified. Set your new password now.");
      } else {
        setResetStatus("❌ " + (data.message || "OTP verification failed"));
      }
    } catch (error) {
      setResetStatus("❌ Server error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      setResetStatus("❌ Please verify the OTP first.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setResetStatus("❌ Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetStatus("❌ Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    setResetStatus("");

    try {
      const response = await fetch(`${API_BASE}/api/agent-auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp,
          newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        resetForgotFlow();
        setShowForgotPopup(false);
        setFormData((prev) => ({ ...prev, password: "" }));
        setErrorStatus("✅ Password updated successfully. You can now login.");
      } else {
        setResetStatus("❌ " + (data.message || "Password update failed"));
      }
    } catch (error) {
      setResetStatus("❌ Server error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)" }}
    >
      {/* Navbar */}
      <nav
        style={{ background: "rgba(255,255,255,0.8)", borderBottom: "1px solid #fdd9c8", backdropFilter: "blur(10px)" }}
        className="flex items-center justify-between px-4 sm:px-8 py-4 shadow-sm"
      >
        <div
          style={{ color: "#c2511f" }}
          className="text-lg sm:text-xl font-extrabold tracking-wide cursor-pointer"
          onClick={() => navigate("/")}
        >
          DWELLAGENT
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #fdd9c8", color: "#c2511f" }}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full shadow-md text-xs sm:text-sm font-bold hover:shadow-lg transition"
        >
          ← Back
        </button>
      </nav>

      {/* Main */}
      <div className="flex flex-1 items-center justify-center px-4 py-6 sm:py-12">
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 lg:gap-12 items-center">

          {/* Left */}
          <div className="flex-1 hidden md:flex flex-col gap-5 text-left">
            <div
              style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
            >
              💼
            </div>
            <h1 style={{ color: "#7c2d12" }} className="text-3xl lg:text-4xl font-extrabold leading-tight">
              Agent Portal
            </h1>
            <p style={{ color: "#a8674a" }} className="text-sm lg:text-base leading-relaxed">
              Log in to access your properties, lead lists, customer
              requirements, and match profiles across your assigned areas.
            </p>
            <div className="flex flex-col gap-3 mt-1">
              {[
                { icon: "📈", text: "Track hot property leads instantly" },
                { icon: "👥", text: "Match buyer requirements directly" },
                { icon: "🛡️", text: "Verified agent network features" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{ background: "#fff", border: "1px solid #fdd9c8" }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-sm text-sm font-medium text-orange-900"
                >
                  <span>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Login Card */}
          <div
            style={{ background: "#fff", border: "1px solid #fdd9c8" }}
            className="w-full md:flex-1 rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col gap-5 shadow-lg"
          >
            <div>
              <div
                style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow mb-3"
              >
                🔐
              </div>
              <h2 style={{ color: "#7c2d12" }} className="text-xl sm:text-2xl font-extrabold">
                Agent Login
              </h2>
              <p style={{ color: "#a8674a" }} className="mt-1 text-xs sm:text-sm">
                Provide credentials to sign in to your real estate portal
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1 text-left">
                <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase tracking-wide">
                  Login ID or Email
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter login ID or email"
                  value={formData.username}
                  onChange={handleChange}
                  style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                  className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50/50 w-full placeholder-orange-300"
                />
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label style={{ color: "#7c2d12" }} className="text-[11px] font-bold uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                  className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50/50 w-full placeholder-orange-300"
                />
              </div>

              {errorStatus && (
                <p style={{ color: errorStatus.startsWith("✅") ? "#16a34a" : "#ef4444" }}
                  className="text-sm font-medium">
                  {errorStatus}
                </p>
              )}

              <div className="flex flex-col gap-3 mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
                  className="w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition disabled:opacity-70"
                >
                  {isSubmitting ? "Logging in..." : "Login →"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/agent-register")}
                  style={{ borderColor: "#fdd9c8", color: "#c2511f" }}
                  className="w-full border-2 py-3 rounded-xl text-sm font-bold hover:bg-orange-50 transition bg-white"
                >
                  Register New Account
                </button>

                <div className="text-center mt-1">
                  <button
                    type="button"
                    onClick={() => { setShowForgotPopup(true); resetForgotFlow(); }}
                    style={{ color: "#e8724a" }}
                    className="text-sm font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <p style={{ color: "#d4a090" }} className="text-xs sm:text-sm text-center pb-6">
        © 2026 DwellAgent
      </p>

      {/* Forgot Password Popup */}
      {showForgotPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(124, 45, 18, 0.3)", backdropFilter: "blur(4px)" }}
        >
          <div
            style={{ background: "#fff", border: "1px solid #fdd9c8" }}
            className="w-full max-w-md rounded-3xl p-8 shadow-2xl mx-4 relative"
          >
            <button
              onClick={() => { setShowForgotPopup(false); resetForgotFlow(); }}
              style={{ color: "#a8674a" }}
              className="absolute right-5 top-4 text-2xl hover:text-red-500 transition"
            >
              ×
            </button>

            <div
              style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow mb-4"
            >
              🔑
            </div>

            <h2 style={{ color: "#7c2d12" }} className="text-xl font-extrabold mb-1">
              Forgot Password
            </h2>
            <p style={{ color: "#a8674a" }} className="text-sm mb-6">
              {!otpGenerated
                ? "Enter your registered email to receive an OTP."
                : !otpVerified
                ? "Enter the OTP sent to your email."
                : "Set your new password."}
            </p>

            <div style={{ background: "#fdd9c8" }} className="w-full h-px mb-6" />

            {!otpGenerated ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => { setForgotEmail(e.target.value); setResetStatus(""); }}
                    placeholder="Enter your email"
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50"
                  />
                </div>
                <button
                  onClick={handleGenerateOTP}
                  disabled={isSubmitting}
                  style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
                  className="w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition disabled:opacity-70"
                >
                  {isSubmitting ? "Sending..." : "Send OTP →"}
                </button>
              </div>
            ) : !otpVerified ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                    Enter OTP (5 digits)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setResetStatus(""); }}
                    placeholder="Enter OTP"
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 tracking-widest text-center text-lg"
                  />
                </div>
                <button
                  onClick={handleVerifyOTP}
                  disabled={isSubmitting}
                  style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
                  className="w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition disabled:opacity-70"
                >
                  {isSubmitting ? "Verifying..." : "Verify OTP →"}
                </button>
                <button
                  type="button"
                  onClick={handleGenerateOTP}
                  disabled={isSubmitting}
                  style={{ color: "#c2511f" }}
                  className="text-sm font-semibold hover:underline text-center"
                >
                  Resend OTP
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setResetStatus(""); }}
                    placeholder="Min 6 characters"
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setResetStatus(""); }}
                    placeholder="Repeat password"
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
                  className="w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition disabled:opacity-70"
                >
                  {isSubmitting ? "Updating..." : "Update Password →"}
                </button>
              </form>
            )}

            {resetStatus && (
              <p
                style={{ color: resetStatus.startsWith("✅") ? "#16a34a" : "#ef4444" }}
                className="mt-4 text-sm font-medium"
              >
                {resetStatus}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentLogin;
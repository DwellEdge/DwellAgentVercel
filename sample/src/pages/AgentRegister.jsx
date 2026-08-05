import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Strip SQL injection patterns from text inputs
const sanitizeInput = (val) =>
  val.replace(/(['";\\]|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION)\b)/gi, "");

export default function AgentRegister() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5002";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    officeAddress: "",
    homeAddress: "",
    password: "",
    confirmPassword: "",
    referral: "",
  });

  const [photo, setPhoto] = useState(null);
  const [idDocument, setIdDocument] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [status, setStatus] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (field, value) => {
    const sanitized = ["firstName", "lastName", "officeAddress", "homeAddress"].includes(field)
      ? sanitizeInput(value)
      : value;
    setForm((prev) => ({ ...prev, [field]: sanitized }));
    setStatus("");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      setStatus("❌ Agent photo must be a JPEG or PNG file");
      e.target.value = "";
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setStatus("");
  };

  const handleIdDocChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setStatus("❌ ID document must be a JPEG, PNG, or PDF file");
      e.target.value = "";
      return;
    }
    setIdDocument(file);
    setStatus("");
  };

  const handleSubmit = async () => {
    const {
      firstName, lastName, email, mobileNumber,
      officeAddress, homeAddress, password, confirmPassword, referral,
    } = form;

    // Frontend validations
    if (!firstName.trim() || !lastName.trim()) {
      setStatus("❌ Please enter agent name"); return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus("❌ Please enter a valid email address"); return;
    }
    if (!/^\d{10}$/.test(mobileNumber.trim())) {
      setStatus("❌ Enter a valid 10-digit mobile number"); return;
    }
    if (!officeAddress.trim()) {
      setStatus("❌ Please enter office address"); return;
    }
    if (!homeAddress.trim()) {
      setStatus("❌ Please enter home address"); return;
    }
    if (!photo) {
      setStatus("❌ Please upload agent photo (JPEG or PNG)"); return;
    }
    if (!idDocument) {
      setStatus("❌ Please upload ID document (JPEG, PNG, or PDF)"); return;
    }
    if (!password.trim() || password.length < 6) {
      setStatus("❌ Password must be at least 6 characters"); return;
    }
    if (password !== confirmPassword) {
      setStatus("❌ Passwords do not match"); return;
    }

    setStatus("Registering...");

    try {
      const formData = new FormData();
      formData.append("firstName", firstName.trim());
      formData.append("lastName", lastName.trim());
      formData.append("email", email.trim());
      formData.append("mobileNumber", mobileNumber.trim());
      formData.append("officeAddress", officeAddress.trim());
      formData.append("homeAddress", homeAddress.trim());
      formData.append("password", password);
      formData.append("referral", referral.trim());
      formData.append("photo", photo);
      formData.append("idDocument", idDocument);

      const res = await fetch(`${API_BASE}/api/agent-auth/register`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setStatus("");
        setShowSuccess(true);
      } else {
        setStatus("❌ " + (data.message || "Registration failed"));
      }
    } catch (err) {
      setStatus("❌ Server error. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)" }}
    >
      <nav
        style={{ background: "rgba(255,255,255,0.8)", borderBottom: "1px solid #fdd9c8", backdropFilter: "blur(10px)" }}
        className="flex items-center justify-between px-8 py-4 shadow-sm"
      >
        <div
          style={{ color: "#c2511f" }}
          className="text-xl font-extrabold tracking-wide cursor-pointer"
          onClick={() => navigate("/")}
        >
          DWELLAGENT
        </div>
        <button
          onClick={() => navigate("/agent")}
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #fdd9c8", color: "#c2511f" }}
          className="flex items-center gap-2 px-4 py-2 rounded-full shadow-md text-sm font-bold hover:shadow-lg transition"
        >
          ← Back
        </button>
      </nav>

      <div className="flex flex-1 justify-center px-4 py-12">
        <div className="w-full max-w-2xl flex flex-col gap-6">

          <div>
            <div
              style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow mb-3"
            >
              📋
            </div>
            <h1 style={{ color: "#7c2d12" }} className="text-3xl font-extrabold">Agent Registration</h1>
            <p style={{ color: "#a8674a" }} className="mt-1 text-sm">Fill in your details to register as an agent</p>
          </div>

          <div
            style={{ background: "#fff", border: "1px solid #fdd9c8" }}
            className="rounded-3xl p-8 flex flex-col gap-5 shadow-lg"
          >
            {/* Agent Photo */}
            <div className="flex flex-col gap-2">
              <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                Agent Photo * <span style={{ color: "#a8674a", fontWeight: "normal", textTransform: "none" }}>(JPEG or PNG only)</span>
              </label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover"
                    style={{ border: "2px solid #fdd9c8" }}
                  />
                ) : (
                  <div
                    style={{ background: "#fff8f5", border: "2px dashed #fdd9c8" }}
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl"
                  >
                    👤
                  </div>
                )}
                <label
                  style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)", color: "#fff" }}
                  className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer hover:opacity-90 transition"
                >
                  Upload Photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                {photo && <span style={{ color: "#a8674a" }} className="text-xs">{photo.name}</span>}
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                  First Name *
                </label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="First name"
                  style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                  className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Last name"
                  style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                  className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter your email"
                style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
              />
            </div>

            {/* Phone with +91 prefix */}
            <div className="flex flex-col gap-1">
              <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                Phone Number *
              </label>
              <div className="flex gap-2">
                <div
                  style={{ borderColor: "#fdd9c8", color: "#7c2d12", background: "#fff0e8" }}
                  className="border-2 rounded-xl px-4 py-3 text-sm font-bold flex items-center select-none"
                >
                  +91
                </div>
                <input
                  type="tel"
                  value={form.mobileNumber}
                  onChange={(e) => handleChange("mobileNumber", e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  inputMode="numeric"
                  style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                  className="flex-1 border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
                />
              </div>
            </div>

            {/* Office Address */}
            <div className="flex flex-col gap-1">
              <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                Agent Office Address *
              </label>
              <textarea
                value={form.officeAddress}
                onChange={(e) => handleChange("officeAddress", e.target.value)}
                placeholder="Enter office address"
                rows={2}
                style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300 resize-none"
              />
            </div>

            {/* Home Address */}
            <div className="flex flex-col gap-1">
              <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                Agent Home Address *
              </label>
              <textarea
                value={form.homeAddress}
                onChange={(e) => handleChange("homeAddress", e.target.value)}
                placeholder="Enter home address"
                rows={2}
                style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300 resize-none"
              />
            </div>

            {/* ID Document */}
            <div className="flex flex-col gap-2">
              <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                Agent ID Document * <span style={{ color: "#a8674a", fontWeight: "normal", textTransform: "none" }}>(JPEG, PNG, or PDF only)</span>
              </label>
              <div
                style={{ background: "#fff8f5", border: "2px dashed #fdd9c8" }}
                className="rounded-xl p-4 flex items-center gap-4"
              >
                <span className="text-2xl">📄</span>
                <div className="flex-1">
                  {idDocument ? (
                    <p style={{ color: "#c2511f" }} className="text-sm font-semibold">{idDocument.name}</p>
                  ) : (
                    <p style={{ color: "#a8674a" }} className="text-sm">No file chosen</p>
                  )}
                  <p style={{ color: "#d4a090" }} className="text-xs mt-0.5">PDF, JPG, PNG accepted</p>
                </div>
                <label
                  style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)", color: "#fff" }}
                  className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer hover:opacity-90 transition whitespace-nowrap"
                >
                  Choose File
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleIdDocChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Referral */}
            <div className="flex flex-col gap-1">
              <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                Referral <span style={{ color: "#a8674a", fontWeight: "normal", textTransform: "none" }}>(optional — enter referral ID or agent name)</span>
              </label>
              <input
                type="text"
                value={form.referral}
                onChange={(e) => handleChange("referral", e.target.value)}
                placeholder="e.g. AgentA01 or Agent Name"
                style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                  Password *
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Min 6 characters"
                  style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                  className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  placeholder="Repeat password"
                  style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                  className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
                />
              </div>
            </div>

            {status && (
              <p
                style={{ color: status.startsWith("❌") ? "#ef4444" : "#a8674a" }}
                className="text-sm font-medium"
              >
                {status}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={status === "Registering..."}
              style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
              className="w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition disabled:cursor-not-allowed"
            >
              {status === "Registering..." ? "Registering..." : "Register →"}
            </button>

            <p style={{ color: "#a8674a" }} className="text-xs text-center">
              Already have an account?{" "}
              <span
                style={{ color: "#c2511f" }}
                className="font-bold cursor-pointer hover:underline"
                onClick={() => navigate("/agent-login")}
              >
                Login here
              </span>
            </p>
          </div>
        </div>
      </div>

      <p style={{ color: "#d4a090" }} className="text-sm text-center pb-6">
        © 2026 DwellAgent
      </p>

      {/* Success Popup */}
      {showSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(124, 45, 18, 0.3)", backdropFilter: "blur(4px)" }}
        >
          <div
            style={{ background: "#fff", border: "1px solid #fdd9c8" }}
            className="rounded-3xl p-8 shadow-2xl w-full max-w-md text-center mx-4"
          >
            <div
              style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg mx-auto mb-4"
            >
              ✅
            </div>
            <h2 style={{ color: "#7c2d12" }} className="text-2xl font-extrabold mb-3">Registered!</h2>
            <p style={{ color: "#a8674a" }} className="text-sm mb-2 leading-relaxed">
              Your registration was successful. Your login details have been sent to your registered mobile number via SMS.
            </p>
            <p style={{ color: "#c2511f" }} className="text-xs mb-6 font-semibold">
              Please check your SMS for your Login ID.
            </p>
            <div style={{ background: "#fdd9c8" }} className="w-full h-px mb-6" />
            <button
              onClick={() => navigate("/agent-login")}
              style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
              className="w-full text-white px-8 py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition"
            >
              Go to Login →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
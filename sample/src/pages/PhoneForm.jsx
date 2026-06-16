import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function PhoneForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const agents = location.state?.agents || [];

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setStatus("❌ Please enter your name");
      return;
    }

    if (phone.length !== 10 || isNaN(phone)) {
      setStatus("❌ Enter a valid 10-digit number");
      return;
    }

    setStatus("Sending...");

    try {
      // Save to DB
      await fetch("http://localhost:5002/api/payment-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: phone, firstName: name }),
      });

      // Send WhatsApp & SMS
      const res = await fetch("http://localhost:5002/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, agents }),
      });

      const data = await res.json();

      if (data.success) {
        setShowSuccessPopup(true);
        setName("");
        setPhone("");
        setStatus("");
      } else {
        setStatus("❌ Failed: " + data.error);
      }
    } catch (err) {
      setStatus("❌ Server error");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          background: "rgba(255,255,255,0.8)",
          borderBottom: "1px solid #fdd9c8",
          backdropFilter: "blur(10px)",
        }}
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
          onClick={() => navigate(-1)}
          style={{
            background: "rgba(255,255,255,0.9)",
            border: "1px solid #fdd9c8",
            color: "#c2511f",
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full shadow-md text-sm font-bold hover:shadow-lg transition"
        >
          ← Back
        </button>
      </nav>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl flex gap-12 items-center">

          {/* Left */}
          <div className="flex-1 hidden md:flex flex-col gap-6">
            <div
              style={{
                background: "linear-gradient(135deg, #e8724a, #f59e6c)",
              }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
            >
              📱
            </div>
            <h1
              style={{ color: "#7c2d12" }}
              className="text-4xl font-extrabold leading-tight"
            >
              Stay<br />Connected
            </h1>
            <p
              style={{ color: "#a8674a" }}
              className="text-base leading-relaxed"
            >
              Enter your name and phone number to receive instant agent contacts
              and property updates via SMS & WhatsApp.
            </p>
            {[
              { icon: "💬", text: "Instant WhatsApp notifications" },
              { icon: "📩", text: "SMS alerts for new listings" },
              { icon: "🏠", text: "Property updates in real time" },
            ].map((item, i) => (
              <div
                key={i}
                style={{ background: "#fff", border: "1px solid #fdd9c8" }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-sm text-sm font-medium text-orange-900"
              >
                <span>{item.icon}</span> {item.text}
              </div>
            ))}

            {/* Selected agents preview */}
            {agents.length > 0 && (
              <div
                style={{ background: "#fff7f3", border: "1px solid #fdd9c8" }}
                className="rounded-2xl p-4 mt-2"
              >
                <p
                  style={{ color: "#c2511f" }}
                  className="text-sm font-bold mb-3"
                >
                  📋 Selected Agents ({agents.length})
                </p>
                <div className="flex flex-col gap-2">
                  {agents.map((agent) => (
                    <div
                      key={agent._id}
                      style={{ borderLeft: "3px solid #e8724a" }}
                      className="pl-3"
                    >
                      <p
                        style={{ color: "#7c2d12" }}
                        className="text-sm font-semibold"
                      >
                        {agent.firstName} {agent.lastName}
                      </p>
                      <p style={{ color: "#a8674a" }} className="text-xs">
                        📍 {agent.area} &nbsp;|&nbsp; 📞 {agent.mobileNumber}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right - Form */}
          <div
            style={{ background: "#fff", border: "1px solid #fdd9c8" }}
            className="flex-1 rounded-3xl p-10 flex flex-col gap-5 shadow-lg"
          >
            <div>
              <div
                style={{
                  background: "linear-gradient(135deg, #e8724a, #f59e6c)",
                }}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow mb-3"
              >
                📱
              </div>
              <h2
                style={{ color: "#7c2d12" }}
                className="text-2xl font-extrabold"
              >
                Get In Touch
              </h2>
              <p style={{ color: "#a8674a" }} className="mt-1 text-sm">
                Submit your details and we'll reach out via SMS & WhatsApp
              </p>
            </div>

            {/* Name Input */}
            <div className="flex flex-col gap-1">
              <label
                style={{ color: "#7c2d12" }}
                className="text-xs font-bold uppercase tracking-wide"
              >
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setStatus("");
                }}
                placeholder="Enter your full name"
                style={{
                  borderColor:
                    status.startsWith("❌") && !name.trim()
                      ? "#f87171"
                      : "#fdd9c8",
                  color: "#7c2d12",
                }}
                className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 w-full placeholder-orange-300"
              />
            </div>

            {/* Phone Input */}
            <div className="flex flex-col gap-1">
              <label
                style={{ color: "#7c2d12" }}
                className="text-xs font-bold uppercase tracking-wide"
              >
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ""));
                  setStatus("");
                }}
                placeholder="Mobile Number (10 digits)"
                maxLength={10}
                inputMode="numeric"
                style={{
                  borderColor:
                    status.startsWith("❌") && name.trim()
                      ? "#f87171"
                      : "#fdd9c8",
                  color: "#7c2d12",
                }}
                className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 w-full placeholder-orange-300"
              />
            </div>

            {status && (
              <p
                style={{
                  color: status.startsWith("❌")
                    ? "#ef4444"
                    : status === "Sending..."
                    ? "#a8674a"
                    : "#16a34a",
                }}
                className="text-sm -mt-2 font-medium"
              >
                {status}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={status === "Sending..."}
              style={{
                background:
                  status === "Sending..."
                    ? "#f5c4a8"
                    : "linear-gradient(135deg, #e8724a, #f59e6c)",
              }}
              className="w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition disabled:cursor-not-allowed"
            >
              {status === "Sending..." ? "Sending..." : "Submit →"}
            </button>
          </div>
        </div>
      </div>

      <p style={{ color: "#d4a090" }} className="text-sm text-center pb-6">
        © 2026 DwellAgent
      </p>

      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-3xl p-8 shadow-xl w-full max-w-md text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-3">Success</h2>
            <p className="text-gray-600 mb-6">
              SMS and WhatsApp Message Sent to your mobile successfully.
            </p>
            <button
              onClick={() => {
                setShowSuccessPopup(false);
                navigate("/");
              }}
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
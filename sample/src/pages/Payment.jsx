import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const agents = location.state?.agents || [];
  const city = location.state?.city || "";
  const area = location.state?.area || "";
  const propertyTypeId = location.state?.propertyTypeId || "";
  const name = location.state?.name || "";
  const phone = location.state?.phone || "";

  const amountPerAgent = 30;
  const totalAmount = agents.length * amountPerAgent;

  const [sending, setSending] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "https://dwellagentvercel.onrender.com";

  useEffect(() => {
    if (!location.state || agents.length === 0) {
      navigate("/home", { replace: true });
    }
  }, []);

  const handleProceedToPay = async () => {
    setSending(true);
    setErrorMsg("");

    try {
      // 1. Send WhatsApp + SMS
      const res = await fetch(`${API_BASE}/api/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, agents }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMsg("❌ Failed to send message: " + data.error);
        setSending(false);
        return;
      }

      // 2. Save transaction — only after messages confirmed sent
      try {
        const agentSelections = agents.map((agent) => ({
          agentId: agent._id,
          propertyTypeId: agent.propertyTypeId || "",
          propertyType: agent.propertyTypeName || "",
        }));

        const propertyTypeSummary = [
          ...new Set(agentSelections.map((s) => s.propertyType).filter(Boolean)),
        ].join(", ");

        await fetch(`${API_BASE}/api/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionId: `TXN${Date.now()}`,
            city,
            area,
            propertyType: propertyTypeSummary,
            agentSelections,
            noOfAgentsSelected: agents.length,
            agentIds: agents.map((agent) => agent._id),
            mobileNumber: phone,
            amountReceived: agents.length * 30,
          }),
        });
      } catch (err) {
        console.error("Transaction save error", err);
        // don't block success popup — messages were already sent
      }

      setShowSuccessPopup(true);
    } catch (err) {
      setErrorMsg("❌ Server error. Please try again.");
    } finally {
      setSending(false);
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
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #fdd9c8", color: "#c2511f" }}
          className="flex items-center gap-2 px-4 py-2 rounded-full shadow-md text-sm font-bold hover:shadow-lg transition"
        >
          ← Back
        </button>
      </nav>

      <div className="flex flex-1 justify-center px-4 py-12">
        <div className="w-full max-w-3xl flex flex-col gap-6">

          {/* Header */}
          <div>
            <div
              style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow mb-3"
            >
              💳
            </div>
            <h1 style={{ color: "#7c2d12" }} className="text-3xl font-extrabold">Payment Summary</h1>
            <p style={{ color: "#a8674a" }} className="mt-1 text-sm">Review your selected agents and total amount</p>
          </div>

          {/* Customer details summary */}
          {(name || phone) && (
            <div
              style={{ background: "#fff8f5", border: "1px solid #fdd9c8" }}
              className="rounded-2xl px-6 py-4 flex gap-6 text-sm"
            >
              {name && (
                <div>
                  <span style={{ color: "#a8674a" }}>Name: </span>
                  <span style={{ color: "#7c2d12" }} className="font-semibold">{name}</span>
                </div>
              )}
              {phone && (
                <div>
                  <span style={{ color: "#a8674a" }}>Mobile: </span>
                  <span style={{ color: "#7c2d12" }} className="font-semibold">{phone}</span>
                </div>
              )}
            </div>
          )}

          {/* Table */}
          <div
            style={{ background: "#fff", border: "1px solid #fdd9c8" }}
            className="rounded-3xl overflow-hidden shadow-lg"
          >
            <div
              style={{ background: "#fff8f5", borderBottom: "1px solid #fdd9c8" }}
              className="grid grid-cols-2 px-6 py-4"
            >
              <div style={{ color: "#7c2d12" }} className="font-bold text-sm">Selected Agents</div>
              <div style={{ color: "#7c2d12" }} className="font-bold text-sm text-right">Amount</div>
            </div>

            {agents.map((agent) => (
              <div
                key={agent.rowKey || agent._id}
                style={{ borderBottom: "1px solid #fdd9c8" }}
                className="grid grid-cols-2 px-6 py-4"
              >
                <div style={{ color: "#7c2d12" }} className="text-sm font-medium">
                  {agent.firstName} {agent.lastName}
                  {agent.propertyTypeName && (
                    <span style={{ color: "#a8674a" }} className="ml-2 text-xs font-normal">
                      ({agent.propertyTypeName})
                    </span>
                  )}
                </div>
                <div style={{ color: "#e8724a" }} className="text-sm font-semibold text-right">
                  ₹{amountPerAgent}
                </div>
              </div>
            ))}

            <div style={{ background: "#fff8f5" }} className="grid grid-cols-2 px-6 py-5">
              <div style={{ color: "#7c2d12" }} className="font-extrabold text-lg">Total Amount</div>
              <div style={{ color: "#e8724a" }} className="font-extrabold text-lg text-right">₹{totalAmount}</div>
            </div>
          </div>

          {errorMsg && (
            <p className="text-sm text-center font-medium" style={{ color: "#ef4444" }}>
              {errorMsg}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleProceedToPay}
              disabled={sending}
              style={
                !sending
                  ? { background: "linear-gradient(135deg, #e8724a, #f59e6c)" }
                  : { background: "#f5c4a8" }
              }
              className="flex-1 text-white py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition disabled:cursor-not-allowed"
            >
              {sending ? "Sending..." : "Proceed To Pay →"}
            </button>
            <button
              onClick={() => navigate(-1)}
              style={{ borderColor: "#fdd9c8", color: "#c2511f" }}
              className="flex-1 border-2 py-3 rounded-xl text-sm font-bold hover:bg-orange-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(124, 45, 18, 0.3)", backdropFilter: "blur(4px)" }}
        >
          <div
            style={{ background: "#fff", border: "1px solid #fdd9c8" }}
            className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-3xl p-8 shadow-2xl mx-4"
          >
            <div
              style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow mb-4"
            >
              ✅
            </div>

            <h2 style={{ color: "#7c2d12" }} className="text-3xl font-extrabold mb-2">Thank You!</h2>
            <p style={{ color: "#a8674a" }} className="text-sm mb-6">
              SMS and WhatsApp message sent to your mobile successfully 💐
            </p>

            <div style={{ background: "#fdd9c8" }} className="w-full h-px mb-6" />

            <div className="flex flex-col gap-4">
              {agents.map((agent) => (
                <div
                  key={agent.rowKey || agent._id}
                  style={{ background: "#fff8f5", border: "1px solid #fdd9c8" }}
                  className="rounded-2xl p-4"
                >
                  <div style={{ color: "#7c2d12" }} className="font-bold text-sm">
                    {agent.firstName} {agent.lastName}
                  </div>
                  <div style={{ color: "#a8674a" }} className="text-xs mt-1">📞 {agent.mobileNumber}</div>
                  <div style={{ color: "#a8674a" }} className="text-xs mt-1">📍 {agent.address}</div>
                  <div style={{ color: "#a8674a" }} className="text-xs mt-1">🏘️ {agent.area}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/home")}
              style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
              className="mt-6 w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition"
            >
              Back to Home →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
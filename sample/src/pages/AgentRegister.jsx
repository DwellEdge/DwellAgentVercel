import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

// Strip SQL injection patterns from text inputs
const sanitizeInput = (val) =>
  val.replace(/(['";\\]|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION)\b)/gi, "");

const planOptions = [
  { id: "yearly", label: "Yearly", amount: 1, duration: "1 year" },
  { id: "twoYear", label: "Two-Year", amount: 2, duration: "2 years" },
  { id: "threeYear", label: "Three-Year", amount: 3, duration: "3 years" },
];

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
  const [step, setStep] = useState("form");
  const [selectedPlan, setSelectedPlan] = useState(planOptions[0]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const validateRegistrationForm = () => {
    const {
      firstName, lastName, email, mobileNumber,
      officeAddress, homeAddress, password, confirmPassword,
    } = form;

    if (!firstName.trim() || !lastName.trim()) {
      setStatus("❌ Please enter agent name"); return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus("❌ Please enter a valid email address"); return false;
    }
    if (!/^\d{10}$/.test(mobileNumber.trim())) {
      setStatus("❌ Enter a valid 10-digit mobile number"); return false;
    }
    if (!officeAddress.trim()) {
      setStatus("❌ Please enter office address"); return false;
    }
    if (!homeAddress.trim()) {
      setStatus("❌ Please enter home address"); return false;
    }
    if (!photo) {
      setStatus("❌ Please upload agent photo (JPEG or PNG)"); return false;
    }
    if (!idDocument) {
      setStatus("❌ Please upload ID document (JPEG, PNG, or PDF)"); return false;
    }
    if (!password.trim() || password.length < 6) {
      setStatus("❌ Password must be at least 6 characters"); return false;
    }
    if (password !== confirmPassword) {
      setStatus("❌ Passwords do not match"); return false;
    }

    setStatus("");
    return true;
  };

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

  const submitRegistration = async () => {
    const {
      firstName, lastName, email, mobileNumber,
      officeAddress, homeAddress, password, referral,
    } = form;

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

  const handleContinueToPlans = () => {
    if (!validateRegistrationForm()) return;
    setStep("plans");
  };

  const handlePlanContinue = () => {
    if (!selectedPlan) {
      setStatus("❌ Please select a plan");
      return;
    }
    setStep("payment");
    setStatus("");
  };

  const handleRazorpayPayment = async () => {
    if (!selectedPlan) {
      setStatus("❌ Please select a valid plan");
      return;
    }

    setPaymentLoading(true);
    setStatus("Preparing payment...");

    try {
      const orderRes = await fetch(`${API_BASE}/api/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedPlan.amount }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.message || "Order creation failed");
      }

      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          script.onerror = () => reject(new Error("Razorpay script failed to load"));
          document.body.appendChild(script);
        });
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "DwellAgent",
        description: `Agent registration plan - ${selectedPlan.label}`,
        order_id: orderData.order.id,
        handler: async function () {
          await submitRegistration();
          setPaymentLoading(false);
        },
        prefill: {
          name: `${form.firstName} ${form.lastName}`.trim(),
          contact: form.mobileNumber,
        },
        theme: { color: "#e8724a" },
        modal: {
          ondismiss: () => {
            setStatus("❌ Payment cancelled. Please try again.");
            setPaymentLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setStatus("Waiting for payment...");
      setPaymentLoading(false);
    } catch (err) {
      setStatus("❌ Payment gateway error. Please try again.");
      setPaymentLoading(false);
    }
  };

  const renderFormStep = () => (
    <>
      <div>
        <div style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }} className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow mb-3">
          📋
        </div>
        <h1 style={{ color: "#7c2d12" }} className="text-3xl font-extrabold">Agent Registration</h1>
        <p style={{ color: "#a8674a" }} className="mt-1 text-sm">Fill in your details to register as an agent</p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #fdd9c8" }} className="rounded-3xl p-8 flex flex-col gap-5 shadow-lg">
        <div className="flex flex-col gap-2">
          <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
            Agent Photo * <span style={{ color: "#a8674a", fontWeight: "normal", textTransform: "none" }}>(JPEG or PNG only)</span>
          </label>
          <div className="flex items-center gap-4">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover" style={{ border: "2px solid #fdd9c8" }} />
            ) : (
              <div style={{ background: "#fff8f5", border: "2px dashed #fdd9c8" }} className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl">👤</div>
            )}
            <label style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)", color: "#fff" }} className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer hover:opacity-90 transition">
              Upload Photo
              <input type="file" accept="image/jpeg,image/png" onChange={handlePhotoChange} className="hidden" />
            </label>
            {photo && <span style={{ color: "#a8674a" }} className="text-xs">{photo.name}</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">First Name *</label>
            <input type="text" value={form.firstName} onChange={(e) => handleChange("firstName", e.target.value)} placeholder="First name" style={{ borderColor: "#fdd9c8", color: "#7c2d12" }} className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300" />
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Last Name *</label>
            <input type="text" value={form.lastName} onChange={(e) => handleChange("lastName", e.target.value)} placeholder="Last name" style={{ borderColor: "#fdd9c8", color: "#7c2d12" }} className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Email *</label>
          <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="Enter your email" style={{ borderColor: "#fdd9c8", color: "#7c2d12" }} className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300" />
        </div>

        <div className="flex flex-col gap-1">
          <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Phone Number *</label>
          <div className="flex gap-2">
            <div style={{ borderColor: "#fdd9c8", color: "#7c2d12", background: "#fff0e8" }} className="border-2 rounded-xl px-4 py-3 text-sm font-bold flex items-center select-none">+91</div>
            <input type="tel" value={form.mobileNumber} onChange={(e) => handleChange("mobileNumber", e.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile number" maxLength={10} inputMode="numeric" style={{ borderColor: "#fdd9c8", color: "#7c2d12" }} className="flex-1 border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Agent Office Address *</label>
          <textarea value={form.officeAddress} onChange={(e) => handleChange("officeAddress", e.target.value)} placeholder="Enter office address" rows={2} style={{ borderColor: "#fdd9c8", color: "#7c2d12" }} className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300 resize-none" />
        </div>

        <div className="flex flex-col gap-1">
          <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Agent Home Address *</label>
          <textarea value={form.homeAddress} onChange={(e) => handleChange("homeAddress", e.target.value)} placeholder="Enter home address" rows={2} style={{ borderColor: "#fdd9c8", color: "#7c2d12" }} className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300 resize-none" />
        </div>

        <div className="flex flex-col gap-2">
          <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
            Agent ID Document * <span style={{ color: "#a8674a", fontWeight: "normal", textTransform: "none" }}>(JPEG, PNG, or PDF only)</span>
          </label>
          <div style={{ background: "#fff8f5", border: "2px dashed #fdd9c8" }} className="rounded-xl p-4 flex items-center gap-4">
            <span className="text-2xl">📄</span>
            <div className="flex-1">
              {idDocument ? (
                <p style={{ color: "#c2511f" }} className="text-sm font-semibold">{idDocument.name}</p>
              ) : (
                <p style={{ color: "#a8674a" }} className="text-sm"></p>
              )}
              <p style={{ color: "#d4a090" }} className="text-xs mt-0.5">PDF, JPG, PNG accepted</p>
            </div>
            <label style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)", color: "#fff" }} className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer hover:opacity-90 transition whitespace-nowrap">
              Choose File
              <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleIdDocChange} className="hidden" />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Referral <span style={{ color: "#a8674a", fontWeight: "normal", textTransform: "none" }}>(optional — enter referral ID or agent name)</span></label>
          <input type="text" value={form.referral} onChange={(e) => handleChange("referral", e.target.value)} placeholder="e.g. AgentA01 or Agent Name" style={{ borderColor: "#fdd9c8", color: "#7c2d12" }} className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Password *</label>
            <input type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} placeholder="Min 6 characters" style={{ borderColor: "#fdd9c8", color: "#7c2d12" }} className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300" />
          </div>
          <div className="flex flex-col gap-1">
            <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Confirm Password *</label>
            <input type="password" value={form.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} placeholder="Repeat password" style={{ borderColor: "#fdd9c8", color: "#7c2d12" }} className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300" />
          </div>
        </div>

        {status && (
          <p style={{ color: status.startsWith("❌") ? "#ef4444" : "#a8674a" }} className="text-sm font-medium">{status}</p>
        )}

        <button onClick={handleContinueToPlans} style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }} className="w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition disabled:cursor-not-allowed">
          Continue
        </button>

        <p style={{ color: "#a8674a" }} className="text-xs text-center">
          Already have an account? <span style={{ color: "#c2511f" }} className="font-bold cursor-pointer hover:underline" onClick={() => navigate("/agent-login")}>Login here</span>
        </p>
      </div>
    </>
  );

  const renderPlanStep = () => (
    <div style={{ background: "#fff", border: "1px solid #fdd9c8" }} className="rounded-3xl p-8 shadow-lg">
      <div className="mb-6">
        <div style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }} className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow mb-3">💳</div>
        <h2 style={{ color: "#7c2d12" }} className="text-2xl font-extrabold">Choose your plan</h2>
        <p style={{ color: "#a8674a" }} className="mt-2 text-sm">Select the registration plan that suits your needs</p>
      </div>

      <div className="space-y-4">
        {planOptions.map((plan) => {
          const active = selectedPlan?.id === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan)}
              className="w-full text-left rounded-2xl border-2 p-5 transition"
              style={{
                background: active ? "#fff4ee" : "#fffaf7",
                borderColor: active ? "#e8724a" : "#fdd9c8",
                boxShadow: active ? "0 12px 25px rgba(232,114,74,0.12)" : "none",
              }}
            >
              <div className="flex justify-between items-center gap-4">
                <div>
                  <div style={{ color: "#7c2d12" }} className="text-xl font-extrabold">{plan.label}</div>
                  <div style={{ color: "#a8674a" }} className="text-sm">{plan.duration}</div>
                </div>
                <div style={{ color: "#c2511f" }} className="text-2xl font-black">₹{plan.amount}</div>
              </div>
            </button>
          );
        })}
      </div>

      {status && <p style={{ color: "#ef4444" }} className="mt-4 text-sm font-medium">{status}</p>}

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={() => setStep("form")} style={{ borderColor: "#fdd9c8", color: "#c2511f" }} className="flex-1 border-2 py-3 rounded-xl text-sm font-bold hover:bg-orange-50 transition">
          Back
        </button>
        <button type="button" onClick={handlePlanContinue} style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }} className="flex-1 text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition">
          Continue
        </button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div style={{ background: "#fff", border: "1px solid #fdd9c8" }} className="rounded-3xl p-8 shadow-lg">
      <div className="mb-6">
        <div style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }} className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow mb-3">💸</div>
        <h2 style={{ color: "#7c2d12" }} className="text-2xl font-extrabold">Payment</h2>
        <p style={{ color: "#a8674a" }} className="mt-2 text-sm">Pay for your selected plan securely using Razorpay</p>
      </div>

      <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5 mb-5">
        <div className="flex justify-between items-center mb-3">
          <span style={{ color: "#a8674a" }} className="text-sm">Selected plan</span>
          <span style={{ color: "#7c2d12" }} className="font-extrabold">{selectedPlan?.label}</span>
        </div>
        <div className="flex justify-between items-center">
          <span style={{ color: "#a8674a" }} className="text-sm">Amount</span>
          <span style={{ color: "#c2511f" }} className="text-2xl font-black">₹{selectedPlan?.amount}</span>
        </div>
      </div>

      {status && <p style={{ color: status.startsWith("❌") ? "#ef4444" : "#a8674a" }} className="mb-4 text-sm font-medium">{status}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={() => setStep("plans")} style={{ borderColor: "#fdd9c8", color: "#c2511f" }} className="flex-1 border-2 py-3 rounded-xl text-sm font-bold hover:bg-orange-50 transition">
          Back
        </button>
        <button type="button" disabled={paymentLoading} onClick={handleRazorpayPayment} style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }} className="flex-1 text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition disabled:cursor-not-allowed">
          {paymentLoading ? "Processing..." : "Pay with Razorpay"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)" }}>
      <nav style={{ background: "rgba(255,255,255,0.8)", borderBottom: "1px solid #fdd9c8", backdropFilter: "blur(10px)" }} className="flex items-center justify-between px-8 py-4 shadow-sm">
        <div style={{ color: "#c2511f" }} className="text-xl font-extrabold tracking-wide cursor-pointer" onClick={() => navigate("/")}>DWELLAGENT</div>
        <button onClick={() => navigate("/agent")} style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #fdd9c8", color: "#c2511f" }} className="flex items-center gap-2 px-4 py-2 rounded-full shadow-md text-sm font-bold hover:shadow-lg transition">← Back</button>
      </nav>

      <div className="flex flex-1 justify-center px-4 py-12">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          {step === "form" && renderFormStep()}
          {step === "plans" && renderPlanStep()}
          {step === "payment" && renderPaymentStep()}
        </div>
      </div>

      <p style={{ color: "#d4a090" }} className="text-sm text-center pb-6">© 2026 DwellAgent</p>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(124, 45, 18, 0.3)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", border: "1px solid #fdd9c8" }} className="rounded-3xl p-8 shadow-2xl w-full max-w-md text-center mx-4">
            <div style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }} className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg mx-auto mb-4">✅</div>
            <h2 style={{ color: "#7c2d12" }} className="text-2xl font-extrabold mb-3">Welcome!</h2>
            <p style={{ color: "#a8674a" }} className="text-sm mb-2 leading-relaxed">Your agent registration is successful. Your login details and welcome message have been sent via SMS and email.</p>
            <p style={{ color: "#c2511f" }} className="text-xs mb-6 font-semibold">Please check your SMS and email for confirmation.</p>
            <div style={{ background: "#fdd9c8" }} className="w-full h-px mb-6" />
            <button onClick={() => navigate("/agent-login")} style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }} className="w-full text-white px-8 py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition">Go to Login →</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
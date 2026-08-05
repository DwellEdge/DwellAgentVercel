import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FACING_OPTIONS = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];
const PROPERTY_TYPE_OPTIONS = ["Apartment", "Villa", "Plot", "Independent House", "Commercial", "Other"];
const PURPOSE_OPTIONS = ["Rent", "Lease", "Sale"];

export default function AgentDashboard() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5002";

  const [agent, setAgent] = useState(null);
  const [properties, setProperties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    propertyAvailableFor: "Rent",
    propertyCost: "",
    propertyAddress: "",
    area: "",
    city: "",
    pinCode: "",
    facing: "",
    propertyType: "",
    carParking: false,
    twoWheelerParking: false,
    landmark: "",
    amenities: {
      gym: false,
      pool: false,
      badminton: false,
      security: false,
      others: "",
    },
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("agentUser");
    if (!stored) {
      navigate("/agent-login", { replace: true });
      return;
    }
    const agentData = JSON.parse(stored);
    setAgent(agentData);
    fetchProperties(agentData.agentId);
  }, []);

  const fetchProperties = async (agentId) => {
    try {
      const res = await fetch(`${API_BASE}/api/properties/${agentId}`);
      const data = await res.json();
      setProperties(data || []);
    } catch (err) {
      console.error("Failed to fetch properties:", err.message);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setStatus("");
  };

  const handleAmenityChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      amenities: { ...prev.amenities, [key]: value },
    }));
  };

  const handleSubmit = async () => {
    const { propertyAvailableFor, propertyCost, propertyAddress, area, city, pinCode } = form;

    if (!propertyAvailableFor) { setStatus("❌ Please select purpose"); return; }
    if (!propertyCost || isNaN(propertyCost) || Number(propertyCost) <= 0) { setStatus("❌ Please enter a valid property cost"); return; }
    if (!propertyAddress.trim()) { setStatus("❌ Please enter property address"); return; }
    if (!area.trim()) { setStatus("❌ Please enter area"); return; }
    if (!city.trim()) { setStatus("❌ Please enter city"); return; }
    if (!/^\d{6}$/.test(pinCode.trim())) { setStatus("❌ Please enter a valid 6-digit pin code"); return; }

    setStatus("Submitting...");

    try {
      const res = await fetch(`${API_BASE}/api/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: agent.agentId,
          ...form,
          propertyCost: Number(form.propertyCost),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("");
        setShowSuccess(true);
        setShowForm(false);
        fetchProperties(agent.agentId);
        // Reset form
        setForm({
          propertyAvailableFor: "Rent",
          propertyCost: "",
          propertyAddress: "",
          area: "",
          city: "",
          pinCode: "",
          facing: "",
          propertyType: "",
          carParking: false,
          twoWheelerParking: false,
          landmark: "",
          amenities: { gym: false, pool: false, badminton: false, security: false, others: "" },
        });
      } else {
        setStatus("❌ " + (data.message || "Failed to add property"));
      }
    } catch (err) {
      setStatus("❌ Server error. Please try again.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("agentUser");
    navigate("/agent-login");
  };

  const daysLeft = (expiryDate) => {
    const diff = new Date(expiryDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (!agent) return null;

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
        <div className="flex items-center gap-3">
          <span style={{ color: "#a8674a" }} className="text-sm font-medium">
            Welcome, {agent.firstName} {agent.lastName}
          </span>
          <button
            onClick={handleLogout}
            style={{ border: "1px solid #fdd9c8", color: "#c2511f", background: "#fff" }}
            className="px-4 py-2 rounded-full text-sm font-bold hover:bg-orange-50 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="flex flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl flex flex-col gap-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ color: "#7c2d12" }} className="text-3xl font-extrabold">My Properties</h1>
              <p style={{ color: "#a8674a" }} className="mt-1 text-sm">
                {properties.length} active {properties.length === 1 ? "listing" : "listings"}
              </p>
            </div>
            <button
              onClick={() => { setShowForm(true); setStatus(""); }}
              style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
              className="text-white px-6 py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition"
            >
              + Add Property
            </button>
          </div>

          {/* Properties list */}
          {properties.length === 0 && !showForm && (
            <div
              style={{ background: "#fff", border: "1px solid #fdd9c8" }}
              className="rounded-3xl p-10 text-center shadow-lg"
            >
              <div className="text-5xl mb-4">🏠</div>
              <h3 style={{ color: "#7c2d12" }} className="text-xl font-extrabold mb-2">No Properties Yet</h3>
              <p style={{ color: "#a8674a" }} className="text-sm">
                Click "Add Property" to list your first property.
              </p>
            </div>
          )}

          {properties.length > 0 && (
            <div className="flex flex-col gap-4">
              {properties.map((prop) => (
                <div
                  key={prop._id}
                  style={{ background: "#fff", border: "1px solid #fdd9c8" }}
                  className="rounded-2xl p-5 shadow-md flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)", color: "#fff" }}
                          className="text-xs font-bold px-3 py-1 rounded-full"
                        >
                          {prop.propertyAvailableFor}
                        </span>
                        {prop.propertyType && (
                          <span
                            style={{ background: "#fff8f5", color: "#c2511f", border: "1px solid #fdd9c8" }}
                            className="text-xs font-semibold px-3 py-1 rounded-full"
                          >
                            {prop.propertyType}
                          </span>
                        )}
                      </div>
                      <p style={{ color: "#7c2d12" }} className="font-bold text-base mt-2">
                        ₹{prop.propertyCost?.toLocaleString()}
                      </p>
                    </div>
                    <span style={{ color: "#a8674a" }} className="text-xs">
                      {daysLeft(prop.expiryDate)} days left
                    </span>
                  </div>
                  <p style={{ color: "#a8674a" }} className="text-sm">📍 {prop.propertyAddress}, {prop.area}, {prop.city} - {prop.pinCode}</p>
                  {prop.landmark && <p style={{ color: "#a8674a" }} className="text-xs">🗺️ Near {prop.landmark}</p>}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {prop.carParking && <span style={{ color: "#c2511f", background: "#fff8f5", border: "1px solid #fdd9c8" }} className="text-xs px-2 py-1 rounded-full">🚗 Car Parking</span>}
                    {prop.twoWheelerParking && <span style={{ color: "#c2511f", background: "#fff8f5", border: "1px solid #fdd9c8" }} className="text-xs px-2 py-1 rounded-full">🛵 2-Wheeler Parking</span>}
                    {prop.amenities?.gym && <span style={{ color: "#c2511f", background: "#fff8f5", border: "1px solid #fdd9c8" }} className="text-xs px-2 py-1 rounded-full">💪 Gym</span>}
                    {prop.amenities?.pool && <span style={{ color: "#c2511f", background: "#fff8f5", border: "1px solid #fdd9c8" }} className="text-xs px-2 py-1 rounded-full">🏊 Pool</span>}
                    {prop.amenities?.badminton && <span style={{ color: "#c2511f", background: "#fff8f5", border: "1px solid #fdd9c8" }} className="text-xs px-2 py-1 rounded-full">🏸 Badminton</span>}
                    {prop.amenities?.security && <span style={{ color: "#c2511f", background: "#fff8f5", border: "1px solid #fdd9c8" }} className="text-xs px-2 py-1 rounded-full">🔒 Security</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Property Form */}
          {showForm && (
            <div
              style={{ background: "#fff", border: "1px solid #fdd9c8" }}
              className="rounded-3xl p-8 shadow-lg flex flex-col gap-5"
            >
              <div className="flex items-center justify-between">
                <h2 style={{ color: "#7c2d12" }} className="text-xl font-extrabold">Add New Property</h2>
                <button
                  onClick={() => { setShowForm(false); setStatus(""); }}
                  style={{ color: "#a8674a" }}
                  className="text-sm hover:underline"
                >
                  Cancel
                </button>
              </div>

              {/* Property Available For */}
              <div className="flex flex-col gap-1">
                <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                  Property Available For *
                </label>
                <div className="flex gap-3 flex-wrap">
                  {PURPOSE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleChange("propertyAvailableFor", opt)}
                      style={
                        form.propertyAvailableFor === opt
                          ? { background: "linear-gradient(135deg, #e8724a, #f59e6c)", color: "#fff" }
                          : { background: "#fff8f5", color: "#c2511f", border: "1px solid #fdd9c8" }
                      }
                      className="px-5 py-2 rounded-full text-sm font-bold transition hover:opacity-90"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost */}
              <div className="flex flex-col gap-1">
                <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                  Property Cost (₹) *
                </label>
                <input
                  type="number"
                  value={form.propertyCost}
                  onChange={(e) => handleChange("propertyCost", e.target.value)}
                  placeholder="e.g. 15000"
                  style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                  className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
                />
              </div>

              {/* Property Address */}
              <div className="flex flex-col gap-1">
                <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                  Property Address *
                </label>
                <textarea
                  value={form.propertyAddress}
                  onChange={(e) => handleChange("propertyAddress", e.target.value)}
                  placeholder="Full property address"
                  rows={2}
                  style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                  className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300 resize-none"
                />
              </div>

              {/* Area + City */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Area *</label>
                  <input
                    type="text"
                    value={form.area}
                    onChange={(e) => handleChange("area", e.target.value)}
                    placeholder="e.g. Miyapur"
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">City *</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="e.g. Hyderabad"
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
                  />
                </div>
              </div>

              {/* Pin Code + Facing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Pin Code *</label>
                  <input
                    type="text"
                    value={form.pinCode}
                    onChange={(e) => handleChange("pinCode", e.target.value.replace(/\D/g, ""))}
                    placeholder="6-digit pin code"
                    maxLength={6}
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Facing</label>
                  <select
                    value={form.facing}
                    onChange={(e) => handleChange("facing", e.target.value)}
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50"
                  >
                    <option value="">Select facing</option>
                    {FACING_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              {/* Property Type */}
              <div className="flex flex-col gap-1">
                <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Property Type</label>
                <select
                  value={form.propertyType}
                  onChange={(e) => handleChange("propertyType", e.target.value)}
                  style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                  className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50"
                >
                  <option value="">Select property type</option>
                  {PROPERTY_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Parking */}
              <div className="flex flex-col gap-2">
                <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Parking</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.carParking}
                      onChange={(e) => handleChange("carParking", e.target.checked)}
                      className="h-4 w-4 accent-[#e8724a]"
                    />
                    <span style={{ color: "#7c2d12" }} className="text-sm font-medium">🚗 Car Parking</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.twoWheelerParking}
                      onChange={(e) => handleChange("twoWheelerParking", e.target.checked)}
                      className="h-4 w-4 accent-[#e8724a]"
                    />
                    <span style={{ color: "#7c2d12" }} className="text-sm font-medium">🛵 Two-Wheeler Parking</span>
                  </label>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex flex-col gap-2">
                <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Amenities</label>
                <div className="flex flex-wrap gap-4">
                  {["gym", "pool", "badminton", "security"].map((key) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.amenities[key]}
                        onChange={(e) => handleAmenityChange(key, e.target.checked)}
                        className="h-4 w-4 accent-[#e8724a]"
                      />
                      <span style={{ color: "#7c2d12" }} className="text-sm font-medium capitalize">
                        {key === "gym" ? "💪 Gym" : key === "pool" ? "🏊 Pool" : key === "badminton" ? "🏸 Badminton" : "🔒 Security"}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <label style={{ color: "#7c2d12" }} className="text-xs font-medium">
                    Others (space separated)
                  </label>
                  <input
                    type="text"
                    value={form.amenities.others}
                    onChange={(e) => handleAmenityChange("others", e.target.value)}
                    placeholder="e.g. Clubhouse Playground Garden"
                    style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                    className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
                  />
                </div>
              </div>

              {/* Landmark */}
              <div className="flex flex-col gap-1">
                <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">Landmark</label>
                <input
                  type="text"
                  value={form.landmark}
                  onChange={(e) => handleChange("landmark", e.target.value)}
                  placeholder="e.g. Near Metro Station"
                  style={{ borderColor: "#fdd9c8", color: "#7c2d12" }}
                  className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
                />
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
                disabled={status === "Submitting..."}
                style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
                className="w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition disabled:cursor-not-allowed"
              >
                {status === "Submitting..." ? "Submitting..." : "Submit Property →"}
              </button>
            </div>
          )}
        </div>
      </main>

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
            <h2 style={{ color: "#7c2d12" }} className="text-2xl font-extrabold mb-3">Property Listed!</h2>
            <p style={{ color: "#a8674a" }} className="text-sm mb-6 leading-relaxed">
              Your property has been successfully listed and will be visible to customers for 90 days.
            </p>
            <div style={{ background: "#fdd9c8" }} className="w-full h-px mb-6" />
            <button
              onClick={() => setShowSuccess(false)}
              style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
              className="w-full text-white px-8 py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition"
            >
              OK →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
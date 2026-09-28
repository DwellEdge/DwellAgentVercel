import { useNavigate } from "react-router-dom";
import Footer from '../components/Footer'

export default function Agents() {
  const navigate = useNavigate();

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
          onClick={() => navigate("/")}
          style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #fdd9c8", color: "#c2511f" }}
          className="flex items-center gap-2 px-4 py-2 rounded-full shadow-md text-sm font-bold hover:shadow-lg transition"
        >
          ← Back
        </button>
      </nav>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg flex flex-col items-center gap-10">

          {/* Hero section */}
          <div className="text-center flex flex-col items-center gap-4">
            <div
              style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl"
            >
              🏠
            </div>
            <div>
              <h1 style={{ color: "#7c2d12" }} className="text-4xl font-extrabold">Agent Portal</h1>
              <p style={{ color: "#a8674a" }} className="mt-2 text-sm leading-relaxed max-w-xs mx-auto">
                Manage your listings, connect with customers, and grow your real estate business.
              </p>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: "📋", label: "Manage Listings" },
              { icon: "🤝", label: "Connect with Buyers" },
              { icon: "📊", label: "Track Performance" },
            ].map((item) => (
              <div
                key={item.label}
                style={{ background: "#fff", border: "1px solid #fdd9c8" }}
                className="flex items-center gap-2 px-4 py-2 rounded-full shadow-sm text-sm font-medium"
              >
                <span>{item.icon}</span>
                <span style={{ color: "#7c2d12" }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Cards */}
          <div className="w-full flex flex-col gap-4">

            {/* Login card */}
            <div
              style={{ background: "#fff", border: "1px solid #fdd9c8" }}
              className="rounded-3xl p-6 shadow-lg flex items-center gap-5"
            >
              <div
                style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow flex-shrink-0"
              >
                🔑
              </div>
              <div className="flex-1">
                <h2 style={{ color: "#7c2d12" }} className="text-lg font-extrabold">Already an Agent?</h2>
                <p style={{ color: "#a8674a" }} className="text-xs mt-0.5">
                  Sign in to access your dashboard and listings.
                </p>
              </div>
              <button
                onClick={() => navigate("/agent-login")}
                style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
                className="text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow hover:opacity-90 transition whitespace-nowrap"
              >
                Login →
              </button>
            </div>

            {/* Register card */}
            <div
              style={{ background: "#fff", border: "1px solid #fdd9c8" }}
              className="rounded-3xl p-6 shadow-lg flex items-center gap-5"
            >
              <div
                style={{ background: "linear-gradient(135deg, #f59e6c, #fbbf8a)" }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow flex-shrink-0"
              >
                📋
              </div>
              <div className="flex-1">
                <h2 style={{ color: "#7c2d12" }} className="text-lg font-extrabold">New Agent?</h2>
                <p style={{ color: "#a8674a" }} className="text-xs mt-0.5">
                  Create your agent account and start listing properties.
                </p>
              </div>
              <button
                onClick={() => navigate("/agent-register")}
                style={{ background: "#fff", border: "2px solid #fdd9c8", color: "#c2511f" }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-50 transition whitespace-nowrap"
              >
                Register →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Support & Terms section */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-6 bg-white rounded-2xl border border-orange-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#e6f0ff] flex items-center justify-center text-xl">💬</div>
                <div>
                  <h3 className="text-lg font-semibold text-[#174ea6]">Contact DwellAgent Support</h3>
                  <p className="text-sm text-slate-600 mt-1">Get help with account setup, agent onboarding, or Razorpay registration. Email <span className="font-medium">support@dwellagent.example</span> or use the Contact page.</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-orange-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#fff0e6] flex items-center justify-center text-xl">👤</div>
                <div>
                  <h3 className="text-lg font-semibold text-[#174ea6]">Recover your Agent Account</h3>
                  <p className="text-sm text-slate-600 mt-1">Having trouble logging in? Use the agent login flow to reset your password or contact support for verification assistance.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-orange-100 shadow-sm">
            <h3 className="text-lg font-semibold text-[#7c2d12]">Terms of Service</h3>
            <p className="text-xs text-slate-500 mt-2 italic">Last Updated: April 10, 2026 • <a href="/terms" className="text-[#174ea6] hover:underline">Change log</a></p>

            <div className="mt-3 text-sm text-slate-700">
              <h4 className="font-semibold">The Gist</h4>
              <p className="mt-2">We at DwellAgent are on a mission to simplify property discovery and agent matching across India. These Terms describe our commitments to you and your responsibilities when using our services. Please read them carefully. If you don’t agree to these Terms, don’t use our services.</p>

              <p className="mt-2">These Terms are available for reuse and adaptation — if you reuse them for your site, update them to reflect your practices and include an appropriate credit back to DwellAgent where possible.</p>

              <h5 className="mt-3 font-semibold">Key points</h5>
              <ul className="list-disc list-inside text-sm text-slate-700 mt-2 space-y-1">
                <li>Your use must comply with local laws and our policies.</li>
                <li>Agent onboarding may require identity verification and KYC for payment collection (Razorpay).</li>
                <li>We may update Terms and notify users; continued use implies acceptance.</li>
              </ul>

              <p className="mt-3 text-sm">Read the full Terms on the <a href="/terms" className="text-[#174ea6] hover:underline">Terms of Service</a> page.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
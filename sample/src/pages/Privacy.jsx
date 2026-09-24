import Footer from '../components/Footer.jsx'
import { useNavigate } from 'react-router-dom'

export default function Privacy() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)' }}>
      <nav style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid #fdd9c8', backdropFilter: 'blur(10px)' }}
        className="flex items-center justify-between px-8 py-4 shadow-sm">
        <div style={{ color: "#c2511f" }} className="text-xl font-extrabold tracking-wide cursor-pointer" onClick={() => navigate('/')}>DWELLAGENT</div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-extrabold text-[#7c2d12] mb-2">Privacy Policy</h1>
        <p className="text-xs text-slate-500 mb-8">Last Updated: September 2026</p>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">1. Information We Collect</h2>
          <p className="text-sm text-slate-700 mb-3">DwellAgent collects the following information to provide its property agent discovery services:</p>
          <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5">
            <li><strong>Customer information:</strong> Name and mobile number entered when contacting agents. This is used solely to send agent contact details via SMS and WhatsApp.</li>
            <li><strong>Agent registration information:</strong> First name, last name, email address, mobile number, office address, home address, agent photo, and ID document uploaded during registration.</li>
            <li><strong>Property listing information:</strong> Property address, city, area, pin code, cost, type, amenities, photos, and videos uploaded by registered agents.</li>
            <li><strong>Transaction information:</strong> Records of which agents were selected, payment amount, and timestamps — stored for business records and to improve agent display ordering.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">2. How We Use Your Information</h2>
          <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5">
            <li>To send agent contact details to customers via SMS and WhatsApp through Twilio.</li>
            <li>To notify agents via SMS and email when they register or list a new property.</li>
            <li>To display relevant agents and properties based on city, area, purpose, and budget filters.</li>
            <li>To improve agent discovery by tracking which agents are most frequently selected in specific areas.</li>
            <li>To process payments securely via Razorpay.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">3. Data Storage & Security</h2>
          <p className="text-sm text-slate-700 mb-3">All data is stored securely in MongoDB Atlas cloud databases. Agent-uploaded photos, ID documents, and videos are stored on our servers. Passwords are hashed using bcrypt and are never stored in plain text. OTPs for password reset expire within 5 minutes.</p>
          <p className="text-sm text-slate-700">We take reasonable technical measures to protect your data against unauthorized access, loss, or misuse.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">4. Third-Party Services</h2>
          <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5">
            <li><strong>Twilio:</strong> Used to send SMS and WhatsApp messages to customers and agents. Your mobile number is shared with Twilio solely for this purpose.</li>
            <li><strong>Razorpay:</strong> Used for payment processing. Payment data is handled directly by Razorpay and governed by their privacy policy.</li>
            <li><strong>Nodemailer / Gmail SMTP:</strong> Used to send welcome emails and OTP emails to registered agents.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">5. Data Retention</h2>
          <p className="text-sm text-slate-700">Property listings are active for 90 days from the date of listing. After expiry, listings are no longer shown to customers but records are retained for business purposes. Customer records are retained for transaction history. Agent accounts and their data are retained until deletion is requested.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">6. Your Rights</h2>
          <p className="text-sm text-slate-700">You may request access to, correction of, or deletion of your personal data by contacting us at <span className="text-[#c2511f] font-semibold">triosntechies@gmail.com</span>. We will respond within 7 business days.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">7. Contact</h2>
          <p className="text-sm text-slate-700">For privacy-related concerns, contact us at <span className="text-[#c2511f] font-semibold">triosntechies@gmail.com</span> or visit our <span className="text-[#c2511f] font-semibold cursor-pointer underline" onClick={() => navigate('/contact')}>Contact page</span>.</p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
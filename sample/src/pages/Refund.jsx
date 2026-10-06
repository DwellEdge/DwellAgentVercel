import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'

export default function Refund() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)' }}>
      <nav style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid #fdd9c8', backdropFilter: 'blur(10px)' }}
        className="flex items-center justify-between px-8 py-4 shadow-sm">
        <div style={{ color: "#c2511f" }} className="text-xl font-extrabold tracking-wide cursor-pointer" onClick={() => navigate('/')}>DWELLAGENT</div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-extrabold text-[#7c2d12] mb-2">Refund & Cancellation Policy</h1>
        <p className="text-xs text-slate-500 mb-8">Last Updated: September 2026</p>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">1. What You Pay For</h2>
          <p className="text-sm text-slate-700">DwellAgent charges a fixed fee of <strong>₹30 per agent selected</strong>. When a customer selects one or more agents and completes payment, they receive the selected agents' contact details via SMS and WhatsApp. The fee covers the delivery of verified agent contacts and is not a fee for property transactions or guarantees of any kind.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">2. Refund Eligibility</h2>
          <p className="text-sm text-slate-700 mb-3">Refunds may be considered in the following situations:</p>
          <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5">
            <li>Agent contact details were not delivered via SMS or WhatsApp due to a technical failure on our end.</li>
            <li>Duplicate payment was charged for the same transaction.</li>
            <li>Payment was deducted but no confirmation was received and no agent contacts were shared.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">3. Non-Refundable Cases</h2>
          <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5">
            <li>Agent contact details were successfully delivered but the customer was unable to reach the agent.</li>
            <li>The property shown by the agent did not meet the customer's expectations.</li>
            <li>The customer selected an agent by mistake.</li>
            <li>Refund request is made more than 7 days after the transaction date.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">4. How to Request a Refund</h2>
          <p className="text-sm text-slate-700 mb-3">To request a refund, contact us within 7 days of the transaction with the following details:</p>
          <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5">
            <li>Your registered mobile number</li>
            <li>Date and approximate time of the transaction</li>
            <li>Reason for the refund request</li>
          </ul>
          <p className="text-sm text-slate-700 mt-3">Send your request to <span className="text-[#c2511f] font-semibold">triosntechies@gmail.com</span>. We will respond within 3 business days.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">5. Refund Processing</h2>
          <p className="text-sm text-slate-700">Approved refunds are processed via Razorpay back to the original payment method. Processing time is typically 5–7 business days depending on your bank or payment provider.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">6. Cancellations</h2>
          <p className="text-sm text-slate-700">Customers may cancel their agent selection before completing payment at no charge. Once payment is completed and agent contacts have been delivered, the transaction cannot be cancelled. Agent property listings can be managed through the Agent Dashboard and expire automatically after 90 days.</p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
import Footer from '../components/Footer.jsx'
import { useNavigate } from 'react-router-dom'

export default function Terms() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)' }}>
      <nav style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid #fdd9c8', backdropFilter: 'blur(10px)' }}
        className="flex items-center justify-between px-8 py-4 shadow-sm">
        <div style={{ color: "#c2511f" }} className="text-xl font-extrabold tracking-wide cursor-pointer" onClick={() => navigate('/')}>DWELLAGENT</div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-extrabold text-[#7c2d12] mb-2">Terms of Service</h1>
        <p className="text-xs text-slate-500 mb-8">Last Updated: September 2026</p>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">1. About DwellAgent</h2>
          <p className="text-sm text-slate-700">DwellAgent is a real estate agent discovery platform that connects property seekers with verified local agents across Indian cities. By using DwellAgent — whether as a customer searching for property or as an agent listing properties — you agree to these Terms of Service.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">2. Customer Terms</h2>
          <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5">
            <li>Customers may search for agents by city, area, purpose (Rent, Lease, Sale), and budget range.</li>
            <li>Each agent contact is available for a fee of ₹30. Payment must be completed before agent contacts are shared.</li>
            <li>Agent contact details are delivered via SMS and WhatsApp to the mobile number provided.</li>
            <li>DwellAgent acts as a discovery platform only. We are not responsible for any property transactions, agreements, or disputes that arise between customers and agents.</li>
            <li>Customers must provide accurate mobile numbers to receive agent contacts. Incorrect numbers may result in non-delivery with no refund.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">3. Agent Terms</h2>
          <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5">
            <li>Agents must register with accurate personal information including a valid ID document and photo.</li>
            <li>Agents are responsible for the accuracy of all property listings they submit including address, cost, type, photos, and videos.</li>
            <li>Property listings are active for 90 days from the date of listing and must be renewed after expiry.</li>
            <li>Agents may not list properties they do not have authorization to represent.</li>
            <li>Agents who provide misleading information may have their accounts suspended.</li>
            <li>Login credentials (Login ID and password) are personal and must not be shared.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">4. Payment Terms</h2>
          <p className="text-sm text-slate-700 mb-3">Payments on DwellAgent are processed securely via Razorpay. By making a payment you agree to Razorpay's terms and conditions in addition to ours.</p>
          <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5">
            <li>All prices are listed in Indian Rupees (₹) inclusive of applicable taxes.</li>
            <li>DwellAgent does not store card, UPI, or bank account details. All payment data is handled by Razorpay.</li>
            <li>Refunds are subject to our Refund Policy. See the <span className="text-[#c2511f] font-semibold cursor-pointer underline" onClick={() => navigate('/refund')}>Refund & Cancellation page</span> for details.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">5. Prohibited Use</h2>
          <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5">
            <li>You may not use DwellAgent for any unlawful purpose or in violation of applicable Indian laws.</li>
            <li>You may not attempt to scrape, reverse engineer, or misuse the platform or its APIs.</li>
            <li>You may not impersonate another agent or customer.</li>
            <li>You may not upload fraudulent, misleading, or offensive property content.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">6. Intellectual Property</h2>
          <p className="text-sm text-slate-700">All content on DwellAgent including the logo, platform design, and code is owned by DwellAgent. Agent-uploaded property content (photos and videos) remains the property of the respective agent. By uploading content, agents grant DwellAgent a non-exclusive license to display it on the platform.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">7. Limitation of Liability</h2>
          <p className="text-sm text-slate-700">DwellAgent is not liable for any property transactions, rental agreements, or disputes between customers and agents. We provide a discovery and connection service only. We are not liable for any indirect, incidental, or consequential damages arising from use of the platform.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">8. Changes to Terms</h2>
          <p className="text-sm text-slate-700">DwellAgent reserves the right to update these Terms at any time. Continued use of the platform after changes are posted constitutes acceptance of the updated Terms.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">9. Contact</h2>
          <p className="text-sm text-slate-700">For questions about these Terms, contact us at <span className="text-[#c2511f] font-semibold">triosntechies@gmail.com</span>.</p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
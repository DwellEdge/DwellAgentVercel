import Footer from '../components/Footer.jsx'
import { useNavigate } from 'react-router-dom'

export default function Shipping() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)' }}>
      <nav style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid #fdd9c8', backdropFilter: 'blur(10px)' }}
        className="flex items-center justify-between px-8 py-4 shadow-sm">
        <div style={{ color: "#c2511f" }} className="text-xl font-extrabold tracking-wide cursor-pointer" onClick={() => navigate('/')}>DWELLAGENT</div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-extrabold text-[#7c2d12] mb-2">Shipping & Delivery Policy</h1>
        <p className="text-xs text-slate-500 mb-8">Last Updated: September 2026</p>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">1. Nature of Our Service</h2>
          <p className="text-sm text-slate-700">DwellAgent is a fully digital platform. We do not ship or deliver any physical goods. Our service involves connecting property seekers with verified local real estate agents through a digital agent discovery platform.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">2. Digital Delivery — Agent Contacts</h2>
          <p className="text-sm text-slate-700 mb-3">Upon successful payment, agent contact details are delivered digitally in the following ways:</p>
          <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5">
            <li><strong>SMS:</strong> Sent immediately to the mobile number provided by the customer, containing the names, areas, and contact numbers of the selected agents.</li>
            <li><strong>WhatsApp:</strong> Sent to the same number via the Twilio WhatsApp sandbox, containing a formatted list of agent details.</li>
            <li><strong>On-screen confirmation:</strong> The agent details are also displayed on the success screen immediately after payment.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">3. Delivery Timeframe</h2>
          <p className="text-sm text-slate-700">Digital delivery via SMS and WhatsApp is typically instant — within seconds of payment confirmation. In rare cases of network delays, delivery may take up to 5 minutes. If you do not receive your agent contacts within 10 minutes, please contact us.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">4. Agent Notifications</h2>
          <p className="text-sm text-slate-700 mb-3">Agents on the platform also receive digital notifications:</p>
          <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5">
            <li>A welcome SMS and email are sent immediately upon successful registration containing their login ID and access link.</li>
            <li>An SMS confirmation is sent each time an agent lists a new property, confirming that the listing is live and will remain active for 90 days.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">5. Delivery Failures</h2>
          <p className="text-sm text-slate-700">If SMS or WhatsApp delivery fails due to an incorrect mobile number, network issues, or platform limitations, please contact us at <span className="text-[#c2511f] font-semibold">triosntechies@gmail.com</span> and we will resend the agent details manually or provide them through an alternative channel.</p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
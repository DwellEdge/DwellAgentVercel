import Footer from '../components/Footer.jsx'
import { useNavigate } from 'react-router-dom'

export default function About() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)' }}>
      <nav style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid #fdd9c8', backdropFilter: 'blur(10px)' }}
        className="flex items-center justify-between px-8 py-4 shadow-sm">
        <div style={{ color: "#c2511f" }} className="text-xl font-extrabold tracking-wide cursor-pointer" onClick={() => navigate('/')}>DWELLAGENT</div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-extrabold text-[#7c2d12] mb-2">About Us</h1>
        <p className="text-xs text-slate-500 mb-8">Last Updated: September 2026</p>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">Who We Are</h2>
          <p className="text-sm text-slate-700">DwellAgent is a real estate companion platform designed to make the property search journey simple, fast, and stress-free. We bridge the gap between property seekers and trusted local real estate agents across Indian cities — without the confusion of endless calls, cold outreach, or wasted time.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">What We Do</h2>
          <p className="text-sm text-slate-700 mb-3">DwellAgent operates on two sides:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div style={{ background: '#fff', border: '1px solid #fdd9c8' }} className="rounded-2xl p-5">
              <h3 className="font-bold text-[#7c2d12] mb-2">👤 For Property Seekers</h3>
              <ul className="text-sm text-slate-700 space-y-1 list-disc pl-4">
                <li>Search by city, area, and purpose (Rent, Lease, Sale)</li>
                <li>Filter by budget range</li>
                <li>View agents with active property listings</li>
                <li>Browse property photos and videos</li>
                <li>Select agents and pay ₹30 per agent</li>
                <li>Receive agent contacts instantly via SMS and WhatsApp</li>
              </ul>
            </div>
            <div style={{ background: '#fff', border: '1px solid #fdd9c8' }} className="rounded-2xl p-5">
              <h3 className="font-bold text-[#7c2d12] mb-2">🏠 For Real Estate Agents</h3>
              <ul className="text-sm text-slate-700 space-y-1 list-disc pl-4">
                <li>Register with verified ID and photo</li>
                <li>Get a unique Login ID and secure account</li>
                <li>List properties with photos, videos, and full details</li>
                <li>Each listing stays active for 90 days</li>
                <li>Receive SMS and email confirmations for every action</li>
                <li>Get genuine leads from customers actively searching</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">Our Mission</h2>
          <p className="text-sm text-slate-700">DwellAgent's mission is to bring property seekers and trusted agents together — making real estate connections faster, smarter, and more meaningful for everyone involved. We believe finding the right agent should be as simple as a search.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">How It Works</h2>
          <div className="flex flex-col gap-3 mt-3">
            {[
              { step: "1", title: "Search", desc: "Enter your city, area, and what you're looking for — Rent, Lease, or Sale. Set a budget range if needed." },
              { step: "2", title: "Discover", desc: "See a list of verified agents who have active property listings in your exact area, along with the number of properties they handle." },
              { step: "3", title: "Select", desc: "Choose one or more agents. View their property listings with photos and videos before deciding." },
              { step: "4", title: "Connect", desc: "Pay ₹30 per agent and receive their contact details instantly on your phone via SMS and WhatsApp." },
            ].map((item) => (
              <div key={item.step} style={{ background: '#fff', border: '1px solid #fdd9c8' }} className="rounded-2xl p-4 flex gap-4 items-start">
                <div style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)', color: '#fff' }} className="rounded-full w-8 h-8 flex items-center justify-center font-extrabold text-sm flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-bold text-[#7c2d12] text-sm">{item.title}</p>
                  <p className="text-sm text-slate-700 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-[#7c2d12] mb-3">Our Technology</h2>
          <p className="text-sm text-slate-700">DwellAgent is built on the MERN stack (MongoDB, Express, React, Node.js). We use Twilio for real-time SMS and WhatsApp delivery, Razorpay for secure payments, Nodemailer for email notifications, and MongoDB Atlas for cloud data storage. Agent authentication uses bcrypt password hashing and OTP-based password recovery.</p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
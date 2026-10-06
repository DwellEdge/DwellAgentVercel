import { useState } from 'react'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'

export default function Contact() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // In production this would POST to a contact API
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)' }}>
      <nav style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid #fdd9c8', backdropFilter: 'blur(10px)' }}
        className="flex items-center justify-between px-8 py-4 shadow-sm">
        <div style={{ color: "#c2511f" }} className="text-xl font-extrabold tracking-wide cursor-pointer" onClick={() => navigate('/')}>DWELLAGENT</div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto p-8 w-full">
        <h1 className="text-3xl font-extrabold text-[#7c2d12] mb-2">Contact Us</h1>
        <p className="text-xs text-slate-500 mb-8">We typically respond within 2 business days</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Contact Info */}
          <div className="flex flex-col gap-5">
            <div style={{ background: '#fff', border: '1px solid #fdd9c8' }} className="rounded-2xl p-5">
              <h2 className="font-bold text-[#7c2d12] mb-4">Get In Touch</h2>
              <div className="flex flex-col gap-4 text-sm text-slate-700">
                <div className="flex gap-3">
                  <span className="text-lg">📧</span>
                  <div>
                    <p className="font-semibold text-[#7c2d12]">Email</p>
                    <p>triosntechies@gmail.com</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">📞</span>
                  <div>
                    <p className="font-semibold text-[#7c2d12]">Phone</p>
                    <p>+91-6366286947</p>
                    <p className="text-xs text-slate-500">Mon–Sat, 9am–6pm IST</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">🏢</span>
                  <div>
                    <p className="font-semibold text-[#7c2d12]">Business Hours</p>
                    <p>Monday to Saturday</p>
                    <p>9:00 AM – 6:00 PM IST</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #fdd9c8' }} className="rounded-2xl p-5">
              <h2 className="font-bold text-[#7c2d12] mb-3">Common Queries</h2>
              <div className="flex flex-col gap-3 text-sm text-slate-700">
                {[
                  { q: "I didn't receive agent contacts after payment", a: "Contact us with your mobile number and transaction date. We'll resend the details manually." },
                  { q: "I forgot my agent login password", a: "Use the Forgot Password option on the Agent Login page to reset via OTP sent to your registered email." },
                  { q: "My property listing expired", a: "Log in to your Agent Dashboard and re-list the property. Each listing is active for 90 days." },
                  { q: "Razorpay payment or refund query", a: "Contact us with your transaction ID and we'll coordinate with Razorpay on your behalf." },
                ].map((item, i) => (
                  <div key={i} style={{ background: '#fff8f5', border: '1px solid #fdd9c8' }} className="rounded-xl p-3">
                    <p className="font-semibold text-[#7c2d12] text-xs mb-1">Q: {item.q}</p>
                    <p className="text-xs text-slate-600">A: {item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ background: '#fff', border: '1px solid #fdd9c8' }} className="rounded-2xl p-6">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
                <div style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }} className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl">✅</div>
                <h2 className="font-extrabold text-[#7c2d12] text-xl">Message Sent!</h2>
                <p className="text-sm text-slate-600">Thank you for reaching out. We'll get back to you within 2 business days.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
                  className="text-white px-6 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition mt-2"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-bold text-[#7c2d12] mb-5">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label style={{ color: '#7c2d12' }} className="text-xs font-bold uppercase tracking-wide">Your Name</label>
                    <input
                      type="text" required
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Enter your name"
                      style={{ borderColor: '#fdd9c8', color: '#7c2d12' }}
                      className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label style={{ color: '#7c2d12' }} className="text-xs font-bold uppercase tracking-wide">Email Address</label>
                    <input
                      type="email" required
                      value={form.email}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="Enter your email"
                      style={{ borderColor: '#fdd9c8', color: '#7c2d12' }}
                      className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label style={{ color: '#7c2d12' }} className="text-xs font-bold uppercase tracking-wide">Subject</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                      style={{ borderColor: '#fdd9c8', color: '#7c2d12' }}
                      className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50"
                    >
                      <option value="">Select a subject</option>
                      <option value="payment">Payment / Refund Query</option>
                      <option value="agent-login">Agent Login / Registration Issue</option>
                      <option value="property">Property Listing Issue</option>
                      <option value="contacts">Did not receive agent contacts</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label style={{ color: '#7c2d12' }} className="text-xs font-bold uppercase tracking-wide">Message</label>
                    <textarea
                      required rows={4}
                      value={form.message}
                      onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Describe your issue or question..."
                      style={{ borderColor: '#fdd9c8', color: '#7c2d12' }}
                      className="border-2 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-300 bg-orange-50 placeholder-orange-300 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
                    className="w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition"
                  >
                    Send Message →
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
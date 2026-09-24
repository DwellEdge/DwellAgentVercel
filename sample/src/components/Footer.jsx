import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="w-full mt-8 bg-[#0b0f12] text-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-8">
          <div>
            <h4 className="text-sm font-semibold mb-3">Products</h4>
            <ul className="text-xs space-y-2">
              <li><Link to="/home" className="hover:underline">Property Search</Link></li>
              <li><Link to="/agent" className="hover:underline">Agent Network</Link></li>
              <li><Link to="/payment" className="hover:underline">Payments</Link></li>
              <li><Link to="/phoneform" className="hover:underline">Contact Flow</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Features</h4>
            <ul className="text-xs space-y-2">
              <li><span className="opacity-80">Area-based search</span></li>
              <li><span className="opacity-80">Agent referrals</span></li>
              <li><span className="opacity-80">Transaction history</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Resources</h4>
            <ul className="text-xs space-y-2">
              <li><Link to="/about" className="hover:underline">About Us</Link></li>
              <li><Link to="/contact" className="hover:underline">Contact</Link></li>
              <li><Link to="/terms" className="hover:underline">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Help</h4>
            <ul className="text-xs space-y-2">
              <li><span className="opacity-80">Support Center</span></li>
              <li><span className="opacity-80">Agent Onboarding</span></li>
              <li><span className="opacity-80">Razorpay Registration</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Company</h4>
            <ul className="text-xs space-y-2">
              <li><Link to="/about" className="hover:underline">About</Link></li>
              <li><Link to="/refund" className="hover:underline">Refund & Cancellation</Link></li>
              <li><Link to="/shipping" className="hover:underline">Shipping & Delivery</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs opacity-80">© 2026 DwellAgent</div>
          <div className="text-xs opacity-80">Built for agent discovery & rent,lease or buy your dream property</div>
        </div>
      </div>
    </footer>
  )
}

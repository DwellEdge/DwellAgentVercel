import { useNavigate } from 'react-router-dom'

function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)' }}>

      <nav style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid #fdd9c8', backdropFilter: 'blur(10px)' }}
        className="flex items-center justify-between px-8 py-4 shadow-sm">
        <div
          style={{ color: "#c2511f" }}
          className="text-xl font-extrabold tracking-wide cursor-pointer"
          onClick={() => navigate("/")}
        >
          DWELLAGENT
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/agent')}
            style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-90 transition">
            Agent
          </button>
        </div>
      </nav>

      <div className="flex flex-1 items-center justify-center px-4">
        <div className="text-center flex flex-col items-center gap-6">
          <div style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-xl">
            🏠
          </div>
          <h1 style={{ color: '#7c2d12' }} className="text-5xl font-extrabold tracking-tight leading-tight">
            Find Your<br />Perfect Home
          </h1>
          <p style={{ color: '#a8674a' }} className="text-base max-w-md leading-relaxed">
            Discover thousands of properties across India. Connect with trusted agents and find your dream home today.
          </p>
          <div className="flex gap-3 mt-2">
            <button onClick={() => navigate('/home')}
              style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
              className="px-8 py-3 rounded-xl text-white font-bold shadow-lg hover:opacity-90 transition text-sm">
              Get Started →
            </button>
            <button onClick={() => navigate('/agent')}
              style={{ borderColor: '#e8724a', color: '#c2511f' }}
              className="px-8 py-3 rounded-xl font-bold border-2 hover:bg-orange-50 transition text-sm">
              I'm an Agent
            </button>
          </div>

          <div className="flex gap-8 mt-6">
            {[['500+', 'Properties'], ['50+', 'Agents'], ['10+', 'Cities']].map(([num, label]) => (
              <div key={label} className="text-center">
                <div style={{ color: '#e8724a' }} className="text-2xl font-extrabold">{num}</div>
                <div style={{ color: '#a8674a' }} className="text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p style={{ color: '#d4a090' }} className="text-sm text-center pb-6">© 2026 DwellAgent</p>
    </div>
  )
}

export default Welcome
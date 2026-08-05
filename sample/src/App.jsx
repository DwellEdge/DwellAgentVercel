import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Welcome from './pages/Welcome'
import Payment from "./pages/Payment";
import PhoneForm from './pages/PhoneForm'
import Agents from './pages/Agents'
import AgentLogin from './pages/AgentLogin'
import AgentRegister from './pages/AgentRegister'
import AgentDashboard from './pages/AgentDashboard'

function App() {
  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/" element={<Welcome />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/phoneform" element={<PhoneForm />} />
      <Route path="/agent" element={<Agents />} />
      <Route path="/agent-login" element={<AgentLogin />} />
      <Route path="/agent-register" element={<AgentRegister />} />
      <Route path="/agent-dashboard" element={<AgentDashboard />} />
    </Routes>
  )
}

export default App
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Payment() {
    const location = useLocation();
    const navigate = useNavigate();

    const agents = location.state?.agents || [];
    const city = location.state?.city || "";
    const area = location.state?.area || "";
    const customers = location.state?.customers || [];
    const selectedCustomers = location.state?.selectedCustomers || [];

    const amountPerAgent = 30;
    const totalAmount = agents.length * amountPerAgent;

    const [showMobilePopup, setShowMobilePopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    // Redirect to home if page is reloaded (state is lost)
    useEffect(() => {
        if (!location.state || agents.length === 0) {
            navigate("/home", { replace: true });
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col"
            style={{ background: 'linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)' }}>

            {/* Navbar */}
            <nav style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid #fdd9c8', backdropFilter: 'blur(10px)' }}
                className="flex items-center justify-between px-8 py-4 shadow-sm">
                <div
                    style={{ color: "#c2511f" }}
                    className="text-xl font-extrabold tracking-wide cursor-pointer"
                    onClick={() => navigate("/")}
                >
                    DWELLAGENT
                </div>
                <button onClick={() => navigate(-1)}
                    style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #fdd9c8', color: '#c2511f' }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full shadow-md text-sm font-bold hover:shadow-lg transition">
                    ← Back
                </button>
            </nav>

            <div className="flex flex-1 justify-center px-4 py-12">
                <div className="w-full max-w-3xl flex flex-col gap-6">

                    {/* Header */}
                    <div>
                        <div style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow mb-3">
                            💳
                        </div>
                        <h1 style={{ color: '#7c2d12' }} className="text-3xl font-extrabold">Payment Summary</h1>
                        <p style={{ color: '#a8674a' }} className="mt-1 text-sm">Review your selected agents and total amount</p>
                    </div>

                    {/* Table */}
                    <div style={{ background: '#fff', border: '1px solid #fdd9c8' }}
                        className="rounded-3xl overflow-hidden shadow-lg">

                        {/* Table Header */}
                        <div style={{ background: '#fff8f5', borderBottom: '1px solid #fdd9c8' }}
                            className="grid grid-cols-2 px-6 py-4">
                            <div style={{ color: '#7c2d12' }} className="font-bold text-sm">Selected Agents</div>
                            <div style={{ color: '#7c2d12' }} className="font-bold text-sm text-right">Amount</div>
                        </div>

                        {/* Agent Rows */}
                        {agents.map((agent) => (
                            <div key={agent._id}
                                style={{ borderBottom: '1px solid #fdd9c8' }}
                                className="grid grid-cols-2 px-6 py-4">
                                <div style={{ color: '#7c2d12' }} className="text-sm font-medium">
                                    {agent.firstName} {agent.lastName}
                                </div>
                                <div style={{ color: '#e8724a' }} className="text-sm font-semibold text-right">
                                    ₹{amountPerAgent}
                                </div>
                            </div>
                        ))}

                        {/* Total Row */}
                        <div style={{ background: '#fff8f5' }}
                            className="grid grid-cols-2 px-6 py-5">
                            <div style={{ color: '#7c2d12' }} className="font-extrabold text-lg">Total Amount</div>
                            <div style={{ color: '#e8724a' }} className="font-extrabold text-lg text-right">₹{totalAmount}</div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowMobilePopup(true)}
                            style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
                            className="flex-1 text-white py-3 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition">
                            Proceed To Pay →
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            style={{ borderColor: '#fdd9c8', color: '#c2511f' }}
                            className="flex-1 border-2 py-3 rounded-xl text-sm font-bold hover:bg-orange-50 transition">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirm Payment Popup */}
            {showMobilePopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ background: 'rgba(124, 45, 18, 0.3)', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: '#fff', border: '1px solid #fdd9c8' }}
                        className="w-full max-w-md rounded-3xl p-8 shadow-2xl mx-4">

                        <div style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow mb-4">
                            💳
                        </div>

                        <h2 style={{ color: '#7c2d12' }} className="text-xl font-extrabold mb-2">Confirm Payment</h2>
                        <p style={{ color: '#a8674a' }} className="text-sm mb-6 leading-relaxed">
                            Proceed to enter your details and receive agent contacts via SMS & WhatsApp.
                        </p>

                        <div style={{ background: '#fdd9c8' }} className="w-full h-px mb-6" />

                        <button
                            onClick={() => {
                                setShowMobilePopup(false);
                                navigate("/phoneform", { state: { agents, city, area, customers, selectedCustomers } });
                            }}
                            style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
                            className="w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition">
                            Continue →
                        </button>

                        <button
                            onClick={() => setShowMobilePopup(false)}
                            style={{ borderColor: '#fdd9c8', color: '#c2511f' }}
                            className="mt-3 w-full border-2 py-3 rounded-xl text-sm font-bold hover:bg-orange-50 transition">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ background: 'rgba(124, 45, 18, 0.3)', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: '#fff', border: '1px solid #fdd9c8' }}
                        className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-3xl p-8 shadow-2xl mx-4">

                        <div style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow mb-4">
                            ✅
                        </div>

                        <h2 style={{ color: '#7c2d12' }} className="text-3xl font-extrabold mb-2">Thank You!</h2>
                        <p style={{ color: '#a8674a' }} className="text-sm mb-6">
                            Your request has been submitted successfully 💐
                        </p>

                        <div style={{ background: '#fdd9c8' }} className="w-full h-px mb-6" />

                        <div className="flex flex-col gap-4">
                            {agents.map((agent) => (
                                <div key={agent._id}
                                    style={{ background: '#fff8f5', border: '1px solid #fdd9c8' }}
                                    className="rounded-2xl p-4">
                                    <div style={{ color: '#7c2d12' }} className="font-bold text-sm">
                                        {agent.firstName} {agent.lastName}
                                    </div>
                                    <div style={{ color: '#a8674a' }} className="text-xs mt-1">📞 {agent.mobileNumber}</div>
                                    <div style={{ color: '#a8674a' }} className="text-xs mt-1">📍 {agent.address}</div>
                                    <div style={{ color: '#a8674a' }} className="text-xs mt-1">🏘️ {agent.area}</div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate("/home")}
                            style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
                            className="mt-6 w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition">
                            Back to Home →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
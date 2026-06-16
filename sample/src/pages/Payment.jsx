import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Payment() {
    const location = useLocation();
    const agents = location.state?.agents || [];
    const city = location.state?.city || "";
    const area = location.state?.area || "";
    const customers = location.state?.customers || [];
    const selectedCustomers = location.state?.selectedCustomers || [];
    const navigate = useNavigate();

    const amountPerAgent = 30;
    const totalAmount = agents.length * amountPerAgent;

    const [showMobilePopup, setShowMobilePopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)' }}>

            <nav style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid #fdd9c8', backdropFilter: 'blur(10px)' }}
                className="flex items-center justify-between px-8 py-4 shadow-sm">
                <div style={{ color: '#c2511f' }} className="text-xl font-extrabold tracking-wide">DWELLAGENT</div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/agent')}
                        style={{ background: 'linear-gradient(135deg, #e8724a, #f59e6c)' }}
                        className="px-5 py-2 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-90 transition">
                        Agent
                    </button>
                </div>
            </nav>

            <div className="min-h-screen bg-slate-100 p-8">
                <div className="mx-auto max-w-4xl rounded-3xl bg-white shadow-lg p-8">

                    <h1 className="mb-6 text-2xl font-bold">
                        Payment Summary
                    </h1>

                    <div className="overflow-hidden rounded-2xl border">

                        <div className="grid grid-cols-2 bg-slate-100 px-6 py-4 font-semibold">
                            <div>Selected Agents</div>
                            <div className="text-right">Amount</div>
                        </div>

                        {agents.map((agent) => (
                            <div
                                key={agent._id}
                                className="grid grid-cols-2 border-t px-6 py-4"
                            >
                                <div>{agent.firstName} {agent.lastName}</div>
                                <div className="text-right">₹{amountPerAgent}</div>
                            </div>
                        ))}

                        <div className="grid grid-cols-2 border-t bg-slate-50 px-6 py-5 font-bold text-lg">
                            <div>Total Amount</div>
                            <div className="text-right">₹{totalAmount}</div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center gap-4">
                        <button
                            className="rounded-full bg-green-600 px-8 py-3 font-semibold text-white hover:bg-green-700"
                            onClick={() => setShowMobilePopup(true)}
                        >
                            Proceed To Pay
                        </button>

                        <button
                            className="rounded-full bg-red-500 px-8 py-3 font-semibold text-white hover:bg-red-600"
                            onClick={() =>
                                navigate("/home", {
                                    state: { city, area, customers, selectedCustomers },
                                })
                            }
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                {showMobilePopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="w-full max-w-md rounded-3xl bg-white p-8">

                            <h2 className="mb-4 text-xl font-bold">Confirm Payment</h2>

                            <p className="text-slate-600 mb-6">
                                Proceed to enter your details and receive agent contacts via SMS & WhatsApp.
                            </p>

                            <button
                                onClick={() => {
                                    setShowMobilePopup(false);
                                    navigate("/phoneform", {
                                        state: { agents, city, area, customers, selectedCustomers },
                                    });
                                }}
                                className="w-full rounded-xl bg-sky-600 py-3 text-white font-semibold"
                            >
                                Continue
                            </button>

                            <button
                                onClick={() => setShowMobilePopup(false)}
                                className="mt-2 w-full rounded-xl border py-3 text-gray-500 font-semibold"
                            >
                                Cancel
                            </button>

                        </div>
                    </div>
                )}

                {showSuccessPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-8">

                            <h2 className="mb-2 text-3xl font-bold text-green-600">Thank You!</h2>

                            <p className="mb-6 text-slate-600">
                                Your request has been submitted successfully💐💐.
                            </p>

                            <div className="space-y-4">
                                {agents.map((agent) => (
                                    <div key={agent._id} className="rounded-2xl border p-4">
                                        <div className="font-bold">{agent.firstName} {agent.lastName}</div>
                                        <div>Mobile: {agent.mobileNumber}</div>
                                        <div>Address: {agent.address}</div>
                                        <div>Area: {agent.area}</div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => navigate("/home")}
                                className="mt-6 w-full rounded-xl bg-green-600 py-3 text-white font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
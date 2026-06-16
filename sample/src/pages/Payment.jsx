import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

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
    const [mobileNumber, setMobileNumber] = useState("");

    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5002";

    const submitRequest = async () => {
        try {
            console.log("Submitting...");

            const response = await axios.post(
                `${API_BASE}/api/payment-request`,
                { mobileNumber }
            );

            console.log(response.data);

            setShowMobilePopup(false);

            navigate("/phoneform", {
                state: { agents }
            });

        } catch (error) {
            console.error("FULL ERROR:", error);

            if (error.response) {
                console.log("Status:", error.response.status);
                console.log("Data:", error.response.data);
            }

            alert("Failed to save request");
        }
    };

    return (
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
                            <div>
                                {agent.firstName} {agent.lastName}
                            </div>
                            <div className="text-right">
                                ₹{amountPerAgent}
                            </div>
                        </div>
                    ))}

                    <div className="grid grid-cols-2 border-t bg-slate-50 px-6 py-5 font-bold text-lg">
                        <div>Total Amount</div>
                        <div className="text-right">
                            ₹{totalAmount}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-center gap-4">
                    <button
                        className="rounded-full bg-green-600 px-8 py-3 font-semibold text-white hover:bg-green-700"
                        onClick={() => navigate("/phoneform",{state:{agents}})}
                    >
                        Proceed To Pay
                    </button>

                    <button
                        className="rounded-full bg-red-500 px-8 py-3 font-semibold text-white hover:bg-red-600"
                        onClick={() =>
                            navigate("/home", {
                                state: {
                                    city,
                                    area,
                                    customers,
                                    selectedCustomers,
                                },
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

                        <h2 className="mb-4 text-xl font-bold">
                            Enter Mobile Number
                        </h2>

                        <input
                            type="text"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            placeholder="Enter Mobile Number"
                            className="w-full rounded-xl border p-3"
                        />

                        <button
                            onClick={submitRequest}
                            className="mt-4 w-full rounded-xl bg-sky-600 py-3 text-white"
                        >
                            Submit
                        </button>

                    </div>
                </div>
            )}

            {showSuccessPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-8">

                        <h2 className="mb-2 text-3xl font-bold text-green-600">
                            Thank You!
                        </h2>

                        <p className="mb-6 text-slate-600">
                            Your request has been submitted successfully💐💐.
                        </p>

                        <div className="space-y-4">
                            {agents.map((agent) => (
                                <div
                                    key={agent._id}
                                    className="rounded-2xl border p-4"
                                >
                                    <div className="font-bold">
                                        {agent.firstName} {agent.lastName}
                                    </div>
                                    <div>Mobile: {agent.mobileNumber}</div>
                                    <div>Address: {agent.address}</div>
                                    <div>Area: {agent.area}</div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate("/home")}
                            className="mt-6 w-full rounded-xl bg-green-600 py-3 text-white"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
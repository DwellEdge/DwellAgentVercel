import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";


export default function Home() {
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [areaSuggestions, setAreaSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const navigate = useNavigate();
const location = useLocation();

const [city, setCity] = useState("");
const [area, setArea] = useState("");
const [customers, setCustomers] = useState([]);
const [selectedCustomers, setSelectedCustomers] = useState([]);


  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5002";

  // Fetch cities
  const fetchCities = async (searchValue) => {
    const query = searchValue?.trim();

    if (!query || query.length < 1) {
      setCitySuggestions([]);
      return;
    }

    try {
      console.log("📍 Fetching cities for:", query);
      const res = await axios.get(`${API_BASE}/api/location`, {
        params: { q: query },
        timeout: 10000
      });
      console.log("✓ Cities found:", res.data);
      setCitySuggestions(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching cities:", err.message);
      setCitySuggestions([]);
    }
  };

  // Fetch areas for selected city
  const fetchAreas = async (cityValue) => {
    if (!cityValue || cityValue.length < 1) {
      console.log("No city value to fetch areas");
      setAreaSuggestions([]);
      setLoadingAreas(false);
      return;
    }

    setLoadingAreas(true);

    try {
      console.log("🌍 Fetching areas for city:", cityValue);
      const res = await axios.get(`${API_BASE}/api/areas`, {
        params: { city: cityValue },
        timeout: 15000
      });
      console.log("✓ Areas found:", res.data);
      setAreaSuggestions(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching areas:", err.message);
      setAreaSuggestions([]);
    } finally {
      setLoadingAreas(false);
    }
  };
  useEffect(() => {
  if (location.state) {
    setCity(location.state.city || "");
    setArea(location.state.area || "");
    setCustomers(location.state.customers || []);
    setSelectedCustomers(location.state.selectedCustomers || []);
    setSelectedCity(location.state.city || "");
  }
}, [location.state]);

  // When selectedCity changes, fetch areas automatically
  useEffect(() => {
    console.log("useEffect triggered - selectedCity:", selectedCity);
    if (selectedCity) {
      console.log("Calling fetchAreas from useEffect");
      fetchAreas(selectedCity);
    }
  }, [selectedCity]);

  const fetchCustomers = async () => {
    if (!selectedCity || !area) {
      alert("Please select both city and area");
      return;
    }

    try {
      setLoading(true);
      setSearchPerformed(true);
      console.log("👥 Searching for customers - City:", selectedCity, "Area:", area);

      const res = await axios.get(`${API_BASE}/api/customers`, {
        params: { city: selectedCity, area: area },
        timeout: 5000
      });

      console.log("✓ Customers found:", res.data);
      setCustomers(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching customers:", err.message);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (val) => {
    console.log("🔤 City input changed:", val);
    setCity(val);
    setSelectedCity(""); // Reset selected city
    setArea(""); // Reset area
    setAreaSuggestions([]);

    if (val.length > 0) {
      fetchCities(val);
    } else {
      setCitySuggestions([]);
    }
  };

  const handleCitySelect = (cityName) => {
    console.log("✅ City selected:", cityName);
    setCity(cityName);
    setSelectedCity(cityName); // This will trigger useEffect
    setCitySuggestions([]);
    setArea("");
  };

  const handleAreaChange = (val) => {
    console.log("🔤 Area input changed:", val);
    setArea(val);
  };

  const handleAreaSelect = (areaName) => {
    console.log("✅ Area selected:", areaName);
    setArea(areaName);
    setAreaSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("🔍 Form submitted - City:", selectedCity, "Area:", area);
    fetchCustomers();
  };

  const handleContinue = () => {
    const selectedAgents = customers.filter((item) =>
      selectedCustomers.includes(item._id)
    );

    navigate("/payment", {
      state: {
        agents: selectedAgents,
        city,
        area,
        customers,
        selectedCustomers,
      },
    });
  };

  const handleCancel = () => {
    setSelectedCustomers([]);
  };

  const toggleCustomerSelection = (customerId) => {
    setSelectedCustomers((prev) => {
      if (prev.includes(customerId)) {
        return prev.filter((id) => id !== customerId);
      }

      return [...prev, customerId];
    });
  };

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

      <main className="flex flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* City Input */}
            <div className="relative w-full">
              <div className="flex items-center gap-3 rounded-full bg-white p-2 shadow-lg shadow-slate-200/70 ring-1 ring-slate-200">
                <input
                  className="h-14 min-w-160px flex-1 rounded-full border border-sky-500 bg-white px-5 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-600"
                  type="text"
                  placeholder="Search City (e.g. Bengaluru, Hyderabad)"
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {/* City Dropdown */}
              {citySuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-slate-200 z-50">
                  {citySuggestions.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleCitySelect(item.display_name)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-slate-100 border-b last:border-b-0 text-slate-900 transition"
                    >
                      {item.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Area Input */}
            <div className="relative w-full">
              <div className="flex items-center gap-3 rounded-full bg-white p-2 shadow-lg shadow-slate-200/70 ring-1 ring-slate-200">
                <input
                  className={`flex-1 rounded-full border px-5 py-4 text-sm outline-none transition ${!selectedCity
                    ? "border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "border-slate-200 bg-white text-slate-900 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    }`}
                  type="text"
                  placeholder={selectedCity ? "Type to search area..." : "Area"}
                  value={area}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  disabled={!selectedCity}
                  autoComplete="off"
                />

                <button
                  type="submit"
                  disabled={!selectedCity || !area || loading}
                  className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition ${!selectedCity || !area || loading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-sky-600 hover:bg-sky-700"
                    }`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 21l-4.35-4.35"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="11"
                      cy="11"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
              </div>

              {/* Area Dropdown */}
              {areaSuggestions.length > 0 && selectedCity && !area && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-slate-200 z-50 max-h-64 overflow-y-auto">
                  <div className="p-2 text-xs text-slate-500 border-b">
                    {areaSuggestions.length} areas found
                  </div>
                  {areaSuggestions.map((areaName, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAreaSelect(areaName)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-sky-50 border-b last:border-b-0 text-slate-900 transition"
                    >
                      {areaName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* City & Area Tags */}
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700 ring-1 ring-sky-200">
              City: {selectedCity || "Not selected"}
            </span>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
              Area: {area || "Not selected"}
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
            </div>
          )}

          {/* No Results */}
          {searchPerformed && !loading && customers.length === 0 && (
            <div className="mt-6 rounded-32px bg-red-50 border border-red-200 p-6 text-center">
              <p className="text-red-700 font-medium">
                No records found for City:{" "}
                <span className="font-semibold">
                  {city ? city.split(",")[0].trim() : ""}
                </span>{" "}
                and Area:{" "}
                <span className="font-semibold">
                  {area ? area.split(",")[0].trim() : ""}
                </span>
              </p>
            </div>
          )}

          {/* Results */}
          {customers.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-32px bg-slate-950 text-slate-100 shadow-2xl shadow-slate-900/40 ring-1 ring-white/10">
              <div className="border-b border-white/10 px-6 py-4 text-sm font-semibold">
                Results ({customers.length})
              </div>

              <div className="divide-y divide-white/10">
                {customers.map((record) => (
                  <label
                    key={record._id}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(record._id)}
                      onChange={() => toggleCustomerSelection(record._id)}
                      className="h-5 w-5 accent-sky-500"
                    />

                    <div className="flex-1">
                      <div className="font-semibold">
                        {record.firstName} {record.lastName}
                      </div>

                      <div className="text-sm text-slate-300">
                        Area: {record.area}
                      </div>

                      <div className="text-sm text-sky-400 font-medium">
                        Number of Properties: {record["Number of Property"] || 0}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Bottom Buttons */}
              <div className="flex justify-center gap-4 border-t border-white/10 px-6 py-5">
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={selectedCustomers.length === 0}
                  className={`rounded-full px-6 py-2 font-semibold text-white transition ${selectedCustomers.length > 0
                    ? "bg-sky-600 hover:bg-sky-700"
                    : "cursor-not-allowed bg-slate-500"
                    }`}
                >
                  Continue
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={selectedCustomers.length === 0}
                  className={`rounded-full px-6 py-2 font-semibold transition ${selectedCustomers.length > 0
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "cursor-not-allowed bg-slate-500 text-white"
                    }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

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

  const fetchCities = async (searchValue) => {
    const query = searchValue?.trim();
    if (!query || query.length < 1) {
      setCitySuggestions([]);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/api/location`, {
        params: { q: query },
        timeout: 10000
      });
      setCitySuggestions(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching cities:", err.message);
      setCitySuggestions([]);
    }
  };

  const fetchAreas = async (cityValue) => {
    if (!cityValue || cityValue.length < 1) {
      setAreaSuggestions([]);
      setLoadingAreas(false);
      return;
    }
    setLoadingAreas(true);
    try {
      const res = await axios.get(`${API_BASE}/api/areas`, {
        params: { city: cityValue },
        timeout: 15000
      });
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

  useEffect(() => {
    if (selectedCity) {
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
      const res = await axios.get(`${API_BASE}/api/customers`, {
        params: { city: selectedCity, area: area },
        timeout: 5000
      });
      setCustomers(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching customers:", err.message);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (val) => {
    setCity(val);
    setSelectedCity("");
    setArea("");
    setAreaSuggestions([]);
    if (val.length > 0) {
      fetchCities(val);
    } else {
      setCitySuggestions([]);
    }
  };

  const handleCitySelect = (cityName) => {
    setCity(cityName);
    setSelectedCity(cityName);
    setCitySuggestions([]);
    setArea("");
  };

  const handleAreaChange = (val) => {
    setArea(val);
  };

  const handleAreaSelect = (areaName) => {
    setArea(areaName);
    setAreaSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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

      {/* Navigation */}
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

      {/* Main Content */}
      <main className="flex flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* City Input */}
            <div className="relative w-full">
              <div className="flex items-center gap-3 rounded-full bg-white p-2 shadow-lg shadow-orange-100/70 ring-1 ring-orange-100">
                <input
                  className="h-14 min-w-40 flex-1 rounded-full border border-orange-200 bg-white px-5 text-sm font-medium text-slate-900 outline-none transition focus:border-[#e8724a]"
                  type="text"
                  placeholder="Search City (e.g. Bengaluru, Hyderabad)"
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {/* City Dropdown */}
              {citySuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-orange-100 z-50">
                  {citySuggestions.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleCitySelect(item.display_name)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 border-b last:border-b-0 text-slate-900 transition"
                    >
                      {item.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* City not found message */}
            {city.length > 1 && citySuggestions.length === 0 && !selectedCity && (
              <p className="text-sm mt-1 ml-2" style={{ color: '#a8674a' }}>
                No cities found for "<span className="font-semibold">{city}</span>". Try a different name.
              </p>
            )}

            {/* Area Input */}
            <div className="relative w-full">
              <div className="flex items-center gap-3 rounded-full bg-white p-2 shadow-lg shadow-orange-100/70 ring-1 ring-orange-100">
                <input
                  className={`flex-1 rounded-full border px-5 py-4 text-sm outline-none transition ${!selectedCity
                    ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                    : "border-slate-200 bg-white text-slate-900 focus:border-[#e8724a] focus:ring-4 focus:ring-orange-50"
                    }`}
                  type="text"
                  placeholder={selectedCity ? "Type to search area..." : "Area"}
                  value={area}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  disabled={!selectedCity}
                  autoComplete="off"
                />
              </div>

              {/* Area Dropdown */}
              {areaSuggestions.length > 0 && selectedCity && !area && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-orange-100 z-50 max-h-64 overflow-y-auto">
                  <div className="p-2 text-xs text-slate-500 border-b">
                    {areaSuggestions.length} areas found
                  </div>
                  {areaSuggestions.map((areaName, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAreaSelect(areaName)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 border-b last:border-b-0 text-slate-900 transition"
                    >
                      {areaName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className="flex justify-end mt-1">
              <button
                type="submit"
                disabled={!selectedCity || !area || loading}
                style={selectedCity && area && !loading ? { background: 'linear-gradient(135deg, #e8724a, #f59e6c)' } : {}}
                className={`flex h-12 px-8 items-center justify-center rounded-full text-white font-bold text-sm tracking-wider shadow-md shadow-orange-200/50 transition duration-200 ${!selectedCity || !area || loading
                  ? "bg-slate-300 cursor-not-allowed shadow-none"
                  : "hover:opacity-95 transform hover:-translate-y-0.5"
                  }`}
              >
                🔍 SEARCH
              </button>
            </div>
          </form>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-[#c2511f] ring-1 ring-orange-200">
              City: {selectedCity || "Not selected"}
            </span>
            <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-orange-100">
              Area: {area || "Not selected"}
            </span>
          </div>

          {/* Loader */}
          {loading && (
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e8724a]"></div>
            </div>
          )}

          {/* No Results */}
          {searchPerformed && !loading && customers.length === 0 && (
            <div className="mt-6 rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-lg">
              <div className="text-5xl mb-4">🏠</div>
              <h3 style={{ color: '#7c2d12' }} className="text-xl font-extrabold mb-2">
                No Agents Found
              </h3>
              <p style={{ color: '#a8674a' }} className="text-sm mb-1">
                We couldn't find any agents in{" "}
                <span className="font-bold">{area ? area.split(",")[0].trim() : ""}</span>,{" "}
                <span className="font-bold">{city ? city.split(",")[0].trim() : ""}</span>.
              </p>
              <p style={{ color: '#a8674a' }} className="text-sm">
                Try searching a different city or area.
              </p>
            </div>
          )}

          {/* Results Block */}
          {customers.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-3xl bg-white text-slate-800 shadow-xl border border-orange-100">
              <div className="border-b border-orange-100 bg-orange-50/50 px-6 py-4 text-sm font-bold text-slate-700">
                Results ({customers.length})
              </div>

              <div className="divide-y divide-orange-100">
                {customers.map((record) => (
                  <label
                    key={record._id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-orange-50/30 transition cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(record._id)}
                      onChange={() => toggleCustomerSelection(record._id)}
                      className="h-5 w-5 accent-[#e8724a]"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">
                        {record.firstName} {record.lastName}
                      </div>
                      <div className="text-sm text-slate-500">
                        Area: {record.area}
                      </div>
                      <div className="text-sm text-[#c2511f] font-semibold mt-0.5">
                        Number of Properties: {record["Number of Property"] || 0}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex justify-center gap-4 border-t border-orange-100 bg-orange-50/20 px-6 py-5">
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={selectedCustomers.length === 0}
                  style={selectedCustomers.length > 0 ? { background: 'linear-gradient(135deg, #e8724a, #f59e6c)' } : {}}
                  className={`rounded-full px-8 py-2.5 font-bold text-white shadow-md transition ${selectedCustomers.length > 0
                    ? "hover:opacity-90"
                    : "cursor-not-allowed bg-slate-300 shadow-none"
                    }`}
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={selectedCustomers.length === 0}
                  className={`rounded-full px-8 py-2.5 font-bold border transition ${selectedCustomers.length > 0
                    ? "border-red-200 text-red-500 bg-red-50 hover:bg-red-100"
                    : "cursor-not-allowed border-slate-200 text-slate-400 bg-slate-50"
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
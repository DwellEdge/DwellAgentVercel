import { useState, useEffect, useCallback } from "react";
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

  // Req 6 — Budget Range
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("custom"); // "custom" | "under10" | "10to25" | "25to50" | "above50"

  const [agentRows, setAgentRows] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [selectedPropertyTypeIds, setSelectedPropertyTypeIds] = useState([]);
  const [previouslySelectedKeys, setPreviouslySelectedKeys] = useState(new Set());
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // Req 7 — Properties view
  const [viewMode, setViewMode] = useState("agents");
  const [propertyResults, setPropertyResults] = useState([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState({});
  const [playingVideo, setPlayingVideo] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5002";

  const makeRowKey = (agentId, ptId) => `${agentId}::${ptId}`;

  // Budget preset ranges in lakhs for Rent (monthly), bigger for Sale
  const BUDGET_PRESETS = [
    { label: "Any", value: "any", min: "", max: "" },
    { label: "Under ₹10K", value: "under10", min: "", max: "10000" },
    { label: "₹10K–₹25K", value: "10to25", min: "10000", max: "25000" },
    { label: "₹25K–₹50K", value: "25to50", min: "25000", max: "50000" },
    { label: "Above ₹50K", value: "above50", min: "50000", max: "" },
    { label: "Custom", value: "custom", min: null, max: null },
  ];

  const applyBudgetPreset = (preset) => {
    setBudgetFilter(preset.value);
    if (preset.min !== null) setMinBudget(preset.min);
    if (preset.max !== null) setMaxBudget(preset.max);
  };

  const getActiveBudget = () => {
    if (budgetFilter === "custom") return { min: minBudget, max: maxBudget };
    const preset = BUDGET_PRESETS.find((p) => p.value === budgetFilter);
    return { min: preset?.min || "", max: preset?.max || "" };
  };

  const fetchCities = async (searchValue) => {
    const query = searchValue?.trim();
    if (!query || query.length < 1) { setCitySuggestions([]); return; }
    try {
      const res = await axios.get(`${API_BASE}/api/location`, { params: { q: query }, timeout: 10000 });
      setCitySuggestions(res.data || []);
    } catch (err) {
      console.error("Error fetching cities:", err.message);
      setCitySuggestions([]);
    }
  };

  const fetchAreas = async (cityValue) => {
    if (!cityValue) { setAreaSuggestions([]); return; }
    setLoadingAreas(true);
    try {
      const res = await axios.get(`${API_BASE}/api/areas`, { params: { city: cityValue }, timeout: 15000 });
      setAreaSuggestions(res.data || []);
    } catch (err) {
      setAreaSuggestions([]);
    } finally {
      setLoadingAreas(false);
    }
  };

  const fetchAgents = useCallback(async () => {
    if (!selectedCity || !area) { alert("Please select both city and area"); return; }
    if (selectedPropertyTypeIds.length === 0) { alert("Please select at least one purpose"); return; }

    const { min, max } = getActiveBudget();

    try {
      setLoading(true);
      setSearchPerformed(true);
      setSelectedAgents([]);
      const responses = await Promise.all(
        selectedPropertyTypeIds.map((ptId) =>
          axios.get(`${API_BASE}/api/agents`, {
            params: {
              city: selectedCity, area, propertyTypeId: ptId,
              ...(min && { minBudget: min }),
              ...(max && { maxBudget: max }),
            },
            timeout: 5000,
          })
            .then((res) => ({ ptId, data: res.data || [] }))
            .catch((err) => { console.error(`Failed agents for ${ptId}:`, err.message); return { ptId, data: [] }; })
        )
      );

      const nextRows = [];
      responses.forEach(({ ptId, data }) => {
        const ptName = propertyTypes.find((t) => t.propertyTypeId === ptId)?.propertyType || ptId;
        data.forEach((record) => {
          const agentId = record.agentId || record._id;
          nextRows.push({
            rowKey: makeRowKey(agentId, ptId),
            _id: record._id,
            agentId,
            firstName: record.firstName,
            lastName: record.lastName,
            area: record.area || area,
            city: record.city || selectedCity,
            propertyTypeId: ptId,
            propertyTypeName: ptName,
            filteredCount: record.filteredCount ?? 0,
          });
        });
      });
      setAgentRows(nextRows);

      const prevResponses = await Promise.all(
        selectedPropertyTypeIds.map((ptId) =>
          axios.get(`${API_BASE}/api/transactions/previous-agents`, {
            params: { city: selectedCity, area, propertyTypeId: ptId }, timeout: 5000,
          })
            .then((res) => ({ ptId, agentIds: res.data || [] }))
            .catch(() => ({ ptId, agentIds: [] }))
        )
      );

      const nextPrev = new Set();
      prevResponses.forEach(({ ptId, agentIds }) => {
        agentIds.forEach((id) => nextPrev.add(makeRowKey(id, ptId)));
      });
      setPreviouslySelectedKeys(nextPrev);
    } catch (err) {
      console.error("Failed to fetch agents:", err.message);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, selectedCity, area, selectedPropertyTypeIds, propertyTypes, minBudget, maxBudget, budgetFilter]);

  const fetchProperties = useCallback(async () => {
    if (!selectedCity || !area) return;
    const { min, max } = getActiveBudget();
    try {
      setLoading(true);
      const responses = await Promise.all(
        (selectedPropertyTypeIds.length ? selectedPropertyTypeIds : [""]).map((ptId) =>
          axios
            .get(`${API_BASE}/api/properties/search`, {
              params: {
                city: selectedCity,
                area,
                ...(ptId && { propertyTypeId: ptId }),
                ...(min && { minBudget: min }),
                ...(max && { maxBudget: max }),
              },
              timeout: 5000,
            })
            .then((res) => res.data || [])
            .catch(() => [])
        )
      );
      const seen = new Set();
      const merged = [];
      responses.flat().forEach((prop) => {
        if (!prop?._id || seen.has(prop._id)) return;
        seen.add(prop._id);
        merged.push(prop);
      });
      setPropertyResults(merged);
    } catch (err) {
      console.error("Failed to fetch properties:", err.message);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, selectedCity, area, selectedPropertyTypeIds, minBudget, maxBudget, budgetFilter]);

  useEffect(() => {
    const isReload = performance.getEntriesByType("navigation")[0]?.type === "reload";
    if (isReload) {
      setCity(""); setArea(""); setAgentRows([]); setSelectedAgents([]);
      setSelectedCity(""); setSearchPerformed(false);
      setPreviouslySelectedKeys(new Set());
      setPropertyResults([]); setViewMode("agents");
      setMinBudget(""); setMaxBudget(""); setBudgetFilter("any");
      window.history.replaceState(null, "");
    }
  }, []);

  useEffect(() => {
    const isReload = performance.getEntriesByType("navigation")[0]?.type === "reload";
    if (isReload) return;
    if (location.state) {
      setCity(location.state.city || "");
      setArea(location.state.area || "");
      setAgentRows(location.state.agentRows || []);
      setSelectedAgents(location.state.selectedAgents || []);
      setSelectedCity(location.state.city || "");
      setSearchPerformed((location.state.agentRows || []).length > 0);
      if (location.state.propertyTypeIds) setSelectedPropertyTypeIds(location.state.propertyTypeIds);
      else if (location.state.propertyTypeId) setSelectedPropertyTypeIds([location.state.propertyTypeId]);
    }
  }, [location.state]);

  useEffect(() => { if (selectedCity) fetchAreas(selectedCity); }, [selectedCity]);

  useEffect(() => {
    axios.get(`${API_BASE}/api/property-types`)
      .then((res) => {
        const types = res.data || [];
        setPropertyTypes(types);
        setSelectedPropertyTypeIds((prev) =>
          prev.length > 0 ? prev : types[0] ? [types[0].propertyTypeId] : []
        );
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCity && area && searchPerformed) {
      fetchAgents();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (viewMode === "properties") {
        fetchProperties();
      }
    }
  }, [selectedPropertyTypeIds]);

  const handleCityChange = (val) => {
    setCity(val); setSelectedCity(""); setArea(""); setAreaSuggestions([]);
    setAgentRows([]); setSelectedAgents([]); setSearchPerformed(false);
    setPreviouslySelectedKeys(new Set()); setPropertyResults([]);
    if (val.length > 0) fetchCities(val); else setCitySuggestions([]);
  };

  const handleCitySelect = (cityName) => {
    setCity(cityName); setSelectedCity(cityName); setCitySuggestions([]);
    setArea(""); setAgentRows([]); setSelectedAgents([]);
    setSearchPerformed(false); setPreviouslySelectedKeys(new Set());
    setPropertyResults([]);
  };

  const handleAreaSelect = (areaName) => { setArea(areaName); setAreaSuggestions([]); };

  const handleSubmit = (e) => { e.preventDefault(); fetchAgents(); };

  const togglePurpose = (propertyTypeId) => {
    setSelectedPropertyTypeIds((prev) => {
      if (prev.includes(propertyTypeId)) {
        if (prev.length === 1) return prev;
        setSelectedAgents((prevSelected) =>
          prevSelected.filter((key) => !key.endsWith(`::${propertyTypeId}`))
        );
        return prev.filter((id) => id !== propertyTypeId);
      }
      return [...prev, propertyTypeId];
    });
  };

  const visibleRows = agentRows
    .filter((row) => selectedPropertyTypeIds.includes(row.propertyTypeId))
    .slice()
    .sort((a, b) => {
      const wasPrevious = (row) =>
        previouslySelectedKeys.has(row.rowKey) ||
        previouslySelectedKeys.has(makeRowKey(row._id, row.propertyTypeId)) ||
        previouslySelectedKeys.has(makeRowKey(row.agentId, row.propertyTypeId));
      return (wasPrevious(a) ? 1 : 0) - (wasPrevious(b) ? 1 : 0);
    });

  const handleContinue = () => setShowConfirmPopup(true);

  const handleConfirmProceed = () => {
    const chosenRows = visibleRows.filter((row) => selectedAgents.includes(row.rowKey));
    setShowConfirmPopup(false);
    navigate("/phoneform", {
      state: {
        agents: chosenRows, city, area,
        propertyTypeId: selectedPropertyTypeIds[0] || "",
        propertyTypeName: chosenRows[0]?.propertyTypeName || "",
        agentRows, selectedAgents,
      },
    });
  };

  const handleCancel = () => setSelectedAgents([]);

  const toggleAgentSelection = (rowKey) => {
    setSelectedAgents((prev) =>
      prev.includes(rowKey) ? prev.filter((k) => k !== rowKey) : [...prev, rowKey]
    );
  };

  const selectedPurposeLabel = propertyTypes
    .filter((t) => selectedPropertyTypeIds.includes(t.propertyTypeId))
    .map((t) => t.propertyType)
    .join(", ") || "Rent";

  const { min: activMin, max: activMax } = getActiveBudget();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #fff7f3 0%, #ffe8dc 50%, #fff7f3 100%)" }}
    >
      {/* Navbar */}
      <nav
        style={{ background: "rgba(255,255,255,0.8)", borderBottom: "1px solid #fdd9c8", backdropFilter: "blur(10px)" }}
        className="flex items-center justify-between px-8 py-4 shadow-sm"
      >
        <div style={{ color: "#c2511f" }} className="text-xl font-extrabold tracking-wide cursor-pointer" onClick={() => navigate("/")}>
          DWELLAGENT
        </div>
        <button
          onClick={() => navigate("/agent")}
          style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
          className="px-5 py-2 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-90 transition"
        >
          Agent
        </button>
      </nav>

      <main className="flex flex-col items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* City */}
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
              {citySuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-orange-100 z-50">
                  {citySuggestions.map((item, i) => (
                    <button key={i} type="button" onClick={() => handleCitySelect(item.display_name)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 border-b last:border-b-0 text-slate-900 transition">
                      {item.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {city.length > 1 && citySuggestions.length === 0 && !selectedCity && (
              <p className="text-sm mt-1 ml-2" style={{ color: "#a8674a" }}>
                No cities found for "<span className="font-semibold">{city}</span>". Try a different name.
              </p>
            )}

            {/* Area */}
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
                  onChange={(e) => setArea(e.target.value)}
                  disabled={!selectedCity}
                  autoComplete="off"
                />
              </div>
              {areaSuggestions.length > 0 && selectedCity && !area && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-orange-100 z-50 max-h-64 overflow-y-auto">
                  <div className="p-2 text-xs text-slate-500 border-b">{areaSuggestions.length} areas found</div>
                  {areaSuggestions.map((areaName, i) => (
                    <button key={i} type="button" onClick={() => handleAreaSelect(areaName)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-orange-50 border-b last:border-b-0 text-slate-900 transition">
                      {areaName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Req 6 — Budget Range Filter with presets */}
            <div
              style={{ background: "#fff", border: "1px solid #fdd9c8" }}
              className="rounded-2xl p-4 shadow-sm flex flex-col gap-3"
            >
              <label style={{ color: "#7c2d12" }} className="text-xs font-bold uppercase tracking-wide">
                Budget Range
              </label>
              {/* Preset buttons */}
              <div className="flex gap-2 flex-wrap">
                {BUDGET_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => applyBudgetPreset(preset)}
                    style={budgetFilter === preset.value
                      ? { background: "linear-gradient(135deg, #e8724a, #f59e6c)", color: "#fff" }
                      : { background: "#fff8f5", color: "#c2511f", border: "1px solid #fdd9c8" }}
                    className="px-4 py-1.5 rounded-full text-xs font-bold transition hover:opacity-90"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom inputs — shown only when custom is selected */}
              {budgetFilter === "custom" && (
                <div className="flex gap-3 items-center">
                  <div className="flex items-center gap-2 rounded-full bg-orange-50 border border-orange-200 px-4 py-2 flex-1">
                    <span style={{ color: "#a8674a" }} className="text-sm font-medium">₹</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                      min="0"
                      className="flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none"
                    />
                  </div>
                  <span style={{ color: "#a8674a" }} className="font-bold text-sm">to</span>
                  <div className="flex items-center gap-2 rounded-full bg-orange-50 border border-orange-200 px-4 py-2 flex-1">
                    <span style={{ color: "#a8674a" }} className="text-sm font-medium">₹</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      min="0"
                      className="flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className="flex justify-end mt-1">
              <button
                type="submit"
                disabled={!selectedCity || !area || loading}
                style={selectedCity && area && !loading ? { background: "linear-gradient(135deg, #e8724a, #f59e6c)" } : {}}
                className={`flex h-12 px-8 items-center justify-center rounded-full text-white font-bold text-sm tracking-wider shadow-md transition duration-200 ${!selectedCity || !area || loading
                  ? "bg-slate-300 cursor-not-allowed shadow-none"
                  : "hover:opacity-95 transform hover:-translate-y-0.5"
                  }`}
              >
                🔍 SEARCH
              </button>
            </div>
          </form>

          {/* Purpose Buttons */}
          <div className="mt-4">
            <label style={{ color: "#7c2d12", fontWeight: "bold", fontSize: "14px" }}>
              Purpose (select one or more)
            </label>
            <div className="flex gap-3 mt-2 flex-wrap">
              {propertyTypes.map((type) => {
                const isActive = selectedPropertyTypeIds.includes(type.propertyTypeId);
                return (
                  <button
                    key={type.propertyTypeId} type="button"
                    onClick={() => togglePurpose(type.propertyTypeId)}
                    style={isActive
                      ? { background: "linear-gradient(135deg, #e8724a, #f59e6c)", color: "#fff" }
                      : { background: "#fff", color: "#c2511f", border: "1px solid #fdd9c8" }}
                    className="px-5 py-2 rounded-full text-sm font-bold shadow-sm transition hover:opacity-90 flex items-center gap-2"
                  >
                    {isActive && <span>✓</span>}
                    {type.propertyType}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-[#c2511f] ring-1 ring-orange-200">
              City: {selectedCity || "Not selected"}
            </span>
            <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-orange-100">
              Area: {area || "Not selected"}
            </span>
            <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-orange-100">
              Purpose: {selectedPurposeLabel}
            </span>
            {(activMin || activMax) && (
              <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-orange-100">
                Budget: {activMin ? `₹${Number(activMin).toLocaleString()}` : "Any"} — {activMax ? `₹${Number(activMax).toLocaleString()}` : "Any"}
              </span>
            )}
          </div>

          {/* View Mode Toggle — Req 7 */}
          {searchPerformed && !loading && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setViewMode("agents")}
                style={viewMode === "agents"
                  ? { background: "linear-gradient(135deg, #e8724a, #f59e6c)", color: "#fff" }
                  : { background: "#fff", color: "#c2511f", border: "1px solid #fdd9c8" }}
                className="px-5 py-2 rounded-full text-sm font-bold shadow-sm transition hover:opacity-90"
              >
                👤 View Agents
              </button>
              <button
                onClick={() => { setViewMode("properties"); fetchProperties(); }}
                style={viewMode === "properties"
                  ? { background: "linear-gradient(135deg, #e8724a, #f59e6c)", color: "#fff" }
                  : { background: "#fff", color: "#c2511f", border: "1px solid #fdd9c8" }}
                className="px-5 py-2 rounded-full text-sm font-bold shadow-sm transition hover:opacity-90"
              >
                🏠 View Properties
              </button>
            </div>
          )}

          {loading && (
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e8724a]"></div>
            </div>
          )}

          {/* No Results — Agents */}
          {searchPerformed && !loading && viewMode === "agents" && visibleRows.length === 0 && (
            <div className="mt-6 rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-lg">
              <div className="text-5xl mb-4">🏠</div>
              <h3 style={{ color: "#7c2d12" }} className="text-xl font-extrabold mb-2">No Agents Found</h3>
              <p style={{ color: "#a8674a" }} className="text-sm">
                No agents found in <span className="font-bold">{area}</span>, <span className="font-bold">{city}</span> for {selectedPurposeLabel}
                {(activMin || activMax) ? ` within the selected budget range.` : `.`}
              </p>
            </div>
          )}

          {/* No Results — Properties */}
          {searchPerformed && !loading && viewMode === "properties" && propertyResults.length === 0 && (
            <div className="mt-6 rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-lg">
              <div className="text-5xl mb-4">🏠</div>
              <h3 style={{ color: "#7c2d12" }} className="text-xl font-extrabold mb-2">No Properties Found</h3>
              <p style={{ color: "#a8674a" }} className="text-sm">Try adjusting your budget range or purpose filter.</p>
            </div>
          )}

          {/* Agents Results */}
          {viewMode === "agents" && visibleRows.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-3xl bg-white text-slate-800 shadow-xl border border-orange-100">
              <div className="border-b border-orange-100 bg-orange-50/50 px-6 py-4 text-sm font-bold text-slate-700">
                Results ({visibleRows.length})
              </div>
              <div className="divide-y divide-orange-100">
                {visibleRows.map((row) => (
                  <label key={row.rowKey}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-orange-50/30 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAgents.includes(row.rowKey)}
                      onChange={() => toggleAgentSelection(row.rowKey)}
                      className="h-5 w-5 accent-[#e8724a]"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">{row.firstName} {row.lastName}</div>
                      <div className="text-sm text-slate-500">Area: {row.area}</div>
                      <div className="text-sm text-[#c2511f] font-semibold mt-0.5">
                        {row.propertyTypeName}: {row.filteredCount}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex justify-center gap-4 border-t border-orange-100 bg-orange-50/20 px-6 py-5">
                <button
                  type="button" onClick={handleContinue}
                  disabled={selectedAgents.length === 0}
                  style={selectedAgents.length > 0 ? { background: "linear-gradient(135deg, #e8724a, #f59e6c)" } : {}}
                  className={`rounded-full px-8 py-2.5 font-bold text-white shadow-md transition ${selectedAgents.length > 0 ? "hover:opacity-90" : "cursor-not-allowed bg-slate-300 shadow-none"}`}
                >
                  Continue
                </button>
                <button
                  type="button" onClick={handleCancel}
                  disabled={selectedAgents.length === 0}
                  className={`rounded-full px-8 py-2.5 font-bold border transition ${selectedAgents.length > 0
                    ? "border-red-200 text-red-500 bg-red-50 hover:bg-red-100"
                    : "cursor-not-allowed border-slate-200 text-slate-400 bg-slate-50"}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Req 7 — Properties Results with per-property photos, videos and map */}
          {viewMode === "properties" && propertyResults.length > 0 && (
            <div className="mt-6 flex flex-col gap-5">
              <div style={{ color: "#7c2d12" }} className="font-bold text-sm">
                Properties ({propertyResults.length})
              </div>

              {[...propertyResults]
                .sort((a, b) => {
                  const wasPrevious = (prop) => {
                    const agentId = prop.agent?.agentId || prop.agentId || "";
                    return selectedPropertyTypeIds.some((ptId) =>
                      previouslySelectedKeys.has(makeRowKey(agentId, ptId))
                    );
                  };
                  return (wasPrevious(a) ? 1 : 0) - (wasPrevious(b) ? 1 : 0);
                })
                .map((prop) => {
                  const currentPhotoIdx = activePhotoIndex[prop._id] || 0;
                  const hasPhotos = prop.hasPhotos && prop.photoUrls?.length > 0;
                  const hasVideos = prop.hasVideos && prop.videoUrls?.length > 0;

                  return (
                    <div
                      key={prop._id}
                      style={{ background: "#fff", border: "1px solid #fdd9c8" }}
                      className="rounded-2xl overflow-hidden shadow-md"
                    >
                      {/* Media section */}
                      {hasPhotos && playingVideo !== prop._id && (
                        <div className="relative">
                          <img
                            src={prop.photoUrls[currentPhotoIdx]}
                            alt={`Property photo ${currentPhotoIdx + 1}`}
                            className="w-full h-56 object-cover"
                          />
                          {/* Photo navigation */}
                          {prop.photoUrls.length > 1 && (
                            <>
                              <button
                                onClick={() => setActivePhotoIndex((prev) => ({
                                  ...prev, [prop._id]: Math.max(0, (prev[prop._id] || 0) - 1)
                                }))}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/60 transition text-lg"
                              >‹</button>
                              <button
                                onClick={() => setActivePhotoIndex((prev) => ({
                                  ...prev, [prop._id]: Math.min(prop.photoUrls.length - 1, (prev[prop._id] || 0) + 1)
                                }))}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/60 transition text-lg"
                              >›</button>
                              {/* Dots */}
                              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                                {prop.photoUrls.map((_, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setActivePhotoIndex((prev) => ({ ...prev, [prop._id]: i }))}
                                    className={`w-2 h-2 rounded-full transition ${i === currentPhotoIdx ? "bg-white" : "bg-white/50"}`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                          {/* Photo count */}
                          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                            📷 {currentPhotoIdx + 1}/{prop.photoUrls.length}
                          </div>
                          {/* Video button */}
                          {hasVideos && (
                            <button
                              onClick={() => setPlayingVideo(prop._id)}
                              style={{ background: "rgba(232,114,74,0.9)" }}
                              className="absolute bottom-2 left-2 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 hover:opacity-90 transition"
                            >
                              ▶ Watch Video
                            </button>
                          )}
                        </div>
                      )}

                      {/* Video player */}
                      {hasVideos && playingVideo === prop._id && (
                        <div className="relative">
                          <video
                            src={prop.videoUrls[0]}
                            controls autoPlay
                            className="w-full h-56 object-cover bg-black"
                          />
                          <button
                            onClick={() => setPlayingVideo(null)}
                            className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full"
                          >
                            ✕ Close Video
                          </button>
                        </div>
                      )}

                      {/* No photos message — shown per property */}
                      {!hasPhotos && playingVideo !== prop._id && (
                        <div
                          style={{ background: "#fff8f5", borderBottom: "1px solid #fdd9c8" }}
                          className="w-full h-32 flex flex-col items-center justify-center gap-1"
                        >
                          <span className="text-3xl">📷</span>
                          <p style={{ color: "#a8674a" }} className="text-xs font-medium">
                            No photos available for this property
                          </p>
                          {hasVideos && (
                            <button
                              onClick={() => setPlayingVideo(prop._id)}
                              style={{ background: "rgba(232,114,74,0.9)" }}
                              className="text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 hover:opacity-90 transition mt-1"
                            >
                              ▶ Watch Video
                            </button>
                          )}
                        </div>
                      )}

                      <div className="p-5 flex flex-col gap-2">
                        <div className="flex gap-2 flex-wrap">
                          <span
                            style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)", color: "#fff" }}
                            className="text-xs font-bold px-3 py-1 rounded-full"
                          >
                            {prop.propertyAvailableFor}
                          </span>
                          {prop.propertyType && (
                            <span
                              style={{ background: "#fff8f5", color: "#c2511f", border: "1px solid #fdd9c8" }}
                              className="text-xs font-semibold px-3 py-1 rounded-full"
                            >
                              {prop.propertyType}
                            </span>
                          )}
                          {prop.bhk && (
                            <span
                              style={{ background: "#fff8f5", color: "#c2511f", border: "1px solid #fdd9c8" }}
                              className="text-xs font-semibold px-3 py-1 rounded-full"
                            >
                              🛏️ {prop.bhk}
                            </span>
                          )}
                        </div>
                        <p style={{ color: "#7c2d12" }} className="font-bold text-sm">
                          {prop.agent
                            ? `${prop.agent.firstName || ""} ${prop.agent.lastName || ""}`.trim()
                            : "Agent"}
                        </p>

                        {/* Map — disabled for now, will be enabled once location data is wired up */}
                        <button
                          type="button"
                          disabled
                          title="Map view coming soon"
                          aria-disabled="true"
                          onClick={(e) => e.preventDefault()}
                          style={{
                            background: "#f4f4f4",
                            color: "#9ca3af",
                            border: "1px solid #e5e7eb",
                            cursor: "not-allowed",
                          }}
                          className="mt-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold w-full"
                        >
                          📍 View on Map <span className="text-[10px] font-semibold">(Coming Soon)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </main>

      {/* Confirm Popup */}
      {showConfirmPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(124, 45, 18, 0.3)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", border: "1px solid #fdd9c8" }}
            className="w-full max-w-md rounded-3xl p-8 shadow-2xl mx-4">
            <div style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow mb-4">
              💳
            </div>
            <h2 style={{ color: "#7c2d12" }} className="text-xl font-extrabold mb-2">Confirm Your Details</h2>
            <p style={{ color: "#a8674a" }} className="text-sm mb-6 leading-relaxed">
              Proceed to enter your details and receive agent contacts via SMS & WhatsApp.
            </p>
            <div style={{ background: "#fdd9c8" }} className="w-full h-px mb-6" />
            <button
              onClick={handleConfirmProceed}
              style={{ background: "linear-gradient(135deg, #e8724a, #f59e6c)" }}
              className="w-full text-white py-3 rounded-xl text-sm font-bold shadow hover:opacity-90 transition"
            >
              Continue →
            </button>
            <button
              onClick={() => setShowConfirmPopup(false)}
              style={{ borderColor: "#fdd9c8", color: "#c2511f" }}
              className="mt-3 w-full border-2 py-3 rounded-xl text-sm font-bold hover:bg-orange-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
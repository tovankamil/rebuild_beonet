import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Check, Loader2, Sparkles, SlidersHorizontal } from 'lucide-react';
import api from '../../services/api';

export default function IndonesianRegionSelect({
  province = '',
  city = '',
  district = '',
  postalCode = '',
  onChange,
  disabled = false,
  compact = false,
}) {
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Quick Search Auto-Suggest State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  const searchContainerRef = useRef(null);

  // 1. Fetch Provinces list once on mount
  useEffect(() => {
    let isMounted = true;
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const res = await api.get('/regions/provinces');
        if (isMounted && res.data?.data) {
          setProvinces(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load provinces:', err);
      } finally {
        if (isMounted) setLoadingProvinces(false);
      }
    };
    fetchProvinces();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Cities/Regencies whenever province changes
  useEffect(() => {
    let isMounted = true;
    if (!province) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const res = await api.get('/regions/regencies', {
          params: { province },
        });
        if (isMounted && res.data?.data) {
          setCities(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load cities:', err);
      } finally {
        if (isMounted) setLoadingCities(false);
      }
    };
    fetchCities();
    return () => {
      isMounted = false;
    };
  }, [province]);

  // 3. Fetch Districts whenever city/regency changes
  useEffect(() => {
    let isMounted = true;
    if (!city) {
      setDistricts([]);
      return;
    }

    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const res = await api.get('/regions/districts', {
          params: { province, regency: city },
        });
        if (isMounted && res.data?.data) {
          setDistricts(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load districts:', err);
      } finally {
        if (isMounted) setLoadingDistricts(false);
      }
    };
    fetchDistricts();
    return () => {
      isMounted = false;
    };
  }, [province, city]);

  // 4. Quick Search with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get('/regions/search', {
          params: { q: searchQuery.trim() },
        });
        if (res.data?.data) {
          setSearchResults(res.data.data);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Region search error:', err);
      } finally {
        setSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (item) => {
    onChange({
      province: item.provinsi,
      city: item.kabupaten,
      district: item.kecamatan,
      postalCode: postalCode || '',
    });
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
  };

  const handleProvinceSelect = (e) => {
    const newProv = e.target.value;
    onChange({
      province: newProv,
      city: '',
      district: '',
      postalCode: postalCode || '',
    });
  };

  const handleCitySelect = (e) => {
    const newCity = e.target.value;
    onChange({
      province,
      city: newCity,
      district: '',
      postalCode: postalCode || '',
    });
  };

  const handleDistrictSelect = (e) => {
    const newDist = e.target.value;
    onChange({
      province,
      city,
      district: newDist,
      postalCode: postalCode || '',
    });
  };

  const handlePostalCodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 5);
    onChange({
      province,
      city,
      district,
      postalCode: val,
    });
  };

  return (
    <div className="space-y-3">
      {/* Header Bar with Quick Search & Mode Switch */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <MapPin size={14} className="text-emerald-600" />
          <span>Wilayah Domisili (Database Kemendagri Bionet)</span>
        </div>
        <button
          type="button"
          onClick={() => setManualMode(!manualMode)}
          className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
        >
          <SlidersHorizontal size={11} />
          <span>{manualMode ? 'Mode Dropdown Otomatis' : 'Input Teks Manual'}</span>
        </button>
      </div>

      {/* Quick Search Auto-Suggest Input */}
      {!manualMode && (
        <div ref={searchContainerRef} className="relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (searchResults.length > 0) setShowSuggestions(true);
              }}
              placeholder="🔍 Ketik nama Kecamatan atau Kota untuk auto-fill (contoh: Coblong, Bandung, Sleman)..."
              disabled={disabled}
              className="w-full text-xs pl-8 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200/90 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <Sparkles size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600" />
            {searching && (
              <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
            )}
          </div>

          {/* Search Suggestions Popup */}
          {showSuggestions && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl max-h-56 overflow-y-auto z-50 divide-y divide-slate-100">
              <div className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70">
                Pilih Wilayah Terverifikasi:
              </div>
              {searchResults.map((item, idx) => (
                <button
                  key={`${item.provinsi}-${item.kabupaten}-${item.kecamatan}-${idx}`}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50/70 flex items-center justify-between group transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-800 group-hover:text-emerald-800">
                      Kec. {item.kecamatan}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {item.kabupaten}, {item.provinsi}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    Pilih
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form Fields: Either Cascading Dropdowns OR Manual Inputs */}
      {!manualMode ? (
        <>
          {/* Row 1: Provinsi & Kota/Kabupaten */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Provinsi Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Provinsi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={province}
                  onChange={handleProvinceSelect}
                  disabled={disabled || loadingProvinces}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 transition disabled:bg-slate-50"
                >
                  <option value="">
                    {loadingProvinces ? 'Memuat 34 Provinsi...' : '-- Pilih Provinsi --'}
                  </option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {loadingProvinces && (
                  <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin pointer-events-none" />
                )}
              </div>
            </div>

            {/* Kota / Kabupaten Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kota / Kabupaten <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={city}
                  onChange={handleCitySelect}
                  disabled={disabled || !province || loadingCities}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 transition disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {!province
                      ? 'Pilih Provinsi Dahulu'
                      : loadingCities
                      ? 'Memuat Kota/Kabupaten...'
                      : '-- Pilih Kota / Kabupaten --'}
                  </option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {loadingCities && (
                  <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin pointer-events-none" />
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Kecamatan & Kode Pos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Kecamatan Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kecamatan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={district}
                  onChange={handleDistrictSelect}
                  disabled={disabled || !city || loadingDistricts}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 transition disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {!city
                      ? 'Pilih Kota/Kab Dahulu'
                      : loadingDistricts
                      ? 'Memuat Kecamatan...'
                      : '-- Pilih Kecamatan --'}
                  </option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {loadingDistricts && (
                  <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin pointer-events-none" />
                )}
              </div>
            </div>

            {/* Kode Pos Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kode Pos <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={5}
                value={postalCode}
                onChange={handlePostalCodeChange}
                placeholder="Contoh: 40132"
                disabled={disabled}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 font-mono transition"
              />
            </div>
          </div>
        </>
      ) : (
        /* Manual Fallback Inputs */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Provinsi</label>
            <input
              type="text"
              required
              value={province}
              onChange={(e) => onChange({ province: e.target.value, city, district, postalCode })}
              placeholder="Nama Provinsi"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kota / Kabupaten</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => onChange({ province, city: e.target.value, district, postalCode })}
              placeholder="Nama Kota / Kabupaten"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kecamatan</label>
            <input
              type="text"
              required
              value={district}
              onChange={(e) => onChange({ province, city, district: e.target.value, postalCode })}
              placeholder="Nama Kecamatan"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kode Pos</label>
            <input
              type="text"
              required
              maxLength={5}
              value={postalCode}
              onChange={handlePostalCodeChange}
              placeholder="40132"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono"
            />
          </div>
        </div>
      )}
    </div>
  );
}

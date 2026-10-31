import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const DEFAULT_BRANDING = {
  id: 'default',
  app_name: 'BIONET',
  app_tagline: 'Mitra Enterprise Hub',
  logo_url: '',
  favicon_url: '',
  primary_color: '#059669',
  secondary_color: '#06b6d4',
  accent_color: '#f59e0b',
};

const BrandingContext = createContext({
  branding: DEFAULT_BRANDING,
  loading: false,
  updateBrandingState: () => {},
  refreshBranding: async () => {},
});

function hexToRgb(hex) {
  let clean = (hex || '').replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6) {
    return { r: 5, g: 150, b: 105 }; // Default emerald
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

const applyThemeVariables = (data) => {
  if (!data || typeof document === 'undefined') return;
  const root = document.documentElement;
  const primaryHex = data.primary_color || '#059669';
  const secondaryHex = data.secondary_color || '#06b6d4';
  const accentHex = data.accent_color || '#f59e0b';

  const pRgb = hexToRgb(primaryHex);
  const sRgb = hexToRgb(secondaryHex);

  // 1. Primary Colors
  root.style.setProperty('--theme-primary', primaryHex);
  root.style.setProperty('--theme-primary-rgb', `${pRgb.r}, ${pRgb.g}, ${pRgb.b}`);
  root.style.setProperty('--theme-primary-hover', `rgb(${Math.round(pRgb.r * 0.85)}, ${Math.round(pRgb.g * 0.85)}, ${Math.round(pRgb.b * 0.85)})`);
  root.style.setProperty('--theme-primary-active', `rgb(${Math.round(pRgb.r * 0.75)}, ${Math.round(pRgb.g * 0.75)}, ${Math.round(pRgb.b * 0.75)})`);
  root.style.setProperty('--theme-primary-light', `rgb(${Math.min(255, pRgb.r + 65)}, ${Math.min(255, pRgb.g + 65)}, ${Math.min(255, pRgb.b + 65)})`);
  root.style.setProperty('--theme-primary-dim', `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.08)`);
  root.style.setProperty('--theme-primary-dim-hover', `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.16)`);
  root.style.setProperty('--theme-primary-border', `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.28)`);
  root.style.setProperty('--theme-primary-glow', `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.35)`);
  root.style.setProperty('--theme-primary-dark', `rgb(${Math.max(6, Math.round(pRgb.r * 0.12))}, ${Math.max(8, Math.round(pRgb.g * 0.12))}, ${Math.max(12, Math.round(pRgb.b * 0.15))})`);

  // 2. Secondary Colors
  root.style.setProperty('--theme-secondary', secondaryHex);
  root.style.setProperty('--theme-secondary-rgb', `${sRgb.r}, ${sRgb.g}, ${sRgb.b}`);
  root.style.setProperty('--theme-secondary-hover', `rgb(${Math.round(sRgb.r * 0.85)}, ${Math.round(sRgb.g * 0.85)}, ${Math.round(sRgb.b * 0.85)})`);
  root.style.setProperty('--theme-secondary-light', `rgb(${Math.min(255, sRgb.r + 55)}, ${Math.min(255, sRgb.g + 55)}, ${Math.min(255, sRgb.b + 55)})`);
  root.style.setProperty('--theme-secondary-dim', `rgba(${sRgb.r}, ${sRgb.g}, ${sRgb.b}, 0.09)`);
  root.style.setProperty('--theme-secondary-border', `rgba(${sRgb.r}, ${sRgb.g}, ${sRgb.b}, 0.28)`);
  root.style.setProperty('--theme-secondary-dark', `rgb(${Math.max(6, Math.round(sRgb.r * 0.12))}, ${Math.max(8, Math.round(sRgb.g * 0.12))}, ${Math.max(12, Math.round(sRgb.b * 0.15))})`);

  // 3. Dynamic Sidebar Hue Tone
  const sbR = Math.max(7, Math.round(pRgb.r * 0.06));
  const sbG = Math.max(9, Math.round(pRgb.g * 0.07));
  const sbB = Math.max(14, Math.round(pRgb.b * 0.09));
  root.style.setProperty('--theme-sidebar-bg', `rgb(${sbR}, ${sbG}, ${sbB})`);
  root.style.setProperty('--theme-sidebar-active', `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.22)`);
  root.style.setProperty('--theme-sidebar-border', `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.18)`);

  // 4. Backward Compatibility Tokens
  root.style.setProperty('--bionet-primary', primaryHex);
  root.style.setProperty('--bionet-cyan', secondaryHex);
  root.style.setProperty('--theme-accent', accentHex);

  // If custom app name, update document title prefix
  if (data.app_name && typeof document !== 'undefined') {
    if (!document.title.includes(data.app_name)) {
      document.title = `${data.app_name} - ${data.app_tagline || 'Mitra Enterprise Hub'}`;
    }
  }
};

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(() => {
    try {
      const saved = localStorage.getItem('bionet_branding');
      if (saved) {
        const parsed = JSON.parse(saved);
        applyThemeVariables(parsed);
        return { ...DEFAULT_BRANDING, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse cached branding:', e);
    }
    applyThemeVariables(DEFAULT_BRANDING);
    return DEFAULT_BRANDING;
  });

  const [loading, setLoading] = useState(false);

  const refreshBranding = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/public/branding');
      if (res.data?.data) {
        const data = { ...DEFAULT_BRANDING, ...res.data.data };
        setBranding(data);
        applyThemeVariables(data);
        try {
          localStorage.setItem('bionet_branding', JSON.stringify(data));
        } catch {}
      }
    } catch (err) {
      console.warn('Failed to fetch public branding, using default/cached:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBrandingState = useCallback((updated) => {
    setBranding((prev) => {
      const next = { ...prev, ...updated };
      applyThemeVariables(next);
      try {
        localStorage.setItem('bionet_branding', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    refreshBranding();
  }, [refreshBranding]);

  return (
    <BrandingContext.Provider
      value={{
        branding,
        loading,
        updateBrandingState,
        refreshBranding,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    return {
      branding: DEFAULT_BRANDING,
      loading: false,
      updateBrandingState: () => {},
      refreshBranding: async () => {},
    };
  }
  return context;
}

export { applyThemeVariables };

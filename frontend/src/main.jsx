import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 1. Service Worker Lifecycle Management
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    // Di mode pengembangan (dev), hapus service worker dan cache lama untuk mencegah white screen
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister();
        console.log('[Bionet SW] Service worker dibersihkan di mode development');
      }
    });
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name);
        }
      });
    }
  } else {
    // Mode produksi: daftarkan PWA service worker
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[Bionet SW] Registered scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[Bionet SW] Registration failed:', err);
        });
    });
  }
}

// 2. Global Error Boundary Component untuk menangkap runtime exception
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Bionet Global Error Boundary Caught]:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#071e17',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '480px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '24px',
            padding: '32px 24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{ fontSize: '42px', marginBottom: '12px' }}>🌿</div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: '#34d399' }}>
              Bionet Mitra Hub
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.5' }}>
              Terjadi pembaruan modul antarmuka atau sesi browser Anda memerlukan penyegaran.
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  backgroundColor: '#10b981',
                  color: '#022c22',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Muat Ulang Halaman
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  backgroundColor: 'transparent',
                  color: '#e2e8f0',
                  fontWeight: '600',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Bersihkan Sesi &amp; Mulai Ulang
              </button>
            </div>
            {this.state.error && (
              <pre style={{
                marginTop: '20px',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0,0,0,0.4)',
                color: '#f87171',
                fontSize: '11px',
                overflowX: 'auto',
                textAlign: 'left'
              }}>
                {String(this.state.error.message || this.state.error)}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);

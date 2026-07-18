'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Users, Eye, TrendingUp, LogOut, Info, Clipboard } from 'lucide-react';

interface DailyStat {
  date: string;
  views_count: number;
  unique_visitors: number;
}

interface AnalyticsClientProps {
  logoutAction: () => Promise<void>;
}

export default function AnalyticsClient({ logoutAction }: AnalyticsClientProps) {
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState(0);
  const [pageViews, setPageViews] = useState<DailyStat[]>([]);
  const [tablesNotCreated, setTablesNotCreated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchStats = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data.success) {
        setActiveUsers(data.activeUsers);
        setPageViews(data.pageViews || []);
        setTablesNotCreated(data.tablesNotCreated);
      }
    } catch (err) {
      console.error('Error fetching analytics stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll stats every 15 seconds to keep active users count updated in real time
    const interval = setInterval(() => {
      fetchStats(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const totalViews = pageViews.reduce((sum, item) => sum + item.views_count, 0);
  const totalUniques = pageViews.reduce((sum, item) => sum + item.unique_visitors, 0);

  // SQL code to setup tables in Supabase
  const sqlCode = `-- 1. Crear tabla para vistas de página diarias
CREATE TABLE IF NOT EXISTS page_views_daily (
  date DATE PRIMARY KEY,
  views_count INTEGER DEFAULT 0 NOT NULL,
  unique_visitors INTEGER DEFAULT 0 NOT NULL
);

-- 2. Crear tabla para sesiones activas en tiempo real
CREATE TABLE IF NOT EXISTS active_sessions (
  session_id TEXT PRIMARY KEY,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar permisos de lectura y escritura públicos para operaciones anónimas
ALTER TABLE page_views_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir inserciones y actualizaciones públicas" 
ON page_views_daily FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Permitir todas las operaciones en sesiones activas" 
ON active_sessions FOR ALL 
USING (true) 
WITH CHECK (true);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find max value in chart to scale SVG heights
  const maxVal = Math.max(...pageViews.map(p => Math.max(p.views_count, p.unique_visitors)), 10);

  return (
    <div style={{
      backgroundColor: '#0a0a0c',
      minHeight: '100vh',
      color: '#ededf0',
      fontFamily: 'Poppins, system-ui, sans-serif',
      paddingBottom: '60px'
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid #1c1c1f',
        backgroundColor: '#121214',
        padding: '20px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
              Core News <span style={{ color: '#10b981', fontWeight: 500 }}>Analítica</span>
            </h1>
            <p style={{ fontSize: '12px', color: '#71717a', margin: '2px 0 0 0' }}>
              Métricas y tráfico de la web en tiempo real
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => fetchStats(true)}
              disabled={refreshing}
              style={{
                backgroundColor: '#1c1c1f',
                border: '1px solid #27272a',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#ededf0',
                transition: 'background-color 0.2s'
              }}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>

            <button
              onClick={() => logoutAction()}
              style={{
                backgroundColor: '#ef4444',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#ffffff',
                transition: 'background-color 0.2s'
              }}
            >
              <LogOut size={14} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '40px auto 0 auto', padding: '0 24px' }}>
        
        {tablesNotCreated && (
          <div style={{
            backgroundColor: '#180f02',
            border: '1px solid #f59e0b',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Info size={24} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: '#f59e0b' }}>
                  Tablas de Analítica no creadas en Supabase
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#d97706', lineHeight: 1.5 }}>
                  Para activar el seguimiento real de visitas, debes crear las tablas de analítica en tu panel de control de Supabase. Copia el siguiente código SQL y ejecútalo en la sección <strong>SQL Editor</strong> de tu proyecto de Supabase.
                </p>
              </div>
            </div>

            <div style={{ position: 'relative', marginTop: '8px' }}>
              <pre style={{
                backgroundColor: '#0a0a0c',
                border: '1px solid #27272a',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '11px',
                color: '#10b981',
                overflowX: 'auto',
                fontFamily: 'monospace',
                margin: 0
              }}>
                {sqlCode}
              </pre>
              <button
                onClick={copyToClipboard}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: '#1c1c1f',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Clipboard size={12} />
                {copied ? 'Copiado!' : 'Copiar Código'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <RefreshCw size={40} className="animate-spin" style={{ color: '#10b981', margin: '0 auto 16px auto' }} />
            <p style={{ fontSize: '15px', color: '#71717a' }}>Cargando métricas de la web...</p>
          </div>
        ) : (
          <>
            {/* Key Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              {/* Active Users */}
              <div style={{
                backgroundColor: '#121214',
                border: '1px solid #1c1c1f',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#71717a', margin: '0 0 6px 0' }}>
                    USUARIOS ACTIVOS AHORA
                  </p>
                  <h2 style={{ fontSize: '36px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    {activeUsers}
                  </h2>
                  <p style={{ fontSize: '11px', color: '#10b981', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      display: 'inline-block',
                      boxShadow: '0 0 8px #10b981'
                    }} className="animate-pulse" />
                    En vivo
                  </p>
                </div>
                <div style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  color: '#10b981'
                }}>
                  <Users size={32} />
                </div>
              </div>

              {/* Total Views (7 Days) */}
              <div style={{
                backgroundColor: '#121214',
                border: '1px solid #1c1c1f',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#71717a', margin: '0 0 6px 0' }}>
                    PÁGINAS VISTAS (7 DÍAS)
                  </p>
                  <h2 style={{ fontSize: '36px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    {totalViews}
                  </h2>
                  <p style={{ fontSize: '11px', color: '#71717a', margin: '4px 0 0 0' }}>
                    Total acumulado en la última semana
                  </p>
                </div>
                <div style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  color: '#3b82f6'
                }}>
                  <Eye size={32} />
                </div>
              </div>

              {/* Unique Visitors (7 Days) */}
              <div style={{
                backgroundColor: '#121214',
                border: '1px solid #1c1c1f',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#71717a', margin: '0 0 6px 0' }}>
                    VISITANTES ÚNICOS (7 DÍAS)
                  </p>
                  <h2 style={{ fontSize: '36px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    {totalUniques}
                  </h2>
                  <p style={{ fontSize: '11px', color: '#71717a', margin: '4px 0 0 0' }}>
                    Usuarios individuales identificados
                  </p>
                </div>
                <div style={{
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  color: '#a855f7'
                }}>
                  <TrendingUp size={32} />
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div style={{
              backgroundColor: '#121214',
              border: '1px solid #1c1c1f',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '40px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 20px 0', letterSpacing: '-0.3px' }}>
                Historial de Tráfico Diario (Últimos 7 Días)
              </h3>

              {pageViews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 24px', color: '#71717a' }}>
                  No hay datos suficientes para graficar todavía. Se registrarán cuando entren visitas.
                </div>
              ) : (
                <div style={{ width: '100%', overflowX: 'auto' }}>
                  <div style={{ minWidth: '600px', padding: '10px 0' }}>
                    {/* SVG Chart Wrapper */}
                    <svg viewBox="0 0 600 240" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                      {/* Grid Lines */}
                      <line x1="40" y1="30" x2="580" y2="30" stroke="#1c1c1f" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="40" y1="90" x2="580" y2="90" stroke="#1c1c1f" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="40" y1="150" x2="580" y2="150" stroke="#1c1c1f" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="40" y1="210" x2="580" y2="210" stroke="#27272a" strokeWidth="1.5" />

                      {/* Y-Axis labels */}
                      <text x="30" y="34" fill="#71717a" fontSize="10" textAnchor="end">{Math.round(maxVal)}</text>
                      <text x="30" y="94" fill="#71717a" fontSize="10" textAnchor="end">{Math.round(maxVal * 0.66)}</text>
                      <text x="30" y="154" fill="#71717a" fontSize="10" textAnchor="end">{Math.round(maxVal * 0.33)}</text>
                      <text x="30" y="214" fill="#71717a" fontSize="10" textAnchor="end">0</text>

                      {pageViews.map((item, idx) => {
                        const x = 50 + idx * 75;
                        const barWidth = 20;
                        const maxBarHeight = 170; // From y=210 to y=40

                        // Calculate heights scaled to maxVal
                        const viewHeight = (item.views_count / maxVal) * maxBarHeight;
                        const uniqueHeight = (item.unique_visitors / maxVal) * maxBarHeight;

                        // Y position (bars grow upwards)
                        const viewY = 210 - viewHeight;
                        const uniqueY = 210 - uniqueHeight;

                        // Date label formatting
                        const dateLabel = item.date.substring(5); // MM-DD

                        return (
                          <g key={item.date}>
                            {/* Page Views Bar (Blue) */}
                            <rect
                              x={x}
                              y={viewY}
                              width={barWidth}
                              height={viewHeight}
                              fill="#3b82f6"
                              rx="3"
                              opacity="0.85"
                            />
                            {/* Unique Visitors Bar (Purple) */}
                            <rect
                              x={x + 24}
                              y={uniqueY}
                              width={barWidth}
                              height={uniqueHeight}
                              fill="#a855f7"
                              rx="3"
                              opacity="0.85"
                            />

                            {/* X Axis Date Label */}
                            <text
                              x={x + 22}
                              y="228"
                              fill="#71717a"
                              fontSize="10"
                              textAnchor="middle"
                              fontWeight="600"
                            >
                              {dateLabel}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                    
                    {/* Legend */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '24px',
                      marginTop: '16px',
                      fontSize: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '3px' }} />
                        <span style={{ color: '#a1a1aa', fontWeight: 500 }}>Páginas Vistas</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '12px', height: '12px', backgroundColor: '#a855f7', borderRadius: '3px' }} />
                        <span style={{ color: '#a1a1aa', fontWeight: 500 }}>Visitantes Únicos</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Table Details */}
            <div style={{
              backgroundColor: '#121214',
              border: '1px solid #1c1c1f',
              borderRadius: '16px',
              padding: '24px',
              overflow: 'hidden'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 20px 0', letterSpacing: '-0.3px' }}>
                Detalle Diario de Visitas
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1c1c1f' }}>
                      <th style={{ padding: '12px 16px', color: '#71717a', fontWeight: 600 }}>Fecha</th>
                      <th style={{ padding: '12px 16px', color: '#71717a', fontWeight: 600 }}>Páginas Vistas</th>
                      <th style={{ padding: '12px 16px', color: '#71717a', fontWeight: 600 }}>Visitantes Únicos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageViews.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: '#71717a' }}>
                          Esperando datos de visitas...
                        </td>
                      </tr>
                    ) : (
                      pageViews.map((item) => (
                        <tr key={item.date} style={{ borderBottom: '1px solid #1c1c1f', transition: 'background-color 0.2s' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 600, color: '#ffffff' }}>
                            {item.date}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#3b82f6', fontWeight: 600 }}>
                            {item.views_count}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#a855f7', fontWeight: 600 }}>
                            {item.unique_visitors}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

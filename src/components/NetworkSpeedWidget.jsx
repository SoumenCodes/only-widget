import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, Wifi } from 'lucide-react';

function formatNetworkSpeed(bytesPerSec) {
  if (!bytesPerSec || bytesPerSec <= 0) {
    return { val: '0.0', unit: 'Kbps' };
  }

  // Convert Bytes per second to Bits per second (1 Byte = 8 bits)
  const bitsPerSec = bytesPerSec * 8;

  // When speed is under 1 Mbps (1,000,000 bps or 1024*1024), show in Kbps
  if (bitsPerSec < 1000 * 1000) {
    const kbps = bitsPerSec / 1000;
    return {
      val: kbps < 10 ? kbps.toFixed(1) : Math.round(kbps).toString(),
      unit: 'Kbps'
    };
  } else if (bitsPerSec < 1000 * 1000 * 1000) {
    // 1 Mbps to 1000 Mbps
    const mbps = bitsPerSec / (1000 * 1000);
    return {
      val: mbps < 100 ? mbps.toFixed(1) : Math.round(mbps).toString(),
      unit: 'Mbps'
    };
  } else {
    // 1 Gbps+
    const gbps = bitsPerSec / (1000 * 1000 * 1000);
    return {
      val: gbps.toFixed(2),
      unit: 'Gbps'
    };
  }
}

export default function NetworkSpeedWidget() {
  const [netData, setNetData] = useState({
    iface: 'Wi-Fi',
    rx_sec: 0,
    tx_sec: 0
  });

  useEffect(() => {
    if (window.electronAPI?.onNetworkUpdate) {
      const cleanup = window.electronAPI.onNetworkUpdate((data) => {
        setNetData(data);
      });
      return cleanup;
    } else {
      const interval = setInterval(() => {
        setNetData({
          iface: 'Wi-Fi',
          rx_sec: Math.random() * 1.8 * 1024 * 1024 + 120000,
          tx_sec: Math.random() * 600 * 1024 + 35000
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, []);

  const downFormatted = formatNetworkSpeed(netData.rx_sec);
  const upFormatted = formatNetworkSpeed(netData.tx_sec);

  // Scale progress bar based on bits per sec (up to 50 Mbps full scale)
  const downBits = (netData.rx_sec || 0) * 8;
  const upBits = (netData.tx_sec || 0) * 8;
  const downPercent = Math.min(100, Math.max(6, (downBits / (50 * 1000 * 1000)) * 100));
  const upPercent = Math.min(100, Math.max(6, (upBits / (20 * 1000 * 1000)) * 100));

  return (
    <div
      className="widget-card no-drag"
      style={{
        padding: '14px 18px',
        background: '#151b2b',
        border: '1px solid rgba(255, 255, 255, 0.14)'
      }}
    >
      {/* Network Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Wifi size={14} color="var(--cyan-glow)" />
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)'
          }}>
            {netData.iface || 'Network'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="pulsing-dot" style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 10px #10b981'
          }} />
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, letterSpacing: '0.04em' }}>
            LIVE
          </span>
        </div>
      </div>

      {/* Speed Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px'
      }}>
        {/* Download Speed Pill */}
        <div className="net-pill net-down" style={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          background: '#0d273a',
          border: '1px solid rgba(6, 182, 212, 0.35)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '100%' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              background: '#083344',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ArrowDown size={13} color="#06b6d4" />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cyan-glow)', letterSpacing: '0.02em' }}>
              DOWNLOAD
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '6px' }}>
            <span className="mono-font" style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', lineHeight: '1' }}>
              {downFormatted.val}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--cyan-glow)', fontWeight: 700 }}>
              {downFormatted.unit}
            </span>
          </div>

          {/* Dynamic Fill Meter */}
          <div style={{
            width: '100%',
            height: '4px',
            background: '#164e63',
            borderRadius: '3px',
            marginTop: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${downPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #06b6d4, #38bdf8)',
              borderRadius: '3px',
              transition: 'width 0.35s ease'
            }} />
          </div>
        </div>

        {/* Upload Speed Pill */}
        <div className="net-pill net-up" style={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          background: '#23163a',
          border: '1px solid rgba(168, 85, 247, 0.35)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '100%' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              background: '#3b0764',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ArrowUp size={13} color="#c084fc" />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#c084fc', letterSpacing: '0.02em' }}>
              UPLOAD
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '6px' }}>
            <span className="mono-font" style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', lineHeight: '1' }}>
              {upFormatted.val}
            </span>
            <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 700 }}>
              {upFormatted.unit}
            </span>
          </div>

          {/* Dynamic Fill Meter */}
          <div style={{
            width: '100%',
            height: '4px',
            background: '#581c87',
            borderRadius: '3px',
            marginTop: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${upPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #a855f7, #d946ef)',
              borderRadius: '3px',
              transition: 'width 0.35s ease'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

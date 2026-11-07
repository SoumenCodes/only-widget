import React, { useState, useEffect } from 'react';
import { Calendar, Sun, Moon, MapPin } from 'lucide-react';

function getRealTimezoneInfo() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    
    const dtf = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' });
    const parts = dtf.formatToParts(now);
    const tzShort = parts.find(p => p.type === 'timeZoneName')?.value || '';

    const offsetMin = -now.getTimezoneOffset();
    const sign = offsetMin >= 0 ? '+' : '-';
    const h = Math.floor(Math.abs(offsetMin) / 60);
    const m = Math.abs(offsetMin) % 60;
    const gmt = `GMT${sign}${h}${m > 0 ? `:${String(m).padStart(2, '0')}` : ''}`;

    const city = tz.split('/')[1]?.replace(/_/g, ' ') || tz;
    return { tz, tzShort, gmt, city };
  } catch {
    return { tz: 'Local', tzShort: 'Local', gmt: '', city: 'Local Time' };
  }
}

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());
  const [realTz] = useState(getRealTimezoneInfo);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const rawHours = time.getHours();
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const isDay = rawHours >= 6 && rawHours < 18;

  // 12-hour format with AM/PM
  const ampm = rawHours >= 12 ? 'PM' : 'AM';
  const displayHours = rawHours % 12 || 12;
  const formattedHours = String(displayHours).padStart(2, '0');

  const weekdayName = time.toLocaleDateString(undefined, { weekday: 'long' });
  const fullDateStr = time.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div
      className="widget-card no-drag"
      style={{
        padding: '16px 18px 18px 18px',
        position: 'relative',
        background: '#151b2b',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        boxSizing: 'border-box'
      }}
    >
      {/* Ambient background glow for day vs night */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: isDay
          ? 'radial-gradient(circle, rgba(251, 191, 36, 0.16) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* BIG DAY & DATE ROW */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: '6px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#ffffff',
            lineHeight: '1.1'
          }}>
            {weekdayName}
          </span>
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            marginTop: '3px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Calendar size={13} color="var(--cyan-glow)" />
            {fullDateStr}
          </span>
        </div>

        {/* Day/Night Sun/Moon indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#1c2438',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '4px 9px',
          borderRadius: '10px'
        }}>
          {isDay ? (
            <Sun size={14} color="#fbbf24" />
          ) : (
            <Moon size={14} color="#c084fc" />
          )}
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            color: isDay ? '#fbbf24' : '#c084fc',
            letterSpacing: '0.04em'
          }}>
            {isDay ? 'DAY' : 'NIGHT'}
          </span>
        </div>
      </div>

      {/* BIG HERO 12-HOUR TIME */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '2px',
        margin: '4px 0 8px 0'
      }}>
        <span className="mono-font" style={{
          fontSize: '54px',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: '1',
          color: '#ffffff'
        }}>
          {formattedHours}:{minutes}
        </span>

        <span className="mono-font" style={{
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--cyan-glow)',
          marginLeft: '4px',
          lineHeight: '1'
        }}>
          :{seconds}
        </span>

        {/* Crisp AM/PM Badge */}
        <span style={{
          fontSize: '13px',
          fontWeight: 800,
          color: 'var(--cyan-glow)',
          marginLeft: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          background: 'rgba(6, 182, 212, 0.15)',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          padding: '2px 7px',
          borderRadius: '7px'
        }}>
          {ampm}
        </span>
      </div>

      {/* REAL DEVICE TIME ZONE BADGE */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: '#0d273a',
        border: '1px solid rgba(6, 182, 212, 0.35)',
        padding: '5px 11px',
        borderRadius: '10px'
      }}>
        <MapPin size={12} color="var(--cyan-glow)" />
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          color: '#ffffff'
        }}>
          {realTz.city}
        </span>
        <span style={{
          fontSize: '10px',
          fontWeight: 600,
          color: 'var(--cyan-glow)'
        }}>
          ({realTz.gmt})
        </span>
      </div>
    </div>
  );
}

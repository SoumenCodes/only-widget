import React from 'react';
import { Sun, Moon, Trash2 } from 'lucide-react';

function getRelativeOffset(targetTz) {
  try {
    const now = new Date();
    const localOffset = -now.getTimezoneOffset();

    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTz,
      timeZoneName: 'longOffset'
    });
    const parts = dtf.formatToParts(now);
    const tzPart = parts.find(p => p.type === 'timeZoneName')?.value || '';
    
    const match = tzPart.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
    if (!match) return '';

    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const mins = match[3] ? parseInt(match[3], 10) : 0;
    const targetOffset = sign * (hours * 60 + mins);

    const diffMinutes = targetOffset - localOffset;
    if (diffMinutes === 0) return 'Same time';

    const diffH = Math.floor(Math.abs(diffMinutes) / 60);
    const diffM = Math.abs(diffMinutes) % 60;
    const prefix = diffMinutes > 0 ? '+' : '-';
    
    if (diffM === 0) {
      return `${prefix}${diffH}h`;
    }
    return `${prefix}${diffH}h ${diffM}m`;
  } catch (e) {
    return '';
  }
}

export default function TimeZoneCard({ zone, onDelete }) {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  let formattedTime = '';
  let ampm = '';
  let hourNumber = 12;

  try {
    // Strictly 12-hour format with AM/PM
    const options = {
      timeZone: zone.tz,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    const hourOpt = { timeZone: zone.tz, hour: 'numeric', hour12: false };
    hourNumber = parseInt(new Intl.DateTimeFormat('en-US', hourOpt).format(currentTime), 10);

    const timeStr = new Intl.DateTimeFormat('en-US', options).format(currentTime);
    const parts = timeStr.split(' ');
    formattedTime = parts[0];
    ampm = parts[1] || '';
  } catch (err) {
    formattedTime = '--:--';
  }

  const isDay = hourNumber >= 6 && hourNumber < 18;
  const offsetStr = getRelativeOffset(zone.tz);

  return (
    <div
      className="widget-card no-drag"
      style={{
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#151b2b',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        transition: 'all 0.2s ease'
      }}
    >
      {/* City & Offset */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
            {zone.city}
          </span>
          {isDay ? (
            <Sun size={13} color="#fbbf24" />
          ) : (
            <Moon size={13} color="#c084fc" />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.02em' }}>
            {zone.tz.split('/')[1]?.replace(/_/g, ' ') || zone.tz}
          </span>
          {offsetStr && (
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '6px',
              background: '#1e263a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--cyan-glow)'
            }}>
              {offsetStr}
            </span>
          )}
        </div>
      </div>

      {/* Live 12-Hour Time with AM/PM */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span className="mono-font" style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
            {formattedTime}
          </span>
          <span style={{
            fontSize: '10px',
            fontWeight: 800,
            color: 'var(--cyan-glow)',
            letterSpacing: '0.04em'
          }}>
            {ampm}
          </span>
        </div>

        {/* Delete Button */}
        <button
          className="icon-btn"
          onClick={() => onDelete(zone.id)}
          title="Remove timezone"
          style={{ width: '24px', height: '24px', border: 'none', background: 'transparent' }}
        >
          <Trash2 size={13} color="#94a3b8" />
        </button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Search, X, Plus, Globe } from 'lucide-react';
import { POPULAR_TIMEZONES } from '../data/popularTimezones';

function getLiveTimeInTz(tz) {
  try {
    const now = new Date();
    const timeStr = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(now);
    return timeStr;
  } catch {
    return '--:--';
  }
}

export default function AddTimeZoneModal({ isOpen, onClose, onAdd, existingTzs }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  if (!isOpen) return null;

  const categories = ['All', 'Australia', 'Asia', 'Americas', 'Europe'];

  const filtered = POPULAR_TIMEZONES.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.city.toLowerCase().includes(term) ||
      item.region.toLowerCase().includes(term) ||
      item.tz.toLowerCase().includes(term);

    const matchesCategory =
      activeCategory === 'All' || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSelect = (item) => {
    onAdd({
      id: Date.now().toString(),
      city: item.city,
      tz: item.tz
    });
    onClose();
  };

  return (
    <div className="no-drag" style={{
      position: 'absolute',
      inset: '0',
      background: '#0f1422',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      borderRadius: '18px',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      padding: '16px',
      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.95)',
      boxSizing: 'border-box'
    }}>
      {/* Modal Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '8px',
            background: 'var(--cyan-solid)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Globe size={15} color="var(--cyan-glow)" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
              Add World Time
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
              Select a city or search below
            </div>
          </div>
        </div>

        <button
          className="icon-btn"
          onClick={onClose}
          style={{ width: '28px', height: '28px' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Search Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#192033',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        borderRadius: '12px',
        padding: '9px 12px',
        marginBottom: '10px'
      }}>
        <Search size={15} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search Australia, Sydney, Perth, London..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#ffffff',
            fontSize: '12px',
            width: '100%',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Quick Category Filter Pills */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        marginBottom: '12px'
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              background: activeCategory === cat ? 'var(--cyan-solid)' : '#192033',
              border: activeCategory === cat ? '1px solid var(--cyan-glow)' : '1px solid rgba(255, 255, 255, 0.10)',
              color: activeCategory === cat ? 'var(--cyan-glow)' : 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {cat === 'Australia' ? '🇦🇺 Australia' : cat}
          </button>
        ))}
      </div>

      {/* Timezone List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '7px',
        paddingRight: '2px',
        minHeight: '260px'
      }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: 'var(--text-dim)',
            fontSize: '12px',
            marginTop: '40px'
          }}>
            No matching time zones found
          </div>
        ) : (
          filtered.map((item) => {
            const alreadyAdded = existingTzs.some(e => e.tz === item.tz);
            const liveTime = getLiveTimeInTz(item.tz);

            return (
              <div
                key={item.tz}
                onClick={() => !alreadyAdded && handleSelect(item)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: alreadyAdded ? '#131826' : '#192033',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: alreadyAdded ? 'default' : 'pointer',
                  opacity: alreadyAdded ? 0.45 : 1,
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!alreadyAdded) e.currentTarget.style.background = '#222c44';
                }}
                onMouseLeave={(e) => {
                  if (!alreadyAdded) e.currentTarget.style.background = '#192033';
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>
                    {item.city}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                    {item.region}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="mono-font" style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--cyan-glow)',
                    background: '#0d273a',
                    padding: '3px 7px',
                    borderRadius: '6px'
                  }}>
                    {liveTime}
                  </span>

                  {alreadyAdded ? (
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Added</span>
                  ) : (
                    <Plus size={15} color="var(--cyan-glow)" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

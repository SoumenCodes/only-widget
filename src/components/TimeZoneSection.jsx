import React from 'react';
import { Globe, Plus } from 'lucide-react';
import TimeZoneCard from './TimeZoneCard';

export default function TimeZoneSection({
  timezones,
  onOpenModal,
  onDeleteTimeZone
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Globe size={13} color="var(--violet-glow)" />
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)'
          }}>
            World Times ({timezones.length})
          </span>
        </div>

        <button
          className="no-drag"
          onClick={onOpenModal}
          style={{
            background: '#23163a',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '8px',
            padding: '4px 10px',
            color: '#c084fc',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#321d52';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#23163a';
          }}
        >
          <Plus size={12} />
          <span>Add</span>
        </button>
      </div>

      {/* Timezone Cards Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: '235px',
        overflowY: 'auto',
        paddingRight: '2px',
        paddingBottom: '4px'
      }}>
        {timezones.length === 0 ? (
          <div className="widget-card no-drag" style={{
            padding: '16px',
            textAlign: 'center',
            color: 'var(--text-dim)',
            fontSize: '12px',
            background: '#151b2b',
            border: '1px solid rgba(255, 255, 255, 0.10)'
          }}>
            No extra time zones added yet.
            <div
              style={{ marginTop: '4px', color: 'var(--cyan-glow)', cursor: 'pointer', fontWeight: 600 }}
              onClick={onOpenModal}
            >
              + Add a city
            </div>
          </div>
        ) : (
          timezones.map(zone => (
            <TimeZoneCard
              key={zone.id}
              zone={zone}
              onDelete={onDeleteTimeZone}
            />
          ))
        )}
      </div>
    </div>
  );
}

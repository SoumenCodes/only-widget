import React, { useState, useEffect } from 'react';
import WidgetHeader from './components/WidgetHeader';
import ClockWidget from './components/ClockWidget';
import NetworkSpeedWidget from './components/NetworkSpeedWidget';
import TimeZoneSection from './components/TimeZoneSection';
import AddTimeZoneModal from './components/AddTimeZoneModal';
import { DEFAULT_SAVED_ZONES } from './data/popularTimezones';

export default function App() {
  const [isPinned, setIsPinned] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [timezones, setTimezones] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_timezones');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 1 && parsed.some(z => z.city === 'London') && parsed.some(z => z.city === 'New York')) {
          return DEFAULT_SAVED_ZONES;
        }
        return parsed;
      }
      return DEFAULT_SAVED_ZONES;
    } catch {
      return DEFAULT_SAVED_ZONES;
    }
  });

  useEffect(() => {
    localStorage.setItem('aura_timezones', JSON.stringify(timezones));
  }, [timezones]);

  // Dynamically size window based on modal state, compact mode, and active timezones
  useEffect(() => {
    if (window.electronAPI?.setWindowHeight) {
      const targetHeight = isModalOpen
        ? 580
        : isCompact
        ? 330
        : timezones.length <= 1
        ? 535
        : timezones.length === 2
        ? 615
        : 695;
      window.electronAPI.setWindowHeight(targetHeight);
    }
  }, [isModalOpen, isCompact, timezones.length]);

  const handleTogglePin = async () => {
    const nextPin = !isPinned;
    setIsPinned(nextPin);
    if (window.electronAPI?.setAlwaysOnTop) {
      await window.electronAPI.setAlwaysOnTop(nextPin);
    }
  };

  const handleToggleCompact = () => {
    setIsCompact(prev => !prev);
  };

  const handleAddTimeZone = (newZone) => {
    setTimezones(prev => [...prev, newZone]);
  };

  const handleDeleteTimeZone = (id) => {
    setTimezones(prev => prev.filter(z => z.id !== id));
  };

  const containerHeight = isModalOpen
    ? '580px'
    : isCompact
    ? '330px'
    : timezones.length <= 1
    ? '535px'
    : timezones.length === 2
    ? '615px'
    : '695px';

  return (
    <div style={{
      width: '385px',
      minHeight: containerHeight,
      padding: '6px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      background: 'transparent',
      position: 'relative'
    }}>
      <div className="widget-glass-container" style={{
        width: '100%',
        minHeight: containerHeight,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* Header Bar */}
        <WidgetHeader
          isPinned={isPinned}
          onTogglePin={handleTogglePin}
          isCompact={isCompact}
          onToggleCompact={handleToggleCompact}
        />

        {/* Content Body */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Main Clock (12-Hour Format) */}
          <ClockWidget />

          {/* Real Network Speed Monitor */}
          <NetworkSpeedWidget />

          {/* World Timezones (Only 1 by default: Sydney) */}
          {!isCompact && (
            <TimeZoneSection
              timezones={timezones}
              onOpenModal={() => setIsModalOpen(true)}
              onDeleteTimeZone={handleDeleteTimeZone}
            />
          )}
        </div>

        {/* Full-view Add Time Zone Modal Overlay */}
        <AddTimeZoneModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddTimeZone}
          existingTzs={timezones}
        />
      </div>
    </div>
  );
}

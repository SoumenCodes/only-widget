import React from 'react';
import { Pin, ChevronUp, ChevronDown, Minus, X, Activity } from 'lucide-react';

export default function WidgetHeader({ isPinned, onTogglePin, isCompact, onToggleCompact }) {
  const handleMinimize = () => {
    if (window.electronAPI?.minimizeWindow) {
      window.electronAPI.minimizeWindow();
    } else if (window.__TAURI_INTERNALS__) {
      import('@tauri-apps/api/core').then(({ invoke }) => invoke('minimize_window'));
    }
  };

  const handleClose = () => {
    if (window.electronAPI?.closeWindow) {
      window.electronAPI.closeWindow();
    } else if (window.__TAURI_INTERNALS__) {
      import('@tauri-apps/api/core').then(({ invoke }) => invoke('close_window'));
    }
  };

  const handleMouseUp = () => {
    if (!isPinned) {
      if (window.electronAPI?.sendToDesktop) {
        window.electronAPI.sendToDesktop();
      } else if (window.__TAURI_INTERNALS__) {
        import('@tauri-apps/api/core').then(({ invoke }) => invoke('send_to_desktop'));
      }
    }
  };

  return (
    <div
      className="drag-region"
      data-tauri-drag-region
      onMouseUp={handleMouseUp}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        marginBottom: '10px',
        background: '#151b2b',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '14px',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
        cursor: 'grab'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '22px',
          height: '22px',
          borderRadius: '6px',
          background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Activity size={13} color="#ffffff" />
        </div>
        <span style={{
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'var(--text-main)',
          opacity: 0.95
        }}>
          Only Widget
        </span>
      </div>

      {/* Control Buttons (no-drag) */}
      <div className="no-drag" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <button
          className={`icon-btn ${isPinned ? 'active' : ''}`}
          onClick={onTogglePin}
          title={isPinned ? 'Floating on Top (Click to pin to desktop background)' : 'Desktop Mode: Sits on desktop under folders and open apps'}
          style={{ width: '26px', height: '26px' }}
        >
          <Pin size={13} style={{ transform: isPinned ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        <button
          className="icon-btn"
          onClick={onToggleCompact}
          title={isCompact ? 'Expand Widget' : 'Compact View'}
          style={{ width: '26px', height: '26px' }}
        >
          {isCompact ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        <button
          className="icon-btn"
          onClick={handleMinimize}
          title="Minimize"
          style={{ width: '26px', height: '26px' }}
        >
          <Minus size={13} />
        </button>

        <button
          className="icon-btn"
          onClick={handleClose}
          title="Close"
          style={{ width: '26px', height: '26px' }}
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

# Aura — Modern Glassmorphism Windows Widget

A sleek, lightweight desktop widget for Windows that displays real-time **Network Speed**, **Date & Time**, and customizable **Multiple Time Zones**.

---

## ✨ Features

- **Hero Glowing Clock & Calendar**:
  - Crisp glowing digital clock with live seconds.
  - Formatted day of the week, month, day, and year.
  - Click anywhere on the clock to toggle between **12-Hour (AM/PM)** and **24-Hour** formats.
  - Dynamic Sun (☀️) and Moon (🌙) icon based on day/night status.

- **Real-Time Network Speed Monitor**:
  - Live **Download (↓)** speed with glowing cyan activity pill.
  - Live **Upload (↑)** speed with glowing violet activity pill.
  - Auto-scaling units (`B/s`, `KB/s`, `MB/s`, `GB/s`).
  - Animated activity pulse bars that expand with network traffic.
  - Detects active network interface (Wi-Fi / Ethernet).

- **Multi-Timezone World Clock**:
  - Add as many custom world time zones as you need.
  - Instant city/timezone search modal (New York, London, Tokyo, Paris, Sydney, Dubai, UTC, Singapore, etc.).
  - Shows real-time hour/minute for each timezone.
  - Displays relative time difference (e.g., `+5h 30m`, `-4h`, `Same time`).
  - Hover to remove or manage your timezones.
  - Automatically saves your saved zones and settings.

- **Desktop Widget Controls**:
  - **Draggable**: Grab the top header to move the widget anywhere across your screens.
  - 📌 **Always-on-Top Toggle**: Pin the widget above other windows or keep it resting on your desktop.
  - ▾ **Compact Mode Toggle**: Shrink the widget down to a slim mini-dock when you only need the clock and network speed.
  - **Frosted Glass Design**: Obsidian translucent glass with backdrop blur and neon accents.

---

## 🚀 How to Run

### Development Mode (with Live Hot-Reloading)
```bash
npm run dev
```

### Production / Desktop Mode
```bash
npm start
```
*(This builds the optimized bundle and launches the standalone frameless desktop widget).*

---

## 🛠️ Tech Stack
- **Desktop Runtime**: Electron 45 (frameless, transparent window)
- **Frontend**: React 19 + Vite 8
- **OS Telemetry**: `systeminformation` (live network delta calculation)
- **Icons**: Lucide React
- **Design**: Frosted Obsidian Glassmorphism CSS with JetBrains Mono & Plus Jakarta Sans typography

const koffi = require('koffi');
const os = require('os');

let GetIfTable2 = null;
let FreeMibTable = null;

if (process.platform === 'win32') {
  try {
    const iphlpapi = koffi.load('iphlpapi.dll');
    GetIfTable2 = iphlpapi.func('uint32_t __stdcall GetIfTable2(void **ppIfTable)');
    FreeMibTable = iphlpapi.func('void __stdcall FreeMibTable(void *pMibTable)');
  } catch (err) {
    console.warn('Could not load iphlpapi.dll for native network metrics:', err);
  }
}

// Ultra-fast, 0% CPU native network byte counter
function getNetworkBytes() {
  if (process.platform === 'win32' && GetIfTable2 && FreeMibTable) {
    try {
      const ppTable = Buffer.alloc(8);
      if (GetIfTable2(ppTable) === 0) {
        const tablePtr = ppTable.readBigUInt64LE(0);
        const numEntries = koffi.decode(tablePtr, 'uint32_t');
        let rx = 0n;
        let tx = 0n;
        const seenLuid = new Set();

        for (let i = 0; i < numEntries; i++) {
          const rowPtr = tablePtr + 8n + BigInt(i * 1352);
          const luid = BigInt(koffi.decode(rowPtr, 'uint64_t'));
          const operStatus = koffi.decode(rowPtr + 1164n, 'uint32_t');

          // operStatus === 1 means IfOperStatusUp
          if (operStatus === 1 && !seenLuid.has(luid)) {
            seenLuid.add(luid);
            rx += BigInt(koffi.decode(rowPtr + 1192n, 'uint64_t'));
            tx += BigInt(koffi.decode(rowPtr + 1256n, 'uint64_t'));
          }
        }

        FreeMibTable(koffi.as(tablePtr, 'void*'));
        return {
          rx: Number(rx),
          tx: Number(tx),
          iface: 'Wi-Fi'
        };
      }
    } catch (err) {
      // Fallback
    }
  }

  return { rx: 0, tx: 0, iface: 'Network' };
}

module.exports = { getNetworkBytes };

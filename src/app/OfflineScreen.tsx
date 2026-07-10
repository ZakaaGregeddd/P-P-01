'use client';

export default function OfflineScreen() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden min-h-[calc(100vh-180px)] selection:bg-amber-500/30 selection:text-amber-500">
      {/* Decorative Drafting Lines */}
      <div className="absolute left-1/4 top-1/4 w-32 h-[1px] bg-amber-500/25 before:content-[''] before:absolute before:-top-[3px] before:-left-[1px] before:w-[1px] before:h-[7px] before:bg-amber-500/40 after:content-[''] after:absolute after:-top-[3px] after:-right-[1px] after:w-[1px] after:h-[7px] after:bg-amber-500/40 pointer-events-none"></div>
      <div className="absolute right-1/4 bottom-1/4 w-[1px] h-32 bg-amber-500/25 before:content-[''] before:absolute before:-left-[3px] before:-top-[1px] before:w-[7px] before:h-[1px] before:bg-amber-500/40 after:content-[''] after:absolute after:-left-[3px] after:-bottom-[1px] after:w-[7px] after:h-[1px] before:bg-amber-500/40 pointer-events-none"></div>

      <div className="w-full max-w-lg z-10 my-2 text-center">
        <div className="glass-panel border-amber-500/40 rounded-none py-8 px-6 shadow-2xl relative bg-[#0e0e0e]/95 backdrop-blur-md">
          {/* Glowing Flashing Amber Light */}
          <div className="flex justify-center mb-6">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-amber-500/30 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]"></span>
            </div>
          </div>

          <div className="mb-4 text-center">
            <h1 className="font-technical-sm text-technical-sm text-amber-500 mb-1 tracking-[0.2em] font-bold">
              SYSTEM STATUS: STANDBY
            </h1>
            <p className="font-technical-sm text-[10px] text-outline uppercase tracking-widest">
              OVERDRIVE PROTOCOL // OFF
            </p>
          </div>

          <div className="dimension-line max-w-xs mx-auto my-5 opacity-40"></div>

          <div className="space-y-4">
            <div className="border border-amber-500/30 bg-amber-500/10 text-amber-500 p-4 rounded-none text-technical-sm font-technical-sm tracking-wider uppercase leading-relaxed">
              WARNING: Public Node Terminals are offline by administrator override. External port handshakes are disabled.
            </div>

            <div className="text-center font-technical-sm text-[10px] text-outline-variant uppercase tracking-wide leading-relaxed p-3 bg-surface-container-low border border-outline-variant/20">
              Standby code active. Authorized personnel can access administrative ports via standard credentials.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

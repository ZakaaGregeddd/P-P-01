import Link from "next/link";
import ProjectGrid from "./ProjectGrid";
import WelcomeLava from "./WelcomeLava";

export default function Home() {
  return (
    <div className="relative w-full overflow-hidden">
      <WelcomeLava />
      
      <div id="hero-section" className="pt-16 pb-16 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto relative z-10 flex flex-col gap-16">
        {/* Hero & Profile Combined Grid */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-stretch min-h-[calc(100vh-160px)]">
        
        {/* Left Side: Hero Title & Bio-Data */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col justify-between gap-8 relative">
          
          {/* Decorative drafting lines */}
          <div className="absolute -left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-secondary/30 to-transparent hidden md:block"></div>
          
          {/* Speculative Engineering Hero (Top part) */}
          <div className="flex flex-col gap-4">
            <h1 className="font-headline-md text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-primary uppercase tracking-tighter font-bold leading-[0.9]">
              Speculative<br />Engineering
            </h1>
            
            <div className="h-px w-full bg-outline-variant/30 dimension-line relative my-1">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 font-technical-sm text-technical-sm text-secondary">
                ELEVATION 01
              </span>
            </div>
            
            <p className="font-body-base text-sm text-on-surface-variant max-w-xl">
              Crafting digital structures with mathematical precision and ethereal depth. A portfolio of high-fidelity prototypes, systems architectures, and interactive schematics.
            </p>
            
            <div className="flex gap-4 mt-1">
              <Link 
                href="/certificates" 
                className="bg-secondary text-primary px-6 py-2.5 font-label-caps text-label-caps tracking-widest hover:shadow-[0_0_20px_rgba(0,112,255,0.5)] transition-all flex items-center gap-2 w-fit"
              >
                <span>VIEW BLUEPRINTS</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Personnel Profile // Bio-Data (Bottom part) */}
          <div className="glass-panel p-5 relative overflow-hidden">
            {/* Section Header */}
            <div className="flex justify-between items-end border-b border-outline-variant/30 pb-2 mb-4">
              <h2 className="font-headline-md text-xs text-primary tracking-tight uppercase">
                Personnel Profile // Bio-Data
              </h2>
              <div className="font-technical-sm text-[10px] text-secondary">
                REF.ID // JD-882-ARCH
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 relative z-10">
              {/* Personal Info & Statement */}
              <div className="sm:col-span-7 flex flex-col justify-between">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between border-b border-outline-variant/10 pb-0.5">
                    <span className="font-technical-sm text-[10px] text-on-surface-variant">NAME:</span>
                    <span className="font-technical-sm text-[10px] text-primary">J. DOE</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/10 pb-0.5">
                    <span className="font-technical-sm text-[10px] text-on-surface-variant">DESIGNATION:</span>
                    <span className="font-technical-sm text-[10px] text-primary">Lead Architect // Systems Designer</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/10 pb-0.5">
                    <span className="font-technical-sm text-[10px] text-on-surface-variant">SPECIALIZATION:</span>
                    <span className="font-technical-sm text-[10px] text-primary">Computational Geometry &amp; Structural Logic</span>
                  </div>
                </div>

                <div className="mt-2 border-t border-outline-variant/10 pt-2">
                  <div className="font-label-caps text-[8px] text-secondary tracking-widest mb-0.5">
                    [ STATEMENT ]
                  </div>
                  <p className="font-body-base text-[11px] text-on-surface-variant italic leading-relaxed">
                    &quot;Bridging the gap between speculative engineering and functional architecture through high-fidelity digital prototyping and mathematical precision.&quot;
                  </p>
                </div>
              </div>

              {/* Core Competencies */}
              <div className="sm:col-span-5 flex flex-col gap-3">
                <div className="font-label-caps text-[8px] text-secondary tracking-widest mb-1">
                  [ CORE COMPETENCIES ]
                </div>
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between font-technical-sm text-[9px] text-on-surface-variant uppercase">
                      <span>Systems Architecture</span>
                      <span>94%</span>
                    </div>
                    <div className="h-1 w-full bg-surface-container-highest">
                      <div className="h-full bg-secondary" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between font-technical-sm text-[9px] text-on-surface-variant uppercase">
                      <span>Generative Design</span>
                      <span>88%</span>
                    </div>
                    <div className="h-1 w-full bg-surface-container-highest">
                      <div className="h-full bg-secondary" style={{ width: '88%' }}></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between font-technical-sm text-[9px] text-on-surface-variant uppercase">
                      <span>Structural Analysis</span>
                      <span>91%</span>
                    </div>
                    <div className="h-1 w-full bg-surface-container-highest">
                      <div className="h-full bg-secondary" style={{ width: '91%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Blueprint Grid Overlay */}
            <div className="absolute inset-0 blueprint-grid-fine opacity-[0.05] pointer-events-none"></div>
          </div>
        </div>

        {/* Right Side: Profile Photo Glass Card */}
        <div className="md:col-span-5 lg:col-span-4 relative mt-12 md:mt-0 flex flex-col justify-center">
          <div className="glass-panel p-5 relative group glow-hover transition-all duration-500 w-full">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/50"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/50"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/50"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/50"></div>
            
            <div className="aspect-[1/0.92] bg-surface-container-lowest relative overflow-hidden mb-4">
              <img 
                className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" 
                alt="A striking portrait of a digital architect in a dark, neon-lit server room. High-contrast lighting with vivid electric blue highlights defining structural facial features." 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvgbA9HjgJL9iojhLKW5pRErIqn0pxb1IR0mWXv3fAIBEGuBHvgPYeqq4mNoC_Uu97GyrwDhUThRS_CN-skLS9scv3DcviaeJKSvJM9d52gtn_qWyVYOD77YFd-rciIEWMUif30ROOovXKBmUE6EzNvE7vG7mJjJlL6H2a-nn9lFB7Sfk_6KxPd-IpKuqLLXGgaEh7mlp4rHQHjidws1W_sG4D7Iwl4j6WWeC4GdfwLV2vU40yrPo"
              />
              <div className="absolute inset-0 blueprint-grid-fine opacity-20 pointer-events-none"></div>
            </div>
            
            <div className="flex justify-between items-end border-t border-outline-variant/30 pt-4">
              <div>
                <div className="font-label-caps text-label-caps text-secondary mb-1">LEAD ARCHITECT</div>
                <div className="font-headline-md text-headline-md text-primary">J. DOE</div>
              </div>
              <div className="font-technical-sm text-technical-sm text-on-surface-variant text-right">
                SYS.VER: 4.2.0<br />STATUS: ONLINE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Grid */}
      <section className="flex flex-col gap-12">
        <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
          <h2 className="font-headline-md text-headline-md text-primary tracking-tight">FEATURED SCHEMATICS</h2>
          <div className="font-technical-sm text-technical-sm text-secondary">DATA.SET // 01-02</div>
        </div>
        
        <ProjectGrid />
      </section>
    </div>
    </div>
  );
}

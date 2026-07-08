import Link from "next/link";
import ProjectGrid from "./ProjectGrid";
import WelcomeLava from "./WelcomeLava";
import { getCollection } from "@/lib/db";
import InteractiveCard from "./InteractiveCard";

export default async function Home() {
  let bio: any = null;
  try {
    const collection = await getCollection('biodata');
    bio = await collection.findOne({ key: 'admin_biodata' });
  } catch (err) {
    console.error('Failed to load biodata on home page:', err);
  }

  // Pre-configured fallbacks
  const name = bio?.name || "J. DOE";
  const designation = bio?.designation || "Lead Architect // Systems Designer";
  const specialization = bio?.specialization || "Computational Geometry & Structural Logic";
  const statement = bio?.statement || "Bridging the gap between speculative engineering and functional architecture through high-fidelity digital prototyping and mathematical precision.";
  const sysVer = bio?.sysVer || "4.2.0";
  const status = bio?.status || "ONLINE";
  const photoUrl = bio?.photoUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBvgbA9HjgJL9iojhLKW5pRErIqn0pxb1IR0mWXv3fAIBEGuBHvgPYeqq4mNoC_Uu97GyrwDhUThRS_CN-skLS9scv3DcviaeJKSvJM9d52gtn_qWyVYOD77YFd-rciIEWMUif30ROOovXKBmUE6EzNvE7vG7mJjJlL6H2a-nn9lFB7Sfk_6KxPd-IpKuqLLXGgaEh7mlp4rHQHjidws1W_sG4D7Iwl4j6WWeC4GdfwLV2vU40yrPo";
  
  const competencies = bio?.competencies || [
    { name: "Systems Architecture", value: 94 },
    { name: "Generative Design", value: 88 },
    { name: "Structural Analysis", value: 91 }
  ];

  let projects: any[] = [];
  try {
    const projectsCollection = await getCollection('projects');
    const dbProjects = await projectsCollection.find({}).toArray();
    projects = dbProjects.map(p => ({
      projectId: p.projectId,
      tag: p.tag || '',
      title: p.title || '',
      description: p.description || '',
      imageUrl: p.imageUrl || '',
      linkUrl: p.linkUrl || '',
    }));
  } catch (err) {
    console.error('Failed to load projects on home page:', err);
  }

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
          
          {/* (Top part) */}
          <div className="flex flex-col gap-4">
            <h1 className="font-headline-md text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-primary uppercase tracking-tighter font-bold leading-[0.9]">
              Be<br />Creative
            </h1>
            
            <div className="h-px w-full bg-outline-variant/30 dimension-line relative my-1">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 font-technical-sm text-technical-sm text-secondary">
                ELEVATION 01
              </span>
            </div>
            
            <p className="font-body-base text-sm text-on-surface-variant max-w-xl">
              Creativity knows no bounds, lets Breaking the boundaries of system and imagination. Transforming limitless imagination into functional digital realities and compelling visual narratives. 
            </p>
            
            <div className="flex gap-4 mt-1">
              <Link 
                href="/certificates" 
                className="bg-secondary text-primary px-6 py-2.5 font-label-caps text-label-caps tracking-widest hover:shadow-[0_0_20px_rgba(0,112,255,0.5)] transition-all flex items-center gap-2 w-fit"
              >
                <span>VIEW ACHIEVEMENTS</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Personnel Profile // Bio-Data (Bottom part) */}
          <div className="glass-panel p-5 relative overflow-hidden group hover:border-secondary/40 transition-all duration-300">
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
                    <span className="font-technical-sm text-[10px] text-primary">{name}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/10 pb-0.5">
                    <span className="font-technical-sm text-[10px] text-on-surface-variant">DESIGNATION:</span>
                    <span className="font-technical-sm text-[10px] text-primary">{designation}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/10 pb-0.5">
                    <span className="font-technical-sm text-[10px] text-on-surface-variant">SPECIALIZATION:</span>
                    <span className="font-technical-sm text-[10px] text-primary">{specialization}</span>
                  </div>
                </div>

                <div className="mt-2 border-t border-outline-variant/10 pt-2">
                  <div className="font-label-caps text-[8px] text-secondary tracking-widest mb-0.5">
                    [ STATEMENT ]
                  </div>
                  <p className="font-body-base text-[11px] text-on-surface-variant italic leading-relaxed">
                    &quot;{statement}&quot;
                  </p>
                </div>
              </div>

              {/* Core Competencies */}
              <div className="sm:col-span-5 flex flex-col gap-3">
                <div className="font-label-caps text-[8px] text-secondary tracking-widest mb-1">
                  [ CORE COMPETENCIES ]
                </div>
                <div className="flex flex-col gap-2.5">
                  {competencies.map((comp: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-0.5">
                      <div className="flex justify-between font-technical-sm text-[9px] text-on-surface-variant uppercase">
                        <span>{comp.name}</span>
                        <span>{comp.value}%</span>
                      </div>
                      <div className="h-1 w-full bg-surface-container-highest">
                        <div className="h-full bg-secondary" style={{ width: `${comp.value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decorative Blueprint Grid Overlay */}
            <div className="absolute inset-0 blueprint-grid-fine opacity-[0.05] pointer-events-none"></div>
          </div>

          {/* Social Media Link Container */}
          {(() => {
            const socials = [
              {
                name: 'Instagram',
                url: 'https://www.instagram.com/boeng_djaka/',
                path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
                viewBox: '0 0 24 24',
                glowClass: 'hover:border-[#E1306C] hover:text-[#E1306C] hover:shadow-[0_0_15px_rgba(225,48,108,0.4)]'
              },
              {
                name: 'Facebook',
                url: 'https://web.facebook.com/Muhammad.Zakaa.Shahzada',
                path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
                viewBox: '0 0 24 24',
                glowClass: 'hover:border-[#1877F2] hover:text-[#1877F2] hover:shadow-[0_0_15px_rgba(24,119,242,0.4)]'
              },
              {
                name: 'WhatsApp',
                url: 'https://wa.me/6282289664966',
                path: 'M17.472 14.382c-.022-.079-.186-.208-.437-.327-.245-.122-1.447-.714-1.67-.795-.223-.081-.382-.121-.54.12-.162.244-.627.795-.769.96-.14.162-.28.18-.53.058-.25-.122-1.056-.388-2.007-1.244-.74-.66-1.238-1.473-1.385-1.727-.14-.254-.015-.391.109-.513.111-.11.244-.285.37-.428.122-.144.162-.244.245-.41.082-.166.04-.31-.02-.429-.06-.12-1.447-3.486-1.67-4.032-.218-.527-.459-.456-.63-.456-.162-.005-.347-.005-.531-.005-.185 0-.485.07-.74.348-.253.28-1.022 1.002-1.022 2.44 0 1.439 1.047 2.827 1.192 3.023.148.196 2.059 3.15 4.986 4.417.697.301 1.244.48 1.67.615.708.224 1.35.192 1.859.117.568-.083 1.748-.713 1.996-1.402.247-.688.247-1.28.174-1.402zM12.012 21c-2.433 0-4.814-.66-6.885-1.906L1 20.354l1.283-4.636a9.569 9.569 0 01-1.89-5.711C.392 4.779 4.793.371 10.034.371c2.54 0 4.927.99 6.722 2.788a9.467 9.467 0 012.78 6.732c-.006 5.21-4.307 9.585-9.524 9.585z',
                viewBox: '0 0 24 24',
                glowClass: 'hover:border-[#25D366] hover:text-[#25D366] hover:shadow-[0_0_15px_rgba(37,211,102,0.4)]'
              },
              {
                name: 'Threads',
                url: 'https://www.threads.com/@boeng_djaka',
                path: 'M18.898 12.63c-.156 4.385-3.328 6.305-6.527 6.305-4.137 0-6.906-2.91-6.906-7.25 0-4.524 2.871-7.25 6.965-7.25 3.328 0 5.438 1.871 5.922 4.293H16.14c-.383-1.398-1.574-2.285-3.664-2.285-2.73 0-4.688 1.883-4.688 5.223 0 3.23 1.852 5.223 4.672 5.223 2.05 0 3.496-1.125 3.863-3.152h-3.88v-2.012h5.922v.875c.03.352.043.723.043 1.137 0 1.258-.23 2.395-.691 3.21-.465.817-1.153 1.215-2.07 1.215-.817 0-1.446-.312-1.895-.926-.39-.535-.558-1.285-.504-2.277h.004c.066-1.223.473-2.184 1.223-2.883.754-.707 1.766-1.066 3.035-1.066 1.102 0 1.984.348 2.656 1.047.617.64.938 1.55.938 2.762-.008 1.117-.035 1.765-.195 2.148z',
                viewBox: '0 0 24 24',
                glowClass: 'hover:border-white hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]'
              },
              {
                name: 'YouTube',
                url: 'https://www.youtube.com/@Zakaagreged',
                path: 'M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.002 3.002 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
                viewBox: '0 0 24 24',
                glowClass: 'hover:border-[#FF0000] hover:text-[#FF0000] hover:shadow-[0_0_15px_rgba(255,0,0,0.4)]'
              }
            ];
            return (
              <div className="flex flex-wrap gap-4 mt-6 z-10 relative items-center">
                <span className="font-technical-sm text-[10px] text-outline-variant uppercase tracking-wider mr-2">CONNECT // CONNECTIVITY_NODES:</span>
                <div className="flex gap-3">
                  {socials.map((social) => (
                    <a 
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.name}
                      className={`w-9 h-9 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant transition-all duration-300 hover:scale-110 ${social.glowClass} bg-surface-container/20`}
                    >
                      <svg className="w-4 h-4 fill-current transition-colors duration-300" viewBox={social.viewBox}>
                        <path d={social.path} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right Side: Profile Photo Glass Card */}
        <div className="md:col-span-5 lg:col-span-4 relative mt-12 md:mt-0 flex flex-col justify-center">
          <div className="glass-panel p-5 relative group glow-hover hover:border-secondary/40 transition-all duration-500 w-full">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/50"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/50"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/50"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/50"></div>
            
            <div className="aspect-[1/0.92] bg-surface-container-lowest relative overflow-hidden mb-4">
              <img 
                className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700" 
                alt="A striking portrait of a digital architect in a dark, neon-lit server room." 
                src={photoUrl}
              />
              <div className="absolute inset-0 blueprint-grid-fine opacity-20 pointer-events-none"></div>
            </div>
            
            <div className="flex justify-between items-end border-t border-outline-variant/30 pt-4">
              <div>
                <div className="font-label-caps text-label-caps text-secondary mb-1">{designation.split('//')[0] || 'ARCHITECT'}</div>
                <div className="font-headline-md text-headline-md text-primary">{name}</div>
              </div>
              <div className="font-technical-sm text-technical-sm text-on-surface-variant text-right">
                SYS.VER: {sysVer}<br />STATUS: {status}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Grid */}
      <section className="flex flex-col gap-12">
        <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
          <h2 className="font-headline-md text-headline-md text-primary tracking-tight">WHAT'S IM DOING NOW?</h2>
          <div className="font-technical-sm text-technical-sm text-secondary">DATA.SET // 01-02</div>
        </div>
        
        <ProjectGrid initialProjects={projects} />
      </section>
    </div>
    </div>
  );
}

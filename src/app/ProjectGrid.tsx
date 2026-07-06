'use client';

import { useEffect, useRef, useState } from 'react';

export default function ProjectGrid() {
  const [visibleItems, setVisibleItems] = useState<{ [key: string]: boolean }>({});
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-id');
          if (id) {
            setVisibleItems((prev) => ({ ...prev, [id]: entry.isIntersecting }));
          }
        });
      },
      {
        threshold: 0.1, // trigger when 10% of the element is visible
        rootMargin: '0px 0px -50px 0px', // trigger slightly before entering viewport
      }
    );

    const children = gridRef.current?.querySelectorAll('[data-id]');
    children?.forEach((child) => observer.observe(child));

    return () => {
      children?.forEach((child) => observer.unobserve(child));
    };
  }, []);

  return (
    <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
      {/* Bento Item 1 - Large */}
      <div
        data-id="proj-1"
        className={`md:col-span-8 glass-panel p-6 glow-hover group flex flex-col justify-between min-h-[400px] transition-all duration-[800ms] ease-out transform relative ${
          visibleItems['proj-1']
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 -translate-x-16 pointer-events-none'
        }`}
      >
        {/* Animated Border Overlay - Triggers on Hover */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#0070FF" strokeWidth="1.5" className="card-loading-border" />
        </svg>

        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="font-technical-sm text-technical-sm text-on-surface-variant px-2 py-1 border border-outline-variant/30">PROJ_01</div>
          <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
        </div>
        
        <div className="relative w-full h-48 bg-surface-container-lowest mb-6 overflow-hidden z-10">
          <div 
            className="bg-cover bg-center w-full h-full opacity-60 group-hover:scale-105 transition-transform duration-700" 
            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB7LtYjfirw2hK3RG-Xo5um7WLXaKwxJCaF7MS9JUL6hg4E68_gHj_btiSFcI3toAV83_3_1Ne7UVqwfXT2yXC9dTHL-GkDaQDA8JZBOPeiJrnkhJ8GE7sc0JvFidkqFBl6Oi3oqs7SefIDoQULaWPos6P79oZtU1c_SMWqjFTNyffLAqWegrQziFRqp9ux2MDps5rBs8AZ_A6_RzF0ZvCra2fhfdXNcn_HOzZAhjRSY7aUtCbN-oM')` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
        </div>
        
        <div className="relative z-10">
          <h3 className="font-headline-md text-headline-md text-primary mb-2">Neural Pathway Mapping</h3>
          <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl">
            High-density data visualization system conceptualized for mapping complex associative networks.
          </p>
        </div>
      </div>

      {/* Bento Item 2 - Small */}
      <div
        data-id="proj-2"
        className={`md:col-span-4 glass-panel p-6 glow-hover group flex flex-col justify-between min-h-[400px] transition-all duration-[800ms] ease-out delay-[200ms] transform relative ${
          visibleItems['proj-2']
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-16 pointer-events-none'
        }`}
      >
        {/* Animated Border Overlay - Triggers on Hover */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#0070FF" strokeWidth="1.5" className="card-loading-border" />
        </svg>

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="font-technical-sm text-technical-sm text-on-surface-variant px-2 py-1 border border-outline-variant/30">PROJ_02</div>
        </div>
        
        <div className="relative w-full h-32 bg-surface-container-lowest mb-4 overflow-hidden border border-outline-variant/20 z-10">
          <div 
            className="bg-cover bg-center w-full h-full opacity-70 group-hover:opacity-100 transition-opacity" 
            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBsGpYQQnihiuoyOEwkpyV5zE_C-BoPuC1KONYQ7LMwYSCTI2o8bPwosHPejqCGQ2PCCcxfTpQXUtdLrpAMdQBsO-KPBg4S6Dmo9K63mC2YbYkTFss57VB_2bYDpvK7RBb9dreqUBn9VD-f91FqiBVdSTHIwnH-b7uZU6T0o92d62Wqmhvv6tLQnTWfUvalZRa_qkoFsa4niweyaxHn6KMAxnlx63_Zulkt8AqX_x7YsjXSbwDJo5g')` }}
          ></div>
        </div>
        
        <div className="relative z-10">
          <h3 className="font-headline-md text-[24px] leading-[32px] text-primary mb-2">Void Terminal</h3>
          <p className="font-body-base text-body-base text-on-surface-variant text-sm">
            Command line interface redesign focusing on cognitive offloading.
          </p>
        </div>
      </div>
    </div>
  );
}

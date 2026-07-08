'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { playElectricSparkSound } from '../lib/sfx';

interface ProjectData {
  projectId: string;
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
}

export default function ProjectGrid({ 
  initialProjects = [] 
}: { 
  initialProjects?: ProjectData[] 
}) {
  const [visibleItems, setVisibleItems] = useState<{ [key: string]: boolean }>({});
  const [isProj2Hovered, setIsProj2Hovered] = useState(false);
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

  const getDirectGDriveUrl = (url: string) => {
    if (!url) return '';
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return url;
  };

  const proj1Data = initialProjects.find(p => p.projectId === 'proj-1');
  const proj2Data = initialProjects.find(p => p.projectId === 'proj-2');

  const proj1 = {
    tag: proj1Data?.tag || 'PROJ_01',
    title: proj1Data?.title || 'Neural Pathway Mapping',
    description: proj1Data?.description || 'High-density data visualization system conceptualized for mapping complex associative networks.',
    linkUrl: proj1Data?.linkUrl || '/projects/neural-pathway',
    imageUrl: getDirectGDriveUrl(proj1Data?.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7LtYjfirw2hK3RG-Xo5um7WLXaKwxJCaF7MS9JUL6hg4E68_gHj_btiSFcI3toAV83_3_1Ne7UVqwfXT2yXC9dTHL-GkDaQDA8JZBOPeiJrnkhJ8GE7sc0JvFidkqFBl6Oi3oqs7SefIDoQULaWPos6P79oZtU1c_SMWqjFTNyffLAqWegrQziFRqp9ux2MDps5rBs8AZ_A6_RzF0ZvCra2fhfdXNcn_HOzZAhjRSY7aUtCbN-oM')
  };

  const proj2 = {
    tag: proj2Data?.tag || 'PROJ_02',
    title: proj2Data?.title || 'Void Terminal',
    description: proj2Data?.description || 'Command line interface redesign focusing on cognitive offloading.',
    linkUrl: proj2Data?.linkUrl || '/projects/void-terminal',
    imageUrl: getDirectGDriveUrl(proj2Data?.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsGpYQQnihiuoyOEwkpyV5zE_C-BoPuC1KONYQ7LMwYSCTI2o8bPwosHPejqCGQ2PCCcxfTpQXUtdLrpAMdQBsO-KPBg4S6Dmo9K63mC2YbYkTFss57VB_2bYDpvK7RBb9dreqUBn9VD-f91FqiBVdSTHIwnH-b7uZU6T0o92d62Wqmhvv6tLQnTWfUvalZRa_qkoFsa4niweyaxHn6KMAxnlx63_Zulkt8AqX_x7YsjXSbwDJo5g')
  };

  return (
    <div 
      ref={gridRef} 
      className="grid grid-cols-1 md:grid-cols-[var(--grid-col-1,8fr)_var(--grid-col-2,4fr)] transition-[grid-template-columns] duration-500 ease-in-out gap-gutter"
      style={{
        '--grid-col-1': isProj2Hovered ? '4fr' : '8fr',
        '--grid-col-2': isProj2Hovered ? '8fr' : '4fr',
      } as React.CSSProperties}
    >
      {/* Bento Item 1 - Large */}
      <Link
        href={proj1.linkUrl}
        data-id="proj-1"
        onMouseEnter={() => playElectricSparkSound()}
        className={`glass-panel p-6 glow-hover group flex flex-col justify-between min-h-[400px] transition-all duration-[800ms] ease-out transform relative block ${
          visibleItems['proj-1']
            ? 'opacity-100 translate-x-0 translate-y-0'
            : 'opacity-0 md:-translate-x-16 translate-y-8 pointer-events-none'
        }`}
      >
        {/* Animated Border Overlay - Triggers on Hover */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#0070FF" strokeWidth="1.5" className="card-loading-border" />
        </svg>

        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="font-technical-sm text-technical-sm text-on-surface-variant px-2 py-1 border border-outline-variant/30">{proj1.tag}</div>
          <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
        </div>
        
        <div className={`relative w-full bg-surface-container-lowest mb-6 overflow-hidden z-10 transition-all duration-500 ease-in-out ${isProj2Hovered ? 'h-32' : 'h-48'}`}>
          <Image 
            src={proj1.imageUrl}
            alt={proj1.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover opacity-60 group-hover:scale-105 transition-all duration-700"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"></div>
        </div>
        
        <div className="relative z-10">
          <h3 className="font-headline-md text-headline-md text-primary mb-2">{proj1.title}</h3>
          <p className={`font-body-base text-body-base text-on-surface-variant max-w-2xl transition-all duration-300 ${isProj2Hovered ? 'line-clamp-1 text-sm' : 'line-clamp-3'}`}>
            {proj1.description}
          </p>
        </div>
      </Link>

      {/* Bento Item 2 - Small */}
      <Link
        href={proj2.linkUrl}
        data-id="proj-2"
        onMouseEnter={() => {
          playElectricSparkSound();
          setIsProj2Hovered(true);
        }}
        onMouseLeave={() => {
          setIsProj2Hovered(false);
        }}
        className={`glass-panel p-6 glow-hover group flex flex-col justify-between min-h-[400px] transition-all duration-[800ms] ease-out delay-[200ms] transform relative block ${
          visibleItems['proj-2']
            ? 'opacity-100 translate-x-0 translate-y-0'
            : 'opacity-0 md:translate-x-16 translate-y-8 pointer-events-none'
        }`}
      >
        {/* Animated Border Overlay - Triggers on Hover */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#0070FF" strokeWidth="1.5" className="card-loading-border" />
        </svg>

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="font-technical-sm text-technical-sm text-on-surface-variant px-2 py-1 border border-outline-variant/30">{proj2.tag}</div>
          <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
        </div>
        
        <div className={`relative w-full bg-surface-container-lowest mb-4 overflow-hidden border border-outline-variant/20 z-10 transition-all duration-500 ease-in-out ${isProj2Hovered ? 'h-48' : 'h-32'}`}>
          <Image 
            src={proj2.imageUrl}
            alt={proj2.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover opacity-70 group-hover:opacity-100 transition-all duration-300"
            unoptimized
          />
        </div>
        
        <div className="relative z-10">
          <h3 className="font-headline-md text-[24px] leading-[32px] text-primary mb-2">{proj2.title}</h3>
          <p className={`font-body-base text-body-base text-on-surface-variant transition-all duration-300 ${isProj2Hovered ? 'line-clamp-3' : 'line-clamp-1 text-sm'}`}>
            {proj2.description}
          </p>
        </div>
      </Link>
    </div>
  );
}

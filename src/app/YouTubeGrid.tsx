'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoData {
  id: string;
  title: string;
  description: string;
}

export default function YouTubeGrid({ videos = [] }: { videos: VideoData[] }) {
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
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    const children = gridRef.current?.querySelectorAll('[data-id]');
    children?.forEach((child) => observer.observe(child));

    return () => {
      children?.forEach((child) => observer.unobserve(child));
    };
  }, [videos]);

  return (
    <div 
      ref={gridRef}
      className="grid grid-cols-1 md:grid-cols-2 gap-gutter p-1"
    >
      {videos.map((video, idx) => {
        const dataId = `yt-${idx}`;
        const isLeft = idx === 0;
        
        return (
          <div 
            key={video.id}
            data-id={dataId}
            className={`glass-panel p-5 relative group glow-hover hover:border-secondary/40 transition-all duration-[800ms] ease-out transform flex flex-col gap-4 ${
              isLeft ? 'delay-[0ms]' : 'delay-[200ms]'
            } ${
              visibleItems[dataId]
                ? 'opacity-100 translate-x-0 translate-y-0'
                : `opacity-0 ${isLeft ? 'md:-translate-x-16' : 'md:translate-x-16'} translate-y-8 pointer-events-none`
            }`}
          >
            <div className="aspect-video bg-black relative overflow-hidden border border-outline-variant/20">
              <iframe 
                className="absolute inset-0 w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                src={`https://www.youtube.com/embed/${video.id}`}
                title="YouTube video player" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              ></iframe>
            </div>
            <div>
              <div className="font-label-caps text-[8px] text-secondary tracking-widest mb-1">[ VIDEO NODE 0{idx + 1} ]</div>
              <h3 className="font-headline-md text-base text-primary uppercase mb-2 truncate" title={video.title}>
                {video.title}
              </h3>
              <p className="font-body-base text-xs text-on-surface-variant line-clamp-2">
                {video.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

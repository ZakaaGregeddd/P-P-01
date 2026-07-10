'use client';

import { useState, useMemo } from 'react';
import { Certificate } from '@/lib/db';
import { playElectricSparkSound } from '@/lib/sfx';

interface CertificatesClientProps {
  initialCerts: Certificate[];
}

const formatBytes = (bytes?: number) => {
  if (!bytes) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function CertificatesClient({ initialCerts }: CertificatesClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL_CATEGORIES');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showQrModal, setShowQrModal] = useState(false);
  const itemsPerPage = 8;

  // Determine category based on issuer/name keywords to fit filter requirements
  const getCategory = (cert: Certificate): string => {
    const name = cert.name.toUpperCase();
    const issuer = cert.issuer.toUpperCase();
    if (name.includes('STRUCTURAL') || name.includes('CIVIL') || issuer.includes('CIVIL')) return 'STRUCTURAL';
    if (name.includes('SUSTAINABLE') || name.includes('GREEN') || name.includes('ENVIRONMENT') || issuer.includes('GREEN')) return 'SUSTAINABLE';
    if (name.includes('PARAMETRIC') || name.includes('MODELING') || name.includes('COMPUTATION') || name.includes('BIM') || issuer.includes('COMPUTATION')) return 'COMPUTATIONAL';
    return 'OTHER';
  };

  // Filtered certificates list
  const filteredCerts = useMemo(() => {
    return initialCerts.filter((cert) => {
      // 1. Search Query
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        cert.name.toLowerCase().includes(query) ||
        cert.issuer.toLowerCase().includes(query) ||
        cert.credentialId.toLowerCase().includes(query);

      // 2. Category Filter
      const category = getCategory(cert);
      const matchesCategory = selectedCategory === 'ALL_CATEGORIES' || category === selectedCategory;

      // 3. Date Range Filter (cert.dateIssued format is YYYY-MM)
      let matchesDate = true;
      if (startDate) {
        // Convert input date YYYY-MM-DD to YYYY-MM
        const startYM = startDate.substring(0, 7);
        matchesDate = matchesDate && cert.dateIssued >= startYM;
      }
      if (endDate) {
        const endYM = endDate.substring(0, 7);
        matchesDate = matchesDate && cert.dateIssued <= endYM;
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [initialCerts, searchQuery, selectedCategory, startDate, endDate]);

  // Paginated archive certificates
  const totalPages = Math.ceil(filteredCerts.length / itemsPerPage) || 1;
  const paginatedCerts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCerts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCerts, currentPage]);

  // We show the first 3 certificates from the database as Featured Certifications
  const featuredCerts = useMemo(() => {
    return initialCerts.slice(0, 3);
  }, [initialCerts]);

  // Fallback images for featured certificates if they don't have fileUrl
  const featuredFallbacks = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCRRTNycvSII4lm5sQ1rfnGfejw8nNH2-DIi-O93J2Fuxu9RWcv1gFMSUnJA58ttuRhYbEhSCUsiVCQQtjLRj0Swm-ltMR31XQeURJuyKudy45ak97z0-VlYMBC_qleEH9CXAXpjR9dfM6uMPxq6JSLCoPi_jFCM1D4OWnPHGLt0IYf4Z5ZUZr4uJq7CoHMl2PosKYvFu2pJNvQQI-b9BskQBEW-w2cZcQO6l2ZxfyFhNVrmwpnaxM',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCd_ykEXEnQK7FqP0F2fM3D9Imh0lGNxlL1bOsuK5mmPPLSwyG_ss4VqvjbhvbZJ-Dbiw2h0C059uD0Btw71DEMImOTGegJKOMPNkqKmkIbW0KKfTH4RGP2e4bWOBtmjxEl3pH_IN2A_W-Ql4V36qZkUWCKUyeCl-xeTMc-h8PTcMO4sXbF-iffpZnNELpR7tg9Z5PR-4gLdckmdDO4OV2lK0dEz93sBoeCGQgHcJwuDQ24YntwKx4',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDNmWby_5kc3h60sR8DQ7F2OW3ddec_TGLERG66NGArquIVf7MH7e1WMP3_P65aF5gFTluUsdOqsH1nctoxUB5BCQp07sWoJ6EkTpDEVcP9lXCFSHe7uyS2_acf8Kn-axjU5hsiHNdwm5nt5ffGdUPjjLO0hzEFuVM45--d5o71u6x8uEqFQ40cqm443fnyUT6Ymns3cbPfyrU93FXOIcF3ZZCBS4REZogl0NY11rIq-eYlTmWQ76s'
  ];

  return (
    <>
      {/* Section: Featured Certifications */}
      <section className="mb-24">
        <h2 className="font-label-caps text-label-caps text-secondary mb-8 tracking-[0.2em]">01 // FEATURED_CERTIFICATIONS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {featuredCerts.map((cert, index) => {
            const formattedDate = cert.dateIssued.replace(/-/g, '.');
            const isPdf = cert.fileUrl && cert.fileUrl.toLowerCase().endsWith('.pdf');
            const bgImage = cert.fileUrl && cert.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)/i)
              ? cert.fileUrl
              : featuredFallbacks[index % 3];

            return (
              <article 
                key={`feat-${cert._id}`} 
                onClick={() => cert.fileUrl && window.open(cert.fileUrl, '_blank')}
                onMouseEnter={() => playElectricSparkSound()}
                className="glass-panel glow-hover p-5 flex flex-col group cursor-pointer h-full border-t-2 border-t-secondary/40 hover:scale-[1.02] transition-all duration-300 relative"
              >
                <div className="mb-4 relative w-full pt-[45%] bg-surface-container overflow-hidden">
                  {isPdf ? (
                    <iframe 
                      src={`${cert.fileUrl}#page=1&toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                      className="absolute top-0 left-0 w-[calc(100%+28px)] h-full border-none pointer-events-none opacity-60 group-hover:opacity-100 transition-all duration-700 scale-110 group-hover:scale-100"
                      title={cert.name}
                      scrolling="no"
                    />
                  ) : (
                    <img 
                      alt={cert.name} 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 scale-110 group-hover:scale-100 grayscale group-hover:grayscale-0" 
                      src={bgImage}
                    />
                  )}
                  <div className="absolute inset-0 border-2 border-secondary/20 m-2 pointer-events-none z-10"></div>
                </div>
                <div className="flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-headline-md text-primary leading-tight hover:text-secondary transition-colors text-lg md:text-xl lg:text-2xl">
                      {cert.name}
                    </h3>
                    {cert.fileUrl ? (
                      <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer">
                        <span className="material-symbols-outlined text-secondary text-2xl opacity-40 group-hover:opacity-100 transition-opacity">north_east</span>
                      </a>
                    ) : (
                      <span className="material-symbols-outlined text-secondary text-2xl opacity-40 group-hover:opacity-100 transition-opacity">north_east</span>
                    )}
                  </div>
                  <p className="font-technical-sm text-technical-sm text-secondary-container mb-2 tracking-wider uppercase">{cert.issuer}</p>
                  <p className="font-body-base text-xs text-on-surface-variant line-clamp-2 mb-3">
                    {cert.description || `Verifiable qualification credential indexing ${cert.name.toLowerCase()} competencies and professional architecture compliance.`}
                  </p>
                  <div className="mt-auto pt-3.5 border-t border-outline-variant/30 flex justify-between font-technical-sm text-[10px] text-outline">
                    <span>VALIDATED: {formattedDate}{cert.fileSize ? ` // ${formatBytes(cert.fileSize)}` : ''}</span>
                    <span className="text-secondary font-bold uppercase">
                      {cert.customLabel || (index === 0 ? 'RECENT_ENTRY' : index === 1 ? 'CORE_CREDENTIAL' : 'SYSTEMS_EXPERT')}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Section: Certification Archive */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-label-caps text-label-caps text-secondary mb-2 tracking-[0.2em]">02 // CERTIFICATION_ARCHIVE</h2>
            <p className="font-technical-sm text-[10px] sm:text-technical-sm text-outline uppercase">Master Registry // Total Entries: {filteredCerts.length}</p>
          </div>
          
          {/* Technical Filter Bar */}
          <div className="glass-panel p-1.5 flex flex-wrap gap-1.5 items-center">
            <div className="relative group">
              <input 
                className="font-technical-sm text-[10px] pl-7 pr-3 py-1.5 w-full md:w-48" 
                placeholder="SEARCH_DATABASE..." 
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-outline text-[13px]">search</span>
            </div>
            
            <select 
              className="font-technical-sm text-[10px] px-3 py-1.5 pr-7 appearance-none bg-no-repeat bg-[right_0.5rem_center] cursor-pointer"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL_CATEGORIES">ALL_CATEGORIES</option>
              <option value="STRUCTURAL">STRUCTURAL</option>
              <option value="SUSTAINABLE">SUSTAINABLE</option>
              <option value="COMPUTATIONAL">COMPUTATIONAL</option>
            </select>
            
            <div className="flex items-center gap-1.5 glass-panel px-2 py-1 border-none">
              <span className="font-technical-sm text-outline text-[9px]">RANGE:</span>
              <input 
                className="font-technical-sm text-[10px] border-none bg-transparent p-0 w-20 focus:ring-0 focus:border-none focus:outline-none" 
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <span className="text-outline text-xs">-</span>
              <input 
                className="font-technical-sm text-[10px] border-none bg-transparent p-0 w-20 focus:ring-0 focus:border-none focus:outline-none" 
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* Archive Grid (Dense) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {paginatedCerts.map((cert) => {
            const formattedDate = cert.dateIssued.replace(/-/g, '.');
            return (
              <div 
                key={`arch-${cert._id}`} 
                className="glass-panel p-4 group hover:bg-white/5 hover:scale-[1.02] transition-all duration-300 cursor-pointer border-l-2 border-l-secondary/20 flex flex-col justify-between relative"
                onMouseEnter={() => playElectricSparkSound()}
                onClick={() => {
                  if (cert.fileUrl) {
                    window.open(cert.fileUrl, '_blank');
                  }
                }}
              >
                {/* Animated Border Overlay - Triggers on Hover */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#0070FF" strokeWidth="1.5" className="card-loading-border" />
                </svg>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-technical-sm text-[10px] text-secondary">ID: {cert.credentialId}</span>
                    <span className="material-symbols-outlined text-xs text-outline group-hover:text-primary">description</span>
                  </div>
                  <h4 className="font-headline-md text-primary mb-1 line-clamp-2 hover:text-secondary transition-colors" style={{ fontSize: '16px', lineHeight: '20px' }}>
                    {cert.name}
                  </h4>
                  <p className="font-technical-sm text-[10px] text-outline uppercase mb-2 line-clamp-1">{cert.issuer}</p>
                </div>
                <div className="relative z-10">
                  <div className="dimension-line mb-2 opacity-30"></div>
                  <span className="font-technical-sm text-[10px] text-on-surface-variant">{formattedDate}{cert.fileSize ? ` // ${formatBytes(cert.fileSize)}` : ''}</span>
                </div>
              </div>
            );
          })}
          {paginatedCerts.length === 0 && (
            <div className="col-span-full py-12 text-center text-on-surface-variant font-technical-sm">
              NO MATCHING ENTRIES FOUND IN REGISTRY DATABASE
            </div>
          )}
        </div>

        {/* System Navigation */}
        {/* System Navigation */}
        <div className="mt-12 flex justify-between items-center glass-panel p-3 sm:p-4 border-l-0 border-r-0 border-b-0 gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="flex items-center gap-1 sm:gap-2 font-technical-sm text-[10px] sm:text-xs text-outline hover:text-secondary disabled:opacity-30 disabled:hover:text-outline transition-colors group cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs sm:text-sm group-hover:-translate-x-1 transition-transform">arrow_back_ios</span>
            <span className="hidden sm:inline">PREV_PAGE</span>
          </button>
          
          <div className="flex items-center gap-2 sm:gap-6 font-technical-sm text-[10px] sm:text-xs text-outline">
            <div className="flex gap-1.5 sm:gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <span 
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-1 cursor-pointer transition-colors ${currentPage === i + 1 ? 'text-primary border-b border-primary' : 'hover:text-primary'}`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              ))}
            </div>
            <span className="opacity-30">//</span>
            <span className="tracking-widest">
              <span className="hidden sm:inline">PAGE_TOTAL_</span>{String(totalPages).padStart(2, '0')}
            </span>
          </div>
          
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="flex items-center gap-1 sm:gap-2 font-technical-sm text-[10px] sm:text-xs text-outline hover:text-secondary disabled:opacity-30 disabled:hover:text-outline transition-colors group cursor-pointer"
          >
            <span className="hidden sm:inline">NEXT_PAGE</span>
            <span className="material-symbols-outlined text-xs sm:text-sm group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
          </button>
        </div>
      </section>

      {/* Technical Callout Section */}
      <div className="mt-24 glass-panel p-8 md:p-12 border-t border-b border-[#0070FF]/30">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex-1">
            <h3 className="font-headline-md text-headline-md text-primary mb-4">VERIFICATION PROTOCOL</h3>
            <p className="font-body-base text-body-base text-on-surface-variant">
              All credentials listed within this repository are cryptographically secured and verifiable through the central architectural registry. For detailed syllabi or validation hashes, please initiate a request.
            </p>
          </div>
          <div>
            <button 
              onClick={() => setShowQrModal(true)}
              className="border border-[#0070FF]/50 text-[#0070FF] font-technical-sm text-technical-sm px-8 py-4 hover:bg-[#0070FF]/10 hover:shadow-[0_0_20px_rgba(0,112,255,0.4)] transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined">qr_code_scanner</span>
              REQUEST VALIDATION HASH
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Verification Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full p-8 flex flex-col items-center gap-6 relative animate-fade-in">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/50"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/50"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/50"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/50"></div>
            
            <div className="text-center">
              <h4 className="font-headline-md text-lg text-primary uppercase tracking-wider">VERIFICATION REGISTRY</h4>
              <div className="dimension-line mt-2 mb-2 w-48 mx-auto"></div>
              <p className="font-technical-sm text-[10px] text-on-surface-variant uppercase tracking-widest">INITIATING CRYPTOGRAPHIC QUERY</p>
            </div>
            
            {/* QR Code Container */}
            <div className="p-3 bg-white border border-secondary/30 relative">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=0070FF&bgcolor=FFFFFF&data=https://youtu.be/dQw4w9WgXcQ?si=HEIVfhvZaUKOlC2m" 
                alt="Verification QR Code" 
                className="w-[200px] h-[200px]"
              />
            </div>

            <p className="font-technical-sm text-[10px] text-center text-secondary tracking-wide uppercase">
              SCAN TO VERIFY INTEGRITY HASH
            </p>

            <button 
              onClick={() => setShowQrModal(false)}
              className="border border-outline-variant text-on-surface-variant font-technical-sm text-xs px-6 py-2.5 hover:bg-white/5 transition-colors cursor-pointer w-full text-center"
            >
              CLOSE PROTOCOL
            </button>
          </div>
        </div>
      )}
    </>
  );
}

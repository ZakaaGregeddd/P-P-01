'use client';

import { useState, useRef, useEffect } from 'react';

interface ImageCropperModalProps {
  file: File;
  onCrop: (croppedFile: File) => void;
  onClose: () => void;
}

export default function ImageCropperModal({ file, onCrop, onClose }: ImageCropperModalProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState<number>(1.6); // Default ~16:10 or 16:9
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Load the image file
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImgSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, [file]);

  // Reset positioning when zoom or aspect ratio changes
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
  }, [zoom, aspectRatio]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleCrop = () => {
    if (!imgRef.current || !containerRef.current) return;

    const img = imgRef.current;
    const container = containerRef.current;

    // The crop frame dimensions
    const cropWidth = 320;
    const cropHeight = 320 / aspectRatio;

    // Get coordinates relative to the crop frame
    const canvas = document.createElement('canvas');
    canvas.width = cropWidth * 2; // high-dpi
    canvas.height = cropHeight * 2;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(2, 2);

    // Calculate dimensions
    const containerRect = container.getBoundingClientRect();
    
    // Find the center of the container (which is where the crop window is centered)
    const cropLeft = (containerRect.width - cropWidth) / 2;
    const cropTop = (containerRect.height - cropHeight) / 2;

    // Image natural sizes and rendered sizes
    const imgWidth = img.width;
    const imgHeight = img.height;

    // How the image is drawn onto canvas:
    // We draw the image, taking into account zoom, position (panned offset), and scale.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Source coordinates inside the image
    // Rendered image rect relative to container
    const imgRenderedWidth = imgWidth * zoom;
    const imgRenderedHeight = imgHeight * zoom;

    const imgX = (containerRect.width - imgRenderedWidth) / 2 + position.x;
    const imgY = (containerRect.height - imgRenderedHeight) / 2 + position.y;

    // Translate to canvas origin mapping the crop window's top-left corner
    const drawX = imgX - cropLeft;
    const drawY = imgY - cropTop;

    ctx.drawImage(img, drawX, drawY, imgRenderedWidth, imgRenderedHeight);

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        onCrop(croppedFile);
      }
    }, 'image/jpeg', 0.9);
  };

  const cropWidth = 320;
  const cropHeight = 320 / aspectRatio;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-lg rounded-xl border border-outline/30 overflow-hidden bg-surface-container-low flex flex-col glow-effect">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-outline/20">
          <span className="font-technical-sm text-technical-sm text-primary tracking-wider">
            SYSTEM_UTILITY // IMAGE_CROPPER
          </span>
          <button 
            type="button" 
            onClick={onClose} 
            className="material-symbols-outlined text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            close
          </button>
        </div>

        {/* Workspace */}
        <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
          
          {/* Aspect Ratios Selection */}
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => setAspectRatio(1.777)} // 16:9
              className={`font-technical-sm text-[11px] px-3 py-1.5 border rounded cursor-pointer transition-all ${
                Math.abs(aspectRatio - 1.777) < 0.05
                  ? 'border-secondary text-secondary bg-secondary/10'
                  : 'border-outline/30 text-on-surface-variant hover:border-outline'
              }`}
            >
              16:9 ASPECT
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio(1.333)} // 4:3
              className={`font-technical-sm text-[11px] px-3 py-1.5 border rounded cursor-pointer transition-all ${
                Math.abs(aspectRatio - 1.333) < 0.05
                  ? 'border-secondary text-secondary bg-secondary/10'
                  : 'border-outline/30 text-on-surface-variant hover:border-outline'
              }`}
            >
              4:3 ASPECT
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio(1.08)} // 1/0.92 for Bento Item 1
              className={`font-technical-sm text-[11px] px-3 py-1.5 border rounded cursor-pointer transition-all ${
                Math.abs(aspectRatio - 1.08) < 0.05
                  ? 'border-secondary text-secondary bg-secondary/10'
                  : 'border-outline/30 text-on-surface-variant hover:border-outline'
              }`}
            >
              BENTO_01 ASPECT
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio(1)} // 1:1
              className={`font-technical-sm text-[11px] px-3 py-1.5 border rounded cursor-pointer transition-all ${
                aspectRatio === 1
                  ? 'border-secondary text-secondary bg-secondary/10'
                  : 'border-outline/30 text-on-surface-variant hover:border-outline'
              }`}
            >
              1:1 ASPECT
            </button>
          </div>

          {/* Interactive cropping area */}
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className="w-full h-80 relative overflow-hidden bg-background border border-outline/20 rounded cursor-move select-none flex items-center justify-center"
          >
            {imgSrc && (
              <img
                ref={imgRef}
                src={imgSrc}
                alt="Crop candidate"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
                draggable={false}
              />
            )}

            {/* Darkened overlay outside the crop frame */}
            <div className="absolute inset-0 pointer-events-none bg-background/60" style={{
              clipPath: `polygon(
                0% 0%, 
                0% 100%, 
                calc(50% - ${cropWidth/2}px) 100%, 
                calc(50% - ${cropWidth/2}px) calc(50% - ${cropHeight/2}px), 
                calc(50% + ${cropWidth/2}px) calc(50% - ${cropHeight/2}px), 
                calc(50% + ${cropWidth/2}px) calc(50% + ${cropHeight/2}px), 
                calc(50% - ${cropWidth/2}px) calc(50% + ${cropHeight/2}px), 
                calc(50% - ${cropWidth/2}px) 100%, 
                100% 100%, 
                100% 0%
              )`
            }}></div>

            {/* Highlighted Crop frame border */}
            <div 
              className="absolute pointer-events-none border-2 border-secondary shadow-[0_0_10px_rgba(0,112,255,0.4)]"
              style={{
                width: `${cropWidth}px`,
                height: `${cropHeight}px`,
                top: `calc(50% - ${cropHeight/2}px)`,
                left: `calc(50% - ${cropWidth/2}px)`,
              }}
            >
              {/* Corner indicators for futuristic UI style */}
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary"></div>
            </div>
          </div>

          {/* Zoom Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-technical-sm text-on-surface-variant">
              <span>ZOOM_LEVEL</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-secondary bg-surface-container cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 border-t border-outline/20 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 font-technical-sm text-technical-sm border border-outline/30 px-4 py-2.5 rounded hover:bg-surface-container/55 transition-colors cursor-pointer text-center text-primary"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleCrop}
              className="flex-1 font-technical-sm text-technical-sm text-surface bg-secondary px-4 py-2.5 rounded hover:shadow-[0_0_15px_rgba(176,198,255,0.5)] transition-all font-bold cursor-pointer text-center"
            >
              APPLY_CROP
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

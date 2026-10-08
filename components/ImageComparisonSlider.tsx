'use client';

import React, { useState } from 'react';

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({ beforeImage, afterImage }) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  return (
    <div className="relative w-full max-w-2xl aspect-video overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm select-none">
      {/* After Image (Base) */}
      <img 
        src={afterImage} 
        alt="After with highlights" 
        className="absolute inset-0 w-full h-full object-cover" 
      />
      
      {/* Before Image (Clipped) */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <img 
          src={beforeImage} 
          alt="Before" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
      </div>

      {/* Slider Input */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
      />

      {/* Vertical Line Indicator */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_5px_rgba(0,0,0,0.5)] pointer-events-none"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-zinc-900 rounded-full shadow-md flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
          <svg className="w-4 h-4 text-zinc-500 dark:text-zinc-400 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>
    </div>
  );
};
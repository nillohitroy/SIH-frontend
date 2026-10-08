'use client';

import React, { useState, useRef } from 'react';
import { X, Crop, Send, Loader2 } from 'lucide-react';

interface ImageRegionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSubmitRegionQuery: (question: string, box: { ymin: number; xmin: number; ymax: number; xmax: number }) => void;
}

export const ImageRegionSelector: React.FC<ImageRegionSelectorProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onSubmitRegionQuery,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [box, setBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const imgRef = useRef<HTMLImageElement>(null);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStartPos({ x, y });
    setBox({ x, y, width: 0, height: 0 });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const currentY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    const x = Math.min(currentX, startPos.x);
    const y = Math.min(currentY, startPos.y);
    const width = Math.abs(currentX - startPos.x);
    const height = Math.abs(currentY - startPos.y);

    setBox({ x, y, width, height });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleSubmit = () => {
    if (!box || !imgRef.current || !question.trim()) return;
    setIsSubmitting(true);

    const rect = imgRef.current.getBoundingClientRect();
    // Normalize to 0-1000 scale expected by backend model guidelines
    const xmin = Math.round((box.x / rect.width) * 1000);
    const ymin = Math.round((box.y / rect.height) * 1000);
    const xmax = Math.round(((box.x + box.width) / rect.width) * 1000);
    const ymax = Math.round(((box.y + box.height) / rect.height) * 1000);

    onSubmitRegionQuery(question, { ymin, xmin, ymax, xmax });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Select Region & Inspect
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
            Click and drag a box over the specific area on the image you want to examine.
          </p>

          <div 
            className="relative cursor-crosshair overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 inline-block select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <img 
              ref={imgRef}
              src={imageUrl} 
              alt="Target Selection" 
              className="max-h-[45vh] object-contain block pointer-events-none"
            />
            {box && box.width > 2 && box.height > 2 && (
              <div 
                className="absolute border-2 border-red-500 bg-red-500/20 pointer-events-none"
                style={{
                  left: `${box.x}px`,
                  top: `${box.y}px`,
                  width: `${box.width}px`,
                  height: `${box.height}px`,
                }}
              />
            )}
          </div>

          {/* Question Input */}
          <div className="w-full flex items-center gap-2 pt-2">
            <input 
              type="text"
              placeholder="Ask a question about this selected box (e.g., 'What is built here?')"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !box || !question.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl disabled:opacity-40 transition-all cursor-pointer shadow-sm"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Analyze
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
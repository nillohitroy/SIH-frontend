'use client';

import React, { useState } from 'react';
import { ImageComparisonSlider } from './ImageComparisonSlider';
import { downloadEvidencePDF } from '@/lib/pdfGenerator';
import { X, Download, Loader2, FileSearch } from 'lucide-react';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskType: string;
  prompt: string;
  answer: string;
  outputImages: string[];
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  taskType,
  prompt,
  answer,
  outputImages,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !outputImages || outputImages.length === 0) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const imagesPayload = outputImages.length === 2 
        ? { before: outputImages[0], after: outputImages[1] }
        : { primary: outputImages[0] };

      await downloadEvidencePDF(taskType, prompt, answer, imagesPayload);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    }
    setIsDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Visual Evidence & Audit Report
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Query Prompt:</span>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{prompt}</p>
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Agent Output:</span>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{answer}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 self-start">
              {outputImages.length === 2 ? 'Multitemporal Slider (Drag handle to inspect changes)' : 'Highlighted Ground Evidence'}
            </span>
            {outputImages.length === 2 ? (
              <ImageComparisonSlider beforeImage={outputImages[0]} afterImage={outputImages[1]} />
            ) : (
              <img 
                src={outputImages[0]} 
                alt="Evidence Grounding" 
                className="max-h-[50vh] rounded-xl border border-zinc-200 dark:border-zinc-800 object-contain shadow-sm"
              />
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm disabled:opacity-50 transition-all"
          >
            {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {isDownloading ? 'Building PDF...' : 'Download PDF Report'}
          </button>
        </div>

      </div>
    </div>
  );
};
"use client";
import { useState, useRef, useEffect } from "react";
import { ImagePlus, Maximize2, Minimize2, ArrowUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (text: string, files: File[], previewUrls: string[]) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  const [isMultiline, setIsMultiline] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const currentScrollHeight = textareaRef.current.scrollHeight;
      setIsMultiline(currentScrollHeight > 56 || input.includes("\n"));

      if (isEnlarged) {
        textareaRef.current.style.height = "60vh";
      } else {
        textareaRef.current.style.height = `${Math.min(currentScrollHeight, 200)}px`;
      }
    }
  }, [input, imagePreviews, isEnlarged]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Cap at 2 images total
      const allowedFiles = newFiles.slice(0, 2 - imageFiles.length);
      
      if (allowedFiles.length > 0) {
        const newPreviews = allowedFiles.map(file => URL.createObjectURL(file));
        setImageFiles(prev => [...prev, ...allowedFiles]);
        setImagePreviews(prev => [...prev, ...newPreviews]);
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== indexToRemove));
    setImageFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = () => {
    if (!input.trim() && imageFiles.length === 0) return;
    onSend(input, imageFiles, imagePreviews);
    setInput("");
    setImagePreviews([]);
    setImageFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 pb-6 pt-2 transition-all duration-300">
      <div className={cn(
        "relative flex flex-col bg-white dark:bg-[#1a1b1e] border border-black/10 dark:border-white/10 p-2 shadow-sm focus-within:ring-1 focus-within:ring-black/20 dark:focus-within:ring-white/20 transition-all duration-300",
        isEnlarged ? "rounded-2xl" : "rounded-3xl"
      )}>
        
        {/* Render multiple preview pills */}
        {imagePreviews.length > 0 && (
          <div className="flex gap-3 px-3 pt-3 pb-1">
            {imagePreviews.map((preview, idx) => (
              <div key={idx} className="relative inline-block group">
                <img src={preview} alt={`Upload ${idx + 1}`} className="h-16 w-16 object-cover rounded-xl border border-black/10 dark:border-white/10" />
                <button onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-black dark:bg-white text-white dark:text-black rounded-full p-1 shadow-md hover:scale-110 transition-transform">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex items-center gap-1 pb-1 pl-2">
            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={imageFiles.length >= 2}
              className="p-2 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30"
              title="Upload images (Max 2)"
            >
              <ImagePlus className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex-1">
            {(isMultiline || isEnlarged) && (
              <button onClick={() => setIsEnlarged(!isEnlarged)} className="absolute top-2 right-1 p-1.5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors rounded-md hover:bg-black/5 dark:hover:bg-white/10 z-10">
                {isEnlarged ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the satellite image..."
              className={cn("w-full py-3 pl-2 bg-transparent border-none outline-none resize-none text-sm placeholder:text-black/40 dark:placeholder:text-white/40 overflow-y-auto transition-all", (isMultiline || isEnlarged) ? "pr-10" : "pr-2")}
              rows={1}
            />
          </div>

          <div className="pb-1 pr-1 shrink-0">
            <button
              onClick={handleSend}
              disabled={!input.trim() && imageFiles.length === 0}
              className={cn("p-2 rounded-full flex items-center justify-center transition-all", (input.trim() || imageFiles.length > 0) ? "bg-black dark:bg-white text-white dark:text-black cursor-pointer shadow-md hover:opacity-90" : "bg-black/5 dark:bg-white/10 text-black/30 dark:text-white/30 cursor-not-allowed")}
            >
              <ArrowUp className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
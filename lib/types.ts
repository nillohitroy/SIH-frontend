export interface SatelliteSession {
  id: number;
  title: string;
  tag: 'Opt' | 'CLC' | 'EMS' | 'TIR' | 'VHR' | 'FIR' | 'SAR';
  time: string;
  satellite: string;
  coordinates?: string;
}

export interface QuickModule {
  id: string;
  iconName: 'layers' | 'scan' | 'message-square-dashed' | 'file-text';
  label: string;
  desc: string;
  prompt: string;
}

export interface Attachment {
  type: 'image' | 'file';
  name: string;
  sizeFormatted?: string;
  previewUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachment?: Attachment | null;
  metrics?: {
    ndvi?: number;
    ndwi?: number;
    gsd?: string;
    crs?: string;
  };
}

export type ThemeMode = 'light' | 'dark';

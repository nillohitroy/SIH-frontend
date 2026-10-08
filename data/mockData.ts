import { SatelliteSession, QuickModule, ChatMessage } from '@/lib/types';

export const PROMPT_SUGGESTIONS: string[] = [
  "Describe this satellite scene in detail, including all visible land cover classes.",
  "Locate the urban structures and provide the bounding box.",
  "What has changed over time between these two dates?",
  "Fuse the optical and SAR data to find hidden structures."
];

// Matches the exact tools from our FastAPI semantic_router
export const QUICK_MODULES: QuickModule[] = [
  { 
    id: '1', 
    iconName: 'layers', 
    label: 'Land Cover / VQA', 
    desc: 'Identify classes in optical imagery', 
    prompt: 'Describe this satellite scene in detail, including all visible land cover classes.' 
  },
  { 
    id: '2', 
    iconName: 'scan', 
    label: 'Region Grounding', 
    desc: 'Extract bounding boxes for objects', 
    prompt: 'Locate the urban structures and provide the bounding box.' 
  },
  { 
    id: '3', 
    iconName: 'message-square-dashed', 
    label: 'Change Detection', 
    desc: 'Compare multi-temporal imagery', 
    prompt: 'What has changed over time between these two dates?' 
  },
  { 
    id: '4', 
    iconName: 'file-text', 
    label: 'Cross-Modal Fusion', 
    desc: 'Combine Optical + SAR data', 
    prompt: 'Fuse the optical and SAR data to find hidden structures.' 
  }
];

// Pre-populated Sidebar Sessions for a polished initial load
export const SATELLITE_SESSIONS: SatelliteSession[] = [
  {
    id: 1,
    title: "Urban Sprawl Grounding",
    tag: "Opt",
    time: "10:14 AM",
    satellite: "Sentinel-2 (Optical)",
    coordinates: "[350, 450, 650, 850]"
  },
  {
    id: 2,
    title: "Multitemporal Deforestation",
    tag: "Opt",
    time: "Yesterday",
    satellite: "Sentinel-2 (Dual-Date)",
  },
  {
    id: 3,
    title: "SAR + Optical Infrastructure Fusion",
    tag: "SAR",
    time: "2 days ago",
    satellite: "Sentinel-1 + Sentinel-2",
  }
];

// Perfect mock histories mimicking the exact output of your LLaVA 7B Agentic Backend
export const SESSION_MESSAGES_MAP: Record<number, ChatMessage[]> = {
  1: [
    {
      id: "s1-m1",
      role: "user",
      content: "Locate the urban structures and provide the bounding box.",
      timestamp: "10:14 AM",
      attachment: { type: 'image', name: 'sentinel2_urban_patch.tif', sizeFormatted: '4.2 MB' }
    },
    {
      id: "s1-m2",
      role: "assistant",
      content: "I have found the requested feature. The bounding box coordinates are [350, 450, 650, 850].",
      timestamp: "10:15 AM",
      metrics: {
        gsd: "10m",
        crs: "Text-Guided Region Grounding" // Maps to our UI's agent badge!
      }
    }
  ],
  2: [
    {
      id: "s2-m1",
      role: "user",
      content: "What has changed over time between these two dates?",
      timestamp: "2:15 PM",
      attachment: { type: 'image', name: 'amazon_multitemporal.zip', sizeFormatted: '12.1 MB' }
    },
    {
      id: "s2-m2",
      role: "assistant",
      content: "Comparing the left and right panels, there is a clear expansion of the urban footprint. New road networks are visible in the upper right quadrant, replacing what appears to have been agricultural land.",
      timestamp: "2:16 PM",
      metrics: {
        ndvi: -0.14,
        gsd: "10m",
        crs: "Multitemporal Change Understanding (Change-VQA)"
      }
    }
  ],
  3: [
    {
      id: "s3-m1",
      role: "user",
      content: "Fuse the optical and SAR data to find hidden structures.",
      timestamp: "9:00 AM",
      attachment: { type: 'image', name: 'optical_sar_pair.zip', sizeFormatted: '18.4 MB' }
    },
    {
      id: "s3-m2",
      role: "assistant",
      content: "Cross-Modal Fusion Complete: SAR backscatter analysis reveals metallic structures hidden by cloud cover in the optical imagery.",
      timestamp: "9:01 AM",
      metrics: {
        gsd: "10m (Fused)",
        crs: "Cross-Modal (Optical + SAR) Analysis"
      }
    }
  ]
};
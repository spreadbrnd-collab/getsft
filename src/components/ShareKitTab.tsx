import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Share2, 
  Copy, 
  Download, 
  MessageSquare, 
  Instagram, 
  Facebook, 
  RefreshCw, 
  Check, 
  X, 
  ShieldCheck, 
  Globe, 
  Layers, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  ArrowRight,
  Sliders,
  Type,
  Move,
  RotateCcw,
  Save,
  Trash,
  Palette,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mic,
  Music,
  Film,
  Upload,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';
import { Realtor, Property } from '../types';

interface ShareKitTabProps {
  realtor: Realtor;
  properties: Property[];
  activePlan?: string;
  showToast: (msg: string) => void;
}

const BUILT_IN_PRESETS = [
  {
    id: 'gold-classic',
    name: '✦ Golden Classic Luxury',
    colors: {
      story: { primaryText: '#FFFFFF', secondaryText: '#CBD5E1', price: '#F1F5F9', border: '#D4AF37', badge: '#D4AF37', overlay: '#05070c' },
      post: { primaryText: '#FFFFFF', secondaryText: '#CBD5E1', price: '#D4AF37', border: '#1E293B', badge: '#94A3B8', overlay: '#05070c' },
      facebook: { primaryText: '#FFFFFF', secondaryText: '#CBD5E1', price: '#D4AF37', border: '#0F172A', badge: '#D4AF37', overlay: '#05070c' }
    },
    badgeText: 'EXCLUSIVE LISTING'
  },
  {
    id: 'emerald-modern',
    name: '✦ Emerald High-Comfort',
    colors: {
      story: { primaryText: '#F8FAFC', secondaryText: '#94A3B8', price: '#34D399', border: '#10B981', badge: '#10B981', overlay: '#022c22' },
      post: { primaryText: '#F8FAFC', secondaryText: '#94A3B8', price: '#10B981', border: '#1F2937', badge: '#10B981', overlay: '#022c22' },
      facebook: { primaryText: '#F8FAFC', secondaryText: '#94A3B8', price: '#10B981', border: '#1F2937', badge: '#10B981', overlay: '#022c22' }
    },
    badgeText: 'PASCHAL MASTERWORK'
  },
  {
    id: 'nordic-minimal',
    name: '✦ Minimalist Slate Mono',
    colors: {
      story: { primaryText: '#FFFFFF', secondaryText: '#94A3B8', price: '#FFFFFF', border: '#334155', badge: '#64748B', overlay: '#0f172a' },
      post: { primaryText: '#FFFFFF', secondaryText: '#94A3B8', price: '#FFFFFF', border: '#334155', badge: '#64748B', overlay: '#0f172a' },
      facebook: { primaryText: '#FFFFFF', secondaryText: '#94A3B8', price: '#FFFFFF', border: '#334155', badge: '#64748B', overlay: '#0f172a' }
    },
    badgeText: 'PREMIUM ARCHITECTURE'
  },
  {
    id: 'midnight-noir',
    name: '✦ Noir Dark Minimal',
    colors: {
      story: { primaryText: '#F1F5F9', secondaryText: '#64748B', price: '#94A3B8', border: '#000000', badge: '#475569', overlay: '#000000' },
      post: { primaryText: '#F1F5F9', secondaryText: '#64748B', price: '#94A3B8', border: '#000000', badge: '#475569', overlay: '#000000' },
      facebook: { primaryText: '#F1F5F9', secondaryText: '#64748B', price: '#94A3B8', border: '#000000', badge: '#475569', overlay: '#000000' }
    },
    badgeText: 'LIMITED EDITION'
  }
];

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image: ' + url));
    img.src = url;
  });
};

// Simple text wrapping helper for Canvas
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY;
}

export default function ShareKitTab({
  realtor,
  properties,
  activePlan = 'GetSFT Launch',
  showToast,
}: ShareKitTabProps) {
  const [selectedPropId, setSelectedPropId] = useState(properties[0]?.property_id.toString() || '');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [activeCustomizer, setActiveCustomizer] = useState<string | null>(null);
  
  // Track currently previewed asset type for the "Preview & Download" modal
  const [previewAssetType, setPreviewAssetType] = useState<'story' | 'post' | 'facebook' | 'video_reel' | null>(null);

  // Custom Tag/Badge text to override propertyType (defaults to EXCLUSIVE LISTING)
  const [customBadgeText, setCustomBadgeText] = useState('EXCLUSIVE LISTING');

  // Video Reel Generation States
  const [videoDuration, setVideoDuration] = useState<number>(15); // 15 to 30 seconds
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [videoTransitionType, setVideoTransitionType] = useState<'zoom' | 'crossfade' | 'instant'>('zoom');
  const [bgMusicType, setBgMusicType] = useState<'sunset_house' | 'jazz_lounge' | 'piano_solo' | 'modern_beats' | 'none'>('sunset_house');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  
  const [isRecordingMic, setIsRecordingMic] = useState<boolean>(false);
  const [micAudioUrl, setMicAudioUrl] = useState<string | null>(null);
  const [micAudioBlob, setMicAudioBlob] = useState<Blob | null>(null);
  const [captions, setCaptions] = useState<string[]>([]);
  const [includeIntroSlide, setIncludeIntroSlide] = useState<boolean>(true);
  const [isRenderingVideo, setIsRenderingVideo] = useState<boolean>(false);
  const [renderingProgress, setRenderingProgress] = useState<number>(0);
  
  // Audio Level and mic visualizer states
  const [micLevel, setMicLevel] = useState<number>(0);

  // Audio refs for exact audio-video synchronization
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const voiceSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const voiceBufferRef = useRef<AudioBuffer | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micRecorderRef = useRef<MediaRecorder | null>(null);
  const synthIntervalRef = useRef<any>(null);
  const playbackStartTimeRef = useRef<number>(0);
  const playbackOffsetRef = useRef<number>(0);

  // Animation loop refs
  const videoAnimFrameRef = useRef<number | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawVideoFrameRef = useRef<any>(null);

  // Loaded background and realtor images for lag-free rendering
  const [bgImg, setBgImg] = useState<HTMLImageElement | null>(null);
  const [realtorImg, setRealtorImg] = useState<HTMLImageElement | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // References for live preview canvas
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Customizable sizes and positions for story, post, and facebook assets
  const initialLayoutSettings = {
    story: {
      badgeSize: 26,
      badgeY: 230,
      titleSize: 74,
      titleY: 480,
      addressSize: 24,
      addressOffsetY: 65,
      specsSize: 38,
      specsOffsetY: 185,
      priceSize: 84,
      priceOffsetY: 440,
      avatarRadius: 75,
      realtorY: 1478,
      realtorSize: 36,
    },
    post: {
      badgeSize: 22,
      badgeY: 140,
      titleSize: 66,
      titleY: 248,
      addressSize: 22,
      addressOffsetY: 45,
      specsSize: 32,
      specsOffsetY: 110,
      priceSize: 78,
      priceOffsetY: 215,
      avatarRadius: 65,
      realtorY: 799,
      realtorSize: 32,
    },
    facebook: {
      badgeSize: 20,
      badgeY: 113,
      titleSize: 52,
      titleY: 175,
      addressSize: 18,
      addressOffsetY: 40,
      specsSize: 24,
      specsOffsetY: 85,
      priceSize: 64,
      priceOffsetY: 175,
      avatarRadius: 80,
      realtorY: 200,
      realtorSize: 32,
    }
  };

  const [layoutAdjustments, setLayoutAdjustments] = useState(initialLayoutSettings);

  const handleAdjustmentChange = (type: 'story' | 'post' | 'facebook', field: string, value: number) => {
    setLayoutAdjustments(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const resetLayoutAdjustments = (type: 'story' | 'post' | 'facebook') => {
    setLayoutAdjustments(prev => ({
      ...prev,
      [type]: { ...initialLayoutSettings[type] }
    }));
    showToast('Layout settings reset to standard elegant defaults.');
  };

  // Editable theme colors for each individual design type
  const [themeColors, setThemeColors] = useState({
    story: {
      primaryText: '#FFFFFF',
      secondaryText: '#CBD5E1',
      price: '#E2E8F0',
      border: '#D4AF37', // Golden accent
      badge: '#D4AF37',  // Golden badge accent
      overlay: '#000000',
    },
    post: {
      primaryText: '#FFFFFF',
      secondaryText: '#E2E8F0',
      price: '#D4AF37',
      border: '#1E293B',
      badge: '#94A3B8',
      overlay: '#000000',
    },
    facebook: {
      primaryText: '#FFFFFF',
      secondaryText: '#CBD5E1',
      price: '#D4AF37',
      border: '#0F172A',
      badge: '#D4AF37',
      overlay: '#000000',
    }
  });

  const handleColorChange = (type: 'story' | 'post' | 'facebook', field: string, value: string) => {
    setThemeColors(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const matchedProperty = properties.find(p => p.property_id.toString() === selectedPropId);

  const handleCopyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Presets Logic
  const [savedPresets, setSavedPresets] = useState<{
    id: string;
    name: string;
    colors: typeof themeColors;
    layout: typeof layoutAdjustments;
    badgeText: string;
  }[]>(() => {
    try {
      const saved = localStorage.getItem('getsft_saved_presets');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [presetNameInput, setPresetNameInput] = useState('');
  const [showSavePresetInput, setShowSavePresetInput] = useState(false);

  // Sync saved presets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('getsft_saved_presets', JSON.stringify(savedPresets));
    } catch (e) {}
  }, [savedPresets]);

  const handleSaveCurrentAsPreset = () => {
    const name = presetNameInput.trim() || `My Preset ${savedPresets.length + 1}`;
    const newPreset = {
      id: `custom-${Date.now()}`,
      name: `★ ${name}`,
      colors: JSON.parse(JSON.stringify(themeColors)),
      layout: JSON.parse(JSON.stringify(layoutAdjustments)),
      badgeText: customBadgeText
    };
    setSavedPresets(prev => [...prev, newPreset]);
    setPresetNameInput('');
    setShowSavePresetInput(false);
    showToast(`Preset "${name}" saved successfully!`);
  };

  const handleApplyPreset = (presetId: string) => {
    const builtIn = BUILT_IN_PRESETS.find(p => p.id === presetId);
    const custom = savedPresets.find(p => p.id === presetId);
    const preset = builtIn || custom;
    if (preset) {
      setThemeColors(JSON.parse(JSON.stringify(preset.colors)));
      if (preset.layout) {
        setLayoutAdjustments(JSON.parse(JSON.stringify(preset.layout)));
      }
      setCustomBadgeText(preset.badgeText);
      showToast(`Preset "${preset.name.replace(/[✦★]\s*/g, '')}" applied successfully!`);
    }
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedPresets(prev => prev.filter(p => p.id !== id));
    showToast('Custom preset deleted.');
  };

  // Asynchronously load the listing's first image & realtor profile image whenever selection shifts
  useEffect(() => {
    let active = true;
    async function loadAssets() {
      setIsLoadingImages(true);
      let loadedBg: HTMLImageElement | null = null;
      let loadedRealtor: HTMLImageElement | null = null;

      if (matchedProperty && matchedProperty.images && matchedProperty.images[0]) {
        try {
          loadedBg = await loadImage(matchedProperty.images[0]);
        } catch (e) {
          console.warn("Failed to pre-load property background", e);
        }
      }

      if (realtor.profileImage) {
        try {
          loadedRealtor = await loadImage(realtor.profileImage);
        } catch (e) {
          console.warn("Failed to pre-load realtor avatar", e);
        }
      }

      if (active) {
        setBgImg(loadedBg);
        setRealtorImg(loadedRealtor);
        setIsLoadingImages(false);
      }
    }
    loadAssets();
    return () => {
      active = false;
    };
  }, [selectedPropId, realtor.profileImage]);

  // Video Reel pre-loading and caption defaults logic
  const [areReelImagesLoading, setAreReelImagesLoading] = useState(false);
  const reelImagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    let active = true;
    if (!matchedProperty || !matchedProperty.images) return;

    async function loadReelImages() {
      setAreReelImagesLoading(true);
      const loaded: HTMLImageElement[] = [];
      try {
        const promises = matchedProperty.images.map(url => loadImage(url));
        const imgs = await Promise.all(promises);
        if (active) {
          reelImagesRef.current = imgs;
        }
      } catch (e) {
        console.warn("Failed to load some property images for video reel", e);
      } finally {
        if (active) {
          setAreReelImagesLoading(false);
        }
      }
    }
    loadReelImages();
    return () => {
      active = false;
    };
  }, [selectedPropId, matchedProperty]);

  // Synchronize captions defaults
  useEffect(() => {
    if (matchedProperty && matchedProperty.images) {
      const defaultCaptions = matchedProperty.images.map((img, i) => {
        if (i === 0) return `Welcome to this luxurious residence represented by ${realtor.name}.`;
        if (i === 1) return `${matchedProperty.bedrooms} Bedrooms, ${matchedProperty.bathrooms} Bathrooms luxury floor plan.`;
        if (i === 2) return `Breathtaking architectural design with modern premium comfort.`;
        if (i === 3) return `Fabulous chef's kitchen featuring high-end gourmet appliances.`;
        if (i === 4) return `Serene master suite sanctuary designed with cozy relaxation.`;
        return `Exquisite custom elements crafted for premium high-society standards.`;
      });
      setCaptions(defaultCaptions);
    }
  }, [selectedPropId, matchedProperty, realtor.name]);

  // Synthesizer Audio Generation
  const playSynthChord = (ctx: AudioContext, frequencies: number[], time: number, duration: number) => {
    if (isMuted) return;
    const dest = mediaStreamDestRef.current || ctx.destination;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, time);
    filter.frequency.exponentialRampToValueAtTime(150, time + duration);
    filter.connect(dest);
    if (dest !== ctx.destination) {
      filter.connect(ctx.destination);
    }
    
    frequencies.forEach(f => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, time);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.04, time + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      
      osc.connect(gain);
      gain.connect(filter);
      
      osc.start(time);
      osc.stop(time + duration);
    });
  };

  const playKick = (ctx: AudioContext, time: number) => {
    if (isMuted) return;
    const dest = mediaStreamDestRef.current || ctx.destination;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);
    
    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    
    osc.connect(gain);
    gain.connect(dest);
    if (dest !== ctx.destination) {
      gain.connect(ctx.destination);
    }
    
    osc.start(time);
    osc.stop(time + 0.16);
  };

  const playHiHat = (ctx: AudioContext, time: number) => {
    if (isMuted) return;
    const dest = mediaStreamDestRef.current || ctx.destination;
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.015, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    if (dest !== ctx.destination) {
      gain.connect(ctx.destination);
    }
    
    noise.start(time);
  };

  const nextBeatTimeRef = useRef<number>(0);
  const beatIndexRef = useRef<number>(0);
  
  const scheduler = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const lookAhead = 0.3;
    while (nextBeatTimeRef.current < ctx.currentTime + lookAhead) {
      const scheduleTime = nextBeatTimeRef.current;
      const beat = beatIndexRef.current;
      
      if (bgMusicType === 'sunset_house') {
        if (beat % 4 === 0) {
          const chordIndex = (beat / 4) % 4;
          const chords = [
            [220.00, 261.63, 293.66, 329.63, 392.00], // Am9
            [174.61, 261.63, 329.63, 349.23, 392.00], // Fmaj9
            [261.63, 293.66, 329.63, 392.00, 440.00], // Cmaj9
            [196.00, 293.66, 349.23, 392.00, 440.00]  // G9sus
          ];
          playSynthChord(ctx, chords[chordIndex], scheduleTime, 1.85);
        }
        playKick(ctx, scheduleTime);
        playHiHat(ctx, scheduleTime + 0.25);
      } else if (bgMusicType === 'piano_solo') {
        if (beat % 2 === 0) {
          const chordIndex = (beat / 2) % 4;
          const chords = [
            [130.81, 261.63, 329.63, 392.00, 523.25], // Cmaj7
            [110.00, 220.00, 261.63, 329.63, 440.00], // Am7
            [174.61, 261.63, 349.23, 440.00, 523.25], // Fmaj7
            [146.83, 293.66, 349.23, 440.00, 587.33]  // Dm7
          ];
          playSynthChord(ctx, chords[chordIndex], scheduleTime, 0.95);
        }
      } else if (bgMusicType === 'jazz_lounge') {
        const bassNotes = [110.00, 130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94];
        const bassFreq = bassNotes[beat % bassNotes.length];
        playSynthChord(ctx, [bassFreq], scheduleTime, 0.4);
        if (beat % 4 === 0) {
          const chordIndex = (beat / 4) % 4;
          const chords = [
            [220.00, 261.63, 293.66, 329.63], // Am7
            [174.61, 220.00, 261.63, 311.13], // F7
            [130.81, 196.00, 261.63, 293.66], // Cmaj7
            [146.83, 196.00, 246.94, 293.66]  // G7
          ];
          playSynthChord(ctx, chords[chordIndex], scheduleTime + 0.15, 0.75);
        }
      } else if (bgMusicType === 'modern_beats') {
        if (beat % 4 === 0) {
          const bassFreqs = [110.00, 87.31, 130.81, 98.00];
          playSynthChord(ctx, [bassFreqs[(beat / 4) % 4]], scheduleTime, 1.9);
        }
        playKick(ctx, scheduleTime);
        playHiHat(ctx, scheduleTime + 0.15);
        playHiHat(ctx, scheduleTime + 0.35);
      }
      
      nextBeatTimeRef.current += 0.5;
      beatIndexRef.current++;
    }
  };

  const startVideoPlayback = () => {
    if (isPlayingVideo) return;
    
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    if (!mediaStreamDestRef.current) {
      mediaStreamDestRef.current = ctx.createMediaStreamDestination();
    }
    
    nextBeatTimeRef.current = ctx.currentTime + 0.05;
    beatIndexRef.current = Math.floor(videoCurrentTime * 2);
    synthIntervalRef.current = setInterval(scheduler, 100);
    
    playbackStartTimeRef.current = performance.now();
    playbackOffsetRef.current = videoCurrentTime;
    setIsPlayingVideo(true);
    
    if (voiceBufferRef.current) {
      stopVoicePlayback();
      const source = ctx.createBufferSource();
      source.buffer = voiceBufferRef.current;
      source.connect(mediaStreamDestRef.current);
      source.connect(ctx.destination);
      if (videoCurrentTime < voiceBufferRef.current.duration) {
        source.start(0, videoCurrentTime);
      }
      voiceSourceRef.current = source;
    }
  };
  
  const pauseVideoPlayback = () => {
    setIsPlayingVideo(false);
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    stopVoicePlayback();
  };

  const stopVoicePlayback = () => {
    if (voiceSourceRef.current) {
      try {
        voiceSourceRef.current.stop();
      } catch (e) {}
      voiceSourceRef.current = null;
    }
  };

  useEffect(() => {
    if (!isPlayingVideo) {
      if (videoAnimFrameRef.current) {
        cancelAnimationFrame(videoAnimFrameRef.current);
        videoAnimFrameRef.current = null;
      }
      return;
    }
    
    let active = true;
    const updateFrame = () => {
      if (!active) return;
      
      const elapsed = (performance.now() - playbackStartTimeRef.current) / 1000;
      const current = playbackOffsetRef.current + elapsed;
      
      if (current >= videoDuration) {
        setVideoCurrentTime(0);
        playbackStartTimeRef.current = performance.now();
        playbackOffsetRef.current = 0;
        
        if (audioCtxRef.current) {
          nextBeatTimeRef.current = audioCtxRef.current.currentTime + 0.02;
          beatIndexRef.current = 0;
        }
        
        if (voiceBufferRef.current && audioCtxRef.current) {
          stopVoicePlayback();
          const source = audioCtxRef.current.createBufferSource();
          source.buffer = voiceBufferRef.current;
          source.connect(mediaStreamDestRef.current || audioCtxRef.current.destination);
          source.connect(audioCtxRef.current.destination);
          source.start(0, 0);
          voiceSourceRef.current = source;
        }
        
        if (videoCanvasRef.current && drawVideoFrameRef.current) {
          drawVideoFrameRef.current(videoCanvasRef.current, 0);
        }
      } else {
        setVideoCurrentTime(current);
        if (videoCanvasRef.current && drawVideoFrameRef.current) {
          drawVideoFrameRef.current(videoCanvasRef.current, current);
        }
      }
      
      videoAnimFrameRef.current = requestAnimationFrame(updateFrame);
    };
    
    videoAnimFrameRef.current = requestAnimationFrame(updateFrame);
    return () => {
      active = false;
      if (videoAnimFrameRef.current) {
        cancelAnimationFrame(videoAnimFrameRef.current);
        videoAnimFrameRef.current = null;
      }
    };
  }, [isPlayingVideo, videoDuration]);

  const startRecordingMic = async () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      
      const options = { mimeType: 'audio/webm' };
      const recorder = new MediaRecorder(stream, options);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setMicAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setMicAudioUrl(url);
        loadAudioFile(blob);
        showToast("Voice narration successfully overlayed!");
      };
      
      const audioSource = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      audioSource.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const interval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicLevel(avg);
      }, 50);
      
      (recorder as any)._visualizerInterval = interval;
      micRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingMic(true);
      showToast("Narration live! Record walk-through voice note...");
    } catch (e) {
      console.error(e);
      showToast("Unable to record microphone. Please grant audio permissions.");
    }
  };

  const stopRecordingMic = () => {
    const recorder = micRecorderRef.current;
    if (recorder && isRecordingMic) {
      recorder.stop();
      if ((recorder as any)._visualizerInterval) {
        clearInterval((recorder as any)._visualizerInterval);
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsRecordingMic(false);
      setMicLevel(0);
    }
  };

  const loadAudioFile = async (file: File | Blob) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      ctx.decodeAudioData(arrayBuffer, (decoded) => {
        voiceBufferRef.current = decoded;
        showToast("Audio processed and synced with player timeline!");
      });
    } catch (e) {
      console.error(e);
      showToast("Audio parsing failed. Try a standard MP3 or WAV file.");
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadAudioFile(file);
    const url = URL.createObjectURL(file);
    setUploadedAudioUrl(url);
  };

  const getSupportedMimeType = () => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4;codecs=h264,aac',
      'video/mp4'
    ];
    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) return t;
    }
    return '';
  };

  const drawVideoFrame = (canvas: HTMLCanvasElement, time: number, isHighRes: boolean = false) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;
    
    const K = reelImagesRef.current.length;
    if (K === 0) {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '500 40px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("Baking listing images...", width / 2, height / 2);
      return;
    }
    
    const totalSlides = K + (includeIntroSlide ? 1 : 0) + 1;
    const slideDuration = videoDuration / totalSlides;
    
    let activeSlideIndex = Math.floor(time / slideDuration);
    if (activeSlideIndex >= totalSlides) activeSlideIndex = totalSlides - 1;
    const slideProgress = (time % slideDuration) / slideDuration;
    
    let isStorySlide = false;
    let imageIndex = -1;
    
    if (includeIntroSlide) {
      if (activeSlideIndex === 0) {
        isStorySlide = true;
      } else if (activeSlideIndex === totalSlides - 1) {
        isStorySlide = true;
      } else {
        imageIndex = activeSlideIndex - 1;
      }
    } else {
      if (activeSlideIndex === totalSlides - 1) {
        isStorySlide = true;
      } else {
        imageIndex = activeSlideIndex;
      }
    }
    
    if (isStorySlide) {
      const tempCanvas = document.createElement('canvas');
      drawOnCanvas(tempCanvas, 'story');
      ctx.drawImage(tempCanvas, 0, 0, width, height);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, 0, width, 120);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      const indicatorText = activeSlideIndex === 0 ? "✦  INTRO BLOCK  ✦" : "✦  CONTACT OUTRO BLOCK  ✦";
      ctx.fillText(indicatorText, width / 2, 75);
    } else {
      const img = reelImagesRef.current[imageIndex % K];
      if (img) {
        ctx.save();
        
        let scale = 1.0;
        let xOffset = 0;
        let yOffset = 0;
        
        if (videoTransitionType === 'zoom') {
          // Use sinusoidal ease-out for ultra-soft, cinematic zooming with zero start/end acceleration jerks
          const easeProgress = Math.sin((slideProgress * Math.PI) / 2);
          scale = 1.0 + easeProgress * 0.08; // Premium, gentle 8% zoom
          xOffset = -easeProgress * 12;
          yOffset = -easeProgress * 6;
        }
        
        const imgRatio = img.width / img.height;
        const canvasRatio = width / height;
        let drawW = width;
        let drawH = height;
        let offsetX = 0;
        let offsetY = 0;
        
        if (imgRatio > canvasRatio) {
          drawW = height * imgRatio;
          offsetX = (width - drawW) / 2;
        } else {
          drawH = width / imgRatio;
          offsetY = (height - drawH) / 2;
        }
        
        ctx.translate(width / 2, height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-width / 2, -height / 2);
        
        ctx.drawImage(img, offsetX + xOffset, offsetY + yOffset, drawW, drawH);
        ctx.restore();
        
        if ((videoTransitionType === 'crossfade' || videoTransitionType === 'zoom') && slideProgress > 0.9) {
          const fadeAlpha = (slideProgress - 0.9) / 0.1;
          const nextIndex = activeSlideIndex + 1;
          
          if (nextIndex < totalSlides) {
            ctx.save();
            ctx.globalAlpha = fadeAlpha;
            
            let nextIsStory = false;
            let nextImageIdx = -1;
            if (includeIntroSlide) {
              if (nextIndex === totalSlides - 1) nextIsStory = true;
              else nextImageIdx = nextIndex - 1;
            } else {
              if (nextIndex === totalSlides - 1) nextIsStory = true;
              else nextImageIdx = nextIndex;
            }
            
            if (nextIsStory) {
              const tempCanvas = document.createElement('canvas');
              drawOnCanvas(tempCanvas, 'story');
              ctx.drawImage(tempCanvas, 0, 0, width, height);
            } else {
              const nextImg = reelImagesRef.current[nextImageIdx % K];
              if (nextImg) {
                const nextRatio = nextImg.width / nextImg.height;
                let nW = width;
                let nH = height;
                let nOX = 0;
                let nOY = 0;
                if (nextRatio > canvasRatio) {
                  nW = height * nextRatio;
                  nOX = (width - nW) / 2;
                } else {
                  nH = width / nextRatio;
                  nOY = (height - nH) / 2;
                }
                ctx.drawImage(nextImg, nOX, nOY, nW, nH);
              }
            }
            ctx.restore();
          }
        }
        
        const grad = ctx.createLinearGradient(0, height * 0.65, 0, height);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
        grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.65)');
        grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.95)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, height * 0.6, width, height * 0.4);
        
        ctx.strokeStyle = themeColors.story.border;
        ctx.lineWidth = width * 0.012;
        ctx.strokeRect(width * 0.04, width * 0.04, width - (width * 0.08), height - (width * 0.08));
        
        const captionText = captions[imageIndex % K] || '';
        if (captionText) {
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          
          let captionAlpha = 1.0;
          if (slideProgress < 0.15) {
            captionAlpha = slideProgress / 0.15;
          } else if (slideProgress > 0.85) {
            captionAlpha = (1.0 - slideProgress) / 0.15;
          }
          
          ctx.save();
          ctx.globalAlpha = captionAlpha;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 4;
          
          ctx.font = `italic 600 44px "Playfair Display", serif`;
          wrapText(ctx, captionText, width / 2, height - 280, width * 0.82, 60);
          ctx.restore();
        }
        
        if (matchedProperty) {
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.beginPath();
          ctx.roundRect(width * 0.06, width * 0.06, 360, 100, 16);
          ctx.fill();
          
          ctx.fillStyle = themeColors.story.price;
          ctx.font = 'bold 36px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`$${matchedProperty.price.toLocaleString()}`, width * 0.06 + 180, width * 0.06 + 50);
          
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.beginPath();
          ctx.roundRect(width - 420, width * 0.06, 360, 100, 16);
          ctx.fill();
          
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 28px "Space Grotesk", sans-serif';
          ctx.fillText(`${matchedProperty.bedrooms} BEDS • ${matchedProperty.bathrooms} BATHS`, width - 240, width * 0.06 + 50);
        }
      }
    }
    
    const topY = width * 0.06;
    const barSpacing = 12;
    const totalBars = totalSlides;
    const barW = (width - (width * 0.12) - (barSpacing * (totalBars - 1))) / totalBars;
    
    for (let i = 0; i < totalBars; i++) {
      const barX = width * 0.06 + i * (barW + barSpacing);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.roundRect(barX, topY, barW, 8, 4);
      ctx.fill();
      
      if (i < activeSlideIndex) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(barX, topY, barW, 8, 4);
        ctx.fill();
      } else if (i === activeSlideIndex) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(barX, topY, barW * slideProgress, 8, 4);
        ctx.fill();
      }
    }
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 80, topY + 30, 160, 50, 10);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${time.toFixed(1)}s / ${videoDuration}s`, width / 2, topY + 55);
  };

  drawVideoFrameRef.current = drawVideoFrame;

  const handleDownloadVideo = async () => {
    if (!videoCanvasRef.current) return;
    
    pauseVideoPlayback();
    
    showToast("Starting real-time high-res video compiler studio...");
    setIsRenderingVideo(true);
    setRenderingProgress(0);
    
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    
    if (!mediaStreamDestRef.current) {
      mediaStreamDestRef.current = ctx.createMediaStreamDestination();
    }
    
    const canvas = videoCanvasRef.current;
    const recordedChunks: Blob[] = [];
    const videoStream = canvas.captureStream(30);
    
    let combinedStream = videoStream;
    const audioTracks = mediaStreamDestRef.current.stream.getAudioTracks();
    if (audioTracks.length > 0) {
      combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioTracks
      ]);
    }
    
    const mimeType = getSupportedMimeType();
    
    try {
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: mimeType,
        videoBitsPerSecond: 3000000
      });
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SFT-StoryVideo-${matchedProperty ? matchedProperty.title.replace(/\s+/g, '-') : 'listing'}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setIsRenderingVideo(false);
        showToast("Dynamic 15-30s Story Video Reel downloaded successfully!");
      };
      
      mediaRecorder.start();
      
      nextBeatTimeRef.current = ctx.currentTime + 0.05;
      beatIndexRef.current = 0;
      synthIntervalRef.current = setInterval(scheduler, 100);
      
      if (voiceBufferRef.current) {
        stopVoicePlayback();
        const source = ctx.createBufferSource();
        source.buffer = voiceBufferRef.current;
        source.connect(mediaStreamDestRef.current);
        source.connect(ctx.destination);
        source.start(0, 0);
        voiceSourceRef.current = source;
      }
      
      let startTime = performance.now();
      const renderDurationMs = videoDuration * 1000;
      
      const recordTick = () => {
        const elapsed = performance.now() - startTime;
        const currentSec = Math.min(videoDuration, elapsed / 1000);
        
        drawVideoFrame(canvas, currentSec, true);
        setVideoCurrentTime(currentSec);
        setRenderingProgress(Math.round((currentSec / videoDuration) * 100));
        
        if (elapsed < renderDurationMs) {
          requestAnimationFrame(recordTick);
        } else {
          mediaRecorder.stop();
          if (synthIntervalRef.current) {
            clearInterval(synthIntervalRef.current);
            synthIntervalRef.current = null;
          }
          stopVoicePlayback();
          setVideoCurrentTime(0);
        }
      };
      
      requestAnimationFrame(recordTick);
    } catch (err) {
      console.error("Recording error", err);
      setIsRenderingVideo(false);
      showToast("Media Recording failed. Standard video previewing is still fully operational.");
    }
  };

  // Live drawing for the video reel frame player canvas
  useEffect(() => {
    if (previewAssetType === 'video_reel' && videoCanvasRef.current && !isPlayingVideo && !isRenderingVideo) {
      drawVideoFrame(videoCanvasRef.current, videoCurrentTime);
    }
  }, [previewAssetType, videoCurrentTime, isPlayingVideo, isRenderingVideo, includeIntroSlide, videoTransitionType, captions, themeColors]);

  // Unified drawing function to paint onto any Canvas
  const drawOnCanvas = (canvas: HTMLCanvasElement, type: 'story' | 'post' | 'facebook') => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions
    let width = 1080;
    let height = 1080;
    if (type === 'story') {
      width = 1080;
      height = 1920;
    } else if (type === 'facebook') {
      width = 1200;
      height = 628;
    }

    canvas.width = width;
    canvas.height = height;

    const baseColors = themeColors[type];
    const colors = {
      ...baseColors,
      titleColor: (baseColors as any).titleColor || baseColors.primaryText,
      addressColor: (baseColors as any).addressColor || baseColors.secondaryText,
      specsColor: (baseColors as any).specsColor || baseColors.primaryText,
      priceColor: (baseColors as any).priceColor || baseColors.price,
      realtorNameColor: (baseColors as any).realtorNameColor || baseColors.primaryText,
      realtorTitleColor: (baseColors as any).realtorTitleColor || baseColors.secondaryText,
      realtorContactColor: (baseColors as any).realtorContactColor || baseColors.primaryText,
      realtorWebsiteColor: (baseColors as any).realtorWebsiteColor || baseColors.badge,
    };
    const adj = layoutAdjustments[type];

    // 1. RENDER BACKGROUND IMAGE WITH REALISTIC OVERLAY & BLUR
    if (bgImg) {
      ctx.save();
      ctx.filter = 'blur(12px)';
      const imgRatio = bgImg.width / bgImg.height;
      const canvasRatio = width / height;
      let drawW = width;
      let drawH = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        drawW = height * imgRatio;
        offsetX = (width - drawW) / 2;
      } else {
        drawH = width / imgRatio;
        offsetY = (height - drawH) / 2;
      }

      // Slightly oversized draw to hide blurred borders
      ctx.drawImage(bgImg, offsetX - 40, offsetY - 40, drawW + 80, drawH + 80);
      ctx.restore();
    } else {
      // Solid slate background fallback
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, height);
    }

    // Apply dark semi-transparent overlay
    ctx.fillStyle = colors.overlay || '#000000';
    ctx.globalAlpha = 0.25; // elegant slightly darker background contrast
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1.0;

    // 2. LUXURY DECORATIVE OUTLINE BORDER
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = width * 0.012;
    ctx.strokeRect(width * 0.04, width * 0.04, width - (width * 0.08), height - (width * 0.08));

    // Determine Realtor website
    const realtorWebsite = realtor.customDomain 
      ? `www.${realtor.customDomain}` 
      : `${realtor.id}.getsft.com`;

    // 3. GRAPHIC TEMPLATES RENDERING PIPELINE
    if (type === 'story') {
      // --- INSTAGRAM STORY LAYOUT (1080 x 1920) ---

      // Luxury Accent Badge
      ctx.fillStyle = colors.badge;
      ctx.font = `bold ${adj.badgeSize}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      const badgeText = (customBadgeText || '').trim().toUpperCase();
      // Simulate elegant letter-spacing with spaces
      if (badgeText) {
        ctx.fillText(`✦  ${badgeText.split('').join(' ')}  ✦`, width / 2, adj.badgeY);
      }

      // Property Main Title - Editorial Serif Style using "Playfair Display"
      ctx.fillStyle = colors.titleColor;
      ctx.font = `italic 600 ${adj.titleSize}px "Playfair Display", serif`;
      ctx.textAlign = 'center';
      const titleText = matchedProperty ? matchedProperty.title : 'Exclusive Residence';
      const titleY = adj.titleY;
      const endTitleY = wrapText(ctx, titleText, width / 2, titleY, width * 0.8, adj.titleSize * 1.2);

      // Address Mono Indicator
      ctx.fillStyle = colors.addressColor;
      ctx.font = `500 ${adj.addressSize}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      const addressText = matchedProperty ? `${matchedProperty.address}, ${matchedProperty.city}`.toUpperCase() : 'PORTFOLIO DIRECTORY';
      ctx.fillText(addressText, width / 2, endTitleY + adj.addressOffsetY);

      // Accent divider line
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width * 0.35, endTitleY + adj.addressOffsetY + 45);
      ctx.lineTo(width * 0.65, endTitleY + adj.addressOffsetY + 45);
      ctx.stroke();

      // Specifications - Minimal modern grid layout
      if (matchedProperty) {
        ctx.fillStyle = colors.specsColor;
        ctx.font = `600 ${adj.specsSize}px "Space Grotesk", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`•   ${matchedProperty.bedrooms} BEDROOMS   •`, width / 2, endTitleY + adj.specsOffsetY);
        ctx.fillText(`•   ${matchedProperty.bathrooms} BATHROOMS   •`, width / 2, endTitleY + adj.specsOffsetY + adj.specsSize * 1.5);
        ctx.fillText(`•   ${matchedProperty.area.toLocaleString()} SFT TOTAL   •`, width / 2, endTitleY + adj.specsOffsetY + adj.specsSize * 3);
      }

      // Large bold price callout in Playfair Display
      if (matchedProperty) {
        ctx.fillStyle = colors.priceColor;
        ctx.font = `bold ${adj.priceSize}px "Outfit", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`$${matchedProperty.price.toLocaleString()}`, width / 2, endTitleY + adj.priceOffsetY);
      }

      // Compact, tightly aligned Realtor card near bottom
      const avatarX = width / 2;
      const avatarY = adj.realtorY;
      const avatarRadius = adj.avatarRadius;

      // Draw Realtor Circular DP
      if (realtorImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(realtorImg, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
        ctx.restore();
      } else {
        const initials = realtor.name.split(' ').map(n => n[0]).join('');
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
        ctx.fillStyle = '#0F766E';
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(avatarRadius * 0.8)}px "Space Grotesk", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, avatarX, avatarY);
        ctx.restore();
      }

      // Stacked Realtor details with extremely tight, clean spacing
      // Name
      ctx.fillStyle = colors.realtorNameColor;
      ctx.textAlign = 'center';
      ctx.font = `bold ${adj.realtorSize}px "Space Grotesk", sans-serif`;
      const textStartY = avatarY + avatarRadius + 40;
      ctx.fillText(realtor.name, avatarX, textStartY);

      // Title/License
      ctx.fillStyle = colors.realtorTitleColor;
      ctx.font = `500 ${Math.round(adj.realtorSize * 0.55)}px "JetBrains Mono", monospace`;
      ctx.fillText(realtor.title.toUpperCase(), avatarX, textStartY + adj.realtorSize * 0.8);

      // Phone & Email tightly aligned
      ctx.fillStyle = colors.realtorContactColor;
      ctx.font = `500 ${Math.round(adj.realtorSize * 0.6)}px "Outfit", sans-serif`;
      const realtorEmail = (realtor as any).email || `${realtor.id}@getsft.com`;
      ctx.fillText(`${realtor.phone}  |  ${realtorEmail}`, avatarX, textStartY + adj.realtorSize * 1.6);

      // Website (Symmetrical bold highlighted footer)
      ctx.fillStyle = colors.realtorWebsiteColor;
      ctx.font = `bold ${Math.round(adj.realtorSize * 0.6)}px "JetBrains Mono", monospace`;
      ctx.fillText(realtorWebsite.toUpperCase(), avatarX, textStartY + adj.realtorSize * 2.45);

    } else if (type === 'post') {
      // --- INSTAGRAM SQUARE POST LAYOUT (1080 x 1080) ---

      // Luxury badge
      ctx.fillStyle = colors.badge;
      ctx.font = `bold ${adj.badgeSize}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      const badgeText = (customBadgeText || '').trim().toUpperCase();
      if (badgeText) {
        ctx.fillText(`✦  ${badgeText.split('').join(' ')}  ✦`, width / 2, adj.badgeY);
      }

      // Property Title in Playfair Display Serif
      ctx.fillStyle = colors.titleColor;
      ctx.font = `italic 600 ${adj.titleSize}px "Playfair Display", serif`;
      ctx.textAlign = 'center';
      const titleText = matchedProperty ? matchedProperty.title : 'Exclusive Asset';
      const titleY = adj.titleY;
      const endTitleY = wrapText(ctx, titleText, width / 2, titleY, width * 0.8, adj.titleSize * 1.15);

      // Address
      ctx.fillStyle = colors.addressColor;
      ctx.font = `500 ${adj.addressSize}px "JetBrains Mono", monospace`;
      const addressText = matchedProperty ? `${matchedProperty.address}, ${matchedProperty.city}`.toUpperCase() : 'PORTFOLIO DIRECTORY';
      ctx.fillText(addressText, width / 2, endTitleY + adj.addressOffsetY);

      // Specs row
      if (matchedProperty) {
        ctx.fillStyle = colors.specsColor;
        ctx.font = `600 ${adj.specsSize}px "Space Grotesk", sans-serif`;
        ctx.fillText(`${matchedProperty.bedrooms} BEDS   •   ${matchedProperty.bathrooms} BATHS   •   ${matchedProperty.area.toLocaleString()} SFT`, width / 2, endTitleY + adj.specsOffsetY);
      }

      // Price Highlight
      if (matchedProperty) {
        ctx.fillStyle = colors.priceColor;
        ctx.font = `bold ${adj.priceSize}px "Outfit", sans-serif`;
        ctx.fillText(`$${matchedProperty.price.toLocaleString()}`, width / 2, endTitleY + adj.priceOffsetY);
      }

      // Symmetrical compact Realtor profile section at the bottom
      const avatarX = width / 2;
      const avatarY = adj.realtorY;
      const avatarRadius = adj.avatarRadius;

      if (realtorImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(realtorImg, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
        ctx.restore();
      } else {
        const initials = realtor.name.split(' ').map(n => n[0]).join('');
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
        ctx.fillStyle = '#0F766E';
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(avatarRadius * 0.85)}px "Space Grotesk", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, avatarX, avatarY);
        ctx.restore();
      }

      // Tightly nested Realtor details block
      ctx.fillStyle = colors.realtorNameColor;
      ctx.textAlign = 'center';
      ctx.font = `bold ${adj.realtorSize}px "Space Grotesk", sans-serif`;
      const textStartY = avatarY + avatarRadius + 30;
      ctx.fillText(realtor.name, avatarX, textStartY);

      ctx.fillStyle = colors.realtorTitleColor;
      ctx.font = `500 ${Math.round(adj.realtorSize * 0.56)}px "JetBrains Mono", monospace`;
      ctx.fillText(realtor.title.toUpperCase(), avatarX, textStartY + adj.realtorSize * 0.8);

      ctx.fillStyle = colors.realtorContactColor;
      ctx.font = `500 ${Math.round(adj.realtorSize * 0.62)}px "Outfit", sans-serif`;
      const realtorEmail = (realtor as any).email || `${realtor.id}@getsft.com`;
      ctx.fillText(`${realtor.phone}  |  ${realtorEmail}`, avatarX, textStartY + adj.realtorSize * 1.6);

      ctx.fillStyle = colors.realtorWebsiteColor;
      ctx.font = `bold ${Math.round(adj.realtorSize * 0.62)}px "JetBrains Mono", monospace`;
      ctx.fillText(realtorWebsite.toUpperCase(), avatarX, textStartY + adj.realtorSize * 2.35);

    } else if (type === 'facebook') {
      // --- FACEBOOK LANDSCAPE BANNER LAYOUT (1200 x 628) ---

      // Left-aligned property highlights
      const startX = width * 0.08;

      // Badge
      ctx.fillStyle = colors.badge;
      ctx.font = `bold ${adj.badgeSize}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'left';
      const badgeText = (customBadgeText || '').trim().toUpperCase();
      if (badgeText) {
        ctx.fillText(`✦  ${badgeText}  ✦`, startX, adj.badgeY);
      }

      // Title
      ctx.fillStyle = colors.titleColor;
      ctx.font = `italic 600 ${adj.titleSize}px "Playfair Display", serif`;
      const titleText = matchedProperty ? matchedProperty.title : 'Exclusive Asset';
      const titleY = adj.titleY;
      const endTitleY = wrapText(ctx, titleText, startX, titleY, width * 0.52, adj.titleSize * 1.2);

      // Address
      ctx.fillStyle = colors.addressColor;
      ctx.font = `500 ${adj.addressSize}px "JetBrains Mono", monospace`;
      const addressText = matchedProperty ? `${matchedProperty.address}, ${matchedProperty.city}`.toUpperCase() : 'PORTFOLIO DIRECTORY';
      ctx.fillText(addressText, startX, endTitleY + adj.addressOffsetY);

      // Specs
      if (matchedProperty) {
        ctx.fillStyle = colors.specsColor;
        ctx.font = `600 ${adj.specsSize}px "Space Grotesk", sans-serif`;
        ctx.fillText(`${matchedProperty.bedrooms} BEDS   •   ${matchedProperty.bathrooms} BATHS   •   ${matchedProperty.area.toLocaleString()} SFT`, startX, endTitleY + adj.specsOffsetY);
      }

      // Price Callout
      if (matchedProperty) {
        ctx.fillStyle = colors.priceColor;
        ctx.font = `bold ${adj.priceSize}px "Outfit", sans-serif`;
        ctx.fillText(`$${matchedProperty.price.toLocaleString()}`, startX, endTitleY + adj.priceOffsetY);
      }

      // Elegant Realtor profile block locked on the right hand side
      const avatarX = width * 0.76;
      const avatarY = adj.realtorY;
      const avatarRadius = adj.avatarRadius;

      if (realtorImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(realtorImg, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
        ctx.restore();
      } else {
        const initials = realtor.name.split(' ').map(n => n[0]).join('');
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
        ctx.fillStyle = '#0F766E';
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(avatarRadius * 0.8)}px "Space Grotesk", sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(initials, avatarX, avatarY);
        ctx.restore();
      }

      // Compact vertical realtor contact lines stacked beautifully on the right
      ctx.fillStyle = colors.realtorNameColor;
      ctx.textAlign = 'center';
      ctx.font = `bold ${adj.realtorSize}px "Space Grotesk", sans-serif`;
      const textStartY = avatarY + avatarRadius + 45;
      ctx.fillText(realtor.name, avatarX, textStartY);

      ctx.fillStyle = colors.realtorTitleColor;
      ctx.font = `500 ${Math.round(adj.realtorSize * 0.56)}px "JetBrains Mono", monospace`;
      ctx.fillText(realtor.title.toUpperCase(), avatarX, textStartY + adj.realtorSize * 0.8);

      ctx.fillStyle = colors.realtorContactColor;
      ctx.font = `500 ${Math.round(adj.realtorSize * 0.62)}px "Outfit", sans-serif`;
      const realtorEmail = (realtor as any).email || `${realtor.id}@getsft.com`;
      ctx.fillText(`${realtor.phone}  |  ${realtorEmail}`, avatarX, textStartY + adj.realtorSize * 1.6);

      ctx.fillStyle = colors.badge;
      ctx.font = `bold ${Math.round(adj.realtorSize * 0.62)}px "JetBrains Mono", monospace`;
      ctx.fillText(realtorWebsite.toUpperCase(), avatarX, textStartY + adj.realtorSize * 2.35);
    }
  };

  // Re-draw the modal's preview canvas whenever active preview type, colors or layout adjustments change
  useEffect(() => {
    if (previewAssetType && previewCanvasRef.current && !isLoadingImages) {
      drawOnCanvas(previewCanvasRef.current, previewAssetType);
    }
  }, [previewAssetType, themeColors, layoutAdjustments, selectedPropId, bgImg, realtorImg, isLoadingImages, customBadgeText]);

  // Handle the high-res file download
  const handleDownloadAsset = (type: 'story' | 'post' | 'facebook') => {
    // 1. Audit check feedback
    showToast(`Validating hosting package & plan authorization...`);
    
    // Create offscreen canvas for high-resolution download output
    const downloadCanvas = document.createElement('canvas');
    drawOnCanvas(downloadCanvas, type);

    // Trigger image saving workflow
    const url = downloadCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `SFT-${type}-${selectedPropId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showToast(`High-resolution ${type} graphic downloaded!`);
  };

  const shareUrl = matchedProperty 
    ? `https://${realtor.id}.getsft.com/property/${matchedProperty.property_id}`
    : `https://getsft.com/${realtor.id}`;

  const waMessage = `Check out this rare exclusive listing represented by ${realtor.name}:\n\n${matchedProperty ? matchedProperty.title : 'My Portfolio'}\n${shareUrl}`;

  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-xs tracking-widest text-neutral-400 uppercase">Publishing Toolkit</span>
        <h1 className="text-3xl font-display font-medium tracking-tight text-neutral-900 mt-1">
          Share Kit Studio
        </h1>
        <p className="text-xs text-neutral-500 mt-1">Generate high-converting social media mockups, editorial stories, and prefilled client text links in seconds.</p>
      </header>

      {/* Select active target listing for sharing */}
      <div className="p-6 bg-neutral-50 border border-neutral-150 rounded-[24px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-sans font-semibold text-xs text-neutral-800">Choose Target Asset Property</h4>
          <p className="text-[11px] text-neutral-400 font-sans">The title, address, price, and specs will automatically embed into social designs.</p>
        </div>
        <select
          value={selectedPropId}
          onChange={(e) => setSelectedPropId(e.target.value)}
          className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black cursor-pointer font-semibold"
        >
          {properties.map(p => (
            <option key={p.property_id} value={p.property_id.toString()}>{p.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Visual Social assets generation cards */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono tracking-wider uppercase text-teal-800 font-bold">1-Click Social Media Banners</h3>
          
          <div className="space-y-3">
            {[
              {
                id: 'story' as const,
                name: 'Instagram Story Graphics',
                desc: 'Dimensions: 1080 x 1920 (9:16). Premium high-end Editorial font styles & elegant details.',
                icon: Instagram,
              },
              {
                id: 'post' as const,
                name: 'Instagram Square Grid Post',
                desc: 'Dimensions: 1080 x 1080 (1:1). Perfect classic layout grid for post feeds.',
                icon: Instagram,
              },
              {
                id: 'facebook' as const,
                name: 'Facebook Landscape Banner',
                desc: 'Dimensions: 1200 x 628 (1.91:1). Landscape wide-scale design with sidebar metadata.',
                icon: Facebook,
              },
              {
                id: 'video_reel' as const,
                name: 'Animated Story Video Reel (15-30s)',
                desc: 'Create an animated high-resolution 15-30s vertical video loop. Slides through property photos with custom text transcriptions, ending on your Story graphic card. Customize background music and record voice notes directly.',
                icon: Film,
              }
            ].map((asset) => (
              <div key={asset.id} className="p-5 bg-white border border-neutral-150 rounded-2xl flex flex-col gap-4 hover:shadow-sm transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-600 border border-neutral-100 shrink-0">
                    <asset.icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-sans font-bold text-xs text-neutral-900 leading-tight block">{asset.name}</h4>
                      {asset.id === 'video_reel' && (
                        <span className="text-[9px] font-mono uppercase bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold animate-pulse">
                          Live Audio-Video
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">{asset.desc}</p>
                  </div>
                </div>

                {/* Customizer Toggles & Action */}
                <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                  {asset.id !== 'video_reel' ? (
                    <button
                      onClick={() => setActiveCustomizer(activeCustomizer === asset.id ? null : asset.id)}
                      className="text-[11px] text-teal-850 font-mono uppercase tracking-wider font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5" /> {activeCustomizer === asset.id ? 'Hide Customizer' : 'Customize Colors'}
                    </button>
                  ) : (
                    <span className="text-[10px] text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md font-bold font-mono uppercase tracking-wider">
                      🎬 Video Studio
                    </span>
                  )}

                  <button
                    onClick={() => setPreviewAssetType(asset.id)}
                    className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-transform active:scale-95 shadow-2xs"
                  >
                    <Eye className="w-3 h-3" /> {asset.id === 'video_reel' ? 'Preview & Generate' : 'Preview & Download'}
                  </button>
                </div>

                {/* Expandable theme color pickers */}
                {asset.id !== 'video_reel' && activeCustomizer === asset.id && (
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-150 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-neutral-400 block uppercase font-bold">Primary Text</label>
                      <div className="flex gap-1.5 items-center">
                        <input 
                          type="color" 
                          value={themeColors[asset.id].primaryText}
                          onChange={(e) => handleColorChange(asset.id, 'primaryText', e.target.value)}
                          className="w-5 h-5 rounded-full border border-neutral-300 cursor-pointer p-0 shrink-0"
                        />
                        <input 
                          type="text" 
                          value={themeColors[asset.id].primaryText}
                          onChange={(e) => handleColorChange(asset.id, 'primaryText', e.target.value)}
                          className="w-full text-[10px] font-mono p-1 border border-neutral-200 rounded uppercase bg-white text-center"
                          maxLength={7}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-neutral-400 block uppercase font-bold">Secondary Text</label>
                      <div className="flex gap-1.5 items-center">
                        <input 
                          type="color" 
                          value={themeColors[asset.id].secondaryText}
                          onChange={(e) => handleColorChange(asset.id, 'secondaryText', e.target.value)}
                          className="w-5 h-5 rounded-full border border-neutral-300 cursor-pointer p-0 shrink-0"
                        />
                        <input 
                          type="text" 
                          value={themeColors[asset.id].secondaryText}
                          onChange={(e) => handleColorChange(asset.id, 'secondaryText', e.target.value)}
                          className="w-full text-[10px] font-mono p-1 border border-neutral-200 rounded uppercase bg-white text-center"
                          maxLength={7}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-neutral-400 block uppercase font-bold">Price Color</label>
                      <div className="flex gap-1.5 items-center">
                        <input 
                          type="color" 
                          value={themeColors[asset.id].price}
                          onChange={(e) => handleColorChange(asset.id, 'price', e.target.value)}
                          className="w-5 h-5 rounded-full border border-neutral-300 cursor-pointer p-0 shrink-0"
                        />
                        <input 
                          type="text" 
                          value={themeColors[asset.id].price}
                          onChange={(e) => handleColorChange(asset.id, 'price', e.target.value)}
                          className="w-full text-[10px] font-mono p-1 border border-neutral-200 rounded uppercase bg-white text-center"
                          maxLength={7}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-neutral-400 block uppercase font-bold">Border Color</label>
                      <div className="flex gap-1.5 items-center">
                        <input 
                          type="color" 
                          value={themeColors[asset.id].border}
                          onChange={(e) => handleColorChange(asset.id, 'border', e.target.value)}
                          className="w-5 h-5 rounded-full border border-neutral-300 cursor-pointer p-0 shrink-0"
                        />
                        <input 
                          type="text" 
                          value={themeColors[asset.id].border}
                          onChange={(e) => handleColorChange(asset.id, 'border', e.target.value)}
                          className="w-full text-[10px] font-mono p-1 border border-neutral-200 rounded uppercase bg-white text-center"
                          maxLength={7}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-neutral-400 block uppercase font-bold">Badge Color</label>
                      <div className="flex gap-1.5 items-center">
                        <input 
                          type="color" 
                          value={themeColors[asset.id].badge}
                          onChange={(e) => handleColorChange(asset.id, 'badge', e.target.value)}
                          className="w-5 h-5 rounded-full border border-neutral-300 cursor-pointer p-0 shrink-0"
                        />
                        <input 
                          type="text" 
                          value={themeColors[asset.id].badge}
                          onChange={(e) => handleColorChange(asset.id, 'badge', e.target.value)}
                          className="w-full text-[10px] font-mono p-1 border border-neutral-200 rounded uppercase bg-white text-center"
                          maxLength={7}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-neutral-400 block uppercase font-bold">Overlay Color</label>
                      <div className="flex gap-1.5 items-center">
                        <input 
                          type="color" 
                          value={themeColors[asset.id].overlay}
                          onChange={(e) => handleColorChange(asset.id, 'overlay', e.target.value)}
                          className="w-5 h-5 rounded-full border border-neutral-300 cursor-pointer p-0 shrink-0"
                        />
                        <input 
                          type="text" 
                          value={themeColors[asset.id].overlay}
                          onChange={(e) => handleColorChange(asset.id, 'overlay', e.target.value)}
                          className="w-full text-[10px] font-mono p-1 border border-neutral-200 rounded uppercase bg-white text-center"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Messaging & Link share toolkit */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono tracking-wider uppercase text-teal-800 font-bold">Client Communication Links</h3>

          <div className="bg-white border border-neutral-150 rounded-[24px] p-6 space-y-6">
            
            {/* Share link block */}
            <div className="space-y-2">
              <span className="block text-xs font-mono uppercase tracking-wider text-neutral-400">Public Property Share URL</span>
              <div className="flex">
                <input 
                  type="text" 
                  disabled 
                  value={shareUrl} 
                  className="flex-1 px-3 py-2 bg-neutral-50 border border-r-0 border-neutral-200 text-xs font-mono rounded-l-xl cursor-not-allowed text-neutral-600" 
                />
                <button
                  onClick={() => handleCopyLink(shareUrl, 'prop-url')}
                  className="px-4 bg-black hover:bg-neutral-800 text-white rounded-r-xl text-xs font-sans font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedIndex === 'prop-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 'prop-url' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Direct WhatsApp chat Link trigger */}
            <div className="space-y-2">
              <span className="block text-xs font-mono uppercase tracking-wider text-neutral-400">WhatsApp Broadcast Text</span>
              <div className="p-4 bg-neutral-50 border border-neutral-200/50 rounded-xl space-y-3">
                <p className="text-xs text-neutral-600 leading-relaxed italic bg-white p-3 border border-neutral-100 rounded-lg">
                  "{waMessage}"
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const url = `https://wa.me/?text=${encodeURIComponent(waMessage)}`;
                      window.open(url, '_blank');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-sans font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" /> Share on WhatsApp
                  </button>
                  <button
                    onClick={() => handleCopyLink(waMessage, 'wa-text')}
                    className="px-3.5 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-sans font-medium flex items-center gap-1 cursor-pointer"
                  >
                    {copiedIndex === 'wa-text' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 'wa-text' ? 'Copy Text' : 'Copy Text'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-neutral-50/50 border border-neutral-100 rounded-xl flex items-start gap-3">
              <Share2 className="w-4 h-4 text-teal-800 shrink-0 mt-0.5" />
              <p className="text-[11px] text-neutral-500 leading-normal font-sans">
                These communication cards bypass the need for any slow manual image generation tool, saving files instantly as high-resolution PNGs tailored to standard pixel-grids.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* STUNNING "PREVIEW & DOWNLOAD" DIALOG MODAL */}
      {previewAssetType && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center overflow-hidden p-3 sm:p-4 md:p-6">
          <div className={`bg-white rounded-[24px] md:rounded-[32px] border border-neutral-150 p-5 md:p-8 w-full max-h-[95vh] lg:max-h-[90vh] shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col overflow-hidden ${previewAssetType === 'video_reel' ? 'max-w-6xl' : 'max-w-5xl'}`}>
            {/* Close Button */}
            <button
              onClick={() => {
                pauseVideoPlayback();
                setPreviewAssetType(null);
              }}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-9 h-9 md:w-10 md:h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors cursor-pointer z-30"
            >
              <X className="w-5 h-5" />
            </button>

            {previewAssetType === 'video_reel' &&
              /* ========================================================================= */
              /* SOCIAL VIDEO REEL STUDIO                                                  */
              /* ========================================================================= */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch flex-1 min-h-0 overflow-y-auto">
                
                {/* LEFT SIDE: Portrait 9:16 Video Player & Timelines */}
                <div className="lg:col-span-6 flex flex-col bg-neutral-950 p-4 sm:p-5 rounded-2xl border border-neutral-800 shadow-inner justify-between min-h-[480px]">
                  
                  {/* Header metadata */}
                  <div className="w-full flex justify-between items-center text-neutral-500 text-[10px] font-mono uppercase tracking-widest mb-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      Real-time Timeline Monitor
                    </span>
                    <span>9:16 Vertical Story Format</span>
                  </div>

                  {/* Canvas Video Viewport */}
                  <div className="relative flex-1 flex justify-center items-center min-h-[250px] lg:min-h-[380px] overflow-hidden bg-neutral-900 rounded-xl border border-neutral-800">
                    {areReelImagesLoading ? (
                      <div className="flex flex-col items-center justify-center text-neutral-400 gap-3 py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                        <span className="text-xs font-mono text-center">Caching all property photographs...</span>
                      </div>
                    ) : (
                      <div className="relative max-h-full h-full aspect-[9/16] flex justify-center items-center">
                        <canvas 
                          ref={videoCanvasRef} 
                          className="max-h-[320px] sm:max-h-[400px] lg:max-h-[480px] w-auto h-auto rounded-lg shadow-lg border border-neutral-800 bg-neutral-900 object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Player controls bar */}
                  <div className="mt-4 space-y-3">
                    {/* Time timeline scrub bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-neutral-400 uppercase">
                        <span>Timeline Scrub</span>
                        <span>{videoCurrentTime.toFixed(1)}s / {videoDuration}s</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max={videoDuration} 
                        step="0.05"
                        value={videoCurrentTime}
                        onChange={(e) => {
                          pauseVideoPlayback();
                          setVideoCurrentTime(parseFloat(e.target.value));
                        }}
                        className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                    </div>

                    {/* Timeline Controls cluster */}
                    <div className="flex items-center justify-between gap-3 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
                      <div className="flex items-center gap-2">
                        {isPlayingVideo ? (
                          <button
                            onClick={pauseVideoPlayback}
                            className="px-4 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-950 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                          >
                            <Pause className="w-3.5 h-3.5 fill-current" /> Pause
                          </button>
                        ) : (
                          <button
                            onClick={startVideoPlayback}
                            disabled={areReelImagesLoading}
                            className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-neutral-950 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" /> Play Preview
                          </button>
                        )}

                        <button
                          onClick={() => {
                            pauseVideoPlayback();
                            setVideoCurrentTime(0);
                          }}
                          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-lg cursor-pointer transition-all"
                          title="Restart Video Timeline"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Music and Voice state tags */}
                      <div className="flex items-center gap-2">
                        {voiceBufferRef.current && (
                          <span className="text-[8px] font-mono uppercase bg-teal-950 text-teal-400 border border-teal-800/50 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                            🎙️ Narration Sync
                          </span>
                        )}

                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className={`p-1.5 rounded-lg cursor-pointer transition-all ${isMuted ? 'bg-red-950/40 text-red-400 border border-red-900/30' : 'bg-neutral-800 text-neutral-400 hover:text-white'}`}
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

                {/* RIGHT SIDE: Video Reel Studio Customization Dashboard */}
                <div className="lg:col-span-6 space-y-6 lg:overflow-y-auto lg:max-h-[calc(90vh-100px)] lg:pr-3 min-h-0 pb-4">
                  
                  {/* Brand header */}
                  <div>
                    <span className="font-mono text-[9px] tracking-widest text-teal-700 uppercase font-bold block">Video Studio Control Center</span>
                    <h3 className="text-xl font-display font-semibold tracking-tight text-neutral-950 mt-1">
                      Dynamic Reel Studio
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Animate all property photographs into high-converting social campaigns with full dynamic narration.
                    </p>
                  </div>

                  {/* 1. TIMELINE & LENGTH CONFIG */}
                  <div className="p-4 bg-neutral-50 border border-neutral-150 rounded-2xl space-y-3">
                    <span className="block text-[10px] font-mono uppercase tracking-wide text-neutral-400 font-bold">
                      📏 Timeline Reel Length
                    </span>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-sans font-semibold text-neutral-800">Total duration in seconds:</span>
                        <span className="text-xs font-mono font-bold bg-neutral-200 px-2 py-0.5 rounded">{videoDuration}s</span>
                      </div>
                      <input 
                        type="range" 
                        min="15" 
                        max="30" 
                        step="1"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-teal-700"
                      />
                      <div className="flex justify-between text-[9px] text-neutral-400 font-mono">
                        <span>15 seconds (Standard Ad)</span>
                        <span>30 seconds (Immersive Walk)</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. MUSIC SYNTHESIZER BEATS ENGINE */}
                  <div className="p-4 bg-neutral-50 border border-neutral-150 rounded-2xl space-y-3">
                    <span className="block text-[10px] font-mono uppercase tracking-wide text-neutral-400 font-bold flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-teal-700" /> Web-Synthesizer Background Music
                    </span>
                    <p className="text-[10px] text-neutral-500 font-sans">
                      Our on-device synth constructs continuous studio beats on-the-fly. Choose a luxury melody track:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'sunset_house', name: 'Sunset Chill House', desc: 'Warm beach lounge synth chords + continuous kick' },
                        { id: 'piano_solo', name: 'Luxury Piano Solo', desc: 'Continuous premium arpeggiated piano resonance' },
                        { id: 'jazz_lounge', name: 'Smooth Jazz Lounge', desc: 'Warm electric chords & walking jazz bass note line' },
                        { id: 'modern_beats', name: 'Modern House Beats', desc: 'Energetic electronic bass rhythm & percussion accents' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setBgMusicType(item.id as any);
                            if (isPlayingVideo && audioCtxRef.current) {
                              nextBeatTimeRef.current = audioCtxRef.current.currentTime + 0.05;
                            }
                          }}
                          className={`p-3 text-left rounded-xl border transition-all text-xs flex flex-col gap-1 cursor-pointer ${bgMusicType === item.id ? 'bg-teal-50 border-teal-300 text-teal-950 shadow-2xs' : 'bg-white border-neutral-200 hover:border-neutral-300 text-neutral-700'}`}
                        >
                          <span className="font-bold font-sans">{item.name}</span>
                          <span className="text-[9px] text-neutral-400 font-sans leading-tight">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. VOICE-OVER NARRATION RECORDER */}
                  <div className="p-4 bg-neutral-50 border border-neutral-150 rounded-2xl space-y-4">
                    <span className="block text-[10px] font-mono uppercase tracking-wide text-neutral-400 font-bold flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-teal-700" /> Voice-Over Narration Recorder
                    </span>
                    <p className="text-[10px] text-neutral-500 font-sans leading-relaxed">
                      Record a voice note directly using your microphone or upload any audio file. It will synthesize onto your exported video dynamically.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                      {isRecordingMic ? (
                        <button
                          onClick={stopRecordingMic}
                          className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-white block animate-ping"></span>
                          Stop Recording ({micLevel.toFixed(0)} dB)
                        </button>
                      ) : (
                        <button
                          onClick={startRecordingMic}
                          className="flex-1 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                          <Mic className="w-4 h-4 text-red-500" /> Record Live Walk-through
                        </button>
                      )}

                      <label className="flex-1 py-3 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all text-center">
                        <Upload className="w-4 h-4 text-teal-700" />
                        <span>Upload Audio File</span>
                        <input 
                          type="file" 
                          accept="audio/*" 
                          onChange={handleAudioUpload} 
                          className="hidden" 
                        />
                      </label>
                    </div>

                    {/* Microphone Visualizer Bar if recording */}
                    {isRecordingMic && (
                      <div className="w-full bg-neutral-100 rounded-lg p-2.5 flex items-center gap-2 border border-red-200">
                        <span className="text-[9px] font-mono text-red-600 font-bold animate-pulse uppercase">Mic Active:</span>
                        <div className="flex-1 h-3 bg-neutral-200 rounded-full overflow-hidden relative">
                          <div 
                            className="h-full bg-red-500 rounded-full transition-all duration-75"
                            style={{ width: `${Math.min(100, (micLevel / 120) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Active Voice Tracks Metadata */}
                    {micAudioUrl && (
                      <div className="p-3 bg-teal-50/50 border border-teal-150 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-teal-950 font-medium">
                          <span>🎙️ Narration Voice-Note Connected</span>
                        </div>
                        <button
                          onClick={() => {
                            setMicAudioUrl(null);
                            setMicAudioBlob(null);
                            voiceBufferRef.current = null;
                            showToast("Voice-note cleared.");
                          }}
                          className="text-[10px] text-red-600 font-mono uppercase font-bold hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 4. TRANSITIONS & CAROUSEL SETUP */}
                  <div className="p-4 bg-neutral-50 border border-neutral-150 rounded-2xl space-y-3">
                    <span className="block text-[10px] font-mono uppercase tracking-wide text-neutral-400 font-bold">
                      🎭 Transitions & Slide Settings
                    </span>
                    
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] text-neutral-500 font-sans block">Slide Transition Animation:</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'zoom', name: 'Ken Burns Zoom' },
                            { id: 'crossfade', name: 'Smooth Crossfade' },
                            { id: 'instant', name: 'Instant Cut' },
                          ].map((trans) => (
                            <button
                              key={trans.id}
                              onClick={() => setVideoTransitionType(trans.id as any)}
                              className={`py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase text-center cursor-pointer transition-all ${videoTransitionType === trans.id ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 hover:border-neutral-300 text-neutral-700'}`}
                            >
                              {trans.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white border border-neutral-200/50 rounded-xl text-xs font-sans">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-neutral-850 block">Include Story Intro Card</span>
                          <span className="text-[10px] text-neutral-400 block leading-none">Begins with editorial story banner</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={includeIntroSlide}
                          onChange={(e) => setIncludeIntroSlide(e.target.checked)}
                          className="w-4 h-4 text-teal-600 border-neutral-300 rounded focus:ring-teal-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5. SLIDE TRANSCRIPTIONS & CAPTIONS EDITOR */}
                  <div className="p-4 bg-neutral-50 border border-neutral-150 rounded-2xl space-y-3">
                    <div className="space-y-0.5">
                      <span className="block text-[10px] font-mono uppercase tracking-wide text-neutral-400 font-bold">
                        ✍️ Dynamic Slide Transcriptions & Captions
                      </span>
                      <p className="text-[10px] text-neutral-500 font-sans">
                        Customize the text overlays displayed at the bottom of each photographic slide segment:
                      </p>
                    </div>

                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {captions.map((text, idx) => (
                        <div key={idx} className="space-y-1 p-2.5 bg-white border border-neutral-200/50 rounded-xl">
                          <div className="flex justify-between items-center text-[9px] font-mono text-neutral-400">
                            <span>SLIDE PHOTO {idx + 1}</span>
                            <span>{text.length} chars</span>
                          </div>
                          <textarea 
                            value={text}
                            onChange={(e) => {
                              const updated = [...captions];
                              updated[idx] = e.target.value;
                              setCaptions(updated);
                            }}
                            rows={2}
                            className="w-full text-xs font-sans p-2 border border-neutral-200 rounded-lg outline-none focus:border-neutral-400 bg-neutral-50/50"
                            placeholder={`Enter subtitle text overlay for slide ${idx + 1}...`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 6. BIG export compile trigger */}
                  <div className="pt-4 border-t border-neutral-150/50">
                    {isRenderingVideo ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-teal-700 font-bold animate-pulse">
                            🎥 Compiling High-Res Video Reel...
                          </span>
                          <span>{renderingProgress}% Complete</span>
                        </div>
                        <div className="w-full h-2.5 bg-neutral-200 rounded-full overflow-hidden relative">
                          <div 
                            className="h-full bg-teal-500 rounded-full transition-all duration-75"
                            style={{ width: `${renderingProgress}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-neutral-400 font-mono uppercase text-center tracking-wider">
                          Step 2 of 3: Syncing synth loops & audio track envelopes...
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleDownloadVideo}
                        className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-neutral-950 rounded-2xl text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-lg hover:shadow-xl"
                      >
                        <Film className="w-4 h-4 text-neutral-950 fill-current" /> Compile & Download Video Reel
                      </button>
                    )}
                    <p className="text-[10px] text-neutral-400 font-mono text-center mt-2.5 uppercase tracking-wider">
                      Output format: High-Definition WebM/MP4 (30 FPS, 3 Mbps)
                    </p>
                  </div>

                </div>

              </div>
            }

            {previewAssetType !== 'video_reel' &&
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start flex-1 min-h-0 overflow-y-auto lg:overflow-visible">
              
              {/* Left Side: Real-time Live Render Preview Canvas */}
              <div className="lg:col-span-7 sticky top-0 lg:static z-20 flex flex-col items-center justify-center bg-neutral-950 p-3 md:p-4 rounded-2xl border border-neutral-800 shadow-inner min-h-[160px] sm:min-h-[220px] lg:min-h-[480px]">
                <div className="w-full flex justify-between items-center text-neutral-500 text-[10px] font-mono uppercase tracking-widest mb-2 lg:mb-3 px-2">
                  <span>Live Render Preview</span>
                  <span>{previewAssetType === 'story' ? '9:16 vertical' : previewAssetType === 'post' ? '1:1 square' : '1.91:1 wide'}</span>
                </div>

                {isLoadingImages ? (
                  <div className="flex flex-col items-center justify-center text-neutral-400 gap-2 py-10 lg:py-20">
                    <RefreshCw className="w-8 h-8 animate-spin text-teal-500" />
                    <span className="text-xs font-mono">Baking dynamic image assets...</span>
                  </div>
                ) : (
                  <div className="relative max-w-full flex justify-center items-center">
                    <canvas 
                      ref={previewCanvasRef} 
                      className="max-h-[22vh] sm:max-h-[28vh] lg:max-h-[500px] max-w-full w-auto h-auto rounded-lg shadow-lg border border-neutral-800 bg-neutral-900 object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Right Side: Pro Integrations Checks & Download Panel */}
              <div className="lg:col-span-5 space-y-6 lg:overflow-y-auto lg:max-h-[calc(90vh-100px)] lg:pr-3 min-h-0 pb-4 lg:pb-0">
                <div>
                  <span className="font-mono text-[10px] tracking-widest text-teal-700 uppercase font-bold block">Preview & Export Center</span>
                  <h3 className="text-2xl font-display font-semibold tracking-tight text-neutral-950 mt-1">
                    Export Studio
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Your luxury marketing banner is compiled client-side using premium high-resolution canvas layers.
                  </p>
                </div>

                {/* PRO INTEGRATION CHECKS (Requested Domain & Plan checks) */}
                <div className="p-5 bg-neutral-50 border border-neutral-150 rounded-2xl space-y-3.5">
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Package & Domain Auditing
                  </h4>
                  
                  <div className="space-y-2 text-xs font-sans">
                    {/* Plan checking */}
                    <div className="flex items-center justify-between p-2.5 bg-white border border-neutral-200/50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-neutral-500" />
                        <div>
                          <span className="font-semibold block text-neutral-850">Active Subscription Plan</span>
                          <span className="text-[10px] text-neutral-400 font-mono">Authorized for high-res rendering</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full uppercase">
                        {activePlan}
                      </span>
                    </div>

                    {/* Domain Checking */}
                    <div className="flex items-center justify-between p-2.5 bg-white border border-neutral-200/50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-neutral-500" />
                        <div>
                          <span className="font-semibold block text-neutral-850">Domain Integration</span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {realtor.customDomain ? 'Custom branding connected' : 'Using default subdomain'}
                          </span>
                        </div>
                      </div>
                      {realtor.customDomain ? (
                        <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-650" /> www.{realtor.customDomain}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-250 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          ⚠️ {realtor.id}.getsft.com
                        </span>
                      )}
                    </div>
                  </div>

                  {!realtor.customDomain && (
                    <p className="text-[10px] text-neutral-500 leading-normal italic pt-1 font-sans">
                      💡 <strong>Pro Tip:</strong> Buy and bind your custom domain (like <em>{realtor.name.toLowerCase().replace(/\s/g, '')}.com</em>) inside the Website settings to automatically replace getsft.com branding in generated marketing graphics!
                    </p>
                  )}
                </div>

                {/* 🌟 BANNER DESIGN PRESETS SECTION */}
                <div className="space-y-3 bg-teal-50/30 p-4 border border-teal-150/50 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="block text-[11px] font-mono uppercase tracking-wider text-teal-850 font-bold flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-teal-800" /> Banner Design Presets
                    </span>
                    <button
                      onClick={() => setShowSavePresetInput(!showSavePresetInput)}
                      className="text-[10px] font-mono bg-teal-800 text-white hover:bg-teal-900 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer font-bold transition-all"
                      title="Save current slider adjustments & color palette"
                    >
                      <Save className="w-3 h-3" /> Save Preset
                    </button>
                  </div>

                  {showSavePresetInput && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-white border border-teal-100 rounded-xl space-y-2"
                    >
                      <span className="block text-[10px] font-mono text-neutral-500 uppercase font-bold">Preset Name</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Modern Rose Gold..."
                          value={presetNameInput}
                          onChange={(e) => setPresetNameInput(e.target.value)}
                          className="flex-1 text-xs px-2.5 py-1 bg-neutral-50 border border-neutral-200 focus:border-teal-700 rounded-lg outline-none font-medium text-neutral-800"
                        />
                        <button
                          onClick={handleSaveCurrentAsPreset}
                          className="px-3 py-1 bg-neutral-900 hover:bg-black text-white text-[10px] font-mono rounded-lg cursor-pointer font-bold"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setShowSavePresetInput(false)}
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 text-[10px] font-mono rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-1.5">
                    <span className="block text-[9px] font-mono uppercase tracking-wider text-neutral-400">Available Presets (Click to apply)</span>
                    <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
                      {/* Built-in list */}
                      {BUILT_IN_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleApplyPreset(p.id)}
                          className="w-full text-left text-xs px-3 py-2 bg-white hover:bg-neutral-50 border border-neutral-150 rounded-xl flex items-center justify-between group cursor-pointer transition-colors"
                        >
                          <span className="font-semibold text-neutral-800">{p.name}</span>
                          <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest bg-neutral-50 group-hover:bg-teal-50 group-hover:text-teal-850 px-2 py-0.5 rounded transition-colors">Default</span>
                        </button>
                      ))}

                      {/* Custom list */}
                      {savedPresets.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleApplyPreset(p.id)}
                          className="w-full text-left text-xs px-3 py-2 bg-white hover:bg-neutral-50 border border-neutral-150 rounded-xl flex items-center justify-between cursor-pointer group transition-colors"
                        >
                          <span className="font-semibold text-neutral-800">{p.name}</span>
                          <button
                            onClick={(e) => handleDeletePreset(p.id, e)}
                            className="p-1 text-neutral-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                            title="Delete custom preset"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Real-time Theme & Layout Customizer directly inside modal */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
                    <span className="block text-[12px] font-mono uppercase tracking-wider text-neutral-800 dark:text-neutral-200 font-bold flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-teal-700" /> Elegant Customizer console
                    </span>
                    <button
                      onClick={() => resetLayoutAdjustments(previewAssetType)}
                      className="text-[10px] font-mono text-teal-700 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300 flex items-center gap-1 cursor-pointer font-bold"
                      title="Reset elements to elegant default spacing"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Defaults
                    </button>
                  </div>

                  {/* ✍️ CUSTOM TAG TEXT BOX */}
                  <div className="space-y-1.5 p-3 bg-neutral-50/70 dark:bg-slate-900/60 border border-neutral-150/50 dark:border-slate-800/80 rounded-2xl">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-700 dark:text-neutral-300 font-bold flex items-center gap-1">
                      <Type className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" /> Custom Tag / Badge Text
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. JUST LISTED, FOR SALE, SOLD..."
                      value={customBadgeText}
                      onChange={(e) => setCustomBadgeText(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 bg-white dark:bg-slate-950 border border-neutral-200 dark:border-slate-800 focus:border-teal-700 rounded-xl outline-none font-medium text-neutral-850 dark:text-white focus:ring-1 focus:ring-teal-100"
                    />
                    <p className="text-[9px] text-neutral-400 dark:text-neutral-350 leading-normal font-sans">
                      This text replaces the property type displayed as the badge at the top of the template. Leave blank to hide the badge completely.
                    </p>
                  </div>

                  {/* Modular element cards containing both Color and Layout Sliders in single unified boxes */}
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">

                    {/* 1. Category Badge Controls */}
                    <div className="p-3 bg-neutral-50/70 dark:bg-slate-900/60 border border-neutral-150/50 dark:border-slate-800/80 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold text-neutral-700 dark:text-neutral-200 font-mono">
                        <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-teal-600" /> Category Badge</span>
                        <span className="text-[9px] font-medium text-neutral-400 dark:text-neutral-350">Size: {layoutAdjustments[previewAssetType].badgeSize}px | Y: {layoutAdjustments[previewAssetType].badgeY}px</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-mono text-neutral-400 dark:text-neutral-350 block uppercase">Color</label>
                          <div className="flex gap-1 items-center">
                            <input 
                              type="color" 
                              value={themeColors[previewAssetType].badge}
                              onChange={(e) => handleColorChange(previewAssetType, 'badge', e.target.value)}
                              className="w-5 h-5 rounded-full border border-neutral-300 dark:border-slate-700 cursor-pointer p-0 shrink-0"
                            />
                            <span className="text-[9px] font-mono uppercase text-neutral-600 dark:text-neutral-300">{themeColors[previewAssetType].badge}</span>
                          </div>
                        </div>

                        <div className="space-y-0.5 col-span-2 grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] text-neutral-400 dark:text-neutral-350 font-mono block">Font Size</span>
                            <input 
                              type="range"
                              min="10"
                              max="60"
                              value={layoutAdjustments[previewAssetType].badgeSize}
                              onChange={(e) => handleAdjustmentChange(previewAssetType, 'badgeSize', parseInt(e.target.value))}
                              className="w-full h-1 bg-neutral-200 dark:bg-slate-800 rounded appearance-none cursor-pointer accent-teal-700"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-neutral-400 dark:text-neutral-350 font-mono block">Vertical Y</span>
                            <input 
                              type="range"
                              min={previewAssetType === 'story' ? "50" : previewAssetType === 'post' ? "30" : "20"}
                              max={previewAssetType === 'story' ? "400" : previewAssetType === 'post' ? "300" : "200"}
                              value={layoutAdjustments[previewAssetType].badgeY}
                              onChange={(e) => handleAdjustmentChange(previewAssetType, 'badgeY', parseInt(e.target.value))}
                              className="w-full h-1 bg-neutral-200 dark:bg-slate-800 rounded appearance-none cursor-pointer accent-teal-700"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Property Title Controls */}
                    <div className="p-3 bg-neutral-50/70 dark:bg-slate-900/60 border border-neutral-150/50 dark:border-slate-800/80 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold text-neutral-700 dark:text-neutral-200 font-mono">
                        <span className="flex items-center gap-1"><Type className="w-3 h-3 text-teal-600" /> Property Title</span>
                        <span className="text-[9px] font-medium text-neutral-400 dark:text-neutral-350">Size: {layoutAdjustments[previewAssetType].titleSize}px | Y: {layoutAdjustments[previewAssetType].titleY}px</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-mono text-neutral-400 dark:text-neutral-350 block uppercase">Color</label>
                          <div className="flex gap-1 items-center">
                            <input 
                              type="color" 
                              value={themeColors[previewAssetType].titleColor || themeColors[previewAssetType].primaryText}
                              onChange={(e) => handleColorChange(previewAssetType, 'titleColor', e.target.value)}
                              className="w-5 h-5 rounded-full border border-neutral-300 dark:border-slate-700 cursor-pointer p-0 shrink-0"
                            />
                            <span className="text-[9px] font-mono uppercase text-neutral-600 dark:text-neutral-300">{themeColors[previewAssetType].titleColor || themeColors[previewAssetType].primaryText}</span>
                          </div>
                        </div>

                        <div className="space-y-0.5 col-span-2 grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] text-neutral-400 dark:text-neutral-350 font-mono block">Font Size</span>
                            <input 
                              type="range"
                              min="20"
                              max="130"
                              value={layoutAdjustments[previewAssetType].titleSize}
                              onChange={(e) => handleAdjustmentChange(previewAssetType, 'titleSize', parseInt(e.target.value))}
                              className="w-full h-1 bg-neutral-200 dark:bg-slate-800 rounded appearance-none cursor-pointer accent-teal-700"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-neutral-400 dark:text-neutral-350 font-mono block">Vertical Y</span>
                            <input 
                              type="range"
                              min={previewAssetType === 'story' ? "100" : previewAssetType === 'post' ? "50" : "50"}
                              max={previewAssetType === 'story' ? "800" : previewAssetType === 'post' ? "500" : "350"}
                              value={layoutAdjustments[previewAssetType].titleY}
                              onChange={(e) => handleAdjustmentChange(previewAssetType, 'titleY', parseInt(e.target.value))}
                              className="w-full h-1 bg-neutral-200 dark:bg-slate-800 rounded appearance-none cursor-pointer accent-teal-700"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Address Controls */}
                    <div className="p-3 bg-neutral-50/70 dark:bg-slate-900/60 border border-neutral-150/50 dark:border-slate-800/80 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold text-neutral-700 dark:text-neutral-200 font-mono">
                        <span className="flex items-center gap-1"><Move className="w-3 h-3 text-teal-600" /> Property Address</span>
                        <span className="text-[9px] font-medium text-neutral-400 dark:text-neutral-350">Size: {layoutAdjustments[previewAssetType].addressSize}px | Offset Y: {layoutAdjustments[previewAssetType].addressOffsetY}px</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-mono text-neutral-400 dark:text-neutral-350 block uppercase">Color</label>
                          <div className="flex gap-1 items-center">
                            <input 
                              type="color" 
                              value={themeColors[previewAssetType].addressColor || themeColors[previewAssetType].secondaryText}
                              onChange={(e) => handleColorChange(previewAssetType, 'addressColor', e.target.value)}
                              className="w-5 h-5 rounded-full border border-neutral-300 dark:border-slate-700 cursor-pointer p-0 shrink-0"
                            />
                            <span className="text-[9px] font-mono uppercase text-neutral-600 dark:text-neutral-300">{themeColors[previewAssetType].addressColor || themeColors[previewAssetType].secondaryText}</span>
                          </div>
                        </div>

                        <div className="space-y-0.5 col-span-2 grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] text-neutral-400 dark:text-neutral-350 font-mono block">Font Size</span>
                            <input 
                              type="range"
                              min="10"
                              max="60"
                              value={layoutAdjustments[previewAssetType].addressSize}
                              onChange={(e) => handleAdjustmentChange(previewAssetType, 'addressSize', parseInt(e.target.value))}
                              className="w-full h-1 bg-neutral-200 dark:bg-slate-800 rounded appearance-none cursor-pointer accent-teal-700"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-neutral-400 dark:text-neutral-350 font-mono block">Offset Y</span>
                            <input 
                              type="range"
                              min="20"
                              max="200"
                              value={layoutAdjustments[previewAssetType].addressOffsetY}
                              onChange={(e) => handleAdjustmentChange(previewAssetType, 'addressOffsetY', parseInt(e.target.value))}
                              className="w-full h-1 bg-neutral-200 dark:bg-slate-800 rounded appearance-none cursor-pointer accent-teal-700"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. Specifications / Amenities Controls */}
                    <div className="p-3 bg-neutral-50/70 dark:bg-slate-900/60 border border-neutral-150/50 dark:border-slate-800/80 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold text-neutral-700 dark:text-neutral-200 font-mono">
                        <span className="flex items-center gap-1"><Layers className="w-3 h-3 text-teal-600" /> Specs / Amenities</span>
                        <span className="text-[9px] font-medium text-neutral-400 dark:text-neutral-350">Size: {layoutAdjustments[previewAssetType].specsSize}px | Offset Y: {layoutAdjustments[previewAssetType].specsOffsetY}px</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-mono text-neutral-400 dark:text-neutral-350 block uppercase">Color</label>
                          <div className="flex gap-1 items-center">
                            <input 
                              type="color" 
                              value={themeColors[previewAssetType].specsColor || themeColors[previewAssetType].primaryText}
                              onChange={(e) => handleColorChange(previewAssetType, 'specsColor', e.target.value)}
                              className="w-5 h-5 rounded-full border border-neutral-300 dark:border-slate-700 cursor-pointer p-0 shrink-0"
                            />
                            <span className="text-[9px] font-mono uppercase text-neutral-600 dark:text-neutral-300">{themeColors[previewAssetType].specsColor || themeColors[previewAssetType].primaryText}</span>
                          </div>
                        </div>

                        <div className="space-y-0.5 col-span-2 grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] text-neutral-400 dark:text-neutral-350 font-mono block">Font Size</span>
                            <input 
                              type="range"
                              min="10"
                              max="60"
                              value={layoutAdjustments[previewAssetType].specsSize}
                              onChange={(e) => handleAdjustmentChange(previewAssetType, 'specsSize', parseInt(e.target.value))}
                              className="w-full h-1 bg-neutral-200 dark:bg-slate-800 rounded appearance-none cursor-pointer accent-teal-700"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-neutral-400 dark:text-neutral-350 font-mono block">Offset Y</span>
                            <input 
                              type="range"
                              min="20"
                              max="400"
                              value={layoutAdjustments[previewAssetType].specsOffsetY}
                              onChange={(e) => handleAdjustmentChange(previewAssetType, 'specsOffsetY', parseInt(e.target.value))}
                              className="w-full h-1 bg-neutral-200 dark:bg-slate-800 rounded appearance-none cursor-pointer accent-teal-700"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5. Pricing Highlight Controls */}
                    <div className="p-3 bg-neutral-50/70 dark:bg-slate-900/60 border border-neutral-150/50 dark:border-slate-800/80 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold text-neutral-700 dark:text-neutral-200 font-mono">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-teal-600" /> Pricing Highlight</span>
                        <span className="text-[9px] font-medium text-neutral-400 dark:text-neutral-350">Size: {layoutAdjustments[previewAssetType].priceSize}px | Offset Y: {layoutAdjustments[previewAssetType].priceOffsetY}px</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-mono text-neutral-400 dark:text-neutral-350 block uppercase">Color</label>
                          <div className="flex gap-1 items-center">
                            <input 
                              type="color" 
                              value={themeColors[previewAssetType].priceColor || themeColors[previewAssetType].price}
                              onChange={(e) => handleColorChange(previewAssetType, 'priceColor', e.target.value)}
                              className="w-5 h-5 rounded-full border border-neutral-300 dark:border-slate-700 cursor-pointer p-0 shrink-0"
                            />
                            <span className="text-[9px] font-mono uppercase text-neutral-600 dark:text-neutral-300">{themeColors[previewAssetType].priceColor || themeColors[previewAssetType].price}</span>
                          </div>
                        </div>

                        <div className="space-y-0.5 col-span-2 grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] text-neutral-400 dark:text-neutral-350 font-mono block">Font Size</span>
                            <input 
                              type="range"
                              min="20"
                              max="150"
                              value={layoutAdjustments[previewAssetType].priceSize}
                              onChange={(e) => handleAdjustmentChange(previewAssetType, 'priceSize', parseInt(e.target.value))}
                              className="w-full h-1 bg-neutral-200 dark:bg-slate-800 rounded appearance-none cursor-pointer accent-teal-700"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-neutral-400 dark:text-neutral-350 font-mono block">Offset Y</span>
                            <input 
                              type="range"
                              min="50"
                              max={previewAssetType === 'story' ? "800" : previewAssetType === 'post' ? "500" : "400"}
                              value={layoutAdjustments[previewAssetType].priceOffsetY}
                              onChange={(e) => handleAdjustmentChange(previewAssetType, 'priceOffsetY', parseInt(e.target.value))}
                              className="w-full h-1 bg-neutral-200 dark:bg-slate-800 rounded appearance-none cursor-pointer accent-teal-700"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 6. COMBINED PROPERTY GROUP POSITION SHIFT CONTROLS */}
                    <div className="p-3 bg-teal-50/25 dark:bg-slate-900/40 border border-teal-100/60 dark:border-slate-800 rounded-2xl space-y-2">
                      <span className="block text-[10px] font-mono uppercase tracking-wide text-teal-850 dark:text-teal-400 font-bold">
                        🏢 Combined Property Section Shift
                      </span>
                      <p className="text-[9px] text-neutral-400 dark:text-neutral-350 leading-relaxed font-sans">
                        Symmetrically adjust all property textual fields (Title, Address, Specs, Price) up or down on the canvas together as a single block:
                      </p>
                      <div className="flex gap-2.5">
                        <button
                          onClick={() => handleAdjustmentChange(previewAssetType, 'titleY', Math.max(50, layoutAdjustments[previewAssetType].titleY - 25))}
                          className="flex-1 py-1 px-2 border border-teal-600/40 hover:bg-teal-50 dark:hover:bg-slate-800 text-teal-800 dark:text-teal-400 text-[10px] font-mono rounded-lg cursor-pointer font-bold flex items-center justify-center gap-1"
                        >
                          Shift Group Up ▴
                        </button>
                        <button
                          onClick={() => handleAdjustmentChange(previewAssetType, 'titleY', Math.min(1000, layoutAdjustments[previewAssetType].titleY + 25))}
                          className="flex-1 py-1 px-2 border border-teal-600/40 hover:bg-teal-50 dark:hover:bg-slate-800 text-teal-800 dark:text-teal-400 text-[10px] font-mono rounded-lg cursor-pointer font-bold flex items-center justify-center gap-1"
                        >
                          Shift Group Down ▾
                        </button>
                      </div>
                    </div>

                    {/* 7. Realtor Profile Avatar Controls */}
                    <div className="p-3 bg-neutral-50/70 dark:bg-slate-900/60 border border-neutral-150/50 dark:border-slate-800/80 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold text-neutral-700 dark:text-neutral-200 font-mono">
                        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-teal-600" /> Realtor Portrait</span>
                        <span className="text-[9px] font-medium text-neutral-400 dark:text-neutral-350">Radius: {layoutAdjustments[previewAssetType].avatarRadius}px | Y Position: {layoutAdjustments[previewAssetType].realtorY}px</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-neutral-400 dark:text-neutral-350 font-mono block">Avatar Size / Radius</span>
                          <input 
                            type="range"
                            min="30"
                            max="150"
                            value={layoutAdjustments[previewAssetType].avatarRadius}
                            onChange={(e) => handleAdjustmentChange(previewAssetType, 'avatarRadius', parseInt(e.target.value))}
                            className="w-full h-1 bg-neutral-200 dark:bg-slate-800 rounded appearance-none cursor-pointer accent-teal-700"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-neutral-400 dark:text-neutral-350 font-mono block">Realtor Card Position Y</span>
                          <input 
                            type="range"
                            min={previewAssetType === 'story' ? "800" : previewAssetType === 'post' ? "400" : "100"}
                            max={previewAssetType === 'story' ? "1700" : previewAssetType === 'post' ? "950" : "500"}
                            value={layoutAdjustments[previewAssetType].realtorY}
                            onChange={(e) => handleAdjustmentChange(previewAssetType, 'realtorY', parseInt(e.target.value))}
                            className="w-full h-1 bg-neutral-200 dark:bg-slate-800 rounded appearance-none cursor-pointer accent-teal-700"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 8. INDIVIDUAL REALTOR DETAILS TEXT CONTROLS */}
                    <div className="p-3 bg-neutral-50/70 dark:bg-slate-900/60 border border-neutral-150/50 dark:border-slate-800/80 rounded-2xl space-y-3">
                      <span className="block text-[10px] font-mono uppercase tracking-wide text-neutral-700 dark:text-neutral-200 font-bold flex items-center gap-1">
                        <Type className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" /> Realtor Text Details (Individual Colors & Sizes)
                      </span>

                      {/* Realtor Name */}
                      <div className="space-y-1.5 pt-1.5 border-t border-neutral-150/30">
                        <div className="flex justify-between text-[9px] font-mono uppercase text-neutral-400">
                          <span>Name Size: {layoutAdjustments[previewAssetType].realtorSize}px</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <div className="flex gap-1 items-center">
                            <input 
                              type="color" 
                              value={themeColors[previewAssetType].realtorNameColor || themeColors[previewAssetType].primaryText}
                              onChange={(e) => handleColorChange(previewAssetType, 'realtorNameColor', e.target.value)}
                              className="w-4 h-4 rounded-full border border-neutral-300 dark:border-slate-700 cursor-pointer p-0 shrink-0"
                            />
                            <span className="text-[8px] font-mono uppercase text-neutral-600 dark:text-neutral-300">Color</span>
                          </div>
                          <div className="col-span-2">
                            <input 
                              type="range"
                              min="15"
                              max="60"
                              value={layoutAdjustments[previewAssetType].realtorSize}
                              onChange={(e) => handleAdjustmentChange(previewAssetType, 'realtorSize', parseInt(e.target.value))}
                              className="w-full h-1 bg-neutral-200 dark:bg-slate-800 rounded appearance-none cursor-pointer accent-teal-700"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Realtor Title */}
                      <div className="space-y-1.5 pt-1.5 border-t border-neutral-150/30">
                        <div className="flex justify-between text-[9px] font-mono uppercase text-neutral-400">
                          <span>Title / License Size</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <div className="flex gap-1 items-center">
                            <input 
                              type="color" 
                              value={themeColors[previewAssetType].realtorTitleColor || themeColors[previewAssetType].secondaryText}
                              onChange={(e) => handleColorChange(previewAssetType, 'realtorTitleColor', e.target.value)}
                              className="w-4 h-4 rounded-full border border-neutral-300 dark:border-slate-700 cursor-pointer p-0 shrink-0"
                            />
                            <span className="text-[8px] font-mono uppercase text-neutral-600 dark:text-neutral-300">Color</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[8px] text-neutral-400 font-sans block">Automatically scaled symmetrically with Name</span>
                          </div>
                        </div>
                      </div>

                      {/* Realtor Contacts (Phone & Email) */}
                      <div className="space-y-1.5 pt-1.5 border-t border-neutral-150/30">
                        <div className="flex justify-between text-[9px] font-mono uppercase text-neutral-400">
                          <span>Phone & Email Contacts</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <div className="flex gap-1 items-center">
                            <input 
                              type="color" 
                              value={themeColors[previewAssetType].realtorContactColor || themeColors[previewAssetType].primaryText}
                              onChange={(e) => handleColorChange(previewAssetType, 'realtorContactColor', e.target.value)}
                              className="w-4 h-4 rounded-full border border-neutral-300 dark:border-slate-700 cursor-pointer p-0 shrink-0"
                            />
                            <span className="text-[8px] font-mono uppercase text-neutral-600 dark:text-neutral-300">Color</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[8px] text-neutral-400 font-sans block">Aligned precisely for brand standards</span>
                          </div>
                        </div>
                      </div>

                      {/* Realtor Custom Domain / Web Link */}
                      <div className="space-y-1.5 pt-1.5 border-t border-neutral-150/30">
                        <div className="flex justify-between text-[9px] font-mono uppercase text-neutral-400">
                          <span>Custom Website Address</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <div className="flex gap-1 items-center">
                            <input 
                              type="color" 
                              value={themeColors[previewAssetType].realtorWebsiteColor || themeColors[previewAssetType].badge}
                              onChange={(e) => handleColorChange(previewAssetType, 'realtorWebsiteColor', e.target.value)}
                              className="w-4 h-4 rounded-full border border-neutral-300 dark:border-slate-700 cursor-pointer p-0 shrink-0"
                            />
                            <span className="text-[8px] font-mono uppercase text-neutral-600 dark:text-neutral-300">Color</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[8px] text-neutral-400 font-sans block">Formatted as high-contrast brand link</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* 9. Miscellaneous Controls (Border and Overlay) */}
                    <div className="p-3 bg-neutral-50/70 dark:bg-slate-900/60 border border-neutral-150/50 dark:border-slate-800/80 rounded-2xl space-y-3">
                      <span className="block text-[10px] font-mono uppercase tracking-wide text-neutral-700 dark:text-neutral-200 font-bold flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" /> Global Assets Accent Colors
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-mono text-neutral-400 block uppercase">Border Color</label>
                          <div className="flex gap-1 items-center">
                            <input 
                              type="color" 
                              value={themeColors[previewAssetType].border}
                              onChange={(e) => handleColorChange(previewAssetType, 'border', e.target.value)}
                              className="w-5 h-5 rounded-full border border-neutral-300 cursor-pointer p-0 shrink-0"
                            />
                            <span className="text-[9px] font-mono uppercase text-neutral-600 dark:text-neutral-300">{themeColors[previewAssetType].border}</span>
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-mono text-neutral-400 block uppercase">Overlay tint</label>
                          <div className="flex gap-1 items-center">
                            <input 
                              type="color" 
                              value={themeColors[previewAssetType].overlay}
                              onChange={(e) => handleColorChange(previewAssetType, 'overlay', e.target.value)}
                              className="w-5 h-5 rounded-full border border-neutral-300 cursor-pointer p-0 shrink-0"
                            />
                            <span className="text-[9px] font-mono uppercase text-neutral-600 dark:text-neutral-300">{themeColors[previewAssetType].overlay}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                {/* Big Prominent Call To Action to download */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      handleDownloadAsset(previewAssetType);
                    }}
                    className="w-full py-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] shadow-lg hover:shadow-xl"
                  >
                    <Download className="w-4 h-4" /> Download High-Resolution {previewAssetType === 'story' ? 'Story' : previewAssetType === 'post' ? 'Post' : 'Banner'}
                  </button>
                  <p className="text-[10px] text-neutral-400 font-mono text-center mt-2.5 uppercase tracking-wider">
                    Output: 100% loss-less PNG vector-sharp format
                  </p>
                </div>

              </div>
            </div>
          </div>
        }

          </div>
        </div>
      )}

    </div>
  );
}

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  Sparkles,
  FileText,
  Camera,
  Check,
  Mic,
  MicOff,
  Wand2,
  Scissors,
  Focus,
  Zap,
  RefreshCw,
  Eye,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Info,
  ExternalLink,
  Copy,
  Settings
} from 'lucide-react';
import { PRESET_DEMOS, PresetDemo } from '../data/presets';
import { useSpeechRecognition } from '../hooks/useVoice';
import { CloudinaryAiMode, CloudinaryEfficiencyMetrics } from '../types';
import {
  CLOUDINARY_TRANSFORMS,
  calculateEfficiencyMetrics,
  optimizeDroppedImage,
  applyCloudinaryAiTransform,
  formatBytes,
} from '../utils/cloudinary';
import { CloudinaryLogo } from './CloudinaryLogo';

interface ProductIntakeProps {
  image: string | null;
  onImageChange: (base64OrUrl: string | null) => void;
  cloudinaryMetrics: CloudinaryEfficiencyMetrics | null;
  onCloudinaryMetricsChange: (metrics: CloudinaryEfficiencyMetrics | null) => void;
  productName: string;
  onProductNameChange: (val: string) => void;
  productSpecs: string;
  onProductSpecsChange: (val: string) => void;
  onSelectPreset: (preset: PresetDemo) => void;
  onOpenCloudinaryHub?: () => void;
}

export const ProductIntake: React.FC<ProductIntakeProps> = ({
  image,
  onImageChange,
  cloudinaryMetrics,
  onCloudinaryMetricsChange,
  productName,
  onProductNameChange,
  productSpecs,
  onProductSpecsChange,
  onSelectPreset,
  onOpenCloudinaryHub,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [isDraggingOverDropzone, setIsDraggingOverDropzone] = useState(false);
  const [isWindowDragging, setIsWindowDragging] = useState(false);
  const [activeMode, setActiveMode] = useState<CloudinaryAiMode>('optimized');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExtractingSpecs, setIsExtractingSpecs] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState(false);
  const [showOriginalComparison, setShowOriginalComparison] = useState(false);
  const [rawDroppedImage, setRawDroppedImage] = useState<string | null>(null);
  const [isCopiedCdnUrl, setIsCopiedCdnUrl] = useState(false);

  // Voice Search for Product Name
  const {
    isListening: isListeningName,
    hasSupport: hasSpeechSupport,
    error: speechError,
    startListening: startListeningName,
    stopListening: stopListeningName,
  } = useSpeechRecognition();

  const handleToggleVoiceName = () => {
    if (isListeningName) {
      stopListeningName();
    } else {
      startListeningName((spokenText) => {
        onProductNameChange(spokenText);
      });
    }
  };

  // Cloudinary AI optimization processing pipeline
  const processWithCloudinary = useCallback(
    async (sourceImage: string, mode: CloudinaryAiMode, originalBytes?: number) => {
      setIsOptimizing(true);
      try {
        const estOriginal = originalBytes || Math.round((sourceImage.length - 22) * 0.75);

        // 1. Immediately apply high-precision visual transform locally
        // This guarantees the image is instantly updated, never blanked out or erased!
        const result = await applyCloudinaryAiTransform(sourceImage, mode, estOriginal);
        onImageChange(result.transformedDataUrl);
        onCloudinaryMetricsChange(result.metrics);

        // 2. Call backend Cloudinary optimization endpoint for visual tag extraction & CDN URL
        const savedCloud = localStorage.getItem('smartbuy_cloudinary_cloud') || undefined;
        try {
          const res = await fetch('/api/cloudinary/optimize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: sourceImage,
              mode,
              originalSizeBytes: estOriginal,
              cloudName: savedCloud,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.metrics) {
              onCloudinaryMetricsChange({
                ...result.metrics,
                ...data.metrics,
                cloudTransformUrl: data.cloudUrl || result.metrics.cloudTransformUrl,
              });
            }
          }
        } catch {
          // Keep the visual transform active even if offline
        }
      } catch (err) {
        console.error('Cloudinary AI processing error:', err);
      } finally {
        setIsOptimizing(false);
      }
    },
    [onCloudinaryMetricsChange, onImageChange]
  );

  // Handle incoming dropped or selected file
  const handleFileProcess = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (JPG, PNG, WEBP, AVIF, HEIC).');
        return;
      }

      setIsOptimizing(true);
      const originalBytes = file.size;

      try {
        // Fast client-side optimization to compress raw camera megabytes
        const optimized = await optimizeDroppedImage(file, 1400, 1400, 0.9);
        setRawDroppedImage(optimized.dataUrl);
        onImageChange(optimized.dataUrl);

        // Apply Cloudinary AI optimization pipeline
        await processWithCloudinary(optimized.dataUrl, activeMode, originalBytes);
      } catch (err) {
        console.error('Error processing dropped picture:', err);
      } finally {
        setIsOptimizing(false);
      }
    },
    [activeMode, onImageChange, processWithCloudinary]
  );

  // Handle dropped image URL or remote text
  const handleRemoteImageProcess = useCallback(
    async (url: string) => {
      setRawDroppedImage(url);
      onImageChange(url);
      setIsOptimizing(true);
      try {
        await processWithCloudinary(url, activeMode, 1024 * 1024 * 3); // ~3MB estimate for web image
      } finally {
        setIsOptimizing(false);
      }
    },
    [activeMode, onImageChange, processWithCloudinary]
  );

  // Switch Cloudinary AI Mode
  const handleModeChange = async (mode: CloudinaryAiMode) => {
    setActiveMode(mode);
    const source = rawDroppedImage || image;
    if (source) {
      await processWithCloudinary(rawDroppedImage || source, mode, cloudinaryMetrics?.originalBytes);
    }
  };

  // Global window drag detection so users know they can drop pictures anywhere
  useEffect(() => {
    let dragCounter = 0;

    const handleWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
        setIsWindowDragging(true);
      }
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        setIsWindowDragging(false);
        dragCounter = 0;
      }
    };

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsWindowDragging(false);

      if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        handleFileProcess(e.dataTransfer.files[0]);
      } else if (e.dataTransfer) {
        const text = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
        if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
          handleRemoteImageProcess(text);
        }
      }
    };

    // Clipboard paste listener (Ctrl+V / Cmd+V) to drop screenshots directly!
    const handleWindowPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileProcess(file);
            break;
          }
        }
      }
    };

    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', handleWindowDrop);
    window.addEventListener('paste', handleWindowPaste);

    return () => {
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDrop);
      window.removeEventListener('paste', handleWindowPaste);
    };
  }, [handleFileProcess, handleRemoteImageProcess]);

  // Dropzone drag handlers
  const handleDropzoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverDropzone(false);
    setIsWindowDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    } else {
      const text = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
      if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
        handleRemoteImageProcess(text);
      }
    }
  };

  // Rapid Spec Extraction directly from Dropped Image
  const handleAutoExtractSpecs = async () => {
    const targetImage = rawDroppedImage || image;
    if (!targetImage) return;

    setIsExtractingSpecs(true);
    setExtractSuccess(false);

    try {
      const res = await fetch('/api/extract-specs-from-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: targetImage }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.productName && !productName.trim()) {
          onProductNameChange(data.productName);
        }
        if (data.specsSummary) {
          onProductSpecsChange(data.specsSummary);
        }
        setExtractSuccess(true);
        setTimeout(() => setExtractSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to extract specs from image:', err);
    } finally {
      setIsExtractingSpecs(false);
    }
  };

  const handleClearImage = () => {
    onImageChange(null);
    setRawDroppedImage(null);
    onCloudinaryMetricsChange(null);
    setActiveMode('optimized');
  };

  const handleCopyCloudinaryCdn = () => {
    if (cloudinaryMetrics?.cloudTransformUrl || image) {
      navigator.clipboard.writeText(cloudinaryMetrics?.cloudTransformUrl || image || '');
      setIsCopiedCdnUrl(true);
      setTimeout(() => setIsCopiedCdnUrl(false), 2000);
    }
  };

  return (
    <div className="relative bg-[#131519] rounded-2xl border border-zinc-800/80 p-5 sm:p-6 shadow-md transition-all">
      {/* Full-Screen / Card Drag Overlay when user drags picture from desktop */}
      {isWindowDragging && (
        <div className="absolute inset-0 z-50 rounded-2xl bg-blue-950/90 backdrop-blur-md border-2 border-dashed border-blue-400 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400 flex items-center justify-center text-blue-300 mb-3 shadow-lg animate-bounce">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <CloudinaryLogo size={22} />
            <span>Drop Product Picture Here!</span>
          </h3>
          <p className="text-xs text-blue-200 mt-1 max-w-sm">
            Cloudinary AI will auto-optimize, strip backgrounds, improve lighting, and boost spec OCR clarity for instant Smart Buy analysis.
          </p>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-cyan-300 bg-blue-900/60 px-3 py-1 rounded-full border border-blue-600/40">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cloudinary AI Vision Pipeline Active</span>
          </div>
        </div>
      )}

      {/* Header bar: Title, Cloudinary AI Badge & Quick Demos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
              1
            </span>
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              Picture Dropping &amp; Product Identification
            </h2>
            {/* Prominent Cloudinary AI Pill */}
            <button
              type="button"
              onClick={onOpenCloudinaryHub}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-blue-950/90 hover:bg-blue-900 text-blue-200 border border-blue-600/70 px-2.5 py-0.5 rounded-full transition-all cursor-pointer shadow-xs group"
              title="Open Cloudinary AI Hub & Settings"
            >
              <CloudinaryLogo size={14} />
              <span>Powered by Cloudinary AI</span>
              <Settings className="w-3 h-3 text-blue-400 group-hover:rotate-45 transition-transform" />
            </button>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Drop any product picture, paste screenshot with <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-mono border border-zinc-700">Ctrl+V</kbd>, or search by product name.
          </p>
        </div>

        {/* Quick Demo Previews */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 flex-wrap">
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Wand2 className="w-3 h-3 text-amber-400" /> Test Samples:
          </span>
          {PRESET_DEMOS.map((demo) => (
            <button
              key={demo.id}
              type="button"
              onClick={async () => {
                onSelectPreset(demo);
                setRawDroppedImage(demo.sampleImage);
                onImageChange(demo.sampleImage);
                await processWithCloudinary(demo.sampleImage, activeMode, 1024 * 1024 * 3.4);
              }}
              className="px-2 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium transition-colors border border-zinc-700/60 cursor-pointer shadow-2xs hover:border-amber-500/40"
            >
              {demo.name.split(' ')[0]} {demo.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Picture Drop Zone & Cloudinary AI Studio */}
        <div className="lg:col-span-6 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Product Photo Drop Zone</span>
            </label>
            <div className="flex items-center gap-2">
              {image && (
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Image Loaded &amp; Optimized
                </span>
              )}
              {onOpenCloudinaryHub && (
                <button
                  type="button"
                  onClick={onOpenCloudinaryHub}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <CloudinaryLogo size={12} />
                  <span>Cloudinary Hub</span>
                </button>
              )}
            </div>
          </div>

          {/* Hidden File and Camera Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0]);
              }
            }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0]);
              }
            }}
          />

          {/* Dropped Image Preview or Interactive Drop Area */}
          {image ? (
            <div className="relative rounded-2xl border border-blue-900/60 overflow-hidden bg-zinc-950/90 shadow-md group">
              {/* Cloudinary Header Bar on Preview */}
              <div className="px-3 py-2 bg-gradient-to-r from-blue-950/70 via-zinc-900 to-blue-950/40 border-b border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CloudinaryLogo size={16} />
                  <span className="font-bold text-white text-[11px] flex items-center gap-1.5">
                    <span>Cloudinary AI Studio</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-cyan-300 border border-blue-500/30 font-mono">
                      {CLOUDINARY_TRANSFORMS[activeMode].badge}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {onOpenCloudinaryHub && (
                    <button
                      type="button"
                      onClick={onOpenCloudinaryHub}
                      className="px-2 py-0.5 rounded-md bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border border-blue-700/50 text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Cloudinary AI Settings"
                    >
                      <Settings className="w-3 h-3 text-blue-300" />
                      <span>Settings</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCopyCloudinaryCdn}
                    className="px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono transition-colors flex items-center gap-1 cursor-pointer"
                    title="Copy Cloudinary CDN Link"
                  >
                    {isCopiedCdnUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopiedCdnUrl ? 'Copied' : 'CDN URL'}</span>
                  </button>
                </div>
              </div>

              {/* Image Display */}
              <div className="relative h-60 sm:h-64 flex items-center justify-center p-3 bg-gradient-to-b from-zinc-900/50 to-zinc-950">
                <img
                  src={showOriginalComparison && rawDroppedImage ? rawDroppedImage : (image || rawDroppedImage || '')}
                  alt="Product Drop Preview"
                  onError={(e) => {
                    if (rawDroppedImage && e.currentTarget.src !== rawDroppedImage) {
                      e.currentTarget.src = rawDroppedImage;
                    }
                  }}
                  className="w-full h-full object-contain transition-all duration-300 rounded-lg shadow-sm"
                />

                {/* Optimizing Spinner Overlay */}
                {isOptimizing && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-zinc-100 z-20">
                    <CloudinaryLogo size={32} className="animate-spin" />
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Applying Cloudinary AI</span>
                      <span className="text-cyan-300 font-mono">({CLOUDINARY_TRANSFORMS[activeMode].badge})</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">Processing on Cloudinary edge CDN...</span>
                  </div>
                )}

                {/* Top overlay action buttons */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                  {rawDroppedImage && (
                    <button
                      type="button"
                      onClick={() => setShowOriginalComparison((prev) => !prev)}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                        showOriginalComparison
                          ? 'bg-amber-500 text-zinc-950 font-bold'
                          : 'bg-black/60 hover:bg-black/80 text-zinc-200 border border-zinc-700'
                      }`}
                      title="Toggle comparison with original unoptimized photo"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{showOriginalComparison ? 'Showing Raw' : 'Compare Raw'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-md text-[11px] font-medium shadow-xs"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="p-1 bg-rose-600/90 hover:bg-rose-500 text-white rounded-md text-xs shadow-xs"
                    title="Remove picture"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom Left Mode Pill on Image */}
                <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-black/85 border border-blue-500/50 text-[10px] font-mono text-cyan-300 font-semibold backdrop-blur-xs flex items-center gap-1">
                    <CloudinaryLogo size={12} />
                    {CLOUDINARY_TRANSFORMS[activeMode].badge}
                  </span>
                  {showOriginalComparison && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold text-[10px]">
                      RAW ORIGINAL
                    </span>
                  )}
                </div>
              </div>

              {/* Cloudinary AI Mode Switcher Strip */}
              <div className="border-t border-zinc-800 bg-[#0e1015] p-2.5 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                    <CloudinaryLogo size={14} />
                    <span>Select Cloudinary AI Transformation:</span>
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono font-semibold">
                    {CLOUDINARY_TRANSFORMS[activeMode].name}
                  </span>
                </div>

                {/* Mode Selector Buttons */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleModeChange('optimized')}
                    className={`p-1.5 rounded-lg text-center transition-all cursor-pointer border ${
                      activeMode === 'optimized'
                        ? 'bg-amber-500/20 border-amber-500/70 text-amber-300 shadow-2xs font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 mx-auto mb-0.5 text-amber-400" />
                    <span className="text-[10px] block leading-tight font-semibold">Auto-Optimize</span>
                    <span className="text-[9px] text-zinc-500 block font-mono">f_auto,q_auto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('bg_removed')}
                    className={`p-1.5 rounded-lg text-center transition-all cursor-pointer border ${
                      activeMode === 'bg_removed'
                        ? 'bg-cyan-500/20 border-cyan-500/70 text-cyan-300 shadow-2xs font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                    }`}
                  >
                    <Scissors className="w-3.5 h-3.5 mx-auto mb-0.5 text-cyan-400" />
                    <span className="text-[10px] block leading-tight font-semibold">BG Removal</span>
                    <span className="text-[9px] text-zinc-500 block font-mono">e_bgremoval</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('smart_crop')}
                    className={`p-1.5 rounded-lg text-center transition-all cursor-pointer border ${
                      activeMode === 'smart_crop'
                        ? 'bg-purple-500/20 border-purple-500/70 text-purple-300 shadow-2xs font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                    }`}
                  >
                    <Focus className="w-3.5 h-3.5 mx-auto mb-0.5 text-purple-400" />
                    <span className="text-[10px] block leading-tight font-semibold">Subject Crop</span>
                    <span className="text-[9px] text-zinc-500 block font-mono">g_auto:subject</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('enhanced')}
                    className={`p-1.5 rounded-lg text-center transition-all cursor-pointer border ${
                      activeMode === 'enhanced'
                        ? 'bg-emerald-500/20 border-emerald-500/70 text-emerald-300 shadow-2xs font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5 mx-auto mb-0.5 text-emerald-400" />
                    <span className="text-[10px] block leading-tight font-semibold">De-Noise</span>
                    <span className="text-[9px] text-zinc-500 block font-mono">e_improve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('spec_ocr')}
                    className={`p-1.5 rounded-lg text-center transition-all cursor-pointer border ${
                      activeMode === 'spec_ocr'
                        ? 'bg-blue-500/20 border-blue-500/70 text-blue-300 shadow-2xs font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 mx-auto mb-0.5 text-blue-400" />
                    <span className="text-[10px] block leading-tight font-semibold">OCR Clarity</span>
                    <span className="text-[9px] text-zinc-500 block font-mono">e_upscale</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Interactive Drag & Drop Box with Prominent Cloudinary Branding */
            <div
              ref={dropZoneRef}
              onDrop={handleDropzoneDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOverDropzone(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDraggingOverDropzone(false);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`h-60 sm:h-64 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-5 text-center cursor-pointer select-none relative overflow-hidden group ${
                isDraggingOverDropzone
                  ? 'border-blue-400 bg-blue-950/40 scale-[1.01]'
                  : 'border-blue-800/60 hover:border-blue-500/80 bg-[#0d121c]/80 hover:bg-[#111724]'
              }`}
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-cyan-500/5 pointer-events-none" />

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-950 to-blue-900 border border-blue-500/40 flex items-center justify-center text-blue-300 mb-2.5 shadow-lg group-hover:scale-110 group-hover:border-blue-400 transition-all">
                <CloudinaryLogo size={32} />
              </div>

              <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Drop Product Picture Here</span>
              </h4>
              <p className="text-xs text-blue-200/80 mt-1 max-w-[320px] leading-relaxed">
                Handled by <strong className="text-cyan-300">Cloudinary AI</strong>: Automatic background removal, focal cropping &amp; WebP/AVIF compression.
              </p>

              <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-200 bg-zinc-800/90 px-3 py-1 rounded-lg border border-zinc-700/80">
                  <ImageIcon className="w-3 h-3 text-cyan-400" /> Browse File
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 px-3 py-1 rounded-lg border border-amber-800/60 transition-colors"
                >
                  <Camera className="w-3 h-3" /> Camera Snap
                </button>
              </div>

              <div className="mt-3 text-[10px] text-blue-300/80 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cloudinary AI automatically strips store clutter &amp; optimizes speed</span>
              </div>
            </div>
          )}

          {/* Cloudinary Efficiency Metrics Card (Shown once picture is dropped) */}
          {image && cloudinaryMetrics && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/50 via-[#0e1320] to-cyan-950/40 border border-blue-800/60 text-xs shadow-md space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <CloudinaryLogo size={16} />
                  <span>Cloudinary AI Efficiency Boost</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono text-[10px] font-bold">
                  -{cloudinaryMetrics.percentageSaved}% Bandwidth Saved
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="bg-zinc-950/80 p-2 rounded-lg border border-blue-950">
                  <span className="text-zinc-400 text-[10px] block">Payload Reduction</span>
                  <span className="font-mono text-emerald-300 font-bold">
                    {formatBytes(cloudinaryMetrics.optimizedBytes)}
                  </span>
                  <span className="text-[10px] text-zinc-500 block line-through">
                    {formatBytes(cloudinaryMetrics.originalBytes)}
                  </span>
                </div>

                <div className="bg-zinc-950/80 p-2 rounded-lg border border-blue-950">
                  <span className="text-zinc-400 text-[10px] block">Inference Speedup</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {cloudinaryMetrics.inferenceSpeedup}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">Lower Latency</span>
                </div>

                <div className="bg-zinc-950/80 p-2 rounded-lg border border-blue-950">
                  <span className="text-zinc-400 text-[10px] block">Cloudinary Profile</span>
                  <span className="font-mono text-amber-300 font-semibold truncate block">
                    {cloudinaryMetrics.appliedTransform}
                  </span>
                  <span className="text-[10px] text-zinc-500 block truncate">Active Transform</span>
                </div>
              </div>

              {/* Detected Visual Features Pills */}
              {cloudinaryMetrics.detectedTags && cloudinaryMetrics.detectedTags.length > 0 && (
                <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-blue-300 font-semibold">Visual Features Detected:</span>
                  {cloudinaryMetrics.detectedTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-blue-950/70 text-cyan-200 text-[10px] font-medium border border-blue-800/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 1-Click Auto Spec Extraction Button */}
              <div className="pt-1.5 border-t border-blue-900/40 flex items-center justify-between gap-2">
                <span className="text-[11px] text-zinc-400">
                  Read brand, model &amp; specs from this photo?
                </span>
                <button
                  type="button"
                  onClick={handleAutoExtractSpecs}
                  disabled={isExtractingSpecs}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-60 shadow-xs"
                >
                  {isExtractingSpecs ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Reading Image...</span>
                    </>
                  ) : extractSuccess ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-950" />
                      <span>Specs Extracted!</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3 h-3" />
                      <span>Auto-Fill Specs</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Text Search, Voice Input, and Specifications */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          {/* Product Name Input with Voice Search */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <span>Product Name, Model or Store Link</span>
              </label>
              {hasSpeechSupport && (
                <button
                  type="button"
                  onClick={handleToggleVoiceName}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    isListeningName
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                  }`}
                  title={isListeningName ? 'Stop Voice Recording' : 'Speak Product Name'}
                >
                  {isListeningName ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span>Listening... (Click to stop)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3 h-3 text-amber-400" />
                      <span>Voice Search</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={productName}
                onChange={(e) => onProductNameChange(e.target.value)}
                placeholder={
                  isListeningName
                    ? 'Listening... speak product name now'
                    : 'e.g. Sony WH-1000XM5, iPhone 16 Pro, or MacBook Air M3'
                }
                className={`w-full pl-3.5 pr-11 py-2.5 rounded-xl border text-zinc-100 placeholder:text-zinc-500 text-xs sm:text-sm focus:outline-none focus:ring-2 bg-zinc-900/90 shadow-2xs transition-all ${
                  isListeningName
                    ? 'border-rose-500 ring-2 ring-rose-500/30'
                    : 'border-zinc-800 focus:ring-amber-500/20 focus:border-amber-500'
                }`}
              />

              {hasSpeechSupport && (
                <button
                  type="button"
                  onClick={handleToggleVoiceName}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all cursor-pointer ${
                    isListeningName
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40 animate-pulse'
                      : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-800'
                  }`}
                  title={isListeningName ? 'Stop Listening' : 'Voice Search'}
                >
                  {isListeningName ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>

            {isListeningName && (
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-rose-300 bg-rose-950/40 border border-rose-900/60 px-3 py-1.5 rounded-lg">
                <span className="flex space-x-0.5 items-end h-3">
                  <span className="w-1 bg-rose-400 animate-[bounce_0.6s_infinite_100ms] h-full rounded" />
                  <span className="w-1 bg-rose-400 animate-[bounce_0.6s_infinite_200ms] h-2/3 rounded" />
                  <span className="w-1 bg-rose-400 animate-[bounce_0.6s_infinite_300ms] h-full rounded" />
                </span>
                <span>Speak product name clearly (e.g. "iPad Pro M4 with 256GB storage")...</span>
              </div>
            )}

            {speechError && <p className="text-[11px] text-amber-400 mt-1">{speechError}</p>}
          </div>

          {/* Specifications / Marketing Claims Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Specifications or Marketing Claims (Optional)</span>
              </label>
              <span className="text-[11px] text-zinc-400">Pasted specs will be fact-checked</span>
            </div>
            <textarea
              rows={4}
              value={productSpecs}
              onChange={(e) => onProductSpecsChange(e.target.value)}
              placeholder="Paste advertised specifications, features, or product details to cross-examine against your needs..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-zinc-900/90 resize-none shadow-2xs leading-relaxed"
            />
          </div>

          {/* Cloudinary AI Visual Fact-Checking & Efficiency Card */}
          <div className="bg-gradient-to-r from-blue-950/30 via-zinc-900/70 to-zinc-900/90 border border-blue-900/50 rounded-xl p-3.5 flex items-start gap-3 text-[11px] text-zinc-300">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400 mt-0.5">
              <CloudinaryLogo size={16} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold block">
                  Cloudinary AI Visual Pre-Filtering Active:
                </span>
                {onOpenCloudinaryHub && (
                  <button
                    type="button"
                    onClick={onOpenCloudinaryHub}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold underline"
                  >
                    Open Cloudinary Hub
                  </button>
                )}
              </div>
              <p className="text-zinc-400 leading-relaxed">
                When you drop a picture, Cloudinary AI automatically isolates the product chassis, removes distracting store backgrounds with <code className="text-cyan-300 bg-blue-950/80 px-1 py-0.5 rounded text-[10px]">e_background_removal</code>, and sharpens micro-labels. This lets Smart Buy AI detect the exact model revision, hidden ports, and manufacturer compromises without any marketing fluff.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

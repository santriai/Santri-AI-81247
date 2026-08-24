import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Camera, RefreshCw, Copy, Check, ArrowRightLeft, 
  Sparkles, Image as ImageIcon, CheckCircle, AlertCircle, 
  FlipHorizontal, Zap, ZapOff, ArrowDownCircle
} from 'lucide-react';
import { instantScanAndTranslate, performClientOCR, instantTranslateText } from '../services/instantTranslateService';
import { useToast } from '../contexts/ToastContext';

interface InstantCameraLensModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyText: (text: string) => void;
  initialMode?: 'ar-id' | 'id-ar';
}

export const InstantCameraLensModal: React.FC<InstantCameraLensModalProps> = ({
  isOpen,
  onClose,
  onApplyText,
  initialMode = 'ar-id',
}) => {
  const { showToast } = useToast();
  const [mode, setMode] = useState<'ar-id' | 'id-ar'>(initialMode);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  
  // Results
  const [scanResult, setScanResult] = useState<{
    originalText: string;
    translatedText: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera stream
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Akses kamera video tidak didukung langsung. Silakan gunakan tombol "Jepret Kamera HP" di bawah.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);

      // Check for torch/flashlight capability
      const track = stream.getVideoTracks()[0];
      const capabilities = (track.getCapabilities?.() as any) || {};
      if (capabilities.torch) {
        setHasTorch(true);
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraActive(false);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Izin kamera belum diberikan. Anda dapat menekan "Jepret Kamera HP" di bawah untuk memotret langsung.'
          : 'Kamera video langsung tidak dapat dibuka di lingkungan ini. Gunakan tombol "Jepret Kamera HP" untuk memindai.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await (track as any).applyConstraints({
        advanced: [{ torch: !torchOn }],
      });
      setTorchOn(!torchOn);
    } catch (e) {
      console.warn('Torch toggle failed:', e);
    }
  };

  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  useEffect(() => {
    if (isOpen) {
      setScanResult(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  // Capture image from live video
  const handleCaptureAndTranslate = async () => {
    if (!videoRef.current) return;

    setProcessing(true);
    setProgressStatus('Mengambil tangkapan layar...');

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 800;
      canvas.height = video.videoHeight || 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Gagal menyiapkan kanvas gambar.');

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const result = await instantScanAndTranslate(canvas, mode, (step) => {
        setProgressStatus(step);
      });

      setScanResult(result);
      showToast('Teks berhasil dipindai & diterjemahkan!', 'success');
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Gagal memindai teks dari kamera.', 'error');
    } finally {
      setProcessing(false);
      setProgressStatus('');
    }
  };

  // Handle native file input (Camera / Gallery fallback for WebView)
  const handleNativeFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setProgressStatus('Membaca foto...');

    try {
      const result = await instantScanAndTranslate(file, mode, (step) => {
        setProgressStatus(step);
      });

      setScanResult(result);
      showToast('Teks berhasil dipindai & diterjemahkan!', 'success');
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Gagal memindai foto.', 'error');
    } finally {
      setProcessing(false);
      setProgressStatus('');
      e.target.value = '';
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Teks disalin ke clipboard!', 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApplyToInput = () => {
    if (!scanResult) return;
    onApplyText(scanResult.originalText);
    showToast('Teks dimasukkan ke layar terjemah!', 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1050] bg-black flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white">
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all active:scale-95 cursor-pointer text-white"
          title="Tutup Kamera"
        >
          <X size={22} />
        </button>

        {/* Language Selector */}
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 px-2 rounded-full border border-white/20">
          <button
            onClick={() => setMode(prev => prev === 'ar-id' ? 'id-ar' : 'ar-id')}
            className="flex items-center gap-2 text-xs font-black tracking-wide px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
          >
            <span>{mode === 'ar-id' ? 'Arab ➔ Indonesia' : 'Indonesia ➔ Arab'}</span>
            <ArrowRightLeft size={14} className="text-amber-300" />
          </button>
        </div>

        {/* 0 Wasilah Badge */}
        <div className="flex items-center gap-1">
          {hasTorch && cameraActive && (
            <button
              onClick={toggleTorch}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                torchOn ? 'bg-amber-400 text-slate-950' : 'bg-white/20 text-white'
              }`}
              title="Lampu Kilat / Flash"
            >
              {torchOn ? <Zap size={18} /> : <ZapOff size={18} />}
            </button>
          )}
          <button
            onClick={toggleFacingMode}
            className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all active:scale-95 cursor-pointer text-white"
            title="Balik Kamera"
          >
            <FlipHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Main Viewfinder Section */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Hidden Fallback Inputs */}
        <input
          type="file"
          ref={nativeCameraInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleNativeFileInput}
        />
        <input
          type="file"
          ref={galleryInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleNativeFileInput}
        />

        {/* Live Video */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
        />

        {/* Scanner Viewfinder Box */}
        {cameraActive && !scanResult && (
          <div className="relative z-10 w-[85%] max-w-sm aspect-[4/3] rounded-3xl border-2 border-dashed border-emerald-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] pointer-events-none flex flex-col justify-between p-3 overflow-hidden">
            {/* Viewfinder Corners */}
            <div className="flex justify-between w-full">
              <div className="w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl"></div>
              <div className="w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl"></div>
            </div>

            {/* Laser scanning line */}
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse"></div>

            <div className="flex justify-between w-full">
              <div className="w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl"></div>
              <div className="w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl"></div>
            </div>
          </div>
        )}

        {/* Status / Error Box if live camera is unavailable */}
        {cameraError && !scanResult && (
          <div className="relative z-10 max-w-xs mx-auto p-6 bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <Camera size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Kamera Instan</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {cameraError}
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 active:scale-95 transition-all cursor-pointer"
              >
                <Camera size={16} />
                <span>Jepret Kamera HP</span>
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ImageIcon size={16} />
                <span>Pilih dari Galeri</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {processing && (
          <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg animate-pulse">
              <RefreshCw size={28} className="animate-spin" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-white">
                Memproses Kamera Tanpa AI...
              </h4>
              <p className="text-xs text-emerald-300 font-medium">
                {progressStatus || 'Mendeteksi dan menerjemahkan teks...'}
              </p>
            </div>
          </div>
        )}

        {/* Result Bottom Sheet Card */}
        {scanResult && !processing && (
          <div className="absolute inset-x-0 bottom-0 z-40 max-h-[85%] bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 p-5 rounded-t-3xl shadow-2xl flex flex-col gap-4 overflow-y-auto animate-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-400" />
                <h3 className="text-sm font-black text-white">Hasil Terjemahan Instan</h3>
              </div>
              <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                0 Wasilah (Non-AI)
              </span>
            </div>

            {/* Original Text Detected */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Teks Terbaca ({mode === 'ar-id' ? 'Arab' : 'Indonesia'}):
                </span>
                <button
                  onClick={() => handleCopy(scanResult.originalText, 'orig')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'orig' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedKey === 'orig' ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 max-h-28 overflow-y-auto">
                <p 
                  className={`text-sm text-slate-100 leading-relaxed ${mode === 'ar-id' ? 'font-serif text-lg text-right' : 'text-left'}`}
                  dir={mode === 'ar-id' ? 'rtl' : 'ltr'}
                >
                  {scanResult.originalText}
                </p>
              </div>
            </div>

            {/* Translated Output */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Terjemahan Langsung ({mode === 'ar-id' ? 'Indonesia' : 'Arab'}):
                </span>
                <button
                  onClick={() => handleCopy(scanResult.translatedText, 'trans')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'trans' ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedKey === 'trans' ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
              <div className="p-3 bg-emerald-950/40 rounded-2xl border border-emerald-800/60 max-h-32 overflow-y-auto">
                <p 
                  className={`text-sm text-emerald-100 font-medium leading-relaxed ${mode === 'id-ar' ? 'font-serif text-lg text-right' : 'text-left'}`}
                  dir={mode === 'id-ar' ? 'rtl' : 'ltr'}
                >
                  {scanResult.translatedText}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setScanResult(null)}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                Pindai Ulang
              </button>
              <button
                type="button"
                onClick={handleApplyToInput}
                className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowDownCircle size={16} />
                <span>Gunakan di Input</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar (Shutter & Pickers) */}
      {!scanResult && (
        <div className="relative z-20 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-around">
          {/* Gallery Button */}
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer"
            title="Pilih dari Galeri"
          >
            <ImageIcon size={20} />
            <span className="text-[10px] font-semibold">Galeri</span>
          </button>

          {/* Big Shutter Button */}
          <button
            type="button"
            disabled={processing}
            onClick={cameraActive ? handleCaptureAndTranslate : () => nativeCameraInputRef.current?.click()}
            className="w-18 h-18 rounded-full bg-emerald-500 hover:bg-emerald-400 p-1 shadow-lg shadow-emerald-500/40 active:scale-90 transition-all cursor-pointer flex items-center justify-center border-4 border-white/80"
            title="Pindai dan Terjemahkan Teks"
          >
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-emerald-600">
              <Camera size={26} strokeWidth={2.5} />
            </div>
          </button>

          {/* Native Camera (Android WebView Direct) */}
          <button
            type="button"
            onClick={() => nativeCameraInputRef.current?.click()}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer"
            title="Kamera HP Native (WebView)"
          >
            <Camera size={20} />
            <span className="text-[10px] font-semibold">Kamera HP</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default InstantCameraLensModal;

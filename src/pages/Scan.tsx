import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, X, Loader2, Image as ImageIcon, Leaf, Eye, RefreshCw, AlertTriangle, Wheat, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';
import FieldMapSection from '../components/FieldMapSection';
import { getSharpnessScore, checkIsLeaf } from '../utils/imageValidation';

// ─────────────────────────────────────────────────────────────
// 3. VALIDATION MODAL
// ─────────────────────────────────────────────────────────────
type ModalType = 'not-leaf' | 'blurry';

function ValidationModal({
  type,
  score,
  onRetry,
}: {
  type: ModalType;
  score?: number;
  onRetry: () => void;
}) {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.4)' }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full text-center"
      >
        {/* Icon */}
        <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner ${type === 'not-leaf' ? 'bg-amber-50' : 'bg-blue-50'
          }`}>
          {type === 'not-leaf'
            ? <Leaf className="w-10 h-10 text-amber-500" />
            : <Eye className="w-10 h-10 text-blue-500" />
          }
        </div>

        <h2 className="text-2xl font-black text-text-primary mb-3">
          {type === 'not-leaf' ? t('noLeafTitle') : t('blurryTitle')}
        </h2>

        <p className="text-text-secondary text-base leading-relaxed mb-2">
          {type === 'not-leaf'
            ? t('noLeafSub')
            : t('blurrySub')}
        </p>

        {type === 'blurry' && score !== undefined && (
          <div className="my-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">{t('sharpnessScore')}</span>
              <span className={`text-lg font-black ${score >= 60 ? 'text-deep-green' : 'text-red-500'}`}>{score}/100</span>
            </div>
            <div className="w-full bg-bg-nature h-3 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${score >= 60 ? 'bg-accent-green' : 'bg-red-400'}`}
              />
            </div>
            <p className="text-xs text-text-secondary mt-2">{t('minRequired')}: <strong>60/100</strong></p>
          </div>
        )}

        <p className="text-text-secondary text-sm leading-relaxed mb-8">
          {type === 'not-leaf'
            ? t('noLeafTips')
            : t('blurryTips')}
        </p>

        <button
          onClick={onRetry}
          className="w-full bg-deep-green text-white py-4 rounded-full font-bold text-lg hover:bg-muted-green transition-all shadow-xl active:scale-95"
        >
          {type === 'not-leaf' ? (
            <span className="flex items-center justify-center gap-2"><Camera className="w-5 h-5" />{t('uploadAnother')}</span>
          ) : (
            <span className="flex items-center justify-center gap-2"><RefreshCw className="w-5 h-5" />{t('tryAgain')}</span>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
interface ScanProps {
  onAnalyze: (image: string) => Promise<void>;
  analyzeError?: string | null;
}

export default function Scan({ onAnalyze, analyzeError }: ScanProps) {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isValidating, setIsValidating] = useState(false);
  const [modal, setModal] = useState<{ type: ModalType; score?: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ── VALIDATION PIPELINE ──────────────────────────────────
  const validateAndSetImage = async (dataUrl: string) => {
    setIsValidating(true);
    setModal(null);

    // Step 1: Is it a leaf?
    const isLeaf = await checkIsLeaf(dataUrl);
    if (!isLeaf) {
      setIsValidating(false);
      setModal({ type: 'not-leaf' });
      return;
    }

    // Step 2: Sharpness score ≥ 60?
    const score = await getSharpnessScore(dataUrl);
    if (score < 60) {
      setIsValidating(false);
      setModal({ type: 'blurry', score });
      return;
    }

    // All good → show preview
    setIsValidating(false);
    setSelectedImage(dataUrl);
  };

  const handleRetry = () => {
    setModal(null);
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── FILE / CAMERA ────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => validateAndSetImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch {
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setIsCameraOpen(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    stopCamera();
    await validateAndSetImage(dataUrl);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    await onAnalyze(selectedImage);
    setIsAnalyzing(false);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setModal(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── HEALTH CHECK ─────────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/health', { signal: AbortSignal.timeout(4000) });
        const d = await res.json();
        setBackendStatus(d.model_loaded ? 'online' : 'offline');
      } catch { setBackendStatus('offline'); }
    };
    check();
    return () => stopCamera();
  }, []);

  // ── RENDER ───────────────────────────────────────────────
  return (
    <div className="pt-28 pb-12 max-w-4xl mx-auto px-8 min-h-[85vh] flex flex-col">

      {/* Validation Modal */}
      <AnimatePresence>
        {modal && (
          <ValidationModal type={modal.type} score={modal.score} onRetry={handleRetry} />
        )}
      </AnimatePresence>



      <div className="text-center mb-12">
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-text-primary mb-4">{t('scanTitle')}</motion.h1>
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-text-secondary text-lg">{t('scanSub')}</motion.p>
      </div>

      <div className="flex-1 flex flex-col gap-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`relative flex-1 border-2 border-dashed rounded-[3rem] transition-all duration-500 flex flex-col items-center justify-center p-10 shadow-soft overflow-hidden ${selectedImage || isCameraOpen ? 'border-deep-green bg-surface' : 'border-divider bg-surface-alt hover:border-muted-green hover:bg-surface'
            }`}
        >
          <AnimatePresence mode="wait">

            {/* ── Validating spinner ── */}
            {isValidating ? (
              <motion.div key="validating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-5 text-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-bg-nature rounded-[2rem] flex items-center justify-center shadow-inner">
                    <Loader2 className="w-10 h-10 text-deep-green animate-spin" />
                  </div>
                </div>
                <div>
                  <p className="text-xl font-bold text-text-primary">{t('checkingQuality')}</p>
                  <p className="text-text-secondary mt-1">{t('detectingLeaf')}</p>
                </div>
              </motion.div>

            ) : isCameraOpen ? (
              /* ── Camera view ── */
              <motion.div key="camera-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black flex flex-col">
                <video
                  ref={(el) => { if (el) { videoRef.current = el; if (streamRef.current) el.srcObject = streamRef.current; } }}
                  autoPlay playsInline muted className="flex-1 object-cover"
                />
                <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-8 px-6">
                  <button onClick={stopCamera} className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all">
                    <X className="w-8 h-8" />
                  </button>
                  <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full border-4 border-accent-green shadow-2xl flex items-center justify-center active:scale-90 transition-transform">
                    <div className="w-16 h-16 bg-white border-2 border-deep-green rounded-full" />
                  </button>
                  <div className="w-16" />
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </motion.div>

            ) : !selectedImage ? (
              /* ── Upload prompt ── */
              <motion.div key="upload-prompt" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
                <div className="w-24 h-24 bg-bg-nature rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Upload className="w-10 h-10 text-deep-green" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-3">{t('dropImage')}</h3>
                <p className="text-text-secondary mb-10 text-lg">{t('supportsFormat')}</p>
                <div className="flex flex-col sm:flex-row gap-5 justify-center">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="bg-deep-green text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-muted-green transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95">
                    <ImageIcon className="w-6 h-6" />{t('chooseFile')}
                  </button>
                  <button onClick={startCamera}
                    className="neumorphic-btn font-bold text-deep-green flex items-center justify-center gap-3">
                    <Camera className="w-6 h-6" />{t('useCamera')}
                  </button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </motion.div>

            ) : (
              /* ── Image preview ── */
              <motion.div key="preview" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="relative w-full h-full flex flex-col items-center justify-center gap-6">
                <div className="relative p-3 bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl">
                  <img src={selectedImage} alt="Preview" className="max-h-[60vh] w-full rounded-[2rem] object-contain bg-surface-alt" />
                  <button onClick={clearImage} className="absolute -top-4 -right-4 bg-white p-3 rounded-full text-red-500 shadow-xl hover:bg-red-50 transition-all active:scale-90">
                    <X className="w-6 h-6" />
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Analyze button */}
        {selectedImage && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
            <button onClick={handleAnalyze} disabled={isAnalyzing}
              className="w-full bg-deep-green text-white py-6 rounded-full font-bold text-2xl shadow-2xl hover:bg-muted-green transition-all flex items-center justify-center gap-4 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]">
              {isAnalyzing ? (<><Loader2 className="w-8 h-8 animate-spin" />{t('analyzing')}</>) : t('analyzeBtn')}
            </button>

            {isAnalyzing && (
              <div className="w-full bg-bg-nature h-3 rounded-full overflow-hidden shadow-inner">
                <motion.div className="hero-gradient h-full" initial={{ width: '0%' }} animate={{ width: '95%' }} transition={{ duration: 8, ease: 'easeInOut' }} />
              </div>
            )}

            {analyzeError && !isAnalyzing && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4 p-5 bg-red-50 border border-red-200 rounded-[1.5rem] text-red-700">
                <AlertTriangle className="w-7 h-7 shrink-0" />
                <div>
                  <p className="font-bold text-lg mb-1">{t('analysisFailed')}</p>
                  <p className="text-sm leading-relaxed">{analyzeError}</p>
                  <p className="text-xs mt-2 text-red-500">{t('ensureBackend')}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Tips */}
      <AnimatePresence>
        {!selectedImage && !isAnalyzing && !isCameraOpen && !isValidating && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-16 p-10 bg-surface-alt rounded-[2.5rem] border border-divider shadow-soft">
            <h4 className="text-xl font-bold text-deep-green mb-4 flex items-center gap-3">
              <Lightbulb className="w-6 h-6" />{t('tipsTitle')}
            </h4>
            <ul className="text-text-secondary space-y-3 text-lg">
              <li className="flex gap-3"><span className="text-accent-green font-bold">•</span>{t('tip1')}</li>
              <li className="flex gap-3"><span className="text-accent-green font-bold">•</span>{t('tip2')}</li>
              <li className="flex gap-3"><span className="text-accent-green font-bold">•</span>{t('tip3')}</li>
              <li className="flex gap-3"><span className="text-accent-green font-bold">•</span>{t('tip4')}</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Large Farm Survey ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-20"
      >
        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-divider" />
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-alt border border-divider rounded-full text-sm font-bold text-text-secondary">
            <Wheat className="w-5 h-5" />
            Large Farm? Survey multiple fields at once
          </div>
          <div className="flex-1 h-px bg-divider" />
        </div>

        <FieldMapSection />
      </motion.div>
    </div>
  );
}

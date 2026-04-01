import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, X, Loader2, Image as ImageIcon, MapPin, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';

interface ScanProps {
  onAnalyze: (image: string) => void;
}

export default function Scan({ onAnalyze }: ScanProps) {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        getLocation();
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setSelectedImage(dataUrl);
        stopCamera();
        getLocation();
      }
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleAnalyze = () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    // Simulate analysis delay
    setTimeout(() => {
      onAnalyze(selectedImage);
      setIsAnalyzing(false);
    }, 2500);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setLocation(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="pt-28 pb-12 max-w-4xl mx-auto px-8 min-h-[85vh] flex flex-col">
      <div className="text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-text-primary mb-4"
        >
          {t('scanTitle')}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-text-secondary text-lg"
        >
          {t('scanSub')}
        </motion.p>
      </div>

      <div className="flex-1 flex flex-col gap-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`relative flex-1 border-2 border-dashed rounded-[3rem] transition-all duration-500 flex flex-col items-center justify-center p-10 shadow-soft overflow-hidden ${
            selectedImage || isCameraOpen ? 'border-deep-green bg-surface' : 'border-divider bg-surface-alt hover:border-muted-green hover:bg-surface'
          }`}
        >
          <AnimatePresence mode="wait">
            {isCameraOpen ? (
              <motion.div
                key="camera-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black flex flex-col"
              >
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="flex-1 object-cover"
                />
                <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-8 px-6">
                  <button 
                    onClick={stopCamera}
                    className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all"
                  >
                    <X className="w-8 h-8" />
                  </button>
                  <button 
                    onClick={capturePhoto}
                    className="w-20 h-20 bg-white rounded-full border-4 border-accent-green shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <div className="w-16 h-16 bg-white border-2 border-deep-green rounded-full" />
                  </button>
                  <div className="w-16" /> {/* Spacer for balance */}
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </motion.div>
            ) : !selectedImage ? (
              <motion.div
                key="upload-prompt"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-bg-nature rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Upload className="w-10 h-10 text-deep-green" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary mb-3">{t('dropImage')}</h3>
                <p className="text-text-secondary mb-10 text-lg">Supports JPG, PNG up to 10MB</p>
                
                <div className="flex flex-col sm:flex-row gap-5 justify-center">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-deep-green text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-muted-green transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                  >
                    <ImageIcon className="w-6 h-6" />
                    {t('chooseFile')}
                  </button>
                  <button 
                    onClick={startCamera}
                    className="neumorphic-btn font-bold text-deep-green flex items-center justify-center gap-3"
                  >
                    <Camera className="w-6 h-6" />
                    {t('useCamera')}
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full h-full flex flex-col items-center justify-center gap-6"
              >
                <div className="relative p-3 bg-white rounded-[2.5rem] shadow-2xl">
                  <img 
                    src={selectedImage} 
                    alt="Preview" 
                    className="max-h-[400px] w-auto rounded-[2rem] object-contain"
                  />
                  <button 
                    onClick={clearImage}
                    className="absolute -top-4 -right-4 bg-white p-3 rounded-full text-red-500 shadow-xl hover:bg-red-50 transition-all active:scale-90"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Location Badge */}
                <div className="flex items-center gap-2 px-4 py-2 bg-accent-green/10 rounded-full border border-accent-green/20">
                  {isLocating ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-accent-green animate-spin" />
                      <span className="text-sm font-bold text-deep-green">Capturing location...</span>
                    </>
                  ) : location ? (
                    <>
                      <MapPin className="w-4 h-4 text-accent-green" />
                      <span className="text-sm font-bold text-deep-green">
                        {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                      </span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 text-text-secondary" />
                      <span className="text-sm font-bold text-text-secondary">Location not available</span>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-deep-green text-white py-6 rounded-full font-bold text-2xl shadow-2xl hover:bg-muted-green transition-all flex items-center justify-center gap-4 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin" />
                  {t('analyzing')}
                </>
              ) : (
                t('analyzeBtn')
              )}
            </button>
            
            {isAnalyzing && (
              <div className="w-full bg-bg-nature h-3 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  className="hero-gradient h-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "linear" }}
                />
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Tips Section */}
      <AnimatePresence>
        {!selectedImage && !isAnalyzing && !isCameraOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 p-10 bg-surface-alt rounded-[2.5rem] border border-divider shadow-soft"
          >
            <h4 className="text-xl font-bold text-deep-green mb-4 flex items-center gap-3">
              <span className="text-2xl">💡</span> {t('tipsTitle')}
            </h4>
            <ul className="text-text-secondary space-y-3 text-lg">
              <li className="flex gap-3">
                <span className="text-accent-green font-bold">•</span>
                {t('tip1')}
              </li>
              <li className="flex gap-3">
                <span className="text-accent-green font-bold">•</span>
                {t('tip2')}
              </li>
              <li className="flex gap-3">
                <span className="text-accent-green font-bold">•</span>
                {t('tip3')}
              </li>
              <li className="flex gap-3">
                <span className="text-accent-green font-bold">•</span>
                {t('tip4')}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

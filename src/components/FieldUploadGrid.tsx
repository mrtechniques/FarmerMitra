import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, MapPin, AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { FieldPhoto } from '../types';
import { validateImage } from '../utils/imageValidation';

// Dynamic import of exifr to keep initial bundle small
async function readGPS(file: File): Promise<{ lat: number; lng: number } | null> {
  try {
    // @ts-ignore
    const exifr = await import('exifr');
    const gps = await exifr.gps(file);
    if (gps && typeof gps.latitude === 'number' && typeof gps.longitude === 'number') {
      return { lat: gps.latitude, lng: gps.longitude };
    }
  } catch { /* no EXIF */ }
  return null;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const MAX_PHOTOS = 15;

interface FieldUploadGridProps {
  photos: FieldPhoto[];
  onPhotosChange: React.Dispatch<React.SetStateAction<FieldPhoto[]>>;
  farmName: string;
  onFarmNameChange: (name: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export default function FieldUploadGrid({
  photos,
  onPhotosChange,
  farmName,
  onFarmNameChange,
  onAnalyze,
  isAnalyzing,
}: FieldUploadGridProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const addFiles = useCallback(async (files: File[]) => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) { showToast(`Maximum ${MAX_PHOTOS} photos per batch reached.`); return; }

    const toAdd = files.slice(0, remaining);
    if (files.length > remaining) showToast(`Only ${remaining} more photo${remaining !== 1 ? 's' : ''} can be added (max ${MAX_PHOTOS}).`);

    // Create 'validating' placeholders immediately so UI responds fast
    const placeholders: FieldPhoto[] = toAdd.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      dataUrl: '',
      lat: null,
      lng: null,
      label: file.name.replace(/\.[^.]+$/, '').slice(0, 30),
      status: 'validating',
    }));

    onPhotosChange(prev => [...prev, ...placeholders]);

    // Process each file: read dataUrl + GPS, then validate leaf + sharpness
    for (const ph of placeholders) {
      const file = ph.file;
      try {
        const [dataUrl, gps] = await Promise.all([fileToDataUrl(file), readGPS(file)]);

        // Update with dataUrl so thumbnail shows while validation runs
        onPhotosChange(prev =>
          prev.map(p => p.id === ph.id ? { ...p, dataUrl, lat: gps?.lat ?? null, lng: gps?.lng ?? null } : p)
        );

        // Run leaf + sharpness validation
        const validation = await validateImage(dataUrl);

        if (!validation.pass) {
          const errorMsg = validation.reason === 'not-leaf'
            ? 'Not a leaf — upload a plant leaf photo'
            : `Too blurry (${validation.sharpnessScore}/100) — retake the photo`;

          onPhotosChange(prev =>
            prev.map(p => p.id === ph.id
              ? { ...p, status: 'error', validationError: errorMsg }
              : p
            )
          );
        } else {
          onPhotosChange(prev =>
            prev.map(p => p.id === ph.id ? { ...p, status: 'ready' } : p)
          );
        }
      } catch {
        onPhotosChange(prev =>
          prev.map(p => p.id === ph.id ? { ...p, status: 'error', validationError: 'Could not read file' } : p)
        );
      }
    }
  }, [photos, onPhotosChange]);


  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const images = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!images.length) { showToast('Please select image files only.'); return; }
    addFiles(images);
  }, [addFiles]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removePhoto = (id: string) => {
    onPhotosChange(photos.filter(p => p.id !== id));
  };

  const updateLabel = (id: string, label: string) => {
    onPhotosChange(photos.map(p => p.id === id ? { ...p, label } : p));
  };

  const readyCount = photos.filter(p => p.status === 'ready').length;

  return (
    <div className="space-y-6">
      {/* Farm Name */}
      <div>
        <label className="block text-sm font-semibold text-text-secondary mb-2 uppercase tracking-wider">Farm / Survey Name (optional)</label>
        <input
          type="text"
          value={farmName}
          onChange={e => onFarmNameChange(e.target.value)}
          placeholder={`Farm Survey — ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
          className="w-full px-4 py-3 bg-surface border border-divider rounded-2xl text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-deep-green/30 font-medium"
        />
      </div>

      {/* Drop zone */}
      {photos.length < MAX_PHOTOS && (
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 ${
            dragOver
              ? 'border-deep-green bg-accent-green/10 scale-[1.01]'
              : 'border-divider bg-surface-alt hover:border-muted-green hover:bg-surface'
          }`}
        >
          <div className="w-14 h-14 bg-bg-nature rounded-2xl flex items-center justify-center">
            <Upload className="w-7 h-7 text-deep-green" />
          </div>
          <div className="text-center">
            <p className="font-bold text-text-primary">Drop photos here or click to choose</p>
            <p className="text-sm text-text-secondary mt-1">
              {photos.length} / {MAX_PHOTOS} added · JPG, PNG, HEIC
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Tip about GPS */}
      {photos.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3 items-start">
          <span className="text-xl flex-shrink-0">💡</span>
          <div>
            <p className="text-sm font-semibold text-blue-700">Enable GPS on your camera</p>
            <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">
              Photos with GPS location data will be placed on the map. In your phone's camera settings, enable "Location" or "Geotagging" before taking field photos.
            </p>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-text-secondary uppercase tracking-wider">Photos</p>
            <span className={`text-sm font-black px-3 py-1 rounded-full ${
              photos.length >= MAX_PHOTOS ? 'bg-deep-green text-white' : 'bg-bg-nature text-deep-green'
            }`}>
              {photos.length} / {MAX_PHOTOS}
            </span>
          </div>

          {/* ⚠️ No-GPS warning — shown as soon as any non-error photo has no location */}
          {(() => {
            const noGpsCount = photos.filter(
              p => p.status !== 'error' && p.status !== 'validating' && p.lat === null
            ).length;
            const checkingCount = photos.filter(p => p.status === 'validating').length;
            const showWarning = noGpsCount > 0 || checkingCount > 0;
            return showWarning ? (
              <AnimatePresence>
                <motion.div
                  key="no-gps-warning"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex gap-3 items-start bg-amber-50 border border-amber-300 rounded-2xl p-4"
                >
                  <span className="text-xl flex-shrink-0">⚠️</span>
                  <div>
                    {noGpsCount > 0 ? (
                      <>
                        <p className="text-sm font-bold text-amber-800">
                          {noGpsCount} photo{noGpsCount !== 1 ? 's' : ''} without location data
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                          {noGpsCount === photos.filter(p => p.status !== 'error').length
                            ? 'None of your photos have GPS — the map view won\'t be generated. Photos will still be analysed for disease and shown in the "Unlocated" tab.'
                            : 'These photos will be analysed for disease but won\'t appear on the field map — they\'ll go into the "Unlocated" tab instead.'
                          }
                          {' '}Enable <strong>Location / Geotagging</strong> in your camera settings before taking field photos.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-amber-800">Checking location data…</p>
                        <p className="text-xs text-amber-700 mt-0.5">Reading GPS from photo metadata.</p>
                      </>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : null;
          })()}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photos.map(photo => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative bg-surface rounded-2xl overflow-hidden border border-divider shadow-soft"
              >
                {/* Thumbnail */}
                <div className="relative h-28 bg-bg-nature">
                  {photo.dataUrl ? (
                    <img src={photo.dataUrl} alt={photo.label} className={`w-full h-full object-cover ${photo.status === 'error' ? 'opacity-60' : ''}`} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-text-secondary animate-spin" />
                    </div>
                  )}
                  {/* Status chip */}
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                    photo.status === 'ready'  ? 'bg-green-500 text-white' :
                    photo.status === 'error'  ? 'bg-red-500 text-white' :
                    photo.status === 'done'   ? 'bg-deep-green text-white' :
                    'bg-black/50 text-white'
                  }`}>
                    {photo.status === 'ready'      && <CheckCircle2 className="w-3 h-3" />}
                    {photo.status === 'error'      && <AlertCircle className="w-3 h-3" />}
                    {photo.status === 'validating' && <Loader2 className="w-3 h-3 animate-spin" />}
                    {photo.status === 'ready'      ? 'Ready' :
                     photo.status === 'error'      ? 'Invalid' :
                     photo.status === 'validating' ? 'Checking…' :
                     photo.status === 'pending'    ? 'Loading…' :
                     photo.status === 'analyzing'  ? 'Analyzing…' :
                     photo.status === 'done'       ? 'Done' : photo.status}
                  </div>
                  {/* Remove */}
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-2.5 space-y-1.5">
                  {/* Label input */}
                  <input
                    type="text"
                    value={photo.label}
                    onChange={e => updateLabel(photo.id, e.target.value)}
                    placeholder="Field name…"
                    className="w-full text-xs font-semibold bg-bg-nature rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-deep-green/40 text-text-primary"
                  />
                  {/* Validation error reason */}
                  {photo.status === 'error' && photo.validationError && (
                    <p className="text-xs text-red-500 font-medium leading-tight">{photo.validationError}</p>
                  )}
                  {/* GPS */}
                  {photo.status !== 'error' && (
                    <div className={`flex items-center gap-1 text-xs ${photo.lat !== null ? 'text-deep-green' : 'text-amber-500'}`}>
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {photo.lat !== null
                        ? `${photo.lat.toFixed(4)}, ${photo.lng!.toFixed(4)}`
                        : 'No GPS'}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-3 rounded-2xl text-sm font-medium shadow-xl z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analyze button */}
      {readyCount > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="w-full bg-deep-green text-white py-5 rounded-full font-bold text-xl shadow-2xl hover:bg-muted-green transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isAnalyzing ? '⏳ Analyzing…' : `🔬 Analyze ${readyCount} Field${readyCount !== 1 ? 's' : ''} →`}
        </motion.button>
      )}
    </div>
  );
}

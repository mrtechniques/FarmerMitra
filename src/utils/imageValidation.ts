/**
 * Shared image validation utilities used by both single-scan (Scan.tsx)
 * and batch-scan (FieldUploadGrid.tsx).
 */

// ─── Sharpness Score (0–100) ──────────────────────────────────────────────────
// Laplacian variance normalised: variance ~500 → 100 pts
// Threshold to pass: 60 pts (variance ≈ 300)
export function getSharpnessScore(dataUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 512 / Math.max(img.width, img.height));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let sum = 0, sumSq = 0, n = 0;
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const i = (y * width + x) * 4;
          const g = (px: number) => data[px] * 0.299 + data[px + 1] * 0.587 + data[px + 2] * 0.114;
          const lap = 4 * g(i)
            - g(((y - 1) * width + x) * 4)
            - g(((y + 1) * width + x) * 4)
            - g((y * width + x - 1) * 4)
            - g((y * width + x + 1) * 4);
          sum += lap; sumSq += lap * lap; n++;
        }
      }
      const variance = n > 0 ? (sumSq - (sum * sum) / n) / n : 0;
      resolve(Math.min(100, Math.round(variance / 5)));
    };
    img.onerror = () => resolve(100);
    img.src = dataUrl;
  });
}

// ─── Leaf Detection ───────────────────────────────────────────────────────────
// Gemini vision first; falls back to green-channel heuristic.
export async function checkIsLeaf(dataUrl: string): Promise<boolean> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY
    ?? (window as any).__GEMINI_API_KEY__
    ?? undefined;
  const model = 'gemini-2.0-flash';

  if (apiKey) {
    try {
      const base64 = dataUrl.split(',')[1];
      const mime = dataUrl.split(';')[0].split(':')[1] || 'image/jpeg';
      const prompt =
        'Look at this image carefully. Does it show a plant leaf (healthy or diseased)? Reply with ONLY the single word YES or NO.';
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: base64 } }] }],
            generationConfig: { maxOutputTokens: 10, temperature: 0 },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const raw = (data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '').trim().toUpperCase();
        return /YES|LEAF|PLANT|TRUE/.test(raw);
      }
    } catch { /* fall through */ }
  }

  // Colour heuristic fallback
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128; canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, 128, 128);
      const { data } = ctx.getImageData(0, 0, 128, 128);
      let leafPixels = 0, total = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        if (a < 50) continue;
        total++;
        const isGreen  = g > r * 1.05 && g > b * 1.05 && g > 30;
        const isYellow = r > 100 && g > 100 && b < 100 && Math.abs(r - g) < 40;
        const isBrown  = r > 40 && g > 30 && b < 50 && r > b * 1.2;
        if (isGreen || isYellow || isBrown) leafPixels++;
      }
      resolve(total > 0 ? leafPixels / total >= 0.12 : true);
    };
    img.onerror = () => resolve(true);
    img.src = dataUrl;
  });
}

// ─── Full validation pipeline ─────────────────────────────────────────────────
export interface ValidationResult {
  pass: boolean;
  reason?: 'not-leaf' | 'blurry';
  sharpnessScore?: number;
}

export async function validateImage(dataUrl: string): Promise<ValidationResult> {
  const isLeaf = await checkIsLeaf(dataUrl);
  if (!isLeaf) return { pass: false, reason: 'not-leaf' };

  const score = await getSharpnessScore(dataUrl);
  if (score < 60) return { pass: false, reason: 'blurry', sharpnessScore: score };

  return { pass: true, sharpnessScore: score };
}

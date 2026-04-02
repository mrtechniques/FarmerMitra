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
      // 1. Resize image aggressively to 512px before sending to Gemini
      const resizedBase64 = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = Math.min(1, 512 / Math.max(img.width, img.height));
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Heuristic: Reject solid colors (variance check)
          const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          let sum = 0, sumSq = 0;
          for (let i = 0; i < pixelData.length; i += 4) {
            const brightness = (pixelData[i] + pixelData[i+1] + pixelData[i+2]) / 3;
            sum += brightness;
            sumSq += brightness * brightness;
          }
          const n = pixelData.length / 4;
          const variance = (sumSq / n) - (Math.pow(sum / n, 2));
          if (variance < 10) {
            console.warn("Image rejected: Too uniform (solid color detected).");
            return resolve("REJECT_UNIFORM");
          }

          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = dataUrl;
      });

      const resizedResult = await resizedBase64;
      if (resizedResult === "REJECT_UNIFORM") return false;

      const base64 = (resizedResult as string).split(',')[1];
      const mime = 'image/jpeg';
      
      const prompt = "Strictly analyze this image. Identify if it is an up-close (macro) photo of a real living plant leaf or crop for diagnosis. Reject if it is just a green texture, far-away scenery, a human, animal, or object.";
        
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: mime, data: base64 } }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  isPlant: {
                    type: "BOOLEAN",
                    description: "True ONLY if a real plant leaf is the primary, clear subject. MUST return False if it is: 1) Plain green background/texture, 2) Distant landscape, 3) Human hands/limbs, or 4) Not a leaf. Look for veins, serrated edges, or biological plant structures."
                  }
                },
                required: ["isPlant"]
              }
            },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const output = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (output) {
          const parsed = JSON.parse(output);
          return !!parsed.isPlant;
        }
      }
    } catch (e) {
      console.warn("Frontend validation failed:", e);
    }
  }

  // Fallback: If API fails, we reject it (Fail-Closed).
  return false;
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

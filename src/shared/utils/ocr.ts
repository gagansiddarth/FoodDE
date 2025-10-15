import Tesseract from "tesseract.js";

function preprocessImageForOCR(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2; // upscale for sharper text
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      // Draw original scaled up
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Convert to grayscale
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i] = data[i + 1] = data[i + 2] = gray;
      }
      ctx.putImageData(imageData, 0, 0);
      // Simple threshold (binarization)
      const imageData2 = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d2 = imageData2.data;
      let sum = 0;
      for (let i = 0; i < d2.length; i += 4) sum += d2[i];
      const avg = sum / (d2.length / 4);
      const threshold = avg * 0.9; // slightly darker threshold
      for (let i = 0; i < d2.length; i += 4) {
        const v = d2[i] > threshold ? 255 : 0;
        d2[i] = d2[i + 1] = d2[i + 2] = v;
      }
      ctx.putImageData(imageData2, 0, 0);
      resolve(canvas);
    };
    img.onerror = reject;
    img.crossOrigin = 'anonymous';
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result as string; };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function runOCR(file: File): Promise<string> {
  // Preprocess to improve OCR on unclear images
  const preCanvas = await preprocessImageForOCR(file);
  const dataUrl = preCanvas.toDataURL('image/png');
  const { data } = await Tesseract.recognize(dataUrl, 'eng');
  const text = data.text || '';
  return text.replace(/\s+/g, ' ').trim();
}

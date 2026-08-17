const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const OUTPUT_SIZE = 512;
const OUTPUT_TYPE = 'image/webp';
const OUTPUT_QUALITY = 0.85;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('The selected file is not a valid image.'));
    };

    image.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Unable to process the selected photo.'));
        }
      },
      OUTPUT_TYPE,
      quality,
    );
  });
}

export async function prepareProfilePhoto(file: File): Promise<File> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Profile photo must be JPG, PNG, or WebP.');
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('Profile photo must be 2 MB or smaller.');
  }

  const image = await loadImage(file);

  if (!image.naturalWidth || !image.naturalHeight) {
    throw new Error('The selected photo has invalid dimensions.');
  }

  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = Math.floor((image.naturalWidth - sourceSize) / 2);
  const sourceY = Math.floor((image.naturalHeight - sourceSize) / 2);

  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Your browser cannot process profile photos.');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );

  let quality = OUTPUT_QUALITY;
  let blob = await canvasToBlob(canvas, quality);

  while (blob.size > MAX_UPLOAD_BYTES && quality > 0.5) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, quality);
  }

  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error('The processed profile photo is still larger than 2 MB.');
  }

  return new File([blob], 'profile-photo.webp', {
    type: OUTPUT_TYPE,
    lastModified: Date.now(),
  });
}

export function profilePhotoPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

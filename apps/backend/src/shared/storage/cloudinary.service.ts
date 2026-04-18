// ──────────────────────────────────────────────
// Cloudinary Upload Service
// ──────────────────────────────────────────────

import { v2 as cloudinary } from 'cloudinary';

// Configure from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary.
 * Returns the secure URL of the uploaded image.
 */
export async function uploadImage(
  fileBuffer: Buffer,
  folder: string = 'aether'
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [{ width: 1200, crop: 'limit' }, { quality: 'auto' }],
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Cloudinary upload returned no result'));
          }
        }
      )
      .end(fileBuffer);
  });
}

/**
 * Delete an image from Cloudinary by public ID.
 */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

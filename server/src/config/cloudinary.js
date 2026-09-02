import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(filePath) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'communityshare-listings',
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
}

export async function deleteFromCloudinary(imageUrl) {
  try {
    if (!imageUrl) return;
    
    // Extract public ID from the URL
    const regex = /\/communityshare-listings\/([^/]+)$/;
    const match = imageUrl.match(regex);
    
    if (match) {
      const publicId = `communityshare-listings/${match[1].split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error(`Cloudinary delete failed: ${error.message}`);
  }
}

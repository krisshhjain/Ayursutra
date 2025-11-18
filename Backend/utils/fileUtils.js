import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Delete a file from the filesystem
 * @param {string} filePath - Path to the file to delete
 * @returns {Promise<boolean>} - True if deleted successfully, false otherwise
 */
export const deleteFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Delete old profile image when uploading a new one
 * @param {string} oldImageUrl - URL or filename of the old image
 * @returns {Promise<boolean>}
 */
export const deleteOldProfileImage = async (oldImageUrl) => {
  if (!oldImageUrl) return true;

  try {
    // Extract filename from URL if it's a full URL
    const filename = oldImageUrl.includes('/') 
      ? oldImageUrl.split('/').pop() 
      : oldImageUrl;

    const filePath = path.join(__dirname, '..', 'uploads', 'profiles', filename);
    return await deleteFile(filePath);
  } catch (error) {
    console.error('Error deleting old profile image:', error);
    return false;
  }
};

/**
 * Get the full URL for a profile image
 * @param {string} filename - Filename of the image
 * @param {object} req - Express request object
 * @returns {string} - Full URL to the image
 */
export const getProfileImageUrl = (filename, req) => {
  if (!filename) return null;
  
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/profiles/${filename}`;
};

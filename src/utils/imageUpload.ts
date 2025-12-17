import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Uploads an image file to Supabase Storage avatars bucket
 * @param userId - The user's ID (used for folder structure)
 * @param imageUri - The local URI of the image from image picker
 * @returns Public URL of the uploaded image
 */
export async function uploadAvatar(
  userId: string,
  imageUri: string
): Promise<UploadResult> {
  try {
    // Generate unique filename: {userId}/{timestamp}.jpg
    const timestamp = Date.now();
    const fileExt = imageUri.split('.').pop()?.split('?')[0] || 'jpg'; // Remove query params if any
    const fileName = `${timestamp}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Read the file as base64 from local URI
    // In React Native, we can't use fetch() for local file URIs
    // Use string literal 'base64' for encoding (ReadingOptions accepts 'base64' as a string)
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    console.log('✅ Read file as base64, length:', base64.length);

    // Convert base64 to ArrayBuffer using base64-arraybuffer library
    // This is more reliable than manual conversion
    const arrayBuffer = decode(base64);
    
    const mimeType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
    console.log('✅ Converted to ArrayBuffer, size:', arrayBuffer.byteLength, 'bytes');

    // Upload to Supabase Storage
    // Supabase accepts Blob, File, FormData, ArrayBuffer, or ReadableStream
    // ArrayBuffer is more compatible with React Native
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, arrayBuffer, {
        contentType: mimeType,
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to upload avatar image');
  }
}

/**
 * Deletes an avatar image from Supabase Storage
 * @param filePath - The storage path of the file to delete (e.g., "userId/filename.jpg")
 */
export async function deleteAvatar(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage.from('avatars').remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to delete avatar image');
  }
}

/**
 * Requests photo library permission and returns the permission status
 */
export async function requestPhotoLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

/**
 * Opens the image picker to select an image from the photo library
 * @returns Image picker result with selected image URI, or null if cancelled
 */
export async function pickImage(): Promise<string | null> {
  try {
    // Request permission first
    const hasPermission = await requestPhotoLibraryPermission();
    if (!hasPermission) {
      throw new Error('Photo library permission denied');
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images', // Using MediaType string literal instead of deprecated MediaTypeOptions
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for avatars
      quality: 0.8, // Compress image to 80% quality
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0]?.uri || null;
  } catch (error) {
    console.error('Error picking image:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to pick image');
  }
}


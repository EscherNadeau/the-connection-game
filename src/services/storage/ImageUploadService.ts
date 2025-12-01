/**
 * Image Upload Service
 * Handles uploading avatars and banners to Supabase Storage
 */

import { getSupabaseClient } from '../../config/supabase'
import { debug, warn, error as logError } from '../ui/log'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export type ImageType = 'avatar' | 'banner'

class ImageUploadService {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  /**
   * Upload an image to Supabase Storage
   */
  async uploadImage(
    file: File,
    userId: string,
    type: ImageType
  ): Promise<UploadResult> {
    const client = getSupabaseClient()
    if (!client) {
      return { success: false, error: 'Storage not available' }
    }

    // Validate file
    const validation = this.validateFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    try {
      const bucket = type === 'avatar' ? 'avatars' : 'banners'
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`

      debug(`Uploading ${type} for user ${userId}`, { fileName, size: file.size })

      // Delete old image first
      await this.deleteOldImages(userId, type)

      // Upload new image
      const { data, error } = await client.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        warn(`Failed to upload ${type}`, { error: error.message })
        return { success: false, error: error.message }
      }

      // Get public URL
      const { data: urlData } = client.storage
        .from(bucket)
        .getPublicUrl(fileName)

      debug(`${type} uploaded successfully`, { url: urlData.publicUrl })

      return { success: true, url: urlData.publicUrl }
    } catch (err) {
      logError(`Upload ${type} error`, { error: err })
      return { success: false, error: 'Failed to upload image' }
    }
  }

  /**
   * Delete old images for a user
   */
  private async deleteOldImages(userId: string, type: ImageType): Promise<void> {
    const client = getSupabaseClient()
    if (!client) return

    try {
      const bucket = type === 'avatar' ? 'avatars' : 'banners'
      const { data: files } = await client.storage.from(bucket).list(userId)

      if (files && files.length > 0) {
        const filesToDelete = files
          .filter(f => f.name.startsWith(type))
          .map(f => `${userId}/${f.name}`)

        if (filesToDelete.length > 0) {
          await client.storage.from(bucket).remove(filesToDelete)
        }
      }
    } catch (err) {
      debug(`Could not delete old ${type}s`, { error: err })
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    if (!file) return { valid: false, error: 'No file selected' }
    if (file.size > this.MAX_FILE_SIZE) return { valid: false, error: 'Image must be less than 5MB' }
    if (!this.ALLOWED_TYPES.includes(file.type)) return { valid: false, error: 'Only JPEG, PNG, GIF, and WebP allowed' }
    return { valid: true }
  }

  /**
   * Update user profile with new image URL
   */
  async updateUserImage(
    userId: string,
    type: ImageType,
    url: string
  ): Promise<{ success: boolean; error?: string }> {
    const client = getSupabaseClient()
    if (!client) return { success: false, error: 'Database not available' }

    try {
      const field = type === 'avatar' ? 'avatar_url' : 'banner_url'
      
      // Update users table
      const { error: dbError } = await client
        .from('users')
        .update({ [field]: url, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (dbError) {
        return { success: false, error: dbError.message }
      }

      // For avatar, also update auth user metadata so it shows everywhere
      if (type === 'avatar') {
        const { error: authError } = await client.auth.updateUser({
          data: { avatar_url: url }
        })
        if (authError) {
          warn('Failed to update auth metadata with avatar', { error: authError })
        }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: 'Failed to update profile' }
    }
  }

  /**
   * Upload and update user image in one call
   */
  async uploadAndUpdateUserImage(
    file: File,
    userId: string,
    type: ImageType
  ): Promise<UploadResult> {
    const uploadResult = await this.uploadImage(file, userId, type)
    
    if (!uploadResult.success || !uploadResult.url) {
      return uploadResult
    }

    const updateResult = await this.updateUserImage(userId, type, uploadResult.url)
    
    if (!updateResult.success) {
      return { success: false, error: updateResult.error }
    }

    return uploadResult
  }
}

export const imageUploadService = new ImageUploadService()
export default imageUploadService

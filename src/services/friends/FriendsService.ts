/**
 * Friends Service
 * Handles friend requests, friend list, and friend-related operations
 */

import { getSupabaseClient, isSupabaseConfigured } from '../../config/supabase'
import { debug, warn, error as logError } from '../ui/log'
import type { FriendRow, FriendWithUser, FriendshipStatus, UserRow } from '../../types/database'

export interface FriendResult<T> {
  data: T | null
  error: string | null
}

export interface FriendListResult<T> {
  data: T[]
  error: string | null
}

export interface FriendInfo {
  id: string
  friendshipId: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  status: FriendshipStatus
  isRequester: boolean
  createdAt: string
}

class FriendsService {
  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return isSupabaseConfigured()
  }

  /**
   * Send a friend request by username
   */
  async sendFriendRequest(requesterId: string, addresseeUsername: string): Promise<FriendResult<FriendRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      // First, find the user by username
      const { data: addressee, error: userError } = await client
        .from('users')
        .select('id')
        .eq('username', addresseeUsername.toLowerCase())
        .single()

      if (userError || !addressee) {
        return { data: null, error: 'User not found' }
      }

      if (addressee.id === requesterId) {
        return { data: null, error: "You can't add yourself as a friend" }
      }

      // Check if friendship already exists (in either direction)
      const { data: existing } = await client
        .from('friends')
        .select('*')
        .or(`and(requester_id.eq.${requesterId},addressee_id.eq.${addressee.id}),and(requester_id.eq.${addressee.id},addressee_id.eq.${requesterId})`)
        .single()

      if (existing) {
        if (existing.status === 'accepted') {
          return { data: null, error: 'Already friends with this user' }
        }
        if (existing.status === 'pending') {
          return { data: null, error: 'Friend request already pending' }
        }
        if (existing.status === 'blocked') {
          return { data: null, error: 'Unable to send friend request' }
        }
      }

      // Create friend request
      const { data, error } = await client
        .from('friends')
        .insert({
          requester_id: requesterId,
          addressee_id: addressee.id,
          status: 'pending',
        })
        .select()
        .single()

      if (error) {
        warn('FriendsService: Failed to send friend request', { error })
        return { data: null, error: error.message }
      }

      debug('FriendsService: Friend request sent')
      return { data, error: null }
    } catch (err) {
      logError('FriendsService: Send friend request error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(friendshipId: string, userId: string): Promise<FriendResult<FriendRow>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)
        .eq('addressee_id', userId) // Only the addressee can accept
        .eq('status', 'pending')
        .select()
        .single()

      if (error) {
        warn('FriendsService: Failed to accept friend request', { error })
        return { data: null, error: error.message }
      }

      debug('FriendsService: Friend request accepted')
      return { data, error: null }
    } catch (err) {
      logError('FriendsService: Accept friend request error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Reject/cancel a friend request
   */
  async rejectFriendRequest(friendshipId: string, userId: string): Promise<FriendResult<boolean>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      const { error } = await client
        .from('friends')
        .delete()
        .eq('id', friendshipId)
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

      if (error) {
        warn('FriendsService: Failed to reject friend request', { error })
        return { data: null, error: error.message }
      }

      debug('FriendsService: Friend request rejected')
      return { data: true, error: null }
    } catch (err) {
      logError('FriendsService: Reject friend request error', { error: err })
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Remove a friend
   */
  async removeFriend(friendshipId: string, userId: string): Promise<FriendResult<boolean>> {
    return this.rejectFriendRequest(friendshipId, userId)
  }

  /**
   * Get all friends (accepted friendships)
   */
  async getFriends(userId: string): Promise<FriendListResult<FriendInfo>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: [], error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('friends')
        .select(`
          id,
          requester_id,
          addressee_id,
          status,
          created_at,
          requester:users!friends_requester_id_fkey(id, username, display_name, avatar_url),
          addressee:users!friends_addressee_id_fkey(id, username, display_name, avatar_url)
        `)
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

      if (error) {
        warn('FriendsService: Failed to get friends', { error })
        return { data: [], error: error.message }
      }

      // Map to FriendInfo, showing the OTHER user's info
      const friends: FriendInfo[] = (data || []).map((row: Record<string, unknown>) => {
        const isRequester = row.requester_id === userId
        const friend = (isRequester ? row.addressee : row.requester) as Record<string, unknown>
        
        return {
          id: friend.id as string,
          friendshipId: row.id as string,
          username: friend.username as string | null,
          displayName: friend.display_name as string | null,
          avatarUrl: friend.avatar_url as string | null,
          status: row.status as FriendshipStatus,
          isRequester,
          createdAt: row.created_at as string,
        }
      })

      return { data: friends, error: null }
    } catch (err) {
      logError('FriendsService: Get friends error', { error: err })
      return { data: [], error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get pending friend requests (received)
   */
  async getPendingRequests(userId: string): Promise<FriendListResult<FriendInfo>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: [], error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('friends')
        .select(`
          id,
          requester_id,
          addressee_id,
          status,
          created_at,
          requester:users!friends_requester_id_fkey(id, username, display_name, avatar_url)
        `)
        .eq('status', 'pending')
        .eq('addressee_id', userId)

      if (error) {
        warn('FriendsService: Failed to get pending requests', { error })
        return { data: [], error: error.message }
      }

      const requests: FriendInfo[] = (data || []).map((row: Record<string, unknown>) => {
        const requester = row.requester as Record<string, unknown>
        
        return {
          id: requester.id as string,
          friendshipId: row.id as string,
          username: requester.username as string | null,
          displayName: requester.display_name as string | null,
          avatarUrl: requester.avatar_url as string | null,
          status: row.status as FriendshipStatus,
          isRequester: false,
          createdAt: row.created_at as string,
        }
      })

      return { data: requests, error: null }
    } catch (err) {
      logError('FriendsService: Get pending requests error', { error: err })
      return { data: [], error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get sent friend requests (outgoing)
   */
  async getSentRequests(userId: string): Promise<FriendListResult<FriendInfo>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: [], error: 'Database not available' }
    }

    try {
      const { data, error } = await client
        .from('friends')
        .select(`
          id,
          requester_id,
          addressee_id,
          status,
          created_at,
          addressee:users!friends_addressee_id_fkey(id, username, display_name, avatar_url)
        `)
        .eq('status', 'pending')
        .eq('requester_id', userId)

      if (error) {
        warn('FriendsService: Failed to get sent requests', { error })
        return { data: [], error: error.message }
      }

      const requests: FriendInfo[] = (data || []).map((row: Record<string, unknown>) => {
        const addressee = row.addressee as Record<string, unknown>
        
        return {
          id: addressee.id as string,
          friendshipId: row.id as string,
          username: addressee.username as string | null,
          displayName: addressee.display_name as string | null,
          avatarUrl: addressee.avatar_url as string | null,
          status: row.status as FriendshipStatus,
          isRequester: true,
          createdAt: row.created_at as string,
        }
      })

      return { data: requests, error: null }
    } catch (err) {
      logError('FriendsService: Get sent requests error', { error: err })
      return { data: [], error: 'An unexpected error occurred' }
    }
  }

  /**
   * Search for users to add as friends
   */
  async searchUsers(query: string, currentUserId: string, limit = 10): Promise<FriendListResult<{
    id: string
    username: string | null
    displayName: string | null
    avatarUrl: string | null
  }>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: [], error: 'Database not available' }
    }

    if (!query || query.length < 2) {
      return { data: [], error: null }
    }

    try {
      const { data, error } = await client
        .from('users')
        .select('id, username, display_name, avatar_url')
        .neq('id', currentUserId)
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(limit)

      if (error) {
        warn('FriendsService: Failed to search users', { error })
        return { data: [], error: error.message }
      }

      const users = (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        username: row.username as string | null,
        displayName: row.display_name as string | null,
        avatarUrl: row.avatar_url as string | null,
      }))

      return { data: users, error: null }
    } catch (err) {
      logError('FriendsService: Search users error', { error: err })
      return { data: [], error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get friend count
   */
  async getFriendCount(userId: string): Promise<FriendResult<number>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      const { count, error } = await client
        .from('friends')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: count || 0, error: null }
    } catch (err) {
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  /**
   * Get pending request count
   */
  async getPendingCount(userId: string): Promise<FriendResult<number>> {
    const client = getSupabaseClient()
    if (!client) {
      return { data: null, error: 'Database not available' }
    }

    try {
      const { count, error } = await client
        .from('friends')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('addressee_id', userId)

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: count || 0, error: null }
    } catch (err) {
      return { data: null, error: 'An unexpected error occurred' }
    }
  }
}

// Export singleton instance
export const friendsService = new FriendsService()
export default friendsService


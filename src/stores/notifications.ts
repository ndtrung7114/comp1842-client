// src/stores/notifications.ts
import Notification from '@/components/Notification.vue'
import { defineStore } from 'pinia'
import { useApi, useApiPrivate } from '../composables/useApi'

// Define a Notification type for better type checking
export interface Notification {
  _id: string // Notification ID from the database
  receiver: string // ID of the user receiving the notification
  sender: string // ID of the user sending the notification
  type: 'like' | 'comment' | 'friend_request' | 'message' // Type of notification
  reference: string // Reference to related data (e.g., post ID)
  message: string // Notification message
  is_read: boolean // Whether the user has read the notification
  created_at: Date // Timestamp of when the notification was created
}

export interface State {
  notifications: Notification[] // Array of notifications
  notificationForUser: Notification[] // Array of notifications for the current user
}

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Notification[], // Specify the notifications array with the Notification type
    notificationForUser: [] as Notification[], // Specify the notifications array with the Notification type
    unreadCount: 0,
 
  }),

  getters: {
    // Count of unread notifications
    unreadNotificationsCount(): number {
      return this.notificationForUser.filter((notification) => !notification.is_read).length
    },

    unreadMessageSendersCount(): number {
    
      return this.notificationForUser.filter((notification) => !notification.is_read && notification.type === 'message').length
    },
  },

  actions: {
    async getNotificationForUser() {
      // Fetch notifications for the current user
      try {
        const { data } = await useApiPrivate().get('/api/notification/')
        console.log('Fetched notifications:', data) // Log the fetched data

        // Map the fetched notifications to match the expected structure
        this.notificationForUser = data.notifications.map((notification: any) => ({
          _id: notification._id,
          receiver: notification.receiver,
          sender: notification.sender,
          type: notification.type,
          reference: notification.reference,
          message: notification.message,
          is_read: notification.is_read,
          created_at: new Date(notification.created_at)
        }))

        // Update unread count based on the fetched notifications
        this.unreadCount = this.notificationForUser.filter(
          (notification) => !notification.is_read
        ).length
        
      } catch (error: any) {
        console.error('Failed to fetch notifications:', error) // Log the error
      }
    },

    addNotification(notification: Notification) {
      // Define the type for the parameter
      this.notifications.push(notification) // Add to the beginning of the array
    },

    addNotificationForUser(notification: Notification) {
      // Define the type for the parameter
      this.notificationForUser.unshift(notification) // Add to the beginning of the array
      if (!notification.is_read) {
        this.unreadCount++ // Increase unread count for new unread notification
        
      }
    },
    clearNotifications() {
      // Optional: Action to clear all notifications
      this.notifications = []
      this.unreadCount = 0
    },
    // Mark all notifications for the user as read
    async markAllAsReadForUser() {
      try {
        await useApiPrivate().put('/api/notification/mark-all')
        this.notificationForUser = this.notificationForUser.map((notification) => ({
          ...notification,
          is_read: true
        }))
        this.unreadCount = 0
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error)
      }
    }
  }
})

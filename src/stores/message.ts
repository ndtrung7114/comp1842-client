// src/stores/message.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSocket } from '@/plugins/socket'
import { useApi, useApiPrivate } from '../composables/useApi'

export interface Message {
  _id: string
  sender: string
  recipient: string
  content: string
  sent_at: Date
  imageUrls?: string[]
  is_read: boolean
}

export interface conversations {
  lastMessage: string
  lastSenderId: string
  sentAt: string
  userId: string
  username: string
  fullname: string
  is_read: boolean
  unreadCount?: number
  avatar?: string
}

export interface State {
  allMessages: Message[]
  messageDetail: Message[]
}

export const useMessageStore = defineStore('message', {
  state: () => ({
    allMessages: [] as conversations[],
    messageDetail: [] as Message[]
  }),

  getters: {
    // Count of unread conversations (one per user if any message is unread)
    unreadConversationsCount(): number {
      // Use a Set to keep track of unique userIds with unread messages
      const unreadUserIds = new Set<string>()
      this.allMessages.forEach((message) => {
        if (!message.is_read) {
          unreadUserIds.add(message.userId) // Add userId to the set if there's an unread message
        }
      })
      return unreadUserIds.size // The size of the set represents the count of unread conversations
    }
  },

  actions: {
    addMessage(message: Message) {
      this.messageDetail.push(message)
    },

    incrementUnreadCount(userId: string) {
      const conversation = this.allMessages.find((c) => c.userId === userId);
      if (conversation && typeof conversation.unreadCount !== 'undefined') {
        conversation.unreadCount++;
      }
    },
    
    updateConversation(newMessage: any) {
      const existingConversationIndex = this.allMessages.findIndex(
        (conv) => conv.userId === newMessage.sender || conv.userId === newMessage.recipient
      )

      if (existingConversationIndex !== -1) {
        // Update existing conversation
        const conversation = this.allMessages[existingConversationIndex]
        this.allMessages[existingConversationIndex] = {
          ...conversation,
          lastMessage: newMessage.content,
          lastSenderId: newMessage.sender,
          sentAt: new Date(newMessage.sent_at).toISOString(),
          is_read: false,
          unreadCount: typeof conversation.unreadCount !== 'undefined' ? conversation.unreadCount : 0
        }
      } else {
        // Add new conversation
        this.allMessages.push({
          lastMessage: newMessage.content,
          lastSenderId: newMessage.sender,
          sentAt: new Date(newMessage.sent_at).toISOString(),
          userId: newMessage.sender,
          username: newMessage.senderUsername || 'Unknown',
          fullname: newMessage.senderFullname || 'Unknown',
          is_read: false,
          unreadCount: 0
        })
      }
    },

    async sendMessage(formData: FormData) {
      try {
        const { data } = await useApiPrivate().post('/api/message/send', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.messageDetail.push(data)
        console.log('Message sent:', this.messageDetail)
      } catch (error: any) {
        console.error('Failed to send message:', error)
      }
    },

    async getAllMessages() {
      try {
        const { data } = await useApiPrivate().get('/api/message/conversations')
        this.allMessages = data
        console.log('Fetched all messages:', this.allMessages)
      } catch (error: any) {
        console.error('Failed to fetch messages:', error)
      }
    },

    async getMessageDetail(userId1: string, userId2: string) {
      try {
        const { data } = await useApiPrivate().get(`/api/message/${userId1}/${userId2}`)
        this.messageDetail = data
        console.log('fetch message detail: ', this.messageDetail)
      } catch (error: any) {
        console.error('Failed to fetch message detail:', error)
      }
    },

    async markMessageAsRead(messageId: string) {
      // Send a request to the server to mark the message as read
      await useApiPrivate().post(`/api/message/${messageId}/markAsRead`)
    }
  }
})

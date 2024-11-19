// src/plugins/socket.ts
import { io, Socket } from 'socket.io-client';
import type { App } from 'vue';
import { useNotificationsStore } from '@/stores/notifications';
import { useAuthStore } from '../stores/auth';
import { useMessageStore } from '@/stores/message';
import { watch } from 'vue';


export const socket = io('http://localhost:3500', {
  withCredentials: true,
  autoConnect: true,
  transports: ['polling', 'websocket']
});

export const socketPlugin = {
  install: (app: App) => {
    
    app.config.globalProperties.$socket = socket;
    app.provide('socket', socket);

    const messageStore = useMessageStore();
    const notificationsStore = useNotificationsStore();

    socket.on('receiveMessage', (message) => {
      // Add the message to the message store
      
      // Update the message store with the new message
      messageStore.updateConversation(message);
      
      // If we're in a message detail view, also add to message detail
      if (messageStore.messageDetail.length > 0) {
        const currentConversation = messageStore.messageDetail[0];
        if (
          currentConversation.sender === message.sender || 
          currentConversation.recipient === message.sender
        ) {
          messageStore.addMessage(message);
        }
      }
    

      // Check if the current user is the recipient
      if (message.recipient === authStore.user.user?.id) {

        messageStore.incrementUnreadCount(message.sender);
        // Create a new notification
        notificationsStore.addNotification({
          _id: message._id,
          receiver: message.recipient,
          sender: message.sender,
          type: 'message',
          reference: message._id,
          message: message.content,
          is_read: false,
          created_at: new Date(message.sent_at),
        });

        // Increment the unread message count for the recipient
        notificationsStore.addNotificationForUser({
          _id: message._id,
          receiver: message.recipient,
          sender: message.sender,
          type: 'message',
          reference: message._id,
          message: message.content,
          is_read: false,
          created_at: new Date(message.sent_at),
        });
      }
    });

    const authStore = useAuthStore();

    // Watch for user login status to emit register
    watch(
      () => authStore.user.user?.id,
      (userId) => {
        if (userId) {
          socket.emit("register", userId.toString());
          console.log("User registered with ID:", userId);
        }
      },
      { immediate: true }
    );

    socket.on('connect', () => {
        
        console.log('Connected to WebSocket server Socket ID:', socket.id);
        
        // Register user if they are logged in when the socket connects
   
      if (authStore.user.user?.id) {
        socket.emit("register", authStore.user.user.id.toString());
        console.log("User registered with ID:", authStore.user.user.id);
      }

        
    });

   socket.on('postLiked', (notification) => {
        const notificationsStore = useNotificationsStore();
         notificationsStore.addNotification({
          _id: notification._id,
          receiver: notification.receiver,
          sender: notification.sender,
          type: notification.type,
          reference: notification.reference,
          message: notification.message,
          is_read: notification.is_read,
          created_at: new Date(notification.created_at),
        });

        notificationsStore.addNotificationForUser({
          _id: notification._id,
          receiver: notification.receiver,
          sender: notification.sender,
          type: notification.type,
          reference: notification.reference,
          message: notification.message,
          is_read: notification.is_read,
          created_at: new Date(notification.created_at),
        });
        console.log('Updated notifications:', notificationsStore.notifications);
      });

      socket.on('newComment', (notification) => {
        const notificationsStore = useNotificationsStore();
         notificationsStore.addNotification({
          _id: notification._id,
          receiver: notification.receiver,
          sender: notification.sender,
          type: notification.type,
          reference: notification.reference,
          message: notification.message,
          is_read: notification.is_read,
          created_at: new Date(notification.created_at),
        });

        notificationsStore.addNotificationForUser({
          _id: notification._id,
          receiver: notification.receiver,
          sender: notification.sender,
          type: notification.type,
          reference: notification.reference,
          message: notification.message,
          is_read: notification.is_read,
          created_at: new Date(notification.created_at),
        });
        console.log('Updated notifications:', notificationsStore.notifications);
      });


      socket.on('receiveMessage', (message) => {
      // Update the chat UI to display the new message
      
    });

    // Function to emit the 'newMessage' event
    
      
    

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
    });

    

    
  }
}





// Composable for using socket in components
export const useSocket = () => {
  return {
    socket,

    
  }
};
<!-- ChatBox.vue -->
<template>
  <Transition name="slide-fade">
    <div v-if="modelValue" class="chat-box-container">
      <!-- Chat Box Header -->
      <div class="chat-box-header">
        <div class="d-flex align-items-center">
          <img 
            :src="recipientAvatar || 'https://via.placeholder.com/32'" 
            class="rounded-circle me-2" 
            alt="Avatar"
            width="32" 
            height="32"
          >
          <span class="fw-semibold">{{ recipientName }}</span>
        </div>
        <button @click="$emit('update:modelValue', false)" class="btn-close"></button>
      </div>

      <!-- Chat Box Body -->
      <div class="chat-box-body">
        <!-- Image Preview -->
        <div v-if="selectedImages.length > 0" class="selected-images mb-3">
          <div class="d-flex flex-wrap gap-2">
            <div v-for="(image, index) in selectedImagePreviews" :key="index" class="position-relative">
              <img 
                :src="image" 
                class="preview-image"
                alt="Selected image"
              >
              <button 
                @click="removeImage(index)" 
                class="btn-close btn-close-white position-absolute top-0 end-0 m-1"
                style="font-size: 0.5rem;"
              ></button>
            </div>
          </div>
        </div>

        <div class="message-input-container">
          <textarea
            v-model="message"
            class="form-control mb-2"
            rows="3"
            placeholder="Type your message..."
            @keyup.enter.exact.prevent="handleSend"
          ></textarea>

          <div class="d-flex justify-content-between align-items-center">
            <!-- Image Upload Button -->
            <div class="upload-btn-wrapper">
              <button class="btn btn-outline-secondary btn-sm">
                <i class="fas fa-image me-1"></i>
                Add Images
              </button>
              <input 
                type="file" 
                multiple 
                accept="image/*"
                @change="handleImageSelect"
              >
            </div>

            <div class="d-flex gap-2">
              <button
                class="btn btn-secondary btn-sm"
                @click="$emit('update:modelValue', false)"
              >
                Cancel
              </button>
              <button
                class="btn btn-primary btn-sm"
                @click="handleSend"
                :disabled="!isValidMessage || isSending"
              >
                <span v-if="isSending" class="spinner-border spinner-border-sm me-1"></span>
                {{ isSending ? 'Sending...' : 'Send' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useMessageStore } from '@/stores/message'

const authStore = useAuthStore();
const messagesStore = useMessageStore()

interface Props {
  modelValue: boolean;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue', 'messageSent']);

const message = ref('');
const isSending = ref(false);
const selectedImages = ref<File[]>([]);
const selectedImagePreviews = ref<string[]>([]);

const isValidMessage = computed(() => {
  return message.value.trim() || selectedImages.value.length > 0;
});

const handleImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    const newFiles = Array.from(input.files);
    
    // Add new files to selectedImages
    selectedImages.value.push(...newFiles);
    
    // Create and add previews for new images
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          selectedImagePreviews.value.push(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
  }
};

const removeImage = (index: number) => {
  selectedImages.value.splice(index, 1);
  selectedImagePreviews.value.splice(index, 1);
};

const handleSend = async () => {
  if (!isValidMessage.value || isSending.value) return;

  try {
    isSending.value = true;
    
    // Create FormData
    const formData = new FormData();
    formData.append('sender', authStore.user.user._id);
    formData.append('recipient', props.recipientId);
    formData.append('content', message.value);
    
    // Append each image to formData
    selectedImages.value.forEach(file => {
      formData.append('images', file);
    });

    // Make API call
    await messagesStore.sendMessage(formData);

    

    // Reset form
    message.value = '';
    selectedImages.value = [];
    selectedImagePreviews.value = [];
    
    emit('messageSent');
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Failed to send message. Please try again.');
  } finally {
    isSending.value = false;
  }
};
</script>

<style scoped>
.chat-box-container {
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 1050;
}

.chat-box-header {
  padding: 12px 16px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-box-body {
  padding: 16px;
}

.message-input-container textarea {
  resize: none;
  font-size: 14px;
}

.preview-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.upload-btn-wrapper {
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.upload-btn-wrapper input[type=file] {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

/* Transition animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px) translateY(-50%);
  opacity: 0;
}
</style>
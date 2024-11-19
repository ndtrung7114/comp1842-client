<template>
  <transition name="fade">
    <div v-if="message" class="notification">
      {{ message }}
      <button @click="clearNotification" class="clear-button">X</button> <!-- Clear button -->
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { useNotificationsStore } from '@/stores/notifications'; // Import the notifications store

export default defineComponent({
  props: {
    message: {
      type: String as PropType<string>,
      required: true,
    },
  },
  setup() {
    const notificationsStore = useNotificationsStore();

    function clearNotification() {
      notificationsStore.clearNotifications(); // Call the clearNotifications method from the store
    }

    return {
      clearNotification,
    };
  },
});
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  color: white;
  z-index: 9999;
  transition: opacity 0.5s ease, transform 0.5s ease;
  background-color: #007bff; /* Default background color */
}

.clear-button {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  margin-left: 10px;
  font-weight: bold;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>

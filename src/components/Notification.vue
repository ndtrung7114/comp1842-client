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

<style src="../assets/style/component/Notification.css"></style>



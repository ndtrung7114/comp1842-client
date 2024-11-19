<template>
  <div id="forgot-password" class="py-5">
    <div class="container">
      <div class="card shadow-lg border-0 rounded-3 mx-auto mt-4 p-4" style="max-width: 480px;">
        <h5 class="card-title text-center text-primary mb-3">Forgot Password</h5>
        <form @submit.prevent="submitForm">
          <div class="mb-3">
            <label for="email" class="form-label">Email Address</label>
            <input
              v-model="email"
              type="email"
              class="form-control shadow-sm"
              id="email"
              required
              autocomplete="off"
              placeholder="Enter your email"
            />
          </div>
          <div v-if="errorMessage" class="alert alert-danger shadow-sm">
            {{ errorMessage }}
          </div>
          <div v-if="successMessage" class="alert alert-success shadow-sm">
            {{ successMessage }}
          </div>
          <div class="d-flex justify-content-center mt-4">
            <button type="submit" class="btn btn-primary btn-lg px-5 shadow-sm">Send OTP</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { sendForgotPasswordEmail } from "../../helpers/helper.js";

const email = ref("");
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const router = useRouter();

async function submitForm() {
  try {
    const response = await sendForgotPasswordEmail(email.value);
    successMessage.value = response.message || "OTP sent successfully!";
    errorMessage.value = null;

    setTimeout(() => {
      router.push({ name: "verify-otp", params: { email: email.value } });
    }, 1000);
  } catch (error: any) {
    errorMessage.value = error || "An error occurred while sending the OTP.";
    successMessage.value = null;
  }
}
</script>

<style scoped>
#forgot-password {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.card {
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

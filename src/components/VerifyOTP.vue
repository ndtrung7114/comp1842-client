<template>
  <div id="verify-otp" class="py-5">
    <div class="container">
      <div class="card shadow-lg border-0 rounded-3 mx-auto mt-4 p-4" style="max-width: 480px;">
        <h5 class="card-title text-center text-primary mb-3">Verify OTP</h5>
        <form @submit.prevent="verifyOTP">
          <div class="mb-3">
            <label for="otp" class="form-label text-center w-100">Enter OTP</label>
            <div class="otp-inputs d-flex justify-content-center gap-3">
              <input
                v-for="(value, index) in otp"
                :key="index"
                v-model="otp[index]"
                type="text"
                class="form-control otp-box shadow-sm text-center"
                maxlength="1"
                @input="focusNext(index)"
              />
            </div>
          </div>
          <div v-if="errorMessage" class="alert alert-danger shadow-sm">
            {{ errorMessage }}
          </div>
          <div v-if="successMessage" class="alert alert-success shadow-sm">
            {{ successMessage }}
          </div>
          <div class="d-flex justify-content-center mt-4">
            <button type="submit" class="btn btn-primary btn-lg px-5 shadow-sm">Verify OTP</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { verifyOtp } from "../helpers/helper";
import { useRouter, useRoute } from "vue-router";

const route = useRoute();
const router = useRouter();

const otp = ref<string[]>(["", "", "", ""]); // 4 separate inputs for OTP
const email = ref(route.params.email);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Focus the next input box automatically
function focusNext(index: number) {
  if (otp.value[index] && index < otp.value.length - 1) {
    const nextInput = document.querySelectorAll(".otp-box")[index + 1] as HTMLInputElement;
    if (nextInput) nextInput.focus();
  }
}

async function verifyOTP() {
  try {
    const otpValue = otp.value.join(""); // Combine OTP parts
    const response = await verifyOtp(email.value, otpValue);

    successMessage.value = response.message || "OTP verified successfully! Redirecting...";
    errorMessage.value = null;

    setTimeout(() => {
      router.push({ name: "change-password", params: { email: email.value } });
    }, 2000);
  } catch (error: any) {
    errorMessage.value = error || "An error occurred while verifying the OTP.";
    successMessage.value = null;
  }
}
</script>

<style scoped>
#verify-otp {
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

.otp-inputs {
  gap: 0.5rem;
}

.otp-box {
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  text-align: center;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  transition: border-color 0.2s ease-in-out;
}

.otp-box:focus {
  border-color: #007bff;
  outline: none;
}
</style>

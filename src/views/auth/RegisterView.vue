<template>
  <div id="register" class="min-vh-100 d-flex align-items-center py-5 bg-light">
    <div class="container">
      <div class="card shadow-lg rounded-3 overflow-hidden">
        <div class="row g-0">
          <!-- Left side decorative column -->
          <div class="col-md-5 bg-primary d-none d-md-flex align-items-center justify-content-center">
            <div class="text-center text-white p-5">
              <i class="fas fa-user-plus fa-3x mb-4"></i>
              <h2 class="display-6 fw-bold mb-4">Welcome!</h2>
              <p class="lead">Join our community and start your journey with us.</p>
            </div>
          </div>
          
          <!-- Right side form column -->
          <div class="col-md-7">
            <div class="card-body p-4 p-md-5">
              <h4 class="card-title fw-bold text-primary mb-1 text-center">Create Account</h4>
              
              <form @submit.prevent="submit" class="needs-validation" novalidate>
                <!-- Error Message -->
                <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
                  {{ errorMessage }}
                  <button type="button" class="btn-close" @click="clearError" aria-label="Close"></button>
                </div>

                <!-- Username -->
                <div class="form-floating mb-3">
                  <input 
                    v-model="registerData.username" 
                    type="text" 
                    class="form-control" 
                    id="username" 
                    placeholder="Username"
                    required
                  >
                  <label for="username">Username</label>
                </div>

                <!-- Name Fields Row -->
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input 
                        v-model="registerData.first_name" 
                        type="text" 
                        class="form-control" 
                        id="first_name" 
                        placeholder="First Name"
                        required
                      >
                      <label for="first_name">First Name</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input 
                        v-model="registerData.last_name" 
                        type="text" 
                        class="form-control" 
                        id="last_name" 
                        placeholder="Last Name"
                        required
                      >
                      <label for="last_name">Last Name</label>
                    </div>
                  </div>
                </div>

                <!-- Email -->
                <div class="form-floating mb-3">
                  <input 
                    v-model="registerData.email" 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    placeholder="name@example.com"
                    required
                  >
                  <label for="email">Email address</label>
                </div>

                <!-- Password -->
                <div class="mb-4">
                  <label class="form-label">Password</label>
                  <div class="input-group">
                    <input 
                      v-model="registerData.password"
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      placeholder="Choose a strong password"
                      @input="checkPasswordStrength"
                      required
                    >
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button"
                      @click="showPassword = !showPassword"
                    >
                      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  
                  <!-- Password Strength Indicator -->
                  <div class="mt-2">
                    <div class="d-flex justify-content-between mb-1">
                      <small>Password Strength:</small>
                      <small :class="strengthColor">{{ passwordStrength }}</small>
                    </div>
                    <div class="progress" style="height: 6px;">
                      <div 
                        class="progress-bar" 
                        :class="strengthProgressClass"
                        :style="{ width: strengthScore + '%' }"
                      ></div>
                    </div>
                    
                    <!-- Password Requirements -->
                    <div class="mt-2">
                      <small class="d-block" :class="requirements.length ? 'text-success' : 'text-muted'">
                        <i :class="requirements.length ? 'fas fa-check' : 'fas fa-times'" class="me-1"></i>
                        At least 8 characters
                      </small>
                      <small class="d-block" :class="requirements.uppercase ? 'text-success' : 'text-muted'">
                        <i :class="requirements.uppercase ? 'fas fa-check' : 'fas fa-times'" class="me-1"></i>
                        Contains uppercase letter
                      </small>
                      <small class="d-block" :class="requirements.lowercase ? 'text-success' : 'text-muted'">
                        <i :class="requirements.lowercase ? 'fas fa-check' : 'fas fa-times'" class="me-1"></i>
                        Contains lowercase letter
                      </small>
                      <small class="d-block" :class="requirements.number ? 'text-success' : 'text-muted'">
                        <i :class="requirements.number ? 'fas fa-check' : 'fas fa-times'" class="me-1"></i>
                        Contains number
                      </small>
                      <small class="d-block" :class="requirements.special ? 'text-success' : 'text-muted'">
                        <i :class="requirements.special ? 'fas fa-check' : 'fas fa-times'" class="me-1"></i>
                        Contains special character
                      </small>
                    </div>
                  </div>
                </div>

                <!-- Confirm Password -->
                <div class="mb-4">
                  <label class="form-label">Confirm Password</label>
                  <div class="input-group">
                    <input 
                      v-model="registerData.password_confirm"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      class="form-control"
                      placeholder="Confirm your password"
                      required
                    >
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div class="text-danger small mt-1" v-if="!passwordsMatch && registerData.password_confirm">
                    Passwords do not match
                  </div>
                </div>

                <!-- Submit Button -->
                <div class="d-grid gap-2">
                  <button 
                    type="submit" 
                    class="btn btn-primary btn-lg"
                    :disabled="!isFormValid"
                  >
                    Create Account
                  </button>
                </div>

                <!-- Login Link -->
                <p class="text-center mt-4 mb-0">
                  Already have an account? 
                  <router-link to="/login" class="text-primary text-decoration-none">Sign in</router-link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore, type RegisterData } from '../../stores/auth';
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const errorMessage = ref<string>("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const registerData = reactive<RegisterData>({
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  password: "",
  password_confirm: "",
});

// Password strength and requirements
const strengthScore = ref(0);
const requirements = reactive({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  special: false
});

const passwordStrength = computed(() => {
  if (strengthScore.value >= 80) return 'Very Strong';
  if (strengthScore.value >= 60) return 'Strong';
  if (strengthScore.value >= 40) return 'Medium';
  if (strengthScore.value >= 20) return 'Weak';
  return 'Very Weak';
});

const strengthColor = computed(() => {
  switch (passwordStrength.value) {
    case 'Very Strong': return 'text-success';
    case 'Strong': return 'text-success';
    case 'Medium': return 'text-warning';
    case 'Weak': return 'text-danger';
    default: return 'text-danger';
  }
});

const strengthProgressClass = computed(() => {
  switch (passwordStrength.value) {
    case 'Very Strong': return 'bg-success';
    case 'Strong': return 'bg-success';
    case 'Medium': return 'bg-warning';
    case 'Weak': return 'bg-danger';
    default: return 'bg-danger';
  }
});

const passwordsMatch = computed(() => {
  return registerData.password === registerData.password_confirm;
});

const isPasswordStrong = computed(() => {
  return strengthScore.value >= 60; // Require at least "Strong" password
});

function checkPasswordStrength() {
  const password = registerData.password;
  let score = 0;
  
  // Check requirements
  requirements.length = password.length >= 8;
  requirements.uppercase = /[A-Z]/.test(password);
  requirements.lowercase = /[a-z]/.test(password);
  requirements.number = /[0-9]/.test(password);
  requirements.special = /[^A-Za-z0-9]/.test(password);
  
  // Calculate score
  if (requirements.length) score += 20;
  if (requirements.uppercase) score += 20;
  if (requirements.lowercase) score += 20;
  if (requirements.number) score += 20;
  if (requirements.special) score += 20;
  
  strengthScore.value = score;
}

const isFormValid = computed(() => {
  return (
    registerData.username &&
    registerData.email &&
    registerData.first_name &&
    registerData.last_name &&
    registerData.password &&
    registerData.password_confirm &&
    passwordsMatch.value &&
    isPasswordStrong.value
  );
});

function clearError() {
  errorMessage.value = "";
}

async function submit() {
  if (!isFormValid.value) return;
  
  try {
    await authStore.register(registerData);
    router.replace({ name: "login" });
  } catch (err: any) {
    errorMessage.value = err.message;
  }
}
</script>

<style scoped>
@import "../../assets/style/auth/RegisterView.css";
</style>
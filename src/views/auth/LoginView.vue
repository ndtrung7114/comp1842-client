<template>
  <div id="login" class="min-vh-100 d-flex align-items-center py-5">
    <div class="container">
      <div class="login-wrapper">
        <div class="card card-body shadow-lg border-0 fade-in">
          <div class="text-center mb-4">
            <h3 class="card-title fw-bold text-primary mb-1">Welcome Back!</h3>
            <p class="text-muted">Please login to your account</p>
          </div>
          
          <form @submit.prevent="submit">
            <div class="floating-input mb-4">
              <div class="form-floating">
                <input 
                  v-model="loginData.email" 
                  type="email" 
                  class="form-control custom-input" 
                  id="email" 
                  placeholder="name@example.com"
                  autocomplete="off"
                >
                <label for="email">Email address</label>
              </div>
            </div>
            
            <div class="floating-input mb-4">
              <div class="form-floating">
                <input 
                  v-model="loginData.password" 
                  type="password" 
                  class="form-control custom-input" 
                  id="password"
                  placeholder="Password"
                >
                <label for="password">Password</label>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-4">
              <div class="form-check">
                <input 
                  v-model="rememberMe" 
                  type="checkbox" 
                  class="form-check-input custom-checkbox" 
                  id="rememberMe"
                >
                <label class="form-check-label text-muted" for="rememberMe">
                  Remember Me
                </label>
              </div>
              <router-link 
                :to="{name: 'forgot-password'}" 
                class="text-decoration-none text-primary hover-underline"
              >
                Forgot Password?
              </router-link>
            </div>

            <!-- error message -->
            <div 
              v-if="errorMessage" 
              class="alert alert-danger d-flex justify-content-between align-items-center fade-in"
            >
              <span>{{ errorMessage }}</span>
              <button 
                type="button" 
                class="btn-close" 
                @click="clearError" 
                aria-label="Close"
              ></button>
            </div>

            <div class="d-grid gap-2 mt-4">
              <button 
                type="submit" 
                class="btn btn-primary btn-lg custom-button"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup lang="ts">
import { useAuthStore, type LoginData } from '../../stores/auth';
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore()
const router = useRouter()

const loginData = reactive<LoginData>({
  email: "",
  password: "",
})

const rememberMe = ref(false);
const errorMessage = ref<string>("")

// Load the saved email and password from local storage if available
onMounted(() => {
  const savedEmail = localStorage.getItem("email");
  const savedPassword = localStorage.getItem("password");
  const savedRememberMe = localStorage.getItem("rememberMe") === 'true'; // Get Remember Me state
  if (savedEmail) {
    loginData.email = savedEmail;
  }
  if (savedPassword) {
    loginData.password = savedPassword;
  }
  rememberMe.value = savedRememberMe; // Set Remember Me state
});

async function submit(){
  await authStore.login(loginData)
    .then(res => {
      if (rememberMe.value) {
        // Save the email and password in local storage if "Remember Me" is checked
        localStorage.setItem("email", loginData.email);
        localStorage.setItem("password", loginData.password);
        localStorage.setItem("rememberMe", 'true'); // Save Remember Me state
      } else {
        // Clear the stored email and password if "Remember Me" is not checked
        localStorage.removeItem("email");
        localStorage.removeItem("password");
        localStorage.removeItem("rememberMe");
      }
      router.replace({name: "posts"})
    })
    .catch(err => {
      // Set the error message to display it in the view
      errorMessage.value = err.message || 'Login failed. Please try again.';
    })
}

function clearError(){
  errorMessage.value = ""
}

</script>

<style scoped>
@import "../../assets/style/auth/LoginView.css";
</style>
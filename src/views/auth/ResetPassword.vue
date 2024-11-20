<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="text-center mb-4">
              <div class="mb-3">
                <i class="fas fa-key fa-2x text-primary"></i>
              </div>
              <h4 class="mb-1">Reset Password</h4>
              <p class="text-muted">Please choose a new strong password</p>
            </div>

            <form @submit.prevent="changePassword" class="space-y-4">
              <!-- New Password Field -->
              <div class="mb-4">
                <label class="form-label">New Password</label>
                <div class="input-group">
                  <input :type="showNewPassword ? 'text' : 'password'" v-model="newPassword" class="form-control"
                    :class="{ 'is-invalid': v$.newPassword.$error || passwordMismatch }"
                    placeholder="Enter your new password" @input="checkPasswordStrength">
                  <button class="btn btn-outline-secondary" type="button" @click="showNewPassword = !showNewPassword">
                    <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
                <div class="invalid-feedback" v-if="v$.newPassword.$error">
                  {{ v$.newPassword.$errors[0].$message }}
                </div>

                <!-- Password Strength Indicator -->
                <div class="mt-2">
                  <div class="d-flex justify-content-between mb-1">
                    <small>Password Strength:</small>
                    <small :class="strengthColor">{{ passwordStrength }}</small>
                  </div>
                  <div class="progress" style="height: 6px;">
                    <div class="progress-bar" :class="strengthProgressClass" :style="{ width: strengthScore + '%' }">
                    </div>
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

              <!-- Confirm Password Field -->
              <div class="mb-4">
                <label class="form-label">Confirm New Password</label>
                <div class="input-group">
                  <input :type="showConfirmPassword ? 'text' : 'password'" v-model="confirmPassword"
                    class="form-control" :class="{ 'is-invalid': v$.confirmPassword.$error || passwordMismatch }"
                    placeholder="Confirm your new password" @input="checkPasswordMatch">
                  <button class="btn btn-outline-secondary" type="button"
                    @click="showConfirmPassword = !showConfirmPassword">
                    <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
                <div class="invalid-feedback" v-if="passwordMismatch">
                  Passwords do not match
                </div>
                <div class="invalid-feedback" v-else-if="v$.confirmPassword.$error">
                  {{ v$.confirmPassword.$errors[0].$message }}
                </div>
              </div>

              <div v-if="errorMessage" class="alert alert-danger">
                {{ errorMessage }}
              </div>
              <div v-if="successMessage" class="alert alert-success">
                {{ successMessage }}
              </div>

              <!-- Submit Button -->
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary"
                  :disabled="isSubmitting || !isPasswordStrong || v$.$invalid || passwordMismatch">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isSubmitting ? 'Resetting Password...' : 'Reset Password' }}
                </button>
                <RouterLink :to="{ name: 'login' }" class="btn btn-outline-secondary">
                  Cancel
                </RouterLink>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resetPassword } from '../../helpers/helper'
import { useVuelidate } from '@vuelidate/core'
import { required, sameAs, minLength } from '@vuelidate/validators'


const route = useRoute()
const router = useRouter()

const isSubmitting = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const email = ref(route.params.email)
const passwordMismatch = ref(false)

// Password state
const newPassword = ref('')
const confirmPassword = ref('')

// Watch for changes in either password field
watch([newPassword, confirmPassword], () => {
  checkPasswordMatch()
})

// Function to check if passwords match
function checkPasswordMatch() {
  if (confirmPassword.value && newPassword.value) {
    passwordMismatch.value = newPassword.value !== confirmPassword.value
  } else {
    passwordMismatch.value = false
  }
}

// Password requirements tracking
const requirements = reactive({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  special: false
})

// Password strength computation
const strengthScore = ref(0)
const passwordStrength = computed(() => {
  if (strengthScore.value >= 80) return 'Very Strong'
  if (strengthScore.value >= 60) return 'Strong'
  if (strengthScore.value >= 40) return 'Medium'
  if (strengthScore.value >= 20) return 'Weak'
  return 'Very Weak'
})

const strengthColor = computed(() => {
  switch (passwordStrength.value) {
    case 'Very Strong': return 'text-success'
    case 'Strong': return 'text-success'
    case 'Medium': return 'text-warning'
    case 'Weak': return 'text-danger'
    default: return 'text-danger'
  }
})

const strengthProgressClass = computed(() => {
  switch (passwordStrength.value) {
    case 'Very Strong': return 'bg-success'
    case 'Strong': return 'bg-success'
    case 'Medium': return 'bg-warning'
    case 'Weak': return 'bg-danger'
    default: return 'bg-danger'
  }
})

// Validation rules
const rules = computed(() => ({
  newPassword: {
    required,
    minLength: minLength(8)
  },
  confirmPassword: {
    required,
    sameAsPassword: sameAs(newPassword)
  }
}))

const v$ = useVuelidate(rules, { newPassword, confirmPassword })

// Password strength checker
function checkPasswordStrength() {
  const password = newPassword.value
  let score = 0

  // Reset requirements
  requirements.length = password.length >= 8
  requirements.uppercase = /[A-Z]/.test(password)
  requirements.lowercase = /[a-z]/.test(password)
  requirements.number = /[0-9]/.test(password)
  requirements.special = /[^A-Za-z0-9]/.test(password)

  // Calculate score
  if (requirements.length) score += 20
  if (requirements.uppercase) score += 20
  if (requirements.lowercase) score += 20
  if (requirements.number) score += 20
  if (requirements.special) score += 20

  strengthScore.value = score
}

const isPasswordStrong = computed(() => {
  return strengthScore.value >= 60 // Require at least "Strong" password
})

async function changePassword() {
  const isFormValid = await v$.value.$validate()
  if (!isFormValid || passwordMismatch.value) return

  isSubmitting.value = true
  errorMessage.value = null
  successMessage.value = null

  try {
    const response = await resetPassword({
      email: email.value,
      newPassword: newPassword.value
    })

    successMessage.value = response.message || 'Password reset successfully! You can now login.'

    // Redirect to login page after successful password reset
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 2000)
  } catch (error: any) {
    errorMessage.value = error.message || 'An error occurred while resetting the password.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
@import "../../assets/style/auth/ResetPassword.css";
</style>

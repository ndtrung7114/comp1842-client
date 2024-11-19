import { useApi } from '../composables/useApi'

interface ApiResponse {
  message: string;
  data?: any;
}

export const sendForgotPasswordEmail = async (email: string): Promise<ApiResponse> => {
  try {
    const response = await useApi().post('/api/auth/forgot-password', { email })
    return response.data
  } catch (error: any) {
    throw error.response?.data?.message || 'An error occurred while sending the OTP.'
  }
}

export const verifyOtp = async (email: string | string[], otp: string): Promise<ApiResponse> => {
  try {
    const normalizedEmail = Array.isArray(email) ? email[0] : email

    if (!normalizedEmail) {
      throw new Error('Email is required')
    }
    
    if (!otp || otp.length !== 4) {
      throw new Error('Please enter a valid 4-digit OTP')
    }
    
    const response = await useApi().post('/api/auth/verify-otp', { 
      email: normalizedEmail, 
      otp 
    })
    return response.data
  } catch (error: any) {
    throw error.response?.data?.message || 'An error occurred while verifying the OTP.'
  }
}

interface ResetPasswordParams {
  email: string | string[];
  newPassword: string;
}

export const resetPassword = async ({ 
  email, 
  newPassword 
}: ResetPasswordParams): Promise<ApiResponse> => {
  try {
    const normalizedEmail = Array.isArray(email) ? email[0] : email
    
    if (!normalizedEmail || !newPassword) {
      throw new Error('Email and new password are required')
    }

    const response = await useApi().post('/api/auth/reset-password', { 
      email: normalizedEmail, 
      newPassword 
    })
    return response.data
  } catch (error: any) {
    throw error.response?.data?.message || 'An error occurred while resetting the password.'
  }
}
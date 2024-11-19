import { useApi } from '../composables/useApi';

/**
 * Function to send a forgot password request to the backend
 * @param {string} email - The email address of the user
 * @returns {Promise} - Returns a promise that resolves with the response or rejects with an error
 */
export const sendForgotPasswordEmail = async (email) => {
    try {
      const response = await useApi().post('/api/auth/forgot-password', { email});
      return response.data; // Return the response data
    } catch (error) {
      // Throw the error to be caught in the calling function
      throw error.response?.data?.message || 'An error occurred while sending the OTP.';
    }
  };

export const verifyOtp = async (email, otp) => {
    try {
        const response = await useApi().post('/api/auth/verify-otp', { email, otp });
        return response.data;

    } catch (error) {
        throw error.response?.data?.message || 'An error occurred while verifying the OTP.';
    }
};

export const resetPassword = async ({ email, newPassword }) => {
    try {
      const response = await useApi().post('/api/auth/reset-password', {email, newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'An error occurred while resetting the password.';
    }
  };

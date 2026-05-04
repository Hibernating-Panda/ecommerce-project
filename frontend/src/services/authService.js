import api from './api';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  register: async (name, email, password) => {
    try {
      const response = await api.post('/register', { name, email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      // Even if logout fails on server, we should clear local storage
      console.error('Logout error:', error);
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/user');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get user' };
    }
  }
};

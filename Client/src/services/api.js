import axios from 'axios';

// Constants
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;
const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

// Axios instance creator with error handling
export const createAuthAxios = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });

  // Add response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        window.location.href = '/login';
      }
      return Promise.reject(error.response?.data || error.message);
    }
  );

  return instance;
};

// Helper functions
const handleResponse = async (apiCall) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Auth services
export const authService = {
  register: async (userData) => {
    return handleResponse(async () => {
      const response = await axios.post(`${API_URL}/auth/register`, userData, {
        withCredentials: true
      });
      if (response.data.success) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }
      return response;
    });
  },

  login: async (credentials) => {
    return handleResponse(async () => {
      const response = await axios.post(`${API_URL}/auth/login`, credentials, {
        withCredentials: true
      });
      if (response.data.success) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }
      return response;
    });
  },

  logout: async () => {
    return handleResponse(async () => {
      const response = await createAuthAxios().post('/auth/logout');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return response;
    });
  },

  forgotPassword: async (email) => {
    return handleResponse(() => 
      axios.post(`${API_URL}/auth/forgot-password`, { email })
    );
  },

  resetPassword: async (token, newPassword) => {
    return handleResponse(() => 
      axios.post(`${API_URL}/auth/reset-password`, { token, newPassword })
    );
  },

  getCurrentUser: async () => {
    return handleResponse(() => 
      createAuthAxios().get('/auth/me')
    );
  }
};

// Note services
export const noteService = {
  uploadNote: async (noteData) => {
    return handleResponse(() => 
      createAuthAxios().post('/notes', noteData)
    );
  },
  
  getNotes: async () => {
    return handleResponse(() => 
      createAuthAxios().get('/notes')
    );
  },
  
  getNote: async (noteId) => {
    return handleResponse(() => 
      createAuthAxios().get(`/notes/${noteId}`)
    );
  },
  
  deleteNote: async (noteId) => {
    return handleResponse(() => 
      createAuthAxios().delete(`/notes/${noteId}`)
    );
  }
};

// Quiz services
export const quizService = {
  createQuiz: async (quizData) => {
    return handleResponse(() => 
      createAuthAxios().post('/quizzes', quizData)
    );
  },
  
  getQuizzes: async () => {
    return handleResponse(() => 
      createAuthAxios().get('/quizzes')
    );
  },
  
  getQuiz: async (quizId) => {
    return handleResponse(() => 
      createAuthAxios().get(`/quizzes/${quizId}`)
    );
  },
  
  deleteQuiz: async (quizId) => {
    return handleResponse(() => 
      createAuthAxios().delete(`/quizzes/${quizId}`)
    );
  }
};
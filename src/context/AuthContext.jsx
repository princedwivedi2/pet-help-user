import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('user_user');
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    if (token) {
      authService.me()
        .then((res) => {
          const userData = res.data?.user || res.user;
          if (userData) {
            setUser(userData);
            localStorage.setItem('user_user', JSON.stringify(userData));
          }
        })
        .catch(() => {
          localStorage.removeItem('user_token');
          localStorage.removeItem('user_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    
    // After interceptor unwrap: res = { success, message, data: { user, token } }
    const userData = res.data?.user || res.user;
    const token = res.data?.token || res.token;

    if (!userData || !token) {
      throw new Error('Invalid response from server');
    }

    if (userData.role === 'admin' || userData.role === 'vet') {
      throw new Error('Please use the appropriate panel for your role.');
    }

    localStorage.setItem('user_token', token);
    localStorage.setItem('user_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    
    // After interceptor unwrap: res = { success, message, data: { user, token } }
    const userData = res.data?.user || res.user;
    const token = res.data?.token || res.token;

    if (!userData || !token) {
      throw new Error('Invalid response from server');
    }

    localStorage.setItem('user_token', token);
    localStorage.setItem('user_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_user');
    setUser(null);
  };

  const updateUser = (data) => {
    setUser(data);
    localStorage.setItem('user_user', JSON.stringify(data));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

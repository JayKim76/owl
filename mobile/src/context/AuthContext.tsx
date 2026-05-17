import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load token from secure store on mount
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('user_token');
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (e) {
        console.error('Failed to load token', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (newToken: string) => {
    setToken(newToken);
    await SecureStore.setItemAsync('user_token', newToken);
  };

  const logout = async () => {
    setToken(null);
    await SecureStore.deleteItemAsync('user_token');
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      isAuthenticated: !!token, 
      login, 
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

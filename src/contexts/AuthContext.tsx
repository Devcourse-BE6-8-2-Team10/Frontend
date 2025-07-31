'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/utils/apiClient';

interface User {
  id: string;
  email: string;
  name: string;
  // 필요한 다른 사용자 정보들
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  loading: boolean;
  accessToken: string | null; // accessToken 추가
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // JWT 토큰 만료시간 확인
  const isTokenExpired = (token: string): boolean => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return true;
      }
      // URL-safe base64 디코딩
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Token parsing failed:', error);
      return true; // 파싱 실패 시 만료된 것으로 처리
    }
  };

  // 사용자 정보를 서버에서 가져오는 함수
  const fetchUserInfo = async () => {
    try {
      const response = await apiClient.get('/api/auth/me');
      
      if (response.data.data) {
        const userData = {
          id: response.data.data.id,
          email: response.data.data.email,
          name: response.data.data.name,
        };
        
        // 서버 데이터로 localStorage 업데이트
        localStorage.setItem('userData', JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return null;
    }
  };

  useEffect(() => {
    // 페이지 로드 시 localStorage에서 인증 정보 복원
    const userDataStr = localStorage.getItem('userData');
    const storedAccessToken = localStorage.getItem('accessToken');
    
    if (userDataStr && storedAccessToken) {
      try {
        const userData = JSON.parse(userDataStr);
        
        // 토큰 만료 확인
        if (!isTokenExpired(storedAccessToken)) {
          setAccessToken(storedAccessToken);
          
          // 서버에서 최신 사용자 정보 가져오기 (백그라운드)
          fetchUserInfo().then(serverUserData => {
            if (serverUserData) {
              // 서버 데이터가 있으면 서버 데이터 사용
              setUser(serverUserData);
            } else {
              // 서버에서 정보를 가져올 수 없으면 localStorage 데이터 사용
              setUser(userData);
            }
          });
        } else {
          // 토큰이 만료된 경우 데이터 정리
          clearAuthData();
        }
      } catch (error) {
        console.error('Failed to parse user data from localStorage:', error);
        clearAuthData();
      }
    }
    setLoading(false);
  }, []);

  // 다른 탭에서 로그아웃 감지
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // 다른 탭에서 userData나 accessToken이 삭제되면 현재 탭도 로그아웃
      if ((e.key === 'userData' || e.key === 'accessToken') && e.newValue === null) {
        console.log('다른 탭에서 로그아웃이 감지되어 현재 탭도 로그아웃 처리합니다.');
        clearAuthData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // 인증 데이터 정리 함수
  const clearAuthData = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('accessToken');
  };

  const login = (userData: User, token: string) => {
    setUser(userData);
    setAccessToken(token);
    
    // localStorage에 사용자 정보 저장
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('accessToken', token);
  };

  const logout = async () => {
    try {
      // Backend에 로그아웃 요청
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuthData();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  name: string;
  // 필요한 다른 사용자 정보들
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
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

  useEffect(() => {
    // 페이지 로드 시 쿠키에서 사용자 정보 확인
    const userCookie = Cookies.get('user');
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse user cookie:', error);
        Cookies.remove('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    // 쿠키에 사용자 정보 저장 (7일간 유효)
    Cookies.set('user', JSON.stringify(userData), { expires: 7 });
  };

  const logout = async () => {
    try {
      // Backend에 로그아웃 요청을 보내서 refreshToken을 null로 업데이트
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken) {
        await fetch(`${backendUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // 로컬 상태 정리
      setUser(null);
      // 쿠키에서 사용자 정보 제거
      Cookies.remove('user');
      // localStorage에서 토큰 제거
      localStorage.removeItem('accessToken');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 
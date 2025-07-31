# 사용자 인증 시스템 사용 가이드

## 개요

이 프로젝트는 React Context API를 사용하여 전역 사용자 인증 상태를 관리합니다. 로그인 상태에 따라 헤더 메뉴가 동적으로 변경되며, 모든 페이지에서 사용자 정보에 접근할 수 있습니다.

## 주요 기능

### 1. 로그인 상태에 따른 헤더 메뉴 변경

- **로그인 전**: 홈, 특허목록, 로그인, 회원가입
- **로그인 후**: 홈, 특허목록, 채팅, 마이페이지, 로그아웃

### 2. 사용자 정보 관리

- 쿠키를 통한 사용자 정보 저장 (7일간 유효)
- 페이지 새로고침 시에도 로그인 상태 유지
- 전역 상태로 모든 컴포넌트에서 사용자 정보 접근 가능

## 사용법

### 1. 다른 페이지에서 사용자 정보 가져오기

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!isAuthenticated) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div>
      <h1>안녕하세요, {user?.name}님!</h1>
      <p>이메일: {user?.email}</p>
    </div>
  );
};
```

### 2. 인증이 필요한 페이지 보호하기

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ProtectedPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return <div>로딩 중...</div>;
  }

  return <div>보호된 페이지 내용</div>;
};
```

### 3. 로그인 처리

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        
        // AuthContext에 사용자 정보 저장
        login({
          id: data.memberInfo.id,
          email: data.memberInfo.email,
          name: data.memberInfo.name,
        });
      }
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  return (
    // 로그인 폼
  );
};
```

### 4. 로그아웃 처리

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    // 필요한 경우 홈페이지로 리다이렉트
    window.location.href = '/';
  };

  return <button onClick={handleLogout}>로그아웃</button>;
};
```

## AuthContext API

### useAuth() 훅이 제공하는 값들

- `user`: 사용자 정보 객체 (null이면 로그인되지 않음)
- `isAuthenticated`: 로그인 상태 (boolean)
- `login(userData)`: 로그인 함수
- `logout()`: 로그아웃 함수
- `loading`: 초기 로딩 상태 (boolean)

### User 객체 구조

```tsx
interface User {
  id: string;
  email: string;
  name: string;
  // 필요한 다른 사용자 정보들
}
```

## 파일 구조

```
src/
├── contexts/
│   └── AuthContext.tsx          # 인증 컨텍스트
├── components/
│   ├── Header.tsx               # 동적 헤더 컴포넌트
│   └── UserInfoExample.tsx      # 사용자 정보 사용 예제
└── app/
    ├── layout.tsx               # AuthProvider 래핑
    ├── login/page.tsx           # 로그인 페이지
    ├── mypage/page.tsx          # 마이페이지 (인증 필요)
    └── page.tsx                 # 홈페이지 (개인화된 환영 메시지)
```

## 주의사항

1. **클라이언트 컴포넌트**: `useAuth()` 훅은 클라이언트 컴포넌트에서만 사용할 수 있습니다.
2. **로딩 상태**: 초기 로딩 중에는 `loading` 상태를 확인하여 적절한 UI를 표시하세요.
3. **인증 확인**: 보호된 페이지에서는 `isAuthenticated` 상태를 확인하여 리다이렉트를 처리하세요.
4. **쿠키 관리**: 사용자 정보는 쿠키에 저장되므로 브라우저 설정에 따라 동작이 달라질 수 있습니다.

## 예제 시나리오

1. **사용자가 로그인하지 않은 상태**
   - 헤더에 "로그인", "회원가입" 메뉴 표시
   - 마이페이지 접근 시 로그인 페이지로 리다이렉트
   - 홈페이지에 일반적인 환영 메시지 표시

2. **사용자가 로그인한 상태**
   - 헤더에 "채팅", "마이페이지", "로그아웃" 메뉴 표시
   - 마이페이지에서 실제 사용자 정보 표시
   - 홈페이지에 개인화된 환영 메시지 표시
   - 모든 페이지에서 사용자 정보 접근 가능 
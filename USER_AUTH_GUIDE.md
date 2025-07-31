# 사용자 인증 시스템 사용 가이드

## 개요

이 프로젝트는 React Context API를 사용하여 전역 사용자 인증 상태를 관리합니다. JWT 토큰 기반의 localStorage 저장 방식을 사용하여 로그인 상태를 유지하며, 모든 페이지에서 사용자 정보에 접근할 수 있습니다.

## 주요 기능

### 1. 로그인 상태에 따른 헤더 메뉴 변경

- **로그인 전**: 홈, 특허목록, 로그인, 회원가입
- **로그인 후**: 홈, 특허목록, 채팅, 마이페이지, 로그아웃

### 2. 사용자 정보 관리

- **localStorage 기반 저장**: 사용자 정보와 JWT 토큰을 localStorage에 저장
- **자동 토큰 만료 확인**: JWT 토큰의 만료시간을 자동으로 확인하여 보안 강화
- **페이지 새로고침 시 로그인 상태 유지**: localStorage에서 인증 정보를 복원
- **전역 상태 관리**: 모든 컴포넌트에서 사용자 정보 접근 가능

## 저장 방식

### localStorage에 저장되는 데이터
```javascript
// 사용자 정보
localStorage.setItem('userData', JSON.stringify({
  id: "user123",
  email: "user@example.com", 
  name: "사용자명"
}));

// JWT AccessToken
localStorage.setItem('accessToken', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
```

### 토큰 만료 확인
- JWT 토큰의 `exp` 필드를 확인하여 자동으로 만료된 토큰 처리
- 만료된 토큰이 감지되면 자동으로 로그아웃 처리

## 사용법

### 1. 다른 페이지에서 사용자 정보 가져오기

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, loading, accessToken } = useAuth();

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
      <p>사용자 ID: {user?.id}</p>
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

### 3. API 요청 시 토큰 사용하기

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/utils/apiClient';

const ApiComponent = () => {
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      // 자동으로 Authorization 헤더가 추가됩니다!
      const response = await apiClient.get('/api/protected-data');
      console.log(response.data);
    } catch (error) {
      console.error('API 호출 실패:', error);
    }
  };

  const createData = async (data: any) => {
    try {
      const response = await apiClient.post('/api/protected-data', data);
      console.log('생성된 데이터:', response.data);
    } catch (error) {
      console.error('데이터 생성 실패:', error);
    }
  };

  return (
    <div>
      <button onClick={fetchData}>데이터 가져오기</button>
      <button onClick={() => createData({ name: '새 데이터' })}>데이터 생성</button>
    </div>
  );
};
```

### 4. API 클라이언트 특징

- **자동 토큰 추가**: 모든 요청에 자동으로 `Authorization: Bearer {token}` 헤더 추가
- **자동 에러 처리**: 401 에러 시 자동 로그아웃 및 로그인 페이지 리다이렉트
- **간편한 사용**: `apiClient.get()`, `apiClient.post()` 등으로 간단하게 사용
- **타입 안전성**: TypeScript 지원으로 타입 안전성 보장

## AuthContext API

### useAuth() 훅이 제공하는 값들

- `user`: 사용자 정보 객체 (null이면 로그인되지 않음)
- `isAuthenticated`: 로그인 상태 (boolean)
- `accessToken`: JWT AccessToken (string | null)
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
│   └── AuthContext.tsx          # 인증 컨텍스트 (localStorage 기반)
├── components/
│   └── Header.tsx               # 동적 헤더 컴포넌트
└── app/
    ├── layout.tsx               # AuthProvider 래핑
    ├── login/page.tsx           # 로그인 페이지
    ├── mypage/page.tsx          # 마이페이지 (인증 필요)
    └── page.tsx                 # 홈페이지 (개인화된 환영 메시지)
```

## 보안 특징

### 1. JWT 토큰 기반 인증
- AccessToken을 사용한 API 인증
- 토큰 만료시간 자동 확인
- 만료된 토큰 자동 로그아웃 처리

### 2. localStorage 보안 고려사항
- XSS 공격에 대한 주의 필요
- 민감한 정보는 최소화하여 저장
- 토큰 만료시간을 적절히 설정 (15분-1시간 권장)

## 주의사항

1. **클라이언트 컴포넌트**: `useAuth()` 훅은 클라이언트 컴포넌트에서만 사용할 수 있습니다.
2. **로딩 상태**: 초기 로딩 중에는 `loading` 상태를 확인하여 적절한 UI를 표시하세요.
3. **인증 확인**: 보호된 페이지에서는 `isAuthenticated` 상태를 확인하여 리다이렉트를 처리하세요.
4. **토큰 관리**: `accessToken`을 API 요청 시 Authorization 헤더에 포함하여 사용하세요.
5. **localStorage 제한**: 브라우저의 localStorage 용량 제한과 보안 정책을 고려하세요.

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
   - API 요청 시 자동으로 토큰 포함

3. **토큰 만료 시나리오**
   - JWT 토큰이 만료되면 자동으로 로그아웃 처리
   - 사용자는 다시 로그인해야 함
   - 보안을 위해 적절한 만료시간 설정 필요 
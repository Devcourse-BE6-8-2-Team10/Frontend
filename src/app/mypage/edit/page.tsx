'use client';

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import apiClient from "@/utils/apiClient";
import { memberAPI } from "@/utils/apiClient";

interface MemberUpdateRequest {
  name: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function EditProfile() {
  const { user, isAuthenticated, loading, updateUser, refreshUserInfo, logout } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<MemberUpdateRequest>({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // 사용자 정보로 폼 초기화
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // 비밀번호 변경 검증
      if (formData.currentPassword && !formData.newPassword) {
        setMessage({ type: 'error', text: '새 비밀번호를 입력해주세요.' });
        setIsSubmitting(false);
        return;
      }

      if (formData.newPassword && !formData.currentPassword) {
        setMessage({ type: 'error', text: '현재 비밀번호를 입력해주세요.' });
        setIsSubmitting(false);
        return;
      }

      if (formData.confirmPassword && !formData.newPassword) {
        setMessage({ type: 'error', text: '새 비밀번호를 입력해주세요.' });
        setIsSubmitting(false);
        return;
      }

      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
        setIsSubmitting(false);
        return;
      }

      // 비밀번호 변경이 있는 경우에만 currentPassword와 newPassword를 포함
      const requestData: any = {
        name: formData.name
      };

      if (formData.newPassword) {
        requestData.currentPassword = formData.currentPassword;
        requestData.newPassword = formData.newPassword;
      }

      await apiClient.patch('/api/members/me', requestData);
      
      // 서버에서 최신 사용자 정보 가져오기
      await refreshUserInfo();
      
      setMessage({ type: 'success', text: '정보가 성공적으로 수정되었습니다.' });
      
      // 즉시 마이페이지로 이동
      router.push('/mypage');
      
    } catch (error: any) {
      console.error('정보 수정 실패:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || '정보 수정에 실패했습니다.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/mypage');
  };

  // 회원 탈퇴 처리
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await memberAPI.deleteAccount();
      alert('회원 탈퇴가 완료되었습니다.');
      logout();
      router.push('/');
    } catch (error) {
      console.error('회원 탈퇴 실패:', error);
      alert('회원 탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // 로딩 중이거나 인증되지 않은 경우 로딩 표시
  if (loading || !isAuthenticated) {
    return (
      <div className="pb-10">
        <section className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">로딩 중...</p>
              </div>
                      </div>
        </div>
      </section>

      {/* 회원 탈퇴 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-red-600 mb-4">회원 탈퇴</h3>
            <p className="text-gray-700 mb-6">
              정말로 회원 탈퇴를 하시겠습니까?<br />
              <br />
              <strong>탈퇴 시 다음 사항들이 적용됩니다:</strong><br />
              • 모든 개인정보가 삭제됩니다<br />
              • 등록한 특허 정보가 삭제됩니다<br />
              • 찜한 특허 목록이 삭제됩니다<br />
              • 거래 내역이 삭제됩니다<br />
              <br />
              <strong>이 작업은 되돌릴 수 없습니다.</strong>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 cursor-pointer bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

  return (
    <div className="pb-10">
      <section className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <h1 className="text-2xl font-bold text-white">정보 수정</h1>
          </div>
          
          {/* Edit Form Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="text-purple-600 text-xl">👤</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1a365d]">프로필 정보 수정</h2>
                  <p className="text-gray-600 text-sm">개인정보를 안전하게 수정하세요</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer text-xs"
              >
                회원 탈퇴
              </button>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#1a365d] mb-2">
                  이름
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  placeholder="이름을 입력하세요"
                  required
                />
              </div>

              {/* Password Change Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-md font-semibold text-[#1a365d] mb-4">비밀번호 변경 (선택사항)</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-[#1a365d] mb-2">
                      현재 비밀번호
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                      placeholder="현재 비밀번호를 입력하세요"
                    />
                  </div>

                                     <div>
                     <label htmlFor="newPassword" className="block text-sm font-medium text-[#1a365d] mb-2">
                       새 비밀번호
                     </label>
                     <input
                       type="password"
                       id="newPassword"
                       name="newPassword"
                       value={formData.newPassword}
                       onChange={handleInputChange}
                       className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                       placeholder="새 비밀번호를 입력하세요"
                     />
                   </div>

                   <div>
                     <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1a365d] mb-2">
                       새 비밀번호 확인
                     </label>
                     <input
                       type="password"
                       id="confirmPassword"
                       name="confirmPassword"
                       value={formData.confirmPassword}
                       onChange={handleInputChange}
                       className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                       placeholder="새 비밀번호를 다시 입력하세요"
                     />
                     <p className="text-xs text-gray-500 mt-1">
                       비밀번호를 변경하지 않으려면 비워두세요
                     </p>
                   </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 cursor-pointer border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-purple-600 cursor-pointer text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      수정 중...
                    </div>
                  ) : (
                    '정보 수정'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </section>

      {/* 회원 탈퇴 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-red-600 mb-4">회원 탈퇴</h3>
            <p className="text-gray-700 mb-6">
              정말로 회원 탈퇴를 하시겠습니까?<br />
              <strong>이 작업은 되돌릴 수 없습니다.</strong>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 cursor-pointer bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
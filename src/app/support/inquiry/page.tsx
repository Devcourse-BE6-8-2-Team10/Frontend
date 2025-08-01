"use client";

import { useState } from "react";

export default function InquiryPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    subject: "",
    message: "",
    agreeToTerms: false
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제로는 API 호출을 통해 서버로 데이터를 전송합니다
    console.log("문의 내용:", formData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2a4fa2] via-[#1a365d] to-[#1a365d]">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">문의가 접수되었습니다</h1>
            <p className="text-gray-600 mb-6">
              문의해 주신 내용을 검토한 후, 빠른 시일 내에 답변드리겠습니다.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">문의 접수 정보</h3>
              <p className="text-sm text-gray-600">접수번호: INQ-{Date.now()}</p>
              <p className="text-sm text-gray-600">접수일시: {new Date().toLocaleString('ko-KR')}</p>
            </div>
            <button
              onClick={() => setIsSubmitted(false)}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              새 문의 작성
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a4fa2] via-[#1a365d] to-[#1a365d]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">1:1 문의</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="이름을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="이메일을 입력하세요"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연락처
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="연락처를 입력하세요 (선택사항)"
              />
            </div>

            {/* 문의 카테고리 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                문의 유형 <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">문의 유형을 선택하세요</option>
                <option value="service">서비스 이용 문의</option>
                <option value="technical">기술적 문제</option>
                <option value="payment">결제 관련 문의</option>
                <option value="patent">특허 관련 문의</option>
                <option value="legal">법률 자문 문의</option>
                <option value="complaint">불만 사항</option>
                <option value="suggestion">건의 사항</option>
                <option value="other">기타</option>
              </select>
            </div>

            {/* 문의 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                문의 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="문의 제목을 입력하세요"
              />
            </div>

            {/* 문의 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                문의 내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="문의하실 내용을 자세히 작성해 주세요."
              />
            </div>

            {/* 개인정보 동의 */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
                className="mt-1"
              />
              <label className="text-sm text-gray-600">
                <span className="text-red-500">*</span> 개인정보 수집 및 이용에 동의합니다. 
                <a href="/legal/privacy" className="text-blue-600 hover:underline ml-1">
                  개인정보처리방침
                </a>을 확인하세요.
              </label>
            </div>

            {/* 제출 버튼 */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                문의하기
              </button>
            </div>
          </form>

          {/* 문의 안내 */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">문의 안내</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 문의 접수 후 1-2일 내에 답변드립니다.</li>
              <li>• 긴급한 문의는 고객센터(02-1234-5678)로 연락해 주세요.</li>
              <li>• 개인정보는 문의 처리 목적으로만 사용됩니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 
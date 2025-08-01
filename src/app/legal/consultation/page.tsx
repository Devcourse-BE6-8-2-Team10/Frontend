"use client";

import { useState } from "react";

interface ConsultationCategory {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  features: string[];
}

const consultationCategories: ConsultationCategory[] = [
  {
    id: "basic",
    title: "기본 상담",
    description: "특허 관련 기본적인 법률 상담 서비스입니다.",
    price: "무료",
    duration: "30분",
    features: [
      "특허 출원 절차 안내",
      "기본적인 특허 검색 방법",
      "특허권 침해 여부 판단",
      "간단한 법률 문의 답변"
    ]
  },
  {
    id: "premium",
    title: "프리미엄 상담",
    description: "전문 변리사와의 1:1 심화 상담 서비스입니다.",
    price: "10만원",
    duration: "60분",
    features: [
      "전문 변리사 1:1 상담",
      "특허 명세서 검토",
      "특허권 침해 분석",
      "특허 거래 계약 검토",
      "상세한 법률 자문",
      "후속 상담 이메일 지원"
    ]
  },
  {
    id: "comprehensive",
    title: "종합 상담",
    description: "기업을 위한 종합적인 특허 전략 상담 서비스입니다.",
    price: "50만원",
    duration: "120분",
    features: [
      "기업 특허 포트폴리오 분석",
      "경쟁사 특허 분석",
      "특허 전략 수립",
      "특허 출원 계획 수립",
      "특허 라이센싱 전략",
      "3개월간 후속 지원"
    ]
  }
];

export default function LegalConsultationPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    consultationType: "",
    preferredDate: "",
    preferredTime: "",
    description: ""
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("상담 예약 데이터:", bookingData);
    alert("상담 예약이 완료되었습니다. 담당자가 연락드리겠습니다.");
    setShowBookingForm(false);
    setSelectedCategory(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a4fa2] via-[#1a365d] to-[#1a365d]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">법률 자문</h1>
          
          {/* 서비스 소개 */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">전문 변리사와 함께하는 특허 법률 상담</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              특허바다는 20년 이상의 경력을 가진 전문 변리사들이 특허 관련 모든 법률 문제를 해결해 드립니다. 
              특허 출원부터 권리 침해 대응, 라이센싱까지 종합적인 법률 서비스를 제공합니다.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-2">👨‍💼</div>
                <h3 className="font-semibold text-gray-800 mb-2">전문 변리사</h3>
                <p className="text-sm text-gray-600">20년 이상 경력의 전문 변리사</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl mb-2">⚖️</div>
                <h3 className="font-semibold text-gray-800 mb-2">종합 서비스</h3>
                <p className="text-sm text-gray-600">출원부터 침해 대응까지</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-3xl mb-2">📞</div>
                <h3 className="font-semibold text-gray-800 mb-2">즉시 상담</h3>
                <p className="text-sm text-gray-600">24시간 내 응답 보장</p>
              </div>
            </div>
          </div>

          {/* 상담 서비스 */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">상담 서비스</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {consultationCategories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{category.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                    <div className="text-2xl font-bold text-blue-600 mb-2">{category.price}</div>
                    <div className="text-sm text-gray-500 mb-4">상담 시간: {category.duration}</div>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {category.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setBookingData(prev => ({ ...prev, consultationType: category.title }));
                      setShowBookingForm(true);
                    }}
                    className={`w-full py-2 px-4 rounded-lg transition-colors ${
                      category.id === "basic" 
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    상담 예약
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 주요 서비스 영역 */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">주요 서비스 영역</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">특허 출원</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 특허 출원 절차 안내</li>
                  <li>• 명세서 작성 및 검토</li>
                  <li>• 선행기술조사</li>
                  <li>• 출원 후 관리</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">특허권 침해</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 침해 여부 분석</li>
                  <li>• 침해 대응 전략</li>
                  <li>• 경고서 작성</li>
                  <li>• 소송 대응</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">특허 거래</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 특허 평가</li>
                  <li>• 라이센싱 계약</li>
                  <li>• 양도 계약</li>
                  <li>• 기술 이전</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">기업 특허 전략</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 포트폴리오 분석</li>
                  <li>• 경쟁사 분석</li>
                  <li>• 특허 전략 수립</li>
                  <li>• R&D 방향 제시</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 상담 예약 폼 */}
          {showBookingForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">상담 예약</h3>
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이름 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={bookingData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이메일 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={bookingData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        연락처
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={bookingData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        회사명
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={bookingData.company}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        희망 날짜 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="preferredDate"
                        value={bookingData.preferredDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        희망 시간 <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="preferredTime"
                        value={bookingData.preferredTime}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">시간을 선택하세요</option>
                        <option value="09:00-10:00">09:00-10:00</option>
                        <option value="10:00-11:00">10:00-11:00</option>
                        <option value="11:00-12:00">11:00-12:00</option>
                        <option value="14:00-15:00">14:00-15:00</option>
                        <option value="15:00-16:00">15:00-16:00</option>
                        <option value="16:00-17:00">16:00-17:00</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상담 내용
                    </label>
                    <textarea
                      name="description"
                      value={bookingData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="상담하고 싶은 내용을 간단히 작성해 주세요."
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      예약 완료
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 연락처 정보 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">연락처</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <strong>전화:</strong> 02-1234-5678
              </div>
              <div>
                <strong>이메일:</strong> legal@patentmarket.com
              </div>
              <div>
                <strong>운영시간:</strong> 평일 09:00-18:00
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
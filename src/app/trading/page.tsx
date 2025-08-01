"use client";

import { useState } from "react";

interface TradeItem {
  id: string;
  patentTitle: string;
  seller: string;
  price: string;
  status: "판매중" | "거래진행중" | "거래완료";
  category: string;
  description: string;
  createdAt: string;
  views: number;
  inquiries: number;
}

const mockTrades: TradeItem[] = [
  {
    id: "1",
    patentTitle: "인공지능 기반 특허 분석 시스템",
    seller: "김철수",
    price: "5,000만원",
    status: "판매중",
    category: "물건발명",
    description: "머신러닝을 활용한 특허 분석 시스템으로, 특허 검색의 효율성을 크게 향상시킵니다.",
    createdAt: "2024-01-15",
    views: 156,
    inquiries: 8
  },
  {
    id: "2",
    patentTitle: "블록체인 기반 특허 거래 플랫폼",
    seller: "이영희",
    price: "3,500만원",
    status: "거래진행중",
    category: "방법발명",
    description: "스마트 컨트랙트를 활용한 특허 거래 플랫폼입니다.",
    createdAt: "2024-01-10",
    views: 89,
    inquiries: 5
  },
  {
    id: "3",
    patentTitle: "친환경 배터리 기술",
    seller: "박민수",
    price: "8,000만원",
    status: "판매중",
    category: "물건발명",
    description: "리튬이온 배터리의 성능을 향상시키는 환경 친화적 기술입니다.",
    createdAt: "2024-01-08",
    views: 234,
    inquiries: 12
  },
  {
    id: "4",
    patentTitle: "IoT 기반 스마트 홈 시스템",
    seller: "최지영",
    price: "2,500만원",
    status: "거래완료",
    category: "방법발명",
    description: "다양한 IoT 센서를 활용한 스마트 홈 시스템입니다.",
    createdAt: "2024-01-05",
    views: 67,
    inquiries: 3
  },
  {
    id: "5",
    patentTitle: "바이오 의료 진단 장치",
    seller: "정수진",
    price: "12,000만원",
    status: "판매중",
    category: "물건발명",
    description: "혈액 검사를 통한 빠르고 정확한 질병 진단 기술입니다.",
    createdAt: "2024-01-03",
    views: 189,
    inquiries: 15
  },
  {
    id: "6",
    patentTitle: "신제품 디자인",
    seller: "한지민",
    price: "1,500만원",
    status: "판매중",
    category: "디자인권",
    description: "혁신적인 제품 디자인으로 사용자 경험을 향상시키는 새로운 형태의 제품입니다.",
    createdAt: "2024-01-02",
    views: 98,
    inquiries: 6
  },
  {
    id: "7",
    patentTitle: "브랜드 상표",
    seller: "송민호",
    price: "800만원",
    status: "거래진행중",
    category: "상표권",
    description: "독창적인 브랜드 로고와 상표로 제품의 인지도를 높이는 상표권입니다.",
    createdAt: "2024-01-01",
    views: 45,
    inquiries: 2
  },
  {
    id: "8",
    patentTitle: "소프트웨어 저작권",
    seller: "윤서연",
    price: "3,200만원",
    status: "판매중",
    category: "저작권",
    description: "혁신적인 소프트웨어 알고리즘과 프로그램으로 특정 기능을 수행하는 저작권입니다.",
    createdAt: "2023-12-30",
    views: 123,
    inquiries: 9
  }
];

export default function TradingPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [sortBy, setSortBy] = useState("최신순");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = ["전체", "물건발명", "방법발명", "용도발명", "디자인권", "상표권", "저작권", "기타"];
  const statuses = ["전체", "판매중", "거래진행중", "거래완료"];

  const filteredTrades = mockTrades.filter(trade => {
    const matchesCategory = selectedCategory === "전체" || trade.category === selectedCategory;
    const matchesStatus = selectedStatus === "전체" || trade.status === selectedStatus;
    return matchesCategory && matchesStatus;
  });

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    switch (sortBy) {
      case "최신순":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "오래된순":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "가격높은순":
        return parseInt(b.price.replace(/[^0-9]/g, "")) - parseInt(a.price.replace(/[^0-9]/g, ""));
      case "가격낮은순":
        return parseInt(a.price.replace(/[^0-9]/g, "")) - parseInt(b.price.replace(/[^0-9]/g, ""));
      case "조회수순":
        return b.views - a.views;
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "판매중":
        return "bg-green-100 text-green-800";
      case "거래진행중":
        return "bg-yellow-100 text-yellow-800";
      case "거래완료":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a4fa2] via-[#1a365d] to-[#1a365d]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">거래 중개</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* 필터 옵션 */}
          <div className="mb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">분야</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">정렬</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="최신순">최신순</option>
                  <option value="오래된순">오래된순</option>
                  <option value="가격높은순">가격높은순</option>
                  <option value="가격낮은순">가격낮은순</option>
                  <option value="조회수순">조회수순</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedCategory("전체");
                    setSelectedStatus("전체");
                    setSortBy("최신순");
                  }}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  필터 초기화
                </button>
              </div>
            </div>
          </div>

          {/* 거래 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">총 거래 건수</h3>
              <p className="text-2xl font-bold text-blue-600">{mockTrades.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">판매중</h3>
              <p className="text-2xl font-bold text-green-600">{mockTrades.filter(t => t.status === "판매중").length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800">거래진행중</h3>
              <p className="text-2xl font-bold text-yellow-600">{mockTrades.filter(t => t.status === "거래진행중").length}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-800">거래완료</h3>
              <p className="text-2xl font-bold text-gray-600">{mockTrades.filter(t => t.status === "거래완료").length}</p>
            </div>
          </div>

          {/* 거래 목록 */}
          <div className="mb-4">
            <p className="text-gray-600">
              검색 결과: <span className="font-semibold">{sortedTrades.length}</span>건
            </p>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTrades.map((trade) => (
                <div key={trade.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        <a href={`/patents/${trade.id}`} className="hover:text-blue-600 transition-colors">
                          {trade.patentTitle}
                        </a>
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">판매자: {trade.seller}</p>
                      <p className="text-sm text-gray-600 mb-3">분야: {trade.category}</p>
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">{trade.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trade.status)}`}>
                      {trade.status}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600">{trade.price}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                    <span>조회수: {trade.views}</span>
                    <span>문의: {trade.inquiries}</span>
                    <span>{trade.createdAt}</span>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                      상세보기
                    </button>
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      문의하기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTrades.map((trade) => (
                <div key={trade.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        <a href={`/patents/${trade.id}`} className="hover:text-blue-600 transition-colors">
                          {trade.patentTitle}
                        </a>
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <span>판매자: {trade.seller}</span>
                        <span>분야: {trade.category}</span>
                        <span>등록일: {trade.createdAt}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-4">{trade.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium mb-2 ${getStatusColor(trade.status)}`}>
                        {trade.status}
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-2">{trade.price}</div>
                      <div className="text-xs text-gray-500">
                        <div>조회수: {trade.views}</div>
                        <div>문의: {trade.inquiries}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      상세보기
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      문의하기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sortedTrades.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
              <p className="text-gray-400 mt-2">다른 조건으로 검색해 보세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
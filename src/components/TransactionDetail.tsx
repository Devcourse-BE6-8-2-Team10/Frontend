'use client';

import React, { useState, useEffect } from 'react';
import { transactionAPI, TransactionDetail as TransactionDetailType } from '@/utils/apiClient';
import { useAuth } from '@/contexts/AuthContext';

interface TransactionDetailProps {
  transactionId: string;
  onBack: () => void;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({ transactionId, onBack }) => {
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<TransactionDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'messages' | 'payments'>('overview');

  const fetchTransactionDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const detail = await transactionAPI.getTransactionDetail(transactionId);
      setTransaction(detail);
    } catch (err) {
      setError('거래 상세 정보를 불러오는데 실패했습니다.');
      console.error('Failed to fetch transaction detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionDetail();
  }, [transactionId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    const statusMap = {
      'PENDING': '대기중',
      'IN_PROGRESS': '진행중',
      'COMPLETED': '완료',
      'CANCELLED': '취소',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
    };
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  const getDocumentTypeLabel = (type: string) => {
    const typeMap = {
      'CONTRACT': '계약서',
      'PATENT_DOCUMENT': '특허 문서',
      'PAYMENT_PROOF': '결제 증빙',
      'OTHER': '기타',
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  if (loading) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">거래 상세 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <div className="text-center text-red-600">
          <p>{error || '거래 정보를 찾을 수 없습니다.'}</p>
          <button 
            onClick={onBack}
            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
        >
          <span>←</span>
          <span>목록으로</span>
        </button>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
          {getStatusLabel(transaction.status)}
        </span>
      </div>

      {/* Transaction Info */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center">
            <span className="text-2xl">{transaction.patentIcon}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1a365d] mb-2">{transaction.patentTitle}</h2>
            <p className="text-gray-600 text-sm">
              거래 금액: <span className="font-bold text-[#1a365d]">₩{formatPrice(transaction.price)}</span>
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">거래 유형</p>
            <p className="font-medium">{transaction.buyerId === user?.id ? '구매' : '판매'}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">거래 상대</p>
            <p className="font-medium">
              {transaction.buyerId === user?.id ? transaction.sellerName : transaction.buyerName}
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">거래 시작일</p>
            <p className="font-medium">{formatDate(transaction.createdAt)}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">최종 업데이트</p>
            <p className="font-medium">{formatDate(transaction.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          {[
            { id: 'overview', label: '개요', icon: '📋' },
            { id: 'documents', label: '문서', icon: '📄' },
            { id: 'messages', label: '메시지', icon: '💬' },
            { id: 'payments', label: '결제', icon: '💰' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-bold text-[#1a365d] mb-4">거래 개요</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{transaction.description}</p>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <h3 className="text-lg font-bold text-[#1a365d] mb-4">관련 문서</h3>
            {transaction.documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📄</div>
                <p>등록된 문서가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transaction.documents.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center">
                        <span className="text-blue-600">📄</span>
                      </div>
                      <div>
                        <p className="font-medium text-[#1a365d]">{doc.name}</p>
                        <p className="text-sm text-gray-600">
                          {getDocumentTypeLabel(doc.type)} • {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    >
                      다운로드
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <h3 className="text-lg font-bold text-[#1a365d] mb-4">거래 메시지</h3>
            {transaction.messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">💬</div>
                <p>거래 관련 메시지가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transaction.messages.map((message) => (
                  <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-[#1a365d]">{message.senderName}</span>
                      <span className="text-sm text-gray-500">{formatDate(message.createdAt)}</span>
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <h3 className="text-lg font-bold text-[#1a365d] mb-4">결제 내역</h3>
            {transaction.paymentHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">💰</div>
                <p>결제 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transaction.paymentHistory.map((payment) => (
                  <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#1a365d]">₩{formatPrice(payment.amount)}</p>
                        <p className="text-sm text-gray-600">{payment.method}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.status === 'COMPLETED' ? '완료' :
                           payment.status === 'PENDING' ? '대기중' : '실패'}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(payment.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionDetail; 
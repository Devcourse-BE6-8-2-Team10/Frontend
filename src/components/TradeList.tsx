'use client';

import React, { useState, useEffect } from "react";
import { tradeAPI, postAPI, userAPI, Trade, PostDetail, UserInfo } from "@/utils/apiClient";

interface TradeListProps {
  onTradeSelect: (trade: Trade) => void;
}

export default function TradeList({ onTradeSelect }: TradeListProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [tradeDetails, setTradeDetails] = useState<{[key: number]: {post: PostDetail, seller: UserInfo, buyer: UserInfo}}>({});

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const response = await tradeAPI.getMyTrades(0, 20);
      setTrades(response.data.content);
      
      // 각 거래에 대한 상세 정보 가져오기
      const details: {[key: number]: {post: PostDetail, seller: UserInfo, buyer: UserInfo}} = {};
      
      for (const trade of response.data.content) {
        try {
          const [postResponse, sellerResponse, buyerResponse] = await Promise.all([
            postAPI.getPostDetail(trade.postId),
            userAPI.getUserInfo(trade.sellerId),
            userAPI.getUserInfo(trade.buyerId)
          ]);
          
          details[trade.id] = {
            post: postResponse.data,
            seller: sellerResponse.data,
            buyer: buyerResponse.data
          };
        } catch (error) {
          console.error(`거래 ${trade.id} 상세 정보 조회 실패:`, error);
        }
      }
      
      setTradeDetails(details);
    } catch (error) {
      console.error('거래 내역 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">거래 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-bold text-[#1a365d] mb-4">거래 내역</h3>
      
      {trades.length > 0 ? (
        <div className="space-y-4">
          {trades.map((trade) => {
            const detail = tradeDetails[trade.id];
            return (
              <div 
                key={trade.id} 
                className="border border-gray-200 rounded-xl p-4 bg-white/50 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onTradeSelect(trade)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-[#1a365d] text-sm">
                      {detail?.post?.title || `게시글 ${trade.postId}`}
                    </h4>
                    <p className="text-gray-600 text-xs">
                      판매자: {detail?.seller?.name || `사용자 ${trade.sellerId}`}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    trade.status === 'COMPLETED' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {trade.status === 'COMPLETED' ? '구매완료' : trade.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base text-[#1a365d]">
                    ₩{trade.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(trade.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📦</div>
          <p className="text-gray-600">거래 내역이 없습니다.</p>
          <p className="text-gray-500 text-sm mt-1">특허를 구매해보세요!</p>
        </div>
      )}
    </div>
  );
} 
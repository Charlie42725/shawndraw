'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { UserWithStats, CommissionWithNames, DownlineUser } from '@/lib/types';

export default function Dashboard() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserWithStats | null>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [downline, setDownline] = useState<DownlineUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 取得使用者資訊
      const userRes = await fetch(`/api/users/${userId}`);
      const userData = await userRes.json();
      setUser(userData.user);

      // 取得分潤紀錄
      const commRes = await fetch(`/api/users/${userId}/commissions`);
      const commData = await commRes.json();
      setCommissions(commData.commissions || []);

      // 取得下線
      const downRes = await fetch(`/api/users/${userId}/downline`);
      const downData = await downRes.json();
      setDownline(downData.downline || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">載入中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-gray-600 mb-4">找不到此會員</div>
          <Link href="/" className="text-indigo-600 hover:underline">
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  const levelColors = {
    1: 'bg-green-200 text-green-900 border border-green-400',
    2: 'bg-blue-200 text-blue-900 border border-blue-400',
    3: 'bg-purple-200 text-purple-900 border border-purple-400',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 返回按鈕 */}
        <Link
          href="/"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
        >
          ← 返回首頁
        </Link>

        {/* 會員資訊卡片 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <p className="text-gray-600">會員 ID: {user.id}</p>
              {user.referrer_name && (
                <p className="text-gray-600">推薦人: {user.referrer_name}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">總分潤收入</p>
              <p className="text-4xl font-bold text-green-600">
                NT$ {user.total_commission?.toLocaleString() || 0}
              </p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-indigo-100 rounded-lg p-4 text-center border-2 border-indigo-300">
              <p className="text-sm text-gray-900 mb-1 font-bold">直接下線</p>
              <p className="text-2xl font-bold text-indigo-700">{user.downline_count || 0}</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-4 text-center border-2 border-blue-300">
              <p className="text-sm text-gray-900 mb-1 font-bold">總下線（三代）</p>
              <p className="text-2xl font-bold text-blue-700">{downline.length}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-4 text-center border-2 border-green-300">
              <p className="text-sm text-gray-900 mb-1 font-bold">分潤紀錄</p>
              <p className="text-2xl font-bold text-green-700">{commissions.length}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 分潤紀錄 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">💰 分潤紀錄</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {commissions.length === 0 ? (
                <p className="text-gray-600 text-center py-8 font-medium">尚無分潤紀錄</p>
              ) : (
                commissions.map((comm: any) => (
                  <div
                    key={comm.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          🎁 {comm.prize?.prize_name || '未知獎項'}
                        </p>
                        <p className="text-sm text-gray-700 font-medium">
                          中獎者: {comm.winner?.name || `ID ${comm.winner_id}`}
                        </p>
                        <p className="text-sm text-gray-700">
                          {new Date(comm.created_at).toLocaleString('zh-TW')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${levelColors[comm.level as keyof typeof levelColors]}`}>
                        第 {comm.level} 代
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      + NT$ {comm.amount.toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 下線名單 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">👥 我的下線（三代）</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {downline.length === 0 ? (
                <p className="text-gray-600 text-center py-8 font-medium">尚無下線</p>
              ) : (
                downline.map((down) => (
                  <Link
                    key={down.id}
                    href={`/dashboard/${down.id}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:bg-indigo-50 hover:border-indigo-300 transition"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">{down.name}</p>
                        <p className="text-sm text-gray-700 font-medium">
                          ID: {down.id} • 加入於 {new Date(down.created_at).toLocaleDateString('zh-TW')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${levelColors[down.level as keyof typeof levelColors]}`}>
                        第 {down.level} 代
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 分潤說明 */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📊 分潤制度說明</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-100 rounded-lg p-4 border-2 border-green-300">
              <p className="text-lg font-bold text-green-900 mb-2">第一代 (直接下線)</p>
              <p className="text-3xl font-bold text-green-700">NT$ 150</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-4 border-2 border-blue-300">
              <p className="text-lg font-bold text-blue-900 mb-2">第二代</p>
              <p className="text-3xl font-bold text-blue-700">NT$ 100</p>
            </div>
            <div className="bg-purple-100 rounded-lg p-4 border-2 border-purple-300">
              <p className="text-lg font-bold text-purple-900 mb-2">第三代</p>
              <p className="text-3xl font-bold text-purple-700">NT$ 50</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

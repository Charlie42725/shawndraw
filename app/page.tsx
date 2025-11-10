'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [name, setName] = useState('');
  const [referrerId, setReferrerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          referrer_id: referrerId === '' ? null : referrerId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ 註冊成功！歡迎 ${data.user.name}，您的會員 ID 是 ${data.user.id}`);
        setName('');
        setReferrerId('');
      } else {
        setMessage(`❌ 錯誤：${data.error}`);
      }
    } catch (error) {
      setMessage('❌ 註冊失敗，請稍後再試');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            抽爆拉布布
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">中獎後自動分潤 - 第一代 NT$150、第二代 NT$100、第三代 NT$50</p>
        </div>

        {/* 註冊表單 */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">📝 新會員註冊</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                會員名稱 *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="請輸入您的名稱"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                推薦人 ID（選填）
              </label>
              <input
                type="text"
                value={referrerId}
                onChange={(e) => setReferrerId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="請輸入推薦人的會員 ID（8碼）"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? '註冊中...' : '立即註冊'}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-4 rounded-lg font-semibold ${message.includes('成功') ? 'bg-green-100 text-green-900 border border-green-400' : 'bg-red-100 text-red-900 border border-red-400'}`}>
              {message}
            </div>
          )}
        </div>

        {/* 說明區塊 */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">💰 分潤制度說明</h3>
          <div className="space-y-3 mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-gray-800 font-medium">當您的下線會員中獎時，系統將自動追溯三代上線並發放分潤：</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-green-100 rounded-lg p-3 sm:p-4 text-center border-2 border-green-300">
                <p className="text-xs sm:text-sm font-bold text-green-900 mb-1">第一代 (直接下線)</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-700">NT$ 150</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3 sm:p-4 text-center border-2 border-blue-300">
                <p className="text-xs sm:text-sm font-bold text-blue-900 mb-1">第二代</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-700">NT$ 100</p>
              </div>
              <div className="bg-purple-100 rounded-lg p-3 sm:p-4 text-center border-2 border-purple-300">
                <p className="text-xs sm:text-sm font-bold text-purple-900 mb-1">第三代</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-700">NT$ 50</p>
              </div>
            </div>
          </div>
          <div className="bg-indigo-100 rounded-lg p-3 sm:p-4 border border-indigo-300">
            <p className="text-xs sm:text-sm text-indigo-950 font-medium">
              💡 <strong>提示：</strong>註冊成功後，請記住您的會員 ID。若您中獎，請聯絡總代理提供資訊，系統將自動為您的上線發放分潤。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

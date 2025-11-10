'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalCommissions: number;
  todayUsers: number;
  todayCommissions: number;
}

interface User {
  id: string;
  name: string;
  referrer_id: string | null;
  created_at: string;
  referrer?: { name: string };
}

interface Prize {
  id: number;
  winner_id: string;
  prize_name: string;
  created_at: string;
  winner?: { id: string; name: string };
}

interface Commission {
  id: number;
  user_id: string;
  prize_id: number;
  winner_id: string;
  level: number;
  amount: number;
  created_at: string;
  user?: { id: string; name: string };
  winner?: { id: string; name: string };
  prize?: { prize_name: string };
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [activeTab, setActiveTab] = useState<'register' | 'users' | 'prizes' | 'commissions'>('register');
  const [loading, setLoading] = useState(true);

  // Prize registration form
  const [winnerId, setWinnerId] = useState('');
  const [prizeName, setPrizeName] = useState<'組合A' | '組合B'>('組合A');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerMessage, setRegisterMessage] = useState('');

  // User management
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editReferrerId, setEditReferrerId] = useState<string>('');
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  const [addName, setAddName] = useState('');
  const [addReferrerId, setAddReferrerId] = useState<string>('');
  const [addLoading, setAddLoading] = useState(false);
  const [addMessage, setAddMessage] = useState('');

  const levelColors = {
    1: 'bg-green-200 text-green-900 border border-green-400',
    2: 'bg-blue-200 text-blue-900 border border-blue-400',
    3: 'bg-purple-200 text-purple-900 border border-purple-400',
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 取得統計資訊
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setStats(statsData.stats);

      // 取得所有使用者
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      setUsers(usersData.users || []);

      // 取得所有中獎紀錄
      const prizesRes = await fetch('/api/prizes');
      const prizesData = await prizesRes.json();
      setPrizes(prizesData.prizes || []);

      // 取得所有分潤紀錄
      const commRes = await fetch('/api/admin/commissions?limit=100');
      const commData = await commRes.json();
      setCommissions(commData.commissions || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterMessage('');

    try {
      const res = await fetch('/api/prizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winner_id: winnerId,
          prize_name: prizeName,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setRegisterMessage(`✅ ${data.message}`);
        setWinnerId('');
        setPrizeName('組合A');
        fetchData(); // 重新載入資料
      } else {
        setRegisterMessage(`❌ 錯誤：${data.error}`);
      }
    } catch (error) {
      setRegisterMessage('❌ 登記失敗，請稍後再試');
      console.error('Error:', error);
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditReferrerId(user.referrer_id?.toString() || '');
    setShowEditModal(true);
    setEditMessage('');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setEditLoading(true);
    setEditMessage('');

    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          referrer_id: editReferrerId === '' ? null : editReferrerId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setEditMessage(`✅ ${data.message}`);
        fetchData();
        setTimeout(() => {
          setShowEditModal(false);
          setEditingUser(null);
        }, 1500);
      } else {
        setEditMessage(`❌ 錯誤：${data.error}`);
      }
    } catch (error) {
      setEditMessage('❌ 更新失敗，請稍後再試');
      console.error('Error:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddMessage('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addName,
          referrer_id: addReferrerId === '' ? null : addReferrerId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setAddMessage(`✅ ${data.message}`);
        setAddName('');
        setAddReferrerId('');
        fetchData();
        setTimeout(() => {
          setShowAddModal(false);
        }, 1500);
      } else {
        setAddMessage(`❌ 錯誤：${data.error}`);
      }
    } catch (error) {
      setAddMessage('❌ 新增失敗，請稍後再試');
      console.error('Error:', error);
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`確定要刪除會員「${userName}」嗎？\n\n⚠️ 此操作將同時刪除該會員的所有中獎和分潤紀錄！`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ ${data.message}`);
        fetchData();
      } else {
        alert(`❌ 錯誤：${data.error}`);
      }
    } catch (error) {
      alert('❌ 刪除失敗，請稍後再試');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 頁首 */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">🔧 後台管理系統</h1>
          <Link
            href="/"
            className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition text-center text-sm sm:text-base"
          >
            返回前台
          </Link>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-700 font-semibold mb-1 sm:mb-2">總會員數</p>
            <p className="text-2xl sm:text-4xl font-bold text-indigo-600">{stats?.totalUsers || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-700 font-semibold mb-1 sm:mb-2">總分潤金額</p>
            <p className="text-xl sm:text-3xl font-bold text-green-600">
              NT$ {stats?.totalCommissions.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-700 font-semibold mb-1 sm:mb-2">中獎次數</p>
            <p className="text-2xl sm:text-4xl font-bold text-yellow-600">{prizes.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-700 font-semibold mb-1 sm:mb-2">分潤紀錄數</p>
            <p className="text-2xl sm:text-4xl font-bold text-purple-600">{commissions.length}</p>
          </div>
        </div>

        {/* 分頁選單 */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('register')}
                className={`px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold transition whitespace-nowrap ${
                  activeTab === 'register'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🎁 登記中獎
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold transition whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                👥 會員 ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('prizes')}
                className={`px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold transition whitespace-nowrap ${
                  activeTab === 'prizes'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🏆 中獎 ({prizes.length})
              </button>
              <button
                onClick={() => setActiveTab('commissions')}
                className={`px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold transition whitespace-nowrap ${
                  activeTab === 'commissions'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                💰 分潤 ({commissions.length})
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'register' && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">🎁 登記會員中獎</h2>
                <form onSubmit={handlePrizeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      中獎者會員 ID *
                    </label>
                    <input
                      type="text"
                      value={winnerId}
                      onChange={(e) => setWinnerId(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="請輸入中獎者的會員 ID（8碼）"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      獎項名稱 *
                    </label>
                    <select
                      value={prizeName}
                      onChange={(e) => setPrizeName(e.target.value as '組合A' | '組合B')}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="組合A">組合A</option>
                      <option value="組合B">組合B</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {registerLoading ? '登記中...' : '確認登記並自動發放分潤'}
                  </button>
                </form>

                {registerMessage && (
                  <div className={`mt-4 p-4 rounded-lg font-semibold ${registerMessage.includes('成功') ? 'bg-green-100 text-green-900 border border-green-400' : 'bg-red-100 text-red-900 border border-red-400'}`}>
                    {registerMessage}
                  </div>
                )}

                <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-950 font-medium">
                    💡 <strong>提示：</strong>登記中獎後，系統將自動追溯中獎者的上三代推薦人，並依序發放 NT$150、NT$100、NT$50 的分潤。
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">會員列表</h2>
                  <button
                    onClick={() => {
                      setShowAddModal(true);
                      setAddMessage('');
                    }}
                    className="bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition text-sm sm:text-base"
                  >
                    ➕ 新增會員
                  </button>
                </div>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">ID</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">會員名稱</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">推薦人</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">註冊時間</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">{user.id}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">{user.name}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-700 font-medium text-xs sm:text-sm">
                          {user.referrer?.name || '無'}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs text-gray-700">
                          {new Date(user.created_at).toLocaleString('zh-TW')}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <div className="flex gap-1 sm:gap-2 flex-wrap">
                            <Link
                              href={`/dashboard/${user.id}`}
                              className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs sm:text-sm"
                            >
                              查看
                            </Link>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-xs sm:text-sm"
                            >
                              編輯
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="text-red-600 hover:text-red-800 font-semibold text-xs sm:text-sm"
                            >
                              刪除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </div>
            )}

            {activeTab === 'prizes' && (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[540px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">ID</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">中獎者</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">獎項名稱</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">中獎時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prizes.map((prize) => (
                      <tr key={prize.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">{prize.id}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <Link
                            href={`/dashboard/${prize.winner_id}`}
                            className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs sm:text-sm"
                          >
                            {prize.winner?.name || `ID ${prize.winner_id}`}
                          </Link>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <span className="inline-block px-2 sm:px-3 py-1 bg-yellow-200 text-yellow-900 rounded-full font-semibold border border-yellow-400 text-xs sm:text-sm">
                            🎁 {prize.prize_name}
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs text-gray-700">
                          {new Date(prize.created_at).toLocaleString('zh-TW')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'commissions' && (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">ID</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">收入者</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">中獎者</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">獎項</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">代數</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">金額</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((comm) => (
                      <tr key={comm.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">{comm.id}</td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <Link
                            href={`/dashboard/${comm.user_id}`}
                            className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs sm:text-sm"
                          >
                            {comm.user?.name || `ID ${comm.user_id}`}
                          </Link>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <Link
                            href={`/dashboard/${comm.winner_id}`}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-xs sm:text-sm"
                          >
                            {comm.winner?.name || `ID ${comm.winner_id}`}
                          </Link>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-800 font-medium text-xs sm:text-sm">
                          {comm.prize?.prize_name || '-'}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${levelColors[comm.level as keyof typeof levelColors]}`}>
                            第 {comm.level} 代
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 font-bold text-green-700 text-xs sm:text-sm">
                          NT$ {comm.amount.toLocaleString()}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs text-gray-700">
                          {new Date(comm.created_at).toLocaleString('zh-TW')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 編輯會員彈窗 */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">編輯會員資料</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    會員 ID
                  </label>
                  <input
                    type="text"
                    value={editingUser.id}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    會員名稱 *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    推薦人 ID（選填）
                  </label>
                  <select
                    value={editReferrerId}
                    onChange={(e) => setEditReferrerId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">無推薦人</option>
                    {users
                      .filter((u) => u.id !== editingUser.id)
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} (ID: {user.id})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {editLoading ? '更新中...' : '確認更新'}
                  </button>
                </div>
              </form>

              {editMessage && (
                <div className={`mt-4 p-3 rounded-lg text-sm font-semibold ${editMessage.includes('成功') ? 'bg-green-100 text-green-900 border border-green-400' : 'bg-red-100 text-red-900 border border-red-400'}`}>
                  {editMessage}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 新增會員彈窗 */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">新增會員</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setAddName('');
                    setAddReferrerId('');
                    setAddMessage('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    會員名稱 *
                  </label>
                  <input
                    type="text"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="請輸入會員名稱"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    推薦人（選填）
                  </label>
                  <select
                    value={addReferrerId}
                    onChange={(e) => setAddReferrerId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">無推薦人</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} (ID: {user.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setAddName('');
                      setAddReferrerId('');
                      setAddMessage('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {addLoading ? '新增中...' : '確認新增'}
                  </button>
                </div>
              </form>

              {addMessage && (
                <div className={`mt-4 p-3 rounded-lg text-sm font-semibold ${addMessage.includes('成功') ? 'bg-green-100 text-green-900 border border-green-400' : 'bg-red-100 text-red-900 border border-red-400'}`}>
                  {addMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

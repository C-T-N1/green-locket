'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import {
  Users,
  Search,
  UserPlus,
  UserCheck,
  MessageCircle,
  Clock,
  Sparkles,
  School,
  Trophy,
  ArrowLeft
} from 'lucide-react';


export default function Friends({ onNavigate, onNavigateToChat }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [friendships, setFriendships] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);


  const loadGlobalDirectory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);


      // Tải tất cả profiles ngoại trừ bản thân
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .order('eco_points', { ascending: false });


      const { data: friendshipsData } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);


      if (profilesData) setUsersList(profilesData);
      if (friendshipsData) setFriendships(friendshipsData);
    } catch (err) {
      console.error('Lỗi khi tải bạn bè:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadGlobalDirectory();
  }, []);


  const handleSendRequest = async (targetUserId) => {
    if (!currentUser) return;
    setFriendships((prev) => [...prev, { id: 'temp-' + Date.now(), user_id: currentUser.id, friend_id: targetUserId, status: 'pending' }]);
    await supabase.from('friendships').insert([{ user_id: currentUser.id, friend_id: targetUserId, status: 'pending' }]);
    loadGlobalDirectory();
  };


  const handleAcceptRequest = async (friendshipId) => {
    setFriendships((prev) => prev.map((f) => (f.id === friendshipId ? { ...f, status: 'accepted' } : f)));
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
    loadGlobalDirectory();
  };


  const filteredUsers = usersList.filter((u) => {
    const name = u.full_name || u.email || '';
    const school = u.school_name || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || school.toLowerCase().includes(searchTerm.toLowerCase());
  });


  return (
    <div className="h-full w-full bg-linear-to-br from-[#c2ede1] via-[#d7ede6] to-[#e8f5f1] p-4 text-slate-800 flex flex-col space-y-3 overflow-y-auto font-sans">
     
      {/* Header Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-300/60 shrink-0">
        <button
          onClick={() => onNavigate && onNavigate('camera')}
          className="p-2 bg-white/80 backdrop-blur border border-white/80 rounded-2xl shadow-sm hover:bg-white transition-all text-slate-800 flex items-center gap-1 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Máy ảnh
        </button>


        <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-emerald-700" /> Bạn Bè Global
        </h2>
        <div className="w-16" />
      </div>


      {/* Tìm kiếm viên thuốc */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Tìm sinh viên theo tên hoặc trường..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/90 border border-white text-slate-800 text-xs pl-9 pr-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-slate-400 shadow-sm"
        />
      </div>


      {/* Danh sách người dùng Pastel Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-2">
          <Sparkles className="w-7 h-7 text-emerald-600 animate-spin" />
          <p className="text-xs font-medium">Đang tải danh sách kết nối...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <p className="text-xs text-center text-slate-500 py-8">Không tìm thấy sinh viên phù hợp</p>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user) => {
            const relationship = friendships.find(
              (f) => (f.user_id === currentUser?.id && f.friend_id === user.id) || (f.friend_id === currentUser?.id && f.user_id === user.id)
            );
            const isAccepted = relationship?.status === 'accepted';
            const isPendingSent = relationship?.status === 'pending' && relationship.user_id === currentUser?.id;
            const isPendingReceived = relationship?.status === 'pending' && relationship.friend_id === currentUser?.id;


            // Xử lý lấy tên hiển thị ưu tiên: full_name -> email -> fallback
            const displayName = user.full_name || (user.email ? user.email.split('@')[0] : 'Sinh Viên Xanh');
            const displaySchool = user.school_name || 'Đại Học Xanh';


            return (
              <div key={user.id} className="bg-white/95 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between shadow-sm border border-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-extrabold text-xs border border-purple-200">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{displayName}</h3>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <School className="w-3 h-3 text-slate-400" /> {displaySchool}
                    </p>
                    <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-500" /> {user.eco_points || user.points || 0} pts
                    </p>
                  </div>
                </div>


                <div>
                  {isAccepted ? (
                    <button
                      onClick={() => onNavigateToChat && onNavigateToChat(user)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full text-xs flex items-center gap-1 shadow-sm transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Chat
                    </button>
                  ) : isPendingSent ? (
                    <button disabled className="px-3 py-1.5 bg-slate-100 text-slate-400 font-medium rounded-full text-xs flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Đã gửi
                    </button>
                  ) : isPendingReceived ? (
                    <button
                      onClick={() => handleAcceptRequest(relationship.id)}
                      className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-full text-xs flex items-center gap-1 shadow-sm animate-pulse"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Đồng ý
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(user.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-emerald-700 font-bold rounded-full text-xs flex items-center gap-1 border border-emerald-200 transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Kết bạn
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

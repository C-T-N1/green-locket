'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import {
  Newspaper,
  Heart,
  Sparkles,
  Sprout,
  RefreshCw,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowLeft,
  Users
} from 'lucide-react';


export default function Feed({ onNavigate }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);


  const [showCalendar, setShowCalendar] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());


  const fetchPostsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);


      let { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (full_name, school_name, avatar_url, points, eco_points),
          reactions (id, user_id)
        `)
        .order('created_at', { ascending: false });


      if (error) {
        const fallbackRes = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });
        data = fallbackRes.data || [];
      }


      if (data) setPosts(data);
    } catch (err) {
      console.error('❌ Lỗi khi tải bảng tin:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchPostsData();
  }, []);


  const handleRefresh = () => {
    setRefreshing(true);
    fetchPostsData();
  };


  const handleToggleHeart = async (postId, reactionsList) => {
    if (!currentUser) return;
    const existingReaction = reactionsList?.find((r) => r.user_id === currentUser.id);


    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const updatedReactions = existingReaction
            ? (post.reactions || []).filter((r) => r.user_id !== currentUser.id)
            : [...(post.reactions || []), { id: Math.random().toString(), user_id: currentUser.id }];
          return { ...post, reactions: updatedReactions };
        }
        return post;
      })
    );


    try {
      if (existingReaction) {
        await supabase.from('reactions').delete().eq('id', existingReaction.id);
      } else {
        await supabase.from('reactions').insert([{ post_id: postId, user_id: currentUser.id }]);
      }
    } catch (err) {
      console.error('Lỗi khi thả tim:', err);
    }
  };


  // Logic Lịch
  const userPostsByDate = useMemo(() => {
    const map = {};
    if (!currentUser) return map;
    posts.forEach((post) => {
      if (post.user_id === currentUser.id && post.created_at) {
        const d = new Date(post.created_at);
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (!map[dateKey]) map[dateKey] = post.image_url;
      }
    });
    return map;
  }, [posts, currentUser]);


  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();


  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startingDay = firstDay.getDay() - 1;
    if (startingDay === -1) startingDay = 6;


    const days = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [year, month]);


  return (
    <div className="h-full w-full bg-gradient-to-br from-[#c2ede1] via-[#d7ede6] to-[#e8f5f1] p-4 text-slate-800 flex flex-col space-y-3 overflow-y-auto font-sans">
     
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-300/60 shrink-0">
        <button
          onClick={() => onNavigate && onNavigate('camera')}
          className="p-2 bg-white/80 backdrop-blur border border-white/80 rounded-2xl shadow-sm hover:bg-white transition-all text-slate-800 flex items-center gap-1 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Máy ảnh
        </button>


        <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
          <Newspaper className="w-4 h-4 text-emerald-700" /> Bảng Tin Nhật Ký Xanh
        </h2>


        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`p-2 rounded-2xl border transition-all ${
              showCalendar ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white/80 border-white/80 text-slate-700'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefresh}
            className={`p-2 bg-white/80 border border-white/80 rounded-2xl text-slate-700 hover:bg-white transition-all ${
              refreshing ? 'animate-spin text-emerald-600' : ''
            }`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>


      {/* Frame Lịch Đăng Bài Pastel */}
      {showCalendar && (
        <div className="bg-white/90 backdrop-blur-md border border-white/80 rounded-3xl p-3.5 space-y-2.5 shadow-sm shrink-0">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
              Lịch Khoảnh Khắc {month + 1}/{year}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-1 hover:bg-slate-100 rounded-lg">
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-1 hover:bg-slate-100 rounded-lg">
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>


          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 uppercase">
            <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
          </div>


          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} className="aspect-square" />;
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const imageUrl = userPostsByDate[dateKey];


              return (
                <div
                  key={`day-${day}`}
                  className={`relative aspect-square rounded-xl overflow-hidden flex items-center justify-center border text-[11px] font-bold transition-all ${
                    imageUrl ? 'border-emerald-500 bg-emerald-50 text-slate-900 shadow-sm' : 'border-slate-200/80 bg-slate-50/50 text-slate-400'
                  }`}
                >
                  {imageUrl ? (
                    <>
                      <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                      <span className="relative z-10 font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{day}</span>
                      <div className="absolute top-0.5 right-0.5 bg-emerald-500 text-white rounded-full p-0.5">
                        <Check className="w-2 h-2 stroke-[3]" />
                      </div>
                    </>
                  ) : (
                    <span>{day}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* Danh Sách Bài Viết Pastel Card */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-2">
          <Sparkles className="w-7 h-7 text-emerald-600 animate-spin" />
          <p className="text-xs font-medium">Đang tải nhật ký xanh...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10 bg-white/80 rounded-3xl p-6 space-y-2 border border-white">
          <Sprout className="w-10 h-10 text-emerald-500 mx-auto" />
          <p className="text-xs font-bold text-slate-700">Chưa có bài đăng nào!</p>
          <p className="text-[11px] text-slate-500">Hãy mở máy ảnh để chia sẻ khoảnh khắc xanh đầu tiên nhé 🌱</p>
        </div>
      ) : (
        posts.map((post) => {
          const isLiked = post.reactions?.some((r) => r.user_id === currentUser?.id);
          const authorName = post.profiles?.full_name || 'Thành viên Xanh';
          const authorSchool = post.profiles?.school_name || 'Đại Học Xanh';


          return (
            <div key={post.id || Math.random()} className="bg-white/95 backdrop-blur-md rounded-3xl p-3.5 space-y-3 shadow-sm border border-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-extrabold text-xs border border-emerald-200">
                  {authorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{authorName}</h3>
                  <p className="text-[10px] text-slate-500">{authorSchool}</p>
                </div>
              </div>


              <div className="rounded-2xl overflow-hidden aspect-square bg-slate-100 border border-slate-100">
                <img src={post.image_url} alt="Eco Post" className="w-full h-full object-cover" />
              </div>


              {post.caption && (
                <p className="text-xs text-slate-800 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100/60">
                  {post.caption}
                </p>
              )}


              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleToggleHeart(post.id, post.reactions)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isLiked ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{post.reactions?.length || 0} Yêu thích</span>
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

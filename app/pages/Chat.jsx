'use client';




import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import {
  Newspaper,
  Heart,
  Sparkles,
  Sprout,
  RefreshCw,
  Calendar,
  User
} from 'lucide-react';




export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);




  // 1. Tải danh sách bài viết (Có chế độ dự phòng chống lỗi CSDL)
  const fetchPostsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);




      // Thử tải bài viết kèm thông tin Profile & Nhiệm vụ
      let { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (full_name, school_name, avatar_url, eco_points),
          daily_tasks (title, points),
          reactions (id, user_id)
        `)
        .order('created_at', { ascending: false });




      // Nếu Supabase báo lỗi liên kết khóa ngoại, tự động fallback lấy danh sách bài đăng thô
      if (error) {
        console.warn('Đang bật chế độ dự phòng cho Bảng tin:', error.message);
        const fallbackRes = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });




        data = fallbackRes.data || [];
      }




      if (data) {
        setPosts(data);
      }
    } catch (err) {
      console.error('Lỗi khi tải bảng tin:', err);
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




  // 2. Thao tác Thả Tim
  const handleToggleHeart = async (postId, reactionsList) => {
    if (!currentUser) return;




    const existingReaction = reactionsList?.find((r) => r.user_id === currentUser.id);




    // Cập nhật UI ngay lập tức
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
        await supabase.from('reactions').insert([
          { post_id: postId, user_id: currentUser.id }
        ]);
      }
    } catch (err) {
      console.error('Lỗi khi thả tim:', err);
    }
  };




  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Vừa xong';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);




    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };




  return (
    <div className="p-4 max-w-md mx-auto space-y-4 pb-28 font-sans text-slate-100">
      {/* Header Bảng Tin */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-base font-extrabold text-emerald-400 flex items-center gap-2">
            <Newspaper className="w-5 h-5" /> Nhật Ký Khoảnh Khắc Xanh
          </h2>
          <p className="text-[11px] text-slate-400">Những hành động sống xanh mới nhất của sinh viên</p>
        </div>




        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 transition-all active:scale-95 ${
            refreshing ? 'animate-spin text-emerald-400' : ''
          }`}
          title="Tải lại trang"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>




      {/* Danh Sách Bài Đăng */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-3">
          <Sparkles className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-xs font-medium">Đang tải nhật ký xanh...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-14 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-lg">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mx-auto flex items-center justify-center text-emerald-400">
            <Sprout className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">Chưa có bài đăng nào!</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Hãy sang tab <span className="text-emerald-400 font-bold">Chụp</span> để đăng bài viết khoảnh khắc xanh đầu tiên nhé 🌱
          </p>
        </div>
      ) : (
        posts.map((post) => {
          const isLiked = post.reactions?.some((r) => r.user_id === currentUser?.id);
          const reactionCount = post.reactions?.length || 0;
          const authorName = post.profiles?.full_name || 'Thành viên Xanh';
          const authorSchool = post.profiles?.school_name || 'Sinh viên trường';
          const taskTitle = post.daily_tasks?.title || 'Hành động xanh';




          return (
            <div
              key={post.id || Math.random()}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl transition-all"
            >
              {/* Header Người Đăng */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-full flex items-center justify-center font-bold text-slate-950 text-sm shadow-md border border-emerald-400/40 shrink-0">
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      {authorName}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {authorSchool} • {formatTimeAgo(post.created_at)}
                    </p>
                  </div>
                </div>
              </div>




              {/* Ảnh Khoảnh Khắc Xanh */}
              <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-950 border border-slate-800 shadow-inner">
                <img
                  src={post.image_url}
                  alt="Khoảnh khắc xanh"
                  className="w-full h-full object-cover"
                />




                <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-lg">
                  <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-bold text-emerald-300">{taskTitle}</span>
                </div>
              </div>




              {/* Chú thích / Cảm nghĩ */}
              {post.caption && (
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-emerald-400 font-semibold mr-1">💬 Cảm nghĩ:</span>
                  {post.caption}
                </p>
              )}




              {/* Nút Thả Tim */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleToggleHeart(post.id, post.reactions)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-90 ${
                    isLiked
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{reactionCount > 0 ? `${reactionCount} Yêu thích` : 'Thả tim'}</span>
                </button>




                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.created_at).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

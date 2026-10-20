'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import CameraView from '../app/pages/CameraView';
import Garden from '../app/pages/Garden';
import Feed from '../app/pages/Feed';
import Friends from '../app/pages/Friends';
import { Sparkles, MessageCircle, Send, ArrowLeft, LogOut } from 'lucide-react';


export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'camera' | 'garden' | 'feed' | 'friends' | 'chat'>('camera');
  const [selectedChatUser, setSelectedChatUser] = useState<any>(null);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });


    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });


    return () => subscription.unsubscribe();
  }, []);


  if (loading) {
    return (
      <div className="h-dvh w-full bg-[#c2ede1] text-slate-800 flex flex-col items-center justify-center p-4">
        <Sparkles className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
        <p className="text-slate-700 text-sm font-bold">Đang tải Green Locket...</p>
      </div>
    );
  }


  if (!session) {
    return <AuthScreen />;
  }


  return (
    <div className="bg-slate-950 min-h-screen flex items-center justify-center sm:py-4">
      <div className="w-full max-w-md h-dvh sm:h-211 sm:max-h-[90vh] sm:rounded-[40px] bg-slate-950 text-slate-100 flex flex-col overflow-hidden relative shadow-2xl sm:border-8 sm:border-slate-800 font-sans antialiased">
        <main className="w-full h-full overflow-y-auto relative">
          {currentPage === 'camera' && (
            <CameraView onNavigate={(page: string) => setCurrentPage(page as any)} />
          )}
          {currentPage === 'garden' && (
            <Garden onNavigate={(page: string) => setCurrentPage(page as any)} />
          )}
          {currentPage === 'feed' && (
            <Feed onNavigate={(page: string) => setCurrentPage(page as any)} />
          )}
          {currentPage === 'friends' && (
            <Friends
              onNavigate={(page: string) => setCurrentPage(page as any)}
              onNavigateToChat={(targetUser: any) => {
                setSelectedChatUser(targetUser);
                setCurrentPage('chat');
              }}
            />
          )}
          {currentPage === 'chat' && (
            <ChatPage
              targetUser={selectedChatUser}
              onNavigate={(page: string) => setCurrentPage(page as any)}
            />
          )}
        </main>
      </div>
    </div>
  );
}


/* ====================================================================
   MÀN HÌNH ĐĂNG NHẬP / ĐĂNG KÝ (PASTEL CANVA)
   ==================================================================== */
function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);


    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              school_name: schoolName,
            },
          },
        });
        if (error) throw error;
        alert('🎉 Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="h-dvh w-full bg-linear-to-br from-[#c2ede1] via-[#dbeafe] to-[#f5d5e0] flex flex-col justify-center items-center p-4 font-sans text-slate-800 overflow-hidden">
      <div className="w-full max-w-xs sm:max-w-sm bg-white/95 backdrop-blur-md rounded-4xl p-6 sm:p-8 shadow-2xl border border-white/80 space-y-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-serif font-extrabold text-slate-900 tracking-tight">
            {isSignUp ? 'Tạo tài khoản' : 'Đăng nhập'}
          </h1>
          <p className="text-[11px] text-slate-600 font-medium">
            {isSignUp ? 'Bắt đầu hành trình sống xanh tại Green Locket 🐝' : 'Chào mừng bạn trở lại Green Locket 🌱'}
          </p>
        </div>


        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}


        <form onSubmit={handleAuth} className="space-y-3">
          {isSignUp && (
            <>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-700 mb-0.5 pl-1">
                  TRƯỜNG CỦA BẠN
                </label>
                <input
                  type="text"
                  placeholder="Chọn đơn vị mà bạn học"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full bg-[#cbdcd5] text-slate-900 text-xs px-3.5 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400/60 placeholder-slate-600 font-medium"
                />
              </div>


              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-700 mb-0.5 pl-1">
                  HỌ VÀ TÊN
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên của bạn"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#cbdcd5] text-slate-900 text-xs px-3.5 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400/60 placeholder-slate-600 font-medium"
                />
              </div>
            </>
          )}


          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-700 mb-0.5 pl-1">
              EMAIL / TÀI KHOẢN
            </label>
            <input
              type="email"
              placeholder="Nhập địa chỉ email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#cbdcd5] text-slate-900 text-xs px-3.5 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400/60 placeholder-slate-600 font-medium"
            />
          </div>


          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-700 mb-0.5 pl-1">
              MẬT KHẨU
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#cbdcd5] text-slate-900 text-xs px-3.5 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400/60 placeholder-slate-600 font-medium"
            />
          </div>


          <div className="pt-2 text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-2.5 bg-[#b5cecd] hover:bg-[#a2c2c0] text-slate-900 font-extrabold uppercase text-xs tracking-wider rounded-full shadow-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Đang xử lý...' : isSignUp ? 'ĐĂNG KÝ NGAY' : 'ĐĂNG NHẬP'}
            </button>
          </div>
        </form>


        <div className="text-center pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
            className="text-[11px] text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            {isSignUp ? (
              <>Đã có tài khoản? <strong className="underline font-bold">Đăng nhập</strong> ngay</>
            ) : (
              <>Chưa có tài khoản? <strong className="underline font-bold">Tạo tài khoản</strong> ngay</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


/* ====================================================================
   MÀN HÌNH CHAT (PASTEL CANVA + SUPABASE MESSAGES)
   ==================================================================== */
function ChatPage({
  targetUser,
  onNavigate,
}: {
  targetUser?: any;
  onNavigate?: (page: string) => void;
}) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeUser, setActiveUser] = useState<any>(targetUser || null);
  const [acceptedFriends, setAcceptedFriends] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);


  // Tải thông tin User hiện tại & Danh sách bạn bè đã chấp nhận kết bạn
  useEffect(() => {
    async function initChat() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUser(user);


        const { data: friendships } = await supabase
          .from('friendships')
          .select('*')
          .eq('status', 'accepted')
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);


        if (friendships && friendships.length > 0) {
          const friendIds = friendships.map((f: any) =>
            f.user_id === user.id ? f.friend_id : f.user_id
          );
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', friendIds);
          if (profiles) setAcceptedFriends(profiles);
        }
      } catch (err) {
        console.error('Lỗi khởi tạo chat:', err);
      } finally {
        setLoading(false);
      }
    }
    initChat();
  }, []);


  useEffect(() => {
    if (targetUser) {
      setActiveUser(targetUser);
    }
  }, [targetUser]);


  // Tải lịch sử tin nhắn từ Supabase
  useEffect(() => {
    if (!currentUser || !activeUser) return;
    async function fetchMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUser.id},receiver_id.eq.${activeUser.id}),and(sender_id.eq.${activeUser.id},receiver_id.eq.${currentUser.id})`
        )
        .order('created_at', { ascending: true });


      if (data && data.length > 0) {
        setMessages(data);
      } else {
        setMessages([
          {
            id: 'welcome-1',
            sender_id: activeUser.id,
            content: `Chào bạn! Rất vui được kết bạn trên Green Locket 🌱. Cùng nhau tích cực hành động xanh nhé!`,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    }
    fetchMessages();
  }, [currentUser, activeUser]);


  // Gửi tin nhắn mới
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser || !activeUser) return;
    const sentText = inputText.trim();
    setInputText('');


    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: currentUser.id,
            receiver_id: activeUser.id,
            content: sentText,
          },
        ])
        .select();


      if (error) {
        console.error('❌ Lỗi Supabase:', error.message);
        alert(`Không thể lưu tin nhắn: ${error.message}`);
        return;
      }


      if (data && data.length > 0) {
        setMessages((prev) => [...prev, data[0]]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: 'temp-' + Date.now(),
            sender_id: currentUser.id,
            receiver_id: activeUser.id,
            content: sentText,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err: any) {
      console.error('Lỗi gửi tin nhắn:', err);
      alert('Có lỗi xảy ra khi kết nối máy chủ!');
    }
  };


  return (
    <div className="h-full w-full bg-linear-to-br from-[#c2ede1] via-[#d7ede6] to-[#e8f5f1] p-3 text-slate-800 flex flex-col justify-between overflow-y-auto font-sans select-none">
     
      {/* HEADER BAR */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-300/60 shrink-0 z-10">
        <button
          onClick={() => {
            if (activeUser && !targetUser) {
              setActiveUser(null);
            } else if (onNavigate) {
              onNavigate('camera');
            }
          }}
          className="px-3 py-1.5 bg-white/85 backdrop-blur-md border border-white rounded-2xl shadow-sm hover:bg-white transition-all text-slate-800 flex items-center gap-1 text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> {activeUser && !targetUser ? 'Danh sách' : 'Máy ảnh'}
        </button>


        <div className="flex items-center gap-2">
          {activeUser ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-black text-xs border border-purple-200 shadow-sm">
                {activeUser.full_name ? activeUser.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-xs font-black text-slate-900 leading-tight">
                  {activeUser.full_name || 'Thành viên Xanh'}
                </h2>
                <span className="text-[9px] text-emerald-700 font-bold block">
                  ● Đang hoạt động
                </span>
              </div>
            </div>
          ) : (
            <h2 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-700" /> Trò Chuyện Xanh
            </h2>
          )}
        </div>


        <button
          onClick={() => supabase.auth.signOut()}
          title="Đăng xuất"
          className="p-2 bg-white/85 backdrop-blur-md border border-white rounded-2xl text-slate-600 hover:text-rose-500 transition-all shadow-sm cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>


      {/* NỘI DUNG MÀN HÌNH CHAT */}
      {!activeUser ? (
        <div className="flex-1 my-3 overflow-y-auto space-y-2">
          <p className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider px-1">
            Bạn bè có thể nhắn tin ({acceptedFriends.length})
          </p>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-2">
              <Sparkles className="w-6 h-6 text-emerald-600 animate-spin" />
              <p className="text-xs font-medium">Đang tải danh sách kết nối...</p>
            </div>
          ) : acceptedFriends.length === 0 ? (
            <div className="text-center py-12 bg-white/80 rounded-3xl p-6 border border-white space-y-2">
              <MessageCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Chưa có cuộc trò chuyện nào!</p>
              <p className="text-[11px] text-slate-500">
                Hãy sang tab{' '}
                <strong
                  className="text-emerald-700 underline cursor-pointer"
                  onClick={() => onNavigate && onNavigate('friends')}
                >
                  Bạn Bè
                </strong>{' '}
                kết bạn và chờ đồng ý để bắt đầu nhắn tin nhé.
              </p>
            </div>
          ) : (
            acceptedFriends.map((friend) => (
              <div
                key={friend.id}
                onClick={() => setActiveUser(friend)}
                className="bg-white/90 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between border border-white shadow-sm hover:bg-white cursor-pointer active:scale-98 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-extrabold text-xs border border-purple-200">
                    {friend.full_name ? friend.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      {friend.full_name || 'Thành viên Xanh'}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      {friend.school_name || 'Đại Học Xanh'}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                  Nhắn tin
                </span>
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          <div className="flex-1 bg-white/80 backdrop-blur-md border border-white rounded-3xl p-3 my-2 overflow-y-auto space-y-2.5 shadow-inner">
            {messages.map((msg) => {
              const isMe = msg.sender_id === currentUser?.id;
              const formattedTime = msg.created_at
                ? new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs shadow-sm ${
                      isMe
                        ? 'bg-emerald-500 text-white font-medium rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1 font-medium">
                    {formattedTime}
                  </span>
                </div>
              );
            })}
          </div>


          <form onSubmit={handleSend} className="flex gap-2 shrink-0 pt-1">
            <input
              type="text"
              placeholder={`Nhắn tin cho ${activeUser.full_name || 'bạn'}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-white/90 border border-white text-slate-900 text-xs px-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-slate-400 shadow-sm"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}

'use client';
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../services/supabase';
import {
  Users, LogOut,
  User,
  Zap,
  ZapOff,
  RefreshCw,
  ChevronDown,
  Calendar,
  Clock,
  MessageCircle,
  Sparkles,
  Image as ImageIcon,
  Send,
  X,
  Target,
  CheckCircle2,
  Award
} from 'lucide-react';


// DANH SÁCH NHIỆM VỤ SỐNG XANH HẰNG NGÀY
const DAILY_MISSIONS = [
  { id: 1, title: 'Dùng bình/ly cá nhân 🥤', desc: 'Chụp hình ly, bình nước cá nhân thay thế ly nhựa 1 lần', points: '+10 Pts', icon: '🥤' },
  { id: 2, title: 'Chăm sóc & Chụp cây 🌿', desc: 'Chụp hình cây xanh quanh bạn, góc sân hoặc khu vườn', points: '+10 Pts', icon: '🌱' },
  { id: 3, title: 'Phân loại / Nhặt rác ♻️', desc: 'Bỏ rác đúng nơi quy định hoặc thu gom phân loại rác', points: '+10 Pts', icon: '♻️' },
  { id: 4, title: 'Di chuyển phương tiện xanh 🚲', desc: 'Đi bộ, xe đạp hoặc phương tiện giao thông công cộng', points: '+10 Pts', icon: '🚲' },
  { id: 5, title: 'Tắt thiết bị điện thừa 💡', desc: 'Tắt quạt, đèn, công tắc không dùng đến', points: '+10 Pts', icon: '💡' },
];


export default function CameraView({ onNavigate }) {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [caption, setCaption] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'user' hoặc 'environment'


  // STATE QUẢN LÝ BẢNG NHIỆM VỤ
  const [showMissionsModal, setShowMissionsModal] = useState(false);


  const videoRef = useRef(null);
  const fileInputRef = useRef(null);


  // 1. Khởi tạo Camera
  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing },
        audio: false,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.warn('Không thể truy cập Camera thiết bị, chuyển sang chế độ tải ảnh:', err);
    }
  };


  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraFacing]);
// HÀM XỬ LÝ ĐĂNG XUẤT
  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất tài khoản?')) {
      try {
        await supabase.auth.signOut();
        if (onNavigate) onNavigate('login');
      } catch (err) {
        console.error('Lỗi khi đăng xuất:', err);
      }
    }
  };
  // Lật Camera
  const handleFlipCamera = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };


  // 2. Chụp ảnh từ Video Stream
  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(dataUrl);
    }
  };


  // Tải ảnh từ thư viện thiết bị
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  // 3. Gửi ảnh lên AI xác minh & Luôn Đăng Bài (Chỉ cộng điểm nếu AI duyệt)
  const handlePublishPost = async () => {
    if (!capturedImage) return;
    setIsVerifying(true);


    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Chưa đăng nhập');


      let verifyData = { isEcoAction: false, reasoning: '' };


      // Gọi API AI Gemini xác minh hành động sống xanh
      try {
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: capturedImage }),
        });
        if (res.ok) {
          verifyData = await res.json();
        }
      } catch (aiErr) {
        console.warn('Không thể kết nối AI verify, vẫn cho phép đăng bài:', aiErr);
      }


      setVerificationResult(verifyData);


      // A. LUÔN ĐĂNG BÀI VÀO BẢNG posts
      const { error: postError } = await supabase.from('posts').insert([
        {
          user_id: user.id,
          image_url: capturedImage,
          caption: caption || verifyData.reasoning || 'Khoảnh khắc sống xanh!',
          is_verified: verifyData.isEcoAction || false,
        },
      ]);


      if (postError) throw postError;


      // B. XỬ LÝ ĐIỂM THƯỞNG THEO KẾT QUẢ AI
      if (verifyData.isEcoAction) {
        // AI duyệt thành công -> Cộng +10 điểm chăm cây
        await supabase.rpc('increment_eco_points', {
          user_uuid: user.id,
          points_to_add: 10,
        });


        alert('🎉 Bài đăng thành công! AI đã xác minh hành động xanh chuẩn xác. Bạn nhận được +10 điểm chăm cây 🌱');
      } else {
        // AI không duyệt -> Vẫn đăng bài nhưng không cộng điểm
        alert(`📸 Đã đăng bài lên Nhật Ký Xanh!\n\n⚠️ AI nhận diện: ${verifyData.reasoning || 'Ảnh chưa thể hiện rõ hành động sống xanh nên lần này chưa cộng điểm thưởng nhé.'}`);
      }


      // Reset form & chuyển hướng sang Bảng tin (Feed)
      setCapturedImage(null);
      setCaption('');
      if (onNavigate) onNavigate('feed');


    } catch (err) {
      console.error('Lỗi đăng bài:', err);
      alert('Có lỗi xảy ra khi đăng bài, vui lòng thử lại!');
    } finally {
      setIsVerifying(false);
    }
  };


  return (
    <div className="min-h-screen bg-linear-to-br from-[#c2ede1] via-[#d7ede6] to-[#e8f5f1] p-4 text-slate-800 flex flex-col justify-between max-w-md mx-auto relative overflow-hidden font-sans select-none">
     
      {/* 1. TOP BAR: NÚT ĐĂNG XUẤT (TRÁI) - FRIENDS (GIỮA) - AVATAR VƯỜN (PHẢI) */}
      <div className="relative flex justify-between items-center z-10 pt-1 w-full min-h-10">
       
        {/* NÚT ĐĂNG XUẤT BÊN TRÁI */}
        <button
          onClick={handleLogout}
          title="Đăng xuất"
          className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full border-2 border-white shadow-sm flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:scale-105 active:scale-95 transition-all cursor-pointer z-10"
        >
          <LogOut className="w-4 h-4 ml-0.5" />
        </button>


        {/* NÚT FRIENDS Ở CHÍNH GIỮA MÀN HÌNH */}
        <button
          onClick={() => onNavigate && onNavigate('friends')}
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 bg-white/80 backdrop-blur-md rounded-full border border-white/80 shadow-sm text-xs font-bold text-slate-800 hover:bg-white transition-all active:scale-95 cursor-pointer z-20"
        >
          <Users className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
          <span>Friends</span>
        </button>


        {/* Nút Avatar -> Mở Vườn Hoa */}
        <button
          onClick={() => onNavigate && onNavigate('garden')}
          title="Vào Khu Vườn"
          className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full border-2 border-white p-0.5 shadow-sm overflow-hidden flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <div className="w-full h-full bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm border border-purple-200">
            <User className="w-5 h-5 text-purple-700" />
          </div>
        </button>
      </div>


      {/* 2. FRAME KHUNG HÌNH CHỤP */}
      <div className="my-auto py-2">
        <div className="w-full bg-white rounded-4xl shadow-xl border border-white/90 overflow-hidden relative aspect-4/5 sm:aspect-square flex flex-col justify-between p-3">
         
          {/* Header bên trong Khung hình (Flash & Zoom) */}
          <div className="flex justify-between items-center z-20">
            <button
              onClick={() => setIsFlashOn(!isFlashOn)}
              className="w-8 h-8 bg-slate-100/80 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-700 hover:bg-white shadow-sm cursor-pointer"
            >
              {isFlashOn ? <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> : <ZapOff className="w-4 h-4" />}
            </button>


            <span className="w-8 h-8 bg-slate-100/80 backdrop-blur-sm rounded-full flex items-center justify-center text-[11px] font-black text-slate-700 shadow-sm">
              1x
            </span>
          </div>


          {/* Màn hình Xem trước Camera hoặc Ảnh đã chụp */}
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-slate-50">
            {capturedImage ? (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            ) : stream ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="text-center p-6 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-400">Khung hình để chụp</p>
                <span className="text-[10px] text-emerald-600 underline font-bold mt-1 block">
                  hoặc bấm để tải ảnh từ máy
                </span>
              </div>
            )}
          </div>


          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />


          {/* Form nhập cảm nghĩ khi đã có ảnh */}
          {capturedImage && (
            <div className="z-20 bg-slate-900/80 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 space-y-2 mt-auto">
              <input
                type="text"
                placeholder="Thêm cảm nghĩ hành động xanh..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-slate-800/90 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-400 placeholder-slate-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setCapturedImage(null)}
                  disabled={isVerifying}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Chụp lại
                </button>
                <button
                  onClick={handlePublishPost}
                  disabled={isVerifying}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl flex items-center justify-center gap-1 shadow-md shadow-emerald-500/30 cursor-pointer active:scale-95 transition-all"
                >
                  {isVerifying ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin text-slate-950" />
                      <span>AI đang duyệt...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Đăng bài
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* 3. NÚT CHỤP HÌNH & LẬT CAMERA */}
      <div className="flex items-center justify-center gap-10 py-2 z-10">
        <div className="w-10 h-10" />
        {/* Nút chụp hình */}
        <button
          onClick={handleCapture}
          className="w-16 h-16 rounded-full border-4 border-[#4d8b76] bg-white shadow-lg active:scale-90 transition-all flex items-center justify-center group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-white group-hover:bg-slate-50 border border-slate-200" />
        </button>


        {/* Nút lật Camera */}
        <button
          onClick={handleFlipCamera}
          className="w-10 h-10 bg-[#a3d8c8] hover:bg-[#8ecbc0] border border-[#8ecbc0] rounded-full flex items-center justify-center text-slate-800 shadow-md active:rotate-180 transition-all cursor-pointer"
        >
          <RefreshCw className="w-5 h-5 text-emerald-900" />
        </button>
      </div>


      {/* 5. BOTTOM DOCK ICON (LỊCH / ĐỒNG HỒ NHIỆM VỤ / CHAT) */}
      <div className="bg-[#b3ded2]/70 backdrop-blur-md rounded-2xl p-1.5 flex justify-around items-center border border-white/60 shadow-sm z-10 max-w-xs mx-auto w-full">
        {/* Nút Lịch -> Mở Lịch khoảnh khắc */}
        <button
          onClick={() => onNavigate && onNavigate('feed')}
          className="p-2 hover:bg-white/60 rounded-xl transition-all text-slate-800 cursor-pointer"
          title="Lịch đăng bài"
        >
          <Calendar className="w-5 h-5 text-slate-800" />
        </button>


        {/* Nút Đồng hồ -> Bảng Nhiệm Vụ Hằng Ngày */}
        <button
          onClick={() => setShowMissionsModal(true)}
          className="p-2 bg-white/90 hover:bg-white rounded-xl shadow-sm text-slate-800 cursor-pointer transition-all active:scale-95"
          title="Nhiệm vụ hằng ngày"
        >
          <Clock className="w-5 h-5 text-slate-800" />
        </button>


        {/* Nút Chat -> Mở Trò chuyện */}
        <button
          onClick={() => onNavigate && onNavigate('chat')}
          className="p-2 hover:bg-white/60 rounded-xl transition-all text-slate-800 cursor-pointer"
          title="Tin nhắn Chat"
        >
          <MessageCircle className="w-5 h-5 text-slate-800" />
        </button>
      </div>


      {/* 🌟 MODAL BẢNG NHIỆM VỤ SỐNG XANH HẰNG NGÀY */}
      {showMissionsModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-slate-900/95 border border-emerald-500/40 rounded-3xl p-5 text-white shadow-2xl flex flex-col max-h-[80vh] font-sans">
           
            {/* Header Modal */}
            <div className="flex justify-between items-center pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-emerald-400 uppercase">NHIỆM VỤ SỐNG XANH</h2>
                  <p className="text-[10px] text-slate-400">Chụp ảnh thực hiện để tích điểm chăm cây</p>
                </div>
              </div>


              <button
                onClick={() => setShowMissionsModal(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>


            {/* Danh sách nhiệm vụ */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 my-1">
              {DAILY_MISSIONS.map((m) => (
                <div
                  key={m.id}
                  className="bg-slate-800/90 border border-white/10 hover:border-emerald-400/50 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl shrink-0">
                    {m.icon}
                  </div>


                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white truncate">{m.title}</p>
                      <span className="text-[9px] bg-amber-400/20 text-amber-300 font-extrabold px-1.5 py-0.5 rounded-full border border-amber-400/30 shrink-0">
                        {m.points}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug truncate">
                      {m.desc}
                    </p>
                  </div>


                  <button
                    onClick={() => setShowMissionsModal(false)}
                    className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black rounded-xl active:scale-95 transition-all shrink-0 cursor-pointer"
                  >
                    Thực hiện
                  </button>
                </div>
              ))}
            </div>


            {/* Footer */}
            <div className="pt-2 border-t border-white/10 text-center shrink-0">
              <p className="text-[10px] text-slate-400">
                💡 Chụp ảnh bất kỳ hành động nào ở trên & AI sẽ tự động duyệt thưởng +10 Pts!
              </p>
            </div>


          </div>
        </div>
      )}


    </div>
  );
}

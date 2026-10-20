'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import {
  Sun, Moon, Sunset, Trophy, Award, CheckCircle2, Gift,
  ShieldCheck, X, Sprout, ArrowLeft, Sparkles, Camera, Check, Share2, FileText
} from 'lucide-react';


// DANH SÁCH 10 BÔNG HOA ĐỘNG (.mp4 / .gif)
const MYSTERY_FLOWERS = [
  { id: 'hoa1', name: 'HOA HƯỚNG DƯƠNG RỰC RỠ 🌻', image: '/assets/hoa1.mp4', desc: 'Luôn hướng về phía ánh mặt trời, tượng trưng cho năng lượng tích cực.' },
  { id: 'hoa2', name: 'HOA HỒNG THẦN THOẠI 🌹', image: '/assets/hoa2.mp4', desc: 'Sắc đỏ thắm kiêu sa, đại diện cho tình yêu thiên nhiên mãnh liệt.' },
  { id: 'hoa3', name: 'HOA TULIP BÌNH MINH 🌷', image: '/assets/hoa3.mp4', desc: 'Thuần khiết, tươi mới và tràn đầy sức sống dịu êm.' },
  { id: 'hoa4', name: 'HOA BÁCH HỢP AN LÀNH 🪻', image: '/assets/hoa4.mp4', desc: 'Vẻ đẹp tinh khôi, tượng trưng cho không gian xanh trong lành.' },
  { id: 'hoa5', name: 'HOA DIÊN VĨ BÍ ẨN 🌺', image: '/assets/hoa5.mp4', desc: 'Sắc tím huyền bí, mang lời hứa bảo vệ Trái Đất xanh.' },
  { id: 'hoa6', name: 'HOA SAO NHÁY DỊU DÀNG 🌸', image: '/assets/hoa6.mp4', desc: 'Cánh hoa mỏng manh nương theo làn gió mát của khu vườn.' },
  { id: 'hoa7', name: 'HOA CÚC HOẠ MI TINH KHÔI 🌼', image: '/assets/hoa7.mp4', desc: 'Đón chào nắng mới với năng lượng thuần khiết nhất.' },
  { id: 'hoa8', name: 'HOA THẠCH THẢO MƠ MỘNG 🪻', image: '/assets/hoa8.mp4', desc: 'Kiên trì đơm bông qua bao ngày tháng chăm sóc.' },
  { id: 'hoa9', name: 'HOA CẨM TÚ CẦU RỰC SẮC 💐', image: '/assets/hoa9.mp4', desc: 'Sự kết nối vẹn tròn giữa con người và thiên nhiên.' },
  { id: 'hoa10', name: 'HOA MẪU ĐƠN HOÀNG GIA 🌸', image: '/assets/hoa10.mp4', desc: 'Bừng nở lộng lẫy, phần thưởng cao quý nhất dành cho bạn!' },
];


// CÂU CHUYỆN & CÁC BƯỚC CHĂM SÓC
const STORY_CHAPTERS = [
  { day: 1, actionName: 'Gieo Hạt Giống Bí Mật', dialogue: 'Cảm ơn bạn đã nhặt mình lên! Hãy gieo mình xuống thảm đất ấm áp này nhé! 🌱', image: '/assets/act-day1.png', icon: '🌱' },
  { day: 2, actionName: 'Xới Đất & Bón Phân', dialogue: 'Đất thơm và giàu dinh dưỡng quá! Nhờ bón phân, rễ mình đang cắm sâu rồi! 🪴', image: '/assets/act-day2.png', icon: '🪴' },
  { day: 3, actionName: 'Tưới Nước Đón Nắng', dialogue: 'Mát quá đi thôi! Những giọt nước mát lành giúp chồi nhỏ vươn cao đón nắng! 💧', image: '/assets/act-day3.png', icon: '💧' },
  { day: 4, actionName: 'Bắt Sâu & Bảo Vệ', dialogue: 'Nhờ bạn chăm sóc bảo vệ, mình lại an toàn vươn lên rồi! 🐛', image: '/assets/act-day4.png', icon: '🐛' },
  { day: 5, actionName: 'Tưới Dưỡng Chất', dialogue: 'Thân cây đã cứng cáp hẳn lên! Một nụ hoa e ấp bí mật đang nhô ra kìa... 🍃', image: '/assets/act-day5.png', icon: '🍃' },
  { day: 6, actionName: 'Đón Nụ Hoa Bí Mật', dialogue: 'Sắp tới giờ G rồi! Bạn có đoán được mình là loài hoa ngạt ngào nào không? ✨', image: '/assets/act-day6.png', icon: '✨' },
  { day: 7, actionName: 'Thu Hoạch Cây Bí Mật', dialogue: 'Ting! Tình yêu thiên nhiên kiên trì của bạn đã đơm hoa! Thu hoạch ngay thôi! 🎁', icon: '🎁' },
];


export default function Garden({ onNavigate }) {
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [profile, setProfile] = useState({ eco_points: 0, real_trees_planted: 0, full_name: '', school_name: '' });
  const [plant, setPlant] = useState({ growth_stage: 1, last_watered_at: null });
  const [hasPostedToday, setHasPostedToday] = useState(false);
  const [isCaring, setIsCaring] = useState(false);


  // STATE QUẢN LÝ THU HOẠCH & BẰNG CHỨNG NHẬN
  const [revealStep, setRevealStep] = useState(0);
  const [harvestedFlower, setHarvestedFlower] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [currentCertificate, setCurrentCertificate] = useState(null);


  // STATE KHO CHỨNG NHẬN
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [certificatesList, setCertificatesList] = useState([]);
  const [loadingVault, setLoadingVault] = useState(false);


  const gardenBgImages = {
    morning: '/garden-day.jpg',
    afternoon: '/garden-dusk.jpg',
    night: '/garden-night.jpg',
  };


  const getFlowerMedia = (flowerName) => {
    const found = MYSTERY_FLOWERS.find((f) => f.name === flowerName);
    return found ? found.image : '/assets/hoa1.mp4';
  };


  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 15) setTimeOfDay('morning');
    else if (hour >= 15 && hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('night');
  }, []);


  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;


        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileData) setProfile(profileData);


        let { data: plantData } = await supabase.from('user_plants').select('*').eq('user_id', user.id).maybeSingle();
        if (!plantData) {
          const { data: newPlant } = await supabase.from('user_plants').insert([{ user_id: user.id, growth_stage: 1 }]).select().single();
          plantData = newPlant;
        }
       
        if (plantData) {
          setPlant(plantData);
          if (plantData.last_watered_at) {
            const caredDate = new Date(plantData.last_watered_at).toDateString();
            if (caredDate === new Date().toDateString()) {
              localStorage.setItem('last_cared_date', caredDate);
            }
          }
        }


        const todayStr = new Date().toISOString().split('T')[0];
        const { data: todayPosts } = await supabase.from('posts').select('id').eq('user_id', user.id).gte('created_at', `${todayStr}T00:00:00.000Z`);
        if (todayPosts && todayPosts.length > 0) setHasPostedToday(true);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);


  const fetchCertificatesVault = async () => {
    setLoadingVault(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingVault(false);
        return;
      }


      const { data } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });


      let certs = data || [];
      const targetTrees = profile.real_trees_planted || 0;


      if (certs.length < targetTrees) {
        const generated = [];
        for (let i = 1; i <= targetTrees; i++) {
          const exists = certs.some((c) => Number(c.tree_number) === i);
          if (!exists) {
            const flower = MYSTERY_FLOWERS[(i - 1) % MYSTERY_FLOWERS.length];
            generated.push({
              id: `auto-gen-${i}`,
              tree_number: i,
              certificate_code: `GL-TREE-2026-${1000 + i * 113}`,
              flower_name: flower.name,
              created_at: new Date(Date.now() - (targetTrees - i) * 86400000 * 7).toISOString(),
            });
          }
        }
        certs = [...certs, ...generated].sort((a, b) => Number(b.tree_number) - Number(a.tree_number));
      }
      setCertificatesList(certs);
    } catch (err) {
      console.error('Lỗi tải danh sách bằng:', err);
    } finally {
      setLoadingVault(false);
    }
  };


  const isCaredToday = useMemo(() => {
    if (!plant?.last_watered_at) return false;
    return new Date(plant.last_watered_at).toDateString() === new Date().toDateString();
  }, [plant?.last_watered_at]);


  // HÀM CHĂM SÓC CÂY THEO NGÀY
  const handleCareAction = async () => {
    if (isCaring || plant.growth_stage >= 7 || isCaredToday) return;


    if (!hasPostedToday) {
      alert('⚠️ Bạn chưa chụp ảnh hành động xanh hôm nay! Hãy chụp ảnh trước để mở khóa chăm sóc cây nhé 🌱');
      if (onNavigate) onNavigate('camera');
      return;
    }


    setIsCaring(true);
    try {
      const nextStage = Math.min(plant.growth_stage + 1, 7);
      const nowISO = new Date().toISOString();
      const todayStr = new Date().toDateString();


      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_plants').update({ growth_stage: nextStage, last_watered_at: nowISO }).eq('user_id', user.id);
        await supabase.rpc('increment_eco_points', { user_uuid: user.id, points_to_add: 10 });
      }


      // ĐỒNG BỘ DỮ LIỆU CẬP NHẬT ICON ONG VUI PWA
      localStorage.setItem('last_cared_date', todayStr);


      setTimeout(() => {
        setIsCaring(false);
        setPlant((prev) => ({ ...prev, growth_stage: nextStage, last_watered_at: nowISO }));
        setProfile((prev) => ({ ...prev, eco_points: (prev.eco_points || 0) + 10 }));
      }, 400);
    } catch (err) {
      console.error(err);
      setIsCaring(false);
    }
  };


  const startHarvestSequence = () => {
    const randomFlower = MYSTERY_FLOWERS[Math.floor(Math.random() * MYSTERY_FLOWERS.length)];
    setHarvestedFlower(randomFlower);
    setRevealStep(1);
    setTimeout(() => {
      setRevealStep(2);
    }, 600);
  };


  const handleFinalClaim = async () => {
    const newRealTrees = (profile.real_trees_planted || 0) + 1;
    const certCode = `GL-TREE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const flowerName = harvestedFlower?.name || 'Hoa Xanh Bí Mật';
    const flowerImage = harvestedFlower?.image || '/assets/hoa1.mp4';


    const certData = {
      code: certCode,
      treeNumber: newRealTrees,
      studentName: profile.full_name || 'Sinh Viên Xanh',
      schoolName: profile.school_name || 'Đại Học Xanh',
      issuedAt: new Date().toLocaleDateString('vi-VN'),
      flowerName: flowerName,
      flowerImage: flowerImage
    };


    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('certificates').insert([{
        user_id: user.id,
        certificate_code: certCode,
        tree_number: newRealTrees,
        flower_name: flowerName
      }]);
      await supabase.from('profiles').update({ real_trees_planted: newRealTrees }).eq('id', user.id);
      await supabase.from('user_plants').update({ growth_stage: 1, last_watered_at: new Date().toISOString() }).eq('user_id', user.id);
    }


    setCurrentCertificate(certData);
    setProfile((prev) => ({ ...prev, real_trees_planted: newRealTrees }));
    setPlant((prev) => ({ ...prev, growth_stage: 1 }));
    setRevealStep(0);
    setShowCertificateModal(true);
  };


  const handleShareCertificate = (cert) => {
    const treeNo = cert.tree_number || cert.treeNumber || 1;
    const code = cert.certificate_code || cert.code || 'GL-TREE';
    const text = `🌱 Tớ vừa trồng thành công 01 CÂY XANH THỰC TẾ (#Cây thứ ${treeNo}) cùng Dự Án Green Locket!\nMã số chứng nhận: ${code}\nHãy cùng tớ lan tỏa lối sống xanh nhé! 🌲✨`;


    if (navigator.share) {
      navigator.share({
        title: 'Chứng Nhận Cây Xanh - Green Locket',
        text: text,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('📋 Đã sao chép thông tin chứng nhận! Bạn có thể dán lên Zalo/Facebook để chia sẻ nhé.');
    } else {
      alert(text);
    }
  };


  const currentChapter = STORY_CHAPTERS[plant.growth_stage - 1] || STORY_CHAPTERS[0];


  return (
    <div
      className="h-full w-full bg-cover bg-center transition-all duration-700 p-3 text-white flex flex-col justify-between relative font-sans overflow-hidden select-none"
      style={{ backgroundImage: `url(${gardenBgImages[timeOfDay]})` }}
    >
      <div className={`absolute inset-0 pointer-events-none ${timeOfDay === 'night' ? 'bg-black/30' : 'bg-transparent'}`} />


      {/* TOP HUD */}
      <div className="z-10 shrink-0 space-y-1.5">
        <div className="flex justify-between items-center gap-1">
          <button
            onClick={() => onNavigate && onNavigate('camera')}
            className="px-2.5 py-1.5 bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-white flex items-center gap-1 text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>


          <div className="bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/20 flex items-center gap-1">
            <button onClick={() => setTimeOfDay('morning')} className={`p-1 rounded-full cursor-pointer ${timeOfDay === 'morning' ? 'bg-amber-400 text-slate-950' : 'text-white/70'}`}>
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setTimeOfDay('afternoon')} className={`p-1 rounded-full cursor-pointer ${timeOfDay === 'afternoon' ? 'bg-orange-500 text-white' : 'text-white/70'}`}>
              <Sunset className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setTimeOfDay('night')} className={`p-1 rounded-full cursor-pointer ${timeOfDay === 'night' ? 'bg-indigo-900 text-amber-300' : 'text-white/70'}`}>
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>


          <button
            onClick={() => {
              fetchCertificatesVault();
              setShowVaultModal(true);
            }}
            className="px-2.5 py-1.5 bg-amber-400/90 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-full border border-white shadow-md active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Chứng nhận ({profile.real_trees_planted || 0})</span>
          </button>


          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{profile.eco_points || 0} pts</span>
          </div>
        </div>
      </div>


      <div className="flex-1 w-full pointer-events-none" />


      {/* CỤM NỘI DUNG TẬP TRUNG PHÍA DƯỚI */}
      <div className="z-10 shrink-0 space-y-3 pb-2">
        <div className="mx-auto max-w-[290px] bg-black/70 backdrop-blur-md border border-amber-300/70 p-3 rounded-2xl text-center shadow-xl relative">
          <p className="text-xs text-amber-100 font-medium leading-relaxed italic">
            "{currentChapter.dialogue}"
          </p>
          <div className="w-2.5 h-2.5 bg-black/70 border-r border-b border-amber-300/70 transform rotate-45 mx-auto absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
        </div>


        {/* HÌNH ẢNH CÂY / ẨN HIỆN THEO BƯỚC CHĂM SÓC */}
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
          {plant.growth_stage >= 7 ? (
            /* TRẠNG THÁI NGÀY 7: THU HOẠCH NGAY (KHÔNG CẦN HÌNH ACT-DAY7) */
            <div className="text-center space-y-1.5 cursor-pointer" onClick={startHarvestSequence}>
              <div className="w-20 h-20 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-2xl mx-auto active:scale-95 transition-all">
                <Gift className="w-10 h-10 text-white animate-bounce" />
              </div>
              <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-lg inline-block uppercase">
                THU HOẠCH NGAY! 🎁
              </span>
            </div>
          ) : isCaredToday ? (
            /* ĐÃ CHĂM SÓC HÔM NAY -> HIỂN THỊ HÌNH ẢNH GIAI ĐOẠN ĐÃ MỞ KHÓA */
            <img
              src={STORY_CHAPTERS[plant.growth_stage - 2]?.image || STORY_CHAPTERS[0].image}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              className="w-36 h-36 object-contain filter drop-shadow-lg mx-auto animate-in zoom-in-90 duration-500"
              alt={`Giai đoạn ${plant.growth_stage - 1}`}
            />
          ) : (
            /* CHƯA CHĂM SÓC HÔM NAY -> HIỂN THỊ KHUNG BÍ MẬT Chờ MỞ KHÓA */
            <div className="w-32 h-32 rounded-3xl bg-black/50 backdrop-blur-md border-2 border-dashed border-amber-300/60 flex flex-col items-center justify-center p-3 text-center shadow-xl">
              <Sprout className="w-10 h-10 text-emerald-400 mb-1 animate-pulse" />
              <span className="text-[10px] font-extrabold text-amber-300 leading-tight">
                Chăm sóc để mở khóa hình ảnh Ngày {plant.growth_stage}! ✨
              </span>
            </div>
          )}
        </div>


        <div className="flex items-center gap-2 w-full">
          <div className="flex-1 bg-black/40 backdrop-blur-md border border-white/20 p-2.5 rounded-2xl space-y-1 shadow-lg">
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="flex items-center gap-1 truncate">
                <Camera className={`w-3.5 h-3.5 shrink-0 ${hasPostedToday ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span className="truncate">{hasPostedToday ? 'Đã chụp ✓' : 'Chưa chụp'}</span>
              </span>
              <span className="text-amber-300 font-extrabold shrink-0 ml-1">Ngày {plant.growth_stage}/7</span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-400 to-amber-400 h-full transition-all duration-500" style={{ width: `${(plant.growth_stage / 7) * 100}%` }} />
            </div>
          </div>


          <div className="flex-1">
            {plant.growth_stage >= 7 ? (
              <button
                onClick={startHarvestSequence}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 font-black rounded-full shadow-xl flex items-center justify-center gap-1 text-xs border border-white cursor-pointer active:scale-95 transition-all truncate px-2"
              >
                <Gift className="w-4 h-4 shrink-0" />
                <span className="truncate">THU HOẠCH! 🎁</span>
              </button>
            ) : isCaredToday ? (
              <button
                disabled
                className="w-full py-3 bg-black/50 backdrop-blur-md text-emerald-300 font-extrabold rounded-full shadow-sm flex items-center justify-center gap-1 border border-white/20 text-[11px] cursor-not-allowed truncate px-2"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Đã chăm hôm nay ✓</span>
              </button>
            ) : (
              <button
                onClick={handleCareAction}
                disabled={isCaring}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold rounded-full shadow-lg flex items-center justify-center gap-1 border border-white/40 active:scale-95 transition-all text-xs cursor-pointer truncate px-2"
              >
                <span className="shrink-0">{currentChapter.icon}</span>
                <span className="truncate">{currentChapter.actionName} (+10 Pts)</span>
              </button>
            )}
          </div>
        </div>
      </div>


      {/* OVERLAY THU HOẠCH HOA */}
      {revealStep === 2 && harvestedFlower && (
        <div className="fixed inset-0 bg-gradient-to-b from-[#fefce8]/95 via-[#dcfce7]/95 to-[#ccfbf1]/95 backdrop-blur-xl z-50 flex flex-col items-center justify-between p-6 text-center overflow-y-auto font-sans text-slate-800">
          <div className="absolute w-96 h-96 bg-gradient-to-tr from-amber-300/50 via-emerald-300/40 to-teal-200/30 rounded-full blur-3xl -z-10" />


          <div className="space-y-1 relative z-20 pt-2">
            <span className="text-xs uppercase tracking-widest text-amber-700 font-extrabold flex items-center justify-center gap-1.5 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-500" /> TÈN TEN! BÔNG HOA CỦA BẠN LÀ...
            </span>
            <h1 className="text-2xl font-serif font-black text-slate-900 drop-shadow-sm pt-1">
              {harvestedFlower.name}
            </h1>
          </div>


          <div className="relative my-4 z-10 flex flex-col items-center justify-center">
            <div className="relative z-0 mb-3">
              <div className="w-48 h-48 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 bg-white p-2.5 flex items-center justify-center">
                {harvestedFlower.image.endsWith('.mp4') || harvestedFlower.image.endsWith('.webm') ? (
                  <video src={harvestedFlower.image} autoPlay loop muted playsInline className="w-full h-full object-contain rounded-2xl" />
                ) : (
                  <img src={harvestedFlower.image} onError={(e) => { e.currentTarget.style.display = 'none'; }} className="w-full h-full object-contain rounded-2xl" alt={harvestedFlower.name} />
                )}
              </div>
            </div>
            <div className="w-52 h-11 bg-amber-900 border-t-4 border-amber-700 rounded-b-3xl shadow-xl relative z-10 flex items-center justify-center">
              <span className="text-[10px] text-amber-200 font-black uppercase tracking-widest flex items-center gap-1">
                <Sprout className="w-3.5 h-3.5 text-emerald-400" /> Đất Ấm Đơm Hoa
              </span>
            </div>
          </div>


          <div className="space-y-3.5 w-full max-w-xs z-10">
            <p className="text-xs text-slate-700 leading-relaxed font-semibold bg-white/85 p-3.5 rounded-2xl border border-emerald-200/80 shadow-sm backdrop-blur-md">
              {harvestedFlower.desc}
            </p>
            <button
              onClick={handleFinalClaim}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs uppercase tracking-wider rounded-full shadow-lg border-2 border-white active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Gift className="w-4 h-4 text-amber-300" /> QUYÊN GÓP 1 CÂY THẬT & NHẬN BẰNG XANH! 🌲
            </button>
          </div>
        </div>
      )}


      {/* KHO CHỨNG NHẬN */}
      {showVaultModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-900/90 border border-amber-300/40 rounded-3xl p-5 text-white shadow-2xl flex flex-col max-h-[85vh] font-sans">
            <div className="flex justify-between items-center pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-400/20 text-amber-300 rounded-xl border border-amber-400/30">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-amber-300 uppercase">KHO CHỨNG NHẬN CÂY XANH</h2>
                  <p className="text-[10px] text-slate-400">Tích lũy đóng góp phủ xanh môi trường</p>
                </div>
              </div>
              <button onClick={() => setShowVaultModal(false)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>


            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 my-1">
              {loadingVault ? (
                <div className="text-center py-8 text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" /> Đang tải bộ sưu tập bằng...
                </div>
              ) : certificatesList.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-800/40 rounded-2xl border border-white/5 space-y-2">
                  <Sprout className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
                  <p className="text-xs font-bold text-slate-300">Chưa có chứng nhận nào!</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Hãy hoàn thành chuỗi 7 ngày hành động xanh để nhận Bằng Chứng Nhận và tài trợ 01 cây thật đầu tiên nhé 🌱
                  </p>
                </div>
              ) : (
                certificatesList.map((cert, idx) => {
                  const flowerMedia = getFlowerMedia(cert.flower_name);
                  return (
                    <div key={cert.id || idx} className="bg-slate-800/80 border border-emerald-500/30 hover:border-emerald-400/70 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-md transition-all">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-amber-300/40 shrink-0 flex items-center justify-center">
                        {flowerMedia.endsWith('.mp4') || flowerMedia.endsWith('.webm') ? (
                          <video src={flowerMedia} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        ) : (
                          <img src={flowerMedia} className="w-full h-full object-cover" alt={cert.flower_name} />
                        )}
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
                            CÂY THẬT #{cert.tree_number || idx + 1}
                          </span>
                          <span className="text-[10px] text-amber-300 font-mono truncate">
                            {cert.certificate_code}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white truncate">
                          {cert.flower_name || 'Hoa Xanh Bí Mật'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Ngày: {new Date(cert.created_at || Date.now()).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setCurrentCertificate({
                              code: cert.certificate_code,
                              treeNumber: cert.tree_number || idx + 1,
                              studentName: profile.full_name || 'Sinh Viên Xanh',
                              schoolName: profile.school_name || 'Đại Học Xanh',
                              issuedAt: new Date(cert.created_at || Date.now()).toLocaleDateString('vi-VN'),
                              flowerName: cert.flower_name || 'Hoa Xanh Bí Mật',
                              flowerImage: flowerMedia
                            });
                            setShowVaultModal(false);
                            setShowCertificateModal(true);
                          }}
                          className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-[11px] font-bold rounded-xl border border-emerald-500/30 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" /> Xem
                        </button>
                        <button onClick={() => handleShareCertificate(cert)} className="p-1.5 bg-slate-700 hover:bg-amber-400 text-slate-300 hover:text-slate-950 rounded-xl transition-all cursor-pointer">
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>


            <div className="pt-2 border-t border-white/10 text-center shrink-0">
              <p className="text-[10px] text-slate-400">
                🌲 Mỗi chứng nhận tương ứng với 01 cây gỗ thật được quyên góp vào dự án xanh.
              </p>
            </div>
          </div>
        </div>
      )}


      {/* MODAL CERTIFICATE */}
      {showCertificateModal && currentCertificate && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-amber-50 via-white to-emerald-50 rounded-3xl p-6 text-center text-slate-800 shadow-2xl border border-amber-200/80 space-y-3.5 font-sans overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 h-44 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
            <button onClick={() => setShowCertificateModal(false)} className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-all cursor-pointer">
              <X className="w-4 h-4" />
            </button>


            <div className="relative mx-auto w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-xl bg-slate-950 p-1 flex items-center justify-center rotate-1 group">
              {(() => {
                const media = currentCertificate.flowerImage || getFlowerMedia(currentCertificate.flowerName);
                return media.endsWith('.mp4') || media.endsWith('.webm') ? (
                  <video src={media} autoPlay loop muted playsInline className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <img src={media} className="w-full h-full object-cover rounded-xl" alt={currentCertificate.flowerName} />
                );
              })()}
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 border border-white shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>


            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block">
                GREEN LOCKET CERTIFICATE
              </span>
              <h2 className="text-lg font-black text-slate-900 font-serif tracking-tight">
                CHỨNG NHẬN CÂY XANH
              </h2>
              <p className="text-[11px] text-slate-500 italic">
                Tuyên dương đóng góp tích cực cho môi trường
              </p>
            </div>


            <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent my-0.5" />


            <div className="space-y-0.5 bg-white/80 p-2.5 rounded-2xl border border-amber-100 shadow-sm text-center">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Đại sứ xanh</p>
              <h3 className="text-base font-black text-slate-800 tracking-wide">
                {currentCertificate.studentName}
              </h3>
              <p className="text-[11px] font-medium text-emerald-600">
                {currentCertificate.schoolName}
              </p>
            </div>


            <div className="bg-emerald-900 text-white p-3 rounded-2xl shadow-inner space-y-1.5 text-left border border-emerald-700">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cây Xanh Thật #{currentCertificate.treeNumber}
                </span>
                <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded text-emerald-200 font-mono">
                  {currentCertificate.code}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 leading-snug">
                Xác nhận 01 cây gỗ thật được tài trợ trồng vào dự án phủ xanh trường học & cộng đồng.
              </p>
              <div className="pt-1 text-[10px] text-emerald-300/80 border-t border-emerald-800/80 flex justify-between">
                <span>Hoa nở: <strong>{currentCertificate.flowerName}</strong></span>
                <span>Ngày: {currentCertificate.issuedAt}</span>
              </div>
            </div>


            <div className="space-y-2 pt-1">
              <button onClick={() => handleShareCertificate(currentCertificate)} className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-full shadow-md text-xs tracking-wide uppercase active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Share2 className="w-4 h-4" /> Chia Sẻ Thành Tích Xanh
              </button>
              <button onClick={() => setShowCertificateModal(false)} className="w-full py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-full shadow-md text-xs tracking-wide uppercase active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40">
                <Sprout className="w-4 h-4 text-amber-300" /> Bắt Đầu Trồng Hạt Giống Mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

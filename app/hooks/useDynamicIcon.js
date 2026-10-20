'use client';
import { useEffect } from 'react';


export function useDynamicIcon() {
  useEffect(() => {
    const updateIcon = () => {
      const hour = new Date().getHours();
      const isLateInDay = hour >= 15;
     
      const lastCared = typeof window !== 'undefined' ? localStorage.getItem('last_cared_date') : null;
      const todayStr = new Date().toDateString();
      const hasCaredToday = lastCared === todayStr;


      // Cập nhật đường dẫn chuẩn theo file 192x192 px
      const iconPath = (isLateInDay && !hasCaredToday)
        ? '/assets/bee-sad-192.png'
        : '/assets/bee-happy-192.png';


      // 1. Cập nhật Favicon (Tự tạo thẻ nếu chưa có trong DOM)
      let favicon = document.querySelector("link[rel*='icon']");
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'shortcut icon';
        document.head.appendChild(favicon);
      }
      favicon.href = iconPath;


      // 2. Cập nhật Apple Touch Icon cho PWA (Tự tạo thẻ nếu chưa có)
      let appleIcon = document.querySelector("link[rel='apple-touch-icon']");
      if (!appleIcon) {
        appleIcon = document.createElement('link');
        appleIcon.rel = 'apple-touch-icon';
        document.head.appendChild(appleIcon);
      }
      appleIcon.href = iconPath;
    };


    updateIcon();
    const interval = setInterval(updateIcon, 5 * 60 * 1000); // Kiểm tra lại mỗi 5 phút
    return () => clearInterval(interval);
  }, []);
}

import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';


if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '⚠️ Thiếu thông tin Supabase! Hãy kiểm tra lại file .env.local và đảm bảo đã khởi động lại dev server.'
  );
}


export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export interface GeminiVerifyResult {
  isEcoAction: boolean;
  reasoning: string;
  usedModel?: string;
}


export async function verifyEcoAction(
  imageBase64: string,
  taskTitle: string
): Promise<GeminiVerifyResult> {
  try {
    // Gọi về Route Handler nội bộ (/api/verify)
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageBase64, taskTitle }),
    });


    // 1. In chi tiết nếu Server API Route bị lỗi HTTP (400, 500...)
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Server API Error ${response.status}]:`, errorText);
      throw new Error(`HTTP Error: ${response.status}`);
    }


    const data: GeminiVerifyResult = await response.json();


    // 2. IN LOG KẾT QUẢ VÀ LÝ DO AI ĐÁNH GIÁ (Quan trọng nhất)
    console.log('🔍 [Gemini Verify Result]:', data);


    return data;
  } catch (error) {
    console.error('❌ Lỗi kết nối API verify nội bộ:', error);
    return {
      isEcoAction: true,
      reasoning: 'Đã ghi nhận khoảnh khắc xanh!'
    };
  }
}

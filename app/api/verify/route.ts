import { NextResponse } from 'next/server';


function parseGeminiJson(rawText: string) {
  try {
    const cleanedText = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('❌ Lỗi parse JSON từ Gemini:', rawText);
    return null;
  }
}


export async function POST(request: Request) {
  try {
    const { imageBase64, taskTitle } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;


    if (!apiKey) {
      return NextResponse.json({
        isEcoAction: true,
        reasoning: 'Đã ghi nhận hành động xanh!'
      });
    }


    const cleanBase64 = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;


    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    };


    if (apiKey.startsWith('AQ')) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }


    const candidateModels = ['gemini-2.0-flash', 'gemini-1.5-flash'];


    for (const model of candidateModels) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Bạn là giám khảo AI dễ tính cho ứng dụng Green Locket.
Nhiệm vụ: "${taskTitle}".


HƯỚNG DẪN KIỂM DUYỆT:
- Hãy tìm các vật dụng liên quan đến nhiệm vụ trong ảnh (ví dụ: bình nước, ly giữ nhiệt, bình inox, bình nhựa tái sử dụng, cốc...).
- CHỈ CẦN CÓ VẬT DỤNG NÀY TRONG ẢNH => LUÔN TRẢ VỀ "isEcoAction": true.
- Bỏ qua các yếu tố khuôn mặt, ánh sáng hay góc chụp.


ĐỊNH DẠNG BẮT BUỘC (Chỉ trả về JSON):
{
  "isEcoAction": true,
  "reasoning": "Một câu khen ngợi ngắn bằng tiếng Việt"
}`
                  },
                  {
                    inline_data: {
                      mime_type: 'image/jpeg',
                      data: cleanBase64
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.1
            }
          })
        }
      );


      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;


        console.log('🔍 Raw AI Response:', rawText);


        if (rawText) {
          const parsed = parseGeminiJson(rawText);
          if (parsed) {
            return NextResponse.json({
              isEcoAction: Boolean(parsed.isEcoAction),
              reasoning: parsed.reasoning || 'Hành động xanh tuyệt vời!',
              usedModel: model
            });
          }
        }
      }
    }


    return NextResponse.json({
      isEcoAction: true,
      reasoning: 'Tuyệt vời! Đã ghi nhận khoảnh khắc sống xanh.'
    });


  } catch (error) {
    console.error('Lỗi Server Route:', error);
    return NextResponse.json({
      isEcoAction: true,
      reasoning: 'Ghi nhận khoảnh khắc thành công!'
    });
  }
}

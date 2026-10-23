import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { sePayStore } from './src/server/sepayService';

dotenv.config();

const app = express();
app.use(express.json());

// Hàm khởi tạo AI instance: Ưu tiên Custom Key từ client nếu có, ngược lại dùng env mặc định
function getAIClient(customKey?: string): GoogleGenAI | null {
  const key = (customKey && customKey.trim()) ? customKey.trim() : (process.env.GEMINI_API_KEY || '');
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function cleanToHashtag(str: string): string {
  const noTones = removeVietnameseTones(str);
  const cleaned = noTones.replace(/[^a-zA-Z0-9]/g, '');
  return cleaned ? `#${cleaned}` : '';
}

function countOccurrences(text: string, phrase: string): number {
  if (!text || !phrase) return 0;
  const normalizedText = text.toLowerCase();
  const normalizedPhrase = phrase.toLowerCase().trim();
  if (!normalizedPhrase) return 0;

  // Escape regex special chars
  const escaped = normalizedPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(?<=\\b|\\s|^)${escaped}(?=\\b|\\s|[.,!?;:]|$)`, 'gi');
  const matches = normalizedText.match(regex);
  return matches ? matches.length : 0;
}

// 0. Test thử API Key
app.post('/api/seo/test-api-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || !apiKey.trim()) {
      return res.status(400).json({ error: 'API Key không hợp lệ hoặc đã hết hạn, vui lòng kiểm tra lại.' });
    }

    const testClient = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await testClient.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: 'Trả về từ OK',
    });

    if (response && response.text) {
      return res.json({ success: true, message: 'API đã kết nối thành công.' });
    } else {
      throw new Error('Không nhận được phản hồi từ Gemini API.');
    }
  } catch (error: any) {
    console.error('Test API Key error:', error);
    return res.status(400).json({
      error: 'API Key không hợp lệ hoặc đã hết hạn, vui lòng kiểm tra lại.',
    });
  }
});

// 1. Phân tích từ khóa
app.post('/api/seo/analyze-keywords', async (req, res) => {
  try {
    const { topic, language = 'Tiếng Việt', customApiKey } = req.body;
    const headerKey = req.headers['x-gemini-api-key'] as string;
    const ai = getAIClient(customApiKey || headerKey);

    if (!topic || topic.trim().length < 5) {
      return res.status(400).json({ error: 'Nội dung quá ngắn hoặc chưa hợp lệ.' });
    }

    if (!ai) {
      return res.status(500).json({ error: 'Chưa cấu hình API Key. Vui lòng bấm nút API ở góc trên để nhập Gemini API Key.' });
    }

    const systemInstruction = `Bạn là chuyên gia SEO YouTube hàng đầu thế giới với kiến thức sâu rộng về thuật toán xếp hạng video, YouTube Search, Suggested Videos, và hành vi tìm kiếm của người xem. Nhiệm vụ của bạn là phân tích đề tài/mô tả video và trích xuất hệ thống từ khóa chuẩn SEO theo ngôn ngữ được yêu cầu.`;

    const prompt = `Phân tích đề tài video sau:
"${topic.trim()}"

Ngôn ngữ xuất kết quả: ${language}

Hãy trả về định dạng JSON với cấu trúc:
1. focusKeyword: 1 từ khóa trọng tâm có lượng tìm kiếm cao nhất, bao quát đúng đề tài.
2. mainKeywords: Mảng đúng 10 từ khóa chính liên quan chặt chẽ.
3. secondaryKeywords: Mảng đúng 10 từ khóa phụ mở rộng (long-tail keywords).
4. metrics: Dữ liệu phân tích chuyên sâu cho từ khóa trọng tâm bao gồm:
   - estimatedVolume: Ước tính lưu lượng tìm kiếm hàng tháng trên YouTube (ví dụ: "35.000 lượt/tháng")
   - competitionLevel: Mức độ cạnh tranh (chỉ nhận 1 trong 3 giá trị: "Thấp", "Trung bình", "Cao")
   - competitionPercentage: Phần trăm độ khó cạnh tranh từ 0 đến 100 (số nguyên)
   - seoOpportunityScore: Điểm cơ hội tiềm năng SEO từ 0 đến 100 (số nguyên, điểm càng cao video càng dễ lên Top 1)
   - trendStatus: Xu hướng tìm kiếm (ví dụ: "Đang tăng trưởng mạnh ↗" hoặc "Ổn định")
   - strategicAdvice: Lời khuyên chiến lược 1-2 câu ngắn gọn để video leo Top 1 YouTube Search`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            focusKeyword: { type: Type.STRING, description: 'Từ khóa trọng tâm duy nhất' },
            mainKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '10 từ khóa chính liên quan',
            },
            secondaryKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '10 từ khóa phụ mở rộng',
            },
            metrics: {
              type: Type.OBJECT,
              properties: {
                estimatedVolume: { type: Type.STRING, description: 'Lưu lượng tìm kiếm ước tính' },
                competitionLevel: { type: Type.STRING, description: 'Mức độ cạnh tranh: Thấp, Trung bình, hoặc Cao' },
                competitionPercentage: { type: Type.INTEGER, description: 'Độ khó % từ 0-100' },
                seoOpportunityScore: { type: Type.INTEGER, description: 'Điểm cơ hội SEO từ 0-100' },
                trendStatus: { type: Type.STRING, description: 'Trạng thái xu hướng' },
                strategicAdvice: { type: Type.STRING, description: 'Chiến lược leo Top 1' },
              },
              required: [
                'estimatedVolume',
                'competitionLevel',
                'competitionPercentage',
                'seoOpportunityScore',
                'trendStatus',
                'strategicAdvice',
              ],
            },
          },
          required: [
            'focusKeyword',
            'mainKeywords',
            'secondaryKeywords',
            'metrics',
          ],
        },
      },
    });

    const jsonText = response.text || '{}';
    const data = JSON.parse(jsonText);
    return res.json(data);
  } catch (error: any) {
    console.error('Error analyzing keywords:', error);
    return res.status(500).json({ error: error.message || 'Lỗi khi phân tích từ khóa bằng AI.' });
  }
});

// 2. Tạo 10 tiêu đề YouTube
app.post('/api/seo/generate-titles', async (req, res) => {
  try {
    const { topic, language = 'Tiếng Việt', channelName, focusKeyword, customApiKey } = req.body;
    const headerKey = req.headers['x-gemini-api-key'] as string;
    const ai = getAIClient(customApiKey || headerKey);

    if (!focusKeyword) {
      return res.status(400).json({ error: 'Vui lòng chọn từ khóa trọng tâm trước.' });
    }
    if (!channelName || !channelName.trim()) {
      return res.status(400).json({ error: 'Vui lòng nhập tên kênh YouTube của bạn.' });
    }

    if (!ai) {
      return res.status(500).json({ error: 'Chưa cấu hình API Key. Vui lòng bấm nút API ở góc trên để nhập Gemini API Key.' });
    }

    const systemInstruction = `Bạn là chuyên gia sáng tạo tiêu đề video YouTube triệu view và chuyên gia YouTube SEO. Bạn biết cách kết hợp từ khóa SEO, tâm lý thu hút click (high CTR), không giật tít lừa đảo (no clickbait lố), độ dài chuẩn YouTube (khoảng 50-70 ký tự), và lồng ghép phù hợp với kênh.`;

    const prompt = `Hãy tạo chính xác 10 tiêu đề video YouTube tối ưu SEO dựa trên các thông tin sau:
- Đề tài ban đầu: "${topic}"
- Từ khóa trọng tâm: "${focusKeyword}"
- Tên kênh YouTube: "${channelName.trim()}"
- Ngôn ngữ yêu cầu: ${language}

YÊU CẦU 10 KIỂU TIÊU ĐỀ BẮT BUỘC:
1. Hướng dẫn (How-to / Step-by-step)
2. Bí quyết (Secret / Tips & Tricks)
3. Danh sách (Top List / Numbered)
4. Sai lầm (Common Mistakes to avoid)
5. Xu hướng (Trends / New update)
6. Người mới (Beginners / From zero)
7. So sánh (Comparison / A vs B)
8. Kết quả thực tế (Case study / Proof / Experience)
9. Chuyên gia (Expert advice / Masterclass)
10. Viral / Kích thích tò mò (High curiosity & CTR)

Yêu cầu chất lượng:
- Liên quan chặt chẽ đến từ khóa trọng tâm "${focusKeyword}".
- Thu hút click cao nhưng trung thực, chuyên nghiệp.
- Viết bằng ngôn ngữ: ${language}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  style: { type: Type.STRING, description: 'Kiểu tiêu đề (ví dụ: Hướng dẫn, Bí quyết...)' },
                  description: { type: Type.STRING, description: 'Lý do tối ưu và điểm nhấn' },
                },
                required: ['id', 'title', 'style'],
              },
            },
          },
          required: ['titles'],
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    return res.json(data);
  } catch (error: any) {
    console.error('Error generating titles:', error);
    return res.status(500).json({ error: error.message || 'Lỗi khi tạo tiêu đề YouTube.' });
  }
});

// 3. Viết mô tả YouTube
app.post('/api/seo/generate-description', async (req, res) => {
  try {
    const { topic, language = 'Tiếng Việt', channelName, focusKeyword, selectedTitle, mainKeywords = [], customApiKey } = req.body;
    const headerKey = req.headers['x-gemini-api-key'] as string;
    const ai = getAIClient(customApiKey || headerKey);

    if (!selectedTitle || !focusKeyword || !channelName) {
      return res.status(400).json({ error: 'Thiếu thông tin để viết mô tả YouTube.' });
    }

    if (!ai) {
      return res.status(500).json({ error: 'Chưa cấu hình API Key. Vui lòng bấm nút API ở góc trên để nhập Gemini API Key.' });
    }

    const relKeyword = (mainKeywords && mainKeywords.length > 0) ? mainKeywords[0] : 'SEO';
    const tag1 = cleanToHashtag(focusKeyword) || '#SEO';
    const tag2 = cleanToHashtag(relKeyword) || '#YouTube';
    const tag3 = cleanToHashtag(channelName) || '#Channel';
    const endHashtags = `${tag1} ${tag2} ${tag3}`;

    const systemInstruction = `Bạn là chuyên gia viết mô tả video YouTube chuẩn SEO hàng đầu. Bạn hiểu cách cân bằng giữa trải nghiệm người đọc và thuật toán YouTube Search để video được đề xuất mạnh mẽ.`;

    const prompt = `Hãy viết một bản mô tả YouTube hoàn chỉnh, chuyên nghiệp và tối ưu SEO dựa trên các thông số sau:
- Đề tài ban đầu: "${topic}"
- Tiêu đề video đã chọn: "${selectedTitle}"
- Từ khóa trọng tâm: "${focusKeyword}"
- Tên kênh YouTube: "${channelName.trim()}"
- Một số từ khóa phụ gợi ý: ${mainKeywords.slice(0, 5).join(', ')}
- Ngôn ngữ: ${language}

QUY TẮC BẮT BUỘC KHẮC KHE (CRITICAL):
1. Lặp lại chính xác cụm từ khóa trọng tâm "${focusKeyword}" ĐÚNG 3 LẦN trong toàn bộ nội dung mô tả (không được 2 lần, không được 4 lần, phải ĐÚNG 3 LẦN). Hãy bố trí tự nhiên: 1 lần ở đoạn mở đầu (trong 2 câu đầu tiên), 1 lần ở đoạn thân bài phân tích giá trị, và 1 lần ở đoạn kêu gọi hành động/tổng kết.
2. Nhắc tên kênh YouTube "${channelName.trim()}" một cách tự nhiên và thân thiện.
3. Đoạn mở đầu thu hút, nêu rõ người xem sẽ nhận được giá trị gì trong video.
4. Lời kêu gọi hành động (Call To Action - CTA): đăng ký kênh, like video, chia sẻ và để lại bình luận thảo luận.
5. Chia đoạn thoáng, có gạch đầu dòng rõ ràng, dễ đọc trên cả mobile. Không nhồi nhét từ khóa lố bịch. Không spam emoji bừa bãi, chỉ dùng biểu tượng tinh tế (📌, 🔔, 👉, ✨...).
6. Ở CUỐI CÙNG của mô tả, CHỈ ĐẶT ĐÚNG 3 HASHTAG sau và KHÔNG ĐƯỢC THÊM BẤT KỲ HASHTAG NÀO KHÁC:
${endHashtags}

Hãy viết hoàn chỉnh văn bản mô tả này.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction,
        temperature: 0.7,
      },
    });

    let description = (response.text || '').trim();
    let count = countOccurrences(description, focusKeyword);

    if (count !== 3) {
      const fixPrompt = `Văn bản mô tả YouTube sau đây hiện đang có từ khóa trọng tâm "${focusKeyword}" xuất hiện ${count} lần.
Quy định bắt buộc là từ khóa "${focusKeyword}" phải xuất hiện ĐÚNG 3 LẦN trong toàn bộ mô tả.
Và ở dòng cuối cùng phải giữ nguyên đúng 3 hashtag: ${endHashtags}.

Hãy chỉnh sửa lại văn bản sau sao cho từ khóa "${focusKeyword}" xuất hiện CHÍNH XÁC 3 LẦN một cách tự nhiên nhất:

${description}`;

      const fixResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: fixPrompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      if (fixResponse.text) {
        description = fixResponse.text.trim();
        count = countOccurrences(description, focusKeyword);
      }
    }

    return res.json({
      description,
      keywordCount: count,
      focusKeyword,
      threeHashtags: [tag1, tag2, tag3],
    });
  } catch (error: any) {
    console.error('Error generating description:', error);
    return res.status(500).json({ error: error.message || 'Lỗi khi viết mô tả YouTube.' });
  }
});

// 4. Tạo 25 Hashtag YouTube gợi ý
app.post('/api/seo/generate-hashtags', async (req, res) => {
  try {
    const { topic, language = 'Tiếng Việt', channelName, focusKeyword, selectedTitle, mainKeywords = [], customApiKey } = req.body;
    const headerKey = req.headers['x-gemini-api-key'] as string;
    const ai = getAIClient(customApiKey || headerKey);

    if (!focusKeyword) {
      return res.status(400).json({ error: 'Thiếu từ khóa trọng tâm.' });
    }

    if (!ai) {
      return res.status(500).json({ error: 'Chưa cấu hình API Key. Vui lòng bấm nút API ở góc trên để nhập Gemini API Key.' });
    }

    const systemInstruction = `Bạn là chuyên gia tối ưu hóa YouTube Hashtag cho video, Shorts và bài viết Community. Bạn biết cách chọn hashtag trending, liên quan trực tiếp đến nội dung và thương hiệu.`;

    const prompt = `Hãy tạo danh sách ĐÚNG 25 HASHTAG YOUTUBE dựa trên:
- Từ khóa trọng tâm: "${focusKeyword}"
- Tiêu đề video: "${selectedTitle || topic}"
- Đề tài: "${topic}"
- Tên kênh: "${channelName}"
- Từ khóa bổ trợ: ${mainKeywords.join(', ')}
- Ngôn ngữ: ${language}

QUY ĐỊNH BẮT BUỘC (CHÍNH XÁC 25 HASHTAG):
1. Hashtag đầu tiên là từ khóa trọng tâm: #${cleanToHashtag(focusKeyword).replace(/^#/, '')}
2. Hashtag thứ hai là tên kênh: #${cleanToHashtag(channelName).replace(/^#/, '')}
3. Tất cả 25 hashtag BẮT BUỘC có dấu # ở đầu.
4. Hashtag TUYỆT ĐỐI KHÔNG CÓ KHOẢNG TRẮNG.
5. Với Tiếng Việt, ƯU TIÊN viết không dấu (ví dụ: #kiemtienonline, #seoyoutube).
6. Các hashtag tiếp theo gồm từ khóa chính, từ khóa phụ, chủ đề liên quan, xu hướng tìm kiếm trên YouTube.

Hãy trả về định dạng JSON với mảng hashtags (đúng 25 phần tử).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Danh sách đúng 25 hashtag YouTube có dấu #, không khoảng trắng',
            },
          },
          required: ['hashtags'],
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    let hashtags: string[] = Array.isArray(data.hashtags) ? data.hashtags : [];
    hashtags = hashtags.map((h: string) => {
      let cleaned = h.trim().replace(/\s+/g, '');
      if (!cleaned.startsWith('#')) cleaned = `#${cleaned}`;
      return cleaned;
    }).filter((h) => h.length > 1);

    const firstTag = cleanToHashtag(focusKeyword) || '#SEO';
    if (!hashtags.includes(firstTag)) {
      hashtags.unshift(firstTag);
    } else {
      hashtags = [firstTag, ...hashtags.filter((h) => h.toLowerCase() !== firstTag.toLowerCase())];
    }
    hashtags = hashtags.slice(0, 25);

    return res.json({ hashtags });
  } catch (error: any) {
    console.error('Error generating hashtags:', error);
    return res.status(500).json({ error: error.message || 'Lỗi khi tạo hashtag.' });
  }
});

// 5. Xuất Prompt Tạo Ảnh Đại Diện YouTube (Thumbnail Prompt)
app.post('/api/seo/generate-thumbnail-prompt', async (req, res) => {
  try {
    const { topic, selectedTitle, focusKeyword, channelName, customApiKey } = req.body;
    const headerKey = req.headers['x-gemini-api-key'] as string;
    const ai = getAIClient(customApiKey || headerKey);

    if (!focusKeyword) {
      return res.status(400).json({ error: 'Thiếu từ khóa trọng tâm.' });
    }

    if (!ai) {
      return res.status(500).json({ error: 'Chưa cấu hình API Key. Vui lòng bấm nút API ở góc trên để nhập Gemini API Key.' });
    }

    const systemInstruction = `Bạn là Giám đốc Sáng tạo (Creative Director) và Chuyên gia thiết kế YouTube Thumbnail triệu view (CTR > 15%). Bạn thành thạo viết Prompt chuyên nghiệp cho Midjourney v6, DALL-E 3, Stable Diffusion, Imagen và Photoshop. Bạn biết cách tạo hình ảnh có độ tương phản cao, cảm xúc biểu cảm mạnh mẽ, ánh sáng điện ảnh, góc máy kịch tính thu hút ánh nhìn ngay lập tức trên feed YouTube.`;

    const prompt = `Hãy thiết kế ý tưởng và viết Prompt chi tiết để tạo Ảnh Đại Diện YouTube (Thumbnail) đỉnh cao cho video:
- Đề tài video: "${topic}"
- Tiêu đề video đã chọn: "${selectedTitle || topic}"
- Từ khóa trọng tâm: "${focusKeyword}"
- Kênh phát hành: "${channelName || 'YouTube'}"

YÊU CẦU ĐẦU RA (JSON):
1. promptEnglish: Đoạn Prompt chi tiết hoàn toàn bằng tiếng Anh, viết theo phong cách chuyên nghiệp cho Midjourney / DALL-E 3. Cần mô tả:
   - Chủ thể chính (nhân vật biểu cảm ấn tượng hoặc vật thể công nghệ/tiền tệ/kết quả nổi bật).
   - Biểu cảm khuôn mặt (shocked, enthusiastic, laser-focused, victorious...).
   - Góc máy (dynamic low-angle shot, extreme close-up, dramatic split-screen, rule of thirds).
   - Ánh sáng & Màu sắc (vibrant blue & electric cyan neon lighting, rim light, volumetric dust particles, dark contrast background, high dynamic range HDR, 8k resolution, cinematic photorealistic).
   - Tỷ lệ khung hình: "--ar 16:9 --v 6.0 --style raw" ở cuối prompt.
2. promptVietnamese: Bản dịch và mô tả chi tiết bằng tiếng Việt, hướng dẫn chi tiết cách dựng ảnh và bố cục để người dùng dễ hiểu.
3. visualConcept: Ý tưởng tổng quan (Concept) của bức ảnh thumbnail trong 1-2 câu ngắn gọn.
4. recommendedText: Gợi ý 2 đến 4 từ tiếng Việt in hoa, ngắn gọn, cực kỳ giật tít để chèn lên ảnh đại diện (ví dụ: "CỰC DỄ!", "X10 VIEW!", "BÍ MẬT 2026", "ĐỪNG BỎ LỠ!").
5. colorPalette: Gợi ý các tông màu chủ đạo tạo độ tương phản cao (ví dụ: Xanh dương điện quang Neon Blue, Vàng rực, Đen sâu).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            promptEnglish: { type: Type.STRING, description: 'Prompt tiếng Anh chi tiết cho Midjourney/DALL-E 3' },
            promptVietnamese: { type: Type.STRING, description: 'Mô tả chi tiết bằng tiếng Việt' },
            visualConcept: { type: Type.STRING, description: 'Ý tưởng cốt lõi của thumbnail' },
            recommendedText: { type: Type.STRING, description: 'Từ khóa giật CTR chèn trên thumbnail' },
            colorPalette: { type: Type.STRING, description: 'Bảng màu tương phản cao' },
          },
          required: ['promptEnglish', 'promptVietnamese', 'visualConcept', 'recommendedText', 'colorPalette'],
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    return res.json(data);
  } catch (error: any) {
    console.error('Error generating thumbnail prompt:', error);
    return res.status(500).json({ error: error.message || 'Lỗi khi tạo Prompt ảnh đại diện YouTube.' });
  }
});

// ==========================================
// SEPAY PAYMENT & ORDER MANAGEMENT ENDPOINTS
// ==========================================

// 1. Lấy danh sách gói dịch vụ đang hoạt động
app.get('/api/plans', (_req, res) => {
  try {
    const plans = sePayStore.getPlans(false);
    return res.json({ plans });
  } catch (error: any) {
    return res.status(500).json({ error: 'Không thể tải danh sách gói dịch vụ.' });
  }
});

// 2. Tạo đơn hàng mới (Mã AFF + 6 số, ví dụ AFF000001)
app.post('/api/orders/create', (req, res) => {
  try {
    const { planId, customerName, customerEmail, customerPhone, notes } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'Vui lòng chọn gói sử dụng.' });
    }
    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ error: 'Họ và tên không được để trống.' });
    }
    if (!customerEmail || !customerEmail.includes('@') || !customerEmail.includes('.')) {
      return res.status(400).json({ error: 'Email không đúng định dạng.' });
    }
    if (!customerPhone || !customerPhone.trim()) {
      return res.status(400).json({ error: 'Số điện thoại không được để trống.' });
    }

    const orderData = sePayStore.createOrder({
      planId,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    });

    return res.json({
      success: true,
      ...orderData,
    });
  } catch (error: any) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    return res.status(400).json({ error: error.message || 'Không thể tạo đơn hàng.' });
  }
});

// 3. Kiểm tra trạng thái đơn hàng (Polling từ frontend)
app.get('/api/orders/:orderCode/status', (req, res) => {
  try {
    const { orderCode } = req.params;
    const order = sePayStore.getOrder(orderCode);
    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
    }
    return res.json({
      order_code: order.order_code,
      status: order.status,
      amount: order.amount,
      plan_name: order.plan_name,
      plan_days: order.plan_days,
      customer_name: order.customer_name,
      created_at: order.created_at,
      paid_at: order.paid_at,
      expired_at: order.expired_at,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Lỗi kiểm tra trạng thái đơn hàng.' });
  }
});

// 4. Mô phỏng thanh toán SePay thành công (Dành cho test / nghiệm thu nhanh)
app.post('/api/orders/:orderCode/simulate-payment', (req, res) => {
  try {
    const { orderCode } = req.params;
    const result = sePayStore.activateOrder(orderCode, {
      gateway: 'Demo Simulation (SePay)',
      transactionRef: `SIM_${Date.now()}`,
    });

    // Ghi nhận log mô phỏng
    const logs = sePayStore.getWebhookLogs();
    logs.unshift({
      id: `sim_${Date.now()}`,
      received_at: new Date().toISOString(),
      order_code: orderCode,
      amount: result.order.amount,
      content: `${orderCode} - Mô phỏng thanh toán thủ công`,
      status: 'success',
      message: 'Mô phỏng thanh toán thành công qua chế độ Test.',
      raw_payload: { simulated: true, orderCode },
    });

    return res.json({
      success: true,
      message: 'Đã mô phỏng thanh toán thành công!',
      order: result.order,
      subscription: result.subscription,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Lỗi khi mô phỏng thanh toán.' });
  }
});

// 5. WEBHOOK CHÍNH THỨC TỪ SEPAY
app.post('/api/sepay/webhook', (req, res) => {
  try {
    const payload = req.body;
    const authHeader = (req.headers['authorization'] as string) || '';

    console.log('[SePay Webhook Received]:', JSON.stringify(payload));
    const result = sePayStore.processWebhook(payload, authHeader);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error: any) {
    console.error('SePay Webhook Error:', error);
    return res.status(200).json({ success: false, error: error.message });
  }
});

// 6. Kiểm tra gói đang hoạt động của khách hàng
app.get('/api/subscriptions/check', (req, res) => {
  try {
    const email = req.query.email as string;
    const phone = req.query.phone as string;
    const orderCode = req.query.orderCode as string;

    const result = sePayStore.checkUserSubscription({ email, phone, orderCode });
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: 'Lỗi kiểm tra gói người dùng.' });
  }
});

// 7. Lấy toàn bộ dữ liệu quản trị (Admin)
app.get('/api/admin/data', (_req, res) => {
  try {
    return res.json({
      bankConfig: sePayStore.getBankConfig(),
      plans: sePayStore.getPlans(true),
      orders: sePayStore.getOrders(),
      webhookLogs: sePayStore.getWebhookLogs(),
      subscriptions: sePayStore.getSubscriptions(),
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Lỗi tải dữ liệu quản trị.' });
  }
});

// 8. Cập nhật thông tin ngân hàng & SePay API Key
app.post('/api/admin/settings', (req, res) => {
  try {
    const { bankCode, bankName, accountNumber, accountName, sepayApiKey, webhookToken } = req.body;
    const updated = sePayStore.updateBankConfig({
      bankCode,
      bankName,
      accountNumber,
      accountName,
      sepayApiKey,
      webhookToken,
    });
    return res.json({ success: true, bankConfig: updated });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Lỗi lưu cấu hình ngân hàng.' });
  }
});

// 9. Cập nhật danh sách gói dịch vụ (Admin)
app.post('/api/admin/plans', (req, res) => {
  try {
    const { plans } = req.body;
    if (!Array.isArray(plans)) {
      return res.status(400).json({ error: 'Dữ liệu gói dịch vụ không hợp lệ.' });
    }
    const updated = sePayStore.updatePlans(plans);
    return res.json({ success: true, plans: updated });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Lỗi cập nhật gói dịch vụ.' });
  }
});

// 10. Kích hoạt thủ công đơn hàng (Admin)
app.post('/api/admin/orders/:orderCode/activate', (req, res) => {
  try {
    const { orderCode } = req.params;
    const result = sePayStore.activateOrder(orderCode, {
      gateway: 'Kích hoạt thủ công bởi Quản trị viên',
      transactionRef: `MANUAL_${Date.now()}`,
    });
    return res.json({ success: true, message: 'Đã kích hoạt đơn hàng thành công.', ...result });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Lỗi khi kích hoạt đơn hàng.' });
  }
});


// Vite middleware in dev or static serving in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = 3000;

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server Hoàng Văn Đạt SEO Youtube Pro listening on port ${port}`);
  });
}

// Khởi chạy server nếu không phải môi trường Vercel serverless
if (!process.env.VERCEL) {
  startServer();
}

export default app;
export { app };


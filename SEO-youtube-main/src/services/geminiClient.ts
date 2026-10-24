import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { KeywordAnalysisData, YouTubeTitleItem, DescriptionData, ThumbnailPromptData } from '../types/seo';

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
  const escaped = normalizedPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(?<=\\b|\\s|^)${escaped}(?=\\b|\\s|[.,!?;:]|$)`, 'gi');
  const matches = normalizedText.match(regex);
  return matches ? matches.length : 0;
}

export async function analyzeKeywordsClient(
  topic: string,
  language: string,
  apiKey: string
): Promise<KeywordAnalysisData> {
  const ai = new GoogleGenAI({ apiKey });
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
   - seoOpportunityScore: Điểm cơ hội tiềm năng SEO từ 0 đến 100 (số nguyên)
   - trendStatus: Xu hướng tìm kiếm
   - strategicAdvice: Lời khuyên chiến lược 1-2 câu ngắn gọn`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          focusKeyword: { type: Type.STRING },
          mainKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          secondaryKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          metrics: {
            type: Type.OBJECT,
            properties: {
              estimatedVolume: { type: Type.STRING },
              competitionLevel: { type: Type.STRING },
              competitionPercentage: { type: Type.INTEGER },
              seoOpportunityScore: { type: Type.INTEGER },
              trendStatus: { type: Type.STRING },
              strategicAdvice: { type: Type.STRING },
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
        required: ['focusKeyword', 'mainKeywords', 'secondaryKeywords', 'metrics'],
      },
    },
  });

  return JSON.parse(response.text || '{}');
}

export async function generateTitlesClient(
  topic: string,
  language: string,
  channelName: string,
  focusKeyword: string,
  apiKey: string
): Promise<YouTubeTitleItem[]> {
  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = `Bạn là chuyên gia sáng tạo tiêu đề video YouTube triệu view và chuyên gia YouTube SEO. Bạn biết cách kết hợp từ khóa SEO, tâm lý thu hút click (high CTR), độ dài chuẩn YouTube (khoảng 50-70 ký tự).`;

  const prompt = `Hãy tạo chính xác 10 tiêu đề video YouTube tối ưu SEO dựa trên các thông tin sau:
- Đề tài ban đầu: "${topic}"
- Từ khóa trọng tâm: "${focusKeyword}"
- Tên kênh YouTube: "${channelName.trim()}"
- Ngôn ngữ yêu cầu: ${language}

10 kiểu tiêu đề: Hướng dẫn, Bí quyết, Danh sách, Sai lầm, Xu hướng, Người mới, So sánh, Kết quả thực tế, Chuyên gia, Viral/Tò mò.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
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
                style: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ['id', 'title', 'style'],
            },
          },
        },
        required: ['titles'],
      },
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  return parsed.titles || [];
}

export async function generateDescriptionClient(
  topic: string,
  language: string,
  channelName: string,
  focusKeyword: string,
  selectedTitle: string,
  mainKeywords: string[],
  apiKey: string
): Promise<DescriptionData> {
  const ai = new GoogleGenAI({ apiKey });
  const relKeyword = mainKeywords?.[0] || 'SEO';
  const tag1 = cleanToHashtag(focusKeyword) || '#SEO';
  const tag2 = cleanToHashtag(relKeyword) || '#YouTube';
  const tag3 = cleanToHashtag(channelName) || '#Channel';
  const endHashtags = `${tag1} ${tag2} ${tag3}`;

  const prompt = `Hãy viết một bản mô tả YouTube hoàn chỉnh, chuyên nghiệp và tối ưu SEO dựa trên:
- Đề tài: "${topic}"
- Tiêu đề: "${selectedTitle}"
- Từ khóa trọng tâm: "${focusKeyword}"
- Tên kênh: "${channelName}"
- Từ khóa phụ: ${mainKeywords.slice(0, 5).join(', ')}
- Ngôn ngữ: ${language}

QUY TẮC: Lặp lại cụm từ khóa trọng tâm "${focusKeyword}" ĐÚNG 3 LẦN trong toàn bộ nội dung mô tả.
Ở CUỐI CÙNG của mô tả, CHỈ ĐẶT ĐÚNG 3 HASHTAG: ${endHashtags}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.7,
    },
  });

  const description = (response.text || '').trim();
  const count = countOccurrences(description, focusKeyword);

  return {
    description,
    keywordCount: count,
    focusKeyword,
    threeHashtags: [tag1, tag2, tag3],
  };
}

export async function generateHashtagsClient(
  topic: string,
  language: string,
  channelName: string,
  focusKeyword: string,
  selectedTitle: string,
  apiKey: string
): Promise<string[]> {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Hãy tạo danh sách ĐÚNG 25 HASHTAG YOUTUBE dựa trên:
- Từ khóa trọng tâm: "${focusKeyword}"
- Tiêu đề: "${selectedTitle || topic}"
- Đề tài: "${topic}"
- Tên kênh: "${channelName}"
- Ngôn ngữ: ${language}

QUY ĐỊNH: Bắt đầu bằng #${cleanToHashtag(focusKeyword).replace(/^#/, '')}, thứ hai là #${cleanToHashtag(channelName).replace(/^#/, '')}. Đủ 25 hashtag không khoảng trắng.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['hashtags'],
      },
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  let tags: string[] = parsed.hashtags || [];
  tags = tags.map((t: string) => {
    let clean = t.trim().replace(/\s+/g, '');
    if (!clean.startsWith('#')) clean = `#${clean}`;
    return clean;
  });
  return tags.slice(0, 25);
}

export async function generateThumbnailPromptClient(
  topic: string,
  selectedTitle: string,
  focusKeyword: string,
  channelName: string,
  apiKey: string
): Promise<ThumbnailPromptData> {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Hãy thiết kế ý tưởng và viết Prompt chi tiết để tạo Ảnh Đại Diện YouTube (Thumbnail) đỉnh cao cho video:
- Đề tài: "${topic}"
- Tiêu đề: "${selectedTitle || topic}"
- Từ khóa trọng tâm: "${focusKeyword}"
- Kênh: "${channelName || 'YouTube'}"

YÊU CẦU: promptEnglish, promptVietnamese, visualConcept, recommendedText, colorPalette.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          promptEnglish: { type: Type.STRING },
          promptVietnamese: { type: Type.STRING },
          visualConcept: { type: Type.STRING },
          recommendedText: { type: Type.STRING },
          colorPalette: { type: Type.STRING },
        },
        required: ['promptEnglish', 'promptVietnamese', 'visualConcept', 'recommendedText', 'colorPalette'],
      },
    },
  });

  return JSON.parse(response.text || '{}');
}

import { AppState } from '../types/seo';

export function getFormattedExportText(state: AppState): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  const mainKwStr = (state.keywords?.mainKeywords || [])
    .map((kw, i) => `${i + 1}. ${kw}`)
    .join('\n');

  const secKwStr = (state.keywords?.secondaryKeywords || [])
    .map((kw, i) => `${i + 1}. ${kw}`)
    .join('\n');

  const titlesStr = state.titles
    .map((t, i) => `${i + 1}. [${t.style}] ${t.title}`)
    .join('\n');

  const hashtagsStr = (state.hashtagsData || []).join(' ');

  const thumbnailSection = state.thumbnailPromptData
    ? `=====================================================
PROMPT TẠO ẢNH ĐẠI DIỆN YOUTUBE (THUMBNAIL 16:9):
Ý tưởng: ${state.thumbnailPromptData.visualConcept}
Chữ giật tít đề xuất: ${state.thumbnailPromptData.recommendedText}
Bảng màu tương phản: ${state.thumbnailPromptData.colorPalette}

Prompt tiếng Anh (Midjourney / DALL-E 3 / Leonardo AI):
${state.thumbnailPromptData.promptEnglish}

Mô tả chi tiết bằng tiếng Việt:
${state.thumbnailPromptData.promptVietnamese}`
    : `Prompt Tạo Ảnh Đại Diện YouTube: Chưa tạo`;

  return `=====================================================
HOÀNG VĂN ĐẠT OFFICIAL SEO YOUTUBE PRO
Tiện ích đưa video lên top 1 Youtube
Ngày xuất file: ${day}/${month}/${year}
=====================================================

Tên kênh YouTube:
${state.channelName || 'Chưa nhập'}

Ngôn ngữ:
${state.language || 'Tiếng Việt'}

Đề tài / Mô tả ban đầu:
${state.topic || 'Chưa nhập'}

Từ khóa trọng tâm (Primary Keyword):
${state.selectedFocusKeyword || state.keywords?.focusKeyword || 'Chưa có'}

10 Từ khóa chính liên quan:
${mainKwStr || 'Chưa có'}

10 Từ khóa phụ mở rộng (Long-tail keywords):
${secKwStr || 'Chưa có'}

10 Tiêu đề YouTube chuẩn SEO:
${titlesStr || 'Chưa có'}

Tiêu đề đã chọn:
${state.selectedTitle || 'Chưa chọn'}

Mô tả YouTube hoàn chỉnh (Đúng 3 lần từ khóa trọng tâm + 3 hashtag kết thúc):
${state.descriptionData?.description || 'Chưa có'}

Gợi ý 25 Hashtag YouTube (Dùng cho Video, Shorts & Community):
${hashtagsStr || 'Chưa có'}

${thumbnailSection}

=====================================================
Xuất từ hệ thống: Hoàng Văn Đạt Official SEO Youtube Pro
Tiện ích đưa video lên top 1 Youtube
=====================================================
`;
}

export function exportToTxtFile(state: AppState) {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const fileName = `Hoang-Van-Dat-Official-SEO-Youtube-Pro-${day}-${month}-${year}.txt`;

  const content = getFormattedExportText(state);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

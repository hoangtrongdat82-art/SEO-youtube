import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StepNavigation } from './components/StepNavigation';
import { Step1Keywords } from './components/Step1Keywords';
import { Step2Channel } from './components/Step2Channel';
import { Step3Titles } from './components/Step3Titles';
import { Step4Description } from './components/Step4Description';
import { YouTubePreview } from './components/YouTubePreview';
import { StepHashtags } from './components/StepHashtags';
import { StepThumbnailPrompt } from './components/StepThumbnailPrompt';
import { Step7Export } from './components/Step7Export';
import { Toast } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { PaymentModal } from './components/PaymentModal';
import { AdminModal } from './components/AdminModal';
import {
  AppState,
  YouTubeTitleItem,
  DescriptionData,
} from './types/seo';
import { UserSubscription } from './types/payment';
import {
  loadStoredState,
  saveStateToStorage,
  clearStoredState,
  initialAppState,
} from './utils/storage';
import { AlertCircle, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import {
  analyzeKeywordsClient,
  generateTitlesClient,
  generateDescriptionClient,
  generateHashtagsClient,
  generateThumbnailPromptClient,
} from './services/geminiClient';

const API_KEY_STORAGE_KEY = 'HOANG_VAN_DAT_CUSTOM_GEMINI_API_KEY';
const SUBSCRIPTION_STORAGE_KEY = 'HOANG_VAN_DAT_ACTIVE_SUBSCRIPTION';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadStoredState());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Gemini API Key quản lý trong localStorage
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  // Quản lý gói sử dụng & SePay
  const [subscription, setSubscription] = useState<UserSubscription | null>(() => {
    try {
      const saved = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      if (!saved) return null;
      const parsed: UserSubscription = JSON.parse(saved);
      if (new Date(parsed.expiredAt).getTime() > Date.now()) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Kiểm tra gói còn hạn hoạt động hay không
  const hasActivePlan = Boolean(
    subscription && new Date(subscription.expiredAt).getTime() > Date.now()
  );

  const daysLeft =
    subscription && hasActivePlan
      ? Math.max(0, Math.ceil((new Date(subscription.expiredAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 0;

  // Loading states
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [loadingDescription, setLoadingDescription] = useState(false);
  const [loadingHashtags, setLoadingHashtags] = useState(false);
  const [loadingThumbnailPrompt, setLoadingThumbnailPrompt] = useState(false);

  // Modal confirmation
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [pendingTopicChange, setPendingTopicChange] = useState<string | null>(null);
  const [isTopicChangeModalOpen, setIsTopicChangeModalOpen] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  // Kiểm tra đồng bộ subscription với server khi khởi động nếu có mã đơn hàng
  useEffect(() => {
    if (subscription?.orderCode) {
      fetch(`/api/orders/${subscription.orderCode}/status`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.status === 'paid' && data.expired_at) {
            if (new Date(data.expired_at).getTime() > Date.now()) {
              setSubscription((prev) => (prev ? { ...prev, expiredAt: data.expired_at } : null));
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast('Đã copy');
    } catch (err) {
      console.error('Failed to copy: ', err);
      showToast('Không thể sao chép, vui lòng thử lại');
    }
  };

  const scrollToStep = (stepId: string) => {
    const el = document.getElementById(stepId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Quản lý API Key riêng
  const handleSaveApiKey = (key: string) => {
    setCustomApiKey(key);
    try {
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
    } catch (e) {
      console.error('Failed to save API key to localStorage', e);
    }
  };

  const handleDeleteApiKey = () => {
    setCustomApiKey('');
    try {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove API key from localStorage', e);
    }
  };

  // Yêu cầu mua gói khi người dùng bấm vào các nút chức năng chính mà chưa có gói
  const handleRequirePlan = () => {
    showToast('Bạn cần mua gói để sử dụng công cụ này.');
    setIsPaymentModalOpen(true);
  };

  // Kích hoạt gói thành công từ SePay
  const handlePaymentSuccess = (sub: UserSubscription) => {
    setSubscription(sub);
    try {
      localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(sub));
    } catch (e) {
      console.error('Failed to save subscription', e);
    }
    showToast(`Đã kích hoạt thành công ${sub.planName}!`);
  };

  // Helper gửi request kèm API Key ưu tiên
  const getApiHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (customApiKey && customApiKey.trim()) {
      headers['x-gemini-api-key'] = customApiKey.trim();
    }
    return headers;
  };

  // 1. Phân tích từ khóa
  const handleAnalyzeKeywords = async () => {
    if (!hasActivePlan) {
      handleRequirePlan();
      return;
    }
    if (!state.topic || state.topic.trim().length < 5) return;
    setLoadingKeywords(true);
    setGlobalError(null);
    try {
      let data;
      try {
        const res = await fetch('/api/seo/analyze-keywords', {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify({
            topic: state.topic,
            language: state.language || 'Tiếng Việt',
            customApiKey: customApiKey || undefined,
          }),
        });

        if (res.ok) {
          data = await res.json();
        } else {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Lỗi khi gọi API máy chủ');
        }
      } catch (serverErr: any) {
        if (customApiKey && customApiKey.trim()) {
          console.warn('Fallback gọi client Gemini SDK:', serverErr);
          data = await analyzeKeywordsClient(state.topic, state.language || 'Tiếng Việt', customApiKey.trim());
        } else {
          throw serverErr;
        }
      }

      setState((prev) => ({
        ...prev,
        keywords: data,
        selectedFocusKeyword: data.focusKeyword || prev.selectedFocusKeyword,
      }));
      showToast('Đã phân tích từ khóa thành công!');
    } catch (error: any) {
      setGlobalError(error.message || 'Lỗi hệ thống');
    } finally {
      setLoadingKeywords(false);
    }
  };

  // 2. Tạo 10 tiêu đề
  const handleGenerateTitles = async () => {
    if (!hasActivePlan) {
      handleRequirePlan();
      return;
    }
    const focusKeyword = state.selectedFocusKeyword || state.keywords?.focusKeyword;
    if (!focusKeyword) return;
    setLoadingTitles(true);
    setGlobalError(null);
    try {
      let data: YouTubeTitleItem[];
      try {
        const res = await fetch('/api/seo/generate-titles', {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify({
            focusKeyword,
            channelName: state.channelName || 'YouTube',
            topic: state.topic,
            language: state.language || 'Tiếng Việt',
            customApiKey: customApiKey || undefined,
          }),
        });

        if (res.ok) {
          const resData = await res.json();
          data = Array.isArray(resData) ? resData : resData.titles || [];
        } else {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Lỗi khi gọi API máy chủ');
        }
      } catch (serverErr: any) {
        if (customApiKey && customApiKey.trim()) {
          console.warn('Fallback gọi client Gemini SDK:', serverErr);
          data = await generateTitlesClient(
            state.topic,
            state.language || 'Tiếng Việt',
            state.channelName || 'YouTube',
            focusKeyword,
            customApiKey.trim()
          );
        } else {
          throw serverErr;
        }
      }

      setState((prev) => ({
        ...prev,
        titles: data,
        selectedTitle: data[0]?.title || prev.selectedTitle,
      }));
      showToast('Đã tạo 10 tiêu đề YouTube chuẩn SEO!');
    } catch (error: any) {
      setGlobalError(error.message || 'Lỗi hệ thống');
    } finally {
      setLoadingTitles(false);
    }
  };

  // 3. Tạo mô tả
  const handleGenerateDescription = async () => {
    if (!hasActivePlan) {
      handleRequirePlan();
      return;
    }
    const focusKeyword = state.selectedFocusKeyword || state.keywords?.focusKeyword;
    if (!focusKeyword || !state.selectedTitle) return;
    setLoadingDescription(true);
    setGlobalError(null);
    try {
      let data: DescriptionData;
      try {
        const res = await fetch('/api/seo/generate-description', {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify({
            selectedTitle: state.selectedTitle,
            focusKeyword,
            channelName: state.channelName || 'YouTube',
            mainKeywords: state.keywords?.mainKeywords || [],
            secondaryKeywords: state.keywords?.secondaryKeywords || [],
            language: state.language || 'Tiếng Việt',
            topic: state.topic,
            customApiKey: customApiKey || undefined,
          }),
        });

        if (res.ok) {
          data = await res.json();
        } else {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Lỗi khi gọi API máy chủ');
        }
      } catch (serverErr: any) {
        if (customApiKey && customApiKey.trim()) {
          console.warn('Fallback gọi client Gemini SDK:', serverErr);
          data = await generateDescriptionClient(
            state.topic,
            state.language || 'Tiếng Việt',
            state.channelName || 'YouTube',
            focusKeyword,
            state.selectedTitle,
            state.keywords?.mainKeywords || [],
            customApiKey.trim()
          );
        } else {
          throw serverErr;
        }
      }

      setState((prev) => ({
        ...prev,
        descriptionData: data,
      }));
      showToast('Đã tạo mô tả chuẩn SEO & 3 Hashtag!');
    } catch (error: any) {
      setGlobalError(error.message || 'Lỗi hệ thống');
    } finally {
      setLoadingDescription(false);
    }
  };

  // 4. Gợi ý 25 Hashtag
  const handleGenerateHashtags = async () => {
    if (!hasActivePlan) {
      handleRequirePlan();
      return;
    }
    const focusKeyword = state.selectedFocusKeyword || state.keywords?.focusKeyword;
    if (!focusKeyword) return;
    setLoadingHashtags(true);
    setGlobalError(null);
    try {
      let hashtags: string[];
      try {
        const res = await fetch('/api/seo/generate-hashtags', {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify({
            topic: state.topic,
            focusKeyword,
            selectedTitle: state.selectedTitle,
            channelName: state.channelName || 'YouTube',
            language: state.language || 'Tiếng Việt',
            customApiKey: customApiKey || undefined,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          hashtags = data.hashtags || [];
        } else {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Lỗi khi gọi API máy chủ');
        }
      } catch (serverErr: any) {
        if (customApiKey && customApiKey.trim()) {
          console.warn('Fallback gọi client Gemini SDK:', serverErr);
          hashtags = await generateHashtagsClient(
            state.topic,
            state.language || 'Tiếng Việt',
            state.channelName || 'YouTube',
            focusKeyword,
            state.selectedTitle || state.topic,
            customApiKey.trim()
          );
        } else {
          throw serverErr;
        }
      }

      setState((prev) => ({
        ...prev,
        hashtagsData: hashtags,
      }));
      showToast('Đã tạo 25 Hashtag YouTube!');
    } catch (error: any) {
      setGlobalError(error.message || 'Lỗi hệ thống');
    } finally {
      setLoadingHashtags(false);
    }
  };

  // 5. Xuất Prompt Ảnh Đại Diện YouTube (Thumbnail Prompt)
  const handleGenerateThumbnailPrompt = async () => {
    if (!hasActivePlan) {
      handleRequirePlan();
      return;
    }
    const focusKeyword = state.selectedFocusKeyword || state.keywords?.focusKeyword;
    if (!focusKeyword) return;
    setLoadingThumbnailPrompt(true);
    setGlobalError(null);
    try {
      let data;
      try {
        const res = await fetch('/api/seo/generate-thumbnail-prompt', {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify({
            topic: state.topic,
            focusKeyword,
            selectedTitle: state.selectedTitle,
            channelName: state.channelName || 'YouTube',
            customApiKey: customApiKey || undefined,
          }),
        });

        if (res.ok) {
          data = await res.json();
        } else {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Lỗi khi tạo Prompt ảnh đại diện YouTube');
        }
      } catch (serverErr: any) {
        if (customApiKey && customApiKey.trim()) {
          console.warn('Fallback gọi client Gemini SDK:', serverErr);
          data = await generateThumbnailPromptClient(
            state.topic,
            state.selectedTitle || state.topic,
            focusKeyword,
            state.channelName || 'YouTube',
            customApiKey.trim()
          );
        } else {
          throw serverErr;
        }
      }

      setState((prev) => ({
        ...prev,
        thumbnailPromptData: data,
      }));
      showToast('Đã tạo Prompt Ảnh Đại Diện YouTube thành công!');
    } catch (error: any) {
      setGlobalError(error.message || 'Lỗi hệ thống');
    } finally {
      setLoadingThumbnailPrompt(false);
    }
  };

  // Reset toàn bộ
  const handleResetAll = () => {
    const defaultState = { ...initialAppState };
    defaultState.avatarUrl = state.avatarUrl;
    setState(defaultState);
    clearStoredState();
    saveStateToStorage(defaultState);
    setIsResetModalOpen(false);
    showToast('Đã làm mới dữ liệu!');
  };

  const handleTopicInputChange = (newTopic: string) => {
    const hasGeneratedData = Boolean(
      state.keywords || state.titles.length > 0 || state.descriptionData
    );

    if (hasGeneratedData && newTopic !== state.topic && newTopic.trim().length > 0) {
      setPendingTopicChange(newTopic);
      setIsTopicChangeModalOpen(true);
    } else {
      setState((prev) => ({ ...prev, topic: newTopic }));
    }
  };

  const confirmTopicChange = () => {
    if (pendingTopicChange !== null) {
      const defaultState = { ...initialAppState };
      defaultState.topic = pendingTopicChange;
      defaultState.language = state.language;
      defaultState.channelName = state.channelName;
      defaultState.avatarUrl = state.avatarUrl;
      setState(defaultState);
      saveStateToStorage(defaultState);
      setPendingTopicChange(null);
      setIsTopicChangeModalOpen(false);
      showToast('Đã chuyển sang đề tài mới!');
    }
  };

  const cancelTopicChange = () => {
    setPendingTopicChange(null);
    setIsTopicChangeModalOpen(false);
  };

  const hasData = Boolean(
    state.keywords ||
    state.titles.length > 0 ||
    state.descriptionData
  );

  const focusKeyword = state.selectedFocusKeyword || state.keywords?.focusKeyword || '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      <Toast message={toastMessage} />

      {/* Header with Avatar, Brand, API Button, and Mua Gói/Nâng Cấp SePay Button */}
      <Header
        onReset={() => setIsResetModalOpen(true)}
        hasData={hasData}
        avatarUrl={state.avatarUrl}
        onUpdateAvatarUrl={(url) => {
          setState((p) => ({ ...p, avatarUrl: url }));
          showToast('Đã cập nhật ảnh đại diện thương hiệu!');
        }}
        hasCustomApiKey={Boolean(customApiKey)}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        hasActivePlan={hasActivePlan}
        planName={subscription?.planName}
        daysLeft={daysLeft}
        onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* Main Content - Full-screen layout on desktop */}
      <main className="flex-1 w-full max-w-[1850px] mx-auto px-4 sm:px-8 xl:px-12 py-6 sm:py-8 space-y-7">
        {/* Step Navigation Bar */}
        <StepNavigation state={state} onScrollToStep={scrollToStep} />

        {/* Function Description Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-blue-900/30 border border-blue-900/40 p-5 sm:p-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-blue-500/10">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-blue-400 inline" />
                  Quy Trình SEO YouTube Top 1 Tự Động Hóa
                </span>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                  &ldquo;Nhập ý tưởng ban đầu của bạn, trí tuệ nhân tạo sẽ tự động nghiên cứu từ khóa, thiết kế 10 tiêu đề giật CTR, soạn mô tả tối ưu hóa và xuất ra bộ thẻ / Hashtag hoàn chỉnh sẵn sàng xuất bản.&rdquo;
                </p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-blue-300 bg-blue-950/60 px-4 py-2 rounded-2xl border border-blue-500/20 shrink-0">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Full Screen Mode • Máy tính</span>
            </div>
          </div>
        </div>

        {/* Banner Global Error if any */}
        {globalError && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-400 text-sm font-medium animate-shake">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{globalError}</span>
            </div>
            <button
              onClick={() => setGlobalError(null)}
              className="text-xs uppercase font-bold text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}

        {/* BƯỚC 1: Nhập đề tài & Phân tích từ khóa (có Volume & Cạnh tranh) */}
        <div id="step-1">
          <Step1Keywords
            topic={state.topic}
            language={state.language}
            keywords={state.keywords}
            selectedFocusKeyword={focusKeyword}
            loading={loadingKeywords}
            onTopicChange={handleTopicInputChange}
            onLanguageChange={(val) => setState((p) => ({ ...p, language: val }))}
            onAnalyze={handleAnalyzeKeywords}
            onSelectFocusKeyword={(kw) => {
              setState((p) => ({ ...p, selectedFocusKeyword: kw }));
              showToast(`Đã chọn từ khóa trọng tâm: "${kw}"`);
            }}
            onCopy={copyToClipboard}
            onReanalyze={handleAnalyzeKeywords}
            hasActivePlan={hasActivePlan}
            onRequirePlan={handleRequirePlan}
          />
        </div>

        {/* BƯỚC 2: Nhập tên kênh YouTube */}
        {state.keywords && (
          <div id="step-2">
            <Step2Channel
              channelName={state.channelName}
              selectedFocusKeyword={focusKeyword}
              onChannelNameChange={(val) => setState((p) => ({ ...p, channelName: val }))}
            />
          </div>
        )}

        {/* BƯỚC 3: Tạo 10 tiêu đề YouTube */}
        {state.keywords && (
          <div id="step-3">
            <Step3Titles
              titles={state.titles}
              selectedTitle={state.selectedTitle}
              focusKeyword={focusKeyword}
              channelName={state.channelName}
              loading={loadingTitles}
              onGenerateTitles={handleGenerateTitles}
              onSelectTitle={(t) => {
                setState((p) => ({ ...p, selectedTitle: t }));
                showToast('Đã chọn tiêu đề này!');
              }}
              onCopy={copyToClipboard}
              onRegenerate={handleGenerateTitles}
              hasActivePlan={hasActivePlan}
              onRequirePlan={handleRequirePlan}
            />
          </div>
        )}

        {/* BƯỚC 4: Viết mô tả YouTube */}
        {state.titles.length > 0 && (
          <div id="step-4">
            <Step4Description
              selectedTitle={state.selectedTitle}
              focusKeyword={focusKeyword}
              channelName={state.channelName}
              descriptionData={state.descriptionData}
              loading={loadingDescription}
              onGenerateDescription={handleGenerateDescription}
              onDescriptionChange={(newDesc) => {
                setState((p) => ({
                  ...p,
                  descriptionData: p.descriptionData
                    ? { ...p.descriptionData, description: newDesc }
                    : null,
                }));
              }}
              onCopy={copyToClipboard}
              onRegenerate={handleGenerateDescription}
              hasActivePlan={hasActivePlan}
              onRequirePlan={handleRequirePlan}
            />
          </div>
        )}

        {/* XEM TRƯỚC HIỂN THỊ YOUTUBE (Live Snippet Preview) */}
        {state.selectedTitle && state.descriptionData && (
          <YouTubePreview
            title={state.selectedTitle}
            channelName={state.channelName}
            description={state.descriptionData.description}
            focusKeyword={focusKeyword}
            threeHashtags={state.descriptionData.threeHashtags}
          />
        )}

        {/* BƯỚC 5: Gợi ý 25 Hashtag YouTube */}
        {state.descriptionData && (
          <div id="step-5">
            <StepHashtags
              hashtags={state.hashtagsData || []}
              focusKeyword={focusKeyword}
              loading={loadingHashtags}
              canGenerate={Boolean(state.descriptionData)}
              onGenerateHashtags={() => handleGenerateHashtags()}
              onCopy={copyToClipboard}
              onRegenerate={() => handleGenerateHashtags()}
              hasActivePlan={hasActivePlan}
              onRequirePlan={handleRequirePlan}
            />
          </div>
        )}

        {/* BƯỚC 6: Xuất Prompt Tạo Ảnh Đại Diện YouTube */}
        {state.keywords && (
          <div id="step-6">
            <StepThumbnailPrompt
              thumbnailData={state.thumbnailPromptData}
              selectedTitle={state.selectedTitle}
              focusKeyword={focusKeyword}
              loading={loadingThumbnailPrompt}
              canGenerate={Boolean(focusKeyword)}
              onGeneratePrompt={handleGenerateThumbnailPrompt}
              onCopy={copyToClipboard}
              onRegenerate={handleGenerateThumbnailPrompt}
              hasActivePlan={hasActivePlan}
              onRequirePlan={handleRequirePlan}
            />
          </div>
        )}

        {/* BƯỚC 7: Xuất file TXT */}
        {state.descriptionData && (
          <div id="step-7">
            <Step7Export
              state={state}
              onShowToast={showToast}
              onCopy={copyToClipboard}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-900/30 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <p className="font-semibold tracking-wide">
          Hoàng Văn Đạt SEO Youtube Pro | Tiện ích đưa video lên top 1 Youtube
        </p>
      </footer>

      {/* SePay Payment Modal (4 Bước: Chọn gói -> Nhập thông tin -> Quét QR -> Kích hoạt) */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        currentSubscription={subscription}
      />

      {/* Admin Panel Modal (Cấu hình SePay, quản lý gói, đơn hàng, webhook logs) */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      {/* Gemini API Key Modal */}
      <ApiKeyModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        apiKey={customApiKey}
        onSaveApiKey={handleSaveApiKey}
        onDeleteApiKey={handleDeleteApiKey}
      />

      {/* Confirm Modal khi Reset */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        title="Làm mới toàn bộ dữ liệu?"
        message="Hành động này sẽ xóa dữ liệu từ khóa, tiêu đề, mô tả và prompt hiện tại để bắt đầu một video hoàn toàn mới."
        confirmText="Làm mới ngay"
        cancelText="Giữ lại"
        onConfirm={handleResetAll}
        onCancel={() => setIsResetModalOpen(false)}
      />

      {/* Confirm Modal khi đổi đề tài mới */}
      <ConfirmModal
        isOpen={isTopicChangeModalOpen}
        title="Đổi sang đề tài video mới?"
        message="Bạn đang thay đổi đề tài. Bạn có muốn làm lại từ đầu với đề tài mới này không?"
        confirmText="Làm lại từ đầu"
        cancelText="Tiếp tục chỉnh sửa"
        onConfirm={confirmTopicChange}
        onCancel={cancelTopicChange}
      />
    </div>
  );
}

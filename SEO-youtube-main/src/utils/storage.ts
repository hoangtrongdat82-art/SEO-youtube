import { AppState } from '../types/seo';

const STORAGE_KEY = 'HOANG_VAN_DAT_SEO_YOUTUBE_PRO_V2';

export const initialAppState: AppState = {
  topic: '',
  language: 'Tiếng Việt',
  keywords: null,
  selectedFocusKeyword: '',
  channelName: '',
  titles: [],
  selectedTitle: '',
  descriptionData: null,
  thumbnailPromptData: null,
  hashtagsData: [],
  avatarUrl: 'https://drive.google.com/drive/u/0/home',
};

export function loadStoredState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialAppState;
    const parsed = JSON.parse(raw);
    return {
      ...initialAppState,
      ...parsed,
    };
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return initialAppState;
  }
}

export function saveStateToStorage(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function clearStoredState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear state from localStorage:', err);
  }
}

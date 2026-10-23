import React from 'react';
import { Check } from 'lucide-react';
import { AppState } from '../types/seo';

interface StepNavigationProps {
  state: AppState;
  onScrollToStep: (stepId: string) => void;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({ state, onScrollToStep }) => {
  const steps = [
    {
      id: 'step-1',
      num: 1,
      title: 'Từ khóa',
      isCompleted: Boolean(state.keywords),
      isCurrent: !state.keywords,
    },
    {
      id: 'step-2',
      num: 2,
      title: 'Tên kênh',
      isCompleted: Boolean(state.channelName && state.channelName.trim()),
      isCurrent: Boolean(state.keywords && !state.channelName),
    },
    {
      id: 'step-3',
      num: 3,
      title: '10 Tiêu đề',
      isCompleted: Boolean(state.titles.length > 0 && state.selectedTitle),
      isCurrent: Boolean(state.channelName && state.titles.length === 0),
    },
    {
      id: 'step-4',
      num: 4,
      title: 'Mô tả',
      isCompleted: Boolean(state.descriptionData?.description),
      isCurrent: Boolean(state.selectedTitle && !state.descriptionData),
    },
    {
      id: 'step-5',
      num: 5,
      title: '25 Hashtag',
      isCompleted: Boolean(state.hashtagsData && state.hashtagsData.length > 0),
      isCurrent: Boolean(state.descriptionData && (!state.hashtagsData || state.hashtagsData.length === 0)),
    },
    {
      id: 'step-6',
      num: 6,
      title: 'Prompt Thumbnail',
      isCompleted: Boolean(state.thumbnailPromptData),
      isCurrent: Boolean(state.hashtagsData && state.hashtagsData.length > 0 && !state.thumbnailPromptData),
    },
    {
      id: 'step-7',
      num: 7,
      title: 'Xuất TXT',
      isCompleted: Boolean(
        state.keywords &&
        state.channelName &&
        state.selectedTitle &&
        state.descriptionData &&
        state.hashtagsData &&
        state.hashtagsData.length > 0
      ),
      isCurrent: false,
    },
  ];

  return (
    <div className="bg-slate-900/80 border border-blue-900/40 rounded-2xl p-2.5 sm:p-3 overflow-x-auto shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between min-w-[640px] sm:min-w-0 gap-2">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <button
              type="button"
              onClick={() => onScrollToStep(step.id)}
              className="flex items-center gap-2 group cursor-pointer focus:outline-none"
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs transition ${
                  step.isCompleted
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/20'
                    : step.isCurrent
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400/50 shadow-md shadow-blue-600/30'
                    : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                }`}
              >
                {step.isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.num}
              </div>
              <span
                className={`text-xs font-semibold whitespace-nowrap transition ${
                  step.isCompleted
                    ? 'text-slate-300'
                    : step.isCurrent
                    ? 'text-cyan-400 font-bold'
                    : 'text-slate-500 group-hover:text-slate-300'
                }`}
              >
                {step.title}
              </span>
            </button>

            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 transition ${
                  step.isCompleted ? 'bg-emerald-500/40' : 'bg-slate-800'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

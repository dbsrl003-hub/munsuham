import React from 'react';
import { Sparkles, Cloud, DownloadCloud, FileCheck2, ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  publicCount: number;
  privateCount: number;
  totalDownloads: number;
  onGoPublic: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  publicCount,
  privateCount,
  totalDownloads,
  onGoPublic
}) => {
  return (
    <div className="relative overflow-hidden bg-forest-ink text-paper rounded-largeCard p-6 sm:p-10 shadow-darkCard mb-8 border border-spruce">
      {/* Decorative background radial pattern */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-lime-voltage/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-spruce/40 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        {/* Left Column: Huge Headline & Description */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-lime-voltage/15 text-lime-voltage text-xs font-bold tracking-wide uppercase mb-4 border border-lime-voltage/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>사회복지 시설 실무자 서식 공유 플랫폼</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-paper tracking-tight leading-[1.2] mb-4">
            사업 양식과 공용 서식을<br className="hidden sm:block" />{' '}
            <span className="text-lime-voltage underline decoration-lime-voltage/30 underline-offset-8 inline-block mt-1 sm:mt-2">
              단 한 곳에서
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-200/90 font-normal leading-relaxed max-w-xl">
            한글(HWP/HWPX), 엑셀, PDF 양식을 손쉽게 보관하고 동료들과 안전하게 공유하세요.
            클라우드와 자동 동기화되어 언제 어디서든 필요한 서식을 즉시 다운로드할 수 있습니다.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={onGoPublic}
              className="px-6 py-3 rounded-pill bg-lime-voltage hover:bg-lime-hover text-forest-ink font-bold text-sm sm:text-base transition-all transform active:scale-95 flex items-center gap-2 shadow-lg shadow-lime-voltage/20"
            >
              <span>공용 서식 둘러보기</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Right Column: Key Stats in Inset Cards */}
        <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 min-w-[280px]">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-card p-4 hover:border-lime-voltage/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-300 font-medium">기관 공용 서식</span>
              <FileCheck2 className="w-4 h-4 text-lime-voltage" />
            </div>
            <div className="text-3xl font-black text-lime-voltage">{publicCount}</div>
            <span className="text-[11px] text-slate-300">등록된 현장 표준 문서</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-card p-4 hover:border-lime-voltage/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-300 font-medium">총 다운로드</span>
              <DownloadCloud className="w-4 h-4 text-lime-voltage" />
            </div>
            <div className="text-3xl font-black text-paper">{totalDownloads.toLocaleString()}</div>
            <span className="text-[11px] text-slate-300">누적 활용 건수</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-card p-4 hover:border-lime-voltage/40 transition-all col-span-2 sm:col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2 text-xs text-slate-200 mb-1">
              <Cloud className="w-4 h-4 text-lime-voltage" />
              <span className="font-semibold text-paper">Supabase 클라우드 실시간 보관</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              등록된 모든 서식 원본 파일이 클라우드 스토리지에 안전하게 보관되어 컴퓨터 변경 시에도 안전합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

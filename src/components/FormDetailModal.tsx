import React from 'react';
import { DocumentForm, User } from '../types';
import { 
  X, 
  Download, 
  Star, 
  Clock, 
  User as UserIcon, 
  FileText, 
  FileSpreadsheet, 
  Tag, 
  CheckCircle2, 
  ShieldCheck, 
  Layers,
  Edit3
} from 'lucide-react';

interface FormDetailModalProps {
  doc: DocumentForm | null;
  onClose: () => void;
  currentUser: User;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onDownload: (doc: DocumentForm) => void;
  onEdit?: (doc: DocumentForm) => void;
}

export const FormDetailModal: React.FC<FormDetailModalProps> = ({
  doc,
  onClose,
  currentUser,
  isBookmarked,
  onToggleBookmark,
  onDownload,
  onEdit
}) => {
  if (!doc) return null;

  const canModify = currentUser.role === 'ADMIN' || currentUser.id === doc.authorId;

  const getFileBadge = () => {
    switch (doc.fileType) {
      case 'xlsx':
      case 'xls':
        return {
          icon: <FileSpreadsheet className="w-8 h-8 text-emerald-600" />,
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          label: doc.fileType.toUpperCase()
        };
      case 'pdf':
        return {
          icon: <FileText className="w-8 h-8 text-rose-600" />,
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          label: 'PDF'
        };
      default:
        return {
          icon: <FileText className="w-8 h-8 text-blue-600" />,
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          label: doc.fileType.toUpperCase()
        };
    }
  };

  const badge = getFileBadge();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-paper rounded-largeCard border border-fog p-6 sm:p-8 max-w-2xl w-full shadow-elevated relative animate-in zoom-in-95 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-pebble hover:text-forest-ink hover:bg-fog transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-card bg-fog/80 border border-fog flex items-center justify-center flex-shrink-0">
            {badge.icon}
          </div>
          <div className="flex-1 pr-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-pill text-[11px] font-extrabold border ${badge.bg}`}>
                {badge.label}
              </span>
              <span className="px-2.5 py-0.5 rounded-pill text-[11px] font-semibold bg-linen-mist text-forest-ink">
                {doc.category}
              </span>
              <span className="text-[11px] text-pebble">
                버전: {doc.version || 'v1.0'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-forest-ink leading-tight">
              {doc.title}
            </h2>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-fog/30 rounded-card p-4 border border-fog mb-6">
          <h4 className="text-xs font-bold text-pebble uppercase tracking-wider mb-2">
            서식 요약 및 활용 안내
          </h4>
          <p className="text-xs sm:text-sm text-charcoal leading-relaxed whitespace-pre-wrap">
            {doc.description || '작성된 상세 설명이 없습니다.'}
          </p>
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-xs">
          <div className="bg-white border border-fog rounded-card p-3">
            <span className="text-pebble block mb-1">등록자</span>
            <div className="font-bold text-forest-ink flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5 text-pebble" />
              <span>{doc.authorName}</span>
            </div>
            <span className="text-[10px] text-slate">{doc.authorDept}</span>
          </div>

          <div className="bg-white border border-fog rounded-card p-3">
            <span className="text-pebble block mb-1">최종 수정일</span>
            <div className="font-bold text-forest-ink flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-pebble" />
              <span>{doc.updatedAt}</span>
            </div>
            <span className="text-[10px] text-slate">등록일: {doc.createdAt}</span>
          </div>

          <div className="bg-white border border-fog rounded-card p-3">
            <span className="text-pebble block mb-1">파일 정보</span>
            <div className="font-bold text-forest-ink truncate" title={doc.fileName}>
              {doc.fileSize}
            </div>
            <span className="text-[10px] text-slate truncate block" title={doc.fileName}>
              {doc.fileName}
            </span>
          </div>

          <div className="bg-white border border-fog rounded-card p-3">
            <span className="text-pebble block mb-1">누적 다운로드</span>
            <div className="text-lg font-black text-forest-ink">
              {doc.downloadsCount}
              <span className="text-xs font-normal text-pebble ml-1">회</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">인증된 서식</span>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <span className="text-xs font-bold text-pebble block mb-2">검색 키워드 태그</span>
          <div className="flex flex-wrap gap-1.5">
            {doc.tags.map((tag, idx) => (
              <span key={idx} className="text-xs text-charcoal bg-fog px-3 py-1 rounded-pill flex items-center gap-1 font-medium">
                <Tag className="w-3 h-3 text-pebble" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Compliance Notice */}
        <div className="flex items-center gap-2 p-3 rounded-card bg-linen-light border border-lime-voltage/30 text-xs text-forest-ink mb-6">
          <ShieldCheck className="w-4 h-4 text-forest-ink flex-shrink-0" />
          <span>사회복지 사업 지침 및 표준 양식 가이드라인을 준수하여 관리되는 공용 문서입니다.</span>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-fog">
          <button
            onClick={() => onToggleBookmark(doc.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-pill text-xs font-bold transition-all border ${
              isBookmarked
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-charcoal border-fog hover:border-pebble'
            }`}
          >
            <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-500' : ''}`} />
            <span>{isBookmarked ? '즐겨찾기됨' : '즐겨찾기에 추가'}</span>
          </button>

          <div className="flex items-center gap-2">
            {canModify && onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(doc);
                }}
                className="px-4 py-2.5 rounded-pill border border-forest-ink text-forest-ink hover:bg-forest-ink hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>정보 수정</span>
              </button>
            )}

            <button
              onClick={() => {
                onDownload(doc);
              }}
              className="px-6 py-2.5 rounded-pill bg-lime-voltage hover:bg-lime-hover text-forest-ink font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all transform active:scale-95"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>양식 다운로드</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

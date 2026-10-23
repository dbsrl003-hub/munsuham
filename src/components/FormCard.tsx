import React from 'react';
import { DocumentForm, User } from '../types';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Star, 
  Clock, 
  User as UserIcon, 
  MoreVertical,
  Trash2,
  Edit3,
  Tag,
  Eye
} from 'lucide-react';

interface FormCardProps {
  doc: DocumentForm;
  currentUser: User;
  isBookmarked: boolean;
  onToggleBookmark: (docId: string) => void;
  onDownload: (doc: DocumentForm) => void;
  onViewDetail: (doc: DocumentForm) => void;
  onEdit?: (doc: DocumentForm) => void;
  onDelete?: (docId: string) => void;
}

export const FormCard: React.FC<FormCardProps> = ({
  doc,
  currentUser,
  isBookmarked,
  onToggleBookmark,
  onDownload,
  onViewDetail,
  onEdit,
  onDelete
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  // 권한: 관리자이거나 작성자인 경우 수정/삭제 가능
  const canModify = currentUser.role === 'ADMIN' || currentUser.id === doc.authorId;

  // 확장자별 뱃지 스타일 & 아이콘
  const getFileBadge = () => {
    switch (doc.fileType) {
      case 'xlsx':
      case 'xls':
        return {
          icon: <FileSpreadsheet className="w-5 h-5 text-emerald-600" />,
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          label: doc.fileType.toUpperCase()
        };
      case 'pdf':
        return {
          icon: <FileText className="w-5 h-5 text-rose-600" />,
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          label: 'PDF'
        };
      case 'hwp':
      case 'hwpx':
      default:
        return {
          icon: <FileText className="w-5 h-5 text-blue-600" />,
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          label: doc.fileType.toUpperCase()
        };
    }
  };

  const badge = getFileBadge();

  return (
    <div className="bg-paper border border-fog hover:border-forest-ink/40 transition-all duration-200 rounded-card p-5 shadow-card hover:shadow-elevated flex flex-col justify-between group relative">
      <div>
        {/* Top Header: Badge, Category, Bookmark & Action Menu */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-pill text-[11px] font-extrabold border ${badge.bg}`}>
              {badge.label}
            </span>
            <span className="px-2.5 py-0.5 rounded-pill text-[11px] font-semibold bg-linen-mist text-forest-ink">
              {doc.category}
            </span>
            {!doc.isPublic && (
              <span className="px-2 py-0.5 rounded-pill text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                개인보관
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Bookmark Button */}
            <button
              onClick={() => onToggleBookmark(doc.id)}
              className={`p-1.5 rounded-full hover:bg-fog transition-colors ${
                isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-pebble hover:text-charcoal'
              }`}
              title={isBookmarked ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            >
              <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-500' : ''}`} />
            </button>

            {/* Edit/Delete Menu (if authorized) */}
            {canModify && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1.5 text-pebble hover:text-forest-ink rounded-full hover:bg-fog"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <div 
                    className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-elevated border border-fog p-1 z-30 animate-in fade-in-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {onEdit && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit(doc);
                        }}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-charcoal hover:bg-fog rounded flex items-center gap-2"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate" />
                        <span>수정하기</span>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          if (confirm(`'${doc.title}' 서식을 삭제하시겠습니까?`)) {
                            onDelete(doc.id);
                          }
                        }}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-alarm-red hover:bg-alarm-light rounded flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>삭제하기</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onViewDetail(doc)}
          className="text-base font-bold text-forest-ink group-hover:text-spruce transition-colors line-clamp-2 cursor-pointer leading-snug mb-2"
          title={doc.title}
        >
          {doc.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate line-clamp-2 leading-relaxed mb-4">
          {doc.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {doc.tags.map((tag, idx) => (
            <span key={idx} className="text-[10px] text-pebble bg-fog/80 px-2 py-0.5 rounded-pill flex items-center gap-0.5">
              <Tag className="w-2.5 h-2.5 opacity-60" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Footer: Meta information & Action Buttons */}
      <div className="pt-3 border-t border-fog/80">
        <div className="flex items-center justify-between text-[11px] text-slate mb-3">
          <div className="flex items-center gap-1.5">
            <UserIcon className="w-3.5 h-3.5 text-pebble" />
            <span>{doc.authorName}</span>
            <span className="text-pebble">({doc.authorDept})</span>
          </div>
          <div className="flex items-center gap-1 text-pebble">
            <Clock className="w-3.5 h-3.5" />
            <span>{doc.updatedAt}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-semibold text-charcoal">
            <span className="text-pebble font-normal">다운 </span>
            <span className="text-forest-ink font-bold">{doc.downloadsCount}</span>회
            <span className="text-pebble mx-1.5 font-normal">·</span>
            <span className="text-pebble font-normal">{doc.fileSize}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetail(doc)}
              className="p-2 rounded-pill text-slate hover:text-forest-ink hover:bg-fog border border-transparent hover:border-fog transition-all"
              title="상세보기"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDownload(doc)}
              className="px-3.5 py-1.5 rounded-pill bg-lime-voltage hover:bg-lime-hover text-forest-ink font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>다운로드</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

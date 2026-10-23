import React, { useState, useEffect } from 'react';
import { DocumentForm, User, Category, FileType } from '../types';
import { CATEGORIES } from '../mockData';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Tag, 
  Layers, 
  Lock, 
  Globe2,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Partial<DocumentForm>, file?: File) => void;
  currentUser: User;
  editDocument?: DocumentForm | null;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  editDocument
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Exclude<Category, '전체'>>('사례관리');
  const [fileType, setFileType] = useState<FileType>('hwp');
  const [isPublic, setIsPublic] = useState(true);
  const [tagsInput, setTagsInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  useEffect(() => {
    if (editDocument) {
      setTitle(editDocument.title);
      setDescription(editDocument.description);
      setCategory(editDocument.category);
      setFileType(editDocument.fileType);
      setIsPublic(editDocument.isPublic);
      setTagsInput(editDocument.tags.join(', '));
      setAttachedFile(null);
    } else {
      setTitle('');
      setDescription('');
      setCategory('사례관리');
      setFileType('hwp');
      setIsPublic(true);
      setTagsInput('');
      setAttachedFile(null);
    }
  }, [editDocument, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedFile(file);
      // 파일명에서 확장자 추출 및 자동 반영
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext && ['hwp', 'hwpx', 'xlsx', 'xls', 'pdf'].includes(ext)) {
        setFileType(ext as FileType);
      }
      // 제목이 비어있으면 파일명 기본 입력
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('서식 제목을 입력해주세요.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const docPayload: Partial<DocumentForm> = {
      title,
      description,
      category,
      fileType,
      isPublic,
      tags: tags.length > 0 ? tags : ['기본서식'],
      fileName: attachedFile ? attachedFile.name : (editDocument?.fileName || `${title}.${fileType}`),
      fileSize: attachedFile ? `${(attachedFile.size / 1024).toFixed(1)} KB` : (editDocument?.fileSize || '120 KB'),
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSubmit(docPayload, attachedFile || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-paper rounded-largeCard border border-fog p-6 sm:p-8 max-w-xl w-full shadow-elevated relative animate-in zoom-in-95 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-pebble hover:text-forest-ink hover:bg-fog transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-linen-mist text-forest-ink text-xs font-bold uppercase mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>{editDocument ? '서식 수정' : '신규 서식 등록'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-forest-ink">
            {editDocument ? '서식 정보 변경' : '새로운 현장 서식 보관'}
          </h2>
          <p className="text-xs text-slate mt-1">
            등록된 양식은 보관함 정책에 따라 안전하게 공유 및 활용됩니다.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Attachment Drag & Select */}
          <div>
            <label className="block text-xs font-bold text-forest-ink mb-1.5">
              서식 원본 파일 첨부 (선택)
            </label>
            <label className="border-2 border-dashed border-pebble/40 hover:border-forest-ink rounded-card p-4 flex items-center justify-center gap-3 cursor-pointer bg-fog/20 hover:bg-linen-light transition-all">
              <input
                type="file"
                accept=".hwp,.hwpx,.xlsx,.xls,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="w-6 h-6 text-forest-ink" />
              <div className="text-xs text-left">
                {attachedFile ? (
                  <span className="font-bold text-forest-ink">
                    선택됨: {attachedFile.name} ({(attachedFile.size / 1024).toFixed(1)} KB)
                  </span>
                ) : (
                  <>
                    <span className="font-bold text-forest-ink">파일 찾아보기</span>
                    <span className="text-slate"> 또는 여기에 드래그 (.hwp, .hwpx, .xlsx, .pdf)</span>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-forest-ink mb-1">
              서식 명칭 <span className="text-alarm-red">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2026년도 대상자 초기상담 및 욕구사정 기록지"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-input border border-pebble/60 focus:border-forest-ink focus:outline-none text-charcoal font-medium"
            />
          </div>

          {/* Category & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-forest-ink mb-1">
                업무 카테고리
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 text-xs rounded-input border border-pebble/60 focus:border-forest-ink focus:outline-none bg-white text-charcoal font-medium"
              >
                {CATEGORIES.filter(c => c !== '전체').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-ink mb-1">
                파일 형식
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as FileType)}
                className="w-full px-3 py-2.5 text-xs rounded-input border border-pebble/60 focus:border-forest-ink focus:outline-none bg-white text-charcoal font-medium"
              >
                <option value="hwp">한글 (HWP)</option>
                <option value="hwpx">한글 표준 (HWPX)</option>
                <option value="xlsx">엑셀 (XLSX)</option>
                <option value="xls">엑셀 97-2003 (XLS)</option>
                <option value="pdf">PDF 문서</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-forest-ink mb-1">
              서식 설명 및 작성 가이드
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이 서식의 주요 용도, 필수 기재 항목, 관련 규정 등을 간단히 메모하세요..."
              className="w-full px-3.5 py-2 text-xs rounded-input border border-pebble/60 focus:border-forest-ink focus:outline-none text-charcoal resize-none"
            />
          </div>

          {/* Scope: Public vs Private */}
          <div>
            <label className="block text-xs font-bold text-forest-ink mb-1.5">
              보관함 공개 범위
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`p-3 rounded-card text-left border transition-all flex items-start gap-2.5 ${
                  isPublic 
                    ? 'border-forest-ink bg-linen-mist/60 text-forest-ink font-bold shadow-sm' 
                    : 'border-fog bg-white text-charcoal hover:bg-fog/50'
                }`}
              >
                <Globe2 className="w-4 h-4 mt-0.5 text-forest-ink" />
                <div>
                  <div className="text-xs font-bold">기관 공용 서식함</div>
                  <div className="text-[10px] text-slate font-normal">승인된 모든 직원이 열람 및 다운로드</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`p-3 rounded-card text-left border transition-all flex items-start gap-2.5 ${
                  !isPublic 
                    ? 'border-forest-ink bg-linen-mist/60 text-forest-ink font-bold shadow-sm' 
                    : 'border-fog bg-white text-charcoal hover:bg-fog/50'
                }`}
              >
                <Lock className="w-4 h-4 mt-0.5 text-forest-ink" />
                <div>
                  <div className="text-xs font-bold">나의 개인 보관함</div>
                  <div className="text-[10px] text-slate font-normal">본인 계정에서만 관리 및 사용</div>
                </div>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-forest-ink mb-1">
              검색 태그 (쉼표로 구분)
            </label>
            <div className="relative">
              <Tag className="w-3.5 h-3.5 text-pebble absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="예: 초기상담, 사례회의, 2026서식, 예산서"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-input border border-pebble/60 focus:border-forest-ink focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-fog mt-6">
            <span className="text-[11px] text-pebble">
              등록자: <strong className="text-forest-ink">{currentUser.name}</strong> ({currentUser.department})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-pill bg-fog hover:bg-pebble/20 text-charcoal text-xs font-semibold"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-pill bg-lime-voltage hover:bg-lime-hover text-forest-ink text-xs font-bold shadow-sm transition-all transform active:scale-95"
              >
                {editDocument ? '수정사항 저장' : '서식 등록 완료'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

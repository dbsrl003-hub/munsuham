import React, { useState, useMemo } from 'react';
import { DocumentForm, User, Category, FileType } from '../types';
import { CATEGORIES } from '../mockData';
import { FormCard } from './FormCard';
import { 
  Search, 
  Filter, 
  Star, 
  LayoutGrid, 
  List, 
  FileCheck2, 
  Download, 
  Sparkles,
  ArrowUpDown,
  FolderOpen,
  FileQuestion
} from 'lucide-react';

interface FormVaultProps {
  documents: DocumentForm[];
  currentUser: User;
  activeTab: 'PUBLIC' | 'PRIVATE';
  bookmarks: string[];
  onToggleBookmark: (id: string) => void;
  onDownload: (doc: DocumentForm) => void;
  onViewDetail: (doc: DocumentForm) => void;
  onEdit: (doc: DocumentForm) => void;
  onDelete: (id: string) => void;
  onOpenUpload: () => void;
  recentDownloads: { id: string; title: string; downloadedAt: string; fileName: string }[];
}

export const FormVault: React.FC<FormVaultProps> = ({
  documents,
  currentUser,
  activeTab,
  bookmarks,
  onToggleBookmark,
  onDownload,
  onViewDetail,
  onEdit,
  onDelete,
  onOpenUpload,
  recentDownloads
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체');
  const [selectedFormat, setSelectedFormat] = useState<'ALL' | 'HWP' | 'XLS' | 'PDF'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [sortBy, setSortBy] = useState<'NEWEST' | 'POPULAR' | 'TITLE'>('NEWEST');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

  // 필터링 및 정렬 파이프라인
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // 1. 공용 vs 개인 탭 분기
      if (activeTab === 'PUBLIC' && !doc.isPublic) return false;
      if (activeTab === 'PRIVATE') {
        // 개인 양식은 본인이 작성했거나 비공개 양식인 경우
        if (doc.authorId !== currentUser.id && doc.isPublic) return false;
      }

      // 2. 카테고리 필터
      if (selectedCategory !== '전체' && doc.category !== selectedCategory) {
        return false;
      }

      // 3. 파일 포맷 필터
      if (selectedFormat === 'HWP') {
        if (doc.fileType !== 'hwp' && doc.fileType !== 'hwpx') return false;
      } else if (selectedFormat === 'XLS') {
        if (doc.fileType !== 'xlsx' && doc.fileType !== 'xls') return false;
      } else if (selectedFormat === 'PDF') {
        if (doc.fileType !== 'pdf') return false;
      }

      // 4. 즐겨찾기 필터
      if (onlyBookmarks && !bookmarks.includes(doc.id)) {
        return false;
      }

      // 5. 검색어 필터
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = doc.title.toLowerCase().includes(q);
        const inDesc = doc.description.toLowerCase().includes(q);
        const inTags = doc.tags.some(t => t.toLowerCase().includes(q));
        const inAuthor = doc.authorName.toLowerCase().includes(q);
        const inDept = doc.authorDept.toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inTags && !inAuthor && !inDept) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'POPULAR') {
        return b.downloadsCount - a.downloadsCount;
      } else if (sortBy === 'TITLE') {
        return a.title.localeCompare(b.title, 'ko');
      } else {
        // NEWEST
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  }, [documents, activeTab, currentUser.id, selectedCategory, selectedFormat, onlyBookmarks, bookmarks, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Recent Downloads Ticker / Quick Access (if any) */}
      {recentDownloads.length > 0 && (
        <div className="bg-linen-light border border-lime-voltage/30 rounded-card p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-forest-ink text-xs font-bold">
            <Download className="w-4 h-4 text-forest-ink" />
            <span>최근 다운로드한 서식:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto max-w-full">
            {recentDownloads.slice(0, 3).map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-white text-xs font-semibold text-charcoal border border-fog shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-lime-voltage" />
                <span className="truncate max-w-[180px]">{item.title}</span>
                <span className="text-[10px] text-pebble">{item.downloadedAt}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Search Bar Container */}
      <div className="bg-paper border border-fog rounded-card p-4 sm:p-6 shadow-card space-y-4">
        {/* Search & Top Action Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-pebble absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="서식명, 업무 태그, 등록자 이름, 설명 검색..."
              className="w-full pl-10 pr-4 py-2.5 rounded-input border border-pebble/60 focus:border-forest-ink focus:outline-none text-sm transition-all text-charcoal placeholder:text-pebble"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-pebble hover:text-charcoal"
              >
                지우기
              </button>
            )}
          </div>

          {/* Quick Filter Controls: Format, Bookmark, Sort & View Mode */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Format Dropdown/Pills */}
            <div className="flex items-center p-1 bg-fog rounded-pill text-xs font-semibold">
              <button
                onClick={() => setSelectedFormat('ALL')}
                className={`px-3 py-1.5 rounded-pill transition-all ${
                  selectedFormat === 'ALL' ? 'bg-white text-forest-ink shadow-sm' : 'text-slate hover:text-charcoal'
                }`}
              >
                전체형식
              </button>
              <button
                onClick={() => setSelectedFormat('HWP')}
                className={`px-3 py-1.5 rounded-pill transition-all ${
                  selectedFormat === 'HWP' ? 'bg-white text-forest-ink shadow-sm' : 'text-slate hover:text-charcoal'
                }`}
              >
                한글(HWP)
              </button>
              <button
                onClick={() => setSelectedFormat('XLS')}
                className={`px-3 py-1.5 rounded-pill transition-all ${
                  selectedFormat === 'XLS' ? 'bg-white text-forest-ink shadow-sm' : 'text-slate hover:text-charcoal'
                }`}
              >
                엑셀
              </button>
              <button
                onClick={() => setSelectedFormat('PDF')}
                className={`px-3 py-1.5 rounded-pill transition-all ${
                  selectedFormat === 'PDF' ? 'bg-white text-forest-ink shadow-sm' : 'text-slate hover:text-charcoal'
                }`}
              >
                PDF
              </button>
            </div>

            {/* Bookmark Filter Toggle */}
            <button
              onClick={() => setOnlyBookmarks(!onlyBookmarks)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-pill text-xs font-bold transition-all border ${
                onlyBookmarks 
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm' 
                  : 'bg-white text-slate border-fog hover:border-pebble'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyBookmarks ? 'fill-amber-500 text-amber-600' : ''}`} />
              <span>즐겨찾기 ({bookmarks.length})</span>
            </button>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="서식 정렬 기준"
                className="appearance-none bg-white border border-fog hover:border-pebble text-xs font-semibold text-charcoal py-2 pl-3 pr-8 rounded-pill focus:outline-none cursor-pointer"
              >
                <option value="NEWEST">최신 등록순</option>
                <option value="POPULAR">인기 다운로드순</option>
                <option value="TITLE">가나다 이름순</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-pebble absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Grid / List View Toggle */}
            <div className="hidden sm:flex items-center p-1 bg-fog rounded-pill">
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-full transition-all ${
                  viewMode === 'GRID' ? 'bg-white text-forest-ink shadow-sm' : 'text-pebble hover:text-charcoal'
                }`}
                title="카드 그리드형 보기"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`p-1.5 rounded-full transition-all ${
                  viewMode === 'LIST' ? 'bg-white text-forest-ink shadow-sm' : 'text-pebble hover:text-charcoal'
                }`}
                title="목록 리스트형 보기"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Bar (Wise Segmented Style) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-fog/60">
          <div className="flex items-center gap-1.5 min-w-max">
            <span className="text-xs font-bold text-pebble mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> 분야:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-pill text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-forest-ink text-lime-voltage font-bold shadow-sm'
                    : 'bg-fog/70 hover:bg-fog text-charcoal'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vault Status Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold text-forest-ink tracking-tight flex items-center gap-2">
            {activeTab === 'PUBLIC' ? '기관 공용 서식함' : '나의 개인 보관함'}
          </h2>
          <span className="px-2 py-0.5 rounded-pill bg-linen-mist text-forest-ink text-xs font-bold">
            총 {filteredDocuments.length}개 서식
          </span>
        </div>

        {currentUser.role !== 'PENDING' && (
          <button
            onClick={onOpenUpload}
            className="sm:hidden text-xs font-bold text-forest-ink bg-lime-voltage px-3 py-1.5 rounded-pill shadow-sm"
          >
            + 새 서식
          </button>
        )}
      </div>

      {/* Main Content Area: Cards or Empty State */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-paper border border-dashed border-pebble/40 rounded-card p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-fog flex items-center justify-center text-pebble mb-4">
            <FileQuestion className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-forest-ink mb-1">일치하는 서식이 없습니다</h3>
          <p className="text-xs text-slate max-w-sm mb-4">
            검색어 또는 선택한 카테고리/포맷 필터를 변경해보시거나, 새로운 업무 서식을 직접 등록해보세요.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedCategory('전체');
                setSelectedFormat('ALL');
                setSearchQuery('');
                setOnlyBookmarks(false);
              }}
              className="px-4 py-2 rounded-pill bg-fog hover:bg-pebble/20 text-charcoal text-xs font-bold transition-all"
            >
              필터 초기화
            </button>
            {currentUser.role !== 'PENDING' && (
              <button
                onClick={onOpenUpload}
                className="px-4 py-2 rounded-pill bg-lime-voltage hover:bg-lime-hover text-forest-ink text-xs font-bold transition-all"
              >
                + 새 서식 등록하기
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'GRID' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => (
            <FormCard
              key={doc.id}
              doc={doc}
              currentUser={currentUser}
              isBookmarked={bookmarks.includes(doc.id)}
              onToggleBookmark={onToggleBookmark}
              onDownload={onDownload}
              onViewDetail={onViewDetail}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-paper border border-fog rounded-card overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-fog/70 border-b border-fog text-charcoal uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">형식</th>
                  <th className="py-3 px-4">서식 제목 및 설명</th>
                  <th className="py-3 px-4 w-28">분야</th>
                  <th className="py-3 px-4 w-28">등록자</th>
                  <th className="py-3 px-4 w-24">수정일</th>
                  <th className="py-3 px-4 w-20 text-center">다운</th>
                  <th className="py-3 px-4 w-28 text-center">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fog">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-linen-light/50 transition-colors group">
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-fog text-forest-ink">
                        {doc.fileType.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div 
                        onClick={() => onViewDetail(doc)}
                        className="font-bold text-forest-ink hover:text-spruce cursor-pointer text-sm"
                      >
                        {doc.title}
                      </div>
                      <div className="text-slate text-[11px] truncate max-w-md">{doc.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-pill bg-linen-mist text-forest-ink text-[11px] font-semibold">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-charcoal">{doc.authorName}</div>
                      <div className="text-[10px] text-pebble">{doc.authorDept}</div>
                    </td>
                    <td className="py-3 px-4 text-pebble">{doc.updatedAt}</td>
                    <td className="py-3 px-4 text-center font-bold text-forest-ink">{doc.downloadsCount}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onToggleBookmark(doc.id)}
                          className="p-1.5 rounded-full hover:bg-fog text-pebble hover:text-amber-500"
                        >
                          <Star className={`w-3.5 h-3.5 ${bookmarks.includes(doc.id) ? 'fill-amber-400 text-amber-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => onDownload(doc)}
                          className="px-2.5 py-1 rounded-pill bg-lime-voltage hover:bg-lime-hover text-forest-ink font-bold text-xs flex items-center gap-1 shadow-sm"
                        >
                          <Download className="w-3 h-3 stroke-[2.5]" />
                          <span>다운</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

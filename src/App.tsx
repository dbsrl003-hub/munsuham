import React, { useState, useEffect } from 'react';
import { User, DocumentForm, UserRole } from './types';
import { INITIAL_USERS, INITIAL_DOCUMENTS } from './mockData';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { FormVault } from './components/FormVault';
import { PasswordDecryptor } from './components/PasswordDecryptor';
import { AdminUserManagement } from './components/AdminUserManagement';
import { UploadModal } from './components/UploadModal';
import { FormDetailModal } from './components/FormDetailModal';
import { downloadSampleOrBlob } from './utils/fileDecryption';
import { saveFileToIndexedDB, deleteFileFromIndexedDB } from './utils/indexedDb';
import { 
  isSupabaseConfigured, 
  fetchDocumentsFromSupabase, 
  fetchUsersFromSupabase, 
  uploadFileToSupabaseStorage, 
  insertDocumentToSupabase, 
  deleteDocumentFromSupabase, 
  updateProfileRoleInSupabase, 
  insertProfileToSupabase,
  incrementDownloadCountInSupabase
} from './utils/supabaseClient';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { LoginModal } from './components/LoginModal';
import { Lock, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  // 1. 사용자 목록 & 현재 접속 사용자
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('welfare_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // 세션 복원 또는 기본 admin 자동 세션
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedSession = localStorage.getItem('welfare_auth_session');
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch (e) {}
    }
    return INITIAL_USERS[0];
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 2. 문서 서식 데이터
  const [documents, setDocuments] = useState<DocumentForm[]>(() => {
    const saved = localStorage.getItem('welfare_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  // 3. 북마크 목록
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('welfare_bookmarks');
    return saved ? JSON.parse(saved) : ['doc-001', 'doc-003'];
  });

  // 4. 최근 다운로드 이력
  const [recentDownloads, setRecentDownloads] = useState<
    { id: string; title: string; downloadedAt: string; fileName: string }[]
  >(() => {
    const saved = localStorage.getItem('welfare_recent_downloads');
    return saved ? JSON.parse(saved) : [];
  });

  // 5. 탭 제어
  const [currentTab, setCurrentTab] = useState<'PUBLIC' | 'PRIVATE' | 'DECRYPT' | 'ADMIN'>('PUBLIC');

  // 6. 모달 제어
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentForm | null>(null);
  const [viewingDoc, setViewingDoc] = useState<DocumentForm | null>(null);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [cloudVersion, setCloudVersion] = useState(0);

  // Supabase 클라우드 데이터 동기화
  useEffect(() => {
    if (isSupabaseConfigured()) {
      // 1. 클라우드에서 문서 서식 조회
      fetchDocumentsFromSupabase().then((cloudDocs) => {
        if (cloudDocs && cloudDocs.length > 0) {
          setDocuments(cloudDocs);
        }
      });

      // 2. 클라우드에서 사용자 조회
      fetchUsersFromSupabase().then((cloudUsers) => {
        if (cloudUsers && cloudUsers.length > 0) {
          setUsers(cloudUsers);
        }
      });
    }
  }, [cloudVersion]);

  // 로컬스토리지 동기화
  useEffect(() => {
    localStorage.setItem('welfare_users', JSON.stringify(users));
  }, [users]);

  // 로그인 및 세션 관리
  const handleLogin = (user: User, autoLogin: boolean) => {
    setCurrentUser(user);
    if (autoLogin) {
      localStorage.setItem('welfare_auth_session', JSON.stringify(user));
    } else {
      sessionStorage.setItem('welfare_auth_session', JSON.stringify(user));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('welfare_auth_session');
    sessionStorage.removeItem('welfare_auth_session');
    // 기본 admin 세션으로 리셋하거나 로그인 모달 표시
    setIsLoginModalOpen(true);
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('welfare_auth_session', JSON.stringify(user));
  };

  useEffect(() => {
    localStorage.setItem('welfare_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('welfare_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('welfare_recent_downloads', JSON.stringify(recentDownloads));
  }, [recentDownloads]);

  // 핸들러들
  const handleToggleBookmark = (docId: string) => {
    setBookmarks(prev => 
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const handleDownload = async (doc: DocumentForm) => {
    try {
      // 1. 파일 다운로드 실행
      await downloadSampleOrBlob(doc);

      // 2. 다운로드 카운트 증가
      setDocuments(prev =>
        prev.map(d => (d.id === doc.id ? { ...d, downloadsCount: d.downloadsCount + 1 } : d))
      );
      if (isSupabaseConfigured()) {
        incrementDownloadCountInSupabase(doc.id);
      }

      // 3. 최근 다운로드 목록 업데이트
      const newEntry = {
        id: doc.id,
        title: doc.title,
        downloadedAt: '방금 전',
        fileName: doc.fileName
      };
      setRecentDownloads(prev => [newEntry, ...prev.filter(p => p.id !== doc.id)].slice(0, 5));
    } catch (err) {
      console.error('다운로드 오류:', err);
      alert('파일 다운로드 중 오류가 발생했습니다: ' + err);
    }
  };

  const handleSaveDocument = async (formData: Partial<DocumentForm>, file?: File) => {
    if (editingDoc) {
      // 수정
      const docId = editingDoc.id;
      let storagePath = editingDoc.sampleContentUrl;

      if (file) {
        await saveFileToIndexedDB(docId, file);
        if (isSupabaseConfigured()) {
          const res = await uploadFileToSupabaseStorage(file, docId);
          if (res) storagePath = res.path;
        }
      }

      const updated = {
        ...editingDoc,
        ...formData,
        sampleContentUrl: storagePath
      } as DocumentForm;

      setDocuments(prev => prev.map(d => (d.id === docId ? updated : d)));
      if (isSupabaseConfigured()) {
        await insertDocumentToSupabase(updated, storagePath);
      }
      setEditingDoc(null);
    } else {
      // 신규 등록
      const docId = 'doc-' + Date.now();
      let storagePath: string | undefined = undefined;

      if (file) {
        // 로컬 IndexedDB에 항상 저장
        await saveFileToIndexedDB(docId, file);
        // Supabase 연동 시 클라우드 스토리지에도 업로드
        if (isSupabaseConfigured()) {
          const res = await uploadFileToSupabaseStorage(file, docId);
          if (res) storagePath = res.path;
        }
      }

      const newDoc: DocumentForm = {
        id: docId,
        title: formData.title || '새 서식',
        description: formData.description || '',
        category: formData.category || '이용자',
        fileType: formData.fileType || 'hwp',
        fileName: formData.fileName || (file ? file.name : '서식문서.hwp'),
        fileSize: formData.fileSize || (file ? `${(file.size / 1024).toFixed(1)} KB` : '100 KB'),
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorDept: currentUser.department,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        isPublic: formData.isPublic ?? true,
        downloadsCount: 0,
        tags: formData.tags || ['신규'],
        version: 'v1.0',
        sampleContentUrl: storagePath
      };

      setDocuments(prev => [newDoc, ...prev]);

      if (isSupabaseConfigured()) {
        await insertDocumentToSupabase(newDoc, storagePath);
      }
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    await deleteFileFromIndexedDB(docId);
    if (isSupabaseConfigured()) {
      await deleteDocumentFromSupabase(docId);
    }
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  // 회원 관리 핸들러
  const handleApproveUser = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setUsers(prev =>
      prev.map(u =>
        u.id === userId
          ? {
              ...u,
              role: 'STAFF',
              approvedAt: today
            }
          : u
      )
    );
    if (isSupabaseConfigured()) {
      await updateProfileRoleInSupabase(userId, 'STAFF', today);
    }
  };

  const handleRejectUser = (userId: string) => {
    if (confirm('해당 사용자의 가입 신청을 반려하시겠습니까?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: UserRole) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (isSupabaseConfigured()) {
      await updateProfileRoleInSupabase(userId, newRole);
    }
  };

  const handleAddUser = async (newUserData: Partial<User>) => {
    const newUser: User = {
      id: 'user-' + Date.now(),
      name: newUserData.name || '신규직원',
      email: newUserData.email || 'user@sw-welfare.or.kr',
      department: newUserData.department || '사례관리팀',
      position: newUserData.position || '사회복지사',
      role: 'PENDING',
      joinedAt: new Date().toISOString().split('T')[0],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUserData.name || '신규')}&background=163300&color=9fe870`
    };
    setUsers(prev => [...prev, newUser]);
    if (isSupabaseConfigured()) {
      await insertProfileToSupabase(newUser);
    }
  };

  // 통계 계산
  const publicCount = documents.filter(d => d.isPublic).length;
  const privateCount = documents.filter(d => !d.isPublic && d.authorId === currentUser.id).length;
  const totalDownloads = documents.reduce((sum, d) => sum + d.downloadsCount, 0);
  const pendingCount = users.filter(u => u.role === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#fafbfa] text-charcoal flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        allUsers={users}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenUploadModal={() => {
          setEditingDoc(null);
          setIsUploadOpen(true);
        }}
        pendingCount={pendingCount}
        isCloudConnected={isSupabaseConfigured()}
        onOpenCloudConfig={() => setIsCloudModalOpen(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* 승인 대기자(PENDING) 계정일 경우 접근 제한 및 안내 카드 표시 */}
        {currentUser.role === 'PENDING' ? (
          <div className="max-w-2xl mx-auto my-12 bg-paper border border-amber-200 rounded-largeCard p-8 text-center shadow-card">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-forest-ink mb-2">가입 승인 대기 중입니다</h2>
            <p className="text-sm text-slate leading-relaxed mb-6">
              <strong className="text-forest-ink">{currentUser.name}</strong>님의 회원가입 신청이 정상 접수되었습니다.<br />
              사회복지 시설 보안 규정에 따라 최고 관리자(김복지 부장)의 승인 후 공용 서식함과 암호 해제 서비스를 이용하실 수 있습니다.
            </p>

            <div className="bg-fog/60 p-4 rounded-card text-xs text-charcoal max-w-md mx-auto mb-6 text-left space-y-1.5">
              <div>• 신청자 이메일: <strong>{currentUser.email}</strong></div>
              <div>• 소속 부서: <strong>{currentUser.department} ({currentUser.position})</strong></div>
              <div>• 신청 일자: <strong>{currentUser.joinedAt}</strong></div>
            </div>

            <div className="pt-4 border-t border-fog flex flex-col sm:flex-row items-center justify-center gap-3">
              <span className="text-xs text-pebble">빠른 테스트를 원하시나요?</span>
              <button
                onClick={() => {
                  const admin = users.find(u => u.role === 'ADMIN') || users[0];
                  handleSwitchUser(admin);
                  setCurrentTab('ADMIN');
                }}
                className="px-4 py-2 rounded-pill bg-forest-ink hover:bg-forest-dark text-lime-voltage text-xs font-bold transition-all shadow-sm"
              >
                관리자 계정으로 전환하여 지금 승인하기
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Banner (Only shown on Public / Private tab) */}
            {(currentTab === 'PUBLIC' || currentTab === 'PRIVATE') && (
              <HeroBanner
                publicCount={publicCount}
                privateCount={privateCount}
                totalDownloads={totalDownloads}
                onGoDecrypt={() => setCurrentTab('DECRYPT')}
                onGoPublic={() => setCurrentTab('PUBLIC')}
              />
            )}

            {/* Tab Views */}
            {currentTab === 'PUBLIC' && (
              <FormVault
                documents={documents}
                currentUser={currentUser}
                activeTab="PUBLIC"
                bookmarks={bookmarks}
                onToggleBookmark={handleToggleBookmark}
                onDownload={handleDownload}
                onViewDetail={setViewingDoc}
                onEdit={(doc) => {
                  setEditingDoc(doc);
                  setIsUploadOpen(true);
                }}
                onDelete={handleDeleteDocument}
                onOpenUpload={() => {
                  setEditingDoc(null);
                  setIsUploadOpen(true);
                }}
                recentDownloads={recentDownloads}
              />
            )}

            {currentTab === 'PRIVATE' && (
              <FormVault
                documents={documents}
                currentUser={currentUser}
                activeTab="PRIVATE"
                bookmarks={bookmarks}
                onToggleBookmark={handleToggleBookmark}
                onDownload={handleDownload}
                onViewDetail={setViewingDoc}
                onEdit={(doc) => {
                  setEditingDoc(doc);
                  setIsUploadOpen(true);
                }}
                onDelete={handleDeleteDocument}
                onOpenUpload={() => {
                  setEditingDoc(null);
                  setIsUploadOpen(true);
                }}
                recentDownloads={recentDownloads}
              />
            )}

            {currentTab === 'DECRYPT' && <PasswordDecryptor />}

            {currentTab === 'ADMIN' && currentUser.role === 'ADMIN' && (
              <AdminUserManagement
                users={users}
                onApproveUser={handleApproveUser}
                onRejectUser={handleRejectUser}
                onChangeUserRole={handleChangeUserRole}
                onAddUser={handleAddUser}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-fog bg-white py-8 text-xs text-pebble">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-forest-ink">복지서식함 &amp; 암호해제</span>
            <span>·</span>
            <span>사회복지 현장 스마트 업무 솔루션</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>100% 브라우저 인메모리 암호해제</span>
            <span>·</span>
            <span>개인정보보호법 및 공문서 관리 규정 준수</span>
          </div>
        </div>
      </footer>

      {/* Upload / Edit Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setEditingDoc(null);
        }}
        onSubmit={handleSaveDocument}
        currentUser={currentUser}
        editDocument={editingDoc}
      />

      {/* Detail Modal */}
      <FormDetailModal
        doc={viewingDoc}
        onClose={() => setViewingDoc(null)}
        currentUser={currentUser}
        isBookmarked={viewingDoc ? bookmarks.includes(viewingDoc.id) : false}
        onToggleBookmark={handleToggleBookmark}
        onDownload={handleDownload}
        onEdit={(doc) => {
          setViewingDoc(null);
          setEditingDoc(doc);
          setIsUploadOpen(true);
        }}
      />

      {/* Supabase Cloud Config Modal */}
      <SupabaseConfigModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        onConfigChanged={() => setCloudVersion(v => v + 1)}
      />

      {/* Login & Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        allUsers={users}
      />
    </div>
  );
};

export default App;

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DocumentForm, User, UserRole } from '../types';

// 환경 변수 또는 로컬스토리지에 저장된 설정 조회
const getEnv = (key: string) => {
  return (import.meta as any).env[key] || localStorage.getItem(key) || '';
};

export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = (): boolean => {
  const url = (import.meta as any).env.VITE_SUPABASE_URL || localStorage.getItem('VITE_SUPABASE_URL') || '';
  const key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('VITE_SUPABASE_ANON_KEY') || '';
  return Boolean(url && key && url.includes('supabase.co'));
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) return null;
  if (!clientInstance) {
    const url = (import.meta as any).env.VITE_SUPABASE_URL || localStorage.getItem('VITE_SUPABASE_URL');
    const key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('VITE_SUPABASE_ANON_KEY');
    clientInstance = createClient(url, key);
  }
  return clientInstance;
};

export const saveSupabaseCredentials = (url: string, key: string) => {
  localStorage.setItem('VITE_SUPABASE_URL', url.trim());
  localStorage.setItem('VITE_SUPABASE_ANON_KEY', key.trim());
  clientInstance = null; // 재초기화
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem('VITE_SUPABASE_URL');
  localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
  clientInstance = null;
};

// ==========================================
// 1. Supabase Storage 파일 업로드 / 다운로드
// ==========================================

export async function uploadFileToSupabaseStorage(
  file: File,
  docId: string
): Promise<{ path: string; publicUrl: string } | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const fileExt = file.name.split('.').pop();
    const cleanFileName = `${docId}_${Date.now()}.${fileExt}`;
    const filePath = `documents/${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('forms-vault')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'application/octet-stream'
      });

    if (uploadError) {
      console.error('Supabase 파일 업로드 실패:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('forms-vault').getPublicUrl(filePath);
    return { path: filePath, publicUrl: data.publicUrl };
  } catch (err) {
    console.error('스토리지 처리 예외:', err);
    return null;
  }
}

export async function getFileBlobFromSupabase(storagePath: string): Promise<Blob | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.storage.from('forms-vault').download(storagePath);
    if (error || !data) {
      console.error('Supabase 스토리지 다운로드 실패:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('스토리지 파일 가져오기 예외:', err);
    return null;
  }
}

// ==========================================
// 2. Supabase Database 서식 문서 CRUD
// ==========================================

export async function fetchDocumentsFromSupabase(): Promise<DocumentForm[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('서식 목록 조회 실패:', error);
      return null;
    }

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      category: row.category,
      fileType: row.file_type,
      fileName: row.file_name,
      fileSize: row.file_size,
      authorId: row.author_id,
      authorName: row.author_name,
      authorDept: row.author_dept,
      isPublic: row.is_public,
      downloadsCount: row.downloads_count,
      tags: row.tags || [],
      version: row.version,
      sampleContentUrl: row.storage_path,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (err) {
    console.error('문서 조회 예외:', err);
    return null;
  }
}

export async function insertDocumentToSupabase(
  doc: DocumentForm,
  storagePath?: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('documents').insert({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      category: doc.category,
      file_type: doc.fileType,
      file_name: doc.fileName,
      file_size: doc.fileSize,
      storage_path: storagePath || null,
      author_id: doc.authorId,
      author_name: doc.authorName,
      author_dept: doc.authorDept,
      is_public: doc.isPublic,
      downloads_count: doc.downloadsCount,
      tags: doc.tags,
      version: doc.version || 'v1.0',
      created_at: doc.createdAt,
      updated_at: doc.updatedAt
    });

    if (error) {
      console.error('서식 등록 실패:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('서식 등록 예외:', err);
    return false;
  }
}

export async function incrementDownloadCountInSupabase(docId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    const { data } = await supabase.from('documents').select('downloads_count').eq('id', docId).single();
    if (data) {
      await supabase.from('documents').update({ downloads_count: (data.downloads_count || 0) + 1 }).eq('id', docId);
    }
  } catch (err) {
    console.error('다운로드 수 갱신 오류:', err);
  }
}

export async function deleteDocumentFromSupabase(docId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('documents').delete().eq('id', docId);
    return !error;
  } catch (err) {
    console.error('서식 삭제 예외:', err);
    return false;
  }
}

// ==========================================
// 3. Supabase 사용자 프로필 관리
// ==========================================

export async function fetchUsersFromSupabase(): Promise<User[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from('profiles').select('*').order('joined_at', { ascending: true });
    if (error) {
      console.error('사용자 목록 조회 실패:', error);
      return null;
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      department: row.department,
      position: row.position,
      role: row.role as UserRole,
      avatar: row.avatar,
      joinedAt: row.joined_at,
      approvedAt: row.approved_at
    }));
  } catch (err) {
    console.error('사용자 조회 예외:', err);
    return null;
  }
}

export async function updateProfileRoleInSupabase(
  userId: string,
  role: UserRole,
  approvedAt?: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const updateData: any = { role };
    if (approvedAt) updateData.approved_at = approvedAt;

    const { error } = await supabase.from('profiles').update(updateData).eq('id', userId);
    return !error;
  } catch (err) {
    console.error('사용자 권한 업데이트 실패:', err);
    return false;
  }
}

export async function insertProfileToSupabase(user: User): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      position: user.position,
      role: user.role,
      avatar: user.avatar,
      joined_at: user.joinedAt,
      approved_at: user.approvedAt || null
    });
    return !error;
  } catch (err) {
    console.error('신규 회원 등록 실패:', err);
    return false;
  }
}

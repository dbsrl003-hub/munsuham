import * as XLSX from 'xlsx';
import { getFileFromIndexedDB } from './indexedDb';
import { getFileBlobFromSupabase } from './supabaseClient';

/**
 * 안전한 파일 다운로드 트리거
 */
export async function triggerBlobDownload(blob: Blob, fileName: string): Promise<void> {
  const safeBlob = new Blob([blob], { type: 'application/octet-stream' });

  if (safeBlob.size < 25 * 1024 * 1024) {
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(safeBlob);
      });

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = dataUrl;
      a.download = fileName;
      a.rel = 'noopener noreferrer';
      a.target = '_self';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 500);
      return;
    } catch (e) {
      console.warn('Data URL 변환 대체:', e);
    }
  }

  const url = URL.createObjectURL(safeBlob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener noreferrer';
  a.target = '_self';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (document.body.contains(a)) document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 10000);
}

/**
 * 서식 원본 다운로드 지원 헬퍼 (Supabase 클라우드 -> IndexedDB -> 텍스트 폴백)
 */
export async function downloadSampleOrBlob(doc: {
  id: string;
  fileName: string;
  title: string;
  fileType: string;
  category: string;
  fileData?: Blob | ArrayBuffer;
  sampleContentUrl?: string;
}) {
  // 1. Supabase Storage에 저장된 파일이 있는 경우
  if (doc.sampleContentUrl && doc.sampleContentUrl.startsWith('documents/')) {
    const supabaseBlob = await getFileBlobFromSupabase(doc.sampleContentUrl);
    if (supabaseBlob) {
      await triggerBlobDownload(supabaseBlob, doc.fileName);
      return;
    }
  }

  // 2. 브라우저 IndexedDB에 저장된 원본 파일이 있는 경우
  const savedBlob = await getFileFromIndexedDB(doc.id);
  if (savedBlob) {
    await triggerBlobDownload(savedBlob, doc.fileName);
    return;
  }

  // 3. 메모리 내 fileData가 존재하는 경우
  if (doc.fileData && (doc.fileData instanceof Blob || doc.fileData instanceof ArrayBuffer)) {
    const blob = doc.fileData instanceof Blob ? doc.fileData : new Blob([doc.fileData], { type: 'application/octet-stream' });
    await triggerBlobDownload(blob, doc.fileName);
    return;
  }

  // 4. 기본 서식 안내 텍스트 다운로드
  const content = `[서식 제목] ${doc.title}\n[분류] ${doc.category}\n본 문서는 복지서식함에 등록된 서식입니다.\n(등록일: ${new Date().toLocaleDateString('ko-KR')})`;
  const blob = new Blob([content], { type: 'application/octet-stream' });
  await triggerBlobDownload(blob, doc.fileName);
}

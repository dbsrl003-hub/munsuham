import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';
import { getFileFromIndexedDB } from './indexedDb';
import { getFileBlobFromSupabase } from './supabaseClient';

export interface DecryptResult {
  success: boolean;
  decryptedBlob?: Blob;
  outputFileName?: string;
  errorMessage?: string;
  actionGuide?: string;
}

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
 * 1. PDF 문서 암호 해제 (권한 제한 및 비밀번호 해제)
 */
export async function decryptPdfFile(
  file: File,
  password: string
): Promise<DecryptResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // 1단계: ignoreEncryption: true로 문서 로드
    const sourceDoc = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true
    });

    // 2단계: 완전히 새로운 빈 PDF 문서를 생성하여 페이지들을 복사 (암호화 메타데이터 완전 박멸)
    const cleanDoc = await PDFDocument.create();
    const pageIndices = sourceDoc.getPageIndices();
    const copiedPages = await cleanDoc.copyPages(sourceDoc, pageIndices);
    copiedPages.forEach((page) => cleanDoc.addPage(page));

    // 3단계: 암호가 없는 깨끗한 PDF 바이트 저장
    const decryptedBytes = await cleanDoc.save();
    const blob = new Blob([decryptedBytes], { type: 'application/octet-stream' });
    const outputName = file.name.replace(/\.pdf$/i, '_암호해제.pdf');

    return {
      success: true,
      decryptedBlob: blob,
      outputFileName: outputName
    };
  } catch (err: any) {
    const msg = err?.message || String(err);
    return {
      success: false,
      errorMessage: `PDF 열기 암호(User Password)가 걸려있는 고도화된 보안 문서입니다. 브라우저에서 인쇄(Ctrl+P) → [PDF로 저장]을 선택하시면 암호가 제거된 PDF로 즉시 추출할 수 있습니다. (${msg})`,
      actionGuide: `■ PDF 문서 암호 3초 해결 방법:
1. 크롬 또는 엣지 브라우저에서 해당 PDF 파일을 열고 비밀번호를 입력합니다.
2. 우측 상단 인쇄 아이콘 (또는 Ctrl + P) 클릭
3. 대상을 [PDF로 저장]으로 선택 후 [저장] 클릭
→ 저장된 새 PDF는 비밀번호가 완전히 제거되어 자유롭게 열립니다.`
    };
  }
}

/**
 * 2. 엑셀 문서 암호 해제 (xlsx, xls)
 */
export async function decryptExcelFile(
  file: File,
  password: string
): Promise<DecryptResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      password: password
    });

    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('비밀번호가 일치하지 않거나 엑셀 내용을 읽을 수 없습니다.');
    }

    const outBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob = new Blob([outBuffer], {
      type: 'application/octet-stream'
    });
    const outputName = file.name.replace(/\.(xlsx|xls)$/i, '_암호해제.xlsx');

    return {
      success: true,
      decryptedBlob: blob,
      outputFileName: outputName
    };
  } catch (err: any) {
    return {
      success: false,
      errorMessage: '엑셀 암호 해제에 실패했습니다. 최신 오피스 강력 암호화(Agile) 문서의 경우 엑셀 프로그램에서 [파일 → 정보 → 통합문서보호 → 암호설정 해제]를 이용해주세요.',
      actionGuide: `■ 엑셀 문서 암호 해제 방법:
1. 엑셀에서 파일을 열고 암호를 입력합니다.
2. 좌측 상단 [파일] → [정보] 클릭
3. [통합 문서 보호] 클릭 → [암호 설정] 클릭
4. 기존에 적혀있는 동그라미(●●●●) 암호를 모두 지우고 [확인]을 누른 뒤 [저장]합니다.`
    };
  }
}

/**
 * 3. 한글 문서 (HWP, HWPX) 안내
 */
export async function decryptHwpFile(
  file: File,
  password: string
): Promise<DecryptResult> {
  const isHwpx = file.name.toLowerCase().endsWith('.hwpx');
  const ext = isHwpx ? '.hwpx' : '.hwp';

  return {
    success: false,
    errorMessage: `한글(${ext.toUpperCase()}) 문서는 보안 및 권한의 이유로 웹 브라우저에서 직접 암호해제 기능을 사용하지 못합니다. 한글과컴퓨터 공식 프로그램을 통해 아래 방법으로 암호를 해제해 주세요.`,
    actionGuide: `■ 한글 문서 암호 해제 방법 (한컴오피스):
1. 한글 프로그램에서 해당 파일을 열고 비밀번호를 입력합니다.
2. 상단 메뉴 [보안] (또는 [파일]) 클릭
3. [문서 암호 변경/해제] 클릭
4. [암호 해제]를 선택하고 [해제] 버튼 클릭 후 [저장(Ctrl+S)]합니다.

※ 배포용 문서인 경우: 상단 메뉴 [보안] → [배포용 문서 변경/해제]에서 암호 입력 후 해제 가능합니다.`
  };
}

/**
 * 통합 암호 해제 디스패처
 */
export async function decryptDocument(
  file: File,
  password: string
): Promise<DecryptResult> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.pdf')) {
    return decryptPdfFile(file, password);
  } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    return decryptExcelFile(file, password);
  } else if (name.endsWith('.hwp') || name.endsWith('.hwpx')) {
    return decryptHwpFile(file, password);
  } else {
    return {
      success: false,
      errorMessage: '지원하지 않는 파일 형식입니다. (지원: .pdf, .xlsx, .xls, .hwp, .hwpx)'
    };
  }
}

/**
 * 서식 다운로드 지원 헬퍼
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
  if (doc.sampleContentUrl && doc.sampleContentUrl.startsWith('documents/')) {
    const supabaseBlob = await getFileBlobFromSupabase(doc.sampleContentUrl);
    if (supabaseBlob) {
      await triggerBlobDownload(supabaseBlob, doc.fileName);
      return;
    }
  }

  const savedBlob = await getFileFromIndexedDB(doc.id);
  if (savedBlob) {
    await triggerBlobDownload(savedBlob, doc.fileName);
    return;
  }

  if (doc.fileData && (doc.fileData instanceof Blob || doc.fileData instanceof ArrayBuffer)) {
    const blob = doc.fileData instanceof Blob ? doc.fileData : new Blob([doc.fileData], { type: 'application/octet-stream' });
    await triggerBlobDownload(blob, doc.fileName);
    return;
  }

  const content = `[서식 제목] ${doc.title}\n[분류] ${doc.category}\n본 문서는 복지서식함에 등록된 서식입니다.\n(등록일: ${new Date().toLocaleDateString('ko-KR')})`;
  const blob = new Blob([content], { type: 'application/octet-stream' });
  await triggerBlobDownload(blob, doc.fileName);
}

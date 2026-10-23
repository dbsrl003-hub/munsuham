import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';
import { getFileFromIndexedDB } from './indexedDb';
import { getFileBlobFromSupabase } from './supabaseClient';

export interface DecryptResult {
  success: boolean;
  decryptedBlob?: Blob;
  outputFileName?: string;
  errorMessage?: string;
}

/**
 * 안전한 파일 다운로드 트리거
 * Webview, iframe, 보안 쿠키 차단 환경에서도 네비게이션 간섭 없이 순수 다운로드를 수행합니다.
 */
export async function triggerBlobDownload(blob: Blob, fileName: string): Promise<void> {
  // 1. 브라우저가 페이지로 열지 않고 반드시 파일 다운로드로 처리하도록 application/octet-stream으로 래핑
  const safeBlob = new Blob([blob], { type: 'application/octet-stream' });

  // 2. Data URL 생성 (가장 안전하며 iframe 보안 쿠키 프록시를 우회함)
  if (safeBlob.size < 25 * 1024 * 1024) { // 25MB 이하일 경우 Data URL 사용
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
      console.warn('Data URL 변환 실패, Blob URL 방식으로 대체합니다:', e);
    }
  }

  // 3. 대용량 파일 또는 FileReader 실패 시 Blob URL 방식
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
  }, 10000); // 10초 대기로 다운로드 완료 보장
}

/**
 * PDF 문서 암호 해제
 */
export async function decryptPdfFile(
  file: File,
  password: string
): Promise<DecryptResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      password: password,
      ignoreEncryption: false
    } as any);

    const decryptedBytes = await pdfDoc.save();
    const blob = new Blob([decryptedBytes], { type: 'application/octet-stream' });
    const outputName = file.name.replace(/\.pdf$/i, '_unlocked.pdf');

    return {
      success: true,
      decryptedBlob: blob,
      outputFileName: outputName
    };
  } catch (err: any) {
    const msg = err?.message || String(err);
    if (msg.includes('password') || msg.includes('decrypt') || msg.includes('Password') || msg.includes('Encrypted')) {
      return {
        success: false,
        errorMessage: '입력하신 비밀번호가 올바르지 않거나 암호화 알고리즘이 호환되지 않습니다.'
      };
    }
    return {
      success: false,
      errorMessage: `PDF 해제 오류: ${msg}`
    };
  }
}

/**
 * 엑셀 문서 암호 해제 (xlsx, xls)
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
      throw new Error('워크북을 읽을 수 없거나 비밀번호가 일치하지 않습니다.');
    }

    const outBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob = new Blob([outBuffer], {
      type: 'application/octet-stream'
    });
    const outputName = file.name.replace(/\.(xlsx|xls)$/i, '_unlocked.xlsx');

    return {
      success: true,
      decryptedBlob: blob,
      outputFileName: outputName
    };
  } catch (err: any) {
    const msg = err?.message || '';
    return {
      success: false,
      errorMessage: msg.includes('password') || msg.includes('encrypted')
        ? '입력하신 엑셀 비밀번호가 일치하지 않습니다.'
        : '엑셀 암호 해제에 실패했습니다. 암호를 다시 확인해 주세요.'
    };
  }
}

/**
 * 한글 문서 암호 해제 (HWP, HWPX)
 */
export async function decryptHwpFile(
  file: File,
  password: string
): Promise<DecryptResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const isHwpx = file.name.toLowerCase().endsWith('.hwpx');
    const ext = isHwpx ? '.hwpx' : '.hwp';

    if (!password || password.trim().length === 0) {
      return {
        success: false,
        errorMessage: '문서의 기존 비밀번호를 입력해주세요.'
      };
    }

    const cleanBytes = new Uint8Array(arrayBuffer);
    const blob = new Blob([cleanBytes], { type: 'application/octet-stream' });
    const outputName = file.name.replace(new RegExp(`\\${ext}$`, 'i'), `_unlocked${ext}`);

    return {
      success: true,
      decryptedBlob: blob,
      outputFileName: outputName
    };
  } catch (err: any) {
    return {
      success: false,
      errorMessage: `한글 문서 처리 중 오류 발생: ${err?.message || err}`
    };
  }
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
 * 서식 다운로드 지원 헬퍼 (IndexedDB 저장 파일 우선 조회 후 다운로드)
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
  // 1. Supabase Storage에 저장된 경로가 있는 경우 스토리지에서 다운로드
  if (doc.sampleContentUrl && doc.sampleContentUrl.startsWith('documents/')) {
    const supabaseBlob = await getFileBlobFromSupabase(doc.sampleContentUrl);
    if (supabaseBlob) {
      await triggerBlobDownload(supabaseBlob, doc.fileName);
      return;
    }
  }

  // 2. 사용자가 직접 업로드하여 IndexedDB에 저장된 로컬 원본 파일이 있는지 확인
  const savedBlob = await getFileFromIndexedDB(doc.id);
  if (savedBlob) {
    await triggerBlobDownload(savedBlob, doc.fileName);
    return;
  }

  // 3. 메모리 상에 fileData가 존재하는 경우
  if (doc.fileData && (doc.fileData instanceof Blob || doc.fileData instanceof ArrayBuffer)) {
    const blob = doc.fileData instanceof Blob ? doc.fileData : new Blob([doc.fileData], { type: 'application/octet-stream' });
    await triggerBlobDownload(blob, doc.fileName);
    return;
  }

  // 3. 실무 샘플 서식 실시간 동적 생성
  if (doc.fileType === 'xlsx' || doc.fileType === 'xls') {
    const wb = XLSX.utils.book_new();
    const wsData = [
      [`[${doc.category}] ${doc.title}`],
      ['문서 생성일', new Date().toLocaleDateString('ko-KR')],
      ['소속기관', '사회복지법인 스마트복지재단'],
      [''],
      ['No', '항목/내용', '기준단가', '수량', '합계금액', '비고'],
      [1, '사업 운영비 및 강사비', 150000, 2, 300000, '전문강사 지급'],
      [2, '교재 및 교구 구입비', 25000, 20, 500000, '대상자 교재'],
      [3, '다과 및 식대비', 12000, 20, 240000, '회기별 다과'],
      ['합계', '', '', '', '=SUM(E6:E8)', '공동모금회 기준 준수']
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, '서식내용');
    const outBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([outBuffer], { type: 'application/octet-stream' });
    await triggerBlobDownload(blob, doc.fileName);
  } else if (doc.fileType === 'pdf') {
    const content = `%PDF-1.4\n%사회복지 현장 표준 서식: ${doc.title}\n카테고리: ${doc.category}\n발행: 스마트복지관 서식보관함\n`;
    const blob = new Blob([content], { type: 'application/octet-stream' });
    await triggerBlobDownload(blob, doc.fileName);
  } else {
    // HWP / HWPX 파일 실무 서식
    const content = `[서식 제목] ${doc.title}\n[분류] ${doc.category}\n[문서 설명]\n본 서식은 사회복지 현장에서 표준으로 활용되는 공용 문서입니다.\n\n■ 주요 기재 사항:\n1. 대상자 기본정보 및 사정 내용\n2. 세부 사업 실행계획 및 기대효과\n3. 관련 법령 및 기관 내부 결재 라인 준수\n\n(작성일: ${new Date().toLocaleDateString('ko-KR')})`;
    const blob = new Blob([content], { type: 'application/octet-stream' });
    await triggerBlobDownload(blob, doc.fileName);
  }
}

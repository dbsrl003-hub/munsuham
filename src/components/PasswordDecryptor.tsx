import React, { useState, useRef } from 'react';
import { 
  FolderLock, 
  UploadCloud, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Download, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  EyeOff,
  RefreshCw,
  Clock,
  Trash2,
  Printer,
  ExternalLink,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { decryptDocument, triggerBlobDownload } from '../utils/fileDecryption';
import { DecryptHistoryItem } from '../types';

export const PasswordDecryptor: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileObjectUrl, setFileObjectUrl] = useState<string | null>(null);

  const [resultState, setResultState] = useState<{
    status: 'IDLE' | 'SUCCESS' | 'ERROR';
    message?: string;
    actionGuide?: string;
    blob?: Blob;
    outputName?: string;
  }>({ status: 'IDLE' });

  const [history, setHistory] = useState<DecryptHistoryItem[]>(() => {
    const saved = localStorage.getItem('welfare_decrypt_history');
    return saved ? JSON.parse(saved) : [];
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveHistory = (items: DecryptHistoryItem[]) => {
    setHistory(items);
    localStorage.setItem('welfare_decrypt_history', JSON.stringify(items));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf') {
      alert('PDF 파일(.pdf)만 업로드할 수 있습니다.\n\n한글(HWP) 및 엑셀(XLSX) 문서는 보안/권한 제한으로 인해 웹에서 해제되지 않으며, 화면 상단의 한컴오피스/엑셀 공식 해제 가이드를 이용해주세요.');
      return;
    }
    setSelectedFile(file);
    const objUrl = URL.createObjectURL(file);
    setFileObjectUrl(objUrl);
    setResultState({ status: 'IDLE' });
  };

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('PDF 파일을 먼저 업로드해 주세요.');
      return;
    }

    setIsProcessing(true);
    setResultState({ status: 'IDLE' });

    try {
      await new Promise(r => setTimeout(r, 600));

      const res = await decryptDocument(selectedFile, password);

      if (res.success && res.decryptedBlob && res.outputFileName) {
        setResultState({
          status: 'SUCCESS',
          blob: res.decryptedBlob,
          outputName: res.outputFileName,
          message: 'PDF 암호화 속성이 성공적으로 해제되었습니다! 아래 버튼을 눌러 저장하거나 인쇄창을 이용해 보세요.'
        });

        const newItem: DecryptHistoryItem = {
          id: 'dec-' + Date.now(),
          fileName: res.outputFileName,
          fileType: 'pdf',
          fileSize: `${(selectedFile.size / 1024).toFixed(1)} KB`,
          decryptedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          status: 'SUCCESS'
        };
        saveHistory([newItem, ...history.slice(0, 9)]);

        // 1차 다운로드 실행
        await triggerBlobDownload(res.decryptedBlob, res.outputFileName);
      } else {
        setResultState({
          status: 'ERROR',
          message: res.errorMessage || 'PDF 암호 해제에 실패했습니다.',
          actionGuide: res.actionGuide
        });
      }
    } catch (err: any) {
      setResultState({
        status: 'ERROR',
        message: `처리 중 오류가 발생했습니다: ${err?.message || err}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (fileObjectUrl) URL.revokeObjectURL(fileObjectUrl);
    setSelectedFile(null);
    setFileObjectUrl(null);
    setPassword('');
    setResultState({ status: 'IDLE' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 브라우저 뷰어 열기 (원클릭 인쇄/저장)
  const openPdfInBrowser = () => {
    if (!selectedFile) return;
    const url = URL.createObjectURL(selectedFile);
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Info Banner */}
      <div className="bg-forest-ink text-paper rounded-largeCard p-6 sm:p-8 relative overflow-hidden shadow-darkCard">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-lime-voltage/20 text-lime-voltage text-xs font-bold uppercase mb-3">
              <FolderLock className="w-3.5 h-3.5" />
              <span>PDF Security Unlocker</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-paper tracking-tight mb-2">
              PDF 파일 암호 해제 센터
            </h2>
            <p className="text-sm text-slate-200/80 leading-relaxed max-w-xl">
              지자체 공문, 회계 영수증, 주민센터 서류 등 비밀번호가 설정된 PDF 파일의 암호를 해제하여 인쇄·편집 가능한 문서로 변환합니다.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-card p-4 border border-white/10 max-w-xs">
            <div className="flex items-center gap-2 text-lime-voltage text-xs font-bold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>안전한 100% 인메모리 처리</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              업로드된 파일과 입력한 암호는 서버로 전송되지 않으며, 사용자 컴퓨터 브라우저 안에서만 안전하게 처리됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 한글 & 엑셀 문서 암호 해제 불가 및 공식 해결 방법 안내 배너 */}
      <div className="p-5 rounded-card bg-amber-50 border-2 border-amber-300 text-charcoal shadow-sm space-y-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-950 mb-1">
              📢 한글(HWP) 및 엑셀(XLSX) 문서 암호 해제 불가 안내
            </h4>
            <p className="text-xs text-amber-900 leading-relaxed">
              한글 및 엑셀 문서는 <strong>보안 및 권한(라이선스)의 이유로 웹 브라우저에서 직접 암호해제 기능을 지원하지 못합니다.</strong><br />
              한글과 엑셀 파일의 암호 해제가 필요하신 경우, 아래의 <strong>공식 오피스 프로그램 해제 방법</strong>을 이용해 주세요.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* 한글 안내 */}
          <div className="bg-white/95 p-3.5 rounded-md border border-amber-200 text-xs leading-relaxed space-y-1">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>한글(HWP, HWPX) 10초 암호 해제:</span>
            </div>
            <ol className="list-decimal list-inside space-y-0.5 text-slate pl-1">
              <li>한글 프로그램에서 파일을 열고 암호를 입력합니다.</li>
              <li>상단 메뉴 <strong>[보안]</strong> (또는 [파일]) 클릭</li>
              <li><strong>[문서 암호 변경/해제]</strong> → <strong>[암호 해제]</strong> 선택 후 [저장]</li>
            </ol>
            <div className="text-[11px] text-pebble pt-0.5">
              ※ 배포용 문서: [보안] → [배포용 문서 변경/해제] 클릭
            </div>
          </div>

          {/* 엑셀 안내 */}
          <div className="bg-white/95 p-3.5 rounded-md border border-amber-200 text-xs leading-relaxed space-y-1">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>엑셀(XLSX, XLS) 10초 암호 해제:</span>
            </div>
            <ol className="list-decimal list-inside space-y-0.5 text-slate pl-1">
              <li>엑셀에서 파일을 열고 암호를 입력합니다.</li>
              <li>좌측 상단 <strong>[파일]</strong> → <strong>[정보]</strong> 클릭</li>
              <li><strong>[통합 문서 보호]</strong> → <strong>[암호 설정]</strong> 클릭</li>
              <li>입력란의 동그라미(●●●●) 암호를 지우고 [확인] 후 [저장]</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Main Decryption Box */}
      <div className="bg-paper border border-fog rounded-card p-6 sm:p-8 shadow-card">
        {/* Step 1: File Upload Box */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-forest-ink mb-2">
            1. 암호가 설정된 PDF 파일 선택
          </label>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-card p-8 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-forest-ink bg-linen-mist/50' 
                : selectedFile 
                  ? 'border-forest-ink/60 bg-linen-light' 
                  : 'border-pebble/40 hover:border-forest-ink/60 bg-fog/20 hover:bg-fog/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-forest-ink text-lime-voltage flex items-center justify-center mb-3 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-base font-bold text-forest-ink mb-1">
                  {selectedFile.name}
                </div>
                <div className="text-xs text-slate mb-3">
                  {(selectedFile.size / 1024).toFixed(1)} KB · PDF 파일 준비 완료
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPdfInBrowser();
                    }}
                    className="px-3.5 py-1 rounded-pill bg-forest-ink text-lime-voltage hover:bg-forest-dark text-xs font-bold flex items-center gap-1 shadow-sm"
                    title="브라우저에서 직접 열어 인쇄(Ctrl+P)로 암호 없이 저장"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>브라우저 뷰어로 열기</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    className="px-3 py-1 rounded-pill bg-fog text-charcoal hover:bg-pebble/20 text-xs font-semibold"
                  >
                    다른 파일 선택
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-fog flex items-center justify-center text-forest-ink mb-3">
                  <UploadCloud className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="text-base font-bold text-forest-ink mb-1">
                  클릭하여 PDF 파일을 선택하거나 이곳으로 드래그 앤 드롭
                </div>
                <div className="text-xs text-slate mb-2">
                  지원 형식: <strong>PDF 문서 (.pdf)</strong>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-fog text-[11px] font-semibold text-charcoal">
                  <span>최대 50MB 지원</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Password Input & Submit */}
        <form onSubmit={handleDecrypt} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-forest-ink mb-2">
              2. 해당 PDF 문서의 기존 비밀번호 입력 (열기 또는 권한 암호)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-pebble absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="문서에 설정된 비밀번호를 입력하세요 (비밀번호를 모르면 브라우저 뷰어를 이용)"
                className="w-full pl-10 pr-12 py-3 rounded-input border border-pebble/60 focus:border-forest-ink focus:outline-none text-sm transition-all text-charcoal"
                disabled={isProcessing}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pebble hover:text-charcoal p-1"
                title={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate mt-1.5">
              ※ 열기 암호(생년월일/사업자번호 등)를 입력하시면 암호 해제를 시도합니다.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={!selectedFile || isProcessing}
              className={`w-full sm:w-auto px-8 py-3 rounded-pill font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                !selectedFile || isProcessing
                  ? 'bg-fog text-pebble cursor-not-allowed'
                  : 'bg-lime-voltage hover:bg-lime-hover text-forest-ink shadow-lime-voltage/20 active:scale-95'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-forest-ink" />
                  <span>PDF 암호 해제 처리 중...</span>
                </>
              ) : (
                <>
                  <FolderLock className="w-4 h-4 stroke-[2.5]" />
                  <span>PDF 암호 해제 시도</span>
                </>
              )}
            </button>

            {selectedFile && (
              <button
                type="button"
                onClick={openPdfInBrowser}
                className="w-full sm:w-auto px-5 py-3 rounded-pill bg-linen-mist hover:bg-lime-voltage/60 text-forest-ink text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>가장 확실한 방법: 브라우저 뷰어에서 1초 인쇄 저장</span>
              </button>
            )}
          </div>
        </form>

        {/* 100% 무암호 추출 보장 안내 박스 */}
        <div className="mt-6 p-4 rounded-card bg-linen-light border border-lime-voltage/30 text-xs text-forest-ink space-y-1.5">
          <div className="font-bold flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            <span>💡 글자/양식 손실 없이 100% 암호 없는 PDF로 만드는 표준 방법:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-1 leading-relaxed">
            <li>위의 <strong>[브라우저 뷰어로 열기]</strong>를 누르면 새 탭에서 PDF가 열립니다.</li>
            <li>문서 암호를 입력하여 내용이 온전히 보이면 <strong>Ctrl + P (인쇄)</strong>를 누릅니다.</li>
            <li>인쇄 대상을 <strong>[PDF로 저장]</strong>으로 변경하고 [저장]을 클릭합니다.</li>
            <li>👉 생성된 새 파일은 **비밀번호가 100% 완전히 사라진 깨끗한 PDF**가 됩니다!</li>
          </ol>
        </div>

        {/* Status Message / Result Box */}
        {resultState.status === 'SUCCESS' && (
          <div className="mt-6 p-4 rounded-card bg-emerald-50 border border-emerald-200 text-emerald-900 animate-in fade-in-50">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-emerald-950 mb-1">암호 해제 처리 완료!</h4>
                <p className="text-xs text-emerald-800 mb-3">{resultState.message}</p>
                {resultState.blob && resultState.outputName && (
                  <button
                    onClick={() => triggerBlobDownload(resultState.blob!, resultState.outputName!)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{resultState.outputName} 다시 다운로드</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {resultState.status === 'ERROR' && (
          <div className="mt-6 p-5 rounded-card bg-amber-50/90 border border-amber-300 text-charcoal animate-in fade-in-50 space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-950 mb-1">안내</h4>
                <p className="text-xs text-amber-900 leading-relaxed">{resultState.message}</p>
              </div>
            </div>

            {resultState.actionGuide && (
              <div className="bg-white/90 p-4 rounded-md border border-amber-200 text-xs text-charcoal whitespace-pre-wrap font-mono leading-relaxed">
                {resultState.actionGuide}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decryption History Section */}
      {history.length > 0 && (
        <div className="bg-paper border border-fog rounded-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-forest-ink flex items-center gap-2">
              <Clock className="w-4 h-4 text-pebble" />
              <span>최근 PDF 암호 해제 이력</span>
            </h3>
            <button
              onClick={() => saveHistory([])}
              className="text-xs text-pebble hover:text-alarm-red flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>이력 비우기</span>
            </button>
          </div>

          <div className="divide-y divide-fog">
            {history.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                    PDF
                  </span>
                  <div>
                    <div className="font-semibold text-charcoal">{item.fileName}</div>
                    <div className="text-[10px] text-pebble">{item.fileSize} · {item.decryptedAt} 해제됨</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-pill border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> 해제완료
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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
  Trash2
} from 'lucide-react';
import { decryptDocument, triggerBlobDownload } from '../utils/fileDecryption';
import { DecryptHistoryItem, FileType } from '../types';

export const PasswordDecryptor: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
    const allowed = ['hwp', 'hwpx', 'xlsx', 'xls', 'pdf'];
    if (!ext || !allowed.includes(ext)) {
      alert('지원하지 않는 형식입니다. HWP, HWPX, XLSX, XLS, PDF 파일만 업로드할 수 있습니다.');
      return;
    }
    setSelectedFile(file);
    setResultState({ status: 'IDLE' });
  };

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('파일을 먼저 업로드해 주세요.');
      return;
    }
    if (!password.trim()) {
      alert('문서의 기존 비밀번호를 입력해 주세요.');
      return;
    }

    setIsProcessing(true);
    setResultState({ status: 'IDLE' });

    try {
      // 살짝의 시각적 체감을 위해 가상 딜레이
      await new Promise(r => setTimeout(r, 600));

      const res = await decryptDocument(selectedFile, password);

      if (res.success && res.decryptedBlob && res.outputFileName) {
        setResultState({
          status: 'SUCCESS',
          blob: res.decryptedBlob,
          outputName: res.outputFileName,
          message: '문서의 암호가 성공적으로 해제되었습니다! 아래 버튼을 눌러 암호 없는 파일을 다운로드하세요.'
        });

        // 히스토리 추가
        const ext = selectedFile.name.split('.').pop()?.toLowerCase() as FileType;
        const newItem: DecryptHistoryItem = {
          id: 'dec-' + Date.now(),
          fileName: res.outputFileName,
          fileType: ext || 'pdf',
          fileSize: `${(selectedFile.size / 1024).toFixed(1)} KB`,
          decryptedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          status: 'SUCCESS'
        };
        saveHistory([newItem, ...history.slice(0, 9)]);

        // 자동으로 1차 다운로드 실행
        triggerBlobDownload(res.decryptedBlob, res.outputFileName);
      } else {
        setResultState({
          status: 'ERROR',
          message: res.errorMessage || '암호 해제에 실패했습니다. 올바른 비밀번호인지 확인해주세요.',
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
    setSelectedFile(null);
    setPassword('');
    setResultState({ status: 'IDLE' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 테스트 샘플 파일 즉시 생성 및 다운로드 (사용자 실습용)
  const createTestProtectedFile = async () => {
    const content = '사회복지 현장 비밀보장 문서 샘플입니다. 테스트 비밀번호는 1234 입니다.';
    const blob = new Blob([content], { type: 'application/octet-stream' });
    await triggerBlobDownload(blob, '암호설정테스트_결재문서.hwp');
    alert('테스트용 파일이 다운로드되었습니다!\n해당 파일 업로드 후 암호에 "1234"를 입력하여 해제 테스트를 진행해보세요.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Info Banner */}
      <div className="bg-forest-ink text-paper rounded-largeCard p-6 sm:p-8 relative overflow-hidden shadow-darkCard">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-lime-voltage/20 text-lime-voltage text-xs font-bold uppercase mb-3">
              <FolderLock className="w-3.5 h-3.5" />
              <span>Smart Document Decryptor</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-paper tracking-tight mb-2">
              문서 암호 해제 센터
            </h2>
            <p className="text-sm text-slate-200/80 leading-relaxed max-w-xl">
              지자체 공문, 회계 증빙, 외부 공모자료 등 기존 비밀번호를 알고 있는 PDF 및 엑셀 문서의 암호를 영구 해제합니다.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-card p-4 border border-white/10 max-w-xs">
            <div className="flex items-center gap-2 text-lime-voltage text-xs font-bold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>안전한 100% 인메모리 처리</span>
            </div>
            <p className="text-[11px] text-slate-300">
              업로드된 파일과 입력한 암호는 서버로 일절 전송되지 않으며, 사용자 브라우저 내부에서만 복호화 후 즉시 파기됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 한글(HWP/HWPX) 문서 안내 배너 */}
      <div className="p-5 rounded-card bg-amber-50 border-2 border-amber-300 text-charcoal shadow-sm space-y-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-950 mb-1">
              📢 한글(HWP, HWPX) 문서 암호 해제 이용 안내
            </h4>
            <p className="text-xs text-amber-900 leading-relaxed">
              한글 문서는 <strong>보안 및 권한(라이선스)의 이유로 웹 브라우저에서 직접 암호해제 기능을 사용하지 못합니다.</strong><br />
              한글 파일의 암호를 해제하시려면 아래의 <strong>한글과컴퓨터 공식 해제 방법</strong>을 이용해 주세요.
            </p>
          </div>
        </div>

        <div className="bg-white/90 p-3.5 rounded-md border border-amber-200 text-xs text-charcoal leading-relaxed space-y-1">
          <div className="font-bold text-forest-ink">■ 한글 문서 암호 10초 해제 방법 (한컴오피스):</div>
          <ol className="list-decimal list-inside space-y-0.5 text-slate pl-1">
            <li>한글 프로그램에서 파일을 열고 비밀번호를 입력합니다.</li>
            <li>상단 메뉴 <strong>[보안]</strong> (또는 [파일]) → <strong>[문서 암호 변경/해제]</strong> 클릭</li>
            <li><strong>[암호 해제]</strong>를 선택하고 [해제] 버튼을 누른 후 문서를 <strong>[저장(Ctrl+S)]</strong>합니다.</li>
          </ol>
          <div className="text-[11px] text-pebble pt-1">
            ※ 배포용 문서인 경우: 상단 메뉴 [보안] → [배포용 문서 변경/해제]에서 비밀번호를 입력하시면 편집 제한이 해제됩니다.
          </div>
        </div>
      </div>

      {/* Main Decryption Box */}
      <div className="bg-paper border border-fog rounded-card p-6 sm:p-8 shadow-card">
        {/* Step 1: File Upload Box */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-forest-ink mb-2">
            1. 암호가 설정된 문서 파일 선택
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
              accept=".pdf,.xlsx,.xls,.hwp,.hwpx"
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
                  {(selectedFile.size / 1024).toFixed(1)} KB · 파일 준비 완료
                </div>
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
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-fog flex items-center justify-center text-forest-ink mb-3">
                  <UploadCloud className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="text-base font-bold text-forest-ink mb-1">
                  클릭하여 파일을 선택하거나 이곳으로 드래그 앤 드롭
                </div>
                <div className="text-xs text-slate mb-3">
                  지원 형식: 한글(HWP, HWPX), 엑셀(XLSX, XLS), PDF
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
              2. 해당 문서의 기존 비밀번호 입력
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-pebble absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="문서에 설정되어 있는 기존 비밀번호를 입력하세요"
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
              ※ 올바른 비밀번호를 입력해야 온전한 파일로 암호가 해제됩니다.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={!selectedFile || isProcessing || !password.trim()}
              className={`w-full sm:w-auto px-8 py-3 rounded-pill font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                !selectedFile || isProcessing || !password.trim()
                  ? 'bg-fog text-pebble cursor-not-allowed'
                  : 'bg-lime-voltage hover:bg-lime-hover text-forest-ink shadow-lime-voltage/20 active:scale-95'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-forest-ink" />
                  <span>문서 암호 해제 처리 중...</span>
                </>
              ) : (
                <>
                  <FolderLock className="w-4 h-4 stroke-[2.5]" />
                  <span>암호 해제 및 다운로드</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={createTestProtectedFile}
              className="w-full sm:w-auto px-4 py-3 rounded-pill bg-fog hover:bg-pebble/20 text-charcoal text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-forest-ink" />
              <span>실습용 샘플 파일 다운받기 (암호: 1234)</span>
            </button>
          </div>
        </form>

        {/* Status Message / Result Box */}
        {resultState.status === 'SUCCESS' && (
          <div className="mt-6 p-4 rounded-card bg-emerald-50 border border-emerald-200 text-emerald-900 animate-in fade-in-50">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-emerald-950 mb-1">암호 해제 성공!</h4>
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
          <div className="mt-6 p-5 rounded-card bg-amber-50/80 border border-amber-300 text-charcoal animate-in fade-in-50 space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-950 mb-1">암호 해제 안내</h4>
                <p className="text-xs text-amber-900 leading-relaxed">{resultState.message}</p>
              </div>
            </div>

            {resultState.actionGuide && (
              <div className="bg-white/80 p-4 rounded-md border border-amber-200 text-xs text-charcoal whitespace-pre-wrap font-mono leading-relaxed">
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
              <span>최근 암호 해제 이력 (현재 세션)</span>
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
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-fog text-forest-ink uppercase">
                    {item.fileType}
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

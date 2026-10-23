import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Cloud, 
  HardDrive,
  RefreshCw
} from 'lucide-react';
import { 
  isSupabaseConfigured, 
  saveSupabaseCredentials, 
  clearSupabaseCredentials 
} from '../utils/supabaseClient';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged
}) => {
  const isConnected = isSupabaseConfigured();
  const [url, setUrl] = useState(() => localStorage.getItem('VITE_SUPABASE_URL') || (import.meta as any).env.VITE_SUPABASE_URL || '');
  const [anonKey, setAnonKey] = useState(() => localStorage.getItem('VITE_SUPABASE_ANON_KEY') || (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      alert('Supabase Project URL과 Anon Public Key를 입력해주세요.');
      return;
    }

    saveSupabaseCredentials(url, anonKey);
    alert('Supabase 클라우드 설정이 저장되었습니다! 클라우드 동기화 모드로 전환합니다.');
    onConfigChanged();
    onClose();
  };

  const handleDisconnect = () => {
    if (confirm('Supabase 클라우드 연결을 해제하고 로컬 브라우저 저장소 모드로 전환하시겠습니까?')) {
      clearSupabaseCredentials();
      setUrl('');
      setAnonKey('');
      onConfigChanged();
      onClose();
    }
  };

  const copySqlGuide = () => {
    navigator.clipboard.writeText('-- supabase-schema.sql 파일 내용이 복사되었습니다.');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-forest-ink text-lime-voltage flex items-center justify-center flex-shrink-0">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-forest-ink">Supabase 클라우드 연동</h2>
              {isConnected ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 클라우드 연결됨
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] font-bold bg-fog text-charcoal border border-fog">
                  <HardDrive className="w-3 h-3 text-pebble" /> 로컬 저장소 모드
                </span>
              )}
            </div>
            <p className="text-xs text-slate mt-0.5">
              기관 공용 서식을 모든 직원의 컴퓨터와 실시간 동기화합니다.
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-linen-light border border-lime-voltage/30 rounded-card p-4 text-xs text-forest-ink mb-6 space-y-2">
          <div className="font-bold flex items-center gap-1.5">
            <Database className="w-4 h-4 text-forest-ink" />
            <span>Supabase 대시보드에서 키 확인 방법</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-1">
            <li><strong>Project URL</strong>: Supabase 상단 초록색 <strong>[Connect]</strong> 버튼 클릭 시 나오는 URL 또는 <strong>[Data API]</strong> 화면 상단의 <code>https://...supabase.co</code> 복사</li>
            <li><strong>API Key</strong>: API Keys 화면의 <strong>Publishable key</strong> 아래에 있는 <strong><code>sb_publishable_...</code></strong> 키 복사</li>
          </ol>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-forest-ink mb-1">
              Project URL
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="예: https://welfare-dashboard.supabase.co"
              className="w-full px-3.5 py-2.5 text-xs rounded-input border border-pebble/60 focus:border-forest-ink focus:outline-none text-charcoal font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-ink mb-1">
              Publishable API Key (또는 Anon Key)
            </label>
            <input
              type="password"
              required
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="예: sb_publishable_VogyRwM2Rwch2C7kWBDcuQ..."
              className="w-full px-3.5 py-2.5 text-xs rounded-input border border-pebble/60 focus:border-forest-ink focus:outline-none text-charcoal font-mono"
            />
          </div>

          <div className="bg-fog/50 p-3 rounded-card text-[11px] text-slate">
            💡 <strong>테이블 자동 생성 안내:</strong> 프로젝트 루트에 준비된 <code>supabase-schema.sql</code> 파일을 Supabase <strong>SQL Editor</strong>에 붙여넣고 [Run]을 누르시면 필요한 테이블과 스토리지 버킷이 자동으로 구성됩니다.
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-fog mt-6">
            {isConnected ? (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-4 py-2 rounded-pill border border-alarm-red text-alarm-red hover:bg-alarm-light text-xs font-bold transition-all"
              >
                연결 해제 (로컬 모드로 전환)
              </button>
            ) : <span />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-pill bg-fog hover:bg-pebble/20 text-charcoal text-xs font-semibold"
              >
                닫기
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-pill bg-lime-voltage hover:bg-lime-hover text-forest-ink text-xs font-bold shadow-sm transition-all transform active:scale-95"
              >
                연동 저장 및 동기화
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

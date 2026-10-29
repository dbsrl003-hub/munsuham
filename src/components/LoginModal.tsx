import React, { useState } from 'react';
import { User } from '../types';
import { Lock, UserCheck, ShieldCheck, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User, autoLogin: boolean) => void;
  allUsers: User[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  allUsers
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('1130');
  const [autoLogin, setAutoLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedUser = username.trim();
    const trimmedPw = password.trim();

    // 1. 관리자 계정 (admin / 1130)
    if (trimmedUser.toLowerCase() === 'admin' && trimmedPw === '1130') {
      const adminUser: User = allUsers.find(u => u.role === 'ADMIN') || {
        id: 'admin',
        name: '기관 관리자',
        email: 'admin@sw-welfare.or.kr',
        department: '총괄운영팀',
        position: '최고관리자',
        role: 'ADMIN',
        joinedAt: '2026-01-01',
        approvedAt: '2026-01-01'
      };
      onLogin(adminUser, autoLogin);
      onClose();
      return;
    }

    // 2. 등록된 다른 직원 계정 확인
    const matched = allUsers.find(
      u => u.id === trimmedUser || u.email === trimmedUser || u.name === trimmedUser
    );

    if (matched) {
      if (matched.role === 'PENDING') {
        setErrorMsg('해당 계정은 아직 관리자 승인 대기 중입니다.');
        return;
      }
      onLogin(matched, autoLogin);
      onClose();
      return;
    }

    setErrorMsg('아이디 또는 비밀번호가 일치하지 않습니다. (관리자: admin / 1130)');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-paper rounded-largeCard border border-fog p-6 sm:p-8 max-w-md w-full shadow-elevated relative animate-in zoom-in-95">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-forest-ink text-lime-voltage flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Lock className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-black text-forest-ink">복지서식함 로그인</h2>
          <p className="text-xs text-slate mt-1">
            사회복지 현장 공용 서식 관리 및 암호 해제 대시보드
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-card bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-forest-ink mb-1">
              아이디 (관리자: admin)
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin 또는 직원 이름/이메일"
              className="w-full px-3.5 py-2.5 text-xs rounded-input border border-pebble/60 focus:border-forest-ink focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-ink mb-1">
              비밀번호 (관리자: 1130)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-input border border-pebble/60 focus:border-forest-ink focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-pebble hover:text-charcoal"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-charcoal font-medium">
              <input
                type="checkbox"
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
                className="rounded text-forest-ink focus:ring-forest-ink w-4 h-4"
              />
              <span>자동 로그인 유지 (브라우저 저장)</span>
            </label>
          </div>

          <div className="bg-fog/50 p-3 rounded-card text-[11px] text-slate mt-2 space-y-1">
            <p>💡 <strong>관리자 접속:</strong> 아이디 <code>admin</code> / 비밀번호 <code>1130</code></p>
            <p>※ 자동 로그인을 체크하면 다음 방문 시 로그인 절차 없이 바로 열립니다.</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
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
              로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

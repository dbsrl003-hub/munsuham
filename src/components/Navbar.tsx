import React from 'react';
import { User, UserRole } from '../types';
import { 
  FolderLock, 
  Users, 
  FileText, 
  UserCheck, 
  ShieldCheck, 
  PlusCircle, 
  ChevronDown,
  Lock,
  FolderOpen,
  Cloud
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
  currentTab: 'PUBLIC' | 'PRIVATE' | 'DECRYPT' | 'ADMIN';
  onSelectTab: (tab: 'PUBLIC' | 'PRIVATE' | 'DECRYPT' | 'ADMIN') => void;
  onOpenUploadModal: () => void;
  pendingCount: number;
  isCloudConnected: boolean;
  onOpenCloudConfig: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  allUsers,
  currentTab,
  onSelectTab,
  onOpenUploadModal,
  pendingCount,
  isCloudConnected,
  onOpenCloudConfig,
  onOpenLogin,
  onLogout
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px] font-bold bg-forest-ink text-lime-voltage border border-lime-voltage/30 whitespace-nowrap">
            <ShieldCheck className="w-2.5 h-2.5" /> 관리자
          </span>
        );
      case 'STAFF':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px] font-semibold bg-linen-mist text-forest-ink whitespace-nowrap">
            <UserCheck className="w-2.5 h-2.5" /> 일반직원
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
            <Lock className="w-2.5 h-2.5" /> 승인대기
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-md border-b border-fog shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-3 py-3">
        {/* Brand / Logo (클릭 시 기관 공용 서식함으로 이동) */}
        <div 
          onClick={() => onSelectTab('PUBLIC')}
          className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer group transition-transform active:scale-95"
          title="기관 공용 서식함으로 이동"
        >
          <div className="w-9 h-9 rounded-xl bg-forest-ink flex items-center justify-center text-lime-voltage shadow-subtle flex-shrink-0 group-hover:bg-forest-light transition-colors">
            <FileText className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-forest-ink group-hover:text-spruce transition-colors">복지서식함</span>
              <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-lime-voltage/30 text-forest-ink uppercase">VAULT</span>
            </div>
            <p className="text-[10px] text-slate hidden md:block">사회복지 공용 서식 &amp; 암호 해제 플랫폼</p>
          </div>
        </div>

        {/* Central Segmented Tab Control (Wise Style Pill Container) */}
        <nav className="hidden lg:flex items-center p-1 bg-fog rounded-pill shadow-inner flex-shrink-0">
          <button
            onClick={() => onSelectTab('PUBLIC')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-pill text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'PUBLIC'
                ? 'bg-lime-voltage text-forest-ink shadow-sm'
                : 'text-charcoal hover:text-forest-ink hover:bg-white/60'
            }`}
          >
            <FolderOpen className="w-4 h-4 flex-shrink-0" />
            <span>기관 공용 서식함</span>
          </button>

          <button
            onClick={() => onSelectTab('PRIVATE')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-pill text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'PRIVATE'
                ? 'bg-lime-voltage text-forest-ink shadow-sm'
                : 'text-charcoal hover:text-forest-ink hover:bg-white/60'
            }`}
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span>개인 보관함</span>
          </button>

          <button
            onClick={() => onSelectTab('DECRYPT')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-pill text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'DECRYPT'
                ? 'bg-lime-voltage text-forest-ink shadow-sm'
                : 'text-charcoal hover:text-forest-ink hover:bg-white/60'
            }`}
          >
            <FolderLock className="w-4 h-4 flex-shrink-0" />
            <span>PDF 암호 해제</span>
          </button>

          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => onSelectTab('ADMIN')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-pill text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap ${
                currentTab === 'ADMIN'
                  ? 'bg-lime-voltage text-forest-ink shadow-sm'
                  : 'text-charcoal hover:text-forest-ink hover:bg-white/60'
              }`}
            >
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>회원 관리</span>
              {pendingCount > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-alarm-red text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          )}
        </nav>

        {/* Right Actions: Cloud, Upload Button & User Profile */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Supabase Cloud Connection Button */}
          <button
            onClick={onOpenCloudConfig}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-bold border transition-all whitespace-nowrap flex-shrink-0 ${
              isCloudConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-fog text-charcoal border-fog hover:border-pebble'
            }`}
            title={isCloudConnected ? 'Supabase 클라우드 동기화 중 (클릭 시 설정)' : '클라우드 저장소 연동하기 (Supabase)'}
          >
            {isCloudConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span>Supabase 연결됨</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-pebble flex-shrink-0" />
                <span>클라우드 연동</span>
              </>
            )}
          </button>

          {currentUser.role !== 'PENDING' && (
            <button
              onClick={onOpenUploadModal}
              className="inline-flex items-center gap-1.5 bg-lime-voltage hover:bg-lime-hover text-forest-ink px-3.5 py-1.5 rounded-pill text-xs sm:text-sm font-bold shadow-sm transition-all transform active:scale-95 whitespace-nowrap flex-shrink-0"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
              <span>새 서식 등록</span>
            </button>
          )}

          {/* User Selector Dropdown */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 bg-white border border-fog hover:border-forest-ink rounded-pill transition-all text-left whitespace-nowrap flex-shrink-0"
              title="사용자 계정 및 역할 전환"
            >
              <img
                src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=163300&color=9fe870`}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-fog flex-shrink-0"
              />
              <div className="hidden sm:block whitespace-nowrap">
                <div className="text-xs font-bold text-forest-ink leading-tight flex items-center gap-1">
                  <span>{currentUser.name}</span>
                  <span className="text-[10px] text-slate font-normal">({currentUser.department})</span>
                </div>
                <div className="mt-0.5">{getRoleBadge(currentUser.role)}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-pebble flex-shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-white rounded-card shadow-elevated border border-fog p-2 z-50 animate-in fade-in-50 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-2 border-b border-fog">
                  <p className="text-[10px] uppercase font-bold text-pebble tracking-wider">현재 접속 계정</p>
                  <p className="text-sm font-bold text-forest-ink mt-0.5">{currentUser.name} · {currentUser.position}</p>
                  <p className="text-xs text-slate">{currentUser.email}</p>
                  <div className="mt-1.5">{getRoleBadge(currentUser.role)}</div>
                </div>

                <div className="py-1">
                  <p className="px-3 py-1.5 text-[10px] font-bold text-pebble">역할 시뮬레이션 전환</p>
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between text-xs transition-colors ${
                        u.id === currentUser.id 
                          ? 'bg-linen-mist/60 text-forest-ink font-bold' 
                          : 'hover:bg-fog text-charcoal'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-semibold">{u.name} <span className="text-[10px] text-slate font-normal">({u.department})</span></div>
                          <div className="text-[10px] text-slate">{u.position}</div>
                        </div>
                      </div>
                      <div>
                        {u.role === 'ADMIN' && <span className="text-[10px] bg-forest-ink text-lime-voltage px-1.5 py-0.5 rounded font-bold">Admin</span>}
                        {u.role === 'STAFF' && <span className="text-[10px] bg-fog text-forest-ink px-1.5 py-0.5 rounded font-semibold">Staff</span>}
                        {u.role === 'PENDING' && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">대기</span>}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-fog px-2 space-y-1.5">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenLogin();
                    }}
                    className="w-full text-center py-1.5 rounded-pill bg-linen-mist hover:bg-lime-voltage text-forest-ink text-xs font-bold transition-all"
                  >
                    다른 계정으로 로그인 (admin / 1130)
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-center py-1 rounded-pill text-pebble hover:text-alarm-red hover:bg-alarm-light text-[11px] font-semibold transition-all"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-fog bg-paper px-2 py-2 overflow-x-auto">
        <button
          onClick={() => onSelectTab('PUBLIC')}
          className={`flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-pill whitespace-nowrap ${
            currentTab === 'PUBLIC' ? 'bg-lime-voltage text-forest-ink' : 'text-slate'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          공용서식
        </button>
        <button
          onClick={() => onSelectTab('PRIVATE')}
          className={`flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-pill whitespace-nowrap ${
            currentTab === 'PRIVATE' ? 'bg-lime-voltage text-forest-ink' : 'text-slate'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          개인서식
        </button>
        <button
          onClick={() => onSelectTab('DECRYPT')}
          className={`flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-pill whitespace-nowrap ${
            currentTab === 'DECRYPT' ? 'bg-lime-voltage text-forest-ink' : 'text-slate'
          }`}
        >
          <FolderLock className="w-3.5 h-3.5" />
          PDF 암호해제
        </button>
        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => onSelectTab('ADMIN')}
            className={`flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-pill relative whitespace-nowrap ${
              currentTab === 'ADMIN' ? 'bg-lime-voltage text-forest-ink' : 'text-slate'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            회원관리
            {pendingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-alarm-red text-white text-[9px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};

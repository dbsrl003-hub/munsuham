import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  Users, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  Clock, 
  Search, 
  CheckCircle, 
  XCircle,
  Plus,
  Mail,
  Building,
  UserPlus
} from 'lucide-react';

interface AdminUserManagementProps {
  users: User[];
  onApproveUser: (userId: string) => void;
  onRejectUser: (userId: string) => void;
  onChangeUserRole: (userId: string, newRole: UserRole) => void;
  onAddUser: (user: Partial<User>) => void;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({
  users,
  onApproveUser,
  onRejectUser,
  onChangeUserRole,
  onAddUser
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserDept, setNewUserDept] = useState('사례관리팀');
  const [newUserPosition, setNewUserPosition] = useState('사회복지사');

  const pendingUsers = users.filter(u => u.role === 'PENDING');
  const activeUsers = users.filter(u => u.role !== 'PENDING');

  const filteredActiveUsers = activeUsers.filter(u => 
    u.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(filterQuery.toLowerCase()) ||
    u.department.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleCreateApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert('이름과 이메일을 입력해주세요.');
      return;
    }

    onAddUser({
      name: newUserName,
      email: newUserEmail,
      department: newUserDept,
      position: newUserPosition,
      role: 'PENDING',
      joinedAt: new Date().toISOString().split('T')[0]
    });

    setNewUserName('');
    setNewUserEmail('');
    setShowInviteModal(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Admin Title Card */}
      <div className="bg-forest-ink text-paper rounded-largeCard p-6 sm:p-8 shadow-darkCard">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-lime-voltage/20 text-lime-voltage text-xs font-bold uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>관리자 전용 제어판</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-paper tracking-tight">
              기관 회원 승인 및 계정 권한 관리
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              신규 가입 직원의 가입 신청을 승인하고, 공용 서식 관리 권한을 설정합니다.
            </p>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="px-5 py-2.5 rounded-pill bg-lime-voltage hover:bg-lime-hover text-forest-ink font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>가입 신청 시뮬레이션</span>
          </button>
        </div>
      </div>

      {/* 1. Pending Approvals Section */}
      <div className="bg-paper border border-fog rounded-card p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-forest-ink">
              승인 대기 중인 회원
            </h3>
            <span className="px-2 py-0.5 rounded-pill bg-amber-100 text-amber-900 text-xs font-extrabold border border-amber-200">
              {pendingUsers.length}명 대기
            </span>
          </div>
          <span className="text-xs text-slate">관리자의 가입 승인 후 보관함 이용이 가능합니다.</span>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="bg-linen-light/50 border border-linen-mist rounded-card p-8 text-center">
            <CheckCircle className="w-8 h-8 text-spruce mx-auto mb-2" />
            <p className="text-sm font-bold text-forest-ink">현재 대기 중인 가입 신청이 없습니다.</p>
            <p className="text-xs text-slate mt-1">모든 직원이 정상 승인되어 활동 중입니다.</p>
          </div>
        ) : (
          <div className="divide-y divide-fog">
            {pendingUsers.map((u) => (
              <div key={u.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=e8ebe6&color=163300`}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover border border-fog"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-forest-ink">{u.name}</span>
                      <span className="text-xs text-slate">({u.position})</span>
                      <span className="px-2 py-0.5 rounded-pill text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        대기
                      </span>
                    </div>
                    <div className="text-xs text-slate flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-pebble" />{u.email}</span>
                      <span className="flex items-center gap-1"><Building className="w-3 h-3 text-pebble" />{u.department}</span>
                      <span>신청일: {u.joinedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onRejectUser(u.id)}
                    className="px-3.5 py-1.5 rounded-pill border border-alarm-red/40 text-alarm-red hover:bg-alarm-light text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>반려</span>
                  </button>
                  <button
                    onClick={() => onApproveUser(u.id)}
                    className="px-4 py-1.5 rounded-pill bg-lime-voltage hover:bg-lime-hover text-forest-ink text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                  >
                    <UserCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>승인 처리</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Active Staff Directory & Roles */}
      <div className="bg-paper border border-fog rounded-card p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-forest-ink" />
            <h3 className="text-base font-bold text-forest-ink">
              승인된 직원 명단 및 권한 설정
            </h3>
            <span className="text-xs text-pebble">({filteredActiveUsers.length}명)</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-pebble absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="이름, 부서, 이메일 검색..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-input border border-pebble/60 focus:border-forest-ink focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-fog/60 border-b border-fog text-charcoal font-bold">
              <tr>
                <th className="py-2.5 px-3">직원명</th>
                <th className="py-2.5 px-3">부서 및 직책</th>
                <th className="py-2.5 px-3">이메일</th>
                <th className="py-2.5 px-3">승인일</th>
                <th className="py-2.5 px-3 text-center">부여된 시스템 권한</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fog">
              {filteredActiveUsers.map((u) => (
                <tr key={u.id} className="hover:bg-linen-light/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=163300&color=9fe870`}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span className="font-bold text-forest-ink">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-charcoal">
                    <div>{u.department}</div>
                    <div className="text-[11px] text-pebble">{u.position}</div>
                  </td>
                  <td className="py-3 px-3 text-slate">{u.email}</td>
                  <td className="py-3 px-3 text-pebble">{u.approvedAt || u.joinedAt}</td>
                  <td className="py-3 px-3 text-center">
                    <select
                      value={u.role}
                      onChange={(e) => onChangeUserRole(u.id, e.target.value as UserRole)}
                      aria-label={`${u.name} 직원의 권한 변경`}
                      className={`text-xs font-bold py-1 px-2.5 rounded-pill border cursor-pointer focus:outline-none transition-all ${
                        u.role === 'ADMIN'
                          ? 'bg-forest-ink text-lime-voltage border-forest-ink'
                          : 'bg-linen-mist text-forest-ink border-lime-voltage/40'
                      }`}
                    >
                      <option value="STAFF">일반직원 (Staff)</option>
                      <option value="ADMIN">관리자 (Admin)</option>
                      <option value="PENDING">승인보류 (Pending)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Simulation Applicant */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper rounded-card border border-fog p-6 max-w-md w-full shadow-elevated animate-in zoom-in-95">
            <h3 className="text-base font-bold text-forest-ink mb-2">신규 회원가입 신청 시뮬레이션</h3>
            <p className="text-xs text-slate mb-4">
              신규 직원의 가입 신청을 등록하여 관리자 승인 절차를 직접 테스트해 볼 수 있습니다.
            </p>

            <form onSubmit={handleCreateApplicant} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">성명</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="예: 강행정"
                  className="w-full px-3 py-2 text-xs rounded-input border border-pebble focus:border-forest-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">기관 이메일</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="예: kang@sw-welfare.or.kr"
                  className="w-full px-3 py-2 text-xs rounded-input border border-pebble focus:border-forest-ink focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">소속 부서</label>
                  <select
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-input border border-pebble focus:border-forest-ink focus:outline-none bg-white"
                  >
                    <option value="사례관리팀">사례관리팀</option>
                    <option value="지역조직화팀">지역조직화팀</option>
                    <option value="운영지원팀">운영지원팀</option>
                    <option value="직업재활팀">직업재활팀</option>
                    <option value="기획홍보팀">기획홍보팀</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">직책</label>
                  <input
                    type="text"
                    value={newUserPosition}
                    onChange={(e) => setNewUserPosition(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-input border border-pebble focus:border-forest-ink focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-fog">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-pill bg-fog text-charcoal text-xs font-semibold hover:bg-pebble/20"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-pill bg-lime-voltage hover:bg-lime-hover text-forest-ink text-xs font-bold shadow-sm"
                >
                  가입 신청 제출
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

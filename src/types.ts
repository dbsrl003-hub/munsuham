export type UserRole = 'ADMIN' | 'STAFF' | 'PENDING';

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  role: UserRole;
  avatar?: string;
  approvedAt?: string;
  joinedAt: string;
}

export type Category = 
  | '전체' 
  | '이용자' 
  | '활동지원사' 
  | '회계서류' 
  | '행정서류' 
  | '후원/홍보' 
  | '기타';

export type FileType = 'hwp' | 'hwpx' | 'xlsx' | 'xls' | 'pdf';

export interface DocumentForm {
  id: string;
  title: string;
  description: string;
  category: Exclude<Category, '전체'>;
  fileType: FileType;
  fileName: string;
  fileSize: string; // e.g. "124 KB", "1.2 MB"
  authorId: string;
  authorName: string;
  authorDept: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean; // true: 기관 공용, false: 개인 양식
  downloadsCount: number;
  tags: string[];
  sampleContentUrl?: string; // Supabase storage path or blob
  fileData?: Blob | ArrayBuffer;
  version?: string;
}


export type Language = 'en' | 'ta';

export enum Role {
  GUEST = 'GUEST',
  STUDENT = 'STUDENT',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  schoolId?: string;
  avatarUrl?: string;
}

export enum View {
  LANDING = 'LANDING',
  STUDENT_DASHBOARD = 'STUDENT_DASHBOARD',
  LMS_PLAYER = 'LMS_PLAYER',
  SCHOOL_DASHBOARD = 'SCHOOL_DASHBOARD',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  ABOUT = 'ABOUT',
  HELP = 'HELP',
  FORBIDDEN = 'FORBIDDEN',
  PROFILE = 'PROFILE'
}

export type VideoStatus = 'uploading' | 'processing' | 'ready' | 'error';
export type ContentCategory = 'AI Design' | 'AI Coding' | 'Startups' | 'Academics';

export interface VideoAsset {
  id: string;
  status: VideoStatus;
  cdnUrl?: string; 
  posterUrl?: string;
  duration?: number;
  captions?: { lang: 'en' | 'ta'; url: string }[];
}

export interface Module {
  id: string;
  title: { en: string; ta: string };
  description: { en: string; ta: string };
  video?: VideoAsset;
  videoUrl?: string;
  content: { en: string; ta: string };
  assessmentTask: { en: string; ta: string };
  category?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface SchoolData {
  id: string;
  name: string;
  principalName: string;
  email: string;
  phone: string;
  studentCount: number;
  board: string;
  language: string;
  status: 'PENDING' | 'APPROVED';
  onboardedAt: string;
  assignedModules: string[];
  district?: string;
}

export interface StudentData {
    id: string;
    name: string;
    grade: string;
    progress: number;
    lastActive: string;
}

export type GradeGroup = '6-8' | '9-10' | '11-12' | '9-12';

export type VideoVisibility = 'public' | 'school-only' | 'private';

export interface VideoMetadata {
  id: string;
  titleEn: string;
  titleTa: string;
  descEn: string;
  descTa: string;
  status: VideoStatus;
  visibility: VideoVisibility;
  category: ContentCategory;
  gradeGroup: GradeGroup;
  isMobileOptimized: boolean;
  assignmentLink?: string;
  duration?: number;
  thumbnailUrl?: string;
  hlsUrl?: string;
  transcript?: string;
  assignedSchoolIds: string[];
  createdAt: string;
  views: number;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: { en: string; ta: string };
  message: { en: string; ta: string };
  timestamp: number;
  read: boolean;
  linkTo?: string;
}

export interface LeaderboardEntry {
    rank: number;
    name: string;
    school: string;
    coins: number;
    xp: number;
    league: League;
}

export type League = 'Novice' | 'Apprentice' | 'Expert' | 'Master' | 'Grandmaster';

export interface Badge {
    id: string;
    name: { en: string; ta: string };
    description: { en: string; ta: string };
    icon: string; // Lucide icon name or emoji
    unlocked: boolean;
    unlockedAt?: number;
}

export interface UserStats {
    coins: number;
    xp: number;
    level: number;
    league: League;
    badges: string[]; // Badge IDs
    streak: number;
}

export interface SystemSettings {
    maintenanceMode: boolean;
    allowRegistrations: boolean;
    defaultQuality: 'auto' | '360p' | '720p';
    defaultLanguage: 'en' | 'ta';
}

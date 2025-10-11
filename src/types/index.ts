// Export our own enums to match Prisma schema
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER', 
  PARENT = 'PARENT',
  STUDENT = 'STUDENT'
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT', 
  LATE = 'LATE',
  EXCUSED = 'EXCUSED'
}

export enum GradeType {
  ASSIGNMENT = 'ASSIGNMENT',
  QUIZ = 'QUIZ',
  EXAM = 'EXAM',
  PROJECT = 'PROJECT',
  PARTICIPATION = 'PARTICIPATION'
}

export enum MessageType {
  GENERAL = 'GENERAL',
  GRADE_NOTIFICATION = 'GRADE_NOTIFICATION',
  ATTENDANCE_ALERT = 'ATTENDANCE_ALERT',
  DISCIPLINARY = 'DISCIPLINARY'
}

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

export interface UserProfile {
  id: string
  email: string
  name?: string
  role: UserRole
  image?: string
}

export interface TeacherData {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  subjects: SubjectData[]
  classes: ClassData[]
}

export interface ParentData {
  id: string
  firstName: string
  lastName: string
  phone: string
  address?: string
  occupation?: string
  children: StudentData[]
}

export interface StudentData {
  id: string
  studentId: string
  firstName: string
  lastName: string
  dateOfBirth: Date
  grade: string
  section?: string
  enrollmentDate: Date
  isActive: boolean
}

export interface SubjectData {
  id: string
  name: string
  code: string
  description?: string
  credits: number
}

export interface ClassData {
  id: string
  name: string
  grade: string
  section: string
  academicYear: string
  subject: SubjectData
  teacher: TeacherData
  students: StudentData[]
}

export interface GradeData {
  id: string
  student: StudentData
  subject: SubjectData
  teacher: TeacherData
  gradeType: GradeType
  score: number
  maxScore: number
  percentage?: number
  letterGrade?: string
  comments?: string
  gradeDate: Date
}

export interface AttendanceData {
  id: string
  student: StudentData
  class: ClassData
  teacher: TeacherData
  date: Date
  status: AttendanceStatus
  notes?: string
}

export interface ObservationData {
  id: string
  student: StudentData
  teacher: TeacherData
  title: string
  description: string
  category: string
  isPositive: boolean
  date: Date
}

export interface MessageData {
  id: string
  sender: UserProfile
  receiver: UserProfile
  subject: string
  content: string
  type: MessageType
  isRead: boolean
  createdAt: Date
}

export interface NotificationData {
  id: string
  user: UserProfile
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  actionUrl?: string
  createdAt: Date
}
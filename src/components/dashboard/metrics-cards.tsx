import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Calendar,
  Award,
  Activity,
  Target
} from "lucide-react"

// Interfaces genéricas para métricas
interface DashboardMetrics {
  overview?: {
    [key: string]: number | string
  }
  [key: string]: unknown
}

interface AdminMetrics extends DashboardMetrics {
  overview: {
    totalStudents: number
    totalTeachers: number
    totalUsers: number
    totalClasses: number
    totalSubjects: number
    totalGrades: number
    averageGrade: number
    attendanceRate: number
  }
  systemMetrics?: unknown
  recentActivity?: unknown[]
  trends?: {
    [key: string]: string
  }
}

interface TeacherMetrics extends DashboardMetrics {
  overview: {
    totalClasses: number
    totalStudents: number
    averageGrade: number
    attendanceRate: number
  }
  recentGrades?: unknown[]
  upcomingClasses?: unknown[]
}

interface ParentMetrics extends DashboardMetrics {
  overview: {
    totalChildren: number
    averageGPA: number
    averageAttendance: number
  }
  children?: unknown[]
}

interface StudentMetrics extends DashboardMetrics {
  overview: {
    gpa: number
    attendanceRate: number
    behaviorScore: number
  }
  recentGrades?: unknown[]
  upcomingAssignments?: unknown[]
}

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  icon?: React.ReactNode
  color?: "blue" | "green" | "yellow" | "red" | "purple"
}

export function MetricCard({ 
  title, 
  value, 
  description, 
  trend, 
  icon, 
  color = "blue" 
}: MetricCardProps) {
  const colorClasses = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-green-200 bg-green-50 text-green-700",
    yellow: "border-yellow-200 bg-yellow-50 text-yellow-700",
    red: "border-red-200 bg-red-50 text-red-700",
    purple: "border-purple-200 bg-purple-50 text-purple-700",
  }

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon && (
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2 space-x-1">
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-xs font-medium ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}>
              {trend.value}
            </span>
            <span className="text-xs text-gray-500">vs último mes</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ProgressCardProps {
  title: string
  value: number
  maxValue?: number
  color?: "blue" | "green" | "yellow" | "red"
  description?: string
}

export function ProgressCard({ 
  title, 
  value, 
  maxValue = 100, 
  color = "blue",
  description 
}: ProgressCardProps) {
  const percentage = (value / maxValue) * 100
  
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-sm text-gray-500">de {maxValue}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              percentage >= 90 ? 'bg-green-500' : 
              percentage >= 70 ? 'bg-yellow-500' : 
              'bg-red-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-2">{description}</p>
        )}
        <div className="flex justify-between items-center mt-2">
          <span className={`text-sm font-medium ${colorClasses[color]}`}>
            {percentage.toFixed(1)}%
          </span>
          <Badge variant={
            percentage >= 90 ? "default" : 
            percentage >= 70 ? "secondary" : 
            "destructive"
          }>
            {percentage >= 90 ? "Excelente" : 
             percentage >= 70 ? "Bueno" : 
             "Necesita mejora"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

// Tipos de métricas
// Interfaces eliminadas - usando las definidas arriba

// Componentes específicos para cada rol

export function AdminMetricsOverview({ metrics }: { metrics: AdminMetrics }) {
  if (!metrics?.overview) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Estudiantes"
        value={metrics.overview.totalStudents}
        trend={{ value: metrics.trends?.studentsGrowth || "+0%", isPositive: true }}
        icon={<Users className="h-4 w-4" />}
        color="blue"
      />
      <MetricCard
        title="Total Profesores"
        value={metrics.overview.totalTeachers}
        trend={{ value: metrics.trends?.teachersGrowth || "+0%", isPositive: true }}
        icon={<BookOpen className="h-4 w-4" />}
        color="green"
      />
      <MetricCard
        title="Promedio General"
        value={`${metrics.overview.averageGrade?.toFixed(1) || 0}/20`}
        description="Calificación promedio del colegio"
        icon={<Award className="h-4 w-4" />}
        color="yellow"
      />
      <MetricCard
        title="Asistencia"
        value={`${metrics.overview.attendanceRate?.toFixed(1) || 0}%`}
        trend={{ value: metrics.trends?.attendanceGrowth || "+0%", isPositive: true }}
        icon={<Activity className="h-4 w-4" />}
        color="purple"
      />
      <MetricCard
        title="Total Clases"
        value={metrics.overview.totalClasses}
        description="Clases programadas"
        icon={<Calendar className="h-4 w-4" />}
        color="blue"
      />
      <MetricCard
        title="Total Materias"
        value={metrics.overview.totalSubjects}
        description="Materias en el currículo"
        icon={<BookOpen className="h-4 w-4" />}
        color="green"
      />
      <MetricCard
        title="Total Usuarios"
        value={metrics.overview.totalUsers}
        description="Usuarios en el sistema"
        icon={<Users className="h-4 w-4" />}
        color="purple"
      />
      <MetricCard
        title="Evaluaciones"
        value={metrics.overview.totalGrades}
        description="Total de calificaciones registradas"
        icon={<Target className="h-4 w-4" />}
        color="yellow"
      />
    </div>
  )
}

export function TeacherMetricsOverview({ metrics }: { metrics: TeacherMetrics }) {
  if (!metrics?.overview) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Mis Estudiantes"
        value={metrics.overview.totalStudents}
        description="Estudiantes asignados"
        icon={<Users className="h-4 w-4" />}
        color="blue"
      />
      <MetricCard
        title="Mis Clases"
        value={metrics.overview.totalClasses}
        description="Clases que enseño"
        icon={<BookOpen className="h-4 w-4" />}
        color="green"
      />
      <MetricCard
        title="Promedio Clases"
        value={`${metrics.overview.averageGrade || 0}/20`}
        description="Promedio de mis estudiantes"
        icon={<Award className="h-4 w-4" />}
        color="yellow"
      />
      <MetricCard
        title="Asistencia"
        value={`${metrics.overview.attendanceRate || 0}%`}
        description="Asistencia a mis clases"
        icon={<Activity className="h-4 w-4" />}
        color="purple"
      />
    </div>
  )
}

export function ParentMetricsOverview({ metrics }: { metrics: ParentMetrics }) {
  if (!metrics?.overview) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Mis Hijos"
        value={metrics.overview.totalChildren}
        description="Hijos en el colegio"
        icon={<Users className="h-4 w-4" />}
        color="blue"
      />
      <MetricCard
        title="Promedio General"
        value={`${metrics.overview.averageGPA?.toFixed(1) || 0}/20`}
        description="Promedio de todos mis hijos"
        icon={<Award className="h-4 w-4" />}
        color="green"
      />
      <MetricCard
        title="Asistencia"
        value={`${metrics.overview.averageAttendance?.toFixed(1) || 0}%`}
        description="Asistencia promedio"
        icon={<Activity className="h-4 w-4" />}
        color="purple"
      />
    </div>
  )
}

export function StudentMetricsOverview({ metrics }: { metrics: StudentMetrics }) {
  if (!metrics?.overview) return null

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Mi Promedio"
        value={`${metrics.overview.gpa || 0}/20`}
        description="Promedio actual"
        icon={<Award className="h-4 w-4" />}
        color={metrics.overview.gpa >= 16 ? "green" : metrics.overview.gpa >= 14 ? "yellow" : "red"}
      />
      <MetricCard
        title="Asistencia"
        value={`${metrics.overview.attendanceRate || 0}%`}
        description="Mi asistencia"
        icon={<Activity className="h-4 w-4" />}
        color={metrics.overview.attendanceRate >= 90 ? "green" : metrics.overview.attendanceRate >= 80 ? "yellow" : "red"}
      />
      <MetricCard
        title="Comportamiento"
        value={`${metrics.overview.behaviorScore || 100}/100`}
        description="Puntuación de comportamiento"
        icon={<Target className="h-4 w-4" />}
        color="blue"
      />
      <MetricCard
        title="Mis Clases"
        value={5}
        description="Clases matriculadas"
        icon={<BookOpen className="h-4 w-4" />}
        color="purple"
      />
    </div>
  )
}
// Datos de ejemplo para testing - se puede eliminar cuando haya datos reales
export const sampleMessages = [
  {
    id: "1",
    subject: "Reunión de padres de familia",
    content: "Se convoca a reunión de padres de familia para el día viernes 25 de octubre a las 6:00 PM en el aula de 5to A. Temas a tratar: rendimiento académico, proyectos del trimestre y próximas actividades.",
    createdAt: "2025-10-23T14:00:00Z",
    isRead: false,
    isBroadcast: false,
    priority: "HIGH" as const,
    sender: {
      id: "teacher1",
      name: "Prof. María García",
      email: "maria.garcia@school.com",
      role: "TEACHER"
    },
    receiver: {
      id: "admin1",
      name: "Director Carmen Vega",
      email: "admin@school.com", 
      role: "ADMIN"
    }
  },
  {
    id: "2",
    subject: "Comunicado: Suspensión de clases",
    content: "Debido a las condiciones climáticas adversas, se informa que las clases del día viernes 25 de octubre están suspendidas. Las clases se reanudarán el lunes 28 de octubre en horario normal.",
    createdAt: "2025-10-22T08:00:00Z",
    isRead: true,
    isBroadcast: true,
    priority: "URGENT" as const,
    targetRole: null, // Para todos
    sender: {
      id: "admin1",
      name: "Administración",
      email: "admin@school.com",
      role: "ADMIN"
    }
  },
  {
    id: "3",
    subject: "Evaluaciones del tercer trimestre",
    content: "Recordamos que las evaluaciones del tercer trimestre comenzarán la próxima semana. Se adjunta el cronograma de exámenes para todas las materias.",
    createdAt: "2025-10-21T10:30:00Z",
    isRead: false,
    isBroadcast: true,
    priority: "MEDIUM" as const,
    targetRole: "STUDENT",
    sender: {
      id: "admin1", 
      name: "Administración",
      email: "admin@school.com",
      role: "ADMIN"
    }
  }
]
// Colores institucionales basados en el logo de I.E. 3024 José Antonio Encinas
export const institutionalColors = {
  primary: {
    // Azul institucional
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  secondary: {
    // Rojo institucional
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  accent: {
    // Amarillo dorado (del escudo)
    50: '#fefce8',
    100: '#fef3c7',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },
  // Valores institucionales reflejados en colores
  values: {
    honradez: '#3b82f6', // Azul - honradez
    disciplina: '#dc2626', // Rojo - disciplina  
    estudio: '#059669', // Verde - estudio
    trabajo: '#ca8a04', // Amarillo - trabajo
  }
}

// Utilidades para usar los colores
export const getInstitutionalGradient = (variant: 'primary' | 'secondary' | 'accent' = 'primary') => {
  switch (variant) {
    case 'primary':
      return 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800'
    case 'secondary':
      return 'bg-gradient-to-r from-red-600 via-red-700 to-red-800'
    case 'accent':
      return 'bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700'
    default:
      return 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800'
  }
}

// Configuración de tema para tarjetas de dashboard
export const dashboardCardThemes = {
  students: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
  grades: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200', 
  attendance: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
  messages: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
  notifications: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
  subjects: 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200',
  classes: 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200',
  reports: 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200',
}

export const institutionalMotto = "Honradez • Disciplina • Estudio • Trabajo"
export const institutionName = "I.E. 3024 José Antonio Encinas"
export const institutionFullName = "Institución Educativa 3024 José Antonio Encinas"
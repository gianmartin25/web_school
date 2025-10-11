import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos - I.E. 3024 José Antonio Encinas...')

  // Limpiar datos existentes en orden correcto (respetando relaciones)
  await prisma.observation.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.grade.deleteMany()
  await prisma.message.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.classStudent.deleteMany()
  await prisma.class.deleteMany()
  await prisma.student.deleteMany()
  await prisma.teacherProfile.deleteMany()
  await prisma.parentProfile.deleteMany()
  await prisma.studentProfile.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.gradeSection.deleteMany()
  await prisma.academicGrade.deleteMany()
  await prisma.section.deleteMany()
  await prisma.schoolSettings.deleteMany()
  await prisma.userSettings.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️ Datos existentes eliminados')

  // Hash para contraseñas
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10)
  const hashedPasswordTeacher = await bcrypt.hash('teacher123', 10)
  const hashedPasswordParent = await bcrypt.hash('parent123', 10)
  const hashedPasswordStudent = await bcrypt.hash('student123', 10)

  console.log('🏫 Creando configuración del colegio...')
  
  // 1. CONFIGURACIÓN DEL COLEGIO
  await prisma.schoolSettings.create({
    data: {
      schoolName: 'I.E. 3024 José Antonio Encinas',
      schoolAddress: 'Av. José Antonio Encinas 123, San Juan de Lurigancho, Lima',
      schoolPhone: '+51 01 234-5678',
      schoolEmail: 'contacto@ie3024.edu.pe',
      schoolWebsite: 'https://ie3024.edu.pe',
      primaryColor: '#1E40AF',
      secondaryColor: '#DC2626',
      academicYearStart: '2025-03-01',
      academicYearEnd: '2025-12-15',
      gradeSystem: 'vigesimal',
      maxGrade: 20,
      passingGrade: 11,
      attendanceRequired: 80,
      timezone: 'America/Lima',
      language: 'es',
    }
  })

  console.log('👤 Creando usuarios administradores...')
  
  // 2. ADMINISTRADORES
  const admin = await prisma.user.create({
    data: {
      email: 'admin@ie3024.edu.pe',
      name: 'Director(a) Carmen Rodríguez Vega',
      password: hashedPasswordAdmin,
      role: 'ADMIN',
    }
  })

  await prisma.userSettings.create({
    data: {
      userId: admin.id,
      theme: 'light',
      language: 'es',
      emailNotifications: true,
    }
  })

  console.log('📊 Creando grados académicos...')
  
  // 3. GRADOS ACADÉMICOS
  const primaryGrades = [
    { name: '1°', level: 1, description: 'Primer grado de primaria' },
    { name: '2°', level: 2, description: 'Segundo grado de primaria' },
    { name: '3°', level: 3, description: 'Tercer grado de primaria' },
    { name: '4°', level: 4, description: 'Cuarto grado de primaria' },
    { name: '5°', level: 5, description: 'Quinto grado de primaria' },
    { name: '6°', level: 6, description: 'Sexto grado de primaria' },
  ]

  const secondaryGrades = [
    { name: '1° Sec', level: 7, description: 'Primer año de secundaria' },
    { name: '2° Sec', level: 8, description: 'Segundo año de secundaria' },
    { name: '3° Sec', level: 9, description: 'Tercer año de secundaria' },
    { name: '4° Sec', level: 10, description: 'Cuarto año de secundaria' },
    { name: '5° Sec', level: 11, description: 'Quinto año de secundaria' },
  ]

  const allGrades = [...primaryGrades, ...secondaryGrades]
  const academicGrades = []

  for (const gradeData of allGrades) {
    const grade = await prisma.academicGrade.create({
      data: gradeData
    })
    academicGrades.push(grade)
  }

  console.log('📝 Creando secciones...')
  
  // 4. SECCIONES
  const sectionNames = ['A', 'B', 'C']
  const sections = []

  for (const sectionName of sectionNames) {
    const section = await prisma.section.create({
      data: {
        name: sectionName,
        description: `Sección ${sectionName}`,
      }
    })
    sections.push(section)
  }

  console.log('🏫 Creando combinaciones grado-sección...')
  
  // 5. COMBINACIONES GRADO-SECCIÓN
  const gradeSections = []
  for (const grade of academicGrades) {
    for (const section of sections) {
      const gradeSection = await prisma.gradeSection.create({
        data: {
          gradeId: grade.id,
          sectionId: section.id,
          capacity: grade.level <= 6 ? 25 : 30, // Primaria: 25, Secundaria: 30
        }
      })
      gradeSections.push({ ...gradeSection, grade, section })
    }
  }

  console.log('📚 Creando materias...')
  
  // 6. MATERIAS
  const subjects = await Promise.all([
    // Materias de Primaria
    prisma.subject.create({
      data: {
        name: 'Matemática (Primaria)',
        code: 'MAT-P',
        description: 'Matemática para educación primaria',
        credits: 6,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Comunicación (Primaria)',
        code: 'COM-P',
        description: 'Comunicación integral',
        credits: 6,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Ciencia y Tecnología (Primaria)',
        code: 'CYT-P',
        description: 'Ciencia y Tecnología',
        credits: 4,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Personal Social',
        code: 'PS-P',
        description: 'Personal Social',
        credits: 4,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Arte y Cultura',
        code: 'AYC-P',
        description: 'Arte y Cultura',
        credits: 2,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Educación Física (Primaria)',
        code: 'EF-P',
        description: 'Educación Física',
        credits: 2,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Educación Religiosa (Primaria)',
        code: 'ER-P',
        description: 'Educación Religiosa',
        credits: 2,
      }
    }),
    // Materias de Secundaria
    prisma.subject.create({
      data: {
        name: 'Matemática (Secundaria)',
        code: 'MAT-S',
        description: 'Matemática para educación secundaria',
        credits: 6,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Comunicación (Secundaria)',
        code: 'COM-S',
        description: 'Comunicación para educación secundaria',
        credits: 5,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Inglés',
        code: 'ING-S',
        description: 'Idioma Inglés',
        credits: 2,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Historia, Geografía y Economía',
        code: 'HGE-S',
        description: 'Historia, Geografía y Economía',
        credits: 3,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Formación Ciudadana y Cívica',
        code: 'FCC-S',
        description: 'Formación Ciudadana y Cívica',
        credits: 2,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Persona, Familia y Relaciones Humanas',
        code: 'PFRH-S',
        description: 'Persona, Familia y Relaciones Humanas',
        credits: 2,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Ciencia, Tecnología y Ambiente',
        code: 'CTA-S',
        description: 'Ciencia, Tecnología y Ambiente',
        credits: 5,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Educación para el Trabajo',
        code: 'EPT-S',
        description: 'Educación para el Trabajo',
        credits: 2,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Arte (Secundaria)',
        code: 'ART-S',
        description: 'Arte',
        credits: 2,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Educación Física (Secundaria)',
        code: 'EF-S',
        description: 'Educación Física',
        credits: 2,
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Educación Religiosa (Secundaria)',
        code: 'ER-S',
        description: 'Educación Religiosa',
        credits: 2,
      }
    }),
  ])

  console.log('👨‍🏫 Creando profesores...')
  
  // 7. PROFESORES
  const teachersData = [
    {
      email: 'maria.garcia@ie3024.edu.pe',
      name: 'Prof. María García Flores',
      employeeId: 'DOC001',
      firstName: 'María',
      lastName: 'García Flores',
      phone: '+51 987 654 321',
      dateOfBirth: new Date('1980-07-22'),
      hireDate: new Date('2012-03-01'),
      salary: 3800.00,
      address: 'Av. Los Olivos 456, San Juan de Lurigancho',
      subjectNames: ['Matemática'],
    },
    {
      email: 'carlos.rodriguez@ie3024.edu.pe',
      name: 'Prof. Carlos Rodríguez Mendoza',
      employeeId: 'DOC002',
      firstName: 'Carlos',
      lastName: 'Rodríguez Mendoza',
      phone: '+51 987 654 322',
      dateOfBirth: new Date('1975-11-15'),
      hireDate: new Date('2010-03-01'),
      salary: 4200.00,
      address: 'Jr. Las Flores 123, Comas',
      subjectNames: ['Comunicación'],
    },
    {
      email: 'ana.lopez@ie3024.edu.pe',
      name: 'Prof. Ana López Vargas',
      employeeId: 'DOC003',
      firstName: 'Ana',
      lastName: 'López Vargas',
      phone: '+51 987 654 323',
      dateOfBirth: new Date('1988-11-10'),
      hireDate: new Date('2015-03-01'),
      salary: 3600.00,
      address: 'Av. El Sol 789, Los Olivos',
      subjectNames: ['Inglés', 'Arte y Cultura', 'Arte'],
    },
    {
      email: 'luis.martinez@ie3024.edu.pe',
      name: 'Prof. Luis Martínez Silva',
      employeeId: 'DOC004',
      firstName: 'Luis',
      lastName: 'Martínez Silva',
      phone: '+51 987 654 324',
      dateOfBirth: new Date('1972-04-08'),
      hireDate: new Date('2008-03-01'),
      salary: 4500.00,
      address: 'Jr. Los Pinos 321, San Martín de Porres',
      subjectNames: ['Ciencia y Tecnología', 'Ciencia, Tecnología y Ambiente'],
    },
    {
      email: 'elena.torres@ie3024.edu.pe',
      name: 'Prof. Elena Torres Guerrero',
      employeeId: 'DOC005',
      firstName: 'Elena',
      lastName: 'Torres Guerrero',
      phone: '+51 987 654 325',
      dateOfBirth: new Date('1985-09-20'),
      hireDate: new Date('2013-03-01'),
      salary: 3700.00,
      address: 'Av. Los Héroes 654, Independencia',
      subjectNames: ['Historia, Geografía y Economía', 'Personal Social', 'Formación Ciudadana y Cívica'],
    },
    {
      email: 'roberto.sanchez@ie3024.edu.pe',
      name: 'Prof. Roberto Sánchez Morales',
      employeeId: 'DOC006',
      firstName: 'Roberto',
      lastName: 'Sánchez Morales',
      phone: '+51 987 654 326',
      dateOfBirth: new Date('1990-12-03'),
      hireDate: new Date('2018-03-01'),
      salary: 3500.00,
      address: 'Jr. Los Jardines 987, Puente Piedra',
      subjectNames: ['Educación Física'],
    },
    {
      email: 'sofia.ramirez@ie3024.edu.pe',
      name: 'Prof. Sofía Ramírez Castro',
      employeeId: 'DOC007',
      firstName: 'Sofía',
      lastName: 'Ramírez Castro',
      phone: '+51 987 654 327',
      dateOfBirth: new Date('1983-06-14'),
      hireDate: new Date('2011-03-01'),
      salary: 3900.00,
      address: 'Av. Las Palmeras 234, Carabayllo',
      subjectNames: ['Educación Religiosa'],
    },
    {
      email: 'miguel.vargas@ie3024.edu.pe',
      name: 'Prof. Miguel Vargas Díaz',
      employeeId: 'DOC008',
      firstName: 'Miguel',
      lastName: 'Vargas Díaz',
      phone: '+51 987 654 328',
      dateOfBirth: new Date('1978-01-28'),
      hireDate: new Date('2009-03-01'),
      salary: 4100.00,
      address: 'Jr. Los Claveles 567, Santa Rosa',
      subjectNames: ['Educación para el Trabajo', 'Persona, Familia y Relaciones Humanas'],
    },
  ]

  const teachers = []
  for (const teacherData of teachersData) {
    // Crear usuario para profesor
    const teacherUser = await prisma.user.create({
      data: {
        email: teacherData.email,
        name: teacherData.name,
        password: hashedPasswordTeacher,
        role: 'TEACHER',
      }
    })

    // Crear configuración de usuario
    await prisma.userSettings.create({
      data: {
        userId: teacherUser.id,
        theme: 'light',
        language: 'es',
        emailNotifications: true,
      }
    })

    // Crear perfil de profesor
    const teacher = await prisma.teacherProfile.create({
      data: {
        userId: teacherUser.id,
        employeeId: teacherData.employeeId,
        firstName: teacherData.firstName,
        lastName: teacherData.lastName,
        phone: teacherData.phone,
        address: teacherData.address,
        dateOfBirth: teacherData.dateOfBirth,
        hireDate: teacherData.hireDate,
        salary: teacherData.salary,
      }
    })

    teachers.push({ ...teacher, subjectNames: teacherData.subjectNames })
  }

  console.log('📚 Asignando materias a profesores...')
  
  // Asignar materias a profesores
  for (const teacher of teachers) {
    for (const subjectName of teacher.subjectNames) {
      const subject = subjects.find(s => s.name === subjectName)
      if (subject) {
        await prisma.subject.update({
          where: { id: subject.id },
          data: { teacherId: teacher.id }
        })
      }
    }
  }

  console.log('👨‍👩‍👧‍👦 Creando padres de familia...')
  
  // 8. PADRES DE FAMILIA
  const parentsData = [
    {
      email: 'juan.perez@gmail.com',
      name: 'Juan Carlos Pérez Gonzales',
      firstName: 'Juan Carlos',
      lastName: 'Pérez Gonzales',
      phone: '+51 987 123 456',
      address: 'Av. Los Héroes 123, San Juan de Lurigancho',
      occupation: 'Contador',
    },
    {
      email: 'maria.lopez@gmail.com',
      name: 'María Elena López de Pérez',
      firstName: 'María Elena',
      lastName: 'López de Pérez',
      phone: '+51 987 123 457',
      address: 'Av. Los Héroes 123, San Juan de Lurigancho',
      occupation: 'Enfermera',
    },
    {
      email: 'carlos.mendoza@gmail.com',
      name: 'Carlos Alberto Mendoza Ríos',
      firstName: 'Carlos Alberto',
      lastName: 'Mendoza Ríos',
      phone: '+51 987 123 458',
      address: 'Jr. Las Flores 456, Comas',
      occupation: 'Ingeniero',
    },
    {
      email: 'ana.rios@gmail.com',
      name: 'Ana Lucía Ríos Vásquez',
      firstName: 'Ana Lucía',
      lastName: 'Ríos Vásquez',
      phone: '+51 987 123 459',
      address: 'Jr. Las Flores 456, Comas',
      occupation: 'Profesora',
    },
    {
      email: 'pedro.silva@gmail.com',
      name: 'Pedro Antonio Silva Morales',
      firstName: 'Pedro Antonio',
      lastName: 'Silva Morales',
      phone: '+51 987 123 460',
      address: 'Av. El Sol 789, Los Olivos',
      occupation: 'Comerciante',
    },
    {
      email: 'rosa.morales@gmail.com',
      name: 'Rosa María Morales de Silva',
      firstName: 'Rosa María',
      lastName: 'Morales de Silva',
      phone: '+51 987 123 461',
      address: 'Av. El Sol 789, Los Olivos',
      occupation: 'Secretaria',
    },
    {
      email: 'miguel.torres@gmail.com',
      name: 'Miguel Ángel Torres Castillo',
      firstName: 'Miguel Ángel',
      lastName: 'Torres Castillo',
      phone: '+51 987 123 462',
      address: 'Jr. Los Pinos 321, San Martín de Porres',
      occupation: 'Mecánico',
    },
    {
      email: 'carmen.castillo@gmail.com',
      name: 'Carmen Rosa Castillo de Torres',
      firstName: 'Carmen Rosa',
      lastName: 'Castillo de Torres',
      phone: '+51 987 123 463',
      address: 'Jr. Los Pinos 321, San Martín de Porres',
      occupation: 'Ama de casa',
    },
  ]

  const parents = []
  for (const parentData of parentsData) {
    // Crear usuario para padre
    const parentUser = await prisma.user.create({
      data: {
        email: parentData.email,
        name: parentData.name,
        password: hashedPasswordParent,
        role: 'PARENT',
      }
    })

    // Crear configuración de usuario
    await prisma.userSettings.create({
      data: {
        userId: parentUser.id,
        theme: 'light',
        language: 'es',
        emailNotifications: true,
      }
    })

    // Crear perfil de padre
    const parent = await prisma.parentProfile.create({
      data: {
        userId: parentUser.id,
        firstName: parentData.firstName,
        lastName: parentData.lastName,
        phone: parentData.phone,
        address: parentData.address,
        occupation: parentData.occupation,
      }
    })

    parents.push(parent)
  }

  console.log('👧👦 Creando estudiantes...')
  
  // 9. ESTUDIANTES
  const studentsData = [
    {
      firstName: 'Pedro',
      lastName: 'Pérez López',
      studentId: 'EST2025001',
      dateOfBirth: new Date('2013-05-15'),
      gradeLevel: 6, // 6° primaria
      sectionName: 'A',
      parentIndex: 0,
    },
    {
      firstName: 'Ana',
      lastName: 'Pérez López',
      studentId: 'EST2025002',
      dateOfBirth: new Date('2015-03-20'),
      gradeLevel: 4, // 4° primaria
      sectionName: 'B',
      parentIndex: 1,
    },
    {
      firstName: 'Carlos',
      lastName: 'Mendoza Ríos',
      studentId: 'EST2025003',
      dateOfBirth: new Date('2010-08-10'),
      gradeLevel: 9, // 3° secundaria
      sectionName: 'A',
      parentIndex: 2,
    },
    {
      firstName: 'Lucía',
      lastName: 'Mendoza Ríos',
      studentId: 'EST2025004',
      dateOfBirth: new Date('2012-12-05'),
      gradeLevel: 7, // 1° secundaria
      sectionName: 'B',
      parentIndex: 3,
    },
    {
      firstName: 'Miguel',
      lastName: 'Silva Morales',
      studentId: 'EST2025005',
      dateOfBirth: new Date('2014-01-18'),
      gradeLevel: 5, // 5° primaria
      sectionName: 'A',
      parentIndex: 4,
    },
    {
      firstName: 'Sofía',
      lastName: 'Torres Castillo',
      studentId: 'EST2025006',
      dateOfBirth: new Date('2009-07-25'),
      gradeLevel: 10, // 4° secundaria
      sectionName: 'A',
      parentIndex: 6,
    },
    {
      firstName: 'Diego',
      lastName: 'Torres Castillo',
      studentId: 'EST2025007',
      dateOfBirth: new Date('2016-11-12'),
      gradeLevel: 3, // 3° primaria
      sectionName: 'B',
      parentIndex: 7,
    },
    {
      firstName: 'Valentina',
      lastName: 'García Flores',
      studentId: 'EST2025008',
      dateOfBirth: new Date('2011-04-30'),
      gradeLevel: 8, // 2° secundaria
      sectionName: 'A',
      parentIndex: 0,
    },
    {
      firstName: 'Sebastián',
      lastName: 'Vargas Díaz',
      studentId: 'EST2025009',
      dateOfBirth: new Date('2017-09-18'),
      gradeLevel: 2, // 2° primaria
      sectionName: 'C',
      parentIndex: 1,
    },
    {
      firstName: 'Isabella',
      lastName: 'Ramírez Castro',
      studentId: 'EST2025010',
      dateOfBirth: new Date('2018-02-14'),
      gradeLevel: 1, // 1° primaria
      sectionName: 'A',
      parentIndex: 2,
    },
  ]

  const students = []
  for (const studentData of studentsData) {
    // Buscar el grado y sección correspondientes
    const academicGrade = academicGrades.find(g => g.level === studentData.gradeLevel)
    const section = sections.find(s => s.name === studentData.sectionName)
    
    if (!academicGrade || !section) {
      console.log(`⚠️ No se encontró grado ${studentData.gradeLevel} o sección ${studentData.sectionName}`)
      continue
    }

    // Crear usuario para estudiante
    const studentUser = await prisma.user.create({
      data: {
        email: `${studentData.firstName.toLowerCase()}.${studentData.lastName.split(' ')[0].toLowerCase()}@estudiante.ie3024.edu.pe`,
        name: `${studentData.firstName} ${studentData.lastName}`,
        password: hashedPasswordStudent,
        role: 'STUDENT',
      }
    })

    // Crear configuración de usuario
    await prisma.userSettings.create({
      data: {
        userId: studentUser.id,
        theme: 'light',
        language: 'es',
        emailNotifications: false, // Los estudiantes no reciben emails por defecto
      }
    })

    // Crear perfil de estudiante
    await prisma.studentProfile.create({
      data: {
        userId: studentUser.id,
        studentId: studentData.studentId,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        dateOfBirth: studentData.dateOfBirth,
        grade: academicGrade.name,
        section: section.name,
        gradeId: academicGrade.id,
        sectionId: section.id,
      }
    })

    // Crear estudiante
    const student = await prisma.student.create({
      data: {
        studentId: studentData.studentId,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        dateOfBirth: studentData.dateOfBirth,
        grade: academicGrade.name,
        section: section.name,
        gradeId: academicGrade.id,
        sectionId: section.id,
        parentId: parents[studentData.parentIndex].id,
      }
    })

    students.push(student)
  }

  console.log('🏫 Creando clases...')
  
  // 10. CLASES (Combinación de materia, grado, sección y profesor)
  const classes = []
  
  // Crear clases para primaria (grados 1-6)
  const primaryGradesData = academicGrades.filter(g => g.level <= 6)
  const primarySubjects = subjects.filter(s => s.code.includes('-P'))
  
  for (const grade of primaryGradesData) {
    for (const section of sections) {
      for (const subject of primarySubjects) {
        const teacher = teachers.find(t => t.subjectNames.includes(subject.name))
        if (teacher) {
          const classData = await prisma.class.create({
            data: {
              name: `${subject.name} - ${grade.name}${section.name}`,
              grade: grade.name,
              section: section.name,
              gradeId: grade.id,
              sectionId: section.id,
              academicYear: '2025',
              teacherId: teacher.id,
              subjectId: subject.id,
              maxStudents: 25,
            }
          })
          classes.push(classData)
        }
      }
    }
  }

  // Crear clases para secundaria (grados 7-11)
  const secondaryGradesData = academicGrades.filter(g => g.level > 6)
  const secondarySubjects = subjects.filter(s => s.code.includes('-S'))
  
  for (const grade of secondaryGradesData) {
    for (const section of sections) {
      for (const subject of secondarySubjects) {
        const teacher = teachers.find(t => t.subjectNames.includes(subject.name))
        if (teacher) {
          const classData = await prisma.class.create({
            data: {
              name: `${subject.name} - ${grade.name}${section.name}`,
              grade: grade.name,
              section: section.name,
              gradeId: grade.id,
              sectionId: section.id,
              academicYear: '2025',
              teacherId: teacher.id,
              subjectId: subject.id,
              maxStudents: 30,
            }
          })
          classes.push(classData)
        }
      }
    }
  }

  console.log('👥 Inscribiendo estudiantes en clases...')
  
  // 11. INSCRIBIR ESTUDIANTES EN CLASES
  for (const student of students) {
    // Buscar todas las clases del grado y sección del estudiante
    const studentClasses = classes.filter(c => 
      c.gradeId === student.gradeId && 
      c.sectionId === student.sectionId
    )

    for (const classData of studentClasses) {
      await prisma.classStudent.create({
        data: {
          classId: classData.id,
          studentId: student.id,
        }
      })
    }
  }

  console.log('📊 Creando calificaciones...')
  
  // 12. CALIFICACIONES
  const gradeTypes: ('EXAM' | 'QUIZ' | 'HOMEWORK' | 'PARTICIPATION' | 'PROJECT')[] = ['EXAM', 'QUIZ', 'HOMEWORK', 'PARTICIPATION', 'PROJECT']
  
  for (const classData of classes.slice(0, 20)) { // Limitamos para no sobrecargar
    const classStudents = await prisma.classStudent.findMany({
      where: { classId: classData.id },
      include: { student: true }
    })

    for (const classStudent of classStudents) {
      // Crear 3-5 calificaciones por estudiante por materia
      const numGrades = Math.floor(Math.random() * 3) + 3
      
      for (let i = 0; i < numGrades; i++) {
        const gradeType = gradeTypes[Math.floor(Math.random() * gradeTypes.length)]
        const score = Math.floor(Math.random() * 21) // Notas entre 0-20 (sistema peruano)
        const maxScore = 20
        const percentage = (score / maxScore) * 100

        await prisma.grade.create({
          data: {
            studentId: classStudent.studentId,
            subjectId: classData.subjectId,
            teacherId: classData.teacherId,
            classId: classData.id,
            gradeType: gradeType,
            score: score,
            maxScore: maxScore,
            percentage: percentage,
            letterGrade: score >= 18 ? 'AD' : score >= 14 ? 'A' : score >= 11 ? 'B' : 'C',
            comments: score >= 18 ? 'Logro destacado' : score >= 14 ? 'Logro esperado' : score >= 11 ? 'En proceso' : 'En inicio',
            gradeDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          }
        })
      }
    }
  }

  console.log('📅 Creando registros de asistencia...')
  
  // 13. ASISTENCIA
  const today = new Date()
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    return date
  }).filter(date => date.getDay() !== 0 && date.getDay() !== 6) // Solo días laborables

  for (const classData of classes.slice(0, 15)) { // Limitamos para no sobrecargar
    const classStudents = await prisma.classStudent.findMany({
      where: { classId: classData.id }
    })

    for (const date of last30Days.slice(0, 15)) { // Últimos 15 días laborables
      for (const classStudent of classStudents) {
        const attendanceChance = Math.random()
        let status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
        
        if (attendanceChance > 0.95) status = 'ABSENT'
        else if (attendanceChance > 0.90) status = 'LATE'
        else if (attendanceChance > 0.85) status = 'EXCUSED'
        else status = 'PRESENT'

        await prisma.attendance.create({
          data: {
            studentId: classStudent.studentId,
            classId: classData.id,
            teacherId: classData.teacherId,
            date: date,
            status: status,
            notes: status !== 'PRESENT' ? 'Observación registrada automáticamente' : null,
          }
        })
      }
    }
  }

  console.log('💬 Creando mensajes...')
  
  // 14. MENSAJES
  const messageSubjects = [
    'Seguimiento académico',
    'Reunión de padres',
    'Comportamiento en clase',
    'Progreso del estudiante',
    'Tareas pendientes',
    'Felicitaciones por logros',
    'Sugerencias para mejora',
  ]

  const messageContents = [
    'Estimado padre de familia, me dirijo a usted para informarle sobre el progreso académico de su hijo/a.',
    'Le solicito su presencia en el colegio para conversar sobre el rendimiento de su menor hijo/a.',
    'Me complace informarle que su hijo/a ha mostrado una mejora significativa en su comportamiento.',
    'Su hijo/a ha demostrado excelente participación en las actividades de clase.',
    'Le recordamos que su hijo/a tiene algunas tareas pendientes que debe completar.',
    'Felicito a su hijo/a por su destacado desempeño en el último examen.',
    'Le sugiero reforzar en casa los temas que estamos viendo en matemáticas.',
  ]

  for (let i = 0; i < 25; i++) {
    const teacher = teachers[Math.floor(Math.random() * teachers.length)]
    const parent = parents[Math.floor(Math.random() * parents.length)]
    const subject = messageSubjects[Math.floor(Math.random() * messageSubjects.length)]
    const content = messageContents[Math.floor(Math.random() * messageContents.length)]
    
    await prisma.message.create({
      data: {
        senderId: teacher.userId,
        receiverId: parent.userId,
        subject: subject,
        content: content,
        type: 'GENERAL',
        isRead: Math.random() > 0.3,
        createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
      }
    })
  }

  console.log('🔔 Creando notificaciones...')
  
  // 15. NOTIFICACIONES
  const notificationMessages = [
    {
      title: 'Reunión de padres',
      message: 'Se convoca a reunión de padres de familia el día viernes 18 de octubre a las 7:00 PM.',
      type: 'MEETING_SCHEDULED' as const,
    },
    {
      title: 'Entrega de libretas',
      message: 'La entrega de libretas de notas se realizará el sábado 26 de octubre de 8:00 AM a 12:00 PM.',
      type: 'ANNOUNCEMENT' as const,
    },
    {
      title: 'Pago de pensión',
      message: 'Recordamos que el pago de la pensión escolar vence el 30 de octubre.',
      type: 'PAYMENT_DUE' as const,
    },
    {
      title: 'Simulacro de sismo',
      message: 'Mañana se realizará un simulacro de sismo a las 10:00 AM. Por favor, hablar con sus hijos sobre las medidas de seguridad.',
      type: 'ANNOUNCEMENT' as const,
    },
    {
      title: 'Campaña de vacunación',
      message: 'La próxima semana se realizará una campaña de vacunación en el colegio.',
      type: 'ANNOUNCEMENT' as const,
    },
  ]

  for (const notificationData of notificationMessages) {
    for (const parent of parents.slice(0, 5)) { // Solo algunos padres
      await prisma.notification.create({
        data: {
          userId: parent.userId,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          isRead: Math.random() > 0.4,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        }
      })
    }
  }

  console.log('📝 Creando observaciones...')
  
  // 16. OBSERVACIONES
  const observationTitles = [
    'Excelente participación',
    'Mejora en comportamiento',
    'Liderazgo destacado',
    'Necesita refuerzo',
    'Trabajo colaborativo',
    'Puntualidad mejorada',
    'Creatividad excepcional',
  ]

  const observationDescriptions = [
    'El estudiante demostró excelente participación durante la clase de hoy.',
    'Se observa una mejora significativa en el comportamiento del estudiante.',
    'El estudiante mostró habilidades de liderazgo durante el trabajo en grupo.',
    'El estudiante necesita refuerzo adicional en esta área.',
    'Excelente trabajo colaborativo con sus compañeros.',
    'Se ha observado una mejora en la puntualidad del estudiante.',
    'El estudiante demostró gran creatividad en su proyecto.',
  ]

  const categories = ['Académico', 'Comportamiento', 'Social', 'Participación', 'Disciplina']

  for (const student of students.slice(0, 8)) {
    // 2-4 observaciones por estudiante
    const numObservations = Math.floor(Math.random() * 3) + 2
    
    for (let i = 0; i < numObservations; i++) {
      const teacher = teachers[Math.floor(Math.random() * teachers.length)]
      const titleIndex = Math.floor(Math.random() * observationTitles.length)
      const isPositive = Math.random() > 0.2 // 80% observaciones positivas
      
      await prisma.observation.create({
        data: {
          studentId: student.id,
          teacherId: teacher.id,
          title: observationTitles[titleIndex],
          description: observationDescriptions[titleIndex],
          category: categories[Math.floor(Math.random() * categories.length)],
          isPositive: isPositive,
          date: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000),
        }
      })
    }
  }

  console.log('✅ Seed completado exitosamente!')
  
  // Obtener estadísticas finales
  const stats = {
    users: await prisma.user.count(),
    teachers: await prisma.teacherProfile.count(),
    parents: await prisma.parentProfile.count(),
    students: await prisma.student.count(),
    subjects: await prisma.subject.count(),
    classes: await prisma.class.count(),
    grades: await prisma.grade.count(),
    attendances: await prisma.attendance.count(),
    messages: await prisma.message.count(),
    notifications: await prisma.notification.count(),
    observations: await prisma.observation.count(),
  }

  console.log(`
📊 RESUMEN DE DATOS CREADOS:
- 👥 Usuarios: ${stats.users}
- 👨‍🏫 Profesores: ${stats.teachers}
- 👨‍👩‍👧‍👦 Padres: ${stats.parents}
- 👧👦 Estudiantes: ${stats.students}
- 📚 Materias: ${stats.subjects}
- 🏫 Clases: ${stats.classes}
- 📊 Calificaciones: ${stats.grades}
- 📅 Asistencias: ${stats.attendances}
- 💬 Mensajes: ${stats.messages}
- 🔔 Notificaciones: ${stats.notifications}
- 📝 Observaciones: ${stats.observations}

🔑 CREDENCIALES DE ACCESO:
📧 Admin: admin@ie3024.edu.pe / admin123
👨‍🏫 Profesor: maria.garcia@ie3024.edu.pe / teacher123
👨‍👩‍👧‍👦 Padre: juan.perez@gmail.com / parent123
👧👦 Estudiante: pedro.perez@estudiante.ie3024.edu.pe / student123

🏫 I.E. 3024 José Antonio Encinas - Sistema completamente funcional
  `)
}

main()
  .catch(async (e) => {
    console.error('❌ Error durante el seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
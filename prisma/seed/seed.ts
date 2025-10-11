import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {

  console.log('🌱 Iniciando seed básico...');const prisma = new PrismaClient();

  

  // Limpiar datos existentes

  await prisma.classStudent.deleteMany();

  await prisma.gradeRecord.deleteMany();async function main() {

  await prisma.attendance.deleteMany();

  await prisma.observation.deleteMany();  console.log('🌱 Iniciando seed de la base de datos - Sistema Educativo Peruano...');const prisma = new PrismaClient()const prisma = new PrismaClient()

  await prisma.message.deleteMany();

  await prisma.notification.deleteMany();

  await prisma.student.deleteMany();

  await prisma.class.deleteMany();  // Hash para contraseñas

  await prisma.subject.deleteMany();

  await prisma.grade.deleteMany();  const hashedPassword123 = await bcrypt.hash('123456', 10);

  await prisma.teacherProfile.deleteMany();

  await prisma.parentProfile.deleteMany();  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);async function main() {async function main() {

  await prisma.user.deleteMany();

  const hashedPasswordTeacher = await bcrypt.hash('teacher123', 10);

  console.log('✅ Datos limpios, creando nuevos...');

  const hashedPasswordParent = await bcrypt.hash('parent123', 10);  console.log('🌱 Iniciando seed de la base de datos - Sistema Educativo Peruano...')  console.log('🌱 Iniciando seed de la base de datos - Sistema Educativo Peruano...')

  // Hash para contraseñas

  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);  const hashedPasswordStudent = await bcrypt.hash('student123', 10);

  const hashedPasswordTeacher = await bcrypt.hash('teacher123', 10);

  const hashedPasswordParent = await bcrypt.hash('parent123', 10);

  const hashedPasswordStudent = await bcrypt.hash('student123', 10);

  // 1. Crear usuarios administradores

  // Crear admin

  const admin = await prisma.user.create({  console.log('👤 Creando administradores...');  // Hash para contraseñas  // Hash para contraseñas

    data: {

      email: 'admin@school.com',  const admin = await prisma.user.upsert({

      name: 'Director Carmen Rodríguez',

      password: hashedPasswordAdmin,    where: { email: 'admin@school.com' },  const hashedPassword123 = await bcrypt.hash('123456', 10)  const hashedPassword123 = await bcrypt.hash('123456', 10)

      role: 'ADMIN',

    },    update: {},

  });

    create: {  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10)  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10)

  console.log('✅ Seed básico completado!');

}      email: 'admin@school.com',



main()      name: 'Director(a) Carmen Rodríguez',  const hashedPasswordTeacher = await bcrypt.hash('teacher123', 10)  const hashedPasswordTeacher = await bcrypt.hash('teacher123', 10)

  .then(async () => {

    await prisma.$disconnect();      password: hashedPasswordAdmin,

  })

  .catch(async (e) => {      role: 'ADMIN',  const hashedPasswordParent = await bcrypt.hash('parent123', 10)  const hashedPasswordParent = await bcrypt.hash('parent123', 10)

    console.error(e);

    await prisma.$disconnect();    },

    process.exit(1);

  });  });  const hashedPasswordStudent = await bcrypt.hash('student123', 10)  const hashedPasswordStudent = await bcrypt.hash('student123', 10)



  // 2. Crear profesores con datos peruanos

  console.log('👨‍🏫 Creando profesores...');

  const teachersData = [  // 1. Crear usuarios administradores  // 1. Crear usuarios administradores

    {

      email: 'maria.garcia@school.edu.pe',  console.log('👤 Creando administradores...')  console.log('👤 Creando administradores...')

      name: 'Prof. María García Flores',

      employeeId: 'DOC001',  const admin = await prisma.user.upsert({  const admin = await prisma.user.upsert({

      firstName: 'María Elena',

      lastName: 'García Flores',    where: { email: 'admin@school.com' },    where: { email: 'admin@school.com' },

      phone: '+51 987 654 321',

      dateOfBirth: new Date('1985-03-15'),    update: {},    update: {},

      hireDate: new Date('2015-03-01'),

      salary: 3500.00, // Soles peruanos    create: {    create: {

      specialization: 'Matemáticas y Ciencias'

    },      email: 'admin@school.com',      email: 'admin@school.com',

    {

      email: 'carlos.mendoza@school.edu.pe',      name: 'Director(a) Carmen Rodríguez',      name: 'Director(a) Carmen Rodríguez',

      name: 'Prof. Carlos Mendoza Silva',

      employeeId: 'DOC002',      password: hashedPasswordAdmin,      password: hashedPasswordAdmin,

      firstName: 'Carlos Alberto',

      lastName: 'Mendoza Silva',      role: 'ADMIN',      role: 'ADMIN',

      phone: '+51 987 654 322',

      dateOfBirth: new Date('1980-07-22'),    },    },

      hireDate: new Date('2012-03-01'),

      salary: 3800.00,  })  })

      specialization: 'Comunicación y Literatura'

    },

    {

      email: 'ana.lopez@school.edu.pe',  // 2. Crear profesores con datos peruanos  // 2. Crear profesores con datos peruanos

      name: 'Prof. Ana López Vargas',

      employeeId: 'DOC003',  console.log('👨‍🏫 Creando profesores...')  console.log('👨‍🏫 Creando profesores...')

      firstName: 'Ana María',

      lastName: 'López Vargas',  const teachersData = [  const teachersData = [

      phone: '+51 987 654 323',

      dateOfBirth: new Date('1988-11-10'),    {    {

      hireDate: new Date('2018-03-01'),

      salary: 3200.00,      email: 'maria.garcia@school.edu.pe',      email: 'maria.garcia@school.edu.pe',

      specialization: 'Ciencias Sociales'

    },      name: 'Prof. María García Flores',      name: 'Prof. María García Flores',

    {

      email: 'pedro.torres@school.edu.pe',      employeeId: 'DOC001',      employeeId: 'DOC001',

      name: 'Prof. Pedro Torres Quispe',

      employeeId: 'DOC004',      firstName: 'María Elena',      firstName: 'María Elena',

      firstName: 'Pedro Luis',

      lastName: 'Torres Quispe',      lastName: 'García Flores',      lastName: 'García Flores',

      phone: '+51 987 654 324',

      dateOfBirth: new Date('1982-05-08'),      phone: '+51 987 654 321',      phone: '+51 987 654 321',

      hireDate: new Date('2014-03-01'),

      salary: 3600.00,      dateOfBirth: new Date('1985-03-15'),      dateOfBirth: new Date('1985-03-15'),

      specialization: 'Educación Física'

    },      hireDate: new Date('2015-03-01'),      hireDate: new Date('2015-03-01'),

    {

      email: 'lucia.santos@school.edu.pe',      salary: 3500.00, // Soles peruanos      salary: 3500.00, // Soles peruanos

      name: 'Prof. Lucía Santos Huamán',

      employeeId: 'DOC005',      specialization: 'Matemáticas y Ciencias'      specialization: 'Matemáticas y Ciencias'

      firstName: 'Lucía del Carmen',

      lastName: 'Santos Huamán',    },    },

      phone: '+51 987 654 325',

      dateOfBirth: new Date('1990-01-20'),    {    {

      hireDate: new Date('2020-03-01'),

      salary: 3000.00,      email: 'carlos.mendoza@school.edu.pe',      email: 'carlos.mendoza@school.edu.pe',

      specialization: 'Arte y Cultura'

    },      name: 'Prof. Carlos Mendoza Silva',      name: 'Prof. Carlos Mendoza Silva',

    {

      email: 'jose.ramirez@school.edu.pe',      employeeId: 'DOC002',      employeeId: 'DOC002',

      name: 'Prof. José Ramírez Chávez',

      employeeId: 'DOC006',      firstName: 'Carlos Alberto',      firstName: 'Carlos Alberto',

      firstName: 'José Antonio',

      lastName: 'Ramírez Chávez',      lastName: 'Mendoza Silva',      lastName: 'Mendoza Silva',

      phone: '+51 987 654 326',

      dateOfBirth: new Date('1979-09-14'),      phone: '+51 987 654 322',      phone: '+51 987 654 322',

      hireDate: new Date('2010-03-01'),

      salary: 4000.00,      dateOfBirth: new Date('1980-07-22'),      dateOfBirth: new Date('1980-07-22'),

      specialization: 'Inglés'

    }      hireDate: new Date('2012-03-01'),      hireDate: new Date('2012-03-01'),

  ];

      salary: 3800.00,      salary: 3800.00,

  const teachers = [];

  for (const teacherData of teachersData) {      specialization: 'Comunicación y Literatura'      specialization: 'Comunicación y Literatura'

    const teacherUser = await prisma.user.upsert({

      where: { email: teacherData.email },    },    },

      update: {},

      create: {    {    {

        email: teacherData.email,

        name: teacherData.name,      email: 'ana.lopez@school.edu.pe',      email: 'ana.lopez@school.edu.pe',

        password: hashedPasswordTeacher,

        role: 'TEACHER',      name: 'Prof. Ana López Vargas',      name: 'Prof. Ana López Vargas',

      },

    });      employeeId: 'DOC003',      employeeId: 'DOC003',



    const teacher = await prisma.teacherProfile.upsert({      firstName: 'Ana María',      firstName: 'Ana María',

      where: { userId: teacherUser.id },

      update: {},      lastName: 'López Vargas',      lastName: 'López Vargas',

      create: {

        userId: teacherUser.id,      phone: '+51 987 654 323',      phone: '+51 987 654 323',

        employeeId: teacherData.employeeId,

        firstName: teacherData.firstName,      dateOfBirth: new Date('1988-11-10'),      dateOfBirth: new Date('1988-11-10'),

        lastName: teacherData.lastName,

        phone: teacherData.phone,      hireDate: new Date('2018-03-01'),      hireDate: new Date('2018-03-01'),

        dateOfBirth: teacherData.dateOfBirth,

        hireDate: teacherData.hireDate,      salary: 3200.00,      salary: 3200.00,

        salary: teacherData.salary,

        address: 'Lima, Perú',      specialization: 'Ciencias Sociales'      specialization: 'Ciencias Sociales'

        isActive: true,

      },    },    },

    });

    teachers.push(teacher);    {    {

  }

      email: 'pedro.torres@school.edu.pe',      email: 'pedro.torres@school.edu.pe',

  // 3. Crear materias del sistema educativo peruano

  console.log('📚 Creando materias...');      name: 'Prof. Pedro Torres Quispe',      name: 'Prof. Pedro Torres Quispe',

  const subjectsData = [

    { name: 'Matemáticas', code: 'MAT', description: 'Números, álgebra, geometría y estadística', credits: 6 },      employeeId: 'DOC004',      employeeId: 'DOC004',

    { name: 'Comunicación', code: 'COM', description: 'Comprensión lectora, expresión oral y escrita', credits: 6 },

    { name: 'Ciencia y Tecnología', code: 'CTA', description: 'Ciencias naturales, física, química y biología', credits: 5 },      firstName: 'Pedro Luis',      firstName: 'Pedro Luis',

    { name: 'Personal Social', code: 'PSO', description: 'Historia, geografía y formación ciudadana', credits: 4 },

    { name: 'Educación Física', code: 'EFI', description: 'Desarrollo físico y deportivo', credits: 2 },      lastName: 'Torres Quispe',      lastName: 'Torres Quispe',

    { name: 'Arte y Cultura', code: 'ART', description: 'Expresión artística y cultural', credits: 2 },

    { name: 'Inglés', code: 'ING', description: 'Idioma extranjero - Inglés', credits: 3 },      phone: '+51 987 654 324',      phone: '+51 987 654 324',

    { name: 'Educación Religiosa', code: 'REL', description: 'Formación espiritual y valores', credits: 2 },

    { name: 'Tutoría', code: 'TUT', description: 'Orientación y tutoría', credits: 1 },      dateOfBirth: new Date('1982-05-08'),      dateOfBirth: new Date('1982-05-08'),

    { name: 'Educación para el Trabajo', code: 'EPT', description: 'Formación técnica y emprendimiento', credits: 3 }

  ];      hireDate: new Date('2014-03-01'),      hireDate: new Date('2014-03-01'),



  const subjects = [];      salary: 3600.00,      salary: 3600.00,

  for (let i = 0; i < subjectsData.length; i++) {

    const subjectData = subjectsData[i];      specialization: 'Educación Física'      specialization: 'Educación Física'

    const teacher = teachers[i % teachers.length]; // Asignar profesores rotativamente

        },    },

    const subject = await prisma.subject.upsert({

      where: { code: subjectData.code },    {    {

      update: {},

      create: {      email: 'lucia.santos@school.edu.pe',      email: 'lucia.santos@school.edu.pe',

        name: subjectData.name,

        code: subjectData.code,      name: 'Prof. Lucía Santos Huamán',      name: 'Prof. Lucía Santos Huamán',

        description: subjectData.description,

        credits: subjectData.credits,      employeeId: 'DOC005',      employeeId: 'DOC005',

        teacherId: teacher.id,

        isActive: true,      firstName: 'Lucía del Carmen',      firstName: 'Lucía del Carmen',

      },

    });      lastName: 'Santos Huamán',      lastName: 'Santos Huamán',

    subjects.push(subject);

  }      phone: '+51 987 654 325',      phone: '+51 987 654 325',



  // 4. Crear grados del sistema peruano      dateOfBirth: new Date('1990-01-20'),      dateOfBirth: new Date('1990-01-20'),

  console.log('🎓 Creando grados...');

  const gradesData = [      hireDate: new Date('2020-03-01'),      hireDate: new Date('2020-03-01'),

    { name: '1er Grado', level: 'PRIMARIA', order: 1 },

    { name: '2do Grado', level: 'PRIMARIA', order: 2 },      salary: 3000.00,      salary: 3000.00,

    { name: '3er Grado', level: 'PRIMARIA', order: 3 },

    { name: '4to Grado', level: 'PRIMARIA', order: 4 },      specialization: 'Arte y Cultura'      specialization: 'Arte y Cultura'

    { name: '5to Grado', level: 'PRIMARIA', order: 5 },

    { name: '6to Grado', level: 'PRIMARIA', order: 6 },    },    },

    { name: '1ro Secundaria', level: 'SECUNDARIA', order: 7 },

    { name: '2do Secundaria', level: 'SECUNDARIA', order: 8 },    {    {

    { name: '3ro Secundaria', level: 'SECUNDARIA', order: 9 },

    { name: '4to Secundaria', level: 'SECUNDARIA', order: 10 },      email: 'jose.ramirez@school.edu.pe',      email: 'jose.ramirez@school.edu.pe',

    { name: '5to Secundaria', level: 'SECUNDARIA', order: 11 }

  ];      name: 'Prof. José Ramírez Chávez',      name: 'Prof. José Ramírez Chávez',



  const grades = [];      employeeId: 'DOC006',      employeeId: 'DOC006',

  for (const gradeData of gradesData) {

    const grade = await prisma.grade.upsert({      firstName: 'José Antonio',      firstName: 'José Antonio',

      where: { name: gradeData.name },

      update: {},      lastName: 'Ramírez Chávez',      lastName: 'Ramírez Chávez',

      create: {

        name: gradeData.name,      phone: '+51 987 654 326',      phone: '+51 987 654 326',

        level: gradeData.level,

        order: gradeData.order,      dateOfBirth: new Date('1979-09-14'),      dateOfBirth: new Date('1979-09-14'),

        isActive: true,

      },      hireDate: new Date('2010-03-01'),      hireDate: new Date('2010-03-01'),

    });

    grades.push(grade);      salary: 4000.00,      salary: 4000.00,

  }

      specialization: 'Inglés'      specialization: 'Inglés'

  // 5. Crear clases con secciones

  console.log('🏫 Creando clases...');    }    }

  const classesData = [];

  const sections = ['A', 'B', 'C'];  ]  ]

  

  for (const grade of grades) {

    for (const section of sections) {

      classesData.push({  const teachers = []  const teachers = []

        name: `${grade.name} - Sección ${section}`,

        gradeId: grade.id,  for (const teacherData of teachersData) {  for (const teacherData of teachersData) {

        section: section,

        academicYear: '2024',    const teacherUser = await prisma.user.upsert({    const teacherUser = await prisma.user.upsert({

        maxStudents: 30,

        teacherId: teachers[Math.floor(Math.random() * teachers.length)].id      where: { email: teacherData.email },      where: { email: teacherData.email },

      });

    }      update: {},      update: {},

  }

      create: {      create: {

  const classes = [];

  for (const classData of classesData) {        email: teacherData.email,        email: teacherData.email,

    const classItem = await prisma.class.upsert({

      where: {         name: teacherData.name,        name: teacherData.name,

        name: classData.name,

      },        password: hashedPasswordTeacher,        password: hashedPasswordTeacher,

      update: {},

      create: {        role: 'TEACHER',        role: 'TEACHER',

        name: classData.name,

        gradeId: classData.gradeId,      },      },

        section: classData.section,

        academicYear: classData.academicYear,    })    })

        maxStudents: classData.maxStudents,

        teacherId: classData.teacherId,

        isActive: true,

      },    const teacher = await prisma.teacherProfile.upsert({    const teacher = await prisma.teacherProfile.upsert({

    });

    classes.push(classItem);      where: { userId: teacherUser.id },      where: { userId: teacherUser.id },

  }

      update: {},      update: {},

  // 6. Crear padres de familia

  console.log('👨‍👩‍👧‍👦 Creando padres de familia...');      create: {      create: {

  const parentsData = [

    {        userId: teacherUser.id,        userId: teacherUser.id,

      email: 'carlos.rodriguez@email.com',

      name: 'Carlos Rodríguez Pérez',        employeeId: teacherData.employeeId,        employeeId: teacherData.employeeId,

      firstName: 'Carlos Alberto',

      lastName: 'Rodríguez Pérez',        firstName: teacherData.firstName,        firstName: teacherData.firstName,

      phone: '+51 999 111 222',

      occupation: 'Ingeniero Civil',        lastName: teacherData.lastName,        lastName: teacherData.lastName,

      address: 'Av. Javier Prado 1254, San Isidro, Lima'

    },        phone: teacherData.phone,        phone: teacherData.phone,

    {

      email: 'maria.fernandez@email.com',        dateOfBirth: teacherData.dateOfBirth,        dateOfBirth: teacherData.dateOfBirth,

      name: 'María Fernández López',

      firstName: 'María Elena',        hireDate: teacherData.hireDate,        hireDate: teacherData.hireDate,

      lastName: 'Fernández López',

      phone: '+51 999 111 223',        salary: teacherData.salary,        salary: teacherData.salary,

      occupation: 'Doctora',

      address: 'Calle Las Flores 456, Miraflores, Lima'        address: 'Lima, Perú',        address: 'Lima, Perú',

    },

    {        isActive: true,        isActive: true,

      email: 'jose.martinez@email.com',

      name: 'José Martínez Silva',      },      },

      firstName: 'José Luis',

      lastName: 'Martínez Silva',    })    })

      phone: '+51 999 111 224',

      occupation: 'Contador',    teachers.push(teacher)    teachers.push(teacher)

      address: 'Jr. Huancavelica 789, Cercado de Lima'

    },  }  }

    {

      email: 'ana.gonzalez@email.com',

      name: 'Ana González Vargas',

      firstName: 'Ana María',  // 3. Crear materias del sistema educativo peruano  // 3. Crear materias del sistema educativo peruano

      lastName: 'González Vargas',

      phone: '+51 999 111 225',  console.log('📚 Creando materias...')  console.log('📚 Creando materias...')

      occupation: 'Profesora',

      address: 'Av. Universitaria 321, Los Olivos, Lima'  const subjectsData = [  const subjectsData = [

    },

    {    { name: 'Matemáticas', code: 'MAT', description: 'Números, álgebra, geometría y estadística', credits: 6 },    { name: 'Matemáticas', code: 'MAT', description: 'Números, álgebra, geometría y estadística', credits: 6 },

      email: 'luis.torres@email.com',

      name: 'Luis Torres Quispe',    { name: 'Comunicación', code: 'COM', description: 'Comprensión lectora, expresión oral y escrita', credits: 6 },    { name: 'Comunicación', code: 'COM', description: 'Comprensión lectora, expresión oral y escrita', credits: 6 },

      firstName: 'Luis Fernando',

      lastName: 'Torres Quispe',    { name: 'Ciencia y Tecnología', code: 'CTA', description: 'Ciencias naturales, física, química y biología', credits: 5 },    { name: 'Ciencia y Tecnología', code: 'CTA', description: 'Ciencias naturales, física, química y biología', credits: 5 },

      phone: '+51 999 111 226',

      occupation: 'Comerciante',    { name: 'Personal Social', code: 'PSO', description: 'Historia, geografía y formación ciudadana', credits: 4 },    { name: 'Personal Social', code: 'PSO', description: 'Historia, geografía y formación ciudadana', credits: 4 },

      address: 'Calle Real 654, San Juan de Lurigancho, Lima'

    }    { name: 'Educación Física', code: 'EFI', description: 'Desarrollo físico y deportivo', credits: 2 },    { name: 'Educación Física', code: 'EFI', description: 'Desarrollo físico y deportivo', credits: 2 },

  ];

    { name: 'Arte y Cultura', code: 'ART', description: 'Expresión artística y cultural', credits: 2 },    { name: 'Arte y Cultura', code: 'ART', description: 'Expresión artística y cultural', credits: 2 },

  const parents = [];

  for (const parentData of parentsData) {    { name: 'Inglés', code: 'ING', description: 'Idioma extranjero - Inglés', credits: 3 },    { name: 'Inglés', code: 'ING', description: 'Idioma extranjero - Inglés', credits: 3 },

    const parentUser = await prisma.user.upsert({

      where: { email: parentData.email },    { name: 'Educación Religiosa', code: 'REL', description: 'Formación espiritual y valores', credits: 2 },    { name: 'Educación Religiosa', code: 'REL', description: 'Formación espiritual y valores', credits: 2 },

      update: {},

      create: {    { name: 'Tutoría', code: 'TUT', description: 'Orientación y tutoría', credits: 1 },    { name: 'Tutoría', code: 'TUT', description: 'Orientación y tutoría', credits: 1 },

        email: parentData.email,

        name: parentData.name,    { name: 'Educación para el Trabajo', code: 'EPT', description: 'Formación técnica y emprendimiento', credits: 3 }    { name: 'Educación para el Trabajo', code: 'EPT', description: 'Formación técnica y emprendimiento', credits: 3 }

        password: hashedPasswordParent,

        role: 'PARENT',  ]  ]

      },

    });



    const parent = await prisma.parentProfile.upsert({  const subjects = []  const subjects = []

      where: { userId: parentUser.id },

      update: {},  for (let i = 0; i < subjectsData.length; i++) {  for (let i = 0; i < subjectsData.length; i++) {

      create: {

        userId: parentUser.id,    const subjectData = subjectsData[i]    const subjectData = subjectsData[i]

        firstName: parentData.firstName,

        lastName: parentData.lastName,    const teacher = teachers[i % teachers.length] // Asignar profesores rotativamente    const teacher = teachers[i % teachers.length] // Asignar profesores rotativamente

        phone: parentData.phone,

        occupation: parentData.occupation,        

        address: parentData.address,

      },    const subject = await prisma.subject.upsert({    const subject = await prisma.subject.upsert({

    });

    parents.push(parent);      where: { code: subjectData.code },      where: { code: subjectData.code },

  }

      update: {},      update: {},

  // 7. Crear estudiantes peruanos

  console.log('👨‍🎓 Creando estudiantes...');      create: {      create: {

  const studentsData = [

    // Estudiantes para diferentes grados        name: subjectData.name,        name: subjectData.name,

    { firstName: 'Diego Alejandro', lastName: 'Huamán Torres', dni: '12345678', grade: '3er Grado', section: 'A', parentIndex: 0 },

    { firstName: 'Sofía Valentina', lastName: 'Rodríguez Pérez', dni: '12345679', grade: '3er Grado', section: 'A', parentIndex: 0 },        code: subjectData.code,        code: subjectData.code,

    { firstName: 'Mateo Sebastián', lastName: 'Fernández López', dni: '12345680', grade: '4to Grado', section: 'B', parentIndex: 1 },

    { firstName: 'Isabella Camila', lastName: 'Martínez Silva', dni: '12345681', grade: '5to Grado', section: 'A', parentIndex: 2 },        description: subjectData.description,        description: subjectData.description,

    { firstName: 'Joaquín André', lastName: 'González Vargas', dni: '12345682', grade: '6to Grado', section: 'B', parentIndex: 3 },

    { firstName: 'Valeria Nicole', lastName: 'Torres Quispe', dni: '12345683', grade: '1ro Secundaria', section: 'A', parentIndex: 4 },        credits: subjectData.credits,        credits: subjectData.credits,

    { firstName: 'Nicolás Emilio', lastName: 'Chávez Morales', dni: '12345684', grade: '2do Secundaria', section: 'B', parentIndex: 0 },

    { firstName: 'Antonella Lucía', lastName: 'Vásquez Herrera', dni: '12345685', grade: '3ro Secundaria', section: 'A', parentIndex: 1 },        teacherId: teacher.id,        teacherId: teacher.id,

    { firstName: 'Sebastián Matías', lastName: 'Delgado Ramos', dni: '12345686', grade: '4to Secundaria', section: 'A', parentIndex: 2 },

    { firstName: 'Renata Alejandra', lastName: 'Sánchez Flores', dni: '12345687', grade: '5to Secundaria', section: 'B', parentIndex: 3 },        isActive: true,        isActive: true,

    // Más estudiantes para poblar las clases

    { firstName: 'Adrián Gabriel', lastName: 'Mendoza Castro', dni: '12345688', grade: '1er Grado', section: 'A', parentIndex: 4 },      },      },

    { firstName: 'Catalina Esperanza', lastName: 'Salinas Vega', dni: '12345689', grade: '2do Grado', section: 'B', parentIndex: 0 },

    { firstName: 'Emilio Rodrigo', lastName: 'Paredes Linares', dni: '12345690', grade: '3er Grado', section: 'B', parentIndex: 1 },    })    })

    { firstName: 'Francesca Daniela', lastName: 'Moreno Aguilar', dni: '12345691', grade: '4to Grado', section: 'A', parentIndex: 2 },

    { firstName: 'Gael Santiago', lastName: 'Jiménez Rojas', dni: '12345692', grade: '5to Grado', section: 'B', parentIndex: 3 }    subjects.push(subject)    subjects.push(subject)

  ];

  }  }

  const students = [];

  for (const studentData of studentsData) {

    // Encontrar la clase correspondiente

    const targetClass = classes.find(c =>   // 4. Crear grados del sistema peruano  // 4. Crear grados del sistema peruano

      c.name.includes(studentData.grade) && c.name.includes(studentData.section)

    );  console.log('🎓 Creando grados...')  console.log('🎓 Creando grados...')

    

    if (!targetClass) continue;  const gradesData = [  const gradesData = [



    const studentUser = await prisma.user.upsert({    { name: '1er Grado', level: 'PRIMARIA', order: 1 },    { name: '1er Grado', level: 'PRIMARIA', order: 1 },

      where: { email: `${studentData.firstName.toLowerCase()}.${studentData.lastName.toLowerCase().replace(' ', '')}@student.school.edu.pe` },

      update: {},    { name: '2do Grado', level: 'PRIMARIA', order: 2 },    { name: '2do Grado', level: 'PRIMARIA', order: 2 },

      create: {

        email: `${studentData.firstName.toLowerCase()}.${studentData.lastName.toLowerCase().replace(' ', '')}@student.school.edu.pe`,    { name: '3er Grado', level: 'PRIMARIA', order: 3 },    { name: '3er Grado', level: 'PRIMARIA', order: 3 },

        name: `${studentData.firstName} ${studentData.lastName}`,

        password: hashedPasswordStudent,    { name: '4to Grado', level: 'PRIMARIA', order: 4 },    { name: '4to Grado', level: 'PRIMARIA', order: 4 },

        role: 'STUDENT',

      },    { name: '5to Grado', level: 'PRIMARIA', order: 5 },    { name: '5to Grado', level: 'PRIMARIA', order: 5 },

    });

    { name: '6to Grado', level: 'PRIMARIA', order: 6 },    { name: '6to Grado', level: 'PRIMARIA', order: 6 },

    const student = await prisma.student.create({

      data: {    { name: '1ro Secundaria', level: 'SECUNDARIA', order: 7 },    { name: '1ro Secundaria', level: 'SECUNDARIA', order: 7 },

        userId: studentUser.id,

        studentId: `EST${String(students.length + 1).padStart(3, '0')}`,    { name: '2do Secundaria', level: 'SECUNDARIA', order: 8 },    { name: '2do Secundaria', level: 'SECUNDARIA', order: 8 },

        firstName: studentData.firstName,

        lastName: studentData.lastName,    { name: '3ro Secundaria', level: 'SECUNDARIA', order: 9 },    { name: '3ro Secundaria', level: 'SECUNDARIA', order: 9 },

        dateOfBirth: new Date(2010 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),

        gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',    { name: '4to Secundaria', level: 'SECUNDARIA', order: 10 },    { name: '4to Secundaria', level: 'SECUNDARIA', order: 10 },

        address: 'Lima, Perú',

        phone: `+51 999 ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 900) + 100)}`,    { name: '5to Secundaria', level: 'SECUNDARIA', order: 11 }    { name: '5to Secundaria', level: 'SECUNDARIA', order: 11 }

        parentId: parents[studentData.parentIndex].id,

        enrollmentDate: new Date('2024-03-01'),  ]  ]

        isActive: true,

      },

    });

  const grades = []  const grades = []

    // Matricular estudiante en clase

    await prisma.classStudent.create({  for (const gradeData of gradesData) {  for (const gradeData of gradesData) {

      data: {

        classId: targetClass.id,    const grade = await prisma.grade.upsert({    const grade = await prisma.grade.upsert({

        studentId: student.id,

        enrollmentDate: new Date('2024-03-01'),      where: { name: gradeData.name },      where: { name: gradeData.name },

        isActive: true,

      },      update: {},      update: {},

    });

      create: {      create: {

    students.push(student);

  }        name: gradeData.name,        name: gradeData.name,



  console.log('✅ Seed completado exitosamente!');        level: gradeData.level,        level: gradeData.level,

  console.log(`📊 Datos creados:`);

  console.log(`   - ${teachers.length} profesores`);        order: gradeData.order,        order: gradeData.order,

  console.log(`   - ${subjects.length} materias`);

  console.log(`   - ${grades.length} grados`);        isActive: true,        isActive: true,

  console.log(`   - ${classes.length} clases`);

  console.log(`   - ${parents.length} padres de familia`);      },      },

  console.log(`   - ${students.length} estudiantes`);

  console.log(`   - Sistema educativo peruano con soles peruanos`);    })    })

}

    grades.push(grade)    grades.push(grade)

main()

  .then(async () => {  }  }

    await prisma.$disconnect();

  })

  .catch(async (e) => {

    console.error(e);  // 5. Crear clases con secciones  // 5. Crear clases con secciones

    await prisma.$disconnect();

    process.exit(1);  console.log('🏫 Creando clases...')  console.log('🏫 Creando clases...')

  });
  const classesData = []  const classesData = []

  const sections = ['A', 'B', 'C']  const sections = ['A', 'B', 'C']

    

  for (const grade of grades) {  for (const grade of grades) {

    for (const section of sections) {    for (const section of sections) {

      classesData.push({      classesData.push({

        name: `${grade.name} - Sección ${section}`,        name: `${grade.name} - Sección ${section}`,

        gradeId: grade.id,        gradeId: grade.id,

        section: section,        section: section,

        academicYear: '2024',        academicYear: '2024',

        maxStudents: 30,        maxStudents: 30,

        teacherId: teachers[Math.floor(Math.random() * teachers.length)].id        teacherId: teachers[Math.floor(Math.random() * teachers.length)].id

      })      })

    }    }

  }  }



  const classes = []  const classes = []

  for (const classData of classesData) {  for (const classData of classesData) {

    const classItem = await prisma.class.upsert({    const classItem = await prisma.class.upsert({

      where: {       where: { 

        name: classData.name,        name: classData.name,

      },      },

      update: {},      update: {},

      create: {      create: {

        name: classData.name,        name: classData.name,

        gradeId: classData.gradeId,        gradeId: classData.gradeId,

        section: classData.section,        section: classData.section,

        academicYear: classData.academicYear,        academicYear: classData.academicYear,

        maxStudents: classData.maxStudents,        maxStudents: classData.maxStudents,

        teacherId: classData.teacherId,        teacherId: classData.teacherId,

        isActive: true,        isActive: true,

      },      },

    })    })

    classes.push(classItem)    classes.push(classItem)

  }  }



  // 6. Crear padres de familia  // 6. Crear padres de familia

  console.log('👨‍👩‍👧‍👦 Creando padres de familia...')  console.log('👨‍👩‍👧‍👦 Creando padres de familia...')

  const parentsData = [  const parentsData = [

    {    {

      email: 'carlos.rodriguez@email.com',      email: 'carlos.rodriguez@email.com',

      name: 'Carlos Rodríguez Pérez',      name: 'Carlos Rodríguez Pérez',

      firstName: 'Carlos Alberto',      firstName: 'Carlos Alberto',

      lastName: 'Rodríguez Pérez',      lastName: 'Rodríguez Pérez',

      phone: '+51 999 111 222',      phone: '+51 999 111 222',

      occupation: 'Ingeniero Civil',      occupation: 'Ingeniero Civil',

      address: 'Av. Javier Prado 1254, San Isidro, Lima'      address: 'Av. Javier Prado 1254, San Isidro, Lima'

    },    },

    {    {

      email: 'maria.fernandez@email.com',      email: 'maria.fernandez@email.com',

      name: 'María Fernández López',      name: 'María Fernández López',

      firstName: 'María Elena',      firstName: 'María Elena',

      lastName: 'Fernández López',      lastName: 'Fernández López',

      phone: '+51 999 111 223',      phone: '+51 999 111 223',

      occupation: 'Doctora',      occupation: 'Doctora',

      address: 'Calle Las Flores 456, Miraflores, Lima'      address: 'Calle Las Flores 456, Miraflores, Lima'

    },    },

    {    {

      email: 'jose.martinez@email.com',      email: 'jose.martinez@email.com',

      name: 'José Martínez Silva',      name: 'José Martínez Silva',

      firstName: 'José Luis',      firstName: 'José Luis',

      lastName: 'Martínez Silva',      lastName: 'Martínez Silva',

      phone: '+51 999 111 224',      phone: '+51 999 111 224',

      occupation: 'Contador',      occupation: 'Contador',

      address: 'Jr. Huancavelica 789, Cercado de Lima'      address: 'Jr. Huancavelica 789, Cercado de Lima'

    },    },

    {    {

      email: 'ana.gonzalez@email.com',      email: 'ana.gonzalez@email.com',

      name: 'Ana González Vargas',      name: 'Ana González Vargas',

      firstName: 'Ana María',      firstName: 'Ana María',

      lastName: 'González Vargas',      lastName: 'González Vargas',

      phone: '+51 999 111 225',      phone: '+51 999 111 225',

      occupation: 'Profesora',      occupation: 'Profesora',

      address: 'Av. Universitaria 321, Los Olivos, Lima'      address: 'Av. Universitaria 321, Los Olivos, Lima'

    },    },

    {    {

      email: 'luis.torres@email.com',      email: 'luis.torres@email.com',

      name: 'Luis Torres Quispe',      name: 'Luis Torres Quispe',

      firstName: 'Luis Fernando',      firstName: 'Luis Fernando',

      lastName: 'Torres Quispe',      lastName: 'Torres Quispe',

      phone: '+51 999 111 226',      phone: '+51 999 111 226',

      occupation: 'Comerciante',      occupation: 'Comerciante',

      address: 'Calle Real 654, San Juan de Lurigancho, Lima'      address: 'Calle Real 654, San Juan de Lurigancho, Lima'

    }    }

  ]  ]



  const parents = []  const parents = []

  for (const parentData of parentsData) {  for (const parentData of parentsData) {

    const parentUser = await prisma.user.upsert({    const parentUser = await prisma.user.upsert({

      where: { email: parentData.email },      where: { email: parentData.email },

      update: {},      update: {},

      create: {      create: {

        email: parentData.email,        email: parentData.email,

        name: parentData.name,        name: parentData.name,

        password: hashedPasswordParent,        password: hashedPasswordParent,

        role: 'PARENT',        role: 'PARENT',

      },      },

    })    })



    const parent = await prisma.parentProfile.upsert({    const parent = await prisma.parentProfile.upsert({

      where: { userId: parentUser.id },      where: { userId: parentUser.id },

      update: {},      update: {},

      create: {      create: {

        userId: parentUser.id,        userId: parentUser.id,

        firstName: parentData.firstName,        firstName: parentData.firstName,

        lastName: parentData.lastName,        lastName: parentData.lastName,

        phone: parentData.phone,        phone: parentData.phone,

        occupation: parentData.occupation,        occupation: parentData.occupation,

        address: parentData.address,        address: parentData.address,

      },      },

    })    })

    parents.push(parent)    parents.push(parent)

  }  }



  // 7. Crear estudiantes peruanos  // 7. Crear estudiantes peruanos

  console.log('👨‍🎓 Creando estudiantes...')  console.log('👨‍🎓 Creando estudiantes...')

  const studentsData = [  const studentsData = [

    // Estudiantes para diferentes grados    // Estudiantes para diferentes grados

    { firstName: 'Diego Alejandro', lastName: 'Huamán Torres', dni: '12345678', grade: '3er Grado', section: 'A', parentIndex: 0 },    { firstName: 'Diego Alejandro', lastName: 'Huamán Torres', dni: '12345678', grade: '3er Grado', section: 'A', parentIndex: 0 },

    { firstName: 'Sofía Valentina', lastName: 'Rodríguez Pérez', dni: '12345679', grade: '3er Grado', section: 'A', parentIndex: 0 },    { firstName: 'Sofía Valentina', lastName: 'Rodríguez Pérez', dni: '12345679', grade: '3er Grado', section: 'A', parentIndex: 0 },

    { firstName: 'Mateo Sebastián', lastName: 'Fernández López', dni: '12345680', grade: '4to Grado', section: 'B', parentIndex: 1 },    { firstName: 'Mateo Sebastián', lastName: 'Fernández López', dni: '12345680', grade: '4to Grado', section: 'B', parentIndex: 1 },

    { firstName: 'Isabella Camila', lastName: 'Martínez Silva', dni: '12345681', grade: '5to Grado', section: 'A', parentIndex: 2 },    { firstName: 'Isabella Camila', lastName: 'Martínez Silva', dni: '12345681', grade: '5to Grado', section: 'A', parentIndex: 2 },

    { firstName: 'Joaquín André', lastName: 'González Vargas', dni: '12345682', grade: '6to Grado', section: 'B', parentIndex: 3 },    { firstName: 'Joaquín André', lastName: 'González Vargas', dni: '12345682', grade: '6to Grado', section: 'B', parentIndex: 3 },

    { firstName: 'Valeria Nicole', lastName: 'Torres Quispe', dni: '12345683', grade: '1ro Secundaria', section: 'A', parentIndex: 4 },    { firstName: 'Valeria Nicole', lastName: 'Torres Quispe', dni: '12345683', grade: '1ro Secundaria', section: 'A', parentIndex: 4 },

    { firstName: 'Nicolás Emilio', lastName: 'Chávez Morales', dni: '12345684', grade: '2do Secundaria', section: 'B', parentIndex: 0 },    { firstName: 'Nicolás Emilio', lastName: 'Chávez Morales', dni: '12345684', grade: '2do Secundaria', section: 'B', parentIndex: 0 },

    { firstName: 'Antonella Lucía', lastName: 'Vásquez Herrera', dni: '12345685', grade: '3ro Secundaria', section: 'A', parentIndex: 1 },    { firstName: 'Antonella Lucía', lastName: 'Vásquez Herrera', dni: '12345685', grade: '3ro Secundaria', section: 'A', parentIndex: 1 },

    { firstName: 'Sebastián Matías', lastName: 'Delgado Ramos', dni: '12345686', grade: '4to Secundaria', section: 'A', parentIndex: 2 },    { firstName: 'Sebastián Matías', lastName: 'Delgado Ramos', dni: '12345686', grade: '4to Secundaria', section: 'A', parentIndex: 2 },

    { firstName: 'Renata Alejandra', lastName: 'Sánchez Flores', dni: '12345687', grade: '5to Secundaria', section: 'B', parentIndex: 3 },    { firstName: 'Renata Alejandra', lastName: 'Sánchez Flores', dni: '12345687', grade: '5to Secundaria', section: 'B', parentIndex: 3 },

    // Más estudiantes para poblar las clases    // Más estudiantes para poblar las clases

    { firstName: 'Adrián Gabriel', lastName: 'Mendoza Castro', dni: '12345688', grade: '1er Grado', section: 'A', parentIndex: 4 },    { firstName: 'Adrián Gabriel', lastName: 'Mendoza Castro', dni: '12345688', grade: '1er Grado', section: 'A', parentIndex: 4 },

    { firstName: 'Catalina Esperanza', lastName: 'Salinas Vega', dni: '12345689', grade: '2do Grado', section: 'B', parentIndex: 0 },    { firstName: 'Catalina Esperanza', lastName: 'Salinas Vega', dni: '12345689', grade: '2do Grado', section: 'B', parentIndex: 0 },

    { firstName: 'Emilio Rodrigo', lastName: 'Paredes Linares', dni: '12345690', grade: '3er Grado', section: 'B', parentIndex: 1 },    { firstName: 'Emilio Rodrigo', lastName: 'Paredes Linares', dni: '12345690', grade: '3er Grado', section: 'B', parentIndex: 1 },

    { firstName: 'Francesca Daniela', lastName: 'Moreno Aguilar', dni: '12345691', grade: '4to Grado', section: 'A', parentIndex: 2 },    { firstName: 'Francesca Daniela', lastName: 'Moreno Aguilar', dni: '12345691', grade: '4to Grado', section: 'A', parentIndex: 2 },

    { firstName: 'Gael Santiago', lastName: 'Jiménez Rojas', dni: '12345692', grade: '5to Grado', section: 'B', parentIndex: 3 }    { firstName: 'Gael Santiago', lastName: 'Jiménez Rojas', dni: '12345692', grade: '5to Grado', section: 'B', parentIndex: 3 }

  ]  ]



  const students = []  const students = []

  for (const studentData of studentsData) {  for (const studentData of studentsData) {

    // Encontrar la clase correspondiente    // Encontrar la clase correspondiente

    const targetClass = classes.find(c =>     const targetClass = classes.find(c => 

      c.name.includes(studentData.grade) && c.name.includes(studentData.section)      c.name.includes(studentData.grade) && c.name.includes(studentData.section)

    )    )

        

    if (!targetClass) continue    if (!targetClass) continue



    const studentUser = await prisma.user.upsert({    const studentUser = await prisma.user.upsert({

      where: { email: `${studentData.firstName.toLowerCase()}.${studentData.lastName.toLowerCase().replace(' ', '')}@student.school.edu.pe` },      where: { email: `${studentData.firstName.toLowerCase()}.${studentData.lastName.toLowerCase().replace(' ', '')}@student.school.edu.pe` },

      update: {},      update: {},

      create: {      create: {

        email: `${studentData.firstName.toLowerCase()}.${studentData.lastName.toLowerCase().replace(' ', '')}@student.school.edu.pe`,        email: `${studentData.firstName.toLowerCase()}.${studentData.lastName.toLowerCase().replace(' ', '')}@student.school.edu.pe`,

        name: `${studentData.firstName} ${studentData.lastName}`,        name: `${studentData.firstName} ${studentData.lastName}`,

        password: hashedPasswordStudent,        password: hashedPasswordStudent,

        role: 'STUDENT',        role: 'STUDENT',

      },      },

    })    })



    const student = await prisma.student.create({    const student = await prisma.student.create({

      data: {      data: {

        userId: studentUser.id,        userId: studentUser.id,

        studentId: `EST${String(students.length + 1).padStart(3, '0')}`,        studentId: `EST${String(students.length + 1).padStart(3, '0')}`,

        firstName: studentData.firstName,        firstName: studentData.firstName,

        lastName: studentData.lastName,        lastName: studentData.lastName,

        dateOfBirth: new Date(2010 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),        dateOfBirth: new Date(2010 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),

        gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',        gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',

        address: 'Lima, Perú',        address: 'Lima, Perú',

        phone: `+51 999 ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 900) + 100)}`,        phone: `+51 999 ${String(Math.floor(Math.random() * 900) + 100)} ${String(Math.floor(Math.random() * 900) + 100)}`,

        parentId: parents[studentData.parentIndex].id,        parentId: parents[studentData.parentIndex].id,

        enrollmentDate: new Date('2024-03-01'),        enrollmentDate: new Date('2024-03-01'),

        isActive: true,        isActive: true,

      },      },

    })    })



    // Matricular estudiante en clase    // Matricular estudiante en clase

    await prisma.classStudent.create({    await prisma.classStudent.create({

      data: {      data: {

        classId: targetClass.id,        classId: targetClass.id,

        studentId: student.id,        studentId: student.id,

        enrollmentDate: new Date('2024-03-01'),        enrollmentDate: new Date('2024-03-01'),

        isActive: true,        isActive: true,

      },      },

    })    })



    students.push(student)    students.push(student)

  }  }



  // 8. Crear calificaciones realistas (sistema peruano 1-20)  // 8. Crear calificaciones realistas (sistema peruano 1-20)

  console.log('📊 Creando calificaciones...')  console.log('📊 Creando calificaciones...')

  for (const student of students) {  for (const student of students) {

    for (const subject of subjects) {    for (const subject of subjects) {

      // Crear calificaciones para cada bimestre (4 bimestres)      // Crear calificaciones para cada bimestre (4 bimestres)

      for (let bimester = 1; bimester <= 4; bimester++) {      for (let bimester = 1; bimester <= 4; bimester++) {

        const baseScore = 11 + Math.random() * 8 // Entre 11 y 19 aproximadamente        const baseScore = 11 + Math.random() * 8 // Entre 11 y 19 aproximadamente

        const finalScore = Math.round(baseScore * 10) / 10 // Redondear a 1 decimal        const finalScore = Math.round(baseScore * 10) / 10 // Redondear a 1 decimal

                

        await prisma.gradeRecord.create({        await prisma.gradeRecord.create({

          data: {          data: {

            studentId: student.id,            studentId: student.id,

            subjectId: subject.id,            subjectId: subject.id,

            teacherId: subject.teacherId!,            teacherId: subject.teacherId!,

            score: finalScore,            score: finalScore,

            period: `${bimester}° Bimestre`,            period: `${bimester}° Bimestre`,

            academicYear: '2024',            academicYear: '2024',

            gradeType: 'BIMESTRAL',            gradeType: 'BIMESTRAL',

            comments: finalScore >= 16 ? 'Excelente desempeño' :             comments: finalScore >= 16 ? 'Excelente desempeño' : 

                     finalScore >= 14 ? 'Buen desempeño' :                      finalScore >= 14 ? 'Buen desempeño' : 

                     finalScore >= 11 ? 'Desempeño satisfactorio' : 'Necesita mejorar',                     finalScore >= 11 ? 'Desempeño satisfactorio' : 'Necesita mejorar',

            date: new Date(2024, (bimester - 1) * 3, 15), // Fechas distribuidas en el año            date: new Date(2024, (bimester - 1) * 3, 15), // Fechas distribuidas en el año

          },          },

        })        })

      }      }

    }    }

  }  }



  // 9. Crear registros de asistencia  // 9. Crear registros de asistencia

  console.log('📅 Creando registros de asistencia...')  console.log('📅 Creando registros de asistencia...')

  const startDate = new Date('2024-03-01')  const startDate = new Date('2024-03-01')

  const endDate = new Date('2024-12-15')  const endDate = new Date('2024-12-15')

  const currentDate = new Date(startDate)  const currentDate = new Date(startDate)



  while (currentDate <= endDate) {  while (currentDate <= endDate) {

    // Solo días de semana    // Solo días de semana

    if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) {    if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) {

      for (const student of students) {      for (const student of students) {

        // 95% de probabilidad de asistencia        // 95% de probabilidad de asistencia

        const isPresent = Math.random() > 0.05        const isPresent = Math.random() > 0.05

                

        await prisma.attendance.create({        await prisma.attendance.create({

          data: {          data: {

            studentId: student.id,            studentId: student.id,

            date: new Date(currentDate),            date: new Date(currentDate),

            status: isPresent ? 'PRESENT' : (Math.random() > 0.7 ? 'ABSENT' : 'LATE'),            status: isPresent ? 'PRESENT' : (Math.random() > 0.7 ? 'ABSENT' : 'LATE'),

            notes: !isPresent ? 'Falta justificada por motivos familiares' : null,            notes: !isPresent ? 'Falta justificada por motivos familiares' : null,

          },          },

        })        })

      }      }

    }    }

    currentDate.setDate(currentDate.getDate() + 1)    currentDate.setDate(currentDate.getDate() + 1)

  }  }



  // 10. Crear observaciones de estudiantes  console.log('✅ Seed completado exitosamente!')

  console.log('📝 Creando observaciones...')  console.log(`📊 Datos creados:`)

  const observationsData = [  console.log(`   - ${teachers.length} profesores`)

    { type: 'positive', title: 'Excelente participación', description: 'Mostró gran interés y ayudó a sus compañeros', category: 'Académico' },  console.log(`   - ${subjects.length} materias`)

    { type: 'positive', title: 'Liderazgo positivo', description: 'Demostró habilidades de liderazgo durante trabajo en grupo', category: 'Social' },  console.log(`   - ${grades.length} grados`)

    { type: 'positive', title: 'Creatividad destacada', description: 'Proyecto muy creativo e innovador', category: 'Académico' },  console.log(`   - ${classes.length} clases`)

    { type: 'neutral', title: 'Mejora gradual', description: 'Ha mostrado progreso en su rendimiento', category: 'Académico' },  console.log(`   - ${parents.length} padres de familia`)

    { type: 'concern', title: 'Necesita apoyo', description: 'Requiere refuerzo en matemáticas', category: 'Académico' }  console.log(`   - ${students.length} estudiantes`)

  ]  console.log(`   - Calificaciones del sistema peruano (1-20)`)

  console.log(`   - Registros de asistencia completos`)

  for (let i = 0; i < Math.min(students.length * 2, 30); i++) {  console.log(`   - Salarios en soles peruanos`)

    const student = students[Math.floor(Math.random() * students.length)]}

    const teacher = teachers[Math.floor(Math.random() * teachers.length)]      address: 'Calle Educación 123, Madrid',

    const obs = observationsData[Math.floor(Math.random() * observationsData.length)]      dateOfBirth: new Date('1985-03-15'),

          hireDate: new Date('2020-09-01'),

    await prisma.observation.create({      salary: 35000,

      data: {      isActive: true,

        studentId: student.id,    }

        teacherId: teacher.id,  })

        title: obs.title,

        description: obs.description,  const teacher2User = await prisma.user.upsert({

        category: obs.category,    where: { email: 'carlos.lopez@school.com' },

        isPositive: obs.type === 'positive',    update: {},

        date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),    create: {

      },      email: 'carlos.lopez@school.com',

    })      name: 'Prof. Carlos López',

  }      password: hashedPassword123,

      role: 'TEACHER',

  // 11. Crear mensajes entre profesores y padres    },

  console.log('💬 Creando mensajes...')  })

  const messagesData = [

    {  const teacher2 = await prisma.teacherProfile.upsert({

      subject: 'Progreso académico del estudiante',    where: { userId: teacher2User.id },

      content: 'Buenos días, me complace informarle sobre el excelente progreso de su hijo/a en clase. Su participación ha sido muy positiva.',    update: {},

      type: 'GENERAL'    create: {

    },      userId: teacher2User.id,

    {      employeeId: 'T002',

      subject: 'Reunión de padres de familia',      firstName: 'Carlos',

      content: 'Estimado padre de familia, le recordamos la reunión programada para coordinar el plan de estudios del próximo bimestre.',      lastName: 'López',

      type: 'MEETING'      phone: '+34 600 333 444',

    },      address: 'Avenida Conocimiento 456, Madrid',

    {      dateOfBirth: new Date('1978-11-22'),

      subject: 'Reporte de comportamiento',      hireDate: new Date('2019-02-15'),

      content: 'Me gustaría coordinar una reunión para hablar sobre algunos aspectos del comportamiento en clase y estrategias de apoyo.',      salary: 38000,

      type: 'BEHAVIOR_REPORT'      isActive: true,

    }    }

  ]  })



  for (let i = 0; i < 15; i++) {  const teacher3User = await prisma.user.upsert({

    const teacher = teachers[Math.floor(Math.random() * teachers.length)]    where: { email: 'ana.rodriguez@school.com' },

    const parent = parents[Math.floor(Math.random() * parents.length)]    update: {},

    const messageData = messagesData[Math.floor(Math.random() * messagesData.length)]    create: {

          email: 'ana.rodriguez@school.com',

    await prisma.message.create({      name: 'Prof. Ana Rodríguez',

      data: {      password: hashedPassword123,

        senderId: teacher.userId,      role: 'TEACHER',

        receiverId: parent.userId,    },

        subject: messageData.subject,  })

        content: messageData.content,

        type: messageData.type,  const teacher3 = await prisma.teacherProfile.upsert({

        isRead: Math.random() > 0.3, // 70% de mensajes leídos    where: { userId: teacher3User.id },

      },    update: {},

    })    create: {

  }      userId: teacher3User.id,

      employeeId: 'T003',

  // 12. Crear notificaciones      firstName: 'Ana',

  console.log('🔔 Creando notificaciones...')      lastName: 'Rodríguez',

  const notificationsData = [      phone: '+34 600 555 666',

    {      address: 'Plaza Sabiduría 789, Madrid',

      title: 'Nueva calificación disponible',      dateOfBirth: new Date('1980-07-08'),

      content: 'Se ha registrado una nueva calificación en Matemáticas',      hireDate: new Date('2021-08-30'),

      type: 'GRADE'      salary: 36000,

    },      isActive: true,

    {    }

      title: 'Recordatorio de reunión',  })

      content: 'Reunión de padres programada para mañana a las 3:00 PM',

      type: 'REMINDER'  // 3. Crear grados académicos (comentado temporalmente hasta resolver cliente Prisma)

    },  console.log('🎓 Creando grados académicos...')

    {  /*

      title: 'Evento escolar',  const grade1 = await prisma.academicGrade.upsert({

      content: 'Participación en la feria de ciencias el próximo viernes',    where: { name: '1ro' },

      type: 'EVENT'    update: {},

    }    create: {

  ]      name: '1ro',

      level: 1,

  for (let i = 0; i < 20; i++) {      description: 'Primer grado de educación primaria',

    const user = [...teachers.map(t => ({ id: t.userId, role: 'TEACHER' })),       isActive: true,

                   ...parents.map(p => ({ id: p.userId, role: 'PARENT' }))][Math.floor(Math.random() * (teachers.length + parents.length))]    },

    const notificationData = notificationsData[Math.floor(Math.random() * notificationsData.length)]  })

    

    await prisma.notification.create({  const grade2 = await prisma.academicGrade.upsert({

      data: {    where: { name: '2do' },

        userId: user.id,    update: {},

        title: notificationData.title,    create: {

        content: notificationData.content,      name: '2do',

        type: notificationData.type,      level: 2,

        isRead: Math.random() > 0.4, // 60% de notificaciones leídas      description: 'Segundo grado de educación primaria',

      },      isActive: true,

    })    },

  }  })



  console.log('✅ Seed completado exitosamente!')  const grade3 = await prisma.academicGrade.upsert({

  console.log(`📊 Datos creados:`)    where: { name: '3ro' },

  console.log(`   - ${teachers.length} profesores`)    update: {},

  console.log(`   - ${subjects.length} materias`)    create: {

  console.log(`   - ${grades.length} grados`)      name: '3ro',

  console.log(`   - ${classes.length} clases`)      level: 3,

  console.log(`   - ${parents.length} padres de familia`)      description: 'Tercer grado de educación primaria',

  console.log(`   - ${students.length} estudiantes`)      isActive: true,

  console.log(`   - Calificaciones del sistema peruano (1-20)`)    },

  console.log(`   - Registros de asistencia completos`)  })

  console.log(`   - Salarios en soles peruanos`)

}  const grade4 = await prisma.academicGrade.upsert({

    where: { name: '4to' },

main()    update: {},

  .then(async () => {    create: {

    await prisma.$disconnect()      name: '4to',

  })      level: 4,

  .catch(async (e) => {      description: 'Cuarto grado de educación primaria',

    console.error(e)      isActive: true,

    await prisma.$disconnect()    },

    process.exit(1)  })

  })
  const grade5 = await prisma.academicGrade.upsert({
    where: { name: '5to' },
    update: {},
    create: {
      name: '5to',
      level: 5,
      description: 'Quinto grado de educación primaria',
      isActive: true,
    },
  })

  const grade6 = await prisma.academicGrade.upsert({
    where: { name: '6to' },
    update: {},
    create: {
      name: '6to',
      level: 6,
      description: 'Sexto grado de educación primaria',
      isActive: true,
    },
  })

  // 4. Crear secciones
  console.log('📋 Creando secciones...')
  const sectionA = await prisma.section.upsert({
    where: { name: 'A' },
    update: {},
    create: {
      name: 'A',
      description: 'Sección A',
      isActive: true,
    },
  })

  const sectionB = await prisma.section.upsert({
    where: { name: 'B' },
    update: {},
    create: {
      name: 'B',
      description: 'Sección B',
      isActive: true,
    },
  })

  const sectionC = await prisma.section.upsert({
    where: { name: 'C' },
    update: {},
    create: {
      name: 'C',
      description: 'Sección C',
      isActive: true,
    },
  })

  // 5. Crear combinaciones grado-sección
  console.log('🔗 Creando combinaciones grado-sección...')
  await prisma.gradeSection.createMany({
    data: [
      { gradeId: grade4.id, sectionId: sectionA.id, capacity: 25 },
      { gradeId: grade4.id, sectionId: sectionB.id, capacity: 25 },
      { gradeId: grade4.id, sectionId: sectionC.id, capacity: 25 },
      { gradeId: grade5.id, sectionId: sectionA.id, capacity: 25 },
      { gradeId: grade5.id, sectionId: sectionB.id, capacity: 25 },
      { gradeId: grade6.id, sectionId: sectionA.id, capacity: 30 },
    ],
    skipDuplicates: true,
  })
  */

  // 6. Crear materias
  console.log('📚 Creando materias...')
  const mathematics = await prisma.subject.upsert({
    where: { code: 'MAT5' },
    update: {},
    create: {
      name: 'Matemáticas',
      code: 'MAT5',
      description: 'Matemáticas para 5to grado',
      credits: 4,
      teacherId: teacher1.id,
    },
  })

  const spanish = await prisma.subject.upsert({
    where: { code: 'ESP5' },
    update: {},
    create: {
      name: 'Lengua Española',
      code: 'ESP5',
      description: 'Lengua y Literatura Española para 5to grado',
      credits: 4,
      teacherId: teacher2.id,
    },
  })

  const science = await prisma.subject.upsert({
    where: { code: 'CIE5' },
    update: {},
    create: {
      name: 'Ciencias Naturales',
      code: 'CIE5',
      description: 'Ciencias Naturales para 5to grado',
      credits: 3,
      teacherId: teacher3.id,
    },
  })

  const history = await prisma.subject.upsert({
    where: { code: 'HIS5' },
    update: {},
    create: {
      name: 'Historia',
      code: 'HIS5',
      description: 'Historia para 5to grado',
      credits: 2,
      teacherId: teacher2.id,
    },
  })

  // 4. Crear clases
  console.log('🏫 Creando clases...')
  const class5A = await prisma.class.create({
    data: {
      name: 'Matemáticas 5to A',
      grade: '5to',
      section: 'A',
      academicYear: '2024-2025',
      maxStudents: 25,
      teacherId: teacher1.teacherProfile!.id,
      subjectId: mathematics.id,
    },
  })

  const class5B = await prisma.class.create({
    data: {
      name: 'Matemáticas 5to B',
      grade: '5to',
      section: 'B',
      academicYear: '2024-2025',
      maxStudents: 25,
      teacherId: teacher1.teacherProfile!.id,
      subjectId: mathematics.id,
    },
  })

  const classSpanish5A = await prisma.class.create({
    data: {
      name: 'Lengua Española 5to A',
      grade: '5to',
      section: 'A',
      academicYear: '2024-2025',
      maxStudents: 25,
      teacherId: teacher2.teacherProfile!.id,
      subjectId: spanish.id,
    },
  })

  const classScience5A = await prisma.class.create({
    data: {
      name: 'Ciencias Naturales 5to A',
      grade: '5to',
      section: 'A',
      academicYear: '2024-2025',
      maxStudents: 25,
      teacherId: teacher3.teacherProfile!.id,
      subjectId: science.id,
    },
  })

  // 5. Crear padres
  console.log('👨‍👩‍👧‍👦 Creando padres...')
  const parent1 = await prisma.user.upsert({
    where: { email: 'parent@school.com' },
    update: {},
    create: {
      email: 'parent@school.com',
      name: 'Juan Pérez',
      password: hashedPasswordParent,
      role: 'PARENT',
      parentProfile: {
        create: {
          firstName: 'Juan',
          lastName: 'Pérez',
          phone: '+34 600 777 888',
          address: 'Calle Familia 123, Madrid',
          dateOfBirth: new Date('1980-05-20'),
          occupation: 'Ingeniero',
        }
      }
    },
  })

  const parent2 = await prisma.user.upsert({
    where: { email: 'laura.martinez@email.com' },
    update: {},
    create: {
      email: 'laura.martinez@email.com',
      name: 'Laura Martínez',
      password: hashedPassword123,
      role: 'PARENT',
      parentProfile: {
        create: {
          firstName: 'Laura',
          lastName: 'Martínez',
          phone: '+34 600 999 000',
          address: 'Avenida Hogar 456, Madrid',
          dateOfBirth: new Date('1982-12-10'),
          occupation: 'Doctora',
        }
      }
    },
  })

  const parent3 = await prisma.user.upsert({
    where: { email: 'miguel.santos@email.com' },
    update: {},
    create: {
      email: 'miguel.santos@email.com',
      name: 'Miguel Santos',
      password: hashedPassword123,
      role: 'PARENT',
      parentProfile: {
        create: {
          firstName: 'Miguel',
          lastName: 'Santos',
          phone: '+34 600 111 000',
          address: 'Plaza Unión 789, Madrid',
          dateOfBirth: new Date('1979-08-25'),
          occupation: 'Arquitecto',
        }
      }
    },
  })

  // 6. Crear usuarios estudiantes
  console.log('🎓 Creando usuarios estudiantes...')
  const student1User = await prisma.user.upsert({
    where: { email: 'pedro.perez@student.school.com' },
    update: {},
    create: {
      email: 'pedro.perez@student.school.com',
      name: 'Pedro Pérez',
      password: hashedPasswordStudent,
      role: 'STUDENT',
      studentProfile: {
        create: {
          studentId: 'S2024001',
          firstName: 'Pedro',
          lastName: 'Pérez',
          dateOfBirth: new Date('2014-03-15'),
          grade: '5to',
          section: 'A',
        }
      }
    },
  })

  const student2User = await prisma.user.upsert({
    where: { email: 'ana.perez@student.school.com' },
    update: {},
    create: {
      email: 'ana.perez@student.school.com',
      name: 'Ana Pérez',
      password: hashedPasswordStudent,
      role: 'STUDENT',
      studentProfile: {
        create: {
          studentId: 'S2024002',
          firstName: 'Ana',
          lastName: 'Pérez',
          dateOfBirth: new Date('2015-07-22'),
          grade: '4to',
          section: 'B',
        }
      }
    },
  })

  const student3User = await prisma.user.upsert({
    where: { email: 'sofia.martinez@student.school.com' },
    update: {},
    create: {
      email: 'sofia.martinez@student.school.com',
      name: 'Sofia Martínez',
      password: hashedPasswordStudent,
      role: 'STUDENT',
      studentProfile: {
        create: {
          studentId: 'S2024003',
          firstName: 'Sofia',
          lastName: 'Martínez',
          dateOfBirth: new Date('2014-01-18'),
          grade: '5to',
          section: 'A',
        }
      }
    },
  })

  const student4User = await prisma.user.upsert({
    where: { email: 'diego.santos@student.school.com' },
    update: {},
    create: {
      email: 'diego.santos@student.school.com',
      name: 'Diego Santos',
      password: hashedPasswordStudent,
      role: 'STUDENT',
      studentProfile: {
        create: {
          studentId: 'S2024004',
          firstName: 'Diego',
          lastName: 'Santos',
          dateOfBirth: new Date('2014-11-05'),
          grade: '5to',
          section: 'B',
        }
      }
    },
  })

  // 7. Crear estudiantes
  console.log('👦👧 Creando estudiantes...')
  const student1 = await prisma.student.create({
    data: {
      studentId: 'S2024001',
      firstName: 'Pedro',
      lastName: 'Pérez',
      dateOfBirth: new Date('2014-03-15'),
      grade: '5to',
      section: 'A',
      enrollmentDate: new Date('2024-09-01'),
      parentId: parent1.parentProfile!.id,
      isActive: true,
    },
  })

  const student2 = await prisma.student.create({
    data: {
      studentId: 'S2024002',
      firstName: 'Ana',
      lastName: 'Pérez',
      dateOfBirth: new Date('2015-07-22'),
      grade: '4to',
      section: 'B',
      enrollmentDate: new Date('2024-09-01'),
      parentId: parent1.parentProfile!.id,
      isActive: true,
    },
  })

  const student3 = await prisma.student.create({
    data: {
      studentId: 'S2024003',
      firstName: 'Sofia',
      lastName: 'Martínez',
      dateOfBirth: new Date('2014-01-18'),
      grade: '5to',
      section: 'A',
      enrollmentDate: new Date('2024-09-01'),
      parentId: parent2.parentProfile!.id,
      isActive: true,
    },
  })

  const student4 = await prisma.student.create({
    data: {
      studentId: 'S2024004',
      firstName: 'Diego',
      lastName: 'Santos',
      dateOfBirth: new Date('2014-11-05'),
      grade: '5to',
      section: 'B',
      enrollmentDate: new Date('2024-09-01'),
      parentId: parent3.parentProfile!.id,
      isActive: true,
    },
  })

  // 7. Asignar estudiantes a clases
  console.log('📝 Asignando estudiantes a clases...')
  await prisma.classStudent.createMany({
    data: [
      { classId: class5A.id, studentId: student1.id },
      { classId: classSpanish5A.id, studentId: student1.id },
      { classId: classScience5A.id, studentId: student1.id },
      { classId: classSpanish5A.id, studentId: student3.id },
      { classId: classScience5A.id, studentId: student3.id },
      { classId: class5B.id, studentId: student4.id },
    ],
    skipDuplicates: true,
  })

  // 8. Crear calificaciones de ejemplo
  console.log('📊 Creando calificaciones...')
  await prisma.grade.createMany({
    data: [
      {
        studentId: student1.id,
        subjectId: mathematics.id,
        teacherId: teacher1.teacherProfile!.id,
        classId: class5A.id,
        gradeType: 'EXAM',
        score: 85,
        maxScore: 100,
        percentage: 85,
        letterGrade: 'B',
        comments: 'Buen trabajo en álgebra básica',
        gradeDate: new Date('2024-10-01'),
      },
      {
        studentId: student1.id,
        subjectId: spanish.id,
        teacherId: teacher2.teacherProfile!.id,
        classId: classSpanish5A.id,
        gradeType: 'HOMEWORK',
        score: 92,
        maxScore: 100,
        percentage: 92,
        letterGrade: 'A',
        comments: 'Excelente comprensión lectora',
        gradeDate: new Date('2024-10-03'),
      },
      {
        studentId: student3.id,
        subjectId: science.id,
        teacherId: teacher3.teacherProfile!.id,
        classId: classScience5A.id,
        gradeType: 'PROJECT',
        score: 88,
        maxScore: 100,
        percentage: 88,
        letterGrade: 'B+',
        comments: 'Proyecto muy creativo sobre el sistema solar',
        gradeDate: new Date('2024-10-05'),
      },
    ],
    skipDuplicates: true,
  })

  // 9. Crear registros de asistencia
  console.log('📅 Creando registros de asistencia...')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  await prisma.attendance.createMany({
    data: [
      {
        studentId: student1.id,
        classId: class5A.id,
        teacherId: teacher1.teacherProfile!.id,
        date: today,
        status: 'PRESENT',
        notes: 'Participó activamente en clase',
      },
      {
        studentId: student1.id,
        classId: class5A.id,
        teacherId: teacher1.teacherProfile!.id,
        date: yesterday,
        status: 'PRESENT',
      },
      {
        studentId: student3.id,
        classId: classScience5A.id,
        teacherId: teacher3.teacherProfile!.id,
        date: today,
        status: 'LATE',
        notes: 'Llegó 10 minutos tarde',
      },
      {
        studentId: student4.id,
        classId: class5B.id,
        teacherId: teacher1.teacherProfile!.id,
        date: yesterday,
        status: 'ABSENT',
        notes: 'Falta justificada por enfermedad',
      },
    ],
    skipDuplicates: true,
  })

  // 10. Crear observaciones
  console.log('📋 Creando observaciones...')
  await prisma.observation.createMany({
    data: [
      {
        studentId: student1.id,
        teacherId: teacher1.teacherProfile!.id,
        title: 'Excelente participación',
        description: 'Pedro mostró gran interés durante la clase de matemáticas y ayudó a sus compañeros.',
        category: 'Académico',
        isPositive: true,
        date: new Date('2024-10-01'),
      },
      {
        studentId: student3.id,
        teacherId: teacher3.teacherProfile!.id,
        title: 'Comportamiento disruptivo',
        description: 'Sofia interrumpió la clase varias veces. Se habló con ella sobre el respeto.',
        category: 'Comportamiento',
        isPositive: false,
        date: new Date('2024-10-02'),
      },
      {
        studentId: student1.id,
        teacherId: teacher2.teacherProfile!.id,
        title: 'Liderazgo positivo',
        description: 'Pedro demostró excelentes habilidades de liderazgo durante el trabajo en grupo.',
        category: 'Social',
        isPositive: true,
        date: new Date('2024-10-04'),
      },
    ],
    skipDuplicates: true,
  })

  // 11. Crear mensajes
  console.log('💬 Creando mensajes...')
  await prisma.message.createMany({
    data: [
      {
        senderId: teacher1.id,
        receiverId: parent1.id,
        subject: 'Progreso de Pedro en Matemáticas',
        content: 'Buenos días Sr. Pérez, me complace informarle que Pedro está mostrando un excelente progreso en matemáticas. Su participación en clase es muy buena.',
        type: 'GENERAL',
        isRead: false,
      },
      {
        senderId: parent1.id,
        receiverId: teacher1.id,
        subject: 'RE: Progreso de Pedro en Matemáticas',
        content: 'Muchas gracias por la información. Nos alegra mucho saber que Pedro está bien. ¿Hay algo específico en lo que podamos ayudarle desde casa?',
        type: 'GENERAL',
        isRead: true,
      },
      {
        senderId: teacher3.id,
        receiverId: parent2.id,
        subject: 'Incidente en clase de Ciencias',
        content: 'Estimada Sra. Martínez, hoy tuvimos un pequeño incidente con Sofia en clase. Me gustaría hablar con usted para coordinar estrategias.',
        type: 'BEHAVIOR_REPORT',
        isRead: false,
      },
    ],
    skipDuplicates: true,
  })

  // 12. Crear notificaciones
  console.log('🔔 Creando notificaciones...')
  await prisma.notification.createMany({
    data: [
      {
        userId: parent1.id,
        title: 'Nueva calificación disponible',
        message: 'Pedro ha recibido una nueva calificación en Matemáticas: 85/100',
        type: 'GRADE_POSTED',
        isRead: false,
        actionUrl: '/grades',
      },
      {
        userId: parent1.id,
        title: 'Mensaje del profesor',
        message: 'Ha recibido un nuevo mensaje de Prof. María García',
        type: 'ANNOUNCEMENT',
        isRead: false,
        actionUrl: '/messages',
      },
      {
        userId: parent3.id,
        title: 'Ausencia registrada',
        message: 'Diego faltó a la clase de Matemáticas el día de ayer',
        type: 'ATTENDANCE_ALERT',
        isRead: false,
        actionUrl: '/attendance',
      },
      {
        userId: parent2.id,
        title: 'Reporte de comportamiento',
        message: 'Se ha registrado una observación sobre Sofia. Revise los detalles.',
        type: 'BEHAVIOR_REPORT',
        isRead: false,
        actionUrl: '/observations',
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed completado exitosamente!')
  console.log('\n📊 Datos creados:')
  console.log('- 1 Administrador')
  console.log('- 3 Profesores')
  console.log('- 3 Padres')
  console.log('- 4 Estudiantes (con usuarios de login)')
  console.log('- 4 Materias')
  console.log('- 4 Clases')
  console.log('- 3 Calificaciones')
  console.log('- 4 Registros de asistencia')
  console.log('- 3 Observaciones')
  console.log('- 3 Mensajes')
  console.log('- 4 Notificaciones')
  console.log('\n🔑 Credenciales de acceso:')
  console.log('Admin: admin@school.com / admin123')
  console.log('Profesor: teacher@school.com / teacher123')
  console.log('Padre: parent@school.com / parent123')
  console.log('Estudiante: pedro.perez@student.school.com / student123')
  console.log('Estudiante: sofia.martinez@student.school.com / student123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
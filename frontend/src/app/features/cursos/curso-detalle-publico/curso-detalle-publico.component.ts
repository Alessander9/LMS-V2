import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../../core/components/footer/footer.component';

interface Instructor {
  name: string;
  role: string;
  bio: string;
  avatar: string;
}

interface SyllabusModule {
  title: string;
  topics: string[];
}

interface CursoDetalle {
  title: string;
  category: 'CORTOS' | 'DIPLOMADOS';
  duration: string;
  description: string;
  price: string;
  image: string;
  points: string[];
  instructor: Instructor;
  syllabus: SyllabusModule[];
  audience: string;
  requirements: string[];
  schedule: string;
  mode: string;
}

@Component({
  selector: 'app-curso-detalle-publico',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './curso-detalle-publico.component.html',
  styleUrls: []
})
export class CursoDetallePublicoComponent implements OnInit {
  slug: string | null = null;
  curso: CursoDetalle | null = null;
  showModal = false;
  expandedModules: Record<string, boolean> = {};

  cursosData: Record<string, CursoDetalle> = {
    'fundamentos-reiki': {
      title: 'Fundamentos de Reiki',
      category: 'CORTOS',
      duration: '15 horas',
      description: 'Domina las bases de la sanación energética desde tu hogar para aplicar en el día a día. Aprenderás las posiciones de manos, auto-tratamiento y cómo canalizar la energía Reiki de manera efectiva.',
      price: 'S/ 180',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
      points: [
        'Historia y principios del Reiki Usui',
        'El sistema de chakras y flujo energético',
        'Auto-tratamiento y auto-sanación paso a paso',
        'Sesión práctica guiada para pacientes',
        'Limpieza energética de espacios'
      ],
      instructor: {
        name: 'Elena Rostova',
        role: 'Gran Maestra Reiki Usui & Sanadora Pránica',
        bio: 'Elena cuenta con más de 12 años dedicados a la sanación energética. Ha formado a más de 5,000 alumnos en toda Hispanoamérica en el redescubrimiento de su fuerza vital.',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80'
      },
      syllabus: [
        {
          title: 'Módulo 1: Introducción a la Energía Vital y Mikao Usui',
          topics: ['Historia y orígenes del Reiki tradicional japonés', 'Los 5 principios del Reiki (Gokai)', 'La física detrás de la energía vibratoria']
        },
        {
          title: 'Módulo 2: Anatomía Energética: Los 7 Chakras',
          topics: ['Los chakras mayores y sus correspondencias físicas y emocionales', 'Identificación de bloqueos energéticos', 'Uso del péndulo como herramienta de diagnóstico']
        },
        {
          title: 'Módulo 3: Auto-tratamiento y Posiciones de Manos',
          topics: ['Técnicas de enraizamiento y protección', 'Las 12 posiciones básicas para el auto-reiki', 'Práctica guiada de auto-sanación diaria']
        },
        {
          title: 'Módulo 4: Práctica en Otros y Ética Holística',
          topics: ['Cómo preparar una sesión para un paciente', 'Posiciones de manos en camilla', 'Aspectos éticos del terapeuta energético']
        }
      ],
      audience: 'Dirigido a toda persona interesada en iniciar su camino de sanación personal, reducción del estrés y armonía energética, sin importar su nivel de experiencia.',
      requirements: [
        'Ningún conocimiento previo de terapias alternativas.',
        'Espacio cómodo y tranquilo para la meditación y prácticas.',
        'Mente abierta y disposición para experimentar el flujo energético.'
      ],
      schedule: 'Flexibilidad de horarios (Acceso ilimitado 24/7)',
      mode: 'Virtual Autodirigido con tutoría virtual disponible'
    },
    'acupresion-practica': {
      title: 'Acupresión Práctica',
      category: 'CORTOS',
      duration: '12 horas',
      description: 'Aprende técnicas rápidas de alivio del dolor y estrés usando puntos de presión. Conoce los meridianos principales y cómo autorregular el bienestar del cuerpo de manera no invasiva.',
      price: 'S/ 220',
      image: 'https://images.unsplash.com/photo-1519689680058-324335c77ebe?auto=format&fit=crop&w=800&q=80',
      points: [
        'Meridianos de acupuntura principales',
        'Puntos gatillo para el alivio del dolor de cabeza',
        'Técnicas de digitopresión contra el estrés',
        'Alivio de tensiones musculares comunes',
        'Precauciones y contraindicaciones'
      ],
      instructor: {
        name: 'Dr. Kenji Takahashi',
        role: 'Especialista en Medicina Tradicional Asiática',
        bio: 'Con 15 años de experiencia clínica y docente en acupuntura y digitopresión, el Dr. Kenji simplifica las milenarias técnicas de medicina china para la vida contemporánea.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80'
      },
      syllabus: [
        {
          title: 'Módulo 1: Fundamentos de los Meridianos y el Qi',
          topics: ['¿Qué es el Qi y cómo fluye por el cuerpo?', 'Introducción a los 12 canales principales', 'Cómo ubicar los puntos reflectores (Cun)']
        },
        {
          title: 'Módulo 2: Puntos de Presión de Emergencia',
          topics: ['El punto Hegu (IG4) para el dolor de cabeza y estrés', 'Puntos clave para el insomnio y la ansiedad (Neiguan y Shenmen)', 'Digitopresión para el cansancio ocular']
        },
        {
          title: 'Módulo 3: Alivio de Tensiones y Dolores Musculares',
          topics: ['Protocolos para dolor cervical y hombros rígidos', 'Alivio de la zona lumbar y ciática', 'Técnicas de automasaje rápido']
        }
      ],
      audience: 'Diseñado para masoterapeutas, entusiastas de la salud natural y cualquier persona que sufra de migrañas, dolores tensionales o insomnio crónico.',
      requirements: [
        'No se necesitan conocimientos médicos previos.',
        'Ropa cómoda para realizar los ejercicios prácticos de palpación.'
      ],
      schedule: 'Sesiones grabadas y tutoría mensual en vivo (Sábados de 4 pm a 5 pm)',
      mode: 'Mixto (Grabaciones de alta calidad y tutoría programada)'
    },
    'aromaterapia-esencial': {
      title: 'Aromaterapia Esencial',
      category: 'CORTOS',
      duration: '10 horas',
      description: 'Descubre el uso seguro y efectivo de aceites esenciales para equilibrar la mente, el cuerpo y las emociones de forma orgánica.',
      price: 'S/ 150',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
      points: [
        'Extracción y pureza de aceites esenciales',
        'Guía de dilución y seguridad con aceites vehiculares',
        'Sinergias esenciales para el insomnio y la ansiedad',
        'Creación de brumas y aceites para masaje',
        'Uso práctico en difusores y ambientes'
      ],
      instructor: {
        name: 'Carmen Luján',
        role: 'Aromaterapeuta Clínica y Cosmetóloga Natural',
        bio: 'Especialista en formulación orgánica con aceites esenciales y vegetales. Carmen ayuda a las personas a reemplazar químicos sintéticos en su cuidado diario por esencias puras.',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80'
      },
      syllabus: [
        {
          title: 'Módulo 1: Fundamentos de la Destilación y Pureza',
          topics: ['Diferencia entre esencia, aceite esencial y fragancia sintética', 'Métodos de extracción natural', 'Cómo leer etiquetas y evitar adulteraciones']
        },
        {
          title: 'Módulo 2: Vías de Absorción y Seguridad',
          topics: ['Absorción olfativa y el sistema límbico', 'Absorción dérmica y factores de dilución (porcentajes seguros)', 'Aceites esenciales fotosensibles y dermo-cáusticos']
        },
        {
          title: 'Módulo 3: Monografía de Aceites Clave y Mezclas',
          topics: ['Lavanda, Menta, Limón y Árbol de Té: botiquín básico', 'Preparación de brumas para almohadas', 'Fórmula de aceite de masajes relajantes']
        }
      ],
      audience: 'Cualquier persona que busque incorporar aromas sanadores en su hogar, cosmetólogas, jaboneras y terapeutas holísticos.',
      requirements: [
        'Acceso a aceites esenciales para experimentar (opcional pero sugerido).',
        'Envases de vidrio oscuros para las formulaciones.'
      ],
      schedule: 'A tu ritmo (100% asincrónico con foro de consultas activo)',
      mode: 'Virtual Grabado con acceso de por vida'
    },
    'terapia-integral': {
      title: 'Diplomado en Terapia Integral',
      category: 'DIPLOMADOS',
      duration: '150 horas',
      description: 'Una formación exhaustiva que combina múltiples disciplinas holísticas para formar terapeutas profesionales listos para la práctica clínica independiente.',
      price: 'S/ 1,850',
      image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
      points: [
        'Fundamentos de medicina holística',
        'Diagnóstico y anamnesis del paciente',
        'Integración de Reiki, Flores de Bach y Cristaloterapia',
        'Ética del terapeuta y gestión de consulta',
        'Casos clínicos supervisados en vivo'
      ],
      instructor: {
        name: 'Dr. Mario Valdez',
        role: 'Psicólogo Clínico y Director de Terapia Holística',
        bio: 'Con 20 años de experiencia, el Dr. Mario fusiona la psicología académica moderna con herramientas vibracionales y energéticas para abordar al ser de manera verdaderamente integral.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80'
      },
      syllabus: [
        {
          title: 'Módulo 1: Fundamentos de la Medicina Holística',
          topics: ['Historia de la medicina complementaria y modelos de salud', 'El paradigma de la multidimensionalidad del ser', 'Anatomía física vs. Anatomía energética']
        },
        {
          title: 'Módulo 2: Diagnóstico y Anamnesis Integral',
          topics: ['La primera entrevista: lenguaje verbal y no verbal', 'Cómo elaborar una ficha de historial clínico holístico', 'Identificación del síntoma raíz vs. la manifestación física']
        },
        {
          title: 'Módulo 3: Sinergias Terapéuticas Avanzadas',
          topics: ['Combinando técnicas corporales y energéticas', 'Diseño de tratamientos personalizados paso a paso', 'Manejo de crisis curativas y respuestas emocionales']
        },
        {
          title: 'Módulo 4: Ética, Rol y Gestión Profesional',
          topics: ['El código ético del terapeuta integral', 'Establecimiento de límites profesionales sanos', 'Cómo fundar, publicitar y gestionar tu propio consultorio']
        },
        {
          title: 'Módulo 5: Prácticas Clínicas y Casos Clínicos',
          topics: ['Análisis de casos reales en video', 'Supervisión de tratamientos elaborados por los alumnos', 'Proyecto final de titulación']
        }
      ],
      audience: 'Dirigido a psicólogos, profesionales de la salud, terapeutas existentes y cualquier persona con vocación de servicio que desee certificarse formalmente para abrir su propia consulta terapéutica.',
      requirements: [
        'Estudios de nivel secundario concluidos.',
        'Compromiso ético para el manejo de pacientes en práctica.',
        'Disposición para realizar 30 horas de prácticas formativas supervisadas.'
      ],
      schedule: 'Lunes y Miércoles de 7:00 PM a 9:00 PM (GMT-5) / Clases grabadas si no asistes',
      mode: 'Online en Vivo (Clases sincrónicas interactiva) + Campus Virtual 24/7'
    },
    'herbolaria': {
      title: 'Especialización en Herbolaria',
      category: 'DIPLOMADOS',
      duration: '120 horas',
      description: 'Profundiza en la medicina natural y plantas curativas con expertos del sector para complementar tratamientos tradicionales.',
      price: 'S/ 1,490',
      image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80',
      points: [
        'Clasificación botánica de plantas medicinales',
        'Elaboración de tinturas, pomadas e infusiones terapéuticas',
        'Seguridad, toxicología e interacciones de plantas',
        'Herbolaria aplicada a sistemas específicos (digestivo, nervioso)',
        'Monografías de plantas nativas de América Latina'
      ],
      instructor: {
        name: 'Silvana Castro',
        role: 'Fitoterapeuta & Botánica Médica',
        bio: 'Silvana es ingeniera botánica y posee una maestría en fitoterapia. Dedica su vida a rescatar el conocimiento ancestral de las plantas, respaldándolo con rigurosidad científica.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
      },
      syllabus: [
        {
          title: 'Módulo 1: Botánica y Reconocimiento de Especies',
          topics: ['Clasificación organoléptica y taxonómica de plantas', 'Recolección, secado y almacenamiento correcto', 'Identificación de plantas venenosas vs. medicinales']
        },
        {
          title: 'Módulo 2: Farmacología Natural e Ingredientes Activos',
          topics: ['Alcaloides, flavonoides, taninos y sus efectos fisiológicos', 'Mecanismos de acción en el cuerpo humano', 'Interacciones farmacológicas entre plantas y medicamentos tradicionales']
        },
        {
          title: 'Módulo 3: Galénica Básica: Preparación de Remedios',
          topics: ['Elaboración de infusiones, decocciones y macerados', 'Tinturas madre: cálculo de alcoholaturas exactas', 'Pomadas, ungüentos y jarabes caseros']
        },
        {
          title: 'Módulo 4: Fitoterapia Aplicada por Sistemas',
          topics: ['Plantas para el sistema nervioso (insomnio, depresión leve)', 'Fórmulas para afecciones respiratorias', 'Cuidado digestivo y detox hepático natural']
        }
      ],
      audience: 'Interesados en la medicina natural, farmacéuticos, nutricionistas, médicos y apasionados del bienestar ecológico y autosuficiente.',
      requirements: [
        'Acceso a frascos de vidrio y alcohol de uso alimentario para preparaciones.',
        'Material vegetal básico (fácilmente disponible en mercados o jardines).'
      ],
      schedule: 'Sábados de 9:00 AM a 11:30 AM (GMT-5) / Todas las sesiones se graban',
      mode: 'Online Sincrónico + Taller de Práctica Casera Guiada'
    },
    'flores-bach': {
      title: 'Flores de Bach',
      category: 'CORTOS',
      duration: '18 horas',
      description: 'Aprende a preparar y recetar esencias florales para tratar desequilibrios emocionales de forma natural y sin efectos secundarios.',
      price: 'S/ 160',
      image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80',
      points: [
        'Historia del Dr. Edward Bach',
        'Las 38 esencias florales y sus aplicaciones',
        'Métodos de preparación y dosificación',
        'Casos de estudio para el estrés y ansiedad',
        'Fórmula de rescate (Rescue Remedy)'
      ],
      instructor: {
        name: 'Patricia Benavente',
        role: 'Terapeuta Floral Acreditada por el Bach Centre',
        bio: 'Patricia ejerce y enseña la terapia floral desde hace más de 14 años. Su enfoque enfatiza la simplicidad y la autoayuda, tal como lo ideó originalmente el Dr. Bach.',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80'
      },
      syllabus: [
        {
          title: 'Módulo 1: Filosofía de la Terapia Floral de Bach',
          topics: ['Vida y obra del Dr. Edward Bach', 'El origen emocional de la enfermedad física', 'La simplicidad como pilar del sistema floral']
        },
        {
          title: 'Módulo 2: Las 38 Esencias y sus 7 Grupos Emocionales',
          topics: ['Flores para el temor (Mimulus, Rock Rose, Aspen, etc.)', 'Flores para la incertidumbre y la soledad', 'Estudio detallado de la signatura de cada planta']
        },
        {
          title: 'Módulo 3: Consulta Floral y Preparación Práctica',
          topics: ['Cómo realizar una entrevista floral', 'Cálculo de diluciones en el frasco gotero de 30ml', 'Uso y límites de la Fórmula de Rescate (Rescue Remedy)']
        }
      ],
      audience: 'Orientado a psicoterapeutas, psicólogos, veterinarios (uso en mascotas) y padres de familia que deseen una alternativa natural de contención emocional.',
      requirements: [
        'Sin requisitos previos.',
        'Se recomienda adquirir un frasco gotero vacío de 30ml y agua mineral sin gas para la clase final.'
      ],
      schedule: 'Auto-asistido (Accede cuando quieras)',
      mode: '100% Virtual con vídeos interactivos y auto-evaluaciones'
    },
    'reflexologia-podal': {
      title: 'Reflexología Podal',
      category: 'CORTOS',
      duration: '16 horas',
      description: 'Descubre el mapa de puntos reflejos en los pies para relajar el sistema nervioso, mejorar la circulación y aliviar el dolor muscular.',
      price: 'S/ 190',
      image: 'https://images.unsplash.com/photo-1519689680058-324335c77ebe?auto=format&fit=crop&w=800&q=80',
      points: [
        'Historia y fundamentos de la reflexología',
        'Mapa anatómico de puntos reflejos en el pie',
        'Técnicas de masaje y presiones específicas',
        'Protocolos para el insomnio y la digestión',
        'Rutina de relajación podal completa'
      ],
      instructor: {
        name: 'Carlos Mendoza',
        role: 'Masoterapeuta Clínico y Reflexólogo',
        bio: 'Carlos es un reconocido masoterapeuta especializado en técnicas manuales orientales y europeas. Ha trabajado en spas de primer nivel y consultorios deportivos.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80'
      },
      syllabus: [
        {
          title: 'Módulo 1: Conceptos Básicos y Anatomía Podal',
          topics: ['Historia de la reflexología antigua y moderna', 'Zonas reflejas longitudinales y transversales', 'Higiene, ergonomía del terapeuta y preparación del ambiente']
        },
        {
          title: 'Módulo 2: Técnicas de Manipulación y Presión',
          topics: ['Técnica del caminar del pulgar (Creeping)', 'Presión puntual estática vs. movimientos rotatorios', 'Uso de aceites y cremas conductoras aromáticas']
        },
        {
          title: 'Módulo 3: El Mapa del Iris y Pie en Práctica',
          topics: ['Ubicación exacta del sistema nervioso, columna y órganos digestivos', 'Protocolo de estimulación para el estreñimiento e indigestión', 'Protocolo antiestrés y desbloqueo de plexo solar']
        }
      ],
      audience: 'Recomendado para terapeutas de masajes, entusiastas del spa y personas que deseen aliviar el cansancio y mejorar el bienestar de sus familiares.',
      requirements: [
        'Se requiere contar con una persona para practicar las maniobras en vídeo.',
        'Crema de manos común o aceite corporal.'
      ],
      schedule: 'Clases asincrónicas con tutorías semanales virtuales',
      mode: 'Virtual Práctico con soporte por chat docente'
    },
    'yoga-principiantes': {
      title: 'Yoga para Principiantes',
      category: 'CORTOS',
      duration: '10 horas',
      description: 'Aprende las asanas básicas, respiración consciente (Pranayama) y meditación inicial para mejorar la postura y calmar la mente.',
      price: 'S/ 120',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
      points: [
        'Posturas fundamentales (Asanas) de flexión y equilibrio',
        'Técnicas de respiración consciente (Pranayama)',
        'Uso de bloques y apoyos para flexibilidad adaptada',
        'Meditación guiada corta de 10 minutos',
        'Rutina matutina de 20 minutos lista para usar'
      ],
      instructor: {
        name: 'Yogui Advaita (Satish Kumar)',
        role: 'Instructor de Hatha Yoga Certificado en la India',
        bio: 'Satish completó su formación de 500 horas en ashrams de Rishikesh, India. Su enseñanza se centra en la adaptabilidad del yoga a cualquier tipo de cuerpo y condición física.',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80'
      },
      syllabus: [
        {
          title: 'Módulo 1: Filosofía del Yoga y Conexión Respiratoria',
          topics: ['Orígenes del Yoga y los 8 senderos de Patanjali', 'La respiración Ujjayi y la oxigenación celular', 'Calentamiento articular (Sukshma Vyayama)']
        },
        {
          title: 'Módulo 2: Asanas Clave y Alineación Preventiva',
          topics: ['El Saludo al Sol (Surya Namaskar) paso a paso', 'Posturas de pie (Guerreros I y II, Árbol)', 'Posturas sentadas para flexibilizar la cadera y espalda']
        },
        {
          title: 'Módulo 3: Relajación Profunda y Savasana',
          topics: ['Uso correcto de almohadones, mantas y bloques', 'Técnica de relajación progresiva muscular', 'Introducción al silencio interior y meditación guiada']
        }
      ],
      audience: 'Para toda persona que desee comenzar su práctica física y mental de yoga sin importar su edad, flexibilidad o estado físico actual.',
      requirements: [
        'Ropa muy holgada o elástica.',
        'Un tapete o colchoneta de yoga antideslizante.',
        'Un espacio tranquilo y libre de interrupciones.'
      ],
      schedule: 'Acceso inmediato (Estudia a tu propio ritmo)',
      mode: 'Video HD Asincrónico interactivo'
    },
    'cristaloterapia': {
      title: 'Cristaloterapia',
      category: 'CORTOS',
      duration: '14 horas',
      description: 'Aprende a usar la vibración y resonancia de los cristales naturales para equilibrar los chakras, limpiar campos áuricos y proteger espacios.',
      price: 'S/ 175',
      image: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=800&q=80',
      points: [
        'Propiedades energéticas y moleculares de los cristales principales',
        'Métodos seguros de limpieza, carga y programación de gemas',
        'Alineación de chakras con cristales específicos',
        'Creación de elixires de gemas seguros de forma indirecta',
        'Técnicas de blindaje y protección energética de hogares'
      ],
      instructor: {
        name: 'Sonia Estrada',
        role: 'Gemoterapeuta y Sanadora Pránica Certificada',
        bio: 'Sonia es geóloga y terapeuta holística. Une el conocimiento de la física mineral de la tierra con la medicina sutil para canalizar la sanación mediante cristales.',
        avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=150&h=150&q=80'
      },
      syllabus: [
        {
          title: 'Módulo 1: Introducción a la Estructura Cristalina',
          topics: ['Física de los minerales y resonancia vibratoria', 'Clasificación de cristales según su color y sistema cristalino', 'Identificación de cristales genuinos vs. vidrios teñidos']
        },
        {
          title: 'Módulo 2: Cuidado Integral de las Gemas',
          topics: ['Métodos de limpieza con sal, agua, tierra y humo (cuáles dañan cada cristal)', 'Carga energética lunar, solar y con geometría sagrada', 'Cómo programar un cristal con una intención clara']
        },
        {
          title: 'Módulo 3: Sanación y Distribución sobre los Chakras',
          topics: ['Terapia en camilla: disposición de cuarzos por color y chakra', 'Uso del cuarzo maestro de doble punta para direccionar energía', 'Elixires de gemas: método indirecto para evitar metales pesados en agua']
        }
      ],
      audience: 'Terapeutas alternativos, masajistas, canalizadores y entusiastas de los cristales, piedras semipreciosas y la vibración natural.',
      requirements: [
        'Se recomienda contar con un set básico de 7 cristales (ej. Cuarzo Cristal, Amatista, Sodalita, Cuarzo Verde, Ojo de Tigre, Cornalina, Turmalina Negra).'
      ],
      schedule: 'Clases online grabadas 24/7',
      mode: 'Virtual Asincrónico'
    },
    'meditacion-mindfulness': {
      title: 'Meditación Mindfulness',
      category: 'CORTOS',
      duration: '12 horas',
      description: 'Aprende a vivir en el presente y reduce el estrés crónico a través de la atención plena, respaldado por la neurociencia moderna.',
      price: 'S/ 130',
      image: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=800&q=80',
      points: [
        'Qué es el Mindfulness y su base neurocientífica (reducción de amígdala)',
        'Atención enfocada en la respiración (Anapanasati)',
        'Escaneo corporal (Body Scan) para relajar tensiones profundas',
        'Mindfulness aplicado a las actividades cotidianas (comer, caminar)',
        'Manejo de pensamientos intrusivos y autocompasión'
      ],
      instructor: {
        name: 'Dr. Ricardo Santos',
        role: 'Neurobiólogo y Guía de Meditación Secular',
        bio: 'El Dr. Ricardo estudia la respuesta cerebral al estrés y los cambios anatómicos producidos por la meditación. Transmite el Mindfulness de forma científica y libre de dogmas.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80'
      },
      syllabus: [
        {
          title: 'Módulo 1: La Ciencia de la Atención Plena',
          topics: ['Definición de Mindfulness y orígenes seculares (MBSR)', 'Cómo el estrés deforma el cerebro y cómo la meditación lo repara', 'La red neuronal por defecto (mente errante)']
        },
        {
          title: 'Módulo 2: Técnicas Formales de Práctica',
          topics: ['La postura física óptima en silla o cojín Zafu', 'Práctica de la respiración como ancla', 'El escaneo corporal paso a paso para disolver el dolor psicógeno']
        },
        {
          title: 'Módulo 3: Integración Informal y Autocompasión',
          topics: ['Alimentación atenta (Mindful Eating)', 'Gestión emocional en tiempo real frente al enfado', 'La meditación de bondad amorosa (Metta)']
        }
      ],
      audience: 'Ideal para ejecutivos con alta presión laboral, estudiantes propensos a la ansiedad, terapeutas, psicólogos y cualquier persona que sufra de fatiga mental.',
      requirements: [
        'Ningún requisito físico.',
        'Compromiso de meditar diariamente al menos 10 minutos con las guías de audio provistas.'
      ],
      schedule: 'Clases asincrónicas + un directo quincenal de preguntas y respuestas',
      mode: 'Virtual con audios descargables y clases en vídeo'
    },
    'iridologia': {
      title: 'Iridología Básica',
      category: 'CORTOS',
      duration: '20 hours',
      description: 'Aprende a leer el mapa del iris para detectar tendencias de salud, debilidades orgánicas y acumulación de toxinas en el cuerpo.',
      price: 'S/ 210',
      image: 'https://images.unsplash.com/photo-1507919909716-c8262e491cde?auto=format&fit=crop&w=800&q=80',
      points: [
        'Historia y bases científicas de la iridología diagnóstica',
        'Topografía del iris según el mapa del Dr. Bernard Jensen',
        'Signos de inflamación, acidez y acumulación tóxica',
        'Diferenciación de constituciones genéticas (Linfático, Hematógeno, Mixto)',
        'Interpretación práctica con fotografías reales'
      ],
      instructor: {
        name: 'Dra. Miriam Rosas',
        role: 'Médico Naturópata e Iridóloga Clínica',
        bio: 'La Dra. Miriam cuenta con más de 16 años de práctica clínica y enseña iridología como un método de diagnóstico preventivo no invasivo para diseñar planes de alimentación personalizados.',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80'
      },
      syllabus: [
        {
          title: 'Módulo 1: Fundamentos y Anatomía Iridiana',
          topics: ['Breve historia y pioneros de la iridología', 'Embriología y conexión nerviosa iris-cerebro', 'Equipo básico de exploración (lupas, luces, cámaras)']
        },
        {
          title: 'Módulo 2: Topografía e Interpretación del Mapa',
          topics: ['Las 7 zonas concéntricas del iris', 'Ubicación de los sistemas digestivo, circulatorio y glandular', 'Diferenciación de signos agudos, subagudos, crónicos y destructivos']
        },
        {
          title: 'Módulo 3: Constituciones y Casos Clínicos',
          topics: ['El iris linfático (azul/gris) y su propensión a la acidez', 'El iris hematógeno (marrón) y su sistema circulatorio', 'Casos prácticos interactivos con análisis fotográfico']
        }
      ],
      audience: 'Dirigido a naturópatas, terapeutas holísticos, homeópatas, nutricionistas y profesionales de la medicina alternativa que deseen ampliar sus técnicas de diagnóstico preventivo.',
      requirements: [
        'Se recomienda contar con una lupa de examen ocular (5x a 10x) y una linterna pequeña.'
      ],
      schedule: 'Miércoles de 7:00 PM a 9:00 PM (GMT-5)',
      mode: 'Online en Vivo con acceso a grabaciones de por vida'
    },
    'biomagnetismo': {
      title: 'Diplomado en Biomagnetismo',
      category: 'DIPLOMADOS',
      duration: '150 horas',
      description: 'Formación completa y profesional en el uso de imanes terapéuticos de mediana intensidad para regular el pH y eliminar virus, bacterias y hongos del organismo.',
      price: 'S/ 1,590',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
      points: [
        'Descubrimiento del par biomagnético y bases del Dr. Isaac Goiz',
        'Magnetoterapia física vs. Par Biomagnético regulador del pH',
        'Protocolos terapéuticos para patógenos específicos',
        'Rastreo kinesiológico completo paso a paso (test de pies)',
        'Casos prácticos detallados y contraindicaciones absolutas'
      ],
      instructor: {
        name: 'Dr. Alejandro Ortiz',
        role: 'Médico Integrativo y Biomagnetista Certificado',
        bio: 'Alejandro es médico general con posgrado en medicina alternativa. Se formó directamente en México bajo el sistema original del Dr. Isaac Goiz, acumulando más de 10 años de experiencia clínica.',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80'
      },
      syllabus: [
        {
          title: 'Módulo 1: Fisicoquímica y Magnetismo Terrestre',
          topics: ['El potencial de hidrógeno (pH) y su relación con la salud celular', 'El electromagnetismo y los polos magnéticos de los imanes', 'Diferencia entre magnetoterapia clásica y Biomagnetismo Médico']
        },
        {
          title: 'Módulo 2: Metodología del Rastreo Kinesiológico',
          topics: ['El reflejo magneto-podal (acortamiento de la pierna derecha)', 'Técnicas de interrogatorio mental e inducción física', 'Lista oficial de pares biomagnéticos ordenada por zonas']
        },
        {
          title: 'Módulo 3: Pares Reservorios, Especiales y de Patógenos',
          topics: ['Pares de virus, bacterias, hongos y parásitos comunes', 'Identificación de pares emocionales y disfuncionales', 'Tiempo de colocación de imanes según la latitud geográfica']
        },
        {
          title: 'Módulo 4: Práctica Clínica, Contraindicaciones y Casos Especiales',
          topics: ['Contraindicaciones estrictas: quimioterapia, marcapasos y embarazo', 'Higiene del terapeuta y desinfección de imanes', 'Desarrollo de una sesión clínica completa simulada']
        }
      ],
      audience: 'Profesionales de la salud humana, terapeutas holísticos, enfermeros, kinesiólogos y personas interesadas en aprender una técnica física no invasiva para la restauración de la salud familiar o profesional.',
      requirements: [
        'Acceso a por lo menos un juego de 4 imanes terapéuticos de Ferrita o Neodimio de más de 1500 Gauss (forrados en cuero/cuerina roja y negra).',
        'Un compañero o familiar para realizar prácticas de rastreo en camilla.'
      ],
      schedule: 'Sábados de 9:00 AM a 1:00 PM (GMT-5)',
      mode: 'Online Sincrónico (Clases en vivo vía Zoom con tutoría interactiva)'
    },
    'medicina-china': {
      title: 'Diplomado en Medicina Tradicional China',
      category: 'DIPLOMADOS',
      duration: '180 horas',
      description: 'Aprende en profundidad los principios cosmológicos del Yin-Yang, la teoría de los 5 elementos, el diagnóstico clásico y las bases de la acupuntura y la moxibustión.',
      price: 'S/ 1,950',
      image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
      points: [
        'Filosofía cosmológica del Yin-Yang y los 5 Elementos (Wu Xing)',
        'Canales de energía (meridianos) y la circulación del Qi y la sangre',
        'Diagnóstico tradicional a través de la lengua y toma de pulso',
        'Teoría práctica de Acupuntura, Moxibustión y Ventosaterapia',
        'Tratamiento de síndromes metabólicos, musculares e inmunológicos comunes'
      ],
      instructor: {
        name: 'Dr. Zhao Wei',
        role: 'Director de Acupuntura y Medicina Tradicional',
        bio: 'Graduado de la prestigiosa Universidad de Medicina China de Beijing. El Dr. Zhao cuenta con 25 años de trayectoria clínica internacional promoviendo la integración de la medicina oriental en occidente.',
        avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=150&h=150&q=80'
      },
      syllabus: [
        {
          title: 'Módulo 1: Ontología y Cosmología de la Medicina Oriental',
          topics: ['El concepto del Tao y la dualidad dinámica Yin-Yang', 'Teoría de los Cinco Elementos: Madera, Fuego, Tierra, Metal, Agua', 'Fisiología de los Órganos Internos (Zang-Fu) y su psiquismo']
        },
        {
          title: 'Módulo 2: Fisiopatología y Circulación Energética',
          topics: ['Las Sustancias Vitales: Qi, Xue (Sangre), Shen (Mente), Jing (Esencia)', 'Los 12 meridianos ordinarios y los 8 vasos extraordinarios', 'Los factores patógenos externos (Viento, Frío, Calor, Humedad, Sequedad)']
        },
        {
          title: 'Módulo 3: Métodos de Diagnóstico Tradicional Chino',
          topics: ['Los 4 métodos de examen: Observación, Interrogatorio, Audición/Olfación, Palpación', 'Glosodiagnóstico: color del cuerpo de la lengua, forma y saburra', 'Pulsología: los 28 pulsos patológicos básicos y su interpretación']
        },
        {
          title: 'Módulo 4: Técnicas Terapéuticas Clásicas',
          topics: ['Inserción segura de agujas de acupuntura (técnicas de tonificación y dispersión)', 'Moxibustión directa e indirecta con puros de Artemisa', 'Uso práctico de ventosas de vidrio y neumáticas contra dolores corporales', 'Dietoterapia energética según la naturaleza térmica de los alimentos']
        }
      ],
      audience: 'Dirigido a médicos titulados, enfermeras, acupunturistas independientes, masajistas avanzados y terapeutas que busquen una especialización altamente demandada y de gran sustento filosófico y práctico.',
      requirements: [
        'Deseable contar con estudios previos en anatomía humana básica.',
        'Compromiso de estudio y dedicación para realizar lecturas teóricas complejas de textos tradicionales.'
      ],
      schedule: 'Martes y Jueves de 7:00 PM a 9:30 PM (GMT-5)',
      mode: 'Online en Vivo interactivo + Talleres Prácticos Presenciales Optativos'
    },
    'kinesiologia': {
      title: 'Especialización en Kinesiología',
      category: 'DIPLOMADOS',
      duration: '120 horas',
      description: 'Aprende el testeo muscular holístico para identificar bloqueos de estrés, intolerancias alimenticias y desequilibrios energéticos en el cuerpo.',
      price: 'S/ 1,650',
      image: 'https://images.unsplash.com/photo-1597854710119-a5a84362190a?auto=format&fit=crop&w=800&q=80',
      points: [
        'Testeo muscular de precisión (músculo indicador fuerte/débil)',
        'Kinesiología aplicada y su conexión con meridianos de acupuntura',
        'Liberación de Estrés Emocional (LEE) mediante reflejos neurovasculares',
        'Identificación de intolerancias alimenticias y toxicidades sutiles',
        'Corrección de bloqueos posturales e integración de hemisferios cerebrales'
      ],
      instructor: {
        name: 'Andrés Fuentes',
        role: 'Kinesiólogo Holístico y Terapeuta Osteopático',
        bio: 'Andrés se especializa en kinesiología holística e integración de cadenas musculares. Integra técnicas de osteopatía estructural con bioenergética para aliviar dolores psicosomáticos crónicos.',
        avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=150&h=150&q=80'
      },
      syllabus: [
        {
          title: 'Módulo 1: Fundamento Neurológico del Testeo Muscular',
          topics: ['Historia de la kinesiología aplicada (Dr. George Goodheart)', 'Fisiología del huso neuromuscular y arco reflejo', 'Cómo aislar el músculo deltoides o el tensor de la fascia lata para el testeo']
        },
        {
          title: 'Módulo 2: El Triángulo de la Salud Holística',
          topics: ['Factores estructurales, químicos y emocionales en el testeo', 'La rueda de los 14 músculos principales y sus meridianos', 'Técnicas de corrección: puntos neurovasculares de Bennett y neurolinfáticos de Chapman']
        },
        {
          title: 'Módulo 3: Kinesiología Emocional y de Alimentos',
          topics: ['Testeo de resonancia de sustancias (intolerancia al gluten, lácteos, azúcar)', 'Técnica de Liberación de Estrés Emocional con toques temporales', 'Corrección de reversión psicológica y auto-sabotaje']
        }
      ],
      audience: 'Kinesiólogos físicos tradicionales, osteópatas, quiroprácticos, masoterapeutas, preparadores físicos y terapeutas de bioenergética.',
      requirements: [
        'Conocimientos básicos de anatomía del aparato locomotor.',
        'Imprescindible contar con un compañero para las clases prácticas de testeo.'
      ],
      schedule: 'Sábados de 3:00 PM a 7:00 PM (GMT-5)',
      mode: 'Online Sincrónico + Tareas de filmación práctica supervisadas'
    },
    'nutricion-holistica': {
      title: 'Nutrición Holística',
      category: 'CORTOS',
      duration: '22 horas',
      description: 'Aprende a nutrir tu cuerpo con alimentos vivos, superalimentos y hábitos conscientes que promueven la autocuración y el equilibrio hormonal.',
      price: 'S/ 240',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
      points: [
        'Alimentación viva (Raw Food) y alcalinidad interna',
        'Superalimentos, adaptógenos y su impacto inmunológico',
        'Nutrición para la salud intestinal y la microbiota (Eje intestino-cerebro)',
        'Desintoxicación estacional segura y ayuno intermitente consciente',
        'Planificación de menús saludables y sabrosos libres de procesados'
      ],
      instructor: {
        name: 'Carolina Prado',
        role: 'Licenciada en Nutrición Humana y Especialista en Trofología',
        bio: 'Carolina es nutricionista clínica con especialización en alimentación basada en plantas y salud digestiva. Enseña a las personas a usar la comida como medicina preventiva e integral.',
        avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&w=150&h=150&q=80'
      },
      syllabus: [
        {
          title: 'Módulo 1: La Célula y la Alimentación Fisiológica',
          topics: ['Fisiología digestiva celular: absorción vs. fermentación tóxica', 'El pH en los fluidos corporales y la dieta alcalinizante', 'Los antinutrientes de las semillas y la importancia del activado (remojo)']
        },
        {
          title: 'Módulo 2: Salud Intestinal y Eje Cerebro-Intestinal',
          topics: ['La microbiota: bacterias amigables vs. disbiosis', 'Prebióticos, probióticos y fermentos caseros (Kéfir, Chucrut)', 'Inflamación de bajo grado y su relación con enfermedades autoinmunes']
        },
        {
          title: 'Módulo 3: Cocina Terapéutica y Planificación Diaria',
          topics: ['Superalimentos esenciales: maca, espirulina, cúrcuma, cacao puro', 'Elaboración de germinados y jugos verdes prensados en frío', 'Diseño de un plan detox estacional de 3 días para limpieza hepática']
        }
      ],
      audience: 'Médicos, nutricionistas, naturópatas, cocineros y cualquier persona decidida a transformar radicalmente su salud y vitalidad mediante la nutrición.',
      requirements: [
        'Sin requisitos previos.',
        'Se recomienda contar con licuadora o extractor de jugos básico para las preparaciones de recetas.'
      ],
      schedule: 'Auto-asistido con acceso inmediato de por vida',
      mode: '100% Virtual Asincrónico'
    }
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('id');
    if (this.slug && this.cursosData[this.slug]) {
      this.curso = this.cursosData[this.slug];
      // Expand the first module by default
      if (this.curso.syllabus.length > 0) {
        this.expandedModules[this.curso.syllabus[0].title] = true;
      }
    }
  }

  toggleModule(title: string) {
    this.expandedModules[title] = !this.expandedModules[title];
  }

  inscribir() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}

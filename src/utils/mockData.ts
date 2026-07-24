import { User, StudentProfile, Invoice, Quiz, UploadedDocument, TeamsSession } from "../types";

export const DEFAULT_USERS: User[] = [
  { id: "u-admin", email: "admin@virtuelle.co.za", name: "Virtuelle Admin Staff", role: "admin" },
  { id: "u-student1", email: "johndoe@gmail.com", name: "John Doe", role: "student" },
  { id: "u-student2", email: "sarahsmith@gmail.com", name: "Sarah Smith", role: "student" },
  { id: "u-student3", email: "pieterv@gmail.com", name: "Pieter van der Merwe", role: "student" },
  { id: "u-parent1", email: "parent@gmail.com", name: "Robert Doe", role: "parent" }
];

export const DEFAULT_STUDENTS = [
  {
    id: "s-john",
    userId: "u-student1",
    name: "John Doe",
    email: "johndoe@gmail.com",
    grade: "Grade 10",
    status: "active",
    chosenSubjects: ["English Home Language", "Mathematics", "Physical Science", "IT"],
    enrolledDate: "2026-01-15",
    parentId: "u-parent1",
    applicationFormSubmitted: true,
    documentsSubmitted: true,
    tuitionFee: 2600,
    registrationFeePaid: true,
    studentCardPaid: true,
  },
  {
    id: "s-sarah",
    userId: "u-student2",
    name: "Sarah Smith",
    email: "sarahsmith@gmail.com",
    grade: "Grade 11",
    status: "pending",
    chosenSubjects: ["English Home Language", "Mathematical Literacy", "Business Studies", "Economics"],
    enrolledDate: "2026-07-20",
    parentId: undefined,
    applicationFormSubmitted: true,
    documentsSubmitted: false,
    tuitionFee: 2800,
    registrationFeePaid: false,
    studentCardPaid: false,
  },
  {
    id: "s-pieter",
    userId: "u-student3",
    name: "Pieter van der Merwe",
    email: "pieterv@gmail.com",
    grade: "Grade 12",
    status: "active",
    chosenSubjects: ["Afrikaans FAL", "Mathematics", "Life Science", "AI", "Robotics"],
    enrolledDate: "2026-01-10",
    parentId: "u-parent1",
    applicationFormSubmitted: true,
    documentsSubmitted: true,
    tuitionFee: 3000,
    registrationFeePaid: true,
    studentCardPaid: true,
  }
];

export const DEFAULT_SUBJECTS = [
  {
    id: "sub-eng",
    name: "English Home Language",
    grade: "Grade 10-12",
    description: "Developing advanced communication, comprehension, and literature analysis skills.",
    modules: [
      {
        id: "eng-m1",
        title: "Module 1: Shakespearean Drama (Macbeth)",
        description: "Study of themes, characters, and dramatic techniques in Shakespeare's classic play.",
        resources: [
          { name: "Shakespeare Literary Analysis & Macbeth Handbook.pdf", url: "#", type: "handbook" },
          { name: "Act 1 & 2 Dramatic Devices Activity Sheet.pdf", url: "#", type: "activity" }
        ]
      },
      {
        id: "eng-m2",
        title: "Module 2: Creative Essay & Rhetorical Analysis",
        description: "Expository, narrative, and argumentative essay structures and persuasive rhetoric.",
        resources: [
          { name: "CAPS Creative Writing Masterclass Handbook.pdf", url: "#", type: "handbook" },
          { name: "Argumentative Essay & Rhetoric Activity Sheet.pdf", url: "#", type: "activity" }
        ]
      }
    ]
  },
  {
    id: "sub-math",
    name: "Mathematics",
    grade: "Grade 10-12",
    description: "Core algebraic operations, functions, trigonometry, and analytical geometry.",
    modules: [
      {
        id: "math-m1",
        title: "Module 1: Quadratic Equations & Functions",
        description: "Solving quadratics, graphing parabolas, and applications in word problems.",
        resources: [
          { name: "Algebraic Functions & Quadratics Handbook.pdf", url: "#", type: "handbook" },
          { name: "Quadratic Equations & Factoring Activity Sheet.pdf", url: "#", type: "activity" }
        ]
      }
    ]
  },
  {
    id: "sub-phys",
    name: "Physical Sciences",
    grade: "Grade 10-12",
    description: "Physics mechanics, vector kinematics, stoichiometry, and chemical reaction dynamics.",
    modules: [
      {
        id: "phys-m1",
        title: "Module 1: Newtonian Mechanics & Vector Kinematics",
        description: "Newton's laws of motion, free-body force diagrams, and linear momentum conservation.",
        resources: [
          { name: "Newtonian Mechanics & Kinematics Handbook.pdf", url: "#", type: "handbook" }
        ]
      }
    ]
  },
  {
    id: "sub-it",
    name: "IT (Information Technology)",
    grade: "Grade 10-12",
    description: "Introduction to object-oriented programming, data structures, and database systems.",
    modules: [
      {
        id: "it-m1",
        title: "Module 1: Fundamentals of OOP",
        description: "Understanding classes, objects, encapsulation, and inheritance in programming.",
        resources: [
          { name: "Object Oriented Programming Guide.pdf", url: "#", type: "handbook" }
        ]
      }
    ]
  },
  {
    id: "sub-ai",
    name: "AI (Artificial Intelligence)",
    grade: "Grade 10-12",
    description: "Modern concepts of machine learning, neural networks, ethics in AI, and prompt engineering.",
    modules: [
      {
        id: "ai-m1",
        title: "Module 1: History & Mechanics of Neural Networks",
        description: "How neurons form networks, backpropagation, and deep learning algorithms.",
        resources: [
          { name: "AI & Deep Learning Fundamentals Handbook.pdf", url: "#", type: "handbook" }
        ]
      }
    ]
  }
];

export const DEFAULT_QUIZZES = [
  {
    id: "q-macbeth",
    title: "Macbeth Act 1 Comprehension Test",
    subjectId: "sub-eng",
    grade: "Grade 10",
    description: "Assessment covering character motivations, prophecies, and key literary devices in Act 1 of Macbeth.",
    questions: [
      {
        id: "q-m1",
        question: "Who are the first characters to appear in Macbeth Act 1, Scene 1?",
        type: "multiple-choice",
        options: ["Macbeth and Banquo", "The Three Witches", "King Duncan and Malcolm", "Lady Macbeth"],
        correctAnswer: "The Three Witches"
      },
      {
        id: "q-m2",
        question: "What title is bestowed upon Macbeth as a reward for his battlefield heroics in Act 1?",
        type: "multiple-choice",
        options: ["Thane of Glamis", "Thane of Cawdor", "Prince of Cumberland", "King of Scotland"],
        correctAnswer: "Thane of Cawdor"
      },
      {
        id: "q-m3",
        question: "Explain the significance of the phrase 'Fair is foul, and foul is fair'. How does it establish the mood?",
        type: "text"
      }
    ]
  },
  {
    id: "q-quadratics",
    title: "Quadratic Equations Diagnostic Quiz",
    subjectId: "sub-math",
    grade: "Grade 10",
    description: "Covers factoring, completing the square, and using the quadratic formula.",
    questions: [
      {
        id: "q-q1",
        question: "What are the roots of the equation x^2 - 5x + 6 = 0?",
        type: "multiple-choice",
        options: ["x = -2, -3", "x = 2, 3", "x = 1, 6", "x = -1, -6"],
        correctAnswer: "x = 2, 3"
      },
      {
        id: "q-q2",
        question: "State the quadratic formula used to solve ax^2 + bx + c = 0.",
        type: "text"
      }
    ]
  }
];

export const DEFAULT_INVOICES = [
  {
    id: "inv-1",
    studentId: "s-john",
    studentName: "John Doe",
    description: "Once-off Enrollment Registration Fee",
    amount: 1000,
    dueDate: "2026-01-30",
    status: "paid",
    type: "registration",
    paidAt: "2026-01-20"
  },
  {
    id: "inv-2",
    studentId: "s-john",
    studentName: "John Doe",
    description: "Student Card Setup Fee",
    amount: 275,
    dueDate: "2026-01-30",
    status: "paid",
    type: "student_card",
    paidAt: "2026-01-20"
  },
  {
    id: "inv-3",
    studentId: "s-john",
    studentName: "John Doe",
    description: "Grade 10 Homeschool Tuition Fee - July 2026",
    amount: 2600,
    dueDate: "2026-07-01",
    status: "paid",
    type: "monthly_tuition",
    paidAt: "2026-07-01"
  },
  {
    id: "inv-4",
    studentId: "s-pieter",
    studentName: "Pieter van der Merwe",
    description: "Grade 12 Homeschool Tuition Fee - July 2026",
    amount: 3000,
    dueDate: "2026-07-01",
    status: "pending",
    type: "monthly_tuition"
  },
  {
    id: "inv-5",
    studentId: "s-sarah",
    studentName: "Sarah Smith",
    description: "Once-off Enrollment Registration Fee (Pending Verification)",
    amount: 1000,
    dueDate: "2026-08-15",
    status: "pending",
    type: "registration"
  }
];

export const DEFAULT_DOCUMENTS = [
  {
    id: "doc-1",
    studentId: "s-john",
    name: "John Doe - Certified ID Copy",
    type: "id_parent",
    status: "verified",
    fileSize: "1.2 MB",
    uploadedAt: "2026-01-14"
  },
  {
    id: "doc-2",
    studentId: "s-john",
    name: "John Doe - Birth Certificate",
    type: "birth_certificate",
    status: "verified",
    fileSize: "850 KB",
    uploadedAt: "2026-01-14"
  },
  {
    id: "doc-3",
    studentId: "s-pieter",
    name: "Pieter van der Merwe - 2025 Grade 11 Report Card",
    type: "report_card",
    status: "verified",
    fileSize: "2.1 MB",
    uploadedAt: "2026-01-08"
  }
];

export const DEFAULT_TEAMS_SESSIONS = [
  {
    id: "teams-1",
    subjectId: "sub-eng",
    subjectName: "English Home Language",
    grade: "Grade 10",
    title: "Macbeth Act 2 In-Depth Analysis",
    date: "2026-07-22",
    time: "10:00 - 11:30",
    tutorName: "Mrs. Sandra van Wyk",
    joinUrl: "https://teams.microsoft.com/l/meetup-join/mock-virtuelle-academique"
  },
  {
    id: "teams-2",
    subjectId: "sub-math",
    subjectName: "Mathematics",
    grade: "Grade 10",
    title: "Quadratic Functions & Parabola Plotting Workshop",
    date: "2026-07-23",
    time: "14:00 - 15:30",
    tutorName: "Mr. Eugene Coetzee",
    joinUrl: "https://teams.microsoft.com/l/meetup-join/mock-virtuelle-academique"
  }
];

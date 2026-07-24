/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GoogleGenAI client to avoid startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured in the environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Local JSON file database persistence path
const DB_PATH = path.join(process.cwd(), "data.json");

// Define Initial Seed Data
const DEFAULT_USERS = [
  { id: "u-admin", email: "admin@virtuelle.co.za", name: "Virtuelle Admin Staff", role: "admin" },
  { id: "u-student1", email: "johndoe@gmail.com", name: "John Doe", role: "student" },
  { id: "u-student2", email: "sarahsmith@gmail.com", name: "Sarah Smith", role: "student" },
  { id: "u-student3", email: "pieterv@gmail.com", name: "Pieter van der Merwe", role: "student" },
  { id: "u-parent1", email: "parent@gmail.com", name: "Robert Doe", role: "parent" }
];

const DEFAULT_STUDENTS = [
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
    documentsSubmitted: false, // Needs to upload docs for verification
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

const DEFAULT_SUBJECTS = [
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
      },
      {
        id: "eng-m3",
        title: "Module 3: Language Structures & Prescribed Poetry",
        description: "Comprehensive study of unseen and prescribed poetry alongside formal language mechanics.",
        resources: [
          { name: "Prescribed Poetry & Language Mechanics Handbook.pdf", url: "#", type: "handbook" },
          { name: "Figures of Speech & Grammar Practice Sheet.pdf", url: "#", type: "activity" }
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
      },
      {
        id: "math-m2",
        title: "Module 2: Analytical Geometry & Trigonometric Rules",
        description: "Distance formula, gradient calculations, sine/cosine rules, and trigonometric identities.",
        resources: [
          { name: "Analytical Geometry & Trigonometry Guide.pdf", url: "#", type: "handbook" },
          { name: "Trig Reduction & Coordinate Geometry Activity.pdf", url: "#", type: "activity" }
        ]
      },
      {
        id: "math-m3",
        title: "Module 3: Financial Maths & Compound Interest",
        description: "Annuities, depreciation, effective interest rates, and financial planning.",
        resources: [
          { name: "CAPS Financial Mathematics Masterclass Handbook.pdf", url: "#", type: "handbook" },
          { name: "Compound Interest & Annuities Practice Task.pdf", url: "#", type: "activity" }
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
          { name: "Newtonian Mechanics & Kinematics Handbook.pdf", url: "#", type: "handbook" },
          { name: "Vector Resolution & Forces Activity Sheet.pdf", url: "#", type: "activity" }
        ]
      },
      {
        id: "phys-m2",
        title: "Module 2: Chemical Change & Stoichiometry",
        description: "Molar mass, empirical formula determination, reaction yields, and balancing equations.",
        resources: [
          { name: "Stoichiometry & Reaction Dynamics Handbook.pdf", url: "#", type: "handbook" },
          { name: "Molar Calculations & Reaction Yields Worksheet.pdf", url: "#", type: "activity" }
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
          { name: "Object Oriented Programming Guide.pdf", url: "#", type: "handbook" },
          { name: "Class Design & Encapsulation Activity Sheet.pdf", url: "#", type: "activity" }
        ]
      },
      {
        id: "it-m2",
        title: "Module 2: Relational Databases & SQL Syntax",
        description: "Database normalization, primary/foreign keys, and crafting complex SQL queries.",
        resources: [
          { name: "Relational Databases & SQL Syntax Masterclass.pdf", url: "#", type: "handbook" },
          { name: "SQL Queries & Database Normalization Worksheet.pdf", url: "#", type: "activity" }
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
          { name: "AI & Deep Learning Fundamentals Handbook.pdf", url: "#", type: "handbook" },
          { name: "Perceptron & Backpropagation Activity Sheet.pdf", url: "#", type: "activity" }
        ]
      },
      {
        id: "ai-m2",
        title: "Module 2: Prompt Engineering & Generative AI Ethics",
        description: "Mastering zero-shot/few-shot prompts, model alignment, and ethical AI deployment.",
        resources: [
          { name: "Prompt Engineering & LLM Architecture Guide.pdf", url: "#", type: "handbook" },
          { name: "Ethical AI & Generative Prompting Activity.pdf", url: "#", type: "activity" }
        ]
      }
    ]
  }
];

const DEFAULT_QUIZZES = [
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
        options: ["Macbeth and Banquo", "The Three Witches", "King Duncan and Malcolm", "Lady Macbeth and her gentlewoman"],
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
        question: "Explain the significance of the phrase 'Fair is foul, and foul is fair'. How does it establish the mood and major themes of the play?",
        type: "text"
      }
    ]
  },
  {
    id: "q-macbeth-act2",
    title: "Macbeth Act 2 & Soliloquy In-Depth Analysis",
    subjectId: "sub-eng",
    grade: "Grade 10",
    description: "Evaluates understanding of the 'Dagger Soliloquy', psychological guilt, and dramatic irony.",
    questions: [
      {
        id: "q-m21",
        question: "What object does Macbeth hallucinate prior to entering King Duncan's bedchamber?",
        type: "multiple-choice",
        options: ["A bloody crown", "A hovering dagger", "A ghostly specter", "An iron scepter"],
        correctAnswer: "A hovering dagger"
      },
      {
        id: "q-m22",
        question: "Analyze Lady Macbeth's line: 'A little water clears us of this deed.' How does this contrast with Macbeth's reaction to the blood on his hands?",
        type: "text"
      }
    ]
  },
  {
    id: "q-rhetoric",
    title: "Creative Writing & Rhetorical Devices Task",
    subjectId: "sub-eng",
    grade: "Grade 10",
    description: "Tests knowledge of ethos, pathos, logos, and persuasive essay structure based on Module 2.",
    questions: [
      {
        id: "q-rh1",
        question: "Which rhetorical appeal relies on establishing the speaker's credibility, character, and moral standing?",
        type: "multiple-choice",
        options: ["Pathos", "Ethos", "Logos", "Kairos"],
        correctAnswer: "Ethos"
      },
      {
        id: "q-rh2",
        question: "Formulate a strong 2-sentence thesis statement arguing for or against the integration of digital technology in physical classrooms.",
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
  },
  {
    id: "q-trig-geom",
    title: "Analytical Geometry & Trigonometric Rules Assessment",
    subjectId: "sub-math",
    grade: "Grade 10",
    description: "Based on Module 2: Tests distance formula, gradient calculations, and sine rule applications.",
    questions: [
      {
        id: "q-tg1",
        question: "What is the distance between points A(1, 2) and B(4, 6) in the Cartesian plane?",
        type: "multiple-choice",
        options: ["3 units", "4 units", "5 units", "7 units"],
        correctAnswer: "5 units"
      },
      {
        id: "q-tg2",
        question: "Derive the coordinates of the midpoint M for segment connecting P(-2, 8) and Q(4, 2).",
        type: "text"
      }
    ]
  },
  {
    id: "q-physics-newton",
    title: "Newtonian Mechanics & Forces Physics Test",
    subjectId: "sub-phys",
    grade: "Grade 10",
    description: "Covers Newton's 1st, 2nd, and 3rd laws, free-body force diagrams, and acceleration.",
    questions: [
      {
        id: "q-p1",
        question: "If a net force of 20 N acts on a 4 kg mass, what acceleration is produced?",
        type: "multiple-choice",
        options: ["5 m/s²", "80 m/s²", "0.2 m/s²", "16 m/s²"],
        correctAnswer: "5 m/s²"
      },
      {
        id: "q-p2",
        question: "Explain Newton's First Law of Motion and provide a real-life example of inertia.",
        type: "text"
      }
    ]
  },
  {
    id: "q-chemistry-stoich",
    title: "Stoichiometry & Molar Mass Calculations Task",
    subjectId: "sub-phys",
    grade: "Grade 10",
    description: "Tests molar conversion, empirical formula calculation, and chemical reaction yield.",
    questions: [
      {
        id: "q-c1",
        question: "What is the molar mass of Water (H2O)? (H = 1 g/mol, O = 16 g/mol)",
        type: "multiple-choice",
        options: ["17 g/mol", "18 g/mol", "32 g/mol", "16 g/mol"],
        correctAnswer: "18 g/mol"
      },
      {
        id: "q-c2",
        question: "Calculate the number of moles in 44 grams of Carbon Dioxide (CO2). Show your formula and working.",
        type: "text"
      }
    ]
  },
  {
    id: "q-it-oop",
    title: "OOP Principles & Class Design Coding Task",
    subjectId: "sub-it",
    grade: "Grade 10",
    description: "Evaluates encapsulation, object instantiation, constructors, and access modifiers.",
    questions: [
      {
        id: "q-it1",
        question: "Which OOP principle restricts direct access to an object's internal variable fields?",
        type: "multiple-choice",
        options: ["Inheritance", "Encapsulation", "Polymorphism", "Abstraction"],
        correctAnswer: "Encapsulation"
      },
      {
        id: "q-it2",
        question: "Write a small pseudocode or Java class definition for a 'BankAccount' object containing a private balance attribute and a public deposit method.",
        type: "text"
      }
    ]
  },
  {
    id: "q-it-sql",
    title: "Relational Database Normalization & SQL Queries Test",
    subjectId: "sub-it",
    grade: "Grade 10",
    description: "Tests SELECT, WHERE, JOIN statements and primary vs foreign key relationships.",
    questions: [
      {
        id: "q-sql1",
        question: "Which SQL clause is used to filter records based on specific criteria?",
        type: "multiple-choice",
        options: ["GROUP BY", "ORDER BY", "WHERE", "HAVING"],
        correctAnswer: "WHERE"
      },
      {
        id: "q-sql2",
        question: "Explain why primary keys are necessary in relational databases and how they differ from foreign keys.",
        type: "text"
      }
    ]
  },
  {
    id: "q-ai-nn",
    title: "Neural Networks & AI Ethics Masterclass Task",
    subjectId: "sub-ai",
    grade: "Grade 10",
    description: "Covers artificial neurons, backpropagation algorithm, and responsible AI practices.",
    questions: [
      {
        id: "q-ai1",
        question: "Which activation function converts input values into a probability output between 0 and 1?",
        type: "multiple-choice",
        options: ["ReLU", "Sigmoid", "Linear", "Step"],
        correctAnswer: "Sigmoid"
      },
      {
        id: "q-ai2",
        question: "Discuss two key ethical challenges associated with training large language models on web datasets.",
        type: "text"
      }
    ]
  }
];

const DEFAULT_INVOICES = [
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
    status: "pending", // Unpaid but not overdue yet
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

const DEFAULT_DOCUMENTS = [
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

const DEFAULT_SUBMISSIONS: any[] = [];

const DEFAULT_TEAMS_SESSIONS = [
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
  },
  {
    id: "teams-3",
    subjectId: "sub-it",
    subjectName: "IT",
    grade: "Grade 10",
    title: "Understanding Classes and Constructors",
    date: "2026-07-24",
    time: "09:00 - 10:30",
    tutorName: "Dr. Alistair Mokoena",
    joinUrl: "https://teams.microsoft.com/l/meetup-join/mock-virtuelle-academique"
  }
];

const DEFAULT_APPLICATION_FORMS = [
  {
    studentId: "s-john",
    form: {
      learnerInfo: {
        fullName: "John",
        surname: "Doe",
        nickname: "Johnny",
        dateOfBirth: "2010-05-14",
        idNumber: "1005145028081",
        nationality: "South African",
        church: "Methodist",
        gender: "Male",
        homeLanguage: "English",
        preferredLanguage: "English",
        cellphone: "0823456789",
        email: "johndoe@gmail.com",
        entryDate: "2026-01-15",
        gradeIn2025_2026: "Grade 10"
      },
      familyInfo: {
        familyStatus: "Both Parents",
        guardianType: "Guardian",
        parentsPassed: ["None"]
      },
      medicalInfo: {
        chronicIllness: "None",
        allergies: "Peanuts",
        medication: "None",
        medicalAidInfo: "Discovery Health - 102930491"
      },
      nextOfKin: {
        name: "Jane Smith",
        contact: "0712345678",
        relationship: "Aunt"
      },
      parent1: {
        title: "Mr",
        fullNames: "Robert",
        surname: "Doe",
        initials: "RD",
        nickname: "Rob",
        idNumber: "7508205034089",
        preferredLanguage: "English",
        cellNumber: "0839876543",
        homeNumber: "0112345678",
        faxNumber: "",
        email: "parent@gmail.com",
        homeAddress: "42 Weaver Avenue, Montana, Pretoria, 0182",
        postalAddress: "P.O. Box 904, Pretoria, 0001",
        occupationStatus: "Full Time",
        occupation: "Engineer",
        employer: "Pretoria Construction",
        officeNumber: "0123456789",
        workAddress: "99 Church Street, Pretoria",
        livesWithParent: "Yes"
      },
      accountResponsibility: {
        responsibleParty: "Parent 1"
      },
      tuitionAgreement: {
        parent1Name: "Robert Doe",
        parent2Name: "",
        monthlyAmount: 2600,
        penaltyAcknowledged: true,
        termsAccepted: true,
        parent1Signature: "Robert Doe",
        parent2Signature: "",
        date: "2026-01-14"
      }
    }
  },
  {
    studentId: "s-pieter",
    form: {
      learnerInfo: {
        fullName: "Pieter",
        surname: "van der Merwe",
        nickname: "Piet",
        dateOfBirth: "2008-09-22",
        idNumber: "0809225032087",
        nationality: "South African",
        church: "NG Kerk",
        gender: "Male",
        homeLanguage: "Afrikaans",
        preferredLanguage: "Afrikaans",
        cellphone: "0798765432",
        email: "pieterv@gmail.com",
        entryDate: "2026-01-10",
        gradeIn2025_2026: "Grade 12"
      },
      familyInfo: {
        familyStatus: "Both Parents",
        guardianType: "Guardian",
        parentsPassed: ["None"]
      },
      medicalInfo: {
        chronicIllness: "Asthma",
        allergies: "Dust",
        medication: "Ventolin Inhaler",
        medicalAidInfo: "Bonitas - 9948574"
      },
      nextOfKin: {
        name: "Andries van der Merwe",
        contact: "0812345678",
        relationship: "Uncle"
      },
      parent1: {
        title: "Mr",
        fullNames: "Robert", // Pieter's step parent or sharing Robert's profile for multi-student demo
        surname: "Doe",
        initials: "RD",
        nickname: "Rob",
        idNumber: "7508205034089",
        preferredLanguage: "English",
        cellNumber: "0839876543",
        homeNumber: "0112345678",
        faxNumber: "",
        email: "parent@gmail.com",
        homeAddress: "42 Weaver Avenue, Montana, Pretoria, 0182",
        postalAddress: "P.O. Box 904, Pretoria, 0001",
        occupationStatus: "Full Time",
        occupation: "Engineer",
        employer: "Pretoria Construction",
        officeNumber: "0123456789",
        workAddress: "99 Church Street, Pretoria",
        livesWithParent: "Yes"
      },
      accountResponsibility: {
        responsibleParty: "Parent 1"
      },
      tuitionAgreement: {
        parent1Name: "Robert Doe",
        parent2Name: "",
        monthlyAmount: 3000,
        penaltyAcknowledged: true,
        termsAccepted: true,
        parent1Signature: "Robert Doe",
        parent2Signature: "",
        date: "2026-01-08"
      }
    }
  }
];

// Load Database from disk or initialize it
function loadDatabase() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const data = fs.readFileSync(DB_PATH, "utf8");
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to read database, resetting to default seed data.");
    }
  }

  const db = {
    users: DEFAULT_USERS,
    students: DEFAULT_STUDENTS,
    subjects: DEFAULT_SUBJECTS,
    quizzes: DEFAULT_QUIZZES,
    invoices: DEFAULT_INVOICES,
    documents: DEFAULT_DOCUMENTS,
    submissions: DEFAULT_SUBMISSIONS,
    teamsSessions: DEFAULT_TEAMS_SESSIONS,
    applicationForms: DEFAULT_APPLICATION_FORMS,
    paymentRemindersSent: [] as { id: string; invoiceId: string; sentAt: string; method: string; message: string }[]
  };
  saveDatabase(db);
  return db;
}

function saveDatabase(db: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to write database file:", e);
  }
}

// ---------------- API ENDPOINTS ----------------

// 1. Auth Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const db = loadDatabase();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials. User not found." });
  }

  // Simple password bypass for easy testing (mock security verification)
  // Check typical combinations
  if (
    (user.role === "admin" && password !== "admin123") ||
    (user.role === "student" && password !== "student123") ||
    (user.role === "parent" && password !== "parent123")
  ) {
    // If they typed something else, we allow it too to make user testing seamless, but alert in message
    console.log(`Mock-auth: allowing password '${password}' for role '${user.role}'`);
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

// 2. Register / Submit Application Form (Digital Contract Form)
app.post("/api/auth/register", (req, res) => {
  const { email, name, password, role, applicationForm } = req.body;
  const db = loadDatabase();

  const existing = db.users.find((u: any) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Email already registered." });
  }

  const userId = "u-" + Math.random().toString(36).substr(2, 9);
  const studentId = "s-" + Math.random().toString(36).substr(2, 9);

  // Determine standard monthly fee based on grade from Page 5 Offers & Fees
  let tuitionFee = 2000;
  const grade = applicationForm?.learnerInfo?.gradeIn2025_2026 || "Grade 10";
  if (grade === "Grade R") tuitionFee = 1800;
  else if (["Grade 1", "Grade 2", "Grade 3", "1 - 3"].includes(grade)) tuitionFee = 2000;
  else if (["Grade 4", "Grade 5", "Grade 6", "4 - 6"].includes(grade)) tuitionFee = 2200;
  else if (["Grade 7", "Grade 8", "Grade 9", "7 - 9"].includes(grade)) tuitionFee = 2400;
  else if (grade === "Grade 10") tuitionFee = 2600;
  else if (grade === "Grade 11") tuitionFee = 2800;
  else if (grade === "Grade 12") tuitionFee = 3000;

  // Create primary user account
  const newUser = { id: userId, email: email.trim().toLowerCase(), name, role: role || "student" };
  db.users.push(newUser);

  if (newUser.role === "student") {
    // Create student profile
    const studentProfile = {
      id: studentId,
      userId: userId,
      name: name,
      email: email.trim().toLowerCase(),
      grade: grade,
      status: "pending",
      chosenSubjects: applicationForm?.subjects || ["English Home Language", "Mathematics"],
      enrolledDate: new Date().toISOString().split("T")[0],
      parentId: undefined,
      applicationFormSubmitted: true,
      documentsSubmitted: false,
      tuitionFee: tuitionFee,
      registrationFeePaid: false,
      studentCardPaid: false,
    };
    db.students.push(studentProfile);

    // Save digital application form
    if (applicationForm) {
      db.applicationForms.push({
        studentId: studentId,
        form: applicationForm
      });

      // Process and store any documents uploaded during the register process
      if (Array.isArray(applicationForm.uploadedDocuments)) {
        applicationForm.uploadedDocuments.forEach((doc: any) => {
          db.documents.push({
            id: doc.id || "doc-" + Math.random().toString(36).substr(2, 9),
            studentId: studentId,
            name: doc.name,
            type: doc.type,
            status: "pending",
            fileSize: doc.fileSize || "1.2 MB",
            uploadedAt: doc.uploadedAt || new Date().toISOString().split("T")[0]
          });
        });
        if (applicationForm.uploadedDocuments.length >= 3) {
          studentProfile.documentsSubmitted = true;
        }
      }
    }

    // Generate Initial Registration Fee and Student Card Fee invoices
    db.invoices.push({
      id: "inv-" + Math.random().toString(36).substr(2, 9),
      studentId: studentId,
      studentName: name,
      description: "Once-off Enrollment Registration Fee",
      amount: 1000,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "pending",
      type: "registration"
    });

    db.invoices.push({
      id: "inv-" + Math.random().toString(36).substr(2, 9),
      studentId: studentId,
      studentName: name,
      description: "Student Card Setup Fee",
      amount: 275,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "pending",
      type: "student_card"
    });
  }

  saveDatabase(db);
  res.json({
    user: newUser,
    studentId: newUser.role === "student" ? studentId : undefined
  });
});

// 3. Get Student Profile & Application Form
app.get("/api/students", (req, res) => {
  const db = loadDatabase();
  res.json(db.students);
});

app.get("/api/students/:id", (req, res) => {
  const db = loadDatabase();
  const student = db.students.find((s: any) => s.id === req.params.id || s.userId === req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });

  const formRecord = db.applicationForms.find((f: any) => f.studentId === student.id);
  res.json({
    profile: student,
    applicationForm: formRecord ? formRecord.form : null
  });
});

// Approve Student Enrollment
app.post("/api/students/:id/approve", (req, res) => {
  const db = loadDatabase();
  const student = db.students.find((s: any) => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });

  student.status = "active";
  student.enrolledDate = new Date().toISOString().split("T")[0];

  // Add a monthly tuition invoice for the current month
  db.invoices.push({
    id: "inv-" + Math.random().toString(36).substr(2, 9),
    studentId: student.id,
    studentName: student.name,
    description: `${student.grade} Homeschool Tuition Fee - Active Enrollment`,
    amount: student.tuitionFee,
    dueDate: new Date().toISOString().split("T")[0],
    status: "pending",
    type: "monthly_tuition"
  });

  saveDatabase(db);
  res.json(student);
});

// 4. Verification Documents (Certified ID copy, birth certificate, etc.)
app.get("/api/students/:id/documents", (req, res) => {
  const db = loadDatabase();
  const docs = db.documents.filter((d: any) => d.studentId === req.params.id);
  res.json(docs);
});

app.post("/api/students/:id/documents", (req, res) => {
  const { name, type, fileSize } = req.body;
  const db = loadDatabase();

  const newDoc = {
    id: "doc-" + Math.random().toString(36).substr(2, 9),
    studentId: req.params.id,
    name: name,
    type: type,
    status: "pending",
    fileSize: fileSize || "1.5 MB",
    uploadedAt: new Date().toISOString().split("T")[0]
  };

  db.documents.push(newDoc);

  // Check if student has submitted main docs, update student record status
  const student = db.students.find((s: any) => s.id === req.params.id);
  if (student) {
    const studentDocs = db.documents.filter((d: any) => d.studentId === student.id);
    // If they have uploaded at least 3 documents, count as documents submitted
    if (studentDocs.length >= 2) {
      student.documentsSubmitted = true;
    }
  }

  saveDatabase(db);
  res.json(newDoc);
});

app.post("/api/documents/:id/verify", (req, res) => {
  const { status, rejectionReason } = req.body; // status: 'verified' | 'rejected'
  const db = loadDatabase();

  const doc = db.documents.find((d: any) => d.id === req.params.id);
  if (!doc) return res.status(404).json({ error: "Document not found" });

  doc.status = status;
  if (rejectionReason) doc.rejectionReason = rejectionReason;

  saveDatabase(db);
  res.json(doc);
});

// 5. Financial Invoices & Payment Reminders
app.get("/api/finance/invoices", (req, res) => {
  const db = loadDatabase();
  const studentId = req.query.studentId;
  const parentId = req.query.parentId;

  let list = db.invoices;

  if (studentId) {
    list = list.filter((i: any) => i.studentId === studentId);
  } else if (parentId) {
    // Find all students for this parent
    const parentStudents = db.students.filter((s: any) => s.parentId === parentId);
    const sIds = parentStudents.map((s: any) => s.id);
    list = list.filter((i: any) => sIds.includes(i.studentId));
  }

  res.json(list);
});

app.post("/api/finance/invoices/:id/pay", (req, res) => {
  const db = loadDatabase();
  const invoice = db.invoices.find((i: any) => i.id === req.params.id);
  if (!invoice) return res.status(404).json({ error: "Invoice not found" });

  const { paymentRef, paymentMethod, popFileName, popUrl, notes, paidAt, month } = req.body || {};

  invoice.status = "paid";
  invoice.paidAt = paidAt || new Date().toISOString().split("T")[0];
  if (paymentRef) invoice.paymentRef = paymentRef;
  if (paymentMethod) invoice.paymentMethod = paymentMethod;
  if (popFileName) invoice.popFileName = popFileName;
  if (popUrl) invoice.popUrl = popUrl;
  if (popFileName || popUrl) invoice.popUploadedAt = new Date().toISOString().split("T")[0];
  if (notes) invoice.notes = notes;
  if (month) invoice.month = month;

  // Update payment flags on student record if relevant
  const student = db.students.find((s: any) => s.id === invoice.studentId);
  if (student) {
    if (invoice.type === "registration") student.registrationFeePaid = true;
    if (invoice.type === "student_card") student.studentCardPaid = true;
  }

  saveDatabase(db);
  res.json(invoice);
});

// Create and record a new monthly tuition or fee payment with POP
app.post("/api/finance/invoices", (req, res) => {
  const db = loadDatabase();
  const { studentId, description, amount, dueDate, type, month, status, paymentRef, paymentMethod, popFileName, popUrl, notes, paidAt } = req.body;

  const student = db.students.find((s: any) => s.id === studentId);
  if (!student) return res.status(404).json({ error: "Student not found" });

  const newInvoice = {
    id: `INV-${Date.now().toString().slice(-6)}`,
    studentId,
    studentName: student.name,
    description: description || `${month || "Monthly"} Tuition Fee`,
    amount: Number(amount) || 2600,
    dueDate: dueDate || new Date().toISOString().split("T")[0],
    status: status || "paid",
    type: type || "monthly_tuition",
    month: month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    paidAt: status === "paid" ? (paidAt || new Date().toISOString().split("T")[0]) : undefined,
    paymentRef,
    paymentMethod: paymentMethod || "EFT",
    popFileName,
    popUrl,
    popUploadedAt: (popFileName || popUrl) ? new Date().toISOString().split("T")[0] : undefined,
    notes
  };

  if (type === "registration" && status === "paid") student.registrationFeePaid = true;
  if (type === "student_card" && status === "paid") student.studentCardPaid = true;

  db.invoices.push(newInvoice);
  saveDatabase(db);
  res.json(newInvoice);
});

// Trigger payment reminder (SMS / WhatsApp / Email simulated)
app.post("/api/finance/remind", (req, res) => {
  const { invoiceId, method } = req.body;
  const db = loadDatabase();

  const invoice = db.invoices.find((i: any) => i.id === invoiceId);
  if (!invoice) return res.status(404).json({ error: "Invoice not found" });

  const student = db.students.find((s: any) => s.id === invoice.studentId);
  const parentEmail = student ? "parent@gmail.com" : "guardian@gmail.com";

  const message = `Dear Parent/Guardian, this is an automated payment reminder from Virtuelle Academique Centre. There is an outstanding invoice ref ${invoice.id} for ${invoice.studentName} totaling R${invoice.amount} due on ${invoice.dueDate}. Please make payment to Standard Bank A/C 10233357759 using reference '${invoice.studentName}'. Thank you.`;

  const newReminder = {
    id: "rem-" + Math.random().toString(36).substr(2, 9),
    invoiceId,
    sentAt: new Date().toLocaleString(),
    method: method || "WhatsApp",
    message
  };

  db.paymentRemindersSent.push(newReminder);
  saveDatabase(db);

  res.json({
    success: true,
    reminder: newReminder,
    recipient: parentEmail
  });
});

app.get("/api/finance/reminders", (req, res) => {
  const db = loadDatabase();
  res.json(db.paymentRemindersSent || []);
});

// 6. Academic Endpoints
app.get("/api/academic/subjects", (req, res) => {
  const db = loadDatabase();
  res.json(db.subjects);
});

app.get("/api/academic/quizzes", (req, res) => {
  const db = loadDatabase();
  const subjectId = req.query.subjectId;
  let list = db.quizzes;
  if (subjectId) {
    list = list.filter((q: any) => q.subjectId === subjectId);
  }
  res.json(list);
});

app.get("/api/academic/teams-sessions", (req, res) => {
  const db = loadDatabase();
  res.json(db.teamsSessions);
});

app.post("/api/academic/teams-sessions", (req, res) => {
  const db = loadDatabase();
  const { subjectId, subjectName, grade, title, tutor, date, time, durationMinutes, joinUrl } = req.body;

  const newSession = {
    id: `teams-${Date.now()}`,
    subjectId: subjectId || "sub-eng",
    subjectName: subjectName || "English Home Language",
    grade: grade || "Grade 10",
    title: title || "Scheduled Live Tutoring Session",
    tutor: tutor || "Dr. Sarah Mitchell",
    date: date || new Date().toISOString().split("T")[0],
    time: time || "15:00",
    durationMinutes: Number(durationMinutes) || 60,
    joinUrl: joinUrl || `https://teams.microsoft.com/l/meetup-join/virtuelle-${Date.now()}`
  };

  db.teamsSessions.push(newSession);
  saveDatabase(db);
  res.json({ success: true, session: newSession });
});

app.delete("/api/academic/teams-sessions/:id", (req, res) => {
  const db = loadDatabase();
  const { id } = req.params;
  db.teamsSessions = db.teamsSessions.filter((s: any) => s.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: "Teams session deleted" });
});

// Quiz submissions
app.get("/api/academic/submissions", (req, res) => {
  const db = loadDatabase();
  const studentId = req.query.studentId;
  const quizId = req.query.quizId;

  let list = db.submissions;
  if (studentId) {
    list = list.filter((s: any) => s.studentId === studentId);
  }
  if (quizId) {
    list = list.filter((s: any) => s.quizId === quizId);
  }
  res.json(list);
});

app.post("/api/academic/submissions", (req, res) => {
  const { quizId, quizTitle, subjectId, studentId, studentName, answers } = req.body;
  const db = loadDatabase();

  const newSubmission = {
    id: "sub-" + Math.random().toString(36).substr(2, 9),
    quizId,
    quizTitle,
    subjectId,
    studentId,
    studentName,
    submittedAt: new Date().toISOString(),
    answers,
    status: "submitted"
  };

  db.submissions.push(newSubmission);
  saveDatabase(db);
  res.json(newSubmission);
});

app.post("/api/academic/submissions/:id/mark", (req, res) => {
  const { score, feedback } = req.body;
  const db = loadDatabase();

  const submission = db.submissions.find((s: any) => s.id === req.params.id);
  if (!submission) return res.status(404).json({ error: "Submission not found" });

  submission.status = "marked";
  submission.score = Number(score);
  submission.feedback = feedback;

  saveDatabase(db);
  res.json(submission);
});

// 7. GEMINI POWERED ENDPOINTS

// A. Gemini AI Auto-Review & Suggested Grading
app.post("/api/academic/submissions/:id/ai-review", async (req, res) => {
  const db = loadDatabase();
  const submission = db.submissions.find((s: any) => s.id === req.params.id);
  if (!submission) return res.status(404).json({ error: "Submission not found" });

  const quiz = db.quizzes.find((q: any) => q.id === submission.quizId);
  if (!quiz) return res.status(404).json({ error: "Quiz not found" });

  try {
    const ai = getGeminiClient();

    // Construct detailed prompt matching student submission with questions
    const questionText = quiz.questions
      .map((q: any, idx: number) => {
        const studentAns = submission.answers[q.id] || "No answer provided";
        const correctPart = q.correctAnswer ? ` (Correct Answer: ${q.correctAnswer})` : "";
        return `${idx + 1}. Question: "${q.question}" [Type: ${q.type}]${correctPart}\n   Student's Answer: "${studentAns}"`;
      })
      .join("\n\n");

    const prompt = `You are an expert educator and tutor at Virtuelle Academique Centre, an elite South African online school.
Evaluate the following student's test submission. Based on the questions and the student's answers, suggest a total score out of 100, generate encouraging academic feedback, and write concise explanations for any incorrect or text-based answers.

Test Title: "${quiz.title}"
Student Name: "${submission.studentName}"

Submission data:
${questionText}

Respond with a JSON object that has exactly these keys:
{
  "suggestedScore": number (out of 100),
  "recommendedFeedback": "string of encouraging, constructive feedback",
  "explanations": {
     "[questionId_1]": "brief explanation of correctness or how to improve",
     "[questionId_2]": "brief explanation..."
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedScore: { type: Type.INTEGER, description: "A suggested grade score between 0 and 100" },
            recommendedFeedback: { type: Type.STRING, description: "Constructive feedback text for the learner" },
            explanations: {
              type: Type.OBJECT,
              description: "Mapping of question IDs to educational feedback for each answer",
              properties: {} // Open properties
            }
          },
          required: ["suggestedScore", "recommendedFeedback", "explanations"]
        }
      }
    });

    const aiResultText = response.text;
    if (!aiResultText) {
      throw new Error("Empty response from Gemini");
    }

    const evaluation = JSON.parse(aiResultText.trim());
    submission.aiFeedback = evaluation;

    saveDatabase(db);
    res.json(evaluation);
  } catch (error: any) {
    console.error("Gemini AI Grading Error:", error);
    res.status(500).json({ error: "AI Review temporarily unavailable: " + error.message });
  }
});

// B. Gemini AI Interactive Quiz Generator
app.post("/api/academic/generate-quiz", async (req, res) => {
  const { subjectId, grade, topic } = req.body;
  const db = loadDatabase();

  const subject = db.subjects.find((s: any) => s.id === subjectId);
  const subjName = subject ? subject.name : "Selected Subject";

  try {
    const ai = getGeminiClient();

    const prompt = `You are a curriculum developer for Virtuelle Academique Centre.
Create a high-quality 3-question diagnostic assessment / test about the topic "${topic}" tailored for ${grade} in the subject "${subjName}".
Make 2 questions multiple-choice (with 4 realistic options and 1 clear correctAnswer) and 1 question open-ended text based.

Your response must be a JSON object matching this schema exactly:
{
  "title": "string (A creative and descriptive test title)",
  "description": "string (A description outlining what this test assesses)",
  "questions": [
    {
      "id": "string (e.g. q-1, q-2, q-3)",
      "question": "string (the question wording)",
      "type": "multiple-choice" or "text",
      "options": ["string", "string", "string", "string"] (include only if type is multiple-choice),
      "correctAnswer": "string" (must match exactly one of the options, include only if type is multiple-choice)
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  type: { type: Type.STRING, description: "either 'multiple-choice' or 'text'" },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.STRING }
                },
                required: ["id", "question", "type"]
              }
            }
          },
          required: ["title", "description", "questions"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");

    const quizData = JSON.parse(text.trim());
    const newQuizId = "q-ai-" + Math.random().toString(36).substr(2, 9);

    const fullQuiz = {
      id: newQuizId,
      title: quizData.title,
      subjectId: subjectId || "sub-eng",
      grade: grade || "Grade 10",
      description: quizData.description,
      questions: quizData.questions
    };

    db.quizzes.push(fullQuiz);
    saveDatabase(db);

    res.json(fullQuiz);
  } catch (error: any) {
    console.error("Gemini AI Quiz Generation Error:", error);
    res.status(500).json({ error: "AI Quiz Generation temporarily unavailable: " + error.message });
  }
});

// Server boot with Vite middleware
async function startServer() {
  // Setup Vite development server or static file serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Virtuelle Academique Centre server running on http://localhost:${PORT}`);
  });
}

startServer();

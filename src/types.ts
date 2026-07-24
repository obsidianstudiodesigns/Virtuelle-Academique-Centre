/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "student" | "admin" | "parent";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  grade: string;
  status: "pending" | "active" | "suspended" | "graduated";
  chosenSubjects: string[];
  enrolledDate?: string;
  parentId?: string;
  applicationFormSubmitted: boolean;
  documentsSubmitted: boolean;
  tuitionFee: number;
  registrationFeePaid: boolean;
  studentCardPaid: boolean;
}

export interface LearnerInfo {
  fullName: string;
  surname: string;
  nickname: string;
  dateOfBirth: string;
  idNumber: string;
  nationality: string;
  church: string;
  gender: string;
  homeLanguage: "Afrikaans" | "English" | "Other";
  homeLanguageOther?: string;
  preferredLanguage: string;
  cellphone: string;
  email: string;
  entryDate: string;
  gradeIn2025_2026: string;
}

export interface FamilyInfo {
  familyStatus: "Both Parents" | "Single Parent";
  guardianType: "Guardian" | "Childrens Home" | "Widow/er" | "Other";
  parentsPassed: ("Mother" | "Father" | "None")[];
}

export interface MedicalInfo {
  chronicIllness: string;
  allergies: string;
  medication: string;
  medicalAidInfo: string;
}

export interface ParentGuardianInfo {
  title: string;
  fullNames: string;
  surname: string;
  initials: string;
  nickname: string;
  idNumber: string;
  preferredLanguage: string;
  cellNumber: string;
  homeNumber: string;
  faxNumber: string;
  email: string;
  homeAddress: string;
  postalAddress: string;
  occupationStatus: string;
  occupation: string;
  employer: string;
  officeNumber: string;
  workAddress: string;
  livesWithParent: "Yes" | "No";
}

export interface AccountResponsibility {
  responsibleParty: "Parent 1" | "Parent 2" | "Other";
  otherType?: "Individual" | "Company/Trust";
  individualDetails?: {
    title: string;
    fullNames: string;
    surname: string;
    idNumber: string;
    homeLanguage: string;
    phone: string;
    email: string;
    address: string;
  };
  companyDetails?: {
    title: string;
    name: string;
    registrationNumber: string;
    language: string;
    contactNumber: string;
    faxNumber: string;
    email: string;
    businessAddress: string;
    postalAddress: string;
  };
}

export interface TuitionAgreement {
  parent1Name: string;
  parent2Name: string;
  monthlyAmount: number;
  penaltyAcknowledged: boolean;
  termsAccepted: boolean;
  parent1Signature: string;
  parent2Signature: string;
  date: string;
}

export interface ApplicationForm {
  learnerInfo: LearnerInfo;
  familyInfo: FamilyInfo;
  medicalInfo: MedicalInfo;
  nextOfKin: {
    name: string;
    contact: string;
    relationship: string;
  };
  parent1: ParentGuardianInfo;
  parent2?: ParentGuardianInfo;
  accountResponsibility: AccountResponsibility;
  tuitionAgreement: TuitionAgreement;
}

export interface UploadedDocument {
  id: string;
  studentId: string;
  name: string; // e.g. "Certified ID Copy"
  type: "id_parent" | "birth_certificate" | "report_card" | "proof_of_address" | "bank_statement" | "photo";
  status: "pending" | "verified" | "rejected";
  fileSize?: string;
  uploadedAt: string;
  rejectionReason?: string;
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  type: "registration" | "student_card" | "monthly_tuition" | "extra_mural";
  paidAt?: string;
  month?: string;
  popFileName?: string;
  popUrl?: string;
  popUploadedAt?: string;
  paymentRef?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface Subject {
  id: string;
  name: string;
  grade: string;
  description: string;
  modules: {
    id: string;
    title: string;
    description: string;
    resources: { name: string; url: string; type: "handbook" | "activity" | "video" }[];
  }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple-choice" | "text";
  options?: string[];
  correctAnswer?: string;
}

export interface Quiz {
  id: string;
  title: string;
  subjectId: string;
  grade: string;
  description: string;
  questions: QuizQuestion[];
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  quizTitle: string;
  subjectId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  answers: { [questionId: string]: string };
  status: "submitted" | "marked";
  score?: number; // e.g., out of 100
  feedback?: string;
  aiFeedback?: {
    suggestedScore: number;
    recommendedFeedback: string;
    explanations: { [questionId: string]: string };
  };
}

export interface TeamsSession {
  id: string;
  subjectId: string;
  subjectName: string;
  grade: string;
  title: string;
  date: string;
  time: string;
  tutorName?: string;
  tutor?: string;
  joinUrl: string;
}

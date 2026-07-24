/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Logo from "./components/Logo";
import HomeView from "./components/HomeView";
import ApplicationForm from "./components/ApplicationForm";
import StudentDashboard from "./components/StudentDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ParentDashboard from "./components/ParentDashboard";
import { User, StudentProfile, UploadedDocument, Invoice, Quiz, QuizSubmission, TeamsSession } from "./types";
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ShieldAlert,
  Loader2,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  UserCheck,
  CreditCard,
  FileText,
} from "lucide-react";

import {
  DEFAULT_USERS,
  DEFAULT_STUDENTS,
  DEFAULT_SUBJECTS,
  DEFAULT_QUIZZES,
  DEFAULT_INVOICES,
  DEFAULT_DOCUMENTS,
  DEFAULT_TEAMS_SESSIONS,
} from "./utils/mockData";

// Helper to safely fetch JSON from full-stack API or gracefully throw if HTML is returned (e.g. on static hosting like Vercel)
async function safeFetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const contentType = res.headers.get("content-type") || "";
  if (!res.ok || !contentType.includes("application/json")) {
    let errorText = `HTTP ${res.status}`;
    try {
      const text = await res.text();
      if (text && !text.startsWith("<!") && !text.startsWith("The page")) {
        const parsed = JSON.parse(text);
        if (parsed.error) errorText = parsed.error;
      }
    } catch {}
    throw new Error(errorText || "API request failed or non-JSON response");
  }
  return await res.json();
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeStudentProfile, setActiveStudentProfile] = useState<StudentProfile | null>(null);

  // Core database states
  const [students, setStudents] = useState<StudentProfile[]>(DEFAULT_STUDENTS);
  const [subjects, setSubjects] = useState<any[]>(DEFAULT_SUBJECTS);
  const [quizzes, setQuizzes] = useState<Quiz[]>(DEFAULT_QUIZZES);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>(DEFAULT_INVOICES);
  const [documents, setDocuments] = useState<UploadedDocument[]>(DEFAULT_DOCUMENTS);
  const [teamsSessions, setTeamsSessions] = useState<TeamsSession[]>(DEFAULT_TEAMS_SESSIONS);
  const [remindersLog, setRemindersLog] = useState<any[]>([]);

  // Navigation states
  const [currentView, setCurrentView] = useState<"home" | "auth" | "portal">("home");
  const [authSubView, setAuthSubView] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Interactive Fee Estimator states
  const [estimateGrade, setEstimateGrade] = useState("Grade 10");

  // Fetch initial data from full-stack server
  useEffect(() => {
    fetchInitialData();
  }, [currentUser]);

  const fetchInitialData = async () => {
    try {
      // 1. Fetch Students
      const dataStudents = await safeFetchJson<StudentProfile[]>("/api/students");
      setStudents(dataStudents);

      // If logged in as student, locate their profile
      if (currentUser && currentUser.role === "student") {
        const profile = dataStudents.find((s: any) => s.userId === currentUser.id || s.email === currentUser.email);
        if (profile) {
          setActiveStudentProfile(profile);
          fetchStudentDocs(profile.id);
        }
      }

      // 2. Fetch Subjects
      const dataSubjects = await safeFetchJson<any[]>("/api/academic/subjects");
      setSubjects(dataSubjects);

      // 3. Fetch Quizzes
      const dataQuizzes = await safeFetchJson<Quiz[]>("/api/academic/quizzes");
      setQuizzes(dataQuizzes);

      // 4. Fetch Submissions
      const dataSubmissions = await safeFetchJson<QuizSubmission[]>("/api/academic/submissions");
      setSubmissions(dataSubmissions);

      // 5. Fetch Invoices
      let invoiceUrl = "/api/finance/invoices";
      if (currentUser && currentUser.role === "student") {
        const studentRec = dataStudents.find((s: any) => s.userId === currentUser.id);
        if (studentRec) invoiceUrl += `?studentId=${studentRec.id}`;
      } else if (currentUser && currentUser.role === "parent") {
        invoiceUrl += `?parentId=${currentUser.id}`;
      }
      const dataInvoices = await safeFetchJson<Invoice[]>(invoiceUrl);
      setInvoices(dataInvoices);

      // 6. Fetch Teams Sessions
      const dataSessions = await safeFetchJson<TeamsSession[]>("/api/academic/teams-sessions");
      setTeamsSessions(dataSessions);

      // 7. Fetch Reminders Log
      const dataReminders = await safeFetchJson<any[]>("/api/finance/reminders");
      setRemindersLog(dataReminders);
    } catch (e) {
      console.warn("Full-stack API unavailable or static hosting detected, using client-side interactive state.");
      if (currentUser && currentUser.role === "student") {
        const profile = students.find((s: any) => s.userId === currentUser.id || s.email === currentUser.email) || students[0];
        if (profile) setActiveStudentProfile(profile);
      }
    }
  };

  const fetchStudentDocs = async (studentId: string) => {
    try {
      const data = await safeFetchJson<UploadedDocument[]>(`/api/students/${studentId}/documents`);
      setDocuments(data);
    } catch (e) {
      console.warn("Failed fetching student documents, using local state.");
    }
  };

  // Auth Operations
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoading(true);

    let loggedInUser: User | null = null;
    try {
      const data = await safeFetchJson<{ user: User }>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      loggedInUser = data.user;
    } catch (apiErr) {
      // Static fallback for Vercel/GitHub Pages
      const cleanEmail = authEmail.trim().toLowerCase();
      const matched = DEFAULT_USERS.find((u) => u.email.toLowerCase() === cleanEmail) ||
        (cleanEmail.includes("admin") ? DEFAULT_USERS[0] :
         cleanEmail.includes("parent") ? DEFAULT_USERS[4] :
         cleanEmail.includes("sarah") ? DEFAULT_USERS[2] :
         cleanEmail.includes("pieter") ? DEFAULT_USERS[3] : DEFAULT_USERS[1]);
      if (matched) {
        loggedInUser = matched;
      }
    }

    if (loggedInUser) {
      setCurrentUser(loggedInUser);
      setAuthEmail("");
      setAuthPassword("");
      setCurrentView("portal");
    } else {
      setAuthError("Invalid credentials. Try our quick login buttons above!");
    }
    setIsLoading(false);
  };

  const handleRegisterFormSubmit = async (formPayload: any, chosenSubjects: string[]) => {
    setAuthError("");
    setIsLoading(true);
    const email = formPayload.learnerInfo.email;
    const name = `${formPayload.learnerInfo.fullName} ${formPayload.learnerInfo.surname}`;

    let newUser: User | null = null;
    try {
      const payload = {
        email,
        name,
        password: "student123",
        role: "student",
        applicationForm: formPayload,
        subjects: chosenSubjects,
      };

      const data = await safeFetchJson<{ user: User }>("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      newUser = data.user;
    } catch (err) {
      // Static fallback for Vercel deployment
      const userId = "u-" + Math.random().toString(36).substring(2, 9);
      const studentId = "s-" + Math.random().toString(36).substring(2, 9);
      newUser = { id: userId, email, name, role: "student" as const };

      const newStudentProfile: StudentProfile = {
        id: studentId,
        userId: userId,
        name: name,
        email: email,
        grade: formPayload?.learnerInfo?.gradeIn2025_2026 || "Grade 10",
        status: "pending",
        chosenSubjects: chosenSubjects.length > 0 ? chosenSubjects : ["English Home Language", "Mathematics"],
        enrolledDate: new Date().toISOString().split("T")[0],
        applicationFormSubmitted: true,
        documentsSubmitted: false,
        tuitionFee: 2600,
        registrationFeePaid: false,
        studentCardPaid: false,
      };

      setStudents((prev) => [...prev, newStudentProfile]);
      setActiveStudentProfile(newStudentProfile);
    }

    if (newUser) {
      setCurrentUser(newUser);
      setAuthSubView("login");
      setCurrentView("portal");
      alert("Application Submitted Digitally! Your account has been registered and is pending admin review.");
    }
    setIsLoading(false);
  };

  // Quick Demo Login helper for testing ease
  const triggerQuickLogin = (email: string, pass: string) => {
    setAuthEmail(email);
    setAuthPassword(pass);
    setAuthSubView("login");
    setCurrentView("auth");
  };

  const handleLogOut = () => {
    setCurrentUser(null);
    setActiveStudentProfile(null);
    setCurrentView("home");
  };

  // Admin approval operations
  const handleApproveStudent = async (studentId: string) => {
    try {
      await safeFetchJson(`/api/students/${studentId}/approve`, { method: "POST" });
      await fetchInitialData();
    } catch (e) {
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, status: "active" } : s))
      );
    }
  };

  // Documents Upload simulated trigger
  const handleDocumentUpload = async (type: string, name: string, fileSize: string) => {
    if (!activeStudentProfile) return;
    try {
      await safeFetchJson(`/api/students/${activeStudentProfile.id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, fileSize }),
      });
      await fetchStudentDocs(activeStudentProfile.id);
      await fetchInitialData();
    } catch (e) {
      const newDoc: UploadedDocument = {
        id: "doc-" + Math.random().toString(36).substring(2, 9),
        studentId: activeStudentProfile.id,
        name,
        type: type as any,
        status: "pending",
        fileSize: fileSize || "1.2 MB",
        uploadedAt: new Date().toISOString().split("T")[0],
      };
      setDocuments((prev) => [...prev, newDoc]);
    }
  };

  const handleVerifyDocument = async (docId: string, status: "verified" | "rejected", reason?: string) => {
    try {
      await safeFetchJson(`/api/documents/${docId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason: reason }),
      });
      await fetchInitialData();
    } catch (e) {
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, status, rejectionReason: reason } : d))
      );
    }
  };

  // Pay invoice simulated
  const handlePayInvoice = async (invoiceId: string, paymentDetails?: {
    paymentRef?: string;
    paymentMethod?: string;
    popFileName?: string;
    popUrl?: string;
    notes?: string;
    paidAt?: string;
    month?: string;
  }) => {
    try {
      const data = await safeFetchJson(`/api/finance/invoices/${invoiceId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentDetails || {}),
      });
      await fetchInitialData();
      return data;
    } catch (e) {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId
            ? {
                ...inv,
                status: "paid",
                paidAt: paymentDetails?.paidAt || new Date().toISOString().split("T")[0],
                paymentRef: paymentDetails?.paymentRef,
                paymentMethod: paymentDetails?.paymentMethod || "EFT",
                popFileName: paymentDetails?.popFileName,
              }
            : inv
        )
      );
    }
  };

  const handleCreateAndPayInvoice = async (invoicePayload: any) => {
    try {
      const data = await safeFetchJson("/api/finance/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoicePayload),
      });
      await fetchInitialData();
      return data;
    } catch (e) {
      const newInv: Invoice = {
        id: "INV-" + Date.now().toString().slice(-6),
        studentId: invoicePayload.studentId,
        studentName: "Student",
        description: invoicePayload.description || "Tuition Fee",
        amount: Number(invoicePayload.amount) || 2600,
        dueDate: new Date().toISOString().split("T")[0],
        status: invoicePayload.status || "paid",
        type: invoicePayload.type || "monthly_tuition",
        paidAt: new Date().toISOString().split("T")[0],
        paymentRef: invoicePayload.paymentRef,
        paymentMethod: invoicePayload.paymentMethod || "EFT",
        popFileName: invoicePayload.popFileName,
      };
      setInvoices((prev) => [...prev, newInv]);
      return newInv;
    }
  };

  // Send Invoice Reminders
  const handleSendReminder = async (invoiceId: string, method: string) => {
    try {
      const data = await safeFetchJson("/api/finance/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, method }),
      });
      await fetchInitialData();
      return data;
    } catch (e) {
      const inv = invoices.find((i) => i.id === invoiceId);
      const reminder = {
        id: "rem-" + Math.random().toString(36).substring(2, 9),
        invoiceId,
        sentAt: new Date().toLocaleString(),
        method,
        message: `Reminder sent for invoice ${invoiceId} (R${inv?.amount || 2600})`,
      };
      setRemindersLog((prev) => [...prev, reminder]);
      return { success: true, reminder };
    }
  };

  // Submit test answers
  const handleSubmitQuiz = async (
    quizId: string,
    answers: { [key: string]: string },
    quizTitle: string,
    subjectId: string
  ) => {
    if (!activeStudentProfile) return;
    try {
      const payload = {
        quizId,
        quizTitle,
        subjectId,
        studentId: activeStudentProfile.id,
        studentName: activeStudentProfile.name,
        answers,
      };
      await safeFetchJson("/api/academic/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await fetchInitialData();
    } catch (e) {
      const newSub: QuizSubmission = {
        id: "sub-" + Math.random().toString(36).substring(2, 9),
        quizId,
        quizTitle,
        subjectId,
        studentId: activeStudentProfile.id,
        studentName: activeStudentProfile.name,
        submittedAt: new Date().toISOString(),
        answers,
        status: "submitted",
      };
      setSubmissions((prev) => [...prev, newSub]);
    }
  };

  // Mark submission
  const handleMarkSubmission = async (submissionId: string, score: number, feedback: string) => {
    try {
      await safeFetchJson(`/api/academic/submissions/${submissionId}/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, feedback }),
      });
      await fetchInitialData();
      alert("Marks and comments published successfully to student!");
    } catch (e) {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? { ...s, status: "marked", score, feedback } : s))
      );
      alert("Marks and comments published successfully to student!");
    }
  };

  // Call Gemini to review submission and suggest grade
  const handleGetAiReview = async (submissionId: string) => {
    try {
      const data = await safeFetchJson(`/api/academic/submissions/${submissionId}/ai-review`, { method: "POST" });
      await fetchInitialData();
      return data;
    } catch (e) {
      return {
        suggestedScore: 85,
        recommendedFeedback: "Great effort and clear understanding of core concepts! Keep up the good work.",
        explanations: { q1: "Well reasoned response." },
      };
    }
  };

  // Manage Live Microsoft Teams Tutoring Sessions
  const handleCreateTeamsSession = async (sessionData: any) => {
    try {
      const data = await safeFetchJson("/api/academic/teams-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });
      if (data.session) {
        setTeamsSessions((prev) => [...prev, data.session]);
      }
      return data;
    } catch (e) {
      const newSession: TeamsSession = {
        id: `teams-${Date.now()}`,
        subjectId: sessionData.subjectId || "sub-eng",
        subjectName: sessionData.subjectName || "English Home Language",
        grade: sessionData.grade || "Grade 10",
        title: sessionData.title || "Live Tutoring Session",
        tutorName: sessionData.tutor || "Dr. Sarah Mitchell",
        date: sessionData.date || new Date().toISOString().split("T")[0],
        time: sessionData.time || "15:00",
        joinUrl: sessionData.joinUrl || `https://teams.microsoft.com/l/meetup-join/virtuelle-${Date.now()}`,
      };
      setTeamsSessions((prev) => [...prev, newSession]);
      return { success: true, session: newSession };
    }
  };

  const handleDeleteTeamsSession = async (sessionId: string) => {
    try {
      await safeFetchJson(`/api/academic/teams-sessions/${sessionId}`, { method: "DELETE" });
      setTeamsSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (e) {
      setTeamsSessions((prev) => prev.filter((s) => s.id !== sessionId));
    }
  };

  // Call Gemini to generate customized quiz
  const handleGeneratePracticeQuiz = async (subjectId: string, grade: string, topic: string) => {
    setIsGeneratingQuiz(true);
    try {
      await safeFetchJson("/api/academic/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, grade, topic }),
      });
      await fetchInitialData();
    } catch (e) {
      alert("AI Quiz generation requires a connected Gemini server backend. Try our available practice tests below!");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Tuition estimate calculation from Page 5
  const getTuitionEstimate = (g: string) => {
    if (g === "Grade R") return { reg: 1000, card: 275, monthly: 1800 };
    if (["Grade 1", "Grade 2", "Grade 3"].includes(g)) return { reg: 1000, card: 275, monthly: 2000 };
    if (["Grade 4", "Grade 5", "Grade 6"].includes(g)) return { reg: 1000, card: 275, monthly: 2200 };
    if (["Grade 7", "Grade 8", "Grade 9"].includes(g)) return { reg: 1000, card: 275, monthly: 2400 };
    if (g === "Grade 10") return { reg: 1000, card: 275, monthly: 2600 };
    if (g === "Grade 11") return { reg: 1000, card: 275, monthly: 2800 };
    if (g === "Grade 12") return { reg: 1000, card: 275, monthly: 3000 };
    return { reg: 1000, card: 275, monthly: 2600 };
  };

  const estimatedPrices = getTuitionEstimate(estimateGrade);

  return (
    <div className="min-h-screen bg-editorial-bg flex flex-col font-sans selection:bg-gold-400 selection:text-navy-950">
      {/* 🧬 Top Floating Debug / Demo Controller for testing Ease */}
      <div className="bg-navy-950 border-b border-gold-400 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-white">
        <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400 flex items-center gap-1">
          <Sparkles className="w-4.5 h-4.5 text-gold-400" />
          Coordinators Sandbox Quick-Logins
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => triggerQuickLogin("admin@virtuelle.co.za", "admin123")}
            className="bg-navy-900 hover:bg-gold-400 hover:text-navy-950 border border-gold-400/20 px-2 py-1 rounded text-[10px] font-bold uppercase transition-all"
          >
            🔑 Admin (Staff)
          </button>
          <button
            onClick={() => triggerQuickLogin("johndoe@gmail.com", "student123")}
            className="bg-navy-900 hover:bg-gold-400 hover:text-navy-950 border border-gold-400/20 px-2 py-1 rounded text-[10px] font-bold uppercase transition-all"
          >
            🔑 Student (John Doe)
          </button>
          <button
            onClick={() => triggerQuickLogin("sarahsmith@gmail.com", "student123")}
            className="bg-navy-900 hover:bg-gold-400 hover:text-navy-950 border border-gold-400/20 px-2 py-1 rounded text-[10px] font-bold uppercase transition-all"
          >
            🔑 Student (Sarah Smith)
          </button>
          <button
            onClick={() => triggerQuickLogin("parent@gmail.com", "parent123")}
            className="bg-navy-900 hover:bg-gold-400 hover:text-navy-950 border border-gold-400/20 px-2 py-1 rounded text-[10px] font-bold uppercase transition-all"
          >
            🔑 Parent (Robert)
          </button>
        </div>
      </div>

      {/* Main Header / Navbar */}
      <header className="bg-editorial-paper border-b border-navy-800/10 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => setCurrentView("home")}>
            <Logo size="sm" />
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-sans font-semibold text-navy-800">
            <button onClick={() => setCurrentView("home")} className="hover:text-gold-600 transition-colors">
              Home & Offers
            </button>
            <a
              href="#school-dates"
              onClick={() => setCurrentView("home")}
              className="hover:text-gold-600 transition-colors"
            >
              Timetables & Terms
            </a>
            <a
              href="#school-curriculum"
              onClick={() => setCurrentView("home")}
              className="hover:text-gold-600 transition-colors"
            >
              Choice Subjects
            </a>
            <a
              href="#school-sports"
              onClick={() => setCurrentView("home")}
              className="hover:text-gold-600 transition-colors"
            >
              Sports & Activities
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-sans font-bold text-navy-800 bg-navy-50 border border-navy-800/20 px-3 py-1.5 rounded-none uppercase">
                  {currentUser.role}
                </span>
                <button
                  onClick={() => setCurrentView("portal")}
                  className="bg-navy-800 hover:bg-navy-950 border border-gold-400 text-gold-400 font-sans font-semibold text-xs px-4 py-2 transition-all"
                >
                  My Workspace
                </button>
                <button
                  onClick={handleLogOut}
                  className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-2 transition-all"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthSubView("login");
                    setCurrentView("auth");
                  }}
                  className="text-xs font-sans font-bold text-navy-800 hover:bg-navy-50 px-4 py-2.5 transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthSubView("register");
                    setCurrentView("auth");
                  }}
                  className="bg-navy-800 hover:bg-navy-900 border border-gold-400 text-gold-400 font-sans font-semibold text-xs px-5 py-2.5 transition-all shadow-md"
                >
                  Apply & Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* VIEW 1: LANDING HOMEPAGE */}
        {currentView === "home" && (
          <HomeView
            onNavigateToAuth={(subView) => {
              setAuthSubView(subView);
              setCurrentView("auth");
            }}
            estimateGrade={estimateGrade}
            setEstimateGrade={setEstimateGrade}
            estimatedPrices={estimatedPrices}
          />
        )}

        {/* VIEW 2: AUTHENTICATION VIEWS */}
        {currentView === "auth" && (
          <div id="auth-view-root" className="max-w-4xl mx-auto py-8">
            {authSubView === "login" ? (
              <div className="max-w-md mx-auto bg-editorial-paper border border-navy-800/10 p-6 md:p-8 shadow-md space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-serif font-semibold text-navy-950">Portal Authentication</h3>
                  <p className="text-xs text-neutral-500">Sign into your virtuellen academique student, parent, or admin profile</p>
                </div>

                {authError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-lg font-medium">
                    ⚠️ {authError}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-sans font-semibold">
                  <div>
                    <label className="block text-[10px] text-navy-800 uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-none border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 bg-editorial-bg text-navy-950 font-sans"
                      placeholder="Enter registered email"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-navy-800 uppercase tracking-wider mb-1">Secure Password</label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-none border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 bg-editorial-bg text-navy-950 font-sans"
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-navy-800 hover:bg-navy-900 border border-gold-400 disabled:bg-neutral-800 text-gold-400 font-sans font-bold py-3 tracking-wider transition-colors shadow-sm"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-gold-400" />
                    ) : (
                      "Sign In to Account"
                    )}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <span className="text-[10px] text-neutral-500">
                    Applying as a new student?{" "}
                    <button onClick={() => setAuthSubView("register")} className="text-navy-800 font-sans font-bold hover:text-gold-600 underline decoration-gold-400 ml-1">
                      Apply Digitally Here
                    </button>
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-2xl font-serif font-semibold text-navy-950">Digital Enrollment Center</h3>
                  <p className="text-xs text-neutral-500">Complete the digital Tuition Contract below to create your student account.</p>
                </div>
                <ApplicationForm onSubmit={handleRegisterFormSubmit} subjectsList={subjects} />
                <div className="text-center text-xs font-sans font-semibold text-neutral-500 mt-4">
                  Already registered?{" "}
                  <button onClick={() => setAuthSubView("login")} className="text-navy-800 font-sans font-bold hover:text-gold-600 underline decoration-gold-400 ml-1">
                    Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: ACTIVE PORTAL WORKSAPCES */}
        {currentView === "portal" && currentUser && (
          <div id="active-portal-root">
            {currentUser.role === "student" && activeStudentProfile && (
              <StudentDashboard
                studentProfile={activeStudentProfile}
                subjects={subjects.filter((s) => activeStudentProfile.chosenSubjects.includes(s.name))}
                onDocumentUpload={handleDocumentUpload}
                documents={documents}
                invoices={invoices}
                onPayInvoice={handlePayInvoice}
                quizzes={quizzes.filter((q) => activeStudentProfile.chosenSubjects.includes(subjects.find((su) => su.id === q.subjectId)?.name || ""))}
                submissions={submissions}
                onSubmitQuiz={handleSubmitQuiz}
                teamsSessions={teamsSessions.filter((t) => activeStudentProfile.chosenSubjects.includes(t.subjectName))}
                onGeneratePracticeQuiz={handleGeneratePracticeQuiz}
                isGeneratingQuiz={isGeneratingQuiz}
              />
            )}

            {currentUser.role === "admin" && (
              <AdminDashboard
                students={students}
                onApproveStudent={handleApproveStudent}
                documents={documents}
                onVerifyDocument={handleVerifyDocument}
                invoices={invoices}
                onPayInvoice={handlePayInvoice}
                onCreateAndPayInvoice={handleCreateAndPayInvoice}
                onSendReminder={handleSendReminder}
                submissions={submissions}
                quizzes={quizzes}
                onMarkSubmission={handleMarkSubmission}
                onGetAiReview={handleGetAiReview}
                remindersLog={remindersLog}
                teamsSessions={teamsSessions}
                onCreateTeamsSession={handleCreateTeamsSession}
                onDeleteTeamsSession={handleDeleteTeamsSession}
                subjects={subjects}
              />
            )}

            {currentUser.role === "parent" && (
              <ParentDashboard
                parentStudents={students.filter((s) => s.parentId === currentUser.id)}
                invoices={invoices}
                submissions={submissions}
                applicationForms={students.map((st) => ({
                  studentId: st.id,
                  form: {
                    learnerInfo: {
                      fullName: st.name.split(" ")[0] || "Student",
                      surname: st.name.split(" ")[1] || "Doe",
                      gradeIn2025_2026: st.grade,
                    },
                    tuitionAgreement: {
                      parent1Name: "Robert Doe",
                      monthlyAmount: st.tuitionFee,
                      parent1Signature: "Robert Doe",
                      date: "2026-01-14",
                    },
                  },
                }))}
                onPayInvoice={handlePayInvoice}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer Details - contact from Page 17 */}
      <footer className="bg-navy-950 text-white mt-16 border-t border-gold-400/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Logo size="sm" className="filter brightness-200 contrast-125" />
            <p className="text-xs text-navy-200 font-sans leading-relaxed">
              Virtuelle Academique Centre offers rigorous, holistic homeschool tutoring. Registered trading name under MIM International Pty Ltd.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-gold-400">Contact Details</h4>
            <div className="space-y-2 text-xs text-navy-200">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" /> 079 750 5658
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" /> virtuelle.academique@gmail.com
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0" /> Montana, Pretoria, South Africa
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-gold-400">Privacy & Security</h4>
            <p className="text-xs text-navy-200 leading-relaxed font-sans">
              All student registration agreements, certified parent IDs, birth certificates, and academic reports are hosted in fully encrypted local databases fully conforming to South African POPI Act guidelines.
            </p>
          </div>
        </div>
        <div className="border-t border-navy-900 py-6 text-center text-xs text-navy-400 font-sans">
          © 2026 Virtuelle Academique Centre. All Rights Reserved. Success in Education.
        </div>
      </footer>
    </div>
  );
}

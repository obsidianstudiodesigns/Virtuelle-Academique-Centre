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

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeStudentProfile, setActiveStudentProfile] = useState<StudentProfile | null>(null);

  // Core database states
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [teamsSessions, setTeamsSessions] = useState<TeamsSession[]>([]);
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
      const resStudents = await fetch("/api/students");
      const dataStudents = await resStudents.json();
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
      const resSubjects = await fetch("/api/academic/subjects");
      setSubjects(await resSubjects.json());

      // 3. Fetch Quizzes
      const resQuizzes = await fetch("/api/academic/quizzes");
      setQuizzes(await resQuizzes.json());

      // 4. Fetch Submissions
      const resSubmissions = await fetch("/api/academic/submissions");
      setSubmissions(await resSubmissions.json());

      // 5. Fetch Invoices
      let invoiceUrl = "/api/finance/invoices";
      if (currentUser && currentUser.role === "student") {
        const studentRec = dataStudents.find((s: any) => s.userId === currentUser.id);
        if (studentRec) invoiceUrl += `?studentId=${studentRec.id}`;
      } else if (currentUser && currentUser.role === "parent") {
        invoiceUrl += `?parentId=${currentUser.id}`;
      }
      const resInvoices = await fetch(invoiceUrl);
      setInvoices(await resInvoices.json());

      // 6. Fetch Teams Sessions
      const resSessions = await fetch("/api/academic/teams-sessions");
      setTeamsSessions(await resSessions.json());

      // 7. Fetch Reminders Log
      const resReminders = await fetch("/api/finance/reminders");
      setRemindersLog(await resReminders.json());
    } catch (e) {
      console.warn("Full-stack APIs not fully loaded or compiling, fallback to local simulated states", e);
    }
  };

  const fetchStudentDocs = async (studentId: string) => {
    try {
      const res = await fetch(`/api/students/${studentId}/documents`);
      setDocuments(await res.json());
    } catch (e) {
      console.warn("Failed fetching student documents.");
    }
  };

  // Auth Operations
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      setCurrentUser(data.user);
      setAuthEmail("");
      setAuthPassword("");
      setCurrentView("portal");
    } catch (err: any) {
      setAuthError(err.message || "Invalid credentials. Try our quick login options!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterFormSubmit = async (formPayload: any, chosenSubjects: string[]) => {
    setAuthError("");
    setIsLoading(true);
    try {
      const payload = {
        email: formPayload.learnerInfo.email,
        name: `${formPayload.learnerInfo.fullName} ${formPayload.learnerInfo.surname}`,
        password: "student123", // default credentials
        role: "student",
        applicationForm: formPayload,
        subjects: chosenSubjects,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setCurrentUser(data.user);
      setAuthSubView("login");
      setCurrentView("portal");
      alert("Application Submitted Digitally! Your account has been registered and pending admin review.");
    } catch (err: any) {
      setAuthError(err.message || "Failed to submit digital contract.");
    } finally {
      setIsLoading(false);
    }
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
      const res = await fetch(`/api/students/${studentId}/approve`, { method: "POST" });
      if (res.ok) {
        await fetchInitialData();
      }
    } catch (e) {
      console.error("Failed to approve student", e);
    }
  };

  // Documents Upload simulated trigger
  const handleDocumentUpload = async (type: string, name: string, fileSize: string) => {
    if (!activeStudentProfile) return;
    try {
      const res = await fetch(`/api/students/${activeStudentProfile.id}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, fileSize }),
      });
      if (res.ok) {
        await fetchStudentDocs(activeStudentProfile.id);
        await fetchInitialData();
      }
    } catch (e) {
      console.error("Failed document uploads");
    }
  };

  const handleVerifyDocument = async (docId: string, status: "verified" | "rejected", reason?: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason: reason }),
      });
      if (res.ok) {
        await fetchInitialData();
      }
    } catch (e) {
      console.error("Failed document verification");
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
      const res = await fetch(`/api/finance/invoices/${invoiceId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentDetails || {}),
      });
      if (res.ok) {
        await fetchInitialData();
        return await res.json();
      }
    } catch (e) {
      console.error("Failed processing invoice payments", e);
    }
  };

  const handleCreateAndPayInvoice = async (invoicePayload: any) => {
    try {
      const res = await fetch("/api/finance/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoicePayload),
      });
      if (res.ok) {
        await fetchInitialData();
        return await res.json();
      }
    } catch (e) {
      console.error("Failed creating invoice/payment record", e);
    }
  };

  // Send Invoice Reminders
  const handleSendReminder = async (invoiceId: string, method: string) => {
    const res = await fetch("/api/finance/remind", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId, method }),
    });
    const data = await res.json();
    await fetchInitialData();
    return data;
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
      const res = await fetch("/api/academic/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchInitialData();
      }
    } catch (e) {
      console.error("Failed to submit test");
    }
  };

  // Mark submission
  const handleMarkSubmission = async (submissionId: string, score: number, feedback: string) => {
    try {
      const res = await fetch(`/api/academic/submissions/${submissionId}/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, feedback }),
      });
      if (res.ok) {
        await fetchInitialData();
        alert("Marks and comments published successfully to student!");
      }
    } catch (e) {
      console.error("Failed to mark test");
    }
  };

  // Call Gemini to review submission and suggest grade
  const handleGetAiReview = async (submissionId: string) => {
    const res = await fetch(`/api/academic/submissions/${submissionId}/ai-review`, { method: "POST" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Gemini evaluated failed.");
    }
    const data = await res.json();
    await fetchInitialData();
    return data;
  };

  // Manage Live Microsoft Teams Tutoring Sessions
  const handleCreateTeamsSession = async (sessionData: any) => {
    try {
      const res = await fetch("/api/academic/teams-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });
      const data = await res.json();
      if (data.session) {
        setTeamsSessions((prev) => [...prev, data.session]);
      }
      return data;
    } catch (e) {
      console.error("Failed to create Teams session", e);
    }
  };

  const handleDeleteTeamsSession = async (sessionId: string) => {
    try {
      await fetch(`/api/academic/teams-sessions/${sessionId}`, { method: "DELETE" });
      setTeamsSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (e) {
      console.error("Failed to delete Teams session", e);
    }
  };

  // Call Gemini to generate customized quiz
  const handleGeneratePracticeQuiz = async (subjectId: string, grade: string, topic: string) => {
    setIsGeneratingQuiz(true);
    try {
      const res = await fetch("/api/academic/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, grade, topic }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gemini failed to generate quiz");
      }
      await fetchInitialData();
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

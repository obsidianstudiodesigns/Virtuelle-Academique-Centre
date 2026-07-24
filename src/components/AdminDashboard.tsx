/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { StudentProfile, UploadedDocument, Invoice, QuizSubmission, Quiz, TeamsSession } from "../types";
import {
  Users,
  FileCheck,
  CreditCard,
  Check,
  X,
  AlertTriangle,
  Send,
  Sparkles,
  Loader2,
  Bookmark,
  MessageSquare,
  CheckCircle,
  Video,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  UserCheck,
  ArrowLeft,
  FileText,
  Upload,
  Paperclip,
  Eye,
  Search,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Download,
  User,
  Filter,
} from "lucide-react";

interface AdminDashboardProps {
  students: StudentProfile[];
  onApproveStudent: (studentId: string) => void;
  documents: UploadedDocument[];
  onVerifyDocument: (docId: string, status: "verified" | "rejected", reason?: string) => void;
  invoices: Invoice[];
  onPayInvoice: (invoiceId: string, paymentDetails?: any) => void;
  onCreateAndPayInvoice?: (payload: any) => Promise<any>;
  onSendReminder: (invoiceId: string, method: string) => Promise<any>;
  submissions: QuizSubmission[];
  quizzes: Quiz[];
  onMarkSubmission: (submissionId: string, score: number, feedback: string) => void;
  onGetAiReview: (submissionId: string) => Promise<any>;
  remindersLog: any[];
  teamsSessions?: TeamsSession[];
  onCreateTeamsSession?: (session: any) => Promise<any>;
  onDeleteTeamsSession?: (sessionId: string) => Promise<any>;
  subjects?: any[];
}

export default function AdminDashboard({
  students,
  onApproveStudent,
  documents,
  onVerifyDocument,
  invoices,
  onPayInvoice,
  onCreateAndPayInvoice,
  onSendReminder,
  submissions,
  quizzes,
  onMarkSubmission,
  onGetAiReview,
  remindersLog,
  teamsSessions = [],
  onCreateTeamsSession,
  onDeleteTeamsSession,
  subjects = [],
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"enrollments" | "grading" | "finance" | "teams">("enrollments");

  // Selection states
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<QuizSubmission | null>(null);

  // Marking inputs
  const [inputScore, setInputScore] = useState<string>("");
  const [inputFeedback, setInputFeedback] = useState<string>("");
  const [isAiEvaluating, setIsAiEvaluating] = useState<boolean>(false);

  // Finance Section state
  const [selectedFinanceStudentId, setSelectedFinanceStudentId] = useState<string | null>(null);
  const [financeSearchQuery, setFinanceSearchQuery] = useState<string>("");
  const [reminderMethod, setReminderMethod] = useState<{ [invId: string]: string }>({});
  const [isSendingReminder, setIsSendingReminder] = useState<{ [invId: string]: boolean }>({});
  const [reminderSuccessText, setReminderSuccessText] = useState<string>("");

  // Mark Payment Received with POP Modal state
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [payModalInvoiceId, setPayModalInvoiceId] = useState<string | null>(null);
  const [payModalStudentId, setPayModalStudentId] = useState<string>("");
  const [payModalMonth, setPayModalMonth] = useState<string>("July 2026 Monthly Tuition");
  const [payModalAmount, setPayModalAmount] = useState<number>(2600);
  const [payModalRef, setPayModalRef] = useState<string>("");
  const [payModalMethod, setPayModalMethod] = useState<string>("EFT");
  const [payModalDate, setPayModalDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [payModalPopFileName, setPayModalPopFileName] = useState<string>("");
  const [payModalPopUrl, setPayModalPopUrl] = useState<string>("");
  const [payModalNotes, setPayModalNotes] = useState<string>("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState<boolean>(false);

  // View POP document modal state
  const [viewPopInvoice, setViewPopInvoice] = useState<Invoice | null>(null);

  // Payment modal handlers
  const openPaymentModal = (studentId?: string, invoice?: Invoice) => {
    const sId = studentId || (students.length > 0 ? students[0].id : "");
    const student = students.find((s) => s.id === sId);

    setPayModalStudentId(sId);
    if (invoice) {
      setPayModalInvoiceId(invoice.id);
      setPayModalMonth(invoice.month || invoice.description);
      setPayModalAmount(invoice.amount);
      setPayModalRef(invoice.paymentRef || `EFT-STB-${Math.floor(100000 + Math.random() * 900000)}`);
      setPayModalMethod(invoice.paymentMethod || "EFT");
      setPayModalPopFileName(invoice.popFileName || "");
      setPayModalPopUrl(invoice.popUrl || "");
      setPayModalNotes(invoice.notes || "");
    } else {
      setPayModalInvoiceId(null);
      setPayModalMonth("July 2026 Monthly Tuition");
      setPayModalAmount(student ? student.tuitionFee : 2600);
      setPayModalRef(`EFT-STB-${Math.floor(100000 + Math.random() * 900000)}`);
      setPayModalMethod("EFT");
      setPayModalPopFileName("");
      setPayModalPopUrl("");
      setPayModalNotes("");
    }
    setPayModalDate(new Date().toISOString().split("T")[0]);
    setShowPayModal(true);
  };

  const handlePopFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPayModalPopFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPayModalPopUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoGeneratePop = () => {
    const student = students.find((s) => s.id === payModalStudentId);
    const sName = student ? student.name : "Learner";
    const popName = `POP_BankDeposit_${payModalMonth.replace(/\s+/g, "_")}_${sName.replace(/\s+/g, "_")}.pdf`;

    setPayModalPopFileName(popName);
    setPayModalPopUrl("data:application/pdf;base64,POP_STANDARD_BANK_AUDIT_STAMP");
  };

  const handleSavePaymentWithPop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPayment(true);

    const popName = payModalPopFileName || `POP_EFT_${payModalMonth.replace(/\s+/g, "_")}.pdf`;

    const paymentPayload = {
      paymentRef: payModalRef || `EFT-${Date.now().toString().slice(-6)}`,
      paymentMethod: payModalMethod,
      popFileName: popName,
      popUrl: payModalPopUrl || "demo_pop_preview",
      notes: payModalNotes,
      paidAt: payModalDate,
      month: payModalMonth,
      amount: payModalAmount,
    };

    try {
      if (payModalInvoiceId) {
        await onPayInvoice(payModalInvoiceId, paymentPayload);
      } else if (onCreateAndPayInvoice) {
        await onCreateAndPayInvoice({
          studentId: payModalStudentId,
          description: `${payModalMonth} Fee Payment`,
          amount: payModalAmount,
          dueDate: payModalDate,
          type: "monthly_tuition",
          status: "paid",
          ...paymentPayload,
        });
      } else {
        const studentInvoice = invoices.find((i) => i.studentId === payModalStudentId && i.status !== "paid");
        if (studentInvoice) {
          await onPayInvoice(studentInvoice.id, paymentPayload);
        }
      }

      setReminderSuccessText(`Payment of R${payModalAmount} for ${payModalMonth} marked as RECEIVED with Proof of Payment attached!`);
      setTimeout(() => setReminderSuccessText(""), 5000);
      setShowPayModal(false);
    } catch (err) {
      alert("Failed to record payment.");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Document states
  const [rejectionReasons, setRejectionReasons] = useState<{ [docId: string]: string }>({});

  // Teams Scheduling Form State
  const [showTeamsModal, setShowTeamsModal] = useState<boolean>(false);
  const [newTeamsSubjectId, setNewTeamsSubjectId] = useState<string>("sub-eng");
  const [newTeamsGrade, setNewTeamsGrade] = useState<string>("Grade 10");
  const [newTeamsTitle, setNewTeamsTitle] = useState<string>("");
  const [newTeamsTutor, setNewTeamsTutor] = useState<string>("Dr. Sarah Mitchell (CAPS Lead)");
  const [newTeamsDate, setNewTeamsDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [newTeamsTime, setNewTeamsTime] = useState<string>("15:30");
  const [newTeamsDuration, setNewTeamsDuration] = useState<number>(60);
  const [newTeamsJoinUrl, setNewTeamsJoinUrl] = useState<string>("");
  const [isSubmittingTeams, setIsSubmittingTeams] = useState<boolean>(false);

  const handleCreateSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreateTeamsSession) return;
    setIsSubmittingTeams(true);

    const subj = subjects.find((s) => s.id === newTeamsSubjectId);
    const subjectName = subj ? subj.name : "English Home Language";
    const finalUrl = newTeamsJoinUrl.trim() || `https://teams.microsoft.com/l/meetup-join/virtuelle-${Date.now()}`;

    try {
      await onCreateTeamsSession({
        subjectId: newTeamsSubjectId,
        subjectName,
        grade: newTeamsGrade,
        title: newTeamsTitle || `${subjectName} Live Tutoring Session`,
        tutor: newTeamsTutor,
        date: newTeamsDate,
        time: newTeamsTime,
        durationMinutes: newTeamsDuration,
        joinUrl: finalUrl,
      });
      setShowTeamsModal(false);
      setNewTeamsTitle("");
      setNewTeamsJoinUrl("");
    } catch (err) {
      alert("Failed to schedule session.");
    } finally {
      setIsSubmittingTeams(false);
    }
  };

  const handleApproveEnrollment = (sId: string) => {
    onApproveStudent(sId);
    if (selectedStudent && selectedStudent.id === sId) {
      setSelectedStudent((prev) => (prev ? { ...prev, status: "active" } : null));
    }
  };

  const handleDocumentAction = (docId: string, status: "verified" | "rejected") => {
    const reason = status === "rejected" ? rejectionReasons[docId] || "Document details are unreadable" : undefined;
    onVerifyDocument(docId, status, reason);
  };

  const triggerPaymentReminder = async (invoiceId: string) => {
    const method = reminderMethod[invoiceId] || "WhatsApp";
    setIsSendingReminder((prev) => ({ ...prev, [invoiceId]: true }));
    try {
      const res = await onSendReminder(invoiceId, method);
      setReminderSuccessText(`Successfully sent payment reminder to Parent via ${method}!`);
      setTimeout(() => setReminderSuccessText(""), 6000);
    } catch (e) {
      alert("Failed to send reminder.");
    } finally {
      setIsSendingReminder((prev) => ({ ...prev, [invoiceId]: false }));
    }
  };

  const loadAiGradingHelper = async (subId: string) => {
    setIsAiEvaluating(true);
    try {
      const evaluation = await onGetAiReview(subId);
      setInputScore(evaluation.suggestedScore.toString());
      setInputFeedback(evaluation.recommendedFeedback);
    } catch (err: any) {
      alert(err.message || "Failed to load Gemini AI Evaluation.");
    } finally {
      setIsAiEvaluating(false);
    }
  };

  const handleFinalPublishMark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    onMarkSubmission(selectedSubmission.id, Number(inputScore), inputFeedback);
    setSelectedSubmission(null);
    setInputScore("");
    setInputFeedback("");
  };

  // Financial statistics
  const totalTuitionOwed = invoices.filter((i) => i.status !== "paid" && i.type === "monthly_tuition").reduce((sum, i) => sum + i.amount, 0);
  const totalPaidRevenue = invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.amount, 0);
  const totalOutstandingCount = invoices.filter((i) => i.status !== "paid").length;

  return (
    <div id="admin-dashboard-container" className="space-y-6">
      {/* Visual Metric Bento Cards */}
      <div id="admin-metrics" className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-editorial-paper p-5 border border-navy-800/10 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-400 font-sans font-bold uppercase">Enrolled Students</span>
            <p className="text-2xl font-sans font-bold text-navy-950">{students.length}</p>
          </div>
          <div className="p-3 bg-navy-50 border border-navy-800/10">
            <Users className="text-navy-800 w-6 h-6" />
          </div>
        </div>
        <div className="bg-editorial-paper p-5 border border-navy-800/10 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-400 font-sans font-bold uppercase">Pending Registrations</span>
            <p className="text-2xl font-serif font-bold text-amber-700">
              {students.filter((s) => s.status === "pending").length}
            </p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200">
            <AlertTriangle className="text-amber-700 w-6 h-6" />
          </div>
        </div>
        <div className="bg-editorial-paper p-5 border border-navy-800/10 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-400 font-sans font-bold uppercase">Total Revenue Collected</span>
            <p className="text-2xl font-serif font-bold text-emerald-700">R {totalPaidRevenue}.00</p>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200">
            <Check className="text-emerald-700 w-6 h-6" />
          </div>
        </div>
        <div className="bg-editorial-paper p-5 border border-navy-800/10 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-400 font-sans font-bold uppercase">Outstanding Tuition Fees</span>
            <p className="text-2xl font-serif font-bold text-rose-700">R {totalTuitionOwed}.00</p>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-200">
            <CreditCard className="text-rose-700 w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Admin Tab Selectors */}
      <div className="flex flex-wrap border border-navy-800/10 bg-editorial-paper p-2.5 gap-2">
        {[
          { id: "enrollments", label: "Enrollment & Verification", icon: Users },
          { id: "grading", label: "Online Marking (Gemini)", icon: Bookmark },
          { id: "finance", label: "Finance & Accounts Receivable", icon: CreditCard },
          { id: "teams", label: "Live MS Teams Scheduler", icon: Video },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedStudent(null);
                setSelectedSubmission(null);
              }}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-sans font-bold transition-all ${
                isSelected ? "bg-navy-800 text-gold-400 border border-gold-400/30 shadow-sm" : "text-navy-950 hover:bg-neutral-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ENROLLMENTS & DOCUMENTS */}
      {activeTab === "enrollments" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student enrollment lists */}
          <div className="lg:col-span-2 bg-editorial-paper p-6 border border-navy-800/10 shadow-sm space-y-4">
            <h4 className="font-sans font-semibold text-sm text-navy-950 uppercase tracking-wider">Student Applications</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-navy-800/10 text-navy-800 uppercase tracking-wider font-bold">
                    <th className="py-3 px-2">Student Name</th>
                    <th className="py-3 px-2">Grade</th>
                    <th className="py-3 px-2">Agreement Status</th>
                    <th className="py-3 px-2">Documents</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/10 font-medium font-sans">
                  {students.map((st) => (
                    <tr
                      key={st.id}
                      onClick={() => setSelectedStudent(st)}
                      className={`cursor-pointer hover:bg-editorial-bg transition-colors ${
                        selectedStudent?.id === st.id ? "bg-navy-50/50 border-l-4 border-l-gold-400" : ""
                      }`}
                    >
                      <td className="py-4 px-2 font-sans font-bold text-navy-950">{st.name}</td>
                      <td className="py-4 px-2 text-neutral-600">{st.grade}</td>
                      <td className="py-4 px-2">
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] uppercase font-sans font-bold">
                          Submitted
                        </span>
                      </td>
                      <td className="py-4 px-2 text-neutral-500">
                        {st.documentsSubmitted ? "All uploaded" : "Pending upload"}
                      </td>
                      <td className="py-4 px-2">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            st.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right" onClick={(e) => e.stopPropagation()}>
                        {st.status === "pending" ? (
                          <button
                            onClick={() => handleApproveEnrollment(st.id)}
                            className="bg-navy-800 hover:bg-navy-950 border border-gold-400 text-gold-400 text-[10px] font-sans font-bold px-3 py-1.5 transition-all"
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-sans font-bold">Approved ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed application/agreement view for selected student */}
          <div className="space-y-6">
            {selectedStudent ? (
              <div className="bg-editorial-paper p-6 border border-navy-800/10 shadow-sm space-y-6">
                <div className="border-b border-navy-800/10 pb-4">
                  <h4 className="font-sans font-bold text-sm text-navy-950">{selectedStudent.name}</h4>
                  <p className="text-xs text-neutral-500 mt-1">Enrollment review and document checklist</p>
                </div>

                {/* Digital tuition contract parameters */}
                <div className="space-y-2 text-xs font-sans">
                  <div className="flex justify-between p-2 bg-editorial-bg border border-navy-800/10">
                    <span className="text-neutral-500">Student Grade:</span>
                    <span className="font-bold text-navy-950">{selectedStudent.grade}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-editorial-bg border border-navy-800/10">
                    <span className="text-neutral-500">Auto-Monthly Fee:</span>
                    <span className="font-bold text-gold-600">R {selectedStudent.tuitionFee}.00</span>
                  </div>
                  <div className="flex justify-between p-2 bg-editorial-bg border border-navy-800/10">
                    <span className="text-neutral-500">Subject List chosen:</span>
                    <span className="font-bold text-navy-950 truncate max-w-[150px]">
                      {selectedStudent.chosenSubjects.join(", ")}
                    </span>
                  </div>
                </div>

                {/* Document verifications controls */}
                <div className="space-y-3">
                  <h5 className="font-sans font-semibold text-xs text-navy-950 uppercase">Uploaded Scanned Documents</h5>
                  {documents.filter((d) => d.studentId === selectedStudent.id).length === 0 ? (
                    <p className="text-xs text-neutral-500 italic bg-editorial-bg p-3 border border-navy-800/10">
                      No document files uploaded by this student yet.
                    </p>
                  ) : (
                    documents
                      .filter((d) => d.studentId === selectedStudent.id)
                      .map((doc) => (
                        <div key={doc.id} className="border border-navy-800/10 p-3 space-y-2 bg-editorial-bg">
                          <div className="flex justify-between items-start">
                            <div className="truncate pr-2">
                              <span className="text-xs font-sans font-semibold text-navy-950 block truncate">{doc.name}</span>
                              <span className="text-[10px] text-neutral-400 font-mono">{doc.fileSize} • {doc.uploadedAt}</span>
                            </div>
                            <span
                              className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                doc.status === "verified"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : doc.status === "rejected"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {doc.status}
                            </span>
                          </div>

                          {doc.status === "pending" && (
                            <div className="flex items-center gap-2 pt-1 border-t border-navy-800/10">
                              <button
                                onClick={() => handleDocumentAction(doc.id, "verified")}
                                className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-sans font-bold py-1 px-2 border border-emerald-200 flex items-center justify-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => handleDocumentAction(doc.id, "rejected")}
                                className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-sans font-bold py-1 px-2 border border-rose-200 flex items-center justify-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-editorial-bg border border-navy-800/10 p-6 text-center text-xs text-neutral-500 font-sans">
                Click a student on the left to inspect their signed agreement contract and verify uploaded registration documents.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ONLINE SUBMISSIONS (MARKING) WITH GEMINI CO-PILOT */}
      {activeTab === "grading" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submission List */}
          <div className="lg:col-span-1 bg-editorial-paper p-6 border border-navy-800/10 shadow-sm space-y-4">
            <h4 className="font-sans font-semibold text-sm text-navy-950 uppercase tracking-wider">Student Test Submissions</h4>
            <div className="space-y-3">
              {submissions.length === 0 ? (
                <div className="text-xs text-neutral-500 text-center py-6 font-sans">
                  No online tests submitted yet.
                </div>
              ) : (
                submissions.map((sub) => {
                  const isSelected = selectedSubmission?.id === sub.id;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubmission(sub);
                        setInputScore(sub.score?.toString() || "");
                        setInputFeedback(sub.feedback || "");
                      }}
                      className={`cursor-pointer border p-4 space-y-2 transition-all ${
                        isSelected
                          ? "bg-navy-800 text-white border-gold-400 shadow-sm"
                          : "bg-editorial-bg border border-navy-800/10 hover:bg-navy-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className={`font-sans font-bold text-xs leading-tight ${isSelected ? "text-gold-400" : "text-navy-950"}`}>{sub.quizTitle}</h5>
                          <span className={`text-[10px] ${isSelected ? "text-navy-200" : "text-neutral-500"}`}>{sub.studentName}</span>
                        </div>
                        <span
                          className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${
                            sub.status === "marked" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>
                      <div className={`text-[10px] font-mono ${isSelected ? "text-navy-300" : "text-neutral-400"}`}>
                        Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Interactive grading terminal with Gemini review */}
          <div className="lg:col-span-2 space-y-6">
            {selectedSubmission ? (
              <div className="bg-editorial-paper p-6 border border-navy-800/10 shadow-sm space-y-6">
                <div className="border-b border-navy-800/10 pb-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-sans font-bold uppercase text-gold-600">Grading Terminal</span>
                    <h3 className="font-sans font-bold text-base text-navy-950">{selectedSubmission.quizTitle}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">Student: {selectedSubmission.studentName}</p>
                  </div>
                  <button
                    onClick={() => loadAiGradingHelper(selectedSubmission.id)}
                    disabled={isAiEvaluating}
                    className="flex items-center gap-1.5 bg-navy-800 hover:bg-navy-950 border border-gold-400 disabled:bg-neutral-800 text-gold-400 text-xs font-sans font-bold px-4 py-2.5 transition-all shadow-sm"
                  >
                    {isAiEvaluating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-gold-400" />
                        AI Evaluate with Gemini
                      </>
                    )}
                  </button>
                </div>

                {/* Question & answer audit details */}
                <div className="space-y-4">
                  <h4 className="font-sans font-bold text-xs text-navy-950 uppercase">Student's Submitted Responses</h4>
                  {Object.entries(selectedSubmission.answers).map(([qId, ans], idx) => (
                    <div key={qId} className="bg-editorial-bg p-4 border border-navy-800/10 space-y-2">
                      <span className="text-[9px] font-sans font-bold text-neutral-400 uppercase">Question {idx + 1}</span>
                      <p className="text-xs font-sans font-bold text-navy-955">
                        {quizzes.find((q) => q.id === selectedSubmission.quizId)?.questions.find((qu) => qu.id === qId)
                          ?.question || "Question Text"}
                      </p>
                      <div className="bg-white p-3 border border-navy-800/10 text-xs text-neutral-700 italic">
                        "{ans}"
                      </div>

                      {/* AI Individual question explanations if generated */}
                      {selectedSubmission.aiFeedback?.explanations?.[qId] && (
                        <div className="bg-amber-50 border border-amber-200 p-3 text-xs mt-2 text-amber-950 font-sans">
                          <span className="font-bold flex items-center gap-1 mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-gold-600" /> AI Critiques:
                          </span>
                          {selectedSubmission.aiFeedback.explanations[qId]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Final grading form */}
                <form onSubmit={handleFinalPublishMark} className="space-y-4 border-t border-navy-800/10 pt-6">
                  {selectedSubmission.aiFeedback && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 space-y-1">
                      <span className="text-xs font-sans font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Gemini Evaluation Completed
                      </span>
                      <p className="text-xs text-emerald-950 leading-relaxed font-sans">
                        Gemini evaluated this submission, analyzed the correctness of both multiple choice and text essay answers, and suggested a score of <span className="font-bold text-emerald-700">{selectedSubmission.aiFeedback.suggestedScore}/100</span> with professional feedback comments. You may publish this or tweak it below!
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">
                        Award Score (out of 100)
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="100"
                        value={inputScore}
                        onChange={(e) => setInputScore(e.target.value)}
                        className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-xs font-sans font-bold text-navy-950 bg-white"
                        placeholder="e.g. 90"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">
                        Lecturer Feedback / Advice
                      </label>
                      <input
                        type="text"
                        required
                        value={inputFeedback}
                        onChange={(e) => setInputFeedback(e.target.value)}
                        className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-xs text-navy-950 bg-white font-sans"
                        placeholder="Type encouraging advice..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSubmission(null)}
                      className="px-4 py-2 border border-navy-800/20 text-xs font-sans font-semibold text-navy-900 hover:bg-neutral-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-navy-800 hover:bg-navy-950 border border-gold-400 text-gold-400 text-xs font-sans font-bold transition-all shadow-sm"
                    >
                      Publish Final Mark
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-editorial-bg border border-navy-800/10 p-6 text-center text-xs text-neutral-500 font-sans">
                Choose a student's online test submission on the left to start grading. You can use server-side Gemini AI to instantly read student text responses and get recommended marking feedback.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FINANCE & ACCOUNTS RECEIVABLE */}
      {activeTab === "finance" && (
        <div className="space-y-6">
          {reminderSuccessText && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 flex items-center gap-2 text-sm font-sans animate-in fade-in duration-200">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{reminderSuccessText}</span>
            </div>
          )}

          {/* Top KPI Financial Receivables Summary Bar */}
          {(() => {
            const totalBilled = invoices.reduce((acc, i) => acc + i.amount, 0);
            const totalCollected = invoices.filter((i) => i.status === "paid").reduce((acc, i) => acc + i.amount, 0);
            const totalOutstanding = totalBilled - totalCollected;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-navy-950 text-white p-5 border border-gold-400/30 shadow-sm space-y-1">
                  <div className="flex justify-between items-center text-xs text-neutral-400 font-sans font-medium">
                    <span>Total Billed Ledger</span>
                    <CreditCard className="w-4 h-4 text-gold-400" />
                  </div>
                  <p className="text-2xl font-serif font-bold text-neutral-100">R {totalBilled.toLocaleString()}.00</p>
                  <p className="text-[10px] text-neutral-400 font-sans">Across all enrolled learners</p>
                </div>

                <div className="bg-editorial-paper p-5 border border-emerald-300/60 shadow-sm space-y-1">
                  <div className="flex justify-between items-center text-xs text-emerald-800 font-sans font-medium">
                    <span>Total Received (Paid)</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-serif font-bold text-emerald-900">R {totalCollected.toLocaleString()}.00</p>
                  <p className="text-[10px] text-emerald-700 font-sans font-medium">Verified payments with POP</p>
                </div>

                <div className="bg-editorial-paper p-5 border border-rose-300/60 shadow-sm space-y-1">
                  <div className="flex justify-between items-center text-xs text-rose-800 font-sans font-medium">
                    <span>Total Outstanding Balance</span>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  </div>
                  <p className="text-2xl font-serif font-bold text-rose-950">R {totalOutstanding.toLocaleString()}.00</p>
                  <p className="text-[10px] text-rose-700 font-sans font-medium">Pending & overdue accounts</p>
                </div>

                <div className="bg-editorial-paper p-5 border border-navy-800/10 shadow-sm flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex justify-between items-center text-xs text-navy-800 font-sans font-medium">
                      <span>Active Accounts</span>
                      <Users className="w-4 h-4 text-gold-600" />
                    </div>
                    <p className="text-2xl font-serif font-bold text-navy-950">{students.length} Learners</p>
                  </div>
                  <button
                    onClick={() => openPaymentModal()}
                    className="w-full bg-navy-800 hover:bg-navy-950 text-gold-400 font-sans font-bold text-xs py-2 px-3 border border-gold-400/40 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-gold-400" />
                    Record Payment (Attach POP)
                  </button>
                </div>
              </div>
            );
          })()}

          {/* VIEW MODE 1: INDIVIDUAL LEARNER FINANCIAL ACCOUNT VIEW */}
          {selectedFinanceStudentId ? (
            (() => {
              const learner = students.find((s) => s.id === selectedFinanceStudentId);
              if (!learner) return null;

              const learnerInvoices = invoices.filter((i) => i.studentId === learner.id);
              const learnerPaidInvoices = learnerInvoices.filter((i) => i.status === "paid");
              const learnerPendingInvoices = learnerInvoices.filter((i) => i.status !== "paid");
              const learnerTotalBilled = learnerInvoices.reduce((acc, i) => acc + i.amount, 0);
              const learnerTotalPaid = learnerPaidInvoices.reduce((acc, i) => acc + i.amount, 0);
              const learnerOutstanding = learnerTotalBilled - learnerTotalPaid;

              return (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Top Navigation Back Banner */}
                  <div className="bg-editorial-paper p-4 border border-navy-800/10 flex items-center justify-between gap-4">
                    <button
                      onClick={() => setSelectedFinanceStudentId(null)}
                      className="inline-flex items-center gap-2 text-xs font-sans font-bold text-navy-900 hover:text-gold-600 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to All Learners Accounts Dashboard
                    </button>
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-500">
                      Learner Account Ledger • ID: {learner.id}
                    </span>
                  </div>

                  {/* Learner Header Card */}
                  <div className="bg-navy-950 text-white p-6 border border-gold-400/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-navy-800 border-2 border-gold-400 text-gold-400 font-serif font-bold text-2xl flex items-center justify-center shrink-0">
                        {learner.name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif font-bold text-xl text-neutral-100">{learner.name}</h3>
                          <span className="bg-navy-800 text-gold-400 border border-gold-400/40 text-[10px] font-sans font-bold px-2 py-0.5 uppercase">
                            {learner.grade}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-300 font-sans">
                          Parent Contact: <strong className="text-neutral-100">Robert Doe</strong> (082 555 1234) • Tuition Fee: <strong className="text-gold-400">R {learner.tuitionFee}/pm</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="bg-navy-900/90 border border-navy-800 p-3 text-right shrink-0">
                        <p className="text-[10px] text-neutral-400 font-sans uppercase font-bold">Total Invoiced</p>
                        <p className="text-sm font-mono font-bold text-neutral-100">R {learnerTotalBilled}</p>
                      </div>
                      <div className="bg-navy-900/90 border border-navy-800 p-3 text-right shrink-0">
                        <p className="text-[10px] text-emerald-400 font-sans uppercase font-bold">Total Paid</p>
                        <p className="text-sm font-mono font-bold text-emerald-400">R {learnerTotalPaid}</p>
                      </div>
                      <div className="bg-navy-900/90 border border-navy-800 p-3 text-right shrink-0">
                        <p className="text-[10px] text-rose-400 font-sans uppercase font-bold">Outstanding</p>
                        <p className="text-sm font-mono font-bold text-rose-400">R {learnerOutstanding}</p>
                      </div>
                      <button
                        onClick={() => openPaymentModal(learner.id)}
                        className="bg-gold-400 hover:bg-gold-500 text-navy-950 font-sans font-bold text-xs px-4 py-3 border border-gold-300 flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        Mark Payment Received (Upload POP)
                      </button>
                    </div>
                  </div>

                  {/* Section 1: Payments Received & Proof of Payment (POP) attachments */}
                  <div className="bg-editorial-paper p-6 border border-navy-800/10 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-navy-800/10 pb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-sans font-bold text-sm text-navy-950 uppercase tracking-wider">
                          Verified Payments Received & Proof of Payment (POP) Attachments
                        </h4>
                      </div>
                      <span className="text-[10px] font-sans font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-200">
                        {learnerPaidInvoices.length} Payments Cleared
                      </span>
                    </div>

                    {learnerPaidInvoices.length === 0 ? (
                      <div className="bg-editorial-bg p-8 text-center border border-navy-800/10 space-y-2">
                        <FileText className="w-8 h-8 text-neutral-400 mx-auto" />
                        <p className="text-xs text-neutral-600 font-semibold font-sans">No verified payments recorded for this learner yet.</p>
                        <p className="text-[11px] text-neutral-500 max-w-md mx-auto">
                          Click 'Mark Payment Received (Upload POP)' above to record an EFT payment and attach proof of payment.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-sans">
                          <thead>
                            <tr className="border-b border-navy-800/10 text-navy-800 uppercase tracking-wider font-bold bg-neutral-50">
                              <th className="py-2.5 px-3">Month / Fee Description</th>
                              <th className="py-2.5 px-3">Amount Paid</th>
                              <th className="py-2.5 px-3">Date Paid</th>
                              <th className="py-2.5 px-3">Payment Method</th>
                              <th className="py-2.5 px-3">EFT Reference #</th>
                              <th className="py-2.5 px-3 text-right">Proof of Payment (POP)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-navy-800/10 font-medium">
                            {learnerPaidInvoices.map((inv) => (
                              <tr key={inv.id} className="hover:bg-editorial-bg">
                                <td className="py-3 px-3">
                                  <span className="font-bold text-navy-950 block">{inv.month || inv.description}</span>
                                  <span className="text-[10px] text-neutral-500 font-mono">Invoice #{inv.id}</span>
                                </td>
                                <td className="py-3 px-3 font-bold text-emerald-800">R {inv.amount}.00</td>
                                <td className="py-3 px-3 text-neutral-600">{inv.paidAt || inv.dueDate}</td>
                                <td className="py-3 px-3">
                                  <span className="bg-navy-100 text-navy-900 font-bold text-[10px] px-2 py-0.5 uppercase border border-navy-800/10">
                                    {inv.paymentMethod || "EFT"}
                                  </span>
                                </td>
                                <td className="py-3 px-3 font-mono text-neutral-600">{inv.paymentRef || "EFT-STB-99381"}</td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    onClick={() => setViewPopInvoice(inv)}
                                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-sans font-bold text-[10px] px-3 py-1.5 flex items-center justify-end gap-1 ml-auto transition-colors shadow-2xs"
                                  >
                                    <Paperclip className="w-3 h-3 text-emerald-600" />
                                    <span>{inv.popFileName ? inv.popFileName : "View POP Attachment"}</span>
                                    <Eye className="w-3 h-3 text-emerald-600" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Section 2: Upcoming & Outstanding Payments */}
                  <div className="bg-editorial-paper p-6 border border-navy-800/10 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-navy-800/10 pb-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                        <h4 className="font-sans font-bold text-sm text-navy-950 uppercase tracking-wider">
                          Upcoming & Outstanding Monthly Payments
                        </h4>
                      </div>
                      <span className="text-[10px] font-sans font-bold text-rose-700 bg-rose-50 px-2.5 py-1 border border-rose-200">
                        R {learnerOutstanding}.00 Pending
                      </span>
                    </div>

                    {learnerPendingInvoices.length === 0 ? (
                      <div className="bg-emerald-50/50 p-6 border border-emerald-200 text-emerald-900 text-xs font-sans flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold">This learner's account is completely up to date!</p>
                          <p className="text-[11px] text-emerald-800">All tuition and registration invoices have been received and verified with POP.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-sans">
                          <thead>
                            <tr className="border-b border-navy-800/10 text-navy-800 uppercase tracking-wider font-bold bg-neutral-50">
                              <th className="py-2.5 px-3">Invoice ID</th>
                              <th className="py-2.5 px-3">Description</th>
                              <th className="py-2.5 px-3">Due Date</th>
                              <th className="py-2.5 px-3">Amount Due</th>
                              <th className="py-2.5 px-3">Status</th>
                              <th className="py-2.5 px-3">Send Reminder</th>
                              <th className="py-2.5 px-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-navy-800/10 font-medium">
                            {learnerPendingInvoices.map((inv) => (
                              <tr key={inv.id} className="hover:bg-editorial-bg">
                                <td className="py-3 px-3 font-mono text-neutral-500">{inv.id}</td>
                                <td className="py-3 px-3 font-bold text-navy-950">{inv.description}</td>
                                <td className="py-3 px-3 text-neutral-600">{inv.dueDate}</td>
                                <td className="py-3 px-3 font-bold text-navy-950">R {inv.amount}.00</td>
                                <td className="py-3 px-3">
                                  <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 uppercase">
                                    {inv.status}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => triggerPaymentReminder(inv.id)}
                                      disabled={isSendingReminder[inv.id]}
                                      className="bg-navy-800 hover:bg-navy-950 text-gold-400 border border-gold-400/40 text-[9px] font-bold px-2 py-1 uppercase flex items-center gap-1"
                                    >
                                      {isSendingReminder[inv.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-2.5 h-2.5" />}
                                      Remind
                                    </button>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    onClick={() => openPaymentModal(learner.id, inv)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-[10px] px-3 py-1.5 uppercase flex items-center gap-1 ml-auto shadow-2xs"
                                  >
                                    <Upload className="w-3 h-3" />
                                    Mark Paid (Attach POP)
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            /* VIEW MODE 2: ALL LEARNERS FINANCIAL DASHBOARD */
            <div className="bg-editorial-paper p-6 border border-navy-800/10 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-800/10 pb-4">
                <div>
                  <h4 className="font-sans font-semibold text-sm text-navy-950 uppercase tracking-wider">
                    Learner Accounts & Financial Ledgers
                  </h4>
                  <p className="text-xs text-neutral-500 font-sans">
                    Select a learner to view their individual payment history, upcoming invoices, and attached Proofs of Payment (POP).
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search learner or grade..."
                      value={financeSearchQuery}
                      onChange={(e) => setFinanceSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-navy-800/20 text-xs text-navy-950 focus:outline-none focus:border-gold-400 bg-white font-sans w-56"
                    />
                  </div>
                  <button
                    onClick={() => openPaymentModal()}
                    className="bg-navy-800 hover:bg-navy-950 text-gold-400 font-sans font-bold text-xs px-4 py-2 border border-gold-400 flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4 text-gold-400" />
                    Mark Payment Received
                  </button>
                </div>
              </div>

              {/* Table of All Learners */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-navy-800/10 text-navy-800 uppercase tracking-wider font-bold bg-neutral-50">
                      <th className="py-3 px-3">Learner Profile</th>
                      <th className="py-3 px-3">Grade & Enrolled Subjects</th>
                      <th className="py-3 px-3">Monthly Fee</th>
                      <th className="py-3 px-3">Paid Total</th>
                      <th className="py-3 px-3">Outstanding Balance</th>
                      <th className="py-3 px-3">Account Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800/10 font-medium">
                    {students
                      .filter(
                        (st) =>
                          st.name.toLowerCase().includes(financeSearchQuery.toLowerCase()) ||
                          st.grade.toLowerCase().includes(financeSearchQuery.toLowerCase())
                      )
                      .map((student) => {
                        const stInvoices = invoices.filter((i) => i.studentId === student.id);
                        const paidTotal = stInvoices.filter((i) => i.status === "paid").reduce((acc, i) => acc + i.amount, 0);
                        const billedTotal = stInvoices.reduce((acc, i) => acc + i.amount, 0);
                        const outstanding = billedTotal - paidTotal;
                        const isUpToDate = outstanding === 0;

                        return (
                          <tr key={student.id} className="hover:bg-editorial-bg transition-colors">
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-navy-800 text-gold-400 font-serif font-bold text-sm flex items-center justify-center shrink-0">
                                  {student.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-navy-950 font-sans">{student.name}</p>
                                  <p className="text-[10px] text-neutral-500 font-mono">ID: {student.id}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-3">
                              <span className="font-bold text-navy-900 block">{student.grade}</span>
                              <span className="text-[10px] text-neutral-500 truncate max-w-[180px] block">
                                {student.chosenSubjects.length} Subjects: {student.chosenSubjects.slice(0, 2).join(", ")}
                                {student.chosenSubjects.length > 2 && "..."}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 font-bold text-navy-950">R {student.tuitionFee}.00 /pm</td>

                            <td className="py-3.5 px-3 font-bold text-emerald-800">R {paidTotal}.00</td>

                            <td className="py-3.5 px-3 font-bold text-rose-800">
                              {outstanding > 0 ? `R ${outstanding}.00` : "R 0.00"}
                            </td>

                            <td className="py-3.5 px-3">
                              <span
                                className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                  isUpToDate
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                {isUpToDate ? "Up to Date" : "Outstanding"}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedFinanceStudentId(student.id)}
                                  className="bg-navy-800 hover:bg-navy-950 text-gold-400 font-sans font-bold text-[10px] px-3 py-1.5 uppercase flex items-center gap-1 border border-gold-400/40 shadow-2xs"
                                >
                                  <User className="w-3 h-3 text-gold-400" />
                                  View Account
                                </button>
                                <button
                                  onClick={() => openPaymentModal(student.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-[10px] px-2.5 py-1.5 uppercase flex items-center gap-1 shadow-2xs"
                                  title="Record Payment for Month"
                                >
                                  <Upload className="w-3 h-3" />
                                  Record POP
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Reminders Sent Log Card */}
          <div className="bg-editorial-paper p-6 border border-navy-800/10 shadow-sm space-y-4">
            <h4 className="font-sans font-semibold text-sm text-navy-950 uppercase tracking-wider">Automated Notification Outbox</h4>
            {remindersLog.length === 0 ? (
              <p className="text-xs text-neutral-500 bg-editorial-bg p-4 border border-navy-800/10 font-sans">
                No automatic reminder logs recorded in the outbox queue yet.
              </p>
            ) : (
              <div className="space-y-3 font-sans">
                {remindersLog.map((log) => (
                  <div key={log.id} className="border border-navy-800/10 p-4 bg-editorial-bg text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-neutral-400 font-bold font-sans">
                      <span className="text-gold-600 font-bold font-sans">SENT: {log.method} ALERT</span>
                      <span>{log.sentAt}</span>
                    </div>
                    <p className="text-neutral-700 leading-relaxed font-mono text-[10px] bg-white p-2.5 border border-navy-800/10">
                      {log.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MARK PAYMENT RECEIVED & ATTACH PROOF OF PAYMENT (POP) MODAL */}
          {showPayModal && (
            <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white w-full max-w-lg border border-gold-400 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-navy-950 text-white p-4 border-b border-gold-400 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-gold-400" />
                    <h3 className="font-serif text-sm font-bold text-neutral-100">
                      Mark Payment Received & Attach Proof of Payment
                    </h3>
                  </div>
                  <button onClick={() => setShowPayModal(false)} className="text-neutral-400 hover:text-white p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSavePaymentWithPop} className="p-6 space-y-4 font-sans text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-navy-900 mb-1">Select Learner</label>
                    <select
                      value={payModalStudentId}
                      onChange={(e) => {
                        setPayModalStudentId(e.target.value);
                        const st = students.find((s) => s.id === e.target.value);
                        if (st) setPayModalAmount(st.tuitionFee);
                      }}
                      className="w-full p-2.5 bg-neutral-50 border border-navy-800/20 text-navy-950 font-bold"
                    >
                      {students.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.grade}) - Fee: R{st.tuitionFee}/pm
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-navy-900 mb-1">Month / Fee Item</label>
                      <select
                        value={payModalMonth}
                        onChange={(e) => setPayModalMonth(e.target.value)}
                        className="w-full p-2.5 bg-neutral-50 border border-navy-800/20 text-navy-950 font-medium"
                      >
                        <option value="July 2026 Monthly Tuition">July 2026 Monthly Tuition</option>
                        <option value="August 2026 Monthly Tuition">August 2026 Monthly Tuition</option>
                        <option value="September 2026 Monthly Tuition">September 2026 Monthly Tuition</option>
                        <option value="October 2026 Monthly Tuition">October 2026 Monthly Tuition</option>
                        <option value="Registration Fee">Registration Fee (R400)</option>
                        <option value="Student ID Card">Student ID Card (R150)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-navy-900 mb-1">Amount Paid (ZAR)</label>
                      <input
                        type="number"
                        required
                        value={payModalAmount}
                        onChange={(e) => setPayModalAmount(Number(e.target.value))}
                        className="w-full p-2.5 bg-neutral-50 border border-navy-800/20 text-navy-950 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-navy-900 mb-1">Payment Method</label>
                      <select
                        value={payModalMethod}
                        onChange={(e) => setPayModalMethod(e.target.value)}
                        className="w-full p-2.5 bg-neutral-50 border border-navy-800/20 text-navy-950 font-medium"
                      >
                        <option value="EFT">Electronic Funds Transfer (EFT)</option>
                        <option value="Direct Deposit">Direct Bank Deposit</option>
                        <option value="Debit Order">Monthly Debit Order</option>
                        <option value="Cash">Cash Receipt</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-navy-900 mb-1">EFT / Bank Reference #</label>
                      <input
                        type="text"
                        required
                        value={payModalRef}
                        onChange={(e) => setPayModalRef(e.target.value)}
                        className="w-full p-2.5 bg-neutral-50 border border-navy-800/20 text-navy-950 font-mono text-[11px]"
                        placeholder="e.g. EFT-STB-99831"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] uppercase font-bold text-navy-900">
                        Attach Proof of Payment (POP) File
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoGeneratePop}
                        className="text-[9px] font-bold text-gold-600 hover:underline uppercase"
                      >
                        Auto-Attach Standard Bank POP
                      </button>
                    </div>

                    <div className="border-2 border-dashed border-navy-800/20 p-4 text-center bg-neutral-50 space-y-2">
                      <Paperclip className="w-6 h-6 text-neutral-400 mx-auto" />
                      {payModalPopFileName ? (
                        <div className="bg-emerald-50 border border-emerald-200 p-2 text-[11px] text-emerald-800 font-bold flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate max-w-xs">{payModalPopFileName}</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[11px] text-navy-900 font-medium">Click below to attach POP document or image</p>
                          <p className="text-[10px] text-neutral-500">Supports PDF, PNG, JPG (e.g. Bank Payment Notification)</p>
                        </div>
                      )}
                      <input type="file" accept=".pdf,image/*" onChange={handlePopFileUpload} className="hidden" id="pop-file-input" />
                      <label
                        htmlFor="pop-file-input"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-navy-800 hover:bg-navy-950 text-white font-bold text-[10px] uppercase cursor-pointer"
                      >
                        <Upload className="w-3 h-3 text-gold-400" />
                        Choose File
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-navy-900 mb-1">Admin Receipting Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Verified against Standard Bank statement 23/07/2026"
                      value={payModalNotes}
                      onChange={(e) => setPayModalNotes(e.target.value)}
                      className="w-full p-2 bg-neutral-50 border border-navy-800/20 text-navy-950 font-sans"
                    />
                  </div>

                  <div className="pt-3 border-t border-navy-800/10 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPayModal(false)}
                      className="px-4 py-2 border border-navy-800/20 text-navy-900 font-bold hover:bg-neutral-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingPayment}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 font-bold border border-emerald-500 flex items-center gap-1.5 shadow-sm"
                    >
                      {isSubmittingPayment ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Check className="w-4 h-4 text-white" />}
                      Confirm Payment & Save POP
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* VIEW POP DOCUMENT MODAL */}
          {viewPopInvoice && (
            <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white w-full max-w-lg border border-gold-400 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans">
                <div className="bg-navy-950 text-white p-4 border-b border-gold-400 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-gold-400" />
                    <h3 className="font-serif text-sm font-bold text-neutral-100">
                      Proof of Payment (POP) Document Audit Record
                    </h3>
                  </div>
                  <button onClick={() => setViewPopInvoice(null)} className="text-neutral-400 hover:text-white p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-5 bg-editorial-paper text-navy-950">
                  <div className="border-2 border-dashed border-emerald-400 p-5 bg-emerald-50/60 space-y-3 relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-100 rounded-full flex items-center justify-center opacity-30 pointer-events-none">
                      <CheckCircle2 className="w-20 h-20 text-emerald-700" />
                    </div>

                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                          Virtuelle Academique Financial Audit
                        </span>
                        <h4 className="font-serif font-bold text-lg text-navy-950">{viewPopInvoice.studentName}</h4>
                      </div>
                      <span className="bg-emerald-600 text-white font-bold text-[9px] uppercase px-2 py-0.5 border border-emerald-700">
                        VERIFIED EFT POP
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-emerald-200">
                      <div>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase">Payment Month / Item</p>
                        <p className="font-bold text-navy-950">{viewPopInvoice.month || viewPopInvoice.description}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase">Amount Cleared</p>
                        <p className="font-bold text-emerald-800">R {viewPopInvoice.amount}.00</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase">Payment Date</p>
                        <p className="font-medium text-navy-900">{viewPopInvoice.paidAt || viewPopInvoice.dueDate}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase">Bank Reference</p>
                        <p className="font-mono font-bold text-navy-950">{viewPopInvoice.paymentRef || "EFT-STB-99821"}</p>
                      </div>
                    </div>

                    <div className="bg-white p-3 border border-emerald-300 text-xs flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-navy-950 text-[11px] truncate">
                          {viewPopInvoice.popFileName || "Standard_Bank_POP_Verification.pdf"}
                        </p>
                        <p className="text-[9px] text-neutral-500">Verified and attached to central accounts ledger</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-100 p-3 text-[11px] text-neutral-600 space-y-1 font-mono">
                    <p className="font-bold text-navy-900">Standard Bank SA Account Details:</p>
                    <p>Account Name: Virtuelle Academique Centre NPC</p>
                    <p>Branch Code: 051001 • A/C: 10233357759</p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-navy-800/10">
                    <button
                      onClick={() => setViewPopInvoice(null)}
                      className="px-4 py-2 border border-navy-800/20 text-navy-900 font-bold text-xs hover:bg-neutral-100"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => alert(`Downloading Proof of Payment document: ${viewPopInvoice.popFileName || "POP_Record.pdf"}`)}
                      className="bg-navy-800 hover:bg-navy-950 text-gold-400 font-sans font-bold text-xs px-4 py-2 border border-gold-400 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-gold-400" />
                      Download POP Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LIVE MICROSOFT TEAMS TUTORING SCHEDULER */}
      {activeTab === "teams" && (
        <div className="space-y-6">
          {/* Header Action Banner */}
          <div className="bg-navy-950 p-6 border border-gold-400/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-gold-400" />
                <h3 className="font-serif text-lg font-bold text-neutral-100">
                  Scheduled Live Microsoft Teams Tutoring Sessions
                </h3>
              </div>
              <p className="text-xs text-neutral-300 font-sans max-w-2xl leading-relaxed">
                Schedule, manage, and launch online live masterclasses. Enrolled CAPS students are automatically notified and provided direct 1-click access through their Student Portal.
              </p>
            </div>
            <button
              onClick={() => setShowTeamsModal(true)}
              className="bg-gold-400 hover:bg-gold-500 text-navy-950 font-sans font-bold text-xs px-4 py-3 border border-gold-300 flex items-center justify-center gap-2 shadow-sm transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              Schedule New Teams Session
            </button>
          </div>

          {/* List of Scheduled Sessions */}
          <div className="bg-editorial-paper p-6 border border-navy-800/10 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-sans font-semibold text-sm text-navy-950 uppercase tracking-wider">
                Upcoming Live Masterclasses ({teamsSessions.length})
              </h4>
              <span className="text-[10px] text-gold-600 font-sans font-bold uppercase tracking-wider">
                Integrated with Microsoft Teams Meeting API
              </span>
            </div>

            {teamsSessions.length === 0 ? (
              <div className="p-12 text-center bg-editorial-bg border border-navy-800/10 space-y-3">
                <Video className="w-10 h-10 text-neutral-400 mx-auto" />
                <p className="text-xs font-semibold text-navy-900">No scheduled live tutoring sessions found.</p>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  Click 'Schedule New Teams Session' above to schedule an online live class for enrolled students.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamsSessions.map((session) => {
                  const enrolledCount = students.filter(
                    (st) => st.status === "active" && st.chosenSubjects.includes(session.subjectName)
                  ).length;

                  return (
                    <div
                      key={session.id}
                      className="border border-navy-800/15 p-5 bg-editorial-bg hover:bg-navy-50/40 transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-navy-900 bg-navy-100 border border-navy-800/20 px-2 py-0.5">
                            {session.subjectName} • {session.grade}
                          </span>
                          <span className="text-[10px] font-sans font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            {enrolledCount} Students Enrolled
                          </span>
                        </div>

                        <h5 className="font-serif font-bold text-navy-950 text-base leading-snug">
                          {session.title}
                        </h5>

                        <div className="text-xs text-neutral-600 space-y-1 font-sans">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-gold-600" />
                            <span>{session.date}</span>
                            <Clock className="w-3.5 h-3.5 text-gold-600 ml-2" />
                            <span>{session.time} (60 min)</span>
                          </div>
                          <p className="text-[11px] text-navy-800 font-medium pt-1">
                            Hosted by: <strong className="text-navy-950">{session.tutorName || session.tutor || "Virtuelle Tutor"}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-navy-800/10 flex items-center justify-between gap-2">
                        <a
                          href={session.joinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 bg-navy-800 hover:bg-navy-950 text-gold-400 font-sans font-bold text-xs py-2 px-3 flex items-center justify-center gap-1.5 border border-gold-400/40 transition-colors shadow-2xs"
                        >
                          <Video className="w-3.5 h-3.5 text-gold-400" />
                          Launch Teams Meeting
                          <ExternalLink className="w-3 h-3 text-gold-400/70" />
                        </a>

                        {onDeleteTeamsSession && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to cancel '${session.title}'?`)) {
                                onDeleteTeamsSession(session.id);
                              }
                            }}
                            className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 transition-colors"
                            title="Cancel Session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SCHEDULE NEW TEAMS SESSION MODAL */}
          {showTeamsModal && (
            <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white w-full max-w-lg border border-gold-400 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-navy-950 text-white p-4 border-b border-gold-400 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-gold-400" />
                    <h3 className="font-serif text-sm font-bold text-neutral-100">
                      Schedule Live Microsoft Teams Class
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowTeamsModal(false)}
                    className="text-neutral-400 hover:text-white p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateSessionSubmit} className="p-6 space-y-4 font-sans text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-navy-900 mb-1">Subject</label>
                      <select
                        value={newTeamsSubjectId}
                        onChange={(e) => setNewTeamsSubjectId(e.target.value)}
                        className="w-full p-2.5 bg-neutral-50 border border-navy-800/20 text-navy-950 font-medium"
                      >
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-navy-900 mb-1">Grade</label>
                      <select
                        value={newTeamsGrade}
                        onChange={(e) => setNewTeamsGrade(e.target.value)}
                        className="w-full p-2.5 bg-neutral-50 border border-navy-800/20 text-navy-950 font-medium"
                      >
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                        <option value="Grade 10-12">Grade 10-12 (All)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-navy-900 mb-1">Session Topic Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shakespeare Macbeth Act 1 Deep Dive & Character Analysis"
                      value={newTeamsTitle}
                      onChange={(e) => setNewTeamsTitle(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 border border-navy-800/20 text-navy-950 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-navy-900 mb-1">Host Tutor Name</label>
                    <input
                      type="text"
                      required
                      value={newTeamsTutor}
                      onChange={(e) => setNewTeamsTutor(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 border border-navy-800/20 text-navy-950 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-navy-900 mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={newTeamsDate}
                        onChange={(e) => setNewTeamsDate(e.target.value)}
                        className="w-full p-2 bg-neutral-50 border border-navy-800/20 text-navy-950 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-navy-900 mb-1">Time</label>
                      <input
                        type="time"
                        required
                        value={newTeamsTime}
                        onChange={(e) => setNewTeamsTime(e.target.value)}
                        className="w-full p-2 bg-neutral-50 border border-navy-800/20 text-navy-950 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-navy-900 mb-1">Duration</label>
                      <select
                        value={newTeamsDuration}
                        onChange={(e) => setNewTeamsDuration(Number(e.target.value))}
                        className="w-full p-2 bg-neutral-50 border border-navy-800/20 text-navy-950 font-medium"
                      >
                        <option value={45}>45 mins</option>
                        <option value={60}>60 mins</option>
                        <option value={90}>90 mins</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] uppercase font-bold text-navy-900">
                        Microsoft Teams Join Link
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setNewTeamsJoinUrl(
                            `https://teams.microsoft.com/l/meetup-join/virtuelle-academique-session-${Date.now()}`
                          )
                        }
                        className="text-[9px] font-bold text-gold-600 hover:underline uppercase"
                      >
                        Auto-Generate Link
                      </button>
                    </div>
                    <input
                      type="url"
                      placeholder="https://teams.microsoft.com/l/meetup-join/..."
                      value={newTeamsJoinUrl}
                      onChange={(e) => setNewTeamsJoinUrl(e.target.value)}
                      className="w-full p-2.5 bg-neutral-50 border border-navy-800/20 text-navy-950 font-mono text-[11px]"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Leave empty or click Auto-Generate Link to provision a Virtuelle Academique Microsoft Teams link.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-navy-800/10 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowTeamsModal(false)}
                      className="px-4 py-2 border border-navy-800/20 text-navy-900 font-bold hover:bg-neutral-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingTeams}
                      className="bg-navy-800 hover:bg-navy-950 text-gold-400 px-5 py-2 font-bold border border-gold-400 flex items-center gap-1.5 shadow-sm"
                    >
                      {isSubmittingTeams ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                      ) : (
                        <Check className="w-4 h-4 text-gold-400" />
                      )}
                      Publish & Notify Students
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { StudentProfile, UploadedDocument, Invoice, Subject, Quiz, QuizSubmission, TeamsSession } from "../types";
import {
  BookOpen,
  FileText,
  UploadCloud,
  FileCheck,
  Video,
  CreditCard,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Loader2,
  Calendar,
  Layers,
  Download,
  Eye,
  Printer,
  X,
} from "lucide-react";
import { downloadDocumentFile, generateDocumentHTML, DocumentResource } from "../utils/documentGenerator";

interface StudentDashboardProps {
  studentProfile: StudentProfile;
  subjects: Subject[];
  onDocumentUpload: (type: string, name: string, fileSize: string) => void;
  documents: UploadedDocument[];
  invoices: Invoice[];
  onPayInvoice: (invoiceId: string) => void;
  quizzes: Quiz[];
  submissions: QuizSubmission[];
  onSubmitQuiz: (quizId: string, answers: { [key: string]: string }, quizTitle: string, subjectId: string) => void;
  teamsSessions: TeamsSession[];
  onGeneratePracticeQuiz: (subjectId: string, grade: string, topic: string) => Promise<void>;
  isGeneratingQuiz: boolean;
}

export default function StudentDashboard({
  studentProfile,
  subjects,
  onDocumentUpload,
  documents,
  invoices,
  onPayInvoice,
  quizzes,
  submissions,
  onSubmitQuiz,
  teamsSessions,
  onGeneratePracticeQuiz,
  isGeneratingQuiz,
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<"study" | "docs" | "finance" | "classes">("study");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(subjects[0] || null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: string }>({});
  const [quizSubmittedSuccess, setQuizSubmittedSuccess] = useState(false);

  // Practice Quiz Generator states
  const [practiceTopic, setPracticeTopic] = useState("");
  const [practiceSubjectId, setPracticeSubjectId] = useState(subjects[0]?.id || "");
  const [practiceError, setPracticeError] = useState("");
  const [practiceSuccess, setPracticeSuccess] = useState(false);

  // Document Handbook / Activity Preview modal state
  const [previewDoc, setPreviewDoc] = useState<DocumentResource | null>(null);

  // Track last seen teams sessions count to detect new live schedules
  const [lastSeenTeamsCount, setLastSeenTeamsCount] = useState<number>(0);

  // Check if a document is uploaded
  const getDocStatus = (type: string) => {
    const doc = documents.find((d) => d.type === type);
    return doc ? doc.status : "not_uploaded";
  };

  const handleDocUploadSimulated = (type: string, label: string) => {
    const sizes = ["1.1 MB", "980 KB", "2.3 MB", "1.5 MB"];
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
    onDocumentUpload(type, `${studentProfile.name} - ${label}`, randomSize);
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuiz) return;
    onSubmitQuiz(activeQuiz.id, quizAnswers, activeQuiz.title, activeQuiz.subjectId);
    setQuizAnswers({});
    setActiveQuiz(null);
    setQuizSubmittedSuccess(true);
    setTimeout(() => setQuizSubmittedSuccess(false), 5000);
  };

  const handleGeneratePractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceTopic.trim()) return;
    setPracticeError("");
    setPracticeSuccess(false);
    try {
      await onGeneratePracticeQuiz(practiceSubjectId, studentProfile.grade, practiceTopic);
      setPracticeSuccess(true);
      setPracticeTopic("");
    } catch (err: any) {
      setPracticeError(err.message || "Failed to generate AI quiz.");
    }
  };

  const pendingInvoices = invoices.filter((i) => i.status !== "paid");
  const totalOutstanding = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div id="student-dashboard-root" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* LEFT COLUMN: Student Profile Card & Nav */}
      <div id="student-side-panel" className="lg:col-span-1 space-y-6">
        <div className="bg-navy-800 p-6 text-white border border-gold-400 shadow-md relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-gold-400/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gold-400 flex items-center justify-center font-sans font-bold text-[11px]l text-navy-950">
              {studentProfile.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-sans font-semibold text-sm leading-tight text-neutral-100">{studentProfile.name}</h3>
              <p className="text-xs text-gold-400 font-sans font-semibold">{studentProfile.grade}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    studentProfile.status === "active" ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span className="text-[10px] uppercase font-bold text-neutral-300">
                  {studentProfile.status === "active" ? "Active Student" : "Pending Approval"}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-navy-900/40 my-4 pt-4 space-y-2 text-xs font-sans">
            <div className="flex justify-between">
              <span className="text-neutral-300">Enrollment Status:</span>
              <span className={`font-bold capitalize ${studentProfile.status === "active" ? "text-emerald-400" : "text-amber-400"}`}>
                {studentProfile.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-300">Tuition Fee:</span>
              <span className="font-semibold text-gold-200">R{studentProfile.tuitionFee}/pm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-300">Subjects Enrolled:</span>
              <span className="font-semibold text-neutral-200">{studentProfile.chosenSubjects.length}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation */}
        <div className="bg-editorial-paper p-4 border border-navy-800/10 shadow-sm space-y-1">
          {[
            { id: "study", label: "Study & Test Online", icon: BookOpen },
            { id: "classes", label: "Live Classes (Teams)", icon: Video },
            { id: "docs", label: "Upload Documents", icon: UploadCloud },
            { id: "finance", label: "Fee Accounts", icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            const isLiveClasses = tab.id === "classes";
            const totalSessions = teamsSessions ? teamsSessions.length : 0;
            const hasLiveSessions = isLiveClasses && totalSessions > 0;
            const isUnseenOrNew = isLiveClasses && totalSessions > 0 && (!isSelected || totalSessions > lastSeenTeamsCount);

            let buttonClass = `w-full flex items-center justify-between px-4 py-3 text-xs font-sans font-semibold transition-all `;
            if (isUnseenOrNew) {
              buttonClass += `bg-rose-600 hover:bg-rose-700 text-white border-2 border-rose-400 animate-pulse shadow-md font-bold ring-2 ring-rose-400/40`;
            } else if (isSelected) {
              buttonClass += `bg-navy-800 text-gold-400 border border-gold-400/30`;
            } else {
              buttonClass += `text-navy-950 hover:bg-navy-50`;
            }

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setActiveQuiz(null);
                  if (isLiveClasses) {
                    setLastSeenTeamsCount(totalSessions);
                  }
                }}
                className={buttonClass}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isUnseenOrNew ? "text-white animate-bounce" : isSelected ? "text-gold-400" : "text-navy-900"}`} />
                  <span className="truncate">{tab.label}</span>
                </div>

                {hasLiveSessions && (
                  <div className="flex items-center gap-1.5 ml-auto shrink-0">
                    {isUnseenOrNew && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-200 opacity-90"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                      </span>
                    )}
                    <span
                      className={
                        isUnseenOrNew
                          ? "bg-white text-rose-700 text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded-2xs shadow-xs"
                          : "bg-rose-600 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-2xs"
                      }
                    >
                      {totalSessions} SCHEDULED
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Panel View */}
      <div id="student-main-panel" className="lg:col-span-3 space-y-6">
        {teamsSessions && teamsSessions.length > 0 && activeTab !== "classes" && (
          <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-navy-950 p-4 border border-rose-500 shadow-md flex items-center justify-between gap-4 text-white animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-90"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <div>
                <p className="font-serif font-bold text-sm text-rose-100 flex items-center gap-2">
                  <Video className="w-4 h-4 text-gold-400" />
                  Live Tutoring Class Scheduled! ({teamsSessions.length} Available)
                </p>
                <p className="text-xs text-rose-200/90 font-sans mt-0.5">
                  An online Microsoft Teams live masterclass has been scheduled by your academic tutor.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("classes")}
              className="bg-gold-400 hover:bg-gold-500 text-navy-950 font-sans font-bold text-xs px-4 py-2 border border-gold-300 shrink-0 transition-all shadow-sm flex items-center gap-1.5"
            >
              View Live Timetable
              <Video className="w-3.5 h-3.5 text-navy-950" />
            </button>
          </div>
        )}

        {quizSubmittedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Test submitted successfully! Staff will mark it, and you'll receive feedback soon.
          </div>
        )}

        {/* TAB 1: STUDY & TEST ONLINE */}
        {activeTab === "study" && !activeQuiz && (
          <div className="space-y-6">
            {/* Subject Selector Header */}
            <div className="bg-editorial-paper p-6 border border-navy-800/10 shadow-sm">
              <h3 className="text-lg font-serif font-semibold text-navy-950 flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-gold-600" />
                Your Homeschooling Subjects
              </h3>
              <div className="flex flex-wrap gap-2">
                {subjects.map((sub) => {
                  const isSelected = selectedSubject?.id === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubject(sub)}
                      className={`px-4 py-2.5 text-xs font-sans font-bold transition-all ${
                        isSelected
                          ? "bg-navy-800 text-gold-400 border border-gold-400"
                          : "bg-editorial-bg border border-navy-800/10 text-navy-800 hover:bg-navy-50"
                      }`}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Modules and Tests details */}
            {selectedSubject && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Modules & Materials list */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="font-sans font-semibold text-sm text-navy-950 uppercase tracking-wider">
                    Study Modules & Handbooks
                  </h4>
                  {selectedSubject.modules.length === 0 ? (
                    <div className="bg-editorial-bg p-6 text-center text-xs text-neutral-500 border border-navy-800/10">
                      No materials uploaded for this subject yet.
                    </div>
                  ) : (
                    selectedSubject.modules.map((mod) => (
                      <div key={mod.id} className="bg-editorial-paper p-5 border border-navy-800/10 shadow-sm space-y-3">
                        <div>
                          <span className="text-[10px] font-sans font-bold text-gold-600 uppercase tracking-widest">
                            {mod.id.toUpperCase()}
                          </span>
                          <h5 className="font-sans font-semibold text-sm text-navy-950 mt-0.5">{mod.title}</h5>
                          <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{mod.description}</p>
                        </div>
                        <div className="border-t border-navy-800/10 pt-3 space-y-2">
                          {mod.resources.map((res, i) => {
                            const docInfo: DocumentResource = {
                              name: res.name,
                              type: res.type,
                              moduleTitle: mod.title,
                              subjectName: selectedSubject.name,
                              grade: studentProfile.grade,
                              studentName: studentProfile.name,
                            };
                            return (
                              <div
                                key={i}
                                className="flex items-center justify-between p-2.5 bg-editorial-bg hover:bg-navy-50/80 border border-navy-800/10 hover:border-gold-400 transition-colors group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                  <FileText className="w-4 h-4 text-gold-600 shrink-0" />
                                  <div className="truncate">
                                    <p className="font-semibold text-xs text-navy-950 group-hover:text-navy-900 truncate">
                                      {res.name}
                                    </p>
                                    <span className="text-[9px] uppercase font-sans font-bold text-navy-800 bg-navy-100/60 px-1.5 py-0.2 rounded-xs">
                                      {res.type === "handbook" ? "Official Handbook" : "Activity Task"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewDoc(docInfo)}
                                    className="flex items-center gap-1 bg-white hover:bg-navy-100 text-navy-900 border border-navy-800/20 px-2 py-1 text-[10px] font-sans font-bold transition-all shadow-2xs"
                                    title="Read handbook on screen"
                                  >
                                    <Eye className="w-3 h-3 text-navy-800" />
                                    Read
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      downloadDocumentFile(docInfo);
                                      setPreviewDoc(docInfo);
                                    }}
                                    className="flex items-center gap-1 bg-navy-800 hover:bg-navy-950 text-gold-400 border border-gold-400 px-2.5 py-1 text-[10px] font-sans font-bold transition-all shadow-xs"
                                    title="Download file"
                                  >
                                    <Download className="w-3 h-3" />
                                    Download
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Tests, Homework, & AI Quiz Creator */}
                <div className="space-y-6">
                  {/* Tests & Tasks List */}
                  <div className="space-y-4">
                    <h4 className="font-sans font-semibold text-sm text-navy-950 uppercase tracking-wider">
                      Online Tests & Tasks
                    </h4>
                    {quizzes.filter((q) => q.subjectId === selectedSubject.id).length === 0 ? (
                      <div className="bg-editorial-bg p-4 text-center text-xs text-neutral-500 border border-dashed border-navy-800/20">
                        No official tests listed. Use the AI practice box below!
                      </div>
                    ) : (
                      quizzes
                        .filter((q) => q.subjectId === selectedSubject.id)
                        .map((q) => {
                          const subRecord = submissions.find((s) => s.quizId === q.id);
                          return (
                            <div key={q.id} className="bg-editorial-paper p-4 border border-navy-800/10 shadow-sm space-y-3">
                              <div>
                                <h5 className="font-sans font-bold text-xs text-navy-950 leading-tight">{q.title}</h5>
                                <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed truncate">
                                  {q.description}
                                </p>
                              </div>
                              <div className="flex items-center justify-between border-t border-navy-800/10 pt-3">
                                {subRecord ? (
                                  <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-sans font-bold text-emerald-700 flex items-center gap-1">
                                      <CheckCircle className="w-3.5 h-3.5" /> Marked
                                    </span>
                                    {subRecord.score !== undefined && (
                                      <span className="text-xs font-bold text-navy-900">
                                        Score: {subRecord.score}/100
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[10px] uppercase font-sans font-bold text-amber-700">Unsubmitted</span>
                                )}

                                {subRecord ? (
                                  <button
                                    onClick={() => {
                                      alert(
                                        `FEEDBACK FOR ${q.title}:\n\nScore: ${subRecord.score}/100\n\nComments: ${
                                          subRecord.feedback || "Good effort."
                                        }`
                                      );
                                    }}
                                    className="text-[10px] font-sans font-bold text-navy-800 hover:text-gold-600 underline"
                                  >
                                    View Grade
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setActiveQuiz(q);
                                      setQuizAnswers({});
                                    }}
                                    className="bg-navy-800 hover:bg-navy-950 border border-gold-400 text-gold-400 font-sans font-bold text-[10px] px-3 py-1.5 transition-colors"
                                  >
                                    Start Test
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>

                  {/* AI Practice Quiz Generator Widget */}
                  <div className="bg-navy-800 p-5 text-white border border-gold-400 shadow-md space-y-3">
                    <div className="flex items-center gap-2 text-gold-400">
                      <Sparkles className="w-5 h-5" />
                      <h5 className="font-sans font-bold text-xs uppercase tracking-wider">AI Practice Quiz Generator</h5>
                    </div>
                    <p className="text-[11px] text-navy-100 font-sans leading-relaxed">
                      Need test preparation? Enter any specific chapter or topic, and Gemini will generate a custom 3-question diagnostic quiz tailored to your grade!
                    </p>
                    <form onSubmit={handleGeneratePractice} className="space-y-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-semibold text-gold-200 uppercase tracking-wider mb-1">Topic/Chapter Name</label>
                        <input
                          type="text"
                          required
                          disabled={isGeneratingQuiz}
                          value={practiceTopic}
                          onChange={(e) => setPracticeTopic(e.target.value)}
                          placeholder="e.g. Macbeth Witches prophecy, or Algebra factoring"
                          className="w-full bg-navy-900 px-3 py-2 border border-gold-400/20 focus:outline-none focus:border-gold-400 text-xs text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isGeneratingQuiz || !practiceTopic.trim()}
                        className="w-full flex items-center justify-center gap-2 bg-gold-400 hover:bg-gold-500 disabled:bg-navy-750 text-navy-950 font-sans font-bold text-xs py-2 transition-colors"
                      >
                        {isGeneratingQuiz ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            AI is compiling...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            Generate Diagnostic Quiz
                          </>
                        )}
                      </button>
                    </form>
                    {practiceSuccess && (
                      <p className="text-[10px] text-emerald-400 font-medium">
                        ✓ Quiz generated successfully! Scroll up to see the new test in your list.
                      </p>
                    )}
                    {practiceError && (
                      <p className="text-[10px] text-red-400 font-medium">{practiceError}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACTIVE QUIZ SCREEN */}
        {activeQuiz && (
          <div className="bg-editorial-paper p-6 border border-navy-800/10 shadow-sm space-y-6">
            <div className="border-b border-navy-800/10 pb-4">
              <button
                onClick={() => setActiveQuiz(null)}
                className="text-xs text-neutral-500 hover:text-navy-950 font-semibold mb-2 block"
              >
                ← Back to Subjects
              </button>
              <h3 className="text-lg font-serif font-semibold text-navy-950">{activeQuiz.title}</h3>
              <p className="text-xs text-neutral-500 mt-0.5">{activeQuiz.description}</p>
            </div>

            <form onSubmit={handleQuizSubmit} className="space-y-6">
              {activeQuiz.questions.map((q, idx) => (
                <div key={q.id} className="space-y-2 border border-navy-800/10 p-4 bg-editorial-bg">
                  <span className="text-[10px] font-sans font-bold text-gold-600 uppercase">Question {idx + 1}</span>
                  <p className="text-sm font-sans font-bold text-navy-950">{q.question}</p>

                  {q.type === "multiple-choice" && q.options ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {q.options.map((opt) => {
                        const isSelected = quizAnswers[q.id] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                            className={`px-4 py-2.5 text-left text-xs font-sans font-bold transition-all ${
                              isSelected
                                ? "bg-navy-800 text-gold-400 border border-gold-400"
                                : "bg-white border border-navy-800/10 text-navy-800 hover:bg-navy-50"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <textarea
                      required
                      rows={4}
                      value={quizAnswers[q.id] || ""}
                      onChange={(e) => setQuizAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 bg-white text-xs mt-2"
                      placeholder="Write your explanation or essay response..."
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-3 border-t border-navy-800/10 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveQuiz(null)}
                  className="px-4 py-2 border border-navy-800/20 text-xs font-sans font-bold text-navy-800 hover:bg-navy-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-navy-800 hover:bg-navy-950 border border-gold-400 text-gold-400 text-xs font-sans font-bold transition-colors"
                >
                  Submit Test Answers
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: LIVE CLASSES (TEAMS) */}
        {activeTab === "classes" && (
          <div className="space-y-6">
            <div className="bg-editorial-paper p-6 border border-navy-800/10 shadow-sm">
              <h3 className="text-lg font-serif font-semibold text-navy-950 flex items-center gap-2">
                <Video className="w-5 h-5 text-gold-600" />
                Scheduled Live Microsoft Teams Tutoring
              </h3>
              <p className="text-sm text-neutral-500 mt-1 font-sans">
                At Virtuelle Academique Centre, daily expert lectures and discussions are hosted through Microsoft Teams with real tutors. Join from your timetable below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamsSessions.length === 0 ? (
                <div className="bg-editorial-bg p-6 text-center text-xs text-neutral-500 border border-navy-800/10 md:col-span-2">
                  No Microsoft Teams live sessions listed on the schedule right now.
                </div>
              ) : (
                teamsSessions.map((session) => (
                  <div key={session.id} className="bg-editorial-paper p-5 border border-navy-800/10 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="bg-navy-50 border border-navy-800/20 text-navy-800 text-[10px] font-sans font-bold px-2 py-0.5 uppercase">
                        {session.subjectName}
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gold-600" /> {session.date}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-sans font-semibold text-sm text-navy-950 leading-tight">{session.title}</h4>
                      <p className="text-xs text-neutral-500 mt-1">Lecturer: {session.tutorName}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-navy-800/10 pt-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-400 font-sans font-bold uppercase">Time Slot</span>
                        <span className="text-xs font-bold text-navy-800">{session.time}</span>
                      </div>
                      <a
                        href={session.joinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 bg-navy-800 hover:bg-navy-950 border border-gold-400 text-gold-400 font-sans font-bold text-xs px-4 py-2 transition-all"
                      >
                        <Video className="w-4 h-4" />
                        Join Teams Call
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: UPLOAD DOCUMENTS (REGISTRATION VERIFICATION) */}
        {activeTab === "docs" && (
          <div className="space-y-6">
            <div className="bg-editorial-paper p-6 border border-navy-800/10 shadow-sm">
              <h3 className="text-lg font-serif font-semibold text-navy-950 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-gold-600" />
                Upload Verification Documents
              </h3>
              <p className="text-sm text-neutral-500 mt-1 font-sans">
                To activate and complete your official enrollment, please upload scanned copies of required documents (Page 9 prospectus). These are securely encrypted under strict POPI Act compliance guidelines.
              </p>
            </div>

            <div className="bg-editorial-paper p-6 border border-navy-800/10 shadow-sm space-y-4">
              <h4 className="font-sans font-semibold text-sm text-navy-900 uppercase tracking-wider">Required Document Checklists</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { type: "id_parent", label: "Certified ID Copies of Parents/Guardians" },
                  { type: "birth_certificate", label: "Certified Birth Certificate / Student Passport" },
                  { type: "report_card", label: "Latest School Report Card (2025)" },
                  { type: "proof_of_address", label: "Proof of Residential Address" },
                  { type: "bank_statement", label: "Latest 3-Month Bank Statement" },
                  { type: "photo", label: "Passport Photos of Parents and Learner" },
                ].map((item) => {
                  const status = getDocStatus(item.type);
                  return (
                    <div
                      key={item.type}
                      className="border border-navy-800/10 p-4 flex items-center justify-between hover:bg-editorial-bg transition-colors"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-sans font-semibold text-navy-950 block">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block w-2.5 h-2.5 rounded-full ${
                              status === "verified"
                                ? "bg-emerald-500"
                                : status === "pending"
                                ? "bg-amber-500"
                                : "bg-neutral-300"
                            }`}
                          />
                          <span className="text-[10px] uppercase font-extrabold text-neutral-500">
                            {status === "verified"
                              ? "Verified"
                              : status === "pending"
                              ? "Pending Staff Review"
                              : "Not Uploaded Yet"}
                          </span>
                        </div>
                      </div>

                      {status === "not_uploaded" ? (
                        <button
                          onClick={() => handleDocUploadSimulated(item.type, item.label)}
                          className="flex items-center gap-1.5 bg-navy-50 hover:bg-navy-100 text-navy-850 font-sans font-bold text-xs px-3 py-2 border border-navy-800/20 transition-colors"
                        >
                          <UploadCloud className="w-3.5 h-3.5 text-gold-600" />
                          Upload
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-2 border border-emerald-200">
                          <FileCheck className="w-4 h-4" />
                          Uploaded
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FEE ACCOUNTS (FINANCIAL) */}
        {activeTab === "finance" && (
          <div className="space-y-6">
            <div className="bg-editorial-paper p-6 border border-navy-800/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-serif font-semibold text-navy-950 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gold-600" />
                  Your Student Fee Accounts
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  View, audit, and pay outstanding school registration, student card, or monthly tuition invoices.
                </p>
              </div>
              <div className="bg-navy-950 text-white p-4 flex flex-col text-right border border-gold-400/30">
                <span className="text-[10px] text-gold-400 font-sans font-bold uppercase">Total Outstanding Balance</span>
                <span className="text-lg font-serif font-bold text-gold-400">R {totalOutstanding}.00</span>
              </div>
            </div>

            {/* Invoices grid */}
            <div className="bg-editorial-paper p-6 border border-navy-800/10 shadow-sm space-y-4">
              <h4 className="font-sans font-semibold text-sm text-navy-950 uppercase tracking-wider">Academic Fees Account Ledger</h4>

              {invoices.length === 0 ? (
                <div className="bg-editorial-bg p-6 text-center text-xs text-neutral-500 border border-navy-800/10">
                  No billing statements registered for your account.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-navy-800/10 text-navy-800 uppercase tracking-wider font-bold">
                        <th className="py-3 px-2">Invoice ID</th>
                        <th className="py-3 px-2">Description</th>
                        <th className="py-3 px-2">Due Date</th>
                        <th className="py-3 px-2">Amount</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-800/10 font-medium font-sans">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-editorial-bg">
                          <td className="py-4 px-2 font-mono text-neutral-500">{inv.id}</td>
                          <td className="py-4 px-2 text-navy-950">{inv.description}</td>
                          <td className="py-4 px-2 text-neutral-500">{inv.dueDate}</td>
                          <td className="py-4 px-2 font-sans font-bold text-navy-950">R {inv.amount}.00</td>
                          <td className="py-4 px-2">
                            <span
                              className={`px-2 py-1 text-[10px] font-bold uppercase ${
                                inv.status === "paid"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-right">
                            {inv.status !== "paid" ? (
                              <button
                                onClick={() => onPayInvoice(inv.id)}
                                className="bg-navy-800 hover:bg-navy-950 border border-gold-400 text-gold-400 text-[10px] font-sans font-bold px-3 py-1.5 transition-all"
                              >
                                Pay Online
                              </button>
                            ) : (
                              <span className="text-[10px] text-emerald-600 font-extrabold flex items-center justify-end gap-1 font-sans">
                                <CheckCircle className="w-3.5 h-3.5" /> Settled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Virtuelle banking details card matching Page 12 */}
            <div className="bg-editorial-bg border border-navy-800/10 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-1">
                <h4 className="font-sans font-semibold text-sm text-navy-950">Virtuelle Banking details</h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                  You can also make direct manual payments via EFT or ATM deposit using standard banking apps. Always include the student’s name & surname as the payment reference.
                </p>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="bg-editorial-paper p-4 border border-navy-800/10 space-y-1">
                  <span className="text-[9px] font-bold uppercase text-gold-600">Standard Bank Account (Main)</span>
                  <p className="font-sans font-bold text-navy-950">MIM International t/a Virtuelle</p>
                  <p className="text-neutral-600 font-sans">Account #: 10233357759</p>
                  <p className="text-neutral-600 font-sans">Branch code: 051001</p>
                </div>
                <div className="bg-editorial-paper p-4 border border-navy-800/10 space-y-1">
                  <span className="text-[9px] font-bold uppercase text-navy-700">Capitec Account (Savings)</span>
                  <p className="font-sans font-bold text-navy-950">Virtuelle Academique</p>
                  <p className="text-neutral-600 font-sans">Account #: 1368387061</p>
                  <p className="text-neutral-600 font-sans">Branch code: 470010</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STUNNING DOCUMENT HANDBOOK & ACTIVITY SHEET PREVIEW MODAL */}
        {previewDoc && (
          <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-gold-400 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Top Toolbar */}
              <div className="bg-navy-950 text-white p-4 border-b border-gold-400 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gold-400/20 border border-gold-400 flex items-center justify-center text-gold-400 font-serif font-bold text-xs">
                    VA
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-neutral-100 truncate max-w-md">
                      {previewDoc.name}
                    </h3>
                    <p className="text-[10px] text-gold-400 font-sans uppercase tracking-widest">
                      {previewDoc.subjectName} • {previewDoc.moduleTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadDocumentFile(previewDoc)}
                    className="flex items-center gap-1.5 bg-gold-400 hover:bg-gold-500 text-navy-950 px-3 py-1.5 text-xs font-sans font-bold transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </button>
                  <button
                    onClick={() => {
                      const win = window.open("", "_blank");
                      if (win) {
                        win.document.write(generateDocumentHTML(previewDoc));
                        win.document.close();
                        setTimeout(() => win.print(), 500);
                      }
                    }}
                    className="flex items-center gap-1.5 bg-navy-800 hover:bg-navy-900 border border-gold-400/40 text-neutral-200 px-3 py-1.5 text-xs font-sans font-bold transition-all"
                  >
                    <Printer className="w-3.5 h-3.5 text-gold-400" />
                    Print PDF
                  </button>
                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="p-1.5 hover:bg-navy-800 text-neutral-400 hover:text-white transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Document HTML Preview Frame */}
              <div className="flex-1 bg-neutral-100 p-2 sm:p-6 overflow-y-auto">
                <iframe
                  title={previewDoc.name}
                  srcDoc={generateDocumentHTML(previewDoc)}
                  className="w-full h-[68vh] border border-neutral-300 shadow-lg bg-white"
                />
              </div>

              {/* Modal Footer */}
              <div className="bg-editorial-bg p-3 border-t border-navy-800/10 flex justify-between items-center text-[10px] text-neutral-500 font-sans">
                <span>Virtuelle Academique Official Student Document | CAPS Aligned</span>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="font-bold text-navy-800 hover:text-gold-600 uppercase tracking-wider"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

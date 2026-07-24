/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { StudentProfile, Invoice, QuizSubmission, ApplicationForm } from "../types";
import { CreditCard, GraduationCap, FileCheck, CheckCircle, Award, Calendar, ExternalLink } from "lucide-react";

interface ParentDashboardProps {
  parentStudents: StudentProfile[];
  invoices: Invoice[];
  submissions: QuizSubmission[];
  applicationForms: { studentId: string; form: any }[];
  onPayInvoice: (invoiceId: string) => void;
}

export default function ParentDashboard({
  parentStudents,
  invoices,
  submissions,
  applicationForms,
  onPayInvoice,
}: ParentDashboardProps) {
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(parentStudents[0] || null);
  const [activeSubTab, setActiveSubTab] = useState<"grades" | "billing" | "contracts">("grades");

  const studentInvoices = selectedStudent ? invoices.filter((i) => i.studentId === selectedStudent.id) : [];
  const outstandingInvoices = studentInvoices.filter((i) => i.status !== "paid");
  const totalOutstanding = outstandingInvoices.reduce((sum, i) => sum + i.amount, 0);

  const studentSubmissions = selectedStudent ? submissions.filter((s) => s.studentId === selectedStudent.id) : [];
  const studentForm = selectedStudent ? applicationForms.find((f) => f.studentId === selectedStudent.id)?.form : null;

  return (
    <div id="parent-dashboard-root" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* LEFT COLUMN: Child selector */}
      <div id="parent-side-panel" className="lg:col-span-1 space-y-6">
        <div className="bg-navy-800 p-5 text-white border border-gold-400 shadow-md">
          <span className="text-[9px] font-sans font-bold uppercase text-gold-400 tracking-wider">Parent / Guardian Portal</span>
          <h3 className="text-sm font-sans font-semibold mt-1 text-neutral-100"> robert.doe@gmail.com</h3>
          <p className="text-[11px] text-navy-200 mt-1 font-sans">Responsible account holder for homeschooling learner progress.</p>
        </div>

        <div className="bg-editorial-paper p-5 border border-navy-800/10 shadow-sm space-y-3">
          <h4 className="font-sans font-semibold text-xs text-navy-950 uppercase tracking-wider">Your Registered Children</h4>
          <div className="space-y-2">
            {parentStudents.map((child) => {
              const isSelected = selectedStudent?.id === child.id;
              return (
                <button
                  key={child.id}
                  onClick={() => {
                    setSelectedStudent(child);
                  }}
                  className={`w-full text-left p-3.5 border transition-all ${
                    isSelected
                      ? "bg-navy-800 border-gold-400 text-white shadow-sm"
                      : "bg-editorial-bg border border-navy-800/10 hover:bg-navy-50 text-navy-900"
                  }`}
                >
                  <div className={`font-sans font-bold text-xs ${isSelected ? "text-gold-400" : "text-navy-950"}`}>{child.name}</div>
                  <div className="text-[10px] mt-1 flex justify-between font-sans">
                    <span className={isSelected ? "text-neutral-300" : "text-neutral-500"}>{child.grade}</span>
                    <span className={child.status === "active" ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                      {child.status.toUpperCase()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedStudent && (
          <div className="bg-editorial-paper p-4 border border-navy-800/10 shadow-sm space-y-1">
            {[
              { id: "grades", label: "Academic Grades & Report", icon: GraduationCap },
              { id: "billing", label: "School Fees & Ledger", icon: CreditCard },
              { id: "contracts", label: "Tuition Contract Agreement", icon: FileCheck },
            ].map((subTab) => {
              const Icon = subTab.icon;
              const isSelected = activeSubTab === subTab.id;
              return (
                <button
                  key={subTab.id}
                  onClick={() => setActiveSubTab(subTab.id as any)}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 text-xs font-sans font-semibold transition-all ${
                    isSelected ? "bg-navy-800 text-gold-400 border border-gold-400/30" : "text-navy-950 hover:bg-neutral-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {subTab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Child Status Details */}
      <div id="parent-main-panel" className="lg:col-span-3 space-y-6">
        {selectedStudent ? (
          <>
            {/* TAB 1: ACADEMIC GRADES & PROGRESS REPORT */}
            {activeSubTab === "grades" && (
              <div className="space-y-6">
                <div className="bg-editorial-paper p-6 border border-navy-800/10 shadow-sm">
                  <h3 className="text-lg font-serif font-semibold text-navy-950 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-gold-600" />
                    Homeschool Academic Progress Report ({selectedStudent.name})
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 font-sans">
                    See completed online tasks, marks awarded, and helpful remarks from Mrs. Sandra van Wyk or subject tutors.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Test Submissions and comments details */}
                  <div className="md:col-span-2 bg-editorial-paper p-6 border border-navy-800/10 shadow-sm space-y-4">
                    <h4 className="font-sans font-semibold text-sm text-navy-950 uppercase tracking-wider">Completed Assessments</h4>
                    {studentSubmissions.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic py-4 font-sans">No completed online tasks registered for this term yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {studentSubmissions.map((sub) => (
                          <div key={sub.id} className="border border-navy-800/10 p-4 bg-editorial-bg space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[9px] font-sans font-bold text-gold-600 uppercase">ONLINE ASSIGNMENT</span>
                                <h5 className="font-sans font-semibold text-xs text-navy-950 mt-0.5">{sub.quizTitle}</h5>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-sans font-bold text-navy-950 bg-white border border-navy-800/10 px-2.5 py-1">
                                  Score: {sub.score ?? "Unmarked"}/100
                                </span>
                              </div>
                            </div>
                            {sub.feedback && (
                              <div className="bg-white p-3 border border-navy-800/10 text-xs text-neutral-600 mt-2 space-y-1 font-sans">
                                <span className="font-sans font-bold text-navy-900 text-[10px] block">TUTOR EVALUATION COMMENTS</span>
                                <p className="italic">"{sub.feedback}"</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Summary progress stats */}
                  <div className="space-y-4">
                    <div className="bg-editorial-paper p-5 border border-navy-800/10 shadow-sm space-y-3">
                      <h4 className="font-sans font-semibold text-xs text-navy-950 uppercase">Average Academic Term Grade</h4>
                      <div className="flex items-center gap-3">
                        <div className="p-4 bg-navy-50 border border-navy-800/10 flex items-center justify-center">
                          <Award className="w-8 h-8 text-gold-600" />
                        </div>
                        <div>
                          <span className="text-3xl font-sans font-bold text-navy-950">
                            {studentSubmissions.length > 0
                              ? `${Math.round(
                                  studentSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) /
                                    studentSubmissions.filter((s) => s.score !== undefined).length
                                )}%`
                              : "N/A"}
                          </span>
                          <span className="text-[10px] font-sans font-bold text-neutral-400 uppercase block mt-0.5 font-sans">TERMLY AVERAGE</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-navy-800 p-5 border border-gold-400 text-white space-y-2.5 shadow-md">
                      <h4 className="font-sans font-bold text-[10px] uppercase text-gold-400 tracking-wider">Scheduled Micro-Lessons</h4>
                      <p className="text-[11px] text-navy-100 font-sans leading-relaxed">
                        Join scheduled Microsoft Teams workshops together with your child to check learning environments and meet coordinators.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SCHOOL FEES ACCOUNT & DIRECT EFT RECEIPING */}
            {activeSubTab === "billing" && (
              <div className="space-y-6">
                <div className="bg-editorial-paper p-6 border border-navy-800/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-serif font-semibold text-navy-950 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-gold-600" />
                      Academic Tuition Fees Ledger ({selectedStudent.name})
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Pay registration or tuition fees, download past receipts, or view detailed balances due.
                    </p>
                  </div>
                  <div className="bg-navy-950 text-white p-4 border border-gold-400/30 flex flex-col text-right">
                    <span className="text-[10px] text-gold-400 font-sans font-bold uppercase">Total Account Balance</span>
                    <span className="text-lg font-serif font-bold text-gold-400 font-sans">R {totalOutstanding}.00</span>
                  </div>
                </div>

                <div className="bg-editorial-paper p-6 border border-navy-800/10 shadow-sm space-y-4">
                  <h4 className="font-sans font-semibold text-sm text-navy-950 uppercase tracking-wider">Financial Transactions History</h4>
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
                        {studentInvoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-editorial-bg">
                            <td className="py-4 px-2 font-mono text-neutral-500">{inv.id}</td>
                            <td className="py-4 px-2 text-navy-950">{inv.description}</td>
                            <td className="py-4 px-2 text-neutral-500">{inv.dueDate}</td>
                            <td className="py-4 px-2 font-sans font-bold text-navy-950">R {inv.amount}.00</td>
                            <td className="py-4 px-2">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  inv.status === "paid"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    : "bg-amber-50 text-amber-700 border border-amber-100"
                                }`}
                              >
                                {inv.status}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-right">
                              {inv.status !== "paid" ? (
                                <button
                                  onClick={() => onPayInvoice(inv.id)}
                                  className="bg-navy-800 hover:bg-navy-950 border border-gold-400 text-gold-400 text-[10px] font-sans font-bold px-3 py-1.5 transition-colors"
                                >
                                  Pay via EFT/Card
                                </button>
                              ) : (
                                <span className="text-[10px] text-emerald-600 font-sans font-bold flex items-center justify-end gap-1">
                                  <CheckCircle className="w-3.5 h-3.5" /> Paid ✓
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TUITION CONTRACT AGREEMENT */}
            {activeSubTab === "contracts" && (
              <div className="space-y-6">
                <div className="bg-editorial-paper p-6 border border-navy-800/10 shadow-sm">
                  <h3 className="text-lg font-serif font-semibold text-navy-950 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-gold-600" />
                    Signed Tuition Contract & Disclaimer Agreement
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 font-sans">
                    Your digitally-signed enrollment agreement contract, terms and conditions, and tuition acknowledgement details.
                  </p>
                </div>

                {studentForm ? (
                  <div className="bg-editorial-paper p-6 border border-navy-800/10 shadow-sm space-y-4">
                    <h4 className="font-sans font-semibold text-sm text-navy-950 uppercase border-b border-navy-800/10 pb-2">
                      Digital Contract Record File
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div className="space-y-1 bg-editorial-bg p-3 border border-navy-800/10">
                        <span className="text-neutral-500 text-[10px] font-bold uppercase block">Learner Full Name</span>
                        <p className="font-bold text-navy-950">
                          {studentForm.learnerInfo.fullName} {studentForm.learnerInfo.surname}
                        </p>
                      </div>
                      <div className="space-y-1 bg-editorial-bg p-3 border border-navy-800/10">
                        <span className="text-neutral-500 text-[10px] font-bold uppercase block">Enrolled Grade</span>
                        <p className="font-bold text-navy-950">{studentForm.learnerInfo.gradeIn2025_2026}</p>
                      </div>
                      <div className="space-y-1 bg-editorial-bg p-3 border border-navy-800/10">
                        <span className="text-neutral-500 text-[10px] font-bold uppercase block">Primary Signatory</span>
                        <p className="font-bold text-navy-950">{studentForm.tuitionAgreement.parent1Name}</p>
                      </div>
                      <div className="space-y-1 bg-editorial-bg p-3 border border-navy-800/10">
                        <span className="text-neutral-500 text-[10px] font-bold uppercase block">Monthly Acknowledged Amount</span>
                        <p className="font-bold text-gold-600">R {studentForm.tuitionAgreement.monthlyAmount}.00</p>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 text-xs space-y-1 font-sans">
                      <span className="font-sans font-bold flex items-center gap-1 text-emerald-900">
                        <CheckCircle className="w-4 h-4 text-emerald-600" /> Digital Contract Enforceability
                      </span>
                      <p className="text-[11px] leading-relaxed">
                        This document was digitally executed and accepted by <span className="font-bold">{studentForm.tuitionAgreement.parent1Signature}</span> on <span className="font-bold">{studentForm.tuitionAgreement.date}</span>. Under South African ECTA Act guidelines, digital contracts and acknowledgements of debt hold absolute legal standing.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-editorial-bg border border-navy-800/10 p-6 text-center text-xs text-neutral-500 font-sans">
                    No matching signed digital contract form found for this student. Contact support at <span className="font-bold text-navy-800">virtuelle.academique@gmail.com</span>.
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-editorial-bg border border-navy-800/10 p-6 text-center text-xs text-neutral-500 font-sans">
            No children registered on this parent account.
          </div>
        )}
      </div>
    </div>
  );
}

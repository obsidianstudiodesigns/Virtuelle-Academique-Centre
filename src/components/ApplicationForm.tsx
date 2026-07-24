/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ApplicationForm as FormType, AccountResponsibility, Subject } from "../types";
import { ShieldCheck, FileText, UserPlus, GraduationCap, ChevronRight, ChevronLeft, CreditCard, UploadCloud, Check, Trash2, AlertCircle } from "lucide-react";

interface ApplicationFormProps {
  onSubmit: (formData: any, chosenSubjects: string[]) => void;
  initialGrade?: string;
  subjectsList: Subject[];
}

export default function ApplicationForm({ onSubmit, initialGrade = "Grade 10", subjectsList }: ApplicationFormProps) {
  const [step, setStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [grade, setGrade] = useState(initialGrade);

  // Auto-calculated monthly tuition amount based on Grade (Page 5)
  const getTuitionAmount = (selectedGrade: string) => {
    if (selectedGrade === "Grade R") return 1800;
    if (["Grade 1", "Grade 2", "Grade 3"].includes(selectedGrade)) return 2000;
    if (["Grade 4", "Grade 5", "Grade 6"].includes(selectedGrade)) return 2200;
    if (["Grade 7", "Grade 8", "Grade 9"].includes(selectedGrade)) return 2400;
    if (selectedGrade === "Grade 10") return 2600;
    if (selectedGrade === "Grade 11") return 2800;
    if (selectedGrade === "Grade 12") return 3000;
    return 2600; // Default
  };

  const monthlyTuition = getTuitionAmount(grade);

  const [formData, setFormData] = useState<FormType>({
    learnerInfo: {
      fullName: "",
      surname: "",
      nickname: "",
      dateOfBirth: "",
      idNumber: "",
      nationality: "South African",
      church: "",
      gender: "Male",
      homeLanguage: "English",
      homeLanguageOther: "",
      preferredLanguage: "English",
      cellphone: "",
      email: "",
      entryDate: "2026-07-21",
      gradeIn2025_2026: initialGrade,
    },
    familyInfo: {
      familyStatus: "Both Parents",
      guardianType: "Guardian",
      parentsPassed: [],
    },
    medicalInfo: {
      chronicIllness: "None",
      allergies: "None",
      medication: "None",
      medicalAidInfo: "",
    },
    nextOfKin: {
      name: "",
      contact: "",
      relationship: "",
    },
    parent1: {
      title: "Mr",
      fullNames: "",
      surname: "",
      initials: "",
      nickname: "",
      idNumber: "",
      preferredLanguage: "English",
      cellNumber: "",
      homeNumber: "",
      faxNumber: "",
      email: "",
      homeAddress: "",
      postalAddress: "",
      occupationStatus: "Full Time",
      occupation: "",
      employer: "",
      officeNumber: "",
      workAddress: "",
      livesWithParent: "Yes",
    },
    accountResponsibility: {
      responsibleParty: "Parent 1",
    },
    tuitionAgreement: {
      parent1Name: "",
      parent2Name: "",
      monthlyAmount: monthlyTuition,
      penaltyAcknowledged: false,
      termsAccepted: false,
      parent1Signature: "",
      parent2Signature: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const handleLearnerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev };
      updated.learnerInfo = { ...updated.learnerInfo, [name]: value };
      if (name === "gradeIn2025_2026") {
        setGrade(value);
        updated.tuitionAgreement = {
          ...updated.tuitionAgreement,
          monthlyAmount: getTuitionAmount(value),
        };
      }
      return updated;
    });
  };

  const handleMedicalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev };
      updated.medicalInfo = { ...updated.medicalInfo, [name]: value };
      return updated;
    });
  };

  const handleNextOfKinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev };
      updated.nextOfKin = { ...updated.nextOfKin, [name]: value };
      return updated;
    });
  };

  const handleParent1Change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev };
      updated.parent1 = { ...updated.parent1, [name]: value };
      return updated;
    });
  };

  const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => {
      const updated = { ...prev };
      updated.tuitionAgreement = { ...updated.tuitionAgreement, [name]: val };
      return updated;
    });
  };

  const handleSubjectToggle = (subjName: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjName) ? prev.filter((s) => s !== subjName) : [...prev, subjName]
    );
  };

  const [uploadedDocs, setUploadedDocs] = useState<{
    id_parent?: { name: string; size: string; file?: File };
    birth_certificate?: { name: string; size: string; file?: File };
    report_card?: { name: string; size: string; file?: File };
    proof_address?: { name: string; size: string; file?: File };
  }>({});

  const getUploadedDocsPayload = () => {
    const list = [];
    if (uploadedDocs.id_parent) {
      list.push({
        id: "doc-id-parent-" + Math.random().toString(36).substr(2, 5),
        name: uploadedDocs.id_parent.name,
        type: "id_parent",
        fileSize: uploadedDocs.id_parent.size,
        uploadedAt: new Date().toISOString().split("T")[0]
      });
    }
    if (uploadedDocs.birth_certificate) {
      list.push({
        id: "doc-birth-cert-" + Math.random().toString(36).substr(2, 5),
        name: uploadedDocs.birth_certificate.name,
        type: "birth_certificate",
        fileSize: uploadedDocs.birth_certificate.size,
        uploadedAt: new Date().toISOString().split("T")[0]
      });
    }
    if (uploadedDocs.report_card) {
      list.push({
        id: "doc-report-card-" + Math.random().toString(36).substr(2, 5),
        name: uploadedDocs.report_card.name,
        type: "report_card",
        fileSize: uploadedDocs.report_card.size,
        uploadedAt: new Date().toISOString().split("T")[0]
      });
    }
    if (uploadedDocs.proof_address) {
      list.push({
        id: "doc-proof-address-" + Math.random().toString(36).substr(2, 5),
        name: uploadedDocs.proof_address.name,
        type: "proof_address",
        fileSize: uploadedDocs.proof_address.size,
        uploadedAt: new Date().toISOString().split("T")[0]
      });
    }
    return list;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 5) {
      const isMissingRequired = !uploadedDocs.id_parent || !uploadedDocs.birth_certificate || !uploadedDocs.report_card;
      if (isMissingRequired) {
        alert("Please upload the required documents (Parent ID, Birth Certificate, and Last Academic Report) to proceed. You can also click the 'Simulate Demo Uploads' button to instantly auto-fill them.");
        return;
      }
    }
    if (step < 6) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFormSubmit = () => {
    const finalFormPayload = {
      ...formData,
      uploadedDocuments: getUploadedDocsPayload()
    };
    onSubmit(finalFormPayload, selectedSubjects);
  };

  // Choice subjects from Page 13 of document
  const defaultChoiceSubjects = [
    "English Home Language",
    "Afrikaans FAL",
    "Isizulu FAL",
    "Life Orientation",
    "Mathematics",
    "Mathematical Literacy",
    "Physical Science",
    "Life Science",
    "History",
    "Geography",
    "Tourism",
    "Accounting",
    "Business Studies",
    "Economics",
    "Consumer Studies",
    "Agricultural Studies",
    "French",
    "Spanish",
    "German",
    "Dance",
    "Drama",
    "Visual Arts",
    "Religious Studies",
    "EGD",
    "Civil Technology",
    "CAT",
    "IT",
    "Robotics",
    "AI",
    "Criminology",
    "Sign language",
  ];

  return (
    <div id="application-contract-root" className="w-full max-w-4xl mx-auto bg-editorial-paper shadow-xl border border-navy-800/10 overflow-hidden">
      {/* Form Header */}
      <div id="form-header" className="bg-navy-800 px-6 py-8 text-white relative border-b border-gold-400/30">
        <div className="absolute top-4 right-6 flex items-center gap-1.5 bg-navy-950 text-gold-400 border border-gold-400/30 px-3 py-1 text-[11px] font-sans font-bold">
          <ShieldCheck className="w-4 h-4" />
          POPIA Encrypted Database Standards
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-navy-900 border border-gold-400 flex items-center justify-center">
            <FileText className="w-8 h-8 text-gold-400" />
          </div>
          <div>
            <span className="text-gold-400 text-xs font-sans font-bold uppercase tracking-widest">Enrollment Contract</span>
            <h2 className="text-2xl font-serif font-bold tracking-tight">Application & Tuition Agreement</h2>
            <p className="text-sm text-neutral-300 mt-0.5 font-sans">Please complete all fields digitally to generate your official student file.</p>
          </div>
        </div>

        {/* Multi-step stepper indicators */}
        <div className="flex items-center justify-between mt-8 border-t border-navy-900 pt-6">
          {[
            { num: 1, label: "Learner" },
            { num: 2, label: "Family & Meds" },
            { num: 3, label: "Parent Profile" },
            { num: 4, label: "Agreement" },
            { num: 5, label: "Documents" },
            { num: 6, label: "Subjects" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-sans font-bold text-xs border transition-colors ${
                  step === s.num
                    ? "bg-gold-400 text-navy-950 border-gold-400"
                    : step > s.num
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-navy-900 text-neutral-400 border-navy-800"
                }`}
              >
                {s.num}
              </div>
              <span className={`text-xs font-sans font-bold hidden md:inline ${step === s.num ? "text-gold-400" : "text-neutral-400"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps Content */}
      <div className="p-6 md:p-8">
        <form onSubmit={handleNext}>
          {/* STEP 1: LEARNER INFO */}
          {step === 1 && (
            <div id="step-learner-info" className="space-y-6">
              <div className="border-b border-navy-800/10 pb-4">
                <h3 className="text-lg font-serif font-semibold text-navy-950 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-gold-600" />
                  Learner Information (Grade R to 12)
                </h3>
                <p className="text-sm text-neutral-500 mt-0.5 font-sans">Enter details of the student applying for admission.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Full Names</label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.learnerInfo.fullName}
                    onChange={handleLearnerChange}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                    placeholder="e.g. John"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Surname</label>
                  <input
                    type="text"
                    required
                    name="surname"
                    value={formData.learnerInfo.surname}
                    onChange={handleLearnerChange}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                    placeholder="e.g. Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Nickname</label>
                  <input
                    type="text"
                    name="nickname"
                    value={formData.learnerInfo.nickname}
                    onChange={handleLearnerChange}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                    placeholder="e.g. Johnny"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    name="dateOfBirth"
                    value={formData.learnerInfo.dateOfBirth}
                    onChange={handleLearnerChange}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">South African ID Number / Passport</label>
                  <input
                    type="text"
                    required
                    name="idNumber"
                    value={formData.learnerInfo.idNumber}
                    onChange={handleLearnerChange}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-mono text-navy-950"
                    placeholder="e.g. 1005145028081"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Nationality</label>
                  <input
                    type="text"
                    required
                    name="nationality"
                    value={formData.learnerInfo.nationality}
                    onChange={handleLearnerChange}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Grade in 2026</label>
                  <select
                    name="gradeIn2025_2026"
                    value={formData.learnerInfo.gradeIn2025_2026}
                    onChange={handleLearnerChange}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                  >
                    <option value="Grade R">Grade R (R1 800/pm)</option>
                    <option value="Grade 1">Grade 1 (R2 000/pm)</option>
                    <option value="Grade 2">Grade 2 (R2 000/pm)</option>
                    <option value="Grade 3">Grade 3 (R2 000/pm)</option>
                    <option value="Grade 4">Grade 4 (R2 200/pm)</option>
                    <option value="Grade 5">Grade 5 (R2 200/pm)</option>
                    <option value="Grade 6">Grade 6 (R2 200/pm)</option>
                    <option value="Grade 7">Grade 7 (R2 400/pm)</option>
                    <option value="Grade 8">Grade 8 (R2 400/pm)</option>
                    <option value="Grade 9">Grade 9 (R2 400/pm)</option>
                    <option value="Grade 10">Grade 10 (R2 600/pm)</option>
                    <option value="Grade 11">Grade 11 (R2 800/pm)</option>
                    <option value="Grade 12">Grade 12 (R3 000/pm)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.learnerInfo.gender}
                    onChange={handleLearnerChange}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Learner Cellphone Number</label>
                  <input
                    type="tel"
                    name="cellphone"
                    value={formData.learnerInfo.cellphone}
                    onChange={handleLearnerChange}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                    placeholder="e.g. 082 345 6789"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Learner Email</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.learnerInfo.email}
                    onChange={handleLearnerChange}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                    placeholder="learner@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Preferred Language of Instruction</label>
                  <select
                    name="preferredLanguage"
                    value={formData.learnerInfo.preferredLanguage}
                    onChange={handleLearnerChange}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                  >
                    <option value="English">English</option>
                    <option value="Afrikaans">Afrikaans</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Church / Religion affiliation</label>
                  <input
                    type="text"
                    name="church"
                    value={formData.learnerInfo.church}
                    onChange={handleLearnerChange}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                    placeholder="e.g. Methodist / Christian"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: FAMILY & MEDICAL */}
          {step === 2 && (
            <div id="step-family-medical" className="space-y-6">
              <div className="border-b border-navy-800/10 pb-4">
                <h3 className="text-lg font-serif font-semibold text-navy-950 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-gold-600" />
                  Family, Next of Kin & Medical Information
                </h3>
                <p className="text-sm text-neutral-500 mt-0.5 font-sans">Critical information for school records and emergency contact situations.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-sans font-bold text-sm text-navy-950 border-l-2 border-gold-400 pl-2">Family Information</h4>
                  <div>
                    <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Family Status</label>
                    <select
                      name="familyStatus"
                      value={formData.familyInfo.familyStatus}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          familyInfo: { ...prev.familyInfo, familyStatus: e.target.value as any },
                        }))
                      }
                      className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                    >
                      <option value="Both Parents">Both Parents</option>
                      <option value="Single Parent">Single Parent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Guardian / Care Status</label>
                    <select
                      name="guardianType"
                      value={formData.familyInfo.guardianType}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          familyInfo: { ...prev.familyInfo, guardianType: e.target.value as any },
                        }))
                      }
                      className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                    >
                      <option value="Guardian">Guardian</option>
                      <option value="Childrens Home">Childrens Home</option>
                      <option value="Widow/er">Widow/er</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <h4 className="font-sans font-bold text-sm text-navy-950 border-l-2 border-gold-400 pl-2 pt-2">Next of Kin Contact (Not Parent)</h4>
                  <div>
                    <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Name & Surname</label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.nextOfKin.name}
                      onChange={handleNextOfKinChange}
                      className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                      placeholder="e.g. Jane Smith"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Contact Number</label>
                      <input
                        type="text"
                        required
                        name="contact"
                        value={formData.nextOfKin.contact}
                        onChange={handleNextOfKinChange}
                        className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                        placeholder="071 234 5678"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Relationship</label>
                      <input
                        type="text"
                        required
                        name="relationship"
                        value={formData.nextOfKin.relationship}
                        onChange={handleNextOfKinChange}
                        className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                        placeholder="e.g. Aunt"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-sans font-bold text-sm text-navy-950 border-l-2 border-gold-400 pl-2">Medical Information</h4>
                  <div>
                    <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Chronic Illnesses</label>
                    <input
                      type="text"
                      name="chronicIllness"
                      value={formData.medicalInfo.chronicIllness}
                      onChange={handleMedicalChange}
                      className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                      placeholder="e.g. Asthma, or None"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Allergies</label>
                    <input
                      type="text"
                      name="allergies"
                      value={formData.medicalInfo.allergies}
                      onChange={handleMedicalChange}
                      className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                      placeholder="e.g. Peanuts, Dust, or None"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Current Medication</label>
                    <input
                      type="text"
                      name="medication"
                      value={formData.medicalInfo.medication}
                      onChange={handleMedicalChange}
                      className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                      placeholder="e.g. Inhaler, or None"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Medical Aid Details (Name & Number)</label>
                    <textarea
                      name="medicalAidInfo"
                      value={formData.medicalInfo.medicalAidInfo}
                      onChange={handleMedicalChange}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                      placeholder="e.g. Discovery Health - Plan Classic, Membership # 123456789"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PARENT PROFILE */}
          {step === 3 && (
            <div id="step-parent-profile" className="space-y-6">
              <div className="border-b border-navy-800/10 pb-4">
                <h3 className="text-lg font-serif font-semibold text-navy-950 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-gold-600" />
                  Primary Parent / Guardian 1 Details
                </h3>
                <p className="text-sm text-neutral-500 mt-0.5 font-sans">Contact and occupational profile of the main legal guardian responsible.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Title</label>
                  <select
                    name="title"
                    value={formData.parent1.title}
                    onChange={handleParent1Change}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                  >
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                    <option value="Dr">Dr</option>
                    <option value="Prof">Prof</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Initials</label>
                    <input
                      type="text"
                      required
                      name="initials"
                      value={formData.parent1.initials}
                      onChange={handleParent1Change}
                      className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                      placeholder="RD"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Nickname</label>
                    <input
                      type="text"
                      name="nickname"
                      value={formData.parent1.nickname}
                      onChange={handleParent1Change}
                      className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                      placeholder="Rob"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Full Names</label>
                  <input
                    type="text"
                    required
                    name="fullNames"
                    value={formData.parent1.fullNames}
                    onChange={handleParent1Change}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                    placeholder="Robert"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Surname</label>
                  <input
                    type="text"
                    required
                    name="surname"
                    value={formData.parent1.surname}
                    onChange={handleParent1Change}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">SA ID Number / Passport</label>
                  <input
                    type="text"
                    required
                    name="idNumber"
                    value={formData.parent1.idNumber}
                    onChange={handleParent1Change}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-mono text-navy-950"
                    placeholder="7508205034089"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Preferred Language</label>
                  <select
                    name="preferredLanguage"
                    value={formData.parent1.preferredLanguage}
                    onChange={handleParent1Change}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                  >
                    <option value="English">English</option>
                    <option value="Afrikaans">Afrikaans</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Cell Number</label>
                  <input
                    type="tel"
                    required
                    name="cellNumber"
                    value={formData.parent1.cellNumber}
                    onChange={handleParent1Change}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                    placeholder="083 987 6543"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.parent1.email}
                    onChange={handleParent1Change}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                    placeholder="rob.doe@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Residential Home Address</label>
                  <input
                    type="text"
                    required
                    name="homeAddress"
                    value={formData.parent1.homeAddress}
                    onChange={handleParent1Change}
                    className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                    placeholder="42 Weaver Avenue, Montana, Pretoria"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Employer & Occupation</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="employer"
                      value={formData.parent1.employer}
                      onChange={handleParent1Change}
                      className="w-full px-2 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                      placeholder="Pretoria Const."
                    />
                    <input
                      type="text"
                      name="occupation"
                      value={formData.parent1.occupation}
                      onChange={handleParent1Change}
                      className="w-full px-2 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans text-navy-950"
                      placeholder="Engineer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: AGREEMENT & ACKNOWLEDGEMENT */}
          {step === 4 && (
            <div id="step-agreement-debt" className="space-y-6">
              <div className="border-b border-navy-800/10 pb-4">
                <h3 className="text-lg font-serif font-semibold text-navy-950 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gold-600" />
                  Tuition Agreement & Acknowledgement of Debt
                </h3>
                <p className="text-sm text-neutral-500 mt-0.5 font-sans">Please read the financial covenants from Page 10 & 11 carefully.</p>
              </div>

              {/* PDF Copy contract section */}
              <div id="legal-contract-box" className="bg-editorial-bg border border-navy-800/10 p-5 text-xs text-neutral-600 max-h-60 overflow-y-auto space-y-3 leading-relaxed font-sans">
                <p className="font-bold text-navy-950 text-sm">VIRTUELLE ACADEMIQUE TUITION COVENANTS (2026)</p>
                <ul className="list-disc pl-4 space-y-2">
                  <li>
                    I hereby acknowledge that the tuition fees for the year 2026 are <span className="font-bold text-gold-600">R{monthlyTuition} per month</span> for 12 months (Centre), payable in advance before the <span className="font-bold text-navy-950">1st of every month</span>.
                  </li>
                  <li>
                    <span className="font-bold text-navy-950">Late Payment Penalty:</span> A penalty fee of <span className="font-bold text-gold-600">R500 per month</span> will be added to the account if fees are not paid on time.
                  </li>
                  <li>
                    Failure to pay fees as agreed may result in my account being handed over to the Centre's legal representative, and I will be held liable for all legal costs incurred.
                  </li>
                  <li>
                    <span className="font-bold text-navy-950">Notice Period:</span> In terms of the Tuition Agreement, a full month's notice (paid in full) in writing must be given should a learner intend to leave the Centre. Failure to do so will incur a penalty of a full term's tuition fees.
                  </li>
                  <li>
                    I undertake to pay the school although it is school holidays or public holidays, hence the school must maintain rent/salaries towards teachers and other operational expenses.
                  </li>
                  <li>
                    Payments to the Centre must be made via EFT, Card machine link, Debit order, or Debicheck arranged via the bank of the Centre. Late payments are strictly subject to penalty.
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 p-4">
                  <input
                    type="checkbox"
                    required
                    id="penaltyAcknowledged"
                    name="penaltyAcknowledged"
                    checked={formData.tuitionAgreement.penaltyAcknowledged}
                    onChange={handleAgreementChange}
                    className="w-4 h-4 text-gold-600 border-navy-800/30 rounded focus:ring-gold-400 mt-1"
                  />
                  <label htmlFor="penaltyAcknowledged" className="text-xs font-sans font-bold text-amber-950">
                    I acknowledge that tuition fees are payable monthly in advance on or before the 1st of every month, and late payments attract an automatic R500.00 penalty per month.
                  </label>
                </div>

                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 p-4">
                  <input
                    type="checkbox"
                    required
                    id="termsAccepted"
                    name="termsAccepted"
                    checked={formData.tuitionAgreement.termsAccepted}
                    onChange={handleAgreementChange}
                    className="w-4 h-4 text-gold-600 border-navy-800/30 rounded focus:ring-gold-400 mt-1"
                  />
                  <label htmlFor="termsAccepted" className="text-xs font-sans font-bold text-amber-950">
                    I accept all terms and conditions of Virtuelle Academique Centre (Page 11) and accept full financial responsibility for this student's education.
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Parent 1 Digital Signature</label>
                    <input
                      type="text"
                      required
                      name="parent1Signature"
                      value={formData.tuitionAgreement.parent1Signature}
                      onChange={handleAgreementChange}
                      className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans font-medium italic text-navy-950"
                      placeholder="Type Full Name to Sign Digitally"
                    />
                    <span className="text-[10px] text-neutral-400 mt-1 block">Your typed name serves as an official binding legal signature.</span>
                  </div>
                  <div>
                    <label className="block text-xs font-sans font-semibold text-navy-950 uppercase tracking-wider mb-1">Parent 2 Signature (Optional)</label>
                    <input
                      type="text"
                      name="parent2Signature"
                      value={formData.tuitionAgreement.parent2Signature}
                      onChange={handleAgreementChange}
                      className="w-full px-4 py-2.5 border border-navy-800/20 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 text-sm bg-white font-sans font-medium italic text-navy-950"
                      placeholder="Type Full Name to Sign"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: DOCUMENT UPLOAD */}
          {step === 5 && (
            <div id="step-document-uploads" className="space-y-6">
              <div className="border-b border-navy-800/10 pb-4">
                <h3 className="text-lg font-serif font-semibold text-navy-950 flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-gold-600" />
                  Upload Required Enrollment Documents
                </h3>
                <p className="text-sm text-neutral-500 mt-0.5 font-sans">
                  Please upload high-quality scans or certified copies of the documents required to process your application.
                </p>
              </div>

              {/* Demo auto-fill option */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gold-400/10 border border-gold-400/20 p-4 gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-navy-950 font-sans uppercase">Need demo files for evaluation?</h4>
                  <p className="text-[11px] text-neutral-600 leading-relaxed font-sans">
                    Click to instantly simulate uploading high-quality certified PDF copies of the necessary documents.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedDocs({
                      id_parent: { name: "guardian_certified_id_copy.pdf", size: "1.4 MB" },
                      birth_certificate: { name: "learner_official_birth_certificate.pdf", size: "940 KB" },
                      report_card: { name: "academic_report_card_2025_q4.pdf", size: "2.1 MB" },
                      proof_address: { name: "municipal_proof_of_residence.pdf", size: "1.1 MB" }
                    });
                  }}
                  className="bg-navy-800 hover:bg-navy-950 text-gold-400 border border-gold-400 px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm whitespace-nowrap self-stretch sm:self-auto text-center"
                >
                  Simulate Demo Uploads
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    key: "id_parent" as const,
                    title: "Parent / Guardian ID copy",
                    description: "Certified SA ID book, card, or passport of the legal guardian.",
                    required: true,
                  },
                  {
                    key: "birth_certificate" as const,
                    title: "Learner Birth Certificate",
                    description: "Official government birth certificate of the applying student.",
                    required: true,
                  },
                  {
                    key: "report_card" as const,
                    title: "Last Academic Report",
                    description: "Most recent term or year-end report card from the previous school.",
                    required: true,
                  },
                  {
                    key: "proof_address" as const,
                    title: "Proof of Address (Optional)",
                    description: "Utility bill or lease agreement not older than 3 months.",
                    required: false,
                  },
                ].map((docType) => {
                  const doc = uploadedDocs[docType.key];
                  return (
                    <div
                      key={docType.key}
                      className={`p-4 border transition-all ${
                        doc
                          ? "bg-emerald-50/30 border-emerald-500/30"
                          : "bg-editorial-bg border border-navy-800/10 hover:border-gold-400/50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-navy-950 flex items-center gap-1.5">
                            {docType.title}
                            {docType.required && <span className="text-red-500 font-sans font-normal">*</span>}
                          </h4>
                          <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">{docType.description}</p>
                        </div>
                        {doc && (
                          <span className="flex items-center gap-1 text-[9px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-sans font-bold">
                            <Check className="w-3 h-3" />
                            Ready
                          </span>
                        )}
                      </div>

                      {doc ? (
                        <div className="flex items-center justify-between bg-white border border-emerald-200/50 p-2.5 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <p className="font-semibold text-navy-950 truncate">{doc.name}</p>
                              <p className="text-[9px] text-neutral-400 font-mono mt-0.5">{doc.size}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedDocs((prev) => {
                                const copy = { ...prev };
                                delete copy[docType.key];
                                return copy;
                              });
                            }}
                            className="p-1 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-colors"
                            title="Remove file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center border border-dashed border-navy-800/20 py-4 bg-white cursor-pointer hover:bg-neutral-50/50 transition-colors">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const sizeStr =
                                  file.size > 1024 * 1024
                                    ? (file.size / (1024 * 1024)).toFixed(1) + " MB"
                                    : (file.size / 1024).toFixed(0) + " KB";
                                setUploadedDocs((prev) => ({
                                  ...prev,
                                  [docType.key]: {
                                    name: file.name,
                                    size: sizeStr,
                                    file: file,
                                  },
                                }));
                              }
                            }}
                            className="hidden"
                          />
                          <UploadCloud className="w-5 h-5 text-neutral-400 mb-0.5" />
                          <span className="text-[11px] font-bold text-navy-800">Browse or Drag File</span>
                          <span className="text-[9px] text-neutral-400 font-mono">PDF, JPG, PNG up to 5MB</span>
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="text-[10px] text-neutral-500 bg-editorial-bg p-3 border border-navy-800/10 font-sans flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Document Compliance:</strong> Under the Protection of Personal Information Act (POPIA), all files uploaded here are securely encrypted and used strictly for academic enrollment verification purposes.
                </span>
              </div>
            </div>
          )}

          {/* STEP 6: SUBJECT SELECTION */}
          {step === 6 && (
            <div id="step-subject-choice" className="space-y-6">
              <div className="border-b border-navy-800/10 pb-4">
                <h3 className="text-lg font-serif font-semibold text-navy-950 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-gold-600" />
                  Select Your Study Curriculum & Choice Subjects
                </h3>
                <p className="text-sm text-neutral-500 mt-0.5 font-sans">Choose your academic curriculum stream and subjects based on Page 13 of the prospectus.</p>
              </div>

              <div>
                <p className="text-xs font-sans font-bold text-navy-950 uppercase tracking-wider mb-3">Choice Subjects (Grades 10 to 12 / Gap Year)</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {defaultChoiceSubjects.map((sub) => {
                    const isSelected = selectedSubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => handleSubjectToggle(sub)}
                        className={`px-3 py-2.5 border text-left transition-all text-xs font-sans font-semibold ${
                          isSelected
                            ? "bg-navy-800 border-gold-400 text-gold-400 shadow-sm"
                            : "bg-editorial-bg border border-navy-800/10 text-navy-950 hover:bg-neutral-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${isSelected ? "bg-gold-400" : "bg-neutral-300"}`} />
                          <span className="truncate">{sub}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedSubjects.length === 0 && (
                <div className="text-xs text-amber-800 bg-amber-50 p-3 border border-amber-200 font-sans">
                  ⚠️ Please select at least one subject to complete your registration.
                </div>
              )}

              <div className="bg-navy-950 text-white p-5 border border-gold-400/30 space-y-2 font-sans">
                <div className="flex justify-between items-center border-b border-navy-800 pb-2">
                  <span className="text-xs text-neutral-400">Monthly School Tuition Fee ({grade})</span>
                  <span className="text-sm font-bold text-gold-400">R{monthlyTuition}.00</span>
                </div>
                <div className="flex justify-between items-center border-b border-navy-800 pb-2">
                  <span className="text-xs text-neutral-400">Enrollment Registration Fee (Once-off)</span>
                  <span className="text-xs font-bold text-neutral-300">R1 000.00</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-xs text-neutral-400">Student Card Setup Fee (Once-off)</span>
                  <span className="text-xs font-bold text-neutral-300">R275.00</span>
                </div>
                <div className="text-[10px] text-neutral-500 pt-2 border-t border-navy-800 leading-relaxed font-sans">
                  *On enrollment submission, registration and student card invoices will be generated. Your uploaded ID copy, birth certificate, and reports are instantly attached to your profile for admin verification.
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between border-t border-navy-800/10 mt-8 pt-6">
            <button
              type="button"
              disabled={step === 1}
              onClick={handlePrev}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-serif font-bold transition-colors ${
                step === 1
                  ? "text-neutral-300 cursor-not-allowed"
                  : "text-navy-900 hover:bg-neutral-100"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {step < 6 ? (
              <button
                type="submit"
                className="flex items-center gap-2 bg-navy-800 hover:bg-navy-950 border border-gold-400 text-gold-400 px-5 py-2.5 text-sm font-sans font-bold transition-all"
              >
                Next Step
                <ChevronRight className="w-4 h-4 text-gold-400" />
              </button>
            ) : (
              <button
                type="button"
                disabled={selectedSubjects.length === 0}
                onClick={handleFormSubmit}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-serif font-bold transition-all shadow-md ${
                  selectedSubjects.length === 0
                    ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                    : "bg-navy-800 hover:bg-navy-950 border border-gold-400 text-gold-400"
                }`}
              >
                Submit Form & Create Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

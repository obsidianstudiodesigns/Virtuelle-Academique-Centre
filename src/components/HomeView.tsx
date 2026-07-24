import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Calendar,
  CheckCircle,
  BookOpen,
  Award,
  Clock,
  Download,
  ChevronRight,
  ShieldCheck,
  Zap,
  Users,
  Star,
  Activity,
  Music,
  Dumbbell,
  GraduationCap,
  ArrowRight,
  FileText,
  HeartHandshake
} from "lucide-react";

import heroImg from "../assets/images/hero_3d_academy_1784812232149.jpg";
import offersImg from "../assets/images/offers_tuition_3d_1784812246794.jpg";
import timetablesImg from "../assets/images/timetables_terms_3d_1784812258551.jpg";
import curriculumImg from "../assets/images/curriculum_subjects_3d_1784812270890.jpg";
import sportsImg from "../assets/images/sports_academy_3d_1784812283930.jpg";

interface HomeViewProps {
  onNavigateToAuth: (subView: "login" | "register") => void;
  estimateGrade: string;
  setEstimateGrade: (grade: string) => void;
  estimatedPrices: { reg: number; card: number; monthly: number };
}

export default function HomeView({
  onNavigateToAuth,
  estimateGrade,
  setEstimateGrade,
  estimatedPrices
}: HomeViewProps) {
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const [activeSubjectTab, setActiveSubjectTab] = useState<"all" | "fet" | "senior" | "tech">("all");

  const termsData = [
    {
      term: 1,
      title: "Term 1: Foundation & Alignment",
      dates: "15 January – 27 March 2026",
      weeks: "10 Academic Weeks",
      highlights: ["Baseline level assessments", "MS Teams orientation workshops", "SBA Task 1 submission window"],
      status: "Active Registration"
    },
    {
      term: 2,
      title: "Term 2: Mid-Year Academic Progression",
      dates: "8 April – 26 June 2026",
      weeks: "11 Academic Weeks",
      highlights: ["June controlled examinations", "Parent-Teacher virtual conferences", "Mid-year academic report cards"],
      status: "Upcoming"
    },
    {
      term: 3,
      title: "Term 3: Advanced Subject Mastery",
      dates: "21 July – 2 October 2026",
      weeks: "10 Academic Weeks",
      highlights: ["Practical Assessment Tasks (PAT)", "National Olympiads & Competitions", "Grade 12 Trial Examinations"],
      status: "Upcoming"
    },
    {
      term: 4,
      title: "Term 4: Final Assessments & Valedictory",
      dates: "13 October – 11 December 2026",
      weeks: "9 Academic Weeks",
      highlights: ["Final CAPS Year-End Examinations", "Virtual Prize Giving & Honors Ceremony", "Annual Matric Farewell Ball"],
      status: "Upcoming"
    }
  ];

  const subjectsList = [
    { name: "Mathematics & Pure Maths", category: "fet", code: "MAT", desc: "Core problem solving & calculus" },
    { name: "Physical Science", category: "fet", code: "PHS", desc: "Physics & Chemistry fundamentals" },
    { name: "Artificial Intelligence & ML", category: "tech", code: "AIM", desc: "Applied prompt design & neural logic" },
    { name: "Robotics & Micro-Coding", category: "tech", code: "ROB", desc: "Hardware automation & Python" },
    { name: "Information Technology (IT)", category: "tech", code: "INF", desc: "Software engineering & algorithms" },
    { name: "Criminology & Forensics", category: "fet", code: "CRM", desc: "Behavioral science & forensic analysis" },
    { name: "Accounting & Finance", category: "fet", code: "ACC", desc: "Financial ledgers & auditing" },
    { name: "Business Studies & Economics", category: "fet", code: "BUS", desc: "Entrepreneurship & markets" },
    { name: "English Home Language", category: "senior", code: "ENG", desc: "Literature & language structure" },
    { name: "Afrikaans First Additional", category: "senior", code: "AFR", desc: "Language fluency & comprehension" },
    { name: "Computer Applications Tech (CAT)", category: "tech", code: "CAT", desc: "Data processing & office suites" },
    { name: "Life Sciences & Biology", category: "senior", code: "LFS", desc: "Ecology, anatomy & genetics" },
    { name: "Geography & Earth Sciences", category: "senior", code: "GEO", desc: "GIS mapping & environmental studies" },
    { name: "Engineering Graphics & Design", category: "fet", code: "EGD", desc: "Technical drawing & CAD design" },
    { name: "French & Spanish Languages", category: "senior", code: "LNG", desc: "Global conversational languages" }
  ];

  const filteredSubjects = subjectsList.filter((s) => {
    if (activeSubjectTab === "all") return true;
    return s.category === activeSubjectTab;
  });

  return (
    <div id="landing-home-layout" className="space-y-20 pb-16">
      {/* 1. HERO BANNER - Modernized with 3D Photorealistic Backdrop & Motion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-navy-950 text-white overflow-hidden border-2 border-gold-400/40 shadow-2xl rounded-none"
      >
        {/* Background 3D Image Layer with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Virtuelle Academique 3D Campus"
            className="w-full h-full object-cover opacity-30 scale-105 transform hover:scale-100 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/90 to-navy-950/40" />
        </div>

        <div className="relative z-10 max-w-5xl p-8 md:p-16 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-navy-900/90 border border-gold-400/60 px-4 py-2 text-xs font-sans font-bold text-gold-400 backdrop-blur-md uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4 text-gold-400 animate-pulse" />
            <span>2026 Academic Enrollment • Virtuelle Academique Centre</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-serif font-bold tracking-tight leading-tight text-white"
          >
            Success in Education, <br />
            <span className="text-gold-400 italic underline decoration-gold-400/40 decoration-2">
              Tailored For Every Need.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm md:text-lg text-neutral-200 font-sans leading-relaxed max-w-2xl font-normal"
          >
            Experience South Africa’s premier virtual homeschooling center. Expert live-streamed lectures on Microsoft Teams, continuous SBA tracking, CAPS-aligned assessments, and dedicated academic tutors.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-4 pt-2"
          >
            <button
              onClick={() => onNavigateToAuth("register")}
              className="bg-gold-400 hover:bg-gold-500 text-navy-950 font-sans font-bold text-xs md:text-sm px-8 py-4 transition-all shadow-xl flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start Digital Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#school-offers"
              className="bg-navy-900/90 hover:bg-navy-900 border border-gold-400/40 text-gold-300 font-sans font-bold text-xs md:text-sm px-8 py-4 transition-all backdrop-blur-md flex items-center gap-2 hover:border-gold-400"
            >
              <span className="font-serif font-bold text-sm text-gold-400 leading-none">R</span>
              <span>View 2026 Tuition Offers</span>
            </a>
          </motion.div>

          {/* Quick Stats Banner */}
          <div className="pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
            <div className="space-y-0.5">
              <span className="text-gold-400 font-serif text-xl font-bold">100%</span>
              <p className="text-neutral-300 font-medium text-[11px]">CAPS Curriculum Aligned</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-gold-400 font-serif text-xl font-bold">Grade R - 12</span>
              <p className="text-neutral-300 font-medium text-[11px]">Full Spectrum Coverage</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-gold-400 font-serif text-xl font-bold">15+</span>
              <p className="text-neutral-300 font-medium text-[11px]">Specialized Electives</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-gold-400 font-serif text-xl font-bold">Live MS Teams</span>
              <p className="text-neutral-300 font-medium text-[11px]">Synchronous Workshops</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. CORE MISSION PHILOSOPHY - Modernized Visual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-editorial-paper p-8 border border-navy-800/10 shadow-sm space-y-4 relative overflow-hidden"
        >
          <div className="w-10 h-10 bg-navy-950 text-gold-400 border border-gold-400/40 flex items-center justify-center font-serif font-bold text-lg">
            01
          </div>
          <span className="text-[10px] font-sans font-bold text-gold-600 uppercase tracking-widest block">Our Core Philosophy</span>
          <h3 className="font-serif text-xl font-bold text-navy-950">Independence & Responsibility</h3>
          <p className="text-xs text-neutral-600 leading-relaxed font-sans">
            We encourage learners to take responsibility for their study timelines while cultivating self-discipline. We remain responsive to individual needs regardless of starting academic levels.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-editorial-paper p-8 border border-navy-800/10 shadow-sm space-y-4 relative overflow-hidden"
        >
          <div className="w-10 h-10 bg-navy-950 text-gold-400 border border-gold-400/40 flex items-center justify-center font-serif font-bold text-lg">
            02
          </div>
          <span className="text-[10px] font-sans font-bold text-gold-600 uppercase tracking-widest block">Core Educational Values</span>
          <h3 className="font-serif text-xl font-bold text-navy-950">Integrity & Excellence</h3>
          <p className="text-xs text-neutral-600 leading-relaxed font-sans">
            Our educational framework centers around six pillars: <strong className="text-navy-950">Achievement, Collaboration, Integrity, Respect, Responsibility, and Innovation</strong>.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-editorial-paper p-8 border border-navy-800/10 shadow-sm space-y-4 relative overflow-hidden"
        >
          <div className="w-10 h-10 bg-navy-950 text-gold-400 border border-gold-400/40 flex items-center justify-center font-serif font-bold text-lg">
            03
          </div>
          <span className="text-[10px] font-sans font-bold text-gold-600 uppercase tracking-widest block">Admissions Pathway</span>
          <h3 className="font-serif text-xl font-bold text-navy-950">Continuous Assessment</h3>
          <p className="text-xs text-neutral-600 leading-relaxed font-sans">
            Admissions require the previous year's report card followed by diagnostic level testing at our virtual center to map out grade path backlogs and personalized support.
          </p>
        </motion.div>
      </div>

      {/* 3. OFFERS & INTERACTIVE FEE ESTIMATOR - With Photorealistic 3D Image */}
      <section id="school-offers" className="scroll-mt-24">
        <div className="bg-editorial-paper border border-navy-800/10 shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left 3D Visual Column */}
            <div className="lg:col-span-5 bg-navy-950 relative min-h-[320px] lg:min-h-full flex flex-col justify-between p-8 text-white overflow-hidden">
              <img
                src={offersImg}
                alt="2026 Tuition Fee Offers"
                className="absolute inset-0 w-full h-full object-cover opacity-40 hover:opacity-50 transition-opacity duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent" />

              <div className="relative z-10 space-y-3">
                <span className="bg-gold-400/20 text-gold-400 border border-gold-400/40 text-[10px] font-sans font-bold px-3 py-1 uppercase tracking-widest inline-block">
                  2026 Official Fee Ledger
                </span>
                <h3 className="font-serif text-2xl lg:text-3xl font-bold text-white leading-tight">
                  Transparent, Affordable Homeschooling Options
                </h3>
              </div>

              <div className="relative z-10 space-y-3 pt-6 border-t border-gold-400/20">
                <p className="text-xs text-neutral-300 font-sans">
                  Fees include Microsoft 365 student licensing, live tutor sessions, diagnostic level placement tests, and digital document verification.
                </p>
                <div className="flex items-center gap-2 text-gold-400 text-xs font-bold font-sans">
                  <ShieldCheck className="w-4 h-4 text-gold-400" />
                  <span>No hidden levies or unexpected costs</span>
                </div>
              </div>
            </div>

            {/* Right Estimator Tool Column */}
            <div className="lg:col-span-7 p-8 lg:p-10 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-800/10 pb-6">
                <div>
                  <span className="text-[10px] font-sans font-bold text-navy-800 uppercase tracking-widest block">Interactive Calculator</span>
                  <h3 className="text-2xl font-serif font-bold text-navy-950">Homeschool Tuition Estimator</h3>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-sans font-bold uppercase text-neutral-500">Select Learner Grade:</label>
                  <select
                    value={estimateGrade}
                    onChange={(e) => setEstimateGrade(e.target.value)}
                    className="px-4 py-2.5 border-2 border-navy-950 text-xs font-sans font-bold text-navy-950 bg-white shadow-2xs focus:border-gold-400 focus:outline-none"
                  >
                    <option value="Grade R">Grade R (Foundation)</option>
                    <option value="Grade 1">Grades 1 – 3 (Primary)</option>
                    <option value="Grade 4">Grades 4 – 6 (Intermediate)</option>
                    <option value="Grade 7">Grades 7 – 9 (Senior Phase)</option>
                    <option value="Grade 10">Grade 10 (FET Phase)</option>
                    <option value="Grade 11">Grade 11 (FET Phase)</option>
                    <option value="Grade 12">Grade 12 (Matric Phase)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Prices Animation Container */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={estimateGrade}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                  <div className="border border-navy-800/15 p-6 bg-editorial-bg text-center space-y-2">
                    <span className="text-[10px] text-navy-800 font-sans font-bold uppercase tracking-wider block">
                      Registration Fee
                    </span>
                    <p className="text-3xl font-serif font-bold text-navy-950">R {estimatedPrices.reg}.00</p>
                    <span className="text-[10px] text-neutral-500 font-bold uppercase block bg-neutral-200/60 py-0.5 px-2 inline-block">
                      Once-Off Payment
                    </span>
                  </div>

                  <div className="border border-navy-800/15 p-6 bg-editorial-bg text-center space-y-2">
                    <span className="text-[10px] text-navy-800 font-sans font-bold uppercase tracking-wider block">
                      Student ID Card
                    </span>
                    <p className="text-3xl font-serif font-bold text-navy-950">R {estimatedPrices.card}.00</p>
                    <span className="text-[10px] text-neutral-500 font-bold uppercase block bg-neutral-200/60 py-0.5 px-2 inline-block">
                      Once-Off Setup
                    </span>
                  </div>

                  <div className="border-2 border-gold-400 p-6 bg-navy-950 text-white text-center space-y-2 shadow-md">
                    <span className="text-[10px] text-gold-400 font-sans font-bold uppercase tracking-wider block">
                      Monthly Tuition Fee
                    </span>
                    <p className="text-3xl font-serif font-bold text-gold-400">R {estimatedPrices.monthly}.00</p>
                    <span className="text-[10px] text-neutral-300 font-bold uppercase block">
                      January to December (12 Mo.)
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Payment Methods Callout */}
              <div className="bg-neutral-50 p-4 border border-navy-800/10 flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
                <div className="space-y-0.5">
                  <p className="font-bold text-navy-950">Accepted Payment Channels:</p>
                  <p className="text-neutral-600 text-[11px]">EFT Bank Transfer, Direct Deposit, Monthly Debit Order</p>
                </div>

                <button
                  onClick={() => onNavigateToAuth("register")}
                  className="bg-navy-800 hover:bg-navy-950 text-gold-400 font-bold text-xs px-5 py-2.5 border border-gold-400/40 uppercase transition-colors"
                >
                  Apply For {estimateGrade}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TIMETABLES & TERMS PAGE - With Photorealistic 3D Calendar Image */}
      <section id="school-dates" className="scroll-mt-24 space-y-8">
        <div className="bg-navy-950 text-white p-8 lg:p-12 border-2 border-gold-400/40 relative overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-sans font-bold text-gold-400 uppercase tracking-widest inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gold-400" />
                2025 / 2026 Academic Calendar & Lecture Timetables
              </span>
              <h3 className="text-3xl lg:text-4xl font-serif font-bold text-white">
                Synchronous Term Timetables
              </h3>
              <p className="text-xs md:text-sm text-neutral-300 font-sans leading-relaxed">
                All live lectures on Microsoft Teams run synchronously within scheduled term dates. Learners receive personalized weekly timetables mapping subject workshops and assignment submission windows.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {[1, 2, 3, 4].map((tNum) => (
                  <button
                    key={tNum}
                    onClick={() => setSelectedTerm(tNum)}
                    className={`px-5 py-2.5 text-xs font-sans font-bold uppercase transition-all border ${
                      selectedTerm === tNum
                        ? "bg-gold-400 text-navy-950 border-gold-400 shadow-md"
                        : "bg-navy-900 text-neutral-300 border-navy-800 hover:border-gold-400/40"
                    }`}
                  >
                    Term {tNum}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-none overflow-hidden border-2 border-gold-400/30 group">
                <img
                  src={timetablesImg}
                  alt="3D Floating Term Calendar"
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 text-xs font-sans text-neutral-200">
                  <p className="font-bold text-gold-400 uppercase text-[10px]">Official Calendar Audit</p>
                  <p>Term dates approved by Virtuelle Academic Directorate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Term Detail Box */}
          <div className="mt-8 pt-8 border-t border-gold-400/20">
            {(() => {
              const activeT = termsData.find((t) => t.term === selectedTerm) || termsData[0];
              return (
                <motion.div
                  key={activeT.term}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-navy-900 p-6 border border-gold-400/30 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-800 pb-4">
                    <div>
                      <h4 className="font-serif text-xl font-bold text-white">{activeT.title}</h4>
                      <p className="text-xs text-gold-400 font-sans font-semibold mt-0.5">{activeT.dates} • {activeT.weeks}</p>
                    </div>
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider bg-navy-800 text-gold-300 px-3 py-1 border border-gold-400/30 self-start sm:self-auto">
                      {activeT.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                    {activeT.highlights.map((h, i) => (
                      <div key={i} className="bg-navy-950 p-3 border border-navy-800 flex items-center gap-2 text-neutral-200">
                        <CheckCircle className="w-4 h-4 text-gold-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* 5. CHOICE SUBJECTS & CURRICULUMS - With Photorealistic 3D Image */}
      <section id="school-curriculum" className="scroll-mt-24 space-y-8">
        <div className="bg-editorial-paper border border-navy-800/10 p-8 lg:p-12 shadow-sm space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <span className="text-xs font-sans font-bold text-navy-800 uppercase tracking-wider block">
                Comprehensive South African & Global Curriculums
              </span>
              <h3 className="text-3xl font-serif font-bold text-navy-950">
                Academic Curriculums & Modern Electives
              </h3>
              <p className="text-xs md:text-sm text-neutral-600 font-sans leading-relaxed">
                Integrated CAPS curriculum materials combined with high-demand 21st-century subjects like Artificial Intelligence, Robotics, Criminology, Information Technology, and Foreign Languages.
              </p>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => setActiveSubjectTab("all")}
                  className={`px-4 py-2 text-xs font-sans font-bold uppercase border ${
                    activeSubjectTab === "all" ? "bg-navy-950 text-gold-400 border-navy-950" : "bg-neutral-100 text-navy-900 border-neutral-300"
                  }`}
                >
                  All Subjects ({subjectsList.length})
                </button>
                <button
                  onClick={() => setActiveSubjectTab("tech")}
                  className={`px-4 py-2 text-xs font-sans font-bold uppercase border ${
                    activeSubjectTab === "tech" ? "bg-navy-950 text-gold-400 border-navy-950" : "bg-neutral-100 text-navy-900 border-neutral-300"
                  }`}
                >
                  Tech & AI Electives
                </button>
                <button
                  onClick={() => setActiveSubjectTab("fet")}
                  className={`px-4 py-2 text-xs font-sans font-bold uppercase border ${
                    activeSubjectTab === "fet" ? "bg-navy-950 text-gold-400 border-navy-950" : "bg-neutral-100 text-navy-900 border-neutral-300"
                  }`}
                >
                  FET Phase (Gr 10-12)
                </button>
                <button
                  onClick={() => setActiveSubjectTab("senior")}
                  className={`px-4 py-2 text-xs font-sans font-bold uppercase border ${
                    activeSubjectTab === "senior" ? "bg-navy-950 text-gold-400 border-navy-950" : "bg-neutral-100 text-navy-900 border-neutral-300"
                  }`}
                >
                  Senior Phase (Gr 7-9)
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative overflow-hidden border-2 border-navy-800/10 shadow-md">
                <img
                  src={curriculumImg}
                  alt="3D Curriculum Electives"
                  className="w-full h-56 object-cover hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          {/* Subject Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {filteredSubjects.map((sb, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -2 }}
                className="bg-editorial-bg p-4 border border-navy-800/10 space-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-neutral-400">
                    <span>CODE: {sb.code}</span>
                    {sb.category === "tech" && (
                      <span className="bg-gold-400/20 text-gold-700 px-1.5 py-0.5 uppercase font-sans text-[8px]">
                        AI & TECH
                      </span>
                    )}
                  </div>
                  <h4 className="font-sans font-bold text-xs text-navy-950 mt-1">{sb.name}</h4>
                  <p className="text-[10px] text-neutral-500 font-sans mt-0.5">{sb.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SPORTS & ACADEMY - With Photorealistic 3D Image */}
      <section id="school-sports" className="scroll-mt-24">
        <div className="bg-editorial-paper border border-navy-800/10 p-8 lg:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-sans font-bold text-navy-800 uppercase tracking-wider block">
                  Co-Curricular Academies & Cultural Growth
                </span>
                <h3 className="text-3xl font-serif font-bold text-navy-950">
                  Sports, Arts & Cultural Clubs
                </h3>
                <p className="text-xs md:text-sm text-neutral-600 font-sans leading-relaxed">
                  Virtuelle Academique caters to the holistic development of virtual learners. Major sports are conducted through affiliated regional club partnerships, while our internal cultural academy hosts weekly live interactive clubs.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-sans font-semibold">
                {[
                  { name: "Table Tennis & Fencing", icon: Dumbbell },
                  { name: "Judo & Martial Arts", icon: Activity },
                  { name: "Music & Vocal Lessons", icon: Music },
                  { name: "Drama & Debates", icon: Users }
                ].map((club, i) => (
                  <div key={i} className="bg-editorial-bg p-3 border border-navy-800/10 flex items-center gap-2 text-navy-950">
                    <club.icon className="w-4 h-4 text-gold-600 shrink-0" />
                    <span>{club.name}</span>
                  </div>
                ))}
              </div>

              <div className="bg-navy-950 text-white p-5 border border-gold-400/30 space-y-2">
                <div className="flex items-center gap-2 text-gold-400 font-serif font-bold text-sm">
                  <Star className="w-4 h-4 text-gold-400" />
                  <span>Annual Nationwide Matric Farewell Ball</span>
                </div>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  An unforgettable gala evening organized exclusively for Grade 12 homeschooling candidates from across South Africa!
                </p>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative overflow-hidden border-2 border-gold-400/40 shadow-xl group">
                <img
                  src={sportsImg}
                  alt="3D Sports and Cultural Academy"
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-sans">
                  <p className="font-bold text-gold-400 uppercase text-[10px]">Virtuelle Cultural Academy</p>
                  <p>Empowering creative expression alongside academic studies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

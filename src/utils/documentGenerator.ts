/**
 * Virtuelle Academique Document Generator
 * Generates publication-grade, beautifully formatted academic handbooks and activity sheets.
 */

export interface DocumentResource {
  name: string;
  type: "handbook" | "activity" | "video";
  moduleTitle: string;
  subjectName: string;
  grade?: string;
  studentName?: string;
}

export function generateDocumentHTML(res: DocumentResource): string {
  const isHandbook = res.type === "handbook";
  const docTypeLabel = isHandbook ? "OFFICIAL STUDY HANDBOOK" : "STUDENT ACTIVITY WORKSHEET";
  const studentName = res.studentName || "John Doe";
  const grade = res.grade || "Grade 10";
  const today = new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });

  // Customized chapter content based on subject/module
  let contentHTML = "";

  if (res.subjectName.includes("English") || res.name.toLowerCase().includes("macbeth")) {
    contentHTML = `
      <section class="chapter">
        <h2>Chapter 1: Context & Historical Background</h2>
        <p>Written between 1603 and 1606, William Shakespeare’s <em>Macbeth</em> was crafted during the reign of King James I of England (James VI of Scotland). The play reflects 17th-century anxieties surrounding regicide, witchcraft, and the divine right of kings.</p>
        
        <div class="callout">
          <strong>Key Literary Theme: Moral Inversion ("Fair is Foul")</strong>
          <p>"Fair is foul, and foul is fair / Hover through the fog and filthy air" (Act 1, Scene 1, lines 11-12). This iconic paradox establishes the central thematic motif: appearance vs. reality, moral corruption, and supernatural deceit.</p>
        </div>

        <h2>Chapter 2: Character Analysis & Motivations</h2>
        <ul>
          <li><strong>Macbeth:</strong> A valiant general whose noble ambition is poisoned by tragic flaw (hamartia) and unchecked desire for power.</li>
          <li><strong>Lady Macbeth:</strong> A ruthlessly ambitious figure who invokes dark forces to "unsex" her, yet is ultimately destroyed by subconscious guilt.</li>
          <li><strong>The Three Witches (Weird Sisters):</strong> Instruments of darkness that exploit human vulnerability through deceptive prophecies.</li>
        </ul>

        <h2>Chapter 3: Soliloquy & Literary Device Mastery</h2>
        <p>Analyze the psychological progression in Macbeth’s "Dagger Soliloquy" (Act 2, Scene 1):</p>
        <blockquote>"Is this a dagger which I see before me, / The handle toward my hand? Come, let me clutch thee."</blockquote>
        <p>The dagger represents a hallucination spawned by a guilty conscience before Duncan’s murder.</p>
      </section>
    `;
  } else if (res.subjectName.includes("Math") || res.name.toLowerCase().includes("quadratic") || res.name.toLowerCase().includes("algebra")) {
    contentHTML = `
      <section class="chapter">
        <h2>Chapter 1: Standard Form of Quadratic Equations</h2>
        <p>A quadratic equation is a second-order polynomial equation in a single variable <em>x</em>, expressed in standard form as:</p>
        <div class="formula-box">
          ax² + bx + c = 0 &nbsp;&nbsp;&nbsp; (where a ≠ 0)
        </div>

        <h2>Chapter 2: Solving Methods & Quadratic Formula</h2>
        <p>1. <strong>Factoring:</strong> Express in the form (x - p)(x - q) = 0.<br/>
           2. <strong>Completing the Square:</strong> Rearrange into (x + p)² = q.<br/>
           3. <strong>The Universal Quadratic Formula:</strong>
        </p>
        <div class="formula-box">
          x = [ -b ± √(b² - 4ac) ] / (2a)
        </div>

        <div class="callout">
          <strong>The Discriminant (Δ = b² - 4ac):</strong>
          <ul>
            <li>If Δ > 0: Two real, distinct roots.</li>
            <li>If Δ = 0: One real repeated root (tangent to x-axis).</li>
            <li>If Δ < 0: Non-real / complex conjugate roots.</li>
          </ul>
        </div>

        <h2>Chapter 3: Graphing Quadratic Functions (Parabolas)</h2>
        <p>The vertex coordinates (h, k) of f(x) = a(x - h)² + k represent the axis of symmetry x = -b / (2a) and maximum/minimum turning point.</p>
      </section>
    `;
  } else if (res.subjectName.includes("Physical") || res.name.toLowerCase().includes("mechanic") || res.name.toLowerCase().includes("newton")) {
    contentHTML = `
      <section class="chapter">
        <h2>Chapter 1: Newton’s Laws of Motion</h2>
        <p><strong>First Law (Inertia):</strong> An object continues in a state of rest or uniform velocity unless acted upon by a net external force.</p>
        <p><strong>Second Law (Acceleration):</strong> When a net force (F_net) acts on an object of mass (m), it accelerates in the direction of the force:</p>
        <div class="formula-box">
          F_net = m · a &nbsp;&nbsp;&nbsp; (N = kg · m/s²)
        </div>
        <p><strong>Third Law (Action-Reaction):</strong> When object A exerts a force on object B, object B simultaneously exerts an equal and opposite force on object A.</p>

        <div class="callout">
          <strong>Free-Body Force Diagrams (FBD):</strong>
          <p>Always identify: Normal force (F_N), Gravitational force (F_g = mg), Applied force (F_app), and Frictional force (f_s or f_k).</p>
        </div>
      </section>
    `;
  } else if (res.subjectName.includes("IT") || res.name.toLowerCase().includes("object") || res.name.toLowerCase().includes("sql")) {
    contentHTML = `
      <section class="chapter">
        <h2>Chapter 1: Four Pillars of Object-Oriented Programming</h2>
        <ol>
          <li><strong>Encapsulation:</strong> Bundling data attributes and methods into a single class while restricting direct access to private members.</li>
          <li><strong>Abstraction:</strong> Hiding complex implementation details and exposing only necessary interfaces.</li>
          <li><strong>Inheritance:</strong> Allowing a subclass to derive properties and behavior from a parent class using <code>extends</code>.</li>
          <li><strong>Polymorphism:</strong> The ability for different classes to respond to the same method call in unique ways (Method Overriding & Overloading).</li>
        </ol>

        <div class="code-box">
          <pre><code>// Example Java / Delphi Class Structure
public class Student {
    private String name;
    private int grade;

    public Student(String name, int grade) {
        this.name = name;
        this.grade = grade;
    }

    public String getDetails() {
        return name + " - Grade " + grade;
    }
}</code></pre>
        </div>
      </section>
    `;
  } else {
    contentHTML = `
      <section class="chapter">
        <h2>Chapter 1: Core Theoretical Foundations</h2>
        <p>This handbook establishes essential knowledge, practical applications, and analytical methodologies required under the official South African CAPS Curriculum for ${res.subjectName}.</p>
        
        <div class="callout">
          <strong>Learning Objectives & Core Outcomes:</strong>
          <ul>
            <li>Master key domain concepts and formal terminology.</li>
            <li>Apply analytical problem-solving techniques to curriculum tasks.</li>
            <li>Demonstrate critical evaluation and independent reasoning in exam questions.</li>
          </ul>
        </div>
      </section>
    `;
  }

  const activitySection = !isHandbook
    ? `
      <div class="activity-section">
        <h2 style="border-bottom: 2px solid #111827; padding-bottom: 8px; margin-top: 30px;">
          Student Activity & Practice Worksheet
        </h2>
        <p style="font-size: 13px; color: #4b5563;">Instructions: Complete all questions in the space provided. Show all working and reasoning clearly.</p>

        <div class="question-block">
          <p><strong>Question 1 (10 Marks):</strong> Define the core principles outlined in Chapter 1. Explain how they apply to practical real-world scenarios.</p>
          <div class="answer-lines">
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
          </div>
        </div>

        <div class="question-block">
          <p><strong>Question 2 (15 Marks):</strong> Solve or analyze the sample problem below step-by-step:</p>
          <div class="problem-box">
            "Apply the appropriate formulas or structural analysis techniques learned in this module to evaluate the primary variables."
          </div>
          <div class="answer-lines">
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
          </div>
        </div>

        <div class="question-block">
          <p><strong>Question 3 (Essay / Extension - 15 Marks):</strong> Write a short structured response (150 - 200 words) contextualizing the major findings.</p>
          <div class="answer-grid">
            <p style="color: #9ca3af; font-size: 11px; font-style: italic;">[Space reserved for student response and teacher feedback grading grid]</p>
          </div>
        </div>
      </div>
    `
    : `
      <div class="summary-box">
        <h3>Module Summary & Self-Assessment Checklist</h3>
        <p>✓ Have you reviewed all definitions and formulas in this chapter?</p>
        <p>✓ Have you attempted the corresponding activity worksheet and online diagnostic test?</p>
        <p>✓ Need additional support? Attend the live Microsoft Teams tutoring session listed in your dashboard!</p>
      </div>
    `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${res.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap');

    @page {
      size: A4;
      margin: 20mm;
    }

    body {
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
      color: #0f172a;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }

    .document-container {
      max-width: 800px;
      margin: 30px auto;
      background: #ffffff;
      padding: 45px 55px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    }

    header {
      border-bottom: 3px double #d97706;
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .school-branding {
      flex: 1;
    }

    .school-title {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 22px;
      font-weight: 800;
      color: #0b1329;
      letter-spacing: 1px;
      margin: 0;
      text-transform: uppercase;
    }

    .school-subtitle {
      font-size: 11px;
      color: #d97706;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 2px;
    }

    .doc-badge {
      background-color: #0b1329;
      color: #fef3c7;
      border: 1px solid #d97706;
      padding: 6px 14px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      text-align: right;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      background: #f1f5f9;
      border-left: 4px solid #d97706;
      padding: 15px 20px;
      margin-bottom: 30px;
      font-size: 12px;
    }

    .meta-item strong {
      color: #0b1329;
      display: block;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .meta-item span {
      font-weight: 600;
      color: #334155;
    }

    h1.doc-title {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 24px;
      color: #0b1329;
      margin-top: 0;
      margin-bottom: 10px;
      line-height: 1.3;
    }

    .module-subtitle {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 25px;
      font-weight: 600;
    }

    .chapter h2 {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 16px;
      color: #0b1329;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 25px;
    }

    .callout {
      background: #fef3c7;
      border-left: 4px solid #d97706;
      padding: 15px;
      margin: 20px 0;
      font-size: 13px;
    }

    .callout strong {
      color: #78350f;
    }

    .formula-box {
      background: #0b1329;
      color: #fbbf24;
      font-family: 'Courier New', Courier, monospace;
      font-weight: bold;
      font-size: 16px;
      text-align: center;
      padding: 15px;
      margin: 20px 0;
      letter-spacing: 1px;
    }

    .code-box {
      background: #1e293b;
      color: #38bdf8;
      padding: 15px;
      font-size: 12px;
      overflow-x: auto;
      margin: 15px 0;
    }

    blockquote {
      border-left: 3px solid #d97706;
      margin: 15px 0;
      padding-left: 15px;
      font-style: italic;
      color: #475569;
    }

    .summary-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 20px;
      margin-top: 35px;
      font-size: 12px;
    }

    .summary-box h3 {
      font-family: 'Cinzel', Georgia, serif;
      margin-top: 0;
      color: #0b1329;
    }

    /* Worksheet specific styling */
    .answer-lines {
      margin-top: 10px;
      margin-bottom: 20px;
    }
    .answer-lines .line {
      border-bottom: 1px dashed #cbd5e1;
      height: 24px;
    }
    .problem-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 12px;
      font-size: 13px;
      margin-top: 8px;
    }

    footer {
      margin-top: 50px;
      border-top: 1px solid #e2e8f0;
      padding-top: 15px;
      font-size: 10px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    @media print {
      body { background: white; }
      .document-container { box-shadow: none; border: none; padding: 0; margin: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="document-container">
    <header>
      <div class="school-branding">
        <h2 class="school-title">Virtuelle Academique</h2>
        <div class="school-subtitle">South African National CAPS Homeschool Curriculum</div>
      </div>
      <div class="doc-badge">
        <div>${docTypeLabel}</div>
        <div style="font-size: 8px; font-weight: normal; margin-top: 2px;">Ref: VA-2026-CAPS</div>
      </div>
    </header>

    <div class="meta-grid">
      <div class="meta-item">
        <strong>Subject & Grade:</strong>
        <span>${res.subjectName} (${grade})</span>
      </div>
      <div class="meta-item">
        <strong>Student Name:</strong>
        <span>${studentName}</span>
      </div>
      <div class="meta-item">
        <strong>Module Name:</strong>
        <span>${res.moduleTitle}</span>
      </div>
      <div class="meta-item">
        <strong>Issue Date:</strong>
        <span>${today}</span>
      </div>
    </div>

    <h1 class="doc-title">${res.name.replace(/\.(pdf|docx|java|txt)$/i, "")}</h1>
    <div class="module-subtitle">${res.moduleTitle} — Academic Study Unit</div>

    ${contentHTML}

    ${activitySection}

    <footer>
      <div>Virtuelle Academique © 2026. All rights reserved. Registered CAPS Academic Provider.</div>
      <div>Verified Student Document | ${studentName}</div>
    </footer>
  </div>
</body>
</html>`;
}

export function downloadDocumentFile(res: DocumentResource) {
  const htmlContent = generateDocumentHTML(res);
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  const fileNameClean = res.name.replace(/\.[^/.]+$/, "") + ".html";
  link.download = fileNameClean;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

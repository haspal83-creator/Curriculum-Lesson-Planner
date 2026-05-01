import React from 'react';
import { Book, HelpCircle, Mail, ExternalLink, MessageSquare, Info } from 'lucide-react';
import { Card, Button } from '../ui';
import Markdown from 'react-markdown';

const manualContent = `
# Curriculum Lesson Planner AI - Instruction Manual

Welcome to the **Curriculum Lesson Planner AI**, a professional educational productivity platform designed to empower teachers with high-quality, curriculum-aligned lesson plans and comprehensive teaching resources.

---

## 1. Getting Started

### Login
Access the platform using your **Google Account**. This ensures your data is securely saved and synced across devices.

### User Settings
Before planning, visit the **Settings** tab to:
*   Set your **Default Grade** and **Subject**.
*   Configure **AI Quality Preferences** (e.g., preferred teaching models like 5E or UDL, inclusion of teacher scripts, and detail level).
*   Define your **School Name** for professional document headers.

---

## 2. Curriculum Repository

The heart of the platform is the **Curriculum Repository**. The AI uses this data to ensure every lesson you plan meets official educational standards.

### Uploading Guides
*   Click **"Upload Guide"** to import PDF, DOCX, or TXT curriculum documents.
*   The **AI Parsing Engine** will automatically extract Strands, Topics, Subtopics, and Learning Outcomes.
*   *Tip:* You can also use **"Load Sample Data"** to see how the system works with pre-configured Belizean curriculum examples.

### Manual Management
*   **Add Entry:** Create custom curriculum entries manually if needed.
*   **Search & Filter:** Use the search bar and grade/subject filters to find specific outcomes quickly.
*   **Use:** Click "Use" on any curriculum entry to jump directly into the Planner with that data pre-filled.

---

## 3. AI Lesson Planner

The **Planner** tab is where you turn curriculum outcomes into actionable lessons.

### Configuration
1.  **Select Context:** Choose the Grade, Subject, and Date.
2.  **Pacing Awareness:** The system is aware of your **Academic Calendar**. It knows if you are in Cycle 1 or Cycle 4 and adjusts lesson complexity based on available teaching days.
3.  **Topic Selection:** Choose from the topics and outcomes extracted from your uploaded curriculum.
4.  **AI Model:** Select a **Teaching Model** (e.g., 5E, Inquiry-based, Direct Instruction) and an **Output Style** (e.g., Standard, Observation-Ready, Student-Friendly).

### Generation & Refinement
*   Click **"Generate Lesson Plan"** to create a full draft.
*   **Refine:** Use the **"Make Interactive"** button or provide custom instructions (e.g., "Add more group work" or "Simplify for ESL students") to improve the plan.

---

## 4. The Lesson Execution Pack

When you generate a lesson, the platform creates a **Lesson Execution Pack**—everything you need to walk into class and teach.

### Key Components:
*   **Lesson Plan:** A detailed pedagogical guide following your chosen model.
*   **Video Assistant:** Specific timestamps for educational videos with "Pause & Discuss" questions.
*   **Visual Aids:** Student-friendly wording and descriptions for anchor charts or slides.
*   **Board Plan:** A visual layout of how to organize your chalkboard or whiteboard.
*   **Materials & Prep:** An exact list of items needed, including general preparation steps and substitutes.
*   **Demonstration:** Step-by-step guides for teacher-led modeling or experiments.

---

## 5. Teacher Execution Mode

For real-time classroom use, switch to **Execution Mode** (the "Teach Now" tab).

*   **Live Script:** A simplified, high-visibility script for the teacher to follow during the lesson.
*   **Board Reference:** A quick-glance guide to your board layout.
*   **Pause Points:** Instant access to video discussion questions.
*   **Check-In:** Quickly log lesson completion or issues directly from the execution screen.

---

## 6. Assessment & Progress Tracking

### Post-Lesson Check-In
After teaching, click **"Check In"** to:
*   Mark the lesson as **Completed, Partially Taught, or Needs Reteach**.
*   Log **Student Mastery** (how many students met the objective).
*   Record **Misconceptions** or students needing extra support.

### Dashboards
*   **Curriculum Coverage:** See which outcomes have been mastered and which are still pending.
*   **Pacing Dashboard:** Track your progress through the academic year and see if you are ahead or behind schedule.

---

## 7. Tips for Best Results

*   **Be Specific:** The more detailed your curriculum outcomes are, the better the AI-generated lesson will be.
*   **Use the "Improve" Feature:** Don't settle for the first draft. Use the AI refinement tool to tailor the lesson to your specific class needs.
*   **Keep Settings Updated:** If you change your teaching style, update your AI preferences in Settings to ensure all future plans match your new approach.
*   **Print for Offline Use:** Use the **Print** icon on any lesson plan to generate a clean, professional hard copy for your teacher's binder.
`;

export function HelpView() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Help & Instruction Manual</h2>
          <p className="text-sm text-gray-500">Everything you need to know about using the Curriculum Lesson Planner AI.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary">
            <Mail className="w-4 h-4" />
            Contact Support
          </Button>
          <Button>
            <MessageSquare className="w-4 h-4" />
            Give Feedback
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 space-y-1 sticky top-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-4 py-2">Quick Links</h3>
            <QuickLink icon={<Book className="w-4 h-4" />} label="Instruction Manual" active />
            <QuickLink icon={<HelpCircle className="w-4 h-4" />} label="FAQs" />
            <QuickLink icon={<Info className="w-4 h-4" />} label="Release Notes" />
            <QuickLink icon={<ExternalLink className="w-4 h-4" />} label="Video Tutorials" />
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="p-8 md:p-12 prose prose-indigo max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-gray-600 prose-li:text-gray-600">
            <div className="markdown-body">
              <Markdown>{manualContent}</Markdown>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}>
      {icon}
      {label}
    </button>
  );
}

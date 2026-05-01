import { LessonPlan, SavedLesson, LessonResourceNew, LanguageArtsWeeklyPlan, WeeklyCurriculumPlan, DailyLessonPlan, WeeklyLessonPlan } from '../types';

function toBullets(text: string | string[] | undefined | null) {
  if (!text) return "-";
  const content = Array.isArray(text) ? text.join(' ') : text;
  if (!content.trim()) return "-";
  
  return content
    .split(/(?<=\.)\s+|\n+/) // split by sentences or newlines
    .filter(line => line.trim().length > 0)
    .map(line => `- ${line.trim()}`)
    .join("\n");
}

export function formatLessonForExport(data: LessonPlan, teacherNameOverride?: string) {
  const teacherName = teacherNameOverride || data.studentTeacherName || "Hassan Palacio"; // Fallback as requested
  const today = new Date();
  const dateStr = data.date || `${today.getDate()}th ${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}`;
  
  // Mapping logic for fields that might be missing or structured
  const objectives = toBullets(data.specificObjectives?.join(' ') || data.learningObjectivesBoard?.knowledge);
  const resources = toBullets(data.materials?.join(' ') || data.materialsBoard?.map(m => m.name).join(' '));
  const differentiation = toBullets(data.differentiation?.join(' ') || data.differentiationFramework?.strugglingLearners?.scaffolds?.join(' '));
  const evaluation = toBullets(data.reflection);
  
  // Procedure mapping with Step labels
  const steps = data.executionBoard?.map((b, i) => `Step ${i + 1}:\n${toBullets(b.teacherActions.join(' '))}`).join('\n\n') || 
                [data.introduction, data.development, data.guidedPractice, data.independentPractice]
                  .filter(Boolean)
                  .map((p, i) => `Step ${i + 1}:\n${toBullets(p?.join(' '))}`)
                  .join('\n\n');

  return `
Student Teacher Name:  ${teacherName}
Date:  ${dateStr}
Subject:  ${data.subject}
Topic:  ${data.topic}
Sub-topic:  ${data.subtopic || 'N/A'}
Class Level:  ${data.grade}
Class size:  ${data.classSize || '17 Students'}
Age range:  ${data.ageRange || '10-12 years old'}
Time & Duration:  ${data.duration || '9:00-10:30'}

Previous Knowledge:  
${toBullets(data.previousKnowledge)}

Targeted core- competency(ies):  
${toBullets(data.structured_json?.competencies)}

Content Standard/content strands:  
${toBullets(data.strand)}

Learning Outcome(s):  
${toBullets(data.learningOutcome)}

Behavioral Objectives:  
${objectives}

Content/concepts:  
${toBullets(data.lessonSnapshot?.about)}

Curricular Linkages:  
${toBullets(data.structured_json?.linkages)}

Teaching-Learning Resources:  
${resources}

References:  
${toBullets(data.structured_json?.references)}

Methodology:  
${toBullets(data.teachingModel)}

Procedure:

${steps || '-'}

Conclusion (summative assessment activity):  
${toBullets(data.closurePanel?.exitQuestion || data.closure?.join(' '))}

Differentiation:  
${differentiation}

Extended Activity:  
${toBullets(data.homeworkExtension?.task || data.homework?.join(' '))}

Lesson Evaluation:  
${evaluation}
`;
}

export const exportToPDF = (plan: LessonPlan) => {
  const content = formatLessonForExport(plan);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(plan.lessonTitle || plan.topic).replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToWord = (plan: LessonPlan, teacherName?: string) => {
  const contentStr = formatLessonForExport(plan, teacherName);
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${plan.lessonTitle || plan.topic}</title>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; padding: 20px; white-space: pre-wrap; }
      </style>
    </head>
    <body>
      ${contentStr.replace(/\n/g, '<br/>')}
    </body>
    </html>
  `;

  downloadDoc(content, `${plan.lessonTitle || plan.topic}`);
};

export const exportSavedLessonToWord = (lesson: SavedLesson, resources: LessonResourceNew[]) => {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${lesson.title}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.6; padding: 20px; }
        h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; }
        h2 { color: #1e40af; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
        h3 { color: #4b5563; margin-top: 20px; }
        .metadata { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .label { font-weight: bold; color: #374151; }
        .resource-section { border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px; margin-bottom: 30px; page-break-inside: avoid; }
        pre { background: #f9fafb; padding: 10px; border-radius: 4px; white-space: pre-wrap; }
      </style>
    </head>
    <body>
      <h1>${lesson.title} - Complete Pack</h1>
      <div class="metadata">
        <p><span class="label">Subject:</span> ${lesson.subject} | <span class="label">Grade:</span> ${lesson.class_id}</p>
        <p><span class="label">Topic:</span> ${lesson.topic} | <span class="label">Duration:</span> ${lesson.duration}</p>
      </div>

      ${resources.sort((a, b) => a.resource_type.localeCompare(b.resource_type)).map(res => `
        <div class="resource-section">
          <h2>${res.title}</h2>
          <div class="content">
            ${typeof res.content === 'string' 
              ? res.content.replace(/\n/g, '<br/>') 
              : `<pre>${JSON.stringify(res.content, null, 2)}</pre>`}
          </div>
        </div>
      `).join('')}
    </body>
    </html>
  `;

  downloadDoc(content, `${lesson.title}_Full_Pack`);
};

export const exportLAWeeklyToWord = (plan: LanguageArtsWeeklyPlan) => {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${plan.theme}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.6; padding: 20px; }
        h1 { color: #d97706; border-bottom: 2px solid #d97706; padding-bottom: 10px; margin-bottom: 20px; }
        h2 { color: #92400e; margin-top: 30px; border-bottom: 1px solid #fde68a; padding-bottom: 5px; }
        h3 { color: #4b5563; margin-top: 20px; }
        .metadata { background: #fffbeb; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #fde68a; }
        .label { font-weight: bold; color: #92400e; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #fcd34d; padding: 10px; text-align: left; }
        th { background-color: #fffbeb; font-weight: bold; color: #92400e; }
      </style>
    </head>
    <body>
      <h1>Language Arts Weekly Plan: ${plan.theme}</h1>
      <div class="metadata">
        <p><span class="label">Grade:</span> ${plan.grade} | <span class="label">Subject:</span> ${plan.subject}</p>
        <p><span class="label">Cycle:</span> ${plan.cycle} | <span class="label">Week:</span> ${plan.week}</p>
      </div>

      <h2>Weekly Learning Outcomes</h2>
      <ul>
        ${plan.learningOutcomes.map(item => `<li>${item}</li>`).join('')}
      </ul>

      <h2>Daily Schedule</h2>
      <table>
        <thead>
          <tr>
            <th>Day</th>
            ${plan.days[0].strands.map(s => `<th>${s.strand} (${s.timeAllocation})</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${plan.days.map(day => `
            <tr>
              <td><strong>Day ${day.day}</strong><br/>${day.date}</td>
              ${day.strands.map(strand => `
                <td>
                  <p><strong>Objective:</strong> ${strand.objective}</p>
                  <p><strong>Activities:</strong> ${strand.activities.join(', ')}</p>
                </td>
              `).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  downloadDoc(content, `${plan.theme}_Weekly_Plan`);
};

export const exportWeeklyCurriculumToWord = (plan: WeeklyCurriculumPlan) => {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${plan.weekly_topic}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.6; padding: 20px; }
        h1 { color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px; margin-bottom: 20px; }
        h2 { color: #065f46; margin-top: 30px; border-bottom: 1px solid #d1fae5; padding-bottom: 5px; }
        h3 { color: #4b5563; margin-top: 20px; }
        .metadata { background: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #d1fae5; }
        .label { font-weight: bold; color: #065f46; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #d1fae5; padding: 10px; text-align: left; }
        th { background-color: #f0fdf4; font-weight: bold; color: #065f46; }
      </style>
    </head>
    <body>
      <h1>Weekly Curriculum Plan: ${plan.weekly_topic}</h1>
      <div class="metadata">
        <p><span class="label">Grade:</span> ${plan.grade_level} | <span class="label">Subject:</span> ${plan.subject}</p>
        <p><span class="label">Cycle:</span> ${plan.cycle} | <span class="label">Week:</span> ${plan.week_number}</p>
      </div>

      <h2>Weekly Big Idea</h2>
      <p><em>${plan.weekly_big_idea}</em></p>

      <h2>Learning Outcomes</h2>
      <ul>
        ${plan.weekly_learning_outcomes.map(item => `<li>${item}</li>`).join('')}
      </ul>

      <h2>Skill Progression</h2>
      <p>${plan.weekly_skill_progression}</p>

      <h2>Daily Schedule</h2>
      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Lesson Title</th>
            <th>Focus</th>
            <th>Objective</th>
          </tr>
        </thead>
        <tbody>
          ${plan.daily_breakdown_table.map(day => `
            <tr>
              <td>Day ${day.day}</td>
              <td><strong>${day.lessonTitle}</strong></td>
              <td>${day.focus}</td>
              <td>${day.objectiveSummary}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>Suggested Assessment</h2>
      <p>${plan.suggested_assessment}</p>
    </body>
    </html>
  `;

  downloadDoc(content, `${plan.weekly_topic}_Weekly_Curriculum`);
};

export const exportDailyPlanToWord = (plan: DailyLessonPlan) => {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${plan.lesson_title}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.6; padding: 20px; }
        h1 { color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; margin-bottom: 20px; }
        h2 { color: #3730a3; margin-top: 30px; border-bottom: 1px solid #e0e7ff; padding-bottom: 5px; }
        .metadata { background: #eef2ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e0e7ff; }
        .label { font-weight: bold; color: #3730a3; }
        .section { margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>Daily Lesson Plan: ${plan.lesson_title}</h1>
      <div class="metadata">
        <p><span class="label">Grade:</span> ${plan.grade} | <span class="label">Subject:</span> ${plan.subject}</p>
        <p><span class="label">Topic:</span> ${plan.topic}</p>
        <p><span class="label">Date:</span> Cycle ${plan.cycle}, Week ${plan.week}, Day ${plan.day}</p>
      </div>

      <div class="section">
        <h2>Lesson Focus</h2>
        <p>${plan.focus}</p>
      </div>

      <div class="section">
        <h2>Learning Objective</h2>
        <p>${plan.objectiveSummary}</p>
      </div>

      <div class="section">
        <h2>Main Activity</h2>
        <p>${plan.mainActivity}</p>
      </div>

      <div class="section">
        <h2>Assessment Check</h2>
        <p>${plan.assessmentCheck}</p>
      </div>

      ${plan.teacher_notes ? `
        <div class="section">
          <h2>Teacher Notes</h2>
          <p><em>${plan.teacher_notes}</em></p>
        </div>
      ` : ''}
    </body>
    </html>
  `;

  downloadDoc(content, `${plan.lesson_title}_Daily_Plan`);
};

export const exportWeeklyLessonPlanToWord = (plan: WeeklyLessonPlan, teacherName?: string) => {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${plan.week.topic}</title>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; padding: 20px; white-space: pre-wrap; }
        .day-separator { page-break-after: always; margin-bottom: 50px; border-bottom: 2px dashed #ccc; padding-bottom: 20px; }
      </style>
    </head>
    <body>
      ${plan.week.days.map(day => `
        <div class="day-section ${day.day !== 'Friday' ? 'day-separator' : ''}">
          ${formatLessonForExport(day.lesson, teacherName).replace(/\n/g, '<br/>')}
        </div>
      `).join('')}
    </body>
    </html>
  `;

  downloadDoc(content, `${plan.week.topic}_Weekly_Plan`);
};

function downloadDoc(htmlContent: string, fileName: string) {
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName.replace(/\s+/g, '_')}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

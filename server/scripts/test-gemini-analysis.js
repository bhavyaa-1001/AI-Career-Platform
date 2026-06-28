import 'dotenv/config';

import { analyzeResumeText } from '../src/services/geminiService.js';

const sampleResume = `
John Doe
Software Engineer | john@example.com | New York

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years building scalable web applications.

EXPERIENCE
Senior Software Engineer — Acme Corp | 2020 - Present
- Led development of customer-facing React dashboard serving 50k users
- Reduced API latency by 40% through query optimization
- Mentored 3 junior developers

Software Engineer — StartupXYZ | 2018 - 2020
- Built REST APIs with Node.js and Express
- Implemented CI/CD pipeline with GitHub Actions

EDUCATION
BS Computer Science — State University | 2018

SKILLS
JavaScript, TypeScript, React, Node.js, MongoDB, AWS, Docker
`.trim();

try {
  const result = await analyzeResumeText({ resumeText: sampleResume, targetRole: 'Senior Software Engineer' });
  console.log('SUCCESS');
  console.log('Model:', result.model);
  console.log('ATS:', result.atsScore);
  console.log('Grammar:', result.grammar.score);
  console.log('Summary:', result.resumeSummary?.slice(0, 100));
} catch (err) {
  console.log('FAILED:', err.statusCode, err.message);
}

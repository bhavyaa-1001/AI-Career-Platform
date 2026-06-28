import crypto from 'crypto';

import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

import { ApiError } from '../utils/ApiError.js';

const SECTION_HEADERS = [
  { key: 'summary', patterns: [/^(professional\s*)?summary$/i, /^profile$/i, /^objective$/i, /^about(\s*me)?$/i] },
  { key: 'experience', patterns: [/^(work\s*)?experience$/i, /^employment(\s*history)?$/i, /^professional\s*experience$/i, /^work\s*history$/i] },
  { key: 'education', patterns: [/^education$/i, /^academic(\s*background)?$/i, /^qualifications$/i] },
  { key: 'skills', patterns: [/^(technical\s*)?skills$/i, /^core\s*competencies$/i, /^technologies$/i, /^expertise$/i] },
  { key: 'projects', patterns: [/^projects$/i, /^personal\s*projects$/i, /^portfolio$/i] },
  { key: 'certificates', patterns: [/^(certifications?|certificates?)$/i, /^licenses$/i] },
  { key: 'achievements', patterns: [/^(achievements?|awards?|honors?)$/i] },
  { key: 'languages', patterns: [/^languages$/i] },
  { key: 'interests', patterns: [/^interests$/i, /^hobbies$/i] },
];

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const PHONE_RE = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/;
const URL_RE = /https?:\/\/[^\s]+|(?:linkedin|github)\.com\/[^\s]+/gi;
const DATE_RANGE_RE = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?\d{4}\s*[-–—]\s*(?:Present|Current|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}\s*[-–—]\s*(?:Present|Current)/gi;
const DEGREE_RE = /\b(Ph\.?D\.?|M\.?(?:S\.?|A\.?)|B\.?(?:S\.?|A\.?)|Bachelor|Master|Doctor|Associate|Diploma|B\.Tech|M\.Tech|MBA|BSc|MSc)\b/i;

const normalizeText = (text) =>
  text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \u00a0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const withId = (item) => ({ ...item, id: crypto.randomUUID() });

export const extractTextFromPdf = async (buffer) => {
  if (!buffer?.length) {
    throw new ApiError(400, 'Uploaded PDF file is empty');
  }

  let parser;
  try {
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = normalizeText(result.text || '');

    if (text.length < 20) {
      throw new ApiError(
        422,
        'Could not extract enough text from this PDF. Try a text-based PDF export or upload a DOCX file instead.',
      );
    }

    return text;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      422,
      'Unable to read this PDF. Try uploading DOCX or re-export your resume as a text-based PDF.',
    );
  } finally {
    if (parser) {
      await parser.destroy().catch(() => {});
    }
  }
};

export const extractTextFromDocx = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return normalizeText(result.value || '');
  } catch {
    throw new ApiError(422, 'Unable to extract text from DOCX file.');
  }
};

export const extractTextFromFile = async (file) => {
  if (!file?.buffer) throw new ApiError(400, 'No file uploaded');

  const name = file.originalname?.toLowerCase() || '';
  const isPdf = file.mimetype === 'application/pdf' || name.endsWith('.pdf');
  const isDocx =
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx');

  if (isPdf) return { text: await extractTextFromPdf(file.buffer), fileType: 'pdf' };
  if (isDocx) return { text: await extractTextFromDocx(file.buffer), fileType: 'docx' };

  throw new ApiError(400, 'Unsupported file type. Upload PDF or DOCX.');
};

const detectSectionKey = (line) => {
  const trimmed = line.trim().replace(/[:\-–—]+$/, '').trim();
  for (const section of SECTION_HEADERS) {
    if (section.patterns.some((p) => p.test(trimmed))) return section.key;
  }
  return null;
};

const splitIntoSections = (text) => {
  const lines = text.split('\n');
  const sections = { preamble: [] };
  let current = 'preamble';

  for (const line of lines) {
    const key = detectSectionKey(line);
    if (key && line.trim().length < 60) {
      current = key;
      if (!sections[current]) sections[current] = [];
    } else {
      if (!sections[current]) sections[current] = [];
      sections[current].push(line);
    }
  }

  const result = {};
  for (const [key, value] of Object.entries(sections)) {
    result[key] = value.join('\n').trim();
  }
  return result;
};

const extractPersonalInfo = (preamble, fullText) => {
  const lines = preamble.split('\n').map((l) => l.trim()).filter(Boolean);
  const email = fullText.match(EMAIL_RE)?.[0] || '';
  const phone = fullText.match(PHONE_RE)?.[0] || '';
  const urls = fullText.match(URL_RE) || [];

  let fullName = lines[0] || '';
  if (fullName.includes('@') || EMAIL_RE.test(fullName) || fullName.length > 60) {
    fullName = lines.find((l) => !EMAIL_RE.test(l) && !PHONE_RE.test(l) && l.length < 50) || '';
  }

  const socialLinks = { github: '', linkedin: '', portfolio: '', twitter: '' };
  urls.forEach((url) => {
    const lower = url.toLowerCase();
    if (lower.includes('github.com')) socialLinks.github = url;
    else if (lower.includes('linkedin.com')) socialLinks.linkedin = url;
    else if (!socialLinks.portfolio) socialLinks.portfolio = url;
  });

  const headline = lines.find(
    (l, i) => i > 0 && l !== fullName && !EMAIL_RE.test(l) && !PHONE_RE.test(l) && l.length < 100,
  ) || '';

  return {
    fullName,
    email,
    phone,
    location: lines.find((l) => /\b[A-Z][a-z]+,\s*[A-Z]{2}\b/.test(l) || /\b(remote|usa|uk|india)\b/i.test(l)) || '',
    headline,
    website: socialLinks.portfolio || socialLinks.github || socialLinks.linkedin || '',
    socialLinks,
  };
};

const parseExperience = (block) => {
  if (!block) return [];
  const chunks = block.split(/\n(?=[•\-*]|\d{4}|[A-Z][a-z]+.*\d{4})/).filter(Boolean);
  const entries = [];

  for (const chunk of chunks) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    const dateMatch = chunk.match(DATE_RANGE_RE);
    const dates = dateMatch?.[0] || '';
    const isCurrent = /present|current/i.test(dates);

    let title = lines[0].replace(/^[-•*]\s*/, '');
    let company = lines[1] || '';

    if (dates && title.includes(dates)) {
      title = title.replace(dates, '').replace(/\s*[-–—|,]\s*$/, '').trim();
    }

    const pipeParts = title.split(/\s*[|@]\s*|\s+at\s+/i);
    if (pipeParts.length >= 2) {
      title = pipeParts[0].trim();
      company = pipeParts[1].trim();
    }

    const description = lines.slice(company === lines[1] ? 2 : 1).join('\n').replace(/^[-•*]\s*/gm, '').trim();

    if (title.length > 2) {
      entries.push(withId({
        title,
        company,
        location: '',
        startDate: dates.split(/[-–—]/)[0]?.trim() || '',
        endDate: isCurrent ? '' : dates.split(/[-–—]/)[1]?.trim() || '',
        isCurrent,
        description,
      }));
    }
  }

  return entries.slice(0, 15);
};

const parseEducation = (block) => {
  if (!block) return [];
  const chunks = block.split(/\n(?=[•\-*]|\d{4}|Bachelor|Master|B\.|M\.|Ph\.)/i).filter(Boolean);
  const entries = [];

  for (const chunk of chunks) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    const degreeLine = lines.find((l) => DEGREE_RE.test(l)) || lines[0];
    const institution = lines.find((l) => l !== degreeLine && !DATE_RANGE_RE.test(l)) || '';
    const dateMatch = chunk.match(DATE_RANGE_RE);

    entries.push(withId({
      institution,
      degree: degreeLine.replace(/^[-•*]\s*/, ''),
      fieldOfStudy: '',
      startDate: dateMatch?.[0]?.split(/[-–—]/)[0]?.trim() || '',
      endDate: dateMatch?.[0]?.split(/[-–—]/)[1]?.trim() || '',
      isCurrent: /present|current/i.test(chunk),
      grade: '',
      description: lines.slice(2).join('\n').trim(),
    }));
  }

  return entries.slice(0, 10);
};

const parseSkills = (block) => {
  if (!block) return [];
  const items = block
    .split(/[,|•\n\-;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 50 && !/^(skills|technical)$/i.test(s));

  return [...new Set(items)].slice(0, 30).map((name) => withId({ name, proficiency: 'Intermediate' }));
};

const parseProjects = (block) => {
  if (!block) return [];
  const chunks = block.split(/\n(?=[•\-*]|[A-Z][a-zA-Z0-9\s]{3,40}$)/).filter(Boolean);
  const entries = [];

  for (const chunk of chunks) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    const title = lines[0].replace(/^[-•*]\s*/, '');
    const url = lines.join(' ').match(URL_RE)?.[0] || '';
    const techMatch = lines.find((l) => /technologies|stack|built with/i.test(l));
    const technologies = techMatch
      ? techMatch.replace(/.*[:]/, '').split(/[,|]/).map((t) => t.trim()).filter(Boolean)
      : [];

    entries.push(withId({
      title,
      description: lines.slice(1).join('\n').replace(/^[-•*]\s*/gm, '').trim(),
      url,
      technologies,
      startDate: '',
      endDate: '',
    }));
  }

  return entries.slice(0, 10);
};

export const mapResumeFields = (text) => {
  const normalized = normalizeText(text);
  if (!normalized || normalized.length < 20) {
    throw new ApiError(422, 'Could not extract enough text from the file to parse a resume.');
  }

  const sections = splitIntoSections(normalized);
  const personal = extractPersonalInfo(sections.preamble || '', normalized);

  const content = {
    personalInfo: {
      fullName: personal.fullName,
      email: personal.email,
      phone: personal.phone,
      location: personal.location,
      headline: personal.headline,
      website: personal.website,
    },
    summary: { text: sections.summary || '' },
    experience: parseExperience(sections.experience),
    education: parseEducation(sections.education),
    skills: parseSkills(sections.skills),
    projects: parseProjects(sections.projects),
    certificates: [],
    achievements: [],
    languages: [],
    interests: sections.interests
      ? sections.interests.split(/[,|•\n]/).map((s) => s.trim()).filter(Boolean).slice(0, 10)
      : [],
    socialLinks: personal.socialLinks,
  };

  const stats = {
    experience: content.experience.length,
    education: content.education.length,
    skills: content.skills.length,
    projects: content.projects.length,
  };

  return {
    content,
    stats,
    rawTextPreview: normalized.slice(0, 2000),
    rawTextLength: normalized.length,
  };
};

export const parseResumeFile = async (file) => {
  const { text, fileType } = await extractTextFromFile(file);
  const mapped = mapResumeFields(text);
  return { ...mapped, fileType };
};

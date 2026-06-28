import puppeteer from 'puppeteer';

import { ApiError } from '../utils/ApiError.js';
import { renderResumeHtml } from '../utils/resumeHtmlRenderer.js';

import { logActivity } from './activityService.js';
import { getResumeById } from './resumeService.js';

let browserInstance = null;

const getBrowser = async () => {
  if (browserInstance?.connected) return browserInstance;
  browserInstance = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  return browserInstance;
};

export const generatePdfBuffer = async (html) => {
  let page;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0.45in', right: '0.45in', bottom: '0.45in', left: '0.45in' },
    });
    return pdf;
  } catch (err) {
    throw new ApiError(500, `PDF generation failed: ${err.message || 'Unknown error'}`);
  } finally {
    if (page) await page.close().catch(() => {});
  }
};

const mergeResumeData = (saved, override) => {
  if (!override) return saved;
  return {
    ...saved,
    title: override.title ?? saved.title,
    template: override.template ?? saved.template,
    settings: { ...saved.settings, ...override.settings },
    sectionOrder: override.sectionOrder ?? saved.sectionOrder,
    sectionVisibility: { ...saved.sectionVisibility, ...override.sectionVisibility },
    content: override.content
      ? {
          ...saved.content,
          ...override.content,
          personalInfo: { ...saved.content.personalInfo, ...override.content.personalInfo },
          summary: { ...saved.content.summary, ...override.content.summary },
          socialLinks: { ...saved.content.socialLinks, ...override.content.socialLinks },
        }
      : saved.content,
  };
};

export const exportResumePdf = async (resumeId, userId, override = null) => {
  const saved = await getResumeById(resumeId, userId);
  const resume = mergeResumeData(saved, override);
  const html = renderResumeHtml(resume);
  const buffer = await generatePdfBuffer(html);

  await logActivity(userId, 'profile_update', `Downloaded PDF: ${resume.title}`, { resumeId });

  const filename = `${(resume.title || 'resume').replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'resume'}.pdf`;
  return { buffer, filename, template: resume.template };
};

export const shutdownPdfBrowser = async () => {
  if (browserInstance) {
    await browserInstance.close().catch(() => {});
    browserInstance = null;
  }
};

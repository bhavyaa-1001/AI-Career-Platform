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

const toPlainObject = (value) => {
  if (!value || typeof value !== 'object') return value;
  if (typeof value.toObject === 'function') return value.toObject();
  return value;
};

export const generatePdfBuffer = async (html) => {
  if (!html || html.length < 100) {
    throw new ApiError(500, 'PDF generation failed: resume HTML is empty');
  }

  let page;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'load', timeout: 30000 });
    /* eslint-disable no-undef -- evaluated in Puppeteer browser context */
    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready;
    });

    const hasVisibleText = await page.evaluate(() => {
      const text = document.body?.innerText?.replace(/\s+/g, ' ').trim() || '';
      return text.length > 0;
    });
    /* eslint-enable no-undef */
    if (!hasVisibleText) {
      throw new ApiError(500, 'PDF generation failed: resume has no visible content');
    }

    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.45in', right: '0.45in', bottom: '0.45in', left: '0.45in' },
    });

    const buffer = Buffer.from(pdf);
    if (buffer.length < 1000) {
      throw new ApiError(500, 'PDF generation failed: output file is empty');
    }

    return buffer;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, `PDF generation failed: ${err.message || 'Unknown error'}`);
  } finally {
    if (page) await page.close().catch(() => {});
  }
};

const mergeResumeData = (saved, override) => {
  if (!override) return saved;

  const savedSettings = toPlainObject(saved.settings) || {};
  const overrideSettings = toPlainObject(override.settings) || {};
  const savedContent = toPlainObject(saved.content) || {};
  const overrideContent = toPlainObject(override.content) || {};

  return {
    ...saved,
    title: override.title ?? saved.title,
    template: override.template ?? saved.template,
    settings: { ...savedSettings, ...overrideSettings },
    sectionOrder: override.sectionOrder ?? saved.sectionOrder,
    sectionVisibility: { ...saved.sectionVisibility, ...override.sectionVisibility },
    content: override.content
      ? {
          ...savedContent,
          ...overrideContent,
          personalInfo: { ...savedContent.personalInfo, ...overrideContent.personalInfo },
          summary: { ...savedContent.summary, ...overrideContent.summary },
          socialLinks: { ...savedContent.socialLinks, ...overrideContent.socialLinks },
        }
      : savedContent,
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

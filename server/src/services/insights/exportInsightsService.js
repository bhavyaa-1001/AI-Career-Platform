import puppeteer from 'puppeteer';

import { ApiError } from '../../utils/ApiError.js';

const escapeCsv = (val) => {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

export const insightsToCsv = (data, role) => {
  const rows = [['Section', 'Metric', 'Value']];

  const addSection = (section, obj) => {
    Object.entries(obj || {}).forEach(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) return;
      rows.push([section, key, Array.isArray(value) ? value.length : value]);
    });
  };

  addSection('Summary', data.summary);
  rows.push(['Meta', 'Role', role]);
  rows.push(['Meta', 'From', data.filters?.from || 'all']);
  rows.push(['Meta', 'To', data.filters?.to || 'all']);

  if (data.applications?.overTime) {
    data.applications.overTime.forEach((r) => {
      rows.push(['Applications Over Time', r.month || r.date, r.count]);
    });
  }

  if (data.resumeScores?.history) {
    data.resumeScores.history.forEach((r) => {
      rows.push(['Resume Score', r.label || r.date, r.atsScore]);
    });
  }

  if (data.heatmap) {
    data.heatmap.forEach((r) => {
      rows.push(['Heatmap', r.date, r.count]);
    });
  }

  return rows.map((r) => r.map(escapeCsv).join(',')).join('\n');
};

const buildPdfHtml = (data, role, title) => {
  const summaryRows = Object.entries(data.summary || {})
    .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
    .join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  p.meta { color: #666; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
  th { background: #f5f5f5; }
  .section { margin-top: 24px; }
  h2 { font-size: 16px; margin-bottom: 8px; }
</style></head><body>
  <h1>${title}</h1>
  <p class="meta">Role: ${role} | Generated: ${new Date().toLocaleString()}</p>
  <div class="section"><h2>Summary</h2><table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>${summaryRows}</tbody></table></div>
</body></html>`;
};

export const insightsToPdf = async (data, role, title) => {
  const html = buildPdfHtml(data, role, title);
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });
    return pdf;
  } catch (err) {
    throw new ApiError(500, `PDF export failed: ${err.message}`);
  } finally {
    if (browser) await browser.close();
  }
};

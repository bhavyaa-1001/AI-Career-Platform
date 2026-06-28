const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const toParagraphs = (body) => {
  const text = String(body || '').trim();
  if (!text) return '';
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\n/g, '<br/>')}</p>`)
    .join('');
};

export const renderCoverLetterHtml = ({ body, company, role, applicantName }) => {
  const title = esc(`${role} at ${company}`.trim() || 'Cover Letter');
  const name = applicantName ? esc(applicantName) : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; color: #111; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.65;
      padding: 0.75in;
    }
    h1 { font-size: 14pt; font-weight: 600; margin: 0 0 24px; color: #222; }
    p { margin: 0 0 14px; text-align: justify; }
    .signature { margin-top: 28px; }
  </style>
</head>
<body>
  ${name ? `<p style="margin-bottom:24px;font-weight:600">${name}</p>` : ''}
  <h1>Cover Letter — ${title}</h1>
  ${toParagraphs(body)}
  ${name ? `<p class="signature">Sincerely,<br/><br/>${name}</p>` : ''}
</body>
</html>`;
};

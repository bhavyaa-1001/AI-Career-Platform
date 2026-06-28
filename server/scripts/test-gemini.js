import 'dotenv/config';

import { GoogleGenerativeAI } from '@google/generative-ai';

const key = process.env.GEMINI_API_KEY;
const configuredModel = process.env.GEMINI_MODEL || '(not set)';

console.log('GEMINI_MODEL:', configuredModel);
console.log('API key set:', Boolean(key));

if (!key) {
  console.log('No API key');
  process.exit(1);
}

const models = [
  configuredModel,
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite',
].filter((m, i, a) => m && m !== '(not set)' && a.indexOf(m) === i);

const genAI = new GoogleGenerativeAI(key);
const sampleResume = `
John Doe
Software Engineer
john@example.com

EXPERIENCE
Senior Developer at Acme Corp (2020 - Present)
- Built web applications using React and Node.js
- Led team of 3 engineers

SKILLS
JavaScript, React, Node.js, MongoDB
`.trim();

for (const modelName of models) {
  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
    });
    const result = await model.generateContent(
      `Return JSON only: {"atsScore":75,"grammar":{"score":80,"issues":[]},"missingSkills":[],"weakBulletPoints":[],"keywordSuggestions":[],"resumeSummary":"Test","improvementTips":[]}. Resume: ${sampleResume}`,
    );
    const text = result.response.text();
    console.log(`${modelName}: OK (${text.length} chars)`);
  } catch (err) {
    console.log(`${modelName}: FAIL - ${err.message.slice(0, 300)}`);
  }
}

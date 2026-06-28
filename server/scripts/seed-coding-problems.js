/**
 * Seed sample coding problems for development.
 * Usage: node scripts/seed-coding-problems.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import { DEFAULT_STARTER_CODE } from '../src/config/codingConstants.js';
import { CodingProblem } from '../src/models/CodingProblem.js';

const SAMPLE_PROBLEMS = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    description: 'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    difficulty: 'easy',
    category: 'arrays',
    tags: ['array', 'hash-table'],
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
    inputFormat: 'First line: n (array size)\nSecond line: n space-separated integers\nThird line: target',
    outputFormat: 'Two space-separated indices (0-indexed)',
    sampleTestCases: [
      { input: '4\n2 7 11 15\n9', output: '0 1', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: '3\n3 2 4\n6', output: '1 2' },
    ],
    hiddenTestCases: [
      { input: '2\n3 3\n6', output: '0 1' },
    ],
    hints: ['Try using a hash map to store complements.', 'For each element, check if target - element exists in the map.'],
    points: 10,
    status: 'published',
    starterCode: DEFAULT_STARTER_CODE,
  },
  {
    title: 'Reverse String',
    slug: 'reverse-string',
    description: 'Write a program that reads a string and outputs its reverse.',
    difficulty: 'easy',
    category: 'strings',
    tags: ['string', 'two-pointers'],
    constraints: '1 <= s.length <= 10^5',
    inputFormat: 'A single line containing the string s',
    outputFormat: 'The reversed string',
    sampleTestCases: [
      { input: 'hello', output: 'olleh' },
      { input: 'abc', output: 'cba' },
    ],
    hiddenTestCases: [
      { input: 'a', output: 'a' },
    ],
    hints: ['Use two pointers from both ends.', 'Or build a new reversed string.'],
    points: 10,
    status: 'published',
    starterCode: DEFAULT_STARTER_CODE,
  },
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nOutput "true" or "false".',
    difficulty: 'medium',
    category: 'stack',
    tags: ['stack', 'string'],
    constraints: '1 <= s.length <= 10^4',
    inputFormat: 'A single line string s',
    outputFormat: '"true" or "false"',
    sampleTestCases: [
      { input: '()', output: 'true' },
      { input: '([{}])', output: 'true' },
      { input: '(]', output: 'false' },
    ],
    hiddenTestCases: [
      { input: ']', output: 'false' },
    ],
    hints: ['Use a stack to track opening brackets.', 'Pop when you see a matching closing bracket.'],
    points: 20,
    status: 'published',
    starterCode: DEFAULT_STARTER_CODE,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  for (const problem of SAMPLE_PROBLEMS) {
    const existing = await CodingProblem.findOne({ slug: problem.slug });
    if (existing) {
      console.log(`Skip: ${problem.slug} already exists`);
      continue;
    }
    await CodingProblem.create(problem);
    console.log(`Created: ${problem.title}`);
  }

  console.log('Done seeding coding problems.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const PROBLEM_DIFFICULTIES = ['easy', 'medium', 'hard'];
export const PROBLEM_STATUSES = ['draft', 'published', 'archived'];
export const PROBLEM_CATEGORIES = [
  'arrays', 'strings', 'linked-list', 'trees', 'graphs', 'dynamic-programming',
  'math', 'sorting', 'searching', 'stack', 'queue', 'heap', 'greedy', 'backtracking', 'other',
];

export const CODING_LANGUAGES = ['cpp', 'java', 'python', 'javascript', 'go', 'rust', 'csharp'];

export const JUDGE0_LANGUAGE_IDS = {
  cpp: 54,
  java: 62,
  python: 71,
  javascript: 63,
  go: 60,
  rust: 73,
  csharp: 51,
};

export const SUBMISSION_STATUSES = [
  'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded',
  'runtime_error', 'compilation_error', 'pending', 'running',
];

export const CONTEST_STATUSES = ['scheduled', 'running', 'finished'];
export const ACHIEVEMENT_BADGES = {
  first_solve: { id: 'first_solve', name: 'First Blood', description: 'Solve your first problem' },
  hundred_problems: { id: 'hundred_problems', name: 'Century', description: 'Solve 100 problems' },
  streak_7: { id: 'streak_7', name: '7-Day Streak', description: 'Practice 7 days in a row' },
  streak_30: { id: 'streak_30', name: '30-Day Streak', description: 'Practice 30 days in a row' },
  contest_winner: { id: 'contest_winner', name: 'Contest Champion', description: 'Win a coding contest' },
};

export const DEFAULT_STARTER_CODE = {
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n  // Read input and print output\n  return 0;\n}\n',
  java: 'import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    // Read input and print output\n  }\n}\n',
  python: 'import sys\n\ndef solve():\n    data = sys.stdin.read().strip().split()\n    # Process input and print result\n\nif __name__ == "__main__":\n    solve()\n',
  javascript: "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').trim();\n// Process input and print result\n",
  go: 'package main\n\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\n\nfunc main() {\n\treader := bufio.NewReader(os.Stdin)\n\t_ = reader\n\t// Process input and print result\n}\n',
  rust: 'use std::io::{self, Read};\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_to_string(&mut input).unwrap();\n    // Process input and print result\n}\n',
  csharp: 'using System;\n\nclass Program {\n  static void Main() {\n    // Read input and print output\n  }\n}\n',
};

export const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

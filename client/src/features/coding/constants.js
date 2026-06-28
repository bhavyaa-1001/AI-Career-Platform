export const CODING_LANGUAGES = [
  { id: 'python', label: 'Python', monaco: 'python' },
  { id: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { id: 'java', label: 'Java', monaco: 'java' },
  { id: 'cpp', label: 'C++', monaco: 'cpp' },
  { id: 'go', label: 'Go', monaco: 'go' },
  { id: 'rust', label: 'Rust', monaco: 'rust' },
  { id: 'csharp', label: 'C#', monaco: 'csharp' },
];

export const EDITOR_THEMES = [
  { id: 'vs-dark', label: 'Dark' },
  { id: 'vs-light', label: 'Light' },
  { id: 'hc-black', label: 'High Contrast' },
];

export const DIFFICULTY_COLORS = {
  easy: 'text-green-600 bg-green-500/10',
  medium: 'text-amber-600 bg-amber-500/10',
  hard: 'text-red-600 bg-red-500/10',
};

export const STATUS_COLORS = {
  accepted: 'text-green-600',
  wrong_answer: 'text-red-600',
  time_limit_exceeded: 'text-orange-600',
  memory_limit_exceeded: 'text-orange-600',
  runtime_error: 'text-red-600',
  compilation_error: 'text-red-600',
  pending: 'text-muted-foreground',
  running: 'text-blue-600',
};

export const FONT_SIZES = [12, 13, 14, 15, 16, 18, 20];

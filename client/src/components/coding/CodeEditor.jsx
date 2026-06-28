import Editor from '@monaco-editor/react';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { CODING_LANGUAGES } from '@/features/coding/constants';

export function CodeEditor({ value, onChange, readOnly = false, height = '100%' }) {
  const { language, fontSize, editorTheme, showLineNumbers } = useSelector((s) => s.editor);
  const monacoLang = CODING_LANGUAGES.find((l) => l.id === language)?.monaco || 'python';

  const handleMount = useCallback((editor) => {
    editor.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [2048 | 3], // Ctrl+Enter
      run: () => editor.getContainerDomNode().dispatchEvent(new CustomEvent('coding-run')),
    });
  }, []);

  return (
    <Editor
      height={height}
      language={monacoLang}
      theme={editorTheme}
      value={value}
      onChange={onChange}
      onMount={handleMount}
      options={{
        fontSize,
        readOnly,
        minimap: { enabled: false },
        lineNumbers: showLineNumbers ? 'on' : 'off',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        padding: { top: 12 },
      }}
    />
  );
}

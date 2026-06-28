import { useDispatch, useSelector } from 'react-redux';

import { Button, Select } from '@/components/ui';
import { CODING_LANGUAGES, EDITOR_THEMES, FONT_SIZES } from '@/features/coding/constants';
import {
  setEditorTheme, setFontSize, setLanguage, toggleFullscreen,
} from '@/features/coding/editorSlice';

export function EditorToolbar({
  onRun, onSubmit, onReset, onSaveDraft, onCopy, isRunning, isSubmitting, isSaving,
}) {
  const dispatch = useDispatch();
  const { language, fontSize, editorTheme, isFullscreen } = useSelector((s) => s.editor);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
      <Select
        value={language}
        onChange={(e) => dispatch(setLanguage(e.target.value))}
        options={CODING_LANGUAGES.map((l) => ({ value: l.id, label: l.label }))}
        className="w-36"
      />
      <Select
        value={String(fontSize)}
        onChange={(e) => dispatch(setFontSize(Number(e.target.value)))}
        options={FONT_SIZES.map((s) => ({ value: String(s), label: `${s}px` }))}
        className="w-24"
      />
      <Select
        value={editorTheme}
        onChange={(e) => dispatch(setEditorTheme(e.target.value))}
        options={EDITOR_THEMES.map((t) => ({ value: t.id, label: t.label }))}
        className="w-32"
      />

      <div className="ml-auto flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={onCopy}>Copy</Button>
        <Button variant="ghost" size="sm" onClick={onReset}>Reset</Button>
        <Button variant="outline" size="sm" onClick={onSaveDraft} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save Draft'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => dispatch(toggleFullscreen())}>
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
        <Button variant="secondary" size="sm" onClick={onRun} disabled={isRunning}>
          {isRunning ? 'Running…' : 'Run'}
        </Button>
        <Button size="sm" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting…' : 'Submit'}
        </Button>
      </div>
    </div>
  );
}

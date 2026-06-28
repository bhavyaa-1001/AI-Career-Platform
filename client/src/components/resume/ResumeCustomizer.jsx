import { Button, Select } from '@/components/ui';
import { COLOR_PRESETS, FONTS, FONT_SIZES, PAGE_LAYOUTS, TEMPLATES } from '@/features/resume/constants';
import { getTemplateConfig } from '@/features/resume/templateRegistry';
import { cn } from '@/lib/utils';

export function TemplatePicker({ value, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {TEMPLATES.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              'group overflow-hidden rounded-lg border text-left transition-all',
              active ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/40',
            )}
          >
            <div
              className="flex h-16 items-end p-3"
              style={{ background: t.previewGradient }}
            >
              <div className="rounded bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-gray-800 shadow-sm">
                {t.label}
              </div>
            </div>
            <div className="space-y-0.5 p-3">
              <div className="text-sm font-medium">{t.label}</div>
              <div className="text-xs text-muted-foreground">{t.description}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{t.layout}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function ThemeCustomizer({ settings, templateId, onChange }) {
  const update = (key, val) => onChange({ ...settings, [key]: val });
  const config = getTemplateConfig(templateId);

  const applyPreset = (preset) => {
    onChange({ ...settings, primaryColor: preset.primary, accentColor: preset.accent });
  };

  const resetToTemplateDefaults = () => {
    onChange({ ...settings, ...config.defaultSettings });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Theme</label>
        <Button type="button" variant="ghost" size="sm" onClick={resetToTemplateDefaults}>
          Reset defaults
        </Button>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Page Layout</label>
        <Select
          value={settings.pageLayout || config.defaultSettings.pageLayout}
          onChange={(e) => update('pageLayout', e.target.value)}
          options={PAGE_LAYOUTS.map((l) => ({ value: l.id, label: l.label }))}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Template default: {config.defaultSettings.pageLayout}. Stored with your resume.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Font</label>
        <Select
          value={settings.fontFamily}
          onChange={(e) => update('fontFamily', e.target.value)}
          options={FONTS.map((f) => ({ value: f, label: f }))}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Font Size</label>
        <div className="flex flex-wrap gap-2">
          {FONT_SIZES.map((s) => (
            <Button
              key={s.id}
              type="button"
              size="sm"
              variant={settings.fontSize === s.id ? 'default' : 'outline'}
              onClick={() => update('fontSize', s.id)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Color Presets</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              className="h-8 w-8 rounded-full border-2 border-border transition-transform hover:scale-110"
              style={{ background: p.primary }}
              title={p.id}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Primary Color</label>
          <input
            type="color"
            value={settings.primaryColor}
            onChange={(e) => update('primaryColor', e.target.value)}
            className="h-9 w-full cursor-pointer rounded border border-border"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Accent Color</label>
          <input
            type="color"
            value={settings.accentColor}
            onChange={(e) => update('accentColor', e.target.value)}
            className="h-9 w-full cursor-pointer rounded border border-border"
          />
        </div>
      </div>
    </div>
  );
}

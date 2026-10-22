'use client';
import { useEffect } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { FONT_FAMILIES } from '@/lib/rich-text-keys';

// Tamaño de letra como atributo del mismo estilo de texto que usan color y tipografía
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (el: HTMLElement) => el.style.fontSize || null,
        renderHTML: (attrs: { fontSize?: string | null }) => (attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {}),
      },
    };
  },
});

const SIZES = ['14px', '16px', '18px', '20px', '24px', '28px', '32px', '40px', '48px', '60px'];
const COLORS = ['#082942', '#ffffff', '#1f2937', '#2563eb', '#0ea5e9', '#16a34a', '#84cc16', '#eab308', '#f97316', '#dc2626'];
const FAMILY_LABELS: Record<string, string> = { sans: 'Sans', serif: 'Serif', humanist: 'Humanista', mono: 'Monoespaciada' };

export default function RichTextField({ value, onChange, disabled }: {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ underline: false, heading: false, bulletList: false, orderedList: false, blockquote: false, codeBlock: false, code: false, horizontalRule: false }),
      Underline,
      FontSize,
      Color,
      FontFamily,
      TextAlign.configure({ types: ['paragraph'] }),
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: { class: 'rich-editor min-h-[90px] px-3 py-2 text-sm text-slate-100 outline-none' },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  useEffect(() => { editor?.setEditable(!disabled); }, [editor, disabled]);

  if (!editor) return <div className="h-24 rounded-lg border border-slate-700 bg-slate-800" />;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const btn = (active: boolean) =>
    `rounded px-2 py-1 text-xs transition ${active ? 'bg-green-700/40 text-green-200' : 'text-slate-300 hover:bg-slate-700'}`;

  const currentSize = (editor.getAttributes('textStyle').fontSize as string | undefined) ?? '';
  const currentFamily = (editor.getAttributes('textStyle').fontFamily as string | undefined) ?? '';
  const currentColor = (editor.getAttributes('textStyle').color as string | undefined) ?? '';

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-700 px-2 py-1.5">
      <button type="button" className={btn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></button>
      <button type="button" className={btn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
      <button type="button" className={btn(editor.isActive('underline'))} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></button>

      <span className="mx-1 h-4 w-px bg-slate-700" />

      {(['left', 'center', 'right'] as const).map((a) => (
        <button key={a} type="button" className={btn(editor.isActive({ textAlign: a }))}
          onClick={() => editor.chain().focus().setTextAlign(a).run()}>
          {a === 'left' ? '⇤' : a === 'center' ? '↔' : '⇥'}
        </button>
      ))}

      <span className="mx-1 h-4 w-px bg-slate-700" />

      <select aria-label="Tipografía" value={currentFamily}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) editor.chain().focus().unsetFontFamily().run();
          else editor.chain().focus().setFontFamily(FONT_FAMILIES[v]).run();
        }}
        className="rounded border border-slate-700 bg-slate-900 px-1.5 py-1 text-xs text-slate-200">
        <option value="">Tipografía</option>
        {Object.entries(FONT_FAMILIES).map(([k, css]) => (
          <option key={k} value={k} style={{ fontFamily: css }}>{FAMILY_LABELS[k]}</option>
        ))}
      </select>

      <select aria-label="Tamaño" value={currentSize}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) editor.chain().focus().setMark('textStyle', { fontSize: null }).run();
          else editor.chain().focus().setMark('textStyle', { fontSize: v }).run();
        }}
        className="rounded border border-slate-700 bg-slate-900 px-1.5 py-1 text-xs text-slate-200">
        <option value="">Tamaño</option>
        {SIZES.map((s) => <option key={s} value={s}>{s.replace('px', '')}</option>)}
      </select>

      <span className="mx-1 h-4 w-px bg-slate-700" />

      <div className="flex items-center gap-1" aria-label="Color">
        {COLORS.map((c) => (
          <button key={c} type="button" title={c} aria-label={`Color ${c}`}
            onClick={() => editor.chain().focus().setColor(c).run()}
            className={`h-4 w-4 rounded-full border ${currentColor.toLowerCase() === c ? 'border-white' : 'border-slate-600'}`}
            style={{ background: c }} />
        ))}
        <button type="button" className={btn(false)} title="Quitar color" onClick={() => editor.chain().focus().unsetColor().run()}>✕</button>
      </div>
    </div>
  );
}

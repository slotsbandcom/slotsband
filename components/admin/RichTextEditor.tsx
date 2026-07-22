"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import type { Editor } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import LinkExt from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Color from "@tiptap/extension-color"
import { TextStyle } from "@tiptap/extension-text-style"
import Highlight from "@tiptap/extension-highlight"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import { useEffect, useRef, useCallback } from "react"

// ── Toolbar primitives ────────────────────────────────────────────────────────

function TBtn({
  icon, active = false, onClick, title, text,
}: {
  icon?: string; active?: boolean; onClick: () => void; title: string; text?: string
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={[
        "flex items-center justify-center w-8 h-8 rounded-md text-sm transition-colors select-none flex-shrink-0",
        active
          ? "bg-[#2D1783] text-white"
          : "text-[#474554] hover:bg-[#EDE7F6] hover:text-[#2D1783]",
      ].join(" ")}
    >
      {icon
        ? <span className="material-symbols-outlined text-[18px] leading-none">{icon}</span>
        : <span className="font-bold text-[12px] leading-none">{text}</span>}
    </button>
  )
}

function TSep() {
  return <div className="w-px h-5 bg-[#E5E7EB] mx-1 flex-shrink-0" />
}

// ── Editor ────────────────────────────────────────────────────────────────────

export interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write detailed casino review...",
  minHeight = 400,
}: RichTextEditorProps) {
  // Track the last value we pushed into the editor so the sync effect doesn't
  // re-apply content that originated from the editor itself.
  const lastSetValue = useRef(value)

  const handleUpdate = useCallback(
    ({ editor }: { editor: Editor }) => {
      const html = editor.getHTML()
      lastSetValue.current = html
      onChange(html)
    },
    [onChange],
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      LinkExt.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: false }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    onUpdate: handleUpdate,
    editorProps: {
      attributes: {
        class: "tiptap-content outline-none",
        style: `min-height:${minHeight}px;padding:16px;`,
      },
    },
  })

  // Sync when the value changes externally (AI populate, initial data load, etc.)
  useEffect(() => {
    if (!editor || value === lastSetValue.current) return
    lastSetValue.current = value
    editor.commands.setContent(value || "")
  }, [value, editor])

  if (!editor) return null

  // ── Helpers ───────────────────────────────────────────────────────────────
  function addLink() {
    const prev = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("URL", prev ?? "https://")
    if (!url) return
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  // ── Counts ────────────────────────────────────────────────────────────────
  const words = (editor.storage.characterCount as { words?: () => number } | undefined)?.words?.() ?? 0
  const chars = (editor.storage.characterCount as { characters?: () => number } | undefined)?.characters?.() ?? 0

  return (
    <div className="rounded-lg border border-[#E5E7EB] overflow-hidden bg-white">

      {/* ── Toolbar ── */}
      <div className="bg-[#F9FAFB] border-b border-[#E5E7EB] px-2 py-1.5 flex flex-wrap items-center gap-0.5">

        {/* Headings */}
        <TBtn text="H1" active={editor.isActive("heading", { level: 1 })} title="Heading 1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
        <TBtn text="H2" active={editor.isActive("heading", { level: 2 })} title="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <TBtn text="H3" active={editor.isActive("heading", { level: 3 })} title="Heading 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />

        <TSep />

        {/* Inline formatting */}
        <TBtn icon="format_bold" active={editor.isActive("bold")} title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()} />
        <TBtn icon="format_italic" active={editor.isActive("italic")} title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()} />
        <TBtn icon="format_underlined" active={editor.isActive("underline")} title="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <TBtn icon="format_strikethrough" active={editor.isActive("strike")} title="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()} />

        <TSep />

        {/* Link */}
        <TBtn icon="link" active={editor.isActive("link")} title="Add link" onClick={addLink} />
        <TBtn icon="link_off" active={false} title="Remove link"
          onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()} />

        <TSep />

        {/* Blockquote */}
        <TBtn icon="format_quote" active={editor.isActive("blockquote")} title="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()} />

        <TSep />

        {/* Lists */}
        <TBtn icon="format_list_bulleted" active={editor.isActive("bulletList")} title="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <TBtn icon="format_list_numbered" active={editor.isActive("orderedList")} title="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()} />

        <TSep />

        {/* Alignment */}
        <TBtn icon="format_align_left" active={editor.isActive({ textAlign: "left" })} title="Align left"
          onClick={() => editor.chain().focus().setTextAlign("left").run()} />
        <TBtn icon="format_align_center" active={editor.isActive({ textAlign: "center" })} title="Align center"
          onClick={() => editor.chain().focus().setTextAlign("center").run()} />
        <TBtn icon="format_align_right" active={editor.isActive({ textAlign: "right" })} title="Align right"
          onClick={() => editor.chain().focus().setTextAlign("right").run()} />

        <TSep />

        {/* Table */}
        <TBtn icon="table_chart" active={editor.isActive("table")} title="Insert table"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />

        <TSep />

        {/* Highlight */}
        <TBtn icon="border_color" active={editor.isActive("highlight")} title="Highlight"
          onClick={() => editor.chain().focus().toggleHighlight().run()} />

        <TSep />

        {/* Undo / Redo */}
        <TBtn icon="undo" active={false} title="Undo"
          onClick={() => editor.chain().focus().undo().run()} />
        <TBtn icon="redo" active={false} title="Redo"
          onClick={() => editor.chain().focus().redo().run()} />
      </div>

      {/* ── Editor area ── */}
      <EditorContent editor={editor} />

      {/* ── Footer: counts ── */}
      <div className="bg-[#F9FAFB] border-t border-[#E5E7EB] px-3 py-1.5 flex justify-end gap-4 text-[10px] text-[#787585]">
        <span>{words} words</span>
        <span>{chars} characters</span>
      </div>
    </div>
  )
}

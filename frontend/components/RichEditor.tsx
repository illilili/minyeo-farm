"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiUploadImage } from "@/lib/api";

type Props = {
  label: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

type ToolbarButtonProps = {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
};

// Image extension with width attribute support
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return { style: `width: ${attributes.width}; display: block;` };
        },
        parseHTML: (element) => element.style.width || null,
      },
    };
  },
});

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`tiptap-toolbar-btn ${isActive ? "is-active" : ""}`}
    >
      {children}
    </button>
  );
}

export default function RichEditor({ label, value, onChange, placeholder }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      ResizableImage.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: placeholder ?? "내용을 입력하세요..." }),
    ],
    content: value,
    editorProps: {
      attributes: { class: "tiptap-content" },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  const uploadImages = useCallback(
    async (files: File[]) => {
      if (!editor || files.length === 0) return;
      setUploading(true);
      setError("");
      try {
        for (const file of files) {
          const { url } = await apiUploadImage("/api/admin/media/upload", file);
          editor.chain().focus().setImage({ src: url }).run();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "이미지 업로드에 실패했습니다.");
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  // 외부에서 value가 바뀌면 (다른 상품 선택 등) 에디터 내용 동기화
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  const isImageSelected = editor.isActive("image");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--farm-text)]">{label}</label>
      )}

      <div className="tiptap-editor">
        {/* 툴바 */}
        <div className="tiptap-toolbar">
          {/* 텍스트 스타일 */}
          <ToolbarButton title="굵게 (Ctrl+B)" onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")}>
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton title="기울임 (Ctrl+I)" onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")}>
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton title="밑줄 (Ctrl+U)" onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")}>
            <span style={{ textDecoration: "underline" }}>U</span>
          </ToolbarButton>

          <div className="tiptap-separator" />

          {/* 제목 */}
          <ToolbarButton title="제목 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })}>H1</ToolbarButton>
          <ToolbarButton title="제목 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })}>H2</ToolbarButton>
          <ToolbarButton title="제목 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })}>H3</ToolbarButton>

          <div className="tiptap-separator" />

          {/* 목록 */}
          <ToolbarButton title="글머리 목록" onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")}>≡</ToolbarButton>
          <ToolbarButton title="번호 목록" onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")}>1≡</ToolbarButton>
          <ToolbarButton title="인용구" onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")}>❝</ToolbarButton>

          <div className="tiptap-separator" />

          {/* 정렬 */}
          <ToolbarButton title="왼쪽 정렬" onClick={() => editor.chain().focus().setTextAlign("left").run()} isActive={editor.isActive({ textAlign: "left" })}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="4" width="20" height="2" rx="1"/><rect x="2" y="10" width="14" height="2" rx="1"/><rect x="2" y="16" width="18" height="2" rx="1"/></svg>
          </ToolbarButton>
          <ToolbarButton title="가운데 정렬" onClick={() => editor.chain().focus().setTextAlign("center").run()} isActive={editor.isActive({ textAlign: "center" })}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="4" width="20" height="2" rx="1"/><rect x="5" y="10" width="14" height="2" rx="1"/><rect x="3" y="16" width="18" height="2" rx="1"/></svg>
          </ToolbarButton>
          <ToolbarButton title="오른쪽 정렬" onClick={() => editor.chain().focus().setTextAlign("right").run()} isActive={editor.isActive({ textAlign: "right" })}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="4" width="20" height="2" rx="1"/><rect x="8" y="10" width="14" height="2" rx="1"/><rect x="4" y="16" width="18" height="2" rx="1"/></svg>
          </ToolbarButton>

          <div className="tiptap-separator" />

          {/* 이미지 */}
          <ToolbarButton title="이미지 삽입" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? "⏳" : "🖼"}
          </ToolbarButton>

          {/* 이미지 크기 (이미지 선택 시 강조) */}
          <ToolbarButton
            title="이미지 소형 (33%)"
            onClick={() => editor.chain().focus().updateAttributes("image", { width: "33%" }).run()}
            isActive={isImageSelected}
          >
            <span style={{ fontSize: "10px", fontWeight: 600 }}>S</span>
          </ToolbarButton>
          <ToolbarButton
            title="이미지 중형 (60%)"
            onClick={() => editor.chain().focus().updateAttributes("image", { width: "60%" }).run()}
            isActive={isImageSelected}
          >
            <span style={{ fontSize: "10px", fontWeight: 600 }}>M</span>
          </ToolbarButton>
          <ToolbarButton
            title="이미지 원본 (100%)"
            onClick={() => editor.chain().focus().updateAttributes("image", { width: "100%" }).run()}
            isActive={isImageSelected}
          >
            <span style={{ fontSize: "10px", fontWeight: 600 }}>L</span>
          </ToolbarButton>

          {/* 구분선 */}
          <ToolbarButton title="구분선" onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</ToolbarButton>

          <div className="tiptap-separator" />

          {/* 실행취소/다시실행 */}
          <ToolbarButton title="실행취소 (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>↩</ToolbarButton>
          <ToolbarButton title="다시실행 (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>↪</ToolbarButton>
        </div>

        {/* 에디터 본문 */}
        <EditorContent editor={editor} />
      </div>

      {isImageSelected && (
        <p className="text-xs text-[var(--farm-muted)]">이미지 선택됨 — S/M/L 버튼으로 크기를 조절하세요</p>
      )}

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          await uploadImages(files);
          e.target.value = "";
        }}
      />

      {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
    </div>
  );
}

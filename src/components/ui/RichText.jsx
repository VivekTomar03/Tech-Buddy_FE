/** Renders `inline code` spans inside plain text. */
export default function RichText({ text }) {
  return String(text || '')
    .split(/(`[^`]+`)/g)
    .map((part, i) =>
      part.length > 2 && part.startsWith('`') && part.endsWith('`') ? (
        <code key={i} className="rounded bg-surface-3 px-1 py-px text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      ) : (
        <span key={i}>{part}</span>
      )
    );
}

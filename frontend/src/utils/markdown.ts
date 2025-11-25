export function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// A small markdown -> HTML converter with safe escaping.
// Supports: code blocks (```), inline code (`), bold (** or __), italic (* or _), links [text](url), and line breaks.
export function markdownToHtml(md: string) {
  if (!md) return ''

  // Escape to avoid injecting raw HTML
  let s = escapeHtml(md)

  // Code block ```...```
  s = s.replace(/```([\s\S]*?)```/g, (_m, code) => {
    // keep code content escaped (already escaped) and preserve indentation
    return `<pre><code>${code}</code></pre>`
  })

  // Headings: ### Heading -> h3
  s = s.replace(/^###\s?(.*)$/gm, (_m, t) => `<h3>${t}</h3>`)

  // Inline code `code`
  s = s.replace(/`([^`]+)`/g, (_m, code) => `<code>${code}</code>`)

  // Bold **text** or __text__
  s = s.replace(/\*\*(.*?)\*\*/g, (_m, t) => `<strong>${t}</strong>`)
  s = s.replace(/__(.*?)__/g, (_m, t) => `<strong>${t}</strong>`)

  // Italic *text* or _text_
  // run after bold so it doesn't eat the inner ** markers
  s = s.replace(/\*(.*?)\*/g, (_m, t) => `<em>${t}</em>`)
  s = s.replace(/_(.*?)_/g, (_m, t) => `<em>${t}</em>`)

  // Links [text](https://...)
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_m, text, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
  })

  // Preserve line breaks
  s = s.replace(/\n/g, '<br/>')

  return s
}

export default markdownToHtml

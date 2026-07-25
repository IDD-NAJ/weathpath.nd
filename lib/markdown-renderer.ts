// Simple markdown and HTML renderer for rich content
export function renderMarkdownContent(content: string): string {
  let html = content

  // Escape HTML special characters (but preserve our markup)
  html = html
    .replace(/&(?!#?\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Process markdown links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')

  // Process bold: **text** or __text__
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>')

  // Process italic: _text_ or *text*
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // Process line breaks
  html = html.replace(/\n/g, '<br />')

  // Already has mark tags from the editor, just preserve them
  // (they're not escaped since we handle them specially)

  return html
}

export function renderMarkdownToPlainText(content: string): string {
  let text = content

  // Remove markdown links: [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')

  // Remove markdown bold
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1')
  text = text.replace(/__([^_]+)__/g, '$1')

  // Remove markdown italic
  text = text.replace(/_([^_]+)_/g, '$1')
  text = text.replace(/\*([^*]+)\*/g, '$1')

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, '')

  return text
}

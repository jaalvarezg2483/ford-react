import sanitizeHtml from 'sanitize-html'

const options: sanitizeHtml.IOptions = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    'dl', 'dt', 'dd', 'figure', 'figcaption', 'picture', 'img', 'iframe', 'video', 'source', 'sub', 'sup',
  ],
  allowedAttributes: {
    '*': ['class', 'id', 'title', 'role', 'aria-label', 'aria-hidden', 'aria-expanded', 'aria-controls', 'aria-current', 'aria-live', 'aria-atomic', 'aria-pressed', 'aria-selected'],
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'srcset', 'alt', 'width', 'height', 'loading'],
    iframe: ['src', 'width', 'height', 'title', 'allow', 'allowfullscreen', 'frameborder'],
    video: ['src', 'controls', 'poster', 'autoplay', 'muted', 'loop', 'playsinline', 'width', 'height'],
    source: ['src', 'srcset', 'type', 'media'],
  },
  allowedIframeHostnames: ['youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'player.vimeo.com'],
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: attribs.target === '_blank' ? { ...attribs, rel: 'noopener noreferrer' } : attribs,
    }),
  },
}

/** Cleans CMS HTML with an allowlist before it reaches dangerouslySetInnerHTML. */
export function sanitizeArticleHtml(html: string): string {
  return html ? sanitizeHtml(html, options) : ''
}

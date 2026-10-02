export type Inline = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  href?: string;
};

export type ArticleBlock
  = | { type: 'heading'; inlines: Inline[] }
    | { type: 'paragraph'; inlines: Inline[] }
    | { type: 'quote'; inlines: Inline[] }
    | { type: 'list-item'; inlines: Inline[] }
    | { type: 'image'; src: string; alt: string };

const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': '\'',
  '&apos;': '\'',
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&rdquo;': '”',
  '&ldquo;': '“',
  '&ndash;': '–',
  '&mdash;': '—',
  '&hellip;': '…',
};

function decode(text: string): string {
  return text.replace(/&[a-z]+;|&#39;/gi, m => ENTITIES[m.toLowerCase()] ?? m);
}

function attr(tag: string, name: string): string | null {
  const match = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i').exec(tag);
  return match ? decode(match[2] ?? match[3] ?? '') : null;
}

const HEADING = /^h[1-6]$/;

/**
 * Minimal HTML-to-blocks parser for tiptap output (h1-h6, p, blockquote, li,
 * strong/em, a, br, img). Unknown tags are dropped, their text kept. No
 * dependency on a DOM, so it runs under Hermes and Jest alike.
 */
export function parseArticleHtml(html: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];
  let current: { type: 'heading' | 'paragraph' | 'quote' | 'list-item'; inlines: Inline[] } | null = null;
  let quoteDepth = 0;
  let bold = 0;
  let italic = 0;
  const hrefs: string[] = [];

  const flush = () => {
    if (current) {
      const inlines = current.inlines;
      // Trim the block's outer whitespace.
      if (inlines.length > 0) {
        inlines[0] = { ...inlines[0], text: inlines[0].text.replace(/^\s+/, '') };
        const last = inlines.length - 1;
        inlines[last] = { ...inlines[last], text: inlines[last].text.replace(/\s+$/, '') };
      }
      if (inlines.some(i => i.text.length > 0))
        blocks.push(current);
      current = null;
    }
  };
  const open = (type: 'heading' | 'paragraph' | 'quote' | 'list-item') => {
    flush();
    current = { type, inlines: [] };
  };
  const push = (text: string) => {
    if (!text)
      return;
    if (!current)
      current = { type: quoteDepth > 0 ? 'quote' : 'paragraph', inlines: [] };
    const inline: Inline = { text };
    if (bold > 0)
      inline.bold = true;
    if (italic > 0)
      inline.italic = true;
    if (hrefs.length > 0)
      inline.href = hrefs[hrefs.length - 1];
    current.inlines.push(inline);
  };

  for (const token of html.split(/(<[^>]+>)/g)) {
    if (!token)
      continue;
    if (!token.startsWith('<')) {
      // Collapse source whitespace (newlines between tags) like a browser.
      const text = decode(token.replace(/\s+/g, ' '));
      if (current || text.trim().length > 0)
        push(text);
      continue;
    }
    const closing = token.startsWith('</');
    const name = (/^<\/?\s*([a-z0-9]+)/i.exec(token)?.[1] ?? '').toLowerCase();

    if (HEADING.test(name)) {
      closing ? flush() : open('heading');
    }
    else if (name === 'p') {
      closing ? flush() : open(quoteDepth > 0 ? 'quote' : 'paragraph');
    }
    else if (name === 'li') {
      closing ? flush() : open('list-item');
    }
    else if (name === 'blockquote') {
      flush();
      quoteDepth = Math.max(0, quoteDepth + (closing ? -1 : 1));
    }
    else if (name === 'strong' || name === 'b') {
      bold = Math.max(0, bold + (closing ? -1 : 1));
    }
    else if (name === 'em' || name === 'i') {
      italic = Math.max(0, italic + (closing ? -1 : 1));
    }
    else if (name === 'a') {
      if (closing)
        hrefs.pop();
      else
        hrefs.push(attr(token, 'href') ?? '');
      if (!closing && !hrefs[hrefs.length - 1])
        hrefs.pop();
    }
    else if (name === 'br') {
      push('\n');
    }
    else if (name === 'img' && !closing) {
      const src = attr(token, 'src');
      if (src) {
        flush();
        blocks.push({ type: 'image', src, alt: attr(token, 'alt') ?? '' });
      }
    }
  }
  flush();
  return blocks;
}

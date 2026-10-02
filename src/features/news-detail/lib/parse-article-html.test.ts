import { parseArticleHtml } from '@/features/news-detail/lib/parse-article-html';

describe('parseArticleHtml', () => {
  it('splits headings and paragraphs', () => {
    expect(parseArticleHtml('<h2>Big day</h2><p>First &amp; second.</p>')).toEqual([
      { type: 'heading', inlines: [{ text: 'Big day' }] },
      { type: 'paragraph', inlines: [{ text: 'First & second.' }] },
    ]);
  });

  it('keeps inline bold, italic and links', () => {
    const [block] = parseArticleHtml('<p>Hello <strong>bold</strong> <em>it</em> <a href="https://rionna.com">site</a>.</p>');
    expect(block.type).toBe('paragraph');
    expect((block as { inlines: unknown[] }).inlines).toEqual([
      { text: 'Hello ' },
      { text: 'bold', bold: true },
      { text: ' ' },
      { text: 'it', italic: true },
      { text: ' ' },
      { text: 'site', href: 'https://rionna.com' },
      { text: '.' },
    ]);
  });

  it('marks paragraphs inside a blockquote as quotes', () => {
    expect(parseArticleHtml('<blockquote><p>Run on.</p></blockquote><p>After.</p>')).toEqual([
      { type: 'quote', inlines: [{ text: 'Run on.' }] },
      { type: 'paragraph', inlines: [{ text: 'After.' }] },
    ]);
  });

  it('handles list items, images, br and bare text', () => {
    const blocks = parseArticleHtml('Intro<ul><li>One</li><li>Two</li></ul><p>a<br>b</p><img src="https://x/y.jpg" alt="Y">');
    expect(blocks.map(b => b.type)).toEqual(['paragraph', 'list-item', 'list-item', 'paragraph', 'image']);
    expect(blocks[4]).toEqual({ type: 'image', src: 'https://x/y.jpg', alt: 'Y' });
  });

  it('drops empty blocks and unknown tags but keeps their text', () => {
    expect(parseArticleHtml('<p> </p>\n<div><span>Kept</span></div>')).toEqual([
      { type: 'paragraph', inlines: [{ text: 'Kept' }] },
    ]);
  });
});

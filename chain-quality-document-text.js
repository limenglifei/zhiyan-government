(function () {
  'use strict';

  const maxTextChars = 120000;
  const maxLineChars = 4096;
  const maxLines = 6000;
  const maxHtmlChars = 4 * 1024 * 1024;
  const compoundSignature = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
  const skippedElements = new Set([
    'BASE', 'DEFS', 'DESC', 'EMBED', 'HEAD', 'IFRAME', 'LINK', 'META', 'METADATA', 'NOSCRIPT', 'OBJECT',
    'SCRIPT', 'STYLE', 'SYMBOL', 'TEMPLATE', 'TITLE'
  ]);
  const lineElements = new Set([
    'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'BR', 'CAPTION', 'DD', 'DIV', 'DL', 'DT', 'FIGCAPTION', 'FIGURE',
    'FOOTER', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HR', 'LI', 'MAIN', 'OL', 'P', 'PRE', 'SECTION',
    'TABLE', 'TBODY', 'TD', 'TEXT', 'TFOOT', 'TH', 'THEAD', 'TR', 'UL'
  ]);

  function boundedLines(text) {
    const lines = [];
    let available = maxTextChars;
    const source = text.slice(0, maxTextChars * 4);
    for (const raw of source.split(/[\r\n\v\f\u0007\u0085\u2028\u2029]+/)) {
      const line = raw.replace(/[\u0000-\u0008\u000e-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim();
      if (!line) continue;
      const bounded = line.slice(0, Math.min(maxLineChars, available)).replace(/[\ud800-\udbff]$/, '').trimEnd();
      if (bounded) lines.push(bounded);
      available -= bounded.length + 1;
      if (available < 1 || lines.length >= maxLines) break;
    }
    return lines;
  }

  function excluded(element) {
    return skippedElements.has(element.localName.toUpperCase()) || element.hasAttribute('hidden') ||
      element.getAttribute('aria-hidden') === 'true' || element.style?.display === 'none' ||
      element.style?.visibility === 'hidden' || element.style?.visibility === 'collapse';
  }

  function visibleHtmlText(markup) {
    // Template contents stay detached and inert, including resource URLs and scripts.
    const template = document.createElement('template');
    template.innerHTML = markup.slice(0, maxHtmlChars);
    const content = template.content;
    const pieces = [];
    let chars = 0;
    function append(value) {
      const part = value.slice(0, maxTextChars - chars);
      if (!part) return;
      pieces.push(part);
      chars += part.length;
    }
    function newline() {
      if (pieces.length && !pieces.at(-1).endsWith('\n')) append('\n');
    }
    let node = content.firstChild;
    while (node && chars < maxTextChars) {
      const skip = node.nodeType === Node.ELEMENT_NODE && excluded(node);
      if (node.nodeType === Node.TEXT_NODE) append(node.data.replace(/[\t\r\n\f ]+/g, ' '));
      if (!skip && lineElements.has(node.localName?.toUpperCase())) newline();
      if (!skip && node.firstChild) {
        node = node.firstChild;
        continue;
      }
      while (!node.nextSibling && node.parentNode !== content) {
        node = node.parentNode;
        if (lineElements.has(node.localName?.toUpperCase())) newline();
      }
      node = node.nextSibling;
    }
    return pieces.join('');
  }

  function readLegacyWord(buffer) {
    let worker;
    let timer;
    try {
      worker = new Worker('chain-quality-legacy-doc-worker.js');
    } catch {
      throw new Error('旧版 Word 读取组件无法启动。');
    }
    return new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('旧版 Word 读取超时，请另存为 DOCX 后重试。')), 20000);
      worker.onmessage = ({ data }) => {
        if (typeof data?.text === 'string') resolve(data.text);
        else reject(new Error(typeof data?.error === 'string' && data.error ? data.error : '无法读取旧版 Word 正文。'));
      };
      worker.onerror = (event) => {
        event.preventDefault();
        reject(new Error('旧版 Word 读取组件加载失败。'));
      };
      worker.onmessageerror = () => reject(new Error('无法读取旧版 Word 正文。'));
      try {
        worker.postMessage(buffer, [buffer]);
      } catch {
        reject(new Error('无法读取旧版 Word 正文。'));
      }
    }).finally(() => {
      clearTimeout(timer);
      worker.terminate();
    });
  }

  function wrappedHtml(text) {
    const prefix = text.slice(0, 4096).trimStart().replace(/^(?:<!--[\s\S]*?-->\s*|<\?xml\b[^>]*\?>\s*)*/i, '');
    return /^(?:<!doctype\s+html\b|<(?:html|head|body|main|section|article|div|h[1-6]|p|table|ul|ol)(?:\s|\/?>))/i.test(prefix);
  }

  function wrappedPlainText(text, buffer, mimeType) {
    const trimmed = text.trimStart();
    if (/^(?:\{\s*\\(?:u?rtf)\d|%PDF-|<)/i.test(trimmed) ||
      /[\u0000-\u0008\u000e-\u001f\u007f-\u009f\ufffd]/.test(text) || !/\p{L}/u.test(trimmed.slice(0, 4096))) return false;
    const bytes = new Uint8Array(buffer, 0, Math.min(2, buffer.byteLength));
    const utf16 = (bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0xfe && bytes[1] === 0xff);
    if (utf16 || /^text\/plain(?:;|$)/i.test(mimeType)) return true;
    try {
      new TextDecoder('utf-8', { fatal: true }).decode(buffer);
      return true;
    } catch {
      return false;
    }
  }

  async function readLines(file, type) {
    const extension = String(type || '').toLowerCase();
    const format = extension === 'htm' ? 'html' : extension;
    if (!['docx', 'doc', 'html', 'txt'].includes(format)) throw new Error('该文档格式暂无法读取。');
    let buffer;
    try {
      buffer = await file.arrayBuffer();
    } catch {
      throw new Error('无法读取该文档。');
    }
    if (!buffer.byteLength) return [];
    if (format === 'doc') {
      const prefix = new Uint8Array(buffer, 0, Math.min(compoundSignature.length, buffer.byteLength));
      if (compoundSignature.every((byte, index) => prefix[index] === byte)) {
        return boundedLines(await readLegacyWord(buffer));
      }
    }
    const reader = window.zhiyanRiskData?.documentText;
    if (!reader) throw new Error('文档读取组件未加载，请刷新后重试。');
    if (format === 'docx') {
      try {
        return boundedLines(await reader.readDocx(buffer));
      } catch (error) {
        throw new Error(/\p{Script=Han}/u.test(error?.message || '') ? error.message : '无法读取 DOCX 正文。');
      }
    }
    let text;
    try {
      text = reader.decode(buffer);
    } catch {
      throw new Error(format === 'doc' ? '无法识别旧版 Word 格式，请另存为 DOCX 后重试。' :
        '无法读取文档文本编码，请另存为 UTF-8 后重试。');
    }
    if (format === 'html' || (format === 'doc' && wrappedHtml(text))) {
      try {
        return boundedLines(visibleHtmlText(text));
      } catch {
        throw new Error('无法读取 HTML 正文。');
      }
    }
    if (format === 'doc' && !wrappedPlainText(text, buffer, file.type)) {
      throw new Error('无法识别旧版 Word 格式，请另存为 DOCX 后重试。');
    }
    return boundedLines(text);
  }

  window.zhiyanChainQualityDocument = { readLines };
})();

'use strict';

importScripts('./chain-quality-legacy-doc-vendor.js');

const maxBytes = 50 * 1024 * 1024;
const maxTextLength = 120000;
const compoundSignature = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const unreadable = '无法读取该 DOC 正文，请另存为 DOCX、PDF 或 TXT 后重试。';

self.onmessage = ({ data }) => {
  if (!(data instanceof ArrayBuffer) || data.byteLength < 512 || data.byteLength > maxBytes) {
    self.postMessage({ error: unreadable });
    return;
  }

  const header = new Uint8Array(data, 0, compoundSignature.length);
  if (!compoundSignature.every((byte, index) => header[index] === byte)) {
    self.postMessage({ error: unreadable });
    return;
  }

  try {
    const document = self.docToText.sections(data);
    const body = [document?.body, document?.textboxes].filter(Boolean).join('\n');
    const text = body.trim().slice(0, maxTextLength).replace(/\u0000/g, '').trim();
    self.postMessage(text ? { text } : { error: unreadable });
  } catch {
    self.postMessage({ error: unreadable });
  }
};

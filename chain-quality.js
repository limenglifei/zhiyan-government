(function () {
  'use strict';

  const stages = { up: '上游', mid: '中游', down: '下游', service: '配套服务' };
  const dimensions = [
    ['add', '新增子节点'], ['delete', '删除子节点'], ['revise', '修正子节点属性'],
    ['advantage', '优势环节描述修正'], ['weak', '薄弱环节描述修正'], ['enterprise', '链主及重点企业修正'],
    ['structure', '产业链结构描述修正'], ['source', '数据来源依据修正']
  ];
  const qualityModel = '星火 X2.6';
  const storageKey = 'zhiyan-government-quality-graphs-v1';
  const pdfBase = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/';
  const ocrBase = 'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/';
  const maxFileSize = 20 * 1024 * 1024;
  const savedFields = ['title', 'sub', 'nodes', 'weak', 'advantage', 'advantageSegments', 'advantageLinks', 'lead', 'linkedCompanies', 'updatedAt', 'description', 'regionScope', 'structure', 'graphNodes', 'networkSupplement', 'graphSourceNote', 'graphSources'];
  const byId = (id) => document.getElementById(id);
  const canonical = (name) => String(name || '').normalize('NFKC').toLowerCase().replace(/[\s·,，。]+/g, '');
  const nodeStage = (node) => (node.nodeType || node.type) === '配套服务' ? 'service' : node.stage;
  const isNodeName = (name) => Boolean(name) && !/^(?:待补充|待测算|暂无|无|未知|[.…-]+)$/.test(name);
  const isEditableName = (name) => name.length <= 40 && !/[<>＜＞\u0000-\u001f]/.test(name);
  const trimDiagramText = (name) => name.trim().replace(/(?<=\p{Script=Han})\s+(?=\p{Script=Han})/gu, '');
  const nodeKey = (node) => `${nodeStage(node)}:${canonical(node.name)}`;
  const attachmentType = (file) => /\.pdf$/i.test(file.name) ? 'pdf' : /\.(png|jpe?g|webp)$/i.test(file.name) ? 'image' : '';
  const emptyReferences = () => ({ up: [], mid: [], down: [], service: [] });
  const parentLabel = (stage) => stage === 'service' ? '下游 · 配套服务' : (Object.hasOwn(stages, stage) ? stages[stage] : '未指定环节');
  const nodeType = (node) => node.nodeType || node.type || '一般节点';
  const nodeStrength = (node) => node.strength || '普通';

  function nodeChanges(current, proposed) {
    return [
      ['子节点名称', current?.name, proposed.name],
      ['节点类型', current && nodeType(current), proposed.nodeType],
      ['节点强弱', current && nodeStrength(current), proposed.strength]
    ].map(([label, currentValue, suggestion]) => ({ label, current: currentValue, suggestion }));
  }

  function addition(stage, name, basis, attributes) {
    const type = stage === 'service' ? '配套服务' : attributes?.nodeType || '一般节点';
    const strength = attributes?.strength || '普通';
    return {
      kind: 'add', action: 'add', stage, name, nodeType: type, strength, basis,
      title: name ? `新增建议 · ${name}` : `补充${parentLabel(stage)}节点`,
      detail: name ? '参照图谱列出了该节点。确认适用后可加入当前骨架，分类和强弱可在画布内调整。' :
        '当前骨架缺少这一环节的有效节点，可按产业范围在画布内补录。',
      label: name ? '加入画布' : '进入新增',
      changes: [...nodeChanges(null, { name: name || '在画布填写', nodeType: type, strength }),
        { label: '挂靠父级', suggestion: parentLabel(stage) }]
    };
  }

  function reviewGraph(nodes, references, annotations, evidence, linkedCompanies) {
    const issues = [];
    const retained = new Map();
    const contains = (name, stage) => nodes.some((node) => nodeKey(node) === `${stage}:${canonical(name)}`);
    const hasLinks = (name) => linkedCompanies.some((company) => canonical(company?.node) === canonical(name));

    Object.keys(stages).forEach((stage) => {
      if (stage === 'service' || nodes.some((node) => nodeStage(node) === stage && isNodeName(node.name))) return;
      if (references[stage].length) return;
      issues.push(addition(stage, null, '骨架环节覆盖'));
    });

    nodes.forEach((node, index) => {
      const stage = nodeStage(node);
      const name = node.name;
      const key = nodeKey(node);
      const first = retained.get(key);
      if (!isNodeName(name) || !isEditableName(name) || !Object.hasOwn(stages, stage)) {
        const proposed = { name: '核实并填写规范名称', nodeType: nodeType(node), strength: nodeStrength(node) };
        issues.push({ kind: 'revise', action: 'edit', index, stage, title: `核对「${name || '未命名节点'}」`,
          detail: '节点名称或所属环节需要补充，可在画布中修正属性。', basis: '节点字段检查', label: '编辑节点', changes: nodeChanges(node, proposed) });
        return;
      }
      if (first) {
        const sameType = nodeType(first) === nodeType(node);
        const sameStrength = nodeStrength(first) === nodeStrength(node);
        const removable = sameType && sameStrength && (first.name === name || !hasLinks(name));
        issues.push({ kind: 'delete', action: removable ? 'delete' : 'review', index, stage, title: `删除建议 · ${name}`,
          detail: removable ? `同一环节已有「${first.name}」，可移除重复项。` : '同名节点的类型、强弱或关联企业有所不同，需核对后再处理。',
          basis: '同环节同名检查', label: removable ? '移除重复项' : '定位节点',
          changes: [{ label: '子节点名称', current: name, suggestion: removable ? '删除重复子节点' : '核实后决定是否删除' }] });
        return;
      }
      retained.set(key, node);

      const matchingName = references[stage].find((value) => canonical(value) === canonical(name));
      const attributes = annotations.get(key);
      const proposed = { name: matchingName || name, nodeType: attributes?.nodeType || nodeType(node), strength: attributes?.strength || nodeStrength(node) };
      const nameChanged = proposed.name !== name;
      const attributesChanged = proposed.nodeType !== nodeType(node) || proposed.strength !== nodeStrength(node);
      if (nameChanged || attributesChanged) {
        const linked = nameChanged && hasLinks(name);
        issues.push({ kind: 'revise', action: linked ? 'review' : 'correct', index, stage, proposed, basis: evidence,
          title: `属性修正建议 · ${name}`, detail: linked ? '规范名称有差异，请一并核对企业挂靠。' :
            '对照同一环节的图谱节点，可统一名称或采用图谱中明确标注的类型和强弱。',
          label: linked ? '定位节点' : (attributesChanged ? '应用属性修正' : '应用名称修正'), changes: nodeChanges(node, proposed) });
        return;
      }
      const parts = [...new Set(name.split(/[、/／]|与|及|和/).map((part) => part.trim()).filter(Boolean))];
      if (parts.length < 2 || parts.length > 5 || parts.some((part) => part.length < 2 || !isNodeName(part) || !isEditableName(part))) return;
      const confirmedParts = parts.every((part) => references[stage].some((value) => canonical(value) === canonical(part)));
      const linked = hasLinks(name);
      const splitProposal = { name: parts.join('、'), nodeType: nodeType(node), strength: nodeStrength(node) };
      issues.push({ kind: 'revise', action: linked ? 'review' : 'split', index, stage, parts, title: `拆解建议 · ${name}`,
        detail: linked ? '当前节点有关联企业，拆解前请核对企业挂靠。' : '拆解后沿用原环节和节点属性，已有同名节点会保留。',
        basis: confirmedParts ? evidence : '节点名称粒度检查', label: linked ? '定位节点' : '拆解为独立节点',
        changes: nodeChanges(node, splitProposal) });
    });

    Object.entries(references).forEach(([stage, names]) => {
      names.forEach((name) => {
        if (contains(name, stage)) return;
        const existing = nodes.findIndex((node) => canonical(node.name) === canonical(name));
        if (existing >= 0) {
          const node = nodes[existing];
          const proposed = { name, nodeType: nodeType(node), strength: nodeStrength(node) };
          issues.push({ kind: 'revise', action: 'edit', index: existing, stage, title: `环节差异 · ${name}`,
            detail: '参照与当前骨架的挂靠环节不同，可核对产业划分后编辑节点。', basis: evidence, label: '编辑节点',
            changes: [...nodeChanges(node, proposed), { label: '挂靠父级', current: parentLabel(nodeStage(node)), suggestion: parentLabel(stage) }] });
          return;
        }
        issues.push(addition(stage, name, evidence, annotations.get(`${stage}:${canonical(name)}`)));
      });
    });

    return issues;
  }

  function recognitionLines(blocks) {
    return (blocks || []).flatMap((block) => (block.paragraphs || []).flatMap((paragraph) => paragraph.lines || []))
      .filter((line) => line.text.trim())
      .map(({ text, bbox, confidence }) => ({ text: text.trim(), confidence, x: (bbox.x0 + bbox.x1) / 2, y: (bbox.y0 + bbox.y1) / 2 }));
  }

  function suggestReferenceNodes(lines, annotations) {
    const result = emptyReferences();
    const headers = Object.keys(stages).map((key) => {
      const heading = lines.find((line) => canonical(line.text) === stages[key]);
      return heading && { ...heading, key };
    }).filter(Boolean);
    if (headers.length < 3) return result;
    const spread = (axis) => Math.max(...headers.map((item) => item[axis])) - Math.min(...headers.map((item) => item[axis]));
    const axis = spread('x') > spread('y') ? 'x' : 'y';
    if (spread(axis) < 30) return result;
    const ordered = headers.sort((a, b) => a[axis] - b[axis]);
    lines.forEach((line) => {
      const text = trimDiagramText(line.text);
      const attributeLabel = text.match(/[（(](?:(核心节点|一般节点|配套服务)(?:[、，,·/]\s*(强|弱|普通))?|(强|弱|普通))[）)]$/);
      const name = (attributeLabel ? text.slice(0, attributeLabel.index) : text).trim();
      if (name.length < 2 || name.length > 30 || !/[\p{L}]/u.test(name) || !isNodeName(name) || !isEditableName(name)) return;
      if (line.confidence < 55 || /[|\[\]]|图表|^图\s*\d|产业链|资料来源|证券研究所|^来源|^[a-z\s]{1,3}$/.test(name) || Object.values(stages).includes(canonical(name))) return;
      if (axis === 'x' && line.y <= Math.min(...headers.map((item) => item.y))) return;
      const header = ordered.reduce((nearest, item) => Math.abs(item[axis] - line[axis]) < Math.abs(nearest[axis] - line[axis]) ? item : nearest);
      const stage = attributeLabel?.[1] === '配套服务' ? 'service' : header.key;
      if (!result[stage].some((item) => canonical(item) === canonical(name))) result[stage].push(name);
      if (attributeLabel) annotations.set(`${stage}:${canonical(name)}`, {
        nodeType: stage === 'service' ? '配套服务' : attributeLabel[1],
        strength: attributeLabel[2] || attributeLabel[3]
      });
    });
    return result;
  }

  function waitFor(promise, milliseconds, message) {
    let timer;
    return Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(message)), milliseconds);
    })]).finally(() => clearTimeout(timer));
  }

  let ocrLibrary;
  function loadOcrLibrary() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (ocrLibrary) return ocrLibrary;
    const script = document.createElement('script');
    script.src = `${ocrBase}dist/tesseract.min.js`;
    ocrLibrary = waitFor(new Promise((resolve, reject) => {
      script.onload = () => resolve(window.Tesseract);
      script.onerror = () => reject(new Error('识别组件加载失败'));
      document.head.appendChild(script);
    }), 15000, '识别组件加载超时').catch((error) => {
      script.remove();
      ocrLibrary = null;
      throw error;
    });
    return ocrLibrary;
  }

  async function imageToCanvas(file) {
    const image = await createImageBitmap(file);
    try {
      const scale = Math.min(1.6, 2400 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d', { alpha: false });
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas;
    } finally {
      image.close();
    }
  }

  async function readImage(canvas, onProgress) {
    const engine = await loadOcrLibrary();
    let worker;
    let expired = false;
    const job = (async () => {
      worker = await engine.createWorker(['chi_sim', 'eng'], 1, {
        workerPath: `${ocrBase}dist/worker.min.js`,
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0',
        logger: (entry) => { if (!expired && entry.status === 'recognizing text') onProgress(Math.round(entry.progress * 100)); }
      });
      if (expired) {
        await worker.terminate();
        return [];
      }
      await worker.setParameters({ tessedit_pageseg_mode: engine.PSM.SPARSE_TEXT });
      const result = await worker.recognize(canvas, {}, { blocks: true, text: true });
      return recognitionLines(result.data.blocks);
    })();
    try {
      return await waitFor(job, 70000, '图谱文字识别超时');
    } finally {
      expired = true;
      if (worker) await worker.terminate();
    }
  }

  async function readPdf(file, pageNumber, onProgress) {
    const pdf = await waitFor(import(`${pdfBase}build/pdf.min.mjs`), 15000, 'PDF 组件加载超时');
    pdf.GlobalWorkerOptions.workerSrc = `${pdfBase}build/pdf.worker.min.mjs`;
    const task = pdf.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false });
    try {
      const doc = await waitFor(task.promise, 15000, 'PDF 文件读取超时');
      if (pageNumber > doc.numPages) throw new Error(`PDF 共 ${doc.numPages} 页，请修改页码`);
      const page = await doc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      const lines = content.items.filter((item) => item.str && item.str.trim()).map((item) => {
        const [x, y] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
        return { text: item.str.trim(), x: x + item.width / 2, y };
      });
      if (lines.length >= 6 && Object.values(stages).filter((stage) => lines.some((line) => canonical(line.text) === stage)).length >= 3) return lines;
      const scaled = page.getViewport({ scale: Math.min(2.2, 2400 / Math.max(viewport.width, viewport.height)) });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(scaled.width);
      canvas.height = Math.ceil(scaled.height);
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: scaled }).promise;
      try {
        return await readImage(canvas, onProgress);
      } catch (error) {
        if (!lines.length) throw error;
        return lines;
      }
    } finally {
      await task.destroy();
    }
  }

  function readSavedGraphs() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    } catch (_) {
      return {};
    }
  }

  function writeSavedGraph(key, value) {
    const graphs = readSavedGraphs();
    if (value) graphs[key] = value;
    else delete graphs[key];
    localStorage.setItem(storageKey, JSON.stringify(graphs));
  }

  function install() {
    const builder = byId('graphBuilderModal');
    const actions = builder?.querySelector('.graph-preview-actions-v63');
    if (!actions || byId('chainQualityButton') || typeof graphBuilderNodes === 'undefined') return;

    const rows = knowledgeBaseConfigs.chain.rows;
    const savedGraphs = readSavedGraphs();
    const rowKeys = new WeakMap();
    window.getChainGraphRecordId = (row) => rowKeys.get(row) || null;
    rows.slice().forEach((row) => {
      const key = `seed:${row.id || row.title}`;
      rowKeys.set(row, key);
      const snapshot = savedGraphs[key];
      if (snapshot?.deleted) {
        rows.splice(rows.indexOf(row), 1);
        knowledgeBaseConfigs.chain.count = String(Math.max(0, Number(knowledgeBaseConfigs.chain.count) - 1));
      } else if (Array.isArray(snapshot?.graphNodes)) Object.assign(row, snapshot);
    });
    Object.entries(savedGraphs).forEach(([key, snapshot]) => {
      if (!key.startsWith('local:') || !Array.isArray(snapshot?.graphNodes)) return;
      const row = { ...snapshot };
      rowKeys.set(row, key);
      rows.unshift(row);
      knowledgeBaseConfigs.chain.count = String(Number(knowledgeBaseConfigs.chain.count) + 1);
    });

    let activeRow;
    let reviewRow;
    let updatedByQuality = false;
    const pendingDescriptions = new Set();
    const reportChoices = new Map();
    const exampleChoices = new Map();
    const nodeIds = new WeakMap();
    let nodeId = 0;
    let attachment;
    let attachmentUrl;
    let recognitionRun = 0;
    let reading = false;
    let referencePage;
    let recognitionAttempted = false;
    let references = emptyReferences();
    const annotations = new Map();
    let currentReport;
    let resultsMode = 'report';
    const selectedDimensions = { report: '', examples: '' };
    let restoreFocus;

    actions.insertAdjacentHTML('afterbegin', '<button type="button" id="chainQualityButton" aria-haspopup="dialog">AI 质检</button>');
    const launch = byId('chainQualityButton');
    document.body.insertAdjacentHTML('beforeend', `
      <dialog class="cq-dialog" id="chainQualityDialog" aria-labelledby="chainQualityTitle">
        <header class="cq-head">
          <div><h2 id="chainQualityTitle">产业链骨架 AI 质检</h2><p id="chainQualityTarget"></p></div>
          <button type="button" class="cq-close" aria-label="关闭 AI 质检">×</button>
        </header>
        <div class="cq-body">
          <aside class="cq-input" aria-label="质检设置">
            <div class="cq-settings">
              <div class="cq-model"><span>AI 模型</span><strong class="cq-model-value" id="chainQualityModel">${qualityModel}</strong></div>
              <label class="cq-web"><span>联网搜索</span><input type="checkbox" role="switch" id="chainQualityWeb"></label>
            </div>
            <p class="cq-note">联网搜索为原型配置，当前使用本地规则与图谱识别质检。</p>
            <h3>标准产业链图谱 <small>选填</small></h3>
            <p>支持 PNG、JPG、WebP 和 PDF，单个文件不超过 20 MB。</p>
            <label class="cq-upload"><span>上传参照图谱</span><input type="file" id="chainQualityFile" accept=".png,.jpg,.jpeg,.webp,.pdf"></label>
            <p class="cq-feedback cq-error" id="chainQualityFileError" role="status"></p>
            <div class="cq-attachment" hidden>
              <div><a id="chainQualityAttachmentLink" target="_blank" rel="noopener noreferrer"></a><button type="button" id="chainQualityRemove" class="cq-link">移除</button></div>
              <label class="cq-page" hidden>PDF 页码 <input type="number" id="chainQualityPage" min="1" step="1" value="1" inputmode="numeric"></label>
              <button class="secondary" type="button" id="chainQualityRead">识别图谱文字</button>
            </div>
            <p class="cq-feedback" id="chainQualityReadStatus" role="status"></p>
            <details class="cq-raw" id="chainQualityRaw" hidden><summary>查看识别原文</summary><pre id="chainQualityRawText"></pre></details>
            <p class="cq-note">附件在浏览器内识别并自动用于图谱比对。</p>
          </aside>
          <section class="cq-results" aria-labelledby="chainQualityResultsTitle">
            <div class="cq-results-head"><div><h3 id="chainQualityResultsTitle">质检建议</h3><p id="chainQualitySummary" role="status"></p><p class="cq-run-config" id="chainQualityRunConfig" hidden></p></div><button class="primary" type="button" id="chainQualityRun">开始质检</button></div>
            <div class="cq-result-modes" id="chainQualityModes" role="group" aria-label="质检建议视图">
              <button type="button" data-cq-mode="report" aria-pressed="true">本次质检</button>
              <button type="button" data-cq-mode="examples" aria-pressed="false">示例建议</button>
            </div>
            <p class="cq-results-note" id="chainQualityExamplesNote" hidden>示例使用演示资料，操作仅影响示例状态。</p>
            <p class="cq-results-note cq-action-status" id="chainQualityActionStatus" role="status" hidden></p>
            <div class="cq-dimensions" id="chainQualityDimensions" role="group" aria-label="八类质检结果" hidden></div>
            <button type="button" class="cq-link cq-show-all" id="chainQualityShowAll" hidden>查看全部建议</button>
            <div class="cq-issues" id="chainQualityIssues"></div>
          </section>
        </div>
        <footer class="cq-foot"><p>画布修正需保存到产业链库后生效。</p><button class="primary" type="button" id="chainQualityApplyAll" disabled>全部修正</button></footer>
      </dialog>`);

    const dialog = byId('chainQualityDialog');
    const input = byId('chainQualityFile');
    const readButton = byId('chainQualityRead');
    const readStatus = byId('chainQualityReadStatus');
    const web = byId('chainQualityWeb');
    const runButton = byId('chainQualityRun');
    const summary = byId('chainQualitySummary');
    const runConfig = byId('chainQualityRunConfig');
    const issuesMount = byId('chainQualityIssues');
    const dimensionMount = byId('chainQualityDimensions');
    const showAll = byId('chainQualityShowAll');
    const modes = byId('chainQualityModes');
    const examplesNote = byId('chainQualityExamplesNote');
    const actionStatus = byId('chainQualityActionStatus');
    const applyAll = byId('chainQualityApplyAll');

    function invalidateReport(message) {
      if (!currentReport) return;
      currentReport = null;
      setActionStatus('');
      summary.textContent = message || '质检条件已变更，请重新运行。';
      runButton.textContent = '开始质检';
      renderResults();
    }

    function clearRecognition() {
      recognitionRun++;
      reading = false;
      referencePage = null;
      recognitionAttempted = false;
      references = emptyReferences();
      annotations.clear();
      byId('chainQualityRaw').hidden = true;
      byId('chainQualityRawText').textContent = '';
      readStatus.textContent = '';
      readButton.disabled = false;
      runButton.disabled = false;
    }

    function removeAttachment() {
      if (attachmentUrl) URL.revokeObjectURL(attachmentUrl);
      attachment = null;
      attachmentUrl = null;
      input.value = '';
      byId('chainQualityFileError').textContent = '';
      dialog.querySelector('.cq-attachment').hidden = true;
      byId('chainQualityAttachmentLink').removeAttribute('href');
      byId('chainQualityPage').value = '1';
      clearRecognition();
      invalidateReport();
    }

    function resetSession() {
      currentReport = null;
      updatedByQuality = false;
      pendingDescriptions.clear();
      reportChoices.clear();
      exampleChoices.clear();
      selectedDimensions.report = '';
      selectedDimensions.examples = '';
      resultsMode = 'report';
      setActionStatus('');
      removeAttachment();
      web.checked = false;
      summary.textContent = '检查环节覆盖、重复节点和拆解粒度。';
      runButton.textContent = '开始质检';
      renderResults();
    }

    function updateResults() {
      if (!window.zhiyanChainQualityMetadata) {
        summary.textContent = '质检规则暂未加载，请刷新后重试。';
        return;
      }
      const referenceCount = Object.values(references).flat().length;
      const evidence = attachment ? `参照图谱 · ${attachment.name}${referencePage ? ` · 第 ${referencePage} 页` : ''}` : '';
      const linkedCompanies = Array.isArray(activeRow?.linkedCompanies) ? activeRow.linkedCompanies : [];
      const results = reviewGraph(graphBuilderNodes, references, annotations, evidence, linkedCompanies).concat(
        window.zhiyanChainQualityMetadata.review({
          row: reviewRow, nodes: graphBuilderNodes, sourceNote: reviewRow?.graphSourceNote,
          attachmentName: attachment?.name, attachmentMatched: referenceCount > 0, linkedCompanies
        })
      );
      currentReport = { fingerprint: JSON.stringify(graphBuilderNodes), results, model: qualityModel, webEnabled: web.checked };
      summary.textContent = `已检查 ${graphBuilderNodes.length} 个画布节点${referenceCount ? `，自动比对 ${referenceCount} 个图谱节点` : '，基于当前画布与入库资料'}。按 8 类汇总，发现 ${results.length} 项建议。`;
      runConfig.textContent = `AI 模型 ${currentReport.model} · 联网搜索${currentReport.webEnabled ? '开启' : '关闭'}`;
      runConfig.hidden = false;
      runButton.textContent = '重新质检';
      renderResults();
    }

    function resultsForView() {
      return resultsMode === 'examples' ? window.zhiyanChainQualityExamples : currentReport?.results;
    }

    function decisionKey(issue) {
      if (issue.action === 'sync') return `description:${issue.kind}`;
      const node = graphBuilderNodes[issue.index];
      if (node && !nodeIds.has(node)) nodeIds.set(node, ++nodeId);
      return JSON.stringify([issue.kind, issue.id, issue.action, issue.stage, issue.title, issue.basis, nodeIds.get(node), issue.changes]);
    }

    function decisionFor(issue) {
      return resultsMode === 'examples' ? exampleChoices.get(issue) : reportChoices.get(decisionKey(issue));
    }

    function setActionStatus(message) {
      actionStatus.hidden = !message;
      actionStatus.textContent = message;
    }

    function renderResults() {
      const examples = resultsMode === 'examples';
      const results = resultsForView();
      const activeDimension = selectedDimensions[resultsMode];
      modes.querySelectorAll('[data-cq-mode]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.cqMode === resultsMode));
      });
      summary.hidden = examples;
      examplesNote.hidden = !examples;
      runConfig.hidden = examples || !currentReport;
      applyAll.disabled = !results?.some((issue) => !decisionFor(issue));
      if (!results) {
        issuesMount.replaceChildren();
        dimensionMount.hidden = true;
        showAll.hidden = true;
        return;
      }
      const groups = new Map(dimensions.map(([kind]) => [kind, []]));
      results.forEach((issue, index) => groups.get(issue.kind).push({ issue, index }));
      dimensionMount.replaceChildren(...dimensions.map(([kind, label]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.cqDimension = kind;
        button.setAttribute('aria-pressed', String(kind === activeDimension));
        const title = document.createElement('span');
        const count = document.createElement('b');
        title.textContent = label;
        count.textContent = groups.get(kind).length;
        button.append(title, count);
        return button;
      }));
      dimensionMount.hidden = false;
      showAll.hidden = !activeDimension;

      const visibleGroups = dimensions.filter(([kind]) => activeDimension ? kind === activeDimension : groups.get(kind).length);
      issuesMount.replaceChildren();
      if (!visibleGroups.length) issuesMount.append(emptyResult());
      visibleGroups.forEach(([kind, label]) => {
        const list = document.createElement('section');
        list.className = 'cq-result-group';
        const heading = document.createElement('h4');
        heading.textContent = label;
        list.append(heading);
        const items = groups.get(kind);
        if (!items.length) list.append(emptyResult());
        items.forEach(({ issue, index }) => list.append(renderIssue(issue, index)));
        issuesMount.append(list);
      });
    }

    function emptyResult() {
      const empty = document.createElement('p');
      empty.className = 'cq-empty';
      empty.textContent = '本次未发现需处理的建议。';
      return empty;
    }

    function renderIssue(issue, index) {
      const item = document.createElement('article');
      item.className = 'cq-issue';
      item.dataset.cqKind = issue.kind;
      item.innerHTML = `
        <div class="cq-issue-heading">
          <span class="cq-section-label">问题类型</span>
          <span class="cq-issue-kind"></span><span class="cq-issue-stage"></span>
        </div>
        <h5></h5>
        <table class="cq-comparison" aria-label="修改前后对照">
          <thead><tr><th scope="col">原先是什么</th><th scope="col">修改后是什么</th></tr></thead>
          <tbody></tbody>
        </table>
        <div class="cq-rationale" role="group" aria-label="修改理由和依据">
          <h6>修改理由和依据</h6>
          <dl>
            <div><dt>修改理由</dt><dd class="cq-reason"></dd></div>
            <div><dt>依据</dt><dd><span class="cq-basis"></span><span class="cq-review-state" hidden>待核验</span></dd></div>
          </dl>
        </div>`;
      item.querySelector('.cq-issue-kind').textContent = dimensions.find(([kind]) => kind === issue.kind)?.[1] || '';
      const stage = item.querySelector('.cq-issue-stage');
      stage.hidden = !issue.stage;
      stage.textContent = parentLabel(issue.stage);
      item.querySelector('h5').textContent = issue.title;
      const basis = String(issue.basis ?? '').trim();
      item.querySelector('.cq-reason').textContent = issue.detail || '待补充';
      item.querySelector('.cq-basis').textContent = basis || '未提供依据';
      item.querySelector('.cq-review-state').hidden = Boolean(basis)
        && issue.action !== 'review' && !['enterprise', 'source'].includes(issue.kind);

      const comparison = item.querySelector('.cq-comparison tbody');
      const changes = issue.changes?.length ? issue.changes : [{}];
      changes.forEach(({ label, current, suggestion }, fieldIndex) => {
        const row = document.createElement('tr');
        row.innerHTML = '<td><span class="cq-change-label"></span><p class="cq-before"></p></td><td><span class="cq-change-label"></span><p class="cq-after"></p></td>';
        row.querySelectorAll('.cq-change-label').forEach((field) => {
          field.hidden = !label;
          field.textContent = label || '';
        });
        const missingBefore = issue.kind === 'add' && fieldIndex === 0 ? '原先无此节点' : '—';
        const missingAfter = issue.kind === 'delete' ? '删除该节点' : '—';
        row.querySelector('.cq-before').textContent = current == null || current === '' ? missingBefore : current;
        row.querySelector('.cq-after').textContent = suggestion == null || suggestion === '' ? missingAfter : suggestion;
        comparison.append(row);
      });
      const footer = document.createElement('div');
      footer.className = 'cq-issue-action';
      function decisionButton(action, label, className) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.dataset.cqIssue = index;
        button.dataset.cqDecision = action;
        button.textContent = label;
        return button;
      }
      const decision = decisionFor(issue);
      if (decision) {
        const state = document.createElement('span');
        state.className = 'cq-decision-status';
        const confirmed = resultsMode === 'examples' ? '已采纳 · 示例' :
          (issue.action === 'sync' ? '已采纳 · 保存画布后生效' : '已采纳 · 待人工核验');
        state.textContent = decision === 'deferred' ? '不采纳' : confirmed;
        footer.append(state, decisionButton('reopen', '恢复处理', 'cq-link'));
      } else {
        const confirm = decisionButton('confirm', '采纳', 'primary cq-decision-confirm');
        if (issue.label) confirm.title = issue.label;
        footer.append(confirm, decisionButton('defer', '不采纳', 'secondary cq-decision-defer'));
      }
      item.append(footer);
      return item;
    }

    function locateNode(index) {
      dialog.close();
      const card = builder.querySelector(`[data-node-index="${index}"]`);
      if (!card) return;
      restoreFocus = null;
      card.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      card.querySelector('button')?.focus({ preventScroll: true });
    }

    function validateReport() {
      if (currentReport?.fingerprint !== JSON.stringify(graphBuilderNodes)) {
        invalidateReport('画布内容已变化，请重新质检后再处理建议。');
        runButton.focus();
        return false;
      }
      return true;
    }

    function openIssueEditor(issue) {
      if (issue.action === 'review') return locateNode(issue.index);
      if (issue.action === 'edit') {
        restoreFocus = null;
        dialog.close();
        window.openGraphNodeEditorV47(issue.index);
        byId('graphNodeNameV47').focus();
        return;
      }
      dialog.close();
      restoreFocus = null;
      window.openNewGraphNodeV63();
      byId('graphNodeStageV47').value = issue.stage;
      byId('graphNodeTypeV47').value = issue.nodeType;
      byId('graphNodeStrengthV116').value = issue.strength;
      byId('graphNodeNameV47').focus();
    }

    function canApplyToCanvas(issue) {
      return ['correct', 'split', 'delete'].includes(issue.action) || (issue.action === 'add' && Boolean(issue.name));
    }

    function mutateNode(issue) {
      if (issue.action === 'add') {
        if (graphBuilderNodes.some((node) => nodeKey(node) === `${issue.stage}:${canonical(issue.name)}`)) return false;
        graphBuilderNodes.push({ stage: issue.stage === 'service' ? 'down' : issue.stage, name: issue.name,
          type: issue.nodeType, nodeType: issue.nodeType, strength: issue.strength, source: '质检参照' });
      } else if (issue.action === 'correct') {
        const node = graphBuilderNodes[issue.index];
        Object.assign(node, issue.proposed, { type: issue.proposed.nodeType });
        node.source = '质检修正';
      } else if (issue.action === 'split') {
        const source = graphBuilderNodes[issue.index];
        const existing = new Set(graphBuilderNodes.filter((node, index) => index !== issue.index).map(nodeKey));
        const splits = issue.parts.filter((name) => !existing.has(`${issue.stage}:${canonical(name)}`))
          .map((name) => ({ name, stage: source.stage, type: nodeType(source), nodeType: nodeType(source), strength: nodeStrength(source), source: '质检拆解' }));
        graphBuilderNodes.splice(issue.index, 1, ...splits);
      } else if (issue.action === 'delete') {
        if (graphBuilderNodes.length <= 2) return false;
        graphBuilderNodes.splice(issue.index, 1);
      }
      return true;
    }

    function refreshCanvasReport() {
      updatedByQuality = true;
      window.renderGraphNodes();
      byId('graphPreviewStatus').textContent = '已应用质检建议 · 待保存';
      updateResults();
    }

    function chooseIssue(issue, index, action) {
      const isExample = resultsMode === 'examples';
      if (!isExample && !validateReport()) return;
      const choices = isExample ? exampleChoices : reportChoices;
      const key = isExample ? issue : decisionKey(issue);
      if (action === 'reopen') {
        choices.delete(key);
        if (!isExample && issue.action === 'sync') pendingDescriptions.delete(issue.kind);
      } else if (action === 'defer') {
        choices.set(key, 'deferred');
      } else if (!isExample && canApplyToCanvas(issue)) {
        if (mutateNode(issue)) {
          refreshCanvasReport();
          setActionStatus('已修正 · 保存画布后生效');
        } else setActionStatus('画布保存至少需要 2 个节点，请先补充节点。');
        runButton.focus({ preventScroll: true });
        return;
      } else if (!isExample && ['review', 'edit', 'add'].includes(issue.action)) {
        choices.set(key, 'confirmed');
        renderResults();
        openIssueEditor(issue);
        return;
      } else {
        choices.set(key, 'confirmed');
        if (!isExample && issue.action === 'sync') pendingDescriptions.add(issue.kind);
      }
      setActionStatus('');
      renderResults();
      issuesMount.querySelector(`[data-cq-issue="${index}"]`)?.focus({ preventScroll: true });
    }

    function chooseAll() {
      if (resultsMode === 'examples') {
        const pending = resultsForView().filter((issue) => !exampleChoices.has(issue));
        pending.forEach((issue) => exampleChoices.set(issue, 'confirmed'));
        renderResults();
        setActionStatus(`已采纳 ${pending.length} 条示例建议。`);
        return;
      }
      if (!validateReport()) return;
      const pending = currentReport.results
        .map((issue) => ({ issue, key: decisionKey(issue) }))
        .filter(({ key }) => !reportChoices.has(key));
      const canvas = pending.filter(({ issue }) => canApplyToCanvas(issue))
        .sort((a, b) => (b.issue.index ?? -1) - (a.issue.index ?? -1));
      let applied = 0;
      let toSave = 0;
      let toReview = 0;
      canvas.forEach(({ issue }) => { if (mutateNode(issue)) applied++; });
      pending.forEach(({ issue, key }) => {
        if (canApplyToCanvas(issue)) return;
        reportChoices.set(key, 'confirmed');
        if (issue.action === 'sync') {
          pendingDescriptions.add(issue.kind);
          toSave++;
        } else toReview++;
      });
      if (applied) refreshCanvasReport();
      else renderResults();
      const message = [
        applied ? `已修正 ${applied} 条画布建议 · 保存画布后生效` : '',
        toSave ? `${toSave} 条描述修正待保存` : '',
        toReview ? `${toReview} 条建议待人工核验` : '',
        applied < canvas.length ? '还有可在画布中核对的建议' : ''
      ].filter(Boolean).join('。');
      setActionStatus(message ? message + '。' : '');
      if (applyAll.disabled) runButton.focus({ preventScroll: true });
    }

    const previousOpen = window.openGraphBuilder;
    window.openGraphBuilder = function () {
      activeRow = null;
      reviewRow = null;
      resetSession();
      return previousOpen.apply(this, arguments);
    };

    const previousOpenBasic = window.openChainBasicV61;
    window.openChainBasicV61 = function (index) {
      activeRow = rows[index];
      reviewRow = activeRow && { ...activeRow };
      resetSession();
      return previousOpenBasic.apply(this, arguments);
    };

    const previousSave = window.saveGraphModel;
    window.saveGraphModel = function () {
      const beforeLength = rows.length;
      const name = byId('graphModelName').value.trim();
      const valid = name && graphBuilderNodes.length >= 2;
      const deferredDescriptionFields = ['advantage', 'weak', 'structure'].filter((kind) => reportChoices.get(`description:${kind}`) === 'deferred');
      const sourceDeferred = [...reportChoices].some(([key, choice]) => choice === 'deferred' && key.startsWith('["source",'));
      const result = previousSave.apply(this, arguments);
      if (!valid || builder.classList.contains('open')) return result;
      const row = activeRow || (rows.length > beforeLength ? rows[0] : null);
      const previousKey = row && rowKeys.get(row);
      if (!row || !Array.isArray(row.graphNodes) ||
        (!updatedByQuality && !pendingDescriptions.size && !deferredDescriptionFields.length && !sourceDeferred && !savedGraphs[previousKey])) return result;
      const key = previousKey || `local:${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
      rowKeys.set(row, key);
      row.structure = Object.keys(stages).map((stage) => row.graphNodes.filter((node) => nodeStage(node) === stage).map((node) => node.name).join('、') || '待补充').join(' → ');
      if (pendingDescriptions.size) {
        const corrected = window.zhiyanChainQualityMetadata.summarize(row.graphNodes);
        pendingDescriptions.forEach((kind) => { row[kind] = corrected[kind]; });
      }
      if (pendingDescriptions.has('advantage')) {
        ['advantageSegments', 'advantageLinks'].forEach((field) => {
          if (field in row) row[field] = Array.isArray(row[field])
            ? row.graphNodes.filter((node) => nodeStrength(node) === '强').map((node) => node.name) : row.advantage;
        });
      }
      if (reviewRow) {
        const deferredFields = sourceDeferred ? [...deferredDescriptionFields, 'graphSourceNote'] : deferredDescriptionFields;
        deferredFields.forEach((field) => {
          if (Object.hasOwn(reviewRow, field)) row[field] = reviewRow[field];
        });
      }
      const fields = key.startsWith('seed:') ? savedFields : [...savedFields, 'category', 'level', 'companies', 'rate', 'score'];
      savedGraphs[key] = Object.fromEntries(fields.map((field) => [field, row[field]]));
      try {
        writeSavedGraph(key, savedGraphs[key]);
      } catch (_) {
        toast('已保存到本次会话，浏览器无法保存质检修改');
      }
      updatedByQuality = false;
      pendingDescriptions.clear();
      return result;
    };

    const previousOpenCanvas = window.openChainCanvasFromBasicV61;
    window.openChainCanvasFromBasicV61 = function () {
      const sources = new Map((activeRow?.graphNodes || [])
        .filter((node) => ['质检参照', '质检拆解', '质检修正'].includes(node.source))
        .map((node) => [nodeKey(node), node.source]));
      const result = previousOpenCanvas.apply(this, arguments);
      if (sources.size) {
        graphBuilderNodes.forEach((node) => {
          if (sources.has(nodeKey(node))) node.source = sources.get(nodeKey(node));
        });
        window.renderGraphNodes();
      }
      return result;
    };

    const previousDelete = window.deleteChainGraphV47;
    window.deleteChainGraphV47 = function (index) {
      const row = rows[index];
      const key = row && rowKeys.get(row);
      const result = previousDelete.apply(this, arguments);
      if (key && savedGraphs[key] && !rows.includes(row)) {
        const snapshot = key.startsWith('seed:') ? { deleted: true } : null;
        savedGraphs[key] = snapshot;
        try { writeSavedGraph(key, snapshot); } catch (_) { /* Storage is unavailable. */ }
      }
      return result;
    };

    launch.addEventListener('click', () => {
      byId('chainQualityTarget').textContent = byId('graphModelName').value.trim() || '当前画布';
      if (currentReport && currentReport.fingerprint !== JSON.stringify(graphBuilderNodes)) invalidateReport('画布内容已变化，请重新质检。');
      restoreFocus = launch;
      dialog.showModal();
      runButton.focus();
    });
    dialog.querySelectorAll('.cq-close').forEach((button) => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('close', () => restoreFocus?.focus());
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    runButton.addEventListener('click', async () => {
      resultsMode = 'report';
      setActionStatus('');
      renderResults();
      if (attachment && !recognitionAttempted && !await recognizeAttachment()) return;
      updateResults();
    });
    issuesMount.addEventListener('click', (event) => {
      const button = event.target.closest('[data-cq-decision]');
      if (!button) return;
      const index = Number(button.dataset.cqIssue);
      const issue = resultsForView()?.[index];
      if (issue) chooseIssue(issue, index, button.dataset.cqDecision);
    });
    modes.addEventListener('click', (event) => {
      const button = event.target.closest('[data-cq-mode]');
      if (!button || button.dataset.cqMode === resultsMode) return;
      resultsMode = button.dataset.cqMode;
      setActionStatus('');
      renderResults();
    });
    dimensionMount.addEventListener('click', (event) => {
      const button = event.target.closest('[data-cq-dimension]');
      if (!button || !resultsForView()) return;
      const kind = button.dataset.cqDimension;
      selectedDimensions[resultsMode] = selectedDimensions[resultsMode] === kind ? '' : kind;
      renderResults();
      dimensionMount.querySelector(`[data-cq-dimension="${kind}"]`).focus({ preventScroll: true });
    });
    showAll.addEventListener('click', () => {
      if (!resultsForView()) return;
      const previous = selectedDimensions[resultsMode];
      selectedDimensions[resultsMode] = '';
      renderResults();
      dimensionMount.querySelector(`[data-cq-dimension="${previous}"]`)?.focus({ preventScroll: true });
    });
    applyAll.addEventListener('click', chooseAll);

    web.addEventListener('change', () => invalidateReport());
    byId('chainQualityRemove').addEventListener('click', removeAttachment);
    byId('chainQualityPage').addEventListener('change', () => {
      clearRecognition();
      invalidateReport();
    });
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      const type = attachmentType(file);
      const error = byId('chainQualityFileError');
      if (!type || file.size > maxFileSize || !file.size) {
        error.textContent = '请选择非空的 PNG、JPG、WebP 或 PDF 文件，大小不超过 20 MB。';
        input.value = '';
        return;
      }
      if (attachmentUrl) URL.revokeObjectURL(attachmentUrl);
      clearRecognition();
      invalidateReport();
      error.textContent = '';
      attachment = file;
      attachmentUrl = URL.createObjectURL(new Blob([file], { type: type === 'pdf' ? 'application/pdf' : `image/${/\.jpe?g$/i.test(file.name) ? 'jpeg' : file.name.split('.').pop().toLowerCase()}` }));
      const link = byId('chainQualityAttachmentLink');
      link.textContent = file.name;
      link.href = attachmentUrl;
      dialog.querySelector('.cq-attachment').hidden = false;
      dialog.querySelector('.cq-page').hidden = type !== 'pdf';
      byId('chainQualityPage').value = '1';
    });

    async function recognizeAttachment() {
      if (!attachment || reading) return false;
      const file = attachment;
      const type = attachmentType(file);
      const page = byId('chainQualityPage');
      const pageNumber = type === 'pdf' ? page.valueAsNumber : null;
      if (type === 'pdf' && (!Number.isInteger(pageNumber) || pageNumber < 1)) {
        readStatus.textContent = '请输入从 1 开始的 PDF 页码。';
        page.focus();
        return false;
      }
      clearRecognition();
      invalidateReport();
      const run = recognitionRun;
      reading = true;
      readButton.disabled = true;
      runButton.disabled = true;
      readStatus.textContent = '正在读取附件并加载识别组件…';
      const onProgress = (progress) => { if (run === recognitionRun) readStatus.textContent = `正在识别图谱文字 · ${progress}%`; };
      try {
        const lines = type === 'pdf' ? await readPdf(file, pageNumber, onProgress) : await readImage(await imageToCanvas(file), onProgress);
        if (run !== recognitionRun) return false;
        references = suggestReferenceNodes(lines, annotations);
        referencePage = pageNumber;
        byId('chainQualityRaw').hidden = !lines.length;
        byId('chainQualityRawText').textContent = lines.map((line) => line.text).join('\n');
        const count = Object.values(references).flat().length;
        readStatus.textContent = count ? `已识别 ${count} 个图谱节点，将自动参与质检比对。` :
          (lines.length ? '已提取文字，暂无法识别节点所属环节，将进行结构质检。' : '未识别到图谱文字，将进行结构质检。');
      } catch (error) {
        if (run === recognitionRun) readStatus.textContent = `${error.message.startsWith('PDF 共 ') ? error.message : '暂未识别出图谱文字'}。本次将进行结构质检。`;
      } finally {
        if (run === recognitionRun) {
          reading = false;
          recognitionAttempted = true;
          readButton.disabled = false;
          runButton.disabled = false;
        }
      }
      return run === recognitionRun;
    }
    readButton.addEventListener('click', recognizeAttachment);
    resetSession();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();

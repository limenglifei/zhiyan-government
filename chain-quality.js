(function () {
  'use strict';

  const stages = { up: '上游', mid: '中游', down: '下游', service: '配套服务' };
  const models = ['deepseek-v4-flash', 'deepseek-v4-pro', 'spark-x2.6'];
  const defaultModel = 'deepseek-v4-pro';
  const storageKey = 'zhiyan-government-quality-graphs-v1';
  const pdfBase = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/';
  const ocrBase = 'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/';
  const maxFileSize = 20 * 1024 * 1024;
  const savedFields = ['title', 'sub', 'nodes', 'weak', 'advantage', 'updatedAt', 'description', 'regionScope', 'structure', 'graphNodes', 'networkSupplement', 'graphSourceNote'];
  const byId = (id) => document.getElementById(id);
  const canonical = (name) => String(name || '').normalize('NFKC').toLowerCase().replace(/[\s·,，。]+/g, '');
  const nodeStage = (node) => (node.nodeType || node.type) === '配套服务' ? 'service' : node.stage;
  const isNodeName = (name) => Boolean(name) && !/^(?:待补充|待测算|暂无|无|未知|[.…-]+)$/.test(name);
  const isEditableName = (name) => name.length <= 40 && !/[<>＜＞\u0000-\u001f]/.test(name);
  const trimDiagramText = (name) => name.trim().replace(/(?<=\p{Script=Han})\s+(?=\p{Script=Han})/gu, '');
  const nodeKey = (node) => `${nodeStage(node)}:${canonical(node.name)}`;
  const attachmentType = (file) => /\.pdf$/i.test(file.name) ? 'pdf' : /\.(png|jpe?g|webp)$/i.test(file.name) ? 'image' : '';
  const emptyReferences = () => ({ up: [], mid: [], down: [], service: [] });

  function reviewGraph(nodes, references, evidence, linkedCompanies) {
    const issues = [];
    const retained = new Map();
    const contains = (name, stage) => nodes.some((node) => nodeKey(node) === `${stage}:${canonical(name)}`);
    const hasLinks = (name) => linkedCompanies.some((company) => company.node === name);

    Object.keys(stages).forEach((stage) => {
      if (stage === 'service' || nodes.some((node) => nodeStage(node) === stage && isNodeName(node.name))) return;
      if (references[stage].length) return;
      issues.push({ action: 'add', stage, title: `补充${stages[stage]}节点`, detail: '骨架中缺少这个环节的实际节点。请根据产业范围补录。', basis: '骨架环节覆盖', label: '进入新增' });
    });

    nodes.forEach((node, index) => {
      const stage = nodeStage(node);
      const name = node.name;
      const key = nodeKey(node);
      const first = retained.get(key);
      if (!isNodeName(name) || !stages[stage]) {
        issues.push({ action: 'review', index, stage, title: `核对「${name || '未命名节点'}」`, detail: '节点名称为空、仍为占位名称或没有有效环节。', basis: '节点字段检查', label: '定位节点' });
        return;
      }
      if (first) {
        const sameType = (first.nodeType || first.type) === (node.nodeType || node.type);
        const sameStrength = first.strength === node.strength;
        const removable = sameType && sameStrength && (first.name === name || !hasLinks(name));
        issues.push({ action: removable ? 'delete' : 'review', index, stage, title: `删除建议 · ${name}`, detail: removable ? `同一环节已有「${first.name}」，可移除重复项。` : '同名节点的类型、强弱或关联企业有所不同，需核对后再处理。', basis: '同环节同名检查', label: removable ? '移除重复项' : '定位节点' });
        return;
      }
      retained.set(key, node);

      const parts = [...new Set(name.split(/[、/／]|与|及|和/).map((part) => part.trim()).filter(Boolean))];
      if (parts.length < 2 || parts.length > 5 || parts.some((part) => part.length < 2 || !isNodeName(part) || !isEditableName(part))) return;
      const confirmedParts = parts.every((part) => references[stage].some((value) => canonical(value) === canonical(part)));
      const linked = hasLinks(name);
      issues.push({ action: linked ? 'review' : 'split', index, stage, parts, title: `拆解建议 · ${name}`, detail: `可拆为「${parts.join('」「')}」。${linked ? '当前节点有关联企业，请先核对企业挂靠。' : '拆解后沿用原环节，已有同名节点会保留。'}`, basis: confirmedParts ? evidence : '节点名称粒度检查', label: linked ? '定位节点' : '拆解为独立节点' });
    });

    Object.entries(references).forEach(([stage, names]) => {
      names.forEach((name) => {
        if (contains(name, stage)) return;
        const existing = nodes.findIndex((node) => canonical(node.name) === canonical(name));
        if (existing >= 0) {
          issues.push({ action: 'review', index: existing, stage, title: `环节差异 · ${name}`, detail: `参照归属${stages[stage]}，当前归属${stages[nodeStage(nodes[existing])] || '未指定环节'}，请核对产业划分口径。`, basis: evidence, label: '定位节点' });
          return;
        }
        issues.push({ action: 'add', stage, name, title: `新增建议 · ${name}`, detail: `参照在${stages[stage]}列出了该节点，当前骨架尚无同名节点。请核实是否适用于本产业链。`, basis: evidence, label: '加入画布' });
      });
    });

    return issues;
  }

  function recognitionLines(blocks) {
    return (blocks || []).flatMap((block) => (block.paragraphs || []).flatMap((paragraph) => paragraph.lines || []))
      .filter((line) => line.text.trim())
      .map(({ text, bbox, confidence }) => ({ text: text.trim(), confidence, x: (bbox.x0 + bbox.x1) / 2, y: (bbox.y0 + bbox.y1) / 2 }));
  }

  function suggestReferenceNodes(lines) {
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
      const name = trimDiagramText(line.text);
      if (name.length < 2 || name.length > 30 || !/[\p{L}]/u.test(name) || !isNodeName(name) || !isEditableName(name)) return;
      if (line.confidence < 55 || /[|\[\]]|图表|^图\s*\d|产业链|资料来源|证券研究所|^来源|^[a-z\s]{1,3}$/.test(name) || Object.values(stages).includes(canonical(name))) return;
      if (axis === 'x' && line.y <= Math.min(...headers.map((item) => item.y))) return;
      const header = ordered.reduce((nearest, item) => Math.abs(item[axis] - line[axis]) < Math.abs(nearest[axis] - line[axis]) ? item : nearest);
      if (!result[header.key].some((item) => canonical(item) === canonical(name))) result[header.key].push(name);
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
    let updatedByQuality = false;
    let attachment;
    let attachmentUrl;
    let recognitionRun = 0;
    let reading = false;
    let referencePage;
    let recognitionAttempted = false;
    let references = emptyReferences();
    let currentReport;
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
              <label class="cq-model"><span>AI 模型</span><select id="chainQualityModel" required>
                ${models.map((model) => `<option value="${model}"${model === defaultModel ? ' selected' : ''}>${model}</option>`).join('')}
              </select></label>
              <label class="cq-web"><span>联网搜索</span><input type="checkbox" role="switch" id="chainQualityWeb"></label>
            </div>
            <p class="cq-note">模型和联网搜索为原型配置，当前使用本地规则与图谱识别质检。</p>
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
            <div class="cq-issues" id="chainQualityIssues"></div>
          </section>
        </div>
        <footer class="cq-foot"><p>处理建议后，请在画布中保存到产业链库。</p><button class="secondary cq-close" type="button">返回画布</button></footer>
      </dialog>`);

    const dialog = byId('chainQualityDialog');
    const input = byId('chainQualityFile');
    const readButton = byId('chainQualityRead');
    const readStatus = byId('chainQualityReadStatus');
    const model = byId('chainQualityModel');
    const web = byId('chainQualityWeb');
    const runButton = byId('chainQualityRun');
    const summary = byId('chainQualitySummary');
    const runConfig = byId('chainQualityRunConfig');
    const issuesMount = byId('chainQualityIssues');

    function invalidateReport(message) {
      if (!currentReport) return;
      currentReport = null;
      issuesMount.replaceChildren();
      summary.textContent = message || '质检条件已变更，请重新运行。';
      runConfig.hidden = true;
      runButton.textContent = '开始质检';
    }

    function clearRecognition() {
      recognitionRun++;
      reading = false;
      referencePage = null;
      recognitionAttempted = false;
      references = emptyReferences();
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
      removeAttachment();
      model.value = defaultModel;
      web.checked = false;
      summary.textContent = '检查环节覆盖、重复节点和拆解粒度。';
      runConfig.hidden = true;
      issuesMount.replaceChildren();
      runButton.textContent = '开始质检';
    }

    function updateResults() {
      const referenceCount = Object.values(references).flat().length;
      const evidence = attachment ? `参照图谱 · ${attachment.name}${referencePage ? ` · 第 ${referencePage} 页` : ''}` : '';
      const results = reviewGraph(graphBuilderNodes, references, evidence, activeRow?.linkedCompanies || []);
      currentReport = { fingerprint: JSON.stringify(graphBuilderNodes), results, model: model.value, webEnabled: web.checked };
      summary.textContent = `已检查 ${graphBuilderNodes.length} 个画布节点${referenceCount ? `，自动比对 ${referenceCount} 个图谱节点` : '，仅进行结构质检'}。发现 ${results.length} 项建议。`;
      runConfig.textContent = `AI 模型 ${currentReport.model} · 联网搜索${currentReport.webEnabled ? '开启' : '关闭'}`;
      runConfig.hidden = false;
      runButton.textContent = '重新质检';
      issuesMount.replaceChildren();
      if (!results.length) {
        const empty = document.createElement('p');
        empty.className = 'cq-empty';
        empty.textContent = '本次已检查的规则未发现需要处理的问题。';
        issuesMount.appendChild(empty);
        return;
      }
      results.forEach((issue, index) => {
        const item = document.createElement('article');
        item.className = 'cq-issue';
        item.innerHTML = '<div><div class="cq-issue-heading"><span></span><h4></h4></div><p></p><small></small></div><button type="button" class="secondary"></button>';
        item.querySelector('.cq-issue-heading span').textContent = stages[issue.stage] || '骨架';
        item.querySelector('h4').textContent = issue.title;
        item.querySelector('p').textContent = issue.detail;
        item.querySelector('small').textContent = issue.basis;
        const button = item.querySelector('button');
        button.textContent = issue.label;
        button.dataset.cqIssue = index;
        issuesMount.appendChild(item);
      });
    }

    function locateNode(index) {
      dialog.close();
      const card = builder.querySelector(`[data-node-index="${index}"]`);
      if (!card) return;
      restoreFocus = null;
      card.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      card.querySelector('button')?.focus({ preventScroll: true });
    }

    function applyIssue(issue) {
      if (currentReport?.fingerprint !== JSON.stringify(graphBuilderNodes)) {
        invalidateReport('画布内容已变化，请重新质检后再处理建议。');
        runButton.focus();
        return;
      }
      if (issue.action === 'review') return locateNode(issue.index);
      if (issue.action === 'add' && !issue.name) {
        dialog.close();
        restoreFocus = null;
        window.openNewGraphNodeV63();
        byId('graphNodeStageV47').value = issue.stage;
        byId('graphNodeNameV47').focus();
        return;
      }
      if (issue.action === 'add') {
        const type = issue.stage === 'service' ? '配套服务' : '一般节点';
        graphBuilderNodes.push({ stage: issue.stage === 'service' ? 'down' : issue.stage, name: issue.name, type, nodeType: type, strength: '普通', source: '质检参照' });
      } else if (issue.action === 'split') {
        const source = graphBuilderNodes[issue.index];
        const existing = new Set(graphBuilderNodes.filter((node, index) => index !== issue.index).map(nodeKey));
        const splits = issue.parts.filter((name) => !existing.has(`${issue.stage}:${canonical(name)}`))
          .map((name) => ({ name, stage: source.stage, type: source.type, nodeType: source.nodeType, strength: '普通', source: '质检拆解' }));
        graphBuilderNodes.splice(issue.index, 1, ...splits);
      } else if (issue.action === 'delete') {
        if (graphBuilderNodes.length <= 2) {
          summary.textContent = '画布保存至少需要 2 个节点，请先补充其他节点再删除重复项。';
          return;
        }
        graphBuilderNodes.splice(issue.index, 1);
      }
      updatedByQuality = true;
      window.renderGraphNodes();
      byId('graphPreviewStatus').textContent = '已应用质检建议 · 待保存';
      updateResults();
      runButton.focus();
    }

    const previousOpen = window.openGraphBuilder;
    window.openGraphBuilder = function () {
      activeRow = null;
      resetSession();
      return previousOpen.apply(this, arguments);
    };

    const previousOpenBasic = window.openChainBasicV61;
    window.openChainBasicV61 = function (index) {
      activeRow = rows[index];
      resetSession();
      return previousOpenBasic.apply(this, arguments);
    };

    const previousSave = window.saveGraphModel;
    window.saveGraphModel = function () {
      const beforeLength = rows.length;
      const name = byId('graphModelName').value.trim();
      const valid = name && graphBuilderNodes.length >= 2;
      const result = previousSave.apply(this, arguments);
      if (!valid || builder.classList.contains('open')) return result;
      const row = activeRow || (rows.length > beforeLength ? rows[0] : null);
      const previousKey = row && rowKeys.get(row);
      if (!row || !Array.isArray(row.graphNodes) || (!updatedByQuality && !savedGraphs[previousKey])) return result;
      const key = previousKey || `local:${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
      rowKeys.set(row, key);
      row.structure = Object.keys(stages).map((stage) => row.graphNodes.filter((node) => nodeStage(node) === stage).map((node) => node.name).join('、') || '待补充').join(' → ');
      const fields = key.startsWith('seed:') ? savedFields : [...savedFields, 'category', 'level', 'companies', 'rate', 'score', 'lead'];
      savedGraphs[key] = Object.fromEntries(fields.map((field) => [field, row[field]]));
      try {
        writeSavedGraph(key, savedGraphs[key]);
      } catch (_) {
        toast('已保存到本次会话，浏览器无法保存质检修改');
      }
      updatedByQuality = false;
      return result;
    };

    const previousOpenCanvas = window.openChainCanvasFromBasicV61;
    window.openChainCanvasFromBasicV61 = function () {
      const sources = new Map((activeRow?.graphNodes || [])
        .filter((node) => node.source === '质检参照' || node.source === '质检拆解')
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
      if (attachment && !recognitionAttempted && !await recognizeAttachment()) return;
      updateResults();
    });
    issuesMount.addEventListener('click', (event) => {
      const button = event.target.closest('[data-cq-issue]');
      const issue = button && currentReport?.results[Number(button.dataset.cqIssue)];
      if (issue) applyIssue(issue);
    });

    [model, web].forEach((control) => control.addEventListener('change', () => invalidateReport()));
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
        references = suggestReferenceNodes(lines);
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

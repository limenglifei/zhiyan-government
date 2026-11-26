(function () {
  'use strict';

  const data = window.zhiyanRiskData;
  const model = window.zhiyanRiskModel;
  const main = document.querySelector('.main');
  const feedHeader = document.querySelector('#intelligenceFeed .if-heading');
  if (!data?.scenarios?.length || !model?.evaluate || !main || !feedHeader) return;

  const modes = [
    { id: 'policy', name: '政策附件分析', detail: '识别政策条款，映射受影响节点' },
    { id: 'single-metric', name: '单节点单指标', detail: '观察某项变化在链上的传导' },
    { id: 'multi-metric', name: '单节点多指标', detail: '对比同一节点的叠加和抵消' },
    { id: 'multi-node', name: '多节点多指标', detail: '评估不同节点冲击的共同作用' }
  ];
  const stages = ['上游', '中游', '下游'];
  const riskLabels = { none: '无显著风险', low: '低风险', medium: '中风险', high: '高风险' };
  const directionNames = { positive: '正向', negative: '负向', mixed: '双向', neutral: '中性', auto: '自动判断' };
  const impactAxes = [
    { key: 'cost', label: '成本', unit: '%' },
    { key: 'revenue', label: '营收', unit: '%' },
    { key: 'profit', label: '利润率', unit: 'pp' },
    { key: 'supply', label: '供给', unit: '%' },
    { key: 'demand', label: '需求', unit: '%' },
    { key: 'gap', label: '供需差', unit: 'pp' }
  ];
  const transmissionAxes = impactAxes.filter(axis => ['cost', 'revenue', 'supply', 'demand'].includes(axis.key));
  const inputsKey = 'zhiyan-intelligence-risk-scenarios-v1';
  const metrics = new Map(data.metrics.map(metric => [metric.id, metric]));
  const first = data.scenarios[0];
  const draft = {
    mode: 'single-metric', scenarioId: first.id, anchor: first.defaultAnchor || first.nodes[0].id,
    direction: 'both', margin: first.baseProfitMargin ?? 10, signals: [],
    policy: { text: '', source: '', direction: 'auto', intensity: 0.7, coverage: 0.6, analysis: null, stale: true }
  };
  let page = 'analysis';
  let result = null;
  let resultScenario = null;
  let selectedNode = '';
  let dirty = false;
  let catalogQuery = '';
  let catalogLevel = '';
  let catalogNode = '';
  let fileRequest = 0;
  let fileReading = false;
  let fileFeedback = '';
  let saved = readSaved();

  const entry = document.createElement('button');
  entry.type = 'button';
  entry.className = 'if-button ir-feed-entry';
  entry.setAttribute('data-ir-open', '');
  entry.textContent = '产业节点风险传导与预警';
  const headActions = document.createElement('div');
  headActions.className = 'ir-feed-actions';
  const create = feedHeader.querySelector('[data-if-action="create"]');
  feedHeader.append(headActions);
  headActions.append(entry);
  if (create) headActions.append(create);

  const root = document.createElement('section');
  root.id = 'intelligenceRisk';
  root.className = 'content view';
  root.setAttribute('aria-labelledby', 'irTitle');
  root.innerHTML = `
    <header class="ir-heading">
      <div><button class="ir-link ir-back" type="button" data-ir-action="back">‹ 返回情报订阅</button>
        <h1 id="irTitle">产业节点风险传导与预警</h1><p>把政策与经营波动映射到产业节点，查看逐级传导、供需缺口与预警。</p></div>
      <span class="ir-model-tag">示例产业链 · 场景估算</span>
    </header>
    <nav class="ir-tabs" aria-label="风险工作台视图">
      <button type="button" data-ir-tab="analysis" aria-pressed="true">分析工作台</button>
      <button type="button" data-ir-tab="catalog" aria-pressed="false">指标与口径</button>
      <button type="button" data-ir-tab="saved" aria-pressed="false">已保存场景</button>
    </nav>
    <p class="ir-feedback" data-ir-feedback role="status" hidden></p>
    <div class="ir-workspace" data-ir-workspace></div>`;
  main.append(root);
  const work = root.querySelector('[data-ir-workspace]');
  const feedback = root.querySelector('[data-ir-feedback]');

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }

  function scene(id = draft.scenarioId) {
    return data.scenarios.find(item => item.id === id) || first;
  }

  function nodeLabel(id, scenario = scene()) {
    return scenario.nodes.find(node => node.id === id)?.label || id;
  }

  function stageLabel(stage) {
    return ({ up: '上游', upstream: '上游', mid: '中游', midstream: '中游', down: '下游', downstream: '下游' })[stage] || stage;
  }

  function modeLabel(mode) {
    return modes.find(item => item.id === mode)?.name || mode;
  }

  function showFeedback(message, error = false) {
    feedback.textContent = message;
    feedback.hidden = !message;
    feedback.dataset.error = String(error);
  }

  function navigate(id) {
    if (typeof window.show === 'function') window.show(id);
    else document.querySelectorAll('.view').forEach(view => view.classList.toggle('show', view.id === id));
    if (id === root.id) {
      document.querySelector('.nav[data-view="intelligenceFeed"]')?.classList.add('active');
      root.querySelector('#irTitle').setAttribute('tabindex', '-1');
      root.querySelector('#irTitle').focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0 });
  }

  function options(entries, value) {
    return entries.map(([id, label]) => `<option value="${esc(id)}"${id === value ? ' selected' : ''}>${esc(label)}</option>`).join('');
  }

  function sceneOptions() {
    return options(data.scenarios.map(scenario => [scenario.id, scenario.label]), draft.scenarioId);
  }

  function nodeOptions(value, nodes = scene().nodes) {
    return stages.map(stage => {
      const group = nodes.filter(node => stageLabel(node.stage) === stage);
      return group.length ? `<optgroup label="${stage}">${options(group.map(node => [node.id, node.label]), value)}</optgroup>` : '';
    }).join('') || options(nodes.map(node => [node.id, node.label]), value);
  }

  function usableMetrics(nodeId, policy = draft.mode === 'policy') {
    const node = scene().nodes.find(item => item.id === nodeId);
    const catalog = data.metrics.filter(metric => policy ? metric.mode === 'policy' : metric.mode !== 'policy');
    const mapped = node?.metricIds?.length ? catalog.filter(metric => node.metricIds.includes(metric.id)) : catalog;
    return mapped.length ? mapped : catalog;
  }

  function metricOptions(nodeId, value) {
    const entries = usableMetrics(nodeId);
    if (!entries.some(metric => metric.id === value) && metrics.has(value)) entries.unshift(metrics.get(value));
    const groups = new Map();
    for (const metric of entries) {
      const label = data.levels.find(level => level.id === metric.level)?.label || '政策驱动';
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push([metric.id, metric.label]);
    }
    return [...groups].map(([label, list]) => `<optgroup label="${esc(label)}">${options(list, value)}</optgroup>`).join('');
  }

  function newSignal(nodeId = draft.anchor) {
    const available = usableMetrics(nodeId);
    const unused = available.find(metric => !draft.signals.some(signal => signal.nodeId === nodeId && signal.metricId === metric.id));
    return { nodeId, metricId: (unused || available[0])?.id || '', value: '' };
  }

  function resetSignals() {
    draft.signals = [];
    if (draft.mode === 'policy') return;
    const set = (scene().defaultSignals || []).filter(signal => signal.nodeId === draft.anchor && metrics.get(signal.metricId)?.mode !== 'policy');
    draft.signals = [(set[0] && { ...set[0] }) || newSignal()];
    if (draft.mode !== 'single-metric') {
      const nextNode = draft.mode === 'multi-node' ? scene().nodes.find(node => node.id !== draft.anchor)?.id || draft.anchor : draft.anchor;
      draft.signals.push(newSignal(nextNode));
    }
  }

  function render() {
    root.querySelectorAll('[data-ir-tab]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.irTab === page));
    });
    if (page === 'catalog') return renderCatalog();
    if (page === 'saved') return renderSaved();
    work.innerHTML = `<div class="ir-mode-grid" aria-label="分析方式">${modes.map(mode => `
      <button type="button" class="ir-mode" data-ir-mode="${mode.id}" aria-pressed="${draft.mode === mode.id}"><b>${mode.name}</b><span>${mode.detail}</span></button>`).join('')}</div>
      <div class="ir-config-grid">
        <form class="ir-card ir-config" data-ir-form>${configMarkup()}</form>
        <aside class="ir-card ir-scenario">${scenarioMarkup()}</aside>
      </div>
      <div data-ir-results></div>`;
    renderResults();
  }

  function configMarkup() {
    return `
      <header class="ir-card-heading"><div><h2>配置分析</h2><p>${esc(modeLabel(draft.mode))}</p></div><button class="ir-link" type="button" data-ir-action="example">载入示例</button></header>
      <div class="ir-form-body">
        <div class="ir-form-grid">
          <label>产业链场景<select name="scenario">${sceneOptions()}</select></label>
          <label>${draft.mode === 'single-metric' || draft.mode === 'multi-metric' ? '起始节点' : '重点观察节点'}<select name="anchor">${nodeOptions(draft.anchor)}</select></label>
          <label>传导方向<select name="direction">${options([['both', '双向传导'], ['forward', '仅向下游'], ['reverse', '仅向上游']], draft.direction)}</select></label>
          <label>基期利润率（%）<input type="number" name="margin" min="0" max="99.99" step="any" value="${esc(draft.margin)}" required></label>
        </div>
        ${draft.mode === 'policy' ? policyMarkup() : ''}
        ${signalMarkup()}
      </div>
      <footer class="ir-form-footer"><button class="ir-button" type="button" data-ir-action="reset">重置</button><button class="ir-button ir-primary" type="submit" data-ir-run${fileReading && draft.mode === 'policy' ? ' disabled' : ''}>开始风险计算</button></footer>`;
  }

  function scenarioMarkup() {
    const scenario = scene();
    return `<header class="ir-card-heading"><div><h2>挂链概览</h2><p>${esc(scenario.label)}</p></div><button class="ir-link" type="button" data-ir-tab="catalog">查看指标</button></header>
      <div class="ir-scenario-body">
        <p>${esc(scenario.description)}</p>
        <div class="ir-scene-counts"><div><strong>${scenario.nodes.length}</strong><span>产业节点</span></div><div><strong>${scenario.edges.length}</strong><span>传导关系</span></div><div><strong>${new Set(scenario.nodes.flatMap(node => node.metricIds || [])).size || data.metrics.length}</strong><span>关联指标</span></div></div>
        <dl class="ir-chain-overview">${stages.map(stage => {
          const nodes = scenario.nodes.filter(node => stageLabel(node.stage) === stage);
          return `<div><dt>${stage}</dt><dd>${nodes.map(node => `<button type="button" data-ir-anchor="${esc(node.id)}"${node.id === draft.anchor ? ' aria-pressed="true"' : ''}>${esc(node.label)}</button>`).join('') || '—'}</dd></div>`;
        }).join('')}</dl>
        <p class="ir-scene-note">节点、关系和指标系数用于场景估算。量化结果会随着输入与系数调整。</p>
      </div>`;
  }

  function policyMarkup() {
    const { policy } = draft;
    return `<section class="ir-policy" aria-labelledby="irPolicyTitle">
      <header><div><h3 id="irPolicyTitle">政策附件与条款</h3><p>支持 PDF、DOCX、TXT、MD，也可粘贴正文。请核对提取文本与挂链条款。</p></div>
        <label class="ir-button ir-upload">上传政策文件<input name="policyFile" type="file" accept=".pdf,.docx,.txt,.md"></label></header>
      <p class="ir-file-state" data-ir-file-feedback role="status"${!fileFeedback && !policy.source ? ' hidden' : ''}>${esc(fileFeedback || policy.source)}</p>
      <label class="ir-policy-text">政策正文<textarea name="policyText" rows="4" placeholder="粘贴需要分析的政策条款"${fileReading ? ' readonly' : ''}>${esc(policy.text)}</textarea></label>
      <div class="ir-form-grid ir-policy-settings">
        <label>影响方向<select name="policyDirection">${options([['auto','自动判断'], ['positive','正向'], ['negative','负向']], policy.direction)}</select></label>
        <label>冲击强度（0–1）<input type="number" name="policyIntensity" min="0" max="1" step="any" value="${esc(policy.intensity)}" required></label>
        <label>覆盖系数（0–1）<input type="number" name="policyCoverage" min="0" max="1" step="any" value="${esc(policy.coverage)}" required></label>
      </div>
      <div class="ir-policy-action"><label class="ir-inline-check"><input type="checkbox" name="policyOcr"${policy.ocr ? ' checked' : ''}>扫描 PDF 时尝试 OCR</label>
        <button class="ir-button" type="button" data-ir-action="parse-policy"${fileReading ? ' disabled' : ''}>提取政策标签与受影响节点</button></div>
      <div data-ir-policy-analysis>${policyAssessment()}</div>
    </section>`;
  }

  function policyAssessment() {
    const { analysis, stale } = draft.policy;
    if (!analysis) return '';
    const tags = (analysis.tags || []).map(tag => typeof tag === 'object' ? tag.label || tag.name || tag.id : tag);
    return `<div class="ir-policy-assessment">
      ${stale ? '<p class="ir-warning">政策输入已修改，重新解析后会更新节点与分值。</p>' : ''}
      <div class="ir-policy-score"><span>政策类型 <b>${esc(analysis.type)}</b></span><span>总体方向 <b>${esc(directionNames[analysis.direction] || analysis.direction)}</b></span><span>正向影响 <b>${signed(analysis.positiveScore, '分')}</b></span><span>负向影响 <b>${signed(analysis.negativeScore, '分')}</b></span></div>
      ${tags.length ? `<div class="ir-tags" aria-label="政策标签">${tags.map(tag => `<span>${esc(tag)}</span>`).join('')}</div>` : ''}
      ${analysis.warnings?.length ? `<p class="ir-warning">${analysis.warnings.map(esc).join(' ')}</p>` : ''}
      <p class="ir-score-basis">${analysis.directionBasis ? '方向依据 ' + esc(analysis.directionBasis) + '。' : ''}${esc(analysis.basis || data.metadata?.policyScoring || '')}</p>
      <details class="ir-details" open><summary>受影响节点 <span>${analysis.matchedNodes.length} 个</span></summary>
        ${analysis.matchedNodes.length ? `<ul class="ir-policy-nodes">${analysis.matchedNodes.map(node => `<li><b>${esc(node.label)}</b><span>${esc(node.impact || '')}</span><small>正向 ${signed(node.positiveScore, '分')} · 负向 ${signed(node.negativeScore, '分')}</small>${node.matchedTerms?.length ? `<small>命中术语 ${node.matchedTerms.map(esc).join('、')}</small>` : ''}</li>`).join('')}</ul>` : '<p>未识别到匹配节点，可检查原文或改用指标波动模式。</p>'}</details>
      <details class="ir-details"><summary>条款与挂链依据 <span>${analysis.clauses.length} 条</span></summary>
        <ul class="ir-policy-clauses">${analysis.clauses.map(clause => `<li><b>${esc(clause.type)} · ${esc(directionNames[clause.direction] || clause.direction)}</b><p>${esc(clause.text)}</p><small>${esc(clause.basis)}</small></li>`).join('')}</ul></details>
    </div>`;
  }

  function signalMarkup() {
    return `<section class="ir-signal-section" aria-labelledby="irSignalTitle">
      <header><div><h3 id="irSignalTitle">${draft.mode === 'policy' ? '政策冲击设置' : '输入指标波动'}</h3><p>${draft.mode === 'policy' ? '解析后可复核与修正节点和冲击幅度。' : '按指标口径输入正负变动，以基期为参照。'}</p></div>
      ${draft.mode !== 'single-metric' && (draft.mode !== 'policy' || draft.policy.analysis) ? '<button class="ir-button" type="button" data-ir-action="add-signal">＋ 添加波动</button>' : ''}</header>
      ${draft.signals.length ? `<div class="ir-signals">${draft.signals.map((signal, index) => signalRow(signal, index)).join('')}</div>` :
        '<p class="ir-empty-small">解析政策后，系统会列出对应节点和冲击指标。</p>'}
    </section>`;
  }

  function signalRow(signal, index) {
    const metric = metrics.get(signal.metricId);
    const editableNode = draft.mode === 'multi-node' || draft.mode === 'policy';
    return `<div class="ir-signal-row${editableNode ? '' : ' ir-fixed-node'}" data-ir-signal="${index}">
      ${editableNode ? `<label>发生节点<select data-ir-signal-field="nodeId">${nodeOptions(signal.nodeId)}</select></label>` : ''}
      <label>波动指标<select data-ir-signal-field="metricId">${metricOptions(signal.nodeId, signal.metricId)}</select></label>
      <label><span>变化值 ${esc(metric?.unit || '')}</span><input type="number" step="any"${metric?.range ? ` min="${esc(metric.range.min)}" max="${esc(metric.range.max)}"` : ''} data-ir-signal-field="value" value="${esc(signal.value)}" placeholder="如 −10" required></label>
      ${draft.mode === 'single-metric' ? '' : `<button class="ir-icon-button" type="button" data-ir-remove-signal="${index}" aria-label="移除第 ${index + 1} 项波动">×</button>`}
      ${metric ? `<small>${[metric.description, metric.range && '输入区间 ' + signed(metric.range.min) + ' 至 ' + signed(metric.range.max) + ' ' + metric.unit].filter(Boolean).map(esc).join(' ')}</small>` : ''}
    </div>`;
  }

  function signed(value, unit = '') {
    if (!Number.isFinite(value)) return '—';
    const absolute = Math.abs(value);
    const rounded = Number(absolute.toFixed(2));
    return (rounded && value > 0 ? '+' : rounded && value < 0 ? '−' : '') + rounded + (unit === 'pp' ? ' 个百分点' : unit);
  }

  function riskBadge(level) {
    return `<span class="ir-risk-badge" data-risk="${esc(level)}">${esc(riskLabels[level] || riskLabels.none)}</span>`;
  }

  function staleResult() {
    dirty = !!result;
    const stale = work.querySelector('[data-ir-stale]');
    if (stale) stale.hidden = !dirty;
    const save = work.querySelector('[data-ir-action="save-result"]');
    if (save) save.disabled = dirty;
  }

  function setMode(mode) {
    if (mode === draft.mode) return;
    draft.mode = mode;
    if (mode === 'policy') {
      if (!draft.policy.text) loadPolicyExample();
      else draft.policy.stale = true;
    }
    resetSignals();
    staleResult();
    render();
    work.querySelector('[data-ir-mode="' + mode + '"]')?.focus();
  }

  function setScene(id, refresh = true) {
    const scenario = scene(id);
    draft.scenarioId = scenario.id;
    draft.anchor = scenario.defaultAnchor || scenario.nodes[0].id;
    draft.margin = scenario.baseProfitMargin ?? 10;
    draft.policy.stale = true;
    draft.policy.analysis = null;
    catalogNode = '';
    resetSignals();
    staleResult();
    if (refresh) render();
  }

  function setAnchor(id) {
    if (!scene().nodes.some(node => node.id === id)) return;
    draft.anchor = id;
    if (['single-metric', 'multi-metric'].includes(draft.mode)) {
      draft.signals = draft.signals.map(signal => {
        const available = usableMetrics(id);
        return { ...signal, nodeId: id, metricId: available.some(metric => metric.id === signal.metricId) ? signal.metricId : available[0]?.id || '' };
      });
      for (let i = 0; i < draft.signals.length; i++) {
        const signal = draft.signals[i];
        if (draft.signals.slice(0, i).some(other => other.metricId === signal.metricId)) signal.metricId = newSignal(id).metricId;
      }
    }
    staleResult();
    render();
  }

  function loadPolicyExample() {
    const example = data.policyExamples?.find(item => item.scenarioId === draft.scenarioId) || data.policyExamples?.[0];
    if (!example) return;
    if (example.scenarioId && draft.scenarioId !== example.scenarioId) setScene(example.scenarioId, false);
    draft.policy = { text: example.text, source: example.source || example.label, direction: 'auto', intensity: 0.7, coverage: 0.6, analysis: null, stale: true, ocr: draft.policy.ocr };
    fileFeedback = '';
  }

  function loadExample() {
    if (draft.mode === 'policy') {
      loadPolicyExample();
      parsePolicy(false);
    } else {
      resetSignals();
      const examples = scene().defaultSignals || [];
      for (const signal of draft.signals) {
        const example = examples.find(candidate => candidate.nodeId === signal.nodeId && candidate.metricId === signal.metricId);
        signal.value = example?.value ?? metrics.get(signal.metricId)?.defaultValue ?? 5;
      }
    }
    staleResult();
    render();
    showFeedback('已载入示例输入，可调整后计算。');
  }

  function updatePolicyDisplay() {
    const area = work.querySelector('[data-ir-policy-analysis]');
    if (area) area.innerHTML = policyAssessment();
  }

  function parsePolicy(refresh = true) {
    if (!draft.policy.text.trim()) {
      showFeedback('请先上传文件或填写政策正文。', true);
      work.querySelector('[name="policyText"]')?.focus();
      return false;
    }
    if (![draft.policy.intensity, draft.policy.coverage].every(value => value !== '' && Number(value) >= 0 && Number(value) <= 1)) {
      showFeedback('请将冲击强度和覆盖系数设置在 0 至 1 之间。', true);
      return false;
    }
    try {
      const { text, direction, intensity, coverage } = draft.policy;
      const analysis = data.evaluatePolicy(text, draft.scenarioId, { direction, intensity: Number(intensity), coverage: Number(coverage) });
      draft.policy.analysis = analysis;
      draft.policy.stale = false;
      draft.signals = analysis.signals.map(signal => ({ ...signal }));
      staleResult();
      if (refresh) render();
      showFeedback(analysis.clauses.length ? '政策条款已关联节点，确认冲击设置后可计算。' : '暂未提取到可挂链条款。', !analysis.clauses.length);
      return true;
    } catch (error) {
      showFeedback(error.message || '政策解析失败，请检查正文。', true);
      return false;
    }
  }

  async function readPolicy(file) {
    if (!file) return;
    const request = ++fileRequest;
    fileReading = true;
    fileFeedback = '正在读取 ' + file.name + '…';
    render();
    const showProgress = progress => {
      if (request !== fileRequest) return;
      const pageText = progress.page ? '第 ' + progress.page + ' 页' : '';
      fileFeedback = '正在读取 ' + file.name + (pageText ? ' · ' + pageText : '…');
      const element = work.querySelector('[data-ir-file-feedback]');
      if (element) element.textContent = fileFeedback;
    };
    try {
      const uploaded = await data.readPolicyFile(file, { ocr: draft.policy.ocr, onProgress: showProgress });
      if (request !== fileRequest) return;
      draft.policy.source = uploaded.name;
      draft.policy.text = uploaded.text;
      draft.policy.stale = true;
      draft.policy.analysis = null;
      draft.signals = [];
      fileFeedback = [uploaded.name + (uploaded.text.trim() ? ' 已提取正文' : ' 暂无可用正文'), ...(uploaded.warnings || [])].join(' · ');
      staleResult();
    } catch (error) {
      if (request === fileRequest) fileFeedback = error.message || '文件读取失败，请尝试粘贴正文。';
    } finally {
      if (request === fileRequest) {
        fileReading = false;
        if (page === 'analysis' && draft.mode === 'policy') render();
      }
    }
  }

  function runAnalysis({ refresh = true, quiet = false } = {}) {
    if (fileReading && draft.mode === 'policy') return false;
    if (draft.mode === 'policy' && (draft.policy.stale || !draft.policy.analysis)) {
      if (!parsePolicy(refresh)) return false;
    }
    const signals = draft.signals.map(({ nodeId, metricId, value }) => ({ nodeId, metricId, value: value === '' ? NaN : Number(value) }));
    const count = signals.length;
    const nodes = new Set(signals.map(signal => signal.nodeId));
    if (!count || draft.mode === 'multi-metric' && count < 2 || draft.mode === 'multi-node' && nodes.size < 2) {
      if (!quiet) showFeedback(draft.mode === 'multi-node' ? '请至少配置两个发生波动的产业节点。' : draft.mode === 'multi-metric' ? '请为当前节点至少配置两个不同指标。' : '请先配置至少一项冲击指标。', true);
      return false;
    }
    if (signals.some(signal => !Number.isFinite(signal.value))) {
      if (!quiet) showFeedback('请填写每项指标的波动数值。', true);
      return false;
    }
    const invalid = signals.find(signal => {
      const range = metrics.get(signal.metricId)?.range;
      return range && (signal.value < range.min || signal.value > range.max);
    });
    if (invalid) {
      if (!quiet) showFeedback('请核对「' + metrics.get(invalid.metricId).label + '」的输入区间。', true);
      return false;
    }
    const scenario = scene();
    const effective = window.zhiyanRiskCalibration?.apply(scenario) || scenario;
    try {
      const next = model.evaluate({ ...effective, metrics: data.metrics, interactions: data.interactions || [] }, {
        anchor: draft.anchor, signals, direction: draft.direction, baseProfitMargin: Number(draft.margin)
      });
      result = next;
      resultScenario = effective;
      selectedNode = next.anchor || draft.anchor;
      dirty = false;
      if (refresh) renderResults();
      if (!quiet) showFeedback('已完成逐级传导计算，结果已更新。');
      return true;
    } catch (error) {
      if (!quiet) showFeedback(error.message || '当前场景无法计算，请检查指标输入。', true);
      return false;
    }
  }

  function chooseResult(id) {
    if (!result?.rows.some(row => row.id === id)) return;
    selectedNode = id;
    renderResults();
    const detail = work.querySelector('[data-ir-node-detail]');
    detail?.focus({ preventScroll: true });
    detail?.scrollIntoView({ block: 'nearest' });
  }

  function renderResults() {
    const host = work.querySelector('[data-ir-results]');
    if (!host) return;
    if (!result) {
      host.innerHTML = '<div class="ir-card ir-result-empty"><h2>传导结果</h2><p>设置输入并开始计算后，查看路径、量化影响和节点预警。</p></div>';
      return;
    }
    const anchor = result.anchorResult || result.rows.find(row => row.id === result.anchor);
    const warnings = result.rows.filter(row => row.riskLevel === 'high' || row.riskLevel === 'medium').sort((a, b) => b.riskScore - a.riskScore);
    const highCount = warnings.filter(row => row.riskLevel === 'high').length;
    const affected = result.rows.filter(row => impactAxes.some(({ key }) => Math.abs(row[key] || 0) > .01)).length;
    host.innerHTML = `
      <header class="ir-results-heading"><div><h2>传导结果</h2><p>${esc(resultScenario.label)} · ${esc(modeLabel(result.scenario))}</p></div><button class="ir-button" type="button" data-ir-action="save-result"${dirty ? ' disabled' : ''}>保存场景</button></header>
      <p class="ir-warning" data-ir-stale${dirty ? '' : ' hidden'}>输入已修改。下方为上一次结果，重新计算后更新。</p>
      <div class="ir-results-stats">
        <div><span>重点节点风险</span><strong>${riskBadge(anchor?.riskLevel || result.riskLevel)}</strong><small>${esc(anchor?.label || '')}</small></div>
        <div><span>受影响节点</span><strong>${affected}</strong><small>本场景共 ${result.rows.length} 个节点</small></div>
        <div><span>重点节点利润率</span><strong>${signed(anchor?.profit, 'pp')}</strong><small>相对基期利润 ${signed(anchor?.profitChange, '%')}</small></div>
        <div><span>高风险节点</span><strong>${highCount}</strong><small>${warnings.length - highCount} 个中风险节点</small></div>
      </div>
      <div class="ir-results-grid">
        <section class="ir-card">${pathMarkup()}</section>
        <section class="ir-card ir-alerts">${alertMarkup(warnings)}</section>
      </div>
      <div class="ir-card ir-node-detail" tabindex="-1" data-ir-node-detail>${nodeDetails()}</div>
      <section class="ir-card ir-heatmap">${heatmapMarkup()}</section>
      <section class="ir-card ir-numeric">${numericMarkup()}</section>`;
  }

  function pathMarkup() {
    return `<header class="ir-card-heading"><div><h3>上下游传导路径</h3><p>选择节点查看实际传播路径与贡献来源。</p></div><div class="ir-risk-legend">${['low','medium','high'].map(riskBadge).join('')}</div></header>
      <div class="ir-path-grid">${stages.map(stage => `<div class="ir-path-stage"><h4>${stage}</h4>${result.rows.filter(row => stageLabel(row.stage) === stage).map(row =>
        `<button class="ir-path-node" type="button" data-ir-result-node="${esc(row.id)}" data-risk="${esc(row.riskLevel)}" aria-pressed="${row.id === selectedNode}"><b>${esc(row.label)}</b><span>风险 ${signed(row.riskScore, ' 分').replace(/^\+/, '')}</span></button>`).join('')}</div>`).join('')}</div>`;
  }

  function alertMarkup(warnings) {
    return `<header class="ir-card-heading"><div><h3>重点节点与预警</h3><p>按风险分排序</p></div><b class="ir-alert-count">${warnings.length}</b></header>
      <div class="ir-alert-list">${warnings.length ? warnings.map(row => `<button type="button" data-ir-result-node="${esc(row.id)}"><div><b>${esc(row.label)}</b><small>${esc(riskReason(row))}</small></div>${riskBadge(row.riskLevel)}</button>`).join('') : '<p class="ir-empty-small">当前场景没有触发中高风险预警。</p>'}</div>`;
  }

  function riskReason(row) {
    const triggers = row.riskTriggers || [];
    const adverse = { cost: ['成本上升', '%'], profit: ['利润率下降', 'pp'], gap: ['供给相对不足', 'pp'] };
    return triggers.length ? triggers.map(trigger => {
      const axis = adverse[trigger.axis];
      return axis ? axis[0] + ' ' + signed(Math.abs(trigger.adverse), axis[1]).replace(/^\+/, '') : trigger.label || trigger.reason || '';
    }).filter(Boolean).join(' · ') :
      '成本 ' + signed(row.cost, '%') + ' · 利润率 ' + signed(row.profit, 'pp');
  }

  function nodeDetails() {
    const row = result.rows.find(item => item.id === selectedNode);
    if (!row) return '';
    const contributors = row.contributors || [];
    const parts = [['直接冲击', row.direct], ['传入影响', row.propagated], ['正负抵消量', row.offsets]];
    const components = [...(row.components || []), ...(row.interactionEffects || [])];
    return `<header class="ir-card-heading"><div><h3>${esc(row.label)} · 传导明细</h3><p>${esc(stageLabel(row.stage))} · ${esc(riskReason(row))}</p></div>${riskBadge(row.riskLevel)}</header>
      <div class="ir-route-list">
        ${row.modelDomainExceeded ? '<p class="ir-warning">波动超出模型适用范围，请回到系数与输入复核。</p>' : ''}
        <div class="ir-effect-parts">${parts.map(([label,effect]) => `<div><b>${label}</b><p>${effectText(effect)}</p></div>`).join('')}</div>
        ${contributors.length ? contributors.map(pathRow).join('') : '<p class="ir-empty-small">当前节点没有可展示的传导来源。</p>'}
        ${components.length ? `<details class="ir-details"><summary>指标构成与交互项</summary>${components.map(component => `
          <p><b>${esc(component.label)}</b> · ${effectText(component.effect)}</p>`).join('')}</details>` : ''}
      </div>`;
  }

  function effectText(effect) {
    return transmissionAxes.map(axis => axis.label + ' ' + signed(effect?.[axis.key], '%')).join(' · ');
  }

  function nodePath(ids) {
    return `<ol aria-label="从冲击来源到当前节点的传导路径">${ids.map(id => `<li>${esc(nodeLabel(id, resultScenario))}</li>`).join('')}</ol>`;
  }

  function pathRow(contributor) {
    const path = contributor.path || [];
    const alternative = transmissionAxes.map(axis => ({ ...axis, path: contributor.pathByAxis?.[axis.key] || [] }))
      .filter(axis => axis.path.length && axis.path.join() !== path.join());
    const direction = { direct: '本节点冲击', forward: '向下游传导', reverse: '向上游传导' }[contributor.direction];
    return `<div class="ir-route" data-ir-path="${esc(contributor.direction)}"><b>${esc(direction)}</b>${nodePath(path)}
      <p>${effectText(contributor.effect)}</p>
      ${alternative.length ? `<details class="ir-details"><summary>各指标的不同传导路径</summary>${alternative.map(axis => `<div><p>${axis.label}</p>${nodePath(axis.path)}</div>`).join('')}</details>` : ''}
    </div>`;
  }

  function heatmapMarkup() {
    return `<header class="ir-card-heading"><div><h3>节点影响热力图</h3><p>同一行对照成本、利润率与供需变化。</p></div><div class="ir-heat-legend"><span data-tone="adverse">不利</span><span data-tone="neutral">平稳</span><span data-tone="favor">有利</span></div></header>
      <div class="ir-table-wrap"><table><thead><tr><th scope="col">产业节点</th>${impactAxes.map(axis => `<th scope="col">${axis.label}</th>`).join('')}</tr></thead><tbody>
        ${result.rows.map(row => `<tr><th scope="row"><button type="button" class="ir-link" data-ir-result-node="${esc(row.id)}">${esc(row.label)}</button></th>${impactAxes.map(axis => heatCell(row, axis)).join('')}</tr>`).join('')}
      </tbody></table></div>`;
  }

  function heatCell(row, { key, unit }) {
    const value = row[key];
    if (!Number.isFinite(value)) return '<td data-tone="neutral">—</td>';
    const tone = Math.abs(value) < .01 ? 'neutral' : ((key === 'cost' ? -value : value) > 0 ? 'favor' : 'adverse');
    const intensity = Math.abs(value) >= 10 ? 'strong' : Math.abs(value) >= 3 ? 'mid' : 'soft';
    return `<td data-tone="${tone}" data-heat="${intensity}">${signed(value, unit)}</td>`;
  }

  function numericMarkup() {
    return `<header class="ir-card-heading"><div><h3>节点量化明细</h3><p>供需差为供给增幅减需求增幅，负值表示供给相对不足。</p></div></header>
      <div class="ir-table-wrap"><table><thead><tr><th scope="col">产业节点</th><th scope="col">环节</th>${impactAxes.map(({label,unit}) => `<th scope="col">${label}（${unit === 'pp' ? '百分点' : unit}）</th>`).join('')}<th scope="col">风险分</th><th scope="col">预警等级</th></tr></thead><tbody>
        ${result.rows.map(row => `<tr><th scope="row"><button type="button" class="ir-link" data-ir-result-node="${esc(row.id)}">${esc(row.label)}</button></th><td>${esc(stageLabel(row.stage))}</td>
          ${impactAxes.map(axis => `<td>${signed(row[axis.key], axis.unit)}</td>`).join('')}<td>${esc(row.riskScore)}</td><td>${riskBadge(row.riskLevel)}</td></tr>`).join('')}
      </tbody></table></div>`;
  }

  function renderCatalog() {
    const scenario = scene();
    work.innerHTML = `<section class="ir-card ir-catalog">
      <header class="ir-card-heading"><div><h2>挂链指标库</h2><p>按宏观、中观、微观及所挂节点查看三级指标、更新线索和传导口径。</p></div><button class="ir-button" type="button" data-ir-action="export-catalog">导出指标口径</button></header>
      <div class="ir-catalog-controls">
        <label>产业链场景<select name="catalogScenario">${sceneOptions()}</select></label>
        <label>指标层级<select name="catalogLevel">${options([['','全部层级'], ...data.levels.map(level => [level.id, level.label])], catalogLevel)}</select></label>
        <label>关联节点<select name="catalogNode"><option value="">全部节点</option>${nodeOptions(catalogNode)}</select></label>
        <label class="ir-catalog-query">搜索指标<input type="search" name="catalogQuery" value="${esc(catalogQuery)}" placeholder="搜索指标、编码或口径"></label>
      </div>
      <div data-ir-catalog-results></div>
    </section>
    <section class="ir-card ir-method">
      <header class="ir-card-heading"><div><h2>传导关系与系数</h2><p>按成本、营收、供给、需求顺序列示每段顺向与反向系数。</p></div></header>
      <div data-ir-calibration></div>
      <div class="ir-table-wrap"><table><thead><tr><th scope="col">关系</th><th scope="col">顺向</th><th scope="col">反向</th><th scope="col">系数依据</th></tr></thead><tbody data-ir-edge-table></tbody></table></div>
      <div class="ir-method-notes">
        <p><b>指标挂链</b> ${esc(data.metadata?.mappingRule)}</p>
        <p><b>更新口径</b> ${esc(data.metadata?.maintenance)}</p>
        <p><b>系数口径</b> ${esc(data.metadata?.coefficientBasis)}</p>
        <p><b>高风险阈值</b> 成本上升 ${signed(model.baseThresholds?.cost, '%').replace(/^\+/, '')}，利润率下降 ${signed(model.baseThresholds?.profit, 'pp').replace(/^\+/, '')}，供给相对不足 ${signed(model.baseThresholds?.gap, 'pp').replace(/^\+/, '')}。中风险起点 ${esc(model.severityCutoffs?.medium)} 分。</p>
        <details class="ir-details"><summary>模型假设与预警公式</summary>${Object.values(model.assumptions || {}).map(text => `<p>${esc(text)}</p>`).join('')}</details>
      </div>
    </section>`;
    renderCatalogRows();
    renderEdgeRows(scenario);
    const panel = work.querySelector('[data-ir-calibration]');
    window.zhiyanRiskCalibration?.mount(panel, scenario, () => {
      if (result && !dirty) runAnalysis({ quiet: true, refresh: false });
      renderEdgeRows(scenario);
    });
  }

  function renderEdgeRows(scenario) {
    const host = work.querySelector('[data-ir-edge-table]');
    if (!host) return;
    const effective = window.zhiyanRiskCalibration?.apply(scenario) || scenario;
    host.innerHTML = effective.edges.map(edge => `<tr><th scope="row">${esc(nodeLabel(edge.from, scenario))} → ${esc(nodeLabel(edge.to, scenario))}<small>${esc(edge.relation || '')}</small></th>
      <td>${edge.forward.map(value => signed(value)).join(' / ')}</td><td>${edge.reverse.map(value => signed(value)).join(' / ')}</td><td>${esc(edge.basis || '场景估算')}</td></tr>`).join('');
  }

  function renderCatalogRows() {
    const host = work.querySelector('[data-ir-catalog-results]');
    if (!host) return;
    const scenario = scene();
    const query = catalogQuery.normalize('NFKC').trim().toLowerCase();
    const node = scenario.nodes.find(item => item.id === catalogNode);
    const visible = data.metrics.filter(metric => (!catalogLevel || metric.level === catalogLevel) &&
      (!node || node.metricIds?.includes(metric.id)) &&
      (!query || [metric.label, metric.code, metric.category, metric.basis, metric.description].join(' ').toLowerCase().includes(query)));
    host.innerHTML = `<p class="ir-catalog-count">${visible.length} 项指标</p>
      ${visible.length ? `<div class="ir-table-wrap"><table><thead><tr><th scope="col">三级指标</th><th scope="col">计量与来源</th><th scope="col">产业节点映射</th><th scope="col">作用通道</th></tr></thead>
      <tbody>${visible.map(metric => catalogRow(metric, scenario, node)).join('')}</tbody></table></div>` : '<p class="ir-empty-small">没有符合条件的指标。</p>'}`;
  }

  function metricMappings(metric, scenario, selected) {
    const mappings = (metric.mappings || []).filter(mapping => mapping.scenarioId === scenario.id && (!selected || mapping.nodeId === selected.id));
    return mappings.length ? mappings : scenario.nodes.filter(node => node.metricIds?.includes(metric.id) && (!selected || selected.id === node.id)).map(node => ({ nodeId: node.id, reason: node.metricExposures?.[metric.id] }));
  }

  function metricPath(metric) {
    const level = data.levels.find(item => item.id === metric.level)?.label || metric.level;
    return metric.path?.length ? metric.path : [level, metric.category, metric.label];
  }

  function catalogRow(metric, scenario, selected) {
    const nodes = metricMappings(metric, scenario, selected);
    const path = metricPath(metric);
    return `<tr><th scope="row"><strong>${esc(metric.label)}</strong><small>${esc(metric.code || metric.id)} · ${path.filter(Boolean).map(esc).join(' / ')}</small></th>
      <td><b>${esc(metric.unit || '—')}</b><small>${esc(metric.basis)}${metric.refresh ? ' · ' + esc(metric.refresh) : ''}</small><small>${[metric.evidence?.kind, metric.evidence?.status].filter(Boolean).map(esc).join(' · ')}</small></td>
      <td>${nodes.length ? `<ul class="ir-mapping">${nodes.map(mapping => `<li><b>${esc(nodeLabel(mapping.nodeId, scenario))}</b><small>${[mapping.reason,mapping.source,mapping.update].filter(Boolean).map(esc).join(' · ')}</small></li>`).join('')}</ul>` : '—'}</td>
      <td>${metric.weights.map((value, index) => `${['成本','营收','供给','需求'][index]} ${signed(value)}`).join(' · ')}</td></tr>`;
  }

  function csvCell(value) {
    const text = String(value ?? '');
    const safe = typeof value !== 'number' && /^[=+\-@\t\r\n]/.test(text) ? "'" + text : text;
    return '"' + safe.replaceAll('"', '""') + '"';
  }

  function exportCatalog() {
    const scenario = scene();
    const columns = ['产业链编码','产业链场景','数据性质','节点编码','节点名称','产业链环节','一级指标层级','二级指标分类','三级指标名称',
      '指标编码','指标定义','计量单位','采集频率与维护','建议数据来源','证据状态','挂链理由','映射来源','映射更新口径','映射版本',
      '输入下限','输入上限','示例输入','成本系数','营收系数','供给系数','需求系数'];
    const rows = data.metrics.flatMap(metric => {
      const mapped = metricMappings(metric, scenario);
      return (mapped.length ? mapped : [{}]).map(mapping => {
        const node = scenario.nodes.find(item => item.id === mapping.nodeId);
        const [level, category, label] = metricPath(metric);
        return [scenario.id, scenario.label, data.metadata?.dataType || '仿真示例', node?.id, node?.label, stageLabel(node?.stage),
          level, category, label, metric.code || metric.id, metric.description, metric.unit, metric.refresh, metric.basis, metric.evidence?.status,
          mapping.reason || (node ? '' : '本场景无直接挂链'), mapping.source, mapping.update, mapping.version || data.metadata?.mappingVersion,
          metric.range?.min, metric.range?.max, metric.defaultValue, ...metric.weights];
      });
    });
    const csv = [columns, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = '智研-指标口径-' + scenario.id + '.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showFeedback('已导出当前产业链的完整指标口径和挂链映射。');
  }

  function readSaved() {
    try {
      const records = JSON.parse(localStorage.getItem(inputsKey));
      return Array.isArray(records) ? records.filter(record => record && typeof record.id === 'string' && record.input?.signals && modes.some(mode => mode.id === record.input.mode)) : [];
    } catch (error) {
      return [];
    }
  }

  function saveResult() {
    if (!result || dirty) return;
    const copy = JSON.parse(JSON.stringify(draft));
    const record = { id: crypto.randomUUID?.() || 'risk-' + Date.now(), time: new Date().toISOString(), label: scene().label, anchor: nodeLabel(draft.anchor), level: result.riskLevel, input: copy };
    const next = [record, ...readSaved()].slice(0, 30);
    try {
      localStorage.setItem(inputsKey, JSON.stringify(next));
      saved = next;
      showFeedback('已保存当前场景与输入，可随时复算。');
    } catch (error) {
      showFeedback('浏览器暂无法保存场景。', true);
    }
  }

  function renderSaved() {
    saved = readSaved();
    work.innerHTML = `<section class="ir-card ir-saved"><header class="ir-card-heading"><div><h2>已保存场景</h2><p>场景及政策输入保存在此浏览器。重新打开时按当前口径复算。</p></div></header>
      ${saved.length ? `<div class="ir-table-wrap"><table><thead><tr><th scope="col">场景</th><th scope="col">类型</th><th scope="col">重点节点</th><th scope="col">保存时风险</th><th scope="col">保存时间</th><th scope="col">操作</th></tr></thead>
        <tbody>${saved.map(record => `<tr><th scope="row">${esc(record.label)}</th><td>${esc(modeLabel(record.input.mode))}</td><td>${esc(record.anchor)}</td><td>${riskBadge(record.level)}</td><td>${esc(displayTime(record.time))}</td><td><button class="ir-link" type="button" data-ir-restore="${esc(record.id)}">打开场景</button></td></tr>`).join('')}</tbody></table></div>` :
        '<p class="ir-empty-small">暂无保存的风险场景。</p>'}</section>`;
  }

  function displayTime(value) {
    const time = new Date(value);
    return Number.isFinite(time.valueOf()) ? new Intl.DateTimeFormat('zh-CN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Shanghai' }).format(time) : '—';
  }

  function resetDraft() {
    fileRequest++;
    fileReading = false;
    fileFeedback = '';
    draft.policy = { text: '', source: '', direction: 'auto', intensity: 0.7, coverage: 0.6, analysis: null, stale: true };
    draft.margin = 10;
    draft.direction = 'both';
    setScene(draft.scenarioId, false);
    result = null;
    resultScenario = null;
    dirty = false;
    render();
    showFeedback('已重置分析输入。');
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const { irTab, irMode, irAnchor, irAction, irRemoveSignal, irResultNode, irRestore } = button.dataset;
    if (irTab) {
      page = irTab;
      showFeedback('');
      return render();
    }
    if (irMode) return setMode(irMode);
    if (irAnchor) return setAnchor(irAnchor);
    if (irResultNode) return chooseResult(irResultNode);
    if (irRestore) {
      const record = saved.find(item => item.id === irRestore);
      if (!record) return;
      fileRequest++;
      fileReading = false;
      fileFeedback = '';
      Object.assign(draft, JSON.parse(JSON.stringify(record.input)));
      page = 'analysis';
      runAnalysis({ refresh: false });
      return render();
    }
    if (irRemoveSignal != null) {
      draft.signals.splice(Number(irRemoveSignal), 1);
      staleResult();
      return render();
    }
    if (irAction === 'back') return navigate('intelligenceFeed');
    if (irAction === 'example') return loadExample();
    if (irAction === 'reset') return resetDraft();
    if (irAction === 'parse-policy') return parsePolicy();
    if (irAction === 'save-result') return saveResult();
    if (irAction === 'export-catalog') return exportCatalog();
    if (irAction === 'add-signal') {
      const node = draft.mode === 'multi-node' ? scene().nodes.find(node => !draft.signals.some(signal => signal.nodeId === node.id)) : null;
      draft.signals.push(newSignal(node?.id || draft.anchor));
      staleResult();
      render();
      work.querySelector('.ir-signal-row:last-child [data-ir-signal-field="metricId"]')?.focus();
    }
  });

  root.addEventListener('change', event => {
    const control = event.target;
    if (control.name === 'scenario' || control.name === 'catalogScenario') return setScene(control.value);
    if (control.name === 'anchor') return setAnchor(control.value);
    if (control.name === 'policyFile') return readPolicy(control.files[0]);
    if (control.name === 'policyOcr') { draft.policy.ocr = control.checked; return; }
    if (control.name === 'catalogLevel' || control.name === 'catalogNode') {
      if (control.name === 'catalogLevel') catalogLevel = control.value;
      else catalogNode = control.value;
      return renderCatalogRows();
    }
    if (control.name === 'direction') {
      draft.direction = control.value;
      return staleResult();
    }
    if (control.name === 'policyDirection') {
      draft.policy.direction = control.value;
      draft.policy.stale = true;
      staleResult();
      return updatePolicyDisplay();
    }
    const field = control.dataset.irSignalField;
    if (!field || field === 'value') return;
    const signal = draft.signals[Number(control.closest('[data-ir-signal]').dataset.irSignal)];
    signal[field] = control.value;
    if (field === 'nodeId' && !usableMetrics(control.value).some(metric => metric.id === signal.metricId)) {
      signal.metricId = newSignal(control.value).metricId;
    }
    staleResult();
    render();
  });

  root.addEventListener('input', event => {
    const control = event.target;
    if (control.name === 'catalogQuery') {
      catalogQuery = control.value;
      return renderCatalogRows();
    }
    if (control.name === 'margin') draft.margin = control.value;
    else if (control.dataset.irSignalField === 'value') draft.signals[Number(control.closest('[data-ir-signal]').dataset.irSignal)].value = control.value;
    else if (['policyText', 'policyIntensity', 'policyCoverage'].includes(control.name)) {
      const field = { policyText: 'text', policyIntensity: 'intensity', policyCoverage: 'coverage' }[control.name];
      draft.policy[field] = control.value;
      if (!draft.policy.stale) {
        draft.policy.stale = true;
        updatePolicyDisplay();
      }
    } else return;
    staleResult();
  });

  root.addEventListener('submit', event => {
    if (!event.target.matches('[data-ir-form]')) return;
    event.preventDefault();
    if (runAnalysis()) work.querySelector('.ir-results-heading')?.scrollIntoView({ block: 'start' });
  });

  entry.addEventListener('click', () => navigate(root.id));
  window.ZhiyanIntelligenceRisk = Object.freeze({ open: () => navigate(root.id) });
  resetSignals();
  if (draft.signals[0] && draft.signals[0].value === '') draft.signals[0].value = 15;
  runAnalysis({ refresh: false, quiet: true });
  render();
  if (new URLSearchParams(window.location.search).get('module') === root.id) navigate(root.id);
})();

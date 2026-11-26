(function () {
  'use strict';

  const axes = [
    ['cost', '成本'], ['revenue', '收入'], ['supply', '供给'], ['demand', '需求']
  ];
  const directions = [['forward', '顺链 · 供方到需方'], ['reverse', '逆链 · 需方到供方']];
  const storagePrefix = 'zhiyan-risk-calibration-v1:';
  const temporaryRecords = new Map();
  const maxInputSize = 512000;
  const range = 5;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  const display = value => value === null || !Number.isFinite(value)
    ? '—'
    : new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 4 }).format(value);
  const headers = [
    ['来源节点变动(%)', '源节点变动(%)', '输入变动(%)', 'source_change', 'source_pct', 'source', 'x'],
    ['目标节点变动(%)', '结果变动(%)', '输出变动(%)', 'target_change', 'target_pct', 'target', 'y']
  ];

  function cells(line, separator, row) {
    const fields = [];
    let value = '';
    let inQuotes = false;
    for (let position = 0; position < line.length; position += 1) {
      const character = line[position];
      if (character === '"') {
        if (inQuotes && line[position + 1] === '"') {
          value += '"';
          position += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (character === separator && !inQuotes) {
        fields.push(value.trim());
        value = '';
      } else {
        value += character;
      }
    }
    if (inQuotes) throw Error('第 ' + row + ' 行的引号未闭合。');
    fields.push(value.trim());
    return fields;
  }

  function parseSamples(text) {
    const rows = text.replace(/^\uFEFF/, '').split(/\r?\n/)
      .map((line, index) => ({ line, row: index + 1 })).filter(({ line }) => line.trim());
    if (!rows.length) throw Error('请录入来源节点和目标节点的对齐变动样本。');
    const { line } = rows[0];
    const delimiter = ['\t', ',', '，'].find(value => line.includes(value)) || ',';
    const initial = cells(line, delimiter, rows[0].row);
    const normalized = initial.map(value => value.normalize('NFKC').toLowerCase().replace(/\s+/g, ''));
    const indexes = headers.map(labels => normalized.findIndex(value => labels.includes(value)));
    const hasHeader = indexes.every(index => index >= 0);
    if (!hasHeader && ![2, 3].includes(initial.length)) throw Error('请使用两列变动值，或加上一列样本期。');
    const [xIndex, yIndex] = hasHeader ? indexes : (initial.length === 3 ? [1, 2] : [0, 1]);
    return rows.slice(hasHeader ? 1 : 0).map(({ line, row }) => {
      const fields = cells(line, delimiter, row);
      if (!hasHeader && fields.length !== initial.length) throw Error('第 ' + row + ' 行的列数与首行不一致。');
      return [xIndex, yIndex].map(index => {
        const value = (fields[index] || '').normalize('NFKC').replace(/%$/, '').trim();
        if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) {
          throw Error('第 ' + row + ' 行需要填写两个数值，5 表示变动 5%。');
        }
        const number = Number(value);
        if (!Number.isFinite(number)) throw Error('第 ' + row + ' 行的数值超出可计算范围。');
        return number;
      });
    });
  }

  function fit(samples) {
    const count = samples.length;
    if (count < 3) throw Error('至少需要 3 行成对样本。');
    const means = samples.reduce(([sumX, sumY], [x, y]) => [sumX + x, sumY + y], [0, 0])
      .map(sum => sum / count);
    const [meanX, meanY] = means;
    let varianceX = 0;
    let varianceY = 0;
    let covariance = 0;
    samples.forEach(([x, y]) => {
      const dx = x - meanX;
      const dy = y - meanY;
      varianceX += dx * dx;
      varianceY += dy * dy;
      covariance += dx * dy;
    });
    if (!Number.isFinite(varianceX) || !Number.isFinite(varianceY) || !Number.isFinite(covariance)) {
      throw Error('样本数值超出可计算范围。');
    }
    if (varianceX <= 0.000000000001) throw Error('样本中的来源节点变动没有足够差异，无法估计斜率。');
    const slope = covariance / varianceX;
    const intercept = meanY - slope * meanX;
    const rSquared = varianceY > 0 ? Math.min(1, (covariance / Math.sqrt(varianceX) / Math.sqrt(varianceY)) ** 2) : null;
    return { count, slope, intercept, rSquared };
  }

  function storageKey(scenario, edge, direction, axis) {
    return storagePrefix + JSON.stringify([scenario.id, edge.from, edge.to, direction, axis]);
  }

  function recordAt(key) {
    if (temporaryRecords.has(key)) return temporaryRecords.get(key);
    try {
      const item = JSON.parse(localStorage.getItem(key));
      return item && Number.isFinite(item.slope) && Math.abs(item.slope) <= range ? item : null;
    } catch {
      return null;
    }
  }

  function saveRecord(key, item) {
    try {
      if (item) localStorage.setItem(key, JSON.stringify(item));
      else localStorage.removeItem(key);
      temporaryRecords.delete(key);
      return true;
    } catch {
      temporaryRecords.set(key, item);
      return false;
    }
  }

  function vector(input) {
    if (Array.isArray(input)) return input.slice();
    if (typeof input === 'number') return axes.map(() => input);
    return axes.map(([axis]) => input?.[axis]);
  }

  function apply(scenario) {
    const edges = scenario.edges.map(edge => {
      const result = { ...edge };
      const calibrations = {};
      for (const [direction] of directions) {
        const revised = vector(edge[direction]);
        let changed = false;
        axes.forEach(([axis], index) => {
          const record = recordAt(storageKey(scenario, edge, direction, axis));
          if (record) {
            revised[index] = record.slope;
            calibrations[direction + ':' + axis] = record;
            changed = true;
          }
        });
        if (changed) result[direction] = revised;
      }
      return Object.keys(calibrations).length ? { ...result, calibrations } : edge;
    });
    return { ...scenario, edges };
  }

  function readSampleFile(file) {
    if (file.size > maxInputSize) return Promise.reject(Error('请上传不超过 500 KB 的样本文件。'));
    return file.arrayBuffer().then(buffer => {
      const bytes = new Uint8Array(buffer);
      if (bytes[0] === 255 && bytes[1] === 254) return new TextDecoder('utf-16le').decode(bytes);
      if (bytes[0] === 254 && bytes[1] === 255) return new TextDecoder('utf-16be').decode(bytes);
      try {
        return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      } catch {
        return new TextDecoder('gb18030').decode(bytes);
      }
    });
  }

  function mount(element, scenario, onApplied) {
    if (!element || !scenario.edges.length) return;
    const nodes = new Map(scenario.nodes.map(node => [node.id, node.label]));
    const template = '样本期,来源节点变动(%),目标节点变动(%)\n样本1,-4,-2.1\n样本2,0,0.1\n样本3,3,1.75\n样本4,7,3.95\n';
    const options = entries => entries.map(([value, label]) => '<option value="' + escape(value) + '">' + escape(label) + '</option>').join('');
    element.innerHTML = `
      <section class="irc-card" aria-label="历史样本系数校准">
        <header class="irc-header">
          <div><h2>历史样本系数校准</h2><p>按边、方向和影响维度输入同口径对齐样本。系统估计回归斜率，并保留样本来源与拟合指标。</p></div>
          <a class="irc-button" download="产业节点传导样本模板.csv" href="data:text/csv;charset=utf-8,${encodeURIComponent('\uFEFF' + template)}">下载样本模板</a>
        </header>
        <div class="irc-fields">
          <label>关联边<select data-irc-edge>${options(scenario.edges.map((edge, index) => [index, nodes.get(edge.from) + ' → ' + nodes.get(edge.to)]))}</select></label>
          <label>传导方向<select data-irc-direction>${options(directions)}</select></label>
          <label>影响维度<select data-irc-axis>${options(axes)}</select></label>
        </div>
        <p class="irc-current" data-irc-current></p>
        <div class="irc-sample">
          <label>样本来源或批次<input data-irc-source type="text" maxlength="160" placeholder="如月度成本台账 2025-01 至 2026-06"></label>
          <label>上传样本 <small>CSV、TSV 或 TXT</small><input type="file" data-irc-file accept=".csv,.tsv,.txt"></label>
          <label class="irc-wide">对齐样本 <small>样本期可选，5 表示变动 5%。来源节点按已选方向确定。</small>
            <textarea data-irc-text rows="5" maxlength="${maxInputSize}" placeholder="样本期,来源节点变动(%),目标节点变动(%)&#10;2026-01,-4,-2.1&#10;2026-02,0,0.1&#10;2026-03,3,1.75"></textarea>
          </label>
        </div>
        <div class="irc-actions">
          <button type="button" class="irc-button irc-primary" data-irc-calculate>拟合系数</button>
          <button type="button" class="irc-button" data-irc-apply disabled>应用到当前场景</button>
          <button type="button" class="irc-button" data-irc-reset hidden>恢复示例系数</button>
        </div>
        <p class="irc-status" data-irc-status role="status" hidden></p>
        <dl class="irc-result" data-irc-result hidden></dl>
        <details class="irc-method"><summary>回归与应用口径</summary><p>采用带截距的一元最小二乘回归。系数为目标变动对来源变动的斜率，模型只应用斜率，截距用于诊断。可应用范围为 −5 至 +5，负值表示反向响应。拟合优度描述样本内拟合，业务因果仍需结合挂链依据和验证样本复核。</p></details>
      </section>`;

    const get = name => element.querySelector('[data-irc-' + name + ']');
    const [edgeSelect, directionSelect, axisSelect, file, text, source, result, status, applyButton, reset] =
      ['edge', 'direction', 'axis', 'file', 'text', 'source', 'result', 'status', 'apply', 'reset'].map(get);
    let computed = null;
    let fileRun = 0;

    function selection() {
      const edge = scenario.edges[Number(edgeSelect.value)];
      const direction = directionSelect.value;
      const axis = axisSelect.value;
      const index = axes.findIndex(([key]) => key === axis);
      return { key: storageKey(scenario, edge, direction, axis), baseline: vector(edge[direction])[index] };
    }

    function showStatus(message, error = false) {
      status.textContent = message;
      status.hidden = !message;
      status.classList.toggle('irc-error', error);
    }

    function refreshCurrent() {
      const { key, baseline } = selection();
      const saved = recordAt(key);
      reset.hidden = !saved;
      get('current').textContent = saved
        ? '当前系数 ' + display(saved.slope) + ' · 已校准 · ' + saved.source + ' · ' + saved.count + ' 条样本'
        : '当前系数 ' + display(baseline) + ' · 示例系数';
    }

    function invalidate() {
      computed = null;
      result.hidden = true;
      applyButton.disabled = true;
      showStatus('');
    }

    [edgeSelect, directionSelect, axisSelect].forEach(control => control.addEventListener('change', () => {
      invalidate();
      refreshCurrent();
    }));
    text.addEventListener('input', () => {
      fileRun += 1;
      invalidate();
    });
    file.addEventListener('change', async () => {
      const upload = file.files[0];
      if (!upload) return;
      const run = ++fileRun;
      invalidate();
      try {
        const contents = await readSampleFile(upload);
        if (run !== fileRun) return;
        text.value = contents;
        source.value = upload.name.slice(0, 160);
        showStatus('已读取样本文件。');
      } catch (error) {
        if (run === fileRun) showStatus(error.message, true);
      }
    });
    get('calculate').addEventListener('click', () => {
      invalidate();
      try {
        const values = fit(parseSamples(text.value));
        const valid = Math.abs(values.slope) <= range;
        const indicators = [['样本量', values.count], ['拟合斜率', values.slope], ['截距（百分点）', values.intercept], ['拟合优度 R²', values.rSquared]];
        result.innerHTML = indicators.map(([label, value]) => '<div><dt>' + label + '</dt><dd>' + display(value) + '</dd></div>').join('');
        result.hidden = false;
        computed = { ...values, key: selection().key };
        applyButton.disabled = !valid;
        if (!valid) showStatus('斜率超出模型可应用范围，请检查样本口径和异常值。', true);
        else if (values.count < 8) showStatus('样本量较小，建议补充更多期间后复核。');
      } catch (error) {
        showStatus(error.message, true);
      }
    });
    applyButton.addEventListener('click', () => {
      if (!computed || computed.key !== selection().key) return;
      const { key, ...values } = computed;
      const stored = saveRecord(key, { ...values, source: source.value.trim() || '手动录入', appliedAt: new Date().toISOString() });
      refreshCurrent();
      showStatus(stored ? '已应用。后续测算使用校准系数。' : '已应用到当前会话，浏览器存储暂不可用。');
      applyButton.disabled = true;
      onApplied?.();
    });
    reset.addEventListener('click', () => {
      const stored = saveRecord(selection().key, null);
      invalidate();
      refreshCurrent();
      showStatus(stored ? '已恢复示例系数。' : '当前会话已恢复示例系数。');
      onApplied?.();
    });
    refreshCurrent();
  }

  window.zhiyanRiskCalibration = { apply, fit, mount, parseSamples };
})();

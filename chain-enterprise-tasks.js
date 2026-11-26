(function () {
  'use strict';

  const viewId = 'chainEnterpriseTaskDetail';
  const demoTitle = '新能源汽车产业链';
  const demoChainId = 'sample-nev';
  const sample = {
    taskId: 'sample-enterprise-chain', chainId: demoChainId, title: demoTitle,
    category: '新能源汽车', mode: '单条上链', completedAt: '2026-11-26T02:13:00.000Z',
    scope: { province: '江苏省', city: '海州市', district: '全部区县及园区', status: '存续及在业', types: ['规上企业', '高新技术企业'] },
    threshold: 70, nodes: 86, previousCount: 314, addedCount: 12, totalCount: 326, sample: true
  };
  const formatter = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Asia/Shanghai' });
  const formatNumber = new Intl.NumberFormat('zh-CN');
  const fallbackIdentities = new WeakMap();
  const byId = id => document.getElementById(id);
  const allRows = () => typeof knowledgeBaseConfigs === 'undefined' ? [] : knowledgeBaseConfigs.chain.rows;
  const count = value => Number(String(value ?? '').replace(/\D/g, '')) || 0;
  const nodeCount = row => Array.isArray(row.graphNodes) ? row.graphNodes.length : count(row.nodes);
  const uniqueId = () => window.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const rangeModal = byId('chainEnterpriseRangeModalV47');
  const runButton = byId('runChainEnterpriseBtnV47');
  let pending;

  function chainId(row) {
    const persisted = window.getChainGraphRecordId?.(row);
    if (persisted) return persisted;
    if (!fallbackIdentities.has(row)) fallbackIdentities.set(row, `session:${uniqueId()}`);
    return fallbackIdentities.get(row);
  }

  function scopeFromForm() {
    return {
      province: byId('chainProvinceV47').value,
      city: byId('chainCityV47').value,
      district: byId('chainDistrictV47').value,
      status: byId('chainBusinessStatusV47').value,
      types: Array.from(document.querySelectorAll('#chainTypeOptionsV47 button.active'), button => button.textContent.trim())
    };
  }

  function restoreRunButton() {
    runButton.disabled = false;
    runButton.textContent = '开始企业上链';
  }

  function cancel() {
    if (!pending) return;
    clearTimeout(pending.timer);
    pending = null;
    restoreRunButton();
  }

  function finish(job) {
    if (pending !== job) return;
    if (!rangeModal.classList.contains('open')) { cancel(); return; }
    const rows = allRows();
    const completedAt = new Date().toISOString();
    const ready = job.targetRows.filter(row => rows.includes(row));
    const tasks = ready.map((row, index) => {
      const previousCount = count(row.companies);
      const addedCount = 12; // The original static prototype supplies a fixed illustrative total for each chain.
      return {
        row,
        snapshot: {
          taskId: job.batch ? `${job.id}-${index + 1}` : job.id,
          batchId: job.batch ? job.id : '', chainId: chainId(row), title: row.title, category: row.category || '—',
          mode: job.batch ? '批量上链' : '单条上链', completedAt, scope: job.scope, threshold: 70,
          nodes: nodeCount(row), previousCount, addedCount, totalCount: previousCount + addedCount
        }
      };
    });
    pending = null;
    restoreRunButton();
    if (!tasks.length) { window.toast?.('当前没有可完成上链的产业链'); return; }

    tasks.forEach(({ row, snapshot }) => {
      row.companies = `${snapshot.totalCount} 家`;
      row.lastLinkRegion = [snapshot.scope.province, snapshot.scope.city].join(' / ');
      window.zhiyanReportNotifications?.complete({
        id: snapshot.taskId, kind: 'chain', subject: snapshot.title,
        context: { taskId: snapshot.taskId, chainId: snapshot.chainId, snapshot }
      });
    });
    window.closeChainEnterpriseRangeV47();
    window.renderKnowledgeList?.();
    window.toast?.(job.batch ? `企业上链已完成 ${tasks.length} 条产业链` : '企业上链完成，可在消息通知中查看当次任务');
  }

  function start(targets, batch) {
    if (!rangeModal?.classList.contains('open') || pending) return false;
    const scope = scopeFromForm();
    if (!scope.types.length) { window.toast?.('请至少选择一种企业类型'); return false; }
    const rows = allRows();
    const targetRows = [...new Set(Array.isArray(targets) ? targets : [])].filter(row => row?.title && rows.includes(row));
    if (!targetRows.length) { window.toast?.('请先选择要执行企业上链的产业链'); return false; }
    if (!targetRows.every(row => nodeCount(row) > 0)) {
      window.toast?.('所选产业链含无节点的图谱，请补全骨架后再上链');
      return false;
    }
    const job = { id: `chain-link-${uniqueId()}`, targetRows, batch: Boolean(batch), scope };
    pending = job;
    runButton.disabled = true;
    runButton.textContent = 'AI 正在识别并匹配…';
    job.timer = setTimeout(() => finish(job), 900);
    return true;
  }

  function activeRowIndex(task) {
    const lookupId = task.chainId === demoChainId ? `seed:${demoTitle}` : task.chainId;
    return allRows().findIndex(row => chainId(row) === lookupId);
  }

  function snapshotFor(context) {
    if (!context?.taskId || !context.chainId) return null;
    if (context.taskId === sample.taskId && context.chainId === sample.chainId) return sample;
    const task = context.snapshot;
    if (task?.taskId !== context.taskId || task.chainId !== context.chainId || !task.title || !task.scope) return null;
    if (![task.nodes, task.previousCount, task.addedCount, task.totalCount].every(Number.isFinite)) return null;
    return Number.isFinite(Date.parse(task.completedAt)) ? task : null;
  }

  function returnToChainLibrary() {
    if (location.hash.startsWith('#report-notice=')) history.replaceState(history.state, '', location.href.split('#')[0]);
    window.openKnowledgeBase?.('chain');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function buildView() {
    const existing = byId(viewId);
    if (existing) return existing;
    const main = document.querySelector('.main');
    if (!main) return null;
    const view = document.createElement('section');
    view.id = viewId;
    view.className = 'content view cet-detail';
    view.setAttribute('aria-labelledby', 'chainEnterpriseTaskTitle');
    view.innerHTML = `
      <div class="cet-breadcrumb"><button type="button" class="secondary" data-cet-back>‹ 返回产业链库</button><span>精品知识库 / 产业链库 / 企业上链任务</span></div>
      <header class="cet-header">
        <div><p>企业上链任务详情</p><h1 id="chainEnterpriseTaskTitle"></h1><p class="cet-task-id"></p></div>
        <div class="cet-header-actions"><span class="cet-status">已完成</span><button type="button" class="secondary" data-cet-current>查看当前挂靠关系</button></div>
      </header>
      <dl class="cet-counts" aria-label="当次企业上链统计">
        <div><dt>执行前链上企业</dt><dd data-cet-stat="previousCount"></dd></div>
        <div><dt>本次新增关联</dt><dd data-cet-stat="addedCount"></dd></div>
        <div><dt>执行后链上企业</dt><dd data-cet-stat="totalCount"></dd></div>
      </dl>
      <section class="cet-panel" aria-labelledby="cetParameters"><h2 id="cetParameters">执行范围</h2><dl class="cet-parameters" data-cet-parameters></dl></section>
      <p class="cet-note">原型以示例统计呈现企业上链结果。当次任务保存统计与执行条件，企业关系可在产业链库查看。</p>`;
    main.appendChild(view);
    view.querySelector('[data-cet-back]').addEventListener('click', returnToChainLibrary);
    return view;
  }

  function reopen(context) {
    const task = snapshotFor(context);
    if (!task || typeof window.show !== 'function') return false;
    const view = buildView();
    if (!view) return false;
    byId('chainEnterpriseTaskTitle').textContent = task.title;
    view.querySelector('.cet-task-id').textContent = `任务编号 ${task.taskId}`;
    view.querySelectorAll('[data-cet-stat]').forEach(element => { element.textContent = `${formatNumber.format(task[element.dataset.cetStat])} 家`; });
    const details = [
      ['完成时间', formatter.format(new Date(task.completedAt))], ['执行方式', task.mode],
      ['产业分类', task.category], ['参与节点', `${formatNumber.format(task.nodes)} 个`],
      ['企业地区', [task.scope.province, task.scope.city, task.scope.district].filter(Boolean).join(' / ')], ['经营状态', task.scope.status],
      ['企业类型', task.scope.types?.join('、')], ['节点匹配阈值', `≥ ${task.threshold}%`]
    ];
    if (task.batchId) details.push(['批次编号', task.batchId]);
    const values = details.map(([label, value]) => {
      const wrapper = document.createElement('div');
      const name = document.createElement('dt');
      const text = document.createElement('dd');
      name.textContent = label;
      text.textContent = value || '—';
      wrapper.append(name, text);
      return wrapper;
    });
    view.querySelector('[data-cet-parameters]').replaceChildren(...values);
    const current = view.querySelector('[data-cet-current]');
    current.hidden = activeRowIndex(task) < 0 || typeof window.openChainCompanyManagerV49 !== 'function';
    current.onclick = () => {
      const index = activeRowIndex(task);
      if (index >= 0) window.openChainCompanyManagerV49(index);
      else window.toast?.('当前产业链已从产业链库移除');
    };
    if (typeof names !== 'undefined') names[viewId] = '企业上链任务详情';
    window.show(viewId);
    window.scrollTo({ top: 0, behavior: 'auto' });
    return true;
  }

  window.zhiyanEnterpriseChainTasks = { start, cancel };
  window.reopenEnterpriseChainNotice = reopen;

  rangeModal?.addEventListener('click', event => {
    if (event.target === rangeModal) window.closeChainEnterpriseRangeV47();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && rangeModal?.classList.contains('open')) {
      event.preventDefault();
      window.closeChainEnterpriseRangeV47();
    }
  });
})();

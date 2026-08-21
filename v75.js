(function () {
  'use strict';
  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function setPreferenceDefaultsV75(mode) {
    const modal = q('#nodeFilterModalV61');
    if (!modal) return;
    const title = q('#nodeFilterTitleV61');
    const chain = q('#nodeFilterChainV61');
    const node = q('#nodeFilterNodeV61');
    const scale = q('#nodeFilterScaleV61');
    const years = q('#nodeFilterYearsV65');
    const region = q('#nodeFilterRegionV61');
    const honor = q('#nodeFilterHonorV61');
    const confirm = q('#nodeFilterConfirmV61');

    if (scale) scale.value = '5000万—1亿元';
    if (years) years.value = '3—5 年';
    if (region) region.value = '长三角';
    if (honor) honor.value = '科技型中小企业';

    if (mode === 'whole') {
      if (title) title.textContent = '整体强链补链分析招商偏好';
      if (chain) chain.textContent = q('#localChainSelect')?.selectedOptions?.[0]?.textContent.replace(/^本地热门\s*·\s*/, '') || '新能源汽车产业链';
      if (node) node.textContent = '全链关键薄弱节点';
      if (confirm) {
        confirm.textContent = '确认偏好并生成报告';
        confirm.onclick = window.confirmWholePreferenceV75;
      }
    } else {
      if (title) title.textContent = '招商补强企业偏好';
      if (confirm) {
        confirm.textContent = '确认并开始推荐';
        confirm.onclick = window.confirmNodeFilterV61;
      }
    }
  }

  function patchLocalSummaryV75() {
    const modal = q('#nodeCompanyModal');
    const summary = q('#nodeCompanySummary');
    if (!modal || !summary) return;
    const isLocal = /本地/.test(q('#nodeCompanyTitle')?.textContent || '') && !/推荐企业/.test(q('#nodeCompanyTitle')?.textContent || '');
    modal.classList.toggle('local-layout-v75', isLocal);
    if (!isLocal) return;
    qa('.metric-static', summary).forEach((item) => {
      if (item.textContent.includes('平均协同度')) item.remove();
    });
  }

  function combineReportModulesV75() {
    const report = q('#chainReportV58');
    const gapRoot = q('#chainReportGapsV58');
    const recommend = q('#chainReportV58 .chain-report-recommend-v58');
    if (!report || !gapRoot || !recommend) return false;
    const gapSection = gapRoot.closest('section');
    if (!gapSection) return false;
    gapSection.classList.add('combined-chain-report-v75');
    recommend.classList.add('combined-recommend-v75');
    if (recommend.parentElement !== gapSection) gapSection.appendChild(recommend);
    q('#chainReportAllGapV72')?.remove();

    const first = q('.gap-card-v58', gapRoot);
    const label = first?.dataset.gapV72 || q('b', first)?.textContent.trim();
    if (first && label && gapRoot.dataset.defaultPriorityV75 !== '1' && typeof window.filterWholeReportByGapV72 === 'function') {
      gapRoot.dataset.defaultPriorityV75 = '1';
      window.filterWholeReportByGapV72(label);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 60);
    }
    return true;
  }

  function watchGeneratedReportV75() {
    const gapRoot = q('#chainReportGapsV58');
    if (gapRoot) delete gapRoot.dataset.defaultPriorityV75;
    const started = Date.now();
    const timer = setInterval(() => {
      const onReport = (q('#crumb')?.textContent || '').includes('产业链整体分析报告');
      if (onReport && combineReportModulesV75()) clearInterval(timer);
      if (Date.now() - started > 9000) clearInterval(timer);
    }, 180);
  }

  const runWholeReportV75 = window.openWholeChainReportV58;
  const openNodePreferenceV75 = window.openNodeFilterV61;

  window.openNodeFilterV61 = function () {
    const result = typeof openNodePreferenceV75 === 'function' ? openNodePreferenceV75.apply(this, arguments) : undefined;
    setTimeout(() => setPreferenceDefaultsV75('node'), 20);
    return result;
  };

  window.openWholeChainReportV58 = function () {
    if (typeof openNodePreferenceV75 !== 'function') return runWholeReportV75?.apply(this, arguments);
    openNodePreferenceV75.call(this);
    setTimeout(() => setPreferenceDefaultsV75('whole'), 20);
  };

  window.confirmWholePreferenceV75 = function () {
    const button = q('#nodeFilterConfirmV61');
    if (button) { button.disabled = true; button.textContent = '正在确认招商偏好…'; }
    setTimeout(() => {
      if (typeof window.closeNodeFilterV61 === 'function') window.closeNodeFilterV61();
      if (button) { button.disabled = false; button.textContent = '确认偏好并生成报告'; }
      if (typeof runWholeReportV75 === 'function') runWholeReportV75();
      watchGeneratedReportV75();
    }, 420);
  };

  const previousNodeListV75 = window.openNodeCompanyList;
  if (typeof previousNodeListV75 === 'function') {
    window.openNodeCompanyList = function () {
      const result = previousNodeListV75.apply(this, arguments);
      setTimeout(patchLocalSummaryV75, 120);
      setTimeout(patchLocalSummaryV75, 260);
      return result;
    };
  }

  const summary = q('#nodeCompanySummary');
  if (summary) new MutationObserver(() => setTimeout(patchLocalSummaryV75, 0)).observe(summary, { childList: true });

  const mainButton = q('.radar-recommend-btn');
  if (mainButton) mainButton.onclick = window.openWholeChainReportV58;
  patchLocalSummaryV75();
  combineReportModulesV75();
})();

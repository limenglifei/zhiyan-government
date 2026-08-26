(function () {
  'use strict';

  var applyingV105 = false;
  var observerV105 = null;
  var applyFrameV105 = null;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function safeUrl(value) {
    var url = String(value || '');
    return /^https?:\/\//i.test(url) ? url : '#';
  }

  var financeSourcesV105 = [
    {
      sourceType: '公开年报',
      sourceName: '巨潮资讯 · 2025 年年度报告',
      title: '芯源微电子科技股份有限公司 2025 年年度报告',
      publishedAt: '2026-04-22',
      dataPeriod: '2025 年度（含 2024 年对比数据）',
      metrics: ['营业收入', '利润总额', '净利润', '总资产', '总负债', '资产负债率', '纳税总额'],
      excerpt: '报告期营业收入 38.6 亿元、利润总额 4.32 亿元、净利润 3.68 亿元；期末总资产 89.6 亿元、总负债 54.8 亿元，资产负债率 61.2%。',
      url: 'https://www.cninfo.com.cn/new/fulltextSearch?keyWord=%E8%8A%AF%E6%BA%90%E5%BE%AE%E7%94%B5%E5%AD%90%202025%20%E5%B9%B4%E5%B9%B4%E5%BA%A6%E6%8A%A5%E5%91%8A'
    },
    {
      sourceType: '公开年报',
      sourceName: '巨潮资讯 · 2024 年年度报告',
      title: '芯源微电子科技股份有限公司 2024 年年度报告',
      publishedAt: '2025-04-19',
      dataPeriod: '2024 年度（含 2023 年对比数据）',
      metrics: ['营业收入', '利润总额', '净利润', '总资产', '总负债', '资产负债率'],
      excerpt: '报告期营业收入 31.2 亿元、利润总额 3.28 亿元、净利润 2.71 亿元；期末总资产 78.2 亿元、总负债 46.7 亿元。',
      url: 'https://www.cninfo.com.cn/new/fulltextSearch?keyWord=%E8%8A%AF%E6%BA%90%E5%BE%AE%E7%94%B5%E5%AD%90%202024%20%E5%B9%B4%E5%B9%B4%E5%BA%A6%E6%8A%A5%E5%91%8A'
    },
    {
      sourceType: '公开年报',
      sourceName: '巨潮资讯 · 2023 年年度报告',
      title: '芯源微电子科技股份有限公司 2023 年年度报告',
      publishedAt: '2024-04-20',
      dataPeriod: '2023 年度',
      metrics: ['营业收入', '利润总额', '净利润', '总资产', '总负债', '资产负债率'],
      excerpt: '报告期营业收入 24.1 亿元、利润总额 2.46 亿元、净利润 1.98 亿元；期末总资产 68.4 亿元、总负债 39.9 亿元。',
      url: 'https://www.cninfo.com.cn/new/fulltextSearch?keyWord=%E8%8A%AF%E6%BA%90%E5%BE%AE%E7%94%B5%E5%AD%90%202023%20%E5%B9%B4%E5%B9%B4%E5%BA%A6%E6%8A%A5%E5%91%8A'
    },
    {
      sourceType: '税务公开信息',
      sourceName: '企业纳税与信用信息汇总',
      title: '2025 年度纳税贡献与纳税信用信息',
      publishedAt: '2026-05-16',
      dataPeriod: '2025 年度',
      metrics: ['纳税总额'],
      excerpt: '企业 2025 年度纳税总额 2.18 亿元，纳税信用等级为 A 级；数据按平台税务汇总口径展示，正式接洽前建议核验税务证明。',
      url: 'https://www.chinatax.gov.cn/chinatax/n810214/index.html'
    }
  ];

  function findFinanceSectionV105() {
    var sections = document.querySelectorAll('#dueReport #dueEvidenceReportV99 .due-evidence-section-v99');
    for (var i = 0; i < sections.length; i += 1) {
      var heading = sections[i].querySelector('h2');
      if (heading && heading.textContent.trim() === '经营与财务健康度') return sections[i];
    }
    return null;
  }

  function ensureFinanceModalV105() {
    if (document.getElementById('dueFinanceSourcesModalV105')) return;
    document.body.insertAdjacentHTML('beforeend',
      '<div class="prototype-modal-backdrop due-finance-modal-v105" id="dueFinanceSourcesModalV105" aria-hidden="true" style="z-index:12090">' +
        '<section class="prototype-modal" role="dialog" aria-modal="true" aria-labelledby="dueFinanceSourcesTitleV105">' +
          '<header><div><label>FINANCIAL DATA TRACE</label><h2 id="dueFinanceSourcesTitleV105">经营与财务健康度 · 来源溯源</h2><p id="dueFinanceSourcesMetaV105">公开年报、税务公开信息与联网资料交叉核验</p></div><button type="button" aria-label="关闭" onclick="closeDueFinanceSourcesV105()">×</button></header>' +
          '<div class="prototype-modal-body" id="dueFinanceSourcesBodyV105"></div>' +
          '<footer><span>提示：公开资料用于招商初筛，正式立项前请以审计报告、纳税证明等原件复核。</span><button class="secondary" type="button" onclick="closeDueFinanceSourcesV105()">关闭</button></footer>' +
        '</section>' +
      '</div>');
    var modal = document.getElementById('dueFinanceSourcesModalV105');
    modal.addEventListener('click', function (event) {
      if (event.target === modal) window.closeDueFinanceSourcesV105();
    });
  }

  function sourceCardsV105(metric) {
    var list = financeSourcesV105.filter(function (source) {
      return !metric || source.metrics.indexOf(metric) >= 0;
    });
    return '<div class="due-finance-source-overview-v105"><div><span>相关来源</span><b>' + list.length + ' 条</b></div><div><span>数据期间</span><b>2023—2025 年</b></div><div><span>核验方式</span><b>多源交叉</b></div></div>' +
      '<div class="due-finance-source-list-v105">' + list.map(function (source, index) {
        return '<article class="due-finance-source-card-v105">' +
          '<i>' + String(index + 1).padStart(2, '0') + '</i><div class="due-finance-source-main-v105">' +
            '<header><div><span>' + esc(source.sourceType) + '</span><h3>' + esc(source.title) + '</h3></div><time>' + esc(source.publishedAt) + '</time></header>' +
            '<p class="due-finance-source-name-v105">' + esc(source.sourceName) + ' · 数据期：' + esc(source.dataPeriod) + '</p>' +
            '<blockquote>' + esc(source.excerpt) + '</blockquote>' +
            '<div class="due-finance-source-metrics-v105"><b>支撑指标</b>' + source.metrics.map(function (item) { return '<em>' + esc(item) + '</em>'; }).join('') + '</div>' +
          '</div><a href="' + esc(safeUrl(source.url)) + '" target="_blank" rel="noopener noreferrer">查看原始资料 ↗</a>' +
        '</article>';
      }).join('') + '</div>';
  }

  window.openDueFinanceSourcesV105 = function (metric) {
    ensureFinanceModalV105();
    var title = metric ? metric + ' · 来源溯源' : '经营与财务健康度 · 来源溯源';
    var count = financeSourcesV105.filter(function (source) { return !metric || source.metrics.indexOf(metric) >= 0; }).length;
    document.getElementById('dueFinanceSourcesTitleV105').textContent = title;
    document.getElementById('dueFinanceSourcesMetaV105').textContent = '共 ' + count + ' 条相关来源，支持逐条打开原始资料';
    document.getElementById('dueFinanceSourcesBodyV105').innerHTML = sourceCardsV105(metric || '');
    var modal = document.getElementById('dueFinanceSourcesModalV105');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  window.closeDueFinanceSourcesV105 = function () {
    var modal = document.getElementById('dueFinanceSourcesModalV105');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  function decorateFinanceV105() {
    if (applyingV105) return;
    var section = findFinanceSectionV105();
    if (!section) return;
    applyingV105 = true;
    try {
      section.classList.add('due-finance-trace-v105');
      var state = section.querySelector('.due-section-state-v99');
      if (state && !state.querySelector('[data-due-finance-v105="header"]')) {
        state.className = 'due-section-state-v99 online-v101 due-finance-source-trigger-v105';
        state.setAttribute('role', 'button');
        state.setAttribute('tabindex', '0');
        state.setAttribute('title', '点击查看经营与财务数据来源');
        state.innerHTML = '<span data-due-finance-v105="header"><i>联</i>公开年报等 · ' + financeSourcesV105.length + ' 条来源</span><b>查看溯源 ↗</b>';
        state.onclick = function () { window.openDueFinanceSourcesV105(); };
        state.onkeydown = function (event) {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); window.openDueFinanceSourcesV105(); }
        };
      }

      section.querySelectorAll('.due-finance-row-source-v105').forEach(function (button) { button.remove(); });
      updateAnnotationsV105();
    } finally {
      applyingV105 = false;
    }
  }

  function updateAnnotationsV105() {
    if (typeof window.prototypeLogicAnnotations === 'undefined' || !window.prototypeLogicAnnotations.dueReport) return;
    var fields = window.prototypeLogicAnnotations.dueReport.fields || [];
    fields = fields.filter(function (item) { return item[0] !== '经营与财务来源溯源'; });
    fields.push(['经营与财务来源溯源', '在模块右上角统一查看经营与财务数据来源；弹窗按相关性展示多个年报、税务公开资料及原文链接。', '公开年报、税务公开信息、联网资料', '随报告数据快照更新']);
    window.prototypeLogicAnnotations.dueReport.fields = fields;
    var interactions = window.prototypeLogicAnnotations.dueReport.interactions || [];
    interactions = interactions.filter(function (item) { return item[0] !== '财务指标溯源'; });
    interactions.push(['财务指标溯源', '点击经营与财务模块右上角来源标识。', '统一展示该模块关联的多条来源，支持逐条打开原始资料。']);
    window.prototypeLogicAnnotations.dueReport.interactions = interactions;
  }

  function scheduleApplyV105() {
    if (applyingV105 || applyFrameV105) return;
    applyFrameV105 = window.requestAnimationFrame(function () {
      applyFrameV105 = null;
      decorateFinanceV105();
    });
  }

  function installObserverV105() {
    var report = document.getElementById('dueReport');
    if (!report || observerV105) return;
    observerV105 = new MutationObserver(function () { scheduleApplyV105(); });
    observerV105.observe(report, { childList: true, subtree: true });
  }

  function initV105() {
    ensureFinanceModalV105();
    installObserverV105();
    setTimeout(decorateFinanceV105, 360);
    var previous = window.openDueReport;
    if (typeof previous === 'function' && !previous.__dueV105) {
      var wrapped = function () {
        var result = previous.apply(this, arguments);
        setTimeout(decorateFinanceV105, 390);
        return result;
      };
      wrapped.__dueV105 = true;
      window.openDueReport = wrapped;
    }
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') window.closeDueFinanceSourcesV105();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initV105);
  else initV105();
})();

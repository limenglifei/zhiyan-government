(function () {
  'use strict';

  var financeApplyingV113 = false;
  var financeObserverV113 = null;
  var financeFrameV113 = 0;
  var investmentTabV113 = 'all';
  var investmentQueryV113 = '';
  var investmentPageV113 = 1;
  var investmentPageSizeV113 = 10;

  var financeRowsV113 = [
    ['营业收入', '24.1 亿元', '31.2 亿元', '38.6 亿元'],
    ['利润总额', '2.46 亿元', '3.28 亿元', '4.32 亿元'],
    ['净利润', '1.98 亿元', '2.71 亿元', '3.68 亿元'],
    ['总资产', '68.4 亿元', '78.2 亿元', '89.6 亿元'],
    ['总负债', '39.9 亿元', '46.7 亿元', '54.8 亿元'],
    ['资产负债率', '58.4%', '59.7%', '61.2%'],
    ['纳税总额', '1.26 亿元', '1.68 亿元', '2.18 亿元']
  ];

  function escV113(value) {
    return String(value == null ? '' : value).replace(/[&<>\"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function encV113(value) {
    return encodeURIComponent(String(value == null ? '' : value));
  }

  function companiesV113() {
    return typeof followedInvestmentCompanies !== 'undefined' && Array.isArray(followedInvestmentCompanies) ? followedInvestmentCompanies : [];
  }

  function financeSectionV113() {
    var sections = document.querySelectorAll('#dueEvidenceReportV99 .due-evidence-section-v99');
    for (var i = 0; i < sections.length; i += 1) {
      var marker = sections[i].querySelector('.due-section-number-v99');
      if (marker && marker.textContent.replace(/\s+/g, '') === '04') return sections[i];
    }
    return null;
  }

  function financeTableV113() {
    var shell = document.createElement('div');
    shell.className = 'due-finance-table-shell-v113';
    shell.innerHTML = '<table class="due-finance-table-v113" aria-label="经营与财务健康度三年统计表">' +
      '<thead><tr><th scope="col">指标</th><th scope="col">2023 年</th><th scope="col">2024 年</th><th scope="col">2025 年</th></tr></thead>' +
      '<tbody>' + financeRowsV113.map(function (row) {
        return '<tr><th scope="row">' + escV113(row[0]) + '</th><td>' + escV113(row[1]) + '</td><td>' + escV113(row[2]) + '</td><td>' + escV113(row[3]) + '</td></tr>';
      }).join('') + '</tbody></table>' +
      '<div class="due-finance-table-note-v113"><i>i</i><p><b>统计口径：</b>展示报告数据快照中的近三年原始财务值；金额统一使用亿元，资产负债率使用百分比。模块右上角可统一查看公开年报、税务公开信息及联网资料来源。</p></div>';
    return shell;
  }

  function renderFinanceTableV113() {
    var section = financeSectionV113();
    if (!section) return;
    var current = section.querySelector('.due-finance-table-shell-v113');
    if (current) {
      section.querySelectorAll('.due-finance-combined-v112, .due-finance-trends-v111, .due-trend-table-v99').forEach(function (node) { node.remove(); });
      return;
    }
    var old = section.querySelector('.due-finance-combined-v112, .due-finance-trends-v111, .due-trend-table-v99');
    var table = financeTableV113();
    if (old) old.replaceWith(table);
    else {
      var anchor = section.querySelector('.due-analysis-v99, .due-source-footer-v99');
      if (anchor) section.insertBefore(table, anchor);
      else section.appendChild(table);
    }
    section.querySelectorAll('.due-finance-combined-v112, .due-finance-trends-v111, .due-trend-table-v99').forEach(function (node) { node.remove(); });
  }

  function scheduleFinanceV113(delay) {
    setTimeout(function () {
      if (financeFrameV113) cancelAnimationFrame(financeFrameV113);
      financeFrameV113 = requestAnimationFrame(function () {
        financeFrameV113 = 0;
        if (financeApplyingV113) return;
        financeApplyingV113 = true;
        try { renderFinanceTableV113(); }
        finally { financeApplyingV113 = false; }
      });
    }, delay || 0);
  }

  function isLocalV113(item) {
    if (item && item.listType) return item.listType === 'local';
    return /海州/.test(String(item && item.location || ''));
  }

  function stateV113(item) {
    if (item && item.priorityFollowed) return ['重点跟进', 'priority'];
    if (item && item.riskPending) return ['风险待核验', 'risk'];
    if (item && item.status === 'report') return ['已尽调', 'report'];
    return ['待尽调', 'pending'];
  }

  function queryPoolV113() {
    var query = investmentQueryV113.toLowerCase();
    return companiesV113().filter(function (item) {
      if (!query) return true;
      return [item.name, item.track, item.location].some(function (value) {
        return String(value || '').toLowerCase().indexOf(query) >= 0;
      });
    });
  }

  function tabPoolV113() {
    return queryPoolV113().filter(function (item) {
      if (investmentTabV113 === 'local') return isLocalV113(item);
      if (investmentTabV113 === 'external') return !isLocalV113(item);
      return true;
    });
  }

  function renderInvestmentHomeV113() {
    var panel = document.getElementById('investmentHomeV113');
    if (!panel) return;
    var queryPool = queryPoolV113();
    var localCount = queryPool.filter(isLocalV113).length;
    var externalCount = queryPool.length - localCount;
    panel.querySelectorAll('[data-investment-tab-v113]').forEach(function (button) {
      var value = button.getAttribute('data-investment-tab-v113');
      var count = value === 'local' ? localCount : value === 'external' ? externalCount : queryPool.length;
      button.classList.toggle('active', value === investmentTabV113);
      button.setAttribute('aria-selected', String(value === investmentTabV113));
      var countNode = button.querySelector('b');
      if (countNode) countNode.textContent = count;
    });

    var rows = tabPoolV113();
    var pages = Math.max(1, Math.ceil(rows.length / investmentPageSizeV113));
    if (investmentPageV113 > pages) investmentPageV113 = pages;
    var visible = rows.slice((investmentPageV113 - 1) * investmentPageSizeV113, investmentPageV113 * investmentPageSizeV113);
    var body = document.getElementById('investmentHomeRowsV113');
    if (body) {
      body.innerHTML = visible.map(function (item) {
        var local = isLocalV113(item);
        var status = stateV113(item);
        var reportReady = item.status === 'report' || item.priorityFollowed || item.riskPending;
        var encoded = encV113(item.name);
        var action = reportReady ? 'openDueReport' : 'startDueFromFollowed';
        var label = reportReady ? '查看尽调报告' : '去尽调';
        return '<tr><td><b>' + escV113(item.name) + '</b><span>招商关注企业</span></td>' +
          '<td><em class="investment-list-type-v113 ' + (local ? 'local' : 'external') + '">' + (local ? '本地培育' : '外地招商') + '</em></td>' +
          '<td>' + escV113(item.track || '重点产业链') + '</td><td>' + escV113(item.location || '待核验') + '</td>' +
          '<td><strong>' + escV113(item.fit == null ? '—' : item.fit + '%') + '</strong></td>' +
          '<td>' + escV113(item.followedAt || '—') + '</td><td><span class="investment-home-status-v113 ' + status[1] + '">' + status[0] + '</span></td>' +
          '<td><button type="button" onclick="' + action + '(decodeURIComponent(\'' + encoded + '\'))">' + label + '</button></td></tr>';
      }).join('') || '<tr><td colspan="8"><div class="investment-home-empty-v113">未找到符合当前条件的关注企业，请调整关键词或切换名单页签。</div></td></tr>';
    }
    var result = document.getElementById('investmentHomeResultV113');
    if (result) result.textContent = '共 ' + rows.length + ' 家企业' + (investmentQueryV113 ? ' · 关键词“' + investmentQueryV113 + '”' : '');
    var pager = document.getElementById('investmentHomePagerV113');
    if (pager) pager.innerHTML = '<span>每页 ' + investmentPageSizeV113 + ' 家</span><div><button type="button" onclick="setInvestmentHomePageV113(' + (investmentPageV113 - 1) + ')"' + (investmentPageV113 === 1 ? ' disabled' : '') + '>上一页</button><em>第 ' + investmentPageV113 + ' / ' + pages + ' 页</em><button type="button" onclick="setInvestmentHomePageV113(' + (investmentPageV113 + 1) + ')"' + (investmentPageV113 === pages ? ' disabled' : '') + '>下一页</button></div>';
  }

  function ensureInvestmentHomeV113() {
    var view = document.getElementById('investment');
    if (!view || document.getElementById('investmentHomeV113')) return;
    var home = document.createElement('section');
    home.id = 'investmentHomeV113';
    home.className = 'investment-home-v113';
    home.innerHTML = '<section class="card investment-home-hero-v113"><div class="investment-home-copy-v113"><i>⌖</i><div><label>INVESTMENT LEAD DISCOVERY</label><h2>从关注企业与产业缺口出发，持续发现招商线索</h2><p>搜索已关注企业，或进入产业链补强分析识别新的外地招商目标。</p></div></div>' +
      '<form class="investment-home-search-v113" onsubmit="searchInvestmentHomeV113(event)"><span>⌕</span><input id="investmentHomeSearchV113" autocomplete="off" placeholder="输入企业名称、产业赛道或地区搜索"><button class="primary" type="submit">搜索企业</button></form>' +
      '<button class="secondary investment-enter-chain-v113" type="button" onclick="openInvestmentWorkspaceV113()">进入产业链补强分析 →</button></section>' +
      '<section class="card investment-home-list-v113"><header><div><h2>我的招商关注企业</h2><p>统一管理本地培育与外地招商关注对象，衔接企业尽调和后续跟进。</p></div><span id="investmentHomeResultV113">共 0 家企业</span></header>' +
      '<nav class="investment-home-tabs-v113" role="tablist"><button class="active" type="button" data-investment-tab-v113="all" role="tab" aria-selected="true" onclick="setInvestmentHomeTabV113(\'all\')"><span>我的关注全部名单</span><b>0</b></button><button type="button" data-investment-tab-v113="local" role="tab" aria-selected="false" onclick="setInvestmentHomeTabV113(\'local\')"><span>本地培育</span><b>0</b></button><button type="button" data-investment-tab-v113="external" role="tab" aria-selected="false" onclick="setInvestmentHomeTabV113(\'external\')"><span>外地招商关注</span><b>0</b></button></nav>' +
      '<div class="investment-home-table-wrap-v113"><table><thead><tr><th>企业名称</th><th>名单类型</th><th>重点赛道</th><th>所在地</th><th>招商适配度</th><th>纳入关注时间</th><th>尽调状态</th><th>操作</th></tr></thead><tbody id="investmentHomeRowsV113"></tbody></table></div><footer id="investmentHomePagerV113" class="investment-home-pager-v113"></footer></section>';
    var head = view.querySelector('.head.radar-head');
    if (head) head.insertAdjacentElement('afterend', home);
    else view.insertBefore(home, view.firstChild);
    view.classList.add('investment-home-active-v113');
    renderInvestmentHomeV113();
  }

  window.searchInvestmentHomeV113 = function (event) {
    if (event && event.preventDefault) event.preventDefault();
    var input = document.getElementById('investmentHomeSearchV113');
    investmentQueryV113 = input ? input.value.trim() : '';
    investmentPageV113 = 1;
    renderInvestmentHomeV113();
    if (typeof toast === 'function') toast(investmentQueryV113 ? '已按“' + investmentQueryV113 + '”筛选招商关注企业' : '已展示全部招商关注企业');
  };

  window.setInvestmentHomeTabV113 = function (value) {
    if (['all', 'local', 'external'].indexOf(value) < 0) return;
    investmentTabV113 = value;
    investmentPageV113 = 1;
    renderInvestmentHomeV113();
  };

  window.setInvestmentHomePageV113 = function (value) {
    var pages = Math.max(1, Math.ceil(tabPoolV113().length / investmentPageSizeV113));
    investmentPageV113 = Math.min(pages, Math.max(1, Number(value) || 1));
    renderInvestmentHomeV113();
  };

  window.openInvestmentHomeV113 = function () {
    ensureInvestmentHomeV113();
    var view = document.getElementById('investment');
    if (view) view.classList.add('investment-home-active-v113');
    investmentPageV113 = 1;
    renderInvestmentHomeV113();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.openInvestmentWorkspaceV113 = function () {
    var view = document.getElementById('investment');
    if (view) view.classList.remove('investment-home-active-v113');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function bindInvestmentNavV113() {
    var nav = document.querySelector('.side .nav[data-view="investment"]');
    if (!nav || nav.dataset.homeV113 === '1') return;
    nav.dataset.homeV113 = '1';
    nav.onclick = function () {
      if (typeof show === 'function') show('investment');
      window.openInvestmentHomeV113();
    };
  }

  function wrapInvestmentAddV113() {
    if (typeof window.addInvestmentTarget !== 'function' || window.addInvestmentTarget.__homeV113) return;
    var previous = window.addInvestmentTarget;
    var wrapped = function () {
      var result = previous.apply(this, arguments);
      setTimeout(renderInvestmentHomeV113, 40);
      return result;
    };
    wrapped.__homeV113 = true;
    window.addInvestmentTarget = wrapped;
  }

  function updateAnnotationsV113() {
    if (!window.prototypeLogicAnnotations) return;
    var report = window.prototypeLogicAnnotations.dueReport;
    if (report) {
      report.fields = (report.fields || []).filter(function (item) {
        return !item || ['经营与财务统一趋势图', '经营与财务趋势图', '经营与财务统计表', '经营与财务三年统计表'].indexOf(item[0]) < 0;
      });
      report.fields.push(['经营与财务三年统计表', '按指标展示营业收入、利润总额、净利润、总资产、总负债、资产负债率和纳税总额的 2023—2025 年原始值；不展示趋势判断和字段性质。', '企业库财务字段、公开年报、税务公开信息及联网资料', '随报告数据快照更新']);
    }
    var investment = window.prototypeLogicAnnotations.investment;
    if (investment) {
      investment.fields = (investment.fields || []).filter(function (item) { return !item || item[0] !== '招商线索雷达首页'; });
      investment.fields.push(['招商线索雷达首页', '集中展示我的关注全部名单、本地培育和外地招商关注三类企业，支持按企业名称、产业赛道或地区搜索及分页。', '招商关注名单、企业库、尽调状态与产业链标签', '关注状态变化后实时刷新']);
      investment.interactions = (investment.interactions || []).filter(function (item) { return !item || item[0] !== '招商首页进入产业链分析'; });
      investment.interactions.push(['招商首页进入产业链分析', '点击“进入产业链补强分析”。', '切换至原产业链图谱工作区；节点分析、整体分析报告及返回链路保持原有交互。']);
    }
  }

  function initV113() {
    ensureInvestmentHomeV113();
    bindInvestmentNavV113();
    wrapInvestmentAddV113();
    updateAnnotationsV113();
    setTimeout(renderInvestmentHomeV113, 160);
    setTimeout(renderInvestmentHomeV113, 1050);
    scheduleFinanceV113(45);
    scheduleFinanceV113(1050);

    var report = document.getElementById('dueReport');
    if (report && !financeObserverV113) {
      financeObserverV113 = new MutationObserver(function () {
        if (!financeApplyingV113) scheduleFinanceV113(35);
      });
      financeObserverV113.observe(report, { childList: true, subtree: true });
    }
    if (typeof window.openDueReport === 'function' && !window.openDueReport.__dueV113Wrapped) {
      var previous = window.openDueReport;
      var wrapped = function () {
        var result = previous.apply(this, arguments);
        scheduleFinanceV113(40);
        scheduleFinanceV113(1080);
        return result;
      };
      wrapped.__dueV113Wrapped = true;
      window.openDueReport = wrapped;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initV113, { once: true });
  else initV113();
}());

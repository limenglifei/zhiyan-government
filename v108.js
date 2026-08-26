(function () {
  var applyingV108 = false;
  var frameV108 = 0;
  var observerV108 = null;

  function normalText(value) {
    return String(value || '').replace(/\s+/g, '').trim();
  }

  function reportSectionsV108() {
    return Array.prototype.slice.call(document.querySelectorAll('#dueEvidenceReportV99 .due-evidence-section-v99'));
  }

  function sectionTitleV108(section) {
    var heading = section && section.querySelector('.due-section-title-v99 h2, h2');
    return normalText(heading ? heading.textContent : '');
  }

  function findSectionV108(titles) {
    var expected = Array.isArray(titles) ? titles : [titles];
    var sections = reportSectionsV108();
    for (var i = 0; i < sections.length; i += 1) {
      var title = sectionTitleV108(sections[i]);
      if (expected.some(function (item) { return title === normalText(item); })) return sections[i];
    }
    return null;
  }

  function removeSelectedAnalysisV108() {
    var targets = ['01', '03', '05', '07', '09'];
    reportSectionsV108().forEach(function (section) {
      var number = section.querySelector('.due-section-number-v99');
      if (!number || targets.indexOf(normalText(number.textContent)) === -1) return;
      section.querySelectorAll('.due-analysis-v99').forEach(function (node) { node.remove(); });
    });
  }

  function removeFinanceTrendV108() {
    var section = findSectionV108('经营与财务健康度');
    if (!section) return;
    var table = section.querySelector('.due-trend-table-v99');
    if (!table) return;
    var headers = Array.prototype.slice.call(table.querySelectorAll('thead th'));
    var trendIndex = headers.findIndex(function (item) { return normalText(item.textContent) === '趋势判断'; });
    if (trendIndex < 0) return;
    Array.prototype.slice.call(table.rows).forEach(function (row) {
      if (row.cells && row.cells[trendIndex]) row.deleteCell(trendIndex);
    });
  }

  function renderRiskMetricsV108() {
    var section = findSectionV108(['信用与司法风险', '信用、司法与园区准入风险']);
    if (!section) return;
    var oldTable = section.querySelector('.due-risk-table-v99');
    var grid = section.querySelector('.due-risk-metrics-v108');
    if (!grid) {
      grid = document.createElement('div');
      grid.className = 'due-risk-metrics-v108';
      grid.setAttribute('role', 'list');
      grid.innerHTML =
        '<article class="clear" role="listitem"><span>严重违法</span><b>0 <small>条</small></b></article>' +
        '<article class="clear" role="listitem"><span>失信被执行人</span><b>0 <small>条</small></b></article>' +
        '<article class="attention" role="listitem"><span>司法诉讼</span><b>4 <small>起</small></b></article>' +
        '<article class="clear" role="listitem"><span>劳动纠纷</span><b>0 <small>起</small></b></article>' +
        '<article class="attention" role="listitem"><span>行政处罚</span><b>1 <small>条</small></b></article>' +
        '<article class="clear" role="listitem"><span>环保处罚</span><b>0 <small>条</small></b></article>' +
        '<article class="clear" role="listitem"><span>安全生产处罚</span><b>0 <small>条</small></b></article>';
      var analysis = section.querySelector('.due-analysis-v99');
      section.insertBefore(grid, oldTable || analysis || section.querySelector('.due-source-footer-v99'));
    }
    if (oldTable) oldTable.remove();
  }

  function updateAnnotationsV108() {
    if (!window.prototypeLogicAnnotations || !window.prototypeLogicAnnotations.dueReport) return;
    var fields = window.prototypeLogicAnnotations.dueReport.fields || [];
    fields = fields.filter(function (item) {
      return item[0] !== '章节AI招商分析' && item[0] !== '经营与财务趋势判断' && item[0] !== '信用与司法风险维度';
    });
    fields.push(['章节AI招商分析', '第 01、03、05、07、09 章仅展示事实、来源及行动内容，不再重复展示 AI 招商分析块。', '报告章节配置', '随模板版本更新']);
    fields.push(['经营与财务趋势判断', '财务指标仅展示近三年结构化数值，趋势判断列不再展示；模块级来源仍可统一溯源。', '企业库财务字段、公开年报', '随报告数据快照更新']);
    fields.push(['信用与司法风险维度', '风险维度以独立字段卡展示，仅呈现记录数量，不再展示判断字段。', '企业库风险数据', '随企业库风险数据更新']);
    window.prototypeLogicAnnotations.dueReport.fields = fields;
  }

  function applyV108() {
    if (applyingV108) return;
    applyingV108 = true;
    try {
      removeSelectedAnalysisV108();
      removeFinanceTrendV108();
      renderRiskMetricsV108();
      updateAnnotationsV108();
    } finally {
      applyingV108 = false;
    }
  }

  function scheduleV108() {
    if (applyingV108 || frameV108) return;
    frameV108 = window.requestAnimationFrame(function () {
      frameV108 = 0;
      applyV108();
    });
  }

  function installObserverV108() {
    var report = document.getElementById('dueReport');
    if (!report || observerV108) return;
    observerV108 = new MutationObserver(function () { scheduleV108(); });
    observerV108.observe(report, { childList: true, subtree: true });
  }

  function initV108() {
    installObserverV108();
    applyV108();
    setTimeout(applyV108, 540);
    var previous = window.openDueReport;
    if (typeof previous === 'function' && !previous.__dueV108) {
      var wrapped = function () {
        var result = previous.apply(this, arguments);
        setTimeout(applyV108, 580);
        return result;
      };
      wrapped.__dueV108 = true;
      window.openDueReport = wrapped;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initV108);
  else initV108();
})();

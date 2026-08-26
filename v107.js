(function () {
  var applyingV107 = false;
  var frameV107 = 0;
  var observerV107 = null;

  function normalText(value) {
    return String(value || '').replace(/\s+/g, '').trim();
  }

  function findRiskSectionV107() {
    var report = document.getElementById('dueReport');
    if (!report) return null;
    var sections = report.querySelectorAll('.due-evidence-section-v99, .due-report-section, section');
    for (var i = 0; i < sections.length; i += 1) {
      var heading = sections[i].querySelector('h2, h3, .due-section-title-v99');
      var text = normalText(heading ? heading.textContent : '');
      if (text.indexOf('信用与司法风险') !== -1 || text.indexOf('信用、司法与园区准入风险') !== -1) return sections[i];
    }
    return null;
  }

  function renderRiskTableV107() {
    var section = findRiskSectionV107();
    if (!section) return;
    var table = section.querySelector('.due-risk-table-v99');
    if (!table) return;
    var header = Array.prototype.map.call(table.querySelectorAll('thead th'), function (item) { return normalText(item.textContent); }).join('|');
    var labels = Array.prototype.map.call(table.querySelectorAll('tbody tr td:first-child'), function (item) { return normalText(item.textContent); });
    if (header === '风险维度|企业库记录|判断' && labels.indexOf('严重违法') !== -1 && labels.indexOf('失信被执行人') !== -1) return;
    table.innerHTML = '<thead data-due-risk-v107="1"><tr><th>风险维度</th><th>企业库记录</th><th>判断</th></tr></thead><tbody>' +
      '<tr><td>严重违法</td><td>未发现相关记录</td><td class="due-positive-v99">未发现重大红线</td></tr>' +
      '<tr><td>失信被执行人</td><td>未发现相关记录</td><td class="due-positive-v99">未发现重大红线</td></tr>' +
      '<tr><td>司法诉讼</td><td>4 起一般合同纠纷</td><td class="due-warning-v99">需关注案件进展</td></tr>' +
      '<tr><td>劳动纠纷</td><td>未发现相关记录</td><td class="due-positive-v99">未发现用工合规异常</td></tr>' +
      '<tr><td>行政处罚</td><td>1 条，已完成整改</td><td class="due-warning-v99">一般关注</td></tr>' +
      '<tr><td>环保处罚</td><td>近三年无处罚记录</td><td class="due-positive-v99">未发现环保红线</td></tr>' +
      '<tr><td>安全生产处罚</td><td>近三年无处罚记录</td><td class="due-positive-v99">未发现安全生产红线</td></tr>' +
      '</tbody>';
    var analysis = section.querySelector('.due-analysis-v99 p');
    if (analysis) analysis.textContent = '企业库当前未发现严重违法、失信被执行人、环保处罚或安全生产处罚等重大准入红线。存在一般合同纠纷与已整改行政处罚记录，建议在正式接洽前核验案件进展与整改闭环。';
  }

  function updateAnnotationsV107() {
    if (!window.prototypeLogicAnnotations || !window.prototypeLogicAnnotations.dueReport) return;
    var fields = window.prototypeLogicAnnotations.dueReport.fields || [];
    fields = fields.filter(function (item) { return item[0] !== '信用与司法风险维度'; });
    fields.push(['信用与司法风险维度', '严重违法与失信被执行人分别展示；表格仅保留风险维度、企业库记录和判断三列。', '企业库风险数据', '随企业库风险数据更新']);
    window.prototypeLogicAnnotations.dueReport.fields = fields;
  }

  function applyV107() {
    if (applyingV107) return;
    applyingV107 = true;
    try {
      document.querySelectorAll('#dashboard .industry-map-card .map-kpis').forEach(function (node) { node.remove(); });
      document.querySelectorAll('#dueReport .due-finance-row-source-v105').forEach(function (node) { node.remove(); });
      renderRiskTableV107();
      updateAnnotationsV107();
    } finally {
      applyingV107 = false;
    }
  }

  function scheduleV107() {
    if (applyingV107 || frameV107) return;
    frameV107 = window.requestAnimationFrame(function () {
      frameV107 = 0;
      applyV107();
    });
  }

  function installObserverV107() {
    var report = document.getElementById('dueReport');
    if (!report || observerV107) return;
    observerV107 = new MutationObserver(function () { scheduleV107(); });
    observerV107.observe(report, { childList: true, subtree: true });
  }

  function initV107() {
    installObserverV107();
    applyV107();
    setTimeout(applyV107, 470);
    var previous = window.openDueReport;
    if (typeof previous === 'function' && !previous.__dueV107) {
      var wrapped = function () {
        var result = previous.apply(this, arguments);
        setTimeout(applyV107, 500);
        return result;
      };
      wrapped.__dueV107 = true;
      window.openDueReport = wrapped;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initV107);
  else initV107();
})();

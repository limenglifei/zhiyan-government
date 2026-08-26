(function () {
  'use strict';

  var applyingV106 = false;
  var observerV106 = null;
  var frameV106 = null;

  var riskRowsV106 = [
    ['严重违法', '0 条', '未发现严重违法记录', 'due-positive-v99'],
    ['失信被执行人', '0 条', '未发现失信被执行记录', 'due-positive-v99'],
    ['司法诉讼', '4 起', '一般合同纠纷，需关注案件进展', 'due-warning-v99'],
    ['劳动纠纷', '0 起', '未发现劳动纠纷记录', 'due-positive-v99'],
    ['行政处罚', '1 条', '公开信息显示已整改，一般关注', 'due-warning-v99'],
    ['环保处罚', '0 条', '近三年未发现环保处罚记录', 'due-positive-v99'],
    ['安全生产处罚', '0 条', '近三年未发现安全生产处罚记录', 'due-positive-v99']
  ];

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function findRiskSectionV106() {
    var sections = document.querySelectorAll('#dueReport #dueEvidenceReportV99 .due-evidence-section-v99');
    for (var i = 0; i < sections.length; i += 1) {
      var heading = sections[i].querySelector('h2');
      if (heading && (heading.textContent.trim() === '信用与司法风险' || heading.textContent.trim() === '信用、司法与园区准入风险')) return sections[i];
    }
    return null;
  }

  function tableIsCurrentV106(table) {
    if (!table || table.getAttribute('data-due-risk-v106') !== '1') return false;
    var headers = table.querySelectorAll('thead th');
    var rows = table.querySelectorAll('tbody tr');
    return headers.length === 3 && headers[1].textContent.trim() === '数量' && rows.length === riskRowsV106.length && rows[0].children[0].textContent.trim() === '严重违法' && rows[1].children[0].textContent.trim() === '失信被执行人';
  }

  function renderRiskTableV106(table) {
    if (tableIsCurrentV106(table)) return;
    table.innerHTML = '<thead><tr><th>风险维度</th><th>数量</th><th>判断</th></tr></thead><tbody>' + riskRowsV106.map(function (row) {
      return '<tr><td>' + esc(row[0]) + '</td><td><b>' + esc(row[1]) + '</b></td><td class="' + esc(row[3]) + '">' + esc(row[2]) + '</td></tr>';
    }).join('') + '</tbody>';
    table.setAttribute('data-due-risk-v106', '1');
  }

  function updateAnnotationsV106() {
    if (typeof window.prototypeLogicAnnotations === 'undefined' || !window.prototypeLogicAnnotations.dueReport) return;
    var fields = window.prototypeLogicAnnotations.dueReport.fields || [];
    fields = fields.filter(function (item) { return item[0] !== '信用与司法风险维度'; });
    fields.push(['信用与司法风险维度', '风险表仅展示风险维度、数量和判断；严重违法与失信被执行人分别统计，司法诉讼、劳动纠纷、行政处罚、环保处罚和安全生产处罚按企业库记录数量展示。', '企业库信用与司法风险记录', '随企业库更新']);
    window.prototypeLogicAnnotations.dueReport.fields = fields;
  }

  function applyRiskV106() {
    if (applyingV106) return;
    var section = findRiskSectionV106();
    if (!section) return;
    applyingV106 = true;
    try {
      var table = section.querySelector('.due-risk-table-v99');
      renderRiskTableV106(table);
      var analysis = section.querySelector('.due-analysis-v99 p');
      var analysisText = '企业库记录显示：严重违法与失信被执行人均为 0 条，劳动纠纷为 0 起，近三年环保处罚和安全生产处罚均为 0 条，暂未发现重大准入红线；司法诉讼 4 起、行政处罚 1 条，建议在正式接洽前核验案件结案及整改情况。';
      if (analysis && analysis.textContent !== analysisText) analysis.textContent = analysisText;
      updateAnnotationsV106();
    } finally {
      applyingV106 = false;
    }
  }

  function scheduleV106() {
    if (applyingV106 || frameV106) return;
    frameV106 = window.requestAnimationFrame(function () {
      frameV106 = null;
      applyRiskV106();
    });
  }

  function installObserverV106() {
    var report = document.getElementById('dueReport');
    if (!report || observerV106) return;
    observerV106 = new MutationObserver(function () { scheduleV106(); });
    observerV106.observe(report, { childList: true, subtree: true });
  }

  function initV106() {
    installObserverV106();
    setTimeout(applyRiskV106, 410);
    var previous = window.openDueReport;
    if (typeof previous === 'function' && !previous.__dueV106) {
      var wrapped = function () {
        var result = previous.apply(this, arguments);
        setTimeout(applyRiskV106, 450);
        return result;
      };
      wrapped.__dueV106 = true;
      window.openDueReport = wrapped;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initV106);
  else initV106();
})();

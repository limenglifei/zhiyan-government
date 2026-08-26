(function () {
  'use strict';

  var applyingV109 = false;
  var frameV109 = 0;
  var observerV109 = null;
  var eventsV109 = [
    { key: 'recruit', label: '招聘变化', count: 1 },
    { key: 'investment', label: '投资建厂', count: 2 },
    { key: 'product', label: '新产品发布', count: 2 },
    { key: 'cooperation', label: '新合作', count: 2 },
    { key: 'capital', label: '融资与资本动作', count: 1 },
    { key: 'capacityBuild', label: '产能建设', count: 3 }
  ];

  function normalTextV109(value) {
    return String(value || '').replace(/\s+/g, '').trim();
  }

  function currentCompanyV109() {
    var company = document.getElementById('dueSummaryCompany');
    if (company && company.textContent.trim()) return company.textContent.trim();
    if (typeof window.currentDueCompany !== 'undefined' && window.currentDueCompany) return window.currentDueCompany;
    return '当前企业';
  }

  function expansionSectionV109() {
    var sections = document.querySelectorAll('#dueEvidenceReportV99 .due-evidence-section-v99');
    for (var i = 0; i < sections.length; i += 1) {
      var number = sections[i].querySelector('.due-section-number-v99');
      if (number && normalTextV109(number.textContent) === '07') return sections[i];
    }
    return null;
  }

  function eventMetaV109(index) {
    return eventsV109[index] || { key: '', label: '扩张事件', count: 0 };
  }

  function decorateCardsV109(section) {
    var container = section.querySelector('.due-landing-signals-v99');
    if (!container) return;

    var overview = section.querySelector('.due-expansion-overview-v109');
    if (!overview) {
      overview = document.createElement('div');
      overview.className = 'due-expansion-overview-v109';
      overview.innerHTML = '<div><b>扩张事件识别</b><span>按公开信息归集企业近期扩张与投融资动作</span></div><div class="due-expansion-overview-tags-v109"><span><strong>6</strong> 类事件</span><span><strong>11</strong> 条公开信号</span></div>';
      container.parentNode.insertBefore(overview, container);
    }

    Array.prototype.slice.call(container.querySelectorAll(':scope > article')).forEach(function (card, index) {
      var meta = eventMetaV109(index);
      card.setAttribute('data-event-key-v109', meta.key);
      var row = card.querySelector('.due-event-type-row-v109');
      if (!row) {
        var legacyLabel = card.querySelector(':scope > span');
        row = document.createElement('div');
        row.className = 'due-event-type-row-v109';
        row.innerHTML = '<span class="due-event-type-v109"></span><span class="due-event-count-v109"></span>';
        if (legacyLabel) legacyLabel.remove();
        card.insertBefore(row, card.firstChild);
      }
      var label = row.querySelector('.due-event-type-v109');
      var count = row.querySelector('.due-event-count-v109');
      if (label && label.textContent !== meta.label) label.textContent = meta.label;
      if (count && normalTextV109(count.textContent) !== meta.count + '条事件') count.innerHTML = '<b>' + meta.count + '</b> 条事件';
      var detail = card.querySelector('.due-news-link-v101');
      if (detail) {
        var detailText = '查看 ' + meta.count + ' 条事件详情 ↗';
        if (detail.textContent !== detailText) detail.textContent = detailText;
        detail.onclick = function () { window.openDueExpansionEventV109(meta.key, meta.label, meta.count); };
      }
    });
  }

  window.openDueExpansionEventV109 = function (key, label, count) {
    if (typeof window.openDueNewsListV103 !== 'function') return;
    window.openDueNewsListV103(key);
    var company = currentCompanyV109();
    var title = document.getElementById('dueNewsListTitleV101');
    if (title) title.textContent = label + ' · ' + count + ' 条事件';
    var body = document.getElementById('dueNewsListBodyV101');
    if (body) {
      body.querySelectorAll('b, p').forEach(function (node) {
        if (node.textContent.indexOf('芯源微电子') >= 0) node.textContent = node.textContent.replace(/芯源微电子/g, company);
      });
    }
  };

  function updateAnnotationsV109() {
    if (!window.prototypeLogicAnnotations || !window.prototypeLogicAnnotations.dueReport) return;
    var fields = window.prototypeLogicAnnotations.dueReport.fields || [];
    fields = fields.filter(function (item) { return item[0] !== '扩张事件分类与数量'; });
    fields.push(['扩张事件分类与数量', '将联网识别到的企业扩张线索归入招聘变化、投资建厂、新产品发布、新合作、融资与资本动作、产能建设六类，并展示每类事件数量。', '新闻舆情库、企业公告、工商变更、招投标及项目公示', '报告生成时联网检索并固化快照']);
    window.prototypeLogicAnnotations.dueReport.fields = fields;
  }

  function applyV109() {
    if (applyingV109) return;
    applyingV109 = true;
    try {
      var section = expansionSectionV109();
      if (section) decorateCardsV109(section);
      updateAnnotationsV109();
    } finally {
      applyingV109 = false;
    }
  }

  function scheduleV109() {
    if (applyingV109 || frameV109) return;
    frameV109 = window.requestAnimationFrame(function () {
      frameV109 = 0;
      applyV109();
    });
  }

  function installObserverV109() {
    var report = document.getElementById('dueReport');
    if (!report || observerV109) return;
    observerV109 = new MutationObserver(function () { scheduleV109(); });
    observerV109.observe(report, { childList: true, subtree: true });
  }

  function initV109() {
    installObserverV109();
    applyV109();
    setTimeout(applyV109, 650);
    var previous = window.openDueReport;
    if (typeof previous === 'function' && !previous.__dueV109) {
      var wrapped = function () {
        var result = previous.apply(this, arguments);
        setTimeout(applyV109, 690);
        return result;
      };
      wrapped.__dueV109 = true;
      window.openDueReport = wrapped;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initV109);
  else initV109();
})();

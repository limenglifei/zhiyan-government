(function () {
  'use strict';

  var applyingV110 = false;
  var frameV110 = 0;
  var observerV110 = null;

  function normalTextV110(value) {
    return String(value || '').replace(/\s+/g, '').trim();
  }

  function basicSectionV110() {
    var sections = document.querySelectorAll('#dueEvidenceReportV99 .due-evidence-section-v99');
    for (var i = 0; i < sections.length; i += 1) {
      var number = sections[i].querySelector('.due-section-number-v99');
      if (number && normalTextV110(number.textContent) === '01') return sections[i];
    }
    return null;
  }

  function findFactV110(grid, label) {
    if (!grid) return null;
    var facts = grid.querySelectorAll(':scope > .due-fact-v99');
    for (var i = 0; i < facts.length; i += 1) {
      var term = facts[i].querySelector('dt');
      if (term && normalTextV110(term.textContent) === normalTextV110(label)) return facts[i];
    }
    return null;
  }

  function ensureTaxCreditV110() {
    var section = basicSectionV110();
    if (!section) return;
    var grid = section.querySelector('.due-fact-grid-v99');
    if (!grid) return;

    var current = findFactV110(grid, '纳税信用等级');
    if (!current) {
      current = document.createElement('div');
      current.className = 'due-fact-v99 due-tax-credit-v110';
      current.setAttribute('data-due-v110', 'tax-credit');
      current.innerHTML = '<dt>纳税信用等级</dt><dd>A 级</dd>';
    } else {
      current.classList.add('due-tax-credit-v110');
      current.setAttribute('data-due-v110', 'tax-credit');
      var value = current.querySelector('dd');
      if (value && !normalTextV110(value.textContent)) value.textContent = 'A 级';
    }

    var socialSecurity = findFactV110(grid, '社保人数');
    if (socialSecurity && socialSecurity.nextElementSibling !== current) {
      socialSecurity.insertAdjacentElement('afterend', current);
    } else if (!current.parentNode) {
      grid.appendChild(current);
    }
  }

  function syncAnnotationsV110() {
    var annotations = window.prototypeLogicAnnotations;
    if (!annotations || !annotations.dueReport || !Array.isArray(annotations.dueReport.fields)) return;
    var key = '企业主体与基础画像·纳税信用等级';
    annotations.dueReport.fields = annotations.dueReport.fields.filter(function (item) {
      return !item || item.label !== key;
    });
    annotations.dueReport.fields.push({
      label: key,
      source: '企业库税务字段',
      rule: '展示企业最新有效纳税信用等级；样例为 A 级，正式产品需同时记录评级年度与数据更新时间。',
      interaction: '随企业主体与企业库数据快照切换，不使用联网推断值替代正式评级。'
    });
  }

  function applyDueReportV110() {
    if (applyingV110) return;
    applyingV110 = true;
    try {
      ensureTaxCreditV110();
      syncAnnotationsV110();
    } finally {
      applyingV110 = false;
    }
  }

  function scheduleV110(delay) {
    window.setTimeout(function () {
      if (frameV110) window.cancelAnimationFrame(frameV110);
      frameV110 = window.requestAnimationFrame(function () {
        frameV110 = 0;
        applyDueReportV110();
      });
    }, delay || 0);
  }

  function installObserverV110() {
    var report = document.getElementById('dueReport');
    if (!report || observerV110) return;
    observerV110 = new MutationObserver(function () {
      if (!applyingV110) scheduleV110(20);
    });
    observerV110.observe(report, { childList: true, subtree: true });
  }

  function wrapOpenDueReportV110() {
    if (typeof window.openDueReport !== 'function' || window.openDueReport.__dueV110Wrapped) return;
    var previous = window.openDueReport;
    var wrapped = function () {
      var result = previous.apply(this, arguments);
      scheduleV110(740);
      return result;
    };
    wrapped.__dueV110Wrapped = true;
    window.openDueReport = wrapped;
  }

  function initV110() {
    wrapOpenDueReportV110();
    installObserverV110();
    applyDueReportV110();
    scheduleV110(720);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initV110, { once: true });
  } else {
    initV110();
  }
}());

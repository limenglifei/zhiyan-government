(function () {
  'use strict';

  var observedRoots = new WeakSet();
  var scopes = [
    '#nodeCompanyModal',
    '#chainReportV58',
    '#attractionResultsV50',
    '#recommendReasonModalV51'
  ];

  function renameAction(button) {
    if (!button) return;
    var text = (button.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) return;

    if (/已批量加入\s*\d+\s*家企业/.test(text)) {
      button.textContent = text.replace('已批量加入', '已初步关注');
      return;
    }
    if (/批量加入招商名单|一键批量加入名单/.test(text)) {
      button.textContent = text.replace(/批量加入招商名单|一键批量加入名单/, '批量招商初步关注');
      return;
    }
    if (/加入招商名单/.test(text)) {
      button.textContent = text.replace(/(?:＋\s*)?加入招商名单/, '＋ 招商初步关注');
      return;
    }
    if (/^✓?\s*已加入$/.test(text)) {
      button.textContent = '✓ 已初步关注';
    }
  }

  function normalizeRoot(root) {
    if (!root) return;
    root.querySelectorAll('button').forEach(renameAction);
  }

  function observeRoot(root) {
    if (!root || observedRoots.has(root)) return;
    observedRoots.add(root);
    normalizeRoot(root);
    new MutationObserver(function () {
      normalizeRoot(root);
    }).observe(root, { childList: true, subtree: true, characterData: true });
  }

  function renameDueDiligenceTab() {
    var label = document.querySelector('#dueDiligence .due-kpis article:first-child span');
    if (label && label.textContent.trim() === '重点跟进企业') {
      label.textContent = '我关注的全部名单';
    }
  }

  function mountEnhancements() {
    scopes.forEach(function (selector) {
      observeRoot(document.querySelector(selector));
    });
    renameDueDiligenceTab();
  }

  function annotateChange() {
    if (typeof prototypeLogicAnnotations === 'undefined' || !prototypeLogicAnnotations.investment) return;
    var interactions = prototypeLogicAnnotations.investment.interactions;
    if (!Array.isArray(interactions)) return;
    var exists = interactions.some(function (item) {
      return Array.isArray(item) && item[0] === '招商初步关注';
    });
    if (!exists) {
      interactions.push(['招商初步关注', '单节点及全链条推荐企业可先纳入招商初步关注，后续进入企业尽调与重点跟进流程。']);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      mountEnhancements();
      annotateChange();
    });
  } else {
    mountEnhancements();
    annotateChange();
  }

  new MutationObserver(mountEnhancements).observe(document.body, {
    childList: true,
    subtree: true
  });
})();


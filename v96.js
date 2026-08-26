(function () {
  'use strict';

  function upgradeNodeCompanyScroll() {
    var modal = document.querySelector('#nodeCompanyModal .node-company-modal');
    if (!modal || modal.querySelector('.node-company-scroll-shell-v96')) return;

    var tabs = modal.querySelector('.node-company-tabs');
    var summary = modal.querySelector('.node-company-summary');
    var body = modal.querySelector('.prototype-modal-body');
    if (!tabs || !summary || !body) return;

    var shell = document.createElement('div');
    shell.className = 'node-company-scroll-shell-v96';
    shell.setAttribute('data-scroll-purpose', '统计区先滚动，表头抵达页签后吸顶');
    tabs.insertAdjacentElement('afterend', shell);
    shell.appendChild(summary);
    shell.appendChild(body);
  }

  function removeDueListHeading() {
    var heading = document.querySelector('#dueDiligence .followed-investments .card-title > div');
    if (!heading) return;
    heading.setAttribute('aria-hidden', 'true');
  }

  function mountV96() {
    upgradeNodeCompanyScroll();
    removeDueListHeading();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountV96);
  } else {
    mountV96();
  }

  new MutationObserver(mountV96).observe(document.body, {
    childList: true,
    subtree: true
  });
})();


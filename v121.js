(function () {
  'use strict';
  var support = document.getElementById('support');
  var list = document.getElementById('companyList');
  var profile = document.getElementById('companyProfile');
  if (!support || !list || !profile || document.getElementById('supportCompanyDetailV121')) return;

  var dialog = document.createElement('dialog');
  dialog.id = 'supportCompanyDetailV121';
  dialog.className = 'support-company-dialog-v121';
  dialog.setAttribute('aria-labelledby', 'supportCompanyDetailTitleV121');
  dialog.innerHTML = '<header><div><h2 id="supportCompanyDetailTitleV121">企业匹配详情</h2><p id="supportCompanyDetailPolicyV121"></p></div><button type="button" aria-label="关闭企业匹配详情">×</button></header><div class="support-company-dialog-body-v121"></div>';
  support.appendChild(dialog);
  dialog.querySelector('.support-company-dialog-body-v121').appendChild(profile);
  var activeIndex = null;
  var previousOverflow = '';
  var locked = false;
  var restoreFocus = true;
  var resumeAfterAssignment = false;
  var assignments = new Map();

  function assignmentKey() {
    var company = companies[ci];
    return company ? JSON.stringify([company.n, document.getElementById('supportResultTitle').textContent]) : '';
  }
  function restoreCardFocus() {
    var card = list.querySelector('[data-support-company-index="' + activeIndex + '"]');
    if (card) card.focus({ preventScroll: true });
  }
  function unlock() {
    if (!locked) return;
    document.body.style.overflow = previousOverflow;
    locked = false;
  }
  function showDetails() {
    if (dialog.open) return;
    document.getElementById('supportCompanyDetailPolicyV121').textContent = document.getElementById('supportResultTitle').textContent;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    locked = true;
    restoreFocus = true;
    dialog.showModal();
    dialog.querySelector('.support-company-dialog-body-v121').scrollTop = 0;
  }
  function closeDetails(focus) {
    restoreFocus = focus !== false;
    unlock();
    dialog.close();
  }
  dialog.querySelector('header > button').addEventListener('click', function () { closeDetails(); });
  dialog.addEventListener('cancel', function (event) { event.preventDefault(); closeDetails(); });
  dialog.addEventListener('close', function () { if (dialog.open) return; unlock(); if (restoreFocus && !resumeAfterAssignment) restoreCardFocus(); });
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return;
    var box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeDetails();
  });

  function openDetails(index) {
    if (!getSupportCompanies().some(function (item) { return item.index === index; })) return;
    activeIndex = index;
    ci = index;
    window.renderCompanies();
    showDetails();
  }
  function decorateCards() {
    var rows = getSupportCompanies().slice((supportPage - 1) * supportPageSize, supportPage * supportPageSize);
    Array.from(list.querySelectorAll(':scope > button')).forEach(function (button, position) {
      var item = rows[position];
      if (!item) return;
      var logo = button.querySelector('.company-logo');
      var copy = button.children[1];
      var score = button.querySelector('.score');
      var tags = button.querySelector('.company-card-tags');
      var meta = button.querySelector('.company-card-meta');
      var scope = button.querySelector('.support-company-scope');
      var identity = document.createElement('div');
      identity.className = 'support-company-identity-v121';
      identity.appendChild(copy.querySelector('b'));
      identity.appendChild(copy.querySelector('small'));
      var head = document.createElement('span');
      head.className = 'support-company-head-v121';
      head.appendChild(logo);
      head.appendChild(identity);
      var footer = document.createElement('span');
      footer.className = 'support-company-footer-v121';
      var action = document.createElement('span');
      action.className = 'support-company-view-v121';
      action.textContent = '查看匹配详情 →';
      footer.appendChild(score);
      footer.appendChild(action);
      button.replaceChildren(head);
      if (tags) button.appendChild(tags);
      if (scope) button.appendChild(scope);
      if (meta) button.appendChild(meta);
      button.appendChild(footer);
      button.type = 'button';
      button.classList.remove('selected');
      button.classList.add('support-company-card-v121');
      button.dataset.supportCompanyIndex = String(item.index);
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-controls', dialog.id);
      button.setAttribute('aria-label', '查看' + item.c.n + '的政策匹配详情');
      button.removeAttribute('onclick');
      button.addEventListener('click', function () { openDetails(item.index); });
    });
    var assigned = assignments.get(assignmentKey());
    var assignmentButton = profile.querySelector(':scope > button.primary');
    if (assigned && assignmentButton) {
      assignmentButton.textContent = '✓ 已加入扶持名单 · ' + assigned;
      assignmentButton.dataset.manager = assigned;
    }
  }
  var previousRender = window.renderCompanies;
  window.renderCompanies = function () {
    var result = previousRender.apply(this, arguments);
    decorateCards();
    return result;
  };

  // Suspend the native detail dialog while the existing assignment overlay is active.
  var previousOpenAssignment = window.openSupportAssignmentV53;
  if (typeof previousOpenAssignment === 'function') window.openSupportAssignmentV53 = function () {
    resumeAfterAssignment = dialog.open;
    if (resumeAfterAssignment) closeDetails(false);
    return previousOpenAssignment.apply(this, arguments);
  };
  var previousCloseAssignment = window.closeSupportAssignmentV53;
  if (typeof previousCloseAssignment === 'function') window.closeSupportAssignmentV53 = function () {
    var result = previousCloseAssignment.apply(this, arguments);
    if (resumeAfterAssignment) { resumeAfterAssignment = false; showDetails(); }
    return result;
  };
  var previousConfirmAssignment = window.confirmSupportAssignmentV53;
  if (typeof previousConfirmAssignment === 'function') window.confirmSupportAssignmentV53 = function () {
    var result = previousConfirmAssignment.apply(this, arguments);
    var button = profile.querySelector(':scope > button.primary');
    if (button && button.dataset.manager) assignments.set(assignmentKey(), button.dataset.manager);
    return result;
  };
  window.renderCompanies();
})();

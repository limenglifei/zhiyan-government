(function () {
  'use strict';
  var support = document.getElementById('support');
  var list = document.getElementById('companyList');
  var profile = document.getElementById('companyProfile');
  var layout = support && support.querySelector('.match-layout');
  if (!layout || !list || !profile || layout.dataset.resultLayoutV121) return;
  layout.dataset.resultLayoutV121 = 'split';

  var listPanel = document.createElement('section');
  listPanel.className = 'card support-company-list-panel-v121';
  listPanel.setAttribute('aria-labelledby', 'supportCompanyListTitleV121');
  listPanel.innerHTML = '<header><div><h3 id="supportCompanyListTitleV121">扶持企业名单</h3><span id="supportCompanyCountV121" aria-live="polite"></span></div><label class="support-company-search-v121"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><input id="supportCompanySearchV121" type="search" autocomplete="off" placeholder="搜索企业名称或行业" aria-label="搜索扶持企业名称或行业"></label></header>';
  var detailPanel = document.createElement('section');
  detailPanel.className = 'card support-company-detail-panel-v121';
  detailPanel.setAttribute('aria-labelledby', 'supportCompanyDetailTitleV121');
  detailPanel.innerHTML = '<header><h3 id="supportCompanyDetailTitleV121">企业匹配详情</h3><span>政策条件诊断</span></header>';
  layout.appendChild(listPanel);
  layout.appendChild(detailPanel);
  listPanel.appendChild(list);
  detailPanel.appendChild(profile);
  list.setAttribute('aria-label', '扶持企业名单');
  profile.setAttribute('aria-label', '当前企业政策匹配详情');
  profile.tabIndex = 0;

  var actions = support.querySelector('.support-result-actions');
  var scopeButton = document.createElement('button');
  scopeButton.id = 'supportResultScopeBtnV121';
  scopeButton.type = 'button';
  scopeButton.className = 'secondary';
  scopeButton.setAttribute('aria-haspopup', 'dialog');
  scopeButton.setAttribute('aria-controls', 'supportScopeDialog');
  scopeButton.textContent = '扶持范围';
  scopeButton.addEventListener('click', function () { window.openSupportScope(); });
  if (actions) actions.insertBefore(scopeButton, actions.querySelector('button'));
  var scopeSummary = document.createElement('div');
  scopeSummary.id = 'supportResultScopeSummaryV121';
  scopeSummary.className = 'support-scope-summary';
  scopeSummary.setAttribute('aria-live', 'polite');
  var resultTitle = support.querySelector('.support-result-title');
  if (resultTitle) resultTitle.insertAdjacentElement('afterend', scopeSummary);

  var search = document.getElementById('supportCompanySearchV121');
  var keyword = '';
  var assignments = new Map();
  var lastRows = '';
  var lastSelection = '';
  var previousGetCompanies = window.getSupportCompanies;
  window.getSupportCompanies = function () {
    var rows = previousGetCompanies.apply(this, arguments);
    if (!keyword) return rows;
    return rows.filter(function (item) {
      return [item.c.n, item.c.i, item.c.industry].join(' ').toLocaleLowerCase().indexOf(keyword) > -1;
    });
  };
  search.addEventListener('input', function () {
    keyword = search.value.trim().toLocaleLowerCase();
    supportPage = 1;
    window.renderCompanies();
  });

  function assignmentKey(company) {
    var title = document.getElementById('supportResultTitle');
    return company ? JSON.stringify([company.n, title ? title.textContent : '']) : '';
  }
  function restoreAssignment() {
    var button = profile.querySelector(':scope > button.primary');
    if (!button) return;
    var manager = assignments.get(assignmentKey(companies[ci]));
    button.textContent = manager ? '✓ 已加入扶持名单 · ' + manager : '加入政策扶持名单';
    if (manager) button.dataset.manager = manager;
    else delete button.dataset.manager;
  }
  function updateScopeControls() {
    var sourceLabel = document.getElementById('supportScopeBtnLabel');
    var sourceSummary = document.getElementById('supportScopeSummary');
    var sourceButton = document.getElementById('supportScopeBtn');
    scopeButton.textContent = sourceLabel ? sourceLabel.textContent : '扶持范围';
    scopeButton.classList.toggle('scope-active', !!(sourceButton && sourceButton.classList.contains('scope-active')));
    scopeSummary.innerHTML = sourceSummary ? sourceSummary.innerHTML : '';
  }
  function selectCompany(index) {
    if (!getSupportCompanies().some(function (item) { return item.index === index; })) return;
    ci = index;
    window.renderCompanies();
    var selected = list.querySelector('[data-support-company-index="' + index + '"]');
    if (selected) selected.focus({ preventScroll: true });
  }
  function decorateRows() {
    var rows = getSupportCompanies();
    var pageRows = rows.slice((supportPage - 1) * supportPageSize, supportPage * supportPageSize);
    document.getElementById('supportCompanyCountV121').textContent = '共 ' + rows.length + ' 家';
    Array.from(list.querySelectorAll(':scope > button')).forEach(function (button, position) {
      var item = pageRows[position];
      if (!item) return;
      button.type = 'button';
      button.classList.add('support-company-row-v121');
      button.classList.toggle('selected', item.index === ci);
      button.dataset.supportCompanyIndex = String(item.index);
      button.setAttribute('aria-pressed', String(item.index === ci));
      button.setAttribute('aria-controls', 'companyProfile');
      button.setAttribute('aria-label', item.c.n + '，匹配度 ' + item.c.s + '%，查看匹配详情');
      button.removeAttribute('onclick');
      button.addEventListener('click', function () { selectCompany(item.index); });
    });
    restoreAssignment();
    updateScopeControls();
    return pageRows.map(function (item) { return item.index; }).join(',') + ':' + supportPage;
  }
  var previousRender = window.renderCompanies;
  window.renderCompanies = function () {
    var listScroll = list.scrollTop;
    var detailScroll = profile.scrollTop;
    var result = previousRender.apply(this, arguments);
    var rows = decorateRows();
    var selection = assignmentKey(companies[ci]);
    list.scrollTop = rows === lastRows ? listScroll : 0;
    profile.scrollTop = selection === lastSelection ? detailScroll : 0;
    lastRows = rows;
    lastSelection = selection;
    return result;
  };

  // Keep the existing owner assignment flow and retain its state when rows are switched.
  var previousConfirmAssignment = window.confirmSupportAssignmentV53;
  if (typeof previousConfirmAssignment === 'function') window.confirmSupportAssignmentV53 = function () {
    var key = assignmentKey(companies[ci]);
    var result = previousConfirmAssignment.apply(this, arguments);
    var button = profile.querySelector(':scope > button.primary');
    if (button && button.dataset.manager) assignments.set(key, button.dataset.manager);
    return result;
  };
  var policyTitle = document.getElementById('supportResultTitle');
  if (policyTitle) new MutationObserver(restoreAssignment).observe(policyTitle, { childList: true, characterData: true, subtree: true });
  var scopeDialog = document.getElementById('supportScopeDialog');
  if (scopeDialog) scopeDialog.addEventListener('close', function () {
    if (support.classList.contains('matched')) scopeButton.focus({ preventScroll: true });
  });
  window.renderCompanies();
})();

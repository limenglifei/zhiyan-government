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
  listPanel.innerHTML = '<header><div><h3 id="supportCompanyListTitleV121">扶持企业名单</h3><span id="supportCompanyCountV121" aria-live="polite"></span></div><div class="support-bulk-toolbar-v121"><label class="support-select-page-v121"><input id="supportSelectPageV121" type="checkbox">全选本页</label><span id="supportSelectedCountV121" aria-live="polite">已选 0 家</span><button id="supportBulkAddV121" class="primary" type="button" disabled>批量加入扶持</button></div></header>';
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

  var selectPage = document.getElementById('supportSelectPageV121');
  var selectedCount = document.getElementById('supportSelectedCountV121');
  var bulkButton = document.getElementById('supportBulkAddV121');
  var selectedNames = new Set();
  var assignments = new Map();
  var activePolicy = '';
  var assignmentSession = null;
  var pendingBatch = null;
  var lastRows = '';
  var lastSelection = '';

  function policyTitle() {
    var title = document.getElementById('supportResultTitle');
    return title ? title.textContent.trim() : '';
  }
  function assignmentKey(name, policy) {
    return JSON.stringify([name, policy === undefined ? policyTitle() : policy]);
  }
  function reconcileSelection() {
    var policy = policyTitle();
    if (activePolicy !== policy) {
      selectedNames.clear();
      activePolicy = policy;
    }
    var eligible = new Set(getSupportCompanies().filter(function (item) {
      return !assignments.has(assignmentKey(item.c.n, policy));
    }).map(function (item) { return item.c.n; }));
    selectedNames.forEach(function (name) { if (!eligible.has(name)) selectedNames.delete(name); });
  }
  function currentPageRows() {
    return getSupportCompanies().slice((supportPage - 1) * supportPageSize, supportPage * supportPageSize);
  }
  function updateBulkControls() {
    reconcileSelection();
    var eligibleRows = currentPageRows().filter(function (item) { return !assignments.has(assignmentKey(item.c.n)); });
    var checked = eligibleRows.filter(function (item) { return selectedNames.has(item.c.n); }).length;
    selectPage.disabled = eligibleRows.length === 0;
    selectPage.checked = eligibleRows.length > 0 && checked === eligibleRows.length;
    selectPage.indeterminate = checked > 0 && checked < eligibleRows.length;
    selectedCount.textContent = '已选 ' + selectedNames.size + ' 家';
    bulkButton.disabled = selectedNames.size === 0;
    list.querySelectorAll('.support-company-checkbox-v121').forEach(function (checkbox) {
      var company = companies[Number(checkbox.dataset.supportCheckIndex)];
      if (company) checkbox.checked = selectedNames.has(company.n);
    });
  }
  selectPage.addEventListener('change', function () {
    reconcileSelection();
    currentPageRows().forEach(function (item) {
      if (assignments.has(assignmentKey(item.c.n))) return;
      if (selectPage.checked) selectedNames.add(item.c.n);
      else selectedNames.delete(item.c.n);
    });
    updateBulkControls();
  });
  function restoreAssignment() {
    var button = profile.querySelector(':scope > button.primary');
    var company = companies[ci];
    if (!button || !company) return;
    var manager = assignments.get(assignmentKey(company.n));
    button.textContent = manager ? '✓ 已加入扶持名单 · ' + manager : '加入政策扶持名单';
    button.disabled = !!manager;
    if (manager) button.dataset.manager = manager;
    else delete button.dataset.manager;
  }
  function selectCompany(index) {
    if (!getSupportCompanies().some(function (item) { return item.index === index; })) return;
    ci = index;
    window.renderCompanies();
    var selected = list.querySelector('button[data-support-company-index="' + index + '"]');
    if (selected) selected.focus({ preventScroll: true });
  }
  function decorateRows() {
    var rows = getSupportCompanies();
    var pageRows = currentPageRows();
    reconcileSelection();
    document.getElementById('supportCompanyCountV121').textContent = '共 ' + rows.length + ' 家';
    Array.from(list.querySelectorAll(':scope > button')).forEach(function (button, position) {
      var item = pageRows[position];
      if (!item) return;
      var manager = assignments.get(assignmentKey(item.c.n));
      var row = document.createElement('div');
      row.className = 'support-company-selectable-v121';
      row.classList.toggle('selected', item.index === ci);
      row.classList.toggle('assigned', !!manager);
      var checkLabel = document.createElement('label');
      checkLabel.className = 'support-company-check-v121';
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'support-company-checkbox-v121';
      checkbox.dataset.supportCheckIndex = String(item.index);
      checkbox.setAttribute('aria-label', (manager ? '已加入扶持名单：' : '选择') + item.c.n);
      checkbox.checked = selectedNames.has(item.c.n);
      checkbox.disabled = !!manager;
      checkbox.addEventListener('change', function () {
        if (checkbox.checked) selectedNames.add(item.c.n);
        else selectedNames.delete(item.c.n);
        updateBulkControls();
      });
      checkLabel.appendChild(checkbox);
      button.before(row);
      row.appendChild(checkLabel);
      row.appendChild(button);
      button.type = 'button';
      button.classList.add('support-company-row-v121');
      button.classList.toggle('selected', item.index === ci);
      button.dataset.supportCompanyIndex = String(item.index);
      button.setAttribute('aria-pressed', String(item.index === ci));
      button.setAttribute('aria-controls', 'companyProfile');
      button.setAttribute('aria-label', item.c.n + '，匹配度 ' + item.c.s + '%，查看匹配详情');
      button.removeAttribute('onclick');
      button.addEventListener('click', function () { selectCompany(item.index); });
      if (manager) {
        var status = document.createElement('span');
        status.className = 'support-company-assigned-v121';
        status.textContent = '✓ 已加入扶持 · ' + manager;
        var copy = button.querySelector('.company-card-meta');
        if (copy) copy.insertAdjacentElement('afterend', status);
      }
    });
    restoreAssignment();
    updateBulkControls();
    return pageRows.map(function (item) { return item.index; }).join(',') + ':' + supportPage;
  }
  var previousRender = window.renderCompanies;
  window.renderCompanies = function () {
    var listScroll = list.scrollTop;
    var detailScroll = profile.scrollTop;
    var result = previousRender.apply(this, arguments);
    var rows = decorateRows();
    var company = companies[ci];
    var selection = company ? assignmentKey(company.n) : '';
    list.scrollTop = rows === lastRows ? listScroll : 0;
    profile.scrollTop = selection === lastSelection ? detailScroll : 0;
    lastRows = rows;
    lastSelection = selection;
    return result;
  };

  // The existing modal writes the chosen manager to its supplied button. A detached
  // button receives that result for a batch, without changing the current detail.
  var previousOpenAssignment = window.openSupportAssignmentV53;
  if (typeof previousOpenAssignment === 'function') window.openSupportAssignmentV53 = function (button) {
    if (button && button.disabled) return;
    var policy = policyTitle();
    var batch = pendingBatch && pendingBatch.button === button ? pendingBatch : null;
    pendingBatch = null;
    assignmentSession = batch || {
      button: button,
      policy: policy,
      names: [companies[ci].n],
      batch: false
    };
    var result = previousOpenAssignment.apply(this, arguments);
    document.getElementById('supportAssignmentPolicyV53').textContent = policy.replace(/\s*[·｜]?\s*政策精准扶持名单$/, '');
    if (batch) document.getElementById('supportAssignmentCompanyV53').textContent = '已选择 ' + batch.names.length + ' 家企业：' + batch.names.join('、');
    return result;
  };
  var previousCloseAssignment = window.closeSupportAssignmentV53;
  if (typeof previousCloseAssignment === 'function') window.closeSupportAssignmentV53 = function () {
    assignmentSession = null;
    pendingBatch = null;
    return previousCloseAssignment.apply(this, arguments);
  };
  var previousConfirmAssignment = window.confirmSupportAssignmentV53;
  if (typeof previousConfirmAssignment === 'function') window.confirmSupportAssignmentV53 = function () {
    var session = assignmentSession;
    if (!session) return;
    var result = previousConfirmAssignment.apply(this, arguments);
    var manager = session.button && session.button.dataset.manager;
    if (!manager) return result;
    var added = 0;
    session.names.forEach(function (name) {
      var key = assignmentKey(name, session.policy);
      if (!assignments.has(key)) { assignments.set(key, manager); added += 1; }
      if (policyTitle() === session.policy) selectedNames.delete(name);
    });
    window.renderCompanies();
    if (session.batch && typeof toast === 'function') toast('已将 ' + added + ' 家企业加入扶持名单，跟进负责人：' + manager);
    return result;
  };
  bulkButton.addEventListener('click', function () {
    reconcileSelection();
    if (!selectedNames.size || typeof window.openSupportAssignmentV53 !== 'function') return;
    pendingBatch = {
      button: document.createElement('button'),
      policy: policyTitle(),
      names: Array.from(selectedNames),
      batch: true
    };
    window.openSupportAssignmentV53(pendingBatch.button);
  });
  var title = document.getElementById('supportResultTitle');
  if (title) new MutationObserver(function () { window.renderCompanies(); }).observe(title, { childList: true, characterData: true, subtree: true });
  window.renderCompanies();
})();

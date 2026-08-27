(function () {
  'use strict';
  var filterV111 = 'priority', pageV111 = 1, pageSizeV111 = 10, companyV111 = '';
  var applyingV111 = false, frameV111 = 0, observerV111 = null;
  var ownersV111 = ['李明', '王磊', '周宁', '陈雨', '赵新'];
  var financeV111 = [
    { name: '营业收入', unit: '亿元', values: [24.1, 31.2, 38.6], color: '#2478ed' },
    { name: '利润总额', unit: '亿元', values: [2.46, 3.28, 4.32], color: '#16a078' },
    { name: '净利润', unit: '亿元', values: [1.98, 2.71, 3.68], color: '#6d5ce7' },
    { name: '总资产', unit: '亿元', values: [68.4, 78.2, 89.6], color: '#0f91bd' },
    { name: '总负债', unit: '亿元', values: [39.9, 46.7, 54.8], color: '#e18a28' },
    { name: '资产负债率', unit: '%', values: [58.4, 59.7, 61.2], color: '#db5967' },
    { name: '纳税总额', unit: '亿元', values: [1.26, 1.68, 2.18], color: '#238a6b' }
  ];
  var scoresV111 = [
    { name: '产业链节点相关度', score: 94, weight: 30, basis: '补齐车规级 MCU、功率器件薄弱节点', confidence: '高' },
    { name: '扩张意愿度', score: 86, weight: 20, basis: '招聘、设备采购、增资信号一致', confidence: '中' },
    { name: '风险合规度', score: 88, weight: 20, basis: '无重大红线，重点事项需持续核验', confidence: '较高' },
    { name: '技术创新力', score: 93, weight: 15, basis: '发明授权、专利增量及权威资质较强', confidence: '高' },
    { name: '财务营收能力', score: 85, weight: 15, basis: '营收利润增长，负债率有所抬升', confidence: '中高' }
  ];

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }
  function enc(value) { return encodeURIComponent(String(value == null ? '' : value)); }
  function companies() { return typeof followedInvestmentCompanies !== 'undefined' && Array.isArray(followedInvestmentCompanies) ? followedInvestmentCompanies : []; }
  function tip(message) { if (typeof toast === 'function') toast(message); }
  function now() {
    var date = new Date(), pad = function (value) { return String(value).padStart(2, '0'); };
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
  }
  function defaults(item, index) {
    if (!item.followedAt) item.followedAt = '2026-08-' + String(index % 20 + 1).padStart(2, '0') + ' 09:' + String(index * 7 % 60).padStart(2, '0');
    if ((item.priorityFollowed || item.riskPending) && !item.owner) item.owner = ownersV111[index % ownersV111.length];
    if (!item.status) item.status = 'pending';
  }
  function state(item) {
    if (item.priorityFollowed) return 'priority';
    if (item.riskPending) return 'risk';
    return item.status === 'report' ? 'report' : 'pending';
  }
  function label(value) { return { priority: '重点跟进', risk: '风险待核验', pending: '待尽调', report: '已尽调' }[value] || '待尽调'; }
  function filtered() { return companies().filter(function (item) { return state(item) === filterV111; }); }
  function count(value) { return companies().filter(function (item) { return state(item) === value; }).length; }

  function renderTabs() {
    var mount = document.querySelector('#dueDiligence .due-kpis');
    if (!mount) return;
    var tabs = [['priority', '重点跟进的', '已进入重点推进', '★'], ['risk', '风险待核验的', '等待补充资料核验', '!'], ['pending', '待尽调', '尚未生成有效报告', '…'], ['report', '已尽调', '已生成有效报告', '✓']];
    mount.innerHTML = tabs.map(function (tab) {
      var selected = filterV111 === tab[0];
      return '<article class="card due-workflow-tab-v111 ' + tab[0] + (selected ? ' active' : '') + '" role="tab" tabindex="0" aria-selected="' + selected + '" onclick="setDueWorkflowV111(\'' + tab[0] + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();setDueWorkflowV111(\'' + tab[0] + '\')}"><i>' + tab[3] + '</i><span>' + tab[1] + '</span><b>' + count(tab[0]) + ' 家</b><em>' + tab[2] + '</em></article>';
    }).join('');
  }
  function actions(item, itemState) {
    var name = enc(item.name);
    if (itemState === 'pending') return '<button class="primary start" type="button" onclick="startDueFromFollowed(decodeURIComponent(\'' + name + '\'))">去尽调</button>';
    var html = '<button class="secondary report" type="button" onclick="openDueReport(decodeURIComponent(\'' + name + '\'))">查看报告</button>';
    if (itemState === 'priority') html += '<button class="primary workflow" type="button" onclick="openDueFollowPlanV111(decodeURIComponent(\'' + name + '\'))">' + (item.followPlan ? '查看跟进计划' : '建立跟进计划') + '</button>';
    if (itemState === 'risk') html += '<button class="primary verify" type="button" onclick="openDueRiskVerifyV111(decodeURIComponent(\'' + name + '\'))">补充资料核验</button>';
    return html;
  }
  function pagination() {
    var section = document.querySelector('#dueDiligence .followed-investments'), node = document.getElementById('dueFlatPagination');
    if (!section) return null;
    if (!node) { node = document.createElement('div'); node.id = 'dueFlatPagination'; node.className = 'due-flat-pagination'; section.appendChild(node); }
    return node;
  }
  function renderList() {
    var rows = document.getElementById('followedInvestmentRows');
    if (!rows) return;
    companies().forEach(defaults); renderTabs();
    document.querySelectorAll('#dueDiligence .due-status-filter-v70').forEach(function (node) { node.setAttribute('aria-hidden', 'true'); });
    var table = rows.closest('table');
    if (table && table.tHead) table.tHead.innerHTML = '<tr><th>企业名称</th><th>重点赛道</th><th>所在地</th><th>纳入关注时间</th><th>尽调状态</th><th>责任人</th><th>尽调时间</th><th>操作</th></tr>';
    var all = filtered(), pages = Math.max(1, Math.ceil(all.length / pageSizeV111));
    if (pageV111 > pages) pageV111 = pages;
    var visible = all.slice((pageV111 - 1) * pageSizeV111, pageV111 * pageSizeV111);
    rows.innerHTML = visible.map(function (item) {
      var itemState = state(item);
      return '<tr data-due-state-v111="' + itemState + '"><td><b>' + esc(item.name) + '</b><span>招商关注企业</span></td><td>' + esc(item.track || '重点产业链') + '</td><td>' + esc(item.location || '待核验') + '</td><td>' + esc(item.followedAt || '—') + '</td><td><span class="due-list-status ' + itemState + '">' + label(itemState) + '</span></td><td><span class="due-owner-v111 ' + (item.owner ? 'assigned' : '') + '">' + esc(item.owner || '待分配') + '</span></td><td>' + esc(item.dueAt || '—') + '</td><td><div class="due-row-actions-v111">' + actions(item, itemState) + '</div></td></tr>';
    }).join('') || '<tr><td colspan="8"><div class="due-empty-v111">当前页签暂无企业</div></td></tr>';
    var badge = document.getElementById('followedInvestmentCount');
    if (badge) badge.textContent = all.length + ' 家' + label(filterV111);
    var pager = pagination();
    if (pager) pager.innerHTML = '<span>共 ' + all.length + ' 条，每页 ' + pageSizeV111 + ' 条</span><div><button type="button" onclick="setDueWorkflowPageV111(' + (pageV111 - 1) + ')"' + (pageV111 === 1 ? ' disabled' : '') + '>上一页</button><em>第 ' + pageV111 + ' / ' + pages + ' 页</em><button type="button" onclick="setDueWorkflowPageV111(' + (pageV111 + 1) + ')"' + (pageV111 === pages ? ' disabled' : '') + '>下一页</button></div>';
  }
  window.setDueWorkflowV111 = function (value) {
    if (['priority', 'risk', 'pending', 'report'].indexOf(value) < 0) return;
    filterV111 = value; pageV111 = 1; renderList(); tip('已切换至“' + label(value) + '”名单');
  };
  window.setDueWorkflowPageV111 = function (value) {
    var pages = Math.max(1, Math.ceil(filtered().length / pageSizeV111));
    pageV111 = Math.min(pages, Math.max(1, Number(value) || 1)); renderList();
  };
  window.setDueListFilter = function (value) { if (['priority', 'risk', 'pending', 'report'].indexOf(value) >= 0) filterV111 = value; pageV111 = 1; renderList(); };
  window.setDuePool66 = window.setDueListFilter;
  window.renderFollowedInvestmentList = renderList;

  function currentCompany() {
    var node = document.getElementById('dueSummaryCompany');
    return (node && node.textContent.trim()) || companyV111 || (typeof currentDueCompany !== 'undefined' ? currentDueCompany : '');
  }
  function findCompany(name, create) {
    var item = companies().find(function (candidate) { return candidate.name === name; });
    if (!item && create) {
      item = { name: name, track: '重点产业链项目', location: '待核验', fit: 86, status: 'report', followedAt: now(), dueAt: now(), priorityFollowed: false, riskPending: false };
      companies().unshift(item);
    }
    return item;
  }
  function ownerOptions(selected) { return ownersV111.map(function (name) { return '<option value="' + esc(name) + '"' + (selected === name ? ' selected' : '') + '>' + esc(name) + '</option>'; }).join(''); }
  function ensureModals() {
    if (!document.getElementById('dueNextActionModalV111')) document.body.insertAdjacentHTML('beforeend', '<div class="prototype-modal-backdrop due-workflow-modal-v111" id="dueNextActionModalV111" aria-hidden="true"><section class="prototype-modal" role="dialog" aria-modal="true" aria-labelledby="dueNextActionTitleV111"><header><div><label>NEXT BEST ACTION</label><h2 id="dueNextActionTitleV111">选择下一步动作</h2><p id="dueNextActionCompanyV111"></p></div><button type="button" aria-label="关闭" onclick="closeDueModalV111(\'dueNextActionModalV111\')">×</button></header><div class="prototype-modal-body"><div class="due-next-options-v111"><button type="button" data-action="priority" onclick="selectDueNextActionV111(\'priority\')"><i>★</i><b>标记重点跟进</b><span>分配责任人并建立招商跟进计划</span></button><button type="button" data-action="risk" onclick="selectDueNextActionV111(\'risk\')"><i>!</i><b>标记风险待定</b><span>分配责任人并补充资料完成核验</span></button><button type="button" data-action="remove" onclick="selectDueNextActionV111(\'remove\')"><i>×</i><b>移除关注名单</b><span>不再关注，保留历史报告与审计记录</span></button></div><div class="due-next-form-v111" id="dueNextOwnerPanelV111" hidden><label><span>跟进责任人 <em>*</em></span><input id="dueNextOwnerV111" list="dueOwnerListV111" placeholder="输入姓名联想搜索"><small>责任人将在首页名单中展示，并接收后续任务。</small></label></div><div class="due-next-form-v111 remove" id="dueNextRemovePanelV111" hidden><label><span>移除原因 <em>*</em></span><textarea id="dueNextRemoveReasonV111" placeholder="请简要说明不再关注的原因"></textarea></label></div><datalist id="dueOwnerListV111">' + ownersV111.map(function (name) { return '<option value="' + name + '"></option>'; }).join('') + '</datalist></div><footer><span>选择后将同步更新首页状态、责任人和后续任务。</span><button class="secondary" type="button" onclick="closeDueModalV111(\'dueNextActionModalV111\')">取消</button><button class="primary" type="button" onclick="confirmDueNextActionV111()">确认动作</button></footer></section></div>');
    if (!document.getElementById('dueFollowPlanModalV111')) document.body.insertAdjacentHTML('beforeend', '<div class="prototype-modal-backdrop due-workflow-modal-v111" id="dueFollowPlanModalV111" aria-hidden="true"><section class="prototype-modal" role="dialog" aria-modal="true" aria-labelledby="dueFollowPlanTitleV111"><header><div><label>INVESTMENT FOLLOW-UP PLAN</label><h2 id="dueFollowPlanTitleV111">建立招商跟进计划</h2><p id="dueFollowPlanCompanyV111"></p></div><button type="button" onclick="closeDueModalV111(\'dueFollowPlanModalV111\')">×</button></header><div class="prototype-modal-body due-task-form-v111"><label><span>责任人</span><select id="duePlanOwnerV111">' + ownerOptions('') + '</select></label><label><span>当前阶段</span><select id="duePlanStageV111"><option>初步接洽</option><option>需求核验</option><option>方案对接</option><option>项目评审</option><option>签约落地</option></select></label><label><span>下次跟进日期</span><input id="duePlanDateV111" type="date" value="2026-09-05"></label><label><span>协同部门</span><input id="duePlanDeptV111" value="投资促进中心、产业发展处"></label><label class="full"><span>跟进目标与里程碑</span><textarea id="duePlanGoalV111" placeholder="例如：完成企业扩产需求核验，组织本地上下游供需对接"></textarea></label></div><footer><button class="secondary" type="button" onclick="closeDueModalV111(\'dueFollowPlanModalV111\')">取消</button><button class="primary" type="button" onclick="saveDueFollowPlanV111()">保存跟进计划</button></footer></section></div>');
    if (!document.getElementById('dueRiskVerifyModalV111')) document.body.insertAdjacentHTML('beforeend', '<div class="prototype-modal-backdrop due-workflow-modal-v111" id="dueRiskVerifyModalV111" aria-hidden="true"><section class="prototype-modal" role="dialog" aria-modal="true" aria-labelledby="dueRiskVerifyTitleV111"><header><div><label>RISK VERIFICATION</label><h2 id="dueRiskVerifyTitleV111">补充资料核验</h2><p id="dueRiskVerifyCompanyV111"></p></div><button type="button" onclick="closeDueModalV111(\'dueRiskVerifyModalV111\')">×</button></header><div class="prototype-modal-body due-task-form-v111"><label><span>核验责任人</span><select id="dueRiskOwnerV111">' + ownerOptions('') + '</select></label><label><span>核验结论</span><select id="dueRiskConclusionV111"><option value="pending">资料仍需补充</option><option value="clear">风险已澄清</option><option value="confirmed">风险已确认</option></select></label><label class="full"><span>待核验事项</span><input id="dueRiskMatterV111" value="核验司法案件进展、环保验收及新增产线资本开支"></label><label class="full due-file-v111"><span>证明材料</span><input id="dueRiskFilesV111" type="file" multiple><small>支持上传企业说明、政府公示、审计材料等证明文件。</small></label><label class="full"><span>核验说明</span><textarea id="dueRiskNoteV111" placeholder="记录资料核验过程、结论依据及后续建议"></textarea></label></div><footer><button class="secondary" type="button" onclick="closeDueModalV111(\'dueRiskVerifyModalV111\')">取消</button><button class="secondary" type="button" onclick="saveDueRiskVerifyV111(false)">保存进度</button><button class="primary" type="button" onclick="saveDueRiskVerifyV111(true)">完成核验并形成新版</button></footer></section></div>');
    document.querySelectorAll('.due-workflow-modal-v111').forEach(function (modal) {
      if (modal.dataset.boundV111) return;
      modal.dataset.boundV111 = '1';
      modal.addEventListener('click', function (event) { if (event.target === modal) window.closeDueModalV111(modal.id); });
    });
  }
  function openModal(id) { var modal = document.getElementById(id); if (!modal) return; modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
  window.closeDueModalV111 = function (id) { var modal = document.getElementById(id); if (modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); } if (!document.querySelector('.due-workflow-modal-v111.open')) document.body.style.overflow = ''; };
  window.openDueNextActionV111 = function () {
    ensureModals(); companyV111 = currentCompany();
    document.getElementById('dueNextActionCompanyV111').textContent = companyV111 + ' · 基于当前报告进行人工业务判断';
    document.querySelectorAll('#dueNextActionModalV111 [data-action]').forEach(function (button) { button.classList.remove('active'); });
    var modal = document.getElementById('dueNextActionModalV111'); modal.dataset.action = '';
    document.getElementById('dueNextOwnerPanelV111').hidden = true; document.getElementById('dueNextRemovePanelV111').hidden = true;
    document.getElementById('dueNextOwnerV111').value = ''; document.getElementById('dueNextRemoveReasonV111').value = ''; openModal('dueNextActionModalV111');
  };
  window.selectDueNextActionV111 = function (action) {
    var modal = document.getElementById('dueNextActionModalV111'); if (!modal) return; modal.dataset.action = action;
    modal.querySelectorAll('[data-action]').forEach(function (button) { button.classList.toggle('active', button.dataset.action === action); });
    document.getElementById('dueNextOwnerPanelV111').hidden = action === 'remove'; document.getElementById('dueNextRemovePanelV111').hidden = action !== 'remove';
    if (action !== 'remove') setTimeout(function () { document.getElementById('dueNextOwnerV111').focus(); }, 30);
  };
  window.confirmDueNextActionV111 = function () {
    var modal = document.getElementById('dueNextActionModalV111'), action = modal && modal.dataset.action;
    if (!action) return tip('请选择一个下一步动作');
    var item = findCompany(companyV111 || currentCompany(), true);
    if (action === 'remove') {
      var reason = document.getElementById('dueNextRemoveReasonV111').value.trim();
      if (!reason) { document.getElementById('dueNextRemoveReasonV111').focus(); return tip('请填写移除原因'); }
      var index = companies().indexOf(item); if (index >= 0) companies().splice(index, 1);
      window.closeDueModalV111('dueNextActionModalV111'); renderList(); if (typeof show === 'function') show('dueDiligence'); return tip('已移出关注名单，历史尽调报告和操作记录已保留');
    }
    var owner = document.getElementById('dueNextOwnerV111').value.trim();
    if (!owner) { document.getElementById('dueNextOwnerV111').focus(); return tip('请选择或输入责任人'); }
    item.owner = owner; item.assignedAt = now(); item.status = 'report';
    if (action === 'priority') { item.priorityFollowed = true; item.riskPending = false; filterV111 = 'priority'; tip('已标记重点跟进并分配给 ' + owner); }
    else { item.riskPending = true; item.priorityFollowed = false; filterV111 = 'risk'; tip('已标记风险待核验并分配给 ' + owner); }
    pageV111 = 1; window.closeDueModalV111('dueNextActionModalV111'); renderList(); syncGuidance();
  };
  window.openDueFollowPlanV111 = function (name) {
    ensureModals(); companyV111 = name; var item = findCompany(name, false);
    document.getElementById('dueFollowPlanCompanyV111').textContent = name; document.getElementById('dueFollowPlanTitleV111').textContent = item && item.followPlan ? '查看与更新招商跟进计划' : '建立招商跟进计划';
    document.getElementById('duePlanOwnerV111').value = item && item.owner || ownersV111[0]; document.getElementById('duePlanStageV111').value = item && item.followPlan && item.followPlan.stage || '初步接洽'; document.getElementById('duePlanDateV111').value = item && item.followPlan && item.followPlan.date || '2026-09-05'; document.getElementById('duePlanDeptV111').value = item && item.followPlan && item.followPlan.department || '投资促进中心、产业发展处'; document.getElementById('duePlanGoalV111').value = item && item.followPlan && item.followPlan.goal || ''; openModal('dueFollowPlanModalV111');
  };
  window.saveDueFollowPlanV111 = function () {
    var item = findCompany(companyV111, false), goal = document.getElementById('duePlanGoalV111').value.trim(); if (!item) return;
    if (!goal) { document.getElementById('duePlanGoalV111').focus(); return tip('请填写跟进目标与里程碑'); }
    item.owner = document.getElementById('duePlanOwnerV111').value; item.followPlan = { stage: document.getElementById('duePlanStageV111').value, date: document.getElementById('duePlanDateV111').value, department: document.getElementById('duePlanDeptV111').value.trim(), goal: goal, updatedAt: now(), status: 'IN_PROGRESS' };
    window.closeDueModalV111('dueFollowPlanModalV111'); renderList(); tip('招商跟进计划已建立，并同步至责任人任务');
  };
  window.openDueRiskVerifyV111 = function (name) {
    ensureModals(); companyV111 = name; var item = findCompany(name, false); document.getElementById('dueRiskVerifyCompanyV111').textContent = name;
    document.getElementById('dueRiskOwnerV111').value = item && item.owner || ownersV111[0]; document.getElementById('dueRiskConclusionV111').value = item && item.riskVerification && item.riskVerification.conclusion || 'pending'; document.getElementById('dueRiskMatterV111').value = item && item.riskVerification && item.riskVerification.matter || '核验司法案件进展、环保验收及新增产线资本开支'; document.getElementById('dueRiskNoteV111').value = item && item.riskVerification && item.riskVerification.note || ''; openModal('dueRiskVerifyModalV111');
  };
  window.saveDueRiskVerifyV111 = function (complete) {
    var item = findCompany(companyV111, false); if (!item) return;
    var conclusion = document.getElementById('dueRiskConclusionV111').value, files = document.getElementById('dueRiskFilesV111').files;
    item.owner = document.getElementById('dueRiskOwnerV111').value; item.riskVerification = { matter: document.getElementById('dueRiskMatterV111').value.trim(), conclusion: conclusion, note: document.getElementById('dueRiskNoteV111').value.trim(), materialCount: files ? files.length : 0, updatedAt: now(), status: complete ? 'COMPLETED' : 'VERIFYING' };
    if (complete) {
      if (conclusion === 'pending') return tip('完成核验前请选择“风险已澄清”或“风险已确认”');
      item.riskPending = false; item.priorityFollowed = false; item.status = 'report'; item.dueAt = now(); item.reportVersion = (item.reportVersion || 1) + 1; filterV111 = 'report'; window.closeDueModalV111('dueRiskVerifyModalV111'); tip('核验已完成，并形成尽调报告 V' + item.reportVersion + '.0 新版本');
    } else tip('核验进度已保存');
    pageV111 = 1; renderList();
  };

  function section(number) {
    var sections = document.querySelectorAll('#dueEvidenceReportV99 .due-evidence-section-v99');
    for (var i = 0; i < sections.length; i += 1) {
      var marker = sections[i].querySelector('.due-section-number-v99');
      if (marker && marker.textContent.replace(/\s+/g, '') === number) return sections[i];
    }
    return null;
  }
  function financeSvg(metric, index) {
    var left = 26, right = 218, top = 17, bottom = 70, min = Math.min.apply(null, metric.values), max = Math.max.apply(null, metric.values), padding = Math.max((max - min) * .25, max * .04, .1);
    min -= padding; max += padding;
    var points = metric.values.map(function (value, i) { return { x: left + (right - left) * i / 2, y: bottom - (value - min) / (max - min) * (bottom - top), value: value }; });
    return '<svg viewBox="0 0 240 104" role="img" aria-label="' + esc(metric.name) + ' 2023 至 2025 年趋势折线图"><defs><linearGradient id="financeFillV111' + index + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + metric.color + '" stop-opacity=".22"/><stop offset="1" stop-color="' + metric.color + '" stop-opacity="0"/></linearGradient></defs><path class="grid" d="M' + left + ' ' + top + 'H' + right + ' M' + left + ' ' + ((top + bottom) / 2) + 'H' + right + ' M' + left + ' ' + bottom + 'H' + right + '"/><polygon points="' + points.map(function (point) { return point.x + ',' + point.y; }).join(' ') + ' ' + right + ',' + bottom + ' ' + left + ',' + bottom + '" fill="url(#financeFillV111' + index + ')"/><polyline points="' + points.map(function (point) { return point.x + ',' + point.y; }).join(' ') + '" fill="none" stroke="' + metric.color + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' + points.map(function (point, i) { return '<circle cx="' + point.x + '" cy="' + point.y + '" r="4" fill="#fff" stroke="' + metric.color + '" stroke-width="2"><title>' + (2023 + i) + ' 年：' + point.value + metric.unit + '</title></circle><text x="' + point.x + '" y="' + (point.y - 8) + '" text-anchor="middle" class="value">' + point.value + '</text><text x="' + point.x + '" y="91" text-anchor="middle" class="year">' + (2023 + i) + '</text>'; }).join('') + '</svg>';
  }
  function renderFinance() {
    var target = section('04'); if (!target || target.querySelector('.due-finance-trends-v111')) return;
    var table = target.querySelector('.due-trend-table-v99'); if (!table) return;
    var grid = document.createElement('div'); grid.className = 'due-finance-trends-v111';
    grid.innerHTML = financeV111.map(function (metric, index) { var first = metric.values[0], last = metric.values[2], change = ((last - first) / Math.abs(first) * 100).toFixed(1); return '<article><header><div><span>' + esc(metric.name) + '</span><b>' + last + ' <small>' + metric.unit + '</small></b></div><em class="' + (Number(change) >= 0 ? 'up' : 'down') + '">' + (Number(change) >= 0 ? '↑' : '↓') + ' ' + Math.abs(change) + '% <small>较 2023 年</small></em></header>' + financeSvg(metric, index) + '</article>'; }).join('');
    table.replaceWith(grid);
  }
  function radarPoint(value, index, radius) { var angle = -Math.PI / 2 + index * Math.PI * 2 / 5; return [150 + Math.cos(angle) * radius * value / 100, 140 + Math.sin(angle) * radius * value / 100]; }
  function radarPolygon(value) { return scoresV111.map(function (_, index) { var p = radarPoint(value, index, 96); return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
  function renderRadar() {
    var target = section('08'); if (!target || target.querySelector('.due-score-visual-v111')) return;
    var table = target.querySelector('.due-score-table-v99'); if (!table) return;
    var chart = scoresV111.map(function (item, index) { var p = radarPoint(item.score, index, 96); return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
    var labels = scoresV111.map(function (item, index) { var p = radarPoint(118, index, 96), anchor = p[0] < 130 ? 'end' : (p[0] > 170 ? 'start' : 'middle'); return '<text x="' + p[0].toFixed(1) + '" y="' + p[1].toFixed(1) + '" text-anchor="' + anchor + '"><tspan x="' + p[0].toFixed(1) + '">' + esc(item.name) + '</tspan><tspan x="' + p[0].toFixed(1) + '" dy="15" class="score">' + item.score + ' 分</tspan></text>'; }).join('');
    var visual = document.createElement('div'); visual.className = 'due-score-visual-v111';
    visual.innerHTML = '<div class="due-radar-v111"><div class="due-radar-summary-v111"><span>综合评分</span><b>90</b><em>A · 建议重点跟进</em></div><svg viewBox="0 0 300 290" role="img" aria-label="招商适配度五维雷达图，综合评分 90 分，评级 A">' + [20, 40, 60, 80, 100].map(function (value) { return '<polygon points="' + radarPolygon(value) + '" class="grid"/>'; }).join('') + scoresV111.map(function (_, index) { var p = radarPoint(100, index, 96); return '<line x1="150" y1="140" x2="' + p[0] + '" y2="' + p[1] + '" class="axis"/>'; }).join('') + '<polygon points="' + chart + '" class="area"/>' + scoresV111.map(function (item, index) { var p = radarPoint(item.score, index, 96); return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4"><title>' + esc(item.name) + '：' + item.score + ' 分，权重 ' + item.weight + '%</title></circle>'; }).join('') + labels + '</svg></div><div class="due-score-details-v111">' + scoresV111.map(function (item) { return '<article><div><span>' + esc(item.name) + '</span><b>' + item.score + '<small> / 100</small></b></div><i><em style="width:' + item.score + '%"></em></i><p>' + esc(item.basis) + '</p><footer><span>权重 ' + item.weight + '%</span><span>可信度 ' + esc(item.confidence) + '</span></footer></article>'; }).join('') + '</div>';
    table.replaceWith(visual);
  }
  function syncGuidance() {
    var item = findCompany(currentCompany(), false), itemState = item ? state(item) : 'report', badge = document.getElementById('dueGuidanceStateV111');
    if (badge) { badge.textContent = label(itemState); badge.className = 'due-guidance-state-v111 ' + itemState; }
  }
  function renderGuidance() {
    var report = document.getElementById('dueReport'); if (!report) return;
    var guidance = report.querySelector('.due-report-guidance');
    if (!guidance) { guidance = document.createElement('section'); guidance.className = 'card due-report-guidance'; report.appendChild(guidance); }
    if (!guidance.querySelector('#dueNextActionV111')) guidance.innerHTML = '<div class="due-report-guidance-copy"><i>→</i><div><div class="due-guidance-title-v111"><h2>报告研判完成，请选择下一步动作</h2><span id="dueGuidanceStateV111" class="due-guidance-state-v111">已尽调</span></div><p>人工判断后可进入重点跟进、风险资料核验，或移出关注名单，形成完整招商业务闭环。</p></div></div><div class="due-report-guidance-actions"><button class="primary" id="dueNextActionV111" type="button" onclick="openDueNextActionV111()">下一步动作&nbsp; →</button></div>';
    if (report.lastElementChild !== guidance) report.appendChild(guidance); syncGuidance();
  }
  function annotations() {
    if (!window.prototypeLogicAnnotations) return;
    var due = window.prototypeLogicAnnotations.dueDiligence;
    if (due) {
      due.fields = (due.fields || []).filter(function (item) { return !item || item[0] !== '企业尽调四状态工作台'; });
      due.fields.push(['企业尽调四状态工作台', '首页按重点跟进、风险待核验、待尽调、已尽调四个互斥工作流状态统计企业，数量、列表与分页实时联动。', '招商关注名单、尽调报告状态、跟进状态、风险状态', '业务动作后实时更新']);
      due.interactions = (due.interactions || []).filter(function (item) { return !item || item[0] !== '尽调业务闭环'; });
      due.interactions.push(['尽调业务闭环', '在报告底部点击“下一步动作”，选择重点跟进、风险待定或移除关注。', '分配责任人后，首页分别出现建立跟进计划或补充资料核验入口；核验完成形成新报告版本。']);
    }
    var report = window.prototypeLogicAnnotations.dueReport;
    if (report) {
      report.fields = (report.fields || []).filter(function (item) { return !item || (item[0] !== '经营与财务趋势图' && item[0] !== '招商适配度雷达图'); });
      report.fields.push(['经营与财务趋势图', '以七张独立折线图展示营业收入、利润、资产负债、资产负债率和纳税总额的 2023—2025 年变化，避免不同量纲混绘。', '企业库财务字段、公开年报、税务公开信息', '随报告数据快照更新']);
      report.fields.push(['招商适配度雷达图', '以五维雷达图展示产业链相关度、扩张意愿、风险合规、技术创新和财务能力，同时保留权重、关键依据和可信度。', '招商适配评分模型、企业库、产业链图谱、联网证据', '随模型版本及报告更新']);
    }
  }
  function applyReport() {
    if (applyingV111) return; applyingV111 = true;
    try { renderFinance(); renderRadar(); renderGuidance(); annotations(); } finally { applyingV111 = false; }
  }
  function schedule(delay) { setTimeout(function () { if (frameV111) cancelAnimationFrame(frameV111); frameV111 = requestAnimationFrame(function () { frameV111 = 0; applyReport(); }); }, delay || 0); }
  function init() {
    ensureModals(); companies().forEach(defaults); setTimeout(renderList, 80); setTimeout(renderList, 500);
    if (typeof window.openDueReport === 'function' && !window.openDueReport.__dueV111Wrapped) {
      var previous = window.openDueReport, wrapped = function (name) { companyV111 = name || companyV111; var result = previous.apply(this, arguments); schedule(820); return result; };
      wrapped.__dueV111Wrapped = true; window.openDueReport = wrapped;
    }
    var report = document.getElementById('dueReport');
    if (report && !observerV111) { observerV111 = new MutationObserver(function () { if (!applyingV111) schedule(35); }); observerV111.observe(report, { childList: true, subtree: true }); }
    schedule(800);
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') document.querySelectorAll('.due-workflow-modal-v111.open').forEach(function (modal) { window.closeDueModalV111(modal.id); }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
}());

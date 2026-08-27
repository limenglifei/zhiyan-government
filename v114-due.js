(function () {
  'use strict';

  var draftsV114 = { priority: '', risk: '' };

  function tipV114(message) {
    if (typeof window.toast === 'function') window.toast(message);
  }

  function nowV114() {
    var date = new Date();
    var pad = function (value) { return String(value).padStart(2, '0'); };
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
  }

  function companiesV114() {
    return typeof followedInvestmentCompanies !== 'undefined' && Array.isArray(followedInvestmentCompanies) ? followedInvestmentCompanies : [];
  }

  function currentCompanyV114() {
    var summary = document.getElementById('dueSummaryCompany');
    if (summary && summary.textContent.trim()) return summary.textContent.trim();
    var caption = document.getElementById('dueNextActionCompanyV111');
    return caption ? caption.textContent.split('·')[0].trim() : '';
  }

  function findCompanyV114(name) {
    return companiesV114().find(function (item) { return item && item.name === name; });
  }

  function ensureMatterFieldV114() {
    var ownerPanel = document.getElementById('dueNextOwnerPanelV111');
    if (!ownerPanel) return null;
    var panel = document.getElementById('dueNextMatterPanelV114');
    if (!panel) {
      ownerPanel.insertAdjacentHTML('beforeend', '<div class="due-next-matter-v114" id="dueNextMatterPanelV114" hidden><label><span id="dueNextMatterLabelV114">跟进事项 <em>*</em></span><textarea id="dueNextMatterV114" maxlength="500" aria-required="true" placeholder="请填写本次重点跟进的具体事项"></textarea><small id="dueNextMatterHelpV114">该事项将同步至责任人任务，并作为招商跟进计划的默认目标。</small></label></div>');
      panel = document.getElementById('dueNextMatterPanelV114');
      var input = document.getElementById('dueNextMatterV114');
      if (input) input.addEventListener('input', function () { input.removeAttribute('aria-invalid'); });
    }
    var riskTitle = document.querySelector('#dueNextActionModalV111 [data-action="risk"] b');
    if (riskTitle) riskTitle.textContent = '标记风险待核验';
    return panel;
  }

  function showMatterFieldV114(action) {
    var panel = ensureMatterFieldV114();
    var input = document.getElementById('dueNextMatterV114');
    var label = document.getElementById('dueNextMatterLabelV114');
    var help = document.getElementById('dueNextMatterHelpV114');
    if (!panel || !input) return;
    var visible = action === 'priority' || action === 'risk';
    panel.hidden = !visible;
    input.removeAttribute('aria-invalid');
    if (!visible) return;
    input.value = draftsV114[action] || '';
    if (action === 'risk') {
      label.innerHTML = '风险待核验事项 <em>*</em>';
      input.placeholder = '请填写需要补充资料或人工核验的风险事项';
      help.textContent = '该事项将同步至责任人任务，并自动带入后续“补充资料核验”。';
    } else {
      label.innerHTML = '跟进事项 <em>*</em>';
      input.placeholder = '请填写本次重点跟进的具体事项';
      help.textContent = '该事项将同步至责任人任务，并作为招商跟进计划的默认目标。';
    }
  }

  function validateActionV114(action) {
    if (action !== 'priority' && action !== 'risk') return { action: action };
    var owner = document.getElementById('dueNextOwnerV111');
    var matter = document.getElementById('dueNextMatterV114');
    if (!owner || !owner.value.trim()) {
      if (owner) owner.focus();
      tipV114('请选择或输入责任人');
      return null;
    }
    if (!matter || !matter.value.trim()) {
      if (matter) {
        matter.setAttribute('aria-invalid', 'true');
        matter.focus();
      }
      tipV114(action === 'risk' ? '请填写风险待核验事项' : '请填写跟进事项');
      return null;
    }

    var companyName = currentCompanyV114();
    var value = matter.value.trim();
    var createdAt = nowV114();
    draftsV114[action] = value;
    return {
      action: action,
      companyName: companyName,
      owner: owner.value.trim(),
      matter: value,
      createdAt: createdAt
    };
  }

  function persistActionV114(payload) {
    if (!payload || (payload.action !== 'priority' && payload.action !== 'risk')) return;
    var item = findCompanyV114(payload.companyName);
    if (!item) return;
    item.nextAction = { type: payload.action, matter: payload.matter, owner: payload.owner, createdAt: payload.createdAt };
    if (payload.action === 'priority') {
      item.followUpMatter = payload.matter;
    } else {
      item.riskVerification = Object.assign({}, item.riskVerification || {}, {
        matter: payload.matter,
        status: 'PENDING',
        updatedAt: payload.createdAt
      });
    }
  }

  function wrapActionsV114() {
    if (typeof window.openDueNextActionV111 === 'function' && !window.openDueNextActionV111.__matterV114) {
      var previousOpen = window.openDueNextActionV111;
      var openWrapped = function () {
        var result = previousOpen.apply(this, arguments);
        draftsV114 = { priority: '', risk: '' };
        ensureMatterFieldV114();
        var input = document.getElementById('dueNextMatterV114');
        if (input) input.value = '';
        showMatterFieldV114('');
        return result;
      };
      openWrapped.__matterV114 = true;
      window.openDueNextActionV111 = openWrapped;
    }

    if (typeof window.selectDueNextActionV111 === 'function' && !window.selectDueNextActionV111.__matterV114) {
      var previousSelect = window.selectDueNextActionV111;
      var selectWrapped = function (action) {
        var modal = document.getElementById('dueNextActionModalV111');
        var previousAction = modal && modal.dataset.action;
        var input = document.getElementById('dueNextMatterV114');
        if (input && (previousAction === 'priority' || previousAction === 'risk')) draftsV114[previousAction] = input.value;
        var result = previousSelect.apply(this, arguments);
        showMatterFieldV114(action);
        return result;
      };
      selectWrapped.__matterV114 = true;
      window.selectDueNextActionV111 = selectWrapped;
    }

    if (typeof window.confirmDueNextActionV111 === 'function' && !window.confirmDueNextActionV111.__matterV114) {
      var previousConfirm = window.confirmDueNextActionV111;
      var confirmWrapped = function () {
        var modal = document.getElementById('dueNextActionModalV111');
        var action = modal && modal.dataset.action;
        var payload = validateActionV114(action);
        if (!payload) return;
        var result = previousConfirm.apply(this, arguments);
        persistActionV114(payload);
        return result;
      };
      confirmWrapped.__matterV114 = true;
      window.confirmDueNextActionV111 = confirmWrapped;
    }

    if (typeof window.openDueFollowPlanV111 === 'function' && !window.openDueFollowPlanV111.__matterV114) {
      var previousPlan = window.openDueFollowPlanV111;
      var planWrapped = function (name) {
        var result = previousPlan.apply(this, arguments);
        var item = findCompanyV114(name);
        var goal = document.getElementById('duePlanGoalV111');
        if (goal && !goal.value.trim() && item && item.followUpMatter) goal.value = item.followUpMatter;
        return result;
      };
      planWrapped.__matterV114 = true;
      window.openDueFollowPlanV111 = planWrapped;
    }
  }

  function updateAnnotationsV114() {
    if (!window.prototypeLogicAnnotations || !window.prototypeLogicAnnotations.dueDiligence) return;
    var due = window.prototypeLogicAnnotations.dueDiligence;
    due.fields = (due.fields || []).filter(function (item) { return !item || item[0] !== '下一步动作事项'; });
    due.fields.push(['下一步动作事项', '标记重点跟进必须填写跟进事项；标记风险待核验必须填写风险待核验事项。事项与责任人同步保存。', '尽调报告人工研判结果、责任人任务', '确认动作时写入']);
    due.interactions = (due.interactions || []).filter(function (item) { return !item || item[0] !== '事项与后续任务联动'; });
    due.interactions.push(['事项与后续任务联动', '确认重点跟进或风险待核验。', '跟进事项自动带入招商跟进计划；风险待核验事项自动带入补充资料核验任务。']);
  }

  function initV114() {
    ensureMatterFieldV114();
    wrapActionsV114();
    updateAnnotationsV114();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initV114, { once: true });
  else initV114();
}());

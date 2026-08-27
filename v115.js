(function () {
  'use strict';

  var dueFilterV115 = 'all';
  var duePageV115 = 1;
  var duePageSizeV115 = 10;
  var dueApplyingV115 = false;
  var dueFrameV115 = 0;

  function escV115(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function encV115(value) {
    return encodeURIComponent(String(value == null ? '' : value)).replace(/'/g, '%27');
  }
  function companiesV115() {
    return typeof followedInvestmentCompanies !== 'undefined' && Array.isArray(followedInvestmentCompanies)
      ? followedInvestmentCompanies.filter(Boolean) : [];
  }
  function tipV115(message) { if (typeof window.toast === 'function') window.toast(message); }

  function dueStateV115(item) {
    if (item && item.priorityFollowed) return 'priority';
    if (item && item.riskPending) return 'risk';
    return item && item.status === 'report' ? 'report' : 'pending';
  }

  function dueLabelV115(value) {
    return {
      all: '我关注全部名单',
      pending: '待尽调',
      report: '已尽调',
      priority: '重点跟进',
      risk: '风险待核验'
    }[value] || '我关注全部名单';
  }

  function dueCountV115(value) {
    if (value === 'all') return companiesV115().length;
    return companiesV115().filter(function (item) { return dueStateV115(item) === value; }).length;
  }

  function dueFilteredV115() {
    if (dueFilterV115 === 'all') return companiesV115().slice();
    return companiesV115().filter(function (item) { return dueStateV115(item) === dueFilterV115; });
  }

  function dueActionsV115(item) {
    var itemState = dueStateV115(item);
    var name = encV115(item.name);
    if (itemState === 'pending') {
      return '<button class="primary start" type="button" onclick="startDueFromFollowed(decodeURIComponent(\'' + name + '\'))">去尽调</button>';
    }
    var html = '<button class="secondary report" type="button" onclick="openDueReport(decodeURIComponent(\'' + name + '\'))">查看报告</button>';
    if (itemState === 'priority') {
      html += '<button class="primary workflow" type="button" onclick="openDueFollowPlanV111(decodeURIComponent(\'' + name + '\'))">' + (item.followPlan ? '查看跟进计划' : '建立跟进计划') + '</button>';
    }
    if (itemState === 'risk') {
      html += '<button class="primary verify" type="button" onclick="openDueRiskVerifyV111(decodeURIComponent(\'' + name + '\'))">补充资料核验</button>';
    }
    return html;
  }

  function duePagerV115() {
    var section = document.querySelector('#dueDiligence .followed-investments');
    if (!section) return null;
    var pager = document.getElementById('dueFlatPagination');
    if (!pager) {
      pager = document.createElement('div');
      pager.id = 'dueFlatPagination';
      pager.className = 'due-flat-pagination';
      section.appendChild(pager);
    }
    return pager;
  }

  function renderDueWorkbenchV115() {
    var mount = document.querySelector('#dueDiligence .due-kpis');
    var rows = document.getElementById('followedInvestmentRows');
    if (!mount || !rows) return;
    dueApplyingV115 = true;
    try {
      var tabs = [
        ['all', '我关注全部名单', '全部招商关注企业', '◎'],
        ['pending', '待尽调', '尚未生成有效报告', '…'],
        ['report', '已尽调', '已生成有效报告', '✓'],
        ['priority', '重点跟进', '已进入重点推进', '★'],
        ['risk', '风险待核验', '等待补充资料核验', '!']
      ];
      mount.innerHTML = tabs.map(function (tab) {
        var selected = dueFilterV115 === tab[0];
        return '<article data-due-workbench-v115="1" class="card due-workflow-tab-v111 ' + tab[0] + (selected ? ' active' : '') + '" role="tab" tabindex="0" aria-selected="' + selected + '" onclick="setDueWorkflowV111(\'' + tab[0] + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();setDueWorkflowV111(\'' + tab[0] + '\')}"><i>' + tab[3] + '</i><span>' + tab[1] + '</span><b>' + dueCountV115(tab[0]) + ' 家</b><em>' + tab[2] + '</em></article>';
      }).join('');

      document.querySelectorAll('#dueDiligence .due-status-filter-v70').forEach(function (node) {
        node.hidden = true;
        node.style.setProperty('display', 'none', 'important');
        node.setAttribute('aria-hidden', 'true');
      });
      var table = rows.closest('table');
      if (table && table.tHead) {
        table.tHead.innerHTML = '<tr><th>企业名称</th><th>重点赛道</th><th>所在地</th><th>纳入关注时间</th><th>尽调状态</th><th>责任人</th><th>尽调时间</th><th>操作</th></tr>';
      }

      var all = dueFilteredV115();
      var pages = Math.max(1, Math.ceil(all.length / duePageSizeV115));
      if (duePageV115 > pages) duePageV115 = pages;
      var visible = all.slice((duePageV115 - 1) * duePageSizeV115, duePageV115 * duePageSizeV115);
      rows.innerHTML = visible.map(function (item) {
        var itemState = dueStateV115(item);
        return '<tr data-due-row-v115="1" data-due-state-v111="' + itemState + '"><td><b>' + escV115(item.name) + '</b><span>招商关注企业</span></td><td>' + escV115(item.track || '重点产业链') + '</td><td>' + escV115(item.location || '待核验') + '</td><td>' + escV115(item.followedAt || '—') + '</td><td><span class="due-list-status ' + itemState + '">' + dueLabelV115(itemState) + '</span></td><td><span class="due-owner-v111 ' + (item.owner ? 'assigned' : '') + '">' + escV115(item.owner || '待分配') + '</span></td><td>' + escV115(item.dueAt || '—') + '</td><td><div class="due-row-actions-v111">' + dueActionsV115(item) + '</div></td></tr>';
      }).join('') || '<tr data-due-row-v115="1"><td colspan="8"><div class="due-empty-v111">当前页签暂无企业</div></td></tr>';

      var badge = document.getElementById('followedInvestmentCount');
      if (badge) badge.textContent = all.length + ' 家 · ' + dueLabelV115(dueFilterV115);
      var pager = duePagerV115();
      if (pager) {
        pager.innerHTML = '<span data-due-pager-v115="1">共 ' + all.length + ' 条，每页 ' + duePageSizeV115 + ' 条</span><div><button type="button" onclick="setDueWorkflowPageV111(' + (duePageV115 - 1) + ')"' + (duePageV115 === 1 ? ' disabled' : '') + '>上一页</button><em>第 ' + duePageV115 + ' / ' + pages + ' 页</em><button type="button" onclick="setDueWorkflowPageV111(' + (duePageV115 + 1) + ')"' + (duePageV115 === pages ? ' disabled' : '') + '>下一页</button></div>';
      }
    } finally {
      dueApplyingV115 = false;
    }
  }

  function scheduleDueV115(delay) {
    window.clearTimeout(dueFrameV115);
    dueFrameV115 = window.setTimeout(renderDueWorkbenchV115, delay || 20);
  }

  function installDueWorkbenchV115() {
    if (window.__dueWorkbenchV115Installed) {
      scheduleDueV115(20);
      return;
    }
    window.__dueWorkbenchV115Installed = true;
    window.setDueWorkflowV111 = function (value) {
      if (['all', 'pending', 'report', 'priority', 'risk'].indexOf(value) < 0) return;
      dueFilterV115 = value;
      duePageV115 = 1;
      renderDueWorkbenchV115();
      tipV115('已切换至“' + dueLabelV115(value) + '”');
    };
    window.setDueWorkflowPageV111 = function (value) {
      var pages = Math.max(1, Math.ceil(dueFilteredV115().length / duePageSizeV115));
      duePageV115 = Math.min(pages, Math.max(1, Number(value) || 1));
      renderDueWorkbenchV115();
    };
    window.setDueListFilter = window.setDueWorkflowV111;
    window.setDuePool66 = window.setDueWorkflowV111;
    window.renderFollowedInvestmentList = renderDueWorkbenchV115;

    var previousConfirm = window.confirmDueNextActionV111;
    if (typeof previousConfirm === 'function' && !previousConfirm.__workbenchV115) {
      var wrappedConfirm = function () {
        var modal = document.getElementById('dueNextActionModalV111');
        var action = modal && modal.dataset.action;
        var result = previousConfirm.apply(this, arguments);
        if (modal && !modal.classList.contains('open')) {
          dueFilterV115 = action === 'remove' ? 'all' : (action === 'priority' || action === 'risk' ? action : dueFilterV115);
          duePageV115 = 1;
          scheduleDueV115(30);
        }
        return result;
      };
      wrappedConfirm.__workbenchV115 = true;
      window.confirmDueNextActionV111 = wrappedConfirm;
    }

    var section = document.querySelector('#dueDiligence .followed-investments');
    var kpis = document.querySelector('#dueDiligence .due-kpis');
    if (section && kpis) {
      new MutationObserver(function () {
        if (dueApplyingV115) return;
        var rows = document.getElementById('followedInvestmentRows');
        var pager = document.getElementById('dueFlatPagination');
        var stale = !kpis.querySelector('[data-due-workbench-v115]') ||
          (rows && rows.firstElementChild && !rows.firstElementChild.hasAttribute('data-due-row-v115')) ||
          (pager && !pager.querySelector('[data-due-pager-v115]'));
        if (stale) scheduleDueV115(15);
      }).observe(section, { childList: true, subtree: true });
      new MutationObserver(function () {
        if (!dueApplyingV115 && !kpis.querySelector('[data-due-workbench-v115]')) scheduleDueV115(15);
      }).observe(kpis, { childList: true, subtree: true });
    }
    scheduleDueV115(620);
  }

  function restoreInvestmentWorkspaceV115() {
    var view = document.getElementById('investment');
    if (view) view.classList.remove('investment-home-active-v113');
    var home = document.getElementById('investmentHomeV113');
    if (home) home.remove();
    window.openInvestmentHomeV113 = function () {
      if (typeof show === 'function') show('investment');
      var target = document.getElementById('investment');
      if (target) target.classList.remove('investment-home-active-v113');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    var nav = document.querySelector('.side .nav[data-view="investment"]');
    if (nav) {
      nav.dataset.homeV113 = '0';
      nav.onclick = function () {
        if (typeof show === 'function') show('investment');
        var target = document.getElementById('investment');
        if (target) target.classList.remove('investment-home-active-v113');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }
    if (window.prototypeLogicAnnotations && window.prototypeLogicAnnotations.investment) {
      var note = window.prototypeLogicAnnotations.investment;
      note.fields = (note.fields || []).filter(function (item) { return !item || item[0] !== '招商线索雷达首页'; });
      note.interactions = (note.interactions || []).filter(function (item) { return !item || item[0] !== '招商首页进入产业链分析'; });
    }
  }

  function installDirectChainEditorV115() {
    var previousEdit = window.editChainGraphV47;
    window.editChainGraphV47 = function (index) {
      if (typeof window.openChainBasicV61 === 'function' && typeof window.openChainCanvasFromBasicV61 === 'function') {
        window.openChainBasicV61(index);
        window.openChainCanvasFromBasicV61();
        return;
      }
      if (typeof previousEdit === 'function') return previousEdit.apply(this, arguments);
    };

    function decorateList() {
      if (typeof activeKnowledgeType === 'undefined' || activeKnowledgeType !== 'chain') return;
      document.querySelectorAll('#kbTableBody tr').forEach(function (row, position) {
        var item = typeof activeKnowledgeRows !== 'undefined' && activeKnowledgeRows[position];
        if (!item) return;
        var edit = Array.from(row.querySelectorAll('.chain-row-actions-v47 button')).find(function (button) {
          return button.textContent.trim() === '编辑';
        });
        if (edit) {
          edit.title = '直接进入产业链骨架编辑';
          edit.onclick = function (event) {
            event.stopPropagation();
            window.editChainGraphV47(item.index);
          };
        }
      });
    }

    var previousRender = window.renderKnowledgeList;
    if (typeof previousRender === 'function' && !previousRender.__directChainV115) {
      var wrappedRender = function () {
        var result = previousRender.apply(this, arguments);
        decorateList();
        return result;
      };
      wrappedRender.__directChainV115 = true;
      window.renderKnowledgeList = wrappedRender;
    }
    decorateList();

    if (window.prototypeLogicAnnotations && window.prototypeLogicAnnotations.knowledgeList) {
      var knowledge = window.prototypeLogicAnnotations.knowledgeList;
      knowledge.interactions = (knowledge.interactions || []).filter(function (item) {
        return !item || item[0] !== '产业链骨架直接编辑';
      });
      knowledge.interactions.push(['产业链骨架直接编辑', '点击产业链列表操作列“编辑”或详情中的画布入口。', '不展示产业链基本信息中间弹窗，直接进入独立二级骨架编辑页；页面不保留内嵌弹窗标题、阴影和圆角。']);
    }
  }

  function initV115() {
    restoreInvestmentWorkspaceV115();
    installDirectChainEditorV115();
    installDueWorkbenchV115();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initV115, { once: true });
  else initV115();
}());

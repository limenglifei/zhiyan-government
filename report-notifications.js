(function () {
  'use strict';

  const prefix = 'zhiyan-government.report-notice.v1.';
  const hashPrefix = '#report-notice=';
  const types = {
    due: { label: '企业尽调', title: '尽调报告已生成' },
    radar: { label: '招商雷达', title: '强链补链分析报告已生成' },
    policy: { label: '政策匹配', title: '政策匹配报告已生成' },
    support: { label: '政策扶持', title: '政策精准扶持报告已生成' }
  };
  const messageTime = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'medium'
  });
  const volatile = new Map();
  let update = () => {};

  function knownType(kind) {
    return Object.prototype.hasOwnProperty.call(types, kind);
  }

  function valid(message) {
    return message && typeof message.id === 'string' && knownType(message.kind) &&
      typeof message.subject === 'string' && Number.isFinite(message.createdAt);
  }

  function read(key) {
    if (volatile.has(key)) return volatile.get(key);
    try {
      const message = JSON.parse(localStorage.getItem(key));
      return valid(message) ? message : null;
    } catch { return null; }
  }

  function write(message) {
    const key = prefix + message.id;
    try {
      localStorage.setItem(key, JSON.stringify(message));
      volatile.delete(key);
    } catch { volatile.set(key, message); }
  }

  function messages() {
    const keys = new Set(volatile.keys());
    try {
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (key?.startsWith(prefix)) keys.add(key);
      }
    } catch { /* In private contexts the current tab keeps its own notifications. */ }
    return Array.from(keys, read).filter(Boolean).sort((a, b) => b.createdAt - a.createdAt);
  }

  function safeRadarHref(href) {
    if (!href) return '';
    try {
      const target = new URL(href, location.href);
      const expected = new URL('chain-strength-report.html', location.href);
      if (target.origin === expected.origin && target.protocol === expected.protocol && target.pathname === expected.pathname) return target.href;
    } catch { /* The link cannot be opened. */ }
    return '';
  }

  function complete({ kind, subject, context, href, id } = {}) {
    if (!knownType(kind) || typeof subject !== 'string' || !subject.trim()) return null;
    const messageId = id || window.crypto?.randomUUID?.() || Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
    const existing = read(prefix + messageId);
    if (existing) return existing.id;
    write({
      id: messageId, kind, subject: subject.trim(), context,
      href: kind === 'radar' ? safeRadarHref(href) : '', createdAt: Date.now(), read: false
    });
    update();
    return messageId;
  }

  function completePolicy(subject) {
    // The report context is assigned by the region module when the result becomes visible.
    queueMicrotask(() => {
      const mode = document.getElementById('epModeSelectV70')?.value || 'foreign';
      const context = window.enterpriseTargetRegion?.getReportContext() || { mode, region: null };
      complete({ kind: 'policy', subject, context });
    });
  }

  function completeSupport(parsed = false) {
    const context = window.captureSupportReport?.(parsed);
    if (!context?.title) return;
    const subject = context.project || context.title.replace(/政策精准扶持名单$/, '') || context.title;
    complete({ kind: 'support', subject, context });
  }

  window.zhiyanReportNotifications = { complete, completePolicy, completeSupport };

  function markRead(message) {
    if (!message.read) write({ ...message, read: true });
  }

  function reopenPolicy(message) {
    const page = document.getElementById('enterprisePolicy');
    if (!page || page.classList.contains('match-loading')) return false;
    window.show('enterprisePolicy');
    window.setEpModeV68?.(message.context?.mode);
    document.getElementById('epSearch').value = message.subject;
    page.querySelector('.ep-company h2').textContent = message.subject;
    page.classList.add('matched');
    document.getElementById('enterpriseMatchBtn').textContent = '✦ 重新匹配政策';
    window.enterpriseTargetRegion?.restoreReportContext(message.context || null);
    page.querySelector('.ep-overview-grid')?.scrollIntoView({ block: 'start' });
    return true;
  }

  function reopen(message) {
    if (message.kind === 'due' && typeof window.openDueReport === 'function') {
      if (document.getElementById('dueGenerateBtn')?.disabled) return false;
      window.openDueReport(message.subject);
      return true;
    }
    if (message.kind === 'radar') return window.reopenWholeChainReportV71?.(message.context?.chainKey);
    if (message.kind === 'policy') return reopenPolicy(message);
    if (message.kind === 'support') return window.reopenSupportReport?.(message.context);
    return false;
  }

  function openSavedReport(id) {
    const message = read(prefix + id);
    if (!message) {
      window.toast?.('当前浏览器没有这条报告记录');
      return false;
    }
    if (!reopen(message)) {
      window.toast?.('暂时无法打开该报告，请在当前任务完成后重试');
      return false;
    }
    markRead(message);
    update();
    return true;
  }

  function itemMarkup(message) {
    const { label, title } = types[message.kind];
    const item = document.createElement('li');
    item.className = 'report-notice__item' + (message.read ? '' : ' report-notice__item--unread');
    const link = document.createElement('a');
    link.dataset.noticeId = message.id;
    const standalone = safeRadarHref(message.href);
    link.href = standalone || hashPrefix + encodeURIComponent(message.id);
    if (standalone) {
      link.target = '_blank';
      link.rel = 'noopener';
    }
    link.innerHTML = '<div class="report-notice__meta"><b></b><time></time></div><strong></strong><p></p><small>查看报告</small>';
    link.querySelector('b').textContent = label;
    const date = new Date(message.createdAt);
    link.querySelector('time').dateTime = date.toISOString();
    link.querySelector('time').textContent = messageTime.format(date);
    link.querySelector('strong').textContent = (message.read ? '' : '未读 · ') + title;
    link.querySelector('p').textContent = message.subject;
    item.appendChild(link);
    return item;
  }

  function mount() {
    const actions = document.querySelector('.topbar .top-actions');
    if (!actions) return;
    const root = document.createElement('div');
    root.className = 'report-notice';
    root.innerHTML = `
      <button type="button" class="report-notice__trigger" aria-label="报告通知" aria-expanded="false" aria-controls="reportNoticePanel" title="报告通知">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0"/></svg>
        <b class="report-notice__badge" aria-hidden="true" hidden></b>
      </button>
      <section class="report-notice__panel" id="reportNoticePanel" aria-labelledby="reportNoticeTitle" hidden>
        <header><h2 id="reportNoticeTitle">报告通知</h2><button type="button" data-notice-read-all>全部已读</button></header>
        <div class="report-notice__filters" role="group" aria-label="通知筛选">
          <button type="button" data-notice-filter="all" aria-pressed="true">全部消息</button>
          <button type="button" data-notice-filter="unread" aria-pressed="false">未读</button>
        </div>
        <ul class="report-notice__list"></ul>
        <p class="report-notice__empty" hidden></p>
      </section>`;
    actions.insertBefore(root, actions.querySelector('.avatar'));
    const trigger = root.querySelector('.report-notice__trigger');
    const badge = root.querySelector('.report-notice__badge');
    const panel = root.querySelector('.report-notice__panel');
    const list = root.querySelector('.report-notice__list');
    const empty = root.querySelector('.report-notice__empty');
    const filters = root.querySelector('.report-notice__filters');
    const unreadFilter = filters.querySelector('[data-notice-filter="unread"]');
    const readAll = root.querySelector('[data-notice-read-all]');
    let filter = 'all';

    update = () => {
      const all = messages();
      const unread = all.filter(message => !message.read);
      badge.hidden = !unread.length;
      badge.textContent = unread.length > 99 ? '99+' : String(unread.length);
      trigger.setAttribute('aria-label', unread.length ? `报告通知，${unread.length} 条未读` : '报告通知');
      if (panel.hidden) return;
      readAll.disabled = !unread.length;
      unreadFilter.textContent = unread.length ? `未读（${unread.length}）` : '未读';
      const items = filter === 'unread' ? unread : all;
      const focusId = document.activeElement?.dataset.noticeId;
      list.replaceChildren(...items.map(itemMarkup));
      empty.hidden = !!items.length;
      empty.textContent = filter === 'unread' ? '暂无未读消息' : '生成报告后，完成通知会显示在这里。';
      if (focusId) Array.from(list.querySelectorAll('a')).find(link => link.dataset.noticeId === focusId)?.focus();
    };

    function toggle(open, restoreFocus = false) {
      panel.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      if (open) update();
      if (restoreFocus) trigger.focus();
    }

    trigger.addEventListener('click', () => toggle(panel.hidden));
    filters.addEventListener('click', event => {
      const selected = event.target.closest('[data-notice-filter]');
      if (!selected) return;
      filter = selected.dataset.noticeFilter;
      filters.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button === selected)));
      update();
    });
    readAll.addEventListener('click', () => {
      messages().forEach(markRead);
      update();
      filters.querySelector('[aria-pressed="true"]').focus();
    });
    list.addEventListener('click', event => {
      const link = event.target.closest('a[data-notice-id]');
      if (!link) return;
      if (link.target === '_blank') {
        const message = read(prefix + link.dataset.noticeId);
        if (message) markRead(message);
        toggle(false, true);
        update();
        return;
      }
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (openSavedReport(link.dataset.noticeId)) {
        try { history.replaceState(history.state, '', link.hash); } catch { /* The in-page report is already open. */ }
        toggle(false, true);
      }
    });
    document.addEventListener('pointerdown', event => {
      if (!panel.hidden && !root.contains(event.target)) toggle(false);
    });
    document.addEventListener('keydown', event => {
      if (!panel.hidden && event.key === 'Escape') { event.preventDefault(); toggle(false, true); }
    });
    function followHash() {
      if (!location.hash.startsWith(hashPrefix)) return;
      let id;
      try { id = decodeURIComponent(location.hash.slice(hashPrefix.length)); } catch { return; }
      if (id) openSavedReport(id);
    }
    document.querySelector('.side')?.addEventListener('click', event => {
      if (event.target.closest('[data-view]') && location.hash.startsWith(hashPrefix)) {
        try { history.replaceState(history.state, '', location.href.split('#')[0]); } catch { /* Navigation already changed the view. */ }
      }
    });
    window.addEventListener('hashchange', followHash);
    window.addEventListener('storage', event => { if (event.key === null || event.key.startsWith(prefix)) update(); });
    update();
    followHash();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();

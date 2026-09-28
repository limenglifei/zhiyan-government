(function () {
  'use strict';

  let instanceNumber = 0;
  const levelNames = ['门类', '大类', '中类', '小类'];

  window.createSupportIndustryPickerV120 = function (container, options) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) throw new Error('行业选择器缺少容器');
    options = options || {};
    const items = (window.supportIndustryDataV120 && window.supportIndustryDataV120.items) || [];
    const nodes = new Map(items.map(item => [String(item.code), {
      code: String(item.code), name: item.name, level: Number(item.level),
      parent: item.parent === null || item.parent === undefined || item.parent === '' ? null : String(item.parent)
    }]));
    const children = new Map();
    nodes.forEach(node => {
      if (!children.has(node.parent)) children.set(node.parent, []);
      children.get(node.parent).push(node);
    });
    children.forEach(list => list.sort((a, b) => a.code.localeCompare(b.code, 'zh-CN', { numeric: true })));
    const paths = new Map();
    function nodePath(code) {
      if (paths.has(code)) return paths.get(code);
      const result = [];
      const visited = new Set();
      let node = nodes.get(code);
      while (node && !visited.has(node.code)) {
        result.unshift(node);
        visited.add(node.code);
        node = nodes.get(node.parent);
      }
      paths.set(code, result);
      return result;
    }
    function pathLabel(code) { return nodePath(code).map(node => node.name).join(' / '); }
    function isAncestor(parent, child) {
      return parent !== child && nodePath(child).some(node => node.code === parent);
    }
    function normalize(codes) {
      const valid = [...new Set((Array.isArray(codes) ? codes : []).map(String))].filter(code => nodes.has(code));
      return valid.filter(code => !valid.some(parent => isAncestor(parent, code)));
    }

    let selected = [];
    let activePath = [];
    let opened = false;
    let searchLimit = 80;
    const uid = 'supportIndustryV120-' + (++instanceNumber);
    const root = document.createElement('div');
    root.className = 'support-industry-v120';
    root.innerHTML = '<button type="button" class="industry-trigger-v120" aria-expanded="false" aria-controls="' + uid + '-panel"><span class="industry-trigger-label-v120">不限行业</span><span class="industry-trigger-arrow-v120" aria-hidden="true">⌄</span></button>' +
      '<div class="industry-selected-v120" aria-label="已选行业"></div>' +
      '<div class="industry-panel-v120" id="' + uid + '-panel" hidden>' +
        '<div class="industry-search-row-v120"><label class="industry-search-v120"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg><input type="search" autocomplete="off" placeholder="搜索行业名称或编码" aria-label="搜索国民经济行业名称或编码" aria-controls="' + uid + '-content"></label><button type="button" class="industry-search-clear-v120" hidden>清除搜索</button><button type="button" class="industry-collapse-v120" aria-label="收起行业选择">收起</button></div>' +
        '<div class="industry-path-v120" aria-live="polite"></div>' +
        '<div id="' + uid + '-content" class="industry-content-v120"></div>' +
        '<div class="industry-panel-note-v120"><span>可选任意层级，多选行业；选择上级即包含其下全部行业。</span><button type="button" class="industry-reset-v120">不限行业</button></div>' +
      '</div>' +
      '<span class="industry-announcement-v120" role="status" aria-live="polite"></span>';
    container.replaceChildren(root);
    const trigger = root.querySelector('.industry-trigger-v120');
    const triggerLabel = root.querySelector('.industry-trigger-label-v120');
    const chips = root.querySelector('.industry-selected-v120');
    const panel = root.querySelector('.industry-panel-v120');
    const search = root.querySelector('input[type="search"]');
    const clearSearch = root.querySelector('.industry-search-clear-v120');
    const breadcrumb = root.querySelector('.industry-path-v120');
    const content = root.querySelector('.industry-content-v120');
    const announcement = root.querySelector('.industry-announcement-v120');
    const dialog = container.closest('dialog');

    function makeButton(text, className, action) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = className;
      button.textContent = text;
      button.addEventListener('click', action);
      return button;
    }
    function selectedAncestor(code) { return selected.find(parent => isAncestor(parent, code)); }
    function emitChange() {
      announcement.textContent = selected.length ? '已选择 ' + selected.length + ' 项行业' : '行业范围不限';
      if (typeof options.onChange === 'function') options.onChange(selected.slice());
    }
    function toggleCode(code) {
      if (selectedAncestor(code)) return;
      if (selected.includes(code)) selected = selected.filter(value => value !== code);
      else selected = normalize(selected.concat(code));
      render();
      emitChange();
    }
    function navigate(code) {
      activePath = nodePath(code).map(node => node.code).slice(0, 3);
      renderContent();
      const columns = content.querySelector('.industry-columns-v120');
      if (columns && columns.scrollWidth > content.clientWidth) {
        const nextColumnEdge = columns.scrollWidth / 4 * (activePath.length + 1);
        content.scrollLeft = Math.max(0, nextColumnEdge - content.clientWidth);
      }
    }
    function createChoice(node, allLabel) {
      const row = document.createElement('div');
      row.className = 'industry-option-v120';
      if (activePath[node.level - 1] === node.code) row.classList.add('is-active');
      const ancestor = selectedAncestor(node.code);
      const isSelected = selected.includes(node.code);
      const descendantsSelected = !isSelected && !ancestor && selected.some(code => isAncestor(node.code, code));
      if (isSelected || ancestor) row.classList.add('is-selected');
      const label = document.createElement('label');
      label.className = 'industry-check-v120';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = isSelected || !!ancestor;
      input.indeterminate = descendantsSelected;
      input.disabled = !!ancestor;
      input.dataset.industryCode = node.code;
      input.setAttribute('aria-label', (allLabel ? '选择全部' : '选择') + pathLabel(node.code));
      if (ancestor) input.title = '已包含在所选的' + nodes.get(ancestor).name + '中';
      input.addEventListener('change', () => toggleCode(node.code));
      label.append(input);
      const name = makeButton('', 'industry-option-name-v120', () => {
        if (allLabel || !children.has(node.code)) toggleCode(node.code);
        else navigate(node.code);
      });
      name.dataset.industryNav = node.code;
      name.title = pathLabel(node.code) + '（' + node.code + '）';
      if (!allLabel) {
        const code = document.createElement('span');
        code.className = 'industry-code-v120';
        code.textContent = node.code;
        name.append(code);
      }
      const text = document.createElement('span');
      text.textContent = allLabel || node.name;
      name.append(text);
      if (!allLabel && children.has(node.code)) {
        const arrow = document.createElement('span');
        arrow.className = 'industry-next-v120';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '›';
        name.append(arrow);
        name.setAttribute('aria-label', '查看' + node.name + '的下级行业');
      }
      row.append(label, name);
      return row;
    }
    function renderColumns() {
      const grid = document.createElement('div');
      grid.className = 'industry-columns-v120';
      levelNames.forEach((name, index) => {
        const column = document.createElement('section');
        column.className = 'industry-column-v120';
        column.setAttribute('aria-label', (index + 1) + '级' + name);
        const heading = document.createElement('div');
        heading.className = 'industry-column-title-v120';
        heading.textContent = name;
        const list = document.createElement('div');
        list.className = 'industry-column-list-v120';
        list.dataset.industryColumn = String(index);
        if (index === 0) {
          const all = makeButton('全部行业', 'industry-all-v120' + (selected.length ? '' : ' is-selected'), () => {
            selected = [];
            render();
            emitChange();
          });
          list.append(all);
        }
        const parentCode = index === 0 ? null : activePath[index - 1];
        if (index > 0 && parentCode && nodes.has(parentCode)) list.append(createChoice(nodes.get(parentCode), '全部'));
        const values = index === 0 || parentCode ? children.get(parentCode) || [] : [];
        values.forEach(node => list.append(createChoice(node)));
        if (!values.length) {
          const empty = document.createElement('div');
          empty.className = 'industry-column-empty-v120';
          empty.textContent = nodes.size ? '请先选择' + levelNames[index - 1] : '行业数据暂不可用';
          list.append(empty);
        }
        column.append(heading, list);
        grid.append(column);
      });
      content.append(grid);
    }
    function renderSearch(query) {
      const tokens = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
      const matches = Array.from(nodes.values()).filter(node => {
        const haystack = (node.code + ' ' + node.name + ' ' + pathLabel(node.code)).toLocaleLowerCase();
        return tokens.every(token => haystack.includes(token));
      }).sort((a, b) => {
        function score(node) {
          const value = query.toLocaleLowerCase();
          if (node.code.toLocaleLowerCase() === value || node.name.toLocaleLowerCase() === value) return 0;
          if (node.name.toLocaleLowerCase().startsWith(value) || node.code.toLocaleLowerCase().startsWith(value)) return 1;
          if (node.name.toLocaleLowerCase().includes(value)) return 2;
          return 3;
        }
        return score(a) - score(b) || a.code.localeCompare(b.code, 'zh-CN', { numeric: true });
      });
      const count = document.createElement('div');
      count.className = 'industry-search-count-v120';
      count.textContent = matches.length ? '找到 ' + matches.length + ' 个行业' : '未找到相关行业，请尝试其他名称或编码';
      const results = document.createElement('div');
      results.className = 'industry-search-results-v120';
      results.setAttribute('aria-label', '行业搜索结果');
      matches.slice(0, searchLimit).forEach(node => {
        const item = document.createElement('div');
        item.className = 'industry-search-item-v120';
        const row = createChoice(node);
        const resultName = makeButton(node.name, 'industry-result-name-v120', () => toggleCode(node.code));
        resultName.dataset.industryResultCode = node.code;
        row.querySelector('.industry-option-name-v120').replaceWith(resultName);
        const badge = document.createElement('span');
        badge.className = 'industry-level-v120';
        badge.textContent = node.code + ' · ' + node.level + '级';
        row.append(badge);
        const path = document.createElement('div');
        path.className = 'industry-result-path-v120';
        path.textContent = pathLabel(node.code);
        item.append(row, path);
        results.append(item);
      });
      if (matches.length > searchLimit) results.append(makeButton('显示更多行业', 'industry-more-v120', () => {
        const top = results.scrollTop;
        searchLimit += 80;
        renderContent();
        content.querySelector('.industry-search-results-v120').scrollTop = top;
      }));
      content.append(count, results);
    }
    function renderContent() {
      const scrolls = Array.from(content.querySelectorAll('[data-industry-column]'), list => list.scrollTop);
      const resultScroll = content.querySelector('.industry-search-results-v120');
      const resultScrollTop = resultScroll ? resultScroll.scrollTop : 0;
      const focused = document.activeElement;
      const focusCode = focused && content.contains(focused) ? focused.dataset.industryCode : null;
      const focusNav = focused && content.contains(focused) ? focused.dataset.industryNav : null;
      const focusResult = focused && content.contains(focused) ? focused.dataset.industryResultCode : null;
      content.replaceChildren();
      const query = search.value.trim();
      clearSearch.hidden = !query;
      breadcrumb.hidden = !!query;
      breadcrumb.textContent = activePath.length ? activePath.map(code => nodes.get(code).name).join(' / ') : '按国民经济行业分类逐级选择';
      if (query) renderSearch(query);
      else renderColumns();
      content.querySelectorAll('[data-industry-column]').forEach((list, index) => { list.scrollTop = scrolls[index] || 0; });
      const nextResults = content.querySelector('.industry-search-results-v120');
      if (nextResults) nextResults.scrollTop = resultScrollTop;
      const focusTarget = focusCode ? Array.from(content.querySelectorAll('[data-industry-code]')).find(input => input.dataset.industryCode === focusCode) : focusNav ? Array.from(content.querySelectorAll('[data-industry-nav]')).find(button => button.dataset.industryNav === focusNav) : focusResult ? Array.from(content.querySelectorAll('[data-industry-result-code]')).find(button => button.dataset.industryResultCode === focusResult) : null;
      if (focusTarget && !focusTarget.disabled) focusTarget.focus({ preventScroll: true });
    }
    function renderChips() {
      triggerLabel.textContent = selected.length ? '已选择 ' + selected.length + ' 项行业' : '不限行业';
      trigger.classList.toggle('has-selection', selected.length > 0);
      chips.replaceChildren();
      chips.hidden = !selected.length;
      selected.forEach((code, index) => {
        const node = nodes.get(code);
        const chip = makeButton('', 'industry-chip-v120', () => {
          selected = selected.filter(value => value !== code);
          render();
          emitChange();
          const nextChip = chips.children[Math.min(index, chips.children.length - 1)];
          (nextChip || trigger).focus({ preventScroll: true });
        });
        chip.title = pathLabel(code);
        chip.setAttribute('aria-label', '移除行业：' + pathLabel(code));
        const text = document.createElement('span');
        text.textContent = node.name;
        const remove = document.createElement('span');
        remove.textContent = '×';
        remove.setAttribute('aria-hidden', 'true');
        chip.append(text, remove);
        chips.append(chip);
      });
    }
    function render() {
      renderChips();
      if (opened) renderContent();
    }
    function setOpen(value, focusTrigger) {
      opened = value;
      panel.hidden = !opened;
      trigger.setAttribute('aria-expanded', String(opened));
      if (opened) renderContent();
      if (focusTrigger) trigger.focus({ preventScroll: true });
    }
    function closeOnEscape(event) {
      if (!opened || event.key !== 'Escape') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setOpen(false, true);
    }
    trigger.addEventListener('click', () => setOpen(!opened, false));
    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true, false); search.focus(); }
    });
    root.querySelector('.industry-collapse-v120').addEventListener('click', () => setOpen(false, true));
    root.querySelector('.industry-reset-v120').addEventListener('click', () => { selected = []; render(); emitChange(); });
    search.addEventListener('input', () => { searchLimit = 80; renderContent(); });
    search.addEventListener('keydown', event => {
      if (event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); }
    });
    clearSearch.addEventListener('click', () => { search.value = ''; searchLimit = 80; renderContent(); search.focus(); });
    const escapeTarget = dialog || root;
    escapeTarget.addEventListener('keydown', closeOnEscape, true);
    if (dialog) {
      dialog.addEventListener('cancel', event => {
        if (!opened) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        setOpen(false, true);
      }, true);
      dialog.addEventListener('close', () => setOpen(false, false));
    }
    document.addEventListener('click', event => {
      if (opened && !event.composedPath().includes(root)) setOpen(false, false);
    });
    render();
    return {
      setValue(codes) {
        selected = normalize(codes);
        activePath = selected.length ? nodePath(selected[0]).map(node => node.code).slice(0, 3) : [];
        search.value = '';
        searchLimit = 80;
        setOpen(false, false);
        render();
      },
      getValue() { return selected.slice(); }
    };
  };
})();

(function () {
  'use strict';

  // Fixed policy-matching vocabulary. Legacy text is retained until explicitly edited.
  var options = [
    "国家高新技术企业",
    "国家级科技型中小企业",
    "国家级制造业单项冠军示范企业",
    "国家级制造业单项冠军产品企业",
    "国家级制造业单项冠军培育企业",
    "国家企业技术中心",
    "国家技术创新示范企业",
    "国家级科技企业孵化器",
    "国家众创空间",
    "国家级专精特新“小巨人”企业",
    "国家级重点实验室",
    "中国独角兽企业",
    "省级专精特新“小巨人”企业",
    "省级“专精特新”中小企业",
    "省级企业技术中心",
    "省级科技企业孵化器",
    "省级技术创新示范企业",
    "省级隐形冠军企业",
    "省级隐形冠军培育企业",
    "省级科技小巨人企业",
    "省级重点实验室",
    "省级创新型中小企业",
    "省级技术先进型服务企业",
    "省级民营科技企业",
    "省级独角兽企业",
    "省级瞪羚企业",
    "省级雏鹰企业"
];
  var input, trigger, panel, search, list, empty, count, legacy;
  var mounted = false;
  var isOpen = false;
  var namespace = 'enterprise-profile-honors';

  function values() {
    return (input.value || '').split(/[、,，;；/\n]+/).map(function (value) {
      return value.trim();
    }).filter(Boolean);
  }

  function sync() {
    if (!mounted) return;
    var current = values();
    var selected = options.filter(function (option) { return current.indexOf(option) >= 0; });
    var unknown = current.filter(function (value) { return options.indexOf(value) < 0; });
    list.querySelectorAll('input[type="checkbox"]').forEach(function (checkbox) {
      checkbox.checked = selected.indexOf(checkbox.value) >= 0;
    });
    trigger.querySelector('span').textContent = selected.length
      ? selected[0] + (selected.length > 1 ? ' 等 ' + selected.length + ' 项' : '')
      : '请选择荣誉资质（可多选）';
    trigger.title = selected.join('、');
    trigger.classList.toggle('has-value', selected.length > 0);
    count.textContent = '已选择 ' + selected.length + ' 项';
    legacy.textContent = unknown.length ? '原记录：' + unknown.join('、') + '。重新选择或清空将替换原记录。' : '';
    legacy.hidden = !unknown.length;
  }

  function filterOptions() {
    var keyword = search.value.trim().toLowerCase();
    var visible = 0;
    list.querySelectorAll('label').forEach(function (label) {
      var match = label.textContent.toLowerCase().indexOf(keyword) >= 0;
      label.hidden = !match;
      if (match) visible++;
    });
    empty.hidden = visible > 0;
  }

  function position() {
    if (!isOpen) return;
    var rect = trigger.getBoundingClientRect();
    var width = Math.min(Math.max(rect.width, 380), window.innerWidth - 24);
    panel.style.width = width + 'px';
    panel.style.left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)) + 'px';
    var height = panel.offsetHeight;
    var below = window.innerHeight - rect.bottom - 12;
    var above = rect.top - 12;
    panel.style.top = Math.max(12, below >= height || below >= above
      ? Math.min(rect.bottom + 6, window.innerHeight - height - 12)
      : rect.top - height - 6) + 'px';
  }

  function close(restoreFocus) {
    if (!mounted || !isOpen) return;
    isOpen = false;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus();
  }

  function open() {
    sync();
    search.value = '';
    filterOptions();
    list.scrollTop = 0;
    panel.hidden = false;
    isOpen = true;
    trigger.setAttribute('aria-expanded', 'true');
    position();
    search.focus();
  }

  function applyChecked() {
    input.value = Array.from(list.querySelectorAll('input:checked')).map(function (checkbox) {
      return checkbox.value;
    }).join('、');
    input.dispatchEvent(new Event('change', { bubbles: true }));
    sync();
  }

  function mount() {
    if (mounted) return;
    input = document.getElementById('profileHonorV84');
    if (!input) return;
    var label = input.closest('label');
    if (!label) return;
    var field = document.createElement('div');
    field.className = namespace + '-field';
    field.innerHTML = '<span id="enterpriseProfileHonorLabel">荣誉资质</span><div class="' + namespace + '-control"><button type="button" id="enterpriseProfileHonorTrigger" aria-labelledby="enterpriseProfileHonorLabel enterpriseProfileHonorSummary" aria-haspopup="dialog" aria-controls="enterpriseProfileHonorPanel" aria-expanded="false"><span id="enterpriseProfileHonorSummary">请选择荣誉资质（可多选）</span><i aria-hidden="true">⌄</i></button><small hidden></small></div>';
    label.replaceWith(field);
    input.type = 'hidden';
    input.removeAttribute('maxlength');
    input.removeAttribute('placeholder');
    field.querySelector('.' + namespace + '-control').prepend(input);
    trigger = field.querySelector('button');
    legacy = field.querySelector('small');

    panel = document.createElement('section');
    panel.id = 'enterpriseProfileHonorPanel';
    panel.className = namespace + '-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', '选择荣誉资质');
    panel.innerHTML = '<header><input type="search" aria-label="搜索荣誉资质" placeholder="搜索荣誉资质"><button type="button" class="honor-clear">清空</button></header><div class="honor-options" role="group" aria-label="可选荣誉资质"></div><p class="honor-empty" hidden>暂无匹配的荣誉资质</p><footer><span aria-live="polite"></span><button type="button" class="honor-done">完成</button></footer>';
    document.body.appendChild(panel);
    search = panel.querySelector('input[type="search"]');
    list = panel.querySelector('.honor-options');
    empty = panel.querySelector('.honor-empty');
    count = panel.querySelector('footer span');
    options.forEach(function (option) {
      var item = document.createElement('label');
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = option;
      var text = document.createElement('span');
      text.textContent = option;
      item.appendChild(checkbox);
      item.appendChild(text);
      list.appendChild(item);
      checkbox.addEventListener('change', applyChecked);
    });
    trigger.addEventListener('click', function () { if (isOpen) close(false); else open(); });
    search.addEventListener('input', function () { filterOptions(); position(); });
    panel.querySelector('.honor-clear').addEventListener('click', function () {
      input.value = '';
      input.dispatchEvent(new Event('change', { bubbles: true }));
      sync();
    });
    panel.querySelector('.honor-done').addEventListener('click', function () { close(true); });
    document.addEventListener('pointerdown', function (event) {
      if (isOpen && !panel.contains(event.target) && !trigger.contains(event.target)) close(false);
    });
    document.addEventListener('keydown', function (event) {
      if (isOpen && event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close(true);
      }
    }, true);
    document.addEventListener('scroll', function (event) {
      if (isOpen && !panel.contains(event.target)) close(false);
    }, true);
    window.addEventListener('resize', position);
    mounted = true;
    sync();
  }

  var previousOpen = window.openEnterpriseProfile;
  window.openEnterpriseProfile = function () {
    var result = previousOpen.apply(this, arguments);
    mount();
    sync();
    return result;
  };
  var previousClose = window.closeEnterpriseProfile;
  window.closeEnterpriseProfile = function () {
    close(false);
    return previousClose.apply(this, arguments);
  };
  mount();
})();


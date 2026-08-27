(function () {
  'use strict';

  var builder = document.getElementById('graphBuilderModal');
  var knowledgeList = document.getElementById('knowledgeList');
  if (!builder || !knowledgeList || document.getElementById('chainGraphEditorV114')) return;

  var originalParent = builder.parentNode;
  var originalNextSibling = builder.nextSibling;
  var originalBackdropClick = builder.onclick;
  var dialog = builder.querySelector('.graph-builder-dialog');
  var originalDialogRole = dialog && dialog.getAttribute('role');
  var originalDialogAriaModal = dialog && dialog.getAttribute('aria-modal');
  var activeChainIndexV114 = null;
  var pageModeV114 = false;
  var movingV114 = false;

  function chainRowV114() {
    return typeof knowledgeBaseConfigs !== 'undefined' &&
      knowledgeBaseConfigs.chain &&
      knowledgeBaseConfigs.chain.rows &&
      activeChainIndexV114 !== null
      ? knowledgeBaseConfigs.chain.rows[activeChainIndexV114]
      : null;
  }

  function ensurePageV114() {
    var page = document.getElementById('chainGraphEditorV114');
    if (page) return page;

    page = document.createElement('section');
    page.id = 'chainGraphEditorV114';
    page.className = 'content view chain-graph-editor-page-v114';
    page.innerHTML =
      '<div class="detail-back chain-graph-breadcrumb-v114">' +
        '<button type="button" onclick="returnChainLibraryV114()">‹ 返回产业链库</button>' +
        '<span>精品知识库 / 产业链库 / <b id="chainGraphBreadcrumbNameV114">当前产业链</b> / 骨架编辑</span>' +
      '</div>' +
      '<div class="head chain-graph-page-head-v114">' +
        '<div><label>INDUSTRY CHAIN SKELETON EDITOR</label>' +
          '<h1 id="chainGraphPageTitleV114">产业链骨架编辑</h1>' +
          '<p>在独立画布中维护上游、中游、下游及配套服务节点；支持拖拽调整、节点新增、复制、编辑和删除。</p>' +
        '</div>' +
        '<button type="button" class="secondary" onclick="returnChainLibraryV114()">返回产业链库</button>' +
      '</div>' +
      '<div class="chain-graph-page-mount-v114" id="chainGraphPageMountV114"></div>';

    knowledgeList.parentNode.insertBefore(page, knowledgeList.nextSibling);
    return page;
  }

  function syncPageHeadingV114() {
    var row = chainRowV114();
    var name = row && row.title ? row.title : '当前产业链';
    var crumb = document.getElementById('chainGraphBreadcrumbNameV114');
    var title = document.getElementById('chainGraphPageTitleV114');
    if (crumb) crumb.textContent = name;
    if (title) title.textContent = name + ' · 产业链骨架编辑';
  }

  function moveBuilderIntoPageV114() {
    var page = ensurePageV114();
    var mount = document.getElementById('chainGraphPageMountV114');
    if (!page || !mount || builder.parentNode === mount) return;
    movingV114 = true;
    mount.appendChild(builder);
    movingV114 = false;
  }

  function restoreBuilderHomeV114() {
    if (builder.parentNode === originalParent) return;
    movingV114 = true;
    if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
      originalParent.insertBefore(builder, originalNextSibling);
    } else {
      originalParent.appendChild(builder);
    }
    movingV114 = false;
  }

  function setPageSemanticsV114(enabled) {
    builder.classList.toggle('graph-builder-page-mode-v114', enabled);
    builder.onclick = enabled ? null : originalBackdropClick;
    if (!dialog) return;
    if (enabled) {
      dialog.setAttribute('role', 'region');
      dialog.setAttribute('aria-modal', 'false');
    } else {
      if (originalDialogRole === null) dialog.removeAttribute('role');
      else dialog.setAttribute('role', originalDialogRole);
      if (originalDialogAriaModal === null) dialog.removeAttribute('aria-modal');
      else dialog.setAttribute('aria-modal', originalDialogAriaModal);
    }
  }

  function showChainLibraryV114() {
    if (typeof show === 'function') show('knowledgeList');
    if (typeof activeKnowledgeType !== 'undefined') activeKnowledgeType = 'chain';
    if (typeof renderKnowledgeList === 'function') renderKnowledgeList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  var previousOpenBasicV114 = window.openChainBasicV61;
  if (typeof previousOpenBasicV114 === 'function') {
    window.openChainBasicV61 = function (index) {
      activeChainIndexV114 = Number(index);
      return previousOpenBasicV114.apply(this, arguments);
    };
  }

  var previousOpenCanvasV114 = window.openChainCanvasFromBasicV61;
  if (typeof previousOpenCanvasV114 === 'function') {
    window.openChainCanvasFromBasicV61 = function () {
      ensurePageV114();
      moveBuilderIntoPageV114();
      pageModeV114 = true;
      setPageSemanticsV114(true);
      var result;
      try {
        result = previousOpenCanvasV114.apply(this, arguments);
      } catch (error) {
        pageModeV114 = false;
        setPageSemanticsV114(false);
        restoreBuilderHomeV114();
        throw error;
      }
      syncPageHeadingV114();
      builder.classList.add('open');
      builder.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = '';
      if (typeof names !== 'undefined') names.chainGraphEditorV114 = '产业链图谱编辑';
      if (typeof show === 'function') show('chainGraphEditorV114');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return result;
    };
  }

  var previousCloseBuilderV114 = window.closeGraphBuilder;
  if (typeof previousCloseBuilderV114 === 'function') {
    window.closeGraphBuilder = function () {
      var wasPageMode = pageModeV114;
      if (wasPageMode) pageModeV114 = false;
      var result = previousCloseBuilderV114.apply(this, arguments);
      if (wasPageMode) {
        setPageSemanticsV114(false);
        restoreBuilderHomeV114();
        showChainLibraryV114();
      }
      return result;
    };
  }

  var previousSaveBuilderV114 = window.saveGraphModel;
  if (typeof previousSaveBuilderV114 === 'function') {
    window.saveGraphModel = function () {
      var wasPageMode = pageModeV114;
      var result = previousSaveBuilderV114.apply(this, arguments);
      if (wasPageMode && !pageModeV114 && typeof renderKnowledgeList === 'function') {
        renderKnowledgeList();
      }
      return result;
    };
  }

  window.returnChainLibraryV114 = function () {
    if (pageModeV114 && typeof window.closeGraphBuilder === 'function') {
      window.closeGraphBuilder();
    } else {
      setPageSemanticsV114(false);
      restoreBuilderHomeV114();
      showChainLibraryV114();
    }
  };

  var pageV114 = ensurePageV114();
  new MutationObserver(function () {
    if (!movingV114 && pageModeV114 && !pageV114.classList.contains('show')) {
      pageModeV114 = false;
      if (typeof previousCloseBuilderV114 === 'function') previousCloseBuilderV114.apply(window, []);
      setPageSemanticsV114(false);
      restoreBuilderHomeV114();
    }
  }).observe(pageV114, { attributes: true, attributeFilter: ['class'] });

  if (typeof prototypeLogicAnnotations !== 'undefined' && prototypeLogicAnnotations.knowledgeList) {
    prototypeLogicAnnotations.knowledgeList.interactions.push([
      '产业链骨架独立编辑页',
      '产业链详情点击“进入画布编辑”后关闭原弹窗，进入独立二级页面。',
      '独立页复用原图谱画布，保留节点拖拽、新增、复制、编辑、删除和 AI 辅助构建；保存或返回后回到产业链库。'
    ]);
  }
})();

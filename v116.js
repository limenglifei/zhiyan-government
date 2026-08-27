(function () {
  'use strict';

  var NODE_TYPES_V116 = ['核心节点', '一般节点', '配套服务'];
  var NODE_STRENGTHS_V116 = ['优势节点', '弱势节点'];
  var activeNodeEditIndexV116 = null;
  var activeChainIndexV116 = null;
  var pendingStrengthByNameV116 = null;

  function escV116(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function normalizeTextV116(value) {
    return String(value == null ? '' : value).replace(/\s+/g, '').trim();
  }

  function setOptionsV116(select, values) {
    if (!select) return;
    var current = select.value;
    select.innerHTML = values.map(function (value) {
      return '<option value="' + escV116(value) + '">' + escV116(value) + '</option>';
    }).join('');
    select.value = values.indexOf(current) > -1 ? current : values[0];
  }

  function inferStrengthV116(node, legacyType) {
    if (NODE_STRENGTHS_V116.indexOf(node && node.strength) > -1) return node.strength;
    if (node && (node.weak === true || node.isWeak === true)) return '弱势节点';
    return /薄弱|弱势/.test(legacyType) ? '弱势节点' : '优势节点';
  }

  function normalizeNodeV116(node) {
    if (!node) return node;
    var legacyType = String(node.nodeType || node.type || '一般节点');
    node.strength = inferStrengthV116(node, legacyType);
    if (NODE_TYPES_V116.indexOf(legacyType) > -1) node.nodeType = legacyType;
    else if (/核心|关键/.test(legacyType)) node.nodeType = '核心节点';
    else if (/配套|服务/.test(legacyType)) node.nodeType = '配套服务';
    else node.nodeType = '一般节点';
    node.type = node.nodeType;
    return node;
  }

  function normalizeAllNodesV116() {
    if (typeof graphBuilderNodes === 'undefined' || !Array.isArray(graphBuilderNodes)) return [];
    graphBuilderNodes.forEach(normalizeNodeV116);
    return graphBuilderNodes;
  }

  function ensureNodeFieldsV116() {
    var form = document.querySelector('#graphNodeEditModalV47 .graph-node-edit-form-v47');
    if (!form) return;
    setOptionsV116(document.getElementById('graphNodeTypeV47'), NODE_TYPES_V116);
    setOptionsV116(document.getElementById('manualGraphType'), NODE_TYPES_V116);
    if (!document.getElementById('graphNodeStrengthV116')) {
      var label = document.createElement('label');
      label.className = 'graph-node-strength-field-v116';
      label.innerHTML = '<span>节点强弱 *</span><select id="graphNodeStrengthV116"><option value="优势节点">优势节点</option><option value="弱势节点">弱势节点</option></select>';
      var type = document.getElementById('graphNodeTypeV47');
      var typeLabel = type && type.closest('label');
      if (typeLabel && typeLabel.nextSibling) form.insertBefore(label, typeLabel.nextSibling);
      else form.appendChild(label);
    }
    var subtitle = document.querySelector('#graphNodeEditModalV47 .collection-modal header p');
    if (subtitle) subtitle.textContent = '调整节点名称、所属环节、节点类型与节点强弱';
  }

  function decorateNodeCardsV116() {
    if (typeof graphBuilderNodes === 'undefined') return;
    document.querySelectorAll('#graphBuilderModal .graph-preview-node[data-node-index]').forEach(function (card) {
      var index = Number(card.dataset.nodeIndex);
      var node = graphBuilderNodes[index];
      if (!node) return;
      normalizeNodeV116(node);
      card.classList.toggle('node-advantage-v116', node.strength === '优势节点');
      card.classList.toggle('node-weak-v116', node.strength === '弱势节点');
      card.dataset.nodeTypeV116 = node.nodeType;
      card.dataset.nodeStrengthV116 = node.strength;
      var meta = card.querySelector(':scope > span');
      if (meta) {
        meta.className = 'graph-node-meta-v116';
        meta.innerHTML = '<em class="' + (node.strength === '弱势节点' ? 'weak' : 'advantage') + '">' +
          escV116(node.strength) + '</em><span>' + escV116(node.nodeType) + ' · ' + escV116(node.source || '业务维护') + '</span>';
      }
    });
  }

  function splitNamesV116(value) {
    return String(value || '').split(/[、,，/;；→\n]/).map(function (name) { return name.trim(); }).filter(Boolean);
  }

  function strengthNamesV116(row, strength) {
    var preset = strength === '优势节点'
      ? (row.advantageSegments || row.advantageLinks || row.advantage)
      : row.weak;
    if (preset && !/^\d+\s*个$/.test(String(preset))) return splitNamesV116(preset).join('、');
    var nodes = Array.isArray(row.graphNodes) ? row.graphNodes.map(normalizeNodeV116) : [];
    var names = nodes.filter(function (node) { return node.strength === strength; }).map(function (node) { return node.name; });
    if (names.length) return names.join('、');
    if (strength === '优势节点') {
      var weak = splitNamesV116(row.weak);
      var skeleton = splitNamesV116(row.structure || row.sub).filter(function (name) { return weak.indexOf(name) < 0; });
      return skeleton.slice(0, 3).join('、') || '暂无数据，待业务补充';
    }
    return preset || '暂无薄弱环节';
  }

  function chainDescriptionV116(row) {
    if (row.description) return row.description;
    var structure = String(row.structure || row.sub || '').replace(/\s*→\s*/g, '、');
    var prefix = row.category ? row.category + '产业链' : row.title;
    return structure ? prefix + '，重点覆盖' + structure + '等环节。' : prefix + '的本地产业基础与链上企业关系简述。';
  }

  function enhanceChainDetailV116(index) {
    if (typeof activeKnowledgeType === 'undefined' || activeKnowledgeType !== 'chain') return;
    var row = knowledgeBaseConfigs && knowledgeBaseConfigs.chain && knowledgeBaseConfigs.chain.rows[index];
    var body = document.getElementById('kbDetailBody');
    if (!row || !body) return;
    var fields = Array.from(body.querySelectorAll('.kb-field'));
    var main = fields.find(function (field) { return normalizeTextV116(field.querySelector('dt') && field.querySelector('dt').textContent) === '主导产业'; });
    if (main) {
      main.classList.add('wide', 'chain-summary-field-v116');
      main.querySelector('dt').textContent = '简述';
      main.querySelector('dd').textContent = chainDescriptionV116(row);
    }
    var weak = Array.from(body.querySelectorAll('.kb-field')).find(function (field) {
      return normalizeTextV116(field.querySelector('dt') && field.querySelector('dt').textContent) === '关键薄弱环节';
    });
    if (!weak) return;
    weak.classList.add('wide', 'chain-weak-field-v116');
    weak.querySelector('dd').textContent = strengthNamesV116(row, '弱势节点');
    var advantage = Array.from(body.querySelectorAll('.kb-field')).find(function (field) {
      return normalizeTextV116(field.querySelector('dt') && field.querySelector('dt').textContent) === '优势环节';
    });
    if (!advantage) {
      advantage = document.createElement('div');
      advantage.className = 'kb-field wide chain-advantage-field-v116';
      advantage.innerHTML = '<dt>优势环节</dt><dd></dd>';
      weak.parentNode.insertBefore(advantage, weak);
    }
    advantage.querySelector('dd').textContent = strengthNamesV116(row, '优势节点');
  }

  function installV116() {
    if (window.__chainNodeModelV116Installed) return;
    window.__chainNodeModelV116Installed = true;
    ensureNodeFieldsV116();
    normalizeAllNodesV116();

    var previousRender = window.renderGraphNodes;
    if (typeof previousRender === 'function') {
      window.renderGraphNodes = function () {
        ensureNodeFieldsV116();
        normalizeAllNodesV116();
        var result = previousRender.apply(this, arguments);
        decorateNodeCardsV116();
        return result;
      };
    }

    var previousOpenNew = window.openNewGraphNodeV63;
    if (typeof previousOpenNew === 'function') {
      window.openNewGraphNodeV63 = function () {
        activeNodeEditIndexV116 = null;
        ensureNodeFieldsV116();
        var result = previousOpenNew.apply(this, arguments);
        document.getElementById('graphNodeTypeV47').value = '核心节点';
        document.getElementById('graphNodeStrengthV116').value = '优势节点';
        return result;
      };
    }

    var previousOpenEditor = window.openGraphNodeEditorV47;
    if (typeof previousOpenEditor === 'function') {
      window.openGraphNodeEditorV47 = function (index) {
        activeNodeEditIndexV116 = Number(index);
        ensureNodeFieldsV116();
        var node = typeof graphBuilderNodes !== 'undefined' && graphBuilderNodes[index];
        if (node) normalizeNodeV116(node);
        var result = previousOpenEditor.apply(this, arguments);
        if (node) {
          document.getElementById('graphNodeTypeV47').value = node.nodeType;
          document.getElementById('graphNodeStrengthV116').value = node.strength;
        }
        return result;
      };
    }

    var previousSaveNode = window.saveGraphNodeEditorV47;
    if (typeof previousSaveNode === 'function') {
      window.saveGraphNodeEditorV47 = function () {
        ensureNodeFieldsV116();
        var strength = document.getElementById('graphNodeStrengthV116').value;
        var type = document.getElementById('graphNodeTypeV47').value;
        var before = typeof graphBuilderNodes !== 'undefined' ? graphBuilderNodes.length : 0;
        var target = activeNodeEditIndexV116;
        var result = previousSaveNode.apply(this, arguments);
        if (typeof graphBuilderNodes !== 'undefined') {
          if (target === null && graphBuilderNodes.length > before) target = graphBuilderNodes.length - 1;
          var node = target !== null ? graphBuilderNodes[target] : null;
          if (node) {
            node.nodeType = type;
            node.type = type;
            node.strength = strength;
            node.weak = strength === '弱势节点';
          }
          if (typeof window.renderGraphNodes === 'function') window.renderGraphNodes();
        }
        activeNodeEditIndexV116 = null;
        return result;
      };
    }

    var previousAddManual = window.addGraphNode;
    if (typeof previousAddManual === 'function') {
      window.addGraphNode = function () {
        var before = typeof graphBuilderNodes !== 'undefined' ? graphBuilderNodes.length : 0;
        var result = previousAddManual.apply(this, arguments);
        if (typeof graphBuilderNodes !== 'undefined' && graphBuilderNodes.length > before) normalizeNodeV116(graphBuilderNodes[graphBuilderNodes.length - 1]);
        if (typeof window.renderGraphNodes === 'function') window.renderGraphNodes();
        return result;
      };
    }

    var previousOpenBasic = window.openChainBasicV61;
    if (typeof previousOpenBasic === 'function') {
      window.openChainBasicV61 = function (index) {
        activeChainIndexV116 = Number(index);
        pendingStrengthByNameV116 = {};
        var row = knowledgeBaseConfigs && knowledgeBaseConfigs.chain && knowledgeBaseConfigs.chain.rows[activeChainIndexV116];
        if (row) {
          (row.graphNodes || []).forEach(function (node) {
            normalizeNodeV116(node);
            pendingStrengthByNameV116[node.name] = node.strength;
          });
          if (row.weak && !/^\d+\s*个$/.test(String(row.weak))) {
            splitNamesV116(row.weak).forEach(function (name) { pendingStrengthByNameV116[name] = '弱势节点'; });
          }
          if (row.advantage) {
            splitNamesV116(row.advantage).forEach(function (name) { pendingStrengthByNameV116[name] = '优势节点'; });
          }
        }
        return previousOpenBasic.apply(this, arguments);
      };
    }

    var previousOpenCanvas = window.openChainCanvasFromBasicV61;
    if (typeof previousOpenCanvas === 'function') {
      window.openChainCanvasFromBasicV61 = function () {
        var result = previousOpenCanvas.apply(this, arguments);
        if (pendingStrengthByNameV116 && typeof graphBuilderNodes !== 'undefined') {
          graphBuilderNodes.forEach(function (node) {
            normalizeNodeV116(node);
            if (pendingStrengthByNameV116[node.name]) {
              node.strength = pendingStrengthByNameV116[node.name];
              node.weak = node.strength === '弱势节点';
            }
          });
          pendingStrengthByNameV116 = null;
          if (typeof window.renderGraphNodes === 'function') window.renderGraphNodes();
        }
        return result;
      };
    }

    var previousOpenBuilder = window.openGraphBuilder;
    if (typeof previousOpenBuilder === 'function') {
      window.openGraphBuilder = function () {
        activeChainIndexV116 = null;
        var result = previousOpenBuilder.apply(this, arguments);
        ensureNodeFieldsV116();
        if (typeof window.renderGraphNodes === 'function') window.renderGraphNodes();
        return result;
      };
    }

    var previousSaveGraph = window.saveGraphModel;
    if (typeof previousSaveGraph === 'function') {
      window.saveGraphModel = function () {
        normalizeAllNodesV116();
        var snapshot = typeof graphBuilderNodes !== 'undefined' ? JSON.parse(JSON.stringify(graphBuilderNodes)) : [];
        var rows = knowledgeBaseConfigs && knowledgeBaseConfigs.chain && knowledgeBaseConfigs.chain.rows;
        var beforeLength = rows ? rows.length : 0;
        var index = activeChainIndexV116;
        var result = previousSaveGraph.apply(this, arguments);
        if (rows) {
          var row = index !== null ? rows[index] : (rows.length > beforeLength ? rows[0] : null);
          if (row && snapshot.length) {
            row.graphNodes = snapshot;
            row.nodes = String(snapshot.length);
            row.advantage = snapshot.filter(function (node) { return node.strength === '优势节点'; }).map(function (node) { return node.name; }).join('、') || '暂无数据，待业务补充';
            row.weak = snapshot.filter(function (node) { return node.strength === '弱势节点'; }).map(function (node) { return node.name; }).join('、') || '暂无薄弱环节';
          }
        }
        return result;
      };
    }

    var previousOpenDetail = window.openKnowledgeDetail;
    if (typeof previousOpenDetail === 'function') {
      window.openKnowledgeDetail = function (index) {
        var result = previousOpenDetail.apply(this, arguments);
        enhanceChainDetailV116(Number(index));
        return result;
      };
    }

    if (window.prototypeLogicAnnotations && window.prototypeLogicAnnotations.knowledgeList) {
      window.prototypeLogicAnnotations.knowledgeList.fields = window.prototypeLogicAnnotations.knowledgeList.fields || [];
      window.prototypeLogicAnnotations.knowledgeList.fields.push(['产业链节点强弱', '节点类型与节点强弱独立维护。', '节点类型仅支持核心节点、一般节点、配套服务；节点强弱仅支持优势节点、弱势节点，并用于汇总优势环节和关键薄弱环节。']);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installV116, { once: true });
  else installV116();
}());

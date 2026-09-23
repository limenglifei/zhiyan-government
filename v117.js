(function () {
  'use strict';

  var PROJECTS_V117 = {
    '0': {
      title: '省级“专精特新”中小企业认定',
      shortTitle: '专精特新认定',
      icon: '专',
      tone: 'amber',
      pendingCount: 2,
      description: '只补充本项目待确认的融资与专业化证明，已掌握的经营、研发数据无需重复填写。',
      known: ['细分市场经营 6 年', '上年度研发费用 4,472 万元', '研发费用占比 8.6%', '上年度营收 5.2 亿元'],
      fields: [
        { key: 'equityFinancing', label: '近 2 年新增股权融资总额', type: 'number', unit: '万元', required: true, placeholder: '无融资请填 0' },
        { key: 'financingDate', label: '最近一次融资日期', type: 'month', required: false },
        { key: 'marketPosition', label: '主导产品细分市场占有率 / 排名', type: 'textarea', required: true, wide: true, placeholder: '例：2025 年国内车规级传感器细分市场占有率 12%，排名第 3' },
        { key: 'scoreEvidence', label: '评价得分或其他支持条件证明', type: 'textarea', required: true, wide: true, placeholder: '填写创新能力、专业化、精细化或特色化的证明要点' },
        { key: 'evidenceFiles', label: '佐证材料', type: 'file', required: false, wide: true, hint: '可选市占率报告、融资证明、评分表等' }
      ]
    },
    '1': {
      title: '高新技术企业培育专项资金',
      shortTitle: '高企培育专项',
      icon: '高',
      tone: 'green',
      pendingCount: 1,
      description: '本项目待确认研发人员占比，只收集计算所需的人员口径和佐证材料。',
      known: ['企业成立 6 年', '发明授权 9 件', '实用新型 11 件', '外观设计 3 件', '软件著作权 16 项', '商标 8 件', '高新技术产品收入占比 72%'],
      fields: [
        { key: 'employeeBasis', label: '职工总数统计口径', type: 'select', required: true, value: '年度平均职工人数', options: ['年度平均职工人数', '期末职工人数', '社保缴纳人数'] },
        { key: 'employeeCount', label: '当前职工总数', type: 'integer', unit: '人', required: true, placeholder: '请确认职工总数' },
        { key: 'rdEmployeeCount', label: '当前研发人员数量', type: 'integer', unit: '人', required: true, value: '62' },
        { key: 'peopleEvidenceFiles', label: '人员佐证材料', type: 'file', required: false, wide: true, hint: '可选员工花名册、社保证明、研发人员工时或岗位证明' }
      ]
    },
    '2': {
      title: '制造业数字化转型扶持计划',
      shortTitle: '数字化转型项目',
      icon: '数',
      tone: 'purple',
      pendingCount: 2,
      description: '只补充当前数字化改造项目的备案、设备投入和合同发票数据。',
      known: ['本市注册独立法人', '纳税信用 A 级', '近三年无重大失信'],
      fields: [
        { key: 'projectName', label: '数字化改造项目名称', type: 'text', required: true, wide: true, placeholder: '请填写备案项目名称' },
        { key: 'filingNumber', label: '项目备案号', type: 'text', required: true, placeholder: '请填写备案编号' },
        { key: 'filingDate', label: '项目备案日期', type: 'date', required: true },
        { key: 'equipmentOriginalValue', label: '本项目设备累计原值', type: 'number', unit: '万元', required: true, value: '28640' },
        { key: 'contractInvoiceAmount', label: '已取得合同发票金额', type: 'number', unit: '万元', required: true, placeholder: '请按本项目口径填写' },
        { key: 'projectEvidenceFiles', label: '备案与投入佐证材料', type: 'file', required: false, wide: true, hint: '可选备案表、设备合同、发票及付款凭证' }
      ]
    }
  };

  var activeProjectV117 = null;
  var activeTriggerV117 = null;
  var snapshotsV117 = window.enterprisePolicyProjectSnapshotsV117 || {};
  window.enterprisePolicyProjectSnapshotsV117 = snapshotsV117;

  function escV117(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function notifyV117(message) {
    if (typeof window.toast === 'function') window.toast(message);
  }

  function companyNameV117() {
    var input = document.getElementById('epSearch');
    var card = document.querySelector('#enterprisePolicy .ep-company h2');
    return (input && input.value.trim()) || (card && card.textContent.trim()) || '海州智造科技有限公司';
  }

  function snapshotKeyV117(projectId) {
    return companyNameV117() + '::' + projectId;
  }

  function ensureModalV117() {
    if (document.getElementById('projectConditionModalV117')) return;
    var backdrop = document.createElement('div');
    backdrop.id = 'projectConditionModalV117';
    backdrop.className = 'project-condition-backdrop-v117';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML = '<section class="project-condition-dialog-v117" role="dialog" aria-modal="true" aria-labelledby="projectConditionTitleV117"><header><div><label>PROJECT-SPECIFIC INFORMATION</label><h2 id="projectConditionTitleV117">完善本项目申报信息</h2><p id="projectConditionSubtitleV117"></p></div><button class="project-condition-close-v117" type="button" aria-label="关闭" onclick="closeProjectConditionV117()">×</button></header><div class="project-condition-body-v117" id="projectConditionBodyV117"></div><footer><div><b id="projectConditionProgressV117"></b><span>保存后仅重新评估当前项目</span></div><button class="secondary" type="button" onclick="closeProjectConditionV117()">取消</button><button class="primary" type="button" onclick="saveProjectConditionV117()">保存并重新评估本项目</button></footer></section>';
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', function (event) {
      if (event.target === backdrop) closeProjectConditionV117();
    });
  }

  function renderFieldV117(field, value) {
    var id = 'projectCondition_' + field.key + '_V117';
    var marker = field.required ? '<i>*</i> ' : '';
    var required = field.required ? ' required' : '';
    var classes = 'project-condition-field-v117' + (field.wide ? ' wide' : '');
    var open = '<label class="' + classes + '"><span>' + marker + escV117(field.label) + '</span>';
    if (field.type === 'select') {
      return open + '<select id="' + id + '" data-project-condition="' + escV117(field.key) + '"' + required + '>' + field.options.map(function (option) {
        return '<option' + (option === value ? ' selected' : '') + '>' + escV117(option) + '</option>';
      }).join('') + '</select></label>';
    }
    if (field.type === 'textarea') {
      return open + '<textarea id="' + id + '" data-project-condition="' + escV117(field.key) + '" maxlength="1000" placeholder="' + escV117(field.placeholder || '请输入') + '"' + required + '>' + escV117(value) + '</textarea></label>';
    }
    if (field.type === 'file') {
      return open + '<div class="project-condition-file-v117"><input id="' + id + '" data-project-condition="' + escV117(field.key) + '" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"><b>选择材料</b><small>' + escV117(field.hint || '') + '</small></div></label>';
    }
    var inputType = field.type === 'integer' || field.type === 'number' ? 'number' : field.type;
    var numeric = inputType === 'number' ? ' min="0" step="' + (field.type === 'integer' ? '1' : '0.01') + '" inputmode="' + (field.type === 'integer' ? 'numeric' : 'decimal') + '"' : '';
    var input = '<input id="' + id + '" data-project-condition="' + escV117(field.key) + '" type="' + escV117(inputType) + '" value="' + escV117(value) + '" placeholder="' + escV117(field.placeholder || '请输入') + '"' + numeric + required + '>';
    if (field.unit) input = '<div class="unit-input">' + input + '<b>' + escV117(field.unit) + '</b></div>';
    return open + input + '</label>';
  }

  function renderProjectV117(projectId) {
    var project = PROJECTS_V117[projectId];
    var draft = snapshotsV117[snapshotKeyV117(projectId)] || {};
    var body = document.getElementById('projectConditionBodyV117');
    document.getElementById('projectConditionSubtitleV117').textContent = project.description;
    body.innerHTML = '<section class="project-condition-hero-v117 tone-' + project.tone + '"><i>' + escV117(project.icon) + '</i><div><span>本项目专属收集</span><h3>' + escV117(project.title) + '</h3><p>已根据申报条件筛选必要字段，不采集与本项目无关的企业信息。</p></div><em>待补充 ' + project.pendingCount + ' 项条件</em></section><section class="project-known-v117"><header><b>已从企业画像读取</b><span>无需重复填写</span></header><div>' + project.known.map(function (fact) { return '<em>✓ ' + escV117(fact) + '</em>'; }).join('') + '</div></section><section class="project-condition-form-v117"><header><b>本项目需补充</b><span><i>*</i> 为必填项</span></header><div>' + project.fields.map(function (field) {
      var value = draft[field.key] != null ? draft[field.key] : (field.value || '');
      return renderFieldV117(field, value);
    }).join('') + '</div></section>';
    body.querySelectorAll('input,select,textarea').forEach(function (element) {
      element.addEventListener('input', updateProgressV117);
      element.addEventListener('change', updateProgressV117);
    });
    updateProgressV117();
  }

  function openProjectConditionV117(projectId, trigger) {
    projectId = String(projectId);
    if (!PROJECTS_V117[projectId]) return;
    ensureModalV117();
    activeProjectV117 = projectId;
    activeTriggerV117 = trigger || null;
    renderProjectV117(projectId);
    var modal = document.getElementById('projectConditionModalV117');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var firstMissing = modal.querySelector('[required]');
    if (firstMissing) setTimeout(function () { firstMissing.focus(); }, 30);
  }

  function closeProjectConditionV117() {
    var modal = document.getElementById('projectConditionModalV117');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (activeTriggerV117 && document.contains(activeTriggerV117)) {
      var target = activeTriggerV117;
      setTimeout(function () { target.focus(); }, 20);
    }
  }

  function collectV117() {
    var values = {};
    PROJECTS_V117[activeProjectV117].fields.forEach(function (field) {
      var input = document.getElementById('projectCondition_' + field.key + '_V117');
      if (!input) return;
      values[field.key] = field.type === 'file'
        ? Array.from(input.files || []).map(function (file) { return file.name; }).join('、')
        : input.value.trim();
    });
    return values;
  }

  function updateProgressV117() {
    if (!activeProjectV117) return;
    var required = PROJECTS_V117[activeProjectV117].fields.filter(function (field) { return field.required; });
    var completed = required.filter(function (field) {
      var input = document.getElementById('projectCondition_' + field.key + '_V117');
      return input && input.value.trim() !== '';
    }).length;
    document.getElementById('projectConditionProgressV117').textContent = '必填信息 ' + completed + ' / ' + required.length + ' 已填写';
  }

  function validateV117(values) {
    var fields = PROJECTS_V117[activeProjectV117].fields;
    for (var index = 0; index < fields.length; index++) {
      var field = fields[index];
      var input = document.getElementById('projectCondition_' + field.key + '_V117');
      var value = values[field.key] || '';
      if (field.required && value === '') {
        notifyV117('请补充“' + field.label + '”');
        input.focus();
        return false;
      }
      if (value !== '' && (field.type === 'number' || field.type === 'integer')) {
        var valid = isFinite(Number(value)) && Number(value) >= 0;
        if (field.type === 'integer') valid = valid && /^\d+$/.test(value);
        if (!valid) {
          notifyV117(field.label + '请输入大于或等于 0 的' + (field.type === 'integer' ? '整数' : '数字'));
          input.focus();
          return false;
        }
      }
    }
    if (activeProjectV117 === '1' && Number(values.rdEmployeeCount) > Number(values.employeeCount)) {
      notifyV117('研发人员数量不能大于职工总数');
      document.getElementById('projectCondition_rdEmployeeCount_V117').focus();
      return false;
    }
    return true;
  }

  function setDiagnosisV117(row, currentValue, state, result) {
    if (!row) return;
    row.children[1].textContent = currentValue;
    row.children[2].innerHTML = '<span class="diag ' + state + '">' + escV117(result) + '</span>';
  }

  function refreshSummaryV117(card) {
    var rows = Array.from(card.querySelectorAll('.diagnosis-table tbody tr'));
    var ok = rows.filter(function (row) { return row.querySelector('.diag.ok'); }).length;
    var summary = card.querySelector('.diagnosis-title span');
    if (summary) summary.textContent = '已诊断 ' + rows.length + ' 项：' + ok + ' 项符合，' + (rows.length - ok) + ' 项待改进';
  }

  function updateCardV117(projectId, values) {
    var card = document.querySelector('#enterprisePolicy .policy-project[data-policy="' + projectId + '"]');
    var rows = card && card.querySelectorAll('.diagnosis-table tbody tr');
    if (!card || !rows) return;
    if (projectId === '0') {
      var funding = Number(values.equityFinancing || 0);
      setDiagnosisV117(rows[3], '营业收入 5.2 亿元；近 2 年股权融资 ' + funding.toLocaleString('zh-CN') + ' 万元', 'ok', '✓ 符合');
      setDiagnosisV117(rows[4], '市占率与评价证明已补充', 'ok', '✓ 已补充');
      card.querySelector('.project-actions > span').textContent = 'AI 建议：本项目待补条件已齐备，建议启动申报材料复核';
    } else if (projectId === '1') {
      var ratio = Number(values.employeeCount) ? Number(values.rdEmployeeCount) / Number(values.employeeCount) * 100 : 0;
      var passed = ratio >= 10;
      setDiagnosisV117(rows[2], '研发人员 ' + values.rdEmployeeCount + ' 人 / 职工 ' + values.employeeCount + ' 人（' + ratio.toFixed(1) + '%）', passed ? 'ok' : 'fail', passed ? '✓ 符合' : '× 低于 10%');
      card.querySelector('.project-actions > span').textContent = passed ? 'AI 建议：研发人员占比已完成判定，可进入申报材料准备' : 'AI 建议：研发人员占比低于 10%，请核对人员统计口径';
    } else {
      setDiagnosisV117(rows[2], values.projectName + ' · ' + values.filingNumber + ' · ' + values.filingDate, 'ok', '✓ 已备案');
      setDiagnosisV117(rows[3], '设备原值 ' + Number(values.equipmentOriginalValue).toLocaleString('zh-CN') + ' 万元；合同发票 ' + Number(values.contractInvoiceAmount).toLocaleString('zh-CN') + ' 万元', 'ok', '✓ 已补充');
      card.querySelector('.project-actions > span').textContent = 'AI 建议：备案和设备投入数据已齐备，请进一步核对凭证原件';
    }
    refreshSummaryV117(card);
    var scores = { '0': 98, '1': 94, '2': 90 };
    var score = card.querySelector('.project-score b');
    var success = card.querySelector('.project-score em');
    if (score) score.textContent = scores[projectId] + '%';
    if (success) success.textContent = '预计申报成功率 ' + (scores[projectId] - 2) + '%';
    var button = card.querySelector('.diagnosis-title button');
    if (button) button.textContent = '查看 / 修改本项目信息 →';
    var saved = card.querySelector('.project-condition-saved-v117');
    if (!saved) {
      saved = document.createElement('em');
      saved.className = 'project-condition-saved-v117';
      card.querySelector('.diagnosis-title > div').appendChild(saved);
    }
    saved.textContent = '✓ 已按本项目条件补充';
    card.classList.add('project-condition-complete-v117');
  }

  function saveProjectConditionV117() {
    if (!activeProjectV117) return false;
    var values = collectV117();
    if (!validateV117(values)) return false;
    snapshotsV117[snapshotKeyV117(activeProjectV117)] = values;
    updateCardV117(activeProjectV117, values);
    var project = PROJECTS_V117[activeProjectV117];
    closeProjectConditionV117();
    notifyV117('已保存“' + project.shortTitle + '”专属信息，并重新评估本项目');
    return true;
  }

  function decorateButtonsV117() {
    document.querySelectorAll('#enterprisePolicy .policy-project').forEach(function (card) {
      var button = card.querySelector('.diagnosis-title button');
      var project = PROJECTS_V117[card.dataset.policy];
      if (!button || !project || button.dataset.projectConditionV117) return;
      button.dataset.projectConditionV117 = 'true';
      button.removeAttribute('onclick');
      button.textContent = '完善本项目 ' + project.pendingCount + ' 项信息 →';
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        openProjectConditionV117(card.dataset.policy, button);
      });
    });
    var staleButton = document.getElementById('openProfileModal');
    if (staleButton && !staleButton.dataset.finalProfileHandlerV117) {
      var replacement = staleButton.cloneNode(true);
      replacement.dataset.finalProfileHandlerV117 = 'true';
      staleButton.replaceWith(replacement);
      replacement.addEventListener('click', function () { window.openEnterpriseProfile(); });
    }
  }

  function addAnnotationsV117() {
    if (!window.prototypeLogicAnnotations || !window.prototypeLogicAnnotations.enterprisePolicy) return;
    var annotation = window.prototypeLogicAnnotations.enterprisePolicy;
    annotation.fields.push(['知识产权分类数量', '新增发明专利授权数、外观设计数、实用新型数、软件著作权数量和商标数。', '企业填报、国家知识产权公开数据、软著与商标登记数据', '画像更新后重算']);
    annotation.interactions.push(['按单个项目条件完善信息', '在政策项目卡片点击“完善本项目信息”。', '仅收集当前项目缺失条件，保存后只更新当前卡片诊断和匹配度。']);
  }

  function installV117() {
    if (window.__enterpriseProjectConditionV117Installed) return;
    window.__enterpriseProjectConditionV117Installed = true;
    ensureModalV117();
    decorateButtonsV117();
    addAnnotationsV117();
    document.addEventListener('keydown', function (event) {
      var modal = document.getElementById('projectConditionModalV117');
      if (event.key === 'Escape' && modal && modal.classList.contains('open')) closeProjectConditionV117();
    });
    window.openProjectConditionV117 = openProjectConditionV117;
    window.closeProjectConditionV117 = closeProjectConditionV117;
    window.saveProjectConditionV117 = saveProjectConditionV117;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installV117, { once: true });
  else installV117();
}());

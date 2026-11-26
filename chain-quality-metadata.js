(function () {
  'use strict';

  const stages = { up: '上游', mid: '中游', down: '下游', service: '配套服务' };
  const text = (value) => String(value ?? '').trim();
  const normalize = (value) => text(value).normalize('NFKC').replace(/\s+/g, '').toLowerCase();
  const placeholder = /^(?:未注明|未登记|未填写|未提供|未设置|未上传|待补充|待核验|待确认|待测算|暂无(?:优势环节|薄弱环节|链主企业)?|暂未标注(?:链主企业)?|无|未知|[…—–.\-]+)$/;
  const present = (value) => Boolean(text(value)) && !placeholder.test(text(value));
  const shown = (value) => text(value) || '未填写';
  const stageOf = (node) => (node.nodeType || node.type) === '配套服务' ? 'service' : node.stage;
  const isStrong = (node) => node.strength === '强' || (!node.strength && /优势|强势/.test(node.nodeType || node.type || ''));
  const isWeak = (node) => node.strength === '弱' || (!node.strength && (node.weak || node.isWeak || /薄弱|弱势/.test(node.nodeType || node.type || '')));

  function distinctNames(values) {
    return [...new Map(values.filter(present).map((value) => [normalize(value), text(value)])).values()];
  }

  function splitNames(value) {
    return distinctNames(text(value).split(/[、,，/;；→\n]+/));
  }

  function sameNames(first, second) {
    const expected = new Set(second.map(normalize));
    return first.length === expected.size && first.every((name) => expected.has(normalize(name)));
  }

  function checkSegment(kind, current, names) {
    const label = kind === 'advantage' ? '优势环节' : '薄弱环节';
    if (sameNames(splitNames(current), names)) return null;
    const suggestion = names.join('、') || '暂无' + label;
    return {
      kind, action: 'sync', title: '同步' + label + '描述',
      detail: kind === 'advantage' ? '按当前画布已标记为「强」的节点更新描述。' : '按当前画布已标记为「弱」的节点更新描述。',
      basis: '当前画布节点强弱标记',
      changes: [{ label: label + '描述', current: shown(current), suggestion }]
    };
  }

  function checkEnterprises(row, nodes, linkedCompanies) {
    const changes = [];
    const companies = linkedCompanies.filter((item) => item && present(item.name));
    const nodeNames = new Set(nodes.map((node) => normalize(node.name)));
    const hasNode = (company) => nodeNames.has(normalize(company.node));
    const isLead = (company) => company.isLead ?? (company.type === '链主企业');
    const currentNames = splitNames(row.lead);
    const leads = distinctNames(companies.filter((company) => isLead(company) && hasNode(company)).map((company) => company.name));
    const keyCompanies = distinctNames(companies.filter((company) =>
      !isLead(company) && (company.isKey === true || company.isKeyCompany === true || company.type === '重点企业') && hasNode(company)
    ).map((company) => company.name));
    const candidates = distinctNames([...leads, ...keyCompanies]);

    if (!companies.length) {
      changes.push({
        label: '链主及重点企业',
        current: shown(row.lead),
        suggestion: '补齐企业名称、统一社会信用代码、对应节点及角色认定依据，核实后更新摘要。'
      });
    } else if (!candidates.length || !sameNames(currentNames, candidates)) {
      const facts = [leads.length ? '链主标记为' + leads.join('、') : '', keyCompanies.length ? '重点企业标记为' + keyCompanies.join('、') : ''].filter(Boolean);
      changes.push({
        label: '链主及重点企业',
        current: shown(row.lead),
        suggestion: facts.length ? '现有挂靠记录中，' + facts.join('，') + '。核验后保留或更新企业角色。' :
          '当前挂靠记录没有可归入在图节点的链主或重点企业标记，请核对企业角色和节点，确认后再更新摘要。'
      });
    }
    companies.filter((company) => !hasNode(company)).forEach((company) => {
      changes.push({
        label: company.name + ' · 挂靠节点',
        current: shown(company.node),
        suggestion: '该节点在当前画布中无法匹配。请核对新节点并重新挂靠，或移除已失效的关联。'
      });
    });
    if (!changes.length) return null;
    return {
      kind: 'enterprise', title: '核对链主及重点企业',
      detail: '核对企业角色、摘要和挂靠节点之间的一致性。',
      basis: '当前企业挂靠记录与画布节点',
      changes
    };
  }

  function structureText(stageNames) {
    return stageNames.map((names) => names.join('、') || '待补充').join(' → ');
  }

  function checkStructure(row, stageNames) {
    if (!stageNames.some((names) => names.length)) return null;
    const current = row.structure || row.sub;
    const previousGroups = text(current).split(/\s*(?:→|—|->)\s*/);
    const matches = previousGroups.length === stageNames.length && stageNames.every((names, index) => sameNames(splitNames(previousGroups[index]), names));
    if (matches) return null;
    const suggestion = structureText(stageNames);
    return {
      kind: 'structure', action: 'sync', title: '同步产业链结构描述',
      detail: '按上游、中游、下游和配套服务顺序更新结构描述。',
      basis: '当前画布节点及所属环节',
      changes: [{ label: '产业链结构描述', current: shown(current), suggestion }]
    };
  }

  function sourceUrl(value) {
    try {
      const parsed = new URL(value);
      if ((parsed.protocol !== 'http:' && parsed.protocol !== 'https:') || parsed.username || parsed.password) return '';
      parsed.hash = '';
      return parsed.href;
    } catch (_) {
      return '';
    }
  }

  function checkSources(row, sourceNote, attachmentName, attachmentMatched) {
    const notes = [sourceNote, row.graphSourceNote].map(text).filter(Boolean);
    const current = notes.find((note) => present(note) && !/^尚未选择/.test(note));
    const records = Array.isArray(row.graphSources) ? row.graphSources.filter((source) => source && typeof source === 'object') : [];
    const changes = [];
    const traceableReferences = [];
    const seen = new Set();

    records.forEach((source, index) => {
      const title = text(source.title || source.name);
      const publisher = text(source.publisher || source.organization || source.author);
      const date = text(source.publishedAt || source.publishDate || source.date);
      const url = sourceUrl(source.url || source.link);
      const reference = text(source.documentNumber || source.fileName);
      const key = url || (present(publisher) && present(reference) ? normalize(publisher + '：' + reference) : '');
      const label = title || '第 ' + (index + 1) + ' 条来源';
      const details = [publisher, date, url || reference].filter(present).join(' · ') || '缺少发布机构、日期和原始出处';

      if (key && seen.has(key)) {
        changes.push({ id: index, label: '建议删除重复明细 · ' + label, current: details, suggestion: '与已登记来源使用同一原始出处，保留信息较完整的一条。' });
        return;
      }
      if (key) seen.add(key);
      if (source.authoritative === false || (/转载|二手/.test(text(source.type)) && (!url || !present(publisher)))) {
        changes.push({
          id: index, label: '建议删除或替换 · ' + label, current: details,
          suggestion: '登记信息不足以确认一手出处。请追溯正式原文，无法确认时从构建依据中移除。'
        });
        return;
      }
      if (!present(title) || !present(publisher) || !present(date) || (!url && !present(reference)) || source.verified === false) {
        changes.push({
          id: index, label: '待核验明细 · ' + label, current: details,
          suggestion: '补齐标题、发布机构、发布或更新时间和原始链接或文件编号，再确认可用于哪些节点。'
        });
        return;
      }
      traceableReferences.push(label);
    });

    const attachment = present(attachmentName) ? '本次参照附件「' + text(attachmentName) + '」' : '';
    if (!current || !records.length || /^(?:仅导入文件|导入文件\s*\+\s*联网公开信源)$/.test(current)) {
      const traceable = traceableReferences.length ? '来源明细登记了 ' + traceableReferences.length + ' 条可回溯出处。' : '';
      const note = attachment && attachmentMatched ? attachment + '已读取并参与节点比对。' : '';
      changes.unshift({
        label: '修改来源概述', current: shown(current || notes[0]),
        suggestion: traceable + note + '概述应分别写明图谱构建与本次质检采用的资料范围、发布机构及更新时间，并与明细对应。'
      });
    }
    if (attachment) {
      changes.push({
        label: '候选新增 · 参照图谱', current: attachment,
        suggestion: '查明编制机构、发布日期或版本及原始出处，核验后登记为参照资料。'
      });
    }
    if (traceableReferences.length === 0) {
      changes.push({
        label: '候选新增 · 可追溯的一手信源',
        current: records.length ? '现有登记暂无信息完整的原始出处' : '未登记可逐条核验的构建信源',
        suggestion: '优先补录适用的行业标准原文、主管部门公开文件。企业角色使用企业公告或主管部门公开名录交叉核验。'
      });
    }
    return changes.map((change) => ({
      kind: 'source', id: change.id, title: change.label,
      detail: '核对出处与适用范围，保留可回溯的来源依据。',
      basis: '已登记的数据来源信息与本次质检附件',
      changes: [{ ...change, label: change.label === '修改来源概述' ? '来源概述' : '来源明细' }]
    }));
  }

  function inspectCanvas(nodes) {
    const canvas = nodes.filter((node) => node && present(node.name) && Object.hasOwn(stages, stageOf(node)));
    return {
      canvas,
      advantageNames: distinctNames(canvas.filter(isStrong).map((node) => node.name)),
      weakNames: distinctNames(canvas.filter(isWeak).map((node) => node.name)),
      stageNames: Object.keys(stages).map((key) => distinctNames(canvas.filter((node) => stageOf(node) === key).map((node) => node.name)))
    };
  }

  function summarize(nodes) {
    const { advantageNames, weakNames, stageNames } = inspectCanvas(nodes);
    return {
      advantage: advantageNames.join('、') || '暂无优势环节',
      weak: weakNames.join('、') || '暂无薄弱环节',
      structure: structureText(stageNames)
    };
  }

  function review({ row = {}, nodes = [], sourceNote, attachmentName, attachmentMatched, linkedCompanies = row?.linkedCompanies || [] }) {
    const safeRow = row || {};
    const { canvas, advantageNames, weakNames, stageNames } = inspectCanvas(nodes);
    return [
      checkSegment('advantage', safeRow.advantage || safeRow.advantageSegments || safeRow.advantageLinks, advantageNames),
      checkSegment('weak', safeRow.weak, weakNames),
      checkEnterprises(safeRow, canvas, linkedCompanies),
      checkStructure(safeRow, stageNames),
      ...checkSources(safeRow, sourceNote, attachmentName, attachmentMatched)
    ].filter(Boolean);
  }

  window.zhiyanChainQualityMetadata = Object.freeze({ review, summarize });
})();

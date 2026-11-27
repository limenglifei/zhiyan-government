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
      detail: kind === 'advantage' ? '建议同步「强」节点名单' : '建议同步「弱」节点名单',
      basis: '当前画布节点强弱标记',
      changes: [{ label: label + '描述', current: shown(current), suggestion }]
    };
  }

  function checkEnterprises(row, nodes, linkedCompanies) {
    const rolePrefix = /(?:链主(?:企业)?|重点企业|链主及重点企业)\s*[：:]\s*/g;
    const rolePlaceholder = /^(?:本地骨干企业|链主企业|重点企业|链主及重点企业|暂无链主及重点企业|待核实|暂未明确|未录入)$/;
    const firmNames = (names) => distinctNames(names.filter((name) => !rolePlaceholder.test(text(name))));
    const isLead = (company) => company.isLead ?? (company.role === 'lead' || company.type === '链主企业');
    const isKey = (company) => !isLead(company) &&
      (company.isKey === true || company.isKeyCompany === true || company.role === 'key' || company.type === '重点企业');
    const knownNodes = new Set(nodes.flatMap((node) => [node.name, node.ref, node.id]).filter(present).map(normalize));
    const isSupported = (company) => company.verified !== false && knownNodes.has(normalize(company.node || company.nodeRef));
    const currentNames = firmNames(splitNames(text(row.lead).replace(rolePrefix, '')));
    const roleRecords = (Array.isArray(linkedCompanies) ? linkedCompanies : [])
      .filter((company) => company && present(company.name) && (isLead(company) || isKey(company)));
    const leads = roleRecords.filter((company) => isLead(company) && isSupported(company));
    const keyCompanies = roleRecords.filter((company) => isKey(company) && isSupported(company));
    const candidates = firmNames([...leads, ...keyCompanies].map((company) => company.name));
    const needsLinkReview = roleRecords.some((company) => !isSupported(company));

    if (candidates.length && !needsLinkReview && sameNames(currentNames, candidates)) return null;
    const detail = needsLinkReview ? '请核验企业角色与失效挂靠后更新名单' :
      (candidates.length ? '建议核实名单差异后更新链主及重点企业' : '请补齐可核验的企业角色和节点挂靠后再更新名单');
    return {
      kind: 'enterprise', title: '核对链主及重点企业',
      detail,
      basis: candidates.length || roleRecords.length ? '已登记的企业角色与画布节点' : '现有产业链企业档案',
      changes: [{ label: '链主及重点企业', current: currentNames.join('、') || null, suggestion: candidates.join('、') || null }]
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
      detail: '建议按上游、中游、下游和配套服务顺序同步结构',
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

  function normalizeSources(records) {
    return (Array.isArray(records) ? records : [])
      .filter((record) => record && typeof record === 'object' && !Array.isArray(record))
      .map((record) => {
        const article = {
          title: text(record.title || record.name),
          publisher: text(record.publisher || record.organization || record.author),
          publishedAt: text(record.publishedAt || record.publishDate || record.date)
        };
        const url = sourceUrl(record.url || record.link);
        const reference = text(record.documentNumber || record.fileName);
        const key = url || (present(article.publisher) && present(reference) ? normalize(article.publisher + '：' + reference) : '');
        const unsuitable = record.authoritative === false ||
          (/转载|二手/.test(text(record.type)) && (!url || !present(article.publisher)));
        const complete = present(article.title) && present(article.publisher) && present(article.publishedAt) &&
          Boolean(url || present(reference)) && record.verified !== false;
        return { article, url, key, complete, unsuitable, verified: record.verified === true };
      });
  }

  function knownPublicationDate(value) {
    const day = /^(\d{4}-\d{2}-\d{2})(?:$|[ T])/.exec(value)?.[1];
    if (!day) return false;
    const date = new Date(day + 'T00:00:00Z');
    return Number.isFinite(date.getTime()) && date.toISOString().startsWith(day);
  }

  function checkSources(row, sourceNote, sourceCandidates) {
    const overview = sourceNote || row.graphSourceNote;
    const records = normalizeSources(row.graphSources);
    const existingKeys = new Set(records.filter(({ key }) => key).map(({ key }) => key));
    const retained = new Map();
    const removals = [];
    let hasIncomplete = false;

    records.forEach((record) => {
      if (record.unsuitable) {
        removals.push(record);
        return;
      }
      if (!record.key) {
        hasIncomplete = true;
        return;
      }
      const previous = retained.get(record.key);
      if (!previous) {
        retained.set(record.key, record);
      } else if (record.complete && (!previous.complete || (record.verified && !previous.verified))) {
        removals.push(previous);
        retained.set(record.key, record);
      } else {
        removals.push(record);
      }
    });

    const changes = removals.map(({ article }) => ({ sourceAction: 'delete', source: article }));
    const additions = normalizeSources(sourceCandidates).filter((record) => {
      if (record.unsuitable || !record.complete || !record.verified || !record.url ||
        !knownPublicationDate(record.article.publishedAt) || existingKeys.has(record.key)) return false;
      existingKeys.add(record.key);
      return true;
    });
    changes.push(...additions.map(({ article }) => ({ sourceAction: 'add', source: article })));

    const issues = [];
    if (changes.length) {
      const detail = removals.length && additions.length ? '建议移除重复或不适用的条目并补录已核验的信源' :
        (removals.length ? '建议移除重复或不适用的条目' : '建议补录与当前产业链相关的已核验信源');
      issues.push({
        kind: 'source', id: 'source-entries', title: '调整构建信源清单', detail,
        basis: additions.length
          ? (removals.length ? '现有来源明细和已核验的信源记录' : '已核验的信源记录') : '现有来源明细',
        changes
      });
    }

    const incomplete = hasIncomplete || [...retained.values()].some((record) => !record.complete);
    if (!present(overview) || !records.length || incomplete || /^(?:仅导入文件|导入文件\s*\+\s*联网公开信源)$/.test(text(overview))) {
      issues.unshift({
        kind: 'source', id: 'source-overview', title: '完善构建来源概述',
        detail: incomplete ? '请补齐无法追溯的来源信息后更新概述' : '建议明确构建依据及其适用范围',
        basis: '已登记的产业链构建资料',
        changes: [{
          label: '来源概述', current: shown(overview),
          suggestion: '按构建信源列明发布机构、发布时间、原始出处及适用环节。'
        }]
      });
    }
    return issues;
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

  function review({ row = {}, nodes = [], sourceNote, linkedCompanies = row?.linkedCompanies || [], sourceCandidates = row?.graphSourceCandidates || [] }) {
    const safeRow = row || {};
    const { canvas, advantageNames, weakNames, stageNames } = inspectCanvas(nodes);
    return [
      checkSegment('advantage', safeRow.advantage || safeRow.advantageSegments || safeRow.advantageLinks, advantageNames),
      checkSegment('weak', safeRow.weak, weakNames),
      checkEnterprises(safeRow, canvas, linkedCompanies),
      checkStructure(safeRow, stageNames),
      ...checkSources(safeRow, sourceNote, sourceCandidates)
    ].filter(Boolean);
  }

  window.zhiyanChainQualityMetadata = Object.freeze({ review, summarize });
})();

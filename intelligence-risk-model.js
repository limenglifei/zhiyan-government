(function () {
  'use strict';

  const axes = ['cost', 'revenue', 'supply', 'demand'];
  const directions = ['both', 'forward', 'reverse'];
  const edgeCoefficientLimit = 5;
  const maxSignal = 100;
  const epsilon = 1e-9;
  const baseThresholds = Object.freeze({ cost: 8, profit: 4, gap: 8 });
  const severityCutoffs = Object.freeze({ medium: 35, high: 70 });
  const zero = () => [0, 0, 0, 0];
  const round = value => Number(value.toFixed(4)) || 0;
  const named = vector => Object.fromEntries(axes.map((axis, index) => [axis, round(vector[index])]));
  const isId = id => typeof id === 'string' && id.trim().length > 0;

  function requireCondition(condition, message) {
    if (!condition) throw new Error(message);
  }

  function readVector(value, context, options = {}) {
    let parts = value;
    if (options.scalar && typeof value === 'number') parts = axes.map(() => value);
    else if (value && !Array.isArray(value) && typeof value === 'object') parts = axes.map(axis => value[axis]);
    requireCondition(Array.isArray(parts) && parts.length === axes.length &&
      Array.from(parts).every(amount => Number.isFinite(amount) && Math.abs(amount) <= (options.limit ?? Infinity)),
    `请核对${context}的成本、营收、供给和需求系数。${options.limit === undefined ? '' : `每项取值须在 ±${options.limit} 范围内。`}`);
    return [...parts];
  }

  function indexEntries(entries, kind) {
    requireCondition(Array.isArray(entries) && entries.length, `缺少${kind}配置。`);
    const map = new Map();
    for (const item of entries) {
      requireCondition(item && isId(item.id) && !map.has(item.id), `${kind}标识为空或重复。`);
      map.set(item.id, item);
    }
    return map;
  }

  function topologicalOrder(outgoing, indegree) {
    const ready = [...indegree.keys()].filter(id => indegree.get(id) === 0);
    for (let cursor = 0; cursor < ready.length; cursor++) {
      for (const { target } of outgoing.get(ready[cursor])) {
        const degree = indegree.get(target) - 1;
        indegree.set(target, degree);
        if (degree === 0) ready.push(target);
      }
    }
    requireCondition(ready.length === indegree.size, '产业链存在闭环，请先将关系整理为有向无环图。');
    return ready;
  }

  function prepareGraph(configuration) {
    requireCondition(configuration && typeof configuration === 'object', '缺少产业链分析配置。');
    const { edges, interactions = [] } = configuration;
    const nodes = indexEntries(configuration.nodes, '产业节点');
    const metrics = indexEntries(configuration.metrics, '指标');
    requireCondition(Array.isArray(edges) && Array.isArray(interactions), '请核对产业关系和指标交互配置。');
    const forward = new Map([...nodes.keys()].map(id => [id, []]));
    const reverse = new Map([...nodes.keys()].map(id => [id, []]));
    const indegree = new Map([...nodes.keys()].map(id => [id, 0]));
    for (const edge of edges) {
      requireCondition(edge && nodes.has(edge.from) && nodes.has(edge.to) && edge.from !== edge.to, '产业关系引用了无效或自身节点。');
      const { from, to } = edge;
      requireCondition(!forward.get(from).some(edge => edge.target === to), `产业关系 ${from} → ${to} 重复。`);
      forward.get(from).push({ target: to, weights: readVector(edge.forward, '下游传导', { scalar: true, limit: edgeCoefficientLimit }) });
      reverse.get(to).push({ target: from, weights: readVector(edge.reverse, '上游传导', { scalar: true, limit: edgeCoefficientLimit }) });
      indegree.set(to, indegree.get(to) + 1);
    }
    const order = topologicalOrder(forward, indegree);
    const weightsByMetric = new Map([...metrics].map(([id, metric]) => [id, readVector(metric.weights, `指标 ${metric.label || id}`)]));
    const knownPairs = new Set();
    const pairs = interactions.map(entry => {
      const pair = entry?.pair;
      requireCondition(Array.isArray(pair) && pair.length === 2 && pair[0] !== pair[1] && pair.every(id => metrics.has(id)), '指标交互须由两个不同的已配置指标组成。');
      const pairKey = JSON.stringify([...pair].sort());
      requireCondition(!knownPairs.has(pairKey), '同一指标组合存在重复的交互系数。');
      knownPairs.add(pairKey);
      const cap = entry.cap ?? 25;
      requireCondition(Number.isFinite(cap) && cap > 0 && cap <= maxSignal, '交互作用上限须大于 0 且不超过 100。');
      return { pair, label: entry.label, cap, weights: readVector(entry.weights, `指标交互 ${pair.join(' × ')}`) };
    });
    return { nodes, metrics, weightsByMetric, pairs, order, forward, reverse };
  }

  function addVectors(vectors) {
    const totals = zero();
    for (const vector of vectors) vector.forEach((value, index) => { totals[index] += value; });
    requireCondition(totals.every(Number.isFinite), '变化量超出模型的数值范围。');
    return totals;
  }

  function offsetsFor(vectors) {
    return axes.map((axis, index) => {
      let positive = 0;
      let negative = 0;
      for (const vector of vectors) {
        const value = vector[index];
        if (value > 0) positive += value;
        else negative -= value;
      }
      return Math.min(positive, negative);
    });
  }

  function calculateSources(graph, signals) {
    requireCondition(Array.isArray(signals), '请输入有效的冲击指标列表。');
    const allMetrics = new Set();
    const byNode = new Map();
    for (const signal of signals) {
      requireCondition(signal && graph.nodes.has(signal.nodeId) && graph.metrics.has(signal.metricId), '有冲击项引用了不存在的节点或指标。');
      const { nodeId, metricId, value } = signal;
      const metric = graph.metrics.get(metricId);
      requireCondition(Number.isFinite(value) && Math.abs(value) <= maxSignal, `指标 ${metric.label || metricId} 的变化量须在 ±${maxSignal} 范围内。`);
      if (!byNode.has(nodeId)) byNode.set(nodeId, new Map());
      const selected = byNode.get(nodeId);
      requireCondition(!selected.has(metricId), `节点 ${graph.nodes.get(nodeId).label || nodeId} 的指标 ${metric.label || metricId} 重复。`);
      selected.set(metricId, value);
      allMetrics.add(metricId);
    }

    const sources = new Map();
    for (const [id, selected] of byNode) {
      const components = [...selected].map(([metricId, value]) => {
        const metric = graph.metrics.get(metricId);
        const vector = graph.weightsByMetric.get(metricId).map(weight => weight * value);
        return { metricId, label: metric.label || metricId, value, mode: metric.mode, vector };
      });
      const interactions = graph.pairs.filter(({ pair }) => pair.every(id => selected.has(id))).map(({ pair, label, cap, weights }) => {
        const values = pair.map(id => selected.get(id));
        const units = Math.max(-cap, Math.min(cap, values[0] * values[1] / maxSignal));
        return { metricIds: [...pair], label: label || pair.map(id => graph.metrics.get(id).label || id).join(' × '), values, units, cap, vector: weights.map(weight => weight * units) };
      });
      const vectors = [...components, ...interactions].map(item => item.vector);
      const policyValues = components.filter(item => item.mode === 'policy').map(item => item.value);
      sources.set(id, {
        vector: addVectors(vectors), offsets: offsetsFor(vectors),
        policyScore: policyValues.length ? policyValues.reduce((sum, value) => sum + value, 0) : null,
        components: components.map(({ vector, ...item }) => ({ ...item, effect: named(vector) })),
        interactions: interactions.map(({ vector, ...item }) => ({ ...item, units: round(item.units), effect: named(vector) }))
      });
    }
    return { sources, allMetrics };
  }

  function preferredPath(candidateValue, value, candidatePath, path) {
    const difference = Math.abs(candidateValue) - Math.abs(value);
    if (Math.abs(difference) > epsilon) return difference > 0;
    if (candidatePath.length !== path.length) return candidatePath.length < path.length;
    return candidatePath.join('\u001f') < path.join('\u001f');
  }

  function strongestPaths(sourceId, vector, traversal, adjacency) {
    const reached = new Map([[sourceId, { vector, paths: axes.map(() => [sourceId]) }]]);
    for (const id of traversal) {
      const current = reached.get(id);
      if (!current) continue;
      for (const { target, weights } of adjacency.get(id)) {
        const next = reached.get(target) || { vector: zero(), paths: axes.map(() => []) };
        for (const [index, weight] of weights.entries()) {
          const value = current.vector[index] * weight;
          requireCondition(Number.isFinite(value), '传导后的变化量超出模型的数值范围。');
          if (Math.abs(value) <= epsilon) continue;
          const path = [...current.paths[index], target];
          if (!next.paths[index].length || preferredPath(value, next.vector[index], path, next.paths[index])) {
            next.vector[index] = value;
            next.paths[index] = path;
          }
        }
        if (next.paths.some(path => path.length)) reached.set(target, next);
      }
    }
    reached.delete(sourceId);
    return reached;
  }

  function contribution(sourceId, direction, vector, paths) {
    const primaryAxis = vector.reduce((best, value, index) => Math.abs(value) > Math.abs(vector[best]) ? index : best, 0);
    return {
      sourceId, direction, vector,
      path: direction === 'direct' ? [sourceId] : paths[primaryAxis],
      pathByAxis: Object.fromEntries(axes.map((axis, index) => [axis, paths[index]]))
    };
  }

  function collectContributions(graph, sources, direction) {
    const incoming = new Map([...graph.nodes.keys()].map(id => [id, []]));
    const passes = [];
    if (direction !== 'reverse') passes.push({ direction: 'forward', order: graph.order, adjacency: graph.forward });
    if (direction !== 'forward') passes.push({ direction: 'reverse', order: [...graph.order].reverse(), adjacency: graph.reverse });
    for (const [id, { vector }] of sources) {
      incoming.get(id).push(contribution(id, 'direct', vector, axes.map(() => [id])));
      for (const pass of passes) {
        for (const [target, result] of strongestPaths(id, vector, pass.order, pass.adjacency)) {
          incoming.get(target).push(contribution(id, pass.direction, result.vector, result.paths));
        }
      }
    }
    return incoming;
  }

  function evaluateProfit(cost, revenue, margin) {
    const nextRevenue = 100 + revenue;
    const nextCost = (100 - margin) * (1 + cost / 100);
    const modelDomainExceeded = nextRevenue <= 0 || nextCost < 0;
    if (modelDomainExceeded) return { profit: null, profitChange: null, modelDomainExceeded };
    const nextProfit = nextRevenue - nextCost;
    return {
      profit: (nextProfit / nextRevenue) * 100 - margin,
      profitChange: margin === 0 ? null : ((nextProfit - margin) / margin) * 100,
      modelDomainExceeded
    };
  }

  function evaluateRisk(cost, profit, gap, thresholds, domainExceeded) {
    const adverse = { cost: Math.max(0, cost), profit: Math.max(0, -(profit ?? 0)), gap: Math.max(0, -gap) };
    const riskTriggers = Object.entries(adverse).filter(([, value]) => value > epsilon).map(([axis, value]) => ({
      axis, adverse: round(value), threshold: thresholds[axis], score: round(Math.min(100, value / thresholds[axis] * severityCutoffs.high))
    }));
    const riskScore = domainExceeded ? 100 : Math.max(0, ...riskTriggers.map(trigger => trigger.score));
    const riskLevel = riskScore >= severityCutoffs.high ? 'high' : riskScore >= severityCutoffs.medium ? 'medium' : riskScore ? 'low' : 'none';
    return { riskScore, riskLevel, riskTriggers };
  }

  function outputRow(node, direct, contributions, margin, thresholds) {
    const vector = addVectors(contributions.map(item => item.vector));
    const [cost, revenue, supply, demand] = vector;
    const gap = supply - demand;
    const { profit, profitChange, modelDomainExceeded } = evaluateProfit(cost, revenue, margin);
    const impact = named(vector);
    return {
      id: node.id, label: node.label || node.id, stage: node.stage, ...impact, impact,
      gap: round(gap), profit: profit === null ? null : round(profit), profitChange: profitChange === null ? null : round(profitChange),
      modelDomainExceeded, baseProfitMargin: margin, ...evaluateRisk(cost, profit, gap, thresholds, modelDomainExceeded),
      direct: named(direct?.vector || zero()),
      propagated: named(addVectors(contributions.filter(item => item.direction !== 'direct').map(item => item.vector))),
      offsets: named(addVectors([direct?.offsets || zero(), offsetsFor(contributions.map(item => item.vector))])),
      components: direct?.components || [], interactionEffects: direct?.interactions || [], policyScore: direct?.policyScore ?? null,
      contributors: contributions.map(({ vector, ...item }) => ({ ...item, effect: named(vector) }))
    };
  }

  function evaluate(configuration, options = {}) {
    const graph = prepareGraph(configuration);
    const { signals = [], direction = 'both', baseProfitMargin = 10 } = options;
    requireCondition(directions.includes(direction), '请选择有效的传导方向。');
    requireCondition(Number.isFinite(baseProfitMargin) && baseProfitMargin >= 0 && baseProfitMargin < 100, '基期利润率须在 0% 至 100% 之间且小于 100%。');
    const thresholds = { ...baseThresholds, ...options.thresholds };
    requireCondition(Object.keys(baseThresholds).every(axis => Number.isFinite(thresholds[axis]) && thresholds[axis] > 0), '高风险阈值须为正数。');
    const { sources, allMetrics } = calculateSources(graph, signals);
    const anchor = options.anchor ?? sources.keys().next().value ?? graph.nodes.keys().next().value;
    requireCondition(graph.nodes.has(anchor), '请选择已配置的观察节点。');
    const policy = allMetrics.size > 0 && [...allMetrics].every(id => graph.metrics.get(id).mode === 'policy');
    const scenario = !allMetrics.size ? 'baseline' : policy ? 'policy' : sources.size > 1 ? 'multi-node' : allMetrics.size > 1 ? 'multi-metric' : 'single-metric';
    const incoming = collectContributions(graph, sources, direction);
    const rows = [...graph.nodes.values()].map(node => outputRow(node, sources.get(node.id), incoming.get(node.id), baseProfitMargin, thresholds));
    const counts = { none: 0, low: 0, medium: 0, high: 0 };
    for (const row of rows) counts[row.riskLevel]++;
    const ranked = [...rows].sort((a, b) => b.riskScore - a.riskScore);
    const policyScores = [...sources.values()].map(source => source.policyScore).filter(value => value !== null);
    return {
      anchor, scenario, direction, baseProfitMargin, thresholds, severityCutoffs, rows, counts,
      anchorResult: rows.find(row => row.id === anchor), riskLevel: ranked[0].riskLevel, riskScore: ranked[0].riskScore,
      ranked, policyScore: policyScores.length ? round(policyScores.reduce((sum, value) => sum + value, 0)) : null
    };
  }

  const assumptions = Object.freeze({
    transfer: '同一冲击源到同一节点按各维度绝对值最大的路径传导一次。不同冲击源按有符号变化量叠加。',
    direction: '沿有向无环图分别计算上游和下游传导。负系数反转影响方向，绝对值大于 1 时放大一跳的影响。',
    interaction: '同节点成对指标的有符号输入相乘后除以 100，按交互上限截断，再乘各维度系数。',
    profit: '成本、营收、供给和需求为相对基期变化。利润率按基期营收 100、基期成本 100 减利润率重新计算，结果以百分点展示。',
    gap: '供需差为供给增幅减需求增幅，按百分点计。负值表示相对基期的供需压力加大。',
    alert: '成本上升、利润率下降、供需差为负的幅度分别除以高风险阈值并乘 70，取最高得分，最高 100。35 分起为中风险，70 分起为高风险。'
  });
  window.zhiyanRiskModel = Object.freeze({ evaluate, assumptions, baseThresholds, severityCutoffs, edgeCoefficientLimit, maxSignal });
})();

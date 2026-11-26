(function () {
  'use strict';

  const catalog = [
    ['政策法律出台', ['货币政策', '财政政策', '行业准入', '牌照许可', '价格管制', '反垄断', '环保合规', '数据合规', '体制改革', '其他政策']],
    ['地缘政治与贸易冲突', ['战争冲突', '制裁', '关税', '出口管制', '进口限制', '投资审查', '外交摩擦', '关键资源禁运', '其他地缘事件']],
    ['金融与市场冲击', ['利率异动', '汇率异动', '股市剧烈波动', '债市剧烈波动', '大宗商品波动', '金融机构风险', '流动性冲击', '主权债务风险', '其他金融冲击']],
    ['技术突破与产业变革', ['技术突破', '新产品量产', '专利变化', '标准变化', 'AI 产业化', '量子技术产业化', '生物技术产业化', '替代技术成熟', '其他技术变革']],
    ['自然灾害与公共安全', ['地震洪水', '极端天气', '疫情', '重大事故', '网络攻击', '恐怖事件', '其他灾害安全']],
    ['供应链与运营中断', ['断供', '能源短缺', '航运受阻', '关键零部件短缺', '停产停工', '产能事故', '库存危机', '其他中断']],
    ['企业战略与交易', ['并购重组', '分立剥离', '重大投资扩产', '重大合同订单', '战略联盟', '上市', '再融资', '业务转型', '其他战略交易']],
    ['公司治理与人事', ['实控人变更', '董事长变动', '总经理变动', '财务负责人变动', '股权激励', '股东维权', '董事会改组', '其他治理人事']],
    ['财务与合规风险', ['业绩预警', '重大亏损', '资产减值', '债务违约', '现金流危机', '诉讼仲裁', '监管处罚', '立案调查', '退市风险', '财务造假', '其他合规风险']],
    ['社会需求与舆情', ['消费行为迁移', '人口结构变化', '劳工罢工', '抵制运动', '品牌信任危机', '舆论危机', '其他社会舆情']],
    ['综合新闻/其他', ['一般时政', '人物动态', '行业综述', '会议活动', '其他']]
  ].map(([label, subtypes], index) => {
    const code = String(index + 1);
    return {
      code, label,
      subtypes: subtypes.map((label, index) => ({ code: code + '.' + (index + 1), label }))
    };
  });
  const categories = new Map(catalog.map(category => [category.code, category]));
  const subtypeLabels = new Map(catalog.flatMap(category => category.subtypes.map(({ code, label }) => [code, label])));
  const dimensions = {
    city: { label: '城市', examples: '如合肥市、芜湖市' },
    company: { label: '企业', examples: '如合芯微电子' },
    product: { label: '产品', examples: '如车规功率模块' },
    technology: { label: '技术', examples: '如碳化硅、先进封装' },
    person: { label: '人物', examples: '如林明远' }
  };
  const levels = ['宏观', '行业', '企业', '个体'];
  const sentiments = ['中立', '反面', '正面'];
  const sampleEvents = [
    {
      id: 'sic-validation', category: '4', subtypes: ['4.1'], level: '企业', sentiment: '正面',
      title: '车规碳化硅功率模块完成首轮验证', time: '2026-11-26 10:30',
      summary: '演示场景中，合芯微电子完成一款车规功率模块的首轮可靠性验证，下一阶段将与整车客户开展系统级适配。首轮验证通过仍需结合后续车规认证和客户采购评估量产机会。',
      tags: { city: ['合肥市'], company: ['合芯微电子'], product: ['车规功率模块'], technology: ['碳化硅'], person: ['林明远'] }
    },
    {
      id: 'pilot-guidance', category: '1', subtypes: ['1.2'], level: '行业', sentiment: '中立',
      title: '先进制造中试支持方案进入意见征集阶段', time: '2026-11-26 09:45',
      summary: '演示方案提出支持共性中试平台、开放验证设备及服务目录，征集对象包括行业组织和制造企业。支持范围、申报窗口和资助标准以最终文件为准。',
      tags: { city: ['合肥市', '芜湖市'], product: ['中试验证服务'], technology: ['先进制造'] }
    },
    {
      id: 'packaging-standard', category: '4', subtypes: ['4.4'], level: '行业', sentiment: '中立',
      title: '先进封装可靠性评价方法发布征求意见稿', time: '2026-11-26 08:50',
      summary: '演示稿建议统一试样、热循环和失效记录口径。封装企业可提前整理现有试验数据，对照拟议指标评估产线与检测能力。',
      tags: { city: ['合肥市', '苏州市'], product: ['芯粒封装基板'], technology: ['先进封装', '芯粒集成'] }
    },
    {
      id: 'logistics-window', category: '6', subtypes: ['6.3', '6.4'], level: '企业', sentiment: '反面',
      title: '部分支线停航，精密零部件出现短期供应缺口', time: '2026-11-25 18:20',
      summary: '演示场景中，园区配套港区暂停部分支线作业，部分在途零部件延期交付。受影响范围依订单和路线而定，需核查替代通道和库存覆盖周期。',
      tags: { city: ['芜湖市', '合肥市'], company: ['皖江精密制造'], product: ['精密传感器'], technology: ['精密装配'] }
    },
    {
      id: 'equipment-trade', category: '2', subtypes: ['2.3', '2.4'], level: '宏观', sentiment: '反面',
      title: '关键设备进口成本及跨境许可面临变化', time: '2026-11-25 16:40',
      summary: '演示场景涉及部分设备关税和出口许可调整。企业应先核对海关编码、出口地及适用生效日期，再评估对订单和产线投资的影响。',
      tags: { product: ['精密检测设备'], technology: ['光学检测'] }
    },
    {
      id: 'material-price', category: '3', subtypes: ['3.2', '3.5'], level: '宏观', sentiment: '中立',
      title: '汇率与关键原材料报价出现阶段性波动', time: '2026-11-25 15:30',
      summary: '演示场景中，贸易结算汇率和原材料报价同步波动，实际成本暴露取决于合同定价周期、结算币种和现货库存。',
      tags: { product: ['电池级锂盐'], technology: ['锂电材料'] }
    },
    {
      id: 'storm-alert', category: '5', subtypes: ['5.2'], level: '行业', sentiment: '反面',
      title: '强降雨预警影响园区道路通行', time: '2026-11-25 14:10',
      summary: '演示场景中，强降雨预警涉及园区主要道路。重点核查仓储节点、到货批次与备用路线，企业产线状态以实际运行为准。',
      tags: { city: ['合肥市', '芜湖市'], product: ['园区物流服务'] }
    },
    {
      id: 'test-center', category: '7', subtypes: ['7.3', '7.5'], level: '企业', sentiment: '正面',
      title: '检测企业签署合作协议，共建汽车电子验证中心', time: '2026-11-25 13:40',
      summary: '演示场景中，江淮智测与园区平台签署合作意向。后续跟踪选址、投资决策、建设排期与对外开放条件。',
      tags: { city: ['合肥市'], company: ['江淮智测'], product: ['汽车电子验证服务'], technology: ['电磁兼容'], person: ['陈晓宁'] }
    },
    {
      id: 'management-change', category: '8', subtypes: ['8.3'], level: '企业', sentiment: '中立',
      title: '精密制造企业调整总经理分工', time: '2026-11-25 11:25',
      summary: '演示场景中，皖江精密制造完成经理层任命调整。总经理职责覆盖生产经营与供应商管理，股权结构未纳入本条事件范围。',
      tags: { city: ['芜湖市'], company: ['皖江精密制造'], person: ['许澄'] }
    },
    {
      id: 'compliance-review', category: '9', subtypes: ['9.6', '9.7'], level: '企业', sentiment: '反面',
      title: '装备企业披露合同争议及整改进展', time: '2026-11-25 10:35',
      summary: '演示场景中，装备企业对合同争议和整改措施作出阶段说明。履约责任、行政处罚范围与经营影响需结合正式文件分别核查。',
      tags: { city: ['苏州市'], company: ['苏澜装备'], product: ['精密检测设备'] }
    },
    {
      id: 'demand-survey', category: '10', subtypes: ['10.1'], level: '行业', sentiment: '中立',
      title: '充电设施采购关注点向运维和可用率转移', time: '2026-11-25 09:45',
      summary: '演示调研显示，采购评价开始纳入设备在线率、故障修复效率和服务覆盖率，相关指标可作为下一轮供应商筛选参考。',
      tags: { city: ['合肥市'], product: ['公共充电设备'], technology: ['充电设施运维'] }
    },
    {
      id: 'engineer-forum', category: '11', subtypes: ['11.2', '11.4'], level: '个体', sentiment: '正面',
      title: '封装技术交流会公布专题分享名单', time: '2026-11-25 09:00',
      summary: '演示活动安排工程团队分享芯粒封装和材料可靠性验证。可按议题和嘉宾了解技术方向。',
      tags: { city: ['合肥市'], company: ['合芯微电子'], technology: ['先进封装'], person: ['林明远'] }
    }
  ];
  const starterSubscriptions = [
    {
      id: 'sample-tech', name: '合肥先进制造动态', enabled: true, sample: true,
      dimensions: { city: ['合肥市'] }, levels: [], sentiments: [], eventCodes: ['4.1', '4.2', '4.4']
    },
    {
      id: 'sample-business', name: '合肥制造业政策与项目', enabled: true, sample: true,
      dimensions: { city: ['合肥市'] }, levels: ['行业'], sentiments: [], eventCodes: ['1.2', '1.3']
    },
    {
      id: 'sample-supply', name: '皖江关键零部件交付', enabled: true, sample: true,
      dimensions: { company: ['皖江精密制造'] }, levels: [], sentiments: ['反面'], eventCodes: ['6.3', '6.4']
    }
  ];
  const storageKey = 'zhiyan-intelligence-feed-v2';
  const legacyStorageKey = 'zhiyan-intelligence-feed-v1';
  const emptyRule = { dimensions: {}, levels: [], sentiments: [], eventCodes: [] };
  const main = document.querySelector('.main');
  if (!main) return;

  const root = document.createElement('section');
  root.id = 'intelligenceFeed';
  root.className = 'content view';
  root.setAttribute('aria-labelledby', 'intelligenceFeedHeading');
  root.innerHTML = `
    <header class="if-heading">
      <div><h1 id="intelligenceFeedHeading">情报订阅</h1><p>设置关注条件，集中查看命中的产业动态与企业事件。</p></div>
      <button class="if-button if-primary" type="button" data-if-action="create"><span aria-hidden="true">＋</span> 新建订阅</button>
    </header>
    <div class="if-overview" aria-label="订阅概况"></div>
    <nav class="if-tabs" aria-label="情报订阅视图">
      <button type="button" data-if-action="feed" aria-pressed="true">订阅信息流</button>
      <button type="button" data-if-action="subscriptions" aria-pressed="false">我的订阅</button>
    </nav>
    <p class="if-status" role="status" hidden></p>
    <div class="if-workspace"></div>`;
  main.appendChild(root);

  const dialog = document.createElement('dialog');
  dialog.className = 'if-dialog';
  dialog.setAttribute('aria-labelledby', 'ifDialogTitle');
  document.body.appendChild(dialog);
  const overview = root.querySelector('.if-overview');
  const workspace = root.querySelector('.if-workspace');
  const status = root.querySelector('.if-status');
  const view = { tab: 'feed', subscription: '', read: '', search: '', selected: '', collapsedAnalysis: new Set() };
  let state = readState() || { subscriptions: starterSubscriptions, read: [] };
  let focusBeforeDialog;

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  }

  function normalize(value) {
    return value.normalize('NFKC').trim().toLowerCase();
  }

  function readState() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) ?? localStorage.getItem(legacyStorageKey));
      if (!stored || !Array.isArray(stored.subscriptions) || !Array.isArray(stored.read)) return null;
      return {
        subscriptions: stored.subscriptions.map(migrateSubscription).filter(isValidSubscription),
        read: stored.read.filter(id => sampleEvents.some(event => event.id === id))
      };
    } catch (error) {
      return null;
    }
  }

  function orderedEventCodes(selected) {
    return [...subtypeLabels.keys()].filter(code => selected.has(code));
  }

  function migrateSubscription(rule) {
    if (!rule || typeof rule !== 'object') return null;
    const { category, subtypes, ...current } = rule;
    if (Array.isArray(current.eventCodes)) {
      if (!current.eventCodes.every(code => subtypeLabels.has(code))) return null;
      return { ...current, eventCodes: orderedEventCodes(new Set(current.eventCodes)) };
    }
    if (!Array.isArray(subtypes)) return null;
    if (category === '' && !subtypes.length) return { ...current, eventCodes: [] };
    const parent = categories.get(category);
    if (!parent || !subtypes.length || !subtypes.every(code => parent.subtypes.some(subtype => subtype.code === code))) return null;
    return { ...current, eventCodes: orderedEventCodes(new Set(subtypes)) };
  }

  function isValidSubscription(rule) {
    return rule && typeof rule.id === 'string' && typeof rule.name === 'string' && rule.name.trim() &&
      typeof rule.enabled === 'boolean' && rule.dimensions && typeof rule.dimensions === 'object' &&
      Object.keys(dimensions).every(key => rule.dimensions[key] === undefined ||
        (Array.isArray(rule.dimensions[key]) && rule.dimensions[key].every(value => typeof value === 'string' && value.trim()))) &&
      Array.isArray(rule.levels) && rule.levels.every(level => levels.includes(level)) &&
      Array.isArray(rule.sentiments) && rule.sentiments.every(sentiment => sentiments.includes(sentiment)) &&
      Array.isArray(rule.eventCodes) && rule.eventCodes.every(code => subtypeLabels.has(code));
  }

  function setStatus(message) {
    status.hidden = !message;
    status.textContent = message;
  }

  function saveState(change, message) {
    state = change(readState() || state);
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      setStatus(message);
    } catch (error) {
      setStatus('浏览器存储暂不可用，本次操作仅在当前页面保留。');
    }
  }

  function matches(event, rule) {
    return (!rule.eventCodes.length || event.subtypes.some(code => rule.eventCodes.includes(code))) &&
      (!rule.levels.length || rule.levels.includes(event.level)) &&
      (!rule.sentiments.length || rule.sentiments.includes(event.sentiment)) &&
      Object.keys(dimensions).every(key => {
        const terms = rule.dimensions[key] || [];
        return !terms.length || terms.some(term => (event.tags[key] || []).some(tag => normalize(tag).includes(normalize(term))));
      });
  }

  function hits() {
    const enabled = state.subscriptions.filter(rule => rule.enabled);
    return sampleEvents.map(event => ({
      event, rules: enabled.filter(rule => matches(event, rule))
    })).filter(entry => entry.rules.length);
  }

  function render() {
    const entries = hits();
    const unread = entries.filter(entry => !state.read.includes(entry.event.id)).length;
    const active = state.subscriptions.filter(rule => rule.enabled).length;
    const metrics = [['生效订阅', active], ['命中情报', entries.length], ['未读情报', unread]];
    overview.innerHTML = `<div class="if-metrics">${metrics.map(([label, value]) => `
      <div><span>${label}</span><strong>${value}</strong></div>`).join('')}</div>
      <p class="if-source"><span class="if-source-dot" aria-hidden="true"></span> 示例情报源</p>`;
    root.querySelectorAll('.if-tabs button').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.ifAction === view.tab));
    });
    if (view.tab === 'feed') renderFeed(entries);
    else renderSubscriptions();
  }

  function renderFeed(entries) {
    const enabled = state.subscriptions.filter(rule => rule.enabled);
    if (!enabled.some(rule => rule.id === view.subscription)) view.subscription = '';
    const search = normalize(view.search);
    const visible = entries.filter(({ event, rules }) => {
      const isRead = state.read.includes(event.id);
      const tags = Object.values(event.tags).flat();
      return (!view.subscription || rules.some(rule => rule.id === view.subscription)) &&
        (view.read !== 'unread' || !isRead) && (view.read !== 'read' || isRead) &&
        (!search || normalize([event.title, event.summary, ...tags].join(' ')).includes(search));
    });
    const selected = visible.find(entry => entry.event.id === view.selected) || visible[0];
    view.selected = selected?.event.id || '';
    workspace.innerHTML = `
      <form class="if-filters" aria-label="筛选订阅信息流">
        <label class="if-search"><span class="if-sr">搜索情报</span><input name="search" type="search" placeholder="搜索标题、城市或主体" value="${esc(view.search)}"></label>
        <button type="submit" class="if-button">搜索</button>
        <label><span class="if-sr">订阅规则</span><select name="subscription">
          <option value="">全部订阅</option>
          ${enabled.map(rule => option(rule.id, rule.name, view.subscription)).join('')}
        </select></label>
        <label><span class="if-sr">阅读状态</span><select name="read">
          ${option('', '全部状态', view.read)}${option('unread', '仅未读', view.read)}${option('read', '仅已读', view.read)}
        </select></label>
      </form>
      <div class="if-feed-grid">
        <section class="if-card if-feed" aria-labelledby="ifListHeading">
          <header class="if-list-heading"><h2 id="ifListHeading">命中情报</h2><span>${visible.length} 条</span></header>
          ${visible.length ? visible.map(entry => eventRow(entry, view.selected)).join('') : emptyFeed()}
        </section>
        ${selected ? eventDetail(selected) : '<div class="if-card if-empty if-detail-empty">选择情报查看事件详情与命中原因</div>'}
      </div>`;
  }

  function option(value, label, selected) {
    return `<option value="${esc(value)}"${value === selected ? ' selected' : ''}>${esc(label)}</option>`;
  }

  function emptyFeed() {
    const enabled = state.subscriptions.some(rule => rule.enabled);
    if (view.read || view.search) {
      return '<div class="if-empty"><strong>暂无符合当前筛选的情报</strong><button class="if-link" type="button" data-if-action="clear">清空筛选</button></div>';
    }
    if (view.subscription) {
      return `<div class="if-empty"><strong>当前订阅暂无匹配情报</strong><button class="if-link" type="button" data-if-action="edit" data-if-id="${esc(view.subscription)}">调整订阅条件</button><button class="if-link" type="button" data-if-action="clear">查看全部订阅</button></div>`;
    }
    if (enabled) return '<div class="if-empty"><strong>暂无订阅命中</strong><p>可以在“我的订阅”中调整关注条件。</p></div>';
    return '<div class="if-empty"><strong>暂无生效的订阅</strong><button class="if-link" type="button" data-if-action="subscriptions">查看我的订阅</button></div>';
  }

  function eventRow({ event, rules }, selected) {
    const unread = !state.read.includes(event.id);
    return `<button class="if-event" type="button" data-if-action="event" data-if-id="${event.id}" aria-pressed="${event.id === selected}">
      <span class="if-event-meta"><span class="if-badge">${categories.get(event.category).label}</span><time datetime="${event.time.replace(' ', 'T')}+08:00">${event.time.slice(5)}</time></span>
      <strong>${unread ? '<i class="if-unread-dot" aria-label="未读"></i>' : ''}${esc(event.title)}</strong>
      <span class="if-event-summary">${esc(event.summary)}</span>
      <span class="if-event-meta"><span>${esc((event.tags.city || []).join(' · ') || event.level)}</span><span>${rules.length} 项订阅命中</span></span>
    </button>`;
  }

  function eventDetail({ event, rules }) {
    const unread = !state.read.includes(event.id);
    const tagRows = Object.entries(dimensions)
      .filter(([key]) => event.tags[key]?.length)
      .map(([key, { label }]) => `<div><dt>${label}</dt><dd>${event.tags[key].map(value => `<span class="if-badge if-plain">${esc(value)}</span>`).join('')}</dd></div>`);

    return `<article class="if-card if-detail" aria-labelledby="ifEventTitle">
      <header>
        <div class="if-event-meta"><span class="if-badge">${event.category} ${categories.get(event.category).label}</span><span class="if-badge if-sentiment" data-sentiment="${event.sentiment}">${event.sentiment}</span></div>
        <h2 id="ifEventTitle">${esc(event.title)}</h2>
        <p class="if-detail-date">示例情报 · <time datetime="${event.time.replace(' ', 'T')}+08:00">${event.time}</time></p>
        <div class="if-detail-tags">${event.subtypes.map(code => `<span class="if-badge if-plain">${code} ${subtypeLabels.get(code)}</span>`).join('')}</div>
      </header>
      <section><h3>事件摘要</h3><p>${esc(event.summary)}</p></section>
      ${eventAnalysis(event)}
      <section><h3>事件标签</h3>
        <dl class="if-tag-rows"><div><dt>影响层级</dt><dd><span class="if-badge if-plain">${event.level}</span></dd></div>${tagRows.join('')}</dl>
      </section>
      <section><h3>命中订阅</h3><ul class="if-matches">${rules.map(rule => `
        <li><b>${esc(rule.name)}</b><span>${ruleTags(rule, event).map(esc).join(' · ')}</span></li>`).join('')}</ul>
      </section>
      <footer><button class="if-button" type="button" data-if-action="read" data-if-id="${event.id}">${unread ? '标为已读' : '标为未读'}</button></footer>
    </article>`;
  }

  function eventAnalysis(event) {
    const analysis = window.zhiyanIntelligenceAnalysis?.[event.id];
    const expanded = !view.collapsedAnalysis.has(event.id);
    return `<section class="if-analysis" aria-labelledby="ifAnalysisTitle">
      <header class="if-analysis-head">
        <div><h3 id="ifAnalysisTitle">AI 推理分析</h3><p>${analysis ? '基于当前示例情报的条件研判' : '暂无这条情报的推理分析'}</p></div>
        ${analysis ? `<button type="button" class="if-button if-analysis-toggle" data-if-action="analysis" data-if-id="${esc(event.id)}"
          aria-expanded="${expanded}" aria-controls="ifAnalysisBody">${expanded ? '收起分析' : '展开分析'}</button>` : ''}
      </header>
      ${analysis ? analysisBody(analysis, expanded) : ''}
    </section>`;
  }

  function analysisBody(analysis, expanded) {
    return `<div id="ifAnalysisBody" class="if-analysis-body"${expanded ? '' : ' hidden'}>
      ${analysis.summary ? `<p class="if-analysis-summary">${esc(analysis.summary)}</p>` : ''}
      <div class="if-analysis-block">
        <h4>产业链传导路径</h4>
        <ol class="if-transmission">
          ${analysis.transmission.map(({ segment, impact }) => `
            <li><strong>${esc(segment)}</strong><p>${esc(impact)}</p></li>`).join('')}
        </ol>
      </div>
      <div class="if-analysis-impacts">
        ${impactCard('行业影响', analysis.industry)}
        ${impactCard('企业影响', analysis.enterprise)}
      </div>
      <div class="if-analysis-block">
        <h4>企业负责人如何应对</h4>
        <dl class="if-analysis-owners">
          ${analysis.owners.map(({ role, responsibility }) => `
            <div><dt>${esc(role)}</dt><dd>${esc(responsibility)}</dd></div>`).join('')}
        </dl>
      </div>
      <div class="if-analysis-block">
        <h4>应对措施</h4>
        <ul class="if-analysis-actions">
          ${analysis.actions.map(({ priority, title, detail }) => `
            <li><span class="if-analysis-priority" data-priority="${esc(priority)}">${esc(priority)}</span><div><strong>${esc(title)}</strong><p>${esc(detail)}</p></div></li>`).join('')}
        </ul>
      </div>
      <aside class="if-analysis-evidence">
        <h4>依据与待核验事项</h4><p>${esc(analysis.verification)}</p>
      </aside>
    </div>`;
  }

  function impactCard(title, { impact, watch }) {
    return `<article class="if-analysis-impact">
      <h4>${title}</h4><p>${esc(impact)}</p>
      <p class="if-analysis-watch"><b>观察项</b> ${esc(watch)}</p>
    </article>`;
  }

  function toggleAnalysis(button, id) {
    const expanded = view.collapsedAnalysis.has(id);
    if (expanded) view.collapsedAnalysis.delete(id);
    else view.collapsedAnalysis.add(id);
    button.setAttribute('aria-expanded', String(expanded));
    button.textContent = expanded ? '收起分析' : '展开分析';
    workspace.querySelector('#ifAnalysisBody').hidden = !expanded;
  }

  function ruleTags(rule, event) {
    const tags = [];
    for (const [key, { label }] of Object.entries(dimensions)) {
      const values = rule.dimensions[key] || [];
      const matched = event ? values.filter(term => (event.tags[key] || []).some(tag => normalize(tag).includes(normalize(term)))) : values;
      if (matched.length) tags.push(label + ' ' + matched.join('、'));
    }
    const eventTypes = event ? rule.eventCodes.filter(code => event.subtypes.includes(code)).map(code => code + ' ' + subtypeLabels.get(code)) :
      shortEventLabels(rule.eventCodes);
    if (eventTypes.length) tags.push(...eventTypes);
    if (rule.levels.length) tags.push('影响层级 ' + (event ? event.level : rule.levels.join('、')));
    if (rule.sentiments.length) tags.push('舆情性质 ' + (event ? event.sentiment : rule.sentiments.join('、')));
    return tags;
  }

  function renderSubscriptions() {
    workspace.innerHTML = `<div class="if-manage">
      <header><h2>我的订阅</h2><p>暂停后规则及阅读状态会保留，恢复后继续匹配。</p></header>
      ${state.subscriptions.length ? `<div class="if-sub-grid">${state.subscriptions.map(subscriptionCard).join('')}</div>` :
        '<div class="if-card if-empty"><strong>还没有订阅</strong><button class="if-link" type="button" data-if-action="create">新建订阅</button></div>'}
    </div>`;
  }

  function subscriptionCard(rule) {
    const count = rule.enabled ? sampleEvents.filter(event => matches(event, rule)).length : 0;
    return `<article class="if-card if-sub">
      <header><h3>${esc(rule.name)} ${rule.sample ? '<span class="if-badge if-plain">示例规则</span>' : ''}</h3><span class="if-sub-state" data-active="${rule.enabled}">${rule.enabled ? '生效中' : '已暂停'}</span></header>
      <div class="if-detail-tags">${ruleTags(rule).map(tag => `<span class="if-badge if-plain">${esc(tag)}</span>`).join('')}</div>
      <footer>
        ${rule.enabled ? `<button type="button" class="if-link" data-if-action="ruleFeed" data-if-id="${esc(rule.id)}">查看信息流（${count}）</button>` : ''}
        <button type="button" class="if-link" data-if-action="edit" data-if-id="${esc(rule.id)}">编辑</button>
        <button type="button" class="if-link" data-if-action="toggle" data-if-id="${esc(rule.id)}">${rule.enabled ? '暂停' : '恢复'}</button>
        <button type="button" class="if-link if-danger" data-if-action="remove" data-if-id="${esc(rule.id)}">删除</button>
      </footer>
    </article>`;
  }

  function chips(name, entries, checked) {
    return entries.map(({ code, label }) => `<label class="if-chip"><input type="checkbox" name="${name}" value="${esc(code)}"${checked.includes(code) ? ' checked' : ''}><span>${esc(label)}</span></label>`).join('');
  }

  function shortEventLabels(codes) {
    const selected = new Set(codes);
    const labels = catalog.flatMap(category => {
      const leaves = category.subtypes.filter(({ code }) => selected.has(code));
      return leaves.length === category.subtypes.length
        ? [category.code + ' ' + category.label + '（全部）']
        : leaves.map(({ code, label }) => code + ' ' + label);
    });
    return labels.length > 4 ? [...labels.slice(0, 4), '另 ' + (labels.length - 4) + ' 项'] : labels;
  }

  function eventPickerMarkup() {
    return `<fieldset class="if-event-field">
      <legend>事件类型</legend>
      <button class="if-event-picker-toggle" type="button" aria-expanded="false" aria-controls="ifEventPicker" aria-describedby="ifEventPickerHint">
        <span data-if-event-value>不限事件类型</span><i aria-hidden="true">⌄</i>
      </button>
      <div class="if-event-picker-summary" data-if-event-summary hidden></div>
      <p class="if-help if-event-picker-hint" id="ifEventPickerHint">可跨类别多选，勾选一级即选中该类全部二级事件。任一所选事件类型命中即可。</p>
      <div class="if-event-picker" id="ifEventPicker" hidden>
        <div class="if-event-picker-search"><input type="search" autocomplete="off" spellcheck="false" aria-label="搜索事件类型名称或编码" placeholder="搜索事件类型名称或编码"></div>
        <div class="if-event-picker-columns">
          <div role="group" aria-labelledby="ifEventParentsTitle">
            <div class="if-event-picker-column-title" id="ifEventParentsTitle">一级事件类型</div>
            <div class="if-event-picker-options" data-if-event-parents></div>
          </div>
          <div role="group" aria-labelledby="ifEventChildrenTitle">
            <div class="if-event-picker-column-title" id="ifEventChildrenTitle">二级事件类型</div>
            <div class="if-event-picker-options" data-if-event-leaves></div>
          </div>
        </div>
        <div class="if-event-picker-footer">
          <span data-if-event-count role="status"></span>
          <div><button class="if-link" type="button" data-if-event-clear>清空</button>
            <button class="if-button" type="button" data-if-event-cancel>取消</button>
            <button class="if-button if-primary" type="button" data-if-event-confirm>确定</button></div>
        </div>
      </div>
    </fieldset>`;
  }

  function eventPickerGroups(query) {
    if (!query) return catalog;
    if (categories.has(query)) return [categories.get(query)];
    if (subtypeLabels.has(query)) {
      const category = categories.get(query.split('.')[0]);
      return [{ ...category, subtypes: category.subtypes.filter(({ code }) => code === query) }];
    }
    const tokens = query.split(/\s+/);
    return catalog.flatMap(category => {
      const parent = normalize(category.code + ' ' + category.label);
      const subtypes = category.subtypes.filter(({ code, label }) => {
        const path = parent + ' ' + normalize(code + ' ' + label);
        return tokens.every(token => path.includes(token));
      });
      return subtypes.length ? [{ ...category, subtypes }] : [];
    });
  }

  function bindEventPicker(form, initialCodes) {
    const field = form.querySelector('.if-event-field');
    const trigger = field.querySelector('.if-event-picker-toggle');
    const summary = field.querySelector('[data-if-event-summary]');
    const panel = field.querySelector('.if-event-picker');
    const search = panel.querySelector('input[type="search"]');
    const parents = panel.querySelector('[data-if-event-parents]');
    const leaves = panel.querySelector('[data-if-event-leaves]');
    const count = panel.querySelector('[data-if-event-count]');
    const clear = panel.querySelector('[data-if-event-clear]');
    const confirm = panel.querySelector('[data-if-event-confirm]');
    let applied = initialCodes;
    let draft = new Set(applied);
    let active = applied[0]?.split('.')[0] || catalog[0].code;
    let visibleGroups = catalog;

    function renderApplied() {
      trigger.querySelector('[data-if-event-value]').textContent = applied.length ? '已选 ' + applied.length + ' 项二级事件类型' : '不限事件类型';
      summary.hidden = !applied.length;
      summary.innerHTML = shortEventLabels(applied).map(label => `<span class="if-badge">${esc(label)}</span>`).join('');
    }

    function updateSelection() {
      parents.querySelectorAll('[data-if-parent]').forEach(input => {
        const all = categories.get(input.dataset.ifParent).subtypes;
        const selected = all.filter(({ code }) => draft.has(code)).length;
        input.checked = selected === all.length;
        input.indeterminate = selected > 0 && selected < all.length;
      });
      leaves.querySelectorAll('[data-if-leaf]').forEach(input => { input.checked = draft.has(input.dataset.ifLeaf); });
      const branches = new Set([...draft].map(code => code.split('.')[0])).size;
      count.textContent = draft.size ? '已选 ' + draft.size + ' 项，覆盖 ' + branches + ' 类' : '已选 0 项';
      clear.disabled = draft.size === 0;
    }

    function renderChildren(group) {
      parents.querySelectorAll('[data-if-drill]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.ifDrill === group?.code));
      });
      leaves.scrollTop = 0;
      leaves.innerHTML = group ? group.subtypes.map(({ code, label }) => `
        <label class="if-event-leaf">
          <input type="checkbox" value="${code}" data-if-leaf="${code}">
          <span class="if-event-code">${code}</span><span>${esc(label)}</span>
        </label>`).join('') : '<p class="if-event-picker-empty">暂无可显示的二级事件类型</p>';
      updateSelection();
    }

    function renderColumns() {
      visibleGroups = eventPickerGroups(normalize(search.value));
      parents.innerHTML = visibleGroups.length ? visibleGroups.map(({ code, label }) => `
        <div class="if-event-parent">
          <label><input type="checkbox" value="${code}" data-if-parent="${code}" aria-label="选择 ${code} ${esc(label)} 下的全部二级事件"></label>
          <button type="button" data-if-drill="${code}" aria-pressed="false">
            <span class="if-event-code">${code}</span><span>${esc(label)}</span><span class="if-event-next" aria-hidden="true">›</span>
          </button>
        </div>`).join('') : '<p class="if-event-picker-empty">没有找到匹配的事件类型</p>';
      parents.scrollTop = 0;
      renderChildren(visibleGroups.find(group => group.code === active) || visibleGroups[0]);
    }

    function closePicker() {
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      renderApplied();
      showFormError('');
      trigger.focus();
    }

    trigger.addEventListener('click', () => {
      if (!panel.hidden) return closePicker();
      draft = new Set(applied);
      search.value = '';
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      renderColumns();
      panel.scrollIntoView({ block: 'nearest' });
      search.focus({ preventScroll: true });
    });
    search.addEventListener('input', renderColumns);
    parents.addEventListener('click', event => {
      const button = event.target.closest('[data-if-drill]');
      if (!button) return;
      active = button.dataset.ifDrill;
      renderChildren(visibleGroups.find(group => group.code === active));
    });
    panel.addEventListener('change', event => {
      const input = event.target;
      const parent = categories.get(input.dataset.ifParent);
      const codes = parent ? parent.subtypes.map(({ code }) => code) : [input.dataset.ifLeaf];
      if (!subtypeLabels.has(codes[0])) return;
      for (const code of codes) {
        if (input.checked) draft.add(code);
        else draft.delete(code);
      }
      updateSelection();
    });
    clear.addEventListener('click', () => { draft.clear(); updateSelection(); });
    panel.querySelector('[data-if-event-cancel]').addEventListener('click', closePicker);
    confirm.addEventListener('click', () => {
      applied = orderedEventCodes(draft);
      closePicker();
    });
    form.addEventListener('keydown', event => {
      if (event.key === 'Enter' && event.target === search) event.preventDefault();
      if (event.key !== 'Escape' || panel.hidden) return;
      event.preventDefault();
      closePicker();
    });
    renderApplied();
    return {
      codes: () => applied,
      needsConfirmation: () => !panel.hidden && (applied.length !== draft.size || !applied.every(code => draft.has(code))),
      confirm
    };
  }

  function formDialog(rule) {
    const data = rule || { name: '', ...emptyRule };
    focusBeforeDialog = document.activeElement;
    dialog.innerHTML = `
      <form class="if-rule-form">
        <header class="if-dialog-header">
          <div><h2 id="ifDialogTitle">${rule ? '编辑订阅' : '新建订阅'}</h2><p>同一维度内任一值命中即可，已设置的不同条件需同时满足。</p></div>
          <button type="button" class="if-close" data-if-close aria-label="关闭">×</button>
        </header>
        <div class="if-dialog-body">
          <label class="if-field"><span>订阅名称 <em>必填</em></span><input name="name" required maxlength="60" placeholder="如合肥先进制造动态" value="${esc(data.name)}" autofocus></label>
          <fieldset>
            <legend>订阅对象</legend>
            <p class="if-help">填写一个或多个维度，多个关键词用顿号或逗号分隔。</p>
            <div class="if-fields">${Object.entries(dimensions).map(([key, { label, examples }]) => `
              <label class="if-field"><span>${label}</span><input name="${key}" maxlength="240" placeholder="${examples}" value="${esc((data.dimensions[key] || []).join('、'))}"></label>`).join('')}</div>
          </fieldset>
          <div class="if-fields if-classifications">
            <fieldset><legend>影响层级</legend><div class="if-chips">${chips('levels', levels.map(label => ({ code: label, label })), data.levels)}</div></fieldset>
            <fieldset><legend>舆情性质</legend><div class="if-chips">${chips('sentiments', sentiments.map(label => ({ code: label, label })), data.sentiments)}</div></fieldset>
          </div>
          ${eventPickerMarkup()}
          <p class="if-form-error" role="alert" hidden></p>
        </div>
        <footer class="if-dialog-footer"><button class="if-button" type="button" data-if-close>取消</button><button class="if-button if-primary" type="submit">保存订阅</button></footer>
      </form>`;
    const form = dialog.querySelector('form');
    const picker = bindEventPicker(form, data.eventCodes);
    form.addEventListener('change', () => showFormError(''));
    form.addEventListener('submit', event => {
      if (picker.needsConfirmation()) {
        event.preventDefault();
        showFormError('请先确认事件类型选择。');
        picker.confirm.focus();
        return;
      }
      submitRule(event, rule, picker.codes());
    });
    dialog.showModal();
  }

  function showFormError(message) {
    const error = dialog.querySelector('.if-form-error');
    error.hidden = !message;
    error.textContent = message;
  }

  function splitTerms(value) {
    return [...new Map(value.split(/[、,，;；\n]+/).map(term => term.trim()).filter(Boolean).map(term => [normalize(term), term])).values()];
  }

  function submitRule(event, original, eventCodes) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const name = fields.get('name').trim();
    const selectedLevels = fields.getAll('levels');
    const selectedSentiments = fields.getAll('sentiments');
    const terms = Object.fromEntries(Object.keys(dimensions).map(key => [key, splitTerms(fields.get(key))]));
    const rule = {
      id: original?.id || (window.crypto?.randomUUID?.() || 'subscription-' + Date.now() + '-' + Math.random().toString(36).slice(2)),
      name, enabled: original?.enabled ?? true, sample: false,
      dimensions: terms, levels: selectedLevels, sentiments: selectedSentiments, eventCodes
    };
    if (!name) {
      showFormError('请填写订阅名称。');
      form.elements.namedItem('name').focus();
      return;
    }
    if (!eventCodes.length && !selectedLevels.length && !selectedSentiments.length && !Object.values(terms).some(values => values.length)) {
      showFormError('请至少设置一个订阅条件。');
      return;
    }
    if (!isValidSubscription(rule)) {
      showFormError('订阅条件包含无法识别的选项，请检查后重试。');
      return;
    }
    if (!original) Object.assign(view, { tab: 'feed', subscription: rule.id, read: '', search: '', selected: '' });
    saveState(current => ({
      ...current,
      subscriptions: [rule, ...current.subscriptions.filter(item => item.id !== rule.id)]
    }), original ? '订阅规则已更新，信息流已重新匹配。' : '订阅已创建，已按规则匹配示例情报。');
    focusBeforeDialog = null;
    dialog.close();
    render();
    root.querySelector('[data-if-action="' + view.tab + '"]').focus();
  }

  function confirmRemove(rule) {
    focusBeforeDialog = document.activeElement;
    dialog.innerHTML = `<form class="if-remove-form">
      <header class="if-dialog-header"><div><h2 id="ifDialogTitle">删除订阅</h2><p>删除后，信息流将移除“${esc(rule.name)}”的命中记录。其他订阅的命中记录仍可查看。</p></div>
      <button type="button" class="if-close" data-if-close aria-label="关闭">×</button></header>
      <footer class="if-dialog-footer"><button class="if-button" type="button" data-if-close autofocus>取消</button><button class="if-button if-delete" type="submit">删除订阅</button></footer>
    </form>`;
    dialog.querySelector('form').addEventListener('submit', event => {
      event.preventDefault();
      saveState(current => ({
        ...current,
        subscriptions: current.subscriptions.filter(item => item.id !== rule.id)
      }), '订阅已删除。');
      focusBeforeDialog = null;
      dialog.close();
      render();
      root.querySelector('[data-if-action="subscriptions"]').focus();
    });
    dialog.showModal();
  }

  function openEvent(id) {
    if (typeof window.show === 'function') window.show(root.id);
    Object.assign(view, { tab: 'feed', subscription: '', read: '', search: '', selected: id || '' });
    setStatus(id && !hits().some(entry => entry.event.id === id) ? '这条情报未命中当前生效的订阅。' : '');
    render();
  }

  function restoreButton(action, id) {
    const button = [...root.querySelectorAll('[data-if-action="' + action + '"]')].find(item => item.dataset.ifId === id);
    (button || root.querySelector('[data-if-action="' + view.tab + '"]')).focus();
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('[data-if-action]');
    if (!button) return;
    const { ifAction: action, ifId: id } = button.dataset;
    const rule = state.subscriptions.find(item => item.id === id);
    if (action === 'create') return formDialog();
    if (action === 'edit' && rule) return formDialog(rule);
    if (action === 'remove' && rule) return confirmRemove(rule);
    if (action === 'analysis') return toggleAnalysis(button, id);
    setStatus('');
    if (action === 'feed' || action === 'subscriptions') view.tab = action;
    if (action === 'ruleFeed' && rule) Object.assign(view, { tab: 'feed', subscription: rule.id, read: '', search: '', selected: '' });
    if (action === 'clear') Object.assign(view, { subscription: '', read: '', search: '' });
    if (action === 'event') view.selected = id;
    if (action === 'read') {
      const markRead = !state.read.includes(id);
      saveState(current => ({
        ...current,
        read: markRead ? [...new Set([...current.read, id])] : current.read.filter(item => item !== id)
      }), markRead ? '已标为已读。' : '已标为未读。');
    }
    if (action === 'toggle' && rule) {
      saveState(current => ({
        ...current,
        subscriptions: current.subscriptions.map(item => item.id === id ? { ...item, enabled: !rule.enabled } : item)
      }), rule.enabled ? '已暂停该订阅。' : '已恢复该订阅。');
    }
    render();
    if (!button.isConnected) restoreButton(action, id);
  });

  workspace.addEventListener('submit', event => {
    if (!event.target.matches('.if-filters')) return;
    event.preventDefault();
    view.search = event.target.elements.search.value.trim();
    renderFeed(hits());
    workspace.querySelector('input[name="search"]').focus();
  });

  workspace.addEventListener('change', event => {
    if (!event.target.matches('.if-filters select')) return;
    const { name, value } = event.target;
    view[name] = value;
    renderFeed(hits());
    workspace.querySelector('select[name="' + name + '"]').focus();
  });

  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target.closest('[data-if-close]')) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (focusBeforeDialog?.isConnected) focusBeforeDialog.focus();
  });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== legacyStorageKey && event.key !== null) return;
    state = readState() || { subscriptions: starterSubscriptions, read: [] };
    render();
  });

  window.ZhiyanIntelligence = Object.freeze({ openEvent });
  render();
  const params = new URLSearchParams(window.location.search);
  if (params.get('module') === root.id) openEvent(params.get('event'));
})();

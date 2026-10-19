(function () {
  'use strict';
  var topics = ['地缘政治', '贸易冲突', '极端天气', '技术突破', '疫情爆发', '物流中断', '宏观政策'];
  var chain = '新能源汽车动力电池供应链';
  var core = '海州新能源科技（示例）';
  var events = [
    {id:'trade',topic:'贸易冲突',level:3,title:'关键材料出口许可调整，跨境采购交期承压',region:'全球',time:'10-19 09:20',entities:['海州芯源电子（示例）'],role:'核心供应商',move:'出口限制',material:'电池管理芯片',fact:'演示情景：关键芯片出口许可范围调整，原计划交货批次可能需要补充许可材料。',path:['出口许可调整','芯片供应商交期延长','电池管理系统交付承压'],impact:'供应商与关键物料存在采购关联；尚需确认受限清单、实际订单与库存覆盖天数。',actions:['核对料号、原产地及许可适用范围，向供应商确认交期。','评估备选供应商与替代芯片的认证周期。','同步采购、法务与客户，建立关键订单跟踪表。'],source:'模拟监管通报 / 采购关系表',status:'待核验',confidence:'关系已匹配，实际影响待确认'},
    {id:'weather',topic:'极端天气',level:3,title:'强降雨影响生产基地周边运输，关注在途物料',region:'华东',time:'10-19 08:50',entities:['海州材料制造（示例）'],role:'核心供应商',move:'物流与停产',material:'正极材料',fact:'演示情景：生产基地周边出现强降雨预警，部分道路通行能力下降。',path:['极端降雨','陆运通道受限','正极材料到货延迟'],impact:'供应节点与运输路径重合；气象预警并不等同于企业停产，需联系工厂核验。',actions:['核对在途订单与道路通行信息。','准备替代运输线路，确认安全库存。','每日更新供应商运营状态与到货承诺。'],source:'模拟气象预警 / 运输路径',status:'待核验',confidence:'区域暴露匹配，未确认停产'},
    {id:'geo',topic:'地缘政治',level:3,title:'区域冲突升级情景，跨境航线与能源成本波动',region:'全球',time:'10-18 16:40',entities:['海州国际物流（示例）'],role:'物流伙伴',move:'航线调整',material:'跨境运输',fact:'演示情景：区域冲突导致承运商重新评估航线，运费与燃油附加费可能变化。',path:['区域冲突','航线绕行与能源波动','交货成本及周期变化'],impact:'仅对经过相关航道或使用相关能源来源的订单形成暴露。',actions:['梳理相关航道订单与合同交付责任。','获取承运商替代航线方案和报价。','对紧急物料评估分批运输。'],source:'模拟航运公告 / 物流关系',status:'待核验',confidence:'区域情景，订单暴露待补充'},
    {id:'tech',topic:'技术突破',level:2,title:'新型电池工艺进入验证阶段，关注技术替代与客户切换',region:'中国',time:'10-18 14:30',entities:['海州整车制造（示例）'],role:'头部客户',move:'技术与订单',material:'动力电池技术路线',fact:'演示情景：头部客户发布新工艺验证计划，潜在改变电芯性能要求与采购组合。',path:['新工艺验证','客户采购规格变化','产线适配与需求迁移'],impact:'技术突破同时带来合作机会和替代风险；未进入量产不视为现有订单流失。',actions:['确认技术成熟度、验证周期及量产节点。','与客户评估现有产品适配方案。','制定工艺储备与联合研发计划。'],source:'模拟客户公告 / 技术资料',status:'待核验',confidence:'技术情报，商业化影响待验证'},
    {id:'health',topic:'疫情爆发',level:2,title:'公共卫生应急情景，关键供应节点人员与产能需复核',region:'华东',time:'10-18 11:10',entities:['海州材料制造（示例）'],role:'核心供应商',move:'生产运营',material:'正极材料',fact:'演示情景：供应节点所在区域启动公共卫生应急响应，需了解生产与运输连续性安排。',path:['公共卫生事件','人员与物流受限','产能与交付波动'],impact:'区域应急响应不能直接推断供应商停产，应核验工厂实际运营情况。',actions:['联系供应商核验人员、产能与交付情况。','检查跨区域供给与替班机制。','建立客户交付优先级。'],source:'模拟应急通报 / 供应商回访',status:'待核验',confidence:'公共情景，企业运营待确认'},
    {id:'logistics',topic:'物流中断',level:3,title:'承运枢纽中断情景，关键材料运输路线需改配',region:'华东',time:'10-18 10:20',entities:['海州国际物流（示例）'],role:'物流伙伴',move:'物流与停产',material:'电芯及关键原料',fact:'演示情景：主要中转枢纽暂时停止作业，原运输方案无法覆盖部分交货窗口。',path:['枢纽中断','在途批次滞留','生产补料延迟'],impact:'需结合运单和生产排期核验实际影响，尚未测算损失金额。',actions:['确认受影响运单、预计恢复时间及责任方。','调配替代承运商、铁路或其他枢纽。','与生产部门校准物料齐套计划。'],source:'模拟承运商通知 / 运单台账',status:'待核验',confidence:'运输关系匹配，延误时长待确认'},
    {id:'policy',topic:'宏观政策',level:2,title:'行业监管要求调整情景，关注合规投入与订单兑现',region:'中国',time:'10-17 17:00',entities:['海州新能源科技（示例）','海州整车制造（示例）'],role:'核心企业 / 头部客户',move:'重大政策',material:'电池合规与回收',fact:'演示情景：电池行业监管要求调整，可能涉及产品合规、回收管理和验收材料。',path:['监管要求变化','合规与认证成本变化','交付验收及回款影响'],impact:'政策适用对象、生效时间与存量订单过渡安排均需逐项核验。',actions:['核对政策原文与适用主体。','盘点认证、回收与追溯材料缺口。','与客户确认验收及付款安排。'],source:'模拟政策资料 / 企业合规台账',status:'待核验',confidence:'行业适用性待确认'}
  ];
  var references = {
    trade: {org:'美国商务部 BIS',date:'2023-10-17',title:'Commerce Strengthens Restrictions on Advanced Computing Semiconductors, Semiconductor Manufacturing Equipment, and Supercomputing Items to Countries of Concern',url:'https://www.bis.gov/press-release/commerce-strengthens-restrictions-advanced-computing-semiconductors-semiconductor-manufacturing-equipment'},
    weather: {org:'交通运输部',date:'2025-12-31',title:'交通运输部强化低温雨雪冰冻等灾害天气主动防御',url:'https://www.mot.gov.cn/xinwen/jiaotongyaowen/202601/t20260113_4197213.html'},
    geo: {org:'马士基',date:'2025-01-24',title:'Red Sea / Gulf of Aden Update',url:'https://www.maersk.com/news/articles/2025/01/24/red-sea-gulf-of-aden-update'},
    tech: {org:'宁德时代',date:'2025-04-21',title:'钠新电池+双核架构！宁德时代开启多核时代',url:'https://www.catl.com/news/8400.html'},
    health: {org:'生态环境部（国务院文件转载）',date:'2020-02-22 · 历史主题参考',title:'国务院联防联控机制关于印发企事业单位复工复产疫情防控措施指南的通知（历史参考）',url:'https://www.mee.gov.cn/zcwj/gwywj/202002/t20200227_766377.shtml'},
    logistics: {org:'国际货币基金组织 IMF',date:'2024-03-07',title:'Red Sea Attacks Disrupt Global Trade',url:'https://www.imf.org/en/Blogs/Articles/2024/03/07/Red-Sea-Attacks-Disrupt-Global-Trade'},
    policy: {org:'工业和信息化部',date:'2026-01-16',title:'新能源汽车废旧动力电池回收和综合利用管理暂行办法',url:'https://www.miit.gov.cn/gyhxxhb/jgsj/cyzcyfgs/bmgz/jdcjxl/art/2026/art_392462fdc40c415ea4a4129cac3028c2.html'}
  };
  var initial = [
    {id:'s-trade',name:'关键材料与跨境风险',type:'topic',topics:['贸易冲突','地缘政治','宏观政策'],target:'',role:'',moves:[],region:'全球',keyword:'',level:2,enabled:true},
    {id:'s-weather',name:'华东生产与运输连续性',type:'topic',topics:['极端天气','疫情爆发','物流中断'],target:'',role:'',moves:[],region:'华东',keyword:'',level:2,enabled:true},
    {id:'s-supplier',name:'核心供应商重大动作',type:'company',topics:[],target:'海州芯源电子（示例）',role:'核心供应商',moves:['出口限制','生产运营','融资并购','司法与信用'],region:'全球',keyword:'',level:2,enabled:true},
    {id:'s-customer',name:'头部客户技术与订单',type:'company',topics:[],target:'海州整车制造（示例）',role:'头部客户',moves:['技术与订单','重大政策','融资并购'],region:'中国',keyword:'',level:1,enabled:true}
  ];
  var context = {
    trade: {reason:'许可调整首先影响特定料号及原产地，而非所有芯片。若该料号不可替换，且现有库存不足以覆盖许可办理和验证周期，采购延迟才可能传导至电池管理系统排产与客户交期。',verify:'受控清单及生效时间、料号与原产地、供应商交期确认、订单和库存覆盖天数',owners:['采购与贸易合规','采购与研发','销售、法务及供应链负责人']},
    weather: {reason:'天气预警属于区域信号。只有工厂、仓库或在途路线与受影响区域重叠时，才形成直接暴露；实际交付影响还取决于道路可用性、备选运力与安全库存。应先核验运营状态，再判断是否需要调整排产。',verify:'气象和道路原文、供应商运营确认、在途运单、库存与备选线路',owners:['物流与采购','物流与生产计划','供应链负责人']},
    geo: {reason:'冲突可能通过航线绕行、保险和能源费用传导，但业务影响取决于企业实际使用的航道、承运商与合同责任。对于无相关路线暴露的订单，不应直接套用同等风险判断；应优先识别紧急物料及交期敏感订单。',verify:'区域通告、航线公告、相关运单与交货条款、承运商报价',owners:['国际业务与物流','物流与采购','生产计划与客户负责人']},
    tech: {reason:'技术验证与规模量产存在阶段差异。新工艺可能改变性能、认证与采购结构，也可能形成联合研发机会。应将技术成熟度、客户切换计划与现有订单约定分开核验，避免把技术发布直接等同于订单流失。',verify:'技术资料及验证结果、客户规格、量产时间表、现有订单与认证计划',owners:['研发与产品','研发与客户经理','技术与业务负责人']},
    health: {reason:'区域应急响应可能影响人员出勤、跨区运输和产能利用，但不能仅凭区域信号判断企业停产。应结合工厂实际运营、替班安排、替代产地与库存缓冲，识别可能无法兑现的交付窗口。',verify:'应急通告、工厂回访记录、产能与排班、交付承诺和库存台账',owners:['采购与供应商管理','生产与人力资源','销售与供应链负责人']},
    logistics: {reason:'枢纽停运首先作用于经过该节点的运单。只有滞留时长超过物料缓冲或交付窗口时，才会进一步影响生产与履约。需同时比较改配线路、替代运输方式和客户交付优先级，不能只按事件等级推算损失。',verify:'承运商通知、受影响运单、预计恢复时间、替代线路与齐套计划',owners:['物流与承运商','物流与采购','生产计划与客户负责人']},
    policy: {reason:'监管要求变化可能作用于认证、追溯、验收与回款，具体影响取决于适用主体、生效时间和存量订单过渡安排。应先形成适用性清单，再核对材料缺口与合同义务；政策发布不直接等于企业不合规。',verify:'政策原文及配套细则、主体与产品清单、认证材料、验收与付款条款',owners:['合规与法务','质量与业务部门','客户与财务负责人']}
  };
  var storeKey = 'zhiyan-supply-risk-v1';
  var retained = Object.create(null);
  var state = {subscriptions:initial, handled:[]};
  function validSubscription(s) {
    return s && typeof s.id === 'string' && typeof s.name === 'string' && ['topic','company'].includes(s.type) && Array.isArray(s.topics) && s.topics.every(function(t){return typeof t === 'string'}) && Array.isArray(s.moves) && s.moves.every(function(t){return typeof t === 'string'}) && typeof s.target === 'string' && typeof s.region === 'string' && (!s.keyword || typeof s.keyword === 'string') && [1,2,3].includes(s.level);
  }
  try {
    var saved = JSON.parse(localStorage.getItem(storeKey));
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      retained = saved;
      if (Array.isArray(saved.subscriptions)) state.subscriptions = saved.subscriptions.filter(validSubscription).map(function(subscription){
        return Object.assign({},subscription,{topics:subscription.topics.map(function(topic){return topic === '疫情' ? '疫情爆发' : topic})});
      });
      if (Array.isArray(saved.handled)) state.handled = saved.handled.filter(function(id){return typeof id === 'string'});
    }
  } catch (error) {}
  var view = 'events', selected = null, filterTopic = '', filterLevel = '', query = '', onlyMine = false, filterSubscriptionId = null, editing = null, modalFocus = null;
  var analysis = {id:null, status:'idle', texts:[], index:0, offset:0, timer:null, token:0};
  var stageNames = ['深度推理分析','操作建议'];
  var root = document.createElement('section');
  root.className = 'content view'; root.id = 'supplyRisk';
  document.querySelector('.main').appendChild(root);
  var modal = document.createElement('div'); modal.className = 'sr-modal'; modal.hidden = true; document.body.appendChild(modal);

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]});
  }
  function save() {
    try {
      var payload = Object.assign(Object.create(null), retained, {subscriptions:state.subscriptions, handled:state.handled});
      localStorage.setItem(storeKey,JSON.stringify(payload)); return true;
    } catch (error) { notify('浏览器存储不可用，本次操作仅在当前页面保留。'); return false; }
  }
  function notify(text) {
    var old = root.querySelector('.sr-feedback'); if (old) old.remove();
    var element = document.createElement('div'); element.className = 'sr-feedback'; element.setAttribute('role','status'); element.textContent = text; root.appendChild(element);
    setTimeout(function(){element.remove()},3600);
  }
  function levelText(n) { return ['','低','中','高'][n] + '风险'; }
  function badge(event) { return '<span class="sr-badge sr-' + ['','low','medium','high'][event.level] + '">' + levelText(event.level) + '</span>'; }
  function matches(event,subscription,ignoreEnabled) {
    return (ignoreEnabled || subscription.enabled) && event.level >= subscription.level && (subscription.region === '全球' || event.region === subscription.region || subscription.region === '中国' && event.region === '华东') && (!subscription.keyword || [chain,event.title,event.material].join(' ').toLowerCase().includes(subscription.keyword.toLowerCase())) && (subscription.type === 'topic' ? subscription.topics.includes(event.topic) : event.entities.includes(subscription.target) && subscription.moves.includes(event.move));
  }
  function matched(event) { return state.subscriptions.filter(function(s){return matches(event,s)}); }
  function feedSubscription() { return state.subscriptions.find(function(s){return s.id === filterSubscriptionId}); }
  function subscriptionSummary(subscription) {
    return (subscription.type === 'topic' ? '事件类型：'+subscription.topics.join(' / ') : '企业：'+subscription.target+' · 重大动作：'+subscription.moves.join(' / ')) + ' · '+subscription.region+' · '+levelText(subscription.level)+'及以上' + (subscription.keyword ? ' · 关键词：'+subscription.keyword : '') + (!subscription.enabled ? ' · 订阅已暂停，仍可按规则查看信息流' : '');
  }
  function visibleEvents() {
    var subscription = feedSubscription();
    return events.filter(function(event){return (!subscription || matches(event,subscription,true)) && (!filterTopic || event.topic === filterTopic) && (!filterLevel || event.level === Number(filterLevel)) && (!onlyMine || matched(event).length) && (!query || [event.title,event.topic,event.material,event.entities.join(' ')].join(' ').toLowerCase().includes(query.toLowerCase()))});
  }
  function header() {
    var active = state.subscriptions.filter(function(s){return s.enabled}).length;
    var high = events.filter(function(event){return event.level === 3 && matched(event).length && !state.handled.includes(event.id)}).length;
    return '<div class="sr-head"><div><label class="sr-eyebrow">SUPPLY CHAIN RISK INTELLIGENCE</label><h1>供应链风控</h1><p>聚焦外部事件与企业重大动作，动态研判供应链影响。</p></div><button class="sr-btn sr-primary" data-action="new">＋ 新建订阅</button></div>' +
      '<div class="sr-notice"><b>交互演示 · 示例数据</b>以下事件与企业关系为模拟情景，“查看原文”指向主题参考资料。订阅规则保存在当前浏览器；真实事件采集与在线 AI 分析待接入。</div>' +
      '<div class="sr-metrics">' + [[active,'生效订阅','事件维度与企业维度','◎'],[high,'待关注高风险','命中订阅的模拟事件','!'],[events.length,'风险情景','覆盖七类外部冲击','⌁']].map(function(m){return '<div class="sr-metric"><div><label>'+m[1]+'</label><strong>'+m[0]+'</strong><small>'+m[2]+'</small></div><i>'+m[3]+'</i></div>'}).join('') + '</div>' +
      '<div class="sr-tabs" role="tablist" aria-label="风控工作台">' + [['events','风险情报'],['subscriptions','我的订阅']].map(function(t){return '<button role="tab" aria-selected="'+(view===t[0])+'" class="'+(view===t[0]?'active':'')+'" data-tab="'+t[0]+'">'+t[1]+'</button>'}).join('') + '</div>';
  }
  function cancelAnalysis() { clearTimeout(analysis.timer); analysis.timer = null; analysis.token++; }
  function showSubscriptionFeed(id) {
    cancelAnalysis(); selected = null; analysis.id = null; analysis.status = 'idle'; analysis.texts = []; analysis.index = 0; analysis.offset = 0;
    filterSubscriptionId = id || null; filterTopic = ''; filterLevel = ''; query = ''; onlyMine = false; view = 'events'; render();
  }
  function render() {
    if (filterSubscriptionId && !feedSubscription()) filterSubscriptionId = null;
    root.innerHTML = header() + (view === 'events' ? eventPage() : subscriptionPage());
    if (view === 'events' && selected === analysis.id) paintAnalysis();
  }
  function eventPage() {
    var list = visibleEvents(), subscription = feedSubscription();
    if (selected && !list.some(function(event){return event.id === selected})) { cancelAnalysis(); selected = null; analysis.status = 'idle'; }
    var event = events.find(function(item){return item.id === selected});
    return (subscription ? '<div class="sr-toolbar" aria-label="当前订阅信息流"><span class="sr-badge">订阅信息流</span><b>'+esc(subscription.name)+'</b><button class="sr-btn" data-action="allEvents">查看全部事件</button><span class="sr-muted">'+esc(subscriptionSummary(subscription))+'</span></div>' : '') +
      '<div class="sr-toolbar"><input id="srSearch" aria-label="搜索事件、企业或物料" placeholder="搜索事件、企业或关键物料" value="'+esc(query)+'"><select id="srTopic" aria-label="事件维度"><option value="">全部事件维度</option>'+topics.map(function(topic){return '<option'+(filterTopic===topic?' selected':'')+'>'+topic+'</option>'}).join('')+'</select><select id="srLevel" aria-label="风险等级"><option value="">全部风险等级</option>'+[3,2,1].map(function(n){return '<option value="'+n+'"'+(filterLevel===String(n)?' selected':'')+'>'+levelText(n)+'</option>'}).join('')+'</select><label class="sr-muted"><input id="srOnlyMine" type="checkbox"'+(onlyMine?' checked':'')+'> 只看命中订阅</label></div>' +
      '<div class="sr-body"><div class="sr-card sr-feed"><div class="sr-list-head"><h2>风险情报流</h2><span>'+list.length+' 条模拟事件</span></div>' +
      (list.length ? list.map(function(item){return '<button class="sr-event '+(item.id===selected?'active':'')+'" data-event="'+item.id+'" aria-pressed="'+(item.id===selected)+'"><div class="sr-event-top"><span>'+badge(item)+' <span class="sr-badge">'+item.topic+'</span></span><small>场景 '+item.time+'</small></div><b>'+item.title+'</b><p>'+item.material+' · '+item.entities.join('、')+'</p><footer><span>'+item.region+' · '+item.source.split(' / ')[0]+'</span><span>'+(state.handled.includes(item.id)?'已确认关注':matched(item).length+' 项订阅命中')+' →</span></footer></button>'}).join('') : '<div class="sr-empty">'+(subscription ? '当前订阅暂无匹配事件<br>可调整筛选条件，或点击“查看全部事件”。' : '暂无符合条件的情景<br>请调整事件类型、等级或搜索条件。')+'</div>') + '</div>' +
      (event ? detail(event) : '<article class="sr-card sr-analysis-empty"><i>✦</i><h2>选择一个事件，开始 AI 动态分析</h2><p>从左侧情报流选择风险事件，分析助手将依次输出：</p><div>深度推理分析　→　操作建议</div><p class="sr-muted">点击事件标题下的“查看原文”，新开标签页阅读主题参考资料。</p></article>') + '</div>';
  }
  function detail(event) {
    var reference = references[event.id];
    return '<article class="sr-card sr-analysis-card" data-analysis-event="'+event.id+'"><div class="sr-detail-head">'+badge(event)+' <span class="sr-badge">'+event.topic+'</span><h2>'+event.title+'</h2><p>'+event.region+' · 场景时间 '+event.time+'</p><div class="sr-source-meta"><span>参考来源：'+esc(reference.org)+'</span><span>'+esc(reference.date)+'</span><a class="sr-original" href="'+esc(reference.url)+'" target="_blank" rel="noopener noreferrer" title="'+esc(reference.title)+'" aria-label="查看主题参考原文：'+esc(reference.title)+'">↗ 查看原文</a></div><p class="sr-event-summary">'+event.fact+'</p><div>'+event.entities.map(function(name){return '<span class="sr-chip">'+name+'</span>'}).join('')+'</div></div>' +
      '<div class="sr-agent"><header class="sr-agent-head"><div class="sr-agent-identity"><i>✦</i><div><b>智研供应链分析助手</b><small>围绕企业暴露、业务传导与应对动作进行研判 · 演示</small></div></div><div class="sr-agent-tools"><span id="srAnalysisStatus" role="status" aria-live="polite"></span><button class="sr-link" data-action="pause" id="srPause">暂停输出</button><button class="sr-link" data-action="resume" id="srResume" hidden>继续输出</button><button class="sr-link" data-action="restart">重新分析</button></div></header><div id="srAnalysisBody" aria-busy="true">' +
      stageNames.map(function(name,index){return '<section class="sr-answer-section waiting" data-stage="'+index+'"><h3><i>0'+(index+1)+'</i>'+name+'</h3><div class="sr-answer-content"></div></section>'}).join('') + '</div></div>' +
      '<footer class="sr-analysis-footer"><span class="sr-muted">适用链条：'+chain+'<br>命中订阅：'+(matched(event).map(function(s){return esc(s.name)}).join('、')||'暂无匹配订阅')+'</span><div class="sr-actions"><button class="sr-btn" data-action="handle" data-id="'+event.id+'">'+(state.handled.includes(event.id)?'取消关注确认':'确认关注')+'</button><button class="sr-btn sr-primary" data-action="evaluate">评估这条供应链 ↗</button></div></footer></article>';
  }
  function textsFor(event) {
    var detailContext = context[event.id];
    return [
      '事件判断：'+event.fact.replace(/^演示情景：/,'')+'\n\n业务传导：'+event.path.join(' → ')+'。'+detailContext.reason+'\n\n企业暴露：'+event.entities.join('、')+'作为'+event.role+'，关联'+event.material+'。'+event.impact+'\n\n结论边界：当前为'+levelText(event.level)+'情景。'+event.confidence+'；在取得真实公告及企业经营证据前，不计算损失金额、停产天数或信用结论。',
      event.actions.map(function(action,index){return (index+1)+'．'+['优先核验','准备备选','协同闭环'][index]+'｜'+detailContext.owners[index]+'\n'+action}).join('\n\n')+'\n\n跟踪要求：为上述行动明确责任人、核验材料与复核时间，根据新证据更新风险判断。'
    ];
  }
  function startAnalysis(event) {
    cancelAnalysis(); selected = event.id;
    analysis.id = event.id; analysis.status = 'running'; analysis.texts = textsFor(event); analysis.index = 0; analysis.offset = 0;
    render(); scheduleStep();
  }
  function scheduleStep() {
    var token = analysis.token;
    analysis.timer = setTimeout(function(){
      if (token !== analysis.token || analysis.status !== 'running' || selected !== analysis.id || view !== 'events') return;
      analysis.offset = Math.min(analysis.offset + 3, analysis.texts[analysis.index].length);
      if (analysis.offset >= analysis.texts[analysis.index].length) {
        if (analysis.index === stageNames.length - 1) analysis.status = 'complete';
        else { analysis.index++; analysis.offset = 0; }
      }
      paintAnalysis();
      if (analysis.status === 'running') scheduleStep(); else analysis.timer = null;
    },65);
  }
  function paintAnalysis() {
    var body = root.querySelector('#srAnalysisBody'); if (!body || !analysis.texts.length || selected !== analysis.id) return;
    var complete = analysis.status === 'complete';
    body.setAttribute('aria-busy',String(analysis.status === 'running'));
    body.dataset.analysisState = analysis.status;
    root.querySelector('#srAnalysisStatus').textContent = complete ? '分析完成' : analysis.status === 'paused' ? '已暂停' : '动态分析中…';
    root.querySelector('#srPause').hidden = analysis.status !== 'running'; root.querySelector('#srResume').hidden = analysis.status !== 'paused';
    body.querySelectorAll('[data-stage]').forEach(function(section,index){
      var done = complete || index < analysis.index;
      var active = !complete && index === analysis.index;
      section.className = 'sr-answer-section ' + (done ? 'done' : active ? 'typing' : 'waiting');
      var content = section.querySelector('.sr-answer-content');
      if (index > analysis.index) { content.textContent = '等待输出'; return; }
      var text = done ? analysis.texts[index] : analysis.texts[index].slice(0,analysis.offset);
      content.innerHTML = '<p>'+esc(text)+(active && analysis.status === 'running' ? '<span class="sr-cursor" aria-hidden="true"></span>' : '')+'</p>';
    });
  }
  function pauseAnalysis() { if (analysis.status === 'running') { cancelAnalysis(); analysis.status = 'paused'; paintAnalysis(); } }
  function resumeAnalysis() { if (analysis.status === 'paused') { analysis.status = 'running'; paintAnalysis(); scheduleStep(); } }

  function subscriptionPage() {
    return '<div class="sr-toolbar"><h2>按事件或企业持续关注</h2><span class="sr-muted">企业名称精确匹配；自定义企业暂无示例事件时不生成关联情报。</span></div>' +
      (state.subscriptions.length ? '<div class="sr-sub-grid">' + state.subscriptions.map(function(s){return '<article class="sr-card sr-sub"><header><div><span class="sr-badge">'+(s.type==='topic'?'事件维度订阅':'企业维度订阅')+'</span><h3>'+esc(s.name)+'</h3></div><span class="sr-badge '+(s.enabled?'sr-low':'')+'">'+(s.enabled?'生效中':'已暂停')+'</span></header><p>'+(s.type==='topic'?s.topics.map(esc).join(' / '):esc(s.role)+'：'+esc(s.target))+'</p>'+(s.type==='company'?'<p>重大动作：'+s.moves.map(esc).join('、')+'</p>':'')+'<p>关注区域：'+esc(s.region)+' · 风险门槛：'+levelText(s.level)+'及以上</p>'+(s.keyword?'<p>链条 / 物料关键词：'+esc(s.keyword)+'</p>':'')+'<footer><button class="sr-link" data-action="subscriptionFeed" data-id="'+esc(s.id)+'">查看信息流</button><button class="sr-link" data-action="edit" data-id="'+esc(s.id)+'">编辑规则</button><button class="sr-link" data-action="toggle" data-id="'+esc(s.id)+'">'+(s.enabled?'暂停':'恢复')+'</button><button class="sr-link danger" data-action="delete" data-id="'+esc(s.id)+'">删除订阅</button></footer></article>'}).join('')+'</div>' : '<div class="sr-empty">暂无订阅，点击“新建订阅”开始关注。</div>');
  }
  function openModal(html) {
    modalFocus = document.activeElement;
    modal.innerHTML = '<div class="sr-dialog" role="dialog" aria-modal="true" aria-labelledby="srModalTitle">'+html+'</div>';
    modal.hidden = false; modal.querySelector('input,select,button').focus();
  }
  function closeModal() { modal.hidden = true; modal.innerHTML = ''; if (modalFocus && modalFocus.isConnected) modalFocus.focus(); }
  function form(subscription) {
    pauseAnalysis();
    editing = subscription ? subscription.id : null;
    var data = subscription || {name:'',type:'topic',topics:[],target:'',role:'核心供应商',moves:[],region:'全球',keyword:'',level:2};
    openModal('<header><div><h2 id="srModalTitle">'+(subscription?'编辑订阅':'新建订阅')+'</h2><p>选择事件类型，或关注核心供应商、头部客户的重大动作。</p></div><button class="sr-close" data-close aria-label="关闭">×</button></header><form class="sr-form" id="srForm"><div class="sr-fields"><label class="sr-wide"><span>订阅名称 *</span><input id="srName" maxlength="60" required value="'+esc(data.name)+'" placeholder="例如：关键供应商经营与交付风险"></label><label><span>订阅维度</span><select id="srType"><option value="topic"'+(data.type==='topic'?' selected':'')+'>事件维度</option><option value="company"'+(data.type==='company'?' selected':'')+'>企业维度</option></select></label><label><span>关注区域</span><select id="srRegion">'+['全球','中国','华东'].map(function(region){return '<option'+(data.region===region?' selected':'')+'>'+region+'</option>'}).join('')+'</select></label><div class="sr-wide" id="srTopicFields"><p>事件维度 *（可多选）</p><div class="sr-checks">'+topics.map(function(topic){return '<label><input type="checkbox" name="srTopics" value="'+topic+'"'+(data.topics.includes(topic)?' checked':'')+'>'+topic+'</label>'}).join('')+'</div></div><label class="sr-wide" id="srTargetFields"><span>企业全称 *（精确匹配）</span><input id="srTarget" maxlength="100" list="srCompanies" value="'+esc(data.target)+'" placeholder="输入核心供应商或头部客户全称"><datalist id="srCompanies">'+['海州芯源电子（示例）','海州材料制造（示例）','海州整车制造（示例）','海州国际物流（示例）'].map(function(name){return '<option value="'+name+'">'}).join('')+'</datalist></label><label id="srRoleFields"><span>企业角色</span><select id="srRole">'+['核心供应商','头部客户','物流伙伴','其他关键伙伴'].map(function(role){return '<option'+(data.role===role?' selected':'')+'>'+role+'</option>'}).join('')+'</select></label><div class="sr-wide" id="srMoveFields"><p>重大动作 *（可多选）</p><div class="sr-checks">'+['生产运营','融资并购','司法与信用','技术与订单','物流与停产','出口限制','重大政策','航线调整'].map(function(move){return '<label><input type="checkbox" name="srMoves" value="'+move+'"'+(data.moves.includes(move)?' checked':'')+'>'+move+'</label>'}).join('')+'</div></div><label class="sr-wide"><span>链条 / 关键物料关键词（可选）</span><input id="srKeyword" maxlength="60" value="'+esc(data.keyword)+'" placeholder="例如：芯片；留空关注该范围全部事件"></label><label class="sr-wide"><span>风险门槛</span><select id="srThreshold">'+[3,2,1].map(function(level){return '<option value="'+level+'"'+(data.level===level?' selected':'')+'>'+levelText(level)+'及以上</option>'}).join('')+'</select></label></div><div id="srFormError" class="sr-error" role="alert"></div><div class="sr-form-footer"><button class="sr-btn" type="button" data-close>取消</button><button class="sr-btn sr-primary" type="submit">保存订阅</button></div></form>');
    updateFormType(); modal.querySelector('#srType').onchange = updateFormType; modal.querySelector('#srForm').onsubmit = saveForm;
  }
  function updateFormType() {
    var company = modal.querySelector('#srType').value === 'company';
    ['srTargetFields','srRoleFields','srMoveFields'].forEach(function(id){modal.querySelector('#'+id).hidden = !company});
    modal.querySelector('#srTopicFields').hidden = company; modal.querySelector('#srTarget').required = company;
  }
  function saveForm(event) {
    event.preventDefault();
    var get = function(id){return modal.querySelector('#'+id).value.trim()};
    var selectedChecks = function(name){return Array.from(modal.querySelectorAll('input[name="'+name+'"]:checked')).map(function(input){return input.value})};
    var data = {id:editing||'s-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),name:get('srName'),type:get('srType'),topics:selectedChecks('srTopics'),target:get('srTarget'),role:get('srRole'),moves:selectedChecks('srMoves'),region:get('srRegion'),keyword:get('srKeyword'),level:Number(get('srThreshold')),enabled:true};
    if (!data.name || data.type === 'topic' && !data.topics.length || data.type === 'company' && (!data.target || !data.moves.length)) { modal.querySelector('#srFormError').textContent = '请填写订阅名称，并选择至少一种事件类型；企业订阅需填写企业全称并选择重大动作。'; return; }
    var index = state.subscriptions.findIndex(function(item){return item.id === editing});
    if (index < 0) state.subscriptions.push(data); else { data.enabled = state.subscriptions[index].enabled; state.subscriptions[index] = Object.assign({},state.subscriptions[index],data); }
    save(); closeModal(); pauseAnalysis(); view = 'subscriptions'; render(); notify('订阅规则已保存至当前浏览器。');
  }
  root.addEventListener('click',function(event){
    var button = event.target.closest('button'); if (!button) return;
    if (button.dataset.tab) { if (button.dataset.tab !== 'events') pauseAnalysis(); view = button.dataset.tab; render(); return; }
    if (button.dataset.event) { startAnalysis(events.find(function(item){return item.id === button.dataset.event})); return; }
    var id = button.dataset.id;
    var subscription = state.subscriptions.find(function(item){return item.id === id});
    switch (button.dataset.action) {
      case 'subscriptionFeed': if (subscription) showSubscriptionFeed(subscription.id); break;
      case 'allEvents': showSubscriptionFeed(null); break;
      case 'new': form(); break;
      case 'edit': form(subscription); break;
      case 'toggle': subscription.enabled = !subscription.enabled; save(); render(); break;
      case 'delete': openModal('<header><div><h2 id="srModalTitle">删除订阅</h2><p>'+esc(subscription.name)+'</p></div><button class="sr-close" data-close aria-label="关闭">×</button></header><div class="sr-form"><p>删除后，该规则将不再用于情报筛选与关联。</p><div class="sr-form-footer"><button class="sr-btn" data-close>取消</button><button class="sr-btn sr-primary" data-action="confirmdelete" data-id="'+esc(id)+'">删除这条订阅</button></div></div>'); break;
      case 'pause': pauseAnalysis(); break;
      case 'resume': resumeAnalysis(); break;
      case 'restart': if (selected) startAnalysis(events.find(function(item){return item.id === selected})); break;
      case 'handle': if (state.handled.includes(id)) state.handled = state.handled.filter(function(value){return value !== id}); else state.handled.push(id); save(); render(); break;
      case 'evaluate': pauseAnalysis(); if (window.supplyEvaluationLoad) window.supplyEvaluationLoad({chain:chain,enterprise:core,region:'华东'}); else notify('评价模块加载中，请稍后重试。'); break;
    }
  });
  root.addEventListener('change',function(event){
    switch (event.target.id) {
      case 'srTopic': filterTopic = event.target.value; render(); break;
      case 'srLevel': filterLevel = event.target.value; render(); break;
      case 'srOnlyMine': onlyMine = event.target.checked; render(); break;
    }
  });
  root.addEventListener('input',function(event){
    if (event.target.id === 'srSearch') { query = event.target.value; var position = event.target.selectionStart; render(); var input = root.querySelector('#srSearch'); input.focus(); input.setSelectionRange(position,position); }
  });
  modal.addEventListener('click',function(event){
    if (event.target === modal || event.target.closest('[data-close]')) { closeModal(); return; }
    var button = event.target.closest('[data-action="confirmdelete"]');
    if (button) { state.subscriptions = state.subscriptions.filter(function(item){return item.id !== button.dataset.id}); save(); closeModal(); render(); notify('订阅已删除。'); }
  });
  document.addEventListener('keydown',function(event){
    if (modal.hidden) return;
    if (event.key === 'Escape') closeModal();
    if (event.key === 'Tab') {
      var nodes = Array.from(modal.querySelectorAll('button,input,select,textarea,a[href]')).filter(function(node){return !node.disabled && node.getClientRects().length});
      var first = nodes[0], last = nodes[nodes.length-1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  new MutationObserver(function(){if (!root.classList.contains('show')) pauseAnalysis()}).observe(root,{attributes:true,attributeFilter:['class']});
  render();
})();

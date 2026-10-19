(function () {
  'use strict';
  var host = document.querySelector('.main');
  if (!host || document.getElementById('supplyEvaluation')) return;
  var STORAGE = 'zhiyan.supplyEvaluation.reports.v1';
  var dimensions = [
    { name: '承受能力', sub: '结构稳 · 抗冲击', color: '#2375e7', groups: [
      ['供应链结构', [
        ['供应商集中度', '采购物料或服务集中于少数供应商的程度', '前五大供应商采购占比 52%', 70],
        ['客户集中度', '销售收入或业务量依赖于少数客户的程度', '前五大客户收入占比 61%', 64],
        ['供应商本土化程度', '采购物料或服务来源于本土供应商的程度', '本土采购金额占比 78%', 85],
        ['供应商可靠度', '供应商履行承诺并提供符合要求的产品或服务的情况', '近12月按期合格交付率 96%', 86]
      ]],
      ['供应链伙伴关系', [
        ['供应商伙伴关系', '与供应商建立长期且互利合作关系的情况', '关键供应商长期协议覆盖率 80%', 82],
        ['渠道商伙伴关系', '与渠道商建立长期且互利合作关系的情况', '主要渠道具备协同保障约定', 78],
        ['信息共享程度', '与供应链合作伙伴间关键信息的共享程度', '关键伙伴订单与库存共享覆盖率 65%', 72],
        ['运营决策协同程度', '与供应链合作伙伴间运营决策的协同程度', '月度产销协同，二级供应商覆盖不足', 71]
      ]]
    ] },
    { name: '适应能力', sub: '应急快 · 受损小', color: '#10a7a2', groups: [
      ['采购适应能力', [
        ['供应商候补能力', '迅速切换至候补供应商以保证短期稳定供应的能力', '主要辅材已建立候补清单', 79],
        ['采购策略灵活性', '根据业务需求和环境变化调整采购策略的能力', '滚动采购与长协组合', 82],
        ['价格敏感程度', '对于采购成本受市场价格波动影响的容忍能力', '原料价格波动压力测试尚未闭环', 61]
      ]],
      ['生产适应能力', [
        ['产能冗余管理水平', '超出实际需求或合理程度的额外生产能力', '可调配产能约15%（场景假设）', 77],
        ['技术路径可选择性', '技术与工艺路径的储备与备份情况', '两条工艺路径，替代验证需8周', 72],
        ['生产基地分散度', '生产基地地理分布的多样化程度', '两地工厂，仍有同区天气暴露', 67]
      ]],
      ['运输适应能力', [
        ['第三方物流服务商依赖度', '对第三方物流服务商的依赖程度', '主承运商份额约60%', 63],
        ['运输可选择性', '可供选择的运输方式多样化程度', '公铁联运备选方案已设计', 80],
        ['运力补偿能力', '运输资源不足时获取额外运力资源的能力', '旺季运力协议覆盖关键线路', 76]
      ]],
      ['库存适应能力', [
        ['安全库存管理水平', '应对供需不确定性设置的缓冲库存水平', '关键物料安全库存按风险分层', 84],
        ['战略储备管理水平', '保障供应链系统稳定运行的冗余库存水平', '部分进口材料储备策略待完善', 65],
        ['库容补偿能力', '仓储不足时获取替代仓储资源的能力', '外部备选仓已签框架协议', 78]
      ]],
      ['销售适应能力', [
        ['销售渠道依赖度', '销售活动对少数第三方渠道依赖的程度', '整车客户直销占比较高', 68],
        ['销售渠道多样性', '采用多种销售渠道的均衡程度', '动力电池与储能市场并行布局', 81]
      ]]
    ] },
    { name: '恢复能力', sub: '反应快 · 恢复快', color: '#7b67d9', groups: [
      ['替代能力', [
        ['供应商可替代性', '长期运营中选择和使用多个供应商的能力，区别于短期候补', '两类关键材料仍存在单一技术来源', 62],
        ['销售渠道可替代性', '在不同销售渠道之间切换或替代的能力', '储能渠道可承接部分订单', 74]
      ]],
      ['重建与重构能力', [
        ['重建与重构资源储备', '为恢复原状态或重构至更优状态准备的各类资源', '应急资金与设备备件清单待联审', 68],
        ['重建与重构技术储备', '为重建或重构积累和准备的相关技术和能力', '具备跨工厂工艺复制经验', 77]
      ]]
    ] },
    { name: '支撑体系', sub: '持续提升 · 闭环治理', color: '#e99b32', groups: [
      ['监测预警', [
        ['冲击预警管理机制', '为识别潜在冲击或干扰而建立的专门组织机制', '采购、物流与合规共同负责', 82],
        ['冲击预警运行机制', '为预警实施建立的一系列流程和制度安排', '预警处置时限和升级机制未全覆盖', 70]
      ]],
      ['应急响应', [
        ['应急管理组织机制', '为应对潜在冲击建立的专门组织机制', '设跨部门应急管理小组', 86],
        ['应急调度决策支持', '支持和辅助应急调度决策的系统与机制', '季度演练，供应商联演待补齐', 73]
      ]],
      ['网络与数据安全', [
        ['网络攻击防范机制', '对网络攻击风险的识别、防护与响应能力', '重点系统分级防护与应急预案', 84],
        ['系统容灾备份机制', '在软硬件故障或灾难灾害后恢复业务运行的能力', '双地备份，恢复演练有记录', 88],
        ['供应商链接安全管控机制', '对上下游之间信息安全性的系统管控能力', '供应商接口安全审查覆盖不足', 66]
      ]],
      ['合规管理', [
        ['合规性审查组织机制', '建立合规审查组织体系并明确职责分工的情况', '法务与业务共同负责贸易合规', 84],
        ['合规性审查执行机制', '开展合规性审查并落实合规要求的情况', '跨境物料清单定期复审', 81],
        ['诉讼管理机制', '对供应链相关法律纠纷的预防、应对与处理能力', '合同争议台账与分级处置', 79]
      ]]
    ] }
  ];
  var sample = {
    chain: '新能源汽车动力电池供应链', enterprise: '海州新能源科技（示例）', region: '华东', purpose: '金融机构尽调参考',
    materials: '【虚构示例资料】关键物料及伙伴台账；近12月采购与交付汇总；安全库存策略；供应链应急演练记录；容灾与合规管理制度。所有数值仅用于展示分析交互。',
    publicData: true, authorizedData: true
  };
  var indicators = [];
  dimensions.forEach(function (d, di) { d.groups.forEach(function (g) { g[1].forEach(function (x) {
    indicators.push({ id: 'I' + String(indicators.length + 1).padStart(2, '0'), dimension: di, group: g[0], name: x[0], description: x[1], value: x[2], score: x[3] });
  }); }); });
  var state = { sampleLoaded: false, report: null, tab: 0, job: 0, timer: null, lastFocus: null };
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function stamp(date) { return new Date(date).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }); }
  function average(list) { return Math.round(list.reduce(function (sum, i) { return sum + i.score; }, 0) / list.length * 10) / 10; }
  function scores() { return dimensions.map(function (d, i) { return average(indicators.filter(function (x) { return x.dimension === i; })); }); }
  function allReports() {
    try { var a = JSON.parse(localStorage.getItem(STORAGE) || '[]'); return Array.isArray(a) ? a.filter(validReport).slice(0, 20) : []; } catch (e) { return []; }
  }
  function validReport(r) { return r && r.version === 1 && typeof r.id === 'string' && typeof r.date === 'string' && Number.isFinite(Date.parse(r.date)) && r.input && typeof r.input.chain === 'string' && typeof r.input.enterprise === 'string' && typeof r.input.region === 'string' && typeof r.input.materials === 'string' && typeof r.input.purpose === 'string'; }
  function saveReport(r) {
    try { var previous = allReports().filter(function (x) { return x.id !== r.id; }); previous.unshift(r); localStorage.setItem(STORAGE, JSON.stringify(previous.slice(0, 20))); return true; }
    catch (e) { return false; }
  }
  var section = document.createElement('section');
  section.className = 'content view sc-eval'; section.id = 'supplyEvaluation';
  section.innerHTML = '<div class="sce-head"><div><span class="sce-eyebrow">SUPPLY CHAIN RESILIENCE</span><h1>供应链评价</h1><p>从结构、运营、恢复与治理出发，形成可追溯的韧性评价与改进建议。</p></div></div>' +
    '<div id="sceEditor" class="sce-layout"><div><form id="sceForm" class="sce-card" novalidate><div class="sce-card-head"><div><h2>创建供应链评价</h2><p>明确评价边界，再配置内外部信息。</p></div><button type="button" class="sce-btn sce-btn-soft" id="sceLoadSample">载入示例</button></div><div class="sce-card-body"><div class="sce-form-grid">' +
    '<label>供应链名称 <i>*</i><input id="sceChain" name="chain" maxlength="80" placeholder="如：新能源汽车动力电池供应链" required></label>' +
    '<label>核心企业 <i>*</i><input id="sceEnterprise" name="enterprise" maxlength="80" placeholder="请输入核心企业名称" required></label>' +
    '<label>区域范围 <i>*</i><input id="sceRegion" name="region" maxlength="80" placeholder="如：华东 / 长三角 / 全国" required></label>' +
    '<label>评价目的<select id="scePurpose" name="purpose"><option>企业韧性改进</option><option>产业链运行研判</option><option>金融机构尽调参考</option></select></label></div>' +
    '<div class="sce-source-label">信息来源范围 <i>*</i></div><div class="sce-source-options"><label><input type="checkbox" id="scePublic" checked><span><b>公开信息</b><small>政策、公告、企业官网及公开风险事件</small></span></label><label><input type="checkbox" id="sceAuthorized"><span><b>企业授权资料</b><small>采购销售、库存产能、预案与财务资料</small></span></label></div>' +
    '<div class="sce-input-mode" id="sceInputMode">自定义对象 · 不预设分数，按实际资料标记待核验项</div><p id="sceError" class="sce-error" role="alert" hidden></p><div class="sce-form-footer"><span>4 个维度 · 13 个二级指标 · 36 个三级指标</span><button class="sce-btn sce-btn-primary" id="sceGenerate" type="submit">✦ 生成分析报告</button></div></div></form></div>' +
    '<aside class="sce-side"><div class="sce-card"><div class="sce-card-head"><h2>四维韧性框架</h2></div><div class="sce-framework">' + dimensions.map(function (d, i) { return '<div><span style="--sce-accent:' + d.color + '">0' + (i + 1) + '</span><section><b>' + d.name + '</b><p>' + d.sub + '</p></section></div>'; }).join('') + '<p class="sce-method-note">依据附件《企业供应链韧性评价》介绍材料 p8–15。材料可见 36 个三级指标；正式评价须核对标准原文、适用指标、取值规则与权重。</p></div></div><div class="sce-card"><div class="sce-card-head"><h2>最近报告</h2><span>本机保存</span></div><div id="sceHistory" class="sce-history"></div></div></aside></div>' +
    '<div id="sceProgress" class="sce-card sce-progress" hidden aria-live="polite"></div><div id="sceReport" hidden></div><div id="sceToast" role="status" class="sce-toast" hidden></div>';
  host.appendChild(section);
  var dialog = document.createElement('div'); dialog.id = 'sceEvidenceModal'; dialog.className = 'sce-modal-backdrop'; dialog.hidden = true;
  dialog.innerHTML = '<section class="sce-modal" role="dialog" aria-modal="true" aria-labelledby="sceEvidenceTitle"><header><h2 id="sceEvidenceTitle">指标证据</h2><button type="button" class="sce-modal-close" id="sceEvidenceClose" aria-label="关闭指标证据">×</button></header><div id="sceEvidenceBody"></div><footer><button type="button" class="sce-btn sce-btn-primary" id="sceEvidenceDone">知道了</button></footer></section>';
  document.body.appendChild(dialog);
  function $(id) { return document.getElementById(id); }
  function toast(msg) { $('sceToast').textContent = msg; $('sceToast').hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(function () { $('sceToast').hidden = true; }, 3600); }
  function input() { return { chain: $('sceChain').value.trim(), enterprise: $('sceEnterprise').value.trim(), region: $('sceRegion').value.trim(), purpose: $('scePurpose').value, materials: state.sampleLoaded ? sample.materials : '', publicData: $('scePublic').checked, authorizedData: $('sceAuthorized').checked }; }
  function fill(data) { $('sceChain').value = data.chain || ''; $('sceEnterprise').value = data.enterprise || ''; $('sceRegion').value = data.region || ''; $('scePurpose').value = data.purpose || '企业韧性改进'; $('scePublic').checked = data.publicData !== false; $('sceAuthorized').checked = !!data.authorizedData; }
  function materialSummary(report) { return report.sample ? '预置虚构案例资料，仅用于演示。' : report.input.materials ? '历史报告保留资料（' + report.input.materials.length + ' 字），尚需核验。' : '所选信源尚未完成采集与核验。'; }
  function mode() { $('sceInputMode').textContent = state.sampleLoaded ? '已载入完整演示案例 · 资料、数值、证据与结论均为虚构示例' : '自定义对象 · 不预设分数，按实际资料标记待核验项'; $('sceInputMode').classList.toggle('sce-sample-mode', state.sampleLoaded); }
  function history() {
    var a = allReports();
    $('sceHistory').innerHTML = a.length ? a.slice(0, 6).map(function (r) { return '<button type="button" data-sce-history="' + esc(r.id) + '"><b>' + esc(r.input.chain) + '</b><span>' + esc(stamp(r.date)) + ' · ' + (r.sample ? '示例报告' : '待补充底稿') + '</span></button>'; }).join('') : '<div class="sce-empty">暂无报告<br><span>生成后可在本机重新打开</span></div>';
  }
  function edit() { $('sceEditor').hidden = false; $('sceReport').hidden = true; $('sceProgress').hidden = true; history(); }
  function stop() { state.job++; clearTimeout(state.timer); $('sceGenerate').disabled = false; edit(); toast('已取消生成，输入内容已保留'); }
  function run(data) {
    var job = ++state.job, isSample = state.sampleLoaded;
    $('sceError').hidden = true; $('sceEditor').hidden = true; $('sceReport').hidden = true; $('sceProgress').hidden = false; $('sceGenerate').disabled = true;
    var steps = ['整理评价边界与资料范围', isSample ? '读取预置示例信息' : '建立公开信息与授权资料采集清单', '关联四维指标，识别证据缺口', '生成分析报告与尽调建议'];
    function tick(n) {
      if (state.job !== job) return;
      $('sceProgress').innerHTML = '<div class="sce-orb">✦</div><h2>智能体正在整理评价报告</h2><p>流程演示 · ' + esc(data.chain) + '</p><ol>' + steps.map(function (s, i) { return '<li class="' + (i < n ? 'done' : i === n ? 'active' : '') + '"><span>' + (i < n ? '✓' : i + 1) + '</span>' + esc(s) + '<em>' + (i < n ? '已完成' : i === n ? '进行中' : '等待') + '</em></li>'; }).join('') + '</ol><p class="sce-muted">' + (isSample ? '仅处理预置案例，没有发起联网采集。' : '当前未接入信息采集服务，未获取的资料将如实标记待补充。') + '</p><button type="button" class="sce-btn" id="sceCancel">取消生成</button>';
      $('sceCancel').onclick = stop;
      state.timer = setTimeout(function () {
        if (state.job !== job) return;
        if (n < 3) tick(n + 1);
        else {
          var r = { version: 1, id: 'sce-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), date: new Date().toISOString(), sample: isSample, input: data };
          state.report = r; state.tab = 0; var saved = saveReport(r); renderReport(); $('sceGenerate').disabled = false; history();
          toast(saved ? '报告已生成，并保存在当前浏览器' : '报告已生成；浏览器存储不可用，请及时导出');
        }
      }, 700);
    }
    tick(0);
  }
  function radar(isSample) {
    var vals = isSample ? scores() : [0, 0, 0, 0];
    function poly(v) { return '180,' + (135 - v) + ' ' + (180 + v) + ',135 180,' + (135 + v) + ' ' + (180 - v) + ',135'; }
    var coords = '180,' + (135 - vals[0]) + ' ' + (180 + vals[1]) + ',135 180,' + (135 + vals[2]) + ' ' + (180 - vals[3]) + ',135';
    return '<svg class="sce-radar" viewBox="0 0 360 290" role="img" aria-label="' + (isSample ? '四维韧性示例雷达图' : '四维韧性待补充，暂无可计算数据') + '">' + [25, 50, 75, 100].map(function (n) { return '<polygon points="' + poly(n) + '" fill="' + (n % 50 ? '#f7faff' : '#fff') + '" stroke="#dfe8f4"/>'; }).reverse().join('') + '<path d="M180 35V235M80 135H280" stroke="#dfe8f4"/>' + (isSample ? '<polygon points="' + coords + '" fill="#2476e726" stroke="#2375e7" stroke-width="2.5"/>' : '<text x="180" y="140" text-anchor="middle" fill="#7e8ba0" font-size="14">等待证据补齐</text>') + '<text x="180" y="20" text-anchor="middle">承受能力' + (isSample ? ' ' + vals[0] : '') + '</text><text x="289" y="139">适应能力</text><text x="180" y="263" text-anchor="middle">恢复能力' + (isSample ? ' ' + vals[2] : '') + '</text><text x="70" y="139" text-anchor="end">支撑体系</text><text x="180" y="285" text-anchor="middle" class="sce-radar-note">' + (isSample ? '0–100 分 · 示意尺度' : '不使用示例分数替代自定义对象') + '</text></svg>';
  }
  function findings(isSample) {
    return isSample ? [
      ['优先补齐恢复能力', '关键材料的可替代性与重构资源储备相对薄弱。建议建立备选材料认证计划、跨工厂切换预案及资源恢复台账。', '30 天：采购与研发联合列出单一来源物料、替代认证节点和责任人。'],
      ['控制伙伴集中与物流暴露', '核心客户与主承运商依赖较高；同一区域工厂可能同时受极端天气影响，应以情景推演核验影响范围。', '60 天：采购、销售与物流开展断供及订单波动联演，记录恢复时间。'],
      ['把监测信号变成处置闭环', '明确预警责任、核验时限、升级条件和复盘机制；补齐供应商接口安全审查与联合演练。', '90 天：建立指标证据更新计划，以演练结果复核改进效果。']
    ] : [
      ['先形成可评价的供应链边界', '请提供核心企业上下游关系、关键物料或服务、供应链层级、区域与统计期间，明确评价对象和风险暴露范围。', '责任建议：供应链负责人整理对象清单，确认资料授权范围。'],
      ['按四维指标补充并核验证据', '公开资料不能替代采购、客户、库存、产能与应急制度等内部证据。所选信源需完成采集、指标映射与口径核验。', '优先补充：关键供应商/客户占比、交付记录、备选方案、库存与应急演练。'],
      ['通过复核后再确定取值和权重', '当前未执行标准原文的计算规则，也未自动核验输入，暂不计算综合分数或作出韧性等级判断。', '下一步：核对标准原文、选择适用指标、确定取值与权重并保留复核记录。']
    ];
  }
  function finance(isSample) {
    return [
      ['可跟进的业务方向', isSample ? '可围绕有真实贸易背景的应收账款融资、关键物料备货及替代认证投入开展项目筛选；当前仅为案例研判方向。' : '资料补齐后，可评估应收账款、采购备货及供应链恢复投入等业务方向；目前无法形成投资或授信结论。'],
      ['进入尽调的前提条件', '核验核心企业主体、真实交易、合同履约、应收确权、回款路径、货权及担保安排，并确认关联交易与集中度。'],
      ['重点压力情景', isSample ? '结合关键材料单一来源、头部客户订单下降、主物流线路中断和技术替代，检验现金流与持续履约能力。' : '依据实际行业与区域确定断供、需求下降、物流中断、价格波动及技术替代情景，核验经营现金流承压程度。'],
      ['仍需补充的资料', '经核验的财务报表与现金流、合同/订单/发票及回款记录、存货与权属证明、债务担保、诉讼和合规材料。']
    ];
  }
  function renderReport() {
    var r = state.report; if (!r) return;
    $('sceEditor').hidden = true; $('sceProgress').hidden = true; $('sceReport').hidden = false;
    var ds = scores(), total = Math.round(ds.reduce(function (a, b) { return a + b; }, 0) / 4 * 10) / 10;
    $('sceReport').innerHTML = '<div class="sce-report-toolbar"><div><span class="sce-report-status">' + (r.sample ? '示例分析报告' : '待补充 · 评价底稿') + '</span><span>生成于 ' + esc(stamp(r.date)) + '</span></div><div><button type="button" class="sce-btn" id="sceEdit">返回编辑</button><button type="button" class="sce-btn sce-btn-primary" id="sceExport">导出完整报告</button></div></div>' +
      '<div class="sce-report-hero"><div><span class="sce-eyebrow">RESILIENCE ANALYSIS REPORT</span><h2>' + esc(r.input.chain) + '</h2><p>' + esc(r.input.enterprise) + '　/　' + esc(r.input.region) + '　/　' + esc(r.input.purpose) + '</p><div class="sce-hero-tags"><span>4 维框架</span><span>13 二级指标</span><span>36 三级指标</span><span>' + (r.sample ? '全部数值为示例' : '36 项待补充 / 核验') + '</span></div></div><div class="sce-total"><span>综合韧性' + (r.sample ? '示例值' : '') + '</span><b>' + (r.sample ? total : '—') + '<small>' + (r.sample ? '/100' : '待评价') + '</small></b><p>' + (r.sample ? '仅演示计算，不作等级认证' : '证据不足，暂不评分') + '</p></div></div>' +
      '<div class="sce-report-note">' + (r.sample ? '本报告为虚构案例。四个维度各占 25%，维度内三级指标等权；分值为预设示意值，非团标规定权重或取值规则。' : '本报告仅基于输入建立评价底稿。未联网采集，未核验企业资料，不套用案例指标值、分数或结论。') + '</div>' +
      '<div class="sce-dimension-cards">' + dimensions.map(function (d, i) { return '<button type="button" class="sce-dimension" data-sce-tab="' + i + '" style="--sce-accent:' + d.color + '"><div><b>' + d.name + '</b><span>权重 25% · 演示配置</span></div><strong>' + (r.sample ? ds[i] : '—') + '</strong><p>' + d.sub + '　<span>查看指标 →</span></p></button>'; }).join('') + '</div>' +
      '<div class="sce-analysis-grid"><div class="sce-card"><div class="sce-card-head"><h2>四维能力画像</h2><span>' + (r.sample ? '示例测算' : '等待补齐') + '</span></div>' + radar(r.sample) + '</div><div class="sce-card"><div class="sce-card-head"><h2>分析结论与改进路径</h2><span>' + (r.sample ? '示例建议' : '补充清单') + '</span></div><div class="sce-findings">' + findings(r.sample).map(function (f, i) { return '<article><span>0' + (i + 1) + '</span><div><h3>' + f[0] + '</h3><p>' + f[1] + '</p><small>' + f[2] + '</small></div></article>'; }).join('') + '</div></div></div>' +
      '<div class="sce-card sce-indicators"><div class="sce-card-head"><div><h2>指标分析与证据</h2><p>逐项核对依据、资料时效与缺口；证据状态不等于认定结论。</p></div><span>' + indicators.length + ' 项指标</span></div><div class="sce-tabs" role="tablist">' + dimensions.map(function (d, i) { return '<button type="button" role="tab" id="sceTab' + i + '" aria-controls="sceIndicatorPanel" aria-selected="false" data-sce-tab="' + i + '">' + d.name + '<span>' + indicators.filter(function (x) { return x.dimension === i; }).length + '</span></button>'; }).join('') + '</div><div id="sceIndicatorPanel" role="tabpanel" class="sce-table-wrap"></div></div>' +
      '<div class="sce-card sce-finance"><div class="sce-card-head"><div><h2>供应链金融与投资尽调参考</h2><p>以贸易真实性、现金流和风险缓释措施为核心，提出附条件的后续研判方向。</p></div><span>需独立尽调</span></div><div class="sce-finance-grid">' + finance(r.sample).map(function (f, i) { return '<article><span>0' + (i + 1) + '</span><h3>' + f[0] + '</h3><p>' + f[1] + '</p></article>'; }).join('') + '</div><div class="sce-finance-note">韧性能力不等于偿债能力。当前材料不支持确定投资收益率、授信额度、信用评级或投资决策；须结合核实后的财务、交易与法律资料独立审查。</div></div>' +
      '<div class="sce-card sce-input-summary"><div class="sce-card-head"><h2>资料边界与评价口径</h2><button type="button" class="sce-link" id="sceReviewInput">查看本次输入</button></div><div class="sce-card-body"><p>来源选择：' + (r.input.publicData ? '公开信息' : '') + (r.input.publicData && r.input.authorizedData ? '、' : '') + (r.input.authorizedData ? '企业授权资料' : '') + '；资料状态：' + materialSummary(r) + '</p><p>框架来源：附件介绍材料 p8–15，4 一级 / 13 二级 / 36 三级。示例采用四维等权、维度内三级指标等权，非正式标准权重；正式评价须依据标准原文复核计算与取值规则。</p><p>证据更新：' + (r.sample ? '固定虚构示例资料，数据日期为 2026-10-19（演示）。' : '未进行在线采集；资料统计期间、来源及适用性均待核实。') + '</p></div></div>';
    $('sceEdit').onclick = function () { fill(r.input); state.sampleLoaded = r.sample; mode(); edit(); };
    $('sceExport').onclick = exportReport;
    $('sceReviewInput').onclick = openInput;
    renderIndicators();
  }
  function renderIndicators() {
    var r = state.report; if (!r) return;
    section.querySelectorAll('.sce-tabs [data-sce-tab]').forEach(function (b) { var active = Number(b.dataset.sceTab) === state.tab; b.classList.toggle('active', active); b.setAttribute('aria-selected', String(active)); b.tabIndex = active ? 0 : -1; });
    section.querySelectorAll('.sce-dimension').forEach(function (b) { b.classList.toggle('active', Number(b.dataset.sceTab) === state.tab); });
    $('sceIndicatorPanel').setAttribute('aria-labelledby', 'sceTab' + state.tab);
    $('sceIndicatorPanel').innerHTML = '<table><thead><tr><th>二级指标 / 三级指标</th><th>取值 / 观察</th><th>示例分</th><th>证据状态</th><th>来源与更新</th><th>追溯</th></tr></thead><tbody>' + indicators.filter(function (x) { return x.dimension === state.tab; }).map(function (x) { return '<tr><td><span class="sce-group-name">' + x.group + '</span><b>' + x.name + '</b></td><td>' + (r.sample ? x.value : '待补充原始资料与统计口径') + '</td><td><strong class="sce-score">' + (r.sample ? x.score : '—') + '</strong></td><td><span class="sce-evidence-badge ' + (r.sample ? 'example' : 'missing') + '">' + (r.sample ? '示例证据' : r.input.materials ? '待映射 / 待核验' : '资料缺失') + '</span></td><td>' + (r.sample ? '预置虚构案例<br><small>2026-10-19（演示）</small>' : (r.input.materials ? '历史报告保留资料' : '未获取') + '<br><small>统计期间待核实</small>') + '</td><td><button type="button" class="sce-link" data-sce-evidence="' + x.id + '">查看依据</button></td></tr>'; }).join('') + '</tbody></table><div class="sce-table-note">' + (r.sample ? '指标分数为产品交互用预设示意值，不代表这些原始数据按团标计算后的真实结果。全部证据均为虚构案例，不是企业实际披露信息。' : '所选信源尚未完成指标映射与核验，不能据此推断指标已满足或已验证。请在正式服务接入后完成采集、字段映射与人工复核。') + '</div>';
  }
  function openModal(title, html) { state.lastFocus = document.activeElement; $('sceEvidenceTitle').textContent = title; $('sceEvidenceBody').innerHTML = html; dialog.hidden = false; $('sceEvidenceClose').focus(); }
  function closeModal() { dialog.hidden = true; if (state.lastFocus && state.lastFocus.isConnected) state.lastFocus.focus(); }
  function openEvidence(id) {
    var r = state.report, x = indicators.find(function (i) { return i.id === id; }); if (!r || !x) return;
    openModal(x.name + ' · 证据追溯', '<div class="sce-evidence-top">' + esc(dimensions[x.dimension].name) + ' / ' + esc(x.group) + ' / ' + x.id + '</div><dl><dt>指标说明</dt><dd>' + esc(x.description) + '</dd><dt>原始取值 / 观察</dt><dd>' + (r.sample ? esc(x.value) : '尚无可核验的指标原始值') + '</dd><dt>证据状态</dt><dd>' + (r.sample ? '虚构示例，仅用于交互展示' : r.input.materials ? '历史报告保留资料，尚未完成指标映射与核验' : '资料缺失，待补充') + '</dd><dt>来源与数据时间</dt><dd>' + (r.sample ? '预置虚构案例资料包；2026-10-19（演示），无外部披露原文' : '未进行在线采集；来源、统计期间及适用范围待核实') + '</dd><dt>计算口径</dt><dd>' + (r.sample ? '此项 ' + x.score + ' 分为预设示意值；不宣称由上述取值按团标公式计算。维度内三级指标等权，四维各占25%。' : '当前未执行计算，不生成分数；正式计算须按标准原文确定规则、权重和证据要求。') + '</dd><dt>补充与复核事项</dt><dd>提供覆盖评价期间的原始台账或制度记录，核对资料责任人、时间、范围与统计口径；由专业人员确认适用性与取值。</dd></dl>');
  }
  function openInput() { var r = state.report; if (!r) return; openModal('本次评价输入', '<dl><dt>供应链 / 核心企业</dt><dd>' + esc(r.input.chain) + '<br>' + esc(r.input.enterprise) + '</dd><dt>区域 / 目的</dt><dd>' + esc(r.input.region) + ' / ' + esc(r.input.purpose) + '</dd><dt>信息来源范围</dt><dd>' + (r.input.publicData ? '公开信息 ' : '') + (r.input.authorizedData ? '企业授权资料' : '') + '</dd>' + (r.input.materials ? '<dt>' + (r.sample ? '示例资料' : '历史报告保留资料') + '</dt><dd class="sce-pre">' + esc(r.input.materials) + '</dd>' : '') + '<dt>资料处理状态</dt><dd>' + materialSummary(r) + '当前为静态交互原型，没有自动抓取或在线核验。</dd></dl>'); }
  function exportReport() {
    var r = state.report; if (!r) return;
    var ds = scores(), out = ['智研平台 · 供应链韧性分析报告', r.sample ? '【交互演示 · 虚构示例数据】' : '【自定义对象 · 待补充评价底稿】', '供应链：' + r.input.chain, '核心企业：' + r.input.enterprise, '区域：' + r.input.region, '评价目的：' + r.input.purpose, '生成时间：' + stamp(r.date), '', '一、评价边界与口径', '当前未接入实时信息采集或在线AI。框架参考附件介绍材料p8–15：4一级、13二级、36三级。正式评价须按标准原文复核。', r.sample ? '所有数据为虚构；示例分为预设值。四维各25%，维度内三级指标等权，非团标规定权重。' : '不套用示例值，不计算分数；所选信源尚待采集、指标映射与核验。', '', '二、四维画像'];
    dimensions.forEach(function (d, i) { out.push(d.name + '：' + (r.sample ? ds[i] + ' 分（示例）' : '待评价') + '；演示权重25%'); });
    out.push('', '三、全部指标与证据');
    indicators.forEach(function (x) { out.push(x.id + ' ' + dimensions[x.dimension].name + ' / ' + x.group + ' / ' + x.name, '说明：' + x.description, '取值：' + (r.sample ? x.value : '待补充'), '分数：' + (r.sample ? x.score + '（预设示意值）' : '不计算'), '证据：' + (r.sample ? '预置虚构案例；2026-10-19（演示）；不含企业真实披露原文' : '未在线采集；指标证据尚待获取与核验；统计期间待核实'), '缺口：需要原始台账、来源、期间及责任人复核', ''); });
    out.push('四、分析结论与改进建议'); findings(r.sample).forEach(function (f) { out.push(f.join('\n'), ''); });
    out.push('五、金融机构尽调与投资融资参考'); finance(r.sample).forEach(function (f) { out.push(f.join('：')); });
    out.push('韧性能力不等于偿债能力。不得依据本底稿确定投资收益率、授信额度、信用评级或投资决策。', '', '六、信息来源范围', '公开信息范围：' + (r.input.publicData ? '已选择' : '未选择'), '企业授权资料范围：' + (r.input.authorizedData ? '已选择' : '未选择'), materialSummary(r));
    if (r.input.materials) out.push(r.sample ? '示例资料：' : '历史报告保留资料：', r.input.materials);
    out.push('报告与评价范围仅在当前浏览器保存，没有上传。');
    var blob = new Blob(['\ufeff' + out.join('\r\n')], { type: 'text/plain;charset=utf-8' }), url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = r.input.chain.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').slice(0, 70) + '-供应链韧性报告.txt'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000); toast('已导出包含全部 36 项指标的文本报告');
  }
  $('sceLoadSample').onclick = function () { fill(sample); state.sampleLoaded = true; mode(); $('sceError').hidden = true; toast('已载入虚构演示案例；修改任意输入后将转为自定义评价'); };
  $('sceForm').addEventListener('input', function () { if (state.sampleLoaded) { state.sampleLoaded = false; mode(); } $('sceError').hidden = true; });
  $('sceForm').addEventListener('change', function () { if (state.sampleLoaded) { state.sampleLoaded = false; mode(); } });
  $('sceForm').onsubmit = function (e) {
    e.preventDefault(); var data = input(), msg = '', focus = 'sceChain';
    if (!data.chain) msg = '请输入供应链名称。';
    else if (!data.enterprise) { msg = '请输入核心企业，明确评价对象。'; focus = 'sceEnterprise'; }
    else if (!data.region) { msg = '请输入区域范围，明确评价边界。'; focus = 'sceRegion'; }
    else if (!data.publicData && !data.authorizedData) { msg = '请至少选择一种信息来源范围。'; focus = 'scePublic'; }
    if (msg) { $('sceError').textContent = msg; $('sceError').hidden = false; $(focus).focus(); return; }
    run(data);
  };
  section.addEventListener('click', function (e) {
    var tab = e.target.closest('[data-sce-tab]'), ev = e.target.closest('[data-sce-evidence]'), old = e.target.closest('[data-sce-history]');
    if (tab) { state.tab = Number(tab.dataset.sceTab); renderIndicators(); }
    if (ev) openEvidence(ev.dataset.sceEvidence);
    if (old) { var r = allReports().find(function (x) { return x.id === old.dataset.sceHistory; }); if (r) { state.report = r; state.tab = 0; renderReport(); } else toast('该报告记录已不可用'); }
  });
  section.addEventListener('keydown', function (e) {
    if (!e.target.matches('.sce-tabs [role="tab"]') || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault(); state.tab = e.key === 'Home' ? 0 : e.key === 'End' ? 3 : (state.tab + (e.key === 'ArrowRight' ? 1 : 3)) % 4; renderIndicators(); $('sceTab' + state.tab).focus();
  });
  $('sceEvidenceClose').onclick = closeModal; $('sceEvidenceDone').onclick = closeModal;
  dialog.onclick = function (e) { if (e.target === dialog) closeModal(); };
  document.addEventListener('keydown', function (e) {
    if (dialog.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
    if (e.key === 'Tab') { var buttons = dialog.querySelectorAll('button'); if (e.shiftKey && document.activeElement === buttons[0]) { e.preventDefault(); buttons[buttons.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === buttons[buttons.length - 1]) { e.preventDefault(); buttons[0].focus(); } }
  });
  window.supplyEvaluationLoad = function (context) {
    if (state.timer) { clearTimeout(state.timer); state.job++; $('sceGenerate').disabled = false; }
    var c = context || {}; fill({ chain: String(c.chain || '').slice(0, 80), enterprise: String(c.enterprise || '').slice(0, 80), region: String(c.region || '').slice(0, 80), publicData: true }); state.sampleLoaded = false; mode(); edit(); $('sceError').hidden = true;
    if (typeof window.show === 'function') window.show('supplyEvaluation'); else section.classList.add('show');
    toast('已带入风险关注对象；请补充资料，风险信号不直接等于评价结论');
  };
  history(); mode();
})();

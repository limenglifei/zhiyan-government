(function () {
  'use strict';

  var dueNetworkEnabled = true;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  var fieldSources = {
    products: { title: '主营产品与服务', source: '企业官网、产品手册与公开招投标', time: '2026-08-26 11:20', url: 'https://www.ccgp.gov.cn/', detail: '系统基于企业官网产品页、公开产品手册及招投标信息补充主营产品与服务，并与企业库行业字段进行一致性校验。' },
    customers: { title: '主要客户关系', source: '企业公告、政府采购与合作新闻', time: '2026-08-26 11:23', url: 'https://www.ccgp.gov.cn/', detail: '公开信息可确认三家主要客户关系，但不代表完整客户清单；正式尽调仍需核验客户集中度与合同金额。' },
    suppliers: { title: '主要供应商关系', source: '采购公告、供应链合作新闻与企业披露', time: '2026-08-26 11:25', url: 'https://www.ccgp.gov.cn/', detail: '三家主要供应商由采购公告和供应链合作信息交叉识别，正式尽调需企业提供审计口径采购明细。' },
    market: { title: '市场地位与细分份额', source: '行业研究、客户公告与企业公开资料', time: '2026-08-26 11:28', url: 'https://www.miit.gov.cn/', detail: '行业梯队和市场份额由行业研究与客户进入情况综合推断，不等同于审计或监管认定。' }
  };

  var newsGroups = {
    recruit: [
      { title: '芯源微电子启动新一轮工程及量产岗位招聘', date: '2026-08-18', org: '企业官网', summary: '新增工艺、设备及量产岗位，近 90 天相关招聘数量较上一周期增长约 18%，释放产能团队扩充信号。', url: 'https://www.cninfo.com.cn/new/index' },
      { title: '车规芯片企业加码工程技术团队建设', date: '2026-08-06', org: '海州产业新闻', summary: '企业面向长三角新增工艺整合与客户质量岗位，岗位地点变化可作为异地业务拓展辅助信号。', url: 'https://www.gov.cn/' }
    ],
    equipment: [
      { title: '功率器件测试设备采购项目招标公告', date: '2026-08-12', org: '公开招投标信息', summary: '采购内容涵盖功率器件测试与可靠性验证设备，项目规模与现有产品线扩充方向一致。', url: 'https://www.ccgp.gov.cn/' },
      { title: '特色工艺产线关键设备采购意向公示', date: '2026-07-31', org: '企业采购公告', summary: '采购意向涉及晶圆测试、封装验证及自动化搬运设备，反映中期资本开支安排。', url: 'https://www.ccgp.gov.cn/' }
    ],
    capital: [
      { title: '产业基金完成对芯源微电子 3.2 亿元增资', date: '2026-07-29', org: '企业公告', summary: '本轮增资主要用于研发投入、产能建设及流动资金补充，为后续扩张提供资本支持。', url: 'https://www.cninfo.com.cn/new/index' },
      { title: '芯源微电子完成工商资本变更登记', date: '2026-07-25', org: '市场监管公示', summary: '注册资本及股东出资信息发生变更，与产业基金增资公告相互印证。', url: 'https://www.gsxt.gov.cn/' }
    ],
    layout: [
      { title: '芯源微电子调研长三角第二生产基地选址', date: '2026-07-21', org: '产业新闻舆情库', summary: '公开报道显示企业正在调研长三角区域第二生产基地，投资规模与最终选址尚未正式披露。', url: 'https://www.gov.cn/' }
    ],
    capacity: [
      { title: '芯源微电子披露未来产能规划', date: '2026-06-30', org: '投资者交流公告', summary: '企业提出在 2027 年前形成新增特色工艺产能，具体建设节奏将结合订单与资本开支确定。', url: 'https://www.cninfo.com.cn/new/index' }
    ]
  };

  function onlineButton(key) {
    return '<button type="button" class="due-online-source-v100" onclick="openDueFieldTraceV101(\'' + key + '\')"><i>联</i>联网</button>';
  }

  function fact(label, value, options) {
    options = options || {};
    var classes = ['due-fact-v99'];
    if (options.className) classes.push(options.className);
    if (options.online) classes.push('due-online-only-v101');
    return '<div class="' + classes.join(' ') + '"><dt>' + esc(label) + '</dt><dd>' + value + (options.online ? onlineButton(options.sourceKey) : '') + '</dd></div>';
  }

  function findSection(names) {
    if (!Array.isArray(names)) names = [names];
    var sections = document.querySelectorAll('#dueEvidenceReportV99 .due-evidence-section-v99');
    for (var i = 0; i < sections.length; i += 1) {
      var h2 = sections[i].querySelector('h2');
      if (h2 && names.indexOf(h2.textContent.trim()) >= 0) return sections[i];
    }
    return null;
  }

  function replaceFacts(section, html) {
    var grid = section && section.querySelector('.due-fact-grid-v99');
    if (grid) grid.innerHTML = html;
  }

  function enhanceBasic() {
    var section = findSection('企业主体与基础画像');
    if (!section) return;
    var companyNode = document.getElementById('dueSummaryCompany');
    var company = companyNode ? companyNode.textContent.trim() : '芯源微电子科技股份有限公司';
    replaceFacts(section,
      fact('企业全称', esc(company), { className: 'wide' }) +
      fact('统一社会信用代码', '91320594MA1M7X9J6R') +
      fact('经营状态', '存续') +
      fact('法定代表人', '陈启明') +
      fact('注册资本 / 实缴资本', '68,000 万元 / 54,230 万元') +
      fact('成立日期', '2016-08-19') +
      fact('企业类型', '股份有限公司') +
      fact('所属国民经济行业', '计算机、通信和其他电子设备制造业（C39）', { className: 'wide' }) +
      fact('主营产品 / 服务', '车规级 MCU、功率器件、晶圆制造及相关技术服务', { className: 'wide', online: true, sourceKey: 'products' }) +
      fact('社保人数', '1,364 人') +
      fact('注册地址', '江苏省苏州市工业园区星湖街 218 号', { className: 'wide' }) +
      fact('联系电话 / 邮箱', '0512-6688-2106 / bd@xinyuan-micro.cn', { className: 'wide' })
    );
  }

  function enhanceChain() {
    var section = findSection('产业链定位与关联度');
    if (!section) return;
    var subtitle = section.querySelector('.due-section-title-v99 p');
    if (subtitle) subtitle.textContent = '重点识别企业所在链条位置、上下游关系与本地协同';
    replaceFacts(section,
      fact('所属产业链', '新能源汽车产业链 / 集成电路产业链', { className: 'wide' }) +
      fact('核心挂靠节点', '车规级 MCU、功率半导体', { className: 'wide' }) +
      fact('产业链环节', '中游核心器件与制造') +
      fact('节点关系强度', '92%') +
      fact('企业重要程度', '重点补强企业') +
      fact('主要上游', '晶圆材料、封测设备、EDA / IP 服务', { className: 'wide' }) +
      fact('主要供应商（3 家）', '<ul class="due-relation-list-v100"><li>长晶半导体材料有限公司</li><li>华芯封测设备股份有限公司</li><li>凌云 EDA 技术有限公司</li></ul>', { className: 'wide', online: true, sourceKey: 'suppliers' }) +
      fact('主要下游', '整车、汽车电子、储能及工业控制', { className: 'wide' }) +
      fact('主要客户（3 家）', '<ul class="due-relation-list-v100"><li>华东新能源汽车集团</li><li>海州智控科技有限公司</li><li>启明汽车电子股份有限公司</li></ul>', { className: 'wide', online: true, sourceKey: 'customers' })
    );
  }

  function enhanceFinance() {
    var section = findSection('经营与财务健康度');
    if (!section) return;
    var state = section.querySelector('.due-section-state-v99');
    if (state) { state.textContent = '来自公开年报、联网搜索'; state.className = 'due-section-state-v99 online-v101'; }
    var table = section.querySelector('.due-trend-table-v99');
    if (!table) return;
    table.innerHTML = '<thead><tr><th>指标</th><th>2023 年</th><th>2024 年</th><th>2025 年</th><th>趋势判断</th></tr></thead><tbody>' +
      '<tr><td>营业收入</td><td>24.1 亿元</td><td>31.2 亿元</td><td>38.6 亿元</td><td class="due-positive-v99">连续增长</td></tr>' +
      '<tr><td>利润总额</td><td>2.46 亿元</td><td>3.28 亿元</td><td>4.32 亿元</td><td class="due-positive-v99">盈利改善</td></tr>' +
      '<tr><td>净利润</td><td>1.98 亿元</td><td>2.71 亿元</td><td>3.68 亿元</td><td class="due-positive-v99">质量较好</td></tr>' +
      '<tr><td>资产负债率</td><td>58.4%</td><td>59.7%</td><td>61.2%</td><td class="due-warning-v99">资本开支推升</td></tr>' +
      '<tr><td>参保人数</td><td>1,086</td><td>1,224</td><td>1,364</td><td class="due-positive-v99">规模扩张</td></tr></tbody>';
  }

  function enhanceInnovation() {
    var section = findSection('技术实力与市场地位');
    if (!section) return;
    var marketField = Array.prototype.find.call(section.querySelectorAll('.due-fact-v99'), function (item) {
      var dt = item.querySelector('dt'); return dt && dt.textContent.indexOf('市场份额') >= 0;
    });
    if (marketField) {
      marketField.classList.add('due-online-only-v101');
      var old = marketField.querySelector('.due-online-source-v100');
      if (old) old.outerHTML = onlineButton('market');
    }
  }

  function enhanceRisk() {
    var section = findSection(['信用与司法风险', '信用、司法与园区准入风险']);
    if (!section) return;
    var h2 = section.querySelector('h2'); if (h2) h2.textContent = '信用与司法风险';
    var state = section.querySelector('.due-section-state-v99');
    if (state) { state.textContent = '来自企业库'; state.className = 'due-section-state-v99'; }
    replaceRiskSummary(section);
    var table = section.querySelector('.due-risk-table-v99');
    if (table) table.innerHTML = '<thead><tr><th>风险维度</th><th>企业库记录</th><th>判断</th><th>数据状态</th></tr></thead><tbody>' +
      '<tr><td>严重违法 / 失信执行</td><td>未发现相关记录</td><td class="due-positive-v99">未发现重大红线</td><td>企业库已归集</td></tr>' +
      '<tr><td>司法诉讼</td><td>4 起一般合同纠纷</td><td class="due-warning-v99">需核验最新进展</td><td>企业库有记录</td></tr>' +
      '<tr><td>行政处罚</td><td>1 条，已整改</td><td class="due-warning-v99">一般关注</td><td>企业库有记录</td></tr>' +
      '<tr><td>环保 / 安全生产</td><td>近三年无处罚记录</td><td class="due-positive-v99">未发现准入红线</td><td>企业库已归集</td></tr></tbody>';
    section.querySelectorAll('.due-online-source-v100').forEach(function (node) { node.remove(); });
    var analysis = section.querySelector('.due-analysis-v99 p');
    if (analysis) analysis.textContent = '本模块全部读取企业库已归集的信用、司法、行政处罚及税务记录。当前未发现重大红线；一般合同纠纷和历史行政处罚仍需在正式接洽前核验案件进展与整改闭环。';
  }

  function replaceRiskSummary(section) {
    var summary = section.querySelector('.due-risk-summary-v100');
    if (!summary) return;
    summary.innerHTML = fact('纳税信用等级', 'A 级') + fact('欠税公告数量', '0 条') + fact('欠税总金额（万元）', '0');
  }

  function signalCard(label, value, key, strength) {
    return '<article><span>' + esc(label) + '</span><b>' + esc(value) + '</b><em>' + esc(strength) + '</em><button type="button" class="due-news-link-v101" onclick="openDueNewsListV101(\'' + key + '\')">查看新闻详情 ↗</button></article>';
  }

  function enhanceExpansion() {
    var section = findSection(['扩展意愿与落地诉求', '扩张意愿与落地条件', '扩张意愿与投融资信号']);
    if (!section) return;
    section.classList.add('due-online-only-v101', 'due-expansion-v101');
    var h2 = section.querySelector('h2'); if (h2) h2.textContent = '扩张意愿与投融资信号';
    var subtitle = section.querySelector('.due-section-title-v99 p');
    if (subtitle) subtitle.textContent = '基于招聘、设备采购、融资与异地布局新闻识别企业扩张窗口';
    var state = section.querySelector('.due-section-state-v99');
    if (state) { state.textContent = '联网'; state.className = 'due-section-state-v99 inference'; }
    var signals = section.querySelector('.due-landing-signals-v99');
    if (signals) signals.innerHTML =
      signalCard('近 90 天招聘变化', '工程及量产岗位 +18%', 'recruit', '中等强度信号') +
      signalCard('设备 / 产线招标', '新增功率器件测试设备采购', 'equipment', '强信号') +
      signalCard('融资与资本动作', '产业基金增资 3.2 亿元', 'capital', '强信号') +
      signalCard('异地布局动态', '调研长三角第二生产基地', 'layout', '待核验信号') +
      signalCard('产能规划', '2027 年前形成新增产能', 'capacity', '公开表述');
    var analysis = section.querySelector('.due-analysis-v99 p');
    if (analysis) analysis.textContent = '招聘、设备采购、产业基金增资和异地布局形成较强扩张组合信号，建议进入招商初步关注。上述信号来自公开新闻与公告，不等同于正式投资承诺，应在接洽阶段进一步核验资本开支、融资用途与投资决策进度。';
  }

  function ensureNewsModal() {
    if (document.getElementById('dueNewsListModalV101')) return;
    document.body.insertAdjacentHTML('beforeend', '<div class="prototype-modal-backdrop due-news-modal-v101" id="dueNewsListModalV101" aria-hidden="true"><section class="prototype-modal" role="dialog" aria-modal="true"><header><div><label>ONLINE NEWS TRACE</label><h2 id="dueNewsListTitleV101">相关新闻与公告</h2><p>标题、发布时间、摘要与原文链接均可追溯</p></div><button type="button" onclick="closeDueNewsListV101()">×</button></header><div class="prototype-modal-body"><div class="due-news-list-v101" id="dueNewsListBodyV101"></div></div><footer><button class="secondary" type="button" onclick="closeDueNewsListV101()">关闭</button></footer></section></div>');
  }

  window.openDueNewsListV101 = function (key) {
    ensureNewsModal();
    var items = newsGroups[key] || [];
    document.getElementById('dueNewsListTitleV101').textContent = items.length > 1 ? '相关信号新闻（' + items.length + ' 条）' : '新闻详情';
    document.getElementById('dueNewsListBodyV101').innerHTML = items.map(function (item) {
      return '<a href="' + esc(item.url) + '" target="_blank" rel="noopener" class="due-news-item-v101"><header><div><b>' + esc(item.title) + '</b><span>' + esc(item.org) + ' · ' + esc(item.date) + '</span></div><em>查看原文 ↗</em></header><p>' + esc(item.summary) + '</p></a>';
    }).join('');
    var modal = document.getElementById('dueNewsListModalV101'); modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
  };

  window.closeDueNewsListV101 = function () {
    var modal = document.getElementById('dueNewsListModalV101'); if (!modal) return;
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
  };

  window.openDueFieldTraceV101 = function (key) {
    var item = fieldSources[key] || fieldSources.products;
    if (typeof window.openDueTraceV100 === 'function') window.openDueTraceV100('market');
    setTimeout(function () {
      var title = document.getElementById('dueTraceTitleV100');
      var meta = document.getElementById('dueTraceMetaV100');
      var body = document.getElementById('dueTraceBodyV100');
      var link = document.getElementById('dueTraceOriginV100');
      if (title) title.textContent = item.title;
      if (meta) meta.textContent = item.source + ' · ' + item.time;
      if (body) body.innerHTML = '<div class="due-trace-detail-v100"><span>联网</span><p>' + esc(item.detail) + '</p><dl><div><dt>来源</dt><dd>' + esc(item.source) + '</dd></div><div><dt>更新时间</dt><dd>' + esc(item.time) + '</dd></div></dl></div>';
      if (link) link.href = item.url;
    }, 0);
  };

  function switchButtonHtml(context) {
    return '<span class="due-network-label-v101">' + (dueNetworkEnabled ? '联网' : '离线') + '</span><i></i>';
  }

  function syncNetworkButtons() {
    document.querySelectorAll('.due-network-switch-v101').forEach(function (button) {
      button.classList.toggle('active', dueNetworkEnabled);
      button.setAttribute('aria-pressed', String(dueNetworkEnabled));
      button.setAttribute('title', dueNetworkEnabled ? '联网补充已开启，点击隐藏联网信息' : '联网补充已关闭，点击开启');
      button.innerHTML = switchButtonHtml();
    });
    var report = document.getElementById('dueReport');
    if (report) report.classList.toggle('due-network-off-v101', !dueNetworkEnabled);
  }

  window.toggleDueNetworkV101 = function () {
    dueNetworkEnabled = !dueNetworkEnabled;
    syncNetworkButtons();
    if (typeof toast === 'function') toast(dueNetworkEnabled ? '已开启联网补充，报告将显示联网信息' : '已关闭联网补充，联网信息已隐藏');
  };

  function mountHomeSwitch() {
    var search = document.querySelector('#dueDiligence .due-search');
    var generate = document.getElementById('dueGenerateBtn');
    if (!search || !generate) return;
    var button = document.getElementById('dueHomeNetworkV101');
    if (!button) {
      button = document.createElement('button'); button.type = 'button'; button.id = 'dueHomeNetworkV101'; button.className = 'due-network-switch-v101 active'; button.onclick = window.toggleDueNetworkV101;
      search.insertBefore(button, generate);
    }
  }

  function mountReportControls() {
    var report = document.getElementById('dueReport');
    var actions = report && report.querySelector('.due-report-head>div:last-child');
    if (!actions) return;
    actions.querySelectorAll('.due-report-company-switch').forEach(function (node) { node.remove(); });
    var history = document.getElementById('dueHistoryBtnV77');
    var download = actions.querySelector('button[onclick*="downloadDueReport"]');
    var network = document.getElementById('dueReportNetworkV101');
    if (!network) { network = document.createElement('button'); network.type = 'button'; network.id = 'dueReportNetworkV101'; network.className = 'due-network-switch-v101'; network.onclick = window.toggleDueNetworkV101; }
    var fresh = document.getElementById('dueNewReportV101');
    if (!fresh) { fresh = document.createElement('button'); fresh.type = 'button'; fresh.id = 'dueNewReportV101'; fresh.className = 'primary due-new-report-v101'; fresh.textContent = '＋ 发起新尽调'; fresh.onclick = window.startNewDueV101; }
    if (history) actions.insertBefore(network, history); else actions.insertBefore(network, download || actions.firstChild);
    if (download) download.insertAdjacentElement('afterend', fresh); else actions.appendChild(fresh);
  }

  window.startNewDueV101 = function () {
    if (typeof show === 'function') show('dueDiligence');
    var input = document.getElementById('dueCompanyInput'); if (input) { input.value = ''; setTimeout(function () { input.focus(); }, 80); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function normalizeOnlineLabels() {
    document.querySelectorAll('#dueReport .due-online-source-v100').forEach(function (button) { button.innerHTML = '<i>联</i>联网'; });
    var tags = document.querySelectorAll('#dueReport .due-report-tags span');
    tags.forEach(function (tag) { tag.textContent = tag.textContent.replace('扩展意愿', '扩张意愿'); });
  }

  function updateLogicNotes() {
    if (typeof prototypeLogicAnnotations === 'undefined') return;
    if (prototypeLogicAnnotations.dueReport) {
      prototypeLogicAnnotations.dueReport.fields = (prototypeLogicAnnotations.dueReport.fields || []).filter(function (item) { return item[0] !== '数据可用性与补充策略'; });
      prototypeLogicAnnotations.dueReport.interactions = (prototypeLogicAnnotations.dueReport.interactions || []).filter(function (item) { return item[0] !== '切换尽调企业' && item[0] !== '查看证据链'; });
      if (!prototypeLogicAnnotations.dueReport.interactions.some(function (item) { return item[0] === '报告联网开关'; })) prototypeLogicAnnotations.dueReport.interactions.push(['报告联网开关', '开启时展示主营产品、客户供应商、市场地位和扩张信号等联网补充信息；关闭时隐藏上述联网内容。', '首页生成前或报告头部可切换，状态在本次任务内保持一致。']);
      if (!prototypeLogicAnnotations.dueReport.interactions.some(function (item) { return item[0] === '报告头部吸顶'; })) prototypeLogicAnnotations.dueReport.interactions.push(['报告头部吸顶', '页面上滑后报告标题与操作区固定在顶部。', '吸顶区保留历史报告、下载报告、发起新尽调和联网开关。']);
    }
    if (prototypeLogicAnnotations.dueDiligence && !prototypeLogicAnnotations.dueDiligence.interactions.some(function (item) { return item[0] === '联网生成'; })) prototypeLogicAnnotations.dueDiligence.interactions.push(['联网生成', '在企业输入框内开启或关闭联网。', '开启后补充公开年报、新闻和投融资信号；关闭后仅使用企业库数据生成报告。']);
  }

  function enhanceReport() {
    if (!document.getElementById('dueEvidenceReportV99')) return;
    enhanceBasic(); enhanceChain(); enhanceFinance(); enhanceInnovation(); enhanceRisk(); enhanceExpansion();
    mountReportControls(); ensureNewsModal(); normalizeOnlineLabels(); syncNetworkButtons(); updateLogicNotes();
  }

  function init() {
    mountHomeSwitch(); syncNetworkButtons(); setTimeout(enhanceReport, 100);
    var previous = window.openDueReport;
    if (typeof previous === 'function' && !previous.__dueV101) {
      var wrapped = function () { var result = previous.apply(this, arguments); setTimeout(enhanceReport, 120); return result; };
      wrapped.__dueV101 = true; window.openDueReport = wrapped;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

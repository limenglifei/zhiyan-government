(function () {
  'use strict';

  var newsGroupsV103 = {
    recruit: [
      { title: '芯源微电子启动新一轮工程及量产岗位招聘', date: '2026-08-18', org: '企业官网', summary: '新增工艺、设备及量产岗位，近 90 天相关招聘数量较上一周期增长约 18%，释放产能团队扩充信号。', url: 'https://www.gov.cn/' }
    ],
    investment: [
      { title: '芯源微电子赴海州市考察第二生产基地选址', date: '2026-08-20', org: '海州市投资促进中心', summary: '企业管理团队实地调研海州高新区厂房、能源保障和上下游配套条件，拟作为第二生产基地备选区域。', url: 'https://www.gov.cn/' },
      { title: '芯源微电子在海州市设立华东区域分公司', date: '2026-08-08', org: '市场监管公示', summary: '新设分公司经营范围覆盖技术服务、产品销售和供应链协同，可作为企业区域业务前置布局信号。', url: 'https://www.gsxt.gov.cn/' }
    ],
    product: [
      { title: '芯源微电子发布新一代车规级 MCU XMC9000', date: '2026-08-15', org: '企业官网', summary: '新产品面向新能源汽车域控制和智能座舱场景，已进入样品验证阶段，反映企业产品线继续扩展。', url: 'https://www.miit.gov.cn/' },
      { title: '高可靠功率器件系列完成产品认证', date: '2026-07-26', org: '企业产品公告', summary: '新系列产品通过可靠性认证并启动客户导入，为扩大车规与储能市场供货奠定基础。', url: 'https://www.miit.gov.cn/' }
    ],
    cooperation: [
      { title: '芯源微电子与海州新能源汽车集团签署联合开发协议', date: '2026-08-11', org: '合作新闻', summary: '双方围绕车规芯片联合验证、供应链协同和本地化配套开展合作，形成明确的下游客户协同信号。', url: 'https://www.gov.cn/' },
      { title: '芯源微电子与海州大学共建汽车芯片联合实验室', date: '2026-07-18', org: '高校与企业公告', summary: '合作聚焦车规芯片可靠性、工艺验证和工程人才培养，有利于支撑区域研发中心建设。', url: 'https://www.gov.cn/' }
    ],
    capital: [
      { title: '产业基金完成对芯源微电子 3.2 亿元增资', date: '2026-07-29', org: '企业公告', summary: '本轮增资主要用于研发投入、产能建设及流动资金补充，为后续扩张提供资本支持。', url: 'https://www.cninfo.com.cn/new/index' }
    ],
    capacityBuild: [
      { title: '芯源微电子取得海州高新区 180 亩工业用地', date: '2026-08-22', org: '自然资源交易公示', summary: '工业用地用途与集成电路制造项目相符，拟用于特色工艺产线及配套设施建设。', url: 'https://www.mnr.gov.cn/' },
      { title: '功率器件测试设备采购项目招标公告', date: '2026-08-12', org: '公开招投标信息', summary: '采购内容涵盖功率器件测试与可靠性验证设备，项目规模与现有产品线扩充方向一致。', url: 'https://www.ccgp.gov.cn/' },
      { title: '特色工艺晶圆产线开工建设', date: '2026-08-02', org: '项目建设公示', summary: '新建产线规划覆盖晶圆制造、测试验证和智能仓储，预计分两期形成新增产能。', url: 'https://www.ndrc.gov.cn/' }
    ]
  };

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function findSection(names) {
    if (!Array.isArray(names)) names = [names];
    var sections = document.querySelectorAll('#dueEvidenceReportV99 .due-evidence-section-v99');
    for (var i = 0; i < sections.length; i += 1) {
      var heading = sections[i].querySelector('h2');
      if (heading && names.indexOf(heading.textContent.trim()) >= 0) return sections[i];
    }
    return null;
  }

  function markEnterpriseLibrary(section) {
    if (!section) return;
    var state = section.querySelector('.due-section-state-v99');
    if (state) {
      state.textContent = '基本来自企业库';
      state.className = 'due-section-state-v99';
    }
  }

  function enhanceSourceLabels() {
    markEnterpriseLibrary(findSection('企业主体与基础画像'));
    markEnterpriseLibrary(findSection('股东、实控与资本结构'));
    markEnterpriseLibrary(findSection(['技术实力与市场地位', '技术、知识产权与市场地位']));
  }

  function enhanceRisk() {
    var section = findSection(['信用与司法风险', '信用、司法与园区准入风险']);
    if (!section) return;
    var table = section.querySelector('.due-risk-table-v99');
    if (table) table.innerHTML = '<thead><tr><th>风险维度</th><th>企业库记录</th><th>判断</th><th>数据状态</th></tr></thead><tbody>' +
      '<tr><td>严重违法 / 失信执行</td><td>未发现相关记录</td><td class="due-positive-v99">未发现重大红线</td><td>企业库已归集</td></tr>' +
      '<tr><td>司法诉讼</td><td>4 起一般合同纠纷</td><td class="due-warning-v99">需关注案件进展</td><td>企业库有记录</td></tr>' +
      '<tr><td>劳动纠纷</td><td>未发现相关记录</td><td class="due-positive-v99">未发现用工合规异常</td><td>企业库已归集</td></tr>' +
      '<tr><td>行政处罚</td><td>1 条，已完成整改</td><td class="due-warning-v99">一般关注</td><td>企业库有记录</td></tr>' +
      '<tr><td>环保处罚</td><td>近三年无处罚记录</td><td class="due-positive-v99">未发现环保红线</td><td>企业库已归集</td></tr>' +
      '<tr><td>安全生产处罚</td><td>近三年无处罚记录</td><td class="due-positive-v99">未发现安全生产红线</td><td>企业库已归集</td></tr>' +
      '</tbody>';
    var analysis = section.querySelector('.due-analysis-v99 p');
    if (analysis) analysis.textContent = '企业库当前未发现严重违法、失信执行、环保处罚或安全生产处罚等重大准入红线。一般合同纠纷、劳动争议和历史行政处罚均有记录，建议在正式接洽前确认案件结案、整改及潜在用工合规影响。';
  }

  function signalCard(label, value, key, strength) {
    return '<article><span>' + esc(label) + '</span><b>' + esc(value) + '</b><em>' + esc(strength) + '</em><button type="button" class="due-news-link-v101" onclick="openDueNewsListV103(\'' + key + '\')">查看新闻详情 ↗</button></article>';
  }

  function ensureNewsModal() {
    if (document.getElementById('dueNewsListModalV101')) return;
    document.body.insertAdjacentHTML('beforeend', '<div class="prototype-modal-backdrop due-news-modal-v101" id="dueNewsListModalV101" aria-hidden="true"><section class="prototype-modal" role="dialog" aria-modal="true"><header><div><label>ONLINE NEWS TRACE</label><h2 id="dueNewsListTitleV101">相关新闻与公告</h2><p>标题、发布时间、摘要与原文链接均可追溯</p></div><button type="button" onclick="closeDueNewsListV101()">×</button></header><div class="prototype-modal-body"><div class="due-news-list-v101" id="dueNewsListBodyV101"></div></div><footer><button class="secondary" type="button" onclick="closeDueNewsListV101()">关闭</button></footer></section></div>');
  }

  window.openDueNewsListV103 = function (key) {
    ensureNewsModal();
    var items = newsGroupsV103[key] || [];
    var title = document.getElementById('dueNewsListTitleV101');
    var body = document.getElementById('dueNewsListBodyV101');
    if (title) title.textContent = items.length > 1 ? '相关信号新闻（' + items.length + ' 条）' : '新闻详情';
    if (body) body.innerHTML = items.map(function (item) {
      return '<a href="' + esc(item.url) + '" target="_blank" rel="noopener" class="due-news-item-v101"><header><div><b>' + esc(item.title) + '</b><span>' + esc(item.org) + ' · ' + esc(item.date) + '</span></div><em>查看原文 ↗</em></header><p>' + esc(item.summary) + '</p></a>';
    }).join('');
    var modal = document.getElementById('dueNewsListModalV101');
    if (modal) { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); }
  };

  function enhanceExpansion() {
    var section = findSection(['扩张意愿与投融资信号', '扩展意愿与落地诉求', '扩张意愿与落地条件']);
    if (!section) return;
    var heading = section.querySelector('h2');
    if (heading) heading.textContent = '扩张意愿与投融资信号';
    var subtitle = section.querySelector('.due-section-title-v99 p');
    if (subtitle) subtitle.textContent = '基于招聘、投资建厂、新品发布、合作签约、融资及产能建设新闻识别企业扩张窗口';
    var state = section.querySelector('.due-section-state-v99');
    if (state) { state.textContent = '联网'; state.className = 'due-section-state-v99 inference'; }
    var signals = section.querySelector('.due-landing-signals-v99');
    if (signals) signals.innerHTML =
      signalCard('近 90 天招聘变化', '工程及量产岗位 +18%', 'recruit', '中等强度信号') +
      signalCard('投资建厂', '考察第二生产基地并设立区域分公司', 'investment', '强信号') +
      signalCard('新产品发布', '发布新一代车规级 MCU XMC9000', 'product', '强信号') +
      signalCard('新合作', '签署联合开发协议并共建实验室', 'cooperation', '强信号') +
      signalCard('融资与资本动作', '产业基金增资 3.2 亿元', 'capital', '强信号') +
      signalCard('产能建设', '购地、采购设备并新建特色工艺产线', 'capacityBuild', '强信号');
    var analysis = section.querySelector('.due-analysis-v99 p');
    if (analysis) analysis.textContent = '招聘扩容、投资建厂、新产品发布、新合作、产业基金增资与产能建设动作形成一致的扩张组合信号，建议进入招商初步关注。接洽阶段应重点确认生产基地投资计划、分公司功能定位、新产品量产节奏、合作订单转化及产线建设进度。';
  }

  function updateAnnotations() {
    if (typeof prototypeLogicAnnotations === 'undefined' || !prototypeLogicAnnotations.dueReport) return;
    var fields = prototypeLogicAnnotations.dueReport.fields || [];
    fields = fields.filter(function (item) { return item[0] !== '信用与司法风险维度' && item[0] !== '扩张意愿信号'; });
    fields.push(['信用与司法风险维度', '分别展示司法诉讼、劳动纠纷、行政处罚、环保处罚和安全生产处罚，避免将不同准入风险合并判断。', '企业库信用与司法风险记录', '随企业库更新']);
    fields.push(['扩张意愿信号', '综合招聘、投资建厂、新产品、新合作、融资及购地、设备采购、新建产线等公开新闻形成扩张组合判断。', '新闻舆情库、企业公告、工商与项目公示', '报告生成时联网检索']);
    prototypeLogicAnnotations.dueReport.fields = fields;
  }

  function enhanceV103() {
    if (!document.getElementById('dueEvidenceReportV99')) return;
    enhanceSourceLabels();
    enhanceRisk();
    enhanceExpansion();
    updateAnnotations();
  }

  function init() {
    setTimeout(enhanceV103, 210);
    var previous = window.openDueReport;
    if (typeof previous === 'function' && !previous.__dueV103) {
      var wrapped = function () {
        var result = previous.apply(this, arguments);
        setTimeout(enhanceV103, 230);
        return result;
      };
      wrapped.__dueV103 = true;
      window.openDueReport = wrapped;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

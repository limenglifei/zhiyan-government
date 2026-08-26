(function () {
  'use strict';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  var traceSources = {
    status: { title: '经营状态联网核验', source: '国家企业信用信息公示系统', time: '2026-08-26 09:42', url: 'https://www.gsxt.gov.cn/', detail: '按企业名称与统一社会信用代码双重核验，当前登记状态为“存续”。' },
    address: { title: '注册地址联网核验', source: '国家企业信用信息公示系统', time: '2026-08-26 09:42', url: 'https://www.gsxt.gov.cn/', detail: '注册地址来自企业登记公示信息，招商接洽前建议再次核验实际经营地址。' },
    contact: { title: '公开联系方式溯源', source: '企业官网与公开披露', time: '2026-08-26 09:45', url: 'https://www.cninfo.com.cn/new/index', detail: '联系电话和邮箱来自企业官网、公告及公开披露信息交叉核验。' },
    customers: { title: '主要客户关系溯源', source: '企业公告、政府采购与公开招投标', time: '2026-08-26 09:53', url: 'https://www.ccgp.gov.cn/', detail: '客户关系由公告披露、采购中标与公开合作新闻交叉验证，不代表完整客户清单。' },
    suppliers: { title: '主要供应商关系溯源', source: '企业公告、采购招标与供应链新闻', time: '2026-08-26 09:56', url: 'https://www.ccgp.gov.cn/', detail: '供应商关系为公开信息推断，正式尽调时需企业提供经审计采购明细。' },
    market: { title: '市场地位联网溯源', source: '行业研究、客户进入公告与企业公开信息', time: '2026-08-26 10:02', url: 'https://www.miit.gov.cn/', detail: '行业梯队和市场份额为公开研究与出货信号综合研判，需第三方报告进一步核验。' },
    credit: { title: '纳税信用联网核验', source: '税务公开信息与企业信用报告', time: '2026-08-26 10:08', url: 'https://www.chinatax.gov.cn/', detail: '当前公开信息显示纳税信用等级为 A 级，具体年度以主管税务机关出具结果为准。' },
    arrears: { title: '欠税公告联网核验', source: '国家税务总局欠税公告', time: '2026-08-26 10:09', url: 'https://www.chinatax.gov.cn/', detail: '按企业主体检索近三年欠税公告，当前未返回相关记录。' }
  };

  var newsSources = {
    recruit: { title: '芯源微电子启动新一轮工程及量产岗位招聘', org: '企业官网 / 招聘公开信息', date: '2026-08-18', url: 'https://www.example.com/', summary: '近 90 天工程、工艺及量产岗位发布数量较上一周期增长约 18%，显示产能与研发团队扩充信号。' },
    equipment: { title: '功率器件测试设备采购项目招标公告', org: '公开招投标信息', date: '2026-08-12', url: 'https://www.ccgp.gov.cn/', summary: '新增测试设备采购与现有功率器件业务相关，属于较强的产线扩充信号。' },
    capital: { title: '产业基金完成对芯源微电子 3.2 亿元增资', org: '企业公告 / 工商变更', date: '2026-07-29', url: 'https://www.cninfo.com.cn/new/index', summary: '本轮增资用途涉及研发投入与产能建设，为企业扩展计划提供资金支撑。' },
    layout: { title: '芯源微电子调研长三角第二生产基地选址', org: '产业新闻舆情库', date: '2026-07-21', url: 'https://www.gov.cn/', summary: '公开报道提及企业正在调研长三角区域新基地，但投资规模和最终选址尚未正式披露。' },
    capacity: { title: '芯源微电子披露未来产能规划', org: '企业公告 / 投资者交流', date: '2026-06-30', url: 'https://www.cninfo.com.cn/new/index', summary: '企业公开表述计划在 2027 年前形成新增特色工艺产能，具体投资节奏仍需访谈确认。' }
  };

  function onlineButton(key, label) {
    return '<button type="button" class="due-online-source-v100" onclick="openDueTraceV100(\'' + key + '\')"><i>联</i>' + esc(label || '联网查询') + '</button>';
  }

  function fact(label, value, options) {
    options = options || {};
    var cls = options.className ? ' ' + options.className : '';
    var trace = options.trace ? onlineButton(options.trace, options.traceLabel) : '';
    return '<div class="due-fact-v99' + cls + '"><dt>' + esc(label) + '</dt><dd>' + value + trace + '</dd></div>';
  }

  function findSection(name) {
    var sections = document.querySelectorAll('#dueEvidenceReportV99 .due-evidence-section-v99');
    for (var i = 0; i < sections.length; i += 1) {
      var h2 = sections[i].querySelector('h2');
      if (h2 && h2.textContent.trim() === name) return sections[i];
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
    var currentCompanyNode = document.getElementById('dueSummaryCompany');
    var currentCompany = currentCompanyNode ? currentCompanyNode.textContent.trim() : '芯源微电子科技股份有限公司';
    replaceFacts(section,
      fact('企业全称', currentCompany, { className: 'wide' }) +
      fact('统一社会信用代码', '91320594MA1M7X9J6R') +
      fact('经营状态', '存续', { trace: 'status' }) +
      fact('法定代表人', '陈启明') +
      fact('注册资本 / 实缴资本', '68,000 万元 / 54,230 万元') +
      fact('成立日期', '2016-08-19') +
      fact('企业类型', '股份有限公司') +
      fact('所属国民经济行业', '计算机、通信和其他电子设备制造业（C39）', { className: 'wide' }) +
      fact('社保人数', '1,364 人') +
      fact('注册地址', '江苏省苏州市工业园区星湖街 218 号', { trace: 'address', className: 'wide' }) +
      fact('联系电话 / 邮箱', '0512-6688-2106 / bd@xinyuan-micro.cn', { trace: 'contact', className: 'wide' }) +
      fact('主营产品 / 服务', '车规级 MCU、功率器件、晶圆制造及相关技术服务', { className: 'full' })
    );
  }

  function enhanceChain() {
    var section = findSection('产业链定位与关联度');
    if (!section) return;
    replaceFacts(section,
      fact('所属产业链', '新能源汽车产业链 / 集成电路产业链', { className: 'wide' }) +
      fact('核心挂靠节点', '车规级 MCU、功率半导体', { className: 'wide' }) +
      fact('产业链环节', '中游核心器件与制造') +
      fact('节点关系强度', '92%') +
      fact('企业重要程度', '重点补强企业') +
      fact('主要上游', '晶圆材料、封测设备、EDA / IP 服务', { className: 'wide' }) +
      fact('主要下游', '整车、汽车电子、储能及工业控制', { className: 'wide' }) +
      fact('主要客户（3 家）', '<ul class="due-relation-list-v100"><li>华东新能源汽车集团</li><li>海州智控科技有限公司</li><li>启明汽车电子股份有限公司</li></ul>', { trace: 'customers', className: 'wide' }) +
      fact('主要供应商（3 家）', '<ul class="due-relation-list-v100"><li>长晶半导体材料有限公司</li><li>华芯封测设备股份有限公司</li><li>凌云 EDA 技术有限公司</li></ul>', { trace: 'suppliers', className: 'wide' })
    );
  }

  function enhanceInnovation() {
    var section = findSection('技术、知识产权与市场地位');
    if (!section) return;
    section.querySelector('h2').textContent = '技术实力与市场地位';
    var subtitle = section.querySelector('.due-section-title-v99 p');
    if (subtitle) subtitle.textContent = '从专利结构、研发投入、知识产权及细分市场表现综合研判';
    replaceFacts(section,
      fact('专利总数', '286 项') +
      fact('发明专利授权', '116 项') +
      fact('实用新型专利', '92 项') +
      fact('外观设计专利', '18 项') +
      fact('近三年新增专利', '84 项') +
      fact('软件著作权', '38 项') +
      fact('注册商标', '27 项') +
      fact('研发人员', '428 人，占员工 31.4%') +
      fact('荣誉资质', '高新技术企业、专精特新“小巨人”', { className: 'wide' }) +
      fact('市场份额 / 行业梯队', '车规级 MCU 国内第二梯队，细分份额约 3.8%', { trace: 'market', className: 'wide' })
    );
  }

  function enhanceRisk() {
    var section = findSection('信用、司法与园区准入风险');
    if (!section) return;
    section.querySelector('h2').textContent = '信用与司法风险';
    var subtitle = section.querySelector('.due-section-title-v99 p');
    if (subtitle) subtitle.textContent = '围绕信用、税务、司法执行与行政处罚识别一票否决风险';
    var table = section.querySelector('.due-risk-table-v99');
    if (table) table.outerHTML = '<div class="due-risk-summary-v100">' +
      fact('纳税信用等级', 'A 级', { trace: 'credit' }) +
      fact('欠税公告数量', '0 条', { trace: 'arrears' }) +
      fact('欠税总金额（万元）', '0', { trace: 'arrears' }) +
      '</div><table class="due-risk-table-v99"><thead><tr><th>风险维度</th><th>检索结果</th><th>判断</th><th>状态</th></tr></thead><tbody>' +
      '<tr><td>严重违法 / 失信执行</td><td>已查询，未返回相关记录</td><td class="due-positive-v99">未发现重大红线</td><td>' + onlineButton('credit', '联网核验') + '</td></tr>' +
      '<tr><td>司法诉讼</td><td>4 起一般合同纠纷</td><td class="due-warning-v99">需核验最新进展</td><td>有记录</td></tr>' +
      '<tr><td>行政处罚</td><td>1 条，公开信息显示已整改</td><td class="due-warning-v99">一般关注</td><td>有记录</td></tr>' +
      '<tr><td>环保 / 安全生产</td><td>近三年未返回处罚记录</td><td class="due-positive-v99">暂未发现红线</td><td>' + onlineButton('status', '联网核验') + '</td></tr>' +
      '</tbody></table>';
  }

  function newsCard(label, value, key, strength) {
    var news = newsSources[key];
    return '<article><span>' + esc(label) + '</span><b>' + esc(value) + '</b><em>' + esc(strength) + '</em><a href="#" onclick="openDueNewsTraceV100(\'' + key + '\');return false">查看新闻详情 ↗</a></article>';
  }

  function enhanceExpansion() {
    var section = findSection('扩张意愿与落地条件');
    if (!section) return;
    section.querySelector('h2').textContent = '扩展意愿与落地诉求';
    var subtitle = section.querySelector('.due-section-title-v99 p');
    if (subtitle) subtitle.textContent = '以公开扩展信号判断招商窗口，以企业访谈确认真实落地诉求';
    var signals = section.querySelector('.due-landing-signals-v99');
    if (signals) signals.innerHTML =
      newsCard('近 90 天招聘变化', '工程及量产岗位 +18%', 'recruit', '联网信号 · 中等强度') +
      newsCard('设备 / 产线招标', '新增功率器件测试设备采购', 'equipment', '公开招投标 · 强信号') +
      newsCard('融资与资本动作', '产业基金增资 3.2 亿元', 'capital', '公告披露 · 强信号') +
      newsCard('异地布局动态', '调研长三角第二生产基地', 'layout', '新闻舆情 · 待核验') +
      newsCard('预计投资时间', '2027 年前形成新产能', 'capacity', '公开表述推断') +
      '<article><span>用地 / 厂房 / 用工诉求</span><b>暂无可靠公开值</b><em>需企业访谈确认</em><button type="button" class="due-manual-note-v100" onclick="typeof toast===\'function\'&&toast(\'已加入招商访谈核验清单\')">加入访谈核验</button></article>';
  }

  function removeHeavySources() {
    document.querySelectorAll('#dueReport .due-data-coverage-v99,#dueReport .due-source-footer-v99,#dueReport .due-summary-provenance-v99').forEach(function (node) { node.remove(); });
    document.querySelectorAll('#dueReport .due-field-origin-v99').forEach(function (node) { node.remove(); });
    var tags = document.querySelectorAll('#dueReport .due-report-tags span');
    tags.forEach(function (tag) { if (tag.textContent.indexOf('扩张意愿') >= 0) tag.textContent = tag.textContent.replace('扩张意愿', '扩展意愿'); });
  }

  function ensureTraceModal() {
    if (document.getElementById('dueTraceModalV100')) return;
    document.body.insertAdjacentHTML('beforeend', '<div class="prototype-modal-backdrop due-trace-modal-v100" id="dueTraceModalV100" aria-hidden="true"><section class="prototype-modal" role="dialog" aria-modal="true"><header><div><label>ONLINE TRACE</label><h2 id="dueTraceTitleV100">联网信息溯源</h2><p id="dueTraceMetaV100"></p></div><button type="button" onclick="closeDueTraceV100()">×</button></header><div class="prototype-modal-body" id="dueTraceBodyV100"></div><footer><button class="secondary" type="button" onclick="closeDueTraceV100()">关闭</button><a class="primary due-trace-origin-v100" id="dueTraceOriginV100" href="#" target="_blank" rel="noopener">打开原始来源 ↗</a></footer></section></div>');
  }

  window.openDueTraceV100 = function (key) {
    ensureTraceModal();
    var item = traceSources[key] || traceSources.status;
    document.getElementById('dueTraceTitleV100').textContent = item.title;
    document.getElementById('dueTraceMetaV100').textContent = item.source + ' · 查询时间 ' + item.time;
    document.getElementById('dueTraceBodyV100').innerHTML = '<div class="due-trace-detail-v100"><span>联网查询结果</span><p>' + esc(item.detail) + '</p><dl><div><dt>来源机构</dt><dd>' + esc(item.source) + '</dd></div><div><dt>核验状态</dt><dd>已完成联网核验</dd></div><div><dt>数据时效</dt><dd>' + esc(item.time) + '</dd></div><div><dt>使用说明</dt><dd>招商决策前建议人工复核</dd></div></dl></div>';
    document.getElementById('dueTraceOriginV100').href = item.url;
    var modal = document.getElementById('dueTraceModalV100');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  };

  window.openDueNewsTraceV100 = function (key) {
    ensureTraceModal();
    var item = newsSources[key] || newsSources.layout;
    document.getElementById('dueTraceTitleV100').textContent = item.title;
    document.getElementById('dueTraceMetaV100').textContent = item.org + ' · ' + item.date + ' · 新闻舆情库';
    document.getElementById('dueTraceBodyV100').innerHTML = '<article class="due-news-detail-v100"><span>AI 摘要</span><p>' + esc(item.summary) + '</p><h3>溯源说明</h3><p>该信息作为企业扩展意愿的辅助判断，不等同于企业正式投资承诺。点击“打开原始来源”可继续核验原文。</p></article>';
    document.getElementById('dueTraceOriginV100').href = item.url;
    var modal = document.getElementById('dueTraceModalV100');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  };

  window.closeDueTraceV100 = function () {
    var modal = document.getElementById('dueTraceModalV100');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  };

  function updateAnnotation() {
    if (typeof prototypeLogicAnnotations === 'undefined' || !prototypeLogicAnnotations.dueReport) return;
    prototypeLogicAnnotations.dueReport.interactions = (prototypeLogicAnnotations.dueReport.interactions || []).filter(function (item) { return item[0] !== '查看证据链'; });
    if (!prototypeLogicAnnotations.dueReport.interactions.some(function (item) { return item[0] === '联网信息溯源'; })) {
      prototypeLogicAnnotations.dueReport.interactions.push(['联网信息溯源', '仅联网补充字段显示“联网查询”标识；点击标识或扩展意愿指标下方的“查看新闻详情”。', '弹出来源、查询时间与核验说明，并可打开原始网页；普通企业库字段不重复展示来源。']);
    }
  }

  function enhanceReport() {
    if (!document.getElementById('dueEvidenceReportV99')) return;
    removeHeavySources();
    enhanceBasic();
    enhanceChain();
    enhanceInnovation();
    enhanceRisk();
    enhanceExpansion();
    ensureTraceModal();
    updateAnnotation();
  }

  function init() {
    setTimeout(enhanceReport, 30);
    var previous = window.openDueReport;
    if (typeof previous === 'function' && !previous.__dueV100) {
      var wrapped = function () {
        var result = previous.apply(this, arguments);
        setTimeout(enhanceReport, 60);
        return result;
      };
      wrapped.__dueV100 = true;
      window.openDueReport = wrapped;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

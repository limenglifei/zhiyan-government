(function () {
  'use strict';

  var DISCLAIMER = '报告基于公开新闻信息、企业库工商 / 财务 / 司法信息、产业数据库与招商适配模型自动生成，仅供初步筛查 / 立项前浏览 / 推介前准备场景，关键结论建议人工复核';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function findSection(title) {
    var sections = document.querySelectorAll('#dueEvidenceReportV99 .due-evidence-section-v99');
    for (var i = 0; i < sections.length; i += 1) {
      var heading = sections[i].querySelector('h2');
      if (heading && heading.textContent.trim() === title) return sections[i];
    }
    return null;
  }

  function updateDisclaimer() {
    var note = document.querySelector('#dueReport .due-report-head > div:first-child > p');
    if (note) note.textContent = DISCLAIMER;
  }

  function updateSummary() {
    var summary = document.querySelector('#dueReport .due-report-summary > div:nth-child(2)');
    if (!summary) return;
    var currentName = document.getElementById('dueSummaryCompany');
    var company = currentName ? currentName.textContent.trim() : ((typeof currentDueCompany !== 'undefined' && currentDueCompany) || '芯源微电子科技股份有限公司');
    summary.innerHTML = '<h2>执行摘要</h2>' +
      '<p><b id="dueSummaryCompany">' + esc(company) + '</b> 主营车规级 MCU、功率器件及晶圆制造，是国家高新技术企业和国家级专精特新“小巨人”。企业 2025 年营业收入 <b>38.6 亿元</b>，上年度纳税总额 <b>2.18 亿元</b>，纳税信用等级为 <b>A 级</b>；三年营业收入、利润与纳税贡献持续增长，经营质量和区域税收贡献能力较强。</p>' +
      '<p>综合工商、财务、司法、知识产权、产业链关系及公开新闻信号研判，企业与海州市车规级芯片及功率器件薄弱节点高度匹配，具备产能扩张和区域研发中心落地信号。当前未发现重大失信、环保或安全生产红线；建议在正式接洽前重点核验新产线资本开支、总负债增长、环保验收、用能指标及核心人才配套。综合建议评级 <b>A</b>，纳入招商重点跟进。</p>' +
      '<div class="due-report-tags"><span>产业适配 94%</span><span>扩张意愿 86%</span><span>技术创新 93%</span><span>财务能力 85%</span><span>风险合规 88%</span></div>';
  }

  function updateFinance() {
    var section = findSection('经营与财务健康度');
    if (!section) return;
    var state = section.querySelector('.due-section-state-v99');
    if (state) {
      state.textContent = '来自公开年报、联网搜索';
      state.className = 'due-section-state-v99 online-v101';
    }
    var table = section.querySelector('.due-trend-table-v99');
    if (table) {
      table.innerHTML = '<thead><tr><th>指标</th><th>2023 年</th><th>2024 年</th><th>2025 年</th><th>趋势判断</th></tr></thead><tbody>' +
        '<tr><td>营业收入</td><td>24.1 亿元</td><td>31.2 亿元</td><td>38.6 亿元</td><td class="due-positive-v99">连续增长</td></tr>' +
        '<tr><td>利润总额</td><td>2.46 亿元</td><td>3.28 亿元</td><td>4.32 亿元</td><td class="due-positive-v99">盈利改善</td></tr>' +
        '<tr><td>净利润</td><td>1.98 亿元</td><td>2.71 亿元</td><td>3.68 亿元</td><td class="due-positive-v99">质量较好</td></tr>' +
        '<tr><td>总资产</td><td>68.4 亿元</td><td>78.2 亿元</td><td>89.6 亿元</td><td class="due-positive-v99">资产扩张</td></tr>' +
        '<tr><td>总负债</td><td>39.9 亿元</td><td>46.7 亿元</td><td>54.8 亿元</td><td class="due-warning-v99">随扩产增长</td></tr>' +
        '<tr><td>资产负债率</td><td>58.4%</td><td>59.7%</td><td>61.2%</td><td class="due-warning-v99">资本开支推升</td></tr>' +
        '<tr><td>纳税总额</td><td>1.26 亿元</td><td>1.68 亿元</td><td>2.18 亿元</td><td class="due-positive-v99">贡献持续提升</td></tr>' +
        '</tbody>';
    }
    var analysis = section.querySelector('.due-analysis-v99 p');
    if (analysis) analysis.textContent = '企业近三年营业收入、利润和纳税总额保持同步增长，2025 年营业收入 38.6 亿元、纳税总额 2.18 亿元，经营规模与税收贡献能力较强。总资产扩张至 89.6 亿元，总负债随产能建设增至 54.8 亿元，资产负债率升至 61.2%；建议在正式尽调阶段进一步核验债务期限结构、经营性现金流和新增产能回报周期。';
  }

  function updateAnnotations() {
    if (typeof prototypeLogicAnnotations === 'undefined' || !prototypeLogicAnnotations.dueReport) return;
    var fields = prototypeLogicAnnotations.dueReport.fields || [];
    fields = fields.filter(function (item) { return item[0] !== '执行摘要经营指标' && item[0] !== '经营与财务健康度'; });
    fields.push(['执行摘要经营指标', '集中展示最近年度营业收入、纳税总额和纳税信用等级，并结合产业适配与风险信息形成初筛结论。', '企业库财务与税务字段、公开年报', '随报告数据快照更新']);
    fields.push(['经营与财务健康度', '展示三年营业收入、利润、总资产、总负债、资产负债率和纳税总额，不再使用参保人数作为财务健康度指标。', '企业库财务字段、公开年报、联网搜索', '年度更新']);
    prototypeLogicAnnotations.dueReport.fields = fields;
  }

  function enhanceV102() {
    updateDisclaimer();
    if (!document.getElementById('dueEvidenceReportV99')) return;
    updateSummary();
    updateFinance();
    updateAnnotations();
  }

  function init() {
    setTimeout(enhanceV102, 150);
    var previous = window.openDueReport;
    if (typeof previous === 'function' && !previous.__dueV102) {
      var wrapped = function () {
        var result = previous.apply(this, arguments);
        setTimeout(enhanceV102, 170);
        return result;
      };
      wrapped.__dueV102 = true;
      window.openDueReport = wrapped;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

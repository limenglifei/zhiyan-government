(function () {
  'use strict';

  var applyingV104 = false;
  var observerV104 = null;
  var applyFrameV104 = null;
  var downloadVersionV104 = '当前版本';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function safeUrl(value) {
    var url = String(value || '');
    return /^https?:\/\//i.test(url) ? url : '#';
  }

  function normalize(value) {
    return String(value || '').replace(/[\s（）()\/]/g, '').replace(/服务$/, '服务').trim();
  }

  var evidenceV104 = {
    products: {
      title: '主营产品 / 服务 · 联网信源',
      summary: '系统对企业库主营产品进行联网补充与交叉核验。以下仅展示与主营产品直接相关的原文片段，最多 3 条。',
      sources: [
        {
          sourceType: '企业官网',
          sourceName: '企业官网 · 产品与解决方案',
          title: '车规级 MCU 与功率器件产品矩阵',
          publishedAt: '2026-08-16',
          excerpt: '“公司现有产品覆盖车规级 MCU、IGBT / SiC 功率器件及特色工艺晶圆制造，并面向新能源汽车域控制、智能座舱、储能和工业控制提供配套技术服务。”',
          url: 'https://www.cninfo.com.cn/new/fulltextSearch?keyWord=%E8%8A%AF%E6%BA%90%E5%BE%AE%E7%94%B5%E5%AD%90'
        },
        {
          sourceType: '企业信息平台',
          sourceName: '企查查 · 企业经营信息',
          title: '经营范围与产品关键词核验',
          publishedAt: '2026-08-25',
          excerpt: '“公开经营信息包含集成电路设计、功率半导体器件制造、晶圆加工、汽车电子芯片技术开发及相关技术服务，与企业库主营产品方向一致。”',
          url: 'https://www.qcc.com/web/search?key=%E8%8A%AF%E6%BA%90%E5%BE%AE%E7%94%B5%E5%AD%90'
        },
        {
          sourceType: '行业调研报告',
          sourceName: '赛迪顾问 · 车规芯片产业研究',
          title: '2026 中国车规级芯片产业发展研究',
          publishedAt: '2026-07-30',
          excerpt: '“样本企业已形成 MCU、功率器件与特色工艺制造协同布局，其中车规级 MCU 产品进入多家整车及汽车电子客户验证阶段。”',
          url: 'https://www.ccidgroup.com/'
        }
      ]
    },
    market: {
      title: '市场份额 / 行业梯队 · 来源资料',
      summary: '市场份额与行业梯队来自公开研究资料和客户导入信息，不等同于审计或监管认定；招商接洽前建议补充第三方正式报告。',
      sources: [
        {
          sourceType: '行业研究',
          sourceName: '赛迪顾问',
          title: '2026 中国车规级 MCU 市场竞争格局',
          publishedAt: '2026-07-30',
          excerpt: '“按 2025 年中国大陆车规级 MCU 销售额口径测算，样本企业细分市场份额约 3.8%，处于国产厂商第二梯队。”',
          url: 'https://www.ccidgroup.com/'
        },
        {
          sourceType: '行业协会',
          sourceName: '中国汽车工业协会',
          title: '汽车芯片国产化应用观察',
          publishedAt: '2026-06-18',
          excerpt: '“企业车规级 MCU 已进入多家新能源汽车和汽车电子客户验证及小批量供货环节，量产覆盖仍低于头部厂商。”',
          url: 'https://www.caam.org.cn/'
        },
        {
          sourceType: '客户公告',
          sourceName: '巨潮资讯 · 客户认证公告',
          title: '车规芯片供应商导入进展公告',
          publishedAt: '2026-05-26',
          excerpt: '“报告期内新增两家整车客户定点，相关产品处于批量导入阶段；该信息用于判断行业梯队，不直接代表全年市场份额。”',
          url: 'https://www.cninfo.com.cn/new/fulltextSearch?keyWord=%E8%BD%A6%E8%A7%84%E8%8A%AF%E7%89%87%E4%BE%9B%E5%BA%94%E5%95%86'
        }
      ]
    },
    control: {
      title: '控制权稳定性 · 联网核验',
      summary: '近两年发现 2 条股东进退记录，但实际控制人及控制权比例未发生实质变化，当前判断为“总体稳定”。',
      changes: [
        {
          date: '2025-11-18', type: '新增股东', tone: 'add',
          detail: '海州先进制造产业基金增资入股，持股 4.6%；新增股东不构成控股股东或实际控制人变更。',
          source: '市场监管变更公示', url: 'https://www.gsxt.gov.cn/'
        },
        {
          date: '2024-06-03', type: '股东退出', tone: 'exit',
          detail: '苏州创新投资合伙企业完成财务投资退出，退出前持股 2.1%；核心创始股东持股及表决权安排未变。',
          source: '企业工商变更记录', url: 'https://www.qcc.com/'
        }
      ]
    },
    team: {
      title: '核心团队背景 · 联网明细',
      summary: '团队信息来自企业官网、公告和公开履历，仅展示与企业经营及技术判断相关的公开职业信息。',
      people: [
        {
          name: '陈启明', role: '董事长 / CEO', education: '电子工程博士', experience: '半导体行业 19 年',
          resume: '曾任国内头部芯片企业车规产品事业部负责人，主导两代车规 MCU 量产及客户导入。',
          source: '企业官网管理团队、上市公告', url: 'https://www.cninfo.com.cn/new/fulltextSearch?keyWord=%E8%8A%AF%E6%BA%90%E5%BE%AE%E7%94%B5%E5%AD%90'
        },
        {
          name: '周欣怡', role: '董事 / CTO', education: '微电子学硕士', experience: '芯片研发 16 年',
          resume: '长期从事车规级 MCU 架构、功能安全和工艺平台研发，拥有多项发明专利。',
          source: '企业技术团队介绍、专利发明人公开信息', url: 'https://pss-system.cponline.cnipa.gov.cn/'
        },
        {
          name: '王致远', role: '生产运营副总裁', education: '材料工程硕士', experience: '晶圆制造 14 年',
          resume: '具备晶圆产线建设、设备导入和良率提升经验，曾负责两座特色工艺产线量产爬坡。',
          source: '企业公告、行业会议公开履历', url: 'https://www.miit.gov.cn/'
        }
      ]
    }
  };

  var relationV104 = {
    suppliers: {
      title: '主要供应商 · 采购与合作信源',
      note: '以下关系由采购公告、供应链合作新闻和企业公开披露识别，不代表完整供应商清单。',
      companies: [
        {
          name: '长晶半导体材料有限公司', relation: '上游晶圆材料供应商',
          news: [
            { title: '签订 12 英寸硅片年度框架采购协议', source: '企业采购公告', date: '2026-03-12', amount: '预计含税 3.6 亿元', cooperationDate: '2026—2028 年', content: '供应车规级 MCU 与功率器件所需 12 英寸硅片，并约定质量追溯和扩产保供机制。', url: 'https://www.ccgp.gov.cn/' },
            { title: '联合建设车规级材料验证线', source: '供应链合作新闻', date: '2025-12-05', amount: '项目投入约 4,800 万元', cooperationDate: '2025 年 12 月起', content: '共同开展硅片缺陷检测、工艺验证及国产材料导入。', url: 'https://www.miit.gov.cn/' }
          ]
        },
        {
          name: '华芯封测设备股份有限公司', relation: '封测与可靠性设备供应商',
          news: [
            { title: '功率器件测试设备采购项目中标公告', source: '公开招投标信息', date: '2026-02-26', amount: '中标金额 1.28 亿元', cooperationDate: '交付期 2026—2027 年', content: '提供功率器件测试、可靠性验证及自动化搬运设备，并承担产线联调。', url: 'https://www.ccgp.gov.cn/' }
          ]
        },
        {
          name: '凌云 EDA 技术有限公司', relation: 'EDA 与车规 IP 服务商',
          news: [
            { title: '签署车规芯片 EDA 与 IP 三年合作协议', source: '战略合作新闻', date: '2026-01-18', amount: '合同金额约 6,800 万元', cooperationDate: '2026—2028 年', content: '围绕车规 MCU 设计工具、功能安全 IP 和联合技术支持开展合作。', url: 'https://www.miit.gov.cn/' }
          ]
        }
      ]
    },
    customers: {
      title: '主要客户 · 采购与合作信源',
      note: '以下关系由客户公告、政府采购和合作新闻识别；金额与合作周期按公开披露口径展示。',
      companies: [
        {
          name: '华东新能源汽车集团', relation: '整车客户 / 车规 MCU 定点',
          news: [
            { title: '车规级 MCU 五年供应框架协议', source: '客户采购公告', date: '2026-04-08', amount: '预计采购金额 8.2 亿元', cooperationDate: '2026—2030 年', content: '用于新能源乘用车域控制与智能座舱平台，分阶段完成验证、定点和批量供货。', url: 'https://www.cninfo.com.cn/new/fulltextSearch?keyWord=%E8%BD%A6%E8%A7%84%E7%BA%A7MCU' },
            { title: '联合开展国产汽车芯片验证', source: '合作新闻', date: '2026-02-15', amount: '金额未披露', cooperationDate: '2026 年 2 月起', content: '双方建立联合验证机制，覆盖功能安全、可靠性和整车环境适配。', url: 'https://www.caam.org.cn/' }
          ]
        },
        {
          name: '海州智控科技有限公司', relation: '汽车电子控制器客户',
          news: [
            { title: '签署智能底盘控制芯片联合开发协议', source: '海州产业合作新闻', date: '2026-03-20', amount: '首期研发与采购约 1.6 亿元', cooperationDate: '2026—2029 年', content: '联合开发智能底盘控制器芯片方案，并优先在海州生产基地完成配套验证。', url: 'https://www.gov.cn/' }
          ]
        },
        {
          name: '启明汽车电子股份有限公司', relation: '汽车电子一级供应商',
          news: [
            { title: '功率器件批量采购及联合实验室合作', source: '企业公告', date: '2026-01-29', amount: '年度采购约 2.4 亿元', cooperationDate: '2026—2027 年', content: '采购 IGBT 与 SiC 功率器件，同时共建可靠性联合实验室。', url: 'https://www.cninfo.com.cn/' }
          ]
        }
      ]
    }
  };

  function findSectionV104(titles) {
    if (!Array.isArray(titles)) titles = [titles];
    var sections = document.querySelectorAll('#dueReport #dueEvidenceReportV99 .due-evidence-section-v99');
    for (var i = 0; i < sections.length; i += 1) {
      var heading = sections[i].querySelector('h2');
      if (heading && titles.indexOf(heading.textContent.trim()) >= 0) return sections[i];
    }
    return null;
  }

  function findFieldV104(section, labels) {
    if (!section) return null;
    if (!Array.isArray(labels)) labels = [labels];
    var targets = labels.map(normalize);
    var fields = section.querySelectorAll('.due-fact-v99');
    for (var i = 0; i < fields.length; i += 1) {
      var label = fields[i].querySelector('dt');
      var current = label ? normalize(label.textContent) : '';
      if (targets.some(function (target) { return current === target || current.indexOf(target) === 0; })) return fields[i];
    }
    return null;
  }

  function triggerHtmlV104(type, label, relation) {
    var action = relation
      ? "event.stopPropagation();openDueRelationEvidenceV104('" + relation + "')"
      : "event.stopPropagation();openDueEvidenceV104('" + type + "')";
    return '<button type="button" class="due-field-online-v104" data-due-v104="1" data-evidence-type="' + esc(type) + '" onclick="' + action + '"><i>联</i>' + esc(label) + '</button>';
  }

  function decorateFieldV104(section, labels, type, triggerLabel, options) {
    var field = findFieldV104(section, labels);
    if (!field || field.querySelector('[data-due-v104="1"]')) return;
    options = options || {};
    field.querySelectorAll('.due-online-source-v100').forEach(function (node) { node.remove(); });
    if (options.removeOldOrigin) {
      field.querySelectorAll('.due-field-origin-v99.online').forEach(function (node) { node.remove(); });
    }
    if (options.onlineOnly !== false) field.classList.add('due-online-only-v101');
    var value = field.querySelector('dd');
    if (value && options.valueText) value.textContent = options.valueText;
    if (value) value.insertAdjacentHTML('beforeend', triggerHtmlV104(type, triggerLabel, options.relation));
  }

  function ensureEvidenceModalV104() {
    if (document.getElementById('dueEvidenceModalV104')) return;
    document.body.insertAdjacentHTML('beforeend',
      '<div class="prototype-modal-backdrop due-evidence-modal-v104" id="dueEvidenceModalV104" aria-hidden="true" style="z-index:12080">' +
        '<section class="prototype-modal" role="dialog" aria-modal="true" aria-labelledby="dueEvidenceTitleV104">' +
          '<header><div><label>ONLINE SOURCE TRACE</label><h2 id="dueEvidenceTitleV104">联网信源明细</h2><p id="dueEvidenceMetaV104">来源片段与原始网页可追溯</p></div><button type="button" onclick="closeDueEvidenceV104()">×</button></header>' +
          '<div class="prototype-modal-body" id="dueEvidenceBodyV104"></div>' +
          '<footer><button class="secondary" type="button" onclick="closeDueEvidenceV104()">关闭</button></footer>' +
        '</section>' +
      '</div>');
    var modal = document.getElementById('dueEvidenceModalV104');
    modal.addEventListener('click', function (event) { if (event.target === modal) window.closeDueEvidenceV104(); });
  }

  function sourceCardsV104(items) {
    return '<div class="due-source-list-v104">' + items.slice(0, 3).map(function (item) {
      return '<article class="due-source-card-v104">' +
        '<span>' + esc(item.sourceType) + '</span>' +
        '<div><h3>' + esc(item.title) + '</h3><small>' + esc(item.sourceName) + ' · ' + esc(item.publishedAt) + '</small><p>' + esc(item.excerpt) + '</p></div>' +
        '<a href="' + esc(safeUrl(item.url)) + '" target="_blank" rel="noopener noreferrer">查看原文 ↗</a>' +
      '</article>';
    }).join('') + '</div>';
  }

  function controlChangesV104(item) {
    var changes = item.changes || [];
    var list = changes.length ? changes.map(function (change) {
      return '<article class="due-change-card-v104 ' + esc(change.tone) + '">' +
        '<time>' + esc(change.date) + '</time><strong>' + esc(change.type) + '</strong><span>' + esc(change.detail) + '</span>' +
        '<a href="' + esc(safeUrl(change.url)) + '" target="_blank" rel="noopener noreferrer">' + esc(change.source) + ' ↗</a>' +
      '</article>';
    }).join('') : '<div class="due-evidence-summary-v104"><b>查询结果</b><span>当前检索范围内暂无股东新增或退出记录；“暂无记录”不等于绝对无变更。</span></div>';
    return '<div class="due-change-list-v104">' + list + '</div>';
  }

  function teamCardsV104(item) {
    return '<div class="due-team-list-v104">' + (item.people || []).map(function (person) {
      return '<article class="due-team-card-v104"><header><h3>' + esc(person.name) + '</h3><span>' + esc(person.role) + '</span></header>' +
        '<dl><div><dt>学历</dt><dd>' + esc(person.education) + '</dd></div><div><dt>行业经验</dt><dd>' + esc(person.experience) + '</dd></div><div><dt>关键履历</dt><dd>' + esc(person.resume) + '</dd></div><div><dt>来源</dt><dd>' + esc(person.source) + '</dd></div></dl>' +
        '<a href="' + esc(safeUrl(person.url)) + '" target="_blank" rel="noopener noreferrer">查看原始来源 ↗</a></article>';
    }).join('') + '</div>';
  }

  window.openDueEvidenceV104 = function (type) {
    ensureEvidenceModalV104();
    var item = evidenceV104[type] || evidenceV104.products;
    document.getElementById('dueEvidenceTitleV104').textContent = item.title;
    document.getElementById('dueEvidenceMetaV104').textContent = type === 'team' ? '公开职业信息 · 最多展示 3 名核心人员' : '来源片段、发布时间与原始网页可追溯';
    var content = '<div class="due-evidence-summary-v104"><b>研判说明</b><span>' + esc(item.summary) + '</span></div>';
    if (item.sources) content += sourceCardsV104(item.sources);
    if (item.changes) content += controlChangesV104(item);
    if (item.people) content += teamCardsV104(item);
    document.getElementById('dueEvidenceBodyV104').innerHTML = content;
    var modal = document.getElementById('dueEvidenceModalV104');
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
  };

  window.closeDueEvidenceV104 = function () {
    var modal = document.getElementById('dueEvidenceModalV104');
    if (!modal) return;
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
  };

  function relationNewsHtmlV104(kind, index) {
    var group = relationV104[kind] || relationV104.suppliers;
    var company = group.companies[index] || group.companies[0];
    return '<div class="due-evidence-summary-v104"><b>使用说明</b><span>' + esc(group.note) + '</span></div>' +
      '<div class="due-relation-switch-v104">' + group.companies.map(function (entry, entryIndex) {
        return '<button type="button" class="' + (entryIndex === index ? 'active' : '') + '" aria-pressed="' + (entryIndex === index) + '" onclick="switchDueRelationV104(\'' + kind + '\',' + entryIndex + ')">' + esc(entry.name) + '</button>';
      }).join('') + '</div>' +
      '<div class="due-relation-company-v104"><b>' + esc(company.name) + '</b><span>' + esc(company.relation) + ' · 共 ' + company.news.length + ' 条公开信源</span></div>' +
      '<div class="due-relation-news-list-v104">' + company.news.map(function (news) {
        return '<article class="due-relation-news-v104"><header><div><h3>' + esc(news.title) + '</h3><small>' + esc(news.source) + ' · ' + esc(news.date) + '</small></div><a href="' + esc(safeUrl(news.url)) + '" target="_blank" rel="noopener noreferrer">查看原文 ↗</a></header>' +
          '<p><b>金额：</b>' + esc(news.amount) + '　<b>合作时间：</b>' + esc(news.cooperationDate) + '</p><p><b>合作内容：</b>' + esc(news.content) + '</p></article>';
      }).join('') + '</div>';
  }

  window.openDueRelationEvidenceV104 = function (kind) {
    ensureEvidenceModalV104();
    var group = relationV104[kind] || relationV104.suppliers;
    document.getElementById('dueEvidenceTitleV104').textContent = group.title;
    document.getElementById('dueEvidenceMetaV104').textContent = '选择不同企业，刷新对应采购与合作新闻';
    document.getElementById('dueEvidenceBodyV104').innerHTML = relationNewsHtmlV104(kind, 0);
    var modal = document.getElementById('dueEvidenceModalV104');
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
  };

  window.switchDueRelationV104 = function (kind, index) {
    var body = document.getElementById('dueEvidenceBodyV104');
    if (body) body.innerHTML = relationNewsHtmlV104(kind, Number(index) || 0);
  };

  function ensureDownloadModalV104() {
    if (document.getElementById('dueDownloadModalV104')) return;
    document.body.insertAdjacentHTML('beforeend',
      '<div class="prototype-modal-backdrop due-download-modal-v104" id="dueDownloadModalV104" aria-hidden="true" style="z-index:12080">' +
        '<section class="prototype-modal" role="dialog" aria-modal="true"><header><div><label>REPORT EXPORT</label><h2>选择报告格式</h2><p id="dueDownloadVersionV104">当前报告版本</p></div><button type="button" onclick="closeDueDownloadV104()">×</button></header>' +
        '<div class="prototype-modal-body"><div class="due-format-grid-v104">' +
          '<button class="due-format-card-v104" type="button" onclick="downloadDueReportV104(\'word\')"><i>W</i><b>Word 文档</b><span>下载可在 Microsoft Word 中打开的 .doc 文件，便于继续编辑。</span></button>' +
          '<button class="due-format-card-v104" type="button" onclick="downloadDueReportV104(\'pdf\')"><i>PDF</i><b>PDF 文档</b><span>打开报告打印视图，可在系统打印窗口中保存为 PDF。</span></button>' +
        '</div></div><footer><button class="secondary" type="button" onclick="closeDueDownloadV104()">取消</button></footer></section>' +
      '</div>');
    var modal = document.getElementById('dueDownloadModalV104');
    modal.addEventListener('click', function (event) { if (event.target === modal) window.closeDueDownloadV104(); });
  }

  function currentCompanyV104() {
    var node = document.getElementById('dueSummaryCompany');
    if (node && node.textContent.trim()) return node.textContent.trim();
    if (typeof window.currentDueCompany !== 'undefined' && window.currentDueCompany) return window.currentDueCompany;
    return '企业';
  }

  function currentVersionV104() {
    var title = document.getElementById('dueReportTitle');
    var match = title && title.textContent.match(/V\d+\.\d+/);
    return match ? match[0] : 'V3.0';
  }

  function exportBodyV104() {
    var holder = document.createElement('div');
    var summary = document.querySelector('#dueReport .due-report-summary');
    var report = document.getElementById('dueEvidenceReportV99');
    if (summary) holder.appendChild(summary.cloneNode(true));
    if (report) holder.appendChild(report.cloneNode(true));
    if ((document.getElementById('dueReport') || {}).classList && document.getElementById('dueReport').classList.contains('due-network-off')) {
      holder.querySelectorAll('.due-online-only-v101').forEach(function (node) { node.remove(); });
    }
    holder.querySelectorAll('button,.due-online-source-v100,.due-field-online-v104,.due-source-footer-v99').forEach(function (node) { node.remove(); });
    return holder.innerHTML;
  }

  function exportDocumentV104() {
    var company = currentCompanyV104();
    var version = downloadVersionV104 || currentVersionV104();
    var disclaimer = '报告基于公开新闻信息、企业库工商 / 财务 / 司法信息、产业数据库与招商适配模型自动生成，仅供初步筛查 / 立项前浏览 / 推介前准备场景，关键结论建议人工复核。';
    return '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(company) + '招商尽调报告</title><style>' +
      'body{font-family:"Microsoft YaHei",Arial,sans-serif;color:#1f334d;margin:32px;line-height:1.65}h1{font-size:24px;margin:0 0 8px}h2{font-size:18px;margin-top:26px;border-bottom:1px solid #dbe4ef;padding-bottom:8px}p,td,th,dt,dd{font-size:12px}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #dbe4ef;padding:7px;text-align:left}dl{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}dd{margin:3px 0 0}.meta{color:#6f7f92;font-size:11px;margin-bottom:18px}.notice{padding:10px 12px;background:#f6f8fb;border:1px solid #dce5ef;border-radius:6px;font-size:10px}.due-section-number-v99,.due-report-tags{display:none}article,section{break-inside:avoid}' +
      '</style></head><body><h1>' + esc(company) + '招商尽调报告</h1><div class="meta">报告版本：' + esc(version) + '　导出时间：' + esc(new Date().toLocaleString('zh-CN')) + '</div><div class="notice">' + esc(disclaimer) + '</div>' + exportBodyV104() + '</body></html>';
  }

  window.openDueDownloadMenuV104 = function (version) {
    ensureDownloadModalV104();
    downloadVersionV104 = version || currentVersionV104();
    document.getElementById('dueDownloadVersionV104').textContent = currentCompanyV104() + ' · ' + downloadVersionV104;
    var modal = document.getElementById('dueDownloadModalV104');
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
  };

  window.closeDueDownloadV104 = function () {
    var modal = document.getElementById('dueDownloadModalV104');
    if (!modal) return;
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
  };

  window.downloadDueReportV104 = function (format) {
    var company = currentCompanyV104().replace(/[\\/:*?"<>|]/g, '-');
    var html = exportDocumentV104();
    if (format === 'word') {
      var blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url; link.download = company + '-招商尽调报告-' + downloadVersionV104 + '.doc';
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      window.closeDueDownloadV104();
      if (typeof window.toast === 'function') window.toast('Word 报告已生成并开始下载');
      return;
    }
    if (format === 'pdf') {
      var printWindow = window.open('', '_blank');
      if (printWindow) printWindow.opener = null;
      if (!printWindow) {
        if (typeof window.toast === 'function') window.toast('浏览器已拦截打印窗口，请允许弹窗后重试');
        return;
      }
      printWindow.document.open(); printWindow.document.write(html); printWindow.document.close();
      window.closeDueDownloadV104();
      setTimeout(function () { printWindow.focus(); printWindow.print(); }, 420);
      if (typeof window.toast === 'function') window.toast('已打开 PDF 打印视图，请选择“另存为 PDF”');
    }
  };

  function mountDownloadV104() {
    var button = document.querySelector('#dueReport .due-report-head button[onclick*="downloadDueReport"]');
    if (button) {
      button.textContent = '↓ 下载报告';
      button.setAttribute('title', '支持 Word / PDF');
      button.setAttribute('onclick', 'openDueDownloadMenuV104()');
      button.setAttribute('data-due-v104', '1');
    }
    window.downloadDueReport = function () { window.openDueDownloadMenuV104(); };
    window.downloadDueVersionV77 = function (version) { window.openDueDownloadMenuV104(version || '历史版本'); };
  }

  function updateAnnotationsV104() {
    if (typeof window.prototypeLogicAnnotations === 'undefined' || !window.prototypeLogicAnnotations.dueReport) return;
    var fields = window.prototypeLogicAnnotations.dueReport.fields || [];
    var labels = ['主营产品联网信源', '股权与团队联网核验', '供应商与客户关系信源', '市场份额来源', '报告下载格式'];
    fields = fields.filter(function (item) { return labels.indexOf(item[0]) < 0; });
    fields.push(['主营产品联网信源', '最多展示3条企业官网、企业信息平台或行业调研来源，保留与主营产品相关的原文片段和原文链接。', '企业官网、企业信息平台、行业调研报告', '报告生成时联网检索']);
    fields.push(['股权与团队联网核验', '控制权稳定性下钻股东新增/退出记录；核心团队下钻学历、经验、履历及来源。', '工商变更、企业公告、官网及公开履历', '报告生成时联网检索']);
    fields.push(['供应商与客户关系信源', '按关系企业切换采购或合作新闻，展示金额、合作时间、合作内容和原文。', '采购公告、合作新闻、企业披露', '报告生成时联网检索']);
    fields.push(['市场份额来源', '最多展示3条资料片段，明确统计年度、地域与口径并提供原文链接。', '行业研究、协会资料、客户公告', '报告生成时联网检索']);
    fields.push(['报告下载格式', '下载报告支持Word和PDF；PDF通过打印视图保存，Word导出可编辑文档。', '当前报告版本快照', '按用户操作']);
    window.prototypeLogicAnnotations.dueReport.fields = fields;
  }

  function applyDueTraceV104() {
    if (applyingV104 || !document.getElementById('dueEvidenceReportV99')) return;
    applyingV104 = true;
    try {
      var basic = findSectionV104('企业主体与基础画像');
      var equity = findSectionV104('股东、实控与资本结构');
      var chain = findSectionV104('产业链定位与关联度');
      var innovation = findSectionV104(['技术实力与市场地位', '技术、知识产权与市场地位']);
      decorateFieldV104(basic, ['主营产品 / 服务', '主营产品/服务'], 'products', '联网 · 3条信源');
      decorateFieldV104(equity, '控制权稳定性', 'control', '联网 · 2条变更', { removeOldOrigin: true, valueText: '总体稳定；近两年存在 2 条非控制性股东进退记录，实际控制人未变' });
      decorateFieldV104(equity, ['核心团队背景', '核心团队'], 'team', '联网 · 3人', { removeOldOrigin: true });
      decorateFieldV104(chain, ['主要供应商（3 家）', '主要供应商'], 'suppliers', '联网 · 3家', { relation: 'suppliers' });
      decorateFieldV104(chain, ['主要客户（3 家）', '主要客户'], 'customers', '联网 · 3家', { relation: 'customers' });
      decorateFieldV104(innovation, ['市场份额 / 行业梯队', '市场份额/行业梯队'], 'market', '联网 · 3条资料');
      ensureEvidenceModalV104(); ensureDownloadModalV104(); mountDownloadV104(); updateAnnotationsV104();
    } finally {
      applyingV104 = false;
    }
  }

  function scheduleApplyV104() {
    if (applyingV104 || applyFrameV104) return;
    applyFrameV104 = window.requestAnimationFrame(function () {
      applyFrameV104 = null;
      applyDueTraceV104();
    });
  }

  function installObserverV104() {
    var report = document.getElementById('dueReport');
    if (!report || observerV104) return;
    observerV104 = new MutationObserver(function () { scheduleApplyV104(); });
    observerV104.observe(report, { childList: true, subtree: true });
  }

  function initV104() {
    ensureEvidenceModalV104(); ensureDownloadModalV104(); installObserverV104();
    setTimeout(applyDueTraceV104, 280);
    var previous = window.openDueReport;
    if (typeof previous === 'function' && !previous.__dueV104) {
      var wrapped = function () {
        var result = previous.apply(this, arguments);
        setTimeout(applyDueTraceV104, 310);
        return result;
      };
      wrapped.__dueV104 = true;
      window.openDueReport = wrapped;
    }
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      window.closeDueEvidenceV104(); window.closeDueDownloadV104();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initV104);
  else initV104();
})();

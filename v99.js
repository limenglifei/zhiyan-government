(function () {
  'use strict';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  var evidenceV99 = {
    summary: {
      title: '执行摘要与综合结论',
      note: '执行摘要仅引用下列已落库事实、联网证据和模型计算。推断性结论不作为最终招商决策依据。',
      items: [
        ['库', '企业库字段快照', '统一社会信用代码关联 · 数据版本 2026-08-25', ''],
        ['链', '海州市产业链知识图谱', '节点挂靠与本地配套关系 · 模型 V3.2', ''],
        ['模', '招商评估模型', '五维评分及证据覆盖校验 · 模型 V2.6', '']
      ]
    },
    basic: {
      title: '主体与基础画像证据链',
      note: '企业主体必须先按企业名称与统一社会信用代码双重锚定；登记信息冲突时以市场监管公示为准。',
      items: [
        ['库', '智研企业库', '基础工商、联系方式、主营产品 · 2026-08-25', ''],
        ['市', '国家企业信用信息公示系统', '登记状态、法人、注册资本、注册地址 · 联网核验', 'https://www.gsxt.gov.cn/'],
        ['官', '企业官方网站', '主营产品、业务布局与联系方式 · 联网补充', 'https://www.example.com/']
      ]
    },
    chain: {
      title: '产业链定位证据链',
      note: '产业链定位由主营产品、行业代码和供需关系共同确定，不以企业自述或名称关键词单独判断。',
      items: [
        ['库', '企业库主营产品与行业代码', 'main_products / industry_category_code', ''],
        ['链', '产业链知识图谱', '节点、产品服务、上下游及本地挂靠关系 · 2026-08-25', ''],
        ['采', '招投标与客户供应商公开信息', '交易关系和行业客户交叉验证 · 联网检索', 'https://www.ccgp.gov.cn/']
      ]
    },
    equity: {
      title: '股东与资本结构证据链',
      note: '实控与受益所有人以股权穿透、任职和集团关系综合判断；上市企业优先使用监管披露。',
      items: [
        ['库', '智研企业库', '控股股东、实控人、上市与融资字段 · 2026-08-25', ''],
        ['市', '国家企业信用信息公示系统', '股东与变更记录 · 联网核验', 'https://www.gsxt.gov.cn/'],
        ['披', '巨潮资讯', '上市公告、财务和股东披露 · 联网补充', 'http://www.cninfo.com.cn/']
      ]
    },
    finance: {
      title: '经营与财务证据链',
      note: '非上市公司财务字段可能来自年报、企业填报或政府授权数据；缺失值不参与评分，并在报告中标为待核验。',
      items: [
        ['库', '智研企业库', '三年营收、利润、资产负债及参保人数', ''],
        ['报', '企业年报 / 上市披露', '经营与财务口径交叉核验 · 联网补充', 'http://www.cninfo.com.cn/'],
        ['采', '政府采购与招投标公开信息', '客户结构和经营活跃度信号', 'https://www.ccgp.gov.cn/']
      ]
    },
    innovation: {
      title: '技术与创新证据链',
      note: '创新能力同时关注存量和增量；发明授权、近三年新增专利和有效资质权重高于专利总量。',
      items: [
        ['库', '智研企业库', '专利、软著、商标及荣誉资质字段', ''],
        ['知', '国家知识产权局', '专利法律状态与申请人核验 · 联网检索', 'https://www.cnipa.gov.cn/'],
        ['公', '工信、科技部门公示', '高新、专精特新、科技型中小企业资质核验', 'https://www.miit.gov.cn/']
      ]
    },
    risk: {
      title: '风险与合规证据链',
      note: '区分“查到风险记录”“已查询未返回记录”和“未查询该维度”。重大风险必须下钻到具体记录并人工复核。',
      items: [
        ['信', '信用中国', '行政处罚、严重违法与信用记录', 'https://www.creditchina.gov.cn/'],
        ['裁', '中国裁判文书网', '司法案件及裁判文书 · 联网检索', 'https://wenshu.court.gov.cn/'],
        ['执', '中国执行信息公开网', '执行、失信及限高信息', 'https://zxgk.court.gov.cn/'],
        ['环', '生态环境 / 应急管理 / 自然资源公示', '环保、安全生产和土地规划违规核验', 'https://www.mee.gov.cn/']
      ]
    },
    expansion: {
      title: '扩张与落地意愿证据链',
      note: '扩张意愿是信号推断，不等同于企业正式承诺。投资额、用地、厂房、意向地区和新增用工必须通过企业访谈确认。',
      items: [
        ['招', '招聘与岗位变化', '异地招聘、工程建设及产线岗位增长 · 近 90 天', ''],
        ['投', '融资、招投标及设备采购', '融资后扩产、设备招标和建设项目线索', 'https://www.ccgp.gov.cn/'],
        ['闻', '企业官网与新闻舆情', '新基地、合作签约和产能规划信号', ''],
        ['访', '企业访谈与招商材料', '投资额、用地、厂房、意向地区和用工需求 · 待核验', '']
      ]
    },
    score: {
      title: '招商适配评分证据链',
      note: '评分用于企业排序和研判辅助，不替代招商准入与最终决策；任何一票否决项均优先于综合分。',
      items: [
        ['链', '产业链图谱与本地企业关系', '产业链节点相关度 · 权重 30%', ''],
        ['信', '扩张信号与落地要素', '扩张意愿度 · 权重 20%', ''],
        ['风', '司法、行政、环保与安全记录', '风险合规度 · 权重 20%', ''],
        ['创', '知识产权与荣誉资质', '技术创新力 · 权重 15%', ''],
        ['财', '经营规模与财务趋势', '财务营收能力 · 权重 15%', '']
      ]
    }
  };

  function sourceFooter(key, labels) {
    var chips = labels.map(function (item) {
      return '<span class="due-source-chip-v99 ' + (item[1] || '') + '">' + esc(item[0]) + '</span>';
    }).join('');
    return '<footer class="due-source-footer-v99"><span>数据来源</span>' + chips + '<button type="button" class="due-trace-button-v99" onclick="openDueEvidenceV99(\'' + key + '\')">查看证据链 →</button></footer>';
  }

  function analysis(text) {
    return '<div class="due-analysis-v99"><i>AI</i><b>招商分析</b><p>' + text + '</p></div>';
  }

  function field(label, value, origin, type, className) {
    return '<div class="due-fact-v99 ' + (className || '') + '"><dt>' + label + '</dt><dd>' + value + '<em class="due-field-origin-v99 ' + (type || '') + '">' + origin + '</em></dd></div>';
  }

  function reportHtml(company) {
    var safeCompany = esc(company);
    return '<section class="due-evidence-v99" id="dueEvidenceReportV99">' +
      '<section class="card due-data-coverage-v99"><header><div><h2>数据覆盖与补充策略</h2><p>基于《企业库信息字段》74 个尽调字段映射，所有结论区分事实、计算、推断与人工建议。</p></div><span class="due-live-badge-v99">联网补充已开启 · 生成时间 2026-08-26 10:30</span></header>' +
      '<div class="due-coverage-grid-v99"><article class="due-coverage-card-v99"><span>企业库字段定义覆盖</span><b>62 / 74</b><em>工商、经营、股权、创新与风险字段直接读取</em></article><article class="due-coverage-card-v99 online"><span>可联网补充字段</span><b>7 项</b><em>核心团队、扩张信号、市场排名及土地厂房等</em></article><article class="due-coverage-card-v99 manual"><span>需企业人工核验</span><b>5 项</b><em>投资额、用地、厂房、意向地区及新增用工</em></article><article class="due-coverage-card-v99"><span>模块证据链覆盖</span><b>100%</b><em>每个分析模块均标注来源、时间与数据性质</em></article></div>' +
      '<div class="due-data-rule-v99"><b>判定规则：</b>库内缺失时优先检索权威公示、企业公告、招投标、招聘和新闻信号；检索无结果标记为“已查询未返回”，未发起查询标记为“未查询”，不得直接表述为“无风险”或“无扩张意愿”。</div></section>' +

      '<section class="card due-evidence-section-v99"><header><div class="due-section-title-v99"><span class="due-section-number-v99">01</span><div><h2>企业主体与基础画像</h2><p>主体锚定、工商登记、联系方式与主营业务</p></div></div><span class="due-section-state-v99">事实字段已核验</span></header><dl class="due-fact-grid-v99">' +
      field('企业全称', safeCompany, '企业库', '', 'wide') + field('统一社会信用代码', '91320594MA1M7X9J6R', '企业库', '') + field('经营状态', '存续', '联网核验', 'online') +
      field('法定代表人', '陈启明', '企业库', '') + field('注册资本 / 实缴资本', '68,000 万元 / 54,230 万元', '企业库', '') + field('成立日期', '2016-08-19', '企业库', '') + field('企业类型', '股份有限公司', '企业库', '') +
      field('注册地址', '江苏省苏州市工业园区星湖街 218 号', '公示系统', 'online', 'wide') + field('联系电话 / 邮箱', '0512-6688-2106 / bd@xinyuan-micro.cn', '公开信息', 'online', 'wide') +
      field('主营产品 / 服务', '车规级 MCU、功率器件、晶圆制造及相关技术服务', '企业库', '', 'full') + '</dl>' +
      analysis('企业主体正常存续，注册及实缴资本能够支撑中大型制造项目。主营产品与海州市新能源汽车、功率半导体方向直接相关；正式接洽前应再次核验电话邮箱有效性及实际经营地址。') + sourceFooter('basic', [['企业库 · 2026-08-25', ''], ['国家企业信用信息公示系统 · 联网核验', 'online']]) + '</section>' +

      '<section class="card due-evidence-section-v99"><header><div class="due-section-title-v99"><span class="due-section-number-v99">02</span><div><h2>产业链定位与关联度</h2><p>按照报告模板重点识别链条位置、上下游关系与本地协同</p></div></div><span class="due-section-state-v99 inference">图谱计算 + 联网验证</span></header><dl class="due-fact-grid-v99">' +
      field('所属产业链', '新能源汽车产业链 / 集成电路产业链', '图谱计算', 'calc', 'wide') + field('核心挂靠节点', '车规级 MCU、功率半导体', '图谱计算', 'calc', 'wide') +
      field('产业链环节', '中游核心器件与制造', '图谱计算', 'calc') + field('节点关系强度', '92%', '图谱计算', 'calc') + field('本地配套率', '78%', '供需模型', 'calc') + field('企业重要程度', '重点补强企业', '模型判断', 'calc') +
      field('主要上游', '晶圆材料、封测设备、EDA/IP 服务', '图谱 + 联网', 'online', 'wide') + field('主要下游', '整车、汽车电子、储能及工业控制客户', '图谱 + 联网', 'online', 'wide') + '</dl>' +
      analysis('企业能够补齐海州市车规级芯片和功率器件薄弱节点，并与本地整车、汽车电子企业形成供需协同。其价值更接近“关键节点补强企业”而非总部型链主，招商方案应聚焦特色工艺产线和区域研发中心。') + sourceFooter('chain', [['企业库主营产品', ''], ['产业链知识图谱 V3.2', 'calc'], ['招投标与供需公开信息', 'online']]) + '</section>' +

      '<section class="card due-evidence-section-v99"><header><div class="due-section-title-v99"><span class="due-section-number-v99">03</span><div><h2>股东、实控与资本结构</h2><p>识别控制权稳定性、资本背景与核心团队质量</p></div></div><span class="due-section-state-v99">股权穿透已核验</span></header><dl class="due-fact-grid-v99">' +
      field('控股股东', '苏州芯源产业投资有限公司', '企业库', '') + field('实际控制人', '陈启明、周欣怡', '企业库', '') + field('股东背景', '民营 + 国资产业基金', '企业库', '') + field('控制权稳定性', '稳定，近两年无变更', '联网核验', 'online') +
      field('上市情况', '科创板 · 688XXX.SH', '公开披露', 'online') + field('累计融资总额', '约 18.5 亿元', '企业库', '') + field('最新估值 / 市值', '约 126 亿元', '公开披露', 'online') + field('核心团队背景', '创始团队具备 15 年以上半导体研发和量产经验', '联网补充', 'online') + '</dl>' +
      analysis('股权结构清晰，创始团队与产业基金形成相对稳定的控制与资源组合。核心团队背景属于企业库缺失字段，当前结论来自公开履历与公告，应在高层接洽阶段核验团队稳定性和关键技术人员锁定机制。') + sourceFooter('equity', [['企业库股东字段', ''], ['市场监管公示', 'online'], ['上市公告 / 融资披露', 'online']]) + '</section>' +

      '<section class="card due-evidence-section-v99"><header><div class="due-section-title-v99"><span class="due-section-number-v99">04</span><div><h2>经营与财务健康度</h2><p>按三年趋势评价规模、成长性、现金承压与经营真实性</p></div></div><span class="due-section-state-v99 review">部分数据待审计口径核验</span></header>' +
      '<table class="due-trend-table-v99"><thead><tr><th>指标</th><th>2023 年</th><th>2024 年</th><th>2025 年</th><th>趋势判断</th><th>字段性质</th></tr></thead><tbody><tr><td>营业收入</td><td>24.1 亿元</td><td>31.2 亿元</td><td>38.6 亿元</td><td class="due-positive-v99">连续增长</td><td>企业库</td></tr><tr><td>利润总额</td><td>2.46 亿元</td><td>3.28 亿元</td><td>4.32 亿元</td><td class="due-positive-v99">盈利改善</td><td>企业库</td></tr><tr><td>净利润</td><td>1.98 亿元</td><td>2.71 亿元</td><td>3.68 亿元</td><td class="due-positive-v99">质量较好</td><td>企业库</td></tr><tr><td>资产负债率</td><td>58.4%</td><td>59.7%</td><td>61.2%</td><td class="due-warning-v99">资本开支推升</td><td>系统计算</td></tr><tr><td>参保人数</td><td>1,086</td><td>1,224</td><td>1,364</td><td class="due-positive-v99">规模扩张</td><td>企业库</td></tr></tbody></table>' +
      analysis('营收、利润与参保人数连续增长，具备真实扩张基础；资产负债率同步抬升，可能与新产线资本开支有关。建议补充审计报告、在手订单、主要客户集中度和未来两年资本开支计划后再确定基金与授信支持强度。') + sourceFooter('finance', [['企业库三年经营字段', ''], ['资产负债率 · 系统计算', 'calc'], ['年报 / 招投标 · 联网交叉验证', 'online']]) + '</section>' +

      '<section class="card due-evidence-section-v99"><header><div class="due-section-title-v99"><span class="due-section-number-v99">05</span><div><h2>技术、知识产权与市场地位</h2><p>关注有效专利、近三年增量、研发能力和权威资质</p></div></div><span class="due-section-state-v99">知识产权已核验</span></header><dl class="due-fact-grid-v99">' +
      field('专利总数', '286 项', '企业库', '') + field('发明专利授权', '116 项', '企业库', '') + field('近三年新增专利', '84 项', '企业库', '') + field('软件著作权 / 商标', '38 / 27 项', '企业库', '') +
      field('研发人员', '428 人，占员工 31.4%', '公开信息', 'online') + field('荣誉资质', '高新技术企业、专精特新“小巨人”', '公示核验', 'online', 'wide') + field('市场份额 / 行业梯队', '车规级 MCU 国内第二梯队，细分份额约 3.8%', '联网推断', 'online', 'wide') + '</dl>' +
      analysis('专利质量与近三年增量均表现较强，具备持续研发投入能力。市场份额和行业排名属于企业库缺失字段，目前由公开研究、客户进入情况和产品出货信号综合推断，招商谈判前应要求企业提供第三方市场证明。') + sourceFooter('innovation', [['企业库知识产权字段', ''], ['国家知识产权局', 'online'], ['工信 / 科技资质公示', 'online']]) + '</section>' +

      '<section class="card due-evidence-section-v99"><header><div class="due-section-title-v99"><span class="due-section-number-v99">06</span><div><h2>信用、司法与园区准入风险</h2><p>红线优先，逐项区分有记录、未返回记录和未查询</p></div></div><span class="due-section-state-v99 review">中低风险 · 2 项待核验</span></header>' +
      '<table class="due-risk-table-v99"><thead><tr><th>风险维度</th><th>检索结果</th><th>判断</th><th>状态</th><th>数据来源</th></tr></thead><tbody><tr><td>严重违法 / 失信执行</td><td>已查询，未返回相关记录</td><td class="due-positive-v99">未发现重大红线</td><td>已联网查询</td><td>信用中国 / 执行公开网</td></tr><tr><td>司法诉讼</td><td>4 起一般合同纠纷</td><td class="due-warning-v99">需核验最新进展</td><td>有记录</td><td>裁判文书 / 企业库</td></tr><tr><td>行政处罚</td><td>1 条，公开信息显示已整改</td><td class="due-warning-v99">一般关注</td><td>有记录</td><td>信用中国</td></tr><tr><td>环保处罚</td><td>已查询，未返回近三年处罚</td><td class="due-positive-v99">未发现园区红线</td><td>已联网查询</td><td>生态环境公示</td></tr><tr><td>安全生产处罚</td><td>已查询，未返回相关记录</td><td class="due-positive-v99">未发现园区红线</td><td>已联网查询</td><td>应急管理公示</td></tr><tr><td>土地 / 规划违规</td><td>企业库无字段，联网检索待复核</td><td class="due-warning-v99">暂不下结论</td><td>待人工核验</td><td>自然资源公示</td></tr></tbody></table>' +
      analysis('当前未发现严重违法、失信执行及环保安全一票否决项，但“未返回记录”不等于绝对无风险。一般合同纠纷和历史行政处罚需要下钻到具体文书；土地规划违规属于企业库缺失字段，应在选址前完成属地核验。') + sourceFooter('risk', [['企业库风险字段', ''], ['司法与信用公开网站', 'online'], ['环保 / 安全 / 土地公示', 'online']]) + '</section>' +

      '<section class="card due-evidence-section-v99"><header><div class="due-section-title-v99"><span class="due-section-number-v99">07</span><div><h2>扩张意愿与落地条件</h2><p>从公开行为信号推断招商窗口，并明确企业访谈项</p></div></div><span class="due-section-state-v99 inference">联网信号推断 · 非企业承诺</span></header><div class="due-landing-signals-v99"><article><span>近 90 天招聘变化</span><b>工程及量产岗位 +18%</b><em>联网信号 · 中等强度</em></article><article><span>设备 / 产线招标</span><b>新增功率器件测试设备采购</b><em>公开招投标 · 强信号</em></article><article><span>融资与资本动作</span><b>产业基金增资 3.2 亿元</b><em>工商变更 / 公告 · 强信号</em></article><article><span>异地布局动态</span><b>调研长三角第二生产基地</b><em>新闻舆情 · 待核验</em></article><article><span>预计投资时间</span><b>2027 年前形成新产能</b><em>公开表述推断</em></article><article><span>用地 / 厂房 / 用工</span><b>暂无可靠公开值</b><em>必须企业访谈确认</em></article></div>' +
      analysis('招聘、设备采购和产业基金增资构成较强扩张组合信号，适合进入招商初步关注并开展高层接洽。但投资额、用地、厂房面积、意向地区和新增用工等 5 项不能仅靠联网数据可靠判断，应在首次访谈中形成企业盖章或书面确认的需求清单。') + sourceFooter('expansion', [['招聘 / 招投标 / 融资信号', 'online'], ['新闻舆情与企业官网', 'online'], ['企业访谈待核验', 'manual']]) + '</section>' +

      '<section class="card due-evidence-section-v99"><header><div class="due-section-title-v99"><span class="due-section-number-v99">08</span><div><h2>招商适配度综合评级</h2><p>沿用五维招商评估模型，评分必须可解释、可追溯</p></div></div><span class="due-section-state-v99">A · 建议重点跟进</span></header>' +
      '<table class="due-score-table-v99"><thead><tr><th>评估维度</th><th>权重</th><th>得分</th><th>关键依据</th><th>可信度</th></tr></thead><tbody><tr><td>产业链节点相关度</td><td>30%</td><td>94</td><td>补齐车规级 MCU、功率器件薄弱节点</td><td class="due-positive-v99">高</td></tr><tr><td>扩张意愿度</td><td>20%</td><td>86</td><td>招聘、设备采购、增资三类信号一致</td><td class="due-warning-v99">中</td></tr><tr><td>风险合规度</td><td>20%</td><td>88</td><td>无重大红线，土地合规待核验</td><td class="due-positive-v99">较高</td></tr><tr><td>技术创新力</td><td>15%</td><td>93</td><td>发明授权、近三年新增专利和权威资质</td><td class="due-positive-v99">高</td></tr><tr><td>财务营收能力</td><td>15%</td><td>85</td><td>三年营收利润增长，负债率有所抬升</td><td class="due-warning-v99">中高</td></tr></tbody></table>' +
      analysis('综合评分 90 分，评级 A。推荐理由不是单纯企业规模大，而是其核心能力与本地薄弱节点高度相关、扩张信号较强且未触发重大合规红线。建议在土地合规、资本开支和实际投资需求核验通过后，再进入“一企一策”资源配置。') + sourceFooter('score', [['招商评估模型 V2.6', 'calc'], ['企业库字段快照', ''], ['产业链图谱 V3.2', 'calc'], ['联网证据包', 'online']]) + '</section>' +

      '<section class="card due-evidence-section-v99"><header><div class="due-section-title-v99"><span class="due-section-number-v99">09</span><div><h2>对接策略与 90 天行动建议</h2><p>从结论转化为招商人员可执行的任务闭环</p></div></div><span class="due-section-state-v99">建议方案</span></header><div class="due-action-steps-v99"><article><span>0—7 天</span><b>主体与需求核验</b><p>确认联系人、投资决策链和扩张计划，索取审计报告及项目需求清单。</p></article><article><span>8—30 天</span><b>产业协同验证</b><p>组织本地整车和汽车电子企业开展供需对接，验证订单与配套可能。</p></article><article><span>31—60 天</span><b>形成要素方案</b><p>核算用地、能耗、厂房、人才和基金条件，形成“一企一策”初稿。</p></article><article><span>61—90 天</span><b>推动框架签约</b><p>完成合规复核、基金尽调及项目评审，明确投资、产能和达效节点。</p></article></div>' +
      analysis('建议采用“特色工艺产线 + 区域研发中心 + 本地客户协同”的落地模式。政策资源应与实际投资、产能、研发和税收达效挂钩，避免仅以一次性补贴换取轻资产注册。') + sourceFooter('summary', [['尽调事实与模型结论', 'calc'], ['招商人员专业判断', 'manual']]) + '</section></section>';
  }

  function ensureEvidenceModal() {
    if (document.getElementById('dueEvidenceModalV99')) return;
    document.body.insertAdjacentHTML('beforeend', '<div class="prototype-modal-backdrop due-evidence-modal-v99" id="dueEvidenceModalV99" aria-hidden="true"><section class="prototype-modal" role="dialog" aria-modal="true" aria-labelledby="dueEvidenceTitleV99"><header><div><label>TRACEABLE EVIDENCE</label><h2 id="dueEvidenceTitleV99">数据来源与证据链</h2><p id="dueEvidenceSubtitleV99">查看本模块引用的数据、更新时间和核验状态</p></div><button type="button" onclick="closeDueEvidenceV99()">×</button></header><div class="prototype-modal-body"><div class="due-evidence-note-v99" id="dueEvidenceNoteV99"></div><div class="due-evidence-list-v99" id="dueEvidenceListV99"></div></div><footer><button class="secondary" type="button" onclick="closeDueEvidenceV99()">关闭</button></footer></section></div>');
  }

  window.openDueEvidenceV99 = function (key) {
    ensureEvidenceModal();
    var data = evidenceV99[key] || evidenceV99.summary;
    document.getElementById('dueEvidenceTitleV99').textContent = data.title;
    document.getElementById('dueEvidenceNoteV99').textContent = data.note;
    document.getElementById('dueEvidenceListV99').innerHTML = data.items.map(function (item) {
      var action = item[3] ? '<a href="' + esc(item[3]) + '" target="_blank" rel="noopener">打开来源 ↗</a>' : '<button type="button" onclick="typeof toast===\'function\'&&toast(\'已定位企业库字段快照与数据血缘记录\')">查看快照</button>';
      return '<article class="due-evidence-item-v99"><i>' + esc(item[0]) + '</i><div><b>' + esc(item[1]) + '</b><span>' + esc(item[2]) + '</span></div>' + action + '</article>';
    }).join('');
    var modal = document.getElementById('dueEvidenceModalV99');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  };

  window.closeDueEvidenceV99 = function () {
    var modal = document.getElementById('dueEvidenceModalV99');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  };

  function updateSummary(company) {
    var summary = document.querySelector('#dueReport .due-report-summary > div:nth-child(2)');
    if (!summary) return;
    summary.innerHTML = '<h2>执行摘要</h2><p><b id="dueSummaryCompany">' + esc(company) + '</b> 主营车规级 MCU、功率器件及晶圆制造。企业库已覆盖主体、经营、股权、知识产权和主要风险字段；针对核心团队、市场地位、扩张与土地厂房等库内缺失字段，系统已补充检索公开网站、公告、招投标、招聘及新闻信号。</p><p>综合研判企业与海州市车规级芯片及功率器件薄弱节点高度匹配，三年营收利润保持增长，扩张信号较强，暂未发现重大失信、环保或安全生产红线。当前结论仍需核验土地规划合规、未来资本开支以及企业真实投资额、用地、厂房和用工需求。建议评级 <b>A</b>，进入重点跟进。</p><div class="due-report-tags"><span>产业适配 94%</span><span>扩张意愿 86%</span><span>技术创新 93%</span><span>财务能力 85%</span><span>风险合规 88%</span></div><footer class="due-summary-provenance-v99"><span>结论来源</span><span class="due-source-chip-v99">企业库字段快照</span><span class="due-source-chip-v99 online">联网证据包</span><span class="due-source-chip-v99 calc">招商模型 V2.6</span><button type="button" class="due-trace-button-v99" onclick="openDueEvidenceV99(\'summary\')">查看摘要证据链 →</button></footer>';
  }

  function renderReport(company) {
    var report = document.getElementById('dueReport');
    if (!report) return;
    var current = company || (typeof currentDueCompany !== 'undefined' && currentDueCompany) || '芯源微电子科技股份有限公司';
    updateSummary(current);
    var old = document.getElementById('dueEvidenceReportV99');
    if (old) old.remove();
    var summary = report.querySelector('.due-report-summary');
    if (summary) summary.insertAdjacentHTML('afterend', reportHtml(current));
    ensureEvidenceModal();
  }

  function annotateV99() {
    if (typeof prototypeLogicAnnotations === 'undefined' || !prototypeLogicAnnotations.dueReport) return;
    var fields = prototypeLogicAnnotations.dueReport.fields || [];
    if (!fields.some(function (item) { return item[0] === '数据可用性与补充策略'; })) {
      fields.push(['数据可用性与补充策略', '企业库字段优先直取；库内缺失时按权威公示、企业公告、招投标、招聘与新闻信号联网补充；投资额、用地、厂房、意向地区和用工需求必须人工确认。', '企业库字段表、联网证据包、企业访谈材料', '报告生成时固化快照']);
      prototypeLogicAnnotations.dueReport.interactions.push(['查看证据链', '点击每个模块底部的数据来源。', '展示来源名称、更新时间、核验状态和原文入口；区分有记录、已查询未返回与未查询。']);
    }
  }

  function initV99() {
    renderReport(typeof currentDueCompany === 'undefined' ? '' : currentDueCompany);
    annotateV99();
    var previous = window.openDueReport;
    if (typeof previous === 'function' && !previous.__dueEvidenceV99) {
      var wrapped = function (name) {
        var result = previous.apply(this, arguments);
        setTimeout(function () { renderReport(name || currentDueCompany); }, 0);
        return result;
      };
      wrapped.__dueEvidenceV99 = true;
      window.openDueReport = wrapped;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initV99);
  else initV99();
})();


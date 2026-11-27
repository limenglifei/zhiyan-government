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
  const dimensionWeights = { city: 5, company: 13, product: 10, technology: 10, person: 12 };
  const levels = ['宏观', '行业', '企业', '个体'];
  const sentiments = ['中立', '反面', '正面'];
  const summarySentiments = ['正面', '中立', '反面'];
  const publicationRanges = new Map([
    ['', { label: '不限发布日期' }],
    ['7d', { label: '近7天', days: 7 }],
    ['30d', { label: '近30天', days: 30 }],
    ['60d', { label: '近60天', days: 60 }],
    ['90d', { label: '近90天', days: 90 }],
    ['6m', { label: '近半年', months: 6 }]
  ]);
  const publicationOffset = 8 * 60 * 60 * 1000;
  const minute = 60 * 1000;
  const demoSourceSites = new Map([
    ['manufacturing-news.example', '制造业资讯网'],
    ['policy-news.example', '政策发布站'],
    ['industry-observer.example', '产业观察网']
  ]);
  const sampleEvents = [
    {
      id: 'battery-inspection', category: '4', subtypes: ['4.1'], level: '企业', sentiment: '正面',
      title: '动力电池极片在线视觉检测进入产线联调', time: '2026-11-26 11:56',
      sourceName: '动力电池制造企业质量部（演示）', sourceSite: 'manufacturing-news.example',
      summary: '演示场景中，一套极片在线检测装置完成样线测试，开始与涂布设备和质量系统联调。规模化使用仍取决于不同批次的缺陷识别、误判率和运行节拍。',
      sourceText: '联调工作启动后，质量团队收集不同班次的极片检测图像，将涂布工单和缺陷位置录入试验台账。设备日志与人工复核单随试验版本归档。',
      tags: { city: ['合肥市'], product: ['动力电池极片', '在线视觉检测装置'], technology: ['机器视觉', '涂布检测'] }
    },
    {
      id: 'controller-ramp', category: '4', subtypes: ['4.2'], level: '企业', sentiment: '正面',
      title: '工商业储能控制器启动首批量产', time: '2026-11-26 11:48',
      sourceName: '储能控制器制造企业生产部（演示）', sourceSite: 'manufacturing-news.example',
      summary: '演示场景中，工商业储能控制器完成产线切换，首批产品等待系统集成商进行交付验收。后续放量取决于控制策略适配和现场试运行结果。',
      sourceText: '首批生产按同一固件版本执行，装配与出厂联测分别记录在工单及检验报告中。系统集成商计划在样站安排通信接入和运行验收。',
      tags: { city: ['合肥市', '滁州市'], product: ['工商业储能控制器'], technology: ['储能能量管理', '边缘控制'] }
    },
    {
      id: 'connector-test-draft', category: '4', subtypes: ['4.4'], level: '行业', sentiment: '中立',
      title: '车载高压连接器振动试验方法拟更新', time: '2026-11-26 11:40',
      sourceName: '车载连接器标准工作组（演示）', sourceSite: 'industry-observer.example',
      summary: '演示征求意见稿拟调整振动工况、接触电阻记录和报告追溯要求。供方可先评估既有报告与客户验收条件的差异。',
      sourceText: '意见稿附件包含台架安装示意、试验工况表和接触电阻记录模板。意见表要求按条款编号填写建议，附上涉及的连接器型号与试验场景。',
      tags: { city: ['合肥市', '苏州市'], product: ['车载高压连接器'], technology: ['振动可靠性', '电气连接'] }
    },
    {
      id: 'digital-equipment-draft', category: '1', subtypes: ['1.2'], level: '行业', sentiment: '正面',
      title: '生产设备联网改造拟纳入数字化支持清单', time: '2026-11-26 11:31',
      sourceName: '工业数字化项目主管部门（演示）', sourceSite: 'policy-news.example',
      summary: '演示方案拟将存量设备联网、关键工序数据采集等纳入项目支持范围。企业适用资格、可核验费用和申报窗口以正式文件为准。',
      sourceText: '拟议项目清单涉及采集终端、联网网关和现有设备接口适配。征集材料模板列出改造设备清单、实施周期和费用记录栏。',
      tags: { city: ['合肥市', '芜湖市'], product: ['设备联网改造服务'], technology: ['工业互联网', '设备数据采集'] }
    },
    {
      id: 'testing-access-draft', category: '1', subtypes: ['1.3'], level: '行业', sentiment: '中立',
      title: '工业检测服务准入拟细化样品溯源要求', time: '2026-11-26 11:23',
      sourceName: '工业检测服务监管部门（演示）', sourceSite: 'policy-news.example',
      summary: '演示征求意见内容涉及样品接收、测试记录及报告归档。拟议要求适用哪些服务项目及何时执行，仍需查看正式规则。',
      sourceText: '草案按收样、分样、检测和归档列出记录项目，包括样品标识、接收人员、仪器批次及报告版本。机构填写意见时可附现行样品流转图。',
      tags: { city: ['合肥市'], product: ['工业检测服务'], technology: ['样品溯源', '实验室信息管理'] }
    },
    {
      id: 'bearing-shortage', category: '6', subtypes: ['6.4'], level: '企业', sentiment: '反面',
      title: '高精度主轴轴承到货放缓，部分工单调整排期', time: '2026-11-26 11:14',
      sourceName: '皖江精密制造采购部（演示）', sourceSite: 'manufacturing-news.example',
      summary: '演示场景中，皖江精密制造接到特定轴承批次延期信息，优先重排可先行的工序。是否影响交付取决于合格库存、补货时间及客户对替代件的认可。',
      sourceText: '采购通知列明受影响的主轴轴承规格、批次及原承诺日期。车间将依赖该批次的装配工单标为待料，同时记录可先完成的加工工序。',
      tags: { city: ['芜湖市'], company: ['皖江精密制造'], product: ['高精度主轴轴承'], technology: ['精密主轴', '精密装配'] }
    },
    {
      id: 'vision-order', category: '7', subtypes: ['7.4'], level: '企业', sentiment: '正面',
      title: '视觉检测设备企业签订生产线改造订单', time: '2026-11-26 11:06',
      sourceName: '视觉检测设备企业商务部（演示）', sourceSite: 'manufacturing-news.example',
      summary: '演示场景中，设备企业获得分批交付的检测线改造订单，验收包括识别稳定性和既有产线接入。订单执行收入将随合同验收及交付进度确认。',
      sourceText: '订单将改造拆分为设计确认、试验台测试、现场安装和分线验收。交付资料包括缺陷样本清单、产线节拍记录及运维交接单。',
      tags: { city: ['苏州市', '芜湖市'], product: ['视觉检测设备'], technology: ['工业视觉', '产线集成'] }
    },
    {
      id: 'storage-forecast', category: '9', subtypes: ['9.1'], level: '企业', sentiment: '反面',
      title: '储能系统集成商提示部分项目毛利承压', time: '2026-11-26 10:58',
      sourceName: '储能系统集成商财务部（演示）', sourceSite: 'manufacturing-news.example',
      summary: '演示场景中，储能集成商对部分低价项目和交付成本变化作出阶段提示。影响范围仍需结合在手订单、实际交付成本和验收进度核实。',
      sourceText: '阶段说明把相关项目列为处于履约阶段的工商业储能集成服务，成本项目包括电池包、安装和现场支持。项目表按批次记载验收状态。',
      tags: { city: ['滁州市'], product: ['工商业储能系统'], technology: ['储能集成'] }
    },
    {
      id: 'export-insurance', category: '2', subtypes: ['2.9'], level: '宏观', sentiment: '反面',
      title: '区域贸易摩擦下部分设备出口订单加强核保', time: '2026-11-26 10:46',
      sourceName: '出口信用保险机构（演示）', sourceSite: 'industry-observer.example',
      summary: '演示场景中，部分设备出口订单因目的地和账期风险需额外提交买方资料。实际影响以承保条件、客户付款节点及合同约定为准。',
      sourceText: '办理说明按目的地、买方及付款周期标记需追加资料的交易。提供给核保方的材料清单包括买方登记资料和拟出运批次。',
      tags: { product: ['工业自动化装备'], technology: ['出口信用保险'] }
    },
    {
      id: 'recovery-standards-forum', category: '11', subtypes: ['11.4'], level: '行业', sentiment: '中立',
      title: '动力电池回收交流会将讨论梯次利用追溯', time: '2026-11-26 10:38',
      sourceName: '动力电池回收交流会主办方（演示）', sourceSite: 'industry-observer.example',
      summary: '演示活动拟交流退役电池交接记录、状态分级和梯次利用质量验证。企业可按议题准备交流材料，执行标准以正式发布文件为准。',
      sourceText: '活动议程安排回收、检测和利用单位分别交流交接台账、状态分级字段以及下游接收条件。专题结束后设有记录样表讨论。',
      tags: { city: ['芜湖市'], product: ['退役动力电池', '梯次利用电池组'], technology: ['电池回收', '全生命周期溯源'] }
    },
    {
      id: 'sic-validation', category: '4', subtypes: ['4.1'], level: '企业', sentiment: '正面',
      title: '车规碳化硅功率模块完成首轮验证', time: '2026-11-26 10:30',
      sourceName: '合芯微电子研发部（演示）', sourceSite: 'manufacturing-news.example',
      summary: '演示场景中，合芯微电子完成一款车规功率模块的首轮可靠性验证，下一阶段将与整车客户开展系统级适配。首轮验证通过仍需结合后续车规认证和客户采购评估量产机会。',
      sourceText: '试验任务单记录首轮模块样品编号、封装批次与可靠性工况。合芯微电子将系统级适配列入与整车客户沟通的下一阶段工作。',
      tags: { city: ['合肥市'], company: ['合芯微电子'], product: ['车规功率模块'], technology: ['碳化硅'], person: ['林明远'] }
    },
    {
      id: 'pilot-guidance', category: '1', subtypes: ['1.2'], level: '行业', sentiment: '中立',
      title: '先进制造中试支持方案进入意见征集阶段', time: '2026-11-26 09:45',
      sourceName: '先进制造中试项目主管部门（演示）', sourceSite: 'policy-news.example',
      summary: '演示方案提出支持共性中试平台、开放验证设备及服务目录，征集对象包括行业组织和制造企业。支持范围、申报窗口和资助标准以最终文件为准。',
      sourceText: '征集稿附有中试平台服务目录样表、设备共享意见表和企业应用案例栏。填报对象可按工艺类别提交所需验证能力和希望开放的服务时段。',
      tags: { city: ['合肥市', '芜湖市'], product: ['中试验证服务'], technology: ['先进制造'] }
    },
    {
      id: 'packaging-standard', category: '4', subtypes: ['4.4'], level: '行业', sentiment: '中立',
      title: '先进封装可靠性评价方法发布征求意见稿', time: '2026-11-26 08:50',
      sourceName: '先进封装可靠性标准工作组（演示）', sourceSite: 'industry-observer.example',
      summary: '演示稿建议统一试样、热循环和失效记录口径。封装企业可提前整理现有试验数据，对照拟议指标评估产线与检测能力。',
      sourceText: '征求意见材料按封装结构列出试样编号、热循环记录项目和失效现象描述字段。反馈表设有对已完成试验的适用条款和资料来源栏。',
      tags: { city: ['合肥市', '苏州市'], product: ['芯粒封装基板'], technology: ['先进封装', '芯粒集成'] }
    },
    {
      id: 'logistics-window', category: '6', subtypes: ['6.3', '6.4'], level: '企业', sentiment: '反面',
      title: '部分支线停航，精密零部件出现短期供应缺口', time: '2026-11-25 18:20',
      sourceName: '园区配套港区承运服务机构（演示）', sourceSite: 'industry-observer.example',
      summary: '演示场景中，园区配套港区暂停部分支线作业，部分在途零部件延期交付。受影响范围依订单和路线而定，需核查替代通道和库存覆盖周期。',
      sourceText: '承运窗口变更通知按运单和支线船期列出涉及批次，分别标明已装船和待转运状态。园区货运服务台受理改运信息登记。',
      tags: { city: ['芜湖市', '合肥市'], company: ['皖江精密制造'], product: ['精密传感器'], technology: ['精密装配'] }
    },
    {
      id: 'equipment-trade', category: '2', subtypes: ['2.3', '2.4'], level: '宏观', sentiment: '反面',
      title: '关键设备进口成本及跨境许可面临变化', time: '2026-11-25 16:40',
      sourceName: '跨境设备贸易政策发布部门（演示）', sourceSite: 'policy-news.example',
      summary: '演示场景涉及部分设备关税和出口许可调整。企业应先核对海关编码、出口地及适用生效日期，再评估对订单和产线投资的影响。',
      sourceText: '政策通报按产品编码列出涉及的精密检测设备和配套件，表格包含原产地、适用日期与许可事项。订单核对表保留发运、到港和安装节点。',
      tags: { product: ['精密检测设备'], technology: ['光学检测'] }
    },
    {
      id: 'material-price', category: '3', subtypes: ['3.2', '3.5'], level: '宏观', sentiment: '中立',
      title: '汇率与关键原材料报价出现阶段性波动', time: '2026-11-25 15:30',
      sourceName: '外贸与原材料行情研究机构（演示）', sourceSite: 'industry-observer.example',
      summary: '演示场景中，贸易结算汇率和原材料报价同步波动，实际成本暴露取决于合同定价周期、结算币种和现货库存。',
      sourceText: '市场简报分列锂盐规格、报价日期和主要结算币种，报价记录区分现货询价、已签订单与分期交货。外贸服务项记录汇率观察时间。',
      tags: { product: ['电池级锂盐'], technology: ['锂电材料'] }
    },
    {
      id: 'storm-alert', category: '5', subtypes: ['5.2'], level: '行业', sentiment: '反面',
      title: '强降雨预警影响园区道路通行', time: '2026-11-25 14:10',
      sourceName: '园区运行管理机构（演示）', sourceSite: 'policy-news.example',
      summary: '演示场景中，强降雨预警涉及园区主要道路。重点核查仓储节点、到货批次与备用路线，企业产线状态以实际运行为准。',
      sourceText: '园区通行提示列出阶段性限行路段、开放出入口和物流调度联络方式。仓储通知同步登记调整装卸窗口的运单。',
      tags: { city: ['合肥市', '芜湖市'], product: ['园区物流服务'] }
    },
    {
      id: 'test-center', category: '7', subtypes: ['7.3', '7.5'], level: '企业', sentiment: '正面',
      title: '检测企业签署合作协议，共建汽车电子验证中心', time: '2026-11-25 13:40',
      sourceName: '江淮智测（演示）', sourceSite: 'manufacturing-news.example',
      summary: '演示场景中，江淮智测与园区平台签署合作意向。后续跟踪选址、投资决策、建设排期与对外开放条件。',
      sourceText: '合作意向文件把拟议工作划分为场地论证、仪器配置和服务目录准备。双方将按下一阶段会议核对电磁兼容等测试项目及项目排期。',
      tags: { city: ['合肥市'], company: ['江淮智测'], product: ['汽车电子验证服务'], technology: ['电磁兼容'], person: ['陈晓宁'] }
    },
    {
      id: 'management-change', category: '8', subtypes: ['8.3'], level: '企业', sentiment: '中立',
      title: '精密制造企业调整总经理分工', time: '2026-11-25 11:25',
      sourceName: '皖江精密制造（演示）', sourceSite: 'manufacturing-news.example',
      summary: '演示场景中，皖江精密制造完成经理层任命调整。总经理职责覆盖生产经营与供应商管理，股权结构未纳入本条事件范围。',
      sourceText: '经理层分工通告列出生产运营、采购和供应商管理的对接负责人。内部交接安排汇总待确认的采购合同、工单和客户沟通事项。',
      tags: { city: ['芜湖市'], company: ['皖江精密制造'], person: ['许澄'] }
    },
    {
      id: 'compliance-review', category: '9', subtypes: ['9.6', '9.7'], level: '企业', sentiment: '反面',
      title: '装备企业披露合同争议及整改进展', time: '2026-11-25 10:35',
      sourceName: '苏澜装备（演示）', sourceSite: 'manufacturing-news.example',
      summary: '演示场景中，装备企业对合同争议和整改措施作出阶段说明。履约责任、行政处罚范围与经营影响需结合正式文件分别核查。',
      sourceText: '说明附件按涉事项目列出合同履约事项、补充记录和拟复验条目。各条记录标注当前状态及能够查阅的验收资料。',
      tags: { city: ['苏州市'], company: ['苏澜装备'], product: ['精密检测设备'] }
    },
    {
      id: 'demand-survey', category: '10', subtypes: ['10.1'], level: '行业', sentiment: '中立',
      title: '充电设施采购关注点向运维和可用率转移', time: '2026-11-25 09:45',
      sourceName: '充电设施采购调研机构（演示）', sourceSite: 'industry-observer.example',
      summary: '演示调研显示，采购评价开始纳入设备在线率、故障修复效率和服务覆盖率，相关指标可作为下一轮供应商筛选参考。',
      sourceText: '调研样表记录采购和运营岗位对设备在线统计、维修工单、备件调拨及服务覆盖的反馈。参与方按站点类型分别填写。',
      tags: { city: ['合肥市'], product: ['公共充电设备'], technology: ['充电设施运维'] }
    },
    {
      id: 'engineer-forum', category: '11', subtypes: ['11.2', '11.4'], level: '个体', sentiment: '正面',
      title: '封装技术交流会公布专题分享名单', time: '2026-11-25 09:00',
      sourceName: '封装技术交流会主办方（演示）', sourceSite: 'industry-observer.example',
      summary: '演示活动安排工程团队分享芯粒封装和材料可靠性验证。可按议题和嘉宾了解技术方向。',
      sourceText: '议程按分享时段列出技术团队与主题。芯粒集成专题包括材料验证试验设计，主办方将在现场安排问答和经验交流。',
      tags: { city: ['合肥市'], company: ['合芯微电子'], technology: ['先进封装'], person: ['林明远'] }
    }
  ];
  const starterSubscriptions = [
    {
      id: 'sample-tech', name: '合肥先进制造动态', enabled: true, sample: true,
      dimensions: { city: ['合肥市'] }, levels: [], sentiments: [], eventCodes: ['4.1', '4.2', '4.4'], publicationRange: ''
    },
    {
      id: 'sample-business', name: '合肥制造业政策与项目', enabled: true, sample: true,
      dimensions: { city: ['合肥市'] }, levels: ['行业'], sentiments: [], eventCodes: ['1.2', '1.3'], publicationRange: ''
    },
    {
      id: 'sample-supply', name: '皖江关键零部件交付', enabled: true, sample: true,
      dimensions: { company: ['皖江精密制造'] }, levels: [], sentiments: ['反面'], eventCodes: ['6.3', '6.4'], publicationRange: ''
    }
  ];
  const availableSourceSites = [...new Set(sampleEvents.map(eventSourceSite).filter(Boolean))];
  const storageKey = 'zhiyan-intelligence-feed-v2';
  const legacyStorageKey = 'zhiyan-intelligence-feed-v1';
  const emptyRule = { dimensions: {}, levels: [], sentiments: [], eventCodes: [], publicationRange: '', sourceSites: [] };
  const additionalStarterSubscriptions = [
    { id: 'sample-manufacturing-aid', name: '制造业财政支持与申报项目', eventCodes: ['1.2'], sourceSites: ['policy-news.example'] },
    { id: 'sample-inspection-access', name: '工业检测机构与准入动态', eventCodes: ['1.3'], sourceSites: ['policy-news.example'] },
    { id: 'sample-component-standards', name: '汽车电子与零部件技术标准', eventCodes: ['4.4'], sourceSites: ['industry-observer.example'] },
    { id: 'sample-equipment-orders', name: '工业视觉与检测设备订单', eventCodes: ['7.4'], sourceSites: ['manufacturing-news.example'] },
    { id: 'sample-energy-storage', name: '工商业储能量产与交付动态', eventCodes: ['4.2', '9.1'],
      dimensions: { product: ['工商业储能'] }, sourceSites: ['manufacturing-news.example'] },
    { id: 'sample-power-semiconductors', name: '车规功率器件与碳化硅进展', eventCodes: ['4.1'],
      dimensions: { technology: ['碳化硅'] }, sourceSites: ['manufacturing-news.example'] },
    { id: 'sample-advanced-packaging', name: '先进封装与芯粒可靠性验证', eventCodes: ['4.4', '11.4'],
      dimensions: { technology: ['先进封装'] }, sourceSites: ['industry-observer.example'] },
    { id: 'sample-import-export', name: '工业设备进出口与贸易合规', eventCodes: ['2.3', '2.4', '2.9'],
      sourceSites: ['policy-news.example', 'industry-observer.example'] },
    { id: 'sample-raw-materials', name: '关键原材料价格与汇率行情', eventCodes: ['3.2', '3.5'], sourceSites: ['industry-observer.example'] },
    { id: 'sample-partner-investment', name: '重点企业扩产及园区战略合作', eventCodes: ['7.3', '7.5'], sourceSites: ['manufacturing-news.example'] },
    { id: 'sample-enterprise-compliance', name: '装备制造企业经营与合规动态', eventCodes: ['8.3', '9.6', '9.7'],
      sourceSites: ['manufacturing-news.example'] },
    { id: 'sample-park-logistics', name: '长三角园区物流与交付动态', eventCodes: ['5.2', '6.3', '6.4'],
      dimensions: { city: ['合肥市', '芜湖市'] }, sourceSites: ['policy-news.example', 'industry-observer.example'] }
  ].map(rule => ({ ...emptyRule, ...rule, enabled: true, sample: true, publicationRange: '6m' }));
  const starterGroupVersion = 2;
  const defaultState = { subscriptions: [...starterSubscriptions, ...additionalStarterSubscriptions], read: [], starterGroupVersion };
  const icon = (name, symbol) => `<span class="if-icon" data-icon="${name}" data-symbol="${symbol}" aria-hidden="true"></span>`;
  const main = document.querySelector('.main');
  if (!main) return;

  const root = document.createElement('section');
  root.id = 'intelligenceFeed';
  root.className = 'content view';
  root.setAttribute('aria-labelledby', 'intelligenceFeedHeading');
  root.innerHTML = `
    <header class="if-heading">
      <div><h1 id="intelligenceFeedHeading">产业情报中心</h1><p>订阅产业动态，查看事件研判和产业链风险。</p></div>
      <button class="if-button if-primary if-settings-trigger" type="button" data-if-action="settings"
        aria-haspopup="dialog" aria-controls="ifSubscriptionSettings">${icon('plus', '+')}订阅设置</button>
    </header>
    <div class="if-overview" aria-label="订阅概况">
      <div class="if-metrics"></div>
      <div class="if-today-breakdown" aria-labelledby="ifSentimentHeading"></div>
    </div>
    <div class="if-group-strip">
      <button class="if-group-arrow" type="button" data-if-scroll-groups="-1" aria-label="向左查看订阅分组" hidden>‹</button>
      <nav class="if-tabs if-group-tabs" aria-label="订阅信息流分组"></nav>
      <button class="if-group-arrow" type="button" data-if-scroll-groups="1" aria-label="向右查看订阅分组" hidden>›</button>
    </div>
    <p class="if-status" role="status" hidden></p>
    <div class="if-workspace"></div>`;
  main.appendChild(root);

  const settingsDialog = document.createElement('dialog');
  settingsDialog.id = 'ifSubscriptionSettings';
  settingsDialog.className = 'if-dialog if-settings-dialog';
  settingsDialog.setAttribute('aria-labelledby', 'ifSettingsTitle');
  settingsDialog.innerHTML = `
    <header class="if-dialog-header">
      <h2 id="ifSettingsTitle">我的订阅分组</h2>
      <button class="if-close" type="button" data-if-settings-close aria-label="关闭订阅设置">×</button>
    </header>
    <div class="if-dialog-body if-settings-body">
      <p class="if-status" role="status" hidden></p>
      <div class="if-settings-list"></div>
    </div>
    <footer class="if-dialog-footer">
      <button class="if-button" type="button" data-if-settings-close>完成</button>
      <button class="if-button if-primary" type="button" data-if-action="create" autofocus>新建订阅</button>
    </footer>`;
  document.body.appendChild(settingsDialog);

  const dialog = document.createElement('dialog');
  dialog.className = 'if-dialog';
  dialog.setAttribute('aria-labelledby', 'ifDialogTitle');
  document.body.appendChild(dialog);
  const sourceDialog = document.createElement('dialog');
  sourceDialog.id = 'ifSourceDialog';
  sourceDialog.className = 'if-dialog if-source-dialog';
  sourceDialog.setAttribute('aria-labelledby', 'ifSourceTitle');
  document.body.appendChild(sourceDialog);
  const metricsMount = root.querySelector('.if-metrics');
  const breakdownMount = root.querySelector('.if-today-breakdown');
  const groupStrip = root.querySelector('.if-group-strip');
  const groupTabs = root.querySelector('.if-group-tabs');
  const groupArrows = [...groupStrip.querySelectorAll('[data-if-scroll-groups]')];
  const workspace = root.querySelector('.if-workspace');
  const status = root.querySelector('.if-status');
  const settingsStatus = settingsDialog.querySelector('.if-status');
  const settingsList = settingsDialog.querySelector('.if-settings-list');
  const emptyFeedFilters = { read: '', search: '', sentiment: '', publicationRange: '', customPublicationWindow: null, publicationDraft: null, eventCodes: [] };
  const view = { ...emptyFeedFilters, subscription: '', sort: 'match', selected: '', collapsedAnalysis: new Set(), analyses: new Map(), analysisStream: null };
  let state = readState() || defaultState;
  let feedEventPicker;
  let focusBeforeDialog;
  let focusAfterSettings;
  let scoreEntries = new Map();
  let scoreTooltipAnchor;
  let scoreTooltipTimer;
  const scoreTooltip = document.createElement('div');
  scoreTooltip.id = 'ifScoreTooltip';
  scoreTooltip.className = 'if-score-tooltip';
  scoreTooltip.setAttribute('role', 'tooltip');
  scoreTooltip.hidden = true;
  document.body.appendChild(scoreTooltip);

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
      const subscriptions = stored.subscriptions.map(migrateSubscription).filter(isValidSubscription);
      // Extend only the untouched prototype defaults. Editing a group clears its sample flag.
      const hasOriginalDefaults = stored.starterGroupVersion === undefined &&
        stored.subscriptions.length === starterSubscriptions.length && starterSubscriptions.every(
          ({ id }) => subscriptions.some(rule => rule.id === id && rule.sample === true && rule.enabled)
        );
      return {
        subscriptions: hasOriginalDefaults ? [...subscriptions, ...additionalStarterSubscriptions] : subscriptions,
        read: stored.read.filter(id => sampleEvents.some(event => event.id === id)),
        starterGroupVersion
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
    const { category, subtypes, publicationRange, sourceSites, ...existing } = rule;
    const current = { ...existing, publicationRange: publicationRange ?? '', sourceSites: sourceSites ?? [] };
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
      publicationRanges.has(rule.publicationRange) &&
      Array.isArray(rule.sourceSites) && rule.sourceSites.every(site => typeof site === 'string' && site.trim()) &&
      Array.isArray(rule.eventCodes) && rule.eventCodes.every(code => subtypeLabels.has(code));
  }

  function setStatus(message) {
    const active = settingsDialog.open ? settingsStatus : status;
    const inactive = settingsDialog.open ? status : settingsStatus;
    active.hidden = !message;
    active.textContent = message;
    inactive.hidden = true;
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

  function publicationTimestamp(time) {
    return Date.parse(time.replace(' ', 'T') + '+08:00');
  }

  function publishedInRange(time, { days, months }, now) {
    const publishedAt = publicationTimestamp(time);
    const cutoff = new Date(now + publicationOffset);
    cutoff.setUTCHours(0, 0, 0, 0);
    if (months) {
      const targetMonth = cutoff.getUTCMonth() - months;
      const targetMonthEnd = new Date(Date.UTC(cutoff.getUTCFullYear(), targetMonth + 1, 0)).getUTCDate();
      cutoff.setUTCMonth(targetMonth, Math.min(cutoff.getUTCDate(), targetMonthEnd));
    } else {
      cutoff.setUTCDate(cutoff.getUTCDate() - days + 1);
    }
    return publishedAt >= cutoff.getTime() - publicationOffset && publishedAt <= now;
  }

  function matchScore(event, rule, now, components) {
    if (rule.levels.length && !rule.levels.includes(event.level)) return null;
    if (rule.sentiments.length && !rule.sentiments.includes(event.sentiment)) return null;
    if (rule.publicationRange && !publishedInRange(event.time, publicationRanges.get(rule.publicationRange), now)) return null;
    if (rule.sourceSites?.length && !rule.sourceSites.includes(eventSourceSite(event))) return null;

    let score = 60;
    components?.push({ label: '基础分', points: score });
    const addPoints = (label, points) => {
      score += points;
      components?.push({ label, points });
    };
    if (rule.eventCodes.length) {
      const matches = event.subtypes.filter(code => rule.eventCodes.includes(code));
      if (!matches.length) return null;
      // A specific subtype selection contributes more than a broad event category.
      addPoints('事件类型匹配', 8 + Math.round(8 / Math.sqrt(rule.eventCodes.length)) + Math.min(2, matches.length - 1));
    }
    for (const [key, weight] of Object.entries(dimensionWeights)) {
      const terms = rule.dimensions[key] || [];
      if (!terms.length) continue;
      const tags = (event.tags[key] || []).map(normalize);
      const keywords = terms.map(normalize);
      const label = dimensions[key].label;
      if (keywords.some(term => tags.includes(term))) addPoints(`${label}精确匹配`, weight);
      else if (keywords.some(term => tags.some(tag => tag.includes(term)))) addPoints(`${label}部分匹配`, weight * 0.7);
      else return null;
    }
    if (rule.levels.length) addPoints('影响层级匹配', Math.round(4 / rule.levels.length));
    if (rule.sentiments.length) addPoints('舆情性质匹配', Math.round(4 / rule.sentiments.length));
    return Math.min(100, Math.round(score));
  }

  function hits(now = Date.now()) {
    const enabled = state.subscriptions.filter(rule => rule.enabled);
    return sampleEvents.flatMap(event => {
      const matches = enabled.flatMap(rule => {
        const components = [];
        const score = matchScore(event, rule, now, components);
        return score === null ? [] : [{ rule, score, components }];
      });
      return matches.length ? [{ event, matches }] : [];
    });
  }

  function render({ resetFeedScroll = false } = {}) {
    if (!state.subscriptions.some(rule => rule.id === view.subscription)) view.subscription = '';
    const now = Date.now();
    const entries = hits(now);
    const active = state.subscriptions.filter(rule => rule.enabled).length;
    const today = entries.filter(({ event }) => publishedInRange(event.time, { days: 1 }, now));
    const yesterday = entries.filter(({ event }) => publishedInRange(event.time, { days: 2 }, now)).length - today.length;
    const delta = today.length - yesterday;
    const change = delta ? `<small class="if-metric-change" data-direction="${delta > 0 ? 'up' : 'down'}">${delta > 0 ? '+' : '−'} ${Math.abs(delta)} 较昨日</small>` : '';
    metricsMount.innerHTML = [
      { label: '生效订阅', value: active, unit: '个', glyph: icon('subscription', '▤') },
      { label: '情报总推送', value: entries.length, unit: '条', glyph: icon('intelligence', '▤') },
      { label: '今日新增', value: today.length, unit: '条', glyph: icon('plus', '+'), foot: change }
    ].map(({ label, value, unit, glyph, foot }) => `
      <div><span class="if-metric-label">${glyph}${label}</span>
        <strong>${value}<small class="if-metric-unit">${unit}</small></strong>${foot || ''}</div>`).join('');
    const breakdown = summarySentiments.map(sentiment => [
      sentiment, today.filter(({ event }) => event.sentiment === sentiment).length
    ]);
    breakdownMount.innerHTML = `
      <div id="ifSentimentHeading" class="if-today-breakdown-label">${icon('distribution', '▥')}今日舆情性质分布</div>
      <div class="if-sentiment-bar" aria-hidden="true">${today.length ? breakdown.map(([sentiment, count]) =>
        `<span data-sentiment="${sentiment}" style="flex-basis:${100 * count / today.length}%"></span>`).join('') : ''}</div>
      <div class="if-sentiment-legend">${breakdown.map(([sentiment, count]) => `
        <span class="if-sentiment" data-sentiment="${sentiment}"><i aria-hidden="true"></i><span>${sentiment}</span><b>${count}</b>条</span>`).join('')}</div>`;
    renderGroupTabs(entries);
    renderFeed(entries, now, resetFeedScroll);
    if (settingsDialog.open) renderSubscriptionSettings(now);
  }

  function updateGroupScrollControls() {
    const overflow = groupStrip.clientWidth > 0 && groupTabs.scrollWidth > groupStrip.clientWidth + 1;
    groupArrows.forEach(arrow => { arrow.hidden = !overflow; });
    const canScrollBack = overflow && groupTabs.scrollLeft > 1;
    const canScrollForward = overflow && groupTabs.scrollLeft + groupTabs.clientWidth < groupTabs.scrollWidth - 1;
    groupArrows[0].disabled = !canScrollBack;
    groupArrows[1].disabled = !canScrollForward;
    groupStrip.toggleAttribute('data-more-groups-left', canScrollBack);
    groupStrip.toggleAttribute('data-more-groups-right', canScrollForward);
  }

  function renderGroupTabs(entries) {
    const scrollLeft = groupTabs.scrollLeft;
    const previousGroup = groupTabs.querySelector('[aria-pressed="true"]')?.dataset.ifId;
    const counts = new Map([['', entries.length]]);
    for (const { matches } of entries) {
      for (const { rule } of matches) counts.set(rule.id, (counts.get(rule.id) || 0) + 1);
    }
    groupTabs.innerHTML = [{ id: '', name: '全部', enabled: true }, ...state.subscriptions].map(rule => `
      <button class="if-group-tab" type="button" data-if-action="group" data-if-id="${esc(rule.id)}"
        aria-pressed="${rule.id === view.subscription}" title="${esc(rule.name)}">
        <span class="if-group-name">${esc(rule.name)}</span><span class="if-group-count">(${counts.get(rule.id) || 0})</span>${rule.enabled ? '' : '<span class="if-group-state">已暂停</span>'}
      </button>`).join('');
    groupTabs.scrollLeft = scrollLeft;
    updateGroupScrollControls();
    if (previousGroup !== view.subscription) {
      const tab = groupTabs.querySelector('[aria-pressed="true"]').getBoundingClientRect();
      const viewport = groupTabs.getBoundingClientRect();
      if (tab.left < viewport.left) groupTabs.scrollLeft += tab.left - viewport.left;
      else if (tab.right > viewport.right) groupTabs.scrollLeft += tab.right - viewport.right;
    }
  }

  function renderFeed(entries, now, resetFeedScroll) {
    hideScoreTooltip();
    const listScroll = resetFeedScroll ? 0 : workspace.querySelector('.if-feed-items')?.scrollTop || 0;
    const search = normalize(view.search);
    const range = view.publicationRange === 'custom' ? null : publicationRanges.get(view.publicationRange);
    const customWindow = view.publicationRange === 'custom' ? view.customPublicationWindow : null;
    const visible = entries.flatMap(entry => {
      const { event, matches } = entry;
      const groupMatch = view.subscription ? matches.find(({ rule }) => rule.id === view.subscription) : null;
      if (view.subscription && !groupMatch) return [];
      if (view.sentiment && event.sentiment !== view.sentiment) return [];
      if (view.eventCodes.length && !event.subtypes.some(code => view.eventCodes.includes(code))) return [];
      if (view.publicationRange && range && !publishedInRange(event.time, range, now)) return [];
      if (customWindow) {
        const published = publicationTimestamp(event.time);
        if (!(published >= customWindow.startAt && published < customWindow.endBefore && published <= now)) return [];
      }
      const isRead = state.read.includes(event.id);
      const tags = Object.values(event.tags).flat();
      if (view.read === 'unread' && isRead || view.read === 'read' && !isRead) return [];
      if (search && !normalize([event.title, event.summary, publisher(event), ...tags].join(' ')).includes(search)) return [];
      const scoreMatch = groupMatch || matches.reduce((best, match) => match.score > best.score ? match : best);
      return [{ ...entry, scoreMatch, score: scoreMatch.score }];
    });
    visible.sort((a, b) => (view.sort === 'match' ? b.score - a.score : 0) || b.event.time.localeCompare(a.event.time));
    scoreEntries = new Map(visible.map(entry => [entry.event.id, entry]));
    const selected = visible.find(entry => entry.event.id === view.selected) || visible[0];
    view.selected = selected?.event.id || '';
    if (view.analysisStream && view.analysisStream.eventId !== view.selected) stopAnalysisStream();
    workspace.innerHTML = `
      <form class="if-filters" aria-label="筛选订阅信息流">
        <label class="if-search"><span class="if-sr">搜索情报</span>${icon('search', '⌕')}<input name="search" type="search" placeholder="搜索标题关键词" value="${esc(view.search)}"></label>
        <button type="submit" class="if-button if-primary if-search-submit">搜索</button>
        <label><span class="if-sr">阅读状态</span><select name="read">
          ${option('', '全部状态', view.read)}${option('unread', '仅未读', view.read)}${option('read', '仅已读', view.read)}
        </select></label>
        <label><span class="if-sr">发布日期</span><select name="publicationRange">
          ${publicationRangeOptions(view.publicationRange)}${option('custom', '自定义时间', view.publicationRange)}
        </select></label>
        <label><span class="if-sr">舆情性质</span><select name="sentiment">
          ${option('', '全部舆情性质', view.sentiment)}${sentiments.map(label => option(label, label, view.sentiment)).join('')}
        </select></label>
        ${eventPickerMarkup(true)}
        ${view.publicationRange === 'custom' ? publicationWindowMarkup() : ''}
      </form>
      <div class="if-feed-grid">
        <section class="if-card if-feed" aria-labelledby="ifListHeading">
          <header class="if-list-heading">
            <div class="if-list-heading-main">
              <h2 id="ifListHeading">情报总推送</h2>
              <span class="if-list-count">· ${visible.length} 条</span>
            </div>
            <div class="if-list-sort" role="group" aria-label="排序">
              <button type="button" data-if-action="sort" data-if-id="match" aria-pressed="${view.sort === 'match'}">智能排序</button>
              <button type="button" data-if-action="sort" data-if-id="time" aria-pressed="${view.sort === 'time'}">最新</button>
            </div>
          </header>
          <p class="if-list-sort-note">${view.sort === 'match' ? '按订阅条件匹配度从高到低排列，同分按发布时间倒序。' : '按发布时间倒序排列。'}</p>
          <div class="if-feed-items" role="region" aria-label="情报列表"${visible.length ? ' tabindex="0"' : ''}>
            ${visible.length ? visible.map(entry => eventRow(entry, view.selected, now)).join('') : emptyFeed()}
          </div>
        </section>
      ${selected ? eventDetail(selected) : '<div class="if-card if-empty if-detail-empty">选择一条情报查看详情</div>'}
      </div>`;
    if (view.analysisStream) workspace.querySelector('#ifAnalysisBody').replaceWith(view.analysisStream.body);
    workspace.querySelector('.if-feed-items').scrollTop = listScroll;
    feedEventPicker = bindEventPicker(workspace.querySelector('.if-filters'), view.eventCodes, {
      onConfirm(codes) {
        view.eventCodes = codes;
        render({ resetFeedScroll: true });
        workspace.querySelector('.if-feed-event-filter .if-event-picker-toggle').focus({ preventScroll: true });
      }
    });
  }

  function option(value, label, selected) {
    return `<option value="${esc(value)}"${value === selected ? ' selected' : ''}>${esc(label)}</option>`;
  }

  function publicationRangeOptions(selected, placeholder) {
    return Array.from(publicationRanges, ([value, { label }]) =>
      !value && placeholder
        ? `<option value="" disabled${selected ? '' : ' selected'}>${esc(placeholder)}</option>`
        : option(value, label, selected)
    ).join('');
  }

  function publicationWindowMarkup() {
    const selection = view.publicationDraft || view.customPublicationWindow || {};
    return `<fieldset class="if-publication-window">
      <legend>发布日期（北京时间）</legend>
      <label class="if-field"><span>开始时间</span><input name="publicationStart" type="datetime-local" value="${esc(selection.start)}"></label>
      <label class="if-field"><span>结束时间</span><input name="publicationEnd" type="datetime-local" value="${esc(selection.end)}"></label>
      <button type="submit" class="if-button" name="applyPublicationWindow" value="1">应用</button>
      <p class="if-form-error" data-if-publication-error role="alert" hidden></p>
    </fieldset>`;
  }

  function publicationWindowInputs(form) {
    return { start: form.elements.publicationStart.value, end: form.elements.publicationEnd.value };
  }

  function applyPublicationWindow(form) {
    const { start, end } = publicationWindowInputs(form);
    const startAt = start ? publicationTimestamp(start) : -Infinity;
    const endAt = end ? publicationTimestamp(end) : Infinity;
    const error = form.querySelector('[data-if-publication-error]');
    const message = !start && !end ? '请选择开始时间或结束时间。' :
      (Number.isNaN(startAt) || Number.isNaN(endAt) || startAt > endAt) ? '开始时间须早于或等于结束时间。' : '';
    if (message) {
      error.textContent = message;
      error.hidden = false;
      return;
    }
    view.customPublicationWindow = { start, end, startAt, endBefore: endAt + minute };
    view.publicationDraft = null;
    render({ resetFeedScroll: true });
    workspace.querySelector('[name="applyPublicationWindow"]').focus({ preventScroll: true });
  }

  function emptyFeed() {
    const group = state.subscriptions.find(rule => rule.id === view.subscription);
    if (group && !group.enabled) {
      return '<div class="if-empty"><strong>当前订阅分组已暂停</strong><button class="if-link" type="button" data-if-action="settings">打开订阅设置</button></div>';
    }
    if (view.read || view.search || view.sentiment || view.publicationRange || view.eventCodes.length) {
      return '<div class="if-empty"><strong>暂无符合当前筛选的情报</strong><button class="if-link" type="button" data-if-action="clear">清空筛选</button></div>';
    }
    if (group) {
      return `<div class="if-empty"><strong>当前订阅分组暂无匹配情报</strong><button class="if-link" type="button" data-if-action="edit" data-if-id="${esc(group.id)}">调整订阅条件</button><button class="if-link" type="button" data-if-action="group" data-if-id="">查看全部情报</button></div>`;
    }
    const message = state.subscriptions.some(rule => rule.enabled) ? '暂无订阅命中' : '暂无生效的订阅';
    return `<div class="if-empty"><strong>${message}</strong><button class="if-link" type="button" data-if-action="settings">打开订阅设置</button></div>`;
  }

  function publisher(event) {
    return event.sourceName || '发布机构未披露';
  }

  function eventRow({ event, score }, selected, now) {
    const unread = !state.read.includes(event.id);
    const isNew = unread && publishedInRange(event.time, { days: 1 }, now);
    const tone = score >= 90 ? 'high' : score >= 80 ? 'standard' : 'medium';
    return `<button class="if-event" type="button" data-category="${event.category}" data-if-action="event" data-if-id="${event.id}" aria-pressed="${event.id === selected}">
      <span class="if-event-main">
        <span class="if-event-meta">
          <span class="if-event-kind"><span class="if-badge">${categories.get(event.category).label}</span>
            ${isNew ? '<span class="if-event-new" aria-label="今日发布，未读">NEW</span>' : ''}</span>
          <time datetime="${event.time.replace(' ', 'T')}+08:00">${event.time.slice(5)}</time>
        </span>
        <strong>${unread && !isNew ? '<i class="if-unread-dot" aria-label="未读"></i>' : ''}${esc(event.title)}</strong>
        <span class="if-event-summary">${esc(event.summary)}</span>
        <span class="if-event-publisher" title="${esc(publisher(event))}">${icon('publisher', '♙')}${esc(publisher(event))}</span>
      </span>
      <span class="if-event-score" data-score-tone="${tone}" style="--if-score:${score}" role="img"
        aria-label="匹配度 ${score} 分，满分 100 分"><b>${score}</b></span>
    </button>`;
  }

  function hideScoreTooltip() {
    clearTimeout(scoreTooltipTimer);
    scoreTooltipAnchor?.closest('.if-event')?.removeAttribute('aria-describedby');
    scoreTooltipAnchor = null;
    scoreTooltip.hidden = true;
  }

  function positionScoreTooltip() {
    if (!scoreTooltipAnchor) return;
    if (!scoreTooltipAnchor.isConnected || !scoreTooltipAnchor.getClientRects().length) return hideScoreTooltip();
    const anchor = scoreTooltipAnchor.getBoundingClientRect();
    const list = scoreTooltipAnchor.closest('.if-feed-items').getBoundingClientRect();
    const { clientWidth: width, clientHeight: height } = document.documentElement;
    if (anchor.bottom <= Math.max(0, list.top) || anchor.top >= Math.min(height, list.bottom)) return hideScoreTooltip();

    const margin = 10;
    const gap = 9;
    const center = anchor.left + anchor.width / 2;
    const left = Math.max(margin, Math.min(anchor.right - scoreTooltip.offsetWidth, width - scoreTooltip.offsetWidth - margin));
    const below = height - anchor.bottom - gap - margin;
    const above = anchor.top - gap - margin;
    const displayAbove = below < scoreTooltip.firstElementChild.scrollHeight && above > below;
    scoreTooltip.dataset.side = displayAbove ? 'above' : 'below';
    scoreTooltip.style.setProperty('--if-score-tooltip-height', `${Math.max(0, displayAbove ? above : below)}px`);
    const top = displayAbove ? anchor.top - gap - scoreTooltip.offsetHeight : anchor.bottom + gap;
    scoreTooltip.style.left = `${left}px`;
    scoreTooltip.style.top = `${Math.max(margin, top)}px`;
    scoreTooltip.style.setProperty('--if-score-tooltip-arrow', `${center - left}px`);
  }

  function showScoreTooltip(anchor) {
    const card = anchor?.closest('.if-event');
    const entry = scoreEntries.get(card?.dataset.ifId);
    if (!entry) return;
    hideScoreTooltip();
    const { score, scoreMatch, matches } = entry;
    const formatPoints = points => Math.round(points * 10) / 10;
    const raw = formatPoints(scoreMatch.components.reduce((total, { points }) => total + points, 0));
    const adjustments = raw !== score ? `<p class="if-score-tooltip-note">原始得分 ${raw}，${raw > 100 ? '封顶为 100 分' : `四舍五入为 ${score} 分`}。</p>` : '';
    scoreTooltip.innerHTML = `<div class="if-score-tooltip-content">
      <div class="if-score-tooltip-total"><strong>匹配总分</strong><b>${score}<small> / 100</small></b></div>
      <dl>${scoreMatch.components.map(({ label, points }) => `<div><dt>${label}</dt><dd>${label === '基础分' ? '' : '+'}${formatPoints(points)} 分</dd></div>`).join('')}</dl>
      ${adjustments}
      <div class="if-score-tooltip-sources"><strong>命中订阅</strong><ul>${matches.map(match =>
        `<li><span>${esc(match.rule.name)}${match === scoreMatch && matches.length > 1 ? ' <small>计分</small>' : ''}</span><b>${match.score} 分</b></li>`).join('')}</ul></div>
    </div>`;
    scoreTooltip.style.removeProperty('--if-score-tooltip-height');
    scoreTooltipAnchor = anchor;
    scoreTooltip.hidden = false;
    card.setAttribute('aria-describedby', scoreTooltip.id);
    positionScoreTooltip();
  }

  function leaveScoreTooltip(destination) {
    if (scoreTooltip.contains(destination) || scoreTooltipAnchor?.contains(destination)) return;
    clearTimeout(scoreTooltipTimer);
    scoreTooltipTimer = setTimeout(hideScoreTooltip, 150);
  }

  function eventDetail({ event, matches }) {
    const unread = !state.read.includes(event.id);
    const tagRows = ['city', 'company', 'person', 'product', 'technology']
      .filter(key => event.tags[key]?.length)
      .map(key => `<div><dt>${dimensions[key].label}</dt><dd>${event.tags[key].map(value => `<span class="if-badge if-plain">${esc(value)}</span>`).join('')}</dd></div>`);
    const original = webLink(event.sourceUrl);
    const sourceLabel = `查看原文 ${icon('external', '↗')}`;
    const source = original
      ? `<a class="if-source-link" href="${esc(original)}" target="_blank" rel="noopener noreferrer">${sourceLabel}</a>`
      : `<a class="if-source-link" href="?module=intelligenceFeed&amp;original=${encodeURIComponent(event.id)}" data-if-action="source" data-if-id="${esc(event.id)}">${sourceLabel}</a>`;

    return `<article class="if-card if-detail" aria-labelledby="ifEventTitle">
      <header>
        <div class="if-detail-title">
          <h2 id="ifEventTitle">${esc(event.title)}</h2>
          <p class="if-detail-date if-detail-meta"><span class="if-sr">发文来源机构</span><span class="if-source-name">${esc(publisher(event))}</span><span aria-hidden="true">·</span><time datetime="${event.time.replace(' ', 'T')}+08:00">${event.time}</time><span aria-hidden="true">·</span>${source}</p>
        </div>
        <button class="if-button if-detail-read" type="button" data-if-action="read" data-if-id="${event.id}">${unread ? '标为已读' : '标为未读'}</button>
      </header>
      <section><h3>事件标签</h3>
        <dl class="if-tag-rows">
          <div class="if-tag-wide"><dt>事件类型</dt><dd><span class="if-badge">${categories.get(event.category).label}</span>${event.subtypes.map(code => `<span class="if-badge if-plain">${subtypeLabels.get(code)}</span>`).join('')}</dd></div>
          <div><dt>影响层级</dt><dd><span class="if-badge if-plain">${event.level}</span></dd></div>
          <div><dt>舆情性质</dt><dd><span class="if-badge if-sentiment" data-sentiment="${event.sentiment}">${event.sentiment}</span></dd></div>
          ${tagRows.join('')}
        </dl>
      </section>
      <section><h3>事件摘要</h3><p>${esc(event.summary)}</p></section>
      <section><h3>命中订阅</h3><ul class="if-matches">${matches.map(({ rule }) => `
        <li><span class="if-match-icon" aria-hidden="true">${icon('subscription', '▤')}</span>
          <div><b>${esc(rule.name)}</b><span>${ruleTags(rule, event).map(esc).join(' · ')}</span></div></li>`).join('')}</ul>
      </section>
      ${eventAnalysis(event)}
    </article>`;
  }

  function webLink(value) {
    try {
      const url = new URL(value);
      if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
    } catch {}
    return '';
  }

  function eventSourceSite(event) {
    const original = webLink(event.sourceUrl);
    if (original) return new URL(original).hostname.replace(/^www\./, '');
    return demoSourceSites.has(event.sourceSite) ? event.sourceSite : '';
  }

  function sourceSiteLabel(site) {
    return demoSourceSites.get(site) || site;
  }

  function openSource(event) {
    if (!event || sourceDialog.open) return;
    sourceDialog.innerHTML = `<article class="if-source-document">
      <header class="if-dialog-header">
        <div><p>原文 · 原型演示稿</p><h2 id="ifSourceTitle">${esc(event.title)}</h2><p>${esc(publisher(event))} · ${esc(event.time)}</p></div>
        <button class="if-close" type="button" data-if-source-close aria-label="关闭原文">×</button>
      </header>
      <div class="if-dialog-body"><p>${esc(event.summary)}</p>${event.sourceText ? `<p>${esc(event.sourceText)}</p>` : ''}</div>
    </article>`;
    sourceDialog.showModal();
  }

  function prepareAnalysis(event) {
    const basis = window.zhiyanIntelligenceAnalysis?.[event.id];
    if (!basis) return;
    const subjects = ['company', 'product', 'technology', 'person', 'city']
      .flatMap(key => event.tags[key] || []).slice(0, 4);
    const direction = {
      反面: '优先核查直接暴露与影响扩散的条件',
      正面: '优先核查机会兑现的门槛与受益条件',
      中立: '优先确认变化范围与触发下一阶段判断的信号'
    }[event.sentiment];
    const scope = '按' + event.level + '层级分析' + (subjects.length ? '，关注' + subjects.join('、') : '') + '。' + direction + '。';
    const history = (window.zhiyanIntelligenceHistory?.[event.id] || [])
      .map(item => ({ ...item, url: webLink(item.url) })).filter(item => item.url);
    return { ...basis, scope, history };
  }

  function eventAnalysis(event) {
    const analysis = view.analyses.get(event.id);
    const running = view.analysisStream?.eventId === event.id;
    const available = Boolean(window.zhiyanIntelligenceAnalysis?.[event.id]);
    const expanded = !view.collapsedAnalysis.has(event.id);
    const output = running ? `<div id="ifAnalysisBody" class="if-analysis-body" aria-busy="true"></div>` :
      analysis ? `<div id="ifAnalysisBody" class="if-analysis-body"${expanded ? '' : ' hidden'}>${analysisSections(analysis).join('')}</div>` : '';
    return `<section class="if-analysis" aria-labelledby="ifAnalysisTitle">
      ${analysisHeader(event.id, { analysis, running, available, expanded })}
      ${output}
    </section>`;
  }

  function analysisHeader(id, { analysis, running, available, expanded }) {
    const description = running ? '正在生成分析…' : analysis ? '基于当前事件信息的规则研判' :
      available ? '按需研判传导路径、影响与应对措施。' : '目前暂无这条情报的分析依据。';
    const controls = running ?
      `<button type="button" class="if-button if-analysis-stop" data-if-action="cancel-analysis" data-if-id="${esc(id)}">停止生成</button>` :
      analysis ? `<button type="button" class="if-button if-analysis-toggle" data-if-action="analysis" data-if-id="${esc(id)}"
        aria-expanded="${expanded}" aria-controls="ifAnalysisBody">${expanded ? '收起分析' : '展开分析'}</button>` :
      available ? `<button type="button" class="if-button if-primary" data-if-action="generate-analysis" data-if-id="${esc(id)}">生成分析</button>` : '';
    return `<header class="if-analysis-head">
      <div class="if-analysis-heading"><span class="if-analysis-icon" aria-hidden="true">${icon('analysis', '✦')}</span>
        <div><h3 id="ifAnalysisTitle">AI 推理分析</h3><p role="status"${running ? ' class="if-analysis-progress"' : ''}>${description}</p></div></div>
      ${controls}
    </header>`;
  }

  function analysisSections(analysis) {
    return [
      `<div class="if-analysis-summary"><p>${esc(analysis.scope)}</p>${analysis.summary ? `<p>${esc(analysis.summary)}</p>` : ''}</div>`,
      `<section class="if-analysis-block">
        <h4>产业链传导路径</h4>
        <ol class="if-transmission">
          ${analysis.transmission.map(({ segment, impact }) => `
            <li><strong>${esc(segment)}</strong><p>${esc(impact)}</p></li>`).join('')}
        </ol>
      </section>`,
      `<div class="if-analysis-impacts">
        ${impactCard('行业影响', analysis.industry)}
        ${impactCard('企业影响', analysis.enterprise)}
      </div>`,
      `<section class="if-analysis-block">
        <h4>企业应对措施</h4>
        <ul class="if-analysis-actions">
          ${analysis.actions.map(({ priority, title, detail }) => `
            <li><span class="if-analysis-priority" data-priority="${esc(priority)}">${esc(priority)}</span><div><strong>${esc(title)}</strong><p>${esc(detail)}</p></div></li>`).join('')}
        </ul>
      </section>`,
      `<section class="if-analysis-evidence">
        <h4>历史相似事件参考</h4>
        ${analysis.history.length ? `<ul class="if-history-cases">${analysis.history.map(item => `
          <li class="if-history-case">
            <a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.title)}</a>
            <span><time datetime="${esc(item.date)}">${esc(item.date)}</time> · ${esc(item.source)}</span>
            <p>${esc(item.similarity)}</p>
          </li>`).join('')}</ul>` : '<p>暂无可引用的历史相似事件。</p>'}
      </section>`
    ];
  }

  function impactCard(title, { impact, watch }) {
    return `<article class="if-analysis-impact">
      <h4>${title}</h4><p>${esc(impact)}</p>
      <p class="if-analysis-watch"><b>观察项</b> ${esc(watch)}</p>
    </article>`;
  }

  function* streamAnalysisContent(body, sections) {
    const template = document.createElement('template');
    for (const markup of sections) {
      template.innerHTML = markup;
      const paragraphs = [...template.content.querySelectorAll('p')];
      const chunks = paragraphs.flatMap(paragraph => Array.from(paragraph.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE && node.data.trim())
        .map(node => {
          const text = Array.from(node.data);
          node.data = '';
          return { node, text };
        }));
      body.append(template.content);
      for (const { node, text } of chunks) {
        for (let offset = 0; offset < text.length; offset += 24) {
          node.appendData(text.slice(offset, offset + 24).join(''));
          yield;
        }
      }
    }
  }

  function stopAnalysisStream() {
    if (!view.analysisStream) return;
    clearTimeout(view.analysisStream.timer);
    view.analysisStream = null;
  }

  function startAnalysis(event, panel) {
    if (view.analysisStream || view.analyses.has(event.id)) return;
    const analysis = prepareAnalysis(event);
    if (!analysis) return;
    const stream = { eventId: event.id, body: null, timer: null };
    view.analysisStream = stream;
    panel.outerHTML = eventAnalysis(event);
    stream.body = workspace.querySelector('#ifAnalysisBody');
    workspace.querySelector('[data-if-action="cancel-analysis"]').focus({ preventScroll: true });
    const frames = streamAnalysisContent(stream.body, analysisSections(analysis));

    function step() {
      if (stream !== view.analysisStream) return;
      if (!root.classList.contains('show')) {
        stopAnalysisStream();
        stream.body.closest('.if-analysis').outerHTML = eventAnalysis(event);
        return;
      }
      if (!frames.next().done) {
        stream.timer = window.setTimeout(step, 50);
        return;
      }
      stopAnalysisStream();
      view.analyses.set(event.id, analysis);
      stream.body.removeAttribute('aria-busy');
      const header = stream.body.previousElementSibling;
      const focused = header.contains(document.activeElement);
      header.outerHTML = analysisHeader(event.id, { analysis, expanded: true });
      if (focused) workspace.querySelector('[data-if-action="analysis"]').focus({ preventScroll: true });
    }

    step();
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
    const eventTypes = event ? rule.eventCodes.filter(code => event.subtypes.includes(code)).map(code => subtypeLabels.get(code)) :
      shortEventLabels(rule.eventCodes);
    if (eventTypes.length) tags.push(...eventTypes);
    if (rule.levels.length) tags.push('影响层级 ' + (event ? event.level : rule.levels.join('、')));
    if (rule.sentiments.length) tags.push('舆情性质 ' + (event ? event.sentiment : rule.sentiments.join('、')));
    if (rule.publicationRange) tags.push('发布日期 ' + publicationRanges.get(rule.publicationRange).label);
    if (rule.sourceSites?.length) {
      const sites = event ? [eventSourceSite(event)] : rule.sourceSites;
      tags.push('信源站点 ' + sites.map(sourceSiteLabel).join('、'));
    }
    return tags;
  }

  function renderSubscriptionSettings(now = Date.now()) {
    settingsList.innerHTML = state.subscriptions.length ?
      `<div class="if-sub-grid">${state.subscriptions.map(rule => subscriptionCard(rule, now)).join('')}</div>` :
      '<div class="if-card if-empty"><strong>还没有订阅分组</strong></div>';
  }

  function openSubscriptionSettings(button) {
    focusAfterSettings = button;
    renderSubscriptionSettings();
    settingsDialog.showModal();
    setStatus('');
  }

  function subscriptionCard(rule, now) {
    const count = rule.enabled ? sampleEvents.filter(event => matchScore(event, rule, now) !== null).length : 0;
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
        ? [category.label + '（全部）']
        : leaves.map(({ label }) => label);
    });
    return labels.length > 4 ? [...labels.slice(0, 4), '另 ' + (labels.length - 4) + ' 项'] : labels;
  }

  function eventPickerMarkup(feed = false) {
    const prefix = feed ? 'ifFeedEvent' : 'ifEvent';
    return `<fieldset class="if-event-field${feed ? ' if-feed-event-filter' : ''}">
      <legend${feed ? ' class="if-sr"' : ''}>事件类型</legend>
      <button class="if-event-picker-toggle" type="button" aria-expanded="false" aria-controls="${prefix}Picker"${feed ? '' : ' aria-describedby="ifEventPickerHint"'}>
        <span data-if-event-value>不限事件类型</span><i aria-hidden="true">⌄</i>
      </button>
      ${feed ? '' : `<div class="if-event-picker-summary" data-if-event-summary hidden></div>
      <p class="if-help if-event-picker-hint" id="ifEventPickerHint">可跨类别多选，勾选一级即选中该类全部二级事件。任一所选事件类型命中即可。</p>`}
      <div class="if-event-picker" id="${prefix}Picker" hidden>
        <div class="if-event-picker-search"><input type="search" autocomplete="off" spellcheck="false" aria-label="搜索事件类型" placeholder="搜索事件类型"></div>
        <div class="if-event-picker-columns">
          <div role="group" aria-labelledby="${prefix}ParentsTitle">
            <div class="if-event-picker-column-title" id="${prefix}ParentsTitle">一级事件类型</div>
            <div class="if-event-picker-options" data-if-event-parents></div>
          </div>
          <div role="group" aria-labelledby="${prefix}ChildrenTitle">
            <div class="if-event-picker-column-title" id="${prefix}ChildrenTitle">二级事件类型</div>
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

  function bindEventPicker(form, initialCodes, { onConfirm, onClose } = {}) {
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
      const labels = shortEventLabels(applied);
      trigger.querySelector('[data-if-event-value]').textContent = applied.length ?
        (summary ? `已选 ${applied.length} 项二级事件类型` : `事件类型 · 已选 ${applied.length} 项`) : '不限事件类型';
      if (summary) {
        summary.hidden = !applied.length;
        summary.innerHTML = labels.map(label => `<span class="if-badge">${esc(label)}</span>`).join('');
      } else trigger.title = labels.join('、');
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
          <span>${esc(label)}</span>
        </label>`).join('') : '<p class="if-event-picker-empty">暂无可显示的二级事件类型</p>';
      updateSelection();
    }

    function renderColumns() {
      visibleGroups = eventPickerGroups(normalize(search.value));
      parents.innerHTML = visibleGroups.length ? visibleGroups.map(({ code, label }) => `
        <div class="if-event-parent">
          <label><input type="checkbox" value="${code}" data-if-parent="${code}" aria-label="选择 ${esc(label)} 下的全部二级事件"></label>
          <button type="button" data-if-drill="${code}" aria-pressed="false">
            <span>${esc(label)}</span><span class="if-event-next" aria-hidden="true">›</span>
          </button>
        </div>`).join('') : '<p class="if-event-picker-empty">没有找到匹配的事件类型</p>';
      parents.scrollTop = 0;
      renderChildren(visibleGroups.find(group => group.code === active) || visibleGroups[0]);
    }

    function closePicker(restoreFocus = true) {
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      renderApplied();
      onClose?.();
      if (restoreFocus) trigger.focus({ preventScroll: true });
    }

    trigger.addEventListener('click', () => {
      if (!panel.hidden) return closePicker();
      draft = new Set(applied);
      search.value = '';
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      renderColumns();
      if (summary) panel.scrollIntoView({ block: 'nearest' });
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
      onConfirm?.(applied);
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
      dismiss: () => { if (!panel.hidden) closePicker(false); },
      confirm
    };
  }

  function formDialog(rule) {
    const data = rule || { name: '', ...emptyRule };
    const chosenSites = data.sourceSites || [];
    const siteOptions = [...new Set([...availableSourceSites, ...chosenSites])]
      .map(code => ({ code, label: sourceSiteLabel(code) }));
    focusBeforeDialog = document.activeElement;
    dialog.innerHTML = `
      <form class="if-rule-form">
        <header class="if-dialog-header">
          <div><h2 id="ifDialogTitle">${rule ? '编辑订阅' : '新建订阅'}</h2><p>同一维度内任一值命中即可，已设置的不同条件需同时满足。</p></div>
          <button type="button" class="if-close" data-if-close aria-label="关闭">×</button>
        </header>
        <div class="if-dialog-body">
          <div class="if-fields">
            <label class="if-field"><span>订阅名称 <em>必填</em></span><input name="name" required maxlength="60" placeholder="如合肥先进制造动态" value="${esc(data.name)}" autofocus></label>
            <label class="if-field"><span>发布日期范围 <em>必填</em></span><select name="publicationRange" required aria-describedby="ifRulePublicationError">
              ${publicationRangeOptions(data.publicationRange, '请选择发布日期范围')}
            </select><small class="if-form-error" id="ifRulePublicationError" role="alert" hidden>请选择发布日期范围。</small></label>
          </div>
          <fieldset aria-describedby="ifRuleSourceHint ifRuleSourceError">
            <legend>信源站点 <em>必填</em></legend>
            <p class="if-help" id="ifRuleSourceHint">至少选择一个站点，可多选，任一站点命中即可。当前为演示站点。</p>
            <div class="if-chips">${chips('sourceSites', siteOptions, chosenSites)}</div>
            <p class="if-form-error if-source-error" id="ifRuleSourceError" role="alert" hidden>请至少选择一个信源站点。</p>
          </fieldset>
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
          <p class="if-form-error" data-if-rule-error role="alert" hidden></p>
        </div>
        <footer class="if-dialog-footer"><button class="if-button" type="button" data-if-close>取消</button><button class="if-button if-primary" type="submit">保存订阅</button></footer>
      </form>`;
    const form = dialog.querySelector('form');
    const publication = form.elements.namedItem('publicationRange');
    const publicationError = form.querySelector('#ifRulePublicationError');
    const sourceError = form.querySelector('#ifRuleSourceError');
    const picker = bindEventPicker(form, data.eventCodes, { onClose: () => showFormError('') });
    publication.addEventListener('invalid', () => {
      publication.setAttribute('aria-invalid', 'true');
      publicationError.hidden = false;
    });
    form.addEventListener('change', event => {
      showFormError('');
      if (event.target === publication) {
        publication.removeAttribute('aria-invalid');
        publicationError.hidden = true;
      }
      if (event.target.name === 'sourceSites' && event.target.checked) sourceError.hidden = true;
    });
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
    const error = dialog.querySelector('[data-if-rule-error]');
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
    const publicationRange = fields.get('publicationRange');
    const sourceSites = fields.getAll('sourceSites');
    if (!name) {
      showFormError('请填写订阅名称。');
      form.elements.namedItem('name').focus();
      return;
    }
    if (!publicationRange) {
      form.elements.namedItem('publicationRange').reportValidity();
      return;
    }
    if (!sourceSites.length) {
      form.querySelector('#ifRuleSourceError').hidden = false;
      form.querySelector('input[name="sourceSites"]')?.focus();
      return;
    }
    const terms = Object.fromEntries(Object.keys(dimensions).map(key => [key, splitTerms(fields.get(key))]));
    const rule = {
      id: original?.id || (window.crypto?.randomUUID?.() || 'subscription-' + Date.now() + '-' + Math.random().toString(36).slice(2)),
      name, enabled: original?.enabled ?? true, sample: false,
      dimensions: terms, levels: selectedLevels, sentiments: selectedSentiments, eventCodes, publicationRange, sourceSites
    };
    if (!isValidSubscription(rule)) {
      showFormError('订阅条件包含无法识别的选项，请检查后重试。');
      return;
    }
    if (!original) Object.assign(view, emptyFeedFilters, { subscription: rule.id, selected: '' });
    saveState(current => ({
      ...current,
      subscriptions: original ? current.subscriptions.map(item => item.id === rule.id ? rule : item) : [rule, ...current.subscriptions]
    }), original ? '订阅规则已更新，信息流已重新匹配。' : '订阅已创建，信息流已按规则匹配。');
    render({ resetFeedScroll: !original || view.subscription === rule.id });
    focusBeforeDialog = settingsDialog.open
      ? actionButton(settingsDialog, 'edit', rule.id)
      : activeGroupTab();
    dialog.close();
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
      render();
      focusBeforeDialog = settingsDialog.querySelector('[data-if-action="create"]');
      dialog.close();
    });
    dialog.showModal();
  }

  function openEvent(id) {
    if (typeof window.show === 'function') window.show(root.id);
    Object.assign(view, emptyFeedFilters, { subscription: '', selected: id || '' });
    setStatus(id && !hits().some(entry => entry.event.id === id) ? '这条情报未命中当前生效的订阅。' : '');
    render({ resetFeedScroll: true });
  }

  function actionButton(container, action, id) {
    return [...container.querySelectorAll('[data-if-action="' + action + '"]')].find(item => item.dataset.ifId === id);
  }

  function activeGroupTab() {
    return groupTabs.querySelector('[aria-pressed="true"]');
  }

  function handleSubscriptionAction(button) {
    const { ifAction: action, ifId: id } = button.dataset;
    if (action === 'settings') {
      openSubscriptionSettings(button);
      return true;
    }
    if (action === 'create') {
      formDialog();
      return true;
    }
    const rule = state.subscriptions.find(item => item.id === id);
    if (!rule) return false;
    if (action === 'edit') {
      formDialog(rule);
      return true;
    }
    if (action === 'remove') {
      confirmRemove(rule);
      return true;
    }
    if (action === 'ruleFeed') {
      Object.assign(view, emptyFeedFilters, { subscription: rule.id, selected: '' });
      render({ resetFeedScroll: true });
      focusAfterSettings = activeGroupTab();
      settingsDialog.close();
      return true;
    }
    if (action === 'toggle') {
      saveState(current => ({
        ...current,
        subscriptions: current.subscriptions.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item)
      }), rule.enabled ? '已暂停该订阅。' : '已恢复该订阅。');
      render();
      actionButton(settingsDialog, 'toggle', id)?.focus();
      return true;
    }
    return false;
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('[data-if-action]');
    if (!button) return;
    const { ifAction: action, ifId: id } = button.dataset;
    if (handleSubscriptionAction(button)) return;
    if (action === 'analysis') return toggleAnalysis(button, id);
    if (action === 'generate-analysis' || action === 'cancel-analysis') {
      const selected = sampleEvents.find(item => item.id === id);
      if (!selected) return;
      const panel = button.closest('.if-analysis');
      if (action === 'generate-analysis') startAnalysis(selected, panel);
      else {
        stopAnalysisStream();
        panel.outerHTML = eventAnalysis(selected);
        workspace.querySelector('[data-if-action="generate-analysis"]').focus({ preventScroll: true });
      }
      return;
    }
    if (action === 'source') {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openSource(sampleEvents.find(item => item.id === id));
      return;
    }
    if (action === 'sort' && view.sort === id) return;
    const tappedScore = action === 'event' && (event.pointerType === 'touch' || event.sourceCapabilities?.firesTouchEvents)
      ? event.target.closest('.if-event-score') : null;
    const openTappedScore = tappedScore && tappedScore !== scoreTooltipAnchor;
    setStatus('');
    if (action === 'group') view.subscription = id;
    if (action === 'sort') view.sort = id;
    if (action === 'clear') Object.assign(view, emptyFeedFilters);
    if (action === 'event') view.selected = id;
    if (action === 'read') {
      const markRead = !state.read.includes(id);
      saveState(current => ({
        ...current,
        read: markRead ? [...new Set([...current.read, id])] : current.read.filter(item => item !== id)
      }), markRead ? '已标为已读。' : '已标为未读。');
    }
    render({ resetFeedScroll: action === 'group' || action === 'sort' || action === 'clear' });
    if (!button.isConnected) (actionButton(root, action, id) || activeGroupTab())?.focus({ preventScroll: true });
    if (openTappedScore) showScoreTooltip(actionButton(workspace, 'event', id)?.querySelector('.if-event-score'));
    else if (tappedScore) hideScoreTooltip();
  });

  groupTabs.addEventListener('scroll', updateGroupScrollControls, { passive: true });
  for (const arrow of groupArrows) {
    arrow.addEventListener('click', () => groupTabs.scrollBy({
      left: Math.max(180, groupTabs.clientWidth * 0.65) * Number(arrow.dataset.ifScrollGroups),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    }));
  }
  new ResizeObserver(updateGroupScrollControls).observe(groupStrip);

  workspace.addEventListener('submit', event => {
    if (!event.target.matches('.if-filters')) return;
    event.preventDefault();
    if (event.submitter?.name === 'applyPublicationWindow' || document.activeElement?.matches('.if-publication-window input')) {
      applyPublicationWindow(event.target);
      return;
    }
    view.search = event.target.elements.search.value.trim();
    render({ resetFeedScroll: true });
    workspace.querySelector('input[name="search"]').focus({ preventScroll: true });
  });

  workspace.addEventListener('change', event => {
    if (!event.target.matches('.if-filters > label select')) return;
    const { name, value } = event.target;
    view[name] = value;
    render({ resetFeedScroll: true });
    workspace.querySelector('select[name="' + name + '"]').focus({ preventScroll: true });
  });

  workspace.addEventListener('input', event => {
    if (!event.target.matches('.if-publication-window input')) return;
    view.publicationDraft = publicationWindowInputs(event.target.form);
    event.target.form.querySelector('[data-if-publication-error]').hidden = true;
  });
  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('.if-feed-event-filter')) feedEventPicker?.dismiss();
  });

  workspace.addEventListener('pointerover', event => {
    const anchor = event.target.closest('.if-event-score');
    if (event.pointerType !== 'touch' && anchor && !anchor.contains(event.relatedTarget)) showScoreTooltip(anchor);
  });
  workspace.addEventListener('pointerout', event => {
    if (scoreTooltipAnchor?.contains(event.target) && event.pointerType !== 'touch') leaveScoreTooltip(event.relatedTarget);
  });
  workspace.addEventListener('focusin', event => {
    if (event.target.matches('.if-event:focus-visible')) showScoreTooltip(event.target.querySelector('.if-event-score'));
  });
  workspace.addEventListener('focusout', event => {
    if (event.target === scoreTooltipAnchor?.closest('.if-event')) hideScoreTooltip();
  });
  scoreTooltip.addEventListener('pointerenter', () => clearTimeout(scoreTooltipTimer));
  scoreTooltip.addEventListener('pointerleave', event => leaveScoreTooltip(event.relatedTarget));
  document.addEventListener('pointerdown', event => {
    if (!scoreTooltip.contains(event.target) && !scoreTooltipAnchor?.contains(event.target)) hideScoreTooltip();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') hideScoreTooltip();
  });
  document.addEventListener('scroll', positionScoreTooltip, { capture: true, passive: true });
  window.addEventListener('resize', positionScoreTooltip);
  new MutationObserver(positionScoreTooltip).observe(root, { attributes: true, attributeFilter: ['class'] });

  settingsDialog.addEventListener('click', event => {
    if (event.target === settingsDialog || event.target.closest('[data-if-settings-close]')) {
      settingsDialog.close();
      return;
    }
    const button = event.target.closest('[data-if-action]');
    if (button) handleSubscriptionAction(button);
  });
  settingsDialog.addEventListener('close', () => {
    const target = focusAfterSettings?.isConnected ? focusAfterSettings : root.querySelector('.if-settings-trigger');
    target.focus();
    focusAfterSettings = null;
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target.closest('[data-if-close]')) dialog.close();
  });
  dialog.addEventListener('close', () => {
    const target = focusBeforeDialog?.isConnected ? focusBeforeDialog :
      settingsDialog.open ? settingsDialog.querySelector('[data-if-action="create"]') : activeGroupTab();
    target?.focus();
    focusBeforeDialog = null;
  });
  sourceDialog.addEventListener('click', event => {
    if (event.target === sourceDialog || event.target.closest('[data-if-source-close]')) sourceDialog.close();
  });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== legacyStorageKey && event.key !== null) return;
    state = readState() || defaultState;
    render();
  });

  window.ZhiyanIntelligence = Object.freeze({ openEvent });
  render();
  const params = new URLSearchParams(window.location.search);
  if (params.get('module') === root.id) {
    const original = params.get('original');
    openEvent(params.get('event') || original);
    if (original) openSource(sampleEvents.find(item => item.id === original));
  }
})();

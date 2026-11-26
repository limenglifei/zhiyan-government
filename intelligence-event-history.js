(function () {
  'use strict';

  function historical(title, date, source, url, similarity) {
    return { title, date, source, url, similarity };
  }

  window.zhiyanIntelligenceHistory = {
    'sic-validation': [historical(
      'Infineon introduces HybridPACK™ Drive G2, a new automotive power module for traction inverter in electric vehicles',
      '2023-04-28', '英飞凌技术公告', 'https://www.infineon.com/technology-news/2023/infatv202304-096',
      '公告涵盖车规碳化硅功率模块、评估套件和客户导入支持，可对照模块验证与系统适配之间的衔接。英飞凌公告发布时已有首批型号投产，当前演示事件处于首轮验证。'
    )],
    'pilot-guidance': [historical(
      '工业和信息化部 国家发展改革委关于印发《制造业中试创新发展实施意见》的通知',
      '2024-01-23', '工业和信息化部、国家发展改革委', 'https://www.miit.gov.cn/jgsj/kjs/gzdt/art/2024/art_49c273b1367648958d68019b36f605a6.html',
      '正式文件提出健全中试服务平台体系，可对照中试验证能力与服务供给的组织方式。本地征求意见稿的申报资格、资金安排和开放目录需另核。'
    )],
    'packaging-standard': [historical(
      '集成电路TSV三维封装可靠性试验方法指南（GB/Z 43510-2023）',
      '2023-12-28', '国家市场监督管理总局、国家标准化管理委员会', 'https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=7C8DEC6921D2FF6ACDFAB5C7E737FEFD',
      '国内已发布的 TSV 三维封装可靠性试验方法指南，可对照封装试验记录和标准适用范围。其对象为 TSV 三维封装，当前草稿的热循环条件和适用技术范围需以草稿原文核对。'
    ), historical(
      'Environmental testing – Part 2-14: Tests – Test N: Change of temperature（IEC 60068-2-14:2023）',
      '2023-07-27', '国际电工委员会（IEC）', 'https://webstore.iec.ch/en/publication/71503',
      '文件采用规定的环境温度变化检验试样受影响情况，可对照温变测试参数和试样口径。该文件属于通用环境试验标准，封装专项判据需结合适用文件。'
    )],
    'logistics-window': [historical(
      'MV Ever Given incident - 23 March 2021',
      '2021-03-23', '国际海事组织（IMO）秘书长声明', 'https://www.imo.org/en/MediaCentre/SecretaryGeneral/Pages/MV-Ever-Given-incident.aspx',
      '声明记录长赐号搁浅导致苏伊士运河临时停航，以及船只脱浅后恢复通行。可对照航线中断期间的在途延误核查与复航跟踪。该案是国际干线阻塞，园区支线的持续时间和缺货程度需按实际订单测算。'
    )],
    'equipment-trade': [historical(
      'Implementation of Additional Export Controls: Certain Advanced Computing and Semiconductor Manufacturing Items; Supercomputer and Semiconductor End Use; Entity List Modification',
      '2022-10-13', '美国商务部工业与安全局（《联邦公报》）', 'https://www.govinfo.gov/content/pkg/FR-2022-10-13/pdf/2022-21658.pdf',
      '该历史规则对部分半导体制造物项新增出口管制，并按不同条款规定生效日期。可对照核验物项分类、目的地和许可条件。演示中的精密检测设备与关税调整需查各自法规和税则。'
    )],
    'material-price': [historical(
      'Global Critical Minerals Outlook 2024',
      '2024-05-17', '国际能源署（IEA）', 'https://www.iea.org/reports/global-critical-minerals-outlook-2024/market-review',
      '报告记录了 2023 年锂现货价格显著下降，可对照原材料采购成本的暴露路径。实际电池级锂盐采购价还取决于品类、定价周期、现货库存和合同结算币种。'
    )],
    'storm-alert': [historical(
      '河南郑州“7·20”特大暴雨灾害调查报告',
      '2021-07-20', '国务院灾害调查组（2022 年 1 月公布）', 'https://www.mem.gov.cn/gk/sgcc/tbzdsgdcbg/202201/P020220121639049697767.pdf',
      '报告记录极端暴雨引发道路隧道险情，适合对照城市道路积水对运输路线的影响。该案灾害强度较高，当前园区通行和停产判断以现场水情、封控与运行数据为准。'
    )],
    'test-center': [historical(
      'TÜV莱茵长三角运营中心三期项目签约落户沙溪',
      '2026-01-30', '太仓市人民政府（2 月 2 日发布）', 'https://www.taicang.gov.cn/taicang/qzdt/202602/846d26040302411a9d669e5e4315f75b.shtml',
      '官方通报列明检测中心签约、选址和建设安排，并介绍一期的汽车检测服务，可对照验证平台从意向到建设的节点。三期新增业务与演示中的汽车电子服务各有范围，具体能力需核查项目清单。'
    )],
    'management-change': [historical(
      'Siemens completes Managing Board team as of October 1, 2020',
      '2020-08-05', '西门子管理层任命公告', 'https://press.siemens.com/global/en/pressrelease/siemens-completes-managing-board-team-october-1-2020',
      '公告列明数字化工业管理职责的继任人选和生效时间，可对照核验任命范围、交接和实际生效日期。该案属于多业务板块管理层调整，示例聚焦单家企业总经理分工。'
    )],
    'compliance-review': [historical(
      'SEC Charges Fluor Corp. for Accounting Improprieties',
      '2023-09-06', '美国证券交易委员会（SEC）', 'https://www.sec.gov/newsroom/press-releases/2023-170',
      '监管公告针对固定价格工程合同的成本估计、会计记录和内部控制，并提及企业补救措施。可对照企业披露与监管文件的分工。工程项目会计监管与当前合同履约争议的责任认定分别适用各自证据。'
    )],
    'demand-survey': [historical(
      'National Electric Vehicle Infrastructure Standards and Requirements',
      '2023-02-28', '美国联邦公路管理局（《联邦公报》）', 'https://www.govinfo.gov/content/pkg/FR-2023-02-28/pdf/2023-03500.pdf',
      '规定覆盖的充电项目需纳入运行维护及充电端口年均可用率指标，可对照采购从设备配置扩展到可用率的做法。文件适用美国特定联邦资金项目，当前演示面向本地采购调研。'
    )],
    'engineer-forum': [historical(
      '2024 IEEE 74th Electronic Components and Technology Conference（ECTC）',
      '2024-05-28', 'IEEE 电子封装学会会议议程（5 月 28–31 日）', 'https://ectc.net/wp-content/uploads/2025/07/74-ECTCFinal-Web.pdf',
      '大会公开的技术议程包含先进基板、封装与环境可靠性分会，可对照工程分享的主题和报告人安排。议程可用于跟踪技术主题，合作和量产进展仍需后续证据。'
    )],
    'battery-inspection': [historical(
      '智造+零碳，四川时代入选世界经济论坛灯塔工厂',
      '2022-10-11', '宁德时代企业公告', 'https://www.catl.com/news/6733.html',
      '公告披露高速相机和 AI 在电池前工序及卷绕中的缺陷识别应用，可对照在线视觉检测接入制造工序的条件。现场应用经验需结合当前极片批次、缺陷样本和产线节拍重新验证。'
    )],
    'controller-ramp': [historical(
      'Fluence Begins Manufacturing of its Next Generation Smartstack™ Energy Storage Solution',
      '2025-09-09', 'Fluence Energy 投资者关系公告', 'https://ir.fluenceenergy.com/news-releases/news-release-details/fluence-begins-manufacturing-its-next-generation-smartstacktm',
      '企业披露新一代储能产品进入制造阶段，可对照开始制造、交付和客户验收的里程碑。该案例为储能系统整机，当前示例涉及工商业储能控制器。'
    )],
    'connector-test-draft': [historical(
      '汽车电线束和电气设备用连接器 第1部分：定义、试验方法和一般性能要求（QC/T 1067.1-2017）',
      '2017-01-09', '全国标准信息公共服务平台', 'https://std.samr.gov.cn/hb/search/stdHBDetailedCNF?id=8B1827F1411ABB19E05397BE0A0AB44A',
      '道路车辆连接器已有产品试验方法和性能要求的正式行业标准，可对照测试规范变更时应复核的版本与适用范围。本次演示对应高压连接器振动试验草稿，工况和接触电阻口径需按稿件核实。'
    )],
    'digital-equipment-draft': [historical(
      '工业和信息化部等七部门关于印发推动工业领域设备更新实施方案的通知',
      '2024-04-09', '工业和信息化部等七部门', 'https://www.miit.gov.cn/jgsj/ghs/wjfb/art/2024/art_9532b8a4a0fa4dfabedde39e0883a338.html',
      '正式方案提出推进设备联网、工序数字化和财税支持，可对照设备联网改造如何进入政策设计。具体项目能否申报及费用范围需按本地最终清单复核。'
    )],
    'testing-access-draft': [historical(
      '市场监管总局关于发布《检验检测机构资质认定评审准则》的公告',
      '2023-06-01', '国家市场监督管理总局', 'https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/rkjcs/art/2023/art_b97b0b1addbf4e8aaca43cb26f13883b.html',
      '国家评审准则涉及机构技术能力和结果可追溯性，可对照样品和报告管理在准入评审中的核查逻辑。当前拟议工业检测项目的样品接收与保存细则需以最终文件为准。'
    )],
    'bearing-shortage': [historical(
      'Adjustments to Domestic Production in August and September',
      '2021-08-19', '丰田汽车工厂运营公告', 'https://global.toyota/en/newsroom/corporate/35741389.html',
      '丰田公告披露因零部件供应不足等原因调整部分产线作业，可对照部件短缺、排产重排和交期核对。该案为汽车整车产线，示例中的轴承批次和可替代库存需另行核对。'
    )],
    'vision-order': [historical(
      '关于签订日常经营重大合同的公告（罗博特科，2026-032）',
      '2026-05-06', '罗博特科公告（巨潮资讯）', 'https://static.cninfo.com.cn/finalpage/2026-05-06/1225280575.PDF',
      '公告中的重大合同涉及量产用高精度视觉检测设备，并披露了履约风险，可对照订单签订后交付验收和执行进度的跟踪方式。两案设备用途和合同条款各自独立。'
    )],
    'storage-forecast': [historical(
      'Fluence Energy, Inc. Reports Second Quarter 2025 Results; Lowers Full Year 2025 Guidance, Citing Decisions to Pause Certain U.S. Projects Due to Tariff Uncertainty',
      '2025-05-07', 'Fluence Energy 季度业绩公告', 'https://ir.fluenceenergy.com/news-releases/news-release-details/fluence-energy-inc-reports-second-quarter-2025-results-lowers',
      '储能集成企业在季度披露中列示毛利率及收入变化，并因部分美国项目暂停下调全年业绩指引。可对照区分项目进度、成本和指引变化。当前演示中的低价订单与履约成本须以项目资料核验。'
    )],
    'export-insurance': [historical(
      'UK cuts off export finance support to Russia and Belarus',
      '2022-03-15', '英国出口融资署（UK Export Finance）', 'https://www.gov.uk/government/news/uk-cuts-off-export-finance-support-to-russia-and-belarus',
      '英国出口融资署宣布停止对特定目的国新发政府支持的出口保险等，可对照贸易摩擦下目的地如何影响承保条件。该案为暂停新增支持，当前演示属于订单核保材料变化，实际条件以保险机构为准。'
    )],
    'recovery-standards-forum': [historical(
      '动力电池回收标准稳链经验交流座谈会在福建宁德召开',
      '2025-11-27', '国家标准化管理委员会（11 月 29 日报道）', 'https://www.sac.gov.cn/xw/bzhyw/art/2025/art_421e8273d72647648fc63068e8fc1e98.html',
      '座谈会组织产业链、检测认证和标准化机构交流，涉及拆解、余能检测和再生利用等议题，可供准备梯次利用与追溯交流。会议材料和已经发布的标准须分别查阅。'
    )]
  };
})();

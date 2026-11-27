(function () {
  'use strict';

  const levels = [
    { id: 'macro', label: '宏观', description: '汇率、融资条件、外需与能源价格' },
    { id: 'meso', label: '中观', description: '产业供需、价格、产能与贸易约束' },
    { id: 'micro', label: '微观', description: '企业生产、库存、订单、成本与回款' }
  ];
  const metadata = {
    version: '1.0.0',
    mappingVersion: '1.0.0',
    source: '智研政府版产业节点风险场景演示',
    dataType: '仿真示例',
    scope: '集成电路、新能源汽车示例图谱。节点、变量、传导关系和系数用于复现计算。',
    coefficientBasis: '指标和边的系数由示例业务机制指定，未用历史数据拟合。',
    evidenceBasis: '指标附有建议采集来源和采集周期。初始冲击、产业链连接系数和政策样例均为情景输入。',
    mappingRule: '先按产业链和节点记录直接暴露指标，再沿供需关系传播。每条直接映射保存指标编码、稳定节点标识、挂链理由和更新口径。',
    maintenance: '源数据更新按指标采集周期执行。新增指标、节点与连边时复审暴露逻辑，保留变更前后版本和证据记录。',
    axes: ['单位成本变化', '营收变化', '可供量变化', '需求变化'],
    policyScoring: '条款支持记正分，限制记负分。单条情景分为力度 × 节点覆盖比例 × 政策类型权重 × 术语匹配系数 × 100。同一节点同一政策类型同向取最大分，单个节点合计分别封顶 100 和 -100。政策总览显示各节点中的最高正分和最低负分。',
    policySignalBasis: '单节点政策情景分按十分之一折成模型输入点。场景分、模型输入点与实际补贴率或企业受损概率分别采用各自口径。',
    update: '示例版本发生变化时更新版本号。正式接入时按指标更新频率校验数据并重算。'
  };

  function metric(id, code, level, category, label, unit, description, basis, refresh, weights, range, mode = 'indicator') {
    return {
      id, code, level, category, label, unit, description, basis, refresh,
      path: [levels.find(item => item.id === level).label, category, label],
      evidence: { kind: '建议采集来源', title: basis, status: '样例输入，正式数据待接入' },
      weights, range, defaultValue: range.defaultValue, mode, mappings: []
    };
  }

  const metrics = [
    metric('exchange-rate', 'MA-01-01', 'macro', '金融条件', '人民币对美元贬值幅度', '%',
      '期末美元兑人民币汇率相对基期的变化率，正值表示人民币贬值。基期为上一个可比交易日。',
      '人民币汇率中间价、企业采购与结算币种', '交易日更新，结算币种敞口按月复核', [0.58, 0.12, -0.08, 0.02], { min: -20, max: 20, defaultValue: 3 }),
    metric('credit-spread', 'MA-01-02', 'macro', '金融条件', '融资利差变化', '百分点',
      '同期限企业有效融资利率与选定无风险利率之差，使用本月末减上月末。正值表示利差扩大。',
      '基准收益率、企业新增授信合同与债券发行利率', '月度更新，重要授信或发债变更后复核', [0.42, -0.06, -0.12, -0.18], { min: -10, max: 10, defaultValue: 1 }),
    metric('external-demand', 'MA-02-01', 'macro', '外部需求', '目标市场进口需求变化', '%',
      '同一目标市场、商品编码和计量单位的进口数量同比变化率，正值表示外需增加。',
      '目标市场进口统计、商品编码与企业出口目的地台账', '月度更新，商品编码变更时重建对照', [0.02, 0.32, 0.06, 0.62], { min: -50, max: 50, defaultValue: 5 }),
    metric('energy-price', 'MA-03-01', 'macro', '要素价格', '工业用能采购单价变化', '%',
      '按企业耗能结构加权的同口径含税购能单价较上一结算月的变化率。',
      '工业电价与燃气结算账单、企业能源采购台账', '月度结算更新，调价后更新基期价格', [0.31, -0.04, -0.08, 0], { min: -60, max: 60, defaultValue: 8 }),
    metric('material-price', 'ME-01-01', 'meso', '投入品价格', '上游原材料价格变化', '%',
      '按关键物料采购额权重汇总的原料含税采购单价，对比上个可比结算周期。正值表示原料价格上涨。',
      '产业价格指数、供应商报价与企业采购结算单', '周度监测，月末用结算数据复核', [0.74, -0.08, -0.13, -0.06], { min: -65, max: 65, defaultValue: 12 }),
    metric('delivery-cycle', 'ME-01-02', 'meso', '投入品价格', '关键投入交付周期变化', '%',
      '同品类同交付条件下，从有效下单到验收入库的平均自然日数环比变化率。',
      '供应商订单、物流签收与入库台账', '周度更新，取消订单和异常样本单独标注', [0.23, -0.13, -0.40, -0.03], { min: -70, max: 70, defaultValue: 10 }),
    metric('capacity-utilization', 'ME-02-01', 'meso', '生产与产能', '产业产能利用率变化', '百分点',
      '按可用设计产能加权的实际产出÷可用设计产能，以本期利用率减基期利用率。',
      '行业运行调查、重点企业产能台账和实际产量', '月度更新，新增产线或停产时调整分母', [-0.14, 0.34, 0.59, 0.04], { min: -35, max: 35, defaultValue: -8 }),
    metric('market-orders', 'ME-03-01', 'meso', '市场需求', '行业新增订单量变化', '%',
      '目标产品新增有效订单数量同比变化率。退订与重复订单按同一规则冲减。',
      '行业订单调查、产业集群订单和产品出货台账', '月度更新，季节性变化和口径调整单独记录', [0.03, 0.46, 0.07, 0.72], { min: -60, max: 60, defaultValue: 8 }),
    metric('tariff-rate', 'ME-04-01', 'meso', '市场准入', '相关产品从价关税变化', '百分点',
      '同一贸易方向、商品编码和原产地规则下，新生效从价税率减原税率。',
      '生效税则、货物商品编码、原产地与通关单据', '在生效日更新，同步记录法定例外和有效期', [0.43, -0.20, -0.19, -0.28], { min: -60, max: 60, defaultValue: 10 }),
    metric('inventory-cover', 'MI-01-01', 'micro', '库存与履约', '关键物料库存覆盖天数变化', '天',
      '可用库存数量÷近30日平均日耗用量，再用本期覆盖天数减上期覆盖天数。',
      '企业库存台账、采购计划与实际耗用记录', '周度更新，呆滞库存和待检库存排除', [-0.03, 0.05, 0.34, 0], { min: -45, max: 45, defaultValue: -5 }),
    metric('unit-cost', 'MI-02-01', 'micro', '生产经营', '企业单位制造成本变化', '%',
      '同一产品规格的制造成本÷合格入库数量，按同口径环比变化率衡量。',
      '企业制造费用、材料成本与合格品入库数据', '月度关账后更新，研发与资本性支出按既定口径分离', [1.00, 0, -0.06, -0.05], { min: -60, max: 60, defaultValue: 5 }),
    metric('yield-rate', 'MI-02-02', 'micro', '生产经营', '关键工序一次合格率变化', '百分点',
      '关键工序首次验收合格件数÷同批投入工序总件数，用本期比例减基期比例。',
      '生产执行系统、实际投料记录与质检数据', '周度更新，工艺变更或新线投产时按分组复核', [-0.35, 0.18, 0.58, 0.02], { min: -35, max: 35, defaultValue: -5 }),
    metric('unplanned-downtime', 'MI-02-03', 'micro', '生产经营', '非计划停机时长变化', '%',
      '同一生产单元因故障等非计划原因停机的小时数，与上个可比统计周期比较。当基期为零应记录绝对小时数。',
      '设备停机工单、制造执行系统与生产班报', '周度更新，设备大修或班制变更时重设比较周期', [0.22, -0.14, -0.60, 0], { min: -80, max: 80, defaultValue: 8 }),
    metric('customer-orders', 'MI-03-01', 'micro', '客户与资金', '企业重点客户净订单变化', '%',
      '固定客户样本的新增有效订单减取消订单，比较本期与基期净订单量。',
      '企业合同、订单与取消记录', '周度更新，客户集中度在月末复核', [0.01, 0.61, 0.06, 0.74], { min: -75, max: 75, defaultValue: -10 }),
    metric('collection-days', 'MI-03-02', 'micro', '客户与资金', '应收账款周转天数变化', '天',
      '平均应收账款÷同口径赊销收入×期间天数，再计算同口径环比的天数差。',
      '企业应收账款账龄、开票与实收台账', '月度关账更新，重大回款或减值事项单列', [0.08, -0.10, -0.16, -0.02], { min: -90, max: 90, defaultValue: 10 }),
    metric('policy-funding', 'PO-01-01', 'meso', '政策影响', '财政金融与税费政策', '情景点',
      '政策条款对补贴、融资、税费或研发资源的情景得分折算。',
      '已核对的政策正文、执行细则和适用范围', '核对条款版本、生效条件或覆盖范围后重算', [-0.58, 0.13, 0.24, 0.09], { min: -10, max: 10, defaultValue: 0 }, 'policy'),
    metric('policy-trade', 'PO-01-02', 'meso', '政策影响', '贸易与市场准入政策', '情景点',
      '政策条款对进出口条件、通关与市场准入的情景得分折算。',
      '已核对的政策正文、执行细则和适用范围', '核对条款版本、生效条件或覆盖范围后重算', [-0.33, 0.45, 0.47, 0.24], { min: -10, max: 10, defaultValue: 0 }, 'policy'),
    metric('policy-regulation', 'PO-01-03', 'meso', '政策影响', '生产与合规监管政策', '情景点',
      '政策条款对准产、环保、安全与行业标准执行条件的情景得分折算。',
      '已核对的政策正文、执行细则和适用范围', '核对条款版本、生效条件或覆盖范围后重算', [-0.25, 0.12, 0.52, 0.03], { min: -10, max: 10, defaultValue: 0 }, 'policy'),
    metric('policy-procurement', 'PO-01-04', 'meso', '政策影响', '采购与需求政策', '情景点',
      '政策条款对产品采购、示范应用与消费需求的情景得分折算。',
      '已核对的政策正文、执行细则和适用范围', '核对条款版本、生效条件或覆盖范围后重算', [0, 0.52, 0.11, 0.68], { min: -10, max: 10, defaultValue: 0 }, 'policy'),
    metric('policy-general', 'PO-01-05', 'meso', '政策影响', '其他产业支持或限制', '情景点',
      '条款明确支持或限制当前节点但类型待核对时，按较小幅度折算。',
      '已核对的政策正文、执行细则和适用范围', '核对条款版本、生效条件或覆盖范围后重算', [-0.17, 0.15, 0.21, 0.12], { min: -10, max: 10, defaultValue: 0 }, 'policy')
  ];

  function node(id, label, stage, description, tags, metricExposures) {
    return { id, label, stage, description, tags, metricExposures, metricIds: Object.keys(metricExposures) };
  }

  function edge(from, to, relation, basis, forward, reverse) {
    return { from, to, relation, basis, forward, reverse, evidence: { kind: '情景假设', status: '未用历史数据校准' } };
  }

  const scenarios = [
    {
      id: 'integrated-circuit', label: '集成电路', description: '从关键材料、设备与设计工具，传导至晶圆制造、封装测试及应用。', defaultAnchor: 'wafer-fabrication', baseProfitMargin: 12,
      nodes: [
        node('silicon-materials', '电子级材料', 'up', '晶圆制造使用的硅片、光刻胶、电子特气等投入品。', ['电子级材料', '半导体材料', '硅片', '光刻胶', '电子特气', '靶材', '湿电子化学品'], {
          'material-price': '原料及电子化学品报价直接转为投入品单价。', 'exchange-rate': '部分投入品存在外币合同敞口。', 'delivery-cycle': '高纯度认证及交付周期限制替代和补库存。', 'energy-price': '提纯及材料合成环节使用工业电气。'
        }),
        node('semiconductor-equipment', '半导体设备', 'up', '光刻、刻蚀、沉积、清洗与计量等制造装备。', ['半导体设备', '光刻设备', '光刻机', '刻蚀设备', '沉积设备', '清洗设备', '晶圆检测设备'], {
          'exchange-rate': '进口部件和技术服务的外币结算改变采购成本。', 'tariff-rate': '进口设备与零部件适用不同商品编码与税率。', 'delivery-cycle': '设备交付进度决定产线导入与验收节奏。', 'customer-orders': '晶圆厂设备采购决定当前节点订单收入。'
        }),
        node('design-tools', 'EDA与芯片IP', 'up', '供设计企业使用的自动化设计工具与芯片知识产权授权。', ['EDA', 'EDA软件', '电子设计自动化', '芯片IP', '设计工具', 'IP授权'], {
          'exchange-rate': '外币授权和维护计费随汇率改变。', 'external-demand': '面向境外客户的设计授权需求受外需影响。', 'customer-orders': '授权续约和订单变化进入收入端。'
        }),
        node('chip-design', '集成电路设计', 'mid', '按产品功能需求完成电路、版图及流片设计。', ['集成电路设计', '芯片设计', '流片', '芯片设计企业', '设计服务'], {
          'customer-orders': '设计服务订单与授权决定收入节奏。', 'delivery-cycle': '流片资源交付周期影响项目交付。', 'unit-cost': '设计验证及流片支出变化计入产品成本。', 'credit-spread': '前置研发与流片支出存在融资暴露。'
        }),
        node('wafer-fabrication', '晶圆制造', 'mid', '在晶圆产线完成工艺与良率受控的芯片制造，含晶圆代工。', ['晶圆制造', '晶圆代工', '晶圆产线', '芯片制造', '晶圆工艺'], {
          'material-price': '硅片、光刻胶和电子特气纳入同规格单位制造成本。', 'capacity-utilization': '产线利用率决定固定成本分摊和有效出货量。', 'energy-price': '洁净室和生产设备用能进入制造费用。', 'yield-rate': '合格晶圆与芯片数量决定有效供给。', 'unplanned-downtime': '非计划停机压缩可生产机时。', 'inventory-cover': '关键材料覆盖天数影响连续投产。', 'unit-cost': '采购和工艺成本直接进入单位利润。', 'credit-spread': '设备与扩产需要持续资金投入。'
        }),
        node('packaging-testing', '封装测试', 'mid', '芯片封装、成品测试及可靠性筛查。', ['封装测试', '先进封装', '封装产线', '芯片测试', '晶圆级封装'], {
          'capacity-utilization': '封装与测试排产能力决定交付量。', 'yield-rate': '成品测试一次合格率直接决定可供量。', 'material-price': '基板、键合材料和模封材料进入单位成本。', 'customer-orders': '代工和设计客户的批量订单影响收入。'
        }),
        node('electronic-modules', '电子模组', 'down', '将合格芯片集成进入存储、控制和通信等模组。', ['电子模组', '芯片模组', '通信模组', '存储模组', '电子组件'], {
          'inventory-cover': '核心芯片库存覆盖直接决定连续出货。', 'market-orders': '模组行业订单变化决定排产量。', 'customer-orders': '固定整机客户的采购承诺决定收入。', 'collection-days': '主要集成客户的付款周期影响现金周转。'
        }),
        node('terminal-applications', '消费与工业终端', 'down', '采购模组或芯片用于消费电子和工业应用的终端制造。', ['终端应用', '消费电子', '工业电子', '终端整机', '电子整机'], {
          'external-demand': '终端成品出口面向最终目标市场。', 'market-orders': '终端市场需求转为产品订单和上游采购量。', 'customer-orders': '终端品牌及渠道的有效订单直接影响出货。', 'tariff-rate': '整机出口涉及特定品类税则。'
        })
      ],
      edges: [
        edge('silicon-materials', 'wafer-fabrication', '材料供应', '晶圆制造的关键材料输入，替代受规格复核和认证限制。', [0.72, 0.22, 0.63, 0.14], [0.10, 0.38, 0.14, 0.58]),
        edge('semiconductor-equipment', 'wafer-fabrication', '设备交付与维护', '关键设备的可用性和维护周期约束晶圆产能。', [0.50, 0.18, 0.54, 0.11], [0.08, 0.36, 0.09, 0.52]),
        edge('design-tools', 'chip-design', '软件与知识产权授权', '设计工具与授权限制影响芯片设计成本和可交付量。', [0.50, 0.23, 0.47, 0.10], [0.05, 0.34, 0.10, 0.44]),
        edge('chip-design', 'wafer-fabrication', '流片与制造委托', '设计企业的量产委托影响晶圆厂产线利用。', [0.16, 0.40, 0.30, 0.43], [0.20, 0.27, 0.40, 0.33]),
        edge('wafer-fabrication', 'packaging-testing', '晶圆与裸片供给', '晶圆制造产出作为封装与测试的主要输入。', [0.56, 0.38, 0.66, 0.20], [0.13, 0.34, 0.19, 0.48]),
        edge('packaging-testing', 'electronic-modules', '合格芯片配送', '合格芯片数量和交期影响模组装配。', [0.51, 0.36, 0.58, 0.18], [0.10, 0.36, 0.19, 0.53]),
        edge('electronic-modules', 'terminal-applications', '模组配套供给', '模组是终端整机的部分材料成本和装配输入。', [0.43, 0.29, 0.52, 0.20], [0.09, 0.41, 0.15, 0.59])
      ],
      defaultSignals: [{ nodeId: 'silicon-materials', metricId: 'material-price', value: 12 }, { nodeId: 'wafer-fabrication', metricId: 'capacity-utilization', value: -8 }]
    },
    {
      id: 'new-energy-vehicle', label: '新能源汽车', description: '从电池材料与装备，经电芯、电池系统和整车制造传导至销售和运营。', defaultAnchor: 'battery-cells', baseProfitMargin: 10,
      nodes: [
        node('battery-materials', '锂盐与电池材料', 'up', '锂盐、正负极、电解液和隔膜等电芯用料。', ['锂盐', '碳酸锂', '电池材料', '正极材料', '负极材料', '电解液', '电池隔膜'], {
          'material-price': '锂盐与电芯原料采购单价改变材料供应成本。', 'energy-price': '材料提炼和合成使用工业用电与燃气。', 'exchange-rate': '境外矿产及部分材料采购存在外币敞口。', 'tariff-rate': '进口矿产或原料可能受税率变动影响。', 'delivery-cycle': '原料与中间品运输时间影响材料生产周期。'
        }),
        node('battery-equipment', '动力电池装备', 'up', '涂布、辊压、叠片、化成等电芯生产装备。', ['动力电池装备', '电芯设备', '涂布设备', '叠片设备', '化成设备'], {
          'delivery-cycle': '设备供货和安装验收约束产线投运节奏。', 'customer-orders': '下游电芯厂的扩产订单决定装备需求。', 'exchange-rate': '进口控制部件及仪器需要外币结算。'
        }),
        node('battery-cells', '动力电芯', 'mid', '经电极制造、装配和化成形成可交付的动力电芯。', ['动力电芯', '动力电池电芯', '电芯生产', '电芯产线', '电芯制造', '电芯工厂'], {
          'material-price': '电极、电解液和隔膜是测算电芯单位成本的直接输入。', 'capacity-utilization': '实际合格出货和固定成本分摊受产线利用率影响。', 'yield-rate': '良率下降直接减少合格电芯供应。', 'unplanned-downtime': '电芯生产设备故障缩短可用机时。', 'inventory-cover': '关键材料覆盖天数反映电芯停产缓冲。', 'unit-cost': '单位电芯制造成本影响毛利。', 'credit-spread': '产线技改和材料备货占用资金。', 'customer-orders': '头部整车与系统客户排产影响电芯订单。'
        }),
        node('battery-system', '动力电池系统', 'mid', '将电芯集成为模组、电池包及电池管理系统。', ['动力电池系统', '电池包', '电池管理系统', '电池模组', 'BMS'], {
          'inventory-cover': '电芯及电池管理部件库存决定连续装配。', 'capacity-utilization': '系统装配线排产决定可交付量。', 'unit-cost': '电芯、结构件与热管理部件占据系统成本。', 'customer-orders': '整车车型配套量直接决定系统订单。'
        }),
        node('electric-drive', '电驱与功率器件', 'mid', '供应电机、电控及功率器件，参与整车动力系统。', ['电驱系统', '功率器件', '电控系统', '车规级功率半导体', '驱动电机'], {
          'delivery-cycle': '核心器件交货周期决定电驱总成生产节奏。', 'material-price': '铜材、磁性材料和功率器件进入制造成本。', 'yield-rate': '装配和测试合格率影响有效出货。', 'customer-orders': '整车配套订单影响电驱出货量。'
        }),
        node('vehicle-manufacturing', '新能源汽车整车', 'down', '总装并验证新能源汽车，采购电池系统与电驱总成。', ['新能源汽车整车', '新能源汽车整车制造', '整车制造', '整车总装', '新能源汽车生产'], {
          'external-demand': '出口车型销量对目标市场需求敏感。', 'capacity-utilization': '实际排产决定固定资产和人工分摊。', 'market-orders': '行业订单变化直接影响总装计划。', 'unit-cost': '关键系统成本影响整车单位利润。', 'tariff-rate': '适用贸易方向的整车税率影响价格竞争力。', 'inventory-cover': '电池和电驱断供可约束可装配量。'
        }),
        node('vehicle-sales', '整车销售与运营', 'down', '面向车队、经销渠道和消费者的车辆销售及运营。', ['整车销售', '新能源汽车销售', '车队采购', '公交车辆', '车辆运营', '新能源公交'], {
          'market-orders': '订单强度反映经销与车队渠道终端需求。', 'customer-orders': '车队及渠道合同形成有效销售需求。', 'collection-days': '渠道账期变化影响销售经营现金。', 'credit-spread': '车队与消费者融资成本反馈到购买需求。'
        }),
        node('battery-recycling', '退役电池回收', 'down', '退役动力电池收集、拆解和梯次利用。', ['退役电池回收', '动力电池回收', '梯次利用', '退役电池拆解', '再生处理'], {
          'material-price': '锂盐等再生材料价格影响回收端处置收益。', 'market-orders': '梯次利用和再生原料订单决定可消纳能力。', 'energy-price': '拆解和再生处理环节的用能成本可传导至再生料。'
        })
      ],
      edges: [
        edge('battery-materials', 'battery-cells', '关键电芯材料输入', '隔膜、电解液和正负极材料供给影响电芯排产与成本。', [0.73, 0.24, 0.64, 0.18], [0.10, 0.38, 0.17, 0.56]),
        edge('battery-equipment', 'battery-cells', '产线设备与维护', '装备交付、运行和备件供应影响可用产线。', [0.49, 0.23, 0.54, 0.15], [0.07, 0.38, 0.11, 0.56]),
        edge('battery-cells', 'battery-system', '电芯供应', '合格电芯是动力电池系统的主要制造输入。', [0.64, 0.39, 0.65, 0.25], [0.12, 0.46, 0.20, 0.58]),
        edge('battery-system', 'vehicle-manufacturing', '电池系统配套', '电池系统直接决定配置车型的装配能力。', [0.55, 0.36, 0.61, 0.18], [0.12, 0.43, 0.15, 0.58]),
        edge('electric-drive', 'vehicle-manufacturing', '电驱总成配套', '电驱与功率器件具有指定型号适配和认证要求。', [0.51, 0.34, 0.52, 0.16], [0.07, 0.41, 0.15, 0.57]),
        edge('vehicle-manufacturing', 'vehicle-sales', '整车供应', '经销和运营交付依赖整车供给及车型可售量。', [0.46, 0.35, 0.50, 0.24], [0.13, 0.47, 0.14, 0.62]),
        edge('vehicle-sales', 'battery-recycling', '退役电池回收来源', '用车规模和电池退役形成回收来源，模型权重较低以表达滞后。', [0.10, 0.13, 0.21, 0.23], [0.05, 0.14, 0.10, 0.16])
      ],
      defaultSignals: [{ nodeId: 'battery-materials', metricId: 'material-price', value: 14 }, { nodeId: 'battery-cells', metricId: 'capacity-utilization', value: -9 }]
    }
  ];

  const metricById = new Map(metrics.map(item => [item.id, item]));
  const scenarioById = new Map(scenarios.map(item => [item.id, item]));
  scenarios.forEach(scenario => {
    scenario.metricMappings = [];
    scenario.nodes.forEach(item => {
      Object.entries(item.metricExposures).forEach(([metricId, reason]) => {
        const metric = metricById.get(metricId);
        const mapping = {
          id: `${scenario.id}/${item.id}/${metric.code}`, scenarioId: scenario.id, scenarioLabel: scenario.label,
          nodeId: item.id, nodeLabel: item.label, metricId, reason, source: metric.basis,
          update: metric.refresh, version: metadata.mappingVersion
        };
        metric.mappings.push(mapping);
        scenario.metricMappings.push(mapping);
      });
    });
  });

  const interactions = [
    { pair: ['material-price', 'capacity-utilization'], label: '原材料价格 × 产业产能利用率', weights: [-0.18, 0.10, 0.20, 0.06], basis: '原材料上涨叠加产能利用率下降时，固定成本分摊和交货约束同时放大。' },
    { pair: ['delivery-cycle', 'inventory-cover'], label: '交付周期 × 库存覆盖天数', weights: [-0.13, 0.07, 0.21, 0.03], basis: '交付延长叠加库存覆盖减少时，临时采购和停产风险同时增加。' }
  ];

  const policyTypes = [
    { id: 'policy-trade', label: '贸易与市场准入', factor: 1.0, pattern: /出口管制|进口限制|关税|进出口|出口许可|进口许可|通关|贸易壁垒|市场准入|原产地/ },
    { id: 'policy-procurement', label: '采购与需求支持', factor: 0.88, pattern: /政府采购|目录采购|优先采购|公交车辆|车队采购|消费券|示范应用|推广应用|集中采购|购置补助/ },
    { id: 'policy-funding', label: '财政金融与税费', factor: 0.90, pattern: /资金支持|财政|税收|税费|补贴|补助|贴息|奖励|奖补|专项资金|融资|贷款|研发投入|税率/ },
    { id: 'policy-regulation', label: '生产与合规监管', factor: 0.94, pattern: /限产|停产|排污|合规|环保|安全审查|认证要求|强制标准|能耗约束|生产许可|审批|检测标准|回收标准/ },
    { id: 'policy-general', label: '综合产业政策', factor: 0.75 }
  ];
  const policyTagRules = [
    ['资金支持', /资金|补贴|补助|贴息|奖励|奖补|融资/],
    ['研发与技术改造', /研发|技改|中试|工艺升级|创新/],
    ['贸易与通关', /出口|进口|通关|关税|原产地/],
    ['合规与监管', /许可|审批|合规|限制|禁用|审查|不得|执行标准/],
    ['供给与产能', /产线|限产|停产|产能|产量|生产企业|连续生产/],
    ['采购与示范应用', /购买|采购|示范|推广|应用场景/],
    ['区划与适用对象', /适用|所在地|区域|[省市区县园]内|园区|企业|项目/],
    ['有效期与执行', /发布之日|有效期|施行|执行期限|截至|起执行|本年度/]
  ];
  const policyExamples = [
    {
      id: 'integrated-circuit-policy', label: '集成电路 · 补助与进口许可', scenarioId: 'integrated-circuit', source: '模拟条款，供演示使用',
      text: '集成电路产业政策分析样例（模拟文本）\n第一条 对符合申报条件的光刻设备和刻蚀设备技改项目给予财政补助，补助上限以年度申报指南为准。\n第二条 支持晶圆制造企业开展晶圆产线节能技改，对年度验收合格项目给予贴息。\n第三条 对指定清单内的光刻胶实行进口许可，未取得许可不得进口。\n第四条 推动先进封装工艺在电子模组产品中示范应用，支持符合条件的项目优先采购。'
    },
    {
      id: 'new-energy-vehicle-policy', label: '新能源汽车 · 产线支持与合规约束', scenarioId: 'new-energy-vehicle', source: '模拟条款，供演示使用',
      text: '新能源汽车产业政策分析样例（模拟文本）\n第一条 对符合条件的动力电芯技术改造项目给予设备投资补助，鼓励升级能耗监控。\n第二条 新增动力电池回收项目必须通过环保审批，未通过验收不得投产。\n第三条 支持符合技术标准的新能源公交纳入示范应用目录，鼓励车队采购。\n第四条 对锂盐和正极材料的部分进口商品实行许可管理，未获许可禁止进口。'
    }
  ];

  const normalize = value => String(value || '').normalize('NFKC').toLowerCase().replace(/\s+/g, '');
  const unique = values => [...new Set(values)];
  const limit = (value, min, max) => Math.max(min, Math.min(max, value));
  const round = value => Math.round(value * 100) / 100;
  const defaultRatio = (value, fallback) => (value == null || value === '' || !Number.isFinite(Number(value))) ? fallback : limit(Number(value), 0, 1);
  const supportWords = /给予|支持|鼓励|补助|补贴|专项资金|贴息|优先采购|税费减免|降低(税率|关税|门槛|成本)|放宽|免征|取消.{0,12}(限制|许可|审批)|免于(许可|审批)|便利化/;
  const restrictWords = /禁止|不得|严禁|限产|停产|提高(关税|税率|准入门槛)|加征|限制|实行.{0,12}许可|必须.{0,18}(通过|取得|完成|符合|达到)|暂停|收紧|强制/;
  const withdrawnSupport = /(?:不予|不再|取消|停止|不得)(?:给予|予以|享受|发放|获得|申领)?(?:财政|资金|税费|任何)?(?:支持|补助|补贴|贴息|奖励|减免)/g;

  function policyDirection(text) {
    const affirmative = text.replace(withdrawnSupport, '');
    const positive = supportWords.test(affirmative);
    const withoutNegation = text.replace(/(?:取消|免除|解除|不得设置|不得实施)[^，。；]{0,12}(?:限制|许可|审批|门槛)/g, '');
    const negative = restrictWords.test(withoutNegation) || affirmative.length < text.length;
    if (positive && negative) return 'mixed';
    if (positive) return 'positive';
    if (negative) return 'negative';
    return 'neutral';
  }

  function clausesIn(text) {
    const normalized = text.replace(/\r\n?/g, '\n').trim();
    if (!normalized) return [];
    const segments = normalized.matchAll(/[^。！？；;!?\n]+(?:[。！？；;!?]+|$)?/gu);
    let page = null;
    return Array.from(segments, segment => {
      const raw = segment[0].trim();
      const pageHeading = raw.match(/^\[第\s*(\d+)\s*页\]$/);
      if (pageHeading) { page = Number(pageHeading[1]); return null; }
      const article = raw.match(/^第[一二三四五六七八九十百〇零0-9]+条/);
      if (!article && raw.length < 42 && /(?:政策|规划|办法|意见|通知|实施方案|行动计划)[》）)]?$/.test(raw) && !/给予|实行|取消|不得|必须/.test(raw)) return null;
      return { text: raw, page, article: article?.[0] || '', start: segment.index, end: segment.index + segment[0].length };
    }).filter(clause => clause?.text.length >= 6 && !/^([#\s]*第\s*\d+\s*页|#{1,6}\s)/.test(clause.text));
  }

  function locateNode(clauseText, scenario) {
    const source = normalize(clauseText);
    const terms = clauseText.normalize('NFKC').toLowerCase().split(/[^a-z0-9]+/);
    const includesTerm = value => /^[a-z0-9]+$/.test(value) ? terms.includes(value) : source.includes(value);
    return scenario.nodes.flatMap(item => {
      const nodeName = normalize(item.label);
      const matchedTerms = unique([item.label, ...item.tags]).filter(value => includesTerm(normalize(value)));
      if (!matchedTerms.length) return [];
      const exactName = source.includes(nodeName);
      const strongestTerm = matchedTerms.reduce((longest, value) => value.length > longest.length ? value : longest, '');
      const factor = exactName ? 1 : strongestTerm.length >= 4 ? 0.88 : 0.76;
      return [{ id: item.id, label: item.label, matchedTerms, factor, basis: exactName ? '命中标准节点名' : `命中挂链术语「${strongestTerm}」` }];
    });
  }

  function evaluatePolicy(text, scenarioId, options = {}) {
    const scenario = scenarioById.get(scenarioId);
    if (!scenario) throw new Error('请选择产业链后分析政策。');
    const raw = String(text || '');
    const input = raw.slice(0, 120000);
    const intensity = defaultRatio(options.intensity, 0.7);
    const coverage = defaultRatio(options.coverage, 0.6);
    const override = ['positive', 'negative'].includes(options.direction) ? options.direction : null;
    const warnings = [];
    if (input.length < raw.length) warnings.push('只分析前 120,000 个字符。可按章节缩小分析范围。');
    const declaredCoverage = Array.from(input.matchAll(/覆盖(?:率|比例)?\s*(?:为|达到|约|不低于|至少)?\s*(\d+(?:\.\d+)?)\s*[%％]/g), item => Number(item[1])).filter(value => value <= 100);
    if (declaredCoverage.length) warnings.push(`原文出现覆盖比例 ${unique(declaredCoverage).join('%、')}%。模型使用界面确认的覆盖比例 ${round(coverage * 100)}%。`);

    const clauses = [];
    const matches = new Map();
    const types = new Set();
    const seen = new Set();
    clausesIn(input).forEach((clause) => {
      const normalized = normalize(clause.text);
      if (seen.has(normalized)) return;
      seen.add(normalized);
      const derived = policyDirection(clause.text);
      const nodeMatches = locateNode(clause.text, scenario);
      const type = policyTypes.find(item => item.pattern?.test(clause.text)) || policyTypes[policyTypes.length - 1];
      const tags = policyTagRules.filter(([, pattern]) => pattern.test(clause.text)).map(([tag]) => tag);
      if (!nodeMatches.length && derived === 'neutral' && type.id === 'policy-general') return;
      const id = `C${String(clauses.length + 1).padStart(2, '0')}`;
      const direction = override || derived;
      types.add(type.label);
      const reference = [clause.page && `第 ${clause.page} 页`, clause.article].filter(Boolean).join(' · ');
      const alignment = nodeMatches.length ? nodeMatches.map(item => `${item.label}：${item.basis}`).join('；') : '未命中本产业链的节点名称或挂链术语';
      const clauseEvidence = { ...clause, id, type: type.label, metricId: type.id, direction, derivedDirection: derived, tags,
        nodeIds: nodeMatches.map(item => item.id),
        basis: reference ? `${reference} · ${alignment}` : alignment };
      clauses.push(clauseEvidence);
      nodeMatches.forEach(nodeMatch => {
        if (!matches.has(nodeMatch.id)) matches.set(nodeMatch.id, { id: nodeMatch.id, label: nodeMatch.label, aligned: new Map(), clauseIds: [], matchedTerms: [], evidence: [] });
        const item = matches.get(nodeMatch.id);
        item.clauseIds.push(id);
        item.matchedTerms.push(...nodeMatch.matchedTerms);
        const score = round(100 * intensity * coverage * type.factor * nodeMatch.factor);
        item.evidence.push({ clauseId: id, direction, type: type.label, score, basis: nodeMatch.basis, typeFactor: type.factor, mappingFactor: nodeMatch.factor });
        if (direction === 'neutral') return;
        if (direction === 'mixed') return;
        const group = item.aligned.get(type.id) || { positive: 0, negative: 0 };
        group[direction] = Math.max(group[direction], score);
        item.aligned.set(type.id, group);
      });
    });

    const signals = [];
    const matchedNodes = Array.from(matches.values(), item => {
      const totals = Array.from(item.aligned.values()).reduce((sum, amount) => ({ positive: sum.positive + amount.positive, negative: sum.negative + amount.negative }), { positive: 0, negative: 0 });
      const positiveScore = round(limit(totals.positive, 0, 100));
      const negativeScore = -round(limit(totals.negative, 0, 100)) || 0;
      const magnitude = Math.max(positiveScore, -negativeScore);
      const impact = magnitude >= 65 ? '较强' : magnitude >= 35 ? '中等' : magnitude > 0 ? '轻微' : '待核对';
      item.aligned.forEach((amount, metricId) => {
        const positive = totals.positive ? amount.positive * positiveScore / totals.positive : 0;
        const negative = totals.negative ? amount.negative * -negativeScore / totals.negative : 0;
        const value = round((positive - negative) / 10);
        if (value) signals.push({ nodeId: item.id, metricId, value });
      });
      return { id: item.id, label: item.label, positiveScore, negativeScore, score: round(positiveScore + negativeScore), impact,
        clauseIds: item.clauseIds, matchedTerms: unique(item.matchedTerms), evidence: item.evidence };
    }).sort((a, b) => Math.max(b.positiveScore, -b.negativeScore) - Math.max(a.positiveScore, -a.negativeScore));

    const directions = new Set(clauses.filter(clause => clause.nodeIds.length).map(clause => clause.direction));
    const mixed = directions.has('mixed') || (directions.has('positive') && directions.has('negative'));
    const direction = mixed ? 'mixed' : directions.has('positive') ? 'positive' : directions.has('negative') ? 'negative' : 'neutral';
    const positiveScore = Math.max(0, ...matchedNodes.map(item => item.positiveScore));
    const negativeScore = Math.min(0, ...matchedNodes.map(item => item.negativeScore));
    if (!matchedNodes.length) warnings.push('未命中当前产业链的节点。请核对产业链范围、核心条款及其标准部件名称。');
    if (!signals.length && matchedNodes.length) warnings.push('节点已匹配，但暂无可使用的净影响。请核对方向、力度和覆盖比例。');
    if (!override && clauses.some(clause => clause.nodeIds.length && clause.derivedDirection === 'mixed')) warnings.push('个别条款同时含支持与限制表述，已定位对应节点。请拆成单独的支持和限制句，或确认方向后重算。');
    return { scenarioId, type: [...types].join('、') || '待识别', direction, directionBasis: override ? '用户确认方向' : '条款文本识别', intensity, coverage, positiveScore, negativeScore,
      tags: unique(clauses.flatMap(clause => clause.tags)), clauses, matchedNodes, signals, warnings, basis: metadata.policyScoring };
  }

  const pdfSources = ['https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/', 'https://unpkg.com/pdfjs-dist@4.10.38/'];
  const ocrBase = 'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/';
  const documentNamespace = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const maxBytes = 20 * 1024 * 1024;
  const maxXmlBytes = 2 * 1024 * 1024;
  const maxTextLength = 120000;
  let ocrLibrary;

  function withTimeout(promise, milliseconds, message) {
    let timer;
    const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), milliseconds); });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
  }

  function textFromBytes(data) {
    const bytes = new Uint8Array(data);
    if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes);
    if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(bytes);
    try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
    catch { return new TextDecoder('gb18030', { fatal: true }).decode(bytes); }
  }

  function findDocumentEntry(data, xmlLimit) {
    const view = new DataView(data);
    let end = view.byteLength - 22;
    const minimum = Math.max(0, end - 65535);
    while (end >= minimum && view.getUint32(end, true) !== 0x06054b50) end -= 1;
    if (end < minimum || view.getUint16(end + 20, true) + end + 22 !== view.byteLength) throw new Error('文件不是可读取的 DOCX 压缩包。');
    const directorySize = view.getUint32(end + 12, true);
    let entry = view.getUint32(end + 16, true);
    const directoryEnd = entry + directorySize;
    if (directoryEnd > end || view.getUint16(end + 4, true) || view.getUint16(end + 6, true)) throw new Error('DOCX 压缩目录无效或使用了分卷。');
    while (entry + 46 <= directoryEnd && view.getUint32(entry, true) === 0x02014b50) {
      const nameLength = view.getUint16(entry + 28, true);
      const extraLength = view.getUint16(entry + 30, true);
      const commentLength = view.getUint16(entry + 32, true);
      const next = entry + 46 + nameLength + extraLength + commentLength;
      if (next > directoryEnd) break;
      const name = new TextDecoder().decode(new Uint8Array(data, entry + 46, nameLength));
      if (name === 'word/document.xml') {
        const flags = view.getUint16(entry + 8, true);
        const method = view.getUint16(entry + 10, true);
        const compressedSize = view.getUint32(entry + 20, true);
        const expandedSize = view.getUint32(entry + 24, true);
        const local = view.getUint32(entry + 42, true);
        if (flags & 1 || expandedSize > xmlLimit || local + 30 > entry || view.getUint32(local, true) !== 0x04034b50) throw new Error('DOCX 正文受到保护、格式异常或超出读取上限。');
        const offset = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
        if (offset + compressedSize > entry) throw new Error('DOCX 正文的压缩数据不完整。');
        return { method, expandedSize, compressed: new Uint8Array(data, offset, compressedSize) };
      }
      entry = next;
    }
    throw new Error('DOCX 中未找到正文。');
  }

  async function decompressDocument(entry) {
    if (entry.method === 0 && entry.compressed.length === entry.expandedSize) return entry.compressed;
    if (entry.method !== 8 || typeof DecompressionStream !== 'function') throw new Error('当前浏览器无法解压该 DOCX。可另存为 PDF 或 TXT 后导入。');
    const reader = new Blob([entry.compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
    const output = new Uint8Array(entry.expandedSize);
    let offset = 0;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (offset + value.length > output.length) throw new Error('DOCX 正文的解压长度异常。');
        output.set(value, offset);
        offset += value.length;
      }
    } finally { await reader.cancel(); }
    if (offset !== output.length) throw new Error('DOCX 正文的解压数据不完整。');
    return output;
  }

  async function textFromDocx(data, xmlLimit = maxXmlBytes) {
    const content = await decompressDocument(findDocumentEntry(data, xmlLimit));
    const source = new TextDecoder('utf-8', { fatal: true }).decode(content);
    if (/<!DOCTYPE\b/i.test(source)) throw new Error('DOCX 正文包含不支持的 XML 文档类型。');
    const document = new DOMParser().parseFromString(source, 'application/xml');
    if (document.getElementsByTagName('parsererror').length) throw new Error('DOCX 正文格式无法读取。');
    const body = document.getElementsByTagNameNS(documentNamespace, 'body')[0];
    if (!body) throw new Error('未找到标准 DOCX 正文。');
    return Array.from(body.getElementsByTagNameNS(documentNamespace, 'p'), paragraph =>
      Array.from(paragraph.getElementsByTagNameNS(documentNamespace, 't'), item => item.textContent).join('')).filter(Boolean).join('\n');
  }

  function loadOcr() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (ocrLibrary) return ocrLibrary;
    const script = document.createElement('script');
    script.src = `${ocrBase}dist/tesseract.min.js`;
    const loading = new Promise((resolve, reject) => {
      script.onload = () => window.Tesseract ? resolve(window.Tesseract) : reject(new Error('未找到扫描识别组件。'));
      script.onerror = () => reject(new Error('扫描识别组件加载失败。'));
      document.head.appendChild(script);
    });
    ocrLibrary = withTimeout(loading, 15000, '扫描识别组件加载超时。').catch(error => {
      script.remove();
      ocrLibrary = null;
      throw error;
    });
    return ocrLibrary;
  }

  function pageText(items) {
    let output = '';
    let previous;
    for (const item of items) {
      if (!Object.hasOwn(item, 'str')) continue;
      if (previous && !previous.hasEOL && Math.abs(previous.transform[5] - item.transform[5]) > 5) output += '\n';
      output += item.str;
      if (item.hasEOL) output += '\n';
      previous = item;
    }
    return joinPdfLines(output);
  }

  function joinPdfLines(value) {
    const lines = value.trim().split(/\r?\n/).map(line => line.trim().replace(/(?<=\p{Script=Han})[ \t]+(?=\p{Script=Han})/gu, '')).filter(Boolean);
    return lines.reduce((text, line, index) => {
      if (!index) return line;
      const previous = lines[index - 1];
      const paragraph = /[。；！？：.!?;:]$/.test(previous) || /^(第[一二三四五六七八九十百〇零\d]+[条章节]|[（(][一二三四五六七八九十\d]+[）)]|\d+[.、])/.test(line);
      const bothLatin = /[a-z0-9]$/i.test(previous) && /^[a-z0-9]/i.test(line);
      return text + (paragraph ? '\n' : bothLatin ? ' ' : '') + line;
    }, '');
  }

  async function scanPdfPage(page, worker) {
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: Math.min(2.2, 2300 / Math.max(base.width, base.height)) });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const rendering = page.render({ canvasContext: canvas.getContext('2d'), viewport });
    try {
      await withTimeout(rendering.promise, 15000, '扫描页渲染超时。');
      const result = await withTimeout(worker.recognize(canvas), 45000, '扫描页识别超时。');
      return joinPdfLines(result.data.text);
    } finally { rendering.cancel(); }
  }

  async function openPdf(data) {
    for (const base of pdfSources) {
      let task;
      try {
        const pdf = await withTimeout(import(`${base}build/pdf.min.mjs`), 12000, 'PDF 组件加载超时。');
        pdf.GlobalWorkerOptions.workerSrc = `${base}build/pdf.worker.min.mjs`;
        task = pdf.getDocument({ data: new Uint8Array(data.slice(0)), isEvalSupported: false, cMapUrl: `${base}cmaps/`, cMapPacked: true, standardFontDataUrl: `${base}standard_fonts/` });
        const doc = await withTimeout(task.promise, 20000, 'PDF 文件读取超时。');
        return { task, doc };
      } catch (error) {
        if (task) await withTimeout(task.destroy(), 3000, '').catch(() => {});
        if (error.name === 'PasswordException') throw new Error('PDF 需要密码。请导入已解锁的副本。');
        if (error.name === 'InvalidPDFException') throw new Error('PDF 文件格式无效。请核对文件，或提取正文后粘贴分析。');
      }
    }
    throw new Error('PDF 读取组件暂时不可用。可稍后重试，或提取文本后粘贴分析。');
  }

  async function readPdf(data, options) {
    const { task, doc } = await openPdf(data);
    const chunks = [];
    const warnings = [];
    const scanned = [];
    let worker;
    let pendingWorker;
    let scanningPage = 0;
    let scanCount = 0;
    let abortOcr = false;
    try {
      const first = Math.min(doc.numPages, Math.max(1, Math.floor(Number(options.startPage) || 1)));
      const limit = Math.min(doc.numPages, first + Math.min(24, Math.max(1, Math.floor(Number(options.maxPages) || 15))) - 1);
      const reportProgress = (page, status, progress) => options.onProgress?.({ page, total: doc.numPages, status, progress });
      for (let pageNumber = first; pageNumber <= limit; pageNumber += 1) {
        reportProgress(pageNumber, '正在提取 PDF 文本', 0);
        const page = await withTimeout(doc.getPage(pageNumber), 15000, `PDF 第 ${pageNumber} 页读取超时。`);
        const extracted = await withTimeout(page.getTextContent(), 15000, `PDF 第 ${pageNumber} 页文本提取超时。`);
        let text = pageText(extracted.items);
        const hasText = (text.match(/[\p{L}\p{N}]/gu) || []).length > 18;
        if (!hasText && options.ocr && scanCount < 3 && !abortOcr) {
          try {
            scanningPage = pageNumber;
            if (!worker) {
              const engine = await loadOcr();
              pendingWorker = engine.createWorker(['chi_sim', 'eng'], 1, {
                workerPath: `${ocrBase}dist/worker.min.js`, corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0',
                logger: entry => { if (!abortOcr && entry.status === 'recognizing text') reportProgress(scanningPage, '正在识别扫描页', Math.round(entry.progress * 100)); }
              });
              worker = await withTimeout(pendingWorker, 45000, '扫描识别初始化超时。');
            }
            text = (await scanPdfPage(page, worker)) || text;
            scanCount += 1;
          } catch (error) {
            abortOcr = true;
            warnings.push(`第 ${pageNumber} 页扫描识别未完成。${error.message || '请核对原文。'}`);
          }
        }
        if (!hasText && (text.match(/[\p{L}\p{N}]/gu) || []).length <= 18) scanned.push(pageNumber);
        if (text) chunks.push(`[第 ${pageNumber} 页]\n${text}`);
        page.cleanup();
        reportProgress(pageNumber, 'PDF 页面读取完成', 100);
      }
      if (first > 1 || limit < doc.numPages) warnings.push(`已读取第 ${first}–${limit} 页（共 ${doc.numPages} 页）。`);
      if (scanned.length) warnings.push(`第 ${scanned.join('、')} 页没有足够的可读文本。${options.ocr ? '单次最多尝试识别 3 个扫描页，请核对并补充这些页面。' : '可启用扫描页识别，或校对并粘贴相应条款。'}`);
      if (scanCount) warnings.push('扫描识别文本可能有错字、漏行或数字误差，请与原文核对。');
      return { text: chunks.join('\n\n'), warnings, method: scanCount ? 'PDF 文本提取与扫描识别' : 'PDF 文本提取', pageCount: doc.numPages };
    } finally {
      abortOcr = true;
      if (worker) await worker.terminate();
      else pendingWorker?.then(instance => instance.terminate()).catch(() => {});
      await withTimeout(task.destroy(), 3000, '').catch(() => {});
    }
  }

  async function readPolicyFile(file, options = {}) {
    if (!file?.name || !file.size) throw new Error('请选择含正文的政策文件。');
    if (file.size > maxBytes) throw new Error('政策文件最多 20 MB。可拆分章节后继续读取。');
    const extension = file.name.toLowerCase().split('.').pop();
    if (!['pdf', 'docx', 'txt', 'md', 'markdown'].includes(extension)) throw new Error('支持 PDF、DOCX、TXT 和 Markdown 政策文件。');
    const buffer = await file.arrayBuffer();
    let result;
    if (extension === 'pdf') result = await readPdf(buffer, options);
    else if (extension === 'docx') result = { text: await textFromDocx(buffer), warnings: [], method: 'DOCX 正文提取' };
    else result = { text: textFromBytes(buffer), warnings: [], method: '纯文本读取' };
    const extracted = result.text.replace(/\u0000/g, '').trim();
    if (!extracted) result.warnings.push('未读取到正文，可校对后粘贴核心条款。');
    if (extracted.length > maxTextLength) result.warnings.push('仅保留前 120,000 个字符。可按章节重新导入。');
    return { ...result, name: file.name, text: extracted.slice(0, maxTextLength) };
  }

  const policyTags = policyTagRules.map(([label, pattern]) => ({ label, pattern: pattern.source, version: metadata.mappingVersion }));
  const documentText = Object.freeze({
    decode: textFromBytes,
    readDocx: (data) => textFromDocx(data, 16 * 1024 * 1024)
  });
  window.zhiyanRiskData = { scenarios, metrics, interactions, levels, evaluatePolicy, readPolicyFile, policyExamples, policyTypes, policyTags, metadata, documentText };
})();

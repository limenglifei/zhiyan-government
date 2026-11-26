(function () {
  'use strict';

  window.zhiyanChainQualityExamples = Object.freeze([
    {
      kind: 'add', stage: 'up', title: '新增温度补偿元件',
      detail: '演示图谱在上游采购清单中单列了温度补偿元件，现有骨架缺少对应节点。',
      basis: '演示资料 · 工业传感器参照图谱',
      changes: [
        { label: '子节点名称', suggestion: '温度补偿元件' },
        { label: '节点类型', suggestion: '一般节点' },
        { label: '节点强弱', suggestion: '普通' },
        { label: '挂靠父级', suggestion: '上游 · 基础材料与核心元器件' }
      ]
    },
    {
      kind: 'add', stage: 'mid', title: '新增高温漂移标定',
      detail: '演示工艺将高温漂移标定列为量产放行前的独立步骤，现有骨架只登记了常温标定。',
      basis: '演示资料 · 传感器出厂检验流程',
      changes: [
        { label: '子节点名称', suggestion: '高温漂移标定' },
        { label: '节点类型', suggestion: '核心节点' },
        { label: '节点强弱', suggestion: '普通' },
        { label: '挂靠父级', suggestion: '中游 · 封装与整机标定' }
      ]
    },
    {
      kind: 'delete', stage: 'mid', title: '删除重复的传感器模组封装节点',
      detail: '两条演示记录属于同一父级，名称和属性均一致。带工序编号的记录保留。',
      basis: '演示资料 · 同环节节点比对',
      changes: [
        { label: '待删除子节点', current: '传感器模组封装（无工序编号的副本）', suggestion: '删除重复副本，保留工序编号为 DEMO-M03 的节点' },
        { label: '挂靠关系', current: '重复副本未挂靠企业', suggestion: '保留主节点上的企业和证据关系' }
      ]
    },
    {
      kind: 'delete', stage: 'down', title: '删除已被正式节点替代的占位项',
      detail: '「其他终端应用」是演示初稿的占位节点。其原有范围已由正式节点覆盖。',
      basis: '演示资料 · 应用场景对照表',
      changes: [
        { label: '待删除子节点', current: '其他终端应用', suggestion: '核对挂靠后删除占位项' },
        { label: '保留子节点', current: '工业设备状态监测、产线过程监测', suggestion: '保留两个正式节点及各自的应用说明' }
      ]
    },
    {
      kind: 'revise', stage: 'up', title: '统一传感器陶瓷基板的名称与属性',
      detail: '演示物料表使用「传感器陶瓷基板」。该物料属于关键输入，强弱需按供应能力资料认定。',
      basis: '演示资料 · 关键物料清单与强弱标记口径',
      changes: [
        { label: '子节点名称', current: '陶瓷材料', suggestion: '传感器陶瓷基板' },
        { label: '节点类型', current: '一般节点', suggestion: '核心节点' },
        { label: '节点强弱', current: '强', suggestion: '普通' }
      ]
    },
    {
      kind: 'revise', stage: 'down', title: '把通用工厂应用细化为产线过程监测',
      detail: '演示项目清单描述的是产线温压监测，覆盖范围应与已有案例一致。',
      basis: '演示资料 · 终端项目挂靠清单',
      changes: [
        { label: '子节点名称', current: '智能工厂应用', suggestion: '产线过程监测' },
        { label: '节点类型', current: '核心节点', suggestion: '一般节点' },
        { label: '节点强弱', current: '弱', suggestion: '普通' }
      ]
    },
    {
      kind: 'advantage', title: '同步模组封装的优势环节描述',
      detail: '演示画布当前只有「传感器模组封装」标记为强，优势描述可与画布同步。',
      basis: '演示数据 · 画布节点的强弱标签',
      changes: [
        { label: '优势环节描述', current: '传感器原料、封装工艺', suggestion: '传感器模组封装' }
      ]
    },
    {
      kind: 'advantage', title: '限定产线过程监测优势的范围',
      detail: '演示验收资料仅覆盖试点产线，可在描述中写明应用范围。',
      basis: '演示资料 · 试点产线项目验收表',
      changes: [
        { label: '优势环节描述', current: '终端工业应用全面领先', suggestion: '产线过程监测已在演示试点完成验证，适用范围为试点产线。' }
      ]
    },
    {
      kind: 'weak', title: '把薄弱环节定位到高温漂移标定',
      detail: '演示工序记录显示，高温漂移标定是具体待补齐的能力，可在摘要中直接指出该步骤。',
      basis: '演示资料 · 标定能力自查表',
      changes: [
        { label: '薄弱环节描述', current: '标定能力待提升', suggestion: '高温漂移标定需要补充一致性验证和记录。' }
      ]
    },
    {
      kind: 'weak', title: '移除已完成整改的旧薄弱项',
      detail: '演示画布中防护外壳装配已更新为普通，待补齐的高温漂移标定仍标记为弱。',
      basis: '演示资料 · 节点状态与整改台账',
      changes: [
        { label: '薄弱环节描述', current: '防护外壳装配、高温漂移标定', suggestion: '高温漂移标定' }
      ]
    },
    {
      kind: 'enterprise', title: '区分演示链主与重点企业的角色',
      detail: '演示台账把封装和标定企业登记为不同角色，可在摘要中写明企业角色和对应节点。',
      basis: '演示资料 · 企业角色台账，企业名称均为虚构',
      changes: [
        { label: '链主企业', current: '示例澄湾测控 A 公司，未注明对应节点', suggestion: '示例澄湾测控 A 公司，挂靠传感器模组封装' },
        { label: '重点企业', current: '未登记', suggestion: '核验后补录示例澄湾标定 B 公司，挂靠高温漂移标定' }
      ]
    },
    {
      kind: 'enterprise', title: '修正重点企业的挂靠节点',
      detail: '演示企业的设备监测试点与下游应用对应，原记录仍挂靠在封装环节。',
      basis: '演示资料 · 试点项目台账，企业名称为虚构',
      changes: [
        { label: '示例澄湾运维 C 公司', current: '重点企业 · 中游传感器模组封装', suggestion: '核对项目记录后改挂下游工业设备状态监测，保留重点企业角色' }
      ]
    },
    {
      kind: 'structure', title: '将泛化描述改为可对照的产业链结构',
      detail: '演示画布已有各环节的代表节点，结构摘要可用节点名称串起上下游。',
      basis: '演示资料 · 上游、中游、下游节点清单',
      changes: [
        { label: '产业链结构描述', current: '原材料 → 制造 → 应用', suggestion: '上游传感器陶瓷基板、温度补偿元件 → 中游传感器模组封装、高温漂移标定 → 下游工业设备状态监测、产线过程监测' }
      ]
    },
    {
      kind: 'structure', title: '调整标定与终端应用的顺序',
      detail: '演示流程中，高温漂移标定属于整机交付前的中游工序，终端部署位于下游。',
      basis: '演示资料 · 生产与应用流程图',
      changes: [
        { label: '产业链结构描述', current: '元器件供应 → 工业设备状态监测 → 高温漂移标定', suggestion: '上游元器件供应 → 中游高温漂移标定 → 下游工业设备状态监测' }
      ]
    },
    {
      kind: 'source', title: '补充构建依据概述中的来源与适用范围',
      detail: '演示概述未说明构建资料的版本及覆盖环节，可分别记录构建依据和本次质检资料。',
      basis: '演示资料 · 图谱版本登记表',
      changes: [
        { label: '修改来源概述', current: '依据调研材料和网络资料构建', suggestion: '构建依据为演示《工业传感器骨架梳理表》V1.2 和《产线试点项目台账》演示版。前者用于上中游划分，后者用于下游应用挂靠。' },
        { label: '本次质检参照', current: '未注明', suggestion: '另列演示参照图谱的文件版本和核验范围' }
      ]
    },
    {
      kind: 'source', title: '逐条保留、删除或补录构建信源',
      detail: '演示台账区分可回溯原始资料、缺少出处的转载和待核验候选材料。',
      basis: '演示资料 · 来源台账，资料名均为虚构',
      changes: [
        { label: '保留 · 工业传感器骨架梳理表', current: '演示原始附件 DEMO-S01，V1.2，已登记适用节点', suggestion: '保留原始附件与节点对应关系' },
        { label: '建议删除 · 工序分类转载摘录', current: '演示转载摘录 DEMO-S02，无原始出处和版本', suggestion: '确认无法追溯原文后删除该条，保留已有原始附件' },
        { label: '候选新增 · 高温漂移标定记录汇编', current: '演示候选资料，待核对发布者和版本', suggestion: '核验版本和适用工序后登记为一手参照资料' }
      ]
    }
  ]);
})();

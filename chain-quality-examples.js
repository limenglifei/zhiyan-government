(function () {
  'use strict';

  window.zhiyanChainQualityExamples = Object.freeze([
    {
      kind: 'add', stage: 'up', title: '新增温度补偿元件',
      detail: '温度补偿元件单列为上游投入，建议新增对应节点。',
      basis: '演示工业传感器图谱',
      changes: [
        { label: '子节点名称', suggestion: '温度补偿元件' },
        { label: '节点类型', suggestion: '一般节点' },
        { label: '节点强弱', suggestion: '普通' },
        { label: '挂靠父级', suggestion: '上游 · 基础材料与核心元器件' }
      ]
    },
    {
      kind: 'add', stage: 'mid', title: '新增高温漂移标定',
      detail: '高温漂移标定是独立的量产放行步骤，建议新增节点。',
      basis: '演示出厂检验流程',
      changes: [
        { label: '子节点名称', suggestion: '高温漂移标定' },
        { label: '节点类型', suggestion: '核心节点' },
        { label: '节点强弱', suggestion: '普通' },
        { label: '挂靠父级', suggestion: '中游 · 封装与整机标定' }
      ]
    },
    {
      kind: 'delete', stage: 'mid', title: '删除重复的传感器模组封装节点',
      detail: '同环节的副本属性一致且未挂靠企业，建议删除副本。',
      basis: '演示节点比对结果',
      changes: [
        { label: '子节点名称', current: '传感器模组封装' },
        { label: '节点类型', current: '核心节点' },
        { label: '节点强弱', current: '强' },
        { label: '挂靠父级', current: '中游 · 封装与整机标定' }
      ]
    },
    {
      kind: 'delete', stage: 'down', title: '删除已被正式节点替代的占位项',
      detail: '两个正式节点已覆盖原有应用，建议删除占位项。',
      basis: '演示应用场景对照表',
      changes: [
        { label: '子节点名称', current: '其他终端应用' },
        { label: '节点类型', current: '一般节点' },
        { label: '节点强弱', current: '普通' },
        { label: '挂靠父级', current: '下游 · 终端场景与应用' }
      ]
    },
    {
      kind: 'revise', stage: 'up', title: '统一传感器陶瓷基板的名称与属性',
      detail: '建议统一陶瓷基板的名称、核心节点类型和供应强弱。',
      basis: '演示物料清单及强弱记录',
      changes: [
        { label: '子节点名称', current: '陶瓷材料', suggestion: '传感器陶瓷基板' },
        { label: '节点类型', current: '一般节点', suggestion: '核心节点' },
        { label: '节点强弱', current: '强', suggestion: '普通' }
      ]
    },
    {
      kind: 'revise', stage: 'down', title: '把通用工厂应用细化为产线过程监测',
      detail: '现有项目只覆盖产线温压监测，建议收窄节点范围。',
      basis: '演示终端项目清单',
      changes: [
        { label: '子节点名称', current: '智能工厂应用', suggestion: '产线过程监测' },
        { label: '节点类型', current: '核心节点', suggestion: '一般节点' },
        { label: '节点强弱', current: '弱', suggestion: '普通' }
      ]
    },
    {
      kind: 'advantage', title: '同步模组封装的优势环节描述',
      detail: '传感器模组封装是唯一标强节点，建议同步优势描述。',
      basis: '演示画布强弱标记',
      changes: [
        { label: '优势环节描述', current: '传感器原料、封装工艺', suggestion: '传感器模组封装' }
      ]
    },
    {
      kind: 'advantage', title: '限定产线过程监测优势的范围',
      detail: '已验收范围仅覆盖试点产线，建议据此限定描述。',
      basis: '演示试点验收表',
      changes: [
        { label: '优势环节描述', current: '终端工业应用全面领先', suggestion: '产线过程监测已在演示试点完成验证，适用范围为试点产线。' }
      ]
    },
    {
      kind: 'weak', title: '把薄弱环节定位到高温漂移标定',
      detail: '高温漂移标定是待补齐的工序，建议直接写入描述。',
      basis: '演示标定能力自查表',
      changes: [
        { label: '薄弱环节描述', current: '标定能力待提升', suggestion: '高温漂移标定需要补充一致性验证和记录。' }
      ]
    },
    {
      kind: 'weak', title: '移除已完成整改的旧薄弱项',
      detail: '外壳装配已转为普通节点，建议仅保留高温漂移标定。',
      basis: '演示整改台账',
      changes: [
        { label: '薄弱环节描述', current: '防护外壳装配、高温漂移标定', suggestion: '高温漂移标定' }
      ]
    },
    {
      kind: 'enterprise', title: '调整链主与重点企业的角色',
      detail: '澄湾标定应归入重点企业，建议同步两类企业名单。',
      basis: '演示企业角色台账',
      changes: [
        { label: '链主企业', current: '澄湾测控有限公司、澄湾标定有限公司', suggestion: '澄湾测控有限公司' },
        { label: '重点企业', current: '澄湾运维有限公司', suggestion: '澄湾运维有限公司、澄湾标定有限公司' }
      ]
    },
    {
      kind: 'enterprise', title: '补充重点企业名单',
      detail: '澄湾传感已完成试点验收，建议纳入重点企业。',
      basis: '演示试点项目台账',
      changes: [
        { label: '重点企业', current: '澄湾运维有限公司', suggestion: '澄湾运维有限公司、澄湾传感有限公司' }
      ]
    },
    {
      kind: 'structure', title: '将泛化描述改为可对照的产业链结构',
      detail: '建议用已登记的代表节点描述各产业环节。',
      basis: '演示画布节点清单',
      changes: [
        { label: '产业链结构描述', current: '原材料 → 制造 → 应用', suggestion: '上游传感器陶瓷基板、温度补偿元件 → 中游传感器模组封装、高温漂移标定 → 下游工业设备状态监测、产线过程监测' }
      ]
    },
    {
      kind: 'structure', title: '调整标定与终端应用的顺序',
      detail: '高温漂移标定先于终端部署，建议调整描述顺序。',
      basis: '演示生产与应用流程图',
      changes: [
        { label: '产业链结构描述', current: '元器件供应 → 工业设备状态监测 → 高温漂移标定', suggestion: '上游元器件供应 → 中游高温漂移标定 → 下游工业设备状态监测' }
      ]
    },
    {
      kind: 'source', title: '补充构建依据概述中的来源与适用范围',
      detail: '原概述未列资料版本和用途，建议补充构建信源及覆盖环节。',
      basis: '演示图谱版本登记表',
      changes: [
        { label: '来源概述', current: '依据调研材料和网络资料构建', suggestion: '依据《工业传感器骨架梳理表》V1.2 划分上中游，依据《产线试点项目台账》补充下游应用。' }
      ]
    },
    {
      kind: 'source', title: '更新构建信源明细',
      detail: '建议删除缺少原始出处的转载，新增可追溯的原始报道。',
      basis: '演示信源台账',
      changes: [
        { sourceAction: 'add', source: { title: '工业传感器产线启动高温漂移标定验证', publisher: '制造业资讯网（演示）', publishedAt: '2026-11-20 09:30' } },
        { sourceAction: 'delete', source: { title: '工业传感器工序分类转载摘录', publisher: '产业观察网（演示）', publishedAt: '2026-11-18 15:20' } }
      ]
    }
  ]);
})();

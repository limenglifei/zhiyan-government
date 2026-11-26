(function () {
  'use strict';

  function pendingIds(rows) {
    return new Set((rows || []).filter(row => row.reviewId && row.reviewStatus === 'pending').map(row => row.reviewId));
  }

  function completedRows(rows, previouslyPending) {
    return (rows || []).filter(row => previouslyPending.has(row.reviewId) && row.reviewStatus !== 'pending');
  }

  const confirmPolicyAudit = window.confirmPolicyAuditV78;
  if (typeof confirmPolicyAudit === 'function') {
    window.confirmPolicyAuditV78 = function () {
      const records = knowledgeBaseConfigs.policy;
      const before = pendingIds(records.rows);
      const result = confirmPolicyAudit.apply(this, arguments);
      completedRows(records.rows, before).forEach(row => {
        const approved = row.reviewStatus === 'approved';
        window.zhiyanReportNotifications?.completeReview?.({
          library: '政策库',
          title: approved ? '政策数据审核通过' : '政策入库申请已驳回',
          body: '《' + row.title + '》' + (approved ? '已通过审核并正式入库。' : '未通过审核，请根据审核意见补充或修订。'),
          target: 'policy',
          status: approved ? 'approved' : 'rejected'
        });
      });
      return result;
    };
  }

  const saveEnterpriseReview = window.saveEnterpriseFieldReviewV84;
  if (typeof saveEnterpriseReview === 'function') {
    window.saveEnterpriseFieldReviewV84 = function (complete) {
      const records = knowledgeBaseConfigs.company;
      const before = complete ? pendingIds(records.rows) : null;
      const result = saveEnterpriseReview.apply(this, arguments);
      if (before) completedRows(records.rows, before).forEach(row => {
        const approved = row.reviewStatus === 'approved' || row.reviewStatus === 'partial';
        window.zhiyanReportNotifications?.completeReview?.({
          library: '企业库',
          title: approved ? '企业画像更新审核完成' : '企业画像更新审核驳回',
          body: row.title + '的画像字段审核已完成，结果为' + row.status + '。',
          target: 'company',
          status: approved ? 'approved' : 'rejected'
        });
      });
      return result;
    };
  }

  if (typeof prototypeLogicAnnotations !== 'undefined') {
    prototypeLogicAnnotations.system.interactions.push([
      '审核消息通知',
      '政策或企业数据完成审核后，右上角消息通知显示未读提醒。',
      '点击审核消息进入对应知识库，支持未读筛选和全部已读。'
    ]);
  }
})();

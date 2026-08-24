(function(){
  'use strict';
  function simplifyPolicyAuditTask(index){
    if(typeof activeKnowledgeType==='undefined'||activeKnowledgeType!=='policy'||typeof knowledgeBaseConfigs==='undefined')return;var row=knowledgeBaseConfigs.policy.rows[index];if(!row||!row.auditTaskV80)return;
    var body=document.getElementById('kbDetailBody');if(!body)return;
    var snapshot=body.querySelector('.policy-snapshot-v80');if(snapshot)snapshot.remove();
    var overview=body.querySelector('.policy-task-overview-v80');if(overview){var statusCard=overview.firstElementChild;if(statusCard)statusCard.remove();overview.classList.add('without-status-v91')}
    body.querySelectorAll('.policy-project-actions-v90 .edit').forEach(function(button){button.remove()});
    var sections=Array.from(body.querySelectorAll(':scope > .kb-detail-section')),structured=sections.find(function(section){var title=section.querySelector('h3');return title&&title.textContent.indexOf('政策文件结构化字段')>-1}),similar=sections.find(function(section){var title=section.querySelector('h3');return title&&title.textContent.indexOf('相似政策及疑似重复检测')>-1});if(structured&&similar)body.insertBefore(similar,structured);
  }
  var legacyOpenDetail=window.openKnowledgeDetail;if(typeof legacyOpenDetail==='function')window.openKnowledgeDetail=function(index){var result=legacyOpenDetail.apply(this,arguments);simplifyPolicyAuditTask(index);return result};
  if(typeof prototypeLogicAnnotations!=='undefined')prototypeLogicAnnotations.knowledgeList.interactions.push(['政策审核任务信息层级精简','打开政策入库审核任务。','移除结构化快照说明和审核状态卡；相似重复检测前置到结构化字段之前；项目仅保留删除和参与匹配开关，不提供单项编辑入口。']);
})();

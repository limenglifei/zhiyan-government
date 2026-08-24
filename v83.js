(function(){
  'use strict';
  var detailPolicyIndexV83=null;
  function notify(text){if(typeof window.toast==='function')window.toast(text)}
  function auditState(row){return row&&row.reviewStatus?row.reviewStatus:'approved'}
  function stateText(state){return state==='pending'?'待审核':state==='rejected'?'已驳回':'已通过'}
  function ensurePolicyState(row){if(typeof row.publishStatus!=='boolean')row.publishStatus=auditState(row)==='approved';if(auditState(row)!=='approved')row.publishStatus=false}
  function mountAuditFilter(){
    var category=document.getElementById('kbCategoryFilter'),toolbar=category&&category.parentElement;if(!toolbar)return;
    var select=document.getElementById('kbAuditFilterV83');
    if(!select){select=document.createElement('select');select.id='kbAuditFilterV83';select.className='kb-audit-filter-v83';select.innerHTML='<option value="all">全部审核状态</option><option value="pending">待审核</option><option value="approved">已通过</option><option value="rejected">已驳回</option>';select.onchange=function(){if(typeof renderKnowledgeList==='function')renderKnowledgeList()};category.insertAdjacentElement('afterend',select)}
    select.style.display=typeof activeKnowledgeType!=='undefined'&&activeKnowledgeType==='policy'?'':'none';
  }
  function enhancePolicyTable(){
    mountAuditFilter();if(typeof activeKnowledgeType==='undefined'||activeKnowledgeType!=='policy'||typeof knowledgeBaseConfigs==='undefined')return;
    var cfg=knowledgeBaseConfigs.policy,head=document.querySelector('#kbTableHead tr'),body=document.getElementById('kbTableBody'),filter=document.getElementById('kbAuditFilterV83');if(!head||!body)return;
    cfg.rows.forEach(ensurePolicyState);
    if(!head.querySelector('.policy-publish-head-v83')){var th=document.createElement('th');th.className='policy-publish-head-v83';th.textContent='发布状态';head.insertBefore(th,head.lastElementChild)}
    var shown=0;
    Array.from(body.querySelectorAll('tr')).forEach(function(tr){
      var title=tr.querySelector('.kb-title-cell b');if(!title)return;var index=cfg.rows.findIndex(function(row){return row.title===title.textContent}),row=cfg.rows[index];if(!row)return;var state=auditState(row);
      if(filter&&filter.value!=='all'&&filter.value!==state){tr.remove();return}shown++;
      var action=tr.lastElementChild,publish=document.createElement('td');publish.className='policy-publish-cell-v83';publish.innerHTML='<button type="button" class="policy-publish-switch-v83 '+(row.publishStatus?'on':'off')+' '+(state!=='approved'?'locked':'')+'" role="switch" aria-checked="'+row.publishStatus+'" onclick="event.stopPropagation();togglePolicyPublishV83('+index+',event)"><i></i><span>'+(row.publishStatus?'已发布':'已关闭')+'</span></button>';tr.insertBefore(publish,action);
      if(row.reviewId)action.innerHTML='<div class="policy-review-actions-v78"><button onclick="event.stopPropagation();openKnowledgeDetail('+index+')">查看</button></div>';
    });
    if(!shown){body.innerHTML='<tr><td colspan="10"><div class="kb-empty"><b>暂无符合审核状态的数据</b><span>请调整审核状态或其他筛选条件后重新查看</span></div></td></tr>'}
    var count=document.getElementById('kbResultCount');if(count)count.textContent='共 '+shown+' 条数据 · 已展示第 1 页';
  }
  window.togglePolicyPublishV83=function(index,event){
    if(event)event.stopPropagation();var row=knowledgeBaseConfigs.policy.rows[index];if(!row)return;var state=auditState(row);if(state!=='approved'){notify(state==='pending'?'待审核政策不能发布，请先在详情中完成审核':'已驳回政策不能发布，请修订后重新提交审核');return}
    row.publishStatus=!row.publishStatus;row.publishUpdatedAt='2026-08-24 18:10';row.publishOperator='知识库运营审核员 · 王宁';renderKnowledgeList();notify(row.publishStatus?'政策已打开发布，可参与检索与业务应用':'政策已关闭发布，不再参与前台检索与匹配');
  };
  function mountDetailActions(index){
    if(typeof activeKnowledgeType==='undefined'||activeKnowledgeType!=='policy')return;var row=knowledgeBaseConfigs.policy.rows[index],body=document.getElementById('kbDetailBody');if(!row||!body)return;detailPolicyIndexV83=index;ensurePolicyState(row);
    var old=document.getElementById('policyDetailGovernanceV83');if(old)old.remove();var state=auditState(row),bar=document.createElement('section');bar.id='policyDetailGovernanceV83';bar.className='policy-detail-governance-v83 '+state;
    bar.innerHTML='<div><span>审核状态</span><b>'+stateText(state)+'</b><em>发布状态：'+(row.publishStatus?'已发布':'已关闭')+'</em></div>'+(state==='pending'?'<div class="policy-detail-review-actions-v83"><button type="button" class="reject" onclick="openPolicyAuditV78(\''+row.reviewId+'\',\'reject\')">驳回入库</button><button type="button" class="approve" onclick="openPolicyAuditV78(\''+row.reviewId+'\',\'approve\')">通过并正式入库</button></div>':'<p>'+(state==='approved'?'该记录已通过审核，可在政策库列表切换发布状态。':'该记录已驳回，需修订后重新提交审核。')+'</p>');body.insertAdjacentElement('afterbegin',bar);
  }
  var previousOpen=window.openKnowledgeBase;
  if(typeof previousOpen==='function')window.openKnowledgeBase=function(type){var result=previousOpen.apply(this,arguments);mountAuditFilter();return result};
  var previousRender=window.renderKnowledgeList;
  if(typeof previousRender==='function')window.renderKnowledgeList=function(){var result=previousRender.apply(this,arguments);enhancePolicyTable();return result};
  var previousDetail=window.openKnowledgeDetail;
  if(typeof previousDetail==='function')window.openKnowledgeDetail=function(index){var result=previousDetail.apply(this,arguments);mountDetailActions(index);return result};
  var previousConfirmAudit=window.confirmPolicyAuditV78;
  if(typeof previousConfirmAudit==='function')window.confirmPolicyAuditV78=function(){var index=detailPolicyIndexV83,result=previousConfirmAudit.apply(this,arguments);if(index!=null){var row=knowledgeBaseConfigs.policy.rows[index];if(row){row.publishStatus=auditState(row)==='approved';setTimeout(function(){if(typeof openKnowledgeDetail==='function')openKnowledgeDetail(index)},0)}}return result};
  mountAuditFilter();
  if(typeof prototypeLogicAnnotations!=='undefined')prototypeLogicAnnotations.knowledgeList.interactions.push(['政策审核与发布','使用审核状态筛选待审核、已通过或已驳回记录；点击记录查看详情。','待审核记录的通过/驳回只在详情弹窗操作；审核通过后可在列表打开或关闭发布，关闭后不参与检索与业务匹配。']);
})();

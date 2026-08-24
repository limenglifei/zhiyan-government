(function(){
  'use strict';
  function simplifySimilarPolicy(index){
    if(typeof activeKnowledgeType==='undefined'||activeKnowledgeType!=='policy'||typeof knowledgeBaseConfigs==='undefined')return;var row=knowledgeBaseConfigs.policy.rows[index];if(!row||!row.auditTaskV80)return;
    var table=document.querySelector('#kbDetailBody .similar-policy-table-v80');if(!table)return;var rows=Array.from(table.querySelectorAll('tbody tr'));rows.slice(1).forEach(function(tr){tr.remove()});
    var head=table.querySelector('thead tr');if(head&&head.children.length>5)head.lastElementChild.remove();var first=table.querySelector('tbody tr');if(!first)return;if(first.children.length>5)first.lastElementChild.remove();first.onclick=null;first.onkeydown=null;first.removeAttribute('tabindex');first.removeAttribute('role');first.removeAttribute('aria-label');first.classList.add('single-similar-policy-v92');
    var policy=row.similarPolicies&&row.similarPolicies[0],nameCell=first.children[0];if(policy&&nameCell)nameCell.innerHTML='<a class="similar-policy-link-v92" href="policy-detail.html?id=hz-digital-guide-2026&title='+encodeURIComponent(policy.title)+'" target="_blank" rel="noopener"><b>'+String(policy.title).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})+'</b><span>新页面查看政策详情 ↗</span></a>';
    var title=table.closest('.kb-detail-section')&&table.closest('.kb-detail-section').querySelector('h3');if(title)title.textContent='相似政策及疑似重复检测（最高相似度 1 条）';
  }
  var legacyOpenDetail=window.openKnowledgeDetail;if(typeof legacyOpenDetail==='function')window.openKnowledgeDetail=function(index){var result=legacyOpenDetail.apply(this,arguments);simplifySimilarPolicy(index);return result};
  if(typeof prototypeLogicAnnotations!=='undefined')prototypeLogicAnnotations.knowledgeList.interactions.push(['最高相似政策下钻','政策入库审核任务仅展示最高相似度的1条疑似重复政策。','不再展示操作列；点击政策名称在新页面打开对应政策详情，避免打断当前审核上下文。']);
})();

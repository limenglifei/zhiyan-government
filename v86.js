(function(){
  'use strict';
  var legacySetProject=window.setPolicyProjectSelectedV79;
  var legacyConfirmPolicy=window.confirmParsedPolicyV79;

  function notify(text){if(typeof window.toast==='function')window.toast(text)}
  function selectedProject(){var input=document.querySelector('.policy-project-check-v79:checked'),card=input&&input.closest('.policy-project-card-v79');if(!card)return null;var title=card.querySelector('header b'),meta=card.querySelector('header span');return {name:title?title.textContent.trim():'政策项目',meta:meta?meta.textContent.trim():'政策项目'}}
  function updateSingleCopy(){
    var count=document.getElementById('projectSelectionCountV79'),head=document.querySelector('.project-select-head-v79 p'),footer=document.querySelector('.policy-parse-modal-v79>footer>span'),title=document.querySelector('.project-select-head-v79 h3');
    if(count)count.textContent=document.querySelector('.policy-project-check-v79:checked')?'已选 1 项':'请选择 1 项';
    if(head)head.textContent='解析出的政策项目仅支持单选；申报条件、补贴政策和申报时间随当前项目展示并参与匹配。';
    if(footer)footer.textContent='请选择 1 个政策项目参与本次企业匹配。';
    if(title&&title.firstChild)title.firstChild.textContent='选择本次参与匹配的政策项目 ';
  }
  function normalizeProjectSelection(){
    var inputs=Array.from(document.querySelectorAll('.policy-project-check-v79'));if(!inputs.length||typeof legacySetProject!=='function')return;
    var keep=inputs.find(function(input){return input.checked})||inputs[0];
    inputs.forEach(function(input){var card=input.closest('.policy-project-card-v79');if(card)legacySetProject(Number(card.dataset.index),false)});
    var keepCard=keep.closest('.policy-project-card-v79');if(keepCard)legacySetProject(Number(keepCard.dataset.index),true);
    inputs.forEach(function(input){input.type='radio';input.name='policyProjectSingleV86';input.setAttribute('aria-label','选择该项目参与匹配')});
    updateSingleCopy();
  }
  if(typeof legacySetProject==='function')window.setPolicyProjectSelectedV79=function(index,checked){
    if(!checked){var current=document.querySelector('.policy-project-check-v79:checked');if(current&&Number(current.closest('.policy-project-card-v79').dataset.index)===index){current.checked=true;notify('本次匹配必须选择 1 个政策项目')}updateSingleCopy();return}
    Array.from(document.querySelectorAll('.policy-project-check-v79')).forEach(function(input){var card=input.closest('.policy-project-card-v79');if(card)legacySetProject(Number(card.dataset.index),false)});
    legacySetProject(index,true);Array.from(document.querySelectorAll('.policy-project-check-v79')).forEach(function(input){input.type='radio';input.name='policyProjectSingleV86'});updateSingleCopy();
  };
  window.toggleAllPolicyProjectsV79=function(){normalizeProjectSelection()};
  if(typeof legacyConfirmPolicy==='function')window.confirmParsedPolicyV79=function(){
    normalizeProjectSelection();var project=selectedProject();if(!project){notify('请选择 1 个政策项目参与匹配');return}
    var result=legacyConfirmPolicy.apply(this,arguments),tabs=document.getElementById('supportProjectTabsV82');if(tabs)tabs.remove();
    var banner=document.getElementById('selectedPolicyProjectsV79');if(banner)banner.innerHTML='<div><h3>本次匹配项目：'+project.name+'</h3><p>系统仅依据当前项目的申报条件、补贴政策和申报时间诊断企业，并按匹配度倒序展示结果。</p></div><div><em>'+project.name+'</em></div>';
    var title=document.getElementById('supportResultTitle');if(title)title.textContent=project.name+' · 企业匹配结果';return result;
  };

  function enhanceFieldReviewButtons(index){
    if(typeof activeKnowledgeType==='undefined'||activeKnowledgeType!=='company'||typeof knowledgeBaseConfigs==='undefined')return;
    var task=knowledgeBaseConfigs.company.rows[index];if(!task||!task.profileReviewTaskV84)return;
    document.querySelectorAll('.company-field-review-wrap-v84 tbody tr').forEach(function(row,fieldIndex){
      var select=row.querySelector('[data-profile-field-review]'),field=task.fields[fieldIndex];if(!select||!field||row.querySelector('.field-review-actions-v86'))return;
      select.classList.add('field-review-select-v86');var actions=document.createElement('div');actions.className='field-review-actions-v86';actions.innerHTML='<button type="button" class="approve '+(field.status==='approved'?'active':'')+'" title="通过该字段" onclick="setEnterpriseFieldDecisionV86('+index+','+fieldIndex+',\'approved\')"><i>✓</i><span>通过</span></button><button type="button" class="reject '+(field.status==='rejected'?'active':'')+'" title="驳回该字段" onclick="setEnterpriseFieldDecisionV86('+index+','+fieldIndex+',\'rejected\')"><i>×</i><span>驳回</span></button>';
      select.insertAdjacentElement('afterend',actions);
    });
  }
  window.setEnterpriseFieldDecisionV86=function(taskIndex,fieldIndex,status){
    var task=knowledgeBaseConfigs.company.rows[taskIndex],field=task&&task.fields[fieldIndex];if(!field)return;field.status=status;
    var select=document.querySelector('[data-profile-field-review="'+fieldIndex+'"]');if(select)select.value=status;var actions=select&&select.parentElement.querySelector('.field-review-actions-v86');if(actions){actions.querySelector('.approve').classList.toggle('active',status==='approved');actions.querySelector('.reject').classList.toggle('active',status==='rejected')}
    notify('“'+field.label+'”已标记为'+(status==='approved'?'通过':'驳回')+'，点击保存可暂存审核结论');
  };
  var legacyOpenDetail=window.openKnowledgeDetail;if(typeof legacyOpenDetail==='function')window.openKnowledgeDetail=function(index){var result=legacyOpenDetail.apply(this,arguments);enhanceFieldReviewButtons(index);return result};

  var projectList=document.getElementById('policyProjectListV79');if(projectList)new MutationObserver(function(){setTimeout(normalizeProjectSelection,0)}).observe(projectList,{childList:true});
  var staleTabs=document.getElementById('supportProjectTabsV82');if(staleTabs)staleTabs.remove();updateSingleCopy();
  if(typeof prototypeLogicAnnotations!=='undefined'){
    prototypeLogicAnnotations.support.interactions.push(['政策项目单选匹配','政策文件或全文解析完成后，从拆解项目中选择一个。','每次仅允许一个项目参与匹配；结果页不生成项目页签，仅按该项目条件输出企业排序与诊断。']);
    prototypeLogicAnnotations.knowledgeList.interactions.push(['企业画像字段直接审核','打开企业画像更新审核任务，逐字段核对原值、提交值和证明材料。','字段结果列直接提供“通过/驳回”按钮，选择后可保存审核进度，完成审核时仅通过字段正式入库。']);
  }
})();

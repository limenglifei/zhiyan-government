(function(){
  'use strict';
  var MAX_PROJECTS=3,activeProject=0,projectTabs=[],baseCompanies=[];
  function notify(text){if(typeof window.toast==='function')window.toast(text)}
  function selectedChecks(){return Array.from(document.querySelectorAll('.policy-project-check-v79:checked'))}
  function selectedProjects(){return selectedChecks().map(function(check){var card=check.closest('.policy-project-card-v79'),title=card&&card.querySelector('header b'),meta=card&&card.querySelector('header span');return {name:title?title.textContent.trim():'政策项目',meta:meta?meta.textContent.trim():'政策项目'}})}
  function enhanceSelectionUi(){
    var count=document.getElementById('projectSelectionCountV79'),head=document.querySelector('.project-select-head-v79 p'),footer=document.querySelector('.policy-parse-modal-v79>footer>span');
    if(count)count.textContent='已选 '+selectedChecks().length+' / '+MAX_PROJECTS+' 项';
    if(head)head.textContent='最多勾选 3 个项目同时参与匹配；申报条件、补贴政策和申报时间按项目独立诊断。';
    if(footer)footer.textContent='至少选择 1 个、最多选择 3 个项目；匹配结果按项目页签分别展示。';
  }
  var previousSet=window.setPolicyProjectSelectedV79;
  if(typeof previousSet==='function')window.setPolicyProjectSelectedV79=function(index,checked){
    if(checked&&selectedChecks().length>=MAX_PROJECTS){var input=document.querySelector('.policy-project-card-v79[data-index="'+index+'"] .policy-project-check-v79');if(input)input.checked=false;notify('一次最多选择 3 个政策项目参与匹配');enhanceSelectionUi();return}
    var result=previousSet.apply(this,arguments);enhanceSelectionUi();return result;
  };
  var previousToggle=window.toggleAllPolicyProjectsV79;
  if(typeof previousToggle==='function')window.toggleAllPolicyProjectsV79=function(checked){
    if(!checked){var result=previousToggle.apply(this,arguments);enhanceSelectionUi();return result}
    previousToggle.call(this,false);Array.from(document.querySelectorAll('.policy-project-check-v79')).slice(0,MAX_PROJECTS).forEach(function(input){var card=input.closest('.policy-project-card-v79');previousSet(Number(card.dataset.index),true)});enhanceSelectionUi();notify('已按顺序选择前 3 个项目');
  };
  function projectModel(project,index){var total=Math.max(86,186-index*29-(project.name.length%7)),unenjoyed=Math.max(12,23-index*3+(project.name.length%3)),enjoyed=Math.max(31,68-index*9);return {total:total,unenjoyed:unenjoyed,enjoyed:enjoyed}}
  function updateStats(model){
    var values={all:model.total,unenjoyed:model.unenjoyed,enjoyed:model.enjoyed};
    document.querySelectorAll('#support [data-support-filter]').forEach(function(button){var value=button.querySelector('b');if(value&&values[button.dataset.supportFilter]!=null)value.textContent=values[button.dataset.supportFilter]});
  }
  function applyProjectSample(index){
    if(typeof companies==='undefined')return;
    if(!baseCompanies.length)baseCompanies=companies.map(function(c){return {score:c.s,status:c.status}});
    companies.forEach(function(company,i){var base=baseCompanies[i],offset=((i*7+index*11)%13)-6;company.s=Math.max(72,Math.min(98,base.score+offset-index*2));company.status=(i+index)%3===0?'unenjoyed':'enjoyed'});
  }
  function renderProjectTabs(){
    var area=document.getElementById('supportResultArea'),stats=area&&area.querySelector('.support-stats');if(!area||!stats||!projectTabs.length)return;
    var tabs=document.getElementById('supportProjectTabsV82');if(!tabs){tabs=document.createElement('nav');tabs.id='supportProjectTabsV82';tabs.className='support-project-tabs-v82';tabs.setAttribute('role','tablist');stats.insertAdjacentElement('beforebegin',tabs)}
    tabs.innerHTML=projectTabs.map(function(project,index){var model=projectModel(project,index);return '<button type="button" role="tab" aria-selected="'+(index===activeProject)+'" class="'+(index===activeProject?'active':'')+'" onclick="setSupportProjectTabV82('+index+')"><i>'+String(index+1).padStart(2,'0')+'</i><span><b>'+project.name+'</b><small>'+project.meta+' · 匹配 '+model.total+' 家</small></span></button>'}).join('');
  }
  window.setSupportProjectTabV82=function(index){
    if(!projectTabs[index])return;activeProject=index;renderProjectTabs();applyProjectSample(index);var model=projectModel(projectTabs[index],index);updateStats(model);
    if(typeof supportFilter!=='undefined')supportFilter='all';if(typeof supportPage!=='undefined')supportPage=1;if(typeof ci!=='undefined')ci=0;
    document.querySelectorAll('#support [data-support-filter]').forEach(function(button){button.classList.toggle('active',button.dataset.supportFilter==='all')});
    var title=document.getElementById('supportResultTitle');if(title)title.textContent=projectTabs[index].name+' · 企业匹配结果';
    if(typeof renderCompanies==='function')renderCompanies();
  };
  var previousConfirm=window.confirmParsedPolicyV79;
  if(typeof previousConfirm==='function')window.confirmParsedPolicyV79=function(){
    var projects=selectedProjects();if(projects.length>MAX_PROJECTS){notify('一次最多选择 3 个政策项目参与匹配');return}
    var result=previousConfirm.apply(this,arguments);if(projects.length){projectTabs=projects;activeProject=0;renderProjectTabs();setSupportProjectTabV82(0)}return result;
  };
  var list=document.getElementById('policyProjectListV79');if(list)new MutationObserver(function(){setTimeout(enhanceSelectionUi,0)}).observe(list,{childList:true});enhanceSelectionUi();
  if(typeof prototypeLogicAnnotations!=='undefined')prototypeLogicAnnotations.support.interactions.push(['多项目匹配页签','政策解析确认时勾选 1—3 个项目。','最多允许 3 个项目同时参与；结果按项目生成独立页签，切换页签同步刷新匹配企业数量、排序、状态筛选和条件诊断。']);
})();

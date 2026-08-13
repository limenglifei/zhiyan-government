(function(){
  'use strict';
  var managerIndexV67=0;

  function chainCompaniesV67(){
    var row=window.knowledgeBaseConfigs&&knowledgeBaseConfigs.chain&&knowledgeBaseConfigs.chain.rows[managerIndexV67];
    return row&&Array.isArray(row.linkedCompanies)?row.linkedCompanies:[];
  }
  function stageCountV67(stage){
    return chainCompaniesV67().filter(function(company){return(company.chainStage||'中游')===stage}).length;
  }
  function decorateChainListV67(){
    if(window.activeKnowledgeType!=='chain')return;
    document.querySelectorAll('#kbTableBody tr').forEach(function(tr,position){
      var item=window.activeKnowledgeRows&&activeKnowledgeRows[position];if(!item)return;
      var weakCell=tr.children[5];
      if(weakCell){
        weakCell.classList.add('chain-weak-static-v67');
        weakCell.title='薄弱环节仅展示诊断结果，请通过“编辑”进入产业链详情';
        weakCell.onclick=function(event){event.stopPropagation()};
      }
      var edit=Array.from(tr.querySelectorAll('.chain-row-actions-v47 button')).find(function(button){return button.textContent.trim()==='编辑'});
      if(edit){
        edit.title='进入产业链详情编辑';
        edit.onclick=function(event){event.stopPropagation();openKnowledgeDetail(item.index)};
      }
    });
  }
  var previousRenderKnowledgeV67=window.renderKnowledgeList;
  if(previousRenderKnowledgeV67)window.renderKnowledgeList=function(){var result=previousRenderKnowledgeV67.apply(this,arguments);decorateChainListV67();return result};

  function decorateAddCompanyV67(){
    var modal=document.getElementById('chainCompanyAddModalV65');if(!modal)return;
    var title=modal.querySelector('h2'),desc=modal.querySelector('header p');
    if(title)title.textContent='添加链上企业';
    if(desc)desc.textContent='选择企业和挂靠节点，并配置其在当前产业链中的链上角色';
    var select=document.getElementById('chainAddImportanceV66');
    if(select){var label=select.closest('label'),caption=label&&label.querySelector(':scope > span');if(caption)caption.textContent='链上角色'}
  }
  var previousAddOpenV67=window.openChainCompanyAddV65;
  if(previousAddOpenV67)window.openChainCompanyAddV65=function(){var result=previousAddOpenV67.apply(this,arguments);decorateAddCompanyV67();return result};

  decorateChainListV67();
})();

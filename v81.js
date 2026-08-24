(function(){
  'use strict';
  function cleanResultHints(){['policyReviewBannerV79','policyReviewBannerV78','policyReviewBannerV77','policyUpdateBannerV77','selectedPolicyProjectsV79'].forEach(function(id){var node=document.getElementById(id);if(node)node.remove()})}
  function selectedProjectNames(){return Array.from(document.querySelectorAll('.policy-project-check-v79:checked')).map(function(check){var card=check.closest('.policy-project-card-v79');var title=card&&card.querySelector('header b');return title?title.textContent.trim():''}).filter(Boolean)}
  function fillProjectsIntoInput(names){
    var composer=document.getElementById('supportPolicyComposerV45'),hidden=document.getElementById('supportPolicyInput');if(!composer||!names.length)return;
    composer.value=names.join('、');if(hidden)hidden.value=composer.value;composer.closest('.support-composer-field-v45').classList.add('has-selected-projects-v81');
    var hint=composer.closest('.support-composer-field-v45').querySelector('.support-composer-hint-v45 span');if(hint)hint.innerHTML='已选择政策项目参与匹配 <em class="selected-project-count-v81">'+names.length+' 项</em>';
    var resultTitle=document.getElementById('supportResultTitle');if(resultTitle)resultTitle.textContent=names.length+' 个政策项目 · 企业匹配结果';
  }
  var previousConfirm=window.confirmParsedPolicyV79;
  if(typeof previousConfirm==='function')window.confirmParsedPolicyV79=function(){var names=selectedProjectNames();var result=previousConfirm.apply(this,arguments);if(names.length){fillProjectsIntoInput(names);cleanResultHints()}return result};
  var previousOpenKnowledge=window.openKnowledgeBase;
  if(typeof previousOpenKnowledge==='function')window.openKnowledgeBase=function(){cleanResultHints();return previousOpenKnowledge.apply(this,arguments)};
  if(typeof prototypeLogicAnnotations!=='undefined')prototypeLogicAnnotations.support.interactions.push(['匹配项目回填','确认政策解析结果并勾选项目。','参与匹配的项目名称直接回填到政策输入框；结果页不展示入库待审核记录，审核任务仅在政策库管理。']);
})();

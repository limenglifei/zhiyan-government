/* v93 · 审核通过/驳回二次确认弹窗置顶与焦点管理 */
(function(){
  'use strict';

  function elevatePolicyAuditModal(){
    var modal=document.getElementById('policyAuditModalV78');
    if(!modal)return;
    /* 将确认层移动到 body 最后，避免被后挂载的详情弹窗遮挡。 */
    if(modal.parentNode===document.body)document.body.appendChild(modal);
    modal.style.zIndex='9999';
    window.setTimeout(function(){
      var remark=document.getElementById('policyAuditRemarkV78');
      if(remark)remark.focus();
    },0);
  }

  function install(){
    if(typeof window.openPolicyAuditV78!=='function'||window.openPolicyAuditV78.__v93Wrapped)return;
    var legacyOpen=window.openPolicyAuditV78;
    var wrapped=function(){
      var result=legacyOpen.apply(this,arguments);
      elevatePolicyAuditModal();
      return result;
    };
    wrapped.__v93Wrapped=true;
    window.openPolicyAuditV78=wrapped;
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',install);
  }else{
    install();
  }
})();


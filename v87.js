(function(){
  'use strict';
  function notify(text){if(typeof window.toast==='function')window.toast(text)}
  function esc(value){return String(value==null?'':value).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function safeName(value){var name=String(value||'').split('、')[0].trim();if(!name||/待补充|用户填报承诺/.test(name))return '';return name.replace(/[\\/:*?"<>|]/g,'_')}
  function enhanceProofDownloads(index){
    if(typeof activeKnowledgeType==='undefined'||activeKnowledgeType!=='company'||typeof knowledgeBaseConfigs==='undefined')return;
    var task=knowledgeBaseConfigs.company.rows[index];if(!task||!task.profileReviewTaskV84)return;
    document.querySelectorAll('.company-field-review-wrap-v84 tbody tr').forEach(function(row,fieldIndex){
      var cell=row.children[3],field=task.fields[fieldIndex];if(!cell||!field)return;var fileName=safeName(field.proof),missing=!fileName;
      cell.innerHTML='<button class="proof-download-btn-v87 '+(missing?'missing':'')+'" type="button" onclick="downloadEnterpriseProofV87('+index+','+fieldIndex+')"><i>⇩</i><span>'+esc(missing?'证明材料待补充':field.proof)+'</span><em>'+(missing?'暂无文件':'下载')+'</em></button>';
    });
  }
  window.downloadEnterpriseProofV87=function(taskIndex,fieldIndex){
    var task=knowledgeBaseConfigs.company.rows[taskIndex],field=task&&task.fields[fieldIndex];if(!field)return;var fileName=safeName(field.proof);if(!fileName){notify('该字段暂未上传证明材料，无法下载');return}
    var content=['智研平台 · 企业画像更新证明材料下载凭证','企业名称：'+task.title,'统一社会信用代码：'+task.code,'审核字段：'+field.label,'用户提交值：'+field.newValue,'原始材料：'+field.proof,'提交人：'+task.submitter,'提交时间：'+task.submitTime,'说明：产品原型环境使用下载凭证模拟原始附件下载。'].join('\r\n');
    var blob=new Blob([content],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=fileName;document.body.appendChild(link);link.click();link.remove();setTimeout(function(){URL.revokeObjectURL(url)},500);notify('证明材料已开始下载：'+fileName);
  };
  var legacyOpenDetail=window.openKnowledgeDetail;if(typeof legacyOpenDetail==='function')window.openKnowledgeDetail=function(index){var result=legacyOpenDetail.apply(this,arguments);enhanceProofDownloads(index);return result};
  var previewModal=document.getElementById('enterpriseProofPreviewV85');if(previewModal){previewModal.classList.remove('open');previewModal.setAttribute('aria-hidden','true')}
  if(typeof prototypeLogicAnnotations!=='undefined')prototypeLogicAnnotations.knowledgeList.interactions.push(['企业画像证明材料下载','打开企业画像更新审核任务，在字段证明材料列点击下载。','有原始材料时按文件名下载；未上传材料时提示待补充，不再提供在线预览入口。']);
})();

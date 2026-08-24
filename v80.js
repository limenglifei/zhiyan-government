(function(){
  'use strict';
  var parseFlowActive=false;

  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]})}
  function notify(v){if(typeof window.toast==='function')window.toast(v)}
  function closeModal(id){var m=document.getElementById(id);if(!m)return;m.classList.remove('open');m.setAttribute('aria-hidden','true');document.body.style.overflow=''}
  function statusText(row){return row.reviewStatus==='pending'?'待审核':row.reviewStatus==='rejected'?'已驳回':'已通过'}

  function mountTransition(){
    if(document.getElementById('policyMatchTransitionV80'))return;
    var support=document.getElementById('support'),result=document.getElementById('supportResultArea');if(!support||!result)return;
    var transition=document.createElement('section');transition.id='policyMatchTransitionV80';transition.className='policy-match-transition-v80';transition.innerHTML='<i></i><div><b id="policyMatchTransitionTitleV80">解析结果已确认，正在匹配企业</b><span id="policyMatchTransitionTextV80">按所选政策项目逐项执行硬条件过滤、匹配度计算和应享未享识别…</span></div>';result.insertAdjacentElement('beforebegin',transition);
  }

  function enrichAuditTask(row){
    if(!row)return;
    var fromText=String(row.attachments||'').indexOf('用户粘贴政策全文')>-1;
    row.auditTaskV80=true;row.auditTaskId='POL-IN-'+String(Date.now()).slice(-8);row.sub='政策入库审核任务：'+row.auditTaskId+' · 待审核';row.originalFile=fromText?'用户粘贴政策全文快照.txt':String(row.attachments||'政策原始附件').split('；')[0];row.submitter=row.creator||'政策服务人员 · 李敏';row.department='海州市工业和信息化局 · 企业服务处';row.submitTime=row.createdAt||'2026-08-24 16:46';row.reviewStatus='pending';row.status='待审核';
    row.structuredSnapshot={title:row.title,category:row.category,date:row.date,org:row.org,level:row.level,region:row.region,industry:row.industry,body:row.body,attachment:row.attachments};
    row.userModifiedFields=['适用行业（AI解析后用户确认）','附件及原文链接（用户补充）'];
    row.similarPolicies=[
      {title:'海州市制造业数字化转型扶持计划申报指南',org:'海州市工业和信息化局',date:'2026-07-18',similarity:'86%',result:'疑似同主题政策，建议核对是否为补充通知'},
      {title:'海州市智能工厂和数字化车间认定管理办法',org:'海州市工业和信息化局',date:'2026-05-12',similarity:'72%',result:'部分项目与申报条件相似'},
      {title:'省制造业数字化转型专项资金管理细则',org:'省工业和信息化厅',date:'2026-03-20',similarity:'58%',result:'上位政策依据，非重复文件'}
    ];
    row.duplicateSummary='发现 1 条疑似同主题政策、1 条部分相似政策；需审核员判断新建、合并或作为关联文件入库。';
  }

  function mountConfirmGate(){
    var support=document.getElementById('support'),composer=document.getElementById('supportPolicyComposerV45'),fileInput=document.getElementById('supportPolicyFileInput');if(!support)return;
    var previousRun=window.runSupportMatch;
    if(typeof previousRun==='function')window.runSupportMatch=function(){var text=composer?composer.value.trim():'',hasFile=!!(fileInput&&fileInput.files&&fileInput.files.length),isFullText=!hasFile&&(text.length>55||/[\r\n]/.test(text));parseFlowActive=hasFile||isFullText;if(parseFlowActive){support.classList.add('policy-confirm-pending-v80');support.classList.remove('matching-v80')}return previousRun.apply(this,arguments)};

    var previousConfirm=window.confirmParsedPolicyV79;
    if(typeof previousConfirm==='function')window.confirmParsedPolicyV79=function(apply){
      var selected=document.querySelectorAll('.policy-project-check-v79:checked');if(!selected.length){return previousConfirm.apply(this,arguments)}
      var before=[];if(typeof knowledgeBaseConfigs!=='undefined')before=knowledgeBaseConfigs.policy.rows.map(function(r){return r.reviewId}).filter(Boolean);
      var result=previousConfirm.apply(this,arguments);
      if(apply&&typeof knowledgeBaseConfigs!=='undefined'){var row=knowledgeBaseConfigs.policy.rows.find(function(r){return r.schemaV79&&before.indexOf(r.reviewId)<0});enrichAuditTask(row)}
      support.classList.add('policy-confirm-pending-v80','matching-v80');
      var title=document.getElementById('policyMatchTransitionTitleV80'),text=document.getElementById('policyMatchTransitionTextV80');if(title)title.textContent='解析结果已确认，正在匹配企业';if(text)text.textContent='正在按 '+selected.length+' 个已选政策项目分别诊断申报条件、计算匹配度并合并企业名单…';
      var button=document.getElementById('supportMatchBtn');if(button){button.disabled=true;button.textContent='AI 匹配中…'}
      setTimeout(function(){support.classList.remove('policy-confirm-pending-v80','matching-v80');support.classList.add('matched');if(button){button.disabled=false;button.textContent='✓ 重新匹配企业'}var resultArea=document.getElementById('supportResultArea');if(resultArea)resultArea.scrollIntoView({behavior:'smooth',block:'start'});notify('已按确认的 '+selected.length+' 个政策项目刷新企业匹配结果')},900);
      parseFlowActive=false;return result;
    };

    var previousClose=window.closePolicyParseV79;
    window.closePolicyParseV79=function(){if(typeof previousClose==='function')previousClose();if(parseFlowActive){support.classList.remove('policy-confirm-pending-v80','matching-v80','matched','match-loading');var button=document.getElementById('supportMatchBtn');if(button){button.disabled=false;button.textContent='✦ 一键匹配企业'}parseFlowActive=false;notify('已取消本次政策解析，尚未刷新匹配结果')}};
  }

  function renderAuditTaskDetail(row){
    document.getElementById('kbDetailType').textContent='政策库 · 政策入库审核任务';document.getElementById('kbDetailTitle').innerHTML=esc(row.title)+'<span class="policy-task-label-v80">'+statusText(row)+'</span>';document.getElementById('kbDetailMeta').textContent='任务 '+row.auditTaskId+' · '+row.submitter+' · '+row.submitTime;
    var snap=row.structuredSnapshot||{},fields=[['政策标题',snap.title||row.title,true],['文件分类',snap.category||row.category],['发布时间',snap.date||row.date],['发文机构',snap.org||row.org],['政策级别',snap.level||row.level],['适用地区',snap.region||row.region],['适用行业',snap.industry||row.industry],['政策正文',snap.body||row.body,true],['附件及原文链接',snap.attachment||row.attachments,true]];
    var projects=(row.projects||[]).map(function(p){return '<article class="'+(p.selected?'selected':'')+'"><header><h4>'+esc(p.name)+'</h4><span>'+(p.selected?'✓ 本次参与匹配':'本次未参与匹配')+'</span></header><dl><div><dt>项目分类</dt><dd>'+esc(p.category)+'</dd></div><div><dt>最高补贴</dt><dd>'+esc(p.amount)+'</dd></div><div class="wide"><dt>申报条件</dt><dd>'+esc(p.condition)+'</dd></div><div class="wide"><dt>补贴政策</dt><dd>'+esc(p.subsidy)+'</dd></div><div><dt>申报时间</dt><dd>'+esc(p.applyTime)+'</dd></div><div><dt>申报截止</dt><dd>'+esc(p.deadline)+'</dd></div></dl></article>'}).join('');
    var similar=(row.similarPolicies||[]).map(function(p,i){return '<tr><td><b>'+esc(p.title)+'</b></td><td>'+esc(p.org)+'</td><td>'+esc(p.date)+'</td><td><em class="similarity-v80 '+(i===2?'low':'')+'">'+esc(p.similarity)+'</em></td><td>'+esc(p.result)+'</td></tr>'}).join('');
    document.getElementById('kbDetailBody').innerHTML='<div class="policy-task-overview-v80"><div><span>任务状态</span><em>'+statusText(row)+'</em></div><div><span>提交人及部门</span><b>'+esc(row.submitter)+'<br>'+esc(row.department)+'</b></div><div><span>提交时间</span><b>'+esc(row.submitTime)+'</b></div><div><span>原始文件</span><b>'+esc(row.originalFile)+'</b></div></div><div class="policy-snapshot-v80"><h4>结构化字段数据快照</h4><p><b>数据组成：</b>AI 初次解析结果 + 用户确认修改内容。<br><b>用户修改：</b>'+esc((row.userModifiedFields||[]).join('；'))+'。审核通过前不会覆盖政策库正式数据，且不影响本次企业匹配结果。</p></div><section class="kb-detail-section"><h3>政策文件结构化字段</h3><dl class="kb-field-grid">'+fields.map(function(f){return '<div class="kb-field'+(f[2]?' wide':'')+'"><dt>'+f[0]+'</dt><dd>'+f[1]+'</dd></div>'}).join('')+'</dl></section><section class="kb-detail-section"><h3>拆解出的政策项目</h3><div class="uploaded-project-detail-v79">'+projects+'</div></section><section class="kb-detail-section"><h3>相似政策及疑似重复检测</h3><table class="similar-policy-table-v80"><thead><tr><th>相似政策</th><th>发文机构</th><th>发布时间</th><th>相似度</th><th>检测结果</th></tr></thead><tbody>'+similar+'</tbody></table><div class="duplicate-summary-v80"><span><b>检测结论：</b>'+esc(row.duplicateSummary)+'</span><span>审核建议：人工复核</span></div></section>';
    var modal=document.getElementById('kbDetailModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
  }
  function mountTaskDetail(){var previous=window.openKnowledgeDetail;if(typeof previous!=='function')return;window.openKnowledgeDetail=function(index){if(typeof activeKnowledgeType!=='undefined'&&activeKnowledgeType==='policy'){var row=knowledgeBaseConfigs.policy.rows[index];if(row&&row.auditTaskV80){renderAuditTaskDetail(row);return}}return previous.apply(this,arguments)}}
  function extendNotes(){if(typeof prototypeLogicAnnotations==='undefined')return;prototypeLogicAnnotations.support.interactions.push(['解析确认后匹配','上传附件或粘贴全文并点击匹配。','先隐藏匹配结果并展示解析确认；用户确认字段、项目和使用方式后，才显示匹配中间态并刷新企业结果。']);prototypeLogicAnnotations.knowledgeList.interactions.push(['政策入库审核任务','选择“本次使用并申请加入政策库”。','生成待审核任务，保存原始文件、结构化快照、拆解项目、提交人部门、提交时间和相似重复检测；不影响当前匹配结果。'])}

  mountTransition();mountConfirmGate();mountTaskDetail();extendNotes();
})();

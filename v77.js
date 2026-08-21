(function(){
  'use strict';
  var policyUpload={fileName:'',size:0,type:''};
  var dueVersions=[
    {version:'V3.0',date:'2026-08-21 14:20',model:'招商尽调模型 V2.4',trigger:'企业画像更新',status:'当前版本',current:true},
    {version:'V2.1',date:'2026-08-08 09:42',model:'招商尽调模型 V2.3',trigger:'风险数据更新',status:'已归档'},
    {version:'V1.0',date:'2026-07-24 16:18',model:'招商尽调模型 V2.1',trigger:'首次生成',status:'已归档'}
  ];

  function esc(value){return String(value==null?'':value).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]})}
  function notify(message){if(typeof window.toast==='function')window.toast(message)}
  function openModal(id){var m=document.getElementById(id);if(!m)return;m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
  function closeModal(id){var m=document.getElementById(id);if(!m)return;m.classList.remove('open');m.setAttribute('aria-hidden','true');document.body.style.overflow=''}

  function mountDialogs(){
    if(document.getElementById('policyArchiveModalV77'))return;
    document.body.insertAdjacentHTML('beforeend',
      '<div class="prototype-modal-backdrop" id="policyArchiveModalV77" aria-hidden="true"><section class="prototype-modal governance-modal-v77"><header><div><label>POLICY KNOWLEDGE GOVERNANCE</label><h2>匹配完成，是否申请加入政策库？</h2><p>业务匹配即时生效，是否入库不影响当前结果。</p></div><button type="button" onclick="closeGovernanceModalV77(\'policyArchiveModalV77\')">×</button></header><div class="prototype-modal-body" id="policyArchiveBodyV77"></div></section></div>'+ 
      '<div class="prototype-modal-backdrop" id="enterpriseArchiveModalV77" aria-hidden="true"><section class="prototype-modal governance-modal-v77"><header><div><label>ENTERPRISE PROFILE GOVERNANCE</label><h2>企业信息已完善，是否申请更新企业画像？</h2><p>补充字段已用于本次匹配，正式画像更新需经审核。</p></div><button type="button" onclick="closeGovernanceModalV77(\'enterpriseArchiveModalV77\')">×</button></header><div class="prototype-modal-body" id="enterpriseArchiveBodyV77"></div></section></div>'+ 
      '<div class="prototype-modal-backdrop" id="dueHistoryModalV77" aria-hidden="true"><section class="prototype-modal due-history-modal-v77"><header><div><label>DUE DILIGENCE VERSION ARCHIVE</label><h2 id="dueHistoryCompanyV77">企业尽调报告历史版本</h2><p>新报告形成独立快照，历史版本不覆盖、可追溯。</p></div><button type="button" onclick="closeGovernanceModalV77(\'dueHistoryModalV77\')">×</button></header><div class="prototype-modal-body" id="dueHistoryBodyV77"></div></section></div>');
    ['policyArchiveModalV77','enterpriseArchiveModalV77','dueHistoryModalV77'].forEach(function(id){var m=document.getElementById(id);m.addEventListener('click',function(e){if(e.target===m)closeModal(id)})});
  }

  function policyChoiceView(){
    var name=policyUpload.fileName||'海州市制造业数字化转型扶持计划.pdf';
    document.getElementById('policyArchiveBodyV77').innerHTML=
      '<div class="governance-summary-v77"><i>政</i><div><h3>'+esc(name)+'</h3><p>AI 已解析政策正文、申报条件、支持标准和有效期，并完成 186 家企业匹配。政策库暂无完全相同文件。</p><div class="governance-tags-v77"><span>市级政策</span><span>3 个关联项目</span><span>正文完整度 96%</span><span>重复度 18%</span></div></div></div>'+ 
      '<div class="governance-choice-v77"><button type="button" onclick="choosePolicyArchiveV77(\'temporary\')"><i>次</i><b>仅本次使用</b><span>保留本次匹配快照，不写入正式政策库。</span></button><button class="primary-choice" type="button" onclick="choosePolicyArchiveV77(\'apply\')"><i>库</i><b>申请加入政策库</b><span>保存原始文件、AI 解析结果和业务补充信息，提交知识库运营审核。</span></button></div>'+ 
      '<div class="governance-note-v77"><strong>审核规则：</strong>审核员可通过、部分通过、要求补充、合并重复文件或驳回；审核通过后形成正式政策版本，并可选择采用正式数据重新匹配。</div>';
  }

  function enterpriseChoiceView(){
    document.getElementById('enterpriseArchiveBodyV77').innerHTML=
      '<div class="governance-summary-v77"><i>企</i><div><h3>海州智造科技有限公司 · 企业画像差异</h3><p>本次完善 11 个字段，其中新增 8 项、修改 3 项；补充信息已即时参与当前政策匹配。</p><div class="governance-tags-v77"><span>新增字段 8</span><span>修改字段 3</span><span>证明材料 2</span><span>待核冲突 1</span></div></div></div>'+ 
      '<div class="governance-diff-v77"><h3>字段级变更预览</h3><table><thead><tr><th>字段</th><th>企业库当前值</th><th>本次补充值</th><th>凭证</th></tr></thead><tbody><tr><td>上年度营业收入</td><td>2亿～4亿元</td><td>4亿～10亿元</td><td>审计报告</td></tr><tr><td>研发费用总额</td><td>待补充</td><td>4,472 万元</td><td>研发辅助账</td></tr><tr><td>当前研发人数</td><td>52 人</td><td>62 人</td><td>人员花名册</td></tr><tr><td>企业荣誉资质</td><td>高新技术企业</td><td>新增“专精特新”</td><td>认定证书</td></tr></tbody></table></div>'+ 
      '<div class="governance-choice-v77"><button type="button" onclick="chooseEnterpriseArchiveV77(\'temporary\')"><i>次</i><b>仅本次匹配使用</b><span>保留本次匹配快照，不改写企业库正式画像。</span></button><button class="primary-choice" type="button" onclick="chooseEnterpriseArchiveV77(\'apply\')"><i>审</i><b>申请更新企业画像</b><span>按字段提交审核；通过字段更新，冲突字段保留来源和版本。</span></button></div>'+ 
      '<div class="governance-note-v77"><strong>冲突处理：</strong>工商字段以权威源优先，财务字段需凭证，荣誉资质需认定文件；审核支持按字段部分通过。</div>';
  }

  function taskView(kind){
    var policy=kind==='policy',taskId=policy?'POL-UPD-20260821-001':'ENT-UPD-20260821-001';
    var body=document.getElementById(policy?'policyArchiveBodyV77':'enterpriseArchiveBodyV77');
    body.innerHTML='<div class="governance-task-v77"><div class="governance-task-head-v77"><div><h3>数据更新申请已提交</h3><p>任务编号：'+taskId+' · 提交人：海州市政策服务人员 · 2026-08-21 14:36</p></div><em>待审核</em></div><div class="governance-stepper-v77"><div><i>✓</i><b>业务数据已保存</b><span>本次结果即时有效</span></div><strong></strong><div class="active"><i>2</i><b>知识库审核</b><span>预计 1 个工作日</span></div><strong></strong><div class="wait"><i>3</i><b>正式入库</b><span>通过后生成版本</span></div></div></div><div class="governance-note-v77"><strong>后续：</strong>审核结果通过站内消息通知。通过后可选择重新匹配；原结果和历史数据快照均保留。</div><footer style="display:flex;justify-content:flex-end;padding:0 23px 18px"><button class="primary" type="button" onclick="closeGovernanceModalV77(\''+(policy?'policyArchiveModalV77':'enterpriseArchiveModalV77')+'\')">完成</button></footer>';
  }

  function ensureBanner(pageId,id,type,title,detail,buttonText,action){
    var page=document.getElementById(pageId),node=document.getElementById(id);if(!page)return;
    if(!node){node=document.createElement('section');node.id=id;var anchor=pageId==='support'?page.querySelector('.support-info-panels'):page.querySelector('.ep-overview-grid');if(anchor)anchor.insertAdjacentElement('beforebegin',node);else page.appendChild(node)}
    node.className='data-update-banner-v77 '+(type||'');
    node.innerHTML='<div><i>'+(type==='temporary'?'临':'审')+'</i><div><b>'+esc(title)+'</b><span>'+esc(detail)+'</span></div></div>'+(buttonText?'<button type="button">'+esc(buttonText)+'</button>':'');
    var button=node.querySelector('button');if(button)button.onclick=action;
  }

  window.closeGovernanceModalV77=function(id){closeModal(id)};
  window.openPolicyArchiveV77=function(){policyChoiceView();openModal('policyArchiveModalV77')};
  window.choosePolicyArchiveV77=function(mode){
    if(mode==='apply'){
      taskView('policy');
      ensureBanner('support','policyUpdateBannerV77','pending','政策文件更新申请 · 待审核','任务 POL-UPD-20260821-001 已保存原文、解析字段和匹配快照；通过后正式入库。','查看进度',function(){taskView('policy');openModal('policyArchiveModalV77')});
      notify('政策入库申请已提交，当前匹配结果不受影响');
    }else{
      closeModal('policyArchiveModalV77');
      ensureBanner('support','policyUpdateBannerV77','temporary','政策文件仅本次使用','本次匹配快照已保留，未写入正式政策库。','申请入库',window.openPolicyArchiveV77);
      notify('已设为仅本次使用，可随时申请加入政策库');
    }
  };
  window.openEnterpriseArchiveV77=function(){enterpriseChoiceView();openModal('enterpriseArchiveModalV77')};
  window.chooseEnterpriseArchiveV77=function(mode){
    if(mode==='apply'){
      taskView('enterprise');
      ensureBanner('enterprisePolicy','enterpriseUpdateBannerV77','pending','企业画像更新申请 · 待审核','11 个字段已提交字段级审核；本次政策匹配仍使用补充数据。','查看进度',function(){taskView('enterprise');openModal('enterpriseArchiveModalV77')});
      notify('企业画像更新申请已提交，等待知识库审核');
    }else{
      closeModal('enterpriseArchiveModalV77');
      ensureBanner('enterprisePolicy','enterpriseUpdateBannerV77','temporary','企业信息仅本次匹配使用','补充字段已写入本次匹配快照，未更新正式企业画像。','申请更新画像',window.openEnterpriseArchiveV77);
      notify('补充信息已保留在本次匹配快照中');
    }
  };

  function mountPolicyFlow(){
    var fileInput=document.getElementById('supportPolicyFileInput');
    if(fileInput)fileInput.addEventListener('change',function(){var f=this.files&&this.files[0];if(f)policyUpload={fileName:f.name,size:f.size,type:f.type}});
    var previous=window.runSupportMatch;
    if(typeof previous==='function')window.runSupportMatch=function(){var hasFile=fileInput&&fileInput.files&&fileInput.files.length;previous.apply(this,arguments);if(hasFile)setTimeout(function(){policyChoiceView();openModal('policyArchiveModalV77')},1050)};
  }

  function mountEnterpriseFlow(){
    var previous=window.saveEnterpriseProfile;
    if(typeof previous==='function')window.saveEnterpriseProfile=function(){previous.apply(this,arguments);setTimeout(function(){enterpriseChoiceView();openModal('enterpriseArchiveModalV77')},260)};
  }

  function renderHistory(){
    var company=((document.getElementById('dueSummaryCompany')||{}).textContent||'芯源微电子科技股份有限公司');
    document.getElementById('dueHistoryCompanyV77').textContent=company+' · 历史版本';
    document.getElementById('dueHistoryBodyV77').innerHTML='<div class="due-history-overview-v77"><div><span>报告版本</span><b>3 个</b></div><div><span>首次生成</span><b>2026-07-24</b></div><div><span>最近更新</span><b>企业画像更新</b></div></div><div class="due-version-list-v77">'+dueVersions.map(function(v){return '<article class="due-version-card-v77 '+(v.current?'current':'archived')+'"><i>'+v.version+'</i><div><b>'+v.date+'</b><span>生成时间 · 数据快照已固化</span></div><div><b>'+v.model+'</b><span>模型与提示词版本</span></div><div><em>'+v.status+'</em><span>'+v.trigger+'</span></div><div class="due-version-actions-v77"><button class="primary" type="button" onclick="selectDueVersionV77(\''+v.version+'\',\''+v.date+'\',\''+v.trigger+'\')">查看版本</button><button type="button" onclick="downloadDueVersionV77(\''+v.version+'\')">下载</button></div></article>'}).join('')+'</div><div class="due-version-lineage-v77"><b>版本规则：</b>重新生成报告时创建新版本，不覆盖旧报告；每个版本固化企业数据、风险证据、模型、提示词、操作人和生成时间。</div>';
  }
  window.openDueHistoryV77=function(){renderHistory();openModal('dueHistoryModalV77')};
  window.selectDueVersionV77=function(version,date,trigger){
    closeModal('dueHistoryModalV77');
    var banner=document.getElementById('dueVersionBannerV77'),title=document.getElementById('dueReportTitle');
    if(banner){banner.classList.toggle('show',version!=='V3.0');banner.querySelector('div').innerHTML='<b>正在查看历史版本 '+esc(version)+'</b> · '+esc(date)+' · 触发原因：'+esc(trigger)}
    if(title){title.dataset.baseTitle=title.dataset.baseTitle||title.textContent.replace(/ · V\d+\.\d+$/,'');title.textContent=title.dataset.baseTitle+' · '+version}
    notify(version==='V3.0'?'已返回最新报告':'已切换至历史报告 '+version);
  };
  window.backToLatestDueV77=function(){window.selectDueVersionV77('V3.0','2026-08-21 14:20','企业画像更新')};
  window.downloadDueVersionV77=function(version){if(typeof window.downloadTextFile==='function')window.downloadTextFile((((document.getElementById('dueSummaryCompany')||{}).textContent||'企业'))+'-尽调报告-'+version+'.txt','智研平台招商尽调报告\n企业：'+(((document.getElementById('dueSummaryCompany')||{}).textContent||''))+'\n版本：'+version+'\n说明：该文件为历史版本快照。');notify('历史版本 '+version+' 已下载')};

  function mountDueHistory(){
    var actions=document.querySelector('#dueReport .due-report-head>div:last-child');
    if(actions&&!document.getElementById('dueHistoryBtnV77')){var button=document.createElement('button');button.type='button';button.className='secondary due-history-button-v77';button.id='dueHistoryBtnV77';button.innerHTML='↺ 历史版本 <em>3</em>';button.onclick=window.openDueHistoryV77;actions.insertBefore(button,actions.querySelector('button[onclick*="downloadDueReport"]')||actions.firstChild)}
    var report=document.getElementById('dueReport');
    if(report&&!document.getElementById('dueVersionBannerV77')){var banner=document.createElement('section');banner.id='dueVersionBannerV77';banner.className='due-version-banner-v77';banner.innerHTML='<div></div><button type="button" onclick="backToLatestDueV77()">返回最新版本</button>';var summary=report.querySelector('.due-report-summary');if(summary)summary.insertAdjacentElement('beforebegin',banner)}
    var previous=window.openDueReport;
    if(typeof previous==='function')window.openDueReport=function(){var result=previous.apply(this,arguments);var banner=document.getElementById('dueVersionBannerV77');if(banner)banner.classList.remove('show');setTimeout(function(){var title=document.getElementById('dueReportTitle');if(title){title.dataset.baseTitle=title.textContent.replace(/ · V\d+\.\d+$/,'');title.textContent=title.dataset.baseTitle+' · V3.0'}},0);return result};
  }

  function extendLogicNotes(){
    if(typeof prototypeLogicAnnotations==='undefined')return;
    prototypeLogicAnnotations.support.interactions.push(['上传政策入库','上传政策完成匹配后选择“申请加入政策库”。','当前匹配即时生效，另生成待审核任务；审核通过后正式入库并可重新匹配。']);
    prototypeLogicAnnotations.enterprisePolicy.interactions.push(['企业画像更新','完善信息保存后选择“申请更新企业画像”。','补充字段用于本次匹配，正式画像按字段审核后更新并留存差异版本。']);
    prototypeLogicAnnotations.dueReport.interactions.push(['历史版本','点击报告头部“历史版本”。','查看触发原因、模型和数据快照，可切换或下载历史报告。']);
  }

  mountDialogs();mountPolicyFlow();mountEnterpriseFlow();mountDueHistory();extendLogicNotes();
})();

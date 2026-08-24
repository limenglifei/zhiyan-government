(function(){
  'use strict';
  var pendingUpload=null;
  var parsedPolicy=null;
  var auditContext=null;

  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]})}
  function toastV78(v){if(typeof window.toast==='function')window.toast(v)}
  function openModalV78(id){var m=document.getElementById(id);if(!m)return;m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
  function closeModalV78(id){var m=document.getElementById(id);if(!m)return;m.classList.remove('open');m.setAttribute('aria-hidden','true');document.body.style.overflow=''}
  function value(id){var el=document.getElementById(id);return el?el.value.trim():''}

  function mountPolicyParseModal(){
    if(document.getElementById('policyParseModalV78'))return;
    document.body.insertAdjacentHTML('beforeend',
      '<div class="prototype-modal-backdrop" id="policyParseModalV78" aria-hidden="true"><section class="prototype-modal policy-parse-modal-v78"><header><div><label>AI POLICY DOCUMENT PARSING</label><h2>上传政策附件解析确认</h2><p>请核对 AI 解析字段，确认后再选择本次使用方式。</p></div><button type="button" onclick="closePolicyParseV78()">×</button></header><div class="prototype-modal-body"><div class="policy-parse-status-v78"><div><i>AI</i><div><b id="policyParseFileNameV78">政策附件</b><span>已完成文件识别、正文解析、申报条件抽取与政策项目拆解</span></div></div><em>解析完整度 96%</em></div><div class="policy-parse-form-v78"><h3>政策文件结构化字段</h3><div class="policy-field-grid-v78">'+
      '<label class="policy-field-v78 wide"><span>政策标题 <em>AI 已识别</em></span><input id="ppTitleV78"></label>'+ 
      '<label class="policy-field-v78"><span>文件分类</span><select id="ppCategoryV78"><option>申报通知</option><option>立项公示</option><option>政策法规</option><option>政策资讯</option></select></label>'+ 
      '<label class="policy-field-v78"><span>发布时间</span><input id="ppDateV78" type="date"></label>'+ 
      '<label class="policy-field-v78"><span>发文机构</span><input id="ppOrgV78"></label>'+ 
      '<label class="policy-field-v78"><span>政策级别</span><select id="ppLevelV78"><option>国家级</option><option>省级</option><option selected>市级</option><option>区级</option></select></label>'+ 
      '<label class="policy-field-v78"><span>适用地区</span><input id="ppRegionV78"></label>'+ 
      '<label class="policy-field-v78"><span>适用行业</span><input id="ppIndustryV78"></label>'+ 
      '<label class="policy-field-v78 wide"><span>政策正文 <em>支持人工修订</em></span><textarea class="large" id="ppBodyV78"></textarea></label>'+ 
      '<label class="policy-field-v78 wide"><span>申报条件</span><textarea id="ppConditionsV78"></textarea></label>'+ 
      '<label class="policy-field-v78 wide"><span>补贴政策</span><textarea id="ppSubsidyV78"></textarea></label>'+ 
      '<label class="policy-field-v78"><span>申报时间</span><input id="ppApplyTimeV78"></label>'+ 
      '<label class="policy-field-v78"><span>附件及原文链接</span><input id="ppAttachmentV78"></label>'+ 
      '</div><section class="policy-projects-v78"><header><b>可拆解的政策项目</b><span>AI 已拆解 3 项，可在政策库审核时继续修订</span></header><table><thead><tr><th>项目名称</th><th>项目分类</th><th>最高补贴</th><th>申报截止</th></tr></thead><tbody id="policyProjectRowsV78"></tbody></table></section></div></div><footer><span>当前匹配结果已生成，是否申请入库不影响本次使用。</span><button class="only" type="button" onclick="confirmPolicyUseV78(false)">仅本次使用</button><button class="apply" type="button" onclick="confirmPolicyUseV78(true)">本次使用并申请加入政策库</button></footer></section></div>'+ 
      '<div class="prototype-modal-backdrop" id="policyAuditModalV78" aria-hidden="true"><section class="prototype-modal policy-audit-dialog-v78"><header><div><label>POLICY LIBRARY REVIEW</label><h2 id="policyAuditTitleV78">政策入库审核</h2><p>审核结论将写入政策数据治理记录。</p></div><button type="button" onclick="closePolicyAuditV78()">×</button></header><div class="policy-audit-content-v78"><div><b id="policyAuditPolicyV78"></b><span id="policyAuditMetaV78"></span></div><label>审核意见<textarea id="policyAuditRemarkV78" placeholder="请输入审核意见或需补充的内容"></textarea></label></div><footer><button class="secondary" type="button" onclick="closePolicyAuditV78()">取消</button><button class="primary" id="policyAuditConfirmV78" type="button" onclick="confirmPolicyAuditV78()">确认</button></footer></section></div>');
    ['policyParseModalV78','policyAuditModalV78'].forEach(function(id){var m=document.getElementById(id);m.addEventListener('click',function(e){if(e.target===m)closeModalV78(id)})});
  }

  function parsedDefaults(file){
    var clean=(file&&file.name?file.name:'海州市制造业数字化转型扶持计划申报通知').replace(/\.(pdf|docx?|txt|md)$/i,'');
    return {
      title:clean.indexOf('通知')>-1?clean:clean+'申报通知',category:'申报通知',date:'2026-08-24',org:'海州市工业和信息化局',level:'市级',region:'江苏省 / 海州市',industry:'制造业 / 数字化改造',
      body:'为加快制造业数字化、网络化、智能化转型，支持企业开展智能工厂、数字化车间、工业软件部署和设备联网改造，现组织开展本年度项目申报工作。',
      conditions:'在海州市依法注册并正常经营；项目已完成备案并实际投入；近三年无重大违法失信；申报材料真实、完整、可核验。',
      subsidy:'按符合条件的设备、软件及服务投入给予最高30%补助；单个企业最高支持200万元，可叠加园区配套奖励。',
      applyTime:'网报：2026-08-25 至 2026-09-30；纸报截止：2026-10-08',attachment:(file&&file.name?file.name:'政策附件.pdf')+'；原文链接：https://gxj.haizhou.gov.cn/policy/2026/0824',
      projects:[
        {name:'制造业数字化转型专项资金',category:'固定资产投入补贴',amount:'最高200万元',deadline:'2026-09-30'},
        {name:'智能工厂与数字化车间认定',category:'企业荣誉资质奖励',amount:'最高50万元',deadline:'2026-09-25'},
        {name:'工业软件应用示范项目',category:'企业管理提升奖励',amount:'最高80万元',deadline:'2026-09-20'}]
    };
  }

  function openPolicyParse(file){
    parsedPolicy=parsedDefaults(file);
    document.getElementById('policyParseFileNameV78').textContent=(file&&file.name)||'政策附件';
    var map={ppTitleV78:'title',ppCategoryV78:'category',ppDateV78:'date',ppOrgV78:'org',ppLevelV78:'level',ppRegionV78:'region',ppIndustryV78:'industry',ppBodyV78:'body',ppConditionsV78:'conditions',ppSubsidyV78:'subsidy',ppApplyTimeV78:'applyTime',ppAttachmentV78:'attachment'};
    Object.keys(map).forEach(function(id){var el=document.getElementById(id);if(el)el.value=parsedPolicy[map[id]]});
    document.getElementById('policyProjectRowsV78').innerHTML=parsedPolicy.projects.map(function(p){return '<tr><td><b>'+esc(p.name)+'</b></td><td>'+esc(p.category)+'</td><td>'+esc(p.amount)+'</td><td>'+esc(p.deadline)+'</td></tr>'}).join('');
    openModalV78('policyParseModalV78');
  }

  function collectParsed(){
    var p={title:value('ppTitleV78'),category:value('ppCategoryV78'),date:value('ppDateV78'),org:value('ppOrgV78'),level:value('ppLevelV78'),region:value('ppRegionV78'),industry:value('ppIndustryV78'),body:value('ppBodyV78'),conditions:value('ppConditionsV78'),subsidy:value('ppSubsidyV78'),applyTime:value('ppApplyTimeV78'),attachment:value('ppAttachmentV78'),projects:(parsedPolicy&&parsedPolicy.projects)||[]};
    if(!p.title||!p.org||!p.body){toastV78('请先补全政策标题、发文机构和政策正文');return null}return p;
  }

  function mountReviewBanner(kind,record){
    var page=document.getElementById('support'),node=document.getElementById('policyReviewBannerV78');if(!page)return;
    if(!node){node=document.createElement('section');node.id='policyReviewBannerV78';var anchor=page.querySelector('.support-info-panels');if(anchor)anchor.insertAdjacentElement('beforebegin',node)}
    node.className='data-update-banner-v77 policy-review-banner-v78 '+(kind==='temporary'?'temporary':'');
    node.innerHTML='<div><i>'+(kind==='temporary'?'临':'审')+'</i><div><b>'+(kind==='temporary'?'政策附件仅本次使用':'政策入库申请 · 待审核')+'</b><span>'+(kind==='temporary'?'已保留解析结果与本次匹配快照，未写入政策库。':'“'+esc(record.title)+'”已进入政策库待审核队列，创建人：'+esc(record.creator)+'。')+'</span></div></div>'+(kind==='temporary'?'':'<button type="button" onclick="openKnowledgeBase(\'policy\')">前往政策库审核</button>');
  }

  function addPendingPolicy(p){
    if(typeof knowledgeBaseConfigs==='undefined')return null;
    var id='POL-REVIEW-'+Date.now();
    var record={reviewId:id,title:p.title,sub:'上传附件解析 · 待知识库审核',category:p.category,level:p.level,org:p.org,date:p.date,industry:p.industry,region:p.region,createdAt:'2026-08-24 14:36',creator:'政策服务人员 · 李敏',reviewStatus:'pending',status:'待审核',body:p.body,conditions:p.conditions,subsidy:p.subsidy,applicationTime:p.applyTime,attachments:p.attachment,url:'https://gxj.haizhou.gov.cn/policy/2026/0824',projects:p.projects,sourceFile:pendingUpload&&pendingUpload.name};
    knowledgeBaseConfigs.policy.rows.unshift(record);knowledgeBaseConfigs.policy.count='12,681';return record;
  }

  window.closePolicyParseV78=function(){closeModalV78('policyParseModalV78')};
  window.confirmPolicyUseV78=function(apply){
    var p=collectParsed();if(!p)return;closeModalV78('policyParseModalV78');
    if(apply){var record=addPendingPolicy(p);mountReviewBanner('apply',record);toastV78('已用于本次匹配，并提交政策库审核')}else{mountReviewBanner('temporary');toastV78('政策附件仅用于本次匹配，未申请入库')}
    pendingUpload=null;
  };

  function policyStatus(row){return row.reviewStatus||'approved'}
  function statusText(s){return s==='pending'?'待审核':s==='rejected'?'已驳回':'已通过'}
  function augmentPolicyTable(){
    if(typeof activeKnowledgeType==='undefined'||activeKnowledgeType!=='policy')return;
    var head=document.querySelector('#kbTableHead tr'),body=document.getElementById('kbTableBody');if(!head||!body)return;
    var last=head.lastElementChild;if(last){var creator=document.createElement('th');creator.textContent='创建人';head.insertBefore(creator,last);var status=document.createElement('th');status.textContent='审核状态';head.insertBefore(status,last)}
    Array.from(body.children).forEach(function(tr){var titleNode=tr.querySelector('.kb-title-cell b');if(!titleNode)return;var row=knowledgeBaseConfigs.policy.rows.find(function(r){return r.title===titleNode.textContent});if(!row)return;var action=tr.lastElementChild,s=policyStatus(row);var creatorTd=document.createElement('td');creatorTd.className='policy-creator-v78';creatorTd.innerHTML='<b>'+esc(row.creator||'系统采集')+'</b><span>'+esc(row.createdAt||'已完成入库')+'</span>';tr.insertBefore(creatorTd,action);var statusTd=document.createElement('td');statusTd.innerHTML='<em class="policy-review-badge-v78 '+s+'">'+statusText(s)+'</em>';tr.insertBefore(statusTd,action);if(row.reviewId){tr.classList.add('policy-review-row-v78',s);action.innerHTML='<div class="policy-review-actions-v78"><button onclick="event.stopPropagation();openKnowledgeDetail('+knowledgeBaseConfigs.policy.rows.indexOf(row)+')">查看</button>'+(s==='pending'?'<button class="approve" onclick="event.stopPropagation();openPolicyAuditV78(\''+row.reviewId+'\',\'approve\')">通过</button><button class="reject" onclick="event.stopPropagation();openPolicyAuditV78(\''+row.reviewId+'\',\'reject\')">驳回</button>':'')+'</div>'}}
    );
  }

  function mountKnowledgeReview(){
    if(typeof window.renderKnowledgeList==='function'){var oldRender=window.renderKnowledgeList;window.renderKnowledgeList=function(){var r=oldRender.apply(this,arguments);augmentPolicyTable();return r}}
    if(typeof window.openKnowledgeDetail==='function'){var oldDetail=window.openKnowledgeDetail;window.openKnowledgeDetail=function(index){if(typeof activeKnowledgeType!=='undefined'&&activeKnowledgeType==='policy'){var row=knowledgeBaseConfigs.policy.rows[index];if(row&&row.reviewId){renderUploadedPolicyDetail(row);return}}return oldDetail.apply(this,arguments)}}
  }

  function renderUploadedPolicyDetail(row){
    document.getElementById('kbDetailType').textContent='政策库 · '+statusText(policyStatus(row));document.getElementById('kbDetailTitle').textContent=row.title;document.getElementById('kbDetailMeta').textContent=row.org+' · '+row.date+' · 创建人 '+row.creator;
    var projectText=row.projects.map(function(p){return p.name+'（'+p.amount+'，截止 '+p.deadline+'）'}).join('；');
    var fields=[['政策标题',row.title,true],['文件分类',row.category],['发布时间',row.date],['发文机构',row.org],['政策级别',row.level],['适用地区',row.region],['适用行业',row.industry],['政策正文',row.body,true],['申报条件',row.conditions,true],['补贴政策',row.subsidy,true],['申报时间',row.applicationTime,true],['附件及原文链接',row.attachments,true],['可拆解的政策项目',projectText,true]];
    document.getElementById('kbDetailBody').innerHTML='<div class="policy-review-detail-v78"><b>数据治理记录：</b>创建人 '+esc(row.creator)+'，创建时间 '+esc(row.createdAt)+'，当前状态“'+statusText(policyStatus(row))+'”。'+(row.auditRemark?' 审核意见：'+esc(row.auditRemark):'')+'</div><section class="kb-detail-section"><h3>上传政策解析结果</h3><dl class="kb-field-grid">'+fields.map(function(f){return '<div class="kb-field'+(f[2]?' wide':'')+'"><dt>'+f[0]+'</dt><dd>'+f[1]+'</dd></div>'}).join('')+'</dl></section>';
    var modal=document.getElementById('kbDetailModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
  }

  function findRecord(id){return knowledgeBaseConfigs.policy.rows.find(function(r){return r.reviewId===id})}
  window.openPolicyAuditV78=function(id,action){var row=findRecord(id);if(!row)return;auditContext={id:id,action:action};document.getElementById('policyAuditTitleV78').textContent=action==='approve'?'通过政策入库':'驳回政策入库';document.getElementById('policyAuditPolicyV78').textContent=row.title;document.getElementById('policyAuditMetaV78').textContent='创建人：'+row.creator+' · 创建时间：'+row.createdAt;document.getElementById('policyAuditRemarkV78').value=action==='approve'?'字段核验通过，同意正式入库。':'请补充政策原文链接及正式发文编号。';var btn=document.getElementById('policyAuditConfirmV78');btn.textContent=action==='approve'?'确认通过':'确认驳回';btn.className=action==='approve'?'primary':'secondary';openModalV78('policyAuditModalV78')};
  window.closePolicyAuditV78=function(){closeModalV78('policyAuditModalV78');auditContext=null};
  window.confirmPolicyAuditV78=function(){if(!auditContext)return;var row=findRecord(auditContext.id);if(!row)return;row.reviewStatus=auditContext.action==='approve'?'approved':'rejected';row.status=row.reviewStatus==='approved'?'有效':'已驳回';row.auditRemark=value('policyAuditRemarkV78');row.auditor='知识库运营审核员 · 王宁';row.auditTime='2026-08-24 14:48';closeModalV78('policyAuditModalV78');if(typeof window.renderKnowledgeList==='function')window.renderKnowledgeList();toastV78(row.reviewStatus==='approved'?'政策已通过审核并正式入库':'政策入库申请已驳回')};

  function mountUploadMatchFlow(){
    var input=document.getElementById('supportPolicyFileInput');if(!input)return;
    input.addEventListener('change',function(){var f=this.files&&this.files[0];if(f)pendingUpload={name:f.name,size:f.size,type:f.type,active:true}});
    var previous=window.runSupportMatch;if(typeof previous!=='function')return;
    window.runSupportMatch=function(){var uploaded=pendingUpload&&pendingUpload.active;if(uploaded)input.value='';var result=previous.apply(this,arguments);if(uploaded){pendingUpload.active=false;var file={name:pendingUpload.name,size:pendingUpload.size,type:pendingUpload.type};setTimeout(function(){openPolicyParse(file)},1080)}return result};
  }

  function extendNotes(){if(typeof prototypeLogicAnnotations==='undefined')return;prototypeLogicAnnotations.support.interactions.push(['上传政策解析确认','上传附件并点击匹配。','AI 先解析标题、分类、机构、地区、正文、申报条件、补贴、时间、附件和项目；核对后选择仅本次使用或申请入库。']);prototypeLogicAnnotations.knowledgeList.interactions.push(['政策入库审核','政策库查看待审核记录。','展示创建人和创建时间；审核员可查看解析字段、通过或驳回，结论全程留痕。'])}

  mountPolicyParseModal();mountKnowledgeReview();mountUploadMatchFlow();extendNotes();
})();

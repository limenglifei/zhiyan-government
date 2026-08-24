(function(){
  'use strict';
  var latestFile=null;
  var currentParse=null;

  function esc(v){return String(v==null?'':v).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]})}
  function notify(v){if(typeof window.toast==='function')window.toast(v)}
  function openModal(id){var m=document.getElementById(id);if(!m)return;m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
  function closeModal(id){var m=document.getElementById(id);if(!m)return;m.classList.remove('open');m.setAttribute('aria-hidden','true');document.body.style.overflow=''}
  function field(id){var el=document.getElementById(id);return el?el.value.trim():''}

  function mountModal(){
    if(document.getElementById('policyParseModalV79'))return;
    document.body.insertAdjacentHTML('beforeend','<div class="prototype-modal-backdrop" id="policyParseModalV79" aria-hidden="true"><section class="prototype-modal policy-parse-modal-v79"><header><div><label>AI POLICY PARSING & PROJECT SELECTION</label><h2>政策内容解析与匹配项目确认</h2><p>先核对政策文件信息，再勾选本次参与企业匹配的政策项目。</p></div><button type="button" onclick="closePolicyParseV79()">×</button></header><div class="prototype-modal-body"><div class="policy-source-summary-v79"><div><i>AI</i><div><b id="policySourceNameV79">政策内容</b><span id="policySourceMetaV79">已完成正文解析与项目拆解</span></div></div><em id="policyParseConfidenceV79">解析完整度 96%</em></div><div class="policy-v79-body"><h3>政策文件信息</h3><div class="policy-v79-fields"><label class="policy-v79-field span2"><span>政策标题</span><input id="pv79Title"></label><label class="policy-v79-field"><span>文件分类</span><select id="pv79Category"><option>申报通知</option><option>立项公示</option><option>政策法规</option><option>政策资讯</option></select></label><label class="policy-v79-field"><span>发布时间</span><input id="pv79Date" type="date"></label><label class="policy-v79-field"><span>发文机构</span><input id="pv79Org"></label><label class="policy-v79-field"><span>政策级别</span><select id="pv79Level"><option>国家级</option><option>省级</option><option selected>市级</option><option>区级</option></select></label><label class="policy-v79-field"><span>适用地区</span><input id="pv79Region"></label><label class="policy-v79-field"><span>适用行业</span><input id="pv79Industry"></label><label class="policy-v79-field wide"><span>政策正文</span><textarea id="pv79Body"></textarea></label><label class="policy-v79-field wide"><span>附件及原文链接</span><input id="pv79Attachment"></label></div><div class="project-select-head-v79"><div><h3>选择本次参与匹配的政策项目 <em class="project-selection-count-v79" id="projectSelectionCountV79">已选 3 项</em></h3><p>申报条件、补贴政策和申报时间均归属具体项目，匹配结果按所选项目分别诊断。</p></div><label><input id="selectAllProjectsV79" type="checkbox" checked onchange="toggleAllPolicyProjectsV79(this.checked)"> 全选</label></div><div class="policy-project-list-v79" id="policyProjectListV79"></div></div></div><footer><span>至少选择 1 个项目；未勾选项目不会参与本次企业匹配。</span><button class="only" type="button" onclick="confirmParsedPolicyV79(false)">仅本次使用</button><button class="apply" type="button" onclick="confirmParsedPolicyV79(true)">本次使用并申请加入政策库</button></footer></section></div>');
    var modal=document.getElementById('policyParseModalV79');modal.addEventListener('click',function(e){if(e.target===modal)closeModal('policyParseModalV79')});
  }

  function extractTitle(text){var first=String(text||'').split(/\r?\n/).map(function(x){return x.trim()}).find(Boolean)||'';if(first.length>90)first=first.slice(0,90);return first||'海州市制造业数字化转型扶持政策申报通知'}
  function buildProjects(text){
    var digital=/数字化|智能工厂|工业软件|设备联网/.test(text),special=/专精特新|中小企业/.test(text);
    if(special)return [
      {name:'省级专精特新中小企业认定',category:'企业荣誉资质奖励',condition:'连续经营2年以上；研发费用不低于100万元；研发投入占营业收入比例不低于3%；拥有核心知识产权。',subsidy:'认定通过后奖励20万元，并优先推荐国家级专精特新“小巨人”。',applyTime:'2026-09-01 至 2026-10-31',amount:'20万元',deadline:'2026-10-31',selected:true},
      {name:'专精特新企业技术改造奖补',category:'固定资产投入补贴',condition:'已取得专精特新资质；技术改造项目完成备案；设备投入不低于300万元。',subsidy:'按设备投入的20%给予补助，单个企业最高200万元。',applyTime:'2026-09-10 至 2026-11-15',amount:'最高200万元',deadline:'2026-11-15',selected:true},
      {name:'中小企业管理提升服务券',category:'企业管理提升奖励',condition:'符合中小企业划型标准；近三年无重大违法失信；采购经认定的专业服务。',subsidy:'按服务合同金额50%发放服务券，最高30万元。',applyTime:'全年分批受理',amount:'最高30万元',deadline:'长期有效',selected:false}
    ];
    if(digital)return [
      {name:'制造业数字化转型专项资金',category:'固定资产投入补贴',condition:'企业在海州市依法注册；项目已备案并完成设备、软件投入；近三年无重大失信。',subsidy:'按符合条件投入的30%给予补助，单个企业最高200万元。',applyTime:'2026-08-25 至 2026-09-30',amount:'最高200万元',deadline:'2026-09-30',selected:true},
      {name:'智能工厂与数字化车间认定',category:'企业荣誉资质奖励',condition:'生产设备联网率不低于80%；关键工序数控化率不低于70%；具备数据安全管理制度。',subsidy:'认定智能工厂奖励50万元，数字化车间奖励30万元。',applyTime:'2026-08-25 至 2026-09-25',amount:'最高50万元',deadline:'2026-09-25',selected:true},
      {name:'工业软件应用示范项目',category:'企业管理提升奖励',condition:'工业软件实际应用满6个月；覆盖研发、生产或供应链核心环节；形成可复制案例。',subsidy:'按工业软件采购及实施费用的40%补助，最高80万元。',applyTime:'2026-08-25 至 2026-09-20',amount:'最高80万元',deadline:'2026-09-20',selected:true}
    ];
    return [
      {name:'重点产业技术改造项目',category:'固定资产投入补贴',condition:'项目符合本地产业方向并完成备案；固定资产投入不低于500万元。',subsidy:'按核定投资额20%给予补助，最高300万元。',applyTime:'2026-09-01 至 2026-10-15',amount:'最高300万元',deadline:'2026-10-15',selected:true},
      {name:'企业技术创新能力提升项目',category:'企业管理提升奖励',condition:'拥有独立研发团队和核心知识产权；上年度研发投入占比不低于3%。',subsidy:'按研发投入给予最高100万元奖励。',applyTime:'2026-09-01 至 2026-10-10',amount:'最高100万元',deadline:'2026-10-10',selected:true},
      {name:'高层次人才引进支持项目',category:'人才补贴',condition:'引进人才担任核心技术或经营岗位，并与企业签订三年以上劳动合同。',subsidy:'提供人才补贴、安家补助及人才公寓，最高80万元。',applyTime:'全年受理',amount:'最高80万元',deadline:'长期有效',selected:false}
    ];
  }

  function parseSource(source){
    var text=source.text||'',title=source.kind==='file'?(source.name||'').replace(/\.(pdf|docx?|txt|md)$/i,''):extractTitle(text);
    return {source:source,title:title||'海州市制造业数字化转型扶持政策申报通知',category:'申报通知',date:'2026-08-24',org:/省级|省工业/.test(text)?'省工业和信息化厅':'海州市工业和信息化局',level:/国家级|国务院|工业和信息化部/.test(text)?'国家级':/省级|省工业/.test(text)?'省级':'市级',region:/全国/.test(text)?'全国':'江苏省 / 海州市',industry:/生物医药/.test(text)?'生物医药':/软件|数字化|智能/.test(text)?'制造业 / 数字化改造':'制造业 / 战略性新兴产业',body:text||'为推动重点产业高质量发展，支持企业开展技术改造、数字化转型和创新能力建设，现组织开展本年度项目申报工作。申报单位应按要求提交真实、完整、可核验的申请材料。',attachment:source.kind==='file'?(source.name+'；原文链接待审核补充'):'用户粘贴政策全文；原文链接待补充',projects:buildProjects(text||title)};
  }

  function renderProjects(){
    var list=document.getElementById('policyProjectListV79');
    list.innerHTML=currentParse.projects.map(function(p,i){return '<article class="policy-project-card-v79 '+(p.selected?'selected':'')+'" data-index="'+i+'"><header><input class="policy-project-check-v79" type="checkbox" '+(p.selected?'checked':'')+' onchange="setPolicyProjectSelectedV79('+i+',this.checked)"><div><b>'+esc(p.name)+'</b><span>'+esc(p.category)+' · '+esc(p.amount)+'</span></div><em>项目 '+String(i+1).padStart(2,'0')+'</em></header><div class="project-detail-grid-v79"><div class="project-detail-field-v79"><label>申报条件</label><textarea data-project-field="condition" data-project-index="'+i+'">'+esc(p.condition)+'</textarea></div><div class="project-detail-field-v79"><label>补贴政策</label><textarea data-project-field="subsidy" data-project-index="'+i+'">'+esc(p.subsidy)+'</textarea></div><div class="project-detail-field-v79"><label>申报时间</label><input data-project-field="applyTime" data-project-index="'+i+'" value="'+esc(p.applyTime)+'"></div></div></article>'}).join('');updateCount();
  }
  function updateCount(){var count=currentParse.projects.filter(function(p){return p.selected}).length;document.getElementById('projectSelectionCountV79').textContent='已选 '+count+' 项';document.getElementById('selectAllProjectsV79').checked=count===currentParse.projects.length;document.getElementById('selectAllProjectsV79').indeterminate=count>0&&count<currentParse.projects.length}
  window.setPolicyProjectSelectedV79=function(index,checked){currentParse.projects[index].selected=checked;var card=document.querySelector('.policy-project-card-v79[data-index="'+index+'"]');if(card)card.classList.toggle('selected',checked);updateCount()};
  window.toggleAllPolicyProjectsV79=function(checked){currentParse.projects.forEach(function(p){p.selected=checked});renderProjects()};

  function openParse(source){
    currentParse=parseSource(source);document.getElementById('policySourceNameV79').textContent=source.kind==='file'?source.name:'已输入政策全文';document.getElementById('policySourceMetaV79').textContent=source.kind==='file'?'附件已解析 · '+Math.max(1,Math.round((source.size||1024)/1024))+' KB':'政策全文已解析 · '+String(source.text||'').length.toLocaleString()+' 字';
    var map={pv79Title:'title',pv79Category:'category',pv79Date:'date',pv79Org:'org',pv79Level:'level',pv79Region:'region',pv79Industry:'industry',pv79Body:'body',pv79Attachment:'attachment'};Object.keys(map).forEach(function(id){document.getElementById(id).value=currentParse[map[id]]});renderProjects();openModal('policyParseModalV79');
  }
  window.closePolicyParseV79=function(){closeModal('policyParseModalV79')};

  function collectParse(){
    currentParse.title=field('pv79Title');currentParse.category=field('pv79Category');currentParse.date=field('pv79Date');currentParse.org=field('pv79Org');currentParse.level=field('pv79Level');currentParse.region=field('pv79Region');currentParse.industry=field('pv79Industry');currentParse.body=field('pv79Body');currentParse.attachment=field('pv79Attachment');
    document.querySelectorAll('[data-project-field]').forEach(function(el){var p=currentParse.projects[Number(el.dataset.projectIndex)];if(p)p[el.dataset.projectField]=el.value.trim()});
    var selected=currentParse.projects.filter(function(p){return p.selected});if(!selected.length){notify('请至少勾选 1 个本次参与匹配的政策项目');return null}if(!currentParse.title||!currentParse.body){notify('请补全政策标题和政策正文');return null}return selected;
  }

  function showSelectedProjects(selected){
    var area=document.getElementById('supportResultArea'),node=document.getElementById('selectedPolicyProjectsV79');if(!area)return;if(!node){node=document.createElement('section');node.id='selectedPolicyProjectsV79';area.insertAdjacentElement('beforebegin',node)}node.className='selected-projects-banner-v79';node.innerHTML='<div><h3>本次参与匹配：'+selected.length+' 个政策项目</h3><p>系统按各项目申报条件分别诊断企业，汇总名单按最高项目匹配度倒序并对企业去重。</p></div><div>'+selected.map(function(p){return '<em>'+esc(p.name)+'</em>'}).join('')+'</div>';var title=document.getElementById('supportResultTitle');if(title)title.textContent='已选 '+selected.length+' 个政策项目 · 企业匹配结果';
  }
  function showGovernanceBanner(record){var page=document.getElementById('support'),node=document.getElementById('policyReviewBannerV79');if(!page)return;if(!node){node=document.createElement('section');node.id='policyReviewBannerV79';var result=document.getElementById('selectedPolicyProjectsV79')||document.getElementById('supportResultArea');result.insertAdjacentElement('beforebegin',node)}node.className='data-update-banner-v77 policy-review-banner-v78';node.innerHTML='<div><i>审</i><div><b>政策文件及项目明细 · 待审核</b><span>已提交“'+esc(record.title)+'”，创建人：'+esc(record.creator)+'；本次匹配使用 '+record.projects.filter(function(p){return p.selected}).length+' 个项目。</span></div></div><button type="button" onclick="openKnowledgeBase(\'policy\')">前往政策库审核</button>'}
  function addReviewRecord(){
    var selected=currentParse.projects.filter(function(p){return p.selected});var row={reviewId:'POL-REVIEW-'+Date.now(),schemaV79:true,title:currentParse.title,sub:'政策解析 · '+selected.length+'个项目参与匹配 · 待审核',category:currentParse.category,level:currentParse.level,org:currentParse.org,date:currentParse.date,industry:currentParse.industry,region:currentParse.region,createdAt:'2026-08-24 16:20',creator:'政策服务人员 · 李敏',reviewStatus:'pending',status:'待审核',body:currentParse.body,attachments:currentParse.attachment,url:'原文链接待补充',projects:currentParse.projects.map(function(p){return Object.assign({},p)}),conditions:selected.map(function(p){return p.name+'：'+p.condition}).join('；'),subsidy:selected.map(function(p){return p.name+'：'+p.subsidy}).join('；'),applicationTime:selected.map(function(p){return p.name+'：'+p.applyTime}).join('；')};knowledgeBaseConfigs.policy.rows.unshift(row);var n=Number(String(knowledgeBaseConfigs.policy.count).replace(/,/g,''))||12680;knowledgeBaseConfigs.policy.count=(n+1).toLocaleString('zh-CN');return row;
  }
  window.confirmParsedPolicyV79=function(apply){var selected=collectParse();if(!selected)return;closeModal('policyParseModalV79');showSelectedProjects(selected);if(apply){var record=addReviewRecord();showGovernanceBanner(record);notify('已按所选项目完成匹配，并提交政策库审核')}else notify('已按所选项目完成本次匹配，政策内容未申请入库');setTimeout(function(){var area=document.getElementById('supportResultArea');if(area)area.scrollIntoView({behavior:'smooth',block:'start'})},120)};

  function renderV79Detail(row){
    document.getElementById('kbDetailType').textContent='政策库 · '+(row.reviewStatus==='pending'?'待审核':row.reviewStatus==='rejected'?'已驳回':'已通过');document.getElementById('kbDetailTitle').textContent=row.title;document.getElementById('kbDetailMeta').textContent=row.org+' · '+row.date+' · 创建人 '+row.creator;
    var base=[['政策标题',row.title,true],['文件分类',row.category],['发布时间',row.date],['发文机构',row.org],['政策级别',row.level],['适用地区',row.region],['适用行业',row.industry],['政策正文',row.body,true],['附件及原文链接',row.attachments,true]];
    var projects=row.projects.map(function(p){return '<article class="'+(p.selected?'selected':'')+'"><header><h4>'+esc(p.name)+'</h4><span>'+(p.selected?'✓ 本次参与匹配':'本次未参与匹配')+'</span></header><dl><div><dt>项目分类</dt><dd>'+esc(p.category)+'</dd></div><div><dt>最高补贴</dt><dd>'+esc(p.amount)+'</dd></div><div class="wide"><dt>申报条件</dt><dd>'+esc(p.condition)+'</dd></div><div class="wide"><dt>补贴政策</dt><dd>'+esc(p.subsidy)+'</dd></div><div><dt>申报时间</dt><dd>'+esc(p.applyTime)+'</dd></div><div><dt>申报截止</dt><dd>'+esc(p.deadline)+'</dd></div></dl></article>'}).join('');
    document.getElementById('kbDetailBody').innerHTML='<div class="policy-review-detail-v78"><b>数据治理记录：</b>创建人 '+esc(row.creator)+'，创建时间 '+esc(row.createdAt)+'，当前状态“'+(row.reviewStatus==='pending'?'待审核':row.reviewStatus==='rejected'?'已驳回':'已通过')+'”。</div><section class="kb-detail-section"><h3>政策文件信息</h3><dl class="kb-field-grid">'+base.map(function(f){return '<div class="kb-field'+(f[2]?' wide':'')+'"><dt>'+f[0]+'</dt><dd>'+f[1]+'</dd></div>'}).join('')+'</dl></section><section class="kb-detail-section"><h3>拆解政策项目与匹配范围</h3><div class="uploaded-project-detail-v79">'+projects+'</div></section>';var modal=document.getElementById('kbDetailModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
  }
  function mountKnowledgeDetail(){var previous=window.openKnowledgeDetail;if(typeof previous!=='function')return;window.openKnowledgeDetail=function(index){if(typeof activeKnowledgeType!=='undefined'&&activeKnowledgeType==='policy'){var row=knowledgeBaseConfigs.policy.rows[index];if(row&&row.schemaV79){renderV79Detail(row);return}}return previous.apply(this,arguments)}}

  function mountMatch(){
    var fileInput=document.getElementById('supportPolicyFileInput'),composer=document.getElementById('supportPolicyComposerV45');if(fileInput)fileInput.addEventListener('change',function(){var f=this.files&&this.files[0];if(f)latestFile={name:f.name,size:f.size,type:f.type,active:true}});
    var previous=window.runSupportMatch;if(typeof previous!=='function')return;
    window.runSupportMatch=function(){var text=composer?composer.value.trim():'',hasFile=latestFile&&latestFile.active,isFullText=!hasFile&&(text.length>55||/[\r\n]/.test(text));if(hasFile&&composer&&!text){composer.value=latestFile.name;text=latestFile.name}var source=hasFile?{kind:'file',name:latestFile.name,size:latestFile.size,type:latestFile.type,text:text}:isFullText?{kind:'text',text:text}:null;var result=previous.apply(this,arguments);if(source){if(hasFile)latestFile.active=false;setTimeout(function(){closeModal('policyParseModalV78');openParse(source)},1200)}return result};
  }
  function extendNotes(){if(typeof prototypeLogicAnnotations==='undefined')return;prototypeLogicAnnotations.support.interactions.push(['全文解析与项目选择','粘贴政策全文或上传附件后点击匹配。','AI 解析政策文件并拆解多个项目；用户至少勾选一个项目，申报条件、补贴政策和申报时间按项目独立展示并参与匹配。'])}

  mountModal();mountKnowledgeDetail();mountMatch();extendNotes();
})();

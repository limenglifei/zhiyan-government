/* chain-relation-statistics-service-examples-and-recommend-fields-v65 */
(function(){
  function escV65(value){return String(value==null?'':value).replace(/[&<>"']/g,function(char){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]})}

  /* 招商雷达：配套服务按上中下游分别给出真实专项服务集合 */
  function nodeHtmlV65(node){return'<button class="chain-node '+escV65(node[2]||'')+'" data-chain="'+escV65(node[0])+'"><b>'+escV65(node[0])+'</b><span>'+escV65(node[1])+'</span>'+(node[3]?'<em class="'+(String(node[2]||'').indexOf('weak')>-1?'':'normal')+'">'+escV65(node[3])+'</em>':'')+'</button>'}
  function serviceExamplesV65(data){
    var name=String(data.name||'');
    if(name.indexOf('新能源')>-1)return[
      [['材料检测与失效分析','12 家 · 3 个专业实验室','','服务']],
      [['产线数字化集成','18 家 · 9 条示范产线','','服务']],
      [['汽车物流与出口认证','21 家 · 覆盖 12 个市场','','服务']]
    ];
    if(name.indexOf('装备')>-1)return[
      [['工业设计与材料检测','14 家 · 2 个公共平台','','服务']],
      [['精密计量与设备运维','26 家 · 响应时效 4 小时','','服务']],
      [['融资租赁与售后服务','19 家 · 服务企业 86 家','','服务']]
    ];
    if(name.indexOf('信息')>-1)return[
      [['EDA/IP 与测试验证','9 家 · 公共平台 2 个','weak','待加强']],
      [['算力云与数据安全','31 家 · 算力 280P','','服务']],
      [['系统集成与场景运营','42 家 · 标杆场景 16 个','','服务']]
    ];
    if(name.indexOf('生物')>-1)return[
      [['CRO 研发外包服务','16 家 · 临床资源 8 个','','服务']],
      [['CDMO 与质量检验','13 家 · GMP 产线 6 条','','服务']],
      [['医药冷链与市场准入','22 家 · 覆盖 11 个城市','','服务']]
    ];
    return[
      [['研发设计与检验检测','15 家 · 公共平台 3 个','','服务']],
      [['数字化改造与设备运维','20 家 · 服务企业 68 家','','服务']],
      [['物流供应链与市场服务','24 家 · 覆盖重点市场','','服务']]
    ];
  }
  window.renderIndustryGraph=function(key){
    var data=chainIndustryData[key];if(!data)return;activeChainKey=key;
    document.getElementById('chainIndustryTitle').textContent=data.name;
    document.getElementById('chainIndustryPath').textContent=data.path;
    document.getElementById('chainCompanyCount').textContent=data.companies+' 家';
    document.getElementById('chainCompleteness').textContent=data.complete+'%';
    document.getElementById('chainLocalRate').textContent=data.local+'%';
    document.getElementById('chainWeakCount').textContent=data.weak+' 个';
    var main=data.columns.filter(function(column){return column.label.indexOf('配套服务')<0}).slice(0,3);
    var mainHtml=main.map(function(column,index){return(index?'<div class="chain-arrow">›</div>':'')+'<div class="chain-column"><label>'+escV65(column.label)+'</label>'+column.nodes.map(nodeHtmlV65).join('')+'</div>'}).join('');
    var labels=['上游专项服务','中游专项服务','下游专项服务'];
    var guides=['支撑原料研发、质量验证与供应保障','支撑制造生产、检测计量与数字化协同','支撑市场准入、物流交付与运营服务'];
    var groups=serviceExamplesV65(data);
    var serviceHtml='<section class="chain-service-band-v64 chain-service-band-v65"><header><div><b>配套服务节点</b><span>配套服务不是统一的共性环节，而是分别服务于上游、中游、下游的专项支撑集合</span></div></header><div class="chain-service-grid-v64">'+groups.map(function(nodes,index){return'<div class="service-stage-v64"><label>'+labels[index]+'</label><span class="service-guide-v64">'+guides[index]+'</span>'+nodes.map(nodeHtmlV65).join('')+'</div>'}).join('')+'</div></section>';
    var flow=document.getElementById('chainFlow');flow.innerHTML='<div class="chain-main-v63">'+mainHtml+'</div>'+serviceHtml;
    flow.querySelectorAll('.chain-node').forEach(function(button){button.onclick=function(){flow.querySelectorAll('.chain-node').forEach(function(item){item.classList.remove('selected')});button.classList.add('selected');openNodeCompanyList(button.dataset.chain)}});
    var selected=flow.querySelector('.chain-node');if(selected)selected.classList.add('selected');
  };
  if(typeof activeChainKey!=='undefined')renderIndustryGraph(activeChainKey);

  /* 节点推荐结果：企业名称与资质分离，电话和邮箱拆列 */
  function splitRecommendFieldsV65(){
    var title=document.getElementById('nodeCompanyTitle'),head=document.getElementById('nodeCompanyTableHead'),body=document.getElementById('nodeCompanyRows');
    if(!title||!head||!body||title.textContent.indexOf('补强推荐企业')<0||head.dataset.v65==='1')return;
    var oldRows=Array.from(body.querySelectorAll('tr'));
    if(!oldRows.length)return;
    head.dataset.v65='1';
    head.innerHTML='<tr><th class="recommend-select-v64"><input class="recommend-select-all-v64" type="checkbox" onchange="toggleAllRecommendV64(this.checked)"></th><th>推荐企业</th><th>所在地区</th><th>企业荣誉资质</th><th>主要补强能力</th><th>匹配度</th><th>联系电话</th><th>企业邮箱</th></tr>';
    body.innerHTML=oldRows.map(function(row){
      var cells=Array.from(row.children),offset=cells[0]&&cells[0].querySelector('.recommend-check-v64')?1:0;
      var name=cells[offset]?.querySelector('b')?.textContent.trim()||'推荐企业';
      var encoded=encodeURIComponent(name),location=cells[offset+1]?.innerHTML||'—';
      var honor=cells[offset+2]?.innerHTML||'<div class="honor-tags-v64"><span>待核验</span></div>';
      var ability=cells[offset+3]?.innerHTML||'—',score=cells[offset+4]?.innerHTML||'—',contact=cells[offset+5];
      var phone=contact?.querySelector('span')?.textContent.trim()||'待核验';
      var email=contact?.querySelector('small')?.textContent.trim()||'待核验';
      return'<tr><td class="recommend-select-v64"><input class="recommend-check-v64" type="checkbox" data-name="'+encoded+'" onchange="toggleRecommendV64(decodeURIComponent(this.dataset.name),this.checked)"></td><td class="recommend-company-v65"><b>'+escV65(name)+'</b></td><td>'+location+'</td><td>'+honor+'</td><td>'+ability+'</td><td>'+score+'</td><td class="recommend-phone-v65">'+escV65(phone)+'</td><td class="recommend-email-v65">'+escV65(email)+'</td></tr>';
    }).join('');
  }
  var recommendRowsV65=document.getElementById('nodeCompanyRows');
  if(recommendRowsV65)new MutationObserver(function(){setTimeout(splitRecommendFieldsV65,30)}).observe(recommendRowsV65,{childList:true});

  /* 招商补强偏好：增加成立年限与企业类型 */
  function patchNodeFilterV65(){
    var grid=document.querySelector('#nodeFilterModalV61 .node-filter-grid-v61');if(!grid||document.getElementById('nodeFilterYearsV65'))return;
    grid.insertAdjacentHTML('beforeend','<label><span>企业成立年限</span><select id="nodeFilterYearsV65"><option>不限</option><option>1 年以内</option><option>1—3 年</option><option>3—5 年</option><option>5—10 年</option><option>10 年以上</option></select></label><label><span>企业类型</span><select id="nodeFilterCompanyTypeV65"><option>不限</option><option>有限责任公司</option><option>股份有限公司</option><option>个人独资企业</option><option>普通合伙</option><option>有限合伙</option><option>全民所有制</option><option>集体所有制</option></select></label>');
  }
  var previousNodeFilterOpenV65=window.openNodeFilterV61;
  if(previousNodeFilterOpenV65)window.openNodeFilterV61=function(){var result=previousNodeFilterOpenV65.apply(this,arguments);patchNodeFilterV65();return result};

  /* 产业链挂靠企业：统计概览、联动筛选和独立添加弹窗 */
  var chainBasicIndexV65=null,chainManagerIndexV65=null,chainCompanyFilterV65='all';
  function rowV65(){return knowledgeBaseConfigs.chain.rows[chainManagerIndexV65]}
  function nodesV65(row){var list=(row.graphNodes||[]).map(function(node){return node.name});if(!list.length)list=String(row.sub||'上游—中游—下游—配套服务').split(/[—→]/).map(function(name){return name.trim()}).filter(Boolean);return list.length?list:['核心节点']}
  function nodeStageV65(row,node,index){
    var graph=(row.graphNodes||[]).find(function(item){return item.name===node});
    if(graph&&graph.stage)return graph.stage==='up'?'上游':graph.stage==='mid'?'中游':graph.stage==='down'?'下游':index%3===0?'上游':index%3===1?'中游':'下游';
    if(/原料|材料|研发|资源|基础/.test(node))return'上游';
    if(/部件|制造|生产|临床|加工|封装|软件/.test(node))return'中游';
    return'下游';
  }
  function isServiceV65(company){return !!company.isService||/服务|后市场|检测|认证|物流|租赁|运维|运营|咨询|平台/.test(company.node||'')}
  function normalizeCompaniesV65(row){
    var companies=row.linkedCompanies||[];
    companies.forEach(function(company,index){
      company.chainStage=company.chainStage||nodeStageV65(row,company.node,index);
      company.isService=isServiceV65(company);
      if(['人工挂靠','主营产品关联','行业关联'].indexOf(company.relation)<0)company.relation=company.relation==='主营产品关联'?'主营产品关联':'行业关联';
      if(company.isLead==null)company.isLead=company.type==='链主企业';
    });
    return companies;
  }
  function countsV65(row){
    var companies=normalizeCompaniesV65(row),count={up:0,mid:0,down:0,service:0,lead:0,total:companies.length};
    companies.forEach(function(company){
      if(company.isService)count.service++;
      else if(company.chainStage==='上游')count.up++;
      else if(company.chainStage==='中游')count.mid++;
      else count.down++;
      if(company.isLead)count.lead++;
    });
    return count;
  }
  function filterLabelV65(key){return{all:'全部企业',up:'上游企业',mid:'中游企业',down:'下游企业',service:'配套企业',lead:'链主企业'}[key]||'全部企业'}
  function companyMatchesV65(company,key){if(key==='all')return true;if(key==='service')return company.isService;if(key==='lead')return company.isLead;if(company.isService)return false;return company.chainStage==={up:'上游',mid:'中游',down:'下游'}[key]}
  function metricButtonsV65(count,manager){
    var items=[['up','上游',count.up],['mid','中游',count.mid],['down','下游',count.down],['service','配套',count.service],['lead','链主',count.lead]];
    return items.map(function(item){return'<button type="button" class="chain-relation-metric-v65 '+(manager&&chainCompanyFilterV65===item[0]?'active':'')+'" '+(manager?'onclick="filterChainCompaniesV65(\''+item[0]+'\')"':'onclick="openChainCompanyManagerV65('+chainBasicIndexV65+',\''+item[0]+'\')"')+'><span>'+item[1]+'</span><b>'+item[2]+' 家</b><small>'+(manager?'点击筛选':'查看明细')+'</small></button>'}).join('');
  }
  function refreshBasicSummaryV65(){
    var row=knowledgeBaseConfigs.chain.rows[chainBasicIndexV65],editor=document.getElementById('chainEnterpriseEditorV64');if(!row||!editor)return;
    var count=countsV65(row);
    editor.innerHTML='<header><div><h3>挂靠企业关系</h3><p>按产业链环节汇总挂靠企业，点击指标进入明细管理</p></div><button type="button" class="primary" onclick="openChainCompanyManagerV65('+chainBasicIndexV65+',\'all\')">管理挂靠企业 →</button></header><div class="chain-relation-overview-v65">'+metricButtonsV65(count,false)+'</div>';
  }
  var previousBasicOpenV65=window.openChainBasicV61;
  if(previousBasicOpenV65)window.openChainBasicV61=function(index){chainBasicIndexV65=index;var result=previousBasicOpenV65.apply(this,arguments);normalizeCompaniesV65(knowledgeBaseConfigs.chain.rows[index]);refreshBasicSummaryV65();return result};

  function patchManagerStructureV65(){
    var modal=document.getElementById('chainCompanyManagerV49');if(!modal)return;
    var header=modal.querySelector('.collection-modal>header')||modal.querySelector('section>header');
    if(header&&!document.getElementById('chainCompanyAddButtonV65')){
      var add=document.createElement('button');add.id='chainCompanyAddButtonV65';add.type='button';add.className='primary chain-company-add-v65';add.textContent='＋ 添加企业';add.onclick=openChainCompanyAddV65;
      header.insertBefore(add,header.querySelector('.modal-close'));
    }
    var toolbar=modal.querySelector('.chain-company-toolbar-v49');if(toolbar)toolbar.hidden=true;
  }
  function renderManagerSummaryV65(row){
    var summary=document.querySelector('#chainCompanyManagerV49 .chain-company-summary-v49');if(!summary)return;
    summary.innerHTML=metricButtonsV65(countsV65(row),true);
  }
  window.filterChainCompaniesV65=function(key){chainCompanyFilterV65=chainCompanyFilterV65===key?'all':key;renderChainCompaniesV65()};
  window.updateChainRelationV65=function(index,field,value){
    var row=rowV65(),company=normalizeCompaniesV65(row)[index];if(!company)return;
    if(field==='isLead'){company.isLead=!!value;company.type=value?'链主企业':'重点企业'}
    else if(field==='strength')company.strength=String(value).replace('%','')+'%';
    else{company[field]=value;if(field==='node')company.isService=isServiceV65(company)}
    row.lead=normalizeCompaniesV65(row).filter(function(item){return item.isLead}).map(function(item){return item.name}).join('、')||'暂未标注链主企业';
    row.updatedAt=new Date().toLocaleString('zh-CN',{hour12:false}).replaceAll('/','-');
    renderChainCompaniesV65();refreshBasicSummaryV65();
  };
  window.renderChainCompaniesV65=function(){
    var row=rowV65();if(!row)return;patchManagerStructureV65();var companies=normalizeCompaniesV65(row),nodes=nodesV65(row),relations=['人工挂靠','主营产品关联','行业关联'];
    renderManagerSummaryV65(row);
    var head=document.querySelector('#chainCompanyManagerV49 thead');if(head)head.innerHTML='<tr><th>企业名称</th><th>挂靠节点</th><th>所属产业链环节</th><th>关系类型</th><th>关联强度</th><th>链主企业</th><th>操作</th></tr>';
    var visible=companies.map(function(company,index){return{company:company,index:index}}).filter(function(item){return companyMatchesV65(item.company,chainCompanyFilterV65)});
    document.getElementById('chainCompanyRowsV49').innerHTML=visible.map(function(item){var company=item.company,index=item.index;return'<tr><td><b>'+escV65(company.name)+'</b><span>'+escV65(company.code||'待补充统一社会信用代码')+'</span></td><td><select onchange="updateChainRelationV65('+index+',\'node\',this.value)">'+nodes.map(function(node){return'<option '+(node===company.node?'selected':'')+'>'+escV65(node)+'</option>'}).join('')+'</select></td><td><select onchange="updateChainRelationV65('+index+',\'chainStage\',this.value)">'+['上游','中游','下游'].map(function(stage){return'<option '+(stage===company.chainStage?'selected':'')+'>'+stage+'</option>'}).join('')+'</select></td><td><select onchange="updateChainRelationV65('+index+',\'relation\',this.value)">'+relations.map(function(relation){return'<option '+(relation===company.relation?'selected':'')+'>'+relation+'</option>'}).join('')+'</select></td><td><input class="chain-strength-input-v64" type="number" min="0" max="100" value="'+(parseInt(company.strength,10)||80)+'" onchange="updateChainRelationV65('+index+',\'strength\',this.value)"><span class="strength-unit-v64">%</span></td><td><label class="lead-switch-v64"><input type="checkbox" '+(company.isLead?'checked':'')+' onchange="updateChainRelationV65('+index+',\'isLead\',this.checked)"><span></span><em>'+(company.isLead?'链主':'普通')+'</em></label></td><td><button type="button" onclick="unlinkChainCompanyV49('+index+')">解除挂靠</button></td></tr>'}).join('')||'<tr><td colspan="7" class="chain-empty-v65">当前筛选条件暂无企业</td></tr>';
    var page=document.getElementById('chainCompanyPageTextV49');if(page)page.textContent=filterLabelV65(chainCompanyFilterV65)+' · 当前显示 '+visible.length+' 条 / 共 '+companies.length+' 条';
  };
  window.renderChainCompaniesV64=renderChainCompaniesV65;
  var previousManagerOpenV65=window.openChainCompanyManagerV49;
  window.openChainCompanyManagerV49=function(index){chainManagerIndexV65=index;chainCompanyFilterV65='all';var result=previousManagerOpenV65.apply(this,arguments);patchManagerStructureV65();renderChainCompaniesV65();return result};
  window.openChainCompanyManagerV65=function(index,filter){chainManagerIndexV65=index;chainCompanyFilterV65=filter||'all';window.openChainCompanyManagerV49(index);chainCompanyFilterV65=filter||'all';renderChainCompaniesV65()};

  function ensureChainCompanyAddModalV65(){
    if(document.getElementById('chainCompanyAddModalV65'))return;
    document.body.insertAdjacentHTML('beforeend','<div class="collection-modal-backdrop chain-company-add-modal-v65" id="chainCompanyAddModalV65" aria-hidden="true"><section class="collection-modal small" role="dialog" aria-modal="true"><header><div><h2>添加链上企业</h2><p>选择企业与产业链节点，人工建立挂靠关系</p></div><button class="modal-close" onclick="closeChainCompanyAddV65()">×</button></header><div class="collection-modal-body"><div class="chain-company-add-form-v65"><label class="wide"><span>企业名称</span><input id="chainAddNameV65" placeholder="输入企业名称，支持联想企业库"></label><label><span>统一社会信用代码</span><input id="chainAddCodeV65" placeholder="选填"></label><label><span>挂靠节点</span><select id="chainAddNodeV65"></select></label><label><span>所属产业链环节</span><select id="chainAddStageV65"><option>上游</option><option>中游</option><option>下游</option></select></label><label><span>关系类型</span><select id="chainAddRelationV65"><option>人工挂靠</option><option>主营产品关联</option><option>行业关联</option></select></label><label class="chain-add-lead-v65"><span>链主企业</span><label><input type="checkbox" id="chainAddLeadV65"><i></i><em>标注为链主企业</em></label></label></div></div><footer><button class="secondary" onclick="closeChainCompanyAddV65()">取消</button><button class="primary" onclick="saveChainCompanyAddV65()">确认添加</button></footer></section></div>');
  }
  window.openChainCompanyAddV65=function(){
    ensureChainCompanyAddModalV65();var row=rowV65(),nodes=nodesV65(row);
    var addModal=document.getElementById('chainCompanyAddModalV65'),buttons=addModal.querySelectorAll('button');
    buttons[0].onclick=function(){window.closeChainCompanyAddV65()};
    buttons[1].onclick=function(){window.closeChainCompanyAddV65()};
    buttons[2].onclick=function(){window.saveChainCompanyAddV65()};
    document.getElementById('chainAddNameV65').value='';document.getElementById('chainAddCodeV65').value='';document.getElementById('chainAddLeadV65').checked=false;
    document.getElementById('chainAddNodeV65').innerHTML=nodes.map(function(node){return'<option>'+escV65(node)+'</option>'}).join('');
    document.getElementById('chainAddStageV65').value=nodeStageV65(row,nodes[0],0);
    var modal=document.getElementById('chainCompanyAddModalV65');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
  };
  window.closeChainCompanyAddV65=function(){var modal=document.getElementById('chainCompanyAddModalV65');if(!modal)return;modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='hidden'};
  window.saveChainCompanyAddV65=function(){
    var row=rowV65(),name=document.getElementById('chainAddNameV65').value.trim();if(!name){toast('请输入企业名称');document.getElementById('chainAddNameV65').focus();return}
    var companies=normalizeCompaniesV65(row);if(companies.some(function(company){return company.name===name})){toast('该企业已挂靠当前产业链');return}
    var node=document.getElementById('chainAddNodeV65').value,isLead=document.getElementById('chainAddLeadV65').checked;
    companies.unshift({name:name,code:document.getElementById('chainAddCodeV65').value.trim()||'待补充统一社会信用代码',node:node,chainStage:document.getElementById('chainAddStageV65').value,relation:document.getElementById('chainAddRelationV65').value,strength:'80%',isLead:isLead,type:isLead?'链主企业':'重点企业',isService:/服务|后市场|检测|认证|物流|租赁|运维|运营|咨询|平台/.test(node)});
    row.companies=((parseInt(row.companies,10)||companies.length-1)+1)+' 家';row.updatedAt=new Date().toLocaleString('zh-CN',{hour12:false}).replaceAll('/','-');
    closeChainCompanyAddV65();chainCompanyFilterV65='all';renderChainCompaniesV65();refreshBasicSummaryV65();if(typeof renderKnowledgeList==='function')renderKnowledgeList();toast('企业已新增挂靠');
  };
  var previousUnlinkV65=window.unlinkChainCompanyV49;
  window.unlinkChainCompanyV49=function(index){var result=previousUnlinkV65.apply(this,arguments);renderChainCompaniesV65();refreshBasicSummaryV65();return result};

  /* 企业尽调、企业政策匹配、政策精准扶持统一面包屑 */
  window.returnEnterprisePolicyHomeV65=function(){
    var section=document.getElementById('enterprisePolicy');section.classList.remove('matched','match-loading');
    var button=document.getElementById('enterpriseMatchBtn');if(button){button.disabled=false;button.textContent='✦ 一键匹配政策'}
    window.scrollTo({top:0,behavior:'smooth'});
  };
  window.returnSupportHomeV65=function(){
    var section=document.getElementById('support');section.classList.remove('matched','match-loading');
    var button=document.getElementById('supportMatchBtn');if(button){button.disabled=false;button.textContent='✦ 一键匹配企业'}
    window.scrollTo({top:0,behavior:'smooth'});
  };
  window.returnDueHomeV65=function(){if(typeof show==='function')show('dueDiligence');window.scrollTo({top:0,behavior:'smooth'})};
  function ensureFeatureBreadcrumbsV65(){
    var enterprise=document.getElementById('enterprisePolicy');
    if(enterprise&&!document.getElementById('enterprisePolicyBreadcrumbV65')){
      var nav=document.createElement('nav');nav.id='enterprisePolicyBreadcrumbV65';nav.className='feature-breadcrumb-v65';nav.setAttribute('aria-label','企业政策匹配面包屑');nav.innerHTML='<button type="button" onclick="returnEnterprisePolicyHomeV65()">企业政策匹配</button><i>›</i><b>政策匹配结果</b>';
      enterprise.querySelector('.head').insertAdjacentElement('afterend',nav);
    }
    var support=document.getElementById('supportResultArea');
    if(support&&!document.getElementById('supportBreadcrumbV65'))support.insertAdjacentHTML('afterbegin','<nav class="feature-breadcrumb-v65" id="supportBreadcrumbV65" aria-label="政策精准扶持面包屑"><button type="button" onclick="returnSupportHomeV65()">政策精准扶持</button><i>›</i><b>企业匹配结果</b></nav>');
    var due=document.querySelector('#dueReport .detail-back');
    if(due){due.classList.add('feature-breadcrumb-v65');due.setAttribute('aria-label','企业尽调面包屑');due.innerHTML='<button type="button" onclick="returnDueHomeV65()">企业尽调助手</button><i>›</i><b>招商尽调报告</b>'}
  }
  ensureFeatureBreadcrumbsV65();})();

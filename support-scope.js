(function(){
'use strict';
if(document.getElementById('supportScopeBtn'))return;

const scopeInputRow = document.querySelector('#support .support-policy-input');
const scopeButton = document.createElement('button');
scopeButton.type='button';scopeButton.className='secondary';scopeButton.id='supportScopeBtn';
scopeButton.setAttribute('aria-haspopup','dialog');scopeButton.setAttribute('aria-controls','supportScopeDialog');
scopeButton.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 5h16l-6 7v6l-4 2v-8z"/></svg><span id="supportScopeBtnLabel">扶持范围</span>';
scopeButton.addEventListener('click',openSupportScope);
scopeInputRow.insertBefore(scopeButton,document.getElementById('supportMatchBtn'));
const scopeSummary=document.createElement('div');scopeSummary.id='supportScopeSummary';scopeSummary.className='support-scope-summary';scopeSummary.setAttribute('aria-live','polite');scopeInputRow.insertAdjacentElement('afterend',scopeSummary);
document.body.insertAdjacentHTML('beforeend','\n<dialog id="supportScopeDialog" class="scope-dialog" aria-labelledby="supportScopeTitle" aria-describedby="supportScopeDescription">\n  <form id="supportScopeForm" novalidate>\n    <header><div><h2 id="supportScopeTitle">选择扶持范围</h2><p id="supportScopeDescription">企业需同时满足所选条件；同一类中的多个选项满足任一即可。未选择的条件不限。</p></div><button class="scope-close" type="button" aria-label="关闭扶持范围" onclick="closeSupportScope()">×</button></header>\n    <div class="scope-form-body">\n      <fieldset class="scope-field scope-wide"><legend>地区<span>按企业注册地筛选</span></legend><div class="scope-region"><label>省份<select id="scopeProvince" name="province"><option value="">不限省份</option></select></label><label>城市<select id="scopeCity" name="city"><option value="">不限城市</option></select></label><label>区县 / 园区<select id="scopeDistrict" name="district"><option value="">不限区县 / 园区</option></select></label></div></fieldset>\n      <fieldset class="scope-field scope-wide"><legend>行业<span>可多选</span></legend><div id="scopeIndustryOptions" class="scope-choices"></div></fieldset>\n      <fieldset class="scope-field"><legend>社保人数<span>人</span></legend><select id="scopeEmployeesPreset" aria-label="社保人数快捷范围"><option value="">不限人数</option><option value="0,49">0–49 人</option><option value="50,99">50–99 人</option><option value="100,299">100–299 人</option><option value="300,499">300–499 人</option><option value="500,">500 人及以上</option><option value="custom">自定义范围</option></select><div class="scope-number-range"><input type="number" id="scopeEmployeesMin" name="employeesMin" min="0" step="1" placeholder="最低人数" aria-label="最低社保人数"><span>至</span><input type="number" id="scopeEmployeesMax" name="employeesMax" min="0" step="1" placeholder="最高人数" aria-label="最高社保人数"><span>人</span></div><p>按企业当前参保人数筛选，可仅填写最低或最高人数。</p></fieldset>\n      <fieldset class="scope-field"><legend>成立年限<span>年</span></legend><select id="scopeYearsPreset" aria-label="成立年限快捷范围"><option value="">不限年限</option><option value="0,0">未满 1 年</option><option value="1,2">1–2 年</option><option value="3,4">3–4 年</option><option value="5,9">5–9 年</option><option value="10,">10 年及以上</option><option value="custom">自定义范围</option></select><div class="scope-number-range"><input type="number" id="scopeYearsMin" name="yearsMin" min="0" step="1" placeholder="最低年限" aria-label="最低成立年限"><span>至</span><input type="number" id="scopeYearsMax" name="yearsMax" min="0" step="1" placeholder="最高年限" aria-label="最高成立年限"><span>年</span></div><p>按截至今日的完整经营年数筛选，包含填写的上下限。</p></fieldset>\n      <fieldset class="scope-field scope-wide"><legend>荣誉资质<span>可多选</span></legend><div id="scopeHonorOptions" class="scope-choices"></div></fieldset>\n      <fieldset class="scope-field scope-wide"><legend>存续状态<span>可多选</span></legend><div id="scopeStatusOptions" class="scope-choices"></div></fieldset>\n    </div>\n    <p id="scopeError" class="scope-error" role="alert"></p>\n    <footer><div class="scope-preview" id="scopePreview" aria-live="polite"></div><button type="button" class="scope-reset" onclick="resetSupportScopeDraft()">重置条件</button><button type="button" class="secondary" onclick="closeSupportScope()">取消</button><button type="submit" class="primary" id="scopeApply">确认扶持范围</button></footer>\n  </form>\n</dialog>\n');

// Policy support scope: prototype company profiles and six-dimensional filters.
const supportScopeProfiles = [
  ['高端装备制造','高新区',620,'2010-05-12','存续'],
  ['新能源汽车','经开区',486,'2016-03-18','存续'],
  ['新一代信息技术','临港产业园',830,'2012-07-06','在业'],
  ['新材料','化工产业园',1200,'2008-11-20','存续'],
  ['新能源汽车','经开区',2100,'2011-01-15','在业'],
  ['生物医药','科创园',168,'2022-09-08','存续'],
  ['工业软件','软件园',76,'2024-03-12','在业'],
  ['新能源装备','高新区',320,'2020-04-16','存续'],
  ['高端装备制造','科创园',96,'2023-08-21','存续'],
  ['现代服务业','临港园区',28,'2025-11-05','停业']
];
companies.forEach((company,index)=>{const [industry,district,employees,established,businessStatus]=supportScopeProfiles[index];Object.assign(company,{province:'江苏省',city:'海州市',district,industry,employees,established,businessStatus})});
const supportScopeRegions = {'江苏省':{'海州市':['高新区','经开区','临港产业园','化工产业园','科创园','软件园','临港园区']}};
const supportHonorOptions = ['高新技术企业','国家级专精特新小巨人','省级专精特新','专精特新企业','制造业单项冠军','科技型中小企业','瞪羚企业','绿色工厂','创新型中小企业','链主企业','上市公司','绿色供应链','省级示范企业','数字化标杆'];
function emptySupportScope(){return {province:'',city:'',district:'',industries:[],employeesMin:'',employeesMax:'',honors:[],yearsMin:'',yearsMax:'',statuses:[]}}
let supportScope = emptySupportScope();
function supportEscape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function supportCompanyYears(company,today=new Date()){const [y,m,d]=company.established.split('-').map(Number);return today.getFullYear()-y-((today.getMonth()+1<m||(today.getMonth()+1===m&&today.getDate()<d))?1:0)}
function supportHonorMatches(company,honor){return company.h.some(value=>value===honor||(honor==='高新技术企业'&&value==='国家高新技术企业')||(honor==='国家级专精特新小巨人'&&value==='专精特新小巨人'))}
function inSupportRange(value,min,max){return (min===''||value>=Number(min))&&(max===''||value<=Number(max))}
function matchesSupportScope(company,scope=supportScope){
  const checks=[];
  if(scope.province||scope.city||scope.district)checks.push((!scope.province||company.province===scope.province)&&(!scope.city||company.city===scope.city)&&(!scope.district||company.district===scope.district));
  if(scope.industries.length)checks.push(scope.industries.includes(company.industry));
  if(scope.employeesMin!==''||scope.employeesMax!=='')checks.push(inSupportRange(company.employees,scope.employeesMin,scope.employeesMax));
  if(scope.honors.length)checks.push(scope.honors.some(honor=>supportHonorMatches(company,honor)));
  if(scope.yearsMin!==''||scope.yearsMax!=='')checks.push(inSupportRange(supportCompanyYears(company),scope.yearsMin,scope.yearsMax));
  if(scope.statuses.length)checks.push(scope.statuses.includes(company.businessStatus));
  return checks.length===0||checks.some(Boolean);
}
function scopedSupportCompanies(scope=supportScope){return companies.map((c,index)=>({c,index})).filter(({c})=>matchesSupportScope(c,scope)).sort((a,b)=>b.c.s-a.c.s)}
function supportRangeLabel(min,max,unit){return min!==''&&max!==''?`${min}–${max}${unit}`:min!==''?`${min}${unit}及以上`:`不超过${max}${unit}`}
function supportScopeEntries(scope=supportScope){const entries=[];if(scope.province||scope.city||scope.district)entries.push(['region','地区：'+[scope.province,scope.city,scope.district].filter(Boolean).join(' / ')]);if(scope.industries.length)entries.push(['industries','行业：'+scope.industries.join('、')]);if(scope.employeesMin!==''||scope.employeesMax!=='')entries.push(['employees','社保人数：'+supportRangeLabel(scope.employeesMin,scope.employeesMax,'人')]);if(scope.honors.length)entries.push(['honors','荣誉资质：'+scope.honors.join('、')]);if(scope.yearsMin!==''||scope.yearsMax!=='')entries.push(['years','成立年限：'+supportRangeLabel(scope.yearsMin,scope.yearsMax,'年')]);if(scope.statuses.length)entries.push(['statuses','存续状态：'+scope.statuses.join('、')]);return entries}
function updateSupportScopeSummary(){const entries=supportScopeEntries();document.getElementById('supportScopeBtnLabel').textContent=entries.length?`扶持范围 · ${entries.length}项`:'扶持范围';document.getElementById('supportScopeBtn').classList.toggle('scope-active',entries.length>0);document.getElementById('supportScopeSummary').innerHTML=entries.length?'<span>已选范围</span>'+entries.map(([key,label])=>`<button type="button" onclick="removeSupportScope('${key}')" aria-label="移除${supportEscape(label)}">${supportEscape(label)} ×</button>`).join('')+'<button type="button" class="scope-clear" onclick="clearSupportScope()">清空</button>':'<span>扶持范围不限 · 可按地区、行业等条件筛选企业</span>'}
function refreshSupportScopeResults(){supportPage=1;updateSupportScopeSummary();renderCompanies()}
function clearSupportScope(){supportScope=emptySupportScope();refreshSupportScopeResults()}
function removeSupportScope(key){if(key==='region'){supportScope.province='';supportScope.city='';supportScope.district=''}else if(key==='employees'||key==='years'){supportScope[key+'Min']='';supportScope[key+'Max']=''}else supportScope[key]=[];refreshSupportScopeResults()}
function populateSupportSelect(id,values,placeholder,selected=''){const select=document.getElementById(id);select.replaceChildren(new Option(placeholder,''),...values.map(value=>new Option(value,value)));select.value=selected}
function updateSupportRegionFields(scope){populateSupportSelect('scopeProvince',Object.keys(supportScopeRegions),'不限省份',scope.province);populateSupportSelect('scopeCity',Object.keys(supportScopeRegions[scope.province]||{}),'不限城市',scope.city);populateSupportSelect('scopeDistrict',supportScopeRegions[scope.province]?.[scope.city]||[],'不限区县 / 园区',scope.district);document.getElementById('scopeCity').disabled=!scope.province;document.getElementById('scopeDistrict').disabled=!scope.city}
function readSupportScopeDraft(){const form=document.getElementById('supportScopeForm'),scope=emptySupportScope();['province','city','district','employeesMin','employeesMax','yearsMin','yearsMax'].forEach(key=>scope[key]=form.elements.namedItem(key).value);['industries','honors','statuses'].forEach(key=>scope[key]=Array.from(form.querySelectorAll(`input[name="${key}"]:checked`),input=>input.value));return scope}
function fillSupportScopeDraft(scope){updateSupportRegionFields(scope);const form=document.getElementById('supportScopeForm');['employeesMin','employeesMax','yearsMin','yearsMax'].forEach(key=>form.elements.namedItem(key).value=scope[key]);['industries','honors','statuses'].forEach(key=>form.querySelectorAll(`input[name="${key}"]`).forEach(input=>input.checked=scope[key].includes(input.value)));['Employees','Years'].forEach(kind=>syncSupportPreset(kind));previewSupportScopeDraft()}
function validateSupportScope(scope){for(const [key,label] of [['employees','社保人数'],['years','成立年限']]){const min=scope[key+'Min'],max=scope[key+'Max'];if([min,max].some(value=>value!==''&&(!Number.isSafeInteger(Number(value))||Number(value)<0)))return label+'请输入非负整数';if(min!==''&&max!==''&&Number(min)>Number(max))return label+'的最低值不能大于最高值'}return ''}
function supportDraftError(scope){const invalid=Array.from(document.querySelectorAll('#supportScopeForm input[type="number"]')).find(input=>input.validity.badInput);return invalid?'请输入有效的非负整数':validateSupportScope(scope)}
function previewSupportScopeDraft(){const draft=readSupportScopeDraft(),error=supportDraftError(draft);document.getElementById('scopeError').textContent=error;document.getElementById('scopeApply').disabled=!!error;document.getElementById('scopePreview').innerHTML=error?'请先修正筛选条件':`符合范围 <b>${scopedSupportCompanies(draft).length}</b> 家 <span>· 原型演示数据</span>`}
function syncSupportPreset(kind){const min=document.getElementById('scope'+kind+'Min').value,max=document.getElementById('scope'+kind+'Max').value,select=document.getElementById('scope'+kind+'Preset'),value=min===''&&max===''?'':min+','+max;select.value=Array.from(select.options).some(option=>option.value===value)?value:'custom'}
function useSupportPreset(kind){const select=document.getElementById('scope'+kind+'Preset');if(select.value==='custom'){document.getElementById('scope'+kind+'Min').focus();return}const [min='',max='']=select.value.split(',');document.getElementById('scope'+kind+'Min').value=min;document.getElementById('scope'+kind+'Max').value=max;previewSupportScopeDraft()}
function openSupportScope(){fillSupportScopeDraft(supportScope);document.getElementById('supportScopeDialog').showModal()}
function closeSupportScope(){document.getElementById('supportScopeDialog').close();document.getElementById('supportScopeBtn').focus()}
function resetSupportScopeDraft(){fillSupportScopeDraft(emptySupportScope())}
function applySupportScope(event){event.preventDefault();const draft=readSupportScopeDraft();if(supportDraftError(draft)){previewSupportScopeDraft();return}supportScope=draft;refreshSupportScopeResults();closeSupportScope();toast('扶持范围已更新')}
function updateSupportScopeStats(){const list=scopedSupportCompanies(),counts={all:list.length,high:list.filter(({c})=>c.s>=90).length,unenjoyed:list.filter(({c})=>c.status==='unenjoyed').length,enjoyed:list.filter(({c})=>c.status==='enjoyed').length};document.querySelectorAll('[data-support-filter]').forEach(button=>button.querySelector('b').textContent=counts[button.dataset.supportFilter]);document.querySelector('#support .support-result-actions>span').textContent=`扶持范围内 ${list.length} 家 · 原型演示数据`}
function initializeSupportScope(){
  const groups=[['scopeIndustryOptions','industries',[...new Set(companies.map(c=>c.industry))]],['scopeHonorOptions','honors',supportHonorOptions],['scopeStatusOptions','statuses',['存续','在业','停业','注销','吊销','迁出','清算']]];
  groups.forEach(([id,name,values])=>document.getElementById(id).innerHTML=values.map(value=>`<label class="scope-choice"><input type="checkbox" name="${name}" value="${supportEscape(value)}"><span>${supportEscape(value)}</span></label>`).join(''));
  const form=document.getElementById('supportScopeForm');form.addEventListener('submit',applySupportScope);form.addEventListener('input',previewSupportScopeDraft);form.addEventListener('change',previewSupportScopeDraft);
  document.getElementById('scopeProvince').addEventListener('change',()=>{const draft=readSupportScopeDraft();draft.city='';draft.district='';updateSupportRegionFields(draft);previewSupportScopeDraft()});
  document.getElementById('scopeCity').addEventListener('change',()=>{const draft=readSupportScopeDraft();draft.district='';updateSupportRegionFields(draft);previewSupportScopeDraft()});
  ['Employees','Years'].forEach(kind=>{document.getElementById('scope'+kind+'Preset').addEventListener('change',()=>useSupportPreset(kind));['Min','Max'].forEach(bound=>document.getElementById('scope'+kind+bound).addEventListener('input',()=>syncSupportPreset(kind)))});
  const dialog=document.getElementById('supportScopeDialog');dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeSupportScope()});dialog.addEventListener('cancel',event=>{event.preventDefault();closeSupportScope()});
  updateSupportScopeSummary();
}


const previousScopeGetCompanies=window.getSupportCompanies;
window.getSupportCompanies=function(){return previousScopeGetCompanies.apply(this,arguments).filter(({c})=>matchesSupportScope(c))};
const previousScopeRenderCompanies=window.renderCompanies;
window.renderCompanies=function(){
  const result=previousScopeRenderCompanies.apply(this,arguments);
  updateSupportScopeStats();
  const list=getSupportCompanies(),pageRows=list.slice((supportPage-1)*supportPageSize,supportPage*supportPageSize);
  if(!list.length){document.getElementById('companyList').innerHTML='<div class="empty" style="padding:36px 20px;text-align:center">暂无符合当前筛选的企业<br><button class="secondary" style="margin-top:14px" onclick="openSupportScope()">调整扶持范围</button></div>';return result}
  document.querySelectorAll('#companyList>button').forEach((button,index)=>{const company=pageRows[index]?.c;if(!company)return;const text=document.createElement('div');text.className='support-company-scope';text.textContent=`社保 ${company.employees} 人 · 成立 ${supportCompanyYears(company)} 年 · ${company.businessStatus}`;button.querySelector('small').insertAdjacentElement('afterend',text)});
  const company=companies[ci],head=document.querySelector('#companyProfile .profile-head');
  if(company&&head)head.insertAdjacentHTML('afterend',`<div class="support-profile-scope"><span>${supportEscape(company.province+' / '+company.city+' / '+company.district)}</span><span>社保 ${company.employees} 人</span><span>成立 ${supportCompanyYears(company)} 年</span><span>${supportEscape(company.businessStatus)}</span></div>`);
  document.querySelectorAll('#supportProjectTabsV82 button small').forEach(small=>{small.textContent=small.textContent.replace(/ · 匹配 \d+ 家/,'')});
  return result;
};

window.exportSupportList=function(){const list=getSupportCompanies();if(!list.length){toast('当前筛选下暂无可导出的企业');return}const policy=document.getElementById('supportResultTitle').textContent,scope=supportScopeEntries().map(([,label])=>label).join('；')||'不限',filter={all:'全部匹配企业',high:'高匹配企业',unenjoyed:'应享未享',enjoyed:'已享受政策'}[supportFilter];downloadTextFile('政策精准扶持企业名单.txt','政策精准扶持企业名单（原型演示数据）\n'+policy+'\n扶持范围：'+scope+'\n结果分类：'+filter+'\n共 '+list.length+' 家\n\n'+list.map(({c},i)=>`${i+1}. ${c.n}｜${c.province}/${c.city}/${c.district}｜${c.industry}｜社保 ${c.employees} 人｜成立 ${supportCompanyYears(c)} 年｜${c.businessStatus}｜${c.h.join('、')}｜匹配度 ${c.s}%`).join('\n'))};

const scopeHeroDescription=document.querySelector('#support .support-input-hero>p');
if(scopeHeroDescription)scopeHeroDescription.textContent='选择扶持范围，精准筛选企业；支持政策名称、政策全文及附件匹配。';
initializeSupportScope();
renderCompanies();

Object.assign(window,{openSupportScope,closeSupportScope,removeSupportScope,clearSupportScope,resetSupportScopeDraft});

})();

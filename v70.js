(function(){
  'use strict';
  var q=function(s){return document.querySelector(s)};
  var qa=function(s){return Array.from(document.querySelectorAll(s))};

  /* 企业政策匹配：将模式压缩到搜索框左侧 */
  function compactEnterpriseModeV70(){
    var old=q('#enterprisePolicy .ep-mode-head-v68');if(old)old.remove();
    var row=q('#enterprisePolicy .enterprise-input-card .input-row'),input=q('#epSearch');
    if(!row||!input||q('#epModeSelectV70'))return;
    var combo=document.createElement('div');combo.className='ep-search-combo-v70';
    combo.innerHTML='<div class="ep-mode-select-wrap-v70"><span>匹配模式</span><select id="epModeSelectV70" onchange="changeEpModeV70(this.value)"><option value="foreign">外商引进</option><option value="local">本地培育</option></select></div><i></i>';
    row.insertBefore(combo,input);combo.appendChild(input);
    window.changeEpModeV70=function(mode){if(typeof setEpModeV68==='function')setEpModeV68(mode);var label=q('#enterprisePolicy .enterprise-input-card>label');if(label)label.textContent=mode==='local'?'为本地企业智能匹配政策':'为拟招引企业智能匹配政策'};
    changeEpModeV70('foreign');
  }

  /* 整体产业链报告：先打开可视化生成中间页，再进入报告 */
  function valueV70(id,fallback){var el=q('#'+id);return el&&String(el.value||el.textContent||'').trim()||fallback}
  window.runAttractionRecommend=function(){
    var button=q('#attractionRunBtn'),modalChain=q('#attractionChain'),local=q('#localChainSelect');
    var chain=modalChain&&modalChain.value||(local&&local.selectedOptions&&local.selectedOptions[0]?local.selectedOptions[0].textContent.replace(/^本地热门\s*·\s*/,''):'新能源汽车产业链');
    var target=new URL('chain-strength-report.html',window.location.href);
    target.searchParams.set('city','海州市');target.searchParams.set('chain',chain);target.searchParams.set('nodes',valueV70('attractionNode','全链整体分析'));target.searchParams.set('region',valueV70('attractionRegionV50','全国重点产业集聚区'));target.searchParams.set('honor',valueV70('attractionHonorV50','不限'));target.searchParams.set('generated',new Date().toISOString());
    var loading=new URL('chain-report-generating.html',window.location.href);loading.searchParams.set('target',target.href);loading.searchParams.set('chain',chain);
    if(button){button.disabled=true;button.textContent='正在创建分析任务…'}
    var reportWindow=window.open(loading.href,'_blank');
    if(!reportWindow){if(button){button.disabled=false;button.textContent='开始推荐'};typeof toast==='function'&&toast('浏览器阻止了新页面，请允许弹出窗口后重试');return}
    if(typeof closeAttractionModal==='function')closeAttractionModal();
    setTimeout(function(){if(button){button.disabled=false;button.textContent='开始推荐'}},500);
    typeof toast==='function'&&toast('产业链整体分析任务已创建，可在新页面查看生成进度');
  };

  /* 企业尽调：首页按尽调状态筛选 */
  var dueStatusV70='all';
  function applyDueStatusV70(){
    var rows=qa('#followedInvestmentRows tr'),visible=0;
    rows.forEach(function(row){var text=(row.querySelector('.due-list-status')||{}).textContent||'';var show=dueStatusV70==='all'||text.indexOf(dueStatusV70)>-1;row.hidden=!show;if(show)visible++});
    var result=q('#dueStatusResultV70');if(result)result.textContent='当前 '+visible+' 家';
  }
  window.setDueStatusV70=function(value){dueStatusV70=value||'all';applyDueStatusV70();typeof toast==='function'&&toast(dueStatusV70==='all'?'已显示全部尽调状态':'已筛选：'+dueStatusV70)};
  function setupDueFilterV70(){
    var title=q('#dueDiligence .followed-investments .card-title');if(!title||q('#dueStatusFilterV70'))return;
    title.insertAdjacentHTML('beforeend','<div class="due-status-filter-v70"><label>尽调状态</label><select id="dueStatusFilterV70" onchange="setDueStatusV70(this.value)"><option value="all">全部状态</option><option value="待尽调">待尽调</option><option value="已生成尽调报告">已生成尽调报告</option><option value="风险待核验">风险待核验</option><option value="纳入重点跟进">纳入重点跟进</option></select><span id="dueStatusResultV70"></span></div>');
    applyDueStatusV70();
  }
  var dueRows=q('#followedInvestmentRows');if(dueRows)new MutationObserver(function(){setTimeout(function(){setupDueFilterV70();applyDueStatusV70()},80)}).observe(dueRows,{childList:true});
  var oldDuePoolV70=window.setDuePool66;if(oldDuePoolV70)window.setDuePool66=function(){var result=oldDuePoolV70.apply(this,arguments);setTimeout(applyDueStatusV70,50);return result};

  /* 网页采集：标记站点类型 */
  function setupCollectorSiteTypeV70(){
    var url=q('#webCollectorModal .collector-url');if(!url||q('#collectorSiteTypeV70'))return;
    url.insertAdjacentHTML('afterend','<div class="collector-site-type-v70"><div><b>站点类型</b><span>用于配置采集合规策略、解析模板和更新优先级</span></div><select id="collectorSiteTypeV70"><option>政府网站</option><option>行业协会</option><option>社交媒体</option><option>海外站点</option></select></div>');
  }

  /* 本地文件：上传后必须选择五大知识库 */
  var pendingFilesV70=null,oldHandleFilesV70=window.handleLocalFiles;
  function ensureLocalKbModalV70(){if(q('#localKbModalV70'))return;document.body.insertAdjacentHTML('beforeend','<div class="collection-modal-backdrop local-kb-modal-v70" id="localKbModalV70" aria-hidden="true"><section class="collection-modal small" role="dialog" aria-modal="true"><header><div><h2>选择文件入库位置</h2><p>文件解析和 AI 结构化完成后，将写入指定的精品知识库</p></div><button class="modal-close" onclick="closeLocalKbModalV70()">×</button></header><div class="collection-modal-body"><div class="local-file-summary-v70"><i>文</i><div><b id="localFileNameV70">已选择本地文件</b><span id="localFileCountV70">等待配置入库位置</span></div></div><label class="local-kb-select-v70"><span>目标知识库 <em>*</em></span><select id="localKbTargetV70"><option value="">请选择目标知识库</option><option>政策库</option><option>企业库</option><option>产业链库</option><option>项目库</option><option>新闻舆情库</option></select><small>系统将按照所选知识库的数据模型进行字段识别、清洗和 AI 打标。</small></label></div><footer><button class="secondary" onclick="closeLocalKbModalV70()">取消</button><button class="primary" onclick="confirmLocalKbV70()">确认并开始解析</button></footer></section></div>')}
  window.handleLocalFiles=function(files){if(!files||!files.length)return;pendingFilesV70=files;ensureLocalKbModalV70();q('#localFileNameV70').textContent=files[0].name;q('#localFileCountV70').textContent=files.length>1?'共 '+files.length+' 个文件':'单文件上传';q('#localKbTargetV70').value='';var m=q('#localKbModalV70');m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'};
  window.closeLocalKbModalV70=function(){var m=q('#localKbModalV70');if(m){m.classList.remove('open');m.setAttribute('aria-hidden','true')}document.body.style.overflow='';var input=q('#localFileInput');if(input)input.value=''};
  window.confirmLocalKbV70=function(){var kb=q('#localKbTargetV70').value;if(!kb){typeof toast==='function'&&toast('请选择目标知识库');q('#localKbTargetV70').focus();return}var files=pendingFilesV70;var m=q('#localKbModalV70');m.classList.remove('open');m.setAttribute('aria-hidden','true');document.body.style.overflow='';if(typeof oldHandleFilesV70==='function')oldHandleFilesV70(files);setTimeout(function(){var row=q('#collectionTaskRows tr');if(row&&row.cells[4])row.cells[4].innerHTML='<span class="collection-tag target-v70">'+kb+'</span>'},30);pendingFilesV70=null;typeof toast==='function'&&toast('文件将解析并入库至“'+kb+'”')};

  compactEnterpriseModeV70();setupDueFilterV70();setupCollectorSiteTypeV70();ensureLocalKbModalV70();
  setTimeout(function(){compactEnterpriseModeV70();setupDueFilterV70();setupCollectorSiteTypeV70()},350);
})();

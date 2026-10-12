(function(){
  'use strict';
  var q=function(s){return document.querySelector(s)};
  var qa=function(s){return Array.from(document.querySelectorAll(s))};
  var esc=function(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})};
  var epMode='foreign';
  var followed=[
    {name:'海州智造科技有限公司',track:'新能源汽车零部件',region:'海州市经开区',type:'local',followedAt:'2026-07-18 09:26',status:'generated',reportTime:'2026-07-18 10:05'},
    {name:'海州精工智能装备有限公司',track:'高端装备制造',region:'海州市高新区',type:'local',followedAt:'2026-07-21 14:12',status:'pending',reportTime:'—'},
    {name:'华芯微电子（海州）有限公司',track:'车规级芯片',region:'海州市临港产业园',type:'local',followedAt:'2026-07-22 16:40',status:'generated',reportTime:'2026-07-23 09:18'},
    {name:'新源固态电池有限公司',track:'动力电池',region:'海州市新能源产业园',type:'local',followedAt:'2026-07-26 15:32',status:'generated',reportTime:'2026-07-27 10:46'},
    {name:'云创工业软件有限公司',track:'工业软件',region:'海州市高新区',type:'local',followedAt:'2026-07-28 09:55',status:'pending',reportTime:'—'},
    {name:'上海联创智能座舱科技有限公司',track:'智能座舱',region:'上海市嘉定区',type:'foreign',followedAt:'2026-08-02 11:08',status:'generated',reportTime:'2026-08-03 09:20'},
    {name:'深圳锐驰车载电子有限公司',track:'车载电子',region:'深圳市南山区',type:'foreign',followedAt:'2026-08-05 10:16',status:'pending',reportTime:'—'},
    {name:'杭州云驾科技有限公司',track:'智能驾驶软件',region:'杭州市滨江区',type:'foreign',followedAt:'2026-08-08 15:45',status:'pending',reportTime:'—'}
  ];

  function modeMeta(){
    return epMode==='foreign'
      ? {name:'外商引进模式',hint:'输入拟招引企业名称或统一社会信用代码，匹配落地支持与可享政策'}
      : {name:'本地培育模式',hint:'输入海州市本地企业名称或统一社会信用代码，匹配可申报政策项目'};
  }
  window.setEpModeV68=function(mode){
    epMode=mode==='local'?'local':'foreign';
    qa('#epModeSwitchV68 button').forEach(function(b){b.classList.toggle('active',b.dataset.mode===epMode)});
    var select=q('#epModeSelectV70');if(select)select.value=epMode;
    var label=q('#enterprisePolicy .enterprise-input-card>label');if(label)label.textContent=epMode==='local'?'为本地企业智能匹配政策':'为拟招引企业智能匹配政策';
    var input=q('#epSearch'),meta=modeMeta();
    if(input)input.placeholder=meta.hint;
    var note=q('#epModeNoteV68');if(note)note.innerHTML='<b>'+meta.name+'</b><span>'+(epMode==='foreign'?'侧重识别外地目标企业可享的落地奖励、人才、研发及产业扶持政策。':'侧重识别本地企业申报机会、条件缺口和培育提升路径。')+'</span>';
    renderFollowed();
  };
  function setupModes(){
    var card=q('#enterprisePolicy .enterprise-input-card');if(!card||q('#epModeSwitchV68')||q('#epModeSelectV70'))return;
    card.insertAdjacentHTML('afterbegin','<div class="ep-mode-head-v68"><div><span>企业政策匹配模式</span><div class="ep-mode-switch-v68" id="epModeSwitchV68"><button type="button" class="active" data-mode="foreign" onclick="setEpModeV68(\'foreign\')"><i>引</i><b>外商引进模式</b><small>为拟招引企业匹配落地支持政策</small></button><button type="button" data-mode="local" onclick="setEpModeV68(\'local\')"><i>培</i><b>本地培育模式</b><small>为本地企业匹配申报与培育政策</small></button></div></div><div class="ep-mode-note-v68" id="epModeNoteV68"></div></div>');
    setEpModeV68(epMode);
  }
  function renderFollowed(){
    var section=q('#epFollowedCompanyList');if(!section)return;
    var local=epMode==='local';
    var title=local?'本地培育名单':'外地招商名单';
    var description=local?'跟进本地企业申报机会与培育进度，查看或生成政策匹配报告':'跟进外地拟招引企业落地支持机会，查看或生成政策匹配报告';
    var list=followed.map(function(x,i){return Object.assign({index:i},x)}).filter(function(x){return x.type===epMode});
    section.dataset.mode=epMode;
    section.setAttribute('aria-labelledby','epFollowedListTitleV68');
    section.innerHTML='<div class="ep-followed-head-v68"><div><h2 id="epFollowedListTitleV68">'+title+'</h2><p>'+description+'</p></div><span>共 '+list.length+' 家企业</span></div>'+
      '<div class="ep-followed-table-v68"><table><thead><tr><th>企业名称</th><th>名单分类</th><th>重点赛道</th><th>所在地区</th><th>匹配报告状态</th><th>报告更新时间</th><th>操作</th></tr></thead><tbody>'+list.map(function(item){var done=item.status==='generated';return '<tr><td><b>'+esc(item.name)+'</b><span>纳入跟进：'+item.followedAt+'</span></td><td><em class="ep-list-type-v68 '+item.type+'">'+(item.type==='local'?'本地培育':'外地招商')+'</em></td><td>'+esc(item.track)+'</td><td>'+esc(item.region)+'</td><td><em class="ep-report-status '+(done?'generated':'pending')+'">'+(done?'已经生成':'待生成')+'</em></td><td>'+esc(item.reportTime)+'</td><td><button class="ep-followed-action '+(done?'report-ready':'generate')+'" onclick="openTrackedPolicyReportV68('+item.index+')">'+(done?'查看匹配报告':'生成匹配报告')+'</button></td></tr>'}).join('')+'</tbody></table></div>';
  }
  window.filterEpFollowedV68=function(filter){setEpModeV68(filter==='local'||filter==='foreign'?filter:epMode)};
  window.openTrackedPolicyReportV68=function(index){
    var item=followed[index];if(!item)return;
    setEpModeV68(item.type);
    var input=q('#epSearch');if(input)input.value=item.name;
    if(item.status!=='generated'){item.status='generated';item.reportTime='刚刚';renderFollowed();if(typeof runEnterprisePolicyMatch==='function')runEnterprisePolicyMatch();}
    else{
      var title=q('#enterprisePolicy .ep-company h2');if(title)title.textContent=item.name;
      q('#enterprisePolicy')&&q('#enterprisePolicy').classList.add('matched');
      var btn=q('#enterpriseMatchBtn');if(btn)btn.textContent='✦ 重新匹配政策';
      var result=q('#enterprisePolicy .ep-overview-grid');result&&result.scrollIntoView({behavior:'smooth',block:'start'});
      typeof toast==='function'&&toast('已打开“'+item.name+'”政策匹配报告');
    }
  };
  function setupFollowed(){var section=q('#epFollowedCompanyList');if(!section)return;section.classList.add('ep-followed-v68');renderFollowed()}

  window.addNodeCompanyToInvestmentV68=function(encoded,button){
    var name=decodeURIComponent(encoded||'');
    if(typeof addInvestmentTarget==='function')addInvestmentTarget(name);
    if(button){button.classList.add('added');button.disabled=true;button.textContent='✓ 已加入';}
    typeof toast==='function'&&toast('“'+name+'”已加入外地招商名单');
  };
  function decorateNodeRecommendations(){
    var title=q('#nodeCompanyTitle'),head=q('#nodeCompanyTableHead'),body=q('#nodeCompanyRows');
    if(!title||!head||!body||!body.children.length)return;
    var isRecommend=/补强推荐企业/.test(title.textContent)||/推荐企业/.test(head.textContent);
    if(!isRecommend)return;
    var headerRow=head.querySelector('tr');
    if(headerRow&&!headerRow.querySelector('.recommend-action-head-v68'))headerRow.insertAdjacentHTML('beforeend','<th class="recommend-action-head-v68">操作</th>');
    Array.from(body.querySelectorAll('tr')).forEach(function(row){
      if(row.querySelector('.recommend-action-v68'))return;
      var name=(row.querySelector('.recommend-company-v65 b')||row.querySelector('td b'));
      name=name?name.textContent.trim():'推荐企业';
      row.insertAdjacentHTML('beforeend','<td class="recommend-action-v68"><button type="button" onclick="addNodeCompanyToInvestmentV68(\''+encodeURIComponent(name)+'\',this)">＋ 加入招商名单</button></td>');
    });
  }
  var nodeBody=q('#nodeCompanyRows');
  if(nodeBody)new MutationObserver(function(){setTimeout(decorateNodeRecommendations,120)}).observe(nodeBody,{childList:true});
  var oldSwitch=window.switchNodeCompanyTab;
  if(oldSwitch)window.switchNodeCompanyTab=function(){var r=oldSwitch.apply(this,arguments);setTimeout(decorateNodeRecommendations,160);return r};

  setupModes();
  setupFollowed();
  setTimeout(function(){setupModes();setupFollowed();decorateNodeRecommendations()},300);
})();

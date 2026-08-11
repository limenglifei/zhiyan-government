(function(){
  var servicePattern=/服务|运维|后市场|物流|仓储|检测|认证|金融|咨询|平台/;

  function ensureServiceOption(){
    ['editorNodeType','manualGraphType','graphNodeTypeV47'].forEach(function(id){
      var select=document.getElementById(id);
      if(!select||Array.from(select.options).some(function(option){return option.value==='配套服务'}))return;
      var option=document.createElement('option');
      option.value='配套服务';
      option.textContent='配套服务';
      select.appendChild(option);
    });
  }

  function normalizeServiceNodes(){
    if(typeof graphBuilderNodes==='undefined'||!Array.isArray(graphBuilderNodes))return;
    graphBuilderNodes.forEach(function(node){
      if(node&&servicePattern.test(String(node.name||''))&&(node.type==='一般节点'||node.type==='基础节点'))node.type='配套服务';
    });
  }

  ensureServiceOption();

  var originalRender=window.renderGraphNodes;
  if(typeof originalRender==='function'){
    window.renderGraphNodes=function(){
      ensureServiceOption();
      normalizeServiceNodes();
      return originalRender.apply(this,arguments);
    };
  }

  var originalOpen=window.openGraphBuilder;
  if(typeof originalOpen==='function'){
    window.openGraphBuilder=function(){
      var result=originalOpen.apply(this,arguments);
      ensureServiceOption();
      normalizeServiceNodes();
      if(typeof window.renderGraphNodes==='function')window.renderGraphNodes();
      return result;
    };
  }

  if(typeof prototypeLogicAnnotations!=='undefined'&&prototypeLogicAnnotations.knowledgeList){
    prototypeLogicAnnotations.knowledgeList.interactions.push([
      '产业链节点类型',
      '节点类型新增“配套服务”，用于承载研发设计、检测认证、物流仓储、金融咨询、运维及产业平台等支撑环节。',
      '新建、编辑和 AI 辅助构建时均可使用；名称命中典型服务环节的普通节点自动归类为配套服务，并支持人工修正。'
    ]);
  }
})();
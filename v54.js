(function(){
  var builder=document.getElementById("graphBuilderModal");if(!builder||document.getElementById("graphReferenceTitleV54"))return;
  var tabs=builder.querySelector(".graph-mode-tabs"),aiPanel=document.getElementById("graphAiPanel"),upload=document.querySelector("#graphAiPanel .graph-upload"),fileInput=document.getElementById("graphFileInput"),network=document.querySelector("#graphBuilderModal .graph-network-card-v52"),description=document.getElementById("graphDescriptionV52");
  if(tabs)tabs.remove();
  if(aiPanel){var title=document.createElement("div");title.id="graphReferenceTitleV54";title.className="graph-reference-title-v54";title.innerHTML="<b>参考文件</b><span>选填 · 支持 PDF、Word 产业研究资料</span>";aiPanel.insertBefore(title,aiPanel.firstChild)}
  if(description)description.placeholder="例如：新能源汽车产业链，重点覆盖电池、电驱、电控和车规级芯片";
  if(network&&upload){network.classList.add("graph-network-under-upload-v54");(fileInput||upload).insertAdjacentElement("afterend",network);var text=network.querySelector("div:first-child span");if(text)text.textContent="开启后，结合所选地区的公开信源补充产业链节点与关系"}
  var oldOpen=window.openGraphBuilder;window.openGraphBuilder=function(){var result=oldOpen.apply(this,arguments);if(description)description.placeholder="例如：新能源汽车产业链，重点覆盖电池、电驱、电控和车规级芯片";return result};
  if(typeof prototypeLogicAnnotations!=="undefined"&&prototypeLogicAnnotations.knowledgeList)prototypeLogicAnnotations.knowledgeList.interactions.push(["图谱参考文件与联网补充","图谱描述下方展示“参考文件”模块，上传PDF或Word资料。","不再展示“AI文件构建”模式按钮；联网补充紧随文件上传区域，开启后补充地区公开信源。"])
})();
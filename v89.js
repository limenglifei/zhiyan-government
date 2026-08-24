(function(){
  'use strict';
  function mountCompactMessageLauncher(){
    var launcher=document.getElementById('messageCenterLauncherV88'),user=document.querySelector('.side-user');if(!launcher||!user)return;
    var unread=document.getElementById('messageUnreadV88'),count=unread?unread.textContent:'2';launcher.classList.add('message-center-compact-v89');launcher.setAttribute('aria-label','消息中心');launcher.setAttribute('title','消息中心');launcher.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path><path d="M10 21h4"></path></svg><em id="messageUnreadV88">'+count+'</em><span class="message-tooltip-v89">消息中心</span>';
    user.appendChild(launcher);
  }
  mountCompactMessageLauncher();
  if(typeof prototypeLogicAnnotations!=='undefined')prototypeLogicAnnotations.system.interactions.push(['紧凑消息入口','左侧导航底部账号栏点击铃铛图标。','入口悬浮提示“消息中心”并显示未读数量；点击后在侧栏旁展开审核通知面板。']);
})();

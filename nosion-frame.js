/* ===== 노시언 위젯 공용 프레임 — 드래그 이동 + 8방향 리사이즈 + 위치/크기 저장 ===== */
(function(){
  function init(opts){
    opts = opts || {};
    var card = opts.card || document.querySelector('.card');
    var head = opts.head || card.querySelector('.whead');
    var KEY  = opts.key || 'nosion-frame';
    var MINW = opts.minW || 230, MINH = opts.minH || 210;
    var DEFW = opts.defaultW || 340, DEFH = opts.defaultH || 300;

    // 핸들 주입
    ['n','s','e','w','ne','nw','se','sw'].forEach(function(d){
      var el = document.createElement('div');
      el.className = 'rz ' + d + (d.length===2 ? ' corner' : '');
      el.setAttribute('data-rz', d);
      card.appendChild(el);
    });

    var frame = loadFrame();
    function loadFrame(){
      try { var f = JSON.parse(localStorage.getItem(KEY)); if (f && f.w) return f; } catch(e){}
      var w = Math.min(DEFW, window.innerWidth - 28);
      var h = Math.min(DEFH, window.innerHeight - 28);
      return { x:(window.innerWidth-w)/2, y:Math.max(14,(window.innerHeight-h)/2), w:w, h:h };
    }
    function clampFrame(){
      frame.w = Math.max(MINW, Math.min(frame.w, window.innerWidth - 8));
      frame.h = Math.max(MINH, Math.min(frame.h, window.innerHeight - 8));
      frame.x = Math.max(4, Math.min(frame.x, window.innerWidth - frame.w - 4));
      frame.y = Math.max(4, Math.min(frame.y, window.innerHeight - frame.h - 4));
    }
    function applyFrame(){
      clampFrame();
      card.style.left=frame.x+'px'; card.style.top=frame.y+'px';
      card.style.width=frame.w+'px'; card.style.height=frame.h+'px';
    }
    function saveFrame(){ try{ localStorage.setItem(KEY, JSON.stringify(frame)); }catch(e){} }

    // 드래그 이동 (헤더). 버튼·세그·인터랙션 요소 위에서는 무시
    head.addEventListener('pointerdown', function(e){
      if (e.target.closest('.seg, .ic, .pill, button, input, a, [data-nodrag]')) return;
      startDrag(e);
    });
    card.querySelectorAll('.rz').forEach(function(hd){
      hd.addEventListener('pointerdown', function(e){ startResize(e, hd.getAttribute('data-rz')); });
    });
    function startDrag(e){
      e.preventDefault(); card.classList.add('dragging');
      var sx=e.clientX, sy=e.clientY, ox=frame.x, oy=frame.y;
      function move(ev){ frame.x=ox+(ev.clientX-sx); frame.y=oy+(ev.clientY-sy); applyFrame(); }
      function up(){ card.classList.remove('dragging'); saveFrame(); document.removeEventListener('pointermove',move); document.removeEventListener('pointerup',up); }
      document.addEventListener('pointermove',move); document.addEventListener('pointerup',up);
    }
    function startResize(e, dir){
      e.preventDefault(); e.stopPropagation(); card.classList.add('resizing');
      var sx=e.clientX, sy=e.clientY, o={x:frame.x,y:frame.y,w:frame.w,h:frame.h};
      function move(ev){
        var dx=ev.clientX-sx, dy=ev.clientY-sy;
        if (dir.indexOf('e')>=0){ frame.w=Math.max(MINW,o.w+dx); }
        if (dir.indexOf('s')>=0){ frame.h=Math.max(MINH,o.h+dy); }
        if (dir.indexOf('w')>=0){ var nw=Math.max(MINW,o.w-dx); frame.x=o.x+(o.w-nw); frame.w=nw; }
        if (dir.indexOf('n')>=0){ var nh=Math.max(MINH,o.h-dy); frame.y=o.y+(o.h-nh); frame.h=nh; }
        applyFrame();
      }
      function up(){ card.classList.remove('resizing'); saveFrame(); document.removeEventListener('pointermove',move); document.removeEventListener('pointerup',up); }
      document.addEventListener('pointermove',move); document.addEventListener('pointerup',up);
    }
    window.addEventListener('resize', applyFrame);
    applyFrame();
  }
  window.NosionFrame = { init: init };
})();

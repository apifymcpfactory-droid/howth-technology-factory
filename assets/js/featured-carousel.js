(() => {
  document.querySelectorAll('[data-featured-carousel]').forEach(root=>{
    const slides=[...root.querySelectorAll('[data-featured-slide]')];
    if(slides.length<2)return;
    const controls=root.querySelector('[data-featured-controls]'),toggle=root.querySelector('[data-featured-toggle]');
    controls.hidden=false;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    let active=0,touch=null,timer=null,paused=reduced.matches,inView=true;
    const sync=()=>{
      clearInterval(timer);timer=null;
      toggle.setAttribute('aria-label',paused?'Resume product rotation':'Pause product rotation');
      toggle.setAttribute('aria-pressed',String(paused));toggle.textContent=paused?'▷':'Ⅱ';
      if(!paused&&!document.hidden&&inView&&!root.matches(':hover')&&!root.contains(document.activeElement))timer=setInterval(()=>show(active+1),8000);
    };
    const show=(index,manual=false)=>{
      active=(index+slides.length)%slides.length;
      slides.forEach((slide,i)=>{slide.hidden=i!==active;});
      root.querySelector('[data-featured-count]').textContent=`${active+1} / ${slides.length}`;
      if(manual){paused=true;root.querySelector('[data-featured-announcement]').textContent=`Featured product ${active+1} of ${slides.length}: ${slides[active].getAttribute('aria-label')}`;sync();}
    };
    root.querySelector('[data-featured-previous]').addEventListener('click',()=>show(active-1,true));
    root.querySelector('[data-featured-next]').addEventListener('click',()=>show(active+1,true));
    toggle.addEventListener('click',()=>{paused=!paused;sync();});
    root.addEventListener('mouseenter',sync);root.addEventListener('mouseleave',sync);
    root.addEventListener('focusin',sync);root.addEventListener('focusout',()=>setTimeout(sync,0));
    document.addEventListener('visibilitychange',sync);
    reduced.addEventListener('change',()=>{if(reduced.matches)paused=true;sync();});
    if('IntersectionObserver' in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{threshold:.15}).observe(root);
    root.addEventListener('touchstart',event=>{const point=event.touches[0];touch=point?{x:point.clientX,y:point.clientY}:null;},{passive:true});
    root.addEventListener('touchend',event=>{if(!touch)return;const point=event.changedTouches[0];if(point){const x=point.clientX-touch.x,y=point.clientY-touch.y;if(Math.abs(x)>65&&Math.abs(x)>Math.abs(y)*1.5&&!event.target.closest('button,a'))show(active+(x<0?1:-1),true);}touch=null;},{passive:true});
    sync();
  });
})();

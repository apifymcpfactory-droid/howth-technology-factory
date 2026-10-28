(() => {
  document.querySelectorAll('[data-featured-carousel]').forEach(root=>{
    const slides=[...root.querySelectorAll('[data-featured-slide]')],tabs=[...root.querySelectorAll('[data-featured-tab]')];
    if(slides.length<2||slides.length!==tabs.length)return;
    let active=0,touch=null;
    const controls=root.querySelector('[data-featured-controls]');controls.hidden=false;
    const show=(index,focus=false)=>{
      active=(index+slides.length)%slides.length;
      slides.forEach((slide,i)=>{slide.hidden=i!==active;});
      tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===active));tab.tabIndex=i===active?0:-1;});
      root.querySelector('[data-featured-count]').textContent=`${active+1} / ${slides.length}`;
      root.querySelector('[data-featured-announcement]').textContent=`Featured product ${active+1} of ${slides.length}: ${tabs[active].textContent.trim()}`;
      const strip=tabs[active].parentElement,tab=tabs[active],left=tab.offsetLeft-strip.offsetLeft;
      if(left<strip.scrollLeft)strip.scrollLeft=left;
      else if(left+tab.offsetWidth>strip.scrollLeft+strip.clientWidth)strip.scrollLeft=left+tab.offsetWidth-strip.clientWidth;
      if(focus)tab.focus({preventScroll:true});
    };
    root.querySelector('[data-featured-previous]').addEventListener('click',()=>show(active-1));
    root.querySelector('[data-featured-next]').addEventListener('click',()=>show(active+1));
    tabs.forEach((tab,i)=>tab.addEventListener('click',()=>show(i)));
    root.querySelector('[role=tablist]').addEventListener('keydown',event=>{
      if(event.ctrlKey||event.metaKey||event.altKey)return;
      const key=event.key;if(!['ArrowLeft','ArrowRight','Home','End'].includes(key))return;
      event.preventDefault();show(key==='Home'?0:key==='End'?slides.length-1:active+(key==='ArrowRight'?1:-1),true);
    });
    root.addEventListener('touchstart',event=>{const point=event.touches[0];touch=point?{x:point.clientX,y:point.clientY}:null;},{passive:true});
    root.addEventListener('touchend',event=>{if(!touch)return;const point=event.changedTouches[0];if(point){const x=point.clientX-touch.x,y=point.clientY-touch.y;if(Math.abs(x)>65&&Math.abs(x)>Math.abs(y)*1.5&&!event.target.closest('button,a'))show(active+(x<0?1:-1));}touch=null;},{passive:true});
    // Manual browsing: no timers, automatic rotation, new analytics or external dependencies.
  });
})();

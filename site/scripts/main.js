(() => {
 const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
 const header = document.querySelector('[data-header]');
 const menu = document.querySelector('.menu-toggle');
 const mobileNav = document.getElementById('mobile-nav');
 const closeMenu = () => {if(!menu)return;menu.setAttribute('aria-expanded','false');menu.querySelector('span').textContent='Menu';mobileNav.hidden=true;};
 menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.querySelector('span').textContent=open?'Close':'Menu';mobileNav.hidden=!open;});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
 document.addEventListener('click',event=>{if(menu?.getAttribute('aria-expanded')==='true'&&!header.contains(event.target))closeMenu();});
 mobileNav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
 window.matchMedia('(min-width: 761px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
 let scrolling=false;
 const scroll=()=>{header?.classList.toggle('is-sticky',window.scrollY>90);scrolling=false;};
 window.addEventListener('scroll',()=>{if(!scrolling){requestAnimationFrame(scroll);scrolling=true;}},{passive:true});scroll();
 if(!reduced.matches&&'IntersectionObserver'in window){
  document.documentElement.classList.add('js-motion');
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px 30px 0px'});
  document.querySelectorAll('.reveal').forEach(item=>observer.observe(item));
 }
 reduced.addEventListener('change',event=>{if(event.matches)document.documentElement.classList.remove('js-motion');});
 const descriptions={environment:'Surgical sensing must contend with motion, fluid and signals from surrounding instruments.',challenge:'The engineering challenge is separating useful vascular information from interference in a compact, usable instrument.',goal:'Our goal is an actionable sensing signal within a familiar workflow. Performance remains to be established through testing.'};
 document.querySelectorAll('[data-signal-story]').forEach(story=>{
  story.dataset.state='environment';
  story.querySelectorAll('[data-signal-state]').forEach(button=>button.addEventListener('click',()=>{
   story.dataset.state=button.dataset.signalState;
   story.querySelectorAll('[data-signal-state]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
   story.querySelector('.signal-description').textContent=descriptions[button.dataset.signalState];
  }));
 });
 const stage=document.querySelector('[data-instrument-stage]');
 const tabs=[...document.querySelectorAll('[data-instrument-tab]')];
 const selectTab=(key,focus=false)=>{
  if(!stage)return;stage.dataset.focus=key;
  tabs.forEach(tab=>{const active=tab.dataset.instrumentTab===key;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;document.getElementById(tab.getAttribute('aria-controls')).hidden=!active;if(active&&focus)tab.focus();});
  document.querySelectorAll('[data-hotspot]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.hotspot===key)));
 };
 tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectTab(tab.dataset.instrumentTab));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(index+1)%tabs.length;if(e.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();selectTab(tabs[next].dataset.instrumentTab,true);}});});
 document.querySelectorAll('[data-hotspot]').forEach(button=>button.addEventListener('click',()=>selectTab(button.dataset.hotspot)));
 const dialog=document.getElementById('research-dialog');
 document.querySelectorAll('[data-open-research]').forEach(button=>button.addEventListener('click',()=>dialog?.showModal()));
 dialog?.querySelector('[data-close-dialog]')?.addEventListener('click',()=>dialog.close());
 dialog?.addEventListener('click',event=>{const rect=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))dialog.close();});
 document.querySelectorAll('[data-copy-email]').forEach(button=>button.addEventListener('click',async()=>{const status=button.closest('.contact-card').querySelector('[role=status]');try{await navigator.clipboard.writeText(button.dataset.copyEmail);status.textContent='Email address copied.';button.textContent='Copied';}catch{status.textContent='Select the email address to copy it, or open it in your email app.';}setTimeout(()=>{button.textContent='Copy';},2500);}));
})();

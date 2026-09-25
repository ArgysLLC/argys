(() => {
 const canvas=document.getElementById('signal-field');if(!canvas)return;
 const context=canvas.getContext('2d');if(!context)return;
 const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
 const button=document.querySelector('[data-motion-toggle]');
 let width=0,height=0,dpr=1,raf=0,time=0,last=0,userPaused=false,inView=true;
 const small=()=>width<760;
 const particles=Array.from({length:1450},(_,i)=>({u:(i*.61803398875)%1,v:(Math.sin(i*127.1+311.7)*43758.5453)%1+.5,band:i%7,size:.65+(i%5)*.18})).map(p=>({...p,v:((p.v%1)+1)%1}));
 const position=(u,v,band,t)=>{
  const angle=u*Math.PI*2+t*.075;
  const radius=100+v*210;
  const twist=angle+Math.sin(v*5+t*.16)*.26;
  const x=Math.cos(twist)*radius;
  const y=Math.sin(twist)*radius*.72;
  const z=Math.sin(angle*2+v*3+t*.2)*85+Math.cos(angle)*60;
  const perspective=760/(760+z);
  const scale=Math.min(width/1250,height/780)*(small()?1.7:1.35);
  return {x:width*(small()?.78:.77)+(x*.96+y*.37)*perspective*scale,y:height*(small()?.55:.51)+(y*.92-x*.22)*perspective*scale,depth:perspective,alpha:.15+.7*((z+150)/300)};
 };
 function draw(){
  context.clearRect(0,0,width,height);
  const glow=context.createRadialGradient(width*.77,height*.48,10,width*.77,height*.48,width*.5);
  glow.addColorStop(0,'rgba(24,89,132,.32)');glow.addColorStop(.55,'rgba(15,60,90,.1)');glow.addColorStop(1,'rgba(6,24,40,0)');context.fillStyle=glow;context.fillRect(0,0,width,height);
  // Abstract flowing signal field; this is not anatomical or measured data.
  for(let ring=0;ring<13;ring++){
   context.beginPath();
   for(let j=0;j<=120;j++){
    const p=position(j/120,ring/13,ring,time);j?context.lineTo(p.x,p.y):context.moveTo(p.x,p.y);
   }
   context.strokeStyle=`rgba(83,162,205,${.035+ring*.004})`;context.lineWidth=.6;context.stroke();
  }
  for(const particle of particles){
   const u=(particle.u+time*(.004+particle.band*.0008))%1;
   const p=position(u,particle.v,particle.band,time);
   const bright=(Math.sin(u*12+time*.5)+1)*.5;
   context.beginPath();context.arc(p.x,p.y,particle.size*p.depth*(bright*.4+.8),0,Math.PI*2);context.fillStyle=`rgba(${140+Math.round(bright*75)},${194+Math.round(bright*40)},242,${Math.max(.08,p.alpha*(.5+bright*.4))})`;context.fill();
  }
 }
 function animate(now){raf=0;if(!last)last=now;time+=Math.min((now-last)/1000,.05);last=now;draw();if(!userPaused&&!preference.matches&&inView&&!document.hidden)raf=requestAnimationFrame(animate);}
 function sync(){
  cancelAnimationFrame(raf);raf=0;last=0;
  const paused=userPaused||preference.matches;
  document.documentElement.classList.toggle('motion-paused',paused);
  if(button){button.setAttribute('aria-pressed',String(paused));button.querySelector('[data-motion-label]').textContent=preference.matches?'Reduced motion':paused?'Play motion':'Pause motion';button.querySelector('[data-motion-icon]').textContent=paused?'▷':'Ⅱ';button.disabled=preference.matches;}
  draw();if(!paused&&inView&&!document.hidden)raf=requestAnimationFrame(animate);
 }
 function resize(){const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);context.setTransform(dpr,0,0,dpr,0,0);draw();}
 new ResizeObserver(resize).observe(canvas);resize();
 new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{threshold:0}).observe(canvas);
 document.addEventListener('visibilitychange',sync);preference.addEventListener('change',sync);
 button?.addEventListener('click',()=>{userPaused=!userPaused;sync();});sync();
})();

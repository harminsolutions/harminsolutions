'use strict';
const $=(selector)=>document.querySelector(selector);
const welcome=$('#welcome');
const enter=$('#enterSite');
const skip=$('#skipIntro');
const menuButton=$('#menuButton');
const mobileNav=$('#mobileNav');
const header=$('#header');
const progress=$('#scrollProgress');
const accordion=$('#serviceAccordion');
function dismissWelcome(){welcome.classList.add('hidden');welcome.setAttribute('aria-hidden','true');document.body.classList.remove('intro-open');enter.blur();}
document.body.classList.add('intro-open');
enter?.addEventListener('click',dismissWelcome);
skip?.addEventListener('click',dismissWelcome);
welcome?.addEventListener('keydown',event=>{if(event.key==='Escape'){dismissWelcome();}});
function setMenu(open){menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');mobileNav.classList.toggle('open',open);mobileNav.inert=!open;document.body.style.overflow=open?'hidden':'';}
menuButton?.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
mobileNav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuButton?.getAttribute('aria-expanded')==='true'){setMenu(false);menuButton.focus();}});
window.addEventListener('resize',()=>{if(window.innerWidth>1020&&menuButton.getAttribute('aria-expanded')==='true')setMenu(false);});
function onScroll(){header.classList.toggle('scrolled',scrollY>26);const height=document.documentElement.scrollHeight-innerHeight;progress.style.width=(height>0?(scrollY/height)*100:0)+'%';}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}},{threshold:.1,rootMargin:'0px 0px -30px 0px'});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}else{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));}
// Motion-aware, accessible accordion: smooth expansion and collapse without the native jump.
if(accordion){
  const services=[...accordion.querySelectorAll('details.service')];
  const animations=new WeakMap();
  const intended=new WeakMap();
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const syncState=item=>{const summary=item.querySelector('summary');if(summary)summary.setAttribute('aria-expanded',String(item.open));};
  function setService(item,shouldOpen){
    const panel=item.querySelector('.service-body');
    if(!panel)return;
    intended.set(item,shouldOpen);
    const current=animations.get(item);
    if(current){current.cancel();animations.delete(item);}
    if(reducedMotion.matches){item.open=shouldOpen;panel.style.height='';panel.style.opacity='';syncState(item);return;}
    // Establish the start height while the element is still in the document.
    const start=item.open?panel.getBoundingClientRect().height:0;
    if(shouldOpen)item.open=true;
    const end=shouldOpen?panel.scrollHeight:0;
    panel.style.overflow='hidden';
    const animation=panel.animate([
      {height:start+'px',opacity:shouldOpen?0:1},
      {height:end+'px',opacity:shouldOpen?1:0}
    ],{duration:shouldOpen?460:340,easing:'cubic-bezier(.22,.8,.22,1)'});
    animations.set(item,animation);
    animation.onfinish=()=>{
      if(animations.get(item)!==animation)return;
      if(!shouldOpen)item.open=false;
      animations.delete(item);
      panel.style.height='';panel.style.opacity='';panel.style.overflow='';
      syncState(item);
    };
    animation.oncancel=()=>{if(animations.get(item)===animation)animations.delete(item);};
    syncState(item);
  }
  services.forEach(item=>{
    syncState(item);
    item.querySelector('summary')?.addEventListener('click',event=>{
      event.preventDefault();
      const openItem=!(intended.has(item)?intended.get(item):item.open);
      if(openItem) services.forEach(other=>{if(other!==item&&(intended.has(other)?intended.get(other):other.open))setService(other,false);});
      setService(item,openItem);
    });
  });
}

$('#year').textContent=new Date().getFullYear();

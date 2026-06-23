// Centralized site scripts (nav, mobile menu, observers, faq)
// Nav scroll
window.addEventListener('scroll',()=>{
  const nav=document.getElementById('nav');
  if(nav) nav.classList.toggle('sc',window.scrollY>30);
});

// Mobile menu
let mo=false;
function tmenu(){mo=!mo;const h=document.getElementById('hbg'), m=document.getElementById('mob'); if(h)h.classList.toggle('op',mo); if(m)m.classList.toggle('op',mo);document.body.style.overflow=mo?'hidden':''}
function cmenu(){mo=false;const h=document.getElementById('hbg'), m=document.getElementById('mob'); if(h)h.classList.remove('op'); if(m)m.classList.remove('op');document.body.style.overflow=''}
window.addEventListener('resize',()=>{if(window.innerWidth>1024)cmenu();});

// Fade-up
const obs=new IntersectionObserver(entries=>entries.forEach(x=>{if(x.isIntersecting)x.target.classList.add('vis')}),{threshold:.06,rootMargin:'0px 0px -14px 0px'});
document.querySelectorAll('.fu').forEach(el=>obs.observe(el));

// FAQ
function faq(btn){
  const op=btn.classList.contains('op');
  document.querySelectorAll('.faq-q').forEach(q=>{q.classList.remove('op');if(q.nextElementSibling)q.nextElementSibling.classList.remove('op');});
  if(!op){btn.classList.add('op');if(btn.nextElementSibling)btn.nextElementSibling.classList.add('op');}
}

// Form Submission Handler - Attach after small delay to ensure DOM is ready
function attachFormHandlers(){
  const submitButtons = document.querySelectorAll('button.fsub');
  console.log('Found submit buttons:', submitButtons.length);
  
  submitButtons.forEach(btn=>{
    btn.addEventListener('click',(e)=>{
      e.preventDefault();
      
      // Get parent container with form inputs
      const container = btn.closest('.hform') || btn.closest('div[style*="background"]') || btn.parentElement;
      
      if(!container){
        console.warn('Could not find form container');
        return;
      }
      
      // Collect form data for validation
      const inputs = container.querySelectorAll('input[type="email"], input[type="tel"], input[type="text"]');
      
      // Simple validation - at least email or phone should be filled
      let hasEmail = false, hasPhone = false;
      inputs.forEach(input=>{
        if(input.type === 'email' && input.value.trim()) hasEmail = true;
        if(input.type === 'tel' && input.value.trim()) hasPhone = true;
      });
      
      if(hasEmail || hasPhone){
        // Add loading state
        btn.style.opacity = '0.7';
        btn.style.pointerEvents = 'none';
        const originalText = btn.textContent;
        btn.textContent = '⏳ Submitting...';
        
        // Simulate form submission delay
        setTimeout(()=>{
          window.location.href='thank-you.html';
        },600);
      } else {
        alert('Please fill in at least an email or phone number');
      }
    });
  });
}

// Wait for DOM and fragments to load
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', attachFormHandlers);
} else {
  setTimeout(attachFormHandlers, 100);
}

/* Testimonials Carousel: convert test-grid -> carousel when more than 3 cards */
function injectCarouselStyles(){
  if(document.getElementById('tc-styles')) return;
  const css=`
  .car-container{overflow:hidden;border-radius:var(--r);}
  .car-track{display:flex;gap:24px;transition:transform .45s ease}
  .car-slide{flex:0 0 33.333%;min-width:0}
  .car-btn{position:relative;margin-top:12px;padding:8px 12px;border-radius:6px;border:none;background:var(--b2);color:#fff;cursor:pointer}
  .car-dots{display:flex;justify-content:center;gap:8px;margin-top:14px}
  .car-dot{width:8px;height:8px;border-radius:50%;background:var(--bdr);cursor:pointer}
  .car-dot.active{background:var(--b2)}
  @media(max-width:1024px){.car-slide{flex:0 0 50%}}
  @media(max-width:640px){.car-slide{flex:0 0 100%}}
  `;
  const s=document.createElement('style');s.id='tc-styles';s.appendChild(document.createTextNode(css));document.head.appendChild(s);
}

function initTestimonialsCarousel(){
  injectCarouselStyles();
  document.querySelectorAll('.test-grid').forEach(grid=>{
    // avoid double-init
    if(grid.dataset.tcInit) return;
    const cards = Array.from(grid.querySelectorAll('.test-card'));
    if(cards.length <= 3) return;
    grid.dataset.tcInit = '1';

    // build carousel structure
    const carWrap = document.createElement('div');
    carWrap.className = 'car-wrap';
    const container = document.createElement('div'); container.className = 'car-container';
    const track = document.createElement('div'); track.className = 'car-track';

    cards.forEach(card=>{
      const slide = document.createElement('div'); slide.className = 'car-slide';
      slide.appendChild(card);
      track.appendChild(slide);
    });

    container.appendChild(track);
    carWrap.appendChild(container);

    // controls
    const prev = document.createElement('button'); prev.className='car-btn prev'; prev.textContent='‹';
    const next = document.createElement('button'); next.className='car-btn next'; next.textContent='›';
    carWrap.appendChild(prev); carWrap.appendChild(next);

    // dots
    const dots = document.createElement('div'); dots.className='car-dots';
    cards.forEach((_,i)=>{const d=document.createElement('div');d.className='car-dot';d.dataset.index=i; dots.appendChild(d)});
    carWrap.appendChild(dots);

    // replace original grid with carousel
    grid.parentNode.replaceChild(carWrap, grid);

    // state
    let pos = 0; const total = cards.length;
    let interval = null;
    let isPaused = false;

    function getSlidePct(){const w=window.innerWidth; return w>=1024?33.333: w>=640?50:100}

    function update(){
      const pct = getSlidePct();
      track.style.transform = `translateX(-${pos * pct}%)`;
      dots.querySelectorAll('.car-dot').forEach((d,i)=>d.classList.toggle('active', i===pos));
    }

    function nextSlide(){ pos = (pos+1)%total; update(); }
    function prevSlide(){ pos = (pos-1+total)%total; update(); }

    next.addEventListener('click', ()=>{ nextSlide(); resetAuto(); });
    prev.addEventListener('click', ()=>{ prevSlide(); resetAuto(); });
    dots.querySelectorAll('.car-dot').forEach(d=>d.addEventListener('click', e=>{ pos = Number(e.target.dataset.index); update(); resetAuto(); }));

    function startAuto(){ if(interval) clearInterval(interval); if(!isPaused) interval = setInterval(nextSlide,4000); }
    function stopAuto(){ if(interval) clearInterval(interval); interval = null; }
    function resetAuto(){ stopAuto(); startAuto(); }

    // pause on hover/focus
    const pauseTargets = [container, track, carWrap];
    pauseTargets.forEach(el=>{
      el.addEventListener('mouseenter', ()=>{ isPaused = true; stopAuto(); });
      el.addEventListener('mouseleave', ()=>{ isPaused = false; startAuto(); });
      el.addEventListener('focusin', ()=>{ isPaused = true; stopAuto(); });
      el.addEventListener('focusout', ()=>{ isPaused = false; startAuto(); });
    });

    // basic touch-swipe support
    let startX = 0, currentX = 0, isTouching = false;
    const threshold = 50;

    container.addEventListener('touchstart', (ev)=>{
      if(!ev.touches || !ev.touches.length) return;
      isTouching = true; startX = ev.touches[0].clientX; currentX = startX; isPaused = true; stopAuto();
    }, {passive:true});

    container.addEventListener('touchmove', (ev)=>{
      if(!isTouching || !ev.touches || !ev.touches.length) return;
      currentX = ev.touches[0].clientX;
    }, {passive:true});

    container.addEventListener('touchend', ()=>{
      if(!isTouching) return;
      const dx = currentX - startX;
      if(Math.abs(dx) > threshold){ if(dx < 0) nextSlide(); else prevSlide(); }
      isTouching = false; isPaused = false; resetAuto();
    });

    window.addEventListener('resize', update);
    update(); startAuto();
  });
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', ()=>{ initTestimonialsCarousel(); });
} else { setTimeout(initTestimonialsCarousel, 200); }

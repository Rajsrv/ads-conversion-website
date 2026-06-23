// Load header/footer fragments and then load main.js
(async function(){
  const include = async (sel, url) => {
    try{
      const res = await fetch(url);
      if(!res.ok) throw new Error(res.statusText);
      const html = await res.text();
      document.querySelectorAll(sel).forEach(el=>{el.innerHTML = html});
    }catch(e){console.error('Include failed',url,e)}
  }

  // Insert placeholders if not present
  if(!document.querySelector('[data-include="header.html"]')){
    const h = document.createElement('div'); h.setAttribute('data-include','header.html'); document.body.prepend(h);
  }
  if(!document.querySelector('[data-include="footer.html"]')){
    const f = document.createElement('div'); f.setAttribute('data-include','footer.html'); document.body.append(f);
  }

  await Promise.all([
    include('[data-include="header.html"]','header.html'),
    include('[data-include="footer.html"]','footer.html')
  ]);

  // Ensure viewport meta tag for responsive design
  if(!document.querySelector('meta[name="viewport"]')){
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0';
    document.head.appendChild(meta);
  }

  // After fragments are injected, load main.js
  const s = document.createElement('script');
  s.src = 'main.js';
  document.body.appendChild(s);
})();

(function(){
  const root = document.documentElement;
  const themeBtns = document.querySelectorAll('.theme-btn');
  const metaTheme = document.querySelector('#meta-theme-color');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const toTop = document.getElementById('to-top');
  const progress = document.querySelector('.scroll-progress');

  // Theme management
  const THEME_KEY = 'site-theme-preference';
  function getSystemTheme(){
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme(mode){
    let theme = mode;
    if (mode === 'system'){ theme = getSystemTheme(); }
    document.body.setAttribute('data-theme', theme === 'light' ? 'light' : '');
    // update theme button state
    themeBtns.forEach(b => b.classList.toggle('active', b.dataset.theme === mode));
    // update meta theme-color for address bar
    metaTheme.setAttribute('content', theme === 'dark' ? '#0b0d12' : '#ffffff');
  }
  const saved = localStorage.getItem(THEME_KEY) || 'system';
  applyTheme(saved);
  themeBtns.forEach(btn => btn.addEventListener('click', () => {
    const mode = btn.dataset.theme;
    localStorage.setItem(THEME_KEY, mode);
    applyTheme(mode);
  }));
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if ((localStorage.getItem(THEME_KEY) || 'system') === 'system') applyTheme('system');
  });

  // Mobile nav
  navToggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));

  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  // Scroll progress and back-to-top
  function onScroll(){
    const sTop = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const p = Math.max(0, Math.min(1, sTop / (docH || 1)));
    progress.style.transform = `scaleX(${p})`;
    toTop.classList.toggle('show', sTop > 600);
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
  toTop?.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

  // Reveal on view
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }});
  }, {threshold: 0.15});
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Tilt effect on cards and stats
  function addTilt(el){
    const strength = 10;
    function move(e){
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-py*strength).toFixed(2)}deg) rotateY(${(px*strength).toFixed(2)}deg)`;
    }
    function reset(){ el.style.transform = 'perspective(900px) rotateX(0) rotateY(0)'; }
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', reset);
  }

  // Counters animate
  function animateCounter(el, to){
    const start = 0; const duration = 1400; const t0 = performance.now();
    function frame(t){
      const k = Math.min(1, (t - t0)/duration);
      const val = Math.floor(start + (to - start) * (1 - Math.pow(1 - k, 3)));
      el.textContent = val.toLocaleString();
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // map social name to inline icon SVG
  function getSocialIcon(name){
    const n = (name || '').toLowerCase();
    if (n.includes('facebook')){
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 4.99 3.66 9.14 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34v7.03C18.34 21.2 22 17.05 22 12.06z"/></svg>`;
    }
    if (n.includes('instagram')){
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm5.75-3.25a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z"/></svg>`;
    }
    if (n.includes('linkedin')){
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4zM8 8h3.8v2.2h.06c.53-1 1.82-2.2 3.75-2.2 4 0 4.74 2.6 4.74 6V24h-4v-5.6c0-1.34 0-3.06-1.87-3.06-1.88 0-2.16 1.47-2.16 2.96V24H8z"/></svg>`;
    }
    if (n.includes('x') || n.includes('twitter')){
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2H21.5l-7.64 8.73L22.5 22h-6.21l-4.86-6.11L5.9 22H2.64l8.18-9.35L2 2h6.31l4.38 5.57L18.24 2zm-1.09 18h1.68L7.05 4h-1.7l11.8 16z"/></svg>`;
    }
    if (n.includes('wikipedia')){
      return `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 4h4l2.9 7.3L13.7 4H21l-1 2h-3.2l-3.9 9.5L9.2 9.6 6.6 16H3.2L2 14h3l2.8-6.7L5.3 6H3.8z"/></svg>`;
    }
    return '↗';
  }

  // Dynamic content loader
  async function loadContent(){
    try{
      const res = await fetch('./content.json', {cache:'no-cache'});
      const data = await res.json();

      // Title & brand
      document.title = data.siteTitle || 'Personal Website';
      document.getElementById('site-title').textContent = data.siteTitle || 'Personal Website';
      document.getElementById('brand-text').textContent = data.brand || data.person?.name || 'Site';
      document.getElementById('hero-name').textContent = data.person?.name || 'Your Name';
      document.getElementById('hero-role').textContent = [data.person?.role, data.person?.domain, data.person?.location].filter(Boolean).join(' • ') || 'Role • Domain • Location';
      document.getElementById('hero-bio').textContent = data.person?.bio || 'Short bio will appear here from content.json';

      // About
      document.getElementById('about-heading').textContent = data.about?.heading || 'Biography';
      document.getElementById('about-text').textContent = data.about?.text || '';
      const factsUl = document.getElementById('about-facts');
      factsUl.innerHTML = '';
      (data.about?.facts || []).forEach(f => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${f.title || ''}</strong><br/><span>${f.text || ''}</span>`;
        factsUl.appendChild(li);
      });

      // Socials grid (replaces old stats)
      const socialsGrid = document.getElementById('socials-grid');
      socialsGrid.innerHTML = '';
      (data.socials || data.contact?.socials || []).forEach(s => {
        const card = document.createElement('div');
        card.className = 'social-card reveal';
        const icon = getSocialIcon(s.name);
        card.innerHTML = `
          <div class="social-icon" aria-hidden="true">${icon}</div>
          <div class="social-title">${s.name}</div>
          <p class="social-hint">Open profile</p>
          <a href='${s.url}' target='_blank' rel='noopener'>${s.name}</a>
        `;
        socialsGrid.appendChild(card);
        io.observe(card);
        addTilt(card);
      });

      // Work items
      const cards = document.getElementById('work-cards');
      cards.innerHTML = '';
      (data.work || []).forEach(w => {
        const div = document.createElement('article');
        div.className = 'card reveal';
        div.dataset.type = w.type || 'project';
        div.innerHTML = `
          <div class="card-media" aria-hidden="true"></div>
          <div class="card-body">
            <h3 class="card-title">${w.title || ''}</h3>
            <p class="card-sub">${w.subtitle || ''}</p>
            <p class="card-desc">${w.description || ''}</p>
            <div class="card-tags">${(w.tags||[]).map(t=>`<span class='tag'>${t}</span>`).join('')}</div>
          </div>
          <div class="card-actions">${w.link ? `<a class='btn' href='${w.link}' target='_blank' rel='noopener'>Open</a>`:''}</div>
        `;
        cards.appendChild(div);
        io.observe(div);
        addTilt(div);
      });

      // Filters
      const filterButtons = document.querySelectorAll('#work-filters .chip');
      filterButtons.forEach(b => b.addEventListener('click', ()=>{
        filterButtons.forEach(x=>x.classList.remove('is-active'));
        b.classList.add('is-active');
        const f = b.dataset.filter;
        cards.querySelectorAll('.card').forEach(c => {
          const show = f === 'all' || c.dataset.type === f;
          c.style.display = show ? '' : 'none';
        });
      }));

      // Publications
      const pubList = document.getElementById('pub-list');
      pubList.innerHTML = '';
      (data.publications || []).forEach(p => {
        const li = document.createElement('li');
        li.className = 'pub-item reveal';
        li.innerHTML = p.url ? `<a href='${p.url}' target='_blank' rel='noopener'>${p.title}</a> <span aria-hidden='true'>·</span> <span>${p.venue||''} ${p.year||''}</span>` : `${p.title}`;
        pubList.appendChild(li);
        io.observe(li);
      });

      // Contact
      document.getElementById('contact-blurb').textContent = data.contact?.blurb || document.getElementById('contact-blurb').textContent;
      const email = data.contact?.email;
      const emailBtn = document.getElementById('contact-email');
      if (email){ emailBtn.href = `mailto:${email}`; emailBtn.textContent = 'Email me'; }
      const socials = document.getElementById('socials');
      socials.innerHTML = '';
      (data.contact?.socials || []).forEach(s => {
        const a = document.createElement('a');
        a.href = s.url; a.target = '_blank'; a.rel = 'noopener'; a.title = s.name; a.ariaLabel = s.name;
        a.innerHTML = getSocialIcon(s.name);
        socials.appendChild(a);
      });

      // Footer
      document.getElementById('year').textContent = new Date().getFullYear();
      document.getElementById('footer-name').textContent = data.person?.name || 'Your Name';
      const footerLinks = document.getElementById('footer-links');
      footerLinks.innerHTML = '';
      (data.footerLinks || []).forEach(l => {
        const a = document.createElement('a'); a.href = l.url; a.textContent = l.label; a.target = '_blank'; a.rel = 'noopener';
        footerLinks.appendChild(a);
      });
    } catch(e){
      console.error('Failed to load content.json', e);
    }
  }
  loadContent();
})();
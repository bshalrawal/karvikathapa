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

      // Stats
      const statsWrap = document.getElementById('stats');
      statsWrap.innerHTML = '';
      (data.stats || []).forEach(s => {
        const card = document.createElement('div');
        card.className = 'stat-card reveal';
        card.innerHTML = `<div class="stat-value" data-target="${s.value || 0}">0</div><div class="stat-label">${s.label || ''}</div>`;
        statsWrap.appendChild(card);
        io.observe(card);
        addTilt(card);
        const valueEl = card.querySelector('.stat-value');
        const observer = new IntersectionObserver((es)=>{
          es.forEach(en => { if (en.isIntersecting){ animateCounter(valueEl, Number(valueEl.dataset.target) || 0); observer.disconnect(); } });
        }, {threshold: .6});
        observer.observe(card);
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
        a.textContent = s.icon || '↗';
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
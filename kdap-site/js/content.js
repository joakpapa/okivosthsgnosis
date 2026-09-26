/**
 * Διαβάζει τα αρχεία περιεχομένου (content/*.json) — τα ίδια αρχεία που
 * επεξεργάζεται ο πίνακας διαχείρισης (/admin) — και γεμίζει τη σελίδα.
 * Έτσι, όταν κάποιος αποθηκεύσει αλλαγές στο CMS, εμφανίζονται αυτόματα εδώ.
 */
async function loadJSON(path){
  try{
    const res = await fetch(path + '?v=' + Date.now()); // αποφυγή cache
    return await res.json();
  }catch(err){
    console.error('Δεν φόρτωσε το περιεχόμενο:', path, err);
    return null;
  }
}

async function renderHomeContent(){
  const el = document.getElementById('heroTitle');
  if(!el) return; // δεν είμαστε στην αρχική
  const data = await loadJSON('content/home.json');
  if(!data) return;
  document.getElementById('heroEyebrow').textContent = data.heroEyebrow;
  document.getElementById('heroTitle').textContent = data.heroTitle;
  document.getElementById('heroSubtitle').textContent = data.heroSubtitle;
  document.getElementById('heroCtaText').textContent = data.heroCtaText;
  document.getElementById('statYears').textContent = data.statYears;
  document.getElementById('statKids').textContent = data.statKids;
  document.getElementById('statActivities').textContent = data.statActivities;
  const heroImg = document.getElementById('heroImg');
  if(heroImg && data.heroImage) heroImg.src = data.heroImage;
}

async function renderAbout(){
  const img = document.getElementById('aboutImg');
  if(!img) return; // δεν είμαστε στη σελίδα "Ποιοι Είμαστε"
  const data = await loadJSON('content/about.json');
  if(!data) return;
  if(data.aboutImage) img.src = data.aboutImage;
}

async function renderGallery(){
  const gal = document.getElementById('galleryList');
  if(!gal) return; // δεν είμαστε στη σελίδα δραστηριοτήτων
  const data = await loadJSON('content/gallery.json');
  if(!data) return;
  gal.innerHTML = data.items.map(g => `
    <button data-full="${g.image}" data-alt="${g.alt}">
      <img src="${g.image}" alt="${g.alt}" loading="lazy">
    </button>`).join('');
  initGalleryLightbox(); // ενεργοποίηση του lightbox πάνω στα νέα στοιχεία
}

async function renderNews(){
  const list = document.getElementById('newsList');
  if(!list) return; // δεν είμαστε στη σελίδα ανακοινώσεων
  const data = await loadJSON('content/news.json');
  if(!data) return;
  const items = [...data.items].sort((a,b) => new Date(b.date) - new Date(a.date));
  const fmt = d => new Date(d).toLocaleDateString('el-GR', { year:'numeric', month:'long', day:'numeric' });
  list.innerHTML = items.length ? items.map(n => `
    <div class="card reveal news-item">
      <span class="news-date">${fmt(n.date)}</span>
      <h3>${n.title}</h3>
      <p>${n.text}</p>
    </div>`).join('') : '<p>Δεν υπάρχουν ανακοινώσεις αυτή τη στιγμή.</p>';
  initScrollReveal();
}

async function renderActivities(){
  const grid = document.getElementById('activitiesGrid');
  if(!grid) return; // δεν είμαστε στη σελίδα δραστηριοτήτων
  const data = await loadJSON('content/activities.json');
  if(!data) return;
  grid.innerHTML = data.items.map(a => `
    <div class="card reveal">
      <div class="icon">${a.icon}</div>
      <h3>${a.name}</h3>
      <p>${a.desc}</p>
    </div>`).join('');
  initScrollReveal(); // επανενεργοποίηση animation για τα νέα στοιχεία
}

async function renderFaq(){
  const list = document.getElementById('faqList');
  if(!list) return; // δεν είμαστε στη σελίδα με FAQ
  const data = await loadJSON('content/faq.json');
  if(!data) return;
  list.innerHTML = data.items.map(f => `
    <div class="faq-item" data-open="false">
      <button class="faq-q">${f.q} <span class="plus">+</span></button>
      <div class="faq-a"><p>${f.a}</p></div>
    </div>`).join('');
  initFaqAccordion(); // ενεργοποίηση του accordion πάνω στα νέα στοιχεία
}

/* ---------- Blog: λίστα άρθρων ---------- */
async function renderBlog(){
  const grid = document.getElementById('blogList');
  if(!grid) return; // δεν είμαστε στη σελίδα blog listing
  const data = await loadJSON('content/blog.json');
  if(!data) return;
  const items = [...data.items].sort((a,b) => new Date(b.date) - new Date(a.date));
  const fmt = d => new Date(d).toLocaleDateString('el-GR', { year:'numeric', month:'long', day:'numeric' });
  grid.innerHTML = items.length ? items.map(post => `
    <a href="blog-post.html?slug=${post.slug}" class="blog-card reveal">
      <img src="${post.image}" alt="${post.title}" loading="lazy">
      <div class="blog-card-body">
        <span class="blog-card-date">${fmt(post.date)}</span>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
        <span class="blog-card-cta">Διαβάστε περισσότερα →</span>
      </div>
    </a>`).join('') : '<p>Δεν υπάρχουν ακόμα άρθρα στο ιστολόγιο.</p>';
  initScrollReveal();
}

/* ---------- Blog: μεμονωμένο άρθρο ---------- */
async function renderBlogPost(){
  const body = document.getElementById('postBody');
  if(!body) return; // δεν είμαστε στη σελίδα blog-post
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if(!slug){ body.innerHTML = '<p>Δεν βρέθηκε το άρθρο. <a href="blog.html">Πίσω στο ιστολόγιο</a></p>'; return; }
  const data = await loadJSON('content/blog.json');
  if(!data){ body.innerHTML = '<p>Σφάλμα φόρτωσης.</p>'; return; }
  const post = data.items.find(p => p.slug === slug);
  if(!post){ body.innerHTML = '<p>Το άρθρο δεν βρέθηκε. <a href="blog.html">Πίσω στο ιστολόγιο</a></p>'; return; }

  const fmt = d => new Date(d).toLocaleDateString('el-GR', { year:'numeric', month:'long', day:'numeric' });

  // Τίτλος σελίδας & meta
  document.title = post.title + ' — Ο Κύβος της Γνώσης';
  const metaDesc = document.querySelector('meta[name="description"]');
  if(metaDesc) metaDesc.content = post.excerpt;

  // Hero
  document.getElementById('postTitle').textContent = post.title;
  document.getElementById('postBreadcrumb').textContent = post.title;
  document.getElementById('postMeta').textContent = fmt(post.date);

  // Εικόνα
  const img = document.getElementById('postImage');
  if(img && post.image){
    img.src = post.image;
    img.alt = post.title;
    img.style.display = 'block';
  }

  // Σώμα άρθρου
  body.innerHTML = post.body;

  // Σχετικά άρθρα (sidebar)
  const sidebar = document.getElementById('postSidebar');
  if(sidebar){
    const related = data.items.filter(p => p.slug !== slug).slice(0, 3);
    sidebar.innerHTML = related.length ? `
      <h4>Σχετικά άρθρα</h4>
      ${related.map(r => `
        <a href="blog-post.html?slug=${r.slug}" class="blog-sidebar-item">
          <img src="${r.image}" alt="${r.title}" loading="lazy">
          <span>${r.title}</span>
        </a>`).join('')}
    ` : '';
  }

  initScrollReveal();
}

document.addEventListener('DOMContentLoaded', () => {
  renderHomeContent();
  renderAbout();
  renderActivities();
  renderGallery();
  renderFaq();
  renderNews();
  renderBlog();
  renderBlogPost();
});

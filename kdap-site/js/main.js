/* Τρέχει αφού φορτώσουν τα partials, ώστε να «πιάνει» στοιχεία του header/footer */
document.addEventListener('partials:ready', () => {
  initScrollReveal();
  initBackToTop();
});

document.addEventListener('DOMContentLoaded', () => {
  initGalleryLightbox();
  initFaqAccordion();
  initContactForm();
});

/* ---------- 1. Απαλή εμφάνιση στοιχείων κατά το scroll ---------- */
function initScrollReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => io.observe(el));
}

/* ---------- 2. Κουμπί επιστροφής στην κορυφή ---------- */
function initBackToTop(){
  const btn = document.getElementById('toTop');
  if(!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 500);
  });
  btn.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
}

/* ---------- 3. Gallery με lightbox (χωρίς εξωτερική βιβλιοθήκη) ---------- */
function initGalleryLightbox(){
  const gallery = document.querySelector('.gallery');
  const lightbox = document.getElementById('lightbox');
  if(!gallery || !lightbox) return;
  const lightboxImg = lightbox.querySelector('img');

  gallery.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-full]');
    if(!btn) return;
    lightboxImg.src = btn.getAttribute('data-full');
    lightboxImg.alt = btn.getAttribute('data-alt') || '';
    lightbox.classList.add('open');
  });

  lightbox.addEventListener('click', (e) => {
    if(e.target === lightbox || e.target.classList.contains('lightbox-close')){
      lightbox.classList.remove('open');
      lightboxImg.src = '';
    }
  });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') lightbox.classList.remove('open');
  });
}

/* ---------- 4. FAQ accordion ---------- */
function initFaqAccordion(){
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.getAttribute('data-open') === 'true';
      items.forEach(other => {
        other.setAttribute('data-open', 'false');
        other.querySelector('.faq-a').style.maxHeight = null;
      });
      if(!isOpen){
        item.setAttribute('data-open', 'true');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });
}

/* ---------- 5. Φόρμα επικοινωνίας (δωρεάν αποστολή μέσω Web3Forms) ---------- */
function initContactForm(){
  const form = document.getElementById('contactForm');
  if(!form) return;
  const status = document.getElementById('formStatus');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Αποστολή...';
    status.dataset.state = '';

    const data = new FormData(form);
    // Βήμα δωρεάν ρύθμισης: δημιούργησε access key στο web3forms.com
    // και βάλ' το εδώ αντί για "ΒΑΛΕ_ΤΟ_ACCESS_KEY_ΣΟΥ".
    data.append('access_key', 'ΒΑΛΕ_ΤΟ_ACCESS_KEY_ΣΟΥ');

    try{
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      const result = await res.json();
      if(result.success){
        status.textContent = 'Ευχαριστούμε! Το μήνυμά σας στάλθηκε — θα επικοινωνήσουμε σύντομα.';
        status.dataset.state = 'ok';
        form.reset();
      }else{
        throw new Error(result.message || 'Άγνωστο σφάλμα');
      }
    }catch(err){
      status.textContent = 'Κάτι πήγε στραβά. Δοκιμάστε ξανά ή καλέστε μας στο 698 190 2582.';
      status.dataset.state = 'err';
    }
  });
}

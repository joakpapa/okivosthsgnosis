/**
 * Φορτώνει τα partials (header/footer) σε κάθε σελίδα, ώστε να τα αλλάζεις
 * σε ΕΝΑ σημείο και να ενημερώνονται όλες οι σελίδες.
 * Χρειάζεται να "σερβίρεται" το site (http://, όχι file://) — βλ. README.
 */
async function includePartials(){
  const slots = document.querySelectorAll('[data-include]');
  await Promise.all(
    Array.from(slots).map(async (slot) => {
      const file = slot.getAttribute('data-include');
      try{
        const res = await fetch(file);
        slot.innerHTML = await res.text();
      }catch(err){
        console.error('Δεν φόρτωσε το partial:', file, err);
      }
    })
  );
  markActiveNavLink();
  wireMobileMenu();
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  document.dispatchEvent(new CustomEvent('partials:ready'));
}

function markActiveNavLink(){
  const current = document.body.getAttribute('data-page');
  if(!current) return;
  const link = document.querySelector(`[data-nav="${current}"]`);
  if(link) link.setAttribute('aria-current', 'page');
}

function wireMobileMenu(){
  const toggle = document.getElementById('menuToggle');
  const links = document.getElementById('navLinks');
  if(!toggle || !links) return;
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
  document.addEventListener('click', (e) => {
    if(links.classList.contains('open') && !links.contains(e.target) && e.target !== toggle){
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && links.classList.contains('open')){
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

document.addEventListener('DOMContentLoaded', includePartials);

/**
 * Σύστημα ραντεβού βιντεοκλήσης — 100% δωρεάν, χωρίς server:
 * 1) Ο γονιός διαλέγει ημέρα + ώρα (demo διαθεσιμότητα, εύκολα επεξεργάσιμη παρακάτω).
 * 2) Δημιουργείται αυτόματα ένα μοναδικό δωρεάν link βιντεοκλήσης Jitsi Meet
 *    (meet.jit.si) — χωρίς λογαριασμό, χωρίς εγκατάσταση εφαρμογής.
 * 3) Το αίτημα ραντεβού στέλνεται στην υπεύθυνη μέσω Web3Forms (δωρεάν),
 *    μαζί με το link βιντεοκλήσης.
 */

const BOOKING_DAYS = [
  { key: 'mon', label: 'Δευτέρα' },
  { key: 'tue', label: 'Τρίτη' },
  { key: 'wed', label: 'Τετάρτη' },
  { key: 'thu', label: 'Πέμπτη' },
  { key: 'fri', label: 'Παρασκευή' },
];
const BOOKING_HOURS = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30'];
// Demo: ώρες που θεωρούνται ήδη κλεισμένες (άλλαξέ τα όπως θες, ή σύνδεσέ τα αργότερα με πραγματικό ημερολόγιο)
const TAKEN_SLOTS = { mon: ['18:00'], wed: ['17:30', '19:00'], fri: ['17:00'] };

let selectedDay = BOOKING_DAYS[0].key;
let selectedTime = null;

function initBooking(){
  const tabsEl = document.getElementById('dayTabs');
  const slotsEl = document.getElementById('slotGrid');
  const form = document.getElementById('bookingForm');
  if(!tabsEl || !slotsEl || !form) return;

  BOOKING_DAYS.forEach((day, i) => {
    const btn = document.createElement('button');
    btn.className = 'day-tab';
    btn.type = 'button';
    btn.textContent = day.label;
    btn.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    btn.addEventListener('click', () => {
      selectedDay = day.key;
      selectedTime = null;
      tabsEl.querySelectorAll('.day-tab').forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      renderSlots(slotsEl);
      updateSummary();
    });
    tabsEl.appendChild(btn);
  });

  renderSlots(slotsEl);
  updateSummary();

  form.addEventListener('submit', (e) => handleBookingSubmit(e, form));
}

function renderSlots(slotsEl){
  slotsEl.innerHTML = '';
  const taken = TAKEN_SLOTS[selectedDay] || [];
  BOOKING_HOURS.forEach(time => {
    const btn = document.createElement('button');
    btn.className = 'slot-btn';
    btn.type = 'button';
    btn.textContent = time;
    const isTaken = taken.includes(time);
    if(isTaken){ btn.disabled = true; }
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', () => {
      selectedTime = time;
      slotsEl.querySelectorAll('.slot-btn').forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      updateSummary();
    });
    slotsEl.appendChild(btn);
  });
}

function dayLabel(key){
  return BOOKING_DAYS.find(d => d.key === key)?.label || key;
}

function updateSummary(){
  const summary = document.getElementById('bookingSummary');
  if(!summary) return;
  if(!selectedTime){
    summary.innerHTML = 'Επιλέξτε ημέρα και ώρα για να δείτε το ραντεβού σας εδώ.';
    return;
  }
  summary.innerHTML = `Επιλεγμένο ραντεβού: <b>${dayLabel(selectedDay)}, ${selectedTime}</b> — θα λάβετε αυτόματα ένα δωρεάν link βιντεοκλήσης.`;
}

/** Μοναδικό, δωρεάν link Jitsi Meet — χωρίς λογαριασμό, με τυχαίο κωδικό ασφαλείας στο όνομα δωματίου */
function buildVideoCallLink(name){
  const safeName = (name || 'goneas').replace(/[^a-zA-Z0-9]/g, '');
  const code = Math.random().toString(36).slice(2, 8);
  return `https://meet.jit.si/KivostisGnosis-Randevou-${safeName}-${code}`;
}

async function handleBookingSubmit(e, form){
  e.preventDefault();
  const status = document.getElementById('bookingStatus');
  if(!selectedTime){
    status.textContent = 'Παρακαλούμε επιλέξτε πρώτα ημέρα και ώρα από παραπάνω.';
    status.dataset.state = 'err';
    return;
  }
  status.textContent = 'Αποστολή αιτήματος...';
  status.dataset.state = '';

  const data = new FormData(form);
  const videoLink = buildVideoCallLink(data.get('parent_name'));
  data.append('Ημέρα', dayLabel(selectedDay));
  data.append('Ώρα', selectedTime);
  data.append('Link βιντεοκλήσης', videoLink);
  data.append('subject', 'Νέο ραντεβού βιντεοκλήσης — Ο Κύβος της Γνώσης');
  // Βήμα δωρεάν ρύθμισης: βάλε το δικό σου access key από web3forms.com
  data.append('access_key', 'ΒΑΛΕ_ΤΟ_ACCESS_KEY_ΣΟΥ');

  try{
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    const result = await res.json();
    if(result.success){
      status.innerHTML = `Το ραντεβού σας κλείστηκε για <b>${dayLabel(selectedDay)}, ${selectedTime}</b>. Το link βιντεοκλήσης σας: <a href="${videoLink}" target="_blank" rel="noopener">${videoLink}</a> — σας το στείλαμε και στο email σας.`;
      status.dataset.state = 'ok';
      form.reset();
    } else {
      throw new Error(result.message || 'Άγνωστο σφάλμα');
    }
  }catch(err){
    status.textContent = 'Κάτι πήγε στραβά με την αποστολή. Καλέστε μας στο 698 190 2582.';
    status.dataset.state = 'err';
  }
}

document.addEventListener('DOMContentLoaded', initBooking);

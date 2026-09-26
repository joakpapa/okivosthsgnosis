/* Έξυπνο εργαλείο: ελέγχει αν η ηλικία του παιδιού εμπίπτει στο όριο δεκτών ηλικιών (5–12) */
function initAgeChecker(){
  const form = document.getElementById('ageForm');
  if(!form) return;
  const result = document.getElementById('ageResult');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const dob = new Date(form.elements['dob'].value);
    if(isNaN(dob)){ return; }
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const hadBirthday = (today.getMonth() > dob.getMonth()) ||
      (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
    if(!hadBirthday) age--;

    result.classList.add('show');
    if(age >= 5 && age <= 12){
      result.dataset.ok = 'true';
      result.textContent = `Το παιδί σας είναι ${age} ετών — εμπίπτει στις ηλικίες που δεχόμαστε στο ΚΔΑΠ! Κλείστε ένα ραντεβού γνωριμίας.`;
    } else if (age < 5){
      result.dataset.ok = 'false';
      result.textContent = `Το παιδί σας είναι ${age} ετών. Δεχόμαστε παιδιά από 5 ετών — επικοινωνήστε μαζί μας για εναλλακτικά προγράμματα βρεφικής φροντίδας.`;
    } else {
      result.dataset.ok = 'false';
      result.textContent = `Το παιδί σας είναι ${age} ετών, πάνω από το συνήθες όριο (5–12). Επικοινωνήστε μαζί μας — εξετάζουμε κάθε περίπτωση ξεχωριστά.`;
    }
  });
}
document.addEventListener('DOMContentLoaded', initAgeChecker);

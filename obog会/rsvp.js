// Hashimoto Semi OB/OG Reunion — RSVP form logic
(function () {
  // toggle kids age field
  const kidsGroup = document.getElementById('kidsGroup');
  const kidsAgeWrap = document.getElementById('kidsAgeWrap');
  kidsGroup.addEventListener('change', () => {
    const yes = document.querySelector('input[name=kids]:checked')?.value === 'はい';
    kidsAgeWrap.classList.toggle('show', yes);
  });

  // photo filename preview + base64 capture (small files only)
  const photoInput = document.getElementById('photo');
  const photoName = document.getElementById('photoName');
  let photoData = null;
  photoInput.addEventListener('change', () => {
    const f = photoInput.files[0];
    photoData = null;
    if (!f) { photoName.textContent = ''; return; }
    if (f.size > 4 * 1024 * 1024) {
      photoName.textContent = `${f.name}（4MBを超えるため当日直接共有をお願いします）`;
      return;
    }
    photoName.textContent = f.name;
    const reader = new FileReader();
    reader.onload = () => { photoData = reader.result; };
    reader.readAsDataURL(f);
  });

  const form = document.getElementById('rsvpForm');
  const submitBtn = document.getElementById('submitBtn');
  const submitStatus = document.getElementById('submitStatus');
  const thanksBox = document.getElementById('thanksBox');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    submitBtn.disabled = true;
    submitStatus.textContent = '送信しています…';

    const data = {
      name: document.getElementById('name').value.trim(),
      cohort: document.getElementById('cohort').value.trim(),
      industry: document.getElementById('industry').value.trim(),
      allergy: document.getElementById('allergy').value.trim(),
      smoking: document.querySelector('input[name=smoking]:checked')?.value || '',
      kids: document.querySelector('input[name=kids]:checked')?.value || '',
      kidsAge: document.getElementById('kidsAge').value,
      msgToSensei: document.getElementById('msgToSensei').value.trim(),
      quiz: document.getElementById('quiz').value.trim(),
      photoFileName: photoInput.files[0]?.name || '',
      photoData: photoData,
      submittedAt: new Date().toISOString()
    };

    const key = 'rsvp:' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);

    try {
      if (window.storage) {
        const result = await window.storage.set(key, JSON.stringify(data), true);
        if (!result) { throw new Error('storage failed'); }
      }
      form.style.display = 'none';
      thanksBox.classList.add('show');
      submitStatus.textContent = '';
    } catch (err) {
      submitStatus.textContent = '送信に失敗しました。時間をおいて再度お試しください。';
      submitBtn.disabled = false;
    }
  });
})();

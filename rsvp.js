// Hashimoto Semi OB/OG Reunion — RSVP form logic
(function () {

  // ------------------------------------------------------------------
  // ↓↓↓ ここにGoogle Apps Scriptの「ウェブアプリURL」を貼り付けてください ↓↓↓
  // 取得手順は同梱の google-sheets-setup.md を参照してください。
  // 空欄のままだとスプレッドシートへの保存はスキップされます。
  // ------------------------------------------------------------------
  const SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxiPy1fPx8U6wdoH0l5JWo37ZgTe6hd8idTGqW5iqwpclLx415ehqtR9I0BmZksFtrR1g/exec';

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

  // Send the text fields to the organizer's Google Sheet.
  // Uses mode:'no-cors' because Apps Script Web Apps don't return CORS
  // headers to fetch() — the request still arrives and the row still gets
  // appended, we just can't read the response back to confirm success.
  async function postToSheet(data) {
    if (!SHEET_WEBAPP_URL) return; // not configured yet
    const { photoData, ...sheetSafeData } = data; // never send the base64 photo to the sheet
    await fetch(SHEET_WEBAPP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(sheetSafeData)
    });
  }

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
      attendance: document.querySelector('input[name=attendance]:checked')?.value || '',
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
      // 1) Save the full response (including the photo) to the artifact's
      //    own storage, so nothing is lost even if the sheet isn't set up yet.
      if (window.storage) {
        const result = await window.storage.set(key, JSON.stringify(data), true);
        if (!result) { throw new Error('storage failed'); }
      }
      // 2) Also push the text fields to the organizer's Google Sheet.
      try {
        await postToSheet(data);
      } catch (sheetErr) {
        console.warn('スプレッドシートへの送信に失敗しました（回答自体は保存されています）', sheetErr);
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


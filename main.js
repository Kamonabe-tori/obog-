// Hashimoto lab OB/OG Reunion — top page interactions
(function () {
  // Pause the drifting photo rows on hover / focus so people can look closer.
  document.querySelectorAll('.hero-row, .film-row').forEach((row) => {
    row.addEventListener('mouseenter', () => { row.style.animationPlayState = 'paused'; });
    row.addEventListener('mouseleave', () => { row.style.animationPlayState = 'running'; });
  });
})();

// --- 思い出ギャラリー（.film）の自動＆手動スクロール制御 ---
document.addEventListener('DOMContentLoaded', () => {
  const film = document.querySelector('.js-film');
  if (!film) return;

  let speed = 1.2; // 自動スクロールの速度（1.0〜1.5程度が心地よいです）
  let isDown = false;
  let startX;
  let scrollLeft;
  let animationFrameId;

  // 自動スクロールをループさせる関数
  const autoScroll = () => {
    if (!isDown) {
      film.scrollLeft += speed;
      
      // 最後までスクロールしたら、滑らかに最初（左端）に戻す
      if (film.scrollLeft >= film.scrollWidth - film.clientWidth) {
        film.scrollLeft = 0;
      }
    }
    animationFrameId = requestAnimationFrame(autoScroll);
  };

  // 自動スクロールを開始
  autoScroll();

  // --- 手動ドラッグ・スワイプの制御 ---
  
  // マウスが押された（ドラッグ開始） / スマホでタッチされた
  const startDrag = (e) => {
    isDown = true;
    film.style.cursor = 'grabbing';
    film.style.scrollBehavior = 'auto'; // ドラッグ中は指に吸い付くように
    startX = (e.pageX || e.touches[0].pageX) - film.offsetLeft;
    scrollLeft = film.scrollLeft;
  };

  // マウスを離した（ドラッグ終了） / スマホのタッチが離れた
  const stopDrag = () => {
    isDown = false;
    film.style.cursor = 'grab';
  };

  // マウス移動中 / スマホスワイプ中
  const moveDrag = (e) => {
    if (!isDown) return;
    
    // スマホでの縦スクロールを邪魔しないように、スワイプ中のみ横スクロールの挙動を制御
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const x = (e.pageX || e.touches[0].pageX) - film.offsetLeft;
    const walk = (x - startX) * 1.5; // スワイプの感度（1.5倍）
    film.scrollLeft = scrollLeft - walk;
  };

  // PCマウス用のイベント登録
  film.addEventListener('mousedown', startDrag);
  film.addEventListener('mouseleave', stopDrag);
  film.addEventListener('mouseup', stopDrag);
  film.addEventListener('mousemove', moveDrag);
  film.style.cursor = 'grab';

  // スマホ・タブレット用のイベント登録
  film.addEventListener('touchstart', startDrag, { passive: true });
  film.addEventListener('touchend', stopDrag, { passive: true });
  film.addEventListener('touchmove', moveDrag, { passive: false });
});
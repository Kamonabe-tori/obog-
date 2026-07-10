// Hashimoto Semi OB/OG Reunion — top page interactions
(function () {
  // Pause the drifting photo rows on hover / focus so people can look closer.
  document.querySelectorAll('.hero-row, .film-row').forEach((row) => {
    row.addEventListener('mouseenter', () => { row.style.animationPlayState = 'paused'; });
    row.addEventListener('mouseleave', () => { row.style.animationPlayState = 'running'; });
  });
})();

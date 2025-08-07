export function createOverlay(id, content = '') {
  const overlay = document.createElement('div');
  overlay.id = id;
  overlay.innerHTML = content;
  document.body.appendChild(overlay);
  return overlay;
}

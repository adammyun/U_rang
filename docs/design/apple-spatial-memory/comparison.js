const overlay = document.querySelector('.fullscreen-preview');
const frame = overlay.querySelector('iframe');
const title = overlay.querySelector('#fullscreen-title');
const directLink = overlay.querySelector('.fullscreen-new-tab');
const closeButton = overlay.querySelector('.fullscreen-close');
let trigger = null;

function openPreview(button) {
  trigger = button;
  const source = button.dataset.preview;
  frame.src = source;
  title.textContent = button.dataset.title;
  directLink.href = source;
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('preview-is-open');
  closeButton.focus();
}

function closePreview() {
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('preview-is-open');
  frame.src = 'about:blank';
  trigger?.focus();
}

document.querySelectorAll('.preview-open').forEach((button) => {
  button.addEventListener('click', () => openPreview(button));
});
closeButton.addEventListener('click', closePreview);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && overlay.classList.contains('is-open')) closePreview();
});

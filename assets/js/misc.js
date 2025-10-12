//assets/js/misc.js

function swapHeadersViaQueryParam() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('showSlideshow') !== 'true') return;
  const siteHeader = document.querySelector('.site-header');
  const slideshowHeader = document.querySelector('.slideshow-site-header');
  if (siteHeader) siteHeader.style.visibility = 'hidden';
  if (slideshowHeader) slideshowHeader.style.visibility = 'visible';
  document.body.classList.add('is-slideshow');
}

document.addEventListener('DOMContentLoaded', () => {
  swapHeadersViaQueryParam();
});

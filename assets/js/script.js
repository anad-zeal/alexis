document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed.');

  function initializePage() {
    console.log('Initializing page logic…');
  }

  initializePage();
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[data-page]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const clickedPage = event.currentTarget.dataset.page;
      console.log('Clicked page:', clickedPage);
      alert(`You clicked: ${clickedPage}`);
    });
  });
});

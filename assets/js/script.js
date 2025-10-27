document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[data-page]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const clickedPage = event.currentTarget.dataset.page;
      console.log('Clicked page:', clickedPage);
      alert(`You clicked: ${clickedPage}`);
    });
  });
});

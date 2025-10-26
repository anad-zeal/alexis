document.addEventListener('DOMContentLoaded', () => {
  const menuLinks = document.querySelectorAll('.landing-mnu');
  const contentArea = document.getElementById('page-content');

  function loadPage(page) {
    fetch(`/aep/json-files/${page}.json`)
      .then((response) => {
        if (!response.ok) throw new Error('Page not found');
        return response.json();
      })
      .then((data) => {
        renderContent(data.pageContent);
        updateActiveLink(page);
      })
      .catch((error) => {
        contentArea.innerHTML = `<p>Error loading page: ${error.message}</p>`;
      });
  }

  function renderContent(contentArray) {
    contentArea.innerHTML = '';
    contentArray.forEach((item) => {
      if (item.type === 'heading') {
        const h2 = document.createElement('h2');
        h2.textContent = item.text;
        contentArea.appendChild(h2);
      } else if (item.type === 'paragraph') {
        const p = document.createElement('p');
        p.textContent = item.text;
        contentArea.appendChild(p);
      } else if (item.title) {
        const div = document.createElement('div');
        div.innerHTML = `<strong>${item.title}</strong><p>${item.description}</p>`;
        contentArea.appendChild(div);
      }
    });
  }

  function updateActiveLink(activePage) {
    menuLinks.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.page === activePage);
    });
  }

  menuLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const page = link.dataset.page;
      loadPage(page);
      history.pushState({ page }, '', link.getAttribute('href'));
    });
  });

  window.addEventListener('popstate', (event) => {
    const page = event.state?.page || 'home';
    loadPage(page);
  });

  loadPage('home');
});

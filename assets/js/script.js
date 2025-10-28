document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.main-nav-menu .landing-mnu'); // Target the <a> tags within the menu
  const dynamicContentArea = document.getElementById('dynamic-content-area');

  // Function to load and display JSON content
  async function loadJsonContent(pageName) {
    // Construct the filename using the data-page value
    const jsonFileName = `${pageName}.json`;

    try {
      const response = await fetch(`/json-files/${jsonFileName}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json(); // Parse the JSON data

      // For now, display the raw JSON
      dynamicContentArea.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      // This is where you'll later map the JSON data to HTML structure
      // e.g., renderPageContent(data, pageName);

      // Update active state of navigation links
      navLinks.forEach((link) => link.classList.remove('is-active'));
      document
        .querySelector(`.main-nav-menu a[data-page="${pageName}"]`)
        .classList.add('is-active');
    } catch (error) {
      console.error(`Error loading JSON file for ${pageName}:`, error);
      dynamicContentArea.innerHTML = `<p>Error loading content for "${pageName}". Please try again.</p>`;
    }
  }

  // Add event listeners to navigation links
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault(); // Prevent the default link behavior (page reload)
      const pageName = event.target.dataset.page;
      alert(pageName); // Get the page name from data-page attribute
      if (pageName) {
        loadJsonContent(pageName);
      }
    });
  });

  // Handle initial page load based on current URL path or a default
  const initialPage = window.location.pathname.substring(1) || 'home'; // Get path like "artworks" or default to "home"
  loadJsonContent(initialPage);
});

document.addEventListener('DOMContentLoaded', () => {
  // Your code here runs only after the DOM has fully loaded
  alert('test links');
  // Select elements
  const buttons = document.querySelectorAll('button');
  const links = document.querySelectorAll('a');

  // Simple console message
  console.log('DOM fully loaded and parsed.');

  // Add click listener to all <a> elements
  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      alert('Link Clicked');
    });
  });

  // Utility function
  function initializePage() {
    alert('Initializing page logic…');
    // put your initialization code here
  }

  // Initialize page logic
  initializePage();
});

<?php // includes/footer.php ?>
  </main>
  <footer class="site-footer">
    <p>&copy; <?= date("Y") ?> Elza • All rights reserved.</p>
  </footer>

  <script type="module">
    import { initSlideshows } from "/assets/js/script.js";
    document.addEventListener("DOMContentLoaded", () => {
      initSlideshows();
    });
    window.addEventListener("hashchange", () => initSlideshows());
    window.addEventListener("app:navigate", () => initSlideshows());
  </script>
</body>
</html>

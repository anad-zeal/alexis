<footer class="site-footer">
    <p>&copy; 2025 elzalive • All rights reserved.</p>
</footer>

<script src="assets/js/script.js" defer></script>
<script>
// ==========================================
// INITIALIZATION LOGIC
// ==========================================
if (slides.length > 0) {
    // 1. Check if you manually added "active" to a slide in HTML
    let startingIndex = Array.from(slides).findIndex(s => s.classList.contains('active'));

    // 2. If you forgot to add it in HTML, default to the first slide (Index 0)
    if (startingIndex === -1) {
        startingIndex = 0;
        slides[startingIndex].classList.add('active');
    }

    // 3. Sync the JS counter with the HTML
    currentSlide = startingIndex;

    // 4. Start the timer
    startSlideInterval();
}
});
</script>

</body>

</html>

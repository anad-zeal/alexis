<header class="site-header">
    <!-- Primary nav -->
    <nav class="top-grid main-nav" aria-label="Primary">
        <div class="mid">
            <?= nav_item("home", "HOMEr", "/home") ?>
            <?= nav_item("artworks", "ARTWORKS", "/artworks") ?>
            <?= nav_item("biography", "BIOGRAPHY", "/biography") ?>
            <?= nav_item("contact", "CONTACT", "/contact") ?>
        </div>
    </nav>

    <!-- Galleries nav -->
    <nav class="top-grid main-nav galleries" aria-label="Galleries">
        <div class="mid">
            <?= nav_item(
                "black-and-white",
                "BLACK and WHITE",
                "/black-and-white",
            ) ?>
            <?= nav_item("drips", "DRIP SERIES", "/drips") ?>
            <?= nav_item("encaustic", "ENCAUSTIC", "/encaustic") ?>
            <?= nav_item("projects", "PROJECT SERIES", "/projects") ?>
        </div>
    </nav>
</header>

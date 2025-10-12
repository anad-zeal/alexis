<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $full_page_title ?></title> <!-- Use the full title here -->
    <!-- Your global CSS links -->
    <!-- Any slideshow-specific CSS that you don't inject via JS can go here -->
</head>

<body>
    <header class="site-header">
        <nav class="top-grid main-nav" aria-label="Primary">
            <div class="mid flex">
                <a href="/home" class="<?= ($active_page === 'home') ? 'is-active' : '' ?>"
                    aria-current="<?= ($active_page === 'home') ? 'page' : '' ?>">HOME</a>
                <a href="/artworks" class="<?= ($active_page === 'artworks') ? 'is-active' : '' ?>"
                    aria-current="<?= ($active_page === 'artworks') ? 'page' : '' ?>">ARTWORKS</a>
                <a href="/biography" class="<?= ($active_page === 'biography') ? 'is-active' : '' ?>"
                    aria-current="<?= ($active_page === 'biography') ? 'page' : '' ?>">BIOGRAPHY</a>
                <a href="/contact" class="<?= ($active_page === 'contact') ? 'is-active' : '' ?>"
                    aria-current="<?= ($active_page === 'contact') ? 'page' : '' ?>">CONTACT</a>
                <!-- Add other navigation links if desired -->
            </div>
        </nav>
    </header>

    <main id="main-content-area" tabindex="-1">
        <!-- The hero section from includes/hero.php will go after this -->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($page_title, ENT_QUOTES, "UTF-8") ?></title>
    <link rel="canonical" href="<?= htmlspecialchars($canonicalUrl, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:url" content="<?= htmlspecialchars($canonicalUrl, ENT_QUOTES, 'UTF-8') ?>">
    <?php if ($is404): ?>
    <meta name="robots" content="noindex, nofollow"><?php endif; ?>

    <link rel="icon" href="/favicons/favicon.ico" sizes="any">
    <link rel="icon" href="/favicons/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Bonheur+Royale&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/style.css?v=6" />
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

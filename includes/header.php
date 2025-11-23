<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($full_page_title) ?></title>
    <link rel="icon" href="/favicons/favicon.ico" sizes="any">
    <link rel="icon" href="/favicons/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png">
    <link rel="canonical" href="<?= htmlspecialchars($canonicalUrl) ?>">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Bonheur+Royale&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Noto+Serif+Display:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet">

    <!-- Stylesheets -->
    <link rel="stylesheet" href="/assets/css/style.css" />
    <link rel="stylesheet" href="/assets/css/slideshow.css" />
</head>

<body>
    <header class="site-header">
        <nav class="main-nav" aria-label="Primary">
            <div class="main-nav-menu">
                <?= nav_item("home", "HOME", "/") ?>
                <?= nav_item("artworks", "ARTWORKS", "/artworks") ?>
                <?= nav_item("biography", "BIOGRAPHY", "/biography") ?>
                <?= nav_item("contact", "CONTACT", "/contact") ?>
            </div>
        </nav>
    </header>
<?php $page_title  = $page_title  ?? "aepaints";
$active_page = $active_page ?? "home";
$host = $_SERVER['HTTP_HOST'] ?? 'example.com';
$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
$scheme = $https ? 'https' : 'http';
$canonicalPath = '/' . ltrim($active_page, '/');
$canonicalUrl = sprintf('%s://%s%s', $scheme, $host, $canonicalPath);
$is404 = ($active_page === '404');
function nav_item(string $slug, string $label, string $href): string
{
    global $active_page;
    $isActive = ($active_page === $slug);
    $class    = $isActive ? 'is-active' : '';
    $aria     = $isActive ? ' aria-current="page"' : '';
    return sprintf(
        '<a href="%s" class="%s"%s>%s</a>',
        htmlspecialchars($href, ENT_QUOTES, 'UTF-8'),
        $class,
        $aria,
        htmlspecialchars($label, ENT_QUOTES, 'UTF-8')
    );
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($full_page_title) ?></title>
    <link rel="icon" href="/favicons/favicon.ico" sizes="any">
    <link rel="icon" href="/favicons/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png">
    <script type="text/javascript"
        src="https://cdn.jsdelivr.net/gh/c-kick/mobileConsole/hnl.mobileconsole.min.js?ver=1.4.0" id="con-js"></script>
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

    <main id="dynamic-page-wrapper" data-page="<?= htmlspecialchars($active_page) ?>" tabindex="-1">
        <!-- The hero section from includes/hero.php will go after this -->
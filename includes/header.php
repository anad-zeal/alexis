<?php
// Default values
$page_title = $page_title ?? "Home";
$active_page = $active_page ?? "home";
$site_name = "AEPaints";
$full_page_title = $page_title . " | " . $site_name;

// Canonical URL builder
$host = $_SERVER["HTTP_HOST"] ?? "example.com";
$https =
    (!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off") ||
    (isset($_SERVER["SERVER_PORT"]) && $_SERVER["SERVER_PORT"] == 443);
$scheme = $https ? "https" : "http";
$canonicalPath = "/" . ltrim($active_page, "/");
$canonicalUrl = sprintf("%s://%s%s", $scheme, $host, $canonicalPath);

// Helper for nav items
function nav_item(string $slug, string $label, string $href): string
{
    global $active_page;
    $isActive = $active_page === $slug;
    $classes = "landing-mnu" . ($isActive ? " is-active" : "");
    $aria = $isActive ? ' aria-current="page"' : "";
    return sprintf(
        '<a href="%s" class="%s"%s>%s</a>',
        htmlspecialchars($href, ENT_QUOTES, "UTF-8"),
        trim($classes),
        $aria,
        htmlspecialchars($label, ENT_QUOTES, "UTF-8"),
    );
}

// Dynamic center title
$life_title = "<h2 class='sub-title fade-title'>The Life of an Artist</h2>";
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
    <link rel="canonical" href="<?= htmlspecialchars($canonicalUrl) ?>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Bonheur+Royale&family=Inter:wght@100..900&family=Montserrat:wght@100..900&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/style.css" />
</head>

<body>
    <header class="site-header">
        <nav class="main-nav" aria-label="Primary">
            <div class="main-nav-menu">
                <?= nav_item("home", "HOME", "/home") ?>
                <?= nav_item("artworks", "ARTWORKS", "/artworks") ?>
                <div class="main-nav-center">
                    <?php if ($active_page === "life") {
                        echo $life_title;
                    } ?>
                </div>
                <?= nav_item("biography", "BIOGRAPHY", "/biography") ?>
                <?= nav_item("contact", "CONTACT", "/contact") ?>
            </div>
        </nav>
    </header>

    <main id="dynamic-page-wrapper" data-page="<?= htmlspecialchars($active_page) ?>" tabindex="-1">

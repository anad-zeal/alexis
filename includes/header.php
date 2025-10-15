<?php
// Default values, can be overridden by specific page scripts
$page_title = $page_title ?? "Home"; // Changed default to "Home" for the home page
$active_page = $active_page ?? "home";
$site_name = "AEPaints"; // Assuming a site name for full title

// Construct the full page title
$full_page_title = $page_title . " | " . $site_name;

// Server and scheme detection for canonical URL
$host = $_SERVER["HTTP_HOST"] ?? "example.com";
$https =
    (!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off") ||
    (isset($_SERVER["SERVER_PORT"]) && $_SERVER["SERVER_PORT"] == 443);
$scheme = $https ? "https" : "http";

// Canonical path and URL
$canonicalPath = "/" . ltrim($active_page, "/");
$canonicalUrl = sprintf("%s://%s%s", $scheme, $host, $canonicalPath);

// 404 flag
$is404 = $active_page === "404";

/**
 * Helper function to generate a navigation item.
 * Adds 'is-active' class and 'aria-current' attribute for the active page.
 *
 * @param string $slug The unique identifier for the page (e.g., "home", "artworks").
 * @param string $label The display text for the link (e.g., "HOME").
 * @param string $href The URL for the link (e.g., "/home").
 * @return string The generated HTML <a> tag.
 */
function nav_item(string $slug, string $label, string $href): string
{
    global $active_page; // Access the global active_page variable
    $isActive = $active_page === $slug;

    // Build the class string
    $classes = "landing-mnu"; // Start with the desired class
    if ($isActive) {
        $classes .= " is-active"; // Add 'is-active' if the page is active
    }

    $aria = $isActive ? ' aria-current="page"' : "";

    return sprintf(
        '<a href="%s" class="%s"%s>%s</a>',
        htmlspecialchars($href, ENT_QUOTES, "UTF-8"),
        trim($classes), // Use trim to clean up any extra spaces if 'is-active' isn't added
        $aria,
        htmlspecialchars($label, ENT_QUOTES, "UTF-8"),
    );
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($full_page_title) ?></title>

    <!-- Favicons -->
    <link rel="icon" href="/favicons/favicon.ico" sizes="any">
    <link rel="icon" href="/favicons/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png">

    <!-- Canonical URL for SEO -->
    <link rel="canonical" href="<?= htmlspecialchars($canonicalUrl) ?>">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Bonheur+Royale&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
        rel="stylesheet">

    <!-- Main Stylesheet -->
    <link rel="stylesheet" href="/assets/css/style.css" />
</head>

<body>
    <header class="site-header">
        <nav class="top-grid main-nav" aria-label="Primary">
            <div class="mid flex">
                <!-- Using the nav_item helper function for cleaner code -->
                <?= nav_item("home", "HOME", "/home") ?>
                <?= nav_item("artworks", "ARTWORKS", "/artworks") ?>
                <?= nav_item("biography", "BIOGRAPHY", "/biography") ?>
                <?= nav_item("contact", "CONTACT", "/contact") ?>
                <!-- Add other navigation links if desired -->
            </div>
        </nav>
    </header>

    <main id="dynamic-page-wrapper" data-page="<?= htmlspecialchars(
        $active_page,
    ) ?>" tabindex="-1">
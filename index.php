<?php

// index.php — central router with clean slugs

$page = $_GET["page"] ?? "home";

$map = [
    // Text-only pages
    "home" => "pages/home.php",
    "artworks" => "pages/artworks.php",
    "biography" => "pages/biography.php",
    "contact" => "pages/contact.php",

    // Slideshow pages
    "restoration" => "pages/restoration.php",
    "decorative" => "pages/decorative.php",
    "black-and-white" => "pages/black-and-white.php",
    "drips" => "pages/drips.php",
    "encaustic" => "pages/encaustic.php",
    "projects" => "pages/projects.php",
];

// Resolve file or default to home
$file = $map[$page] ?? $map["home"];

// --- NEW LOGIC FOR SPA ---
// Check if this is an AJAX request from our JavaScript
$is_ajax_request = isset($_SERVER['HTTP_X_FETCHED_WITH']) && $_SERVER['HTTP_X_FETCHED_WITH'] === 'SPA-Fetch';

if ($is_ajax_request) {
    // If it's an AJAX request, wrap the page content in the expected structure
    // so JavaScript can extract it properly
    $page_title = ucfirst(str_replace("-", " ", $page));
    $active_page = $page;

    echo '<div id="dynamic-page-wrapper" data-page="' . htmlspecialchars($active_page) . '" tabindex="-1">';
    require __DIR__ . "/includes/hero.php";
    require __DIR__ . "/$file";
    echo '</div>';
} else {
    // If it's a regular browser request (initial load or direct URL access),
    // build the full HTML page.

    // Variables for header (only needed for full page requests)
    $page_title = ucfirst(str_replace("-", " ", $page)); // Just the page title, no " | aepaints"
    $full_page_title = $page_title . " | aepaints"; // Full title for browser tab
    $active_page = $page;

    require __DIR__ . "/includes/header.php"; // This will include <title> and start <main>
    require __DIR__ . "/includes/hero.php";   // This will put the hero section
    require __DIR__ . "/$file";               // This will put the initial page content into #dynamic-page-wrapper
    require __DIR__ . "/includes/footer.php"; // This will close <main>, add spinner, footer, and scripts
}
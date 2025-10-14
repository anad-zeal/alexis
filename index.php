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

// Check if this is an AJAX request from our JavaScript
$is_ajax_request = isset($_SERVER['HTTP_X_FETCHED_WITH']) && $_SERVER['HTTP_X_FETCHED_WITH'] === 'SPA-Fetch';

if ($is_ajax_request) {
    // For AJAX requests, return ONLY the page content fragment
    // This goes directly into #main-content-area
    require __DIR__ . "/$file";
} else {
    // For regular browser requests (initial load or direct URL access),
    // build the full HTML page

    $page_title = ucfirst(str_replace("-", " ", $page));
    $full_page_title = $page_title . " | aepaints";
    $active_page = $page;

    require __DIR__ . "/includes/header.php";
    require __DIR__ . "/includes/hero.php";
    require __DIR__ . "/$file";
    require __DIR__ . "/includes/footer.php";
}
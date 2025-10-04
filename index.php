<?php
// index.php — central router with clean slugs + 404 handling

$page = $_GET["page"] ?? "home";

$map = [
    // Text-only pages
    "home"        => "pages/home.php",
    "artworks"    => "pages/artworks.php",
    "biography"   => "pages/biography.php",
    "contact"     => "pages/contact.php",

    // Slideshow pages
    "restoration"     => "pages/restoration.php",
    "decorative"      => "pages/decorative.php",
    "black-and-white" => "pages/black-and-white.php",
    "drips"           => "pages/drips.php",
    "encaustic"       => "pages/encaustic.php",
    "projects"        => "pages/projects.php",

    // 404
    "404"             => "pages/404.php",
];

// Resolve file; if no match, set 404
if (!isset($map[$page])) {
    http_response_code(404);
    $page = "404";
}
$file = $map[$page];

// Variables for header
$page_title  = ucfirst(str_replace('-', ' ', $page)) . " | aepaints";
$active_page = $page;

require __DIR__ . "/includes/header.php";
require __DIR__ . "/$file";
require __DIR__ . "/includes/footer.php";

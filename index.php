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
//$file = $map[$page] ?? $map["home"];
$file = "<p>Decorative painting is the art of transforming ordinary surfaces into visually captivating works that reflect
        style, history, and personality. Through techniques such as faux finishes, glazing, marbling, stenciling, and
        gilding, artists create texture, depth, and illusion. Blending craftsmanship with creativity, decorative
        painting
        enhances architecture and interiors, enriching spaces with timeless elegance, warmth, and artistic character.
    </p>
";

// Variables for header
$page_title = ucfirst(str_replace("-", " ", $page)) . " | aepaints";
$active_page = $page;

require __DIR__ . "/includes/header.php";
require __DIR__ . "/includes/hero.php";
require __DIR__ . "/$file";
require __DIR__ . "/includes/footer.php";

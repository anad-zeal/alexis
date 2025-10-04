<?php
// includes/header.php
$page_title = $page_title ?? "aepaints";
$active_page = $active_page ?? "home";

function nav_item(string $slug, string $label, string $href): string
{
    global $active_page;
    $isActive = $active_page === $slug;
    $class = $isActive ? "is-active" : "";
    $aria = $isActive ? ' aria-current="page"' : "";
    return sprintf(
        '<a href="%s" class="%s"%s>%s</a>',
        htmlspecialchars($href, ENT_QUOTES, "UTF-8"),
        $class,
        $aria,
        htmlspecialchars($label, ENT_QUOTES, "UTF-8"),
    );
}
?>
<!doctype html>

<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title><?= htmlspecialchars($page_title, ENT_QUOTES, "UTF-8") ?></title>

  <link rel="icon" href="/favicons/favicon.ico" sizes="any">
  <link rel="icon" href="/favicons/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bonheur+Royale&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Poiret+One&family=Spectral:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="/assets/css/style.css?v=5" />
</head>

<body data-page="<?= htmlspecialchars($active_page, ENT_QUOTES, "UTF-8") ?>">
  <header class="site-header">
    <!-- Primary nav -->
    <nav class="top-grid main-nav" aria-label="Primary">
      <div class="left">
        <a href="/home" class="brand" aria-label="Go to Home"><span class="visually-hidden">aepaints</span></a>
      </div>
      <div class="mid">
        <?= nav_item("home", "HOME", "/home") ?>
        <?= nav_item("artworks", "ARTWORKS", "/artworks") ?>
        <?= nav_item("biography", "BIOGRAPHY", "/biography") ?>
        <?= nav_item("contact", "CONTACT", "/contact") ?>
      </div>
      <div class="right">
      &nbsp;
      </div>
    </nav>

    <!-- Galleries nav -->
    <nav class="gallery-grid gallery-nav" aria-label="Galleries">
      <div class="left">
        <h3 class="title">Alexis Elza</h3>
      </div>
      <div class="gllery-grid mid">
        <?= nav_item("black-and-white", "BLACK & WHITE", "/black-and-white") ?>
        <?= nav_item("drips", "DRIPS", "/drips") ?>
        <?= nav_item("encaustic", "ENCAUSTIC", "/encaustic") ?>
        <?= nav_item("projects", "PROJECTS", "/projects") ?>
      </div>
      <div class="right">&nbsp;</div>
    </nav>
  </header>

# New Website using json
#AEP_Website
<?php
// filepath: /Users/tal/Library/Mobile Documents/com~apple~CloudDocs/Website_Projects/elzalive/index.php

// Category to JSON file mapping
$category_map = [
    "home" => "json-files/home.json",
    "artworks" => "json-files/artworks.json",
    "biography" => "json-files/biography.json",
    "contact" => "json-files/contact.json",
    "restoration" => "json-files/restoration-projects.json",
    "decorative" => "json-files/decorative-painting.json",
    "black-and-white" => "json-files/black-and-white-paintings.json",
    "drips" => "json-files/drip-series-paintings.json",
    "encaustic" => "json-files/encaustic-paintings.json",
    "project-series" => "json-files/project-series-paintings.json",
];

// Page title mapping
$label_map = [
    "home" => "Home Page",
    "artworks" => "Artworks Page",
    "biography" => "Biography",
    "contact" => "Contact Me",
    "restoration" => "Historic Preservation",
    "decorative" => "Decorative Painting",
    "black-and-white" => "Black and White Paintings",
    "drips" => "Drip Series Paintings",
    "encaustic" => "Encaustic Paintings",
    "project-series" => "Project Series Paintings",
];

// Get category from URL path or default to home
$request_uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($request_uri, PHP_URL_PATH);
$category = trim($path, '/') ?: 'home';

// Validate category exists
if (!isset($category_map[$category])) {
    $category = 'home';
}

// Set page variables for header
$page_title = $label_map[$category] ?? 'Home Page';
$active_page = $category;

// Check if this is an AJAX request for SPA navigation
$is_ajax = !empty($_SERVER['HTTP_X_FETCHED_WITH']) && $_SERVER['HTTP_X_FETCHED_WITH'] === 'SPA-Fetch';

if ($is_ajax) {
    // For AJAX requests, only return the content
    $json_file = __DIR__ . "/" . $category_map[$category];
    if (file_exists($json_file)) {
        $page_data = json_decode(file_get_contents($json_file), true);
        echo generatePageContent($page_data, $category);
    } else {
        echo '<p>Page not found</p>';
    }
    exit;
}

// For full page loads, include header and footer
require __DIR__ . "/includes/header.php";
require __DIR__ . "/includes/hero.php";

// Load and display page content
$json_file = __DIR__ . "/" . $category_map[$category];
if (file_exists($json_file)) {
    $page_data = json_decode(file_get_contents($json_file), true);
    echo generatePageContent($page_data, $category);
} else {
    echo '<p>Page not found</p>';
}

require __DIR__ . "/includes/footer.php";

// Content generation function
function generatePageContent($data, $category)
{
    if (!$data) {
        return '<p>No content available</p>';
    }

    $output = '';

    switch ($category) {
        case 'home':
            $output = generateHomeContent($data);
            break;
        case 'artworks':
            $output = generateArtworksContent($data);
            break;
        case 'biography':
            $output = generateBiographyContent($data);
            break;
        case 'contact':
            $output = generateContactContent($data);
            break;
        default:
            // Gallery pages
            $output = generateGalleryContent($data, $category);
            break;
    }

    return $output;
}

function generateHomeContent($data)
{
    $output = '<div class="page-menu">';

    if (isset($data['menuItems'])) {
        foreach ($data['menuItems'] as $item) {
            $output .= '<div class="landing-menu-item page">';
            $output .= sprintf(
                '<a href="/%s" class="json-link" data-category="%s" aria-label="%s">%s</a>',
                htmlspecialchars($item['category']),
                htmlspecialchars($item['category']),
                htmlspecialchars($item['ariaLabel']),
                htmlspecialchars($item['title'])
            );
            $output .= '<p>' . htmlspecialchars($item['description']) . '</p>';
            $output .= '</div>';
        }
    }

    // Add image item if exists
    if (isset($data['imageItem'])) {
        $output .= '<div class="landing-menu-item last-item">';
        $output .= '<p>';
        $output .= sprintf(
            '<img src="%s" class="img-home" alt="%s">',
            htmlspecialchars($data['imageItem']['src']),
            htmlspecialchars($data['imageItem']['alt'] ?? '')
        );
        $output .= '</p>';
        $output .= '</div>';
    }

    $output .= '</div>';
    return $output;
}

function generateArtworksContent($data)
{
    $output = '<div class="gallery-menu">';

    if (isset($data['categories'])) {
        foreach ($data['categories'] as $category) {
            $output .= '<div>';
            $output .= sprintf('<h3>%s</h3>', htmlspecialchars($category['title']));
            $output .= '<p>' . htmlspecialchars($category['description']) . '</p>';
            $output .= '</div>';
        }
    }

    $output .= '</div>';
    return $output;
}

function generateBiographyContent($data)
{
    $output = '<div class="body-paragraphs">';

    if (isset($data['content'])) {
        foreach ($data['content'] as $section) {
            if ($section['type'] === 'heading') {
                $output .= sprintf('<h2>%s</h2>', htmlspecialchars($section['text']));
            } elseif ($section['type'] === 'paragraph') {
                $output .= '<p>' . htmlspecialchars($section['text']) . '</p>';
            }
        }
    }

    $output .= '</div>';
    return $output;
}

function generateContactContent($data)
{
    $output = '<div class="contact-form-wrapper">';

    if (isset($data['form'])) {
        $output .= '<form class="ccform">';
        foreach ($data['form']['fields'] as $field) {
            $output .= '<div class="ccfield-prepend">';
            $output .= sprintf('<span class="ccform-addon">%s</span>', htmlspecialchars($field['label']));
            $output .= sprintf(
                '<%s class="ccformfield" name="%s" placeholder="%s"%s></%s>',
                $field['type'] === 'textarea' ? 'textarea' : 'input',
                htmlspecialchars($field['name']),
                htmlspecialchars($field['placeholder']),
                $field['type'] !== 'textarea' ? ' type="' . htmlspecialchars($field['type']) . '"' : '',
                $field['type'] === 'textarea' ? 'textarea' : 'input'
            );
            $output .= '</div>';
        }
        $output .= '<button type="submit" class="ccbtn">Send Message</button>';
        $output .= '</form>';
    }

    $output .= '</div>';
    return $output;
}

function generateGalleryContent($data, $category)
{
    $output = '<div class="slideshow-section">';
    $output .= '<div class="slideshow" data-category="' . htmlspecialchars($category) . '">';

    if (isset($data['images']) || isset($data['restorationProjects'])) {
        $items = $data['images'] ?? $data['restorationProjects'] ?? [];

        $output .= '<div data-role="stage">';
        foreach ($items as $index => $item) {
            $display = $index === 0 ? 'block' : 'none';
            $imageSrc = isset($item['filename']) ?
                "/assets/images/" . $category . "-images/" . $item['filename'] :
                $item['src'];

            $output .= sprintf(
                '<img src="%s" alt="%s" style="display: %s;" data-index="%d">',
                htmlspecialchars($imageSrc),
                htmlspecialchars($item['title'] ?? $item['alt'] ?? ''),
                $display,
                $index
            );
        }
        $output .= '</div>';

        // Navigation buttons
        $output .= '<button data-role="previous" class="prev-next circle" aria-label="Previous image">&lt;</button>';
        $output .= '<button data-role="next" class="prev-next circle" aria-label="Next image">&gt;</button>';

        // Caption
        $output .= '<div data-role="caption-wrap">';
        $firstItem = $items[0] ?? null;
        if ($firstItem) {
            $output .= '<div class="caption">' . htmlspecialchars($firstItem['title'] ?? '') . '</div>';
            if (isset($firstItem['description'])) {
                $output .= '<div class="description">' . htmlspecialchars($firstItem['description']) . '</div>';
            }
        }
        $output .= '</div>';
    }

    $output .= '</div>';
    $output .= '</div>';
    return $output;
}
?>
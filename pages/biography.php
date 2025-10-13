<?php
$page_title  = $page_title  ?? "Biography";
$active_page = $active_page ?? "biography";

// Canonical URL builder
$host = $_SERVER['HTTP_HOST'] ?? 'example.com';
$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
$scheme = $https ? 'https' : 'http';
$canonicalPath = '/' . ltrim($active_page, '/');
// If you prefer "/" for home, uncomment the next line
// if ($active_page === 'home') { $canonicalPath = '/'; }
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
?><section class="body-paragraphs" aria-labelledby="biography-page-heading">

    <p>As a child I spent many hours in my father&#39;s wood shop. He was a master cabinet maker, restorer of antique
        furniture, and a wood sculptor. My mother was an inventor and patent holder. It is no surprise, given the talent
        I was exposed to at such an early age, that I made the decision to attend art school. It was at the School of
        the Worcester Art Museum in Worcester Massachusetts that I began my formal education in the arts</p>
    <p>While at that school I was honored to receive the Frances Kinnicutt Foreign Travel Award for Women, which gave me
        the opportunity to study Minoan and Mycenaean art history and architecture on the island of Crete. I went on to
        earn a BA at Clark University in Worcester, Massachusetts.</p>

    <p>It was serendipity that brought me to my career in historic conservation and restoration While visiting an 1848
        Gothic Revival house that was undergoing decorative painting and plaster restoration I realized what a joy it
        would be to apply my art training to such endeavors. That same day I convinced the project supervisor to hire
        me, and so began my twenty-five year adventure in historic conservation and restoration.</p>
</section>
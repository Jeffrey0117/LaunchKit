// ─── HTML Escaping ───

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── Landing Page Renderer ───

function renderPage(config, slug) {
  const hero = config.hero || {};
  const features = config.features || [];
  const pricing = config.pricing || null;
  const og = config.og || {};
  const theme = config.theme || {};
  const footer = config.footer || {};

  const primary = escapeHtml(theme.primaryColor || '#2563eb');
  const accent = escapeHtml(theme.accentColor || '#7c3aed');
  const bg = escapeHtml(theme.bgColor || '#ffffff');

  const ogTitle = escapeHtml(og.title || hero.headline || 'LaunchKit Page');
  const ogDesc = escapeHtml(og.description || hero.subheadline || '');
  const ogImage = og.imageUrl ? `<meta property="og:image" content="${escapeHtml(og.imageUrl)}"><meta name="twitter:image" content="${escapeHtml(og.imageUrl)}">` : '';

  const heroSection = `
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-text">
          ${hero.headline ? `<h1 class="hero-headline">${escapeHtml(hero.headline)}</h1>` : ''}
          ${hero.subheadline ? `<p class="hero-sub">${escapeHtml(hero.subheadline)}</p>` : ''}
          ${hero.ctaText ? `<a href="${escapeHtml(hero.ctaUrl || '#')}" class="btn btn-primary">${escapeHtml(hero.ctaText)}</a>` : ''}
        </div>
        ${hero.imageUrl ? `<div class="hero-image"><img src="${escapeHtml(hero.imageUrl)}" alt="" loading="lazy"></div>` : ''}
      </div>
    </section>`;

  const featuresSection = features.length > 0 ? `
    <section class="features">
      <div class="container">
        <div class="features-grid">
          ${features.map(f => `
            <div class="feature-card">
              ${f.icon ? `<div class="feature-icon">${escapeHtml(f.icon)}</div>` : ''}
              ${f.title ? `<h3 class="feature-title">${escapeHtml(f.title)}</h3>` : ''}
              ${f.description ? `<p class="feature-desc">${escapeHtml(f.description)}</p>` : ''}
            </div>`).join('')}
        </div>
      </div>
    </section>` : '';

  const pricingSection = pricing ? `
    <section class="pricing">
      <div class="container">
        <div class="pricing-card">
          <div class="pricing-price">
            <span class="pricing-currency">${escapeHtml(pricing.currency || '$')}</span>
            <span class="pricing-amount">${escapeHtml(String(pricing.price != null ? pricing.price : ''))}</span>
            ${pricing.period ? `<span class="pricing-period">/ ${escapeHtml(pricing.period)}</span>` : ''}
          </div>
          ${pricing.features && pricing.features.length > 0 ? `
            <ul class="pricing-features">
              ${pricing.features.map(f => `<li><span class="check">&#10003;</span> ${escapeHtml(f)}</li>`).join('')}
            </ul>` : ''}
          ${pricing.ctaText ? `<a href="${escapeHtml(pricing.ctaUrl || '#')}" class="btn btn-accent">${escapeHtml(pricing.ctaText)}</a>` : ''}
        </div>
      </div>
    </section>` : '';

  const footerLinks = (footer.links || [])
    .map(l => `<a href="${escapeHtml(l.url || '#')}">${escapeHtml(l.label || '')}</a>`)
    .join('');

  const footerSection = `
    <footer class="site-footer">
      <div class="container footer-inner">
        ${footer.text ? `<p class="footer-text">${escapeHtml(footer.text)}</p>` : ''}
        ${footerLinks ? `<nav class="footer-links">${footerLinks}</nav>` : ''}
      </div>
    </footer>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${ogTitle}</title>
  <meta property="og:title" content="${ogTitle}">
  <meta property="og:description" content="${ogDesc}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${ogTitle}">
  <meta name="twitter:description" content="${ogDesc}">
  ${ogImage}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --primary: ${primary};
      --accent: ${accent};
      --bg: ${bg};
      --text: #1e293b;
      --text-muted: #64748b;
      --surface: #f8fafc;
      --border: #e2e8f0;
      --radius: 12px;
      --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
      --shadow-lg: 0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.06);
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 1120px;
      margin: 0 auto;
      padding: 0 clamp(1rem, 4vw, 2.5rem);
    }

    /* ─── Accent Bar ─── */
    body::before {
      content: '';
      display: block;
      height: 4px;
      background: linear-gradient(90deg, var(--primary), var(--accent));
    }

    /* ─── Hero ─── */
    .hero {
      padding: clamp(3rem, 8vw, 7rem) 0 clamp(2rem, 6vw, 5rem);
    }
    .hero-inner {
      display: flex;
      align-items: center;
      gap: clamp(2rem, 4vw, 4rem);
    }
    .hero-text { flex: 1; min-width: 0; }
    .hero-headline {
      font-size: clamp(2rem, 5vw, 3.75rem);
      font-weight: 800;
      line-height: 1.12;
      letter-spacing: -0.025em;
      background: linear-gradient(135deg, var(--text) 40%, var(--primary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1rem;
    }
    .hero-sub {
      font-size: clamp(1.05rem, 2vw, 1.3rem);
      color: var(--text-muted);
      max-width: 540px;
      margin-bottom: 2rem;
    }
    .hero-image {
      flex: 0 0 auto;
      max-width: 44%;
    }
    .hero-image img {
      width: 100%;
      height: auto;
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
    }

    /* ─── Buttons ─── */
    .btn {
      display: inline-block;
      padding: 0.85rem 2rem;
      border-radius: 9999px;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .btn:hover {
      transform: translateY(-1px);
    }
    .btn-primary {
      background: var(--primary);
      color: #fff;
      box-shadow: 0 4px 14px color-mix(in srgb, var(--primary) 35%, transparent);
    }
    .btn-primary:hover {
      box-shadow: 0 6px 20px color-mix(in srgb, var(--primary) 45%, transparent);
    }
    .btn-accent {
      background: var(--accent);
      color: #fff;
      box-shadow: 0 4px 14px color-mix(in srgb, var(--accent) 35%, transparent);
    }
    .btn-accent:hover {
      box-shadow: 0 6px 20px color-mix(in srgb, var(--accent) 45%, transparent);
    }

    /* ─── Features ─── */
    .features {
      padding: clamp(2rem, 6vw, 5rem) 0;
      background: var(--surface);
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: clamp(1rem, 2.5vw, 1.75rem);
    }
    .feature-card {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: clamp(1.25rem, 2.5vw, 2rem);
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .feature-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }
    .feature-icon {
      font-size: 2rem;
      margin-bottom: 0.75rem;
    }
    .feature-title {
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .feature-desc {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    /* ─── Pricing ─── */
    .pricing {
      padding: clamp(3rem, 6vw, 5rem) 0;
      text-align: center;
    }
    .pricing-card {
      display: inline-block;
      background: var(--bg);
      border: 2px solid var(--border);
      border-radius: calc(var(--radius) * 1.5);
      padding: clamp(2rem, 4vw, 3rem) clamp(2rem, 5vw, 4rem);
      box-shadow: var(--shadow-lg);
      text-align: center;
      max-width: 420px;
    }
    .pricing-price {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 0.15em;
      margin-bottom: 1.5rem;
    }
    .pricing-currency {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-muted);
      align-self: flex-start;
      margin-top: 0.4em;
    }
    .pricing-amount {
      font-size: clamp(2.5rem, 6vw, 4rem);
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.03em;
    }
    .pricing-period {
      font-size: 1.1rem;
      color: var(--text-muted);
    }
    .pricing-features {
      list-style: none;
      text-align: left;
      margin-bottom: 2rem;
    }
    .pricing-features li {
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.98rem;
    }
    .pricing-features li:last-child { border-bottom: none; }
    .pricing-features .check {
      color: var(--primary);
      font-weight: 700;
      margin-right: 0.5rem;
    }

    /* ─── Footer ─── */
    .site-footer {
      padding: 2.5rem 0;
      border-top: 1px solid var(--border);
    }
    .footer-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .footer-text {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .footer-links {
      display: flex;
      gap: 1.5rem;
    }
    .footer-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.15s;
    }
    .footer-links a:hover { color: var(--primary); }

    /* ─── Responsive ─── */
    @media (max-width: 768px) {
      .hero-inner { flex-direction: column; text-align: center; }
      .hero-sub { margin-left: auto; margin-right: auto; }
      .hero-image { max-width: 85%; }
      .footer-inner { flex-direction: column; text-align: center; }
      .footer-links { justify-content: center; }
    }
  </style>
</head>
<body>
  ${heroSection}
  ${featuresSection}
  ${pricingSection}
  ${footerSection}
</body>
</html>`;
}

// ─── 404 Page ───

function render404() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>404 &mdash; Page Not Found</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      text-align: center;
    }
    .wrap { padding: 2rem; }
    h1 {
      font-size: 6rem;
      font-weight: 800;
      letter-spacing: -0.04em;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.25rem;
    }
    p { color: #64748b; font-size: 1.15rem; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>404</h1>
    <p>This page doesn&rsquo;t exist yet.</p>
  </div>
</body>
</html>`;
}

module.exports = { renderPage, render404 };

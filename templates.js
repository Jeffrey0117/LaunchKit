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
  const social = config.social || {};
  const urgency = config.urgency || {};
  const faq = config.faq || [];

  const primary = escapeHtml(theme.primaryColor || '#6366f1');
  const accent = escapeHtml(theme.accentColor || '#f59e0b');
  const bg = escapeHtml(theme.bgColor || '#0b0f1a');
  const isDark = theme.mode === 'dark' || (!theme.mode && bg.match(/^#[0-3]/));

  const ogTitle = escapeHtml(og.title || hero.headline || 'LaunchKit Page');
  const ogDesc = escapeHtml(og.description || hero.subheadline || '');
  const ogImage = og.imageUrl ? `<meta property="og:image" content="${escapeHtml(og.imageUrl)}"><meta name="twitter:image" content="${escapeHtml(og.imageUrl)}">` : '';

  // ─── Hero Section ───
  const heroSection = `
    <section class="hero">
      <div class="hero-bg-glow"></div>
      <div class="container hero-inner">
        <div class="hero-text">
          ${hero.badge ? `<div class="hero-badge">${escapeHtml(hero.badge)}</div>` : ''}
          ${hero.headline ? `<h1 class="hero-headline">${escapeHtml(hero.headline)}</h1>` : ''}
          ${hero.subheadline ? `<p class="hero-sub">${escapeHtml(hero.subheadline)}</p>` : ''}
          ${hero.ctaText ? `<a href="${escapeHtml(hero.ctaUrl || '#pricing')}" class="btn btn-primary btn-glow">${escapeHtml(hero.ctaText)}</a>` : ''}
        </div>
        ${hero.imageUrl ? `<div class="hero-image"><img src="${escapeHtml(hero.imageUrl)}" alt="" loading="lazy"></div>` : ''}
      </div>
    </section>`;

  // ─── Social Proof ───
  const socialSection = social.stats && social.stats.length > 0 ? `
    <section class="social-proof">
      <div class="container">
        <div class="stats-grid">
          ${social.stats.map(s => `
            <div class="stat-item">
              <div class="stat-number">${escapeHtml(s.value)}</div>
              <div class="stat-label">${escapeHtml(s.label)}</div>
            </div>`).join('')}
        </div>
      </div>
    </section>` : '';

  // ─── Features ───
  const featuresSection = features.length > 0 ? `
    <section class="features" id="features">
      <div class="container">
        ${config.featuresTitle ? `<h2 class="section-title">${escapeHtml(config.featuresTitle)}</h2>` : ''}
        ${config.featuresSubtitle ? `<p class="section-sub">${escapeHtml(config.featuresSubtitle)}</p>` : ''}
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

  // ─── Pricing ───
  const pricingPlans = pricing && pricing.plans ? pricing.plans : (pricing && pricing.price != null ? [pricing] : []);
  const pricingSection = pricingPlans.length > 0 ? `
    <section class="pricing" id="pricing">
      <div class="container">
        ${pricing.title ? `<h2 class="section-title">${escapeHtml(pricing.title)}</h2>` : ''}
        ${pricing.subtitle ? `<p class="section-sub">${escapeHtml(pricing.subtitle)}</p>` : ''}
        <div class="pricing-grid pricing-cols-${Math.min(pricingPlans.length, 3)}">
          ${pricingPlans.map(plan => `
            <div class="pricing-card${plan.highlighted ? ' pricing-highlighted' : ''}">
              ${plan.badge ? `<div class="pricing-badge">${escapeHtml(plan.badge)}</div>` : ''}
              ${plan.name ? `<h3 class="pricing-name">${escapeHtml(plan.name)}</h3>` : ''}
              ${plan.description ? `<p class="pricing-desc">${escapeHtml(plan.description)}</p>` : ''}
              ${plan.originalPrice != null && plan.originalPrice !== '' ? `<div class="pricing-anchor"><span class="pricing-original">${escapeHtml(plan.currency || 'NT$')}${escapeHtml(String(plan.originalPrice))}</span>${(Number(plan.originalPrice) > Number(plan.price)) ? `<span class="pricing-save">省 ${Math.round((1 - Number(plan.price) / Number(plan.originalPrice)) * 100)}%</span>` : ''}</div>` : ''}
              <div class="pricing-price">
                <span class="pricing-currency">${escapeHtml(plan.currency || 'NT$')}</span>
                <span class="pricing-amount">${escapeHtml(String(plan.price != null ? plan.price : ''))}</span>
                ${plan.period ? `<span class="pricing-period">/ ${escapeHtml(plan.period)}</span>` : ''}
              </div>
              ${plan.features && plan.features.length > 0 ? `
                <ul class="pricing-features">
                  ${plan.features.map(f => `<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> ${escapeHtml(f)}</li>`).join('')}
                </ul>` : ''}
              ${plan.ctaText ? `<a href="${escapeHtml(plan.ctaUrl || '#')}" class="btn ${plan.highlighted ? 'btn-primary btn-glow' : 'btn-outline'}">${escapeHtml(plan.ctaText)}</a>` : ''}
            </div>`).join('')}
        </div>
      </div>
    </section>` : '';

  // ─── Urgency / CTA ───
  const urgencySection = urgency.headline ? `
    <section class="urgency">
      <div class="container urgency-inner">
        <h2 class="urgency-headline">${escapeHtml(urgency.headline)}</h2>
        ${urgency.subheadline ? `<p class="urgency-sub">${escapeHtml(urgency.subheadline)}</p>` : ''}
        ${urgency.ctaText ? `<a href="${escapeHtml(urgency.ctaUrl || '#pricing')}" class="btn btn-primary btn-glow btn-lg">${escapeHtml(urgency.ctaText)}</a>` : ''}
      </div>
    </section>` : '';

  // ─── FAQ ───
  const faqSection = faq.length > 0 ? `
    <section class="faq" id="faq">
      <div class="container">
        <h2 class="section-title">${escapeHtml(config.faqTitle || 'FAQ')}</h2>
        <div class="faq-list">
          ${faq.map(item => `
            <details class="faq-item">
              <summary class="faq-q">${escapeHtml(item.q)}</summary>
              <div class="faq-a">${escapeHtml(item.a)}</div>
            </details>`).join('')}
        </div>
      </div>
    </section>` : '';

  // ─── Footer ───
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
<html lang="zh-TW">
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --primary: ${primary};
      --accent: ${accent};
      --bg: ${bg};
      --bg-elevated: ${isDark ? `color-mix(in srgb, ${bg} 85%, #fff 15%)` : '#f8fafc'};
      --bg-card: ${isDark ? `color-mix(in srgb, ${bg} 75%, #fff 25%)` : '#f1f5f9'};
      --text: ${isDark ? '#e8ecf4' : '#1e293b'};
      --text-muted: ${isDark ? '#8b95a8' : '#64748b'};
      --text-bright: ${isDark ? '#ffffff' : '#0f172a'};
      --border: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
      --border-bright: ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'};
      --glow: color-mix(in srgb, var(--primary) ${isDark ? '40' : '25'}%, transparent);
      --radius: 16px;
    }

    body {
      font-family: 'Noto Sans TC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 clamp(1.25rem, 5vw, 2.5rem);
    }

    /* ─── Hero ─── */
    .hero {
      position: relative;
      padding: clamp(5rem, 12vw, 10rem) 0 clamp(3rem, 8vw, 6rem);
      text-align: center;
      overflow: hidden;
    }
    .hero-bg-glow {
      position: absolute;
      top: -40%;
      left: 50%;
      transform: translateX(-50%);
      width: 800px;
      height: 800px;
      background: radial-gradient(circle, var(--glow) 0%, transparent 70%);
      pointer-events: none;
      opacity: 0.6;
    }
    .hero-inner {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .hero-text {
      max-width: 720px;
    }
    .hero-badge {
      display: inline-block;
      padding: 0.4rem 1.2rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      background: color-mix(in srgb, var(--accent) 15%, transparent);
      color: var(--accent);
      border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
      margin-bottom: 1.5rem;
    }
    .hero-headline {
      font-size: clamp(2.2rem, 6vw, 3.8rem);
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: -0.02em;
      color: var(--text-bright);
      margin-bottom: 1.25rem;
    }
    .hero-headline em {
      font-style: normal;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-sub {
      font-size: clamp(1.05rem, 2.2vw, 1.3rem);
      color: var(--text-muted);
      max-width: 560px;
      margin: 0 auto 2.5rem;
      line-height: 1.8;
    }
    .hero-image {
      margin-top: 3rem;
      max-width: 600px;
      width: 100%;
    }
    .hero-image img {
      width: 100%;
      height: auto;
      border-radius: var(--radius);
      border: 1px solid var(--border);
    }

    /* ─── Buttons ─── */
    .btn {
      display: inline-block;
      padding: 0.9rem 2.4rem;
      border-radius: 12px;
      font-size: 1.05rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 70%, var(--accent)));
      color: #fff;
    }
    .btn-glow {
      box-shadow: 0 4px 25px var(--glow), 0 0 60px color-mix(in srgb, var(--primary) 20%, transparent);
    }
    .btn-glow:hover {
      box-shadow: 0 6px 35px var(--glow), 0 0 80px color-mix(in srgb, var(--primary) 30%, transparent);
      transform: translateY(-2px);
    }
    .btn-outline {
      background: transparent;
      color: var(--text);
      border: 2px solid var(--border-bright);
    }
    .btn-outline:hover {
      border-color: var(--primary);
      color: var(--primary);
      transform: translateY(-2px);
    }
    .btn-lg {
      padding: 1.1rem 3rem;
      font-size: 1.15rem;
    }

    /* ─── Social Proof / Stats ─── */
    .social-proof {
      padding: clamp(2rem, 4vw, 3rem) 0;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }
    .stats-grid {
      display: flex;
      justify-content: center;
      gap: clamp(2rem, 5vw, 5rem);
      flex-wrap: wrap;
    }
    .stat-item {
      text-align: center;
    }
    .stat-number {
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      font-weight: 900;
      color: var(--primary);
      line-height: 1.2;
    }
    .stat-label {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    /* ─── Section Titles ─── */
    .section-title {
      font-size: clamp(1.6rem, 3.5vw, 2.4rem);
      font-weight: 900;
      text-align: center;
      color: var(--text-bright);
      margin-bottom: 0.5rem;
    }
    .section-sub {
      text-align: center;
      color: var(--text-muted);
      font-size: 1.05rem;
      margin-bottom: 3rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    /* ─── Features ─── */
    .features {
      padding: clamp(4rem, 8vw, 7rem) 0;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: clamp(1rem, 2vw, 1.5rem);
    }
    .feature-card {
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: clamp(1.5rem, 3vw, 2rem);
      transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
    }
    .feature-card:hover {
      border-color: color-mix(in srgb, var(--primary) 40%, transparent);
      box-shadow: 0 0 30px color-mix(in srgb, var(--primary) 10%, transparent);
      transform: translateY(-3px);
    }
    .feature-icon {
      font-size: 1.8rem;
      margin-bottom: 0.75rem;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: color-mix(in srgb, var(--primary) 12%, transparent);
      color: var(--primary);
    }
    .feature-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-bright);
      margin-bottom: 0.5rem;
    }
    .feature-desc {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.7;
    }

    /* ─── Pricing ─── */
    .pricing {
      padding: clamp(4rem, 8vw, 7rem) 0;
    }
    .pricing-grid {
      display: grid;
      gap: clamp(1rem, 2vw, 1.5rem);
      align-items: start;
      margin-top: 1.75rem;
    }
    .pricing-cols-1 { grid-template-columns: minmax(0, 420px); justify-content: center; }
    .pricing-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .pricing-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .pricing-card {
      position: relative;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: calc(var(--radius) * 1.2);
      padding: clamp(1.75rem, 3vw, 2.5rem);
      text-align: center;
      display: flex;
      flex-direction: column;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .pricing-card:hover {
      transform: translateY(-4px);
    }
    .pricing-highlighted {
      border-color: var(--primary);
      background: ${isDark ? 'color-mix(in srgb, var(--primary) 5%, var(--bg-elevated))' : '#fff'};
      box-shadow: 0 0 40px color-mix(in srgb, var(--primary) 15%, transparent),
                  0 4px 20px rgba(0,0,0,0.2);
      transform: scale(1.04);
      z-index: 1;
    }
    .pricing-highlighted:hover {
      transform: scale(1.04) translateY(-4px);
    }
    .pricing-badge {
      position: absolute;
      top: -14px; left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: #fff;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.35rem 1.25rem;
      border-radius: 9999px;
      letter-spacing: 0.05em;
      white-space: nowrap;
    }
    .pricing-name {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--text-bright);
      margin-bottom: 0.4rem;
    }
    .pricing-desc {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }
    .pricing-price {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 0.15em;
      margin-bottom: 1.75rem;
    }
    .pricing-currency {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-muted);
      align-self: flex-start;
      margin-top: 0.5em;
    }
    .pricing-amount {
      font-size: clamp(2.2rem, 5vw, 3rem);
      font-weight: 900;
      line-height: 1;
      letter-spacing: -0.03em;
      color: var(--text-bright);
    }
    .pricing-period {
      font-size: 0.95rem;
      color: var(--text-muted);
    }
    .pricing-anchor {
      display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.25rem;
    }
    .pricing-original {
      font-size: 1.05rem; color: var(--text-muted); text-decoration: line-through;
    }
    .pricing-save {
      font-size: 0.8rem; font-weight: 800; color: #fff;
      background: var(--accent); padding: 2px 8px; border-radius: 999px;
    }
    .pricing-features {
      list-style: none;
      text-align: left;
      margin-bottom: 2rem;
      flex: 1;
    }
    .pricing-features li {
      padding: 0.55rem 0;
      font-size: 0.93rem;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .pricing-features li svg {
      flex-shrink: 0;
      color: var(--primary);
    }
    .pricing-card .btn {
      margin-top: auto;
      align-self: stretch;
      text-align: center;
    }

    @media (max-width: 768px) {
      .pricing-cols-2, .pricing-cols-3 { grid-template-columns: 1fr; }
      .pricing-highlighted { transform: none; }
      .pricing-highlighted:hover { transform: translateY(-4px); }
    }

    /* ─── Urgency CTA ─── */
    .urgency {
      padding: clamp(4rem, 8vw, 6rem) 0;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .urgency::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 8%, transparent), color-mix(in srgb, var(--accent) 8%, transparent));
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }
    .urgency-inner {
      position: relative;
      z-index: 1;
    }
    .urgency-headline {
      font-size: clamp(1.6rem, 4vw, 2.4rem);
      font-weight: 900;
      color: var(--text-bright);
      margin-bottom: 0.75rem;
    }
    .urgency-sub {
      color: var(--text-muted);
      font-size: 1.05rem;
      max-width: 550px;
      margin: 0 auto 2rem;
    }

    /* ─── FAQ ─── */
    .faq {
      padding: clamp(4rem, 8vw, 6rem) 0;
    }
    .faq-list {
      max-width: 700px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .faq-item {
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .faq-item[open] {
      border-color: color-mix(in srgb, var(--primary) 30%, transparent);
    }
    .faq-q {
      padding: 1.25rem 1.5rem;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      list-style: none;
      color: var(--text-bright);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .faq-q::-webkit-details-marker { display: none; }
    .faq-q::after {
      content: '+';
      font-size: 1.3rem;
      font-weight: 400;
      color: var(--text-muted);
      transition: transform 0.2s;
    }
    .faq-item[open] .faq-q::after {
      transform: rotate(45deg);
    }
    .faq-a {
      padding: 0 1.5rem 1.25rem;
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.8;
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
      font-size: 0.85rem;
    }
    .footer-links {
      display: flex;
      gap: 1.5rem;
    }
    .footer-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.85rem;
      transition: color 0.15s;
    }
    .footer-links a:hover { color: var(--primary); }

    /* ─── Responsive ─── */
    @media (max-width: 768px) {
      .hero { text-align: center; }
      .hero-image { max-width: 90%; }
      .footer-inner { flex-direction: column; text-align: center; }
      .footer-links { justify-content: center; }
      .stats-grid { gap: 2rem; }
    }

    /* ─── Smooth Scroll ─── */
    html { scroll-behavior: smooth; }

    /* ─── Selection ─── */
    ::selection {
      background: color-mix(in srgb, var(--primary) 30%, transparent);
      color: var(--text-bright);
    }
  </style>
</head>
<body>
  ${heroSection}
  ${socialSection}
  ${featuresSection}
  ${pricingSection}
  ${urgencySection}
  ${faqSection}
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
      background: #0b0f1a;
      color: #e8ecf4;
      text-align: center;
    }
    .wrap { padding: 2rem; }
    h1 {
      font-size: 6rem;
      font-weight: 900;
      letter-spacing: -0.04em;
      background: linear-gradient(135deg, #6366f1, #f59e0b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.25rem;
    }
    p { color: #8b95a8; font-size: 1.15rem; }
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

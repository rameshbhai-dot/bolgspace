const defaultBanners = {
  technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  lifestyle: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
  business: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  editorial: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
  education: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
  culture: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80',
  science: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
  opinion: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
  fallback: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=800&q=80'
};

export function getFeaturedImage(post) {
  if (post.featured_image) return post.featured_image;
  const slug = post.categories ? post.categories.slug : 'fallback';
  return defaultBanners[slug] || defaultBanners.fallback;
}

export function renderPostCard(post) {
  const date = new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const categoryStr = post.categories ? `<span class="category-badge" style="position: absolute; top: var(--space-3); left: var(--space-3);">${post.categories.name}</span>` : '';
  const authorName = post.users ? (post.users.display_name || post.users.username) : 'Unknown';
  const imageUrl = getFeaturedImage(post);
  
  return `
    <article class="post-card">
      <a href="#/blog/${post.slug}" style="text-decoration: none; color: inherit;">
        <div class="post-card-image" style="background-image: url('${imageUrl}')">
          ${categoryStr}
        </div>
        <div class="post-card-body">
          <h3 class="post-card-title">${post.title}</h3>
          <p class="post-card-excerpt">${post.excerpt || ''}</p>
          <div class="post-card-meta">
            <span>${authorName}</span>
            <span class="dot">&middot;</span>
            <span>${date}</span>
          </div>
        </div>
      </a>
    </article>
  `;
}

export function renderAd(ad) {
  if (!ad) return '';
  if (ad.html_code) {
    return `<div style="margin-bottom: var(--space-4); text-align: center;">${ad.html_code}</div>`;
  } else if (ad.image_url) {
    return `
      <div style="margin-bottom: var(--space-4); text-align: center;">
        <a href="${ad.link_url || '#'}" target="_blank">
          <img src="${ad.image_url}" alt="${ad.title || 'Ad'}" style="max-width: 100%; height: auto; border-radius: var(--radius-md);">
        </a>
      </div>
    `;
  }
  return '';
}

export function renderHero(post) {
  if (!post) return '';
  const date = new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const authorName = post.users ? (post.users.display_name || post.users.username) : 'Unknown';
  const imageUrl = getFeaturedImage(post);
  
  return `
    <section class="hero">
      <a href="#/blog/${post.slug}" class="hero-card">
        <div class="hero-card-image" style="background-image: url('${imageUrl}')"></div>
        <div class="hero-card-overlay"></div>
        <div class="hero-card-content">
          ${post.categories ? `<span class="category-badge">${post.categories.name}</span>` : ''}
          <h1>${post.title}</h1>
          <p>${post.excerpt || ''}</p>
          <div class="hero-card-meta">
            <span>${authorName}</span>
            <span class="dot">&middot;</span>
            <span>${date}</span>
          </div>
        </div>
      </a>
    </section>
  `;
}

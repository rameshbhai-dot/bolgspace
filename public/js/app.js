import { supabase } from './supabase.js';
import { renderPostCard, renderAd, renderHero } from './components.js';

let currentUser = null;

// Initialize App
async function init() {
  // Check auth state
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).single();
    currentUser = userData;
  }
  
  updateNav();
  
  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      currentUser = userData;
    } else {
      currentUser = null;
    }
    updateNav();
  });

  // Handle routing
  window.addEventListener('hashchange', router);
  router(); // Run on load
}

function updateNav() {
  const authNav = document.getElementById('authNav');
  if (currentUser) {
    authNav.innerHTML = `
      <div class="nav-dropdown">
        <button class="nav-link dropdown-trigger" style="display: flex; align-items: center; gap: 8px;">
          <div class="avatar avatar-sm">${currentUser.display_name.charAt(0).toUpperCase()}</div>
        </button>
        <div class="dropdown-menu dropdown-menu-right">
          <div style="padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border-light); margin-bottom: var(--space-2);">
            <strong style="display: block; font-size: var(--font-size-sm);">${currentUser.display_name}</strong>
            <span style="font-size: 0.75rem; color: var(--color-text-muted);">${currentUser.email}</span>
          </div>
          ${currentUser.role === 'admin' ? '<a href="#/admin" class="dropdown-item">Admin Panel</a>' : ''}
          <button id="logoutBtn" class="dropdown-item" style="color: red; width: 100%; text-align: left; cursor: pointer;">Log Out</button>
        </div>
      </div>
    `;
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.hash = '#/';
    });
  } else {
    authNav.innerHTML = `
      <a href="#/auth/login" class="nav-link">Log In</a>
      <a href="#/auth/signup" class="btn btn-primary" style="padding: 0.5rem 1rem;">Sign Up</a>
    `;
  }
}

// Simple Hash Router
async function router() {
  const hash = window.location.hash || '#/';
  const root = document.getElementById('app-root');
  
  root.innerHTML = '<div style="text-align: center; padding: 100px;"><h2>Loading...</h2></div>';

  if (hash === '#/') {
    await renderHome(root);
  } else if (hash.startsWith('#/blog/')) {
    const slug = hash.split('#/blog/')[1];
    await renderPost(root, slug);
  } else if (hash === '#/about') {
    root.innerHTML = `
      <div class="page-header"><div class="container"><h1>About Us</h1></div></div>
      <div class="container" style="max-width: 800px; padding: 40px 0;"><p>This is a completely static, client-side rendered version of BlogSpace!</p></div>
    `;
  } else {
    root.innerHTML = '<div style="text-align: center; padding: 100px;"><h2>404 - Page Not Found</h2></div>';
  }
}

async function renderHome(root) {
  const now = new Date().toISOString();
  
  const [postsRes, sponsoredRes, adsRes] = await Promise.all([
    supabase.from('posts').select('*, users(display_name, username), categories(name)').eq('status', 'published').order('created_at', { ascending: false }).limit(13),
    supabase.from('posts').select('*, users(display_name, username), categories(name)').eq('status', 'published').eq('is_sponsored', true).order('created_at', { ascending: false }),
    supabase.from('ads').select('*').eq('is_active', true).lte('start_date', now).gte('end_date', now)
  ]);

  const posts = postsRes.data || [];
  const sponsored = sponsoredRes.data || [];
  const ads = adsRes.data || [];
  
  const heroAds = ads.filter(a => a.placement === 'homepage_hero');
  const sidebarAds = ads.filter(a => a.placement === 'sidebar' || !a.placement);

  let html = '';
  
  // Sponsored
  if (sponsored.length > 0) {
    html += `
      <section class="container" style="margin-top: 32px; margin-bottom: 16px;">
        <h2 style="font-size: 1.5rem; color: var(--color-primary); border-bottom: 2px solid; padding-bottom: 8px; margin-bottom: 24px;">Featured & Sponsored</h2>
        <div class="posts-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
          ${sponsored.map(renderPostCard).join('')}
        </div>
      </section>
    `;
  }

  // Hero
  if (posts.length > 0) {
    html += renderHero(posts[0]);
  }

  // Main Content
  html += `<div class="container">`;
  
  if (heroAds.length > 0) {
    html += `<div style="text-align: center; margin-bottom: 40px;"><span style="font-size:10px;color:gray;">Advertisement</span>${heroAds.map(renderAd).join('')}</div>`;
  }

  html += `<div class="section-header"><h2 class="section-title">Latest Articles</h2></div>
    <div class="content-with-sidebar">
      <div class="main-content">
        <div class="posts-grid">
          ${posts.slice(1).map(renderPostCard).join('')}
        </div>
      </div>
      <aside class="sidebar">
        ${sidebarAds.length > 0 ? sidebarAds.map(ad => `<div class="sidebar-ad"><span class="ad-label">Advertisement</span>${renderAd(ad)}</div>`).join('') : '<div class="sidebar-ad"><p>Ad Space</p></div>'}
      </aside>
    </div>
  </div>`;
  
  root.innerHTML = html;
}

async function renderPost(root, slug) {
  const { data: post } = await supabase.from('posts').select('*, users(display_name, bio), categories(name)').eq('slug', slug).eq('status', 'published').single();
  if (!post) {
    root.innerHTML = '<div style="text-align: center; padding: 100px;"><h2>Post Not Found</h2></div>';
    return;
  }
  
  const now = new Date().toISOString();
  const { data: ads } = await supabase.from('ads').select('*').eq('is_active', true).lte('start_date', now).gte('end_date', now);
  const articleAds = (ads || []).filter(a => a.placement === 'in_article');

  root.innerHTML = `
    <header class="article-header">
      ${post.categories ? `<span class="category-badge">${post.categories.name}</span>` : ''}
      <h1>${post.title}</h1>
    </header>
    ${post.featured_image ? `<div class="container"><img src="${post.featured_image}" style="width:100%; max-height:400px; object-fit:cover; border-radius:8px;"></div>` : ''}
    <div class="container">
      <div class="content-with-sidebar">
        <div class="main-content">
          <article class="article-content">${post.content}</article>
          ${articleAds.length > 0 ? `<div style="margin: 32px 0; padding: 16px; background: #f9f9f9; text-align: center;"><span style="font-size:10px;color:gray;">Advertisement</span>${articleAds.map(renderAd).join('')}</div>` : ''}
        </div>
      </div>
    </div>
  `;
}

init();

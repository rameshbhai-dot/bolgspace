import { supabase } from '../supabase.js';
import { renderPostCard, renderAd, renderHero } from '../components.js';

export async function renderHome(root) {
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
          ${posts.length > 0
            ? (posts.length > 1 ? posts.slice(1).map(renderPostCard).join('') : posts.map(renderPostCard).join(''))
            : '<div class="empty-state"><h3>No articles published yet</h3><p>Be the first to write a story!</p></div>'
          }
        </div>
      </div>
      <aside class="sidebar">
        ${sidebarAds.length > 0 ? sidebarAds.map(ad => `<div class="sidebar-ad"><span class="ad-label">Advertisement</span>${renderAd(ad)}</div>`).join('') : '<div class="sidebar-ad"><p>Ad Space</p></div>'}
      </aside>
    </div>
  </div>`;
  
  root.innerHTML = html;
}

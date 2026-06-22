import { supabase } from '../supabase.js';
import { renderAd, getFeaturedImage } from '../components.js';

export async function renderPost(root, slug, currentUser) {
  const { data: post } = await supabase.from('posts').select('*, users(display_name, bio), categories(name)').eq('slug', slug).eq('status', 'published').single();
  if (!post) {
    root.innerHTML = '<div style="text-align: center; padding: 100px;"><h2>Post Not Found</h2></div>';
    return;
  }
  
  const now = new Date().toISOString();
  const { data: ads } = await supabase.from('ads').select('*').eq('is_active', true).lte('start_date', now).gte('end_date', now);
  const articleAds = (ads || []).filter(a => a.placement === 'in_article');

  // Check if current user can edit/delete this post
  const isAuthorOrAdmin = currentUser && (currentUser.id === post.user_id || currentUser.role === 'admin');
  const toolbarHtml = isAuthorOrAdmin ? `
    <div style="display: flex; gap: 12px; justify-content: center; margin-top: var(--space-4); margin-bottom: var(--space-4);">
      <a href="#/dashboard/edit/${post.id}" class="btn btn-outline btn-sm">Edit Post</a>
      <button id="deletePostBtnDetail" class="btn btn-danger btn-sm" style="border-radius: var(--radius-md);">Delete Post</button>
    </div>
  ` : '';

  const imageUrl = getFeaturedImage(post);

  root.innerHTML = `
    <header class="article-header">
      ${post.categories ? `<span class="category-badge">${post.categories.name}</span>` : ''}
      <h1>${post.title}</h1>
      ${toolbarHtml}
    </header>
    <div class="container"><img src="${imageUrl}" style="width:100%; max-height:400px; object-fit:cover; border-radius:8px;"></div>
    <div class="container">
      <div class="content-with-sidebar">
        <div class="main-content">
          <article class="article-content">${post.content}</article>
          ${articleAds.length > 0 ? `<div style="margin: 32px 0; padding: 16px; background: #f9f9f9; text-align: center;"><span style="font-size:10px;color:gray;">Advertisement</span>${articleAds.map(renderAd).join('')}</div>` : ''}
        </div>
      </div>
    </div>
  `;

  // Bind event for delete button if it exists
  if (isAuthorOrAdmin) {
    const deleteBtn = document.getElementById('deletePostBtnDetail');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
          deleteBtn.disabled = true;
          deleteBtn.innerText = 'Deleting...';
          const { error } = await supabase.from('posts').delete().eq('id', post.id);
          if (error) {
            alert('Failed to delete post: ' + error.message);
            deleteBtn.disabled = false;
            deleteBtn.innerText = 'Delete Post';
          } else {
            window.location.hash = '#/';
          }
        }
      });
    }
  }
}

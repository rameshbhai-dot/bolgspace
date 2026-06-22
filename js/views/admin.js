import { supabase } from '../supabase.js';

export async function renderAdmin(root, currentUser) {
  if (!currentUser || currentUser.role !== 'admin') {
    root.innerHTML = '<div style="text-align: center; padding: 100px;"><h2>403 Forbidden</h2><p>Admin access required.</p></div>';
    return;
  }

  root.innerHTML = `
    <div class="admin-layout">
      <nav class="admin-nav">
        <div class="admin-nav-title">Admin Panel</div>
        <a href="#/admin" class="admin-nav-link active" data-tab="sponsorships">Sponsorships</a>
        <a href="#/admin/posts" class="admin-nav-link" data-tab="posts">Posts</a>
        <a href="#/admin/ads" class="admin-nav-link" data-tab="ads">Ads</a>
      </nav>
      <div class="admin-content" id="adminContent">
        <h2>Loading...</h2>
      </div>
    </div>
  `;

  // Simple Tab routing inside Admin
  const hash = window.location.hash;
  const content = document.getElementById('adminContent');
  const links = document.querySelectorAll('.admin-nav-link');
  links.forEach(l => l.classList.remove('active'));

  if (hash === '#/admin/ads') {
    document.querySelector('[data-tab="ads"]').classList.add('active');
    await renderAdsTab(content);
  } else if (hash === '#/admin/posts') {
    document.querySelector('[data-tab="posts"]').classList.add('active');
    await renderPostsTab(content);
  } else {
    document.querySelector('[data-tab="sponsorships"]').classList.add('active');
    await renderSponsorshipsTab(content);
  }
}

async function renderSponsorshipsTab(content) {
  content.innerHTML = '<h1 style="margin-bottom: var(--space-8);">Manage Sponsorship Requests</h1><div id="spTable">Loading...</div>';

  const { data: requests } = await supabase.from('sponsorship_requests').select('*, users(email, display_name), posts(title)').order('created_at', { ascending: false });

  if (!requests || requests.length === 0) {
    document.getElementById('spTable').innerHTML = '<p>No sponsorship requests found.</p>';
    return;
  }

  let html = `
    <table class="admin-table">
      <thead><tr><th>Date</th><th>User</th><th>Post</th><th>Offer</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
  `;

  requests.forEach(r => {
    html += `
      <tr>
        <td>${new Date(r.created_at).toLocaleDateString()}</td>
        <td><strong>${r.users.display_name}</strong><br><span style="font-size: 12px; color: gray;">${r.users.email}</span></td>
        <td>${r.posts.title}<br>${r.message ? `<em style="font-size:12px">"${r.message}"</em>` : ''}</td>
        <td>$${r.amount_offered}</td>
        <td><span class="status-badge ${r.status === 'approved' ? 'status-published' : (r.status === 'rejected' ? 'status-draft' : '')}">${r.status}</span></td>
        <td>
          ${r.status === 'pending' ? `
            <button class="btn btn-primary btn-sm" onclick="window.handleSponsor('${r.id}', '${r.post_id}', 'approved')">Approve</button>
            <button class="btn btn-ghost btn-sm" style="color: red;" onclick="window.handleSponsor('${r.id}', '${r.post_id}', 'rejected')">Reject</button>
          ` : r.status === 'approved' ? `
            <button class="btn btn-ghost btn-sm" onclick="window.handleSponsor('${r.id}', '${r.post_id}', 'pending')">Revoke</button>
          ` : ''}
        </td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  document.getElementById('spTable').innerHTML = html;

  window.handleSponsor = async (id, postId, newStatus) => {
    await supabase.from('sponsorship_requests').update({ status: newStatus }).eq('id', id);
    const isSponsored = newStatus === 'approved';
    await supabase.from('posts').update({ is_sponsored: isSponsored }).eq('id', postId);
    renderSponsorshipsTab(content);
  };
}

async function renderAdsTab(content) {
  content.innerHTML = `
    <h1 style="margin-bottom: var(--space-8);">Manage Ad Slots</h1>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-8); align-items: start;">
      <div class="admin-form">
        <h2>Create New Ad</h2>
        <form id="adForm">
          <div class="form-group"><label class="form-label">Internal Name</label><input type="text" id="slot_name" class="form-input" required></div>
          <div class="form-group">
            <label class="form-label">Placement</label>
            <select id="placement" class="form-input" required>
              <option value="sidebar">Sidebar</option><option value="homepage_hero">Homepage Hero (Top)</option><option value="in_article">In-Article</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Image URL</label><input type="text" id="image_url" class="form-input"></div>
          <div class="form-group"><label class="form-label">Link URL</label><input type="text" id="link_url" class="form-input"></div>
          <div class="form-group"><label class="form-label">HTML Code (Overrides Image)</label><textarea id="html_code" class="form-input" rows="3"></textarea></div>
          <div class="form-group"><label class="form-label">Start Date</label><input type="datetime-local" id="start_date" class="form-input" required></div>
          <div class="form-group"><label class="form-label">End Date</label><input type="datetime-local" id="end_date" class="form-input" required></div>
          <div class="form-group"><label><input type="checkbox" id="is_active" checked> Active</label></div>
          <button type="submit" class="btn btn-primary">Create Ad</button>
        </form>
      </div>
      <div>
        <h2 style="font-size: var(--font-size-xl); margin-bottom: var(--space-6);">Existing Ads</h2>
        <div id="adsList">Loading...</div>
      </div>
    </div>
  `;

  // Fetch Ads
  const fetchAds = async () => {
    const { data: ads } = await supabase.from('ads').select('*').order('created_at', { ascending: false });
    let html = '';
    (ads || []).forEach(a => {
      html += `
        <div style="background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: var(--radius-lg); padding: var(--space-5); margin-bottom: var(--space-4);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong>${a.slot_name} (${a.placement})</strong>
            <span class="status-badge ${a.is_active ? 'status-published' : 'status-draft'}">${a.is_active ? 'Active' : 'Inactive'}</span>
          </div>
          <div style="font-size: 0.75rem; color: gray; margin-bottom: 8px;">Runs: ${new Date(a.start_date).toLocaleDateString()} - ${new Date(a.end_date).toLocaleDateString()}</div>
          <button class="btn btn-danger btn-sm" onclick="window.deleteAd('${a.id}')">Delete</button>
        </div>
      `;
    });
    document.getElementById('adsList').innerHTML = html || '<p>No ads found.</p>';
  };

  await fetchAds();

  window.deleteAd = async (id) => {
    if (confirm('Delete ad?')) {
      await supabase.from('ads').delete().eq('id', id);
      fetchAds();
    }
  };

  document.getElementById('adForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await supabase.from('ads').insert([{
      slot_name: document.getElementById('slot_name').value,
      placement: document.getElementById('placement').value,
      image_url: document.getElementById('image_url').value,
      link_url: document.getElementById('link_url').value,
      html_code: document.getElementById('html_code').value,
      start_date: new Date(document.getElementById('start_date').value).toISOString(),
      end_date: new Date(document.getElementById('end_date').value).toISOString(),
      is_active: document.getElementById('is_active').checked
    }]);
    document.getElementById('adForm').reset();
    fetchAds();
  });
}

async function renderPostsTab(content) {
  content.innerHTML = `
    <h1 style="margin-bottom: var(--space-8);">Manage All Posts</h1>
    <div id="postsAdminList">Loading...</div>
  `;

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, users(display_name, email), categories(name)')
    .order('created_at', { ascending: false });

  if (error) {
    document.getElementById('postsAdminList').innerHTML = `<div class="alert alert-error">Failed to load posts: ${error.message}</div>`;
    return;
  }

  if (!posts || posts.length === 0) {
    document.getElementById('postsAdminList').innerHTML = '<p>No posts found on the platform.</p>';
    return;
  }

  let html = `
    <table class="admin-table" style="width: 100%; border-collapse: collapse; text-align: left;">
      <thead>
        <tr>
          <th>Title</th>
          <th>Author</th>
          <th>Category</th>
          <th>Status</th>
          <th>Views</th>
          <th>Date</th>
          <th style="text-align: right;">Actions</th>
        </tr>
      </thead>
      <tbody>
  `;

  posts.forEach(post => {
    const formattedDate = new Date(post.created_at).toLocaleDateString();
    const authorName = post.users ? post.users.display_name : 'Unknown';
    const authorEmail = post.users ? post.users.email : '';
    
    html += `
      <tr>
        <td>
          <a href="#/blog/${post.slug}" style="color: var(--color-primary); font-weight: 500; text-decoration: none;">
            ${post.title}
          </a>
        </td>
        <td>
          <strong>${authorName}</strong><br>
          <span style="font-size: 11px; color: gray;">${authorEmail}</span>
        </td>
        <td>${post.categories ? post.categories.name : '—'}</td>
        <td>
          <span class="status-badge ${post.status === 'published' ? 'status-published' : 'status-draft'}">
            ${post.status}
          </span>
        </td>
        <td>${post.views || 0}</td>
        <td>${formattedDate}</td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 8px;">
            <a href="#/dashboard/edit/${post.id}" class="btn btn-ghost btn-sm">Edit</a>
            <button class="btn btn-danger btn-sm" data-delete-id="${post.id}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  document.getElementById('postsAdminList').innerHTML = html;

  // Add click listeners to delete buttons
  document.getElementById('postsAdminList').querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = btn.getAttribute('data-delete-id');
      if (confirm("Are you sure you want to delete this post? This cannot be undone.")) {
        btn.disabled = true;
        btn.innerText = 'Deleting...';
        const { error: deleteErr } = await supabase.from('posts').delete().eq('id', id);
        if (deleteErr) {
          alert('Failed to delete post: ' + deleteErr.message);
          btn.disabled = false;
          btn.innerText = 'Delete';
        } else {
          renderPostsTab(content);
        }
      }
    });
  });
}

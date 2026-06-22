import { supabase } from '../supabase.js';

// Simple slugify function
function slugify(text) {
  return text.toString().toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
}

// Function to upload a file to Supabase Storage
async function uploadImage(file, pathPrefix = 'public') {
  const fileExt = file.name.split('.').pop();
  const fileName = `${pathPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('blog-images')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function renderDashboard(root, currentUser) {
  if (!currentUser) {
    root.innerHTML = `
      <div class="container" style="max-width: 600px; padding: 80px 0;">
        <div style="background: var(--color-surface); padding: 40px; border-radius: 12px; border: 1px solid var(--color-border-light); text-align: center; box-shadow: var(--shadow-sm);">
          <p style="margin-bottom: 24px; font-size: 1.1rem; color: var(--color-text-secondary);">You need to be logged in to manage your posts.</p>
          <a href="#/auth/login" class="btn btn-primary" style="display: inline-flex; justify-content: center; width: 100%; max-width: 200px;">Log In to Continue</a>
        </div>
      </div>
    `;
    return;
  }

  root.innerHTML = `
    <div class="container" style="padding: 40px 0;">
      <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
        <div>
          <h1 style="margin: 0; font-family: var(--font-display); font-size: 2rem;">My Posts</h1>
          <p style="color: var(--color-text-muted); margin: 4px 0 0 0;">Manage your published articles and drafts.</p>
        </div>
        <a href="#/dashboard/new" class="btn btn-primary" style="display: flex; align-items: center; gap: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          New Post
        </a>
      </div>

      <div id="postsListContainer">
        <div style="text-align: center; padding: 40px;"><h2>Loading posts...</h2></div>
      </div>
    </div>
  `;

  // Fetch user posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, categories(name)')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });

  const container = document.getElementById('postsListContainer');

  if (error) {
    container.innerHTML = `<div class="alert alert-error" style="background: #fdf2f2; color: #9b1c1c; padding: 16px; border-radius: 8px;">Failed to load posts: ${error.message}</div>`;
    return;
  }

  if (!posts || posts.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="background: var(--color-surface); border: 1px dashed var(--color-border-light); border-radius: 12px; padding: 60px 20px; text-align: center; margin-top: 16px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-muted); margin-bottom: 20px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 1.25rem;">No posts yet</h3>
        <p style="color: var(--color-text-muted); margin-bottom: 24px;">Start writing your first blog post today.</p>
        <a href="#/dashboard/new" class="btn btn-primary">Write Your First Post</a>
      </div>
    `;
    return;
  }

  let html = `
    <div style="background: var(--color-surface); border-radius: 12px; border: 1px solid var(--color-border-light); overflow: hidden; box-shadow: var(--shadow-sm);">
      <table class="posts-table" style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--color-border-light); background: rgba(0,0,0,0.01);">
            <th style="padding: 16px; font-weight: 600; font-size: var(--font-size-sm); color: var(--color-text-secondary);">Title</th>
            <th style="padding: 16px; font-weight: 600; font-size: var(--font-size-sm); color: var(--color-text-secondary);">Category</th>
            <th style="padding: 16px; font-weight: 600; font-size: var(--font-size-sm); color: var(--color-text-secondary);">Status</th>
            <th style="padding: 16px; font-weight: 600; font-size: var(--font-size-sm); color: var(--color-text-secondary);">Views</th>
            <th style="padding: 16px; font-weight: 600; font-size: var(--font-size-sm); color: var(--color-text-secondary);">Date</th>
            <th style="padding: 16px; font-weight: 600; font-size: var(--font-size-sm); color: var(--color-text-secondary); text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  posts.forEach(post => {
    const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    html += `
      <tr style="border-bottom: 1px solid var(--color-border-light); transition: background-color 0.2s;">
        <td style="padding: 16px; font-weight: 500;">
          <a href="#/blog/${post.slug}" style="color: var(--color-primary); text-decoration: none; font-weight: 600; transition: color 0.15s;">
            ${post.title}
          </a>
        </td>
        <td style="padding: 16px; color: var(--color-text-secondary); font-size: var(--font-size-sm);">${post.categories?.name || '—'}</td>
        <td style="padding: 16px;">
          <span class="status-badge ${post.status === 'published' ? 'status-published' : 'status-draft'}" style="text-transform: capitalize;">
            ${post.status}
          </span>
        </td>
        <td style="padding: 16px; color: var(--color-text-muted); font-size: var(--font-size-sm);">${post.views || 0}</td>
        <td style="padding: 16px; color: var(--color-text-muted); font-size: var(--font-size-sm);">${formattedDate}</td>
        <td style="padding: 16px; text-align: right;">
          <div style="display: inline-flex; gap: 8px;">
            <a href="#/dashboard/edit/${post.id}" class="btn btn-ghost btn-sm" style="padding: 6px 12px; font-size: 0.85rem;">Edit</a>
            <button class="btn btn-sm btn-danger-outline" style="padding: 6px 12px; font-size: 0.85rem; border: 1px solid rgba(220, 38, 38, 0.2); background: transparent; color: #dc2626; border-radius: var(--radius-md); cursor: pointer; font-weight: 500; transition: all 0.2s;" data-delete-id="${post.id}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;

  // Hook up delete buttons
  container.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = btn.getAttribute('data-delete-id');
      if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        btn.disabled = true;
        btn.innerText = 'Deleting...';
        const { error } = await supabase.from('posts').delete().eq('id', id).eq('user_id', currentUser.id);
        if (error) {
          alert('Failed to delete post: ' + error.message);
          btn.disabled = false;
          btn.innerText = 'Delete';
        } else {
          // Re-render dashboard
          renderDashboard(root, currentUser);
        }
      }
    });
  });
}

export async function renderEditor(root, currentUser, postId = null) {
  if (!currentUser) {
    root.innerHTML = `<div class="container" style="padding: 40px 0;"><div class="alert alert-error">Access Denied</div></div>`;
    return;
  }

  const isEdit = !!postId;

  root.innerHTML = `
    <div class="container" style="padding: 40px 0; max-width: 1000px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h1 style="margin: 0; font-family: var(--font-display); font-size: 2rem;">${isEdit ? 'Edit Post' : 'Create New Post'}</h1>
        <a href="#/dashboard" class="btn btn-ghost">← Back to Dashboard</a>
      </div>

      <div id="editorLoading" style="text-align: center; padding: 40px;"><h2>Loading editor...</h2></div>

      <form id="postForm" style="display: none;">
        <div style="margin-bottom: var(--space-6);">
          <input type="text" id="postTitle" class="form-input" placeholder="Title of your story..." style="width: 100%; font-size: 1.75rem; font-weight: 700; font-family: var(--font-display); padding: 16px 20px; border-radius: var(--radius-lg); border: 1px solid var(--color-border-light); margin-bottom: 8px;" required>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-8); align-items: start;">
          <!-- Main Editor Area -->
          <div class="editor-main" style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div style="border: 1px solid var(--color-border-light); border-radius: var(--radius-lg); overflow: hidden; background: white;">
              <div id="editorToolbar"></div>
              <div id="editor" style="height: 400px; font-size: 1.1rem; border: none; font-family: var(--font-body);"></div>
            </div>
            
            <div class="form-group" style="margin-top: 16px;">
              <label class="form-label" style="display: block; margin-bottom: 8px; font-weight: 600;">Excerpt / Summary</label>
              <textarea id="postExcerpt" class="form-input" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--color-border-light);" rows="3" placeholder="Write a brief, catchy summary of your post. If left empty, it will be auto-generated from your story."></textarea>
            </div>
          </div>

          <!-- Sidebar Settings -->
          <div class="editor-sidebar" style="display: flex; flex-direction: column; gap: var(--space-6);">
            <!-- Publish Status -->
            <div style="background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 12px; padding: 20px;">
              <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 1.1rem; font-family: var(--font-display);">Publish settings</h3>
              <div class="form-group" style="margin-bottom: 20px;">
                <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; cursor: pointer;">
                  <input type="radio" name="postStatus" value="published" checked>
                  <strong>Publish</strong> <span style="font-size: 0.85rem; color: var(--color-text-muted);">- visible on homepage</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input type="radio" name="postStatus" value="draft">
                  <strong>Draft</strong> <span style="font-size: 0.85rem; color: var(--color-text-muted);">- only visible to you</span>
                </label>
              </div>
              <div style="border-top: 1px solid var(--color-border-light); margin-bottom: 20px; padding-top: 16px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input type="checkbox" id="postIsSponsored">
                  <strong>Request Sponsorship</strong>
                </label>
                <div id="sponsorFields" style="display: none; margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.02); border-radius: 8px; border: 1px solid var(--color-border-light);">
                  <div class="form-group" style="margin-bottom: 10px;">
                    <label class="form-label" style="font-size: 0.8rem; font-weight: 500; margin-bottom: 4px;">Offer Amount ($)</label>
                    <input type="number" id="sponsorAmount" class="form-input" style="padding: 6px 10px; font-size: 0.9rem;" value="50" min="10">
                  </div>
                  <div class="form-group" style="margin-bottom: 0;">
                    <label class="form-label" style="font-size: 0.8rem; font-weight: 500; margin-bottom: 4px;">Message to Admin</label>
                    <textarea id="sponsorMessage" class="form-input" style="padding: 6px 10px; font-size: 0.9rem;" rows="2" placeholder="Optional notes..."></textarea>
                  </div>
                </div>
                <div id="sponsorApprovedBadge" style="display: none; margin-top: 8px; color: var(--color-success); font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Sponsorship Active (Approved)
                </div>
                <div id="sponsorPendingBadge" style="display: none; margin-top: 8px; color: var(--color-warning); font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Request Pending Admin Review
                </div>
              </div>
              <button type="submit" id="savePostBtn" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 12px;">
                ${isEdit ? 'Update Post' : 'Publish Story'}
              </button>
            </div>

            <!-- Category -->
            <div style="background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 12px; padding: 20px;">
              <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 1.1rem; font-family: var(--font-display);">Category</h3>
              <select id="postCategory" class="form-input" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--color-border-light);">
                <option value="">Select Category</option>
              </select>
            </div>

            <!-- Tags -->
            <div style="background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 12px; padding: 20px;">
              <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 1.1rem; font-family: var(--font-display);">Tags</h3>
              <input type="text" id="postTags" class="form-input" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--color-border-light);" placeholder="e.g. tech, design, writing">
              <small style="color: var(--color-text-muted); margin-top: 8px; display: block; font-size: 0.75rem;">Separate multiple tags with commas.</small>
            </div>

            <!-- Featured Image -->
            <div style="background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 12px; padding: 20px;">
              <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 1.1rem; font-family: var(--font-display);">Featured Image</h3>
              <div class="form-group">
                <input type="file" id="postFeaturedImage" class="form-input" accept="image/*" style="width: 100%; padding: 6px; font-size: 0.85rem; margin-bottom: 12px;">
                <input type="hidden" id="featuredImageUrl" value="">
                <div id="imagePreviewContainer" style="width: 100%; height: 160px; border: 1px dashed var(--color-border-light); border-radius: 8px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.02); overflow: hidden; position: relative;">
                  <span id="previewPlaceholder" style="color: var(--color-text-muted); font-size: 0.9rem;">No image uploaded</span>
                  <img id="featuredImagePreview" style="display: none; width: 100%; height: 100%; object-fit: cover;" alt="Featured Image Preview">
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  `;

  try {
    // 1. Fetch Categories
    const { data: categories } = await supabase.from('categories').select('*').order('name');
    const categorySelect = document.getElementById('postCategory');
    if (categories) {
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.innerText = cat.name;
        categorySelect.appendChild(opt);
      });
    }

    // 2. Load Post if Edit Mode
    let post = null;
    let postTagsStr = '';
    if (isEdit) {
      const { data: fetchedPost } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();
      
      if (!fetchedPost) {
        document.getElementById('editorLoading').innerHTML = `<h3>Post not found or access denied.</h3>`;
        return;
      }

      // Check access
      if (fetchedPost.user_id !== currentUser.id && currentUser.role !== 'admin') {
        document.getElementById('editorLoading').innerHTML = `<h3>Access Denied. You are not the author of this post.</h3>`;
        return;
      }

      post = fetchedPost;

      // Fetch existing tags
      const { data: postTags } = await supabase
        .from('post_tags')
        .select('tags(name)')
        .eq('post_id', post.id);
      
      if (postTags) {
        postTagsStr = postTags.map(pt => pt.tags?.name).filter(t => t).join(', ');
      }
    }

    // Hide loading indicator, show form
    document.getElementById('editorLoading').style.display = 'none';
    const form = document.getElementById('postForm');
    form.style.display = 'block';

    // 3. Initialize Quill
    const quill = new Quill('#editor', {
      theme: 'snow',
      placeholder: 'Tell your story...',
      modules: {
        toolbar: {
          container: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            ['clean']
          ],
          handlers: {
            image: function() {
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'image/*');
              input.click();

              input.onchange = async function() {
                const file = input.files[0];
                if (!file) return;

                // Disable quill while uploading
                quill.enable(false);
                const originalPlaceholder = quill.root.dataset.placeholder;
                quill.root.dataset.placeholder = 'Uploading image...';

                try {
                  const url = await uploadImage(file, 'editor');
                  const range = quill.getSelection(true);
                  quill.insertEmbed(range.index, 'image', url);
                  quill.setSelection(range.index + 1);
                } catch (err) {
                  alert('Failed to upload image to storage: ' + err.message);
                } finally {
                  quill.enable(true);
                  quill.root.dataset.placeholder = originalPlaceholder;
                }
              };
            }
          }
        }
      }
    });

    // Hook up show/hide event listener for sponsorship request fields
    const checkIsSponsored = document.getElementById('postIsSponsored');
    const sponsorFieldsDiv = document.getElementById('sponsorFields');
    checkIsSponsored.addEventListener('change', (e) => {
      if (e.target.checked) {
        sponsorFieldsDiv.style.display = 'block';
      } else {
        sponsorFieldsDiv.style.display = 'none';
      }
    });

    // 4. Fill form inputs if Edit Mode
    if (isEdit && post) {
      document.getElementById('postTitle').value = post.title;
      quill.root.innerHTML = post.content || '';
      document.getElementById('postExcerpt').value = post.excerpt || '';
      document.getElementById('postCategory').value = post.category_id || '';
      document.getElementById('postTags').value = postTagsStr;
      
      document.getElementById('sponsorApprovedBadge').style.display = 'none';
      document.getElementById('sponsorPendingBadge').style.display = 'none';
      document.getElementById('sponsorFields').style.display = 'none';

      if (post.is_sponsored) {
        document.getElementById('postIsSponsored').checked = true;
        document.getElementById('postIsSponsored').disabled = true;
        document.getElementById('sponsorApprovedBadge').style.display = 'flex';
      } else {
        const { data: requests } = await supabase
          .from('sponsorship_requests')
          .select('*')
          .eq('post_id', post.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (requests && requests.length > 0) {
          const req = requests[0];
          if (req.status === 'pending') {
            document.getElementById('postIsSponsored').checked = true;
            document.getElementById('sponsorFields').style.display = 'block';
            document.getElementById('sponsorAmount').value = req.amount_offered;
            document.getElementById('sponsorMessage').value = req.message || '';
            document.getElementById('sponsorPendingBadge').style.display = 'flex';
          }
        }
      }
      
      if (post.featured_image) {
        document.getElementById('featuredImageUrl').value = post.featured_image;
        document.getElementById('featuredImagePreview').src = post.featured_image;
        document.getElementById('featuredImagePreview').style.display = 'block';
        document.getElementById('previewPlaceholder').style.display = 'none';
      }

      // Check appropriate status radio
      document.querySelector(`input[name="postStatus"][value="${post.status}"]`).checked = true;
    }

    // 5. Handle Featured Image selection and direct upload
    const featuredInput = document.getElementById('postFeaturedImage');
    featuredInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const placeholder = document.getElementById('previewPlaceholder');
      const preview = document.getElementById('featuredImagePreview');
      const urlInput = document.getElementById('featuredImageUrl');

      placeholder.innerText = 'Uploading...';
      preview.style.display = 'none';

      try {
        const publicUrl = await uploadImage(file, 'featured');
        urlInput.value = publicUrl;
        preview.src = publicUrl;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
      } catch (err) {
        alert('Featured image upload failed: ' + err.message);
        placeholder.innerText = 'Upload failed. Try again.';
        placeholder.style.display = 'block';
      }
    });

    // 6. Handle form submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const saveBtn = document.getElementById('savePostBtn');
      saveBtn.disabled = true;
      saveBtn.innerText = 'Saving...';

      const title = document.getElementById('postTitle').value.trim();
      const content = quill.root.innerHTML;
      const rawExcerpt = document.getElementById('postExcerpt').value.trim();
      const categoryId = document.getElementById('postCategory').value || null;
      const status = document.querySelector('input[name="postStatus"]:checked').value;
      const featuredImage = document.getElementById('featuredImageUrl').value || null;
      const tagsStr = document.getElementById('postTags').value.trim();
      const requestSponsorship = document.getElementById('postIsSponsored').checked;
      const sponsorAmount = parseFloat(document.getElementById('sponsorAmount').value) || 50;
      const sponsorMessage = document.getElementById('sponsorMessage').value.trim();
      const isSponsored = isEdit ? post.is_sponsored : false;

      // Automatically generate excerpt if empty
      const excerpt = rawExcerpt || content.substring(0, 150).replace(/(<([^>]+)>)/gi, "").trim();

      // Simple slug generation
      let slug = slugify(title);
      if (!slug) {
        alert('Please enter a valid title.');
        saveBtn.disabled = false;
        saveBtn.innerText = isEdit ? 'Update Post' : 'Publish Story';
        return;
      }

      try {
        let postRecord = null;

        if (isEdit) {
          // Update post
          const { data, error } = await supabase
            .from('posts')
            .update({
              title,
              slug,
              excerpt,
              content,
              status,
              category_id: categoryId,
              featured_image: featuredImage,
              is_sponsored: isSponsored,
              updated_at: new Date().toISOString()
            })
            .eq('id', postId)
            .select()
            .single();

          if (error) throw error;
          postRecord = data;

          // Delete existing post-tag links
          await supabase.from('post_tags').delete().eq('post_id', postId);
        } else {
          // Check slug uniqueness (basic append random suffix if exists)
          const { data: existing } = await supabase.from('posts').select('id').eq('slug', slug);
          if (existing && existing.length > 0) {
            slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
          }

          // Insert post
          const { data, error } = await supabase
            .from('posts')
            .insert([{
              user_id: currentUser.id,
              title,
              slug,
              excerpt,
              content,
              status,
              category_id: categoryId,
              featured_image: featuredImage,
              is_sponsored: isSponsored,
              views: 0
            }])
            .select()
            .single();

          if (error) throw error;
          postRecord = data;
        }

        // Handle Sponsorship Request creation/modification/cancellation
        if (requestSponsorship && postRecord && !isSponsored) {
          const { data: existingReq } = await supabase
            .from('sponsorship_requests')
            .select('id')
            .eq('post_id', postRecord.id)
            .eq('status', 'pending')
            .limit(1);

          if (existingReq && existingReq.length > 0) {
            await supabase
              .from('sponsorship_requests')
              .update({
                amount_offered: sponsorAmount,
                message: sponsorMessage,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingReq[0].id);
          } else {
            await supabase.from('sponsorship_requests').insert([{
              user_id: currentUser.id,
              post_id: postRecord.id,
              amount_offered: sponsorAmount,
              message: sponsorMessage,
              status: 'pending'
            }]);
          }
        } else if (!requestSponsorship && postRecord && !isSponsored) {
          await supabase
            .from('sponsorship_requests')
            .delete()
            .eq('post_id', postRecord.id)
            .eq('status', 'pending');
        }

        // Process tags if any and insert post_tags links
        if (tagsStr && postRecord) {
          const tagsList = tagsStr.split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

          for (const tName of tagsList) {
            const tSlug = slugify(tName);
            if (!tSlug) continue;

            let tagId = null;

            // Find or create tag
            const { data: existingTag } = await supabase
              .from('tags')
              .select('id')
              .eq('slug', tSlug)
              .single();

            if (existingTag) {
              tagId = existingTag.id;
            } else {
              const { data: newTag, error: tagErr } = await supabase
                .from('tags')
                .insert([{ name: tName, slug: tSlug }])
                .select()
                .single();

              if (!tagErr && newTag) {
                tagId = newTag.id;
              }
            }

            // Create post_tags record
            if (tagId) {
              await supabase
                .from('post_tags')
                .insert([{ post_id: postRecord.id, tag_id: tagId }]);
            }
          }
        }

        // Redirect back to dashboard
        window.location.hash = '#/dashboard';
      } catch (err) {
        alert('Failed to save post: ' + err.message);
        saveBtn.disabled = false;
        saveBtn.innerText = isEdit ? 'Update Post' : 'Publish Story';
      }
    });

  } catch (err) {
    document.getElementById('editorLoading').innerHTML = `<h3>Failed to initialize editor: ${err.message}</h3>`;
  }
}

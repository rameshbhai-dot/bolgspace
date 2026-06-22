import { supabase } from '../supabase.js';

export async function renderSponsor(root, currentUser) {
  root.innerHTML = `
    <div class="page-header"><div class="container"><h1>Promote Your Story</h1><p>Reach a wider audience by sponsoring your blog post on our homepage.</p></div></div>
    <div class="container" style="max-width: 600px; padding: 40px 0;" id="sponsorContainer">
      <div style="text-align: center;"><h2>Loading...</h2></div>
    </div>
  `;

  const container = document.getElementById('sponsorContainer');

  if (!currentUser) {
    container.innerHTML = `
      <div style="background: var(--color-surface); padding: 32px; border-radius: 12px; border: 1px solid var(--color-border-light); text-align: center;">
        <p style="margin-bottom: 24px;">You need to be logged in to sponsor a post.</p>
        <a href="#/auth/login" class="btn btn-primary" style="justify-content: center;">Log In to Continue</a>
      </div>
    `;
    return;
  }

  // Fetch user's published posts
  const { data: posts } = await supabase.from('posts').select('id, title').eq('user_id', currentUser.id).eq('status', 'published');

  if (!posts || posts.length === 0) {
    container.innerHTML = `
      <div style="background: var(--color-surface); padding: 32px; border-radius: 12px; border: 1px solid var(--color-border-light); text-align: center;">
        <p style="margin-bottom: 24px;">You don't have any published posts yet. Publish a story first before requesting sponsorship.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="background: var(--color-surface); padding: 32px; border-radius: 12px; border: 1px solid var(--color-border-light);">
      <h2 style="margin-top: 0; margin-bottom: 24px;">Sponsorship Request</h2>
      
      <div id="successMsg" style="display: none; background: #e6f8ec; color: #0a5c2d; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <strong>Success!</strong> Your request has been sent. An admin will review it shortly.
      </div>

      <form id="sponsorForm">
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label" style="display: block; margin-bottom: 8px; font-weight: 500;">Select Post to Sponsor</label>
          <select id="postId" class="form-input" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--color-border-light);" required>
            ${posts.map(p => `<option value="${p.id}">${p.title}</option>`).join('')}
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label" style="display: block; margin-bottom: 8px; font-weight: 500;">Amount Offered ($)</label>
          <input type="number" id="amountOffered" class="form-input" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--color-border-light);" min="10" step="1" placeholder="e.g. 50" required>
        </div>

        <div class="form-group" style="margin-bottom: 24px;">
          <label class="form-label" style="display: block; margin-bottom: 8px; font-weight: 500;">Message / Notes (Optional)</label>
          <textarea id="message" class="form-input" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--color-border-light);" rows="3"></textarea>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">Submit Request</button>
      </form>
    </div>
  `;

  document.getElementById('sponsorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const postId = document.getElementById('postId').value;
    const amount = document.getElementById('amountOffered').value;
    const msg = document.getElementById('message').value;

    const { error } = await supabase.from('sponsorship_requests').insert([{
      user_id: currentUser.id,
      post_id: postId,
      amount_offered: parseFloat(amount),
      message: msg,
      status: 'pending'
    }]);

    if (!error) {
      document.getElementById('successMsg').style.display = 'block';
      document.getElementById('sponsorForm').reset();
    } else {
      alert('Error submitting request: ' + error.message);
    }
  });
}

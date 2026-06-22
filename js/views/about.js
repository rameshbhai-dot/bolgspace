import { supabase } from '../supabase.js';

export async function renderAbout(root, currentUser) {
  // Fetch categories for the Explore Corner
  let categories = [];
  try {
    const { data } = await supabase.from('categories').select('*').order('name');
    categories = data || [];
  } catch (err) {
    console.error('Failed to load categories for About page:', err);
  }

  root.innerHTML = `
    <!-- Hero Header -->
    <section class="about-hero">
      <div class="container">
        <h1>About BlogSpace</h1>
        <p class="about-intro">
          Where great ideas find their voice. A premium publishing platform crafted for modern thinkers, creators, and storytellers to share insights and inspire a global audience.
        </p>
      </div>
    </section>

    <!-- Core Sections: Story, Mission, Values -->
    <div class="container">
      <div class="about-values-grid">
        
        <!-- Our Story -->
        <div class="about-value-card">
          <div class="section-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </div>
          <h2>Our Story</h2>
          <p>
            BlogSpace was born out of a simple vision: to create a beautiful, distraction-free environment for writers and readers. We noticed that modern web publishing had become cluttered with intrusive ads, complex frameworks, and noise.
          </p>
          <p>
            We set out to build a platform that strips away the clutter, leaving only the words, the ideas, and the connection. Today, we support writers from all over the world, offering them a premium canvas to publish their thoughts and build their audience.
          </p>
        </div>

        <!-- Our Mission -->
        <div class="about-value-card">
          <div class="section-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
          </div>
          <h2>Our Mission</h2>
          <p>
            Our mission is to democratize online publishing by providing a fast, secure, and beautiful space for everyone. We believe that good writing can change minds, spark conversations, and build communities.
          </p>
          <p>
            By offering clean interfaces, integrated monetization channels like post sponsorship, and robust client-side speeds, we empower authors to focus entirely on what they do best: writing incredible stories.
          </p>
        </div>

        <!-- What We Stand For -->
        <div class="about-value-card">
          <div class="section-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h2>What We Stand For</h2>
          <p>
            We stand for creative freedom, editorial integrity, and design excellence. We refuse to compromise on user privacy or user experience, which is why our ad slots are carefully managed and our sponsorships are transparently request-approved.
          </p>
          <p>
            Every post on BlogSpace is a commitment to quality. We support open discussions, intellectual diversity, and the pursuit of knowledge across all categories.
          </p>
        </div>

      </div>

      <!-- Explore, Writing & Contact Grid -->
      <div class="about-grid">
        
        <!-- Explore Corner -->
        <div class="about-card">
          <div>
            <h3 class="about-card-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="contact-icon"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
              Explore Corner
            </h3>
            <p class="about-card-text">
              Dive into our publishing fields. Explore articles from tech innovation to lifestyle tips and business strategies.
            </p>
            <div class="fields-grid" id="exploreFields">
              ${categories.map(cat => `
                <div class="field-tag" data-slug="${cat.slug}">
                  ${cat.name}
                </div>
              `).join('')}
              ${categories.length === 0 ? '<p style="grid-column: 1/-1; color: var(--color-text-muted);">No categories available.</p>' : ''}
            </div>
          </div>
        </div>

        <!-- Sidebar Actions & Contact -->
        <div style="display: flex; flex-direction: column; gap: var(--space-6);">
          
          <!-- Start Writing banner -->
          <div class="about-card write-banner">
            <div>
              <h3 class="about-card-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Start Writing With Us
              </h3>
              <p class="about-card-text">
                Have an idea, perspective, or tutorial you want to share? Connect with thousands of readers around the globe.
              </p>
            </div>
            <a href="#/dashboard/new" class="btn btn-white" style="margin-top: 12px; justify-content: center;">
              Write Your Story
            </a>
          </div>

          <!-- Contact Corner -->
          <div class="about-card">
            <div>
              <h3 class="about-card-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="contact-icon"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                Get In Touch
              </h3>
              <p class="about-card-text">
                For partnerships, sponsorship questions, support, or general inquiries:
              </p>
              <div class="contact-item">
                <a href="mailto:whitcroftholdings@gmail.com" class="contact-link">whitcroftholdings@gmail.com</a>
              </div>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="about-card">
            <div>
              <h3 class="about-card-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="contact-icon"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                Quick Links
              </h3>
              <div class="quicklinks-grid">
                <a href="#/" class="quicklink-item">→ Home</a>
                <a href="#/about" class="quicklink-item" style="font-weight: 600; color: var(--color-primary);">→ About Us</a>
                <a href="#/sponsor" class="quicklink-item">→ Sponsor Post</a>
                ${currentUser ? `
                  <a href="#/dashboard" class="quicklink-item">→ My Dashboard</a>
                  <a href="#/dashboard/new" class="quicklink-item">→ New Post</a>
                ` : `
                  <a href="#/auth/login" class="quicklink-item">→ Log In</a>
                  <a href="#/auth/signup" class="quicklink-item">→ Sign Up</a>
                `}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;

  // Bind events for explore tags (e.g. click to search/filter on home page)
  root.querySelectorAll('#exploreFields .field-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const slug = tag.getAttribute('data-slug');
      // Redirect to homepage
      window.location.hash = `#/`;
    });
  });
}

export function renderPrivacy(root) {
  root.innerHTML = `
    <section class="legal-page">
      <div class="container">
        <div class="legal-header">
          <h1>Privacy Policy</h1>
          <p class="legal-updated">Last updated: June 22, 2026</p>
        </div>
        
        <div class="legal-content">
          <div class="legal-section">
            <h2>1. Introduction</h2>
            <p>Welcome to BlogSpace ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>
          </div>

          <div class="legal-section">
            <h2>2. Information We Collect</h2>
            <h3>Personal Data</h3>
            <p>When you register for an account, we may collect:</p>
            <ul>
              <li>Your name and email address</li>
              <li>Profile information you choose to provide</li>
              <li>Content you create, such as blog posts and comments</li>
            </ul>
            
            <h3>Automatically Collected Data</h3>
            <p>When you visit our site, we may automatically collect:</p>
            <ul>
              <li>IP address and browser type</li>
              <li>Device information and operating system</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
            </ul>
          </div>

          <div class="legal-section">
            <h2>3. Cookies and Tracking Technologies</h2>
            <p>We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
            <p>Types of cookies we use:</p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Advertising Cookies:</strong> Used to serve you relevant advertisements</li>
            </ul>
          </div>

          <div class="legal-section">
            <h2>4. Third-Party Advertising</h2>
            <p>We use Google AdSense to display advertisements on our website. Google AdSense uses cookies to serve ads based on your prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet.</p>
            <p>You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google Ads Settings</a>. Alternatively, you can opt out of third-party vendor cookies by visiting the <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener">Network Advertising Initiative opt-out page</a>.</p>
          </div>

          <div class="legal-section">
            <h2>5. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process your registration and manage your account</li>
              <li>Send you updates and communications</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Detect, prevent, and address technical issues</li>
              <li>Serve relevant advertisements through third-party services</li>
            </ul>
          </div>

          <div class="legal-section">
            <h2>6. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
            <ul>
              <li><strong>Service Providers:</strong> With third-party companies that help us operate our website (e.g., Supabase for database and authentication)</li>
              <li><strong>Advertising Partners:</strong> With Google AdSense for ad serving purposes</li>
              <li><strong>Legal Requirements:</strong> If required by law or in response to valid legal requests</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </div>

          <div class="legal-section">
            <h2>7. Data Security</h2>
            <p>We implement appropriate technical and organizational security measures to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure.</p>
          </div>

          <div class="legal-section">
            <h2>8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Request data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </div>

          <div class="legal-section">
            <h2>9. Children's Privacy</h2>
            <p>Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete that information.</p>
          </div>

          <div class="legal-section">
            <h2>10. Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>
          </div>

          <div class="legal-section">
            <h2>11. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <ul>
              <li>Email: <a href="mailto:privacy@blogspace.com">privacy@blogspace.com</a></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  `;
}

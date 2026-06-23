/* ============================================
   FinanceFlow — Premium Finance Blog
   Interactive JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Global Error Handler to debug hidden issues on the user's screen
  window.addEventListener('error', function(e) {
    alert('JavaScript Error: ' + e.message + '\nFile: ' + e.filename + ':' + e.lineno);
  });
  window.addEventListener('unhandledrejection', function(e) {
    alert('Promise Error: ' + (e.reason && e.reason.message ? e.reason.message : e.reason));
  });

  // ==========================================
  // Theme Toggle (Dark / Light Mode)
  // ==========================================
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle?.querySelector('.theme-icon');
  
  const savedTheme = localStorage.getItem('financeflow-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('financeflow-theme', next);
    updateThemeIcon(next);
  });

  function updateThemeIcon(theme) {
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // ==========================================
  // Navbar Scroll Effect
  // ==========================================
  const navbar = document.querySelector('.navbar');
  const backToTop = document.querySelector('.back-to-top');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Add scrolled class for glass effect
    if (scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Back to top button visibility
    if (scrollY > 500) {
      backToTop?.classList.add('visible');
    } else {
      backToTop?.classList.remove('visible');
    }

    lastScroll = scrollY;
  }, { passive: true });

  // Back to top click
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ==========================================
  // Mobile Navigation Toggle
  // ==========================================
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  mobileToggle?.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    navLinks?.classList.toggle('active');
    document.body.style.overflow = navLinks?.classList.contains('active') ? 'hidden' : '';
  });

  // Close mobile nav on link click
  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle?.classList.remove('active');
      navLinks?.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // ==========================================
  // Smooth Scroll for Anchor Links
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ==========================================
  // Scroll-Triggered Animations
  // ==========================================
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1
  };

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        // Don't unobserve so we keep the animation state
        scrollObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll, .stagger-children').forEach(el => {
    scrollObserver.observe(el);
  });

  // ==========================================
  // Animated Counters
  // ==========================================
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-counter]').forEach(el => {
    counterObserver.observe(el);
  });

  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-counter'));
    const suffix = element.getAttribute('data-suffix') || '';
    const prefix = element.getAttribute('data-prefix') || '';
    const duration = 2000;
    const startTime = performance.now();
    const startVal = 0;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (target - startVal) * eased);
      
      element.textContent = prefix + current.toLocaleString('en-IN') + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ==========================================
  // Newsletter Form Handler
  // ==========================================
  const newsletterForm = document.getElementById('newsletterForm');

  newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input[type="email"]');
    const submitBtn = newsletterForm.querySelector('button');
    
    if (email && email.value) {
      // Simulate submission
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '✓ Subscribed!';
      submitBtn.style.background = 'var(--success)';
      email.value = '';
      
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
      }, 3000);
    }
  });

  // ==========================================
  // Typewriter Effect for Hero
  // ==========================================
  const typewriterEl = document.getElementById('typewriter');
  if (typewriterEl) {
    const words = ['Smart Investing', 'Financial Freedom', 'Wealth Building', 'Money Mastery'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 80;

    function typewrite() {
      const current = words[wordIndex];
      
      if (isDeleting) {
        typewriterEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 40;
      } else {
        typewriterEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 80;
      }

      if (!isDeleting && charIndex === current.length) {
        typeSpeed = 2000; // Pause at end
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 300; // Pause before next word
      }

      setTimeout(typewrite, typeSpeed);
    }

    setTimeout(typewrite, 1000);
  }

  // ==========================================
  // Particle Background Effect
  // ==========================================
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    
    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function createParticles() {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.1
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const particleColor = isDark ? '245, 158, 11' : '217, 119, 6';

      particles.forEach((p, i) => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        
        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${p.opacity})`;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${particleColor}, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    createParticles();
    drawParticles();

    window.addEventListener('resize', () => {
      resizeCanvas();
      createParticles();
    });

    // Pause when not visible
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!animationId) drawParticles();
        } else {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      });
    });
    heroObserver.observe(canvas);
  }

  // ==========================================
  // Reading Progress Bar (Optional enhancement)
  // ==========================================
  const progressBar = document.getElementById('readingProgress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / scrollable) * 100;
      progressBar.style.width = `${progress}%`;
    }, { passive: true });
  }

  // ==========================================
  // Featured Posts Click Handlers
  // ==========================================
  const featuredPostsData = [
    {
      title: "5 Smart Investment Strategies That Will Define 2026",
      category: "Investing",
      author: "Arjun Mehta",
      date: "June 20, 2026",
      readTime: "8 min",
      image: "images/investment-strategies.png",
      content: `<p>The investment landscape has fundamentally shifted. Here are the 5 core strategies you need to thrive in 2026.</p>
      <h2>1. AI-Driven Portfolios</h2><p>Algorithms are now accessible to retail investors, democratizing access to high-frequency trading insights.</p>
      <h2>2. Sustainable Alpha</h2><p>ESG is no longer a buzzword, it's a primary alpha driver as regulations tighten globally.</p>
      <h2>3. The Return of Fixed Income</h2><p>Bonds are finally yielding real returns again, making the 60/40 portfolio viable once more.</p>`
    },
    {
      title: "The Ultimate Guide to Building Your Emergency Fund",
      category: "Savings",
      author: "Priya Malhotra",
      date: "June 18, 2026",
      readTime: "6 min",
      image: "images/emergency-fund.png",
      content: `<p>An emergency fund is the bedrock of all personal finance. Without it, you are one crisis away from crushing debt.</p>
      <h2>How much do you need?</h2><p>The standard rule is 3-6 months of essential living expenses (needs, not wants).</p>
      <h2>Where to keep it?</h2><p>High-yield savings accounts or liquid mutual funds. Accessibility is the primary goal, not maximum returns.</p>`
    },
    {
      title: "Crypto vs. Traditional Investing: What's Right for You?",
      category: "Crypto",
      author: "Vikram Rao",
      date: "June 15, 2026",
      readTime: "10 min",
      image: "images/crypto-investing.png",
      content: `<p>The debate continues, but the lines are blurring as traditional institutions embrace digital assets via ETFs.</p>
      <h2>Volatility vs Stability</h2><p>Crypto offers asymmetric upside but terrifying drawdowns. Traditional markets offer slow, steady compounding.</p>
      <h2>The Hybrid Approach</h2><p>For most modern investors, a 95/5 or 90/10 split provides the perfect balance of safety and moonshot exposure.</p>`
    }
  ];

  document.querySelectorAll('.featured-card').forEach((card, index) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      alert('Opening featured article: ' + featuredPostsData[index].title);
      openArticleReader(featuredPostsData[index]);
    });
  });

  // ==========================================
  // Reader Modal (Full Screen Article)
  // ==========================================
  // ==========================================
  // Auth Modals — Sign In / Sign Up
  // ==========================================
  const authOverlay = document.getElementById('authOverlay');
  const signInModal = document.getElementById('signInModal');
  const signUpModal = document.getElementById('signUpModal');
  const authToast = document.getElementById('authToast');
  const authToastText = document.getElementById('authToastText');

  // Open buttons
  const openSignInBtn = document.getElementById('openSignIn');
  const openSignUpBtn = document.getElementById('openSignUp');

  // Close buttons
  const closeSignInBtn = document.getElementById('closeSignIn');
  const closeSignUpBtn = document.getElementById('closeSignUp');

  // Switch links
  const switchToSignUpLink = document.getElementById('switchToSignUp');
  const switchToSignInLink = document.getElementById('switchToSignIn');

  // --- Check if Firebase is available ---
  const isFirebaseReady = (typeof firebase !== 'undefined' && typeof auth !== 'undefined');

  // --- Modal Open/Close Helpers ---
  function openModal(modal) {
    authOverlay?.classList.add('active');
    modal?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeAllModals() {
    authOverlay?.classList.remove('active');
    signInModal?.classList.remove('active');
    signUpModal?.classList.remove('active');
    document.body.style.overflow = '';
  }

  function switchModal(from, to) {
    from?.classList.remove('active');
    setTimeout(() => to?.classList.add('active'), 150);
  }

  // Open Sign In
  const openSignInMobileBtn = document.getElementById('openSignInMobile');
  [openSignInBtn, openSignInMobileBtn].forEach(btn => {
    btn?.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(signInModal);
    });
  });

  // Open Sign Up
  const openSignUpMobileBtn = document.getElementById('openSignUpMobile');
  [openSignUpBtn, openSignUpMobileBtn].forEach(btn => {
    btn?.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(signUpModal);
    });
  });

  // Close buttons
  closeSignInBtn?.addEventListener('click', closeAllModals);
  closeSignUpBtn?.addEventListener('click', closeAllModals);

  // Overlay click to close
  authOverlay?.addEventListener('click', closeAllModals);

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  // Switch between modals
  switchToSignUpLink?.addEventListener('click', (e) => {
    e.preventDefault();
    switchModal(signInModal, signUpModal);
  });

  switchToSignInLink?.addEventListener('click', (e) => {
    e.preventDefault();
    switchModal(signUpModal, signInModal);
  });

  // --- Password Visibility Toggle ---
  document.querySelectorAll('.auth-password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.textContent = isPassword ? '🙈' : '👁️';
      }
    });
  });

  // --- Password Strength Indicator ---
  const signUpPasswordInput = document.getElementById('signUpPassword');
  const strengthBars = document.querySelectorAll('#passwordStrength .strength-bar');
  const strengthText = document.querySelector('#passwordStrength .strength-text');

  signUpPasswordInput?.addEventListener('input', () => {
    const val = signUpPasswordInput.value;
    const strength = calculatePasswordStrength(val);
    updateStrengthUI(strength);
  });

  function calculatePasswordStrength(password) {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 1) return { level: 'weak', count: 1, label: 'Weak' };
    if (score === 2) return { level: 'fair', count: 2, label: 'Fair' };
    if (score === 3) return { level: 'good', count: 3, label: 'Good' };
    return { level: 'strong', count: 4, label: 'Strong' };
  }

  function updateStrengthUI({ level, count, label }) {
    strengthBars.forEach((bar, i) => {
      bar.className = 'strength-bar';
      if (i < count) bar.classList.add(level);
    });
    if (strengthText) {
      strengthText.textContent = label;
      strengthText.className = 'strength-text ' + level;
    }
  }

  // --- Toast Notification ---
  function showToast(message) {
    if (authToastText) authToastText.textContent = message;
    authToast?.classList.add('visible');
    setTimeout(() => authToast?.classList.remove('visible'), 3500);
  }

  // --- Show Auth Error on Field ---
  function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId)?.closest('.auth-field');
    if (!field) return;
    field.classList.add('error');
    let errorText = field.querySelector('.auth-error-text');
    if (!errorText) {
      errorText = document.createElement('span');
      errorText.className = 'auth-error-text';
      field.appendChild(errorText);
    }
    errorText.textContent = message;
    setTimeout(() => field.classList.remove('error'), 4000);
  }

  // --- Map Firebase Error Codes to User-Friendly Messages ---
  function getAuthErrorMessage(errorCode) {
    const messages = {
      'auth/email-already-in-use': 'This email is already registered. Try signing in.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password. Please try again.',
      'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed.',
      'auth/network-request-failed': 'Network error. Check your internet connection.',
      'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site.',
      'auth/operation-not-supported-in-this-environment': 'Google/GitHub sign-in requires a web server (http://). It cannot run from a local file (file://). Please use Email/Password instead.',
      'auth/unauthorized-domain': 'This domain is not authorized for OAuth operations. Please use Email/Password.'
    };
    return messages[errorCode] || ('An error occurred: ' + errorCode);
  }

  // --- Update Nav for Signed-In State ---
  function setSignedInState(name, photoURL) {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    
    // Hide sign in / sign up buttons
    const openSignInMobileBtn = document.getElementById('openSignInMobile');
    const openSignUpMobileBtn = document.getElementById('openSignUpMobile');
    if (openSignInBtn) openSignInBtn.style.display = 'none';
    if (openSignUpBtn) openSignUpBtn.style.display = 'none';
    if (openSignInMobileBtn) openSignInMobileBtn.style.display = 'none';
    if (openSignUpMobileBtn) openSignUpMobileBtn.style.display = 'none';

    // Remove existing profile if present
    const existingProfile = document.querySelector('.nav-user-profile');
    if (existingProfile) existingProfile.remove();

    // Create user profile element
    const profile = document.createElement('div');
    profile.className = 'nav-user-profile';

    if (photoURL) {
      profile.innerHTML = `
        <img src="${photoURL}" alt="${name}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
        <span class="nav-user-name">${name.split(' ')[0]}</span>
      `;
    } else {
      profile.innerHTML = `
        <div class="nav-user-avatar">${initials}</div>
        <span class="nav-user-name">${name.split(' ')[0]}</span>
      `;
    }

    // Insert before mobile toggle
    const mobileToggleEl = document.getElementById('mobileToggle');
    mobileToggleEl?.parentNode.insertBefore(profile, mobileToggleEl);

    // Add sign out on click
    profile.addEventListener('click', async () => {
      if (confirm('Sign out of FinanceFlow?')) {
        try {
          if (isFirebaseReady) {
            await auth.signOut();
          }
          clearSignedInState();
          showToast('Signed out successfully ✌️');
        } catch (error) {
          showToast('Error signing out. Please try again.');
        }
      }
    });
  }

  // --- Clear Signed-In State ---
  function clearSignedInState() {
    const profile = document.querySelector('.nav-user-profile');
    if (profile) profile.remove();
    const openSignInMobileBtn = document.getElementById('openSignInMobile');
    const openSignUpMobileBtn = document.getElementById('openSignUpMobile');
    
    if (openSignInBtn) openSignInBtn.style.display = '';
    if (openSignUpBtn) openSignUpBtn.style.display = '';
    if (openSignInMobileBtn) openSignInMobileBtn.style.display = '';
    if (openSignUpMobileBtn) openSignUpMobileBtn.style.display = '';
  }

  // ==========================================
  // 🔥 Firebase Authentication
  // ==========================================

  if (isFirebaseReady) {
    console.log('🔥 Firebase Auth active');

    // --- Auth State Listener (handles sign in/out + page refresh) ---
    let isFirstAuthCheck = true;

    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const displayName = user.displayName || user.email.split('@')[0];
        setSignedInState(displayName, user.photoURL);
        closeAllModals();

        // Save/update user profile in Firestore
        try {
          await db.collection('users').doc(user.uid).set({
            name: displayName,
            email: user.email,
            photoURL: user.photoURL || null,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        } catch (e) {
          console.warn('Could not save user profile to Firestore:', e.message);
        }

        // Only show toast on explicit sign-in, not page refresh
        if (!isFirstAuthCheck) {
          showToast(`Welcome back, ${displayName.split(' ')[0]}! 🎉`);
        }
      } else {
        clearSignedInState();
      }
      isFirstAuthCheck = false;
    });

    // --- Sign In with Email/Password ---
    const signInForm = document.getElementById('signInForm');
    signInForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = signInForm.querySelector('.auth-submit');

      const email = document.getElementById('signInEmail')?.value;
      const password = document.getElementById('signInPassword')?.value;
      if (!email || !password) return;

      // Disable button while loading
      submitBtn.textContent = 'Signing in...';
      submitBtn.disabled = true;

      try {
        await auth.signInWithEmailAndPassword(email, password);
        signInForm.reset();
        // Auth state listener handles the rest
      } catch (error) {
        const msg = getAuthErrorMessage(error.code);
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          showFieldError('signInPassword', msg);
        } else if (error.code === 'auth/user-not-found') {
          showFieldError('signInEmail', msg);
        } else {
          showToast(msg);
        }
      } finally {
        submitBtn.textContent = 'Sign In';
        submitBtn.disabled = false;
      }
    });

    // --- Sign Up with Email/Password ---
    const signUpForm = document.getElementById('signUpForm');
    signUpForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = signUpForm.querySelector('.auth-submit');

      const name = document.getElementById('signUpName')?.value;
      const email = document.getElementById('signUpEmail')?.value;
      const password = document.getElementById('signUpPassword')?.value;
      const confirmPw = document.getElementById('signUpConfirm')?.value;

      // Validate passwords match
      if (password !== confirmPw) {
        showFieldError('signUpConfirm', 'Passwords do not match');
        return;
      }

      if (!name || !email || !password) return;

      // Disable button while loading
      submitBtn.textContent = 'Creating account...';
      submitBtn.disabled = true;

      try {
        const result = await auth.createUserWithEmailAndPassword(email, password);

        // Set display name on Firebase user profile
        await result.user.updateProfile({ displayName: name });

        // Save user profile to Firestore
        await db.collection('users').doc(result.user.uid).set({
          name: name,
          email: email,
          photoURL: null,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });

        signUpForm.reset();
        // Reset password strength UI
        strengthBars.forEach(bar => bar.className = 'strength-bar');
        if (strengthText) {
          strengthText.textContent = 'Password strength';
          strengthText.className = 'strength-text';
        }

        showToast(`Account created! Welcome, ${name.split(' ')[0]}! 🎉`);
        // Auth state listener handles nav update
      } catch (error) {
        const msg = getAuthErrorMessage(error.code);
        if (error.code === 'auth/email-already-in-use') {
          showFieldError('signUpEmail', msg);
        } else if (error.code === 'auth/weak-password') {
          showFieldError('signUpPassword', msg);
        } else {
          showToast(msg);
        }
      } finally {
        submitBtn.textContent = 'Create Account';
        submitBtn.disabled = false;
      }
    });

    // --- Google Sign-In ---
    document.getElementById('googleSignIn')?.addEventListener('click', async () => {
      try {
        await auth.signInWithPopup(googleProvider);
      } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user') {
          showToast(getAuthErrorMessage(error.code));
        }
      }
    });

    document.getElementById('googleSignUp')?.addEventListener('click', async () => {
      try {
        await auth.signInWithPopup(googleProvider);
      } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user') {
          showToast(getAuthErrorMessage(error.code));
        }
      }
    });

    // --- GitHub Sign-In ---
    document.getElementById('githubSignIn')?.addEventListener('click', async () => {
      try {
        await auth.signInWithPopup(githubProvider);
      } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user') {
          showToast(getAuthErrorMessage(error.code));
        }
      }
    });

    document.getElementById('githubSignUp')?.addEventListener('click', async () => {
      try {
        await auth.signInWithPopup(githubProvider);
      } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user') {
          showToast(getAuthErrorMessage(error.code));
        }
      }
    });

  } else {
    // ==========================================
    // Fallback: localStorage Auth (no Firebase)
    // ==========================================
    console.warn('⚠️ Firebase not configured. Using localStorage auth as fallback.');

    // Check for existing session
    const savedUser = localStorage.getItem('financeflow-user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setSignedInState(user.name || 'User');
      } catch (e) { /* ignore */ }
    }

    // Sign In Form
    const signInForm = document.getElementById('signInForm');
    signInForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('signInEmail')?.value;
      const password = document.getElementById('signInPassword')?.value;
      if (!email || !password) return;

      const demoName = email.split('@')[0].replace(/[^a-zA-Z ]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      localStorage.setItem('financeflow-user', JSON.stringify({ name: demoName, email }));
      closeAllModals();
      setSignedInState(demoName);
      showToast(`Welcome, ${demoName.split(' ')[0]}! 🎉`);
      signInForm.reset();
    });

    // Sign Up Form
    const signUpForm = document.getElementById('signUpForm');
    signUpForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signUpName')?.value;
      const email = document.getElementById('signUpEmail')?.value;
      const password = document.getElementById('signUpPassword')?.value;
      const confirmPw = document.getElementById('signUpConfirm')?.value;

      if (password !== confirmPw) {
        showFieldError('signUpConfirm', 'Passwords do not match');
        return;
      }
      if (!name || !email || !password) return;

      localStorage.setItem('financeflow-user', JSON.stringify({ name, email }));
      closeAllModals();
      setSignedInState(name);
      showToast(`Welcome, ${name.split(' ')[0]}! 🎉`);
      signUpForm.reset();
      strengthBars.forEach(bar => bar.className = 'strength-bar');
      if (strengthText) { strengthText.textContent = 'Password strength'; strengthText.className = 'strength-text'; }
    });
  }

  // ==========================================
  // 🔥 Firestore — Blog Posts
  // ==========================================

  // Default blog posts data (used for seeding & fallback)
  const defaultPosts = [
    {
      title: "How to Budget Like a Pro: The 50/30/20 Rule Explained",
      excerpt: "The 50/30/20 rule is one of the simplest yet most powerful budgeting frameworks. Learn how to allocate 50% to needs, 30% to wants, and 20% to savings.",
      category: "Budgeting",
      author: "Priya Malhotra",
      date: "June 19, 2026",
      readTime: "5 min",
      image: "images/budgeting.png",
      content: `
        <p>The 50/30/20 rule is one of the simplest yet most powerful budgeting frameworks out there. Popularized by Senator Elizabeth Warren in her book <em>All Your Worth: The Ultimate Lifetime Money Plan</em>, this rule provides a straightforward way to divide your after-tax income into three distinct buckets.</p>
        <h2>The 50%: Needs</h2>
        <p>Half of your income should go towards essential living expenses. These are the bills that absolutely must be paid and are necessary for survival. This includes rent or mortgage payments, groceries, basic utilities, insurance premiums, and minimum debt payments.</p>
        <h2>The 30%: Wants</h2>
        <p>This is the fun bucket! 30% of your income can be allocated to non-essential expenses. Think dining out, entertainment, vacations, the latest gadgets, or that premium gym membership. It's crucial to have this bucket so you don't feel deprived, making your budget sustainable long-term.</p>
        <h2>The 20%: Savings and Investments</h2>
        <p>The final 20% is dedicated to your future self. This includes building an emergency fund, investing in the stock market (like mutual funds or ETFs), maxing out your retirement accounts, or making extra payments on high-interest debt.</p>
        <blockquote>"A budget is telling your money where to go instead of wondering where it went." — Dave Ramsey</blockquote>
        <p>Start tracking your expenses for a month without changing any habits, then categorize them into these three buckets. You might be surprised to find your "wants" are eating into your "savings". Adjust gradually, and you'll be budgeting like a pro in no time.</p>
      `
    },
    {
      title: "Tax-Saving Tips Every Salaried Employee Should Know in India",
      excerpt: "From Section 80C to HRA exemptions, discover the most effective tax-saving instruments available under the old and new Indian tax regimes.",
      category: "Tax Tips",
      author: "Rahul Kapoor",
      date: "June 17, 2026",
      readTime: "7 min",
      image: "images/tax-saving.png",
      content: `
        <p>Navigating the Indian tax system can feel like deciphering an ancient language. However, with the right knowledge, salaried employees can legally save a significant portion of their income from the taxman. Let's explore the most effective ways to optimize your taxes.</p>
        <h2>Mastering Section 80C</h2>
        <p>Section 80C is the cornerstone of tax planning in India, offering deductions up to ₹1.5 Lakhs per financial year. But where should you invest?</p>
        <ul>
          <li><strong>ELSS (Equity Linked Savings Scheme):</strong> The wealth builder. With a short lock-in period of just 3 years, ELSS offers the dual benefit of tax deduction and equity market returns.</li>
          <li><strong>PPF (Public Provident Fund):</strong> The safe haven. Offering guaranteed tax-free returns with a 15-year lock-in, it's perfect for conservative investors.</li>
          <li><strong>EPF (Employee Provident Fund):</strong> Your automatic savings. Both your contribution and your employer's contribution count here.</li>
        </ul>
        <h2>Beyond 80C: Hidden Gems</h2>
        <p>Don't stop at 80C. There are several other sections you can leverage:</p>
        <p><strong>Section 80D (Health Insurance):</strong> You can claim up to ₹25,000 for premiums paid for yourself and your family, and an additional ₹50,000 for senior citizen parents.</p>
        <p><strong>NPS (National Pension System) under 80CCD(1B):</strong> An exclusive extra deduction of ₹50,000 specifically for NPS contributions, over and above the 80C limit!</p>
        <blockquote>Remember: Tax planning should align with your financial goals, not just be a desperate scramble in March to save tax.</blockquote>
      `
    },
    {
      title: "10 Side Hustles That Can Earn You ₹50,000/Month in 2026",
      excerpt: "From freelancing and content creation to dropshipping and stock photography — explore proven side hustles that Indians are using to build secondary income.",
      category: "Side Hustles",
      author: "Ananya Sharma",
      date: "June 14, 2026",
      readTime: "9 min",
      image: "images/side-hustles.png",
      content: `
        <p>In 2026, relying on a single source of income is increasingly seen as a financial risk. The gig economy has exploded, and the barrier to entry for starting a side hustle has never been lower. Whether you want to pay off debt, invest more, or simply have more disposable income, here are proven ways to earn an extra ₹50,000 per month.</p>
        <h2>1. Freelance High-Income Skills</h2>
        <p>If you have skills in software development, UI/UX design, or specialized copywriting, platforms like Upwork and Fiverr are goldmines. Instead of competing on price, niche down. Become the "go-to AI Prompt Engineer" or the "expert Web3 copywriter." Specialization commands higher rates.</p>
        <h2>2. Digital Product Creation</h2>
        <p>Create once, sell infinitely. This is the beauty of digital products. You can create Notion templates, eBooks, or comprehensive video courses on platforms like Gumroad or Udemy. If you know how to solve a specific problem well, people will pay for your framework.</p>
        <h2>3. Niche Newsletter Publishing</h2>
        <p>Newsletters are making a massive comeback. Platforms like Substack allow you to build an audience around a hyper-specific topic (e.g., "Vegan Baking in Mumbai" or "Tech Policy in India"). Once you have a loyal readership, you can monetize through paid subscriptions or sponsorships.</p>
        <blockquote>"The most successful side hustles don't feel like work because they are built at the intersection of your skills and your genuine curiosities."</blockquote>
        <p>The key to hitting the ₹50,000 mark isn't trying to do all ten of these. It's picking ONE that aligns with your skills, dedicating 10 hours a week to it consistently for 6 months, and iterating based on market feedback.</p>
      `
    },
    {
      title: "Understanding Mutual Funds: A Beginner's Guide for Indian Investors",
      excerpt: "Confused about equity, debt, and hybrid mutual funds? This comprehensive guide breaks down every type of mutual fund, their risk profiles, and how to pick the best ones.",
      category: "Investing",
      author: "Arjun Mehta",
      date: "June 12, 2026",
      readTime: "8 min",
      image: "images/investment-strategies.png",
      content: `
        <p>Mutual funds have revolutionized investing for the middle class. By pooling money from thousands of investors, they offer professional management and diversification that was previously only accessible to the ultra-wealthy. But with thousands of funds available, where do you start?</p>
        <h2>The Three Main Categories</h2>
        <p>At their core, mutual funds invest in different asset classes. Understanding these is the first step to building a portfolio.</p>
        <ul>
          <li><strong>Equity Funds:</strong> These invest primarily in stocks. They offer the highest potential returns over the long term but come with high short-term volatility. Best for goals that are 5+ years away.</li>
          <li><strong>Debt Funds:</strong> These invest in fixed-income securities like government bonds and corporate debentures. They are relatively safe and provide stable, predictable returns. Best for short-term goals (1-3 years).</li>
          <li><strong>Hybrid Funds:</strong> A mix of both equity and debt. They aim to balance risk and reward, making them great for first-time investors who want growth but can't stomach extreme market swings.</li>
        </ul>
        <h2>Active vs. Passive Funds</h2>
        <p>This is the great debate in modern finance. <strong>Active funds</strong> are managed by a human fund manager who tries to beat the market by picking winning stocks. They charge a higher fee (Expense Ratio). <strong>Passive funds (Index Funds)</strong> simply track an existing market index (like the Nifty 50) automatically. They have very low fees.</p>
        <blockquote>Warren Buffett famously won a million-dollar bet that a simple S&P 500 index fund would outperform a basket of highly paid hedge funds over 10 years. He was right.</blockquote>
        <p>For beginners, starting with a broad market Index Fund is often the smartest, lowest-stress way to begin your wealth-building journey.</p>
      `
    },
    {
      title: "How to Start a SIP and Build Long-Term Wealth with ₹500/Month",
      excerpt: "Systematic Investment Plans (SIPs) are the most accessible way to build wealth in India. Learn how starting with just ₹500 per month can grow into ₹1 Crore.",
      category: "Savings",
      author: "Neha Joshi",
      date: "June 10, 2026",
      readTime: "6 min",
      image: "images/emergency-fund.png",
      content: `
        <p>The biggest myth in investing is that you need to be rich to start. The truth is, you get rich <em>by</em> starting. And in India, the Systematic Investment Plan (SIP) is the ultimate tool for the everyday wealth builder.</p>
        <h2>The Magic of Compounding</h2>
        <p>A SIP allows you to invest a fixed amount of money (as little as ₹500) into a mutual fund at regular intervals (usually monthly). This disciplined approach harnesses the power of compound interest.</p>
        <p>Let's look at the math. If you invest just ₹5,000 every month in an equity mutual fund that returns an average of 12% annually:</p>
        <ul>
          <li>In 10 years, you will have invested ₹6 Lakhs, but your portfolio will be worth <strong>₹11.6 Lakhs</strong>.</li>
          <li>In 20 years, your investment of ₹12 Lakhs will grow to <strong>₹50 Lakhs</strong>.</li>
          <li>In 30 years, an investment of ₹18 Lakhs will explode to an astonishing <strong>₹1.76 Crores</strong>.</li>
        </ul>
        <h2>Rupee Cost Averaging</h2>
        <p>The other superpower of a SIP is Rupee Cost Averaging. Because you invest a fixed amount every month regardless of market conditions, you automatically buy more units when the market is down (prices are low) and fewer units when the market is up (prices are high). This completely removes the stressful need to "time the market".</p>
        <blockquote>"Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it." — Albert Einstein</blockquote>
        <p>Don't wait for the "perfect time" to invest. The best time to plant a tree was 20 years ago. The second best time is today. Set up that ₹500 SIP right now.</p>
      `
    },
    {
      title: "Global Crypto Regulations in 2026: What Indian Investors Need to Know",
      excerpt: "With India's 30% crypto tax and 1% TDS in place, navigating the regulatory landscape is crucial. We break down rules across India, US, EU, and how they affect your portfolio.",
      category: "Crypto",
      author: "Vikram Rao",
      date: "June 8, 2026",
      readTime: "11 min",
      image: "images/crypto-investing.png",
      content: `
        <p>The wild west days of cryptocurrency are officially over. As we move deeper into 2026, global governments have established firm regulatory frameworks. For Indian investors, understanding these rules is no longer optional—it's critical for protecting your portfolio and staying out of legal trouble.</p>
        <h2>The Indian Landscape: Tax Heavy</h2>
        <p>India has taken a stringent approach to virtual digital assets (VDAs). The current rules remain strict:</p>
        <ul>
          <li><strong>Flat 30% Tax:</strong> All profits from crypto trading are taxed at a flat 30%, irrespective of your income tax slab.</li>
          <li><strong>No Set-Offs:</strong> Losses in one crypto cannot be set off against gains in another. If you make ₹1 Lakh on Bitcoin and lose ₹50,000 on Ethereum, you still pay 30% tax on the full ₹1 Lakh Bitcoin gain.</li>
          <li><strong>1% TDS:</strong> A 1% Tax Deducted at Source applies to all crypto transactions, significantly reducing the viability of day trading and high-frequency arbitrage.</li>
        </ul>
        <h2>The Global Context: MiCA and the SEC</h2>
        <p>While India focuses on taxation, other jurisdictions are focusing on market structure. The European Union's <em>Markets in Crypto-Assets (MiCA)</em> regulation is now fully in effect, providing the world's most comprehensive framework for stablecoin issuers and exchanges. It has made Europe a hub for compliant crypto businesses.</p>
        <p>Meanwhile, in the US, the SEC has shifted from enforcement-only to creating clear registration pathways for tokens, classifying the majority of Layer-1 tokens as commodities rather than securities.</p>
        <blockquote>Regulatory clarity, while painful in the short term regarding taxes, is what will eventually bring institutional trillions into the crypto space.</blockquote>
        <p>For the Indian investor, the strategy must shift from quick speculative flips to long-term holding of blue-chip assets like Bitcoin and Ethereum, minimizing transaction volume to avoid excessive TDS erosion.</p>
      `
    }
  ];

  // --- Seed Firestore with Default Posts ---
  async function seedPosts() {
    if (!isFirebaseReady) return;

    try {
      const snapshot = await db.collection('posts').limit(1).get();
      if (!snapshot.empty) {
        console.log('📝 Posts already exist in Firestore');
        return;
      }

      console.log('📝 Seeding Firestore with default posts...');
      const batch = db.batch();
      defaultPosts.forEach((post, i) => {
        const ref = db.collection('posts').doc();
        batch.set(ref, {
          ...post,
          createdAt: new Date(2026, 5, 19 - (i * 2)), // Stagger dates
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
      await batch.commit();
      console.log('✅ Seeded', defaultPosts.length, 'posts');
    } catch (e) {
      console.warn('Could not seed posts:', e.message);
    }
  }

  // --- Fetch Posts from Firestore ---
  async function fetchPostsFromFirestore() {
    if (!isFirebaseReady) return null;

    try {
      const snapshot = await db.collection('posts')
        .orderBy('createdAt', 'desc')
        .limit(6)
        .get();

      if (snapshot.empty) return null;

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (e) {
      console.warn('Could not fetch posts from Firestore:', e.message);
      return null;
    }
  }

  // --- Render Article Card HTML ---
  function renderArticleCard(post, index) {
    let initials = 'A';
    if (post.author && typeof post.author === 'string') {
      initials = post.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
    }
    
    let dateStr = post.date || 'Recent';
    if (!post.date && post.createdAt && typeof post.createdAt.toDate === 'function') {
      dateStr = post.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    // Store content in a hidden div or data attribute, or we can just keep it in memory
    // Because stringifying HTML into data attributes can break, we will store it globally

    return `
      <article class="article-card animate-on-scroll delay-${index}" data-post-index="${index}" style="cursor: pointer;">
        <div class="article-card-image">
          <span class="card-category">${post.category}</span>
          <img src="${post.image}" alt="${post.title}" loading="lazy">
        </div>
        <div class="article-card-body">
          <h3 class="card-title">${post.title}</h3>
          <p class="card-excerpt">${post.excerpt}</p>
          <div class="card-footer">
            <div class="card-author">
              <div class="card-author-avatar">${initials}</div>
              <div>
                <div class="card-author-name">${post.author}</div>
                <div class="card-author-date">${dateStr}</div>
              </div>
            </div>
            <span class="card-read-time">⏱️ ${post.readTime}</span>
          </div>
        </div>
      </article>
    `;
  }

  // Store fetched posts globally for the reader modal
  window.currentPostsData = [];

  // --- Load & Render Posts ---
  async function loadArticles() {
    const articlesGrid = document.querySelector('.articles-grid');
    if (!articlesGrid) return;

    let postsToRender = defaultPosts;

    // Try Firestore first
    const firestorePosts = await fetchPostsFromFirestore();
    if (firestorePosts && firestorePosts.length > 0) {
      console.log('📰 Loaded', firestorePosts.length, 'posts from Firestore');
      
      // Merge local content into firestore posts (in case DB was seeded before content was added)
      postsToRender = firestorePosts.map(fp => {
        const localMatch = defaultPosts.find(dp => dp.title === fp.title);
        if (!fp.content && localMatch) {
          fp.content = localMatch.content;
        }
        return fp;
      });
    }

    // Save to global variable for reader
    window.currentPostsData = postsToRender;

    // Render HTML
    articlesGrid.innerHTML = postsToRender.map((post, i) => renderArticleCard(post, i)).join('');
    
    // Attach click listeners to new article cards
    articlesGrid.querySelectorAll('.article-card').forEach(card => {
      card.addEventListener('click', () => {
        const index = card.getAttribute('data-post-index');
        openArticleReader(window.currentPostsData[index]);
      });
      // Re-observe for scroll animation
      scrollObserver.observe(card);
    });
  }

  // --- Category Filtering Logic ---
  const categoryCards = document.querySelectorAll('.category-card');
  let activeCategory = null;

  categoryCards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const catName = card.querySelector('.category-name').textContent;
      const articlesGrid = document.querySelector('.articles-grid');
      
      if (activeCategory === catName) {
        // Reset filter
        activeCategory = null;
        categoryCards.forEach(c => c.style.boxShadow = '');
        articlesGrid.innerHTML = window.currentPostsData.map((post, i) => renderArticleCard(post, i)).join('');
      } else {
        // Apply filter
        activeCategory = catName;
        categoryCards.forEach(c => c.style.boxShadow = '');
        card.style.boxShadow = '0 0 0 2px var(--accent)';
        card.style.borderRadius = 'var(--radius-lg)'; // Match card radius
        
        const filtered = window.currentPostsData.filter(post => post.category === catName);
        if (filtered.length > 0) {
          articlesGrid.innerHTML = filtered.map(post => {
            const originalIndex = window.currentPostsData.indexOf(post);
            return renderArticleCard(post, originalIndex);
          }).join('');
        } else {
          articlesGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 3rem; font-size: 1.2rem;">No articles in <b>${catName}</b> yet. Check back later! <br><br> <a href="#" id="resetFilterBtn" style="color:var(--accent); font-weight:bold;">View All Articles</a></p>`;
          
          document.getElementById('resetFilterBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            activeCategory = null;
            categoryCards.forEach(c => c.style.boxShadow = '');
            articlesGrid.innerHTML = window.currentPostsData.map((post, i) => renderArticleCard(post, i)).join('');
            reattachReaderListeners(articlesGrid);
          });
        }
      }

      reattachReaderListeners(articlesGrid);

      // Smooth scroll to articles section (accounting for sticky nav)
      const section = document.getElementById('articles');
      const offset = 80;
      const topPos = section.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: topPos, behavior: 'smooth' });
    });
  });

  function reattachReaderListeners(grid) {
    grid.querySelectorAll('.article-card').forEach(c => {
      c.addEventListener('click', () => {
        const index = c.getAttribute('data-post-index');
        openArticleReader(window.currentPostsData[index]);
      });
      scrollObserver.observe(c);
    });
  }

  // --- Initialize Firestore ---
  if (isFirebaseReady) {
    seedPosts().then(() => loadArticles());
  } else {
    // Fallback if firebase not ready
    loadArticles();
  }

  // ==========================================
  // 🔥 Firestore — Newsletter Subscribers
  // ==========================================
  const fbNewsletterForm = document.getElementById('newsletterForm');
  fbNewsletterForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = fbNewsletterForm.querySelector('input[type="email"]');
    const submitBtn = fbNewsletterForm.querySelector('button');
    const email = emailInput?.value;

    if (!email) return;

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Subscribing...';
    submitBtn.disabled = true;

    try {
      if (isFirebaseReady) {
        // Save subscriber to Firestore
        await db.collection('subscribers').add({
          email: email,
          subscribedAt: firebase.firestore.FieldValue.serverTimestamp(),
          source: 'website'
        });
      }

      submitBtn.textContent = '✓ Subscribed!';
      submitBtn.style.background = 'var(--success)';
      emailInput.value = '';
      showToast('Successfully subscribed to our newsletter! 📬');
    } catch (error) {
      showToast('Could not subscribe. Please try again.');
    } finally {
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
      }, 3000);
    }
  });

  // ==========================================
  // Article Reader Modal Logic
  // ==========================================
  const readerModal = document.getElementById('articleReaderModal');
  const closeReaderBtn = document.getElementById('closeReaderBtn');
  const readerProgress = document.getElementById('readerProgress');
  
  function openArticleReader(post) {
    if (!post) {
      console.warn('Tried to open reader, but post is undefined');
      return;
    }
    if (!readerModal) {
      console.error('Reader modal element not found in HTML!');
      return;
    }
    
    try {
      // Populate Modal Data safely
      const categoryEl = document.getElementById('readerCategory');
      if (categoryEl) categoryEl.textContent = post.category || 'Article';
      
      const titleEl = document.getElementById('readerTitle');
      if (titleEl) titleEl.textContent = post.title || 'Untitled';
      
      const imageEl = document.getElementById('readerImage');
      if (imageEl) imageEl.src = post.image || '';
      
      const authorNameEl = document.getElementById('readerAuthorName');
      if (authorNameEl) authorNameEl.textContent = post.author || 'Author';
      
      const authorAvatarEl = document.getElementById('readerAuthorAvatar');
      if (authorAvatarEl) {
        authorAvatarEl.textContent = post.author ? post.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'A';
      }
      
      const readTimeEl = document.getElementById('readerReadTime');
      if (readTimeEl) readTimeEl.textContent = post.readTime || '5 min';
      
      let dateStr = post.date || 'Recent';
      if (!post.date && post.createdAt && typeof post.createdAt.toDate === 'function') {
        dateStr = post.createdAt.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
      const dateEl = document.getElementById('readerDate');
      if (dateEl) dateEl.textContent = dateStr;
      
      // Inject Content (fallback if missing)
      const bodyEl = document.getElementById('readerBody');
      if (bodyEl) {
        bodyEl.innerHTML = post.content || `<p>${post.excerpt || 'No excerpt available.'}</p><p><em>Full content for this post was not found.</em></p>`;
      }

      // Show Modal
      readerModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock background scroll
      
      // Reset scroll & progress
      readerModal.scrollTop = 0;
      if (readerProgress) readerProgress.style.width = '0%';
    } catch (err) {
      alert('CRITICAL ERROR in openArticleReader: ' + err.message + '\n' + err.stack);
      console.error('Error opening article reader:', err);
    }
  }

  function closeArticleReader() {
    readerModal.classList.remove('active');
    document.body.style.overflow = ''; // Unlock scroll
  }

  // Close Events
  closeReaderBtn?.addEventListener('click', closeArticleReader);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (readerModal?.classList.contains('active')) closeArticleReader();
      if (document.getElementById('publishModal')?.classList.contains('active')) closePublishModal();
    }
  });

  // Reading Progress Bar
  readerModal?.addEventListener('scroll', () => {
    const scrollable = readerModal.scrollHeight - readerModal.clientHeight;
    if (scrollable > 0) {
      const scrolled = readerModal.scrollTop;
      const progress = (scrolled / scrollable) * 100;
      readerProgress.style.width = `${progress}%`;
    }
  });

  // ==========================================
  // Publisher Modal Logic
  // ==========================================
  const publishModal = document.getElementById('publishModal');
  const publishModalOverlay = document.getElementById('publishModalOverlay');
  const closePublishModalBtn = document.getElementById('closePublishModal');
  const openPublishModalBtn = document.getElementById('openPublishModal');
  const openPublishModalMobileBtn = document.getElementById('openPublishModalMobile');
  const publishForm = document.getElementById('publishForm');

  function openPublishModal() {
    publishModalOverlay?.classList.add('active');
    publishModal?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closePublishModal() {
    publishModalOverlay?.classList.remove('active');
    publishModal?.classList.remove('active');
    document.body.style.overflow = '';
  }

  [openPublishModalBtn, openPublishModalMobileBtn].forEach(btn => {
    btn?.addEventListener('click', (e) => {
      e.preventDefault();
      // Only close mobile menu if it is open
      const navLinks = document.getElementById('navLinks');
      const mobileToggle = document.getElementById('mobileToggle');
      if (navLinks?.classList.contains('active')) {
        navLinks.classList.remove('active');
        mobileToggle?.classList.remove('active');
        document.body.style.overflow = '';
      }

      if (isFirebaseReady) {
        if (!auth.currentUser) {
          showToast('Please sign in to write a post! 🔒');
          openModal(signInModal);
          return;
        }
      } else {
        if (!localStorage.getItem('financeflow-user')) {
          showToast('Please sign in to write a post! 🔒');
          openModal(signInModal);
          return;
        }
      }
      openPublishModal();
    });
  });

  closePublishModalBtn?.addEventListener('click', closePublishModal);
  publishModalOverlay?.addEventListener('click', closePublishModal);

  publishForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('pubTitle').value;
    const category = document.getElementById('pubCategory').value;
    const image = document.getElementById('pubImage').value;
    const excerpt = document.getElementById('pubExcerpt').value;
    const content = document.getElementById('pubContent').value;
    
    if (!title || !content) return;
    
    const submitBtn = publishForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Publishing...';
    submitBtn.disabled = true;
    
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('You must be signed in to publish.');
      const authorName = user.displayName || user.email.split('@')[0];
      
      // Calculate approximate read time (200 words per minute)
      const wordCount = content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min';

      await db.collection('posts').add({
        title,
        category,
        image,
        excerpt,
        content,
        author: authorName,
        authorUid: user.uid,
        readTime,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      showToast('Article published successfully! 🎉');
      publishForm.reset();
      closePublishModal();
      
      // Refresh the articles list
      loadArticles();
      
      // Scroll to articles
      const offset = 80;
      const section = document.getElementById('articles');
      const topPos = section.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: topPos, behavior: 'smooth' });
    } catch (err) {
      alert('Error publishing article: ' + err.message);
    } finally {
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    }
  });

});


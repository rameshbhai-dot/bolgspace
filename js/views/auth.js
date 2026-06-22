import { supabase } from '../supabase.js';

export async function renderAuth(root, type) {
  const isLogin = type === 'login';
  
  root.innerHTML = `
    <div class="container" style="max-width: 400px; padding: 60px 0;">
      <div style="background: var(--color-surface); padding: 32px; border-radius: 12px; border: 1px solid var(--color-border-light);">
        <h2 style="margin-top: 0; margin-bottom: 24px; text-align: center;">${isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
        
        <form id="authForm">
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label" style="display: block; margin-bottom: 8px;">Email</label>
            <input type="email" id="emailInput" class="form-input" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--color-border-light);" required>
          </div>
          
          <div class="form-group" style="margin-bottom: 24px;">
            <label class="form-label" style="display: block; margin-bottom: 8px;">Password</label>
            <input type="password" id="passwordInput" class="form-input" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--color-border-light);" required>
          </div>
          
          <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">${isLogin ? 'Log In' : 'Sign Up'}</button>
        </form>
        
        <div id="authError" style="color: red; margin-top: 16px; text-align: center; font-size: 14px;"></div>
        
        <p style="text-align: center; margin-top: 24px; font-size: 14px; color: var(--color-text-secondary);">
          ${isLogin ? 'Need an account?' : 'Already have an account?'} 
          <a href="#/auth/${isLogin ? 'signup' : 'login'}" style="color: var(--color-primary); font-weight: 500;">${isLogin ? 'Sign Up' : 'Log In'}</a>
        </p>
      </div>
    </div>
  `;

  document.getElementById('authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const errorDiv = document.getElementById('authError');
    
    errorDiv.innerText = '';
    
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        errorDiv.innerText = error.message;
      } else {
        window.location.hash = '#/';
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        errorDiv.innerText = error.message;
      } else {
        window.location.hash = '#/';
      }
    }
  });
}

// Login page - Google/Facebook and email auth (demo/mock)
// For production: wire up real OAuth with your API keys

const LOGGED_KEY = 'ai_traffic_logged_in';
const DASHBOARD_URL = 'index.html';

function setLoggedIn() {
  sessionStorage.setItem(LOGGED_KEY, 'true');
  window.location.href = DASHBOARD_URL;
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btn-email-login');
  btn.classList.add('loading');
  
  // Simulate API delay
  await new Promise((r) => setTimeout(r, 1200));
  
  setLoggedIn();
});

document.getElementById('btn-google').addEventListener('click', async () => {
  const btn = document.getElementById('btn-google');
  btn.style.pointerEvents = 'none';
  btn.style.opacity = '0.8';
  
  // In production: initiate Google OAuth flow
  // e.g. window.location = 'https://accounts.google.com/o/oauth2/...'
  await new Promise((r) => setTimeout(r, 800));
  
  setLoggedIn();
});

document.getElementById('btn-facebook').addEventListener('click', async () => {
  const btn = document.getElementById('btn-facebook');
  btn.style.pointerEvents = 'none';
  btn.style.opacity = '0.8';
  
  // In production: initiate Facebook OAuth flow
  // e.g. FB.login(...) or redirect to Facebook OAuth
  await new Promise((r) => setTimeout(r, 800));
  
  setLoggedIn();
});

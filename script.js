// script.js - Satu file untuk semua auth logic
console.log('script.js berhasil dimuat!');

const SUPABASE_URL = 'https://xugvfahhmjidhlvtfvua.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UFcMgjZdauFvAusQm4JtXA_c8XvYqO2';

// Buat client sekali saja
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase client dibuat');

// Helper: Cek session & redirect jika sudah login
async function checkAuth(redirectIfLoggedIn = false) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session && redirectIfLoggedIn && !window.location.pathname.includes('dashboard.html')) {
    window.location.href = 'dashboard.html';
  }
  return session;
}

// Jalankan check auth di semua halaman
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Memulai check auth...');
  await checkAuth(true);
});

// REGISTER
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('reg-fullname')?.value.trim() || '';
    const email    = document.getElementById('reg-email')?.value.trim() || '';
    const phone    = document.getElementById('reg-phone')?.value.trim() || '';
    const password = document.getElementById('reg-password')?.value || '';

    if (!fullName || !email || !phone || !password) return alert('Semua field wajib diisi!');
    if (password.length < 6) return alert('Password minimal 6 karakter!');

    try {
      const { error } = await supabaseClient.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, phone } }
      });
      if (error) throw error;
      alert('Registrasi berhasil! Cek email untuk konfirmasi.');
      window.location.href = 'login.html';
    } catch (err) {
      alert('Gagal registrasi: ' + (err.message || 'Cek koneksi'));
      console.error(err);
    }
  });
}

// LOGIN
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value.trim() || '';
    const password = document.getElementById('login-password')?.value || '';

    if (!email || !password) return alert('Email dan password wajib diisi!');

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      alert('Login berhasil!');
      window.location.href = 'dashboard.html';
    } catch (err) {
      let msg = 'Gagal login';
      if (err.message.includes('Invalid login credentials')) msg = 'Email atau password salah!';
      if (err.message.includes('Email not confirmed')) msg = 'Konfirmasi email terlebih dahulu!';
      alert(msg);
      console.error(err);
    }
  });
}

// FORGOT PASSWORD
const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email')?.value.trim() || '';
    if (!email) return alert('Masukkan email Anda!');

    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://trdjournal.netlify.app/update-password.html'
      });
      if (error) throw error;
      alert('Link reset telah dikirim ke email Anda. Cek inbox/spam.');
    } catch (err) {
      alert('Gagal kirim link: ' + (err.message || 'Cek koneksi'));
      console.error(err);
    }
  });
}

// UPDATE PASSWORD (dari update-password.html)
const updateForm = document.getElementById('updateForm');
if (updateForm) {
  updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    const errorEl = document.getElementById('errorMsg');

    errorEl.style.display = 'none';
    errorEl.textContent = '';

    if (newPass.length < 6) {
      errorEl.textContent = 'Password minimal 6 karakter';
      errorEl.style.display = 'block';
      return;
    }
    if (newPass !== confirmPass) {
      errorEl.textContent = 'Konfirmasi password tidak cocok';
      errorEl.style.display = 'block';
      return;
    }

    try {
      const { error } = await supabaseClient.auth.updateUser({ password: newPass });
      if (error) throw error;
      alert('Password berhasil diupdate! Silakan login kembali.');
      window.location.href = 'login.html';
    } catch (err) {
      errorEl.textContent = err.message || 'Gagal update password';
      errorEl.style.display = 'block';
      console.error(err);
    }
  });
}

console.log('Semua handler auth siap');
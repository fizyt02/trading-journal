// script.js
const supabaseUrl  = 'https://jrsbpkjqosnepruiljc.supabase.co';
const supabaseKey  = 'sb_publishable_VXQr2F_w-tXxS7fVIYmSKg_ZkNcbICj';
const supabase = Supabase.createClient(supabaseUrl, supabaseKey);

// Helper: Cek apakah sudah login
async function checkAuth(redirectIfLoggedIn = false) {
  const { data: { session } } = await supabase.auth.getSession();
  if (session && redirectIfLoggedIn && !window.location.pathname.includes('dashboard.html')) {
    window.location.href = 'dashboard.html';
  }
  return session;
}

// Jalankan check auth di semua halaman
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth(true);
});

// REGISTER LOGIC
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.querySelector('input[placeholder="Full Name"]').value.trim();
    const username  = document.querySelector('input[placeholder="Username"]').value.trim();
    const email     = document.querySelector('input[placeholder="Email (Gmail)"]').value.trim();
    const phone     = document.querySelector('input[placeholder="Phone Number"]').value.trim();
    const password  = document.querySelector('input[placeholder="Password"]').value;

    if (!fullName || !username || !email || !password) {
      alert('Semua field wajib diisi!');
      return;
    }
    if (password.length < 6) {
      alert('Password minimal 6 karakter!');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
            phone: phone
          }
        }
      });

      if (error) throw error;

      alert('Registrasi berhasil! Cek email untuk konfirmasi (jika aktif).');
      window.location.href = 'login.html';
    } catch (error) {
      alert('Gagal registrasi: ' + (error.message || 'Terjadi kesalahan'));
      console.error(error);
    }
  });
}

// LOGIN LOGIC
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.querySelector('input[placeholder="Email"]').value.trim();
    const password = document.querySelector('input[placeholder="Password"]').value;

    if (!email || !password) {
      alert('Email dan password wajib diisi!');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      alert('Login berhasil!');
      window.location.href = 'dashboard.html';
    } catch (error) {
      let msg = 'Terjadi kesalahan';
      if (error.message.includes('Invalid login credentials')) {
        msg = 'Email atau password salah!';
      } else if (error.message.includes('Email not confirmed')) {
        msg = 'Silakan konfirmasi email terlebih dahulu!';
      } else {
        msg = error.message;
      }
      alert(msg);
      console.error(error);
    }
  });
}

// FORGOT PASSWORD LOGIC
const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.querySelector('#forgotForm input[type="email"]').value.trim();

    if (!email) {
      alert('Masukkan email Anda terlebih dahulu!');
      return;
    }

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://trdjournal.netlify.app/update-password.html'
      });

      if (error) throw error;

      alert('Link reset password telah dikirim ke email Anda!\nCek inbox atau folder spam.');
    } catch (error) {
      let msg = 'Terjadi kesalahan saat mengirim link reset';
      if (error.message.includes('invalid') || error.message.includes('not found')) {
        msg = 'Email tidak terdaftar atau tidak valid';
      } else if (error.message.includes('rate limit')) {
        msg = 'Terlalu banyak percobaan. Coba lagi dalam beberapa menit';
      } else {
        msg = error.message;
      }
      alert(msg);
      console.error('Reset password error:', error);
    }
  });
}
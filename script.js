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

// Jalankan check auth di semua halaman saat dimuat
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth(true); // Redirect ke dashboard kalau sudah login (kecuali di dashboard sendiri)
});

// REGISTER LOGIC (tanpa username)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.querySelector('input[placeholder="Full Name"]').value.trim();
    const email     = document.querySelector('input[placeholder="Email (Gmail)"]').value.trim();
    const phone     = document.querySelector('input[placeholder="Phone Number"]').value.trim();
    const password  = document.querySelector('input[placeholder="Password"]').value;

    // Validasi sederhana
    if (!fullName || !email || !phone || !password) {
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
            phone: phone
          }
        }
      });

      if (error) throw error;

      alert('Registrasi berhasil! Cek email Anda untuk konfirmasi akun (jika diaktifkan).');
      window.location.href = 'login.html';
    } catch (error) {
      let msg = 'Gagal registrasi';
      if (error.message.includes('duplicate key') || error.message.includes('unique')) {
        msg = 'Email sudah terdaftar';
      } else if (error.message.includes('weak password')) {
        msg = 'Password terlalu lemah (coba tambah angka/symbol)';
      } else {
        msg += ': ' + error.message;
      }
      alert(msg);
      console.error('Register error:', error);
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
        msg = 'Silakan konfirmasi email terlebih dahulu! Cek inbox/spam.';
      } else if (error.message.includes('rate limit')) {
        msg = 'Terlalu banyak percobaan. Coba lagi nanti.';
      } else {
        msg += ': ' + error.message;
      }
      alert(msg);
      console.error('Login error:', error);
    }
  });
}

// FORGOT PASSWORD / RESET PASSWORD LOGIC
const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = document.querySelector('#forgotForm input[type="email"]');
    const email = emailInput?.value.trim();

    if (!email) {
      alert('Masukkan email Anda terlebih dahulu!');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://trdjournal.netlify.app/update-password.html'
      });

      if (error) throw error;

      alert('Link reset password telah dikirim ke email Anda!\nCek inbox atau folder spam.');
    } catch (error) {
      let msg = 'Gagal mengirim link reset';
      if (error.message.includes('invalid') || error.message.includes('not found')) {
        msg = 'Email tidak terdaftar atau tidak valid';
      } else if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
        msg = 'Terlalu banyak percobaan. Coba lagi dalam beberapa menit';
      } else {
        msg += ': ' + error.message;
      }
      alert(msg);
      console.error('Forgot password error:', error);
    }
  });
}
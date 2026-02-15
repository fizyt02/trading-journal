// script.js
const supabaseUrl = 'https://trdjournal.netlify.app/';          // GANTI DENGAN URL PROJECT KAMU
const supabaseKey = 'sb_publishable_VXQr2F_w-tXxS7fVIYmSKg_ZkNcbICj';                        // GANTI DENGAN anon key dari Supabase → Settings → API
const supabase = Supabase.createClient(supabaseUrl, supabaseKey);

// Helper: Cek apakah sudah login
async function checkAuth(redirectIfLoggedIn = false) {
  const { data: { session } } = await supabase.auth.getSession();
  if (session && redirectIfLoggedIn) {
    window.location.href = 'dashboard.html'; // nanti buat file ini
  }
  return session;
}

// Jalankan check auth di semua halaman (bisa di-expand)
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth(true); // redirect jika sudah login (untuk index.html, login, register, dll)
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

    // Validasi sederhana
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

      alert('Registrasi berhasil! Cek email Anda untuk konfirmasi (jika aktif).');
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

    const email = document.querySelector('input[placeholder="Username"]').value.trim(); // asumsi username = email
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
      window.location.href = 'dashboard.html'; // redirect ke dashboard
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

// FORGOT PASSWORD 
const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Ambil email dari input (sesuai HTML forgot-password.html)
    const emailInput = document.querySelector('#forgotForm input[type="email"]');
    const email = emailInput?.value.trim();

    if (!email) {
      alert('Masukkan email Anda terlebih dahulu!');
      return;
    }

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password.html`  
        // Ganti '/update-password.html' dengan halaman reset password kamu nanti
        // Contoh: https://nama-domainkamu.com/update-password.html
      });

      if (error) throw error;

      alert('Link reset password telah dikirim ke email Anda!\nCek inbox atau folder spam.');
      
      // Optional: kembali ke login setelah kirim
      // window.location.href = 'login.html';

    } catch (error) {
      let msg = 'Terjadi kesalahan saat mengirim link reset';

      if (error.message.includes('invalid') || error.message.includes('not found')) {
        msg = 'Email tidak terdaftar atau tidak valid';
      } else if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
        msg = 'Terlalu banyak percobaan. Coba lagi dalam beberapa menit';
      } else {
        msg = error.message;
      }

      alert(msg);
      console.error('Reset password error:', error);
    }
  });
}
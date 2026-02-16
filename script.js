// script.js - Versi bersih, tanpa duplikasi supabase
console.log('script.js berhasil dimuat!'); // Debug: pastikan file ini jalan

const supabaseUrl  = 'https://jrsbpkjqosnepruiljc.supabase.co';
const supabaseKey  = 'sb_publishable_VXQr2F_w-tXxS7fVIYmSKg_ZkNcbICj';
const supabase = Supabase.createClient(supabaseUrl, supabaseKey);

console.log('Supabase client berhasil dibuat!'); // Debug: cek inisialisasi

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
  console.log('DOMContentLoaded: Memulai check auth');
  await checkAuth(true);
});

// REGISTER LOGIC (tanpa username)
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  console.log('registerForm DITEMUKAN! Event listener diaktifkan');
  
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form register di-submit!');

    const fullName = document.querySelector('input[placeholder="Full Name"]').value.trim();
    const email     = document.querySelector('input[placeholder="Email (Gmail)"]').value.trim();
    const phone     = document.querySelector('input[placeholder="Phone Number"]').value.trim();
    const password  = document.querySelector('input[placeholder="Password"]').value;

    if (!fullName || !email || !phone || !password) {
      alert('Semua field wajib diisi!');
      console.log('Validasi gagal: field kosong');
      return;
    }
    if (password.length < 6) {
      alert('Password minimal 6 karakter!');
      console.log('Validasi gagal: password terlalu pendek');
      return;
    }

    try {
      console.log('Mengirim request signUp ke Supabase...');
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

      console.log('Registrasi sukses:', data);
      alert('Registrasi berhasil! Cek email Anda untuk konfirmasi akun (jika diaktifkan).');
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Register error:', error);
      let msg = 'Gagal registrasi';
      if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        msg = 'Email sudah terdaftar!';
      } else if (error.message.includes('weak password')) {
        msg = 'Password terlalu lemah (minimal 6 karakter, tambah angka/symbol lebih baik)';
      } else if (error.message.includes('rate limit')) {
        msg = 'Terlalu banyak percobaan. Coba lagi beberapa menit.';
      } else {
        msg += ': ' + (error.message || 'Terjadi kesalahan tidak diketahui');
      }
      alert(msg);
    }
  });
} else {
  console.error('registerForm TIDAK DITEMUKAN! Pastikan <form id="registerForm"> ada di HTML.');
}

// LOGIN LOGIC
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  console.log('loginForm DITEMUKAN!');
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form login di-submit!');

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
      } else {
        msg += ': ' + error.message;
      }
      alert(msg);
      console.error('Login error:', error);
    }
  });
} else {
  console.log('loginForm tidak ditemukan di halaman ini (normal jika bukan halaman login)');
}

// FORGOT PASSWORD LOGIC
const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
  console.log('forgotForm DITEMUKAN!');
  
  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form forgot password di-submit!');

    const email = document.querySelector('#forgotForm input[type="email"]').value.trim();

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
      } else if (error.message.includes('rate limit')) {
        msg = 'Terlalu banyak percobaan. Coba lagi nanti';
      } else {
        msg += ': ' + error.message;
      }
      alert(msg);
      console.error('Forgot password error:', error);
    }
  });
} else {
  console.log('forgotForm tidak ditemukan di halaman ini (normal jika bukan halaman forgot-password)');
}

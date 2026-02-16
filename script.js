// script.js - VERSI BERSIH TOTAL, TANPA DUPLIKASI APA PUN
console.log('=== script.js MULAI DIMUAT ===');

const supabaseUrl  = 'https://jrsbpkjqosnepruiljc.supabase.co';
const supabaseKey  = 'sb_publishable_VXQr2F_w-tXxS7fVIYmSKg_ZkNcbICj';
const supabase = Supabase.createClient(supabaseUrl, supabaseKey);

console.log('Supabase client OK');

// Cek form register
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  console.log('Form register DITEMUKAN!');
  
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Ini yang mencegah refresh!
    console.log('Submit register ditekan!');

    const fullName = document.querySelector('input[placeholder="Full Name"]')?.value.trim() || '';
    const email    = document.querySelector('input[placeholder="Email (Gmail)"]')?.value.trim() || '';
    const phone    = document.querySelector('input[placeholder="Phone Number"]')?.value.trim() || '';
    const password = document.querySelector('input[placeholder="Password"]')?.value || '';

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
          data: { full_name: fullName, phone }
        }
      });

      if (error) throw error;

      alert('Registrasi berhasil! Cek email konfirmasi jika diperlukan.');
      window.location.href = 'login.html';
    } catch (err) {
      console.error('Error register:', err);
      alert('Gagal registrasi: ' + (err.message || 'Cek koneksi / Supabase'));
    }
  });
} else {
  console.error('Form register TIDAK DITEMUKAN! Cek <form id="registerForm"> di HTML');
}

// Jika halaman lain (login/forgot), tambahkan log sederhana
console.log('=== script.js SELESAI ===');

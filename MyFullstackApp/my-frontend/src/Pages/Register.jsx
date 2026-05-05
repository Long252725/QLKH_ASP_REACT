import React, { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    username: '',
    // password: delegate,
    confirmPassword: '',
    sdt: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    console.log("Dữ liệu đăng ký:", formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200 mb-4">
            <i className="fa-solid fa-user-plus text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Tạo tài khoản mới</h2>
          <p className="text-slate-500 text-sm mt-2">Bắt đầu quản lý khách hàng chuyên nghiệp ngay hôm nay</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Họ và Tên */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Họ và Tên</label>
                <input
                  type="text"
                  name="hoTen"
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Số điện thoại</label>
                <input
                  type="text"
                  name="sdt"
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  placeholder="0912xxxxxx"
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  placeholder="example@gmail.com"
                />
              </div>

              {/* Tên đăng nhập */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Tên đăng nhập</label>
                <input
                  type="text"
                  name="username"
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  placeholder="username123"
                />
              </div>

              {/* Mật khẩu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              {/* Xác nhận mật khẩu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Điều khoản */}
            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" required className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer" />
              <span className="text-sm text-slate-600">Tôi đồng ý với <a href="#" className="text-emerald-600 font-bold hover:underline">Điều khoản & Chính sách</a></span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 hover:shadow-emerald-200 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              Đăng ký tài khoản
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </form>
        </div>

        {/* Link quay lại Login */}
        <p className="text-center mt-8 text-sm text-slate-600">
          Đã có tài khoản?{' '}
          <a href="/login" className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4">
            Đăng nhập ngay
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
import React, { useState } from 'react';

const Login = () => {
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Đang đăng nhập với:", loginData);
    // Gọi API login của bạn ở đây
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo hoặc Tên hệ thống */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 mb-4">
            <i className="fa-solid fa-shield-halved text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Chào mừng trở lại</h2>
          <p className="text-slate-500 text-sm mt-2">Vui lòng đăng nhập để quản lý khách hàng</p>
        </div>

        {/* Card Login */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
                Tài khoản
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-user text-slate-400 text-sm"></i>
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  value={loginData.username}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                  placeholder="Nhập tên đăng nhập..."
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-lock text-slate-400 text-sm"></i>
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={loginData.password}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Remember & Forgot Pass */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={loginData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="ml-2 text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Ghi nhớ tôi</span>
              </label>
              <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Quên mật khẩu?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Đăng nhập ngay
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </form>

          {/* Social Login (Optional) */}
          <div className="mt-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-medium">Hoặc đăng nhập với</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer text-sm font-medium text-slate-700">
                <i className="fa-brands fa-google text-red-500"></i>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer text-sm font-medium text-slate-700">
                <i className="fa-brands fa-facebook text-blue-600"></i>
                Facebook
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center mt-8 text-sm text-slate-600">
          Chưa có tài khoản?{' '}
          <a href="/register" className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4">
            Đăng ký miễn phí
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
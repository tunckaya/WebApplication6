import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, MapPin, User, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

const ModernLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState(0);

  // Demo kullanıcı bilgileri
  const demoUsers = [
    {
      name: "Admin User",
      email: "admin@geopoint.com",
      password: "admin123",
      role: "Administrator",
      avatar: "👨‍💼"
    },
    {
      name: "John Doe",
      email: "john.doe@example.com", 
      password: "user123",
      role: "Standard User",
      avatar: "👨‍🚀"
    },
    {
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      password: "demo123",
      role: "Manager",
      avatar: "👩‍💻"
    }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simüle edilmiş login işlemi
    setTimeout(() => {
      setIsLoading(false);
      alert(`Login başarılı! Email: ${formData.email}`);
    }, 2000);
  };

  const fillDemoData = (user) => {
    setFormData({
      email: user.email,
      password: user.password
    });
  };

  // Demo kullanıcı otomatik değişimi
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % demoUsers.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding & Demo Users */}
        <div className="text-white space-y-8 lg:pr-8">
          {/* Logo & Title */}
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-4">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 p-3 rounded-2xl shadow-lg">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold ml-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                GeoPoint
              </h1>
            </div>
            <p className="text-xl text-gray-200 mb-2">Coğrafi Veri Yönetim Sistemi</p>
            <p className="text-gray-300">Harita tabanlı nokta yönetimi ve analiz platformu</p>
          </div>

          {/* Demo Users Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
              <h3 className="text-lg font-semibold">Demo Kullanıcıları</h3>
            </div>
            
            <div className="space-y-3">
              {demoUsers.map((user, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    activeDemo === index 
                      ? 'border-cyan-400 bg-cyan-400/20 shadow-lg transform scale-105' 
                      : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                  }`}
                  onClick={() => fillDemoData(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{user.avatar}</span>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-300">{user.role}</p>
                      </div>
                    </div>
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                      Kullan →
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    <p>Email: {user.email}</p>
                    <p>Şifre: {user.password}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Hoş Geldiniz</h2>
            <p className="text-gray-300">Hesabınıza giriş yapın</p>
          </div>

          <div className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-300">
                <input type="checkbox" className="mr-2 rounded" />
                Beni hatırla
              </label>
              <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Şifremi unuttum?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
              } text-white`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Giriş yapılıyor...</span>
                </>
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-gray-300">
                Hesabınız yok mu?{' '}
                <a href="#" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Hemen kayıt olun
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default ModernLoginPage;
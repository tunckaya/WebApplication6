import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, MapPin, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState(0);
  const [error, setError] = useState('');

  // Demo kullanıcı bilgileri
  const demoUsers = [
    {
      id: 1,
      name: "Admin User",
      email: "admin@geopoint.com",
      password: "admin123",
      role: "Administrator",
      avatar: "👨‍💼"
    },
    {
      id: 2,
      name: "John Doe",
      email: "john.doe@example.com", 
      password: "user123",
      role: "Standard User",
      avatar: "👨‍🚀"
    },
    {
      id: 3,
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
    if (error) setError(''); // Hata mesajını temizle
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Boş alan kontrolü
    if (!formData.email || !formData.password) {
      setError('Lütfen email ve şifre alanlarını doldurun');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Demo kullanıcı kontrolü
      const user = demoUsers.find(u => 
        u.email.toLowerCase() === formData.email.toLowerCase() && 
        u.password === formData.password
      );

      // 1.5 saniye beklet (gerçek API simülasyonu)
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (user) {
        // Başarılı login
        console.log('Login başarılı:', user);
        if (onLogin && typeof onLogin === 'function') {
          onLogin(user);
        } else {
          // Eğer onLogin prop'u yoksa localStorage'a kaydet ve sayfayı yenile
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('user', JSON.stringify(user));
          window.location.href = '/dashboard';
        }
      } else {
        // Geçersiz bilgiler
        setError('Geçersiz email veya şifre! Demo kullanıcılardan birini deneyin.');
      }
    } catch (err) {
      setError('Giriş işlemi sırasında bir hata oluştu!');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoData = (user) => {
    console.log('Demo kullanıcı seçildi:', user);
    setFormData({
      email: user.email,
      password: user.password
    });
    setError('');
    
    // Görsel feedback
    setActiveDemo(demoUsers.findIndex(u => u.id === user.id));
  };

  // Demo kullanıcı otomatik değişimi
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % demoUsers.length);
    }, 4000); // 4 saniyede bir değiştir
    return () => clearInterval(interval);
  }, [demoUsers.length]);

  // Enter tuşu ile form submit
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="login-bg">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-elements floating-purple"></div>
        <div className="floating-elements floating-yellow"></div>
        <div className="floating-elements floating-pink"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid lg-grid-cols-2 gap-8 items-center p-4" style={{paddingTop: '2rem'}}>
        
        {/* Left Side - Branding & Demo Users */}
        <div className="text-white space-y-8 lg-pr-8">
          {/* Logo & Title */}
          <div className="text-center lg-text-left">
            <div className="flex items-center justify-center lg-justify-start mb-4">
              <div className="bg-gradient-to-r p-3 rounded-2xl shadow-lg" style={{background: 'linear-gradient(to right, #22d3ee, #3b82f6)'}}>
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold ml-3 gradient-text">
                GeoPoint
              </h1>
            </div>
            <p className="text-xl text-gray-200 mb-2">Coğrafi Veri Yönetim Sistemi</p>
            <p className="text-gray-300">Harita tabanlı nokta yönetimi ve analiz platformu</p>
          </div>

          {/* Demo Users Section */}
          <div className="glass-card p-6">
            <div className="flex items-center mb-4">
              <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
              <h3 className="text-lg font-semibold">Demo Kullanıcıları</h3>
            </div>
            
            <div className="space-y-3">
              {demoUsers.map((user, index) => (
                <div 
                  key={user.id}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    activeDemo === index 
                      ? 'border-cyan-400 bg-cyan-400-20 shadow-lg scale-105' 
                      : 'border-white-20 bg-white-5 hover:bg-white-10 hover:border-white-30'
                  }`}
                  onClick={() => fillDemoData(user)}
                  style={{
                    transform: activeDemo === index ? 'scale(1.05)' : 'scale(1)',
                    backgroundColor: activeDemo === index 
                      ? 'rgba(34, 211, 238, 0.2)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    borderColor: activeDemo === index 
                      ? '#22d3ee' 
                      : 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{user.avatar}</span>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-300">{user.role}</p>
                      </div>
                    </div>
                    <button 
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        fillDemoData(user);
                      }}
                    >
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
        <div className="glass-card p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Hoş Geldiniz</h2>
            <p className="text-gray-300">Hesabınıza giriş yapın</p>
          </div>

          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500-20 border border-red-500-50 rounded-xl p-3 text-red-200 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Success Tip */}
            {!error && (
              <div className="bg-cyan-400-20 border border-cyan-400 rounded-xl p-3 text-cyan-300 text-sm">
                💡 Demo kullanıcılardan birine tıklayarak hızlıca giriş yapabilirsiniz!
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 translate-y-neg-half text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-3 bg-white-20 border border-white-30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                  placeholder="email@example.com"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  }}
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
                <Lock className="absolute left-3 top-1/2 translate-y-neg-half text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-12 py-3 bg-white-20 border border-white-30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                  placeholder="••••••••"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 translate-y-neg-half text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-300 cursor-pointer">
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
                  ? 'bg-gray-600 cursor-not-allowed opacity-60'
                  : 'text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
              style={{
                background: isLoading 
                  ? '#4b5563' 
                  : 'linear-gradient(to right, #06b6d4, #2563eb)',
              }}
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
    </div>
  );
};

export default LoginPage;
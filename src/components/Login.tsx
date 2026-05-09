import React from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Ghost } from 'lucide-react';

const Login: React.FC = () => {
  const { loginWithGoogle, loginAsGuest, loading } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="pro-card p-10 bg-[#121216]/80 border-white/5 backdrop-blur-xl relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent rounded-[2rem] pointer-events-none" />
          
          <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-3 mb-8 text-center">
            <span className="text-blue-400 font-black text-xs uppercase tracking-[0.3em]">System Updated V2.5</span>
          </div>

          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-900/50 mx-auto mb-6 rotate-12"
            >
              <span className="text-4xl font-black text-white italic">S</span>
            </motion.div>
            
            <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">نظام سيد الظلال</h1>
            <p className="text-gray-500 text-sm font-medium">ابدأ رحلتك لتصبح أقوى صياد</p>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center gap-3 text-blue-400">
                <Ghost size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">إرشادات الدخول</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed italic">
                "بمجرد اتصالك بالنظام، سيتم تتبع كل تحركاتك وعاداتك لتحويلها إلى قوة خام. هل أنت مستعد للارتقاء؟"
              </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={loginWithGoogle}
                disabled={loading}
                className="w-full py-3.5 bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-white/10 active:scale-[0.98]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={20} />
                    تسجيل الدخول باستخدام جوجل
                  </>
                )}
              </button>
              
              <button 
                onClick={loginAsGuest}
                disabled={loading}
                className="w-full py-3.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/30 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg shadow-blue-900/10"
              >
                <Ghost size={16} />
                الدخول كضيف (وضع التجربة)
              </button>
            </div>
            
            <p className="text-[10px] text-center text-gray-600 uppercase tracking-widest font-bold">
              🔒 آمن بواسطة جوجل فيربيس
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <span className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.3em]">Shadow Sovereign System v2.5 (Cloud & Water)</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

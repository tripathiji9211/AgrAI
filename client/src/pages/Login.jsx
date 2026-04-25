import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate straight to dashboard if already logged in!
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate('/');
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setupRecaptcha();
      // Ensure phone number has country code. e.g. +91
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await confirmationResult.confirm(otp);
      navigate('/');
    } catch (err) {
      setError('Invalid verification code.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-900 to-black z-0 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card max-w-md w-full p-8 z-10 relative flex flex-col items-center"
      >
        <img src="/icons.svg" alt="AgrAI" className="w-16 h-16 mb-4 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        <h1 className="text-3xl font-bold text-white mb-2 tracking-wide font-outfit">AgrAI</h1>
        <p className="text-slate-400 mb-8 text-center text-sm font-inter">Sign in to access your intelligent farming dashboard and predictive agricultural alerts.</p>
        
        {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded-lg border border-red-500/30 w-full text-center">{error}</p>}

        {/* Google Authentication */}
        <button 
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 px-4 rounded-xl font-medium hover:bg-slate-200 transition-colors mb-6"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google" />
          Continue with Google
        </button>

        <div className="w-full flex items-center gap-4 mb-6">
          <div className="h-px bg-slate-700 flex-1"></div>
          <span className="text-slate-500 text-sm font-medium">OR LOGIN WITH PHONE</span>
          <div className="h-px bg-slate-700 flex-1"></div>
        </div>

        {/* Phone Authentication */}
        {!confirmationResult ? (
          <form className="w-full relative" onSubmit={handleSendOTP}>
            <input 
              type="tel"
              required
              placeholder="Mobile Number (e.g. 9876543210)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium mb-3"
            />
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-medium transition-colors">
              Send OTP
            </button>
            <div id="recaptcha-container"></div>
          </form>
        ) : (
          <form className="w-full" onSubmit={handleVerifyOTP}>
            <input 
              type="text"
              required
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 mb-3"
            />
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-medium transition-colors">
              Verify Code & Login
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Login;

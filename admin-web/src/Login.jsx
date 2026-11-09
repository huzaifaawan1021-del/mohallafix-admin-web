import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError('');
  //   try {
  //     const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  //     localStorage.setItem('adminToken', res.data.token);
  //     onLoginSuccess();
  //   } catch (err) {
  //     setError(err.response?.data?.message || 'Login failed. Invalid Admin Credentials.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const res = await axios.post(
      `${API_URL}/auth/login`,
      { email, password }
    );

    // Check whether the account is actually an admin
    if (res.data.user?.role !== 'admin') {
      setError('Access denied. Admin account required.');
      return;
    }

    // Save token only after admin verification
    localStorage.setItem('adminToken', res.data.token);
    onLoginSuccess();

  } catch (err) {
    setError(
      err.response?.data?.message ||
      'Login failed. Please check your credentials.'
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-[#04060c] via-[#080d1a] to-[#030509] font-['Inter',sans-serif] text-slate-100 select-none">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-md p-8 bg-slate-950/85 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-[0_0_50px_rgba(0,242,254,0.15)] relative overflow-hidden"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-[#00f2fe] to-blue-600 flex items-center justify-center font-black text-slate-950 text-2xl shadow-[0_0_25px_rgba(0,242,254,0.5)]">
            M
          </div>
          <h2 className="text-2xl font-black text-white font-['Orbitron',sans-serif]">MohallaFix Admin</h2>
          <p className="text-xs text-slate-400 mt-1 font-['JetBrains_Mono',monospace]">SECURE COMMAND CENTER ACCESS</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full bg-[#04060c] border border-slate-700/80 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 outline-none focus:border-[#00f2fe] transition-colors" 
                placeholder="admin@mohallafix.com" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-slate-500 z-10" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                autoComplete="current-password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-[#04060c] border border-slate-700/80 rounded-xl py-3 pl-11 pr-12 text-sm text-slate-200 outline-none focus:border-[#00f2fe] transition-colors" 
                placeholder="••••••••" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer z-20 p-1 outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            type="submit" 
            disabled={loading} 
            className="w-full py-3.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck size={18} />
            {loading ? 'Authenticating...' : 'Authenticate Access'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
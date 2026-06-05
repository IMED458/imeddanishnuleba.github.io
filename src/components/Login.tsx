import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Loader } from 'lucide-react';
import { defaultSettings, defaultUsers, getSettings, getUsers } from '../lib/firebaseData';
import { ClinicalUser } from '../types';

interface LoginProps {
  onLoginSuccess: (doctorInfo: { name: string; email: string; phone: string; user: ClinicalUser }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('giorgi');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('გთხოვთ შეიყვანოთ იუზერი და პაროლი');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let settings = defaultSettings;
      let users = defaultUsers;
      try {
        [settings, users] = await Promise.all([getSettings(), getUsers()]);
      } catch (err) {
        console.warn('Firebase login data is unavailable; checking against default clinical user.', err);
      }

      const normalizedUsername = username.trim().toLowerCase();
      const user = users.find((candidate) =>
        candidate.active &&
        candidate.username.trim().toLowerCase() === normalizedUsername &&
        candidate.password === password
      );

      if (user || (normalizedUsername === 'giorgi' && password === settings.doctorPasswordHash)) {
        const activeUser = user || defaultUsers[0];
        onLoginSuccess({
          name: `${activeUser.firstName} ${activeUser.lastName}`,
          email: activeUser.email,
          phone: activeUser.phone,
          user: activeUser
        });
      } else {
        setError('არასწორი იუზერი ან პაროლი!');
      }
    } catch (err) {
      console.error(err);
      setError('Firebase-თან კავშირი ვერ ხერხდება. გთხოვთ სცადოთ კვლავ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/60 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
        
        {/* LOGO Header */}
        <div className="text-center">
          <div className="mx-auto h-14 w-14 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-2xl mb-4 border border-emerald-100">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            კლინიკური პორტალი
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            ავტორიზაცია ექიმის სამუშაო სივრცეში
          </p>
        </div>

        {/* Info notice */}
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-500 text-center">
          პროგრამა შეიცავს პაციენტთა პერსონალურ სამედიცინო მონაცემებს. წვდომა დაცულია უსაფრთხოების სტანდარტებით.
        </div>

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2.5 rounded-lg font-medium text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-widest mb-1.5 gray-800">
              იუზერი
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="giorgi"
              className="w-full h-11 px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition text-center font-mono placeholder-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-widest mb-1.5 gray-800">
              პაროლი
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full h-11 px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition pr-10 text-center font-mono placeholder-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400 text-center">
              სტანდარტული იუზერი: <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono">giorgi</code> / პაროლი: <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono">giorgi591</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-emerald-600/10 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 disabled:bg-slate-300"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                მიმდინარეობს პირადობა...
              </>
            ) : (
              'სისტემაში შესვლა'
            )}
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-400">
          გვერდის ადმინისტრატორი: gimedashvili7@gmail.com
        </div>

      </div>
    </div>
  );
}

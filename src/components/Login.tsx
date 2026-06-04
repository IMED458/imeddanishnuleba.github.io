import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, Loader } from 'lucide-react';
import { defaultSettings, getSettings } from '../lib/firebaseData';

interface LoginProps {
  onLoginSuccess: (doctorInfo: { name: string; email: string; phone: string }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('გთხოვთ შეიყვანოთ პაროლი');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let settings = defaultSettings;
      try {
        settings = await getSettings();
      } catch (err) {
        console.warn('Firebase settings are unavailable; checking against default clinical settings.', err);
      }

      if (password === settings.doctorPasswordHash) {
        onLoginSuccess({
          name: settings.doctorName,
          email: settings.doctorEmail,
          phone: settings.doctorPhone
        });
      } else {
        setError('არასწორი კლინიკური პაროლი!');
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
            ავტორიზაცია ექიმი გიორგი იმედაშვილისთვის
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
              შეიყვანეთ პაროლი (Clinical Key)
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
              სტანდარტული პაროლი: <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono">giorgi591</code>
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

import React from 'react';
import { Leaf } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-deep-green text-white pt-20 pb-32 md:pb-12 relative overflow-hidden rounded-t-[4rem] md:rounded-t-[6rem] shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.3)]">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-accent-green rounded-xl shadow-lg">
                <Leaf className="w-8 h-8 text-deep-green" />
              </div>
              <span className="font-black text-3xl tracking-wide">Farmer Mitra</span>
            </div>
            <p className="text-white/70 leading-relaxed text-lg max-w-md">
              Empowering farmers with smart technology for healthier crops and better yields.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xl text-accent-green mb-8 uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-4 text-lg">
              <li><a href="#" className="text-white/70 hover:text-accent-green transition-all hover:translate-x-1 inline-block">About Us</a></li>
              <li><a href="#" className="text-white/70 hover:text-accent-green transition-all hover:translate-x-1 inline-block">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xl text-accent-green mb-8 uppercase tracking-widest">Contact Support</h4>
            <div className="space-y-4 text-lg text-white/70">
              <p className="hover:text-white transition-colors cursor-pointer">Email: support@farmermitra.com</p>
              <p className="hover:text-white transition-colors cursor-pointer">Phone: +91 12345 67890</p>
              <div className="pt-4 flex gap-4">
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 text-center text-sm text-white/40 font-medium tracking-widest uppercase">
          © {new Date().getFullYear()} Farmer Mitra. All rights reserved.
        </div>
      </div>
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-green/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
    </footer>
  );
}

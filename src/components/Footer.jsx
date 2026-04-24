import ScrollReveal from './ScrollReveal';

function Footer() {
  return (
    <footer className="relative bg-slate-950 border-t border-slate-800 py-20 overflow-hidden isolate">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/20 via-slate-950 to-slate-950 pointer-events-none"></div>

      {/* Floating Orbs */}
      <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[128px] animate-blob z-[-1]"></div>
      <div className="absolute -right-32 top-0 w-96 h-96 bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[128px] animate-blob animation-delay-2000 z-[-1]"></div>

      <ScrollReveal direction="up" delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto px-6 w-full relative z-10">
          <div className="col-span-1 md:col-span-1 border-r border-slate-800/50 pr-8">
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400 mb-6 font-headline tracking-tighter">HMS</div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">Redefining hostel management through modern architecture, intelligent tracking, and focused utility.</p>
            <div className="flex gap-4">
              <a className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:border-primary/50 transition-all hover:shadow-[0_0_20px_rgba(var(--color-primary),0.3)] hover:-translate-y-1" href="#">
                <span className="material-symbols-outlined text-sm" data-icon="share">share</span>
              </a>
              <a className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:border-primary/50 transition-all hover:shadow-[0_0_20px_rgba(var(--color-primary),0.3)] hover:-translate-y-1" href="#">
                <span className="material-symbols-outlined text-sm" data-icon="public">public</span>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-headline font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><a className="text-slate-400 hover:text-white transition-colors text-sm hover:translate-x-1 inline-block" href="/student/dashboard">Student Portal</a></li>
              <li><a className="text-slate-400 hover:text-white transition-colors text-sm hover:translate-x-1 inline-block" href="/admin/dashboard">Admin Dashboard</a></li>
              <li><a className="text-slate-400 hover:text-white transition-colors text-sm hover:translate-x-1 inline-block" href="#">Fee Structure</a></li>
              <li><a className="text-slate-400 hover:text-white transition-colors text-sm hover:translate-x-1 inline-block" href="#">Room Availability</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold text-white mb-6">Contact Info</h4>
            <ul className="space-y-4">
              <li className="text-slate-400 text-sm flex items-center gap-3 hover:text-white transition-colors group cursor-pointer">
                <span className="material-symbols-outlined text-[16px] text-primary group-hover:scale-110 transition-transform">mail</span>
                noreply.support.hms@gmail.com
              </li>
              <li className="text-slate-400 text-sm flex items-center gap-3 hover:text-white transition-colors group cursor-pointer">
                <span className="material-symbols-outlined text-[16px] text-primary group-hover:scale-110 transition-transform">call</span>
                +91 9238825025
              </li>
              <li className="text-slate-400 text-sm flex items-center gap-3 hover:text-white transition-colors group cursor-pointer">
                <span className="material-symbols-outlined text-[16px] text-primary group-hover:scale-110 transition-transform">location_on</span>
                Symbiosis University Of Applied Sciences, Indore , Madhya Pradesh
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold text-white mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a className="text-slate-400 hover:text-white transition-colors text-sm relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-primary hover:after:w-full after:transition-all after:duration-300" href="#">Privacy Policy</a></li>
              <li><a className="text-slate-400 hover:text-white transition-colors text-sm relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-primary hover:after:w-full after:transition-all after:duration-300" href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
          <p className="text-slate-500 text-xs tracking-wider">© 2026  HMS. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse"></span>
            <span className="w-2 h-2 rounded-full bg-cyan-400/50 animate-pulse animation-delay-200"></span>
            <span className="w-2 h-2 rounded-full bg-blue-500/50 animate-pulse animation-delay-400"></span>
          </div>
        </div>
      </ScrollReveal>
    </footer>
  );
}

export default Footer;

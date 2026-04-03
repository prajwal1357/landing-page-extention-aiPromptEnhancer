import React, { useRef } from 'react';
import { 
  Download, 
  Zap, 
  Cpu, 
  ShieldCheck, 
  ChevronRight, 
  ExternalLink,
  Sparkles,
  MousePointerClick,
  Play,
  HeartIcon
} from 'lucide-react';

/**
 * A lightweight, high-performance background component 
 * using CSS blurs instead of WebGL.
 */
const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden bg-slate-950 pointer-events-none">
    {/* Primary Glow */}
    <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" />
    
    {/* Secondary Glow */}
    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-pink-600/10 blur-[100px] animate-pulse [animation-delay:2s]" />
    
    {/* Moving Beam Effect */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent rotate-[-35deg] blur-sm" />
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:bg-white/[0.05] transition-all duration-300">
    <div className="w-12 h-12 flex items-center justify-center bg-indigo-500/10 rounded-2xl text-indigo-400 mb-6">
      <Icon size={24} />
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const App = () => {
  const videoRef = useRef(null);

  const steps = [
    { id: 1, title: "Download", text: "Grab the extension zip file." },
    { id: 2, title: "Dev Mode", text: "Enable developer mode in Chrome." },
    { id: 3, title: "Install", text: "Drag and drop to the extension page." },
    { id: 4, title: "Boost", text: "Start writing professional prompts." }
  ];

  const scrollToVideo = () => {
    videoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen text-slate-100 selection:bg-indigo-500/30 font-sans">
      <AnimatedBackground />

      {/* Content Wrapper */}
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        
        {/* Simple Nav */}
        <nav className="flex items-center justify-between py-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">PromptEnhancer</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="https://github.com/prajwal1357/prompt-enhancer-extension" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              Code <ExternalLink size={12} />
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-8">
            <Zap size={10} /> Fast & Lightweight
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Write Better Prompts <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">
              In One Click.
            </span>
          </h1>

          <h1 className='text-2xl'>The API key is stored in your browser so only u can access (No database storing)</h1>
          
          <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto mb-12 leading-relaxed">
            Stop guessing. Our extension uses Gemini to turn your simple thoughts 
            into structured, high-performing AI instructions instantly
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="../public/prompt-enhancer.zip" 
              download
              className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              <Download size={18} />
              Download Zip
            </a>
            <button 
              onClick={scrollToVideo}
              className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl transition-all flex items-center gap-2"
            >
              <Play size={16} />
              Watch Demo
            </button>
          </div>
        </section>

        {/* Video Showcase Section */}
        <section ref={videoRef} id="demo" className="mb-32 px-4">
  <div className="relative group max-w-4xl mx-auto p-[1px] rounded-[2rem] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20">
    
    <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 backdrop-blur-xl shadow-2xl">
      
      <span className="block text-center text-sm md:text-base text-slate-300 mb-4">
        After seeing and doing everything, go to ChatGPT, Gemini, or Claude and click <span className="text-white font-medium">✨ Enhance</span>
      </span>

      <div className="aspect-video w-full rounded-2xl overflow-hidden relative z-10 bg-black shadow-xl">
        <iframe 
          className="w-full h-full"
          src="https://www.youtube.com/embed/xiT8c8M1OIw"
          title="YouTube video player" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
      </div>

    </div>

    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 to-pink-500/30 blur-2xl opacity-40 group-hover:opacity-70 transition duration-700"></div>
  </div>

  <p className="text-center mt-6 text-slate-500 text-sm italic">
    See how the magic happens in real-time.
  </p>
</section>

        {/* Features Grid */}
        <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
          <FeatureCard 
            icon={Zap}
            title="Instant Results"
            desc="Refines your prompt in milliseconds using Gemini 1.5 Flash."
          />
          <FeatureCard 
            icon={Cpu}
            title="Universal"
            desc="Works on ChatGPT, Claude, Gemini, and most text areas."
          />
          <FeatureCard 
            icon={ShieldCheck}
            title="Secure"
            desc="Your data is never stored. Direct-to-model processing only."
          />
        </section>

        {/* Setup Section */}
        <section id="install" className="mb-32">
          <div className="p-8 md:p-12 rounded-[2.5rem] bg-indigo-600/5 border border-indigo-500/10 backdrop-blur-xl">
            <h2 className="text-3xl font-bold mb-12 text-center">30-Second Setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {steps.map((step) => (
                <div key={step.id} className="text-center md:text-left">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold mb-4 mx-auto md:mx-0">
                    {step.id}
                  </div>
                  <h4 className="font-bold mb-2 text-slate-200">{step.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Snarky CTA Box */}
        <section className="max-w-2xl mx-auto p-10 bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 rounded-3xl text-center mb-40">
           <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-full mb-6">
              <MousePointerClick size={24} />
           </div>
           <h3 className="text-2xl font-bold mb-4 italic">"This changed how YOU work."</h3>
           <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            just download not a big deal, everyone knows how your prompt sucks and you need help, it's free and it works, stop asking questions and just do it.
           </p>
           <button 
            onClick={scrollToVideo}
            className="flex items-center gap-2 mx-auto text-indigo-400 font-bold group"
           >
             Still confused? Watch the video <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </section>

        {/* Minimalist Footer */}
        <footer className="py-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 text-sm">

  {/* Left Section */}
  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
    <p className="font-medium tracking-wide">
      © {new Date().getFullYear()} PromptEnhancer
    </p>
    <span className="hidden md:inline text-slate-600">•</span>
    <p className="text-slate-500">No bloat. Just speed.</p>
  </div>

  {/* Center Section */}
  <div className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors">
    <span>Built with</span>
    <HeartIcon className="w-4 h-4 text-red-500 animate-pulse" />
    <span>by Banglorian</span>
  </div>

  {/* Right Section */}
  <div className="flex gap-6">
    <a href="#" className="hover:text-white transition-colors">
      Privacy
    </a>
    <a href="#" className="hover:text-white transition-colors">
      Terms
    </a>
    <a href="#" className="hover:text-white transition-colors">
      Contact
    </a>
  </div>

</footer>
      </div>

      <style>{`
        html { scroll-behavior: smooth; }
        body { background-color: #020617; }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }
        .animate-pulse {
          animation: pulse 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
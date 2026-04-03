import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { 
  Download, 
  PlayCircle, 
  Zap, 
  Cpu, 
  ShieldCheck, 
  ChevronRight, 
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';

/**
 * LightPillar Component
 * Creates a volumetric light effect using GLSL shaders and Three.js.
 * Fixed to ensure seamless blending and responsive resolution handling.
 */
const LightPillar = ({
  topColor = '#5227FF',
  bottomColor = '#FF9FFC',
  intensity = 1.0,
  rotationSpeed = 0.3,
  interactive = false,
  className = '',
  glowAmount = 0.005,
  pillarWidth = 3.0,
  pillarHeight = 0.4,
  noiseIntensity = 0.5,
  mixBlendMode = 'screen',
  pillarRotation = 0,
  quality = 'high'
}) => {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const rendererRef = useRef(null);
  const materialRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const geometryRef = useRef(null);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const timeRef = useRef(0);
  const rotationSpeedRef = useRef(rotationSpeed);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setWebGLSupported(false);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || !webGLSupported) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEndDevice = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

    let effectiveQuality = quality;
    if (isLowEndDevice && quality === 'high') effectiveQuality = 'medium';
    if (isMobile && quality !== 'low') effectiveQuality = 'low';

    const qualitySettings = {
      low: { iterations: 24, waveIterations: 1, pixelRatio: 0.5, precision: 'mediump', stepMultiplier: 1.5 },
      medium: { iterations: 40, waveIterations: 2, pixelRatio: 0.75, precision: 'mediump', stepMultiplier: 1.2 },
      high: {
        iterations: 80,
        waveIterations: 4,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        precision: 'highp',
        stepMultiplier: 1.0
      }
    };

    const settings = qualitySettings[effectiveQuality] || qualitySettings.medium;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
        precision: settings.precision,
        stencil: false,
        depth: false
      });
    } catch (error) {
      setWebGLSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(settings.pixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const parseColor = hex => {
      const color = new THREE.Color(hex);
      return new THREE.Vector3(color.r, color.g, color.b);
    };

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision ${settings.precision} float;

      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform vec3 uTopColor;
      uniform vec3 uBottomColor;
      uniform float uIntensity;
      uniform bool uInteractive;
      uniform float uGlowAmount;
      uniform float uPillarWidth;
      uniform float uPillarHeight;
      uniform float uNoiseIntensity;
      uniform float uRotCos;
      uniform float uRotSin;
      uniform float uPillarRotCos;
      uniform float uPillarRotSin;
      uniform float uWaveSin;
      uniform float uWaveCos;
      varying vec2 vUv;

      const float STEP_MULT = ${settings.stepMultiplier.toFixed(1)};
      const int MAX_ITER = ${settings.iterations};
      const int WAVE_ITER = ${settings.waveIterations};

      void main() {
        // Correct aspect ratio handling to prevent distortion and seams
        vec2 uv = (vUv * 2.0 - 1.0);
        uv.x *= uResolution.x / uResolution.y;
        
        // Pillar Rotation Logic
        uv = vec2(uPillarRotCos * uv.x - uPillarRotSin * uv.y, uPillarRotSin * uv.x + uPillarRotCos * uv.y);

        vec3 ro = vec3(0.0, 0.0, -10.0);
        vec3 rd = normalize(vec3(uv, 1.0));

        float rotC = uRotCos;
        float rotS = uRotSin;
        if(uInteractive) {
          float a = uMouse.x * 0.5;
          rotC = cos(a);
          rotS = sin(a);
        }

        vec3 col = vec3(0.0);
        float t = 0.1;
        
        for(int i = 0; i < MAX_ITER; i++) {
          vec3 p = ro + rd * t;
          p.xz = vec2(rotC * p.x - rotS * p.z, rotS * p.x + rotC * p.z);

          vec3 q = p;
          q.y = p.y * uPillarHeight + uTime;
          
          float freq = 1.0;
          float amp = 1.0;
          for(int j = 0; j < WAVE_ITER; j++) {
            q.xz = vec2(uWaveCos * q.x - uWaveSin * q.z, uWaveSin * q.x + uWaveCos * q.z);
            q += cos(q.zxy * freq - uTime * float(j) * 0.5) * amp;
            freq *= 1.8;
            amp *= 0.5;
          }
          
          float d = length(cos(q.xz)) - 0.2;
          float bound = length(p.xz) - uPillarWidth;
          float k = 4.0;
          float h = max(k - abs(d - bound), 0.0);
          d = max(d, bound) + h * h * 0.0625 / k;
          d = abs(d) * 0.15 + 0.01;

          float grad = clamp((10.0 - p.y) / 20.0, 0.0, 1.0);
          col += mix(uBottomColor, uTopColor, grad) / d;

          t += d * STEP_MULT;
          if(t > 40.0) break;
        }

        float widthNorm = uPillarWidth / 3.0;
        col = tanh(col * uGlowAmount / widthNorm);
        
        // Dithering to prevent banding
        col -= fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) / 20.0 * uNoiseIntensity;
        
        gl_FragColor = vec4(col * uIntensity, 1.0);
      }
    `;

    const pillarRotRad = (pillarRotation * Math.PI) / 180;
    const waveSin = Math.sin(0.4);
    const waveCos = Math.cos(0.4);

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uMouse: { value: mouseRef.current },
        uTopColor: { value: parseColor(topColor) },
        uBottomColor: { value: parseColor(bottomColor) },
        uIntensity: { value: intensity },
        uInteractive: { value: interactive },
        uGlowAmount: { value: glowAmount },
        uPillarWidth: { value: pillarWidth },
        uPillarHeight: { value: pillarHeight },
        uNoiseIntensity: { value: noiseIntensity },
        uRotCos: { value: 1.0 },
        uRotSin: { value: 0.0 },
        uPillarRotCos: { value: Math.cos(pillarRotRad) },
        uPillarRotSin: { value: Math.sin(pillarRotRad) },
        uWaveSin: { value: waveSin },
        uWaveCos: { value: waveCos }
      },
      transparent: true,
      depthWrite: false,
      depthTest: false
    });
    materialRef.current = material;

    const geometry = new THREE.PlaneGeometry(2, 2);
    geometryRef.current = geometry;
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const handleMouseMove = event => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      mouseRef.current.set(x, y);
    };

    if (interactive) {
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    let lastTime = performance.now();
    const animate = currentTime => {
      if (!materialRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
      
      timeRef.current += 0.016 * rotationSpeedRef.current;
      const t = timeRef.current;
      materialRef.current.uniforms.uTime.value = t;
      materialRef.current.uniforms.uRotCos.value = Math.cos(t * 0.2);
      materialRef.current.uniforms.uRotSin.value = Math.sin(t * 0.2);
      rendererRef.current.render(sceneRef.current, cameraRef.current);

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!rendererRef.current || !materialRef.current || !containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      rendererRef.current.setSize(newWidth, newHeight);
      materialRef.current.uniforms.uResolution.value.set(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) container.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (container.contains(rendererRef.current.domElement)) container.removeChild(rendererRef.current.domElement);
      }
      if (materialRef.current) materialRef.current.dispose();
      if (geometryRef.current) geometryRef.current.dispose();
    };
  }, [webGLSupported, quality]);

  // Handle prop updates for uniforms
  useEffect(() => { rotationSpeedRef.current = rotationSpeed; }, [rotationSpeed]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uTopColor.value = new THREE.Color(topColor); }, [topColor]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uBottomColor.value = new THREE.Color(bottomColor); }, [bottomColor]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uIntensity.value = intensity; }, [intensity]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uInteractive.value = interactive; }, [interactive]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uGlowAmount.value = glowAmount; }, [glowAmount]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uPillarWidth.value = pillarWidth; }, [pillarWidth]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uPillarHeight.value = pillarHeight; }, [pillarHeight]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uNoiseIntensity.value = noiseIntensity; }, [noiseIntensity]);
  useEffect(() => {
    if (materialRef.current) {
      const rad = (pillarRotation * Math.PI) / 180;
      materialRef.current.uniforms.uPillarRotCos.value = Math.cos(rad);
      materialRef.current.uniforms.uPillarRotSin.value = Math.sin(rad);
    }
  }, [pillarRotation]);

  if (!webGLSupported) {
    return <div className={`w-full h-full absolute top-0 left-0 bg-slate-950 ${className}`} />;
  }

  return (
    <div ref={containerRef} className={`w-full h-full absolute top-0 left-0 pointer-events-none ${className}`} style={{ mixBlendMode }} />
  );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="group p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md hover:bg-white/[0.07] transition-all hover:-translate-y-1">
    <div className="w-12 h-12 flex items-center justify-center bg-indigo-500/10 rounded-2xl text-indigo-400 mb-6 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const App = () => {
  const steps = [
    { id: 1, title: "Download", text: "Get the extension package securely from our servers." },
    { id: 2, title: "Developer Mode", text: "Enable developer mode in your browser's extensions dashboard." },
    { id: 3, title: "Drag & Drop", text: "Simply drag the .zip file into your extensions tab to install." },
    { id: 4, title: "Ready", text: "Look for the magic sparkle icon next to your AI chat inputs." }
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">
      
      {/* Seamless Multi-Layer Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <LightPillar 
          topColor="#6366f1"
          bottomColor="#ec4899"
          intensity={0.7}
          pillarWidth={6.0}
          pillarHeight={0.2}
          pillarRotation={20}
          glowAmount={0.007}
        />
        <LightPillar 
          topColor="#3b82f6"
          bottomColor="#a855f7"
          intensity={0.4}
          pillarWidth={4.0}
          pillarHeight={0.4}
          pillarRotation={-30}
          glowAmount={0.005}
          className="opacity-60"
        />
      </div>

      {/* Main UI Overlay */}
      <div className="relative z-10">
        
        {/* Navbar */}
        <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">PromptEnhancer</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#install" className="hover:text-white transition-colors">Setup</a>
            <a href="https://github.com" className="flex items-center gap-2 hover:text-white transition-colors">
              GitHub <ExternalLink size={14} />
            </a>
          </div>
        </nav>

        {/* Hero */}
        <section className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-32">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold uppercase tracking-widest text-indigo-400 mb-8 backdrop-blur-md">
            <Zap size={14} className="animate-pulse" /> Now Powered by Gemini 1.5 Flash
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1] mb-8">
            The Smart Way to<br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-pink-500 to-indigo-400 animate-gradient-x">
              Prompt Smarter.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Stop struggling with poorly phrased queries. Our extension automatically refines 
            your instructions for peak AI performance with just one click.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <a 
              href="/prompt-enhancer.zip" 
              download
              className="group flex items-center gap-3 px-8 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:shadow-[0_0_60px_rgba(79,70,229,0.5)] active:scale-95"
            >
              <Download size={20} />
              Download Extension
              <span className="ml-2 px-2 py-0.5 text-[10px] bg-white/20 rounded uppercase">v1.0</span>
            </a>
            
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-6xl mx-auto px-6 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Zap}
              title="Instant Polish"
              desc="Transform simple notes into comprehensive frameworks using proven prompt engineering techniques."
            />
            <FeatureCard 
              icon={Cpu}
              title="Native Integration"
              desc="Seamlessly injects into ChatGPT, Claude, and Gemini interfaces without breaking your workflow."
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Privacy First"
              desc="All processing happens via secure API calls. We never store your personal data or chat history."
            />
          </div>
        </section>

        {/* Setup */}
        <section id="install" className="max-w-5xl mx-auto px-6 mb-40">
          <div className="relative bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 md:p-20 overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
              <Download size={200} />
            </div>

            <h2 className="text-4xl font-black mb-16 text-center md:text-left">Getting Started</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-10">
                {steps.map((step) => (
                  <div key={step.id} className="flex gap-6 items-start group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-black text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                      {step.id}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col justify-center items-center bg-slate-900/50 rounded-3xl border border-white/5 p-8 text-center">
                 <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
                    <Sparkles size={32} />
                 </div>
                 <h3 className="text-xl font-bold mb-4 italic">"This changed how YOU work."</h3>
                 <p className="text-slate-400 text-sm mb-8 max-w-xs">
                  just download not a big deal, everyone knows how your prompt sucks and you need help, it's free and it works, stop asking questions and just do it.
                 </p>
                 <button className="flex items-center gap-2 text-indigo-400 font-bold hover:gap-4 transition-all group">
                    F*ck off <ChevronRight size={18} />
                 </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-6 py-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-500 text-sm">
          <div className="flex items-center gap-3">
             <Sparkles size={18} className="text-indigo-500" />
             <span className="font-bold text-slate-300">PromptEnhancer</span>
          </div>
          <div className="flex items-center gap-10">
             <a href="#" className="hover:text-white transition-colors">Privacy</a>
             <a href="#" className="hover:text-white transition-colors">Legal</a>
             <a href="#" className="hover:text-white transition-colors">Docs</a>
          </div>
          <p>© {new Date().getFullYear()} PromptEnhancer. All rights reserved.</p>
        </footer>
      </div>

      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
        body::-webkit-scrollbar { width: 8px; }
        body::-webkit-scrollbar-track { background: #020617; }
        body::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
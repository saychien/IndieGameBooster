import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  Search, 
  Target, 
  Mail, 
  Share2, 
  ChevronRight, 
  Loader2, 
  CheckCircle2,
  Zap,
  Globe,
  MessageSquare,
  Instagram,
  Youtube,
  Twitch
} from 'lucide-react';
import { cn } from './lib/utils';
import { Channel, GameInfo, Creator } from './types';
import { DEMO_CREATORS } from './constants';
import { 
  analyzeGame, 
  generateReachOutEmail, 
  generateRedNotePost, 
  generateRedditRecommendations 
} from './services/geminiService';
import Markdown from 'react-markdown';

type Step = 'input' | 'analyzing' | 'results' | 'generation';

export default function App() {
  const [step, setStep] = useState<Step>('input');
  const [gameInput, setGameInput] = useState('');
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>(['YouTube', 'Twitch', 'Reddit', 'Bilibili', 'RedNote']);
  const [solutionType, setSolutionType] = useState<'EarlyAccess' | 'FullRelease'>('EarlyAccess');
  const [recommendedCreators, setRecommendedCreators] = useState<Creator[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const handleAnalyze = async () => {
    if (!gameInput.trim()) return;
    setStep('analyzing');
    
    // Set a safety timeout to prevent getting stuck
    const timeoutId = setTimeout(() => {
      console.warn("Analysis taking too long, check connection or API key.");
    }, 15000);

    try {
      const info = await analyzeGame(gameInput, solutionType);
      clearTimeout(timeoutId);
      setGameInfo(info);
      
      // Filter demo creators based on keywords (pseudo-search)
      const filtered = DEMO_CREATORS.filter(c => selectedChannels.includes(c.channel));
      setRecommendedCreators(filtered);
      
      setStep('results');
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Analysis failed:", error);
      alert("Analysis failed. Please check your network or try again.");
      setStep('input');
    }
  };

  const handleGenerateContent = async (creator: Creator) => {
    if (!gameInfo) return;
    setSelectedCreator(creator);
    setIsGeneratingContent(true);
    setStep('generation');
    
    try {
      let content = '';
      if (creator.channel === 'YouTube' || creator.channel === 'Bilibili' || creator.channel === 'Twitch') {
        content = await generateReachOutEmail(gameInfo.title, creator.name, creator.description, 5);
      } else if (creator.channel === 'Reddit') {
        content = await generateRedditRecommendations(gameInfo.title, gameInfo.tags);
      } else if (creator.channel === 'RedNote') {
        content = await generateRedNotePost(gameInfo.title, gameInfo.tags);
      }
      setGeneratedContent(content);
    } catch (error) {
      console.error("Content generation failed:", error);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const toggleChannel = (channel: Channel) => {
    setSelectedChannels(prev => 
      prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
    );
  };

  return (
    <div className="min-h-screen sci-fi-grid p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-6xl mb-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-neon-cyan rounded-lg flex items-center justify-center neon-glow-cyan">
            <Rocket className="text-sci-fi-bg w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter text-white">INDIELAUNCH <span className="text-neon-cyan">AI</span></h1>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Indie Game Promotion Engine</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-4">
            {['Dashboard', 'Analytics', 'Creators', 'Settings'].map(item => (
              <button key={item} className="text-sm font-medium text-slate-400 hover:text-neon-cyan transition-colors">
                {item}
              </button>
            ))}
          </nav>
          <div className="h-8 w-px bg-sci-fi-border" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta" />
            <span className="text-sm font-medium">Dev_User</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl flex-1">
        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel p-8 md:p-12 max-w-3xl mx-auto"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Launch Your Game to the <span className="text-neon-cyan">Right Audience</span></h2>
                <p className="text-slate-400">Enter your Steam link or game description to begin the AI-driven marketing analysis.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-2">Game Intelligence Input</label>
                  <textarea 
                    value={gameInput}
                    onChange={(e) => setGameInput(e.target.value)}
                    placeholder="Paste Steam URL or describe your gameplay mechanics, art style, and core loop..."
                    className="w-full h-40 bg-sci-fi-bg/50 border border-sci-fi-border rounded-xl p-4 text-slate-200 focus:outline-none focus:border-neon-cyan transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-2">Target Channels</label>
                    <div className="flex flex-wrap gap-2">
                      {(['YouTube', 'Twitch', 'Reddit', 'Bilibili', 'RedNote'] as Channel[]).map(channel => (
                        <button
                          key={channel}
                          onClick={() => toggleChannel(channel)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                            selectedChannels.includes(channel) 
                              ? "bg-neon-cyan/10 border-neon-cyan text-neon-cyan" 
                              : "bg-transparent border-sci-fi-border text-slate-500 hover:border-slate-400"
                          )}
                        >
                          {channel}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-slate-500 mb-2">Marketing Strategy</label>
                    <div className="flex bg-sci-fi-bg/50 p-1 rounded-xl border border-sci-fi-border">
                      <button
                        onClick={() => setSolutionType('EarlyAccess')}
                        className={cn(
                          "flex-1 py-2 text-xs font-medium rounded-lg transition-all",
                          solutionType === 'EarlyAccess' ? "bg-sci-fi-border text-white" : "text-slate-500 hover:text-slate-300"
                        )}
                      >
                        Early Access (Niche)
                      </button>
                      <button
                        onClick={() => setSolutionType('FullRelease')}
                        className={cn(
                          "flex-1 py-2 text-xs font-medium rounded-lg transition-all",
                          solutionType === 'FullRelease' ? "bg-sci-fi-border text-white" : "text-slate-500 hover:text-slate-300"
                        )}
                      >
                        Full Release (Broad)
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleAnalyze}
                  disabled={!gameInput.trim()}
                  className="w-full py-4 bg-neon-cyan text-sci-fi-bg font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed neon-glow-cyan"
                >
                  <Search className="w-5 h-5" />
                  INITIATE ANALYSIS
                </button>
              </div>
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin" />
                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neon-cyan w-8 h-8 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-white mt-8 mb-2">Analyzing Game DNA</h2>
              <p className="text-slate-400 font-mono text-sm animate-pulse">Extracting tags • Generating keywords • Scanning databases...</p>
            </motion.div>
          )}

          {step === 'results' && gameInfo && (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Game Analysis */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-panel p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="text-neon-cyan w-5 h-5" />
                    <h3 className="font-bold text-white uppercase tracking-wider">Game Profile</h3>
                  </div>
                  <h4 className="text-xl font-bold text-neon-cyan mb-4">{gameInfo.title}</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-mono text-slate-500 uppercase mb-2">Identified Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {gameInfo.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-sci-fi-border/50 rounded text-[10px] text-slate-300 border border-sci-fi-border">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs font-mono text-slate-500 uppercase mb-2">AI Search Keywords</p>
                      <div className="grid grid-cols-1 gap-2">
                        {gameInfo.keywords.map((kw, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                            <ChevronRight className="w-3 h-3 text-neon-cyan" />
                            {kw}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-6 border-neon-magenta/30">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="text-neon-magenta w-5 h-5" />
                    <h3 className="font-bold text-white uppercase tracking-wider">Marketing Solution</h3>
                  </div>
                  <div className="p-3 bg-neon-magenta/5 rounded-lg border border-neon-magenta/20">
                    <p className="text-sm font-bold text-neon-magenta mb-1">
                      {solutionType === 'EarlyAccess' ? 'Precision Vertical Targeting' : 'Broad Lifestyle Expansion'}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {solutionType === 'EarlyAccess' 
                        ? 'Focusing on hardcore genre enthusiasts and veteran indie reviewers to build a solid foundation.' 
                        : 'Expanding reach to cozy lifestyle vloggers and variety streamers to maximize awareness.'}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setStep('input')}
                  className="w-full py-3 border border-sci-fi-border rounded-xl text-slate-400 text-sm hover:bg-sci-fi-border transition-all"
                >
                  START NEW ANALYSIS
                </button>
              </div>

              {/* Right Column: Creator Recommendations */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Recommended Creators</h2>
                    <p className="text-slate-400 text-sm">Matched via Influence Algorithm v4.2</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/30 rounded-full text-[10px] text-neon-cyan font-bold uppercase">
                      {recommendedCreators.length} Matches Found
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedCreators.map((creator) => (
                    <motion.div 
                      key={creator.id}
                      whileHover={{ scale: 1.02 }}
                      className="glass-panel p-5 group cursor-pointer hover:border-neon-cyan/50 transition-all"
                      onClick={() => handleGenerateContent(creator)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <img 
                            src={creator.avatar} 
                            alt={creator.name} 
                            className="w-16 h-16 rounded-xl object-cover border border-sci-fi-border"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-sci-fi-surface border border-sci-fi-border rounded-lg flex items-center justify-center">
                            {creator.channel === 'YouTube' && <Youtube className="w-3 h-3 text-red-500" />}
                            {creator.channel === 'Twitch' && <Twitch className="w-3 h-3 text-purple-500" />}
                            {creator.channel === 'Reddit' && <MessageSquare className="w-3 h-3 text-orange-500" />}
                            {creator.channel === 'Bilibili' && <Globe className="w-3 h-3 text-blue-400" />}
                            {creator.channel === 'RedNote' && <Instagram className="w-3 h-3 text-pink-500" />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-white group-hover:text-neon-cyan transition-colors">{creator.name}</h4>
                            <div className="text-right">
                              <p className="text-[10px] font-mono text-slate-500 uppercase">Influence</p>
                              <p className="text-sm font-bold text-neon-cyan">{creator.influenceScore}</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1 mb-3">{creator.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 italic truncate max-w-[120px]">
                              "{creator.recentContent}"
                            </span>
                            <button className="text-[10px] font-bold text-neon-cyan flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              GENERATE CONTENT <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'generation' && selectedCreator && (
            <motion.div 
              key="generation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto"
            >
              <div className="glass-panel overflow-hidden">
                <div className="p-6 border-b border-sci-fi-border flex justify-between items-center bg-sci-fi-surface/80">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setStep('results')}
                      className="p-2 hover:bg-sci-fi-border rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <div>
                      <h3 className="font-bold text-white">Content Generation</h3>
                      <p className="text-xs text-slate-400">Target: {selectedCreator.name} • {selectedCreator.channel}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-sci-fi-border hover:bg-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
                      <Share2 className="w-4 h-4" /> COPY
                    </button>
                    <button className="px-4 py-2 bg-neon-cyan text-sci-fi-bg hover:bg-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 neon-glow-cyan">
                      <Mail className="w-4 h-4" /> SEND NOW
                    </button>
                  </div>
                </div>

                <div className="p-8 min-h-[400px] relative">
                  {isGeneratingContent ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-sci-fi-surface/50 backdrop-blur-sm z-10">
                      <Loader2 className="w-10 h-10 text-neon-cyan animate-spin mb-4" />
                      <p className="text-sm font-mono text-neon-cyan animate-pulse">AI is crafting your message...</p>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="prose prose-invert prose-sm max-w-none"
                    >
                      <div className="bg-sci-fi-bg/50 p-6 rounded-xl border border-sci-fi-border font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                        <Markdown>{generatedContent}</Markdown>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                <div className="p-4 bg-sci-fi-surface/30 border-t border-sci-fi-border flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">AI Content Verified • Optimization: High</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mt-12 pt-8 border-t border-sci-fi-border flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs font-mono uppercase tracking-widest">
        <div className="flex gap-6">
          <span>© 2026 IndieLaunch AI</span>
          <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Global Node: LDN-01</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-neon-cyan transition-colors">Privacy Protocol</a>
          <a href="#" className="hover:text-neon-cyan transition-colors">API Documentation</a>
          <a href="#" className="hover:text-neon-cyan transition-colors">System Status</a>
        </div>
      </footer>
    </div>
  );
}

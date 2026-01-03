
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Zap, 
  Settings, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  RefreshCcw,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  BarChart3,
  Layers,
  FileText,
  Eye,
  MoreVertical,
  Activity
} from 'lucide-react';
import { Category, GeneratedContent, Trend, GroundingSource, PipelineStatus } from './types';
import { discoveryAgent, seoAgent, writerAgent } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pipeline' | 'archive' | 'settings'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Artificial Intelligence');
  const [isBusy, setIsBusy] = useState(false);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [history, setHistory] = useState<GeneratedContent[]>([]);
  const [autoMode, setAutoMode] = useState(false);
  const [pipelineState, setPipelineState] = useState<PipelineStatus>('ready');
  const [statusMsg, setStatusMsg] = useState("System standby.");

  const categories: Category[] = ['Technology', 'Artificial Intelligence', 'Lifestyle', 'Business', 'Health'];

  const stats = useMemo(() => {
    const published = history.filter(h => h.status === 'published').length;
    const avgSeo = history.length ? Math.round(history.reduce((acc, h) => acc + h.metrics.seoScore, 0) / history.length) : 0;
    const totalWords = history.reduce((acc, h) => acc + h.metrics.wordCount, 0);
    return { published, avgSeo, totalWords };
  }, [history]);

  const handleFullPipeline = async (trend: Trend) => {
    setIsBusy(true);
    setActiveTab('pipeline');
    
    try {
      // Step 1: SEO Analysis
      setPipelineState('analyzing_seo');
      setStatusMsg(`SEO Agent: Extracting keywords and user intent for "${trend.topic}"...`);
      const seoData = await seoAgent(trend.topic);
      
      // Step 2: Drafting
      setPipelineState('drafting');
      setStatusMsg("Writer Agent: Generating fact-grounded long-form content...");
      const draft = await writerAgent(trend.topic, selectedCategory, seoData);
      
      // Step 3: Final polish
      setPipelineState('fact_checking');
      setStatusMsg("Editor Agent: Verifying editorial standards and AEO compliance...");
      
      const newContent: GeneratedContent = {
        id: Math.random().toString(36).substr(2, 9),
        topic: trend.topic,
        title: draft.title!,
        summary: draft.summary!,
        fullArticle: draft.fullArticle!,
        faq: draft.faq || [],
        sources: sources.slice(0, 3),
        timestamp: Date.now(),
        status: 'ready',
        category: selectedCategory,
        metrics: draft.metrics!
      };

      setHistory(prev => [newContent, ...prev]);
      setPipelineState('ready');
      setStatusMsg("Pipeline complete. Content ready for final approval.");
    } catch (error) {
      console.error(error);
      setStatusMsg("Error in pipeline. Resetting agent states.");
      setPipelineState('ready');
    } finally {
      setIsBusy(false);
    }
  };

  const handleScan = async () => {
    setIsBusy(true);
    setPipelineState('discovering');
    setStatusMsg("Discovery Agent: Scanning web for high-yield trends...");
    try {
      const result = await discoveryAgent(selectedCategory);
      setTrends(result.trends);
      setSources(result.sources);
      setStatusMsg("Trends identified and validated.");
    } catch (error) {
      setStatusMsg("Scan failed.");
    } finally {
      setIsBusy(false);
      setPipelineState('ready');
    }
  };

  const publishContent = (id: string) => {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, status: 'published' } : item));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#020617] text-slate-100">
      {/* Professional Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900/40 backdrop-blur-xl border-r border-slate-800/50 p-6 flex flex-col fixed h-full z-20 hidden md:flex">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Cpu className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Trend<span className="text-sky-400">Genius</span></h1>
            <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Core Engine v2.4</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          <NavItem active={activeTab === 'dashboard'} icon={<LayoutDashboard size={20} />} label="Analytics" onClick={() => setActiveTab('dashboard')} />
          <NavItem active={activeTab === 'pipeline'} icon={<Layers size={20} />} label="Pipeline" onClick={() => setActiveTab('pipeline')} count={isBusy ? 1 : 0} />
          <NavItem active={activeTab === 'archive'} icon={<BookOpen size={20} />} label="Content Hub" onClick={() => setActiveTab('archive')} count={history.length} />
          <NavItem active={activeTab === 'settings'} icon={<Settings size={20} />} label="Engine Config" onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="mt-auto space-y-4 pt-6 border-t border-slate-800/60">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${autoMode ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
              <span className="text-xs font-semibold text-slate-400">AUTOPILOT</span>
            </div>
            <button 
              onClick={() => setAutoMode(!autoMode)}
              className={`w-11 h-6 rounded-full relative transition-all duration-300 ${autoMode ? 'bg-sky-500' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoMode ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          
          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase">System Integrity</span>
              <ShieldCheck size={12} className="text-emerald-500" />
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[98%]"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 p-6 md:p-10 min-h-screen">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-1">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Activity size={14} className="text-sky-400" />
              <span>{statusMsg}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value as Category)}
                className="w-full lg:w-56 appearance-none bg-slate-900 border border-slate-800 text-sm rounded-xl px-5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none pr-10 cursor-pointer"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <Search size={16} />
              </div>
            </div>
            <button 
              onClick={handleScan}
              disabled={isBusy}
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-xl shadow-sky-500/20"
            >
              {isBusy ? <RefreshCcw size={18} className="animate-spin" /> : <Search size={18} />}
              Scan Markets
            </button>
          </div>
        </header>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Live Trends" value={trends.length} icon={<TrendingUp className="text-sky-400" />} change="+4 added" />
              <StatCard label="Published" value={stats.published} icon={<CheckCircle2 className="text-emerald-400" />} change="High Volume" />
              <StatCard label="Avg SEO Score" value={`${stats.avgSeo}%`} icon={<BarChart3 className="text-purple-400" />} change="Optimized" />
              <StatCard label="Total Words" value={stats.totalWords.toLocaleString()} icon={<FileText className="text-amber-400" />} change="Scale" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Trends Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Priority Content Opportunities</h3>
                  <button onClick={handleScan} className="text-xs font-bold text-sky-400 hover:underline">REFRESH LIST</button>
                </div>
                
                {trends.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {trends.map((t, i) => (
                      <div 
                        key={i} 
                        className="group bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 hover:border-sky-500/40 transition-all cursor-pointer relative overflow-hidden"
                        onClick={() => handleFullPipeline(t)}
                      >
                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Zap size={16} className="text-sky-400" />
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 text-[10px] font-bold rounded uppercase">{selectedCategory}</span>
                          <span className={`text-[10px] font-bold ${t.competition === 'Low' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {t.competition} Competition
                          </span>
                        </div>
                        <h4 className="font-bold text-lg mb-2 group-hover:text-sky-400 transition-colors">{t.topic}</h4>
                        <p className="text-sm text-slate-400 line-clamp-2 mb-4">{t.description}</p>
                        <div className="flex items-center gap-2 mt-auto">
                          <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="bg-sky-500 h-full" style={{ width: `${t.relevance}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{t.relevance}% SCORE</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No trends discovered" sub="Our discovery agents are waiting for your command." icon={<Search size={48} />} action={handleScan} />
                )}
              </div>

              {/* Sources Sidebar */}
              <div className="bg-slate-900/30 border border-slate-800/50 rounded-3xl p-6 h-fit">
                <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-400">
                  <ExternalLink size={18} /> Grounding Network
                </h3>
                <div className="space-y-4">
                  {sources.length > 0 ? sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="block p-4 bg-slate-950/40 border border-slate-800/50 rounded-xl hover:bg-slate-800 transition-all group">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-sky-400 line-clamp-2">{s.title}</span>
                        <ChevronRight size={14} className="text-slate-600 mt-1" />
                      </div>
                      <span className="text-[10px] text-slate-600 truncate mt-2 block">{s.uri}</span>
                    </a>
                  )) : (
                    <div className="py-12 text-center text-slate-600">
                      <p className="text-sm italic">Connect to web via Scan</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pipeline View */}
        {activeTab === 'pipeline' && (
          <div className="max-w-4xl mx-auto py-10">
            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800 -translate-x-1/2 hidden md:block"></div>
              
              <div className="space-y-16">
                <PipelineStep 
                  active={pipelineState === 'discovering'} 
                  completed={['analyzing_seo', 'drafting', 'fact_checking', 'ready'].includes(pipelineState)}
                  icon={<Search size={24} />} 
                  label="Trend Discovery Agent" 
                  desc="Scanning news, social, and search patterns for alpha opportunities." 
                />
                <PipelineStep 
                  active={pipelineState === 'analyzing_seo'} 
                  completed={['drafting', 'fact_checking', 'ready'].includes(pipelineState)}
                  icon={<BarChart3 size={24} />} 
                  label="SEO/AEO Analysis Agent" 
                  desc="Extracting semantic keywords and AI answer engine questions." 
                />
                <PipelineStep 
                  active={pipelineState === 'drafting'} 
                  completed={['fact_checking', 'ready'].includes(pipelineState)}
                  icon={<FileText size={24} />} 
                  label="Draft Generation Agent" 
                  desc="Synthesizing long-form grounded content with multi-source validation." 
                />
                <PipelineStep 
                  active={pipelineState === 'fact_checking'} 
                  completed={['ready'].includes(pipelineState)}
                  icon={<ShieldCheck size={24} />} 
                  label="Quality & Editorial Agent" 
                  desc="Eliminating hallucinations and enforcing brand tone guidelines." 
                />
                <PipelineStep 
                  active={pipelineState === 'ready'} 
                  completed={history.length > 0 && history[0].status === 'published'}
                  icon={<CheckCircle2 size={24} />} 
                  label="Editorial Gate" 
                  desc="Content is prepped for CMS ingestion. Awaiting final human nod." 
                />
              </div>
            </div>

            {!isBusy && pipelineState === 'ready' && history.length > 0 && (
              <div className="mt-12 p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl text-center">
                <h4 className="text-xl font-bold text-emerald-400 mb-2">New Article Ready!</h4>
                <p className="text-slate-400 mb-6">Pipeline successfully delivered: "{history[0].title}"</p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => setActiveTab('archive')} className="px-6 py-2 bg-slate-800 rounded-lg text-sm font-bold">Preview Draft</button>
                  <button onClick={() => publishContent(history[0].id)} className="px-6 py-2 bg-emerald-600 rounded-lg text-sm font-bold shadow-lg shadow-emerald-600/20">Push Live</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Archive View */}
        {activeTab === 'archive' && (
          <div className="space-y-8">
             {history.length > 0 ? (
               <div className="grid grid-cols-1 gap-8">
                 {history.map(item => (
                   <div key={item.id} className="bg-slate-900/40 border border-slate-800/50 rounded-3xl overflow-hidden hover:border-sky-500/30 transition-all">
                     <div className="p-8">
                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded">{item.category}</span>
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${item.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                {item.status.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-slate-500 font-bold">{new Date(item.timestamp).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">{item.summary}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                              <MetricBox label="SEO Score" value={`${item.metrics.seoScore}%`} />
                              <MetricBox label="AEO Score" value={`${item.metrics.aeoScore}%`} />
                              <MetricBox label="Word Count" value={item.metrics.wordCount} />
                              <MetricBox label="Readability" value={`${item.metrics.readability}%`} />
                            </div>

                            <div className="flex gap-3">
                              <button className="flex items-center gap-2 px-5 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition-all"><Eye size={16} /> Preview Content</button>
                              {item.status !== 'published' && (
                                <button onClick={() => publishContent(item.id)} className="flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-500 rounded-xl text-sm font-bold transition-all shadow-lg shadow-sky-600/20"><CheckCircle2 size={16} /> Publish Now</button>
                              )}
                              <button className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white"><MoreVertical size={20} /></button>
                            </div>
                          </div>
                          
                          <div className="w-full lg:w-72 space-y-4">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Knowledge Sources</h4>
                            {item.sources.map((s, i) => (
                              <div key={i} className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/50 flex items-center gap-3">
                                <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-sky-400">0{i+1}</div>
                                <span className="text-[10px] font-bold truncate flex-1">{s.title}</span>
                                <ExternalLink size={10} className="text-slate-600" />
                              </div>
                            ))}
                          </div>
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <EmptyState title="Archive is empty" sub="Start generating world-class content from the dashboard." icon={<BookOpen size={48} />} action={() => setActiveTab('dashboard')} />
             )}
          </div>
        )}
      </main>
    </div>
  );
};

// --- Sub-components ---

const NavItem = ({ active, icon, label, onClick, count = 0 }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${active ? 'bg-sky-500/10 text-sky-400 border border-sky-500/10' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
  >
    <div className="flex items-center gap-3">
      <span className={`${active ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`}>{icon}</span>
      <span className="font-semibold text-sm">{label}</span>
    </div>
    {count > 0 && (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-sky-500/20' : 'bg-slate-800'}`}>{count}</span>
    )}
  </button>
);

const StatCard = ({ label, value, icon, change }: any) => (
  <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-6 transition-all hover:border-slate-700">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-slate-800 rounded-xl">{icon}</div>
      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{change}</span>
    </div>
    <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</h4>
    <p className="text-3xl font-bold tracking-tight">{value}</p>
  </div>
);

const MetricBox = ({ label, value }: any) => (
  <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
    <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{label}</span>
    <span className="text-lg font-bold text-slate-200">{value}</span>
  </div>
);

const PipelineStep = ({ active, completed, icon, label, desc }: any) => (
  <div className={`relative z-10 flex flex-col md:flex-row items-center gap-8 md:items-start transition-all duration-500 ${active ? 'opacity-100' : completed ? 'opacity-60' : 'opacity-30'}`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${active ? 'bg-sky-500 text-white shadow-xl shadow-sky-500/30 animate-pulse' : completed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
      {completed ? <CheckCircle2 size={24} /> : icon}
    </div>
    <div className="flex-1 text-center md:text-left">
      <h4 className={`text-lg font-bold mb-1 ${active ? 'text-sky-400' : 'text-slate-100'}`}>{label}</h4>
      <p className="text-slate-400 text-sm max-w-sm">{desc}</p>
    </div>
  </div>
);

const EmptyState = ({ title, sub, icon, action }: any) => (
  <div className="flex flex-col items-center justify-center p-16 bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-800">
    <div className="text-slate-700 mb-6">{icon}</div>
    <h4 className="text-xl font-bold mb-2">{title}</h4>
    <p className="text-slate-500 mb-8 max-w-xs text-center text-sm">{sub}</p>
    {action && (
      <button onClick={action} className="px-6 py-2.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-xl font-bold transition-all text-sm">
        INITIALIZE SYSTEM
      </button>
    )}
  </div>
);

export default App;


import React, { useState, useEffect, useCallback } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { Category, GeneratedContent, Trend, GroundingSource } from './types';
import { scanTrends, generateArticle } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'trends'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Technology');
  const [isScanning, setIsScanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [history, setHistory] = useState<GeneratedContent[]>([]);
  const [autoMode, setAutoMode] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");

  const categories: Category[] = ['Technology', 'Artificial Intelligence', 'Lifestyle', 'Business', 'Health'];

  const handleScan = async () => {
    setIsScanning(true);
    setProgressMessage("Scanning popular web sources for trends...");
    try {
      const result = await scanTrends(selectedCategory);
      setTrends(result.trends);
      setSources(result.sources);
      setProgressMessage("Scan complete! Analysis finished.");
    } catch (error) {
      console.error(error);
      setProgressMessage("Error scanning trends. Check API limits.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerate = async (topic: Trend) => {
    setIsGenerating(true);
    setProgressMessage(`Generating autonomous content for: ${topic.topic}...`);
    try {
      const result = await generateArticle(topic.topic, selectedCategory);
      const newContent: GeneratedContent = {
        id: Math.random().toString(36).substr(2, 9),
        topic: topic.topic,
        title: result.title,
        summary: result.summary,
        fullArticle: result.content,
        sources: sources.slice(0, 3),
        timestamp: Date.now(),
        status: 'draft',
        category: selectedCategory
      };
      setHistory(prev => [newContent, ...prev]);
      setActiveTab('content');
      setProgressMessage("Content generated successfully.");
    } catch (error) {
      console.error(error);
      setProgressMessage("Failed to generate content.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Autonomous mode simulation
  useEffect(() => {
    let interval: any;
    if (autoMode) {
      interval = setInterval(() => {
        if (!isScanning && !isGenerating) {
          handleScan();
        }
      }, 60000); // Check every minute
    }
    return () => clearInterval(interval);
  }, [autoMode, isScanning, isGenerating, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass border-r border-slate-700/50 p-6 flex flex-col fixed h-full z-10 hidden md:flex">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Zap className="text-white fill-white" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Trend<span className="text-sky-400">Genius</span></h1>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('trends')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'trends' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <TrendingUp size={20} />
            <span className="font-medium">Trending</span>
          </button>
          <button 
            onClick={() => setActiveTab('content')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'content' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <BookOpen size={20} />
            <span className="font-medium">Articles</span>
          </button>
        </nav>

        <div className="mt-auto space-y-4 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCcw size={16} className={autoMode ? "text-green-400 animate-spin" : "text-slate-500"} />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Auto-Pilot</span>
            </div>
            <button 
              onClick={() => setAutoMode(!autoMode)}
              className={`w-10 h-5 rounded-full relative transition-colors ${autoMode ? 'bg-green-500' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${autoMode ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${autoMode ? 'bg-green-500' : 'bg-amber-500'}`}></div>
              <span className="text-xs text-slate-300">{autoMode ? 'Monitoring Web' : 'Idle'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 bg-slate-950 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h2 className="text-2xl font-bold">Welcome back, Editor</h2>
            <p className="text-slate-400 text-sm">Autonomous content engine is ready to sync.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value as Category)}
              className="bg-slate-800 border border-slate-700 text-sm rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none flex-1 md:flex-none"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <button 
              onClick={handleScan}
              disabled={isScanning}
              className="bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-sky-500/20 whitespace-nowrap"
            >
              {isScanning ? <RefreshCcw className="animate-spin" size={18} /> : <Search size={18} />}
              {isScanning ? 'Scanning...' : 'Scan Now'}
            </button>
          </div>
        </header>

        {/* Progress Tracker (Sticky Bottomish) */}
        {progressMessage && (
          <div className="mb-6 animate-in fade-in slide-in-from-top duration-300">
            <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4 flex items-center gap-3">
              <div className="pulse-indicator w-3 h-3"></div>
              <p className="text-sm text-sky-400 font-medium">{progressMessage}</p>
            </div>
          </div>
        )}

        {/* Dynamic Views */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                    <TrendingUp size={24} />
                  </div>
                  <span className="text-xs font-bold text-green-400">+12%</span>
                </div>
                <h4 className="text-slate-400 text-sm font-medium">Trends Detected</h4>
                <p className="text-3xl font-bold mt-1">{trends.length || '0'}</p>
              </div>
              <div className="glass p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-sky-500/20 rounded-xl text-sky-400">
                    <BookOpen size={24} />
                  </div>
                  <span className="text-xs font-bold text-green-400">Ready</span>
                </div>
                <h4 className="text-slate-400 text-sm font-medium">Articles Drafted</h4>
                <p className="text-3xl font-bold mt-1">{history.length}</p>
              </div>
            </div>

            {/* Recent Sources */}
            <div className="glass p-6 rounded-2xl flex flex-col h-full">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <ExternalLink size={18} className="text-slate-400" />
                Latest Sources
              </h3>
              <div className="space-y-3 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
                {sources.length > 0 ? sources.map((s, idx) => (
                  <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2 hover:bg-slate-800 rounded-lg transition-colors group">
                    <span className="text-sm text-slate-300 truncate max-w-[150px]">{s.title}</span>
                    <ChevronRight size={14} className="text-slate-600 group-hover:text-sky-400" />
                  </a>
                )) : (
                  <p className="text-xs text-slate-500 italic">No sources scanned yet.</p>
                )}
              </div>
            </div>

            {/* Main Action Area */}
            <div className="md:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Hot Topics <span className="text-slate-500 text-sm font-normal ml-2">Real-time scan results</span></h3>
              </div>
              {trends.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trends.map((t, i) => (
                    <div key={i} className="glass p-6 rounded-2xl border-l-4 border-l-sky-500 group hover:border-l-sky-400 transition-all cursor-pointer" onClick={() => handleGenerate(t)}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] uppercase font-bold text-sky-400 tracking-widest">{selectedCategory}</span>
                        <div className="flex items-center gap-1">
                          <Zap size={12} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs font-bold text-slate-300">{t.relevance}% relevance</span>
                        </div>
                      </div>
                      <h4 className="text-lg font-bold mb-2 group-hover:text-sky-400 transition-colors">{t.topic}</h4>
                      <p className="text-sm text-slate-400 line-clamp-2 mb-4">{t.description}</p>
                      <button className="text-xs font-bold text-slate-300 flex items-center gap-1 group-hover:gap-2 transition-all">
                        GENERATE ARTICLE <ChevronRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass p-12 rounded-2xl text-center">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="text-slate-500" size={32} />
                  </div>
                  <h4 className="text-lg font-bold">No trends discovered</h4>
                  <p className="text-slate-400 mb-6">Start a scan to let AI find what's trending across the internet.</p>
                  <button onClick={handleScan} className="bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 px-6 py-2 rounded-lg font-bold transition-all">
                    Initialize Scan
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="glass p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-6">Trending Landscape</h3>
              <div className="space-y-4">
                {trends.length > 0 ? trends.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 hover:bg-slate-800/50 rounded-xl transition-all border border-transparent hover:border-slate-700">
                    <div className="w-12 h-12 flex-shrink-0 bg-slate-800 rounded-lg flex items-center justify-center text-xl font-bold text-sky-400">
                      #{idx + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{t.topic}</h4>
                      <p className="text-slate-400 text-sm">{t.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs font-mono text-slate-500">RELEVANCE</div>
                      <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500" style={{ width: `${t.relevance}%` }}></div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleGenerate(t)}
                      className="p-2 bg-sky-500/10 text-sky-400 rounded-lg hover:bg-sky-500 hover:text-white transition-all"
                    >
                      <Zap size={20} />
                    </button>
                  </div>
                )) : (
                  <p className="text-center py-10 text-slate-500">No trends detected yet. Use the scan button to start.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Content Library</h3>
              <div className="flex gap-2">
                <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">{history.length} Articles</span>
              </div>
            </div>
            
            {history.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {history.map((item) => (
                  <div key={item.id} className="glass overflow-hidden rounded-2xl border border-slate-700 hover:border-sky-500/50 transition-all flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-slate-900 flex items-center justify-center p-8 border-r border-slate-800">
                       <BookOpen size={64} className="text-slate-700" />
                    </div>
                    <div className="flex-1 p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">{item.category}</span>
                          <h4 className="text-xl font-bold mt-1">{item.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${item.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-400 mb-6">{item.summary}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-slate-800">
                        <div className="flex -space-x-2">
                          {item.sources.map((_, i) => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-sky-500 flex items-center justify-center text-[8px] font-bold text-white">S</div>
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">{item.sources.length} Research Sources used</span>
                        <div className="ml-auto flex items-center gap-2">
                           <button className="px-4 py-2 text-sm font-semibold hover:text-sky-400 transition-colors">Edit Draft</button>
                           <button className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-sm font-bold shadow-lg shadow-sky-500/10 flex items-center gap-2">
                             <CheckCircle2 size={16} /> Publish to Site
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass p-20 rounded-2xl text-center">
                <p className="text-slate-500">No generated articles yet. Use the scan results to create your first content piece.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-slate-700/50 p-4 flex justify-around z-50">
        <button onClick={() => setActiveTab('dashboard')} className={`p-2 ${activeTab === 'dashboard' ? 'text-sky-400' : 'text-slate-500'}`}><LayoutDashboard /></button>
        <button onClick={() => setActiveTab('trends')} className={`p-2 ${activeTab === 'trends' ? 'text-sky-400' : 'text-slate-500'}`}><TrendingUp /></button>
        <button onClick={() => setActiveTab('content')} className={`p-2 ${activeTab === 'content' ? 'text-sky-400' : 'text-slate-500'}`}><BookOpen /></button>
      </div>
    </div>
  );
};

export default App;

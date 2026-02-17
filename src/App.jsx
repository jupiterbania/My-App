import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Download, Search, LayoutGrid, Smartphone, X, Star, Calendar, ShieldCheck } from 'lucide-react';
import { formatBytes, formatNumber } from './utils';

function App() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    try {
      // Simplify query to avoid potential index issues during debugging
      const q = collection(db, "apps");

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const appsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setApps(appsData);
        setLoading(false);
      }, (err) => {
        console.error("Error fetching apps: ", err);
        setError(err.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Setup error:", err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const filteredApps = apps.filter(app =>
    (app.name && app.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (app.category && app.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500 selection:text-white relative">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
              <div className="bg-blue-600 p-2 rounded-lg shell">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white">AppStore</span>
            </div>
            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Search apps..."
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm transition-all placeholder:text-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search */}
      <div className="md:hidden pt-20 px-4 pb-2">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-400" />
          <input
            type="text"
            placeholder="Search apps..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:pt-24 pt-6 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-sm">
            Featured Apps
          </h1>
          <div className="px-3 py-1 rounded-full bg-slate-800/50 border border-white/5 text-slate-400 text-xs font-medium">
            {filteredApps.length} Apps Available
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-200 text-center">
            <p className="font-bold">Error loading apps:</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="text-slate-400 animate-pulse">Loading apps...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredApps.map((app) => (
              <AppCard key={app.id} app={app} onClick={() => setSelectedApp(app)} />
            ))}
          </div>
        )}

        {!loading && filteredApps.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="bg-slate-800/50 inline-block p-4 rounded-full mb-4">
              <LayoutGrid className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-medium text-slate-300">No apps found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search query.</p>
          </div>
        )}
      </main>

      {/* App Details Modal */}
      {selectedApp && (
        <AppDetailsModal app={selectedApp} onClose={() => setSelectedApp(null)} />
      )}
    </div>
  )
}

function AppCard({ app, onClick }) {
  // Use a fallback image if icon_url is missing
  const iconUrl = app.icon_url || "https://uiapp.store/placeholder-icon.png"; // Generic placeholder

  return (
    <div
      onClick={onClick}
      className="group relative bg-slate-800/30 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:bg-slate-800/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 overflow-hidden cursor-pointer"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={iconUrl}
              alt={app.name}
              className="w-16 h-16 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-300 bg-slate-800 border border-white/10"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/150x150/1e293b/ffffff?text=App';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-white truncate group-hover:text-blue-400 transition-colors">
              {app.name || 'Untitled App'}
            </h3>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-700/50 text-slate-400 mb-1 border border-white/5">
              {app.category || 'Utility'}
            </span>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span>v{app.version || '1.0'}</span>
              <span>•</span>
              <span>{formatBytes(app.size)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col h-[130px]"> {/* Fixed height container for consistency */}
          <p className="text-sm text-slate-300 line-clamp-3 mb-4 flex-grow">
            {app.description || 'No description available for this application.'}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
            <div className="text-xs text-slate-500 font-medium">
              {app.downloads > 0 ? `${formatNumber(app.downloads)} downloads` : 'New Release'}
            </div>
            <button
              className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 border border-blue-500/20 hover:border-blue-600"
            >
              <Download className="w-4 h-4" />
              <span>View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppDetailsModal({ app, onClose }) {
  const iconUrl = app.icon_url || "https://uiapp.store/placeholder-icon.png";

  // Format date if it exists
  const releaseDate = app.created_at?.seconds
    ? new Date(app.created_at.seconds * 1000).toLocaleDateString()
    : 'Recently';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-3xl shadow-2xl animate-fade-in-up custom-scrollbar">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors z-20"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header Section */}
        <div className="relative h-48 sm:h-64 bg-slate-800 overflow-hidden">
          {/* Banner Image / Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 to-slate-900"></div>

          {/* App Info Overlay */}
          <div className="absolute -bottom-12 left-6 sm:left-10 flex items-end gap-6 z-10">
            <img
              src={iconUrl}
              alt={app.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl shadow-2xl border-4 border-slate-900 bg-slate-800 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/150x150/1e293b/ffffff?text=App';
              }}
            />
            <div className="pb-14 sm:pb-3 mb-1">
              <h2 className="text-2xl sm:text-4xl font-bold text-white drop-shadow-md">{app.name}</h2>
              <div className="flex items-center gap-3 text-slate-300 mt-1">
                <span className="bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded text-sm font-medium border border-blue-500/20">
                  {app.category || 'App'}
                </span>
                <span className="text-sm">{app.developer_id || 'Unknown Developer'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar (Download & Stats) */}
        <div className="pt-16 pb-6 px-6 sm:px-10 border-b border-white/5 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-6 sm:gap-12 flex-1">
            <div className="text-center">
              <div className="text-lg font-bold text-white flex items-center justify-center gap-1">
                {formatNumber(app.downloads)}
              </div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {formatBytes(app.size)}
              </div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Size</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                v{app.version || '1.0'}
              </div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Version</div>
            </div>
          </div>

          <a
            href={app.apk_url}
            download
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-lg font-semibold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-95"
          >
            <Download className="w-5 h-5" />
            <span>Download APK</span>
          </a>
        </div>

        {/* Description & Screenshots */}
        <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Description */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h3 className="text-xl font-bold text-white mb-4">About this app</h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {app.description || 'No description available for this application.'}
              </p>
            </section>

            {/* Screenshots Gallery */}
            {app.screenshot_urls && app.screenshot_urls.length > 0 && (
              <section>
                <h3 className="text-xl font-bold text-white mb-4">Screenshots</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                  {app.screenshot_urls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Screenshot ${index + 1}`}
                      className="h-64 app-screenshot rounded-xl border border-white/10 shadow-lg snap-start object-cover"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Additional Info */}
          <div className="space-y-6">
            <div className="bg-slate-800/30 p-6 rounded-2xl border border-white/5">
              <h4 className="text-lg font-semibold text-white mb-4">Information</h4>
              <div className="space-y-4">
                <InfoRow icon={<Calendar className="w-4 h-4" />} label="Released" value={releaseDate} />
                <InfoRow icon={<ShieldCheck className="w-4 h-4" />} label="License" value="Free" />
                <InfoRow icon={<LayoutGrid className="w-4 h-4" />} label="Category" value={app.category} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3 text-slate-400">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  )
}

export default App;

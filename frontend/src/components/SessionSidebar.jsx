import React from 'react';
import { motion } from 'framer-motion';
import { Clock, X, Database } from 'lucide-react';

export default function SessionSidebar({
  sessions,
  dbStatus,
  selectedSessionId,
  onLoadSession,
  onClose
}) {
  return (
    <motion.aside 
      className="w-80 border-r border-white/5 bg-[#0e0f14]/80 backdrop-blur-md p-5 flex flex-col z-40"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
        <span className="font-bold text-white uppercase text-xs tracking-wider flex items-center space-x-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <span>Committee Archive</span>
        </span>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500 space-y-2">
            <Database className="w-8 h-8 mx-auto text-gray-600 stroke-1" />
            <p>{dbStatus === 'Offline' ? 'Database unavailable.' : 'No archives found. Conduct a debate to save history.'}</p>
          </div>
        ) : (
          sessions.map((item) => {
            const isSelected = selectedSessionId === item._id;
            const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            
            return (
              <button
                key={item._id}
                onClick={() => onLoadSession(item._id)}
                className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all duration-300 ${
                  isSelected 
                    ? 'bg-purple-600/10 border-purple-500/40 shadow-md shadow-purple-500/5' 
                    : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-extrabold text-white text-sm">{item.companyName}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                    item.verdict === 'Invest' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20' :
                    item.verdict === 'Watch' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/20' :
                    'bg-rose-600/20 text-rose-400 border border-rose-500/20'
                  }`}>
                    {item.verdict}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>{item.riskProfile} Profile</span>
                  <span>{dateStr}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </motion.aside>
  );
}

import { useEffect, useState } from 'react';
import { Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface ThreatItem {
  userId: string;
  timestamp: string;
  input: string;
  explanation: string;
}

interface Props {
  refreshTrigger: number;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export default function ThreatHistory({ refreshTrigger }: Props) {
  const [history, setHistory] = useState<ThreatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/history?user_id=anonymous&limit=10`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch (e) {
      console.error('History fetch failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [refreshTrigger]);

  const isBlock = (exp: string) => exp.includes('BLOCK');
  const extractScore = (exp: string) => { const m = exp.match(/RISK SCORE\*\*:\s*(\d+)/); return m ? m[1] : '?'; };
  const formatTime = (ts: string) => { try { return new Date(ts).toLocaleString(); } catch { return ts; } };

  return (
    <div className="border-t border-gray-700 bg-gray-900">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold">Threat History</span>
          {history.length > 0 && <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">{history.length}</span>}
        </div>
        <span className="text-xs text-gray-500">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="max-h-64 overflow-y-auto px-4 pb-4">
          {loading && <div className="text-center py-4 text-gray-500 text-sm">Loading...</div>}
          {!loading && history.length === 0 && <div className="text-center py-4 text-gray-500 text-sm">No threat analyses yet.</div>}
          {!loading && history.map((item, idx) => (
            <div key={idx} className="mb-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  {isBlock(item.explanation) ? <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" /> : <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />}
                  <span className="text-white text-sm font-medium truncate max-w-xs">{item.input}</span>
                </div>
                <span className={`text-xs font-bold whitespace-nowrap ${isBlock(item.explanation) ? 'text-red-400' : 'text-green-400'}`}>Score: {extractScore(item.explanation)}/10</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Clock className="w-3 h-3" />
                <span>{formatTime(item.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

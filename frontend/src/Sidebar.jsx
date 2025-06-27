import { useState } from 'react';
import logo from './assets/sumaops-logo.png';

const workloads = [
  { key: 'pods', label: '🧪 Pods' },
  { key: 'deployments', label: '🚀 Deployments' },
  { key: 'services', label: '🛰️ Services' },
  { key: 'nodes', label: '🧱 Nodes' },
  { key: 'namespaces', label: '🌐 Namespaces' },
  { key: 'statefulsets', label: '📦 StatefulSets' },
  { key: 'replicasets', label: '📚 ReplicaSets' },
  { key: 'daemonsets', label: '🔁 DaemonSets' },
];

export default function Sidebar({ setSelectedView }) {
  const [open, setOpen] = useState(false);

  return (
    <aside className="w-60 bg-gray-800 p-3 flex flex-col border-r border-gray-700 text-xs text-gray-300">
      <div className="flex items-center gap-2 mb-5">
        <img src={logo} alt="SumaOps Logo" className="w-8 h-8 rounded" />
        <h1 className="text-base font-bold text-green-400">SumaOps</h1>
      </div>

      {/* Section Logs */}
      <button
        onClick={() => setSelectedView(null)}
        className="text-left hover:text-green-300 mb-3"
      >
        📋 Logs de déploiement
      </button>

      {/* Section Workloads */}
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="text-left w-full hover:text-green-300 mb-2"
        >
          ⚙️ Workloads actifs {open ? '▲' : '▼'}
        </button>

        {open && (
          <div className="pl-2 flex flex-col gap-1">
            {workloads.map((w) => (
              <button
                key={w.key}
                onClick={() => setSelectedView(w.key)}
                className="text-left hover:text-green-200"
              >
                {w.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
          onClick={() => setSelectedView('stats')}
          className="text-left hover:text-green-300 mt-4"
        >
          📊 Statistiques
      </button>


    </aside>
  );
}

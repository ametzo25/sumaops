import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaCubes, FaProjectDiagram, FaNetworkWired,
  FaServer, FaLayerGroup
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

const boxStyles = {
  base: 'rounded-lg shadow-md p-4 mb-4 flex flex-col text-sm',
  pods: 'bg-green-900 text-green-200',
  deployments: 'bg-blue-900 text-blue-200',
  services: 'bg-indigo-900 text-indigo-200',
  nodes: 'bg-yellow-800 text-yellow-100',
  namespaces: 'bg-purple-900 text-purple-200',
};

const DashboardStats = ({ selectedNamespace }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const url = selectedNamespace === 'all'
        ? 'http://localhost:3000/cluster/stats'
        : `http://localhost:3000/cluster/stats?namespace=${selectedNamespace}`;
      try {
        const res = await axios.get(url);
        setStats(res.data);
      } catch (err) {
        console.error('Erreur chargement stats:', err);
      }
    };

    fetchStats();
  }, [selectedNamespace]);

  if (!stats) return <p className="text-gray-400">Chargement des statistiques...</p>;

  // Données pour les graphes
  const podChartData = [
    { name: 'Running', value: stats.pods.running },
    { name: 'Pending', value: stats.pods.pending },
    { name: 'Failed', value: stats.pods.failed }
  ];

  const nodeChartData = [
    { name: 'Ready', value: stats.nodes.ready },
    { name: 'NotReady', value: stats.nodes.notReady }
  ];

  const serviceTypes = Object.entries(stats.services.types || {}).map(([type, count]) => ({
    name: type,
    value: count
  }));

  const deploymentChartData = [
    { name: 'Deployments', value: stats.deployments }
  ];

  const namespaceChartData = [
    { name: 'Namespaces', value: stats.namespaces }
  ];

  return (
    <div className="space-y-6">
      {/* 🧪 Pods */}
      <div className={`${boxStyles.base} ${boxStyles.pods}`}>
        <div className="flex items-center gap-3 mb-2">
          <FaCubes className="text-2xl" />
          <h3 className="text-md font-bold">Pods (Total: {stats.pods.total})</h3>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={podChartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#34d399" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🚀 Deployments */}
      <div className={`${boxStyles.base} ${boxStyles.deployments}`}>
        <div className="flex items-center gap-3 mb-2">
          <FaProjectDiagram className="text-2xl" />
          <h3 className="text-md font-bold">Deployments</h3>
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={deploymentChartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🌐 Services */}
      <div className={`${boxStyles.base} ${boxStyles.services}`}>
        <div className="flex items-center gap-3 mb-2">
          <FaNetworkWired className="text-2xl" />
          <h3 className="text-md font-bold">Services</h3>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={serviceTypes}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#818cf8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🧱 Nodes */}
      <div className={`${boxStyles.base} ${boxStyles.nodes}`}>
        <div className="flex items-center gap-3 mb-2">
          <FaServer className="text-2xl" />
          <h3 className="text-md font-bold">Nodes (Total: {stats.nodes.total})</h3>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={nodeChartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#fde68a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 📦 Namespaces */}
      <div className={`${boxStyles.base} ${boxStyles.namespaces}`}>
        <div className="flex items-center gap-3 mb-2">
          <FaLayerGroup className="text-2xl" />
          <h3 className="text-md font-bold">Namespaces</h3>
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={namespaceChartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#c084fc" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardStats;

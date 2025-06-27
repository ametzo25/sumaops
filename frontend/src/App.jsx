import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Table from './components/Table';
import DashboardStats from './components/DashboardStats';


const getStatusColor = (status) => {
  if (!status) return 'text-white';

  switch (status.toLowerCase()) {
    case 'running':
    case 'ready':
    case 'active':
    case 'success':
      return 'text-green-400 font-semibold';
    case 'pending':
    case 'terminating':
      return 'text-yellow-400 font-semibold';
    case 'failed':
    case 'notready':
    case 'crashloopbackoff':
      return 'text-red-400 font-semibold';
    default:
      return 'text-white';
  }
};

function App() {
  const [selectedView, setSelectedView] = useState('stats');

  const [workloadData, setWorkloadData] = useState(null);
  const [namespaces, setNamespaces] = useState([]);
  const [selectedNamespace, setSelectedNamespace] = useState('all');
  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/deployments')
      .then(res => res.json())
      .then(setDeployments);

    fetch('http://localhost:3000/cluster/namespaces')
      .then(res => res.json())
      .then(setNamespaces);
  }, []);

  useEffect(() => {
    const workloads = [
      'pods', 'deployments', 'services',
      'nodes', 'namespaces',
      'statefulsets', 'replicasets', 'daemonsets'
    ];
  
    if (!workloads.includes(selectedView)) return;
  
    fetch('http://localhost:3000/cluster/workloads')
      .then(res => res.json())
      .then(json => setWorkloadData(json[selectedView] || []));
  }, [selectedView]);
  

  const renderNamespaceFilter = () => {
    if (!workloadData || !workloadData.items) return null;

    return (
      <div className="mb-4">
        <label className="text-sm mr-2">Namespace :</label>
        <select
          className="bg-gray-700 text-white p-1 rounded"
          value={selectedNamespace}
          onChange={e => setSelectedNamespace(e.target.value)}
        >
          <option value="all">All</option>
          {namespaces.map(ns => (
            <option key={ns} value={ns}>
              {ns}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderPodsTable = () => {
    if (!workloadData || !workloadData.items) return <p>Aucune donnée.</p>;

    const podsToShow = workloadData.items.filter(pod =>
      selectedNamespace === 'all' || pod.metadata.namespace === selectedNamespace
    );

    return (
      <Table
        columns={['Nom', 'Namespace', 'Statut', 'Redémarrages', 'Créé le']}
        data={podsToShow.map(pod => {
          const status = pod.status || {};
          const containers = status.containerStatuses || [];
          const restarts = containers.reduce((sum, c) => sum + (c.restartCount || 0), 0);
          return [
            pod.metadata?.name,
            pod.metadata?.namespace,
            <span className={getStatusColor(status.phase)}>{status.phase}</span>,
            restarts,
            pod.metadata?.creationTimestamp,
          ];
        })}
      />
    );
  };

  const renderDeploymentsTable = () => {
    if (!workloadData || !workloadData.items) return <p>Aucune donnée.</p>;

    const deploymentsToShow = workloadData.items.filter(dep =>
      selectedNamespace === 'all' || dep.metadata?.namespace === selectedNamespace
    );

    return (
      <Table
        columns={['Nom', 'Namespace', 'Ready', 'Réplicas', 'Créé le']}
        data={deploymentsToShow.map(dep => {
          const status = dep.status || {};
          return [
            dep.metadata?.name,
            dep.metadata?.namespace,
            `${status.readyReplicas || 0}/${status.replicas || 0}`,
            status.replicas || 0,
            dep.metadata?.creationTimestamp,
          ];
        })}
      />
    );
  };

  const renderServicesTable = () => {
    if (!workloadData || !workloadData.items) return <p>Aucune donnée.</p>;
  
    const servicesToShow = workloadData.items.filter(svc =>
      selectedNamespace === 'all' || svc.metadata?.namespace === selectedNamespace
    );
  
    return (
      <Table
        columns={['Nom', 'Namespace', 'Type', 'Cluster IP', 'Ports']}
        data={servicesToShow.map(svc => [
          svc.metadata?.name,
          svc.metadata?.namespace,
          svc.spec?.type,
          svc.spec?.clusterIP,
          svc.spec?.ports?.map(p => `${p.port}/${p.protocol}`).join(', ')
        ])}
      />
    );
  };
  const renderNodesTable = () => {
    if (!workloadData || !workloadData.items) return <p>Aucune donnée.</p>;
  
    const nodesToShow = workloadData.items;
  
    return (
      <Table
        columns={['Nom', 'Statut', 'Rôles', 'OS/Arch', 'Créé le']}
        data={nodesToShow.map(node => {
          const conditions = node.status?.conditions || [];
          const readyCondition = conditions.find(c => c.type === 'Ready');
          const status = readyCondition?.status === 'True' ? 'Ready' : 'NotReady';
  
          return [
            node.metadata?.name,
            <span className={getStatusColor(status)}>{status}</span>,
            node.metadata?.labels?.['kubernetes.io/role'] || node.metadata?.labels?.['node-role.kubernetes.io/control-plane'] ? 'Master' : 'Worker',
            `${node.status?.nodeInfo?.operatingSystem}/${node.status?.nodeInfo?.architecture}`,
            node.metadata?.creationTimestamp,
          ];
        })}
      />
    );
  };
  const renderNamespacesTable = () => {
    if (!workloadData || !workloadData.items) return <p>Aucune donnée.</p>;
  
    return (
      <Table
        columns={['Nom', 'Statut', 'Créé le']}
        data={workloadData.items.map(ns => [
          ns.metadata?.name,
          <span className={getStatusColor(ns.status?.phase)}>{ns.status?.phase}</span>,

          ns.metadata?.creationTimestamp,
        ])}
      />
    );
  };
  const renderStatefulSetsTable = () => {
    if (!workloadData || !workloadData.items) return <p>Aucune donnée.</p>;
  
    const ssToShow = workloadData.items.filter(ss =>
      selectedNamespace === 'all' || ss.metadata?.namespace === selectedNamespace
    );
  
    return (
      <Table
        columns={['Nom', 'Namespace', 'Réplicas', 'Service', 'Créé le']}
        data={ssToShow.map(ss => [
          ss.metadata?.name,
          ss.metadata?.namespace,
          ss.status?.replicas || 0,
          ss.spec?.serviceName,
          ss.metadata?.creationTimestamp,
        ])}
      />
    );
  };
  const renderReplicaSetsTable = () => {
    if (!workloadData || !workloadData.items) return <p>Aucune donnée.</p>;
  
    const rsToShow = workloadData.items.filter(rs =>
      selectedNamespace === 'all' || rs.metadata?.namespace === selectedNamespace
    );
  
    return (
      <Table
        columns={['Nom', 'Namespace', 'Réplicas', 'Créé le']}
        data={rsToShow.map(rs => [
          rs.metadata?.name,
          rs.metadata?.namespace,
          rs.status?.replicas || 0,
          rs.metadata?.creationTimestamp,
        ])}
      />
    );
  };
  const renderDaemonSetsTable = () => {
    if (!workloadData || !workloadData.items) return <p>Aucune donnée.</p>;
  
    const dsToShow = workloadData.items.filter(ds =>
      selectedNamespace === 'all' || ds.metadata?.namespace === selectedNamespace
    );
  
    return (
      <Table
        columns={['Nom', 'Namespace', 'Desired', 'Ready', 'Créé le']}
        data={dsToShow.map(ds => [
          ds.metadata?.name,
          ds.metadata?.namespace,
          ds.status?.desiredNumberScheduled || 0,
          ds.status?.numberReady || 0,
          ds.metadata?.creationTimestamp,
        ])}
      />
    );
  };
      
  
  

  return (
    <div className="flex w-screen h-screen bg-gray-900 text-white text-[11px]">
      <Sidebar setSelectedView={setSelectedView} />


      <main className="flex-1 p-4 overflow-auto">
        {!selectedView ? (
          <>
            <h2 className="text-xl font-semibold text-green-300 mb-4">🧠 Logs de déploiement</h2>
            <Table
              columns={['#', 'Repo', 'Branche', 'Statut', 'Date', 'Message']}
              data={deployments.map((d, index) => [
                d.id,
                d.repo,
                d.branch,
                <span key={`status-${index}`} className={getStatusColor(d.status)}>{d.status}</span>,
                d.timestamp,
                d.message,
              ])}
            />
          </>
        ) : selectedView === 'pods' ? (
          <>
            <h2 className="text-xl font-semibold text-green-300 mb-2">🧪 Pods</h2>
            {renderNamespaceFilter()}
            {renderPodsTable()}
          </>
        
        ) : selectedView === 'deployments' ? (
          
          <>
            <h2 className="text-xl font-semibold text-green-300 mb-2">🚀 Deployments</h2>
            {renderNamespaceFilter()}
            {renderDeploymentsTable()}
          </>
        ) : selectedView === 'services' ? (
            <>
              <h2 className="text-xl font-semibold text-green-300 mb-2">🔌 Services</h2>
              {renderNamespaceFilter()}
              {renderServicesTable()}
            </>
        ) : selectedView === 'nodes' ? (
          <>
            <h2 className="text-xl font-semibold text-green-300 mb-2">🧱 Nodes</h2>
            {renderNodesTable()}
          </>
        ) : selectedView === 'namespaces' ? (
          <>
            <h2 className="text-xl font-semibold text-green-300 mb-2">📦 Namespaces</h2>
            {renderNamespacesTable()}
          </>
        ) : selectedView === 'statefulsets' ? (
          <>
            <h2 className="text-xl font-semibold text-green-300 mb-2">🏢 StatefulSets</h2>
            {renderNamespaceFilter()}
            {renderStatefulSetsTable()}
          </>
        ) : selectedView === 'replicasets' ? (
          <>
            <h2 className="text-xl font-semibold text-green-300 mb-2">📁 ReplicaSets</h2>
            {renderNamespaceFilter()}
            {renderReplicaSetsTable()}
          </>
        ) : selectedView === 'daemonsets' ? (
          <>
            <h2 className="text-xl font-semibold text-green-300 mb-2">⚙️ DaemonSets</h2>
            {renderNamespaceFilter()}
            {renderDaemonSetsTable()}
          </>
        ) : selectedView === 'stats' ? (
          <>
            <h2 className="text-xl font-semibold text-green-300 mb-2">📈 Statistiques Kubernetes</h2>
            {renderNamespaceFilter()}
            <DashboardStats selectedNamespace={selectedNamespace} />
          </>        
        
        
          
        ) : (
          <pre className="bg-gray-800 p-3 rounded text-[10px] whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(workloadData, null, 2)}
          </pre>
        )}
      </main>
    </div>
  );
}

export default App;

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const getJson = async (cmd) => {
  try {
    const { stdout } = await execPromise(cmd);
    return JSON.parse(stdout);
  } catch (err) {
    console.error(`Erreur sur la commande: ${cmd}`, err.message);
    return { error: err.message };
  }
};

// ✅ Cette fonction est bien exportée
exports.getWorkloads = async (req, res) => {
  const resources = {
    pods: 'kubectl get pods -A -o json',
    deployments: 'kubectl get deployments -A -o json',
    services: 'kubectl get svc -A -o json',
    nodes: 'kubectl get nodes -o json',
    namespaces: 'kubectl get namespaces -o json',
    statefulsets: 'kubectl get statefulsets -A -o json',
    replicasets: 'kubectl get replicasets -A -o json',
    daemonsets: 'kubectl get daemonsets -A -o json',
  };

  const results = {};

  for (const [key, command] of Object.entries(resources)) {
    try {
      const { stdout } = await execPromise(command);
      results[key] = JSON.parse(stdout);
    } catch (err) {
      console.error(`❌ Erreur lors de l’exécution de ${command} :`, err.message);
      results[key] = { error: err.message };
    }
  }

  res.json(results);
};

// ✅ Maintenant en-dehors de la précédente
exports.getNamespaces = async (req, res) => {
  try {
    const { stdout } = await execPromise('kubectl get namespaces -o json');
    const data = JSON.parse(stdout);
    const nsList = data.items.map(ns => ns.metadata.name);
    res.json(nsList);
  } catch (err) {
    console.error('Erreur namespaces:', err.message);
    res.status(500).json({ error: 'Failed to get namespaces' });
  }
};


const runKubectl = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout) => {
      if (err) return reject(err);
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(e);
      }
    });
  });
};


exports.getClusterStats = async (req, res) => {
  const ns = req.query.namespace;

  const nsArg = ns && ns !== 'all' ? `-n ${ns}` : '-A';

  try {
    const [pods, deployments, services, nodes, namespaces] = await Promise.all([
      runKubectl(`kubectl get pods ${nsArg} -o json`),
      runKubectl(`kubectl get deployments ${nsArg} -o json`),
      runKubectl(`kubectl get services ${nsArg} -o json`),
      runKubectl(`kubectl get nodes -o json`),
      runKubectl(`kubectl get namespaces -o json`)
    ]);

    // Count pod statuses
    const podStats = { total: pods.items.length, running: 0, pending: 0, failed: 0 };
    pods.items.forEach(pod => {
      const status = pod.status?.phase?.toLowerCase();
      if (status === 'running') podStats.running++;
      else if (status === 'pending') podStats.pending++;
      else podStats.failed++;
    });

    // Service types
    const svcTypes = {};
    services.items.forEach(svc => {
      const type = svc.spec?.type || 'Unknown';
      svcTypes[type] = (svcTypes[type] || 0) + 1;
    });

    // Node statuses
    const nodeStats = { total: nodes.items.length, ready: 0, notReady: 0 };
    nodes.items.forEach(node => {
      const readyCondition = node.status?.conditions?.find(c => c.type === 'Ready');
      if (readyCondition?.status === 'True') nodeStats.ready++;
      else nodeStats.notReady++;
    });

    res.json({
      pods: podStats,
      deployments: deployments.items.length,
      services: {
        total: services.items.length,
        types: svcTypes
      },
      nodes: nodeStats,
      namespaces: namespaces.items.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


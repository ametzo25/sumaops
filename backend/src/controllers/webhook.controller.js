const { cloneAndDeploy } = require('../services/deployer');
const logger = require('../services/logger');

exports.handleWebhook = async (req, res) => {
  const event = req.headers['x-github-event'];
  if (event !== 'push') return res.status(200).send('Ignoring event');

  const repoUrl = req.body.repository.clone_url;
  const branch = req.body.ref.split('/').pop();

  try {
    logger.info(`🚀 Déploiement lancé pour ${repoUrl} (${branch})`);
    await cloneAndDeploy(repoUrl, branch);
    return res.status(200).send('Déploiement déclenché');
  } catch (err) {
    logger.error('❌ Erreur lors du déploiement', err);
    return res.status(500).send('Erreur pendant le déploiement');
  }
};

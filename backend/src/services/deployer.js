const simpleGit = require('simple-git');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');
const db = require('./db'); // ← ajout de la DB

exports.cloneAndDeploy = async (repoUrl, branch) => {
  const repoName = repoUrl.split('/').pop().replace('.git', '');
  const localPath = path.join(process.env.REPO_PATH, repoName);
  const deployPath = path.join(localPath, process.env.DEPLOY_PATH);

  try {
    // Clonage ou pull
    if (fs.existsSync(localPath)) {
      logger.info(`🔄 Pull du repo ${repoName}`);
      await simpleGit(localPath).pull('origin', branch);
    } else {
      logger.info(`📥 Clonage du repo ${repoName}`);
      await simpleGit().clone(repoUrl, localPath);
    }

    logger.info(`⚙️ Déploiement via kubectl depuis ${deployPath}`);

    // Lancement du déploiement
    return new Promise((resolve, reject) => {
      exec(`kubectl apply -f ${deployPath}`, (err, stdout, stderr) => {
        if (err) {
          logger.error(stderr);
          // Log en base en cas d’échec
          db.run(
            `INSERT INTO deployments (repo, branch, status, message) VALUES (?, ?, ?, ?)`,
            [repoName, branch, 'failed', stderr],
            (dbErr) => {
              if (dbErr) logger.error('DB insert error:', dbErr.message);
            }
          );
          reject(err);
        } else {
          logger.info(stdout);
          // Log en base en cas de succès
          db.run(
            `INSERT INTO deployments (repo, branch, status, message) VALUES (?, ?, ?, ?)`,
            [repoName, branch, 'success', stdout],
            (dbErr) => {
              if (dbErr) logger.error('DB insert error:', dbErr.message);
            }
          );
          resolve(stdout);
        }
      });
    });

  } catch (err) {
    logger.error('❌ Erreur critique :', err.message);
    // Log en base même si ça plante avant kubectl
    db.run(
      `INSERT INTO deployments (repo, branch, status, message) VALUES (?, ?, ?, ?)`,
      [repoName, branch, 'error', err.message],
      (dbErr) => {
        if (dbErr) logger.error('DB insert error:', dbErr.message);
      }
    );
    throw err;
  }
};

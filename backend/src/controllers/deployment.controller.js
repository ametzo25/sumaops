const db = require('../services/db');

exports.getAllDeployments = (req, res) => {
  db.all('SELECT * FROM deployments ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) {
      console.error('❌ Erreur lors de la lecture des logs:', err.message);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.json(rows);
  });
};


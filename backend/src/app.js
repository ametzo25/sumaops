require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


// Initialisation de l'app AVANT toute utilisation
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
const webhookRoutes = require('./routes/webhook.route');
app.use('/webhook', webhookRoutes);

const deploymentRoutes = require('./routes/deployment.route');
app.use('/deployments', deploymentRoutes);

const clusterRoutes = require('./routes/cluster.route');
app.use('/cluster', clusterRoutes);

app.get('/', (_, res) => res.send('🧠 SumaOps backend is alive'));

// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend SumaOps running on port ${PORT}`);
});



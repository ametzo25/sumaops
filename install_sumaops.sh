#!/bin/bash

set -e

echo "📦 Installation de SumaOps en cours..."

# Couleurs pour messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

echo_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERREUR]${NC} $1"
}

# Vérifie si une commande existe
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo_error "$1 n'est pas installé."
        return 1
    else
        echo_success "$1 est installé."
        return 0
    fi
}

# 1. Vérification des dépendances
echo_info "Vérification des dépendances..."

MISSING=0

for cmd in kubectl git curl node npm; do
    if ! check_command $cmd; then
        MISSING=1
    fi
done

if ! check_command minikube; then
    echo_error "Minikube n'est pas installé. Essayons d'identifier un driver disponible..."
    AVAILABLE_DRIVER=$(minikube config get driver 2>/dev/null || echo "docker")
    echo_info "Le driver par défaut est: $AVAILABLE_DRIVER"
    echo_info "Vous pouvez lancer manuellement: minikube start --driver=$AVAILABLE_DRIVER"
    MISSING=1
fi

if [ $MISSING -eq 1 ]; then
    echo_error "Des dépendances sont manquantes. Veuillez les installer avant de continuer."
    read -p "Souhaitez-vous continuer quand même ? (y/n): " CONFIRM
    if [[ "$CONFIRM" != "y" ]]; then
        echo_info "Installation annulée."
        exit 1
    fi
fi

# 2. Lancer Minikube si nécessaire
if ! kubectl version --short &> /dev/null; then
    echo_info "Minikube ne semble pas actif. Tentative de démarrage..."
    minikube start --driver=docker || {
        echo_error "Échec du démarrage de Minikube. Veuillez le démarrer manuellement."
        exit 1
    }
fi

# 3. Créer le dossier de logs
mkdir -p logs

# 4. Lancer le backend
if [ -d "backend" ]; then
    echo_info "Installation des dépendances backend..."
    cd backend
    npm install

    echo_info "Lancement du backend en arrière-plan..."
    nohup node src/app.js > ../logs/backend.log 2>&1 &
    cd ..
else
    echo_error "Dossier backend introuvable."
fi

# 5. Lancer le frontend
if [ -d "frontend" ]; then
    echo_info "Installation des dépendances frontend..."
    cd frontend
    npm install

    echo_info "Lancement du frontend en arrière-plan..."
    nohup npm run dev > ../logs/frontend.log 2>&1 &
    cd ..
else
    echo_error "Dossier frontend introuvable."
fi

echo_success "🎉 SumaOps est lancé !"
echo_info "Backend : http://localhost:3000"
echo_info "Frontend : http://localhost:5173"
echo_info "Consultez les logs dans le dossier 'logs'."

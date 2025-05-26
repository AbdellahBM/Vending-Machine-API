# Interface Web du Distributeur Automatique

Une interface web moderne et dynamique pour interagir avec l'API du distributeur automatique.

## 🚀 Fonctionnalités

### ✨ Interface utilisateur
- **Design moderne et responsive** - Compatible avec tous les appareils
- **Interface intuitive** - Navigation simple et claire
- **Animations fluides** - Transitions et effets visuels
- **Notifications en temps réel** - Feedback immédiat pour toutes les actions
- **Thème cohérent** - Palette de couleurs professionnelle

### 💰 Gestion des pièces
- **Insertion de pièces** - Support de toutes les dénominations (0.5, 1, 2, 5, 10 MAD)
- **Affichage du solde** - Mise à jour en temps réel
- **Raccourcis clavier** - Touches 1-5 pour insérer des pièces rapidement

### 🛒 Gestion du panier
- **Ajout/suppression d'articles** - Interface intuitive
- **Modification des quantités** - Boutons + et - pour chaque article
- **Calcul automatique** - Total et sous-totaux en temps réel
- **Vérification des fonds** - Indication des articles disponibles/indisponibles

### 🛍️ Processus d'achat
- **Modal de confirmation** - Détails complets de l'achat
- **Calcul de la monnaie** - Affichage détaillé du rendu de monnaie
- **Historique des articles** - Liste des produits distribués

### ⚙️ Administration
- **Réinitialisation** - Remise à zéro complète du distributeur
- **Gestion d'état** - Synchronisation avec l'API

## 🎮 Utilisation

### Démarrage
1. Assurez-vous que l'API est démarrée sur `http://localhost:3000`
2. Ouvrez `public/index.html` dans votre navigateur
3. L'interface se connecte automatiquement à l'API

### Processus d'achat typique
1. **Insérer des pièces** - Cliquez sur les boutons de pièces ou utilisez les touches 1-5
2. **Sélectionner des produits** - Cliquez sur "Ajouter au panier" pour les produits disponibles
3. **Gérer le panier** - Modifiez les quantités si nécessaire
4. **Effectuer l'achat** - Cliquez sur "Acheter" ou utilisez Ctrl+Enter
5. **Récupérer la monnaie** - Consultez les détails dans la modal de confirmation

### Raccourcis clavier
- **1-5** : Insérer des pièces (0.5, 1, 2, 5, 10 MAD)
- **Ctrl+Enter** : Effectuer l'achat
- **Échap** : Fermer les modals

## 🎨 Design et UX

### Palette de couleurs
- **Primaire** : Bleu professionnel (#2c5aa0)
- **Secondaire** : Vert succès (#34c85a)
- **Danger** : Rouge (#e74c3c)
- **Warning** : Orange (#f39c12)

### Composants UI
- **Cartes produits** - Design moderne avec état visuel
- **Boutons interactifs** - Feedback visuel et animations
- **Notifications toast** - Messages temporaires non-intrusifs
- **Modal responsive** - Détails d'achat élégants
- **Loading states** - Indicateurs de chargement

### Responsive Design
- **Mobile First** - Optimisé pour tous les écrans
- **Grid Layout** - Disposition flexible et adaptative
- **Touch Friendly** - Boutons et interactions adaptés au tactile

## 🔧 Architecture technique

### Structure des fichiers
```
public/
├── index.html      # Structure HTML principale
├── styles.css      # Styles CSS modernes
├── app.js         # Logique JavaScript (ES6+)
└── README.md      # Documentation
```

### Technologies utilisées
- **HTML5** - Structure sémantique
- **CSS3** - Grid, Flexbox, animations, variables CSS
- **JavaScript ES6+** - Classes, async/await, modules
- **Fetch API** - Communication avec l'API REST
- **Font Awesome** - Icônes vectorielles

### Fonctionnalités techniques
- **Gestion d'état client** - Synchronisation avec l'API
- **Gestion d'erreurs** - Affichage user-friendly des erreurs
- **Offline detection** - Notifications de statut de connexion
- **Loading states** - Feedback visuel pendant les requêtes
- **Event-driven** - Architecture basée sur les événements

## 📱 Compatibilité

### Navigateurs supportés
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

### Appareils
- **Desktop** - Expérience complète
- **Tablette** - Layout adapté
- **Mobile** - Interface optimisée tactile

## 🔗 API Integration

### Endpoints utilisés
- `GET /products` - Liste des produits
- `POST /coins/insert` - Insertion de pièces
- `POST /cart/add` - Ajout au panier
- `DELETE /cart/remove` - Suppression du panier
- `GET /cart` - Contenu du panier
- `POST /purchase` - Achat
- `POST /transaction/cancel` - Annulation
- `GET /transaction/balance` - Solde
- `POST /admin/reset` - Réinitialisation

### Gestion des erreurs
- **Timeout de réseau** - Retry automatique
- **Erreurs API** - Messages explicites
- **Validation côté client** - Prévention des erreurs

## 🚀 Déploiement

### Serveur de développement
```bash
# Option 1: Serveur HTTP simple Python
python -m http.server 8080 --directory public

# Option 2: Live Server (VS Code extension)
# Clic droit sur index.html > "Open with Live Server"

# Option 3: Node.js http-server
npx http-server public -p 8080
```

### Production
- **Static hosting** - GitHub Pages, Netlify, Vercel
- **CDN** - CloudFront, CloudFlare
- **Configuration** - Mise à jour de l'URL API en production

## 🔮 Améliorations futures

### Fonctionnalités
- [ ] Mode sombre/clair
- [ ] Historique des achats
- [ ] Favoris utilisateur
- [ ] Multi-langues
- [ ] PWA (Progressive Web App)
- [ ] Notifications push

### Technique
- [ ] TypeScript pour la type-safety
- [ ] Service Worker pour le cache
- [ ] Optimisation des performances
- [ ] Tests automatisés
- [ ] Analytics d'utilisation

## 📞 Support

Pour toute question ou problème avec l'interface web :
1. Vérifiez que l'API fonctionne sur `http://localhost:3000`
2. Consultez la console du navigateur pour les erreurs
3. Vérifiez la compatibilité de votre navigateur
4. Consultez la documentation de l'API

---

**Note** : Cette interface nécessite que l'API du distributeur automatique soit démarrée et accessible sur `http://localhost:3000`. 
const { exec } = require('child_process');
const open = require('open');

console.log('🚀 Démarrage de l\'interface web du distributeur automatique...\n');

// Démarrer le serveur
const server = require('./server.js');

// Attendre que le serveur soit prêt puis ouvrir le navigateur
setTimeout(() => {
    console.log('\n🌐 Ouverture de l\'interface web dans le navigateur...');
    
    // Ouvrir dans le navigateur par défaut
    open('http://localhost:3000')
        .then(() => {
            console.log('✅ Interface web ouverte avec succès!');
            console.log('\n📋 Instructions d\'utilisation:');
            console.log('   • Insérez des pièces en cliquant sur les boutons ou avec les touches 1-5');
            console.log('   • Ajoutez des produits au panier');
            console.log('   • Effectuez votre achat avec le bouton "Acheter" ou Ctrl+Enter');
            console.log('   • Utilisez Échap pour fermer les modals');
            console.log('\n🛑 Pour arrêter le serveur: Ctrl+C');
        })
        .catch((error) => {
            console.log('⚠️  Impossible d\'ouvrir automatiquement le navigateur.');
            console.log('🔗 Ouvrez manuellement: http://localhost:3000');
        });
}, 1000);

// Gérer l'arrêt proprement
process.on('SIGINT', () => {
    console.log('\n\n🛑 Arrêt du serveur...');
    console.log('👋 Interface web fermée. Au revoir!');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n🛑 Arrêt du serveur...');
    console.log('👋 Interface web fermée. Au revoir!');
    process.exit(0);
}); 
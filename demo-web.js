const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

class WebInterfaceDemo {
    constructor() {
        this.balance = 0;
        this.cart = { items: [], totalCost: 0, itemCount: 0 };
    }

    async makeRequest(endpoint, method = 'GET', data = null) {
        try {
            const config = {
                method,
                url: `${API_BASE}${endpoint}`,
                headers: { 'Content-Type': 'application/json' }
            };

            if (data) {
                config.data = data;
            }

            const response = await axios(config);
            return response.data;
        } catch (error) {
            console.error(`❌ Erreur API (${endpoint}):`, error.response?.data?.message || error.message);
            return null;
        }
    }

    async simulateWebInterfaceUsage() {
        console.log('🚀 === DÉMONSTRATION DE L\'INTERFACE WEB ===\n');

        // 1. Vérifier les produits disponibles
        console.log('📦 1. Chargement des produits...');
        const productsResult = await this.makeRequest('/products');
        if (productsResult) {
            console.log(`   ✅ ${productsResult.products.length} produits chargés`);
            console.log(`   💰 Solde actuel: ${productsResult.insertedBalance || 0} MAD\n`);
        }

        // 2. Insérer des pièces (simulation clic interface)
        console.log('💰 2. Insertion de pièces...');
        const coins = [5, 2, 1];
        for (const coin of coins) {
            const result = await this.makeRequest('/coins/insert', 'POST', { value: coin });
            if (result) {
                console.log(`   ✅ Pièce de ${coin} MAD insérée. Solde: ${result.insertedBalance} MAD`);
                this.balance = result.insertedBalance;
            }
            await this.delay(500);
        }
        console.log('');

        // 3. Vérifier les produits avec nouveau solde
        console.log('🛒 3. Mise à jour des produits disponibles...');
        const updatedProducts = await this.makeRequest('/products');
        if (updatedProducts) {
            const purchasable = updatedProducts.products.filter(p => p.purchasable);
            console.log(`   ✅ ${purchasable.length} produits maintenant disponibles\n`);
        }

        // 4. Ajouter des produits au panier
        console.log('➕ 4. Ajout de produits au panier...');
        const productsToAdd = ['soda_cola', 'snack_chips'];
        for (const productId of productsToAdd) {
            const result = await this.makeRequest('/cart/add', 'POST', { productId });
            if (result) {
                console.log(`   ✅ Produit ajouté: ${result.cart.items[result.cart.items.length - 1]?.name}`);
                console.log(`   🛒 Total panier: ${result.cart.totalCost} MAD`);
                this.cart = result.cart;
            }
            await this.delay(500);
        }
        console.log('');

        // 5. Modifier quantité (simulation boutons +/-)
        console.log('📊 5. Modification des quantités...');
        const addMoreResult = await this.makeRequest('/cart/add', 'POST', { 
            productId: 'soda_cola', 
            quantity: 1 
        });
        if (addMoreResult) {
            console.log(`   ✅ Quantité augmentée pour Coca Cola`);
            console.log(`   🛒 Nouveau total: ${addMoreResult.cart.totalCost} MAD\n`);
        }

        // 6. Vérifier le contenu du panier
        console.log('👀 6. Vérification du panier...');
        const cartResult = await this.makeRequest('/cart');
        if (cartResult) {
            console.log(`   📦 Articles dans le panier: ${cartResult.cart.itemCount}`);
            cartResult.cart.items.forEach(item => {
                console.log(`   - ${item.name} x${item.quantity} = ${item.subtotal} MAD`);
            });
            console.log(`   💰 Solde restant: ${cartResult.remainingBalance} MAD\n`);
        }

        // 7. Effectuer l'achat
        console.log('💳 7. Processus d\'achat...');
        const purchaseResult = await this.makeRequest('/purchase', 'POST');
        if (purchaseResult) {
            console.log('   ✅ Achat réussi!');
            console.log(`   💰 Total payé: ${purchaseResult.totalCost} MAD`);
            console.log(`   💴 Monnaie rendue: ${purchaseResult.changeAmount} MAD`);
            
            if (purchaseResult.change && purchaseResult.change.length > 0) {
                console.log('   🪙 Détail de la monnaie:');
                purchaseResult.change.forEach(coin => {
                    console.log(`      ${coin.count} x ${coin.denomination} MAD`);
                });
            }

            console.log('   📦 Articles distribués:');
            purchaseResult.dispensed.forEach(item => {
                console.log(`      ${item.name} x${item.quantity}`);
            });
        }
        console.log('');

        // 8. Vérifier l'état final
        console.log('🔍 8. État final du système...');
        const finalBalance = await this.makeRequest('/transaction/balance');
        if (finalBalance) {
            console.log(`   💰 Solde final: ${finalBalance.insertedBalance} MAD`);
            console.log(`   🛒 Total panier: ${finalBalance.cartTotal} MAD\n`);
        }

        console.log('✨ === DÉMONSTRATION TERMINÉE ===');
        console.log('🌐 Ouvrez http://localhost:3000 pour utiliser l\'interface web!');
    }

    async demonstrateErrorHandling() {
        console.log('\n🧪 === TEST DE GESTION D\'ERREURS ===\n');

        // Test avec produit inexistant
        console.log('❌ Test: Ajout d\'un produit inexistant...');
        await this.makeRequest('/cart/add', 'POST', { productId: 'nonexistent' });

        // Test avec pièce invalide
        console.log('❌ Test: Insertion d\'une pièce invalide...');
        await this.makeRequest('/coins/insert', 'POST', { value: 3 });

        // Test achat panier vide
        console.log('❌ Test: Achat avec panier vide...');
        await this.makeRequest('/purchase', 'POST');

        console.log('\n✅ Tests d\'erreurs terminés\n');
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Fonction principale
async function runDemo() {
    const demo = new WebInterfaceDemo();
    
    try {
        await demo.simulateWebInterfaceUsage();
        await demo.demonstrateErrorHandling();
    } catch (error) {
        console.error('💥 Erreur pendant la démonstration:', error.message);
        console.log('\n🔧 Assurez-vous que le serveur est démarré avec: npm run start');
    }
}

// Exécuter la démonstration si le script est appelé directement
if (require.main === module) {
    console.log('🎯 Démarrage de la démonstration...');
    console.log('⚠️  Assurez-vous que le serveur est démarré!\n');
    
    setTimeout(() => {
        runDemo();
    }, 1000);
}

module.exports = WebInterfaceDemo; 
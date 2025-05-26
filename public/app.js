class VendingMachineApp {
    constructor() {
        this.apiBase = 'http://localhost:3000/api';
        this.state = {
            balance: 0,
            products: [],
            cart: {
                items: [],
                totalCost: 0,
                itemCount: 0
            }
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadProducts();
        this.updateBalance();
    }

    bindEvents() {
        // Coin insertion
        document.querySelectorAll('.coin-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const value = parseFloat(e.target.dataset.value);
                this.insertCoin(value);
            });
        });

        // Cart actions
        document.getElementById('purchase-btn').addEventListener('click', () => {
            this.purchase();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.cancelTransaction();
        });

        // Admin
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetMachine();
        });

        // Modal
        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modal-ok').addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal on background click
        document.getElementById('purchase-modal').addEventListener('click', (e) => {
            if (e.target.id === 'purchase-modal') {
                this.closeModal();
            }
        });
    }

    async makeRequest(endpoint, method = 'GET', data = null) {
        this.showLoading(true);
        
        try {
            const config = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            if (data) {
                config.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.apiBase}${endpoint}`, config);
            const result = await response.json();

            if (!result.success) {
                this.showNotification(result.message, 'error');
                return null;
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            this.showNotification('Erreur de connexion à l\'API', 'error');
            return null;
        } finally {
            this.showLoading(false);
        }
    }

    async insertCoin(value) {
        const result = await this.makeRequest('/coins/insert', 'POST', { value });
        
        if (result) {
            this.state.balance = result.insertedBalance;
            this.updateBalance();
            this.updateProducts();
            this.showNotification(`Pièce de ${value} MAD insérée avec succès`, 'success');
        }
    }

    async loadProducts() {
        const result = await this.makeRequest('/products');
        
        if (result) {
            this.state.products = result.products;
            this.state.balance = result.insertedBalance || 0;
            this.renderProducts();
            this.updateBalance();
        }
    }

    async updateProducts() {
        await this.loadProducts();
    }

    async addToCart(productId, quantity = 1) {
        const result = await this.makeRequest('/cart/add', 'POST', { productId, quantity });
        
        if (result) {
            this.state.cart = result.cart;
            this.state.balance = result.insertedBalance;
            this.renderCart();
            this.updateBalance();
            this.updateProducts();
            
            const product = this.state.products.find(p => p.id === productId);
            this.showNotification(`${product.name} ajouté au panier`, 'success');
        }
    }

    async removeFromCart(productId, quantity = null) {
        const data = { productId };
        if (quantity !== null) {
            data.quantity = quantity;
        }

        const result = await this.makeRequest('/cart/remove', 'DELETE', data);
        
        if (result) {
            this.state.cart = result.cart;
            this.state.balance = result.insertedBalance;
            this.renderCart();
            this.updateBalance();
            this.updateProducts();
            this.showNotification('Produit retiré du panier', 'info');
        }
    }

    async updateCartItemQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            await this.removeFromCart(productId);
            return;
        }

        // Get current quantity
        const currentItem = this.state.cart.items.find(item => item.productId === productId);
        if (!currentItem) return;

        const difference = newQuantity - currentItem.quantity;
        
        if (difference > 0) {
            // Add more items
            await this.addToCart(productId, difference);
        } else if (difference < 0) {
            // Remove some items
            await this.removeFromCart(productId, Math.abs(difference));
        }
    }

    async getCartContents() {
        const result = await this.makeRequest('/cart');
        
        if (result) {
            this.state.cart = result.cart;
            this.state.balance = result.insertedBalance;
            this.renderCart();
            this.updateBalance();
        }
    }

    async purchase() {
        const result = await this.makeRequest('/purchase', 'POST');
        
        if (result) {
            this.showPurchaseModal(result);
            this.state.cart = { items: [], totalCost: 0, itemCount: 0 };
            this.state.balance = 0;
            this.renderCart();
            this.updateBalance();
            this.updateProducts();
        }
    }

    async cancelTransaction() {
        const result = await this.makeRequest('/transaction/cancel', 'POST');
        
        if (result) {
            this.state.cart = { items: [], totalCost: 0, itemCount: 0 };
            this.state.balance = 0;
            this.renderCart();
            this.updateBalance();
            this.updateProducts();
            
            let message = `Transaction annulée. Remboursement: ${result.refundAmount} MAD`;
            if (result.refundCoins && result.refundCoins.length > 0) {
                const coins = result.refundCoins.map(coin => 
                    `${coin.count}x ${coin.denomination} MAD`
                ).join(', ');
                message += ` (${coins})`;
            }
            
            this.showNotification(message, 'info');
        }
    }

    async updateBalance() {
        const result = await this.makeRequest('/transaction/balance');
        
        if (result) {
            this.state.balance = result.insertedBalance;
            document.getElementById('balance').textContent = `${this.state.balance.toFixed(2)} MAD`;
        }
    }

    async resetMachine() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser le distributeur ?')) {
            const result = await this.makeRequest('/admin/reset', 'POST');
            
            if (result) {
                this.state.balance = 0;
                this.state.cart = { items: [], totalCost: 0, itemCount: 0 };
                this.renderCart();
                this.updateBalance();
                this.updateProducts();
                this.showNotification('Distributeur réinitialisé avec succès', 'success');
            }
        }
    }

    renderProducts() {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';

        this.state.products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = `product-card ${product.purchasable ? 'purchasable' : 'not-purchasable'}`;
            
            productCard.innerHTML = `
                <div class="product-status ${product.purchasable ? 'available' : 'unavailable'}">
                    ${product.purchasable ? 'Disponible' : 'Fonds insuffisants'}
                </div>
                <div class="product-name">${product.name}</div>
                <div class="product-price">${product.price.toFixed(2)} MAD</div>
                <button class="add-to-cart-btn" ${!product.purchasable ? 'disabled' : ''}>
                    <i class="fas fa-plus"></i> Ajouter au panier
                </button>
            `;

            const addBtn = productCard.querySelector('.add-to-cart-btn');
            if (product.purchasable) {
                addBtn.addEventListener('click', () => {
                    this.addToCart(product.id);
                });
            }

            grid.appendChild(productCard);
        });
    }

    renderCart() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const purchaseBtn = document.getElementById('purchase-btn');
        const cancelBtn = document.getElementById('cancel-btn');

        if (this.state.cart.items.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Votre panier est vide</p>';
            purchaseBtn.disabled = true;
            cancelBtn.disabled = true;
        } else {
            cartItems.innerHTML = '';
            
            this.state.cart.items.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${item.price.toFixed(2)} MAD × ${item.quantity} = ${item.subtotal.toFixed(2)} MAD</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn minus">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn plus">+</button>
                        <button class="remove-item-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;

                // Bind quantity controls
                const minusBtn = cartItem.querySelector('.minus');
                const plusBtn = cartItem.querySelector('.plus');
                const removeBtn = cartItem.querySelector('.remove-item-btn');

                minusBtn.addEventListener('click', () => {
                    this.updateCartItemQuantity(item.productId, item.quantity - 1);
                });

                plusBtn.addEventListener('click', () => {
                    this.updateCartItemQuantity(item.productId, item.quantity + 1);
                });

                removeBtn.addEventListener('click', () => {
                    this.removeFromCart(item.productId);
                });

                cartItems.appendChild(cartItem);
            });

            purchaseBtn.disabled = false;
            cancelBtn.disabled = false;
        }

        cartTotal.textContent = `${this.state.cart.totalCost.toFixed(2)} MAD`;
    }

    showPurchaseModal(purchaseData) {
        const modal = document.getElementById('purchase-modal');
        const modalBody = document.getElementById('modal-body');
        
        let html = '<div class="purchase-details">';
        
        // Purchased items
        html += '<div class="purchase-section">';
        html += '<h4><i class="fas fa-shopping-bag"></i> Articles achetés</h4>';
        purchaseData.purchasedItems.items.forEach(item => {
            html += `
                <div class="purchase-item">
                    <span>${item.name} × ${item.quantity}</span>
                    <span>${item.subtotal.toFixed(2)} MAD</span>
                </div>
            `;
        });
        html += `<div class="purchase-item" style="font-weight: bold; border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px;">
            <span>Total</span>
            <span>${purchaseData.totalCost.toFixed(2)} MAD</span>
        </div>`;
        html += '</div>';

        // Change details
        if (purchaseData.changeAmount > 0) {
            html += '<div class="change-details">';
            html += '<h4><i class="fas fa-coins"></i> Monnaie rendue</h4>';
            html += `<p><strong>Montant: ${purchaseData.changeAmount.toFixed(2)} MAD</strong></p>`;
            
            if (purchaseData.change && purchaseData.change.length > 0) {
                html += '<p>Détail de la monnaie:</p>';
                purchaseData.change.forEach(coin => {
                    html += `<span style="margin-right: 10px;">${coin.count} × ${coin.denomination} MAD</span>`;
                });
            }
            html += '</div>';
        }

        // Dispensed items
        if (purchaseData.dispensed && purchaseData.dispensed.length > 0) {
            html += '<div class="purchase-section">';
            html += '<h4><i class="fas fa-gift"></i> Articles distribués</h4>';
            purchaseData.dispensed.forEach(item => {
                html += `<div class="purchase-item">
                    <span>${item.name}</span>
                    <span>Quantité: ${item.quantity}</span>
                </div>`;
            });
            html += '</div>';
        }

        html += '</div>';
        
        modalBody.innerHTML = html;
        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('purchase-modal').classList.remove('active');
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.vendingApp = new VendingMachineApp();
});

// Add some additional utility functions for better UX
window.addEventListener('online', () => {
    if (window.vendingApp) {
        window.vendingApp.showNotification('Connexion rétablie', 'success');
    }
});

window.addEventListener('offline', () => {
    if (window.vendingApp) {
        window.vendingApp.showNotification('Connexion perdue', 'warning');
    }
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (!window.vendingApp) return;
    
    // ESC to close modal
    if (e.key === 'Escape') {
        window.vendingApp.closeModal();
    }
    
    // Number keys for coin insertion
    const coinValues = { '1': 0.5, '2': 1, '3': 2, '4': 5, '5': 10 };
    if (coinValues[e.key]) {
        window.vendingApp.insertCoin(coinValues[e.key]);
    }
    
    // Enter for purchase
    if (e.key === 'Enter' && e.ctrlKey) {
        const purchaseBtn = document.getElementById('purchase-btn');
        if (!purchaseBtn.disabled) {
            window.vendingApp.purchase();
        }
    }
});

// Add tooltips for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Add title attributes for accessibility
    document.querySelectorAll('.coin-btn').forEach((btn, index) => {
        const keys = ['1', '2', '3', '4', '5'];
        btn.title = `Insérer ${btn.textContent} (Touche ${keys[index]})`;
    });
    
    const purchaseBtn = document.getElementById('purchase-btn');
    if (purchaseBtn) {
        purchaseBtn.title = 'Effectuer l\'achat (Ctrl+Enter)';
    }
}); 
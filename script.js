// DOM Elements
const searchButton = document.getElementById('searchButton');
const searchTermInput = document.getElementById('searchTerm');
const categorySelect = document.getElementById('category');
const sortBySelect = document.getElementById('sortBy');
const resultsContainer = document.getElementById('results');
const loadingIndicator = document.getElementById('loadingIndicator');
const noResultsMessage = document.getElementById('noResults');
const gridViewButton = document.getElementById('gridView');
const listViewButton = document.getElementById('listView');

// State
let currentView = 'list'; // Set list view as default

// Event Listeners
searchButton.addEventListener('click', searchProducts);
searchTermInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') searchProducts();
});
gridViewButton.addEventListener('click', () => switchView('grid'));
listViewButton.addEventListener('click', () => switchView('list'));

// Initialize with list view active
document.addEventListener('DOMContentLoaded', function() {
    listViewButton.classList.add('active');
    gridViewButton.classList.remove('active');
    resultsContainer.className = 'results-list';
    noResultsMessage.style.display = 'flex';
});

// View Toggle Function
// In script.js, modify the switchView function
function switchView(view) {
    if (view === currentView) return;

    currentView = view;

    // Update button states
    gridViewButton.classList.toggle('active', view === 'grid');
    listViewButton.classList.toggle('active', view === 'list');

    // Update results container class
    resultsContainer.className = view === 'grid' ? 'results-grid' : 'results-list';

    // Re-render results if we have any
    const productCards = resultsContainer.querySelectorAll('.product-card, .product-card-list');
    if (productCards.length > 0) {
        const currentTerm = searchTermInput.value.trim();
        const products = Array.from(productCards).map(card => {
            // Extract retailer name from the span element
            const retailerSpan = card.querySelector('.retailer-name');
            const retailerName = retailerSpan ? retailerSpan.textContent.replace(/[()]/g, '').trim() : 'Unknown Retailer';

            return {
                id: card.dataset.productId,
                name: card.querySelector('.product-title').textContent.replace(/<[^>]*>/g, ''),
                price: parseFloat(card.querySelector('.product-price').textContent.replace(/[^0-9.]/g, '')),
                rating: parseFloat(card.querySelector('.product-rating').textContent.trim().split(' ')[0]),
                retailer: retailerName,
                prod_url: card.querySelector('.btn-primary').href,
                image_url: card.querySelector('.product-image').src,
                onSale: card.querySelector('.product-badge') !== null,
                DeliveryTime: card.querySelector('.delivery-time')?.textContent || ''
            };
        });

        displayResults(products, currentTerm);
    }
}

// Format price with thousands separator
function formatPrice(price) {
    if (price === null || price === undefined || isNaN(price)) return 'N/A';

    return price.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Highlight search terms in text
function highlightText(text, searchTerm) {
    if (!searchTerm || !text || typeof text !== 'string') return text;

    try {
        const words = searchTerm.split(' ')
            .filter(word => word.length > 2)
            .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

        if (words.length === 0) return text;

        const pattern = new RegExp(`(${words.join('|')})`, 'gi');
        return text.replace(pattern, '<span class="highlight">$1</span>');
    } catch (e) {
        console.error('Highlight error:', e);
        return text;
    }
}

// Display loading state
function showLoading() {
    loadingIndicator.style.display = 'flex';
    resultsContainer.innerHTML = '';
    noResultsMessage.style.display = 'none';
}

// Display results
function displayResults(products, searchTerm) {
    loadingIndicator.style.display = 'none';

    if (!products || products.length === 0) {
        noResultsMessage.style.display = 'flex';
        resultsContainer.innerHTML = '';
        return;
    }

    noResultsMessage.style.display = 'none';
    let html = '';

    products.forEach((product, index) => {
        const productId = product.id || `prod-${index}-${Date.now()}`;
        const productLink = product.prod_url || '#';
        const productImage = product.image_url || '';
        const highlightedName = highlightText(product.name, searchTerm);
        const formattedPrice = formatPrice(product.price);
        const ratingStars = Math.round(product.rating) || 0;
        const retailerName = product.retailer || 'Unknown Retailer';
        const deliveryTime = product.DeliveryTime || 'Delivery time varies';

        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += `<i class="fas fa-star${i <= ratingStars ? '' : '-empty'}"></i>`;
        }

        if (currentView === 'grid') {
            html += `
            <div class="product-card" data-product-id="${productId}" data-retailer="${retailerName}">
                <div class="product-image-container">
                    ${product.onSale ? '<span class="product-badge">Sale</span>' : ''}
                    <img src="${productImage}"
                         alt="${product.name}"
                         class="product-image"
                         loading="lazy"
                         onerror="this.onerror=null; this.src='data:image/svg+xml;charset=UTF-8,%3Csvg...'">

                </div>
                <div class="product-details">
                    <h3 class="product-title">${highlightedName}</h3>
                    <div class="product-price">${formattedPrice}</div>
                    <div class="product-meta">
                        <div class="product-rating">${starsHtml} ${product.rating || '0'}</div>
                        <div class="delivery-time">${deliveryTime}</div>
                    </div>
                    <div class="product-actions">
                        <a href="${productLink}" target="_blank" class="btn btn-primary">
                            <i class="fas fa-shopping-cart"></i> Buy Now <span class="retailer-name">(${retailerName})</span>
                        </a>
                        <button class="btn btn-secondary">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>`;
        } else {
            html += `
            <div class="product-card-list" data-product-id="${productId}" data-retailer="${retailerName}">
                <div class="product-image-container">
                    ${product.onSale ? '<span class="product-badge">Sale</span>' : ''}
                    <img src="${productImage}"
                         alt="${product.name}"
                         class="product-image"
                         onerror="this.onerror=null; this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Crect fill=\"%23f0f0f0\" width=\"100\" height=\"100\"/%3E%3Ctext fill=\"%23666\" font-family=\"sans-serif\" font-size=\"12\" dy=\".4em\" text-anchor=\"middle\" x=\"50\" y=\"50\"%3ENo Image%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="product-details">
                    <h3 class="product-title">${highlightedName}</h3>
                    <div class="product-info">
                        <div class="product-price">${formattedPrice}</div>
                        <div class="product-meta">
                            <div class="product-rating">${starsHtml} ${product.rating || '0'}</div>
                            <div class="delivery-time">${deliveryTime}</div>
                        </div>
                    </div>
                    <div class="product-actions">
                        <div class="product-actions">
                            <a href="${productLink}" target="_blank" class="btn btn-primary">
                                <i class="fas fa-shopping-cart"></i> Buy Now <span class="retailer-name">(${retailerName})</span>
                            </a>
                        </div>`;
                   
        }
    });

    resultsContainer.innerHTML = html;
    resultsContainer.className = currentView === 'grid' ? 'results-grid' : 'results-list';
}

// Search products function
async function searchProducts() {
    const term = searchTermInput.value.trim();
    const category = categorySelect.value;
    const sortBy = sortBySelect.value;

    if (!term && !category) {
        alert('Please enter a search term or select a category');
        return;
    }

    showLoading();

    try {
        const params = new URLSearchParams();
        if (term) params.append('term', term);
        if (category) params.append('category', category);
        if (sortBy) params.append('sort', sortBy);

        const response = await fetch(`https://shopcheap.onrender.com/search?${params.toString()}`);

        if (!response.ok) throw new Error('Network response was not ok');

        const products = await response.json();
        displayResults(products, term);
    } catch (error) {
        console.error('Error:', error);
        loadingIndicator.style.display = 'none';
        resultsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading products. Please try again later.</p>
            </div>`;
    }
}

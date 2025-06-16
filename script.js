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
let currentView = 'list';

// Event Listeners
searchButton.addEventListener('click', searchProducts);
searchTermInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') searchProducts();
});
gridViewButton.addEventListener('click', () => switchView('grid'));
listViewButton.addEventListener('click', () => switchView('list'));

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    listViewButton.classList.add('active');
    gridViewButton.classList.remove('active');
    resultsContainer.className = 'results-list';
    noResultsMessage.style.display = 'flex';
});

// View Toggle Function
function switchView(view) {
    if (view === currentView) return;
    currentView = view;

    gridViewButton.classList.toggle('active', view === 'grid');
    listViewButton.classList.toggle('active', view === 'list');
    resultsContainer.className = view === 'grid' ? 'results-grid' : 'results-list';

    // Re-render current results if any exist
    const productCards = resultsContainer.querySelectorAll('.product-card, .product-card-list');
    if (productCards.length > 0) {
        const currentTerm = searchTermInput.value.trim();
        const products = Array.from(productCards).map(card => ({
            id: card.dataset.productId,
            name: card.querySelector('.product-title').textContent,
            price: parseFloat(card.querySelector('.product-price').textContent.replace(/[^0-9.]/g, '')),
            rating: parseFloat(card.querySelector('.product-rating').textContent.trim().split(' ')[0]),
            retailer: card.querySelector('.retailer-name')?.textContent.replace(/[()]/g, '').trim() || 'Unknown Retailer',
            prod_url: card.querySelector('.btn-primary').href,
            image_url: card.querySelector('.product-image').src,
            onSale: card.querySelector('.product-badge') !== null,
            DeliveryTime: card.querySelector('.delivery-time')?.textContent || ''
        }));

        displayResults(products, currentTerm);
    }
}

// Format price
function formatPrice(price) {
    return price?.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) || 'N/A';
}

// Highlight search terms
function highlightText(text, searchTerm) {
    if (!searchTerm || !text) return text;
    const words = searchTerm.split(/\s+/).filter(w => w.length > 2);
    if (words.length === 0) return text;
    
    const pattern = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    return text.replace(pattern, '<span class="highlight">$1</span>');
}

// Show loading state
function showLoading() {
    loadingIndicator.style.display = 'flex';
    resultsContainer.innerHTML = '';
    noResultsMessage.style.display = 'none';
}

// Display results
function displayResults(products, searchTerm) {
    loadingIndicator.style.display = 'none';

    if (!products?.length) {
        noResultsMessage.style.display = 'flex';
        resultsContainer.innerHTML = '';
        return;
    }

    noResultsMessage.style.display = 'none';
    resultsContainer.innerHTML = products.map((product, index) => {
        const productId = product.id || `prod-${index}-${Date.now()}`;
        const stars = Array(5).fill(0)
            .map((_, i) => `<i class="fas fa-star${i < Math.round(product.rating || 0) ? '' : '-empty'}"></i>`)
            .join('');

        const productHTML = currentView === 'grid' ? `
            <div class="product-card" data-product-id="${productId}" data-retailer="${product.retailer}">
                <div class="product-image-container">
                    ${product.onSale ? '<span class="product-badge">Sale</span>' : ''}
                    <img src="${product.image_url || ''}" alt="${product.name}" class="product-image" loading="lazy"
                         onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Crect fill=\"%23f0f0f0\" width=\"100\" height=\"100\"/%3E%3Ctext fill=\"%23666\" font-family=\"sans-serif\" font-size=\"12\" dy=\".4em\" text-anchor=\"middle\" x=\"50\" y=\"50\"%3ENo Image%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="product-details">
                    <h3 class="product-title">${highlightText(product.name, searchTerm)}</h3>
                    <div class="product-price">${formatPrice(product.price)}</div>
                    <div class="product-meta">
                        <div class="product-rating">${stars} ${product.rating || '0'}</div>
                        <div class="delivery-time">${product.DeliveryTime}</div>
                    </div>
                    <div class="product-actions">
                        <a href="${product.prod_url || '#'}" target="_blank" class="btn btn-primary">
                            <i class="fas fa-shopping-cart"></i> Buy Now <span class="retailer-name">(${product.retailer})</span>
                        </a>
                    </div>
                </div>
            </div>
        ` : `
            <div class="product-card-list" data-product-id="${productId}" data-retailer="${product.retailer}">
                <div class="product-image-container">
                    ${product.onSale ? '<span class="product-badge">Sale</span>' : ''}
                    <img src="${product.image_url || ''}" alt="${product.name}" class="product-image" loading="lazy"
                         onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Crect fill=\"%23f0f0f0\" width=\"100\" height=\"100\"/%3E%3Ctext fill=\"%23666\" font-family=\"sans-serif\" font-size=\"12\" dy=\".4em\" text-anchor=\"middle\" x=\"50\" y=\"50\"%3ENo Image%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="product-details">
                    <h3 class="product-title">${highlightText(product.name, searchTerm)}</h3>
                    <div class="product-info">
                        <div class="product-price">${formatPrice(product.price)}</div>
                        <div class="product-meta">
                            <div class="product-rating">${stars} ${product.rating || '0'}</div>
                            <div class="delivery-time">${product.DeliveryTime}</div>
                        </div>
                    </div>
                    <div class="product-actions">
                        <a href="${product.prod_url || '#'}" target="_blank" class="btn btn-primary">
                            <i class="fas fa-shopping-cart"></i> Buy Now <span class="retailer-name">(${product.retailer})</span>
                        </a>
                    </div>
                </div>
            </div>
        `;

        return productHTML;
    }).join('');

    resultsContainer.className = currentView === 'grid' ? 'results-grid' : 'results-list';
}

// Search products
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

        const response = await fetch(`http://localhost:3000/search?${params.toString()}`);
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

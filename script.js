// Product Comparison Tool - Script.js
// Enhanced with error handling, debugging, and performance improvements

// DOM Elements
const searchInput = document.getElementById('searchTerm');
const categorySelect = document.getElementById('category');
const sortSelect = document.getElementById('sortBy');
const resultsDiv = document.getElementById('results');

// Configuration
const API_BASE_URL = 'https://shopcheap.onrender.com';
const DEBOUNCE_DELAY = 500; // milliseconds

// Initialize the application
function init() {
    setupEventListeners();
    console.log('Application initialized');
}

// Set up all event listeners
function setupEventListeners() {
    // Debounced search on input
    searchInput.addEventListener('input', debounce(handleSearch, DEBOUNCE_DELAY));
    
    // Immediate search on filter changes
    categorySelect.addEventListener('change', handleSearch);
    sortSelect.addEventListener('change', handleSearch);
    
    // Search on Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Test API connection on load
    window.addEventListener('load', testAPIConnection);
}

// Test if API is reachable
async function testAPIConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/test`);
        const data = await response.json();
        console.log('API Connection Test:', data);
    } catch (error) {
        console.error('API Connection Failed:', error);
        showError('Failed to connect to the server. Please try again later.');
    }
}

// Main search handler
async function handleSearch() {
    const searchParams = getSearchParams();
    
    showLoadingState();
    logSearchParameters(searchParams);
    
    try {
        const products = await fetchProducts(searchParams);
        
        if (products.length === 0) {
            showNoResultsMessage(searchParams.term);
        } else {
            displayResults(products);
        }
    } catch (error) {
        console.error('Search Error:', error);
        showError(error.message);
    }
}

// Get current search parameters
function getSearchParams() {
    return {
        term: searchInput.value.trim(),
        category: categorySelect.value,
        sort: sortSelect.value
    };
}

// Show loading state
function showLoadingState() {
    resultsDiv.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Searching products...</p>
        </div>`;
}

// Fetch products from API
async function fetchProducts({ term, category, sort }) {
    const url = new URL(`${API_BASE_URL}/search`);
    const params = new URLSearchParams();
    
    if (term) params.append('term', term);
    if (category) params.append('category', category);
    if (sort) params.append('sort', sort);
    
    url.search = params.toString();
    
    console.log('Fetching from:', url.toString());
    
    const response = await fetch(url);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
    }
    
    return await response.json();
}

// Display results in a table
function displayResults(products) {
    if (!products || !Array.isArray(products)) {
        throw new Error('Invalid products data received');
    }

    const tableHeaders = [
        'Name', 'Price', 'Store', 'Link', 'Image', 'Delivery', 'Fees', 'Rating'
    ];

    let html = `
        <div class="results-container">
            <p class="results-count">Found ${products.length} products</p>
            <div class="table-scroll">
                <table>
                    <thead>
                        <tr>${tableHeaders.map(h => `<th>${h}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
                        ${products.map(product => createProductRow(product)).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
    
    resultsDiv.innerHTML = html;
}

// Create HTML for a single product row
function createProductRow(product) {
    return `
        <tr>
            <td data-label="Name">${escapeHTML(product.name) || 'N/A'}</td>
            <td data-label="Price">${formatPrice(product.price)}</td>
            <td data-label="Store">${escapeHTML(product.siteName) || 'N/A'}</td>
            <td data-label="Link">${createProductLink(product.prodUrl)}</td>
            <td data-label="Image">${createProductImage(product)}</td>
            <td data-label="Delivery">${escapeHTML(product.DeliveryTime) || 'N/A'}</td>
            <td data-label="Fees">${escapeHTML(product.DeliveryFees) || 'N/A'}</td>
            <td data-label="Rating">${formatRating(product.rating)}</td>
        </tr>`;
}

// Helper function to create product image HTML
function createProductImage(product) {
    if (!product.img) {
        return `<div class="image-placeholder">No Image</div>`;
    }
    
    return `
        <div class="image-container">
            <img src="${escapeHTML(product.img)}"
                 alt="${escapeHTML(product.name) || 'Product image'}"
                 class="product-image"
                 loading="lazy"
                 onerror="this.onerror=null;this.classList.add('broken-image');
                          this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Crect fill=\"%23f0f0f0\" width=\"100\" height=\"100\"/%3E%3Ctext fill=\"%23666\" font-family=\"sans-serif\" font-size=\"12\" dy=\".4em\" text-anchor=\"middle\" x=\"50\" y=\"50\"%3ENo Image%3C/text%3E%3C/svg%3E'">
        </div>`;
}

// Helper function to create product link
function createProductLink(url) {
    if (!url) return 'N/A';
    
    return `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">
                View Product
            </a>`;
}

// Show no results message
function showNoResultsMessage(searchTerm) {
    resultsDiv.innerHTML = `
        <div class="no-results">
            <p>No products found for "${escapeHTML(searchTerm)}"</p>
            <p>Try different search terms or filters.</p>
        </div>`;
}

// Show error message
function showError(message) {
    resultsDiv.innerHTML = `
        <div class="error">
            <p>${escapeHTML(message)}</p>
            <button onclick="handleSearch()" class="retry-button">
                Retry Search
            </button>
        </div>`;
}

// Utility function to debounce rapid calls
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Utility function to escape HTML
function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Format price with currency symbol
function formatPrice(price) {
    if (!price && price !== 0) return 'N/A';
    return `$${parseFloat(price).toFixed(2)}`;
}

// Format rating out of 5
function formatRating(rating) {
    if (!rating) return 'N/A';
    return `${parseFloat(rating).toFixed(1)}/5`;
}

// Log search parameters for debugging
function logSearchParameters(params) {
    console.log('Search Parameters:', {
        term: params.term || '(empty)',
        category: params.category || 'All Categories',
        sort: params.sort || 'Default'
    });
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);

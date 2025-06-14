// Debounce function
function debounce(func, delay) {
    let timeoutId;
    return function() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, arguments), delay);
    };
}

// Search products function
async function searchProducts() {
    const term = document.getElementById('searchTerm').value.trim();
    const category = document.getElementById('category').value;
    const sortBy = document.getElementById('sortBy').value;
    const resultsDiv = document.getElementById('results');
    
    resultsDiv.innerHTML = '<div class="loading">Searching...</div>';
    
    try {
        const apiUrl = `https://shopcheap.onrender.com/search?term=${encodeURIComponent(term)}&category=${encodeURIComponent(category)}&sort=${sortBy}`;
        console.log("Making request to:", apiUrl);  // Debug
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
        console.log("Received products:", products);  // Debug
        displayResults(products);
    } catch (error) {
        console.error('Search error:', error);
        resultsDiv.innerHTML = `
            <div class="error">
                <p>Error: ${error.message}</p>
                <button onclick="searchProducts()">Retry</button>
            </div>`;
    }
}

// Initialize the search
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchTerm').addEventListener('input', debounce(searchProducts, 500));
    document.getElementById('searchTerm').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchProducts();
    });
    document.getElementById('category').addEventListener('change', searchProducts);
    document.getElementById('sortBy').addEventListener('change', searchProducts);
});

// displayResults function remains the same as before

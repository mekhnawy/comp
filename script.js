async function searchProducts() {
    const term = document.getElementById('searchTerm').value;
    const category = document.getElementById('category').value;
    const sortBy = document.getElementById('sortBy').value;

    try {
        const response = await fetch(
            `https://shopcheap.onrender.com/search?term=${encodeURIComponent(term)}&category=${encodeURIComponent(category)}&sort=${sortBy}`
        ); //http://localhost:3000

        if (!response.ok) throw new Error('Network response was not ok');

        const products = await response.json();
        displayResults(products, term);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('results').innerHTML =
            '<p class="error">Error loading data. Please try again.</p>';
    }
}

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;

    const words = searchTerm.split(' ');
    let highlighted = text;

    words.forEach(word => {
        if (word.length > 0) {
            const regex = new RegExp(`(${word})`, 'gi');
            highlighted = highlighted.replace(regex, '<span class="highlight">$1</span>');
        }
    });

    return highlighted;
}

function formatPrice(price) {
    // Handle cases where price might be null or undefined
    if (price === null || price === undefined) return 'N/A';

    // Convert to number if it's a string
    const num = typeof price === 'string' ? parseFloat(price) : price;

    // Format with thousand separators and 2 decimal places
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function displayResults(products, searchTerm) {
    const resultsDiv = document.getElementById('results');

    if (products.length === 0) {
        resultsDiv.innerHTML = "<p>No products found.</p>";
        return;
    }

    // Add Google Ads container
    let html = `
    <div class="ad-container">
        <!-- Google Ads will be placed here -->
        <div style="width: 100%; height: 90px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <p>Google Ad Space</p>
        </div>
    </div>
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Retailer</th>
                <th>Link</th>
                <th>Image</th>
                <th>Rating</th>
            </tr>
        </thead>
        <tbody>`;

    products.forEach(product => {
        const productLink = product.prod_url
            ? `<a href="${product.prod_url}" target="_blank">View Product</a>`
            : 'N/A';

        let productImage;
        if (product.image_url) {
            productImage = `
                <div class="image-container">
                    <img src="${product.image_url}"
                         alt="${product.name}"
                         class="product-image"
                         onerror="this.onerror=null;
                                  this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Crect fill=\"%23f0f0f0\" width=\"100\" height=\"100\"/%3E%3Ctext fill=\"%23666\" font-family=\"sans-serif\" font-size=\"12\" dy=\".4em\" text-anchor=\"middle\" x=\"50\" y=\"50\"%3ENo Image%3C/text%3E%3C/svg%3E';
                                  this.classList.add('broken-image')">
                </div>`;
        } else {
            productImage = `
                <div class="image-container">
                    <div class="image-placeholder">No Image</div>
                </div>`;
        }

        // Highlight matching words in product name
        const highlightedName = highlightText(product.name, searchTerm);
        const formattedPrice = formatPrice(product.price);

        html += `<tr>
            <td>${highlightedName}</td>
            <td>${formattedPrice}</td>
            <td>${product.retailer}</td>
            <td>${productLink}</td>
            <td>${productImage}</td>
            <td>${product.rating}</td>

        </tr>`;
    });

    html += `</tbody></table>`;
    resultsDiv.innerHTML = html;
}
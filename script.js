async function searchProducts() {
    const term = document.getElementById('searchTerm').value;
    const category = document.getElementById('category').value;
    const sortBy = document.getElementById('sortBy').value; // Get selected sort option

    try {
        const response = await fetch(
            `https://shopcheap.onrender.com//search?term=${encodeURIComponent(term)}&category=${encodeURIComponent(category)}&sort=${sortBy}`
        );

        if (!response.ok) throw new Error('Network response was not ok');

        const products = await response.json();
        displayResults(products);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('results').innerHTML =
            '<p class="error">Error loading data. Please try again.</p>';
    }
}

function displayResults(products) {
    const resultsDiv = document.getElementById('results');
    
    if (products.length === 0) {
        resultsDiv.innerHTML = "<p>No products found.</p>";
        return;
    }

    let html = `<table>
        <thead>
            <tr>
                <th>Name</th>
                <th>price</th>
                <th>siteName</th>
                <th>prodUrl</th>
                <th>img</th>
                <th>DeliveryTime</th>
                <th>DeliveryFees</th>
                <th>Rating</th>
            </tr>
        </thead>
        <tbody>`;
    
    products.forEach(product => {
          // Create clickable link if URL exists
        const productLink = product.prodUrl
            ? `<a href="${product.prodUrl}" target="_blank">View Product on the orginal site</a>`
            : 'N/A';

              // Image with error handling and placeholder
        let productImage;
        if (product.img) {
            productImage = `
                <div class="image-container">
                    <img src="${product.img}"
                         alt="${product.name}"
                         class="product-image"
                         onerror="this.onerror=null;
                                  this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Crect fill=\"%23f0f0f0\" width=\"100\" height=\"100\"/%3E%3Ctext fill=\"%23666\" font-family=\"sans-serif\" font-size=\"12\" dy=\".4em\" text-anchor=\"middle\" x=\"50\" y=\"50\"%3ENo Image%3C/text%3E%3C/svg%3E';
                                  this.classList.add('broken-image')">
                </div>`;
        } else {
            imageDisplay = `
                <div class="image-container">
                    <div class="image-placeholder">No Image</div>
                </div>`;
        }

        html += `<tr>
            <td>${product.name}</td>
            <td>${product.price}</td>
            <td>${product.siteName}</td>
            <td>${productLink}</td>
            <td>${productImage}</td>
            <td>${product.DeliveryTime}</td>
            <td>${product.DeliveryFees}</td>
            <td>${product.rating}/5</td>
        </tr>`;
    });
    
    html += `</tbody></table>`;
    resultsDiv.innerHTML = html;
}

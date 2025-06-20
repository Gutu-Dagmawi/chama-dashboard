const API_BASE_URL = 'http://localhost:3000';

document.getElementById('toggleBtn')?.addEventListener('click', function() {
  document.getElementById('sidebar')?.classList.toggle('show');
});

const productsTableView = document.getElementById('productsTableView');
const addProductView = document.getElementById('addProductView');
const addProductBtn = document.getElementById('addProductBtn');
const cancelAddProductBtn = document.getElementById('cancelAddProductBtn');
const navProducts = document.getElementById('nav-products');
const mainTitle = document.getElementById('main-title');
const navVariants = document.getElementById('nav-variants');
const variantsTableView = document.getElementById('variantsTableView');
const productDetailView = document.getElementById('productDetailView');
const backToProductsBtn = document.getElementById('backToProductsBtn');
const productsTableBody = document.getElementById('productsTableBody');

async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    alert('Failed to load products. Please try again later.');
    return [];
  }
}

async function renderProducts() {
  const products = await fetchProducts();
  if (!productsTableBody) return;

  // Clear existing rows
  productsTableBody.innerHTML = '';

  if (products.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td colspan="7" class="text-center py-4">No products found</td>
    `;
    productsTableBody.appendChild(row);
    return;
  }

  // Add product rows
  products.forEach(product => {
    const row = document.createElement('tr');
    const variant = product.variants && product.variants.length > 0 ? product.variants[0] : {};
    const imageUrl = variant.images && variant.images.length > 0 ? variant.images[0] : 'https://via.placeholder.com/50';
    
    row.dataset.productId = product.id;
    row.innerHTML = `
      <td>
        <div class="product-cell">
          <img src="${imageUrl}" alt="${product.name}" class="product-img" onerror="this.src='https://via.placeholder.com/50'">
          <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-sku text-muted small">#${variant.sku || 'N/A'}</div>
          </div>
        </div>
      </td>
      <td>${product.brand || 'N/A'}</td>
      <td>${product.type || 'N/A'}</td>
      <td>$${parseFloat(product.base_price || 0).toFixed(2)}</td>
      <td>
        <div class="stock-status">
          <span class="status-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
            ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
          <span>${product.stock || 0} units</span>
        </div>
      </td>
      <td>${product.gender || 'Unisex'}</td>
      <td>
        <div class="dropdown">
          <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-three-dots-vertical"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item view-product" href="#"><i class="bi bi-eye me-2"></i>View</a></li>
            <li><a class="dropdown-item edit-product" href="#"><i class="bi bi-pencil me-2"></i>Edit</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger delete-product" href="#"><i class="bi bi-trash me-2"></i>Delete</a></li>
          </ul>
        </div>
      </td>
    `;
    productsTableBody.appendChild(row);
  });
}

function showProductsTable() {
  productsTableView.style.display = '';
  addProductView.style.display = 'none';
  mainTitle.textContent = 'Products';
  navProducts.classList.add('active');
  if (variantsTableView) variantsTableView.style.display = 'none';
}

function showAddProductForm() {
  productsTableView.style.display = 'none';
  addProductView.style.display = '';
  mainTitle.textContent = 'Add Product';
  navProducts.classList.remove('active');
  // Reset form and variants
  currentProductId = null;
  productForm.reset();
  variantsContainer.innerHTML = '';
  variantIndex = 0;
  // Update submit button text
  const submitBtn = productForm.querySelector('button[type="submit"]');
  submitBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Submit Product';
}

function showVariantsTable() {
  productsTableView.style.display = 'none';
  addProductView.style.display = 'none';
  variantsTableView.style.display = '';
  mainTitle.textContent = 'Variants';
  navProducts.classList.remove('active');
  navVariants.classList.add('active');
}

if (addProductBtn) {
  addProductBtn.addEventListener('click', showAddProductForm);
}
if (cancelAddProductBtn) {
  cancelAddProductBtn.addEventListener('click', showProductsTable);
}
if (navProducts) {
  navProducts.addEventListener('click', showProductsTable);
}
if (navVariants) {
  navVariants.addEventListener('click', showVariantsTable);
}
// Initialize the page
function init() {
  // Show table by default
  showProductsTable();
  
  // Load products from API
  renderProducts();
}

document.addEventListener('DOMContentLoaded', function() {
  init();
  renderProducts(); // Load products when the page loads
});

// Store current product ID when editing
let currentProductId = null;

function loadProductForEdit(productData) {
  currentProductId = productData.id;
  // Show the form
  productsTableView.style.display = 'none';
  addProductView.style.display = '';
  navProducts.classList.remove('active');
  // Update form title and button
  mainTitle.textContent = 'Edit Product';
  const submitBtn = productForm.querySelector('button[type="submit"]');
  submitBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Update Product';
  // Fill in product details
  const fields = ['name', 'type', 'description', 'brand', 'gender', 'category_id'];
  fields.forEach(field => {
    const input = productForm.querySelector(`[name="product[${field}]"]`);
    if (input && productData[field] !== undefined) {
      input.value = productData[field];
    }
  });
  // Set price
  const priceInput = productForm.querySelector('[name="product[base_price]"]');
  if (priceInput && productData.price !== undefined) {
    priceInput.value = productData.price;
  }
  // Clear existing variants
  variantsContainer.innerHTML = '';
  variantIndex = 0;
  // Add variants
  if (productData.variants && productData.variants.length > 0) {
    productData.variants.forEach((variant, idx) => {
      const row = createVariantRow(idx);
      variantsContainer.appendChild(row);
      // Fill variant data
      const rowInputs = row.querySelectorAll('input');
      rowInputs.forEach(input => {
        const name = input.name;
        if (name.includes('[sku]')) {
          input.value = variant.sku || '';
        } else if (name.includes('[color]')) {
          input.value = variant.color || '#000000';
        } else if (name.includes('[size]')) {
          input.value = variant.size || '';
        }
      });
      variantIndex++;
    });
  } else {
    // Add at least one variant row
    const row = createVariantRow(variantIndex);
    variantsContainer.appendChild(row);
    variantIndex++;
  }
}

if (productsTableBody) {
  productsTableBody.addEventListener('click', function(e) {
  const dropdownItem = e.target.closest('.dropdown-item');
  if (dropdownItem) {
    e.preventDefault();
    const row = dropdownItem.closest('tr');
    if (dropdownItem.querySelector('.bi-pencil') || dropdownItem.textContent.includes('Edit')) {
      // Edit product
      const productData = {
        id: row.dataset.productId || '1', // Default to 1 for demo
        name: row.querySelector('.product-name').textContent,
        brand: row.cells[1].textContent,
        type: row.cells[2].textContent,
        price: parseFloat(row.cells[3].textContent.replace('$', '')),
        description: row.querySelector('.product-name').textContent,
        gender: 'unisex',
        category_id: 1,
        variants: [{
          sku: row.querySelector('.product-sku').textContent.replace('#', ''),
          color: '#000000',
          size: 42
        }]
      };
      loadProductForEdit(productData);
      return;
    } else if (dropdownItem.querySelector('.bi-trash') || dropdownItem.textContent.includes('Delete')) {
      // Delete product
      if (confirm('Are you sure you want to delete this product?')) {
        // In a real app, you would make an API call to delete the product
        row.remove();
        // Reset form if the deleted product was being edited
        if (currentProductId === row.dataset.productId) {
          currentProductId = null;
          productForm.reset();
          variantsContainer.innerHTML = '';
          variantIndex = 0;
        }
      }
      return;
    } else if (dropdownItem.querySelector('.bi-eye') || dropdownItem.textContent.includes('View')) {
      // View product details
      const productData = {
        img: row.querySelector('.product-img')?.src,
        name: row.querySelector('.product-name')?.textContent,
        brand: row.cells[1]?.textContent,
        category: row.cells[2]?.textContent,
        price: parseFloat(row.cells[3]?.textContent.replace('$', '')),
        stock: row.querySelector('.stock-status span:last-child')?.textContent.trim() || '',
        status: row.querySelector('.status-badge')?.textContent.trim() || '',
        description: row.querySelector('.product-sku')?.textContent || '',
      };
      showProductDetail(productData);
      return;
    }
  }
  handleDirectButtonClicks(e);
});

function handleDirectButtonClicks(e) {
  if (e.target.closest('.btn-outline-info')) {
    const row = e.target.closest('tr');
    const productName = row.querySelector('.product-name').textContent;
    alert(`Viewing details for: ${productName}`);
  } else if (e.target.closest('.btn-outline-warning')) {
    const row = e.target.closest('tr');
    const productData = {
      id: row.dataset.productId || '1',
      name: row.querySelector('.product-name').textContent,
      brand: row.cells[1].textContent,
      price: parseFloat(row.cells[3].textContent.replace('$', '')),
      type: row.cells[2].textContent,
      description: row.querySelector('.product-name').textContent,
      gender: 'unisex',
      category_id: 1,
      variants: [{
        sku: row.querySelector('.product-sku').textContent.replace('#', ''),
        color: '#000000',
        size: 42
      }]
    };
    loadProductForEdit(productData);
  } else if (e.target.closest('.btn-outline-danger')) {
    if (confirm('Are you sure you want to delete this product?')) {
      const row = e.target.closest('tr');
      row.remove();
      if (currentProductId === row.dataset.productId) {
        currentProductId = null;
        productForm.reset();
        variantsContainer.innerHTML = '';
        variantIndex = 0;
      }
    }
  }
}

// Dynamic Variants Logic
let variantIndex = 0;
const variantsContainer = document.getElementById('variantsContainer');
const addVariantBtn = document.getElementById('addVariantBtn');

function createVariantRow(index) {
  const row = document.createElement('div');
  row.className = 'row g-2 align-items-end mb-2 variant-row';
  row.dataset.index = index;
  row.innerHTML = `
    <div class="col-md-3">
      <label class="form-label">SKU</label>
      <input type="text" class="form-control" name="product[variants_attributes][${index}][sku]" required>
    </div>
    <div class="col-md-3">
      <label class="form-label">Color</label>
      <input type="color" class="form-control form-control-color" name="product[variants_attributes][${index}][color]" value="#000000" required>
    </div>
    <div class="col-md-2">
      <label class="form-label">Size</label>
      <input type="number" class="form-control" name="product[variants_attributes][${index}][size]" required>
    </div>
    <div class="col-md-3">
      <label class="form-label">Images</label>
      <input type="file" class="form-control" name="variant_images[${index}][]" multiple accept="image/*">
    </div>
    <div class="col-md-1">
      <button type="button" class="btn btn-danger btn-remove-variant">&times;</button>
    </div>
  `;
  return row;
}

if (addVariantBtn) {
  addVariantBtn.addEventListener('click', function() {
    const row = createVariantRow(variantIndex);
    variantsContainer.appendChild(row);
    variantIndex++;
  });
}

if (variantsContainer) {
  variantsContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-remove-variant')) {
      e.target.closest('.variant-row').remove();
    }
  });
}

// Form submission: build FormData to match required structure
const productForm = document.getElementById('productForm');
if (productForm) {
  productForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Prepare form data with proper structure
    const formData = new FormData();
    
    // Set default product type
    const productType = 'Shoe';
    
    // Debug: Log all form elements
    console.log('Form elements:', Array.from(productForm.elements).map(el => ({
      name: el.name,
      value: el.value,
      type: el.type
    })));

    // Helper function to safely get form field value
    const getFormValue = (fieldName) => {
      const element = productForm.querySelector(`[name="${fieldName}"]`);
      if (!element) {
        console.error(`Form field not found: ${fieldName}`);
        return null;
      }
      return element.value;
    };

    // Prepare product data object with null checks and default values
    const productData = {
      product: {
        name: getFormValue('product[name]'),
        type: productType, // Set default type to 'Shoe'
        base_price: parseFloat(getFormValue('product[base_price]') || 0),
        description: getFormValue('product[description]'),
        brand: getFormValue('product[brand]'),
        gender: getFormValue('product[gender]'),
        category_id: parseInt(getFormValue('product[category_id]') || 0),
        variants_attributes: []
      }
    };
    
    console.log('Prepared product data:', productData);

    // Process variant rows
    const variantRows = variantsContainer.querySelectorAll('.variant-row');
    variantRows.forEach(row => {
      const variant = {
        sku: row.querySelector('[name$="[sku]"]').value,
        color: row.querySelector('[name$="[color]"]').value,
        size: row.querySelector('[name$="[size]"]').value,
        variant_stock: row.querySelector('[name$="[stock]"]')?.value || '0'
      };
      
      // Include variant ID if editing
      const variantId = row.dataset.variantId;
      if (variantId) {
        variant.id = variantId;
      }
      
      productData.product.variants_attributes.push(variant);
      
      // Handle file uploads
      const fileInput = row.querySelector('input[type="file"]');
      if (fileInput?.files.length > 0) {
        Array.from(fileInput.files).forEach(file => {
          formData.append(`variant_images[${variant.sku}][]`, file);
        });
      }
    });
    
    // Add product data as JSON string
    formData.append('product', JSON.stringify(productData.product));
    
    // Add product ID if editing
    if (currentProductId) {
      formData.append('id', currentProductId);
    }
    
    // Determine the API endpoint and method
    const method = currentProductId ? 'PATCH' : 'POST';
    const endpoint = currentProductId 
      ? `${API_BASE_URL}/products/${currentProductId}.json` 
      : `${API_BASE_URL}/products.json`;
    
    // Log form data before sending
    console.log('Form data being sent:', Object.fromEntries(formData.entries()));
    console.log('Sending', method, 'request to:', endpoint);
    
    // Submit form data
    fetch(endpoint, { 
      method: method,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || ''
      },
      credentials: 'include',
      body: formData
    })
    .then(response => {
      console.log('Response status:', response.status, response.statusText);
      if (!response.ok) {
        return response.text().then(text => {
          console.error('Error response:', text);
          throw new Error(`HTTP error! status: ${response.status}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      alert(`Product ${currentProductId ? 'updated' : 'created'} successfully!`);
      showProductsTable();
      
      // Reset form if it was a creation
      if (!currentProductId) {
        productForm.reset();
        variantsContainer.innerHTML = ''; // Clear variants
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert(`Error ${currentProductId ? 'updating' : 'creating'} product: ${error.message}`);
    });
  });
}

// ... (rest of the code remains the same)
if (variantsTableBody) {
  variantsTableBody.addEventListener('click', function(e) {
    const dropdownItem = e.target.closest('.dropdown-item');
    if (dropdownItem) {
      e.preventDefault();
      const row = dropdownItem.closest('tr');
      if (dropdownItem.querySelector('.bi-pencil') || dropdownItem.textContent.includes('Edit')) {
        // Edit variant: show form, pre-fill variant section only
        productsTableView.style.display = 'none';
        variantsTableView.style.display = 'none';
        addProductView.style.display = '';
        mainTitle.textContent = 'Edit Variant';
        navProducts.classList.remove('active');
        navVariants.classList.remove('active');
        // Hide/disable product fields
        const productFields = productForm.querySelectorAll('.row.g-3 input, .row.g-3 select');
        productFields.forEach(f => { f.disabled = true; f.closest('.col-md-6, .col-md-4, .col-md-8').style.display = 'none'; });
        // Clear variants and add only the selected one
        variantsContainer.innerHTML = '';
        variantIndex = 0;
        const variantData = {
          sku: row.cells[0].textContent.trim(),
          color: row.cells[1].querySelector('span').style.background,
          size: row.cells[2].textContent.trim(),
        };
        const vRow = createVariantRow(variantIndex);
        variantsContainer.appendChild(vRow);
        // Fill variant data
        const skuInput = vRow.querySelector('[name*="[sku]"]');
        const colorInput = vRow.querySelector('[name*="[color]"]');
        const sizeInput = vRow.querySelector('[name*="[size]"]');
        if (skuInput) skuInput.value = variantData.sku;
        if (colorInput) colorInput.value = rgbToHex(variantData.color);
        if (sizeInput) sizeInput.value = variantData.size;
        variantIndex++;
        // Update submit button text
        const submitBtn = productForm.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Update Variant';
        return;
      } else if (dropdownItem.querySelector('.bi-trash') || dropdownItem.textContent.includes('Delete')) {
        if (confirm('Are you sure you want to delete this variant?')) {
          row.remove();
        }
        return;
      } else if (dropdownItem.querySelector('.bi-eye') || dropdownItem.textContent.includes('View')) {
        alert(`Viewing details for: ${row.cells[0].textContent.trim()}`);
        return;
      }
    }
  });
}
function rgbToHex(rgb) {
  if (!rgb) return '#000000';
  const result = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!result) return '#000000';
  return '#' + ((1 << 24) + (parseInt(result[1]) << 16) + (parseInt(result[2]) << 8) + parseInt(result[3])).toString(16).slice(1);
}

const logoutBtn = document.querySelector('.sidebar-footer .bi-box-arrow-right')?.closest('.nav-link');
const loginView = document.getElementById('loginView');
const loginForm = document.getElementById('loginForm');
const mainContent = document.querySelector('.main');
const sidebarWrapper = document.getElementById('sidebarWrapper');

function showLogin() {
  if (mainContent) mainContent.style.display = 'none';
  if (loginView) loginView.style.display = '';
  if (sidebarWrapper) sidebarWrapper.style.display = 'none';
}
function hideLogin() {
  if (mainContent) mainContent.style.display = '';
  if (loginView) loginView.style.display = 'none';
  if (sidebarWrapper) sidebarWrapper.style.display = '';
}
function isLoggedIn() {
  return localStorage.getItem('loggedIn') === 'true';
}
function logout() {
  localStorage.removeItem('loggedIn');
  showLogin();
}
function login() {
  localStorage.setItem('loggedIn', 'true');
  hideLogin();
}
if (logoutBtn) {
  logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    logout();
  });
}
if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if (email && password) {
      login();
    } else {
      alert('Please enter both email and password.');
    }
  });
}
// On page load, show login if not logged in
window.addEventListener('DOMContentLoaded', function() {
  if (!isLoggedIn()) {
    showLogin();
  } else {
    hideLogin();
  }
});
// Prevent navigation if not logged in
[navProducts, navVariants, navOrders, navCustomers, navReports].forEach(btn => {
  if (btn) {
    btn.addEventListener('click', function(e) {
      if (!isLoggedIn()) {
        e.preventDefault();
        showLogin();
      }
    });
  }
});

function showProductDetail(productData) {
  if (productsTableView) productsTableView.style.display = 'none';
  if (addProductView) addProductView.style.display = 'none';
  if (variantsTableView) variantsTableView.style.display = 'none';
  if (productDetailView) productDetailView.style.display = '';
  mainTitle.textContent = 'Product Details';
  navProducts.classList.remove('active');
  // Fill in product details
  const mainImg = document.getElementById('detailProductImg');
  mainImg.src = productData.img || '';
  document.getElementById('detailProductName').textContent = productData.name || '';
  document.getElementById('detailProductBrand').textContent = productData.brand || '';
  document.getElementById('detailProductCategory').textContent = productData.category || '';
  document.getElementById('detailProductPrice').textContent = productData.price ? `$${productData.price.toFixed(2)}` : '';
  document.getElementById('detailProductStock').textContent = productData.stock || '';
  document.getElementById('detailProductDescription').textContent = productData.description || '';
  const statusSpan = document.getElementById('detailProductStatus');
  statusSpan.textContent = productData.status || '';
  statusSpan.className = 'status-badge ' + (productData.status === 'Active' ? 'status-active' : 'status-inactive');
  // Render variants as circles with size
  const variants = productData.variants && productData.variants.length ? productData.variants : [
    { sku: productData.description, color: '#000', size: productData.stock, img: productData.img, status: productData.status }
  ];
  const selector = document.getElementById('detailVariantsSelector');
  selector.innerHTML = '';
  let selectedIdx = 0;
  variants.forEach((variant, idx) => {
    const vDiv = document.createElement('div');
    vDiv.className = 'd-flex flex-column align-items-center variant-selector';
    vDiv.style.cursor = 'pointer';
    vDiv.tabIndex = 0;
    vDiv.setAttribute('role', 'button');
    vDiv.setAttribute('aria-label', `Select variant ${variant.sku || ''}`);
    vDiv.innerHTML = `
      <div class="variant-circle mb-1 ${idx === 0 ? 'selected' : ''}" style="width:56px;height:56px;border-radius:50%;background:${variant.img ? '#fff' : (variant.color || '#000')};border:2px solid #e5e7eb;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden;">
        ${variant.img ? `<img src="${variant.img}" alt="${variant.sku || ''}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : `<span style='display:inline-block;width:80%;height:80%;border-radius:50%;background:${variant.color || '#000'};'></span>`}
      </div>
      <div class="small text-muted">${variant.size || ''}</div>
    `;
    vDiv.addEventListener('click', function() {
      // Remove selected from all
      selector.querySelectorAll('.variant-circle').forEach(el => el.classList.remove('selected'));
      vDiv.querySelector('.variant-circle').classList.add('selected');
      // Change main image
      if (variant.img) {
        mainImg.src = variant.img;
      } else if (variant.color) {
        mainImg.src = '';
        mainImg.style.background = variant.color;
      }
    });
    selector.appendChild(vDiv);
  });
}
}
if (backToProductsBtn) {
  backToProductsBtn.addEventListener('click', function() {
    if (productDetailView) productDetailView.style.display = 'none';
    showProductsTable();
  });
}

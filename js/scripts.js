document.getElementById('toggleBtn').addEventListener('click', function() {
  document.getElementById('sidebar').classList.toggle('show');
});

// --- Navigation Logic ---
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
// Show table by default
showProductsTable();

// Store current product ID when editing
let currentProductId = null;

// Function to load product data into the form for editing
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

// --- Products Table Actions ---
const productsTableBody = document.getElementById('productsTableBody');
productsTableBody.addEventListener('click', function(e) {
  // Handle dropdown menu item clicks
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
  
  // Handle direct button clicks (if any)
  if (e.target.closest('.btn-outline-info')) {
    const row = e.target.closest('tr');
    const productName = row.querySelector('.product-name').textContent;
    alert(`Viewing details for: ${productName}`);
  } else if (e.target.closest('.btn-outline-warning')) {
    // This handles the edit button if it's not in a dropdown
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
  }
});

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
  productForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData();

    // Add product fields
    ['name','type','base_price','description','brand','gender','category_id'].forEach(field => {
      const input = productForm.querySelector(`[name="product[${field}]"]`);
      if (input) formData.append(`product[${field}]`, input.value);
    });

    // Add variants
    const variantRows = variantsContainer.querySelectorAll('.variant-row');
    variantRows.forEach((row, idx) => {
      const sku = row.querySelector(`[name^="product[variants_attributes]["][sku]"]`).value;
      const color = row.querySelector(`[name^="product[variants_attributes]["][color]"]`).value;
      const size = row.querySelector(`[name^="product[variants_attributes]["][size]"]`).value;
      formData.append(`product[variants_attributes][][sku]`, sku);
      formData.append(`product[variants_attributes][][color]`, color);
      formData.append(`product[variants_attributes][][size]`, size);

      // Images
      const imagesInput = row.querySelector('input[type="file"]');
      if (imagesInput && imagesInput.files.length > 0) {
        for (let i = 0; i < imagesInput.files.length; i++) {
          formData.append(`variant_images[${sku}][]`, imagesInput.files[i]);
        }
      }
    });

    // Debug: log keys and values
    // for (let pair of formData.entries()) {
    //   console.log(pair[0]+ ':', pair[1]);
    // }

    // Add product ID if editing
    if (currentProductId) {
      formData.append('product[id]', currentProductId);
    }

    // Determine the API endpoint and method
    const method = currentProductId ? 'PATCH' : 'POST';
    const endpoint = currentProductId 
      ? `/api/products/${currentProductId}.json` 
      : '/api/products.json';

    // Submit form data
    fetch(endpoint, { 
      method: method,
      body: formData,
      // In a real app, you would include authentication headers
      // headers: {
      //   'X-CSRF-Token': document.querySelector('[name="csrf-token"]').content
      // }
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      // Show success message
      alert(`Product ${currentProductId ? 'updated' : 'created'} successfully!`);
      // Refresh the products list
      showProductsTable();
    })
    .catch(error => {
      console.error('Error:', error);
      alert(`Error ${currentProductId ? 'updating' : 'creating'} product. Please try again.`);
    });
  });
}

// --- Variants Table Actions ---
const variantsTableBody = document.getElementById('variantsTableBody');
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
// Helper to convert rgb/rgba to hex
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
if (backToProductsBtn) {
  backToProductsBtn.addEventListener('click', function() {
    if (productDetailView) productDetailView.style.display = 'none';
    showProductsTable();
  });
}

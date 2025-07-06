/**
 * وحدة إدارة المنتجات
 * أبوسليمان للمحاسبة - نظام إدارة نقاط البيع
 */

let currentView = 'grid';
let currentEditingProduct = null;

// تهيئة صفحة المنتجات
function initProducts() {
    loadProducts();
    loadCategories();
    setupProductForm();
}

// تحميل المنتجات
function loadProducts() {
    try {
        if (!window.db) return;

        const products = db.getTable('products');
        displayProducts(products);
        updateProductsStats();

    } catch (error) {
        console.error('خطأ في تحميل المنتجات:', error);
        showNotification('خطأ في تحميل المنتجات', 'error');
    }
}

// عرض المنتجات
function displayProducts(products) {
    try {
        if (currentView === 'grid') {
            displayProductsGrid(products);
        } else {
            displayProductsList(products);
        }
    } catch (error) {
        console.error('خطأ في عرض المنتجات:', error);
    }
}

// عرض المنتجات في الشبكة
function displayProductsGrid(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <p>لا توجد منتجات</p>
                <button class="btn primary" onclick="addProduct()">
                    <i class="fas fa-plus"></i>
                    إضافة منتج جديد
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = products.map(product => {
        const stockStatus = getStockStatus(product);
        return `
            <div class="product-card ${stockStatus.class}">
                <div class="product-image-container">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}" class="product-image">` :
                        `<div class="product-image-placeholder"><i class="fas fa-image"></i></div>`
                    }
                    <div class="product-status-badge ${stockStatus.class}">
                        ${stockStatus.text}
                    </div>
                </div>
                
                <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <p class="product-category">${product.category || 'غير محدد'}</p>
                    <p class="product-price">${formatCurrency(product.price)}</p>
                    <p class="product-stock">المخزون: ${toArabicNumbers(product.quantity)}</p>
                </div>
                
                <div class="product-actions">
                    <button class="btn btn-sm info" onclick="viewProductDetails('${product.id}')" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm primary" onclick="editProduct('${product.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm error" onclick="deleteProduct('${product.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// عرض المنتجات في القائمة
function displayProductsList(products) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="no-products">
                        <i class="fas fa-box-open"></i>
                        <p>لا توجد منتجات</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = products.map(product => {
        const stockStatus = getStockStatus(product);
        return `
            <tr>
                <td>
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}" class="table-product-image">` :
                        `<div class="table-product-placeholder"><i class="fas fa-image"></i></div>`
                    }
                </td>
                <td>
                    <div class="product-name-cell">
                        <strong>${product.name}</strong>
                        ${product.barcode ? `<br><small>الباركود: ${product.barcode}</small>` : ''}
                    </div>
                </td>
                <td>${product.category || 'غير محدد'}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${toArabicNumbers(product.quantity)}</td>
                <td>
                    <span class="status-badge ${stockStatus.class}">
                        ${stockStatus.text}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm info" onclick="viewProductDetails('${product.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm primary" onclick="editProduct('${product.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm error" onclick="deleteProduct('${product.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// الحصول على حالة المخزون
function getStockStatus(product) {
    const minStock = product.minStock || 5;
    
    if (product.quantity <= 0) {
        return { class: 'out-of-stock', text: 'نفد المخزون' };
    } else if (product.quantity <= minStock) {
        return { class: 'low-stock', text: 'مخزون منخفض' };
    } else {
        return { class: 'available', text: 'متوفر' };
    }
}

// تحميل الفئات
function loadCategories() {
    try {
        if (!window.db) return;

        const products = db.getTable('products');
        const categories = [...new Set(products.map(p => p.category).filter(c => c))];
        
        // تحديث فلتر الفئات
        const categoryFilter = document.getElementById('categoryFilterSelect');
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">جميع الفئات</option>' +
                categories.map(category => `<option value="${category}">${category}</option>`).join('');
        }

        // تحديث فئات النموذج
        const productCategory = document.getElementById('productCategory');
        if (productCategory) {
            productCategory.innerHTML = '<option value="">اختر الفئة</option>' +
                categories.map(category => `<option value="${category}">${category}</option>`).join('');
        }

    } catch (error) {
        console.error('خطأ في تحميل الفئات:', error);
    }
}

// إعداد نموذج المنتج
function setupProductForm() {
    const form = document.getElementById('productForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });
}

// إضافة منتج جديد
function addProduct() {
    currentEditingProduct = null;
    resetProductForm();
    document.getElementById('productModalTitle').textContent = 'إضافة منتج جديد';
    document.getElementById('productModal').classList.remove('hidden');
}

// تعديل منتج
function editProduct(productId) {
    try {
        if (!window.db) return;

        const products = db.getTable('products');
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            showNotification('المنتج غير موجود', 'error');
            return;
        }

        currentEditingProduct = product;
        fillProductForm(product);
        document.getElementById('productModalTitle').textContent = 'تعديل المنتج';
        document.getElementById('productModal').classList.remove('hidden');

    } catch (error) {
        console.error('خطأ في تعديل المنتج:', error);
        showNotification('خطأ في تعديل المنتج', 'error');
    }
}

// ملء نموذج المنتج
function fillProductForm(product) {
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productPrice').value = product.price || '';
    document.getElementById('productQuantity').value = product.quantity || '';
    document.getElementById('productMinStock').value = product.minStock || 5;
    document.getElementById('productBarcode').value = product.barcode || '';
    document.getElementById('productDescription').value = product.description || '';
    
    // عرض الصورة إذا كانت موجودة
    const imagePreview = document.getElementById('productImagePreview');
    if (product.image && imagePreview) {
        imagePreview.src = product.image;
        imagePreview.style.display = 'block';
    }
}

// إعادة تعيين نموذج المنتج
function resetProductForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productImagePreview').style.display = 'none';
}

// حفظ المنتج
function saveProduct() {
    try {
        if (!window.db) return;

        const formData = {
            name: document.getElementById('productName').value.trim(),
            category: document.getElementById('productCategory').value.trim(),
            price: parseFloat(document.getElementById('productPrice').value) || 0,
            quantity: parseInt(document.getElementById('productQuantity').value) || 0,
            minStock: parseInt(document.getElementById('productMinStock').value) || 5,
            barcode: document.getElementById('productBarcode').value.trim(),
            description: document.getElementById('productDescription').value.trim(),
            image: document.getElementById('productImagePreview').src || null
        };

        // التحقق من صحة البيانات
        if (!formData.name) {
            showNotification('اسم المنتج مطلوب', 'warning');
            return;
        }

        if (formData.price <= 0) {
            showNotification('السعر يجب أن يكون أكبر من صفر', 'warning');
            return;
        }

        if (currentEditingProduct) {
            // تعديل منتج موجود
            const updatedProduct = { ...currentEditingProduct, ...formData };
            db.updateRecord('products', updatedProduct);
            showNotification('تم تحديث المنتج بنجاح', 'success');
        } else {
            // إضافة منتج جديد
            const newProduct = {
                id: 'product_' + Date.now(),
                ...formData,
                createdAt: new Date().toISOString()
            };
            db.addRecord('products', newProduct);
            showNotification('تم إضافة المنتج بنجاح', 'success');
        }

        closeProductModal();
        loadProducts();

    } catch (error) {
        console.error('خطأ في حفظ المنتج:', error);
        showNotification('خطأ في حفظ المنتج', 'error');
    }
}

// حذف منتج
function deleteProduct(productId) {
    try {
        if (!window.db) return;

        const products = db.getTable('products');
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            showNotification('المنتج غير موجود', 'error');
            return;
        }

        if (confirm(`هل أنت متأكد من حذف المنتج "${product.name}"؟`)) {
            db.deleteRecord('products', productId);
            showNotification('تم حذف المنتج بنجاح', 'success');
            loadProducts();
        }

    } catch (error) {
        console.error('خطأ في حذف المنتج:', error);
        showNotification('خطأ في حذف المنتج', 'error');
    }
}

// عرض تفاصيل المنتج
function viewProductDetails(productId) {
    try {
        if (!window.db) return;

        const products = db.getTable('products');
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            showNotification('المنتج غير موجود', 'error');
            return;
        }

        const stockStatus = getStockStatus(product);
        const content = `
            <div class="product-details">
                ${product.image ? `
                    <div class="product-details-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                ` : ''}
                
                <div class="product-details-info">
                    <h3>${product.name}</h3>
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="label">الفئة:</span>
                            <span class="value">${product.category || 'غير محدد'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">السعر:</span>
                            <span class="value">${formatCurrency(product.price)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">المخزون:</span>
                            <span class="value">${toArabicNumbers(product.quantity)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">الحد الأدنى:</span>
                            <span class="value">${toArabicNumbers(product.minStock || 5)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">الحالة:</span>
                            <span class="value">
                                <span class="status-badge ${stockStatus.class}">
                                    ${stockStatus.text}
                                </span>
                            </span>
                        </div>
                        ${product.barcode ? `
                            <div class="detail-item">
                                <span class="label">الباركود:</span>
                                <span class="value">${product.barcode}</span>
                            </div>
                        ` : ''}
                        ${product.description ? `
                            <div class="detail-item full-width">
                                <span class="label">الوصف:</span>
                                <span class="value">${product.description}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('productDetailsContent').innerHTML = content;
        document.getElementById('productDetailsModal').classList.remove('hidden');

    } catch (error) {
        console.error('خطأ في عرض تفاصيل المنتج:', error);
        showNotification('خطأ في عرض تفاصيل المنتج', 'error');
    }
}

// البحث في المنتجات
function searchProducts(query) {
    try {
        if (!window.db) return;

        const products = db.getTable('products');
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            (product.category && product.category.toLowerCase().includes(query.toLowerCase())) ||
            (product.barcode && product.barcode.includes(query)) ||
            (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
        );

        displayProducts(filteredProducts);

    } catch (error) {
        console.error('خطأ في البحث:', error);
    }
}

// فلترة حسب الفئة
function filterProductsByCategory(category) {
    try {
        if (!window.db) return;

        const products = db.getTable('products');
        const filteredProducts = category ? 
            products.filter(product => product.category === category) : 
            products;

        displayProducts(filteredProducts);

    } catch (error) {
        console.error('خطأ في الفلترة:', error);
    }
}

// فلترة حسب الحالة
function filterProductsByStatus(status) {
    try {
        if (!window.db) return;

        const products = db.getTable('products');
        let filteredProducts = products;

        if (status) {
            filteredProducts = products.filter(product => {
                const stockStatus = getStockStatus(product);
                return stockStatus.class === status;
            });
        }

        displayProducts(filteredProducts);

    } catch (error) {
        console.error('خطأ في الفلترة:', error);
    }
}

// تبديل العرض
function toggleView(view) {
    currentView = view;
    
    const gridView = document.getElementById('productsGrid');
    const listView = document.getElementById('productsList');
    const gridBtn = document.getElementById('gridViewBtn');
    const listBtn = document.getElementById('listViewBtn');
    
    if (view === 'grid') {
        gridView.classList.remove('hidden');
        listView.classList.add('hidden');
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
    } else {
        gridView.classList.add('hidden');
        listView.classList.remove('hidden');
        gridBtn.classList.remove('active');
        listBtn.classList.add('active');
    }
    
    loadProducts();
}

// اختيار صورة المنتج
function selectProductImage() {
    document.getElementById('productImageInput').click();
}

// معالجة رفع صورة المنتج
function handleProductImageUpload(input) {
    try {
        const file = input.files[0];
        if (!file) return;

        // التحقق من نوع الملف
        if (!file.type.startsWith('image/')) {
            showNotification('يرجى اختيار ملف صورة صحيح', 'warning');
            return;
        }

        // التحقق من حجم الملف (2 ميجابايت)
        if (file.size > 2 * 1024 * 1024) {
            showNotification('حجم الصورة يجب أن يكون أقل من 2 ميجابايت', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const imagePreview = document.getElementById('productImagePreview');
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);

    } catch (error) {
        console.error('خطأ في رفع الصورة:', error);
        showNotification('خطأ في رفع الصورة', 'error');
    }
}

// إغلاق نافذة المنتج
function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
    resetProductForm();
    currentEditingProduct = null;
}

// إغلاق نافذة تفاصيل المنتج
function closeProductDetailsModal() {
    document.getElementById('productDetailsModal').classList.add('hidden');
}

// تحديث إحصائيات المنتجات
function updateProductsStats() {
    // يمكن إضافة إحصائيات هنا
}

// استيراد المنتجات
function importProducts() {
    showNotification('ميزة الاستيراد قيد التطوير', 'info');
}

// تصدير المنتجات
function exportProducts() {
    showNotification('ميزة التصدير قيد التطوير', 'info');
}

// تصدير الوظائف للاستخدام العام
window.initProducts = initProducts;
window.addProduct = addProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.viewProductDetails = viewProductDetails;
window.searchProducts = searchProducts;
window.filterProductsByCategory = filterProductsByCategory;
window.filterProductsByStatus = filterProductsByStatus;
window.toggleView = toggleView;
window.selectProductImage = selectProductImage;
window.handleProductImageUpload = handleProductImageUpload;
window.closeProductModal = closeProductModal;
window.closeProductDetailsModal = closeProductDetailsModal;
window.importProducts = importProducts;
window.exportProducts = exportProducts;

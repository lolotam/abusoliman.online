/**
 * وحدة إدارة المنتجات
 * أبوسليمان للمحاسبة - نظام إدارة نقاط البيع
 */

let currentView = 'grid';
let currentEditingProduct = null;

// تحميل قسم المنتجات
function loadProductsSection() {
    const section = document.getElementById('products');
    if (!section) return;

    section.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-box"></i> المنتجات</h2>
            <div class="section-actions">
                <button class="btn btn-primary" onclick="showAddProductModal()">
                    <i class="fas fa-plus"></i>
                    إضافة منتج
                </button>
                <button class="btn btn-secondary" onclick="toggleView()">
                    <i class="fas fa-th" id="viewToggleIcon"></i>
                    <span id="viewToggleText">عرض قائمة</span>
                </button>
            </div>
        </div>

        <div class="products-container">
            <!-- شريط البحث والفلاتر -->
            <div class="products-toolbar">
                <div class="search-container">
                    <input type="text" id="productSearch" placeholder="البحث في المنتجات..." onkeyup="searchProducts()">
                    <i class="fas fa-search search-icon"></i>
                </div>

                <div class="filters-container">
                    <select id="productCategoryFilter" onchange="filterProductsByCategory(this.value)">
                        <option value="">جميع الفئات</option>
                    </select>

                    <select id="productStatusFilter" onchange="filterProductsByStatus(this.value)">
                        <option value="">جميع المنتجات</option>
                        <option value="available">متوفر</option>
                        <option value="low-stock">مخزون منخفض</option>
                        <option value="out-of-stock">نفد المخزون</option>
                    </select>
                </div>
            </div>

            <!-- عرض المنتجات -->
            <div id="productsDisplay">
                <div id="productsGrid" class="products-grid"></div>
                <div id="productsList" class="products-list hidden"></div>
            </div>
        </div>

        <!-- نافذة إضافة/تعديل المنتج -->
        <div id="productModal" class="modal hidden">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="productModalTitle">إضافة منتج جديد</h3>
                    <button class="modal-close" onclick="closeProductModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="productForm" onsubmit="saveProduct(event)">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="productName">اسم المنتج *</label>
                                <input type="text" id="productName" required>
                            </div>

                            <div class="form-group">
                                <label for="productCategory">الفئة *</label>
                                <select id="productCategory" required>
                                    <option value="">اختر الفئة</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="productPrice">سعر البيع *</label>
                                <input type="number" id="productPrice" step="0.01" min="0" required>
                            </div>

                            <div class="form-group">
                                <label for="productPurchasePrice">سعر الشراء</label>
                                <input type="number" id="productPurchasePrice" step="0.01" min="0">
                            </div>

                            <div class="form-group">
                                <label for="productQuantity">الكمية *</label>
                                <input type="number" id="productQuantity" min="0" required>
                            </div>

                            <div class="form-group">
                                <label for="productMinStock">الحد الأدنى للمخزون</label>
                                <input type="number" id="productMinStock" min="0" value="5">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="productDescription">الوصف</label>
                            <textarea id="productDescription" rows="3"></textarea>
                        </div>

                        <div class="form-group">
                            <label for="productImage">صورة المنتج</label>
                            <input type="file" id="productImage" accept="image/*" onchange="handleProductImageUpload(this)">
                            <div id="imagePreview" class="image-preview hidden">
                                <img id="previewImg" src="" alt="معاينة الصورة">
                                <button type="button" class="remove-image" onclick="removeProductImage()">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        <div class="modal-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i>
                                حفظ
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="closeProductModal()">
                                <i class="fas fa-times"></i>
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- نافذة تفاصيل المنتج -->
        <div id="productDetailsModal" class="modal hidden">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>تفاصيل المنتج</h3>
                    <button class="modal-close" onclick="closeProductDetailsModal()">&times;</button>
                </div>
                <div class="modal-body" id="productDetailsContent">
                    <!-- سيتم تحميل التفاصيل هنا -->
                </div>
            </div>
        </div>
    `;

    // تهيئة المنتجات بعد إنشاء HTML
    initProducts();

    // تحديث الفئات بعد تحميل القسم
    setTimeout(() => {
        if (typeof updateAllCategorySelects === 'function') {
            updateAllCategorySelects();
        }
        loadCategories();
    }, 100);
}

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
                <!-- 1. صورة المنتج في الأعلى -->
                <div class="product-image-container">
                    ${product.image ?
                        `<img src="${product.image}" alt="${product.name}" class="product-image">` :
                        `<div class="product-image-placeholder"><i class="fas fa-image"></i></div>`
                    }
                    <div class="product-status-badge ${stockStatus.class}">
                        ${stockStatus.text}
                    </div>
                </div>

                <!-- 2. أزرار العمليات تحت الصورة مباشرة -->
                <div class="product-actions">
                    <button class="btn btn-sm btn-info" onclick="viewProductDetails('${product.id}')" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                        <span>مشاهدة</span>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="editProduct('${product.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                        <span>تعديل</span>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                        <span>حذف</span>
                    </button>
                </div>

                <!-- 3. اسم المنتج تحت الأزرار -->
                <div class="product-header">
                    <h4 class="product-name">${product.name}</h4>
                </div>

                <!-- 4. باقي معلومات المنتج -->
                <div class="product-info">
                    <div class="product-detail">
                        <span class="label">الفئة:</span>
                        <span class="value">${product.category || 'غير محدد'}</span>
                    </div>
                    <div class="product-detail">
                        <span class="label">السعر:</span>
                        <span class="value price">${formatCurrency(product.price)}</span>
                    </div>
                    <div class="product-detail">
                        <span class="label">المخزون:</span>
                        <span class="value stock ${stockStatus.class}">${toArabicNumbers(product.quantity)}</span>
                    </div>
                    ${product.description ? `
                        <div class="product-description">
                            <span class="label">الوصف:</span>
                            <p class="description-text">${product.description}</p>
                        </div>
                    ` : ''}
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

// تحميل الفئات (استخدام النظام المركزي)
function loadCategories() {
    try {
        // استخدام النظام المركزي للفئات إذا كان متاحاً
        if (typeof populateCategorySelect === 'function') {
            // تحديث فلتر الفئات في قسم المنتجات
            const categoryFilter = document.getElementById('productCategoryFilter');
            if (categoryFilter) {
                populateCategorySelect(categoryFilter, true);
            }

            // تحديث فئات النموذج
            const productCategory = document.getElementById('productCategory');
            if (productCategory) {
                populateCategorySelect(productCategory, false);
            }
        } else {
            // الطريقة التقليدية كبديل
            console.warn('النظام المركزي للفئات غير متاح، استخدام الطريقة التقليدية');
            loadCategoriesTraditional();
        }

    } catch (error) {
        console.error('خطأ في تحميل الفئات:', error);
        // محاولة استخدام الطريقة التقليدية في حالة الخطأ
        loadCategoriesTraditional();
    }
}

// الطريقة التقليدية لتحميل الفئات (كبديل)
function loadCategoriesTraditional() {
    try {
        if (!window.db) return;

        // الحصول على الفئات من قاعدة البيانات
        const categories = db.getTable('categories') || [];

        // تحديث فلتر الفئات
        const categoryFilter = document.getElementById('productCategoryFilter');
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">جميع الفئات</option>' +
                categories.map((category, index) =>
                    `<option value="${category.id}">${index + 1}. ${category.name}</option>`
                ).join('');
        }

        // تحديث فئات النموذج
        const productCategory = document.getElementById('productCategory');
        if (productCategory) {
            productCategory.innerHTML = '<option value="">اختر الفئة</option>' +
                categories.map((category, index) =>
                    `<option value="${category.id}">${index + 1}. ${category.name}</option>`
                ).join('');
        }

    } catch (error) {
        console.error('خطأ في الطريقة التقليدية لتحميل الفئات:', error);
    }
}

// إظهار نافذة إضافة منتج
function showAddProductModal() {
    try {
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        const form = document.getElementById('productForm');

        if (!modal || !title || !form) return;

        // إعداد النافذة للإضافة
        title.textContent = 'إضافة منتج جديد';
        form.reset();
        currentEditingProduct = null;

        // إخفاء معاينة الصورة
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.classList.add('hidden');
        }

        // إظهار النافذة
        modal.classList.remove('hidden');

        // التركيز على أول حقل
        const firstInput = form.querySelector('input[type="text"]');
        if (firstInput) {
            firstInput.focus();
        }

    } catch (error) {
        console.error('خطأ في إظهار نافذة إضافة المنتج:', error);
        showNotification('خطأ في فتح نافذة المنتج', 'error');
    }
}

// حفظ المنتج
function saveProduct(event) {
    if (event) {
        event.preventDefault();
    }

    try {
        const form = document.getElementById('productForm');
        if (!form) return;

        const formData = new FormData(form);
        const productData = {
            id: currentEditingProduct ? currentEditingProduct.id : 'prod_' + Date.now(),
            name: document.getElementById('productName').value.trim(),
            categoryId: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value) || 0,
            purchasePrice: parseFloat(document.getElementById('productPurchasePrice').value) || 0,
            quantity: parseInt(document.getElementById('productQuantity').value) || 0,
            minStock: parseInt(document.getElementById('productMinStock').value) || 5,
            description: document.getElementById('productDescription').value.trim(),
            image: currentEditingProduct ? currentEditingProduct.image : null,
            createdAt: currentEditingProduct ? currentEditingProduct.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // التحقق من صحة البيانات
        if (!productData.name) {
            showNotification('اسم المنتج مطلوب', 'warning');
            return;
        }

        if (!productData.categoryId) {
            showNotification('فئة المنتج مطلوبة', 'warning');
            return;
        }

        if (productData.price <= 0) {
            showNotification('سعر البيع يجب أن يكون أكبر من صفر', 'warning');
            return;
        }

        // حفظ المنتج في قاعدة البيانات
        const products = db.getTable('products');

        if (currentEditingProduct) {
            // تحديث منتج موجود
            const index = products.findIndex(p => p.id === currentEditingProduct.id);
            if (index >= 0) {
                products[index] = productData;
                db.setTable('products', products);
                showNotification('تم تحديث المنتج بنجاح', 'success');
            }
        } else {
            // إضافة منتج جديد
            products.push(productData);
            db.setTable('products', products);
            showNotification('تم إضافة المنتج بنجاح', 'success');
        }

        // إغلاق النافذة وتحديث العرض
        closeProductModal();
        loadProducts();

    } catch (error) {
        console.error('خطأ في حفظ المنتج:', error);
        showNotification('خطأ في حفظ المنتج', 'error');
    }
}

// إزالة صورة المنتج
function removeProductImage() {
    try {
        const imagePreview = document.getElementById('imagePreview');
        const productImage = document.getElementById('productImage');

        if (imagePreview) {
            imagePreview.classList.add('hidden');
        }

        if (productImage) {
            productImage.value = '';
        }

        if (currentEditingProduct) {
            currentEditingProduct.image = null;
        }

    } catch (error) {
        console.error('خطأ في إزالة صورة المنتج:', error);
    }
}

// تبديل طريقة العرض
function toggleView() {
    try {
        const gridView = document.getElementById('productsGrid');
        const listView = document.getElementById('productsList');
        const toggleIcon = document.getElementById('viewToggleIcon');
        const toggleText = document.getElementById('viewToggleText');

        if (!gridView || !listView) return;

        if (currentView === 'grid') {
            // التبديل إلى عرض القائمة
            currentView = 'list';
            gridView.classList.add('hidden');
            listView.classList.remove('hidden');

            if (toggleIcon) toggleIcon.className = 'fas fa-th-large';
            if (toggleText) toggleText.textContent = 'عرض شبكة';

            // تحديث عرض القائمة
            const products = db.getTable('products');
            displayProductsList(products);
        } else {
            // التبديل إلى عرض الشبكة
            currentView = 'grid';
            listView.classList.add('hidden');
            gridView.classList.remove('hidden');

            if (toggleIcon) toggleIcon.className = 'fas fa-th';
            if (toggleText) toggleText.textContent = 'عرض قائمة';

            // تحديث عرض الشبكة
            const products = db.getTable('products');
            displayProductsGrid(products);
        }

    } catch (error) {
        console.error('خطأ في تبديل طريقة العرض:', error);
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
    if (typeof showImportProductsModal === 'function') {
        showImportProductsModal();
    } else {
        showNotification('ميزة الاستيراد غير متاحة', 'error');
    }
}

// تصدير المنتجات
function exportProducts() {
    if (typeof exportProductsToCSV === 'function') {
        exportProductsToCSV();
    } else {
        showNotification('ميزة التصدير غير متاحة', 'error');
    }
}

// اختبار التخطيط الجديد لبطاقات المنتجات
function testNewProductCardLayout() {
    try {
        console.log('🧪 بدء اختبار التخطيط الجديد لبطاقات المنتجات...');

        // التحقق من وجود العناصر المطلوبة
        const productCards = document.querySelectorAll('.product-card');
        console.log(`📦 عدد بطاقات المنتجات: ${productCards.length}`);

        if (productCards.length === 0) {
            console.log('⚠️ لا توجد بطاقات منتجات للاختبار');
            return false;
        }

        let successCount = 0;
        let totalTests = 0;

        productCards.forEach((card, index) => {
            totalTests += 4; // 4 اختبارات لكل بطاقة

            // اختبار 1: وجود صورة المنتج في الأعلى
            const imageContainer = card.querySelector('.product-image-container');
            if (imageContainer) {
                successCount++;
                console.log(`✅ البطاقة ${index + 1}: صورة المنتج موجودة`);
            } else {
                console.log(`❌ البطاقة ${index + 1}: صورة المنتج مفقودة`);
            }

            // اختبار 2: وجود أزرار العمليات
            const actions = card.querySelector('.product-actions');
            if (actions) {
                const buttons = actions.querySelectorAll('.btn');
                if (buttons.length === 3) {
                    successCount++;
                    console.log(`✅ البطاقة ${index + 1}: أزرار العمليات موجودة (${buttons.length})`);
                } else {
                    console.log(`⚠️ البطاقة ${index + 1}: عدد الأزرار غير صحيح (${buttons.length})`);
                }
            } else {
                console.log(`❌ البطاقة ${index + 1}: أزرار العمليات مفقودة`);
            }

            // اختبار 3: وجود اسم المنتج
            const productName = card.querySelector('.product-name');
            if (productName) {
                successCount++;
                console.log(`✅ البطاقة ${index + 1}: اسم المنتج موجود`);
            } else {
                console.log(`❌ البطاقة ${index + 1}: اسم المنتج مفقود`);
            }

            // اختبار 4: وجود معلومات المنتج
            const productInfo = card.querySelector('.product-info');
            if (productInfo) {
                const details = productInfo.querySelectorAll('.product-detail');
                if (details.length >= 3) {
                    successCount++;
                    console.log(`✅ البطاقة ${index + 1}: معلومات المنتج موجودة (${details.length})`);
                } else {
                    console.log(`⚠️ البطاقة ${index + 1}: معلومات المنتج ناقصة (${details.length})`);
                }
            } else {
                console.log(`❌ البطاقة ${index + 1}: معلومات المنتج مفقودة`);
            }
        });

        // النتيجة النهائية
        const successRate = (successCount / totalTests) * 100;
        console.log(`🎯 نتيجة الاختبار: ${successCount}/${totalTests} (${successRate.toFixed(1)}%)`);

        if (successRate >= 90) {
            console.log('🎉 التخطيط الجديد يعمل بشكل ممتاز!');
            showNotification('تم تطبيق التخطيط الجديد لبطاقات المنتجات بنجاح', 'success');
            return true;
        } else if (successRate >= 70) {
            console.log('✅ التخطيط الجديد يعمل بشكل جيد مع بعض التحسينات المطلوبة');
            showNotification('التخطيط الجديد يعمل بشكل جيد', 'info');
            return true;
        } else {
            console.log('⚠️ التخطيط الجديد يحتاج إلى تحسينات');
            showNotification('التخطيط الجديد يحتاج إلى تحسينات', 'warning');
            return false;
        }

    } catch (error) {
        console.error('❌ خطأ في اختبار التخطيط الجديد:', error);
        showNotification('خطأ في اختبار التخطيط الجديد', 'error');
        return false;
    }
}

// تصدير الوظائف للاستخدام العام
window.loadProductsSection = loadProductsSection;
window.initProducts = initProducts;
window.loadCategories = loadCategories;
window.showAddProductModal = showAddProductModal;
window.saveProduct = saveProduct;
window.removeProductImage = removeProductImage;
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
window.testNewProductCardLayout = testNewProductCardLayout;

// اختبار تزامن فلتر الفئات في قسم المنتجات
function testCategoryFilterSync() {
    try {
        console.log('🧪 بدء اختبار تزامن فلتر الفئات في قسم المنتجات...');

        let totalTests = 0;
        let passedTests = 0;
        const testResults = [];

        // اختبار 1: وجود فلتر الفئات في قسم المنتجات
        totalTests++;
        const productCategoryFilter = document.getElementById('productCategoryFilter');
        if (productCategoryFilter) {
            passedTests++;
            testResults.push('✅ فلتر الفئات في قسم المنتجات موجود');

            // فحص عدد الخيارات
            const optionsCount = productCategoryFilter.options.length;
            if (optionsCount > 1) { // أكثر من خيار "جميع الفئات"
                testResults.push(`✅ الفلتر يحتوي على ${optionsCount - 1} فئة`);

                // فحص التنسيق (الترقيم)
                const secondOption = productCategoryFilter.options[1];
                if (secondOption && secondOption.textContent.match(/^\d+\./)) {
                    testResults.push('✅ الفئات مرقمة بشكل صحيح');
                } else {
                    testResults.push('⚠️ الفئات غير مرقمة');
                }
            } else {
                testResults.push('❌ الفلتر لا يحتوي على فئات');
            }
        } else {
            testResults.push('❌ فلتر الفئات في قسم المنتجات غير موجود');
        }

        // اختبار 2: وجود فلتر الفئات في نموذج المنتج
        totalTests++;
        const productCategory = document.getElementById('productCategory');
        if (productCategory) {
            passedTests++;
            testResults.push('✅ فلتر الفئات في نموذج المنتج موجود');

            const optionsCount = productCategory.options.length;
            if (optionsCount > 1) {
                testResults.push(`✅ نموذج المنتج يحتوي على ${optionsCount - 1} فئة`);
            } else {
                testResults.push('⚠️ نموذج المنتج لا يحتوي على فئات');
            }
        } else {
            testResults.push('❌ فلتر الفئات في نموذج المنتج غير موجود');
        }

        // اختبار 3: مقارنة عدد الفئات مع قاعدة البيانات
        totalTests++;
        try {
            const categoriesFromDB = db.getTable('categories');
            const expectedCount = categoriesFromDB.length;

            if (productCategoryFilter) {
                const actualCount = productCategoryFilter.options.length - 1; // طرح خيار "جميع الفئات"

                if (actualCount === expectedCount) {
                    passedTests++;
                    testResults.push(`✅ عدد الفئات متطابق: ${actualCount}/${expectedCount}`);
                } else {
                    testResults.push(`❌ عدد الفئات غير متطابق: ${actualCount}/${expectedCount}`);
                }
            }
        } catch (error) {
            testResults.push('❌ خطأ في مقارنة عدد الفئات');
        }

        // اختبار 4: التحقق من وجود الدوال المطلوبة
        totalTests++;
        const requiredFunctions = [
            'loadCategories', 'populateCategorySelect', 'updateAllCategorySelects'
        ];

        const missingFunctions = requiredFunctions.filter(func => typeof window[func] !== 'function');

        if (missingFunctions.length === 0) {
            passedTests++;
            testResults.push('✅ جميع الدوال المطلوبة متاحة');
        } else {
            testResults.push(`❌ دوال مفقودة: ${missingFunctions.join(', ')}`);
        }

        // اختبار 5: محاكاة تحديث الفئات
        totalTests++;
        try {
            if (typeof updateAllCategorySelects === 'function') {
                const beforeCount = productCategoryFilter ? productCategoryFilter.options.length : 0;
                updateAllCategorySelects();
                const afterCount = productCategoryFilter ? productCategoryFilter.options.length : 0;

                if (afterCount >= beforeCount) {
                    passedTests++;
                    testResults.push('✅ دالة تحديث الفئات تعمل بشكل صحيح');
                } else {
                    testResults.push('⚠️ دالة تحديث الفئات قد تحتاج مراجعة');
                }
            } else {
                testResults.push('❌ دالة تحديث الفئات غير متاحة');
            }
        } catch (error) {
            testResults.push('❌ خطأ في اختبار دالة تحديث الفئات');
        }

        // النتائج النهائية
        console.log('\n📋 تقرير اختبار تزامن فلتر الفئات:');
        console.log('=' .repeat(50));

        testResults.forEach(result => console.log(result));

        const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
        console.log(`\n🎯 النتيجة النهائية: ${passedTests}/${totalTests} (${successRate.toFixed(1)}%)`);

        if (successRate >= 90) {
            console.log('🎉 تزامن فلتر الفئات يعمل بشكل ممتاز!');
            showNotification('تزامن فلتر الفئات يعمل بنجاح', 'success');
        } else if (successRate >= 70) {
            console.log('✅ تزامن فلتر الفئات يعمل بشكل جيد مع بعض التحسينات المطلوبة');
            showNotification('تزامن فلتر الفئات يعمل مع بعض التحذيرات', 'info');
        } else {
            console.log('⚠️ تزامن فلتر الفئات يحتاج إلى إصلاحات');
            showNotification('تزامن فلتر الفئات يحتاج إلى إصلاحات', 'warning');
        }

        console.log('=' .repeat(50));
        return successRate >= 70;

    } catch (error) {
        console.error('❌ خطأ في اختبار تزامن فلتر الفئات:', error);
        showNotification('خطأ في اختبار تزامن فلتر الفئات', 'error');
        return false;
    }
}

window.testCategoryFilterSync = testCategoryFilterSync;

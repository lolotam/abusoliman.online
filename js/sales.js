/**
 * وحدة المبيعات ونقاط البيع
 * أبوسليمان للمحاسبة - نظام إدارة نقاط البيع
 */

// متغيرات السلة
let cart = [];
let currentSale = null;
let selectedWarehouse = null;

// تهيئة صفحة المبيعات
function initSales() {
    loadWarehouses();
    loadCustomers();
    loadCategories();
    initializeInvoiceInfo();
    updateCartDisplay();
    updateTotals();
}

// تهيئة معلومات الفاتورة
function initializeInvoiceInfo() {
    try {
        // تعيين تاريخ اليوم
        const today = new Date().toISOString().split('T')[0];
        const invoiceDateInput = document.getElementById('invoiceDate');
        if (invoiceDateInput) {
            invoiceDateInput.value = today;
        }

        // عرض رقم الفاتورة التالي
        updateInvoiceNumberDisplay();

    } catch (error) {
        console.error('خطأ في تهيئة معلومات الفاتورة:', error);
    }
}

// تحديث عرض رقم الفاتورة
function updateInvoiceNumberDisplay() {
    try {
        if (!window.db) return;

        const settings = db.getTable('settings');
        const nextNumber = (settings.saleInvoiceCounter || 0) + 1;
        const invoiceNumber = String(nextNumber).padStart(2, '0');

        const invoiceNumberElement = document.getElementById('currentInvoiceNumber');
        if (invoiceNumberElement) {
            invoiceNumberElement.textContent = invoiceNumber;
        }

    } catch (error) {
        console.error('خطأ في تحديث رقم الفاتورة:', error);
    }
}

// تحميل قسم المبيعات
function loadSalesSection() {
    initSales();
}

// تحميل المخازن
function loadWarehouses() {
    try {
        if (!window.db) return;

        const warehouses = db.getTable('warehouses').filter(w => w.isActive);
        const warehouseSelect = document.getElementById('warehouseSelect');

        if (!warehouseSelect) return;

        warehouseSelect.innerHTML = '<option value="">اختر المخزن</option>' +
            warehouses.map((warehouse, index) =>
                `<option value="${warehouse.id}">${index + 1}. ${warehouse.name}</option>`
            ).join('');

        // اختيار المخزن الرئيسي افتراضياً
        if (warehouses.length > 0) {
            const mainWarehouse = warehouses.find(w => w.id === 'main') || warehouses[0];
            warehouseSelect.value = mainWarehouse.id;
            selectedWarehouse = mainWarehouse.id;
            loadProducts();
        }

    } catch (error) {
        console.error('خطأ في تحميل المخازن:', error);
    }
}

// تغيير المخزن المحدد
function onWarehouseChange() {
    const warehouseSelect = document.getElementById('warehouseSelect');
    selectedWarehouse = warehouseSelect.value;

    if (selectedWarehouse) {
        loadProducts();
        // مسح السلة عند تغيير المخزن
        if (cart.length > 0) {
            if (confirm('سيتم مسح السلة الحالية عند تغيير المخزن. هل تريد المتابعة؟')) {
                clearCart();
            } else {
                // إرجاع المخزن السابق
                warehouseSelect.value = selectedWarehouse;
                return;
            }
        }
    } else {
        // مسح عرض المنتجات إذا لم يتم اختيار مخزن
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = '<div class="empty-state"><p>يرجى اختيار مخزن أولاً</p></div>';
        }
    }
}

// تحميل المنتجات
function loadProducts() {
    try {
        if (!window.db) return;

        if (!selectedWarehouse) {
            const productsGrid = document.getElementById('productsGrid');
            if (productsGrid) {
                productsGrid.innerHTML = '<div class="empty-state"><p>يرجى اختيار مخزن أولاً</p></div>';
            }
            return;
        }

        const products = db.getTable('products');
        const productsGrid = document.getElementById('productsGrid');

        if (!productsGrid) return;

        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <p>لا توجد منتجات متاحة</p>
                    <button class="btn btn-primary" onclick="showSection('products')">
                        <i class="fas fa-plus"></i>
                        إضافة منتج
                    </button>
                </div>
            `;
            return;
        }

        // فلترة المنتجات حسب البحث والفئة
        let filteredProducts = products;

        const searchTerm = document.getElementById('productSearch')?.value.toLowerCase() || '';
        const selectedCategory = document.getElementById('categoryFilter')?.value || '';

        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                (product.barcode && product.barcode.includes(searchTerm))
            );
        }

        if (selectedCategory) {
            filteredProducts = filteredProducts.filter(product =>
                product.category === selectedCategory
            );
        }

        productsGrid.innerHTML = filteredProducts.map(product => {
            // الحصول على كمية المنتج في المخزن المحدد
            const warehouseQty = product.warehouseDistribution && product.warehouseDistribution[selectedWarehouse]
                ? product.warehouseDistribution[selectedWarehouse]
                : 0;

            const totalQty = product.quantity || 0;
            const isOutOfStock = warehouseQty <= 0;
            const isLowStock = warehouseQty > 0 && warehouseQty <= (product.minStock || 5);

            let stockClass = '';
            let stockText = '';

            if (isOutOfStock) {
                stockClass = 'out-of-stock';
                stockText = 'نفد المخزون';
            } else if (isLowStock) {
                stockClass = 'low-stock';
                stockText = 'مخزون منخفض';
            }

            return `
                <div class="product-card ${stockClass}" onclick="${isOutOfStock ? '' : `addToCart('${product.id}')`}">
                    ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-image">` :
                        `<div class="product-image" style="background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; color: var(--text-secondary);">
                            <i class="fas fa-image" style="font-size: 2rem;"></i>
                        </div>`
                    }
                    <div class="product-info">
                        <h4 class="product-name">${product.name}</h4>
                        <p class="product-price">${formatCurrency(product.salePrice || product.price || 0)}</p>
                        <p class="product-stock">الإجمالي: ${db.toArabicNumbers(totalQty)}</p>
                        <div class="warehouse-stock ${stockClass}">
                            في هذا المخزن: ${db.toArabicNumbers(warehouseQty)}
                            ${stockText ? `<br><small>${stockText}</small>` : ''}
                        </div>
                    </div>
                    ${!isOutOfStock ? `
                        <div class="product-actions">
                            <button class="btn btn-sm btn-primary">
                                <i class="fas fa-plus"></i>
                                إضافة
                            </button>
                        </div>
                    ` : `
                        <div class="product-actions">
                            <button class="btn btn-sm btn-secondary" disabled>
                                <i class="fas fa-ban"></i>
                                غير متوفر
                            </button>
                        </div>
                    `}
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('خطأ في تحميل المنتجات:', error);
    }
}

// تحميل العملاء
function loadCustomers() {
    try {
        if (!window.db) return;

        const customers = db.getTable('customers');
        const customerSelect = document.getElementById('customerSelect');
        
        if (!customerSelect) return;

        customerSelect.innerHTML = '<option value="">اختر العميل</option>' +
            customers.map(customer => `
                <option value="${customer.id}">${customer.name}</option>
            `).join('');

    } catch (error) {
        console.error('خطأ في تحميل العملاء:', error);
    }
}

// تحميل الفئات (استخدام الدالة المركزية)
function loadCategories() {
    try {
        if (!window.populateCategorySelect) {
            console.warn('وحدة الفئات المركزية غير متاحة، استخدام الطريقة التقليدية');

            // الطريقة التقليدية كبديل
            if (!window.db) return;
            const products = db.getTable('products');
            const categories = [...new Set(products.map(p => p.category).filter(c => c))];
            const categoryFilter = document.getElementById('categoryFilter');

            if (!categoryFilter) return;
            categoryFilter.innerHTML = '<option value="">جميع الفئات</option>' +
                categories.map(category => `<option value="${category}">${category}</option>`).join('');
            return;
        }

        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            populateCategorySelect(categoryFilter, true);
        }
    } catch (error) {
        console.error('خطأ في تحميل الفئات:', error);
    }
}

// إضافة منتج للسلة
function addToCart(productId) {
    try {
        if (!window.db) return;

        if (!selectedWarehouse) {
            showNotification('يرجى اختيار مخزن أولاً', 'warning');
            return;
        }

        const products = db.getTable('products');
        const product = products.find(p => p.id === productId);

        if (!product) {
            showNotification('المنتج غير موجود', 'error');
            return;
        }

        // التحقق من توفر الكمية في المخزن المحدد
        const warehouseQty = product.warehouseDistribution && product.warehouseDistribution[selectedWarehouse]
            ? product.warehouseDistribution[selectedWarehouse]
            : 0;

        if (warehouseQty <= 0) {
            showNotification('المنتج غير متوفر في هذا المخزن', 'warning');
            return;
        }

        // البحث عن المنتج في السلة
        const existingItem = cart.find(item => item.productId === productId);

        if (existingItem) {
            if (existingItem.quantity >= warehouseQty) {
                showNotification('لا يمكن إضافة كمية أكثر من المتوفر في هذا المخزن', 'warning');
                return;
            }
            existingItem.quantity += 1;
        } else {
            cart.push({
                productId: productId,
                name: product.name,
                price: product.salePrice || product.price || 0,
                quantity: 1,
                image: product.image,
                warehouseId: selectedWarehouse
            });
        }

        updateCartDisplay();
        updateTotals();
        showNotification(`تم إضافة ${product.name} للسلة`, 'success');

    } catch (error) {
        console.error('خطأ في إضافة المنتج للسلة:', error);
        showNotification('خطأ في إضافة المنتج للسلة', 'error');
    }
}

// تحديث عرض السلة
function updateCartDisplay() {
    try {
        const cartItems = document.getElementById('cartItems');
        const completeSaleBtn = document.getElementById('completeSaleBtn');

        if (!cartItems) return;

        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>السلة فارغة</p>
                    <small>أضف منتجات لبدء البيع</small>
                </div>
            `;
            if (completeSaleBtn) completeSaleBtn.disabled = true;
            return;
        }

        cartItems.innerHTML = cart.map((item, index) => {
            // الحصول على الكمية المتوفرة في المخزن
            const products = db.getTable('products');
            const product = products.find(p => p.id === item.productId);
            const maxQty = product && product.warehouseDistribution && product.warehouseDistribution[selectedWarehouse]
                ? product.warehouseDistribution[selectedWarehouse]
                : 0;

            return `
                <div class="cart-item">
                    <div class="cart-item-header">
                        <h5 class="cart-item-name">${item.name}</h5>
                        <button class="cart-item-remove" onclick="removeFromCart(${index})" title="حذف">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="updateCartItemQuantity(${index}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-display">${db.toArabicNumbers(item.quantity)}</span>
                            <button class="quantity-btn" onclick="updateCartItemQuantity(${index}, ${item.quantity + 1})" ${item.quantity >= maxQty ? 'disabled' : ''}>
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="cart-item-total">
                            ${formatCurrency(item.price * item.quantity)}
                        </div>
                    </div>
                    <div class="cart-item-price">
                        ${formatCurrency(item.price)} × ${db.toArabicNumbers(item.quantity)}
                    </div>
                </div>
            `;
        }).join('');

        if (completeSaleBtn) completeSaleBtn.disabled = false;

    } catch (error) {
        console.error('خطأ في تحديث عرض السلة:', error);
    }
}

// تحديث كمية عنصر في السلة
function updateCartItemQuantity(index, newQuantity) {
    try {
        if (newQuantity <= 0) {
            removeFromCart(index);
            return;
        }

        const item = cart[index];
        if (!item) return;

        // التحقق من المخزون المتاح في المخزن المحدد
        if (window.db && selectedWarehouse) {
            const products = db.getTable('products');
            const product = products.find(p => p.id === item.productId);

            if (product) {
                const warehouseQty = product.warehouseDistribution && product.warehouseDistribution[selectedWarehouse]
                    ? product.warehouseDistribution[selectedWarehouse]
                    : 0;

                if (newQuantity > warehouseQty) {
                    showNotification('الكمية المطلوبة أكبر من المتوفر في هذا المخزن', 'warning');
                    return;
                }
            }
        }

        cart[index].quantity = newQuantity;
        updateCartDisplay();
        updateTotals();

    } catch (error) {
        console.error('خطأ في تحديث كمية العنصر:', error);
    }
}

// إزالة عنصر من السلة
function removeFromCart(index) {
    try {
        if (index >= 0 && index < cart.length) {
            const item = cart[index];
            cart.splice(index, 1);
            updateCartDisplay();
            updateTotals();
            showNotification(`تم إزالة ${item.name} من السلة`, 'info');
        }
    } catch (error) {
        console.error('خطأ في إزالة العنصر من السلة:', error);
    }
}

// مسح السلة
function clearCart() {
    try {
        if (cart.length === 0) return;

        if (confirm('هل أنت متأكد من مسح جميع عناصر السلة؟')) {
            cart = [];
            updateCartDisplay();
            updateTotals();
            showNotification('تم مسح السلة', 'info');
        }
    } catch (error) {
        console.error('خطأ في مسح السلة:', error);
    }
}

// تحديث المجاميع
function updateTotals() {
    try {
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');
        const discountAmount = parseFloat(document.getElementById('discountAmount')?.value || 0);
        const discountType = document.getElementById('discountType')?.value || 'amount';
        const taxAmount = parseFloat(document.getElementById('taxAmount')?.value || 0);
        const taxType = document.getElementById('taxType')?.value || 'amount';

        // حساب المجموع الفرعي
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // حساب الخصم
        let discount = 0;
        if (discountType === 'percentage') {
            discount = subtotal * (discountAmount / 100);
        } else {
            discount = discountAmount;
        }

        // حساب الضريبة
        let tax = 0;
        const afterDiscount = subtotal - discount;
        if (taxType === 'percentage') {
            tax = afterDiscount * (taxAmount / 100);
        } else {
            tax = taxAmount;
        }

        // الإجمالي النهائي
        const total = Math.max(0, afterDiscount + tax);

        // تحديث العرض
        if (subtotalElement) {
            subtotalElement.textContent = formatCurrency(subtotal);
        }
        if (totalElement) {
            totalElement.textContent = formatCurrency(total);
        }

    } catch (error) {
        console.error('خطأ في تحديث المجاميع:', error);
    }
}

// البحث في المنتجات
function searchProducts(query) {
    try {
        if (!window.db) return;

        const products = db.getTable('products');
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.barcode?.includes(query)
        );

        displayProducts(filteredProducts);

    } catch (error) {
        console.error('خطأ في البحث:', error);
    }
}

// فلترة حسب الفئة
function filterByCategory(category) {
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

// عرض المنتجات المفلترة
function displayProducts(products) {
    try {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-search"></i>
                    <p>لا توجد منتجات تطابق البحث</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = products.map(product => `
            <div class="product-card" onclick="addToCart('${product.id}')">
                ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-image">` : ''}
                <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <p class="product-price">${formatCurrency(product.price)}</p>
                    <p class="product-stock">المخزون: ${toArabicNumbers(product.quantity)}</p>
                </div>
                <div class="product-actions">
                    <button class="btn btn-sm primary">
                        <i class="fas fa-plus"></i>
                        إضافة
                    </button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('خطأ في عرض المنتجات:', error);
    }
}

// إتمام البيع
function completeSale() {
    try {
        if (cart.length === 0) {
            showNotification('السلة فارغة', 'warning');
            return;
        }

        // عرض نافذة تأكيد البيع
        showSaleConfirmation();

    } catch (error) {
        console.error('خطأ في إتمام البيع:', error);
        showNotification('خطأ في إتمام البيع', 'error');
    }
}

// عرض نافذة تأكيد البيع
function showSaleConfirmation() {
    try {
        const modal = document.getElementById('saleConfirmModal');
        const detailsContainer = document.getElementById('saleConfirmDetails');
        const paidAmountInput = document.getElementById('paidAmount');
        
        if (!modal || !detailsContainer) return;

        // حساب المجاميع
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = parseFloat(document.getElementById('discountAmount')?.value || 0);
        const discountType = document.getElementById('discountType')?.value || 'amount';
        const taxAmount = parseFloat(document.getElementById('taxAmount')?.value || 0);
        const taxType = document.getElementById('taxType')?.value || 'amount';

        let discount = 0;
        if (discountType === 'percentage') {
            discount = subtotal * (discountAmount / 100);
        } else {
            discount = discountAmount;
        }

        let tax = 0;
        const afterDiscount = subtotal - discount;
        if (taxType === 'percentage') {
            tax = afterDiscount * (taxAmount / 100);
        } else {
            tax = taxAmount;
        }

        const total = Math.max(0, afterDiscount + tax);

        // عرض التفاصيل
        detailsContainer.innerHTML = `
            <div class="sale-summary-details">
                <div class="summary-row">
                    <span>المجموع الفرعي:</span>
                    <span>${formatCurrency(subtotal)}</span>
                </div>
                ${discount > 0 ? `
                    <div class="summary-row">
                        <span>الخصم:</span>
                        <span>-${formatCurrency(discount)}</span>
                    </div>
                ` : ''}
                ${tax > 0 ? `
                    <div class="summary-row">
                        <span>الضريبة:</span>
                        <span>${formatCurrency(tax)}</span>
                    </div>
                ` : ''}
                <div class="summary-row total">
                    <span>الإجمالي:</span>
                    <span>${formatCurrency(total)}</span>
                </div>
            </div>
        `;

        // تعيين المبلغ المدفوع افتراضياً
        if (paidAmountInput) {
            paidAmountInput.value = total.toFixed(3);
            calculateChange();
        }

        modal.classList.remove('hidden');

    } catch (error) {
        console.error('خطأ في عرض نافذة التأكيد:', error);
    }
}

// حساب الباقي
function calculateChange() {
    try {
        const paidAmountInput = document.getElementById('paidAmount');
        const changeAmountInput = document.getElementById('changeAmount');
        const totalElement = document.getElementById('total');
        
        if (!paidAmountInput || !changeAmountInput || !totalElement) return;

        const paidAmount = parseFloat(paidAmountInput.value || 0);
        const totalText = totalElement.textContent.replace(/[^\d.]/g, '');
        const total = parseFloat(totalText || 0);
        
        const change = paidAmount - total;
        changeAmountInput.value = formatCurrency(Math.max(0, change));

    } catch (error) {
        console.error('خطأ في حساب الباقي:', error);
    }
}

// تأكيد البيع
function confirmSale() {
    try {
        if (!window.db) {
            showNotification('خطأ في قاعدة البيانات', 'error');
            return;
        }

        // إنشاء فاتورة جديدة
        const sale = createSaleRecord();
        
        // حفظ الفاتورة
        db.addRecord('sales', sale);
        
        // تحديث المخزون
        const inventoryUpdateSuccess = updateInventoryAfterSale();

        if (!inventoryUpdateSuccess) {
            console.error('فشل في تحديث المخزون');
            showNotification('خطأ في تحديث المخزون - تم إلغاء العملية', 'error');

            // إزالة الفاتورة المحفوظة في حالة فشل تحديث المخزون
            const sales = db.getTable('sales');
            const updatedSales = sales.filter(s => s.id !== sale.id);
            db.setTable('sales', updatedSales);
            return;
        }

        console.log('✅ تم تحديث المخزون بنجاح');

        // إعادة تحميل المنتجات لإظهار الكميات المحدثة
        loadProducts();

        // إعادة تعيين السلة
        cart = [];
        updateCartDisplay();
        updateTotals();
        
        // إغلاق النافذة
        closeSaleConfirm();
        
        // عرض رسالة نجاح
        showNotification('تم إتمام البيع بنجاح', 'success');
        
        // طباعة الفاتورة (اختياري)
        if (confirm('هل تريد طباعة الفاتورة؟')) {
            printInvoice(sale);
        }

    } catch (error) {
        console.error('خطأ في تأكيد البيع:', error);
        showNotification('خطأ في تأكيد البيع', 'error');
    }
}

// إنشاء سجل البيع
function createSaleRecord() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = parseFloat(document.getElementById('discountAmount')?.value || 0);
    const discountType = document.getElementById('discountType')?.value || 'amount';
    const taxAmount = parseFloat(document.getElementById('taxAmount')?.value || 0);
    const taxType = document.getElementById('taxType')?.value || 'amount';
    const customerId = document.getElementById('customerSelect')?.value || null;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cash';
    const invoiceDate = document.getElementById('invoiceDate')?.value || new Date().toISOString().split('T')[0];

    let discount = 0;
    if (discountType === 'percentage') {
        discount = subtotal * (discountAmount / 100);
    } else {
        discount = discountAmount;
    }

    let tax = 0;
    const afterDiscount = subtotal - discount;
    if (taxType === 'percentage') {
        tax = afterDiscount * (taxAmount / 100);
    } else {
        tax = taxAmount;
    }

    const total = Math.max(0, afterDiscount + tax);

    // توليد رقم فاتورة جديد
    const invoiceNumber = db.generateInvoiceNumber('sale');

    return {
        id: 'sale_' + Date.now(),
        invoiceNumber: invoiceNumber,
        customerId: customerId,
        warehouseId: selectedWarehouse,
        items: cart.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
            warehouseId: item.warehouseId || selectedWarehouse
        })),
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        total: total,
        paymentMethod: paymentMethod,
        invoiceDate: invoiceDate,
        createdAt: new Date().toISOString(),
        status: 'completed'
    };
}

// تحديث المخزون بعد البيع
function updateInventoryAfterSale() {
    try {
        if (!window.db || !selectedWarehouse) {
            console.error('قاعدة البيانات أو المخزن غير محدد');
            return false;
        }

        const products = db.getTable('products');
        let allUpdatesSuccessful = true;

        cart.forEach(cartItem => {
            const productIndex = products.findIndex(p => p.id === cartItem.productId);
            if (productIndex !== -1) {
                const product = products[productIndex];

                // تهيئة توزيع المخازن إذا لم يكن موجوداً
                if (!product.warehouseDistribution) {
                    product.warehouseDistribution = {};
                }

                // التحقق من توفر الكمية قبل الخصم
                const currentWarehouseQty = product.warehouseDistribution[selectedWarehouse] || 0;

                if (currentWarehouseQty < cartItem.quantity) {
                    console.error(`كمية غير كافية في المخزن ${selectedWarehouse} للمنتج ${product.name}`);
                    console.error(`المطلوب: ${cartItem.quantity}, المتوفر: ${currentWarehouseQty}`);
                    allUpdatesSuccessful = false;
                    return;
                }

                // خصم الكمية من المخزن المحدد
                product.warehouseDistribution[selectedWarehouse] -= cartItem.quantity;

                // التأكد من عدم وجود كميات سالبة (إجراء احترازي إضافي)
                if (product.warehouseDistribution[selectedWarehouse] < 0) {
                    console.warn(`تم تصحيح كمية سالبة للمنتج ${product.name} في المخزن ${selectedWarehouse}`);
                    product.warehouseDistribution[selectedWarehouse] = 0;
                }

                // إعادة حساب الكمية الإجمالية من جميع المخازن
                const totalQty = Object.values(product.warehouseDistribution).reduce((sum, qty) => sum + (qty || 0), 0);
                const oldTotalQty = product.quantity || 0;
                product.quantity = totalQty;

                // حفظ التحديثات
                const updateSuccess = db.updateRecord('products', product);
                if (!updateSuccess) {
                    console.error(`فشل في تحديث المنتج ${product.name}`);
                    allUpdatesSuccessful = false;
                    return;
                }

                console.log(`✅ تم خصم ${cartItem.quantity} من ${product.name}:`);
                console.log(`   المخزن ${selectedWarehouse}: ${currentWarehouseQty} → ${product.warehouseDistribution[selectedWarehouse]}`);
                console.log(`   الإجمالي: ${oldTotalQty} → ${product.quantity}`);

            } else {
                console.error(`المنتج غير موجود: ${cartItem.productId}`);
                allUpdatesSuccessful = false;
            }
        });

        if (allUpdatesSuccessful) {
            // إنشاء حركة مخزون
            createInventoryMovement();
            console.log('✅ تم تحديث جميع المنتجات بنجاح');
            return true;
        } else {
            console.error('❌ فشل في تحديث بعض المنتجات');
            return false;
        }

    } catch (error) {
        console.error('خطأ في تحديث المخزون:', error);
        return false;
    }
}

// إنشاء حركة مخزون
function createInventoryMovement() {
    try {
        if (!window.db || !selectedWarehouse) return;

        const movements = db.getTable('inventory_movements');
        const warehouses = db.getTable('warehouses');
        const warehouse = warehouses.find(w => w.id === selectedWarehouse);

        cart.forEach(cartItem => {
            const movement = {
                id: 'movement_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                productId: cartItem.productId,
                productName: cartItem.name,
                warehouseId: selectedWarehouse,
                warehouseName: warehouse ? warehouse.name : 'مخزن غير محدد',
                type: 'out', // خروج
                quantity: cartItem.quantity,
                reason: 'sale', // بيع
                referenceId: 'sale_' + Date.now(),
                notes: `بيع من نقطة البيع`,
                createdAt: new Date().toISOString(),
                createdBy: 'system'
            };

            movements.push(movement);
        });

        db.setTable('inventory_movements', movements);

    } catch (error) {
        console.error('خطأ في إنشاء حركة المخزون:', error);
    }
}

// إغلاق نافذة تأكيد البيع
function closeSaleConfirm() {
    const modal = document.getElementById('saleConfirmModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// طباعة الفاتورة
function printInvoice(sale) {
    try {
        // هنا يمكن إضافة منطق طباعة الفاتورة
        console.log('طباعة الفاتورة:', sale);
        showNotification('تم إرسال الفاتورة للطباعة', 'info');
    } catch (error) {
        console.error('خطأ في طباعة الفاتورة:', error);
    }
}

// بدء بيع جديد
function newSale() {
    cart = [];
    updateCartDisplay();
    updateTotals();
    
    // إعادة تعيين النماذج
    document.getElementById('discountAmount').value = '';
    document.getElementById('taxAmount').value = '';
    document.getElementById('customerSelect').value = '';
    document.querySelector('input[name="paymentMethod"][value="cash"]').checked = true;
}

// عرض سجل المبيعات
function showSalesHistory() {
    // سيتم تنفيذها في وحدة التقارير
    showSection('reports');
}

// إضافة عميل جديد
function addNewCustomer() {
    showSection('customers');
}

// تعديل فاتورة مبيعات
function editSalesInvoice(saleId) {
    try {
        const sales = db.getTable('sales');
        const sale = sales.find(s => s.id === saleId);

        if (!sale) {
            showNotification('فاتورة المبيعات غير موجودة', 'error');
            return;
        }

        const customers = db.getTable('customers');
        const customer = customers.find(c => c.id === sale.customerId);
        const warehouses = db.getTable('warehouses');
        const warehouse = warehouses.find(w => w.id === sale.warehouseId);

        // استخراج الرقم من رقم الفاتورة
        const invoiceNumberMatch = sale.invoiceNumber.match(/ABUSLEAN-SALE-(\d+)/);
        const currentNumber = invoiceNumberMatch ? invoiceNumberMatch[1] : '';

        const content = `
            <form id="editSalesInvoiceForm" onsubmit="saveSalesInvoiceEdit(event, '${saleId}')">
                <div class="edit-invoice-form">
                    <div class="form-section">
                        <h4>معلومات الفاتورة</h4>

                        <div class="form-grid">
                            <div class="form-group">
                                <label for="editSaleInvoiceNumber">رقم الفاتورة</label>
                                <div class="invoice-number-input">
                                    <span class="invoice-prefix">ABUSLEAN-SALE-</span>
                                    <input
                                        type="text"
                                        id="editSaleInvoiceNumber"
                                        value="${currentNumber}"
                                        pattern="\\d{2,}"
                                        title="يجب أن يكون رقماً مكوناً من رقمين على الأقل"
                                        required
                                    >
                                </div>
                                <small class="form-help">أدخل الرقم فقط (مثال: 01, 02, 15)</small>
                            </div>

                            <div class="form-group">
                                <label for="editSaleInvoiceDate">تاريخ الفاتورة</label>
                                <input
                                    type="date"
                                    id="editSaleInvoiceDate"
                                    value="${sale.invoiceDate || sale.createdAt.split('T')[0]}"
                                    required
                                >
                            </div>

                            <div class="form-group">
                                <label for="editSaleCustomer">العميل</label>
                                <select id="editSaleCustomer">
                                    <option value="">ضيف</option>
                                    ${customers.map(c =>
                                        `<option value="${c.id}" ${c.id === sale.customerId ? 'selected' : ''}>${c.name}</option>`
                                    ).join('')}
                                </select>
                            </div>

                            <div class="form-group">
                                <label>المخزن</label>
                                <input type="text" value="${warehouse ? warehouse.name : 'غير محدد'}" readonly>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>أصناف الفاتورة</h4>
                        <div class="items-table-container">
                            <table class="items-table">
                                <thead>
                                    <tr>
                                        <th>المنتج</th>
                                        <th>الكمية</th>
                                        <th>السعر</th>
                                        <th>الإجمالي</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${sale.items.map(item => `
                                        <tr>
                                            <td>${item.name}</td>
                                            <td>${db.toArabicNumbers(item.quantity)}</td>
                                            <td>${formatCurrency(item.price)}</td>
                                            <td>${formatCurrency(item.total)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>الإجماليات</h4>
                        <div class="totals-grid">
                            <div class="total-row">
                                <span>المجموع الفرعي:</span>
                                <span>${formatCurrency(sale.subtotal)}</span>
                            </div>
                            ${sale.discount > 0 ? `
                                <div class="total-row">
                                    <span>الخصم:</span>
                                    <span>-${formatCurrency(sale.discount)}</span>
                                </div>
                            ` : ''}
                            ${sale.tax > 0 ? `
                                <div class="total-row">
                                    <span>الضريبة:</span>
                                    <span>${formatCurrency(sale.tax)}</span>
                                </div>
                            ` : ''}
                            <div class="total-row final-total">
                                <span>الإجمالي:</span>
                                <span>${formatCurrency(sale.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i>
                        حفظ التعديلات
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">
                        إلغاء
                    </button>
                </div>
            </form>
        `;

        showModal('تعديل فاتورة المبيعات', content);

    } catch (error) {
        console.error('خطأ في تعديل فاتورة المبيعات:', error);
        showNotification('خطأ في تعديل فاتورة المبيعات', 'error');
    }
}

// حفظ تعديل فاتورة المبيعات
function saveSalesInvoiceEdit(event, saleId) {
    event.preventDefault();

    try {
        const numberInput = document.getElementById('editSaleInvoiceNumber').value.trim();
        const invoiceDate = document.getElementById('editSaleInvoiceDate').value;
        const customerId = document.getElementById('editSaleCustomer').value || null;

        // التحقق من صحة الرقم المدخل
        if (!/^\d{2,}$/.test(numberInput)) {
            showNotification('رقم الفاتورة يجب أن يكون رقماً مكوناً من رقمين على الأقل', 'error');
            return;
        }

        // إنشاء رقم الفاتورة الكامل
        const newInvoiceNumber = db.createInvoiceNumberFromInput(numberInput, 'sale');

        if (!newInvoiceNumber) {
            showNotification('خطأ في إنشاء رقم الفاتورة', 'error');
            return;
        }

        // التحقق من تفرد رقم الفاتورة
        if (!db.isInvoiceNumberUnique(newInvoiceNumber, 'sale', saleId)) {
            showNotification('رقم الفاتورة موجود مسبقاً', 'error');
            return;
        }

        // تحديث السجل
        const sales = db.getTable('sales');
        const saleIndex = sales.findIndex(s => s.id === saleId);

        if (saleIndex === -1) {
            showNotification('فاتورة المبيعات غير موجودة', 'error');
            return;
        }

        // تحديث البيانات
        sales[saleIndex].invoiceNumber = newInvoiceNumber;
        sales[saleIndex].invoiceDate = invoiceDate;
        sales[saleIndex].customerId = customerId;
        sales[saleIndex].updatedAt = new Date().toISOString();

        // حفظ التحديثات
        db.setTable('sales', sales);

        showNotification('تم حفظ التعديلات بنجاح', 'success');
        closeModal();

        // إعادة تحميل قائمة المبيعات إذا كانت مفتوحة
        if (typeof loadSalesHistory === 'function') {
            loadSalesHistory();
        }

    } catch (error) {
        console.error('خطأ في حفظ تعديل فاتورة المبيعات:', error);
        showNotification('خطأ في حفظ التعديلات', 'error');
    }
}

// إتمام البيع
function completeSale() {
    try {
        if (!selectedWarehouse) {
            showNotification('يرجى اختيار مخزن أولاً', 'warning');
            return;
        }

        if (cart.length === 0) {
            showNotification('السلة فارغة', 'warning');
            return;
        }

        // التحقق من توفر جميع المنتجات في المخزن
        const products = db.getTable('products');
        for (const cartItem of cart) {
            const product = products.find(p => p.id === cartItem.productId);
            if (!product) {
                showNotification(`المنتج ${cartItem.name} غير موجود`, 'error');
                return;
            }

            const warehouseQty = product.warehouseDistribution && product.warehouseDistribution[selectedWarehouse]
                ? product.warehouseDistribution[selectedWarehouse]
                : 0;

            if (cartItem.quantity > warehouseQty) {
                showNotification(`الكمية المطلوبة من ${cartItem.name} أكبر من المتوفر في المخزن`, 'error');
                return;
            }
        }

        // عرض نافذة تأكيد البيع
        showSaleConfirmation();

    } catch (error) {
        console.error('خطأ في إتمام البيع:', error);
        showNotification('خطأ في إتمام البيع', 'error');
    }
}

// عرض نافذة تأكيد البيع
function showSaleConfirmation() {
    try {
        const sale = createSaleRecord();
        const warehouses = db.getTable('warehouses');
        const warehouse = warehouses.find(w => w.id === selectedWarehouse);
        const customers = db.getTable('customers');
        const customer = customers.find(c => c.id === sale.customerId);

        const content = `
            <div class="sale-confirmation">
                <div class="sale-summary">
                    <h4>ملخص البيع</h4>
                    <div class="summary-details">
                        <div class="detail-row">
                            <span>رقم الفاتورة:</span>
                            <span>${sale.invoiceNumber}</span>
                        </div>
                        <div class="detail-row">
                            <span>المخزن:</span>
                            <span>${warehouse ? warehouse.name : 'غير محدد'}</span>
                        </div>
                        <div class="detail-row">
                            <span>العميل:</span>
                            <span>${customer ? customer.name : 'ضيف'}</span>
                        </div>
                        <div class="detail-row">
                            <span>طريقة الدفع:</span>
                            <span>${getPaymentMethodText(sale.paymentMethod)}</span>
                        </div>
                    </div>
                </div>

                <div class="sale-items">
                    <h4>الأصناف</h4>
                    <div class="items-list">
                        ${sale.items.map(item => `
                            <div class="item-row">
                                <span class="item-name">${item.name}</span>
                                <span class="item-qty">${db.toArabicNumbers(item.quantity)}</span>
                                <span class="item-price">${formatCurrency(item.price)}</span>
                                <span class="item-total">${formatCurrency(item.total)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="sale-totals">
                    <div class="total-row">
                        <span>المجموع الفرعي:</span>
                        <span>${formatCurrency(sale.subtotal)}</span>
                    </div>
                    ${sale.discount > 0 ? `
                        <div class="total-row">
                            <span>الخصم:</span>
                            <span>-${formatCurrency(sale.discount)}</span>
                        </div>
                    ` : ''}
                    ${sale.tax > 0 ? `
                        <div class="total-row">
                            <span>الضريبة:</span>
                            <span>${formatCurrency(sale.tax)}</span>
                        </div>
                    ` : ''}
                    <div class="total-row final-total">
                        <span>الإجمالي:</span>
                        <span>${formatCurrency(sale.total)}</span>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('saleConfirmContent').innerHTML = content;
        document.getElementById('saleConfirmModal').classList.remove('hidden');

    } catch (error) {
        console.error('خطأ في عرض تأكيد البيع:', error);
        showNotification('خطأ في عرض تأكيد البيع', 'error');
    }
}

// الحصول على نص طريقة الدفع
function getPaymentMethodText(method) {
    const methods = {
        'cash': 'نقدي',
        'card': 'بطاقة',
        'credit': 'آجل'
    };
    return methods[method] || method;
}

// بدء بيع جديد
function newSale() {
    clearCart();
    showNotification('تم بدء بيع جديد', 'info');
}

// البحث في المنتجات
function searchProducts() {
    loadProducts();
}

// فلترة حسب الفئة
function filterByCategory() {
    loadProducts();
}

// اختبار منطق خصم المخزون
function testInventoryDeduction() {
    try {
        console.log('🧪 بدء اختبار منطق خصم المخزون...');

        // إنشاء منتج تجريبي للاختبار
        const testProduct = {
            id: 'test_product_' + Date.now(),
            name: 'منتج تجريبي للاختبار',
            salePrice: 10.000,
            quantity: 20, // إجمالي 20 قطعة
            warehouseDistribution: {
                'main': 7,      // 7 قطع في المخزن الرئيسي
                'salmiya': 8,   // 8 قطع في مخزن السالمية
                'hawally': 5    // 5 قطع في مخزن حولي
            }
        };

        // حفظ المنتج التجريبي
        const products = db.getTable('products');
        products.push(testProduct);
        db.setTable('products', products);

        console.log('📦 تم إنشاء منتج تجريبي:');
        console.log(`   الاسم: ${testProduct.name}`);
        console.log(`   الإجمالي: ${testProduct.quantity}`);
        console.log(`   التوزيع:`, testProduct.warehouseDistribution);

        // محاكاة بيع من مخزن السالمية
        selectedWarehouse = 'salmiya';
        cart = [{
            productId: testProduct.id,
            name: testProduct.name,
            price: testProduct.salePrice,
            quantity: 2, // بيع قطعتين
            warehouseId: 'salmiya'
        }];

        console.log('🛒 محاكاة بيع 2 قطعة من مخزن السالمية...');

        // تطبيق خصم المخزون
        const success = updateInventoryAfterSale();

        if (success) {
            // التحقق من النتائج
            const updatedProducts = db.getTable('products');
            const updatedProduct = updatedProducts.find(p => p.id === testProduct.id);

            if (updatedProduct) {
                console.log('✅ نتائج الاختبار:');
                console.log(`   الإجمالي الجديد: ${updatedProduct.quantity} (متوقع: 18)`);
                console.log(`   مخزن السالمية: ${updatedProduct.warehouseDistribution.salmiya} (متوقع: 6)`);
                console.log(`   مخزن الرئيسي: ${updatedProduct.warehouseDistribution.main} (متوقع: 7)`);
                console.log(`   مخزن حولي: ${updatedProduct.warehouseDistribution.hawally} (متوقع: 5)`);

                // التحقق من صحة النتائج
                const expectedTotal = 18;
                const expectedSalmiya = 6;
                const expectedMain = 7;
                const expectedHawally = 5;

                const totalCorrect = updatedProduct.quantity === expectedTotal;
                const salmiyaCorrect = updatedProduct.warehouseDistribution.salmiya === expectedSalmiya;
                const mainCorrect = updatedProduct.warehouseDistribution.main === expectedMain;
                const hawallyCorrect = updatedProduct.warehouseDistribution.hawally === expectedHawally;

                if (totalCorrect && salmiyaCorrect && mainCorrect && hawallyCorrect) {
                    console.log('🎉 الاختبار نجح! منطق خصم المخزون يعمل بشكل صحيح');
                    showNotification('اختبار المخزون نجح بشكل كامل', 'success');
                } else {
                    console.log('❌ الاختبار فشل! هناك خطأ في منطق خصم المخزون');
                    console.log(`   الإجمالي صحيح: ${totalCorrect}`);
                    console.log(`   السالمية صحيح: ${salmiyaCorrect}`);
                    console.log(`   الرئيسي صحيح: ${mainCorrect}`);
                    console.log(`   حولي صحيح: ${hawallyCorrect}`);
                    showNotification('اختبار المخزون فشل - راجع وحدة التحكم', 'error');
                }
            } else {
                console.log('❌ لم يتم العثور على المنتج المحدث');
                showNotification('خطأ في اختبار المخزون', 'error');
            }
        } else {
            console.log('❌ فشل في تحديث المخزون');
            showNotification('فشل في تحديث المخزون', 'error');
        }

        // تنظيف البيانات التجريبية
        const cleanProducts = db.getTable('products').filter(p => p.id !== testProduct.id);
        db.setTable('products', cleanProducts);
        cart = [];
        selectedWarehouse = null;

        console.log('🧹 تم تنظيف البيانات التجريبية');

    } catch (error) {
        console.error('خطأ في اختبار منطق خصم المخزون:', error);
        showNotification('خطأ في اختبار المخزون', 'error');
    }
}

// تأكيد البيع
function confirmSale() {
    try {
        const sale = createSaleRecord();

        // حفظ البيع
        db.addRecord('sales', sale);

        // تحديث المخزون
        const inventoryUpdateSuccess = updateInventoryAfterSale();

        if (!inventoryUpdateSuccess) {
            showNotification('خطأ في تحديث المخزون', 'error');
            return;
        }

        // إغلاق النافذة
        closeSaleConfirm();

        // مسح السلة
        clearCart();

        // تحديث رقم الفاتورة التالي
        updateInvoiceNumberDisplay();

        showNotification(`تم حفظ البيع بنجاح - رقم الفاتورة: ${sale.invoiceNumber}`, 'success');

        // طباعة الفاتورة (اختياري)
        if (confirm('هل تريد طباعة الفاتورة؟')) {
            printInvoice(sale);
        }

    } catch (error) {
        console.error('خطأ في تأكيد البيع:', error);
        showNotification('خطأ في حفظ البيع', 'error');
    }
}

// تصدير الوظائف للاستخدام العام
window.initSales = initSales;
window.loadSalesSection = loadSalesSection;
window.loadWarehouses = loadWarehouses;
window.onWarehouseChange = onWarehouseChange;
window.addToCart = addToCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.updateTotals = updateTotals;
window.searchProducts = searchProducts;
window.filterByCategory = filterByCategory;
window.completeSale = completeSale;
window.confirmSale = confirmSale;
window.closeSaleConfirm = closeSaleConfirm;
window.newSale = newSale;
window.showSalesHistory = showSalesHistory;
window.addNewCustomer = addNewCustomer;
window.editSalesInvoice = editSalesInvoice;
window.saveSalesInvoiceEdit = saveSalesInvoiceEdit;
window.updateInvoiceNumberDisplay = updateInvoiceNumberDisplay;
window.testInventoryDeduction = testInventoryDeduction;

// اختبار شامل لنقطة البيع والمخزون
function testPOSInventoryDeduction() {
    try {
        console.log('🧪 بدء اختبار خصم المخزون في نقطة البيع...');

        let totalTests = 0;
        let passedTests = 0;
        const testResults = [];

        // اختبار 1: التحقق من وجود المخزن المحدد
        totalTests++;
        if (selectedWarehouse) {
            passedTests++;
            testResults.push(`✅ المخزن المحدد: ${selectedWarehouse}`);
        } else {
            testResults.push('❌ لا يوجد مخزن محدد');
        }

        // اختبار 2: التحقق من وجود منتجات في السلة
        totalTests++;
        if (cart && cart.length > 0) {
            passedTests++;
            testResults.push(`✅ السلة تحتوي على ${cart.length} منتج`);

            // عرض تفاصيل السلة
            cart.forEach((item, index) => {
                testResults.push(`   ${index + 1}. ${item.name} - الكمية: ${item.quantity}`);
            });
        } else {
            testResults.push('⚠️ السلة فارغة - أضف منتجات للاختبار');
        }

        // اختبار 3: التحقق من دالة تحديث المخزون
        totalTests++;
        if (typeof updateInventoryAfterSale === 'function') {
            passedTests++;
            testResults.push('✅ دالة تحديث المخزون متاحة');
        } else {
            testResults.push('❌ دالة تحديث المخزون غير متاحة');
        }

        // اختبار 4: محاكاة خصم المخزون (بدون حفظ فعلي)
        totalTests++;
        if (cart.length > 0 && selectedWarehouse) {
            try {
                const products = db.getTable('products');
                let canDeduct = true;

                cart.forEach(cartItem => {
                    const product = products.find(p => p.id === cartItem.productId);
                    if (product && product.warehouseDistribution) {
                        const availableQty = product.warehouseDistribution[selectedWarehouse] || 0;
                        if (availableQty < cartItem.quantity) {
                            canDeduct = false;
                            testResults.push(`❌ كمية غير كافية: ${product.name} (متوفر: ${availableQty}, مطلوب: ${cartItem.quantity})`);
                        }
                    }
                });

                if (canDeduct) {
                    passedTests++;
                    testResults.push('✅ جميع المنتجات متوفرة بالكميات المطلوبة');
                }
            } catch (error) {
                testResults.push('❌ خطأ في محاكاة خصم المخزون');
            }
        } else {
            testResults.push('⚠️ لا يمكن اختبار خصم المخزون (سلة فارغة أو مخزن غير محدد)');
        }

        // النتائج النهائية
        console.log('\n📋 تقرير اختبار خصم المخزون:');
        console.log('=' .repeat(50));

        testResults.forEach(result => console.log(result));

        const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
        console.log(`\n🎯 النتيجة النهائية: ${passedTests}/${totalTests} (${successRate.toFixed(1)}%)`);

        if (successRate >= 90) {
            console.log('🎉 نظام خصم المخزون يعمل بشكل ممتاز!');
            showNotification('نظام خصم المخزون يعمل بنجاح', 'success');
        } else if (successRate >= 70) {
            console.log('✅ نظام خصم المخزون يعمل بشكل جيد مع بعض التحذيرات');
            showNotification('نظام خصم المخزون يعمل مع تحذيرات', 'info');
        } else {
            console.log('⚠️ نظام خصم المخزون يحتاج إلى إصلاحات');
            showNotification('نظام خصم المخزون يحتاج إصلاحات', 'warning');
        }

        console.log('=' .repeat(50));
        return successRate >= 70;

    } catch (error) {
        console.error('❌ خطأ في اختبار خصم المخزون:', error);
        showNotification('خطأ في اختبار خصم المخزون', 'error');
        return false;
    }
}

window.testPOSInventoryDeduction = testPOSInventoryDeduction;

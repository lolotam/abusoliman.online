/**
 * وحدة المبيعات ونقاط البيع
 * أبوسليمان للمحاسبة - نظام إدارة نقاط البيع
 */

// متغيرات السلة
let cart = [];
let currentSale = null;

// تهيئة صفحة المبيعات
function initSales() {
    loadProducts();
    loadCustomers();
    loadCategories();
    updateCartDisplay();
    updateTotals();
}

// تحميل المنتجات
function loadProducts() {
    try {
        if (!window.db) return;

        const products = db.getTable('products');
        const productsGrid = document.getElementById('productsGrid');
        
        if (!productsGrid) return;

        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open"></i>
                    <p>لا توجد منتجات متاحة</p>
                    <button class="btn primary" onclick="showSection('products')">
                        <i class="fas fa-plus"></i>
                        إضافة منتج
                    </button>
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

// تحميل الفئات
function loadCategories() {
    try {
        if (!window.db) return;

        const products = db.getTable('products');
        const categories = [...new Set(products.map(p => p.category).filter(c => c))];
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (!categoryFilter) return;

        categoryFilter.innerHTML = '<option value="">جميع الفئات</option>' +
            categories.map(category => `
                <option value="${category}">${category}</option>
            `).join('');

    } catch (error) {
        console.error('خطأ في تحميل الفئات:', error);
    }
}

// إضافة منتج للسلة
function addToCart(productId) {
    try {
        if (!window.db) return;

        const products = db.getTable('products');
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            showNotification('المنتج غير موجود', 'error');
            return;
        }

        if (product.quantity <= 0) {
            showNotification('المنتج غير متوفر في المخزون', 'warning');
            return;
        }

        // البحث عن المنتج في السلة
        const existingItem = cart.find(item => item.productId === productId);
        
        if (existingItem) {
            if (existingItem.quantity >= product.quantity) {
                showNotification('لا يمكن إضافة كمية أكثر من المتوفر', 'warning');
                return;
            }
            existingItem.quantity += 1;
        } else {
            cart.push({
                productId: productId,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
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
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (!cartItems) return;

        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>السلة فارغة</p>
                </div>
            `;
            if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }

        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" class="cart-item-image">` : ''}
                    <div class="cart-item-details">
                        <h5 class="cart-item-name">${item.name}</h5>
                        <p class="cart-item-price">${formatCurrency(item.price)}</p>
                    </div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="btn btn-sm" onclick="updateCartItemQuantity(${index}, ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${toArabicNumbers(item.quantity)}</span>
                        <button class="btn btn-sm" onclick="updateCartItemQuantity(${index}, ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="btn btn-sm error" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="cart-item-total">
                    ${formatCurrency(item.price * item.quantity)}
                </div>
            </div>
        `).join('');

        if (checkoutBtn) checkoutBtn.disabled = false;

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

        // التحقق من المخزون المتاح
        if (window.db) {
            const products = db.getTable('products');
            const product = products.find(p => p.id === item.productId);
            
            if (product && newQuantity > product.quantity) {
                showNotification('الكمية المطلوبة أكبر من المتوفر في المخزون', 'warning');
                return;
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
        updateInventoryAfterSale();
        
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

    return {
        id: 'sale_' + Date.now(),
        customerId: customerId,
        items: cart.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity
        })),
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        total: total,
        paymentMethod: paymentMethod,
        createdAt: new Date().toISOString(),
        status: 'completed'
    };
}

// تحديث المخزون بعد البيع
function updateInventoryAfterSale() {
    try {
        if (!window.db) return;

        const products = db.getTable('products');
        
        cart.forEach(cartItem => {
            const productIndex = products.findIndex(p => p.id === cartItem.productId);
            if (productIndex !== -1) {
                products[productIndex].quantity -= cartItem.quantity;
                db.updateRecord('products', products[productIndex]);
            }
        });

    } catch (error) {
        console.error('خطأ في تحديث المخزون:', error);
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

// تصدير الوظائف للاستخدام العام
window.initSales = initSales;
window.addToCart = addToCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.updateTotals = updateTotals;
window.searchProducts = searchProducts;
window.filterByCategory = filterByCategory;
window.completeSale = completeSale;
window.confirmSale = confirmSale;
window.calculateChange = calculateChange;
window.closeSaleConfirm = closeSaleConfirm;
window.newSale = newSale;
window.showSalesHistory = showSalesHistory;
window.addNewCustomer = addNewCustomer;

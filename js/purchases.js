/**
 * وحدة المشتريات وإدارة الموردين
 * أبوسليمان للمحاسبة - نظام إدارة نقاط البيع
 */

// متغيرات المشتريات
let currentPurchase = null;
let purchaseItems = [];

// التأكد من عدم تعارض المتغيرات العامة
if (typeof window !== 'undefined' && !window.purchaseModuleLoaded) {
    window.purchaseModuleLoaded = true;
}

// تهيئة صفحة المشتريات
function initPurchases() {
    loadPurchases();
    loadSuppliers();
    loadProducts();
}

// تحميل المشتريات
function loadPurchases() {
    try {
        if (!window.db) return;

        const purchases = db.getTable('purchases');
        const purchasesContainer = document.getElementById('purchasesContainer');
        
        if (!purchasesContainer) return;

        if (purchases.length === 0) {
            purchasesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>لا توجد فواتير شراء</h3>
                    <p>ابدأ بإضافة فاتورة شراء جديدة</p>
                    <button class="btn btn-primary" onclick="showAddPurchaseModal()">
                        <i class="fas fa-plus"></i>
                        إضافة فاتورة شراء
                    </button>
                </div>
            `;
            return;
        }

        purchasesContainer.innerHTML = purchases.map(purchase => {
            const supplier = getSupplierById(purchase.supplierId);
            const supplierName = supplier ? supplier.name : 'مورد غير محدد';
            
            return `
                <div class="purchase-card">
                    <div class="purchase-header">
                        <div class="purchase-info">
                            <h3>${purchase.invoiceNumber || purchase.id}</h3>
                            <p class="purchase-supplier">المورد: ${supplierName}</p>
                            <p class="purchase-date">${formatDate(purchase.createdAt)}</p>
                        </div>
                        <div class="purchase-total">
                            <span class="total-label">الإجمالي</span>
                            <span class="total-amount">${formatCurrency(purchase.total)}</span>
                        </div>
                    </div>
                    
                    <div class="purchase-details">
                        <div class="detail-item">
                            <span class="label">عدد الأصناف:</span>
                            <span class="value">${purchase.items ? purchase.items.length : 0}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">الحالة:</span>
                            <span class="value status-${purchase.status}">${getPurchaseStatusText(purchase.status)}</span>
                        </div>
                    </div>
                    
                    <div class="purchase-actions">
                        <button class="btn btn-sm btn-info" onclick="viewPurchase('${purchase.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="editPurchase('${purchase.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="printPurchase('${purchase.id}')" title="طباعة">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deletePurchase('${purchase.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('خطأ في تحميل المشتريات:', error);
        showNotification('خطأ في تحميل المشتريات', 'error');
    }
}

// الحصول على مورد بالمعرف
function getSupplierById(supplierId) {
    const suppliers = db.getTable('suppliers');
    return suppliers.find(supplier => supplier.id === supplierId);
}

// الحصول على نص حالة المشتريات
function getPurchaseStatusText(status) {
    const statusTexts = {
        'pending': 'في الانتظار',
        'completed': 'مكتملة',
        'cancelled': 'ملغية'
    };
    return statusTexts[status] || status;
}

// عرض نافذة إضافة فاتورة شراء
function showAddPurchaseModal() {
    const suppliers = db.getTable('suppliers');
    
    if (suppliers.length === 0) {
        showNotification('يجب إضافة موردين أولاً', 'warning');
        return;
    }

    const content = `
        <form id="purchaseForm" onsubmit="savePurchase(event)">
            <div class="invoice-form">
                <div class="invoice-header">
                    <h3 class="invoice-title">فاتورة شراء جديدة</h3>
                    <div class="invoice-number">
                        <span>رقم الفاتورة: سيتم توليده تلقائياً</span>
                    </div>
                </div>
                
                <div class="invoice-form-grid">
                    <div class="invoice-form-group">
                        <label for="purchaseSupplier">المورد *</label>
                        <select id="purchaseSupplier" required onchange="loadSupplierProducts()">
                            <option value="">اختر مورد</option>
                            ${suppliers.map((supplier, index) => 
                                `<option value="${supplier.id}">${index + 1}. ${supplier.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="invoice-form-group">
                        <label for="purchaseDate">تاريخ الفاتورة</label>
                        <input type="date" id="purchaseDate" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <div class="invoice-form-group">
                        <label for="purchaseNotes">ملاحظات</label>
                        <textarea id="purchaseNotes" rows="2"></textarea>
                    </div>
                </div>
                
                <div class="invoice-items-section">
                    <div class="invoice-items-header">
                        <h4 class="invoice-items-title">أصناف الفاتورة</h4>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="addPurchaseItem()">
                            <i class="fas fa-plus"></i>
                            إضافة صنف
                        </button>
                    </div>
                    
                    <div id="purchaseItemsContainer">
                        <!-- سيتم إضافة الأصناف هنا -->
                    </div>
                </div>
                
                <div class="warehouse-distribution-section" id="warehouseDistributionSection" style="display: none;">
                    <div class="distribution-header">
                        <h4 class="distribution-title">توزيع المخزون على المخازن</h4>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="autoDistributeToMainWarehouse()">
                            <i class="fas fa-magic"></i>
                            توزيع تلقائي للمخزن الرئيسي
                        </button>
                    </div>
                    <div id="warehouseDistributionContainer">
                        <!-- سيتم إضافة توزيع المخازن هنا -->
                    </div>
                </div>

                <div class="invoice-summary">
                    <div class="summary-row">
                        <span class="summary-label">المجموع الفرعي:</span>
                        <span id="purchaseSubtotal" class="summary-value">0.000 د.ك</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">الخصم:</span>
                        <input type="number" id="purchaseDiscount" step="0.001" min="0" value="0" onchange="calculatePurchaseTotal()">
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">الضريبة:</span>
                        <input type="number" id="purchaseTax" step="0.001" min="0" value="0" onchange="calculatePurchaseTotal()">
                    </div>
                    <div class="summary-row total-row">
                        <span class="summary-label">الإجمالي:</span>
                        <span id="purchaseTotal" class="summary-value">0.000 د.ك</span>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    حفظ الفاتورة
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('إضافة فاتورة شراء', content);
    
    // إضافة صنف افتراضي
    setTimeout(() => {
        addPurchaseItem();
    }, 100);
}

// إضافة صنف للفاتورة
function addPurchaseItem() {
    const container = document.getElementById('purchaseItemsContainer');
    if (!container) return;

    const itemIndex = container.children.length;
    const products = db.getTable('products');
    
    const itemHtml = `
        <div class="purchase-item" data-index="${itemIndex}">
            <div class="item-controls">
                <select class="item-product" onchange="updateItemPrice(${itemIndex})" required>
                    <option value="">اختر منتج</option>
                    ${products.map(product => 
                        `<option value="${product.id}" data-price="${product.purchasePrice || 0}">${product.name}</option>`
                    ).join('')}
                </select>
                
                <input type="number" class="item-quantity" placeholder="الكمية" min="1" value="1" onchange="calculateItemTotal(${itemIndex})" required>
                
                <input type="number" class="item-price" placeholder="السعر" step="0.001" min="0" onchange="calculateItemTotal(${itemIndex})" required>
                
                <input type="number" class="item-total" placeholder="الإجمالي" step="0.001" readonly>
                
                <button type="button" class="btn btn-danger btn-sm" onclick="removePurchaseItem(${itemIndex})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', itemHtml);
}

// تحديث سعر الصنف عند اختيار المنتج
function updateItemPrice(itemIndex) {
    const item = document.querySelector(`[data-index="${itemIndex}"]`);
    if (!item) return;

    const productSelect = item.querySelector('.item-product');
    const priceInput = item.querySelector('.item-price');
    
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    if (selectedOption && selectedOption.dataset.price) {
        priceInput.value = selectedOption.dataset.price;
        calculateItemTotal(itemIndex);
    }
}

// حساب إجمالي الصنف
function calculateItemTotal(itemIndex) {
    const item = document.querySelector(`[data-index="${itemIndex}"]`);
    if (!item) return;

    const quantity = parseFloat(item.querySelector('.item-quantity').value) || 0;
    const price = parseFloat(item.querySelector('.item-price').value) || 0;
    const total = quantity * price;
    
    item.querySelector('.item-total').value = total.toFixed(3);
    
    calculatePurchaseTotal();
}

// حذف صنف من الفاتورة
function removePurchaseItem(itemIndex) {
    const item = document.querySelector(`[data-index="${itemIndex}"]`);
    if (item) {
        item.remove();
        calculatePurchaseTotal();
    }
}

// حساب إجمالي الفاتورة
function calculatePurchaseTotal() {
    const items = document.querySelectorAll('.purchase-item');
    let subtotal = 0;

    items.forEach(item => {
        const total = parseFloat(item.querySelector('.item-total').value) || 0;
        subtotal += total;
    });

    const discount = parseFloat(document.getElementById('purchaseDiscount')?.value) || 0;
    const tax = parseFloat(document.getElementById('purchaseTax')?.value) || 0;
    const total = subtotal - discount + tax;

    document.getElementById('purchaseSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('purchaseTotal').textContent = formatCurrency(total);

    // إظهار قسم توزيع المخازن إذا كان هناك أصناف
    const distributionSection = document.getElementById('warehouseDistributionSection');
    if (distributionSection) {
        if (items.length > 0) {
            distributionSection.style.display = 'block';
            updateWarehouseDistribution();
        } else {
            distributionSection.style.display = 'none';
        }
    }
}

// تحديث توزيع المخازن
function updateWarehouseDistribution() {
    try {
        const warehouses = db.getTable('warehouses').filter(w => w.isActive);
        const items = document.querySelectorAll('.purchase-item');
        const container = document.getElementById('warehouseDistributionContainer');

        if (!container || items.length === 0) return;

        let distributionHtml = '';

        items.forEach((item, itemIndex) => {
            const productSelect = item.querySelector('.item-product');
            const quantityInput = item.querySelector('.item-quantity');

            if (!productSelect.value || !quantityInput.value) return;

            const product = db.getTable('products').find(p => p.id === productSelect.value);
            const totalQuantity = parseFloat(quantityInput.value) || 0;

            if (!product || totalQuantity <= 0) return;

            distributionHtml += `
                <div class="distribution-item" data-item-index="${itemIndex}">
                    <div class="distribution-header">
                        <h5 class="product-name">${product.name}</h5>
                        <span class="total-quantity">الكمية الإجمالية: ${db.toArabicNumbers(totalQuantity)}</span>
                    </div>

                    <div class="distribution-grid">
                        ${warehouses.map((warehouse, warehouseIndex) => `
                            <div class="warehouse-distribution">
                                <label for="dist_${itemIndex}_${warehouseIndex}">${warehouse.name}</label>
                                <input
                                    type="number"
                                    id="dist_${itemIndex}_${warehouseIndex}"
                                    class="warehouse-qty-input"
                                    data-item-index="${itemIndex}"
                                    data-warehouse-id="${warehouse.id}"
                                    min="0"
                                    max="${totalQuantity}"
                                    step="1"
                                    value="0"
                                    onchange="validateDistribution(${itemIndex})"
                                >
                                <small class="current-stock">
                                    المخزون الحالي: ${db.toArabicNumbers(getCurrentWarehouseStock(product.id, warehouse.id))}
                                </small>
                            </div>
                        `).join('')}
                    </div>

                    <div class="distribution-summary">
                        <span class="distributed-total">الموزع: <span id="distributed_${itemIndex}">0</span></span>
                        <span class="remaining-total">المتبقي: <span id="remaining_${itemIndex}">${db.toArabicNumbers(totalQuantity)}</span></span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = distributionHtml;

    } catch (error) {
        console.error('خطأ في تحديث توزيع المخازن:', error);
    }
}

// الحصول على المخزون الحالي في المخزن
function getCurrentWarehouseStock(productId, warehouseId) {
    try {
        const products = db.getTable('products');
        const product = products.find(p => p.id === productId);

        if (!product || !product.warehouseDistribution) return 0;

        return product.warehouseDistribution[warehouseId] || 0;
    } catch (error) {
        return 0;
    }
}

// التحقق من صحة التوزيع
function validateDistribution(itemIndex) {
    try {
        const distributionItem = document.querySelector(`[data-item-index="${itemIndex}"]`);
        if (!distributionItem) return;

        const inputs = distributionItem.querySelectorAll('.warehouse-qty-input');
        const totalQuantitySpan = distributionItem.querySelector('.total-quantity');
        const totalQuantity = parseFloat(totalQuantitySpan.textContent.match(/\d+/)[0]) || 0;

        let distributedTotal = 0;
        inputs.forEach(input => {
            const qty = parseFloat(input.value) || 0;
            distributedTotal += qty;
        });

        const remaining = totalQuantity - distributedTotal;

        // تحديث العرض
        document.getElementById(`distributed_${itemIndex}`).textContent = db.toArabicNumbers(distributedTotal);
        document.getElementById(`remaining_${itemIndex}`).textContent = db.toArabicNumbers(remaining);

        // تغيير لون النص حسب الحالة
        const remainingElement = document.getElementById(`remaining_${itemIndex}`);
        if (remaining < 0) {
            remainingElement.style.color = '#e74c3c'; // أحمر للزيادة
        } else if (remaining === 0) {
            remainingElement.style.color = '#27ae60'; // أخضر للتوزيع الكامل
        } else {
            remainingElement.style.color = '#f39c12'; // برتقالي للنقص
        }

    } catch (error) {
        console.error('خطأ في التحقق من التوزيع:', error);
    }
}

// توزيع تلقائي للمخزن الرئيسي
function autoDistributeToMainWarehouse() {
    try {
        const warehouses = db.getTable('warehouses').filter(w => w.isActive);
        const mainWarehouse = warehouses.find(w => w.id === 'main') || warehouses[0];

        if (!mainWarehouse) {
            showNotification('لا يوجد مخزن رئيسي متاح', 'warning');
            return;
        }

        const items = document.querySelectorAll('.purchase-item');

        items.forEach((item, itemIndex) => {
            const quantityInput = item.querySelector('.item-quantity');
            const totalQuantity = parseFloat(quantityInput.value) || 0;

            if (totalQuantity > 0) {
                // مسح جميع التوزيعات الحالية
                const distributionInputs = document.querySelectorAll(`[data-item-index="${itemIndex}"] .warehouse-qty-input`);
                distributionInputs.forEach(input => input.value = 0);

                // توزيع الكمية كاملة للمخزن الرئيسي
                const mainWarehouseInput = document.querySelector(`[data-item-index="${itemIndex}"][data-warehouse-id="${mainWarehouse.id}"]`);
                if (mainWarehouseInput) {
                    mainWarehouseInput.value = totalQuantity;
                }

                validateDistribution(itemIndex);
            }
        });

        showNotification('تم التوزيع التلقائي للمخزن الرئيسي', 'success');

    } catch (error) {
        console.error('خطأ في التوزيع التلقائي:', error);
        showNotification('خطأ في التوزيع التلقائي', 'error');
    }
}

// حفظ فاتورة الشراء
function savePurchase(event) {
    event.preventDefault();

    try {
        const supplierId = document.getElementById('purchaseSupplier').value;
        const purchaseDate = document.getElementById('purchaseDate').value;
        const notes = document.getElementById('purchaseNotes').value;
        const discount = parseFloat(document.getElementById('purchaseDiscount').value) || 0;
        const tax = parseFloat(document.getElementById('purchaseTax').value) || 0;

        if (!supplierId) {
            showNotification('يرجى اختيار مورد', 'error');
            return;
        }

        // جمع أصناف الفاتورة
        const items = [];
        const itemElements = document.querySelectorAll('.purchase-item');

        if (itemElements.length === 0) {
            showNotification('يرجى إضافة أصناف للفاتورة', 'error');
            return;
        }

        let hasValidItems = false;
        itemElements.forEach(item => {
            const productId = item.querySelector('.item-product').value;
            const quantity = parseFloat(item.querySelector('.item-quantity').value);
            const price = parseFloat(item.querySelector('.item-price').value);

            if (productId && quantity > 0 && price >= 0) {
                const product = db.getTable('products').find(p => p.id === productId);
                items.push({
                    productId: productId,
                    name: product ? product.name : 'منتج غير محدد',
                    quantity: quantity,
                    price: price,
                    total: quantity * price
                });
                hasValidItems = true;
            }
        });

        if (!hasValidItems) {
            showNotification('يرجى إضافة أصناف صحيحة للفاتورة', 'error');
            return;
        }

        // التحقق من توزيع المخازن
        const distributionValid = validateAllWarehouseDistributions();
        if (!distributionValid) {
            showNotification('يرجى توزيع جميع الكميات على المخازن بشكل صحيح', 'error');
            return;
        }

        // حساب الإجماليات
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const total = subtotal - discount + tax;

        // توليد رقم فاتورة جديد
        const invoiceNumber = db.generateInvoiceNumber('purchase');

        // إنشاء فاتورة الشراء
        const purchase = {
            id: 'purchase_' + Date.now(),
            invoiceNumber: invoiceNumber,
            supplierId: supplierId,
            items: items,
            subtotal: subtotal,
            discount: discount,
            tax: tax,
            total: total,
            notes: notes,
            purchaseDate: purchaseDate,
            createdAt: new Date().toISOString(),
            status: 'completed'
        };

        // حفظ الفاتورة
        db.addRecord('purchases', purchase);

        // تحديث المخزون
        updateInventoryAfterPurchase(items);

        showNotification('تم حفظ فاتورة الشراء بنجاح', 'success');
        closeModal();
        loadPurchases();

    } catch (error) {
        console.error('خطأ في حفظ فاتورة الشراء:', error);
        showNotification('خطأ في حفظ فاتورة الشراء', 'error');
    }
}

// تحديث المخزون بعد الشراء
function updateInventoryAfterPurchase(items) {
    try {
        const products = db.getTable('products');

        items.forEach((item, itemIndex) => {
            const productIndex = products.findIndex(p => p.id === item.productId);
            if (productIndex !== -1) {
                const product = products[productIndex];

                // تهيئة توزيع المخازن إذا لم يكن موجوداً
                if (!product.warehouseDistribution) {
                    product.warehouseDistribution = {};
                }

                // الحصول على توزيع المخازن من النموذج
                const warehouseDistribution = getWarehouseDistributionForItem(itemIndex);

                if (warehouseDistribution && Object.keys(warehouseDistribution).length > 0) {
                    // تطبيق التوزيع المحدد
                    Object.keys(warehouseDistribution).forEach(warehouseId => {
                        const qty = warehouseDistribution[warehouseId];
                        if (qty > 0) {
                            product.warehouseDistribution[warehouseId] =
                                (product.warehouseDistribution[warehouseId] || 0) + qty;
                        }
                    });
                } else {
                    // إذا لم يتم تحديد توزيع، أضف للمخزن الرئيسي
                    const warehouses = db.getTable('warehouses').filter(w => w.isActive);
                    const mainWarehouse = warehouses.find(w => w.id === 'main') || warehouses[0];

                    if (mainWarehouse) {
                        product.warehouseDistribution[mainWarehouse.id] =
                            (product.warehouseDistribution[mainWarehouse.id] || 0) + item.quantity;
                    }
                }

                // حساب الكمية الإجمالية من جميع المخازن
                const totalQty = Object.values(product.warehouseDistribution).reduce((sum, qty) => sum + (qty || 0), 0);
                product.quantity = totalQty;

                // تحديث سعر الشراء إذا كان مختلفاً
                if (item.price !== product.purchasePrice) {
                    product.purchasePrice = item.price;
                }

                db.updateRecord('products', product);

                console.log(`تم تحديث مخزون ${product.name}:`, product.warehouseDistribution);
            }
        });

        // إنشاء حركات المخزون
        createPurchaseInventoryMovements(items);

    } catch (error) {
        console.error('خطأ في تحديث المخزون:', error);
    }
}

// الحصول على توزيع المخازن لصنف معين
function getWarehouseDistributionForItem(itemIndex) {
    try {
        const distributionInputs = document.querySelectorAll(`[data-item-index="${itemIndex}"] .warehouse-qty-input`);
        const distribution = {};

        distributionInputs.forEach(input => {
            const warehouseId = input.dataset.warehouseId;
            const qty = parseFloat(input.value) || 0;

            if (qty > 0) {
                distribution[warehouseId] = qty;
            }
        });

        return distribution;
    } catch (error) {
        console.error('خطأ في الحصول على توزيع المخازن:', error);
        return {};
    }
}

// إنشاء حركات المخزون للمشتريات
function createPurchaseInventoryMovements(items) {
    try {
        const movements = db.getTable('inventory_movements');
        const warehouses = db.getTable('warehouses');

        items.forEach((item, itemIndex) => {
            const warehouseDistribution = getWarehouseDistributionForItem(itemIndex);

            Object.keys(warehouseDistribution).forEach(warehouseId => {
                const qty = warehouseDistribution[warehouseId];
                const warehouse = warehouses.find(w => w.id === warehouseId);

                if (qty > 0) {
                    const movement = {
                        id: 'movement_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11),
                        productId: item.productId,
                        productName: item.name,
                        warehouseId: warehouseId,
                        warehouseName: warehouse ? warehouse.name : 'مخزن غير محدد',
                        type: 'in', // دخول
                        quantity: qty,
                        reason: 'purchase', // شراء
                        referenceId: 'purchase_' + Date.now(),
                        notes: `شراء من المورد`,
                        createdAt: new Date().toISOString(),
                        createdBy: 'system'
                    };

                    movements.push(movement);
                }
            });
        });

        db.setTable('inventory_movements', movements);

    } catch (error) {
        console.error('خطأ في إنشاء حركات المخزون:', error);
    }
}

// عرض فاتورة الشراء
function viewPurchase(purchaseId) {
    const purchase = db.getTable('purchases').find(p => p.id === purchaseId);
    if (!purchase) {
        showNotification('فاتورة الشراء غير موجودة', 'error');
        return;
    }

    const supplier = getSupplierById(purchase.supplierId);
    const supplierName = supplier ? supplier.name : 'مورد غير محدد';

    const content = `
        <div class="purchase-view">
            <div class="purchase-header-info">
                <h3>${purchase.invoiceNumber}</h3>
                <div class="purchase-meta">
                    <p><strong>المورد:</strong> ${supplierName}</p>
                    <p><strong>التاريخ:</strong> ${formatDate(purchase.purchaseDate || purchase.createdAt)}</p>
                    <p><strong>الحالة:</strong> ${getPurchaseStatusText(purchase.status)}</p>
                    ${purchase.notes ? `<p><strong>ملاحظات:</strong> ${purchase.notes}</p>` : ''}
                </div>
            </div>

            <div class="purchase-items-details">
                <h4>أصناف الفاتورة</h4>
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
                        ${purchase.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>${formatCurrency(item.price)}</td>
                                <td>${formatCurrency(item.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="purchase-summary">
                <div class="summary-row">
                    <span>المجموع الفرعي:</span>
                    <span>${formatCurrency(purchase.subtotal)}</span>
                </div>
                ${purchase.discount > 0 ? `
                    <div class="summary-row">
                        <span>الخصم:</span>
                        <span>${formatCurrency(purchase.discount)}</span>
                    </div>
                ` : ''}
                ${purchase.tax > 0 ? `
                    <div class="summary-row">
                        <span>الضريبة:</span>
                        <span>${formatCurrency(purchase.tax)}</span>
                    </div>
                ` : ''}
                <div class="summary-row total-row">
                    <span>الإجمالي:</span>
                    <span>${formatCurrency(purchase.total)}</span>
                </div>
            </div>
        </div>
    `;

    showModal('عرض فاتورة الشراء', content);
}

// حذف فاتورة الشراء
function deletePurchase(purchaseId) {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
        const success = db.deleteRecord('purchases', purchaseId);
        if (success) {
            showNotification('تم حذف فاتورة الشراء بنجاح', 'success');
            loadPurchases();
        } else {
            showNotification('خطأ في حذف فاتورة الشراء', 'error');
        }
    }
}

// طباعة فاتورة الشراء
function printPurchase(purchaseId) {
    const purchase = db.getTable('purchases').find(p => p.id === purchaseId);
    if (!purchase) {
        showNotification('فاتورة الشراء غير موجودة', 'error');
        return;
    }

    // هنا يمكن إضافة منطق طباعة الفاتورة
    console.log('طباعة فاتورة الشراء:', purchase);
    showNotification('تم إرسال فاتورة الشراء للطباعة', 'info');
}

// تعديل فاتورة الشراء
function editPurchase(purchaseId) {
    try {
        const purchases = db.getTable('purchases');
        const purchase = purchases.find(p => p.id === purchaseId);

        if (!purchase) {
            showNotification('فاتورة الشراء غير موجودة', 'error');
            return;
        }

        const suppliers = db.getTable('suppliers');
        const supplier = suppliers.find(s => s.id === purchase.supplierId);

        // استخراج الرقم من رقم الفاتورة
        const invoiceNumberMatch = purchase.invoiceNumber.match(/ABUSLEAN-PUR-(\d+)/);
        const currentNumber = invoiceNumberMatch ? invoiceNumberMatch[1] : '';

        const content = `
            <form id="editPurchaseInvoiceForm" onsubmit="savePurchaseInvoiceEdit(event, '${purchaseId}')">
                <div class="edit-invoice-form">
                    <div class="form-section">
                        <h4>معلومات الفاتورة</h4>

                        <div class="form-grid">
                            <div class="form-group">
                                <label for="editPurchaseInvoiceNumber">رقم الفاتورة</label>
                                <div class="invoice-number-input">
                                    <span class="invoice-prefix">ABUSLEAN-PUR-</span>
                                    <input
                                        type="text"
                                        id="editPurchaseInvoiceNumber"
                                        value="${currentNumber}"
                                        pattern="\\d{2,}"
                                        title="يجب أن يكون رقماً مكوناً من رقمين على الأقل"
                                        required
                                    >
                                </div>
                                <small class="form-help">أدخل الرقم فقط (مثال: 01, 02, 15)</small>
                            </div>

                            <div class="form-group">
                                <label for="editPurchaseInvoiceDate">تاريخ الفاتورة</label>
                                <input
                                    type="date"
                                    id="editPurchaseInvoiceDate"
                                    value="${purchase.purchaseDate || purchase.createdAt.split('T')[0]}"
                                    required
                                >
                            </div>

                            <div class="form-group">
                                <label for="editPurchaseSupplier">المورد</label>
                                <select id="editPurchaseSupplier" required>
                                    <option value="">اختر مورد</option>
                                    ${suppliers.map((s, index) =>
                                        `<option value="${s.id}" ${s.id === purchase.supplierId ? 'selected' : ''}>${index + 1}. ${s.name}</option>`
                                    ).join('')}
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="editPurchaseNotes">ملاحظات</label>
                                <textarea
                                    id="editPurchaseNotes"
                                    rows="2"
                                    placeholder="ملاحظات إضافية..."
                                >${purchase.notes || ''}</textarea>
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
                                    ${purchase.items.map(item => `
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
                                <span>${formatCurrency(purchase.subtotal)}</span>
                            </div>
                            ${purchase.discount > 0 ? `
                                <div class="total-row">
                                    <span>الخصم:</span>
                                    <span>-${formatCurrency(purchase.discount)}</span>
                                </div>
                            ` : ''}
                            ${purchase.tax > 0 ? `
                                <div class="total-row">
                                    <span>الضريبة:</span>
                                    <span>${formatCurrency(purchase.tax)}</span>
                                </div>
                            ` : ''}
                            <div class="total-row final-total">
                                <span>الإجمالي:</span>
                                <span>${formatCurrency(purchase.total)}</span>
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

        showModal('تعديل فاتورة الشراء', content);

    } catch (error) {
        console.error('خطأ في تعديل فاتورة الشراء:', error);
        showNotification('خطأ في تعديل فاتورة الشراء', 'error');
    }
}

// حفظ تعديل فاتورة الشراء
function savePurchaseInvoiceEdit(event, purchaseId) {
    event.preventDefault();

    try {
        const numberInput = document.getElementById('editPurchaseInvoiceNumber').value.trim();
        const invoiceDate = document.getElementById('editPurchaseInvoiceDate').value;
        const supplierId = document.getElementById('editPurchaseSupplier').value;
        const notes = document.getElementById('editPurchaseNotes').value.trim();

        // التحقق من صحة البيانات
        if (!supplierId) {
            showNotification('يرجى اختيار مورد', 'error');
            return;
        }

        // التحقق من صحة الرقم المدخل
        if (!/^\d{2,}$/.test(numberInput)) {
            showNotification('رقم الفاتورة يجب أن يكون رقماً مكوناً من رقمين على الأقل', 'error');
            return;
        }

        // إنشاء رقم الفاتورة الكامل
        const newInvoiceNumber = db.createInvoiceNumberFromInput(numberInput, 'purchase');

        if (!newInvoiceNumber) {
            showNotification('خطأ في إنشاء رقم الفاتورة', 'error');
            return;
        }

        // التحقق من تفرد رقم الفاتورة
        if (!db.isInvoiceNumberUnique(newInvoiceNumber, 'purchase', purchaseId)) {
            showNotification('رقم الفاتورة موجود مسبقاً', 'error');
            return;
        }

        // تحديث السجل
        const purchases = db.getTable('purchases');
        const purchaseIndex = purchases.findIndex(p => p.id === purchaseId);

        if (purchaseIndex === -1) {
            showNotification('فاتورة الشراء غير موجودة', 'error');
            return;
        }

        // تحديث البيانات
        purchases[purchaseIndex].invoiceNumber = newInvoiceNumber;
        purchases[purchaseIndex].purchaseDate = invoiceDate;
        purchases[purchaseIndex].supplierId = supplierId;
        purchases[purchaseIndex].notes = notes;
        purchases[purchaseIndex].updatedAt = new Date().toISOString();

        // حفظ التحديثات
        db.setTable('purchases', purchases);

        showNotification('تم حفظ التعديلات بنجاح', 'success');
        closeModal();

        // إعادة تحميل قائمة المشتريات
        loadPurchases();

    } catch (error) {
        console.error('خطأ في حفظ تعديل فاتورة الشراء:', error);
        showNotification('خطأ في حفظ التعديلات', 'error');
    }
}

// التحقق من صحة جميع توزيعات المخازن
function validateAllWarehouseDistributions() {
    try {
        const items = document.querySelectorAll('.purchase-item');

        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            const item = items[itemIndex];
            const quantityInput = item.querySelector('.item-quantity');
            const totalQuantity = parseFloat(quantityInput.value) || 0;

            if (totalQuantity <= 0) continue;

            // الحصول على التوزيع
            const distribution = getWarehouseDistributionForItem(itemIndex);
            const distributedTotal = Object.values(distribution).reduce((sum, qty) => sum + (qty || 0), 0);

            // التحقق من أن التوزيع يساوي الكمية الإجمالية
            if (Math.abs(distributedTotal - totalQuantity) > 0.001) {
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error('خطأ في التحقق من توزيع المخازن:', error);
        return false;
    }
}

// تحميل قسم المشتريات
function loadPurchasesSection() {
    initPurchases();
}

// تصدير الوظائف للاستخدام العام
window.initPurchases = initPurchases;
window.loadPurchasesSection = loadPurchasesSection;
window.showAddPurchaseModal = showAddPurchaseModal;
window.addPurchaseItem = addPurchaseItem;
window.updateItemPrice = updateItemPrice;
window.calculateItemTotal = calculateItemTotal;
window.removePurchaseItem = removePurchaseItem;
window.calculatePurchaseTotal = calculatePurchaseTotal;
window.savePurchase = savePurchase;
window.viewPurchase = viewPurchase;
window.deletePurchase = deletePurchase;
window.printPurchase = printPurchase;
window.updateWarehouseDistribution = updateWarehouseDistribution;
window.validateDistribution = validateDistribution;
window.autoDistributeToMainWarehouse = autoDistributeToMainWarehouse;
window.editPurchase = editPurchase;
window.savePurchaseInvoiceEdit = savePurchaseInvoiceEdit;

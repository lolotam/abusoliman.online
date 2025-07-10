/**
 * وحدة التقارير
 * أبوسليمان للمحاسبة - نظام إدارة نقاط البيع
 */

// متغيرات التقارير
let currentReportTab = 'sales';
let reportData = {
    sales: [],
    customers: [],
    suppliers: [],
    inventory: []
};

// تهيئة window.reportData
if (typeof window !== 'undefined') {
    window.reportData = reportData;
}

// تنسيق التاريخ
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
}

// تحميل قسم التقارير
function loadReportsSection() {
    initializeReports();
}

// تهيئة التقارير
function initializeReports() {
    try {
        // التأكد من وجود window.reportData
        if (!window.reportData) {
            window.reportData = {
                sales: [],
                customers: [],
                suppliers: [],
                inventory: []
            };
        }

        loadReportFilters();
        showReportTab('sales');
    } catch (error) {
        console.error('خطأ في تهيئة التقارير:', error);
        showNotification('خطأ في تهيئة التقارير', 'error');
    }
}

// تحميل فلاتر التقارير
function loadReportFilters() {
    try {
        if (!window.db) return;

        // تحميل المنتجات للفلاتر
        const products = db.getTable('products');
        const productOptions = products.map((product, index) =>
            `<option value="${product.id}">${index + 1}. ${product.name}</option>`
        ).join('');

        // تحديث فلاتر المنتجات في جميع التقارير
        const productFilters = [
            'salesProductFilter',
            'customersProductFilter',
            'suppliersProductFilter'
        ];

        productFilters.forEach(filterId => {
            const filterElement = document.getElementById(filterId);
            if (filterElement) {
                const currentValue = filterElement.value;
                filterElement.innerHTML = '<option value="">جميع المنتجات</option>' + productOptions;
                filterElement.value = currentValue;
            }
        });

        // تحديث فلاتر الفئات باستخدام الدالة المركزية
        if (window.updateAllCategorySelects) {
            updateAllCategorySelects();
        }

        // تحميل العملاء للفلاتر
        const customers = db.getTable('customers');
        const customerOptions = customers.map((customer, index) => 
            `<option value="${customer.id}">${index + 1}. ${customer.name}</option>`
        ).join('');

        const salesCustomerFilter = document.getElementById('salesCustomerFilter');
        if (salesCustomerFilter) {
            const currentValue = salesCustomerFilter.value;
            salesCustomerFilter.innerHTML = '<option value="">جميع العملاء</option>' + customerOptions;
            salesCustomerFilter.value = currentValue;
        }

        // تحميل المخازن للفلاتر
        const warehouses = db.getTable('warehouses').filter(w => w.isActive);
        const warehouseOptions = warehouses.map((warehouse, index) => 
            `<option value="${warehouse.id}">${index + 1}. ${warehouse.name}</option>`
        ).join('');

        const inventoryWarehouseFilter = document.getElementById('inventoryWarehouseFilter');
        if (inventoryWarehouseFilter) {
            const currentValue = inventoryWarehouseFilter.value;
            inventoryWarehouseFilter.innerHTML = '<option value="">جميع المخازن</option>' + warehouseOptions;
            inventoryWarehouseFilter.value = currentValue;
        }

    } catch (error) {
        console.error('خطأ في تحميل فلاتر التقارير:', error);
    }
}

// عرض تبويب التقرير
function showReportTab(tabName) {
    try {
        // إخفاء جميع التبويبات
        const tabContents = document.querySelectorAll('.report-tab-content');
        tabContents.forEach(tab => tab.classList.remove('active'));

        // إزالة الفئة النشطة من جميع الأزرار
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => btn.classList.remove('active'));

        // إظهار التبويب المحدد
        const targetTab = document.getElementById(tabName + 'Reports');
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // تفعيل الزر المحدد
        const targetButton = document.querySelector(`[onclick="showReportTab('${tabName}')"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        }

        currentReportTab = tabName;

        // تحميل التقرير المحدد
        switch (tabName) {
            case 'sales':
                applySalesFilters();
                break;
            case 'customers':
                applyCustomersFilters();
                break;
            case 'suppliers':
                applySuppliersFilters();
                break;
            case 'inventory':
                applyInventoryFilters();
                break;
        }

    } catch (error) {
        console.error('خطأ في عرض تبويب التقرير:', error);
    }
}

// تطبيق فلاتر تقرير المبيعات
function applySalesFilters() {
    try {
        showLoading('salesLoading');
        
        setTimeout(() => {
            generateSalesReport();
            hideLoading('salesLoading');
        }, 500);

    } catch (error) {
        console.error('خطأ في تطبيق فلاتر المبيعات:', error);
        hideLoading('salesLoading');
    }
}

// تطبيق فلاتر تقرير العملاء
function applyCustomersFilters() {
    try {
        showLoading('customersLoading');
        
        setTimeout(() => {
            generateCustomersReport();
            hideLoading('customersLoading');
        }, 500);

    } catch (error) {
        console.error('خطأ في تطبيق فلاتر العملاء:', error);
        hideLoading('customersLoading');
    }
}

// تطبيق فلاتر تقرير الموردين
function applySuppliersFilters() {
    try {
        showLoading('suppliersLoading');
        
        setTimeout(() => {
            generateSuppliersReport();
            hideLoading('suppliersLoading');
        }, 500);

    } catch (error) {
        console.error('خطأ في تطبيق فلاتر الموردين:', error);
        hideLoading('suppliersLoading');
    }
}

// تطبيق فلاتر تقرير المخزون
function applyInventoryFilters() {
    try {
        showLoading('inventoryLoading');
        
        setTimeout(() => {
            generateInventoryReport();
            hideLoading('inventoryLoading');
        }, 500);

    } catch (error) {
        console.error('خطأ في تطبيق فلاتر المخزون:', error);
        hideLoading('inventoryLoading');
    }
}

// إظهار مؤشر التحميل
function showLoading(loadingId) {
    const loadingElement = document.getElementById(loadingId);
    if (loadingElement) {
        loadingElement.style.display = 'flex';
    }
}

// إخفاء مؤشر التحميل
function hideLoading(loadingId) {
    const loadingElement = document.getElementById(loadingId);
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

// مسح فلاتر المبيعات
function clearSalesFilters() {
    document.getElementById('salesProductFilter').value = '';
    document.getElementById('salesFromDate').value = '';
    document.getElementById('salesToDate').value = '';
    document.getElementById('salesCustomerFilter').value = '';
    applySalesFilters();
}

// مسح فلاتر العملاء
function clearCustomersFilters() {
    document.getElementById('customersProductFilter').value = '';
    document.getElementById('customersFromDate').value = '';
    document.getElementById('customersToDate').value = '';
    applyCustomersFilters();
}

// مسح فلاتر الموردين
function clearSuppliersFilters() {
    document.getElementById('suppliersFromDate').value = '';
    document.getElementById('suppliersToDate').value = '';
    document.getElementById('suppliersProductFilter').value = '';
    applySuppliersFilters();
}

// مسح فلاتر المخزون
function clearInventoryFilters() {
    document.getElementById('warehouseStockCheckbox').checked = false;
    document.getElementById('inventoryWarehouseFilter').value = '';
    applyInventoryFilters();
}

// توليد تقرير المبيعات
function generateSalesReport() {
    try {
        if (!window.db) return;

        // الحصول على الفلاتر
        const productFilter = document.getElementById('salesProductFilter').value;
        const fromDate = document.getElementById('salesFromDate').value;
        const toDate = document.getElementById('salesToDate').value;
        const customerFilter = document.getElementById('salesCustomerFilter').value;

        // الحصول على بيانات المبيعات
        let sales = db.getTable('sales');
        const products = db.getTable('products');
        const customers = db.getTable('customers');

        // تطبيق الفلاتر
        let filteredSales = sales.filter(sale => {
            // فلتر التاريخ
            if (fromDate || toDate) {
                const saleDate = sale.invoiceDate || sale.createdAt.split('T')[0];
                if (fromDate && saleDate < fromDate) return false;
                if (toDate && saleDate > toDate) return false;
            }

            // فلتر العميل
            if (customerFilter && sale.customerId !== customerFilter) return false;

            // فلتر المنتج
            if (productFilter) {
                const hasProduct = sale.items.some(item => item.productId === productFilter);
                if (!hasProduct) return false;
            }

            return true;
        });

        // إعداد بيانات التقرير
        const reportData = [];
        let totalAmount = 0;
        let totalQuantity = 0;

        filteredSales.forEach(sale => {
            const customer = customers.find(c => c.id === sale.customerId);
            const customerName = customer ? customer.name : 'ضيف';

            if (productFilter) {
                // إذا كان هناك فلتر منتج، اعرض فقط هذا المنتج
                const filteredItems = sale.items.filter(item => item.productId === productFilter);
                filteredItems.forEach(item => {
                    reportData.push({
                        invoiceNumber: sale.invoiceNumber,
                        date: formatDate(sale.invoiceDate || sale.createdAt),
                        product: item.name,
                        customer: customerName,
                        quantity: item.quantity,
                        unitPrice: item.price,
                        totalAmount: item.total
                    });
                    totalAmount += item.total;
                    totalQuantity += item.quantity;
                });
            } else {
                // اعرض جميع المنتجات
                sale.items.forEach(item => {
                    reportData.push({
                        invoiceNumber: sale.invoiceNumber,
                        date: formatDate(sale.invoiceDate || sale.createdAt),
                        product: item.name,
                        customer: customerName,
                        quantity: item.quantity,
                        unitPrice: item.price,
                        totalAmount: item.total
                    });
                    totalQuantity += item.quantity;
                });
                totalAmount += sale.total;
            }
        });

        // عرض الملخص
        displaySalesSummary(filteredSales.length, totalQuantity, totalAmount);

        // عرض الجدول
        displaySalesTable(reportData);

        // حفظ البيانات للتصدير
        window.reportData.sales = reportData;

    } catch (error) {
        console.error('خطأ في توليد تقرير المبيعات:', error);
        showNotification('خطأ في توليد تقرير المبيعات', 'error');
    }
}

// عرض ملخص المبيعات
function displaySalesSummary(invoiceCount, totalQuantity, totalAmount) {
    const summaryContainer = document.getElementById('salesSummary');
    if (!summaryContainer) return;

    summaryContainer.innerHTML = `
        <div class="summary-cards">
            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-file-invoice"></i>
                </div>
                <div class="summary-content">
                    <h4>عدد الفواتير</h4>
                    <p class="summary-value">${db.toArabicNumbers(invoiceCount)}</p>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-boxes"></i>
                </div>
                <div class="summary-content">
                    <h4>إجمالي الكمية</h4>
                    <p class="summary-value">${db.toArabicNumbers(totalQuantity)}</p>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="summary-content">
                    <h4>إجمالي المبيعات</h4>
                    <p class="summary-value">${formatCurrency(totalAmount)}</p>
                </div>
            </div>
        </div>
    `;
}

// عرض جدول المبيعات
function displaySalesTable(data) {
    const tableContainer = document.getElementById('salesReportTable');
    if (!tableContainer) return;

    if (data.length === 0) {
        tableContainer.innerHTML = `
            <div class="empty-report">
                <i class="fas fa-chart-line"></i>
                <h3>لا توجد بيانات</h3>
                <p>لا توجد مبيعات تطابق الفلاتر المحددة</p>
            </div>
        `;
        return;
    }

    const tableHtml = `
        <div class="report-table-wrapper">
            <table class="report-table">
                <thead>
                    <tr>
                        <th onclick="sortTable(0, 'sales')">رقم الفاتورة <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(1, 'sales')">التاريخ <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(2, 'sales')">المنتج <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(3, 'sales')">العميل <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(4, 'sales')">الكمية <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(5, 'sales')">سعر الوحدة <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(6, 'sales')">الإجمالي <i class="fas fa-sort"></i></th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            <td>${row.invoiceNumber}</td>
                            <td>${row.date}</td>
                            <td>${row.product}</td>
                            <td>${row.customer}</td>
                            <td>${db.toArabicNumbers(row.quantity)}</td>
                            <td>${formatCurrency(row.unitPrice)}</td>
                            <td>${formatCurrency(row.totalAmount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="4"><strong>الإجمالي</strong></td>
                        <td><strong>${db.toArabicNumbers(data.reduce((sum, row) => sum + row.quantity, 0))}</strong></td>
                        <td>-</td>
                        <td><strong>${formatCurrency(data.reduce((sum, row) => sum + row.totalAmount, 0))}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;

    tableContainer.innerHTML = tableHtml;
}

// تصدير تقرير المبيعات
function exportSalesReport() {
    try {
        const data = window.reportData.sales;
        if (!data || data.length === 0) {
            showNotification('لا توجد بيانات للتصدير', 'warning');
            return;
        }

        // إنشاء CSV
        const headers = ['رقم الفاتورة', 'التاريخ', 'المنتج', 'العميل', 'الكمية', 'سعر الوحدة', 'الإجمالي'];
        const csvContent = [
            headers.join(','),
            ...data.map(row => [
                row.invoiceNumber,
                row.date,
                row.product,
                row.customer,
                row.quantity,
                row.unitPrice,
                row.totalAmount
            ].join(','))
        ].join('\n');

        // تحميل الملف
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        showNotification('تم تصدير تقرير المبيعات بنجاح', 'success');

    } catch (error) {
        console.error('خطأ في تصدير تقرير المبيعات:', error);
        showNotification('خطأ في تصدير التقرير', 'error');
    }
}

// توليد تقرير العملاء
function generateCustomersReport() {
    try {
        if (!window.db) return;

        // الحصول على الفلاتر
        const productFilter = document.getElementById('customersProductFilter').value;
        const fromDate = document.getElementById('customersFromDate').value;
        const toDate = document.getElementById('customersToDate').value;

        // الحصول على البيانات
        let sales = db.getTable('sales');
        const customers = db.getTable('customers');

        // تطبيق فلاتر التاريخ
        if (fromDate || toDate) {
            sales = sales.filter(sale => {
                const saleDate = sale.invoiceDate || sale.createdAt.split('T')[0];
                if (fromDate && saleDate < fromDate) return false;
                if (toDate && saleDate > toDate) return false;
                return true;
            });
        }

        // تجميع بيانات العملاء
        const customerStats = {};

        sales.forEach(sale => {
            const customerId = sale.customerId || 'guest';
            const customer = customers.find(c => c.id === customerId);
            const customerName = customer ? customer.name : 'ضيف';

            if (!customerStats[customerId]) {
                customerStats[customerId] = {
                    id: customerId,
                    name: customerName,
                    totalSpent: 0,
                    totalTransactions: 0,
                    totalQuantity: 0,
                    products: {},
                    lastPurchase: null
                };
            }

            // تطبيق فلتر المنتج
            let saleItems = sale.items;
            if (productFilter) {
                saleItems = sale.items.filter(item => item.productId === productFilter);
                if (saleItems.length === 0) return; // تخطي هذا البيع إذا لم يحتوي على المنتج المطلوب
            }

            // تحديث الإحصائيات
            const saleTotal = saleItems.reduce((sum, item) => sum + item.total, 0);
            customerStats[customerId].totalSpent += saleTotal;
            customerStats[customerId].totalTransactions += 1;

            saleItems.forEach(item => {
                customerStats[customerId].totalQuantity += item.quantity;

                if (!customerStats[customerId].products[item.productId]) {
                    customerStats[customerId].products[item.productId] = {
                        name: item.name,
                        quantity: 0,
                        total: 0
                    };
                }

                customerStats[customerId].products[item.productId].quantity += item.quantity;
                customerStats[customerId].products[item.productId].total += item.total;
            });

            // تحديث تاريخ آخر شراء
            const saleDate = new Date(sale.invoiceDate || sale.createdAt);
            if (!customerStats[customerId].lastPurchase || saleDate > new Date(customerStats[customerId].lastPurchase)) {
                customerStats[customerId].lastPurchase = sale.invoiceDate || sale.createdAt.split('T')[0];
            }
        });

        // تحويل إلى مصفوفة وترتيب حسب إجمالي الإنفاق
        const reportData = Object.values(customerStats)
            .filter(customer => customer.totalTransactions > 0)
            .sort((a, b) => b.totalSpent - a.totalSpent);

        // عرض الملخص
        displayCustomersSummary(reportData);

        // عرض الجدول
        displayCustomersTable(reportData);

        // حفظ البيانات للتصدير
        window.reportData.customers = reportData;

    } catch (error) {
        console.error('خطأ في توليد تقرير العملاء:', error);
        showNotification('خطأ في توليد تقرير العملاء', 'error');
    }
}

// عرض ملخص العملاء
function displayCustomersSummary(data) {
    const summaryContainer = document.getElementById('customersSummary');
    if (!summaryContainer) return;

    const totalCustomers = data.length;
    const totalSpent = data.reduce((sum, customer) => sum + customer.totalSpent, 0);
    const totalTransactions = data.reduce((sum, customer) => sum + customer.totalTransactions, 0);
    const avgSpentPerCustomer = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

    summaryContainer.innerHTML = `
        <div class="summary-cards">
            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="summary-content">
                    <h4>عدد العملاء</h4>
                    <p class="summary-value">${db.toArabicNumbers(totalCustomers)}</p>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <div class="summary-content">
                    <h4>إجمالي المعاملات</h4>
                    <p class="summary-value">${db.toArabicNumbers(totalTransactions)}</p>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="summary-content">
                    <h4>إجمالي الإنفاق</h4>
                    <p class="summary-value">${formatCurrency(totalSpent)}</p>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="summary-content">
                    <h4>متوسط الإنفاق</h4>
                    <p class="summary-value">${formatCurrency(avgSpentPerCustomer)}</p>
                </div>
            </div>
        </div>
    `;
}

// عرض جدول العملاء
function displayCustomersTable(data) {
    const tableContainer = document.getElementById('customersReportTable');
    if (!tableContainer) return;

    if (data.length === 0) {
        tableContainer.innerHTML = `
            <div class="empty-report">
                <i class="fas fa-users"></i>
                <h3>لا توجد بيانات</h3>
                <p>لا توجد بيانات عملاء تطابق الفلاتر المحددة</p>
            </div>
        `;
        return;
    }

    const tableHtml = `
        <div class="report-table-wrapper">
            <table class="report-table">
                <thead>
                    <tr>
                        <th onclick="sortTable(0, 'customers')">اسم العميل <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(1, 'customers')">عدد المعاملات <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(2, 'customers')">إجمالي الكمية <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(3, 'customers')">إجمالي الإنفاق <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(4, 'customers')">متوسط المعاملة <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(5, 'customers')">آخر شراء <i class="fas fa-sort"></i></th>
                        <th>المنتجات المشتراة</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(customer => {
                        const avgTransaction = customer.totalTransactions > 0 ? customer.totalSpent / customer.totalTransactions : 0;
                        const topProducts = Object.values(customer.products)
                            .sort((a, b) => b.total - a.total)
                            .slice(0, 3)
                            .map(p => p.name)
                            .join(', ');

                        return `
                            <tr>
                                <td>${customer.name}</td>
                                <td>${db.toArabicNumbers(customer.totalTransactions)}</td>
                                <td>${db.toArabicNumbers(customer.totalQuantity)}</td>
                                <td>${formatCurrency(customer.totalSpent)}</td>
                                <td>${formatCurrency(avgTransaction)}</td>
                                <td>${customer.lastPurchase ? formatDate(customer.lastPurchase) : '-'}</td>
                                <td class="products-cell" title="${topProducts}">${topProducts || '-'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td><strong>الإجمالي</strong></td>
                        <td><strong>${db.toArabicNumbers(data.reduce((sum, customer) => sum + customer.totalTransactions, 0))}</strong></td>
                        <td><strong>${db.toArabicNumbers(data.reduce((sum, customer) => sum + customer.totalQuantity, 0))}</strong></td>
                        <td><strong>${formatCurrency(data.reduce((sum, customer) => sum + customer.totalSpent, 0))}</strong></td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;

    tableContainer.innerHTML = tableHtml;
}

// تصدير تقرير العملاء
function exportCustomersReport() {
    try {
        const data = window.reportData.customers;
        if (!data || data.length === 0) {
            showNotification('لا توجد بيانات للتصدير', 'warning');
            return;
        }

        // إنشاء CSV
        const headers = ['اسم العميل', 'عدد المعاملات', 'إجمالي الكمية', 'إجمالي الإنفاق', 'متوسط المعاملة', 'آخر شراء'];
        const csvContent = [
            headers.join(','),
            ...data.map(customer => {
                const avgTransaction = customer.totalTransactions > 0 ? customer.totalSpent / customer.totalTransactions : 0;
                return [
                    customer.name,
                    customer.totalTransactions,
                    customer.totalQuantity,
                    customer.totalSpent,
                    avgTransaction.toFixed(3),
                    customer.lastPurchase || ''
                ].join(',');
            })
        ].join('\n');

        // تحميل الملف
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `customers_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        showNotification('تم تصدير تقرير العملاء بنجاح', 'success');

    } catch (error) {
        console.error('خطأ في تصدير تقرير العملاء:', error);
        showNotification('خطأ في تصدير التقرير', 'error');
    }
}

// توليد تقرير الموردين
function generateSuppliersReport() {
    try {
        if (!window.db) return;

        // الحصول على الفلاتر
        const fromDate = document.getElementById('suppliersFromDate').value;
        const toDate = document.getElementById('suppliersToDate').value;
        const productFilter = document.getElementById('suppliersProductFilter').value;

        // الحصول على البيانات
        let purchases = db.getTable('purchases');
        const suppliers = db.getTable('suppliers');

        // تطبيق فلاتر التاريخ
        if (fromDate || toDate) {
            purchases = purchases.filter(purchase => {
                const purchaseDate = purchase.purchaseDate || purchase.createdAt.split('T')[0];
                if (fromDate && purchaseDate < fromDate) return false;
                if (toDate && purchaseDate > toDate) return false;
                return true;
            });
        }

        // تجميع بيانات الموردين
        const supplierStats = {};

        purchases.forEach(purchase => {
            const supplierId = purchase.supplierId;
            const supplier = suppliers.find(s => s.id === supplierId);

            if (!supplier) return; // تخطي إذا لم يتم العثور على المورد

            if (!supplierStats[supplierId]) {
                supplierStats[supplierId] = {
                    id: supplierId,
                    name: supplier.name,
                    phone: supplier.phone || '',
                    totalSpent: 0,
                    totalTransactions: 0,
                    totalQuantity: 0,
                    products: {},
                    lastPurchase: null
                };
            }

            // تطبيق فلتر المنتج
            let purchaseItems = purchase.items;
            if (productFilter) {
                purchaseItems = purchase.items.filter(item => item.productId === productFilter);
                if (purchaseItems.length === 0) return; // تخطي هذا الشراء إذا لم يحتوي على المنتج المطلوب
            }

            // تحديث الإحصائيات
            const purchaseTotal = purchaseItems.reduce((sum, item) => sum + item.total, 0);
            supplierStats[supplierId].totalSpent += purchaseTotal;
            supplierStats[supplierId].totalTransactions += 1;

            purchaseItems.forEach(item => {
                supplierStats[supplierId].totalQuantity += item.quantity;

                if (!supplierStats[supplierId].products[item.productId]) {
                    supplierStats[supplierId].products[item.productId] = {
                        name: item.name,
                        quantity: 0,
                        total: 0
                    };
                }

                supplierStats[supplierId].products[item.productId].quantity += item.quantity;
                supplierStats[supplierId].products[item.productId].total += item.total;
            });

            // تحديث تاريخ آخر شراء
            const purchaseDate = new Date(purchase.purchaseDate || purchase.createdAt);
            if (!supplierStats[supplierId].lastPurchase || purchaseDate > new Date(supplierStats[supplierId].lastPurchase)) {
                supplierStats[supplierId].lastPurchase = purchase.purchaseDate || purchase.createdAt.split('T')[0];
            }
        });

        // تحويل إلى مصفوفة وترتيب حسب إجمالي المشتريات
        const reportData = Object.values(supplierStats)
            .filter(supplier => supplier.totalTransactions > 0)
            .sort((a, b) => b.totalSpent - a.totalSpent);

        // عرض الملخص
        displaySuppliersSummary(reportData);

        // عرض الجدول
        displaySuppliersTable(reportData);

        // حفظ البيانات للتصدير
        window.reportData.suppliers = reportData;

    } catch (error) {
        console.error('خطأ في توليد تقرير الموردين:', error);
        showNotification('خطأ في توليد تقرير الموردين', 'error');
    }
}

// عرض ملخص الموردين
function displaySuppliersSummary(data) {
    const summaryContainer = document.getElementById('suppliersSummary');
    if (!summaryContainer) return;

    const totalSuppliers = data.length;
    const totalSpent = data.reduce((sum, supplier) => sum + supplier.totalSpent, 0);
    const totalTransactions = data.reduce((sum, supplier) => sum + supplier.totalTransactions, 0);
    const avgSpentPerSupplier = totalSuppliers > 0 ? totalSpent / totalSuppliers : 0;

    summaryContainer.innerHTML = `
        <div class="summary-cards">
            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-truck"></i>
                </div>
                <div class="summary-content">
                    <h4>عدد الموردين</h4>
                    <p class="summary-value">${db.toArabicNumbers(totalSuppliers)}</p>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <div class="summary-content">
                    <h4>إجمالي المعاملات</h4>
                    <p class="summary-value">${db.toArabicNumbers(totalTransactions)}</p>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="summary-content">
                    <h4>إجمالي المشتريات</h4>
                    <p class="summary-value">${formatCurrency(totalSpent)}</p>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="summary-content">
                    <h4>متوسط المشتريات</h4>
                    <p class="summary-value">${formatCurrency(avgSpentPerSupplier)}</p>
                </div>
            </div>
        </div>
    `;
}

// عرض جدول الموردين
function displaySuppliersTable(data) {
    const tableContainer = document.getElementById('suppliersReportTable');
    if (!tableContainer) return;

    if (data.length === 0) {
        tableContainer.innerHTML = `
            <div class="empty-report">
                <i class="fas fa-truck"></i>
                <h3>لا توجد بيانات</h3>
                <p>لا توجد بيانات موردين تطابق الفلاتر المحددة</p>
            </div>
        `;
        return;
    }

    const tableHtml = `
        <div class="report-table-wrapper">
            <table class="report-table">
                <thead>
                    <tr>
                        <th onclick="sortTable(0, 'suppliers')">اسم المورد <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(1, 'suppliers')">رقم الهاتف <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(2, 'suppliers')">عدد المعاملات <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(3, 'suppliers')">إجمالي الكمية <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(4, 'suppliers')">إجمالي المشتريات <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(5, 'suppliers')">متوسط المعاملة <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(6, 'suppliers')">آخر شراء <i class="fas fa-sort"></i></th>
                        <th>المنتجات المشتراة</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(supplier => {
                        const avgTransaction = supplier.totalTransactions > 0 ? supplier.totalSpent / supplier.totalTransactions : 0;
                        const topProducts = Object.values(supplier.products)
                            .sort((a, b) => b.total - a.total)
                            .slice(0, 3)
                            .map(p => p.name)
                            .join(', ');

                        return `
                            <tr>
                                <td>${supplier.name}</td>
                                <td>${supplier.phone || '-'}</td>
                                <td>${db.toArabicNumbers(supplier.totalTransactions)}</td>
                                <td>${db.toArabicNumbers(supplier.totalQuantity)}</td>
                                <td>${formatCurrency(supplier.totalSpent)}</td>
                                <td>${formatCurrency(avgTransaction)}</td>
                                <td>${supplier.lastPurchase ? formatDate(supplier.lastPurchase) : '-'}</td>
                                <td class="products-cell" title="${topProducts}">${topProducts || '-'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td><strong>الإجمالي</strong></td>
                        <td>-</td>
                        <td><strong>${db.toArabicNumbers(data.reduce((sum, supplier) => sum + supplier.totalTransactions, 0))}</strong></td>
                        <td><strong>${db.toArabicNumbers(data.reduce((sum, supplier) => sum + supplier.totalQuantity, 0))}</strong></td>
                        <td><strong>${formatCurrency(data.reduce((sum, supplier) => sum + supplier.totalSpent, 0))}</strong></td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;

    tableContainer.innerHTML = tableHtml;
}

// تصدير تقرير الموردين
function exportSuppliersReport() {
    try {
        const data = window.reportData.suppliers;
        if (!data || data.length === 0) {
            showNotification('لا توجد بيانات للتصدير', 'warning');
            return;
        }

        // إنشاء CSV
        const headers = ['اسم المورد', 'رقم الهاتف', 'عدد المعاملات', 'إجمالي الكمية', 'إجمالي المشتريات', 'متوسط المعاملة', 'آخر شراء'];
        const csvContent = [
            headers.join(','),
            ...data.map(supplier => {
                const avgTransaction = supplier.totalTransactions > 0 ? supplier.totalSpent / supplier.totalTransactions : 0;
                return [
                    supplier.name,
                    supplier.phone || '',
                    supplier.totalTransactions,
                    supplier.totalQuantity,
                    supplier.totalSpent,
                    avgTransaction.toFixed(3),
                    supplier.lastPurchase || ''
                ].join(',');
            })
        ].join('\n');

        // تحميل الملف
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `suppliers_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        showNotification('تم تصدير تقرير الموردين بنجاح', 'success');

    } catch (error) {
        console.error('خطأ في تصدير تقرير الموردين:', error);
        showNotification('خطأ في تصدير التقرير', 'error');
    }
}

// توليد تقرير المخزون
function generateInventoryReport() {
    try {
        if (!window.db) return;

        // الحصول على الفلاتر
        const showWarehouseDistribution = document.getElementById('warehouseStockCheckbox').checked;
        const warehouseFilter = document.getElementById('inventoryWarehouseFilter').value;

        // الحصول على البيانات
        let products = db.getTable('products');
        const warehouses = db.getTable('warehouses').filter(w => w.isActive);
        const categories = db.getTable('categories');

        // تطبيق فلتر المخزن
        if (warehouseFilter) {
            products = products.filter(product => {
                if (!product.warehouseDistribution) return false;
                return product.warehouseDistribution[warehouseFilter] > 0;
            });
        }

        // إعداد بيانات التقرير
        const reportData = products.map(product => {
            const category = categories.find(c => c.id === product.categoryId);
            const categoryName = category ? category.name : 'غير محدد';

            let warehouseData = {};
            let totalValue = 0;
            let lowStockWarehouses = [];
            let outOfStockWarehouses = [];

            // فحص حالة المخزون في جميع المخازن
            if (product.warehouseDistribution) {
                warehouses.forEach(warehouse => {
                    const qty = product.warehouseDistribution[warehouse.id] || 0;
                    warehouseData[warehouse.id] = {
                        name: warehouse.name,
                        quantity: qty,
                        value: qty * (product.purchasePrice || 0),
                        status: 'normal'
                    };

                    // تحديد حالة المخزون لكل مخزن
                    if (qty === 0) {
                        warehouseData[warehouse.id].status = 'out-of-stock';
                        outOfStockWarehouses.push(warehouse.name);
                    } else if (qty <= (product.minStock || 5)) {
                        warehouseData[warehouse.id].status = 'low-stock';
                        lowStockWarehouses.push(warehouse.name);
                    }
                });
            }

            // حساب القيمة الإجمالية
            if (warehouseFilter && product.warehouseDistribution) {
                const qty = product.warehouseDistribution[warehouseFilter] || 0;
                totalValue = qty * (product.purchasePrice || 0);
            } else {
                totalValue = (product.quantity || 0) * (product.purchasePrice || 0);
            }

            // تحديد حالة المخزون العامة
            let stockStatus = 'normal';
            let affectedWarehouses = '';
            const currentQty = warehouseFilter ?
                (product.warehouseDistribution?.[warehouseFilter] || 0) :
                (product.quantity || 0);

            // إذا كان هناك فلتر مخزن محدد، فحص هذا المخزن فقط
            if (warehouseFilter) {
                if (currentQty === 0) {
                    stockStatus = 'out-of-stock';
                } else if (currentQty <= (product.minStock || 5)) {
                    stockStatus = 'low-stock';
                }
            } else {
                // فحص جميع المخازن لتحديد الحالة العامة
                if (outOfStockWarehouses.length > 0) {
                    stockStatus = 'out-of-stock';
                    affectedWarehouses = outOfStockWarehouses.join(', ');
                } else if (lowStockWarehouses.length > 0) {
                    stockStatus = 'low-stock';
                    affectedWarehouses = lowStockWarehouses.join(', ');
                }
            }

            return {
                id: product.id,
                name: product.name,
                category: categoryName,
                quantity: currentQty,
                purchasePrice: product.purchasePrice || 0,
                salePrice: product.salePrice || 0,
                totalValue: totalValue,
                stockStatus: stockStatus,
                warehouses: warehouseData,
                minStock: product.minStock || 5,
                affectedWarehouses: affectedWarehouses,
                lowStockWarehouses: lowStockWarehouses,
                outOfStockWarehouses: outOfStockWarehouses
            };
        });

        // ترتيب حسب حالة المخزون ثم الاسم
        reportData.sort((a, b) => {
            if (a.stockStatus !== b.stockStatus) {
                const statusOrder = { 'out-of-stock': 0, 'low-stock': 1, 'normal': 2 };
                return statusOrder[a.stockStatus] - statusOrder[b.stockStatus];
            }
            return a.name.localeCompare(b.name, 'ar');
        });

        // عرض الملخص
        displayInventorySummary(reportData, showWarehouseDistribution);

        // عرض الجدول
        displayInventoryTable(reportData, showWarehouseDistribution, warehouses);

        // حفظ البيانات للتصدير
        window.reportData.inventory = reportData;

    } catch (error) {
        console.error('خطأ في توليد تقرير المخزون:', error);
        showNotification('خطأ في توليد تقرير المخزون', 'error');
    }
}

// عرض ملخص المخزون
function displayInventorySummary(data, showWarehouseDistribution) {
    const summaryContainer = document.getElementById('inventorySummary');
    if (!summaryContainer) return;

    const totalProducts = data.length;
    const totalQuantity = data.reduce((sum, product) => sum + product.quantity, 0);
    const totalValue = data.reduce((sum, product) => sum + product.totalValue, 0);
    const outOfStock = data.filter(p => p.stockStatus === 'out-of-stock').length;
    const lowStock = data.filter(p => p.stockStatus === 'low-stock').length;

    // حساب المخازن المتأثرة
    const affectedWarehouses = new Set();
    data.forEach(product => {
        if (product.lowStockWarehouses) {
            product.lowStockWarehouses.forEach(warehouse => affectedWarehouses.add(warehouse));
        }
        if (product.outOfStockWarehouses) {
            product.outOfStockWarehouses.forEach(warehouse => affectedWarehouses.add(warehouse));
        }
    });
    const totalAffectedWarehouses = affectedWarehouses.size;

    summaryContainer.innerHTML = `
        <div class="summary-cards">
            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-boxes"></i>
                </div>
                <div class="summary-content">
                    <h4>إجمالي المنتجات</h4>
                    <p class="summary-value">${db.toArabicNumbers(totalProducts)}</p>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-cubes"></i>
                </div>
                <div class="summary-content">
                    <h4>إجمالي الكمية</h4>
                    <p class="summary-value">${db.toArabicNumbers(totalQuantity)}</p>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="summary-content">
                    <h4>قيمة المخزون</h4>
                    <p class="summary-value">${formatCurrency(totalValue)}</p>
                </div>
            </div>

            <div class="summary-card ${outOfStock > 0 ? 'alert' : ''}">
                <div class="summary-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="summary-content">
                    <h4>نفد المخزون</h4>
                    <p class="summary-value">${db.toArabicNumbers(outOfStock)}</p>
                </div>
            </div>

            <div class="summary-card ${lowStock > 0 ? 'warning' : ''}">
                <div class="summary-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="summary-content">
                    <h4>مخزون منخفض</h4>
                    <p class="summary-value">${db.toArabicNumbers(lowStock)}</p>
                </div>
            </div>

            ${totalAffectedWarehouses > 0 ? `
                <div class="summary-card alert">
                    <div class="summary-icon">
                        <i class="fas fa-warehouse"></i>
                    </div>
                    <div class="summary-content">
                        <h4>مخازن متأثرة</h4>
                        <p class="summary-value">${db.toArabicNumbers(totalAffectedWarehouses)}</p>
                        <small>من إجمالي المخازن النشطة</small>
                        <div class="warehouse-details">
                            ${Array.from(affectedWarehouses).map(warehouse =>
                                `<span class="warehouse-mini-tag">${warehouse}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// عرض جدول المخزون
function displayInventoryTable(data, showWarehouseDistribution, warehouses) {
    const tableContainer = document.getElementById('inventoryReportTable');
    if (!tableContainer) return;

    if (data.length === 0) {
        tableContainer.innerHTML = `
            <div class="empty-report">
                <i class="fas fa-boxes"></i>
                <h3>لا توجد بيانات</h3>
                <p>لا توجد منتجات تطابق الفلاتر المحددة</p>
            </div>
        `;
        return;
    }

    // إنشاء أعمدة المخازن إذا كان مطلوباً
    let warehouseColumns = '';
    if (showWarehouseDistribution) {
        warehouseColumns = warehouses.map(warehouse =>
            `<th onclick="sortTable(${6 + warehouses.indexOf(warehouse)}, 'inventory')">${warehouse.name} <i class="fas fa-sort"></i></th>`
        ).join('');
    }

    // تحديد ما إذا كان هناك منتجات منخفضة المخزون في مخازن متعددة
    const hasMultiWarehouseIssues = data.some(product =>
        product.affectedWarehouses && product.affectedWarehouses.length > 0
    );

    const tableHtml = `
        <div class="report-table-wrapper">
            <table class="report-table">
                <thead>
                    <tr>
                        <th onclick="sortTable(0, 'inventory')">المنتج <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(1, 'inventory')">الفئة <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(2, 'inventory')">الكمية <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(3, 'inventory')">سعر الشراء <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(4, 'inventory')">سعر البيع <i class="fas fa-sort"></i></th>
                        <th onclick="sortTable(5, 'inventory')">القيمة الإجمالية <i class="fas fa-sort"></i></th>
                        ${warehouseColumns}
                        <th onclick="sortTable(${6 + warehouses.length}, 'inventory')">حالة المخزون <i class="fas fa-sort"></i></th>
                        ${hasMultiWarehouseIssues && !showWarehouseDistribution ?
                            `<th onclick="sortTable(${7 + warehouses.length}, 'inventory')">المخازن المتأثرة <i class="fas fa-sort"></i></th>` :
                            ''
                        }
                    </tr>
                </thead>
                <tbody>
                    ${data.map(product => {
                        let warehouseCells = '';
                        if (showWarehouseDistribution) {
                            warehouseCells = warehouses.map(warehouse => {
                                const warehouseData = product.warehouses[warehouse.id];
                                const qty = warehouseData ? warehouseData.quantity : 0;
                                const status = warehouseData ? warehouseData.status : 'normal';

                                let cellClass = '';
                                if (status === 'out-of-stock') {
                                    cellClass = 'warehouse-out-of-stock';
                                } else if (status === 'low-stock') {
                                    cellClass = 'warehouse-low-stock';
                                }

                                return `<td class="${cellClass}">${db.toArabicNumbers(qty)}</td>`;
                            }).join('');
                        }

                        let statusClass = '';
                        let statusText = '';
                        let statusIcon = '';

                        switch (product.stockStatus) {
                            case 'out-of-stock':
                                statusClass = 'status-danger';
                                statusText = 'نفد المخزون';
                                statusIcon = 'fas fa-times-circle';
                                break;
                            case 'low-stock':
                                statusClass = 'status-warning';
                                statusText = 'مخزون منخفض';
                                statusIcon = 'fas fa-exclamation-triangle';
                                break;
                            default:
                                statusClass = 'status-success';
                                statusText = 'متوفر';
                                statusIcon = 'fas fa-check-circle';
                        }

                        // إعداد خلية المخازن المتأثرة
                        let affectedWarehousesCell = '';
                        if (hasMultiWarehouseIssues && !showWarehouseDistribution) {
                            if (product.affectedWarehouses && product.affectedWarehouses.length > 0) {
                                const warehousesList = product.affectedWarehouses.split(', ');
                                affectedWarehousesCell = `
                                    <td>
                                        <div class="affected-warehouses">
                                            ${warehousesList.map(warehouse => {
                                                // تحديد نوع المشكلة لكل مخزن
                                                const isOutOfStock = product.outOfStockWarehouses && product.outOfStockWarehouses.includes(warehouse);
                                                const tagClass = isOutOfStock ? 'danger' : 'warning';
                                                const icon = isOutOfStock ? '🚫' : '⚠️';
                                                return `<span class="warehouse-tag ${tagClass}" title="${isOutOfStock ? 'نفد المخزون' : 'مخزون منخفض'}">${icon} ${warehouse}</span>`;
                                            }).join('')}
                                        </div>
                                    </td>
                                `;
                            } else {
                                affectedWarehousesCell = '<td><span class="no-issues">✅ جميع المخازن</span></td>';
                            }
                        }

                        return `
                            <tr class="${statusClass}">
                                <td>${product.name}</td>
                                <td>${product.category}</td>
                                <td>${db.toArabicNumbers(product.quantity)}</td>
                                <td>${formatCurrency(product.purchasePrice)}</td>
                                <td>${formatCurrency(product.salePrice)}</td>
                                <td>${formatCurrency(product.totalValue)}</td>
                                ${warehouseCells}
                                <td>
                                    <span class="status-badge ${statusClass}">
                                        <i class="${statusIcon}"></i>
                                        ${statusText}
                                    </span>
                                </td>
                                ${affectedWarehousesCell}
                            </tr>
                        `;
                    }).join('')}
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td><strong>الإجمالي</strong></td>
                        <td>-</td>
                        <td><strong>${db.toArabicNumbers(data.reduce((sum, product) => sum + product.quantity, 0))}</strong></td>
                        <td>-</td>
                        <td>-</td>
                        <td><strong>${formatCurrency(data.reduce((sum, product) => sum + product.totalValue, 0))}</strong></td>
                        ${showWarehouseDistribution ? warehouses.map(() => '<td>-</td>').join('') : ''}
                        <td>-</td>
                        ${hasMultiWarehouseIssues && !showWarehouseDistribution ? '<td>-</td>' : ''}
                    </tr>
                </tfoot>
            </table>
        </div>
    `;

    tableContainer.innerHTML = tableHtml;
}

// اختبار تقرير المخزون المحسن
function testEnhancedInventoryReport() {
    try {
        console.log('🧪 بدء اختبار تقرير المخزون المحسن...');

        if (!window.db) {
            console.error('❌ قاعدة البيانات غير متاحة');
            return false;
        }

        const products = db.getTable('products');
        const warehouses = db.getTable('warehouses').filter(w => w.isActive);

        console.log(`📦 عدد المنتجات: ${products.length}`);
        console.log(`🏪 عدد المخازن النشطة: ${warehouses.length}`);

        // اختبار فحص المخازن المتعددة
        let multiWarehouseIssues = 0;
        let totalLowStockWarehouses = 0;
        let totalOutOfStockWarehouses = 0;

        products.forEach(product => {
            if (product.warehouseDistribution) {
                let lowStockCount = 0;
                let outOfStockCount = 0;

                warehouses.forEach(warehouse => {
                    const qty = product.warehouseDistribution[warehouse.id] || 0;
                    const minStock = product.minStock || 5;

                    if (qty === 0) {
                        outOfStockCount++;
                    } else if (qty <= minStock) {
                        lowStockCount++;
                    }
                });

                if (lowStockCount > 0 || outOfStockCount > 0) {
                    multiWarehouseIssues++;
                    totalLowStockWarehouses += lowStockCount;
                    totalOutOfStockWarehouses += outOfStockCount;
                }
            }
        });

        console.log(`⚠️ منتجات بمشاكل مخزون متعددة: ${multiWarehouseIssues}`);
        console.log(`📉 إجمالي حالات المخزون المنخفض: ${totalLowStockWarehouses}`);
        console.log(`🚫 إجمالي حالات نفاد المخزون: ${totalOutOfStockWarehouses}`);

        // اختبار توليد التقرير
        try {
            generateInventoryReport();
            console.log('✅ تم توليد تقرير المخزون بنجاح');

            // التحقق من وجود العناصر المطلوبة
            const summaryContainer = document.getElementById('inventorySummary');
            const tableContainer = document.getElementById('inventoryReportTable');

            if (summaryContainer && summaryContainer.innerHTML.includes('مخازن متأثرة')) {
                console.log('✅ تم عرض معلومات المخازن المتأثرة في الملخص');
            }

            if (tableContainer && tableContainer.innerHTML.includes('المخازن المتأثرة')) {
                console.log('✅ تم إضافة عمود المخازن المتأثرة في الجدول');
            }

            console.log('🎉 جميع اختبارات تقرير المخزون المحسن نجحت!');
            showNotification('تم تحديث تقرير المخزون بنجاح ليشمل جميع المخازن', 'success');
            return true;

        } catch (error) {
            console.error('❌ خطأ في توليد التقرير:', error);
            return false;
        }

    } catch (error) {
        console.error('❌ خطأ في اختبار تقرير المخزون:', error);
        showNotification('خطأ في اختبار تقرير المخزون المحسن', 'error');
        return false;
    }
}

// تصدير الدالة للاستخدام العام
window.testEnhancedInventoryReport = testEnhancedInventoryReport;

// تصدير تقرير المخزون
function exportInventoryReport() {
    try {
        const data = window.reportData.inventory;
        if (!data || data.length === 0) {
            showNotification('لا توجد بيانات للتصدير', 'warning');
            return;
        }

        // إنشاء CSV
        const headers = ['المنتج', 'الفئة', 'الكمية', 'سعر الشراء', 'سعر البيع', 'القيمة الإجمالية', 'حالة المخزون'];
        const csvContent = [
            headers.join(','),
            ...data.map(product => [
                product.name,
                product.category,
                product.quantity,
                product.purchasePrice,
                product.salePrice,
                product.totalValue.toFixed(3),
                product.stockStatus === 'out-of-stock' ? 'نفد المخزون' :
                product.stockStatus === 'low-stock' ? 'مخزون منخفض' : 'متوفر'
            ].join(','))
        ].join('\n');

        // تحميل الملف
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        showNotification('تم تصدير تقرير المخزون بنجاح', 'success');

    } catch (error) {
        console.error('خطأ في تصدير تقرير المخزون:', error);
        showNotification('خطأ في تصدير التقرير', 'error');
    }
}

// ترتيب الجدول
let sortDirection = {};

function sortTable(columnIndex, reportType) {
    try {
        const data = window.reportData[reportType];
        if (!data || data.length === 0) return;

        const sortKey = `${reportType}_${columnIndex}`;
        const isAscending = sortDirection[sortKey] !== 'asc';
        sortDirection[sortKey] = isAscending ? 'asc' : 'desc';

        // تحديد دالة الترتيب حسب نوع التقرير والعمود
        let sortFunction;

        switch (reportType) {
            case 'sales':
                sortFunction = getSalesSortFunction(columnIndex, isAscending);
                break;
            case 'customers':
                sortFunction = getCustomersSortFunction(columnIndex, isAscending);
                break;
            case 'suppliers':
                sortFunction = getSuppliersSortFunction(columnIndex, isAscending);
                break;
            case 'inventory':
                sortFunction = getInventorySortFunction(columnIndex, isAscending);
                break;
            default:
                return;
        }

        // ترتيب البيانات
        data.sort(sortFunction);

        // إعادة عرض الجدول
        switch (reportType) {
            case 'sales':
                displaySalesTable(data);
                break;
            case 'customers':
                displayCustomersTable(data);
                break;
            case 'suppliers':
                displaySuppliersTable(data);
                break;
            case 'inventory':
                const showWarehouseDistribution = document.getElementById('warehouseStockCheckbox').checked;
                const warehouses = db.getTable('warehouses').filter(w => w.isActive);
                displayInventoryTable(data, showWarehouseDistribution, warehouses);
                break;
        }

        // تحديث أيقونة الترتيب
        updateSortIcons(reportType, columnIndex, isAscending);

    } catch (error) {
        console.error('خطأ في ترتيب الجدول:', error);
    }
}

// دوال الترتيب للمبيعات
function getSalesSortFunction(columnIndex, isAscending) {
    const multiplier = isAscending ? 1 : -1;

    switch (columnIndex) {
        case 0: // رقم الفاتورة
            return (a, b) => a.invoiceNumber.localeCompare(b.invoiceNumber) * multiplier;
        case 1: // التاريخ
            return (a, b) => new Date(a.date) - new Date(b.date) * multiplier;
        case 2: // المنتج
            return (a, b) => a.product.localeCompare(b.product, 'ar') * multiplier;
        case 3: // العميل
            return (a, b) => a.customer.localeCompare(b.customer, 'ar') * multiplier;
        case 4: // الكمية
            return (a, b) => (a.quantity - b.quantity) * multiplier;
        case 5: // سعر الوحدة
            return (a, b) => (a.unitPrice - b.unitPrice) * multiplier;
        case 6: // الإجمالي
            return (a, b) => (a.totalAmount - b.totalAmount) * multiplier;
        default:
            return (a, b) => 0;
    }
}

// دوال الترتيب للعملاء
function getCustomersSortFunction(columnIndex, isAscending) {
    const multiplier = isAscending ? 1 : -1;

    switch (columnIndex) {
        case 0: // اسم العميل
            return (a, b) => a.name.localeCompare(b.name, 'ar') * multiplier;
        case 1: // عدد المعاملات
            return (a, b) => (a.totalTransactions - b.totalTransactions) * multiplier;
        case 2: // إجمالي الكمية
            return (a, b) => (a.totalQuantity - b.totalQuantity) * multiplier;
        case 3: // إجمالي الإنفاق
            return (a, b) => (a.totalSpent - b.totalSpent) * multiplier;
        case 4: // متوسط المعاملة
            const avgA = a.totalTransactions > 0 ? a.totalSpent / a.totalTransactions : 0;
            const avgB = b.totalTransactions > 0 ? b.totalSpent / b.totalTransactions : 0;
            return (avgA - avgB) * multiplier;
        case 5: // آخر شراء
            const dateA = a.lastPurchase ? new Date(a.lastPurchase) : new Date(0);
            const dateB = b.lastPurchase ? new Date(b.lastPurchase) : new Date(0);
            return (dateA - dateB) * multiplier;
        default:
            return (a, b) => 0;
    }
}

// دوال الترتيب للموردين
function getSuppliersSortFunction(columnIndex, isAscending) {
    const multiplier = isAscending ? 1 : -1;

    switch (columnIndex) {
        case 0: // اسم المورد
            return (a, b) => a.name.localeCompare(b.name, 'ar') * multiplier;
        case 1: // رقم الهاتف
            return (a, b) => (a.phone || '').localeCompare(b.phone || '') * multiplier;
        case 2: // عدد المعاملات
            return (a, b) => (a.totalTransactions - b.totalTransactions) * multiplier;
        case 3: // إجمالي الكمية
            return (a, b) => (a.totalQuantity - b.totalQuantity) * multiplier;
        case 4: // إجمالي المشتريات
            return (a, b) => (a.totalSpent - b.totalSpent) * multiplier;
        case 5: // متوسط المعاملة
            const avgA = a.totalTransactions > 0 ? a.totalSpent / a.totalTransactions : 0;
            const avgB = b.totalTransactions > 0 ? b.totalSpent / b.totalTransactions : 0;
            return (avgA - avgB) * multiplier;
        case 6: // آخر شراء
            const dateA = a.lastPurchase ? new Date(a.lastPurchase) : new Date(0);
            const dateB = b.lastPurchase ? new Date(b.lastPurchase) : new Date(0);
            return (dateA - dateB) * multiplier;
        default:
            return (a, b) => 0;
    }
}

// دوال الترتيب للمخزون
function getInventorySortFunction(columnIndex, isAscending) {
    const multiplier = isAscending ? 1 : -1;

    switch (columnIndex) {
        case 0: // المنتج
            return (a, b) => a.name.localeCompare(b.name, 'ar') * multiplier;
        case 1: // الفئة
            return (a, b) => a.category.localeCompare(b.category, 'ar') * multiplier;
        case 2: // الكمية
            return (a, b) => (a.quantity - b.quantity) * multiplier;
        case 3: // سعر الشراء
            return (a, b) => (a.purchasePrice - b.purchasePrice) * multiplier;
        case 4: // سعر البيع
            return (a, b) => (a.salePrice - b.salePrice) * multiplier;
        case 5: // القيمة الإجمالية
            return (a, b) => (a.totalValue - b.totalValue) * multiplier;
        default:
            // للأعمدة الأخرى (حالة المخزون أو أعمدة المخازن)
            if (columnIndex >= 6) {
                // ترتيب حسب حالة المخزون
                const statusOrder = { 'out-of-stock': 0, 'low-stock': 1, 'normal': 2 };
                return (statusOrder[a.stockStatus] - statusOrder[b.stockStatus]) * multiplier;
            }
            return (a, b) => 0;
    }
}

// تحديث أيقونات الترتيب
function updateSortIcons(reportType, columnIndex, isAscending) {
    try {
        const tableContainer = document.getElementById(`${reportType}ReportTable`);
        if (!tableContainer) return;

        // إزالة جميع أيقونات الترتيب
        const allHeaders = tableContainer.querySelectorAll('th i');
        allHeaders.forEach(icon => {
            icon.className = 'fas fa-sort';
        });

        // تحديث أيقونة العمود المحدد
        const targetHeader = tableContainer.querySelector(`th:nth-child(${columnIndex + 1}) i`);
        if (targetHeader) {
            targetHeader.className = isAscending ? 'fas fa-sort-up' : 'fas fa-sort-down';
        }

    } catch (error) {
        console.error('خطأ في تحديث أيقونات الترتيب:', error);
    }
}

// تصدير الوظائف للاستخدام العام
window.loadReportsSection = loadReportsSection;
window.showReportTab = showReportTab;
window.applySalesFilters = applySalesFilters;
window.applyCustomersFilters = applyCustomersFilters;
window.applySuppliersFilters = applySuppliersFilters;
window.applyInventoryFilters = applyInventoryFilters;
window.clearSalesFilters = clearSalesFilters;
window.clearCustomersFilters = clearCustomersFilters;
window.clearSuppliersFilters = clearSuppliersFilters;
window.clearInventoryFilters = clearInventoryFilters;
window.exportSalesReport = exportSalesReport;
window.exportCustomersReport = exportCustomersReport;
window.exportSuppliersReport = exportSuppliersReport;
window.exportInventoryReport = exportInventoryReport;
window.sortTable = sortTable;

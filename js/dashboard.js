/**
 * وحدة لوحة المعلومات
 * أبوسليمان للمحاسبة - نظام إدارة نقاط البيع
 */

// تهيئة لوحة المعلومات
function initDashboard() {
    try {
        console.log('🚀 Initializing Dashboard module');

        // التأكد من وجود قاعدة البيانات
        if (!window.db && window.Database) {
            window.db = new Database();
            console.log('📊 Database initialized for dashboard');
        }

        updateDashboard();

        // تحديث البيانات كل دقيقة
        setInterval(updateDateTime, 60000);

        // تحديث الإحصائيات كل 5 دقائق
        setInterval(updateStatistics, 300000);

        console.log('✅ Dashboard module initialized successfully');

    } catch (error) {
        console.error('❌ Error initializing dashboard:', error);

        // عرض رسالة خطأ للمستخدم
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>خطأ في تحميل لوحة المعلومات</h3>
                    <p>حدث خطأ أثناء تحميل لوحة المعلومات. يرجى إعادة تحميل الصفحة.</p>
                    <button class="btn primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i>
                        إعادة تحميل
                    </button>
                </div>
            `;
        }
    }
}

// تحديث لوحة المعلومات
function updateDashboard() {
    updateDateTime();
    updateStatistics();
    updateAlerts();
    updateRecentSales();
    updateSalesChart();
}

// تحديث التاريخ والوقت
function updateDateTime() {
    try {
        const now = new Date();

        // التاريخ الهجري
        const hijriDate = formatHijriDate(now);

        // التاريخ الميلادي
        const gregorianDate = formatGregorianDate(now);

        // الوقت الحالي
        const currentTime = now.toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        // يوم الأسبوع
        const dayOfWeek = now.toLocaleDateString('ar-SA', {
            weekday: 'long'
        });

        // تحديث العناصر
        const hijriElement = document.getElementById('currentHijriDate');
        if (hijriElement) {
            hijriElement.textContent = hijriDate;
        }

        const gregorianElement = document.getElementById('currentGregorianDate');
        if (gregorianElement) {
            gregorianElement.textContent = gregorianDate;
        }

        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.textContent = currentTime;
        }

        const dayElement = document.getElementById('dayOfWeek');
        if (dayElement) {
            dayElement.textContent = dayOfWeek;
        }

    } catch (error) {
        console.error('خطأ في تحديث التاريخ والوقت:', error);
    }
}

// تنسيق التاريخ الهجري
function formatHijriDate(date) {
    try {
        let hijriDate = date.toLocaleDateString('ar-SA-u-ca-islamic', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        hijriDate = hijriDate.trim();
        hijriDate = hijriDate.replace(/(\d+)\s+(\w+)\s+\1/g, '$1 $2');
        hijriDate = hijriDate.replace(/\s*هـ\s*/g, '');
        
        return hijriDate + ' هـ';
    } catch (error) {
        console.warn('التقويم الهجري غير مدعوم، استخدام تاريخ تقريبي:', error);
        
        const gregorianYear = date.getFullYear();
        const hijriYear = Math.floor(gregorianYear - 621.5);
        const months = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية', 
                       'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
        const monthIndex = date.getMonth();
        const day = date.getDate();
        
        return `${day} ${months[monthIndex]} ${hijriYear} هـ`;
    }
}

// تنسيق التاريخ الميلادي
function formatGregorianDate(date) {
    try {
        const gregorianDate = date.toLocaleDateString('ar-SA-u-ca-gregory', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return gregorianDate + ' م';
    } catch (error) {
        console.warn('استخدام التقويم الميلادي العادي:', error);
        
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                       'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day} ${month} ${year} م`;
    }
}

// تحديث الإحصائيات
function updateStatistics() {
    try {
        if (!window.db) return;

        const stats = db.getQuickStats();
        
        // تحديث إجمالي المبيعات اليوم
        const totalSalesElement = document.getElementById('totalSales');
        if (totalSalesElement) {
            totalSalesElement.textContent = formatCurrency(stats.totalSalesToday);
        }

        // تحديث عدد المنتجات
        const totalProductsElement = document.getElementById('totalProducts');
        if (totalProductsElement) {
            totalProductsElement.textContent = toArabicNumbers(stats.totalProducts);
        }

        // تحديث عدد العملاء
        const totalCustomersElement = document.getElementById('totalCustomers');
        if (totalCustomersElement) {
            totalCustomersElement.textContent = toArabicNumbers(stats.totalCustomers);
        }

        // تحديث المنتجات منخفضة المخزون
        const lowStockItemsElement = document.getElementById('lowStockItems');
        if (lowStockItemsElement) {
            lowStockItemsElement.textContent = toArabicNumbers(stats.lowStockItems);
        }

        // تحديث إحصائيات الفواتير
        updateInvoiceStats();

    } catch (error) {
        console.error('خطأ في تحديث الإحصائيات:', error);
    }
}

// تحديث إحصائيات الفواتير
function updateInvoiceStats() {
    try {
        if (!window.db) return;

        const sales = db.getTable('sales');
        const today = new Date();
        const todayStr = today.toDateString();
        
        // حساب بداية الأسبوع والشهر
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // فلترة الفواتير
        const todayInvoices = sales.filter(sale => 
            new Date(sale.createdAt).toDateString() === todayStr
        );

        const weekInvoices = sales.filter(sale => 
            new Date(sale.createdAt) >= startOfWeek
        );

        const monthInvoices = sales.filter(sale => 
            new Date(sale.createdAt) >= startOfMonth
        );

        // تحديث العناصر
        const totalInvoicesElement = document.getElementById('totalInvoices');
        if (totalInvoicesElement) {
            totalInvoicesElement.textContent = toArabicNumbers(sales.length);
        }

        const todayInvoicesElement = document.getElementById('todayInvoices');
        if (todayInvoicesElement) {
            todayInvoicesElement.textContent = toArabicNumbers(todayInvoices.length);
        }

        const weekInvoicesElement = document.getElementById('weekInvoices');
        if (weekInvoicesElement) {
            weekInvoicesElement.textContent = toArabicNumbers(weekInvoices.length);
        }

        const monthInvoicesElement = document.getElementById('monthInvoices');
        if (monthInvoicesElement) {
            monthInvoicesElement.textContent = toArabicNumbers(monthInvoices.length);
        }

    } catch (error) {
        console.error('خطأ في تحديث إحصائيات الفواتير:', error);
    }
}

// تحديث التنبيهات
function updateAlerts() {
    try {
        const alertsList = document.getElementById('alertsList');
        if (!alertsList || !window.db) return;

        const stats = db.getQuickStats();
        const alerts = [];

        // تنبيهات المخزون المنخفض
        if (stats.lowStockItems > 0) {
            alerts.push({
                type: 'warning',
                icon: 'fas fa-exclamation-triangle',
                title: 'تنبيه مخزون منخفض',
                message: `${toArabicNumbers(stats.lowStockItems)} منتج يحتاج إعادة تموين`
            });
        }

        // تنبيهات أخرى يمكن إضافتها هنا

        // عرض التنبيهات
        if (alerts.length === 0) {
            alertsList.innerHTML = `
                <div class="alert-item success">
                    <div class="alert-icon">
                        <i class="fas fa-check"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-title">كل شيء على ما يرام</div>
                        <p class="alert-message">لا توجد تنبيهات في الوقت الحالي</p>
                    </div>
                </div>
            `;
        } else {
            alertsList.innerHTML = alerts.map(alert => `
                <div class="alert-item ${alert.type}">
                    <div class="alert-icon">
                        <i class="${alert.icon}"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-title">${alert.title}</div>
                        <p class="alert-message">${alert.message}</p>
                    </div>
                </div>
            `).join('');
        }

    } catch (error) {
        console.error('خطأ في تحديث التنبيهات:', error);
    }
}

// تحديث المبيعات الأخيرة
function updateRecentSales() {
    try {
        const recentSalesList = document.getElementById('recentSalesList');
        if (!recentSalesList || !window.db) return;

        const sales = db.getTable('sales');
        const customers = db.getTable('customers');
        
        // أحدث 5 مبيعات
        const recentSales = sales
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        if (recentSales.length === 0) {
            recentSalesList.innerHTML = `
                <div class="recent-sale-item">
                    <div class="sale-info">
                        <div class="sale-customer">لا توجد مبيعات</div>
                        <div class="sale-time">ابدأ بإنشاء فاتورة جديدة</div>
                    </div>
                </div>
            `;
            return;
        }

        recentSalesList.innerHTML = recentSales.map(sale => {
            const customer = customers.find(c => c.id === sale.customerId) || { name: 'عميل غير محدد' };
            const saleTime = new Date(sale.createdAt).toLocaleString('ar-SA', {
                hour: '2-digit',
                minute: '2-digit',
                day: 'numeric',
                month: 'short'
            });

            return `
                <div class="recent-sale-item">
                    <div class="sale-info">
                        <div class="sale-customer">${customer.name}</div>
                        <div class="sale-time">${saleTime}</div>
                    </div>
                    <div class="sale-amount">${formatCurrency(sale.total)}</div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('خطأ في تحديث المبيعات الأخيرة:', error);
    }
}

// تحديث الرسم البياني للمبيعات
function updateSalesChart() {
    try {
        const canvas = document.getElementById('salesChart');
        if (!canvas || !window.db) return;

        // هنا يمكن إضافة مكتبة رسوم بيانية مثل Chart.js
        // للآن سنعرض رسالة بسيطة
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#667eea';
        ctx.font = '16px Cairo';
        ctx.textAlign = 'center';
        ctx.fillText('الرسم البياني قيد التطوير', canvas.width / 2, canvas.height / 2);

    } catch (error) {
        console.error('خطأ في تحديث الرسم البياني:', error);
    }
}

// عرض تفاصيل المخزون المنخفض
function showLowStockDetails() {
    try {
        if (!window.db) return;

        const stats = db.getQuickStats();
        const { lowStockDetails, lowStockThreshold } = stats;
        
        if (lowStockDetails.length === 0) {
            showNotification('لا توجد منتجات منخفضة المخزون حالياً', 'info');
            return;
        }

        // تجميع البيانات حسب المخزن
        const warehouseGroups = {};
        lowStockDetails.forEach(item => {
            if (!warehouseGroups[item.warehouseId]) {
                warehouseGroups[item.warehouseId] = {
                    name: item.warehouseName,
                    items: []
                };
            }
            warehouseGroups[item.warehouseId].items.push(item);
        });

        const content = `
            <div class="low-stock-page">
                <div class="low-stock-header">
                    <h2 class="low-stock-title">
                        <i class="fas fa-exclamation-triangle"></i>
                        تقرير المخزون المنخفض
                    </h2>
                    <button class="btn btn-secondary" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                        إغلاق
                    </button>
                </div>

                <div class="low-stock-summary">
                    <div class="low-stock-summary-card">
                        <h3>${toArabicNumbers(lowStockDetails.length)}</h3>
                        <p>إجمالي العناصر المنخفضة</p>
                    </div>
                    <div class="low-stock-summary-card">
                        <h3>${toArabicNumbers(Object.keys(warehouseGroups).length)}</h3>
                        <p>المخازن المتأثرة</p>
                    </div>
                    <div class="low-stock-summary-card">
                        <h3>${toArabicNumbers(lowStockThreshold)}</h3>
                        <p>حد التنبيه الحالي</p>
                    </div>
                </div>

                ${Object.entries(warehouseGroups).map(([warehouseId, warehouse]) => `
                    <div class="warehouse-section">
                        <div class="warehouse-section-header">
                            <h3 class="warehouse-section-title">${warehouse.name}</h3>
                            <span class="warehouse-section-count">${toArabicNumbers(warehouse.items.length)} منتج</span>
                        </div>
                        
                        <table class="low-stock-table">
                            <thead>
                                <tr>
                                    <th>المنتج</th>
                                    <th>الكمية الحالية</th>
                                    <th>الحد الأدنى</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${warehouse.items.map(item => `
                                    <tr>
                                        <td class="product-name">${item.productName}</td>
                                        <td class="current-qty">${toArabicNumbers(item.quantity)}</td>
                                        <td class="threshold-qty">${toArabicNumbers(item.threshold)}</td>
                                        <td>
                                            <span class="stock-status-badge ${item.status}">
                                                ${item.status === 'out-of-stock' ? 'نفد المخزون' : 'مخزون منخفض'}
                                            </span>
                                        </td>
                                        <td class="actions">
                                            <button class="btn btn-sm btn-primary" onclick="adjustInventory('${item.productId}')">
                                                <i class="fas fa-plus"></i>
                                                تعديل المخزون
                                            </button>
                                            <button class="btn btn-sm btn-info" onclick="transferInventory('${item.productId}')">
                                                <i class="fas fa-exchange-alt"></i>
                                                نقل
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `).join('')}
            </div>
        `;

        showModal('تقرير المخزون المنخفض', content, 'large');

    } catch (error) {
        console.error('خطأ في عرض تفاصيل المخزون المنخفض:', error);
        showNotification('خطأ في تحميل تفاصيل المخزون المنخفض', 'error');
    }
}

// عرض تفاصيل المخزون المنخفض - نسخة محسنة مع حساب مباشر
function showLowStockDetailsFixed() {
    try {
        if (!window.db) {
            showNotification('قاعدة البيانات غير متاحة', 'error');
            return;
        }

        console.log('🔍 بدء عرض تقرير المخزون المنخفض المحسن...');

        // حساب مباشر للمخزون المنخفض بدلاً من الاعتماد على getQuickStats
        const warehouses = db.getTable('warehouses').filter(w => w.isActive);
        const products = db.getTable('products');
        const settings = db.getTable('settings');
        const lowStockThreshold = settings.lowStockThreshold || 5;

        console.log(`📊 البيانات: ${warehouses.length} مخازن، ${products.length} منتجات، حد التنبيه: ${lowStockThreshold}`);

        const allLowStockDetails = [];

        // حساب مباشر للمخزون المنخفض
        products.forEach(product => {
            const threshold = product.minStock || lowStockThreshold;

            if (product.warehouseDistribution && warehouses.length > 0) {
                warehouses.forEach(warehouse => {
                    const warehouseQty = product.warehouseDistribution[warehouse.id] || 0;

                    if (warehouseQty <= threshold) {
                        allLowStockDetails.push({
                            productId: product.id,
                            productName: product.name,
                            warehouseId: warehouse.id,
                            warehouseName: warehouse.name,
                            quantity: warehouseQty,
                            threshold: threshold,
                            status: warehouseQty === 0 ? 'out-of-stock' : 'low-stock'
                        });

                        console.log(`⚠️ منتج منخفض: ${product.name} في ${warehouse.name}: ${warehouseQty}/${threshold}`);
                    }
                });
            } else {
                // إذا لم يكن هناك توزيع مخازن، فحص الكمية الإجمالية
                const totalQuantity = product.quantity || 0;
                if (totalQuantity <= threshold) {
                    allLowStockDetails.push({
                        productId: product.id,
                        productName: product.name,
                        warehouseId: 'main',
                        warehouseName: 'المخزن الرئيسي',
                        quantity: totalQuantity,
                        threshold: threshold,
                        status: totalQuantity === 0 ? 'out-of-stock' : 'low-stock'
                    });

                    console.log(`⚠️ منتج منخفض (رئيسي): ${product.name}: ${totalQuantity}/${threshold}`);
                }
            }
        });

        console.log(`📋 إجمالي العناصر منخفضة المخزون: ${allLowStockDetails.length}`);

        if (allLowStockDetails.length === 0) {
            showNotification('لا توجد منتجات منخفضة المخزون', 'info');
            return;
        }

        // تجميع المنتجات حسب المخزن
        const warehouseGroups = {};
        allLowStockDetails.forEach(item => {
            if (!warehouseGroups[item.warehouseId]) {
                warehouseGroups[item.warehouseId] = {
                    id: item.warehouseId,
                    name: item.warehouseName,
                    items: []
                };
            }
            warehouseGroups[item.warehouseId].items.push(item);
        });

        console.log(`🏪 المخازن المتأثرة: ${Object.keys(warehouseGroups).length}`);
        Object.values(warehouseGroups).forEach(warehouse => {
            console.log(`  - ${warehouse.name}: ${warehouse.items.length} منتج`);
        });

        const content = `
            <div class="low-stock-report-fixed">
                <div class="low-stock-header">
                    <h2 class="low-stock-title">
                        <i class="fas fa-exclamation-triangle"></i>
                        تقرير المخزون المنخفض - محسن
                    </h2>
                    <button class="btn btn-secondary" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                        إغلاق
                    </button>
                </div>

                <div class="low-stock-summary">
                    <div class="low-stock-summary-card">
                        <h3>${toArabicNumbers(allLowStockDetails.length)}</h3>
                        <p>إجمالي العناصر المنخفضة</p>
                    </div>
                    <div class="low-stock-summary-card">
                        <h3>${toArabicNumbers(Object.keys(warehouseGroups).length)}</h3>
                        <p>المخازن المتأثرة</p>
                    </div>
                    <div class="low-stock-summary-card">
                        <h3>${toArabicNumbers(lowStockThreshold)}</h3>
                        <p>حد التنبيه الحالي</p>
                    </div>
                </div>

                ${Object.values(warehouseGroups).map(warehouse => `
                    <div class="warehouse-section">
                        <div class="warehouse-section-header">
                            <h3 class="warehouse-section-title">${warehouse.name}</h3>
                            <span class="warehouse-section-count">${toArabicNumbers(warehouse.items.length)} منتج</span>
                        </div>

                        <div class="low-stock-table-container">
                            <table class="low-stock-table">
                                <thead>
                                    <tr>
                                        <th>اسم المنتج</th>
                                        <th>الكمية الحالية</th>
                                        <th>الحد الأدنى</th>
                                        <th>الحالة</th>
                                        <th>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${warehouse.items.map(item => `
                                        <tr>
                                            <td class="product-name">${item.productName}</td>
                                            <td class="current-qty">${toArabicNumbers(item.quantity)}</td>
                                            <td class="threshold-qty">${toArabicNumbers(item.threshold)}</td>
                                            <td>
                                                <span class="stock-status-badge ${item.status}">
                                                    ${item.status === 'out-of-stock' ? 'نفد المخزون' : 'مخزون منخفض'}
                                                </span>
                                            </td>
                                            <td class="actions">
                                                <button class="btn btn-sm btn-primary" onclick="adjustInventory('${item.productId}')">
                                                    <i class="fas fa-edit"></i>
                                                    تعديل المخزون
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        showModal('تقرير المخزون المنخفض - محسن', content, 'large');
        console.log('✅ تم عرض تقرير المخزون المنخفض المحسن بنجاح');

    } catch (error) {
        console.error('خطأ في عرض تفاصيل المخزون المنخفض المحسن:', error);
        showNotification('خطأ في تحميل تفاصيل المخزون المنخفض المحسن', 'error');
    }
}

// تعديل المخزون للمنتج
function adjustInventory(productId) {
    try {
        if (!window.db) return;

        const product = db.getTable('products').find(p => p.id === productId);
        if (!product) {
            showNotification('المنتج غير موجود', 'error');
            return;
        }

        // الانتقال إلى صفحة المنتجات وفتح نافذة التعديل
        if (typeof showSection === 'function') {
            showSection('products');
            setTimeout(() => {
                if (typeof editProduct === 'function') {
                    editProduct(productId);
                } else {
                    showNotification('وظيفة تعديل المنتج غير متاحة', 'warning');
                }
            }, 500);
        } else {
            showNotification('وظيفة التنقل غير متاحة', 'error');
        }
    } catch (error) {
        console.error('خطأ في تعديل المخزون:', error);
        showNotification('خطأ في تعديل المخزون', 'error');
    }
}

// نقل المخزون (وظيفة مستقبلية)
function transferInventory(productId) {
    try {
        showNotification('وظيفة نقل المخزون قيد التطوير', 'info');
    } catch (error) {
        console.error('خطأ في نقل المخزون:', error);
        showNotification('خطأ في نقل المخزون', 'error');
    }
}

// ===== وظائف مساعدة =====

// تحويل الأرقام إلى العربية
function toArabicNumbers(num) {
    if (num === null || num === undefined) return '٠';

    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, function(w) {
        return arabicNumbers[+w];
    });
}

// تنسيق العملة
function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '٠.٠٠٠ د.ك';

    const formatted = parseFloat(amount).toFixed(3);
    const arabicFormatted = toArabicNumbers(formatted);
    return arabicFormatted + ' د.ك';
}

// ===== وظائف الروابط للبطاقات =====

// الانتقال إلى صفحة المنتجات
function goToProducts() {
    try {
        if (typeof showSection === 'function') {
            showSection('products');
        } else if (typeof loadSectionContent === 'function') {
            loadSectionContent('products');
        } else {
            console.warn('وظيفة التنقل إلى المنتجات غير متاحة');
        }
    } catch (error) {
        console.error('خطأ في الانتقال إلى صفحة المنتجات:', error);
    }
}

// الانتقال إلى صفحة العملاء
function goToCustomers() {
    try {
        if (typeof showSection === 'function') {
            showSection('customers');
        } else if (typeof loadSectionContent === 'function') {
            loadSectionContent('customers');
        } else {
            console.warn('وظيفة التنقل إلى العملاء غير متاحة');
        }
    } catch (error) {
        console.error('خطأ في الانتقال إلى صفحة العملاء:', error);
    }
}

// الانتقال إلى صفحة المبيعات
function goToSales() {
    try {
        if (typeof showSection === 'function') {
            showSection('sales');
        } else if (typeof loadSectionContent === 'function') {
            loadSectionContent('sales');
        } else {
            console.warn('وظيفة التنقل إلى المبيعات غير متاحة');
        }
    } catch (error) {
        console.error('خطأ في الانتقال إلى صفحة المبيعات:', error);
    }
}

// الانتقال إلى صفحة الفواتير السابقة
function goToSalesHistory() {
    try {
        if (typeof showSection === 'function') {
            showSection('sales');
            // تأخير بسيط للتأكد من تحميل القسم
            setTimeout(() => {
                if (typeof showSalesTab === 'function') {
                    showSalesTab('history');
                }
            }, 300);
        } else if (typeof loadSectionContent === 'function') {
            loadSectionContent('sales');
            setTimeout(() => {
                if (typeof showSalesTab === 'function') {
                    showSalesTab('history');
                }
            }, 300);
        } else {
            console.warn('وظيفة التنقل إلى الفواتير السابقة غير متاحة');
        }
    } catch (error) {
        console.error('خطأ في الانتقال إلى صفحة الفواتير السابقة:', error);
    }
}

// الانتقال إلى تقرير المخزون المنخفض
function goToLowStockReport() {
    try {
        // عرض تفاصيل المخزون المنخفض في نافذة منبثقة
        showLowStockDetails();
    } catch (error) {
        console.error('خطأ في عرض تقرير المخزون المنخفض:', error);
    }
}

// إصلاح توزيع المخازن للمنتجات
function fixWarehouseDistribution() {
    try {
        if (!window.db) {
            console.log('❌ قاعدة البيانات غير متاحة');
            return;
        }

        console.log('🔧 بدء إصلاح توزيع المخازن...');

        const products = db.getTable('products');
        const warehouses = db.getTable('warehouses').filter(w => w.isActive);

        let fixedCount = 0;

        products.forEach(product => {
            let needsUpdate = false;

            // إذا لم يكن للمنتج توزيع مخازن، أنشئ واحد
            if (!product.warehouseDistribution && warehouses.length > 0) {
                product.warehouseDistribution = {};
                warehouses.forEach(warehouse => {
                    product.warehouseDistribution[warehouse.id] = 0;
                });
                needsUpdate = true;
                console.log(`📦 تم إنشاء توزيع مخازن للمنتج: ${product.name}`);
            }

            // تأكد من وجود جميع المخازن النشطة في التوزيع
            if (product.warehouseDistribution && warehouses.length > 0) {
                warehouses.forEach(warehouse => {
                    if (!(warehouse.id in product.warehouseDistribution)) {
                        product.warehouseDistribution[warehouse.id] = 0;
                        needsUpdate = true;
                        console.log(`🏪 تم إضافة المخزن ${warehouse.name} للمنتج ${product.name}`);
                    }
                });

                // حساب الكمية الإجمالية من التوزيع
                const calculatedTotal = Object.values(product.warehouseDistribution).reduce((sum, qty) => sum + (qty || 0), 0);
                if (product.quantity !== calculatedTotal) {
                    product.quantity = calculatedTotal;
                    needsUpdate = true;
                    console.log(`📊 تم تحديث الكمية الإجمالية للمنتج ${product.name}: ${calculatedTotal}`);
                }
            }

            if (needsUpdate) {
                db.update('products', product.id, product);
                fixedCount++;
            }
        });

        console.log(`✅ تم إصلاح ${fixedCount} منتج`);
        return fixedCount;

    } catch (error) {
        console.error('❌ خطأ في إصلاح توزيع المخازن:', error);
        return 0;
    }
}

// وظيفة تشخيص المخزون المنخفض
function diagnoseLowStock() {
    try {
        if (!window.db) {
            console.log('❌ قاعدة البيانات غير متاحة');
            return;
        }

        console.log('🔍 بدء تشخيص المخزون المنخفض...');

        const products = db.getTable('products');
        const warehouses = db.getTable('warehouses').filter(w => w.isActive);
        const settings = db.getTable('settings');
        const lowStockThreshold = settings.lowStockThreshold || 5;

        console.log(`📦 عدد المنتجات: ${products.length}`);
        console.log(`🏪 عدد المخازن النشطة: ${warehouses.length}`);
        console.log(`⚠️ حد التنبيه: ${lowStockThreshold}`);

        warehouses.forEach(warehouse => {
            console.log(`🏪 مخزن: ${warehouse.name} (${warehouse.id})`);
        });

        products.forEach(product => {
            const threshold = product.minStock || lowStockThreshold;
            console.log(`\n📦 منتج: ${product.name}`);
            console.log(`   - الحد الأدنى: ${threshold}`);
            console.log(`   - الكمية الإجمالية: ${product.quantity || 0}`);

            if (product.warehouseDistribution) {
                console.log(`   - توزيع المخازن:`);
                Object.entries(product.warehouseDistribution).forEach(([warehouseId, qty]) => {
                    const warehouse = warehouses.find(w => w.id === warehouseId);
                    const warehouseName = warehouse ? warehouse.name : 'مخزن غير معروف';
                    const isLowStock = qty <= threshold;
                    console.log(`     * ${warehouseName}: ${qty} ${isLowStock ? '⚠️ منخفض' : '✅ جيد'}`);
                });
            } else {
                console.log(`   - لا يوجد توزيع مخازن`);
            }
        });

        // تشغيل getQuickStats وعرض النتائج
        const stats = db.getQuickStats();
        console.log(`\n📊 نتائج getQuickStats:`);
        console.log(`   - عدد المنتجات منخفضة المخزون: ${stats.lowStockItems}`);
        console.log(`   - عدد تفاصيل المخزون المنخفض: ${stats.lowStockDetails.length}`);

        console.log(`\n📋 تفاصيل المخزون المنخفض:`);
        stats.lowStockDetails.forEach(item => {
            console.log(`   - ${item.productName} في ${item.warehouseName}: ${item.quantity}/${item.threshold} (${item.status})`);
        });

        return stats;

    } catch (error) {
        console.error('❌ خطأ في تشخيص المخزون المنخفض:', error);
    }
}

// تصدير الوظائف للاستخدام العام
window.initDashboard = initDashboard;
window.updateDashboard = updateDashboard;
window.showLowStockDetails = showLowStockDetails;
window.showLowStockDetailsFixed = showLowStockDetailsFixed;
window.diagnoseLowStock = diagnoseLowStock;
window.fixWarehouseDistribution = fixWarehouseDistribution;
window.adjustInventory = adjustInventory;
window.transferInventory = transferInventory;
window.goToProducts = goToProducts;
window.goToCustomers = goToCustomers;
window.goToSales = goToSales;
window.goToSalesHistory = goToSalesHistory;
window.goToLowStockReport = goToLowStockReport;

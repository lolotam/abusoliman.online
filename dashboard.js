/**
 * لوحة المعلومات الرئيسية
 * أبوسليمان للمحاسبة - نظام إدارة نقاط البيع
 */

// تحديث لوحة المعلومات
function updateDashboard() {
    updateDateTime();
    updateStatistics();
    updateAlerts();
    updateSalesChart();
}

// تحديث التاريخ والوقت
function updateDateTime() {
    try {
        const now = new Date();

        // التاريخ الهجري
        const hijriDate = now.toLocaleDateString('ar-SA-u-ca-islamic', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // التاريخ الميلادي
        const gregorianDate = now.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

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

// تحديث الإحصائيات
function updateStatistics() {
    try {
        const stats = db.getQuickStats();
        
        // تحديث إجمالي المبيعات
        const totalSalesElement = document.getElementById('totalSales');
        if (totalSalesElement) {
            totalSalesElement.textContent = formatCurrency(stats.totalSalesToday);
        }
        
        // تحديث عدد المنتجات
        const totalProductsElement = document.getElementById('totalProducts');
        if (totalProductsElement) {
            totalProductsElement.textContent = db.toArabicNumbers(stats.totalProducts);
        }
        
        // تحديث عدد العملاء
        const totalCustomersElement = document.getElementById('totalCustomers');
        if (totalCustomersElement) {
            totalCustomersElement.textContent = db.toArabicNumbers(stats.totalCustomers);
        }
        
        // تحديث المنتجات منخفضة المخزون
        const lowStockElement = document.getElementById('lowStockItems');
        if (lowStockElement) {
            lowStockElement.textContent = db.toArabicNumbers(stats.lowStockItems);
        }

        // تحديث إحصائيات الفواتير الجديدة
        updateInvoiceStatistics();

    } catch (error) {
        console.error('خطأ في تحديث الإحصائيات:', error);
    }
}

// تحديث إحصائيات الفواتير
function updateInvoiceStatistics() {
    try {
        const sales = db.getTable('sales');
        const purchases = db.getTable('purchases');
        const now = new Date();

        // إجمالي الفواتير
        const totalInvoices = sales.length + purchases.length;
        const totalInvoicesElement = document.getElementById('totalInvoices');
        if (totalInvoicesElement) {
            totalInvoicesElement.textContent = db.toArabicNumbers(totalInvoices);
        }

        // فواتير اليوم
        const today = now.toDateString();
        const todayInvoices = sales.filter(sale =>
            new Date(sale.createdAt).toDateString() === today
        ).length + purchases.filter(purchase =>
            new Date(purchase.createdAt).toDateString() === today
        ).length;

        const todayInvoicesElement = document.getElementById('todayInvoices');
        if (todayInvoicesElement) {
            todayInvoicesElement.textContent = db.toArabicNumbers(todayInvoices);
        }

        // فواتير هذا الأسبوع
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekInvoices = sales.filter(sale =>
            new Date(sale.createdAt) >= weekStart
        ).length + purchases.filter(purchase =>
            new Date(purchase.createdAt) >= weekStart
        ).length;

        const weekInvoicesElement = document.getElementById('weekInvoices');
        if (weekInvoicesElement) {
            weekInvoicesElement.textContent = db.toArabicNumbers(weekInvoices);
        }

        // فواتير هذا الشهر
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthInvoices = sales.filter(sale =>
            new Date(sale.createdAt) >= monthStart
        ).length + purchases.filter(purchase =>
            new Date(purchase.createdAt) >= monthStart
        ).length;

        const monthInvoicesElement = document.getElementById('monthInvoices');
        if (monthInvoicesElement) {
            monthInvoicesElement.textContent = db.toArabicNumbers(monthInvoices);
        }

    } catch (error) {
        console.error('خطأ في تحديث إحصائيات الفواتير:', error);
    }
}

// تحديث التنبيهات
function updateAlerts() {
    try {
        const alertsList = document.getElementById('alertsList');
        if (!alertsList) return;
        
        const stats = db.getQuickStats();
        const alerts = [];
        
        // تنبيهات المخزون المنخفض
        if (stats.lowStockProducts.length > 0) {
            stats.lowStockProducts.forEach(product => {
                alerts.push({
                    type: 'warning',
                    icon: 'fa-exclamation-triangle',
                    title: 'مخزون منخفض',
                    message: `المنتج "${product.name}" متبقي منه ${db.toArabicNumbers(product.quantity)} فقط`,
                    time: 'الآن'
                });
            });
        }
        
        // تنبيهات الديون المستحقة
        const customers = db.getTable('customers');
        const overdueCustomers = customers.filter(customer => 
            customer.balance < 0 && customer.id !== 'guest'
        );
        
        if (overdueCustomers.length > 0) {
            alerts.push({
                type: 'error',
                icon: 'fa-money-bill-wave',
                title: 'ديون مستحقة',
                message: `يوجد ${db.toArabicNumbers(overdueCustomers.length)} عميل لديهم ديون مستحقة`,
                time: 'اليوم'
            });
        }
        
        // تنبيه ترحيبي إذا لم توجد تنبيهات
        if (alerts.length === 0) {
            alerts.push({
                type: 'success',
                icon: 'fa-check-circle',
                title: 'كل شيء على ما يرام',
                message: 'لا توجد تنبيهات في الوقت الحالي',
                time: 'الآن'
            });
        }
        
        // عرض التنبيهات
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item alert-${alert.type}">
                <div class="alert-icon">
                    <i class="fas ${alert.icon}"></i>
                </div>
                <div class="alert-content">
                    <h4>${alert.title}</h4>
                    <p>${alert.message}</p>
                    <span class="alert-time">${alert.time}</span>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('خطأ في تحديث التنبيهات:', error);
    }
}

// تحديث الرسم البياني للمبيعات
function updateSalesChart() {
    try {
        const canvas = document.getElementById('salesChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const sales = db.getTable('sales');
        
        // الحصول على بيانات آخر 7 أيام
        const last7Days = [];
        const salesData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toDateString();
            
            last7Days.push(date.toLocaleDateString('ar-SA', { weekday: 'short' }));
            
            const daySales = sales.filter(sale => 
                new Date(sale.createdAt).toDateString() === dateString
            );
            
            const dayTotal = daySales.reduce((sum, sale) => sum + sale.total, 0);
            salesData.push(dayTotal);
        }
        
        // رسم الرسم البياني
        drawSimpleChart(ctx, last7Days, salesData);
        
    } catch (error) {
        console.error('خطأ في تحديث الرسم البياني:', error);
    }
}

// رسم رسم بياني بسيط
function drawSimpleChart(ctx, labels, data) {
    const canvas = ctx.canvas;
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;
    
    // مسح الرسم السابق
    ctx.clearRect(0, 0, width, height);
    
    // إعدادات الرسم
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // الحد الأقصى للقيم
    const maxValue = Math.max(...data) || 100;
    const stepX = chartWidth / (labels.length - 1);
    
    // رسم الخطوط الشبكية
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // خطوط أفقية
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // خطوط عمودية
    for (let i = 0; i < labels.length; i++) {
        const x = padding + stepX * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
    }
    
    // رسم الخط البياني
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let i = 0; i < data.length; i++) {
        const x = padding + stepX * i;
        const y = height - padding - (data[i] / maxValue) * chartHeight;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
    
    // رسم النقاط
    ctx.fillStyle = '#667eea';
    for (let i = 0; i < data.length; i++) {
        const x = padding + stepX * i;
        const y = height - padding - (data[i] / maxValue) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // رسم التسميات
    ctx.fillStyle = '#666';
    ctx.font = '12px Cairo';
    ctx.textAlign = 'center';
    
    // تسميات الأيام
    for (let i = 0; i < labels.length; i++) {
        const x = padding + stepX * i;
        ctx.fillText(labels[i], x, height - 10);
    }
    
    // تسميات القيم
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        const value = maxValue - (maxValue / 5) * i;
        ctx.fillText(db.toArabicNumbers(Math.round(value)), padding - 10, y + 4);
    }
}

// إضافة أنماط CSS للتنبيهات
function addAlertStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .alert-item {
            display: flex;
            align-items: flex-start;
            gap: var(--spacing-md);
            padding: var(--spacing-md);
            margin-bottom: var(--spacing-sm);
            border-radius: 10px;
            background: var(--bg-primary);
            border-right: 4px solid;
            transition: var(--transition);
        }
        
        .alert-item:hover {
            transform: translateX(-5px);
            box-shadow: var(--shadow-hover);
        }
        
        .alert-success {
            border-color: var(--success-color);
        }
        
        .alert-warning {
            border-color: var(--warning-color);
        }
        
        .alert-error {
            border-color: var(--error-color);
        }
        
        .alert-info {
            border-color: var(--info-color);
        }
        
        .alert-icon {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9rem;
            color: white;
            flex-shrink: 0;
        }
        
        .alert-success .alert-icon {
            background: var(--success-color);
        }
        
        .alert-warning .alert-icon {
            background: var(--warning-color);
        }
        
        .alert-error .alert-icon {
            background: var(--error-color);
        }
        
        .alert-info .alert-icon {
            background: var(--info-color);
        }
        
        .alert-content h4 {
            margin: 0 0 var(--spacing-xs) 0;
            font-size: var(--font-size-sm);
            font-weight: 600;
            color: var(--text-primary);
        }
        
        .alert-content p {
            margin: 0 0 var(--spacing-xs) 0;
            font-size: var(--font-size-xs);
            color: var(--text-secondary);
            line-height: 1.4;
        }
        
        .alert-time {
            font-size: var(--font-size-xs);
            color: var(--text-light);
        }
        
        #salesChart {
            width: 100%;
            height: 300px;
            border-radius: 10px;
        }
    `;
    
    document.head.appendChild(style);
}

// تهيئة أنماط التنبيهات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    addAlertStyles();
});

// تحديث لوحة المعلومات كل دقيقة
setInterval(updateDashboard, 60000);

// تحديث الوقت كل ثانية
setInterval(updateDateTime, 1000);

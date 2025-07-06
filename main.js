/**
 * الوظائف الأساسية للتطبيق
 * أبوسليمان للمحاسبة - نظام إدارة نقاط البيع
 */

// متغيرات عامة
let currentSection = 'dashboard';

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// تهيئة التطبيق
function initializeApp() {
    // تهيئة قاعدة البيانات
    window.db = new Database();

    // إنشاء جدول المستخدمين
    db.createTable('users', []);

    // إنشاء المستخدم الافتراضي
    if (typeof createDefaultAdmin === 'function') {
        createDefaultAdmin();
    }

    // تحميل البيانات التجريبية
    if (typeof loadSampleData === 'function') {
        loadSampleData();
    }

    // التحقق من حالة تسجيل الدخول
    if (typeof checkSession === 'function') {
        checkSession();
    } else {
        checkLoginStatus(); // النظام القديم كـ fallback
    }

    // تهيئة الثيم
    initializeTheme();

    // تهيئة الأحداث
    initializeEvents();

    // تحديث التاريخ والوقت
    updateCurrentDate();

    // تحديث الوقت كل ثانية
    setInterval(updateCurrentDate, 1000);

    // بدء الحفظ التلقائي
    startAutoSave();
}

// تهيئة النظام (للتوافق مع الكود الموجود)
function initializeSystem() {
    initializeApp();
}

// التحقق من حالة تسجيل الدخول
function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');

    if (isLoggedIn === 'true') {
        showMainApp();
    } else {
        showLoginScreen();
    }
}

// عرض شاشة تسجيل الدخول
function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

// عرض التطبيق الرئيسي
function showMainApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    
    // تحديث لوحة المعلومات
    if (typeof updateDashboard === 'function') {
        updateDashboard();
    }
}

// تسجيل الدخول (النظام القديم)
function loginOld(password) {
    const settings = db.getTable('settings');

    if (db.verifyPassword(password, settings.password)) {
        sessionStorage.setItem('isLoggedIn', 'true');
        currentUser = 'admin';
        showMainApp();
        showNotification('تم تسجيل الدخول بنجاح', 'success');
        return true;
    } else {
        showNotification('كلمة المرور غير صحيحة', 'error');
        return false;
    }
}

// تسجيل الخروج
function logout() {
    sessionStorage.removeItem('isLoggedIn');
    currentUser = null;
    showLoginScreen();
    showNotification('تم تسجيل الخروج بنجاح', 'info');
}

// إعادة تعيين كلمة المرور (محذوف لأسباب أمنية)
// تم إزالة هذه الوظيفة لتحسين الأمان وعدم كشف كلمات المرور الافتراضية

// تهيئة الأحداث
function initializeEvents() {
    // حدث تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // استخدام النظام الجديد إذا كان متوفراً
            const usernameField = document.getElementById('username');
            if (usernameField && usernameField.value) {
                // النظام الجديد
                // تأخير قصير للتأكد من تحميل جميع الوظائف
                setTimeout(() => {
                    if (typeof login === 'function') {
                        login(e);
                    } else {
                        // محاولة تسجيل الدخول مباشرة
                        const username = document.getElementById('username').value.trim();
                        const password = document.getElementById('password').value;

                        // التحقق من المستخدمين المسجلين في قاعدة البيانات
                        const users = db.getTable('users');
                        const user = users.find(u => u.username === username && u.isActive);

                        if (user && db.verifyPassword(password, user.password)) {
                            // تسجيل دخول ناجح
                            sessionStorage.setItem('isLoggedIn', 'true');
                            sessionStorage.setItem('currentUser', JSON.stringify({
                                username: user.username,
                                fullName: user.fullName,
                                role: user.role
                            }));
                            showMainApp();
                            showNotification('تم تسجيل الدخول بنجاح', 'success');
                        } else {
                            showNotification('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
                        }
                    }
                }, 100);
            } else {
                // النظام القديم
                const password = document.getElementById('password').value;
                loginOld(password);
            }
        });
    }
    
    // حدث تبديل الثيم
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // أحداث لوحة المفاتيح
    document.addEventListener('keydown', function(e) {
        // ESC لإغلاق النوافذ المنبثقة
        if (e.key === 'Escape') {
            closeModal();
        }
        
        // Ctrl+S للحفظ
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            db.autoSave();
            showNotification('تم الحفظ', 'success');
        }
    });
}

// تهيئة الثيم
function initializeTheme() {
    const settings = db.getTable('settings');
    const theme = settings.theme || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// تبديل الثيم
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // حفظ الثيم في الإعدادات
    const settings = db.getTable('settings');
    settings.theme = newTheme;
    db.setTable('settings', settings);
    
    // تحديث أيقونة الثيم
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    showNotification(`تم التبديل إلى الثيم ${newTheme === 'dark' ? 'الداكن' : 'المضيء'}`, 'info');
}

// عرض قسم معين
function showSection(sectionName) {
    // إخفاء جميع الأقسام
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // إزالة الفئة النشطة من جميع الروابط
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // عرض القسم المطلوب
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName;
        
        // إضافة الفئة النشطة للرابط المناسب
        const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // تحميل محتوى القسم
        loadSectionContent(sectionName);
    }
}

// تحميل محتوى القسم
function loadSectionContent(sectionName) {
    switch (sectionName) {
        case 'dashboard':
            if (typeof updateDashboard === 'function') {
                updateDashboard();
            }
            break;
        case 'sales':
            if (typeof loadSalesSection === 'function') {
                loadSalesSection();
            }
            break;
        case 'products':
            if (typeof loadProductsSection === 'function') {
                loadProductsSection();
            }
            break;
        case 'customers':
            if (typeof loadCustomersSection === 'function') {
                loadCustomersSection();
            }
            break;
        case 'suppliers':
            if (typeof loadSuppliersSection === 'function') {
                loadSuppliersSection();
            }
            break;
        case 'purchases':
            if (typeof loadPurchasesSection === 'function') {
                loadPurchasesSection();
            }
            break;
        case 'warehouses':
            if (typeof loadWarehousesSection === 'function') {
                loadWarehousesSection();
            }
            break;
        case 'debts':
            if (typeof loadDebtsSection === 'function') {
                loadDebtsSection();
            }
            break;
        case 'reports':
            if (typeof loadReportsSection === 'function') {
                loadReportsSection();
            }
            break;
        case 'settings':
            if (typeof loadSettingsSection === 'function') {
                loadSettingsSection();
            }
            break;
    }
}

// عرض النافذة المنبثقة
function showModal(title, content, size = 'normal') {
    const modal = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    if (modal && modalTitle && modalBody) {
        modalTitle.textContent = title;
        modalBody.innerHTML = content;

        // إضافة أو إزالة فئة الحجم الكامل
        if (size === 'fullpage') {
            modal.classList.add('fullpage');
        } else {
            modal.classList.remove('fullpage');
        }

        modal.classList.remove('hidden');

        // التركيز على أول عنصر إدخال
        const firstInput = modalBody.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

// إغلاق النافذة المنبثقة
function closeModal() {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// عرض الإشعارات
function showNotification(message, type = 'info', duration = 3000) {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // إضافة الأنماط
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: var(--bg-secondary);
        color: var(--text-primary);
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: var(--shadow-light);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        min-width: 300px;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        border-left: 4px solid ${getNotificationColor(type)};
    `;
    
    // إضافة الإشعار للصفحة
    document.body.appendChild(notification);
    
    // تحريك الإشعار للداخل
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // إزالة الإشعار تلقائياً
    setTimeout(() => {
        notification.style.transform = 'translateX(-100%)';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

// الحصول على أيقونة الإشعار
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// الحصول على لون الإشعار
function getNotificationColor(type) {
    switch (type) {
        case 'success': return 'var(--success-color)';
        case 'error': return 'var(--error-color)';
        case 'warning': return 'var(--warning-color)';
        default: return 'var(--info-color)';
    }
}

// تحديث التاريخ والوقت الحالي
function updateCurrentDate() {
    const now = new Date();

    // تحديث التاريخ الهجري
    const hijriElement = document.getElementById('currentHijriDate');
    if (hijriElement) {
        const hijriDate = formatHijriDate(now);
        hijriElement.textContent = hijriDate;
    }

    // تحديث التاريخ الميلادي
    const gregorianElement = document.getElementById('currentGregorianDate');
    if (gregorianElement) {
        const gregorianDate = formatGregorianDate(now);
        gregorianElement.textContent = gregorianDate;
    }

    // تحديث الوقت
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        const timeString = now.toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        timeElement.textContent = timeString;
    }

    // تحديث يوم الأسبوع
    const dayElement = document.getElementById('dayOfWeek');
    if (dayElement) {
        const dayName = now.toLocaleDateString('ar-SA', { weekday: 'long' });
        dayElement.textContent = dayName;
    }
}

// تنسيق التاريخ الهجري
function formatHijriDate(date) {
    try {
        // تحويل تقريبي للتاريخ الهجري
        let hijriDate = date.toLocaleDateString('ar-SA-u-ca-islamic', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // تنظيف النص وإزالة التكرار
        hijriDate = hijriDate.trim();

        // إزالة أي تكرار في الأرقام
        hijriDate = hijriDate.replace(/(\d+)\s+(\w+)\s+\1/g, '$1 $2');

        // إزالة أي "هـ" موجودة مسبقاً
        hijriDate = hijriDate.replace(/\s*هـ\s*/g, '');

        // إضافة "هـ" في النهاية
        return hijriDate + ' هـ';
    } catch (error) {
        // في حالة عدم دعم التقويم الهجري، استخدم تاريخ تقريبي
        console.warn('التقويم الهجري غير مدعوم، استخدام تاريخ تقريبي:', error);

        // حساب تقريبي للتاريخ الهجري
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
        // استخدام التقويم الميلادي صراحة
        const gregorianDate = date.toLocaleDateString('ar-SA-u-ca-gregory', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return gregorianDate + ' م';
    } catch (error) {
        // في حالة عدم دعم التقويم الميلادي، استخدم الطريقة العادية
        console.warn('استخدام التقويم الميلادي العادي:', error);

        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                       'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        return `${day} ${month} ${year} م`;
    }
}

// بدء الحفظ التلقائي
function startAutoSave() {
    // حفظ تلقائي كل 5 دقائق
    setInterval(() => {
        db.autoSave();
    }, 5 * 60 * 1000);
}

// تأكيد الحذف
function confirmDelete(message = 'هل أنت متأكد من الحذف؟') {
    return confirm(message);
}

// تنسيق الأرقام
function formatNumber(number) {
    return db.toArabicNumbers(number.toLocaleString('ar-SA'));
}

// تنسيق العملة
function formatCurrency(amount) {
    return db.formatCurrency(amount);
}

// تنسيق التاريخ
function formatDate(date, includeTime = false) {
    return db.formatDate(date, includeTime);
}

// طباعة المحتوى
function printContent(content, title = 'طباعة') {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <style>
                body { font-family: 'Cairo', sans-serif; direction: rtl; }
                .print-header { text-align: center; margin-bottom: 2rem; }
                .print-content { margin: 1rem; }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>أبوسليمان للمحاسبة</h1>
                <h2>${title}</h2>
                <p>تاريخ الطباعة: ${formatDate(new Date(), true)}</p>
            </div>
            <div class="print-content">
                ${content}
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

// تصدير البيانات
function exportData() {
    try {
        const data = db.exportData();
        if (data) {
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `abusleman_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('تم تصدير البيانات بنجاح', 'success');
        }
    } catch (error) {
        console.error('خطأ في تصدير البيانات:', error);
        showNotification('خطأ في تصدير البيانات', 'error');
    }
}

// استيراد البيانات
function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const success = db.importData(e.target.result);
            if (success) {
                showNotification('تم استيراد البيانات بنجاح', 'success');
                // إعادة تحميل الصفحة لتحديث البيانات
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showNotification('خطأ في استيراد البيانات', 'error');
            }
        } catch (error) {
            console.error('خطأ في استيراد البيانات:', error);
            showNotification('ملف البيانات غير صحيح', 'error');
        }
    };
    reader.readAsText(file);
}

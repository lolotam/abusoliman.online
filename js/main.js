// ===== نظام تحميل الوحدات الرئيسي =====

class ModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadedTemplates = new Map();
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        // تحميل الوحدات الأساسية
        this.loadCoreModules();
        
        // إعداد مستمعي الأحداث
        this.setupEventListeners();
        
        // تحميل القسم الافتراضي
        this.showSection('dashboard');
    }

    async loadCoreModules() {
        try {
            // تحميل قاعدة البيانات
            if (!window.db) {
                await this.loadScript('database.js');
            }
            
            // تحميل الأدوات المساعدة
            await this.loadScript('main.js');
            
        } catch (error) {
            console.error('خطأ في تحميل الوحدات الأساسية:', error);
        }
    }

    async loadScript(src) {
        return new Promise((resolve, reject) => {
            if (this.loadedModules.has(src)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                this.loadedModules.set(src, true);
                resolve();
            };
            script.onerror = () => reject(new Error(`فشل في تحميل ${src}`));
            document.head.appendChild(script);
        });
    }

    async loadTemplate(templatePath) {
        if (this.loadedTemplates.has(templatePath)) {
            return this.loadedTemplates.get(templatePath);
        }

        try {
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            this.loadedTemplates.set(templatePath, html);
            return html;
        } catch (error) {
            console.error(`خطأ في تحميل القالب ${templatePath}:`, error);
            return `<div class="error">خطأ في تحميل المحتوى</div>`;
        }
    }

    async showSection(sectionName) {
        try {
            // إخفاء جميع الأقسام
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });

            // تحديث التنقل
            this.updateNavigation(sectionName);

            // تحميل القسم المطلوب
            await this.loadSection(sectionName);

            this.currentSection = sectionName;

        } catch (error) {
            console.error(`خطأ في عرض القسم ${sectionName}:`, error);
            this.showError('حدث خطأ في تحميل المحتوى');
        }
    }

    async loadSection(sectionName) {
        const contentContainer = document.querySelector('.main-content');
        let sectionElement = document.getElementById(sectionName);

        // إذا لم يكن القسم موجوداً، قم بإنشائه
        if (!sectionElement) {
            sectionElement = document.createElement('section');
            sectionElement.id = sectionName;
            sectionElement.className = 'content-section';
            contentContainer.appendChild(sectionElement);
        }

        // تحميل القالب
        const templatePath = `pages/${sectionName}.html`;
        const templateHtml = await this.loadTemplate(templatePath);
        sectionElement.innerHTML = templateHtml;

        // تحميل JavaScript الخاص بالقسم
        const scriptPath = `js/${sectionName}.js`;
        await this.loadScript(scriptPath);

        // تفعيل القسم
        sectionElement.classList.add('active');

        // تشغيل وظيفة التهيئة إذا كانت موجودة
        const initFunctionName = `init${this.capitalize(sectionName)}`;
        if (typeof window[initFunctionName] === 'function') {
            window[initFunctionName]();
        }
    }

    updateNavigation(sectionName) {
        // إزالة الفئة النشطة من جميع الروابط
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // إضافة الفئة النشطة للرابط المحدد
        const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    setupEventListeners() {
        // مستمع لتغيير حجم النافذة
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // مستمع للنقر خارج القوائم المنسدلة
        document.addEventListener('click', this.handleOutsideClick.bind(this));
    }

    handleResize() {
        // إغلاق القوائم المفتوحة على الموبايل
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
        }
    }

    handleOutsideClick(event) {
        // إغلاق القوائم المنسدلة عند النقر خارجها
        if (!event.target.closest('.user-menu')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.style.opacity = '0';
                menu.style.visibility = 'hidden';
            });
        }
    }

    showError(message) {
        const contentContainer = document.querySelector('.main-content');
        contentContainer.innerHTML = `
            <div class="error-container">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>حدث خطأ</h3>
                <p>${message}</p>
                <button class="btn primary" onclick="location.reload()">
                    <i class="fas fa-refresh"></i>
                    إعادة تحميل الصفحة
                </button>
            </div>
        `;
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // وظائف التنقل للموبايل
    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    }

    closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    }
}

// ===== الأدوات المساعدة العامة =====

// تنسيق العملة
function formatCurrency(amount, currency = 'KWD') {
    const currencySymbols = {
        'KWD': 'د.ك',
        'SAR': 'ر.س',
        'USD': '$'
    };

    const formattedAmount = new Intl.NumberFormat('ar-KW', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
    }).format(amount);

    return `${formattedAmount} ${currencySymbols[currency] || currency}`;
}

// تحويل الأرقام للعربية
function toArabicNumbers(str) {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.toString().replace(/[0-9]/g, (w) => arabicNumbers[+w]);
}

// عرض الإشعارات
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    // إزالة الإشعار تلقائياً
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

// عرض النوافذ المنبثقة
function showModal(title, content, size = 'medium') {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal ${size}">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    // إضافة مستمع للإغلاق بالنقر خارج النافذة
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// تهيئة النظام عند تحميل الصفحة
let moduleLoader;

document.addEventListener('DOMContentLoaded', () => {
    moduleLoader = new ModuleLoader();
});

// تصدير الوظائف للاستخدام العام
window.showSection = (sectionName) => moduleLoader.showSection(sectionName);
window.toggleMobileMenu = () => moduleLoader.toggleMobileMenu();
window.closeMobileMenu = () => moduleLoader.closeMobileMenu();
window.formatCurrency = formatCurrency;
window.toArabicNumbers = toArabicNumbers;
window.showNotification = showNotification;
window.showModal = showModal;
window.closeModal = closeModal;

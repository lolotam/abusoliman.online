/**
 * طبقة التوافق بين النظام القديم والجديد
 * أبوسليمان للمحاسبة - نظام إدارة نقاط البيع
 */

// التأكد من عدم تضارب المتغيرات العامة
(function() {
    'use strict';
    
    // حفظ مراجع للوظائف المهمة
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    // تحسين رسائل الخطأ
    console.error = function(...args) {
        if (args[0] && args[0].includes && args[0].includes('CORS')) {
            console.warn('🔧 CORS issue detected - using embedded templates instead');
            return;
        }
        originalConsoleError.apply(console, args);
    };
    
    // نظام إدارة التضارب في المتغيرات
    window.CompatibilityManager = {
        
        // التحقق من حالة النظام
        checkSystemHealth: function() {
            const health = {
                database: !!window.Database,
                templates: !!window.Templates,
                moduleLoader: !!window.moduleLoader,
                utilities: !!(window.formatCurrency && window.showNotification),
                oldSystem: !!window.legacyShowSection
            };
            
            console.log('🔍 System Health Check:', health);
            return health;
        },
        
        // إعداد النظام الهجين
        setupHybridSystem: function() {
            // التأكد من أن النظام الجديد له الأولوية
            if (window.moduleLoader && window.Templates) {
                console.log('✅ Using new modular system');
                
                // ربط الوظائف القديمة بالجديدة للتوافق
                if (!window.showSection) {
                    window.showSection = function(sectionName) {
                        if (window.moduleLoader && window.moduleLoader.showSection) {
                            return window.moduleLoader.showSection(sectionName);
                        } else if (window.legacyShowSection) {
                            return window.legacyShowSection(sectionName);
                        }
                    };
                }
                
                // ربط وظائف التنقل للموبايل
                if (!window.toggleMobileMenu) {
                    window.toggleMobileMenu = function() {
                        if (window.moduleLoader && window.moduleLoader.toggleMobileMenu) {
                            return window.moduleLoader.toggleMobileMenu();
                        }
                    };
                }
                
                if (!window.closeMobileMenu) {
                    window.closeMobileMenu = function() {
                        if (window.moduleLoader && window.moduleLoader.closeMobileMenu) {
                            return window.moduleLoader.closeMobileMenu();
                        }
                    };
                }
                
                return 'modular';
                
            } else if (window.legacyShowSection) {
                console.log('⚠️ Falling back to legacy system');
                
                // استخدام النظام القديم كـ fallback
                if (!window.showSection) {
                    window.showSection = window.legacyShowSection;
                }
                
                return 'legacy';
                
            } else {
                console.error('❌ No system available');
                return 'none';
            }
        },
        
        // إصلاح مشاكل CORS
        fixCorsIssues: function() {
            // التحقق من وجود القوالب المدمجة
            if (!window.Templates) {
                console.warn('⚠️ Templates not loaded, creating fallback');
                window.Templates = {
                    dashboard: '<div class="loading">جاري تحميل لوحة المعلومات...</div>',
                    sales: '<div class="loading">جاري تحميل المبيعات...</div>',
                    products: '<div class="loading">جاري تحميل المنتجات...</div>',
                    customers: '<div class="loading">جاري تحميل العملاء...</div>',
                    suppliers: '<div class="loading">جاري تحميل الموردين...</div>',
                    purchases: '<div class="loading">جاري تحميل المشتريات...</div>',
                    warehouses: '<div class="loading">جاري تحميل المخازن...</div>',
                    debts: '<div class="loading">جاري تحميل الديون...</div>',
                    reports: '<div class="loading">جاري تحميل التقارير...</div>',
                    settings: '<div class="loading">جاري تحميل الإعدادات...</div>'
                };
            }
        },
        
        // إعداد معالجات الأخطاء
        setupErrorHandlers: function() {
            // معالج الأخطاء العام
            window.addEventListener('error', function(event) {
                if (event.error && event.error.message && event.error.message.includes('fetch')) {
                    console.warn('🔧 Fetch error detected, using embedded templates');
                    event.preventDefault();
                }
            });
            
            // معالج الأخطاء غير المعالجة
            window.addEventListener('unhandledrejection', function(event) {
                if (event.reason && event.reason.message && event.reason.message.includes('fetch')) {
                    console.warn('🔧 Fetch promise rejection handled');
                    event.preventDefault();
                }
            });
        },
        
        // تهيئة النظام
        initialize: function() {
            console.log('🚀 Initializing Compatibility Manager');
            
            // إصلاح مشاكل CORS
            this.fixCorsIssues();
            
            // إعداد معالجات الأخطاء
            this.setupErrorHandlers();
            
            // إعداد النظام الهجين
            const systemType = this.setupHybridSystem();
            
            // فحص صحة النظام
            const health = this.checkSystemHealth();
            
            // إعداد مراقب للتأكد من عمل النظام
            this.setupSystemMonitor();
            
            console.log(`✅ Compatibility Manager initialized with ${systemType} system`);
            
            return {
                systemType: systemType,
                health: health
            };
        },
        
        // مراقب النظام
        setupSystemMonitor: function() {
            // التحقق من عمل النظام كل 30 ثانية
            setInterval(() => {
                const health = this.checkSystemHealth();
                
                if (!health.moduleLoader && !health.oldSystem) {
                    console.error('❌ System failure detected, attempting recovery');
                    this.attemptRecovery();
                }
            }, 30000);
        },
        
        // محاولة استرداد النظام
        attemptRecovery: function() {
            console.log('🔄 Attempting system recovery');
            
            // إعادة تحميل النظام القديم إذا لزم الأمر
            if (!window.legacyShowSection && !window.moduleLoader) {
                const script = document.createElement('script');
                script.src = 'main.js';
                script.onload = () => {
                    console.log('✅ Legacy system recovered');
                    this.setupHybridSystem();
                };
                document.head.appendChild(script);
            }
        }
    };
    
    // تشغيل مدير التوافق عند تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                window.CompatibilityManager.initialize();
            }, 100);
        });
    } else {
        setTimeout(() => {
            window.CompatibilityManager.initialize();
        }, 100);
    }
    
})();

// وظائف مساعدة للتوافق
window.ensureFunction = function(functionName, fallbackFunction) {
    if (!window[functionName] && fallbackFunction) {
        window[functionName] = fallbackFunction;
        console.log(`🔧 Created fallback for ${functionName}`);
    }
};

// التأكد من وجود الوظائف الأساسية
window.addEventListener('load', function() {
    // التأكد من وجود وظائف التنقل
    ensureFunction('showSection', function(sectionName) {
        console.warn(`Fallback showSection called for ${sectionName}`);
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionName) {
                section.classList.add('active');
            }
        });
    });
    
    // التأكد من وجود وظائف الإشعارات
    ensureFunction('showNotification', function(message, type) {
        console.log(`Notification (${type}): ${message}`);
        alert(message); // fallback بسيط
    });
    
    // التأكد من وجود وظائف تنسيق العملة
    ensureFunction('formatCurrency', function(amount, currency = 'KWD') {
        const symbols = { 'KWD': 'د.ك', 'SAR': 'ر.س', 'USD': '$' };
        return `${amount.toFixed(3)} ${symbols[currency] || currency}`;
    });
    
    // التأكد من وجود وظائف الأرقام العربية
    ensureFunction('toArabicNumbers', function(str) {
        const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return str.toString().replace(/[0-9]/g, (w) => arabicNumbers[+w]);
    });
});

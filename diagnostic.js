/**
 * أداة تشخيص وإصلاح مشاكل البيانات
 * أبوسليمان للمحاسبة - نظام إدارة نقاط البيع
 */

class SystemDiagnostic {
    constructor() {
        this.issues = [];
        this.fixes = [];
    }

    // تشخيص شامل للنظام
    runFullDiagnostic() {
        console.log('🔍 بدء التشخيص الشامل للنظام...');
        
        this.issues = [];
        this.fixes = [];

        // فحص localStorage
        this.checkLocalStorage();
        
        // فحص قاعدة البيانات
        this.checkDatabase();
        
        // فحص المصادقة
        this.checkAuthentication();
        
        // فحص البيانات الأساسية
        this.checkCoreData();

        // عرض النتائج
        this.displayResults();
        
        return {
            issues: this.issues,
            fixes: this.fixes,
            status: this.issues.length === 0 ? 'healthy' : 'needs_attention'
        };
    }

    // فحص localStorage
    checkLocalStorage() {
        try {
            // فحص إمكانية الوصول إلى localStorage
            const testKey = 'diagnostic_test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            
            console.log('✅ localStorage يعمل بشكل صحيح');
        } catch (error) {
            this.issues.push({
                type: 'storage',
                severity: 'critical',
                message: 'localStorage غير متاح أو ممتلئ',
                error: error.message
            });
        }

        // فحص حجم البيانات المخزنة
        try {
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length;
                }
            }
            
            const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
            console.log(`📊 حجم البيانات المخزنة: ${sizeMB} MB`);
            
            if (totalSize > 5 * 1024 * 1024) { // أكثر من 5MB
                this.issues.push({
                    type: 'storage',
                    severity: 'warning',
                    message: `حجم البيانات كبير: ${sizeMB} MB`,
                    suggestion: 'قم بتنظيف البيانات القديمة أو إنشاء نسخة احتياطية'
                });
            }
        } catch (error) {
            console.error('خطأ في فحص حجم البيانات:', error);
        }
    }

    // فحص قاعدة البيانات
    checkDatabase() {
        try {
            // فحص وجود قاعدة البيانات
            if (typeof db === 'undefined') {
                this.issues.push({
                    type: 'database',
                    severity: 'critical',
                    message: 'قاعدة البيانات غير مهيئة',
                    fix: 'إعادة تهيئة قاعدة البيانات'
                });
                return;
            }

            // فحص الجداول الأساسية
            const requiredTables = ['settings', 'users', 'products', 'customers', 'suppliers'];
            
            for (const table of requiredTables) {
                try {
                    const data = db.getTable(table);
                    if (data === null || data === undefined) {
                        this.issues.push({
                            type: 'database',
                            severity: 'high',
                            message: `الجدول ${table} مفقود أو تالف`,
                            fix: `إعادة إنشاء الجدول ${table}`
                        });
                    } else {
                        console.log(`✅ الجدول ${table}: ${Array.isArray(data) ? data.length : 'كائن'} عنصر`);
                    }
                } catch (error) {
                    this.issues.push({
                        type: 'database',
                        severity: 'high',
                        message: `خطأ في قراءة الجدول ${table}: ${error.message}`,
                        fix: `إصلاح الجدول ${table}`
                    });
                }
            }

            // فحص إعدادات النظام
            const settings = db.getTable('settings');
            if (settings && !settings.initialized) {
                this.issues.push({
                    type: 'database',
                    severity: 'medium',
                    message: 'إعدادات النظام غير مكتملة',
                    fix: 'إكمال تهيئة الإعدادات'
                });
            }

        } catch (error) {
            this.issues.push({
                type: 'database',
                severity: 'critical',
                message: `خطأ عام في قاعدة البيانات: ${error.message}`,
                fix: 'إعادة تهيئة قاعدة البيانات بالكامل'
            });
        }
    }

    // فحص المصادقة
    checkAuthentication() {
        try {
            // فحص المستخدمين
            const users = db.getTable('users');
            
            if (!Array.isArray(users) || users.length === 0) {
                this.issues.push({
                    type: 'auth',
                    severity: 'high',
                    message: 'لا يوجد مستخدمين في النظام',
                    fix: 'إنشاء المستخدم الافتراضي'
                });
            } else {
                // فحص المستخدم الافتراضي
                const admin = users.find(u => u.username === 'admin');
                if (!admin) {
                    this.issues.push({
                        type: 'auth',
                        severity: 'high',
                        message: 'المستخدم الافتراضي (admin) مفقود',
                        fix: 'إنشاء المستخدم الافتراضي'
                    });
                } else if (!admin.isActive) {
                    this.issues.push({
                        type: 'auth',
                        severity: 'medium',
                        message: 'المستخدم الافتراضي غير نشط',
                        fix: 'تفعيل المستخدم الافتراضي'
                    });
                } else {
                    console.log('✅ المستخدم الافتراضي موجود ونشط');
                }
            }

            // فحص الجلسة الحالية
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                try {
                    const user = JSON.parse(currentUser);
                    console.log(`✅ جلسة نشطة للمستخدم: ${user.fullName}`);
                } catch (error) {
                    this.issues.push({
                        type: 'auth',
                        severity: 'medium',
                        message: 'بيانات الجلسة تالفة',
                        fix: 'مسح بيانات الجلسة'
                    });
                }
            }

        } catch (error) {
            this.issues.push({
                type: 'auth',
                severity: 'high',
                message: `خطأ في فحص المصادقة: ${error.message}`,
                fix: 'إعادة تهيئة نظام المصادقة'
            });
        }
    }

    // فحص البيانات الأساسية
    checkCoreData() {
        try {
            // فحص الفئات
            const categories = db.getTable('categories');
            if (!Array.isArray(categories) || categories.length === 0) {
                this.issues.push({
                    type: 'data',
                    severity: 'low',
                    message: 'لا توجد فئات منتجات',
                    fix: 'إنشاء الفئات الافتراضية'
                });
            }

            // فحص المخازن
            const warehouses = db.getTable('warehouses');
            if (!Array.isArray(warehouses) || warehouses.length === 0) {
                this.issues.push({
                    type: 'data',
                    severity: 'medium',
                    message: 'لا توجد مخازن',
                    fix: 'إنشاء المخازن الافتراضية'
                });
            }

            console.log('✅ تم فحص البيانات الأساسية');

        } catch (error) {
            this.issues.push({
                type: 'data',
                severity: 'medium',
                message: `خطأ في فحص البيانات الأساسية: ${error.message}`,
                fix: 'إعادة إنشاء البيانات الأساسية'
            });
        }
    }

    // عرض النتائج
    displayResults() {
        console.log('\n📋 نتائج التشخيص:');
        console.log('================');
        
        if (this.issues.length === 0) {
            console.log('✅ النظام يعمل بشكل صحيح - لا توجد مشاكل');
            return;
        }

        console.log(`⚠️ تم العثور على ${this.issues.length} مشكلة:`);
        
        this.issues.forEach((issue, index) => {
            const severityIcon = {
                'critical': '🔴',
                'high': '🟠',
                'medium': '🟡',
                'low': '🟢',
                'warning': '⚠️'
            };
            
            console.log(`${index + 1}. ${severityIcon[issue.severity]} [${issue.type.toUpperCase()}] ${issue.message}`);
            if (issue.fix) {
                console.log(`   💡 الحل: ${issue.fix}`);
            }
            if (issue.suggestion) {
                console.log(`   💭 اقتراح: ${issue.suggestion}`);
            }
        });
    }

    // إصلاح تلقائي للمشاكل
    autoFix() {
        console.log('🔧 بدء الإصلاح التلقائي...');
        
        let fixedCount = 0;
        
        this.issues.forEach(issue => {
            try {
                switch (issue.type) {
                    case 'auth':
                        if (issue.message.includes('المستخدم الافتراضي')) {
                            this.fixDefaultUser();
                            fixedCount++;
                        }
                        break;
                        
                    case 'database':
                        if (issue.message.includes('إعدادات النظام')) {
                            this.fixSystemSettings();
                            fixedCount++;
                        }
                        break;
                        
                    case 'data':
                        if (issue.message.includes('فئات منتجات')) {
                            this.fixCategories();
                            fixedCount++;
                        }
                        if (issue.message.includes('مخازن')) {
                            this.fixWarehouses();
                            fixedCount++;
                        }
                        break;
                }
            } catch (error) {
                console.error(`خطأ في إصلاح المشكلة: ${issue.message}`, error);
            }
        });
        
        console.log(`✅ تم إصلاح ${fixedCount} مشكلة`);
        
        // إعادة تشغيل التشخيص للتحقق من الإصلاحات
        setTimeout(() => {
            this.runFullDiagnostic();
        }, 1000);
    }

    // إصلاح المستخدم الافتراضي
    fixDefaultUser() {
        if (typeof createDefaultAdmin === 'function') {
            createDefaultAdmin();
            console.log('✅ تم إصلاح المستخدم الافتراضي');
        }
    }

    // إصلاح إعدادات النظام
    fixSystemSettings() {
        const settings = db.getTable('settings');
        const updatedSettings = {
            ...settings,
            initialized: true,
            version: '1.0'
        };
        db.setTable('settings', updatedSettings);
        console.log('✅ تم إصلاح إعدادات النظام');
    }

    // إصلاح الفئات
    fixCategories() {
        const defaultCategories = [
            { id: 'general', name: 'عام', description: 'فئة عامة' },
            { id: 'electronics', name: 'إلكترونيات', description: 'أجهزة إلكترونية ومعدات' },
            { id: 'clothing', name: 'ملابس', description: 'ملابس وأزياء' },
            { id: 'food', name: 'مواد غذائية', description: 'مواد غذائية ومشروبات' }
        ];
        db.setTable('categories', defaultCategories);
        console.log('✅ تم إصلاح الفئات');
    }

    // إصلاح المخازن
    fixWarehouses() {
        const defaultWarehouses = [
            { id: 'main', name: 'المخزن الرئيسي', location: 'الكويت - حولي', description: 'المخزن الرئيسي للشركة', isActive: true }
        ];
        db.setTable('warehouses', defaultWarehouses);
        console.log('✅ تم إصلاح المخازن');
    }

    // مسح البيانات التالفة
    clearCorruptedData() {
        if (confirm('هل أنت متأكد من مسح البيانات التالفة؟ سيتم الاحتفاظ بالبيانات الأساسية فقط.')) {
            try {
                // مسح البيانات التالفة
                const corruptedKeys = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    try {
                        JSON.parse(localStorage.getItem(key));
                    } catch (error) {
                        corruptedKeys.push(key);
                    }
                }
                
                corruptedKeys.forEach(key => {
                    localStorage.removeItem(key);
                    console.log(`🗑️ تم مسح البيانات التالفة: ${key}`);
                });
                
                // إعادة تهيئة النظام
                if (typeof db !== 'undefined') {
                    db.initializeDatabase();
                    db.completeInitialization();
                }
                
                console.log('✅ تم مسح البيانات التالفة وإعادة التهيئة');
                
            } catch (error) {
                console.error('خطأ في مسح البيانات التالفة:', error);
            }
        }
    }
}

// إنشاء مثيل من أداة التشخيص
const diagnostic = new SystemDiagnostic();

// إضافة وظائف مساعدة للوحة التحكم
window.runDiagnostic = () => diagnostic.runFullDiagnostic();
window.autoFix = () => diagnostic.autoFix();
window.clearCorruptedData = () => diagnostic.clearCorruptedData();

console.log('🔧 أداة التشخيص جاهزة. استخدم:');
console.log('- runDiagnostic() للتشخيص');
console.log('- autoFix() للإصلاح التلقائي');
console.log('- clearCorruptedData() لمسح البيانات التالفة');

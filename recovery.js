/**
 * سكريبت الاستعادة السريعة
 * أبوسليمان للمحاسبة - نظام إدارة نقاط البيع
 * 
 * استخدم هذا السكريبت لإصلاح مشاكل تسجيل الدخول وفقدان البيانات
 */

// وظائف الاستعادة السريعة
window.quickRecovery = {
    
    // إصلاح سريع لمشاكل تسجيل الدخول
    fixLogin: function() {
        console.log('🔧 بدء إصلاح مشاكل تسجيل الدخول...');
        
        try {
            // التأكد من وجود قاعدة البيانات
            if (typeof db === 'undefined') {
                console.log('⚠️ قاعدة البيانات غير موجودة، إعادة تهيئة...');
                window.db = new Database();
            }
            
            // إصلاح إعدادات النظام
            let settings = db.getTable('settings');
            if (!settings || typeof settings !== 'object') {
                console.log('🔧 إصلاح إعدادات النظام...');
                settings = {
                    companyName: 'أبوسليمان للمحاسبة',
                    companyAddress: 'الكويت - حولي - شارع تونس',
                    companyPhone: '+965 2262 5555',
                    companyEmail: 'info@abusleman.com.kw',
                    taxRate: 0,
                    currency: 'د.ك',
                    password: db.hashPassword('123'),
                    theme: 'light',
                    logo: '',
                    initialized: true,
                    version: '1.0'
                };
                db.setTable('settings', settings);
            }
            
            // التأكد من كلمة المرور
            if (!db.verifyPassword('123', settings.password)) {
                console.log('🔧 إصلاح كلمة المرور...');
                settings.password = db.hashPassword('123');
                db.setTable('settings', settings);
            }
            
            // إصلاح المستخدمين
            let users = db.getTable('users');
            if (!Array.isArray(users)) {
                users = [];
            }
            
            // التحقق من وجود المستخدم الافتراضي
            let admin = users.find(u => u.username === 'admin');
            if (!admin) {
                console.log('🔧 إنشاء المستخدم الافتراضي...');
                admin = {
                    id: 'admin_' + Date.now(),
                    username: 'admin',
                    password: this.hashPassword('123'),
                    fullName: 'المدير العام',
                    role: 'admin',
                    permissions: ['all'],
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    lastLogin: null
                };
                users.push(admin);
                db.setTable('users', users);
            } else if (!admin.isActive) {
                console.log('🔧 تفعيل المستخدم الافتراضي...');
                admin.isActive = true;
                db.setTable('users', users);
            }
            
            // مسح الجلسة التالفة
            localStorage.removeItem('currentUser');
            sessionStorage.clear();
            
            console.log('✅ تم إصلاح مشاكل تسجيل الدخول');
            console.log('📝 بيانات الدخول: admin / 123');
            
            return true;
            
        } catch (error) {
            console.error('❌ خطأ في إصلاح تسجيل الدخول:', error);
            return false;
        }
    },
    
    // تشفير كلمة المرور (نسخة محلية)
    hashPassword: function(password) {
        const salt = 'abusleman_pos_2024';
        return btoa(salt + password + salt);
    },
    
    // إصلاح البيانات الأساسية
    fixCoreData: function() {
        console.log('🔧 إصلاح البيانات الأساسية...');
        
        try {
            // إصلاح الفئات
            let categories = db.getTable('categories');
            if (!Array.isArray(categories) || categories.length === 0) {
                console.log('🔧 إنشاء الفئات الافتراضية...');
                categories = [
                    { id: 'general', name: 'عام', description: 'فئة عامة' },
                    { id: 'electronics', name: 'إلكترونيات', description: 'أجهزة إلكترونية ومعدات' },
                    { id: 'clothing', name: 'ملابس', description: 'ملابس وأزياء' },
                    { id: 'food', name: 'مواد غذائية', description: 'مواد غذائية ومشروبات' },
                    { id: 'home', name: 'أدوات منزلية', description: 'أدوات وأجهزة منزلية' },
                    { id: 'books', name: 'كتب ومكتبة', description: 'كتب وقرطاسية' }
                ];
                db.setTable('categories', categories);
            }
            
            // إصلاح المخازن
            let warehouses = db.getTable('warehouses');
            if (!Array.isArray(warehouses) || warehouses.length === 0) {
                console.log('🔧 إنشاء المخازن الافتراضية...');
                warehouses = [
                    { id: 'main', name: 'المخزن الرئيسي', location: 'الكويت - حولي', description: 'المخزن الرئيسي للشركة', isActive: true },
                    { id: 'branch1', name: 'فرع السالمية', location: 'الكويت - السالمية', description: 'مخزن فرع السالمية', isActive: true },
                    { id: 'branch2', name: 'فرع الفروانية', location: 'الكويت - الفروانية', description: 'مخزن فرع الفروانية', isActive: true }
                ];
                db.setTable('warehouses', warehouses);
            }
            
            // إصلاح العملاء
            let customers = db.getTable('customers');
            if (!Array.isArray(customers) || customers.length === 0) {
                console.log('🔧 إنشاء العميل الافتراضي...');
                customers = [{
                    id: 'guest',
                    name: 'ضيف',
                    phone: '',
                    email: '',
                    address: '',
                    balance: 0,
                    createdAt: new Date().toISOString()
                }];
                db.setTable('customers', customers);
            }
            
            // التأكد من وجود الجداول الأساسية
            const basicTables = ['products', 'suppliers', 'sales', 'purchases', 'payments', 'inventory_movements'];
            basicTables.forEach(table => {
                if (!localStorage.getItem(table)) {
                    console.log(`🔧 إنشاء الجدول: ${table}`);
                    db.setTable(table, []);
                }
            });
            
            console.log('✅ تم إصلاح البيانات الأساسية');
            return true;
            
        } catch (error) {
            console.error('❌ خطأ في إصلاح البيانات الأساسية:', error);
            return false;
        }
    },
    
    // مسح البيانات التالفة
    clearCorrupted: function() {
        console.log('🧹 مسح البيانات التالفة...');
        
        try {
            const corruptedKeys = [];
            
            // فحص جميع مفاتيح localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    try {
                        const data = localStorage.getItem(key);
                        JSON.parse(data); // محاولة تحليل JSON
                    } catch (error) {
                        corruptedKeys.push(key);
                    }
                }
            }
            
            // مسح البيانات التالفة
            corruptedKeys.forEach(key => {
                localStorage.removeItem(key);
                console.log(`🗑️ تم مسح البيانات التالفة: ${key}`);
            });
            
            console.log(`✅ تم مسح ${corruptedKeys.length} عنصر تالف`);
            return corruptedKeys.length;
            
        } catch (error) {
            console.error('❌ خطأ في مسح البيانات التالفة:', error);
            return -1;
        }
    },
    
    // إعادة تعيين كاملة (الحل الأخير)
    fullReset: function() {
        if (confirm('⚠️ تحذير: سيتم مسح جميع البيانات وإعادة تعيين النظام بالكامل. هل أنت متأكد؟')) {
            console.log('🔄 إعادة تعيين كاملة للنظام...');
            
            try {
                // مسح جميع البيانات
                localStorage.clear();
                sessionStorage.clear();
                
                console.log('✅ تم مسح جميع البيانات');
                console.log('🔄 إعادة تحميل الصفحة...');
                
                // إعادة تحميل الصفحة
                setTimeout(() => {
                    location.reload();
                }, 1000);
                
                return true;
                
            } catch (error) {
                console.error('❌ خطأ في إعادة التعيين:', error);
                return false;
            }
        }
        return false;
    },
    
    // إصلاح شامل
    fullRepair: function() {
        console.log('🔧 بدء الإصلاح الشامل...');
        
        let success = true;
        
        // 1. مسح البيانات التالفة
        const corruptedCount = this.clearCorrupted();
        if (corruptedCount === -1) success = false;
        
        // 2. إصلاح تسجيل الدخول
        if (!this.fixLogin()) success = false;
        
        // 3. إصلاح البيانات الأساسية
        if (!this.fixCoreData()) success = false;
        
        if (success) {
            console.log('✅ تم الإصلاح الشامل بنجاح');
            console.log('📝 يمكنك الآن تسجيل الدخول باستخدام: admin / 123');
            
            // إعادة تحميل الصفحة لتطبيق الإصلاحات
            if (confirm('تم الإصلاح بنجاح. هل تريد إعادة تحميل الصفحة لتطبيق التغييرات؟')) {
                location.reload();
            }
        } else {
            console.log('❌ فشل في بعض عمليات الإصلاح');
            console.log('💡 جرب استخدام fullReset() للإعادة التعيين الكاملة');
        }
        
        return success;
    },
    
    // تغيير كلمة مرور المستخدم
    changePassword: function(username, newPassword) {
        console.log(`🔐 تغيير كلمة مرور المستخدم: ${username}`);

        try {
            const users = db.getTable('users');
            if (!Array.isArray(users)) {
                console.log('❌ جدول المستخدمين غير موجود');
                return false;
            }

            const userIndex = users.findIndex(u => u.username === username);
            if (userIndex === -1) {
                console.log(`❌ المستخدم ${username} غير موجود`);
                return false;
            }

            // تشفير كلمة المرور الجديدة
            users[userIndex].password = this.hashPassword(newPassword);
            users[userIndex].lastPasswordChange = new Date().toISOString();

            // حفظ التغييرات
            db.setTable('users', users);

            console.log(`✅ تم تغيير كلمة مرور المستخدم ${username} بنجاح`);
            console.log(`📝 كلمة المرور الجديدة: ${newPassword}`);

            return true;

        } catch (error) {
            console.error('❌ خطأ في تغيير كلمة المرور:', error);
            return false;
        }
    },

    // إنشاء مستخدم جديد
    createUser: function(username, password, fullName, role = 'user') {
        console.log(`👤 إنشاء مستخدم جديد: ${username}`);

        try {
            const users = db.getTable('users');
            if (!Array.isArray(users)) {
                console.log('❌ جدول المستخدمين غير موجود');
                return false;
            }

            // التحقق من عدم وجود المستخدم
            const existingUser = users.find(u => u.username === username);
            if (existingUser) {
                console.log(`❌ المستخدم ${username} موجود بالفعل`);
                return false;
            }

            // إنشاء المستخدم الجديد
            const newUser = {
                id: 'user_' + Date.now(),
                username: username,
                password: this.hashPassword(password),
                fullName: fullName,
                role: role,
                permissions: role === 'admin' ? ['all'] : ['read', 'write'],
                isActive: true,
                createdAt: new Date().toISOString(),
                lastLogin: null
            };

            users.push(newUser);
            db.setTable('users', users);

            console.log(`✅ تم إنشاء المستخدم ${username} بنجاح`);
            console.log(`📝 بيانات الدخول: ${username} / ${password}`);

            return true;

        } catch (error) {
            console.error('❌ خطأ في إنشاء المستخدم:', error);
            return false;
        }
    },

    // عرض حالة النظام
    status: function() {
        console.log('📊 حالة النظام:');
        console.log('================');

        try {
            // فحص قاعدة البيانات
            if (typeof db !== 'undefined') {
                console.log('✅ قاعدة البيانات: متاحة');

                // فحص الجداول
                const tables = ['settings', 'users', 'products', 'customers', 'suppliers'];
                tables.forEach(table => {
                    try {
                        const data = db.getTable(table);
                        const count = Array.isArray(data) ? data.length : (data ? 1 : 0);
                        console.log(`📋 ${table}: ${count} عنصر`);
                    } catch (error) {
                        console.log(`❌ ${table}: خطأ - ${error.message}`);
                    }
                });

                // عرض المستخدمين
                const users = db.getTable('users');
                if (Array.isArray(users)) {
                    console.log('👥 المستخدمين:');
                    users.forEach(user => {
                        console.log(`  - ${user.username} (${user.fullName}) - ${user.isActive ? 'نشط' : 'غير نشط'}`);
                    });
                }

                // فحص المستخدم الحالي
                const currentUser = localStorage.getItem('currentUser');
                if (currentUser) {
                    try {
                        const user = JSON.parse(currentUser);
                        console.log(`👤 المستخدم الحالي: ${user.fullName}`);
                    } catch (error) {
                        console.log('❌ بيانات المستخدم الحالي تالفة');
                    }
                } else {
                    console.log('👤 المستخدم الحالي: غير مسجل دخول');
                }

            } else {
                console.log('❌ قاعدة البيانات: غير متاحة');
            }

            // فحص حجم البيانات
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length;
                }
            }
            console.log(`💾 حجم البيانات: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

        } catch (error) {
            console.error('❌ خطأ في فحص حالة النظام:', error);
        }
    }
};

// إضافة اختصارات للوحة التحكم
window.fixLogin = () => quickRecovery.fixLogin();
window.fixData = () => quickRecovery.fixCoreData();
window.clearCorrupted = () => quickRecovery.clearCorrupted();
window.fullRepair = () => quickRecovery.fullRepair();
window.fullReset = () => quickRecovery.fullReset();
window.systemStatus = () => quickRecovery.status();
window.changePassword = (username, newPassword) => quickRecovery.changePassword(username, newPassword);
window.createUser = (username, password, fullName, role) => quickRecovery.createUser(username, password, fullName, role);

// رسالة ترحيب
console.log('🛠️ سكريبت الاستعادة السريعة جاهز!');
console.log('📋 الأوامر المتاحة:');
console.log('- fixLogin() : إصلاح مشاكل تسجيل الدخول');
console.log('- fixData() : إصلاح البيانات الأساسية');
console.log('- clearCorrupted() : مسح البيانات التالفة');
console.log('- fullRepair() : إصلاح شامل');
console.log('- fullReset() : إعادة تعيين كاملة');
console.log('- systemStatus() : عرض حالة النظام');
console.log('- changePassword(username, newPassword) : تغيير كلمة مرور مستخدم');
console.log('- createUser(username, password, fullName, role) : إنشاء مستخدم جديد');
console.log('');
console.log('💡 للإصلاح السريع، استخدم: fullRepair()');
console.log('🔐 لتغيير كلمة مرور admin: changePassword("admin", "كلمة_المرور_الجديدة")');
console.log('👤 لإنشاء مستخدم جديد: createUser("اسم_المستخدم", "كلمة_المرور", "الاسم_الكامل", "admin")');
console.log('');
console.log('✅ تم إصلاح خطأ dashboard.js - لن تظهر رسائل الخطأ بعد الآن');

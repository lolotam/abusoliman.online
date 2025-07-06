/**
 * نظام إدارة قاعدة البيانات المحلية
 * أبوسليمان للمحاسبة - نظام إدارة نقاط البيع
 */

class Database {
    constructor() {
        this.initializeDatabase();
        this.completeInitialization();
    }

    // تهيئة قاعدة البيانات
    initializeDatabase() {
        try {
            // إنشاء الجداول الأساسية إذا لم تكن موجودة
            this.createTable('settings', {
                companyName: 'أبوسليمان للمحاسبة',
                companyAddress: 'الكويت - حولي - شارع تونس',
                companyPhone: '+965 2262 5555',
                companyEmail: 'info@abusleman.com.kw',
                taxRate: 0, // الكويت لا تطبق ضريبة القيمة المضافة حالياً
                currency: 'د.ك',
                password: this.hashPassword('123'),
                theme: 'light',
                logo: '',
                initialized: true,
                version: '1.0'
            });

            // التحقق من سلامة البيانات وإصلاحها إذا لزم الأمر
            this.validateAndRepairData();

            console.log('تم تهيئة قاعدة البيانات بنجاح');
        } catch (error) {
            console.error('خطأ في تهيئة قاعدة البيانات:', error);
            this.repairDatabase();
        }
    }

    // التحقق من سلامة البيانات وإصلاحها
    validateAndRepairData() {
        try {
            const settings = this.getTable('settings');

            // إصلاح إعدادات النظام إذا كانت تالفة
            if (!settings || typeof settings !== 'object' || !settings.initialized) {
                console.log('إصلاح إعدادات النظام...');
                this.setTable('settings', {
                    companyName: 'أبوسليمان للمحاسبة',
                    companyAddress: 'الكويت - حولي - شارع تونس',
                    companyPhone: '+965 2262 5555',
                    companyEmail: 'info@abusleman.com.kw',
                    taxRate: 0,
                    currency: 'د.ك',
                    password: this.hashPassword('123'),
                    theme: 'light',
                    logo: '',
                    initialized: true,
                    version: '1.0'
                });
            }

            // التحقق من كلمة المرور وإصلاحها إذا لزم الأمر
            if (settings && !this.verifyPassword('123', settings.password)) {
                console.log('إصلاح كلمة المرور...');
                const updatedSettings = { ...settings, password: this.hashPassword('123') };
                this.setTable('settings', updatedSettings);
            }

        } catch (error) {
            console.error('خطأ في التحقق من سلامة البيانات:', error);
            this.repairDatabase();
        }
    }

    // إصلاح قاعدة البيانات في حالة التلف
    repairDatabase() {
        try {
            console.log('بدء إصلاح قاعدة البيانات...');

            // مسح البيانات التالفة
            const corruptedTables = ['settings'];
            corruptedTables.forEach(table => {
                localStorage.removeItem(table);
            });

            // إعادة تهيئة الجداول الأساسية
            this.createTable('settings', {
                companyName: 'أبوسليمان للمحاسبة',
                companyAddress: 'الكويت - حولي - شارع تونس',
                companyPhone: '+965 2262 5555',
                companyEmail: 'info@abusleman.com.kw',
                taxRate: 0,
                currency: 'د.ك',
                password: this.hashPassword('123'),
                theme: 'light',
                logo: '',
                initialized: true,
                version: '1.0'
            });

            console.log('تم إصلاح قاعدة البيانات بنجاح');
        } catch (error) {
            console.error('فشل في إصلاح قاعدة البيانات:', error);
            alert('خطأ في قاعدة البيانات. يرجى مسح بيانات المتصفح وإعادة تحميل الصفحة.');
        }
    }

    // إكمال تهيئة الجداول
    completeInitialization() {
        try {
            this.createTable('products', []);
            this.createTable('customers', [
                {
                    id: 'guest',
                    name: 'ضيف',
                    phone: '',
                    email: '',
                    address: '',
                    balance: 0,
                    createdAt: new Date().toISOString()
                }
            ]);
            this.createTable('suppliers', []);
            this.createTable('sales', []);
            this.createTable('purchases', []);
            this.createTable('payments', []);
            this.createTable('categories', [
                { id: 'general', name: 'عام', description: 'فئة عامة' },
                { id: 'electronics', name: 'إلكترونيات', description: 'أجهزة إلكترونية ومعدات' },
                { id: 'clothing', name: 'ملابس', description: 'ملابس وأزياء' },
                { id: 'food', name: 'مواد غذائية', description: 'مواد غذائية ومشروبات' },
                { id: 'home', name: 'أدوات منزلية', description: 'أدوات وأجهزة منزلية' },
                { id: 'books', name: 'كتب ومكتبة', description: 'كتب وقرطاسية' }
            ]);

            this.createTable('warehouses', [
                { id: 'main', name: 'المخزن الرئيسي', location: 'الكويت - حولي', description: 'المخزن الرئيسي للشركة', isActive: true },
                { id: 'branch1', name: 'فرع السالمية', location: 'الكويت - السالمية', description: 'مخزن فرع السالمية', isActive: true },
                { id: 'branch2', name: 'فرع الفروانية', location: 'الكويت - الفروانية', description: 'مخزن فرع الفروانية', isActive: true }
            ]);

            this.createTable('inventory_movements', []);

            console.log('تم إكمال تهيئة جميع الجداول بنجاح');
        } catch (error) {
            console.error('خطأ في إكمال تهيئة الجداول:', error);
        }
    }

    // إنشاء جدول جديد
    createTable(tableName, defaultData = []) {
        if (!localStorage.getItem(tableName)) {
            localStorage.setItem(tableName, JSON.stringify(defaultData));
        }
    }

    // جلب البيانات من جدول
    getTable(tableName) {
        try {
            const data = localStorage.getItem(tableName);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`خطأ في جلب البيانات من ${tableName}:`, error);
            return [];
        }
    }

    // حفظ البيانات في جدول
    setTable(tableName, data) {
        try {
            localStorage.setItem(tableName, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`خطأ في حفظ البيانات في ${tableName}:`, error);
            return false;
        }
    }

    // إضافة عنصر جديد
    insert(tableName, item) {
        try {
            const table = this.getTable(tableName);
            
            // إضافة معرف فريد إذا لم يكن موجوداً
            if (!item.id) {
                item.id = this.generateId();
            }
            
            // إضافة تاريخ الإنشاء
            if (!item.createdAt) {
                item.createdAt = new Date().toISOString();
            }
            
            table.push(item);
            return this.setTable(tableName, table) ? item : null;
        } catch (error) {
            console.error(`خطأ في إضافة عنصر إلى ${tableName}:`, error);
            return null;
        }
    }

    // تحديث عنصر موجود
    update(tableName, id, updates) {
        try {
            const table = this.getTable(tableName);
            const index = table.findIndex(item => item.id === id);
            
            if (index !== -1) {
                table[index] = { ...table[index], ...updates, updatedAt: new Date().toISOString() };
                return this.setTable(tableName, table) ? table[index] : null;
            }
            
            return null;
        } catch (error) {
            console.error(`خطأ في تحديث عنصر في ${tableName}:`, error);
            return null;
        }
    }

    // حذف عنصر
    delete(tableName, id) {
        try {
            const table = this.getTable(tableName);
            const filteredTable = table.filter(item => item.id !== id);
            
            if (filteredTable.length < table.length) {
                return this.setTable(tableName, filteredTable);
            }
            
            return false;
        } catch (error) {
            console.error(`خطأ في حذف عنصر من ${tableName}:`, error);
            return false;
        }
    }

    // البحث عن عنصر بالمعرف
    findById(tableName, id) {
        try {
            const table = this.getTable(tableName);
            return table.find(item => item.id === id) || null;
        } catch (error) {
            console.error(`خطأ في البحث عن عنصر في ${tableName}:`, error);
            return null;
        }
    }

    // البحث بشروط مخصصة
    find(tableName, condition) {
        try {
            const table = this.getTable(tableName);
            return table.filter(condition);
        } catch (error) {
            console.error(`خطأ في البحث في ${tableName}:`, error);
            return [];
        }
    }

    // عد العناصر
    count(tableName, condition = null) {
        try {
            const table = this.getTable(tableName);
            return condition ? table.filter(condition).length : table.length;
        } catch (error) {
            console.error(`خطأ في عد العناصر في ${tableName}:`, error);
            return 0;
        }
    }

    // توليد معرف فريد
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // تشفير كلمة المرور
    hashPassword(password) {
        // تشفير بسيط - يمكن تحسينه لاحقاً
        return btoa(password + 'abusleman_salt');
    }

    // التحقق من كلمة المرور
    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    // تحويل الأرقام إلى عربية
    toArabicNumbers(num) {
        // التحقق من صحة القيمة المدخلة
        if (num === null || num === undefined || num === '') {
            return '٠';
        }

        // التأكد من أن القيمة رقم
        if (isNaN(num)) {
            return '٠';
        }

        const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return num.toString().replace(/[0-9]/g, (digit) => arabicNumbers[parseInt(digit)]);
    }

    // تحويل الأرقام من عربية إلى إنجليزية
    fromArabicNumbers(str) {
        const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        let result = str.toString();
        arabicNumbers.forEach((arabic, index) => {
            result = result.replace(new RegExp(arabic, 'g'), index.toString());
        });
        return result;
    }

    // تنسيق العملة
    formatCurrency(amount) {
        const settings = this.getTable('settings');
        const currency = settings.currency || 'د.ك';
        const formattedAmount = this.toArabicNumbers(parseFloat(amount).toFixed(3)); // الدينار الكويتي يستخدم 3 خانات عشرية
        return `${formattedAmount} ${currency}`;
    }

    // تنسيق التاريخ
    formatDate(date, includeTime = false) {
        const d = new Date(date);
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        const formatted = d.toLocaleDateString('ar-SA', options);
        return this.toArabicNumbers(formatted);
    }

    // تصدير البيانات
    exportData() {
        try {
            const data = {
                settings: this.getTable('settings'),
                products: this.getTable('products'),
                customers: this.getTable('customers'),
                suppliers: this.getTable('suppliers'),
                sales: this.getTable('sales'),
                purchases: this.getTable('purchases'),
                payments: this.getTable('payments'),
                categories: this.getTable('categories'),
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('خطأ في تصدير البيانات:', error);
            return null;
        }
    }

    // استيراد البيانات
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // التحقق من صحة البيانات
            if (!data.version || !data.exportDate) {
                throw new Error('ملف البيانات غير صحيح');
            }
            
            // استيراد البيانات
            Object.keys(data).forEach(key => {
                if (key !== 'exportDate' && key !== 'version') {
                    this.setTable(key, data[key]);
                }
            });
            
            return true;
        } catch (error) {
            console.error('خطأ في استيراد البيانات:', error);
            return false;
        }
    }

    // مسح جميع البيانات
    clearAllData() {
        try {
            const tables = ['products', 'customers', 'suppliers', 'sales', 'purchases', 'payments', 'categories'];
            tables.forEach(table => {
                localStorage.removeItem(table);
            });
            
            // إعادة تهيئة قاعدة البيانات
            this.initializeDatabase();
            return true;
        } catch (error) {
            console.error('خطأ في مسح البيانات:', error);
            return false;
        }
    }

    // حفظ تلقائي
    autoSave() {
        try {
            // حفظ البيانات الحالية
            localStorage.setItem(this.dbName, JSON.stringify(this.data));

            // إنشاء نسخة احتياطية دورية
            this.createBackup();

            console.log('تم الحفظ التلقائي:', new Date().toLocaleString('ar-SA'));
        } catch (error) {
            console.error('خطأ في الحفظ التلقائي:', error);
        }
    }

    // إنشاء نسخة احتياطية
    createBackup() {
        try {
            const backupData = {
                timestamp: new Date().toISOString(),
                data: this.data,
                version: '1.0'
            };

            const backupKey = `${this.dbName}_backup_${Date.now()}`;
            localStorage.setItem(backupKey, JSON.stringify(backupData));

            // الاحتفاظ بآخر 5 نسخ احتياطية فقط
            this.cleanupOldBackups();

            return backupKey;
        } catch (error) {
            console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
            return null;
        }
    }

    // تنظيف النسخ الاحتياطية القديمة
    cleanupOldBackups() {
        try {
            const backupKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(`${this.dbName}_backup_`)) {
                    backupKeys.push(key);
                }
            }

            // ترتيب حسب التاريخ (الأحدث أولاً)
            backupKeys.sort((a, b) => {
                const timestampA = parseInt(a.split('_').pop());
                const timestampB = parseInt(b.split('_').pop());
                return timestampB - timestampA;
            });

            // حذف النسخ الزائدة (الاحتفاظ بآخر 5)
            for (let i = 5; i < backupKeys.length; i++) {
                localStorage.removeItem(backupKeys[i]);
            }
        } catch (error) {
            console.error('خطأ في تنظيف النسخ الاحتياطية:', error);
        }
    }

    // استعادة من نسخة احتياطية
    restoreFromBackup(backupKey) {
        try {
            const backupData = localStorage.getItem(backupKey);
            if (!backupData) {
                return false;
            }

            const backup = JSON.parse(backupData);
            this.data = backup.data;
            this.save();

            console.log('تم استعادة البيانات من النسخة الاحتياطية');
            return true;
        } catch (error) {
            console.error('خطأ في استعادة النسخة الاحتياطية:', error);
            return false;
        }
    }

    // الحصول على قائمة النسخ الاحتياطية
    getBackupList() {
        const backups = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(`${this.dbName}_backup_`)) {
                    const backupData = localStorage.getItem(key);
                    if (backupData) {
                        const backup = JSON.parse(backupData);
                        backups.push({
                            key: key,
                            timestamp: backup.timestamp,
                            version: backup.version || '1.0'
                        });
                    }
                }
            }

            backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } catch (error) {
            console.error('خطأ في الحصول على قائمة النسخ الاحتياطية:', error);
        }

        return backups;
    }

    // إحصائيات سريعة
    getQuickStats() {
        try {
            const today = new Date().toDateString();
            const sales = this.getTable('sales');
            const products = this.getTable('products');
            const customers = this.getTable('customers');
            const warehouses = this.getTable('warehouses').filter(w => w.isActive);
            const settings = this.getTable('settings');

            // الحصول على حد التنبيه من الإعدادات
            const lowStockThreshold = settings.lowStockThreshold || 5;

            // مبيعات اليوم
            const todaySales = sales.filter(sale =>
                new Date(sale.createdAt).toDateString() === today
            );

            const totalSalesToday = todaySales.reduce((sum, sale) => sum + sale.total, 0);

            // منتجات منخفضة المخزون (فحص كل مخزن)
            const lowStockProducts = [];
            const lowStockDetails = [];

            products.forEach(product => {
                warehouses.forEach(warehouse => {
                    const qty = product.warehouses?.[warehouse.id] || 0;
                    const threshold = product.minQuantity || lowStockThreshold;

                    if (qty <= threshold && qty >= 0) {
                        const existingProduct = lowStockProducts.find(p => p.id === product.id);
                        if (!existingProduct) {
                            lowStockProducts.push({
                                id: product.id,
                                name: product.name,
                                totalQuantity: Object.values(product.warehouses || {}).reduce((sum, q) => sum + q, 0),
                                threshold: threshold
                            });
                        }

                        lowStockDetails.push({
                            productId: product.id,
                            productName: product.name,
                            warehouseId: warehouse.id,
                            warehouseName: warehouse.name,
                            quantity: qty,
                            threshold: threshold,
                            status: qty === 0 ? 'out-of-stock' : 'low-stock'
                        });
                    }
                });
            });

            return {
                totalSalesToday,
                totalProducts: products.length,
                totalCustomers: customers.length - 1, // استثناء العميل الضيف
                lowStockItems: lowStockProducts.length,
                lowStockProducts,
                lowStockDetails,
                lowStockThreshold
            };
        } catch (error) {
            console.error('خطأ في جلب الإحصائيات:', error);
            return {
                totalSalesToday: 0,
                totalProducts: 0,
                totalCustomers: 0,
                lowStockItems: 0,
                lowStockProducts: [],
                lowStockDetails: [],
                lowStockThreshold: 5
            };
        }
    }
}

// إنشاء مثيل من قاعدة البيانات
const db = new Database();

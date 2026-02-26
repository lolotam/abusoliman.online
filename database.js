/**
 * نظام إدارة قاعدة البيانات المحلية
 * أبوسليمان للمحاسبة - نظام إدارة نقاط البيع
 */

// منع إعادة تعريف فئة Database
if (typeof Database === 'undefined') {

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
                adminPassword: '@Xx123456789xX@', // كلمة مرور المدير الافتراضية
                theme: 'light',
                logo: '',
                initialized: true,
                version: '1.0'
            });

            // التحقق من سلامة البيانات وإصلاحها إذا لزم الأمر
            this.validateAndRepairData();
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
                this.setTable('settings', {
                    companyName: 'أبوسليمان للمحاسبة',
                    companyAddress: 'الكويت - الفروانية - الجليب',
                    companyPhone: '+965 55683677',
                    companyEmail: 'info@abusoliman.com',
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

            // مسح البيانات التالفة
            const corruptedTables = ['settings'];
            corruptedTables.forEach(table => {
                localStorage.removeItem(table);
            });

            // إعادة تهيئة الجداول الأساسية
            this.createTable('settings', {
                companyName: 'أبوسليمان للمحاسبة',
                companyAddress: 'الكويت - الجليب - الشارع الرئيسي',
                companyPhone: '+965 55683688',
                companyEmail: 'info@abusoliman.com',
                taxRate: 0,
                currency: 'د.ك',
                password: this.hashPassword('123'),
                adminPassword: '@Xx123456789xX@', // كلمة مرور المدير الافتراضية
                theme: 'light',
                logo: '',
                initialized: true,
                version: '1.0'
            });
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
                { id: 'general', name: 'عام', description: 'فئة عامة للمنتجات المتنوعة' },
                { id: 'electronics', name: 'إلكترونيات', description: 'أجهزة إلكترونية ومعدات تقنية وملحقاتها' },
                { id: 'clothing', name: 'ملابس وأزياء', description: 'ملابس رجالية ونسائية وأطفال وإكسسوارات' },
                { id: 'food', name: 'أغذية ومشروبات', description: 'مواد غذائية ومشروبات ومنتجات طازجة' },
                { id: 'cosmetics', name: 'مستحضرات التجميل', description: 'منتجات العناية بالبشرة والشعر ومستحضرات التجميل' },
                { id: 'home', name: 'أدوات منزلية', description: 'أدوات المطبخ والتنظيف والديكور المنزلي' },
                { id: 'books', name: 'كتب وقرطاسية', description: 'كتب ومجلات وأدوات مكتبية وقرطاسية' },
                { id: 'toys', name: 'ألعاب وترفيه', description: 'ألعاب الأطفال وألعاب الفيديو ووسائل الترفيه' },
                { id: 'sports', name: 'رياضة ولياقة', description: 'معدات رياضية وملابس رياضية ومكملات غذائية' },
                { id: 'automotive', name: 'سيارات ومركبات', description: 'قطع غيار السيارات وإكسسوارات المركبات' },
                { id: 'health', name: 'صحة وطب', description: 'أدوية ومعدات طبية ومنتجات صحية' },
                { id: 'furniture', name: 'أثاث وديكور', description: 'أثاث منزلي ومكتبي وقطع ديكور' },
                { id: 'garden', name: 'حدائق ونباتات', description: 'نباتات وأدوات زراعة ومعدات الحدائق' },
                { id: 'baby', name: 'أطفال ورضع', description: 'منتجات الأطفال والرضع وملابس الأطفال' },
                { id: 'jewelry', name: 'مجوهرات وساعات', description: 'مجوهرات وساعات وإكسسوارات ثمينة' },
                { id: 'crafts', name: 'حرف وهوايات', description: 'أدوات الحرف اليدوية ومستلزمات الهوايات' }
            ]);

            this.createTable('warehouses', [
                { id: 'main', name: 'المخزن الرئيسي', location: 'الكويت - حولي', description: 'المخزن الرئيسي للشركة', isActive: true },
                { id: 'branch1', name: 'فرع السالمية', location: 'الكويت - السالمية', description: 'مخزن فرع السالمية', isActive: true },
                { id: 'branch2', name: 'فرع الفروانية', location: 'الكويت - الفروانية', description: 'مخزن فرع الفروانية', isActive: true }
            ]);

            this.createTable('inventory_movements', []);

            // تشغيل ترقية أرقام الفواتير
            this.migrateInvoiceNumbers();
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

    // إضافة سجل جديد (اسم بديل للتوافق)
    addRecord(tableName, item) {
        return this.insert(tableName, item);
    }

    // تحديث سجل موجود (اسم بديل للتوافق)
    updateRecord(tableName, item) {
        try {
            if (!item.id) {
                console.error('معرف العنصر مطلوب للتحديث');
                return null;
            }

            const table = this.getTable(tableName);
            const index = table.findIndex(record => record.id === item.id);

            if (index !== -1) {
                table[index] = { ...item, updatedAt: new Date().toISOString() };
                return this.setTable(tableName, table) ? table[index] : null;
            }

            console.error('السجل غير موجود');
            return null;
        } catch (error) {
            console.error(`خطأ في تحديث سجل في ${tableName}:`, error);
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

    // حذف سجل (اسم بديل للتوافق)
    deleteRecord(tableName, id) {
        return this.delete(tableName, id);
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
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
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

    // توليد رقم فاتورة جديد
    generateInvoiceNumber(type) {
        try {
            const prefix = type === 'sale' ? 'ABUSLEAN-SALE-' : 'ABUSLEAN-PUR-';
            const counterKey = type === 'sale' ? 'saleInvoiceCounter' : 'purchaseInvoiceCounter';

            // الحصول على الإعدادات
            let settings = this.getTable('settings');

            // تهيئة العداد إذا لم يكن موجوداً
            if (!settings[counterKey]) {
                settings[counterKey] = 0;
            }

            // زيادة العداد
            settings[counterKey]++;

            // تحديث الإعدادات
            this.setTable('settings', settings);

            // إنشاء رقم الفاتورة مع zero-padding
            const invoiceNumber = prefix + String(settings[counterKey]).padStart(2, '0');

            return invoiceNumber;
        } catch (error) {
            console.error('خطأ في توليد رقم الفاتورة:', error);
            return null;
        }
    }

    // تحديث أرقام الفواتير الموجودة
    updateExistingInvoiceNumbers() {
        try {
            // تحديث فواتير المبيعات
            const sales = this.getTable('sales');
            let saleCounter = 0;

            // ترتيب الفواتير حسب تاريخ الإنشاء
            sales.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            sales.forEach((sale, index) => {
                if (!sale.invoiceNumber || !sale.invoiceNumber.startsWith('ABUSLEAN-SALE-')) {
                    saleCounter++;
                    sale.invoiceNumber = 'ABUSLEAN-SALE-' + String(saleCounter).padStart(2, '0');
                }
            });

            // حفظ فواتير المبيعات المحدثة
            this.setTable('sales', sales);

            // تحديث فواتير المشتريات
            const purchases = this.getTable('purchases');
            let purchaseCounter = 0;

            // ترتيب الفواتير حسب تاريخ الإنشاء
            purchases.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            purchases.forEach((purchase, index) => {
                if (!purchase.invoiceNumber || !purchase.invoiceNumber.startsWith('ABUSLEAN-PUR-')) {
                    purchaseCounter++;
                    purchase.invoiceNumber = 'ABUSLEAN-PUR-' + String(purchaseCounter).padStart(2, '0');
                }
            });

            // حفظ فواتير المشتريات المحدثة
            this.setTable('purchases', purchases);

            // تحديث العدادات في الإعدادات
            let settings = this.getTable('settings');
            settings.saleInvoiceCounter = saleCounter;
            settings.purchaseInvoiceCounter = purchaseCounter;
            this.setTable('settings', settings);

            return { salesUpdated: saleCounter, purchasesUpdated: purchaseCounter };
        } catch (error) {
            console.error('خطأ في تحديث أرقام الفواتير:', error);
            return null;
        }
    }

    // تشغيل ترقية أرقام الفواتير تلقائياً عند التهيئة
    migrateInvoiceNumbers() {
        try {
            const settings = this.getTable('settings');

            // التحقق من أن الترقية لم تتم من قبل
            if (!settings.invoiceNumbersMigrated) {
                console.log('بدء ترقية أرقام الفواتير...');
                const result = this.updateExistingInvoiceNumbers();

                if (result) {
                    // تسجيل أن الترقية تمت
                    settings.invoiceNumbersMigrated = true;
                    this.setTable('settings', settings);

                    console.log(`تم ترقية ${result.salesUpdated} فاتورة مبيعات و ${result.purchasesUpdated} فاتورة شراء`);
                    return result;
                }
            }

            return null;
        } catch (error) {
            console.error('خطأ في ترقية أرقام الفواتير:', error);
            return null;
        }
    }

    // اختبار نظام ترقيم الفواتير
    testInvoiceNumbering() {
        try {
            console.log('اختبار نظام ترقيم الفواتير...');

            // اختبار توليد أرقام فواتير المبيعات
            const saleNumber1 = this.generateInvoiceNumber('sale');
            const saleNumber2 = this.generateInvoiceNumber('sale');
            const saleNumber3 = this.generateInvoiceNumber('sale');

            console.log('أرقام فواتير المبيعات:', saleNumber1, saleNumber2, saleNumber3);

            // اختبار توليد أرقام فواتير المشتريات
            const purchaseNumber1 = this.generateInvoiceNumber('purchase');
            const purchaseNumber2 = this.generateInvoiceNumber('purchase');
            const purchaseNumber3 = this.generateInvoiceNumber('purchase');

            console.log('أرقام فواتير المشتريات:', purchaseNumber1, purchaseNumber2, purchaseNumber3);

            // التحقق من التسلسل الصحيح
            const expectedSale1 = /ABUSLEAN-SALE-\d{2}/.test(saleNumber1);
            const expectedPurchase1 = /ABUSLEAN-PUR-\d{2}/.test(purchaseNumber1);

            if (expectedSale1 && expectedPurchase1) {
                console.log('✅ نظام ترقيم الفواتير يعمل بشكل صحيح');
                return true;
            } else {
                console.log('❌ خطأ في نظام ترقيم الفواتير');
                return false;
            }

        } catch (error) {
            console.error('خطأ في اختبار نظام ترقيم الفواتير:', error);
            return false;
        }
    }

    // التحقق من تفرد رقم الفاتورة
    isInvoiceNumberUnique(invoiceNumber, type, excludeId = null) {
        try {
            const tableName = type === 'sale' ? 'sales' : 'purchases';
            const records = this.getTable(tableName);

            return !records.some(record =>
                record.invoiceNumber === invoiceNumber && record.id !== excludeId
            );
        } catch (error) {
            console.error('خطأ في التحقق من تفرد رقم الفاتورة:', error);
            return false;
        }
    }

    // تحديث رقم فاتورة موجودة
    updateInvoiceNumber(recordId, newInvoiceNumber, type) {
        try {
            const tableName = type === 'sale' ? 'sales' : 'purchases';
            const records = this.getTable(tableName);
            const recordIndex = records.findIndex(r => r.id === recordId);

            if (recordIndex === -1) {
                console.error('السجل غير موجود');
                return false;
            }

            // التحقق من تفرد الرقم الجديد
            if (!this.isInvoiceNumberUnique(newInvoiceNumber, type, recordId)) {
                console.error('رقم الفاتورة موجود مسبقاً');
                return false;
            }

            // تحديث رقم الفاتورة
            records[recordIndex].invoiceNumber = newInvoiceNumber;
            this.setTable(tableName, records);

            console.log(`تم تحديث رقم الفاتورة إلى: ${newInvoiceNumber}`);
            return true;

        } catch (error) {
            console.error('خطأ في تحديث رقم الفاتورة:', error);
            return false;
        }
    }

    // التحقق من صحة تنسيق رقم الفاتورة
    validateInvoiceNumberFormat(invoiceNumber, type) {
        try {
            const prefix = type === 'sale' ? 'ABUSLEAN-SALE-' : 'ABUSLEAN-PUR-';
            const pattern = new RegExp(`^${prefix.replace('-', '\\-')}\\d{2,}$`);

            return pattern.test(invoiceNumber);
        } catch (error) {
            console.error('خطأ في التحقق من تنسيق رقم الفاتورة:', error);
            return false;
        }
    }

    // إنشاء رقم فاتورة من الرقم المدخل
    createInvoiceNumberFromInput(numberInput, type) {
        try {
            const prefix = type === 'sale' ? 'ABUSLEAN-SALE-' : 'ABUSLEAN-PUR-';
            const paddedNumber = String(numberInput).padStart(2, '0');

            return prefix + paddedNumber;
        } catch (error) {
            console.error('خطأ في إنشاء رقم الفاتورة:', error);
            return null;
        }
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
                warehouses: this.getTable('warehouses'),
                inventory_movements: this.getTable('inventory_movements'),
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

            // منتجات منخفضة المخزون
            const lowStockProducts = [];
            const lowStockDetails = [];
            const processedProducts = new Set(); // لتجنب التكرار

            products.forEach(product => {
                const threshold = product.minStock || lowStockThreshold;
                let hasLowStock = false;

                // تحديث الكمية الإجمالية بناءً على توزيع المخازن
                if (product.warehouseDistribution && warehouses.length > 0) {
                    // حساب الكمية الإجمالية من توزيع المخازن
                    const calculatedTotal = Object.values(product.warehouseDistribution).reduce((sum, qty) => sum + (qty || 0), 0);
                    product.quantity = calculatedTotal;

                    // فحص كل مخزن نشط للمنتج
                    warehouses.forEach(warehouse => {
                        const warehouseQty = product.warehouseDistribution[warehouse.id] || 0;

                        // فحص إذا كان المنتج منخفض المخزون في هذا المخزن
                        if (warehouseQty <= threshold) {
                            hasLowStock = true;

                            lowStockDetails.push({
                                productId: product.id,
                                productName: product.name,
                                warehouseId: warehouse.id,
                                warehouseName: warehouse.name,
                                quantity: warehouseQty,
                                threshold: threshold,
                                status: warehouseQty === 0 ? 'out-of-stock' : 'low-stock'
                            });
                        }
                    });
                } else {
                    // إذا لم تكن هناك توزيعات مخازن، فحص الكمية الإجمالية
                    const totalQuantity = product.quantity || 0;

                    if (totalQuantity <= threshold) {
                        hasLowStock = true;

                        lowStockDetails.push({
                            productId: product.id,
                            productName: product.name,
                            warehouseId: 'main',
                            warehouseName: 'المخزن الرئيسي',
                            quantity: totalQuantity,
                            threshold: threshold,
                            status: totalQuantity === 0 ? 'out-of-stock' : 'low-stock'
                        });
                    }
                }

                // إضافة المنتج لقائمة المنتجات منخفضة المخزون (مرة واحدة فقط)
                if (hasLowStock && !processedProducts.has(product.id)) {
                    processedProducts.add(product.id);

                    // حساب الكمية الإجمالية
                    let totalQuantity = 0;
                    if (product.warehouseDistribution && warehouses.length > 0) {
                        totalQuantity = Object.values(product.warehouseDistribution).reduce((sum, qty) => sum + (qty || 0), 0);
                    } else {
                        totalQuantity = product.quantity || 0;
                    }

                    lowStockProducts.push({
                        id: product.id,
                        name: product.name,
                        totalQuantity: totalQuantity,
                        threshold: threshold,
                        status: totalQuantity === 0 ? 'out-of-stock' : 'low-stock'
                    });
                }
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

// تصدير فئة Database للنطاق العام
window.Database = Database;

// إنشاء مثيل من قاعدة البيانات داخل نطاق الحماية
if (typeof window !== 'undefined' && !window.db) {
    window.db = new Database();
}

} // نهاية حماية إعادة التعريف
else {
    // إنشاء مثيل إذا لم يكن موجوداً
    if (typeof window !== 'undefined' && !window.db) {
        window.db = new Database();
    }
}

/**
 * البيانات التجريبية لنظام أبوسليمان للمحاسبة
 * تحتوي على موردين وعملاء ومنتجات ومعاملات تجريبية
 */

// إضافة البيانات التجريبية
function loadSampleData() {
    // التحقق من وجود بيانات مسبقة
    const existingProducts = db.getTable('products');
    if (existingProducts.length > 1) {
        console.log('البيانات التجريبية موجودة مسبقاً');
        return;
    }
    
    console.log('جاري تحميل البيانات التجريبية...');
    
    // إضافة الموردين
    addSampleSuppliers();
    
    // إضافة العملاء
    addSampleCustomers();
    
    // إضافة المنتجات
    addSampleProducts();
    
    // إضافة المعاملات
    setTimeout(() => {
        addSampleTransactions();
    }, 1000);
    
    console.log('تم تحميل البيانات التجريبية بنجاح');
}

// إضافة موردين تجريبيين
function addSampleSuppliers() {
    const suppliers = [
        {
            name: 'شركة الخليج للإلكترونيات',
            phone: '+965 2245 8888',
            email: 'info@gulf-electronics.com.kw',
            address: 'الكويت - الشرق - شارع فهد السالم',
            notes: 'مورد رئيسي للأجهزة الإلكترونية',
            balance: 2500.750
        },
        {
            name: 'مؤسسة النور للملابس',
            phone: '+965 2398 7777',
            email: 'sales@alnoor-fashion.com',
            address: 'الكويت - حولي - مجمع الأفنيوز',
            notes: 'متخصص في الملابس والأزياء',
            balance: 1800.500
        },
        {
            name: 'شركة الكويت للمواد الغذائية',
            phone: '+965 2456 9999',
            email: 'orders@kuwait-foods.com.kw',
            address: 'الكويت - الفروانية - المنطقة الصناعية',
            notes: 'مورد المواد الغذائية والمشروبات',
            balance: 3200.250
        },
        {
            name: 'مكتبة الرشيد للكتب والقرطاسية',
            phone: '+965 2287 6666',
            email: 'info@rasheed-books.com',
            address: 'الكويت - السالمية - شارع سالم المبارك',
            notes: 'مورد الكتب والقرطاسية',
            balance: 950.000
        },
        {
            name: 'شركة البيت الكويتي للأدوات المنزلية',
            phone: '+965 2334 5555',
            email: 'sales@kuwait-home.com.kw',
            address: 'الكويت - الجهراء - المنطقة التجارية',
            notes: 'متخصص في الأدوات المنزلية',
            balance: 1650.750
        },
        {
            name: 'مؤسسة الصقر للتجارة العامة',
            phone: '+965 2198 4444',
            email: 'info@alsaqer-trading.com',
            address: 'الكويت - مبارك الكبير - شارع الفحيحيل',
            notes: 'تجارة عامة ومتنوعة',
            balance: 2100.500
        },
        {
            name: 'شركة الخليج للأجهزة المكتبية',
            phone: '+965 2267 3333',
            email: 'orders@gulf-office.com.kw',
            address: 'الكويت - العاصمة - شارع الملك فيصل',
            notes: 'أجهزة ومعدات مكتبية',
            balance: 1200.250
        },
        {
            name: 'مؤسسة الفجر للمستلزمات الطبية',
            phone: '+965 2445 2222',
            email: 'medical@alfajr.com.kw',
            address: 'الكويت - حولي - منطقة السلام',
            notes: 'مستلزمات طبية وصحية',
            balance: 2800.000
        },
        {
            name: 'شركة النجمة للعطور والتجميل',
            phone: '+965 2356 1111',
            email: 'beauty@najma.com.kw',
            address: 'الكويت - السالمية - مجمع مارينا',
            notes: 'عطور ومستحضرات تجميل',
            balance: 1450.750
        },
        {
            name: 'مؤسسة الكويت للرياضة واللياقة',
            phone: '+965 2289 8888',
            email: 'sports@kuwait-fitness.com',
            address: 'الكويت - الفروانية - مدينة صباح السالم',
            notes: 'معدات رياضية ولياقة بدنية',
            balance: 1750.500
        }
    ];
    
    suppliers.forEach(supplier => {
        db.insert('suppliers', supplier);
    });
}

// إضافة عملاء تجريبيين
function addSampleCustomers() {
    const customers = [
        {
            name: 'أحمد محمد الصباح',
            phone: '+965 9988 7766',
            email: 'ahmed.alsabah@gmail.com',
            address: 'الكويت - السالمية - قطعة 4 - شارع سالم المبارك',
            balance: -150.500
        },
        {
            name: 'فاطمة علي المطيري',
            phone: '+965 9876 5432',
            email: 'fatima.almutairi@hotmail.com',
            address: 'الكويت - حولي - منطقة الشعب',
            balance: 200.750
        },
        {
            name: 'خالد سعد العتيبي',
            phone: '+965 9654 3210',
            email: 'khalid.alotaibi@yahoo.com',
            address: 'الكويت - الفروانية - جليب الشيوخ',
            balance: -75.250
        },
        {
            name: 'نورا عبدالله الرشيد',
            phone: '+965 9543 2109',
            email: 'nora.alrasheed@gmail.com',
            address: 'الكويت - مبارك الكبير - صباح السالم',
            balance: 0.000
        },
        {
            name: 'محمد عبدالعزيز الخالد',
            phone: '+965 9432 1098',
            email: 'mohammed.alkhalid@outlook.com',
            address: 'الكويت - الجهراء - القصر',
            balance: -320.750
        },
        {
            name: 'سارة أحمد البوعينين',
            phone: '+965 9321 0987',
            email: 'sara.albuainain@gmail.com',
            address: 'الكويت - العاصمة - دسمان',
            balance: 125.500
        },
        {
            name: 'عبدالرحمن يوسف العنزي',
            phone: '+965 9210 9876',
            email: 'abdulrahman.alanzi@hotmail.com',
            address: 'الكويت - حولي - السلام',
            balance: -95.000
        },
        {
            name: 'مريم سالم الهاجري',
            phone: '+965 9109 8765',
            email: 'mariam.alhajri@yahoo.com',
            address: 'الكويت - السالمية - الرميثية',
            balance: 50.250
        },
        {
            name: 'يوسف محمد الدوسري',
            phone: '+965 9098 7654',
            email: 'yousef.aldosari@gmail.com',
            address: 'الكويت - الفروانية - الرقة',
            balance: -180.750
        },
        {
            name: 'هند عبدالله الشمري',
            phone: '+965 8987 6543',
            email: 'hind.alshamari@outlook.com',
            address: 'الكويت - مبارك الكبير - الفنطاس',
            balance: 300.000
        }
    ];
    
    customers.forEach(customer => {
        db.insert('customers', customer);
    });
}

// إضافة منتجات تجريبية
function addSampleProducts() {
    const products = [
        // إلكترونيات
        { name: 'آيفون 15 برو', category: 'electronics', price: 350.500, quantity: 25, minQuantity: 5, barcode: '1001', description: 'هاتف ذكي من آبل' },
        { name: 'سامسونج جالاكسي S24', category: 'electronics', price: 280.750, quantity: 30, minQuantity: 5, barcode: '1002', description: 'هاتف ذكي من سامسونج' },
        { name: 'لابتوب ديل XPS 13', category: 'electronics', price: 450.000, quantity: 15, minQuantity: 3, barcode: '1003', description: 'لابتوب محمول عالي الأداء' },
        { name: 'سماعات أبل AirPods Pro', category: 'electronics', price: 85.250, quantity: 40, minQuantity: 10, barcode: '1004', description: 'سماعات لاسلكية' },
        { name: 'تلفزيون سامسونج 55 بوصة', category: 'electronics', price: 220.500, quantity: 12, minQuantity: 2, barcode: '1005', description: 'تلفزيون ذكي 4K' },
        
        // ملابس
        { name: 'قميص رجالي قطني', category: 'clothing', price: 15.750, quantity: 50, minQuantity: 10, barcode: '2001', description: 'قميص قطني عالي الجودة' },
        { name: 'فستان نسائي صيفي', category: 'clothing', price: 25.500, quantity: 35, minQuantity: 8, barcode: '2002', description: 'فستان صيفي أنيق' },
        { name: 'بنطلون جينز رجالي', category: 'clothing', price: 22.250, quantity: 40, minQuantity: 10, barcode: '2003', description: 'بنطلون جينز كلاسيكي' },
        { name: 'حذاء رياضي نايكي', category: 'clothing', price: 45.000, quantity: 28, minQuantity: 6, barcode: '2004', description: 'حذاء رياضي للجري' },
        { name: 'حقيبة يد نسائية', category: 'clothing', price: 35.750, quantity: 20, minQuantity: 5, barcode: '2005', description: 'حقيبة يد جلدية أنيقة' },
        
        // مواد غذائية
        { name: 'أرز بسمتي 5 كيلو', category: 'food', price: 4.500, quantity: 100, minQuantity: 20, barcode: '3001', description: 'أرز بسمتي عالي الجودة' },
        { name: 'زيت زيتون إيطالي', category: 'food', price: 8.250, quantity: 60, minQuantity: 15, barcode: '3002', description: 'زيت زيتون بكر ممتاز' },
        { name: 'عسل طبيعي 1 كيلو', category: 'food', price: 12.750, quantity: 45, minQuantity: 10, barcode: '3003', description: 'عسل طبيعي صافي' },
        { name: 'شاي أحمد 500 جرام', category: 'food', price: 3.500, quantity: 80, minQuantity: 20, barcode: '3004', description: 'شاي أسود فاخر' },
        { name: 'قهوة عربية محمصة', category: 'food', price: 6.750, quantity: 55, minQuantity: 12, barcode: '3005', description: 'قهوة عربية أصيلة' },
        
        // أدوات منزلية
        { name: 'مكنسة كهربائية', category: 'home', price: 65.500, quantity: 18, minQuantity: 4, barcode: '4001', description: 'مكنسة كهربائية قوية' },
        { name: 'خلاط كهربائي', category: 'home', price: 35.250, quantity: 25, minQuantity: 6, barcode: '4002', description: 'خلاط متعدد الاستخدامات' },
        { name: 'طقم أواني طبخ', category: 'home', price: 55.000, quantity: 20, minQuantity: 5, barcode: '4003', description: 'طقم أواني ستانلس ستيل' },
        { name: 'مكواة بخار', category: 'home', price: 28.750, quantity: 30, minQuantity: 8, barcode: '4004', description: 'مكواة بخار احترافية' },
        { name: 'مروحة سقف', category: 'home', price: 42.500, quantity: 15, minQuantity: 3, barcode: '4005', description: 'مروحة سقف بجهاز تحكم' },
        
        // كتب ومكتبة
        { name: 'كتاب تعلم البرمجة', category: 'books', price: 12.250, quantity: 40, minQuantity: 10, barcode: '5001', description: 'دليل شامل لتعلم البرمجة' },
        { name: 'رواية مئة عام من العزلة', category: 'books', price: 8.500, quantity: 35, minQuantity: 8, barcode: '5002', description: 'رواية كلاسيكية مترجمة' },
        { name: 'دفتر ملاحظات جلدي', category: 'books', price: 5.750, quantity: 60, minQuantity: 15, barcode: '5003', description: 'دفتر ملاحظات فاخر' },
        { name: 'طقم أقلام حبر', category: 'books', price: 15.000, quantity: 45, minQuantity: 12, barcode: '5004', description: 'طقم أقلام حبر راقية' },
        { name: 'آلة حاسبة علمية', category: 'books', price: 18.250, quantity: 25, minQuantity: 6, barcode: '5005', description: 'آلة حاسبة للطلاب' },
        
        // منتجات إضافية
        { name: 'ساعة ذكية', category: 'electronics', price: 120.500, quantity: 22, minQuantity: 5, barcode: '1006', description: 'ساعة ذكية متطورة' },
        { name: 'كاميرا رقمية', category: 'electronics', price: 180.750, quantity: 10, minQuantity: 2, barcode: '1007', description: 'كاميرا رقمية احترافية' },
        { name: 'جاكيت شتوي', category: 'clothing', price: 38.500, quantity: 32, minQuantity: 8, barcode: '2006', description: 'جاكيت شتوي دافئ' },
        { name: 'مكمل غذائي فيتامين د', category: 'food', price: 9.750, quantity: 70, minQuantity: 15, barcode: '3006', description: 'مكمل فيتامين د طبيعي' },
        { name: 'مصباح LED ذكي', category: 'home', price: 25.250, quantity: 35, minQuantity: 8, barcode: '4006', description: 'مصباح LED قابل للتحكم' }
    ];
    
    products.forEach(product => {
        // توزيع المنتجات على المخازن
        const warehouseDistribution = distributeProductToWarehouses(product.quantity);
        product.warehouses = warehouseDistribution;
        db.insert('products', product);
    });
}

// توزيع المنتج على المخازن
function distributeProductToWarehouses(totalQuantity) {
    const warehouses = ['main', 'branch1', 'branch2'];
    const distribution = {};

    // توزيع عشوائي مع ضمان وجود كمية في المخزن الرئيسي
    const mainQuantity = Math.ceil(totalQuantity * 0.5); // 50% في المخزن الرئيسي
    const remainingQuantity = totalQuantity - mainQuantity;

    distribution['main'] = mainQuantity;
    distribution['branch1'] = Math.floor(remainingQuantity * 0.6);
    distribution['branch2'] = remainingQuantity - distribution['branch1'];

    return distribution;
}

// إضافة المعاملات التجريبية
function addSampleTransactions() {
    console.log('جاري إنشاء المعاملات التجريبية...');

    // إنشاء فواتير مشتريات
    createSamplePurchases();

    // إنشاء فواتير مبيعات
    createSampleSales();

    // إنشاء مدفوعات
    createSamplePayments();

    console.log('تم إنشاء المعاملات التجريبية بنجاح');
}

// إنشاء فواتير مشتريات تجريبية
function createSamplePurchases() {
    const suppliers = db.getTable('suppliers');
    const products = db.getTable('products');

    // إنشاء 8 فواتير مشتريات
    for (let i = 0; i < 8; i++) {
        const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
        const purchaseDate = getRandomDate(30); // خلال آخر 30 يوم

        // اختيار منتجات عشوائية (2-5 منتجات لكل فاتورة)
        const numItems = Math.floor(Math.random() * 4) + 2;
        const selectedProducts = [];

        for (let j = 0; j < numItems; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            if (!selectedProducts.find(p => p.productId === product.id)) {
                selectedProducts.push({
                    productId: product.id,
                    name: product.name,
                    quantity: Math.floor(Math.random() * 20) + 5,
                    price: product.price * (0.7 + Math.random() * 0.2), // سعر الشراء أقل من البيع
                    total: 0
                });
            }
        }

        // حساب المجاميع
        selectedProducts.forEach(item => {
            item.total = item.quantity * item.price;
        });

        const subtotal = selectedProducts.reduce((sum, item) => sum + item.total, 0);
        const taxAmount = 0; // لا توجد ضريبة في الكويت
        const total = subtotal + taxAmount;

        const purchase = {
            supplierId: supplier.id,
            supplierName: supplier.name,
            invoiceNumber: `INV-${1000 + i}`,
            purchaseDate: purchaseDate.toISOString().split('T')[0],
            items: selectedProducts,
            subtotal: subtotal,
            taxRate: 0,
            taxAmount: taxAmount,
            total: total,
            paymentMethod: Math.random() > 0.5 ? 'credit' : 'cash',
            notes: `فاتورة شراء تجريبية رقم ${i + 1}`,
            status: 'completed',
            createdAt: purchaseDate.toISOString()
        };

        db.insert('purchases', purchase);

        // تحديث المخزون
        selectedProducts.forEach(item => {
            const product = db.findById('products', item.productId);
            if (product) {
                db.update('products', item.productId, {
                    quantity: product.quantity + item.quantity
                });
            }
        });
    }
}

// إنشاء فواتير مبيعات تجريبية
function createSampleSales() {
    const customers = db.getTable('customers').filter(c => c.id !== 'guest');
    const products = db.getTable('products');

    // إنشاء 20 فاتورة مبيعات
    for (let i = 0; i < 20; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const saleDate = getRandomDate(45); // خلال آخر 45 يوم

        // اختيار منتجات عشوائية (1-4 منتجات لكل فاتورة)
        const numItems = Math.floor(Math.random() * 4) + 1;
        const selectedProducts = [];

        for (let j = 0; j < numItems; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            if (!selectedProducts.find(p => p.productId === product.id) && product.quantity > 0) {
                const quantity = Math.min(Math.floor(Math.random() * 5) + 1, product.quantity);
                selectedProducts.push({
                    productId: product.id,
                    name: product.name,
                    quantity: quantity,
                    price: product.price,
                    total: quantity * product.price
                });
            }
        }

        if (selectedProducts.length === 0) continue;

        const subtotal = selectedProducts.reduce((sum, item) => sum + item.total, 0);
        const taxAmount = 0; // لا توجد ضريبة في الكويت
        const total = subtotal + taxAmount;

        const sale = {
            customerId: customer.id,
            customerName: customer.name,
            items: selectedProducts,
            subtotal: subtotal,
            taxRate: 0,
            taxAmount: taxAmount,
            total: total,
            paymentMethod: Math.random() > 0.3 ? 'cash' : 'credit',
            paidAmount: total,
            change: 0,
            status: 'completed',
            createdAt: saleDate.toISOString()
        };

        db.insert('sales', sale);

        // تحديث المخزون
        selectedProducts.forEach(item => {
            const product = db.findById('products', item.productId);
            if (product) {
                db.update('products', item.productId, {
                    quantity: product.quantity - item.quantity
                });
            }
        });

        // تحديث رصيد العميل إذا كان الدفع على الحساب
        if (sale.paymentMethod === 'credit') {
            const currentCustomer = db.findById('customers', customer.id);
            if (currentCustomer) {
                db.update('customers', customer.id, {
                    balance: currentCustomer.balance - total
                });
            }
        }
    }
}

// إنشاء مدفوعات تجريبية
function createSamplePayments() {
    const customers = db.getTable('customers').filter(c => c.id !== 'guest');
    const suppliers = db.getTable('suppliers');

    // إنشاء مدفوعات عملاء
    for (let i = 0; i < 8; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const paymentDate = getRandomDate(20);
        const amount = (Math.random() * 200 + 50).toFixed(3);

        const payment = {
            customerId: customer.id,
            customerName: customer.name,
            amount: parseFloat(amount),
            method: ['cash', 'bank', 'check'][Math.floor(Math.random() * 3)],
            notes: `دفعة تجريبية من العميل`,
            type: 'payment',
            createdAt: paymentDate.toISOString()
        };

        db.insert('payments', payment);
    }

    // إنشاء مدفوعات موردين
    for (let i = 0; i < 6; i++) {
        const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
        const paymentDate = getRandomDate(15);
        const amount = (Math.random() * 500 + 100).toFixed(3);

        const payment = {
            supplierId: supplier.id,
            supplierName: supplier.name,
            amount: parseFloat(amount),
            method: ['cash', 'bank', 'check'][Math.floor(Math.random() * 3)],
            notes: `دفعة تجريبية للمورد`,
            type: 'payment',
            category: 'supplier_payment',
            createdAt: paymentDate.toISOString()
        };

        db.insert('payments', payment);
    }
}

// الحصول على تاريخ عشوائي خلال عدد معين من الأيام الماضية
function getRandomDate(daysBack) {
    const today = new Date();
    const randomDays = Math.floor(Math.random() * daysBack);
    const randomDate = new Date(today);
    randomDate.setDate(today.getDate() - randomDays);

    // إضافة وقت عشوائي
    randomDate.setHours(Math.floor(Math.random() * 24));
    randomDate.setMinutes(Math.floor(Math.random() * 60));

    return randomDate;
}

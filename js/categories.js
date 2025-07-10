/**
 * وحدة إدارة الفئات المركزية
 * أبوسليمان للمحاسبة - نظام إدارة نقاط البيع
 */

// دالة مركزية لتحميل الفئات
function loadCategories() {
    try {
        if (!window.db) {
            console.warn('قاعدة البيانات غير متاحة');
            return [];
        }
        
        const categories = db.getTable('categories');
        return categories || [];
    } catch (error) {
        console.error('خطأ في تحميل الفئات:', error);
        return [];
    }
}

// دالة لتحميل الفئات في قائمة منسدلة
function populateCategorySelect(selectElement, includeAll = true, selectedValue = '') {
    try {
        if (!selectElement) {
            console.error('عنصر القائمة المنسدلة غير موجود');
            return;
        }

        const categories = loadCategories();
        
        // مسح المحتوى الحالي
        selectElement.innerHTML = '';
        
        // إضافة خيار "جميع الفئات" إذا كان مطلوباً
        if (includeAll) {
            const allOption = document.createElement('option');
            allOption.value = '';
            allOption.textContent = 'جميع الفئات';
            selectElement.appendChild(allOption);
        }
        
        // إضافة الفئات مع الترقيم
        categories.forEach((category, index) => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `${index + 1}. ${category.name}`;
            option.title = category.description; // إضافة الوصف كـ tooltip
            selectElement.appendChild(option);
        });
        
        // تعيين القيمة المحددة
        if (selectedValue) {
            selectElement.value = selectedValue;
        }
        
        console.log(`تم تحميل ${categories.length} فئة في القائمة المنسدلة`);
        
    } catch (error) {
        console.error('خطأ في تحميل الفئات في القائمة المنسدلة:', error);
    }
}

// دالة للحصول على فئة بواسطة المعرف
function getCategoryById(categoryId) {
    try {
        const categories = loadCategories();
        return categories.find(category => category.id === categoryId) || null;
    } catch (error) {
        console.error('خطأ في البحث عن الفئة:', error);
        return null;
    }
}

// دالة للحصول على اسم الفئة بواسطة المعرف
function getCategoryName(categoryId) {
    try {
        const category = getCategoryById(categoryId);
        return category ? category.name : 'غير محدد';
    } catch (error) {
        console.error('خطأ في الحصول على اسم الفئة:', error);
        return 'غير محدد';
    }
}

// دالة لتحديث جميع قوائم الفئات في الصفحة
function updateAllCategorySelects() {
    try {
        // قائمة جميع معرفات القوائم المنسدلة للفئات في النظام
        const categorySelectIds = [
            'productCategory',           // نموذج إضافة منتج
            'editProductCategory',       // نموذج تعديل منتج
            'categoryFilter',            // فلتر المنتجات في نقطة البيع
            'salesProductFilter',        // فلتر المنتجات في تقارير المبيعات
            'customersProductFilter',    // فلتر المنتجات في تقارير العملاء
            'suppliersProductFilter',    // فلتر المنتجات في تقارير الموردين
            'inventoryProductFilter',    // فلتر المنتجات في تقارير المخزون
            'productCategoryFilter'      // فلتر الفئات في إدارة المنتجات
        ];
        
        categorySelectIds.forEach(selectId => {
            const selectElement = document.getElementById(selectId);
            if (selectElement) {
                const currentValue = selectElement.value;
                const includeAll = selectId.includes('Filter') || selectId.includes('filter');
                populateCategorySelect(selectElement, includeAll, currentValue);
            }
        });
        
        console.log('تم تحديث جميع قوائم الفئات في النظام');
        
    } catch (error) {
        console.error('خطأ في تحديث قوائم الفئات:', error);
    }
}

// دالة لإضافة فئة جديدة
function addCategory(categoryData) {
    try {
        if (!window.db) {
            throw new Error('قاعدة البيانات غير متاحة');
        }
        
        // التحقق من صحة البيانات
        if (!categoryData.name || !categoryData.name.trim()) {
            throw new Error('اسم الفئة مطلوب');
        }
        
        // إنشاء معرف فريد إذا لم يكن موجوداً
        if (!categoryData.id) {
            categoryData.id = 'cat_' + Date.now();
        }
        
        // إضافة الفئة إلى قاعدة البيانات
        const result = db.addRecord('categories', categoryData);
        
        if (result) {
            // تحديث جميع قوائم الفئات
            updateAllCategorySelects();
            console.log('تم إضافة الفئة بنجاح:', categoryData.name);
            return result;
        } else {
            throw new Error('فشل في إضافة الفئة');
        }
        
    } catch (error) {
        console.error('خطأ في إضافة الفئة:', error);
        throw error;
    }
}

// دالة لتحديث فئة موجودة
function updateCategory(categoryData) {
    try {
        if (!window.db) {
            throw new Error('قاعدة البيانات غير متاحة');
        }
        
        if (!categoryData.id) {
            throw new Error('معرف الفئة مطلوب للتحديث');
        }
        
        // تحديث الفئة في قاعدة البيانات
        const result = db.updateRecord('categories', categoryData);
        
        if (result) {
            // تحديث جميع قوائم الفئات
            updateAllCategorySelects();
            console.log('تم تحديث الفئة بنجاح:', categoryData.name);
            return result;
        } else {
            throw new Error('فشل في تحديث الفئة');
        }
        
    } catch (error) {
        console.error('خطأ في تحديث الفئة:', error);
        throw error;
    }
}

// دالة لحذف فئة
function deleteCategory(categoryId) {
    try {
        if (!window.db) {
            throw new Error('قاعدة البيانات غير متاحة');
        }
        
        // التحقق من عدم استخدام الفئة في منتجات موجودة
        const products = db.getTable('products');
        const usedInProducts = products.some(product => product.categoryId === categoryId);
        
        if (usedInProducts) {
            throw new Error('لا يمكن حذف الفئة لأنها مستخدمة في منتجات موجودة');
        }
        
        // حذف الفئة من قاعدة البيانات
        const categories = db.getTable('categories');
        const updatedCategories = categories.filter(category => category.id !== categoryId);
        
        if (db.setTable('categories', updatedCategories)) {
            // تحديث جميع قوائم الفئات
            updateAllCategorySelects();
            console.log('تم حذف الفئة بنجاح');
            return true;
        } else {
            throw new Error('فشل في حذف الفئة');
        }
        
    } catch (error) {
        console.error('خطأ في حذف الفئة:', error);
        throw error;
    }
}

// تهيئة وحدة الفئات عند تحميل الصفحة
function initializeCategories() {
    try {
        // تحديث جميع قوائم الفئات عند التهيئة
        updateAllCategorySelects();
        
        // إضافة مستمع للأحداث لتحديث القوائم عند تغيير البيانات
        if (window.addEventListener) {
            window.addEventListener('categoriesUpdated', updateAllCategorySelects);
        }

        // تحديث إعدادات الفئات إذا كانت الصفحة مفتوحة
        if (typeof loadCategoriesInSettings === 'function') {
            setTimeout(() => {
                const settingsSection = document.getElementById('settings');
                if (settingsSection && !settingsSection.classList.contains('hidden')) {
                    loadCategoriesInSettings();
                }
            }, 100);
        }
        
        console.log('تم تهيئة وحدة الفئات بنجاح');
        
    } catch (error) {
        console.error('خطأ في تهيئة وحدة الفئات:', error);
    }
}

// اختبار تكامل الفئات
function testCategoryIntegration() {
    try {
        console.log('🧪 بدء اختبار تكامل الفئات...');

        // اختبار تحميل الفئات
        const categories = loadCategories();
        console.log(`✅ تم تحميل ${categories.length} فئة`);

        // اختبار قوائم الفئات المختلفة
        const testSelects = [
            'categoryFilter',
            'salesProductFilter',
            'customersProductFilter',
            'suppliersProductFilter'
        ];

        let successCount = 0;
        testSelects.forEach(selectId => {
            const element = document.getElementById(selectId);
            if (element) {
                populateCategorySelect(element, true);
                if (element.options.length > 1) { // أكثر من خيار "جميع الفئات"
                    successCount++;
                    console.log(`✅ ${selectId}: ${element.options.length - 1} فئة`);
                } else {
                    console.log(`⚠️ ${selectId}: لم يتم تحميل الفئات`);
                }
            } else {
                console.log(`❌ ${selectId}: العنصر غير موجود`);
            }
        });

        // اختبار الحصول على فئة بالمعرف
        if (categories.length > 0) {
            const testCategory = getCategoryById(categories[0].id);
            if (testCategory) {
                console.log(`✅ اختبار getCategoryById: ${testCategory.name}`);
            } else {
                console.log('❌ فشل اختبار getCategoryById');
            }
        }

        // النتيجة النهائية
        const totalTests = testSelects.length + 2; // قوائم + تحميل + getCategoryById
        const passedTests = successCount + (categories.length > 0 ? 2 : 1);

        console.log(`🎯 نتيجة الاختبار: ${passedTests}/${totalTests} اختبار نجح`);

        if (passedTests === totalTests) {
            console.log('🎉 جميع اختبارات تكامل الفئات نجحت!');
            showNotification('تم تحميل الفئات بنجاح في جميع أجزاء النظام', 'success');
        } else {
            console.log('⚠️ بعض اختبارات تكامل الفئات فشلت');
            showNotification('تحذير: بعض فلاتر الفئات قد لا تعمل بشكل صحيح', 'warning');
        }

        return passedTests === totalTests;

    } catch (error) {
        console.error('❌ خطأ في اختبار تكامل الفئات:', error);
        showNotification('خطأ في اختبار تكامل الفئات', 'error');
        return false;
    }
}

// دالة لإعادة تحميل جميع الفئات (للاستخدام عند إضافة فئة جديدة)
function refreshAllCategories() {
    try {
        updateAllCategorySelects();

        // إرسال حدث تحديث الفئات
        if (window.dispatchEvent) {
            const event = new CustomEvent('categoriesUpdated', {
                detail: { categories: loadCategories() }
            });
            window.dispatchEvent(event);
        }

        console.log('تم تحديث جميع فلاتر الفئات');

    } catch (error) {
        console.error('خطأ في إعادة تحميل الفئات:', error);
    }
}

// تصدير الوظائف للاستخدام العام
window.loadCategories = loadCategories;
window.populateCategorySelect = populateCategorySelect;
window.getCategoryById = getCategoryById;
window.getCategoryName = getCategoryName;
window.updateAllCategorySelects = updateAllCategorySelects;
window.addCategory = addCategory;
window.updateCategory = updateCategory;
window.deleteCategory = deleteCategory;
window.initializeCategories = initializeCategories;
window.testCategoryIntegration = testCategoryIntegration;
window.refreshAllCategories = refreshAllCategories;

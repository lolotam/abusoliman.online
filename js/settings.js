/**
 * وحدة الإعدادات والنسخ الاحتياطي
 * أبوسليمان للمحاسبة - نظام إدارة نقاط البيع
 */

// تحميل قسم الإعدادات
function loadSettingsSection() {
    const section = document.getElementById('settings');
    if (!section) return;
    
    const settings = db.getTable('settings');
    
    section.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-cog"></i> الإعدادات</h2>
        </div>
        
        <!-- Settings Dashboard Layout -->
        <div class="settings-dashboard">
            <!-- Top Navigation Tabs -->
            <div class="settings-nav">
                <button class="settings-nav-btn active" onclick="switchSettingsTab('main')" data-tab="main">
                    <i class="fas fa-cog"></i>
                    <span>الإعدادات الأساسية</span>
                </button>
                <button class="settings-nav-btn" onclick="switchSettingsTab('security')" data-tab="security">
                    <i class="fas fa-shield-alt"></i>
                    <span>الأمان</span>
                </button>
                <button class="settings-nav-btn" onclick="switchSettingsTab('data')" data-tab="data">
                    <i class="fas fa-database"></i>
                    <span>إدارة البيانات</span>
                </button>
                <button class="settings-nav-btn" onclick="switchSettingsTab('categories')" data-tab="categories">
                    <i class="fas fa-tags"></i>
                    <span>الفئات</span>
                </button>
            </div>

            <!-- Main Settings Tab -->
            <div class="settings-tab-content active" id="mainSettings">
                <div class="settings-horizontal-layout">
                    <!-- Company Info Panel -->
                    <div class="settings-panel">
                        <div class="panel-header">
                            <div class="panel-icon">
                                <i class="fas fa-building"></i>
                            </div>
                            <div class="panel-title">
                                <h3>معلومات الشركة</h3>
                                <p>بيانات الشركة الأساسية</p>
                            </div>
                        </div>
                        <div class="panel-content">
                            <div class="form-row">
                                <div class="form-field">
                                    <label>اسم الشركة</label>
                                    <input type="text" id="companyName" value="${settings.companyName || ''}" onchange="updateCompanySetting('companyName', this.value)">
                                </div>
                                <div class="form-field">
                                    <label>هاتف الشركة</label>
                                    <input type="tel" id="companyPhone" value="${settings.companyPhone || ''}" onchange="updateCompanySetting('companyPhone', this.value)">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-field">
                                    <label>عنوان الشركة</label>
                                    <input type="text" id="companyAddress" value="${settings.companyAddress || ''}" onchange="updateCompanySetting('companyAddress', this.value)">
                                </div>
                                <div class="form-field">
                                    <label>البريد الإلكتروني</label>
                                    <input type="email" id="companyEmail" value="${settings.companyEmail || ''}" onchange="updateCompanySetting('companyEmail', this.value)">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Invoice Settings Panel -->
                    <div class="settings-panel">
                        <div class="panel-header">
                            <div class="panel-icon">
                                <i class="fas fa-file-invoice"></i>
                            </div>
                            <div class="panel-title">
                                <h3>إعدادات الفواتير</h3>
                                <p>ترقيم وإعدادات الفواتير</p>
                            </div>
                        </div>
                        <div class="panel-content">
                            <div class="form-row">
                                <div class="form-field">
                                    <label>عداد فواتير المبيعات</label>
                                    <input type="number" id="saleInvoiceCounter" value="${settings.saleInvoiceCounter || 0}" min="0" onchange="updateInvoiceCounter('saleInvoiceCounter', this.value)">
                                    <small>التالية: ABUSLEAN-SALE-${String((settings.saleInvoiceCounter || 0) + 1).padStart(2, '0')}</small>
                                </div>
                                <div class="form-field">
                                    <label>عداد فواتير المشتريات</label>
                                    <input type="number" id="purchaseInvoiceCounter" value="${settings.purchaseInvoiceCounter || 0}" min="0" onchange="updateInvoiceCounter('purchaseInvoiceCounter', this.value)">
                                    <small>التالية: ABUSLEAN-PUR-${String((settings.purchaseInvoiceCounter || 0) + 1).padStart(2, '0')}</small>
                                </div>
                            </div>
                            <div class="panel-actions">
                                <button class="btn btn-warning" onclick="resetInvoiceNumbers()">
                                    <i class="fas fa-redo"></i>
                                    إعادة ترقيم الفواتير
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- System Settings Panel -->
                    <div class="settings-panel">
                        <div class="panel-header">
                            <div class="panel-icon">
                                <i class="fas fa-sliders-h"></i>
                            </div>
                            <div class="panel-title">
                                <h3>إعدادات النظام</h3>
                                <p>التفضيلات العامة</p>
                            </div>
                        </div>
                        <div class="panel-content">
                            <div class="form-row">
                                <div class="form-field">
                                    <label>العملة</label>
                                    <input type="text" id="systemCurrency" value="${settings.currency || 'د.ك'}" onchange="updateCompanySetting('currency', this.value)">
                                </div>
                                <div class="form-field">
                                    <label>معدل الضريبة (%)</label>
                                    <input type="number" id="systemTaxRate" value="${settings.taxRate || 0}" step="0.01" min="0" max="100" onchange="updateCompanySetting('taxRate', this.value)">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-field">
                                    <label>المظهر</label>
                                    <select id="systemTheme" onchange="changeTheme(this.value)">
                                        <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>مضيء</option>
                                        <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>داكن</option>
                                    </select>
                                </div>
                                <div class="form-field">
                                    <label>الفئة الافتراضية</label>
                                    <select id="defaultCategory" onchange="updateCompanySetting('defaultCategory', this.value)">
                                        <!-- سيتم تحميل الفئات هنا -->
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Security Tab -->
            <div class="settings-tab-content" id="securitySettings">
                <div class="settings-horizontal-layout">
                    <div class="settings-panel wide-panel">
                        <div class="panel-header">
                            <div class="panel-icon security-icon">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <div class="panel-title">
                                <h3>إعدادات الأمان</h3>
                                <p>تغيير كلمة مرور المدير</p>
                            </div>
                        </div>
                        <div class="panel-content">
                            <div class="security-form">
                                <div class="form-row">
                                    <div class="form-field">
                                        <label>كلمة المرور الحالية</label>
                                        <div class="password-input-wrapper">
                                            <input type="password" id="currentPassword" placeholder="أدخل كلمة المرور الحالية">
                                            <button type="button" class="password-toggle" onclick="togglePasswordVisibility('currentPassword')">
                                                <i class="fas fa-eye" id="currentPasswordToggle"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-field">
                                        <label>كلمة المرور الجديدة</label>
                                        <div class="password-input-wrapper">
                                            <input type="password" id="newPassword" placeholder="أدخل كلمة المرور الجديدة">
                                            <button type="button" class="password-toggle" onclick="togglePasswordVisibility('newPassword')">
                                                <i class="fas fa-eye" id="newPasswordToggle"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="form-field">
                                        <label>تأكيد كلمة المرور الجديدة</label>
                                        <div class="password-input-wrapper">
                                            <input type="password" id="confirmPassword" placeholder="أعد إدخال كلمة المرور الجديدة">
                                            <button type="button" class="password-toggle" onclick="togglePasswordVisibility('confirmPassword')">
                                                <i class="fas fa-eye" id="confirmPasswordToggle"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="panel-actions">
                                    <button class="btn btn-primary security-btn" onclick="changeAdminPassword()">
                                        <i class="fas fa-key"></i>
                                        تغيير كلمة المرور
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Data Management Tab -->
            <div class="settings-tab-content" id="dataSettings">
                <div class="settings-horizontal-layout">
                    <div class="settings-panel">
                        <div class="panel-header">
                            <div class="panel-icon export-icon">
                                <i class="fas fa-download"></i>
                            </div>
                            <div class="panel-title">
                                <h3>تصدير البيانات</h3>
                                <p>نسخ احتياطي للبيانات</p>
                            </div>
                        </div>
                        <div class="panel-content">
                            <p>تصدير جميع بيانات النظام إلى ملف JSON</p>
                            <div class="panel-actions">
                                <button class="btn btn-primary" onclick="exportAllData()">
                                    <i class="fas fa-download"></i>
                                    تصدير البيانات
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="settings-panel">
                        <div class="panel-header">
                            <div class="panel-icon import-icon">
                                <i class="fas fa-upload"></i>
                            </div>
                            <div class="panel-title">
                                <h3>استيراد البيانات</h3>
                                <p>استعادة من نسخة احتياطية</p>
                            </div>
                        </div>
                        <div class="panel-content">
                            <p>استيراد البيانات من ملف JSON</p>
                            <div class="file-upload-area">
                                <input type="file" id="importDataFile" accept=".json" class="file-input" onchange="importData(this)">
                                <label for="importDataFile" class="file-upload-label">
                                    <i class="fas fa-upload"></i>
                                    <span>اختر ملف JSON</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="settings-panel danger-panel">
                        <div class="panel-header">
                            <div class="panel-icon danger-icon">
                                <i class="fas fa-trash-alt"></i>
                            </div>
                            <div class="panel-title">
                                <h3>إعادة تعيين النظام</h3>
                                <p class="danger-text">حذف جميع البيانات نهائياً</p>
                            </div>
                        </div>
                        <div class="panel-content">
                            <p class="warning-text">تحذير: سيتم حذف جميع البيانات نهائياً ولا يمكن التراجع عن هذا الإجراء</p>
                            <div class="panel-actions">
                                <button class="btn btn-danger" onclick="resetSystem()">
                                    <i class="fas fa-trash-alt"></i>
                                    مسح جميع البيانات
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- System Information Panel -->
                <div class="system-info-panel">
                    <div class="panel-header">
                        <div class="panel-icon info-icon">
                            <i class="fas fa-info-circle"></i>
                        </div>
                        <div class="panel-title">
                            <h3>معلومات النظام</h3>
                            <p>إحصائيات وبيانات النظام</p>
                        </div>
                    </div>
                    <div class="system-stats">
                        <div class="stat-item">
                            <div class="stat-icon"><i class="fas fa-code-branch"></i></div>
                            <div class="stat-content">
                                <div class="stat-label">إصدار النظام</div>
                                <div class="stat-value">${settings.version || '1.0'}</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon"><i class="fas fa-clock"></i></div>
                            <div class="stat-content">
                                <div class="stat-label">آخر نسخة احتياطية</div>
                                <div class="stat-value">${getLastBackupDate()}</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon"><i class="fas fa-box"></i></div>
                            <div class="stat-content">
                                <div class="stat-label">عدد المنتجات</div>
                                <div class="stat-value">${db.getTable('products').length}</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon"><i class="fas fa-users"></i></div>
                            <div class="stat-content">
                                <div class="stat-label">عدد العملاء</div>
                                <div class="stat-value">${db.getTable('customers').length}</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon"><i class="fas fa-truck"></i></div>
                            <div class="stat-content">
                                <div class="stat-label">عدد الموردين</div>
                                <div class="stat-value">${db.getTable('suppliers').length}</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon"><i class="fas fa-receipt"></i></div>
                            <div class="stat-content">
                                <div class="stat-label">فواتير المبيعات</div>
                                <div class="stat-value">${db.getTable('sales').length}</div>
                            </div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon"><i class="fas fa-shopping-bag"></i></div>
                            <div class="stat-content">
                                <div class="stat-label">فواتير المشتريات</div>
                                <div class="stat-value">${db.getTable('purchases').length}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Categories Tab -->
            <div class="settings-tab-content" id="categoriesSettings">
                <div class="categories-dashboard">
                    <div class="categories-header">
                        <div class="categories-title">
                            <div class="panel-icon categories-icon">
                                <i class="fas fa-tags"></i>
                            </div>
                            <div>
                                <h3>إدارة فئات المنتجات</h3>
                                <p>إضافة وتعديل فئات المنتجات</p>
                            </div>
                        </div>
                        <div class="categories-actions">
                            <button class="btn btn-primary" onclick="showAddCategoryModal()">
                                <i class="fas fa-plus"></i>
                                إضافة فئة جديدة
                            </button>
                            <button class="btn btn-secondary" onclick="refreshCategoriesDisplay()">
                                <i class="fas fa-sync"></i>
                                تحديث القائمة
                            </button>
                        </div>
                    </div>
                    <div class="categories-content" id="categoriesListContainer">
                        <!-- سيتم تحميل الفئات هنا -->
                    </div>
                </div>
            </div>
        </div>
        </div>

        <!-- نافذة إضافة/تعديل الفئة -->
        <div id="categoryModal" class="modal hidden">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="categoryModalTitle">إضافة فئة جديدة</h3>
                    <button class="modal-close" onclick="closeCategoryModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="categoryForm" onsubmit="saveCategoryFromModal(event)">
                        <div class="form-group">
                            <label for="categoryId">معرف الفئة</label>
                            <input type="text" id="categoryId" required placeholder="مثال: electronics">
                            <small class="form-help">معرف فريد باللغة الإنجليزية (بدون مسافات)</small>
                        </div>

                        <div class="form-group">
                            <label for="categoryName">اسم الفئة</label>
                            <input type="text" id="categoryName" required placeholder="مثال: إلكترونيات">
                        </div>

                        <div class="form-group">
                            <label for="categoryDescription">وصف الفئة</label>
                            <textarea id="categoryDescription" rows="3" placeholder="وصف مفصل للفئة..."></textarea>
                        </div>

                        <div class="modal-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i>
                                حفظ
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="closeCategoryModal()">
                                <i class="fas fa-times"></i>
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // تحميل الفئات في القائمة والقائمة المنسدلة
    loadCategoriesInSettings();
}

// تحديث إعدادات الشركة
function updateCompanySetting(key, value) {
    try {
        let settings = db.getTable('settings');
        settings[key] = value;
        db.setTable('settings', settings);
        showNotification('تم حفظ الإعداد بنجاح', 'success');
    } catch (error) {
        console.error('خطأ في حفظ الإعداد:', error);
        showNotification('خطأ في حفظ الإعداد', 'error');
    }
}

// تحديث عدادات الفواتير
function updateInvoiceCounter(counterType, value) {
    try {
        let settings = db.getTable('settings');
        settings[counterType] = parseInt(value) || 0;
        db.setTable('settings', settings);
        
        // تحديث النص التوضيحي
        const nextNumber = settings[counterType] + 1;
        const prefix = counterType === 'saleInvoiceCounter' ? 'ABUSLEAN-SALE-' : 'ABUSLEAN-PUR-';
        const helpText = document.querySelector(`#${counterType} + .form-help`);
        if (helpText) {
            helpText.textContent = `الفاتورة التالية ستكون: ${prefix}${String(nextNumber).padStart(2, '0')}`;
        }
        
        showNotification('تم تحديث العداد بنجاح', 'success');
    } catch (error) {
        console.error('خطأ في تحديث العداد:', error);
        showNotification('خطأ في تحديث العداد', 'error');
    }
}

// إعادة ترقيم الفواتير
function resetInvoiceNumbers() {
    if (confirm('هل أنت متأكد من إعادة ترقيم جميع الفواتير؟\nسيتم تحديث أرقام جميع الفواتير الموجودة.')) {
        try {
            const result = db.updateExistingInvoiceNumbers();
            if (result) {
                showNotification(`تم إعادة ترقيم ${result.salesUpdated} فاتورة مبيعات و ${result.purchasesUpdated} فاتورة شراء`, 'success');
                loadSettingsSection(); // إعادة تحميل الصفحة لتحديث العدادات
            } else {
                showNotification('خطأ في إعادة ترقيم الفواتير', 'error');
            }
        } catch (error) {
            console.error('خطأ في إعادة ترقيم الفواتير:', error);
            showNotification('خطأ في إعادة ترقيم الفواتير', 'error');
        }
    }
}

// تصدير جميع البيانات
function exportAllData() {
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
        } else {
            showNotification('خطأ في تصدير البيانات', 'error');
        }
    } catch (error) {
        console.error('خطأ في تصدير البيانات:', error);
        showNotification('خطأ في تصدير البيانات', 'error');
    }
}

// الحصول على تاريخ آخر نسخة احتياطية
function getLastBackupDate() {
    try {
        const backupKeys = Object.keys(localStorage).filter(key => key.includes('_backup_'));
        if (backupKeys.length === 0) {
            return 'لا توجد نسخ احتياطية';
        }
        
        const latestBackup = backupKeys.sort().pop();
        const timestamp = latestBackup.split('_').pop();
        return new Date(parseInt(timestamp)).toLocaleString('ar-SA');
    } catch (error) {
        return 'غير محدد';
    }
}

// استيراد البيانات
function importData(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
        showNotification('يرجى اختيار ملف JSON صحيح', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            if (confirm('هل أنت متأكد من استيراد البيانات؟\nسيتم استبدال جميع البيانات الحالية.')) {
                // التحقق من صحة البيانات
                if (!data.settings || !data.products || !data.customers) {
                    showNotification('ملف البيانات غير صحيح أو تالف', 'error');
                    return;
                }

                // استيراد البيانات
                Object.keys(data).forEach(table => {
                    if (table !== 'exportDate' && table !== 'version') {
                        db.setTable(table, data[table]);
                    }
                });

                showNotification('تم استيراد البيانات بنجاح', 'success');

                // إعادة تحميل الصفحة
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        } catch (error) {
            console.error('خطأ في استيراد البيانات:', error);
            showNotification('خطأ في قراءة ملف البيانات', 'error');
        }
    };

    reader.readAsText(file);
}

// إعادة تعيين النظام
function resetSystem() {
    const confirmText = 'هل أنت متأكد من مسح جميع البيانات؟\nهذا الإجراء لا يمكن التراجع عنه.\n\nاكتب "مسح" للتأكيد:';
    const userInput = prompt(confirmText);

    if (userInput === 'مسح') {
        try {
            const success = db.clearAllData();
            if (success) {
                showNotification('تم مسح جميع البيانات بنجاح', 'success');

                // إعادة تحميل الصفحة بعد ثانيتين
                setTimeout(() => {
                    location.reload();
                }, 2000);
            } else {
                showNotification('خطأ في مسح البيانات', 'error');
            }
        } catch (error) {
            console.error('خطأ في مسح البيانات:', error);
            showNotification('خطأ في مسح البيانات', 'error');
        }
    } else if (userInput !== null) {
        showNotification('تم إلغاء العملية', 'info');
    }
}

// تغيير المظهر
function changeTheme(theme) {
    try {
        document.documentElement.setAttribute('data-theme', theme);

        let settings = db.getTable('settings');
        settings.theme = theme;
        db.setTable('settings', settings);

        // تحديث أيقونة المظهر في الهيدر
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        showNotification(`تم التبديل إلى المظهر ${theme === 'dark' ? 'الداكن' : 'المضيء'}`, 'success');
    } catch (error) {
        console.error('خطأ في تغيير المظهر:', error);
        showNotification('خطأ في تغيير المظهر', 'error');
    }
}

// إدارة الفئات في الإعدادات
function loadCategoriesInSettings() {
    try {
        // تحميل الفئات في القائمة
        refreshCategoriesDisplay();

        // تحميل الفئات في القائمة المنسدلة للفئة الافتراضية
        const defaultCategorySelect = document.getElementById('defaultCategory');
        if (defaultCategorySelect && window.populateCategorySelect) {
            populateCategorySelect(defaultCategorySelect, false);

            // تعيين القيمة الحالية
            const settings = db.getTable('settings');
            if (settings.defaultCategory) {
                defaultCategorySelect.value = settings.defaultCategory;
            }
        }

    } catch (error) {
        console.error('خطأ في تحميل الفئات في الإعدادات:', error);
    }
}

function refreshCategoriesDisplay() {
    try {
        const container = document.getElementById('categoriesListContainer');
        if (!container) return;

        const categories = window.loadCategories ? loadCategories() : [];

        if (categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tags"></i>
                    <p>لا توجد فئات محفوظة</p>
                    <button class="btn btn-primary" onclick="showAddCategoryModal()">
                        إضافة فئة جديدة
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="categories-grid">
                ${categories.map((category, index) => `
                    <div class="category-item" data-category-id="${category.id}">
                        <div class="category-header">
                            <span class="category-number">${index + 1}</span>
                            <h4 class="category-name">${category.name}</h4>
                            <div class="category-actions">
                                <button class="btn-icon btn-primary" onclick="editCategory('${category.id}')" title="تعديل">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon btn-danger" onclick="deleteCategoryFromSettings('${category.id}')" title="حذف">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="category-info">
                            <p class="category-id">المعرف: ${category.id}</p>
                            <p class="category-description">${category.description || 'لا يوجد وصف'}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

    } catch (error) {
        console.error('خطأ في عرض الفئات:', error);
        showNotification('خطأ في عرض الفئات', 'error');
    }
}

function showAddCategoryModal() {
    try {
        const modal = document.getElementById('categoryModal');
        const title = document.getElementById('categoryModalTitle');
        const form = document.getElementById('categoryForm');

        if (!modal || !title || !form) return;

        // إعداد النافذة للإضافة
        title.textContent = 'إضافة فئة جديدة';
        form.reset();

        // إظهار النافذة
        modal.classList.remove('hidden');

        // التركيز على أول حقل
        const firstInput = form.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }

    } catch (error) {
        console.error('خطأ في إظهار نافذة إضافة الفئة:', error);
        showNotification('خطأ في إظهار النافذة', 'error');
    }
}

function editCategory(categoryId) {
    try {
        const category = window.getCategoryById ? getCategoryById(categoryId) : null;
        if (!category) {
            showNotification('الفئة غير موجودة', 'error');
            return;
        }

        const modal = document.getElementById('categoryModal');
        const title = document.getElementById('categoryModalTitle');
        const form = document.getElementById('categoryForm');

        if (!modal || !title || !form) return;

        // إعداد النافذة للتعديل
        title.textContent = 'تعديل الفئة';

        // ملء البيانات
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description || '';

        // جعل معرف الفئة للقراءة فقط
        document.getElementById('categoryId').readOnly = true;

        // إظهار النافذة
        modal.classList.remove('hidden');

    } catch (error) {
        console.error('خطأ في تعديل الفئة:', error);
        showNotification('خطأ في تعديل الفئة', 'error');
    }
}

function saveCategoryFromModal(event) {
    event.preventDefault();

    try {
        const categoryId = document.getElementById('categoryId').value.trim();
        const categoryName = document.getElementById('categoryName').value.trim();
        const categoryDescription = document.getElementById('categoryDescription').value.trim();

        if (!categoryId || !categoryName) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'warning');
            return;
        }

        // التحقق من صحة معرف الفئة
        if (!/^[a-zA-Z0-9_-]+$/.test(categoryId)) {
            showNotification('معرف الفئة يجب أن يحتوي على أحرف إنجليزية وأرقام فقط', 'warning');
            return;
        }

        const categoryData = {
            id: categoryId,
            name: categoryName,
            description: categoryDescription
        };

        // التحقق من وجود الفئة (للإضافة الجديدة)
        const existingCategory = window.getCategoryById ? getCategoryById(categoryId) : null;
        const isEditing = document.getElementById('categoryId').readOnly;

        if (!isEditing && existingCategory) {
            showNotification('معرف الفئة موجود بالفعل', 'warning');
            return;
        }

        // حفظ الفئة
        if (isEditing) {
            if (window.updateCategory) {
                updateCategory(categoryData);
                showNotification('تم تحديث الفئة بنجاح', 'success');
            }
        } else {
            if (window.addCategory) {
                addCategory(categoryData);
                showNotification('تم إضافة الفئة بنجاح', 'success');
            }
        }

        // إغلاق النافذة وتحديث العرض
        closeCategoryModal();
        refreshCategoriesDisplay();

        // تحديث القائمة المنسدلة للفئة الافتراضية
        const defaultCategorySelect = document.getElementById('defaultCategory');
        if (defaultCategorySelect && window.populateCategorySelect) {
            populateCategorySelect(defaultCategorySelect, false);
        }

    } catch (error) {
        console.error('خطأ في حفظ الفئة:', error);
        showNotification('خطأ في حفظ الفئة', 'error');
    }
}

function closeCategoryModal() {
    try {
        const modal = document.getElementById('categoryModal');
        if (modal) {
            modal.classList.add('hidden');
        }

        // إعادة تعيين النموذج
        const form = document.getElementById('categoryForm');
        if (form) {
            form.reset();
        }

        // إزالة خاصية القراءة فقط من معرف الفئة
        const categoryIdInput = document.getElementById('categoryId');
        if (categoryIdInput) {
            categoryIdInput.readOnly = false;
        }

    } catch (error) {
        console.error('خطأ في إغلاق نافذة الفئة:', error);
    }
}

// اختبار وظائف إدارة الفئات في الإعدادات
function testCategoryManagementInSettings() {
    try {
        console.log('🧪 بدء اختبار إدارة الفئات في الإعدادات...');

        let testsPassed = 0;
        let totalTests = 0;

        // اختبار 1: التحقق من وجود العناصر المطلوبة
        totalTests++;
        const categoriesContainer = document.getElementById('categoriesListContainer');
        const defaultCategorySelect = document.getElementById('defaultCategory');
        const categoryModal = document.getElementById('categoryModal');

        if (categoriesContainer && defaultCategorySelect && categoryModal) {
            testsPassed++;
            console.log('✅ جميع عناصر إدارة الفئات موجودة');
        } else {
            console.log('❌ بعض عناصر إدارة الفئات مفقودة');
        }

        // اختبار 2: التحقق من تحميل الفئات في القائمة المنسدلة
        totalTests++;
        if (defaultCategorySelect && defaultCategorySelect.options.length > 0) {
            testsPassed++;
            console.log(`✅ تم تحميل ${defaultCategorySelect.options.length} فئة في القائمة المنسدلة`);
        } else {
            console.log('❌ لم يتم تحميل الفئات في القائمة المنسدلة');
        }

        // اختبار 3: التحقق من عرض الفئات في الشبكة
        totalTests++;
        const categoryItems = document.querySelectorAll('.category-item');
        if (categoryItems.length > 0) {
            testsPassed++;
            console.log(`✅ تم عرض ${categoryItems.length} فئة في الشبكة`);
        } else {
            console.log('❌ لم يتم عرض الفئات في الشبكة');
        }

        // اختبار 4: التحقق من وجود الدوال المطلوبة
        totalTests++;
        const requiredFunctions = [
            'loadCategories', 'populateCategorySelect', 'getCategoryById',
            'addCategory', 'updateCategory', 'deleteCategory'
        ];

        const missingFunctions = requiredFunctions.filter(func => typeof window[func] !== 'function');

        if (missingFunctions.length === 0) {
            testsPassed++;
            console.log('✅ جميع دوال إدارة الفئات متاحة');
        } else {
            console.log(`❌ دوال مفقودة: ${missingFunctions.join(', ')}`);
        }

        // اختبار 5: التحقق من الترقيم في القائمة المنسدلة
        totalTests++;
        if (defaultCategorySelect && defaultCategorySelect.options.length > 0) {
            const firstOption = defaultCategorySelect.options[0];
            if (firstOption && firstOption.textContent.includes('1.')) {
                testsPassed++;
                console.log('✅ الترقيم يعمل بشكل صحيح في القائمة المنسدلة');
            } else {
                console.log('❌ الترقيم لا يعمل في القائمة المنسدلة');
            }
        } else {
            console.log('❌ لا يمكن اختبار الترقيم - القائمة فارغة');
        }

        // النتيجة النهائية
        const successRate = (testsPassed / totalTests) * 100;
        console.log(`🎯 نتيجة اختبار إدارة الفئات: ${testsPassed}/${totalTests} (${successRate.toFixed(1)}%)`);

        if (successRate >= 90) {
            console.log('🎉 إدارة الفئات في الإعدادات تعمل بشكل ممتاز!');
            showNotification('إدارة الفئات في الإعدادات تعمل بنجاح', 'success');
        } else if (successRate >= 70) {
            console.log('✅ إدارة الفئات تعمل بشكل جيد مع بعض التحسينات المطلوبة');
            showNotification('إدارة الفئات تعمل مع بعض التحذيرات', 'info');
        } else {
            console.log('⚠️ إدارة الفئات تحتاج إلى إصلاحات');
            showNotification('إدارة الفئات تحتاج إلى إصلاحات', 'warning');
        }

        return successRate >= 70;

    } catch (error) {
        console.error('❌ خطأ في اختبار إدارة الفئات:', error);
        showNotification('خطأ في اختبار إدارة الفئات', 'error');
        return false;
    }
}

// إدارة الفئات في الإعدادات
function loadCategoriesInSettings() {
    try {
        // تحميل الفئات في القائمة
        refreshCategoriesDisplay();

        // تحميل الفئات في القائمة المنسدلة للفئة الافتراضية
        const defaultCategorySelect = document.getElementById('defaultCategory');
        if (defaultCategorySelect && typeof populateCategorySelect === 'function') {
            populateCategorySelect(defaultCategorySelect, true);

            // تعيين القيمة الحالية
            const settings = db.getTable('settings');
            if (settings.defaultCategory) {
                defaultCategorySelect.value = settings.defaultCategory;
            }
        }

    } catch (error) {
        console.error('خطأ في تحميل الفئات في الإعدادات:', error);
    }
}

function refreshCategoriesDisplay() {
    try {
        const container = document.getElementById('categoriesListContainer');
        if (!container) return;

        const categories = db.getTable('categories');

        if (categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tags"></i>
                    <p>لا توجد فئات محددة</p>
                    <button class="btn btn-primary" onclick="showAddCategoryModal()">
                        إضافة فئة جديدة
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="categories-grid">
                ${categories.map((category, index) => `
                    <div class="category-item" data-category-id="${category.id}">
                        <div class="category-header">
                            <span class="category-number">${index + 1}</span>
                            <h4 class="category-name">${category.name}</h4>
                            <div class="category-actions">
                                <button class="btn-icon btn-primary" onclick="editCategory('${category.id}')" title="تعديل">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon btn-danger" onclick="deleteCategory('${category.id}')" title="حذف">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="category-info">
                            <p class="category-id">المعرف: ${category.id}</p>
                            <p class="category-description">${category.description || 'لا يوجد وصف'}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

    } catch (error) {
        console.error('خطأ في عرض الفئات:', error);
        showNotification('خطأ في تحميل الفئات', 'error');
    }
}

function showAddCategoryModal() {
    try {
        const modal = document.getElementById('categoryModal');
        const title = document.getElementById('categoryModalTitle');
        const form = document.getElementById('categoryForm');

        if (!modal || !title || !form) return;

        // إعداد النافذة للإضافة
        title.textContent = 'إضافة فئة جديدة';
        form.reset();

        // تمكين حقل المعرف للفئات الجديدة
        document.getElementById('categoryId').disabled = false;

        // إظهار النافذة
        modal.classList.remove('hidden');

    } catch (error) {
        console.error('خطأ في إظهار نافذة إضافة الفئة:', error);
        showNotification('خطأ في فتح نافذة الفئة', 'error');
    }
}

function editCategory(categoryId) {
    try {
        const categories = db.getTable('categories');
        const category = categories.find(c => c.id === categoryId);

        if (!category) {
            showNotification('الفئة غير موجودة', 'error');
            return;
        }

        const modal = document.getElementById('categoryModal');
        const title = document.getElementById('categoryModalTitle');

        if (!modal || !title) return;

        // إعداد النافذة للتعديل
        title.textContent = 'تعديل الفئة';

        // ملء البيانات
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description || '';

        // تعطيل حقل المعرف للفئات الموجودة
        document.getElementById('categoryId').disabled = true;

        // إظهار النافذة
        modal.classList.remove('hidden');

    } catch (error) {
        console.error('خطأ في تعديل الفئة:', error);
        showNotification('خطأ في تحميل بيانات الفئة', 'error');
    }
}

function saveCategoryFromModal(event) {
    event.preventDefault();

    try {
        const categoryId = document.getElementById('categoryId').value.trim();
        const categoryName = document.getElementById('categoryName').value.trim();
        const categoryDescription = document.getElementById('categoryDescription').value.trim();

        if (!categoryId || !categoryName) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'warning');
            return;
        }

        // التحقق من صحة المعرف (إنجليزي فقط، بدون مسافات)
        if (!/^[a-zA-Z0-9_-]+$/.test(categoryId)) {
            showNotification('معرف الفئة يجب أن يحتوي على أحرف إنجليزية وأرقام فقط', 'warning');
            return;
        }

        const categoryData = {
            id: categoryId,
            name: categoryName,
            description: categoryDescription
        };

        const categories = db.getTable('categories');
        const existingIndex = categories.findIndex(c => c.id === categoryId);

        if (existingIndex >= 0) {
            // تحديث فئة موجودة
            categories[existingIndex] = categoryData;
            db.setTable('categories', categories);
            showNotification('تم تحديث الفئة بنجاح', 'success');
        } else {
            // إضافة فئة جديدة
            categories.push(categoryData);
            db.setTable('categories', categories);
            showNotification('تم إضافة الفئة بنجاح', 'success');
        }

        // تحديث جميع قوائم الفئات في النظام
        if (typeof updateAllCategorySelects === 'function') {
            updateAllCategorySelects();
        }

        // إغلاق النافذة وتحديث العرض
        closeCategoryModal();
        refreshCategoriesDisplay();
        loadCategoriesInSettings();

    } catch (error) {
        console.error('خطأ في حفظ الفئة:', error);
        showNotification('خطأ في حفظ الفئة', 'error');
    }
}

function closeCategoryModal() {
    try {
        const modal = document.getElementById('categoryModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    } catch (error) {
        console.error('خطأ في إغلاق نافذة الفئة:', error);
    }
}

function deleteCategoryFromSettings(categoryId) {
    try {
        // التحقق من استخدام الفئة في المنتجات
        const products = db.getTable('products');
        const usedInProducts = products.some(product => product.categoryId === categoryId);

        if (usedInProducts) {
            showNotification('لا يمكن حذف الفئة لأنها مستخدمة في منتجات موجودة', 'warning');
            return;
        }

        // تأكيد الحذف
        if (!confirm('هل أنت متأكد من حذف هذه الفئة؟ لا يمكن التراجع عن هذا الإجراء.')) {
            return;
        }

        // استخدام الدالة المركزية للحذف
        if (typeof window.deleteCategory === 'function') {
            window.deleteCategory(categoryId);
        } else {
            // حذف محلي إذا لم تكن الدالة المركزية متاحة
            const categories = db.getTable('categories');
            const updatedCategories = categories.filter(category => category.id !== categoryId);
            db.setTable('categories', updatedCategories);
            showNotification('تم حذف الفئة بنجاح', 'success');
        }

        // تحديث العرض
        refreshCategoriesDisplay();
        loadCategoriesInSettings();

        // تحديث جميع قوائم الفئات في النظام
        if (typeof updateAllCategorySelects === 'function') {
            updateAllCategorySelects();
        }

    } catch (error) {
        console.error('خطأ في حذف الفئة:', error);
        showNotification('خطأ في حذف الفئة', 'error');
    }
}

// تصدير الوظائف للاستخدام العام
window.loadSettingsSection = loadSettingsSection;
window.updateCompanySetting = updateCompanySetting;
window.updateInvoiceCounter = updateInvoiceCounter;
window.resetInvoiceNumbers = resetInvoiceNumbers;
window.exportAllData = exportAllData;
window.importData = importData;
window.resetSystem = resetSystem;
window.changeTheme = changeTheme;
window.loadCategoriesInSettings = loadCategoriesInSettings;
window.refreshCategoriesDisplay = refreshCategoriesDisplay;
window.showAddCategoryModal = showAddCategoryModal;
window.editCategory = editCategory;
window.saveCategoryFromModal = saveCategoryFromModal;
window.closeCategoryModal = closeCategoryModal;
window.loadCategoriesInSettings = loadCategoriesInSettings;
window.refreshCategoriesDisplay = refreshCategoriesDisplay;
window.showAddCategoryModal = showAddCategoryModal;
window.editCategory = editCategory;
window.saveCategoryFromModal = saveCategoryFromModal;
window.closeCategoryModal = closeCategoryModal;
window.deleteCategoryFromSettings = deleteCategoryFromSettings;

// اختبار وظائف إدارة الفئات في الإعدادات
function testCategoryDropdownInSettings() {
    try {
        console.log('🧪 بدء اختبار قائمة الفئات في الإعدادات...');

        let totalTests = 0;
        let passedTests = 0;
        const testResults = [];

        // اختبار 1: وجود قائمة الفئة الافتراضية
        totalTests++;
        const defaultCategorySelect = document.getElementById('defaultCategory');
        if (defaultCategorySelect) {
            passedTests++;
            testResults.push('✅ قائمة الفئة الافتراضية موجودة');

            // اختبار عدد الخيارات
            const optionsCount = defaultCategorySelect.options.length;
            if (optionsCount > 1) { // أكثر من خيار "جميع الفئات"
                testResults.push(`✅ القائمة تحتوي على ${optionsCount - 1} فئة`);
            } else {
                testResults.push('⚠️ القائمة لا تحتوي على فئات');
            }
        } else {
            testResults.push('❌ قائمة الفئة الافتراضية غير موجودة');
        }

        // اختبار 2: وجود حاوي قائمة الفئات
        totalTests++;
        const categoriesContainer = document.getElementById('categoriesListContainer');
        if (categoriesContainer) {
            passedTests++;
            testResults.push('✅ حاوي قائمة الفئات موجود');

            // فحص المحتوى
            if (categoriesContainer.innerHTML.includes('category-item')) {
                testResults.push('✅ الفئات معروضة في القائمة');
            } else if (categoriesContainer.innerHTML.includes('empty-state')) {
                testResults.push('ℹ️ لا توجد فئات (حالة فارغة)');
            } else {
                testResults.push('⚠️ حاوي الفئات فارغ');
            }
        } else {
            testResults.push('❌ حاوي قائمة الفئات غير موجود');
        }

        // اختبار 3: وجود نافذة إضافة الفئة
        totalTests++;
        const categoryModal = document.getElementById('categoryModal');
        if (categoryModal) {
            passedTests++;
            testResults.push('✅ نافذة إضافة الفئة موجودة');
        } else {
            testResults.push('❌ نافذة إضافة الفئة غير موجودة');
        }

        // اختبار 4: التحقق من وجود الدوال المطلوبة
        totalTests++;
        const requiredFunctions = [
            'loadCategoriesInSettings', 'refreshCategoriesDisplay', 'showAddCategoryModal',
            'editCategory', 'saveCategoryFromModal', 'deleteCategoryFromSettings'
        ];

        const missingFunctions = requiredFunctions.filter(func => typeof window[func] !== 'function');

        if (missingFunctions.length === 0) {
            passedTests++;
            testResults.push('✅ جميع الدوال المطلوبة متاحة');
        } else {
            testResults.push(`❌ دوال مفقودة: ${missingFunctions.join(', ')}`);
        }

        // اختبار 5: التحقق من تحميل الفئات من قاعدة البيانات
        totalTests++;
        try {
            const categories = db.getTable('categories');
            if (categories && categories.length > 0) {
                passedTests++;
                testResults.push(`✅ تم تحميل ${categories.length} فئة من قاعدة البيانات`);

                // عرض أسماء الفئات
                const categoryNames = categories.slice(0, 5).map(c => c.name).join(', ');
                testResults.push(`ℹ️ أمثلة على الفئات: ${categoryNames}${categories.length > 5 ? '...' : ''}`);
            } else {
                testResults.push('⚠️ لا توجد فئات في قاعدة البيانات');
            }
        } catch (error) {
            testResults.push('❌ خطأ في تحميل الفئات من قاعدة البيانات');
        }

        // النتائج النهائية
        console.log('\n📋 تقرير اختبار قائمة الفئات في الإعدادات:');
        console.log('=' .repeat(50));

        testResults.forEach(result => console.log(result));

        const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
        console.log(`\n🎯 النتيجة النهائية: ${passedTests}/${totalTests} (${successRate.toFixed(1)}%)`);

        if (successRate >= 90) {
            console.log('🎉 قائمة الفئات في الإعدادات تعمل بشكل ممتاز!');
            showNotification('قائمة الفئات في الإعدادات تعمل بنجاح', 'success');
        } else if (successRate >= 70) {
            console.log('✅ قائمة الفئات تعمل بشكل جيد مع بعض التحسينات المطلوبة');
            showNotification('قائمة الفئات تعمل مع بعض التحذيرات', 'info');
        } else {
            console.log('⚠️ قائمة الفئات تحتاج إلى إصلاحات');
            showNotification('قائمة الفئات تحتاج إلى إصلاحات', 'warning');
        }

        console.log('=' .repeat(50));
        return successRate >= 70;

    } catch (error) {
        console.error('❌ خطأ في اختبار قائمة الفئات:', error);
        showNotification('خطأ في اختبار قائمة الفئات', 'error');
        return false;
    }
}

window.testCategoryDropdownInSettings = testCategoryDropdownInSettings;
window.testCategoryManagementInSettings = testCategoryManagementInSettings;

// وظيفة تغيير كلمة مرور المدير
function changeAdminPassword() {
    try {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // التحقق من الحقول الفارغة
        if (!currentPassword || !newPassword || !confirmPassword) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'warning');
            return;
        }
        
        // التحقق من كلمة المرور الحالية
        const settings = db.getTable('settings');
        if (currentPassword !== settings.adminPassword) {
            showNotification('كلمة المرور الحالية غير صحيحة', 'error');
            return;
        }
        
        // التحقق من تطابق كلمة المرور الجديدة
        if (newPassword !== confirmPassword) {
            showNotification('كلمة المرور الجديدة غير متطابقة', 'error');
            return;
        }
        
        // التحقق من قوة كلمة المرور
        if (newPassword.length < 4) {
            showNotification('كلمة المرور يجب أن تكون 4 أحرف على الأقل', 'warning');
            return;
        }
        
        // حفظ كلمة المرور الجديدة
        settings.adminPassword = newPassword;
        db.setTable('settings', settings);
        
        // مسح الحقول
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        showNotification('تم تغيير كلمة المرور بنجاح', 'success');
        
    } catch (error) {
        console.error('خطأ في تغيير كلمة المرور:', error);
        showNotification('خطأ في تغيير كلمة المرور', 'error');
    }
}

// وظيفة إظهار/إخفاء كلمة المرور
function togglePasswordVisibility(fieldId) {
    try {
        const passwordField = document.getElementById(fieldId);
        const toggleIcon = document.getElementById(fieldId + 'Toggle') || document.getElementById(fieldId + 'ToggleIcon');
        
        if (passwordField && toggleIcon) {
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                toggleIcon.className = 'fas fa-eye-slash';
            } else {
                passwordField.type = 'password';
                toggleIcon.className = 'fas fa-eye';
            }
        }
    } catch (error) {
        console.error('خطأ في تبديل عرض كلمة المرور:', error);
    }
}

// وظيفة تبديل التبويبات
function switchSettingsTab(tabName) {
    // إخفاء جميع التبويبات
    const tabContents = document.querySelectorAll('.settings-tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // إلغاء تنشيط جميع أزرار التبويبات
    const tabButtons = document.querySelectorAll('.settings-nav-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // تنشيط التبويب المحدد
    const targetTab = document.getElementById(tabName + 'Settings');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // تنشيط الزر المحدد
    const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetButton) {
        targetButton.classList.add('active');
    }
    
    // تحميل البيانات الخاصة بالتبويب
    if (tabName === 'categories') {
        setTimeout(() => {
            refreshCategoriesDisplay();
        }, 100);
    }
}

window.changeAdminPassword = changeAdminPassword;
window.togglePasswordVisibility = togglePasswordVisibility;
window.switchSettingsTab = switchSettingsTab;

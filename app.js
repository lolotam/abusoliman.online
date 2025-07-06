/**
 * وظائف التطبيق الإضافية
 * أبوسليمان للمحاسبة - نظام إدارة نقاط البيع
 */

// ===== نظام المصادقة =====

// المستخدم الحالي
let currentUser = null;

// تشفير كلمة المرور (تشفير بسيط للنظام المحلي)
function hashPassword(password) {
    // تشفير بسيط باستخدام btoa مع salt
    const salt = 'abusleman_pos_2024';
    return btoa(salt + password + salt);
}

// التحقق من كلمة المرور
function verifyPassword(password, hashedPassword) {
    return hashPassword(password) === hashedPassword;
}

// إنشاء المستخدم الافتراضي
function createDefaultAdmin() {
    const users = db.getTable('users');

    // التحقق من وجود المستخدم الافتراضي
    const adminExists = users.find(user => user.username === 'admin');

    if (!adminExists) {
        const defaultAdmin = {
            id: 'admin_' + Date.now(),
            username: 'admin',
            password: hashPassword('admin123'),
            fullName: 'المدير العام',
            role: 'admin',
            permissions: ['all'],
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        users.push(defaultAdmin);
        db.setTable('users', users);
        console.log('تم إنشاء المستخدم الافتراضي');
    }
}

// تسجيل الدخول
function login(event) {
    if (event) {
        event.preventDefault();
    }

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    // إخفاء رسالة الخطأ
    errorDiv.style.display = 'none';

    if (!username || !password) {
        showLoginError('يرجى إدخال اسم المستخدم وكلمة المرور');
        return;
    }

    // البحث عن المستخدم
    const users = db.getTable('users');
    const user = users.find(u => u.username === username && u.isActive);

    if (!user) {
        showLoginError('اسم المستخدم غير موجود أو غير نشط');
        return;
    }

    // التحقق من كلمة المرور
    if (!verifyPassword(password, user.password)) {
        showLoginError('كلمة المرور غير صحيحة');
        return;
    }

    // تحديث آخر تسجيل دخول
    user.lastLogin = new Date().toISOString();
    db.update('users', user.id, { lastLogin: user.lastLogin });

    // حفظ المستخدم الحالي
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));

    // إخفاء شاشة تسجيل الدخول وإظهار التطبيق
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');

    // تحديث اسم المستخدم في الهيدر
    updateUserDisplay();

    // تهيئة النظام
    initializeSystem();

    console.log('تم تسجيل الدخول بنجاح:', user.fullName);
}

// عرض رسالة خطأ تسجيل الدخول
function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// تحديث عرض المستخدم في الهيدر
function updateUserDisplay() {
    const userNameElement = document.querySelector('.user-info .user-name');
    if (userNameElement && currentUser) {
        userNameElement.textContent = currentUser.fullName;
    }
}

// تسجيل الخروج
function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        currentUser = null;
        localStorage.removeItem('currentUser');

        // إظهار شاشة تسجيل الدخول
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');

        // مسح النموذج
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('loginError').style.display = 'none';
    }
}

// التحقق من الجلسة عند تحميل الصفحة
function checkSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);

            // التحقق من أن المستخدم ما زال موجوداً ونشطاً
            const users = db.getTable('users');
            const user = users.find(u => u.id === currentUser.id && u.isActive);

            if (user) {
                // إخفاء شاشة تسجيل الدخول وإظهار التطبيق
                document.getElementById('loginScreen').classList.add('hidden');
                document.getElementById('mainApp').classList.remove('hidden');
                updateUserDisplay();
                return true;
            } else {
                // المستخدم غير موجود أو غير نشط
                logout();
            }
        } catch (error) {
            console.error('خطأ في قراءة بيانات الجلسة:', error);
            logout();
        }
    }
    return false;
}

// ===== إدارة المستخدمين =====

// تحميل قائمة المستخدمين
function loadUsersGrid() {
    const users = db.getTable('users');
    const grid = document.getElementById('usersGrid');

    if (!grid) return;

    if (users.length === 0) {
        grid.innerHTML = '<p class="no-data">لا توجد مستخدمين</p>';
        return;
    }

    grid.innerHTML = users.map(user => `
        <div class="user-card">
            <div class="user-header">
                <div class="user-info">
                    <h3>${user.fullName}</h3>
                    <p class="username">@${user.username}</p>
                    <span class="user-role ${user.role}">${getRoleText(user.role)}</span>
                </div>
                <div class="user-status ${user.isActive ? 'active' : 'inactive'}">
                    ${user.isActive ? 'نشط' : 'غير نشط'}
                </div>
            </div>

            <div class="user-details">
                <div class="detail-item">
                    <span class="label">تاريخ الإنشاء:</span>
                    <span class="value">${formatDate(user.createdAt)}</span>
                </div>
                <div class="detail-item">
                    <span class="label">آخر تسجيل دخول:</span>
                    <span class="value">${user.lastLogin ? formatDate(user.lastLogin, true) : 'لم يسجل دخول بعد'}</span>
                </div>
            </div>

            <div class="user-actions">
                <button class="btn btn-sm btn-warning" onclick="editUser('${user.id}')" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-info" onclick="toggleUserStatus('${user.id}')" title="${user.isActive ? 'إيقاف' : 'تفعيل'}">
                    <i class="fas fa-${user.isActive ? 'user-slash' : 'user-check'}"></i>
                </button>
                ${user.username !== 'admin' ? `
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// الحصول على نص الدور
function getRoleText(role) {
    const roles = {
        'admin': 'مدير',
        'cashier': 'كاشير',
        'manager': 'مدير فرع',
        'viewer': 'مشاهد'
    };
    return roles[role] || role;
}

// إظهار نافذة إضافة مستخدم
function showAddUserModal() {
    const content = `
        <form id="addUserForm" onsubmit="saveUser(event)">
            <div class="form-group">
                <label for="newUsername">اسم المستخدم *</label>
                <input type="text" id="newUsername" required>
            </div>

            <div class="form-group">
                <label for="newPassword">كلمة المرور *</label>
                <input type="password" id="newPassword" required>
            </div>

            <div class="form-group">
                <label for="confirmPassword">تأكيد كلمة المرور *</label>
                <input type="password" id="confirmPassword" required>
            </div>

            <div class="form-group">
                <label for="newFullName">الاسم الكامل *</label>
                <input type="text" id="newFullName" required>
            </div>

            <div class="form-group">
                <label for="newRole">الدور *</label>
                <select id="newRole" required>
                    <option value="">اختر الدور</option>
                    <option value="admin">مدير</option>
                    <option value="manager">مدير فرع</option>
                    <option value="cashier">كاشير</option>
                    <option value="viewer">مشاهد</option>
                </select>
            </div>

            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="newUserActive" checked>
                    <span class="checkmark"></span>
                    مستخدم نشط
                </label>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    حفظ المستخدم
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('إضافة مستخدم جديد', content);
}

// حفظ المستخدم
function saveUser(event) {
    event.preventDefault();

    try {
        // الحصول على قيم الحقول مع التحقق من وجودها
        const usernameElement = document.getElementById('newUsername');
        const passwordElement = document.getElementById('newPassword');
        const confirmPasswordElement = document.getElementById('confirmPassword');
        const fullNameElement = document.getElementById('newFullName');
        const roleElement = document.getElementById('newRole');
        const isActiveElement = document.getElementById('newUserActive');

        // التحقق من وجود العناصر
        if (!usernameElement || !passwordElement || !confirmPasswordElement || !fullNameElement || !roleElement || !isActiveElement) {
            showNotification('خطأ في تحميل النموذج، يرجى المحاولة مرة أخرى', 'error');
            return;
        }

        const username = usernameElement.value.trim();
        const password = passwordElement.value.trim();
        const confirmPassword = confirmPasswordElement.value.trim();
        const fullName = fullNameElement.value.trim();
        const role = roleElement.value.trim();
        const isActive = isActiveElement.checked;

        // التحقق من البيانات مع رسائل خطأ مفصلة
        if (!username) {
            showNotification('يرجى إدخال اسم المستخدم', 'error');
            usernameElement.focus();
            return;
        }

        if (!password) {
            showNotification('يرجى إدخال كلمة المرور', 'error');
            passwordElement.focus();
            return;
        }

        if (!confirmPassword) {
            showNotification('يرجى تأكيد كلمة المرور', 'error');
            confirmPasswordElement.focus();
            return;
        }

        if (!fullName) {
            showNotification('يرجى إدخال الاسم الكامل', 'error');
            fullNameElement.focus();
            return;
        }

        if (!role) {
            showNotification('يرجى اختيار الدور', 'error');
            roleElement.focus();
            return;
        }

        if (password !== confirmPassword) {
            showNotification('كلمة المرور وتأكيدها غير متطابقتين', 'error');
            return;
        }

        if (password.length < 6) {
            showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
            return;
        }

        // التحقق من عدم تكرار اسم المستخدم
        const users = db.getTable('users');
        const existingUser = users.find(u => u.username === username);

        if (existingUser) {
            showNotification('اسم المستخدم موجود بالفعل', 'error');
            return;
        }

        // إنشاء المستخدم الجديد
        const newUser = {
            id: 'user_' + Date.now(),
            username: username,
            password: hashPassword(password),
            fullName: fullName,
            role: role,
            permissions: getDefaultPermissions(role),
            isActive: isActive,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        // حفظ المستخدم
        const success = db.insert('users', newUser);

        if (success) {
            showNotification('تم إضافة المستخدم بنجاح', 'success');
            closeModal();
            loadUsersGrid();
        } else {
            showNotification('خطأ في إضافة المستخدم', 'error');
        }

    } catch (error) {
        console.error('خطأ في حفظ المستخدم:', error);
        showNotification('خطأ في حفظ المستخدم', 'error');
    }
}

// الحصول على الصلاحيات الافتراضية حسب الدور
function getDefaultPermissions(role) {
    const permissions = {
        'admin': ['all'],
        'manager': ['sales', 'products', 'customers', 'suppliers', 'reports', 'inventory'],
        'cashier': ['sales', 'customers'],
        'viewer': ['reports']
    };
    return permissions[role] || [];
}

// تعديل المستخدم
function editUser(userId) {
    const user = db.findById('users', userId);
    if (!user) {
        showNotification('المستخدم غير موجود', 'error');
        return;
    }

    const content = `
        <form id="editUserForm" onsubmit="updateUser(event, '${userId}')">
            <div class="form-group">
                <label for="editUsername">اسم المستخدم *</label>
                <input type="text" id="editUsername" value="${user.username}" required ${user.username === 'admin' ? 'readonly' : ''}>
            </div>

            <div class="form-group">
                <label for="editFullName">الاسم الكامل *</label>
                <input type="text" id="editFullName" value="${user.fullName}" required>
            </div>

            <div class="form-group">
                <label for="editRole">الدور *</label>
                <select id="editRole" required ${user.username === 'admin' ? 'disabled' : ''}>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>مدير</option>
                    <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>مدير فرع</option>
                    <option value="cashier" ${user.role === 'cashier' ? 'selected' : ''}>كاشير</option>
                    <option value="viewer" ${user.role === 'viewer' ? 'selected' : ''}>مشاهد</option>
                </select>
            </div>

            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="editUserActive" ${user.isActive ? 'checked' : ''} ${user.username === 'admin' ? 'disabled' : ''}>
                    <span class="checkmark"></span>
                    مستخدم نشط
                </label>
            </div>

            <div class="form-group">
                <label for="newPasswordEdit">كلمة المرور الجديدة (اتركها فارغة إذا لم ترد تغييرها)</label>
                <input type="password" id="newPasswordEdit">
            </div>

            <div class="form-group">
                <label for="confirmPasswordEdit">تأكيد كلمة المرور الجديدة</label>
                <input type="password" id="confirmPasswordEdit">
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    حفظ التعديلات
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('تعديل المستخدم', content);
}

// تحديث المستخدم
function updateUser(event, userId) {
    event.preventDefault();

    try {
        const user = db.findById('users', userId);
        if (!user) {
            showNotification('المستخدم غير موجود', 'error');
            return;
        }

        const username = document.getElementById('editUsername').value.trim();
        const fullName = document.getElementById('editFullName').value.trim();
        const role = document.getElementById('editRole').value;
        const isActive = document.getElementById('editUserActive').checked;
        const newPassword = document.getElementById('newPasswordEdit').value;
        const confirmPassword = document.getElementById('confirmPasswordEdit').value;

        // التحقق من البيانات
        if (!username || !fullName || !role) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        // التحقق من كلمة المرور إذا تم إدخالها
        if (newPassword) {
            if (newPassword !== confirmPassword) {
                showNotification('كلمة المرور وتأكيدها غير متطابقتين', 'error');
                return;
            }

            if (newPassword.length < 6) {
                showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
                return;
            }
        }

        // التحقق من عدم تكرار اسم المستخدم
        if (username !== user.username) {
            const users = db.getTable('users');
            const existingUser = users.find(u => u.username === username && u.id !== userId);

            if (existingUser) {
                showNotification('اسم المستخدم موجود بالفعل', 'error');
                return;
            }
        }

        // تحديث بيانات المستخدم
        const updates = {
            username: username,
            fullName: fullName,
            role: role,
            permissions: getDefaultPermissions(role),
            isActive: isActive,
            updatedAt: new Date().toISOString()
        };

        // تحديث كلمة المرور إذا تم إدخالها
        if (newPassword) {
            updates.password = hashPassword(newPassword);
        }

        // حفظ التحديثات
        const success = db.update('users', userId, updates);

        if (success) {
            showNotification('تم تحديث المستخدم بنجاح', 'success');
            closeModal();
            loadUsersGrid();

            // تحديث المستخدم الحالي إذا كان هو نفسه
            if (currentUser && currentUser.id === userId) {
                currentUser = { ...currentUser, ...updates };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                updateUserDisplay();
            }
        } else {
            showNotification('خطأ في تحديث المستخدم', 'error');
        }

    } catch (error) {
        console.error('خطأ في تحديث المستخدم:', error);
        showNotification('خطأ في تحديث المستخدم', 'error');
    }
}

// تبديل حالة المستخدم
function toggleUserStatus(userId) {
    const user = db.findById('users', userId);
    if (!user) {
        showNotification('المستخدم غير موجود', 'error');
        return;
    }

    if (user.username === 'admin') {
        showNotification('لا يمكن تعديل حالة المدير الرئيسي', 'error');
        return;
    }

    const newStatus = !user.isActive;
    const action = newStatus ? 'تفعيل' : 'إيقاف';

    if (confirm(`هل أنت متأكد من ${action} هذا المستخدم؟`)) {
        const success = db.update('users', userId, {
            isActive: newStatus,
            updatedAt: new Date().toISOString()
        });

        if (success) {
            showNotification(`تم ${action} المستخدم بنجاح`, 'success');
            loadUsersGrid();
        } else {
            showNotification(`خطأ في ${action} المستخدم`, 'error');
        }
    }
}

// حذف المستخدم
function deleteUser(userId) {
    const user = db.findById('users', userId);
    if (!user) {
        showNotification('المستخدم غير موجود', 'error');
        return;
    }

    if (user.username === 'admin') {
        showNotification('لا يمكن حذف المدير الرئيسي', 'error');
        return;
    }

    if (confirm(`هل أنت متأكد من حذف المستخدم "${user.fullName}"؟\nهذا الإجراء لا يمكن التراجع عنه.`)) {
        const success = db.delete('users', userId);

        if (success) {
            showNotification('تم حذف المستخدم بنجاح', 'success');
            loadUsersGrid();
        } else {
            showNotification('خطأ في حذف المستخدم', 'error');
        }
    }
}

// تحميل قسم المنتجات
function loadProductsSection() {
    const section = document.getElementById('products');
    if (!section) return;
    
    section.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-box"></i> إدارة المنتجات</h2>
            <button class="btn btn-primary" onclick="showAddProductModal()">
                <i class="fas fa-plus"></i>
                إضافة منتج جديد
            </button>
        </div>
        
        <div class="filters-container">
            <div class="filter-group search-filter-container">
                <label class="filter-label">البحث في المنتجات</label>
                <input type="text" id="productSearch" class="search-filter-input" placeholder="ابحث بالاسم أو الباركود..." onkeyup="searchProducts()">
                <i class="fas fa-search search-filter-icon"></i>
            </div>

            <div class="filter-group">
                <label class="filter-label">الفئة</label>
                <select id="categoryFilter" class="filter-select" onchange="filterProducts()">
                    <option value="">جميع الفئات</option>
                </select>
            </div>

            <div class="filter-actions">
                <button class="filter-btn secondary" onclick="clearProductFilters()">
                    <i class="fas fa-times"></i>
                    مسح الفلاتر
                </button>
            </div>
        </div>
        
        <div class="products-grid" id="productsGrid">
            <div class="loading">جاري تحميل المنتجات...</div>
        </div>
    `;
    
    loadProducts();
    loadCategories();
}

// مسح فلاتر المنتجات
function clearProductFilters() {
    document.getElementById('productSearch').value = '';
    document.getElementById('categoryFilter').value = '';
    loadProducts();
}

// تحميل المنتجات
function loadProducts() {
    try {
        const products = db.getTable('products');
        const grid = document.getElementById('productsGrid');
        
        if (!grid) return;
        
        if (products.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <h3>لا توجد منتجات</h3>
                    <p>ابدأ بإضافة منتجات جديدة</p>
                    <button class="btn btn-primary" onclick="showAddProductModal()">
                        إضافة منتج جديد
                    </button>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = products.map(product => `
            <div class="product-card" data-category="${product.category || 'general'}">
                <img class="product-image" src="${getProductImage(product)}" alt="${product.name}" loading="lazy">

                <div class="product-header">
                    <h3>${product.name}</h3>
                    <div class="product-actions">
                        <button class="btn-icon btn-info" onclick="showProductStockStatus('${product.id}')" title="حالة المخزون">
                            <i class="fas fa-warehouse"></i>
                        </button>
                        <button class="btn-icon" onclick="editProduct('${product.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteProduct('${product.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>

                <div class="product-info">
                    <div class="product-price">
                        <span class="label">السعر:</span>
                        <span class="value">${formatCurrency(product.price)}</span>
                    </div>

                    <div class="product-quantity ${product.quantity <= (product.minQuantity || 5) ? 'low-stock' : ''}">
                        <span class="label">الكمية:</span>
                        <span class="value">${db.toArabicNumbers(product.quantity)}</span>
                    </div>

                    <div class="product-category">
                        <span class="label">الفئة:</span>
                        <span class="value">${getCategoryName(product.category)}</span>
                    </div>
                </div>

                ${product.description ? `<div class="product-description">${product.description}</div>` : ''}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('خطأ في تحميل المنتجات:', error);
        showNotification('خطأ في تحميل المنتجات', 'error');
    }
}

// تحميل الفئات
function loadCategories() {
    try {
        const categories = db.getTable('categories');
        const filter = document.getElementById('categoryFilter');
        
        if (!filter) return;
        
        filter.innerHTML = '<option value="">جميع الفئات</option>' +
            categories.map(category => 
                `<option value="${category.id}">${category.name}</option>`
            ).join('');
            
    } catch (error) {
        console.error('خطأ في تحميل الفئات:', error);
    }
}

// الحصول على اسم الفئة
function getCategoryName(categoryId) {
    const categories = db.getTable('categories');
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'عام';
}

// البحث في المنتجات
function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productName = card.querySelector('h3').textContent.toLowerCase();
        const productDescription = card.querySelector('.product-description');
        const description = productDescription ? productDescription.textContent.toLowerCase() : '';
        
        if (productName.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// فلترة المنتجات حسب الفئة
function filterProducts() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (!selectedCategory || cardCategory === selectedCategory) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// عرض نافذة إضافة منتج
function showAddProductModal() {
    const categories = db.getTable('categories');
    const suppliers = db.getTable('suppliers');

    const content = `
        <form id="productForm" onsubmit="saveProduct(event)">
            <div class="form-grid">
                <div class="form-group">
                    <label for="productName">اسم المنتج *</label>
                    <input type="text" id="productName" required>
                </div>

                <div class="form-group">
                    <label for="productPrice">السعر *</label>
                    <input type="number" id="productPrice" step="0.01" min="0" required>
                </div>

                <div class="form-group">
                    <label for="productQuantity">الكمية *</label>
                    <input type="number" id="productQuantity" min="0" required>
                </div>

                <div class="form-group">
                    <label for="productMinQuantity">الحد الأدنى للكمية</label>
                    <input type="number" id="productMinQuantity" min="0" value="5">
                </div>

                <div class="form-group">
                    <label for="productCategory">الفئة</label>
                    <select id="productCategory">
                        <option value="">اختر فئة</option>
                        ${categories.map(cat =>
                            `<option value="${cat.id}">${cat.name}</option>`
                        ).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label for="productSupplier">المورد</label>
                    <select id="productSupplier">
                        <option value="">اختر مورد</option>
                        ${suppliers.map(supplier =>
                            `<option value="${supplier.id}">${supplier.name}</option>`
                        ).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label for="productBarcode">الباركود</label>
                    <div class="barcode-input-group">
                        <input type="text" id="productBarcode" placeholder="أدخل الباركود أو اتركه فارغاً للتوليد التلقائي">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="generateBarcode()" title="توليد باركود">
                            <i class="fas fa-barcode"></i>
                            توليد
                        </button>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label for="productDescription">الوصف</label>
                <textarea id="productDescription" rows="3"></textarea>
            </div>

            <div class="form-group">
                <label for="productImage">صورة المنتج</label>
                <div class="image-upload-container">
                    <div class="image-preview">
                        <img id="productImagePreview" src="${DEFAULT_PRODUCT_IMAGE}" alt="معاينة الصورة">
                        <div class="image-overlay">
                            <i class="fas fa-camera"></i>
                            <span>اختر صورة</span>
                        </div>
                    </div>
                    <input type="file" id="productImage" accept="image/jpeg,image/jpg,image/png,image/webp" onchange="previewImage(this, 'productImagePreview')">
                    <div class="image-info">
                        <small>الصيغ المدعومة: JPG, PNG, WebP (حد أقصى 5MB)</small>
                    </div>
                </div>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    حفظ المنتج
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('إضافة منتج جديد', content);
}

// توليد باركود تلقائي
function generateBarcode() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const barcode = `${timestamp}${random}`.slice(-13); // 13 رقم للباركود

    const barcodeInput = document.getElementById('productBarcode');
    if (barcodeInput) {
        barcodeInput.value = barcode;
        showNotification('تم توليد الباركود بنجاح', 'success');
    }
}

// حفظ المنتج
function saveProduct(event) {
    event.preventDefault();
    
    try {
        // الحصول على الصورة المضغوطة
        const imagePreview = document.getElementById('productImagePreview');
        const productImage = imagePreview && imagePreview.dataset.compressed ?
            imagePreview.dataset.compressed : DEFAULT_PRODUCT_IMAGE;

        const formData = {
            name: document.getElementById('productName').value.trim(),
            price: parseFloat(document.getElementById('productPrice').value),
            quantity: parseInt(document.getElementById('productQuantity').value),
            minQuantity: parseInt(document.getElementById('productMinQuantity').value) || 5,
            category: document.getElementById('productCategory').value,
            supplierId: document.getElementById('productSupplier').value,
            barcode: document.getElementById('productBarcode').value.trim(),
            description: document.getElementById('productDescription').value.trim(),
            image: productImage
        };
        
        // التحقق من صحة البيانات
        if (!formData.name) {
            showNotification('يرجى إدخال اسم المنتج', 'error');
            return;
        }
        
        if (formData.price <= 0) {
            showNotification('يرجى إدخال سعر صحيح', 'error');
            return;
        }
        
        if (formData.quantity < 0) {
            showNotification('يرجى إدخال كمية صحيحة', 'error');
            return;
        }
        
        // التحقق من عدم تكرار الباركود
        if (formData.barcode) {
            const products = db.getTable('products');
            const existingProduct = products.find(p => p.barcode === formData.barcode);
            if (existingProduct) {
                showNotification('الباركود موجود مسبقاً', 'error');
                return;
            }
        }
        
        // حفظ المنتج
        const savedProduct = db.insert('products', formData);
        
        if (savedProduct) {
            showNotification('تم حفظ المنتج بنجاح', 'success');
            closeModal();
            loadProducts();
            updateDashboard();
        } else {
            showNotification('خطأ في حفظ المنتج', 'error');
        }
        
    } catch (error) {
        console.error('خطأ في حفظ المنتج:', error);
        showNotification('خطأ في حفظ المنتج', 'error');
    }
}

// تعديل منتج
function editProduct(productId) {
    const product = db.findById('products', productId);
    if (!product) {
        showNotification('المنتج غير موجود', 'error');
        return;
    }
    
    const categories = db.getTable('categories');
    const suppliers = db.getTable('suppliers');
    
    const content = `
        <form id="productForm" onsubmit="updateProduct(event, '${productId}')">
            <div class="form-grid">
                <div class="form-group">
                    <label for="productName">اسم المنتج *</label>
                    <input type="text" id="productName" value="${product.name}" required>
                </div>
                
                <div class="form-group">
                    <label for="productPrice">السعر *</label>
                    <input type="number" id="productPrice" step="0.01" min="0" value="${product.price}" required>
                </div>
                
                <div class="form-group">
                    <label for="productQuantity">الكمية *</label>
                    <input type="number" id="productQuantity" min="0" value="${product.quantity}" required>
                </div>
                
                <div class="form-group">
                    <label for="productMinQuantity">الحد الأدنى للكمية</label>
                    <input type="number" id="productMinQuantity" min="0" value="${product.minQuantity || 5}">
                </div>
                
                <div class="form-group">
                    <label for="productCategory">الفئة</label>
                    <select id="productCategory">
                        <option value="">اختر فئة</option>
                        ${categories.map(cat =>
                            `<option value="${cat.id}" ${cat.id === product.category ? 'selected' : ''}>${cat.name}</option>`
                        ).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label for="productSupplier">المورد</label>
                    <select id="productSupplier">
                        <option value="">اختر مورد</option>
                        ${suppliers.map(supplier =>
                            `<option value="${supplier.id}" ${supplier.id === product.supplierId ? 'selected' : ''}>${supplier.name}</option>`
                        ).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label for="productBarcode">الباركود</label>
                    <div class="barcode-input-group">
                        <input type="text" id="productBarcode" value="${product.barcode || ''}" placeholder="أدخل الباركود أو اتركه فارغاً للتوليد التلقائي">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="generateBarcode()" title="توليد باركود">
                            <i class="fas fa-barcode"></i>
                            توليد
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label for="productDescription">الوصف</label>
                <textarea id="productDescription" rows="3">${product.description || ''}</textarea>
            </div>

            <div class="form-group">
                <label for="productImageEdit">صورة المنتج</label>
                <div class="image-upload-container">
                    <div class="image-preview">
                        <img id="productImagePreviewEdit" src="${getProductImage(product)}" alt="معاينة الصورة">
                        <div class="image-overlay">
                            <i class="fas fa-camera"></i>
                            <span>تغيير الصورة</span>
                        </div>
                    </div>
                    <input type="file" id="productImageEdit" accept="image/jpeg,image/jpg,image/png,image/webp" onchange="previewImage(this, 'productImagePreviewEdit')">
                    <div class="image-info">
                        <small>الصيغ المدعومة: JPG, PNG, WebP (حد أقصى 5MB)</small>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    تحديث المنتج
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;
    
    showModal('تعديل المنتج', content);
}

// عرض حالة المخزون للمنتج
function showProductStockStatus(productId) {
    const product = db.findById('products', productId);
    if (!product) {
        showNotification('المنتج غير موجود', 'error');
        return;
    }

    const warehouses = db.getTable('warehouses');
    const activeWarehouses = warehouses.filter(w => w.isActive);

    // حساب إجمالي الكمية عبر جميع المخازن
    let totalQuantity = 0;
    const warehouseStocks = activeWarehouses.map(warehouse => {
        const quantity = product.warehouses?.[warehouse.id] || 0;
        totalQuantity += quantity;
        return {
            warehouseName: warehouse.name,
            quantity: quantity
        };
    });

    // إضافة المخزن الرئيسي إذا لم يكن موجوداً في قائمة المخازن
    const mainStockQuantity = product.quantity || 0;
    const hasMainWarehouse = activeWarehouses.some(w => w.name === 'المخزن الرئيسي');

    if (!hasMainWarehouse) {
        warehouseStocks.unshift({
            warehouseName: 'المخزن الرئيسي',
            quantity: mainStockQuantity
        });
        totalQuantity += mainStockQuantity;
    }

    const content = `
        <div class="stock-status-container">
            <div class="product-info-header">
                <div class="product-image-small">
                    <img src="${getProductImage(product)}" alt="${product.name}">
                </div>
                <div class="product-details">
                    <h3>${product.name}</h3>
                    <p class="product-price">${formatCurrency(product.price)}</p>
                    ${product.barcode ? `<p class="product-barcode">الباركود: ${product.barcode}</p>` : ''}
                </div>
            </div>

            <div class="stock-table-container">
                <h4>توزيع المخزون عبر المخازن</h4>
                <table class="stock-status-table">
                    <thead>
                        <tr>
                            <th>المخزن</th>
                            <th>الكمية المتاحة</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${warehouseStocks.map(stock => {
                            const status = stock.quantity <= (product.minQuantity || 5) ? 'منخفض' :
                                          stock.quantity === 0 ? 'نفد' : 'متوفر';
                            const statusClass = stock.quantity <= (product.minQuantity || 5) ? 'low-stock' :
                                               stock.quantity === 0 ? 'out-of-stock' : 'in-stock';

                            return `
                                <tr>
                                    <td>${stock.warehouseName}</td>
                                    <td class="quantity-cell">${db.toArabicNumbers(stock.quantity)}</td>
                                    <td><span class="status-badge ${statusClass}">${status}</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td><strong>الإجمالي</strong></td>
                            <td class="quantity-cell"><strong>${db.toArabicNumbers(totalQuantity)}</strong></td>
                            <td>
                                <span class="status-badge ${totalQuantity <= (product.minQuantity || 5) ? 'low-stock' : 'in-stock'}">
                                    ${totalQuantity <= (product.minQuantity || 5) ? 'مخزون منخفض' : 'مخزون جيد'}
                                </span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div class="stock-summary">
                <div class="summary-item">
                    <span class="label">الحد الأدنى للمخزون:</span>
                    <span class="value">${db.toArabicNumbers(product.minQuantity || 5)}</span>
                </div>
                <div class="summary-item">
                    <span class="label">آخر تحديث:</span>
                    <span class="value">${formatDate(product.updatedAt || product.createdAt)}</span>
                </div>
            </div>

            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="closeModal()">
                    إغلاق
                </button>
            </div>
        </div>
    `;

    showModal('حالة المخزون - ' + product.name, content);
}

// تحديث منتج
function updateProduct(event, productId) {
    event.preventDefault();
    
    try {
        // الحصول على الصورة المحدثة
        const imagePreviewEdit = document.getElementById('productImagePreviewEdit');
        const currentProduct = db.findById('products', productId);
        let productImage = currentProduct.image || DEFAULT_PRODUCT_IMAGE;

        // إذا تم تحديد صورة جديدة
        if (imagePreviewEdit && imagePreviewEdit.dataset.compressed) {
            productImage = imagePreviewEdit.dataset.compressed;
        }

        const updates = {
            name: document.getElementById('productName').value.trim(),
            price: parseFloat(document.getElementById('productPrice').value),
            quantity: parseInt(document.getElementById('productQuantity').value),
            minQuantity: parseInt(document.getElementById('productMinQuantity').value) || 5,
            category: document.getElementById('productCategory').value,
            supplierId: document.getElementById('productSupplier').value,
            barcode: document.getElementById('productBarcode').value.trim(),
            description: document.getElementById('productDescription').value.trim(),
            image: productImage
        };
        
        // التحقق من صحة البيانات
        if (!updates.name) {
            showNotification('يرجى إدخال اسم المنتج', 'error');
            return;
        }
        
        if (updates.price <= 0) {
            showNotification('يرجى إدخال سعر صحيح', 'error');
            return;
        }
        
        if (updates.quantity < 0) {
            showNotification('يرجى إدخال كمية صحيحة', 'error');
            return;
        }
        
        // التحقق من عدم تكرار الباركود
        if (updates.barcode) {
            const products = db.getTable('products');
            const existingProduct = products.find(p => p.barcode === updates.barcode && p.id !== productId);
            if (existingProduct) {
                showNotification('الباركود موجود مسبقاً', 'error');
                return;
            }
        }
        
        // تحديث المنتج
        const updatedProduct = db.update('products', productId, updates);
        
        if (updatedProduct) {
            showNotification('تم تحديث المنتج بنجاح', 'success');
            closeModal();
            loadProducts();
            updateDashboard();
        } else {
            showNotification('خطأ في تحديث المنتج', 'error');
        }
        
    } catch (error) {
        console.error('خطأ في تحديث المنتج:', error);
        showNotification('خطأ في تحديث المنتج', 'error');
    }
}

// حذف منتج
function deleteProduct(productId) {
    if (!confirmDelete('هل أنت متأكد من حذف هذا المنتج؟')) {
        return;
    }

    try {
        const success = db.delete('products', productId);

        if (success) {
            showNotification('تم حذف المنتج بنجاح', 'success');
            loadProducts();
            updateDashboard();
        } else {
            showNotification('خطأ في حذف المنتج', 'error');
        }

    } catch (error) {
        console.error('خطأ في حذف المنتج:', error);
        showNotification('خطأ في حذف المنتج', 'error');
    }
}

// تحميل قسم المبيعات
function loadSalesSection() {
    const section = document.getElementById('sales');
    if (!section) return;

    section.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-shopping-cart"></i> نقطة البيع</h2>
            <div class="sales-tabs">
                <button class="tab-btn active" onclick="showSalesTab('pos')">
                    <i class="fas fa-cash-register"></i>
                    نقطة البيع
                </button>
                <button class="tab-btn" onclick="showSalesTab('history')">
                    <i class="fas fa-history"></i>
                    الفواتير السابقة
                </button>
            </div>
        </div>

        <!-- تبويب نقطة البيع -->
        <div id="posTab" class="sales-tab active">
            <div class="sales-info">
                <div class="customer-selection">
                    <label for="customerSelect">العميل:</label>
                    <select id="customerSelect" onchange="updateCustomerInfo()"></select>
                </div>
                <div id="customerBalance" class="customer-balance-display"></div>
            </div>

        <div class="new-sales-layout">
            <!-- قسم اختيار المنتجات -->
            <div class="product-selection-panel">
                <div class="product-selector">
                    <label for="productDropdown">اختر المنتج:</label>
                    <select id="productDropdown" onchange="selectProductFromDropdown()">
                        <option value="">-- اختر منتج --</option>
                    </select>
                </div>

                <div class="barcode-search">
                    <input type="text" id="barcodeInput" placeholder="مسح الباركود أو البحث السريع..." onkeydown="handleBarcodeSearch(event)">
                    <i class="fas fa-barcode"></i>
                </div>
            </div>

            <!-- سلة المشتريات المركزية -->
            <div class="central-cart-panel">
                <div class="cart-header">
                    <h3><i class="fas fa-shopping-cart"></i> سلة المشتريات</h3>
                    <button class="btn btn-secondary btn-sm" onclick="clearCart()">
                        <i class="fas fa-trash"></i>
                        مسح الكل
                    </button>
                </div>

                <div class="cart-items" id="cartItems">
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <p>السلة فارغة</p>
                        <p class="empty-cart-hint">اختر منتج من القائمة أعلاه لإضافته</p>
                    </div>
                </div>

                <!-- ضوابط الضريبة والخصم -->
                <div class="tax-discount-controls">
                    <div class="control-group">
                        <label for="customTaxRate">ضريبة مخصصة (%):</label>
                        <input type="number" id="customTaxRate" step="0.01" min="0" max="100" placeholder="افتراضي" oninput="updateCartSummary()" onchange="updateCartSummary()">
                    </div>
                    <div class="control-group">
                        <label for="discountRate">خصم (%):</label>
                        <input type="number" id="discountRate" step="0.01" min="0" max="100" placeholder="0" oninput="updateCartSummary()" onchange="updateCartSummary()">
                    </div>
                    <div class="control-group">
                        <label for="discountAmount">خصم ثابت (د.ك):</label>
                        <input type="number" id="discountAmount" step="0.001" min="0" placeholder="0" oninput="updateCartSummary()" onchange="updateCartSummary()">
                    </div>
                </div>

                <div class="cart-summary">
                    <div class="summary-row">
                        <span>المجموع الفرعي:</span>
                        <span id="subtotal">٠.٠٠ د.ك</span>
                    </div>
                    <div class="summary-row" id="discountRow" style="display: none;">
                        <span>الخصم:</span>
                        <span id="discountAmountDisplay">٠.٠٠ د.ك</span>
                    </div>
                    <div class="summary-row" id="afterDiscountRow" style="display: none;">
                        <span>المجموع بعد الخصم:</span>
                        <span id="afterDiscountAmount">٠.٠٠ د.ك</span>
                    </div>
                    <div class="summary-row">
                        <span>الضريبة (<span id="taxRateDisplay">١٥</span>%):</span>
                        <span id="taxAmount">٠.٠٠ د.ك</span>
                    </div>
                    <div class="summary-row total">
                        <span>المجموع الكلي:</span>
                        <span id="totalAmount">٠.٠٠ د.ك</span>
                    </div>
                </div>

                <div class="payment-section">
                    <div class="payment-method">
                        <label>طريقة الدفع:</label>
                        <select id="paymentMethod" onchange="updatePaymentMethod()">
                            <option value="cash">نقداً</option>
                            <option value="credit">على الحساب</option>
                        </select>
                    </div>

                    <div class="payment-amount" id="paymentAmountSection">
                        <label for="paidAmount">المبلغ المدفوع:</label>
                        <input type="number" id="paidAmount" step="0.01" min="0" oninput="calculateChange()" onchange="calculateChange()">
                        <div class="change-amount" id="changeAmount"></div>
                    </div>

                    <button class="btn btn-primary btn-large" onclick="completeSale()" id="completeSaleBtn">
                        <i class="fas fa-check"></i>
                        إتمام البيع
                    </button>
                </div>
            </div>
        </div>
        </div>

        <!-- تبويب الفواتير السابقة -->
        <div id="historyTab" class="sales-tab">
            <div class="filters-container">
                <div class="filter-group search-filter-container">
                    <label class="filter-label">البحث في الفواتير</label>
                    <input type="text" id="invoiceSearch" class="search-filter-input" placeholder="ابحث برقم الفاتورة أو العميل..." onkeyup="searchInvoices()">
                    <i class="fas fa-search search-filter-icon"></i>
                </div>

                <div class="filter-group">
                    <label class="filter-label">العميل</label>
                    <select id="customerFilter" class="filter-select" onchange="filterInvoices()">
                        <option value="">جميع العملاء</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label class="filter-label">من تاريخ</label>
                    <input type="date" id="dateFromFilter" class="date-picker-input" onchange="filterInvoices()">
                </div>

                <div class="filter-group">
                    <label class="filter-label">إلى تاريخ</label>
                    <input type="date" id="dateToFilter" class="date-picker-input" onchange="filterInvoices()">
                </div>

                <div class="filter-actions">
                    <button class="filter-btn secondary" onclick="clearInvoiceFilters()">
                        <i class="fas fa-times"></i>
                        مسح الفلاتر
                    </button>
                </div>
            </div>

            <div class="invoices-grid" id="invoicesGrid">
                <div class="loading">جاري تحميل الفواتير...</div>
            </div>
        </div>
    `;

    loadProductsDropdown();
    loadCustomers();
    updateTaxRate();
    loadInvoicesHistory();
}

// إظهار تبويب المبيعات
function showSalesTab(tabName) {
    // إخفاء جميع التبويبات
    const tabs = document.querySelectorAll('.sales-tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    // إزالة الفئة النشطة من جميع الأزرار
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));

    // إظهار التبويب المحدد
    if (tabName === 'pos') {
        document.getElementById('posTab').classList.add('active');
        document.querySelector('.tab-btn[onclick="showSalesTab(\'pos\')"]').classList.add('active');
        // تحديث حساب المبلغ المتبقي عند إظهار نقطة البيع
        setTimeout(() => {
            updateCartSummary();
            calculateChange();
        }, 100);
    } else if (tabName === 'history') {
        document.getElementById('historyTab').classList.add('active');
        document.querySelector('.tab-btn[onclick="showSalesTab(\'history\')"]').classList.add('active');
        loadInvoicesHistory();
    }
}

// تحميل تاريخ الفواتير
function loadInvoicesHistory() {
    try {
        const sales = db.getTable('sales');
        const customers = db.getTable('customers');
        const grid = document.getElementById('invoicesGrid');
        const customerFilter = document.getElementById('customerFilter');

        if (!grid) return;

        // تحميل قائمة العملاء في الفلتر
        if (customerFilter) {
            customerFilter.innerHTML = `
                <option value="">جميع العملاء</option>
                ${customers.map(customer => `
                    <option value="${customer.id}">${customer.name}</option>
                `).join('')}
            `;
        }

        if (sales.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <h3>لا توجد فواتير</h3>
                    <p>لم يتم إنشاء أي فواتير بعد</p>
                </div>
            `;
            return;
        }

        // ترتيب الفواتير حسب التاريخ (الأحدث أولاً)
        const sortedSales = sales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        grid.innerHTML = sortedSales.map(sale => {
            const customer = customers.find(c => c.id === sale.customerId);
            const customerName = customer ? customer.name : 'عميل محذوف';

            return `
                <div class="invoice-card">
                    <div class="invoice-header">
                        <div class="invoice-info">
                            <h3>فاتورة #${sale.id.substring(0, 8)}</h3>
                            <p class="invoice-date">${new Date(sale.createdAt).toLocaleDateString('ar-SA')}</p>
                            <p class="invoice-time">${new Date(sale.createdAt).toLocaleTimeString('ar-SA')}</p>
                        </div>
                        <div class="invoice-total">
                            <span class="total-amount">${formatCurrency(sale.total)}</span>
                            <span class="payment-method">${sale.paymentMethod === 'cash' ? 'نقداً' : 'على الحساب'}</span>
                        </div>
                    </div>

                    <div class="invoice-details">
                        <div class="detail-item">
                            <i class="fas fa-user"></i>
                            <span>العميل: ${customerName}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-shopping-cart"></i>
                            <span>عدد الأصناف: ${db.toArabicNumbers(sale.items.length)}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-tag"></i>
                            <span>الحالة: ${sale.status === 'completed' ? 'مكتملة' : 'معلقة'}</span>
                        </div>
                    </div>

                    <div class="invoice-actions">
                        <button class="btn btn-sm btn-primary" onclick="viewInvoiceDetails('${sale.id}')" title="عرض التفاصيل">
                            <i class="fas fa-eye"></i>
                            مشاهدة
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="editInvoice('${sale.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                            تعديل
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteInvoice('${sale.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                            حذف
                        </button>
                        <button class="btn btn-sm btn-info" onclick="printInvoice('${sale.id}')" title="طباعة">
                            <i class="fas fa-print"></i>
                            طباعة
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('خطأ في تحميل تاريخ الفواتير:', error);
        const grid = document.getElementById('invoicesGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>خطأ في تحميل الفواتير</p>
                </div>
            `;
        }
    }
}

// البحث في الفواتير
function searchInvoices() {
    filterInvoices();
}

// تصفية الفواتير
function filterInvoices() {
    const searchTerm = document.getElementById('invoiceSearch').value.toLowerCase();
    const customerFilter = document.getElementById('customerFilter').value;
    const dateFrom = document.getElementById('dateFromFilter').value;
    const dateTo = document.getElementById('dateToFilter').value;

    const sales = db.getTable('sales');
    const customers = db.getTable('customers');

    let filteredSales = sales.filter(sale => {
        // البحث النصي
        const customer = customers.find(c => c.id === sale.customerId);
        const customerName = customer ? customer.name.toLowerCase() : '';
        const invoiceId = sale.id.toLowerCase();

        const matchesSearch = invoiceId.includes(searchTerm) ||
                            customerName.includes(searchTerm) ||
                            sale.total.toString().includes(searchTerm);

        // تصفية العميل
        const matchesCustomer = !customerFilter || sale.customerId === customerFilter;

        // تصفية التاريخ
        const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
        const matchesDateFrom = !dateFrom || saleDate >= dateFrom;
        const matchesDateTo = !dateTo || saleDate <= dateTo;

        return matchesSearch && matchesCustomer && matchesDateFrom && matchesDateTo;
    });

    displayFilteredInvoices(filteredSales);
}

// مسح فلاتر الفواتير
function clearInvoiceFilters() {
    document.getElementById('invoiceSearch').value = '';
    document.getElementById('customerFilter').value = '';
    document.getElementById('dateFromFilter').value = '';
    document.getElementById('dateToFilter').value = '';
    loadInvoicesHistory();
}

// عرض الفواتير المفلترة
function displayFilteredInvoices(sales) {
    const grid = document.getElementById('invoicesGrid');
    const customers = db.getTable('customers');

    if (!grid) return;

    if (sales.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>لا توجد نتائج</h3>
                <p>لم يتم العثور على فواتير مطابقة للبحث</p>
            </div>
        `;
        return;
    }

    // ترتيب الفواتير حسب التاريخ (الأحدث أولاً)
    const sortedSales = sales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    grid.innerHTML = sortedSales.map(sale => {
        const customer = customers.find(c => c.id === sale.customerId);
        const customerName = customer ? customer.name : 'عميل محذوف';

        return `
            <div class="invoice-card">
                <div class="invoice-header">
                    <div class="invoice-info">
                        <h3>فاتورة #${sale.id.substring(0, 8)}</h3>
                        <p class="invoice-date">${new Date(sale.createdAt).toLocaleDateString('ar-SA')}</p>
                        <p class="invoice-time">${new Date(sale.createdAt).toLocaleTimeString('ar-SA')}</p>
                    </div>
                    <div class="invoice-total">
                        <span class="total-amount">${formatCurrency(sale.total)}</span>
                        <span class="payment-method">${sale.paymentMethod === 'cash' ? 'نقداً' : 'على الحساب'}</span>
                    </div>
                </div>

                <div class="invoice-details">
                    <div class="detail-item">
                        <i class="fas fa-user"></i>
                        <span>العميل: ${customerName}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-shopping-cart"></i>
                        <span>عدد الأصناف: ${db.toArabicNumbers(sale.items.length)}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-tag"></i>
                        <span>الحالة: ${sale.status === 'completed' ? 'مكتملة' : 'معلقة'}</span>
                    </div>
                </div>

                <div class="invoice-actions">
                    <button class="btn btn-sm btn-primary" onclick="viewInvoiceDetails('${sale.id}')" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                        مشاهدة
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="editInvoice('${sale.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                        تعديل
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteInvoice('${sale.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                        حذف
                    </button>
                    <button class="btn btn-sm btn-info" onclick="printInvoice('${sale.id}')" title="طباعة">
                        <i class="fas fa-print"></i>
                        طباعة
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// عرض تفاصيل الفاتورة
function viewInvoiceDetails(saleId) {
    const sale = db.findById('sales', saleId);
    if (!sale) {
        showNotification('الفاتورة غير موجودة', 'error');
        return;
    }

    const customers = db.getTable('customers');
    const customer = customers.find(c => c.id === sale.customerId);
    const customerName = customer ? customer.name : 'عميل محذوف';

    const content = `
        <div class="invoice-details-view">
            <div class="invoice-summary">
                <h3>فاتورة #${sale.id.substring(0, 8)}</h3>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="label">التاريخ:</span>
                        <span class="value">${new Date(sale.createdAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">الوقت:</span>
                        <span class="value">${new Date(sale.createdAt).toLocaleTimeString('ar-SA')}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">العميل:</span>
                        <span class="value">${customerName}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">طريقة الدفع:</span>
                        <span class="value">${sale.paymentMethod === 'cash' ? 'نقداً' : 'على الحساب'}</span>
                    </div>
                </div>
            </div>

            <div class="invoice-items">
                <h4>أصناف الفاتورة</h4>
                <div class="items-table">
                    <div class="table-header">
                        <span>الصنف</span>
                        <span>الكمية</span>
                        <span>السعر</span>
                        <span>المجموع</span>
                    </div>
                    ${sale.items.map(item => `
                        <div class="table-row">
                            <span>${item.name}</span>
                            <span>${db.toArabicNumbers(item.quantity)}</span>
                            <span>${formatCurrency(item.price)}</span>
                            <span>${formatCurrency(item.total)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="invoice-totals">
                <div class="totals-grid">
                    <div class="total-row">
                        <span>المجموع الفرعي:</span>
                        <span>${formatCurrency(sale.subtotal)}</span>
                    </div>
                    ${sale.discountAmount > 0 ? `
                        <div class="total-row">
                            <span>الخصم:</span>
                            <span>${formatCurrency(sale.discountAmount)}</span>
                        </div>
                        <div class="total-row">
                            <span>المجموع بعد الخصم:</span>
                            <span>${formatCurrency(sale.afterDiscountAmount)}</span>
                        </div>
                    ` : ''}
                    <div class="total-row">
                        <span>الضريبة (${db.toArabicNumbers(sale.taxRate)}%):</span>
                        <span>${formatCurrency(sale.taxAmount)}</span>
                    </div>
                    <div class="total-row final-total">
                        <span>المجموع الكلي:</span>
                        <span>${formatCurrency(sale.total)}</span>
                    </div>
                    ${sale.paymentMethod === 'cash' ? `
                        <div class="total-row">
                            <span>المبلغ المدفوع:</span>
                            <span>${formatCurrency(sale.paidAmount)}</span>
                        </div>
                        <div class="total-row">
                            <span>الباقي:</span>
                            <span>${formatCurrency(sale.change)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    showModal('تفاصيل الفاتورة', content);
}

// حذف فاتورة
function deleteInvoice(saleId) {
    if (!confirmDelete('هل أنت متأكد من حذف هذه الفاتورة؟\nسيتم استرداد الكميات إلى المخزون.')) {
        return;
    }

    try {
        const sale = db.findById('sales', saleId);
        if (!sale) {
            showNotification('الفاتورة غير موجودة', 'error');
            return;
        }

        // استرداد الكميات إلى المخزون
        const products = db.getTable('products');
        sale.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                const newQuantity = product.quantity + item.quantity;
                db.update('products', item.productId, { quantity: newQuantity });
            }
        });

        // تحديث رصيد العميل إذا كان الدفع على الحساب
        if (sale.paymentMethod === 'credit') {
            const customers = db.getTable('customers');
            const customer = customers.find(c => c.id === sale.customerId);
            if (customer) {
                const newBalance = customer.balance - sale.total;
                db.update('customers', sale.customerId, { balance: newBalance });
            }
        }

        // حذف الفاتورة
        const success = db.delete('sales', saleId);

        if (success) {
            showNotification('تم حذف الفاتورة بنجاح', 'success');
            loadInvoicesHistory();
        } else {
            showNotification('خطأ في حذف الفاتورة', 'error');
        }

    } catch (error) {
        console.error('خطأ في حذف الفاتورة:', error);
        showNotification('خطأ في حذف الفاتورة', 'error');
    }
}

// تحميل المنتجات في القائمة المنسدلة
function loadProductsDropdown() {
    try {
        const products = db.getTable('products');
        const productDropdown = document.getElementById('productDropdown');

        if (!productDropdown) return;

        if (products.length === 0) {
            productDropdown.innerHTML = `
                <option value="">لا توجد منتجات متاحة</option>
            `;
            return;
        }

        // ترتيب المنتجات حسب الاسم وإظهار المتوفرة فقط
        const availableProducts = products.filter(product => product.quantity > 0);
        const sortedProducts = availableProducts.sort((a, b) => a.name.localeCompare(b.name, 'ar'));

        productDropdown.innerHTML = `
            <option value="">-- اختر منتج --</option>
            ${sortedProducts.map(product => `
                <option value="${product.id}" data-price="${product.price}" data-stock="${product.quantity}">
                    ${product.name} - ${formatCurrency(product.price)} - مخزون: ${db.toArabicNumbers(product.quantity)}
                </option>
            `).join('')}
        `;

    } catch (error) {
        console.error('خطأ في تحميل قائمة المنتجات:', error);
    }
}

// تغيير صورة المنتج في واجهة نقطة البيع
function changeProductImageInPOS(productId) {
    // إنشاء عنصر input مخفي لرفع الملف
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg,image/jpg,image/png,image/webp';
    fileInput.style.display = 'none';

    fileInput.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        // التحقق من نوع الملف
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showNotification('يرجى اختيار صورة بصيغة JPG أو PNG أو WebP', 'error');
            return;
        }

        // التحقق من حجم الملف (5MB كحد أقصى)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('حجم الصورة يجب أن يكون أقل من 5 ميجابايت', 'error');
            return;
        }

        // ضغط ورفع الصورة
        compressImage(file).then(compressedDataUrl => {
            const product = db.findById('products', productId);
            if (product) {
                product.image = compressedDataUrl;
                const success = db.update('products', productId, product);

                if (success) {
                    showNotification('تم تحديث صورة المنتج بنجاح', 'success');

                    // تحديث الصورة في واجهة نقطة البيع
                    const productImages = document.querySelectorAll(`img[data-product-id="${productId}"]`);
                    productImages.forEach(img => {
                        img.src = compressedDataUrl;
                    });

                    // تحديث الصورة في السلة إذا كان المنتج موجود
                    updateCartDisplay();

                } else {
                    showNotification('خطأ في تحديث صورة المنتج', 'error');
                }
            }
        }).catch(error => {
            console.error('خطأ في ضغط الصورة:', error);
            showNotification('خطأ في معالجة الصورة', 'error');
        });
    };

    // تشغيل حوار اختيار الملف
    fileInput.click();
}

// اختيار منتج من القائمة المنسدلة
function selectProductFromDropdown() {
    const dropdown = document.getElementById('productDropdown');
    const selectedProductId = dropdown.value;

    if (selectedProductId) {
        addToCart(selectedProductId);
        // إعادة تعيين القائمة المنسدلة
        dropdown.value = '';
    }
}

// تحميل العملاء
function loadCustomers() {
    try {
        const customers = db.getTable('customers');
        const customerSelect = document.getElementById('customerSelect');

        if (!customerSelect) return;

        customerSelect.innerHTML = customers.map(customer =>
            `<option value="${customer.id}" ${customer.id === 'guest' ? 'selected' : ''}>${customer.name}</option>`
        ).join('');

    } catch (error) {
        console.error('خطأ في تحميل العملاء:', error);
    }
}

// متغير سلة المشتريات
let cart = [];

// إضافة منتج للسلة
function addToCart(productId) {
    try {
        const product = db.findById('products', productId);
        if (!product) {
            showNotification('المنتج غير موجود', 'error');
            return;
        }

        if (product.quantity <= 0) {
            showNotification('المنتج غير متوفر في المخزون', 'error');
            return;
        }

        // البحث عن المنتج في السلة
        const existingItem = cart.find(item => item.productId === productId);

        if (existingItem) {
            if (existingItem.quantity >= product.quantity) {
                showNotification('لا يمكن إضافة كمية أكثر من المتوفر', 'warning');
                return;
            }
            existingItem.quantity++;
        } else {
            cart.push({
                productId: productId,
                name: product.name,
                price: product.price,
                quantity: 1,
                maxQuantity: product.quantity,
                image: getProductImage(product)
            });
        }

        updateCartDisplay();
        showNotification(`تم إضافة ${product.name} للسلة`, 'success');

    } catch (error) {
        console.error('خطأ في إضافة المنتج للسلة:', error);
        showNotification('خطأ في إضافة المنتج للسلة', 'error');
    }
}

// تحديث عرض السلة
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>السلة فارغة</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <img class="cart-item-image" src="${item.image || DEFAULT_PRODUCT_IMAGE}" alt="${item.name}" loading="lazy">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="item-price">${formatCurrency(item.price)}</p>
                    </div>
                </div>
                <div class="item-controls">
                    <button class="qty-btn" onclick="decreaseQuantity(${index})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${db.toArabicNumbers(item.quantity)}</span>
                    <button class="qty-btn" onclick="increaseQuantity(${index})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="item-total">
                    ${formatCurrency(item.price * item.quantity)}
                </div>
                <button class="remove-btn" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    updateCartSummary();
}

// زيادة الكمية
function increaseQuantity(index) {
    if (cart[index].quantity < cart[index].maxQuantity) {
        cart[index].quantity++;
        updateCartDisplay();
    } else {
        showNotification('لا يمكن إضافة كمية أكثر من المتوفر', 'warning');
    }
}

// تقليل الكمية
function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        updateCartDisplay();
    } else {
        removeFromCart(index);
    }
}

// إزالة من السلة
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
    showNotification('تم إزالة المنتج من السلة', 'info');
}

// مسح ضوابط الضرائب والخصومات
function clearTaxDiscountControls() {
    const customTaxRateInput = document.getElementById('customTaxRate');
    const discountRateInput = document.getElementById('discountRate');
    const discountAmountInput = document.getElementById('discountAmount');

    if (customTaxRateInput) customTaxRateInput.value = '';
    if (discountRateInput) discountRateInput.value = '';
    if (discountAmountInput) discountAmountInput.value = '';
}

// مسح السلة
function clearCart() {
    if (cart.length === 0) return;

    if (confirmDelete('هل أنت متأكد من مسح جميع المنتجات من السلة؟')) {
        cart = [];
        clearTaxDiscountControls();
        updateCartDisplay();
        updateCartSummary();
        showNotification('تم مسح السلة', 'info');
    }
}

// تحديث ملخص السلة
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // الحصول على قيم الضريبة والخصم المخصصة
    const customTaxRateInput = document.getElementById('customTaxRate');
    const discountRateInput = document.getElementById('discountRate');
    const discountAmountInput = document.getElementById('discountAmount');

    const settings = db.getTable('settings');
    const defaultTaxRate = settings.taxRate ?? 15;

    // تحديد نسبة الضريبة (مخصصة فقط - لا تطبيق تلقائي)
    let taxRate = 0;
    if (customTaxRateInput && customTaxRateInput.value !== '') {
        taxRate = parseFloat(customTaxRateInput.value) || 0;
    }

    // حساب الخصم
    let discountAmount = 0;
    if (discountAmountInput && discountAmountInput.value !== '') {
        // خصم ثابت
        discountAmount = parseFloat(discountAmountInput.value) || 0;
    } else if (discountRateInput && discountRateInput.value !== '') {
        // خصم نسبي
        const discountRate = parseFloat(discountRateInput.value) || 0;
        discountAmount = subtotal * (discountRate / 100);
    }

    // التأكد من أن الخصم لا يتجاوز المجموع الفرعي
    discountAmount = Math.min(discountAmount, subtotal);

    // حساب المجموع بعد الخصم
    const afterDiscountAmount = subtotal - discountAmount;

    // حساب الضريبة على المبلغ بعد الخصم
    const taxAmount = afterDiscountAmount * (taxRate / 100);

    // المجموع الكلي
    const total = afterDiscountAmount + taxAmount;

    // تحديث العناصر
    const subtotalElement = document.getElementById('subtotal');
    const discountAmountElement = document.getElementById('discountAmountDisplay');
    const afterDiscountElement = document.getElementById('afterDiscountAmount');
    const taxRateElement = document.getElementById('taxRateDisplay');
    const taxAmountElement = document.getElementById('taxAmount');
    const totalAmountElement = document.getElementById('totalAmount');

    const discountRow = document.getElementById('discountRow');
    const afterDiscountRow = document.getElementById('afterDiscountRow');

    if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal);
    if (taxRateElement) taxRateElement.textContent = db.toArabicNumbers(taxRate);
    if (taxAmountElement) taxAmountElement.textContent = formatCurrency(taxAmount);
    if (totalAmountElement) totalAmountElement.textContent = formatCurrency(total);

    // إظهار/إخفاء صفوف الخصم
    if (discountAmount > 0) {
        if (discountAmountElement) discountAmountElement.textContent = formatCurrency(discountAmount);
        if (afterDiscountElement) afterDiscountElement.textContent = formatCurrency(afterDiscountAmount);
        if (discountRow) discountRow.style.display = 'flex';
        if (afterDiscountRow) afterDiscountRow.style.display = 'flex';
    } else {
        if (discountRow) discountRow.style.display = 'none';
        if (afterDiscountRow) afterDiscountRow.style.display = 'none';
    }

    // تحديث حساب المبلغ المتبقي
    calculateChange();
}

// تحديث نسبة الضريبة
function updateTaxRate() {
    const settings = db.getTable('settings');
    // استخدام ?? بدلاً من || للتعامل مع القيمة صفر بشكل صحيح
    const taxRate = settings.taxRate ?? 15;
    const taxRateElement = document.getElementById('taxRate');
    if (taxRateElement) {
        taxRateElement.textContent = db.toArabicNumbers(taxRate);
    }
}

// تحديث طريقة الدفع
function updatePaymentMethod() {
    const paymentMethod = document.getElementById('paymentMethod').value;
    const paymentAmountSection = document.getElementById('paymentAmountSection');

    if (paymentMethod === 'cash') {
        paymentAmountSection.style.display = 'block';
        // إعادة حساب المبلغ المتبقي عند إظهار حقل المبلغ المدفوع
        calculateChange();
    } else {
        paymentAmountSection.style.display = 'none';
        // مسح عرض المبلغ المتبقي عند الدفع على الحساب
        const changeElement = document.getElementById('changeAmount');
        if (changeElement) {
            changeElement.innerHTML = '';
        }
    }
}

// حساب الباقي
function calculateChange() {
    const paidAmountInput = document.getElementById('paidAmount');
    const totalAmountElement = document.getElementById('totalAmount');
    const changeElement = document.getElementById('changeAmount');

    // التحقق من وجود العناصر
    if (!paidAmountInput || !totalAmountElement || !changeElement) {
        return;
    }

    const paidAmount = parseFloat(paidAmountInput.value) || 0;

    // استخراج المجموع الكلي من النص مع تنظيف أفضل
    let totalText = totalAmountElement.textContent || totalAmountElement.innerText || '';

    // إزالة العملة والمسافات والفواصل
    totalText = totalText.replace(/د\.ك|KWD|,|\s/g, '');

    // استخراج الرقم فقط
    const totalAmount = parseFloat(totalText) || 0;

    // المعادلة الصحيحة: المبلغ المتبقي = المجموع الكلي - المبلغ المدفوع
    const remainingAmount = totalAmount - paidAmount;

    if (remainingAmount > 0) {
        // المبلغ المدفوع أقل من المجموع الكلي - يوجد مبلغ مطلوب (أحمر)
        changeElement.innerHTML = `<span class="change-negative">المطلوب: ${formatCurrency(remainingAmount)}</span>`;
    } else if (remainingAmount < 0) {
        // المبلغ المدفوع أكبر من المجموع الكلي - يوجد باقي للعميل (أخضر)
        changeElement.innerHTML = `<span class="change-positive">الباقي: ${formatCurrency(Math.abs(remainingAmount))}</span>`;
    } else {
        // المبلغ المدفوع مساوي للمجموع الكلي - تم الدفع بالكامل (أخضر)
        changeElement.innerHTML = `<span class="change-complete">تم الدفع بالكامل</span>`;
    }
}

// البحث في منتجات المبيعات
function searchSalesProducts() {
    const searchTerm = document.getElementById('salesProductSearch').value.toLowerCase();
    const productItems = document.querySelectorAll('.sales-product-item');

    productItems.forEach(item => {
        const productName = item.querySelector('h4').textContent.toLowerCase();

        if (productName.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// التعامل مع البحث بالباركود
function handleBarcodeSearch(event) {
    if (event.key === 'Enter') {
        const barcode = event.target.value.trim();
        if (barcode) {
            const products = db.getTable('products');
            const product = products.find(p => p.barcode === barcode);

            if (product) {
                addToCart(product.id);
                event.target.value = '';
            } else {
                showNotification('لم يتم العثور على منتج بهذا الباركود', 'warning');
            }
        }
    }
}

// إتمام البيع
function completeSale() {
    try {
        if (cart.length === 0) {
            showNotification('السلة فارغة', 'warning');
            return;
        }

        const customerId = document.getElementById('customerSelect').value;
        const paymentMethod = document.getElementById('paymentMethod').value;

        // حساب المجاميع مع الضرائب والخصومات المخصصة
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // الحصول على قيم الضريبة والخصم المخصصة
        const customTaxRateInput = document.getElementById('customTaxRate');
        const discountRateInput = document.getElementById('discountRate');
        const discountAmountInput = document.getElementById('discountAmount');

        const settings = db.getTable('settings');
        const defaultTaxRate = settings.taxRate ?? 15;

        // تحديد نسبة الضريبة (مخصصة أو افتراضية)
        let taxRate = defaultTaxRate;
        if (customTaxRateInput && customTaxRateInput.value !== '') {
            taxRate = parseFloat(customTaxRateInput.value) || 0;
        }

        // حساب الخصم
        let discountAmount = 0;
        let discountType = 'none';
        if (discountAmountInput && discountAmountInput.value !== '') {
            // خصم ثابت
            discountAmount = parseFloat(discountAmountInput.value) || 0;
            discountType = 'fixed';
        } else if (discountRateInput && discountRateInput.value !== '') {
            // خصم نسبي
            const discountRate = parseFloat(discountRateInput.value) || 0;
            discountAmount = subtotal * (discountRate / 100);
            discountType = 'percentage';
        }

        // التأكد من أن الخصم لا يتجاوز المجموع الفرعي
        discountAmount = Math.min(discountAmount, subtotal);

        // حساب المجموع بعد الخصم
        const afterDiscountAmount = subtotal - discountAmount;

        // حساب الضريبة على المبلغ بعد الخصم
        const taxAmount = afterDiscountAmount * (taxRate / 100);

        // المجموع الكلي
        const total = afterDiscountAmount + taxAmount;

        // التحقق من الدفع النقدي
        if (paymentMethod === 'cash') {
            const paidAmount = parseFloat(document.getElementById('paidAmount').value) || 0;
            if (paidAmount < total) {
                showNotification('المبلغ المدفوع أقل من المطلوب', 'error');
                return;
            }
        }

        // إنشاء فاتورة البيع
        const sale = {
            customerId: customerId,
            items: cart.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity
            })),
            subtotal: subtotal,
            discountAmount: discountAmount,
            discountType: discountType,
            discountRate: discountType === 'percentage' ? parseFloat(discountRateInput.value) || 0 : 0,
            afterDiscountAmount: afterDiscountAmount,
            taxRate: taxRate,
            taxAmount: taxAmount,
            total: total,
            paymentMethod: paymentMethod,
            paidAmount: paymentMethod === 'cash' ? parseFloat(document.getElementById('paidAmount').value) : total,
            change: paymentMethod === 'cash' ? parseFloat(document.getElementById('paidAmount').value) - total : 0,
            status: 'completed'
        };

        // حفظ البيع
        const savedSale = db.insert('sales', sale);

        if (savedSale) {
            // تحديث المخزون
            cart.forEach(item => {
                const product = db.findById('products', item.productId);
                if (product) {
                    db.update('products', item.productId, {
                        quantity: product.quantity - item.quantity
                    });
                }
            });

            // تحديث رصيد العميل إذا كان الدفع على الحساب
            if (paymentMethod === 'credit' && customerId !== 'guest') {
                const customer = db.findById('customers', customerId);
                if (customer) {
                    db.update('customers', customerId, {
                        balance: customer.balance - total
                    });
                }
            }

            showNotification('تم إتمام البيع بنجاح', 'success');

            // طباعة الفاتورة
            printInvoice(savedSale);

            // مسح السلة وإعادة تعيين الضوابط
            cart = [];
            clearTaxDiscountControls();
            updateCartDisplay();
            updateCartSummary();

            // إعادة تحميل المنتجات
            loadSalesProducts();

            // تحديث لوحة المعلومات
            updateDashboard();

        } else {
            showNotification('خطأ في حفظ البيع', 'error');
        }

    } catch (error) {
        console.error('خطأ في إتمام البيع:', error);
        showNotification('خطأ في إتمام البيع', 'error');
    }
}

// طباعة الفاتورة
function printInvoice(sale) {
    const settings = db.getTable('settings');
    const customer = db.findById('customers', sale.customerId);

    const invoiceContent = `
        <div class="invoice">
            <div class="invoice-header">
                <h2>${settings.companyName}</h2>
                ${settings.companyAddress ? `<p>${settings.companyAddress}</p>` : ''}
                ${settings.companyPhone ? `<p>هاتف: ${settings.companyPhone}</p>` : ''}
            </div>

            <div class="invoice-info">
                <div class="invoice-number">فاتورة رقم: ${db.toArabicNumbers(sale.id)}</div>
                <div class="invoice-date">التاريخ: ${formatDate(sale.createdAt, true)}</div>
                <div class="customer-info">العميل: ${customer ? customer.name : 'ضيف'}</div>
            </div>

            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>المنتج</th>
                        <th>السعر</th>
                        <th>الكمية</th>
                        <th>المجموع</th>
                    </tr>
                </thead>
                <tbody>
                    ${sale.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${formatCurrency(item.price)}</td>
                            <td>${db.toArabicNumbers(item.quantity)}</td>
                            <td>${formatCurrency(item.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="invoice-summary">
                <div class="summary-row">
                    <span>المجموع الفرعي:</span>
                    <span>${formatCurrency(sale.subtotal)}</span>
                </div>
                <div class="summary-row">
                    <span>الضريبة (${db.toArabicNumbers(sale.taxRate)}%):</span>
                    <span>${formatCurrency(sale.taxAmount)}</span>
                </div>
                <div class="summary-row total">
                    <span>المجموع الكلي:</span>
                    <span>${formatCurrency(sale.total)}</span>
                </div>
                ${sale.paymentMethod === 'cash' ? `
                    <div class="summary-row">
                        <span>المبلغ المدفوع:</span>
                        <span>${formatCurrency(sale.paidAmount)}</span>
                    </div>
                    <div class="summary-row">
                        <span>الباقي:</span>
                        <span>${formatCurrency(sale.change)}</span>
                    </div>
                ` : ''}
            </div>

            <div class="invoice-footer">
                <p>شكراً لتعاملكم معنا</p>
            </div>
        </div>

        <style>
            .invoice { font-family: 'Cairo', sans-serif; max-width: 400px; margin: 0 auto; }
            .invoice-header { text-align: center; margin-bottom: 2rem; }
            .invoice-info { margin-bottom: 1rem; }
            .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
            .invoice-table th, .invoice-table td { padding: 0.5rem; border-bottom: 1px solid #ddd; text-align: right; }
            .invoice-summary .summary-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
            .invoice-summary .total { font-weight: bold; font-size: 1.2rem; border-top: 2px solid #333; padding-top: 0.5rem; }
            .invoice-footer { text-align: center; margin-top: 2rem; }
        </style>
    `;

    printContent(invoiceContent, 'فاتورة بيع');
}

// تحميل قسم العملاء
function loadCustomersSection() {
    const section = document.getElementById('customers');
    if (!section) return;

    section.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-users"></i> إدارة العملاء</h2>
            <button class="btn btn-primary" onclick="showAddCustomerModal()">
                <i class="fas fa-plus"></i>
                إضافة عميل جديد
            </button>
        </div>

        <div class="filters-container">
            <div class="filter-group search-filter-container">
                <label class="filter-label">البحث في العملاء</label>
                <input type="text" id="customerSearch" class="search-filter-input" placeholder="ابحث بالاسم أو الهاتف..." onkeyup="searchCustomers()">
                <i class="fas fa-search search-filter-icon"></i>
            </div>

            <div class="filter-group">
                <label class="filter-label">حالة الرصيد</label>
                <select id="balanceFilter" class="filter-select" onchange="filterCustomers()">
                    <option value="">جميع العملاء</option>
                    <option value="positive">عملاء لديهم رصيد</option>
                    <option value="negative">عملاء عليهم ديون</option>
                    <option value="zero">عملاء بدون رصيد</option>
                </select>
            </div>

            <div class="filter-actions">
                <button class="filter-btn secondary" onclick="clearCustomerFilters()">
                    <i class="fas fa-times"></i>
                    مسح الفلاتر
                </button>
            </div>
        </div>

        <div class="customers-grid" id="customersGrid">
            <div class="loading">جاري تحميل العملاء...</div>
        </div>
    `;

    loadCustomersList();
}

// تحميل قائمة العملاء
function loadCustomersList() {
    try {
        const customers = db.getTable('customers');
        const grid = document.getElementById('customersGrid');

        if (!grid) return;

        // استثناء العميل الضيف من القائمة
        const filteredCustomers = customers.filter(customer => customer.id !== 'guest');

        if (filteredCustomers.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>لا يوجد عملاء</h3>
                    <p>ابدأ بإضافة عملاء جدد</p>
                    <button class="btn btn-primary" onclick="showAddCustomerModal()">
                        إضافة عميل جديد
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredCustomers.map(customer => {
            const balanceClass = customer.balance > 0 ? 'positive' : customer.balance < 0 ? 'negative' : 'zero';
            const balanceIcon = customer.balance > 0 ? 'fa-arrow-up' : customer.balance < 0 ? 'fa-arrow-down' : 'fa-minus';

            return `
                <div class="customer-card" data-balance="${balanceClass}">
                    <div class="customer-header">
                        <div class="customer-info">
                            <h3>${customer.name}</h3>
                            <p class="customer-phone">${customer.phone || 'لا يوجد هاتف'}</p>
                        </div>
                        <div class="customer-actions">
                            <button class="btn-icon" onclick="viewCustomerDetails('${customer.id}')" title="عرض التفاصيل">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon" onclick="editCustomer('${customer.id}')" title="تعديل">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-danger" onclick="deleteCustomer('${customer.id}')" title="حذف">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="customer-details">
                        ${customer.email ? `<div class="detail-item">
                            <i class="fas fa-envelope"></i>
                            <span>${customer.email}</span>
                        </div>` : ''}

                        ${customer.address ? `<div class="detail-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${customer.address}</span>
                        </div>` : ''}

                        <div class="detail-item balance-item ${balanceClass}">
                            <i class="fas ${balanceIcon}"></i>
                            <span>الرصيد: ${formatCurrency(Math.abs(customer.balance))}</span>
                        </div>
                    </div>

                    <div class="customer-footer">
                        <span class="join-date">انضم في: ${formatDate(customer.createdAt)}</span>
                        <div class="customer-quick-actions">
                            ${customer.balance < 0 ? `
                                <button class="btn btn-sm btn-success" onclick="addPayment('${customer.id}')">
                                    <i class="fas fa-money-bill"></i>
                                    دفعة
                                </button>
                            ` : ''}
                            <button class="btn btn-sm btn-info" onclick="viewCustomerHistory('${customer.id}')">
                                <i class="fas fa-history"></i>
                                السجل
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('خطأ في تحميل العملاء:', error);
        showNotification('خطأ في تحميل العملاء', 'error');
    }
}

// البحث في العملاء
function searchCustomers() {
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
    const customerCards = document.querySelectorAll('.customer-card');

    customerCards.forEach(card => {
        const customerName = card.querySelector('h3').textContent.toLowerCase();
        const customerPhone = card.querySelector('.customer-phone').textContent.toLowerCase();
        const customerEmail = card.querySelector('.fa-envelope');
        const email = customerEmail ? customerEmail.nextElementSibling.textContent.toLowerCase() : '';

        if (customerName.includes(searchTerm) || customerPhone.includes(searchTerm) || email.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// فلترة العملاء حسب الرصيد
function filterCustomers() {
    const selectedFilter = document.getElementById('balanceFilter').value;
    const customerCards = document.querySelectorAll('.customer-card');

    customerCards.forEach(card => {
        const cardBalance = card.getAttribute('data-balance');

        if (!selectedFilter || cardBalance === selectedFilter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// مسح فلاتر العملاء
function clearCustomerFilters() {
    document.getElementById('customerSearch').value = '';
    document.getElementById('balanceFilter').value = '';
    loadCustomersList();
}

// عرض نافذة إضافة عميل
function showAddCustomerModal() {
    const content = `
        <form id="customerForm" onsubmit="saveCustomer(event)">
            <div class="form-grid">
                <div class="form-group">
                    <label for="customerName">اسم العميل *</label>
                    <input type="text" id="customerName" required>
                </div>

                <div class="form-group">
                    <label for="customerPhone">رقم الهاتف</label>
                    <input type="tel" id="customerPhone">
                </div>

                <div class="form-group">
                    <label for="customerEmail">البريد الإلكتروني</label>
                    <input type="email" id="customerEmail">
                </div>

                <div class="form-group">
                    <label for="customerBalance">الرصيد الابتدائي</label>
                    <input type="number" id="customerBalance" step="0.01" value="0">
                </div>
            </div>

            <div class="form-group">
                <label for="customerAddress">العنوان</label>
                <textarea id="customerAddress" rows="3"></textarea>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    حفظ العميل
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('إضافة عميل جديد', content);
}

// حفظ العميل
function saveCustomer(event) {
    event.preventDefault();

    try {
        const formData = {
            name: document.getElementById('customerName').value.trim(),
            phone: document.getElementById('customerPhone').value.trim(),
            email: document.getElementById('customerEmail').value.trim(),
            address: document.getElementById('customerAddress').value.trim(),
            balance: parseFloat(document.getElementById('customerBalance').value) || 0
        };

        // التحقق من صحة البيانات
        if (!formData.name) {
            showNotification('يرجى إدخال اسم العميل', 'error');
            return;
        }

        // التحقق من عدم تكرار رقم الهاتف
        if (formData.phone) {
            const customers = db.getTable('customers');
            const existingCustomer = customers.find(c => c.phone === formData.phone && c.id !== 'guest');
            if (existingCustomer) {
                showNotification('رقم الهاتف موجود مسبقاً', 'error');
                return;
            }
        }

        // حفظ العميل
        const savedCustomer = db.insert('customers', formData);

        if (savedCustomer) {
            showNotification('تم حفظ العميل بنجاح', 'success');
            closeModal();
            loadCustomersList();
            updateDashboard();
        } else {
            showNotification('خطأ في حفظ العميل', 'error');
        }

    } catch (error) {
        console.error('خطأ في حفظ العميل:', error);
        showNotification('خطأ في حفظ العميل', 'error');
    }
}

// تعديل عميل
function editCustomer(customerId) {
    const customer = db.findById('customers', customerId);
    if (!customer) {
        showNotification('العميل غير موجود', 'error');
        return;
    }

    const content = `
        <form id="customerForm" onsubmit="updateCustomer(event, '${customerId}')">
            <div class="form-grid">
                <div class="form-group">
                    <label for="customerName">اسم العميل *</label>
                    <input type="text" id="customerName" value="${customer.name}" required>
                </div>

                <div class="form-group">
                    <label for="customerPhone">رقم الهاتف</label>
                    <input type="tel" id="customerPhone" value="${customer.phone || ''}">
                </div>

                <div class="form-group">
                    <label for="customerEmail">البريد الإلكتروني</label>
                    <input type="email" id="customerEmail" value="${customer.email || ''}">
                </div>

                <div class="form-group">
                    <label for="customerBalance">الرصيد الحالي</label>
                    <input type="number" id="customerBalance" step="0.01" value="${customer.balance}">
                </div>
            </div>

            <div class="form-group">
                <label for="customerAddress">العنوان</label>
                <textarea id="customerAddress" rows="3">${customer.address || ''}</textarea>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    تحديث العميل
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('تعديل العميل', content);
}

// تحديث عميل
function updateCustomer(event, customerId) {
    event.preventDefault();

    try {
        const updates = {
            name: document.getElementById('customerName').value.trim(),
            phone: document.getElementById('customerPhone').value.trim(),
            email: document.getElementById('customerEmail').value.trim(),
            address: document.getElementById('customerAddress').value.trim(),
            balance: parseFloat(document.getElementById('customerBalance').value) || 0
        };

        // التحقق من صحة البيانات
        if (!updates.name) {
            showNotification('يرجى إدخال اسم العميل', 'error');
            return;
        }

        // التحقق من عدم تكرار رقم الهاتف
        if (updates.phone) {
            const customers = db.getTable('customers');
            const existingCustomer = customers.find(c => c.phone === updates.phone && c.id !== customerId && c.id !== 'guest');
            if (existingCustomer) {
                showNotification('رقم الهاتف موجود مسبقاً', 'error');
                return;
            }
        }

        // تحديث العميل
        const updatedCustomer = db.update('customers', customerId, updates);

        if (updatedCustomer) {
            showNotification('تم تحديث العميل بنجاح', 'success');
            closeModal();
            loadCustomersList();
            updateDashboard();
        } else {
            showNotification('خطأ في تحديث العميل', 'error');
        }

    } catch (error) {
        console.error('خطأ في تحديث العميل:', error);
        showNotification('خطأ في تحديث العميل', 'error');
    }
}

// حذف عميل
function deleteCustomer(customerId) {
    if (!confirmDelete('هل أنت متأكد من حذف هذا العميل؟\nسيتم حذف جميع معاملاته أيضاً.')) {
        return;
    }

    try {
        // التحقق من وجود معاملات للعميل
        const sales = db.getTable('sales');
        const customerSales = sales.filter(sale => sale.customerId === customerId);

        if (customerSales.length > 0) {
            if (!confirmDelete('هذا العميل لديه معاملات سابقة. هل تريد المتابعة؟')) {
                return;
            }
        }

        const success = db.delete('customers', customerId);

        if (success) {
            showNotification('تم حذف العميل بنجاح', 'success');
            loadCustomersList();
            updateDashboard();
        } else {
            showNotification('خطأ في حذف العميل', 'error');
        }

    } catch (error) {
        console.error('خطأ في حذف العميل:', error);
        showNotification('خطأ في حذف العميل', 'error');
    }
}

// عرض تفاصيل العميل
function viewCustomerDetails(customerId) {
    const customer = db.findById('customers', customerId);
    if (!customer) {
        showNotification('العميل غير موجود', 'error');
        return;
    }

    const sales = db.getTable('sales');
    const customerSales = sales.filter(sale => sale.customerId === customerId);
    const totalPurchases = customerSales.reduce((sum, sale) => sum + sale.total, 0);

    const content = `
        <div class="customer-details-view">
            <div class="customer-summary">
                <h3>${customer.name}</h3>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="label">الهاتف:</span>
                        <span class="value">${customer.phone || 'غير محدد'}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">البريد:</span>
                        <span class="value">${customer.email || 'غير محدد'}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">العنوان:</span>
                        <span class="value">${customer.address || 'غير محدد'}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">الرصيد:</span>
                        <span class="value ${customer.balance >= 0 ? 'positive' : 'negative'}">
                            ${formatCurrency(customer.balance)}
                        </span>
                    </div>
                    <div class="summary-item">
                        <span class="label">إجمالي المشتريات:</span>
                        <span class="value">${formatCurrency(totalPurchases)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">عدد المعاملات:</span>
                        <span class="value">${db.toArabicNumbers(customerSales.length)}</span>
                    </div>
                </div>
            </div>

            <div class="customer-actions-section">
                <button class="btn btn-primary" onclick="closeModal(); editCustomer('${customerId}')">
                    <i class="fas fa-edit"></i>
                    تعديل البيانات
                </button>
                ${customer.balance < 0 ? `
                    <button class="btn btn-success" onclick="closeModal(); addPayment('${customerId}')">
                        <i class="fas fa-money-bill"></i>
                        إضافة دفعة
                    </button>
                ` : ''}
                <button class="btn btn-info" onclick="closeModal(); viewCustomerHistory('${customerId}')">
                    <i class="fas fa-history"></i>
                    عرض السجل
                </button>
            </div>
        </div>
    `;

    showModal('تفاصيل العميل', content);
}

// إضافة دفعة للعميل
function addPayment(customerId) {
    const customer = db.findById('customers', customerId);
    if (!customer) {
        showNotification('العميل غير موجود', 'error');
        return;
    }

    const content = `
        <form id="paymentForm" onsubmit="savePayment(event, '${customerId}')">
            <div class="payment-info">
                <h4>إضافة دفعة للعميل: ${customer.name}</h4>
                <p>الرصيد الحالي: <span class="${customer.balance >= 0 ? 'positive' : 'negative'}">${formatCurrency(customer.balance)}</span></p>
            </div>

            <div class="form-group">
                <label for="paymentAmount">مبلغ الدفعة *</label>
                <input type="number" id="paymentAmount" step="0.01" min="0.01" required>
            </div>

            <div class="form-group">
                <label for="paymentMethod">طريقة الدفع</label>
                <select id="paymentMethod">
                    <option value="cash">نقداً</option>
                    <option value="bank">تحويل بنكي</option>
                    <option value="check">شيك</option>
                </select>
            </div>

            <div class="form-group">
                <label for="paymentNotes">ملاحظات</label>
                <textarea id="paymentNotes" rows="3"></textarea>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-success">
                    <i class="fas fa-save"></i>
                    حفظ الدفعة
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('إضافة دفعة', content);
}

// حفظ الدفعة
function savePayment(event, customerId) {
    event.preventDefault();

    try {
        const amount = parseFloat(document.getElementById('paymentAmount').value);
        const method = document.getElementById('paymentMethod').value;
        const notes = document.getElementById('paymentNotes').value.trim();

        if (!amount || amount <= 0) {
            showNotification('يرجى إدخال مبلغ صحيح', 'error');
            return;
        }

        const customer = db.findById('customers', customerId);
        if (!customer) {
            showNotification('العميل غير موجود', 'error');
            return;
        }

        // إنشاء سجل الدفعة
        const payment = {
            customerId: customerId,
            customerName: customer.name,
            amount: amount,
            method: method,
            notes: notes,
            type: 'payment'
        };

        // حفظ الدفعة
        const savedPayment = db.insert('payments', payment);

        if (savedPayment) {
            // تحديث رصيد العميل
            const newBalance = customer.balance + amount;
            db.update('customers', customerId, { balance: newBalance });

            showNotification('تم حفظ الدفعة بنجاح', 'success');
            closeModal();
            loadCustomersList();
            updateDashboard();
        } else {
            showNotification('خطأ في حفظ الدفعة', 'error');
        }

    } catch (error) {
        console.error('خطأ في حفظ الدفعة:', error);
        showNotification('خطأ في حفظ الدفعة', 'error');
    }
}

// عرض سجل العميل
function viewCustomerHistory(customerId) {
    const customer = db.findById('customers', customerId);
    if (!customer) {
        showNotification('العميل غير موجود', 'error');
        return;
    }

    const sales = db.getTable('sales');
    const payments = db.getTable('payments');

    const customerSales = sales.filter(sale => sale.customerId === customerId);
    const customerPayments = payments.filter(payment => payment.customerId === customerId);

    // دمج المعاملات وترتيبها حسب التاريخ
    const transactions = [
        ...customerSales.map(sale => ({
            ...sale,
            type: 'sale',
            date: sale.createdAt,
            amount: -sale.total,
            description: `فاتورة بيع #${sale.id}`
        })),
        ...customerPayments.map(payment => ({
            ...payment,
            type: 'payment',
            date: payment.createdAt,
            amount: payment.amount,
            description: `دفعة - ${payment.method === 'cash' ? 'نقداً' : payment.method === 'bank' ? 'تحويل بنكي' : 'شيك'}`
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const content = `
        <div class="customer-history">
            <div class="history-header">
                <h3>سجل معاملات العميل: ${customer.name}</h3>
                <p>الرصيد الحالي: <span class="${customer.balance >= 0 ? 'positive' : 'negative'}">${formatCurrency(customer.balance)}</span></p>
            </div>

            <div class="transactions-list">
                ${transactions.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <p>لا توجد معاملات</p>
                    </div>
                ` : transactions.map(transaction => `
                    <div class="transaction-item ${transaction.type}">
                        <div class="transaction-info">
                            <h4>${transaction.description}</h4>
                            <p class="transaction-date">${formatDate(transaction.date, true)}</p>
                            ${transaction.notes ? `<p class="transaction-notes">${transaction.notes}</p>` : ''}
                        </div>
                        <div class="transaction-amount ${transaction.amount >= 0 ? 'positive' : 'negative'}">
                            ${transaction.amount >= 0 ? '+' : ''}${formatCurrency(transaction.amount)}
                        </div>
                        ${transaction.type === 'sale' ? `
                            <div class="transaction-actions">
                                <button class="btn btn-sm btn-info" onclick="viewInvoiceDetails('${transaction.id}', 'sale')" title="عرض تفاصيل الفاتورة">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-secondary" onclick="printInvoiceFromHistory('${transaction.id}', 'sale')" title="طباعة الفاتورة">
                                    <i class="fas fa-print"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>

            <div class="history-actions">
                <button class="btn btn-info" onclick="printCustomerStatement('${customerId}')">
                    <i class="fas fa-print"></i>
                    طباعة كشف الحساب
                </button>
                <button class="btn btn-secondary" onclick="closeModal()">
                    إغلاق
                </button>
            </div>
        </div>
    `;

    showModal('سجل المعاملات', content);
}

// عرض تفاصيل الفاتورة من السجل
function viewInvoiceDetails(invoiceId, type) {
    if (type === 'sale') {
        const sale = db.findById('sales', invoiceId);
        if (!sale) {
            showNotification('الفاتورة غير موجودة', 'error');
            return;
        }

        const customer = db.findById('customers', sale.customerId);
        const settings = db.getTable('settings');

        const content = `
            <div class="invoice-details">
                <div class="invoice-header">
                    <div class="company-info">
                        <h2>${settings.companyName || 'أبوسليمان للمحاسبة'}</h2>
                        <p>${settings.companyAddress || ''}</p>
                        <p>هاتف: ${settings.companyPhone || ''}</p>
                    </div>
                    <div class="invoice-info">
                        <h3>فاتورة بيع</h3>
                        <p><strong>رقم الفاتورة:</strong> ${sale.id.substring(0, 8)}</p>
                        <p><strong>التاريخ:</strong> ${formatDate(sale.createdAt)}</p>
                        <p><strong>العميل:</strong> ${customer ? customer.name : 'عميل محذوف'}</p>
                    </div>
                </div>

                <div class="invoice-items">
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>الكمية</th>
                                <th>السعر</th>
                                <th>المجموع</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sale.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${db.toArabicNumbers(item.quantity)}</td>
                                    <td>${formatCurrency(item.price)}</td>
                                    <td>${formatCurrency(item.quantity * item.price)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="invoice-summary">
                    <div class="summary-row">
                        <span>المجموع الفرعي:</span>
                        <span>${formatCurrency(sale.subtotal)}</span>
                    </div>
                    ${sale.discountAmount > 0 ? `
                        <div class="summary-row">
                            <span>الخصم:</span>
                            <span>-${formatCurrency(sale.discountAmount)}</span>
                        </div>
                    ` : ''}
                    <div class="summary-row">
                        <span>الضريبة:</span>
                        <span>${formatCurrency(sale.taxAmount)}</span>
                    </div>
                    <div class="summary-row total">
                        <span>المجموع الكلي:</span>
                        <span>${formatCurrency(sale.total)}</span>
                    </div>
                    <div class="summary-row">
                        <span>طريقة الدفع:</span>
                        <span>${sale.paymentMethod === 'cash' ? 'نقداً' : 'على الحساب'}</span>
                    </div>
                </div>

                <div class="invoice-actions">
                    <button class="btn btn-primary" onclick="printInvoiceFromHistory('${sale.id}', 'sale')">
                        <i class="fas fa-print"></i>
                        طباعة
                    </button>
                    <button class="btn btn-warning" onclick="editInvoiceFromHistory('${sale.id}', 'sale')">
                        <i class="fas fa-edit"></i>
                        تعديل
                    </button>
                    <button class="btn btn-secondary" onclick="closeModal()">
                        إغلاق
                    </button>
                </div>
            </div>
        `;

        showModal('تفاصيل الفاتورة', content);
    }
}

// طباعة الفاتورة من السجل
function printInvoiceFromHistory(invoiceId, type) {
    if (type === 'sale') {
        const sale = db.findById('sales', invoiceId);
        if (sale) {
            printInvoice(sale);
        }
    }
}

// تعديل الفاتورة من السجل
function editInvoiceFromHistory(invoiceId, type) {
    if (type === 'sale') {
        // إغلاق النافذة الحالية
        closeModal();

        // الانتقال إلى قسم الفواتير السابقة
        showSection('sales');

        // عرض تبويب الفواتير السابقة
        setTimeout(() => {
            showSalesTab('previous');

            // البحث عن الفاتورة وفتحها للتعديل
            setTimeout(() => {
                const sale = db.findById('sales', invoiceId);
                if (sale) {
                    editSale(invoiceId);
                }
            }, 500);
        }, 300);
    }
}

// طباعة كشف حساب العميل
function printCustomerStatement(customerId) {
    const customer = db.findById('customers', customerId);
    if (!customer) return;

    const sales = db.getTable('sales');
    const payments = db.getTable('payments');
    const settings = db.getTable('settings');

    const customerSales = sales.filter(sale => sale.customerId === customerId);
    const customerPayments = payments.filter(payment => payment.customerId === customerId);

    const transactions = [
        ...customerSales.map(sale => ({
            date: sale.createdAt,
            description: `فاتورة بيع #${sale.id}`,
            debit: sale.total,
            credit: 0
        })),
        ...customerPayments.map(payment => ({
            date: payment.createdAt,
            description: `دفعة - ${payment.method === 'cash' ? 'نقداً' : payment.method === 'bank' ? 'تحويل بنكي' : 'شيك'}`,
            debit: 0,
            credit: payment.amount
        }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    let balance = 0;

    const statementContent = `
        <div class="statement">
            <div class="statement-header">
                <h2>${settings.companyName}</h2>
                <h3>كشف حساب العميل</h3>
            </div>

            <div class="customer-info">
                <p><strong>اسم العميل:</strong> ${customer.name}</p>
                <p><strong>الهاتف:</strong> ${customer.phone || 'غير محدد'}</p>
                <p><strong>تاريخ الكشف:</strong> ${formatDate(new Date(), true)}</p>
            </div>

            <table class="statement-table">
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>البيان</th>
                        <th>مدين</th>
                        <th>دائن</th>
                        <th>الرصيد</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.map(transaction => {
                        balance += transaction.credit - transaction.debit;
                        return `
                            <tr>
                                <td>${formatDate(transaction.date)}</td>
                                <td>${transaction.description}</td>
                                <td>${transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}</td>
                                <td>${transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}</td>
                                <td class="${balance >= 0 ? 'positive' : 'negative'}">${formatCurrency(balance)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>

            <div class="statement-summary">
                <p><strong>الرصيد النهائي: </strong>
                <span class="${customer.balance >= 0 ? 'positive' : 'negative'}">${formatCurrency(customer.balance)}</span></p>
            </div>
        </div>

        <style>
            .statement { font-family: 'Cairo', sans-serif; max-width: 800px; margin: 0 auto; }
            .statement-header { text-align: center; margin-bottom: 2rem; }
            .customer-info { margin-bottom: 2rem; }
            .statement-table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
            .statement-table th, .statement-table td { padding: 0.5rem; border: 1px solid #ddd; text-align: right; }
            .statement-table th { background: #f5f5f5; font-weight: bold; }
            .statement-summary { text-align: center; font-size: 1.2rem; }
            .positive { color: green; }
            .negative { color: red; }
        </style>
    `;

    printContent(statementContent, 'كشف حساب العميل');
}

// تحميل قسم الإعدادات
function loadSettingsSection() {
    const section = document.getElementById('settings');
    if (!section) return;

    const settings = db.getTable('settings');

    section.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-cog"></i> الإعدادات</h2>
        </div>

        <div class="settings-container">
            <div class="settings-tabs">
                <button class="tab-btn active" onclick="showSettingsTab('company')">
                    <i class="fas fa-building"></i>
                    بيانات الشركة
                </button>
                <button class="tab-btn" onclick="showSettingsTab('system')">
                    <i class="fas fa-cogs"></i>
                    إعدادات النظام
                </button>
                <button class="tab-btn" onclick="showSettingsTab('users')">
                    <i class="fas fa-users-cog"></i>
                    إدارة المستخدمين
                </button>
                <button class="tab-btn" onclick="showSettingsTab('backup')">
                    <i class="fas fa-database"></i>
                    النسخ الاحتياطي
                </button>
            </div>

            <div class="settings-content">
                <!-- بيانات الشركة -->
                <div id="companySettings" class="settings-tab active">
                    <h3>بيانات الشركة</h3>
                    <form id="companyForm" onsubmit="saveCompanySettings(event)">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="companyName">اسم الشركة</label>
                                <input type="text" id="companyName" value="${settings.companyName || ''}">
                            </div>

                            <div class="form-group">
                                <label for="companyPhone">رقم الهاتف</label>
                                <input type="tel" id="companyPhone" value="${settings.companyPhone || ''}">
                            </div>

                            <div class="form-group">
                                <label for="companyEmail">البريد الإلكتروني</label>
                                <input type="email" id="companyEmail" value="${settings.companyEmail || ''}">
                            </div>

                            <div class="form-group">
                                <label for="currency">العملة</label>
                                <input type="text" id="currency" value="${settings.currency || 'ر.س'}">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="companyAddress">عنوان الشركة</label>
                            <textarea id="companyAddress" rows="3">${settings.companyAddress || ''}</textarea>
                        </div>

                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i>
                            حفظ بيانات الشركة
                        </button>
                    </form>
                </div>

                <!-- إعدادات النظام -->
                <div id="systemSettings" class="settings-tab">
                    <h3>إعدادات النظام</h3>
                    <form id="systemForm" onsubmit="saveSystemSettings(event)">
                        <div class="form-group">
                            <label for="theme">المظهر</label>
                            <select id="theme">
                                <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>مضيء</option>
                                <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>داكن</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="defaultCurrency">العملة الافتراضية</label>
                            <select id="defaultCurrency">
                                <option value="KWD" ${settings.defaultCurrency === 'KWD' ? 'selected' : ''}>دينار كويتي (د.ك)</option>
                                <option value="SAR" ${settings.defaultCurrency === 'SAR' ? 'selected' : ''}>ريال سعودي (ر.س)</option>
                                <option value="USD" ${settings.defaultCurrency === 'USD' ? 'selected' : ''}>دولار أمريكي ($)</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="lowStockThreshold">حد التنبيه للمخزون المنخفض</label>
                            <input type="number" id="lowStockThreshold" min="1" value="${settings.lowStockThreshold || 5}">
                        </div>

                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i>
                            حفظ إعدادات النظام
                        </button>
                    </form>
                </div>

                <!-- إدارة المستخدمين -->
                <div id="usersSettings" class="settings-tab">
                    <h3>إدارة المستخدمين</h3>

                    <div class="users-header">
                        <button class="btn btn-primary" onclick="showAddUserModal()">
                            <i class="fas fa-user-plus"></i>
                            إضافة مستخدم جديد
                        </button>
                    </div>

                    <div class="users-grid" id="usersGrid">
                        <!-- سيتم تحميل المستخدمين هنا -->
                    </div>
                </div>



                <!-- النسخ الاحتياطي -->
                <div id="backupSettings" class="settings-tab">
                    <h3>النسخ الاحتياطي</h3>
                    <div class="backup-section">
                        <div class="backup-item">
                            <h4>تصدير البيانات</h4>
                            <p>تصدير جميع البيانات إلى ملف JSON</p>
                            <button class="btn btn-info" onclick="exportData()">
                                <i class="fas fa-download"></i>
                                تصدير البيانات
                            </button>
                        </div>

                        <div class="backup-item">
                            <h4>استيراد البيانات</h4>
                            <p>استيراد البيانات من ملف احتياطي</p>
                            <input type="file" id="importFile" accept=".json" style="display: none;" onchange="handleImportFile(this)">
                            <button class="btn btn-warning" onclick="document.getElementById('importFile').click()">
                                <i class="fas fa-upload"></i>
                                استيراد البيانات
                            </button>
                        </div>

                        <div class="backup-item">
                            <h4>مسح جميع البيانات</h4>
                            <p>حذف جميع البيانات وإعادة تعيين النظام</p>
                            <button class="btn btn-danger" onclick="clearAllData()">
                                <i class="fas fa-trash-alt"></i>
                                مسح جميع البيانات
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// عرض تبويب الإعدادات
function showSettingsTab(tabName) {
    // إخفاء جميع التبويبات
    const tabs = document.querySelectorAll('.settings-tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));

    // عرض التبويب المطلوب
    const targetTab = document.getElementById(tabName + 'Settings');
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // تفعيل الزر المناسب
    const activeBtn = document.querySelector(`[onclick="showSettingsTab('${tabName}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // تحميل البيانات حسب التبويب
    if (tabName === 'users') {
        loadUsersGrid();
    }
}

// حفظ بيانات الشركة
function saveCompanySettings(event) {
    event.preventDefault();

    try {
        const settings = db.getTable('settings');

        const updates = {
            companyName: document.getElementById('companyName').value.trim(),
            companyPhone: document.getElementById('companyPhone').value.trim(),
            companyEmail: document.getElementById('companyEmail').value.trim(),
            companyAddress: document.getElementById('companyAddress').value.trim(),
            currency: document.getElementById('currency').value.trim()
        };

        const updatedSettings = { ...settings, ...updates };
        db.setTable('settings', updatedSettings);

        showNotification('تم حفظ بيانات الشركة بنجاح', 'success');

    } catch (error) {
        console.error('خطأ في حفظ بيانات الشركة:', error);
        showNotification('خطأ في حفظ بيانات الشركة', 'error');
    }
}

// حفظ إعدادات النظام
function saveSystemSettings(event) {
    event.preventDefault();

    try {
        const settings = db.getTable('settings');

        const lowStockThreshold = parseInt(document.getElementById('lowStockThreshold').value) || 5;

        const updates = {
            theme: document.getElementById('theme').value,
            defaultCurrency: document.getElementById('defaultCurrency').value,
            lowStockThreshold: lowStockThreshold
        };

        const updatedSettings = { ...settings, ...updates };
        db.setTable('settings', updatedSettings);

        showNotification('تم حفظ إعدادات النظام بنجاح', 'success');

        // تحديث لوحة المعلومات لتطبيق الحد الجديد
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }

    } catch (error) {
        console.error('خطأ في حفظ إعدادات النظام:', error);
        showNotification('خطأ في حفظ إعدادات النظام', 'error');
    }
}

// حفظ إعدادات النظام
function saveSystemSettings(event) {
    event.preventDefault();

    try {
        const settings = db.getTable('settings');

        const theme = document.getElementById('theme').value;
        const defaultCurrency = document.getElementById('defaultCurrency').value;
        const lowStockThreshold = parseInt(document.getElementById('lowStockThreshold').value) || 5;

        const updates = {
            theme: theme,
            defaultCurrency: defaultCurrency,
            lowStockThreshold: lowStockThreshold
        };

        console.log('التحديثات المطلوبة:', updates);

        // دمج التحديثات مع الإعدادات الحالية
        const updatedSettings = { ...settings, ...updates };
        const success = db.setTable('settings', updatedSettings);

        if (success) {
            console.log('تم حفظ الإعدادات بنجاح');

            // تطبيق الثيم الجديد
            if (theme !== document.documentElement.getAttribute('data-theme')) {
                document.documentElement.setAttribute('data-theme', theme);

                const themeIcon = document.querySelector('#themeToggle i');
                if (themeIcon) {
                    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                }
            }

            showNotification('تم حفظ إعدادات النظام بنجاح', 'success');

        } else {
            console.error('فشل في حفظ الإعدادات');
            showNotification('خطأ في حفظ إعدادات النظام', 'error');
        }

    } catch (error) {
        console.error('خطأ في حفظ إعدادات النظام:', error);
        showNotification('خطأ في حفظ إعدادات النظام', 'error');
    }
}

// تغيير كلمة المرور
function changePassword(event) {
    event.preventDefault();

    try {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        const settings = db.getTable('settings');

        // التحقق من كلمة المرور الحالية
        if (!db.verifyPassword(currentPassword, settings.password)) {
            showNotification('كلمة المرور الحالية غير صحيحة', 'error');
            return;
        }

        // التحقق من تطابق كلمة المرور الجديدة
        if (newPassword !== confirmPassword) {
            showNotification('كلمة المرور الجديدة غير متطابقة', 'error');
            return;
        }

        // التحقق من طول كلمة المرور
        if (newPassword.length < 3) {
            showNotification('كلمة المرور يجب أن تكون 3 أحرف على الأقل', 'error');
            return;
        }

        // تحديث كلمة المرور
        const updatedSettings = { ...settings, password: db.hashPassword(newPassword) };
        db.setTable('settings', updatedSettings);

        showNotification('تم تغيير كلمة المرور بنجاح', 'success');

        // مسح الحقول
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';

    } catch (error) {
        console.error('خطأ في تغيير كلمة المرور:', error);
        showNotification('خطأ في تغيير كلمة المرور', 'error');
    }
}

// التعامل مع ملف الاستيراد
function handleImportFile(input) {
    const file = input.files[0];
    if (file) {
        if (confirmDelete('هل أنت متأكد من استيراد البيانات؟ سيتم استبدال البيانات الحالية.')) {
            importData(file);
        }
        input.value = ''; // مسح الملف المحدد
    }
}

// مسح جميع البيانات
function clearAllData() {
    if (confirmDelete('هل أنت متأكد من مسح جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
        if (confirmDelete('تأكيد أخير: سيتم حذف جميع المنتجات والعملاء والمبيعات. هل تريد المتابعة؟')) {
            try {
                const success = db.clearAllData();
                if (success) {
                    showNotification('تم مسح جميع البيانات بنجاح', 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    showNotification('خطأ في مسح البيانات', 'error');
                }
            } catch (error) {
                console.error('خطأ في مسح البيانات:', error);
                showNotification('خطأ في مسح البيانات', 'error');
            }
        }
    }
}

// تحديث معلومات العميل في المبيعات
function updateCustomerInfo() {
    const customerId = document.getElementById('customerSelect').value;
    const customer = db.findById('customers', customerId);
    const customerBalanceElement = document.getElementById('customerBalance');

    if (customerBalanceElement) {
        if (customer && customer.id !== 'guest') {
            const balance = customer.balance || 0;
            const balanceText = formatCurrency(Math.abs(balance));

            if (balance > 0) {
                // العميل له رصيد (أخضر)
                customerBalanceElement.innerHTML = `
                    <span class="customer-balance positive">
                        <i class="fas fa-arrow-up"></i>
                        رصيد العميل: ${balanceText}
                    </span>
                `;
            } else if (balance < 0) {
                // العميل عليه دين (أحمر)
                customerBalanceElement.innerHTML = `
                    <span class="customer-balance negative">
                        <i class="fas fa-arrow-down"></i>
                        مديون بمبلغ: ${balanceText}
                    </span>
                `;
            } else {
                // رصيد صفر
                customerBalanceElement.innerHTML = `
                    <span class="customer-balance neutral">
                        <i class="fas fa-minus"></i>
                        رصيد العميل: ${formatCurrency(0)}
                    </span>
                `;
            }
        } else {
            // عميل ضيف أو لا يوجد عميل محدد
            customerBalanceElement.innerHTML = '';
        }
    }
}

// تحميل قسم الموردين
function loadSuppliersSection() {
    const section = document.getElementById('suppliers');
    if (!section) return;

    section.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-truck"></i> إدارة الموردين</h2>
            <button class="btn btn-primary" onclick="showAddSupplierModal()">
                <i class="fas fa-plus"></i>
                إضافة مورد جديد
            </button>
        </div>

        <div class="filters-container">
            <div class="filter-group search-filter-container">
                <label class="filter-label">البحث في الموردين</label>
                <input type="text" id="supplierSearch" class="search-filter-input" placeholder="ابحث بالاسم أو الشركة..." onkeyup="searchSuppliers()">
                <i class="fas fa-search search-filter-icon"></i>
            </div>

            <div class="filter-group">
                <label class="filter-label">حالة الرصيد</label>
                <select id="supplierBalanceFilter" class="filter-select" onchange="filterSuppliersByBalance()">
                    <option value="">جميع الموردين</option>
                    <option value="positive">موردين لهم رصيد</option>
                    <option value="negative">موردين عليهم مبالغ</option>
                    <option value="zero">موردين بدون رصيد</option>
                </select>
            </div>

            <div class="filter-actions">
                <button class="filter-btn secondary" onclick="clearSupplierFilters()">
                    <i class="fas fa-times"></i>
                    مسح الفلاتر
                </button>
            </div>
        </div>

        <div class="suppliers-grid" id="suppliersGrid">
            <div class="loading">جاري تحميل الموردين...</div>
        </div>
    `;

    loadSuppliersList();
}

// تحميل قائمة الموردين
function loadSuppliersList() {
    try {
        const suppliers = db.getTable('suppliers');
        const grid = document.getElementById('suppliersGrid');

        if (!grid) return;

        if (suppliers.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-truck"></i>
                    <h3>لا يوجد موردين</h3>
                    <p>ابدأ بإضافة موردين جدد</p>
                    <button class="btn btn-primary" onclick="showAddSupplierModal()">
                        إضافة مورد جديد
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = suppliers.map(supplier => {
            const balanceClass = supplier.balance > 0 ? 'positive' : supplier.balance < 0 ? 'negative' : 'zero';
            const balanceIcon = supplier.balance > 0 ? 'fa-arrow-up' : supplier.balance < 0 ? 'fa-arrow-down' : 'fa-minus';

            return `
                <div class="customer-card supplier-card" data-balance="${balanceClass}">
                    <div class="customer-header">
                        <div class="customer-avatar">
                            <i class="fas fa-truck"></i>
                        </div>
                        <div class="customer-info">
                            <h3>${supplier.name}</h3>
                            <p class="customer-phone">${supplier.phone || 'لا يوجد هاتف'}</p>
                            <p class="customer-email">${supplier.email || 'لا يوجد بريد إلكتروني'}</p>
                        </div>
                        <div class="customer-balance ${balanceClass}">
                            <i class="fas ${balanceIcon}"></i>
                            <span>${formatCurrency(Math.abs(supplier.balance))}</span>
                        </div>
                    </div>

                    <div class="customer-details">
                        <div class="detail-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${supplier.address || 'لا يوجد عنوان'}</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span>تاريخ الإضافة: ${new Date(supplier.createdAt).toLocaleDateString('ar-SA')}</span>
                        </div>
                    </div>

                    <div class="customer-actions">
                        <button class="btn btn-sm btn-primary" onclick="viewSupplierDetails('${supplier.id}')" title="عرض التفاصيل">
                            <i class="fas fa-eye"></i>
                            مشاهدة
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="editSupplier('${supplier.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                            تعديل
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteSupplier('${supplier.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                            حذف
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('خطأ في تحميل الموردين:', error);
        showNotification('خطأ في تحميل الموردين', 'error');
    }
}

// البحث في الموردين
function searchSuppliers() {
    const searchTerm = document.getElementById('supplierSearch').value.toLowerCase();
    const balanceFilter = document.getElementById('supplierBalanceFilter').value;
    const suppliers = db.getTable('suppliers');

    let filteredSuppliers = suppliers.filter(supplier => {
        const matchesSearch = supplier.name.toLowerCase().includes(searchTerm) ||
                            (supplier.phone && supplier.phone.includes(searchTerm)) ||
                            (supplier.email && supplier.email.toLowerCase().includes(searchTerm)) ||
                            (supplier.address && supplier.address.toLowerCase().includes(searchTerm));

        let matchesBalance = true;
        if (balanceFilter) {
            switch (balanceFilter) {
                case 'positive':
                    matchesBalance = supplier.balance > 0;
                    break;
                case 'negative':
                    matchesBalance = supplier.balance < 0;
                    break;
                case 'zero':
                    matchesBalance = supplier.balance === 0;
                    break;
            }
        }

        return matchesSearch && matchesBalance;
    });

    displayFilteredSuppliers(filteredSuppliers);
}

// تصفية الموردين
function filterSuppliers() {
    searchSuppliers(); // استخدام نفس منطق البحث
}

// عرض الموردين المفلترين
function displayFilteredSuppliers(suppliers) {
    const grid = document.getElementById('suppliersGrid');
    if (!grid) return;

    if (suppliers.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>لا توجد نتائج</h3>
                <p>لم يتم العثور على موردين مطابقين للبحث</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = suppliers.map(supplier => {
        const balanceClass = supplier.balance > 0 ? 'positive' : supplier.balance < 0 ? 'negative' : 'zero';
        const balanceIcon = supplier.balance > 0 ? 'fa-arrow-up' : supplier.balance < 0 ? 'fa-arrow-down' : 'fa-minus';

        return `
            <div class="customer-card supplier-card" data-balance="${balanceClass}">
                <div class="customer-header">
                    <div class="customer-avatar">
                        <i class="fas fa-truck"></i>
                    </div>
                    <div class="customer-info">
                        <h3>${supplier.name}</h3>
                        <p class="customer-phone">${supplier.phone || 'لا يوجد هاتف'}</p>
                        <p class="customer-email">${supplier.email || 'لا يوجد بريد إلكتروني'}</p>
                    </div>
                    <div class="customer-balance ${balanceClass}">
                        <i class="fas ${balanceIcon}"></i>
                        <span>${formatCurrency(Math.abs(supplier.balance))}</span>
                    </div>
                </div>

                <div class="customer-details">
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${supplier.address || 'لا يوجد عنوان'}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>تاريخ الإضافة: ${new Date(supplier.createdAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                </div>

                <div class="customer-actions">
                    <button class="btn btn-sm btn-primary" onclick="viewSupplierDetails('${supplier.id}')" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                        مشاهدة
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="editSupplier('${supplier.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                        تعديل
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSupplier('${supplier.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                        حذف
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// البحث في الموردين
function searchSuppliers() {
    const searchTerm = document.getElementById('supplierSearch').value.toLowerCase();
    const supplierCards = document.querySelectorAll('.supplier-card');

    supplierCards.forEach(card => {
        const supplierName = card.querySelector('h3').textContent.toLowerCase();
        const supplierPhone = card.querySelector('.supplier-phone').textContent.toLowerCase();
        const supplierEmail = card.querySelector('.fa-envelope');
        const email = supplierEmail ? supplierEmail.nextElementSibling.textContent.toLowerCase() : '';

        if (supplierName.includes(searchTerm) || supplierPhone.includes(searchTerm) || email.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// فلترة الموردين حسب الرصيد
function filterSuppliersByBalance() {
    const selectedFilter = document.getElementById('supplierBalanceFilter').value;
    const supplierCards = document.querySelectorAll('.supplier-card');

    supplierCards.forEach(card => {
        const cardBalance = card.getAttribute('data-balance');

        if (!selectedFilter || cardBalance === selectedFilter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// مسح فلاتر الموردين
function clearSupplierFilters() {
    document.getElementById('supplierSearch').value = '';
    document.getElementById('supplierBalanceFilter').value = '';
    loadSuppliersList();
}

// عرض نافذة إضافة مورد
function showAddSupplierModal() {
    const content = `
        <form id="supplierForm" onsubmit="saveSupplier(event)">
            <div class="form-grid">
                <div class="form-group">
                    <label for="supplierName">اسم المورد *</label>
                    <input type="text" id="supplierName" required>
                </div>

                <div class="form-group">
                    <label for="supplierPhone">رقم الهاتف</label>
                    <input type="tel" id="supplierPhone">
                </div>

                <div class="form-group">
                    <label for="supplierEmail">البريد الإلكتروني</label>
                    <input type="email" id="supplierEmail">
                </div>

                <div class="form-group">
                    <label for="supplierBalance">الرصيد الابتدائي</label>
                    <input type="number" id="supplierBalance" step="0.01" value="0">
                </div>
            </div>

            <div class="form-group">
                <label for="supplierAddress">العنوان</label>
                <textarea id="supplierAddress" rows="3"></textarea>
            </div>

            <div class="form-group">
                <label for="supplierNotes">ملاحظات</label>
                <textarea id="supplierNotes" rows="2"></textarea>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    حفظ المورد
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('إضافة مورد جديد', content);
}

// حفظ المورد
function saveSupplier(event) {
    event.preventDefault();

    try {
        const formData = {
            name: document.getElementById('supplierName').value.trim(),
            phone: document.getElementById('supplierPhone').value.trim(),
            email: document.getElementById('supplierEmail').value.trim(),
            address: document.getElementById('supplierAddress').value.trim(),
            notes: document.getElementById('supplierNotes').value.trim(),
            balance: parseFloat(document.getElementById('supplierBalance').value) || 0
        };

        // التحقق من صحة البيانات
        if (!formData.name) {
            showNotification('يرجى إدخال اسم المورد', 'error');
            return;
        }

        // التحقق من عدم تكرار رقم الهاتف
        if (formData.phone) {
            const suppliers = db.getTable('suppliers');
            const existingSupplier = suppliers.find(s => s.phone === formData.phone);
            if (existingSupplier) {
                showNotification('رقم الهاتف موجود مسبقاً', 'error');
                return;
            }
        }

        // حفظ المورد
        const savedSupplier = db.insert('suppliers', formData);

        if (savedSupplier) {
            showNotification('تم حفظ المورد بنجاح', 'success');
            closeModal();
            loadSuppliersList();
        } else {
            showNotification('خطأ في حفظ المورد', 'error');
        }

    } catch (error) {
        console.error('خطأ في حفظ المورد:', error);
        showNotification('خطأ في حفظ المورد', 'error');
    }
}

// تعديل مورد
function editSupplier(supplierId) {
    const supplier = db.findById('suppliers', supplierId);
    if (!supplier) {
        showNotification('المورد غير موجود', 'error');
        return;
    }

    const content = `
        <form id="supplierForm" onsubmit="updateSupplier(event, '${supplierId}')">
            <div class="form-grid">
                <div class="form-group">
                    <label for="supplierName">اسم المورد *</label>
                    <input type="text" id="supplierName" value="${supplier.name}" required>
                </div>

                <div class="form-group">
                    <label for="supplierPhone">رقم الهاتف</label>
                    <input type="tel" id="supplierPhone" value="${supplier.phone || ''}">
                </div>

                <div class="form-group">
                    <label for="supplierEmail">البريد الإلكتروني</label>
                    <input type="email" id="supplierEmail" value="${supplier.email || ''}">
                </div>

                <div class="form-group">
                    <label for="supplierBalance">الرصيد الحالي</label>
                    <input type="number" id="supplierBalance" step="0.01" value="${supplier.balance}">
                </div>
            </div>

            <div class="form-group">
                <label for="supplierAddress">العنوان</label>
                <textarea id="supplierAddress" rows="3">${supplier.address || ''}</textarea>
            </div>

            <div class="form-group">
                <label for="supplierNotes">ملاحظات</label>
                <textarea id="supplierNotes" rows="2">${supplier.notes || ''}</textarea>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    تحديث المورد
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('تعديل المورد', content);
}

// تحديث مورد
function updateSupplier(event, supplierId) {
    event.preventDefault();

    try {
        const updates = {
            name: document.getElementById('supplierName').value.trim(),
            phone: document.getElementById('supplierPhone').value.trim(),
            email: document.getElementById('supplierEmail').value.trim(),
            address: document.getElementById('supplierAddress').value.trim(),
            notes: document.getElementById('supplierNotes').value.trim(),
            balance: parseFloat(document.getElementById('supplierBalance').value) || 0
        };

        // التحقق من صحة البيانات
        if (!updates.name) {
            showNotification('يرجى إدخال اسم المورد', 'error');
            return;
        }

        // التحقق من عدم تكرار رقم الهاتف
        if (updates.phone) {
            const suppliers = db.getTable('suppliers');
            const existingSupplier = suppliers.find(s => s.phone === updates.phone && s.id !== supplierId);
            if (existingSupplier) {
                showNotification('رقم الهاتف موجود مسبقاً', 'error');
                return;
            }
        }

        // تحديث المورد
        const updatedSupplier = db.update('suppliers', supplierId, updates);

        if (updatedSupplier) {
            showNotification('تم تحديث المورد بنجاح', 'success');
            closeModal();
            loadSuppliersList();
        } else {
            showNotification('خطأ في تحديث المورد', 'error');
        }

    } catch (error) {
        console.error('خطأ في تحديث المورد:', error);
        showNotification('خطأ في تحديث المورد', 'error');
    }
}

// حذف مورد
function deleteSupplier(supplierId) {
    if (!confirmDelete('هل أنت متأكد من حذف هذا المورد؟\nسيتم حذف جميع معاملاته أيضاً.')) {
        return;
    }

    try {
        // التحقق من وجود مشتريات للمورد
        const purchases = db.getTable('purchases');
        const supplierPurchases = purchases.filter(purchase => purchase.supplierId === supplierId);

        if (supplierPurchases.length > 0) {
            if (!confirmDelete('هذا المورد لديه مشتريات سابقة. هل تريد المتابعة؟')) {
                return;
            }
        }

        const success = db.delete('suppliers', supplierId);

        if (success) {
            showNotification('تم حذف المورد بنجاح', 'success');
            loadSuppliersList();
        } else {
            showNotification('خطأ في حذف المورد', 'error');
        }

    } catch (error) {
        console.error('خطأ في حذف المورد:', error);
        showNotification('خطأ في حذف المورد', 'error');
    }
}

// عرض تفاصيل المورد
function viewSupplierDetails(supplierId) {
    const supplier = db.findById('suppliers', supplierId);
    if (!supplier) {
        showNotification('المورد غير موجود', 'error');
        return;
    }

    const purchases = db.getTable('purchases');
    const supplierPurchases = purchases.filter(purchase => purchase.supplierId === supplierId);
    const totalPurchases = supplierPurchases.reduce((sum, purchase) => sum + purchase.total, 0);

    const content = `
        <div class="supplier-details-view">
            <div class="supplier-summary">
                <h3>${supplier.name}</h3>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="label">الهاتف:</span>
                        <span class="value">${supplier.phone || 'غير محدد'}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">البريد:</span>
                        <span class="value">${supplier.email || 'غير محدد'}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">العنوان:</span>
                        <span class="value">${supplier.address || 'غير محدد'}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">الرصيد:</span>
                        <span class="value ${supplier.balance >= 0 ? 'positive' : 'negative'}">
                            ${formatCurrency(supplier.balance)}
                        </span>
                    </div>
                    <div class="summary-item">
                        <span class="label">إجمالي المشتريات:</span>
                        <span class="value">${formatCurrency(totalPurchases)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">عدد المعاملات:</span>
                        <span class="value">${db.toArabicNumbers(supplierPurchases.length)}</span>
                    </div>
                </div>
                ${supplier.notes ? `
                    <div class="supplier-notes">
                        <h4>ملاحظات:</h4>
                        <p>${supplier.notes}</p>
                    </div>
                ` : ''}
            </div>

            <div class="supplier-actions-section">
                <button class="btn btn-primary" onclick="closeModal(); editSupplier('${supplierId}')">
                    <i class="fas fa-edit"></i>
                    تعديل البيانات
                </button>
                <button class="btn btn-success" onclick="closeModal(); addSupplierPayment('${supplierId}')">
                    <i class="fas fa-money-bill"></i>
                    إضافة دفعة
                </button>
                <button class="btn btn-info" onclick="closeModal(); viewSupplierHistory('${supplierId}')">
                    <i class="fas fa-history"></i>
                    عرض السجل
                </button>
            </div>
        </div>
    `;

    showModal('تفاصيل المورد', content);
}

// إضافة دفعة للمورد
function addSupplierPayment(supplierId) {
    const supplier = db.findById('suppliers', supplierId);
    if (!supplier) {
        showNotification('المورد غير موجود', 'error');
        return;
    }

    const content = `
        <form id="supplierPaymentForm" onsubmit="saveSupplierPayment(event, '${supplierId}')">
            <div class="payment-info">
                <h4>إضافة دفعة للمورد: ${supplier.name}</h4>
                <p>الرصيد الحالي: <span class="${supplier.balance >= 0 ? 'positive' : 'negative'}">${formatCurrency(supplier.balance)}</span></p>
            </div>

            <div class="form-group">
                <label for="paymentAmount">مبلغ الدفعة *</label>
                <input type="number" id="paymentAmount" step="0.01" min="0.01" required>
            </div>

            <div class="form-group">
                <label for="paymentType">نوع الدفعة</label>
                <select id="paymentType">
                    <option value="payment">دفعة للمورد</option>
                    <option value="advance">دفعة مقدمة</option>
                </select>
            </div>

            <div class="form-group">
                <label for="paymentMethod">طريقة الدفع</label>
                <select id="paymentMethod">
                    <option value="cash">نقداً</option>
                    <option value="bank">تحويل بنكي</option>
                    <option value="check">شيك</option>
                </select>
            </div>

            <div class="form-group">
                <label for="paymentNotes">ملاحظات</label>
                <textarea id="paymentNotes" rows="3"></textarea>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-success">
                    <i class="fas fa-save"></i>
                    حفظ الدفعة
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('إضافة دفعة للمورد', content);
}

// حفظ دفعة المورد
function saveSupplierPayment(event, supplierId) {
    event.preventDefault();

    try {
        const amount = parseFloat(document.getElementById('paymentAmount').value);
        const type = document.getElementById('paymentType').value;
        const method = document.getElementById('paymentMethod').value;
        const notes = document.getElementById('paymentNotes').value.trim();

        if (!amount || amount <= 0) {
            showNotification('يرجى إدخال مبلغ صحيح', 'error');
            return;
        }

        const supplier = db.findById('suppliers', supplierId);
        if (!supplier) {
            showNotification('المورد غير موجود', 'error');
            return;
        }

        // إنشاء سجل الدفعة
        const payment = {
            supplierId: supplierId,
            supplierName: supplier.name,
            amount: amount,
            type: type,
            method: method,
            notes: notes,
            category: 'supplier_payment'
        };

        // حفظ الدفعة
        const savedPayment = db.insert('payments', payment);

        if (savedPayment) {
            // تحديث رصيد المورد
            const newBalance = type === 'payment' ? supplier.balance - amount : supplier.balance + amount;
            db.update('suppliers', supplierId, { balance: newBalance });

            showNotification('تم حفظ الدفعة بنجاح', 'success');
            closeModal();
            loadSuppliersList();
        } else {
            showNotification('خطأ في حفظ الدفعة', 'error');
        }

    } catch (error) {
        console.error('خطأ في حفظ دفعة المورد:', error);
        showNotification('خطأ في حفظ دفعة المورد', 'error');
    }
}

// عرض سجل المورد
function viewSupplierHistory(supplierId) {
    const supplier = db.findById('suppliers', supplierId);
    if (!supplier) {
        showNotification('المورد غير موجود', 'error');
        return;
    }

    const purchases = db.getTable('purchases');
    const payments = db.getTable('payments');

    const supplierPurchases = purchases.filter(purchase => purchase.supplierId === supplierId);
    const supplierPayments = payments.filter(payment => payment.supplierId === supplierId);

    // دمج المعاملات وترتيبها حسب التاريخ
    const transactions = [
        ...supplierPurchases.map(purchase => ({
            ...purchase,
            type: 'purchase',
            date: purchase.createdAt,
            amount: purchase.total,
            description: `فاتورة شراء #${purchase.id}`
        })),
        ...supplierPayments.map(payment => ({
            ...payment,
            type: 'payment',
            date: payment.createdAt,
            amount: -payment.amount,
            description: `${payment.type === 'payment' ? 'دفعة' : 'دفعة مقدمة'} - ${payment.method === 'cash' ? 'نقداً' : payment.method === 'bank' ? 'تحويل بنكي' : 'شيك'}`
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const content = `
        <div class="supplier-history">
            <div class="history-header">
                <h3>سجل معاملات المورد: ${supplier.name}</h3>
                <p>الرصيد الحالي: <span class="${supplier.balance >= 0 ? 'positive' : 'negative'}">${formatCurrency(supplier.balance)}</span></p>
            </div>

            <div class="transactions-list">
                ${transactions.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <p>لا توجد معاملات</p>
                    </div>
                ` : transactions.map(transaction => `
                    <div class="transaction-item ${transaction.type}">
                        <div class="transaction-info">
                            <h4>${transaction.description}</h4>
                            <p class="transaction-date">${formatDate(transaction.date, true)}</p>
                            ${transaction.notes ? `<p class="transaction-notes">${transaction.notes}</p>` : ''}
                        </div>
                        <div class="transaction-amount ${transaction.amount >= 0 ? 'positive' : 'negative'}">
                            ${transaction.amount >= 0 ? '+' : ''}${formatCurrency(transaction.amount)}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="history-actions">
                <button class="btn btn-info" onclick="printSupplierStatement('${supplierId}')">
                    <i class="fas fa-print"></i>
                    طباعة كشف الحساب
                </button>
                <button class="btn btn-secondary" onclick="closeModal()">
                    إغلاق
                </button>
            </div>
        </div>
    `;

    showModal('سجل المعاملات', content);
}

// طباعة كشف حساب المورد
function printSupplierStatement(supplierId) {
    const supplier = db.findById('suppliers', supplierId);
    if (!supplier) return;

    const purchases = db.getTable('purchases');
    const payments = db.getTable('payments');
    const settings = db.getTable('settings');

    const supplierPurchases = purchases.filter(purchase => purchase.supplierId === supplierId);
    const supplierPayments = payments.filter(payment => payment.supplierId === supplierId);

    const transactions = [
        ...supplierPurchases.map(purchase => ({
            date: purchase.createdAt,
            description: `فاتورة شراء #${purchase.id}`,
            debit: 0,
            credit: purchase.total
        })),
        ...supplierPayments.map(payment => ({
            date: payment.createdAt,
            description: `${payment.type === 'payment' ? 'دفعة' : 'دفعة مقدمة'} - ${payment.method === 'cash' ? 'نقداً' : payment.method === 'bank' ? 'تحويل بنكي' : 'شيك'}`,
            debit: payment.amount,
            credit: 0
        }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    let balance = 0;

    const statementContent = `
        <div class="statement">
            <div class="statement-header">
                <h2>${settings.companyName}</h2>
                <h3>كشف حساب المورد</h3>
            </div>

            <div class="supplier-info">
                <p><strong>اسم المورد:</strong> ${supplier.name}</p>
                <p><strong>الهاتف:</strong> ${supplier.phone || 'غير محدد'}</p>
                <p><strong>تاريخ الكشف:</strong> ${formatDate(new Date(), true)}</p>
            </div>

            <table class="statement-table">
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>البيان</th>
                        <th>مدين</th>
                        <th>دائن</th>
                        <th>الرصيد</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.map(transaction => {
                        balance += transaction.credit - transaction.debit;
                        return `
                            <tr>
                                <td>${formatDate(transaction.date)}</td>
                                <td>${transaction.description}</td>
                                <td>${transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}</td>
                                <td>${transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}</td>
                                <td class="${balance >= 0 ? 'positive' : 'negative'}">${formatCurrency(balance)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>

            <div class="statement-summary">
                <p><strong>الرصيد النهائي: </strong>
                <span class="${supplier.balance >= 0 ? 'positive' : 'negative'}">${formatCurrency(supplier.balance)}</span></p>
            </div>
        </div>

        <style>
            .statement { font-family: 'Cairo', sans-serif; max-width: 800px; margin: 0 auto; }
            .statement-header { text-align: center; margin-bottom: 2rem; }
            .supplier-info { margin-bottom: 2rem; }
            .statement-table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
            .statement-table th, .statement-table td { padding: 0.5rem; border: 1px solid #ddd; text-align: right; }
            .statement-table th { background: #f5f5f5; font-weight: bold; }
            .statement-summary { text-align: center; font-size: 1.2rem; }
            .positive { color: green; }
            .negative { color: red; }
        </style>
    `;

    printContent(statementContent, 'كشف حساب المورد');
}

// تحميل قسم المشتريات
function loadPurchasesSection() {
    const section = document.getElementById('purchases');
    if (!section) return;

    section.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-shopping-bag"></i> إدارة المشتريات</h2>
            <button class="btn btn-primary" onclick="showAddPurchaseModal()">
                <i class="fas fa-plus"></i>
                إضافة فاتورة شراء
            </button>
        </div>

        <div class="filters-container">
            <div class="filter-group search-filter-container">
                <label class="filter-label">البحث في المشتريات</label>
                <input type="text" id="purchaseSearch" class="search-filter-input" placeholder="ابحث برقم الفاتورة أو المورد..." onkeyup="searchPurchases()">
                <i class="fas fa-search search-filter-icon"></i>
            </div>

            <div class="filter-group">
                <label class="filter-label">المورد</label>
                <select id="supplierFilter" class="filter-select" onchange="filterPurchases()">
                    <option value="">جميع الموردين</option>
                </select>
            </div>

            <div class="filter-group">
                <label class="filter-label">التاريخ</label>
                <input type="date" id="dateFilter" class="date-picker-input" onchange="filterPurchases()">
            </div>

            <div class="filter-actions">
                <button class="filter-btn secondary" onclick="clearPurchaseFilters()">
                    <i class="fas fa-times"></i>
                    مسح الفلاتر
                </button>
            </div>
        </div>

        <div class="purchases-list" id="purchasesList">
            <div class="loading">جاري تحميل المشتريات...</div>
        </div>
    `;

    loadPurchasesList();
    loadSuppliersFilter();
}

// تحميل قائمة المشتريات
function loadPurchasesList() {
    try {
        const purchases = db.getTable('purchases');
        const list = document.getElementById('purchasesList');

        if (!list) return;

        if (purchases.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>لا توجد مشتريات</h3>
                    <p>ابدأ بإضافة فواتير الشراء</p>
                    <button class="btn btn-primary" onclick="showAddPurchaseModal()">
                        إضافة فاتورة شراء
                    </button>
                </div>
            `;
            return;
        }

        // ترتيب المشتريات حسب التاريخ (الأحدث أولاً)
        const sortedPurchases = purchases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        list.innerHTML = sortedPurchases.map(purchase => {
            const supplier = db.findById('suppliers', purchase.supplierId);
            const supplierName = supplier ? supplier.name : 'مورد محذوف';

            return `
                <div class="purchase-card" data-supplier="${purchase.supplierId}" data-date="${purchase.createdAt.split('T')[0]}">
                    <div class="purchase-header">
                        <div class="purchase-info">
                            <h3>فاتورة شراء #${purchase.id}</h3>
                            <p class="purchase-supplier">المورد: ${supplierName}</p>
                            <p class="purchase-date">${formatDate(purchase.createdAt, true)}</p>
                        </div>
                        <div class="purchase-actions">
                            <button class="btn-icon" onclick="viewPurchaseDetails('${purchase.id}')" title="عرض التفاصيل">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon" onclick="editPurchase('${purchase.id}')" title="تعديل">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-danger" onclick="deletePurchase('${purchase.id}')" title="حذف">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="purchase-summary">
                        <div class="summary-item">
                            <span class="label">عدد الأصناف:</span>
                            <span class="value">${db.toArabicNumbers(purchase.items.length)}</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">المجموع الفرعي:</span>
                            <span class="value">${formatCurrency(purchase.subtotal)}</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">الضريبة:</span>
                            <span class="value">${formatCurrency(purchase.taxAmount)}</span>
                        </div>
                        <div class="summary-item total">
                            <span class="label">المجموع الكلي:</span>
                            <span class="value">${formatCurrency(purchase.total)}</span>
                        </div>
                    </div>

                    <div class="purchase-status">
                        <span class="status-badge ${purchase.status}">${getStatusText(purchase.status)}</span>
                        <span class="payment-method">${getPaymentMethodText(purchase.paymentMethod)}</span>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('خطأ في تحميل المشتريات:', error);
        showNotification('خطأ في تحميل المشتريات', 'error');
    }
}

// تحميل فلتر الموردين
function loadSuppliersFilter() {
    try {
        const suppliers = db.getTable('suppliers');
        const filter = document.getElementById('supplierFilter');

        if (!filter) return;

        filter.innerHTML = '<option value="">جميع الموردين</option>' +
            suppliers.map(supplier =>
                `<option value="${supplier.id}">${supplier.name}</option>`
            ).join('');

    } catch (error) {
        console.error('خطأ في تحميل فلتر الموردين:', error);
    }
}

// الحصول على نص الحالة
function getStatusText(status) {
    switch (status) {
        case 'pending': return 'في الانتظار';
        case 'completed': return 'مكتملة';
        case 'cancelled': return 'ملغية';
        default: return 'غير محدد';
    }
}

// الحصول على نص طريقة الدفع
function getPaymentMethodText(method) {
    switch (method) {
        case 'cash': return 'نقداً';
        case 'credit': return 'على الحساب';
        case 'bank': return 'تحويل بنكي';
        case 'check': return 'شيك';
        default: return 'غير محدد';
    }
}

// البحث في المشتريات
function searchPurchases() {
    const searchTerm = document.getElementById('purchaseSearch').value.toLowerCase();
    const purchaseCards = document.querySelectorAll('.purchase-card');

    purchaseCards.forEach(card => {
        const purchaseId = card.querySelector('h3').textContent.toLowerCase();
        const supplierName = card.querySelector('.purchase-supplier').textContent.toLowerCase();

        if (purchaseId.includes(searchTerm) || supplierName.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// فلترة المشتريات
function filterPurchases() {
    const selectedSupplier = document.getElementById('supplierFilter').value;
    const selectedDate = document.getElementById('dateFilter').value;
    const purchaseCards = document.querySelectorAll('.purchase-card');

    purchaseCards.forEach(card => {
        const cardSupplier = card.getAttribute('data-supplier');
        const cardDate = card.getAttribute('data-date');

        let showCard = true;

        if (selectedSupplier && cardSupplier !== selectedSupplier) {
            showCard = false;
        }

        if (selectedDate && cardDate !== selectedDate) {
            showCard = false;
        }

        card.style.display = showCard ? 'block' : 'none';
    });
}

// مسح فلاتر المشتريات
function clearPurchaseFilters() {
    document.getElementById('purchaseSearch').value = '';
    document.getElementById('supplierFilter').value = '';
    document.getElementById('dateFilter').value = '';
    loadPurchasesSection();
}

// عرض نافذة إضافة فاتورة شراء
function showAddPurchaseModal() {
    const suppliers = db.getTable('suppliers');
    const products = db.getTable('products');

    if (suppliers.length === 0) {
        showNotification('يجب إضافة موردين أولاً', 'warning');
        return;
    }

    const content = `
        <form id="purchaseForm" onsubmit="savePurchase(event)">
            <div class="form-grid">
                <div class="form-group">
                    <label for="purchaseSupplier">المورد *</label>
                    <select id="purchaseSupplier" required>
                        <option value="">اختر المورد</option>
                        ${suppliers.map(supplier =>
                            `<option value="${supplier.id}">${supplier.name}</option>`
                        ).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label for="purchaseDate">تاريخ الفاتورة</label>
                    <input type="date" id="purchaseDate" value="${new Date().toISOString().split('T')[0]}">
                </div>

                <div class="form-group">
                    <label for="invoiceNumber">رقم الفاتورة</label>
                    <input type="text" id="invoiceNumber" placeholder="رقم فاتورة المورد">
                </div>

                <div class="form-group">
                    <label for="paymentMethod">طريقة الدفع</label>
                    <select id="paymentMethod">
                        <option value="cash">نقداً</option>
                        <option value="credit">على الحساب</option>
                        <option value="bank">تحويل بنكي</option>
                        <option value="check">شيك</option>
                    </select>
                </div>
            </div>

            <div class="purchase-items-section">
                <h4>أصناف الفاتورة</h4>
                <div class="items-header">
                    <button type="button" class="btn btn-secondary" onclick="addPurchaseItem()">
                        <i class="fas fa-plus"></i>
                        إضافة صنف
                    </button>
                </div>

                <div id="purchaseItems" class="purchase-items">
                    <!-- الأصناف ستظهر هنا -->
                </div>

                <div class="purchase-totals">
                    <div class="total-row">
                        <span>المجموع الفرعي:</span>
                        <span id="purchaseSubtotal">٠.٠٠ ر.س</span>
                    </div>
                    <div class="total-row">
                        <span>الضريبة:</span>
                        <span id="purchaseTax">٠.٠٠ ر.س</span>
                    </div>
                    <div class="total-row total">
                        <span>المجموع الكلي:</span>
                        <span id="purchaseTotal">٠.٠٠ ر.س</span>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label for="purchaseNotes">ملاحظات</label>
                <textarea id="purchaseNotes" rows="3"></textarea>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    حفظ فاتورة الشراء
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('إضافة فاتورة شراء', content);

    // إضافة صنف افتراضي
    addPurchaseItem();
}

// متغير لأصناف الشراء
let purchaseItems = [];

// إضافة صنف للشراء
function addPurchaseItem() {
    const products = db.getTable('products');
    const itemIndex = purchaseItems.length;

    const itemHtml = `
        <div class="purchase-item" data-index="${itemIndex}">
            <div class="item-controls">
                <select class="item-product" onchange="updatePurchaseItem(${itemIndex})" required>
                    <option value="">اختر المنتج</option>
                    ${products.map(product =>
                        `<option value="${product.id}" data-price="${product.price}">${product.name}</option>`
                    ).join('')}
                </select>

                <input type="number" class="item-quantity" placeholder="الكمية" min="1" step="1" onchange="updatePurchaseItem(${itemIndex})" required>

                <input type="number" class="item-price" placeholder="سعر الوحدة" min="0" step="0.01" onchange="updatePurchaseItem(${itemIndex})" required>

                <span class="item-total">٠.٠٠ ر.س</span>

                <button type="button" class="btn-icon btn-danger" onclick="removePurchaseItem(${itemIndex})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;

    const itemsContainer = document.getElementById('purchaseItems');
    itemsContainer.insertAdjacentHTML('beforeend', itemHtml);

    purchaseItems.push({
        productId: '',
        quantity: 0,
        price: 0,
        total: 0
    });
}

// تحديث صنف الشراء
function updatePurchaseItem(index) {
    const itemElement = document.querySelector(`[data-index="${index}"]`);
    if (!itemElement) return;

    const productSelect = itemElement.querySelector('.item-product');
    const quantityInput = itemElement.querySelector('.item-quantity');
    const priceInput = itemElement.querySelector('.item-price');
    const totalSpan = itemElement.querySelector('.item-total');

    const productId = productSelect.value;
    const quantity = parseFloat(quantityInput.value) || 0;
    const price = parseFloat(priceInput.value) || 0;

    // إذا تم اختيار منتج جديد، املأ السعر تلقائياً
    if (productId && !priceInput.value) {
        const selectedOption = productSelect.selectedOptions[0];
        const productPrice = selectedOption.getAttribute('data-price');
        if (productPrice) {
            priceInput.value = productPrice;
            price = parseFloat(productPrice);
        }
    }

    const total = quantity * price;

    // تحديث البيانات
    purchaseItems[index] = {
        productId: productId,
        quantity: quantity,
        price: price,
        total: total
    };

    // تحديث العرض
    totalSpan.textContent = formatCurrency(total);

    // تحديث المجاميع
    updatePurchaseTotals();
}

// إزالة صنف من الشراء
function removePurchaseItem(index) {
    const itemElement = document.querySelector(`[data-index="${index}"]`);
    if (itemElement) {
        itemElement.remove();
        purchaseItems.splice(index, 1);
        updatePurchaseTotals();

        // إعادة ترقيم الأصناف
        const remainingItems = document.querySelectorAll('.purchase-item');
        remainingItems.forEach((item, newIndex) => {
            item.setAttribute('data-index', newIndex);
            const controls = item.querySelectorAll('[onchange*="updatePurchaseItem"]');
            controls.forEach(control => {
                const onchange = control.getAttribute('onchange');
                control.setAttribute('onchange', onchange.replace(/\d+/, newIndex));
            });
            const removeBtn = item.querySelector('[onclick*="removePurchaseItem"]');
            if (removeBtn) {
                removeBtn.setAttribute('onclick', `removePurchaseItem(${newIndex})`);
            }
        });
    }
}

// تحديث مجاميع الشراء
function updatePurchaseTotals() {
    const subtotal = purchaseItems.reduce((sum, item) => sum + item.total, 0);
    const settings = db.getTable('settings');
    const taxRate = settings.taxRate ?? 15;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    document.getElementById('purchaseSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('purchaseTax').textContent = formatCurrency(taxAmount);
    document.getElementById('purchaseTotal').textContent = formatCurrency(total);
}

// حفظ فاتورة الشراء
function savePurchase(event) {
    event.preventDefault();

    try {
        const supplierId = document.getElementById('purchaseSupplier').value;
        const purchaseDate = document.getElementById('purchaseDate').value;
        const invoiceNumber = document.getElementById('invoiceNumber').value.trim();
        const paymentMethod = document.getElementById('paymentMethod').value;
        const notes = document.getElementById('purchaseNotes').value.trim();

        // التحقق من صحة البيانات
        if (!supplierId) {
            showNotification('يرجى اختيار المورد', 'error');
            return;
        }

        // فلترة الأصناف الصحيحة
        const validItems = purchaseItems.filter(item =>
            item.productId && item.quantity > 0 && item.price > 0
        );

        if (validItems.length === 0) {
            showNotification('يرجى إضافة أصناف صحيحة للفاتورة', 'error');
            return;
        }

        // حساب المجاميع
        const subtotal = validItems.reduce((sum, item) => sum + item.total, 0);
        const settings = db.getTable('settings');
        const taxRate = settings.taxRate ?? 15;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;

        // إنشاء فاتورة الشراء
        const purchase = {
            supplierId: supplierId,
            supplierName: db.findById('suppliers', supplierId)?.name || '',
            invoiceNumber: invoiceNumber,
            purchaseDate: purchaseDate,
            items: validItems.map(item => {
                const product = db.findById('products', item.productId);
                return {
                    productId: item.productId,
                    name: product?.name || '',
                    quantity: item.quantity,
                    price: item.price,
                    total: item.total
                };
            }),
            subtotal: subtotal,
            taxRate: taxRate,
            taxAmount: taxAmount,
            total: total,
            paymentMethod: paymentMethod,
            notes: notes,
            status: 'completed'
        };

        // حفظ الفاتورة
        const savedPurchase = db.insert('purchases', purchase);

        if (savedPurchase) {
            // تحديث المخزون
            validItems.forEach(item => {
                const product = db.findById('products', item.productId);
                if (product) {
                    db.update('products', item.productId, {
                        quantity: product.quantity + item.quantity
                    });
                }
            });

            // تحديث رصيد المورد إذا كان الدفع على الحساب
            if (paymentMethod === 'credit') {
                const supplier = db.findById('suppliers', supplierId);
                if (supplier) {
                    db.update('suppliers', supplierId, {
                        balance: supplier.balance + total
                    });
                }
            }

            showNotification('تم حفظ فاتورة الشراء بنجاح', 'success');
            closeModal();

            // إعادة تعيين المتغيرات
            purchaseItems = [];

            loadPurchasesList();
            updateDashboard();

        } else {
            showNotification('خطأ في حفظ فاتورة الشراء', 'error');
        }

    } catch (error) {
        console.error('خطأ في حفظ فاتورة الشراء:', error);
        showNotification('خطأ في حفظ فاتورة الشراء', 'error');
    }
}

// عرض تفاصيل فاتورة الشراء
function viewPurchaseDetails(purchaseId) {
    const purchase = db.findById('purchases', purchaseId);
    if (!purchase) {
        showNotification('فاتورة الشراء غير موجودة', 'error');
        return;
    }

    const supplier = db.findById('suppliers', purchase.supplierId);

    const content = `
        <div class="purchase-details-view">
            <div class="purchase-header-info">
                <h3>فاتورة شراء #${purchase.id}</h3>
                <div class="purchase-meta">
                    <p><strong>المورد:</strong> ${supplier ? supplier.name : 'مورد محذوف'}</p>
                    <p><strong>التاريخ:</strong> ${formatDate(purchase.createdAt, true)}</p>
                    ${purchase.invoiceNumber ? `<p><strong>رقم فاتورة المورد:</strong> ${purchase.invoiceNumber}</p>` : ''}
                    <p><strong>طريقة الدفع:</strong> ${getPaymentMethodText(purchase.paymentMethod)}</p>
                    <p><strong>الحالة:</strong> <span class="status-badge ${purchase.status}">${getStatusText(purchase.status)}</span></p>
                </div>
            </div>

            <div class="purchase-items-details">
                <h4>أصناف الفاتورة</h4>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>المنتج</th>
                            <th>الكمية</th>
                            <th>السعر</th>
                            <th>المجموع</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${purchase.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${db.toArabicNumbers(item.quantity)}</td>
                                <td>${formatCurrency(item.price)}</td>
                                <td>${formatCurrency(item.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="purchase-totals-details">
                <div class="total-row">
                    <span>المجموع الفرعي:</span>
                    <span>${formatCurrency(purchase.subtotal)}</span>
                </div>
                <div class="total-row">
                    <span>الضريبة (${db.toArabicNumbers(purchase.taxRate)}%):</span>
                    <span>${formatCurrency(purchase.taxAmount)}</span>
                </div>
                <div class="total-row total">
                    <span>المجموع الكلي:</span>
                    <span>${formatCurrency(purchase.total)}</span>
                </div>
            </div>

            ${purchase.notes ? `
                <div class="purchase-notes">
                    <h4>ملاحظات:</h4>
                    <p>${purchase.notes}</p>
                </div>
            ` : ''}

            <div class="purchase-actions-section">
                <button class="btn btn-info" onclick="printPurchaseInvoice('${purchaseId}')">
                    <i class="fas fa-print"></i>
                    طباعة الفاتورة
                </button>
                <button class="btn btn-primary" onclick="closeModal(); editPurchase('${purchaseId}')">
                    <i class="fas fa-edit"></i>
                    تعديل
                </button>
                <button class="btn btn-secondary" onclick="closeModal()">
                    إغلاق
                </button>
            </div>
        </div>
    `;

    showModal('تفاصيل فاتورة الشراء', content);
}

// تعديل فاتورة شراء
function editPurchase(purchaseId) {
    const purchase = db.findById('purchases', purchaseId);
    if (!purchase) {
        showNotification('فاتورة الشراء غير موجودة', 'error');
        return;
    }

    const suppliers = db.getTable('suppliers');
    const products = db.getTable('products');

    const content = `
        <form id="editPurchaseForm" onsubmit="updatePurchase(event, '${purchaseId}')">
            <div class="form-grid">
                <div class="form-group">
                    <label for="editPurchaseSupplier">المورد *</label>
                    <select id="editPurchaseSupplier" required>
                        ${suppliers.map(supplier => `
                            <option value="${supplier.id}" ${supplier.id === purchase.supplierId ? 'selected' : ''}>
                                ${supplier.name}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label for="editPurchaseDate">تاريخ الشراء</label>
                    <input type="date" id="editPurchaseDate" value="${new Date(purchase.createdAt).toISOString().split('T')[0]}">
                </div>
            </div>

            <div class="purchase-items-section">
                <h4>أصناف الفاتورة</h4>
                <div id="editPurchaseItems">
                    ${purchase.items.map((item, index) => `
                        <div class="purchase-item-row" data-index="${index}">
                            <select class="item-product" onchange="updateEditItemPrice(${index})">
                                ${products.map(product => `
                                    <option value="${product.id}" data-price="${product.price}" ${product.id === item.productId ? 'selected' : ''}>
                                        ${product.name}
                                    </option>
                                `).join('')}
                            </select>
                            <input type="number" class="item-quantity" value="${item.quantity}" min="1" onchange="updateEditItemTotal(${index})">
                            <input type="number" class="item-price" value="${item.price}" step="0.001" min="0" onchange="updateEditItemTotal(${index})">
                            <input type="number" class="item-total" value="${item.total}" readonly>
                            <button type="button" class="btn btn-danger btn-sm" onclick="removeEditPurchaseItem(${index})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>

                <button type="button" class="btn btn-secondary" onclick="addEditPurchaseItem()">
                    <i class="fas fa-plus"></i>
                    إضافة صنف
                </button>
            </div>

            <div class="purchase-totals">
                <div class="totals-grid">
                    <div class="total-row">
                        <span>المجموع الفرعي:</span>
                        <span id="editPurchaseSubtotal">${formatCurrency(purchase.subtotal)}</span>
                    </div>
                    <div class="total-row">
                        <span>الضريبة:</span>
                        <span id="editPurchaseTax">${formatCurrency(purchase.taxAmount)}</span>
                    </div>
                    <div class="total-row final-total">
                        <span>المجموع الكلي:</span>
                        <span id="editPurchaseTotal">${formatCurrency(purchase.total)}</span>
                    </div>
                </div>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    حفظ التعديلات
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('تعديل فاتورة الشراء', content);
}

// حذف فاتورة شراء
function deletePurchase(purchaseId) {
    if (!confirmDelete('هل أنت متأكد من حذف فاتورة الشراء؟\nسيتم خصم الكميات من المخزون.')) {
        return;
    }

    try {
        const purchase = db.findById('purchases', purchaseId);
        if (!purchase) {
            showNotification('فاتورة الشراء غير موجودة', 'error');
            return;
        }

        // خصم الكميات من المخزون
        const products = db.getTable('products');
        purchase.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                const newQuantity = Math.max(0, product.quantity - item.quantity);
                db.update('products', item.productId, { quantity: newQuantity });
            }
        });

        // تحديث رصيد المورد
        if (purchase.supplierId) {
            const suppliers = db.getTable('suppliers');
            const supplier = suppliers.find(s => s.id === purchase.supplierId);
            if (supplier) {
                const newBalance = supplier.balance - purchase.total;
                db.update('suppliers', purchase.supplierId, { balance: newBalance });
            }
        }

        // حذف فاتورة الشراء
        const success = db.delete('purchases', purchaseId);

        if (success) {
            showNotification('تم حذف فاتورة الشراء بنجاح', 'success');
            loadPurchasesList();
        } else {
            showNotification('خطأ في حذف فاتورة الشراء', 'error');
        }

    } catch (error) {
        console.error('خطأ في حذف فاتورة الشراء:', error);
        showNotification('خطأ في حذف فاتورة الشراء', 'error');
    }
}

// تحديث فاتورة الشراء
function updatePurchase(event, purchaseId) {
    event.preventDefault();

    try {
        const originalPurchase = db.findById('purchases', purchaseId);
        if (!originalPurchase) {
            showNotification('فاتورة الشراء غير موجودة', 'error');
            return;
        }

        // جمع بيانات الأصناف المحدثة
        const itemRows = document.querySelectorAll('#editPurchaseItems .purchase-item-row');
        const items = [];

        itemRows.forEach(row => {
            const productSelect = row.querySelector('.item-product');
            const quantityInput = row.querySelector('.item-quantity');
            const priceInput = row.querySelector('.item-price');
            const totalInput = row.querySelector('.item-total');

            if (productSelect.value && quantityInput.value && priceInput.value) {
                const product = db.findById('products', productSelect.value);
                items.push({
                    productId: productSelect.value,
                    name: product ? product.name : 'منتج محذوف',
                    quantity: parseInt(quantityInput.value),
                    price: parseFloat(priceInput.value),
                    total: parseFloat(totalInput.value)
                });
            }
        });

        if (items.length === 0) {
            showNotification('يجب إضافة صنف واحد على الأقل', 'error');
            return;
        }

        // حساب المجاميع
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const settings = db.getTable('settings');
        const taxRate = settings.taxRate ?? 15;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;

        // استرداد الكميات الأصلية
        const products = db.getTable('products');
        originalPurchase.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                const newQuantity = Math.max(0, product.quantity - item.quantity);
                db.update('products', item.productId, { quantity: newQuantity });
            }
        });

        // إضافة الكميات الجديدة
        items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                const newQuantity = product.quantity + item.quantity;
                db.update('products', item.productId, { quantity: newQuantity });
            }
        });

        // تحديث رصيد المورد
        const supplierId = document.getElementById('editPurchaseSupplier').value;
        if (originalPurchase.supplierId) {
            const suppliers = db.getTable('suppliers');
            const oldSupplier = suppliers.find(s => s.id === originalPurchase.supplierId);
            if (oldSupplier) {
                const newBalance = oldSupplier.balance - originalPurchase.total;
                db.update('suppliers', originalPurchase.supplierId, { balance: newBalance });
            }
        }

        if (supplierId) {
            const suppliers = db.getTable('suppliers');
            const newSupplier = suppliers.find(s => s.id === supplierId);
            if (newSupplier) {
                const newBalance = newSupplier.balance + total;
                db.update('suppliers', supplierId, { balance: newBalance });
            }
        }

        // تحديث فاتورة الشراء
        const updatedPurchase = {
            ...originalPurchase,
            supplierId: supplierId,
            items: items,
            subtotal: subtotal,
            taxAmount: taxAmount,
            total: total,
            updatedAt: new Date().toISOString()
        };

        const success = db.update('purchases', purchaseId, updatedPurchase);

        if (success) {
            showNotification('تم تحديث فاتورة الشراء بنجاح', 'success');
            closeModal();
            loadPurchasesList();
        } else {
            showNotification('خطأ في تحديث فاتورة الشراء', 'error');
        }

    } catch (error) {
        console.error('خطأ في تحديث فاتورة الشراء:', error);
        showNotification('خطأ في تحديث فاتورة الشراء', 'error');
    }
}

// إضافة صنف جديد في تعديل الشراء
function addEditPurchaseItem() {
    const container = document.getElementById('editPurchaseItems');
    const products = db.getTable('products');
    const index = container.children.length;

    const itemRow = document.createElement('div');
    itemRow.className = 'purchase-item-row';
    itemRow.setAttribute('data-index', index);

    itemRow.innerHTML = `
        <select class="item-product" onchange="updateEditItemPrice(${index})">
            <option value="">اختر منتج</option>
            ${products.map(product => `
                <option value="${product.id}" data-price="${product.price}">
                    ${product.name}
                </option>
            `).join('')}
        </select>
        <input type="number" class="item-quantity" value="1" min="1" onchange="updateEditItemTotal(${index})">
        <input type="number" class="item-price" value="0" step="0.001" min="0" onchange="updateEditItemTotal(${index})">
        <input type="number" class="item-total" value="0" readonly>
        <button type="button" class="btn btn-danger btn-sm" onclick="removeEditPurchaseItem(${index})">
            <i class="fas fa-trash"></i>
        </button>
    `;

    container.appendChild(itemRow);
}

// حذف صنف من تعديل الشراء
function removeEditPurchaseItem(index) {
    const row = document.querySelector(`#editPurchaseItems .purchase-item-row[data-index="${index}"]`);
    if (row) {
        row.remove();
        updateEditPurchaseTotals();
    }
}

// تحديث سعر الصنف في تعديل الشراء
function updateEditItemPrice(index) {
    const row = document.querySelector(`#editPurchaseItems .purchase-item-row[data-index="${index}"]`);
    if (!row) return;

    const productSelect = row.querySelector('.item-product');
    const priceInput = row.querySelector('.item-price');

    const selectedOption = productSelect.options[productSelect.selectedIndex];
    if (selectedOption && selectedOption.dataset.price) {
        priceInput.value = selectedOption.dataset.price;
        updateEditItemTotal(index);
    }
}

// تحديث مجموع الصنف في تعديل الشراء
function updateEditItemTotal(index) {
    const row = document.querySelector(`#editPurchaseItems .purchase-item-row[data-index="${index}"]`);
    if (!row) return;

    const quantityInput = row.querySelector('.item-quantity');
    const priceInput = row.querySelector('.item-price');
    const totalInput = row.querySelector('.item-total');

    const quantity = parseInt(quantityInput.value) || 0;
    const price = parseFloat(priceInput.value) || 0;
    const total = quantity * price;

    totalInput.value = total.toFixed(3);
    updateEditPurchaseTotals();
}

// تحديث مجاميع تعديل الشراء
function updateEditPurchaseTotals() {
    const itemRows = document.querySelectorAll('#editPurchaseItems .purchase-item-row');
    let subtotal = 0;

    itemRows.forEach(row => {
        const totalInput = row.querySelector('.item-total');
        subtotal += parseFloat(totalInput.value) || 0;
    });

    const settings = db.getTable('settings');
    const taxRate = settings.taxRate ?? 15;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    document.getElementById('editPurchaseSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('editPurchaseTax').textContent = formatCurrency(taxAmount);
    document.getElementById('editPurchaseTotal').textContent = formatCurrency(total);
}

// طباعة فاتورة الشراء
function printPurchaseInvoice(purchaseId) {
    const purchase = db.findById('purchases', purchaseId);
    if (!purchase) return;

    const supplier = db.findById('suppliers', purchase.supplierId);
    const settings = db.getTable('settings');

    const invoiceContent = `
        <div class="invoice">
            <div class="invoice-header">
                <h2>${settings.companyName}</h2>
                <h3>فاتورة شراء</h3>
                ${settings.companyAddress ? `<p>${settings.companyAddress}</p>` : ''}
                ${settings.companyPhone ? `<p>هاتف: ${settings.companyPhone}</p>` : ''}
            </div>

            <div class="invoice-info">
                <div class="invoice-number">فاتورة رقم: ${db.toArabicNumbers(purchase.id)}</div>
                <div class="invoice-date">التاريخ: ${formatDate(purchase.createdAt, true)}</div>
                <div class="supplier-info">المورد: ${supplier ? supplier.name : 'غير محدد'}</div>
                ${purchase.invoiceNumber ? `<div class="supplier-invoice">رقم فاتورة المورد: ${purchase.invoiceNumber}</div>` : ''}
            </div>

            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>المنتج</th>
                        <th>الكمية</th>
                        <th>السعر</th>
                        <th>المجموع</th>
                    </tr>
                </thead>
                <tbody>
                    ${purchase.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${db.toArabicNumbers(item.quantity)}</td>
                            <td>${formatCurrency(item.price)}</td>
                            <td>${formatCurrency(item.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="invoice-summary">
                <div class="summary-row">
                    <span>المجموع الفرعي:</span>
                    <span>${formatCurrency(purchase.subtotal)}</span>
                </div>
                <div class="summary-row">
                    <span>الضريبة (${db.toArabicNumbers(purchase.taxRate)}%):</span>
                    <span>${formatCurrency(purchase.taxAmount)}</span>
                </div>
                <div class="summary-row total">
                    <span>المجموع الكلي:</span>
                    <span>${formatCurrency(purchase.total)}</span>
                </div>
            </div>

            ${purchase.notes ? `
                <div class="invoice-notes">
                    <p><strong>ملاحظات:</strong> ${purchase.notes}</p>
                </div>
            ` : ''}
        </div>

        <style>
            .invoice { font-family: 'Cairo', sans-serif; max-width: 600px; margin: 0 auto; }
            .invoice-header { text-align: center; margin-bottom: 2rem; }
            .invoice-info { margin-bottom: 1rem; }
            .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
            .invoice-table th, .invoice-table td { padding: 0.5rem; border-bottom: 1px solid #ddd; text-align: right; }
            .invoice-summary .summary-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
            .invoice-summary .total { font-weight: bold; font-size: 1.2rem; border-top: 2px solid #333; padding-top: 0.5rem; }
            .invoice-notes { margin-top: 2rem; }
        </style>
    `;

    printContent(invoiceContent, 'فاتورة شراء');
}

// تحميل قسم الديون والمدفوعات
function loadDebtsSection() {
    const section = document.getElementById('debts');
    if (!section) return;

    section.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-money-bill-wave"></i> إدارة الديون والمدفوعات</h2>
            <div class="header-actions">
                <button class="btn btn-success" onclick="showQuickPaymentModal()">
                    <i class="fas fa-plus"></i>
                    دفعة سريعة
                </button>
                <button class="btn btn-info" onclick="showPaymentsHistory()">
                    <i class="fas fa-history"></i>
                    سجل المدفوعات
                </button>
            </div>
        </div>

        <div class="debts-summary">
            <div class="summary-cards">
                <div class="debt-summary-card customers">
                    <div class="card-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="card-info">
                        <h3 id="totalCustomerDebts">٠.٠٠ ر.س</h3>
                        <p>إجمالي ديون العملاء</p>
                        <span id="customersWithDebts">٠ عميل</span>
                    </div>
                </div>

                <div class="debt-summary-card suppliers">
                    <div class="card-icon">
                        <i class="fas fa-truck"></i>
                    </div>
                    <div class="card-info">
                        <h3 id="totalSupplierDebts">٠.٠٠ ر.س</h3>
                        <p>إجمالي مستحقات الموردين</p>
                        <span id="suppliersWithDebts">٠ مورد</span>
                    </div>
                </div>

                <div class="debt-summary-card payments">
                    <div class="card-icon">
                        <i class="fas fa-money-bill"></i>
                    </div>
                    <div class="card-info">
                        <h3 id="todayPayments">٠.٠٠ ر.س</h3>
                        <p>مدفوعات اليوم</p>
                        <span id="todayPaymentsCount">٠ دفعة</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="debts-tabs">
            <button class="tab-btn active" onclick="showDebtsTab('customers')">
                <i class="fas fa-users"></i>
                ديون العملاء
            </button>
            <button class="tab-btn" onclick="showDebtsTab('suppliers')">
                <i class="fas fa-truck"></i>
                مستحقات الموردين
            </button>
            <button class="tab-btn" onclick="showDebtsTab('payments')">
                <i class="fas fa-receipt"></i>
                سجل المدفوعات
            </button>
        </div>

        <div class="debts-content">
            <!-- ديون العملاء -->
            <div id="customersDebts" class="debts-tab active">
                <div class="filters-container">
                    <div class="filter-group search-filter-container">
                        <label class="filter-label">البحث في العملاء</label>
                        <input type="text" id="customerDebtsSearch" class="search-filter-input" placeholder="ابحث بالاسم أو الهاتف..." onkeyup="searchCustomerDebts()">
                        <i class="fas fa-search search-filter-icon"></i>
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">حالة الدين</label>
                        <select id="customerDebtsFilter" class="filter-select" onchange="filterCustomerDebts()">
                            <option value="all">جميع العملاء</option>
                            <option value="overdue">متأخرة</option>
                            <option value="recent">حديثة</option>
                        </select>
                    </div>

                    <div class="filter-actions">
                        <button class="filter-btn secondary" onclick="clearCustomerDebtsFilters()">
                            <i class="fas fa-times"></i>
                            مسح الفلاتر
                        </button>
                    </div>
                </div>

                <div class="debts-list" id="customerDebtsList">
                    <div class="loading">جاري تحميل ديون العملاء...</div>
                </div>
            </div>

            <!-- مستحقات الموردين -->
            <div id="suppliersDebts" class="debts-tab">
                <div class="filters-container">
                    <div class="filter-group search-filter-container">
                        <label class="filter-label">البحث في الموردين</label>
                        <input type="text" id="supplierDebtsSearch" class="search-filter-input" placeholder="ابحث بالاسم أو الشركة..." onkeyup="searchSupplierDebts()">
                        <i class="fas fa-search search-filter-icon"></i>
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">حالة المستحقات</label>
                        <select id="supplierDebtsFilter" class="filter-select" onchange="filterSupplierDebts()">
                            <option value="all">جميع الموردين</option>
                            <option value="overdue">متأخرة</option>
                            <option value="recent">حديثة</option>
                        </select>
                    </div>

                    <div class="filter-actions">
                        <button class="filter-btn secondary" onclick="clearSupplierDebtsFilters()">
                            <i class="fas fa-times"></i>
                            مسح الفلاتر
                        </button>
                    </div>
                </div>

                <div class="debts-list" id="supplierDebtsList">
                    <div class="loading">جاري تحميل مستحقات الموردين...</div>
                </div>
            </div>

            <!-- سجل المدفوعات -->
            <div id="paymentsHistory" class="debts-tab">
                <div class="filters-container">
                    <div class="filter-group search-filter-container">
                        <label class="filter-label">البحث في المدفوعات</label>
                        <input type="text" id="paymentsSearch" class="search-filter-input" placeholder="ابحث بالمبلغ أو الملاحظات..." onkeyup="searchPayments()">
                        <i class="fas fa-search search-filter-icon"></i>
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">نوع المدفوعات</label>
                        <select id="paymentsTypeFilter" class="filter-select" onchange="filterPayments()">
                            <option value="all">جميع المدفوعات</option>
                            <option value="payment">دفعات العملاء</option>
                            <option value="supplier_payment">دفعات الموردين</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">التاريخ</label>
                        <input type="date" id="paymentsDateFilter" class="date-picker-input" onchange="filterPayments()">
                    </div>

                    <div class="filter-actions">
                        <button class="filter-btn secondary" onclick="clearPaymentsFilters()">
                            <i class="fas fa-times"></i>
                            مسح الفلاتر
                        </button>
                    </div>
                </div>

                <div class="payments-list" id="paymentsList">
                    <div class="loading">جاري تحميل سجل المدفوعات...</div>
                </div>
            </div>
        </div>
    `;

    updateDebtsStatistics();
    loadCustomerDebts();
}

// تحديث إحصائيات الديون
function updateDebtsStatistics() {
    try {
        const customers = db.getTable('customers');
        const suppliers = db.getTable('suppliers');
        const payments = db.getTable('payments');

        // حساب ديون العملاء
        const customersWithNegativeBalance = customers.filter(c => c.balance < 0 && c.id !== 'guest');
        const totalCustomerDebts = customersWithNegativeBalance.reduce((sum, c) => sum + Math.abs(c.balance), 0);

        // حساب مستحقات الموردين
        const suppliersWithPositiveBalance = suppliers.filter(s => s.balance > 0);
        const totalSupplierDebts = suppliersWithPositiveBalance.reduce((sum, s) => sum + s.balance, 0);

        // حساب مدفوعات اليوم
        const today = new Date().toDateString();
        const todayPayments = payments.filter(p => new Date(p.createdAt).toDateString() === today);
        const todayPaymentsTotal = todayPayments.reduce((sum, p) => sum + p.amount, 0);

        // تحديث العرض
        document.getElementById('totalCustomerDebts').textContent = formatCurrency(totalCustomerDebts);
        document.getElementById('customersWithDebts').textContent = `${db.toArabicNumbers(customersWithNegativeBalance.length)} عميل`;

        document.getElementById('totalSupplierDebts').textContent = formatCurrency(totalSupplierDebts);
        document.getElementById('suppliersWithDebts').textContent = `${db.toArabicNumbers(suppliersWithPositiveBalance.length)} مورد`;

        document.getElementById('todayPayments').textContent = formatCurrency(todayPaymentsTotal);
        document.getElementById('todayPaymentsCount').textContent = `${db.toArabicNumbers(todayPayments.length)} دفعة`;

    } catch (error) {
        console.error('خطأ في تحديث إحصائيات الديون:', error);
    }
}

// عرض تبويب الديون
function showDebtsTab(tabName) {
    // إخفاء جميع التبويبات
    const tabs = document.querySelectorAll('.debts-tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    const tabBtns = document.querySelectorAll('.debts-tabs .tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));

    // عرض التبويب المطلوب
    const targetTab = document.getElementById(tabName + (tabName === 'customers' ? 'Debts' : tabName === 'suppliers' ? 'Debts' : 'History'));
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // تفعيل الزر المناسب
    const activeBtn = document.querySelector(`[onclick="showDebtsTab('${tabName}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // تحميل البيانات المناسبة
    switch (tabName) {
        case 'customers':
            loadCustomerDebts();
            break;
        case 'suppliers':
            loadSupplierDebts();
            break;
        case 'payments':
            loadPaymentsHistory();
            break;
    }
}

// تحميل ديون العملاء
function loadCustomerDebts() {
    try {
        const customers = db.getTable('customers');
        const list = document.getElementById('customerDebtsList');

        if (!list) return;

        // فلترة العملاء الذين لديهم ديون
        const customersWithDebts = customers.filter(c => c.balance < 0 && c.id !== 'guest');

        if (customersWithDebts.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-smile"></i>
                    <h3>لا توجد ديون للعملاء</h3>
                    <p>جميع العملاء قاموا بسداد مستحقاتهم</p>
                </div>
            `;
            return;
        }

        // ترتيب العملاء حسب قيمة الدين (الأكبر أولاً)
        const sortedCustomers = customersWithDebts.sort((a, b) => a.balance - b.balance);

        list.innerHTML = sortedCustomers.map(customer => {
            const debtAmount = Math.abs(customer.balance);
            const daysSinceLastUpdate = Math.floor((new Date() - new Date(customer.updatedAt || customer.createdAt)) / (1000 * 60 * 60 * 24));
            const isOverdue = daysSinceLastUpdate > 30;

            return `
                <div class="debt-item customer-debt ${isOverdue ? 'overdue' : 'recent'}" data-customer="${customer.id}">
                    <div class="debt-info">
                        <div class="debtor-details">
                            <h4>${customer.name}</h4>
                            <p class="contact-info">
                                ${customer.phone ? `<i class="fas fa-phone"></i> ${customer.phone}` : ''}
                                ${customer.email ? `<i class="fas fa-envelope"></i> ${customer.email}` : ''}
                            </p>
                            <p class="debt-age">
                                <i class="fas fa-clock"></i>
                                آخر تحديث: ${db.toArabicNumbers(daysSinceLastUpdate)} يوم
                                ${isOverdue ? '<span class="overdue-badge">متأخر</span>' : ''}
                            </p>
                        </div>

                        <div class="debt-amount">
                            <span class="amount">${formatCurrency(debtAmount)}</span>
                            <span class="label">مبلغ الدين</span>
                        </div>
                    </div>

                    <div class="debt-actions">
                        <button class="btn btn-success btn-sm" onclick="addPayment('${customer.id}')">
                            <i class="fas fa-money-bill"></i>
                            دفعة
                        </button>
                        <button class="btn btn-info btn-sm" onclick="viewCustomerHistory('${customer.id}')">
                            <i class="fas fa-history"></i>
                            السجل
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="sendDebtReminder('${customer.id}')">
                            <i class="fas fa-bell"></i>
                            تذكير
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('خطأ في تحميل ديون العملاء:', error);
        showNotification('خطأ في تحميل ديون العملاء', 'error');
    }
}

// تحميل مستحقات الموردين
function loadSupplierDebts() {
    try {
        const suppliers = db.getTable('suppliers');
        const list = document.getElementById('supplierDebtsList');

        if (!list) return;

        // فلترة الموردين الذين لهم مستحقات
        const suppliersWithDebts = suppliers.filter(s => s.balance > 0);

        if (suppliersWithDebts.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h3>لا توجد مستحقات للموردين</h3>
                    <p>تم سداد جميع مستحقات الموردين</p>
                </div>
            `;
            return;
        }

        // ترتيب الموردين حسب قيمة المستحقات (الأكبر أولاً)
        const sortedSuppliers = suppliersWithDebts.sort((a, b) => b.balance - a.balance);

        list.innerHTML = sortedSuppliers.map(supplier => {
            const debtAmount = supplier.balance;
            const daysSinceLastUpdate = Math.floor((new Date() - new Date(supplier.updatedAt || supplier.createdAt)) / (1000 * 60 * 60 * 24));
            const isOverdue = daysSinceLastUpdate > 30;

            return `
                <div class="debt-item supplier-debt ${isOverdue ? 'overdue' : 'recent'}" data-supplier="${supplier.id}">
                    <div class="debt-info">
                        <div class="debtor-details">
                            <h4>${supplier.name}</h4>
                            <p class="contact-info">
                                ${supplier.phone ? `<i class="fas fa-phone"></i> ${supplier.phone}` : ''}
                                ${supplier.email ? `<i class="fas fa-envelope"></i> ${supplier.email}` : ''}
                            </p>
                            <p class="debt-age">
                                <i class="fas fa-clock"></i>
                                آخر تحديث: ${db.toArabicNumbers(daysSinceLastUpdate)} يوم
                                ${isOverdue ? '<span class="overdue-badge">متأخر</span>' : ''}
                            </p>
                        </div>

                        <div class="debt-amount">
                            <span class="amount">${formatCurrency(debtAmount)}</span>
                            <span class="label">مبلغ المستحقات</span>
                        </div>
                    </div>

                    <div class="debt-actions">
                        <button class="btn btn-success btn-sm" onclick="addSupplierPayment('${supplier.id}')">
                            <i class="fas fa-money-bill"></i>
                            دفعة
                        </button>
                        <button class="btn btn-info btn-sm" onclick="viewSupplierHistory('${supplier.id}')">
                            <i class="fas fa-history"></i>
                            السجل
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="schedulePayment('${supplier.id}')">
                            <i class="fas fa-calendar"></i>
                            جدولة
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('خطأ في تحميل مستحقات الموردين:', error);
        showNotification('خطأ في تحميل مستحقات الموردين', 'error');
    }
}

// تحميل سجل المدفوعات
function loadPaymentsHistory() {
    try {
        const payments = db.getTable('payments');
        const list = document.getElementById('paymentsList');

        if (!list) return;

        if (payments.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <h3>لا توجد مدفوعات</h3>
                    <p>لم يتم تسجيل أي مدفوعات بعد</p>
                </div>
            `;
            return;
        }

        // ترتيب المدفوعات حسب التاريخ (الأحدث أولاً)
        const sortedPayments = payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        list.innerHTML = sortedPayments.map(payment => {
            const isCustomerPayment = payment.customerId;
            const payerName = payment.customerName || payment.supplierName || 'غير محدد';
            const paymentTypeText = isCustomerPayment ? 'دفعة عميل' : 'دفعة مورد';
            const methodText = getPaymentMethodText(payment.method);

            return `
                <div class="payment-item ${payment.category || 'payment'}" data-type="${isCustomerPayment ? 'payment' : 'supplier_payment'}" data-date="${payment.createdAt.split('T')[0]}">
                    <div class="payment-info">
                        <div class="payment-details">
                            <h4>${payerName}</h4>
                            <p class="payment-type">
                                <i class="fas ${isCustomerPayment ? 'fa-user' : 'fa-truck'}"></i>
                                ${paymentTypeText} - ${methodText}
                            </p>
                            <p class="payment-date">
                                <i class="fas fa-calendar"></i>
                                ${formatDate(payment.createdAt, true)}
                            </p>
                            ${payment.notes ? `<p class="payment-notes"><i class="fas fa-sticky-note"></i> ${payment.notes}</p>` : ''}
                        </div>

                        <div class="payment-amount">
                            <span class="amount">${formatCurrency(payment.amount)}</span>
                            <span class="label">مبلغ الدفعة</span>
                        </div>
                    </div>

                    <div class="payment-actions">
                        <button class="btn btn-info btn-sm" onclick="printPaymentReceipt('${payment.id}')">
                            <i class="fas fa-print"></i>
                            طباعة
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="viewPaymentDetails('${payment.id}')">
                            <i class="fas fa-eye"></i>
                            تفاصيل
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('خطأ في تحميل سجل المدفوعات:', error);
        showNotification('خطأ في تحميل سجل المدفوعات', 'error');
    }
}

// البحث في ديون العملاء
function searchCustomerDebts() {
    const searchTerm = document.getElementById('customerDebtsSearch').value.toLowerCase();
    const debtItems = document.querySelectorAll('.customer-debt');

    debtItems.forEach(item => {
        const customerName = item.querySelector('h4').textContent.toLowerCase();
        const contactInfo = item.querySelector('.contact-info').textContent.toLowerCase();

        if (customerName.includes(searchTerm) || contactInfo.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// فلترة ديون العملاء
function filterCustomerDebts() {
    const selectedFilter = document.getElementById('customerDebtsFilter').value;
    const debtItems = document.querySelectorAll('.customer-debt');

    debtItems.forEach(item => {
        const isOverdue = item.classList.contains('overdue');

        let showItem = true;

        if (selectedFilter === 'overdue' && !isOverdue) {
            showItem = false;
        } else if (selectedFilter === 'recent' && isOverdue) {
            showItem = false;
        }

        item.style.display = showItem ? 'block' : 'none';
    });
}

// البحث في مستحقات الموردين
function searchSupplierDebts() {
    const searchTerm = document.getElementById('supplierDebtsSearch').value.toLowerCase();
    const debtItems = document.querySelectorAll('.supplier-debt');

    debtItems.forEach(item => {
        const supplierName = item.querySelector('h4').textContent.toLowerCase();
        const contactInfo = item.querySelector('.contact-info').textContent.toLowerCase();

        if (supplierName.includes(searchTerm) || contactInfo.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// فلترة مستحقات الموردين
function filterSupplierDebts() {
    const selectedFilter = document.getElementById('supplierDebtsFilter').value;
    const debtItems = document.querySelectorAll('.supplier-debt');

    debtItems.forEach(item => {
        const isOverdue = item.classList.contains('overdue');

        let showItem = true;

        if (selectedFilter === 'overdue' && !isOverdue) {
            showItem = false;
        } else if (selectedFilter === 'recent' && isOverdue) {
            showItem = false;
        }

        item.style.display = showItem ? 'block' : 'none';
    });
}

// البحث في المدفوعات
function searchPayments() {
    const searchTerm = document.getElementById('paymentsSearch').value.toLowerCase();
    const paymentItems = document.querySelectorAll('.payment-item');

    paymentItems.forEach(item => {
        const payerName = item.querySelector('h4').textContent.toLowerCase();
        const paymentType = item.querySelector('.payment-type').textContent.toLowerCase();
        const notes = item.querySelector('.payment-notes');
        const notesText = notes ? notes.textContent.toLowerCase() : '';

        if (payerName.includes(searchTerm) || paymentType.includes(searchTerm) || notesText.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// فلترة المدفوعات
function filterPayments() {
    const selectedType = document.getElementById('paymentsTypeFilter').value;
    const selectedDate = document.getElementById('paymentsDateFilter').value;
    const paymentItems = document.querySelectorAll('.payment-item');

    paymentItems.forEach(item => {
        const itemType = item.getAttribute('data-type');
        const itemDate = item.getAttribute('data-date');

        let showItem = true;

        if (selectedType !== 'all' && itemType !== selectedType) {
            showItem = false;
        }

        if (selectedDate && itemDate !== selectedDate) {
            showItem = false;
        }

        item.style.display = showItem ? 'block' : 'none';
    });
}

// مسح فلاتر ديون العملاء
function clearCustomerDebtsFilters() {
    document.getElementById('customerDebtsSearch').value = '';
    document.getElementById('customerDebtsFilter').value = 'all';
    loadCustomerDebts();
}

// مسح فلاتر مستحقات الموردين
function clearSupplierDebtsFilters() {
    document.getElementById('supplierDebtsSearch').value = '';
    document.getElementById('supplierDebtsFilter').value = 'all';
    loadSupplierDebts();
}

// مسح فلاتر المدفوعات
function clearPaymentsFilters() {
    document.getElementById('paymentsSearch').value = '';
    document.getElementById('paymentsTypeFilter').value = 'all';
    document.getElementById('paymentsDateFilter').value = '';
    loadPaymentsHistory();
}

// عرض تفاصيل المخزون المنخفض
function showLowStockDetails() {
    try {
        const stats = db.getQuickStats();
        const { lowStockDetails, lowStockThreshold } = stats;

        if (lowStockDetails.length === 0) {
            showNotification('لا توجد منتجات منخفضة المخزون حالياً', 'info');
            return;
        }

        // تجميع البيانات حسب المخزن
        const warehouseGroups = {};
        lowStockDetails.forEach(item => {
            if (!warehouseGroups[item.warehouseId]) {
                warehouseGroups[item.warehouseId] = {
                    name: item.warehouseName,
                    items: []
                };
            }
            warehouseGroups[item.warehouseId].items.push(item);
        });

        const content = `
            <div class="low-stock-page">
                <div class="low-stock-header">
                    <h2 class="low-stock-title">
                        <i class="fas fa-exclamation-triangle"></i>
                        تقرير المخزون المنخفض
                    </h2>
                    <button class="btn btn-secondary" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                        إغلاق
                    </button>
                </div>

                <div class="low-stock-summary">
                    <div class="low-stock-summary-card">
                        <h3>${db.toArabicNumbers(lowStockDetails.length)}</h3>
                        <p>إجمالي العناصر المنخفضة</p>
                    </div>
                    <div class="low-stock-summary-card">
                        <h3>${db.toArabicNumbers(Object.keys(warehouseGroups).length)}</h3>
                        <p>المخازن المتأثرة</p>
                    </div>
                    <div class="low-stock-summary-card">
                        <h3>${db.toArabicNumbers(lowStockThreshold)}</h3>
                        <p>حد التنبيه الحالي</p>
                    </div>
                </div>

                ${Object.entries(warehouseGroups).map(([warehouseId, warehouse]) => `
                    <div class="warehouse-section">
                        <div class="warehouse-section-header">
                            <h3 class="warehouse-section-title">${warehouse.name}</h3>
                            <span class="warehouse-section-count">${db.toArabicNumbers(warehouse.items.length)} منتج</span>
                        </div>

                        <table class="low-stock-table">
                            <thead>
                                <tr>
                                    <th>المنتج</th>
                                    <th>الكمية الحالية</th>
                                    <th>الحد الأدنى</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${warehouse.items.map(item => `
                                    <tr>
                                        <td class="product-name">${item.productName}</td>
                                        <td class="current-qty">${db.toArabicNumbers(item.quantity)}</td>
                                        <td class="threshold-qty">${db.toArabicNumbers(item.threshold)}</td>
                                        <td>
                                            <span class="stock-status-badge ${item.status}">
                                                ${item.status === 'out-of-stock' ? 'نفد المخزون' : 'مخزون منخفض'}
                                            </span>
                                        </td>
                                        <td class="actions">
                                            <button class="btn btn-sm btn-primary" onclick="adjustInventory('${item.productId}')">
                                                <i class="fas fa-plus"></i>
                                                تعديل المخزون
                                            </button>
                                            <button class="btn btn-sm btn-info" onclick="transferInventory('${item.productId}')">
                                                <i class="fas fa-exchange-alt"></i>
                                                نقل
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `).join('')}
            </div>
        `;

        showModal('تقرير المخزون المنخفض', content, 'large');

    } catch (error) {
        console.error('خطأ في عرض تفاصيل المخزون المنخفض:', error);
        showNotification('خطأ في تحميل تفاصيل المخزون المنخفض', 'error');
    }
}

// عرض نافذة دفعة سريعة
function showQuickPaymentModal() {
    const customers = db.getTable('customers').filter(c => c.balance < 0 && c.id !== 'guest');
    const suppliers = db.getTable('suppliers').filter(s => s.balance > 0);

    if (customers.length === 0 && suppliers.length === 0) {
        showNotification('لا توجد ديون أو مستحقات للدفع', 'info');
        return;
    }

    const content = `
        <form id="quickPaymentForm" onsubmit="saveQuickPayment(event)">
            <div class="form-group">
                <label for="paymentTarget">الدفع إلى</label>
                <select id="paymentTarget" onchange="updateQuickPaymentInfo()" required>
                    <option value="">اختر العميل أو المورد</option>
                    ${customers.length > 0 ? '<optgroup label="العملاء">' : ''}
                    ${customers.map(customer =>
                        `<option value="customer:${customer.id}" data-balance="${customer.balance}">${customer.name} - ${formatCurrency(Math.abs(customer.balance))}</option>`
                    ).join('')}
                    ${customers.length > 0 ? '</optgroup>' : ''}
                    ${suppliers.length > 0 ? '<optgroup label="الموردين">' : ''}
                    ${suppliers.map(supplier =>
                        `<option value="supplier:${supplier.id}" data-balance="${supplier.balance}">${supplier.name} - ${formatCurrency(supplier.balance)}</option>`
                    ).join('')}
                    ${suppliers.length > 0 ? '</optgroup>' : ''}
                </select>
            </div>

            <div id="paymentInfo" class="payment-info-display" style="display: none;">
                <p>الرصيد الحالي: <span id="currentBalance"></span></p>
            </div>

            <div class="form-group">
                <label for="quickPaymentAmount">مبلغ الدفعة *</label>
                <input type="number" id="quickPaymentAmount" step="0.01" min="0.01" required>
            </div>

            <div class="form-group">
                <label for="quickPaymentMethod">طريقة الدفع</label>
                <select id="quickPaymentMethod">
                    <option value="cash">نقداً</option>
                    <option value="bank">تحويل بنكي</option>
                    <option value="check">شيك</option>
                </select>
            </div>

            <div class="form-group">
                <label for="quickPaymentNotes">ملاحظات</label>
                <textarea id="quickPaymentNotes" rows="3"></textarea>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-success">
                    <i class="fas fa-save"></i>
                    حفظ الدفعة
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('دفعة سريعة', content);
}

// تحديث معلومات الدفعة السريعة
function updateQuickPaymentInfo() {
    const select = document.getElementById('paymentTarget');
    const selectedOption = select.selectedOptions[0];
    const paymentInfo = document.getElementById('paymentInfo');
    const currentBalance = document.getElementById('currentBalance');

    if (selectedOption && selectedOption.value) {
        const balance = parseFloat(selectedOption.getAttribute('data-balance'));
        const [type] = selectedOption.value.split(':');

        if (type === 'customer') {
            currentBalance.innerHTML = `<span class="negative">${formatCurrency(Math.abs(balance))} (دين)</span>`;
        } else {
            currentBalance.innerHTML = `<span class="positive">${formatCurrency(balance)} (مستحقات)</span>`;
        }

        paymentInfo.style.display = 'block';
    } else {
        paymentInfo.style.display = 'none';
    }
}

// حفظ الدفعة السريعة
function saveQuickPayment(event) {
    event.preventDefault();

    try {
        const target = document.getElementById('paymentTarget').value;
        const amount = parseFloat(document.getElementById('quickPaymentAmount').value);
        const method = document.getElementById('quickPaymentMethod').value;
        const notes = document.getElementById('quickPaymentNotes').value.trim();

        if (!target) {
            showNotification('يرجى اختيار العميل أو المورد', 'error');
            return;
        }

        if (!amount || amount <= 0) {
            showNotification('يرجى إدخال مبلغ صحيح', 'error');
            return;
        }

        const [type, id] = target.split(':');

        if (type === 'customer') {
            // دفعة عميل
            const customer = db.findById('customers', id);
            if (!customer) {
                showNotification('العميل غير موجود', 'error');
                return;
            }

            const payment = {
                customerId: id,
                customerName: customer.name,
                amount: amount,
                method: method,
                notes: notes,
                type: 'payment'
            };

            const savedPayment = db.insert('payments', payment);
            if (savedPayment) {
                db.update('customers', id, { balance: customer.balance + amount });
                showNotification('تم حفظ دفعة العميل بنجاح', 'success');
            }

        } else if (type === 'supplier') {
            // دفعة مورد
            const supplier = db.findById('suppliers', id);
            if (!supplier) {
                showNotification('المورد غير موجود', 'error');
                return;
            }

            const payment = {
                supplierId: id,
                supplierName: supplier.name,
                amount: amount,
                method: method,
                notes: notes,
                type: 'payment',
                category: 'supplier_payment'
            };

            const savedPayment = db.insert('payments', payment);
            if (savedPayment) {
                db.update('suppliers', id, { balance: supplier.balance - amount });
                showNotification('تم حفظ دفعة المورد بنجاح', 'success');
            }
        }

        closeModal();
        updateDebtsStatistics();
        loadCustomerDebts();
        loadSupplierDebts();
        loadPaymentsHistory();

    } catch (error) {
        console.error('خطأ في حفظ الدفعة السريعة:', error);
        showNotification('خطأ في حفظ الدفعة السريعة', 'error');
    }
}

// تحميل قسم التقارير
function loadReportsSection() {
    const section = document.getElementById('reports');
    if (!section) return;

    section.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-chart-bar"></i> التقارير والإحصائيات</h2>
            <div class="header-actions">
                <button class="btn btn-info" onclick="generateAllReports()">
                    <i class="fas fa-file-alt"></i>
                    تقرير شامل
                </button>
            </div>
        </div>

        <div class="filters-container">
            <div class="filter-group">
                <label class="filter-label">من تاريخ</label>
                <input type="date" id="reportDateFrom" class="date-picker-input" onchange="updateReports()" data-default-today="true">
            </div>
            <div class="filter-group">
                <label class="filter-label">إلى تاريخ</label>
                <input type="date" id="reportDateTo" class="date-picker-input" onchange="updateReports()" data-default-today="true">
            </div>
            <div class="filter-group">
                <button class="btn btn-secondary" onclick="setDateRange('today')">اليوم</button>
                <button class="btn btn-secondary" onclick="setDateRange('week')">هذا الأسبوع</button>
                <button class="btn btn-secondary" onclick="setDateRange('month')">هذا الشهر</button>
                <button class="btn btn-secondary" onclick="setDateRange('year')">هذا العام</button>
            </div>
        </div>

        <div class="reports-grid">
            <!-- تقرير المبيعات -->
            <div class="report-card">
                <div class="report-header">
                    <h3><i class="fas fa-shopping-cart"></i> تقرير المبيعات</h3>
                    <button class="btn btn-sm btn-info" onclick="printSalesReport()">
                        <i class="fas fa-print"></i>
                        طباعة
                    </button>
                </div>
                <div class="report-content">
                    <div class="report-stats">
                        <div class="stat-item">
                            <span class="stat-label">عدد الفواتير:</span>
                            <span class="stat-value" id="salesCount">٠</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">إجمالي المبيعات:</span>
                            <span class="stat-value" id="salesTotal">٠.٠٠ ر.س</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">متوسط الفاتورة:</span>
                            <span class="stat-value" id="salesAverage">٠.٠٠ ر.س</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">إجمالي الضريبة:</span>
                            <span class="stat-value" id="salesTax">٠.٠٠ ر.س</span>
                        </div>
                    </div>
                    <div class="report-chart">
                        <canvas id="salesReportChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>

            <!-- تقرير المخزون -->
            <div class="report-card">
                <div class="report-header">
                    <h3><i class="fas fa-box"></i> تقرير المخزون</h3>
                    <button class="btn btn-sm btn-info" onclick="printInventoryReport()">
                        <i class="fas fa-print"></i>
                        طباعة
                    </button>
                </div>
                <div class="report-content">
                    <div class="report-stats">
                        <div class="stat-item">
                            <span class="stat-label">إجمالي المنتجات:</span>
                            <span class="stat-value" id="inventoryCount">٠</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">قيمة المخزون:</span>
                            <span class="stat-value" id="inventoryValue">٠.٠٠ ر.س</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">منتجات منخفضة:</span>
                            <span class="stat-value" id="lowStockCount">٠</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">منتجات نافدة:</span>
                            <span class="stat-value" id="outOfStockCount">٠</span>
                        </div>
                    </div>
                    <div class="low-stock-list" id="lowStockList">
                        <!-- قائمة المنتجات منخفضة المخزون -->
                    </div>
                </div>
            </div>

            <!-- تقرير العملاء -->
            <div class="report-card">
                <div class="report-header">
                    <h3><i class="fas fa-users"></i> تقرير العملاء</h3>
                    <div class="report-actions">
                        <button class="btn btn-sm btn-info" onclick="printCustomersReport()">
                            <i class="fas fa-print"></i>
                            طباعة
                        </button>
                        <button class="btn btn-sm btn-success" onclick="exportCustomersToExcel()">
                            <i class="fas fa-file-excel"></i>
                            تصدير Excel
                        </button>
                    </div>
                </div>
                <div class="report-content">
                    <div class="report-stats">
                        <div class="stat-item">
                            <span class="stat-label">إجمالي العملاء:</span>
                            <span class="stat-value" id="customersCount">٠</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">عملاء نشطين:</span>
                            <span class="stat-value" id="activeCustomers">٠</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">إجمالي الديون:</span>
                            <span class="stat-value" id="totalDebts">٠.٠٠ ر.س</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">أفضل عميل:</span>
                            <span class="stat-value" id="topCustomer">-</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- تقرير الموردين -->
            <div class="report-card">
                <div class="report-header">
                    <h3><i class="fas fa-truck"></i> تقرير الموردين</h3>
                    <div class="report-actions">
                        <button class="btn btn-sm btn-info" onclick="printSuppliersReport()">
                            <i class="fas fa-print"></i>
                            طباعة
                        </button>
                        <button class="btn btn-sm btn-success" onclick="exportSuppliersToExcel()">
                            <i class="fas fa-file-excel"></i>
                            تصدير Excel
                        </button>
                    </div>
                </div>
                <div class="report-content">
                    <div class="report-stats">
                        <div class="stat-item">
                            <span class="stat-label">إجمالي الموردين:</span>
                            <span class="stat-value" id="suppliersCount">٠</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">إجمالي المشتريات:</span>
                            <span class="stat-value" id="purchasesTotal">٠.٠٠ ر.س</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">إجمالي المستحقات:</span>
                            <span class="stat-value" id="supplierDebts">٠.٠٠ ر.س</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">أفضل مورد:</span>
                            <span class="stat-value" id="topSupplier">-</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- تقرير الأرباح -->
            <div class="report-card">
                <div class="report-header">
                    <h3><i class="fas fa-chart-line"></i> تقرير الأرباح</h3>
                    <div class="report-actions">
                        <button class="btn btn-sm btn-info" onclick="printProfitReport()">
                            <i class="fas fa-print"></i>
                            طباعة
                        </button>
                        <button class="btn btn-sm btn-success" onclick="exportSalesToExcel()">
                            <i class="fas fa-file-excel"></i>
                            تصدير Excel
                        </button>
                    </div>
                </div>
                <div class="report-content">
                    <div class="report-stats">
                        <div class="stat-item">
                            <span class="stat-label">إجمالي المبيعات:</span>
                            <span class="stat-value" id="profitSales">٠.٠٠ ر.س</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">إجمالي المشتريات:</span>
                            <span class="stat-value" id="profitPurchases">٠.٠٠ ر.س</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">صافي الربح:</span>
                            <span class="stat-value profit" id="netProfit">٠.٠٠ ر.س</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">هامش الربح:</span>
                            <span class="stat-value" id="profitMargin">٠%</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- تقرير المدفوعات -->
            <div class="report-card">
                <div class="report-header">
                    <h3><i class="fas fa-money-bill-wave"></i> تقرير المدفوعات</h3>
                    <button class="btn btn-sm btn-info" onclick="printPaymentsReport()">
                        <i class="fas fa-print"></i>
                        طباعة
                    </button>
                </div>
                <div class="report-content">
                    <div class="report-stats">
                        <div class="stat-item">
                            <span class="stat-label">إجمالي المدفوعات:</span>
                            <span class="stat-value" id="paymentsTotal">٠.٠٠ ر.س</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">دفعات العملاء:</span>
                            <span class="stat-value" id="customerPayments">٠.٠٠ ر.س</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">دفعات الموردين:</span>
                            <span class="stat-value" id="supplierPayments">٠.٠٠ ر.س</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">عدد المعاملات:</span>
                            <span class="stat-value" id="paymentsCount">٠</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- تقرير المخازن -->
            <div class="report-card">
                <div class="report-header">
                    <h3><i class="fas fa-warehouse"></i> تقرير المخازن</h3>
                    <button class="btn btn-sm btn-info" onclick="printWarehousesReport()">
                        <i class="fas fa-print"></i>
                        طباعة
                    </button>
                </div>
                <div class="report-content">
                    <div class="report-stats">
                        <div class="stat-item">
                            <span class="stat-label">عدد المخازن:</span>
                            <span class="stat-value" id="warehousesCount">٠</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">إجمالي المنتجات:</span>
                            <span class="stat-value" id="totalInventoryItems">٠</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">قيمة المخزون:</span>
                            <span class="stat-value" id="totalInventoryValue">٠.٠٠٠ د.ك</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">حركات المخزون:</span>
                            <span class="stat-value" id="inventoryMovements">٠</span>
                        </div>
                    </div>

                    <div class="warehouse-breakdown" id="warehouseBreakdown">
                        <!-- تفاصيل المخازن -->
                    </div>
                </div>
            </div>
        </div>
    `;

    // تعيين التواريخ الافتراضية (الشهر الحالي)
    setDateRange('month');
    updateReports();
}

// تعيين نطاق التاريخ
function setDateRange(range) {
    const today = new Date();
    const fromDate = document.getElementById('reportDateFrom');
    const toDate = document.getElementById('reportDateTo');

    let startDate, endDate;

    switch (range) {
        case 'today':
            startDate = endDate = today;
            break;
        case 'week':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            endDate = today;
            break;
        case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = today;
            break;
        case 'year':
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = today;
            break;
        default:
            return;
    }

    fromDate.value = startDate.toISOString().split('T')[0];
    toDate.value = endDate.toISOString().split('T')[0];

    updateReports();
}

// تحديث التقارير
function updateReports() {
    const fromDate = document.getElementById('reportDateFrom').value;
    const toDate = document.getElementById('reportDateTo').value;

    if (!fromDate || !toDate) return;

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999); // نهاية اليوم

    updateSalesReport(startDate, endDate);
    updateInventoryReport();
    updateCustomersReport(startDate, endDate);
    updateSuppliersReport(startDate, endDate);
    updateProfitReport(startDate, endDate);
    updatePaymentsReport(startDate, endDate);
    updateWarehousesReport(startDate, endDate);
}

// تحديث تقرير المبيعات
function updateSalesReport(startDate, endDate) {
    try {
        const sales = db.getTable('sales');
        const filteredSales = sales.filter(sale => {
            const saleDate = new Date(sale.createdAt);
            return saleDate >= startDate && saleDate <= endDate;
        });

        const salesCount = filteredSales.length;
        const salesTotal = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
        const salesAverage = salesCount > 0 ? salesTotal / salesCount : 0;
        const salesTax = filteredSales.reduce((sum, sale) => sum + sale.taxAmount, 0);

        document.getElementById('salesCount').textContent = db.toArabicNumbers(salesCount);
        document.getElementById('salesTotal').textContent = formatCurrency(salesTotal);
        document.getElementById('salesAverage').textContent = formatCurrency(salesAverage);
        document.getElementById('salesTax').textContent = formatCurrency(salesTax);

        // رسم الرسم البياني
        drawSalesChart(filteredSales, startDate, endDate);

    } catch (error) {
        console.error('خطأ في تحديث تقرير المبيعات:', error);
    }
}

// تحديث تقرير المخزون
function updateInventoryReport() {
    try {
        const products = db.getTable('products');
        const warehouses = db.getTable('warehouses');

        const inventoryCount = products.length;

        // حساب قيمة المخزون الإجمالية من جميع المخازن
        let inventoryValue = 0;
        products.forEach(product => {
            const totalQuantity = Object.values(product.warehouses || {}).reduce((sum, qty) => sum + qty, 0);
            inventoryValue += totalQuantity * product.price;
        });

        // المنتجات منخفضة المخزون
        const lowStockProducts = products.filter(product => {
            const totalQuantity = Object.values(product.warehouses || {}).reduce((sum, qty) => sum + qty, 0);
            return totalQuantity <= (product.minQuantity || 5);
        });

        // المنتجات النافدة
        const outOfStockProducts = products.filter(product => {
            const totalQuantity = Object.values(product.warehouses || {}).reduce((sum, qty) => sum + qty, 0);
            return totalQuantity === 0;
        });

        document.getElementById('inventoryCount').textContent = db.toArabicNumbers(inventoryCount);
        document.getElementById('inventoryValue').textContent = formatCurrency(inventoryValue);
        document.getElementById('lowStockCount').textContent = db.toArabicNumbers(lowStockProducts.length);
        document.getElementById('outOfStockCount').textContent = db.toArabicNumbers(outOfStockProducts.length);

        // عرض قائمة المنتجات منخفضة المخزون مع تفاصيل المخازن
        const lowStockList = document.getElementById('lowStockList');
        if (lowStockProducts.length > 0) {
            lowStockList.innerHTML = `
                <h4>منتجات تحتاج إعادة تموين:</h4>
                <div class="low-stock-details">
                    ${lowStockProducts.slice(0, 5).map(product => {
                        const totalQty = Object.values(product.warehouses || {}).reduce((sum, qty) => sum + qty, 0);
                        const warehouseDetails = warehouses.map(warehouse => {
                            const qty = product.warehouses?.[warehouse.id] || 0;
                            return `${warehouse.name}: ${db.toArabicNumbers(qty)}`;
                        }).join(' | ');

                        return `
                            <div class="low-stock-item">
                                <div class="product-name">${product.name}</div>
                                <div class="total-qty">الإجمالي: ${db.toArabicNumbers(totalQty)}</div>
                                <div class="warehouse-breakdown">${warehouseDetails}</div>
                            </div>
                        `;
                    }).join('')}
                    ${lowStockProducts.length > 5 ? `
                        <div class="more-items">و ${db.toArabicNumbers(lowStockProducts.length - 5)} منتجات أخرى...</div>
                    ` : ''}
                </div>
            `;
        } else {
            lowStockList.innerHTML = '<p class="success-message">جميع المنتجات متوفرة بكميات كافية</p>';
        }

    } catch (error) {
        console.error('خطأ في تحديث تقرير المخزون:', error);
    }
}

// تحديث تقرير العملاء
function updateCustomersReport(startDate, endDate) {
    try {
        const customers = db.getTable('customers');
        const sales = db.getTable('sales');

        const allCustomers = customers.filter(c => c.id !== 'guest');
        const customersCount = allCustomers.length;

        // العملاء النشطين (لديهم مبيعات في الفترة)
        const activeSales = sales.filter(sale => {
            const saleDate = new Date(sale.createdAt);
            return saleDate >= startDate && saleDate <= endDate && sale.customerId !== 'guest';
        });
        const activeCustomerIds = [...new Set(activeSales.map(sale => sale.customerId))];
        const activeCustomers = activeCustomerIds.length;

        // إجمالي الديون
        const totalDebts = allCustomers.reduce((sum, customer) => {
            return sum + (customer.balance < 0 ? Math.abs(customer.balance) : 0);
        }, 0);

        // أفضل عميل (أكثر مبيعات)
        const customerSales = {};
        activeSales.forEach(sale => {
            if (!customerSales[sale.customerId]) {
                customerSales[sale.customerId] = 0;
            }
            customerSales[sale.customerId] += sale.total;
        });

        let topCustomer = '-';
        if (Object.keys(customerSales).length > 0) {
            const topCustomerId = Object.keys(customerSales).reduce((a, b) =>
                customerSales[a] > customerSales[b] ? a : b
            );
            const customer = db.findById('customers', topCustomerId);
            topCustomer = customer ? customer.name : '-';
        }

        document.getElementById('customersCount').textContent = db.toArabicNumbers(customersCount);
        document.getElementById('activeCustomers').textContent = db.toArabicNumbers(activeCustomers);
        document.getElementById('totalDebts').textContent = formatCurrency(totalDebts);
        document.getElementById('topCustomer').textContent = topCustomer;

    } catch (error) {
        console.error('خطأ في تحديث تقرير العملاء:', error);
    }
}

// تحديث تقرير الموردين
function updateSuppliersReport(startDate, endDate) {
    try {
        const suppliers = db.getTable('suppliers');
        const purchases = db.getTable('purchases');

        const suppliersCount = suppliers.length;

        // المشتريات في الفترة
        const filteredPurchases = purchases.filter(purchase => {
            const purchaseDate = new Date(purchase.createdAt);
            return purchaseDate >= startDate && purchaseDate <= endDate;
        });
        const purchasesTotal = filteredPurchases.reduce((sum, purchase) => sum + purchase.total, 0);

        // إجمالي المستحقات
        const supplierDebts = suppliers.reduce((sum, supplier) => {
            return sum + (supplier.balance > 0 ? supplier.balance : 0);
        }, 0);

        // أفضل مورد (أكثر مشتريات)
        const supplierPurchases = {};
        filteredPurchases.forEach(purchase => {
            if (!supplierPurchases[purchase.supplierId]) {
                supplierPurchases[purchase.supplierId] = 0;
            }
            supplierPurchases[purchase.supplierId] += purchase.total;
        });

        let topSupplier = '-';
        if (Object.keys(supplierPurchases).length > 0) {
            const topSupplierId = Object.keys(supplierPurchases).reduce((a, b) =>
                supplierPurchases[a] > supplierPurchases[b] ? a : b
            );
            const supplier = db.findById('suppliers', topSupplierId);
            topSupplier = supplier ? supplier.name : '-';
        }

        document.getElementById('suppliersCount').textContent = db.toArabicNumbers(suppliersCount);
        document.getElementById('purchasesTotal').textContent = formatCurrency(purchasesTotal);
        document.getElementById('supplierDebts').textContent = formatCurrency(supplierDebts);
        document.getElementById('topSupplier').textContent = topSupplier;

    } catch (error) {
        console.error('خطأ في تحديث تقرير الموردين:', error);
    }
}

// تحديث تقرير الأرباح
function updateProfitReport(startDate, endDate) {
    try {
        const sales = db.getTable('sales');
        const purchases = db.getTable('purchases');

        // المبيعات في الفترة
        const filteredSales = sales.filter(sale => {
            const saleDate = new Date(sale.createdAt);
            return saleDate >= startDate && saleDate <= endDate;
        });
        const salesTotal = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

        // المشتريات في الفترة
        const filteredPurchases = purchases.filter(purchase => {
            const purchaseDate = new Date(purchase.createdAt);
            return purchaseDate >= startDate && purchaseDate <= endDate;
        });
        const purchasesTotal = filteredPurchases.reduce((sum, purchase) => sum + purchase.total, 0);

        // حساب الربح
        const netProfit = salesTotal - purchasesTotal;
        const profitMargin = salesTotal > 0 ? (netProfit / salesTotal) * 100 : 0;

        document.getElementById('profitSales').textContent = formatCurrency(salesTotal);
        document.getElementById('profitPurchases').textContent = formatCurrency(purchasesTotal);
        document.getElementById('netProfit').textContent = formatCurrency(netProfit);
        document.getElementById('profitMargin').textContent = db.toArabicNumbers(profitMargin.toFixed(1)) + '%';

        // تلوين صافي الربح
        const netProfitElement = document.getElementById('netProfit');
        netProfitElement.className = netProfit >= 0 ? 'stat-value profit positive' : 'stat-value profit negative';

    } catch (error) {
        console.error('خطأ في تحديث تقرير الأرباح:', error);
    }
}

// تحديث تقرير المدفوعات
function updatePaymentsReport(startDate, endDate) {
    try {
        const payments = db.getTable('payments');

        // المدفوعات في الفترة
        const filteredPayments = payments.filter(payment => {
            const paymentDate = new Date(payment.createdAt);
            return paymentDate >= startDate && paymentDate <= endDate;
        });

        const paymentsTotal = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const paymentsCount = filteredPayments.length;

        // تصنيف المدفوعات
        const customerPayments = filteredPayments.filter(p => p.customerId).reduce((sum, p) => sum + p.amount, 0);
        const supplierPayments = filteredPayments.filter(p => p.supplierId).reduce((sum, p) => sum + p.amount, 0);

        document.getElementById('paymentsTotal').textContent = formatCurrency(paymentsTotal);
        document.getElementById('customerPayments').textContent = formatCurrency(customerPayments);
        document.getElementById('supplierPayments').textContent = formatCurrency(supplierPayments);
        document.getElementById('paymentsCount').textContent = db.toArabicNumbers(paymentsCount);

    } catch (error) {
        console.error('خطأ في تحديث تقرير المدفوعات:', error);
    }
}

// تحديث تقرير المخازن
function updateWarehousesReport(startDate, endDate) {
    try {
        const warehouses = db.getTable('warehouses');
        const products = db.getTable('products');
        const movements = db.getTable('inventory_movements');

        // فلترة الحركات حسب الفترة
        const filteredMovements = movements.filter(movement => {
            const movementDate = new Date(movement.createdAt);
            return movementDate >= startDate && movementDate <= endDate;
        });

        // حساب الإحصائيات
        const warehousesCount = warehouses.filter(w => w.isActive).length;

        let totalInventoryItems = 0;
        let totalInventoryValue = 0;

        products.forEach(product => {
            const totalQuantity = Object.values(product.warehouses || {}).reduce((sum, qty) => sum + qty, 0);
            totalInventoryItems += totalQuantity;
            totalInventoryValue += totalQuantity * product.price;
        });

        // تحديث العناصر
        document.getElementById('warehousesCount').textContent = db.toArabicNumbers(warehousesCount);
        document.getElementById('totalInventoryItems').textContent = db.toArabicNumbers(totalInventoryItems);
        document.getElementById('totalInventoryValue').textContent = formatCurrency(totalInventoryValue);
        document.getElementById('inventoryMovements').textContent = db.toArabicNumbers(filteredMovements.length);

        // تفاصيل المخازن
        const warehouseBreakdown = document.getElementById('warehouseBreakdown');
        if (warehouseBreakdown) {
            warehouseBreakdown.innerHTML = `
                <h4>تفاصيل المخازن:</h4>
                <div class="warehouse-details">
                    ${warehouses.filter(w => w.isActive).map(warehouse => {
                        let warehouseItems = 0;
                        let warehouseValue = 0;

                        products.forEach(product => {
                            const quantity = product.warehouses?.[warehouse.id] || 0;
                            warehouseItems += quantity;
                            warehouseValue += quantity * product.price;
                        });

                        return `
                            <div class="warehouse-detail-item">
                                <div class="warehouse-name">${warehouse.name}</div>
                                <div class="warehouse-stats-mini">
                                    <span>المنتجات: ${db.toArabicNumbers(warehouseItems)}</span>
                                    <span>القيمة: ${formatCurrency(warehouseValue)}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

    } catch (error) {
        console.error('خطأ في تحديث تقرير المخازن:', error);
    }
}

// رسم الرسم البياني للمبيعات
function drawSalesChart(sales, startDate, endDate) {
    try {
        const canvas = document.getElementById('salesReportChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = 200;

        // مسح الرسم السابق
        ctx.clearRect(0, 0, width, height);

        if (sales.length === 0) {
            ctx.fillStyle = '#999';
            ctx.font = '16px Cairo';
            ctx.textAlign = 'center';
            ctx.fillText('لا توجد مبيعات في هذه الفترة', width / 2, height / 2);
            return;
        }

        // تجميع المبيعات حسب اليوم
        const dailySales = {};
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        // إنشاء مصفوفة الأيام
        for (let i = 0; i <= daysDiff; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            dailySales[dateKey] = 0;
        }

        // تجميع المبيعات
        sales.forEach(sale => {
            const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
            if (dailySales.hasOwnProperty(saleDate)) {
                dailySales[saleDate] += sale.total;
            }
        });

        const dates = Object.keys(dailySales).sort();
        const values = dates.map(date => dailySales[date]);
        const maxValue = Math.max(...values) || 100;

        // إعدادات الرسم
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        const stepX = chartWidth / (dates.length - 1 || 1);

        // رسم الخطوط الشبكية
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;

        // خطوط أفقية
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // رسم الخط البياني
        if (dates.length > 1) {
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 3;
            ctx.beginPath();

            dates.forEach((date, index) => {
                const x = padding + stepX * index;
                const y = height - padding - (values[index] / maxValue) * chartHeight;

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();

            // رسم النقاط
            ctx.fillStyle = '#667eea';
            dates.forEach((date, index) => {
                const x = padding + stepX * index;
                const y = height - padding - (values[index] / maxValue) * chartHeight;

                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            });
        }

        // رسم التسميات
        ctx.fillStyle = '#666';
        ctx.font = '10px Cairo';
        ctx.textAlign = 'center';

        // تسميات القيم
        ctx.textAlign = 'right';
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartHeight / 4) * i;
            const value = maxValue - (maxValue / 4) * i;
            ctx.fillText(db.toArabicNumbers(Math.round(value)), padding - 5, y + 3);
        }

    } catch (error) {
        console.error('خطأ في رسم الرسم البياني:', error);
    }
}

// طباعة تقرير المبيعات
function printSalesReport() {
    const fromDate = document.getElementById('reportDateFrom').value;
    const toDate = document.getElementById('reportDateTo').value;

    const salesCount = document.getElementById('salesCount').textContent;
    const salesTotal = document.getElementById('salesTotal').textContent;
    const salesAverage = document.getElementById('salesAverage').textContent;
    const salesTax = document.getElementById('salesTax').textContent;

    const content = `
        <div class="report-print">
            <h2>تقرير المبيعات</h2>
            <p>من ${formatDate(fromDate)} إلى ${formatDate(toDate)}</p>

            <table class="report-table">
                <tr><td>عدد الفواتير:</td><td>${salesCount}</td></tr>
                <tr><td>إجمالي المبيعات:</td><td>${salesTotal}</td></tr>
                <tr><td>متوسط الفاتورة:</td><td>${salesAverage}</td></tr>
                <tr><td>إجمالي الضريبة:</td><td>${salesTax}</td></tr>
            </table>
        </div>

        <style>
            .report-print { font-family: 'Cairo', sans-serif; }
            .report-table { width: 100%; border-collapse: collapse; margin-top: 2rem; }
            .report-table td { padding: 0.5rem; border-bottom: 1px solid #ddd; }
            .report-table td:first-child { font-weight: bold; }
        </style>
    `;

    printContent(content, 'تقرير المبيعات');
}

// طباعة تقرير المخزون
function printInventoryReport() {
    const products = db.getTable('products');

    const content = `
        <div class="report-print">
            <h2>تقرير المخزون</h2>
            <p>تاريخ التقرير: ${formatDate(new Date(), true)}</p>

            <table class="report-table">
                <thead>
                    <tr>
                        <th>المنتج</th>
                        <th>الكمية</th>
                        <th>السعر</th>
                        <th>القيمة</th>
                        <th>الحالة</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(product => {
                        const value = product.quantity * product.price;
                        const status = product.quantity === 0 ? 'نافد' :
                                     product.quantity <= (product.minQuantity || 5) ? 'منخفض' : 'متوفر';
                        return `
                            <tr>
                                <td>${product.name}</td>
                                <td>${db.toArabicNumbers(product.quantity)}</td>
                                <td>${formatCurrency(product.price)}</td>
                                <td>${formatCurrency(value)}</td>
                                <td>${status}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>

        <style>
            .report-print { font-family: 'Cairo', sans-serif; }
            .report-table { width: 100%; border-collapse: collapse; margin-top: 2rem; }
            .report-table th, .report-table td { padding: 0.5rem; border: 1px solid #ddd; text-align: right; }
            .report-table th { background: #f5f5f5; font-weight: bold; }
        </style>
    `;

    printContent(content, 'تقرير المخزون');
}

// طباعة تقرير المخازن
function printWarehousesReport() {
    const warehouses = db.getTable('warehouses').filter(w => w.isActive);
    const products = db.getTable('products');

    const content = `
        <div class="report-print">
            <h2>تقرير المخازن</h2>
            <p>تاريخ التقرير: ${formatDate(new Date(), true)}</p>

            <div class="warehouses-summary">
                <h3>ملخص المخازن</h3>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>المخزن</th>
                            <th>الموقع</th>
                            <th>عدد المنتجات</th>
                            <th>قيمة المخزون</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${warehouses.map(warehouse => {
                            let warehouseItems = 0;
                            let warehouseValue = 0;

                            products.forEach(product => {
                                const quantity = product.warehouses?.[warehouse.id] || 0;
                                warehouseItems += quantity;
                                warehouseValue += quantity * product.price;
                            });

                            return `
                                <tr>
                                    <td>${warehouse.name}</td>
                                    <td>${warehouse.location}</td>
                                    <td>${db.toArabicNumbers(warehouseItems)}</td>
                                    <td>${formatCurrency(warehouseValue)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>

            <div class="inventory-details">
                <h3>تفاصيل المخزون</h3>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>المنتج</th>
                            <th>المخزن الرئيسي</th>
                            <th>فرع السالمية</th>
                            <th>فرع الفروانية</th>
                            <th>الإجمالي</th>
                            <th>القيمة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => {
                            const mainQty = product.warehouses?.main || 0;
                            const branch1Qty = product.warehouses?.branch1 || 0;
                            const branch2Qty = product.warehouses?.branch2 || 0;
                            const totalQty = mainQty + branch1Qty + branch2Qty;
                            const totalValue = totalQty * product.price;

                            return `
                                <tr>
                                    <td>${product.name}</td>
                                    <td>${db.toArabicNumbers(mainQty)}</td>
                                    <td>${db.toArabicNumbers(branch1Qty)}</td>
                                    <td>${db.toArabicNumbers(branch2Qty)}</td>
                                    <td>${db.toArabicNumbers(totalQty)}</td>
                                    <td>${formatCurrency(totalValue)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <style>
            .report-print { font-family: 'Cairo', sans-serif; }
            .warehouses-summary, .inventory-details { margin-bottom: 2rem; }
            .report-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            .report-table th, .report-table td { padding: 0.5rem; border: 1px solid #ddd; text-align: right; }
            .report-table th { background: #f5f5f5; font-weight: bold; }
        </style>
    `;

    printContent(content, 'تقرير المخازن');
}

// طباعة تقرير العملاء
function printCustomersReport() {
    const customers = db.getTable('customers').filter(c => c.id !== 'guest');
    const sales = db.getTable('sales');

    // حساب إحصائيات العملاء
    const totalCustomers = customers.length;
    const customersWithDebts = customers.filter(c => c.balance < 0).length;
    const totalDebts = customers.reduce((sum, c) => sum + (c.balance < 0 ? Math.abs(c.balance) : 0), 0);

    const content = `
        <div class="print-report">
            <div class="report-header">
                <h1>تقرير العملاء</h1>
                <div class="report-info">
                    <p>تاريخ التقرير: ${formatDate(new Date(), true)}</p>
                    <p>إجمالي العملاء: ${db.toArabicNumbers(totalCustomers)} عميل</p>
                </div>
            </div>

            <div class="report-summary">
                <h2>ملخص العملاء</h2>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="label">إجمالي العملاء:</span>
                        <span class="value">${db.toArabicNumbers(totalCustomers)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">عملاء لديهم ديون:</span>
                        <span class="value">${db.toArabicNumbers(customersWithDebts)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">إجمالي الديون:</span>
                        <span class="value">${formatCurrency(totalDebts)}</span>
                    </div>
                </div>
            </div>

            <div class="report-details">
                <h2>تفاصيل العملاء</h2>
                <table class="customers-table">
                    <thead>
                        <tr>
                            <th>الاسم</th>
                            <th>الهاتف</th>
                            <th>البريد الإلكتروني</th>
                            <th>الرصيد</th>
                            <th>تاريخ الإضافة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customers.map(customer => `
                            <tr>
                                <td>${customer.name}</td>
                                <td>${customer.phone || '-'}</td>
                                <td>${customer.email || '-'}</td>
                                <td>${formatCurrency(customer.balance)}</td>
                                <td>${formatDate(customer.createdAt)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="report-footer">
                <p>تم إنشاء هذا التقرير بواسطة نظام أبو سليمان المحاسبي</p>
            </div>
        </div>
    `;

    printContent(content, 'تقرير العملاء');
}

// طباعة تقرير الموردين
function printSuppliersReport() {
    const suppliers = db.getTable('suppliers');
    const purchases = db.getTable('purchases');

    // حساب إحصائيات الموردين
    const totalSuppliers = suppliers.length;
    const suppliersWithDebts = suppliers.filter(s => s.balance > 0).length;
    const totalDebts = suppliers.reduce((sum, s) => sum + (s.balance > 0 ? s.balance : 0), 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);

    const content = `
        <div class="print-report">
            <div class="report-header">
                <h1>تقرير الموردين</h1>
                <div class="report-info">
                    <p>تاريخ التقرير: ${formatDate(new Date(), true)}</p>
                    <p>إجمالي الموردين: ${db.toArabicNumbers(totalSuppliers)} مورد</p>
                </div>
            </div>

            <div class="report-summary">
                <h2>ملخص الموردين</h2>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="label">إجمالي الموردين:</span>
                        <span class="value">${db.toArabicNumbers(totalSuppliers)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">موردين لهم مستحقات:</span>
                        <span class="value">${db.toArabicNumbers(suppliersWithDebts)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">إجمالي المستحقات:</span>
                        <span class="value">${formatCurrency(totalDebts)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">إجمالي المشتريات:</span>
                        <span class="value">${formatCurrency(totalPurchases)}</span>
                    </div>
                </div>
            </div>

            <div class="report-details">
                <h2>تفاصيل الموردين</h2>
                <table class="suppliers-table">
                    <thead>
                        <tr>
                            <th>الاسم</th>
                            <th>الهاتف</th>
                            <th>البريد الإلكتروني</th>
                            <th>الرصيد</th>
                            <th>تاريخ الإضافة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${suppliers.map(supplier => `
                            <tr>
                                <td>${supplier.name}</td>
                                <td>${supplier.phone || '-'}</td>
                                <td>${supplier.email || '-'}</td>
                                <td>${formatCurrency(supplier.balance)}</td>
                                <td>${formatDate(supplier.createdAt)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="report-footer">
                <p>تم إنشاء هذا التقرير بواسطة نظام أبو سليمان المحاسبي</p>
            </div>
        </div>
    `;

    printContent(content, 'تقرير الموردين');
}

// طباعة تقرير الأرباح
function printProfitReport() {
    const sales = db.getTable('sales');
    const purchases = db.getTable('purchases');

    // حساب الأرباح
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
    const grossProfit = totalSales - totalPurchases;
    const profitMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

    const content = `
        <div class="print-report">
            <div class="report-header">
                <h1>تقرير الأرباح</h1>
                <div class="report-info">
                    <p>تاريخ التقرير: ${formatDate(new Date(), true)}</p>
                </div>
            </div>

            <div class="report-summary">
                <h2>ملخص الأرباح</h2>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="label">إجمالي المبيعات:</span>
                        <span class="value">${formatCurrency(totalSales)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">إجمالي المشتريات:</span>
                        <span class="value">${formatCurrency(totalPurchases)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">إجمالي الربح:</span>
                        <span class="value">${formatCurrency(grossProfit)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">هامش الربح:</span>
                        <span class="value">${db.toArabicNumbers(profitMargin.toFixed(2))}%</span>
                    </div>
                </div>
            </div>

            <div class="report-footer">
                <p>تم إنشاء هذا التقرير بواسطة نظام أبو سليمان المحاسبي</p>
            </div>
        </div>
    `;

    printContent(content, 'تقرير الأرباح');
}

// تصدير تقرير العملاء إلى Excel
function exportCustomersToExcel() {
    const customers = db.getTable('customers').filter(c => c.id !== 'guest');

    const data = [
        ['الاسم', 'الهاتف', 'البريد الإلكتروني', 'العنوان', 'الرصيد', 'تاريخ الإضافة'],
        ...customers.map(customer => [
            customer.name,
            customer.phone || '',
            customer.email || '',
            customer.address || '',
            customer.balance,
            formatDate(customer.createdAt)
        ])
    ];

    exportToExcel(data, 'تقرير العملاء');
}

// تصدير تقرير الموردين إلى Excel
function exportSuppliersToExcel() {
    const suppliers = db.getTable('suppliers');

    const data = [
        ['الاسم', 'الهاتف', 'البريد الإلكتروني', 'العنوان', 'الرصيد', 'تاريخ الإضافة'],
        ...suppliers.map(supplier => [
            supplier.name,
            supplier.phone || '',
            supplier.email || '',
            supplier.address || '',
            supplier.balance,
            formatDate(supplier.createdAt)
        ])
    ];

    exportToExcel(data, 'تقرير الموردين');
}

// تصدير تقرير المبيعات إلى Excel
function exportSalesToExcel() {
    const sales = db.getTable('sales');
    const customers = db.getTable('customers');

    const data = [
        ['رقم الفاتورة', 'التاريخ', 'العميل', 'المجموع الفرعي', 'الضريبة', 'الخصم', 'المجموع الكلي', 'طريقة الدفع'],
        ...sales.map(sale => {
            const customer = customers.find(c => c.id === sale.customerId);
            return [
                sale.id.substring(0, 8),
                formatDate(sale.createdAt),
                customer ? customer.name : 'عميل محذوف',
                sale.subtotal,
                sale.taxAmount,
                sale.discountAmount || 0,
                sale.total,
                sale.paymentMethod === 'cash' ? 'نقداً' : 'على الحساب'
            ];
        })
    ];

    exportToExcel(data, 'تقرير المبيعات');
}

// تصدير تقرير المشتريات إلى Excel
function exportPurchasesToExcel() {
    const purchases = db.getTable('purchases');
    const suppliers = db.getTable('suppliers');

    const data = [
        ['رقم الفاتورة', 'التاريخ', 'المورد', 'المجموع الفرعي', 'الضريبة', 'المجموع الكلي'],
        ...purchases.map(purchase => {
            const supplier = suppliers.find(s => s.id === purchase.supplierId);
            return [
                purchase.id.substring(0, 8),
                formatDate(purchase.createdAt),
                supplier ? supplier.name : 'مورد محذوف',
                purchase.subtotal,
                purchase.taxAmount,
                purchase.total
            ];
        })
    ];

    exportToExcel(data, 'تقرير المشتريات');
}

// تصدير تقرير المخزون إلى Excel
function exportInventoryToExcel() {
    const products = db.getTable('products');

    const data = [
        ['اسم المنتج', 'الكمية', 'السعر', 'القيمة الإجمالية', 'الحد الأدنى', 'الفئة', 'الباركود'],
        ...products.map(product => [
            product.name,
            product.quantity,
            product.price,
            product.quantity * product.price,
            product.minQuantity || 5,
            product.category || '',
            product.barcode || ''
        ])
    ];

    exportToExcel(data, 'تقرير المخزون');
}

// تصدير تقرير المدفوعات إلى Excel
function exportPaymentsToExcel() {
    const payments = db.getTable('payments');

    const data = [
        ['التاريخ', 'النوع', 'الاسم', 'المبلغ', 'طريقة الدفع', 'ملاحظات'],
        ...payments.map(payment => [
            formatDate(payment.createdAt),
            payment.customerId ? 'عميل' : 'مورد',
            payment.customerName || payment.supplierName || 'غير محدد',
            payment.amount,
            getPaymentMethodText(payment.method),
            payment.notes || ''
        ])
    ];

    exportToExcel(data, 'تقرير المدفوعات');
}

// وظيفة عامة لتصدير البيانات إلى Excel
function exportToExcel(data, filename) {
    try {
        // إنشاء محتوى CSV
        const csvContent = data.map(row =>
            row.map(cell => {
                // تحويل الأرقام العربية إلى إنجليزية للـ CSV
                const cellValue = typeof cell === 'string' ?
                    cell.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)) :
                    cell;

                // إضافة علامات اقتباس إذا كانت القيمة تحتوي على فاصلة أو علامة اقتباس
                if (typeof cellValue === 'string' && (cellValue.includes(',') || cellValue.includes('"'))) {
                    return `"${cellValue.replace(/"/g, '""')}"`;
                }
                return cellValue;
            }).join(',')
        ).join('\n');

        // إضافة BOM للدعم العربي
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvContent;

        // إنشاء ملف للتحميل
        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}_${formatDate(new Date()).replace(/\//g, '-')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showNotification(`تم تصدير ${filename} بنجاح`, 'success');
        } else {
            showNotification('المتصفح لا يدعم تحميل الملفات', 'error');
        }

    } catch (error) {
        console.error('خطأ في تصدير البيانات:', error);
        showNotification('خطأ في تصدير البيانات', 'error');
    }
}

// وظائف مساعدة إضافية

// إرسال تذكير بالدين (محاكاة)
function sendDebtReminder(customerId) {
    const customer = db.findById('customers', customerId);
    if (!customer) {
        showNotification('العميل غير موجود', 'error');
        return;
    }

    const debtAmount = Math.abs(customer.balance);

    const content = `
        <div class="reminder-preview">
            <h3>معاينة رسالة التذكير</h3>
            <div class="message-content">
                <p><strong>إلى:</strong> ${customer.name}</p>
                <p><strong>الموضوع:</strong> تذكير بسداد المستحقات</p>
                <div class="message-body">
                    <p>عزيزي العميل ${customer.name}،</p>
                    <p>نود تذكيركم بأن لديكم مبلغ مستحق قدره <strong>${formatCurrency(debtAmount)}</strong></p>
                    <p>نرجو منكم التكرم بسداد المبلغ في أقرب وقت ممكن.</p>
                    <p>شكراً لتعاونكم</p>
                    <p><strong>أبوسليمان للمحاسبة</strong></p>
                </div>
            </div>

            <div class="reminder-actions">
                <button class="btn btn-success" onclick="confirmSendReminder('${customerId}')">
                    <i class="fas fa-paper-plane"></i>
                    إرسال التذكير
                </button>
                <button class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </div>
    `;

    showModal('إرسال تذكير بالدين', content);
}

// تأكيد إرسال التذكير
function confirmSendReminder(customerId) {
    // في التطبيق الحقيقي، هنا سيتم إرسال رسالة فعلية
    showNotification('تم إرسال التذكير بنجاح', 'success');
    closeModal();
}

// جدولة دفعة للمورد
function schedulePayment(supplierId) {
    const supplier = db.findById('suppliers', supplierId);
    if (!supplier) {
        showNotification('المورد غير موجود', 'error');
        return;
    }

    const content = `
        <form id="schedulePaymentForm" onsubmit="saveScheduledPayment(event, '${supplierId}')">
            <div class="payment-info">
                <h4>جدولة دفعة للمورد: ${supplier.name}</h4>
                <p>المستحقات الحالية: <span class="positive">${formatCurrency(supplier.balance)}</span></p>
            </div>

            <div class="form-group">
                <label for="scheduledAmount">مبلغ الدفعة *</label>
                <input type="number" id="scheduledAmount" step="0.01" min="0.01" max="${supplier.balance}" value="${supplier.balance}" required>
            </div>

            <div class="form-group">
                <label for="scheduledDate">تاريخ الدفعة المجدولة *</label>
                <input type="date" id="scheduledDate" min="${new Date().toISOString().split('T')[0]}" required>
            </div>

            <div class="form-group">
                <label for="scheduledMethod">طريقة الدفع المخططة</label>
                <select id="scheduledMethod">
                    <option value="cash">نقداً</option>
                    <option value="bank">تحويل بنكي</option>
                    <option value="check">شيك</option>
                </select>
            </div>

            <div class="form-group">
                <label for="scheduledNotes">ملاحظات</label>
                <textarea id="scheduledNotes" rows="3" placeholder="ملاحظات حول الدفعة المجدولة..."></textarea>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-warning">
                    <i class="fas fa-calendar-plus"></i>
                    جدولة الدفعة
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('جدولة دفعة للمورد', content);
}

// حفظ الدفعة المجدولة
function saveScheduledPayment(event, supplierId) {
    event.preventDefault();

    try {
        const amount = parseFloat(document.getElementById('scheduledAmount').value);
        const date = document.getElementById('scheduledDate').value;
        const method = document.getElementById('scheduledMethod').value;
        const notes = document.getElementById('scheduledNotes').value.trim();

        if (!amount || amount <= 0) {
            showNotification('يرجى إدخال مبلغ صحيح', 'error');
            return;
        }

        if (!date) {
            showNotification('يرجى اختيار تاريخ الدفعة', 'error');
            return;
        }

        const supplier = db.findById('suppliers', supplierId);
        if (!supplier) {
            showNotification('المورد غير موجود', 'error');
            return;
        }

        // حفظ الدفعة المجدولة (في التطبيق الحقيقي ستكون في جدول منفصل)
        const scheduledPayment = {
            supplierId: supplierId,
            supplierName: supplier.name,
            amount: amount,
            scheduledDate: date,
            method: method,
            notes: notes,
            status: 'scheduled',
            type: 'scheduled_payment'
        };

        // في هذا المثال، سنحفظها في جدول المدفوعات مع حالة مجدولة
        const savedPayment = db.insert('payments', scheduledPayment);

        if (savedPayment) {
            showNotification(`تم جدولة دفعة بمبلغ ${formatCurrency(amount)} في تاريخ ${formatDate(date)}`, 'success');
            closeModal();
        } else {
            showNotification('خطأ في جدولة الدفعة', 'error');
        }

    } catch (error) {
        console.error('خطأ في جدولة الدفعة:', error);
        showNotification('خطأ في جدولة الدفعة', 'error');
    }
}

// عرض تفاصيل الدفعة
function viewPaymentDetails(paymentId) {
    const payment = db.findById('payments', paymentId);
    if (!payment) {
        showNotification('الدفعة غير موجودة', 'error');
        return;
    }

    const payerName = payment.customerName || payment.supplierName || 'غير محدد';
    const paymentType = payment.customerId ? 'دفعة عميل' : 'دفعة مورد';

    const content = `
        <div class="payment-details-view">
            <div class="payment-header-info">
                <h3>تفاصيل الدفعة #${payment.id}</h3>
                <div class="payment-meta">
                    <p><strong>الدافع:</strong> ${payerName}</p>
                    <p><strong>نوع الدفعة:</strong> ${paymentType}</p>
                    <p><strong>المبلغ:</strong> ${formatCurrency(payment.amount)}</p>
                    <p><strong>طريقة الدفع:</strong> ${getPaymentMethodText(payment.method)}</p>
                    <p><strong>التاريخ:</strong> ${formatDate(payment.createdAt, true)}</p>
                    ${payment.status === 'scheduled' ? `<p><strong>الحالة:</strong> <span class="status-badge pending">مجدولة</span></p>` : ''}
                </div>
            </div>

            ${payment.notes ? `
                <div class="payment-notes-details">
                    <h4>ملاحظات:</h4>
                    <p>${payment.notes}</p>
                </div>
            ` : ''}

            <div class="payment-actions-section">
                <button class="btn btn-info" onclick="printPaymentReceipt('${paymentId}')">
                    <i class="fas fa-print"></i>
                    طباعة إيصال
                </button>
                <button class="btn btn-secondary" onclick="closeModal()">
                    إغلاق
                </button>
            </div>
        </div>
    `;

    showModal('تفاصيل الدفعة', content);
}

// طباعة إيصال الدفعة
function printPaymentReceipt(paymentId) {
    const payment = db.findById('payments', paymentId);
    if (!payment) return;

    const settings = db.getTable('settings');
    const payerName = payment.customerName || payment.supplierName || 'غير محدد';
    const paymentType = payment.customerId ? 'دفعة عميل' : 'دفعة مورد';

    const receiptContent = `
        <div class="receipt">
            <div class="receipt-header">
                <h2>${settings.companyName}</h2>
                <h3>إيصال دفعة</h3>
                ${settings.companyAddress ? `<p>${settings.companyAddress}</p>` : ''}
                ${settings.companyPhone ? `<p>هاتف: ${settings.companyPhone}</p>` : ''}
            </div>

            <div class="receipt-info">
                <div class="receipt-number">إيصال رقم: ${db.toArabicNumbers(payment.id)}</div>
                <div class="receipt-date">التاريخ: ${formatDate(payment.createdAt, true)}</div>
            </div>

            <div class="receipt-details">
                <table class="receipt-table">
                    <tr><td>الدافع:</td><td>${payerName}</td></tr>
                    <tr><td>نوع الدفعة:</td><td>${paymentType}</td></tr>
                    <tr><td>طريقة الدفع:</td><td>${getPaymentMethodText(payment.method)}</td></tr>
                    <tr><td><strong>المبلغ المدفوع:</strong></td><td><strong>${formatCurrency(payment.amount)}</strong></td></tr>
                </table>

                ${payment.notes ? `
                    <div class="receipt-notes">
                        <p><strong>ملاحظات:</strong> ${payment.notes}</p>
                    </div>
                ` : ''}
            </div>

            <div class="receipt-footer">
                <p>شكراً لتعاملكم معنا</p>
                <p>تم إنشاء هذا الإيصال تلقائياً</p>
            </div>
        </div>

        <style>
            .receipt { font-family: 'Cairo', sans-serif; max-width: 400px; margin: 0 auto; }
            .receipt-header { text-align: center; margin-bottom: 2rem; }
            .receipt-info { margin-bottom: 1rem; }
            .receipt-table { width: 100%; margin-bottom: 1rem; }
            .receipt-table td { padding: 0.5rem 0; border-bottom: 1px solid #eee; }
            .receipt-table td:first-child { font-weight: 500; width: 40%; }
            .receipt-notes { margin: 1rem 0; padding: 1rem; background: #f9f9f9; border-radius: 5px; }
            .receipt-footer { text-align: center; margin-top: 2rem; font-size: 0.9rem; color: #666; }
        </style>
    `;

    printContent(receiptContent, 'إيصال دفعة');
}

// عرض سجل المدفوعات (نافذة منفصلة)
function showPaymentsHistory() {
    const payments = db.getTable('payments');

    if (payments.length === 0) {
        showNotification('لا توجد مدفوعات مسجلة', 'info');
        return;
    }

    const sortedPayments = payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const content = `
        <div class="payments-history-view">
            <div class="history-header">
                <h3>سجل جميع المدفوعات</h3>
                <p>إجمالي المدفوعات: ${db.toArabicNumbers(payments.length)} دفعة</p>
            </div>

            <div class="payments-history-list">
                ${sortedPayments.slice(0, 50).map(payment => {
                    const payerName = payment.customerName || payment.supplierName || 'غير محدد';
                    const paymentType = payment.customerId ? 'عميل' : 'مورد';
                    const typeIcon = payment.customerId ? 'fa-user' : 'fa-truck';

                    return `
                        <div class="history-payment-item">
                            <div class="payment-summary">
                                <div class="payment-basic-info">
                                    <h4><i class="fas ${typeIcon}"></i> ${payerName}</h4>
                                    <p>${formatDate(payment.createdAt, true)} - ${getPaymentMethodText(payment.method)}</p>
                                </div>
                                <div class="payment-amount-info">
                                    <span class="amount">${formatCurrency(payment.amount)}</span>
                                    <span class="type">${paymentType}</span>
                                </div>
                            </div>
                            ${payment.notes ? `<p class="payment-notes-summary">${payment.notes}</p>` : ''}
                        </div>
                    `;
                }).join('')}

                ${payments.length > 50 ? `
                    <div class="more-payments">
                        <p>و ${db.toArabicNumbers(payments.length - 50)} دفعة أخرى...</p>
                    </div>
                ` : ''}
            </div>

            <div class="history-actions">
                <button class="btn btn-info" onclick="printAllPaymentsReport()">
                    <i class="fas fa-print"></i>
                    طباعة التقرير الكامل
                </button>
                <button class="btn btn-secondary" onclick="closeModal()">
                    إغلاق
                </button>
            </div>
        </div>
    `;

    showModal('سجل المدفوعات', content);
}

// طباعة تقرير المدفوعات الكامل
function printAllPaymentsReport() {
    const payments = db.getTable('payments');
    const customers = db.getTable('customers');
    const suppliers = db.getTable('suppliers');

    if (payments.length === 0) {
        showNotification('لا توجد مدفوعات للطباعة', 'info');
        return;
    }

    // ترتيب المدفوعات حسب التاريخ
    const sortedPayments = payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // حساب الإحصائيات
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const customerPayments = payments.filter(p => p.customerId);
    const supplierPayments = payments.filter(p => p.supplierId);
    const totalCustomerPayments = customerPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalSupplierPayments = supplierPayments.reduce((sum, p) => sum + p.amount, 0);

    const reportContent = `
        <div class="print-report">
            <div class="report-header">
                <h1>تقرير المدفوعات الكامل</h1>
                <div class="report-info">
                    <p>تاريخ التقرير: ${formatDate(new Date(), true)}</p>
                    <p>إجمالي المدفوعات: ${db.toArabicNumbers(payments.length)} دفعة</p>
                </div>
            </div>

            <div class="report-summary">
                <h2>ملخص المدفوعات</h2>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="label">إجمالي المبلغ:</span>
                        <span class="value">${formatCurrency(totalAmount)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">مدفوعات العملاء:</span>
                        <span class="value">${formatCurrency(totalCustomerPayments)} (${db.toArabicNumbers(customerPayments.length)} دفعة)</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">مدفوعات الموردين:</span>
                        <span class="value">${formatCurrency(totalSupplierPayments)} (${db.toArabicNumbers(supplierPayments.length)} دفعة)</span>
                    </div>
                </div>
            </div>

            <div class="report-details">
                <h2>تفاصيل المدفوعات</h2>
                <table class="payments-table">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>النوع</th>
                            <th>الاسم</th>
                            <th>المبلغ</th>
                            <th>طريقة الدفع</th>
                            <th>ملاحظات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedPayments.map(payment => {
                            const payerName = payment.customerName || payment.supplierName || 'غير محدد';
                            const paymentType = payment.customerId ? 'عميل' : 'مورد';

                            return `
                                <tr>
                                    <td>${formatDate(payment.createdAt, true)}</td>
                                    <td>${paymentType}</td>
                                    <td>${payerName}</td>
                                    <td>${formatCurrency(payment.amount)}</td>
                                    <td>${getPaymentMethodText(payment.method)}</td>
                                    <td>${payment.notes || '-'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>

            <div class="report-footer">
                <p>تم إنشاء هذا التقرير بواسطة نظام أبو سليمان المحاسبي</p>
                <p>تاريخ الطباعة: ${formatDate(new Date(), true)}</p>
            </div>
        </div>
    `;

    printContent(reportContent, 'تقرير المدفوعات الكامل');
}

// تحميل قسم المخازن
function loadWarehousesSection() {
    const section = document.getElementById('warehouses');
    if (!section) return;

    section.innerHTML = `
        <div class="section-header">
            <h2><i class="fas fa-warehouse"></i> إدارة المخازن</h2>
            <div class="header-actions">
                <button class="btn btn-primary" onclick="showAddWarehouseModal()">
                    <i class="fas fa-plus"></i>
                    إضافة مخزن جديد
                </button>
                <button class="btn btn-info" onclick="showInventoryMovementModal()">
                    <i class="fas fa-exchange-alt"></i>
                    نقل مخزون
                </button>
            </div>
        </div>

        <div class="warehouses-overview">
            <div class="overview-cards" id="warehousesOverview">
                <!-- بطاقات المخازن ستظهر هنا -->
            </div>
        </div>

        <div class="warehouses-tabs">
            <button class="tab-btn active" onclick="showWarehouseTab('overview')">
                <i class="fas fa-chart-pie"></i>
                نظرة عامة
            </button>
            <button class="tab-btn" onclick="showWarehouseTab('inventory')">
                <i class="fas fa-boxes"></i>
                المخزون التفصيلي
            </button>
            <button class="tab-btn" onclick="showWarehouseTab('movements')">
                <i class="fas fa-history"></i>
                حركات المخزون
            </button>
        </div>

        <div class="warehouses-content">
            <!-- نظرة عامة -->
            <div id="warehouseOverview" class="warehouse-tab active">
                <div class="warehouse-stats" id="warehouseStats">
                    <!-- إحصائيات المخازن -->
                </div>

                <div class="warehouses-grid" id="warehousesGrid">
                    <!-- قائمة المخازن -->
                </div>
            </div>

            <!-- المخزون التفصيلي -->
            <div id="warehouseInventory" class="warehouse-tab">
                <div class="filters-container">
                    <div class="filter-group search-filter-container">
                        <label class="filter-label">البحث في المنتجات</label>
                        <input type="text" id="inventorySearch" class="search-filter-input" placeholder="ابحث بالاسم أو الفئة..." onkeyup="searchInventory()">
                        <i class="fas fa-search search-filter-icon"></i>
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">المخزن</label>
                        <select id="warehouseFilter" class="filter-select" onchange="filterInventoryByWarehouse()">
                            <option value="">جميع المخازن</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label class="filter-label">الفئة</label>
                        <select id="categoryFilter" class="filter-select" onchange="filterInventoryByCategory()">
                            <option value="">جميع الفئات</option>
                        </select>
                    </div>

                    <div class="filter-actions">
                        <button class="filter-btn secondary" onclick="clearInventoryFilters()">
                            <i class="fas fa-times"></i>
                            مسح الفلاتر
                        </button>
                    </div>
                </div>

                <div class="inventory-table-container">
                    <table class="inventory-table" id="inventoryTable">
                        <thead>
                            <tr id="inventoryTableHeader">
                                <!-- رؤوس الجدول ستتم إضافتها ديناميكياً -->
                            </tr>
                        </thead>
                        <tbody id="inventoryTableBody">
                            <!-- بيانات المخزون -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- حركات المخزون -->
            <div id="warehouseMovements" class="warehouse-tab">
                <div class="movements-controls">
                    <div class="search-box">
                        <input type="text" id="movementsSearch" placeholder="البحث في الحركات..." onkeyup="searchMovements()">
                        <i class="fas fa-search"></i>
                    </div>
                    <select id="movementTypeFilter" onchange="filterMovements()">
                        <option value="">جميع الحركات</option>
                        <option value="transfer">نقل بين المخازن</option>
                        <option value="adjustment">تعديل مخزون</option>
                        <option value="sale">بيع</option>
                        <option value="purchase">شراء</option>
                    </select>
                    <input type="date" id="movementDateFilter" onchange="filterMovements()">
                </div>

                <div class="movements-list" id="movementsList">
                    <!-- قائمة حركات المخزون -->
                </div>
            </div>
        </div>
    `;

    loadWarehousesOverview();
    loadWarehousesGrid();
    loadInventoryTable();
    loadMovementsList();
}

// تحميل نظرة عامة على المخازن
function loadWarehousesOverview() {
    try {
        const warehouses = db.getTable('warehouses');
        const products = db.getTable('products');
        const overviewContainer = document.getElementById('warehousesOverview');

        if (!overviewContainer) return;

        let totalProducts = 0;
        let totalValue = 0;
        let lowStockItems = 0;

        products.forEach(product => {
            const totalQuantity = Object.values(product.warehouses || {}).reduce((sum, qty) => sum + qty, 0);
            totalProducts += totalQuantity;
            totalValue += totalQuantity * product.price;

            if (totalQuantity <= (product.minQuantity || 5)) {
                lowStockItems++;
            }
        });

        overviewContainer.innerHTML = `
            <div class="overview-card">
                <div class="card-icon">
                    <i class="fas fa-warehouse"></i>
                </div>
                <div class="card-info">
                    <h3>${db.toArabicNumbers(warehouses.length)}</h3>
                    <p>إجمالي المخازن</p>
                </div>
            </div>

            <div class="overview-card">
                <div class="card-icon">
                    <i class="fas fa-boxes"></i>
                </div>
                <div class="card-info">
                    <h3>${db.toArabicNumbers(totalProducts)}</h3>
                    <p>إجمالي المخزون</p>
                </div>
            </div>

            <div class="overview-card">
                <div class="card-icon">
                    <i class="fas fa-dollar-sign"></i>
                </div>
                <div class="card-info">
                    <h3>${formatCurrency(totalValue)}</h3>
                    <p>قيمة المخزون</p>
                </div>
            </div>

            <div class="overview-card ${lowStockItems > 0 ? 'warning' : ''}">
                <div class="card-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="card-info">
                    <h3>${db.toArabicNumbers(lowStockItems)}</h3>
                    <p>منتجات منخفضة</p>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('خطأ في تحميل نظرة عامة المخازن:', error);
    }
}

// تحميل شبكة المخازن
function loadWarehousesGrid() {
    try {
        const warehouses = db.getTable('warehouses');
        const products = db.getTable('products');
        const grid = document.getElementById('warehousesGrid');

        if (!grid) return;

        grid.innerHTML = warehouses.map(warehouse => {
            // حساب إحصائيات كل مخزن
            let warehouseProducts = 0;
            let warehouseValue = 0;

            products.forEach(product => {
                const quantity = product.warehouses?.[warehouse.id] || 0;
                warehouseProducts += quantity;
                warehouseValue += quantity * product.price;
            });

            return `
                <div class="warehouse-card ${warehouse.isActive ? 'active' : 'inactive'}">
                    <div class="warehouse-header">
                        <div class="warehouse-info">
                            <h3>${warehouse.name}</h3>
                            <p class="warehouse-location">${warehouse.location}</p>
                            <p class="warehouse-description">${warehouse.description}</p>
                        </div>
                        <div class="warehouse-status">
                            <span class="status-badge ${warehouse.isActive ? 'active' : 'inactive'}">
                                ${warehouse.isActive ? 'نشط' : 'غير نشط'}
                            </span>
                        </div>
                    </div>

                    <div class="warehouse-stats">
                        <div class="stat-item">
                            <span class="stat-label">عدد المنتجات:</span>
                            <span class="stat-value">${db.toArabicNumbers(warehouseProducts)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">قيمة المخزون:</span>
                            <span class="stat-value">${formatCurrency(warehouseValue)}</span>
                        </div>
                    </div>

                    <div class="warehouse-actions">
                        <button class="btn btn-sm btn-info" onclick="viewWarehouseDetails('${warehouse.id}')">
                            <i class="fas fa-eye"></i>
                            تفاصيل
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="editWarehouse('${warehouse.id}')">
                            <i class="fas fa-edit"></i>
                            تعديل
                        </button>
                        ${warehouse.id !== 'main' ? `
                            <button class="btn btn-sm btn-warning" onclick="toggleWarehouseStatus('${warehouse.id}')">
                                <i class="fas fa-power-off"></i>
                                ${warehouse.isActive ? 'إيقاف' : 'تفعيل'}
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteWarehouse('${warehouse.id}')">
                                <i class="fas fa-trash"></i>
                                حذف
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('خطأ في تحميل شبكة المخازن:', error);
    }
}

// عرض تبويب المخزن
function showWarehouseTab(tabName) {
    // إخفاء جميع التبويبات
    const tabs = document.querySelectorAll('.warehouse-tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    const tabBtns = document.querySelectorAll('.warehouses-tabs .tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));

    // عرض التبويب المطلوب
    const targetTab = document.getElementById('warehouse' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // تفعيل الزر المناسب
    const activeBtn = document.querySelector(`[onclick="showWarehouseTab('${tabName}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // تحميل البيانات المناسبة
    switch (tabName) {
        case 'overview':
            loadWarehousesOverview();
            loadWarehousesGrid();
            break;
        case 'inventory':
            loadInventoryTable();
            loadWarehouseFilters();
            break;
        case 'movements':
            loadMovementsList();
            break;
    }
}

// تحميل جدول المخزون
function loadInventoryTable() {
    try {
        const products = db.getTable('products');
        const categories = db.getTable('categories');
        const warehouses = db.getTable('warehouses').filter(w => w.isActive);
        const tableBody = document.getElementById('inventoryTableBody');
        const tableHeader = document.querySelector('#inventoryTable thead tr');

        if (!tableBody || !tableHeader) return;

        // تحديث رأس الجدول ديناميكياً
        const warehouseHeaders = warehouses.map(warehouse =>
            `<th class="warehouse-header">${warehouse.name}</th>`
        ).join('');

        tableHeader.innerHTML = `
            <th>المنتج</th>
            <th>الفئة</th>
            ${warehouseHeaders}
            <th>الإجمالي</th>
            <th>الحد الأدنى</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
        `;

        // تحديث محتوى الجدول
        tableBody.innerHTML = products.map(product => {
            const category = categories.find(c => c.id === product.category);
            const categoryName = category ? category.name : 'غير محدد';

            // حساب الكميات لكل مخزن
            let totalQty = product.quantity || 0; // الكمية الرئيسية
            const warehouseCells = warehouses.map(warehouse => {
                const qty = product.warehouses?.[warehouse.id] || 0;
                totalQty += qty;
                return `<td class="warehouse-qty">${db.toArabicNumbers(qty)}</td>`;
            }).join('');

            const status = totalQty === 0 ? 'نافد' :
                          totalQty <= (product.minQuantity || 5) ? 'منخفض' : 'متوفر';
            const statusClass = totalQty === 0 ? 'out-of-stock' :
                               totalQty <= (product.minQuantity || 5) ? 'low-stock' : 'in-stock';

            return `
                <tr class="inventory-row" data-product="${product.id}" data-category="${product.category}">
                    <td class="product-name">${product.name}</td>
                    <td class="product-category">${categoryName}</td>
                    ${warehouseCells}
                    <td class="total-qty">${db.toArabicNumbers(totalQty)}</td>
                    <td class="min-qty">${db.toArabicNumbers(product.minQuantity || 5)}</td>
                    <td class="stock-status ${statusClass}">${status}</td>
                    <td class="inventory-actions">
                        <button class="btn btn-sm btn-info" onclick="viewProductInventory('${product.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="adjustInventory('${product.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="transferInventory('${product.id}')">
                            <i class="fas fa-exchange-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('خطأ في تحميل جدول المخزون:', error);
    }
}

// تحميل فلاتر المخازن
function loadWarehouseFilters() {
    try {
        const warehouses = db.getTable('warehouses').filter(w => w.isActive);
        const categories = db.getTable('categories');

        const warehouseFilter = document.getElementById('warehouseFilter');
        const categoryFilter = document.getElementById('categoryFilter');

        if (warehouseFilter) {
            warehouseFilter.innerHTML = '<option value="">جميع المخازن</option>' +
                warehouses.map(warehouse =>
                    `<option value="${warehouse.id}">${warehouse.name}</option>`
                ).join('');
        }

        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">جميع الفئات</option>' +
                categories.map(category =>
                    `<option value="${category.id}">${category.name}</option>`
                ).join('');
        }

    } catch (error) {
        console.error('خطأ في تحميل فلاتر المخازن:', error);
    }
}

// تحميل قائمة حركات المخزون
function loadMovementsList() {
    try {
        const movements = db.getTable('inventory_movements');
        const list = document.getElementById('movementsList');

        if (!list) return;

        if (movements.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <h3>لا توجد حركات مخزون</h3>
                    <p>لم يتم تسجيل أي حركات مخزون بعد</p>
                </div>
            `;
            return;
        }

        const sortedMovements = movements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        list.innerHTML = sortedMovements.map(movement => {
            const typeText = getMovementTypeText(movement.type);
            const typeIcon = getMovementTypeIcon(movement.type);

            return `
                <div class="movement-item ${movement.type}" data-type="${movement.type}" data-date="${movement.createdAt.split('T')[0]}">
                    <div class="movement-header">
                        <div class="movement-info">
                            <h4><i class="fas ${typeIcon}"></i> ${typeText}</h4>
                            <p class="movement-date">${formatDate(movement.createdAt, true)}</p>
                        </div>
                        <div class="movement-amount">
                            <span class="quantity">${db.toArabicNumbers(movement.quantity)}</span>
                            <span class="product">${movement.productName}</span>
                        </div>
                    </div>

                    <div class="movement-details">
                        ${movement.fromWarehouse ? `<span class="from-warehouse">من: ${getWarehouseName(movement.fromWarehouse)}</span>` : ''}
                        ${movement.toWarehouse ? `<span class="to-warehouse">إلى: ${getWarehouseName(movement.toWarehouse)}</span>` : ''}
                        ${movement.notes ? `<p class="movement-notes">${movement.notes}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('خطأ في تحميل حركات المخزون:', error);
    }
}

// الحصول على نص نوع الحركة
function getMovementTypeText(type) {
    switch (type) {
        case 'transfer': return 'نقل بين المخازن';
        case 'adjustment': return 'تعديل مخزون';
        case 'sale': return 'بيع';
        case 'purchase': return 'شراء';
        default: return 'غير محدد';
    }
}

// الحصول على أيقونة نوع الحركة
function getMovementTypeIcon(type) {
    switch (type) {
        case 'transfer': return 'fa-exchange-alt';
        case 'adjustment': return 'fa-edit';
        case 'sale': return 'fa-shopping-cart';
        case 'purchase': return 'fa-shopping-bag';
        default: return 'fa-question';
    }
}

// الحصول على اسم المخزن
function getWarehouseName(warehouseId) {
    const warehouses = db.getTable('warehouses');
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : 'غير محدد';
}

// البحث في المخزون
function searchInventory() {
    const searchTerm = document.getElementById('inventorySearch').value.toLowerCase();
    const rows = document.querySelectorAll('.inventory-row');

    rows.forEach(row => {
        const productName = row.querySelector('.product-name').textContent.toLowerCase();
        const categoryName = row.querySelector('.product-category').textContent.toLowerCase();

        if (productName.includes(searchTerm) || categoryName.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// فلترة المخزون حسب المخزن
function filterInventoryByWarehouse() {
    const selectedWarehouse = document.getElementById('warehouseFilter').value;

    if (!selectedWarehouse) {
        loadInventoryTable();
        return;
    }

    try {
        const products = db.getTable('products');
        const categories = db.getTable('categories');
        const warehouse = db.findById('warehouses', selectedWarehouse);
        const tableBody = document.getElementById('inventoryTableBody');
        const tableHeader = document.querySelector('#inventoryTable thead tr');

        if (!warehouse || !tableBody || !tableHeader) return;

        // تحديث رأس الجدول لمخزن واحد
        tableHeader.innerHTML = `
            <th>المنتج</th>
            <th>الفئة</th>
            <th>${warehouse.name}</th>
            <th>الحد الأدنى</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
        `;

        // فلترة المنتجات التي لها كمية في هذا المخزن
        const warehouseProducts = products.filter(product => {
            const qty = product.warehouses?.[selectedWarehouse] || 0;
            return qty > 0;
        });

        if (warehouseProducts.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-box-open"></i>
                            <p>لا توجد منتجات في ${warehouse.name}</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = warehouseProducts.map(product => {
            const category = categories.find(c => c.id === product.categoryId);
            const categoryName = category ? category.name : 'غير محدد';
            const qty = product.warehouses?.[selectedWarehouse] || 0;
            const minQty = product.minQuantity || 5;

            let status = 'متوفر';
            let statusClass = 'available';

            if (qty <= minQty) {
                status = 'مخزون منخفض';
                statusClass = 'low-stock';
            }

            if (qty === 0) {
                status = 'غير متوفر';
                statusClass = 'out-of-stock';
            }

            return `
                <tr class="inventory-row" data-product="${product.id}" data-category="${product.category}">
                    <td class="product-name">${product.name}</td>
                    <td class="product-category">${categoryName}</td>
                    <td class="warehouse-qty">
                        <input type="number"
                               class="qty-input"
                               value="${qty}"
                               min="0"
                               data-product-id="${product.id}"
                               data-warehouse-id="${selectedWarehouse}"
                               onchange="updateProductQuantity('${product.id}', '${selectedWarehouse}', this.value)">
                    </td>
                    <td class="min-qty">${db.toArabicNumbers(minQty)}</td>
                    <td class="stock-status ${statusClass}">${status}</td>
                    <td class="inventory-actions">
                        <button class="btn btn-sm btn-info" onclick="viewProductInventory('${product.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="adjustInventory('${product.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="transferInventory('${product.id}')">
                            <i class="fas fa-exchange-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('خطأ في فلترة المخزون حسب المخزن:', error);
    }
}

// فلترة المخزون حسب الفئة
function filterInventoryByCategory() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const rows = document.querySelectorAll('.inventory-row');

    rows.forEach(row => {
        const rowCategory = row.getAttribute('data-category');

        if (!selectedCategory || rowCategory === selectedCategory) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// مسح فلاتر المخزون
function clearInventoryFilters() {
    document.getElementById('inventorySearch').value = '';
    document.getElementById('warehouseFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    loadInventoryTable();
}

// عرض نافذة إضافة مخزن جديد
function showAddWarehouseModal() {
    const content = `
        <form id="warehouseForm" onsubmit="saveWarehouse(event)">
            <div class="form-grid">
                <div class="form-group">
                    <label for="warehouseName">اسم المخزن *</label>
                    <input type="text" id="warehouseName" required>
                </div>

                <div class="form-group">
                    <label for="warehouseLocation">الموقع</label>
                    <input type="text" id="warehouseLocation">
                </div>
            </div>

            <div class="form-grid">
                <div class="form-group">
                    <label for="warehouseManager">المدير</label>
                    <input type="text" id="warehouseManager">
                </div>

                <div class="form-group">
                    <label for="warehouseCreationDate">تاريخ الإنشاء *</label>
                    <input type="date" id="warehouseCreationDate" class="date-picker-input" value="${getCurrentDateISO()}" required>
                </div>
            </div>

            <div class="form-group">
                <label for="warehouseDescription">الوصف</label>
                <textarea id="warehouseDescription" rows="3"></textarea>
            </div>

            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="warehouseActive" checked>
                    <span class="checkmark"></span>
                    مخزن نشط
                </label>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    حفظ المخزن
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('إضافة مخزن جديد', content);
}

// عرض تفاصيل المخزن
function viewWarehouseDetails(warehouseId) {
    const warehouse = db.findById('warehouses', warehouseId);
    if (!warehouse) {
        showNotification('المخزن غير موجود', 'error');
        return;
    }

    const products = db.getTable('products');
    const allProducts = products; // جميع المنتجات للإضافة
    const warehouseProducts = products.filter(product =>
        product.warehouses && product.warehouses[warehouseId] && product.warehouses[warehouseId] > 0
    );

    const totalValue = warehouseProducts.reduce((sum, product) =>
        sum + (product.price * (product.warehouses[warehouseId] || 0)), 0
    );

    const content = `
        <div class="warehouse-details-fullpage">
            <!-- معلومات المخزن في الأعلى -->
            <div class="warehouse-header-info">
                <div class="warehouse-title">
                    <h2>${warehouse.name}</h2>
                    <span class="warehouse-status ${warehouse.isActive ? 'active' : 'inactive'}">
                        ${warehouse.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                </div>

                <div class="warehouse-info-grid">
                    <div class="info-card">
                        <i class="fas fa-map-marker-alt"></i>
                        <div class="info-content">
                            <span class="label">الموقع</span>
                            <span class="value">${warehouse.location || 'غير محدد'}</span>
                        </div>
                    </div>

                    <div class="info-card">
                        <i class="fas fa-user-tie"></i>
                        <div class="info-content">
                            <span class="label">المدير</span>
                            <span class="value">${warehouse.manager || 'غير محدد'}</span>
                        </div>
                    </div>

                    <div class="info-card">
                        <i class="fas fa-boxes"></i>
                        <div class="info-content">
                            <span class="label">عدد المنتجات</span>
                            <span class="value">${db.toArabicNumbers(warehouseProducts.length)}</span>
                        </div>
                    </div>

                    <div class="info-card">
                        <i class="fas fa-dollar-sign"></i>
                        <div class="info-content">
                            <span class="label">القيمة الإجمالية</span>
                            <span class="value">${formatCurrency(totalValue)}</span>
                        </div>
                    </div>

                    <div class="info-card">
                        <i class="fas fa-calendar"></i>
                        <div class="info-content">
                            <span class="label">تاريخ الإنشاء</span>
                            <span class="value">${formatDate(warehouse.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- قسم المنتجات -->
            <div class="warehouse-products-section">
                <div class="products-header">
                    <h3>إدارة منتجات المخزن</h3>
                    <div class="products-actions">
                        <button class="btn btn-primary" onclick="showAddProductToWarehouse('${warehouseId}')">
                            <i class="fas fa-plus"></i>
                            إضافة منتج
                        </button>
                        <button class="btn btn-success" onclick="saveWarehouseChanges('${warehouseId}')">
                            <i class="fas fa-save"></i>
                            حفظ التغييرات
                        </button>
                    </div>
                </div>

                <div class="warehouse-products-table-container">
                    <table class="warehouse-products-table" id="warehouseProductsTable">
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>الكمية الحالية</th>
                                <th>الكمية الجديدة</th>
                                <th>السعر</th>
                                <th>القيمة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="warehouseProductsTableBody">
                            ${warehouseProducts.map(product => {
                                const currentQty = product.warehouses[warehouseId] || 0;
                                const value = product.price * currentQty;
                                return `
                                    <tr data-product-id="${product.id}">
                                        <td class="product-name">
                                            <img src="${getProductImage(product)}" alt="${product.name}" class="product-mini-image">
                                            ${product.name}
                                        </td>
                                        <td class="current-qty">${db.toArabicNumbers(currentQty)}</td>
                                        <td class="new-qty">
                                            <input type="number"
                                                   class="qty-input"
                                                   value="${currentQty}"
                                                   min="0"
                                                   data-product-id="${product.id}"
                                                   onchange="updateProductValue(this, '${product.price}')">
                                        </td>
                                        <td class="product-price">${formatCurrency(product.price)}</td>
                                        <td class="product-value" data-price="${product.price}">${formatCurrency(value)}</td>
                                        <td class="actions">
                                            <button class="btn btn-sm btn-danger" onclick="removeProductFromWarehouse('${product.id}', '${warehouseId}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>

                    ${warehouseProducts.length === 0 ?
                        '<div class="no-products-message">لا توجد منتجات في هذا المخزن. اضغط على "إضافة منتج" لبدء إضافة المنتجات.</div>'
                        : ''
                    }
                </div>
            </div>

            <div class="warehouse-details-actions">
                <button class="btn btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                    إغلاق
                </button>
            </div>
        </div>
    `;

    showModal('إدارة المخزن - ' + warehouse.name, content, 'fullpage');
}

// تحديث قيمة المنتج عند تغيير الكمية
function updateProductValue(input, price) {
    const newQty = parseInt(input.value) || 0;
    const value = newQty * parseFloat(price);
    const valueCell = input.closest('tr').querySelector('.product-value');
    valueCell.textContent = formatCurrency(value);
}

// إضافة منتج إلى المخزن
function showAddProductToWarehouse(warehouseId) {
    const products = db.getTable('products');
    const warehouse = db.findById('warehouses', warehouseId);

    // المنتجات غير الموجودة في المخزن
    const availableProducts = products.filter(product =>
        !product.warehouses || !product.warehouses[warehouseId] || product.warehouses[warehouseId] === 0
    );

    if (availableProducts.length === 0) {
        showNotification('جميع المنتجات موجودة بالفعل في هذا المخزن', 'info');
        return;
    }

    const content = `
        <form id="addProductToWarehouseForm" onsubmit="addProductToWarehouse(event, '${warehouseId}')">
            <div class="form-group">
                <label for="productSelect">اختر المنتج</label>
                <select id="productSelect" required>
                    <option value="">اختر منتج</option>
                    ${availableProducts.map(product =>
                        `<option value="${product.id}">${product.name} - ${formatCurrency(product.price)}</option>`
                    ).join('')}
                </select>
            </div>

            <div class="form-group">
                <label for="productQuantity">الكمية</label>
                <input type="number" id="productQuantity" min="1" value="1" required>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-plus"></i>
                    إضافة المنتج
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('إضافة منتج إلى ' + warehouse.name, content);
}

// إضافة منتج إلى المخزن
function addProductToWarehouse(event, warehouseId) {
    event.preventDefault();

    const productId = document.getElementById('productSelect').value;
    const quantity = parseInt(document.getElementById('productQuantity').value);

    if (!productId || !quantity) {
        showNotification('يرجى اختيار منتج وإدخال كمية صحيحة', 'error');
        return;
    }

    const product = db.findById('products', productId);
    if (!product) {
        showNotification('المنتج غير موجود', 'error');
        return;
    }

    // تحديث المنتج
    if (!product.warehouses) {
        product.warehouses = {};
    }
    product.warehouses[warehouseId] = quantity;

    const success = db.update('products', productId, product);

    if (success) {
        showNotification('تم إضافة المنتج إلى المخزن بنجاح', 'success');
        closeModal();

        // إعادة تحميل تفاصيل المخزن
        setTimeout(() => {
            viewWarehouseDetails(warehouseId);
        }, 500);
    } else {
        showNotification('خطأ في إضافة المنتج', 'error');
    }
}

// إزالة منتج من المخزن
function removeProductFromWarehouse(productId, warehouseId) {
    if (confirm('هل أنت متأكد من إزالة هذا المنتج من المخزن؟')) {
        const product = db.findById('products', productId);
        if (product && product.warehouses) {
            delete product.warehouses[warehouseId];

            const success = db.update('products', productId, product);

            if (success) {
                showNotification('تم إزالة المنتج من المخزن', 'success');

                // إزالة الصف من الجدول
                const row = document.querySelector(`tr[data-product-id="${productId}"]`);
                if (row) {
                    row.remove();
                }
            } else {
                showNotification('خطأ في إزالة المنتج', 'error');
            }
        }
    }
}

// حفظ تغييرات المخزن
function saveWarehouseChanges(warehouseId) {
    const inputs = document.querySelectorAll('.qty-input');
    const updates = [];

    inputs.forEach(input => {
        const productId = input.dataset.productId;
        const newQty = parseInt(input.value) || 0;
        updates.push({ productId, quantity: newQty });
    });

    if (updates.length === 0) {
        showNotification('لا توجد تغييرات للحفظ', 'info');
        return;
    }

    let successCount = 0;

    updates.forEach(update => {
        const product = db.findById('products', update.productId);
        if (product) {
            if (!product.warehouses) {
                product.warehouses = {};
            }

            if (update.quantity === 0) {
                delete product.warehouses[warehouseId];
            } else {
                product.warehouses[warehouseId] = update.quantity;
            }

            if (db.update('products', update.productId, product)) {
                successCount++;
            }
        }
    });

    if (successCount === updates.length) {
        showNotification('تم حفظ جميع التغييرات بنجاح', 'success');

        // إعادة تحميل تفاصيل المخزن
        setTimeout(() => {
            viewWarehouseDetails(warehouseId);
        }, 500);
    } else {
        showNotification(`تم حفظ ${successCount} من ${updates.length} تغييرات`, 'warning');
    }
}

// تعديل المخزن
function editWarehouse(warehouseId) {
    const warehouse = db.findById('warehouses', warehouseId);
    if (!warehouse) {
        showNotification('المخزن غير موجود', 'error');
        return;
    }

    const content = `
        <form id="editWarehouseForm" onsubmit="updateWarehouse(event, '${warehouseId}')">
            <div class="form-group">
                <label for="editWarehouseName">اسم المخزن *</label>
                <input type="text" id="editWarehouseName" value="${warehouse.name}" required>
            </div>

            <div class="form-grid">
                <div class="form-group">
                    <label for="editWarehouseLocation">الموقع</label>
                    <input type="text" id="editWarehouseLocation" value="${warehouse.location || ''}">
                </div>

                <div class="form-group">
                    <label for="editWarehouseManager">المدير</label>
                    <input type="text" id="editWarehouseManager" value="${warehouse.manager || ''}">
                </div>
            </div>

            <div class="form-group">
                <label for="editWarehouseCreationDate">تاريخ الإنشاء</label>
                <input type="date" id="editWarehouseCreationDate" class="date-picker-input"
                       value="${warehouse.creationDate || warehouse.createdAt?.split('T')[0] || getCurrentDateISO()}"
                       readonly>
                <small class="form-hint">تاريخ الإنشاء لا يمكن تعديله</small>
            </div>

            <div class="form-group">
                <label for="editWarehouseDescription">الوصف</label>
                <textarea id="editWarehouseDescription" rows="3">${warehouse.description || ''}</textarea>
            </div>

            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="editWarehouseActive" ${warehouse.isActive ? 'checked' : ''}>
                    <span class="checkmark"></span>
                    مخزن نشط
                </label>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    حفظ التعديلات
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('تعديل المخزن', content);
}

// تحديث المخزن
function updateWarehouse(event, warehouseId) {
    event.preventDefault();

    try {
        const formData = {
            name: document.getElementById('editWarehouseName').value.trim(),
            location: document.getElementById('editWarehouseLocation').value.trim(),
            manager: document.getElementById('editWarehouseManager').value.trim(),
            description: document.getElementById('editWarehouseDescription').value.trim(),
            isActive: document.getElementById('editWarehouseActive').checked,
            updatedAt: new Date().toISOString()
        };

        if (!formData.name) {
            showNotification('اسم المخزن مطلوب', 'error');
            return;
        }

        const success = db.update('warehouses', warehouseId, formData);

        if (success) {
            showNotification('تم تحديث المخزن بنجاح', 'success');
            closeModal();
            loadWarehousesSection();
        } else {
            showNotification('خطأ في تحديث المخزن', 'error');
        }

    } catch (error) {
        console.error('خطأ في تحديث المخزن:', error);
        showNotification('خطأ في تحديث المخزن', 'error');
    }
}

// تبديل حالة المخزن
function toggleWarehouseStatus(warehouseId) {
    const warehouse = db.findById('warehouses', warehouseId);
    if (!warehouse) {
        showNotification('المخزن غير موجود', 'error');
        return;
    }

    const newStatus = !warehouse.isActive;
    const action = newStatus ? 'تفعيل' : 'إيقاف';

    if (confirmDelete(`هل أنت متأكد من ${action} هذا المخزن؟`)) {
        const success = db.update('warehouses', warehouseId, {
            isActive: newStatus,
            updatedAt: new Date().toISOString()
        });

        if (success) {
            showNotification(`تم ${action} المخزن بنجاح`, 'success');
            loadWarehousesSection();
        } else {
            showNotification(`خطأ في ${action} المخزن`, 'error');
        }
    }
}

// حذف المخزن مع النقل التلقائي للمخزون
function deleteWarehouse(warehouseId) {
    const warehouse = db.findById('warehouses', warehouseId);
    if (!warehouse) {
        showNotification('المخزن غير موجود', 'error');
        return;
    }

    // التحقق من أن هذا ليس المخزن الرئيسي
    if (warehouseId === 'main') {
        showNotification('لا يمكن حذف المخزن الرئيسي', 'error');
        return;
    }

    // البحث عن المنتجات الموجودة في هذا المخزن
    const products = db.getTable('products');
    const productsInWarehouse = products.filter(product =>
        product.warehouses && product.warehouses[warehouseId] && product.warehouses[warehouseId] > 0
    );

    let confirmMessage = `هل أنت متأكد من حذف المخزن "${warehouse.name}"؟`;

    if (productsInWarehouse.length > 0) {
        confirmMessage += `\n\nيحتوي هذا المخزن على ${productsInWarehouse.length} منتج. سيتم نقل جميع المخزون تلقائياً إلى المخزن الرئيسي.`;
    }

    if (confirm(confirmMessage)) {
        try {
            let transferredItems = [];

            // نقل المخزون إلى المخزن الرئيسي
            if (productsInWarehouse.length > 0) {
                productsInWarehouse.forEach(product => {
                    const quantity = product.warehouses[warehouseId];

                    // إضافة الكمية إلى المخزن الرئيسي
                    product.quantity = (product.quantity || 0) + quantity;

                    // إزالة الكمية من المخزن المحذوف
                    delete product.warehouses[warehouseId];

                    // تحديث المنتج في قاعدة البيانات
                    db.update('products', product.id, product);

                    // إضافة إلى قائمة المنتجات المنقولة
                    transferredItems.push({
                        productName: product.name,
                        quantity: quantity
                    });

                    // تسجيل حركة المخزون
                    const movement = {
                        productId: product.id,
                        productName: product.name,
                        type: 'transfer',
                        fromWarehouse: warehouseId,
                        fromWarehouseName: warehouse.name,
                        toWarehouse: 'main',
                        toWarehouseName: 'المخزن الرئيسي',
                        quantity: quantity,
                        reason: `نقل تلقائي بسبب حذف المخزن: ${warehouse.name}`,
                        createdAt: new Date().toISOString()
                    };

                    db.insert('movements', movement);
                });
            }

            // حذف المخزن
            const success = db.delete('warehouses', warehouseId);

            if (success) {
                let message = 'تم حذف المخزن بنجاح';

                if (transferredItems.length > 0) {
                    message += `\n\nتم نقل ${transferredItems.length} منتج إلى المخزن الرئيسي:`;
                    transferredItems.forEach(item => {
                        message += `\n• ${item.productName}: ${item.quantity} قطعة`;
                    });
                }

                showNotification(message, 'success');

                // تحديث الواجهة
                loadWarehousesSection();

                // تحديث جدول المخزون إذا كان مفتوحاً
                const inventoryTable = document.getElementById('inventoryTable');
                if (inventoryTable) {
                    loadInventoryTable();
                    loadWarehouseFilters();
                }

            } else {
                showNotification('خطأ في حذف المخزن', 'error');
            }

        } catch (error) {
            console.error('خطأ في حذف المخزن:', error);
            showNotification('خطأ في حذف المخزن', 'error');
        }
    }
}

// حفظ المخزن
function saveWarehouse(event) {
    event.preventDefault();

    try {
        const formData = {
            name: document.getElementById('warehouseName').value.trim(),
            location: document.getElementById('warehouseLocation').value.trim(),
            manager: document.getElementById('warehouseManager').value.trim(),
            description: document.getElementById('warehouseDescription').value.trim(),
            isActive: document.getElementById('warehouseActive').checked,
            creationDate: document.getElementById('warehouseCreationDate').value
        };

        if (!formData.name) {
            showNotification('يرجى إدخال اسم المخزن', 'error');
            return;
        }

        // التحقق من عدم تكرار الاسم
        const warehouses = db.getTable('warehouses');
        const existingWarehouse = warehouses.find(w => w.name === formData.name);
        if (existingWarehouse) {
            showNotification('اسم المخزن موجود مسبقاً', 'error');
            return;
        }

        const savedWarehouse = db.insert('warehouses', formData);

        if (savedWarehouse) {
            showNotification('تم حفظ المخزن بنجاح', 'success');
            closeModal();
            loadWarehousesGrid();
            loadWarehousesOverview();

            // تحديث جدول المخزون إذا كان مفتوحاً
            const inventoryTable = document.getElementById('inventoryTable');
            if (inventoryTable) {
                loadInventoryTable();
                loadWarehouseFilters();
            }
        } else {
            showNotification('خطأ في حفظ المخزن', 'error');
        }

    } catch (error) {
        console.error('خطأ في حفظ المخزن:', error);
        showNotification('خطأ في حفظ المخزن', 'error');
    }
}

// عرض نافذة نقل المخزون
function showInventoryMovementModal() {
    const products = db.getTable('products');
    const warehouses = db.getTable('warehouses').filter(w => w.isActive);

    const content = `
        <form id="movementForm" onsubmit="saveInventoryMovement(event)">
            <div class="form-grid">
                <div class="form-group">
                    <label for="movementProduct">المنتج *</label>
                    <select id="movementProduct" onchange="updateAvailableQuantity()" required>
                        <option value="">اختر المنتج</option>
                        ${products.map(product =>
                            `<option value="${product.id}">${product.name}</option>`
                        ).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label for="movementQuantity">الكمية *</label>
                    <input type="number" id="movementQuantity" min="1" step="1" required>
                    <small id="availableQuantity" class="form-help"></small>
                </div>
            </div>

            <div class="form-grid">
                <div class="form-group">
                    <label for="fromWarehouse">من المخزن *</label>
                    <select id="fromWarehouse" onchange="updateAvailableQuantity()" required>
                        <option value="">اختر المخزن</option>
                        ${warehouses.map(warehouse =>
                            `<option value="${warehouse.id}">${warehouse.name}</option>`
                        ).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label for="toWarehouse">إلى المخزن *</label>
                    <select id="toWarehouse" required>
                        <option value="">اختر المخزن</option>
                        ${warehouses.map(warehouse =>
                            `<option value="${warehouse.id}">${warehouse.name}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label for="movementNotes">ملاحظات</label>
                <textarea id="movementNotes" rows="3"></textarea>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-success">
                    <i class="fas fa-exchange-alt"></i>
                    تنفيذ النقل
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('نقل مخزون بين المخازن', content);
}

// تحديث الكمية المتاحة
function updateAvailableQuantity() {
    const productId = document.getElementById('movementProduct').value;
    const warehouseId = document.getElementById('fromWarehouse').value;
    const availableElement = document.getElementById('availableQuantity');

    if (productId && warehouseId) {
        const product = db.findById('products', productId);
        const availableQty = product?.warehouses?.[warehouseId] || 0;

        availableElement.textContent = `متاح: ${db.toArabicNumbers(availableQty)} قطعة`;
        availableElement.style.color = availableQty > 0 ? 'var(--success-color)' : 'var(--error-color)';

        // تحديث الحد الأقصى للكمية
        const quantityInput = document.getElementById('movementQuantity');
        quantityInput.max = availableQty;
    } else {
        availableElement.textContent = '';
    }
}

// حفظ حركة المخزون
function saveInventoryMovement(event) {
    event.preventDefault();

    try {
        const productId = document.getElementById('movementProduct').value;
        const quantity = parseInt(document.getElementById('movementQuantity').value);
        const fromWarehouse = document.getElementById('fromWarehouse').value;
        const toWarehouse = document.getElementById('toWarehouse').value;
        const notes = document.getElementById('movementNotes').value.trim();

        // التحقق من البيانات
        if (!productId || !quantity || !fromWarehouse || !toWarehouse) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        if (fromWarehouse === toWarehouse) {
            showNotification('لا يمكن النقل إلى نفس المخزن', 'error');
            return;
        }

        const product = db.findById('products', productId);
        if (!product) {
            showNotification('المنتج غير موجود', 'error');
            return;
        }

        const availableQty = product.warehouses?.[fromWarehouse] || 0;
        if (quantity > availableQty) {
            showNotification('الكمية المطلوبة أكبر من المتاح', 'error');
            return;
        }

        // تنفيذ النقل
        const updatedWarehouses = { ...product.warehouses };
        updatedWarehouses[fromWarehouse] = (updatedWarehouses[fromWarehouse] || 0) - quantity;
        updatedWarehouses[toWarehouse] = (updatedWarehouses[toWarehouse] || 0) + quantity;

        // تحديث المنتج
        db.update('products', productId, { warehouses: updatedWarehouses });

        // تسجيل الحركة
        const movement = {
            productId: productId,
            productName: product.name,
            quantity: quantity,
            fromWarehouse: fromWarehouse,
            toWarehouse: toWarehouse,
            type: 'transfer',
            notes: notes
        };

        db.insert('inventory_movements', movement);

        showNotification('تم نقل المخزون بنجاح', 'success');
        closeModal();
        loadInventoryTable();
        loadMovementsList();
        loadWarehousesOverview();

    } catch (error) {
        console.error('خطأ في نقل المخزون:', error);
        showNotification('خطأ في نقل المخزون', 'error');
    }
}

// عرض تفاصيل مخزون المنتج
function viewProductInventory(productId) {
    const product = db.findById('products', productId);
    if (!product) {
        showNotification('المنتج غير موجود', 'error');
        return;
    }

    const warehouses = db.getTable('warehouses');

    const content = `
        <div class="product-inventory-view">
            <div class="product-header">
                <h3>${product.name}</h3>
                <p>الباركود: ${product.barcode || 'غير محدد'}</p>
            </div>

            <div class="inventory-breakdown">
                <h4>توزيع المخزون:</h4>
                <div class="warehouse-breakdown">
                    ${warehouses.map(warehouse => {
                        const quantity = product.warehouses?.[warehouse.id] || 0;
                        return `
                            <div class="warehouse-item">
                                <div class="warehouse-info">
                                    <span class="warehouse-name">${warehouse.name}</span>
                                    <span class="warehouse-location">${warehouse.location}</span>
                                </div>
                                <div class="warehouse-quantity">
                                    <span class="quantity">${db.toArabicNumbers(quantity)}</span>
                                    <span class="unit">قطعة</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="total-summary">
                    <div class="summary-item">
                        <span class="label">الإجمالي:</span>
                        <span class="value">${db.toArabicNumbers(Object.values(product.warehouses || {}).reduce((sum, qty) => sum + qty, 0))} قطعة</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">الحد الأدنى:</span>
                        <span class="value">${db.toArabicNumbers(product.minQuantity || 5)} قطعة</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">القيمة الإجمالية:</span>
                        <span class="value">${formatCurrency(Object.values(product.warehouses || {}).reduce((sum, qty) => sum + qty, 0) * product.price)}</span>
                    </div>
                </div>
            </div>

            <div class="inventory-actions-section">
                <button class="btn btn-warning" onclick="closeModal(); adjustInventory('${productId}')">
                    <i class="fas fa-edit"></i>
                    تعديل المخزون
                </button>
                <button class="btn btn-success" onclick="closeModal(); transferInventory('${productId}')">
                    <i class="fas fa-exchange-alt"></i>
                    نقل مخزون
                </button>
                <button class="btn btn-secondary" onclick="closeModal()">
                    إغلاق
                </button>
            </div>
        </div>
    `;

    showModal('تفاصيل مخزون المنتج', content);
}

// تعديل مخزون المنتج
function adjustInventory(productId) {
    const product = db.findById('products', productId);
    if (!product) {
        showNotification('المنتج غير موجود', 'error');
        return;
    }

    const warehouses = db.getTable('warehouses').filter(w => w.isActive);

    const content = `
        <form id="adjustmentForm" onsubmit="saveInventoryAdjustment(event, '${productId}')">
            <div class="adjustment-header">
                <h4>تعديل مخزون: ${product.name}</h4>
                <p>الكميات الحالية:</p>
                <div class="current-quantities">
                    ${warehouses.map(warehouse => {
                        const currentQty = product.warehouses?.[warehouse.id] || 0;
                        return `
                            <div class="current-qty-item">
                                <span>${warehouse.name}:</span>
                                <span>${db.toArabicNumbers(currentQty)} قطعة</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="adjustment-inputs">
                <h4>الكميات الجديدة:</h4>
                ${warehouses.map(warehouse => {
                    const currentQty = product.warehouses?.[warehouse.id] || 0;
                    return `
                        <div class="form-group">
                            <label for="qty_${warehouse.id}">${warehouse.name}</label>
                            <input type="number" id="qty_${warehouse.id}" min="0" step="1" value="${currentQty}">
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="form-group">
                <label for="adjustmentReason">سبب التعديل *</label>
                <select id="adjustmentReason" required>
                    <option value="">اختر السبب</option>
                    <option value="inventory_count">جرد مخزون</option>
                    <option value="damage">تلف</option>
                    <option value="theft">فقدان</option>
                    <option value="correction">تصحيح خطأ</option>
                    <option value="other">أخرى</option>
                </select>
            </div>

            <div class="form-group">
                <label for="adjustmentNotes">ملاحظات</label>
                <textarea id="adjustmentNotes" rows="3"></textarea>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-warning">
                    <i class="fas fa-save"></i>
                    حفظ التعديل
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('تعديل مخزون المنتج', content);
}

// حفظ تعديل المخزون
function saveInventoryAdjustment(event, productId) {
    event.preventDefault();

    try {
        const product = db.findById('products', productId);
        if (!product) {
            showNotification('المنتج غير موجود', 'error');
            return;
        }

        const reason = document.getElementById('adjustmentReason').value;
        const notes = document.getElementById('adjustmentNotes').value.trim();

        if (!reason) {
            showNotification('يرجى اختيار سبب التعديل', 'error');
            return;
        }

        const warehouses = db.getTable('warehouses').filter(w => w.isActive);
        const newQuantities = {};
        let hasChanges = false;

        // جمع الكميات الجديدة
        warehouses.forEach(warehouse => {
            const newQty = parseInt(document.getElementById(`qty_${warehouse.id}`).value) || 0;
            const oldQty = product.warehouses?.[warehouse.id] || 0;

            newQuantities[warehouse.id] = newQty;

            if (newQty !== oldQty) {
                hasChanges = true;

                // تسجيل الحركة
                const movement = {
                    productId: productId,
                    productName: product.name,
                    quantity: Math.abs(newQty - oldQty),
                    warehouse: warehouse.id,
                    type: 'adjustment',
                    reason: reason,
                    notes: `${notes} - تغيير من ${db.toArabicNumbers(oldQty)} إلى ${db.toArabicNumbers(newQty)}`,
                    oldQuantity: oldQty,
                    newQuantity: newQty
                };

                db.insert('inventory_movements', movement);
            }
        });

        if (!hasChanges) {
            showNotification('لم يتم إجراء أي تغييرات', 'info');
            return;
        }

        // تحديث المنتج
        const totalQuantity = Object.values(newQuantities).reduce((sum, qty) => sum + qty, 0);
        db.update('products', productId, {
            warehouses: newQuantities,
            quantity: totalQuantity
        });

        showNotification('تم تعديل المخزون بنجاح', 'success');
        closeModal();
        loadInventoryTable();
        loadMovementsList();
        loadWarehousesOverview();

    } catch (error) {
        console.error('خطأ في تعديل المخزون:', error);
        showNotification('خطأ في تعديل المخزون', 'error');
    }
}

// نقل مخزون منتج محدد
function transferInventory(productId) {
    const product = db.findById('products', productId);
    if (!product) {
        showNotification('المنتج غير موجود', 'error');
        return;
    }

    const warehouses = db.getTable('warehouses').filter(w => w.isActive);

    const content = `
        <form id="transferForm" onsubmit="saveProductTransfer(event, '${productId}')">
            <div class="transfer-header">
                <h4>نقل مخزون: ${product.name}</h4>
            </div>

            <div class="form-grid">
                <div class="form-group">
                    <label for="transferFromWarehouse">من المخزن *</label>
                    <select id="transferFromWarehouse" onchange="updateTransferQuantity()" required>
                        <option value="">اختر المخزن</option>
                        ${warehouses.map(warehouse => {
                            const qty = product.warehouses?.[warehouse.id] || 0;
                            return `<option value="${warehouse.id}" ${qty === 0 ? 'disabled' : ''}>${warehouse.name} (${db.toArabicNumbers(qty)} قطعة)</option>`;
                        }).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label for="transferToWarehouse">إلى المخزن *</label>
                    <select id="transferToWarehouse" required>
                        <option value="">اختر المخزن</option>
                        ${warehouses.map(warehouse =>
                            `<option value="${warehouse.id}">${warehouse.name}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label for="transferQuantity">الكمية *</label>
                <input type="number" id="transferQuantity" min="1" step="1" required>
                <small id="transferAvailable" class="form-help"></small>
            </div>

            <div class="form-group">
                <label for="transferNotes">ملاحظات</label>
                <textarea id="transferNotes" rows="3"></textarea>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-success">
                    <i class="fas fa-exchange-alt"></i>
                    تنفيذ النقل
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
        </form>
    `;

    showModal('نقل مخزون المنتج', content);
}

// تحديث كمية النقل المتاحة
function updateTransferQuantity() {
    const productId = document.querySelector('[id^="transferForm"]')?.getAttribute('onsubmit')?.match(/'([^']+)'/)?.[1];
    const warehouseId = document.getElementById('transferFromWarehouse').value;
    const availableElement = document.getElementById('transferAvailable');

    if (productId && warehouseId) {
        const product = db.findById('products', productId);
        const availableQty = product?.warehouses?.[warehouseId] || 0;

        availableElement.textContent = `متاح: ${db.toArabicNumbers(availableQty)} قطعة`;
        availableElement.style.color = availableQty > 0 ? 'var(--success-color)' : 'var(--error-color)';

        const quantityInput = document.getElementById('transferQuantity');
        quantityInput.max = availableQty;
    } else {
        availableElement.textContent = '';
    }
}

// حفظ نقل المنتج
function saveProductTransfer(event, productId) {
    event.preventDefault();

    try {
        const quantity = parseInt(document.getElementById('transferQuantity').value);
        const fromWarehouse = document.getElementById('transferFromWarehouse').value;
        const toWarehouse = document.getElementById('transferToWarehouse').value;
        const notes = document.getElementById('transferNotes').value.trim();

        if (!quantity || !fromWarehouse || !toWarehouse) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        if (fromWarehouse === toWarehouse) {
            showNotification('لا يمكن النقل إلى نفس المخزن', 'error');
            return;
        }

        const product = db.findById('products', productId);
        if (!product) {
            showNotification('المنتج غير موجود', 'error');
            return;
        }

        const availableQty = product.warehouses?.[fromWarehouse] || 0;
        if (quantity > availableQty) {
            showNotification('الكمية المطلوبة أكبر من المتاح', 'error');
            return;
        }

        // تنفيذ النقل
        const updatedWarehouses = { ...product.warehouses };
        updatedWarehouses[fromWarehouse] = (updatedWarehouses[fromWarehouse] || 0) - quantity;
        updatedWarehouses[toWarehouse] = (updatedWarehouses[toWarehouse] || 0) + quantity;

        db.update('products', productId, { warehouses: updatedWarehouses });

        // تسجيل الحركة
        const movement = {
            productId: productId,
            productName: product.name,
            quantity: quantity,
            fromWarehouse: fromWarehouse,
            toWarehouse: toWarehouse,
            type: 'transfer',
            notes: notes
        };

        db.insert('inventory_movements', movement);

        showNotification('تم نقل المخزون بنجاح', 'success');
        closeModal();
        loadInventoryTable();
        loadMovementsList();
        loadWarehousesOverview();

    } catch (error) {
        console.error('خطأ في نقل المخزون:', error);
        showNotification('خطأ في نقل المخزون', 'error');
    }
}

// ===== إدارة صور المنتجات =====

// الصورة الافتراضية للمنتجات
const DEFAULT_PRODUCT_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwQzExMC40NTcgMTIwIDEyMCAxMTAuNDU3IDEyMCAxMDBDMTIwIDg5LjU0MyAxMTAuNDU3IDgwIDEwMCA4MEM4OS41NDMgODAgODAgODkuNTQzIDgwIDEwMEM4MCAxMTAuNDU3IDg5LjU0MyAxMjAgMTAwIDEyMFoiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTcwIDEzMEg5MEwxMDAgMTQwTDExMCAxMzBIMTMwTDE0MCAyMDBINjBMNzAgMTMwWiIgZmlsbD0iI0QxRDVEQiIvPgo8L3N2Zz4K';

// ضغط الصورة
function compressImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function() {
            // حساب الأبعاد الجديدة مع الحفاظ على النسبة
            let { width, height } = img;

            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            // رسم الصورة المضغوطة
            ctx.drawImage(img, 0, 0, width, height);

            // تحويل إلى base64
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
        };

        img.src = URL.createObjectURL(file);
    });
}

// معاينة الصورة
function previewImage(input, previewId) {
    const file = input.files[0];
    const preview = document.getElementById(previewId);

    if (!preview) return;

    if (file) {
        // التحقق من نوع الملف
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showNotification('يرجى اختيار صورة بصيغة JPG أو PNG أو WebP', 'error');
            input.value = '';
            preview.src = DEFAULT_PRODUCT_IMAGE;
            return;
        }

        // التحقق من حجم الملف (5MB كحد أقصى)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('حجم الصورة يجب أن يكون أقل من 5 ميجابايت', 'error');
            input.value = '';
            preview.src = DEFAULT_PRODUCT_IMAGE;
            return;
        }

        // عرض حالة التحميل
        preview.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjE0Ij7Yp9mE2KrYrdmF2YrZhC4uLjwvdGV4dD4KPHN2Zz4K';

        // ضغط ومعاينة الصورة
        compressImage(file).then(compressedDataUrl => {
            preview.src = compressedDataUrl;
            preview.dataset.compressed = compressedDataUrl;
        }).catch(error => {
            console.error('خطأ في ضغط الصورة:', error);
            showNotification('خطأ في معالجة الصورة', 'error');
            preview.src = DEFAULT_PRODUCT_IMAGE;
        });
    } else {
        preview.src = DEFAULT_PRODUCT_IMAGE;
        delete preview.dataset.compressed;
    }
}

// إنشاء صورة مصغرة
function createThumbnail(imageDataUrl, size = 40) {
    return new Promise((resolve) => {
        if (!imageDataUrl || imageDataUrl === DEFAULT_PRODUCT_IMAGE) {
            resolve(DEFAULT_PRODUCT_IMAGE);
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function() {
            canvas.width = size;
            canvas.height = size;

            // رسم الصورة مع الحفاظ على النسبة والقص المركزي
            const scale = Math.max(size / img.width, size / img.height);
            const x = (size - img.width * scale) / 2;
            const y = (size - img.height * scale) / 2;

            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };

        img.onerror = function() {
            resolve(DEFAULT_PRODUCT_IMAGE);
        };

        img.src = imageDataUrl;
    });
}

// الحصول على صورة المنتج
function getProductImage(product) {
    return product.image || DEFAULT_PRODUCT_IMAGE;
}

// ===== وظائف الجوال =====

// تبديل القائمة الجانبية للجوال
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');

    if (sidebar && overlay) {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
    }
}

// إغلاق القائمة الجانبية للجوال
function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');

    if (sidebar && overlay) {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
    }
}

// إظهار/إخفاء زر القائمة حسب حجم الشاشة
function handleMobileMenuVisibility() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

    if (mobileMenuBtn) {
        if (window.innerWidth <= 768) {
            mobileMenuBtn.style.display = 'block';
        } else {
            mobileMenuBtn.style.display = 'none';
            closeMobileMenu(); // إغلاق القائمة إذا كانت مفتوحة
        }
    }
}

// تحسين الأداء للجوال
function optimizeForMobile() {
    // تحسين الصور للجوال
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.loading) {
            img.loading = 'lazy';
        }
    });

    // تحسين الجداول للجوال
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        if (!table.parentElement.classList.contains('table-responsive')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
}

// ===== منتقي التاريخ =====

// تحويل حقول التاريخ إلى منتقي تاريخ محسن
function initializeDatePickers() {
    // البحث عن جميع حقول التاريخ
    const dateInputs = document.querySelectorAll('input[type="date"], input[data-date="true"]');

    dateInputs.forEach(input => {
        // إضافة الفئات المطلوبة
        input.classList.add('date-picker-input');

        // إضافة container إذا لم يكن موجوداً
        if (!input.parentElement.classList.contains('date-picker-container')) {
            const container = document.createElement('div');
            container.className = 'date-picker-container';
            input.parentNode.insertBefore(container, input);
            container.appendChild(input);
        }

        // تعيين القيمة الافتراضية للتاريخ الحالي إذا لم تكن محددة
        if (!input.value && input.hasAttribute('data-default-today')) {
            input.value = new Date().toISOString().split('T')[0];
        }
    });
}

// إنشاء منتقي نطاق تاريخ
function createDateRangePicker(fromInputId, toInputId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="date-range-container">
            <div class="date-picker-container">
                <input type="date" id="${fromInputId}" class="date-picker-input" placeholder="من تاريخ">
            </div>
            <span class="date-range-separator">إلى</span>
            <div class="date-picker-container">
                <input type="date" id="${toInputId}" class="date-picker-input" placeholder="إلى تاريخ">
            </div>
        </div>
    `;

    // إضافة التحقق من صحة النطاق
    const fromInput = document.getElementById(fromInputId);
    const toInput = document.getElementById(toInputId);

    fromInput.addEventListener('change', function() {
        if (toInput.value && fromInput.value > toInput.value) {
            toInput.value = fromInput.value;
        }
        toInput.min = fromInput.value;
    });

    toInput.addEventListener('change', function() {
        if (fromInput.value && toInput.value < fromInput.value) {
            fromInput.value = toInput.value;
        }
        fromInput.max = toInput.value;
    });
}

// تنسيق التاريخ للعرض
function formatDateForDisplay(dateString, includeTime = false) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };

    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }

    return date.toLocaleDateString('ar-SA', options);
}

// الحصول على التاريخ الحالي بصيغة ISO
function getCurrentDateISO() {
    return new Date().toISOString().split('T')[0];
}

// التحقق من صحة نطاق التاريخ
function validateDateRange(fromDate, toDate) {
    if (!fromDate || !toDate) return true;
    return new Date(fromDate) <= new Date(toDate);
}

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إنشاء المستخدم الافتراضي
    createDefaultAdmin();

    // التحقق من الجلسة
    if (!checkSession()) {
        // إظهار شاشة تسجيل الدخول
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    }

    // ربط نموذج تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }

    // تهيئة الجوال
    handleMobileMenuVisibility();
    optimizeForMobile();

    // تهيئة منتقي التاريخ
    initializeDatePickers();

    // مراقبة تغيير حجم الشاشة
    window.addEventListener('resize', () => {
        handleMobileMenuVisibility();
        optimizeForMobile();
    });

    // إغلاق القائمة عند النقر على رابط (للجوال)
    document.addEventListener('click', (e) => {
        if (e.target.matches('.nav-list a')) {
            closeMobileMenu();
        }
    });
});

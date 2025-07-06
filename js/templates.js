/**
 * قوالب HTML المدمجة - حل مشكلة CORS
 * أبوسليمان للمحاسبة - نظام إدارة نقاط البيع
 */

// قوالب HTML مدمجة لتجنب مشاكل CORS في التطوير المحلي
window.Templates = {
    
    // قالب لوحة المعلومات
    dashboard: `
        <div class="section-header">
            <h2><i class="fas fa-tachometer-alt"></i> لوحة المعلومات</h2>
            <div class="date-time-info">
                <div class="date-info">
                    <div class="hijri-date">
                        <i class="fas fa-calendar-alt"></i>
                        <span id="currentHijriDate"></span>
                    </div>
                    <div class="gregorian-date">
                        <i class="fas fa-calendar"></i>
                        <span id="currentGregorianDate"></span>
                    </div>
                </div>
                <div class="time-info">
                    <div class="current-time">
                        <i class="fas fa-clock"></i>
                        <span id="currentTime"></span>
                    </div>
                    <div class="day-of-week">
                        <span id="dayOfWeek"></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- بطاقات الإحصائيات -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-dollar-sign"></i>
                </div>
                <div class="stat-info">
                    <h3 id="totalSales">٠.٠٠٠ د.ك</h3>
                    <p>إجمالي المبيعات اليوم</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-box"></i>
                </div>
                <div class="stat-info">
                    <h3 id="totalProducts">٠</h3>
                    <p>عدد المنتجات</p>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-info">
                    <h3 id="totalCustomers">٠</h3>
                    <p>عدد العملاء</p>
                </div>
            </div>
            
            <div class="stat-card clickable-card" onclick="showLowStockDetails()">
                <div class="stat-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="stat-info">
                    <h3 id="lowStockItems">٠</h3>
                    <p>منتجات منخفضة المخزون</p>
                </div>
                <div class="card-action-hint">
                    <i class="fas fa-external-link-alt"></i>
                </div>
            </div>

            <!-- بطاقات الفواتير الجديدة -->
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-receipt"></i>
                </div>
                <div class="stat-info">
                    <h3 id="totalInvoices">٠</h3>
                    <p>إجمالي الفواتير</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-calendar-day"></i>
                </div>
                <div class="stat-info">
                    <h3 id="todayInvoices">٠</h3>
                    <p>فواتير اليوم</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-calendar-week"></i>
                </div>
                <div class="stat-info">
                    <h3 id="weekInvoices">٠</h3>
                    <p>فواتير هذا الأسبوع</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="stat-info">
                    <h3 id="monthInvoices">٠</h3>
                    <p>فواتير هذا الشهر</p>
                </div>
            </div>
        </div>

        <!-- الرسوم البيانية والتنبيهات -->
        <div class="dashboard-grid">
            <div class="chart-container">
                <h3>مبيعات الأسبوع</h3>
                <canvas id="salesChart"></canvas>
            </div>
            
            <div class="alerts-container">
                <h3>التنبيهات</h3>
                <div id="alertsList" class="alerts-list">
                    <!-- سيتم ملء التنبيهات ديناميكياً -->
                </div>
            </div>
            
            <div class="recent-sales">
                <h3>آخر المبيعات</h3>
                <div id="recentSalesList" class="recent-sales-list">
                    <!-- سيتم ملء المبيعات الأخيرة ديناميكياً -->
                </div>
            </div>
            
            <div class="quick-actions">
                <h3>إجراءات سريعة</h3>
                <div class="quick-actions-grid">
                    <button class="quick-action-btn" onclick="showSection('sales')">
                        <i class="fas fa-plus"></i>
                        <span>فاتورة جديدة</span>
                    </button>
                    <button class="quick-action-btn" onclick="showSection('products')">
                        <i class="fas fa-box"></i>
                        <span>إضافة منتج</span>
                    </button>
                    <button class="quick-action-btn" onclick="showSection('customers')">
                        <i class="fas fa-user-plus"></i>
                        <span>عميل جديد</span>
                    </button>
                    <button class="quick-action-btn" onclick="showSection('reports')">
                        <i class="fas fa-chart-bar"></i>
                        <span>التقارير</span>
                    </button>
                </div>
            </div>
        </div>
    `,

    // قالب المبيعات
    sales: `
        <div class="section-header">
            <h2><i class="fas fa-shopping-cart"></i> المبيعات</h2>
            <div class="section-actions">
                <button class="btn primary" onclick="newSale()">
                    <i class="fas fa-plus"></i>
                    فاتورة جديدة
                </button>
                <button class="btn secondary" onclick="showSalesHistory()">
                    <i class="fas fa-history"></i>
                    سجل المبيعات
                </button>
            </div>
        </div>

        <!-- نظام نقاط البيع -->
        <div class="pos-container">
            <div class="pos-grid">
                <!-- منطقة المنتجات -->
                <div class="products-area">
                    <div class="products-header">
                        <div class="search-container">
                            <input type="text" id="productSearch" class="form-input" placeholder="البحث عن منتج..." onkeyup="searchProducts(this.value)">
                            <i class="fas fa-search"></i>
                        </div>
                        <div class="category-filter">
                            <select id="categoryFilter" class="form-select" onchange="filterByCategory(this.value)">
                                <option value="">جميع الفئات</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="products-grid" id="productsGrid">
                        <!-- المنتجات ستظهر هنا -->
                    </div>
                </div>

                <!-- منطقة السلة -->
                <div class="cart-area">
                    <div class="cart-header">
                        <h3><i class="fas fa-shopping-cart"></i> السلة</h3>
                        <button class="btn btn-sm secondary" onclick="clearCart()">
                            <i class="fas fa-trash"></i>
                            مسح الكل
                        </button>
                    </div>

                    <div class="cart-items" id="cartItems">
                        <!-- عناصر السلة ستظهر هنا -->
                    </div>

                    <div class="cart-summary">
                        <div class="summary-row">
                            <span>المجموع الفرعي:</span>
                            <span id="subtotal">٠.٠٠٠ د.ك</span>
                        </div>
                        <div class="summary-row">
                            <span>الخصم:</span>
                            <div class="discount-input">
                                <input type="number" id="discountAmount" class="form-input" placeholder="0" min="0" step="0.001" onchange="updateTotals()">
                                <select id="discountType" class="form-select" onchange="updateTotals()">
                                    <option value="amount">د.ك</option>
                                    <option value="percentage">%</option>
                                </select>
                            </div>
                        </div>
                        <div class="summary-row">
                            <span>الضريبة:</span>
                            <div class="tax-input">
                                <input type="number" id="taxAmount" class="form-input" placeholder="0" min="0" step="0.001" onchange="updateTotals()">
                                <select id="taxType" class="form-select" onchange="updateTotals()">
                                    <option value="amount">د.ك</option>
                                    <option value="percentage">%</option>
                                </select>
                            </div>
                        </div>
                        <div class="summary-row total">
                            <span>الإجمالي:</span>
                            <span id="total">٠.٠٠٠ د.ك</span>
                        </div>
                    </div>

                    <div class="customer-selection">
                        <label class="form-label">العميل:</label>
                        <div class="customer-input-group">
                            <select id="customerSelect" class="form-select">
                                <option value="">اختر العميل</option>
                            </select>
                            <button class="btn btn-sm info" onclick="addNewCustomer()">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>

                    <div class="payment-section">
                        <label class="form-label">طريقة الدفع:</label>
                        <div class="payment-methods">
                            <label class="payment-method">
                                <input type="radio" name="paymentMethod" value="cash" checked>
                                <span><i class="fas fa-money-bill"></i> نقداً</span>
                            </label>
                            <label class="payment-method">
                                <input type="radio" name="paymentMethod" value="card">
                                <span><i class="fas fa-credit-card"></i> بطاقة</span>
                            </label>
                            <label class="payment-method">
                                <input type="radio" name="paymentMethod" value="credit">
                                <span><i class="fas fa-clock"></i> آجل</span>
                            </label>
                        </div>
                    </div>

                    <div class="checkout-actions">
                        <button class="btn primary btn-lg" onclick="completeSale()" id="checkoutBtn" disabled>
                            <i class="fas fa-check"></i>
                            إتمام البيع
                        </button>
                        <button class="btn secondary" onclick="saveDraft()">
                            <i class="fas fa-save"></i>
                            حفظ مسودة
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- نافذة تأكيد البيع -->
        <div id="saleConfirmModal" class="modal-overlay hidden">
            <div class="modal medium">
                <div class="modal-header">
                    <h3>تأكيد البيع</h3>
                    <button class="modal-close" onclick="closeSaleConfirm()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="sale-summary">
                        <h4>ملخص الفاتورة</h4>
                        <div id="saleConfirmDetails"></div>
                    </div>
                    <div class="payment-details">
                        <div class="form-group">
                            <label class="form-label">المبلغ المدفوع:</label>
                            <input type="number" id="paidAmount" class="form-input" step="0.001" onchange="calculateChange()">
                        </div>
                        <div class="form-group">
                            <label class="form-label">الباقي:</label>
                            <input type="text" id="changeAmount" class="form-input" readonly>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn primary" onclick="confirmSale()">
                            <i class="fas fa-check"></i>
                            تأكيد البيع
                        </button>
                        <button class="btn secondary" onclick="closeSaleConfirm()">
                            <i class="fas fa-times"></i>
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,

    // قالب المنتجات
    products: `
        <div class="section-header">
            <h2><i class="fas fa-box"></i> إدارة المنتجات</h2>
            <div class="section-actions">
                <button class="btn primary" onclick="addProduct()">
                    <i class="fas fa-plus"></i>
                    إضافة منتج
                </button>
                <button class="btn secondary" onclick="importProducts()">
                    <i class="fas fa-upload"></i>
                    استيراد
                </button>
                <button class="btn info" onclick="exportProducts()">
                    <i class="fas fa-download"></i>
                    تصدير
                </button>
            </div>
        </div>

        <!-- أدوات التحكم -->
        <div class="products-controls">
            <div class="search-filter-group">
                <div class="search-box">
                    <input type="text" id="productSearchInput" class="form-input" placeholder="البحث في المنتجات..." onkeyup="searchProducts(this.value)">
                    <i class="fas fa-search"></i>
                </div>
                <select id="categoryFilterSelect" class="form-select" onchange="filterProductsByCategory(this.value)">
                    <option value="">جميع الفئات</option>
                </select>
                <select id="statusFilterSelect" class="form-select" onchange="filterProductsByStatus(this.value)">
                    <option value="">جميع الحالات</option>
                    <option value="available">متوفر</option>
                    <option value="low-stock">مخزون منخفض</option>
                    <option value="out-of-stock">نفد المخزون</option>
                </select>
            </div>
            <div class="view-toggle">
                <button class="btn btn-sm" onclick="toggleView('grid')" id="gridViewBtn">
                    <i class="fas fa-th"></i>
                </button>
                <button class="btn btn-sm" onclick="toggleView('list')" id="listViewBtn">
                    <i class="fas fa-list"></i>
                </button>
            </div>
        </div>

        <!-- عرض المنتجات -->
        <div class="products-container">
            <!-- عرض الشبكة -->
            <div id="productsGrid" class="products-grid">
                <!-- المنتجات ستظهر هنا -->
            </div>

            <!-- عرض القائمة -->
            <div id="productsList" class="products-list hidden">
                <table class="table">
                    <thead>
                        <tr>
                            <th>الصورة</th>
                            <th>اسم المنتج</th>
                            <th>الفئة</th>
                            <th>السعر</th>
                            <th>المخزون</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="productsTableBody">
                        <!-- صفوف المنتجات ستظهر هنا -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- نافذة إضافة/تعديل منتج -->
        <div id="productModal" class="modal-overlay hidden">
            <div class="modal large">
                <div class="modal-header">
                    <h3 id="productModalTitle">إضافة منتج جديد</h3>
                    <button class="modal-close" onclick="closeProductModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="productForm" class="product-form">
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">اسم المنتج *</label>
                                <input type="text" id="productName" class="form-input" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label">الفئة</label>
                                <select id="productCategory" class="form-select">
                                    <option value="">اختر الفئة</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">السعر *</label>
                                <input type="number" id="productPrice" class="form-input" step="0.001" min="0" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label">الكمية *</label>
                                <input type="number" id="productQuantity" class="form-input" min="0" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label">الحد الأدنى للمخزون</label>
                                <input type="number" id="productMinStock" class="form-input" min="0" value="5">
                            </div>

                            <div class="form-group">
                                <label class="form-label">الباركود</label>
                                <input type="text" id="productBarcode" class="form-input">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">الوصف</label>
                            <textarea id="productDescription" class="form-input" rows="3"></textarea>
                        </div>

                        <div class="form-group">
                            <label class="form-label">صورة المنتج</label>
                            <div class="image-upload-container">
                                <div class="image-preview" onclick="selectProductImage()">
                                    <img id="productImagePreview" src="" alt="معاينة الصورة" style="display: none;">
                                    <div class="image-overlay">
                                        <i class="fas fa-camera"></i>
                                        <span>اختر صورة</span>
                                    </div>
                                </div>
                                <input type="file" id="productImageInput" accept="image/*" style="display: none;" onchange="handleProductImageUpload(this)">
                                <p class="image-info">الحد الأقصى: 2 ميجابايت، الأنواع المدعومة: JPG, PNG, GIF</p>
                            </div>
                        </div>

                        <div class="modal-actions">
                            <button type="submit" class="btn primary">
                                <i class="fas fa-save"></i>
                                حفظ المنتج
                            </button>
                            <button type="button" class="btn secondary" onclick="closeProductModal()">
                                <i class="fas fa-times"></i>
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- نافذة تفاصيل المنتج -->
        <div id="productDetailsModal" class="modal-overlay hidden">
            <div class="modal medium">
                <div class="modal-header">
                    <h3>تفاصيل المنتج</h3>
                    <button class="modal-close" onclick="closeProductDetailsModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="productDetailsContent">
                        <!-- تفاصيل المنتج ستظهر هنا -->
                    </div>
                </div>
            </div>
        </div>
    `,

    // قوالب أخرى للأقسام المتبقية
    customers: `
        <div class="section-header">
            <h2><i class="fas fa-users"></i> إدارة العملاء</h2>
            <div class="section-actions">
                <button class="btn primary" onclick="addCustomer()">
                    <i class="fas fa-plus"></i>
                    إضافة عميل
                </button>
            </div>
        </div>
        <div class="loading">جاري تحميل العملاء...</div>
    `,

    suppliers: `
        <div class="section-header">
            <h2><i class="fas fa-truck"></i> إدارة الموردين</h2>
            <div class="section-actions">
                <button class="btn primary" onclick="addSupplier()">
                    <i class="fas fa-plus"></i>
                    إضافة مورد
                </button>
            </div>
        </div>
        <div class="loading">جاري تحميل الموردين...</div>
    `,

    purchases: `
        <div class="section-header">
            <h2><i class="fas fa-shopping-bag"></i> إدارة المشتريات</h2>
            <div class="section-actions">
                <button class="btn primary" onclick="addPurchase()">
                    <i class="fas fa-plus"></i>
                    إضافة مشترى
                </button>
            </div>
        </div>
        <div class="loading">جاري تحميل المشتريات...</div>
    `,

    warehouses: `
        <div class="section-header">
            <h2><i class="fas fa-warehouse"></i> إدارة المخازن</h2>
            <div class="section-actions">
                <button class="btn primary" onclick="addWarehouse()">
                    <i class="fas fa-plus"></i>
                    إضافة مخزن
                </button>
            </div>
        </div>
        <div class="loading">جاري تحميل المخازن...</div>
    `,

    debts: `
        <div class="section-header">
            <h2><i class="fas fa-money-bill-wave"></i> الديون والمدفوعات</h2>
            <div class="section-actions">
                <button class="btn primary" onclick="addPayment()">
                    <i class="fas fa-plus"></i>
                    إضافة دفعة
                </button>
            </div>
        </div>
        <div class="loading">جاري تحميل الديون والمدفوعات...</div>
    `,

    reports: `
        <div class="section-header">
            <h2><i class="fas fa-chart-bar"></i> التقارير</h2>
            <div class="section-actions">
                <button class="btn primary" onclick="generateReport()">
                    <i class="fas fa-file-alt"></i>
                    إنشاء تقرير
                </button>
            </div>
        </div>
        <div class="loading">جاري تحميل التقارير...</div>
    `,

    settings: `
        <div class="section-header">
            <h2><i class="fas fa-cog"></i> الإعدادات</h2>
        </div>
        <div class="loading">جاري تحميل الإعدادات...</div>
    `
};

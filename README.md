# 🏪 ABUSLEMAN POS System | نظام أبوسليمان لنقاط البيع

<div align="center">

![POS System](https://img.shields.io/badge/POS-System-blue?style=for-the-badge)
![Arabic RTL](https://img.shields.io/badge/Arabic-RTL-green?style=for-the-badge)
![Responsive](https://img.shields.io/badge/Responsive-Design-orange?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge)

**نظام إدارة نقاط البيع الشامل مع دعم اللغة العربية والتصميم المتجاوب**

[العربية](#العربية) | [English](#english) | [Demo](#demo) | [Installation](#installation)

</div>

---

## 📋 Table of Contents | جدول المحتويات

- [Overview](#overview) | [نظرة عامة](#نظرة-عامة)
- [Features](#features) | [المميزات](#المميزات)
- [Technology Stack](#technology-stack) | [التقنيات المستخدمة](#التقنيات-المستخدمة)
- [Installation](#installation) | [التثبيت](#التثبيت)
- [Docker Deployment](#docker-deployment) | [النشر باستخدام Docker](#النشر-باستخدام-docker)
- [Usage](#usage) | [الاستخدام](#الاستخدام)
- [Contributing](#contributing) | [المساهمة](#المساهمة)
- [License](#license) | [الترخيص](#الترخيص)

---

## 🌟 Overview | نظرة عامة

ABUSLEMAN POS System is a comprehensive, modern point-of-sale solution designed specifically for Arabic-speaking businesses. Built with cutting-edge web technologies, it offers a complete business management suite including inventory, sales, customer management, and advanced reporting.

**نظام أبوسليمان لنقاط البيع** هو حل شامل وحديث لنقاط البيع مصمم خصيصاً للشركات الناطقة بالعربية. مبني بأحدث تقنيات الويب، يوفر مجموعة إدارة أعمال كاملة تشمل المخزون والمبيعات وإدارة العملاء والتقارير المتقدمة.

### 🎯 Key Highlights | النقاط الرئيسية

- **🌐 Arabic RTL Support** | دعم اللغة العربية من اليمين لليسار
- **💰 Multi-Currency** | دعم العملات المتعددة (دينار كويتي، ريال سعودي، دولار أمريكي)
- **📱 Responsive Design** | تصميم متجاوب لجميع الأجهزة
- **🎨 Neumorphism UI** | واجهة مستخدم عصرية بتصميم Neumorphism
- **💾 Local Storage** | تخزين محلي آمن للبيانات
- **📊 Advanced Analytics** | تحليلات وتقارير متقدمة

---

## ✨ Features | المميزات

### 🛒 Point of Sale | نقطة البيع
- **Real-time inventory tracking** | تتبع المخزون في الوقت الفعلي
- **Barcode scanning support** | دعم مسح الباركود
- **Multiple payment methods** | طرق دفع متعددة (نقداً، على الحساب)
- **Tax and discount management** | إدارة الضرائب والخصومات
- **Receipt printing** | طباعة الفواتير
- **Change calculation with visual feedback** | حساب الباقي مع تغذية راجعة بصرية

### 📦 Inventory Management | إدارة المخزون
- **Multi-warehouse support** | دعم المخازن المتعددة
- **Low stock alerts** | تنبيهات المخزون المنخفض
- **Product categorization** | تصنيف المنتجات
- **Batch operations** | العمليات المجمعة
- **Stock transfer between warehouses** | نقل المخزون بين المخازن
- **Product image management** | إدارة صور المنتجات

### 👥 Customer Management | إدارة العملاء
- **Customer profiles** | ملفات العملاء
- **Credit management** | إدارة الائتمان
- **Purchase history** | تاريخ المشتريات
- **Customer analytics** | تحليلات العملاء
- **Loyalty programs** | برامج الولاء

### 🏢 Supplier Management | إدارة الموردين
- **Supplier database** | قاعدة بيانات الموردين
- **Purchase orders** | أوامر الشراء
- **Payment tracking** | تتبع المدفوعات
- **Supplier performance analytics** | تحليلات أداء الموردين

### 📊 Reports & Analytics | التقارير والتحليلات
- **Sales reports** | تقارير المبيعات
- **Inventory reports** | تقارير المخزون
- **Financial reports** | التقارير المالية
- **Customer analytics** | تحليلات العملاء
- **Export to CSV/PDF** | تصدير إلى CSV/PDF

### 🔧 System Features | مميزات النظام
- **User management** | إدارة المستخدمين
- **Role-based access control** | التحكم في الوصول حسب الدور
- **Data backup and restore** | نسخ احتياطي واستعادة البيانات
- **Multi-language support** | دعم اللغات المتعددة
- **Customizable settings** | إعدادات قابلة للتخصيص

---

## 🛠 Technology Stack | التقنيات المستخدمة

### Frontend | الواجهة الأمامية
- **HTML5** - Semantic markup | ترميز دلالي
- **CSS3** - Modern styling with Neumorphism | تصميم حديث مع Neumorphism
- **JavaScript (ES6+)** - Modern JavaScript features | مميزات JavaScript الحديثة
- **Local Storage API** - Client-side data persistence | استمرارية البيانات من جانب العميل

### Backend | الخلفية
- **Pure JavaScript** - No framework dependencies | بدون اعتماديات إطار عمل
- **JSON** - Data format | تنسيق البيانات
- **Local Storage** - Data persistence | استمرارية البيانات

### Development Tools | أدوات التطوير
- **Git** - Version control | التحكم في الإصدارات
- **Docker** - Containerization | الحاويات
- **Nginx** - Web server | خادم الويب
- **VS Code** - Development environment | بيئة التطوير

---

## 🚀 Installation | التثبيت

### Prerequisites | المتطلبات المسبقة

- **Web Browser** | متصفح ويب (Chrome, Firefox, Safari, Edge)
- **HTTP Server** | خادم HTTP (للنشر المحلي)
- **Docker** (optional) | Docker (اختياري)

### Quick Start | البدء السريع

1. **Clone the repository** | استنساخ المستودع
```bash
git clone https://github.com/lolotam/ABUSLEMAN-ACC-AA.git
cd ABUSLEMAN-ACC-AA
```

2. **Serve the files** | تشغيل الملفات
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

3. **Open in browser** | فتح في المتصفح
```
http://localhost:8000
```

### Manual Installation | التثبيت اليدوي

1. Download the source code | تحميل الكود المصدري
2. Extract to your web server directory | استخراج إلى دليل خادم الويب
3. Configure your web server to serve the files | تكوين خادم الويب لتقديم الملفات
4. Access through your web browser | الوصول عبر متصفح الويب

---

## 🐳 Docker Deployment | النشر باستخدام Docker

### Using Docker Compose (Recommended) | استخدام Docker Compose (موصى به)

1. **Clone and navigate** | استنساخ والانتقال
```bash
git clone https://github.com/lolotam/ABUSLEMAN-ACC-AA.git
cd ABUSLEMAN-ACC-AA
```

2. **Build and run** | بناء وتشغيل
```bash
docker-compose up -d
```

3. **Access the application** | الوصول للتطبيق
```
http://localhost:8080
```

### Manual Docker Build | بناء Docker يدوي

```bash
# Build the image
docker build -t abusleman-pos .

# Run the container
docker run -d -p 8080:80 --name abusleman-pos abusleman-pos
```

### Environment Variables | متغيرات البيئة

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `80` | Server port |
| `NODE_ENV` | `production` | Environment mode |

---

## 📖 Usage | الاستخدام

### Default Login | تسجيل الدخول الافتراضي
- **Username** | اسم المستخدم: `admin`
- **Password** | كلمة المرور: `123`

### First Time Setup | الإعداد الأولي

1. **Login** | تسجيل الدخول
2. **Configure Settings** | تكوين الإعدادات
   - Currency | العملة
   - Tax rates | معدلات الضريبة
   - Company information | معلومات الشركة
3. **Add Products** | إضافة المنتجات
4. **Add Customers** | إضافة العملاء
5. **Start Selling** | بدء البيع

### Key Workflows | سير العمل الرئيسي

#### Making a Sale | إجراء عملية بيع
1. Navigate to POS | الانتقال لنقطة البيع
2. Select customer | اختيار العميل
3. Add products to cart | إضافة المنتجات للسلة
4. Apply discounts/taxes | تطبيق الخصومات/الضرائب
5. Process payment | معالجة الدفع
6. Print receipt | طباعة الفاتورة

#### Managing Inventory | إدارة المخزون
1. Go to Products section | الذهاب لقسم المنتجات
2. Add/Edit products | إضافة/تعديل المنتجات
3. Set stock levels | تحديد مستويات المخزون
4. Configure alerts | تكوين التنبيهات

---

## 🤝 Contributing | المساهمة

We welcome contributions! | نرحب بالمساهمات!

### How to Contribute | كيفية المساهمة

1. **Fork the repository** | فرع المستودع
2. **Create a feature branch** | إنشاء فرع للميزة
```bash
git checkout -b feature/amazing-feature
```
3. **Commit your changes** | تأكيد التغييرات
```bash
git commit -m 'Add amazing feature'
```
4. **Push to the branch** | دفع للفرع
```bash
git push origin feature/amazing-feature
```
5. **Open a Pull Request** | فتح طلب سحب

### Development Guidelines | إرشادات التطوير

- Follow existing code style | اتبع نمط الكود الموجود
- Add comments in Arabic and English | أضف تعليقات بالعربية والإنجليزية
- Test your changes | اختبر تغييراتك
- Update documentation | حدث التوثيق

---

## 📄 License | الترخيص

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

---

## 📞 Support | الدعم

- **Issues** | المشاكل: [GitHub Issues](https://github.com/lolotam/ABUSLEMAN-ACC-AA/issues)
- **Discussions** | النقاشات: [GitHub Discussions](https://github.com/lolotam/ABUSLEMAN-ACC-AA/discussions)
- **Email** | البريد الإلكتروني: support@abusleman.com

---

## 🙏 Acknowledgments | شكر وتقدير

- Built with ❤️ for the Arabic business community | مبني بـ ❤️ للمجتمع التجاري العربي
- Special thanks to all contributors | شكر خاص لجميع المساهمين
- Inspired by modern POS solutions | مستوحى من حلول نقاط البيع الحديثة

---

<div align="center">

**Made with ❤️ in Kuwait | صنع بـ ❤️ في الكويت**

⭐ Star this repo if you find it helpful! | ⭐ ضع نجمة للمستودع إذا وجدته مفيداً!

</div>

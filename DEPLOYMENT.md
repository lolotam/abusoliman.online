# دليل النشر | Deployment Guide

## نشر نظام أبوسليمان لإدارة المخزون
## ABUSLEMAN Inventory Management System Deployment

---

## 🚀 خيارات النشر | Deployment Options

### 1. النشر المحلي | Local Deployment

#### المتطلبات | Requirements
- خادم ويب محلي (Apache, Nginx, IIS)
- متصفح ويب حديث
- Node.js 16+ (للاختبارات)

#### خطوات النشر | Deployment Steps

##### أ. باستخدام Python
```bash
# تشغيل خادم Python
python -m http.server 3000

# أو للإصدار 2
python -m SimpleHTTPServer 3000
```

##### ب. باستخدام Node.js
```bash
# تثبيت serve
npm install -g serve

# تشغيل الخادم
serve -s . -l 3000
```

##### ج. باستخدام PHP
```bash
# تشغيل خادم PHP
php -S localhost:3000
```

### 2. النشر على GitHub Pages

#### خطوات النشر | Steps
1. ادفع الكود إلى GitHub
2. انتقل إلى Settings > Pages
3. اختر المصدر: Deploy from a branch
4. اختر الفرع: main
5. احفظ الإعدادات

#### الرابط | URL
```
https://[username].github.io/ABUSLEMAN-ACC-AA/
```

### 3. النشر على Netlify

#### الطريقة الأولى: Git Integration
1. اربط حساب GitHub مع Netlify
2. اختر المستودع ABUSLEMAN-ACC-AA
3. اتبع إعدادات النشر التلقائي

#### الطريقة الثانية: Manual Upload
1. اضغط ملفات المشروع في ZIP
2. ارفع الملف إلى Netlify
3. احصل على رابط النشر

### 4. النشر على Vercel

#### خطوات النشر | Steps
```bash
# تثبيت Vercel CLI
npm install -g vercel

# نشر المشروع
vercel

# اتبع التعليمات التفاعلية
```

### 5. النشر على Firebase Hosting

#### إعداد Firebase
```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# تهيئة المشروع
firebase init hosting

# نشر المشروع
firebase deploy
```

---

## ⚙️ إعدادات النشر | Deployment Configuration

### 1. إعدادات الخادم | Server Configuration

#### Apache (.htaccess)
```apache
# تمكين ضغط الملفات
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# تمكين التخزين المؤقت
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

#### Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/ABUSLEMAN-ACC-AA;
    index index.html;

    # ضغط الملفات
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # التخزين المؤقت
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # إعادة توجيه جميع الطلبات إلى index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 2. إعدادات الأمان | Security Configuration

#### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self';
    connect-src 'self';
">
```

#### HTTPS Redirect
```javascript
// إعادة توجيه إلى HTTPS
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    location.replace('https:' + window.location.href.substring(window.location.protocol.length));
}
```

---

## 🔧 تحسين الأداء | Performance Optimization

### 1. ضغط الملفات | File Compression

#### JavaScript Minification
```bash
# تثبيت أدوات الضغط
npm install -g uglify-js

# ضغط ملفات JavaScript
uglifyjs js/*.js -o js/app.min.js
```

#### CSS Minification
```bash
# تثبيت أدوات ضغط CSS
npm install -g clean-css-cli

# ضغط ملفات CSS
cleancss -o style.min.css style.css
```

### 2. تحسين الصور | Image Optimization

#### ضغط الصور
```bash
# تثبيت أدوات ضغط الصور
npm install -g imagemin-cli

# ضغط الصور
imagemin assets/images/* --out-dir=assets/images/optimized
```

### 3. تحسين التحميل | Loading Optimization

#### Lazy Loading
```javascript
// تحميل كسول للصور
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
});
```

---

## 📊 مراقبة الأداء | Performance Monitoring

### 1. Google Analytics
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. Performance Monitoring
```javascript
// مراقبة أداء التطبيق
window.addEventListener('load', function() {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart);
    
    // إرسال بيانات الأداء إلى خدمة المراقبة
    if (perfData.loadEventEnd - perfData.loadEventStart > 3000) {
        console.warn('Slow page load detected');
    }
});
```

---

## 🔒 الأمان | Security

### 1. النسخ الاحتياطية | Backups

#### النسخ الاحتياطية التلقائية
```bash
#!/bin/bash
# نص النسخ الاحتياطي التلقائي

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backups"
SOURCE_DIR="/path/to/ABUSLEMAN-ACC-AA"

# إنشاء نسخة احتياطية
tar -czf "$BACKUP_DIR/abusleman_backup_$DATE.tar.gz" -C "$SOURCE_DIR" .

# حذف النسخ القديمة (أكثر من 30 يوم)
find "$BACKUP_DIR" -name "abusleman_backup_*.tar.gz" -mtime +30 -delete
```

### 2. تحديثات الأمان | Security Updates

#### فحص الثغرات الأمنية
```bash
# فحص ثغرات npm
npm audit

# إصلاح الثغرات
npm audit fix
```

---

## 🧪 اختبار النشر | Deployment Testing

### 1. اختبارات ما قبل النشر | Pre-deployment Tests
```bash
# تشغيل جميع الاختبارات
npm test

# اختبار الأداء
npm run test:performance

# اختبار التوافق
npm run test:compatibility
```

### 2. اختبارات ما بعد النشر | Post-deployment Tests
```bash
# اختبار الروابط
npm run test:links

# اختبار الوظائف الأساسية
npm run test:smoke
```

---

## 📞 الدعم | Support

### مشاكل النشر الشائعة | Common Deployment Issues

#### 1. مشاكل CORS
```javascript
// حل مشاكل CORS
if (location.hostname === 'localhost') {
    // إعدادات التطوير
} else {
    // إعدادات الإنتاج
}
```

#### 2. مشاكل المسارات
```javascript
// إصلاح مسارات الملفات
const basePath = location.hostname === 'localhost' ? '' : '/ABUSLEMAN-ACC-AA';
```

### الحصول على المساعدة | Getting Help
- إنشاء Issue على GitHub
- مراجعة الوثائق
- فحص سجلات الخادم

---

**نشر ناجح! | Successful Deployment!** 🎉

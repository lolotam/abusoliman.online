# 🐳 Docker Deployment Guide | دليل النشر باستخدام Docker

## نظام أبوسليمان لنقاط البيع - دليل النشر الشامل

This guide provides comprehensive instructions for deploying the ABUSLEMAN POS System using Docker containers.

يوفر هذا الدليل تعليمات شاملة لنشر نظام أبوسليمان لنقاط البيع باستخدام حاويات Docker.

---

## 📋 Prerequisites | المتطلبات المسبقة

### System Requirements | متطلبات النظام

- **Docker Engine** 20.10+ | محرك Docker 20.10+
- **Docker Compose** 2.0+ | Docker Compose 2.0+
- **Minimum RAM** | الحد الأدنى للذاكرة: 512MB
- **Minimum Storage** | الحد الأدنى للتخزين: 1GB
- **CPU** | المعالج: 1 Core minimum

### Operating System Support | دعم أنظمة التشغيل

- ✅ **Linux** (Ubuntu, CentOS, Debian, RHEL)
- ✅ **Windows** (Windows 10/11 with WSL2)
- ✅ **macOS** (Intel & Apple Silicon)

---

## 🚀 Quick Deployment | النشر السريع

### Method 1: Docker Compose (Recommended) | الطريقة الأولى: Docker Compose (موصى بها)

```bash
# 1. Clone the repository | استنساخ المستودع
git clone https://github.com/lolotam/ABUSLEMAN-ACC-AA.git
cd ABUSLEMAN-ACC-AA

# 2. Start the application | تشغيل التطبيق
docker-compose up -d

# 3. Access the application | الوصول للتطبيق
# Open browser: http://localhost:8080
```

### Method 2: Manual Docker Build | الطريقة الثانية: بناء Docker يدوي

```bash
# 1. Build the image | بناء الصورة
docker build -t abusleman-pos:latest .

# 2. Run the container | تشغيل الحاوية
docker run -d \
  --name abusleman-pos \
  -p 8080:80 \
  --restart unless-stopped \
  abusleman-pos:latest

# 3. Access the application | الوصول للتطبيق
# Open browser: http://localhost:8080
```

---

## ⚙️ Configuration Options | خيارات التكوين

### Environment Variables | متغيرات البيئة

| Variable | Default | Description | الوصف |
|----------|---------|-------------|--------|
| `NODE_ENV` | `production` | Environment mode | وضع البيئة |
| `TZ` | `Asia/Kuwait` | Timezone | المنطقة الزمنية |
| `NGINX_PORT` | `80` | Internal nginx port | منفذ nginx الداخلي |

### Port Configuration | تكوين المنافذ

```yaml
# Default configuration | التكوين الافتراضي
ports:
  - "8080:80"  # Host:Container

# Custom port | منفذ مخصص
ports:
  - "3000:80"  # Access via http://localhost:3000
```

### Volume Mounting | ربط الأحجام

```yaml
volumes:
  # Data persistence | استمرارية البيانات
  - ./data:/usr/share/nginx/html/data
  
  # Logs | السجلات
  - ./logs:/var/log/nginx
  
  # Custom configuration | تكوين مخصص
  - ./custom-nginx.conf:/etc/nginx/nginx.conf
```

---

## 🔧 Advanced Deployment | النشر المتقدم

### Production Deployment | النشر الإنتاجي

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  abusleman-pos:
    build: .
    restart: always
    ports:
      - "80:80"
      - "443:443"
    environment:
      - NODE_ENV=production
      - TZ=Asia/Kuwait
    volumes:
      - ./data:/usr/share/nginx/html/data
      - ./ssl:/etc/nginx/ssl
    networks:
      - production
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.5'
        reservations:
          memory: 128M
          cpus: '0.25'

networks:
  production:
    external: true
```

### SSL/HTTPS Configuration | تكوين SSL/HTTPS

```bash
# 1. Generate SSL certificates | إنشاء شهادات SSL
mkdir ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/private.key -out ssl/certificate.crt

# 2. Update nginx configuration | تحديث تكوين nginx
# Add SSL configuration to nginx.conf

# 3. Deploy with SSL | النشر مع SSL
docker-compose -f docker-compose.prod.yml up -d
```

### Load Balancing | توزيع الأحمال

```yaml
# docker-compose.lb.yml
version: '3.8'

services:
  nginx-lb:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    depends_on:
      - app1
      - app2

  app1:
    build: .
    expose:
      - "80"

  app2:
    build: .
    expose:
      - "80"
```

---

## 📊 Monitoring & Logging | المراقبة والسجلات

### Health Checks | فحوصات الصحة

```bash
# Check container health | فحص صحة الحاوية
docker ps
docker logs abusleman-pos

# Manual health check | فحص صحة يدوي
curl -f http://localhost:8080/health
```

### Log Management | إدارة السجلات

```bash
# View logs | عرض السجلات
docker logs -f abusleman-pos

# Log rotation | دوران السجلات
docker run --log-driver=json-file --log-opt max-size=10m --log-opt max-file=3

# Export logs | تصدير السجلات
docker logs abusleman-pos > app.log 2>&1
```

### Performance Monitoring | مراقبة الأداء

```bash
# Container stats | إحصائيات الحاوية
docker stats abusleman-pos

# Resource usage | استخدام الموارد
docker exec abusleman-pos top
docker exec abusleman-pos df -h
```

---

## 🔄 Backup & Recovery | النسخ الاحتياطي والاستعادة

### Data Backup | النسخ الاحتياطي للبيانات

```bash
# Manual backup | نسخ احتياطي يدوي
docker exec abusleman-pos tar -czf /tmp/backup.tar.gz /usr/share/nginx/html/data
docker cp abusleman-pos:/tmp/backup.tar.gz ./backup-$(date +%Y%m%d).tar.gz

# Automated backup | نسخ احتياطي تلقائي
docker-compose --profile backup run backup
```

### Data Recovery | استعادة البيانات

```bash
# Restore from backup | الاستعادة من النسخة الاحتياطية
docker cp ./backup-20231201.tar.gz abusleman-pos:/tmp/
docker exec abusleman-pos tar -xzf /tmp/backup-20231201.tar.gz -C /
docker restart abusleman-pos
```

---

## 🔧 Troubleshooting | استكشاف الأخطاء وإصلاحها

### Common Issues | المشاكل الشائعة

#### Port Already in Use | المنفذ مستخدم بالفعل
```bash
# Check what's using the port | فحص ما يستخدم المنفذ
sudo netstat -tulpn | grep :8080

# Kill the process | إنهاء العملية
sudo kill -9 <PID>

# Or use different port | أو استخدم منفذ مختلف
docker-compose up -d --scale abusleman-pos=1 -p 3000:80
```

#### Container Won't Start | الحاوية لا تبدأ
```bash
# Check logs | فحص السجلات
docker logs abusleman-pos

# Check configuration | فحص التكوين
docker-compose config

# Rebuild image | إعادة بناء الصورة
docker-compose build --no-cache
```

#### Permission Issues | مشاكل الصلاحيات
```bash
# Fix permissions | إصلاح الصلاحيات
sudo chown -R $USER:$USER ./data
sudo chmod -R 755 ./data
```

### Debug Mode | وضع التشخيص

```bash
# Run in debug mode | تشغيل في وضع التشخيص
docker run -it --rm abusleman-pos:latest /bin/sh

# Interactive debugging | تشخيص تفاعلي
docker exec -it abusleman-pos /bin/sh
```

---

## 🔄 Updates & Maintenance | التحديثات والصيانة

### Updating the Application | تحديث التطبيق

```bash
# 1. Pull latest changes | سحب أحدث التغييرات
git pull origin main

# 2. Rebuild and restart | إعادة البناء والتشغيل
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 3. Verify update | التحقق من التحديث
docker logs abusleman-pos
```

### Scaling | التوسع

```bash
# Scale up | التوسع للأعلى
docker-compose up -d --scale abusleman-pos=3

# Scale down | التوسع للأسفل
docker-compose up -d --scale abusleman-pos=1
```

---

## 📞 Support | الدعم

### Getting Help | الحصول على المساعدة

- **GitHub Issues**: [Report Issues](https://github.com/lolotam/ABUSLEMAN-ACC-AA/issues)
- **Documentation**: [Full Documentation](README.md)
- **Community**: [Discussions](https://github.com/lolotam/ABUSLEMAN-ACC-AA/discussions)

### Useful Commands | أوامر مفيدة

```bash
# Container management | إدارة الحاويات
docker ps -a                    # List all containers
docker stop abusleman-pos       # Stop container
docker start abusleman-pos      # Start container
docker restart abusleman-pos    # Restart container
docker rm abusleman-pos         # Remove container

# Image management | إدارة الصور
docker images                   # List images
docker rmi abusleman-pos        # Remove image
docker system prune -a          # Clean up unused resources
```

---

<div align="center">

**🐳 Happy Dockerizing! | استمتع بـ Docker! 🐳**

Made with ❤️ for the Arabic business community | صنع بـ ❤️ للمجتمع التجاري العربي

</div>

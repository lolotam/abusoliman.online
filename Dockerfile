# Dockerfile for ABUSLEMAN Arabic Inventory Management System
# Use lightweight Nginx Alpine image
FROM nginx:alpine

# Add labels for metadata
LABEL maintainer="lolotam"
LABEL description="ABUSLEMAN Arabic Inventory Management System"
LABEL version="1.0.0"

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy custom nginx config for Arabic/RTL support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy application files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY database.js /usr/share/nginx/html/
COPY main.js /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Copy all JavaScript modules
COPY js/ /usr/share/nginx/html/js/

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# Make nginx run in foreground
CMD ["nginx", "-g", "daemon off;"]

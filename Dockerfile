# ABUSLEMAN POS System - Docker Configuration
# نظام أبوسليمان لنقاط البيع - تكوين Docker

# Use official nginx image as base
FROM nginx:alpine

# Set maintainer information
LABEL maintainer="lolotam <49675321+lolotam@users.noreply.github.com>"
LABEL description="ABUSLEMAN POS System - Arabic RTL Point of Sale System"
LABEL version="1.0.0"

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy application files
COPY . /usr/share/nginx/html/

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Create necessary directories
RUN mkdir -p /var/log/nginx /var/cache/nginx

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

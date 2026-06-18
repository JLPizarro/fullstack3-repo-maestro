#!/usr/bin/env python3
import os
import re
import glob

def parse_vite_config(front_dir):
    vite_path = os.path.join(front_dir, 'vite.config.js')
    port = 3000
    base = '/'
    if os.path.exists(vite_path):
        with open(vite_path, 'r', encoding='utf-8') as f:
            content = f.read()
        # Find port
        port_match = re.search(r'port\s*:\s*(\d+)', content)
        if port_match:
            port = int(port_match.group(1))
        # Find base
        base_match = re.search(r'base\s*:\s*[\'"]([^\'"]+)[\'"]', content)
        if base_match:
            base = base_match.group(1)
    return port, base

def parse_backend_config(back_dir):
    dockerfile_path = os.path.join(back_dir, 'Dockerfile')
    main_path = os.path.join(back_dir, 'main.py')
    
    port = 8000
    
    # 1. Parse Dockerfile for exposed port or CMD bind
    if os.path.exists(dockerfile_path):
        with open(dockerfile_path, 'r', encoding='utf-8') as f:
            content = f.read()
        # Look for EXPOSE port
        expose_match = re.search(r'EXPOSE\s+(\d+)', content, re.IGNORECASE)
        if expose_match:
            port = int(expose_match.group(1))
        # Look for --port NNNN  OR  --bind 0.0.0.0:NNNN  OR  uvicorn ... --port NNNN
        cmd_match = re.search(r'(?:--port|0\.0\.0\.0:)(\d+)', content)
        if cmd_match:
            port = int(cmd_match.group(1))
                
    # 2. Parse main.py for app.run port
    if os.path.exists(main_path):
        with open(main_path, 'r', encoding='utf-8') as f:
            content = f.read()
        run_match = re.search(r'app\.run\([^)]*port\s*=\s*(\d+)', content)
        if run_match:
            port = int(run_match.group(1))
            
    # 3. Parse API prefixes from main.py
    prefixes = []
    if os.path.exists(main_path):
        with open(main_path, 'r', encoding='utf-8') as f:
            content = f.read()
        # Find all url_prefix='/api/v1/something'
        matches = re.findall(r'url_prefix\s*=\s*[\'"]([^\'"]+)[\'"]', content)
        for m in matches:
            if m.startswith('/api/v1'):
                prefixes.append(m)
                
    return port, sorted(list(set(prefixes)))

def main():
    root_dir = os.path.abspath(os.path.dirname(__file__))
    
    # Detect folders
    front_dirs = sorted([d for d in os.listdir(root_dir) if d.startswith('front_modulo_') and os.path.isdir(os.path.join(root_dir, d))])
    back_dirs = sorted([d for d in os.listdir(root_dir) if d.startswith('modulo_') and os.path.isdir(os.path.join(root_dir, d))])
    
    frontends = {}
    for fd in front_dirs:
        name = fd.replace('front_modulo_', '')
        port, base = parse_vite_config(os.path.join(root_dir, fd))
        frontends[name] = {
            'dir': fd,
            'port': port,
            'base': base
        }
        
    backends = {}
    for bd in back_dirs:
        name = bd.replace('modulo_', '')
        port, prefixes = parse_backend_config(os.path.join(root_dir, bd))
        backends[name] = {
            'dir': bd,
            'port': port,
            'prefixes': prefixes
        }

    # Generate docker-compose.yml
    compose_content = []
    compose_content.append("services:")
    compose_content.append("  # --- INFRASTRUCTURE ---")
    compose_content.append("  db-global:")
    compose_content.append("    image: postgres:15")
    compose_content.append("    environment:")
    compose_content.append("      POSTGRES_USER: admin")
    compose_content.append("      POSTGRES_PASSWORD: admin123")
    compose_content.append("      POSTGRES_DB: asdf_db")
    compose_content.append("    volumes:")
    compose_content.append("      - pgdata:/var/lib/postgresql/data")
    compose_content.append("    networks:")
    compose_content.append("      - asdf-network")
    compose_content.append("")
    compose_content.append("  gateway:")
    compose_content.append("    image: nginx:latest")
    compose_content.append("    volumes:")
    compose_content.append("      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro")
    compose_content.append("    ports:")
    compose_content.append("      - \"8080:80\"")
    compose_content.append("    depends_on:")
    depends = ["front-login", "front-administracion", "ms-middleware"]
    compose_content.append("      " + "\n      ".join([f"- {d}" for d in depends]))
    compose_content.append("    networks:")
    compose_content.append("      - asdf-network")
    compose_content.append("")
    
    compose_content.append("  # --- MIDDLEWARE & AUTH ---")
    compose_content.append("  ms-middleware:")
    compose_content.append("    build:")
    compose_content.append("      context: ./modulo_middleware")
    compose_content.append("      dockerfile: Dockerfile")
    compose_content.append("    environment:")
    compose_content.append("      - JWT_SECRET=super-secret-key-123")
    compose_content.append("    networks:")
    compose_content.append("      - asdf-network")
    compose_content.append("")

    compose_content.append("  # --- MICROSERVICES ---")
    for name, info in backends.items():
        if name == 'middleware':
            continue
        compose_content.append(f"  ms-{name}:")
        compose_content.append("    build:")
        compose_content.append(f"      context: ./{info['dir']}")
        compose_content.append("      dockerfile: Dockerfile")
        if name == 'watchdog':
            compose_content.append("    volumes:")
            compose_content.append("      - /var/run/docker.sock:/var/run/docker.sock")
        else:
            compose_content.append("    environment:")
            compose_content.append("      - DATABASE_URL=postgresql+asyncpg://admin:admin123@db-global:5432/asdf_db")
            if name == 'administracion':
                compose_content.append("      - JWT_SECRET=super-secret-key-123")
        compose_content.append("    networks:")
        compose_content.append("      - asdf-network")
        compose_content.append("")

    compose_content.append("  # --- FRONTENDS ---")
    for name, info in frontends.items():
        compose_content.append(f"  front-{name}:")
        compose_content.append("    build:")
        compose_content.append("      context: .")
        compose_content.append(f"      dockerfile: ./{info['dir']}/Dockerfile")
        compose_content.append("    environment:")
        compose_content.append("      - VITE_API_URL=/api/v1")
        compose_content.append("    networks:")
        compose_content.append("      - asdf-network")
        compose_content.append("")

    compose_content.append("networks:")
    compose_content.append("  asdf-network:")
    compose_content.append("    driver: bridge")
    compose_content.append("")
    compose_content.append("volumes:")
    compose_content.append("  pgdata:")
    compose_content.append("")

    # Write docker-compose.yml
    compose_file_path = os.path.join(root_dir, 'docker-compose.yml')
    with open(compose_file_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(compose_content))
    print(f"Generated {compose_file_path}")

    # Generate nginx/nginx.conf
    nginx_content = []
    nginx_content.append("worker_processes auto;")
    nginx_content.append("")
    nginx_content.append("events {")
    nginx_content.append("    worker_connections 2048;")
    nginx_content.append("    use epoll;")
    nginx_content.append("    multi_accept on;")
    nginx_content.append("}")
    nginx_content.append("")
    nginx_content.append("http {")
    nginx_content.append("    include       mime.types;")
    nginx_content.append("    default_type  application/octet-stream;")
    nginx_content.append("    sendfile        on;")
    nginx_content.append("    tcp_nopush      on;")
    nginx_content.append("    tcp_nodelay     on;")
    nginx_content.append("    keepalive_timeout  65;")
    nginx_content.append("    keepalive_requests 1000;")
    nginx_content.append("")
    nginx_content.append("    # WebSockets support")
    nginx_content.append("    map $http_upgrade $connection_upgrade {")
    nginx_content.append("        default upgrade;")
    nginx_content.append("        ''      close;")
    nginx_content.append("    }")
    nginx_content.append("")
    nginx_content.append("    # Optimization buffers")
    nginx_content.append("    client_body_buffer_size 10K;")
    nginx_content.append("    client_header_buffer_size 1k;")
    nginx_content.append("    client_max_body_size 8m;")
    nginx_content.append("    large_client_header_buffers 4 4k;")
    nginx_content.append("")
    nginx_content.append("    # Compression")
    nginx_content.append("    gzip on;")
    nginx_content.append("    gzip_min_length 10240;")
    nginx_content.append("    gzip_comp_level 1;")
    nginx_content.append("    gzip_vary on;")
    nginx_content.append("    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;")
    nginx_content.append("")
    nginx_content.append("    server {")
    nginx_content.append("        listen       80;")
    nginx_content.append("        server_name  localhost;")
    nginx_content.append("")
    nginx_content.append("        # --- AUTH CHECK INTERNAL ---")
    nginx_content.append("        location = /_auth_check {")
    nginx_content.append("            internal;")
    nginx_content.append("            proxy_pass http://ms-middleware:8009/validate;")
    nginx_content.append("            proxy_pass_request_body off;")
    nginx_content.append("            proxy_set_header Content-Length \"\";")
    nginx_content.append("            proxy_set_header X-Original-URI $request_uri;")
    nginx_content.append("            proxy_set_header Authorization $http_authorization;")
    nginx_content.append("        }")
    nginx_content.append("")
    
    # Generate Frontend locations
    nginx_content.append("        # --- FRONTENDS ---")
    sorted_fronts = sorted(frontends.items(), key=lambda x: (x[1]['base'] == '/'), reverse=False)
    
    for name, info in sorted_fronts:
        base = info['base']
        port = info['port']
        nginx_content.append(f"        # {name.upper()}")
        nginx_content.append(f"        location {base} {{")
        nginx_content.append(f"            proxy_pass http://front-{name}:{port};")
        nginx_content.append("            proxy_http_version 1.1;")
        nginx_content.append("            proxy_set_header Upgrade $http_upgrade;")
        nginx_content.append("            proxy_set_header Connection $connection_upgrade;")
        nginx_content.append("            proxy_set_header Host $http_host;")
        nginx_content.append("        }")
        nginx_content.append("")

    # Generate API routes
    nginx_content.append("        # --- API V1 ---")
    nginx_content.append("        # Public login")
    nginx_content.append("        location /api/v1/administracion/login {")
    nginx_content.append("            auth_request off;")
    nginx_content.append("            proxy_pass http://ms-administracion:8007;")
    nginx_content.append("            proxy_set_header Host $http_host;")
    nginx_content.append("        }")
    nginx_content.append("")
    
    nginx_content.append("        # Health checks (Public) - prefix match (regex not allowed with URI in proxy_pass)")
    nginx_content.append("        location /health {")
    nginx_content.append("            auth_request off;")
    nginx_content.append("            proxy_pass http://ms-middleware:8009/health;")
    nginx_content.append("            proxy_set_header Host $http_host;")
    nginx_content.append("        }")
    nginx_content.append("        location /api/v1/health {")
    nginx_content.append("            auth_request off;")
    nginx_content.append("            proxy_pass http://ms-middleware:8009/health;")
    nginx_content.append("            proxy_set_header Host $http_host;")
    nginx_content.append("        }")
    nginx_content.append("")

    # Authenticated Routes Wrapper
    nginx_content.append("        location /api/v1/ {")
    nginx_content.append("            if ($request_method = 'OPTIONS') {")
    nginx_content.append("                add_header 'Access-Control-Allow-Origin' 'http://localhost:8080' always;")
    nginx_content.append("                add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;")
    nginx_content.append("                add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;")
    nginx_content.append("                add_header 'Access-Control-Max-Age' 1728000;")
    nginx_content.append("                add_header 'Content-Type' 'text/plain; charset=utf-8';")
    nginx_content.append("                add_header 'Content-Length' 0;")
    nginx_content.append("                return 204;")
    nginx_content.append("            }")
    nginx_content.append("            ")
    nginx_content.append("            auth_request /_auth_check;")
    nginx_content.append("            auth_request_set $user_id $upstream_http_x_user_id;")
    nginx_content.append("            auth_request_set $user_role $upstream_http_x_user_role;")
    nginx_content.append("            auth_request_set $user_email $upstream_http_x_user_email;")
    nginx_content.append("            proxy_set_header X-User-ID $user_id;")
    nginx_content.append("            proxy_set_header X-User-Role $user_role;")
    nginx_content.append("            proxy_set_header X-User-Email $user_email;")
    nginx_content.append("            proxy_set_header Host $http_host;")
    nginx_content.append("")
    
    # Generate API proxy locations for each backend
    for name, info in backends.items():
        if name in ('middleware', 'watchdog'):
            continue
        
        if info['prefixes']:
            nginx_content.append(f"            # ms-{name} routes")
            for prefix in info['prefixes']:
                location_path = prefix if prefix.endswith('/') else f"{prefix}/"
                nginx_content.append(f"            location {location_path} {{")
                nginx_content.append(f"                proxy_pass http://ms-{name}:{info['port']}$request_uri;")
                nginx_content.append("            }")
            nginx_content.append("")
            
    # Watchdog special route
    if 'watchdog' in backends:
        nginx_content.append("            # ms-watchdog")
        nginx_content.append("            location /api/v1/watchdog/ {")
        nginx_content.append("                proxy_pass http://ms-watchdog:8008/;")
        nginx_content.append("            }")
        nginx_content.append("")

    # Fallback to ms-middleware
    nginx_content.append("            # Fallback for ms-middleware")
    nginx_content.append("            proxy_pass http://ms-middleware:8009/api/v1/;")
    nginx_content.append("        }")
    nginx_content.append("    }")
    nginx_content.append("}")
    nginx_content.append("")

    # Write nginx/nginx.conf
    nginx_file_path = os.path.join(root_dir, 'nginx', 'nginx.conf')
    os.makedirs(os.path.dirname(nginx_file_path), exist_ok=True)
    with open(nginx_file_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(nginx_content))
    print(f"Generated {nginx_file_path}")

    # Generate independent Nginx configurations for each app module (for LXC deployment)
    apps_nginx_dir = os.path.join(root_dir, 'nginx', 'apps')
    os.makedirs(apps_nginx_dir, exist_ok=True)
    
    for name in sorted(list(set(list(frontends.keys()) + list(backends.keys())))):
        if name == 'middleware':
            continue
            
        app_nginx = []
        app_nginx.append("server {")
        app_nginx.append("    listen 80;")
        app_nginx.append("    server_name localhost;")
        app_nginx.append("")
        
        # 1. Serve frontend statically inside the LXC container
        if name in frontends:
            finfo = frontends[name]
            base_path = finfo['base']
            # Make sure base_path starts/ends correctly
            base_path_clean = base_path.strip('/')
            if base_path_clean:
                app_nginx.append(f"    # Serve frontend {name} statically")
                app_nginx.append(f"    location /{base_path_clean}/ {{")
                app_nginx.append(f"        alias /var/www/html/{base_path_clean}/;")
                app_nginx.append("        index index.html;")
                app_nginx.append(f"        try_files $uri $uri/ /{base_path_clean}/index.html;")
                app_nginx.append("    }")
            else:
                app_nginx.append("    # Serve frontend statically (Root)")
                app_nginx.append("    location / {")
                app_nginx.append("        root /var/www/html/;")
                app_nginx.append("        index index.html;")
                app_nginx.append("        try_files $uri $uri/ /index.html;")
                app_nginx.append("    }")
            app_nginx.append("")

        # 2. Proxy local API routes to the Python backend running in the same LXC container on 127.0.0.1
        if name in backends:
            binfo = backends[name]
            app_nginx.append(f"    # Proxy API routes to local backend on 127.0.0.1:{binfo['port']}")
            if binfo['prefixes']:
                for prefix in binfo['prefixes']:
                    loc = prefix if prefix.endswith('/') else f"{prefix}/"
                    app_nginx.append(f"    location {loc} {{")
                    app_nginx.append(f"        proxy_pass http://127.0.0.1:{binfo['port']}$request_uri;")
                    app_nginx.append("        proxy_set_header Host $http_host;")
                    app_nginx.append("        proxy_set_header X-Real-IP $remote_addr;")
                    app_nginx.append("        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;")
                    app_nginx.append("        proxy_set_header X-Forwarded-Proto $scheme;")
                    app_nginx.append("    }")
            elif name == 'watchdog':
                app_nginx.append("    location /api/v1/watchdog/ {")
                app_nginx.append("        proxy_pass http://127.0.0.1:8008/;")
                app_nginx.append("        proxy_set_header Host $http_host;")
                app_nginx.append("    }")
            app_nginx.append("")
            
        app_nginx.append("}")
        app_nginx.append("")
        
        app_config_path = os.path.join(apps_nginx_dir, f"{name}.conf")
        with open(app_config_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(app_nginx))
        print(f"Generated LXC Nginx config: {app_config_path}")

if __name__ == '__main__':
    main()

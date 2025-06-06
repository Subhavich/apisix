# 🔧 APISIX Custom Dashboard with WordPress & GoFiber Integration

A full-stack, containerized system demonstrating the power of **Apache APISIX** as an API Gateway. This setup includes:

- **GoFiber backend** with **MariaDB** for simple CRUD APIs
- **Headless WordPress** (via Bitnami) serving as a mock content API
- A **React-based dashboard** for managing APISIX routes, upstreams, and plugin configurations

All services are managed via **Docker Compose** for ease of deployment.

---

## 📀 Features

- Manage APISIX routes and upstreams through a modern React UI
- Test proxy rewriting (e.g. `/api/posts` → `/wp-json/wp/v2/posts`)
- Add or remove routes with plugins such as `key-auth`
- Preview mock API responses from GoFiber and WordPress
- Built-in consumer key generator for testing `key-auth` plugins

---

## 📊 System Overview

### 🔹 GoFiber API (`:8000`)

Custom backend service with basic data endpoints.

- `GET /api/data` – Get all records
- `POST /api/data` – Add new record
- Relies on `init.sql` for pre-populating the database with records (`Alice`, `Bob`, `Charlie`, `Okafor`)

### 🔹 WordPress REST API (`:8081 -> :8080`)

Headless CMS powered by Bitnami WordPress + MySQL setup.

- `GET /wp-json` – Base API info
- `GET /wp-json/wp/v2/posts` – List posts

Plugins are bootstrapped through Docker Compose environment variables.

### 🔹 Apache APISIX Gateway (`:9080`, Admin: `:9180`)

APISIX acts as the gateway and handles all routing, proxy logic, and plugin configurations.

#### Sample Config (`apisix_conf/config.yaml`):

```yaml
apisix:
  node_listen: 9080
  enable_ipv6: false
  allow_admin:
    - 0.0.0.0/0
  admin_key:
    - name: "admin"
      key: admin
      role: admin
    - name: "viewer"
      key: viewer
      role: viewer
  enable_control: true
  control:
    ip: "0.0.0.0"
    port: 9092

etcd:
  host:
    - "http://etcd:2379"
  prefix: "/apisix"
  timeout: 30
```

### 🔹 React Dashboard (`:5174`)

A Vite-powered React app for:

- Viewing and managing APISIX routes and upstreams
- Setting up plugins such as `key-auth` and `proxy-rewrite`
- Testing route rewrites from `/api/posts` to `/wp-json/wp/v2/posts`

#### 🦢 Consumer API Key Generator

The homepage of the dashboard also includes a **"Consumer Key Generator"** route.
You can use this tool to quickly generate API keys for accessing routes that are protected by the `key-auth` plugin.

#### Environment Example:

```env
VITE_API_URL=http://localhost:9080
VITE_API_KEY=admin
```

> 📌 Make sure that the API_KEY matches the admin role in APISIX, it will be set to admin by default

---

## 🚀 Getting Started

1. Clone the repo
2. Ensure Docker & Docker Compose are installed
3. Run the full stack:

   ```bash
   docker compose up --build
   ```

### Access URLs:

| Service         | URL                                                                      |
| --------------- | ------------------------------------------------------------------------ |
| React Dashboard | [http://localhost:5174](http://localhost:5174)                           |
| GoFiber API     | [http://localhost:8000/api/data](http://localhost:8000/api/data)         |
| WordPress API   | [http://localhost:8081/wp-json](http://localhost:8081/wp-json)           |
| APISIX Admin    | [http://localhost:9180/apisix/admin](http://localhost:9180/apisix/admin) |

---

## 📂 Example Requests & Responses

### ✅ GET /api/data

**Request:**

```http
GET http://localhost:8000/api/data
```

**Response:**

```json
[
  {
    "id": 1,
    "value": 100,
    "name": "Alice",
    "created_at": "2025-06-01T10:00:00Z"
  },
  {
    "id": 2,
    "value": 200,
    "name": "Bob",
    "created_at": "2025-06-02T11:30:00Z"
  },
  {
    "id": 3,
    "value": 300,
    "name": "Charlie",
    "created_at": "2025-06-03T15:45:00Z"
  },
  {
    "id": 4,
    "value": 80,
    "name": "Okafor",
    "created_at": "2025-06-06T09:32:47Z"
  }
]
```

### ✅ POST /api/data

**Request:**

```http
POST http://localhost:8000/api/data
Content-Type: application/json

{
  "value": 1200,
  "name": "Fenton"
}
```

**Response:**

```json
{
  "data": {
    "id": 5,
    "value": 1200,
    "name": "Fenton",
    "created_at": null
  },
  "message": "Record Created"
}
```

> 📅 Note: `created_at` may be null initially, depending on how the DB driver returns the response.

---

## 📊 Service Overview

| Service        | Description                    |
| -------------- | ------------------------------ |
| `gofiber`      | REST API backend with MariaDB  |
| `mariadb`      | Database for GoFiber           |
| `wordpress`    | Headless WordPress CMS         |
| `wordpress_db` | MySQL database for WordPress   |
| `etcd`         | Configuration store for APISIX |
| `apisix`       | API Gateway and route manager  |
| `reactapp`     | Frontend dashboard for APISIX  |

---

## 📦 Volumes Used

- `mariadb_data`: Persistent storage for GoFiber DB
- `etcd_data`: Config store for APISIX
- `wordpress_data`: Persistent storage for WordPress
- `wordpress_db_data`: MySQL data for WordPress

---

## 📀 Deployment Roadmap

The React dashboard will be built and pushed to Docker Hub after:

- Form validation
- Catch all routes /\*
- Route with multiple methods

---

## 🙌 License

MIT License

---

Happy developing! 🤖

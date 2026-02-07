# Sales API

A comprehensive REST API for managing sales, customers, products, and users
with authentication, file uploads, and MongoDB integration.

## ✨ Features

- User authentication with JWT tokens
- Role-based access control
- Sales management with pagination
- Customer management
- Product catalog with variants
- File upload support for images and attachments
- MongoDB database integration
- CORS support
- Swagger API documentation
- Input validation with JSON schemas
- User seeding functionality

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Server Framework:** Fastify
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multipart/form-data handling
- **Documentation:** Swagger/OpenAPI
- **Testing:** Test framework configured

## 📁 Project Structure

```sh
testApi/
├── src/
│   ├── modules/              # Core business logic modules
│   │   ├── auth/             # Authentication logic
│   │   ├── customers/        # Customer management
│   │   ├── products/         # Product management
│   │   ├── productVariants/  # Product variants
│   │   ├── sales/            # Sales management
│   │   └── users/            # User management
│   ├── plugins/              # Fastify plugins
│   │   ├── mongodb.js        # Database connection
│   │   ├── jwt.js            # JWT authentication
│   │   ├── cors.js           # CORS configuration
│   │   ├── upload.js         # File upload handling
│   │   ├── swagger.js        # API documentation
│   │   └── multipart.js      # Multipart form parsing
│   ├── routes/               # API route definitions
│   ├── shared/               # Shared utilities and models
│   │   ├── models/           # Mongoose schemas
│   │   ├── middlewares/      # Custom middlewares
│   │   └── schemas/          # JSON schemas for validation
│   ├── storage/              # File storage directories
│   └── utils/                # Helper utilities
├── scripts/                  # Utility scripts
│   ├── seeders/              # Database seeders
│   ├── index.js              # Main seeding script
│   └── simpleSeed.js         # Simple seed data
├── notes/                    # Documentation
├── app.js                    # Application entry
├── server.js                 # Server configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🚀 Installation

**Clone or navigate to the project directory:**

```bash
  cd testApi
```

**Install dependencies:**

```bash
  npm install
```

## ⚙️ Configuration

**Create a `.env` file in the project root:**

```bash
  # Server Configuration
  PORT=3000
  HOST=localhost
  
  # Database Configuration
  MONGODB_URI=mongodb://localhost:27017/sales-api
  
  # JWT Configuration
  JWT_SECRET=<generate-with-command-below>
  JWT_EXPIRY=7d
  
  # File Upload Configuration
  MAX_FILE_SIZE=5242880
  UPLOAD_DIR=./src/storage
    
  # Node Environment
  NODE_ENV=development
```

**Generate a secure JWT secret:**

```sh
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as your `JWT_SECRET` in `.env`

## 🎯 Running the Application

### Development Mode

```bash
  npm run dev
```

### Production Mode

```bash
  npm start
```

The server will start on `http://localhost:3000` (or your configured PORT)
Access the Swagger documentation at: `http://localhost:3000/api/docs`

## 🗄️ Database Setup

### Prerequisites

- MongoDB running locally or accessible MongoDB URI

### Seeding Database

Run the seeding scripts to populate the database with initial data:

```bash
# Run all seeders
npm run seed

# Run simple seed
npm run simple-seed
```

This will populate:

- Users
- Customers
- Products
- Product Variants
- Sales data

## 📡 API Endpoints

### Authentication (`/auth`)

- `POST /auth/login` - Login user
- `POST /auth/register` - Register new user
- `POST /auth/logout` - Logout user

### Users (`/users`)

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Customers (`/customers`)

- `GET /customers` - Get all customers
- `GET /customers/:id` - Get customer by ID
- `POST /customers` - Create new customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

### Products (`/products`)

- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Product Variants (`/productVariants`)

- `GET /productVariants` - Get all variants
- `GET /productVariants/:id` - Get variant by ID
- `POST /productVariants` - Create variant
- `PUT /productVariants/:id` - Update variant
- `DELETE /productVariants/:id` - Delete variant

### Sales (`/sales`)

- `GET /sales` - Get all sales
- `GET /sales/:id` - Get sale by ID with optional items
- `POST /sales` - Create sale
- `PUT /sales/:id` - Update sale
- `DELETE /sales/:id` - Delete sale

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

**Login** to get a token:

```bash
  POST /auth/login
  Body: { "email": "test@example.com", "password": "test123" }
```

**Include the token** in subsequent requests:

```bash
  Authorization: Bearer <your-jwt-token>
```

**Token Management:**

- Tokens expire based on `JWT_EXPIRY` configuration
- Logout adds token to blacklist
- Protected routes require valid, non-blacklisted tokens

## 📤 File Uploads

### Supported File Types

- **Product Images:** JPG, PNG, WebP
- **Sale Attachments:** PDF, JPG, PNG

### File Upload Usage

```javascript
// POST request with multipart/form-data
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('name', 'Product Name');

fetch('/products', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token },
  body: formData
});
```

Files are stored in: `./src/storage/products/images/` and `./src/storage/sales/attachments/`

## 🎨 Module Structure

Each module follows a consistent pattern:

- **controller.js** - Route handlers and HTTP logic
- **service.js** - Business logic and data operations
- **schema.js** - Fastify schema definitions and validation

Example flow: Route → Controller → Service → Model

## 📝 Scripts

Available npm scripts in `package.json`:

- `npm start` - Run production server
- `npm run dev` - Run development server with auto-reload
- `npm run seed` - Seed database with all data
- `npm run simple-seed` - Run simple seed script

## 🐛 Troubleshooting

**MongoDB Connection Error:**

- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`

**JWT Token Invalid:**

- Generate a new JWT secret using the command above
- Clear any stored tokens and login again

**File Upload Errors:**

- Check file size limits in configuration
- Ensure `./src/storage/` directories exist with write permissions

**Port Already in Use:**

- Change `PORT` in `.env` to an available port
- Or kill the process using the current port

## 📚 Additional Resources

See `notes/` directory for:

- `queries.md` - Common database queries
- `transactions.md` - Transaction documentation

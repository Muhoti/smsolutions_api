# PostgreSQL Setup — Strong's Digital Labs API

## 🐘 **Database Migration: MongoDB → PostgreSQL**

Your API has been successfully migrated from MongoDB to PostgreSQL using Sequelize ORM!

## 📋 **Prerequisites**

1. **Install PostgreSQL** on your system:

   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - **Mac**: `brew install postgresql`
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib`

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

## 🔧 **Environment Variables**

Create a `.env` file in the `api` folder with these variables:

```env
# Server Configuration
PORT=3003
NODE_ENV=development

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sdl_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@strongsdigitallabs.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## 🗄️ **Database Setup**

### 1. **Create Database**

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE sdl_db;

-- Create user (optional)
CREATE USER sdl_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE sdl_db TO sdl_user;
```

### 2. **Run the API**

```bash
cd api
npm start
```

The API will automatically:

- ✅ Connect to PostgreSQL
- ✅ Create all tables
- ✅ Set up relationships
- ✅ Start on port 3003

## 📊 **Database Schema**

### **Users Table**

- `id` (Primary Key)
- `name`, `email`, `password`
- `role` (admin/user)
- `isActive`, `lastLogin`
- Profile fields (bio, phone, location, etc.)

### **Projects Table**

- `id` (Primary Key)
- `title`, `description`
- `category`, `type`, `techStack`
- `images`, `links` (JSON fields)
- `client` information
- `status`, `featured`, `isPublic`

### **Contacts Table**

- `id` (Primary Key)
- `name`, `email`, `phone`
- `projectType`, `budget`, `timeline`
- `message`, `status`, `priority`
- `assignedTo` (Foreign Key to Users)

### **Testimonials Table**

- `id` (Primary Key)
- `name`, `title`, `company`
- `review`, `rating`
- `featured`, `isPublic`, `verified`
- `projectId` (Foreign Key to Projects)

## 🔗 **Relationships**

- **User** → **Contacts** (One-to-Many)
- **Project** → **Testimonials** (One-to-Many)

## 🚀 **Key Features**

### **Sequelize ORM Benefits:**

- ✅ **Type Safety**: Data validation at model level
- ✅ **Relationships**: Easy foreign key management
- ✅ **Migrations**: Database schema versioning
- ✅ **Query Builder**: Powerful SQL query interface
- ✅ **Transactions**: ACID compliance
- ✅ **Indexes**: Automatic performance optimization

### **PostgreSQL Benefits:**

- ✅ **ACID Compliance**: Data integrity guaranteed
- ✅ **JSON Support**: Store flexible data structures
- ✅ **Full-Text Search**: Built-in search capabilities
- ✅ **Scalability**: Handle large datasets efficiently
- ✅ **Extensions**: Rich ecosystem of plugins

## 🧪 **Testing the API**

### **1. Health Check**

```bash
curl http://localhost:3003/api/health
```

### **2. Create a User**

```bash
curl -X POST http://localhost:3003/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Strong's Digital Labs",
    "email": "admin@strongsdigitallabs.com",
    "password": "admin123"
  }'
```

### **3. Login**

```bash
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@strongsdigitallabs.com",
    "password": "admin123"
  }'
```

### **4. Get Projects**

```bash
curl http://localhost:3003/api/projects
```

## 🔍 **Database Management**

### **Connect to Database**

```bash
psql -U postgres -d sdl_db
```

### **View Tables**

```sql
\dt
```

### **View Table Structure**

```sql
\d users
\d projects
\d contacts
\d testimonials
```

### **Sample Queries**

```sql
-- Get all users
SELECT * FROM users;

-- Get projects by category
SELECT * FROM projects WHERE category = 'mobile';

-- Get contacts with user assignments
SELECT c.*, u.name as assigned_user
FROM contacts c
LEFT JOIN users u ON c.assigned_to = u.id;
```

## 🎯 **Next Steps**

1. **Install PostgreSQL** and set up the database
2. **Create .env file** with your configuration
3. **Run the API** and test the endpoints
4. **Connect your frontend** to the new API
5. **Deploy to production** (Heroku, AWS, etc.)

## 🆘 **Troubleshooting**

### **Connection Issues**

- Check if PostgreSQL is running: `pg_ctl status`
- Verify credentials in `.env` file
- Ensure database exists: `psql -U postgres -l`

### **Permission Issues**

- Grant proper permissions to your user
- Check PostgreSQL configuration files

### **Port Conflicts**

- Change `PORT` in `.env` if 3003 is occupied
- Update `FRONTEND_URL` accordingly

---

**🎉 Congratulations! You now have a professional PostgreSQL-based API!**

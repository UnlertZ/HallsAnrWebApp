# คู่มือการติดตั้งและ Deploy เว็บแอปพลิเคชัน HallsAnr บน Microsoft Azure Portal

เว็บแอปพลิเคชัน **HallsAnr** ถูกออกแบบและพัฒนาตามมาตรฐาน Enterprise-grade เพื่อรองรับการทำงานและ Deploy บน **Microsoft Azure** อย่างสมบูรณ์แบบ ประกอบด้วย:
1. **Frontend & Backend API**: Next.js (TypeScript + Tailwind CSS + App Router)
2. **SQL Database**: Microsoft Azure SQL Database (MSSQL)
3. **Blob Storage**: Microsoft Azure Blob Storage (สำหรับจัดเก็บรูปภาพโปรไฟล์ ใบประกาศนียบัตร และโลโก้บริษัท)
4. **Role-based Security**: สิทธิ์เจ้าของ (คุณฮอลล์) แก้ไขได้ทุกส่วน และผู้มาเยี่ยมชม (บันทึกประวัติการเข้าชม และดูได้อย่างเดียว)

---

## 1. การเตรียมทรัพยากรบน Microsoft Azure Portal

### ขั้นตอนที่ 1: สร้าง Azure SQL Database
1. เข้าสู่ [Azure Portal](https://portal.azure.com/)
2. ค้นหาบริการ **Azure SQL** แล้วคลิก **+ Create**
3. เลือก **SQL database** (Single database)
4. กำหนดข้อมูล:
   - **Subscription**: เลือก Subscription ของท่าน
   - **Resource Group**: สร้างใหม่ เช่น `rg-hallsanr`
   - **Database name**: เช่น `hallsanrdb`
   - **Server**: คลิก Create new เช่น `sql-hallsanr.database.windows.net`
     - เลือก **SQL authentication**
     - กำหนด **Server admin login** (เช่น `halladmin`)
     - กำหนด **Password** ที่ปลอดภัย
   - **Compute + storage**: เลือกขนาดตามต้องการ (แนะนำ Basic หรือ Standard S0/General Purpose)
5. ไปที่แท็บ **Networking**:
   - ตั้งค่า **Firewall rules**:
     - **Allow Azure services and resources to access this server**: เลือก **Yes** (สำคัญมาก เพื่อให้ App Service เชื่อมต่อฐานข้อมูลได้)
     - **Add current client IP address**: เลือก **Yes** เพื่อให้เครื่องคอมพิวเตอร์ของคุณเชื่อมต่อและจัดการฐานข้อมูลได้
6. คลิก **Review + create** แล้วคลิก **Create**
7. เมื่อสร้างเสร็จสิ้น ให้เข้าไปที่ฐานข้อมูล:
   - เมนูซ้ายเลือก **Query editor (preview)**
   - Login ด้วย username และ password ของ SQL Server
   - เปิดไฟล์ `azure-sql-schema.sql` ในโปรเจกต์นี้ คัดลอกคำสั่ง T-SQL ทั้งหมดไปวางใน Query Editor แล้วกด **Run** เพื่อสร้างตารางทั้งหมด
   - คัดลอก Connection String จากเมนู **Settings -> Connection strings** ในแท็บ **ADO.NET** หรือ **ODBC**

---

### ขั้นตอนที่ 2: สร้าง Azure Storage Account (Blob Storage)
1. บน Azure Portal ค้นหาบริการ **Storage accounts** แล้วคลิก **+ Create**
2. กำหนดข้อมูล:
   - **Resource Group**: `rg-hallsanr`
   - **Storage account name**: เช่น `stg hallsanr` (ตัวพิมพ์เล็กและตัวเลขเท่านั้น เช่น `sthallsanrmedia`)
   - **Performance**: Standard
   - **Redundancy**: Locally-redundant storage (LRS)
3. ไปที่แท็บ **Advanced**:
   - **Allow Blob anonymous access**: ติ๊กถูกเปิดใช้งาน (Enabled) เพื่อให้รูปภาพสามารถแสดงผลบนเว็บไซต์ได้
4. คลิก **Review + create** แล้วคลิก **Create**
5. เมื่อสร้างเสร็จแล้ว:
   - ไปที่เมนูซ้าย **Data storage -> Containers**
   - คลิก **+ Container** ตั้งชื่อ เช่น `hallsanr-media`
   - ช่อง **Anonymous access level**: เลือก **Blob (anonymous read access for blobs only)** แล้วกด Create
   - ไปที่เมนูซ้าย **Security + networking -> Access keys**
   - คัดลอกค่า **Connection string** ของ `key1`

---

## 2. การ Deploy ขึ้น Microsoft Azure App Service

### ตัวเลือกที่ 1: Deploy ผ่าน Azure App Service (Node.js 20 LTS) - แนะนำ
1. บน Azure Portal ค้นหา **App Services** แล้วคลิก **+ Create -> Web App**
2. กำหนดข้อมูล:
   - **Resource Group**: `rg-hallsanr`
   - **Name**: เช่น `hallsanr` (จะได้ URL: `https://hallsanr.azurewebsites.net`)
   - **Publish**: Code
   - **Runtime stack**: **Node 20 LTS**
   - **Operating System**: **Linux**
   - **Pricing Plan**: Basic B1 หรือ Free/Shared F1 ตามต้องการ
3. คลิก **Review + create** แล้วคลิก **Create**
4. การตั้งค่า Environment Variables:
   - ไปที่ Web App ที่สร้างขึ้น -> เมนูซ้ายเลือก **Settings -> Environment variables** (หรือ **Configuration -> Application settings**)
   - คลิก **+ Add** เพื่อเพิ่มตัวแปรระบบตามตารางด้านล่างนี้:

| ชื่อตัวแปร (Name) | ค่าที่ต้องระบุ (Value) |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `JWT_SECRET` | คีย์ลับสำหรับความปลอดภัย เช่น สุ่มตัวอักษร 32-64 ตัว |
| `OWNER_USERNAME` | `hall` (หรือชื่อผู้ใช้ที่คุณต้องการ) |
| `OWNER_PASSWORD` | รหัสผ่านสำหรับเจ้าของเข้าสู่ระบบ (เช่น `hall1234`) |
| `AZURE_SQL_CONNECTION_STRING` | Connection string ของ Azure SQL Database ที่ได้จากขั้นตอนที่ 1 |
| `AZURE_STORAGE_CONNECTION_STRING` | Connection string ของ Storage Account ที่ได้จากขั้นตอนที่ 2 |
| `AZURE_STORAGE_CONTAINER_NAME` | `hallsanr-media` |

5. คลิก **Apply** หรือ **Save** เพื่อบันทึกการตั้งค่า
6. เชื่อมต่อ Git/GitHub Deployment:
   - ไปที่เมนู **Deployment Center**
   - เลือก Source เป็น **GitHub**
   - เชื่อมต่อกับ Repository ของคุณ
   - ระบบจะสร้างไฟล์ GitHub Actions Workflow อัตโนมัติเพื่อ Build และ Deploy ให้ทันทีเมื่อมีการ Push โค้ด

---

### ตัวเลือกที่ 2: Deploy ด้วย Docker Container (Azure Web App for Containers)
ในโฟลเดอร์โปรเจกต์มีไฟล์ `Dockerfile` แบบ Multi-stage build เตรียมไว้เรียบร้อยแล้ว:
1. สร้าง Azure Container Registry (ACR) หรือใช้ Docker Hub
2. Build และ Push image:
   ```bash
   docker build -t hallsanr-webapp:latest .
   docker tag hallsanr-webapp:latest <your-registry>.azurecr.io/hallsanr-webapp:latest
   docker push <your-registry>.azurecr.io/hallsanr-webapp:latest
   ```
3. สร้าง Azure Web App เลือก **Publish: Docker Container** และเลือก Image จาก Container Registry

---

## 3. การทดสอบและใช้งานในเครื่องคอมพิวเตอร์ (Local Development)

หากต้องการรันและทดสอบระบบบนเครื่องก่อนเชื่อมต่อกับ Azure:
1. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```
2. รันในโหมด Development:
   ```bash
   npm run dev
   ```
   หรือรันโหมด Production Build:
   ```bash
   npm run build
   npm run start
   ```
3. เปิดเบราว์เซอร์ไปที่: `http://localhost:3000`
   - **เข้าสู่ระบบผู้เยี่ยมชม**: กรอกชื่อและบริษัท ระบบจะบันทึกประวัติการเข้าชมลงฐานข้อมูล และพาเข้าดูเรซูเม่ (สิทธิ์อ่านอย่างเดียว)
   - **เข้าสู่ระบบเจ้าของ (คุณฮอลล์)**:
     - Username: `hall`
     - Password: `hall1234`
     - เมื่อเข้าสู่ระบบสำเร็จ จะเห็นปุ่มแก้ไข/เพิ่ม/ลบ ในทุกหน้า และสามารถเข้าเมนู **"บันทึกผู้เข้าชม"** (Visitor Logs) ได้

# HallsAnr - Resume & Cloud Portfolio Web Application

**HallsAnr** เป็นเว็บแอปพลิเคชันเรซูเม่และพอร์ตโฟลิโอส่วนตัวของคุณฮอลล์ ออกแบบและพัฒนาเพื่อรองรับการ Deploy บน **Microsoft Azure** (Azure App Service / Azure SQL Database / Azure Blob Storage) โดยมีฟังก์ชันการเข้าชมที่แบ่งสิทธิ์อย่างชัดเจนระหว่าง **เจ้าของเว็บไซต์ (คุณฮอลล์)** และ **ผู้มาเยี่ยมชม (Visitor)**

---

## 🌟 จุดเด่นและฟังก์ชันหลักของระบบ (Key Features)

### 1. ระบบยืนยันตัวตนและการเข้าชม 2 รูปแบบแยกหน้าอย่างชัดเจน (Separated Authentication & Gate Entrance)
- **หน้าประตูทางเข้าสำหรับผู้มาเยี่ยมชม (Visitor Check-in Gate): `/welcome`**:
  - **ทุกคนที่เข้าสู่เว็บไซต์ต้องผ่านหน้านี้ก่อนเสมอ** หากยังไม่ได้ลงทะเบียน ระบบ Middleware จะดักจับและดีดมาที่หน้านี้อัตโนมัติ
  - ฟอร์มลงทะเบียน:
    - **ชื่อ-นามสกุล ผู้เยี่ยมชม** *
    - **ชื่อบริษัท / องค์กร** *
    - **อีเมล / เบอร์โทรศัพท์** (ไม่บังคับ)
    - **วัตถุประสงค์ในการเข้าชม / ข้อความถึงคุณฮอลล์**
  - ข้อมูลจะถูกบันทึกลงใน **SQL Database (VisitorLogs)** ทันที เพื่อเก็บประวัติให้คุณฮอลล์ทราบ
  - เมื่อลงทะเบียนเสร็จสิ้น ผู้เยี่ยมชมจะสามารถเข้าสู่เว็บไซต์เพื่อดูประวัติและผลงานทั้งหมดในสิทธิ์ **"อ่านอย่างเดียว (Read-Only)"**
  - มีปุ่มทางเชื่อมต่อไปยังหน้าสำหรับเจ้าของอย่างชัดเจน

- **หน้าเข้าสู่ระบบสำหรับเจ้าของเว็บไซต์ (Owner Portal): `/owner-login`**:
  - **แยกออกมาเป็นอีกหน้าหนึ่งโดยเฉพาะ** สำหรับคุณฮอลล์โดยตรง
  - เข้าสู่ระบบด้วย Username & Password (`hall` / `hall1234`)
  - มีสิทธิ์ในการ **เพิ่ม ลบ แก้ไข (Full CRUD)** ทุกหัวข้อและข้อมูลในเว็บไซต์ได้อย่างอิสระ
  - สามารถเข้าดู **หน้าบันทึกผู้เข้ามาเยี่ยมชมเว็บไซต์ (Visitor Logs: `/visitor-logs`)** ได้เฉพาะเจ้าของเท่านั้น
  - มีระบบอัปโหลดรูปภาพโปรไฟล์ ใบประกาศนียบัตร และโลโก้บริษัทเข้า **Azure Blob Storage**
  - ผู้เยี่ยมชมทั่วไปจะถูกปฏิเสธการเข้าถึงหน้านี้และหน้าบันทึกผู้เข้าชมด้วย **403 Forbidden** และการ Redirect ของ Middleware

### 2. หน้าและโครงสร้างเนื้อหาในเว็บไซต์
- **หน้าโปรไฟล์หลัก (Main Profile Page)**: แสดงประวัติโดยย่อ (Bio), ข้อมูลติดต่อ (Email, Phone, Location), ช่องทางโซเชียล (LinkedIn, GitHub, Website), ไฮไลต์ผลงาน (KPI Stats), และตารางแสดงทักษะความเชี่ยวชาญ (Skills Matrix) แยกหมวดหมู่พร้อมแถบระดับความชำนาญ
- **หน้าประวัติการศึกษา (Education History Page)**: ไทม์ไลน์วุฒิการศึกษา ปริญญาบัตร สถาบันการศึกษา เกรดเฉลี่ย (GPA) และเกียรตินิยม/รางวัลวิชาการ (เจ้าของสามารถ เพิ่ม/แก้ไข/ลบ ได้)
- **หน้าประวัติการทำงาน (Work Experience Page)**: ไทม์ไลน์ประสบการณ์การทำงาน ตำแหน่งงาน ชื่อบริษัท โลโก้บริษัท ประเภทการจ้างงาน รายละเอียดงาน หน้าที่ความรับผิดชอบ ผลงานสำคัญ และแท็กเทคโนโลยีที่ใช้ (เจ้าของสามารถ เพิ่ม/แก้ไข/ลบ ได้)
- **หน้าการฝึกอบรม & ใบรับรอง (Training & Certifications Page)**: การ์ดแสดงหลักสูตรที่ผ่านการอบรม สถาบันผู้ออก วันที่ได้รับ Credential ID ลิงก์ตรวจสอบใบรับรอง และภาพประกาศนียบัตรที่สามารถคลิกดูรูปขนาดเต็มได้ (เจ้าของสามารถ เพิ่ม/แก้ไข/ลบ และอัปโหลดภาพได้)
- **หน้าบันทึกผู้เข้าชมเว็บไซต์ (Visitor Logs Page - เฉพาะเจ้าของที่เห็นได้)**:
  - แสดงจำนวนผู้เข้าชมทั้งหมด บริษัทที่เข้าชม และผู้เข้าชมรายวัน
  - ค้นหาและกรองข้อมูลตามชื่อหรือชื่อบริษัทได้ทันที
  - ส่งออกข้อมูลเป็นไฟล์ Excel / CSV (รองรับภาษาไทย UTF-8 BOM)
  - ดูรายละเอียดข้อความที่ผู้เยี่ยมชมฝากไว้ และลบบันทึกได้

---

## 🛠️ สถาปัตยกรรมเทคโนโลยี (Tech Stack & Azure Architecture)

- **Frontend & Backend API**: [Next.js](https://nextjs.org/) (App Router, React, TypeScript)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/) พร้อม Glassmorphism Design และ Lucide React Icons
- **Database Engine**:
  - **Microsoft Azure SQL Database** / Microsoft SQL Server ผ่าน `mssql` client พร้อมระบบ Parameterized Query ป้องกัน SQL Injection
  - มีสคริปต์ T-SQL: `azure-sql-schema.sql` พร้อมใช้งานบน Azure Query Editor
  - มีระบบ Persistent Local Storage Fallback อัตโนมัติ เพื่อให้สามารถรันและทดสอบในเครื่องได้ทันทีแม้ยังไม่ได้เชื่อมต่อ Azure
- **Cloud Media Storage**:
  - **Microsoft Azure Blob Storage** (`@azure/storage-blob`) พร้อมระบบ Auto-create Container
  - มี Local Media Fallback (`public/uploads`) เมื่อรันในสภาพแวดล้อม Development
- **Security & Session**: JWT Session Token, HttpOnly Cookie, Bcrypt Password Hashing, RBAC Middleware

---

## 🚀 การเริ่มต้นใช้งานในเครื่อง (Local Setup)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. เริ่มต้นรันเซิร์ฟเวอร์สำหรับทดสอบ
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

### ข้อมูลสำหรับทดสอบเข้าสู่ระบบ:
- **บัญชีเจ้าของ (ฮอลล์)**: Username: `hall` | Password: `hall1234`
- **ผู้เยี่ยมชม**: ไปที่แท็บ "ผู้มาเยี่ยมชม" กรอกชื่อและบริษัทเพื่อทดสอบการบันทึกประวัติการเข้าชม

---

## ☁️ คู่มือการ Deploy ขึ้น Microsoft Azure

โปรดอ่านคู่มืออย่างละเอียดในไฟล์ [AZURE_DEPLOYMENT_GUIDE.md](file:///c:/Users/anuru/Downloads/IntroductionProfile/HallsAnrWebApp/AZURE_DEPLOYMENT_GUIDE.md) ซึ่งมีคำแนะนำทีละขั้นตอนสำหรับการสร้าง:
1. Azure SQL Database และรัน `azure-sql-schema.sql`
2. Azure Blob Storage สำหรับจัดเก็บรูปภาพ
3. Azure App Service (Node 20 LTS Linux) หรือ Azure Container Apps ผ่าน `Dockerfile`
4. การตั้งค่า Environment Variables บน Azure Portal

-- =====================================================================
-- HallsAnr Web Application - Azure SQL Database Schema & Initial Data
-- Microsoft Azure SQL Database / SQL Server compatible T-SQL
-- =====================================================================

-- 1. Table: Profiles
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Profiles' and xtype='U')
BEGIN
    CREATE TABLE Profiles (
        id NVARCHAR(50) PRIMARY KEY,
        fullName NVARCHAR(150) NOT NULL,
        nickName NVARCHAR(50) NOT NULL,
        title NVARCHAR(200) NOT NULL,
        bio NVARCHAR(MAX) NOT NULL,
        email NVARCHAR(150) NOT NULL,
        phone NVARCHAR(50) NOT NULL,
        location NVARCHAR(150) NOT NULL,
        avatarUrl NVARCHAR(500) NOT NULL,
        heroBannerUrl NVARCHAR(500) NULL,
        githubUrl NVARCHAR(250) NULL,
        linkedinUrl NVARCHAR(250) NULL,
        websiteUrl NVARCHAR(250) NULL,
        resumePdfUrl NVARCHAR(500) NULL,
        yearsOfExperience INT DEFAULT 0,
        highlightStatsJson NVARCHAR(MAX) NULL,
        skillsJson NVARCHAR(MAX) NULL,
        updatedAt DATETIME2 DEFAULT GETUTCDATE()
    );
END;

-- 2. Table: Education
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Education' and xtype='U')
BEGIN
    CREATE TABLE Education (
        id NVARCHAR(50) PRIMARY KEY,
        degree NVARCHAR(150) NOT NULL,
        institution NVARCHAR(200) NOT NULL,
        faculty NVARCHAR(150) NULL,
        fieldOfStudy NVARCHAR(150) NOT NULL,
        startYear NVARCHAR(20) NOT NULL,
        endYear NVARCHAR(20) NOT NULL,
        isCurrent BIT DEFAULT 0,
        gpa NVARCHAR(20) NULL,
        honors NVARCHAR(200) NULL,
        description NVARCHAR(MAX) NULL,
        orderIndex INT DEFAULT 0,
        createdAt DATETIME2 DEFAULT GETUTCDATE()
    );
END;

-- 3. Table: Experiences
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Experiences' and xtype='U')
BEGIN
    CREATE TABLE Experiences (
        id NVARCHAR(50) PRIMARY KEY,
        jobTitle NVARCHAR(150) NOT NULL,
        companyName NVARCHAR(200) NOT NULL,
        companyLogoUrl NVARCHAR(500) NULL,
        employmentType NVARCHAR(50) NOT NULL,
        location NVARCHAR(150) NULL,
        startDate NVARCHAR(50) NOT NULL,
        endDate NVARCHAR(50) NULL,
        isCurrent BIT DEFAULT 0,
        description NVARCHAR(MAX) NOT NULL,
        responsibilitiesJson NVARCHAR(MAX) NULL,
        achievementsJson NVARCHAR(MAX) NULL,
        technologiesJson NVARCHAR(MAX) NULL,
        orderIndex INT DEFAULT 0,
        createdAt DATETIME2 DEFAULT GETUTCDATE()
    );
END;

-- 4. Table: Trainings
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Trainings' and xtype='U')
BEGIN
    CREATE TABLE Trainings (
        id NVARCHAR(50) PRIMARY KEY,
        title NVARCHAR(200) NOT NULL,
        issuer NVARCHAR(200) NOT NULL,
        issueDate NVARCHAR(50) NOT NULL,
        expirationDate NVARCHAR(50) NULL,
        credentialId NVARCHAR(150) NULL,
        credentialUrl NVARCHAR(500) NULL,
        imageUrl NVARCHAR(500) NULL,
        description NVARCHAR(MAX) NULL,
        orderIndex INT DEFAULT 0,
        createdAt DATETIME2 DEFAULT GETUTCDATE()
    );
END;

-- 5. Table: VisitorLogs (Accessible ONLY by the Owner)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='VisitorLogs' and xtype='U')
BEGIN
    CREATE TABLE VisitorLogs (
        id NVARCHAR(50) PRIMARY KEY,
        visitorName NVARCHAR(150) NOT NULL,
        companyName NVARCHAR(200) NOT NULL,
        email NVARCHAR(150) NULL,
        phone NVARCHAR(50) NULL,
        purpose NVARCHAR(MAX) NULL,
        ipAddress NVARCHAR(100) NULL,
        userAgent NVARCHAR(500) NULL,
        visitedAt DATETIME2 DEFAULT GETUTCDATE()
    );

    CREATE NONCLUSTERED INDEX IX_VisitorLogs_VisitedAt ON VisitorLogs (visitedAt DESC);
    CREATE NONCLUSTERED INDEX IX_VisitorLogs_Company ON VisitorLogs (companyName);
END;

-- 6. Table: OwnerUsers
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='OwnerUsers' and xtype='U')
BEGIN
    CREATE TABLE OwnerUsers (
        id NVARCHAR(50) PRIMARY KEY,
        username NVARCHAR(100) UNIQUE NOT NULL,
        passwordHash NVARCHAR(250) NOT NULL,
        displayName NVARCHAR(150) NOT NULL,
        role NVARCHAR(50) DEFAULT 'owner',
        createdAt DATETIME2 DEFAULT GETUTCDATE()
    );
END;

-- Initial Seed for Owner Hall (Default credentials can be updated from .env)
IF NOT EXISTS (SELECT 1 FROM OwnerUsers WHERE username = 'hall')
BEGIN
    -- Default password hash for 'hall1234' (bcrypt hashed)
    INSERT INTO OwnerUsers (id, username, passwordHash, displayName, role)
    VALUES ('owner-1', 'hall', '$2a$10$wB5y0lS8fEa.Ym0MvY7w.e/k6E.R25q7O4GgX1J1gZfZl8c5K1t2W', N'คุณฮอลล์ (Hall)', 'owner');
END;

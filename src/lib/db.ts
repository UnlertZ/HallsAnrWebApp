import sql from 'mssql';
import fs from 'fs';
import path from 'path';
import { Profile, Education, Experience, TrainingCertification, VisitorLog } from '@/types';
import { initialProfile, initialEducation, initialExperience, initialTrainings } from './seed-data';

interface LocalDataStore {
  profile: Profile;
  education: Education[];
  experience: Experience[];
  trainings: TrainingCertification[];
  visitorLogs: VisitorLog[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'hallsanr_data.json');

// Check Azure SQL connection configuration
const connectionString =
  process.env.AZURE_SQL_CONNECTION_STRING ||
  process.env.DATABASE_URL ||
  (process.env.AZURE_SQL_SERVER && process.env.AZURE_SQL_DATABASE
    ? `Server=${process.env.AZURE_SQL_SERVER},${process.env.AZURE_SQL_PORT || 1433};Database=${process.env.AZURE_SQL_DATABASE};User Id=${process.env.AZURE_SQL_USER};Password=${process.env.AZURE_SQL_PASSWORD};Encrypt=true;TrustServerCertificate=false;`
    : null);

let mssqlPool: sql.ConnectionPool | null = null;
let isAzureSqlAvailable = false;
let hasCheckedAzure = false;

async function getSqlPool(): Promise<sql.ConnectionPool | null> {
  if (hasCheckedAzure) {
    return isAzureSqlAvailable ? mssqlPool : null;
  }

  hasCheckedAzure = true;
  if (!connectionString) {
    console.log('[DB] No Azure SQL connection string specified. Using local persistent storage mode.');
    isAzureSqlAvailable = false;
    return null;
  }

  try {
    mssqlPool = await sql.connect(connectionString);
    isAzureSqlAvailable = true;
    console.log('[DB] Successfully connected to Microsoft Azure SQL Database!');
    await initializeAzureTables(mssqlPool);
    return mssqlPool;
  } catch (err) {
    console.warn('[DB] Failed to connect to Azure SQL Database. Falling back to local storage:', err);
    isAzureSqlAvailable = false;
    mssqlPool = null;
    return null;
  }
}

async function initializeAzureTables(pool: sql.ConnectionPool) {
  try {
    // 1. Profiles
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Profiles' and xtype='U')
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
    `);

    // 2. Education
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Education' and xtype='U')
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
    `);

    // 3. Experiences
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Experiences' and xtype='U')
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
    `);

    // 4. Trainings
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Trainings' and xtype='U')
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
    `);

    // 5. VisitorLogs
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='VisitorLogs' and xtype='U')
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
    `);
  } catch (err) {
    console.error('[DB] Error initializing Azure SQL tables:', err);
  }
}

// ----------------- LOCAL DATA STORE (FALLBACK) -----------------
function ensureLocalData(): LocalDataStore {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    const defaultData: LocalDataStore = {
      profile: initialProfile,
      education: initialEducation,
      experience: initialExperience,
      trainings: initialTrainings,
      visitorLogs: [
        {
          id: 'sample-log-1',
          visitorName: 'สมชาย ใจดี',
          companyName: 'PTT Digital Solutions',
          email: 'somchai@pttdigital.com',
          phone: '089-999-8888',
          purpose: 'กำลังค้นหา Senior Cloud Engineer มาร่วมงานโปรเจกต์พัฒนาระบบ Azure Enterprise',
          ipAddress: '127.0.0.1',
          visitedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: 'sample-log-2',
          visitorName: 'กุลนันท์ พัฒนาวงศ์',
          companyName: 'Agoda Thailand',
          email: 'kulnan@agoda.com',
          phone: '092-111-2222',
          purpose: 'เยี่ยมชมผลงานและประสบการณ์ด้าน Microservices & Next.js Architecture',
          ipAddress: '127.0.0.1',
          visitedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
      ],
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as LocalDataStore;
  } catch (e) {
    console.error('Failed reading data file, using defaults:', e);
    return {
      profile: initialProfile,
      education: initialEducation,
      experience: initialExperience,
      trainings: initialTrainings,
      visitorLogs: [],
    };
  }
}

function saveLocalData(data: LocalDataStore) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ----------------- REPOSITORY API -----------------

// PROFILE
export async function getProfile(): Promise<Profile> {
  const pool = await getSqlPool();
  if (pool) {
    try {
      const result = await pool.request().query('SELECT TOP 1 * FROM Profiles');
      if (result.recordset && result.recordset.length > 0) {
        const row = result.recordset[0];
        return {
          id: row.id,
          fullName: row.fullName,
          nickName: row.nickName,
          title: row.title,
          bio: row.bio,
          email: row.email,
          phone: row.phone,
          location: row.location,
          avatarUrl: row.avatarUrl,
          heroBannerUrl: row.heroBannerUrl,
          githubUrl: row.githubUrl,
          linkedinUrl: row.linkedinUrl,
          websiteUrl: row.websiteUrl,
          resumePdfUrl: row.resumePdfUrl,
          yearsOfExperience: row.yearsOfExperience || 0,
          highlightStats: row.highlightStatsJson ? JSON.parse(row.highlightStatsJson) : [],
          skills: row.skillsJson ? JSON.parse(row.skillsJson) : [],
          updatedAt: row.updatedAt?.toISOString() || new Date().toISOString(),
        };
      }
    } catch (e) {
      console.error('[DB] Azure SQL getProfile error:', e);
    }
  }

  const local = ensureLocalData();
  return local.profile;
}

export async function updateProfile(data: Partial<Profile>): Promise<Profile> {
  const pool = await getSqlPool();
  const current = await getProfile();
  const updated: Profile = {
    ...current,
    ...data,
    updatedAt: new Date().toISOString(),
  };

  if (pool) {
    try {
      const req = pool.request();
      req.input('id', sql.NVarChar(50), updated.id);
      req.input('fullName', sql.NVarChar(150), updated.fullName);
      req.input('nickName', sql.NVarChar(50), updated.nickName);
      req.input('title', sql.NVarChar(200), updated.title);
      req.input('bio', sql.NVarChar(sql.MAX), updated.bio);
      req.input('email', sql.NVarChar(150), updated.email);
      req.input('phone', sql.NVarChar(50), updated.phone);
      req.input('location', sql.NVarChar(150), updated.location);
      req.input('avatarUrl', sql.NVarChar(500), updated.avatarUrl);
      req.input('heroBannerUrl', sql.NVarChar(500), updated.heroBannerUrl || null);
      req.input('githubUrl', sql.NVarChar(250), updated.githubUrl || null);
      req.input('linkedinUrl', sql.NVarChar(250), updated.linkedinUrl || null);
      req.input('websiteUrl', sql.NVarChar(250), updated.websiteUrl || null);
      req.input('resumePdfUrl', sql.NVarChar(500), updated.resumePdfUrl || null);
      req.input('yearsOfExperience', sql.Int, updated.yearsOfExperience || 0);
      req.input('highlightStatsJson', sql.NVarChar(sql.MAX), JSON.stringify(updated.highlightStats || []));
      req.input('skillsJson', sql.NVarChar(sql.MAX), JSON.stringify(updated.skills || []));

      await req.query(`
        IF EXISTS (SELECT 1 FROM Profiles WHERE id = @id)
          UPDATE Profiles SET
            fullName = @fullName, nickName = @nickName, title = @title, bio = @bio,
            email = @email, phone = @phone, location = @location, avatarUrl = @avatarUrl,
            heroBannerUrl = @heroBannerUrl, githubUrl = @githubUrl, linkedinUrl = @linkedinUrl,
            websiteUrl = @websiteUrl, resumePdfUrl = @resumePdfUrl, yearsOfExperience = @yearsOfExperience,
            highlightStatsJson = @highlightStatsJson, skillsJson = @skillsJson, updatedAt = GETUTCDATE()
          WHERE id = @id;
        ELSE
          INSERT INTO Profiles (id, fullName, nickName, title, bio, email, phone, location, avatarUrl, heroBannerUrl, githubUrl, linkedinUrl, websiteUrl, resumePdfUrl, yearsOfExperience, highlightStatsJson, skillsJson)
          VALUES (@id, @fullName, @nickName, @title, @bio, @email, @phone, @location, @avatarUrl, @heroBannerUrl, @githubUrl, @linkedinUrl, @websiteUrl, @resumePdfUrl, @yearsOfExperience, @highlightStatsJson, @skillsJson);
      `);
    } catch (e) {
      console.error('[DB] Azure SQL updateProfile error:', e);
    }
  }

  const local = ensureLocalData();
  local.profile = updated;
  saveLocalData(local);
  return updated;
}

// EDUCATION
export async function getEducationList(): Promise<Education[]> {
  const pool = await getSqlPool();
  if (pool) {
    try {
      const res = await pool.request().query('SELECT * FROM Education ORDER BY orderIndex ASC, startYear DESC');
      if (res.recordset) {
        return res.recordset.map((r) => ({
          id: r.id,
          degree: r.degree,
          institution: r.institution,
          faculty: r.faculty || undefined,
          fieldOfStudy: r.fieldOfStudy,
          startYear: r.startYear,
          endYear: r.endYear,
          isCurrent: Boolean(r.isCurrent),
          gpa: r.gpa || undefined,
          honors: r.honors || undefined,
          description: r.description || undefined,
          orderIndex: r.orderIndex || 0,
        }));
      }
    } catch (e) {
      console.error('[DB] Azure SQL getEducationList error:', e);
    }
  }

  const local = ensureLocalData();
  return local.education.sort((a, b) => a.orderIndex - b.orderIndex);
}

export async function createEducation(data: Omit<Education, 'id'>): Promise<Education> {
  const newItem: Education = {
    ...data,
    id: `edu-${Date.now()}`,
  };

  const pool = await getSqlPool();
  if (pool) {
    try {
      const req = pool.request();
      req.input('id', sql.NVarChar(50), newItem.id);
      req.input('degree', sql.NVarChar(150), newItem.degree);
      req.input('institution', sql.NVarChar(200), newItem.institution);
      req.input('faculty', sql.NVarChar(150), newItem.faculty || null);
      req.input('fieldOfStudy', sql.NVarChar(150), newItem.fieldOfStudy);
      req.input('startYear', sql.NVarChar(20), newItem.startYear);
      req.input('endYear', sql.NVarChar(20), newItem.endYear);
      req.input('isCurrent', sql.Bit, newItem.isCurrent ? 1 : 0);
      req.input('gpa', sql.NVarChar(20), newItem.gpa || null);
      req.input('honors', sql.NVarChar(200), newItem.honors || null);
      req.input('description', sql.NVarChar(sql.MAX), newItem.description || null);
      req.input('orderIndex', sql.Int, newItem.orderIndex || 0);

      await req.query(`
        INSERT INTO Education (id, degree, institution, faculty, fieldOfStudy, startYear, endYear, isCurrent, gpa, honors, description, orderIndex)
        VALUES (@id, @degree, @institution, @faculty, @fieldOfStudy, @startYear, @endYear, @isCurrent, @gpa, @honors, @description, @orderIndex)
      `);
    } catch (e) {
      console.error('[DB] Azure SQL createEducation error:', e);
    }
  }

  const local = ensureLocalData();
  local.education.push(newItem);
  saveLocalData(local);
  return newItem;
}

export async function updateEducation(id: string, data: Partial<Education>): Promise<Education | null> {
  const pool = await getSqlPool();
  if (pool) {
    try {
      const current = (await getEducationList()).find((e) => e.id === id);
      if (current) {
        const merged: Education = { ...current, ...data };
        const req = pool.request();
        req.input('id', sql.NVarChar(50), id);
        req.input('degree', sql.NVarChar(150), merged.degree);
        req.input('institution', sql.NVarChar(200), merged.institution);
        req.input('faculty', sql.NVarChar(150), merged.faculty || null);
        req.input('fieldOfStudy', sql.NVarChar(150), merged.fieldOfStudy);
        req.input('startYear', sql.NVarChar(20), merged.startYear);
        req.input('endYear', sql.NVarChar(20), merged.endYear);
        req.input('isCurrent', sql.Bit, merged.isCurrent ? 1 : 0);
        req.input('gpa', sql.NVarChar(20), merged.gpa || null);
        req.input('honors', sql.NVarChar(200), merged.honors || null);
        req.input('description', sql.NVarChar(sql.MAX), merged.description || null);
        req.input('orderIndex', sql.Int, merged.orderIndex || 0);

        await req.query(`
          UPDATE Education SET
            degree = @degree, institution = @institution, faculty = @faculty, fieldOfStudy = @fieldOfStudy,
            startYear = @startYear, endYear = @endYear, isCurrent = @isCurrent, gpa = @gpa,
            honors = @honors, description = @description, orderIndex = @orderIndex
          WHERE id = @id
        `);
        return merged;
      }
    } catch (e) {
      console.error('[DB] Azure SQL updateEducation error:', e);
    }
  }

  const local = ensureLocalData();
  const index = local.education.findIndex((item) => item.id === id);
  if (index === -1) return null;

  local.education[index] = { ...local.education[index], ...data };
  saveLocalData(local);
  return local.education[index];
}

export async function deleteEducation(id: string): Promise<boolean> {
  const pool = await getSqlPool();
  if (pool) {
    try {
      const req = pool.request();
      req.input('id', sql.NVarChar(50), id);
      await req.query('DELETE FROM Education WHERE id = @id');
    } catch (e) {
      console.error('[DB] Azure SQL deleteEducation error:', e);
    }
  }

  const local = ensureLocalData();
  const filtered = local.education.filter((item) => item.id !== id);
  if (filtered.length !== local.education.length) {
    local.education = filtered;
    saveLocalData(local);
    return true;
  }
  return false;
}

// EXPERIENCE
export async function getExperienceList(): Promise<Experience[]> {
  const pool = await getSqlPool();
  if (pool) {
    try {
      const res = await pool.request().query('SELECT * FROM Experiences ORDER BY orderIndex ASC, startDate DESC');
      if (res.recordset) {
        return res.recordset.map((r) => ({
          id: r.id,
          jobTitle: r.jobTitle,
          companyName: r.companyName,
          companyLogoUrl: r.companyLogoUrl || undefined,
          employmentType: r.employmentType,
          location: r.location || undefined,
          startDate: r.startDate,
          endDate: r.endDate || undefined,
          isCurrent: Boolean(r.isCurrent),
          description: r.description,
          responsibilities: r.responsibilitiesJson ? JSON.parse(r.responsibilitiesJson) : [],
          achievements: r.achievementsJson ? JSON.parse(r.achievementsJson) : [],
          technologies: r.technologiesJson ? JSON.parse(r.technologiesJson) : [],
          orderIndex: r.orderIndex || 0,
        }));
      }
    } catch (e) {
      console.error('[DB] Azure SQL getExperienceList error:', e);
    }
  }

  const local = ensureLocalData();
  return local.experience.sort((a, b) => a.orderIndex - b.orderIndex);
}

export async function createExperience(data: Omit<Experience, 'id'>): Promise<Experience> {
  const newItem: Experience = {
    ...data,
    id: `exp-${Date.now()}`,
  };

  const pool = await getSqlPool();
  if (pool) {
    try {
      const req = pool.request();
      req.input('id', sql.NVarChar(50), newItem.id);
      req.input('jobTitle', sql.NVarChar(150), newItem.jobTitle);
      req.input('companyName', sql.NVarChar(200), newItem.companyName);
      req.input('companyLogoUrl', sql.NVarChar(500), newItem.companyLogoUrl || null);
      req.input('employmentType', sql.NVarChar(50), newItem.employmentType);
      req.input('location', sql.NVarChar(150), newItem.location || null);
      req.input('startDate', sql.NVarChar(50), newItem.startDate);
      req.input('endDate', sql.NVarChar(50), newItem.endDate || null);
      req.input('isCurrent', sql.Bit, newItem.isCurrent ? 1 : 0);
      req.input('description', sql.NVarChar(sql.MAX), newItem.description);
      req.input('responsibilitiesJson', sql.NVarChar(sql.MAX), JSON.stringify(newItem.responsibilities || []));
      req.input('achievementsJson', sql.NVarChar(sql.MAX), JSON.stringify(newItem.achievements || []));
      req.input('technologiesJson', sql.NVarChar(sql.MAX), JSON.stringify(newItem.technologies || []));
      req.input('orderIndex', sql.Int, newItem.orderIndex || 0);

      await req.query(`
        INSERT INTO Experiences (id, jobTitle, companyName, companyLogoUrl, employmentType, location, startDate, endDate, isCurrent, description, responsibilitiesJson, achievementsJson, technologiesJson, orderIndex)
        VALUES (@id, @jobTitle, @companyName, @companyLogoUrl, @employmentType, @location, @startDate, @endDate, @isCurrent, @description, @responsibilitiesJson, @achievementsJson, @technologiesJson, @orderIndex)
      `);
    } catch (e) {
      console.error('[DB] Azure SQL createExperience error:', e);
    }
  }

  const local = ensureLocalData();
  local.experience.push(newItem);
  saveLocalData(local);
  return newItem;
}

export async function updateExperience(id: string, data: Partial<Experience>): Promise<Experience | null> {
  const pool = await getSqlPool();
  if (pool) {
    try {
      const current = (await getExperienceList()).find((e) => e.id === id);
      if (current) {
        const merged: Experience = { ...current, ...data };
        const req = pool.request();
        req.input('id', sql.NVarChar(50), id);
        req.input('jobTitle', sql.NVarChar(150), merged.jobTitle);
        req.input('companyName', sql.NVarChar(200), merged.companyName);
        req.input('companyLogoUrl', sql.NVarChar(500), merged.companyLogoUrl || null);
        req.input('employmentType', sql.NVarChar(50), merged.employmentType);
        req.input('location', sql.NVarChar(150), merged.location || null);
        req.input('startDate', sql.NVarChar(50), merged.startDate);
        req.input('endDate', sql.NVarChar(50), merged.endDate || null);
        req.input('isCurrent', sql.Bit, merged.isCurrent ? 1 : 0);
        req.input('description', sql.NVarChar(sql.MAX), merged.description);
        req.input('responsibilitiesJson', sql.NVarChar(sql.MAX), JSON.stringify(merged.responsibilities || []));
        req.input('achievementsJson', sql.NVarChar(sql.MAX), JSON.stringify(merged.achievements || []));
        req.input('technologiesJson', sql.NVarChar(sql.MAX), JSON.stringify(merged.technologies || []));
        req.input('orderIndex', sql.Int, merged.orderIndex || 0);

        await req.query(`
          UPDATE Experiences SET
            jobTitle = @jobTitle, companyName = @companyName, companyLogoUrl = @companyLogoUrl,
            employmentType = @employmentType, location = @location, startDate = @startDate,
            endDate = @endDate, isCurrent = @isCurrent, description = @description,
            responsibilitiesJson = @responsibilitiesJson, achievementsJson = @achievementsJson,
            technologiesJson = @technologiesJson, orderIndex = @orderIndex
          WHERE id = @id
        `);
        return merged;
      }
    } catch (e) {
      console.error('[DB] Azure SQL updateExperience error:', e);
    }
  }

  const local = ensureLocalData();
  const index = local.experience.findIndex((item) => item.id === id);
  if (index === -1) return null;

  local.experience[index] = { ...local.experience[index], ...data };
  saveLocalData(local);
  return local.experience[index];
}

export async function deleteExperience(id: string): Promise<boolean> {
  const pool = await getSqlPool();
  if (pool) {
    try {
      const req = pool.request();
      req.input('id', sql.NVarChar(50), id);
      await req.query('DELETE FROM Experiences WHERE id = @id');
    } catch (e) {
      console.error('[DB] Azure SQL deleteExperience error:', e);
    }
  }

  const local = ensureLocalData();
  const filtered = local.experience.filter((item) => item.id !== id);
  if (filtered.length !== local.experience.length) {
    local.experience = filtered;
    saveLocalData(local);
    return true;
  }
  return false;
}

// TRAININGS
export async function getTrainingList(): Promise<TrainingCertification[]> {
  const pool = await getSqlPool();
  if (pool) {
    try {
      const res = await pool.request().query('SELECT * FROM Trainings ORDER BY orderIndex ASC, issueDate DESC');
      if (res.recordset) {
        return res.recordset.map((r) => ({
          id: r.id,
          title: r.title,
          issuer: r.issuer,
          issueDate: r.issueDate,
          expirationDate: r.expirationDate || undefined,
          credentialId: r.credentialId || undefined,
          credentialUrl: r.credentialUrl || undefined,
          imageUrl: r.imageUrl || undefined,
          description: r.description || undefined,
          orderIndex: r.orderIndex || 0,
        }));
      }
    } catch (e) {
      console.error('[DB] Azure SQL getTrainingList error:', e);
    }
  }

  const local = ensureLocalData();
  return local.trainings.sort((a, b) => a.orderIndex - b.orderIndex);
}

export async function createTraining(data: Omit<TrainingCertification, 'id'>): Promise<TrainingCertification> {
  const newItem: TrainingCertification = {
    ...data,
    id: `train-${Date.now()}`,
  };

  const pool = await getSqlPool();
  if (pool) {
    try {
      const req = pool.request();
      req.input('id', sql.NVarChar(50), newItem.id);
      req.input('title', sql.NVarChar(200), newItem.title);
      req.input('issuer', sql.NVarChar(200), newItem.issuer);
      req.input('issueDate', sql.NVarChar(50), newItem.issueDate);
      req.input('expirationDate', sql.NVarChar(50), newItem.expirationDate || null);
      req.input('credentialId', sql.NVarChar(150), newItem.credentialId || null);
      req.input('credentialUrl', sql.NVarChar(500), newItem.credentialUrl || null);
      req.input('imageUrl', sql.NVarChar(500), newItem.imageUrl || null);
      req.input('description', sql.NVarChar(sql.MAX), newItem.description || null);
      req.input('orderIndex', sql.Int, newItem.orderIndex || 0);

      await req.query(`
        INSERT INTO Trainings (id, title, issuer, issueDate, expirationDate, credentialId, credentialUrl, imageUrl, description, orderIndex)
        VALUES (@id, @title, @issuer, @issueDate, @expirationDate, @credentialId, @credentialUrl, @imageUrl, @description, @orderIndex)
      `);
    } catch (e) {
      console.error('[DB] Azure SQL createTraining error:', e);
    }
  }

  const local = ensureLocalData();
  local.trainings.push(newItem);
  saveLocalData(local);
  return newItem;
}

export async function updateTraining(id: string, data: Partial<TrainingCertification>): Promise<TrainingCertification | null> {
  const pool = await getSqlPool();
  if (pool) {
    try {
      const current = (await getTrainingList()).find((e) => e.id === id);
      if (current) {
        const merged: TrainingCertification = { ...current, ...data };
        const req = pool.request();
        req.input('id', sql.NVarChar(50), id);
        req.input('title', sql.NVarChar(200), merged.title);
        req.input('issuer', sql.NVarChar(200), merged.issuer);
        req.input('issueDate', sql.NVarChar(50), merged.issueDate);
        req.input('expirationDate', sql.NVarChar(50), merged.expirationDate || null);
        req.input('credentialId', sql.NVarChar(150), merged.credentialId || null);
        req.input('credentialUrl', sql.NVarChar(500), merged.credentialUrl || null);
        req.input('imageUrl', sql.NVarChar(500), merged.imageUrl || null);
        req.input('description', sql.NVarChar(sql.MAX), merged.description || null);
        req.input('orderIndex', sql.Int, merged.orderIndex || 0);

        await req.query(`
          UPDATE Trainings SET
            title = @title, issuer = @issuer, issueDate = @issueDate,
            expirationDate = @expirationDate, credentialId = @credentialId,
            credentialUrl = @credentialUrl, imageUrl = @imageUrl,
            description = @description, orderIndex = @orderIndex
          WHERE id = @id
        `);
        return merged;
      }
    } catch (e) {
      console.error('[DB] Azure SQL updateTraining error:', e);
    }
  }

  const local = ensureLocalData();
  const index = local.trainings.findIndex((item) => item.id === id);
  if (index === -1) return null;

  local.trainings[index] = { ...local.trainings[index], ...data };
  saveLocalData(local);
  return local.trainings[index];
}

export async function deleteTraining(id: string): Promise<boolean> {
  const pool = await getSqlPool();
  if (pool) {
    try {
      const req = pool.request();
      req.input('id', sql.NVarChar(50), id);
      await req.query('DELETE FROM Trainings WHERE id = @id');
    } catch (e) {
      console.error('[DB] Azure SQL deleteTraining error:', e);
    }
  }

  const local = ensureLocalData();
  const filtered = local.trainings.filter((item) => item.id !== id);
  if (filtered.length !== local.trainings.length) {
    local.trainings = filtered;
    saveLocalData(local);
    return true;
  }
  return false;
}

// VISITOR LOGS (Strictly for Owner to view)
export async function recordVisitorLog(data: Omit<VisitorLog, 'id' | 'visitedAt'>): Promise<VisitorLog> {
  const newLog: VisitorLog = {
    ...data,
    id: `visit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    visitedAt: new Date().toISOString(),
  };

  const pool = await getSqlPool();
  if (pool) {
    try {
      const req = pool.request();
      req.input('id', sql.NVarChar(50), newLog.id);
      req.input('visitorName', sql.NVarChar(150), newLog.visitorName);
      req.input('companyName', sql.NVarChar(200), newLog.companyName);
      req.input('email', sql.NVarChar(150), newLog.email || null);
      req.input('phone', sql.NVarChar(50), newLog.phone || null);
      req.input('purpose', sql.NVarChar(sql.MAX), newLog.purpose || null);
      req.input('ipAddress', sql.NVarChar(100), newLog.ipAddress || null);
      req.input('userAgent', sql.NVarChar(500), newLog.userAgent || null);

      await req.query(`
        INSERT INTO VisitorLogs (id, visitorName, companyName, email, phone, purpose, ipAddress, userAgent, visitedAt)
        VALUES (@id, @visitorName, @companyName, @email, @phone, @purpose, @ipAddress, @userAgent, GETUTCDATE())
      `);
    } catch (e) {
      console.error('[DB] Azure SQL recordVisitorLog error:', e);
    }
  }

  const local = ensureLocalData();
  local.visitorLogs.unshift(newLog);
  saveLocalData(local);
  return newLog;
}

export async function getVisitorLogs(): Promise<VisitorLog[]> {
  const pool = await getSqlPool();
  if (pool) {
    try {
      const res = await pool.request().query('SELECT * FROM VisitorLogs ORDER BY visitedAt DESC');
      if (res.recordset) {
        return res.recordset.map((r) => ({
          id: r.id,
          visitorName: r.visitorName,
          companyName: r.companyName,
          email: r.email || undefined,
          phone: r.phone || undefined,
          purpose: r.purpose || undefined,
          ipAddress: r.ipAddress || undefined,
          userAgent: r.userAgent || undefined,
          visitedAt: r.visitedAt?.toISOString() || new Date().toISOString(),
        }));
      }
    } catch (e) {
      console.error('[DB] Azure SQL getVisitorLogs error:', e);
    }
  }

  const local = ensureLocalData();
  return local.visitorLogs.sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime());
}

export async function deleteVisitorLog(id: string): Promise<boolean> {
  const pool = await getSqlPool();
  if (pool) {
    try {
      const req = pool.request();
      req.input('id', sql.NVarChar(50), id);
      await req.query('DELETE FROM VisitorLogs WHERE id = @id');
    } catch (e) {
      console.error('[DB] Azure SQL deleteVisitorLog error:', e);
    }
  }

  const local = ensureLocalData();
  const filtered = local.visitorLogs.filter((item) => item.id !== id);
  if (filtered.length !== local.visitorLogs.length) {
    local.visitorLogs = filtered;
    saveLocalData(local);
    return true;
  }
  return false;
}

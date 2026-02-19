'use server';

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { cookies } from "next/headers";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// --------------------------------------------------
// ESSENTIAL
// --------------------------------------------------
async function getDB() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });
}

export async function createUser(userData, plainPassword) {
  const db = await getDB();
  
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    // Format the date from "12/19/2025" to "2025-12-19" for MySQL
    const dateParts = userData.account_created.split('/');
    const formattedDate = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`;

    const [result] = await db.execute(
      `INSERT INTO users (name, email, password, profile_picture, account_created) 
       VALUES (?, ?, ?, ?, ?)`,
      [userData.name, userData.email, hashedPassword, userData.picture, formattedDate]
    );

    return { success: true, userId: result.insertId };
  } catch (error) {
    console.error("Signup Error Details:", error);
    
    if (error.code === 'ER_DUP_ENTRY') {
        return { success: false, error: "Email already exists." };
    }

    return { success: false, error: error.message || "Database insertion failed." };
  } finally {
    await db.end();
  }
}

export async function validateUser(email, passwordAttempt) {
  const db = await getDB();

  try {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return { success: false, error: "User not found" };
    }

    const user = rows[0];

    //Compare the plain text attempt with the hashed password in the DB
    const isValid = await bcrypt.compare(passwordAttempt, user.password);

    if (isValid) {
      
      const cookieStore = await cookies();
      cookieStore.set("userId", user.id.toString(), {
        httpOnly: true,     
        secure: process.env.NODE_ENV === "production", 
        maxAge: 60 * 60 * 24 * 3, // 3 days
        path: "/",          
        sameSite: "lax",
      });

      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      return { success: true, user: userWithoutPassword };
    } else {
      return { success: false, error: "Incorrect password" };
    }
  } catch (error) {
    return { success: false, error: "Server error" + error };
  } finally {
    await db.end();
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId");
  
  if (!userId) return null;

  return { id: userId.value };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("userId");
}

// --------------------------------------------------
// CREATE
// --------------------------------------------------


export async function uploadProfilePicture(formData) {
  try {
    const file = formData.get('picture');
    
    if (!file || file.size === 0) {
      return { success: true, filename: 'default.jpg' };
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, filename: 'default.jpg' };
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, filename: 'default.jpg' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const originalExt = file.name.split('.').pop().toLowerCase();
    const secureFilename = `${uuidv4()}_${Date.now()}.${originalExt}`;
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    
    const filepath = path.join(uploadDir, secureFilename);
    await writeFile(filepath, buffer);
    
    console.log(`File saved: ${secureFilename}`);
    return { success: true, filename: secureFilename };
    
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, filename: 'default.jpg' };
  }
}

export async function createProject(userID, title) {
  const db = await getDB();

  try {
    await db.beginTransaction();

    const [result] = await db.execute(
      `INSERT INTO projects (title) 
       VALUES (?)`,
      [title]
    );

    const projectID = result.insertId;
    await createProjectMember(db, userID, projectID, "admin");

    await db.commit();

    return { success: true, projectID };

  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.end();
  }
}

export async function createProjectMember(db, userID, projectID, role) {
  const [result] = await db.execute(
    `INSERT INTO project_members (user_id, project_id, role) 
      VALUES (?, ?, ?)`,
    [userID, projectID, role]
  );

  return result;
}

export async function shareProject(userID, projectID, role) {
  const db = await getDB();

  try {
    await db.beginTransaction();

    await createProjectMember(db, userID, projectID, role);

    await db.commit();

    return { success: true};

  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.end();
  }
}

export async function createBoard(projectId, title, date) {
  const db = await getDB();

  try {
    await db.beginTransaction();

    const [result] = await db.execute(
      `INSERT INTO boards (project_id, title, due_date) 
       VALUES (?, ?, ?)`,
      [Number(projectId), title, date || null]
    );

    await db.commit();

    return { success: true};

  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.end();
  }
}

// --------------------------------------------------
// READ
// --------------------------------------------------

export async function getUsersName(userID) {
    const db = await getDB(); 

    try {
        const [rows] = await db.execute(
            "SELECT name FROM users WHERE id = ? LIMIT 1",
            [userID]
        );

        if (rows.length === 0) {
            return { success: false, error: "User not found" };
        }

        return rows[0].name;

    } catch (error) {
        console.error("Database error:", error);
        return { success: false, error: "Database connection failed" };
    } finally {
        await db.end();
    }
}

export async function getPhoto(userID) {
  const db = await getDB();

  try {
    const [rows] = await db.execute(
      "SELECT profile_picture FROM users WHERE id = ? LIMIT 1",
      [userID]
    )

    if (rows.length === 0) {
      return { success: false, error: "User not found" };
    }

    return rows[0].profile_picture;
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.end();
  }
}

export async function getUserIDFromName(name) {
  const db = await getDB();

  try {
    const [rows] = await db.execute(
      "SELECT id FROM users WHERE name = ? LIMIT 1",
      [name]
    )

    if (rows.length === 0) {
      return { success: false, error: "User not found" };
    }

    return rows[0].id;
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.end();
  }
}

export async function getEmail(userID) {
  const db = await getDB();

  try {
    const [rows] = await db.execute(
      "SELECT email FROM users WHERE id = ? LIMIT 1",
      [userID]
    )

    if (rows.length === 0) {
      return { success: false, error: "User not found" };
    }

    return rows[0].email;
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.end();
  }
}

export async function getAccountCreated(userID) {
  const db = await getDB();

  try {
    const [rows] = await db.execute(
      "SELECT account_created FROM users WHERE id = ? LIMIT 1",
      [userID]
    )

    if (rows.length === 0) {
      return { success: false, error: "User not found" };
    }

    return rows[0].account_created;
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.end();
  }
}

export async function getProjectMembers(userID) {
  const db = await getDB();

  try {
    const [rows] = await db.execute(
      "SELECT * FROM project_members WHERE user_id = ?",
      [userID]
    )

    return rows;
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.end();
  }
}

export async function getProject(projectID) {
  const db = await getDB();

  try {
    const [rows] = await db.execute(
      "SELECT * FROM projects WHERE id = ?",
      [projectID]
    );

    return rows[0] ?? null;

  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.end();
  }
}

export async function getBoards(projectID) {
  const db = await getDB();

  try {
    const [rows] = await db.execute(
      "SELECT * FROM boards WHERE project_id = ?",
      [projectID]
    );

    return { success: true, data: rows };

  } catch (error) {
    console.error("Database error:", error);
    return { success: false, data: [], error: "Database connection failed" };
  }
}

export async function getAllProjects(userID) {
  const db = await getDB();

  try {
    const [rows] = await db.execute(
      "SELECT p.* FROM projects p JOIN project_members pm ON pm.project_id = p.id WHERE pm.user_id = ?",
      [userID]
    );

    return rows.map(row => ({ ...row }));
  } finally {
    await db.end();
  }
}

// --------------------------------------------------
// UPDATE
// --------------------------------------------------

// --------------------------------------------------
// DELETE
// --------------------------------------------------


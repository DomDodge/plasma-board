'use server';

//import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { cookies } from "next/headers";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// --------------------------------------------------
// ESSENTIAL
// --------------------------------------------------
async function getDB() {
  const db = await open({
    filename: path.resolve(process.cwd(), 'database.db'), // Use absolute path
    driver: sqlite3.Database
  });

  await db.exec("PRAGMA foreign_keys = ON;");
  return db;
}

// MYSQL version
// async function getDB() {
//   return await mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME,
//   });
// }

export async function createUser(userData, plainPassword) {
  const db = await getDB();
  
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    // Format the date from "12/19/2025" to "2025-12-19" for MySQL
    const dateParts = userData.account_created.split('/');
    const formattedDate = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`;

    const result = await db.run(
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
    await db.close();
  }
}

export async function validateUser(email, passwordAttempt) {
  const db = await getDB();

  try {
    const rows = await db.all(
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
    await db.close();
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

    const maxSize = 20 * 1024 * 1024;
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
    await db.exec('BEGIN');

    const result = await db.run(
      `INSERT INTO projects (title) VALUES (?)`,
      [title]
    );

    const projectID = result.lastID;

    await createProjectMember(db, userID, projectID, "admin");
    await db.exec('COMMIT');

    return { success: true, projectID };

  } catch (error) {
    await db.exec('ROLLBACK');
    
    console.error("Actual SQL Error:", error.message);
    return { success: false, error: error.message };
  } finally {
    await db.close();
  }
}
export async function createProjectMember(db, userID, projectID, role) {
  if (!userID || !projectID) throw new Error("Missing User or Project ID");

  return await db.run(
    `INSERT INTO project_members (user_id, project_id, role) 
      VALUES (?, ?, ?)`,
    [userID, projectID, role]
  );
}

export async function shareProject(userID, projectID, role) {
  const db = await getDB();

  try {
    await db.exec('BEGIN');

    await createProjectMember(db, userID, projectID, role);

    await db.exec('COMMIT');

    return { success: true};

  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.close();
  }
}

export async function createBoard(projectId, title, date) {
  const db = await getDB();

  try {
    await db.exec('BEGIN');

    await db.run(
      `INSERT INTO boards (project_id, title, due_date) 
       VALUES (?, ?, ?)`,
      [Number(projectId), title, date || null]
    );

    await db.exec('COMMIT');

    return { success: true};

  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.close();
  }
}

export async function createTask(boardId, title) {
  const db = await getDB();

  try {
    await db.exec('BEGIN');

    await db.run(
      `INSERT INTO tasks (board_id, title, status) 
       VALUES (?, ?, ?)`,
      [Number(boardId), title, 'incomplete']
    );

    await db.exec('COMMIT');

    return { success: true};

  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.close();
  }
}

// --------------------------------------------------
// READ
// --------------------------------------------------

export async function getUsersName(userID) {
    const db = await getDB(); 

    try {
        const rows = await db.all(
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
        await db.close();
    }
}

export async function getPhoto(userID) {
  const db = await getDB();

  try {
    const rows = await db.all(
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
    await db.close();
  }
}

export async function getUserIDFromName(name) {
  const db = await getDB();

  try {
    const rows = await db.all(
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
    await db.close();
  }
}

export async function getEmail(userID) {
  const db = await getDB();

  try {
    const rows = await db.all(
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
    await db.close();
  }
}

export async function getAccountCreated(userID) {
  const db = await getDB();

  try {
    const rows = await db.all(
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
    await db.close();
  }
}

export async function getUserRole(userID, projectID) {
  let db;
  try {
    db = await getDB();
    const rows = await db.all(
      "SELECT role FROM project_members WHERE user_id = ? AND project_id = ?",
      [userID, projectID]
    );

    return rows[0]?.role; 
    
  } catch (error) {
    console.error("Database error:", error);
    return "guest"; 
  } finally {
    if (db) await db.close();
  }
}
export async function getProjectMembers(userID) {
  const db = await getDB();

  try {
    const rows = await db.all(
      "SELECT * FROM project_members WHERE user_id = ?",
      [userID]
    )

    return rows;
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.close();
  }
}

export async function getAllMembers(projectId) {
  const db = await getDB();

  try {
    const rows = await db.all(
      "SELECT * FROM project_members WHERE project_id = ? AND role != 'pending'",
      [projectId]
    )

    return rows;
  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.close();
  }
}

export async function getProject(projectID) {
  const db = await getDB();

  try {
    const rows = await db.all(
      "SELECT * FROM projects WHERE id = ?",
      [projectID]
    );

    return rows[0] ?? null;

  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.close();
  }
}
export async function getProjectName(projectID) {
  const db = await getDB();
  try {

    const row = await db.get(
      "SELECT title FROM projects WHERE id = ?",
      [projectID]
    );

    return row ? row.title : null; 

  } catch (error) {
    console.error("DB Error:", error);
    return null;
  } finally {
    await db.close();
  }
}

export async function getBoards(projectID) {
  const db = await getDB();

  try {
    const rows = await db.all(
      "SELECT * FROM boards WHERE project_id = ?",
      [projectID]
    );

    return { success: true, data: rows };

  } catch (error) {
    console.error("Database error:", error);
    return { success: false, data: [], error: "Database connection failed" };
  } finally {
    await db.close();
  }
}

export async function getTasks(boardId) {
  const db = await getDB();

  try {
    const rows = await db.all(
      "SELECT * FROM tasks WHERE board_id = ?",
      [boardId]
    );

    return { success: true, data: rows };

  } catch (error) {
    console.error("Database error:", error);
    return { success: false, data: [], error: "Database connection failed" };
  } finally {
    await db.close();
  }
}

export async function getAllProjects(userID) {
  const db = await getDB();

  try {
    const rows = await db.all(
      "SELECT p.* FROM projects p JOIN project_members pm ON pm.project_id = p.id WHERE pm.user_id = ?",
      [userID]
    );

    return rows.map(row => ({ ...row }));
  } finally {
    await db.close();
  }
}

// --------------------------------------------------
// UPDATE
// --------------------------------------------------

export async function editProject(projectId, title) {
  const db = await getDB();

  try {
    await db.exec('BEGIN');

    await db.run(
      `UPDATE projects SET title = ? WHERE id = ?`,
      [title, Number(projectId)]
    );

    await db.exec('COMMIT');

    return { success: true};

  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.close();
  }
}

export async function updateTask(taskId, status) {
  const db = await getDB();

  try {
    await db.exec('BEGIN');

    await db.run(
      `UPDATE tasks SET status = ? WHERE id = ?`,
      [status, Number(taskId)]
    );

    await db.exec('COMMIT');

    return { success: true};

  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.close();
  }
}

export async function updateUserRole(userId, projectId, role) {
  if(role === 'remove') {
    return await deleteMember(userId, projectId);
  }

  const db = await getDB();

  try {
    await db.exec('BEGIN');

    await db.run(
      `UPDATE project_members SET role = ? WHERE user_id = ? AND project_id = ?`,
      [role, Number(userId), Number(projectId)]
    );

    await db.exec('COMMIT');

    return { success: true};

  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.close();
  }
}

export async function updateProfilePicture(userId, formData) {
  const uploadResult = await uploadProfilePicture(formData);

  console.log("called");
  if (!uploadResult.success) {
    return { success: false, error: "Upload failed" };
  }
  console.log("returned");

  const db = await getDB();
  try {
    await db.run(
      `UPDATE users SET profile_picture = ? WHERE id = ?`,
      [uploadResult.filename, userId]
    );
    return { success: true, filename: uploadResult.filename };
  } catch (error) {
    return { success: false, error: "Database update failed " + error };
  }
}

// --------------------------------------------------
// DELETE
// --------------------------------------------------

export async function deleteProject(projectId) {
  const db = await getDB();

  try {
    await db.exec('BEGIN');

    const id = Number(projectId);

    await db.run(
      `DELETE FROM tasks WHERE board_id IN (SELECT id FROM boards WHERE project_id = ?)`,
      [id]
    );

    await db.run(
      `DELETE FROM boards WHERE project_id = ?`,
      [id]
    );

    await db.run(
      `DELETE FROM project_members WHERE project_id = ?`,
      [id]
    );

    await db.run(
      `DELETE FROM projects WHERE id = ?`,
      [id]
    );

    await db.exec('COMMIT');
    return { success: true };

  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.close();
  }
}

export async function deleteMember(userId, projectId) {
  const db = await getDB();

  try {
    await db.exec('BEGIN');

    await db.run(
      `DELETE FROM project_members WHERE user_id = ? AND project_id = ?`,
      [Number(userId), Number(projectId)]
    );

    await db.exec('COMMIT');

    return { success: true};

  } catch (error) {
    console.error("Database error:", error);
    return { success: false, error: "Database connection failed" };
  } finally {
    await db.close();
  }
}

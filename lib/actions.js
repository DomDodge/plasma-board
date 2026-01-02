'use server';

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// ESSENTIAL
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
      `INSERT INTO users (name, email, password, picture, account_created) 
       VALUES (?, ?, ?, ?, ?)`,
      [userData.name, userData.email, hashedPassword, userData.picture, formattedDate]
    );

    return { success: true, userId: result.insertId };
  } catch (error) {
    console.error("Signup Error:", error);
    return { success: false, error: "Email might already exist." };
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
      // Return user data (excluding the password for safety)
      const { password, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword };
    } else {
      return { success: false, error: "Incorrect password" };
    }
  } catch (error) {
    return { success: false, error: "Server error" };
  } finally {
    await db.end();
  }
}

// CREATE

// READ

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

// UPDATE

// DELETE


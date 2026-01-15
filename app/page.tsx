"use client";

import { useState, useEffect } from "react";
import { validateUser, createUser, getSession, uploadProfilePicture, getAllProjects } from "@/lib/actions";
import RightBar from "./RightBar";

interface Session {
  id: string;
}

interface Project {
  id: number;
  title: string;
  date_created: string;
}

// PROGRAM START 
export default function Home() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const currentSession = await getSession();
        setSession(currentSession);
      } catch (err) {
        console.error("Session check failed:", err);
      }
    }
    
    checkSession();
  }, []);

  return (
    <div id={"container"}>
      <Login session={session}/>
      <LeftBar session={session}/>
      <RightBar />
    </div>
  )
}

function LeftBar({ session }: { session: Session | null }) {
  return (
    <div className={"left"}>
      <div className={"logo"}>
        <h1>PLASMA</h1>
        <h2>BOARDS</h2>
      </div>
      <UserBoards session={session}/>
    </div>
  )
}

function UserBoards({ session }: { session: Session | null }) {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!session?.id) return;

    async function getProjects() {
      try {
        const projects = await getAllProjects(Number(session?.id));
        setProjects(projects);
      } catch (err) {
        console.error(err);
      }
    }

    getProjects();
  }, [session?.id]);

  return (
    <div className={"userBoards"}>
      <h2>Boards</h2>

      <ul>
        {projects.map(p => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
    </div>
  )
}

function Login({ session }: { session: Session | null }) {
  const [signingUp, setSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (session?.id) {
    return null;
  }

async function handleSignUp(formData: FormData) {
  setLoading(true);
  setError("");

  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const pictureFile = (formData.get("picture")) ? formData.get("picture") : null;

  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  }).format(today);

  let uploadResult = {
    success: true,
    filename: "default.jpg"
  };

  if(pictureFile != null) {
    const uploadFormData = new FormData();
    uploadFormData.append('picture', pictureFile);
    
    uploadResult = await uploadProfilePicture(uploadFormData);
    
    if (!uploadResult.success) {
      setLoading(false);
      return;
    }
  }

  // Step 2: Create user data with the secure filename
  const userData = {
    name: name,
    email: email,
    account_created: formattedDate,
    picture: uploadResult.filename
  };

  // Step 3: Create user in database
  const result = await createUser(userData, password);

  if (result.success) {
    alert(`Account created! Welcome, ${name}!`);
    await validateUser(email, password);
    window.location.reload();

  } else {
    setError(result.error || "An unknown error has occurred");
  }
  setLoading(false);
}

  async function handleLogin(formData: FormData) {
    setLoading(true);
    setError("");

    const email = formData.get("email");
    const password = formData.get("password");

    const result = await validateUser(email, password);

    if (result.success) {
      alert(`Welcome back, ${result.user.name}!`);
      window.location.reload();
    } else {
      setError(result.error || "An unknown error has occured");
    }
    setLoading(false);
  }

  return (
    <div>
      <div className={"blurryBackground"}></div>

      {!signingUp ? (
        <form action={handleLogin}>
          <h2>Login</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          
          <label>Email</label>
          <input name="email" type="email" required />
          
          <label>Password</label>
          <input name="password" type="password" required />
          
          <div className={"row"}>
            <button type="button" onClick={() => setSignUp(true)} className="signBtn">
              SIGN UP
            </button>
            <button type="submit" className="shareBtn" disabled={loading}>
              {loading ? "Checking..." : "LOGIN"}
            </button>
          </div>
        </form>
      ) : (
        <form action={handleSignUp}>
          <h2>Sign Up</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          
          <label>Name</label>
          <input name="name" type="text" required />

          <label>Email</label>
          <input name="email" type="email" required />
          
          <label>Password</label>
          <input name="password" type="password" required />

          <label>Profile Picture</label>
          <input name="picture" type="file" />

          <div className={"row"}>
            <button type="button" onClick={() => setSignUp(false)} className="cancelBtn">BACK</button>
            <button type="submit" className="shareBtn" disabled={loading}>
              {loading ? "Checking..." : "SIGN UP"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

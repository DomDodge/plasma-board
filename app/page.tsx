"use client";

import { useState } from "react";
import { validateUser, createUser, getSession } from "@/lib/actions";
import RightBar from "./RightBar";

// PROGRAM START 
export default function Home() {
  return (
    <div id={"container"}>
      <Login />
      <LeftBar />
      <RightBar />
    </div>
  )
}

function LeftBar() {
  return (
    <div className={"left"}>
      <div className={"logo"}>
        <h1>PLASMA</h1>
        <h2>BOARDS</h2>
      </div>
      <UserBoards />
    </div>
  )
}

function UserBoards() {
  return (
    <div className={"userBoards"}>
      <h2>Boards</h2>

      <ul>
        <li>Weekly Tasks</li>
        <li>Monthly Goals</li>
        <li>Habits</li>
      </ul>
      <h2>Shared Boards</h2>
      
      <ul>
        <li>Throw Bro Update</li>
        <li>FREDs Bits and Parts</li>
        <li>Gnorbert</li>
      </ul>
    </div>
  )
}

function Login() {
  const [signingUp, setSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const session = getSession();
  if(session != null) {
    return;
  }

  async function handleSignUp(formData: FormData) {
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const picture = "default";

    const today = new Date();

    const formattedDate = new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).format(today);

    const data = {
      name : name,
      email : email,
      account_created: formattedDate,
      picture: picture
    }

    const result = await createUser(data, password);

    if (result.success) {
      window.location.reload();
    } else {
      setError(result.error || "An unknown error has occured");
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

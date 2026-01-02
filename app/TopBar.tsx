"use client";

import { useState, useEffect } from "react";
import { getSession, getUsersName } from "@/lib/actions";

type TopBarProps = {
  onNew: () => void;
  onShare: () => void;
};

export default function TopBar({ onNew, onShare }: TopBarProps) {
  const [name, setName] = useState<string>("Loading...");
  const [image, setImage] = useState<string>("default.jpg");

  useEffect(() => {
    async function loadUser() {
      const session = await getSession();
      if (session && session.id) {
        const userName = await getUsersName(session.id); 
        setName(userName);
      } else {
        setName("Guest");
        setImage("default.jpg")
      }
    }
    loadUser();
  }, []);

  return (
    <div className="topBar">
      <div>
        <button className="shareBtn" onClick={onShare}>SHARE</button>
        <button className="newBtn" onClick={onNew}>NEW</button>
      </div>

      <div>
        <h3>{name}</h3>
        <img src={`@/images/uploads/${image}`} className="profilePic" alt="profile" />
      </div>
    </div>
  );
}

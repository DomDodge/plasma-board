"use client";

import { useState, useEffect } from "react";
import { getSession, getUsersName, getPhoto } from "@/lib/actions";

type TopBarProps = {
  onNew: () => void;
  onShare: () => void;
  onAccount: () => void;
};

export default function TopBar({ onNew, onShare, onAccount }: TopBarProps) {
  const [name, setName] = useState<string>("Loading...");
  const [image, setImage] = useState<string>("default.jpg");
  
  useEffect(() => {
    async function loadUser() {
      const session = await getSession();
      if (session && session.id) {
        const userName = await getUsersName(session.id); 
        setName(userName);
        const profilePic = await getPhoto(session.id); 
        setImage(profilePic);
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
        <img src={`/uploads/${image}`} className="profilePic" onClick={onAccount} alt="profile picture" />
      </div>
    </div>
  );
}

"use client";

import { logout } from "@/lib/actions";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'
import { getSession, getUsersName, getPhoto, getEmail, getAccountCreated } from "@/lib/actions";

type ShareBoardProps = {
  onClose: () => void;
};

export default function ShareBoard({ onClose }: ShareBoardProps) {
  const router = useRouter(); 
  
  const [name, setName] = useState<string>("Loading...");
  const [image, setImage] = useState<string>("default.jpg");
  const [email, setEmail] = useState<string>("Loading...");

  useEffect(() => {
    async function loadUserData() {
        const session = await getSession();
        
        if(session && session.id) {
            const name = await getUsersName(session.id);
            setName(name);
            const picture = await getPhoto(session.id);
            setImage(picture);
            const email = await getEmail(session.id);
            setEmail(email);
        }
        else {
            setName("Guest");
        }
        
    }
      loadUserData();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  return (
    <form>
      <h2>My Account</h2>
      <div className={"row"}>
        <img src={`/uploads/${image}`} className={"accountImage"}></img>
        <div className={"column"}>
            <h2>{name}</h2>
            <h2>{email}</h2>
        </div>
      </div>
      <div className={"row"}>
        <button type="button" className="cancelBtn" onClick={onClose}>RETURN</button>
        <button type="submit" className="newBtn" onClick={handleLogout}>LOG OUT</button>
      </div>
    </form>
  );
}
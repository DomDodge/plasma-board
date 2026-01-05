"use client";

import { logout } from "@/lib/actions";
import { useRouter } from 'next/navigation';

type ShareBoardProps = {
  onClose: () => void;
};

export default function ShareBoard({ onClose }: ShareBoardProps) {
  const router = useRouter(); 

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  return (
    <form>
      <h2>My Account</h2>
      <div className={"row"}>
        <button type="button" className="cancelBtn" onClick={onClose}>RETURN</button>
        <button type="submit" className="newBtn" onClick={handleLogout}>LOG OUT</button>
      </div>
    </form>
  );
}
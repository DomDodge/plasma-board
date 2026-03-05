"use client";

import { logout, updateProfilePicture } from "@/lib/actions"; // Added updatePhotoInDb
import { useRouter } from 'next/navigation';
import { useEffect, useState, ChangeEvent } from 'react';
import { getSession, getUsersName, getPhoto, getEmail } from "@/lib/actions";

type ShareBoardProps = {
  onClose: () => void;
  onLogOut: () => void;
};

export default function ShareBoard({ onClose, onLogOut }: ShareBoardProps) {
  const router = useRouter(); 
  
  const [name, setName] = useState<string>("Loading...");
  const [image, setImage] = useState<string>("default.jpg");
  const [email, setEmail] = useState<string>("Loading...");
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserData() {
        const session = await getSession();
        
        if(session && session.id) {
            setUserId(session.id);
            const userName = await getUsersName(session.id);
            setName(userName);
            const picture = await getPhoto(session.id);
            setImage(picture);
            const userEmail = await getEmail(session.id);
            setEmail(userEmail);
        } else {
            setName("Guest");
        }
    }
    loadUserData();
  }, []);

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !userId) return;

    setLoading(true);
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append('picture', file);
    formData.append('userId', userId); // <-- Add the ID here

    try {
      const result = await updateProfilePicture(userId, formData);
      
      if (result.success && result.filename) {
        setImage(result.filename);
        alert("Success!");
      }
    } catch (err) {
      console.error(err);
      alert("Check server logs - the request was reset.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    await logout();
    onLogOut();
    onClose();
    router.refresh();
  };

  return (
    <form> {/* Changed from form to div to avoid nesting issues */}
      <h2>My Account</h2>
      <div className={"row"}>
        <div className="image-container" style={{ position: 'relative' }}>
          <img 
            src={`/uploads/${image}`} 
            className={"accountImage"} 
            alt="Profile" 
            style={{ opacity: loading ? 0.5 : 1 }}
          />
          {loading && <div className="loader-overlay">Updating...</div>}
        </div>
        
        <div className={"column"}>
            <h2>{name}</h2>
            <p>{email}</p>
            
            {/* Photo Upload Logic */}
            <label className="upload-label" style={{ marginTop: '10px', fontSize: '0.8rem', cursor: 'pointer', color: '#0070f3' }}>
              {loading ? "Uploading..." : "Change Photo"}
              <input 
                type="file" 
                hidden 
                accept="image/*" 
                onChange={handlePhotoChange} 
                disabled={loading}
              />
            </label>
        </div>
      </div>

      <div className={"row"} style={{ marginTop: '20px' }}>
        <button type="button" className="cancelBtn" onClick={onClose}>RETURN</button>
        <button type="button" className="newBtn" onClick={handleLogout}>LOG OUT</button>
      </div>
    </form>
  );
}
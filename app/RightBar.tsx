"use client";

import { useState, useEffect } from "react";
import { getUserRole, getProjectName, updateUserRole, deleteMember } from "@/lib/actions";
import TopBar from "./TopBar";
import NewBoard from "./NewBoard";
import BlurryBackground from "./BlurryBackground";
import ShareBoard from "./ShareBoard";
import EditBoard from "./EditBoard";
import TaskHolder from "./TaskHolder";
import Account from "./Account";

interface RightBarProps {
  newProject: boolean;
  setNewProject: (val: boolean) => void;
  selectedProjectId: string;
  onNullProject: () => void;
  onLogOut: () => void;
  userId: number;
}

export default function RightBar({ newProject, setNewProject, selectedProjectId, onNullProject, onLogOut, userId }: RightBarProps) {
  const [shareBoard, setShareBoard] = useState(false);
  const [accountInfo, setAccountInfo] = useState(false);
  const [editBoard, setEditBoard] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("");
  
  useEffect(() => {
    async function loadRole() {
      const role = await getUserRole(userId, selectedProjectId);
      const proTitle = await getProjectName(selectedProjectId);
      
      if(proTitle != null && proTitle.title) {
        setTitle(proTitle.title || '');
      }
      
      if(role === 'admin') {
        setCanEdit(true);
      } else {
        setCanEdit(false);
        if(role === 'pending') {
          setPending(true);
        }
      }
    }

    loadRole()
  }, [selectedProjectId, userId])

  async function handleAccept() {
    await updateUserRole(userId, selectedProjectId, 'member');
    setPending(false);
  }

  async function handleReject() {
    await deleteMember(userId, selectedProjectId);
    setTitle('');
    setPending(false);
    onNullProject();
  }

  return (
    <div className="right">
      <TopBar
        onNew={() => setNewProject(true)}
        onShare={() => setShareBoard(true)}
        onAccount={() => setAccountInfo(true)}
        onEdit={() => setEditBoard(true)}
        canEdit={canEdit}
        projectId={selectedProjectId}
      />

      { pending ?
        (<div className={"centeredDiv"}>
          <h3>You are invited to collaborate on:</h3>
          <h2>{title}</h2>
          <div className={"row"}>
            <button type="button" className="cancelBtn" onClick={handleReject}>REJECT</button>
            <button type="submit" className="shareBtn" onClick={handleAccept}>ACCEPT</button>
          </div>
        </div>) 
      :
        selectedProjectId ? (
          <TaskHolder projectId={selectedProjectId} />
        ) : (
          <div className="welcomeMessage">Welcome to Plasma Boards</div>
        )
      }
    

      {(newProject || shareBoard || accountInfo || editBoard) && <BlurryBackground /> }

      {newProject && <NewBoard onClose={() => setNewProject(false)} />}
      {shareBoard && <ShareBoard onClose={() => setShareBoard(false)} projectId={selectedProjectId} />}
      {accountInfo && <Account onClose={() => setAccountInfo(false)} onLogOut={onLogOut} />}
      {editBoard && <EditBoard onClose={() => setEditBoard(false)} onNullProject={onNullProject} projectId={selectedProjectId} />}
    </div>
  );
}


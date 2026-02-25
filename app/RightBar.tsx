"use client";

import { useState } from "react";
import { getUserRole } from "@/lib/actions";
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
  userId: number;
}

export default function RightBar({ newProject, setNewProject, selectedProjectId, onNullProject, userId }: RightBarProps) {
  const [shareBoard, setShareBoard] = useState(false);
  const [accountInfo, setAccountInfo] = useState(false);
  const [editBoard, setEditBoard] = useState(false);

  async function getRole() {
    return await getUserRole(userId, selectedProjectId);
  }

  return (
    <div className="right">
      <TopBar
        onNew={() => setNewProject(true)}
        onShare={() => setShareBoard(true)}
        onAccount={() => setAccountInfo(true)}
        onEdit={() => setEditBoard(true)}
        userRole={getRole()}
        projectId={selectedProjectId}
      />

      {selectedProjectId ? (
        <TaskHolder projectId={selectedProjectId} />
      ) : (
        <div className="welcomeMessage">Welcome to Plasma Boards</div>
      )}
      

      {(newProject || shareBoard || accountInfo || editBoard) && <BlurryBackground /> }

      {newProject && <NewBoard onClose={() => setNewProject(false)} />}
      {shareBoard && <ShareBoard onClose={() => setShareBoard(false)} projectId={selectedProjectId} />}
      {accountInfo && <Account onClose={() => setAccountInfo(false)} />}
      {editBoard && <EditBoard onClose={() => setEditBoard(false)} onNullProject={onNullProject} projectId={selectedProjectId} />}
    </div>
  );
}


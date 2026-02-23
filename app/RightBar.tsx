"use client";

import { useState } from "react";
import TopBar from "./TopBar";
import NewBoard from "./NewBoard";
import BlurryBackground from "./BlurryBackground";
import ShareBoard from "./ShareBoard";
import TaskHolder from "./TaskHolder";
import Account from "./Account";

interface RightBarProps {
  newProject: boolean;
  setNewProject: (val: boolean) => void;
  selectedProjectId: string;
}

export default function RightBar({ newProject, setNewProject, selectedProjectId }: RightBarProps) {
  const [shareBoard, setShareBoard] = useState(false);
  const [accountInfo, setAccountInfo] = useState(false);

  return (
    <div className="right">
      <TopBar
        onNew={() => setNewProject(true)}
        onShare={() => setShareBoard(true)}
        onAccount={() => setAccountInfo(true)}
        projectId={selectedProjectId}
      />

      {selectedProjectId ? (
        <TaskHolder projectId={selectedProjectId} />
      ) : (
        <div className="welcomeMessage">Welcome to Plasma Boards</div>
      )}
      

      {(newProject || shareBoard || accountInfo) && <BlurryBackground /> }

      {newProject && <NewBoard onClose={() => setNewProject(false)} />}
      {shareBoard && <ShareBoard onClose={() => setShareBoard(false)} projectId={selectedProjectId} />}
      {accountInfo && <Account onClose={() => setAccountInfo(false)} />}
    </div>
  );
}


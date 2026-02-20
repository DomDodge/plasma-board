"use client";

import { useState } from "react";
import TopBar from "./TopBar";
import NewBoard from "./NewBoard";
import BlurryBackground from "./BlurryBackground";
import ShareBoard from "./ShareBoard";
import TaskHolder from "./TaskHolder";
import Account from "./Account";

export default function RightBar({ selectedProjectId }: {selectedProjectId: string}) {
  const [newBoard, setNewBoard] = useState(false);

  const [shareBoard, setShareBoard] = useState(false);
  const [accountInfo, setAccountInfo] = useState(false);

  return (
    <div className="right">
      <TopBar
        onNew={() => setNewBoard(true)}
        onShare={() => setShareBoard(true)}
        onAccount={() => setAccountInfo(true)}
        projectId={selectedProjectId}
      />

      {selectedProjectId ? (
        <TaskHolder projectId={selectedProjectId} />
      ) : (
        <div className="welcomeMessage">Welcome to Plasma Boards</div>
      )}
      

      {(newBoard || shareBoard || accountInfo) && <BlurryBackground /> }

      {newBoard && <NewBoard onClose={() => setNewBoard(false)} />}
      {shareBoard && <ShareBoard onClose={() => setShareBoard(false)} projectId={selectedProjectId} />}
      {accountInfo && <Account onClose={() => setAccountInfo(false)} />}
    </div>
  );
}


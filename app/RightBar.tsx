"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import TopBar from "./TopBar";
import NewBoard from "./NewBoard";
import BlurryBackground from "./BlurryBackground";
import ShareBoard from "./ShareBoard";
import TaskHolder from "./TaskHolder";
import Account from "./Account";

export default function RightBar() {
  const [newBoard, setNewBoard] = useState(false);

  const [shareBoard, setShareBoard] = useState(false);
  const [accountInfo, setAccountInfo] = useState(false);
  const searchParams = useSearchParams();
  
  // Get the 'projectId' from the URL (?projectId=123)
  const selectedProjectId = searchParams.get("projectId");
  
  return (
    <div className="right">
      <TopBar
        onNew={() => setNewBoard(true)}
        onShare={() => setShareBoard(true)}
        onAccount={() => setAccountInfo(true)}
      />

      {selectedProjectId ? (
        <TaskHolder projectId={selectedProjectId} />
      ) : (
        <div className="empty-state">Please select a board from the left.</div>
      )}
      

      {(newBoard || shareBoard || accountInfo) && <BlurryBackground /> }

      {newBoard && <NewBoard onClose={() => setNewBoard(false)} />}
      {shareBoard && <ShareBoard onClose={() => setShareBoard(false)} projectId={selectedProjectId} />}
      {accountInfo && <Account onClose={() => setAccountInfo(false)} />}
    </div>
  );
}


"use client";

import { useState } from "react";
import TopBar from "./TopBar";
import NewBoard from "./NewBoard";
import ShareBoard from "./ShareBoard";
import TaskHolder from "./TaskHolder";
import Account from "./Account";

export default function RightBar() {
  const [newBoard, setNewBoard] = useState(false);
  const [shareBoard, setShareBoard] = useState(false);
  const [accountInfo, setAccountInfo] = useState(false);
  
  return (
    <div className="right">
      <TopBar
        onNew={() => setNewBoard(true)}
        onShare={() => setShareBoard(true)}
        onAccount={() => setAccountInfo(true)}
      />

      <TaskHolder />

      {(newBoard || shareBoard || accountInfo) && <BlurryBackground /> }

      {newBoard && <NewBoard onClose={() => setNewBoard(false)} />}
      {shareBoard && <ShareBoard onClose={() => setShareBoard(false)} />}
      {accountInfo && <Account onClose={() => setAccountInfo(false)} />}
    </div>
  );
}

function BlurryBackground() {
    return <div className={"blurryBackground"}></div>
}
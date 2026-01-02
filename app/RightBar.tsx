"use client";

import { useState } from "react";
import TopBar from "./TopBar";
import NewBoard from "./NewBoard";
import ShareBoard from "./ShareBoard";
import TaskHolder from "./TaskHolder";

export default function RightBar() {
  const [newBoard, setNewBoard] = useState(false);
  const [shareBoard, setShareBoard] = useState(false);
  
  return (
    <div className="right">
      <TopBar
        onNew={() => setNewBoard(true)}
        onShare={() => setShareBoard(true)}
      />

      <TaskHolder />

      {(newBoard || shareBoard) && <BlurryBackground /> }

      {newBoard && <NewBoard onClose={() => setNewBoard(false)} />}
      {shareBoard && <ShareBoard onClose={() => setShareBoard(false)} />}
    </div>
  );
}

function BlurryBackground() {
    return <div className={"blurryBackground"}></div>
}
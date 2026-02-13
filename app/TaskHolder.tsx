// Task.tsx
"use client";

import { useEffect, useState } from "react";
import { getProject } from "@/lib/actions";

interface Project {
  id: number;
  title: string;
  date_created: string;
}

interface TaskParams {
  projectId: string;
  onClose: () => void;
}

export default function TaskHolder({ onClose, projectId }: TaskParams) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getProject(Number(projectId));
      setProject(data);
      setLoading(false);
    }
    load();
  }, [projectId]);

  function handleNewBoard() {

  }

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div>
      <div className="taskHolder">
        <TaskSheet />
        <TaskSheet />
        <NewTaskSheet />
      </div>
      <NewBoardForm onClose={onClose}/>
    </div>
  );
}

function TaskSheet() {
  return <div className="task"></div>;
}

function NewTaskSheet() {
  return <div className="newTask">+</div>;
}

function NewBoardForm({onClose}: {onClose: () => void;}) {
    return (
    <form>
      <h2>Share Board</h2>
      <label>Invite Members</label>
      <input type="text" maxLength={30} name="username" placeholder="Enter Username..."/>
      <div className={"row"}>
        <button type="button" className="cancelBtn" onClick={onClose}>CANCEL</button>
        <button type="submit" className="shareBtn">INVITE</button>
      </div>
    </form>
  );
}
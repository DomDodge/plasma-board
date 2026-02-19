// Task.tsx
"use client";

import { useEffect, useState } from "react";
import { getProject, createBoard, getBoards } from "@/lib/actions";
import BlurryBackground from "./BlurryBackground";

interface Project {
  id: number;
  title: string;
  date_created: string;
}

interface Board {
  id: number;
  project_id: number;
  title: string;
  due_date: string;
}

interface TaskParams {
  projectId: string;
  onClose: () => void;
}

export default function TaskHolder({ projectId }: {projectId: string;}) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState(false);
  const [boards, setBoards] = useState<Board[] | null>(null);


  useEffect(() => {
    async function load() {
      const projectData = await getProject(Number(projectId));
      setProject(projectData);
      
      const res = await getBoards(Number(projectId)) as { 
        success: boolean; 
        data: Board[]; 
        error?: string 
      };
      
      if (res.success) {
        setBoards(res.data); 
      } else {
        setBoards([]);
      }
      
      setLoading(false);
    }
    load();
  }, [projectId]);

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div>
      {newTask && <BlurryBackground />}
      <div className="taskHolder">
        {boards?.map((board) => (
          <TaskSheet key={board.id} data={board} />
        ))}
        <NewTaskSheet onSet={() => setNewTask(true)}/>
      </div>
      {newTask && <NewBoardForm projectId={projectId} onClose={() => setNewTask(false)}/>}
    </div>
  );
}

interface TaskSheetProps {
  data: Board;
}
function TaskSheet({ data }: TaskSheetProps) {
  return (
    <div className="task">
      <div className="headerRow"> <h2>{data.title}</h2> <h2>02/27/2026</h2></div>
    </div>
  );
}

function NewTaskSheet({ onSet }: {onSet: () => void;}) {
  return <div className="newTask" onClick={onSet}>+</div>;
}

function NewBoardForm({ projectId, onClose }: TaskParams) {
  async function handleNewBoard(formData: FormData) {
    const title = formData.get("title");
    const date = formData.get("date");

    const res = await createBoard(projectId, title, date);
    console.log(res);
    onClose();
  }

  return (
    <form action={handleNewBoard}>
      <h2>New Board</h2>
      <label>Board Title</label>
      <input type="text" maxLength={30} name="title" required placeholder="Enter Title..."/>
      <input type="date" name="date"/>
      <div className={"row"}>
        <button type="button" className="cancelBtn" onClick={onClose}>CANCEL</button>
        <button type="submit" className="shareBtn">CREATE</button>
      </div>
    </form>
  );
}
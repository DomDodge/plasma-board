// Task.tsx
"use client";

import { useEffect, useState } from "react";
import { getProject, createBoard, getBoards, createTask, getTasks, updateTask } from "@/lib/actions";
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
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [taskName, setTaskName] = useState("");

  function newTask() {
    setCreating(false);
    createTask(data.id, taskName);
    setTaskName("");
  }

  useEffect(() => {
    async function load() {
      const res = await getTasks(Number(data.id)) as { 
        success: boolean; 
        data: Task[]; 
        error?: string 
      };
      
      if (res.success) {
        setTasks(res.data); 
      } else {
        setTasks([]);
      }
    }
    load();
  }, [data, creating]);


  const getStatusColor = (dateInput: Date | string) => {
    const now = new Date();
    const dueDate = new Date(dateInput);
    
    now.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diffInMs = dueDate.getTime() - now.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays < 0) return "red";           
    if (diffInDays <= 3) return "darkorange";
    return "black";                            
  };

  const textColor = getStatusColor(data.due_date);

  return (
    <div className="task">
      <div className="headerRow"> 
        <h2 style={{ color: textColor }}>{data.title}</h2> 
        <h2 style={{ color: textColor }}>
          {new Date(data.due_date).toLocaleDateString()}
        </h2>
      </div>

      <ul>
        {tasks?.map((task) => (
          <BulletPoint key={task.id} data={task} />
        ))}
      </ul>
      
      {!creating ? 
      <div className="newTaskRow" onClick={() => setCreating(!creating)}>+</div>
      :
      <div className="newTaskRow">
        <input value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder={"Task title here..."} type="text"/>
        <button className="addBtn" onClick={newTask}>ADD</button>
      </div>
      }
      
    </div>
  );
}

interface Task {
  id: string;
  board_id: string;
  title: string;
  status: string;
}

interface BulletProp {
  data: Task;
}
function BulletPoint({ data }: BulletProp) {
  return (
    <li className="bulletPoint"><input type="checkbox" /> <h3>{data.title}</h3></li>
  )
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
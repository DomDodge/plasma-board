"use client";

import { useState, useEffect } from 'react';
import { getSession, getAllProjects } from "@/lib/actions"; // Assuming these can be called from client
import RightBar from "./RightBar";
import Login from "./Login";

interface Session {
  id: string;
}

interface Project {
  id: number;
  title: string;
  date_created: string;
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [projects, setProjects] = useState<Project[] | []>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial Data Fetch
  useEffect(() => {
    async function loadData() {
      try {
        const userSession = await getSession();
        setSession(userSession);

        if (userSession?.id) {
          const userProjects = await getAllProjects(Number(userSession.id));
          setProjects(userProjects);
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function swapProject(pid: number) {
    setSelectedProject(prev => (prev === pid ? null : pid));
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div id={"container"}>
      <Login session={session}/>
      <LeftBar session={session} selectedProject={selectedProject} projects={projects} onProject={swapProject} />
      <RightBar selectedProjectId={selectedProject ? selectedProject.toString() : ""}/>
    </div>
  )
}

interface LeftBarProps {
  session: Session | null;
  projects: Project[];
  selectedProject: number | null;
  onProject: (pid: number) => void;
}

function LeftBar({ session, projects, selectedProject, onProject }: LeftBarProps) {
  return (
    <div className={"left"}>
      <div className={"logo"}>
        <h1>PLASMA</h1>
        <h2>BOARDS</h2>
      </div>
      <UserBoards session={session} projects={projects} selectedProject={selectedProject} onProject={onProject} />
    </div>
  )
}

function UserBoards({ session, projects, selectedProject, onProject }: LeftBarProps) {

  return (
    <div className={"userBoards"}>
      <h2>Boards</h2>

      {session?.id &&
        <ul>
          {projects.map((p) => (
            <li 
              key={p.id} 
              onClick={() => onProject(p.id)}
              style={{ 
                cursor: 'pointer',
                fontWeight: selectedProject === p.id ? 'bold' : 'normal',
                color: selectedProject === p.id ? 'cyan' : 'inherit'
              }}
            >
              {p.title}
            </li>
          ))}
        </ul>
      }

    </div>
  )
}
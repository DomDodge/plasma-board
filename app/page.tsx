"use server";

import Link from 'next/link';
import { getSession, getAllProjects } from "@/lib/actions";
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

// PROGRAM START 
export default async function Home() {
  const session = await getSession();
  const projects = session?.id 
    ? await getAllProjects(Number(session.id)) 
    : [];

  console.log(projects);

  return (
    <div id={"container"}>
      <Login session={session}/>
      <LeftBar session={session} projects={projects} />
      <RightBar />
    </div>
  )
}

interface LeftBarProps {
  session: Session | null;
  projects: Project[];
}

function LeftBar({ session, projects }: LeftBarProps) {
  return (
    <div className={"left"}>
      <div className={"logo"}>
        <h1>PLASMA</h1>
        <h2>BOARDS</h2>
      </div>
      <UserBoards session={session} projects={projects}/>
    </div>
  )
}

function UserBoards({ session, projects }: LeftBarProps) {

  return (
    <div className={"userBoards"}>
      <h2>Boards</h2>

      {session?.id &&
        <ul>
          {projects.map((p) => (
            <li key={p.id}>
              {/* This adds ?projectId=1 to your URL */}
              <Link href={`?projectId=${p.id}`}>
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      }

    </div>
  )
}
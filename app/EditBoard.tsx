"use client";

import { useState, useEffect } from "react";
import { editProject, deleteProject, getProject, getAllMembers, getUsersName, updateUserRole } from "@/lib/actions";

interface ProjectMember {
  id: number;
  name: string;
  user_id: string | number;
  project_id: string | number;
  role: string;
}
interface EditBoardProps {
  projectId: string | null;
  onClose: () => void;
  onNullProject: () => void;
}
export default function EditBoard({ projectId, onClose, onNullProject }: EditBoardProps) {
  const [title, setTitle] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [members, setMembers] = useState<ProjectMember[]>([])

  useEffect(() => {
    if (!projectId) return;

    async function fetchAndSetMembers() {
      try {
        const data = await getAllMembers(projectId) as ProjectMember[];
        for (let i = 0; i < data.length; i++) {
          data[i].name = await getUsersName(data[i].user_id);
        }
        setMembers(data);
      } catch (error) {
        console.error("Failed to load members:", error);
      }
    }

    fetchAndSetMembers();
  }, [projectId]);


  function handleDelete() {
    setDeleting(!deleting);
  }

  const handleRoleChange = (memberId: number, newRole: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
  };

  async function handleEdit(formData: FormData) {
    const newTitle = formData.get("title") as string;

    const hasAdmin = members.some((m) => m.role === "admin");
    if (!hasAdmin) {
      alert("Error: The project must have at least one admin.");
      return;
    }

    try {
      await editProject(projectId, newTitle);

      const updatePromises = members.map((m) =>
        updateUserRole(m.user_id, projectId, m.role)
      );
      await Promise.all(updatePromises);

      onNullProject();
      onClose();
    } catch (error) {
      console.error("Failed to update board:", error);
    }
  }

  useEffect(() => {
    async function loadProject() {
      const project = await getProject(projectId);
      if (project && project.title) {
        setTitle(project.title);
      } else {
        setTitle("project name");
      }
    }

    loadProject();
  }, [projectId]);

  return (
    <div>
      {deleting ? <DeleteBoard projectId={projectId} onClose={onClose} onNullProject={onNullProject} />
      :
      <form action={handleEdit}>
        <h2>Edit Board</h2>
        <label>Title</label>
        <input type="text" maxLength={30} name="title" defaultValue={title}/>
        <ul>
          {members?.map((member) => (
            <li key={member.id}>
              {member.name} : 
              <select 
                value={member.role} 
                onChange={(e) => handleRoleChange(member.id, e.target.value)}
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="remove">Remove</option>
              </select>
            </li>
          ))}
        </ul>
        <div className={"row"}>
          <button type="button" className="cancelBtn" onClick={onClose}>CANCEL</button>
          <button type="button" onClick={handleDelete} className="newBtn">DELETE</button>
          <button type="submit" className="shareBtn">EDIT</button>
        </div>
      </form>
      }
    </div>
  );
}

function DeleteBoard({ projectId, onClose, onNullProject }: EditBoardProps) {
    async function handleDelete() {
      await deleteProject(projectId);
      onNullProject();
      onClose();
  }

  return (
    <form>
      <h2>Are you sure you want to delete this Board?</h2>
      <div className={"row"}>
        <button type="button" className="cancelBtn" onClick={onClose}>CANCEL</button>
        <button type="button" onClick={handleDelete} className="newBtn">DELETE</button>
      </div>
    </form>
  )
}

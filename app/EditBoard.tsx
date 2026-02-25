"use client";

import { useState, useEffect } from "react";
import { editProject, deleteProject, getProject } from "@/lib/actions";

interface EditBoardProps {
  projectId: string | null;
  onClose: () => void;
  onNullProject: () => void;
}
export default function EditBoard({ projectId, onClose, onNullProject }: EditBoardProps) {
  const [title, setTitle] = useState("");

  async function handleDelete() {
      await deleteProject(projectId);
      onNullProject();
      onClose();
  }

  async function handleEdit(formData: FormData) {
      const title = formData.get("title");
      await editProject(projectId, title);
      onNullProject();
      onClose();
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
    <form action={handleEdit}>
      <h2>Edit Board</h2>
      <label>Title</label>
      <input type="text" maxLength={30} name="title" defaultValue={title}/>
      <div className={"row"}>
        <button type="button" className="cancelBtn" onClick={onClose}>CANCEL</button>
        <button type="button" onClick={handleDelete} className="newBtn">DELETE</button>
        <button type="submit" className="shareBtn">EDIT</button>
      </div>
    </form>
  );
}

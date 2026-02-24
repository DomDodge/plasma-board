"use client";

import { editProject, deleteProject } from "@/lib/actions";

interface EditBoardProps {
  projectId: string | null;
  onClose: () => void;
  onNullProject: () => void;
}
export default function EditBoard({ projectId, onClose, onNullProject }: EditBoardProps) {

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

  return (
    <form action={handleEdit}>
      <h2>Edit Board</h2>
      <label>Title</label>
      <input type="text" maxLength={30} name="title" placeholder="John Mataliano"/>
      <div className={"row"}>
        <button type="button" className="cancelBtn" onClick={onClose}>CANCEL</button>
        <button type="submit" onClick={handleDelete} className="newBtn">DELETE</button>
        <button type="submit" className="shareBtn">EDIT</button>
      </div>
    </form>
  );
}

"use client";

import { createProject, getSession } from "@/lib/actions";

type NewBoardProps = {
  onClose: () => void;
};

export default function NewBoard({ onClose }: NewBoardProps) {

  async function handleNewBoard(formData: FormData) {
    const session = await getSession();
    const title = formData.get("title")

    if(session != null) {
      createProject(session.id, title)
      onClose();
    }
  }

  return (
    <form action={handleNewBoard}>
      <h2>New Board</h2>
      <label>Title</label>
      <input type="text" name="title" maxLength={30} />
      <div className={"row"}>
        <button type="button" className="cancelBtn" onClick={onClose}>CANCEL</button>
        <button type="submit" className="shareBtn">CREATE</button>
      </div>
    </form>
  );
}

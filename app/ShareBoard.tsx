"use client";

import { shareProject, getSession, getUserIDFromName } from "@/lib/actions";

interface ShareBoardProps {
  projectId: string | null;
  onClose: () => void;
}
export default function ShareBoard({ projectId, onClose }: ShareBoardProps) {

  async function handleShareBoard(formData: FormData) {
    const session = await getSession();
    const user = formData.get("username")

    const id = await getUserIDFromName(user);

    if(id.success && id.success === false) {
      window.alert("Could not find a user with that name.")
    }
    else {
      if(session != null) {
        shareProject(id, projectId, "member")
        onClose();
      }
    }
  }

  return (
    <form action={handleShareBoard}>
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

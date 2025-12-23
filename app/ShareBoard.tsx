"use client";

type ShareBoardProps = {
  onClose: () => void;
};

export default function ShareBoard({ onClose }: ShareBoardProps) {
  return (
    <form>
      <h2>Share Board</h2>
      <label>Invite Members</label>
      <input type="text" maxLength={30} />
      <div className={"row"}>
        <button type="button" className="cancelBtn" onClick={onClose}>CANCEL</button>
        <button type="submit" className="shareBtn">INVITE</button>
      </div>
    </form>
  );
}

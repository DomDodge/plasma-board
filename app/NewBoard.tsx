"use client";

type NewBoardProps = {
  onClose: () => void;
};

export default function NewBoard({ onClose }: NewBoardProps) {
  return (
    <form>
      <h2>New Board</h2>
      <label>Title</label>
      <input type="text" maxLength={30} />
      <div className={"row"}>
        <button type="button" className="cancelBtn" onClick={onClose}>CANCEL</button>
        <button type="submit" className="shareBtn">CREATE</button>
      </div>
    </form>
  );
}

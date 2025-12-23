"use client";

type TopBarProps = {
  onNew: () => void;
  onShare: () => void;
};

export default function TopBar({ onNew, onShare }: TopBarProps) {
  return (
    <div className="topBar">
      <div>
        <button className="shareBtn" onClick={onShare}>SHARE</button>
        <button className="newBtn" onClick={onNew}>NEW</button>
      </div>

      <div>
        <h3>Domo</h3>
        <div className="profilePic" />
      </div>
    </div>
  );
}

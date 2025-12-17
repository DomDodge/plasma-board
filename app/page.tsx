
export default function Home() {
  return (
    <div className={"container"}>
      <LeftBar />
      <RightBar />
    </div>
  )
}

function LeftBar() {
  return (
    <div className={"left"}>
      <h1>PLASMA</h1>
      <h2>BOARDS</h2>
    </div>
  )
}

function RightBar() {
  return (
    <div className={"right"}>
      <TopBar />
      <TaskHolder />
    </div>
  )
}

function TaskHolder() {
  return (
    <div className="taskHolder">
      <TaskSheet />
      <TaskSheet />
      <TaskSheet />
    </div>
  )
}

function TaskSheet() {
  return (
    <div className="task">

    </div>
  )
}

function TopBar() {
  return (
    <div className={"topBar"}>
      <button className={"shareBtn"}>SHARE</button>

      <div>
        <h3>Domo</h3>
        <div className={"profilePic"}></div>
      </div>
    </div>
  )
}
// Temp Data
// Users will need password field in DB
const users = [
  {
    id: 1,
    name: "Domo",
    email: "dominicdodge84@gmail.com",
    picture: "profile.jpg",
    account_created: "12/19/2025"
  },
  {
    id: 2,
    name: "Stramp",
    email: "kirbyrox2435@gmail.com",
    picture: "profile2.jpg",
    account_created: "12/19/2025"
  }
]

const projects = [
  {
    id: 1,
    title: "Throw Bro Launch",
    date_created: "12/20/2025"
  }
]

const projectMembers = [
  { project_id: 1, user_id: 1, role: "owner" },
  { project_id: 1, user_id: 2, role: "editor" }
]

const boards = [
  {
    id: 1,
    project_id: 1,
    title: "Build City",
    due_date: "01/01/2026"
  }
]

const task = [
  {
    id: 1,
    board_id: 1,
    title: "Draw 5 buildings",
    due_date: "12/24/2025",
    status: "incomplete"
  }
]

// EVNIORNMENT VARIABLES
let newBoard = false;
let shareBoard = false;

// PROGRAM START 
export default function Home() {
  return (
    <div id={"container"}>
      <LeftBar />
      <RightBar />
    </div>
  )
}

function LeftBar() {
  return (
    <div className={"left"}>
      <div className={"logo"}>
        <h1>PLASMA</h1>
        <h2>BOARDS</h2>
      </div>
      <UserBoards />
    </div>
  )
}

function RightBar() {
  return (
    <div className={"right"}>
      <TopBar />
      <TaskHolder />
      <NewBoard />
      <ShareBoard />
    </div>
  )
}

function UserBoards() {
  return (
    <div className={"userBoards"}>
      <h2>Boards</h2>

      <ul>
        <li>Weekly Tasks</li>
        <li>Monthly Goals</li>
        <li>Habits</li>
      </ul>
      <h2>Shared Boards</h2>
      
      <ul>
        <li>Throw Bro Update</li>
        <li>FREDs Bits and Parts</li>
        <li>Gnorbert</li>
      </ul>
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
  const toggleNew = () => {
    newBoard = true;
  };

  const toggleShared = () => {
    shareBoard = true;
  };

  return (
    <div className={"topBar"}>
      <div>
        <button className={"shareBtn"}>SHARE</button>
        <button className={"newBtn"}>NEW</button>
      </div>

      <div>
        <h3>Domo</h3>
        <div className={"profilePic"}></div>
      </div>
    </div>
  )
}

function NewBoard() {
  if (newBoard) {
    return (
      <form>
        <h2>New Board</h2>
        <label>Title</label>
        <input type="text" max="30"></input>
        <button type="submit" className={"shareBtn"}>CREATE</button>
      </form>
    )
  }
}

function ShareBoard() {
  if (shareBoard) {
    return (
      <form>
        <h2>Share Board</h2>
        <label>Invite Members</label>
        <input type="text" max="30"></input>
        <button type="submit" className={"shareBtn"}>CREATE</button>
      </form>
    )
  }
}
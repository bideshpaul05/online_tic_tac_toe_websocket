import React, { useState } from 'react'
import './page.scss'
import { Link } from 'react-router-dom'
function Home() {
  const [roomId, setRoomId] = useState()
  return (
    <div className='home'>
      <div className="container">
        <div className="header">
          <h1>Online Tic-Tac-Toe</h1>
        </div>
        <div className="controls">
          
          <button id="create_room">Create Room</button> 
          {/* <div className="divider">
           <hr />
            <div className="text">Or</div>
<hr />
          </div> */}
          <form action="">
          <input type="text" onChange={(e)=>setRoomId(e.target.value)} placeholder='Enter Room ID'/>
          <Link to="/room/1202">
          <button id="join_room">Join Room</button>
          </Link>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Home
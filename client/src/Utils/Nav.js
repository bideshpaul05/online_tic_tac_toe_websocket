import React from 'react'
import './Nav.scss'
function Nav() {
  return (
    <div className='nav'>
      <div className="container">

      <div className="logo">
        <h1>logo</h1>
      </div>
      <div className="nav-items">
        <div className="nav-item">Login</div>
        <div className="nav-item">Logout</div>
        <div className="nav-item">Join Room</div>
      
      </div>
      </div>
    </div>
  )
}

export default Nav
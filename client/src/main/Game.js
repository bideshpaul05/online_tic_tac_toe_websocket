import React, { useEffect, useRef, useState } from "react";
import "./page.scss";
import { useNavigate } from "react-router-dom";

function Game() {
  const navigate = useNavigate();

  const [board, setBoard] = useState([]);
  const [newsocket, setSocket] = useState();
  // const [sign,setSign] = useState()
  const sign  = useRef() // ******VERY IMPORTANT******  useEffect checks value of a state only when it is mounted if no params are passed. When i was comparing value of sign with winner sign sent by backend , sign initial value when this component was mounted which was undefined was getting compared to winner sign value sent by backend. So , everytime all the players were getting "you lost" message, We need to use ***useRef*** to avoid this problem.
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.addEventListener("open", () => {
      // if(board.length===0)
      //sending event to get board
      console.log("player joined");
    });
    socket.addEventListener("message", (res) => {
      const data = JSON.parse(res.data);
      if (data.type === "alert") {
        if (data.message === "Welcome client") {
          alert("Welcome PLayer");
        } else if (data.message === "invalid move" ) {
          return alert("invalid ");
        } else if (data.message === "Room is Full") {
          alert("Room is Full, come sometimes later");
          navigate("/");
        }
        else {
          alert(data.message)
        }
      }
      if(data.type==="sign") //setting up sign
      {
        
        sign.current = data.sign
      }
      if(data.type === "result")
      {
        if(data.state==="WIN") {
        
         
          checkWinner(data);
        }
        else if(data.state === "DRAW") return alert("!!!!!!!!!DRAW!!!!!!!!!!")
        // socket.close();
      }
      setBoard(data); //getting initial board
    });
    socket.onclose = () => {
      console.log("connection closed");
      // socket.close();
    };
    setSocket(socket); //set the connection so we don't eshtablish new connection everytime we fire an event to backend from outside useeffect hook
    return () => {
      socket.close(); //clanup function
    };
  }, []);
  const checkWinner = (e)=>{

    if(sign.current === e.winner) {
       alert("YOU WON , !!!!!CONGRATULATIONS!!!!!")
          }
          else{
             alert("SORRY BRO , YOU LOST")
          }

  }
  const changestate = (b) => {
    //changing state in the board
    newsocket.send(
      JSON.stringify({ event: "turn", id: b.target.id, state: sign.current })
    );
  };
  const begin = () => {
    newsocket.send(JSON.stringify({ event: "game_begin"  }));
  };

  // console.log(sign);
  return (
    <div className="game">
      <div className="container">
       {  typeof sign.current !== undefined && <div className="alerts">Your are playing as  {sign.current===0?"O":"X"}!</div>}
        <div className="main_content">
          <div className="gameinfo">
            <div className="players">
              <div className="player">Player1</div>
              <div className="player">Player2</div>
            </div>
            <div className="turn">
              <button onClick={begin}>Begin</button>
            </div>
          </div>
          {board.length > 0 ? (
            <div className="game_board">
              {
                board.map((b, i) => {
                  return (
                    <div
                      className=""
                      key={b.id}
                      id={b.id}
                      onClick={(b) => changestate(b)}
                    >
                      {b.state === -1 ? i : b.state === 0 ? "O" : "X"}
                    </div>
                  );
                })
                // :
                // <div className="loader">
                //   loading
                // </div>
              }
            </div>
          ) : (
            <div className="load">Loading Your Game . . .</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Game;
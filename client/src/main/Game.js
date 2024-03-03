import React, { useEffect, useRef, useState } from "react";
import "./page.scss";
import { useNavigate } from "react-router-dom";

function Game() {
  const navigate = useNavigate();

  const [board, setBoard] = useState([]);
  const [newsocket, setSocket] = useState();
  // const [sign,setSign] = useState()
  const sign = useRef(); // ******VERY IMPORTANT******  useEffect checks value of a state only when it is mounted if no params are passed. When i was comparing value of sign with winner sign sent by backend , sign initial value when this component was mounted which was undefined was getting compared to winner sign value sent by backend. So , everytime all the players were getting "you lost" message, We need to use ***useRef*** to avoid this problem.
  const turn = useRef()
  const [loadingmsg,setmsg] = useState ("Click Begin button to start a game")
  const [winningcomb,setwinningcomb ] = useState()
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.addEventListener("open", () => {
      // if(board.length===0)
      //sending event to get board
      console.log("player joined");
    });
    socket.addEventListener("message", (res) => {
      const data = JSON.parse(res.data);
      if(data.type==="turn")
      {
        turn.current = data.playerTurn;
        console.log(data.playerTurn)
      }
      if (data.type === "alert") {
        if (data.message === "Welcome client") {
          alert("Welcome PLayer");
        } else if (data.message === "invalid move") {
          return alert("invalid ");
        } else if (data.message === "Room is Full") {
          alert("Room is Full, come sometimes later");
          navigate("/");
        } else  {
          setmsg("Start new game")
          alert(data.message);
          setwinningcomb([]);
        }
      }
      if (data.type === "sign") {
        //setting up sign
        sign.current = data.sign;
        setmsg(data.message)
      }
      if (data.type === "result") {
        if (data.state === "WIN") {
          setwinningcomb(data.combination)
          checkWinner(data);
          
          
        } else if (data.state === "DRAW")
           alert("!!!!!!!!!DRAW!!!!!!!!!!");
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
      socket.close(); //cleanup function
    };
  }, []);
  const checkWinner = (e) => {
    if (sign.current === e.winner) {
      alert("YOU WON , !!!!!CONGRATULATIONS!!!!!");
    } else {
      alert("SORRY BRO , YOU LOST");
    }
  };
  const changestate = (b) => {
    //changing state in the board
    newsocket.send(
      JSON.stringify({ event: "turn", id: b.target.id, state: sign.current })
    );
  };
  const begin = () => {
    newsocket.send(JSON.stringify({ event: "game_begin" }));
  };
console.log(board)
  
  return (
    <div className="game">
      <div className="container">
        { sign.current !== undefined && (
          <div className="alerts">
            Your are playing as {sign.current === 0 ? "O" : "X"}!
          </div>
        )}
        <div className="main_content">
          <div className="gameinfo">
            <div className="players">
              <h1>Turn</h1>
              <div className="player" style={{fontWeight:turn.current===0 ?"bold":"100"}}>O</div>
              <div className="player"style={{fontWeight:turn.current===1 ?"bold":"100"}}>X</div>
            </div>
            <div className="turn">
              <button onClick={begin}>Begin</button>
            </div>
          </div>
          {board.length > 0 ? (
            <div className="game_board">
              {
                board.map((b, i) => {
                  let win = winningcomb && winningcomb.includes(i);
                  return (
                    <div
                      className=""
                      key={b.id}
                      id={b.id}
                      onClick={(b) => changestate(b)}
                      style={{color:win?"green":"black"}}
                    >
                      {b.state === -1 ? "": b.state === 0 ? "O" : "X"}
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
            <div className="load">{loadingmsg} . . .</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Game;

import WebSocket, { WebSocketServer } from "ws";
import express from "express";
const app = express();
app.listen(8000, () => {
  console.log("server is listening");
});
const wss = new WebSocketServer({ port: 8080 });
let board = [];
let move = 0;
let end = false;
const combinations = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal from top-left to bottom-right
  [2, 4, 6], //
];
let playerReady = 0;
let draw= false;
const setBoard = () => {
  for (let i = 0; i < 9; i++) {
    board.push({
      id: i + 1,
      state: -1,
    });
  }
};
// const checkWin = () => {
//   let win = false;
//   // combinations.forEach((comb) => {
//   //    win = comb.forEach((c) => {
//   //     if (board[c].state !== move) return false;
//   //   });
//   //   if (win) {
//   //     return true;
//   //   }
//   // });
//   const check = ()=> {
//     for(let i=0;i<combinations.length;i++)
//   {
//     let win = true;
//     for(let j=0;j<combinations[i].length;j++)
//     {
//       if (board[j].state !== move) {return false;}
//     }
//     if(win) return true;
//     else return false;
//   }
// }
// win  = check();
// return win;


// };
const checkWin = () => {
  for (let i = 0; i < combinations.length; i++) {
    let win = true;
    for (let j = 0; j < combinations[i].length; j++) {
      if (board[combinations[i][j]].state !== move) {
        win = false;
        break; // Exit the inner loop if there's no win in this combination
      }
    }
    if (win) return true; // Return true if a winning combination is found
  }
  return false; // Return false if no winning combination is found
};
const checkdraw = ()=>{
  let neg =0;
  for(let i=0;i<9;i++)
  {
    if(board[i].state=== -1) neg++;
  }
  if(neg==0) return true;
  return false;
}
console.log(wss.clients.size);
wss.on("connection", (ws,req) => {
  console.log(wss.clients.size);
  console.log(req.url.split('/').pop())
  if (wss.clients.size > 2) {
    ws.send(
      JSON.stringify({
        type: "alert",
        message: "Room is Full",
      })
    );
    ws.close();
  } else {
    ws.send(
      JSON.stringify({
        type: "alert",
        message: "Welcome client",
      })
    );
  }
  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    console.log(data);

    if (data.event === "game_begin") {
      playerReady++;
      end = false
      draw = false
      //assigning sign to players
      if (playerReady == 1) ws.send(JSON.stringify({ type: "sign", sign: 0 }));
      else if (playerReady == 2)
        ws.send(JSON.stringify({ type: "sign", sign: 1 }));
      if (playerReady == 2) {
        board = [];
        setBoard();
      }
    }
    if (data.event === "turn") {
      // checking if the move is from valid user or not

      if (move === data.state) {
        
        board[data.id - 1].state === -1
          ? (board[data.id - 1].state = data.state)
          : ws.send(
              JSON.stringify({
                type: "alert",
                message: "invalid move",
              })
            );
        // checking if somebody won
         if (checkWin()){ end= true;}
        
        if(checkdraw())
        {
          end = true;
          draw = true;
        
        }
        move = move === 0 ? 1 : 0;
        
      } else
        ws.send(
          JSON.stringify({
            type: "alert",
            message: "invalid move",
          })
        );
    }
    wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        if(end== true) {
          if(draw===true)
          {
            ws.send(JSON.stringify({
              type:"result",
              state:"DRAW",
              
            }))
          }
          else{
            ws.send(JSON.stringify({
              type:"result",
              state:"WIN",
              winner: move===0?1:0
            }))
          }
       
        }
        // else
        ws.send(JSON.stringify(board));
      }
    });

    // ws.send(JSON.stringify(board))
  });
  ws.on("close", () => {
    ws.close();
    console.log("user left");
  });
});
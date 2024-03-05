import WebSocket, { WebSocketServer } from "ws";
import express from "express";
import {createServer} from 'http'
const app = express();
const httpserver = createServer(app);

const wss = new WebSocketServer({ server: httpserver });
let board = [];
let move = 0;
let end = false;
let rooms = [{id:1202,connections:[]}]
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
let clientset = new Set();
let winningcomb = []
let playerReady = 0;
let draw = false;
let ongoing = false;
const setBoard = () => {
  for (let i = 0; i < 9; i++) {
    board.push({
      id: i + 1,
      state: -1,
    });
  }
};
const resetGame = () => {
  // Reset game state
  board = [];
  move = 0;
  end = false;
  playerReady = 0;
  draw = false;
  ongoing  = false;
  winningcomb = []
  // Setup a new game
  setBoard();
  // Notify clients that a new game is starting
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "alert",
          message: "New game started.",
        })
      );
      // Assign signs to players for the new game
      if (playerReady === 1) {
       
        ws.send(JSON.stringify({ type: "sign", sign: 1 }));
      }
      else if (playerReady === 2) {
     
        ws.send(JSON.stringify({ type: "sign", sign: 0 }));}
    }
  });
};

const checkWin = () => {
  for (let i = 0; i < combinations.length; i++) {
    let win = true;
    for (let j = 0; j < combinations[i].length; j++) {
      if (board[combinations[i][j]].state !== move) {
        win = false;
        break; // Exit the inner loop if there's no win in this combination
      }
    }
    if (win) {
      winningcomb = combinations[i];
      return true;} // Return true if a winning combination is found
  }
  return false; // Return false if no winning combination is found
};
const checkdraw = () => {
  let neg = 0;
  for (let i = 0; i < 9; i++) {
    if (board[i].state === -1) neg++;
  }
  if (neg == 0) return true;
  return false;
};
console.log(wss.clients.size);




wss.on("connection", (ws, req) => {
  console.log(wss.clients.size);
  let roomId = req.url.split('/').pop();
  // console.log(roomId)
  let roomExist;
  let Room ;
  
  let index = rooms.findIndex(room => room.id == roomId);
  roomExist=index!==-1?true:false;
  
  if(roomExist)
  {

  Room = rooms[index];
  
  if (Room.connections.length > 2) {
    ws.send(
      JSON.stringify({
        type: "alert",
        message: "Room is Full",
      })
    );
    ws.close()
  } else {
    Room.connections.push(ws);
    ws.send(
      JSON.stringify({
        type: "alert",
        message: "Welcome client",
      })
    );
  }
}
else{
  ws.send(JSON.stringify({type:"alert",message:"Room doesn't exist"}));
  ws.close();
}
  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    console.log(data);

    if (data.event === "game_begin") {
      if(ongoing == true)
      resetGame()
    else{

    
      playerReady++;
      end = false;
      draw = false;
      //assigning sign to players
      if (playerReady == 1) ws.send(JSON.stringify({ type: "sign", sign: 0 ,message:"Waiting for Your Opponent"}));
      else if (playerReady == 2)
        ws.send(JSON.stringify({ type: "sign", sign: 1 }));
      if (playerReady == 2) {
        board = [];
        setBoard();
        ongoing  =  true;
      }

    }
    // clientset.add(ws);
    ws.send(JSON.stringify({type:"turn",playerTurn:move}));
  }
    if (data.event === "turn") {
      // checking if the move is from valid user or not

      if (move === data.state) {
        if (board[data.id - 1].state === -1) {
          board[data.id - 1].state = data.state;
          if (checkWin()) {
            end = true;
          }

          if (checkdraw()) {
            end = true;
            draw = true;
          }
          move = move === 0 ? 1 : 0;
         
        } else {
          ws.send(
            JSON.stringify({
              type: "alert",
              message: "invalid move",
            })
          );
        }
        // checking if somebody won
      } else
        ws.send(
          JSON.stringify({
            type: "alert",
            message: "invalid move",
          })
        );
        if(!end)
        {
          Room.connections.forEach(ws=>{
            ws.send(JSON.stringify({type:"turn",playerTurn:move}));
          })
        }
    }
 
    Room.connections.forEach((ws) => {
  if (ws.readyState === WebSocket.OPEN) {
      if (end === true) {
          if (draw === true) {
              ws.send(JSON.stringify({
                  type: "result",
                  state: "DRAW",
              }));
          } else {
              ws.send(JSON.stringify({
                  type: "result",
                  state: "WIN",
                  combination: winningcomb,
                  winner: move === 0 ? 1 : 0,
              }));
          }
      }
  }
});

// Send board state to all clients
Room.connections.forEach((ws) => {
  if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(board));
  }
});


  });
  ws.on("close", () => {
    if(Room.connections.length>=2){

      ws.send(JSON.stringify({
        type:"alert",
        message:"not allowed"
      }))
      
      
    }
    else{
      
      Room.connections.forEach((client) => {
        
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "alert",
              action:"user left",
              message: "Opponent disconnected. The game has been reset.",
            })
            );
          }
        });
        Room.connections = [];
        ws.close();
        
        //clearnup
        board = [];
        move = 0;
        end = false;
        playerReady = 0;
        draw = false;
        ongoing = false;
        console.log("user left");
      }
  });

});
const PORT = process.env.PORT || 8080;
httpserver.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
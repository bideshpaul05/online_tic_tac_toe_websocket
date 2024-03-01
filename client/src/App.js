import './App.css';

import Home from './main/Home.js';
import Game from './main/Game.js';
import Nav from './Utils/Nav.js';
import Register from './auth/Register.js';
import Login from './auth/Login.js';
import {
  createBrowserRouter,
  Outlet,

  RouterProvider,
} from "react-router-dom";
function App() {
  function Layout() {
    return (
      <div>
        <Nav />
        <Outlet />
      </div>
    );
  }
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout/>,
      children:[
        {
          path:"/",
          element:<Home/>
        },
        {
          path:"/room/:id",
          element:<Game/>
        },
     
        {
          path: "/register",
          element: <Register/>,
        },
        {
          path: "/login",
          element: <Login/>,
        },
      ]
    }
   
   
  
  ]);
  return (
    <div className="App">
      <RouterProvider router={router}/>
    </div>
  );
}

export default App;

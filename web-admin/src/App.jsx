import { BrowserRouter as Router, Routes, Route } from "react-router";

import Nav from "./pages/nav/Nav";
import Login from "./pages/Login";

import Admin from "./pages/Admin";
import Visitors from "./pages/admin/visitors/Visitors";
import Users from "./pages/admin/users/Users";
import Calendar from "./pages/admin/calendar/Calendar";
import Config from "./pages/admin/config/Config"

import Footer from "./pages/footer/Footer";

import ProtectRouter from "./middleware/ProtectRouter";
import ErrorMiddleware from "./middleware/ErrorMiddleware";
import Loading from "./middleware/Loading";

import { useThemeContext } from "@/context/theme/ThemeContext";
import Singout from "./pages/Singout";

function App() {
  const { theme } = useThemeContext();
  return (
    <div
      id="App"
      data-theme={`${theme}`}
      className="min-h-full flex flex-col text-gray-500 dark:text-gray-400"
    >
      <div id="Main" className="h-full overflow-scroll">
        <div className="absolute left-2 bottom-2">
          <h1>Your theme: {theme}</h1>
        </div>
        <Router>
          {/* Feature to add */}
          {/* <Loading></Loading> */}
          <Nav />
          <Routes>
            <Route index element={<Login></Login>}></Route>

            <Route path="/" element={<ProtectRouter />}>
              <Route path="/Admin" element={<Admin />}>
                <Route index element={<Visitors />} />
                <Route path="/Admin/Users" element={<Users />} />
                <Route path="/Admin/Calendar" element={<Calendar />} />
                <Route path="/Admin/Configurations" element={<Config />} />
              </Route>

              <Route path="/Singout" element={<Singout />} />
            </Route>

            <Route
              path="*"
              element={
                <ErrorMiddleware
                  error={{ message: "Página não encontrada", code: 404 }}
                />
              }
            ></Route>
          </Routes>
        </Router>
        <Footer />
      </div>
    </div>
  );
}

export default App;

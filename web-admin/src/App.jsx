import { BrowserRouter as Router, Routes, Route } from "react-router";

import Nav from "./pages/nav/Nav";
import Login from "./pages/Login";

import Admin from "./pages/Admin";
import Visitors from "./pages/admin/visitors/Visitors";
import Users from "./pages/admin/users/Users";
// import Calendar from "./pages/admin/calendar/Calendar";
import Config from "./pages/admin/config/Config";

import Footer from "./pages/footer/Footer";

import ProtectRouter from "./middleware/ProtectRouter";
import ErrorMiddleware from "./middleware/ErrorMiddleware";
import Loading from "./middleware/Loading";

import { useThemeContext } from "@/context/theme/ThemeContext";
import Singout from "./pages/Singout";
import { useLoading } from "./context/loading/LoadingContext";
import VisitsByDayTable from "./pages/admin/Visits/Visits";
import { useProfile } from "./context/profile/ProfileContext";
import Terms from "./pages/terms/Terms";
import PrivacyPolicy from "./pages/terms/PrivacityPolicy";
import Dashboard from "./pages/admin/dashboard/Dashboard";

function App() {
  const { theme } = useThemeContext();
  const { loading } = useLoading;
  const { user } = useProfile();
  return (
    <div
      id="App"
      data-theme={`${theme}`}
      className="min-h-full flex flex-col text-gray-500 dark:text-gray-400"
    >
      <div id="Main" className="h-full overflow-scroll">
        <Router>
          {loading && <Loading></Loading>}
          <Nav />
          <Routes>
            <Route index element={<Login></Login>}></Route>

            <Route path="/" element={<ProtectRouter />}>
              <Route path="/Admin" element={<Admin />}>
                <Route index element={<Dashboard />} />
                <Route path="/Admin/Visitors" element={<Visitors />} />
                <Route path="/Admin/Users" element={<Users />} />
                {/* <Route path="/Admin/Calendar" element={<Calendar />} /> */}
                <Route path="/Admin/Visits" element={<VisitsByDayTable />} />
                <Route path="/Admin/Configurations" element={<Config />} />
              </Route>

              <Route path="/Singout" element={<Singout />} />
            </Route>
            <Route path="/Terms" element={<Terms />}></Route>
            <Route path="/Privacity" element={<PrivacyPolicy />}></Route>

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

import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Nav from "./pages/nav/Nav";
import Login from "./pages/Login";

import Footer from "./pages/footer/Footer";

import ProtectRouter from "./middleware/ProtectRouter";
import ErrorMiddleware from "./middleware/ErrorMiddleware";
import Loading from "./middleware/Loading";

import { useThemeContext } from "@/context/theme/ThemeContext";
import Singout from "./pages/Singout";
import Terms from "./pages/terms/Terms";
import PrivacyPolicy from "./pages/terms/PrivacityPolicy";

const Admin = lazy(() => import("./pages/Admin"));
const Dashboard = lazy(() => import("./pages/admin/dashboard/Dashboard"));
const Visitors = lazy(() => import("./pages/admin/visitors/Visitors"));
const Users = lazy(() => import("./pages/admin/users/Users"));
const VisitsByDayTable = lazy(() => import("./pages/admin/Visits/Visits"));
const Config = lazy(() => import("./pages/admin/config/Config"));

function App() {
  const { theme } = useThemeContext();
  return (
    <div
      id="App"
      data-theme={`${theme}`}
      className="min-h-dvh flex flex-col"
    >
      <div id="Main" className="flex min-h-dvh flex-col">
        <Router>
          <Nav />
          <Suspense fallback={<Loading />}>
          <Routes>
            <Route index element={<Login></Login>}></Route>

            <Route path="/" element={<ProtectRouter />}>
              <Route path="Admin" element={<Admin />}>
                <Route index element={<Dashboard />} />
                <Route path="Visitors" element={<Visitors />} />
                <Route path="Users" element={<Users />} />
                <Route path="Visits" element={<VisitsByDayTable />} />
                <Route path="Configurations" element={<Config />} />
              </Route>

              <Route path="Singout" element={<Singout />} />
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
          </Suspense>
        </Router>
        <div className="mt-auto"><Footer /></div>
      </div>
    </div>
  );
}

export default App;

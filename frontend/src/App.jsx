import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Users from "./pages/Users";
import Leaves from "./pages/Leaves";
import CalendarPage from "./pages/CalendarPage";
import Settings from "./pages/Settings";

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/tasks"
        element={<Tasks />}
      />

      <Route
        path="/users"
        element={<Users />}
      />

      <Route
        path="/leaves"
        element={<Leaves />}
      />

      <Route
        path="/calendar"
        element={<CalendarPage />}
      />

      <Route
        path="/settings"
        element={<Settings />}
      />

    </Routes>
  );
}

export default App;
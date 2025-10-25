import Home from "./components/pages/Home";
import RegisterPage from "./components/pages/RegisterPage";
import SignUpPage from "./components/pages/SignUpPage";
import UserProfilePage from "./components/pages/UserProfilePage";

import { Routes, Route, BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        <Route path="/user-profile" element={<UserProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

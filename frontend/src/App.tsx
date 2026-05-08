import { Signin } from "./pages/Signin"
import { Signup } from "./pages/Signup"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Dashboard } from "./pages/dashboard"
import { SharedNote } from "./pages/SharedNote"

function App() {
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/signup" />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/shared/:shareHash" element={<SharedNote />} />
    </Routes>
  </BrowserRouter>
}

export default App;

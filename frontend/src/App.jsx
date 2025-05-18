import { BrowserRouter, Route, Routes } from "react-router-dom";
import Uploader from "./Uploader";
import Dashboard from "./Dashboard";
import Sidebar from './Sidebar'
export default function App() {
    return <div className="w-screen h-screen bg-zinc-900 text-white overflow-hidden">
        <BrowserRouter>
            <Routes>
                <Route element={<Uploader />} path="/upload" />
                {/* <Route element={<Home />} path="/" /> */}
                <Route element={<div className="flex w-full h-full items-center justify-center">
                    <Sidebar />
                    <Dashboard />
                </div>} path="/" />
            </Routes>
        </BrowserRouter>
    </div>
}
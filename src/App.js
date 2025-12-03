// App.js
import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Sidebar from "./components/Sidebar";
import Auto from "./components/Auto";
import Multi from "./components/Multi";
import Rush from "./components/Rushgame";
import Challenge from "./components/Puzzles";
import Agenerator from "./components/Generator";
import Content from "./components/Content";
import Books from "./components/Books";
import Demo from "./components/Demo";
import Groups from "./components/Groups";
import Chatbot from "./components/Chatbot";
import Movie from "./components/Apple";
import Chalk from "./components/Chalkboard";
import Main from "./components/Main";
import Road from "./components/Roadmap";
import Quiz from "./components/Quiz";
import Video from "./components/Texttovideo";
import FileUpload from "./components/FileUpload";
import AskPDF from "./components/AskPDF";
import "./App.css";

// Layout for routes with Sidebar
const SidebarLayout = ({ children }) => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "20px" }}>{children}</div>
    </div>
  );
};

function App() {
  const [uploadedFile, setUploadedFile] = useState("");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />

        {/* Routes with sidebar layout */}
        <Route
          path="/auto"
          element={
            <SidebarLayout>
              <Auto />
            </SidebarLayout>
          }
        />
        <Route
          path="/multi"
          element={
            <SidebarLayout>
              <Multi />
            </SidebarLayout>
          }
        />
        <Route
          path="/rush"
          element={
            <SidebarLayout>
              <Rush />
            </SidebarLayout>
          }
        />
        <Route
          path="/challenge"
          element={
            <SidebarLayout>
              <Challenge />
            </SidebarLayout>
          }
        />
        <Route
          path="/agenerator"
          element={
            <SidebarLayout>
              <Agenerator />
            </SidebarLayout>
          }
        />
        <Route
          path="/content"
          element={
            <SidebarLayout>
              <Content />
            </SidebarLayout>
          }
        />
        <Route
          path="/books"
          element={
            <SidebarLayout>
              <Books />
            </SidebarLayout>
          }
        />
        <Route
          path="/demo"
          element={
            <SidebarLayout>
              <Demo />
            </SidebarLayout>
          }
        />
        <Route
          path="/groups"
          element={
            <SidebarLayout>
              <Groups />
            </SidebarLayout>
          }
        />
        <Route
          path="/chatbot"
          element={
            <SidebarLayout>
              <Chatbot />
            </SidebarLayout>
          }
        />
        <Route
          path="/movie"
          element={
            <SidebarLayout>
              <Movie />
            </SidebarLayout>
          }
        />
        <Route
          path="/chalk"
          element={
            <SidebarLayout>
              <Chalk />
            </SidebarLayout>
          }
        />
        <Route
          path="/main"
          element={
            <SidebarLayout>
              <Main />
            </SidebarLayout>
          }
        />
        <Route
          path="/road"
          element={
            <SidebarLayout>
              <Road />
            </SidebarLayout>
          }
        />
        <Route
          path="/quiz"
          element={
            <SidebarLayout>
              <Quiz />
            </SidebarLayout>
          }
        />
        <Route
          path="/video"
          element={
            <SidebarLayout>
              <Video />
            </SidebarLayout>
          }
        />
        <Route
          path="/sidebar"
          element={
            <SidebarLayout>
              <Chatbot />
            </SidebarLayout>
          }
        />

        {/* ✅ NEW PDF Upload Route */}
        <Route
          path="/pdf"
          element={
            <SidebarLayout>
              <div>
                <FileUpload setUploadedFile={setUploadedFile} />
                {uploadedFile && <AskPDF fileName={uploadedFile} />}
              </div>
            </SidebarLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

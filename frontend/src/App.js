import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Chat from "./view/chat/chat";
import { HelmetProvider, Helmet } from "react-helmet-async";  // Import HelmetProvider and Helmet

const App = () => {
  return (
    <HelmetProvider>
      <div className="App">
        {/* This will set the global head for the App */}
        <Helmet>
          <title>LawShield - AI Law Guidance SG</title>
          <meta
            name="description"
            content="LawShield provides AI guidance on legal matters and bullying situations."
          />
        </Helmet>

        <Router>
          <header className="App-header">
            <Routes>
              <Route path="chat" element={<Chat />} />
              <Route path="/" element={<Navigate to="/chat" />} />
            </Routes>
          </header>
        </Router>
      </div>
    </HelmetProvider>
  );
};

export default App;

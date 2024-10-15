import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Chat from "./view/chat/chat";

const App = () => {
  return (
    <div className="App">
      {/* <Helmet>
        <link rel="icon" type="image/png" href={logo} sizes="20x20" />
      </Helmet> */}
      <Router>
        <header className="App-header">
          <Routes>
            <Route path="chat" element={<Chat />} />

            <Route path="/" element={<Navigate to="/chat" />} />
          </Routes>
        </header>
      </Router>
    </div>
  );
};

export default App;

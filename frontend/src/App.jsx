// src/App.jsx
import React from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import routes from "./routes.jsx";

const AppRoutes = () => {
  const routing = useRoutes(routes);
  return routing;
};

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
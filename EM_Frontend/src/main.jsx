import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App";
import { store } from "./store/store";
import { Toaster } from "./components/ui/sonner";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <App />
    </BrowserRouter>
  </Provider>,
);

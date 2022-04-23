import "./styles/index.css";
import "./styles/custom.css";

import { StrictMode } from "react";
import ReactDOM from "react-dom";

import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) throw new Error("Root element not found");

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  rootElement
);

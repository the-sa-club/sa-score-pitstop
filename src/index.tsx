import React from "react";
import ReactDOM from "react-dom";
import { Root } from "./components/Root";
import "./styles.scss";
import { retryAsync } from "./utils";



ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById("root")
);


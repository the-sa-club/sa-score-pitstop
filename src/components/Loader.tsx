import * as React from "react";
import { useAppStore } from "../data/store";
import { AppLoader } from "../data/types";

const AppSpinner: React.FC<AppLoader> = (loadingInfo) => {
  return (
    <div
      className="app-spinner"
      style={{
        display: loadingInfo.loading ? "flex" : "none",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        flexDirection: "column",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
      }}
    >
      <svg
        className="loading-spinner"
        style={{
          display: "block",
          shapeRendering: "auto",
        }}
        width="200"
        height="200"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
      >
        <path
          fill="none"
          stroke="#b1b1b1"
          strokeWidth="8"
          strokeDasharray="205.271142578125 51.317785644531256"
          d="M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40 C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z"
          strokeLinecap="round"
          style={{
            transform: "scale(0.5)",
            transformOrigin: "center",
          }}
        >
          <animate
            attributeName="stroke-dashoffset"
            repeatCount="indefinite"
            dur="3.125s"
            keyTimes="0;1"
            values="0;256.58892822265625"
          ></animate>
        </path>
      </svg>

      <svg width="200px" height="20px" viewBox="0 0 200 20">
        <defs>
          <clipPath id="ProgressBar-clipPath">
            <rect x="0" y="0" width="100%" height="100%" rx="4%"/>
          </clipPath>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="#b1b1b1" rx="4%" />
        <rect x="0" y="0" width={`${loadingInfo.pct}%`} height="100%" fill="#142a54" clipPath="url(#ProgressBar-clipPath)" />
      </svg>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 10
        }}
      >
        <b style={{ color: "white" }}>{loadingInfo.message}</b>
        {/* <div className="dot-pulse"></div> */}
      </div>
    </div>
  );
};

export default React.memo(AppSpinner);

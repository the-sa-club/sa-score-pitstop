import * as React from "react";

const Spinner = ({ isLoading, fixed = true }: any) => {
  if (fixed) {
    return (
      <div
        className="app-spinner"
        style={{
          display: isLoading ? "block" : "none",
        }}
      >
        <svg
          className="loading-spinner"
          style={{
            display: "block",
            shapeRendering: "auto",
          }}
          width="100%"
          height="100%"
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
              transform: "scale(0.3)",
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
      </div>
    );
  }
  return (
    <svg
      className="loading-spinner"
      style={{
        display: isLoading ? "block" : "none",
        shapeRendering: "auto",
      }}
      width="100%"
      height="100px"
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
          transform: "scale(0.3)",
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
  );
};

export default React.memo(Spinner);

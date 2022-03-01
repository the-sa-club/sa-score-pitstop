import React, { useContext } from "react";
import { createContext } from "react";
import Loader from "../components/Loader";
import { AppLoader } from "../data/types";

export const STOP_LOADING_INFO = { loading: false, pct: 0, message: "" };
const LoadingContext = createContext<{
  loadingInfo: AppLoader;
  setLoadingInfo: (info: AppLoader) => void;
}>(undefined!);

export const LoadingProvider: React.FC = ({children}) => {
  const [loadingInfo, setLoadingInfo] = React.useState<AppLoader>(
    STOP_LOADING_INFO
  );
  return (
    <LoadingContext.Provider value={{ loadingInfo, setLoadingInfo }}>
      {children}
      <Loader
        loading={loadingInfo.loading}
        message={loadingInfo.message}
        pct={loadingInfo.pct}
      />
    </LoadingContext.Provider>
  );
};


export const useLoader = () => useContext(LoadingContext)
import gsap from "gsap";
import { round } from "mathjs";
import * as React from "react";
import { CIRCUMFEREMCE, RADUIS, RESOURCE_DECIMAL, USDC_DECIMAL } from "../constants";
import { IResourceData, TOKENS } from "../data/types";
import {
  MarketService
} from "../services/marketService";
import { thousandsFormatter } from "../utils";
import Spinner from "./Spinner";

const CIRCLES_TYPES = {
  progress1: "progress1",
  progress2: "progress2",
};

let tooltipIsHovering = {
  [TOKENS.ammo]: false,
  [TOKENS.food]: false,
  [TOKENS.fuel]: false,
  [TOKENS.tools]: false,
};

export interface ResourceProps {
  imgSrc: string;
  id: string;
  pct1Color: string;
  pct1?: number;
  pct2?: number;
  isBlinking?: boolean;
  isLoading?: boolean;
  resourceData: IResourceData;
}
const Resource: React.FC<ResourceProps> = ({
  imgSrc,
  id,
  pct1 = 0,
  pct2 = 0,
  pct1Color,
  isBlinking = false,
  isLoading = false,
  resourceData,
}) => {
  const [tl, _] = React.useState(() => gsap.timeline({ repeat: -1 }));

  const progress1Ref = React.useRef<SVGCircleElement | null>(null);
  const progress2Ref = React.useRef<SVGCircleElement | null>(null);
  const blinkRef = React.useRef<SVGCircleElement | null>(null);
  const trackRef = React.useRef<SVGCircleElement | null>(null);
  const loadingBgRef = React.useRef<SVGCircleElement | null>(null);
  const loadingSpinnerRef = React.useRef<SVGSVGElement | null>(null);
  const menu = React.useRef<HTMLDivElement | null>(null);
  const [tooltipData, setTooltipData] = React.useState<
    | {
        circle?: string;
        resourcePrice?: number;
        loading?: boolean;
        out?: boolean;
      }
    | undefined
  >({ loading: false });
  const [_render, _rerender] = React.useState(false);

  let tooltipContent = <></>;

  const getTooltipTitleProgress1 = (id: string) => {
    switch (id) {
      case TOKENS.ammo:
        return "Remaining Supply";

      case TOKENS.tools:
        return "Remaining Health";

      case TOKENS.fuel:
        return "Remaining Fuel";

      case TOKENS.food:
        return "Remaining Food";

      default:
        return "";
    }
  };

  const getTooltipTitleProgress2 = (id: string) => {
    switch (id) {
      case TOKENS.ammo:
        return "Resupply Capacity";

      case TOKENS.tools:
        return "Resupply Capacity";

      case TOKENS.fuel:
        return "Resupply Capacity";

      case TOKENS.food:
        return "Resupply Capacity";

      default:
        return "";
    }
  };

  switch (tooltipData?.circle) {
    case CIRCLES_TYPES.progress1:
      tooltipContent = (
        <div className="stat">
          <div className="title">{getTooltipTitleProgress1(id)}</div>
          <div className="stat-item">
            <span className="sign" style={{ marginRight: 4 }}>
              %
            </span>
            <span className="value">{round(resourceData.pct1 * 100, 2)}</span>
          </div>
          <div className="stat-item">
            <span className="sign">{id}</span>
            <span className="value">{thousandsFormatter(resourceData.unitsLeft, RESOURCE_DECIMAL)}</span>
          </div>
          {tooltipData.resourcePrice && tooltipData.resourcePrice > 0 ? (
            <div className="stat-item-icon">
              <span className="sign">USDC</span>
              <span>
                {thousandsFormatter(resourceData.unitsLeft * tooltipData.resourcePrice, USDC_DECIMAL)}
              </span>
              <div className="coin">
                <img src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png" />
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      );
      break;

    case CIRCLES_TYPES.progress2:
      tooltipContent = (
        <div className="stat">
          <div className="title">{getTooltipTitleProgress2(id)}</div>
          <div className="stat-item">
            <span className="sign" style={{ marginRight: 4 }}>
              {round((resourceData.supply / resourceData.maxUnits) * 100)}%
            </span>
            <span className="value">{round((resourceData.supply / resourceData.maxUnits) * 100)}</span>
          </div>
          <div className="stat-item">
            <span className="sign">{id}</span>
            <span className="value">{thousandsFormatter(resourceData.supply, RESOURCE_DECIMAL)}</span>
          </div>
          <div className="stat-item-icon">
            <span className="sign">USDC</span>
            <span>
              {thousandsFormatter(
                resourceData.supply * (tooltipData.resourcePrice as number),
                USDC_DECIMAL
              )}
            </span>
            <div className="coin">
              <img src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png" />
            </div>
          </div>

          <div className="title-balance">
            <div className="red-bar"></div>Balance deficit
          </div>
          <div className="stat-item">
            <span className="sign" style={{ marginRight: 4 }}>
              %
            </span>
            <span className="value">{round(resourceData.pct2 * 100)}</span>
          </div>
          <div className="stat-item">
            <span className="sign">{id}</span>
            <span className="value">
              {thousandsFormatter(resourceData.untisNeedToBuy, RESOURCE_DECIMAL)}
            </span>
          </div>
          <div className="stat-item-icon">
            <span className="sign">USDC</span>
            <span>
              {thousandsFormatter(
                resourceData.untisNeedToBuy *
                  (tooltipData.resourcePrice as number),
                USDC_DECIMAL
              )}
            </span>
            <div className="coin">
              <img src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png" />
            </div>
          </div>
        </div>
      );
      break;

    default:
      break;
  }

  const getResourceMarketPrice = (): Promise<number> => {
    switch (id) {
      case TOKENS.ammo:
        return MarketService.getAmmoMarketPrice();

      case TOKENS.fuel:
        return MarketService.getFuelMarketPrice();

      case TOKENS.food:
        return MarketService.getFoodMarketPrice();

      case TOKENS.tools:
        return MarketService.getToolMarketPrice();
    }
    return Promise.resolve(-1);
  };

  const setProgress1 = (pct: number) => {
    gsap.to(progress1Ref.current, {
      strokeDashoffset: CIRCUMFEREMCE * (1 - pct),
      ease: "elasitc",
      duration: 1.5,
    });
  };

  const setProgress2 = (pct: number) => {
    gsap.to(progress2Ref.current, {
      strokeDashoffset: CIRCUMFEREMCE + CIRCUMFEREMCE * pct,
      ease: "elasitc",
      duration: 1.5,
    });
  };

  const calculateRotation = (arcPct: number) => {
    let degree = arcPct * 360;
    return degree;
  };

  const blink = (show: boolean) => {
    if (show) {
      tl.to(blinkRef.current, {
        fill: "#ff000040",
        ease: "elasitc",
        duration: 1,
      })
        .to(blinkRef.current, {
          fill: "#ff000000",
          ease: "elasitc",
          duration: 1,
        })
        .play();
    } else {
      tl.progress(0).pause();
    }
  };

  const loading = (show: boolean) => {
    if (show) {
      if (loadingBgRef.current && loadingSpinnerRef.current) {
        loadingBgRef.current.style.fill = "#1c1c1cd1";
        loadingSpinnerRef.current.style.display = "block";
      }
    } else {
      if (loadingBgRef.current && loadingSpinnerRef.current) {
        loadingBgRef.current.style.fill = "transparent";
        loadingSpinnerRef.current.style.display = "none";
      }
    }
  };

  const progress1MouseEnter: React.MouseEventHandler<SVGCircleElement> = async (
    e
  ) => {
    
    
    // ! No resource selected
    if (resourceData.pct1 == 0 && resourceData.pct2 == 0) {
      return
    }

    const { clientX, clientY } = e;
    if (menu.current) {
      menu.current.style.top = clientY + 20 + "px";
      menu.current.style.left = clientX + 20 + "px";

      tooltipIsHovering[id] = true;
      _rerender(!_render);
      const resourcePrice = await getResourceMarketPrice();

      if (tooltipIsHovering[id]) {
        tooltipIsHovering[id] = false;
        setTooltipData({
          circle: CIRCLES_TYPES.progress1,
          resourcePrice,
          loading: false,
        });
      }
    }
  };

  const progress2MouseEnter: React.MouseEventHandler<SVGCircleElement> = async (
    e
  ) => {



    // ! No resource selected
    if (resourceData.pct1 == 0 && resourceData.pct2 == 0 && resourceData.supply == 0) {
      return
    }

    const { clientX, clientY } = e;
    if (menu.current) {
      menu.current.style.top = clientY + 20 + "px";
      menu.current.style.left = clientX + 20 + "px";

      tooltipIsHovering[id] = true;
      _rerender(!_render);
      const resourcePrice = await getResourceMarketPrice();

      if (tooltipIsHovering[id]) {
        tooltipIsHovering[id] = false;
        setTooltipData({
          circle: CIRCLES_TYPES.progress2,
          resourcePrice,
          loading: false,
        });
      }
    }
  };

  const progressMouseLeave: React.MouseEventHandler<SVGCircleElement> = (e) => {

    // ! No resource selected
    if (resourceData.pct1 == 0 && resourceData.pct2 == 0 && resourceData.supply == 0) {
      return
    }

    const { clientX, clientY } = e;
    if (menu.current) {
      menu.current.style.top = clientY + 25 + "px";
      menu.current.style.left = clientX + 25 + "px";
      tooltipIsHovering[id] = false;
      setTooltipData({ out: !!!tooltipData?.out });
    }
  };

  React.useEffect(() => {
    if (trackRef.current) {
        trackRef.current.style.transform = `rotate(${-90 + (calculateRotation(pct1))}deg)`;
    }
    gsap.to(trackRef.current, {
      strokeDashoffset: CIRCUMFEREMCE * (1 - (1 - pct2 - pct1)),
      ease: "elasitc",
      duration: 1.5,
      delay: 0.5,
    });
  }, [pct1, pct2]);

  React.useEffect(() => {
    setProgress1(pct1);
  }, [pct1]);

  React.useEffect(() => {
    setProgress2(pct2);
  }, [pct2]);

  React.useEffect(() => {
    blink(isBlinking);
  }, [isBlinking]);

  React.useEffect(() => {
    loading(isLoading);
  }, [isLoading]);

  React.useEffect(() => {}, []);

  return (
    <>
      <svg viewBox="0 0 100 100" width="150" height="150" id={id}>
        <defs>
          <clipPath id="myimage">
            <circle cx="50" cy="50" r="50" vectorEffect="non-scaling-stroke" />
          </clipPath>
        </defs>

        <image
          xlinkHref={imgSrc}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          clipPath="url(#myimage)"
          style={{
            transformOrigin: "center",
            transform: "scale(0.6)",
          }}
        ></image>

        <circle
          r={RADUIS}
          cx="50"
          cy="50"
          className="track"
          strokeDasharray={CIRCUMFEREMCE}
          strokeDashoffset={0}
          ref={trackRef}
          onMouseEnter={progress2MouseEnter}
          onMouseLeave={progressMouseLeave}
        />
        <circle
          r={RADUIS}
          cx="50"
          cy="50"
          className="progress2"
          strokeDasharray={CIRCUMFEREMCE}
          strokeDashoffset={CIRCUMFEREMCE}
          ref={progress2Ref}
          onMouseEnter={progress2MouseEnter}
          onMouseLeave={progressMouseLeave}
        />
        <circle
          r={RADUIS}
          cx="50"
          cy="50"
          className="progress1"
          strokeDasharray={CIRCUMFEREMCE}
          strokeDashoffset={CIRCUMFEREMCE}
          ref={progress1Ref}
          stroke={pct1Color}
          onMouseEnter={progress1MouseEnter}
          onMouseLeave={progressMouseLeave}
        />
        <circle r={RADUIS} cx="50" cy="50" className="blink" ref={blinkRef} />
        <circle
          r={RADUIS}
          cx="50"
          cy="50"
          className="loading-bg"
          ref={loadingBgRef}
        />
        <svg
          className="loading-spinner"
          style={{
            background: "rgb(241, 242, 243)",
            display: "none",
            shapeRendering: "auto",
          }}
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid"
          ref={loadingSpinnerRef}
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
      </svg>
      <div
        className={`hover-menu ${
          tooltipIsHovering[id] || tooltipData?.circle ? "active" : ""
        }`}
        ref={menu}
      >
        <Spinner isLoading={tooltipIsHovering[id]} fixed={false} />
        {tooltipContent}
      </div>
    </>
  );
};

export default React.memo(Resource);

import { createElement, useLayoutEffect } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import LiquidGlass from "liquid-glass-react";

const READY_MARKER = "data-codex-tweaks-usage-overview-glass-ready";
const BACKDROP_PROPERTY = "--ct-usage-overview-glass-backdrop";
const GLASS_SATURATION = 115;
const GLASS_BLUR_PX = 3;

function GlassBackground({ tooltip, layer, mouseContainer }) {
  useLayoutEffect(() => {
    const warp = layer.querySelector(".glass__warp");
    if (!warp) return;

    // 在浮层本身采样，保留轻微磨砂与折射，文字不参与滤镜。
    tooltip.style.setProperty(
      BACKDROP_PROPERTY,
      `blur(${GLASS_BLUR_PX}px) saturate(${GLASS_SATURATION}%) ${warp.style.filter}`.trim(),
    );
    tooltip.setAttribute(READY_MARKER, "");
    return () => {
      tooltip.removeAttribute(READY_MARKER);
      tooltip.style.removeProperty(BACKDROP_PROPERTY);
    };
  }, [tooltip, layer]);

  return createElement(
    LiquidGlass,
    {
      className: "ct-usage-overview-glass-material",
      mode: "shader",
      displacementScale: 28,
      blurAmount: 0,
      saturation: GLASS_SATURATION,
      aberrationIntensity: 0.35,
      cornerRadius: 18,
      padding: "0",
      // 高光跟随入口处的鼠标变化，卡片和文字保持静止。
      elasticity: 0,
      mouseContainer,
      style: {
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "100%",
        height: "100%",
      },
    },
    createElement("div", { className: "ct-usage-overview-glass-tint" }),
  );
}

export function mountTooltipGlass(tooltip, anchor) {
  if (!CSS.supports("backdrop-filter", "blur(1px)")) {
    return { ready: Promise.resolve(), cleanup() {} };
  }

  const layer = document.createElement("div");
  layer.setAttribute("data-codex-tweaks-usage-overview-glass", "");
  layer.setAttribute("aria-hidden", "true");
  tooltip.prepend(layer);

  let disposed = false;
  let pendingImage = null;
  let resolveReady;
  const ready = new Promise((resolve) => {
    resolveReady = resolve;
  });

  function finishPreparing() {
    observer.disconnect();
    resolveReady();
  }

  function useSolidBackground() {
    tooltip.removeAttribute(READY_MARKER);
    tooltip.style.removeProperty(BACKDROP_PROPERTY);
    finishPreparing();
  }

  function checkShaderSize() {
    const source = layer.querySelector("feImage");
    const url = source?.getAttribute("href");
    if (!url?.startsWith("data:image/png;") || pendingImage?.src === url) return;

    // 库先用默认尺寸生成一次 shader，等实际卡片尺寸的贴图解码完成后再显示。
    const image = new Image();
    pendingImage = image;
    image.onload = () => {
      if (disposed || source.getAttribute("href") !== url) return;
      const { width, height } = layer.getBoundingClientRect();
      if (
        Math.abs(image.naturalWidth - width) <= 1 &&
        Math.abs(image.naturalHeight - height) <= 1
      ) {
        finishPreparing();
      }
    };
    image.onerror = () => {
      if (!disposed && pendingImage === image) useSolidBackground();
    };
    image.src = url;
  }

  const observer = new MutationObserver(checkShaderSize);
  observer.observe(layer, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["href"],
  });

  const root = createRoot(layer, {
    identifierPrefix: "ct-usage-overview-",
    onUncaughtError(error) {
      useSolidBackground();
      console.warn("[ct-usage-overview] 液态玻璃加载失败，已恢复实色背景", error);
    },
  });
  // 在整张卡显示前提交背景，避免文字先出现、玻璃随后补入。
  flushSync(() => {
    root.render(
      createElement(GlassBackground, {
        tooltip,
        layer,
        mouseContainer: { current: anchor },
      }),
    );
  });
  checkShaderSize();

  return {
    ready,
    cleanup() {
      disposed = true;
      observer.disconnect();
      if (pendingImage) {
        pendingImage.onload = null;
        pendingImage.onerror = null;
      }
      resolveReady();
      root.unmount();
      layer.remove();
      tooltip.removeAttribute(READY_MARKER);
    },
  };
}

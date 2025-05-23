// 知识星球网页全屏插件 - 最终轻量版

const fullscreenClass = "fullscreen-plugin-active";
let fullscreenContainer = null;
let isFullscreen = false;

function toggleFullscreen(container) {
  try {
    if (!isFullscreen) {
      fullscreenContainer = container;
      fullscreenContainer.classList.add(fullscreenClass);

      // 添加关闭按钮
      const closeBtn = document.createElement("div");
      closeBtn.id = "fullscreen-close-btn";
      closeBtn.textContent = "退出全屏";
      closeBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10001;
        padding: 8px 16px;
        background: rgba(0,0,0,0.7);
        color: white;
        border-radius: 4px;
        cursor: pointer;
      `;
      closeBtn.addEventListener("click", () => toggleFullscreen(fullscreenContainer));
      document.body.appendChild(closeBtn);

      isFullscreen = true;
      console.log("[全屏插件] 全屏模式已激活");
    } else {
      if (fullscreenContainer) fullscreenContainer.classList.remove(fullscreenClass);
      const btn = document.getElementById("fullscreen-close-btn");
      if (btn) btn.remove();
      isFullscreen = false;
      fullscreenContainer = null;
      console.log("[全屏插件] 已退出全屏模式");
    }
  } catch (error) {
    if (fullscreenContainer) fullscreenContainer.classList.remove(fullscreenClass);
    const btn = document.getElementById("fullscreen-close-btn");
    if (btn) btn.remove();
    isFullscreen = false;
    fullscreenContainer = null;
    console.error("[全屏插件] 全屏切换错误:", error);
  }
}

function addVideoControls(video) {
  try {
    if (video.dataset.fullscreenPluginProcessed) return;
    video.dataset.fullscreenPluginProcessed = "true";

    const controlBar =
      video.closest(".controls, .video-controls") ||
      video.parentNode.querySelector(".controls, .video-controls");

    const fsBtn = document.createElement("button");
    fsBtn.className = "fullscreen-plugin-btn";
    fsBtn.innerHTML = "⛶";
    fsBtn.title = "网页全屏";
    fsBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 0 8px;
      margin-left: 8px;
    `;

    fsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFullscreen(video.parentElement);
    });

    if (controlBar) {
      controlBar.appendChild(fsBtn);
    } else {
      video.insertAdjacentElement("afterend", fsBtn);
    }
  } catch (error) {
    console.error("[全屏插件] 添加控制按钮失败:", error);
  }
}

function initPlugin() {
  // 添加全屏样式
  const style = document.createElement("style");
  style.textContent = `
    .${fullscreenClass} {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: #000 !important;
      z-index: 10000 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .${fullscreenClass} video {
      width: 100% !important;
      height: 100% !important;
      object-fit: contain !important;
      background: #000 !important;
    }
  `;
  document.head.appendChild(style);

  // 监听DOM变化
  const observer = new MutationObserver(() => {
    document.querySelectorAll("video").forEach(addVideoControls);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // 初始检查
  document.querySelectorAll("video").forEach(addVideoControls);

  // 清理
  window.addEventListener("beforeunload", () => {
    observer.disconnect();
  });
}

if (document.readyState === "complete") {
  initPlugin();
} else {
  window.addEventListener("load", initPlugin);
}

// 知识星球网页全屏插件 - 只让 video 元素全屏，并保留控制栏

const fullscreenVideoClass = "fullscreen-plugin-active-video";
let fullscreenVideo = null;
let isFullscreen = false;
let wasControls = false; // 记录原始controls状态

function toggleFullscreen(video) {
  try {
    if (!isFullscreen) {
      fullscreenVideo = video;
      fullscreenVideo.classList.add(fullscreenVideoClass);

      // 记录原始controls状态，并强制加上controls
      wasControls = fullscreenVideo.hasAttribute('controls');
      fullscreenVideo.setAttribute('controls', '');

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
      closeBtn.addEventListener("click", () => toggleFullscreen(fullscreenVideo));
      document.body.appendChild(closeBtn);

      isFullscreen = true;
    } else {
      if (fullscreenVideo) {
        fullscreenVideo.classList.remove(fullscreenVideoClass);
        // 恢复controls状态
        if (!wasControls) fullscreenVideo.removeAttribute('controls');
      }
      const btn = document.getElementById("fullscreen-close-btn");
      if (btn) btn.remove();
      isFullscreen = false;
      fullscreenVideo = null;
    }
  } catch (error) {
    if (fullscreenVideo) fullscreenVideo.classList.remove(fullscreenVideoClass);
    if (!wasControls && fullscreenVideo) fullscreenVideo.removeAttribute('controls');
    const btn = document.getElementById("fullscreen-close-btn");
    if (btn) btn.remove();
    isFullscreen = false;
    fullscreenVideo = null;
    console.error("[全屏插件] 全屏切换错误:", error);
  }
}

function addVideoControls(video) {
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
    toggleFullscreen(video);
  });

  if (controlBar) {
    controlBar.appendChild(fsBtn);
  } else {
    video.insertAdjacentElement("afterend", fsBtn);
  }
}

function initPlugin() {
  // 添加全屏样式
  const style = document.createElement("style");
  style.textContent = `
    .${fullscreenVideoClass} {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: calc(100vh - 50px) !important; /* Leave space for controls */
      z-index: 10000 !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #000 !important;
      object-fit: contain !important;
      display: block !important;
      box-shadow: none !important;
      border: none !important;
    }
    
    /* Ensure controls are visible and properly positioned */
    .${fullscreenVideoClass} + .fullscreen-plugin-btn,
    .${fullscreenVideoClass} ~ .controls,
    .${fullscreenVideoClass} ~ .video-controls {
      position: fixed !important;
      bottom: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 50px !important;
      z-index: 10001 !important;
      background: rgba(0,0,0,0.7) !important;
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

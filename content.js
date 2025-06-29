// 知识星球网页全屏插件 - 核心功能脚本

// 常量定义
const PLUGIN_NAME = "知识星球网页全屏插件";
const PLUGIN_VERSION = "1.3";
const fullscreenVideoClass = "fullscreen-plugin-active-video";

// 状态变量
let fullscreenVideo = null;
let isFullscreen = false;
let wasControls = false; // 记录原始controls状态
let exitButton = null;

/**
 * 切换视频全屏状态
 * @param {HTMLVideoElement} video - 要切换全屏的视频元素
 */
function toggleFullscreen(video) {
  try {
    if (!isFullscreen) {
      // 进入全屏模式
      fullscreenVideo = video;
      fullscreenVideo.classList.add(fullscreenVideoClass);

      // 记录原始controls状态，并强制加上controls
      wasControls = fullscreenVideo.hasAttribute('controls');
      fullscreenVideo.setAttribute('controls', '');

      // 创建退出全屏按钮
      createExitButton();
      
      // 添加 esc 监听
      window.addEventListener('keydown', escListener);

      // 显示全屏状态提示
      showNotification("已进入网页全屏模式，按ESC或点击右上角按钮退出");
      
      isFullscreen = true;
    } else {
      // 退出全屏模式
      exitFullscreen();
    }
  } catch (error) {
    console.error(`[${PLUGIN_NAME}] 全屏切换错误:`, error);
    showNotification("全屏切换失败，请刷新页面重试", "error");
    exitFullscreen();
  }
}

/**
 * 退出全屏模式
 */
function exitFullscreen() {
  if (fullscreenVideo) {
    fullscreenVideo.classList.remove(fullscreenVideoClass);
    // 恢复controls状态
    if (!wasControls) fullscreenVideo.removeAttribute('controls');
  }
  
  // 隐藏退出按钮
  if (exitButton) {
    exitButton.style.display = 'none';
  }
  
  // 移除 esc 监听
  window.removeEventListener('keydown', escListener);
  
  isFullscreen = false;
  fullscreenVideo = null;
  
  showNotification("已退出网页全屏模式");
}

/**
 * 创建退出全屏按钮
 */
function createExitButton() {
  // 如果已存在，先移除
  if (exitButton && exitButton.parentNode) {
    exitButton.parentNode.removeChild(exitButton);
    exitButton = null;
  }
  
  // 创建新按钮
  exitButton = document.createElement("button");
  exitButton.className = "fullscreen-plugin-exit-btn";
  exitButton.innerHTML = "退出全屏";
  exitButton.title = "退出网页全屏";
  
  // 直接设置显示状态
  exitButton.style.display = 'block';
  
  exitButton.addEventListener("click", () => {
    if (isFullscreen && fullscreenVideo) {
      toggleFullscreen(fullscreenVideo);
    }
  });
  
  document.body.appendChild(exitButton);
}

/**
 * ESC键监听函数
 * @param {KeyboardEvent} e - 键盘事件
 */
function escListener(e) {
  if (isFullscreen && (e.key === 'Escape' || e.key === 'Esc')) {
    toggleFullscreen(fullscreenVideo);
  }
}

/**
 * 为视频添加全屏控制按钮
 * @param {HTMLVideoElement} video - 视频元素
 */
function addVideoControls(video) {
  // 避免重复处理
  if (video.dataset.fullscreenPluginProcessed) return;
  video.dataset.fullscreenPluginProcessed = "true";

  // 查找控制栏 - 使用多级选择器增强稳定性
  const controlBar = findControlBar(video);

  // 创建全屏按钮
  const fsBtn = document.createElement("button");
  fsBtn.className = "fullscreen-plugin-btn";
  fsBtn.innerHTML = "⛶";
  fsBtn.title = "网页全屏";

  // 添加点击事件
  fsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFullscreen(video);
  });

  // 将按钮添加到控制栏或视频后面
  if (controlBar) {
    controlBar.appendChild(fsBtn);
  } else {
    video.insertAdjacentElement("afterend", fsBtn);
  }
}

/**
 * 查找视频控制栏
 * @param {HTMLVideoElement} video - 视频元素
 * @returns {HTMLElement|null} - 找到的控制栏元素或null
 */
function findControlBar(video) {
  // 多级选择器策略，按优先级尝试
  const selectors = [
    // 1. 直接相邻的控制栏
    () => video.closest(".controls, .video-controls"),
    // 2. 父元素中的控制栏
    () => video.parentNode?.querySelector(".controls, .video-controls"),
    // 3. 通用类名选择器
    () => video.closest("div")?.querySelector("[class*='control'], [class*='Control']"),
    // 4. 通用属性选择器
    () => video.closest("div")?.querySelector("[aria-label*='控制'], [aria-label*='control']"),
    // 5. 知识星球特定结构
    () => {
      const videoWrapper = video.closest("div[class*='video'], div[class*='player']");
      return videoWrapper?.querySelector("[class*='control'], [class*='Control']");
    }
  ];

  // 依次尝试每个选择器
  for (const selector of selectors) {
    const result = selector();
    if (result) return result;
  }

  return null;
}

/**
 * 显示通知消息
 * @param {string} message - 通知消息
 * @param {string} type - 消息类型 (info, error)
 */
function showNotification(message, type = "info") {
  // 移除旧通知
  const oldNotification = document.querySelector(".fullscreen-plugin-notification");
  if (oldNotification && oldNotification.parentNode) {
    oldNotification.parentNode.removeChild(oldNotification);
  }
  
  // 创建新通知
  const notification = document.createElement("div");
  notification.className = "fullscreen-plugin-notification";
  if (type === "error") {
    notification.classList.add("error");
  }
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // 3秒后自动消失
  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

/**
 * 初始化插件
 */
function initPlugin() {
  console.log(`[${PLUGIN_NAME}] 初始化插件 v${PLUGIN_VERSION}`);
  
  // 监听DOM变化
  const observer = new MutationObserver((mutations) => {
    // 查找所有视频元素
    const videos = document.querySelectorAll("video");
    if (videos.length > 0) {
      videos.forEach(addVideoControls);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // 初始检查已存在的视频
  document.querySelectorAll("video").forEach(addVideoControls);

  // 清理
  window.addEventListener("beforeunload", () => {
    observer.disconnect();
    // 确保退出全屏
    if (isFullscreen) {
      exitFullscreen();
    }
  });
  
  // 显示初始化成功通知
  setTimeout(() => {
    if (document.querySelectorAll("video").length > 0) {
      showNotification(`${PLUGIN_NAME} 已启用，点击视频控制栏中的⛶按钮可进入全屏模式`);
    }
  }, 2000);
}

// 初始化插件
if (document.readyState === "complete") {
  initPlugin();
} else {
  window.addEventListener("load", initPlugin);
}

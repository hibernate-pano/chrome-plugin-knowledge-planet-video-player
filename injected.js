let isOptimized = false;

function optimizeVideoLayout() {
  if (isOptimized) {
    console.log('布局已经优化，跳过');
    return;
  }

  console.log('开始执行 optimizeVideoLayout 函数');

  function findVideoElement() {
    return new Promise((resolve) => {
      const checkForVideo = () => {
        // 尝试查找可能的视频容器
        const videoContainer = document.querySelector('.video-container') || 
                               document.querySelector('[class*="video"]') ||
                               document.querySelector('[id*="video"]');
        if (videoContainer) {
          console.log('找到视频容器:', videoContainer);
          resolve(videoContainer);
        } else {
          console.log('未找到视频容器，等待100ms后重试');
          setTimeout(checkForVideo, 100);
        }
      };
      checkForVideo();
    });
  }

  findVideoElement().then((videoContainer) => {
    // 创建新的布局容器
    const container = document.createElement('div');
    container.id = 'optimized-video-container';

    // 创建左侧菜单容器
    const menuContainer = document.createElement('div');
    menuContainer.id = 'left-menu-container';

    // 创建视频播放区域容器
    const newVideoContainer = document.createElement('div');
    newVideoContainer.id = 'video-player-container';

    // 查找左侧菜单
    const leftMenu = document.querySelector('.sidebar-wrapper') || 
                     document.querySelector('.left-menu') ||
                     document.querySelector('[class*="sidebar"]') ||
                     document.querySelector('[id*="sidebar"]');
    if (leftMenu) {
      console.log('找到左侧菜单元素');
      menuContainer.appendChild(leftMenu.cloneNode(true)); // 克隆菜单而不是移动它
    } else {
      console.log('未找到左侧菜单元素');
    }

    // 移动视频容器到新的布局中
    newVideoContainer.appendChild(videoContainer.cloneNode(true));

    // 组装新布局
    container.appendChild(menuContainer);
    container.appendChild(newVideoContainer);

    // 将新布局插入到页面中
    document.body.insertBefore(container, document.body.firstChild);
    console.log('新布局已插入到页面中');

    // 尝试为视频容器添加控件
    const videoElement = newVideoContainer.querySelector('video');
    if (videoElement) {
      videoElement.controls = true;
    }

    // 监听原始视频容器的变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          newVideoContainer.innerHTML = videoContainer.innerHTML;
          console.log('视频容器已更新');
        }
      });
    });

    observer.observe(videoContainer, { childList: true, attributes: true, subtree: true });
    console.log('开始监听视频容器的变化');

    isOptimized = true;
  });
}

// 在 DOMContentLoaded 事件后执行优化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', optimizeVideoLayout);
} else {
  optimizeVideoLayout();
}

// 添加一个 MutationObserver 来监听 DOM 变化
const bodyObserver = new MutationObserver((mutations) => {
  if (isOptimized) {
    bodyObserver.disconnect();
    return;
  }

  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      const addedNodes = mutation.addedNodes;
      for (let node of addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE && 
            (node.classList.contains('video-container') || 
             node.id.includes('video') || 
             node.className.includes('video'))) {
          console.log('检测到新的视频容器被添加到 DOM 中');
          optimizeVideoLayout();
          break;
        }
      }
    }
  });
});

bodyObserver.observe(document.body, { childList: true, subtree: true });
console.log('开始监听 body 元素的变化');
(function() {
  console.log('Injected script loaded');

  let isOptimized = false;

  function optimizeVideoLayout() {
    console.log('Optimizing video layout');
    if (isOptimized) {
      console.log('布局已经优化，跳过');
      return;
    }

    console.log('开始执行 optimizeVideoLayout 函数');

    // 查找左侧菜单和视频元素
    const leftMenu = document.querySelector('.sidebar-wrapper') || 
                       document.querySelector('.left-menu') ||
                       document.querySelector('[class*="sidebar"]') ||
                       document.querySelector('[id*="sidebar"]');

    const videoElement = document.querySelector('video[_ngcontent-ng-c178709840]') || 
                         document.querySelector('video');

    console.log('Left menu:', leftMenu);
    console.log('Video element:', videoElement);

    if (!leftMenu) {
      console.log('未找到左侧菜单元素');
      return;
    }

    if (!videoElement) {
      console.log('未找到视频元素');
      return;
    }

    console.log('找到左侧菜单和视频元素');

    // 创建新的布局容器
    const container = document.createElement('div');
    container.id = 'optimized-video-container';

    // 设置父容器为 Flex 布局
    container.style.display = 'flex';
    container.style.width = '100%';
    container.style.height = '100vh';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.backgroundColor = 'white';
    container.style.zIndex = '9999';

    // 创建左侧菜单容器
    const menuContainer = document.createElement('div');
    menuContainer.id = 'left-menu-container';
    menuContainer.style.width = '250px';
    menuContainer.style.height = '100%';
    menuContainer.style.overflowY = 'auto';
    menuContainer.style.backgroundColor = '#f0f0f0';

    // 克隆左侧菜单并添加到新菜单容器中
    const clonedMenu = leftMenu.cloneNode(true);
    menuContainer.appendChild(clonedMenu);

    // 隐藏原始左侧菜单
    leftMenu.style.display = 'none';

    // 创建视频播放器容器
    const videoContainer = document.createElement('div');
    videoContainer.id = 'video-player-container';
    videoContainer.style.flexGrow = '1';
    videoContainer.style.height = '100%';
    videoContainer.style.display = 'flex';
    videoContainer.style.justifyContent = 'center';
    videoContainer.style.alignItems = 'center';
    videoContainer.style.backgroundColor = 'black';

    // 移动原始视频元素到新的视频容器中
    videoContainer.appendChild(videoElement);

    // 将菜单和视频容器添加到父容器
    container.appendChild(menuContainer);
    container.appendChild(videoContainer);

    // 将父容器插入到页面中
    document.body.insertBefore(container, document.body.firstChild);
    console.log('新布局已插入到页面中');

    // 确保视频控件可见
    videoElement.controls = true;

    isOptimized = true;

    // 断开观察器以防止无限循环
    bodyObserver.disconnect();
  }

  // 使用 setTimeout 来确保在 DOM 加载完成后执行
  setTimeout(() => {
    console.log('Executing optimizeVideoLayout');
    optimizeVideoLayout();
  }, 2000);

  // 添加一个 MutationObserver 来监听 DOM 变化
  const bodyObserver = new MutationObserver((mutations) => {
    if (isOptimized) {
      return;
    }

    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE && 
              (node.classList.contains('video-container') || 
               node.id.includes('video') || 
               node.className.includes('video'))) {
            console.log('检测到新的视频容器被添加到 DOM 中');
            optimizeVideoLayout();
          }
        });
      }
    });
  });

  bodyObserver.observe(document.body, { childList: true, subtree: true });
  console.log('开始监听 body 元素的变化');
})();
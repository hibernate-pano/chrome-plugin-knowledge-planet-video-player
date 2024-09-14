console.log('Content script is running');

function injectScript(code) {
  const script = document.createElement('script');
  script.textContent = code;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
  console.log('Script injected');
}

// 读取 injected.js 文件内容
fetch(chrome.runtime.getURL('injected.js'))
  .then(response => response.text())
  .then(code => {
    // 注入脚本内容
    injectScript(code);
  })
  .catch(error => console.error('Error injecting script:', error));
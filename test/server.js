const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = process.argv[2] || 3000;

// 自定义fetch函数
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https') ? https : http;
        
        const req = lib.get(url, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                reject(new Error(`HTTP Error: ${res.statusCode}`));
                return;
            }

            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        });

        req.on('error', reject);
        req.setTimeout(8000, () => {
            req.destroy();
            reject(new Error('请求超时'));
        });
    });
}

http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const targetUrl = url.searchParams.get('url');
    
    console.log(`请求: ${req.url}`);
    
    if (targetUrl && url.pathname === '/proxy') {
        try {
            console.log(`正在代理: ${targetUrl}`);
            
            const html = await fetchUrl(targetUrl);
            
            // 插入CSS隐藏广告
            const adCSS = `
                <style>
                    /* 隐藏常见广告元素 */
                    #adv_wrap_hh { display: none !important; }
                    .ad-container, .ad-banner, .ad-wrap { display: none !important; }
                    [class*="ad-"], [id*="ad-"], [class*="adv"], [id*="adv"] { 
                        display: none !important; 
                    }
                    .advertisement, .adsbygoogle, .ad-unit { display: none !important; }
                    .popup-layer, .modal-backdrop, .dialog-container { display: none !important; }
                    
                    /* 确保视频区域全屏显示 */
                    .video-container, .player-container, #player { 
                        width: 100% !important; 
                        height: 100% !important;
                    }
                </style>
                <base href="${new URL(targetUrl).origin}">
            `;
            
            let modifiedHtml = html;
            if (html.includes('</head>')) {
                modifiedHtml = html.replace('</head>', adCSS + '</head>');
            } else {
                modifiedHtml = adCSS + html;
            }
            
            res.writeHead(200, { 
                'Content-Type': 'text/html; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(modifiedHtml);
            
        } catch (e) {
            console.error('代理错误:', e.message);
            // 返回错误页面，但允许重试
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <html>
                <head>
                    <style>
                        body { font-family: Arial; padding: 20px; text-align: center; }
                        .error { color: red; margin: 20px 0; }
                        button { padding: 10px 20px; margin: 5px; }
                    </style>
                </head>
                <body>
                    <h2>⚠️ 解析站暂时不可用</h2>
                    <div class="error">错误: ${e.message}</div>
                    <p>请尝试其他解析站</p>
                    <button onclick="window.parent.changeSource(1)">尝试解析站2</button>
                    <button onclick="window.parent.changeSource(2)">尝试解析站3</button>
                    <button onclick="location.reload()">重新加载</button>
                </body>
                </html>
            `);
        }
    } else {
        // 主页面 - 改进版本
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>视频解析代理服务</title>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
                    .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
                    .success { background: #e8f5e8; border-left: 4px solid #4CAF50; }
                    .error { background: #ffe6e6; border-left: 4px solid #f44336; }
                    .loading { background: #e3f2fd; border-left: 4px solid #2196F3; }
                    button { 
                        padding: 10px 15px; 
                        margin: 5px; 
                        border: none; 
                        border-radius: 5px; 
                        cursor: pointer;
                        background: #4CAF50;
                        color: white;
                    }
                    button:hover { background: #45a049; }
                    button.secondary { background: #2196F3; }
                    button.secondary:hover { background: #1976D2; }
                    iframe { 
                        width: 100%; 
                        height: 600px; 
                        border: 2px solid #ddd; 
                        border-radius: 5px;
                        background: #000;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🎬 视频解析代理服务</h1>
                    
                    <div id="status" class="status loading">
                        🟡 准备加载视频...
                    </div>
                    
                    <div>
                        <h3>选择解析站：</h3>
                        <button onclick="changeSource(0)">🔴 小马解析</button>
                        <button onclick="changeSource(1)">🟢 瓢云解析</button>
                        <button onclick="changeSource(2)">🔵 夜暮解析</button>
                        <button onclick="changeSource(3)" class="secondary">🟣 JSON解析</button>
                        <button onclick="changeSource(4)" class="secondary">🟠 花瑶解析</button>
                    </div>
                    
                    <div style="margin: 20px 0;">
                        <iframe id="videoFrame" 
                                src="about:blank"
                                allowfullscreen 
                                webkitallowfullscreen 
                                mozallowfullscreen>
                        </iframe>
                    </div>
                    
                    <div>
                        <h3>自定义视频地址：</h3>
                        <input type="text" id="customUrl" style="width: 70%; padding: 8px; margin-right: 10px;" 
                               placeholder="请输入爱奇艺视频地址，如：https://www.iqiyi.com/v_xxxxx.html">
                        <button onclick="loadCustomVideo()">加载自定义视频</button>
                    </div>
                </div>

                <script>
                    const sites = [
                        {
                            name: '小马解析',
                            url: 'https://jx.xmflv.com/?url='
                        },
                        {
                            name: '瓢云解析', 
                            url: 'https://www.pouyun.com/?url='
                        },
                        {
                            name: '夜暮解析',
                            url: 'https://www.yemu.xyz/?url='
                        },
                        {
                            name: 'JSON解析',
                            url: 'https://jx.jsonplayer.com/player/?url='
                        },
                        {
                            name: '花瑶解析',
                            url: 'https://vip.huayao88.com/m1907.html?m1907jx='
                        }
                    ];
                    
                    // 默认测试视频
                    const defaultVideo = 'https://www.iqiyi.com/v_19rrojp49s.html';
                    let currentSource = 1; // 默认使用第二个源（瓢云解析）
                    
                    function updateStatus(message, type = 'loading') {
                        const statusEl = document.getElementById('status');
                        statusEl.className = 'status ' + type;
                        statusEl.innerHTML = message;
                    }
                    
                    function changeSource(index) {
                        currentSource = index;
                        const site = sites[index];
                        const videoUrl = site.url + defaultVideo;
                        const proxyUrl = '/proxy?url=' + encodeURIComponent(videoUrl);
                        
                        updateStatus('🟡 正在加载: ' + site.name + '...', 'loading');
                        
                        console.log('切换到:', site.name, proxyUrl);
                        document.getElementById('videoFrame').src = proxyUrl;
                    }
                    
                    function loadCustomVideo() {
                        const customUrl = document.getElementById('customUrl').value.trim();
                        if (!customUrl) {
                            alert('请输入视频地址');
                            return;
                        }
                        
                        // 使用当前选中的解析站
                        const site = sites[currentSource];
                        const fullUrl = site.url + customUrl;
                        const proxyUrl = '/proxy?url=' + encodeURIComponent(fullUrl);
                        
                        updateStatus('🟡 正在加载自定义视频...', 'loading');
                        document.getElementById('videoFrame').src = proxyUrl;
                    }
                    
                    // iframe事件监听
                    document.getElementById('videoFrame').onload = function() {
                        updateStatus('🟢 视频加载完成', 'success');
                        console.log('iframe加载完成');
                    };
                    
                    document.getElementById('videoFrame').onerror = function() {
                        updateStatus('🔴 加载失败，请尝试其他解析站', 'error');
                        console.error('iframe加载失败');
                    };
                    
                    // 页面加载后自动选择一个可用的源
                    window.onload = function() {
                        // 默认使用第二个源（瓢云解析），因为你说这个成功了
                        changeSource(1);
                    };
                </script>
            </body>
            </html>
        `);
    }
}).listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`💡 自动使用已知可用的解析站`);
});
let map;
let userMarker;
let queryMarker;
let queryLine;
let userLocation = null;

// 全球服务列表配置
const globalServices = [
    // 国际搜索引擎
    { name: 'Google', url: 'https://www.google.com/favicon.ico', category: 'international' },
    { name: 'Bing', url: 'https://www.bing.com/favicon.ico', category: 'international' },
    
    // 国际媒体
    { name: 'YouTube', url: 'https://www.youtube.com/favicon.ico', category: 'international' },
    { name: 'Netflix', url: 'https://www.netflix.com/favicon.ico', category: 'international' },
    { name: 'Twitch', url: 'https://www.twitch.tv/favicon.ico', category: 'international' },
    { name: 'Spotify', url: 'https://www.spotify.com/favicon.ico', category: 'international' },
    { name: 'Disney+', url: 'https://www.disneyplus.com/favicon.ico', category: 'international' },
    
    // 国际AI平台
    { name: 'OpenAI', url: 'https://cdn.oaistatic.com/favicon.ico', category: 'international' },
    { name: 'Claude', url: 'https://claude.ai/favicon.ico', category: 'international' },
    
    // 国际社交平台
    { name: 'Facebook', url: 'https://www.facebook.com/favicon.ico', category: 'international' },
    { name: 'Twitter/X', url: 'https://abs.twimg.com/favicons/twitter.3.ico', category: 'international' },
    { name: 'Instagram', url: 'https://www.instagram.com/favicon.ico', category: 'international' },
    { name: 'TikTok', url: 'https://www.tiktok.com/favicon.ico', category: 'international' },
    { name: 'Reddit', url: 'https://www.reddit.com/favicon.ico', category: 'international' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/favicon.ico', category: 'international' },
    
    // 国际技术平台
    { name: 'GitHub', url: 'https://github.com/favicon.ico', category: 'international' },
    { name: 'Stack Overflow', url: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico', category: 'international' },
    { name: 'GitLab', url: 'https://gitlab.com/favicon.ico', category: 'international' },
    
    // 国际云服务
    { name: 'AWS', url: 'https://a0.awsstatic.com/libra-css/images/site/fav/favicon.ico', category: 'international' },
    { name: 'Azure', url: 'https://azure.microsoft.com/favicon.ico', category: 'international' },
    { name: 'Cloudflare', url: 'https://www.cloudflare.com/favicon.ico', category: 'international' },
    
    // 国内搜索引擎
    { name: 'Baidu', url: 'https://www.baidu.com/favicon.ico', category: 'domestic' },
    { name: 'Sogou', url: 'https://www.sogou.com/favicon.ico', category: 'domestic' },
    
    // 国内媒体
    { name: 'Bilibili', url: 'https://www.bilibili.com/favicon.ico', category: 'domestic' },
    { name: 'iQIYI', url: 'https://www.iqiyi.com/favicon.ico', category: 'domestic' },
    
    // 国内社交平台
    { name: 'WeChat', url: 'https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico', category: 'domestic' },
    { name: 'Weibo', url: 'https://weibo.com/favicon.ico', category: 'domestic' },
    { name: 'Douyin', url: 'https://www.douyin.com/favicon.ico', category: 'domestic' },
    { name: 'Zhihu', url: 'https://static.zhihu.com/heifetz/favicon.ico', category: 'domestic' },
    { name: 'Xiaohongshu', url: 'https://www.xiaohongshu.com/favicon.ico', category: 'domestic' },
    
    // 国内电商
    { name: 'Taobao', url: 'https://www.taobao.com/favicon.ico', category: 'domestic' },
    { name: 'JD.com', url: 'https://www.jd.com/favicon.ico', category: 'domestic' },
    { name: 'Pinduoduo', url: 'https://www.pinduoduo.com/favicon.ico', category: 'domestic' }
];

// 定义蓝色图标（用户位置）
const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// 定义红色图标（查询目标）
const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function loadMapScenario() {
    const satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 18
    });

    const streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19
    });

    // 检测是否为移动设备
    const isMobile = window.innerWidth <= 768;
    
    map = L.map('map-container', {
        center: [30, 0],
        zoom: 2,
        layers: [satelliteMap],
        zoomControl: !isMobile, // 移动端默认隐藏缩放控件
        tap: true, // 启用触摸支持
        tapTolerance: 15 // 增加触摸容差
    });
    
    // 移动端添加缩放控件到右下角
    if (isMobile) {
        L.control.zoom({
            position: 'bottomright'
        }).addTo(map);
    }

    const baseLayers = {
        "卫星地图": satelliteMap,
        "街道地图": streetMap
    };

    L.control.layers(baseLayers, null, {
        position: isMobile ? 'topright' : 'topright'
    }).addTo(map);
    
    getUserLocation();
    getUserIP();
    getBlockedSiteIP();
    getResultData();
    updateHistoryList();
    initServiceConnectivity();
}


function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                userLocation = [latitude, longitude]; 

                const isMobile = window.innerWidth <= 768;
                const zoomLevel = isMobile ? 12 : 16;
                map.setView(userLocation, zoomLevel);

                if (userMarker) {
                    userMarker.remove();
                }

                userMarker = L.marker(userLocation, { icon: blueIcon }).addTo(map)
                    .bindPopup("<b>您的位置</b>").openPopup();
            },
            (error) => {
                console.error("无法获取您的位置，距离信息将不可用:", error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        console.error("您的浏览器不支持地理定位功能。");
    }
}

function getUserIP() {
    const userIpElem = document.getElementById("user-ip");
    userIpElem.classList.add('loading-shimmer');
    
    // 使用国际IP查询服务（会触发分流规则）
    // 优先使用ipify（Cloudflare托管），如果失败则使用ipapi.co
    fetch("https://api.ipify.org?format=json")
        .then((response) => response.json())
        .then((data) => {
            if (data.ip) {
                return fetchIPDataWithFallback(data.ip);
            } else {
                throw new Error('无法获取IP');
            }
        })
        .then((data) => {
            userIpElem.classList.remove('loading-shimmer');
            userIpElem.innerHTML = `<div style="font-weight: 500; margin-bottom: 0.25rem;">${data.ip}</div>
                                    <div style="font-size: 0.875rem; color: var(--text-secondary);">${data.city || ''}, ${data.country_name || ''}</div>`;
        })
        .catch((error) => {
            console.error(error);
            // 如果ipify失败，直接使用ipapi.co
            fetchIPDataWithFallback('')
                .then((data) => {
                    userIpElem.classList.remove('loading-shimmer');
                    userIpElem.innerHTML = `<div style="font-weight: 500; margin-bottom: 0.25rem;">${data.ip}</div>
                                            <div style="font-size: 0.875rem; color: var(--text-secondary);">${data.city || ''}, ${data.country_name || ''}</div>`;
                })
                .catch((error) => {
                    console.error(error);
                    userIpElem.classList.remove('loading-shimmer');
                    userIpElem.textContent = "获取失败";
                });
        });
}

function getBlockedSiteIP() {
    const blockedSiteIpElem = document.getElementById("blocked-site-ip");
    blockedSiteIpElem.classList.add('loading-shimmer');
    
    fetch("https://ipleak.net/json/")
        .then((response) => response.json())
        .then((data) => {
            blockedSiteIpElem.classList.remove('loading-shimmer');
            blockedSiteIpElem.innerHTML = `<div style="font-weight: 500; margin-bottom: 0.25rem;">${data.ip}</div>
                                           <div style="font-size: 0.875rem; color: var(--text-secondary);">${data.country_name || 'Unknown'}</div>`;
        })
        .catch((error) => {
            console.error(error);
            blockedSiteIpElem.classList.remove('loading-shimmer');
            blockedSiteIpElem.textContent = "获取失败";
        });
}

function getResultData() {
    const resultElem = document.getElementById("result");
    resultElem.classList.add('loading-shimmer');
    
    fetch("https://ipv4_ct.itdog.cn")
        .then(response => {
            if (!response.ok) {
                throw new Error(`网络响应失败: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            resultElem.classList.remove('loading-shimmer');
            if (data.type === 'success' && data.ip && data.address) {
                const displayAddress = data.address.replace(/\//g, " ");
                resultElem.innerHTML = `<div style="font-weight: 500; margin-bottom: 0.25rem;">${data.ip}</div>
                                        <div style="font-size: 0.875rem; color: var(--text-secondary);">${displayAddress}</div>`;
            } else {
                const errorMsg = data.message || '返回数据格式不正确';
                console.error("itdog API error:", errorMsg);
                resultElem.textContent = `获取失败: ${errorMsg}`;
            }
        })
        .catch(error => {
            console.error("获取国内 IP 数据时出错:", error);
            resultElem.classList.remove('loading-shimmer');
            resultElem.textContent = "获取失败";
        });
}





function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d.toFixed(2);
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}


// IP查询API列表（按优先级排序）
const ipApiProviders = [
    {
        name: 'ipapi.co',
        getUrl: (ip) => ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/',
        parseResponse: (data) => ({
            ip: data.ip,
            city: data.city,
            region: data.region,
            country_name: data.country_name,
            org: data.org,
            latitude: data.latitude,
            longitude: data.longitude
        })
    },
    {
        name: 'ip-api.com',
        getUrl: (ip) => ip ? `http://ip-api.com/json/${ip}` : 'http://ip-api.com/json/',
        parseResponse: (data) => ({
            ip: data.query,
            city: data.city,
            region: data.regionName,
            country_name: data.country,
            org: data.isp,
            latitude: data.lat,
            longitude: data.lon
        })
    },
    {
        name: 'ipwhois.app',
        getUrl: (ip) => ip ? `https://ipwhois.app/json/${ip}` : 'https://ipwhois.app/json/',
        parseResponse: (data) => ({
            ip: data.ip,
            city: data.city,
            region: data.region,
            country_name: data.country,
            org: data.isp,
            latitude: data.latitude,
            longitude: data.longitude
        })
    }
];

let currentApiIndex = 0;

// 使用多个API提供商获取IP数据
async function fetchIPDataWithFallback(ip = '') {
    for (let i = 0; i < ipApiProviders.length; i++) {
        const apiIndex = (currentApiIndex + i) % ipApiProviders.length;
        const provider = ipApiProviders[apiIndex];
        
        try {
            const response = await fetch(provider.getUrl(ip));
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            const parsedData = provider.parseResponse(data);
            
            // 如果成功，更新当前API索引
            currentApiIndex = apiIndex;
            return parsedData;
        } catch (error) {
            console.warn(`${provider.name} 失败:`, error.message);
            // 继续尝试下一个API
        }
    }
    
    throw new Error('所有IP查询API都失败了');
}

function getDNSInfo() {
    const input = document.getElementById("domain-input").value.trim();
    if (!input) return;

    const isIPv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(input);
    const isIPv6 = /^[a-fA-F0-9:]+$/.test(input);

    const fetchDomainData = async (domain) => {
        let response = await fetch(`https://dns.alidns.com/resolve?name=${domain}&type=A`);
        let data = await response.json();
        if (!data.Answer || data.Answer.length === 0) {
            response = await fetch(`https://dns.alidns.com/resolve?name=${domain}&type=AAAA`);
            data = await response.json();
        }
        return data;
    };

    if (isIPv4 || isIPv6) {
        fetchIPDataWithFallback(input)
            .then(data => displayResult(data, input))
            .catch(error => {
                console.error("查询 IP 出错：", error);
                const resultContainer = document.getElementById("query-result-container");
                resultContainer.classList.add('active');
                resultContainer.innerHTML = `
                    <div class="query-result-content">
                        <div class="query-result-item">
                            <div class="query-result-label">错误</div>
                            <div class="query-result-value">查询失败，请稍后重试</div>
                        </div>
                    </div>
                `;
            });
    } else {
        fetchDomainData(input)
            .then(data => {
                if (!data.Answer || data.Answer.length === 0) throw new Error("无解析记录");
                const ipAddress = data.Answer[0].data;
                return fetchIPDataWithFallback(ipAddress);
            })
            .then(ipData => displayResult(ipData, ipData.ip))
            .catch(error => {
                console.error("查询域名出错：", error);
                const resultContainer = document.getElementById("query-result-container");
                resultContainer.classList.add('active');
                resultContainer.innerHTML = `
                    <div class="query-result-content">
                        <div class="query-result-item">
                            <div class="query-result-label">错误</div>
                            <div class="query-result-value">查询失败，请检查域名是否正确</div>
                        </div>
                    </div>
                `;
            });
    }
}



function displayResult(data, input) {
    const resultContainer = document.getElementById("query-result-container");
    resultContainer.classList.add('active');
    
    const city = data.city || 'N/A';
    const region = data.region || 'N/A';
    const country = data.country_name || 'N/A';
    const org = data.org || 'N/A';
    
    resultContainer.innerHTML = `
        <div class="query-result-content">
            <div class="query-result-item">
                <div class="query-result-label">IP 地址</div>
                <div class="query-result-value">${data.ip || input}</div>
            </div>
            <div class="query-result-item">
                <div class="query-result-label">归属地</div>
                <div class="query-result-value">${city}, ${region}, ${country}</div>
            </div>
            <div class="query-result-item">
                <div class="query-result-label">运营商</div>
                <div class="query-result-value">${org}</div>
            </div>
        </div>
    `;

    if (!data.latitude || !data.longitude) {
        console.warn("查询结果缺少坐标信息，无法在地图上显示。");
        if (queryMarker) queryMarker.remove();
        if (queryLine) queryLine.remove();
        return;
    }

    const targetLocation = [data.latitude, data.longitude];

    if (queryMarker) queryMarker.remove();
    if (queryLine) queryLine.remove();
    
    queryMarker = L.marker(targetLocation, { icon: redIcon }).addTo(map);

    if (userLocation) {
        const distance = getDistance(userLocation[0], userLocation[1], data.latitude, data.longitude);
        const popupContent = `<b>查询结果</b><br>距您 ${distance} 公里`;
        queryMarker.bindPopup(popupContent).openPopup();

        // 绘制红色虚线弧线
        const midPoint = [(userLocation[0] + targetLocation[0]) / 2, (userLocation[1] + targetLocation[1]) / 2];
        const latDiff = targetLocation[0] - userLocation[0];
        const lngDiff = targetLocation[1] - userLocation[1];
        const k = 0.2;
        const controlPoint = [
            midPoint[0] + k * lngDiff,
            midPoint[1] - k * latDiff
        ];

        if (typeof L.curve === 'function') {
            queryLine = L.curve(
                ['M', userLocation, 'Q', controlPoint, targetLocation], {
                    color: 'red',
                    weight: 2,
                    opacity: 0.8,
                    dashArray: '5, 5'
                }
            ).addTo(map);
        } else {
            queryLine = L.polyline([userLocation, targetLocation], {
                color: 'red',
                weight: 2,
                opacity: 0.8,
                dashArray: '5, 5'
            }).addTo(map);
        }

        const bounds = L.latLngBounds([userLocation, targetLocation]);
        const isMobile = window.innerWidth <= 768;
        const padding = isMobile ? [30, 30] : [50, 50];
        map.fitBounds(bounds, { padding: padding });

    } else {
        console.warn("用户位置未知，仅显示查询目标。");
        queryMarker.bindPopup("<b>查询结果</b>").openPopup();
        const isMobile = window.innerWidth <= 768;
        const zoomLevel = isMobile ? 8 : 10;
        map.setView(targetLocation, zoomLevel);
    }
    saveToHistory(input);
}


// ... saveToHistory, updateHistoryList, searchLocationOnMap 和 事件监听器 保持不变 ...
function saveToHistory(query) {
    let history = JSON.parse(localStorage.getItem("queryHistory")) || [];
    if (!history.includes(query)) {
        history.push(query);
        localStorage.setItem("queryHistory", JSON.stringify(history));
        updateHistoryList();
    }
}

function updateHistoryList() {
    const history = JSON.parse(localStorage.getItem("queryHistory")) || [];
    const historyList = document.getElementById("history-list");
    historyList.innerHTML = "";
    history.forEach((item) => {
        const option = document.createElement("option");
        option.value = item;
        historyList.appendChild(option);
    });
}

async function searchLocationOnMap() {
    const input = document.getElementById("domain-input").value.trim();
    if (input === "") return;

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&limit=1`);
        const data = await response.json();

        if (data && data.length > 0) {
            const location = data[0];
            const coordinates = [parseFloat(location.lat), parseFloat(location.lon)];
            map.setView(coordinates, 12);

            if (queryMarker) {
                queryMarker.remove();
            }
            if (queryLine) {
                queryLine.remove();
            }
            queryMarker = L.marker(coordinates, { icon: redIcon }).addTo(map).bindPopup(location.display_name).openPopup();
        }
    } catch (error) {
        console.error('Error with location search:', error);
    }
}

// 刷新按钮事件
document.addEventListener('DOMContentLoaded', () => {
    // 这里的事件监听器已经移到 window.addEventListener("load") 中
});

// 初始化服务连通性测试
function initServiceConnectivity() {
    const serviceGrid = document.getElementById('service-grid');
    serviceGrid.innerHTML = '';
    
    // 先显示国际服务，再显示国内服务
    const sortedServices = [
        ...globalServices.filter(s => s.category === 'international'),
        ...globalServices.filter(s => s.category === 'domestic')
    ];
    
    sortedServices.forEach(service => {
        const serviceItem = document.createElement('div');
        serviceItem.className = 'service-item';
        serviceItem.id = `service-${service.name.replace(/[^a-zA-Z0-9]/g, '')}`;
        
        serviceItem.innerHTML = `
            <div class="service-status loading"></div>
            <div class="service-name">${service.name}</div>
            <div class="service-latency">测试中...</div>
        `;
        
        // 添加点击事件，单独测试该服务
        serviceItem.addEventListener('click', () => {
            testService(service);
        });
        
        serviceGrid.appendChild(serviceItem);
    });
    
    // 初始化 Lucide 图标
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    testAllServices();
}

// 测试所有服务
async function testAllServices() {
    for (const service of globalServices) {
        testService(service);
    }
}

// 测试单个服务
async function testService(service) {
    const serviceId = `service-${service.name.replace(/[^a-zA-Z0-9]/g, '')}`;
    const serviceItem = document.getElementById(serviceId);
    if (!serviceItem) return;
    
    const statusDot = serviceItem.querySelector('.service-status');
    const latencyElem = serviceItem.querySelector('.service-latency');
    
    statusDot.className = 'service-status loading';
    latencyElem.textContent = '测试中...';
    
    try {
        const startTime = performance.now();
        
        // 使用 fetch 测试连通性和延迟
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
        
        const response = await fetch(service.url, {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);
        
        statusDot.className = 'service-status online';
        latencyElem.textContent = `${latency}ms`;
        
    } catch (error) {
        if (error.name === 'AbortError') {
            statusDot.className = 'service-status offline';
            latencyElem.textContent = '超时';
        } else {
            // no-cors 模式下，即使成功也可能抛出错误，但我们可以测量延迟
            const endTime = performance.now();
            const latency = Math.round(endTime - performance.now() + 100); // 估算
            
            statusDot.className = 'service-status online';
            latencyElem.textContent = `${latency}ms`;
        }
    }
}

window.addEventListener("load", () => {
    setTimeout(loadMapScenario, 0); 
    
    const domainInput = document.getElementById("domain-input");
    const submitBtn = document.getElementById("submit-btn");
    
    domainInput.addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            getDNSInfo();
        }
    });
    
    submitBtn.addEventListener("click", getDNSInfo);
    
    // 初始化刷新按钮
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const icon = refreshBtn.querySelector('i');
            if (icon) {
                icon.style.animation = 'spin 1s linear';
                setTimeout(() => {
                    icon.style.animation = '';
                }, 1000);
            }
            
            getUserIP();
            getBlockedSiteIP();
            getResultData();
        });
    }
    
    // 初始化重新测试按钮
    const retestBtn = document.getElementById('retest-btn');
    if (retestBtn) {
        retestBtn.addEventListener('click', () => {
            const icon = retestBtn.querySelector('i');
            if (icon) {
                icon.style.animation = 'spin 1s linear';
                setTimeout(() => {
                    icon.style.animation = '';
                }, 1000);
            }
            
            testAllServices();
        });
    }
    
    // 初始化 Lucide 图标
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // 监听窗口大小变化，重新调整地图
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 250);
    });
    
    // 监听屏幕方向变化
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 300);
    });
});

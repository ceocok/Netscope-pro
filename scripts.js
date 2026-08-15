let map;
let userMarker;
let queryMarker;
let queryLine;
let userLocation = null;
let currentPublicIp = null;
let exitNodeIp = null;
let domesticIp = null;
let domesticIpAddress = '';
let runQualityCheckHandler = null;
let qualityCache = { ip: null, ts: 0, data: null };


const COUNTRY_ZH_MAP = {
    'CN': '中国', 'JP': '日本', 'US': '美国', 'FR': '法国', 'DE': '德国', 'GB': '英国',
    'HK': '中国香港', 'TW': '中国台湾', 'SG': '新加坡', 'KR': '韩国', 'RU': '俄罗斯',
    'CA': '加拿大', 'AU': '澳大利亚', 'IN': '印度', 'NL': '荷兰', 'SE': '瑞典', 'CH': '瑞士'
};

const CITY_ZH_MAP = {
    'Tokyo': '东京', 'Paris': '巴黎', 'Singapore': '新加坡', 'Hong Kong': '香港',
    'Beijing': '北京', 'Shanghai': '上海', 'Xiangtan': '湘潭', 'Ebara': '东京', 'Yongzhou': '永州', 'Mong Kok': '旺角', 'Yau Tsim Mong': '油尖旺区', 'Hong Kong': '中国香港'
};

function toZhCountry(v) {
    if (!v) return '未知';
    const s = String(v).trim();
    const up = s.toUpperCase();
    if (COUNTRY_ZH_MAP[up]) return COUNTRY_ZH_MAP[up];
    const byName = {
        'China': '中国', 'Japan': '日本', 'United States': '美国', 'France': '法国',
        'Germany': '德国', 'United Kingdom': '英国', 'Singapore': '新加坡', 'Korea': '韩国', 'Hong Kong': '中国香港', 'Hong Kong SAR': '中国香港'
    };
    return byName[s] || s;
}

function toZhCity(v) {
    if (!v) return '';
    const s = String(v).trim();
    return CITY_ZH_MAP[s] || s;
}

function formatLocationZh(city, country) {
    const c = toZhCity(city);
    const n = toZhCountry(country);
    if (c && n && c !== 'N/A' && n !== '未知') return `${c}，${n}`;
    if (n && n !== '未知') return n;
    return c || '未知';
}

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
    { name: 'OpenAI', url: 'https://chat.openai.com/', category: 'international' },
    { name: 'Claude', url: 'https://claude.ai/', category: 'international' },
    
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
    getUserIP().finally(() => getResultData());
    getBlockedSiteIP();
    updateHistoryList();
    initServiceConnectivity();
}


function getUserLocation() {
    if (navigator.geolocation) {
        const handleSuccess = (position) => {
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
        };

        const handleError = (error, retryLowAccuracy = true) => {
            const errorMap = {
                1: '定位权限被拒绝',
                2: '暂时无法获取当前位置',
                3: '定位请求超时'
            };
            const errorText = errorMap[error.code] || error.message || '未知定位错误';
            console.error('无法获取您的位置，距离信息将不可用:', {
                code: error.code,
                message: error.message,
                text: errorText
            });

            if (retryLowAccuracy && error.code !== 1) {
                navigator.geolocation.getCurrentPosition(
                    handleSuccess,
                    (retryError) => handleError(retryError, false),
                    {
                        enableHighAccuracy: false,
                        timeout: 15000,
                        maximumAge: 300000
                    }
                );
            }
        };

        navigator.geolocation.getCurrentPosition(
            handleSuccess,
            (error) => handleError(error, true),
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000
            }
        );
    } else {
        console.error("您的浏览器不支持地理定位功能。");
    }
}

async function getUserIP() {
    const userIpElem = document.getElementById("user-ip");
    userIpElem.classList.add('loading-shimmer');

    // 优先使用更能反映代理出口的服务
    const providers = [
        {
            name: 'ipinfo.io',
            url: 'https://ipinfo.io/json',
            parse: (data) => ({
                ip: data.ip,
                city: data.city,
                country_name: data.country
            })
        },
        {
            name: 'api64.ipify.org',
            url: 'https://api64.ipify.org?format=json',
            parse: (data) => ({
                ip: data.ip,
                city: null,
                country_name: null
            })
        },
        {
            name: 'ipapi.co',
            url: 'https://ipapi.co/json/',
            parse: (data) => ({
                ip: data.ip,
                city: data.city,
                country_name: data.country_name
            })
        },
        {
            name: 'itdog-ipv6',
            url: 'https://ipv6_ct.itdog.cn',
            parse: (data) => ({
                ip: data?.type === 'success' ? data.ip : null,
                city: null,
                country_name: null,
                location_text: data?.address ? data.address.replace(/\//g, ' ') : null
            })
        }
    ];

    try {
        let lastErr = null;
        let data = null;

        for (const p of providers) {
            try {
                const response = await fetchWithTimeout(p.url, { headers: { 'Accept': 'application/json' } }, 8000);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const raw = await response.json();
                const parsed = p.parse(raw);
                if (!parsed.ip) throw new Error('缺少IP字段');
                data = parsed;
                break;
            } catch (e) {
                lastErr = e;
            }
        }

        if (!data) throw lastErr || new Error('无法获取公网IP');

        currentPublicIp = data.ip;
        userIpElem.classList.remove('loading-shimmer');
        const locationText = data.location_text || formatLocationZh(data.city, data.country_name);
        userIpElem.innerHTML = `<div style="font-weight: 500; margin-bottom: 0.25rem;">${data.ip}</div>
                                <div style="font-size: 0.875rem; color: var(--text-secondary);">${locationText}</div>`;
    } catch (error) {
        console.error('获取用户IP失败:', error);
        userIpElem.classList.remove('loading-shimmer');

        let errorMsg = '请检查网络连接';
        if (error.message.includes('超时')) {
            errorMsg = 'API 超时，请稍后重试';
        } else if (error.message.includes('网络错误')) {
            errorMsg = '网络错误，请检查连接';
        } else if (error.message.includes('限流') || error.message.includes('429')) {
            errorMsg = '服务限流，请稍后重试';
        }

        userIpElem.innerHTML = `<div style="font-weight: 500; margin-bottom: 0.25rem;">获取失败</div>
                                <div style="font-size: 0.875rem; color: var(--text-secondary);">${errorMsg}</div>`;
    }
}

async function getBlockedSiteIP() {
    const blockedSiteIpElem = document.getElementById("blocked-site-ip");
    blockedSiteIpElem.classList.add('loading-shimmer');
    
    try {
        const response = await fetchWithTimeout("https://dns.google/resolve?name=whoami.ds.akahelp.net&type=TXT", {
            headers: {
                'Accept': 'application/json'
            },
            cache: 'no-store'
        }, 8000);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        const answers = Array.isArray(data.Answer) ? data.Answer : [];
        const ipRecords = answers
            .map((answer) => (answer.data || '').match(/^ip(.+)$/i)?.[1]?.trim())
            .filter(Boolean);
        const ip =
            ipRecords.find((value) => /^\d{1,3}(\.\d{1,3}){3}$/.test(value)) ||
            ipRecords.find((value) => value.includes(':'));

        if (!ip) {
            throw new Error('未返回 Google 出口 IP');
        }

        exitNodeIp = ip;
        let blockedLocation = '归属地暂不可用';
        try {
            const locationResponse = await fetchWithTimeout(`https://ipinfo.io/${encodeURIComponent(ip)}/json`, {
                headers: { 'Accept': 'application/json' },
                cache: 'no-store'
            }, 8000);
            if (locationResponse.ok) {
                const locationData = await locationResponse.json();
                blockedLocation = formatLocationZh(locationData.city, locationData.country);
            }
        } catch {
            // 归属地是附加信息，失败时保留已获取到的 Google 出口 IP。
        }

        blockedSiteIpElem.classList.remove('loading-shimmer');
        blockedSiteIpElem.innerHTML = `<div style="font-weight: 500; margin-bottom: 0.25rem;">${ip}</div>
                                       <div style="font-size: 0.875rem; color: var(--text-secondary);">${blockedLocation}</div>`;
    } catch (error) {
        console.error('获取被墙站点IP失败:', error);
        blockedSiteIpElem.classList.remove('loading-shimmer');
        
        let errorMsg = 'API不可用';
        if (error.message.includes('超时')) {
            errorMsg = 'API 超时，请稍后重试';
        } else if (error.message.includes('网络错误')) {
            errorMsg = '网络错误，请检查连接';
        }
        
        blockedSiteIpElem.innerHTML = `<div style="font-weight: 500; margin-bottom: 0.25rem;">获取失败</div>
                                       <div style="font-size: 0.875rem; color: var(--text-secondary);">${errorMsg}</div>`;
    }
}

async function fetchTextFromProviders(providers, timeoutMs = 8000) {
    let lastErr = null;

    for (const p of providers) {
        try {
            const response = await fetchWithTimeout(p.url, {
                headers: { 'Accept': p.accept || 'text/plain' },
                cache: 'no-store'
            }, timeoutMs);

            if (!response.ok) throw new Error(`${p.name}: HTTP ${response.status}`);

            const text = (await response.text()).trim();
            const parsed = p.parse ? p.parse(text) : text;
            if (!parsed) throw new Error(`${p.name}: 返回为空`);
            return parsed;
        } catch (error) {
            lastErr = error;
        }
    }

    throw lastErr || new Error('所有 IP API 均不可用');
}

async function getResultData() {
    const resultElem = document.getElementById("result");
    resultElem.classList.add('loading-shimmer');
    
    try {
        const ipv4Promise = fetchTextFromProviders([
            {
                name: 'myip.ipip.net',
                url: 'https://myip.ipip.net',
                parse: (text) => {
                    const ip = text.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/)?.[0] || '';
                    const locationText = text
                        .replace(/^当前\s*IP[：:]\s*/i, '')
                        .replace(ip, '')
                        .replace(/来自于[：:]?/g, '')
                        .trim();
                    return ip ? { ip, locationText } : null;
                }
            },
            {
                name: 'ipv4.wtfismyip.com',
                url: 'https://ipv4.wtfismyip.com/text',
                parse: (text) => ({ ip: text.trim(), locationText: '' })
            },
            {
                name: 'v4.ident.me',
                url: 'https://v4.ident.me',
                parse: (text) => ({ ip: text.trim(), locationText: '' })
            },
            {
                name: 'ipv4.icanhazip.com',
                url: 'https://ipv4.icanhazip.com',
                parse: (text) => ({ ip: text.trim(), locationText: '' })
            }
        ]);
        const ipv6Promise = fetchTextFromProviders([
            { name: 'v6.ident.me', url: 'https://v6.ident.me' },
            { name: 'ipv6.icanhazip.com', url: 'https://ipv6.icanhazip.com' },
            { name: 'api.ipquery.io', url: 'https://api.ipquery.io' }
        ]);

        // 国内 IP 展示优先走支持 CORS 的 IPv4 API。myip.ipip.net 会直接返回国内归属地。
        const ipv4Data = await ipv4Promise.catch(() => null);
        const lookupIp = ipv4Data?.ip || await ipv6Promise.catch(() => '');
        if (!lookupIp) {
            throw new Error('无法获取国内 IPv4/IPv6 地址');
        }

        domesticIp = lookupIp;
        domesticIpAddress = ipv4Data?.locationText || '';
        const displayAddress = domesticIpAddress || '归属地暂不可用';
        const ipv4Text = ipv4Data?.ip || 'IPv4 获取失败';
        const ipv6 = await Promise.race([
            ipv6Promise.catch(() => ''),
            new Promise(resolve => setTimeout(() => resolve(''), 1200))
        ]);
        const ipv6Text = ipv6 || 'IPv6 查询中/获取失败';

        resultElem.classList.remove('loading-shimmer');
        resultElem.innerHTML = `<div style="font-weight: 500; margin-bottom: 0.15rem; line-height: 1.25;">IPv4：${ipv4Text}</div>
                                <div style="font-weight: 500; margin-bottom: 0.25rem; line-height: 1.25;">IPv6：${ipv6Text}</div>
                                <div style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.25;">${displayAddress}</div>`;
        if (typeof runQualityCheckHandler === 'function') {
            runQualityCheckHandler();
        }
    } catch (error) {
        console.error("获取国内 IP 数据时出错:", error);
        resultElem.classList.remove('loading-shimmer');
        
        let errorMsg = '请检查网络连接';
        if (error.message.includes('超时')) {
            errorMsg = 'API 超时，请稍后重试';
        } else if (error.message.includes('网络错误')) {
            errorMsg = '网络错误，请检查连接';
        }
        
        resultElem.innerHTML = `<div style="font-weight: 500; margin-bottom: 0.25rem;">获取失败</div>
                                <div style="font-size: 0.875rem; color: var(--text-secondary);">${errorMsg}</div>`;
    }
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

// 统一网络请求超时封装
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response;
        
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('请求超时');
        }
        
        // 区分网络错误和其他错误
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('网络错误，请检查连接');
        }
        
        throw error;
    }
}

function hasValidCoordinate(value) {
    if (value === null || value === undefined) {
        return false;
    }

    const text = String(value).trim();
    if (text === '') {
        return false;
    }

    return Number.isFinite(Number(text));
}

function parseLocationCoordinates(loc) {
    if (!loc || typeof loc !== 'string' || !loc.includes(',')) {
        return { latitude: null, longitude: null };
    }

    const [lat, lng] = loc.split(',');
    const latitude = Number.parseFloat(lat);
    const longitude = Number.parseFloat(lng);

    return {
        latitude: Number.isFinite(latitude) ? latitude : null,
        longitude: Number.isFinite(longitude) ? longitude : null
    };
}

function normalizeDnsName(value) {
    if (!value) return '';
    return String(value).trim().replace(/\.$/, '');
}

// IP查询API列表（按优先级排序，仅保留浏览器端实测支持 HTTPS 和 CORS 的 API）
const ipApiProviders = [
    {
        name: 'ipapi.is',
        getUrl: (ip) => ip ? `https://api.ipapi.is/?q=${encodeURIComponent(ip)}` : 'https://api.ipapi.is/',
        parseResponse: (data) => ({
            ip: data.ip || null,
            city: data.location?.city || null,
            region: data.location?.state || null,
            country_name: data.location?.country || null,
            org: data.company?.name || data.asn?.org || 'N/A',
            latitude: data.location?.latitude ?? null,
            longitude: data.location?.longitude ?? null
        }),
        rateLimit: 1000
    },
    {
        name: 'free.freeipapi.com',
        getUrl: (ip) => ip ? `https://free.freeipapi.com/api/json/${encodeURIComponent(ip)}` : 'https://free.freeipapi.com/api/json/',
        parseResponse: (data) => ({
            ip: data.ipAddress || null,
            city: data.cityName || null,
            region: data.regionName || null,
            country_name: data.countryName || null,
            org: data.asnOrganization || (data.isProxy ? 'Proxy' : 'N/A'),
            latitude: data.latitude ?? null,
            longitude: data.longitude ?? null
        }),
        rateLimit: 500
    },
    {
        name: 'ipinfo.io',
        getUrl: (ip) => ip ? `https://ipinfo.io/${encodeURIComponent(ip)}/json` : 'https://ipinfo.io/json',
        parseResponse: (data) => {
            const coords = parseLocationCoordinates(data.loc);
            return {
                ip: data.ip || null,
                city: data.city || null,
                region: data.region || null,
                country_name: data.country || null,
                org: data.org || 'N/A',
                latitude: coords.latitude,
                longitude: coords.longitude
            };
        },
        rateLimit: 500
    }
];

let currentApiIndex = 0;
let lastApiCallTime = 0;

// IP 质量检测 API 提供商
const qualityApiProviders = [
    {
        name: 'ipapi.is',
        url: (ip) => ip ? `https://api.ipapi.is/?q=${encodeURIComponent(ip)}` : 'https://api.ipapi.is/',
        parse: (d) => ({
            ip: d.ip || null,
            isProxy: !!d.is_proxy,
            isVpn: !!d.is_vpn,
            isTor: !!d.is_tor,
            isHosting: !!d.is_datacenter,
            networkType: d.asn?.type || null,
            companyType: d.company?.name || d.asn?.org || null,
            asn: d.asn?.asn ? `AS${d.asn.asn}` : (d.asn?.number ? `AS${d.asn.number}` : null)
        })
    },
    {
        name: 'free.freeipapi.com',
        url: (ip) => ip ? `https://free.freeipapi.com/api/json/${encodeURIComponent(ip)}` : 'https://free.freeipapi.com/api/json/',
        parse: (d) => ({
            ip: d.ipAddress || null,
            isProxy: !!d.isProxy,
            isVpn: false,
            isTor: false,
            isHosting: false,
            networkType: null,
            companyType: d.asnOrganization || null,
            asn: d.asn ? `AS${String(d.asn).replace(/^AS/i, '')}` : null
        })
    }
];

// 使用多个API提供商获取IP数据（带延迟和重试机制）
async function fetchIPDataWithFallback(ip = '') {
    const errors = [];
    
    for (let i = 0; i < ipApiProviders.length; i++) {
        const apiIndex = (currentApiIndex + i) % ipApiProviders.length;
        const provider = ipApiProviders[apiIndex];
        
        try {
            // 添加延迟避免频繁请求
            const now = Date.now();
            const timeSinceLastCall = now - lastApiCallTime;
            if (timeSinceLastCall < provider.rateLimit) {
                await new Promise(resolve => setTimeout(resolve, provider.rateLimit - timeSinceLastCall));
            }
            lastApiCallTime = Date.now();
            
            const response = await fetchWithTimeout(provider.getUrl(ip), {
                headers: {
                    'Accept': 'application/json'
                }
            }, 8000);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            const parsedData = provider.parseResponse(data);
            
            // 验证返回的数据是否完整
            if (!parsedData.ip || !hasValidCoordinate(parsedData.latitude) || !hasValidCoordinate(parsedData.longitude)) {
                throw new Error('返回数据不完整');
            }
            
            // 如果成功，更新当前API索引
            currentApiIndex = apiIndex;
            console.log(`✓ ${provider.name} 查询成功`);
            return parsedData;
            
        } catch (error) {
            const errorMsg = error.message || '未知错误';
            console.warn(`✗ ${provider.name} 失败: ${errorMsg}`);
            errors.push(`${provider.name}: ${errorMsg}`);
            // 继续尝试下一个API
        }
    }
    
    console.error('所有IP查询API都失败了:', errors);
    throw new Error(`所有IP查询API都失败了\n${errors.join('\n')}`);
}

function getDNSInfo() {
    const input = document.getElementById("domain-input").value.trim();
    if (!input) return;

    const isIPv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(input);
    const isIPv6 = /^[a-fA-F0-9:]+$/.test(input);

    // 彩蛋：兼容旧指令“地图:地点”/"map:place"
    const mapJumpMatch = input.match(/^(地图|map)\s*[:：]\s*(.+)$/i);
    if (mapJumpMatch) {
        const place = mapJumpMatch[2].trim();
        if (place) jumpToPlaceOnMap(place);
        return;
    }

    const fetchDomainData = async (domain) => {
        const [responseCname, responseA, responseAAAA] = await Promise.all([
            fetchWithTimeout(`https://dns.alidns.com/resolve?name=${domain}&type=CNAME`, {}, 8000),
            fetchWithTimeout(`https://dns.alidns.com/resolve?name=${domain}&type=A`, {}, 8000),
            fetchWithTimeout(`https://dns.alidns.com/resolve?name=${domain}&type=AAAA`, {}, 8000)
        ]);

        const [dataCname, dataA, dataAAAA] = await Promise.all([
            responseCname.json(),
            responseA.json(),
            responseAAAA.json()
        ]);

        const answerSets = [dataCname, dataA, dataAAAA].map(packet => Array.isArray(packet?.Answer) ? packet.Answer : []);
        const unique = (items) => [...new Set(items.filter(Boolean))];

        const cnameChain = unique(
            answerSets
                .flat()
                .filter(record => record?.type === 5)
                .map(record => normalizeDnsName(record.data))
        );

        const ipv4Records = unique(
            answerSets
                .flat()
                .filter(record => record?.type === 1)
                .map(record => record.data)
        );

        const ipv6Records = unique(
            answerSets
                .flat()
                .filter(record => record?.type === 28)
                .map(record => record.data)
        );

        const selectedIp =
            ipv4Records.find(ip => !isSpecialIp(ip)) ||
            ipv4Records[0] ||
            ipv6Records.find(ip => !isSpecialIp(ip)) ||
            ipv6Records[0] ||
            null;

        if (!selectedIp) {
            throw new Error("无解析记录");
        }

        return {
            ipAddress: selectedIp,
            cname: cnameChain[0] || null,
            cnameChain
        };
    };

    if (isIPv4 || isIPv6) {
        fetchIPDataWithFallback(input)
            .then(data => displayResult(data, input))
            .catch(error => {
                console.error("查询 IP 出错：", error);
                const resultContainer = document.getElementById("query-result-container");
                resultContainer.classList.add('active');
                
                let errorMsg = '查询失败，请稍后重试';
                if (error.message.includes('超时')) {
                    errorMsg = 'API 超时，请稍后重试';
                } else if (error.message.includes('网络错误')) {
                    errorMsg = '网络错误，请检查连接';
                }
                
                resultContainer.innerHTML = `
                    <div class="query-result-content">
                        <div class="query-result-item">
                            <div class="query-result-label">错误</div>
                            <div class="query-result-value">${errorMsg}</div>
                        </div>
                    </div>
                `;
            });
    } else {
        fetchDomainData(input)
            .then(async (domainData) => {
                const ipData = await fetchIPDataWithFallback(domainData.ipAddress);
                return {
                    ...ipData,
                    resolvedIp: domainData.ipAddress,
                    queryDomain: input,
                    cname: domainData.cname,
                    cnameChain: domainData.cnameChain
                };
            })
            .then(ipData => displayResult(ipData, input))
            .catch(async (error) => {
                console.error("查询域名出错：", error);

                // 直接输入地名时，自动尝试地图跳转（支持中文）
                const jumped = await jumpToPlaceOnMap(input);
                if (jumped) return;

                const resultContainer = document.getElementById("query-result-container");
                resultContainer.classList.add('active');
                
                let errorMsg = '查询失败，请检查域名是否正确';
                if (error.message.includes('超时')) {
                    errorMsg = 'DNS 查询超时，请稍后重试';
                } else if (error.message.includes('网络错误')) {
                    errorMsg = '网络错误，请检查连接';
                } else if (error.message.includes('无解析记录')) {
                    errorMsg = '域名无解析记录';
                }
                
                resultContainer.innerHTML = `
                    <div class="query-result-content">
                        <div class="query-result-item">
                            <div class="query-result-label">错误</div>
                            <div class="query-result-value">${errorMsg}</div>
                        </div>
                    </div>
                `;
            });
    }
}



function displayResult(data, input) {
    const resultContainer = document.getElementById("query-result-container");
    resultContainer.classList.add('active');
    
    const city = toZhCity(data.city || '');
    const region = data.region || '';
    const country = toZhCountry(data.country_name || '');
    const org = data.org || 'N/A';
    const locationText = [city, region, country].filter(Boolean).join('，') || '未知';
    const resolvedIp = data.resolvedIp || data.ip || input;
    const cnameText = data.cname || '';
    const cnameChain = Array.isArray(data.cnameChain) ? data.cnameChain : [];
    const hasMultiHopTrace = cnameChain.length > 1;
    const traceChainText = hasMultiHopTrace ? cnameChain.join(' -> ') : '';
    const traceChainHtml = traceChainText ? `
            <div class="query-result-item">
                <div class="query-result-label">解析链路</div>
                <div class="query-result-value">${traceChainText}</div>
            </div>
    ` : '';
    const cnameHtml = cnameChain.length === 1 && cnameText ? `
            <div class="query-result-item">
                <div class="query-result-label">CNAME</div>
                <div class="query-result-value">${cnameText}</div>
            </div>
    ` : '';
    
    resultContainer.innerHTML = `
        <div class="query-result-content">
            ${traceChainHtml}
            ${cnameHtml}
            <div class="query-result-item">
                <div class="query-result-label">IP 地址</div>
                <div class="query-result-value">${resolvedIp}</div>
            </div>
            <div class="query-result-item">
                <div class="query-result-label">归属地</div>
                <div class="query-result-value">${locationText}</div>
            </div>
            <div class="query-result-item">
                <div class="query-result-label">运营商</div>
                <div class="query-result-value">${org}</div>
            </div>
        </div>
    `;

    const latitude = Number(data.latitude);
    const longitude = Number(data.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        console.warn("查询结果缺少坐标信息，无法在地图上显示。");
        if (queryMarker) queryMarker.remove();
        if (queryLine) queryLine.remove();
        return;
    }

    const targetLocation = [latitude, longitude];

    if (queryMarker) queryMarker.remove();
    if (queryLine) queryLine.remove();
    
    queryMarker = L.marker(targetLocation, { icon: redIcon }).addTo(map);

    if (userLocation) {
        const distance = getDistance(userLocation[0], userLocation[1], latitude, longitude);
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

    // 用户查询域名/IP后，同步检测该目标IP质量
    if (typeof runQualityCheckHandler === 'function') {
        runQualityCheckHandler(data.ip || input);
    }
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

async function jumpToPlaceOnMap(place) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1&accept-language=zh-CN,zh`);
        const data = await response.json();

        if (data && data.length > 0) {
            const location = data[0];
            const latitude = Number.parseFloat(location.lat);
            const longitude = Number.parseFloat(location.lon);

            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
                console.warn("地图跳转返回了无效坐标。");
                return false;
            }

            const coordinates = [latitude, longitude];
            map.setView(coordinates, 12);

            if (queryMarker) queryMarker.remove();
            if (queryLine) queryLine.remove();

            const popup = `<b>地图跳转</b><br>${location.display_name}`;
            queryMarker = L.marker(coordinates, { icon: redIcon }).addTo(map).bindPopup(popup).openPopup();

            const resultContainer = document.getElementById("query-result-container");
            resultContainer.classList.add('active');
            resultContainer.innerHTML = `
                <div class="query-result-content">
                    <div class="query-result-item">
                        <div class="query-result-label">地图跳转</div>
                        <div class="query-result-value">${place}</div>
                    </div>
                    <div class="query-result-item">
                        <div class="query-result-label">坐标</div>
                        <div class="query-result-value">${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}</div>
                    </div>
                </div>
            `;
            return true;
        }
    } catch (error) {
        console.error('地图跳转失败:', error);
    }
    return false;
}

async function searchLocationOnMap() {
    const input = document.getElementById("domain-input").value.trim();
    if (input === "") return;
    return jumpToPlaceOnMap(input);
}

// 刷新按钮事件
// 已移到 window.addEventListener("load") 中

// IP 质量检测相关函数
function calcPurityScore(info) {
    let score = 100;

    // 强风险信号
    if (info.isTor) score -= 45;
    if (info.isProxy) score -= 30;
    if (info.isVpn) score -= 20;
    if (info.isHosting) score -= 25;

    // 网络类型影响
    const networkType = normalizeNetworkType(info);
    if (networkType === '机房') score -= 18;
    if (networkType === '家宽') score += 6;
    if (networkType === '运营商网络') score -= 6;
    if (networkType === '移动网络') score -= 8;
    if (networkType === '未知') score -= 10;

    // 组织特征微调（避免大量固定分）
    const org = (info.companyType || '').toLowerCase();
    const dcHints = ['cloud', 'aws', 'azure', 'gcp', 'oracle', 'digitalocean', 'linode', 'vultr', 'hosting', 'server'];
    const ispHints = ['broadband', 'residential', '家庭', '宽带', 'home network'];

    if (dcHints.some(k => org.includes(k))) score -= 10;
    if (ispHints.some(k => org.includes(k))) score += 4;

    // 信息不足时降分（防止动不动100）
    const weakSignals = [info.isProxy, info.isVpn, info.isTor, info.isHosting].every(v => !v);
    if (weakSignals && networkType === '未知') score -= 8;

    score = Math.max(0, Math.min(100, score));
    return score;
}

function getPurityLevel(score) {
    if (score >= 85) return { text: '纯净', cls: 'good' };
    if (score >= 60) return { text: '一般', cls: 'warn' };
    return { text: '风险', cls: 'bad' };
}


function isSpecialIp(ip) {
    if (!ip) return false;
    const v = String(ip).trim().toLowerCase();

    // IPv6 special/local（不把全球单播 IPv6 当特殊）
    if (v.includes(':')) {
        if (v === '::1') return true;
        if (v.startsWith('fc') || v.startsWith('fd')) return true; // ULA
        if (v.startsWith('fe8') || v.startsWith('fe9') || v.startsWith('fea') || v.startsWith('feb')) return true; // link-local fe80::/10
        return false;
    }

    const m = v.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if (!m) return false;
    const a = Number(m[1]), b = Number(m[2]), c = Number(m[3]);

    // RFC1918 / loopback / link-local / CGNAT / benchmark / TEST-NET
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a === 198 && (b === 18 || b === 19)) return true; // 198.18.0.0/15
    if (a === 192 && b === 0 && c === 2) return true;
    if (a === 198 && b === 51 && c === 100) return true;
    if (a === 203 && b === 0 && c === 113) return true;

    return false;
}

function normalizeNetworkType(info) {
    if (isSpecialIp(info.ip)) return '特殊网络';

    const nt = (info.networkType || '').toLowerCase();
    const ct = (info.companyType || '').toLowerCase();
    const asn = (info.asn || '').toLowerCase();
    const localHint = (info.localHint || '').toLowerCase();
    const all = `${nt} ${ct} ${asn} ${localHint}`;

    // 1) 先判移动网络（优先级高于其他类型）
    const mobileKeywords = [
        'wireless', 'cellular', 'lte', '5g', '4g', '3g',
        'verizon wireless', 'at&t mobility', 't-mobile', 'jio', 'airtel'
    ];
    if (mobileKeywords.some(k => all.includes(k))) return '移动网络';

    // 2) 再判机房/云厂商
    const datacenterKeywords = [
        'datacenter', 'data center', 'hosting', 'hosted', 'colo', 'colocation', 'server', 'vps',
        'cloud', 'clouds', 'cdn', 'edge',
        // 国际云厂商
        'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'oracle cloud',
        'digitalocean', 'linode', 'vultr', 'scaleway', 'ovh', 'hetzner', 'leaseweb', 'contabo',
        'akamai', 'cloudflare', 'fastly',
        // 国内云厂商
        'huawei', 'huaweicloud', 'huawei cloud',
        'alibaba', 'aliyun', 'alicloud', 'hangzhou alibaba',
        'tencent cloud', 'tencent', 'ucloud', 'baidu cloud', 'kingsoft cloud', 'volcengine',
        'facebook', 'meta', 'instagram', 'whatsapp',
        'landups', 'choopa', 'm247', 'multacom', 'psychz', 'frantech', 'buyvm'
    ];
    if (datacenterKeywords.some(k => all.includes(k))) return '机房';

    const carrierKeywords = [
        'china mobile', 'chinamobile', '中国移动', 'cmcc',
        'china unicom', '中国联通', 'unicom',
        'china telecom', '中国电信', 'telecom', 'chinanet',
        'china netcom', 'china tietong', 'carrier',
        'branch', 'province network', '省网', '联通', '电信', '移动'
    ];

    // 3) 当前本机国内 IP：结合 itdog 返回的地区/运营商信息，允许更大胆地识别为家宽
    if (info.isCurrentDomesticIp && carrierKeywords.some(k => all.includes(k))) {
        return '家宽';
    }

    // 4) 明确家宽/固网特征
    const residentialKeywords = [
        'residential', 'broadband', '家庭', '宽带', 'home network',
        'ftth', 'fiber to the home', 'dsl', 'adsl', 'pppoe',
        // 国际常见固网
        'comcast', 'charter', 'cox', 'centurylink', 'lumen', 'bt', 'virgin media',
        'deutsche telekom', 'orange', 'telefonica', 'vodafone', 'kddi', 'ntt', 'softbank'
    ];
    if (residentialKeywords.some(k => all.includes(k))) return '家宽';

    // 5) 运营商网络：大运营商 ASN / 分公司 / 省网，更接近承载网络或企业接入，不直接等价为家宽
    if (carrierKeywords.some(k => all.includes(k)) || nt === 'isp') return '运营商网络';

    // 6) 明确字段兜底
    if (nt.includes('residential')) return '家宽';
    if (nt.includes('mobile')) return '移动网络';
    if (nt.includes('datacenter') || nt.includes('hosting') || nt.includes('cloud')) return '机房';

    return '未知';
}

function setBadge(el, text, cls='neutral') {
    if (!el) return;
    el.className = `status-badge ${cls}`;
    el.textContent = text;
}

function getConfidence(signals, meta = {}) {
    const total = signals.length;
    const attempted = meta.attempted || total;

    if (total === 0) return { score: 20, text: '低', cls: 'bad' };

    // 成功率
    const successRate = total / Math.max(1, attempted);

    // 一致性
    const typeVotes = signals.map(s => normalizeNetworkType(s));
    const majorTypeCount = Math.max(...['家宽', '运营商网络', '机房', '移动网络', '未知'].map(t => typeVotes.filter(v => v === t).length));
    const agreement = majorTypeCount / total;

    // 完整度
    const completeness = signals.map(s => {
        let c = 0;
        if (s.ip) c += 1;
        if (s.companyType) c += 1;
        if (s.networkType) c += 1;
        c += Number(!!s.isProxy) + Number(!!s.isVpn) + Number(!!s.isTor) + Number(!!s.isHosting);
        return c / 7;
    }).reduce((a,b)=>a+b,0) / total;

    let confidenceScore = 25;
    confidenceScore += successRate * 35;
    confidenceScore += agreement * 25;
    confidenceScore += completeness * 15;

    confidenceScore = Math.round(Math.max(0, Math.min(100, confidenceScore)));

    if (confidenceScore >= 75) return { score: confidenceScore, text: '高', cls: 'good' };
    if (confidenceScore >= 55) return { score: confidenceScore, text: '中', cls: 'warn' };
    return { score: confidenceScore, text: '低', cls: 'bad' };
}

function mergeQualitySignals(signals, meta = {}) {
    const merged = {
        ip: signals[0]?.ip || null,
        isProxy: false,
        isVpn: false,
        isTor: false,
        isHosting: false,
        networkType: null,
        companyType: null,
        asn: null,
        confidence: getConfidence(signals, meta)
    };

    const vote = (key) => {
        const yes = signals.filter(s => !!s[key]).length;
        return yes > (signals.length / 2);
    };

    merged.isProxy = vote('isProxy');
    merged.isVpn = vote('isVpn');
    merged.isTor = vote('isTor');
    merged.isHosting = vote('isHosting');

    const types = signals.map(s => normalizeNetworkType(s));
    const priority = ['机房', '运营商网络', '家宽', '移动网络', '未知'];
    let bestType = '未知';
    let bestCount = -1;
    for (const t of priority) {
        const c = types.filter(x => x === t).length;
        if (c > bestCount) {
            bestCount = c;
            bestType = t;
        }
    }
    merged.networkType = bestType;

    const company = signals.map(s => s.companyType).find(Boolean);
    merged.companyType = company || null;

    const asn = signals.map(s => s.asn).find(Boolean);
    merged.asn = asn || null;

    return merged;
}

function getIpOriginType(info) {
    // 经验规则：出现代理/隧道/机房特征时视为“广播IP”，否则视为“原生IP”
    const networkType = info.networkType || normalizeNetworkType(info);
    const hasRelaySignals = !!(info.isProxy || info.isVpn || info.isTor || info.isHosting);
    if (isSpecialIp(info.ip)) return '广播IP';
    if (hasRelaySignals) return '广播IP';
    if (networkType === '机房') return '广播IP';
    return '原生IP';
}

function renderPurityUI(info) {
    const score = calcPurityScore(info);
    const level = getPurityLevel(score);
    const impurityScore = 100 - score; // 污染度：越低越好

    const scoreEl = document.getElementById('purity-score');
    const levelEl = document.getElementById('purity-level');
    const progressFillEl = document.getElementById('purity-progress-fill');
    const originEl = document.getElementById('ip-origin-badge');
    const netEl = document.getElementById('network-type-badge');
    const asnEl = document.getElementById('asn-text');

    const confidenceProgressEl = document.getElementById('confidence-progress-fill');
    const confidenceTextEl = document.getElementById('confidence-score-text');
    const impurityProgressEl = document.getElementById('impurity-progress-fill');
    const impurityTextEl = document.getElementById('impurity-score-text');

    if (scoreEl) scoreEl.textContent = `${score}`;
    if (levelEl) levelEl.textContent = `评级：${level.text}`;

    if (progressFillEl) {
        const percent = Math.max(0, Math.min(100, score));
        progressFillEl.style.width = `${percent}%`;
    }

    const networkType = info.networkType || normalizeNetworkType(info);
    const originType = getIpOriginType(info);
    if (originEl) setBadge(originEl, originType, originType === '原生IP' ? 'good' : 'warn');
    setBadge(netEl, networkType, networkType === '家宽' ? 'good' : networkType === '机房' ? 'bad' : networkType === '特殊网络' ? 'warn' : 'warn');
    if (asnEl) asnEl.textContent = `ASN: ${info.asn || '未知'}`;

    const visualPercent = (v) => {
        const clamped = Math.max(0, Math.min(100, Number(v) || 0));
        return clamped === 0 ? 2 : clamped; // 0 分也保留可见色条
    };

    const riskColor = (v) => {
        const n = Math.max(0, Math.min(100, Number(v) || 0));
        if (n >= 70) return '#ef4444'; // 高风险红
        if (n >= 40) return '#f59e0b'; // 中风险黄
        return '#22c55e'; // 低风险绿
    };



    const conf = info.confidence || { score: 60, text: '中', cls: 'warn' };
    if (confidenceProgressEl) confidenceProgressEl.style.width = `${visualPercent(conf.score || 60)}%`;
    if (confidenceTextEl) confidenceTextEl.textContent = `${Math.round(conf.score || 60)} (${conf.text})`;

    if (impurityProgressEl) {
        impurityProgressEl.style.width = `${visualPercent(impurityScore)}%`;
        impurityProgressEl.style.background = riskColor(impurityScore); // 污染高红低绿
    }
    if (impurityTextEl) impurityTextEl.textContent = `${Math.round(impurityScore)}`;
}

async function fetchIpQuality(ip='') {
    // 需求：默认检测国内IP；用户查询域名/IP时同步检测该目标IP
    const targetIp = ip || domesticIp || currentPublicIp || exitNodeIp || '';
    const errors = [];
    const signals = [];

    if (qualityCache.data && qualityCache.ip === targetIp && Date.now() - qualityCache.ts < 30000) {
        return qualityCache.data;
    }

    for (const p of qualityApiProviders) {
        try {
            const res = await fetchWithTimeout(p.url(targetIp), {
                headers: { 'Accept': 'application/json' }
            }, 10000);

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const raw = await res.json();
            if (p.name === 'ipwho.is' && raw && raw.success === false) {
                throw new Error(raw.message || 'ipwho.is 查询失败');
            }

            const info = p.parse(raw);
            if (!info.ip) throw new Error('返回数据缺少 IP 地址');

            if (targetIp && targetIp === domesticIp) {
                info.localHint = domesticIpAddress || '';
                info.isCurrentDomesticIp = true;
            }

            signals.push(info);
        } catch (e) {
            console.warn(`✗ ${p.name} 失败: ${e.message}`);
            errors.push(`${p.name}: ${e.message}`);
        }
    }

    if (signals.length === 0) {
        throw new Error(errors.join(' | '));
    }

    const merged = mergeQualitySignals(signals, { attempted: qualityApiProviders.length });
    qualityCache = { ip: targetIp, ts: Date.now(), data: merged };
    return merged;
}

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
    const concurrency = 6;
    for (let i = 0; i < globalServices.length; i += concurrency) {
        const chunk = globalServices.slice(i, i + concurrency);
        await Promise.all(chunk.map(s => testService(s)));
    }
}

// 通用 URL 探测函数
async function probeUrl(url, timeoutMs = 8000) {
    const attempts = [
        { method: 'GET', mode: 'no-cors' },
        { method: 'HEAD', mode: 'no-cors' }
    ];

    for (const attempt of attempts) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            const start = performance.now();

            await fetch(url, {
                method: attempt.method,
                mode: attempt.mode,
                cache: 'no-cache',
                redirect: 'follow',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const latency = Math.round(performance.now() - start);
            return { status: 'online', latency, method: attempt.method };
        } catch (error) {
            if (error.name === 'AbortError') {
                return { status: 'offline', error: '超时' };
            }
        }
    }

    return { status: 'unknown', error: '受浏览器策略限制' };
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
    
    const start = performance.now();
    const result = await probeUrl(service.url, 8000);
    const latency = Math.round(performance.now() - start);
    
    if (result.status === 'online') {
        statusDot.className = 'service-status online';
        latencyElem.textContent = `${latency}ms`;
    } else if (result.status === 'offline') {
        statusDot.className = 'service-status offline';
        latencyElem.textContent = result.error || '超时';
    } else {
        statusDot.className = 'service-status unknown';
        latencyElem.textContent = result.error || '受限';
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
            
            qualityCache = { ip: null, ts: 0, data: null };
            getUserIP();
            getBlockedSiteIP();
            getResultData();
            if (typeof runQualityCheckHandler === 'function') runQualityCheckHandler();
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
    
    // IP 质量检测初始化
    async function runQualityCheck(targetIp = '') {
        // 设置加载状态
        const scoreEl = document.getElementById('purity-score');
        const levelEl = document.getElementById('purity-level');
        if (scoreEl) scoreEl.textContent = '--';
        if (levelEl) levelEl.textContent = targetIp ? `评级：检测中（${targetIp}）...` : '评级：检测中...';

        try {
            const info = await fetchIpQuality(targetIp);
            renderPurityUI(info);
        } catch (e) {
            console.error('IP质量检测失败:', e);

            // 显示友好的错误信息
            if (scoreEl) scoreEl.textContent = '--';
            if (levelEl) {
                if (e.message.includes('超时')) {
                    levelEl.textContent = 'API 超时，请稍后重试';
                } else if (e.message.includes('网络错误')) {
                    levelEl.textContent = '网络错误，请检查连接';
                } else {
                    levelEl.textContent = '检测失败，请稍后重试';
                }
            }

            setBadge(document.getElementById('network-type-badge'), '检测失败', 'neutral');
            setBadge(document.getElementById('ip-origin-badge'), '检测失败', 'neutral');
            const asnEl = document.getElementById('asn-text');
            if (asnEl) asnEl.textContent = 'ASN: 检测失败';
            const confidenceTextEl = document.getElementById('confidence-score-text');
            const impurityTextEl = document.getElementById('impurity-score-text');
            const confidenceProgressEl = document.getElementById('confidence-progress-fill');
            const impurityProgressEl = document.getElementById('impurity-progress-fill');
            if (confidenceTextEl) confidenceTextEl.textContent = '--';
            if (impurityTextEl) impurityTextEl.textContent = '--';
            if (confidenceProgressEl) confidenceProgressEl.style.width = '0%';
            if (impurityProgressEl) impurityProgressEl.style.width = '0%';
        }
    }

    runQualityCheckHandler = runQualityCheck;
    runQualityCheck();

    
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

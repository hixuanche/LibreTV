// 改進的API請求處理函數
async function handleApiRequest(url) {
    const customApi = url.searchParams.get('customApi') || '';
    const customDetail = url.searchParams.get('customDetail') || '';
    const source = url.searchParams.get('source') || 'heimuer';
    
    try {
        if (url.pathname === '/api/search') {
            const searchQuery = url.searchParams.get('wd');
            if (!searchQuery) {
                throw new Error('缺少搜索參數');
            }
            
            // 驗證API和source的有效性
            if (source === 'custom' && !customApi) {
                throw new Error('使用自定義API時必須提供API地址');
            }
            
            if (!API_SITES[source] && source !== 'custom') {
                throw new Error('無效的API來源');
            }
            
            const apiUrl = customApi
                ? `${customApi}${API_CONFIG.search.path}${encodeURIComponent(searchQuery)}`
                : `${API_SITES[source].api}${API_CONFIG.search.path}${encodeURIComponent(searchQuery)}`;
            
            // 添加超時處理
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            try {
                const response = await fetch(PROXY_URL + encodeURIComponent(apiUrl), {
                    headers: API_CONFIG.search.headers,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`API請求失敗: ${response.status}`);
                }
                
                const data = await response.json();
                
                // 檢查JSON格式的有效性
                if (!data || !Array.isArray(data.list)) {
                    throw new Error('API返回的數據格式無效');
                }
                
                // 添加源信息到每個結果
                data.list.forEach(item => {
                    item.source_name = source === 'custom' ? '自定義源' : API_SITES[source].name;
                    item.source_code = source;
                    // 對於自定義源，添加API URL信息
                    if (source === 'custom') {
                        item.api_url = customApi;
                    }
                });
                
                return JSON.stringify({
                    code: 200,
                    list: data.list || [],
                });
            } catch (fetchError) {
                clearTimeout(timeoutId);
                throw fetchError;
            }
        }

        // 詳情處理
        if (url.pathname === '/api/detail') {
            const id = url.searchParams.get('id');
            const sourceCode = url.searchParams.get('source') || 'heimuer'; // 獲取源代碼
            
            if (!id) {
                throw new Error('缺少視頻ID參數');
            }
            
            // 驗證ID格式 - 只允許數字和有限的特殊字符
            if (!/^[\w-]+$/.test(id)) {
                throw new Error('無效的視頻ID格式');
            }

            // 驗證API和source的有效性
            if (sourceCode === 'custom' && !customApi) {
                throw new Error('使用自定義API時必須提供API地址');
            }
            
            if (!API_SITES[sourceCode] && sourceCode !== 'custom') {
                throw new Error('無效的API來源');
            }

            // 對於有detail參數的源，都使用特殊處理方式
            if (sourceCode !== 'custom' && API_SITES[sourceCode].detail) {
                return await handleSpecialSourceDetail(id, sourceCode);
            }
            
            // 如果是自定義API，並且傳遞了detail參數，嘗試特殊處理
            // 優先 customDetail
            if (sourceCode === 'custom' && customDetail) {
                return await handleCustomApiSpecialDetail(id, customDetail);
            }
            if (sourceCode === 'custom' && url.searchParams.get('useDetail') === 'true') {
                return await handleCustomApiSpecialDetail(id, customApi);
            }
            
            const detailUrl = customApi
                ? `${customApi}${API_CONFIG.detail.path}${id}`
                : `${API_SITES[sourceCode].api}${API_CONFIG.detail.path}${id}`;
            
            // 添加超時處理
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            try {
                const response = await fetch(PROXY_URL + encodeURIComponent(detailUrl), {
                    headers: API_CONFIG.detail.headers,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`詳情請求失敗: ${response.status}`);
                }
                
                // 解析JSON
                const data = await response.json();
                
                // 檢查返回的數據是否有效
                if (!data || !data.list || !Array.isArray(data.list) || data.list.length === 0) {
                    throw new Error('獲取到的詳情內容無效');
                }
                
                // 獲取第一個匹配的視頻詳情
                const videoDetail = data.list[0];
                
                // 提取播放地址
                let episodes = [];
                
                if (videoDetail.vod_play_url) {
                    // 分割不同播放源
                    const playSources = videoDetail.vod_play_url.split('$$$');
                    
                    // 提取第一個播放源的集數（通常為主要源）
                    if (playSources.length > 0) {
                        const mainSource = playSources[0];
                        const episodeList = mainSource.split('#');
                        
                        // 從每個集數中提取URL
                        episodes = episodeList.map(ep => {
                            const parts = ep.split('$');
                            // 返回URL部分(通常是第二部分，如果有的話)
                            return parts.length > 1 ? parts[1] : '';
                        }).filter(url => url && (url.startsWith('http://') || url.startsWith('https://')));
                    }
                }
                
                // 如果沒有找到播放地址，嘗試使用正則表達式查找m3u8鏈接
                if (episodes.length === 0 && videoDetail.vod_content) {
                    const matches = videoDetail.vod_content.match(M3U8_PATTERN) || [];
                    episodes = matches.map(link => link.replace(/^\$/, ''));
                }
                
                return JSON.stringify({
                    code: 200,
                    episodes: episodes,
                    detailUrl: detailUrl,
                    videoInfo: {
                        title: videoDetail.vod_name,
                        cover: videoDetail.vod_pic,
                        desc: videoDetail.vod_content,
                        type: videoDetail.type_name,
                        year: videoDetail.vod_year,
                        area: videoDetail.vod_area,
                        director: videoDetail.vod_director,
                        actor: videoDetail.vod_actor,
                        remarks: videoDetail.vod_remarks,
                        // 添加源信息
                        source_name: sourceCode === 'custom' ? '自定義源' : API_SITES[sourceCode].name,
                        source_code: sourceCode
                    }
                });
            } catch (fetchError) {
                clearTimeout(timeoutId);
                throw fetchError;
            }
        }

        throw new Error('未知的API路徑');
    } catch (error) {
        console.error('API處理錯誤:', error);
        return JSON.stringify({
            code: 400,
            msg: error.message || '請求處理失敗',
            list: [],
            episodes: [],
        });
    }
}

// 處理自定義API的特殊詳情頁
async function handleCustomApiSpecialDetail(id, customApi) {
    try {
        // 構建詳情頁URL
        const detailUrl = `${customApi}/index.php/vod/detail/id/${id}.html`;
        
        // 添加超時處理
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        // 獲取詳情頁HTML
        const response = await fetch(PROXY_URL + encodeURIComponent(detailUrl), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`自定義API詳情頁請求失敗: ${response.status}`);
        }
        
        // 獲取HTML內容
        const html = await response.text();
        
        // 使用通用模式提取m3u8鏈接
        const generalPattern = /\$(https?:\/\/[^"'\s]+?\.m3u8)/g;
        let matches = html.match(generalPattern) || [];
        
        // 處理鏈接
        matches = matches.map(link => {
            link = link.substring(1, link.length);
            const parenIndex = link.indexOf('(');
            return parenIndex > 0 ? link.substring(0, parenIndex) : link;
        });
        
        // 提取基本信息
        const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
        const titleText = titleMatch ? titleMatch[1].trim() : '';
        
        const descMatch = html.match(/<div[^>]*class=["']sketch["'][^>]*>([\s\S]*?)<\/div>/);
        const descText = descMatch ? descMatch[1].replace(/<[^>]+>/g, ' ').trim() : '';
        
        return JSON.stringify({
            code: 200,
            episodes: matches,
            detailUrl: detailUrl,
            videoInfo: {
                title: titleText,
                desc: descText,
                source_name: '自定義源',
                source_code: 'custom'
            }
        });
    } catch (error) {
        console.error(`自定義API詳情獲取失敗:`, error);
        throw error;
    }
}

// 通用特殊源詳情處理函數
async function handleSpecialSourceDetail(id, sourceCode) {
    try {
        // 構建詳情頁URL（使用配置中的detail URL而不是api URL）
        const detailUrl = `${API_SITES[sourceCode].detail}/index.php/vod/detail/id/${id}.html`;
        
        // 添加超時處理
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        // 獲取詳情頁HTML
        const response = await fetch(PROXY_URL + encodeURIComponent(detailUrl), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`詳情頁請求失敗: ${response.status}`);
        }
        
        // 獲取HTML內容
        const html = await response.text();
        
        // 根據不同源類型使用不同的正則表達式
        let matches = [];
        
        if (sourceCode === 'ffzy') {
            // 非凡影視使用特定的正則表達式
            const ffzyPattern = /\$(https?:\/\/[^"'\s]+?\/\d{8}\/\d+_[a-f0-9]+\/index\.m3u8)/g;
            matches = html.match(ffzyPattern) || [];
        }
        
        // 如果沒有找到鏈接或者是其他源類型，嘗試一個更通用的模式
        if (matches.length === 0) {
            const generalPattern = /\$(https?:\/\/[^"'\s]+?\.m3u8)/g;
            matches = html.match(generalPattern) || [];
        }
        // 去重處理，避免一個播放源多集顯示
        matches = [...new Set(matches)];
        // 處理鏈接
        matches = matches.map(link => {
            link = link.substring(1, link.length);
            const parenIndex = link.indexOf('(');
            return parenIndex > 0 ? link.substring(0, parenIndex) : link;
        });
        
        // 提取可能存在的標題、簡介等基本信息
        const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
        const titleText = titleMatch ? titleMatch[1].trim() : '';
        
        const descMatch = html.match(/<div[^>]*class=["']sketch["'][^>]*>([\s\S]*?)<\/div>/);
        const descText = descMatch ? descMatch[1].replace(/<[^>]+>/g, ' ').trim() : '';
        
        return JSON.stringify({
            code: 200,
            episodes: matches,
            detailUrl: detailUrl,
            videoInfo: {
                title: titleText,
                desc: descText,
                source_name: API_SITES[sourceCode].name,
                source_code: sourceCode
            }
        });
    } catch (error) {
        console.error(`${API_SITES[sourceCode].name}詳情獲取失敗:`, error);
        throw error;
    }
}

// 處理聚合搜索
async function handleAggregatedSearch(searchQuery) {
    // 獲取可用的API源列表（排除aggregated和custom）
    const availableSources = Object.keys(API_SITES).filter(key => 
        key !== 'aggregated' && key !== 'custom'
    );
    
    if (availableSources.length === 0) {
        throw new Error('沒有可用的API源');
    }
    
    // 創建所有API源的搜索請求
    const searchPromises = availableSources.map(async (source) => {
        try {
            const apiUrl = `${API_SITES[source].api}${API_CONFIG.search.path}${encodeURIComponent(searchQuery)}`;
            
            // 使用Promise.race添加超時處理
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`${source}源搜索超時`)), 8000)
            );
            
            const fetchPromise = fetch(PROXY_URL + encodeURIComponent(apiUrl), {
                headers: API_CONFIG.search.headers
            });
            
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            if (!response.ok) {
                throw new Error(`${source}源請求失敗: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data || !Array.isArray(data.list)) {
                throw new Error(`${source}源返回的數據格式無效`);
            }
            
            // 為搜索結果添加源信息
            const results = data.list.map(item => ({
                ...item,
                source_name: API_SITES[source].name,
                source_code: source
            }));
            
            return results;
        } catch (error) {
            console.warn(`${source}源搜索失敗:`, error);
            return []; // 返回空數組表示該源搜索失敗
        }
    });
    
    try {
        // 並行執行所有搜索請求
        const resultsArray = await Promise.all(searchPromises);
        
        // 合並所有結果
        let allResults = [];
        resultsArray.forEach(results => {
            if (Array.isArray(results) && results.length > 0) {
                allResults = allResults.concat(results);
            }
        });
        
        // 如果沒有搜索結果，返回空結果
        if (allResults.length === 0) {
            return JSON.stringify({
                code: 200,
                list: [],
                msg: '所有源均無搜索結果'
            });
        }
        
        // 去重（根據vod_id和source_code組合）
        const uniqueResults = [];
        const seen = new Set();
        
        allResults.forEach(item => {
            const key = `${item.source_code}_${item.vod_id}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueResults.push(item);
            }
        });
        
        // 按照視頻名稱和來源排序
        uniqueResults.sort((a, b) => {
            // 首先按照視頻名稱排序
            const nameCompare = (a.vod_name || '').localeCompare(b.vod_name || '');
            if (nameCompare !== 0) return nameCompare;
            
            // 如果名稱相同，則按照來源排序
            return (a.source_name || '').localeCompare(b.source_name || '');
        });
        
        return JSON.stringify({
            code: 200,
            list: uniqueResults,
        });
    } catch (error) {
        console.error('聚合搜索處理錯誤:', error);
        return JSON.stringify({
            code: 400,
            msg: '聚合搜索處理失敗: ' + error.message,
            list: []
        });
    }
}

// 處理多個自定義API源的聚合搜索
async function handleMultipleCustomSearch(searchQuery, customApiUrls) {
    // 解析自定義API列表
    const apiUrls = customApiUrls.split(CUSTOM_API_CONFIG.separator)
        .map(url => url.trim())
        .filter(url => url.length > 0 && /^https?:\/\//.test(url))
        .slice(0, CUSTOM_API_CONFIG.maxSources);
    
    if (apiUrls.length === 0) {
        throw new Error('沒有提供有效的自定義API地址');
    }
    
    // 為每個API創建搜索請求
    const searchPromises = apiUrls.map(async (apiUrl, index) => {
        try {
            const fullUrl = `${apiUrl}${API_CONFIG.search.path}${encodeURIComponent(searchQuery)}`;
            
            // 使用Promise.race添加超時處理
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`自定義API ${index+1} 搜索超時`)), 8000)
            );
            
            const fetchPromise = fetch(PROXY_URL + encodeURIComponent(fullUrl), {
                headers: API_CONFIG.search.headers
            });
            
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            if (!response.ok) {
                throw new Error(`自定義API ${index+1} 請求失敗: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data || !Array.isArray(data.list)) {
                throw new Error(`自定義API ${index+1} 返回的數據格式無效`);
            }
            
            // 為搜索結果添加源信息
            const results = data.list.map(item => ({
                ...item,
                source_name: `${CUSTOM_API_CONFIG.namePrefix}${index+1}`,
                source_code: 'custom',
                api_url: apiUrl // 保存API URL以便詳情獲取
            }));
            
            return results;
        } catch (error) {
            console.warn(`自定義API ${index+1} 搜索失敗:`, error);
            return []; // 返回空數組表示該源搜索失敗
        }
    });
    
    try {
        // 並行執行所有搜索請求
        const resultsArray = await Promise.all(searchPromises);
        
        // 合並所有結果
        let allResults = [];
        resultsArray.forEach(results => {
            if (Array.isArray(results) && results.length > 0) {
                allResults = allResults.concat(results);
            }
        });
        
        // 如果沒有搜索結果，返回空結果
        if (allResults.length === 0) {
            return JSON.stringify({
                code: 200,
                list: [],
                msg: '所有自定義API源均無搜索結果'
            });
        }
        
        // 去重（根據vod_id和api_url組合）
        const uniqueResults = [];
        const seen = new Set();
        
        allResults.forEach(item => {
            const key = `${item.api_url || ''}_${item.vod_id}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueResults.push(item);
            }
        });
        
        return JSON.stringify({
            code: 200,
            list: uniqueResults,
        });
    } catch (error) {
        console.error('自定義API聚合搜索處理錯誤:', error);
        return JSON.stringify({
            code: 400,
            msg: '自定義API聚合搜索處理失敗: ' + error.message,
            list: []
        });
    }
}

// 攔截API請求
(function() {
    const originalFetch = window.fetch;
    
    window.fetch = async function(input, init) {
        const requestUrl = typeof input === 'string' ? new URL(input, window.location.origin) : input.url;
        
        if (requestUrl.pathname.startsWith('/api/')) {
            if (window.isPasswordProtected && window.isPasswordVerified) {
                if (window.isPasswordProtected() && !window.isPasswordVerified()) {
                    return;
                }
            }
            try {
                const data = await handleApiRequest(requestUrl);
                return new Response(data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            } catch (error) {
                return new Response(JSON.stringify({
                    code: 500,
                    msg: '服務器內部錯誤',
                }), {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            }
        }
        
        // 非API請求使用原始fetch
        return originalFetch.apply(this, arguments);
    };
})();

async function testSiteAvailability(apiUrl) {
    try {
        // 使用更簡單的測試查詢
        const response = await fetch('/api/search?wd=test&customApi=' + encodeURIComponent(apiUrl), {
            // 添加超時
            signal: AbortSignal.timeout(5000)
        });
        
        // 檢查響應狀態
        if (!response.ok) {
            return false;
        }
        
        const data = await response.json();
        
        // 檢查API響應的有效性
        return data && data.code !== 400 && Array.isArray(data.list);
    } catch (error) {
        console.error('站點可用性測試失敗:', error);
        return false;
    }
}

// 全局變量
let selectedAPIs = JSON.parse(localStorage.getItem('selectedAPIs') || '["tyyszy","dyttzy", "bfzy", "ruyi"]'); // 默認選中資源
let customAPIs = JSON.parse(localStorage.getItem('customAPIs') || '[]'); // 存儲自定義API列表

// 添加當前播放的集數索引
let currentEpisodeIndex = 0;
// 添加當前視頻的所有集數
let currentEpisodes = [];
// 添加當前視頻的標題
let currentVideoTitle = '';
// 全局變量用於倒序狀態
let episodesReversed = false;

// 頁面初始化
document.addEventListener('DOMContentLoaded', function () {
    // 初始化API覆選框
    initAPICheckboxes();

    // 初始化自定義API列表
    renderCustomAPIsList();

    // 初始化顯示選中的API數量
    updateSelectedApiCount();

    // 渲染搜索歷史
    renderSearchHistory();

    // 設置默認API選擇（如果是第一次加載）
    if (!localStorage.getItem('hasInitializedDefaults')) {
        // 默認選中資源
        selectedAPIs = ["tyyszy", "bfzy", "dyttzy", "ruyi"];
        localStorage.setItem('selectedAPIs', JSON.stringify(selectedAPIs));

        // 默認選中過濾開關
        localStorage.setItem('yellowFilterEnabled', 'true');
        localStorage.setItem(PLAYER_CONFIG.adFilteringStorage, 'true');

        // 默認啟用豆瓣功能
        localStorage.setItem('doubanEnabled', 'true');

        // 標記已初始化默認值
        localStorage.setItem('hasInitializedDefaults', 'true');
    }

    // 設置黃色內容過濾器開關初始狀態
    const yellowFilterToggle = document.getElementById('yellowFilterToggle');
    if (yellowFilterToggle) {
        yellowFilterToggle.checked = localStorage.getItem('yellowFilterEnabled') === 'true';
    }

    // 設置廣告過濾開關初始狀態
    const adFilterToggle = document.getElementById('adFilterToggle');
    if (adFilterToggle) {
        adFilterToggle.checked = localStorage.getItem(PLAYER_CONFIG.adFilteringStorage) !== 'false'; // 默認為true
    }

    // 設置事件監聽器
    setupEventListeners();

    // 初始檢查成人API選中狀態
    setTimeout(checkAdultAPIsSelected, 100);
});

// 初始化API覆選框
function initAPICheckboxes() {
    const container = document.getElementById('apiCheckboxes');
    container.innerHTML = '';

    // 添加普通API組標題
    const normaldiv = document.createElement('div');
    normaldiv.id = 'normaldiv';
    normaldiv.className = 'grid grid-cols-2 gap-2';
    const normalTitle = document.createElement('div');
    normalTitle.className = 'api-group-title';
    normalTitle.textContent = '普通資源';
    normaldiv.appendChild(normalTitle);

    // 創建普通API源的覆選框
    Object.keys(API_SITES).forEach(apiKey => {
        const api = API_SITES[apiKey];
        if (api.adult) return; // 跳過成人內容API，稍後添加

        const checked = selectedAPIs.includes(apiKey);

        const checkbox = document.createElement('div');
        checkbox.className = 'flex items-center';
        checkbox.innerHTML = `
            <input type="checkbox" id="api_${apiKey}" 
                   class="form-checkbox h-3 w-3 text-blue-600 bg-[#222] border border-[#333]" 
                   ${checked ? 'checked' : ''} 
                   data-api="${apiKey}">
            <label for="api_${apiKey}" class="ml-1 text-xs text-gray-400 truncate">${api.name}</label>
        `;
        normaldiv.appendChild(checkbox);

        // 添加事件監聽器
        checkbox.querySelector('input').addEventListener('change', function () {
            updateSelectedAPIs();
            checkAdultAPIsSelected();
        });
    });
    container.appendChild(normaldiv);

    // 添加成人API列表
    addAdultAPI();

    // 初始檢查成人內容狀態
    checkAdultAPIsSelected();
}

// 添加成人API列表
function addAdultAPI() {
    // 僅在隱藏設置為false時添加成人API組
    if (!HIDE_BUILTIN_ADULT_APIS && (localStorage.getItem('yellowFilterEnabled') === 'false')) {
        const container = document.getElementById('apiCheckboxes');

        // 添加成人API組標題
        const adultdiv = document.createElement('div');
        adultdiv.id = 'adultdiv';
        adultdiv.className = 'grid grid-cols-2 gap-2';
        const adultTitle = document.createElement('div');
        adultTitle.className = 'api-group-title adult';
        adultTitle.innerHTML = `黃色資源采集站 <span class="adult-warning">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </span>`;
        adultdiv.appendChild(adultTitle);

        // 創建成人API源的覆選框
        Object.keys(API_SITES).forEach(apiKey => {
            const api = API_SITES[apiKey];
            if (!api.adult) return; // 僅添加成人內容API

            const checked = selectedAPIs.includes(apiKey);

            const checkbox = document.createElement('div');
            checkbox.className = 'flex items-center';
            checkbox.innerHTML = `
                <input type="checkbox" id="api_${apiKey}" 
                       class="form-checkbox h-3 w-3 text-blue-600 bg-[#222] border border-[#333] api-adult" 
                       ${checked ? 'checked' : ''} 
                       data-api="${apiKey}">
                <label for="api_${apiKey}" class="ml-1 text-xs text-pink-400 truncate">${api.name}</label>
            `;
            adultdiv.appendChild(checkbox);

            // 添加事件監聽器
            checkbox.querySelector('input').addEventListener('change', function () {
                updateSelectedAPIs();
                checkAdultAPIsSelected();
            });
        });
        container.appendChild(adultdiv);
    }
}

// 檢查是否有成人API被選中
function checkAdultAPIsSelected() {
    // 查找所有內置成人API覆選框
    const adultBuiltinCheckboxes = document.querySelectorAll('#apiCheckboxes .api-adult:checked');

    // 查找所有自定義成人API覆選框
    const customApiCheckboxes = document.querySelectorAll('#customApisList .api-adult:checked');

    const hasAdultSelected = adultBuiltinCheckboxes.length > 0 || customApiCheckboxes.length > 0;

    const yellowFilterToggle = document.getElementById('yellowFilterToggle');
    const yellowFilterContainer = yellowFilterToggle.closest('div').parentNode;
    const filterDescription = yellowFilterContainer.querySelector('p.filter-description');

    // 如果選擇了成人API，禁用黃色內容過濾器
    if (hasAdultSelected) {
        yellowFilterToggle.checked = false;
        yellowFilterToggle.disabled = true;
        localStorage.setItem('yellowFilterEnabled', 'false');

        // 添加禁用樣式
        yellowFilterContainer.classList.add('filter-disabled');

        // 修改描述文字
        if (filterDescription) {
            filterDescription.innerHTML = '<strong class="text-pink-300">選中黃色資源站時無法啟用此過濾</strong>';
        }

        // 移除提示信息（如果存在）
        const existingTooltip = yellowFilterContainer.querySelector('.filter-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
    } else {
        // 啟用黃色內容過濾器
        yellowFilterToggle.disabled = false;
        yellowFilterContainer.classList.remove('filter-disabled');

        // 恢覆原來的描述文字
        if (filterDescription) {
            filterDescription.innerHTML = '過濾"倫理片"等黃色內容';
        }

        // 移除提示信息
        const existingTooltip = yellowFilterContainer.querySelector('.filter-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
    }
}

// 渲染自定義API列表
function renderCustomAPIsList() {
    const container = document.getElementById('customApisList');
    if (!container) return;

    if (customAPIs.length === 0) {
        container.innerHTML = '<p class="text-xs text-gray-500 text-center my-2">未添加自定義API</p>';
        return;
    }

    container.innerHTML = '';
    customAPIs.forEach((api, index) => {
        const apiItem = document.createElement('div');
        apiItem.className = 'flex items-center justify-between p-1 mb-1 bg-[#222] rounded';
        const textColorClass = api.isAdult ? 'text-pink-400' : 'text-white';
        const adultTag = api.isAdult ? '<span class="text-xs text-pink-400 mr-1">(18+)</span>' : '';
        // 新增 detail 地址顯示
        const detailLine = api.detail ? `<div class="text-xs text-gray-400 truncate">detail: ${api.detail}</div>` : '';
        apiItem.innerHTML = `
            <div class="flex items-center flex-1 min-w-0">
                <input type="checkbox" id="custom_api_${index}" 
                       class="form-checkbox h-3 w-3 text-blue-600 mr-1 ${api.isAdult ? 'api-adult' : ''}" 
                       ${selectedAPIs.includes('custom_' + index) ? 'checked' : ''} 
                       data-custom-index="${index}">
                <div class="flex-1 min-w-0">
                    <div class="text-xs font-medium ${textColorClass} truncate">
                        ${adultTag}${api.name}
                    </div>
                    <div class="text-xs text-gray-500 truncate">${api.url}</div>
                    ${detailLine}
                </div>
            </div>
            <div class="flex items-center">
                <button class="text-blue-500 hover:text-blue-700 text-xs px-1" onclick="editCustomApi(${index})">✎</button>
                <button class="text-red-500 hover:text-red-700 text-xs px-1" onclick="removeCustomApi(${index})">✕</button>
            </div>
        `;
        container.appendChild(apiItem);
        apiItem.querySelector('input').addEventListener('change', function () {
            updateSelectedAPIs();
            checkAdultAPIsSelected();
        });
    });
}

// 編輯自定義API
function editCustomApi(index) {
    if (index < 0 || index >= customAPIs.length) return;
    const api = customAPIs[index];
    document.getElementById('customApiName').value = api.name;
    document.getElementById('customApiUrl').value = api.url;
    document.getElementById('customApiDetail').value = api.detail || '';
    const isAdultInput = document.getElementById('customApiIsAdult');
    if (isAdultInput) isAdultInput.checked = api.isAdult || false;
    const form = document.getElementById('addCustomApiForm');
    if (form) {
        form.classList.remove('hidden');
        const buttonContainer = form.querySelector('div:last-child');
        buttonContainer.innerHTML = `
            <button onclick="updateCustomApi(${index})" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">更新</button>
            <button onclick="cancelEditCustomApi()" class="bg-[#444] hover:bg-[#555] text-white px-3 py-1 rounded text-xs">取消</button>
        `;
    }
}

// 更新自定義API
function updateCustomApi(index) {
    if (index < 0 || index >= customAPIs.length) return;
    const nameInput = document.getElementById('customApiName');
    const urlInput = document.getElementById('customApiUrl');
    const detailInput = document.getElementById('customApiDetail');
    const isAdultInput = document.getElementById('customApiIsAdult');
    const name = nameInput.value.trim();
    let url = urlInput.value.trim();
    const detail = detailInput ? detailInput.value.trim() : '';
    const isAdult = isAdultInput ? isAdultInput.checked : false;
    if (!name || !url) {
        showToast('請輸入API名稱和鏈接', 'warning');
        return;
    }
    if (!/^https?:\/\/.+/.test(url)) {
        showToast('API鏈接格式不正確，需以http://或https://開頭', 'warning');
        return;
    }
    if (url.endsWith('/')) url = url.slice(0, -1);
    // 保存 detail 字段
    customAPIs[index] = { name, url, detail, isAdult };
    localStorage.setItem('customAPIs', JSON.stringify(customAPIs));
    renderCustomAPIsList();
    checkAdultAPIsSelected();
    restoreAddCustomApiButtons();
    nameInput.value = '';
    urlInput.value = '';
    if (detailInput) detailInput.value = '';
    if (isAdultInput) isAdultInput.checked = false;
    document.getElementById('addCustomApiForm').classList.add('hidden');
    showToast('已更新自定義API: ' + name, 'success');
}

// 取消編輯自定義API
function cancelEditCustomApi() {
    // 清空表單
    document.getElementById('customApiName').value = '';
    document.getElementById('customApiUrl').value = '';
    document.getElementById('customApiDetail').value = '';
    const isAdultInput = document.getElementById('customApiIsAdult');
    if (isAdultInput) isAdultInput.checked = false;

    // 隱藏表單
    document.getElementById('addCustomApiForm').classList.add('hidden');

    // 恢覆添加按鈕
    restoreAddCustomApiButtons();
}

// 恢覆自定義API添加按鈕
function restoreAddCustomApiButtons() {
    const form = document.getElementById('addCustomApiForm');
    const buttonContainer = form.querySelector('div:last-child');
    buttonContainer.innerHTML = `
        <button onclick="addCustomApi()" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">添加</button>
        <button onclick="cancelAddCustomApi()" class="bg-[#444] hover:bg-[#555] text-white px-3 py-1 rounded text-xs">取消</button>
    `;
}

// 更新選中的API列表
function updateSelectedAPIs() {
    // 獲取所有內置API覆選框
    const builtInApiCheckboxes = document.querySelectorAll('#apiCheckboxes input:checked');

    // 獲取選中的內置API
    const builtInApis = Array.from(builtInApiCheckboxes).map(input => input.dataset.api);

    // 獲取選中的自定義API
    const customApiCheckboxes = document.querySelectorAll('#customApisList input:checked');
    const customApiIndices = Array.from(customApiCheckboxes).map(input => 'custom_' + input.dataset.customIndex);

    // 合並內置和自定義API
    selectedAPIs = [...builtInApis, ...customApiIndices];

    // 保存到localStorage
    localStorage.setItem('selectedAPIs', JSON.stringify(selectedAPIs));

    // 更新顯示選中的API數量
    updateSelectedApiCount();
}

// 更新選中的API數量顯示
function updateSelectedApiCount() {
    const countEl = document.getElementById('selectedApiCount');
    if (countEl) {
        countEl.textContent = selectedAPIs.length;
    }
}

// 全選或取消全選API
function selectAllAPIs(selectAll = true, excludeAdult = false) {
    const checkboxes = document.querySelectorAll('#apiCheckboxes input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        if (excludeAdult && checkbox.classList.contains('api-adult')) {
            checkbox.checked = false;
        } else {
            checkbox.checked = selectAll;
        }
    });

    updateSelectedAPIs();
    checkAdultAPIsSelected();
}

// 顯示添加自定義API表單
function showAddCustomApiForm() {
    const form = document.getElementById('addCustomApiForm');
    if (form) {
        form.classList.remove('hidden');
    }
}

// 取消添加自定義API - 修改函數來重用恢覆按鈕邏輯
function cancelAddCustomApi() {
    const form = document.getElementById('addCustomApiForm');
    if (form) {
        form.classList.add('hidden');
        document.getElementById('customApiName').value = '';
        document.getElementById('customApiUrl').value = '';
        document.getElementById('customApiDetail').value = '';
        const isAdultInput = document.getElementById('customApiIsAdult');
        if (isAdultInput) isAdultInput.checked = false;

        // 確保按鈕是添加按鈕
        restoreAddCustomApiButtons();
    }
}

// 添加自定義API
function addCustomApi() {
    const nameInput = document.getElementById('customApiName');
    const urlInput = document.getElementById('customApiUrl');
    const detailInput = document.getElementById('customApiDetail');
    const isAdultInput = document.getElementById('customApiIsAdult');
    const name = nameInput.value.trim();
    let url = urlInput.value.trim();
    const detail = detailInput ? detailInput.value.trim() : '';
    const isAdult = isAdultInput ? isAdultInput.checked : false;
    if (!name || !url) {
        showToast('請輸入API名稱和鏈接', 'warning');
        return;
    }
    if (!/^https?:\/\/.+/.test(url)) {
        showToast('API鏈接格式不正確，需以http://或https://開頭', 'warning');
        return;
    }
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    // 保存 detail 字段
    customAPIs.push({ name, url, detail, isAdult });
    localStorage.setItem('customAPIs', JSON.stringify(customAPIs));
    const newApiIndex = customAPIs.length - 1;
    selectedAPIs.push('custom_' + newApiIndex);
    localStorage.setItem('selectedAPIs', JSON.stringify(selectedAPIs));

    // 重新渲染自定義API列表
    renderCustomAPIsList();
    updateSelectedApiCount();
    checkAdultAPIsSelected();
    nameInput.value = '';
    urlInput.value = '';
    if (detailInput) detailInput.value = '';
    if (isAdultInput) isAdultInput.checked = false;
    document.getElementById('addCustomApiForm').classList.add('hidden');
    showToast('已添加自定義API: ' + name, 'success');
}

// 移除自定義API
function removeCustomApi(index) {
    if (index < 0 || index >= customAPIs.length) return;

    const apiName = customAPIs[index].name;

    // 從列表中移除API
    customAPIs.splice(index, 1);
    localStorage.setItem('customAPIs', JSON.stringify(customAPIs));

    // 從選中列表中移除此API
    const customApiId = 'custom_' + index;
    selectedAPIs = selectedAPIs.filter(id => id !== customApiId);

    // 更新大於此索引的自定義API索引
    selectedAPIs = selectedAPIs.map(id => {
        if (id.startsWith('custom_')) {
            const currentIndex = parseInt(id.replace('custom_', ''));
            if (currentIndex > index) {
                return 'custom_' + (currentIndex - 1);
            }
        }
        return id;
    });

    localStorage.setItem('selectedAPIs', JSON.stringify(selectedAPIs));

    // 重新渲染自定義API列表
    renderCustomAPIsList();

    // 更新選中的API數量
    updateSelectedApiCount();

    // 重新檢查成人API選中狀態
    checkAdultAPIsSelected();

    showToast('已移除自定義API: ' + apiName, 'info');
}

function toggleSettings(e) {
    const settingsPanel = document.getElementById('settingsPanel');
    if (!settingsPanel) return;

    // 檢查是否有管理員密碼
    const hasAdminPassword = window.__ENV__?.ADMINPASSWORD && 
                           window.__ENV__.ADMINPASSWORD.length === 64 && 
                           !/^0+$/.test(window.__ENV__.ADMINPASSWORD);

    if (settingsPanel.classList.contains('show')) {
        settingsPanel.classList.remove('show');
    } else {
        // 只有設置了管理員密碼且未驗證時才攔截
        if (hasAdminPassword && !isAdminVerified()) {
            e.preventDefault();
            e.stopPropagation();
            showAdminPasswordModal();
            return;
        }
        settingsPanel.classList.add('show');
    }

    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
}

// 設置事件監聽器
function setupEventListeners() {
    // 回車搜索
    document.getElementById('searchInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            search();
        }
    });

    // 點擊外部關閉設置面板和歷史記錄面板
    document.addEventListener('click', function (e) {
        // 關閉設置面板
        const settingsPanel = document.querySelector('#settingsPanel.show');
        const settingsButton = document.querySelector('#settingsPanel .close-btn');

        if (settingsPanel && settingsButton &&
            !settingsPanel.contains(e.target) &&
            !settingsButton.contains(e.target)) {
            settingsPanel.classList.remove('show');
        }

        // 關閉歷史記錄面板
        const historyPanel = document.querySelector('#historyPanel.show');
        const historyButton = document.querySelector('#historyPanel .close-btn');

        if (historyPanel && historyButton &&
            !historyPanel.contains(e.target) &&
            !historyButton.contains(e.target)) {
            historyPanel.classList.remove('show');
        }
    });

    // 黃色內容過濾開關事件綁定
    const yellowFilterToggle = document.getElementById('yellowFilterToggle');
    if (yellowFilterToggle) {
        yellowFilterToggle.addEventListener('change', function (e) {
            localStorage.setItem('yellowFilterEnabled', e.target.checked);

            // 控制黃色內容接口的顯示狀態
            const adultdiv = document.getElementById('adultdiv');
            if (adultdiv) {
                if (e.target.checked === true) {
                    adultdiv.style.display = 'none';
                } else if (e.target.checked === false) {
                    adultdiv.style.display = ''
                }
            } else {
                // 添加成人API列表
                addAdultAPI();
            }
        });
    }

    // 廣告過濾開關事件綁定
    const adFilterToggle = document.getElementById('adFilterToggle');
    if (adFilterToggle) {
        adFilterToggle.addEventListener('change', function (e) {
            localStorage.setItem(PLAYER_CONFIG.adFilteringStorage, e.target.checked);
        });
    }
}

// 重置搜索區域
function resetSearchArea() {
    // 清理搜索結果
    document.getElementById('results').innerHTML = '';
    document.getElementById('searchInput').value = '';

    // 恢覆搜索區域的樣式
    document.getElementById('searchArea').classList.add('flex-1');
    document.getElementById('searchArea').classList.remove('mb-8');
    document.getElementById('resultsArea').classList.add('hidden');

    // 確保頁腳正確顯示，移除相對定位
    const footer = document.querySelector('.footer');
    if (footer) {
        footer.style.position = '';
    }

    // 如果有豆瓣功能，檢查是否需要顯示豆瓣推薦區域
    if (typeof updateDoubanVisibility === 'function') {
        updateDoubanVisibility();
    }

    // 重置URL為主頁
    try {
        window.history.pushState(
            {},
            `LibreTV - 免費在線視頻搜索與觀看平台`,
            `/`
        );
        // 更新頁面標題
        document.title = `LibreTV - 免費在線視頻搜索與觀看平台`;
    } catch (e) {
        console.error('更新瀏覽器歷史失敗:', e);
    }
}

// 獲取自定義API信息
function getCustomApiInfo(customApiIndex) {
    const index = parseInt(customApiIndex);
    if (isNaN(index) || index < 0 || index >= customAPIs.length) {
        return null;
    }
    return customAPIs[index];
}

// 搜索功能 - 修改為支持多選API和多頁結果
async function search() {
    // 密碼保護校驗
    if (window.isPasswordProtected && window.isPasswordVerified) {
        if (window.isPasswordProtected() && !window.isPasswordVerified()) {
            showPasswordModal && showPasswordModal();
            return;
        }
    }
    const query = document.getElementById('searchInput').value.trim();

    if (!query) {
        showToast('請輸入搜索內容', 'info');
        return;
    }

    if (selectedAPIs.length === 0) {
        showToast('請至少選擇一個API源', 'warning');
        return;
    }

    showLoading();

    try {
        // 保存搜索歷史
        saveSearchHistory(query);

        // 從所有選中的API源搜索
        let allResults = [];
        const searchPromises = selectedAPIs.map(apiId => 
            searchByAPIAndKeyWord(apiId, query)
        );

        // 等待所有搜索請求完成
        const resultsArray = await Promise.all(searchPromises);

        // 合並所有結果
        resultsArray.forEach(results => {
            if (Array.isArray(results) && results.length > 0) {
                allResults = allResults.concat(results);
            }
        });

        // 對搜索結果進行排序：按名稱優先，名稱相同時按接口源排序
        allResults.sort((a, b) => {
            // 首先按照視頻名稱排序
            const nameCompare = (a.vod_name || '').localeCompare(b.vod_name || '');
            if (nameCompare !== 0) return nameCompare;
            
            // 如果名稱相同，則按照來源排序
            return (a.source_name || '').localeCompare(b.source_name || '');
        });

        // 更新搜索結果計數
        const searchResultsCount = document.getElementById('searchResultsCount');
        if (searchResultsCount) {
            searchResultsCount.textContent = allResults.length;
        }

        // 顯示結果區域，調整搜索區域
        document.getElementById('searchArea').classList.remove('flex-1');
        document.getElementById('searchArea').classList.add('mb-8');
        document.getElementById('resultsArea').classList.remove('hidden');

        // 隱藏豆瓣推薦區域（如果存在）
        const doubanArea = document.getElementById('doubanArea');
        if (doubanArea) {
            doubanArea.classList.add('hidden');
        }

        const resultsDiv = document.getElementById('results');

        // 如果沒有結果
        if (!allResults || allResults.length === 0) {
            resultsDiv.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <svg class="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 class="mt-2 text-lg font-medium text-gray-400">沒有找到匹配的結果</h3>
                    <p class="mt-1 text-sm text-gray-500">請嘗試其他關鍵詞或更換數據源</p>
                </div>
            `;
            hideLoading();
            return;
        }

        // 有搜索結果時，才更新URL
        try {
            // 使用URI編碼確保特殊字符能夠正確顯示
            const encodedQuery = encodeURIComponent(query);
            // 使用HTML5 History API更新URL，不刷新頁面
            window.history.pushState(
                { search: query },
                `搜索: ${query} - LibreTV`,
                `/s=${encodedQuery}`
            );
            // 更新頁面標題
            document.title = `搜索: ${query} - LibreTV`;
        } catch (e) {
            console.error('更新瀏覽器歷史失敗:', e);
            // 如果更新URL失敗，繼續執行搜索
        }

        // 處理搜索結果過濾：如果啟用了黃色內容過濾，則過濾掉分類含有敏感內容的項目
        const yellowFilterEnabled = localStorage.getItem('yellowFilterEnabled') === 'true';
        if (yellowFilterEnabled) {
            const banned = ['倫理片', '福利', '里番動漫', '門事件', '蘿莉少女', '制服誘惑', '國產傳媒', 'cosplay', '黑絲誘惑', '無碼', '日本無碼', '有碼', '日本有碼', 'SWAG', '網紅主播', '色情片', '同性片', '福利視頻', '福利片'];
            allResults = allResults.filter(item => {
                const typeName = item.type_name || '';
                return !banned.some(keyword => typeName.includes(keyword));
            });
        }

        // 添加XSS保護，使用textContent和屬性轉義
        const safeResults = allResults.map(item => {
            const safeId = item.vod_id ? item.vod_id.toString().replace(/[^\w-]/g, '') : '';
            const safeName = (item.vod_name || '').toString()
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
            const sourceInfo = item.source_name ?
                `<span class="bg-[#222] text-xs px-1.5 py-0.5 rounded-full">${item.source_name}</span>` : '';
            const sourceCode = item.source_code || '';

            // 添加API URL屬性，用於詳情獲取
            const apiUrlAttr = item.api_url ?
                `data-api-url="${item.api_url.replace(/"/g, '&quot;')}"` : '';

            // 修改為水平卡片布局，圖片在左側，文本在右側，並優化樣式
            const hasCover = item.vod_pic && item.vod_pic.startsWith('http');

            return `
                <div class="card-hover bg-[#111] rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-[1.02] h-full shadow-sm hover:shadow-md" 
                     onclick="showDetails('${safeId}','${safeName}','${sourceCode}')" ${apiUrlAttr}>
                    <div class="flex h-full">
                        ${hasCover ? `
                        <div class="relative flex-shrink-0 search-card-img-container">
                            <img src="${item.vod_pic}" alt="${safeName}" 
                                 class="h-full w-full object-cover transition-transform hover:scale-110" 
                                 onerror="this.onerror=null; this.src='https://via.placeholder.com/300x450?text=無封面'; this.classList.add('object-contain');" 
                                 loading="lazy">
                            <div class="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
                        </div>` : ''}
                        
                        <div class="p-2 flex flex-col flex-grow">
                            <div class="flex-grow">
                                <h3 class="font-semibold mb-2 break-words line-clamp-2 ${hasCover ? '' : 'text-center'}" title="${safeName}">${safeName}</h3>
                                
                                <div class="flex flex-wrap ${hasCover ? '' : 'justify-center'} gap-1 mb-2">
                                    ${(item.type_name || '').toString().replace(/</g, '&lt;') ?
                    `<span class="text-xs py-0.5 px-1.5 rounded bg-opacity-20 bg-blue-500 text-blue-300">
                                          ${(item.type_name || '').toString().replace(/</g, '&lt;')}
                                      </span>` : ''}
                                    ${(item.vod_year || '') ?
                    `<span class="text-xs py-0.5 px-1.5 rounded bg-opacity-20 bg-purple-500 text-purple-300">
                                          ${item.vod_year}
                                      </span>` : ''}
                                </div>
                                <p class="text-gray-400 line-clamp-2 overflow-hidden ${hasCover ? '' : 'text-center'} mb-2">
                                    ${(item.vod_remarks || '暫無介紹').toString().replace(/</g, '&lt;')}
                                </p>
                            </div>
                            
                            <div class="flex justify-between items-center mt-1 pt-1 border-t border-gray-800">
                                ${sourceInfo ? `<div>${sourceInfo}</div>` : '<div></div>'}
                                <!-- 接口名稱過長會被擠變形
                                <div>
                                    <span class="text-gray-500 flex items-center hover:text-blue-400 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        </svg>
                                        播放
                                    </span>
                                </div>
                                -->
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        resultsDiv.innerHTML = safeResults;
    } catch (error) {
        console.error('搜索錯誤:', error);
        if (error.name === 'AbortError') {
            showToast('搜索請求超時，請檢查網絡連接', 'error');
        } else {
            showToast('搜索請求失敗，請稍後重試', 'error');
        }
    } finally {
        hideLoading();
    }
}

// 切換清空按鈕的顯示狀態
function toggleClearButton() {
    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearSearchInput');
    if (searchInput.value !== '') {
        clearButton.classList.remove('hidden');
    } else {
        clearButton.classList.add('hidden');
    }
}

// 清空搜索框內容
function clearSearchInput() {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    const clearButton = document.getElementById('clearSearchInput');
    clearButton.classList.add('hidden');
}

// 劫持搜索框的value屬性以檢測外部修改
function hookInput() {
    const input = document.getElementById('searchInput');
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');

    // 重寫 value 屬性的 getter 和 setter
    Object.defineProperty(input, 'value', {
        get: function () {
            // 確保讀取時返回字符串（即使原始值為 undefined/null）
            const originalValue = descriptor.get.call(this);
            return originalValue != null ? String(originalValue) : '';
        },
        set: function (value) {
            // 顯式將值轉換為字符串後寫入
            const strValue = String(value);
            descriptor.set.call(this, strValue);
            this.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });

    // 初始化輸入框值為空字符串（避免初始值為 undefined）
    input.value = '';
}
document.addEventListener('DOMContentLoaded', hookInput);

// 顯示詳情 - 修改為支持自定義API
async function showDetails(id, vod_name, sourceCode) {
    // 密碼保護校驗
    if (window.isPasswordProtected && window.isPasswordVerified) {
        if (window.isPasswordProtected() && !window.isPasswordVerified()) {
            showPasswordModal && showPasswordModal();
            return;
        }
    }
    if (!id) {
        showToast('視頻ID無效', 'error');
        return;
    }

    showLoading();
    try {
        // 構建API參數
        let apiParams = '';

        // 處理自定義API源
        if (sourceCode.startsWith('custom_')) {
            const customIndex = sourceCode.replace('custom_', '');
            const customApi = getCustomApiInfo(customIndex);
            if (!customApi) {
                showToast('自定義API配置無效', 'error');
                hideLoading();
                return;
            }
            // 傳遞 detail 字段
            if (customApi.detail) {
                apiParams = '&customApi=' + encodeURIComponent(customApi.url) + '&customDetail=' + encodeURIComponent(customApi.detail) + '&source=custom';
            } else {
                apiParams = '&customApi=' + encodeURIComponent(customApi.url) + '&source=custom';
            }
        } else {
            // 內置API
            apiParams = '&source=' + sourceCode;
        }

        // Add a timestamp to prevent caching
        const timestamp = new Date().getTime();
        const cacheBuster = `&_t=${timestamp}`;
        const response = await fetch(`/api/detail?id=${encodeURIComponent(id)}${apiParams}${cacheBuster}`);

        const data = await response.json();

        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        // 顯示來源信息
        const sourceName = data.videoInfo && data.videoInfo.source_name ?
            ` <span class="text-sm font-normal text-gray-400">(${data.videoInfo.source_name})</span>` : '';

        // 不對標題進行截斷處理，允許完整顯示
        modalTitle.innerHTML = `<span class="break-words">${vod_name || '未知視頻'}</span>${sourceName}`;
        currentVideoTitle = vod_name || '未知視頻';

        if (data.episodes && data.episodes.length > 0) {
            // 構建詳情信息HTML
            let detailInfoHtml = '';
            if (data.videoInfo) {
                // Prepare description text, strip HTML and trim whitespace
                const descriptionText = data.videoInfo.desc ? data.videoInfo.desc.replace(/<[^>]+>/g, '').trim() : '';

                // Check if there's any actual grid content
                const hasGridContent = data.videoInfo.type || data.videoInfo.year || data.videoInfo.area || data.videoInfo.director || data.videoInfo.actor || data.videoInfo.remarks;

                if (hasGridContent || descriptionText) { // Only build if there's something to show
                    detailInfoHtml = `
                <div class="modal-detail-info">
                    ${hasGridContent ? `
                    <div class="detail-grid">
                        ${data.videoInfo.type ? `<div class="detail-item"><span class="detail-label">類型:</span> <span class="detail-value">${data.videoInfo.type}</span></div>` : ''}
                        ${data.videoInfo.year ? `<div class="detail-item"><span class="detail-label">年份:</span> <span class="detail-value">${data.videoInfo.year}</span></div>` : ''}
                        ${data.videoInfo.area ? `<div class="detail-item"><span class="detail-label">地區:</span> <span class="detail-value">${data.videoInfo.area}</span></div>` : ''}
                        ${data.videoInfo.director ? `<div class="detail-item"><span class="detail-label">導演:</span> <span class="detail-value">${data.videoInfo.director}</span></div>` : ''}
                        ${data.videoInfo.actor ? `<div class="detail-item"><span class="detail-label">主演:</span> <span class="detail-value">${data.videoInfo.actor}</span></div>` : ''}
                        ${data.videoInfo.remarks ? `<div class="detail-item"><span class="detail-label">備注:</span> <span class="detail-value">${data.videoInfo.remarks}</span></div>` : ''}
                    </div>` : ''}
                    ${descriptionText ? `
                    <div class="detail-desc">
                        <p class="detail-label">簡介:</p>
                        <p class="detail-desc-content">${descriptionText}</p>
                    </div>` : ''}
                </div>
                `;
                }
            }

            currentEpisodes = data.episodes;
            currentEpisodeIndex = 0;

            modalContent.innerHTML = `
                ${detailInfoHtml}
                <div class="flex flex-wrap items-center justify-between mb-4 gap-2">
                    <div class="flex items-center gap-2">
                        <button onclick="toggleEpisodeOrder('${sourceCode}', '${id}')" 
                                class="px-3 py-1.5 bg-[#333] hover:bg-[#444] border border-[#444] rounded text-sm transition-colors flex items-center gap-1">
                            <svg class="w-4 h-4 transform ${episodesReversed ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                            </svg>
                            <span>${episodesReversed ? '正序排列' : '倒序排列'}</span>
                        </button>
                        <span class="text-gray-400 text-sm">共 ${data.episodes.length} 集</span>
                    </div>
                    <button onclick="copyLinks()" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                        覆制鏈接
                    </button>
                </div>
                <div id="episodesGrid" class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    ${renderEpisodes(vod_name, sourceCode, id)}
                </div>
            `;
        } else {
            modalContent.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-red-400 mb-2">❌ 未找到播放資源</div>
                    <div class="text-gray-500 text-sm">該視頻可能暫時無法播放，請嘗試其他視頻</div>
                </div>
            `;
        }

        modal.classList.remove('hidden');
    } catch (error) {
        console.error('獲取詳情錯誤:', error);
        showToast('獲取詳情失敗，請稍後重試', 'error');
    } finally {
        hideLoading();
    }
}

// 更新播放視頻函數，修改為使用/watch路徑而不是直接打開player.html
function playVideo(url, vod_name, sourceCode, episodeIndex = 0, vodId = '') {
    // 密碼保護校驗
    if (window.isPasswordProtected && window.isPasswordVerified) {
        if (window.isPasswordProtected() && !window.isPasswordVerified()) {
            showPasswordModal && showPasswordModal();
            return;
        }
    }

    // 獲取當前路徑作為返回頁面
    let currentPath = window.location.href;

    // 構建播放頁面URL，使用watch.html作為中間跳轉頁
    let watchUrl = `watch.html?id=${vodId || ''}&source=${sourceCode || ''}&url=${encodeURIComponent(url)}&index=${episodeIndex}&title=${encodeURIComponent(vod_name || '')}`;

    // 添加返回URL參數
    if (currentPath.includes('index.html') || currentPath.endsWith('/')) {
        watchUrl += `&back=${encodeURIComponent(currentPath)}`;
    }

    // 保存當前狀態到localStorage
    try {
        localStorage.setItem('currentVideoTitle', vod_name || '未知視頻');
        localStorage.setItem('currentEpisodes', JSON.stringify(currentEpisodes));
        localStorage.setItem('currentEpisodeIndex', episodeIndex);
        localStorage.setItem('currentSourceCode', sourceCode || '');
        localStorage.setItem('lastPlayTime', Date.now());
        localStorage.setItem('lastSearchPage', currentPath);
        localStorage.setItem('lastPageUrl', currentPath);  // 確保保存返回頁面URL
    } catch (e) {
        console.error('保存播放狀態失敗:', e);
    }

    // 在當前標簽頁中打開播放頁面
    window.location.href = watchUrl;
}

// 彈出播放器頁面
function showVideoPlayer(url) {
    // 在打開播放器前，隱藏詳情彈窗
    const detailModal = document.getElementById('modal');
    if (detailModal) {
        detailModal.classList.add('hidden');
    }
    // 臨時隱藏搜索結果和豆瓣區域，防止高度超出播放器而出現滾動條
    document.getElementById('resultsArea').classList.add('hidden');
    document.getElementById('doubanArea').classList.add('hidden');
    // 在框架中打開播放頁面
    videoPlayerFrame = document.createElement('iframe');
    videoPlayerFrame.id = 'VideoPlayerFrame';
    videoPlayerFrame.className = 'fixed w-full h-screen z-40';
    videoPlayerFrame.src = url;
    document.body.appendChild(videoPlayerFrame);
    // 將焦點移入iframe
    videoPlayerFrame.focus();
}

// 關閉播放器頁面
function closeVideoPlayer(home = false) {
    videoPlayerFrame = document.getElementById('VideoPlayerFrame');
    if (videoPlayerFrame) {
        videoPlayerFrame.remove();
        // 恢覆搜索結果顯示
        document.getElementById('resultsArea').classList.remove('hidden');
        // 關閉播放器時也隱藏詳情彈窗
        const detailModal = document.getElementById('modal');
        if (detailModal) {
            detailModal.classList.add('hidden');
        }
        // 如果啟用豆瓣區域則顯示豆瓣區域
        if (localStorage.getItem('doubanEnabled') === 'true') {
            document.getElementById('doubanArea').classList.remove('hidden');
        }
    }
    if (home) {
        // 刷新主頁
        window.location.href = '/'
    }
}

// 播放上一集
function playPreviousEpisode(sourceCode) {
    if (currentEpisodeIndex > 0) {
        const prevIndex = currentEpisodeIndex - 1;
        const prevUrl = currentEpisodes[prevIndex];
        playVideo(prevUrl, currentVideoTitle, sourceCode, prevIndex);
    }
}

// 播放下一集
function playNextEpisode(sourceCode) {
    if (currentEpisodeIndex < currentEpisodes.length - 1) {
        const nextIndex = currentEpisodeIndex + 1;
        const nextUrl = currentEpisodes[nextIndex];
        playVideo(nextUrl, currentVideoTitle, sourceCode, nextIndex);
    }
}

// 處理播放器加載錯誤
function handlePlayerError() {
    hideLoading();
    showToast('視頻播放加載失敗，請嘗試其他視頻源', 'error');
}

// 輔助函數用於渲染劇集按鈕（使用當前的排序狀態）
function renderEpisodes(vodName, sourceCode, vodId) {
    const episodes = episodesReversed ? [...currentEpisodes].reverse() : currentEpisodes;
    return episodes.map((episode, index) => {
        // 根據倒序狀態計算真實的劇集索引
        const realIndex = episodesReversed ? currentEpisodes.length - 1 - index : index;
        return `
            <button id="episode-${realIndex}" onclick="playVideo('${episode}','${vodName.replace(/"/g, '&quot;')}', '${sourceCode}', ${realIndex}, '${vodId}')" 
                    class="px-4 py-2 bg-[#222] hover:bg-[#333] border border-[#333] rounded-lg transition-colors text-center episode-btn">
                ${realIndex + 1}
            </button>
        `;
    }).join('');
}

// 覆制視頻鏈接到剪貼板
function copyLinks() {
    const episodes = episodesReversed ? [...currentEpisodes].reverse() : currentEpisodes;
    const linkList = episodes.join('\r\n');
    navigator.clipboard.writeText(linkList).then(() => {
        showToast('播放鏈接已覆制', 'success');
    }).catch(err => {
        showToast('覆制失敗，請檢查瀏覽器權限', 'error');
    });
}

// 切換排序狀態的函數
function toggleEpisodeOrder(sourceCode, vodId) {
    episodesReversed = !episodesReversed;
    // 重新渲染劇集區域，使用 currentVideoTitle 作為視頻標題
    const episodesGrid = document.getElementById('episodesGrid');
    if (episodesGrid) {
        episodesGrid.innerHTML = renderEpisodes(currentVideoTitle, sourceCode, vodId);
    }

    // 更新按鈕文本和箭頭方向
    const toggleBtn = document.querySelector(`button[onclick="toggleEpisodeOrder('${sourceCode}', '${vodId}')"]`);
    if (toggleBtn) {
        toggleBtn.querySelector('span').textContent = episodesReversed ? '正序排列' : '倒序排列';
        const arrowIcon = toggleBtn.querySelector('svg');
        if (arrowIcon) {
            arrowIcon.style.transform = episodesReversed ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }
}

// 從URL導入配置
async function importConfigFromUrl() {
    // 創建模態框元素
    let modal = document.getElementById('importUrlModal');
    if (modal) {
        document.body.removeChild(modal);
    }

    modal = document.createElement('div');
    modal.id = 'importUrlModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40';

    modal.innerHTML = `
        <div class="bg-[#191919] rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button id="closeUrlModal" class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">&times;</button>
            
            <h3 class="text-xl font-bold mb-4">從URL導入配置</h3>
            
            <div class="mb-4">
                <input type="text" id="configUrl" placeholder="輸入配置文件URL" 
                       class="w-full px-3 py-2 bg-[#222] border border-[#333] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
            </div>
            
            <div class="flex justify-end space-x-2">
                <button id="confirmUrlImport" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">導入</button>
                <button id="cancelUrlImport" class="bg-[#444] hover:bg-[#555] text-white px-4 py-2 rounded">取消</button>
            </div>
        </div>`;

    document.body.appendChild(modal);

    // 關閉按鈕事件
    document.getElementById('closeUrlModal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // 取消按鈕事件
    document.getElementById('cancelUrlImport').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // 確認導入按鈕事件
    document.getElementById('confirmUrlImport').addEventListener('click', async () => {
        const url = document.getElementById('configUrl').value.trim();
        if (!url) {
            showToast('請輸入配置文件URL', 'warning');
            return;
        }

        // 驗證URL格式
        try {
            const urlObj = new URL(url);
            if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
                showToast('URL必須以http://或https://開頭', 'warning');
                return;
            }
        } catch (e) {
            showToast('URL格式不正確', 'warning');
            return;
        }

        showLoading('正在從URL導入配置...');

        try {
            // 獲取配置文件 - 直接請求URL
            const response = await fetch(url, {
                mode: 'cors',
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) throw '獲取配置文件失敗';

            // 驗證響應內容類型
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw '響應不是有效的JSON格式';
            }

            const config = await response.json();
            if (config.name !== 'LibreTV-Settings') throw '配置文件格式不正確';

            // 驗證哈希
            const dataHash = await sha256(JSON.stringify(config.data));
            if (dataHash !== config.hash) throw '配置文件哈希值不匹配';

            // 導入配置
            for (let item in config.data) {
                localStorage.setItem(item, config.data[item]);
            }

            showToast('配置文件導入成功，3 秒後自動刷新本頁面。', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        } catch (error) {
            const message = typeof error === 'string' ? error : '導入配置失敗';
            showToast(`從URL導入配置出錯 (${message})`, 'error');
        } finally {
            hideLoading();
            document.body.removeChild(modal);
        }
    });

    // 點擊模態框外部關閉
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// 配置文件導入功能
async function importConfig() {
    showImportBox(async (file) => {
        try {
            // 檢查文件類型
            if (!(file.type === 'application/json' || file.name.endsWith('.json'))) throw '文件類型不正確';

            // 檢查文件大小
            if (file.size > 1024 * 1024 * 10) throw new Error('文件大小超過 10MB');

            // 讀取文件內容
            const content = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject('文件讀取失敗');
                reader.readAsText(file);
            });

            // 解析並驗證配置
            const config = JSON.parse(content);
            if (config.name !== 'LibreTV-Settings') throw '配置文件格式不正確';

            // 驗證哈希
            const dataHash = await sha256(JSON.stringify(config.data));
            if (dataHash !== config.hash) throw '配置文件哈希值不匹配';

            // 導入配置
            for (let item in config.data) {
                localStorage.setItem(item, config.data[item]);
            }

            showToast('配置文件導入成功，3 秒後自動刷新本頁面。', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        } catch (error) {
            const message = typeof error === 'string' ? error : '配置文件格式錯誤';
            showToast(`配置文件讀取出錯 (${message})`, 'error');
        }
    });
}

// 配置文件導出功能
async function exportConfig() {
    // 存儲配置數據
    const config = {};
    const items = {};

    const settingsToExport = [
        'selectedAPIs',
        'customAPIs',
        'yellowFilterEnabled',
        'adFilteringEnabled',
        'doubanEnabled',
        'hasInitializedDefaults'
    ];

    // 導出設置項
    settingsToExport.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) {
            items[key] = value;
        }
    });

    // 導出歷史記錄
    const viewingHistory = localStorage.getItem('viewingHistory');
    if (viewingHistory) {
        items['viewingHistory'] = viewingHistory;
    }

    const searchHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (searchHistory) {
        items[SEARCH_HISTORY_KEY] = searchHistory;
    }

    const times = Date.now().toString();
    config['name'] = 'LibreTV-Settings';  // 配置文件名，用於校驗
    config['time'] = times;               // 配置文件生成時間
    config['cfgVer'] = '1.0.0';           // 配置文件版本
    config['data'] = items;               // 配置文件數據
    config['hash'] = await sha256(JSON.stringify(config['data']));  // 計算數據的哈希值，用於校驗

    // 將配置數據保存為 JSON 文件
    saveStringAsFile(JSON.stringify(config), 'LibreTV-Settings_' + times + '.json');
}

// 將字符串保存為文件
function saveStringAsFile(content, fileName) {
    // 創建Blob對象並指定類型
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    // 生成臨時URL
    const url = window.URL.createObjectURL(blob);
    // 創建<a>標簽並觸發下載
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    // 清理臨時對象
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// 移除Node.js的require語句，因為這是在瀏覽器環境中運行的

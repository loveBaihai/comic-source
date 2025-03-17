class PixabayComicSource extends ComicSource {
    // 基本信息
    name = "Pixabay"
    key = "pixabay" 
    version = "1.0.0"
    minAppVersion = "1.0.0"
    url = "https://lovebaihai.github.io/comic-source/pixabay.js"

    // API 密钥，使用现有的密钥
    apiKey = "49378416-2520a996a7789e048763eff56"
    
    // API 基础 URL
    static apiUrl = "https://pixabay.com/api"
    
    // 请求头
    headers = {}
    
    // 初始化函数
    init() {
        // 从设置中加载 API 密钥（如果已保存）
        const savedApiKey = this.loadSetting('apiKey');
        if (savedApiKey && savedApiKey.length > 10) {
            this.apiKey = savedApiKey;
        }
        
        // 初始化请求头
        this.headers = {
            "User-Agent": "Venera/1.0.0",
            "Accept": "*/*",
        }
    }

    // 探索页面
    explore = [
        {
            title: "Pixabay",
            type: "singlePageWithMultiPart",
            load: async () => {
                try {
                    // 创建不同分类的请求，都添加动漫/漫画关键词
                    const animeRequest = Network.get(
                        `${PixabayComicSource.apiUrl}/?key=${this.apiKey}&q=anime+manga+illustration&image_type=all&per_page=20&page=1&safesearch=${this.loadSetting('safesearch') ? 'true' : 'false'}`,
                        this.headers
                    );
                    
                    const popularRequest = Network.get(
                        `${PixabayComicSource.apiUrl}/?key=${this.apiKey}&q=anime+manga+popular&image_type=all&per_page=20&page=1&order=popular&safesearch=${this.loadSetting('safesearch') ? 'true' : 'false'}`,
                        this.headers
                    );
                    
                    const characterRequest = Network.get(
                        `${PixabayComicSource.apiUrl}/?key=${this.apiKey}&q=anime+character+cartoon&image_type=all&per_page=20&page=1&safesearch=${this.loadSetting('safesearch') ? 'true' : 'false'}`,
                        this.headers
                    );
                    
                    const comicRequest = Network.get(
                        `${PixabayComicSource.apiUrl}/?key=${this.apiKey}&q=comic+manga+drawing&image_type=all&per_page=20&page=1&safesearch=${this.loadSetting('safesearch') ? 'true' : 'false'}`,
                        this.headers
                    );
                    
                    // 并行请求数据
                    const responses = await Promise.all([animeRequest, popularRequest, characterRequest, comicRequest]);
                    
                    // 解析数据
                    const animeData = JSON.parse(responses[0].body);
                    const popularData = JSON.parse(responses[1].body);
                    const characterData = JSON.parse(responses[2].body);
                    const comicData = JSON.parse(responses[3].body);
                    
                    // 检查响应状态
                    if (responses[0].status !== 200 || !animeData.hits) {
                        throw "获取动漫图片数据失败";
                    }
                    
                    // 整合结果
                    const result = {};
                    result["动漫插画"] = animeData.hits.map(item => this._parseImage(item));
                    result["热门作品"] = popularData.hits.map(item => this._parseImage(item));
                    result["动漫角色"] = characterData.hits.map(item => this._parseImage(item));
                    result["漫画插图"] = comicData.hits.map(item => this._parseImage(item));
                    
                    return result;
                    
                } catch (e) {
                    console.error("探索页面加载失败:", e);
                    UI.toast(`加载失败: ${e.message || e}`);
                    return {};
                }
            }
        }
    ]

    // 分类设置 - 修复识别问题
    static category_param_dict = {
        "动漫": "anime",
        "漫画": "manga",
        "卡通": "cartoon",
        "插画": "illustration",
        "角色": "character+anime",
        "少女": "anime+girl",
        "少年": "anime+boy",
        "机器人": "robot+anime",
        "魔法": "magic+anime",
        "忍者": "ninja+anime"
    }

    // 分类页面定义，符合Venera要求
    category = {
        title: "pixabay",
        parts: [
            {
                name: "风格",
                type: "fixed",
                categories: ["热门", "最新"],
                categoryParams: ["popular", "latest"],
                itemType: "category"
            },
            {
                name: "主题",
                type: "fixed",
                categories: Object.keys(PixabayComicSource.category_param_dict),
                categoryParams: Object.values(PixabayComicSource.category_param_dict),
                itemType: "category"
            }
        ]
    }

    // 分类漫画列表加载方法
    categoryComics = {
        load: async (category, param, options, page) => {
            try {
                let category_url;
                
                // 风格分类
                if (category === "热门" || param === "popular") {
                    category_url = `${PixabayComicSource.apiUrl}/?key=${this.apiKey}&q=anime+manga&image_type=all&per_page=21&page=${page}&order=popular&safesearch=${this.loadSetting('safesearch') ? 'true' : 'false'}`;
                } else if (category === "最新" || param === "latest") {
                    category_url = `${PixabayComicSource.apiUrl}/?key=${this.apiKey}&q=anime+manga&image_type=all&per_page=21&page=${page}&order=latest&safesearch=${this.loadSetting('safesearch') ? 'true' : 'false'}`;
                } else {
                    // 主题分类
                    if (category !== undefined && category !== null) {
                        // 若传入category，则转化为对应param
                        param = PixabayComicSource.category_param_dict[category] || "anime+manga";
                    }
                    
                    // 确保param有值
                    if (!param) {
                        param = "anime+manga";
                    }
                    
                    // 图片类型选项
                    let imageType = "all";
                    if (options && options.length > 0 && options[0] && options[0] !== "-") {
                        imageType = options[0];
                    }
                    
                    // 排序方式
                    let ordering = "popular";
                    if (options && options.length > 1 && options[1]) {
                        ordering = options[1];
                    }
                    
                    category_url = `${PixabayComicSource.apiUrl}/?key=${this.apiKey}&q=${param}&image_type=${imageType}&per_page=21&page=${page}&order=${ordering}&safesearch=${this.loadSetting('safesearch') ? 'true' : 'false'}`;
                }
                
                const res = await Network.get(category_url, this.headers);
                
                if (res.status !== 200) {
                    throw `请求失败，状态码: ${res.status}`;
                }
                
                const data = JSON.parse(res.body);
                
                if (!data.hits) {
                    return { comics: [], maxPage: 1 };
                }
                
                return {
                    comics: data.hits.map(item => this._parseImage(item)),
                    maxPage: Math.ceil(data.totalHits / 21) > 50 ? 50 : Math.ceil(data.totalHits / 21)
                };
                
            } catch (e) {
                console.error("分类页面加载失败:", e);
                UI.toast(`加载失败: ${e.message || e}`);
                return { comics: [], maxPage: 1 };
            }
        },
        
        optionList: [
            {
                options: [
                    "-全部",
                    "photo-照片",
                    "illustration-插画",
                    "vector-矢量图"
                ],
                notShowWhen: ["热门", "最新"],
                showWhen: Object.keys(PixabayComicSource.category_param_dict)
            },
            {
                options: [
                    "popular-热门",
                    "latest-最新"
                ],
                notShowWhen: ["热门", "最新"],
                showWhen: Object.keys(PixabayComicSource.category_param_dict)
            }
        ]
    }
    
 // 搜索功能 - 只添加一个manga关键词
search = {
    load: async (keyword, options, page) => {
        try {
            // 解析搜索选项
            let imageType = "all";
            let ordering = "popular";
            
            if (options && options.length >= 1 && options[0]) {
                imageType = options[0];
            }
            
            if (options && options.length >= 2 && options[1]) {
                ordering = options[1];
            }
            
            // 处理搜索关键词
            let searchKeyword = keyword || "";
            
            // 用户搜索特殊处理
            if (searchKeyword.startsWith("user:")) {
                // 用户名搜索保持原样，但添加manga关键词
                const username = searchKeyword.substring(5).trim();
                searchKeyword = `user:${username} manga`;
            } else if (searchKeyword.length > 0) {
                // 普通搜索词，只添加manga关键词
                searchKeyword = `${searchKeyword} manga`;
            } else {
                // 空搜索，只使用manga关键词
                searchKeyword = "manga";
            }
            
            // 确保正确编码 URL
            const encodedKeyword = encodeURIComponent(searchKeyword);
            
            // 构建完整的搜索 URL
            const search_url = `${PixabayComicSource.apiUrl}/?key=${this.apiKey}&q=${encodedKeyword}&image_type=${imageType}&per_page=21&page=${page}&order=${ordering}&safesearch=${this.loadSetting('safesearch') ? 'true' : 'false'}`;
            
            console.log("搜索关键词:", searchKeyword); // 调试用
            
            // 使用编码后的 URL 发送请求
            const res = await Network.get(search_url, this.headers);
            
            if (res.status !== 200) {
                throw `请求失败，状态码: ${res.status}`;
            }
            
            const data = JSON.parse(res.body);
            
            if (!data.hits) {
                return { comics: [], maxPage: 1 };
            }
            
            return {
                comics: data.hits.map(item => this._parseImage(item)),
                maxPage: Math.ceil(data.totalHits / 21) > 50 ? 50 : Math.ceil(data.totalHits / 21)
            };
            
        } catch (e) {
            console.error("搜索失败:", e);
            UI.toast(`搜索失败: ${e.message || e}`);
            return { comics: [], maxPage: 1 };
        }
    },
    
    optionList: [
        {
            type: "select",
            options: [
                "all-所有类型",
                "photo-照片",
                "illustration-插画",
                "vector-矢量图"
            ],
            label: "图片类型"
        },
        {
            type: "select",
            options: [
                "popular-热门",
                "latest-最新"
            ],
            label: "排序方式"
        }
    ]
}
    // 收藏功能
    favorites = {
        multiFolder: false,
        
        addOrDelFavorite: async (comicId, folderId, isAdding, favoriteId) => {
            try {
                // 使用 app 本地存储来管理收藏
                const key = `pixabay_favorites`;
                let favorites = [];
                
                try {
                    const savedFavorites = await Storage.get(key);
                    if (savedFavorites) {
                        favorites = JSON.parse(savedFavorites);
                    }
                } catch (e) {
                    console.error("读取收藏失败:", e);
                }
                
                if (isAdding) {
                    if (!favorites.includes(comicId)) {
                        favorites.push(comicId);
                    }
                } else {
                    favorites = favorites.filter(id => id !== comicId);
                }
                
                await Storage.set(key, JSON.stringify(favorites));
                return 'ok';
            } catch (e) {
                console.error("收藏操作失败:", e);
                UI.toast(`收藏操作失败: ${e.message || e}`);
                return 'error';
            }
        },
        
        loadFolders: async (comicId) => {
            try {
                // 返回单个默认收藏夹
                const key = `pixabay_favorites`;
                let favorites = [];
                
                try {
                    const savedFavorites = await Storage.get(key);
                    if (savedFavorites) {
                        favorites = JSON.parse(savedFavorites);
                    }
                } catch (e) {
                    console.error("读取收藏失败:", e);
                }
                
                return {
                    folders: {'default': '收藏夹'},
                    favorited: comicId ? (favorites.includes(comicId) ? ['default'] : []) : []
                };
            } catch (e) {
                console.error("加载收藏夹失败:", e);
                return {
                    folders: {'default': '收藏夹'},
                    favorited: []
                };
            }
        },
        
        loadComics: async (page, folder) => {
            try {
                let favorites = [];
                
                try {
                    const savedFavorites = await Storage.get(`pixabay_favorites`);
                    if (savedFavorites) {
                        favorites = JSON.parse(savedFavorites);
                    }
                } catch (e) {
                    console.error("读取收藏失败:", e);
                }
                
                const pageSize = 20;
                const start = (page - 1) * pageSize;
                const end = start + pageSize;
                const pageIds = favorites.slice(start, end);
                
                const comics = [];
                for (const id of pageIds) {
                    try {
                        const response = await Network.get(
                            `${PixabayComicSource.apiUrl}/?key=${this.apiKey}&id=${id.split('-')[0]}`,
                            this.headers
                        );
                        
                        const data = JSON.parse(response.body);
                        if (data.hits && data.hits.length > 0) {
                            comics.push(this._parseImage(data.hits[0]));
                        }
                    } catch (e) {
                        console.error("加载收藏图片失败:", e);
                    }
                }
                
                return {
                    comics: comics,
                    maxPage: Math.ceil(favorites.length / pageSize) || 1
                };
            } catch (e) {
                console.error("加载收藏列表失败:", e);
                UI.toast(`加载收藏列表失败: ${e.message || e}`);
                return {
                    comics: [],
                    maxPage: 1
                };
            }
        }
    }

    // 漫画详情
    comic = {
        loadInfo: async (id) => {
            try {
                // 解析ID获取图片ID
                const imageId = id.split('-')[0];
                
                const response = await Network.get(
                    `${PixabayComicSource.apiUrl}/?key=${this.apiKey}&id=${imageId}`,
                    this.headers
                );
                
                if (response.status !== 200) {
                    throw `请求失败，状态码: ${response.status}`;
                }
                
                const data = JSON.parse(response.body);
                
                if (!data.hits || data.hits.length === 0) {
                    throw new Error("图片未找到");
                }
                
                const image = data.hits[0];
                
                // 获取收藏状态
                const key = `pixabay_favorites`;
                let favorites = [];
                let isFavorite = false;
                
                try {
                    const savedFavorites = await Storage.get(key);
                    if (savedFavorites) {
                        favorites = JSON.parse(savedFavorites);
                        isFavorite = favorites.includes(id);
                    }
                } catch (e) {
                    console.error("读取收藏失败:", e);
                }
                
                // 构建标签
                const tags = image.tags.split(',').map(tag => tag.trim());
                
                return {
                    title: image.tags ? tags[0] : '未命名',
                    cover: image.webformatURL,
                    description: `上传者: ${image.user}\n\n分辨率: ${image.imageWidth}x${image.imageHeight}\n浏览次数: ${image.views}\n下载次数: ${image.downloads}\n喜欢次数: ${image.likes}`,
                    tags: {
                        "上传者": [image.user],
                        "标签": tags,
                        "类型": [image.type]
                    },
                    chapters: new Map([
                        ["view", "查看大图"]
                    ]),
                    isFavorite: isFavorite,
                    subId: image.id.toString()
                };
            } catch (e) {
                console.error("加载图片详情失败:", e);
                UI.toast(`加载图片详情失败: ${e.message || e}`);
                throw e;
            }
        },
        
        loadEp: async (comicId, epId) => {
            try {
                // 解析ID获取图片ID
                const imageId = comicId.split('-')[0];
                
                const response = await Network.get(
                    `${PixabayComicSource.apiUrl}/?key=${this.apiKey}&id=${imageId}`,
                    this.headers
                );
                
                if (response.status !== 200) {
                    throw `请求失败，状态码: ${response.status}`;
                }
                
                const data = JSON.parse(response.body);
                
                if (!data.hits || data.hits.length === 0) {
                    throw new Error("图片未找到");
                }
                
                const image = data.hits[0];
                
                // 返回原始图像URL
                return {
                    images: [image.largeImageURL]
                };
            } catch (e) {
                console.error("加载图片失败:", e);
                UI.toast(`加载图片失败: ${e.message || e}`);
                throw e;
            }
        },
        
        loadThumbnails: async (id, next) => {
            try {
                // 解析图片ID
                const imageId = id.split('-')[0];
                
                const response = await Network.get(
                    `${PixabayComicSource.apiUrl}/?key=${this.apiKey}&id=${imageId}`,
                    this.headers
                );
                
                if (response.status !== 200) {
                    throw `请求失败，状态码: ${response.status}`;
                }
                
                const data = JSON.parse(response.body);
                
                if (!data.hits || data.hits.length === 0) {
                    throw new Error("图片未找到");
                }
                
                const image = data.hits[0];
                
                // 返回单个缩略图
                return {
                    thumbnails: [image.webformatURL],
                    next: null // 单张图片不需要分页
                };
            } catch (e) {
                console.error("加载缩略图失败:", e);
                throw e;
            }
        },
        
        onClickTag: (namespace, tag) => {
            if (namespace === "标签") {
                return {
                    action: 'search',
                    keyword: tag, // 搜索方法会自动添加动漫/漫画关键词
                    param: null,
                }
            }
            if (namespace === "上传者") {
                return {
                    action: 'search',
                    keyword: `user:${tag}`,
                    param: null,
                }
            }
            if (namespace === "类型") {
                return {
                    action: 'category',
                    keyword: null,
                    param: tag,
                }
            }
            throw "未支持此类Tag检索"
        },
        
        link: {
            domains: ['pixabay.com'],
            linkToId: (url) => {
                // 匹配 Pixabay 各种 URL 格式中的图片 ID
                const match = url.match(/pixabay\.com\/(?:.*?)\/(?:.*?)-(\d+)\/?/);
                if (match && match[1]) {
                    return match[1];
                }
                return null;
            }
        }
    }

    // 设置
    settings = {
        apiKey: {
            title: "API 密钥",
            type: "input",
            validator: ".+",
            default: "",
        },
        safesearch: {
            title: "安全搜索",
            type: "switch",
            default: true,
        }
    }

    // 多语言翻译
    translation = {
        'zh_CN': {
            'API 密钥': 'API 密钥',
            '安全搜索': '安全搜索',
            '排序方式': '排序方式',
            '热门': '热门',
            '最新': '最新',
            '图片类型': '图片类型',
            '所有': '所有',
            '照片': '照片',
            '插画': '插画',
            '矢量图': '矢量图',
            '动漫插画': '动漫插画',
            '热门作品': '热门作品',
            '动漫角色': '动漫角色',
            '漫画插图': '漫画插图',
            '查看大图': '查看大图',
            '未命名': '未命名',
            '收藏夹': '收藏夹',
            '标签': '标签',
            '上传者': '上传者',
            '浏览次数': '浏览次数',
            '下载次数': '下载次数',
            '喜欢次数': '喜欢次数',
            '分辨率': '分辨率',
            '类型': '类型',
            '风格': '风格',
            '主题': '主题',
            '动漫': '动漫',
            '漫画': '漫画',
            '卡通': '卡通',
            '角色': '角色',
            '少女': '少女',
            '少年': '少年',
            '机器人': '机器人',
            '魔法': '魔法',
            '忍者': '忍者'
        },
        'zh_TW': {
            'API 密钥': 'API 密鑰',
            '安全搜索': '安全搜索',
            '排序方式': '排序方式',
            '热门': '熱門',
            '最新': '最新',
            '图片类型': '圖片類型',
            '所有': '所有',
            '照片': '照片',
            '插画': '插畫',
            '矢量图': '矢量圖',
            '动漫插画': '動漫插畫',
            '热门作品': '熱門作品',
            '动漫角色': '動漫角色',
            '漫画插图': '漫畫插圖',
            '查看大图': '查看大圖',
            '未命名': '未命名',
            '收藏夹': '收藏夾',
            '标签': '標籤',
            '上传者': '上傳者',
            '浏览次数': '瀏覽次數',
            '下载次数': '下載次數',
            '喜欢次数': '喜歡次數',
            '分辨率': '分辨率',
            '类型': '類型',
            '风格': '風格',
            '主题': '主題',
            '动漫': '動漫',
            '漫画': '漫畫',
            '卡通': '卡通',
            '角色': '角色',
            '少女': '少女',
            '少年': '少年',
            '机器人': '機器人',
            '魔法': '魔法',
            '忍者': '忍者'
        },
        'en': {
            'API 密钥': 'API Key',
            '安全搜索': 'Safe Search',
            '排序方式': 'Sort By',
            '热门': 'Popular',
            '最新': 'Latest',
            '图片类型': 'Image Type',
            '所有': 'All',
            '照片': 'Photo',
            '插画': 'Illustration',
            '矢量图': 'Vector',
            '动漫插画': 'Anime Illustrations',
            '热门作品': 'Popular Works',
            '动漫角色': 'Anime Characters',
            '漫画插图': 'Comic Illustrations',
            '查看大图': 'View Full Image',
            '未命名': 'Untitled',
            '收藏夹': 'Favorites',
            '标签': 'Tags',
            '上传者': 'Uploader',
            '浏览次数': 'Views',
            '下载次数': 'Downloads',
            '喜欢次数': 'Likes',
            '分辨率': 'Resolution',
            '类型': 'Type',
            '风格': 'Style',
            '主题': 'Theme',
            '动漫': 'Anime',
            '漫画': 'Manga',
            '卡通': 'Cartoon',
            '角色': 'Characters',
            '少女': 'Girl',
            '少年': 'Boy',
            '机器人': 'Robot',
            '魔法': 'Magic',
            '忍者': 'Ninja'
        }
    }

    // 辅助方法：将 Pixabay 的图片项转换为展示对象
    _parseImage(item) {
        const tags = item.tags ? item.tags.split(',').map(tag => tag.trim()) : [];
        return {
            id: `${item.id}-${new Date().getTime()}`,
            title: tags.length > 0 ? tags[0] : '未命名',
            subTitle: item.user,
            cover: item.webformatURL,
            tags: tags,
            description: `分辨率: ${item.imageWidth}x${item.imageHeight}\n浏览: ${item.views} | 下载: ${item.downloads}`
        }
    }
}

/**
 * Pixabay 漫画源 - 用于 Venera 应用
 * 基于 Pixabay API 实现的图片浏览功能
 * 支持搜索、分类浏览、收藏等功能
 */
class PixabayComicSource extends ComicSource {
    // 基本信息
    name = "Pixabay"
    key = "pixabay" 
    version = "1.0.0"
    minAppVersion = "1.0.0"
    url = "https://lovebaihai.github.io/comic-source/pixabay.js"

    // API 密钥，需要替换为您自己的密钥
    apiKey = "49378416-2520a996a7789e048763eff56"
    
    // 获取 API 基础 URL
    get baseUrl() {
        return `https://pixabay.com/api`;
    }
    
    // 初始化函数
    init() {
        // 检查 API 密钥是否已设置
        if (this.apiKey === "YOUR_PIXABAY_API_KEY") {
            UI.toast("请在源代码中设置您的 Pixabay API 密钥或在设置中填写");
        }
        
        // 从设置中加载 API 密钥（如果已保存）
        const savedApiKey = this.loadSetting('apiKey');
        if (savedApiKey && savedApiKey.length > 10) {
            this.apiKey = savedApiKey;
        }
    }

    // 探索页面
    explore = [
        {
            title: "动漫图片",
            type: "multiPageComicList",
            
            /**
             * 加载探索页面的内容
             * @param page 页码，从1开始
             */
            load: async (page) => {
                try {
                    const response = await Network.get(
                        `${this.baseUrl}/?key=${this.apiKey}&q=anime+illustration&image_type=all&per_page=20&page=${page}&safesearch=${this.loadSetting('safesearch') ? 'true' : 'false'}`
                    );
                    
                    const data = JSON.parse(response);
                    if (!data.hits) {
                        UI.toast("无法获取图片数据");
                        return { comics: [], maxPage: 1 };
                    }
                    
                    const comics = data.hits.map(item => this._convertToComic(item));
                    const maxPage = Math.ceil(data.totalHits / 20);
                    
                    return {
                        comics: comics,
                        maxPage: maxPage > 50 ? 50 : maxPage // Pixabay API 限制最多返回500张图片
                    };
                } catch (e) {
                    console.error("探索页面加载失败:", e);
                    UI.toast(`加载失败: ${e.message || e}`);
                    return { comics: [], maxPage: 1 };
                }
            }
        },
        {
            title: "热门插画",
            type: "multiPageComicList",
            
            load: async (page) => {
                try {
                    const response = await Network.get(
                        `${this.baseUrl}/?key=${this.apiKey}&q=illustration&image_type=all&per_page=20&page=${page}&order=popular&safesearch=${this.loadSetting('safesearch') ? 'true' : 'false'}`
                    );
                    
                    const data = JSON.parse(response);
                    if (!data.hits) {
                        UI.toast("无法获取图片数据");
                        return { comics: [], maxPage: 1 };
                    }
                    
                    const comics = data.hits.map(item => this._convertToComic(item));
                    const maxPage = Math.ceil(data.totalHits / 20);
                    
                    return {
                        comics: comics,
                        maxPage: maxPage > 50 ? 50 : maxPage
                    };
                } catch (e) {
                    console.error("热门插画加载失败:", e);
                    UI.toast(`加载失败: ${e.message || e}`);
                    return { comics: [], maxPage: 1 };
                }
            }
        },
        {
            title: "自然风景",
            type: "multiPageComicList",
            
            load: async (page) => {
                try {
                    const response = await Network.get(
                        `${this.baseUrl}/?key=${this.apiKey}&q=nature+landscape&image_type=all&per_page=20&page=${page}&safesearch=${this.loadSetting('safesearch') ? 'true' : 'false'}`
                    );
                    
                    const data = JSON.parse(response);
                    if (!data.hits) {
                        UI.toast("无法获取图片数据");
                        return { comics: [], maxPage: 1 };
                    }
                    
                    const comics = data.hits.map(item => this._convertToComic(item));
                    const maxPage = Math.ceil(data.totalHits / 20);
                    
                    return {
                        comics: comics,
                        maxPage: maxPage > 50 ? 50 : maxPage
                    };
                } catch (e) {
                    console.error("自然风景加载失败:", e);
                    UI.toast(`加载失败: ${e.message || e}`);
                    return { comics: [], maxPage: 1 };
                }
            }
        }
    ]

    // 搜索功能
    search = {
        load: async (keyword, options, page) => {
            try {
                // 解析搜索选项
                let orderOption = 'popular';
                let imageTypeOption = 'all';
                
                if (options && options.length >= 2) {
                    orderOption = options[0] || 'popular';
                    imageTypeOption = options[1] || 'all';
                }
                
                const response = await Network.get(
                    `${this.baseUrl}/?key=${this.apiKey}&q=${encodeURIComponent(keyword)}&image_type=${imageTypeOption}&per_page=20&page=${page}&order=${orderOption}&safesearch=${this.loadSetting('safesearch') ? 'true' : 'false'}`
                );
                
                const data = JSON.parse(response);
                if (!data.hits) {
                    UI.toast("无法获取搜索结果");
                    return { comics: [], maxPage: 1 };
                }
                
                const comics = data.hits.map(item => this._convertToComic(item));
                const maxPage = Math.ceil(data.totalHits / 20);
                
                return {
                    comics: comics,
                    maxPage: maxPage > 50 ? 50 : maxPage
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
                    "popular-热门",
                    "latest-最新"
                ],
                label: "排序方式",
                default: "popular",
            },
            {
                type: "select",
                options: [
                    "all-所有",
                    "photo-照片",
                    "illustration-插画",
                    "vector-矢量图"
                ],
                label: "图片类型",
                default: "all",
            }
        ],
        
        enableTagsSuggestions: false,
    }

    // 漫画详情
    comic = {
        loadInfo: async (id) => {
            try {
                // 解析ID获取图片ID
                const imageId = id.split('-')[0];
                
                const response = await Network.get(
                    `${this.baseUrl}/?key=${this.apiKey}&id=${imageId}`
                );
                
                const data = JSON.parse(response);
                if (!data.hits || data.hits.length === 0) {
                    UI.toast("无法获取图片详情");
                    throw new Error("图片未找到");
                }
                
                const image = data.hits[0];
                
                return {
                    id: id,
                    title: image.tags ? image.tags.split(',')[0].trim() : '未命名',
                    cover: image.webformatURL,
                    update: new Date(image.previewURL).toISOString(),
                    isFinished: true,
                    isLiked: false,
                    chapters: [
                        {
                            id: "view",
                            title: "查看大图",
                            updateTime: new Date(image.previewURL).toISOString()
                        }
                    ],
                    description: `标签: ${image.tags}\n上传者: ${image.user}\n浏览次数: ${image.views}\n下载次数: ${image.downloads}\n喜欢次数: ${image.likes}`,
                    authors: [
                        {
                            name: image.user,
                            role: "作者"
                        }
                    ],
                    tags: image.tags.split(',').map(tag => {
                        return {
                            namespace: "tags",
                            key: tag.trim(),
                            value: tag.trim()
                        }
                    })
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
                    `${this.baseUrl}/?key=${this.apiKey}&id=${imageId}`
                );
                
                const data = JSON.parse(response);
                if (!data.hits || data.hits.length === 0) {
                    UI.toast("无法获取图片");
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
        
        // 添加缩略图支持
        loadThumbnails: async (id, next) => {
            try {
                // 解析图片ID
                const imageId = id.split('-')[0];
                
                const response = await Network.get(
                    `${this.baseUrl}/?key=${this.apiKey}&id=${imageId}`
                );
                
                const data = JSON.parse(response);
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
            if (namespace === "tags") {
                return {
                    action: "search",
                    keyword: tag
                };
            }
            return null;
        },
        
        link: {
            domains: ['pixabay.com'],
            linkToId: ("https://pixabay.com") => {
                // 匹配 Pixabay 各种 URL 格式中的图片 ID
                const match = "https://pixabay.com".match(/pixabay\.com\/(?:.*?)\/(?:.*?)-(\d+)\/?/);
                if (match && match[1]) {
                    return match[1];
                }
                return null;
            }
        }
    }

    // 收藏功能
    favorites = {
        multiFolder: false,
        
        addOrDelFavorite: async (comicId, folderId, isAdding, favoriteId) => {
            try {
                // 使用 app 本地存储来管理收藏，因为 Pixabay API 不支持收藏功能
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
                            `${this.baseUrl}/?key=${this.apiKey}&id=${id.split('-')[0]}`
                        );
                        
                        const data = JSON.parse(response);
                        if (data.hits && data.hits.length > 0) {
                            comics.push(this._convertToComic(data.hits[0]));
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
            '动漫图片': '动漫图片',
            '热门插画': '热门插画',
            '自然风景': '自然风景',
            '查看大图': '查看大图',
            '未命名': '未命名',
            '收藏夹': '收藏夹',
            '标签': '标签',
            '上传者': '上传者',
            '浏览次数': '浏览次数',
            '下载次数': '下载次数',
            '喜欢次数': '喜欢次数',
            '作者': '作者'
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
            '动漫图片': '動漫圖片',
            '热门插画': '熱門插畫',
            '自然风景': '自然風景',
            '查看大图': '查看大圖',
            '未命名': '未命名',
            '收藏夹': '收藏夾',
            '标签': '標籤',
            '上传者': '上傳者',
            '浏览次数': '瀏覽次數',
            '下载次数': '下載次數',
            '喜欢次数': '喜歡次數',
            '作者': '作者'
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
            '动漫图片': 'Anime Images',
            '热门插画': 'Popular Illustrations',
            '自然风景': 'Nature & Landscape',
            '查看大图': 'View Full Image',
            '未命名': 'Untitled',
            '收藏夹': 'Favorites',
            '标签': 'Tags',
            '上传者': 'Uploader',
            '浏览次数': 'Views',
            '下载次数': 'Downloads',
            '喜欢次数': 'Likes',
            '作者': 'Author'
        }
    }

    // 辅助方法：将 Pixabay 的图片项转换为 Comic 对象
    _convertToComic(item) {
        return {
            id: `${item.id}-${new Date().getTime()}`,
            title: item.tags ? item.tags.split(',')[0].trim() : '未命名',
            cover: item.webformatURL,
            update: new Date(item.previewURL).toISOString(),
            authors: [
                {
                    name: item.user,
                    role: "作者"
                }
            ]
        };
    }
}

module.exports = new PixabayComicSource();

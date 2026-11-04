/* =========================================================
   知闻 News Compass — interactions
   ========================================================= */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const icon = (name, extraClass = '') =>
    `<svg class="icon ${extraClass}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  const escapeHTML = (value) =>
    String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pad = (value) => String(value).padStart(2, '0');

  const shanghaiFormatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  });

  const shanghaiParts = (date) => {
    const values = {};
    shanghaiFormatter.formatToParts(date).forEach((part) => {
      if (part.type !== 'literal') values[part.type] = part.value;
    });
    return values;
  };

  const formatDateLong = (date) => {
    const parts = shanghaiParts(date);
    return `${parts.year}年${pad(parts.month)}月${pad(parts.day)}日`;
  };

  const formatClock = (date) => {
    const parts = shanghaiParts(date);
    return `${pad(parts.hour)}:${pad(parts.minute)}`;
  };

  const dateKey = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  /* --------------------------------------------------------
     Editorial data
     -------------------------------------------------------- */

  const columns = [
    {
      id: 'china',
      title: '国内要闻',
      subtitle: '新闻 · 趋势 · 每日更新',
      icon: 'compass',
      accent: 'green',
      offset: 0,
      items: [
        {
          id: 'china-1',
          title: '跨区域出行：前三季度人员流动超 512 亿人次',
          tag: '出行 · 数据',
          read: 3,
          summary: '从通勤到探亲，越来越密的交通网络正把城市与城市之间的距离重新折叠。',
          quote: '流动的数字背后，是人们重新安排生活半径的努力。',
          body: [
            '今年前三季度，跨区域人员流动保持活跃。铁路、公路与民航的短途出行需求增长明显，周末和节假日形成了更密集的出行高峰。',
            '交通部门表示，接下来将围绕热门线路增加运力，并推动票务、换乘和行李服务的信息互通，让一次出行少一点等待，多一点从容。'
          ]
        },
        {
          id: 'china-2',
          title: '城市公共交通迎来数字化升级新阶段',
          tag: '城市 · 民生',
          read: 4,
          summary: '从实时到站到一键换乘，城市公共交通正在把数字化落到每一次具体出行里。',
          body: [
            '多个城市近期升级公交与地铁的联合调度系统，通过实时客流预测调整发车间隔。部分站点还试点无障碍导航与行李寄存服务。',
            '技术升级之外，如何让老年人、儿童和不熟悉智能手机的人也能顺畅使用，仍是这轮改造的重要课题。'
          ]
        },
        {
          id: 'china-3',
          title: '多地推进社区托育服务，家门口的托班更多了',
          tag: '教育 · 社区',
          read: 3,
          summary: '托育点开进社区，年轻家庭的时间表正在被重新安排。',
          body: [
            '多地公布新一批社区托育服务点，提供半日托、临时托与周末托等不同形式。部分点位与社区卫生服务中心联动，方便家长就近获得育儿支持。',
            '业内人士认为，托育服务的关键不只是数量，还包括稳定的人员、透明的收费和可预期的服务质量。'
          ]
        },
        {
          id: 'china-4',
          title: '秋粮收购进度快于去年同期',
          tag: '农业 · 财经',
          read: 3,
          summary: '秋粮收购进入高峰，仓储与物流的数字化让颗粒归仓更有把握。',
          body: [
            '随着秋粮集中上市，各地收购点延长服务时间，并推广预约售粮与电子结算。种粮户可以通过手机查询附近库点的价格和排队情况。',
            '粮食部门表示，将继续加强质量检测和仓储通风管理，减少产后损耗，保障农户收益。'
          ]
        },
        {
          id: 'china-5',
          title: '公共图书馆夜间开放，城市阅读空间延长至 22 点',
          tag: '文化 · 生活',
          read: 3,
          summary: '当夜色落下，城市的阅读灯还亮着。',
          quote: '夜间图书馆提供的不只是座位，也是一种“城市还愿意慢下来”的暗示。',
          body: [
            '本周起，多座城市的公共图书馆试行延长开放时间，部分馆区在周五、周六开放至 22 点，并增加夜间自习与小型分享活动。',
            '延长开放也对馆员排班、照明与安全管理提出了新要求。多家图书馆表示，将根据实际使用情况动态调整，而不是简单地“越晚越好”。'
          ]
        },
        {
          id: 'china-6',
          title: '新一轮人才安居计划发布，覆盖更多青年租户',
          tag: '城市 · 政策',
          read: 4,
          summary: '更稳定的租住预期，正在成为年轻人选择一座城市的重要理由。',
          body: [
            '新一轮人才安居计划扩大了保障性租赁住房的覆盖范围，并优化申请流程。部分项目提供家具家电与共享公区，缩短入住准备时间。',
            '专家提醒，安居政策还需与通勤、托育、公共服务等因素协同，才能真正降低青年人的生活成本。'
          ]
        }
      ]
    },
    {
      id: 'tech',
      title: '数码热榜',
      subtitle: '新品 · 体验 · 趋势',
      icon: 'device',
      accent: 'tech',
      offset: 0,
      items: [
        {
          id: 'tech-1',
          title: '触控与 OLED 加入 MacBook Pro，新机型发布',
          tag: '电脑 · 新品',
          read: 4,
          summary: '更亮的屏幕、更直接的触控，笔记本与平板的边界又模糊了一点。',
          quote: '硬件的意义，最终要回到它让哪些日常动作变得更自然。',
          body: [
            '新机型将 OLED 面板与触控输入引入更多配置，机身厚度和重量保持稳定。配套的创作软件也更新了手势与笔刷支持。',
            '对经常在移动场景中处理图片和视频的人来说，显示素质的提升比单纯的性能数字更有感知。是否值得升级，仍取决于接口、续航与价格的整体平衡。'
          ]
        },
        {
          id: 'tech-2',
          title: '理想 i6 新车型亮相，自研电池与电驱方案公布',
          tag: '汽车 · 新能源',
          read: 4,
          summary: '一台主打家庭场景的新车型，把电池与电驱的效率带到了更主流的价位。',
          body: [
            '新车采用自研电池包与集成电驱方案，官方公布的续航和补能效率较上一代有所提升。座舱强调多人出行与儿童友好配置。',
            '在竞争激烈的新能源市场，参数只是入场券。交付节奏、售后网络和真实能耗，才是用户长期体验的关键。'
          ]
        },
        {
          id: 'tech-3',
          title: '华为发布新一代折叠屏，轻薄再进一步',
          tag: '手机 · 华为',
          read: 3,
          summary: '折叠屏继续减重，这一次试图解决的是“愿不愿意每天带着它”。',
          body: [
            '新机在铰链结构与屏幕材料上进一步优化，展开厚度和折痕控制都有改善。系统层面增加了分屏与悬停场景的适配。',
            '折叠屏正在从展示技术走向日常工具，但应用生态与维修成本仍是影响普及速度的两块短板。'
          ]
        },
        {
          id: 'tech-4',
          title: '国内首条 8 英寸硅光产线通线',
          tag: '芯片 · 产业',
          read: 5,
          summary: '硅光产线的通线，为更高速、更低功耗的数据传输补上一块基础设施。',
          body: [
            '该产线聚焦硅基光电子芯片的规模化制造，面向数据中心、通信与传感等场景。首批样品已进入客户验证阶段。',
            '硅光技术被视为后摩尔时代的重要方向之一，但从通线到稳定良率，还有一段需要产业链共同完成的距离。'
          ]
        },
        {
          id: 'tech-5',
          title: '智能眼镜走向日常，AI 助手成标配',
          tag: '可穿戴 · AI',
          read: 4,
          summary: '当眼镜开始理解场景，它离“日常设备”还有多远？',
          quote: '真正自然的可穿戴设备，应该让人忘记它是一台设备。',
          body: [
            '多家厂商展示了新一代智能眼镜，重量接近普通板材眼镜，并加入实时翻译、导航提示与拍摄功能。AI 助手成为主要交互入口。',
            '隐私边界仍然是这类产品绕不开的问题。摄像头提示、数据存储与佩戴礼仪，需要比功能迭代更早被讨论。'
          ]
        },
        {
          id: 'tech-6',
          title: '新一代 Wi-Fi 标准开始规模商用',
          tag: '网络 · 通信',
          read: 3,
          summary: '更密集的接入与更低的延迟，正在为家庭和办公场景打开新的连接方式。',
          body: [
            '新一代无线标准开始进入路由器、笔记本与物联网设备，重点改善高密度环境下的稳定性和能效。',
            '对普通用户而言，升级体验可能不会立刻可见；真正受益的，是多设备同时在线、云游戏与智能家居等场景。'
          ]
        }
      ]
    },
    {
      id: 'dev',
      title: '开发者热议',
      subtitle: '开源 · 工程 · 独立思考',
      icon: 'terminal',
      accent: 'dev',
      offset: 0,
      items: [
        {
          id: 'dev-1',
          title: '为什么我把 side project 的后端换回了 SQLite',
          tag: 'Hacker News · 数据库',
          read: 5,
          summary: '一位独立开发者把后端从托管数据库迁回 SQLite，理由朴素：够用、可备份、没有账单惊吓。',
          quote: '先把产品做出来，再为想象中的规模付费。',
          body: [
            '作者记录了迁移过程中的取舍：单文件数据库让本地开发与部署更轻，读多写少的个人项目也几乎遇不到并发瓶颈。',
            '帖子下的讨论很热闹。有人提醒备份与迁移方案，也有人分享用类似架构支撑小型产品的经验。工具没有高下，匹配场景才重要。'
          ]
        },
        {
          id: 'dev-2',
          title: 'RISC-V 芯片通过 OpenSBI 适配，社区提交首个补丁',
          tag: '开源 · 硬件',
          read: 4,
          summary: '一块 RISC-V 开发板在社区推动下完成 OpenSBI 适配，开源硬件的协作方式再次显现。',
          body: [
            '提交者公开了启动流程、设备树与中断控制的修改细节，并附上可复现的测试步骤。维护者正在评估合并与后续兼容性。',
            '这类看似微小的补丁，是生态从能用走向好用的必经之路。文档、测试和耐心，往往比一次亮眼的发布更重要。'
          ]
        },
        {
          id: 'dev-3',
          title: '我用三万行 Rust 重写了一个小工具',
          tag: '编程 · Rust',
          read: 6,
          summary: '三万行 Rust 代码重写一个熟悉的小工具，是技术热情，也是一场关于边界的实验。',
          body: [
            '作者从命令行解析、错误处理到打包分发完整记录了自己的选择，并坦诚哪些地方是为了学习而非效率。',
            '评论区的共识很有意思：重写不一定让产品更好，但它能迫使开发者重新理解每一个决定。前提是，别把它当成唯一正确的方式。'
          ]
        },
        {
          id: 'dev-4',
          title: '浏览器里的本地优先应用正在回归',
          tag: 'Web · 开发',
          read: 5,
          summary: '本地优先不是新技术，却正在成为一批新产品的共同选择。',
          quote: '断网可用不是怀旧，而是一种对注意力和数据主权的重新主张。',
          body: [
            '从笔记到日历，越来越多应用把数据默认保存在设备上，再通过增量同步连接多端。断网可用、低延迟和隐私，是它们最常被提到的理由。',
            '挑战同样存在：冲突合并、权限与跨平台存储。真正成熟的本地优先产品，需要把复杂性藏进可靠的工程细节里。'
          ]
        },
        {
          id: 'dev-5',
          title: '从零实现一个向量数据库：踩坑记录',
          tag: 'AI · 工程',
          read: 7,
          summary: '从索引结构到召回策略，一篇工程笔记还原了向量数据库最核心的几道选择。',
          body: [
            '作者从最小可运行版本出发，逐步比较不同距离度量、分段索引与压缩方案的取舍，并给出压测数据。',
            '文章最值得读的部分不是结论，而是失败记录：哪些优化让查询更慢，哪些参数在小数据集上完全没有意义。'
          ]
        },
        {
          id: 'dev-6',
          title: '一份给前端工程师的 CSS 新特性清单',
          tag: '前端 · CSS',
          read: 4,
          summary: '容器查询、锚点定位与新颜色空间，正在改变我们组织样式的方式。',
          body: [
            '清单按浏览器支持度与实用场景梳理了近期值得关注的前端能力，并为每项特性附上最小示例。',
            '对于生产项目，渐进增强仍然是更稳妥的策略。先理解问题，再决定是否引入新的语法糖。'
          ]
        }
      ]
    }
  ];

  const allArticles = columns.flatMap((column) =>
    column.items.map((item) => ({ ...item, columnId: column.id, columnTitle: column.title, columnIcon: column.icon }))
  );

  const channels = {
    '新闻': {
      group: '资讯阅读',
      icon: 'newspaper',
      kind: 'newsdesk',
      intro: '把不同平台正在讨论的事，收进同一张桌面。不是替你做判断，而是让重要的声音更容易被看见。',
      items: []
    },
    '新闻导航': {
      group: '资讯阅读',
      icon: 'compass',
      intro: '把散落在世界各地的消息，收进一张安静、清楚的地图。这里每天为你整理值得先读的新闻，也保留那些需要慢一点理解的变化。',
      items: [
        { title: '今日要闻：10 条值得先读的更新', meta: '编辑精选 · 刚刚', badge: 'NEW' },
        { title: '跨区域出行数据里的生活半径', meta: '国内 · 3 分钟阅读' },
        { title: '城市公共空间正在发生的五个小变化', meta: '城市 · 5 分钟阅读' },
        { title: '一份不焦虑的新闻阅读指南', meta: '方法 · 4 分钟阅读' }
      ]
    },
    '精选': {
      group: '资讯阅读',
      icon: 'diamond',
      kind: 'aihot',
      tone: 'aihot',
      intro: '来自 AIHOT 的 AI 行业精选摘要。把散落在不同来源里的发布、观点与产品变化，收成一份每天都能快速读完的清单。',
      items: []
    },
    '趣闻爆料': {
      group: '资讯阅读',
      icon: 'leaf',
      intro: '不那么紧急，但值得会心一笑的事。关于树荫、街角、旧物和那些被日常藏起来的微小发现。',
      items: [
        { title: '一条街的树荫，如何改变夏天的温度', meta: '城市观察 · 4 分钟阅读', badge: '编辑推荐' },
        { title: '为什么旧书店总有一种相似的气味', meta: '生活 · 3 分钟阅读' },
        { title: '在便利店门口坐十分钟的人', meta: '人间 · 5 分钟阅读' },
        { title: '本周被忽略的 6 条可爱新闻', meta: '轻阅读 · 刚刚' }
      ]
    },
    '模型榜单': {
      group: 'AI 观察',
      icon: 'list',
      intro: '不只看跑分，也看真实使用中的稳定性、成本与边界。榜单每周更新，记录模型能力的一次次小幅移动。',
      items: [
        { title: 'Gemini 3.0 Pro', meta: '综合能力 92.4 · 上下文 1M', badge: '↑ 1' },
        { title: 'Claude Opus 4.5', meta: '长文与代码 91.8 · 稳定', badge: 'NEW' },
        { title: 'GPT-5.1', meta: '工具调用 90.6 · 生态成熟' },
        { title: 'DeepSeek V4', meta: '性价比 93.1 · 中文强项', badge: '↑ 2' },
        { title: 'Qwen 3.5 Max', meta: '开源生态 89.7 · 多模态' }
      ]
    },
    'Agent 工具榜': {
      group: 'AI 观察',
      icon: 'bot',
      intro: '真正能进入工作流的 Agent，往往不是最会演示的那一个。我们更在意它是否可追溯、可干预，以及出错时能不能停下来。',
      items: [
        { title: 'Cursor', meta: '代码协作 · 编辑器原生', badge: '常用' },
        { title: 'Claude Code', meta: '终端工作流 · 长任务' },
        { title: 'Dify', meta: '工作流编排 · 私有部署' },
        { title: 'Manus', meta: '通用任务 · 多步骤执行' },
        { title: 'n8n', meta: '自动化连接 · 开源' }
      ]
    },
    'Skill 榜单': {
      group: 'AI 观察',
      icon: 'star',
      intro: '把复杂工作拆成可复用的能力模块。这里收录团队最近高频使用的 Skill，以及它们在真实项目里的表现。',
      items: [
        { title: '深度研究', meta: '检索 · 交叉验证 · 引用整理', badge: '本周最常用' },
        { title: '代码审查', meta: '风险定位 · 变更摘要 · 测试建议' },
        { title: '会议纪要', meta: '决策提取 · 待办跟进 · 多语言' },
        { title: '长文写作', meta: '结构规划 · 事实核对 · 风格统一' },
        { title: '数据洞察', meta: '表格分析 · 异常发现 · 图表建议' }
      ]
    },
    '漫画制作': {
      group: 'AI 工具',
      icon: 'comic',
      intro: '从一句灵感出发，把它变成有角色、有分镜、有情绪的画面。工具负责加快速度，故事仍然由你决定。',
      items: [
        { title: '把一句灵感变成四格漫画', meta: '创作指南 · 6 分钟阅读', badge: '入门' },
        { title: '角色一致性：让主角每一格都像同一个人', meta: '制作技巧 · 8 分钟阅读' },
        { title: '分镜脚本模板：起承转合的四个画面', meta: '模板 · 可直接套用' },
        { title: '本周风格灵感：木刻版画与水彩', meta: '风格参考 · 5 分钟阅读' },
        { title: '给漫画加一点留白，故事会更有呼吸', meta: '编辑笔记 · 3 分钟阅读' }
      ]
    },
    '视频制作': {
      group: 'AI 工具',
      icon: 'film',
      intro: '把零散的画面、音乐和想法剪成一段完整叙事。从分镜到导出，这里整理更轻量的制作方法。',
      items: [
        { title: '一条 30 秒短视频的完整制作流程', meta: '制作指南 · 8 分钟阅读', badge: '推荐' },
        { title: '用文字生成分镜，再把画面交给 AI', meta: '工作流 · 6 分钟阅读' },
        { title: '让转场更自然的三个小技巧', meta: '剪辑技巧 · 4 分钟阅读' },
        { title: '视频配乐怎么选：情绪比节奏更重要', meta: '声音设计 · 5 分钟阅读' },
        { title: '导出前的五分钟检查清单', meta: '发布准备 · 3 分钟阅读' }
      ]
    },
    '歌曲制作': {
      group: 'AI 工具',
      icon: 'music',
      intro: '从一段旋律、一句歌词开始，试着把脑子里的声音做出来。不必一次完美，先让它被听见。',
      items: [
        { title: '从一段旋律开始：AI 编曲入门', meta: '入门指南 · 7 分钟阅读', badge: '新手' },
        { title: '写歌词时，先找到一句想说的话', meta: '创作方法 · 5 分钟阅读' },
        { title: '用 AI 生成人声，需要注意什么', meta: '制作技巧 · 6 分钟阅读' },
        { title: '本周歌单：适合夜晚的轻电子', meta: '灵感歌单 · 12 首' },
        { title: '给一段 demo 留出呼吸的空间', meta: '编曲笔记 · 4 分钟阅读' }
      ]
    },
    '今天吃什么': {
      group: '生活工具',
      icon: 'utensils',
      intro: '不替你做决定，只提供几个具体、可执行、不会太麻烦的选项。',
      items: [
        { title: '番茄牛腩饭', meta: '30 分钟 · 一锅到底', badge: '今日首选' },
        { title: '菌菇鸡汤面', meta: '25 分钟 · 暖胃' },
        { title: '烤南瓜藜麦沙拉', meta: '20 分钟 · 清爽' },
        { title: '冰箱剩菜炒饭', meta: '15 分钟 · 零浪费' }
      ]
    },
    '价格参考': {
      group: '生活工具',
      icon: 'tag',
      intro: '给消费决定一个更平静的参照系。价格会变，需求也会变，先想清楚要解决什么问题。',
      items: [
        { title: '14 英寸轻薄本', meta: '主流配置 ¥5,499 起', badge: '降价' },
        { title: '降噪头戴耳机', meta: '主流区间 ¥1,299–1,999' },
        { title: '家用投影仪', meta: '入门 ¥2,499 起' },
        { title: '机械键盘', meta: '主流区间 ¥399–899' }
      ]
    },
    '金价': {
      group: '理财',
      icon: 'coin',
      kind: 'market',
      intro: '把金价的短期波动放回更长的周期里看。这里记录上海金、国际现货与足金饰品的参考报价，也保留影响价格的那些细小变量。',
      quotes: [
        { label: '上海金 Au99.99', value: '968.40', unit: '元/克', change: '+0.62%', trend: 'up', note: '较上一交易日' },
        { label: '国际现货黄金', value: '4,282.60', unit: '美元/盎司', change: '+0.34%', trend: 'up', note: '伦敦金参考' },
        { label: '足金饰品挂牌', value: '1,058', unit: '元/克', change: '持平', trend: 'flat', note: '部分品牌参考' }
      ],
      chart: {
        title: '上海金 · 近 30 日',
        period: '10月05日 — 11月03日',
        startLabel: '10月05日',
        endLabel: '11月03日',
        unit: '元/克',
        high: '973.20',
        low: '951.80',
        values: [951.8, 954.2, 952.6, 957.4, 960.1, 958.3, 962.7, 965.1, 963.4, 967.8, 971.2, 969.4, 973.2, 970.6, 968.9, 966.2, 969.8, 972.4, 970.1, 967.5, 964.8, 966.9, 965.4, 967.7, 970.2, 968.1, 971.5, 969.3, 966.8, 968.4]
      },
      items: [
        { title: '金价高位震荡，避险需求仍在', meta: '市场观察 · 6 分钟阅读', badge: '今日' },
        { title: '上海金与国际金价的价差，意味着什么', meta: '基础知识 · 5 分钟阅读' },
        { title: '买金饰前，先分清「克价」和「工费」', meta: '消费指南 · 7 分钟阅读' },
        { title: '本周关注：美元指数与美债收益率', meta: '宏观日历 · 3 分钟阅读' }
      ]
    },
    '油价': {
      group: '理财',
      icon: 'fuel',
      kind: 'market',
      variant: 'oil',
      intro: '每一次调价，都会落到通勤、物流与周末出行的具体成本里。这里整理全国参考油价、调价窗口和值得留意的市场变化。',
      quotes: [
        { label: '92 号汽油', value: '7.21', unit: '元/升', change: '+0.08', trend: 'up', note: '全国均价参考' },
        { label: '95 号汽油', value: '7.73', unit: '元/升', change: '+0.09', trend: 'up', note: '全国均价参考' },
        { label: '0 号柴油', value: '6.88', unit: '元/升', change: '持平', trend: 'flat', note: '全国均价参考' }
      ],
      chart: {
        title: '92 号汽油 · 近 8 轮调价',
        period: '2026年 第 21—28 轮',
        startLabel: '第 21 轮',
        endLabel: '第 28 轮',
        unit: '元/升',
        high: '7.24',
        low: '7.05',
        values: [7.05, 7.12, 7.12, 7.19, 7.16, 7.24, 7.13, 7.21]
      },
      items: [
        { title: '下一轮成品油调价窗口：11 月 14 日 24 时', meta: '调价日历 · 还有 11 天', badge: '提醒' },
        { title: '国际油价小幅回落，布伦特原油震荡整理', meta: '市场观察 · 4 分钟阅读' },
        { title: '一箱油的钱，怎么算更清楚', meta: '用车指南 · 5 分钟阅读' },
        { title: '油价调整机制里的「十个工作日」', meta: '基础知识 · 6 分钟阅读' }
      ]
    },
    '乐乐大事记': {
      group: '育儿',
      icon: 'flag',
      intro: '把成长里那些小小的第一次认真记下来。不是为了比较，只是想在很久以后，还能想起当时的惊喜。',
      items: [
        { title: '第一次自己站稳，是在客厅的地毯上', meta: '10 月 26 日 · 10 个月 12 天', badge: '新记录' },
        { title: '会叫「妈妈」了，声音软软的', meta: '10 月 18 日 · 第一次开口' },
        { title: '第一次自己拿起小勺子', meta: '10 月 09 日 · 吃饭进行时' },
        { title: '周末去了第一次动物园', meta: '09 月 27 日 · 看见长颈鹿' },
        { title: '第一颗小牙冒出来了', meta: '09 月 12 日 · 下中切牙' }
      ]
    },
    '宝宝喂养': {
      group: '育儿',
      icon: 'bottle',
      intro: '记录奶量、辅食和作息的小变化。每个宝宝都有自己的节奏，不急着和别人一样。',
      items: [
        { title: '今日喂养：奶量约 720ml，辅食两餐', meta: '今天 · 08:00 / 12:30 / 18:00', badge: '记录' },
        { title: '10 个月辅食：从泥糊过渡到小颗粒', meta: '喂养指南 · 5 分钟阅读' },
        { title: '让宝宝爱上蔬菜的四个小方法', meta: '辅食灵感 · 4 分钟阅读' },
        { title: '夜奶减少后，如何安排睡前最后一餐', meta: '作息 · 3 分钟阅读' },
        { title: '一周辅食备菜清单', meta: '周末准备 · 10 分钟阅读' }
      ]
    },
    '早教': {
      group: '育儿',
      icon: 'blocks',
      intro: '不追求提前学会什么，只把游戏、阅读和陪伴放进每天的日常。成长会在不经意间发生。',
      items: [
        { title: '本周亲子游戏：把积木放进小篮子', meta: '精细动作 · 10 分钟', badge: '本周' },
        { title: '10 个月宝宝的绘本清单：翻翻书与触摸书', meta: '亲子阅读 · 5 分钟阅读' },
        { title: '在客厅搭一个安全的爬行小路线', meta: '大运动 · 15 分钟' },
        { title: '每天十分钟的儿歌时间，怎么玩更有趣', meta: '语言启蒙 · 4 分钟阅读' },
        { title: '不要急着纠正：让宝宝自己试一试', meta: '陪伴笔记 · 3 分钟阅读' }
      ]
    },
    '英语学习': {
      group: '学习板块',
      icon: 'book',
      intro: '用一小段真实的英文，换一个看世界的角度。每天十分钟，不求速成。',
      items: [
        { title: 'The Quiet Power of a Daily Walk', meta: 'B2 · 精读 · 8 分钟' },
        { title: 'Why We Remember Places, Not Days', meta: 'B1 · 泛读 · 6 分钟' },
        { title: 'A Short History of the Paper Map', meta: 'B2 · 听力 · 5 分钟' },
        { title: '今日表达：take something in stride', meta: '实用短语 · 2 分钟', badge: 'NEW' }
      ]
    },
    '背单词': {
      group: '学习板块',
      icon: 'pen',
      intro: '把单词放回句子和场景里，而不是只留在列表里。今天先记住三个就很好。',
      items: [
        { title: 'serendipity', meta: '意外发现珍奇事物的能力' },
        { title: 'wander', meta: '漫步；走神；思绪游移' },
        { title: 'stillness', meta: '寂静；静止的状态' },
        { title: 'attentive', meta: '专注的；体贴的' }
      ]
    },
    '技术周刊': {
      group: '学习板块',
      icon: 'newspaper',
      intro: '一周一次，把真正值得留下的技术阅读整理成册。少一点信息噪音，多一点自己的笔记。',
      items: [
        { title: 'Issue 042 · 本地优先', meta: '本周 · 7 篇文章', badge: '最新' },
        { title: 'Issue 041 · 小模型的实用主义', meta: '上周 · 6 篇文章' },
        { title: 'Issue 040 · 把浏览器当操作系统', meta: '10 月 20 日 · 8 篇文章' },
        { title: 'Issue 039 · 可维护的 CSS', meta: '10 月 13 日 · 5 篇文章' }
      ]
    },
    '优秀知识库': {
      group: '学习板块',
      icon: 'archive',
      intro: '那些被反复打开、确实解决问题的笔记。没有速成，只有可复用的思考路径。',
      items: [
        { title: '如何做一份能读的周报', meta: '写作 · 6 分钟' },
        { title: '给独立开发者的上线检查表', meta: '产品 · 9 分钟' },
        { title: '用「问题」而不是「主题」做笔记', meta: '方法 · 5 分钟' },
        { title: '从 0 到 1 搭建个人阅读系统', meta: '效率 · 12 分钟' }
      ]
    }
  };

  const topics = [
    { title: '人工智能', meta: 'AI · 42 篇', channel: '模型榜单', icon: 'sparkles' },
    { title: '城市生活', meta: 'CITY · 28 篇', channel: '趣闻爆料', icon: 'leaf' },
    { title: '独立开发', meta: 'MAKER · 19 篇', channel: 'Agent 工具榜', icon: 'bot' },
    { title: '设计灵感', meta: 'DESIGN · 31 篇', channel: '优秀知识库', icon: 'star' },
    { title: '全球科技', meta: 'GLOBAL · 36 篇', channel: '新闻导航', icon: 'compass' },
    { title: '阅读清单', meta: 'READING · 12 篇', channel: '技术周刊', icon: 'newspaper' }
  ];

  const newsDeskCategories = {
    '综合': {
      label: '综合',
      count: 490,
      baseHeat: 8420000,
      step: 780000,
      palette: ['#3d74d9', '#df6658', '#46a373', '#59656d'],
      sources: [
        { name: '知乎', mark: '知', type: '热榜', items: ['你有哪些坚持了很久的小习惯？', '年轻人开始重新整理自己的书架', '一个人旅行时，怎样安排一天最舒服', '那些看似无用却让人快乐的技能', '如何把周末过得像一次小长假', '如何看待「附近」正在重新变得重要', '你最近一次感到被理解是什么时候', '三十岁之后，哪些事情变得没那么重要', '有哪些适合一个人做的长期爱好', '为什么越来越多人开始记录天气'] },
        { name: '微博', mark: '博', type: '热搜榜', items: ['城市里的秋日限定颜色', '这届年轻人开始流行早睡打卡', '一张图记录普通人的通勤路', '你会为一家小店专门去一座城吗', '今天最想分享的一件小事', '秋天第一杯热饮', '下班后的城市公共空间', '你最近在循环哪首歌', '有哪些小城市值得慢慢逛', '今天也为自己做一件小事'] },
        { name: '微信', mark: '信', type: '24h 热文榜', items: ['把日子过慢一点，从一顿早餐开始', '独处不是孤独，而是一种能力', '那些在深夜仍亮着灯的店铺', '我们为什么越来越需要散步', '写给秋天的一封短信', '那些离开大厂的人，后来怎么样了', '如何在家里留出一个阅读角落', '城市里的旧物修复师', '一份给年轻人的厨房入门清单', '我们为什么喜欢看别人整理房间'] },
        { name: '澎湃', mark: '澎', type: '热榜', items: ['城市更新中的老街区，如何留住烟火气', '公共图书馆的夜间实验', '社区食堂里的代际相遇', '一条河流的十年变化', '当年轻人开始关心菜市场', '老厂房改造之后，谁在使用这些空间', '一条街道的无障碍改造观察', '社区花园里的公共生活', '菜市场里的城市记忆', '那些被重新打开的河边步道'] }
      ]
    },
    '科技': {
      label: '科技',
      count: 326,
      baseHeat: 5120000,
      step: 490000,
      palette: ['#4a64c7', '#d25c47', '#c89a2b', '#4c7e9c'],
      sources: [
        { name: '36氪', mark: '氪', type: '热门', items: ['AI 硬件创业公司重新定义随身设备', '国产大模型在垂直行业加速落地', '智能眼镜的下一站：全天候佩戴', '新能源车企竞速补能网络', '一家小公司如何做出长红产品'] },
        { name: 'IT之家', mark: 'IT', type: '热榜', items: ['新一代 Wi-Fi 标准进入规模商用阶段', '轻薄本迎来 OLED 普及年', '折叠屏手机的折痕正在消失', '国产芯片产业链的新进展', '桌面系统更新带来多端协同'] },
        { name: '少数派', mark: '少', type: '热门', items: ['一套更轻量的数字笔记系统', '用自动化工具整理每日信息', '手机摄影的减法练习', '我的桌面为什么只剩下一台设备', '如何设计一个真正好用的日历'] },
        { name: '爱范儿', mark: '范', type: '热门', items: ['当机器开始理解人的情绪', '城市骑行装备的新选择', '智能家居进入无感时代', '一款产品如何照顾到少数人', '设计不只是好看'] }
      ]
    },
    '娱乐': {
      label: '娱乐',
      count: 214,
      baseHeat: 3860000,
      step: 410000,
      palette: ['#d15c7b', '#5a8d63', '#c8873f', '#3f4652'],
      sources: [
        { name: '微博文娱', mark: '娱', type: '文娱榜', items: ['本周值得进电影院的三部电影', '一场演唱会背后的城市夜晚', '年轻演员的慢热时刻', '老剧重映为何仍能打动观众', '音乐节之外的现场'] },
        { name: '豆瓣', mark: '豆', type: '热门', items: ['一部被低估的小成本电影', '最近读过的最温柔的一本书', '当我们在看展时在看什么', '那些适合秋天重看的电影', '一个人的深夜歌单'] },
        { name: '猫眼', mark: '猫', type: '票房榜', items: ['周末档新片口碑观察', '动画电影为何频频出圈', '影院里的银发观众变多了', '电影修复让经典重新发光', '小剧场正在成为城市新地标'] },
        { name: '抖音', mark: '抖', type: '热点榜', items: ['非遗手艺人的短视频日常', '一段舞蹈带火一座小城', '五分钟看懂一部经典电影', '普通人的舞台也在发光', '旅行博主的镜头之外'] }
      ]
    },
    '社区': {
      label: '社区',
      count: 178,
      baseHeat: 2780000,
      step: 330000,
      palette: ['#3d74d9', '#5b8b66', '#c28e3e', '#c0635b'],
      sources: [
        { name: '知乎', mark: '知', type: '热榜', items: ['如何建立一个不焦虑的信息系统', '为什么很多人开始重新使用纸笔', '怎样在忙碌中保留一点空白', '一个人住，如何让家变得温暖', '如何培养长期阅读的习惯'] },
        { name: '豆瓣小组', mark: '组', type: '热门', items: ['今天也在认真生活', '在菜市场发现的小确幸', '那些坚持了很多年的小爱好', '深夜食堂式的一次聚会', '整理房间也是整理心情'] },
        { name: 'V2EX', mark: 'V', type: '热门', items: ['独立开发者的第 100 天', '如何给自己做一次技术复盘', '小团队远程协作的真实体验', '一台旧电脑还能做什么', '从零开始搭建个人博客'] },
        { name: '小红书', mark: '书', type: '热点', items: ['秋天的第一条散步路线', '一周早餐不重样', '租房也能拥有的氛围感角落', '城市里的免费快乐', '普通人的周末仪式感'] }
      ]
    },
    '购物': {
      label: '购物',
      count: 156,
      baseHeat: 2450000,
      step: 290000,
      palette: ['#d05a56', '#c54a43', '#e0913f', '#9c5a72'],
      sources: [
        { name: '什么值得买', mark: '值', type: '精选', items: ['入秋后最值得换新的三件小家电', '一款适合通勤的轻量双肩包', '桌面收纳的五个低成本方案', '换季衣物收纳清单', '给父母的实用礼物清单'] },
        { name: '京东', mark: '京', type: '热卖', items: ['家用净水器的选购要点', '开学季笔记本怎么挑', '扫地机器人避坑指南', '一张表看懂家电能效等级', '厨房小电器的使用频率'] },
        { name: '淘宝', mark: '淘', type: '热销', items: ['手作店铺里的秋天', '一块地毯改变房间氛围', '小众香薰的真实体验', '如何挑一只耐用的通勤杯', '桌面绿植入门'] },
        { name: '天猫', mark: '天', type: '榜单', items: ['本周家居好物榜', '换季床品的材质选择', '咖啡器具入门清单', '小户型收纳的五个思路', '智能门锁的选购笔记'] }
      ]
    },
    '财经': {
      label: '财经',
      count: 205,
      baseHeat: 4630000,
      step: 460000,
      palette: ['#38694f', '#9a6b3b', '#55708f', '#b05a4d'],
      sources: [
        { name: '财新', mark: '财', type: '热门', items: ['制造业投资的新信号', '消费市场正在发生的结构性变化', '城市更新如何平衡保护与发展', '中小企业融资渠道的新探索', '绿色金融的下一程'] },
        { name: '华尔街见闻', mark: '见', type: '热文', items: ['全球市场等待新一轮数据指引', '黄金价格为何维持高位震荡', '原油市场的供需博弈', '美元指数与风险资产的联动', '投资者重新关注现金流'] },
        { name: '雪球', mark: '雪', type: '热帖', items: ['一位长期投资者的年度复盘', '如何理解一家公司的护城河', '市场波动中的仓位管理', '普通人如何建立自己的投资框架', '分红与成长，如何取舍'] },
        { name: '第一财经', mark: '一', type: '热榜', items: ['新能源产业链的出海机会', '消费品牌如何穿越周期', '数字经济与实体经济的交汇', '区域经济的新增长极', '年轻人的理财方式正在改变'] }
      ]
    },
    '开发': {
      label: '开发',
      count: 142,
      baseHeat: 2280000,
      step: 270000,
      palette: ['#3b4a55', '#d06b48', '#3e7f9e', '#7a5ea7'],
      sources: [
        { name: 'GitHub', mark: 'G', type: 'Trending', items: ['本周值得关注的十个开源项目', '一个轻量级数据库的新版本', '开发者工具正在变得更安静', '用一行命令部署你的第一个应用', '开源项目的维护者困境'] },
        { name: 'Hacker News', mark: 'H', type: 'Top', items: ['为什么我把 side project 的后端换回了 SQLite', '浏览器里的本地优先应用正在回归', '一份给前端工程师的 CSS 新特性清单', '从零实现一个向量数据库', '独立开发者的慢发布实验'] },
        { name: '掘金', mark: '掘', type: '热榜', items: ['Rust 在小工具里的实际体验', '前端性能优化的十个细节', '如何设计一套好用的组件库', 'Node.js 服务的可观测性实践', '从 0 到 1 搭建内部工具'] },
        { name: 'InfoQ', mark: 'I', type: '热门', items: ['架构演进中的取舍', 'AI 工程化落地的关键问题', '微服务之后，我们如何组织系统', '团队如何做有效的技术评审', '数据治理从哪一步开始'] }
      ]
    },
    '简报': {
      label: '简报',
      count: 96,
      baseHeat: 1840000,
      step: 210000,
      palette: ['#456b56', '#9b7345', '#4e7891', '#7d637f'],
      sources: [
        { name: '今日简报', mark: '简', type: 'Daily', items: ['今日值得关注的五件小事', '一条新闻的三种读法', '周末城市活动清单', '本周天气与出行提示', '今天适合做的一件小事'] },
        { name: '财经早餐', mark: '早', type: '财经', items: ['开盘前需要知道的三个数字', '本周财经日历', '一份小白也能读懂的季报', '消费数据里的生活变化', '汇率波动与普通人'] },
        { name: '科技早报', mark: '科', type: '科技', items: ['今日科技圈的三条更新', '一款新硬件的真实体验', 'AI 工具清单：本周新增', '开源社区今日动态', '科技产品背后的设计取舍'] },
        { name: '城市观察', mark: '城', type: '城市', items: ['城市更新中的一条街', '公共交通的最后一公里', '公园里的新公共生活', '老菜场的改造实验', '夜间经济与城市温度'] }
      ]
    },
    'AI': {
      label: 'AI',
      count: 268,
      baseHeat: 3340000,
      step: 360000,
      palette: ['#4d6fa8', '#5f8b7f', '#b76e5f', '#735f9e'],
      sources: [
        { name: '机器之心', mark: '机', type: '热门', items: ['多模态模型开始进入日常工具', '小模型的实用主义正在回归', 'AI Agent 如何真正进入工作流', '开源模型社区的下一阶段', '评测榜单之外，我们该看什么'] },
        { name: '量子位', mark: '量', type: '热门', items: ['智能眼镜里的 AI 助手', '机器人开始学会整理桌面', 'AI 编程工具的真实使用体验', '一张图看懂本周模型更新', '语音交互的下一站'] },
        { name: 'Hugging Face', mark: 'H', type: 'Trending', items: ['本周最受欢迎的开源模型', '一个小型视觉模型的应用实验', '数据集质量为什么比规模更重要', '开发者如何选择适合自己的模型', '开源社区的新协作方式'] },
        { name: 'Papers with Code', mark: 'P', type: 'Trending', items: ['让模型更懂长文档的新方法', '多智能体协作的边界', '一篇论文如何被真正复现', '推理效率的下一步', '从研究到产品的距离'] }
      ]
    }
  };

  const newsDeskCategoryOrder = ['综合', '科技', '娱乐', '社区', '购物', '财经', '开发', '简报', 'AI'];

  const state = {
    readIds: new Set(),
    toastTimer: null,
    searchFocus: -1,
    lastArticle: null,
    tabs: [
      {
        id: 'home',
        name: '全部资讯',
        channel: '新闻导航',
        icon: 'compass',
        closable: false,
        scrollY: 0
      }
    ],
    activeTabId: 'home',
    nextTabId: 1,
    aihot: {
      data: window.AIHOT_FEATURED && Array.isArray(window.AIHOT_FEATURED.items) ? window.AIHOT_FEATURED : null
    },
    newsDesk: {
      category: '综合',
      sort: 'hot'
    },
    calendar: {
      viewYear: 0,
      viewMonth: 0,
      selectedKey: '',
      initialized: false
    }
  };

  /* --------------------------------------------------------
     DOM references
     -------------------------------------------------------- */

  const newsGrid = $('#news-grid');
  const lastUpdated = $('#last-updated');
  const newsStatus = $('#news-status');
  const searchWrap = $('.search-wrap');
  const searchInput = $('#search-input');
  const searchClear = $('#search-clear');
  const searchPanel = $('#search-panel');
  const searchResults = $('#search-results');
  const articleDialog = $('#article-dialog');
  const calendarDialog = $('#calendar-dialog');
  const reader = $('.reader');
  const toast = $('#toast');
  const sidebar = $('#sidebar');
  const sidebarScrim = $('.sidebar-scrim');
  const menuToggle = $('.menu-toggle');
  const sidebarClose = $('.sidebar-close');
  const tabTrack = $('#tab-track');
  const tabCount = $('#tab-count');
  const dashboardView = $('#dashboard-view');
  const channelView = $('#channel-view');
  const breadcrumbHome = $('#breadcrumb-home');
  const breadcrumbCurrent = $('.breadcrumb__current');
  const mobileQuery = window.matchMedia('(max-width: 1120px)');

  /* --------------------------------------------------------
     Small helpers
     -------------------------------------------------------- */

  function showToast(message) {
    if (!toast) return;
    window.clearTimeout(state.toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    state.toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 3000);
  }

  function openDialog(dialog) {
    if (!dialog || dialog.open) return;
    closeSearch();
    closeWeather();
    if (document.body.classList.contains('nav-open')) closeMobileNav(false);
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    document.body.classList.add('has-dialog');
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
      syncDialogState();
    }
  }

  function syncDialogState() {
    const hasOpen = Boolean(document.querySelector('dialog[open]'));
    document.body.classList.toggle('has-dialog', hasOpen);
  }

  function updateTimestamp() {
    if (!lastUpdated) return;
    const now = new Date();
    lastUpdated.textContent = `更新于${formatDateLong(now)} ${formatClock(now)} 北京时间`;
  }

  function setActiveNav(name) {
    $$('.nav-link, .nav-solo').forEach((link) => {
      const active = link.dataset.channel === name;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function setBreadcrumb(name) {
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = name;
  }

  function jumpToScrollPosition(top) {
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo({ top: Math.max(0, top), left: 0 });
    root.style.scrollBehavior = previousBehavior;
  }

  /* --------------------------------------------------------
     News rendering
     -------------------------------------------------------- */

  function getVisibleItems(column) {
    const count = Math.min(5, column.items.length);
    return Array.from({ length: count }, (_, index) => column.items[(column.offset + index) % column.items.length]);
  }

  function articleButton(item, index) {
    const readClass = state.readIds.has(item.id) ? ' is-read' : '';
    return `
      <li class="news-item">
        <button class="news-item__button${readClass}" type="button" data-article-id="${escapeHTML(item.id)}">
          <span class="news-index">${String(index + 1).padStart(2, '0')}</span>
          <span class="news-item__copy">
            <span class="news-title">${escapeHTML(item.title)}</span>
            <span class="news-tag">${escapeHTML(item.tag)}</span>
          </span>
        </button>
      </li>`;
  }

  function newsCard(column, index) {
    const visible = getVisibleItems(column);
    return `
      <article class="news-card news-card--${column.accent}" data-column="${column.id}" style="--delay:${(index * .075 + .08).toFixed(2)}s">
        <header class="news-card__head">
          <div class="news-card__heading">
            <span class="news-card__icon" aria-hidden="true">${icon(column.icon)}</span>
            <div>
              <h3 class="news-card__title">${escapeHTML(column.title)}</h3>
              <p class="news-card__subtitle">${escapeHTML(column.subtitle)}</p>
            </div>
          </div>
          <button class="refresh-button" type="button" data-refresh="${column.id}" aria-label="换一批${escapeHTML(column.title)}">
            换一批
            ${icon('refresh')}
          </button>
        </header>
        <ul class="news-list">
          ${visible.map((item, itemIndex) => articleButton(item, itemIndex)).join('')}
        </ul>
      </article>`;
  }

  function renderNews() {
    if (!newsGrid) return;
    newsGrid.innerHTML = columns.map((column, index) => newsCard(column, index)).join('');
  }

  function refreshColumn(columnId, button) {
    const column = columns.find((entry) => entry.id === columnId);
    if (!column) return;
    const card = button.closest('.news-card');
    const list = card?.querySelector('.news-list');
    button.classList.add('is-spinning');
    card?.classList.add('is-refreshing');

    window.setTimeout(() => {
      column.offset = (column.offset + 5) % column.items.length;
      if (list) list.innerHTML = getVisibleItems(column).map((item, index) => articleButton(item, index)).join('');
      card?.classList.remove('is-refreshing');
      updateTimestamp();
      if (newsStatus) newsStatus.textContent = `${column.title}已换一批，显示 ${getVisibleItems(column).length} 条更新。`;
      window.setTimeout(() => button.classList.remove('is-spinning'), 380);
    }, 180);
  }

  /* --------------------------------------------------------
     Article reader
     -------------------------------------------------------- */

  function openArticle(articleId) {
    const article = allArticles.find((entry) => entry.id === articleId);
    if (!article) return;

    state.readIds.add(article.id);
    state.lastArticle = article;
    $$('.news-item__button').forEach((button) => {
      if (button.dataset.articleId === article.id) button.classList.add('is-read');
    });

    const now = new Date();
    const kicker = $('#reader-kicker');
    const title = $('#reader-title');
    const meta = $('#reader-meta');
    const body = $('#reader-body');

    if (kicker) kicker.textContent = `${article.columnTitle} / ${article.tag}`;
    if (title) title.textContent = article.title;
    if (meta) {
      meta.innerHTML = `
        <span>${icon('calendar')}${formatDateLong(now)}</span>
        <i aria-hidden="true"></i>
        <span>${icon('clock')}${article.read || 3} 分钟阅读</span>
        <i aria-hidden="true"></i>
        <span>知闻编辑部</span>`;
    }

    if (body) {
      const paragraphs = article.body.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join('');
      const quote = article.quote
        ? `<blockquote>“${escapeHTML(article.quote)}”</blockquote>`
        : '';
      body.innerHTML = `<p class="reader__lead">${escapeHTML(article.summary)}</p>${quote}${paragraphs}`;
    }

    openDialog(articleDialog);
    if (reader) reader.scrollTop = 0;
  }

  /* --------------------------------------------------------
     Workspace tabs
     -------------------------------------------------------- */

  const channelToneByGroup = {
    '资讯阅读': 'news',
    'AI 观察': 'ai',
    'AI 工具': 'creator',
    '生活工具': 'life',
    '理财': 'finance',
    '育儿': 'parenting',
    '学习板块': 'learn'
  };

  const channelFeatureLabels = {
    '新闻导航': "TODAY'S READ",
    '趣闻爆料': 'A SMALL DISCOVERY',
    '模型榜单': 'TOP OF THE WEEK',
    'Agent 工具榜': 'TOOL OF THE WEEK',
    'Skill 榜单': 'MOST USED SKILL',
    '漫画制作': 'STORYBOARD',
    '视频制作': 'SCENE & CUT',
    '歌曲制作': 'SOUND SKETCH',
    '今天吃什么': "TODAY'S PICK",
    '价格参考': 'VALUE WATCH',
    '金价': 'MARKET WATCH',
    '油价': 'PRICE WATCH',
    '乐乐大事记': 'A SMALL MILESTONE',
    '宝宝喂养': 'FEEDING NOTES',
    '早教': 'PLAY & LEARN',
    '英语学习': 'DAILY READING',
    '背单词': 'WORD OF THE DAY',
    '技术周刊': 'LATEST ISSUE',
    '优秀知识库': "EDITOR'S NOTE"
  };

  const channelNotes = {
    '资讯阅读': '编辑台会把重要但不喧哗的消息留在这里，也保留那些值得多看一眼的细节。',
    'AI 观察': '不追逐每一次刷新，只记录真正改变工作方式与思考方式的变化。',
    'AI 工具': '工具只是起点。真正让作品留下来的，仍然是你想表达的那件事。',
    '生活工具': '好的工具不替你做决定，只让选择更容易一点、具体一点。',
    '理财': '价格会波动，判断需要自己的节奏。这里的数据仅作界面演示，不构成任何投资建议。',
    '育儿': '成长没有统一的时间表。记录当下、照顾好眼前的小事，就是最好的礼物。',
    '学习板块': '每天一点，不求速成，只求真正留下来。'
  };

  function currentTab() {
    return state.tabs.find((tab) => tab.id === state.activeTabId) || state.tabs[0];
  }

  function focusActiveTab() {
    const active = state.tabs.find((tab) => tab.id === state.activeTabId);
    if (!active) return;
    tabTrack?.querySelector(`[data-tab-activate="${active.id}"]`)?.focus({ preventScroll: true });
  }

  function ensureActiveTabVisible() {
    if (!tabTrack) return;
    const activeButton = tabTrack.querySelector('.workspace-tab.is-active');
    if (!activeButton) return;
    const trackRect = tabTrack.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();
    if (buttonRect.left < trackRect.left) {
      tabTrack.scrollBy({ left: buttonRect.left - trackRect.left - 8, behavior: 'auto' });
    } else if (buttonRect.right > trackRect.right) {
      tabTrack.scrollBy({ left: buttonRect.right - trackRect.right + 8, behavior: 'auto' });
    }
  }

  function renderTabs() {
    if (!tabTrack) return;
    const active = currentTab();

    tabTrack.innerHTML = state.tabs.map((tab) => {
      const selected = tab.id === active.id;
      return `
        <div class="workspace-tab${selected ? ' is-active' : ''}" data-tab-id="${tab.id}">
          <button
            class="workspace-tab__main"
            type="button"
            role="tab"
            id="tab-${tab.id}"
            aria-selected="${selected}"
            aria-controls="${tab.id === 'home' ? 'dashboard-view' : 'channel-view'}"
            tabindex="${selected ? '0' : '-1'}"
            data-tab-activate="${tab.id}"
          >
            ${icon(tab.icon, 'workspace-tab__icon')}
            <span class="workspace-tab__label">${escapeHTML(tab.name)}</span>
          </button>
          ${tab.closable ? `
            <button class="workspace-tab__close" type="button" data-tab-close="${tab.id}" aria-label="关闭「${escapeHTML(tab.name)}」页签">
              ${icon('close')}
            </button>` : ''}
        </div>`;
    }).join('');

    if (tabCount) tabCount.textContent = `${state.tabs.length} 个页签`;
    if (channelView && active.id !== 'home') {
      channelView.setAttribute('aria-labelledby', `tab-${active.id}`);
    }

    ensureActiveTabVisible();
  }

  function channelFeatureLabel(name) {
    return channelFeatureLabels[name] || "EDITOR'S PICK";
  }

  function formatNewsHeat(value) {
    if (value >= 100000000) return `${(value / 100000000).toFixed(1)} 亿`;
    if (value >= 10000) return `${Math.round(value / 10000)} 万`;
    return String(value);
  }

  function newsSourceCardMarkup(category, source, sourceIndex) {
    const sort = state.newsDesk.sort;
    const orderedItems = sort === 'latest' ? [...source.items].reverse() : source.items;
    const accent = category.palette[sourceIndex] || category.palette[0];
    const baseHeat = category.baseHeat - sourceIndex * 650000;
    const step = category.step + sourceIndex * 45000;
    const latestTimes = ['刚刚', '4 分钟前', '9 分钟前', '16 分钟前', '28 分钟前', '42 分钟前', '1 小时前', '2 小时前', '3 小时前', '4 小时前'];

    return `
      <article class="news-source-card" data-news-source-card="${escapeHTML(source.name)}" style="--source-accent:${accent}">
        <header class="news-source-card__head">
          <span class="news-source-mark" aria-hidden="true">${escapeHTML(source.mark)}</span>
          <h3>${escapeHTML(source.name)}</h3>
          <span class="news-source-type">${escapeHTML(source.type)}</span>
        </header>
        <ol class="news-source-list">
          ${orderedItems.map((title, index) => {
            const heat = Math.max(98000, baseHeat - index * step);
            const meta = sort === 'latest'
              ? (latestTimes[index] || `${Math.max(1, index * 7)} 分钟前`)
              : `${formatNewsHeat(heat)}`;
            return `
              <li class="news-source-item${index < 3 ? ' is-top' : ''}">
                <span class="news-source-rank">${index + 1}</span>
                <span class="news-source-title">${escapeHTML(title)}</span>
                <span class="news-source-heat">${escapeHTML(meta)}</span>
              </li>`;
          }).join('')}
        </ol>
      </article>`;
  }

  function newsDeskPageMarkup(channel) {
    const category = newsDeskCategories[state.newsDesk.category] || newsDeskCategories['综合'];
    const sort = state.newsDesk.sort;
    const now = new Date();
    const sources = category.sources;

    return `
      <div class="channel-page news-desk-page">
        <header class="news-desk-head">
          <div class="news-desk-head__copy">
            <p class="eyebrow">NEWS DESK / 全站热榜</p>
            <h1>新闻</h1>
            <p class="news-desk-head__intro">${escapeHTML(channel.intro)}</p>
          </div>
          <div class="news-desk-head__meta">
            <span class="news-live"><span class="status-dot"></span>持续更新</span>
            <span>更新于 ${formatClock(now)}</span>
          </div>
        </header>

        <div class="news-categories-shell">
          <div class="news-categories" role="group" aria-label="新闻分类">
            ${newsDeskCategoryOrder.map((name) => `
              <button
                class="news-category${name === category.label ? ' is-active' : ''}"
                type="button"
                data-news-category="${escapeHTML(name)}"
                aria-pressed="${name === category.label}"
              >${escapeHTML(name)}</button>`).join('')}
          </div>
          <div class="news-more">
            <button
              class="news-category news-category--more"
              type="button"
              data-news-more-toggle
              aria-expanded="false"
              aria-controls="news-more-menu"
            >
              更多
              ${icon('chevron', 'news-more__chevron')}
            </button>
            <div class="news-more-menu" id="news-more-menu" hidden>
              <p class="news-more-menu__label">更多站点</p>
              <a href="https://aihot.news/codex-reset" target="_blank" rel="noopener noreferrer">
                <span class="news-more-menu__icon">${icon('refresh')}</span>
                <span class="news-more-menu__copy">
                  <strong>Codex 额度重置</strong>
                  <small>AIHOT · 查看额度与重置时间</small>
                </span>
                ${icon('arrow-up-right', 'news-more-menu__arrow')}
              </a>
              <a href="https://tophub.today/c/news" target="_blank" rel="noopener noreferrer">
                <span class="news-more-menu__icon">${icon('trending')}</span>
                <span class="news-more-menu__copy">
                  <strong>今日热榜</strong>
                  <small>tophub.today · 全站新闻热榜</small>
                </span>
                ${icon('arrow-up-right', 'news-more-menu__arrow')}
              </a>
            </div>
          </div>
        </div>

        <div class="news-subbar">
          <div class="news-source-links" role="group" aria-label="榜单来源">
            <button class="news-source-link news-source-link--primary" type="button" data-news-source="all">热门榜单</button>
            ${sources.map((source) => `<button class="news-source-link" type="button" data-news-source="${escapeHTML(source.name)}">${escapeHTML(source.name)}</button>`).join('')}
          </div>
          <div class="news-sort" role="group" aria-label="排序方式">
            <button class="news-sort__button${sort === 'hot' ? ' is-active' : ''}" type="button" data-news-sort="hot" aria-pressed="${sort === 'hot'}">热门</button>
            <span aria-hidden="true">/</span>
            <button class="news-sort__button${sort === 'latest' ? ' is-active' : ''}" type="button" data-news-sort="latest" aria-pressed="${sort === 'latest'}">最新</button>
          </div>
        </div>

        <div class="news-board-head">
          <p><strong>${escapeHTML(category.label)}</strong><span>${category.count}</span> 个榜单</p>
          <span>数据来自公开榜单 · 界面演示</span>
        </div>

        <div class="news-source-grid">
          ${sources.map((source, index) => newsSourceCardMarkup(category, source, index)).join('')}
        </div>

        <p class="news-desk-disclaimer">榜单条目为界面演示数据，用于展示新闻聚合布局，不代表实时热度或真实排名。</p>
      </div>`;
  }

  function channelBannerMarkup(name, channel, code) {
    const isMarket = channel.kind === 'market';
    const isAihot = channel.kind === 'aihot';
    const meta = isMarket
      ? `<span>${channel.quotes.length} 项报价</span><i aria-hidden="true"></i><span>示例行情 · 每日更新</span>`
      : isAihot
        ? '<span>AIHOT 精选</span><i aria-hidden="true"></i><span>来自 AIHOT · 精选摘要</span>'
        : `<span>${channel.items.length} 条精选</span><i aria-hidden="true"></i><span>每日 09:00 更新</span>`;

    return `
      <header class="channel-banner">
        <div class="channel-banner__copy">
          <p class="eyebrow">${escapeHTML(channel.group)} / CHANNEL ${code}</p>
          <h1>${escapeHTML(name)}</h1>
          <p class="channel-banner__intro">${escapeHTML(channel.intro)}</p>
          <div class="channel-banner__meta">
            <span><span class="status-dot"></span>持续更新</span>
            <i aria-hidden="true"></i>
            ${meta}
          </div>
        </div>
        <div class="channel-banner__visual" aria-hidden="true">
          <span class="channel-orbit"></span>
          <span class="channel-emblem">${icon(channel.icon)}<small>CH / ${code}</small></span>
        </div>
      </header>`;
  }

  function miniSparklineMarkup(values) {
    if (!values || values.length < 2) return '';
    const width = 78;
    const height = 24;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const points = values.map((value, index) => {
      const x = 2 + (index / (values.length - 1)) * (width - 4);
      const y = 2 + (1 - (value - min) / range) * (height - 4);
      return [x.toFixed(1), y.toFixed(1)];
    });
    const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point[0]} ${point[1]}`).join(' ');
    return `
      <svg class="quote-spark" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
        <path d="${line}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      </svg>`;
  }

  function marketChartMarkup(chart, tone, variant) {
    const width = 640;
    const height = 210;
    const padTop = 16;
    const padBottom = 16;
    const min = Math.min(...chart.values);
    const max = Math.max(...chart.values);
    const range = max - min || 1;
    const points = chart.values.map((value, index) => {
      const x = 12 + (index / (chart.values.length - 1)) * (width - 24);
      const y = padTop + (1 - (value - min) / range) * (height - padTop - padBottom);
      return [x.toFixed(2), y.toFixed(2)];
    });
    const line = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point[0]} ${point[1]}`).join(' ');
    const area = `M12 ${height - padBottom} ${points.map((point) => `L${point[0]} ${point[1]}`).join(' ')} L${width - 12} ${height - padBottom} Z`;
    const gradientId = `market-fill-${tone}${variant ? `-${variant}` : ''}`;
    const last = points[points.length - 1];

    return `
      <div class="market-chart__canvas">
        <svg class="market-chart__svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="${escapeHTML(chart.title)}走势图">
          <defs>
            <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="var(--channel-accent)" stop-opacity=".22"/>
              <stop offset="1" stop-color="var(--channel-accent)" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <g class="market-chart__grid">
            <line x1="12" y1="${padTop + (height - padTop - padBottom) * .25}" x2="${width - 12}" y2="${padTop + (height - padTop - padBottom) * .25}"/>
            <line x1="12" y1="${padTop + (height - padTop - padBottom) * .5}" x2="${width - 12}" y2="${padTop + (height - padTop - padBottom) * .5}"/>
            <line x1="12" y1="${padTop + (height - padTop - padBottom) * .75}" x2="${width - 12}" y2="${padTop + (height - padTop - padBottom) * .75}"/>
          </g>
          <path d="${area}" fill="url(#${gradientId})"/>
          <path class="market-chart__line" d="${line}" fill="none" stroke="var(--channel-accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
          <circle class="market-chart__point" cx="${last[0]}" cy="${last[1]}" r="3.2" fill="var(--channel-accent)" stroke="#fffdf7" stroke-width="2"/>
        </svg>
      </div>`;
  }

  function marketPageMarkup(name, channel, banner, tone) {
    const quotes = channel.quotes || [];
    const chart = channel.chart || {};
    const variant = channel.variant || '';
    const pageClass = `channel-page tone-${tone}${variant ? ` tone-${variant}` : ''} is-market`;

    return `
      <div class="${pageClass}">
        ${banner}
        <div class="channel-content">
          <div class="channel-section-head">
            <div>
              <p class="eyebrow">MARKET SNAPSHOT</p>
              <h2>今日行情</h2>
            </div>
            <button class="channel-search-link" type="button" data-channel-search>
              在站内搜索
              ${icon('arrow-up-right')}
            </button>
          </div>

          <div class="quote-grid">
            ${quotes.map((quote) => `
              <article class="quote-card is-${escapeHTML(quote.trend)}">
                <div class="quote-card__head">
                  <span class="quote-card__label">${escapeHTML(quote.label)}</span>
                  <span class="quote-card__change">${quote.trend === 'up' ? '↑' : quote.trend === 'down' ? '↓' : '—'} ${escapeHTML(quote.change)}</span>
                </div>
                <p class="quote-card__value">${escapeHTML(quote.value)}<span>${escapeHTML(quote.unit)}</span></p>
                <div class="quote-card__foot">
                  <span>${escapeHTML(quote.note || '')}</span>
                  ${miniSparklineMarkup(chart.values)}
                </div>
              </article>`).join('')}
          </div>

          <div class="market-layout">
            <article class="market-chart">
              <header class="market-card-head">
                <div>
                  <p class="eyebrow">TREND</p>
                  <h3>${escapeHTML(chart.title || '近期走势')}</h3>
                </div>
                <span class="market-card-head__unit">${escapeHTML(chart.unit || '')}</span>
              </header>
              ${marketChartMarkup(chart, tone, variant)}
              <div class="market-chart__axis">
                <span>${escapeHTML(chart.startLabel || '')}</span>
                <span>${escapeHTML(chart.unit || '')}</span>
                <span>${escapeHTML(chart.endLabel || '')}</span>
              </div>
              <footer class="market-chart__stats">
                <span>最高 <strong>${escapeHTML(chart.high || '—')}</strong></span>
                <span>最低 <strong>${escapeHTML(chart.low || '—')}</strong></span>
                <span>单位 <strong>${escapeHTML(chart.unit || '')}</strong></span>
              </footer>
            </article>

            <aside class="market-feed" aria-label="市场速览">
              <header class="market-feed__head">
                <p class="eyebrow">MARKET NOTES</p>
                <h3>市场速览</h3>
              </header>
              <ol class="market-feed__list">
                ${channel.items.map((item, index) => `
                  <li class="market-feed__item">
                    <span class="market-feed__index">${String(index + 1).padStart(2, '0')}</span>
                    <span class="market-feed__copy">
                      <span class="market-feed__title">${escapeHTML(item.title)}</span>
                      <span class="market-feed__meta">${escapeHTML(item.meta || '')}</span>
                    </span>
                    ${item.badge ? `<span class="channel-feed__badge">${escapeHTML(item.badge)}</span>` : ''}
                  </li>`).join('')}
              </ol>
              <div class="market-feed__foot">
                <span><span class="status-dot"></span>示例行情 · 每日 09:00 更新</span>
                <span>不构成投资建议</span>
              </div>
            </aside>
          </div>
        </div>
      </div>`;
  }

  function safeExternalUrl(value) {
    try {
      const url = new URL(String(value || ''), 'https://aihot.news/');
      if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
    } catch {
      // Fall through to an empty href.
    }
    return '';
  }

  function formatAihotTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const parts = shanghaiParts(date);
    return `${parts.month}/${parts.day} ${parts.hour}:${parts.minute}`;
  }

  function aihotCardMarkup(item) {
    const aiHotUrl = safeExternalUrl(item.aiHotUrl);
    const originalUrl = safeExternalUrl(item.originalUrl);
    const published = formatAihotTime(item.publishedAt);
    return `
      <article class="aihot-card">
        <div class="aihot-card__head">
          <span class="aihot-card__category">${escapeHTML(item.category || 'AI')}</span>
          <time datetime="${escapeHTML(item.publishedAt || '')}">${escapeHTML(published)}</time>
        </div>
        <h3 class="aihot-card__title">
          <a href="${escapeHTML(aiHotUrl || '#')}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.title)}</a>
        </h3>
        <p class="aihot-card__summary">${escapeHTML(item.summary || '')}</p>
        <div class="aihot-card__foot">
          <span class="aihot-card__source">${escapeHTML(item.source || 'AIHOT')}</span>
          <span class="aihot-card__links">
            ${aiHotUrl ? `<a href="${escapeHTML(aiHotUrl)}" target="_blank" rel="noopener noreferrer">AIHOT ${icon('arrow-up-right')}</a>` : ''}
            ${originalUrl ? `<a href="${escapeHTML(originalUrl)}" target="_blank" rel="noopener noreferrer">原文</a>` : ''}
          </span>
        </div>
      </article>`;
  }

  function aihotPageMarkup(name, channel, banner) {
    const data = state.aihot.data;
    const sourceUrl = safeExternalUrl(channel.sourceUrl || data?.sourceUrl || 'https://aihot.news/');
    const body = data && data.items.length
      ? `
        <div class="aihot-meta">
          <span><span class="status-dot"></span>最近同步 ${escapeHTML(formatAihotTime(data.fetchedAt))}</span>
          <span>${data.items.length} 条精选 · 来自 AIHOT</span>
        </div>
        <div class="aihot-grid">
          ${data.items.map(aihotCardMarkup).join('')}
        </div>
        <p class="aihot-disclaimer">摘要由 AIHOT 整理，内容版权归原作者所有。点击标题或 AIHOT 链接可前往站内阅读。</p>`
      : `
        <div class="aihot-empty">
          <svg class="icon"><use href="#i-diamond"/></svg>
          <strong>精选摘要暂时未同步</strong>
          <p>可以先前往 AIHOT 浏览最新内容，稍后再回来看看。</p>
        </div>`;

    return `
      <div class="channel-page tone-aihot">
        ${banner}
        <div class="channel-content">
          <div class="channel-section-head">
            <div>
              <p class="eyebrow">AIHOT CURATION</p>
              <h2>精选摘要</h2>
            </div>
            <a class="channel-search-link" href="${escapeHTML(sourceUrl || 'https://aihot.news/')}" target="_blank" rel="noopener noreferrer">
              打开 AIHOT
              ${icon('arrow-up-right')}
            </a>
          </div>
          ${body}
        </div>
      </div>`;
  }

  function channelPageMarkup(name) {
    const channel = channels[name];
    if (!channel) return `<p class="channel-empty">这个频道正在整理中。</p>`;

    if (channel.kind === 'newsdesk') {
      return newsDeskPageMarkup(channel);
    }

    const group = channel.group;
    const tone = channel.tone || channelToneByGroup[group] || 'news';
    const code = String(Object.keys(channels).indexOf(name) + 1).padStart(2, '0');
    const banner = channelBannerMarkup(name, channel, code);

    if (channel.kind === 'market') {
      return marketPageMarkup(name, channel, banner, tone);
    }

    if (channel.kind === 'aihot') {
      return aihotPageMarkup(name, channel, banner);
    }

    const items = channel.items;
    const feature = items[0] || { title: '内容正在整理中', meta: '每日更新' };
    const feed = items.slice(1);
    const note = channelNotes[group] || '编辑台会持续整理这个频道，留下值得再读一次的内容。';
    const featureBadge = feature.badge
      ? `<span class="channel-feature__badge">${escapeHTML(feature.badge)}</span>`
      : '';

    return `
      <div class="channel-page tone-${tone}">
        ${banner}

        <div class="channel-content">
          <div class="channel-section-head">
            <div>
              <p class="eyebrow">LATEST UPDATES</p>
              <h2>频道最新</h2>
            </div>
            <button class="channel-search-link" type="button" data-channel-search>
              在站内搜索
              ${icon('arrow-up-right')}
            </button>
          </div>

          <div class="channel-layout">
            <article class="channel-feature">
              <div class="channel-feature__top">
                <span class="channel-feature__label">${escapeHTML(channelFeatureLabel(name))}</span>
                ${featureBadge}
              </div>
              ${icon(channel.icon, 'channel-feature__watermark')}
              <span class="channel-feature__index" aria-hidden="true">01</span>
              <div class="channel-feature__body">
                <p class="eyebrow">FEATURED</p>
                <h2>${escapeHTML(feature.title)}</h2>
                <p class="channel-feature__meta">${escapeHTML(feature.meta || '')}</p>
                <p class="channel-feature__note">${escapeHTML(note)}</p>
              </div>
            </article>

            <aside class="channel-feed" aria-label="更多更新">
              <ol class="channel-feed__list">
                ${feed.map((item, index) => `
                  <li class="channel-feed__item">
                    <span class="channel-feed__index">${String(index + 2).padStart(2, '0')}</span>
                    <span class="channel-feed__copy">
                      <span class="channel-feed__title">${escapeHTML(item.title)}</span>
                      <span class="channel-feed__meta">${escapeHTML(item.meta || '')}</span>
                    </span>
                    ${item.badge ? `<span class="channel-feed__badge${item.badge.includes('↑') || item.badge.includes('推荐') ? ' is-warm' : ''}">${escapeHTML(item.badge)}</span>` : ''}
                  </li>`).join('')}
              </ol>
              <div class="channel-feed__foot">
                <span><span class="status-dot"></span>每日 09:00 更新</span>
                <span>共 ${items.length} 条</span>
              </div>
            </aside>
          </div>
        </div>
      </div>`;
  }

  function renderChannelPage(name) {
    if (!channelView) return;
    channelView.innerHTML = channelPageMarkup(name);

    if (name === '新闻') {
      window.requestAnimationFrame(() => {
        const bar = channelView.querySelector('.news-categories');
        const active = bar?.querySelector('.news-category.is-active');
        if (!bar || !active) return;
        const barRect = bar.getBoundingClientRect();
        const activeRect = active.getBoundingClientRect();
        if (activeRect.left < barRect.left) {
          bar.scrollBy({ left: activeRect.left - barRect.left - 8, behavior: 'auto' });
        } else if (activeRect.right > barRect.right) {
          bar.scrollBy({ left: activeRect.right - barRect.right + 8, behavior: 'auto' });
        }
      });
    }
  }

  function closeNewsMoreMenu() {
    const toggle = channelView?.querySelector('[data-news-more-toggle]');
    const menu = channelView?.querySelector('#news-more-menu');
    if (menu) menu.hidden = true;
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  function activateTab(id, { focusTab = true, restoreScroll = true } = {}) {
    const next = state.tabs.find((tab) => tab.id === id);
    if (!next) return;

    if (state.activeTabId === id) {
      closeSearch();
      closeWeather();
      if (document.body.classList.contains('nav-open')) closeMobileNav(false);
      if (focusTab) focusActiveTab();
      return;
    }

    const outgoing = state.tabs.find((tab) => tab.id === state.activeTabId);
    if (outgoing) outgoing.scrollY = window.scrollY;

    state.activeTabId = id;
    closeSearch();
    closeWeather();
    if (document.body.classList.contains('nav-open')) closeMobileNav(false);

    if (next.id === 'home') {
      channelView.hidden = true;
      dashboardView.hidden = false;
      dashboardView.setAttribute('aria-labelledby', 'tab-home');
      setBreadcrumb('全部资讯');
      setActiveNav('新闻导航');
      document.title = '知闻 · 你的每日信息站';
    } else {
      renderChannelPage(next.name);
      dashboardView.hidden = true;
      channelView.hidden = false;
      channelView.setAttribute('aria-labelledby', `tab-${next.id}`);
      setBreadcrumb(next.name);
      setActiveNav(next.name);
      document.title = `${next.name} · 知闻`;
    }

    renderTabs();

    if (restoreScroll) {
      jumpToScrollPosition(next.scrollY || 0);
    }

    if (focusTab) {
      window.requestAnimationFrame(focusActiveTab);
    }
  }

  function openTab(channelName, options = {}) {
    if (!channelName) return;

    if (channelName === '新闻导航') {
      activateTab('home', options);
      return;
    }

    const channel = channels[channelName];
    if (!channel) {
      showToast('这个频道正在整理中。');
      return;
    }

    let tab = state.tabs.find((entry) => entry.channel === channelName);
    if (!tab) {
      tab = {
        id: `channel-${state.nextTabId}`,
        name: channelName,
        channel: channelName,
        icon: channel.icon,
        closable: true,
        scrollY: 0
      };
      state.nextTabId += 1;
      state.tabs.push(tab);
    }

    activateTab(tab.id, options);
  }

  function closeTab(id, { focusTab = true } = {}) {
    const index = state.tabs.findIndex((tab) => tab.id === id);
    if (index < 0) return;
    const tab = state.tabs[index];
    if (!tab.closable) return;

    const wasActive = state.activeTabId === id;
    state.tabs.splice(index, 1);

    if (wasActive) {
      const fallback = state.tabs[Math.min(index, state.tabs.length - 1)] || state.tabs[0];
      if (fallback) activateTab(fallback.id, { focusTab, restoreScroll: true });
      else renderTabs();
    } else {
      renderTabs();
      if (focusTab) window.requestAnimationFrame(focusActiveTab);
    }
  }

  function initTabs() {
    renderTabs();

    tabTrack?.addEventListener('click', (event) => {
      const close = event.target.closest('[data-tab-close]');
      if (close) {
        event.preventDefault();
        event.stopPropagation();
        closeTab(close.dataset.tabClose);
        return;
      }

      const target = event.target.closest('[data-tab-activate]');
      if (target) activateTab(target.dataset.tabActivate);
    });

    tabTrack?.addEventListener('auxclick', (event) => {
      if (event.button !== 1) return;
      const close = event.target.closest('[data-tab-close]');
      const tab = event.target.closest('[data-tab-id]');
      const targetId = close?.dataset.tabClose || tab?.dataset.tabId;
      if (targetId) {
        event.preventDefault();
        closeTab(targetId);
      }
    });

    tabTrack?.addEventListener('keydown', (event) => {
      const target = event.target.closest('[data-tab-activate]');
      if (!target) return;
      const index = state.tabs.findIndex((tab) => tab.id === target.dataset.tabActivate);
      if (index < 0) return;

      let nextIndex = null;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % state.tabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + state.tabs.length) % state.tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = state.tabs.length - 1;
      else if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        closeTab(state.tabs[index].id);
        return;
      }

      if (nextIndex === null) return;
      event.preventDefault();
      activateTab(state.tabs[nextIndex].id);
    });

    breadcrumbHome?.addEventListener('click', (event) => {
      event.preventDefault();
      openTab('新闻导航');
    });

    channelView?.addEventListener('click', (event) => {
      const moreToggle = event.target.closest('[data-news-more-toggle]');
      if (moreToggle) {
        event.preventDefault();
        event.stopPropagation();
        const menu = channelView.querySelector('#news-more-menu');
        const willOpen = moreToggle.getAttribute('aria-expanded') !== 'true';
        moreToggle.setAttribute('aria-expanded', String(willOpen));
        if (menu) menu.hidden = !willOpen;
        return;
      }

      if (event.target.closest('.news-more-menu a')) {
        closeNewsMoreMenu();
        return;
      }

      const categoryButton = event.target.closest('[data-news-category]');
      if (categoryButton) {
        state.newsDesk.category = categoryButton.dataset.newsCategory;
        renderChannelPage('新闻');
        window.requestAnimationFrame(() => {
          channelView.querySelector(`[data-news-category="${state.newsDesk.category}"]`)?.focus({ preventScroll: true });
        });
        return;
      }

      const sortButton = event.target.closest('[data-news-sort]');
      if (sortButton) {
        state.newsDesk.sort = sortButton.dataset.newsSort;
        renderChannelPage('新闻');
        window.requestAnimationFrame(() => {
          channelView.querySelector(`[data-news-sort="${state.newsDesk.sort}"]`)?.focus({ preventScroll: true });
        });
        return;
      }

      const sourceLink = event.target.closest('[data-news-source]');
      if (sourceLink) {
        const sourceName = sourceLink.dataset.newsSource;
        const cards = $$('.news-source-card', channelView);
        if (sourceName === 'all') {
          channelView.querySelector('.news-source-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }

        const targetCard = cards.find((card) => card.dataset.newsSourceCard === sourceName);
        if (!targetCard) return;
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.classList.add('is-highlighted');
        $$('.news-source-link', channelView).forEach((link) => link.classList.remove('is-selected'));
        sourceLink.classList.add('is-selected');
        window.setTimeout(() => {
          targetCard.classList.remove('is-highlighted');
          sourceLink.classList.remove('is-selected');
        }, 1400);
        return;
      }

      if (!event.target.closest('[data-channel-search]')) return;
      event.stopPropagation();
      const tab = currentTab();
      jumpToSearch(tab.name === '全部资讯' ? '' : tab.name);
    });
  }

  /* --------------------------------------------------------
     Search
     -------------------------------------------------------- */

  function getSearchMatches(query) {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return { articles: [], channels: [], topics: [] };

    const matchesText = (value) => String(value || '').toLocaleLowerCase().includes(normalized);

    const articleMatches = allArticles
      .filter((article) =>
        matchesText(article.title) ||
        matchesText(article.tag) ||
        matchesText(article.summary) ||
        article.body.some((paragraph) => matchesText(paragraph)))
      .slice(0, 5);

    const channelMatches = Object.entries(channels)
      .filter(([name, channel]) =>
        matchesText(name) ||
        matchesText(channel.group) ||
        matchesText(channel.intro) ||
        channel.items.some((item) => matchesText(item.title) || matchesText(item.meta)) ||
        (channel.quotes || []).some((quote) => matchesText(quote.label) || matchesText(quote.value)) ||
        (channel.kind === 'newsdesk' && Object.values(newsDeskCategories).some((category) =>
          category.sources.some((source) =>
            matchesText(source.name) ||
            matchesText(source.type) ||
            source.items.some((title) => matchesText(title))))))
      .slice(0, 4)
      .map(([name, channel]) => ({ name, ...channel }));

    const topicMatches = topics
      .filter((topic) => matchesText(topic.title) || matchesText(topic.meta))
      .slice(0, 3);

    return { articles: articleMatches, channels: channelMatches, topics: topicMatches };
  }

  function highlight(text, query) {
    const safeText = String(text);
    if (!query.trim()) return escapeHTML(safeText);
    const parts = safeText.split(new RegExp(`(${escapeRegExp(query.trim())})`, 'gi'));
    return parts
      .map((part, index) => index % 2 === 1 ? `<mark>${escapeHTML(part)}</mark>` : escapeHTML(part))
      .join('');
  }

  function searchResultMarkup({ iconName, title, meta, attrs, query }) {
    return `
      <button class="search-result" type="button" role="option" aria-selected="false" ${attrs}>
        <span class="search-result__icon" aria-hidden="true">${icon(iconName)}</span>
        <span class="search-result__body">
          <strong>${highlight(title, query)}</strong>
          <small>${escapeHTML(meta)}</small>
        </span>
        ${icon('arrow-up-right', 'search-result__arrow')}
      </button>`;
  }

  function sectionMarkup(label, content) {
    return `
      <section class="search-section" role="group" aria-label="${escapeHTML(label)}">
        <p class="search-section__label" aria-hidden="true">${label}</p>
        ${content}
      </section>`;
  }

  function renderSearchIdle() {
    const quickNames = ['模型榜单', '技术周刊', '今天吃什么'];
    const quickLinks = quickNames
      .filter((name) => channels[name])
      .map((name) => searchResultMarkup({
        iconName: channels[name].icon,
        title: name,
        meta: `频道 · ${channels[name].group}`,
        attrs: `data-channel-name="${escapeHTML(name)}"`,
        query: ''
      }))
      .join('');

    const chips = topics.map((topic) =>
      `<button class="search-chip" type="button" role="option" aria-selected="false" data-search-chip="${escapeHTML(topic.title)}">${escapeHTML(topic.title)}</button>`
    ).join('');

    searchResults.innerHTML = `
      ${sectionMarkup('快速前往', quickLinks)}
      ${sectionMarkup('热门话题', `<div class="search-chip-wrap">${chips}</div>`)}`;
  }

  function renderSearchResults() {
    const query = searchInput.value.trim();
    searchClear.hidden = !query;
    state.searchFocus = -1;
    searchInput.removeAttribute('aria-activedescendant');

    if (!query) {
      renderSearchIdle();
      prepareSearchOptions();
      return;
    }

    const { articles, channels: channelMatches, topics: topicMatches } = getSearchMatches(query);
    const sections = [];

    if (articles.length) {
      sections.push(sectionMarkup('资讯', articles.map((article) =>
        searchResultMarkup({
          iconName: article.columnIcon,
          title: article.title,
          meta: `${article.columnTitle} · ${article.tag}`,
          attrs: `data-article-id="${escapeHTML(article.id)}"`,
          query
        })
      ).join('')));
    }

    if (topicMatches.length) {
      sections.push(sectionMarkup('话题', topicMatches.map((topic) =>
        searchResultMarkup({
          iconName: topic.icon,
          title: topic.title,
          meta: `话题 · ${topic.meta}`,
          attrs: `data-topic-result="${escapeHTML(topic.channel)}"`,
          query
        })
      ).join('')));
    }

    if (channelMatches.length) {
      sections.push(sectionMarkup('频道', channelMatches.map((channel) =>
        searchResultMarkup({
          iconName: channel.icon,
          title: channel.name,
          meta: `频道 · ${channel.group}`,
          attrs: `data-channel-name="${escapeHTML(channel.name)}"`,
          query
        })
      ).join('')));
    }

    if (!sections.length) {
      searchResults.innerHTML = `
        <div class="search-empty">
          <span class="search-empty__icon">${icon('search')}</span>
          <strong>没有找到「${escapeHTML(query)}」</strong>
          <span>试试更短的关键词，或从下面的热门话题开始。</span>
          <div class="search-chip-wrap" style="justify-content:center;padding-top:8px">
            ${topics.slice(0, 4).map((topic) => `<button class="search-chip" type="button" role="option" aria-selected="false" data-search-chip="${escapeHTML(topic.title)}">${escapeHTML(topic.title)}</button>`).join('')}
          </div>
        </div>`;
    } else {
      searchResults.innerHTML = sections.join('');
    }

    prepareSearchOptions();
  }

  function prepareSearchOptions() {
    $$('.search-result', searchResults).forEach((option, index) => {
      option.id = `search-option-${index}`;
    });
  }

  function openSearchPanel() {
    if (!searchPanel) return;
    renderSearchResults();
    searchPanel.hidden = false;
    searchInput.setAttribute('aria-expanded', 'true');
  }

  function closeSearch() {
    if (!searchPanel || searchPanel.hidden) return;
    searchPanel.hidden = true;
    searchInput.setAttribute('aria-expanded', 'false');
    searchInput.removeAttribute('aria-activedescendant');
    state.searchFocus = -1;
  }

  function ensureHomeTab() {
    if (state.activeTabId !== 'home') {
      activateTab('home', { focusTab: false, restoreScroll: false });
    }
  }

  function focusSearchPanel() {
    ensureHomeTab();
    const rect = searchWrap.getBoundingClientRect();
    if (rect.top < 70 || rect.bottom > window.innerHeight - 80) {
      searchWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => searchInput.focus({ preventScroll: true }), 280);
    } else {
      searchInput.focus({ preventScroll: true });
    }
    openSearchPanel();
  }

  function setSearchQuery(query) {
    searchInput.value = query;
    searchClear.hidden = !query;
    openSearchPanel();
  }

  function jumpToSearch(query = '') {
    ensureHomeTab();
    if (query) {
      searchInput.value = query;
      searchClear.hidden = false;
    }
    focusSearchPanel();
  }

  function moveSearchFocus(direction) {
    const options = $$('.search-result', searchResults);
    if (!options.length) return;
    if (state.searchFocus < 0) {
      state.searchFocus = direction > 0 ? 0 : options.length - 1;
    } else {
      state.searchFocus = (state.searchFocus + direction + options.length) % options.length;
    }
    options.forEach((option, index) => {
      const active = index === state.searchFocus;
      option.classList.toggle('is-focused', active);
      option.setAttribute('aria-selected', String(active));
    });
    const active = options[state.searchFocus];
    if (active) {
      searchInput.setAttribute('aria-activedescendant', active.id);
      active.scrollIntoView({ block: 'nearest' });
    }
  }

  function activateFocusedSearchResult() {
    const options = $$('.search-result', searchResults);
    const active = state.searchFocus >= 0 ? options[state.searchFocus] : options[0];
    if (active) active.click();
  }

  /* --------------------------------------------------------
     Calendar
     -------------------------------------------------------- */

  const weekdaysLong = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  function getEventsForDate(year, month, day) {
    const date = new Date(year, month, day, 12);
    const weekday = date.getDay();
    const make = (time, title, note = '') => ({ time, title, note });

    if (day === 3) {
      return [
        make('09:00', '新闻早报 · 每日要闻已发布', '12 条更新'),
        make('14:00', 'AI 观察 · 模型榜单周度更新', '编辑中'),
        make('18:00', '编辑部选题会 · 下周预告', '内部')
      ];
    }
    if (day === 8) {
      return [
        make('10:00', '专题《城市的呼吸》上线', '封面故事'),
        make('16:00', '技术周刊 Issue 043 发布', '7 篇文章')
      ];
    }
    if (day === 13) {
      return [make('09:00', '周末阅读清单', '生活频道')];
    }
    if (day === 18) {
      return [
        make('09:00', '新闻早报 · 每日要闻已发布', '12 条更新'),
        make('20:00', '夜读 · 一封写给城市的信', '特别策划')
      ];
    }
    if (day === 23) {
      return [make('11:00', '优秀知识库 · 本月精选', '知识管理')];
    }
    if (day === 28) {
      return [
        make('09:00', 'AI 观察周刊', 'Issue 044'),
        make('15:00', '月度回顾 · 那些值得记住的小事', '编辑精选')
      ];
    }
    if (weekday === 1 && day % 2 === 0) {
      return [make('09:00', '一周选题预告', '编辑部')];
    }
    return [];
  }

  function calendarKey(year, month, day) {
    return `${year}-${pad(month + 1)}-${pad(day)}`;
  }

  function parseCalendarKey(key) {
    const [year, month, day] = key.split('-').map(Number);
    return new Date(year, month - 1, day, 12);
  }

  function renderCalendar(focusSelected = false) {
    const calendar = state.calendar;
    const year = calendar.viewYear;
    const month = calendar.viewMonth;
    const monthLabel = $('#calendar-month');
    const grid = $('#calendar-grid');

    if (monthLabel) monthLabel.textContent = `${year}年 ${month + 1}月`;
    if (!grid) return;

    const first = new Date(year, month, 1, 12);
    const mondayOffset = (first.getDay() + 6) % 7;
    const today = new Date();
    const todayKey = dateKey(today);
    const cells = [];

    for (let index = 0; index < 42; index += 1) {
      const cellDate = new Date(year, month, index - mondayOffset + 1, 12);
      const cellYear = cellDate.getFullYear();
      const cellMonth = cellDate.getMonth();
      const cellDay = cellDate.getDate();
      const cellKey = calendarKey(cellYear, cellMonth, cellDay);
      const outside = cellMonth !== month;
      const hasEvents = getEventsForDate(cellYear, cellMonth, cellDay).length > 0;
      const isToday = cellKey === todayKey;
      const isSelected = cellKey === calendar.selectedKey;
      const classes = [
        'calendar-day',
        outside ? 'is-outside' : '',
        isToday ? 'is-today' : '',
        isSelected ? 'is-selected' : '',
        hasEvents ? 'has-event' : ''
      ].filter(Boolean).join(' ');

      cells.push(`
        <button
          class="${classes}"
          type="button"
          data-calendar-date="${cellKey}"
          aria-label="${cellYear}年${cellMonth + 1}月${cellDay}日${hasEvents ? '，有发布安排' : ''}"
          aria-pressed="${isSelected}"
          tabindex="${isSelected ? '0' : '-1'}"
        >${cellDay}</button>`);
    }

    grid.innerHTML = cells.join('');
    renderAgenda();

    if (focusSelected) {
      const selectedButton = grid.querySelector(`[data-calendar-date="${calendar.selectedKey}"]`);
      selectedButton?.focus({ preventScroll: true });
    }
  }

  function renderAgenda() {
    const selectedDate = parseCalendarKey(state.calendar.selectedKey);
    const agendaDate = $('#agenda-date');
    const agendaList = $('#agenda-list');
    if (!agendaDate || !agendaList) return;

    const label = `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日 · ${weekdaysLong[selectedDate.getDay()]}`;
    agendaDate.textContent = label;

    const events = getEventsForDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

    if (!events.length) {
      agendaList.innerHTML = `
        <div class="agenda-empty">
          这一天还没有发布安排。<br>
          留一点空白，也很好。
        </div>`;
      return;
    }

    agendaList.innerHTML = events.map((event) => `
      <div class="agenda-item">
        <span class="agenda-item__dot" aria-hidden="true"></span>
        <div class="agenda-item__body">
          <span class="agenda-item__time">${escapeHTML(event.time)}${event.note ? ` · ${escapeHTML(event.note)}` : ''}</span>
          <span class="agenda-item__title">${escapeHTML(event.title)}</span>
        </div>
      </div>`).join('');
  }

  function openCalendar() {
    const now = new Date();
    if (!state.calendar.initialized) {
      state.calendar.initialized = true;
      state.calendar.viewYear = now.getFullYear();
      state.calendar.viewMonth = now.getMonth();
      state.calendar.selectedKey = dateKey(now);
    }
    renderCalendar();
    openDialog(calendarDialog);
  }

  function shiftCalendarMonth(delta) {
    const calendar = state.calendar;
    const selected = parseCalendarKey(calendar.selectedKey);
    const target = new Date(calendar.viewYear, calendar.viewMonth + delta, 1, 12);
    const daysInTarget = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    const day = Math.min(selected.getDate(), daysInTarget);
    calendar.viewYear = target.getFullYear();
    calendar.viewMonth = target.getMonth();
    calendar.selectedKey = calendarKey(calendar.viewYear, calendar.viewMonth, day);
    renderCalendar();
  }

  /* --------------------------------------------------------
     Weather / language / navigation
     -------------------------------------------------------- */

  const weatherButton = $('#weather-button');
  const weatherPopover = $('#weather-popover');
  const forecastGrid = $('#forecast-grid');
  const forecastRange = $('#forecast-range');
  const weatherUpdated = $('#weather-updated');
  const clothingTitle = $('#clothing-title');
  const clothingNote = $('#clothing-note');

  const weatherForecast = [
    { condition: '多云', icon: 'cloud-sun', high: 21, low: 15, rain: 10 },
    { condition: '晴', icon: 'sun', high: 22, low: 16, rain: 0 },
    { condition: '小雨', icon: 'rain', high: 19, low: 14, rain: 70 },
    { condition: '阴', icon: 'overcast', high: 18, low: 13, rain: 20 },
    { condition: '多云', icon: 'cloud-sun', high: 20, low: 14, rain: 10 },
    { condition: '晴', icon: 'sun', high: 22, low: 15, rain: 0 },
    { condition: '晴转多云', icon: 'cloud-sun', high: 23, low: 16, rain: 10 },
    { condition: '小雨', icon: 'rain', high: 19, low: 14, rain: 65 },
    { condition: '阵雨', icon: 'rain', high: 18, low: 13, rain: 55 },
    { condition: '多云', icon: 'cloud', high: 20, low: 14, rain: 15 },
    { condition: '晴', icon: 'sun', high: 21, low: 14, rain: 0 },
    { condition: '多云', icon: 'cloud-sun', high: 19, low: 13, rain: 10 },
    { condition: '阴', icon: 'overcast', high: 17, low: 12, rain: 25 },
    { condition: '小雨', icon: 'rain', high: 16, low: 11, rain: 60 },
    { condition: '多云', icon: 'cloud-sun', high: 18, low: 12, rain: 10 }
  ];

  function renderWeatherForecast() {
    if (!forecastGrid) return;

    const now = new Date();
    const dayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const days = weatherForecast.map((day, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() + index);
      const label = index === 0 ? '今天' : index === 1 ? '明天' : dayLabels[date.getDay()];
      const dateLabel = `${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
      const ariaLabel = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日，${day.condition}，最高 ${day.high} 度，最低 ${day.low} 度，降雨概率 ${day.rain}%`;
      return `
        <div class="forecast-day is-${day.icon}${index === 0 ? ' is-today' : ''}" role="listitem" aria-label="${escapeHTML(ariaLabel)}">
          <span class="forecast-day__day">${label}</span>
          <span class="forecast-day__date">${dateLabel}</span>
          ${icon(day.icon, 'forecast-day__icon')}
          <span class="forecast-day__temps"><strong>${day.high}°</strong><span>${day.low}°</span></span>
          <span class="forecast-day__condition">${escapeHTML(day.condition)}</span>
        </div>`;
    });

    forecastGrid.innerHTML = days.join('');

    const lastDate = new Date(now);
    lastDate.setDate(now.getDate() + weatherForecast.length - 1);
    if (forecastRange) {
      forecastRange.textContent = `${pad(now.getMonth() + 1)}/${pad(now.getDate())} — ${pad(lastDate.getMonth() + 1)}/${pad(lastDate.getDate())}`;
    }
    if (weatherUpdated) {
      weatherUpdated.textContent = `${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${formatClock(now)} 更新`;
    }

    const low = Math.min(...weatherForecast.map((day) => day.low));
    const high = Math.max(...weatherForecast.map((day) => day.high));
    const rainyDays = weatherForecast.filter((day) => day.rain >= 40).length;
    if (clothingTitle) {
      clothingTitle.textContent = low <= 12 ? '薄外套 + 长袖，早晚加一件' : '长袖为主，随身带一件薄外套';
    }
    if (clothingNote) {
      clothingNote.textContent = `未来 15 天最低 ${low}°、最高 ${high}°，早晚温差明显；有 ${rainyDays} 天可能出现降雨，出门可带折叠伞。`;
    }
  }

  function closeWeather() {
    if (!weatherPopover || weatherPopover.hidden) return;
    weatherPopover.hidden = true;
    weatherButton?.setAttribute('aria-expanded', 'false');
  }

  function toggleWeather() {
    if (!weatherPopover) return;
    const willOpen = weatherPopover.hidden;
    closeSearch();
    if (willOpen) renderWeatherForecast();
    weatherPopover.hidden = !willOpen;
    weatherButton?.setAttribute('aria-expanded', String(willOpen));
  }

  function syncSidebarInert() {
    if (!sidebar) return;
    const shouldBeInert = mobileQuery.matches && !document.body.classList.contains('nav-open');
    sidebar.inert = shouldBeInert;
  }

  function closeMobileNav(restoreFocus = true) {
    if (!document.body.classList.contains('nav-open')) {
      syncSidebarInert();
      return;
    }
    document.body.classList.remove('nav-open');
    if (sidebarScrim) sidebarScrim.hidden = true;
    menuToggle?.setAttribute('aria-expanded', 'false');
    syncSidebarInert();
    if (restoreFocus) menuToggle?.focus({ preventScroll: true });
  }

  function openMobileNav() {
    closeSearch();
    closeWeather();
    document.body.classList.add('nav-open');
    if (sidebarScrim) sidebarScrim.hidden = false;
    menuToggle?.setAttribute('aria-expanded', 'true');
    syncSidebarInert();
    window.setTimeout(() => sidebarClose?.focus({ preventScroll: true }), 220);
  }

  function initNavigation() {
    const saved = (() => {
      try {
        return JSON.parse(window.localStorage.getItem('news-compass-nav') || '{}');
      } catch (error) {
        return {};
      }
    })();

    $$('.nav-group').forEach((group) => {
      const key = group.dataset.group;
      const toggle = $('.nav-group__toggle', group);
      const list = $('.nav-group__list', group);
      if (!toggle || !list) return;

      if (saved[key] === false) {
        toggle.setAttribute('aria-expanded', 'false');
        list.hidden = true;
      }

      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        list.hidden = expanded;
        try {
          const current = JSON.parse(window.localStorage.getItem('news-compass-nav') || '{}');
          current[key] = !expanded;
          window.localStorage.setItem('news-compass-nav', JSON.stringify(current));
        } catch (error) {
          /* Storage is optional. */
        }
      });
    });

    $$('.nav-link, .nav-solo').forEach((link) => {
      link.addEventListener('click', (event) => {
        const name = link.dataset.channel;
        if (!name) return;
        event.preventDefault();
        openTab(name);
      });
    });

    menuToggle?.addEventListener('click', openMobileNav);
    sidebarClose?.addEventListener('click', () => closeMobileNav(true));
    sidebarScrim?.addEventListener('click', () => closeMobileNav(true));
  }

  /* --------------------------------------------------------
     Event wiring
     -------------------------------------------------------- */

  function initNewsInteractions() {
    newsGrid?.addEventListener('click', (event) => {
      const refresh = event.target.closest('[data-refresh]');
      if (refresh) {
        refreshColumn(refresh.dataset.refresh, refresh);
        return;
      }

      const articleButtonEl = event.target.closest('[data-article-id]');
      if (articleButtonEl) openArticle(articleButtonEl.dataset.articleId);
    });
  }

  function initSearchInteractions() {
    searchInput?.addEventListener('focus', openSearchPanel);
    searchInput.addEventListener('input', () => {
      searchClear.hidden = !searchInput.value.trim();
      openSearchPanel();
    });

    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveSearchFocus(1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveSearchFocus(-1);
      } else if (event.key === 'Enter') {
        if (state.searchFocus >= 0 || !searchPanel.hidden) {
          const value = searchInput.value.trim();
          if (value) {
            event.preventDefault();
            activateFocusedSearchResult();
          }
        }
      } else if (event.key === 'Escape') {
        event.preventDefault();
        closeSearch();
        searchInput.blur();
      }
    });

    searchClear?.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.hidden = true;
      openSearchPanel();
      searchInput.focus();
    });

    searchResults?.addEventListener('click', (event) => {
      const article = event.target.closest('[data-article-id]');
      if (article) {
        closeSearch();
        openArticle(article.dataset.articleId);
        return;
      }

      const channel = event.target.closest('[data-channel-name]');
      if (channel) {
        closeSearch();
        openTab(channel.dataset.channelName);
        return;
      }

      const topicResult = event.target.closest('[data-topic-result]');
      if (topicResult) {
        closeSearch();
        openTab(topicResult.dataset.topicResult);
        return;
      }

      const chip = event.target.closest('[data-search-chip]');
      if (chip) {
        setSearchQuery(chip.dataset.searchChip);
        searchInput.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (searchPanel.hidden) return;
      if (!searchWrap.contains(event.target)) closeSearch();
    });

    document.addEventListener('keydown', (event) => {
      const tag = (event.target.tagName || '').toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select' || event.target.isContentEditable;
      const anyDialogOpen = Boolean(document.querySelector('dialog[open]'));

      if ((event.key === '/' && !isTyping) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault();
        if (anyDialogOpen) return;
        if (document.body.classList.contains('nav-open')) closeMobileNav(false);
        focusSearchPanel();
      }

      if (event.key === 'Escape') {
        if (!searchPanel.hidden) {
          closeSearch();
          searchInput.blur();
        } else if (document.body.classList.contains('nav-open')) {
          closeMobileNav(true);
        } else {
          closeWeather();
        }
      }
    });
  }

  function initDialogs() {
    $$('[data-close-dialog]').forEach((button) => {
      button.addEventListener('click', () => closeDialog(button.closest('dialog')));
    });

    [articleDialog, calendarDialog].forEach((dialog) => {
      dialog?.addEventListener('close', syncDialogState);
      dialog?.addEventListener('cancel', () => {
        window.setTimeout(syncDialogState, 0);
      });
      dialog?.addEventListener('click', (event) => {
        if (event.target === dialog) closeDialog(dialog);
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      closeWeather();
      if (document.body.classList.contains('nav-open')) closeMobileNav(true);
    });
  }

  function initCalendarInteractions() {
    $$('[data-open-calendar]').forEach((button) => {
      button.addEventListener('click', openCalendar);
    });

    $('#calendar-prev')?.addEventListener('click', () => shiftCalendarMonth(-1));
    $('#calendar-next')?.addEventListener('click', () => shiftCalendarMonth(1));
    $('#calendar-today')?.addEventListener('click', () => {
      const now = new Date();
      state.calendar.viewYear = now.getFullYear();
      state.calendar.viewMonth = now.getMonth();
      state.calendar.selectedKey = dateKey(now);
      renderCalendar();
    });

    $('#calendar-grid')?.addEventListener('click', (event) => {
      const dayButton = event.target.closest('[data-calendar-date]');
      if (!dayButton) return;
      const selected = parseCalendarKey(dayButton.dataset.calendarDate);
      state.calendar.viewYear = selected.getFullYear();
      state.calendar.viewMonth = selected.getMonth();
      state.calendar.selectedKey = dayButton.dataset.calendarDate;
      renderCalendar(true);
    });

    $('#calendar-grid')?.addEventListener('keydown', (event) => {
      const dayButton = event.target.closest('[data-calendar-date]');
      if (!dayButton) return;

      const date = parseCalendarKey(dayButton.dataset.calendarDate);
      const weekdayOffset = (date.getDay() + 6) % 7;
      let delta = null;

      if (event.key === 'ArrowLeft') delta = -1;
      else if (event.key === 'ArrowRight') delta = 1;
      else if (event.key === 'ArrowUp') delta = -7;
      else if (event.key === 'ArrowDown') delta = 7;
      else if (event.key === 'Home') delta = -weekdayOffset;
      else if (event.key === 'End') delta = 6 - weekdayOffset;

      if (delta === null) return;
      event.preventDefault();
      date.setDate(date.getDate() + delta);
      state.calendar.viewYear = date.getFullYear();
      state.calendar.viewMonth = date.getMonth();
      state.calendar.selectedKey = dateKey(date);
      renderCalendar(true);
    });
  }

  function initMisc() {
    renderWeatherForecast();

    weatherButton?.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleWeather();
    });

    weatherPopover?.addEventListener('click', (event) => event.stopPropagation());

    document.addEventListener('click', () => {
      if (!weatherPopover?.hidden) closeWeather();
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.news-more')) closeNewsMoreMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeNewsMoreMenu();
    });

    $('#lang-button')?.addEventListener('click', () => {
      showToast('英文版正在准备中，先为你保留中文阅读体验。');
    });

    $$('.topic-chip').forEach((chip) => {
      chip.addEventListener('click', (event) => {
        event.stopPropagation();
        const query = chip.dataset.topic || chip.textContent.trim();
        setSearchQuery(query);
        searchWrap?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => searchInput.focus({ preventScroll: true }), 320);
      });
    });

    $('#reader-search-related')?.addEventListener('click', () => {
      if (!state.lastArticle) return;
      const query = state.lastArticle.tag.split('·')[0].trim();
      closeDialog(articleDialog);
      window.setTimeout(() => jumpToSearch(query), 120);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1120) closeMobileNav(false);
      syncSidebarInert();
    });

    syncSidebarInert();
    updateTimestamp();
    window.setInterval(updateTimestamp, 60 * 1000);
  }

  /* --------------------------------------------------------
     Boot
     -------------------------------------------------------- */

  renderNews();
  initTabs();
  initNavigation();
  initNewsInteractions();
  initSearchInteractions();
  initDialogs();
  initCalendarInteractions();
  initMisc();

  // Expose a tiny, read-only debug surface for the design preview.
  window.newsCompass = {
    openArticle,
    openTab,
    closeTab,
    activateTab,
    openCalendar,
    search: jumpToSearch,
    toast: showToast
  };
})();

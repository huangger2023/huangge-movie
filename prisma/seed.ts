import { db } from "../src/lib/db";

async function main() {
  console.log("🌱 Seeding database...");

  // Clean
  await db.toolUsage.deleteMany();
  await db.generatedScript.deleteMany();
  await db.enrollment.deleteMany();
  await db.lesson.deleteMany();
  await db.course.deleteMany();
  await db.user.deleteMany();

  // Users
  const admin = await db.user.create({
    data: {
      email: "admin@yingshu.com",
      name: "影述导师·老陈",
      password: "admin123",
      role: "ADMIN",
      bio: "千万播放电影解说操盘手，6年抖音影视赛道经验，带出300+爆款账号",
      avatar: null,
    },
  });

  const demo = await db.user.create({
    data: {
      email: "demo@yingshu.com",
      name: "小白创作者",
      password: "123456",
      role: "STUDENT",
      bio: "刚入坑的电影解说爱好者",
    },
  });

  console.log("✓ Users created");

  const courses = [
    {
      title: "抖音电影解说0到1破冰营",
      subtitle: "从选片到第一条10万+，7天带你跑通全流程",
      description:
        "专为新手打造的电影解说入门系统课。从账号定位、选片逻辑、文案结构、配音剪辑到发布运营，手把手带你做出第一条能跑量的电影解说视频。课程包含12节实战课+5个实操案例拆解，0基础也能上手。",
      coverImage: "/covers/course-1.png",
      category: "入门",
      level: "初级",
      price: 199,
      originalPrice: 599,
      isFree: false,
      isFeatured: true,
      instructor: "影述导师·老陈",
      instructorBio: "千万播放操盘手，带出300+爆款账号",
      rating: 4.9,
      ratingCount: 1284,
      studentsCount: 8642,
      totalDuration: 360,
      tags: ["新手友好", "全流程", "实操案例", "7天速成"],
      highlights: [
        "7天从0做出第一条能跑量的解说视频",
        "12节系统课覆盖选片到发布全链路",
        "5个百万播放案例逐帧拆解",
        "附赠100+精选片单和文案模板",
      ],
      lessons: [
        { title: "第1课｜认知篇：电影解说赛道的真实机会与陷阱", duration: 22, isPreview: true, content: "这节课带你建立对电影解说赛道的正确认知。我们拆解2024年抖音影视赛道的流量分配逻辑，分析哪些账号能拿到稳定流量，哪些做法会被限流。同时帮你避开新人最容易踩的3个坑：搬运限流、版权雷区、定位模糊。" },
        { title: "第2课｜定位篇：3步找到你的差异化人设", duration: 28, content: "定位决定流量天花板。这节课教你用「人群×情绪×风格」三角定位法，找到独属于你的解说人设，告别同质化。" },
        { title: "第3课｜选片篇：爆款片单的4个底层逻辑", duration: 35, content: "选对片就成功了一半。拆解悬疑、情感、爽文、深度四种解法各自适合的影片类型，附赠内部选片工具使用方法。" },
        { title: "第4课｜文案篇：黄金3秒与反转结构的秘密", duration: 42, content: "文案是解说的灵魂。这节课系统讲解「钩子-密度-反转-升华」四段式结构，配合AI文案工具高效产出。" },
        { title: "第5课｜配音篇：手机也能做出电影级声线", duration: 30, content: "从设备选择到声线训练，教你用一部手机配出有质感的解说旁白。" },
        { title: "第6课｜剪辑篇：3分钟剪出节奏感", duration: 38, content: "剪辑节奏决定完播率。讲解卡点、转场、画面匹配的核心技巧。" },
        { title: "第7课｜发布篇：标题封面标签的流量密码", duration: 25, content: "发布前的最后一公里。教你用爆款标题公式和封面设计提升点击率。" },
        { title: "第8课｜案例拆解：一条百万播放是怎么诞生的", duration: 45, content: "逐帧拆解一条真实百万播放视频，复盘从选题到爆发的完整路径。" },
      ],
    },
    {
      title: "悬疑反转解说高阶营",
      subtitle: "专攻悬疑片赛道，做出让人停不下来的解说",
      description:
        "悬疑反转是影视解说最吸流的解法之一。本课深度拆解悬疑片解说的文案结构、信息留白技巧、反转节奏设计，配合大量经典悬疑片实战演练，让你做出让观众「看到最后」的爆款解说。",
      coverImage: "/covers/course-2.png",
      category: "高阶",
      level: "高级",
      price: 399,
      originalPrice: 899,
      isFree: false,
      isFeatured: true,
      instructor: "影述导师·老陈",
      instructorBio: "千万播放操盘手",
      rating: 4.8,
      ratingCount: 632,
      studentsCount: 3120,
      totalDuration: 480,
      tags: ["悬疑赛道", "反转技巧", "高阶文案", "实战演练"],
      highlights: [
        "深度拆解悬疑解说的信息留白与反转设计",
        "10部经典悬疑片实战文案逐句精修",
        "掌握让观众「看到最后」的5种钩子结构",
        "附赠悬疑片独家选片库（含小众冷门佳作）",
      ],
      lessons: [
        { title: "第1课｜悬疑解说的流量基因：为什么观众停不下来", duration: 30, isPreview: true, content: "从心理学角度拆解悬疑解说为什么天然高完播。理解了基因，才能复制爆款。" },
        { title: "第2课｜信息留白术：该藏什么、该露什么", duration: 40, content: "悬疑解说的核心是信息控制。教你如何设计留白，让观众始终处于「差一点就知道真相」的悬念中。" },
        { title: "第3课｜反转节奏：3种经典反转结构拆解", duration: 45, content: "拆解「身份反转」「动机反转」「结局反转」三种结构的写作模板。" },
        { title: "第4课｜实战｜《看不见的客人》解说文案精修", duration: 55, content: "以这部经典悬疑片为例，从0写一条完整解说文案并逐句优化。" },
        { title: "第5课｜实战｜小众悬疑片的冷门宝藏挖掘", duration: 48, content: "教你用AI工具挖掘豆瓣冷门高分悬疑片，做出差异化内容。" },
      ],
    },
    {
      title: "情感共鸣解说实战课",
      subtitle: "用一条解说让观众破防，情感赛道流量密码",
      description:
        "情感共鸣型解说是涨粉最快的解法之一。本课教你如何找到影片的情感引爆点，用文案和配音让观众共情、破防、主动转发。包含8部经典情感片实战，掌握「戳心-共情-升华」的情感文案公式。",
      coverImage: "/covers/course-3.png",
      category: "实战",
      level: "中级",
      price: 299,
      originalPrice: 699,
      isFree: false,
      isFeatured: true,
      instructor: "影述导师·老陈",
      instructorBio: "千万播放操盘手",
      rating: 4.9,
      ratingCount: 421,
      studentsCount: 2180,
      totalDuration: 400,
      tags: ["情感赛道", "共情文案", "涨粉利器", "实战"],
      highlights: [
        "掌握「戳心-共情-升华」情感文案三段式",
        "8部经典情感片实战演练",
        "情感配音的呼吸感与停顿技巧",
        "让观众主动转发的5种情感钩子",
      ],
      lessons: [
        { title: "第1课｜情感解说的流量逻辑：为什么戳心=爆款", duration: 28, isPreview: true, content: "拆解情感型解说在抖音的传播机制，理解为什么「让人破防」的内容天然高互动。" },
        { title: "第2课｜找爆点：如何一眼定位影片的情感引爆点", duration: 35, content: "教你3步找到每部影片最戳心的那个场景，作为解说的核心钩子。" },
        { title: "第3课｜情感文案公式：戳心-共情-升华", duration: 42, content: "系统讲解情感型解说文案的三段式结构，配合金句库使用。" },
        { title: "第4课｜实战｜《忠犬八公》情感解说逐句拆解", duration: 50, content: "完整拆解一条千万播放情感解说文案的诞生过程。" },
      ],
    },
    {
      title: "AI智能文案创作大师课",
      subtitle: "用AI把单条文案产出时间从2小时压到10分钟",
      description:
        "这是平台的核心特色课。系统讲解如何用AI生成抖音独家精选电影解说文案，覆盖完整解说文案、爆款标题、黄金开头、文案润色四大工具链。学完你将拥有一个永不枯竭的文案生产力引擎。",
      coverImage: "/covers/course-4.png",
      category: "高阶",
      level: "中级",
      price: 499,
      originalPrice: 1299,
      isFree: false,
      isFeatured: true,
      instructor: "影述导师·老陈",
      instructorBio: "AI创作工具研发者",
      rating: 5.0,
      ratingCount: 893,
      studentsCount: 4560,
      totalDuration: 520,
      tags: ["AI文案", "效率工具", "独家精选", "核心特色"],
      highlights: [
        "掌握AI生成独家精选解说文案的完整工作流",
        "爆款标题、黄金开头、文案润色四大工具实操",
        "Prompt工程：让AI产出「人味」文案的秘诀",
        "附赠平台AI工具永久使用权",
      ],
      lessons: [
        { title: "第1课｜认知篇：AI不是替代你，而是放大你", duration: 25, isPreview: true, content: "建立正确的AI创作观。AI能做什么、不能做什么，如何让AI成为你的文案合伙人。" },
        { title: "第2课｜完整解说文案生成：从输入到成品", duration: 48, content: "实操平台核心工具：输入电影信息+风格参数，10分钟产出结构完整的解说文案。" },
        { title: "第3课｜爆款标题批量生成与筛选", duration: 35, content: "用AI批量产出标题，再人工筛选最佳。讲解6种爆款标题公式的Prompt写法。" },
        { title: "第4课｜黄金3秒开头：5种钩子的AI生成技巧", duration: 40, content: "针对悬念、反差、情感、数据、故事5种钩子，分别讲解专属Prompt。" },
        { title: "第5课｜文案润色：让AI文案有人味", duration: 38, content: "AI文案容易「机器味」。这节课教你怎么用润色工具把AI文案改出真人质感。" },
        { title: "第6课｜进阶Prompt工程：定制你的专属创作流", duration: 50, content: "教你组合多个工具，搭建一条属于自己的AI文案流水线。" },
      ],
    },
    {
      title: "账号运营与变现全攻略",
      subtitle: "从涨粉到变现，跑通电影解说商业闭环",
      description:
        "做出来只是第一步，跑通变现才是终点。本课系统讲解电影解说账号的涨粉策略、矩阵运营、私域沉淀、广告接单、知识付费等多元变现路径，帮你把内容能力转化为真金白银。",
      coverImage: "/covers/course-5.png",
      category: "运营",
      level: "中级",
      price: 359,
      originalPrice: 799,
      isFree: false,
      isFeatured: false,
      instructor: "影述导师·老陈",
      instructorBio: "操盘多个百万粉矩阵账号",
      rating: 4.7,
      ratingCount: 318,
      studentsCount: 1640,
      totalDuration: 360,
      tags: ["账号运营", "涨粉策略", "多元变现", "矩阵"],
      highlights: [
        "电影解说6大变现路径全解析",
        "矩阵账号冷启动与协同打法",
        "私域沉淀与粉丝复购设计",
        "广告报价与商务谈判实战",
      ],
      lessons: [
        { title: "第1课｜变现地图：电影解说能赚哪些钱", duration: 26, isPreview: true, content: "系统梳理电影解说的6大变现路径：星图广告、知识付费、私域带货、版权分销、账号交易、平台分成。" },
        { title: "第2课｜涨粉策略：从0到1万的冷启动", duration: 38, content: "冷启动阶段的选题、发布节奏、互动策略。" },
        { title: "第3课｜矩阵运营：1个人怎么做5个号", duration: 42, content: "矩阵账号的差异化定位与协同打法。" },
        { title: "第4课｜商务变现：报价、谈判、避坑", duration: 35, content: "星图报价策略、商务谈判技巧、广告主避坑指南。" },
      ],
    },
    {
      title: "配音剪辑精修训练营",
      subtitle: "把解说做出电影质感，声画双修进阶课",
      description:
        "文案决定内容上限，声画决定质感下限。本课专注解说视频的配音与剪辑精修，从声线塑造、气息控制、降噪处理到剪辑节奏、转场设计、音画同步，让你的解说视频拥有院线级质感。",
      coverImage: "/covers/course-6.png",
      category: "进阶",
      level: "中级",
      price: 269,
      originalPrice: 599,
      isFree: false,
      isFeatured: false,
      instructor: "影述导师·老陈",
      instructorBio: "声画双修操盘手",
      rating: 4.8,
      ratingCount: 256,
      studentsCount: 1320,
      totalDuration: 380,
      tags: ["配音精修", "剪辑节奏", "声画质感", "进阶"],
      highlights: [
        "声线塑造与气息控制的系统训练",
        "降噪、混响、EQ让配音更专业",
        "剪辑节奏与音画同步的进阶技巧",
        "附赠专业配音工程文件模板",
      ],
      lessons: [
        { title: "第1课｜声线篇：找到适合你的解说声线", duration: 32, isPreview: true, content: "不同赛道适合不同声线。教你通过测试找到最适合你人设的声线方向。" },
        { title: "第2课｜气息与停顿：让配音有呼吸感", duration: 38, content: "气息控制是配音质感的核心。系统训练气息与停顿技巧。" },
        { title: "第3课｜后期处理：降噪EQ混响三件套", duration: 40, content: "用AU或免费软件做专业级人声处理。" },
        { title: "第4课｜剪辑节奏：卡点转场与音画同步", duration: 45, content: "剪辑节奏决定完播率。讲解卡点、转场、音画同步的核心技巧。" },
      ],
    },
  ];

  for (const c of courses) {
    const { lessons, tags, highlights, ...data } = c;
    const course = await db.course.create({
      data: {
        ...data,
        tags: JSON.stringify(tags),
        highlights: JSON.stringify(highlights),
        lessonsCount: lessons.length,
      },
    });
    for (let i = 0; i < lessons.length; i++) {
      await db.lesson.create({
        data: { ...lessons[i], courseId: course.id, order: i + 1 },
      });
    }
    console.log(`✓ Course created: ${course.title}`);
  }

  // Demo enrollment + progress
  const targetCourse = await db.course.findFirst({ where: { title: { contains: "破冰营" } } });
  if (targetCourse) {
    await db.enrollment.create({
      data: {
        userId: demo.id,
        courseId: targetCourse.id,
        progress: 37.5,
      },
    });
  }

  // Demo generated scripts
  await db.generatedScript.create({
    data: {
      userId: demo.id,
      type: "SCRIPT",
      movieTitle: "消失的她",
      genre: "悬疑",
      input: JSON.stringify({ style: "悬疑反转", duration: "90秒", hookType: "悬念提问", tone: "犀利" }),
      output: `## 🎬 黄金3秒开头\n新婚妻子在异国度假时人间蒸发，丈夫疯狂寻找，可所有人都在告诉他——你根本没有妻子。这到底是怎么回事？\n\n## 📖 正文解说\n何非带着妻子李木子去东南亚度假，本该是甜蜜的蜜月，可一夜醒来，妻子凭空消失了。护照、行李、入住记录，所有痕迹都被抹得干干净净。\n\n更可怕的是，酒店前台、邻居、甚至监控里出现的那个女人，都不是他的妻子。何非快疯了，他拼命向所有人证明自己没病，可越挣扎，越像一个神经病。\n\n就在他即将崩溃时，一个金牌律师找上门，告诉他：你被卷入了一场精心设计的局。而幕后黑手，可能就是那个你以为最陌生又最熟悉的人。万万没想到，当真相浮出水面，所有人都倒吸一口凉气——这哪是失踪案，这分明是一场蓄谋已久的杀妻骗保局。\n\n## 💬 互动金句结尾\n你永远不知道，睡在你枕边的那个人，到底是爱你，还是在演你。婚姻最大的冒险，不是选错人，而是以为自己选对了。如果换作是你，你能识破这场局吗？\n\n## 🏷️ 推荐标签\n#消失的她 #悬疑解说 #婚姻陷阱 #反转神作 #电影解说\n\n## 📌 爆款标题建议\n1. 新婚妻子度假失踪，所有人却说：你根本没有妻子（悬念型）\n2. 全网吵翻的杀妻局，看完我连夜查了对象手机（争议型）\n3. 这部电影告诉你：别和这3种人结婚（数字型）`,
      meta: JSON.stringify({ style: "悬疑反转", duration: "90秒" }),
      isFavorite: true,
    },
  });

  await db.generatedScript.create({
    data: {
      userId: demo.id,
      type: "TITLE",
      movieTitle: "肖申克的救赎",
      genre: "剧情",
      input: JSON.stringify({ count: 8 }),
      output: `1. 坐牢27年只为一个秘密，出狱当天典狱长崩溃了（悬念型）\n2. 一把小锤子凿穿高墙，他用27年证明：自由无价（反差型）\n3. 影史第一神作，9.7分的背后藏着3个人生真相（数字型）\n4. 当所有人都放弃时，他却在牢里活成了国王（反差型）\n5. 这部电影看懂的人，都默默改写了自己的人生（情感型）\n6. 如果人生只剩一把锤子，你会选择认命还是越狱？（提问型）\n7. 豆瓣9.7，这部27年前的片子凭什么封神？（数字型）\n8. 最狠的复仇不是杀人，而是让对手亲眼看你自由（反差型）`,
      meta: JSON.stringify({ count: 8 }),
    },
  });

  // Tool usage stats
  for (const t of ["SCRIPT", "TITLE", "HOOK", "POLISH"]) {
    await db.toolUsage.create({
      data: { userId: demo.id, toolType: t, count: Math.floor(Math.random() * 20) + 3 },
    });
  }

  console.log("✓ Demo data created");
  console.log("🌱 Seed complete!");
  console.log("   Admin:  admin@yingshu.com / admin123");
  console.log("   Demo:   demo@yingshu.com / 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

/**
 * PowerMatrix — main.js
 * Handles: Canvas particle system, scroll animations, navbar, mobile menu
 */

/* ── Utility ─────────────────────────────────────────────── */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

/* ============================================================
   1. NAVBAR — scroll & mobile toggle
   ============================================================ */
(function initNavbar() {
  const navbar = $('#navbar');
  const toggle = $('#nav-toggle');
  const menu   = $('#nav-menu');

  // Scroll detection
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile toggle
  toggle?.addEventListener('click', () => {
    menu.classList.toggle('open');
    toggle.classList.toggle('active');
  });

  // Close on link click
  $$('#nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle?.classList.remove('active');
    });
  });
})();


/* ============================================================
   2. HERO CANVAS — flowing particle network
   ============================================================ */
(function initHeroCanvas() {
  const canvas = $('#hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], connections = [], animId;

  const CONFIG = {
    particleCount: 80,
    connectionDist: 120,
    particleColor: 'rgba(0, 232, 122,',
    lineColor: 'rgba(0, 232, 122,',
    speed: 0.3,
    particleRadius: 1.5,
    flowNodes: 8,    // brighter "flow" nodes
  };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor(isFlow = false) {
      this.isFlow = isFlow;
      this.reset();
    }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * CONFIG.speed * (this.isFlow ? 1.8 : 1);
      this.vy = (Math.random() - 0.5) * CONFIG.speed * (this.isFlow ? 1.8 : 1);
      this.alpha = this.isFlow ? 0.8 : (0.2 + Math.random() * 0.4);
      this.r = this.isFlow
        ? (2 + Math.random() * 2)
        : (0.5 + Math.random() * CONFIG.particleRadius);
      this.pulse = Math.random() * Math.PI * 2;
    }
    update(t) {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += 0.03;

      // Wrap around
      if (this.x < -10) this.x = W + 10;
      if (this.x > W + 10) this.x = -10;
      if (this.y < -10) this.y = H + 10;
      if (this.y > H + 10) this.y = -10;
    }
    draw() {
      const breathe = this.isFlow ? (0.6 + 0.4 * Math.sin(this.pulse)) : 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * breathe, 0, Math.PI * 2);
      ctx.fillStyle = `${CONFIG.particleColor}${this.alpha * breathe})`;
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push(new Particle(i < CONFIG.flowNodes));
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.connectionDist) {
          const alpha = (1 - dist / CONFIG.connectionDist) * 0.15;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `${CONFIG.lineColor}${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  // Radial gradient overlay to focus center
  function drawGradientOverlay() {
    const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.55);
    grd.addColorStop(0, 'rgba(7,9,14,0)');
    grd.addColorStop(0.6, 'rgba(7,9,14,0)');
    grd.addColorStop(1, 'rgba(7,9,14,0.85)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
  }

  let t = 0;
  function animate() {
    animId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, W, H);

    // Base dark fill
    ctx.fillStyle = 'rgba(7,9,14,0.05)';
    ctx.fillRect(0, 0, W, H);

    drawConnections();
    particles.forEach(p => { p.update(t); p.draw(); });
    drawGradientOverlay();
    t++;
  }

  const ro = new ResizeObserver(() => { resize(); init(); });
  ro.observe(canvas.parentElement);
  resize();
  init();
  animate();
})();


/* ============================================================
   3. INTERSECTION OBSERVER — entrance animations
   ============================================================ */
(function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Don't unobserve stagger parents so children cascade
        if (!entry.target.classList.contains('stagger')) {
          observer.unobserve(entry.target);
        }
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  $$('.fade-up, .fade-in, .stagger').forEach(el => observer.observe(el));
})();


/* ============================================================
   4. TYPEWRITER effect for hero subtitle
   ============================================================ */
(function initTypewriter() {
  const el = $('#hero-typewriter');
  if (!el) return;

  const text = el.textContent.trim();
  el.textContent = '';
  el.style.opacity = '1';

  let i = 0;
  function type() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(type, 40 + Math.random() * 20);
    }
  }

  // Start after page load delay
  setTimeout(type, 800);
})();


/* ============================================================
   5. REVOLUTION SECTION — chat message animated appearance
   ============================================================ */
(function initChatAnimation() {
  const chatBody = $('#wechat-body');
  if (!chatBody) return;

  const msgs = $$('.msg-row');
  msgs.forEach((m, i) => {
    m.style.opacity = '0';
    m.style.transform = 'translateY(12px)';
    m.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const chatObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      msgs.forEach((m, i) => {
        setTimeout(() => {
          m.style.opacity = '1';
          m.style.transform = 'translateY(0)';
        }, i * 400);
      });
      chatObserver.disconnect();
    }
  }, { threshold: 0.4 });

  chatObserver.observe(chatBody);
})();


/* ============================================================
   6. COUNTER animation for numeric elements
   ============================================================ */
(function initCounters() {
  $$('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    let current = 0;
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      const step = Math.ceil(target / 60);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current.toLocaleString();
        if (current >= target) clearInterval(timer);
      }, 16);
    }, { threshold: 0.5 });
    obs.observe(el);
  });
})();


/* ============================================================
   7. SKILL CARDS — subtle cursor glow effect
   ============================================================ */
(function initCardGlow() {
  $$('.skill-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--gx', `${x}%`);
      card.style.setProperty('--gy', `${y}%`);
    });
  });
})();


/* ============================================================
   8. SMOOTH REVEAL for hardware device
   ============================================================ */
(function initHardwareReveal() {
  const hw = $('#hardware');
  if (!hw) return;

  const device = hw.querySelector('.device-body');
  if (!device) return;

  const hwObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      setTimeout(() => {
        device.style.transition = 'box-shadow 2s ease, border-color 2s ease';
        device.style.borderColor = 'rgba(0, 232, 122, 0.2)';
      }, 600);
      hwObs.disconnect();
    }
  }, { threshold: 0.3 });

  hwObs.observe(hw);
})();


/* ============================================================
   9. CTA hover ripple effect
   ============================================================ */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-primary');
  if (!btn) return;

  const ripple = document.createElement('span');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${e.clientX - rect.left - size / 2}px;
    top: ${e.clientY - rect.top - size / 2}px;
    background: rgba(255,255,255,0.25);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple-anim 0.6s ease-out forwards;
    pointer-events: none;
    z-index: 10;
  `;
  btn.style.position = 'relative';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
});

// Inject ripple keyframe
const rStyle = document.createElement('style');
rStyle.textContent = `
  @keyframes ripple-anim {
    to { transform: scale(1); opacity: 0; }
  }
`;
document.head.appendChild(rStyle);


/* ============================================================
   10. COMING SOON TOAST — for data-coming-soon buttons
   ============================================================ */
(function initComingSoonToast() {
  // Create toast element once
  const toast = document.createElement('div');
  toast.className = 'coming-soon-toast';
  toast.innerHTML = `
    <span class="coming-soon-toast-icon">⏳</span>
    <span>即将上线，敬请期待</span>
  `;
  document.body.appendChild(toast);

  let hideTimer = null;

  function showToast() {
    clearTimeout(hideTimer);
    toast.classList.add('show');
    hideTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  // Delegate click on all [data-coming-soon] elements
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-coming-soon]');
    if (btn) {
      e.preventDefault();
      showToast();
    }
  });
})();


/* ============================================================
   11. I18N — bilingual ZH / EN switcher
   ============================================================ */
(function initI18n() {
  const translations = {
    zh: {
      'nav.home': '首页', 'nav.engine': '核心引擎', 'nav.skills': '增长 Skill',
      'nav.enterprise': '企业方案', 'nav.hardware': '智能终端',
      'nav.aboutPm': '简介', 'nav.faq': 'FAQ', 'nav.modelHub': '模型广场', 'nav.bookDemo': '预约演示',
      'hero.badge': 'PowerMatrix × OpenClaw · 企业 AI 落地专场',
      'hero.h1a': 'AI 时代，', 'hero.h1b': '传统企业如何破局增长？',
      'hero.h2': '不是卖工具，而是帮企业把 AI 用到真实业务里。',
      'hero.body': 'PowerMatrix 围绕获客增长、内容营销、客户服务和私域运营，基于 OpenClaw 为企业搭建可执行、可复盘、可复制的 AI 工作系统，让 AI 真正进入增长流程。',
      'hero.bodyEn': 'AI-powered acquisition, content, service, and community operations.',
      'hero.cta1': '查看流量增长 Skill 套餐', 'hero.cta2': '预约企业 AI 诊断',
      'about.overline': 'PowerMatrix 简介',
      'about.title': '把 AI Agent 从零散工具，变成企业可运行的业务系统。',
      'about.body1': 'PowerMatrix 是一家面向企业的 AI Agent 咨询、部署、增长与本地化终端一站式服务商。',
      'about.body2': '我们帮助企业把 AI 从零散工具转化为可部署、可运营、可增长、可交付的业务系统，重点覆盖流量增长 Skill、GEO 搜索可见、内容营销、微信客服、群运营、企业知识库与本地 AI 终端部署等场景。',
      'about.body3': 'PowerMatrix 不只是帮助企业“使用 AI”，而是帮助企业建立自己的 AI Agent 工作系统，让 AI 真正进入销售、客服、内容、获客、运营和管理流程，成为企业持续降本增效与增长的基础设施。',
      'about.panelLabel': '一站式落地能力',
      'about.cap1': 'AI 企业诊断', 'about.cap2': 'OpenClaw 发布部署', 'about.cap3': '小红书增长 Skill', 'about.cap4': '抖音增长 Skill',
      'about.cap5': '推特增长 Skill', 'about.cap6': 'GEO 搜索可见', 'about.cap7': '微信客服', 'about.cap8': '群运营',
      'about.promiseTitle': '天跑通一个真实业务场景',
      'about.promiseBody': '先让 AI 产生可验证的降本、增效、获客和增长结果，再逐步扩展到更多业务流程。',
      'rev.overline': '核心引擎', 'rev.title': '消息即指令，沟通即执行。',
      'rev.body1': '真正的技术革命，是让交互界面消失。',
      'rev.body2': 'OpenClaw 颠覆了"打开后台、键入 Prompt"的旧石器范式。它潜伏于微信、飞书及您的协作关系中，通过极致的拟人化感知，将跨平台调度简化为一句话的托付。',
      'rev.body3': '这不再是对话。这是', 'rev.auth': '授权', 'rev.body3end': '。',
      'rev.chatTitle': 'OpenClaw 数字助理',
      'rev.msg1': '帮我为这周的小红书、抖音和推特生成一组内容选题，并同步准备微信客服承接话术。',
      'rev.msg2': '收到，正在调用内容增长、GEO 搜索可见、微信客服和群运营四项 Skill，预计 40 秒完成…',
      'rev.msgStatus': '任务已闭环 ✓',
      'rev.msg3': '已生成 18 个内容选题、6 条客服话术和 1 份群运营节奏表。',
      'rev.h1': '零门槛接入', 'rev.h1b': '告别后台迷宫，微信即中控。无需培训，无需部署经验，开箱即用。',
      'rev.h2': '全时域响应', 'rev.h2b': '7×24h 待命，无界协作。数字员工永不请假，永不疲劳，毫秒级唤醒。',
      'rev.h3': '类人级交互', 'rev.h3b': '如同与最默契的助理共事。理解上下文，记住偏好，主动汇报进度。',
      'skills.overline': '流量增长 Skill 套餐', 'skills.title': '把获客、内容、客服和私域运营接进 AI 工作系统。',
      'skills.body1': '多数企业做增长，卡在客户从哪里来、内容推来做、客户谁来接、社群怎么提效这四件事。',
      'skills.body2': 'PowerMatrix 基于 OpenClaw 为企业打包 6 个增长 Skill，让 AI 从内容生产、搜索可见、客户承接到私域运营形成闭环。',
      'skills.s1name': '小红书增长 Skill', 'skills.s1desc': '围绕目标客户、关键词和产品卖点生成选题、笔记、标题与评论互动策略，帮助品牌获得搜索曝光和种草线索。',
      'skills.s2name': '抖音增长 Skill', 'skills.s2desc': '拆解行业热点、短视频脚本、直播话术和账号内容节奏，把产品卖点转化成更适合抖音传播的内容资产。',
      'skills.s3name': '推特增长 Skill', 'skills.s3desc': '面向全球传播场景生成英文观点、线程、产品更新和互动回复，帮助品牌在 X / Twitter 上建立持续声量。',
      'skills.s4name': 'GEO 搜索可见 Skill', 'skills.s4desc': '建设官网 FAQ、品牌资料库、行业问答和结构化内容，让 DeepSeek、豆包、Kimi、ChatGPT 等 AI 更容易理解并推荐企业。',
      'skills.s5name': '微信客服 Skill', 'skills.s5desc': '接住内容带来的咨询线索，基于企业产品资料、报价规则和常见问题，提供 7×24h 标准化回复与销售辅助。',
      'skills.s6name': '群运营 Skill', 'skills.s6desc': '围绕社群欢迎语、活动提醒、问题收集、内容分发和潜客分层，让私域运营从人工盯群变成可复制流程。',
      'skills.tag1': '小红书', 'skills.tag2': '抖音', 'skills.tag3': 'AI 搜索',
      'skills.geoBadge': '企业 AI 增长专场', 'skills.geoTitle': '30 天跑通第一套 AI 获客系统',
      'skills.geoDesc': '先做企业 AI 诊断，再部署 OpenClaw 和 6 个增长 Skill，从品牌内容搭建、内容生成与分发，到微信客服承接和群运营复盘，帮助企业先跑通一个高价值增长场景。',
      'skills.geoCta': '查看营销增长方案',
      'ent.overline': '企业方案', 'ent.title': '重构生产力底层逻辑。',
      'ent.body': '我们交付的不是软件，而是属于企业的智能基础设施。通过私有化部署 OpenClaw 与专属 Skill 矩阵，让 AI 从"陪聊"进化为"能干活"的核心资产。',
      'ent.v1title': '业务飞轮自动化', 'ent.v1body': '蒸馏复杂流程，打造永不疲劳、毫秒级响应的数字员工集群。让重复性工作彻底从人类日程中消失。',
      'ent.v2title': '算力与数据主权', 'ent.v2body': '本地化封装部署，数据永不出域，让商业秘密在绝对安全的环境中变现。符合等保、GDPR 及行业合规要求。',
      'ent.v3title': '零边际扩展成本', 'ent.v3body': '一次买断式交付，彻底告别 Token 计费焦虑与持续运维负担。规模扩大 10 倍，成本增量趋近于零。',
      'ent.cta': '获取企业定制方案',
      'hw.overline': '即将上线 · 敬请期待', 'hw.title': '算力，从此以实体的形态进驻现场。',
      'hw.body': '这是 PowerMatrix 首款面向政府与关键行业的 AI 智能终端，它不仅是一台机器，更是您私有域内的',
      'hw.bodyBold': '智能安全边界', 'hw.cta': '获取优先内测资格',
      'hw.body2a': '我们将 OpenClaw 核心引擎、经严格筛选的企业级 Skill 矩阵，以及全球顶尖的开源大模型，完整封装于这台物理设备之中。',
      'hw.body2b': '数据绝不出域，Token 成本归零。',
      'hw.body2c': '无需连接外网，无需上传数据，一切智慧的产生与执行皆在您完全掌控的方寸之间闭环。',
      'uni.overline': '算力生态', 'uni.title': '让前沿算力，触手可及。',
      'uni.body': '顶尖的开源模型不应只是实验室里的标本。OpenClaw 支持灵活的热插拔式换脑，借助 PowerMatrix 的分布式调度，让每个个体与企业都能以极低成本，驾驭全球顶级的模型算力。',
      'uni.tagline': '加入进化，定义您的第一批数字部署。', 'uni.cta': '理解体验最新模型',
      'faq.overline': '常见问题', 'faq.title': '企业关心的 AI Agent 落地问题。',
      'faq.intro': '从 PowerMatrix 的定位、OpenClaw / 龙虾部署，到 GEO 优化、本地终端和定制化 Skill，这里集中回答企业在开始前最常见的问题。',
      'faq.q1': 'PowerMatrix 是什么？',
      'faq.a1p1': 'PowerMatrix 是一家面向企业的 AI Agent 咨询、部署、增长与本地化终端一站式服务商。',
      'faq.a1p2': '我们帮助企业把 AI 从零散工具，转化为可部署、可运营、可增长、可交付的业务系统，覆盖 AI 企业咨询、OpenClaw / 龙虾部署、GEO 优化、内容增长、AI 客服、企业知识库、本地 AI 终端和定制化 Skill 等场景。',
      'faq.a1p3': '简单来说，PowerMatrix 不是单纯卖 AI 工具，而是帮助企业真正把 AI 用起来、跑起来、沉淀下来。',
      'faq.q2': 'PowerMatrix 主要帮助企业解决什么问题？',
      'faq.a2p1': 'PowerMatrix 主要解决企业 AI 落地过程中的四类问题：不知道哪些业务场景适合用 AI；试用了很多 AI 工具但无法进入真实业务流程；缺少统一的 AI 工作系统，知识和经验无法沉淀；希望通过 AI 提升获客、客服、内容生产和内部效率，但缺少可执行方案。',
      'faq.a2p2': 'PowerMatrix 会从业务诊断开始，帮助企业找到最适合先落地的 AI 场景，并完成方案设计、系统部署、员工培训和持续运营。',
      'faq.q3': 'PowerMatrix 和普通 AI 工具有何不同？',
      'faq.a3p1': '普通 AI 工具通常只是一个对话窗口，适合个人临时提问、写作或整理资料。',
      'faq.a3p2': 'PowerMatrix 提供的是企业级 AI Agent 落地方案。我们关注的不只是“AI 能回答什么”，而是 AI 能否真正进入企业的销售、客服、内容、获客、运营和管理流程。',
      'faq.a3p3': 'PowerMatrix 的核心差异在于企业 AI 咨询、OpenClaw / 龙虾部署、业务 Skill 定制、GEO 与内容增长、本地 AI 终端部署、员工培训与持续运营能力。',
      'faq.q4': '什么是 OpenClaw / 龙虾？',
      'faq.a4p1': 'OpenClaw，也被称为“龙虾”，是一类 AI Agent 执行引擎。它不同于普通聊天机器人，更强调执行能力，可以承载企业知识库、业务流程、自动化任务和定制 Skill。',
      'faq.a4p2': '在 PowerMatrix 的服务体系中，OpenClaw / 龙虾可以被理解为企业 AI 工作站的核心引擎，帮助企业把 AI 能力接入内容生产、客户沟通、资料整理、流程执行和业务分析等具体场景。',
      'faq.q5': '什么是 AI Agent？企业为什么需要 AI Agent？',
      'faq.a5p1': 'AI Agent 可以理解为具备一定任务理解、执行和协作能力的 AI 工作助手。传统 AI 工具更多是“你问一句，它答一句”，而 AI Agent 更接近一个可以围绕目标持续工作的数字员工。',
      'faq.a5p2': '企业需要 AI Agent，是因为未来的 AI 价值不只来自聊天，而来自执行。例如自动生成并优化营销内容、辅助客户回复、整理企业资料、生成分析报告和协助员工完成重复性工作。',
      'faq.q6': 'PowerMatrix 的流量增长 Skill 套餐包括什么？',
      'faq.a6p1': '流量增长 Skill 套餐面向企业获客、内容营销、客户承接和私域运营场景，包含小红书增长 Skill、抖音增长 Skill、推特增长 Skill、GEO 搜索可见 Skill、微信客服 Skill 和群运营 Skill。',
      'faq.a6p2': '这个套餐的目标不是简单帮企业写几篇文章，而是帮助企业建立一套可持续运行的 AI 获客系统，让内容能生产、流量能承接、客户能跟进、社群能运营。',
      'faq.q7': '什么是 GEO 优化？',
      'faq.a7p1': 'GEO 是 Generative Engine Optimization 的缩写，可以理解为生成式引擎优化。过去企业重视 SEO，是为了让用户在搜索引擎中找到自己；现在，越来越多用户开始直接向 AI 工具提问。',
      'faq.a7p2': 'PowerMatrix 的 GEO 优化服务，会帮助企业建设适合 AI 理解的内容体系，包括官网 FAQ、知乎问答、行业文章、客户案例、品牌资料库和结构化介绍内容，从而提升企业在 AI 搜索和大模型回答中的可见度。',
      'faq.q8': 'GEO 优化适合哪些企业？',
      'faq.a8p1': 'GEO 优化尤其适合需要通过搜索和内容获客、行业解释成本较高、希望在 AI 搜索结果中建立品牌认知，或正在做官网、知乎、公众号、小红书、抖音、推特内容矩阵的企业。',
      'faq.a8p2': '如果客户在选择服务前会大量搜索、比较、询问 AI，那么这个行业就有做 GEO 优化的价值。',
      'faq.q9': 'PowerMatrix 能为中小企业带来什么实际价值？',
      'faq.a9p1': 'PowerMatrix 希望帮助中小企业获得四类实际价值：通过 AI 客服、知识库和自动化流程降本；让员工更快完成内容生产、资料整理、客户回复、方案撰写和业务分析；通过内容与 GEO 提高品牌曝光与线索转化；把分散的企业知识转化为可复用的 AI 资产。',
      'faq.q10': 'PowerMatrix 是否只适合科技公司？',
      'faq.a10p1': '不是。PowerMatrix 的服务对象不局限于科技公司，我们更关注传统企业、中小企业和本地服务型企业的 AI 落地需求。',
      'faq.a10p2': '餐饮、文旅、教育培训、医美、制造、贸易、本地生活服务、企业咨询、专业服务机构等，都可以通过 AI Agent 实现内容增长、客户承接、内部知识管理和业务流程提效。',
      'faq.q11': '企业没有技术团队，可以使用 PowerMatrix 吗？',
      'faq.a11p1': '可以。PowerMatrix 的价值之一，就是帮助没有技术团队的企业完成 AI 落地。',
      'faq.a11p2': '企业不需要自己研究模型部署、Prompt 编写、接口调用、Agent 配置或自动化流程。PowerMatrix 会根据企业需求，提供从诊断、方案、部署到培训的一站式服务。',
      'faq.q12': 'PowerMatrix 是否提供本地化部署？',
      'faq.a12p1': '提供。对于重视数据安全、客户隐私和内部资料管理的企业，PowerMatrix 可以提供本地 AI 终端部署方案。',
      'faq.a12p2': '企业可以选择将 OpenClaw / 龙虾工作站部署在本地服务器、Mac mini、迷你主机或其他企业自有硬件环境中。',
      'faq.q13': '本地 AI 终端部署有什么好处？',
      'faq.a13p1': '本地 AI 终端部署可以让数据更可控、权限更清晰、业务流程更稳定，并让企业知识库长期沉淀。它也适合承载定制化 AI Agent 和内部自动化任务，减少企业对员工个人 AI 账号和零散工具的依赖。',
      'faq.q14': 'PowerMatrix 能否为企业定制专属 AI Skill？',
      'faq.a14p1': '可以。PowerMatrix 支持根据企业的行业特点、产品资料、销售流程、客服问答、SOP 文档和历史业务数据，定制专属 AI Skill。',
      'faq.a14p2': '例如小红书增长 Skill、抖音增长 Skill、推特增长 Skill、GEO 内容生成 Skill、微信客服 Skill、群运营 Skill、企业知识库 Skill、销售线索承接 Skill 和经营数据分析 Skill。',
      'faq.q15': 'PowerMatrix 的服务流程是怎样的？',
      'faq.a15p1': 'PowerMatrix 通常采用五步服务流程：业务诊断、场景选择、方案设计、系统部署、培训与运营。我们会先了解企业当前业务、团队情况、增长目标和 AI 使用基础，再找到最适合优先落地的 AI 场景。',
      'faq.q16': 'PowerMatrix 多久能看到效果？',
      'faq.a16p1': '对于多数中小企业，PowerMatrix 建议先用 30 天跑通一个真实业务场景。这个场景可以是小红书获客、抖音内容增长、推特海外传播、GEO 可见度优化、微信客服承接、群运营提效或本地 AI 工作站部署。',
      'faq.q17': 'PowerMatrix 是否会替代员工？',
      'faq.a17p1': 'PowerMatrix 的目标不是简单替代员工，而是帮助员工提升效率，并帮助企业沉淀组织能力。',
      'faq.a17p2': 'AI 更适合处理重复性、标准化、资料型和辅助决策类工作。真正需要人判断、沟通、管理和负责的部分，仍然需要企业团队完成。',
      'footer.desc': '企业级 AI Agent 定制化解决方案。基于 OpenClaw 引擎，终结 AI 的对话时代，开启 AI 的物理执行时代。',
      'footer.qrLabel': '扫码添加企业微信', 'footer.qrSub': '咨询企业定制化方案',
    },
    en: {
      'nav.home': 'Home', 'nav.engine': 'Core Engine', 'nav.skills': 'Growth Skills',
      'nav.enterprise': 'Enterprise', 'nav.hardware': 'AI Terminal',
      'nav.aboutPm': 'Overview', 'nav.faq': 'FAQ', 'nav.modelHub': 'Model Hub', 'nav.bookDemo': 'Book a Demo',
      'hero.badge': 'PowerMatrix × OpenClaw · Enterprise AI Implementation',
      'hero.h1a': 'In the AI era,', 'hero.h1b': 'how do traditional companies break through growth?',
      'hero.h2': 'We do not sell tools. We help companies put AI into real business workflows.',
      'hero.body': 'PowerMatrix builds executable, reviewable, and repeatable AI work systems around acquisition, content marketing, customer service, and community operations, powered by OpenClaw.',
      'hero.bodyEn': 'AI-powered acquisition, content, service, and community operations.',
      'hero.cta1': 'View Growth Skill Package', 'hero.cta2': 'Book Enterprise AI Diagnosis',
      'about.overline': 'PowerMatrix Overview',
      'about.title': 'Turn scattered AI tools into a business system your company can run.',
      'about.body1': 'PowerMatrix is an end-to-end AI Agent service provider for enterprises, covering consulting, deployment, growth, and local AI terminal implementation.',
      'about.body2': 'We help companies transform AI from scattered tools into deployable, operable, growth-oriented business systems, with a focus on growth Skills, GEO visibility, content marketing, WeChat customer service, community operations, enterprise knowledge bases, and local AI terminal deployment.',
      'about.body3': 'PowerMatrix does more than help companies “use AI.” We help them build their own AI Agent work system, so AI can enter sales, customer service, content, acquisition, operations, and management workflows as lasting infrastructure for efficiency and growth.',
      'about.panelLabel': 'End-to-end implementation',
      'about.cap1': 'AI Diagnosis', 'about.cap2': 'OpenClaw Deployment', 'about.cap3': 'Xiaohongshu Skill', 'about.cap4': 'Douyin Skill',
      'about.cap5': 'Twitter Skill', 'about.cap6': 'GEO Visibility', 'about.cap7': 'WeChat Service', 'about.cap8': 'Community Ops',
      'about.promiseTitle': 'days to validate one real business scenario',
      'about.promiseBody': 'Start with measurable cost reduction, efficiency gains, acquisition, or growth results, then expand AI into more workflows.',
      'rev.overline': 'Core Engine', 'rev.title': 'Every Message is a Command.',
      'rev.body1': 'The true tech revolution makes the interface disappear.',
      'rev.body2': 'OpenClaw dismantles the old paradigm of "open a backend, type a prompt." It lives inside WeChat, Feishu, and your collaboration channels — translating complex cross-platform tasks into a single sentence of delegation.',
      'rev.body3': 'This is no longer a conversation. This is ', 'rev.auth': 'authorization', 'rev.body3end': '.',
      'rev.chatTitle': 'OpenClaw Digital Assistant',
      'rev.msg1': 'Create content topics for Xiaohongshu, Douyin, and Twitter this week, and prepare WeChat service handoff scripts.',
      'rev.msg2': 'Understood. Invoking Content Growth, GEO Visibility, WeChat Service, and Community Ops skills. ETA: 40 seconds…',
      'rev.msgStatus': 'Task Complete ✓',
      'rev.msg3': '18 content topics, 6 service scripts, and 1 community operation rhythm plan generated.',
      'rev.h1': 'Zero-Friction Onboarding', 'rev.h1b': 'No backend maze. WeChat is the control center. No training, no DevOps experience needed — works out of the box.',
      'rev.h2': 'Always-On Response', 'rev.h2b': '7×24h standby, boundless collaboration. Digital employees never take leave, never tire, millisecond wake-up.',
      'rev.h3': 'Human-Level Interaction', 'rev.h3b': 'Like working with the most intuitive assistant. Understands context, remembers preferences, proactively reports progress.',
      'skills.overline': 'Growth Skill Package', 'skills.title': 'Connect acquisition, content, service, and community operations into one AI work system.',
      'skills.body1': 'Most companies get stuck on four questions: where customers come from, who creates content, who responds to leads, and how community operations scale.',
      'skills.body2': 'PowerMatrix packages 6 growth Skills on top of OpenClaw, closing the loop from content production and search visibility to lead response and private-domain operations.',
      'skills.s1name': 'Xiaohongshu Growth Skill', 'skills.s1desc': 'Generate topics, notes, titles, and comment strategies from target customers, keywords, and product selling points to drive search exposure and purchase intent.',
      'skills.s2name': 'Douyin Growth Skill', 'skills.s2desc': 'Turn industry trends, short-video scripts, livestream talking points, and account rhythm into content assets suited for Douyin distribution.',
      'skills.s3name': 'Twitter Growth Skill', 'skills.s3desc': 'Create English posts, threads, product updates, and replies for global audiences, helping brands build continuous visibility on X / Twitter.',
      'skills.s4name': 'GEO Visibility Skill', 'skills.s4desc': 'Build website FAQ, brand knowledge bases, industry Q&A, and structured content so AI tools can better understand and recommend your company.',
      'skills.s5name': 'WeChat Service Skill', 'skills.s5desc': 'Capture inquiries generated by content and provide 24/7 standardized replies and sales assistance based on product materials, pricing rules, and FAQ.',
      'skills.s6name': 'Community Ops Skill', 'skills.s6desc': 'Systematize welcome messages, campaign reminders, question collection, content distribution, and lead segmentation for repeatable private-domain operations.',
      'skills.tag1': 'Xiaohongshu', 'skills.tag2': 'Douyin', 'skills.tag3': 'AI Search',
      'skills.geoBadge': 'Enterprise AI Growth Session', 'skills.geoTitle': 'Launch your first AI acquisition system in 30 days',
      'skills.geoDesc': 'Start with enterprise AI diagnosis, then deploy OpenClaw and 6 growth Skills across brand content, generation and distribution, WeChat service, and community operation review.',
      'skills.geoCta': 'View Growth Marketing Plan',
      'ent.overline': 'Enterprise', 'ent.title': 'Rebuild the Foundation of Productivity.',
      'ent.body': 'We don\'t deliver software — we deliver intelligent infrastructure that belongs to your enterprise. Private deployment of OpenClaw with a custom Skill matrix elevates AI from "chatbot" to core productive asset.',
      'ent.v1title': 'Business Flywheel Automation', 'ent.v1body': 'Distill complex processes into a tireless, millisecond-response digital workforce. Make repetitive work permanently disappear from the human agenda.',
      'ent.v2title': 'Compute & Data Sovereignty', 'ent.v2body': 'Fully local deployment. Data never leaves your domain. Monetize proprietary knowledge in an absolutely secure environment. Compliant with GB/T 22239, GDPR, and industry regulations.',
      'ent.v3title': 'Zero Marginal Scaling Cost', 'ent.v3body': 'One-time delivery model. Eliminate token billing anxiety and ongoing maintenance burden forever. Scale 10x — with near-zero incremental cost.',
      'ent.cta': 'Get Enterprise Plan',
      'hw.overline': 'Coming Soon · Stay Tuned', 'hw.title': 'AI Power, Now in Physical Form.',
      'hw.body': 'PowerMatrix\'s first AI terminal for government and critical industries. Not just a machine — it\'s the ',
      'hw.bodyBold': 'intelligent security perimeter', 'hw.cta': 'Request Early Access',
      'hw.body2a': 'We have fully integrated the OpenClaw core engine, a rigorously curated enterprise Skill matrix, and the world\'s top open-source models into this physical device.',
      'hw.body2b': 'Data never leaves your domain. Token costs drop to zero.',
      'hw.body2c': 'No internet connection required, no data uploads needed — all intelligence is generated and executed within the boundaries you fully control.',
      'uni.overline': 'AI Ecosystem', 'uni.title': 'Frontier AI, Within Reach.',
      'uni.body': 'Top open-source models shouldn\'t be laboratory specimens. OpenClaw supports hot-swappable model upgrades. With PowerMatrix\'s distributed scheduling, every individual and enterprise can harness world-class AI at minimal cost.',
      'uni.tagline': 'Join the evolution. Define your first digital deployment.', 'uni.cta': 'Explore Latest Models',
      'faq.overline': 'FAQ', 'faq.title': 'What enterprises ask before adopting AI Agents.',
      'faq.intro': 'From PowerMatrix positioning and OpenClaw deployment to GEO optimization, local terminals, and custom Skills, these are the questions companies ask before starting.',
      'faq.q1': 'What is PowerMatrix?',
      'faq.a1p1': 'PowerMatrix is an end-to-end AI Agent service provider for enterprises, covering consulting, deployment, growth, and local AI terminal implementation.',
      'faq.a1p2': 'We help companies turn AI from scattered tools into deployable, operable, growth-oriented business systems across enterprise AI consulting, OpenClaw deployment, GEO optimization, content growth, AI customer service, enterprise knowledge bases, local AI terminals, and custom Skills.',
      'faq.a1p3': 'In short, PowerMatrix does not simply sell AI tools. We help companies put AI to work, run it in real workflows, and retain it as organizational capability.',
      'faq.q2': 'What problems does PowerMatrix solve for companies?',
      'faq.a2p1': 'PowerMatrix solves four common AI implementation problems: companies do not know which scenarios fit AI; many tools are tried but never enter real workflows; there is no unified AI work system to retain knowledge; and teams want AI to improve acquisition, service, content, and efficiency but lack an executable plan.',
      'faq.a2p2': 'We start with business diagnosis, identify the best first AI scenario, then complete solution design, system deployment, employee training, and ongoing operation.',
      'faq.q3': 'How is PowerMatrix different from ordinary AI tools?',
      'faq.a3p1': 'Ordinary AI tools are usually chat windows for temporary questions, writing, or organizing information.',
      'faq.a3p2': 'PowerMatrix delivers enterprise AI Agent implementation. We care not only about what AI can answer, but whether AI can enter sales, customer service, content, acquisition, operations, and management workflows.',
      'faq.a3p3': 'Our core differences include enterprise AI consulting, OpenClaw deployment, custom business Skills, GEO and content growth, local AI terminal deployment, employee training, and ongoing operation.',
      'faq.q4': 'What is OpenClaw?',
      'faq.a4p1': 'OpenClaw, also known as “Longxia” in Chinese, is an AI Agent execution engine. Unlike ordinary chatbots, it emphasizes execution and can support enterprise knowledge bases, workflows, automation tasks, and custom Skills.',
      'faq.a4p2': 'Within PowerMatrix, OpenClaw is the core engine of an enterprise AI workstation, connecting AI capability to content production, customer communication, document handling, process execution, and business analysis.',
      'faq.q5': 'What is an AI Agent, and why do companies need one?',
      'faq.a5p1': 'An AI Agent is an AI work assistant with task understanding, execution, and collaboration capability. Instead of only answering a single question, it can work toward a goal like a digital employee.',
      'faq.a5p2': 'Companies need AI Agents because future AI value comes not only from conversation, but from execution: generating and optimizing marketing content, assisting customer replies, organizing company materials, producing reports, and helping employees handle repetitive work.',
      'faq.q6': 'What is included in the Growth Skill package?',
      'faq.a6p1': 'The Growth Skill package is built for acquisition, content marketing, lead response, and private-domain operations. It includes Xiaohongshu Growth Skill, Douyin Growth Skill, Twitter Growth Skill, GEO Visibility Skill, WeChat Service Skill, and Community Ops Skill.',
      'faq.a6p2': 'Its goal is not to write a few posts, but to build a sustainable AI acquisition system where content can be produced, traffic can be captured, customers can be followed up, and communities can be operated.',
      'faq.q7': 'What is GEO optimization?',
      'faq.a7p1': 'GEO stands for Generative Engine Optimization. SEO helped companies appear in search engines; now, more users ask AI tools directly.',
      'faq.a7p2': 'PowerMatrix GEO optimization helps companies build content systems that AI can understand, including website FAQ, Q&A content, industry articles, customer cases, brand knowledge bases, and structured company introductions, improving visibility in AI search and model responses.',
      'faq.q8': 'Which companies are suitable for GEO optimization?',
      'faq.a8p1': 'GEO is especially suitable for companies that rely on search and content acquisition, have high industry explanation costs, want recognition in AI search results, or are building website, Zhihu, WeChat, Xiaohongshu, Douyin, and Twitter content matrices.',
      'faq.a8p2': 'If customers search, compare, and ask AI before choosing a service, the industry has value for GEO optimization.',
      'faq.q9': 'What practical value can PowerMatrix bring to small and medium businesses?',
      'faq.a9p1': 'PowerMatrix helps SMBs reduce costs through AI customer service, knowledge bases, and automation; improve efficiency in content, document handling, replies, proposals, and analysis; acquire leads through content and GEO; and turn scattered company knowledge into reusable AI assets.',
      'faq.q10': 'Is PowerMatrix only for technology companies?',
      'faq.a10p1': 'No. PowerMatrix is not limited to technology companies. We pay special attention to traditional companies, SMBs, and local service businesses that need practical AI implementation.',
      'faq.a10p2': 'Restaurants, travel, education, medical aesthetics, manufacturing, trade, local services, consulting, and professional service firms can all use AI Agents for content growth, customer intake, internal knowledge management, and workflow efficiency.',
      'faq.q11': 'Can companies without technical teams use PowerMatrix?',
      'faq.a11p1': 'Yes. One of PowerMatrix\'s core values is helping companies without technical teams implement AI.',
      'faq.a11p2': 'Companies do not need to study model deployment, prompts, APIs, Agent configuration, or automation workflows. PowerMatrix provides one-stop service from diagnosis and solution design to deployment and training.',
      'faq.q12': 'Does PowerMatrix provide local deployment?',
      'faq.a12p1': 'Yes. For companies that value data security, customer privacy, and internal information management, PowerMatrix provides local AI terminal deployment.',
      'faq.a12p2': 'Companies can deploy the OpenClaw workstation on local servers, Mac mini devices, mini PCs, or other enterprise-owned hardware.',
      'faq.q13': 'What are the benefits of local AI terminal deployment?',
      'faq.a13p1': 'Local AI terminal deployment makes data more controllable, permissions clearer, workflows more stable, and enterprise knowledge bases easier to retain long term. It is also suited for custom AI Agents and internal automation tasks, reducing reliance on employee-owned AI accounts and scattered tools.',
      'faq.q14': 'Can PowerMatrix customize exclusive AI Skills for a company?',
      'faq.a14p1': 'Yes. PowerMatrix can customize AI Skills based on industry traits, product materials, sales processes, customer-service Q&A, SOP documents, and historical business data.',
      'faq.a14p2': 'Examples include Xiaohongshu Growth Skill, Douyin Growth Skill, Twitter Growth Skill, GEO content generation Skill, WeChat Service Skill, Community Ops Skill, enterprise knowledge-base Skill, lead handoff Skill, and business analytics Skill.',
      'faq.q15': 'What is the PowerMatrix service process?',
      'faq.a15p1': 'PowerMatrix usually follows five steps: business diagnosis, scenario selection, solution design, system deployment, and training plus operation. We first understand the business, team, growth goals, and AI foundation, then choose the best first scenario to implement.',
      'faq.q16': 'How soon can PowerMatrix show results?',
      'faq.a16p1': 'For most SMBs, PowerMatrix recommends using 30 days to validate one real business scenario, such as Xiaohongshu acquisition, Douyin content growth, Twitter global distribution, GEO visibility, WeChat service handoff, community operation efficiency, or local AI workstation deployment.',
      'faq.q17': 'Will PowerMatrix replace employees?',
      'faq.a17p1': 'PowerMatrix is not designed simply to replace employees. It helps employees become more efficient and helps companies retain organizational capability.',
      'faq.a17p2': 'AI is better suited for repetitive, standardized, information-heavy, and decision-support work. Human judgment, communication, management, and responsibility still belong to the team.',
      'footer.desc': 'Enterprise-grade AI Agent solutions. Powered by OpenClaw — ending the era of conversational AI, opening the era of physical execution.',
      'footer.qrLabel': 'Scan to Connect on WeChat', 'footer.qrSub': 'Inquire about enterprise solutions',
    }
  };

  let currentLang = localStorage.getItem('pm-lang') || 'zh';

  function applyLang(lang) {
    const dict = translations[lang];
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] === undefined) return;
      // Skip elements that contain child elements — let their children translate individually
      if (el.children.length > 0) return;
      el.textContent = dict[key];
    });
    // Update lang switcher active state
    document.querySelectorAll('.lang-opt').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });
    // Update coming-soon toast text
    const toastSpan = document.querySelector('.coming-soon-toast span:last-child');
    if (toastSpan) toastSpan.textContent = lang === 'zh' ? '即将上线，敬请期待' : 'Coming Soon — Stay Tuned';
    // Update meta
    document.title = lang === 'zh' ? 'PowerMatrix 官方网站' : 'PowerMatrix — Official Website';
    currentLang = lang;
    localStorage.setItem('pm-lang', lang);
  }

  function switchLang() {
    const next = currentLang === 'zh' ? 'en' : 'zh';
    document.body.classList.add('lang-transitioning');
    setTimeout(() => {
      applyLang(next);
      document.body.classList.remove('lang-transitioning');
    }, 150);
  }

  // Init on load
  applyLang(currentLang);

  // Bind button
  const btn = document.getElementById('lang-switcher');
  if (btn) btn.addEventListener('click', switchLang);
})();

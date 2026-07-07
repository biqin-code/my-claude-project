/**
 * 财务管理App - 导航组件
 * 提供页面间导航和路由功能
 */

const Navigation = {
  // 页面映射
  pages: {
    login: '../pages/login.html',
    register: '../pages/register.html',
    dashboard: '../pages/dashboard.html',
    transactions: '../pages/transactions.html',
    statistics: '../pages/statistics.html',
    profile: '../pages/profile.html'
  },

  // 底部导航当前激活状态
  currentPage: null,

  /**
   * 初始化导航
   * @param {string} activePage - 当前页面名称
   */
  init(activePage) {
    this.currentPage = activePage;
    this.updateBottomNav();
    this.updateSideNav();
  },

  /**
   * 更新底部导航激活状态
   */
  updateBottomNav() {
    const navLinks = document.querySelectorAll('.bottom-nav a, .mobile-nav a');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (this.isActivePage(href, this.currentPage)) {
        link.classList.add('bg-primary-container', 'text-on-primary-container');
        link.classList.remove('text-on-surface-variant');
      }
    });
  },

  /**
   * 更新侧边导航激活状态
   */
  updateSideNav() {
    const navLinks = document.querySelectorAll('.side-nav a, aside nav a');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (this.isActivePage(href, this.currentPage)) {
        link.classList.add('bg-primary-container', 'text-on-primary-container', 'rounded-full', 'font-semibold');
        link.classList.remove('text-on-surface-variant', 'hover:bg-surface-variant');
      }
    });
  },

  /**
   * 判断链接是否对应当前页面
   */
  isActivePage(href, currentPage) {
    if (!href || href === '#') return false;
    const pageMap = {
      'dashboard': ['dashboard.html', 'index.html', '../pages/dashboard.html', 'pages/dashboard.html'],
      'transactions': ['transactions.html', 'receipt_long', 'list_alt'],
      'statistics': ['statistics.html', 'analytics', 'pie_chart'],
      'profile': ['profile.html', 'person', 'account']
    };

    for (const [page, patterns] of Object.entries(pageMap)) {
      if (page === currentPage) {
        for (const pattern of patterns) {
          if (href.includes(pattern)) return true;
        }
      }
    }
    return false;
  },

  /**
   * 跳转到指定页面
   */
  navigateTo(page) {
    if (this.pages[page]) {
      window.location.href = this.pages[page];
    }
  },

  /**
   * 获取URL参数
   */
  getQueryParam(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  }
};

// 导出给全局使用
window.Navigation = Navigation;
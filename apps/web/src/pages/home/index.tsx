import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useAuthStoreShallow } from '@refly-packages/ai-workspace-common/stores/auth';
import { Button } from 'antd';
import './index.scss';

// 导入本地logo图片
import logoImage from '../../../imag/logo.png';

function Home() {
  const { t } = useTranslation();
  const { setLoginModalOpen } = useAuthStoreShallow((state) => ({
    setLoginModalOpen: state.setLoginModalOpen,
  }));

  useEffect(() => {
    document.querySelector('html')!.style.scrollBehavior = 'auto';
    window.scroll({ top: 0 });
    document.querySelector('html')!.style.scrollBehavior = '';
  }, [location.pathname]); // triggered on route change

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#FFFFFF]">
      <Helmet>
        <title>{t('landingPage.slogan')} · 万峰白板</title>
        <meta name="description" content={t('landingPage.description')} />
      </Helmet>

      {/* 简化的导航栏 */}
      <nav className="navbar">
        <div className="logo">
          <img src="/imag/logo.png" alt="Refly Logo" className="h-8 w-8" />
          <span>万峰白板-智慧教学平台</span>
        </div>
        <Button 
          type="primary" 
          onClick={() => setLoginModalOpen(true)}
          className="login-button"
        >
          登录
        </Button>
      </nav>

      {/* 主要内容 */}
      <main className="grow">
        {/* 英雄区域 */}
        <section className="hero">
          <h1>智慧教学，AI赋能</h1>
          <p>让课堂互动更智能，学习体验更丰富</p>
          <Button 
            type="primary" 
            size="large"
            onClick={() => setLoginModalOpen(true)}
            className="cta-button"
          >
            开始使用
          </Button>
        </section>
        
        {/* 万峰白板展示 */}
        <section className="feature whiteboard">
          <div className="feature-image">
            <img 
              src="https://static.refly.ai/landing/generateOutline.webp" 
              alt="万峰智慧白板" 
              className="feature-img"
            />
          </div>
          <div className="feature-text">
            <h2>万峰智慧白板</h2>
            <p>集成多媒体资源，支持实时互动，让教学更生动</p>
            <ul className="feature-list">
              <li>
                <span className="check-icon">✓</span>
                <span>支持多种媒体格式，轻松导入教学资源</span>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <span>实时协作功能，师生互动无障碍</span>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <span>智能内容管理，教学资料一目了然</span>
              </li>
            </ul>
          </div>
        </section>
        
        {/* 智慧黑板展示 */}
        <section className="feature blackboard reversed">
          <div className="feature-text">
            <h2>学校智慧黑板</h2>
            <p>传统与现代的完美结合，支持手写识别和内容保存</p>
            <ul className="feature-list">
              <li>
                <span className="check-icon">✓</span>
                <span>智能手写识别，将板书转为数字内容</span>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <span>课堂内容自动保存，方便课后复习</span>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <span>多种教学工具，满足不同学科需求</span>
              </li>
            </ul>
          </div>
          <div className="feature-image">
            <img 
              src="https://static.refly.ai/landing/research.webp" 
              alt="学校智慧黑板" 
              className="feature-img"
            />
          </div>
        </section>
        
        {/* AI回答画布展示 */}
        <section className="feature ai-canvas">
          <div className="feature-image">
            <img 
              src="https://static.refly.ai/landing/generateArticle.webp" 
              alt="多媒体AI回答画布" 
              className="feature-img"
            />
          </div>
          <div className="feature-text">
            <h2>多媒体AI回答画布</h2>
            <p>实时解答学生疑问，提供个性化学习支持</p>
            <ul className="feature-list">
              <li>
                <span className="check-icon">✓</span>
                <span>智能问答系统，即时解决学习疑惑</span>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <span>多媒体内容支持，图文声像结合解答</span>
              </li>
              <li>
                <span className="check-icon">✓</span>
                <span>个性化学习路径，适应不同学习进度</span>
              </li>
            </ul>
          </div>
        </section>

        {/* 号召行动区域 */}
        <section className="cta-section">
          <h2>立即体验智慧教学新方式</h2>
          <p>加入我们，开启AI赋能的教育新时代</p>
          <Button 
            type="primary" 
            size="large"
            onClick={() => setLoginModalOpen(true)}
            className="cta-button"
          >
            免费试用
          </Button>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="footer">
        <p>© 2023 Refly智慧教学平台 | 技术支持</p>
      </footer>
    </div>
  );
}

export default Home;

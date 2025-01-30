import React from 'react';
import './indexPage.css'; // 假设有一个对应的CSS文件

const HomePage = () => {
  return (
    <div className="home-page">
      <header className="header">
        <h1>Web音视频处理工具</h1>
        <p>一站式在线音视频处理，简单高效，无需下载！</p>
      </header>

      <section className="features">
        <h2>主要功能</h2>
        <div className="feature-list">
          <div className="feature">
            <h3>音视频预览</h3>
            <ul>
              <li>音频解码; 将音频解码到浏览器预览</li>
              <li>视频解码：将视频解码到浏览器预览,支持倍速</li>
              {/* <li>视频合并：将多个视频片段合并成一个完整视频。</li>
              <li>视频添加水印：为视频添加文字、图片水印，保护版权。</li>
              <li>视频提取音频：从视频中提取音频，保存为MP3、WAV等格式。</li> */}
            </ul>
          </div>
          <div className="feature">
            <h3>音视频剪辑</h3>
            <ul>
              <li>简单剪辑：提供音视频简单剪辑合成</li>
              <li>音视频轨道分离：将视频分为音频+视频</li>
              <li>缩略图：获取关键帧或自定义帧</li>
              <li>音频合成：提供叠加或拼接两种合成方式</li>
            </ul>
          </div>
          {/* <div className="feature">
            <h3>音视频剪辑</h3>
            <ul>
              <li>简单剪辑：提供音视频简单剪辑合成</li>
              <li>音视频轨道分离：将视频分为音频+视频</li>
              <li>缩略图：获取关键帧或自定义帧</li>
              <li>音频合成：提供叠加或拼接两种合成方式</li>
            </ul>
          </div> */}
          ........
        </div>
      </section>

      <section className="advantages">
        <h2>优势</h2>
        <ul>
          <li>在线处理：无需下载安装软件，打开浏览器即可使用。</li>
          <li>操作简单：界面简洁直观，即使是新手也能轻松上手。</li>
          <li>高效快捷：采用先进的处理技术，快速完成音视频处理。</li>
          <li>安全可靠：所有操作均在浏览器端完成，保障您的数据安全。</li>
          <li>完全免费：所有功能免费使用，无需任何付费。</li>
        </ul>
      </section>

      {/* <section className="use-cases">
        <h2>适用场景</h2>
        <ul>
          <li>自媒体工作者：快速处理视频素材，制作精彩内容。</li>
          <li>学生党：剪辑课程视频，制作学习资料。</li>
          <li>普通用户：压缩视频大小，方便分享给朋友。</li>
        </ul>
      </section> */}

      <footer className="footer">
        <p>立即体验，开启您的音视频处理之旅吧！</p>
        <p>技术支持：如果您有任何问题或建议，请联系我们：[1813708165@qq.com]</p>
        <p>版本信息：当前版本：v1.0.0 | 更新日期：2024-10-26</p>
        <p>免责声明：本工具仅提供音视频处理服务，请勿用于任何非法用途。</p>
        <p>感谢您使用我们的Web音视频处理工具！</p>
      </footer>
    </div>
  );
};

export default HomePage;
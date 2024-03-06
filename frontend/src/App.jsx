// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import './App.css';
import Game from './components/Game';
import Home from './components/Home';
import MyMenu from './components/MyMenu';

const { Header, Content, Footer } = Layout;

function App() {


  return (
    <Router>
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <MyMenu />
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <div className="site-layout-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/game" element={<Game />} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Bataille - React AntD Socket.IO</Footer>
      </Layout>
    </Router>
  );
}

export default App;

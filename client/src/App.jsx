// client/src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx'; // Import Footer
import AboutPage from './pages/AboutPage.jsx'; // Import AboutPage
import HowToVotePage from './pages/HowToVotePage.jsx'; // Import HowToVotePage
import './App.css';


function App() {
  return (
    <Router>
      <Header />
      <main className="py-3">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} /> {/* Add About route */}
          <Route path="/how-to-vote" element={<HowToVotePage />} /> {/* Add HowToVote route */}
        </Routes>
      </main>
      <Footer /> {/* Add Footer */}
    </Router>
  );
}

export default App;
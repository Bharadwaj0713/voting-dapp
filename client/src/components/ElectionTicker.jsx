// client/src/components/ElectionTicker.jsx

import Marquee from "react-fast-marquee";
import './ElectionTicker.css'; // We will create this file next
import { FaVoteYea, FaChartLine, FaClock } from 'react-icons/fa'; // We need icons

const ElectionTicker = ({ leader, countdownString, electionActive }) => {
  const quotes = [
    "Voting is not only our right—it is our power.",
    "Your vote is your voice.",
    "The future of this nation is in our hands.",
    "Elections belong to the people.",
    "Every vote counts."
  ];

  return (
    <div className="ticker-wrap">
      <Marquee speed={60} gradient={false}>
        
        {/* Item 1: Election Status */}
        <div className="ticker-item">
          <FaClock className="ticker-icon" />
          <strong>STATUS:</strong> {electionActive ? countdownString : "Election has ended."}
        </div>

        {/* Item 2: Current Leader */}
        <div className="ticker-item">
          <FaChartLine className="ticker-icon" />
          <strong>CURRENTLY LEADING:</strong> {leader ? `${leader.name} (${leader.votes} votes)` : "No votes cast yet"}
        </div>

        {/* Show Quotes */}
        {quotes.map((quote, index) => (
          <div className="ticker-item" key={index}>
            <FaVoteYea className="ticker-icon" />
            <i>"{quote}"</i>
          </div>
        ))}

      </Marquee>
    </div>
  );
};

export default ElectionTicker;
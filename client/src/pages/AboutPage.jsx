// client/src/pages/AboutPage.jsx

import React from 'react';
import { Container, Card } from 'react-bootstrap';

const AboutPage = () => {
  return (
    <Container>
      <Card className="mt-4">
        <Card.Header as="h2">About This Project</Card.Header>
        <Card.Body>
          <Card.Text>
            This is a Decentralized Voting Application built on the Ethereum blockchain.
            It demonstrates the core principles of transparency and security in an electoral process using smart contracts.
          </Card.Text>
          <Card.Text>
            <strong>Technology Stack:</strong>
            <ul>
              <li>Smart Contracts: Solidity & Hardhat</li>
              <li>Blockchain: Ganache (Local)</li>
              <li>Frontend: React.js & Vite</li>
              <li>Styling: React-Bootstrap</li>
            </ul>
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AboutPage;
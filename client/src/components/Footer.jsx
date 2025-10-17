// client/src/components/Footer.jsx

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-5 p-4 text-center">
      <Container>
        <Row>
          <Col>
            <p>Decentralized Voting System &copy; 2025</p>
            <p>Built for educational purposes. Not for official use.</p>
            <p>Helpline: 1800-111-999 (Dummy Number)</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
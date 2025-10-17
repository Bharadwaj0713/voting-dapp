// client/src/components/Header.jsx

import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import Marquee from "react-fast-marquee"; // Marquee component for scrolling text
import ashokaSymbol from '../assets/ashoka.png';

const Header = () => {
  return (
    <header>
      {/* Main Navbar */}
      <Navbar bg="light" variant="light" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <img
                src={ashokaSymbol}
                width="30"
                height="30"
                className="d-inline-block align-top"
                alt="Emblem of India"
              />{' '}
              Election Commission of India (dApp)
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <LinkContainer to="/">
                <Nav.Link>Home (Voting)</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/about">
                <Nav.Link>About</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/how-to-vote">
                <Nav.Link>How to Vote</Nav.Link>
              </LinkContainer>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Scrolling Marquee */}
      <div className="bg-dark text-white p-2">
        <Marquee pauseOnHover={true} speed={50}>
          <span className="mx-4">
            Ensure your MetaMask wallet is connected to participate in the election.
          </span>
          <span className="mx-4">
            Voting is a secure and transparent process on the blockchain.
          </span>
          <span className="mx-4">
            Only registered voters are eligible to cast their vote.
          </span>
        </Marquee>
      </div>
    </header>
  );
};

export default Header;
// client/src/components/Header.jsx

import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
// STEP 1: Import the image like a module
import ashokaLogo from '../assets/ashoka.png';

const Header = () => {
  return (
    <header>
      <Navbar bg="light" variant="light" expand="lg" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              {/* STEP 2: Use the imported variable in the src attribute */}
              <img
                src={ashokaLogo}
                width="30"
                height="30"
                className="d-inline-block align-top"
                alt="Ashoka Chakra"
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
    </header>
  );
};

export default Header;
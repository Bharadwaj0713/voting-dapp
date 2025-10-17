// client/src/pages/HowToVotePage.jsx

import React from 'react';
import { Container, Card, ListGroup } from 'react-bootstrap';

const HowToVotePage = () => {
  return (
    <Container>
      <Card className="mt-4">
        <Card.Header as="h2">How to Vote</Card.Header>
        <Card.Body>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <strong>1. Connect Your Wallet:</strong> Ensure you have MetaMask installed and are connected to the correct network. Your account must be registered by the election admin.
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>2. Go to the Home Page:</strong> Navigate to the "Home (Voting)" page to see the list of candidates.
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>3. Cast Your Vote:</strong> If the election is active and you are a registered voter, you will see a "Vote" button next to each candidate. Click the button for your chosen candidate.
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>4. Confirm Transaction:</strong> MetaMask will pop up asking you to confirm the transaction. This action is recorded securely on the blockchain. You can only vote once.
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>5. Check Results:</strong> The vote counts will update in real-time on the Home page.
            </ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default HowToVotePage;
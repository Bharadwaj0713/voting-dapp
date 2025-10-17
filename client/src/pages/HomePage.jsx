// client/src/pages/HomePage.jsx

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  candidateRegistryAddress, candidateRegistryABI, 
  voterRegistryAddress, voterRegistryABI, 
  votingContractAddress, votingContractABI 
} from '../config.js';

import { Container, Card, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import './HomePage.css';

// --- SOLUTION: Moved AdminPanel outside of HomePage component ---
// We now pass all necessary state and functions as props.
const AdminPanel = ({ 
  candidateName, 
  setCandidateName, 
  voterAddress, 
  setVoterAddress, 
  handleTransaction,
  contracts
}) => (
  <Card className="mb-4 shadow-sm">
    <Card.Header as="h3" className="bg-secondary text-white">Admin Panel</Card.Header>
    <Card.Body>
      <Form>
        <Form.Group as={Row} className="mb-3" controlId="formAddCandidate">
          <Col sm={9}>
            <Form.Control 
              type="text" 
              placeholder="Enter candidate's name" 
              value={candidateName} 
              onChange={(e) => setCandidateName(e.target.value)} 
            />
          </Col>
          <Col sm={3}>
            <Button 
              variant="primary" 
              className="w-100" 
              onClick={() => handleTransaction(() => contracts.candContract.addCandidate(candidateName), 'Candidate added successfully!')}
            >
              Add Candidate
            </Button>
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3" controlId="formRegisterVoter">
          <Col sm={9}>
            <Form.Control 
              type="text" 
              placeholder="Enter voter's address" 
              value={voterAddress} 
              onChange={(e) => setVoterAddress(e.target.value)} 
            />
          </Col>
          <Col sm={3}>
            <Button 
              variant="info" 
              className="w-100" 
              onClick={() => handleTransaction(() => contracts.votContract.addVoter(voterAddress), `Voter ${voterAddress} registered!`)}
            >
              Register Voter
            </Button>
          </Col>
        </Form.Group>
      </Form>
      <Button 
        variant="success" 
        onClick={() => {
          const duration = prompt("Enter election duration in minutes:");
          if (duration) handleTransaction(() => contracts.votingCont.startElection(duration), 'Election started!');
        }}
      >
        Start Election
      </Button>
    </Card.Body>
  </Card>
);

function HomePage() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVoterRegistered, setIsVoterRegistered] = useState(false);
  const [contracts, setContracts] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [candidateName, setCandidateName] = useState('');
  const [voterAddress, setVoterAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  async function setupContracts(signer) {
    const candContract = new ethers.Contract(candidateRegistryAddress, candidateRegistryABI, signer);
    const votContract = new ethers.Contract(voterRegistryAddress, voterRegistryABI, signer);
    const votingCont = new ethers.Contract(votingContractAddress, votingContractABI, signer);
    setContracts({ candContract, votContract, votingCont });
    return { candContract, votContract, votingCont };
  }
  
  async function checkUserStatus(userAddress, votContract) {
    if (userAddress && votContract) {
      const adminAddress = await votContract.electionAdmin();
      setIsAdmin(userAddress.toLowerCase() === adminAddress.toLowerCase());
      const registered = await votContract.isRegisteredVoter(userAddress);
      setIsVoterRegistered(registered);
    }
  }

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        setAccount(userAddress);
        
        const { votContract } = await setupContracts(signer);
        await checkUserStatus(userAddress, votContract);

      } catch (err) {
        console.error("Error connecting wallet:", err);
      }
    }
  }

  useEffect(() => {
    connectWallet();
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        connectWallet();
      } else {
        setAccount(null);
        setIsAdmin(false);
        setIsVoterRegistered(false);
      }
    };
    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    return () => window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
  }, []);

  async function fetchCandidates() {
    if (contracts.candContract && contracts.votingCont) {
      const count = await contracts.candContract.candidatesCount();
      const candidatesList = [];
      for (let i = 1; i <= count; i++) {
        const candidate = await contracts.candContract.candidates(i);
        const votes = await contracts.votingCont.results(candidate.id);
        candidatesList.push({ id: Number(candidate.id), name: candidate.name, votes: Number(votes) });
      }
      setCandidates(candidatesList);
    }
  }

  useEffect(() => {
    fetchCandidates();
  }, [contracts]);
  
  const handleTransaction = async (txFunction, successMessage) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const tx = await txFunction();
      await tx.wait();
      setMessage({ type: 'success', text: successMessage });
      fetchCandidates();
      // Clear inputs after successful transaction
      if (successMessage.includes('Candidate')) setCandidateName('');
      if (successMessage.includes('Voter')) setVoterAddress('');
    } catch (error) {
      console.error(error);
      setMessage({ type: 'danger', text: error.reason || 'Transaction failed.' });
    }
    setLoading(false);
  };

  return (
    <Container className="mt-4">
      {account ? (
        <div>
          <Alert variant="light" className="text-center">Connected Account: <strong>{account}</strong></Alert>
          {loading && <div className="text-center my-3"><Spinner animation="border" variant="primary" /> <p>Processing Transaction...</p></div>}
          {message.text && <Alert variant={message.type} onClose={() => setMessage({ type: '', text: '' })} dismissible>{message.text}</Alert>}
          
          {/* We now render AdminPanel as a self-contained component and pass props to it */}
          {isAdmin && 
            <AdminPanel 
              candidateName={candidateName}
              setCandidateName={setCandidateName}
              voterAddress={voterAddress}
              setVoterAddress={setVoterAddress}
              handleTransaction={handleTransaction}
              contracts={contracts}
            />
          }
          
          <h2 className="mt-4 text-center">Candidates & Results</h2>
          <Row>
            {candidates.length > 0 ? candidates.map((candidate) => (
              <Col md={4} key={candidate.id} className="mb-3">
                <Card className="text-center shadow-sm h-100">
                  <Card.Body>
                    <Card.Title className="h5">{candidate.name}</Card.Title>
                    <Card.Text>
                      <strong className="display-4">{candidate.votes}</strong>
                      <br />
                      Votes
                    </Card.Text>
                    {isVoterRegistered && !isAdmin && (
                      <Button variant="primary" onClick={() => handleTransaction(() => contracts.votingCont.vote(candidate.id), 'Vote cast successfully!')}>
                        Vote for {candidate.name}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            )) : <p className="text-center text-muted">No candidates have been added yet.</p>}
          </Row>
        </div>
      ) : (
        <div className="text-center mt-5">
            <Card className="p-4 shadow-lg">
                <h2>Welcome to the Decentralized Voting System</h2>
                <p>Please connect your MetaMask wallet to participate.</p>
                <Button variant="primary" size="lg" onClick={connectWallet}>Connect Wallet</Button>
            </Card>
        </div>
      )}
    </Container>
  );
}

export default HomePage;
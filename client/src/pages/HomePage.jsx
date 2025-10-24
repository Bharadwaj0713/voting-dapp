// client/src/pages/HomePage.jsx
import { FaVoteYea } from 'react-icons/fa'; // <-- ADD THIS LINE
import { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { ethers } from 'ethers';
import ElectionTicker from '../components/ElectionTicker'; // <-- Import the new Ticker
import {
  voterRegistryAddress,
  candidateRegistryAddress,
  votingContractAddress,
  voterRegistryABI,
  candidateRegistryABI,
  votingContractABI
} from '../config';

const HomePage = () => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [voterAddress, setVoterAddress] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [electionDuration, setElectionDuration] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // --- NEW STATES FOR THE TICKER ---
  const [electionEndTime, setElectionEndTime] = useState(0);
  const [countdown, setCountdown] = useState("");
  const [leader, setLeader] = useState(null);
  const [isElectionActive, setIsElectionActive] = useState(false);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const selectedAccount = accounts[0];
        setAccount(selectedAccount);
      } else {
        setError('Please install MetaMask!');
      }
    } catch (err) {
      setError(`Error connecting wallet: ${err.message}`);
    }
  };

  // --- NEW: useEffect for Countdown Timer ---
  useEffect(() => {
    if (electionEndTime === 0) return;

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = electionEndTime - now;

      if (remaining > 0) {
        setIsElectionActive(true);
        const days = Math.floor(remaining / 86400);
        const hours = Math.floor((remaining % 86400) / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const seconds = remaining % 60;
        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s remaining`);
      } else {
        setIsElectionActive(false);
        setCountdown("Election has ended.");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval
  }, [electionEndTime]);

  // This runs when provider or account changes
  useEffect(() => {
    const setupContracts = async () => {
      if (provider && account) {
        setLoading(true);
        setError('');
        try {
          const signer = await provider.getSigner();
          const voterRegistry = new ethers.Contract(voterRegistryAddress, voterRegistryABI, signer);
          
          const adminAddress = await voterRegistry.electionAdmin();
          setIsAdmin(adminAddress.toLowerCase() === account.toLowerCase());

          await fetchCandidatesAndStatus(); // Fetch all data
        } catch (err) {
          setError(`Error setting up contracts: ${err.message}`);
        }
        setLoading(false);
      }
    };
    setupContracts();
  }, [provider, account]);

  // --- UPDATED to fetch candidates AND election status ---
  const fetchCandidatesAndStatus = async () => {
    if (!provider) return;
    try {
      const candidateRegistry = new ethers.Contract(candidateRegistryAddress, candidateRegistryABI, provider);
      const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, provider);
      
      // Fetch election end time
      const endTime = await votingContract.electionEndTime();
      setElectionEndTime(Number(endTime));
      
      // Fetch candidates and votes
      const count = await candidateRegistry.candidatesCount();
      const loadedCandidates = [];
      for (let i = 1; i <= count; i++) {
        const candidate = await candidateRegistry.candidates(i);
        const votes = await votingContract.getResult(candidate.id);
        
        loadedCandidates.push({ 
          id: Number(candidate.id), 
          name: candidate.name,
          votes: Number(votes)
        });
      }
      setCandidates(loadedCandidates);

      // --- NEW: Find the leader ---
      if (loadedCandidates.length > 0) {
        const sortedCandidates = [...loadedCandidates].sort((a, b) => b.votes - a.votes);
        setLeader(sortedCandidates[0]);
      } else {
        setLeader(null);
      }

    } catch (err) {
      setError(`Error fetching data: ${err.message}`);
    }
  };

  const handleAddVoter = async (e) => {
    e.preventDefault();
    if (!provider || !voterAddress) return;
    setLoading(true); setMessage(''); setError('');
    try {
      const signer = await provider.getSigner();
      const voterRegistry = new ethers.Contract(voterRegistryAddress, voterRegistryABI, signer);
      const tx = await voterRegistry.addVoter(voterAddress);
      await tx.wait();
      setMessage(`Voter ${voterAddress} added!`);
      setVoterAddress('');
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!provider || !candidateName) return;
    setLoading(true); setMessage(''); setError('');
    try {
      const signer = await provider.getSigner();
      const candidateRegistry = new ethers.Contract(candidateRegistryAddress, candidateRegistryABI, signer);
      const tx = await candidateRegistry.addCandidate(candidateName);
      await tx.wait();
      setMessage(`Candidate "${candidateName}" added!`);
      setCandidateName('');
      await fetchCandidatesAndStatus(); // Refresh
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  const handleStartElection = async (e) => {
    e.preventDefault();
    if (!provider || electionDuration <= 0) return;
    setLoading(true); setMessage(''); setError('');
    try {
      const signer = await provider.getSigner();
      const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
      const tx = await votingContract.startElection(electionDuration);
      await tx.wait();
      setMessage(`Election started!`);
      await fetchCandidatesAndStatus(); // Refresh
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  const handleVote = async (e) => {
    e.preventDefault();
    if (!provider || !selectedCandidate) return;
    setLoading(true); setMessage(''); setError('');
    try {
      const signer = await provider.getSigner();
      const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
      const tx = await votingContract.vote(selectedCandidate);
      await tx.wait();
      setMessage('Vote cast successfully!');
      await fetchCandidatesAndStatus(); // Refresh
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <> {/* Use Fragment to allow ticker outside container */}
      {account && (
        <ElectionTicker 
          leader={leader} 
          countdownString={countdown} 
          electionActive={isElectionActive} 
        />
      )}

      <Container className="main-container"> {/* main-container from App.css */}
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}

        {!account ? (
          <Card className="text-center p-4">
            <Card.Body>
              <Card.Title as="h1">Welcome to the Decentralized Voting System</Card.Title>
              <Card.Text>Please connect your MetaMask wallet to continue.</Card.Text>
              <Button onClick={connectWallet} variant="primary" size="lg">Connect to Wallet</Button>
            </Card.Body>
          </Card>
        ) : (
          <>
            <Alert variant="info">
              <strong>Connected Account:</strong> {account}
            </Alert>
            {loading && <div className="text-center"><Spinner animation="border" /></div>}
            
            {isAdmin && (
              <Card className="mb-4 shadow-sm">
                <Card.Header as="h5" style={{ backgroundColor: '#ffc107' }}>Admin Panel</Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <Form onSubmit={handleAddVoter}>
                        <Form.Group controlId="voterAddress" className="mb-3">
                          <Form.Label>Add Voter Address</Form.Label>
                          <Form.Control type="text" placeholder="Enter voter's address" value={voterAddress} onChange={(e) => setVoterAddress(e.target.value)} />
                        </Form.Group>
                        <Button type="submit" variant="secondary" disabled={loading}>Add Voter</Button>
                      </Form>
                    </Col>
                    <Col md={4}>
                      <Form onSubmit={handleAddCandidate}>
                        <Form.Group controlId="candidateName" className="mb-3">
                          <Form.Label>Add Candidate Name</Form.Label>
                          <Form.Control type="text" placeholder="Enter candidate's name" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} />
                        </Form.Group>
                        <Button type="submit" variant="secondary" disabled={loading}>Add Candidate</Button>
                      </Form>
                    </Col>
                    <Col md={4}>
                      <Form onSubmit={handleStartElection}>
                        <Form.Group controlId="electionDuration" className="mb-3">
                          <Form.Label>Start Election (in minutes)</Form.Label>
                          <Form.Control type="number" placeholder="Duration in minutes" value={electionDuration} onChange={(e) => setElectionDuration(e.target.value)} />
                        </Form.Group>
                        <Button type="submit" variant="warning" disabled={loading}>Start Election</Button>
                      </Form>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            <Row>
              <Col md={6} className="mb-4">
                <Card className="shadow-sm">
                  <Card.Header as="h5">Cast Your Vote</Card.Header>
                  <Card.Body>
                    {candidates.length > 0 ? (
                      <Form onSubmit={handleVote}>
                        <Form.Group controlId="selectCandidate" className="mb-3">
                          <Form.Label>Select a Candidate</Form.Label>
                          <Form.Select value={selectedCandidate} onChange={(e) => setSelectedCandidate(e.target.value)}>
                            <option value="">-- Please choose an option --</option>
                            {candidates.map(candidate => (
                              <option key={candidate.id} value={candidate.id}>{candidate.name}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                        <Button type="submit" variant="primary" size="lg" disabled={loading || !isElectionActive}>
                          {isElectionActive ? 'Submit Vote' : 'Election is Closed'}
                        </Button>
                      </Form>
                    ) : (
                      <Alert variant="secondary">No candidates have been added yet.</Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} className="mb-4">
                <Card className="shadow-sm">
                  <Card.Header as="h5">Live Election Results</Card.Header>
                  <Card.Body>
                    {candidates.length > 0 ? (
                      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                        {candidates.sort((a, b) => b.votes - a.votes).map((candidate, index) => (
                          <li key={candidate.id} className={`result-item ${index === 0 ? 'leader' : ''}`}>
                            <span className="candidate-name">
                              {index === 0 && <FaVoteYea style={{ color: 'gold', marginRight: '8px' }} />}
                              {candidate.name}
                            </span>
                            <span className="candidate-votes">{candidate.votes} votes</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Alert variant="secondary">No candidates added.</Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </>
  );
};

export default HomePage;
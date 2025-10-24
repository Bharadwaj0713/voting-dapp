// client/src/screens/HomeScreen.jsx

import { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { ethers } from 'ethers';
import {
  voterRegistryAddress,
  candidateRegistryAddress,
  votingContractAddress,
  voterRegistryABI,
  candidateRegistryABI,
  votingContractABI
} from '../config';

const HomeScreen = () => {
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

  // This useEffect runs only when the provider or account changes.
  // This is the CRITICAL FIX to prevent errors on page load.
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

          await fetchCandidates();
        } catch (err) {
          setError(`Error setting up contracts or checking admin status: ${err.message}`);
        }
        setLoading(false);
      }
    };
    setupContracts();
  }, [provider, account]);

  const fetchCandidates = async () => {
    if (!provider) return;
    try {
      const candidateRegistry = new ethers.Contract(candidateRegistryAddress, candidateRegistryABI, provider);
      const count = await candidateRegistry.candidatesCount();
      const loadedCandidates = [];
      for (let i = 1; i <= count; i++) {
        const candidate = await candidateRegistry.candidates(i);
        loadedCandidates.push({ id: Number(candidate.id), name: candidate.name });
      }
      setCandidates(loadedCandidates);
    } catch (err) {
      setError(`Error fetching candidates: ${err.message}`);
    }
  };

  const handleAddVoter = async (e) => {
    e.preventDefault();
    if (!provider || !voterAddress) return;
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const signer = await provider.getSigner();
      const voterRegistry = new ethers.Contract(voterRegistryAddress, voterRegistryABI, signer);
      const tx = await voterRegistry.addVoter(voterAddress);
      await tx.wait();
      setMessage(`Voter ${voterAddress} added successfully!`);
      setVoterAddress('');
    } catch (err) {
      setError(`Error adding voter: ${err.message}`);
    }
    setLoading(false);
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!provider || !candidateName) return;
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const signer = await provider.getSigner();
      const candidateRegistry = new ethers.Contract(candidateRegistryAddress, candidateRegistryABI, signer);
      const tx = await candidateRegistry.addCandidate(candidateName);
      await tx.wait();
      setMessage(`Candidate "${candidateName}" added successfully!`);
      setCandidateName('');
      await fetchCandidates(); // Refresh candidate list
    } catch (err) {
      setError(`Error adding candidate: ${err.message}`);
    }
    setLoading(false);
  };

  const handleStartElection = async (e) => {
    e.preventDefault();
    if (!provider || electionDuration <= 0) return;
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const signer = await provider.getSigner();
      const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
      const tx = await votingContract.startElection(electionDuration);
      await tx.wait();
      setMessage(`Election started for ${electionDuration} minutes!`);
    } catch (err) {
      setError(`Error starting election: ${err.message}`);
    }
    setLoading(false);
  };

  const handleVote = async (e) => {
    e.preventDefault();
    if (!provider || !selectedCandidate) return;
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const signer = await provider.getSigner();
      const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
      const tx = await votingContract.vote(selectedCandidate);
      await tx.wait();
      setMessage('Your vote has been cast successfully!');
    } catch (err) {
      setError(`Error casting vote: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <Container>
      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      {!account ? (
        <div className="text-center">
          <h1>Welcome to the Decentralized Voting System</h1>
          <p>Please connect your MetaMask wallet to continue.</p>
          <Button onClick={connectWallet} variant="primary" size="lg">Connect to Wallet</Button>
        </div>
      ) : (
        <>
          <Alert variant="info">Connected Account: {account}</Alert>
          {loading && <div className="text-center"><Spinner animation="border" /></div>}
          
          {isAdmin && (
            <Row>
              {/* Admin Panel */}
              <Col md={12}>
                <Card className="mb-4">
                  <Card.Body>
                    <Card.Title>Admin Panel</Card.Title>
                    {/* Add Voter */}
                    <Form onSubmit={handleAddVoter}>
                      <Form.Group controlId="voterAddress" className="mb-3">
                        <Form.Label>Add Voter Address</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="Enter voter's Ethereum address" 
                          value={voterAddress} 
                          onChange={(e) => setVoterAddress(e.target.value)} 
                        />
                      </Form.Group>
                      <Button type="submit" variant="secondary" disabled={loading}>Add Voter</Button>
                    </Form>
                    <hr />
                    {/* Add Candidate */}
                    <Form onSubmit={handleAddCandidate}>
                       <Form.Group controlId="candidateName" className="mb-3">
                        <Form.Label>Add Candidate Name</Form.Label>
                        <Form.Control 
                          type="text" 
                          placeholder="Enter candidate's name" 
                          value={candidateName} 
                          onChange={(e) => setCandidateName(e.target.value)} 
                        />
                      </Form.Group>
                      <Button type="submit" variant="secondary" disabled={loading}>Add Candidate</Button>
                    </Form>
                    <hr />
                     {/* Start Election */}
                    <Form onSubmit={handleStartElection}>
                       <Form.Group controlId="electionDuration" className="mb-3">
                        <Form.Label>Start Election (in minutes)</Form.Label>
                        <Form.Control 
                          type="number" 
                          placeholder="Enter duration in minutes" 
                          value={electionDuration} 
                          onChange={(e) => setElectionDuration(e.target.value)} 
                        />
                      </Form.Group>
                      <Button type="submit" variant="warning" disabled={loading}>Start Election</Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          <Row>
            {/* Voting Panel */}
            <Col md={6}>
              <Card>
                <Card.Body>
                  <Card.Title>Cast Your Vote</Card.Title>
                   {candidates.length > 0 ? (
                    <Form onSubmit={handleVote}>
                      <Form.Group controlId="selectCandidate" className="mb-3">
                        <Form.Label>Select a Candidate</Form.Label>
                        <Form.Select 
                          value={selectedCandidate} 
                          onChange={(e) => setSelectedCandidate(e.target.value)}
                        >
                          <option value="">-- Please choose an option --</option>
                          {candidates.map(candidate => (
                            <option key={candidate.id} value={candidate.id}>{candidate.name}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                      <Button type="submit" variant="primary" disabled={loading}>Vote</Button>
                    </Form>
                  ) : (
                    <p>No candidates have been added yet.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            {/* Results Panel */}
            <Col md={6}>
              <Card>
                <Card.Body>
                  <Card.Title>Candidates & Results</Card.Title>
                  {candidates.length > 0 ? (
                     <ul>
                      {candidates.map(candidate => (
                        <li key={candidate.id}>{candidate.name}</li> // Simplified for now
                      ))}
                    </ul>
                  ) : (
                    <p>Results will be shown here after the election ends.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default HomeScreen;
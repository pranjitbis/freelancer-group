// app/freelancer-dashboard/proposals/page.js
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, 
  FaFilter, 
  FaBriefcase, 
  FaUser, 
  FaClock, 
  FaMoneyBillWave,
  FaCalendarAlt,
  FaEye,
  FaSort,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaHourglassHalf
} from 'react-icons/fa';
import styles from './Proposals.module.css';

const ProposalsPage = () => {
  const [proposals, setProposals] = useState([]);
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  useEffect(() => {
    filterAndSortProposals();
  }, [proposals, searchTerm, statusFilter, sortBy]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get current user ID from localStorage or auth context
      const userData = localStorage.getItem('user');
      const userId = userData ? JSON.parse(userData).id : null;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`/api/proposals?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch proposals');
      }

      if (data.success) {
        setProposals(data.proposals || []);
      } else {
        throw new Error(data.error || 'Failed to fetch proposals');
      }
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProposals = () => {
    let filtered = proposals;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(proposal =>
        proposal.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.job?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proposal.coverLetter?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(proposal => proposal.status === statusFilter);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'highest-bid':
          return b.bidAmount - a.bidAmount;
        case 'lowest-bid':
          return a.bidAmount - b.bidAmount;
        case 'job-title':
          return (a.job?.title || '').localeCompare(b.job?.title || '');
        default:
          return 0;
      }
    });

    setFilteredProposals(filtered);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <FaCheckCircle className={styles.statusIconAccepted} />;
      case 'rejected':
        return <FaTimes className={styles.statusIconRejected} />;
      case 'pending':
        return <FaHourglassHalf className={styles.statusIconPending} />;
      default:
        return <FaExclamationTriangle className={styles.statusIconDefault} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return styles.statusAccepted;
      case 'rejected':
        return styles.statusRejected;
      case 'pending':
        return styles.statusPending;
      default:
        return styles.statusDefault;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleViewDetails = (proposal) => {
    setSelectedProposal(proposal);
  };

  const handleCloseDetails = () => {
    setSelectedProposal(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={styles.spinner}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Loading your proposals...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.errorContainer}
      >
        <FaExclamationTriangle className={styles.errorIcon} />
        <h3>Unable to Load Proposals</h3>
        <p>{error}</p>
        <button 
          onClick={fetchProposals}
          className={styles.retryButton}
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.header}
      >
        <div className={styles.headerContent}>
          <h1 className={styles.title}>My Proposals</h1>
          <p className={styles.subtitle}>
            Track and manage your job applications
          </p>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{proposals.length}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>
              {proposals.filter(p => p.status === 'accepted').length}
            </span>
            <span className={styles.statLabel}>Accepted</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>
              {proposals.filter(p => p.status === 'pending').length}
            </span>
            <span className={styles.statLabel}>Pending</span>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={styles.controls}
      >
        <div className={styles.searchContainer}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by job title, client name, or proposal content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.controlButtons}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
          >
            <FaFilter />
            Filters
          </button>

          <div className={styles.sortContainer}>
            <FaSort className={styles.sortIcon} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest-bid">Highest Bid</option>
              <option value="lowest-bid">Lowest Bid</option>
              <option value="job-title">Job Title</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={styles.filtersPanel}
          >
            <div className={styles.filterGroup}>
              <label>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proposals Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={styles.proposalsGrid}
      >
        {filteredProposals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.emptyState}
          >
            <FaBriefcase className={styles.emptyIcon} />
            <h3>No proposals found</h3>
            <p>
              {proposals.length === 0 
                ? "You haven't submitted any proposals yet. Start applying to jobs!"
                : "No proposals match your current filters."
              }
            </p>
          </motion.div>
        ) : (
          filteredProposals.map((proposal) => (
            <motion.div
              key={proposal.id}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={styles.proposalCard}
            >
              <div className={styles.cardHeader}>
                <div className={styles.jobTitle}>
                  <FaBriefcase className={styles.titleIcon} />
                  <h3>{proposal.job?.title || 'Untitled Job'}</h3>
                </div>
                <div className={`${styles.status} ${getStatusColor(proposal.status)}`}>
                  {getStatusIcon(proposal.status)}
                  <span>{proposal.status}</span>
                </div>
              </div>

              <div className={styles.clientInfo}>
                <FaUser className={styles.clientIcon} />
                <span>{proposal.job?.user?.name || 'Unknown Client'}</span>
              </div>

              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <FaMoneyBillWave className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>My Bid</span>
                    <span className={styles.detailValue}>
                      {formatCurrency(proposal.bidAmount)}
                    </span>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <FaClock className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Timeframe</span>
                    <span className={styles.detailValue}>
                      {proposal.timeframe} days
                    </span>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <FaCalendarAlt className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Submitted</span>
                    <span className={styles.detailValue}>
                      {formatDate(proposal.createdAt)}
                    </span>
                  </div>
                </div>

                {proposal.job?.budget && (
                  <div className={styles.detailItem}>
                    <FaMoneyBillWave className={styles.detailIcon} />
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Job Budget</span>
                      <span className={styles.detailValue}>
                        {formatCurrency(proposal.job.budget)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {proposal.coverLetter && (
                <div className={styles.coverLetterPreview}>
                  <p>{proposal.coverLetter.substring(0, 120)}...</p>
                </div>
              )}

              <div className={styles.cardActions}>
                <button
                  onClick={() => handleViewDetails(proposal)}
                  className={styles.viewButton}
                >
                  <FaEye />
                  View Details
                </button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Proposal Details Modal */}
      <AnimatePresence>
        {selectedProposal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
            onClick={handleCloseDetails}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>Proposal Details</h2>
                <button
                  onClick={handleCloseDetails}
                  className={styles.closeButton}
                >
                  <FaTimes />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.modalSection}>
                  <h3>Job Information</h3>
                  <div className={styles.modalGrid}>
                    <div>
                      <strong>Job Title:</strong>
                      <p>{selectedProposal.job?.title}</p>
                    </div>
                    <div>
                      <strong>Client:</strong>
                      <p>{selectedProposal.job?.user?.name}</p>
                    </div>
                    <div>
                      <strong>Job Budget:</strong>
                      <p>{formatCurrency(selectedProposal.job?.budget)}</p>
                    </div>
                    <div>
                      <strong>Experience Level:</strong>
                      <p>{selectedProposal.job?.experienceLevel}</p>
                    </div>
                  </div>
                </div>

                <div className={styles.modalSection}>
                  <h3>Your Proposal</h3>
                  <div className={styles.modalGrid}>
                    <div>
                      <strong>Bid Amount:</strong>
                      <p>{formatCurrency(selectedProposal.bidAmount)}</p>
                    </div>
                    <div>
                      <strong>Timeframe:</strong>
                      <p>{selectedProposal.timeframe} days</p>
                    </div>
                    <div>
                      <strong>Status:</strong>
                      <p className={`${styles.status} ${getStatusColor(selectedProposal.status)}`}>
                        {getStatusIcon(selectedProposal.status)}
                        {selectedProposal.status}
                      </p>
                    </div>
                    <div>
                      <strong>Submitted:</strong>
                      <p>{formatDate(selectedProposal.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {selectedProposal.coverLetter && (
                  <div className={styles.modalSection}>
                    <h3>Cover Letter</h3>
                    <div className={styles.coverLetterFull}>
                      <p>{selectedProposal.coverLetter}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProposalsPage;
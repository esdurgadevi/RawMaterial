import React, { useState, useEffect, useRef } from 'react';
import issueService from '../../services/admin1/transaction-cotton/issueService';
import mixingGroupService from '../../services/admin1/master/mixingGroupService';
import mixingService from '../../services/admin1/master/mixingService';
import inwardLotService from '../../services/admin1/transaction-cotton/inwardLotService';

const IssueEntryManagement = () => {
  // States
  const [issues, setIssues] = useState([]);
  const [mixingGroups, setMixingGroups] = useState([]);
  const [mixings, setMixings] = useState([]);
  const [availableBales, setAvailableBales] = useState([]);
  const [availableLotNumbers, setAvailableLotNumbers] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [mixingGroupLoading, setMixingGroupLoading] = useState(false);
  const [mixingLoading, setMixingLoading] = useState(false);
  const [balesLoading, setBalesLoading] = useState(false);
  const [issueNoLoading, setIssueNoLoading] = useState(false);
  const [lotNumbersLoading, setLotNumbersLoading] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [viewingIssue, setViewingIssue] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    issueNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    mixingNo: '',
    mixingGroupId: '',
    mixingGroupName: '',
    toMixingGroupId: '',
    toMixingGroupName: '',
    lotNo: '',
    issueQty: '',
    
    // Bale selection
    selectedBales: [], // Array of selected bales for issue
    availableBales: [], // Available bales for the lot
    
    // Total calculations
    totalBales: 0,
    totalWeight: 0,
    totalValue: 0
  });

  // Filter states
  const [showMixingGroupDropdown, setShowMixingGroupDropdown] = useState(false);
  const [showMixingDropdown, setShowMixingDropdown] = useState(false);
  const [showLotDropdown, setShowLotDropdown] = useState(false);
  const [mixingGroupSearch, setMixingGroupSearch] = useState('');
  const [mixingSearch, setMixingSearch] = useState('');
  const [lotSearch, setLotSearch] = useState('');
  
  // Cache for mixing group and mixing names
  const [mixingGroupNames, setMixingGroupNames] = useState({});
  const [mixingNames, setMixingNames] = useState({});
  
  // Refs
  const mixingGroupRef = useRef(null);
  const mixingRef = useRef(null);
  const lotRef = useRef(null);

  // Load all data on component mount
  useEffect(() => {
    fetchIssues();
    fetchMixingGroups();
    fetchMixings();
    fetchAvailableLotNumbers();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mixingGroupRef.current && !mixingGroupRef.current.contains(event.target)) {
        setShowMixingGroupDropdown(false);
      }
      if (mixingRef.current && !mixingRef.current.contains(event.target)) {
        setShowMixingDropdown(false);
      }
      if (lotRef.current && !lotRef.current.contains(event.target)) {
        setShowLotDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch mixing group name by ID
  const fetchMixingGroupName = async (id) => {
    if (!id || mixingGroupNames[id]) return mixingGroupNames[id];
    
    try {
      const response = await mixingGroupService.getById(id);
      const name = response.mixingName || `Group ${id}`;
      setMixingGroupNames(prev => ({ ...prev, [id]: name }));
      return name;
    } catch (err) {
      console.error(`Failed to fetch mixing group ${id}:`, err);
      return `Group ${id}`;
    }
  };

  // Fetch mixing name by ID
  const fetchMixingName = async (id) => {
    if (!id || mixingNames[id]) return mixingNames[id];
    
    try {
      const response = await mixingService.getById(id);
      const name = response.mixingName || response.mixingNo || `Mixing ${id}`;
      setMixingNames(prev => ({ ...prev, [id]: name }));
      return name;
    } catch (err) {
      console.error(`Failed to fetch mixing ${id}:`, err);
      return `Mixing ${id}`;
    }
  };

  // Enhanced fetch issues with name resolution
  const fetchIssues = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await issueService.getAll();
      const issuesData = Array.isArray(response) ? response : [];
      
      // Process each issue to fetch names
      const processedIssues = await Promise.all(issuesData.map(async (issue) => {
        // Fetch names asynchronously
        const [mixingGroupName, mixingName] = await Promise.all([
          fetchMixingGroupName(issue.mixingGroupId),
          fetchMixingName(issue.toMixingGroupId)
        ]);
        
        return {
          id: issue.id,
          issueNo: issue.issueNumber, // Map issueNumber to issueNo for display
          issueNumber: issue.issueNumber,
          issueDate: issue.issueDate,
          mixingNo: issue.mixingNo,
          mixingGroupId: issue.mixingGroupId,
          mixingGroupName: mixingGroupName,
          toMixingGroupId: issue.toMixingGroupId,
          mixingName: mixingName,
          issueQty: issue.issueQty,
          // Map IssueItems to issuedBales
          issuedBales: issue.IssueItems ? issue.IssueItems.map(item => ({
            id: item.weightmentId,
            baleNo: item.InwardLotWeightment?.baleNo,
            baleWeight: parseFloat(item.issueWeight) || parseFloat(item.InwardLotWeightment?.baleWeight),
            grossWeight: parseFloat(item.InwardLotWeightment?.grossWeight),
            baleValue: parseFloat(item.InwardLotWeightment?.baleValue),
            lotNo: item.InwardLotWeightment?.lotNo
          })) : [],
          // Get lotNo from first bale if available
          lotNo: issue.IssueItems && issue.IssueItems.length > 0 
            ? issue.IssueItems[0]?.InwardLotWeightment?.lotNo 
            : '',
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt
        };
      }));
      
      setIssues(processedIssues);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load issues');
      setIssues([]);
      setLoading(false);
    }
  };

  const fetchMixingGroups = async () => {
    setMixingGroupLoading(true);
    try {
      const response = await mixingGroupService.getAll();
      const groupsData = Array.isArray(response) ? response : [];
      setMixingGroups(groupsData);
      
      // Update names cache
      const names = {};
      groupsData.forEach(group => {
        if (group.id) {
          names[group.id] = group.mixingName || `Group ${group.id}`;
        }
      });
      setMixingGroupNames(names);
    } catch (err) {
      console.error('Failed to load mixing groups:', err);
    } finally {
      setMixingGroupLoading(false);
    }
  };

  const fetchMixings = async () => {
    setMixingLoading(true);
    try {
      const response = await mixingService.getAll();
      const mixingsData = Array.isArray(response) ? response : [];
      setMixings(mixingsData);
      
      // Update names cache
      const names = {};
      mixingsData.forEach(mixing => {
        if (mixing.id) {
          names[mixing.id] = mixing.mixingName || mixing.mixingNo || `Mixing ${mixing.id}`;
        }
      });
      setMixingNames(names);
    } catch (err) {
      console.error('Failed to load mixings:', err);
    } finally {
      setMixingLoading(false);
    }
  };

  const fetchAvailableLotNumbers = async () => {
    setLotNumbersLoading(true);
    try {
      // Assuming inwardLotService has a method to get all lot numbers
      const response = await inwardLotService.getAllLotNumbers();
      const lotNumbersData = Array.isArray(response) ? response : [];
      setAvailableLotNumbers(lotNumbersData);
    } catch (err) {
      console.error('Failed to load lot numbers:', err);
      setAvailableLotNumbers([]);
    } finally {
      setLotNumbersLoading(false);
    }
  };

  const fetchAvailableBales = async (lotNo) => {
    if (!lotNo) return;
    
    setBalesLoading(true);
    try {
      const response = await inwardLotService.getWeightments(lotNo);
      console.log(response);
      const balesData = Array.isArray(response) ? response : [];
      setAvailableBales(balesData);
      
      // Update form data with available bales
      setFormData(prev => ({
        ...prev,
        availableBales: balesData
      }));
    } catch (err) {
      console.error('Failed to load available bales:', err);
      setAvailableBales([]);
    } finally {
      setBalesLoading(false);
    }
  };

  // Fetch next issue number
  const fetchNextIssueNumber = async () => {
    try {
      setIssueNoLoading(true);
      const response = await issueService.getNextIssueNo();
      
      setFormData(prev => ({
        ...prev,
        issueNumber: response || ''
      }));
      
    } catch (err) {
      console.error('Error fetching next issue number:', err);
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const nextYear = (parseInt(currentYear) + 1).toString().padStart(2, '0');
      const defaultIssueNo = `ISSUE/${currentYear}-${nextYear}/0001`;
      
      setFormData(prev => ({
        ...prev,
        issueNumber: defaultIssueNo
      }));
      
      setError('Could not fetch next issue number. Using default pattern.');
    } finally {
      setIssueNoLoading(false);
    }
  };

  // Filter mixing groups
  const filteredMixingGroups = mixingGroups.filter(group => {
    if (!mixingGroupSearch.trim()) return mixingGroups;
    const searchLower = mixingGroupSearch.toLowerCase();
    return (
      (group.mixingName && group.mixingName.toLowerCase().includes(searchLower)) ||
      (group.mixingCode && group.mixingCode.toString().includes(searchLower)) ||
      (group.code && group.code.toString().includes(searchLower))
    );
  });

  // Filter mixings
  const filteredMixings = mixings.filter(mixing => {
    if (!mixingSearch.trim()) return mixings;
    const searchLower = mixingSearch.toLowerCase();
    return (
      (mixing.mixingName && mixing.mixingName.toLowerCase().includes(searchLower)) ||
      (mixing.mixingNo && mixing.mixingNo.toLowerCase().includes(searchLower)) ||
      (mixing.code && mixing.code.toString().includes(searchLower))
    );
  });

  // Filter lot numbers based on search
  const filteredLotNumbers = availableLotNumbers.filter(lot => {
    if (!lotSearch.trim()) return availableLotNumbers;
    const searchLower = lotSearch.toLowerCase();
    return (
      (lot.lotNo && lot.lotNo.toLowerCase().includes(searchLower))
    );
  });

  // Filter issues based on search
  const filteredIssues = (() => {
    const issuesArray = Array.isArray(issues) ? issues : [];
    
    return issuesArray.filter(issue => {
      if (!issue || typeof issue !== 'object') return false;
      
      const issueNo = issue.issueNo || '';
      const issueNumber = issue.issueNumber || '';
      const mixingGroupName = issue.mixingGroupName || '';
      const mixingName = issue.mixingName || '';
      const mixingNo = issue.mixingNo || '';
      const lotNo = issue.lotNo || '';
      
      return searchTerm === '' || 
        issueNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issueNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mixingGroupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mixingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mixingNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lotNo.toLowerCase().includes(searchTerm.toLowerCase());
    });
  })();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent issueNumber changes when creating new issue (editingIssue is null)
    if (name === 'issueNumber' && !editingIssue) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'issueQty' || name === 'mixingNo'
        ? (value === '' ? '' : parseFloat(value) || '')
        : value
    }));
  };

  // Handle lot number selection
  const handleLotSelect = async (lot) => {
    const lotNo = lot.lotNo || lot;
    setFormData(prev => ({
      ...prev,
      lotNo,
      selectedBales: [] // Clear selected bales when lot changes
    }));
    setLotSearch(lotNo);
    setShowLotDropdown(false);
    
    // Fetch available bales for the selected lot
    if (lotNo) {
      await fetchAvailableBales(lotNo);
    }
  };

  // Handle bale selection
  const handleBaleSelect = (bale) => {
    setFormData(prev => {
      const isSelected = prev.selectedBales.some(selected => selected.id === bale.id);
      
      if (isSelected) {
        // Remove bale from selection
        const updatedSelectedBales = prev.selectedBales.filter(
          selected => selected.id !== bale.id
        );
        
        return {
          ...prev,
          selectedBales: updatedSelectedBales,
          issueQty: updatedSelectedBales.length.toString(),
          totalBales: updatedSelectedBales.length,
          totalWeight: updatedSelectedBales.reduce((sum, b) => sum + (parseFloat(b.baleWeight) || 0), 0),
          totalValue: updatedSelectedBales.reduce((sum, b) => sum + (parseFloat(b.baleValue) || 0), 0)
        };
      } else {
        // Add bale to selection
        const updatedSelectedBales = [...prev.selectedBales, {
          id: bale.id,
          baleNo: bale.baleNo,
          baleWeight: parseFloat(bale.baleWeight) || 0,
          baleValue: parseFloat(bale.baleValue) || 0,
          grossWeight: parseFloat(bale.grossWeight) || 0,
          lotNo: bale.lotNo
        }];
        
        return {
          ...prev,
          selectedBales: updatedSelectedBales,
          issueQty: updatedSelectedBales.length.toString(),
          totalBales: updatedSelectedBales.length,
          totalWeight: updatedSelectedBales.reduce((sum, b) => sum + (parseFloat(b.baleWeight) || 0), 0),
          totalValue: updatedSelectedBales.reduce((sum, b) => sum + (parseFloat(b.baleValue) || 0), 0)
        };
      }
    });
  };

  // Handle mixing group selection
  const handleMixingGroupSelect = (group) => {
    setFormData(prev => ({
      ...prev,
      mixingGroupId: group.id,
      mixingGroupName: group.mixingName || `Group ${group.id}`
    }));
    setMixingGroupSearch(group.mixingName || `Group ${group.id}`);
    setShowMixingGroupDropdown(false);
  };

  // Handle mixing selection (which is actually toMixingGroupId)
  const handleMixingSelect = (mixing) => {
    setFormData(prev => ({
      ...prev,
      toMixingGroupId: mixing.id,
      toMixingGroupName: mixing.mixingName || mixing.mixingNo || `Mixing ${mixing.id}`,
      mixingNo: mixing.mixingNo || ''
    }));
    setMixingSearch(mixing.mixingName || mixing.mixingNo || `Mixing ${mixing.id}`);
    setShowMixingDropdown(false);
  };

  // Clear selections
  const clearMixingGroupSelection = () => {
    setFormData(prev => ({
      ...prev,
      mixingGroupId: '',
      mixingGroupName: ''
    }));
    setMixingGroupSearch('');
    setShowMixingGroupDropdown(false);
  };

  const clearMixingSelection = () => {
    setFormData(prev => ({
      ...prev,
      toMixingGroupId: '',
      toMixingGroupName: '',
      mixingNo: ''
    }));
    setMixingSearch('');
    setShowMixingDropdown(false);
  };

  const clearLotSelection = () => {
    setFormData(prev => ({
      ...prev,
      lotNo: '',
      selectedBales: [],
      availableBales: [],
      totalBales: 0,
      totalWeight: 0,
      totalValue: 0
    }));
    setLotSearch('');
    setShowLotDropdown(false);
    setAvailableBales([]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.issueDate) {
      setError('Issue date is required');
      return;
    }

    if (!formData.mixingGroupId) {
      setError('Please select a mixing group');
      return;
    }

    if (!formData.toMixingGroupId) {
      setError('Please select a mixing');
      return;
    }

    if (!formData.lotNo) {
      setError('Please select a lot number');
      return;
    }

    if (!formData.selectedBales || formData.selectedBales.length === 0) {
      setError('Please select at least one bale to issue');
      return;
    }

    try {
      // Prepare payload according to service structure
      const payload = {
        issueNumber: formData.issueNumber.trim(),
        issueDate: formData.issueDate,
        mixingNo: parseInt(formData.mixingNo, 10) || null,
        mixingGroupId: parseInt(formData.mixingGroupId, 10),
        toMixingGroupId: parseInt(formData.toMixingGroupId, 10),
        items: formData.selectedBales.map(bale => ({
          weightmentId: bale.id,
          issueWeight: parseFloat(bale.baleWeight)
        }))
      };
      
      console.log('Submitting payload:', payload);
      
      if (editingIssue) {
        // Update existing issue
        await issueService.update(editingIssue.id, payload);
        setSuccess('Issue updated successfully!');
      } else {
        // Create new issue
        await issueService.create(payload);
        setSuccess('Issue created successfully!');
      }
      
      // Refresh issues list
      fetchIssues();
      
      // Reset form and close modal
      resetForm();
      setShowModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      let errorMsg = 'Operation failed';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(`Failed to save issue: ${errorMsg}`);
    }
  };

  const handleEdit = async (issue) => {
    if (!issue || !issue.id) {
      setError('Invalid issue data');
      return;
    }
    
    setEditingIssue(issue);
    
    // Set basic form data from issue
    const basicFormData = {
      issueNumber: issue.issueNumber || issue.issueNo || '',
      issueDate: issue.issueDate || new Date().toISOString().split('T')[0],
      mixingNo: issue.mixingNo || '',
      mixingGroupId: issue.mixingGroupId || '',
      mixingGroupName: issue.mixingGroupName || '',
      toMixingGroupId: issue.toMixingGroupId || '',
      toMixingGroupName: issue.mixingName || '',
      lotNo: issue.lotNo || '',
      issueQty: issue.issueQty || (issue.issuedBales ? issue.issuedBales.length.toString() : '0'),
      selectedBales: issue.issuedBales || [],
      availableBales: [],
      totalBales: issue.issuedBales ? issue.issuedBales.length : 0,
      totalWeight: issue.issuedBales ? 
        issue.issuedBales.reduce((sum, b) => sum + (parseFloat(b.baleWeight) || 0), 0) : 0,
      totalValue: issue.issuedBales ? 
        issue.issuedBales.reduce((sum, b) => sum + (parseFloat(b.baleValue) || 0), 0) : 0
    };
    
    setFormData(basicFormData);
    setMixingGroupSearch(issue.mixingGroupName || '');
    setMixingSearch(issue.mixingName || '');
    setLotSearch(issue.lotNo || '');
    
    // Fetch available bales for this lot
    if (issue.lotNo && issue.issuedBales && issue.issuedBales.length > 0) {
      await fetchAvailableBales(issue.lotNo);
    }
    
    setShowModal(true);
  };

  const handleView = (issue) => {
    if (!issue || !issue.id) {
      setError('Invalid issue data');
      return;
    }
    
    setViewingIssue(issue);
    setShowViewModal(true);
  };

  const handleDelete = async (id, issueNo) => {
    if (!id || !issueNo) {
      setError('Invalid issue data for deletion');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete issue "${issueNo}"?`)) {
      return;
    }

    try {
      await issueService.delete(id);
      setSuccess('Issue deleted successfully!');
      fetchIssues();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete issue');
    }
  };

  const resetForm = () => {
    setFormData({
      issueNumber: '',
      issueDate: new Date().toISOString().split('T')[0],
      mixingNo: '',
      mixingGroupId: '',
      mixingGroupName: '',
      toMixingGroupId: '',
      toMixingGroupName: '',
      lotNo: '',
      issueQty: '',
      selectedBales: [],
      availableBales: [],
      totalBales: 0,
      totalWeight: 0,
      totalValue: 0
    });
    
    setMixingGroupSearch('');
    setMixingSearch('');
    setLotSearch('');
    setAvailableBales([]);
    setShowMixingGroupDropdown(false);
    setShowMixingDropdown(false);
    setShowLotDropdown(false);
    setEditingIssue(null);
    setViewingIssue(null);
  };

  const openCreateModal = () => {
    resetForm();
    fetchNextIssueNumber();
    setShowModal(true);
  };

  const exportIssues = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Issue No,Issue Date,Mixing Group,To Mixing,Mixing No,Lot No,Bales Issued,Total Weight,Total Value,Created Date\n" +
        filteredIssues.map(issue => {
          const balesCount = issue.issuedBales ? issue.issuedBales.length : 0;
          const totalWeight = issue.issuedBales ? 
            issue.issuedBales.reduce((sum, b) => sum + (parseFloat(b.baleWeight) || 0), 0) : 0;
          const totalValue = issue.issuedBales ? 
            issue.issuedBales.reduce((sum, b) => sum + (parseFloat(b.baleValue) || 0), 0) : 0;
          
          return `"${issue.issueNumber || issue.issueNo}","${issue.issueDate}","${issue.mixingGroupName || ''}","${issue.mixingName || ''}","${issue.mixingNo || ''}","${issue.lotNo || ''}","${balesCount}","${totalWeight.toFixed(2)}","${totalValue.toFixed(2)}","${issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'N/A'}"`;
        }).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `issue-entries-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Issues exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export issues');
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0.00';
    return parseFloat(num).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Issue Entry Management</h1>
            <p className="text-gray-600">Add, modify and manage lot-wise issue entries</p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <span className="mr-2">+</span>
            Create New Issue
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
          <span className="mr-2 mt-0.5 flex-shrink-0">⚠️</span>
          <div className="flex-1">{error}</div>
          <button onClick={() => setError('')} className="ml-2">
            ✕
          </button>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
          <span className="mr-2 mt-0.5 flex-shrink-0">✓</span>
          <div className="flex-1">{success}</div>
          <button onClick={() => setSuccess('')} className="ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search by issue number, mixing group, mixing no, or lot no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={exportIssues}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
            <button
              onClick={() => {
                fetchIssues();
                fetchMixingGroups();
                fetchMixings();
                fetchAvailableLotNumbers();
              }}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50"
            >
              <span className={`mr-2 ${loading ? 'animate-spin inline-block' : ''}`}>↻</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Issue Entries ({filteredIssues.length})
            </h2>
            <span className="text-sm text-gray-500">
              Showing {filteredIssues.length} of {issues.length} issues
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
            <p className="text-gray-600">Loading issue entries...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-5xl text-gray-400 mb-4 inline-block">📋</span>
            <p className="text-gray-600 mb-2">No issue entries found</p>
            {searchTerm ? (
              <p className="text-sm text-gray-500">
                Try adjusting your search
              </p>
            ) : (
              <button
                onClick={openCreateModal}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first issue entry
              </button>
            )}
          </div>
        ) : (
          /* Issues Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ISSUE DETAILS
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MIXING INFO
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BALE INFO
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CREATED DATE
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIssues.map((issue) => {
                  const balesCount = issue.issuedBales ? issue.issuedBales.length : 0;
                  const totalWeight = issue.issuedBales ? 
                    issue.issuedBales.reduce((sum, b) => sum + (parseFloat(b.baleWeight) || 0), 0) : 0;
                  
                  return (
                    <tr key={issue.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                            <span className="text-blue-600">#</span>
                          </div>
                          <div>
                            <div className="font-mono font-semibold text-gray-900">
                              {issue.issueNumber || issue.issueNo}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(issue.issueDate)}
                            </div>
                            <div className="text-xs mt-1">
                              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                                Lot: {issue.lotNo || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-2">📊</span>
                            <div className="text-sm font-medium text-gray-900">
                              {issue.mixingGroupName || `Group ${issue.mixingGroupId}`}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-2">→</span>
                            <div className="text-sm text-gray-600">
                              To: {issue.mixingName || `Mixing ${issue.toMixingGroupId}`}
                            </div>
                          </div>
                          {issue.mixingNo && (
                            <div className="flex items-center">
                              <span className="text-gray-400 mr-2">🏷️</span>
                              <div className="text-sm text-gray-500">
                                Mixing No: {issue.mixingNo}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-2">📦</span>
                            <div className="text-sm font-medium text-gray-900">
                              {balesCount} bales
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-400 mr-2">⚖️</span>
                            <div className="text-sm text-gray-600">
                              Total Weight: {formatNumber(totalWeight)} kg
                            </div>
                          </div>
                          {issue.issueQty && (
                            <div className="text-xs text-gray-500">
                              Qty: {issue.issueQty} bales
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(issue.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(issue)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
                          >
                            <span className="mr-1">👁️</span>
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(issue)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
                          >
                            <span className="mr-1">✏️</span>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(issue.id, issue.issueNumber || issue.issueNo)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
                          >
                            <span className="mr-1">🗑️</span>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Issue Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingIssue ? 'Edit Issue Entry' : 'Create New Issue Entry'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Basic Information */}
                  <div className="space-y-6">
                    {/* Issue Basic Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Issue Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Issue Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Issue Number {!editingIssue && '(Auto-generated)'}
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">#</span>
                            {issueNoLoading ? (
                              <div className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                                <span className="w-4 h-4 animate-spin inline-block mr-2 text-gray-400">↻</span>
                                <span className="text-gray-500">Generating issue number...</span>
                              </div>
                            ) : (
                              <input
                                type="text"
                                name="issueNumber"
                                value={formData.issueNumber}
                                onChange={handleInputChange}
                                required
                                readOnly={!editingIssue}
                                className={`w-full pl-10 pr-4 py-2 border ${!editingIssue ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white'} border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                placeholder={editingIssue ? "Edit issue number" : "Auto-generated"}
                              />
                            )}
                          </div>
                          {!editingIssue && formData.issueNumber && (
                            <p className="mt-1 text-xs text-green-600">
                              ✓ Issue number will be auto-generated: {formData.issueNumber}
                            </p>
                          )}
                        </div>

                        {/* Issue Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Issue Date *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📅</span>
                            <input
                              type="date"
                              name="issueDate"
                              value={formData.issueDate}
                              onChange={handleInputChange}
                              required
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Mixing Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mixing No
                          </label>
                          <input
                            type="number"
                            name="mixingNo"
                            value={formData.mixingNo}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter mixing number"
                          />
                        </div>

                        {/* Lot Number Dropdown */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Lot Number *
                          </label>
                          <div className="relative" ref={lotRef}>
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">🏷️</span>
                            <input
                              type="text"
                              value={lotSearch}
                              onChange={(e) => {
                                setLotSearch(e.target.value);
                                setShowLotDropdown(true);
                              }}
                              onFocus={() => setShowLotDropdown(true)}
                              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Select or search lot number..."
                              required
                            />
                            {formData.lotNo && (
                              <button
                                type="button"
                                onClick={clearLotSelection}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                ✕
                              </button>
                            )}
                            
                            {/* Lot Number Dropdown */}
                            {showLotDropdown && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {lotNumbersLoading ? (
                                  <div className="p-3 text-center text-gray-500">
                                    <span className="w-4 h-4 animate-spin inline-block mr-2">↻</span>
                                    Loading lot numbers...
                                  </div>
                                ) : filteredLotNumbers.length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">
                                    {lotSearch ? 'No lot numbers found' : 'No lot numbers available'}
                                  </div>
                                ) : (
                                  filteredLotNumbers.map((lot) => (
                                    <div
                                      key={lot.lotNo || lot}
                                      onClick={() => handleLotSelect(lot)}
                                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                        formData.lotNo === (lot.lotNo || lot) ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium text-gray-900">{lot.lotNo || lot}</div>
                                          {lot.balesQty && (
                                            <div className="text-xs text-gray-500">
                                              {lot.balesQty} bales available
                                            </div>
                                          )}
                                        </div>
                                        {formData.lotNo === (lot.lotNo || lot) && (
                                          <span className="w-4 h-4 text-blue-600">✓</span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          {!formData.lotNo && lotSearch && (
                            <p className="mt-1 text-xs text-red-500">Please select a lot number from the list</p>
                          )}
                        </div>

                        {/* Issue Quantity (Read-only) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Issue Quantity
                          </label>
                          <input
                            type="number"
                            name="issueQty"
                            value={formData.issueQty}
                            readOnly
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Auto-calculated"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Calculated from selected bales
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mixing Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Mixing Information</h4>
                      <div className="space-y-4">
                        {/* Mixing Group Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            From Mixing Group *
                          </label>
                          <div className="relative" ref={mixingGroupRef}>
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">📊</span>
                            <input
                              type="text"
                              value={mixingGroupSearch}
                              onChange={(e) => {
                                setMixingGroupSearch(e.target.value);
                                setShowMixingGroupDropdown(true);
                              }}
                              onFocus={() => setShowMixingGroupDropdown(true)}
                              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Search mixing groups..."
                              required
                            />
                            {formData.mixingGroupId && (
                              <button
                                type="button"
                                onClick={clearMixingGroupSelection}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                ✕
                              </button>
                            )}
                            
                            {/* Mixing Group Dropdown */}
                            {showMixingGroupDropdown && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {mixingGroupLoading ? (
                                  <div className="p-3 text-center text-gray-500">
                                    <span className="w-4 h-4 animate-spin inline-block mr-2">↻</span>
                                    Loading mixing groups...
                                  </div>
                                ) : filteredMixingGroups.length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">
                                    {mixingGroupSearch ? 'No mixing groups found' : 'No mixing groups available'}
                                  </div>
                                ) : (
                                  filteredMixingGroups.map((group) => (
                                    <div
                                      key={group.id}
                                      onClick={() => handleMixingGroupSelect(group)}
                                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                        formData.mixingGroupId === group.id ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium text-gray-900">{group.mixingName || `Group ${group.id}`}</div>
                                          <div className="text-xs text-gray-500">
                                            Code: #{group.code || group.mixingCode || group.id}
                                          </div>
                                        </div>
                                        {formData.mixingGroupId === group.id && (
                                          <span className="w-4 h-4 text-blue-600">✓</span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          {!formData.mixingGroupId && mixingGroupSearch && (
                            <p className="mt-1 text-xs text-red-500">Please select a mixing group from the list</p>
                          )}
                        </div>

                        {/* To Mixing Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            To Mixing Group *
                          </label>
                          <div className="relative" ref={mixingRef}>
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">→</span>
                            <input
                              type="text"
                              value={mixingSearch}
                              onChange={(e) => {
                                setMixingSearch(e.target.value);
                                setShowMixingDropdown(true);
                              }}
                              onFocus={() => setShowMixingDropdown(true)}
                              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Search mixings..."
                              required
                            />
                            {formData.toMixingGroupId && (
                              <button
                                type="button"
                                onClick={clearMixingSelection}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                ✕
                              </button>
                            )}
                            
                            {/* Mixing Dropdown */}
                            {showMixingDropdown && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {mixingLoading ? (
                                  <div className="p-3 text-center text-gray-500">
                                    <span className="w-4 h-4 animate-spin inline-block mr-2">↻</span>
                                    Loading mixings...
                                  </div>
                                ) : filteredMixings.length === 0 ? (
                                  <div className="p-3 text-center text-gray-500">
                                    {mixingSearch ? 'No mixings found' : 'No mixings available'}
                                  </div>
                                ) : (
                                  filteredMixings.map((mixing) => (
                                    <div
                                      key={mixing.id}
                                      onClick={() => handleMixingSelect(mixing)}
                                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                        formData.toMixingGroupId === mixing.id ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium text-gray-900">{mixing.mixingName || mixing.mixingNo || `Mixing ${mixing.id}`}</div>
                                          <div className="text-xs text-gray-500">
                                            Code: #{mixing.code || mixing.id}
                                          </div>
                                          {mixing.mixingNo && (
                                            <div className="text-xs text-gray-500">
                                              Mixing No: {mixing.mixingNo}
                                            </div>
                                          )}
                                        </div>
                                        {formData.toMixingGroupId === mixing.id && (
                                          <span className="w-4 h-4 text-blue-600">✓</span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          {!formData.toMixingGroupId && mixingSearch && (
                            <p className="mt-1 text-xs text-red-500">Please select a mixing from the list</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Total Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Total Summary</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm text-gray-600">Total Bales</div>
                          <div className="text-2xl font-bold text-blue-700">{formData.totalBales}</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-sm text-gray-600">Total Weight</div>
                          <div className="text-2xl font-bold text-green-700">
                            {formatNumber(formData.totalWeight)} kg
                          </div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-sm text-gray-600">Total Value</div>
                          <div className="text-2xl font-bold text-purple-700">
                            ₹{formatNumber(formData.totalValue)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Bale Selection */}
                  <div className="space-y-6">
                    {/* Stock Bales */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">Available Stock</h4>
                        <div className="text-sm text-gray-500">
                          {balesLoading ? (
                            <span className="flex items-center">
                              <span className="w-3 h-3 animate-spin inline-block mr-1">↻</span>
                              Loading...
                            </span>
                          ) : formData.lotNo ? (
                            `${availableBales.length} bales available for ${formData.lotNo}`
                          ) : (
                            'Select a lot number to view bales'
                          )}
                        </div>
                      </div>
                      
                      {formData.lotNo ? (
                        balesLoading ? (
                          <div className="text-center py-8">
                            <span className="text-4xl text-blue-600 animate-spin inline-block mb-4">↻</span>
                            <p className="text-gray-600">Loading available bales...</p>
                          </div>
                        ) : availableBales.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Select
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bale No.
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bale Wt. (kg)
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Gross Wt. (kg)
                                  </th>
                                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Value (₹)
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {availableBales.map((bale, index) => {
                                  const isSelected = formData.selectedBales.some(
                                    selected => selected.id === bale.id
                                  );
                                  
                                  return (
                                    <tr 
                                      key={index} 
                                      className={`cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                                      onClick={() => handleBaleSelect(bale)}
                                    >
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                          {isSelected ? (
                                            <span className="w-5 h-5 text-blue-600">☑</span>
                                          ) : (
                                            <span className="w-5 h-5 text-gray-300">□</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {bale.baleNo}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {formatNumber(bale.baleWeight)}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {formatNumber(bale.grossWeight)}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {bale.baleValue ? `₹${formatNumber(bale.baleValue)}` : 'N/A'}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <span className="text-5xl text-gray-400 mb-4 inline-block">📦</span>
                            <p className="text-gray-600">No bales available for this lot</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Make sure the lot number is correct
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-8">
                          <span className="text-5xl text-gray-400 mb-4 inline-block">📋</span>
                          <p className="text-gray-600">Select a lot number to view available bales</p>
                        </div>
                      )}
                    </div>

                    {/* Selected Bales for Issue */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">Selected Bales for Issue</h4>
                        <div className="text-sm text-gray-500">
                          {formData.selectedBales.length} bales selected
                        </div>
                      </div>
                      
                      {formData.selectedBales.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Bale No.
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Issue Wt. (kg)
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Bale Wt. (kg)
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Value (₹)
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {formData.selectedBales.map((bale, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {bale.baleNo}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {formatNumber(bale.baleWeight)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {formatNumber(bale.grossWeight || bale.baleWeight)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {bale.baleValue ? `₹${formatNumber(bale.baleValue)}` : 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <span className="text-5xl text-gray-400 mb-4 inline-block">📋</span>
                          <p className="text-gray-600">No bales selected for issue</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Select bales from the available stock above
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
                    disabled={!formData.issueNumber || !formData.issueDate || !formData.mixingGroupId || 
                             !formData.toMixingGroupId || !formData.lotNo || formData.selectedBales.length === 0}
                  >
                    {editingIssue ? 'Update Issue' : 'Create Issue'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Issue Details Modal */}
      {showViewModal && viewingIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Issue Entry Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Issue Details */}
              <div className="space-y-6">
                {/* Issue Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-2">#</span>
                      <h4 className="text-2xl font-bold text-gray-900">{viewingIssue.issueNumber || viewingIssue.issueNo}</h4>
                    </div>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-1">📅</span>
                        <span className="text-sm text-gray-600">Issue Date: {formatDate(viewingIssue.issueDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-1">🏷️</span>
                        <span className="text-sm text-gray-600">Lot: {viewingIssue.lotNo}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {viewingIssue.issueQty || (viewingIssue.issuedBales ? viewingIssue.issuedBales.length : 0)} Bales
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Mixing Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Mixing Information</h5>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-500">From Mixing Group</div>
                          <div className="font-medium text-gray-900">
                            {viewingIssue.mixingGroupName || `Group ${viewingIssue.mixingGroupId}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {viewingIssue.mixingGroupId}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">To Mixing Group</div>
                          <div className="font-medium text-gray-900">
                            {viewingIssue.mixingName || `Mixing ${viewingIssue.toMixingGroupId}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {viewingIssue.toMixingGroupId}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Mixing No</div>
                          <div className="font-medium text-gray-900">
                            {viewingIssue.mixingNo || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Summary</h5>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-500">Total Bales Issued</div>
                          <div className="font-bold text-gray-900 text-xl">
                            {viewingIssue.issueQty || (viewingIssue.issuedBales ? viewingIssue.issuedBales.length : 0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Total Weight</div>
                          <div className="font-bold text-green-700 text-xl">
                            {viewingIssue.issuedBales ? 
                              viewingIssue.issuedBales.reduce((sum, b) => sum + (parseFloat(b.baleWeight) || 0), 0).toFixed(2) : '0.00'} kg
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Total Value</div>
                          <div className="font-bold text-purple-700 text-xl">
                            ₹{viewingIssue.issuedBales ? 
                              viewingIssue.issuedBales.reduce((sum, b) => sum + (parseFloat(b.baleValue) || 0), 0).toFixed(2) : '0.00'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Issued Bales */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Issued Bales</h5>
                      {viewingIssue.issuedBales && viewingIssue.issuedBales.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Bale No.
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Bale Wt. (kg)
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Value (₹)
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {viewingIssue.issuedBales.map((bale, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {bale.baleNo}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {formatNumber(bale.baleWeight)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {bale.baleValue ? `₹${formatNumber(bale.baleValue)}` : 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-600">No bales issued</p>
                        </div>
                      )}
                    </div>

                    {/* Timestamps */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-gray-800 mb-3">Timestamps</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Created Date</div>
                          <div className="font-medium text-gray-900">
                            {viewingIssue.createdAt ? new Date(viewingIssue.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {viewingIssue.createdAt ? new Date(viewingIssue.createdAt).toLocaleTimeString() : ''}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Last Updated</div>
                          <div className="font-medium text-gray-900">
                            {viewingIssue.updatedAt ? new Date(viewingIssue.updatedAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {viewingIssue.updatedAt ? new Date(viewingIssue.updatedAt).toLocaleTimeString() : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(viewingIssue);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Edit Issue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueEntryManagement;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FilterData = () => {
  // State for dropdowns
  const [industryType, setIndustryType] = useState('');
  const [companyNames, setCompanyNames] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [stackNames, setStackNames] = useState([]);
  const [selectedStack, setSelectedStack] = useState('');
  const [stationType, setStationType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // State for data fetched from the backend
  const [filteredData, setFilteredData] = useState([]);

  // Industry Types
  const industryTypes = [
    { category: "Sugar" },
    { category: "Cement" },
    { category: "Distillery" },
    { category: "Petrochemical" },
    { category: "Pulp & Paper" },
    { category: "Fertilizer" },
    { category: "Tannery" },
    { category: "Pesticides" },
    { category: "Thermal Power Station" },
    { category: "Caustic Soda" },
    { category: "Pharmaceuticals" },
    { category: "Chemical" },
    { category: "Dye and Dye Stuff" },
    { category: "Refinery" },
    { category: "Copper Smelter" },
    { category: "Iron and Steel" },
    { category: "Zinc Smelter" },
    { category: "Aluminium" },
    { category: "STP/ETP" },
    { category: "NWMS/SWMS" },
    { category: "Noise" },
    { category: "Other" }
  ];

  // Station Types
  const stationTypes = [
    'effluent',
    'emission',
    'noise',
    'effluent_flow',
    'energy'
  ];

  // Fetch company names based on the selected industry type
  useEffect(() => {
    if (industryType) {
      axios.post('/api/get-company-names', { industryType })
        .then(response => {
          setCompanyNames(response.data.companyName || []);
        })
        .catch(error => {
          console.error('Error fetching company names:', error);
        });
    }
  }, [industryType]);

  // Fetch stack names based on the selected company
  useEffect(() => {
    if (selectedCompany) {
      axios.post('/api/get-stack-names', { companyName: selectedCompany })
        .then(response => {
          setStackNames(response.data.stackNames || []);
        })
        .catch(error => {
          console.error('Error fetching stack names:', error);
        });
    }
  }, [selectedCompany]);

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Data to send to backend
    const filterData = {
      industryType,
      companyNames: [selectedCompany],
      stackNames: [selectedStack],
      stationType,
      fromDate,
      toDate
    };

    axios.post('/api/get-filtered-data', filterData)
      .then(response => {
        setFilteredData(response.data.data);
        // Navigate to the data display page or render the data
      })
      .catch(error => {
        console.error('Error fetching filtered data:', error);
      });
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Industry Type Dropdown */}
        <label>Filter by Industry Type:</label>
        <select value={industryType} onChange={(e) => setIndustryType(e.target.value)}>
          <option value="">Select Industry Type</option>
          {industryTypes.map((type, index) => (
            <option key={index} value={type.category}>{type.category}</option>
          ))}
        </select>

        {/* Company Names Dropdown */}
        <label>Filter by Company Name:</label>
        <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} disabled={!industryType}>
          <option value="">Select Company</option>
          {companyNames.map((name, index) => (
            <option key={index} value={name}>{name}</option>
          ))}
        </select>

        {/* Stack Names Dropdown */}
        <label>Filter by Stack Name:</label>
        <select value={selectedStack} onChange={(e) => setSelectedStack(e.target.value)} disabled={!selectedCompany}>
          <option value="">Select Stack</option>
          {stackNames.map((name, index) => (
            <option key={index} value={name}>{name}</option>
          ))}
        </select>

        {/* Station Type Dropdown */}
        <label>Filter by Station Type:</label>
        <select value={stationType} onChange={(e) => setStationType(e.target.value)} disabled={!selectedStack}>
          <option value="">Select Station Type</option>
          {stationTypes.map((type, index) => (
            <option key={index} value={type}>{type}</option>
          ))}
        </select>

        {/* Date Pickers */}
        <label>From Date:</label>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        
        <label>To Date:</label>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />

        {/* Submission */}
        <p style={{ color: 'red' }}>Only the last 100 data will be displayed</p>
        <button type="submit">Submit</button>
      </form>

      {/* Render Filtered Data (Optional) */}
      <div>
        {filteredData.length > 0 && (
          <div>
            <h2>Filtered Data</h2>
            <pre>{JSON.stringify(filteredData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterData;

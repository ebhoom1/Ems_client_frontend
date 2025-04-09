import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Sector, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';
import axios from 'axios';
import carbon from '../../assests/images/carbon.png';
import { API_URL } from '../../utils/apiConfig';

// List of keys to exclude from the API data
const excludedKeys = [
  "STP", 
  "STP outlet", 
  " STP UF outlet", 
  " STP softener outlet", 
  "STP-energy"
];

const ConsumptionEmissionDashboard = () => {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  // For enlarging hovered pie segment
  const [activeIndex, setActiveIndex] = useState(null);

  // Retrieve selected username from session storage (set via header)
  const storedUserId = sessionStorage.getItem('selectedUserId');
  // Use a fallback username if not set (optional)
  const userName = storedUserId || 'MY_HOME017';

  // Fetch data from the API using the selected username
  useEffect(() => {
    const url = `${API_URL}/api/total-cumulating-flow?userName=${userName}`;
    console.log('Fetching API data from URL:', url);
    axios.get(url)
      .then(response => {
        if (response.data.success && response.data.data) {
          setApiData(response.data.data);
        }
      })
      .catch(error => {
        console.error("Error fetching API data", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userName]);
  
  // Build the sampleData array for the pie chart and compute total consumption.
  let sampleData = [];
  let totalConsumption = 0;
  if (apiData) {
    Object.keys(apiData).forEach((key) => {
      if (!excludedKeys.includes(key)) {
        const value = parseFloat(apiData[key]);
        if (!isNaN(value)) {
          sampleData.push({ name: key, value });
          totalConsumption += value;
        }
      }
    });
  }

  // Calculate carbon emission using the formula: totalConsumption * 0.708
  const carbonEmission = totalConsumption * 0.708;

  // Handler for pie chart hover
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // Custom Active Shape Renderer for the pie chart
  const renderActiveShape = (props) => {
    const {
      cx, cy, midAngle, innerRadius, outerRadius,
      startAngle, endAngle, fill, payload, value,
    } = props;

    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 5) * cos;
    const sy = cy + (outerRadius + 5) * sin;
    const mx = cx + (outerRadius + 10) * cos;
    const my = cy + (outerRadius + 10) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 12 : -12)}
          y={ey}
          textAnchor={cos >= 0 ? 'start' : 'end'}
          fill="#fff"
        >
          {`${payload.name} : ${value.toFixed(2)}`}
        </text>
      </g>
    );
  };

  // COLORS for the pie chart segments
  const COLORS = [
    '#effbfc', '#d6f3f7', '#b2e7ef', '#7dd5e3', '#41b9cf', '#269db4', '#227f98'
  ];

  // Display a simple loading message while data is being fetched
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='border border-solid shadow' style={styles.cardContainer}>
      <div style={styles.row}>
        {/* LEFT COLUMN: Donut Chart for Consumption Breakdown */}
        <div style={styles.column}>
          <div style={styles.chartWrapper}>
            <h5 className='text-center'>Consumption</h5>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ccc',
                    color: '#000',
                    borderRadius: '6px',
                    border: 'none',
                  }}
                  formatter={(value) => value.toFixed(2)}
                />
                <Pie
                  data={sampleData}
                  cx="50%"
                  cy="50%"
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={90}
                  fill="#8884d8"
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {sampleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                {/* Center text to display Total Consumption value inside the chart */}
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontSize={18}
                  fontWeight="bold"
                >
                  {totalConsumption.toFixed(2)}
                </text>
                <text
                  x="50%"
                  y="40%"
                  dy={20}
                  textAnchor="middle"
                  fill="#000"
                  fontSize={12}
                >
                  Total
                </text>
              </PieChart>
            </ResponsiveContainer>
            <p className='mt-4' style={styles.subText}>
              Hover to enlarge &amp; view details
            </p>
          </div>
        </div>

        {/* MIDDLE COLUMN: Total Consumption Card */}
        <div style={styles.column}>
          <div style={styles.totalCard}>
            <h4 style={{ marginBottom: '10px' }}>Total Consumption</h4>
            <div style={styles.consumptionValue}>
              <CountUp
                start={0}
                end={totalConsumption}
                duration={2.5}
                separator=","
                decimals={2}
              />
            </div>
            <p style={styles.footerText}>
              Sum of all stacks.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Carbon Emission Card */}
        <div style={styles.column}>
          <div style={styles.carbonCard}>
            <h4 style={{ marginBottom: '10px' }}>
              Carbon Emission <img src={carbon} alt="carbon" width="60px" />
            </h4>
            <div style={styles.emissionValue}>
              <CountUp
                start={0}
                end={carbonEmission}
                duration={2.5}
                separator=","
                decimals={2}
                suffix=" kg CO₂"
              />
            </div>
            <p style={styles.footerText}>
              Calculated as Total Consumption * 0.708.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inline styles for the component. You can also switch to CSS modules or styled-components if preferred.
const styles = {
  cardContainer: {
    backgroundColor: 'white',
    color: 'black',
    padding: '20px',
    borderRadius: '15px',
    width: '100%',
    maxWidth: '1200px', // Constrain maximum width for larger screens
    margin: '0 auto',
    fontFamily: 'sans-serif',
    marginBottom: '10px',
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap', // Allow columns to wrap on smaller screens
    justifyContent: 'space-between',
    gap: '20px',
  },
  column: {
    flex: '1 1 300px', // Allow columns to shrink and wrap; minimum basis: 300px
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  chartWrapper: {
    backgroundColor: '#fff',
    color: '#000',
    width: '100%',
    borderRadius: '10px',
    padding: '20px',
    boxSizing: 'border-box',
    position: 'relative',
  },
  totalCard: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: '10px',
    padding: '30px 20px',
    marginTop: '20px',
    boxSizing: 'border-box',
    textAlign: 'center',
    border: '2px dashed #236a80',
  },
  carbonCard: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: '10px',
    padding: '30px 20px',
    boxSizing: 'border-box',
    textAlign: 'center',
    border: '2px dashed #236a80',
    marginTop: '20px',
  },
  consumptionValue: {
    fontSize: '2.2rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#236a80',
  },
  emissionValue: {
    fontSize: '2.2rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#224857',
  },
  footerText: {
    fontSize: '0.9rem',
    color: '#777',
  },
  subText: {
    textAlign: 'center',
    color: '#777',
    marginTop: '10px',
    fontSize: '0.9rem',
  },
};

export default ConsumptionEmissionDashboard;

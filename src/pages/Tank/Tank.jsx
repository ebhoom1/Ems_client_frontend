import React, { useState } from 'react';
import { AgCharts } from 'ag-charts-react';

const MyChart = () => {
    const [options, setOptions] = useState({
        autoSize: true,
        data: [
            { month: 'Jan', value: 30 },
            { month: 'Feb', value: 20 },
            { month: 'Mar', value: 50 },
            { month: 'Apr', value: 40 },
            { month: 'May', value: 70 },
            { month: 'Jun', value: 60 },
        ],
        series: [{
            type: 'line',
            xKey: 'month',
            yKey: 'value',
        }],
    });

    return (
        <div className="my-chart">
            <AgCharts options={options} />
        </div>
    );
};

export default MyChart;

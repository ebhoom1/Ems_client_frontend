import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAverageDataByUserName } from '../../redux/features/iotData/iotDataSlice';
import Modal from 'react-modal';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const WaterGraphPopup = ({ isOpen, onRequestClose, parameter, userName }) => {
    const [timeInterval, setTimeInterval] = useState('hour');
    const [dataByInterval, setDataByInterval] = useState({});
    const [loadingByInterval, setLoadingByInterval] = useState({});
    const [errorByInterval, setErrorByInterval] = useState({});
    const dispatch = useDispatch();

    useEffect(() => {
        if (userName && parameter) {
            setLoadingByInterval(prevState => ({
                ...prevState,
                [timeInterval]: true
            }));
            setErrorByInterval(prevState => ({
                ...prevState,
                [timeInterval]: null
            }));

            dispatch(fetchAverageDataByUserName({ userName, interval: timeInterval }))
                .unwrap()
                .then((data) => {
                    setDataByInterval(prevState => ({
                        ...prevState,
                        [timeInterval]: data
                    }));
                })
                .catch(() => {
                    setDataByInterval(prevState => ({
                        ...prevState,
                        [timeInterval]: []
                    }));
                    setErrorByInterval(prevState => ({
                        ...prevState,
                        [timeInterval]: `${timeInterval} graph not found`
                    }));
                })
                .finally(() => {
                    setLoadingByInterval(prevState => ({
                        ...prevState,
                        [timeInterval]: false
                    }));
                });
        }
    }, [timeInterval, userName, parameter, dispatch]);

    const processData = (data, interval) => {
        if (!Array.isArray(data) || data.length === 0) {
            return { labels: [], values: [] };
        }
    
        let labels;
        switch (interval) {
            case 'hour':
                labels = data.map(entry => moment(entry.timestamp).format('HH:mm'));
                break;
            case 'day':
                labels = data.map(entry => moment(entry.timestamp).format('DD/MM'));
                break;
            case 'week':
                labels = data.map(entry => moment(entry.timestamp).format('ddd'));
                break;
            case 'month':
                labels = data.map(entry => moment(entry.timestamp).format('MMM'));
                break;
            case 'year':
                labels = data.map(entry => moment(entry.timestamp).format('YYYY'));
                break;
            default:
                labels = data.map(entry => entry.interval);
        }
    
        const values = data.map(entry => entry[parameter]);
        return { labels, values };
    };
    useEffect(() => {
        if (userName && parameter) {
            setLoadingByInterval(true);
            dispatch(fetchAverageDataByUserName({ userName, interval: timeInterval }))
                .unwrap()
                .then(data => setDataByInterval(data))
                .catch(error => setErrorByInterval(error.message))
                .finally(() => setLoadingByInterval(false));
        }
    }, [userName, parameter, timeInterval]);
    
    const { labels, values } = processData(dataByInterval[timeInterval], timeInterval);

    const chartData = {
        labels,
        datasets: [
            {
                label: parameter,
                data: values,
                fill: false,
                backgroundColor: '#82ca9d',
                borderColor: '#82ca9d',
            },
        ],
    };

    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '50%',
            height: '50%',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Data Popup"
            style={customStyles}
        >
            <h4>{parameter}</h4>
           
            <div className="btn-group" role="group" aria-label="Date Range">
                <button className="btn btn-primary" onClick={() => setTimeInterval('hour')}>Hour</button>
                <button className="btn btn-primary" onClick={() => setTimeInterval('day')}>Day</button>
                <button className="btn btn-primary" onClick={() => setTimeInterval('week')}>Week</button>
                <button className="btn btn-primary" onClick={() => setTimeInterval('month')}>Month</button>
                <button className="btn btn-primary" onClick={() => setTimeInterval('sixmonths')}>6 Months</button>
                <button className="btn btn-primary" onClick={() => setTimeInterval('year')}>Year</button>
            </div>
            {loadingByInterval[timeInterval] ? (
                <p>Loading...</p>
            ) : errorByInterval[timeInterval] ? (
                <p>{errorByInterval[timeInterval]}</p>
            ) : (
                <div style={{ width: '100%', height: '100%' }}>
                    <Line data={chartData} />
                </div>
            )}
        </Modal>
    );
};

export default WaterGraphPopup;
import React, { createContext, useState, useEffect } from 'react';


export const CalibrationContext = createContext();


export const CalibrationProvider = ({ children }) => {
    const [calibrations, setCalibrations] = useState([]);
    const [reports, setReports] = useState([]);

    
    useEffect(() => {
        const savedCalibrations = localStorage.getItem('calibrations');
        if (savedCalibrations) {
            setCalibrations(JSON.parse(savedCalibrations));
        }
        
        const savedReports = JSON.parse(localStorage.getItem('reports'));
        if (savedReports) {
            setReports(savedReports);
        }
    }, []);


    const addCalibration = (newCalibration) => {
        const updatedCalibrations = [...calibrations, newCalibration];
        setCalibrations(updatedCalibrations);
        localStorage.setItem('calibrations', JSON.stringify(updatedCalibrations));
    };

    const editCalibration = (index, updatedCalibration) => {
        const updatedCalibrations = [...calibrations];
        updatedCalibrations[index] = updatedCalibration;
        setCalibrations(updatedCalibrations);
        localStorage.setItem('calibrations', JSON.stringify(updatedCalibrations));
    };

    const deleteCalibration = (index) => {
        const updatedCalibrations = calibrations.filter((_, i) => i !== index);
        setCalibrations(updatedCalibrations);
        localStorage.setItem('calibrations', JSON.stringify(updatedCalibrations));
    };

    
    const addReport = (newReport) => {
        const updatedReports = [...reports, newReport];
        setReports(updatedReports);
        localStorage.setItem('reports', JSON.stringify(updatedReports)); 
    };

   
    const deleteReport = (index) => {
        const updatedReports = reports.filter((_, i) => i !== index);
        setReports(updatedReports);
        localStorage.setItem('reports', JSON.stringify(updatedReports)); 
    };
    return (
        <CalibrationContext.Provider value={{
            calibrations, addCalibration, editCalibration, deleteCalibration,
            reports, addReport, deleteReport
        }}>
            {children}
        </CalibrationContext.Provider>
    );
};

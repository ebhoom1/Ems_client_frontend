import React, { useEffect, useState } from "react";
import axios from "axios"
import './index.css'
import { API_URL } from "../../utils/apiConfig";

const CalibrationPopup=({userName,onClose})=>{

    const [calibrationData,setCalibrationData] = useState(null);
    

useEffect(()=>{
    const fetchCalibrationData = async ()=>{
        try{
            const response = await axios.get(`${API_URL}/api/find-calibration-by-userId/${userName}`);
            const data = response.data
            if(data.success){
                setCalibrationData(data.calibration);
                
            }else{
                console.log("Error in fetching calibration Data");
                
            }
        }catch(error){
            console.error("Catch Error in fetchCalibrationData:",error);
           
        };
       
    }
    fetchCalibrationData();
},[userName])
    return(
        <div className="popup-container">
            <div className="popup">
                <button className="close-btn"onClick={onClose}>
                    <span className="icon-cross">X</span>
                    <span className="visually-hidden">Close</span>
                </button>
                <div className="calibration-details">
                <p className="card-text">Date:<strong> {calibrationData && calibrationData.date}</strong></p>
                <p className="card-text">User ID: <strong>{calibrationData && calibrationData.userName}</strong></p>
                <p className="card-text">Model Name: <strong>{calibrationData && calibrationData.equipmentName}</strong></p>
                <h1 className="card-title"> <b>RESULTS</b></h1>
                <p className="card-text">Before: <strong>{calibrationData && calibrationData.before}</strong></p>
                <p className="card-text">After: <strong>{calibrationData && calibrationData.after}</strong></p>
                <p className="card-text">notes: <strong>{calibrationData && calibrationData.notes}</strong></p>
   
   
</div>

            </div>     
        </div>
    )
}

export default CalibrationPopup;
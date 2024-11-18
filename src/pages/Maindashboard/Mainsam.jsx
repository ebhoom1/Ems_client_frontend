import React from 'react'
import DashboardSam from '../Dashboard/DashboardSam'
import Hedaer from '../Header/Hedaer'
import Maindashboard from './Maindashboard'
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import './maindashboard.css';
import { Button } from 'react-bootstrap';
import filter from '../../assests/images/filter-removebg-preview.png';
import { Link, useNavigate } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import { useSelector } from 'react-redux';

function Mainsam() {
    const navigate = useNavigate();
    const { userType } = useSelector((state) => state.user);
  
    const handleCalibration = () => {
      navigate('/calibartion');
    };
  
    const handleReport = () => {
      navigate('/report');
    };
  
    const handleDownload = () => {
      navigate('/download');
    };
  
    const handleParameter = () => {
      navigate('/view-parameter');
    };
  return (
    <div>
    <div className="container-fluid" style={{overflowX:'hidden'}}>
        <div className="row" style={{overflowX:'hidden'}}>
        <div className="col-lg-3 d-none d-lg-block ">
                      
                    </div>
       
          <div className="col-lg-9 col-12 ">
            <div className="row">
              <div className="col-12">
            
              </div>
            </div>
    
        
          </div>
          
    
        </div>
      </div>
    
      <div className="container-fluid">
          <div className="row">
         
            <div className="col-lg-3 d-none d-lg-block">
           
            </div>
         
            <div className="col-lg-9 col-12">
              <div className="row">
                <div className="col-12">
                  
                </div>
              </div>
            
            
     <div className="container-fluid water">
          <div className="row" style={{overflowX:'hidden'}}>
            
            <div className="col-lg-12 col-12">
              
              <div className='d-flex justify-content-between prevnext  ps-5 pe-5'>
                <div>
                  {/* prev button */}
                </div>
              
              </div>
            
              
    
              <div className="row" style={{ overflowX: 'hidden' }}>
                <div className="col-12 col-md-12 grid-margin">
                  <div className="col-12 d-flex justify-content-between align-items-center m-3"></div>
                  <div className="col-lg-9 col-12 airambient-section w-100">
                  <Navbar expand="lg" className="navbg p-3 shadow" style={{ borderRadius: '10px'}}>
            <div className='d-flex justify-content-between gap-2 w-100'>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav" >
                <Nav className="w-100 justify-content-evenly">
                  <Nav.Link href="/water">Water</Nav.Link>
                  <Nav.Link href="/ambient">Ambient Air</Nav.Link>
                  <Nav.Link href="/noise">Noise</Nav.Link>
                  <Nav.Link href="/quantity">Quantity</Nav.Link>

                
                                 <Nav.Link href="/energy">Energy</Nav.Link>
                  
                  <Dropdown>
  <Dropdown.Toggle 
    as={Nav.Link} 
    id="filter-dropdown" 
    bsPrefix="p-0 pt-2"
  >
    <img src={filter} alt="Filter" width="25px" style={{ verticalAlign: 'middle', bottom: '30%' }} />
  </Dropdown.Toggle>

  <Dropdown.Menu className="no-scroll-dropdown p-3">
  <div className="form-check">
      <input type="checkbox" className="form-check-input" id="industry-type" />
      <label className="form-check-label" htmlFor="industry-type">Company </label>
    </div>
    <div className="form-check">
      <input type="checkbox" className="form-check-input" id="industry-type" />
      <label className="form-check-label" htmlFor="industry-type">Industry Type</label>
    </div>
   
    <div className="form-check">
      <input type="checkbox" className="form-check-input" id="district" />
      <label className="form-check-label" htmlFor="district">District</label>
    </div>
    <div className="form-check">
      <input type="checkbox" className="form-check-input" id="state" />
      <label className="form-check-label" htmlFor="state">State</label>
    </div>
    <div className="d-flex justify-content-start mt-3">
      <Button variant="#236a80" size="sm"  style={{backgroundColor:'#236a80' , color:'white'}}>
        Select
      </Button>
    </div>
  </Dropdown.Menu>
</Dropdown>

                </Nav>
              </Navbar.Collapse>
              <div className='homeSearch2'>
                <div style={{ position: 'relative' }} className='w-70 px-1 d-flex justify-content-center align-items-center'>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="p-3 shadow" 
                  style={{ 
                    borderRadius: '10px', 
                    border: 'none', 
                    // paddingRight: '40px' ,
                    // marginInline:'10px',
                    width:'80%'
                  }} 
                />
                <i 
                  className="fa fa-search" 
                  style={{ 
                    position: 'absolute', 
                    top: '48%', 
                    right: '30px', 
                    transform: 'translateY(-50%)', 
                    color: '#aaa' 
                  }} 
                ></i>
              </div>
              </div>
            </div>
          </Navbar>
          {userType !== 'user' && (

<div className='flex-md-row  mt-3 button-section'>
  <div className='d-flex  flex-md-row justify-content-around align-items-center '>
  <Dropdown className='m-2 buttonbg rounded'>
<Dropdown.Toggle 
className="btn buttonbg shadow" 
style={{ background: '#236a80', border: 'none' }}
id="dropdown-basic"
>
Calibration
</Dropdown.Toggle>

<Dropdown.Menu>
<Dropdown.Item href="/add-calibration">Add Calibration</Dropdown.Item>
<Dropdown.Item href="/view-calibration">View Calibration</Dropdown.Item>
</Dropdown.Menu>
</Dropdown>

    <Dropdown className='m-2'>
      <Dropdown.Toggle className="btn buttonbg shadow" style={{ background: '#236a80', border: 'none' }}>
        Report
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item href="/report">Add Report</Dropdown.Item>
        <Dropdown.Item href="/view-report">View Report</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  </div>

  <div className='d-flex flex-md-row ' style={{backgroundColor : 'transparent'}}>
    <Button className="btn buttonbg shadow m-2 p-0" onClick={handleDownload} style={{ background: '#236a80', border: 'none' }}>
      Download
    </Button>

    <Button className="btn buttonbg shadow m-2" onClick={handleParameter} style={{ background: '#236a80', border: 'none' }}>
      Parameter Exceedence
    </Button>
  </div>
</div>
 )}
                   
                  </div>
                </div>
              </div>
            </div>
          </div>
    
        
        </div>
    
            </div>
          </div>
        </div>
    
    
        
        </div>
  )
}

export default Mainsam
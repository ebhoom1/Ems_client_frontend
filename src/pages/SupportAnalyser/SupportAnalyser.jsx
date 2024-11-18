import React from 'react'
import { Button } from 'react-bootstrap';  // Import Button
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  // Toastify styles
import { useNavigate } from 'react-router-dom';
import FooterM from '../FooterMain/FooterM';
import Maindashboard from '../Maindashboard/Maindashboard';
import DashboardSam from '../Dashboard/DashboardSam';
import './support.css'
import Hedaer from '../Header/Hedaer';

function SupportAnalyser() {
    const navigate = useNavigate();

  
    const handlehome=()=>{
        navigate('/')
    }
  return (
    <div className="container-fluid">
    <div className="row ">
        {/* Sidebar (hidden on mobile) */}
        <div className="col-lg-3 d-none d-lg-block ">
            <DashboardSam />
        </div>
        {/* Main content */}
        <div className="col-lg-9 col-12 ">
            <div className="row">
                <div className="col-12">
                  <Hedaer/>
                </div>
            </div>
            <div>
          <div className="row mb-4" style={{overflowX:'hidden'}}>
            <div className="col-12 col-md-12 grid-margin">
            <div className="row page-title-header mb-4">
        <div className="col-12">
        <div className="page-header d-flex justify-content-between align-items-center mt-3">
  <h4 className="page-title">Support Dashboard</h4>
  <div className="quick-link-wrapper">
    <ul className="quick-links d-flex" style={{textDecoration:'none'}}>
      <li><a href="#" style={{textDecoration:'none'}}>Settings</a></li>
      <li><a href="#" style={{textDecoration:'none'}}>Option 1</a></li>
      <li><a href="#" style={{textDecoration:'none'}}>Option 2</a></li>
    </ul>
  </div>
</div>

        </div>
      </div>
     
      <div className="card m-2 scrollable-card">
  <div className="card-body">
    <form className=''>
      <div className="row rowback p-3">
        <table className="m-2 table-borderless rowback p-3"  >
          <thead className='m-2 p-4'>
            <tr className='p-3'>
              <th style={{ padding: '10px' }}>Sl No</th>
              <th className="custom-width" style={{ padding: '10px' }}>Company Name</th>
              <th className="custom-width" style={{ padding: '10px' }}>Contact Person</th>
              <th className="custom-width" style={{ padding: '10px' }}>Contact No.</th>
            </tr>
          </thead>
          <tbody className='m-5'>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>1</td>
              <td style={{ padding: '10px' }}>M/S Environnement S. A India Pvt. Ltd.</td>
              <td style={{ padding: '10px' }}>Sh. Sardesai</td>
              <td style={{ padding: '10px' }}>9930503658</td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>2</td>
              <td style={{ padding: '10px' }}>M/S Chemtrols Industries Ltd.</td>
              <td style={{ padding: '10px' }}>Sh. Pankaj Rai</td>
              <td style={{ padding: '10px' }}>9967770255</td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>3</td>
              <td style={{ padding: '10px' }}>M/S Forbes Marshall CODEL Pvt. Ltd.</td>
              <td style={{ padding: '10px' }}>Sh. Amarsingh Sandhu</td>
              <td style={{ padding: '10px' }}>9810110794</td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>4</td>
              <td style={{ padding: '10px' }}>M/S Horiba India Pvt. Ltd.</td>
              <td style={{ padding: '10px' }}>Sh. Samir Buwa</td>
              <td style={{ padding: '10px' }}>9561089732</td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>5</td>
              <td style={{ padding: '10px' }}>M/S Thermo Fisher Scientific India Ltd.</td>
              <td style={{ padding: '10px' }}>Sh. Gautam Sakuja</td>
              <td style={{ padding: '10px' }}>9650314545</td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>6</td>
              <td style={{ padding: '10px' }}>M/S ABB India Ltd.</td>
              <td style={{ padding: '10px' }}>Sh. Tejbir Singh</td>
              <td style={{ padding: '10px' }}>9810260345</td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>7</td>
              <td style={{ padding: '10px' }}>M/S Swan Environmental Pvt. Ltd.</td>
              <td style={{ padding: '10px' }}>Sh. Murali</td>
              <td style={{ padding: '10px' }}>9642225234</td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>8</td>
              <td style={{ padding: '10px' }}>M/S Yokogawa India Ltd.</td>
              <td style={{ padding: '10px' }}>Sh. Abhishek Singh</td>
              <td style={{ padding: '10px' }}>9971457778</td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>9</td>
              <td style={{ padding: '10px' }}>M/S Durag India Instrumentation Pvt. Ltd.</td>
              <td style={{ padding: '10px' }}>Sh. Binny Phabian</td>
              <td style={{ padding: '10px' }}>9886395650</td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>10</td>
              <td style={{ padding: '10px' }}>M/S Shreetech Instrumentation</td>
              <td style={{ padding: '10px' }}>Sh. Sharad Lohia</td>
              <td style={{ padding: '10px' }}>9821350876</td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>11</td>
              <td style={{ padding: '10px' }}>M/S Adage Automation Pvt. Ltd.</td>
              <td style={{ padding: '10px' }}>Sh. M. K. Roy</td>
              <td style={{ padding: '10px' }}>9910474732</td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>12</td>
              <td style={{ padding: '10px' }}>M/S ICE (Asia) Pvt. Ltd.</td>
              <td style={{ padding: '10px' }}>Sh. Sanjeev Matushte</td>
              <td style={{ padding: '10px' }}>9820231013</td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>13</td>
              <td style={{ padding: '10px' }}>M/S Nevco Engineers Pvt. Ltd.</td>
              <td style={{ padding: '10px' }}>Sha Adish Kapoor</td>
              <td style={{ padding: '10px' }}>9873246469</td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>14</td>
              <td style={{ padding: '10px' }}>M/S Analyser Instrument Co. Pvt. Ltd.</td>
              <td style={{ padding: '10px' }}>Sh. K. B. Jain</td>
              <td style={{ padding: '10px' }}>9413652925</td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>15</td>
              <td style={{ padding: '10px' }}>M/S Prima Hi-Tech Equipment Pvt. Ltd.</td>
              <td style={{ padding: '10px' }}></td>
              <td style={{ padding: '10px' }}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </form>
  </div>
</div>

<div className="card m-2 scrollable-card">
  <div className="card-body">
    <form>
      <div className="row rowback p-3">
        <table className="m-2 table-borderless rowback p-3">
          <thead className="m-2 p-4">
            <tr className="p-3">
              <th style={{ padding: '10px' }}>Sl No</th>
              <th className="custom-width" style={{ padding: '10px' }}>Company Name</th>
              <th className="custom-width" style={{ padding: '10px' }}>Address</th>
              <th className="custom-width" style={{ padding: '10px' }}>Contact No.</th>
              <th className="custom-width" style={{ padding: '10px' }}>E-Mail</th>
            </tr>
          </thead>
          <tbody className="m-5">
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>1</td>
              <td style={{ padding: '10px' }}>M/S. Endistriyel Mesur Technologies Pvt ltd.</td>
              <td style={{ padding: '10px' }}>
                No.49, Bavanandhiyar Street, 4th Cross, Sembakkam, Chennai-6000073, Tamilnadu, India.
              </td>
              <td style={{ padding: '10px' }}>
                +91 44-48562613, +91 7010234574, +91 9789397772, +91 9025365398
              </td>
              <td style={{ padding: '10px' }}>
                sales@e-mesur.com, info@e-mesure.com
              </td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>2</td>
              <td style={{ padding: '10px' }}>M/S. Vasthi instrument Pvt Ltd.</td>
              <td style={{ padding: '10px' }}>
                Plot No. 21&22, Block No.24, Phase — 4, AutoNagar, Guntur-522001, Andhar Pradesh.
              </td>
              <td style={{ padding: '10px' }}>+91 7382708685, +91 8002223613</td>
              <td style={{ padding: '10px' }}>info@vasthi.com</td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>3</td>
              <td style={{ padding: '10px' }}>M/s AADHAV INTECH</td>
              <td style={{ padding: '10px' }}>
                Door No : 5/1, First Floor, Saibaba Street, West Mambalam, Chennai 600033, Tamil Nadu, India
              </td>
              <td style={{ padding: '10px' }}>+91 9629466446, +91 7092466445</td>
              <td style={{ padding: '10px' }}>
                Sales@aadhavintech.com, service@aadhavintech.com
              </td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>4</td>
              <td style={{ padding: '10px' }}>M/s Transtech Solutions</td>
              <td style={{ padding: '10px' }}>
                10/26, Vinayagapuram 6th Street, Rayapuram Extn., Tiruppur-641 601
              </td>
              <td style={{ padding: '10px' }}>
                0421 4328112, +91 98422 83112, +91 90927 83112
              </td>
              <td style={{ padding: '10px' }}>
                transtechmuthu@gmail.com
              </td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>5</td>
              <td style={{ padding: '10px' }}>M/s RL Technologies Pvt. Ltd.</td>
              <td style={{ padding: '10px' }}>
                No.2, Rangarajapuram 1st street, Kodambakkam, Chennai -600024
              </td>
              <td style={{ padding: '10px' }}>+91-044 -2480 6500</td>
              <td style={{ padding: '10px' }}>
                chennai@rltech.in
              </td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>6</td>
              <td style={{ padding: '10px' }}>M/S. Nevco Engineers Pvt Ltd.</td>
              <td style={{ padding: '10px' }}>
                90A, 2nd floor, Opposite Iskon Temple, Amritpuri B, Main Road, East Kailash, Delhi- 110065
              </td>
              <td style={{ padding: '10px' }}>
                +91 11-41717112/3/4/5
              </td>
              <td style={{ padding: '10px' }}>
                delhi@nevcoengineers.com, sales@nevcoengineers.com
              </td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>7</td>
              <td style={{ padding: '10px' }}>M/S. Ideatec Softwares (India) Pvt Ltd.</td>
              <td style={{ padding: '10px' }}>
                192, 2nd Floor, Gandhipuram 1st Street, Coimbatore - 641012
              </td>
              <td style={{ padding: '10px' }}>
                +91 98947-80016, +91 98947-80037, +91 98947-80011, 0422-4371320
              </td>
              <td style={{ padding: '10px' }}>
                readmeter@ideate.co.in
              </td>
            </tr>
            <tr>
              <td className="fw-bold" style={{ padding: '10px' }}>8</td>
              <td style={{ padding: '10px' }}>M/S Chemtrols Industries Ltd.</td>
              <td style={{ padding: '10px' }}>
                13, Block 1, SIDCO Electronics Complex, Guindy Industrial Estate, Guindy, Chennai 600032
              </td>
              <td style={{ padding: '10px' }}>
                044 43054191 /92/93/94, 9840110602
              </td>
              <td style={{ padding: '10px' }}>
                Snmoorthy@chemtrols.com
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </form>
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

export default SupportAnalyser
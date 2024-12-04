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

    const tableData = [
      {
        technology: "UV Spectrophotometry (Single/two/four wavelengths)",
        parametersMeasured: "COD, BOD",
        applications: "Fresh Water analysis with constant matrix",
        limitations: "Suitable for fresh water and not for waste water analysis. Interference of colour & high turbidity. Suitable for stable matrix. Single bond organic compounds are not measured."
      },
      {
        technology: "UV-Vis Spectrophotometry (40 wavelength)",
        parametersMeasured: "COD, BOD, TSS",
        applications: "Fresh Water & Waste Water analysis with constant matrix",
        limitations: "Many organic compounds are unattended due to lesser scanning of UV spectra. Suitable for stable matrix. Any matrix change would require revalidation of factor. Sample pumping limitation."
      },
      {
        technology: "UV-Visible Spectrophotometry (Single Beam)",
        parametersMeasured: "COD, BOD, TSS",
        applications: "Fresh Water & Waste Water analysis.",
        limitations: "Interference due to colour & high turbidity affects the analysis. Reference beam compensation not available. Suitable for stable matrix. Any matrix change would require revalidation of factor."
      },
      {
        technology: "UV-Vis Spectrophotometry (Double beam with entire spectrum scanning)",
        parametersMeasured: "COD, BOD, TSS",
        applications: "Fresh water to Waste water analysis.",
        limitations: "Interference of colour & turbidity is compensated in visible spectrum. Any matrix change would require revalidation of factor."
      },
      {
        technology: "Combines Combustion Catalytic Oxidation at 680°C and NDIR Method",
        parametersMeasured: "TOC (Co-relation with BOD & COD)",
        applications: "Fresh Water and Waste Water analysis.",
        limitations: "- Carrier gases required\n- Continuous High power requirement\n- For Analyser: Infrastructure is required\n- More than 10-15 minutes sampling frequency.\n- Only TOC can be measured.\n- Any matrix change requires fresh correlation to COD & BOD"
      },
      {
        technology: "UV Persulfate NDIR Detector",
        parametersMeasured: "TOC (Co-relation with BOD & COD)",
        applications: "Fresh Water & Waste Water analysis.",
        limitations: "- Carrier gases required\n- Continuous High power requirement\n- Analyser: Infrastructure required.\n- More than 10-15 minutes sampling frequency.\n- Only TOC can be measured.\n- Any matrix change requires fresh correlation to COD & BOD"
      },
      {
        technology: "Persulfate Oxidation at 116-130°C NDIR Detector",
        parametersMeasured: "TOC (Co-relation with BOD & COD)",
        applications: "Fresh Water & Waste Water analysis.",
        limitations: "Applicable for moderate polluted effluent.\n- Carrier gases required\n- Analyser: Infrastructure required\n- Any matrix change requires fresh correlation to COD & BOD"
      },
      {
        technology: "Measuring COD using Potassium dichromate (K2Cr2O7) + Calorimetric",
        parametersMeasured: "COD",
        applications: "Fresh Water & Waste Water analysis.",
        limitations: "Discharge of hazardous chemicals."
      },
      {
        technology: "Electrode/Electrochemical method",
        parametersMeasured: "pH",
        applications: "Fresh Water & Waste Water analysis.",
        limitations: "-- Electrode life"
      },
      {
        technology: "Scattered Light Method (IR)",
        parametersMeasured: "TSS",
        applications: "Fresh Water & Waste Water analysis.",
        limitations: "---"
      },
      {
        technology: "Nephelometry Method",
        parametersMeasured: "TSS",
        applications: "Fresh Water & Less turbid water",
        limitations: "Fresh Water analysis with Low turbidity"
      },
      {
        technology: "Colorimetric (645-655nm)",
        parametersMeasured: "NH3",
        applications: "Fresh Water & Waste Water analysis.",
        limitations: "Turbidity interference is there which can be overcome."
      },
      {
        technology: "Ion Selective Electrode method With temp correction",
        parametersMeasured: "NH3",
        applications: "Fresh Water & Waste Water analysis.",
        limitations: "Interference from Potassium. Requires additional measurement of potassium for compensation."
      },
      {
        technology: "UV Absorbance or Multiple Wavelength UV Absorbance Spectrophotometers (200-450nm)",
        parametersMeasured: "NH3",
        applications: "Fresh Water & Waste Water analysis.",
        limitations: "Turbidity interference is there which can be overcome."
      },
      {
        technology: "Colorimetric method Reaction of Cr-VI with diphenyl carbazide in acid solution",
        parametersMeasured: "Chromium",
        applications: "Fresh Water & Waste Water analysis.",
        limitations: "Experience in Indian condition is not available."
      },
      {
        technology: "Voltammetry (Anodic Stripping Voltammetry)",
        parametersMeasured: "Chromium",
        applications: "Fresh Water analysis.",
        limitations: "Experience in Indian condition is not available."
      },
      {
        technology: "Dual Beam UV-Visible Spectrophotometry",
        parametersMeasured: "Chromium Hexavalent and Trivalent in full spectrum",
        applications: "Fresh water & waste water analysis.",
        limitations: "Experience in Indian condition is not available."
      },
      {
        technology: "Voltammetry (Anodic Stripping Voltammetry)",
        parametersMeasured: "Arsenic",
        applications: "Fresh Water analysis.",
        limitations: "Experience in Indian condition is not available."
      }
    ];
    
    const nextTableData = [
      {
        technique: "Chimiluminescence Dilution Extractive",
        type: "Dilution Extractive* (Technology not suitable for other emission parameters like SO2, CO2, CO etc.) ",
        parametersMeasured: "NO2 estimated as calculated (NOx - NO)",
        comments: "- Indirect method for NO2 measurement. NO and NOX (NO + converted other Nitrogen oxides) measured in two cycles.\n*NO2 estimated as calculated (NOx - NO).\n- Used for stack emission measurement with additional accessories like dilution probe, sample transfer line, dilution air, pumps, and ozone generator.\n- Advantageous in industries where heating probe and transfer lines are avoided (e.g., refinery, petrochemicals).\n- Requires efficient purification system for dilution air.\n- Quench Effect of CO2/water vapour, etc. maintaining Low Pressure becomes important. Can be eliminated by increased O3 flow and requires continuous efforts and mechanism for it."
      },
      {
        technique: "UV Fluorescence Dilution Extractive",
        type: "Dilution Extractive",
        parametersMeasured: "SO2, H2S*, TRS* (Total Reduced Sulphur)(Technology not suitable for other emission parameters like NOx, CO2, CO etc.) ",
        comments: " H2S, TRS Cannot be measured simultaneously with SO2 - Direct method for SO2.\n- Used for stack emission measurement with additional accessories like dilution probe, sample transfer line, dilution air, pumps etc.\n- Advantageous in industries where heating probe and transfer lines are avoided (e.g., refinery, petrochemicals).\n- Quench Effect of CO2/Moisture, etc. maintaining Low Pressure becomes important."
      },
      {
        technique: "NDIR (IR GFC, CFM-NDIR and NDIR)",
        type: "In-Situ & Extractive",
        parametersMeasured: "CO, CO2, SO2, NOx, CH4, HCl, H2O",
        comments: "- A direct method for continuous monitoring of multiple gases without any dilution.\n- Suitable for high concentrations.\n- The IR technology has limitations: it can measure only NO. For measuring NOx, a converter is needed to reduce other oxides of nitrogen to NO.\n- In-situ NDIR analyser uses Internal optical filters (GFC) for removal of interferences of other gases.\n- In extractive NDIR, issues of dissolution and stripping of CO2/SO2 can underestimate the measured concentration, in case calibration does not follow the same system of sample transfer.\n- Maintaining Low Pressure becomes important."
      },
      {
        technique: "NDUV",
        type: "In-situ & Extractive",
        parametersMeasured: "SO2, NO, NO2, NH3, Cl2, CS2, etc.",
        comments: "- A direct method for continuous monitoring of multiple gases suitable for up to 2-3 gas measurements without any dilutions.\n- Popular in harsh applications in a wide spectrum of industrial processes.\n- For NH3, Hot wet extractive and Dilution systems are suitable."
      },
      {
        technique: "Fourier Transformed Infra-Red (FTIR)",
        type: "Extractive",
        parametersMeasured: "CO, CO2, SO2, NO, NO2, N2O, NH3, HF, HCl, CH4, Moisture (H2O), VOC, etc.",
        comments: "- A direct method for continuous monitoring of multiple gases up to 5 - 12 gases using high-end spectroscopy technique.\n- H2O measurement in FTIR spectroscopy is necessary for moisture correction.\n- Uses Hot Wet Preferred technique for complex stack gas matrices like waste incinerators or waste-to-power plants, alternative fuels fired Cement Plants, with high moisture and soluble gases.\n- High price, however, with multi-complex gases and integrated modules like VOC, O2 makes it cost-effective overall.\n- Ideal for very low concentration of NH3, HF, HCl."
      },
      {
        technique: "Differential Optical Absorption Spectroscopy (DOAS)",
        type: "Open Path cross duct",
        parametersMeasured: "NO, NO2, SO2, NH3, Hg (with DOAS-UV), CO, CO2, HCl, CH4, VOC, H2O, HF etc. (with DOAS-IR)",
        comments: "- Suitable for monitoring of multiple gases.\n- Suitable for trace measurements.\n- Indirect measurement technique.\n- Stable, comparatively low calibration requirements.\n- Measurement of Hg requires its conversion to elemental form for UV DOAS, for which the system is required to be equipped with heated gas probe, heated sample transfer line and heated measurement cell.\n- Removal of SO2 interference is essential in case of UV measurement of mercury."
      },
      {
        technique: "Flame Ionization",
        type: "Extractive",
        parametersMeasured: "Total HC (VOC), TOC, VOC",
        comments: "- Very selective technique for Total HC/TOC/VOC.\n- Requires H2 gas for flame and carrier gas.\n- Integrated with extractive Hot wet / cold dry techniques."
      },
      {
        technique: "Tunable Diode Laser Path",
        type: "Path",
        parametersMeasured: "CO, CO2, NH3, Moisture (H2O), HCl, HF, CH4, O2, H2S etc.",
        comments: "- Usually selective laser techniques are not cost-effective for a single component.\n- Limitation in measuring SO2 and NOx due to lack of selectivity.\n- Measurement of H2O for moisture correction is necessary."
      },
      {
        technique: "Electrochemical",
        type: "Extractive",
        parametersMeasured: "O2, CO/CO2, etc.",
        comments: "- Not accepted for online stack emission monitoring in industries.\n- Electrochemical sensor is a consumable sensor, requires regular replacement and gets influenced by process stack background gas matrix.\n- Also gets influenced by moisture, dust, temperature, etc."
      },
      {
        technique: "Zirconium Oxide / O2Cell",
        type: "In-situ & Extractive",
        parametersMeasured: "O2",
        comments: "Widely used for boiler/Stack O2 correction/ Normalisation."
      },
      {
        technique: "Paramagnetic",
        type: "Extractive",
        parametersMeasured: "O2",
        comments: "Stable and accurate."
      },
      {
        technique: "Atomic fluorescence / absorption",
        type: "Hot Extractive",
        parametersMeasured: "Hg",
        comments: "Total Gaseous Mercury. Always Hot extractive system.\n- Pre-treatment options Gold Amalgamation followed by chemical/thermal desorption.\n- Adsorption in other media followed by thermal desorption and measured using either atomic absorption/ atomic fluorescence / UV DOAS / UV measurement (after removal of SO2 interference/ Zeeman correction) are acceptable.\n- For atomic absorption, Mercury lamp (NOT UV LAMP) should be used as energy source."
      }
      
    ];
    const DataTable=[
      {
      technology:"How it works",
      extractive:"Gas is extracted from stack,transported tosampling system,gas is conditioned and analyzed with a multi-gas NDIR analyzer",
      ndir:"Optical head is directly mounted on the stack, by measuring light absorbed the analyzer measures the gases",
      doas:"Emitter, Receiver mounted across the stack. Xenon lamp emits light, amount of light absorbed at receiver sent to analyser through Optic Fibre cable",
      dilution:"Very small amount of gas Extracted (Diluted) from stack to the analyser.",
      tdls:"Derivative Laser spectroscopy which scan the spectral absorption peak and measure the derivative peak respective to be measurable parameters. It may be path insitu, close coupled, extractive system.",
      ftir:"This methodology is strictly hot wet extractive. FTIR is a special type of spectroscopy in which spectrum is further analysed through an interferometric algorithm."
    },
    {
      technology:"Advantage",
      extractive:"Suitable for high concentration levels, low failure rates due to protected analyzer, easy maintenance at ground level, easy addition of new analyzers, requires frequent calibration checks, widely used in harsh processes, and effective with close-coupled techniques.",
      ndir:"Suitable for high concentrations, requires a proper purging system, difficult to maintain at height, easy addition with parameter monitoring setup, and needs frequent calibration due to harsh conditions.",
      doas:"- Can measure low and high concentrations. No sampling requirement, except for mercury. Low maintenance as there is no moving part. Works well in harsh conditions like high moisture. Provides high data capture rate. Single analyzer can be used for multiparameter monitoring. Requires less calibration because of low drift.",
      dilution:"- Can measure low and high concentrations. Sample is easy to dry. Ambient analyzers technologies deployed. Dilution ratio can be varied to reduce the interferences.",
      tdls:"- Multi-parameter monitoring is possible. Tunable diode laser system is sensitive and can work in wet conditions also. Advantageous for Ammonia, HF, HCl monitoring along with H2O.",
      ftir:"It is a multi-parameter monitoring technique suitable for most parameters except O2. Suitable for most industries except for those such as petrochemical, refineries, etc., where the possibility of explosion and safety is a concern."
    },
    {
      technology: "Limitations",
      extractive: "Installation takes more time. Measures NO and not NO2. AC Rooms. The complete analyser system along with calibration equipment needs to be installed at stack and would require adequate arrangement for maintenance and calibration. Cannot measure low levels. No expansion possible beyond the capacity of one device (Number of filters in the system). Consumes comparatively more calibration gas. Stack gas may corrode the probe and optics. Water interference is observed.",
      ndir: "Generally measures NO not NO2. Expected life is less in comparison as system is exposed to harsh conditions. High Initial cost. Requires converter for Hg for which only extractive system should be used.",
      doas: "Calibration frequency requirement is low but needs a separate calibration bench. AC Rooms. More time required for calibration as the calibration gases will pass the complete system from analyser till probe.",
      dilution: "Dilution ratio. Operation of critical orifice. Maintaining dilution gas quality is challenging. Individual analyser required for each parameter. AC Rooms.",
      tdls: "High cost. Cannot measure SO2 and NOx. AC Rooms.",
      ftir: "High cost. AC Rooms."
    },
    {
      technology: "List of gases that can be measured",
      extractive: "CO, CO2, NO, SO2, CH4, etc. Moisture (number of gases limited to number of filters fitted in analyzer) (Note IR based system does not measure NO2, only calculates) NO2 monitoring possible when convertor is used",
      ndir: "CO, CO2, NO, SO2, CH4, HCl, Moisture (Note IR based system does not measure NO2, only calculates) NO2 monitoring possible when converter is used. ",
      doas: "UV analyzer - SO2, NO, NO2, Phenol, Cl2, Formaldehyde, Benzene, Hg IR analyser - CO, CO2, HCl, HF, H2O, SO3, NH3, N2O, CH4.",
      dilution: "SO2, NO, NO2 (NOx), CO, CO2, NH3, H2O, HCl, HF, O2, and H2S",
      tdls: "SO2, NO, NO2, CO, CO2, NH3, H2O, HCl, HF and O2",
      ftir: "SO2, NO, NO2, CO, CO2, NH3, H2O, HCl, HF and O2"
    },
    {
      technology: "Effect of Dust",
      extractive: "Higher effect but can be controlled at sampling point",
      ndir: "Higher effect but can be controlled with inbuilt mechanism",
      doas: "Low",
      dilution: "Dilution probe clogging to be tackled",
      tdls: "-",
      ftir: "-"
    },
    {
      technology: "Effect of Temperature",
      extractive: "-",
      ndir: "Limited temperature, works up to 500°C",
      doas: "-",
      dilution: "Less than 400°C (Dilution probe with Quartz Orifice suitable up to 800°C)",
      tdls: "-",
      ftir: "-"
    },
    {
      technology: "Effect of Pressure",
      extractive: "-",
      ndir: "Limited pressure",
      doas: "-",
      dilution: "-",
      tdls: "-",
      ftir: "-"
    },
    {
      technology: "Effect of Moisture",
      extractive: "Low as removed or Hot Wet",
      ndir: "Very much affected, need to measure H2O online  Cannot work below dew point (below 95°C)",
      doas: "If moisture over 40%, instrument gets affected",
      dilution: "Gets affected at high moisture conditions. Can be controlled through properly dried dilution air",
      tdls: "-",
      ftir: "-"
    },
    {
      technology: "Adjustment during Zero and Span Check",
      extractive: "Not allowed. Zero and span check data needs to be transferred at real time",
      ndir: "Not allowed. Zero and span check data needs to be transferred at real time",
      doas: "Not allowed. Zero and span check data needs to be transferred at real time",
      dilution: "Zero and span check data needs to be transferred at real time",
      tdls: "Not allowed. Zero and span check data needs to be transferred at real time",
      ftir: "Not allowed. Zero and span check data needs to be transferred at real time"
    },
    {
      technology: "Calibration & Check frequency",
      extractive: "Daily ZERO Check. Fortnightly ZERO and SPAN Calibration. Six Monthly Linearity Check",
      ndir: "Daily ZERO Check. Fortnightly ZERO and SPAN Calibration. Six Monthly Linearity Check. After Major maintenance",
      doas: "Diagnostic check in every cycle. Six monthly ZERO and SPAN Calibration. Yearly Linearity Check",
      dilution: "After Major maintenance multipoint. Daily ZERO Check. Fortnightly ZERO and SPAN Calibration. Six Monthly Linearity Check",
      tdls: "Diagnostic check in every cycle. Six monthly ZERO and SPAN Calibration. Yearly Linearity Check",
      ftir: "Diagnostic check in every cycle. Six monthly ZERO and SPAN Calibration. Yearly Linearity Check"
    },

    {
      technology:'-',
      extractive:"After Major maintenance multipoint Zero and SPAN Calibration",
      ndir:"multipoint Zero and SPAN Calibration",
      doas:"Zero and SPAN Calibration",
      dilution:"Zero and SPAN Calibration",
      tdls:"After Major maintenance multipoint Zero and SPAN Calibration",
      ftir:"After Major maintenance multipoint Zero and SPAN Calibration"
    },
    {
      technology: "Approvals for analyzers",
      extractive: "TUV / MCERT approvals and conforms to US EPA / Indian certification",
      ndir: "MCERT/TUV however, US EPA does not recommend In-situ system. / Indian certification",
      doas: "TUV, MCERTS and meets USEPA calibration protocols / Indian certification",
      dilution: "Only conforms to USEPA / Indian certification",
      tdls: "EU-TUV/MCERT / Indian certification",
      ftir: "EU-TUV/MCERT / Indian certification"
    },
    {
      technology: "Multiplexing possible Y/N",
      extractive: "NOT allowed as of now",
      ndir: "NOT allowed as of now",
      doas: "NOT allowed as of now",
      dilution: "NOT allowed as of now",
      tdls: "NOT allowed as of now",
      ftir: "NOT allowed as of now"
    },
    {
      technology: "Remote calibration Y/N",
      extractive: "YES",
      ndir: "YES",
      doas: "YES Possible with installation of calibration bench at site",
      dilution: "Yes Dilution mechanism has to be compatible",
      tdls: "Yes",
      ftir: "Yes"
    },
    {
      technology: "Manual Online calibration Y/N",
      extractive: "YES",
      ndir: "YES",
      doas: "YES",
      dilution: "YES",
      tdls: "Yes",
      ftir: "Yes"
    }

  ]
    
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
  <h4 className="page-title">Support Analyser</h4>
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

<div className="card m-2 scrollable-card">
  <h4 className='text-center text-light mt-2'> SUITABILITY OF TECHNOLOGIES FOR DIFFERENT MATRICES</h4>
                <div className="card-body">
                  <div className="row rowback p-3">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Available Technologies</th>
                          <th>Parameters Measured</th>
                          <th>Applications</th>
                          <th>Limitations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, index) => (
                          <tr key={index}>
                            <td>{row.technology}</td>
                            <td>{row.parametersMeasured}</td>
                            <td>{row.applications}</td>
                            <td>{row.limitations}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="card m-2 scrollable-card">
                <h4 className='text-center text-light mt-2'>Overview on Technical Selection & Suitability for Gaseous CEMS
                Technology</h4>
                <div className="card-body">
                  <div className="row rowback p-3">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Technique</th>
                          <th>Type</th>
                          <th>Parameter(S) Measured</th>
                          <th>Comments & Limitations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nextTableData.map((row, index) => (
                          <tr key={index}>
                            <td>{row.technique}</td>
                            <td>{row.type}</td>
                            <td>{row.parametersMeasured}</td>
                            <td>{row.comments}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="card m-2 scrollable-card">
                <div className="card-body">
                  <div className="row rowback p-3">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Type of Technology</th>
                          <th>Extractive NDIR/
IR GFC/ IR CFM
and NDUV</th>
                          <th>In-situ NDIR & IR
                          GFC</th>
                          <th> DOAS (Differential
Optical Absorption
Spectroscopy)</th>
                          <th> DILUTION
                          EXTRACTIVE </th>
                           <th> TDLS</th>
                           <th> FTIR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {DataTable.map((row, index) => (
                          <tr key={index}>
                            <td>{row.technology}</td>
                            <td>{row.extractive}</td>
                            <td>{row.ndir}</td>
                            <td>{row.doas}</td>
                            <td>{row.dilution}</td>
                            <td>{row.tdls}</td>
                            <td>{row.ftir}</td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
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

export default SupportAnalyser
import React, { useState } from 'react';
import DashboardSam from '../Dashboard/DashboardSam';
import Maindashboard from '../Maindashboard/Maindashboard';
import Header from '../Header/Hedaer';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function WasteDashboard() {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="container-fluid">
            <div className="row" style={{ backgroundColor: 'white' }}>
                <div className="col-lg-3 d-none d-lg-block">
                    <DashboardSam />
                </div>
                <div className="col-lg-9 col-12">
                    <div className="row">
                        <div className="col-12">
                            <Header />
                        </div>
                    </div>
                    <div className="row">
                        <div>
                            <Maindashboard />
                        </div>
                    </div>
                    <div className="text-center mt-4">
                        <Button
                            style={{ backgroundColor: '#236a80', color: 'white', border: 'none' }}
                            onClick={() => setShowModal(true)}
                        >
                            Add Waste
                        </Button>
                    </div>
                    <div className="row mt-4">
                        <div className="col-md-4 mb-4">
                            <div className="card border shadow">
                                <div className="card-body">
                                    <h5 className="card-title text-light">Waste Details</h5>
                                    <div className="mb-3">
                                        <p className="text-light"><strong>Station Name:</strong></p>
                                        <p className="text-light"><strong>Station Type:</strong></p>
                                        <p className="text-light"><strong>Weight:</strong> kg</p>
                                        <p className="text-light"><strong>Date:</strong></p>
                                    </div>
                                    <div className="d-flex justify-content-end gap-2">
                                        <Button variant="warning">
                                            <i className="fa-solid fa-pen"></i>
                                        </Button>
                                        <Button variant="danger">
                                            <i className="fa-solid fa-trash"></i>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center">No waste data available.</p>
                    </div>

                    <Modal
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        centered
                        size="lg"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Add Waste</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <form>
                                <div className="row">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="userName">User Name:</label>
                                        <input type="text" id="userName" className="form-control" disabled />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="stationType">Station Type:</label>
                                        <input type="text" id="stationType" className="form-control" disabled />
                                    </div>
                                </div>
                            </form>
                        </Modal.Body>
                    </Modal>
                </div>
            </div>
        </div>
    );
}

export default WasteDashboard;

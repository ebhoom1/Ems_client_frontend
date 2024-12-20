import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddAvoidExceedence({ show, onClose, onSubmit }) {
    const [userName, setUserName] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = async () => {
        if (!userName || !reason) {
            toast.error('Please fill out all fields');
            return;
        }

        try {
            const response = await axios.post('https://api.ocems.ebhoom.com/api/avoid-factor', {
                userName,
                reason,
            });

            if (response.data.message) {
                toast.success(response.data.message);
                setUserName('');
                setReason('');
                onClose(); // Properly call the onClose function passed as a prop

                // Call the onSubmit callback to refresh the avoid list or perform any additional action
                onSubmit?.({ userName, reason });
            }
        } catch (error) {
            toast.error('Failed to add to avoid list. Please try again.');
        }
    };

    return (
        <>
            <Modal show={show} onHide={onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Avoid Exceedence</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>User Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Enter User Name"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Reason</Form.Label>
                            <Form.Control
                                as="textarea"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter Reason"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer />
        </>
    );
}

export default AddAvoidExceedence;

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import DashboardSam from '../Dashboard/DashboardSam';
import HeaderSim from '../Header/HeaderSim';
import { fetchUser } from './../../redux/features/user/userSlice';
import { fetchAllTransactions, fetchTransactionsByUserName } from '../../redux/features/transactions/transactionSlice';

function Transaction() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const transactions = useSelector((state) => state.transactions.transactions);
    const { userData, userType } = useSelector((state) => state.user);

    useEffect(() => {
        const validateUser = async () => {
            try {
                const response = await dispatch(fetchUser()).unwrap();
                if (!response) {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error validating user:', error);
                navigate('/');
            }
        };

        if (!userData) {
            validateUser();
        }
    }, [dispatch, navigate, userData]);

    useEffect(() => {
        if (userData) {
            if (userType === 'user') {
                dispatch(fetchTransactionsByUserName(userData.validUserOne.userName));
            } else if (userType === 'admin') {
                dispatch(fetchAllTransactions());
            }
        }
    }, [userData, userType, dispatch]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery) {
            dispatch(fetchTransactionsByUserName(searchQuery));
        } else {
            dispatch(fetchAllTransactions());
        }
    };

    return (
        <div className="container-fluid mb-5">
            <div className="row">
                <div className="col-lg-3 d-none d-lg-block">
                    <DashboardSam />
                </div>
                <div className="col-lg-9 col-12">
                    <div className="row">
                        <div className="col-12">
                            <HeaderSim />
                        </div>
                    </div>
                    <h1 className="text-center mt-3">Transaction Dashboard</h1>
                    {userType === 'admin' && (
                        <form className="form-inline my-2 my-lg-0 d-flex justify-content-center m-3" onSubmit={handleSearch}>
                            <input
                                className="form-control mr-sm-2"
                                type="search"
                                placeholder="Search"
                                aria-label="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="btn btn-outline-primary my-2 my-sm-0" type="submit">
                                Search
                            </button>
                        </form>
                    )}
                    <div className="card last-trips-card mt-2" style={{ overflowX: 'scroll' }}>
                        <div className="card-body">
                            <table className="table table-borderless">
                                <thead>
                                    <tr>
                                        <th>Sl No</th>
                                        <th>User ID</th>
                                        <th>Model Name</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((transaction, index) => (
                                        <tr key={transaction.id}>
                                            <td>{index + 1}</td>
                                            <td>{transaction.userName}</td>
                                            <td>{transaction.modelName}</td>
                                            <td>{transaction.amountPaid}</td>
                                            <td>{transaction.paymentDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default Transaction;

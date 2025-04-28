import React from 'react'
import { useNavigate } from 'react-router-dom'

function Admins() {

    const navigate = useNavigate()
  return (
    <div>
        <div>
            <h2>Edit Admins</h2>
            <ul>
            <li
      
      className="list-group-item d-flex justify-content-between align-items-center"
    >
      <span>Hilton</span>
      <div className="d-flex justify-content-end align-items-center ">
      <button
        className="btn me-2"
        style={{ backgroundColor: 'orange', color: 'white' }}
        onClick={() => navigate(`/view/`)}
      >
        View
      </button>
      <button
        className="btn"
        style={{ backgroundColor: '#236a80', color: 'white' }}
        onClick={() => navigate(`/edit/`, )}
      >
        Edit
      </button>
      </div>
   
    </li>
            </ul>
        </div>
    </div>
  )
}

export default Admins
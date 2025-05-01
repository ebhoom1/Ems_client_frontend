import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../../utils/apiConfig';
import ElectricalChecklist from './ElectricalChecklist';
import { useParams } from 'react-router-dom';

export default function ElectricalMaintenance({  onClose }) {
    const { equipmentId } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquip = async () => {
        console.log('ElectricalMaintenance:', { equipmentId });
      try {
        if (!equipmentId) {
          toast.error('Equipment ID is missing');
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_URL}/api/equiment/${equipmentId}`);
        const data = res.data.equipment;
        setEquipment({
          name:      data.equipmentName,
          model:     data.modelSerial,
          capacity:  data.capacity,
          ratedLoad: data.ratedLoad,
          voltage:   data.voltage ?? '',
          current:   data.current ?? '',
          power:     data.power   ?? ''
        });
      } catch (err) {
        toast.error('Failed to load equipment details');
        console.error('Error fetching equipment:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEquip();
  }, [equipmentId]);

  if (loading) return <p>Loading equipment...</p>;
  if (!equipment) return <p>Equipment not found.</p>;

  return (
    <div className="modal-backdrop bg-light">
      <div className="modal-card p-4" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className='d-flex '>
        <h3 className="mb-3 ">Electrical Maintenance</h3></div>
       
        <ElectricalChecklist equipment={equipment} equipmentId={equipmentId} />
        </div>
    </div>
  );
}
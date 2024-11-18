import React from 'react';
import stank from '../../assests/images/stank.svg';
import filtertank from '../../assests/images/filtertank.svg';
import connector from '../../assests/images/connector.svg';
import elbow from '../../assests/images/elbow.svg';
import filters from '../../assests/images/filters.svg';
import flowmeter from '../../assests/images/flowmeter.svg';
import image1 from '../../assests/images/image1.svg';
import meter from '../../assests/images/meter.svg';
import pump from '../../assests/images/pump.svg';
import tank from '../../assests/images/tank.svg';
import wheel from '../../assests/images/wheel.svg';
import zigzag from '../../assests/images/zigzag.svg';
import pipelong from '../../assests/images/pipelong.svg';
import connect from '../../assests/images/connect.svg';
import filterset from '../../assests/images/filterset.svg';
import yellowtank from '../../assests/images/yellowtank.svg';
import bluetank from '../../assests/images/bluetank.svg';
import pumpsingle from '../../assests/images/pumpsingle.svg';
import connectinginlet from '../../assests/images/conectinginlet.svg';
import flowout from '../../assests/images/flowout.svg';
import energymeter from '../../assests/images/energymeter.svg';
import upipe from '../../assests/images/upipe.svg';
import straightconnector from '../../assests/images/straightconnector.svg';
import blacktank from '../../assests/images/blacktank.svg';
import greentank from '../../assests/images/greentank.svg';
import imagenext from '../../assests/images/imagenext.svg';
import solar from '../../assests/images/solar.svg';
import imagenew from '../../assests/images/imagenew.svg';
import curvedpipe from '../../assests/images/curvedpipe.png'

import './livemapping.css'
const shapes = [
   

    { id: 'stank', label: 'Stank', isSVG: true, svgPath: stank },
    { id: 'filtertank', label: 'Filter Tank', isSVG: true, svgPath: filtertank },
    { id: 'connector', label: 'Connector', isSVG: true, svgPath: connector },
    { id: 'elbow', label: 'Elbow', isSVG: true, svgPath: elbow },
    { id: 'filters', label: 'Filters', isSVG: true, svgPath: filters },
    { id: 'flowmeter', label: 'Flowmeter', isSVG: true, svgPath: flowmeter },
    { id: 'image1', label: 'Image 1', isSVG: true, svgPath: image1 },
    { id: 'meter', label: 'Meter', isSVG: true, svgPath: meter },
    { id: 'pump', label: 'Pump', isSVG: true, svgPath: pump },
    { id: 'tank', label: 'Tank', isSVG: true, svgPath: tank },
    { id: 'wheel', label: 'Wheel', isSVG: true, svgPath: wheel },
    { id: 'zigzag', label: 'Zigzag', isSVG: true, svgPath: zigzag },
    { id: 'pipelong', label: 'Pipe Long', isSVG: true, svgPath: pipelong },
    { id: 'connect', label: 'Connect', isSVG: true, svgPath: connect },
    { id: 'filterset', label: 'Filter Set', isSVG: true, svgPath: filterset },
    { id: 'yellowtank', label: 'Yellow Tank', isSVG: true, svgPath: yellowtank },
    { id: 'bluetank', label: 'Blue Tank', isSVG: true, svgPath: bluetank },
    { id: 'pumpsingle', label: 'Pump Single', isSVG: true, svgPath: pumpsingle },
    { id: 'connectinginlet', label: 'Connecting Inlet', isSVG: true, svgPath: connectinginlet },
    { id: 'energymeter', label: ' Energymeter', isSVG: true, svgPath: energymeter },
    { id: 'upipe', label: 'upipe', isSVG: true, svgPath: upipe },
    { id: 'straightconnector', label: 'Straight connector', isSVG: true, svgPath: straightconnector },
    { id: 'blacktank', label: 'blacktank', isSVG: true, svgPath: blacktank },
    { id: 'greentank', label: 'greentank', isSVG: true, svgPath: greentank },
    { id: 'imagenext', label: 'imagenext', isSVG: true, svgPath: imagenext },
    { id: 'solar', label: 'solar', isSVG: true, svgPath: solar },
    { id: 'imagenew', label: 'imagenew', isSVG: true, svgPath: imagenew },

    { id: 'flowout', label: 'Flow out', isSVG: true, svgPath: flowout },

    { id: 'curvedpipe', label: 'curvedpipe', isSVG: true, svgPath: curvedpipe },

  ];
  

function Sidebar() {
  const onDragStart = (event, shape) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(shape));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="sidebar-container">
    <aside>
    <div className="description">Drag a shape to the canvas.</div>
    <div className="shapes-container">
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className="dndnode"
          onDragStart={(event) => onDragStart(event, shape)}
          draggable
        >
          {shape.isSVG ? (
            <img
              src={shape.svgPath}
              alt={shape.label}
              style={{ width: '50px', height: '50px' }}
            />
          ) : (
            shape.label
          )}
        </div>
      ))}
    </div>
  </aside>
  </div>
  );
}

export default Sidebar;
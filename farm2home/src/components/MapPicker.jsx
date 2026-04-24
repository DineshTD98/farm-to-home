import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapEvents = ({ onMapClick }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return null;
};

const ChangeView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

const MapPicker = ({ lat, lng, onChange }) => {
    const [position, setPosition] = useState(lat && lng ? [lat, lng] : [20.5937, 78.9629]); // Default India center

    useEffect(() => {
        if (lat && lng) {
            setPosition([lat, lng]);
        }
    }, [lat, lng]);

    const handleMapClick = (latlng) => {
        const newPos = [latlng.lat, latlng.lng];
        setPosition(newPos);
        onChange({ lat: latlng.lat, lng: latlng.lng });
    };

    return (
        <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-white/10 relative z-10 shadow-inner">
            <MapContainer 
                center={position} 
                zoom={13} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ChangeView center={position} />
                <MapEvents onMapClick={handleMapClick} />
                <Marker position={position} />
            </MapContainer>
            <div className="absolute bottom-4 left-4 z-[1000] bg-gray-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-lg pointer-events-none">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Click on map to pick location</p>
            </div>
        </div>
    );
};

export default MapPicker;

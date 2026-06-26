import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Save, 
  Navigation, 
  Building2, 
  Globe, 
  Compass, 
  Smartphone, 
  AtSign, 
  Heart, 
  Activity,
  RefreshCw,
  Home,
  Flag,
  Map,
  Info,
  Eraser,
  Link,
  Target,
  Zap,
  PhoneCall,
  IndianRupee
} from 'lucide-react';
import { showSuccess, showError, showWarning } from '../utils/swal';

const API_BASE_URL = BASE_API + '/temple_address_contact';

const FormInput = ({ label, name, value, onChange, icon: Icon, placeholder, type = "text", required = false }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div className="input-wrapper">
      {Icon && <Icon className="input-icon" size={16} />}
      <input 
        type={type} 
        name={name}
        id={name}
        className="form-control"
        placeholder={placeholder}
        value={value} 
        onChange={onChange} 
        required={required} 
        style={{ paddingLeft: Icon ? '38px' : '12px', height: '38px', fontSize: '13.5px' }}
      />
    </div>
  </div>
);

const Address = () => {
  const [formData, setFormData] = useState({
    doorNumber: '',
    buildingName: '',
    streetName: '',
    landmark: '',
    areaName: '',
    pincode: '',
    country: 'India',
    latitude: '',
    longitude: '',
    poojaPhone: '',
    poojaEmail: '',
    nerthikadanPhone: '',
    nerthikadanEmail: '',
    annadhanamPhone: '',
    donationPhone: '',
    kadhukuthuPhone: '',
    mudithalaiPhone: '',
    bhaktharGroupPhone: '',
    bhaktharGroupEmail: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}`);
      if (res.ok) {
        const json = await res.json();
        const records = json.data?.data || [];
        if (records.length > 0) {
          const item = records[0];
          setEditingId(item.id);
          setFormData({
            doorNumber: item.door_number || '',
            buildingName: item.building_name || '',
            streetName: item.street_name || '',
            landmark: item.landmark || '',
            areaName: item.area_name || '',
            pincode: item.pincode || '',
            country: item.country || 'India',
            latitude: item.latitude || '',
            longitude: item.longitude || '',
            poojaPhone: item.pooja_phone || '',
            poojaEmail: item.pooja_email || '',
            nerthikadanPhone: item.nerthikadan_phone || '',
            nerthikadanEmail: item.nerthikadan_email || '',
            annadhanamPhone: item.annadhanam_phone || '',
            donationPhone: item.donation_phone || '',
            kadhukuthuPhone: item.kadhukuthu_phone || '',
            mudithalaiPhone: item.mudithalai_phone || '',
            bhaktharGroupPhone: item.bhakthar_group_phone || '',
            bhaktharGroupEmail: item.bhakthar_group_email || ''
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
        showSuccess("GPS தற்போதைய இடம் பெறப்பட்டது", "Current GPS location retrieved!");
      }, (error) => {
        showError("GPS பிழை", "Geolocation error: " + error.message);
      });
    } else {
      showError("ஆதரிக்கப்படவில்லை", "Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const isEditMode = !!editingId;
      const url = isEditMode ? `${API_BASE_URL}/update/${editingId}` : `${API_BASE_URL}/create`;
      const method = isEditMode ? 'PUT' : 'POST';

      const submitData = {
        door_number: formData.doorNumber,
        building_name: formData.buildingName,
        street_name: formData.streetName,
        landmark: formData.landmark,
        area_name: formData.areaName,
        pincode: formData.pincode,
        country: formData.country,
        latitude: formData.latitude,
        longitude: formData.longitude,
        pooja_phone: formData.poojaPhone,
        pooja_email: formData.poojaEmail,
        nerthikadan_phone: formData.nerthikadanPhone,
        nerthikadan_email: formData.nerthikadanEmail,
        annadhanam_phone: formData.annadhanamPhone,
        donation_phone: formData.donationPhone,
        kadhukuthu_phone: formData.kadhukuthuPhone,
        mudithalai_phone: formData.mudithalaiPhone,
        bhakthar_group_phone: formData.bhaktharGroupPhone,
        bhakthar_group_email: formData.bhaktharGroupEmail
      };

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (res.ok) {
        showSuccess("வெற்றிகரமாக சேமிக்கப்பட்டது!", "Saved Successfully!");
        fetchData();
      } else {
        showError("தோல்வி", "Failed to save address info");
      }
    } catch (err) {
      showError("தொடர்பு பிழை", "Connection error");
    }
  };

  return (
    <div className="form-card" style={{ maxWidth: '1400px' }}>
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <MapPin size={24} color="#6366f1" />
          <h2 style={{ margin: 0, fontSize: '20px' }}>முகவரி மற்றும் தொடர்பு (Address & Contact)</h2>
        </div>
        <p style={{ fontSize: '13px' }}>கோவிலின் இருப்பிட விவரங்கள் மற்றும் அனைத்து சேவைத் தொடர்பு எண்களையும் நிர்வகிக்கவும்.</p>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <Home size={18} color="#6366f1" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>இருப்பிட விவரங்கள் (Location Details)</h3>
        </div>

        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <FormInput label="கதவு எண்" name="doorNumber" value={formData.doorNumber} onChange={handleInputChange} icon={Building2} placeholder="Door No..." />
          <FormInput label="கட்டிடம்" name="buildingName" value={formData.buildingName} onChange={handleInputChange} icon={Home} placeholder="Building Name..." />
          <FormInput label="தெரு பெயர்" name="streetName" value={formData.streetName} onChange={handleInputChange} icon={Target} placeholder="Street Name..." />
          
          <FormInput label="அடையாளம்" name="landmark" value={formData.landmark} onChange={handleInputChange} icon={Flag} placeholder="Landmark..." />
          <FormInput label="பகுதி" name="areaName" value={formData.areaName} onChange={handleInputChange} icon={MapPin} placeholder="Area Name..." />
          <FormInput label="அஞ்சல் குறியீடு" name="pincode" value={formData.pincode} onChange={handleInputChange} icon={Map} placeholder="Pincode..." />
          
          <div className="form-group">
            <label className="form-label">நாடு (Country)</label>
            <div className="input-wrapper">
              <Globe className="input-icon" size={16} />
              <select name="country" className="form-control" value={formData.country} onChange={handleInputChange} style={{ paddingLeft: '38px', height: '38px', fontSize: '13.5px', appearance: 'auto' }}>
                <option value="India">India</option>
              </select>
            </div>
          </div>

          <FormInput label="அட்சரேகை (Lat)" name="latitude" value={formData.latitude} onChange={handleInputChange} icon={Compass} placeholder="Latitude..." />
          <FormInput label="தீர்க்கரேகை (Long)" name="longitude" value={formData.longitude} onChange={handleInputChange} icon={Compass} placeholder="Longitude..." />
          
          <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={getLocation} className="btn btn-outline" style={{ height: '38px', gap: '8px', fontSize: '13px', color: '#6366f1', borderColor: '#e0e7ff' }}>
              <Navigation size={14} /> Get Current GPS
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <PhoneCall size={18} color="#10b981" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>சேவைத் தொடர்பு எண்கள் (Service Contacts)</h3>
        </div>

        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ gridColumn: 'span 3', marginBottom: '4px' }}>
            <h4 style={{ margin: 0, fontSize: '13px', color: '#6366f1', fontWeight: '700', textTransform: 'uppercase' }}>பூஜை மற்றும் நிவர்த்தி</h4>
          </div>
          <FormInput label="பூஜை தொலைபேசி" name="poojaPhone" value={formData.poojaPhone} onChange={handleInputChange} icon={Phone} placeholder="Phone..." />
          <FormInput label="பூஜை மின்னஞ்சல்" name="poojaEmail" value={formData.poojaEmail} onChange={handleInputChange} icon={AtSign} placeholder="Email..." />
          <div style={{ gridColumn: 'span 1' }}></div>

          <FormInput label="நேர்த்திக்கடன் தொலைபேசி" name="nerthikadanPhone" value={formData.nerthikadanPhone} onChange={handleInputChange} icon={Phone} placeholder="Phone..." />
          <FormInput label="நேர்த்திக்கடன் மின்னஞ்சல்" name="nerthikadanEmail" value={formData.nerthikadanEmail} onChange={handleInputChange} icon={AtSign} placeholder="Email..." />
          <div style={{ gridColumn: 'span 1' }}></div>

          <div style={{ gridColumn: 'span 3', margin: '12px 0 4px 0' }}>
            <h4 style={{ margin: 0, fontSize: '13px', color: '#6366f1', fontWeight: '700', textTransform: 'uppercase' }}>பிற சேவைகள்</h4>
          </div>
          <FormInput label="அன்னதானம் தொலைபேசி" name="annadhanamPhone" value={formData.annadhanamPhone} onChange={handleInputChange} icon={Heart} placeholder="Phone..." />
          <FormInput label="நன்கொடை தொலைபேசி" name="donationPhone" value={formData.donationPhone} onChange={handleInputChange} icon={IndianRupee} placeholder="Phone..." />
          <FormInput label="பக்தர்கள் குழு தொலைபேசி" name="bhaktharGroupPhone" value={formData.bhaktharGroupPhone} onChange={handleInputChange} icon={Activity} placeholder="Phone..." />

          <FormInput label="காதுகுத்து தொலைபேசி" name="kadhukuthuPhone" value={formData.kadhukuthuPhone} onChange={handleInputChange} icon={Info} placeholder="Phone..." />
          <FormInput label="தலைமுடி தொலைபேசி" name="mudithalaiPhone" value={formData.mudithalaiPhone} onChange={handleInputChange} icon={Info} placeholder="Phone..." />
          <FormInput label="பக்தர்கள் குழு மின்னஞ்சல்" name="bhaktharGroupEmail" value={formData.bhaktharGroupEmail} onChange={handleInputChange} icon={AtSign} placeholder="Email..." />
        </div>
      </div>

      <div className="form-actions" style={{ position: 'sticky', bottom: '20px', zIndex: 10, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }}>
        <button onClick={fetchData} className="btn btn-outline" style={{ height: '40px' }}>
          <Eraser size={16}/> Reset All
        </button>
        <button onClick={handleSubmit} className="btn btn-primary" style={{ height: '40px', minWidth: '180px' }}>
          <Save size={18} /> Save Changes
        </button>
      </div>
    </div>
  );
};

export default Address;

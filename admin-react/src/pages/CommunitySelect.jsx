import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  PlusCircle,
  XCircle,
  Save,
  Trash2,
  MapPin,
  Heart,
  Sparkles,
  Plus,
  Bookmark,
  Check,
  Award,
  AlertCircle,
  ChevronRight,
  User,
  Info
} from 'lucide-react';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

// Initial Mock Data
const INITIAL_COMMUNITIES = [
  { id: '1', name_ta: 'கொங்கு வேளாளர் கவுண்டர்', name_en: 'Kongu Vellalar Gounder' },
  { id: '2', name_ta: 'வன்னியர்', name_en: 'Vanniyar' },
  { id: '3', name_ta: 'நாடார்', name_en: 'Nadar' },
  { id: '4', name_ta: 'கள்ளர்', name_en: 'Kallar' },
  { id: '5', name_ta: 'செட்டியார்', name_en: 'Chettiar' },
  { id: '6', name_ta: 'பிள்ளை', name_en: 'Pillai' },
  { id: '7', name_ta: 'யாதவர்', name_en: 'Yadavar' },
  { id: '8', name_ta: 'ஆதி திராவிடர்', name_en: 'Adi Dravidar' }
];

const INITIAL_SUB_COMMUNITIES = [
  { id: 's1', community_id: '1', name_ta: 'கொங்கு வேளாளர்', name_en: 'Kongu Vellalar' },
  { id: 's2', community_id: '1', name_ta: 'வெட்டுவ கவுண்டர்', name_en: 'Vettuva Gounder' },
  { id: 's3', community_id: '1', name_ta: 'நாட்டு கவுண்டர்', name_en: 'Nattu Gounder' },
  { id: 's4', community_id: '2', name_ta: 'படையாச்சி', name_en: 'Padayachi' },
  { id: 's5', community_id: '2', name_ta: 'கந்தர்வக்கோட்டை', name_en: 'Gandarvakottai' },
  { id: 's6', community_id: '2', name_ta: 'வன்னிய குலக்ஷத்திரியர்', name_en: 'Vanniyar Kulakshatriya' },
  { id: 's7', community_id: '3', name_ta: 'கருப்பாம்பாடி Nadar', name_en: 'Karupambadi Nadar' },
  { id: 's8', community_id: '3', name_ta: 'நாட்டாத்தி Nadar', name_en: 'Nattathi Nadar' },
  { id: 's9', community_id: '3', name_ta: 'மேல்-நாடு Nadar', name_en: 'Mel-naad Nadar' },
  { id: 's10', community_id: '4', name_ta: 'அம்பநாடு கள்ளர்', name_en: 'Ambanad Kallar' },
  { id: 's11', community_id: '4', name_ta: 'பிரமலைக் கள்ளர்', name_en: 'Piramalai Kallar' },
  { id: 's12', community_id: '4', name_ta: 'ஈசநாட்டு கள்ளர்', name_en: 'Esanattu Kallar' },
  { id: 's13', community_id: '5', name_ta: 'நாட்டுக்கோட்டை செட்டியார்', name_en: 'Nattukottai Chettiar' },
  { id: 's14', community_id: '5', name_ta: 'வாணிய செட்டியார்', name_en: 'Vaniya Chettiar' },
  { id: 's15', community_id: '5', name_ta: 'ஆரிய வைசிய செட்டியார்', name_en: 'Arya Vysya Chettiar' },
  { id: 's16', community_id: '6', name_ta: 'சைவ பிள்ளை', name_en: 'Saiva Pillai' },
  { id: 's17', community_id: '6', name_ta: 'கார்காத்தார் பிள்ளை', name_en: 'Karkarthar Pillai' },
  { id: 's18', community_id: '6', name_ta: 'நாஞ்சில் பிள்ளை', name_en: 'Nanjil Pillai' },
  { id: 's19', community_id: '7', name_ta: 'கோனார்', name_en: 'Konar' },
  { id: 's20', community_id: '7', name_ta: 'வடுக யாதவர்', name_en: 'Vaduga Yadavar' },
  { id: 's21', community_id: '8', name_ta: 'பறையர்', name_en: 'Paraiyar' },
  { id: 's22', community_id: '8', name_ta: 'வள்ளுவர்', name_en: 'Valluvar' }
];

const getKulaDeivamImageUrl = (kd) => {
  if (!kd) return BASE_API + '/files/default_god.svg';
  if (kd.image) {
    return `${BASE_API}/files/${kd.image}`;
  }
  const name = (kd.name_en || '').toLowerCase();
  const nameTa = kd.name_ta || '';
  
  if (name.includes('vinayagar') || nameTa.includes('விநாயகர்')) return BASE_API + '/files/default_vinayagar.svg';
  if (name.includes('murugan') || nameTa.includes('முருகன்')) return BASE_API + '/files/default_murugan.svg';
  if (name.includes('mariamman') || name.includes('amman') || name.includes('parameswari') || name.includes('kali') || name.includes('muthar') || nameTa.includes('அம்மன்') || nameTa.includes('பரமேஸ்வரி') || nameTa.includes('மாரி') || nameTa.includes('காளி') || nameTa.includes('முத்தார்')) return BASE_API + '/files/default_amman.svg';
  if (name.includes('durga') || nameTa.includes('துர்க்கை')) return BASE_API + '/files/default_durga.svg';
  if (name.includes('karuppasamy') || name.includes('karuppan') || nameTa.includes('கருப்பசாமி') || nameTa.includes('கருப்பண்ணசுவாமி')) return BASE_API + '/files/default_karuppasamy.svg';
  if (name.includes('shivan') || name.includes('siva') || nameTa.includes('சிவன்')) return BASE_API + '/files/default_shivan.svg';
  if (name.includes('perumal') || name.includes('vishnu') || nameTa.includes('பெருமாள்')) return BASE_API + '/files/default_perumal.svg';
  
  return BASE_API + '/files/default_god.svg';
};

const INITIAL_VAGAIYARAS = [
  { id: 'v1', community_id: '1', name_ta: 'முத்தையா வகைரா', name_en: 'Muthaiya Vagaiyara', sontha_uru: 'பல்லடம் (Palladam)', epo_uru: 'கோயம்புத்தூர் (Coimbatore)' },
  { id: 'v2', community_id: '1', name_ta: 'சின்னசாமி வகைரா', name_en: 'Chinnasamy Vagaiyara', sontha_uru: 'திருச்செங்கோடு (Tiruchengode)', epo_uru: 'ஈரோடு (Erode)' },
  { id: 'v3', community_id: '2', name_ta: 'அண்ணாமலை வகைரா', name_en: 'Annamalai Vagaiyara', sontha_uru: 'விருத்தாசலம் (Vriddhachalam)', epo_uru: 'கடலூர் (Cuddalore)' },
  { id: 'v4', community_id: '3', name_ta: 'வேலுச்சாமி வகைரா', name_en: 'Veluchamy Vagaiyara', sontha_uru: 'சாத்தூர் (Sattur)', epo_uru: 'மதுரை (Madurai)' },
  { id: 'v5', community_id: '5', name_ta: 'ராமலிங்கம் வகைரா', name_en: 'Ramalingam Vagaiyara', sontha_uru: 'காரைக்குடி (Karaikudi)', epo_uru: 'திருச்சி (Trichy)' }
];

const GENERATIONS = [
  { value: '1', label: '1-ஆம் தலைமுறை (1st Generation)' },
  { value: '2', label: '2-ஆம் தலைமுறை (2nd Generation)' },
  { value: '3', label: '3-ஆம் தலைமுறை (3rd Generation)' },
  { value: '4', label: '4-ஆம் தலைமுறை (4th Generation)' },
  { value: '5', label: '5-ஆம் தலைமுறை (5th Generation)' },
  { value: '6', label: '6-ஆம் தலைமுறை (6th Generation)' },
  { value: '7', label: '7-ஆம் தலைமுறை (7th Generation)' },
  { value: '8', label: '8-ஆம் தலைமுறை (8th Generation)' },
  { value: '9', label: '9-ஆம் தலைமுறை (9th Generation)' },
  { value: '10', label: '10-ஆம் தலைமுறை + (10th Generation+)' }
];

const CommunitySelect = () => {
  const navigate = useNavigate();
  // Database states loaded from localStorage if exist, else initial mocks
  const [communities, setCommunities] = useState(() => {
    const saved = localStorage.getItem('local_communities');
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITIES;
  });

  const [subCommunities, setSubCommunities] = useState(() => {
    const saved = localStorage.getItem('local_sub_communities');
    return saved ? JSON.parse(saved) : INITIAL_SUB_COMMUNITIES;
  });

  const [kulaDeivams, setKulaDeivams] = useState(() => {
    const saved = localStorage.getItem('local_kula_deivams');
    return saved ? JSON.parse(saved) : [];
  });

  const [vagaiyaras, setVagaiyaras] = useState(() => {
    const saved = localStorage.getItem('local_vagaiyaras');
    return saved ? JSON.parse(saved) : INITIAL_VAGAIYARAS;
  });

  const [kulams, setKulams] = useState(() => {
    const saved = localStorage.getItem('local_kulams');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'k1', community_id: '1', name_ta: 'அழகு குலம்', name_en: 'Azhagu Kulam' },
      { id: 'k2', community_id: '1', name_ta: 'கூரை குலம்', name_en: 'Koorai Kulam' },
      { id: 'k3', community_id: '1', name_ta: 'பொன்னர் குலம்', name_en: 'Ponnar Kulam' }
    ];
  });

  const [selections, setSelections] = useState(() => {
    const saved = localStorage.getItem('local_selections');
    return saved ? JSON.parse(saved) : [];
  });

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddVagaiyaraModal, setShowAddVagaiyaraModal] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Form states
  const [selectedCommunityId, setSelectedCommunityId] = useState('');
  const [selectedSubCommunityId, setSelectedSubCommunityId] = useState('');
  const [selectedKulaDeivamIds, setSelectedKulaDeivamIds] = useState([]);
  const [selectedVagaiyaraId, setSelectedVagaiyaraId] = useState('');
  const [tharpothaiyaVagaiyara, setTharpothaiyaVagaiyara] = useState('');
  const [currentPlace, setCurrentPlace] = useState('');
  const [kulam, setKulam] = useState('');
  const [generation, setGeneration] = useState('');
  const [maritalStatus, setMaritalStatus] = useState(''); // 'married' or 'unmarried'

  // Married details
  const [wifeName, setWifeName] = useState('');
  const [wifeKulaDeivam, setWifeKulaDeivam] = useState('');


  // Add Vagaiyara Modal states
  const [newVagaiyaraTa, setNewVagaiyaraTa] = useState('');
  const [newVagaiyaraEn, setNewVagaiyaraEn] = useState('');
  const [newVagaiyaraSonthaUru, setNewVagaiyaraSonthaUru] = useState('');
  const [newVagaiyaraEpoUru, setNewVagaiyaraEpoUru] = useState('');

  // Reload database states on mount to ensure fresh synchronization
  useEffect(() => {
    const savedC = localStorage.getItem('local_communities');
    if (savedC) setCommunities(JSON.parse(savedC));

    const savedSC = localStorage.getItem('local_sub_communities');
    if (savedSC) setSubCommunities(JSON.parse(savedSC));

    const savedK = localStorage.getItem('local_kulams');
    if (savedK) setKulams(JSON.parse(savedK));

    const savedKD = localStorage.getItem('local_kula_deivams');
    if (savedKD) setKulaDeivams(JSON.parse(savedKD));

    const fetchAllData = async () => {
      try {
        const resC = await fetch(BASE_API + '/communities');
        const dataC = await resC.json();
        if (resC.ok && dataC.data && dataC.data.code === 200) {
          const mappedC = dataC.data.data.map(c => ({
            id: String(c.id),
            name_ta: c.community_name_tamil || '',
            name_en: c.community_name_english || ''
          }));
          setCommunities(mappedC);
          localStorage.setItem('local_communities', JSON.stringify(mappedC));
        }
      } catch (e) {
        console.error("Error fetching communities:", e);
      }

      try {
        const resSC = await fetch(BASE_API + '/sub-communities');
        const dataSC = await resSC.json();
        if (resSC.ok && dataSC.data && dataSC.data.code === 200) {
          const mappedSC = dataSC.data.data.map(s => ({
            id: String(s.id),
            community_id: String(s.community_id),
            name_ta: s.sub_community_name_tamil || '',
            name_en: s.sub_community_name_english || ''
          }));
          setSubCommunities(mappedSC);
          localStorage.setItem('local_sub_communities', JSON.stringify(mappedSC));
        }
      } catch (e) {
        console.error("Error fetching sub-communities:", e);
      }

      try {
        const resK = await fetch(BASE_API + '/kulas');
        const dataK = await resK.json();
        if (resK.ok && dataK.data && dataK.data.code === 200) {
          const mappedK = dataK.data.data.map(k => ({
            id: String(k.id),
            community_id: String(k.community_id),
            name_ta: k.kula_name_tamil || '',
            name_en: k.kula_name_english || ''
          }));
          setKulams(mappedK);
          localStorage.setItem('local_kulams', JSON.stringify(mappedK));
        }
      } catch (e) {
        console.error("Error fetching kulams:", e);
      }

      try {
        const resKD = await fetch(BASE_API + '/kula-deivams');
        const dataKD = await resKD.json();
        if (resKD.ok && dataKD.data && dataKD.data.code === 200) {
          const mappedKD = dataKD.data.data.map(kd => ({
            id: String(kd.id),
            community_id: String(kd.community_id),
            sub_community_id: String(kd.sub_community_id),
            kula_id: String(kd.kula_id),
            name_ta: kd.deity_name_tamil || '',
            name_en: kd.deity_name_english || '',
            image: kd.image_path || ''
          }));
          setKulaDeivams(mappedKD);
          localStorage.setItem('local_kula_deivams', JSON.stringify(mappedKD));
        }
      } catch (e) {
        console.error("Error fetching kula deivams:", e);
      }

      try {
        const resV = await fetch(BASE_API + '/vagaiyaras');
        const dataV = await resV.json();
        if (resV.ok && dataV.data && dataV.data.code === 200) {
          const mappedV = dataV.data.data.map(v => ({
            id: String(v.id),
            community_id: String(v.community_id),
            sub_community_id: String(v.sub_community_id),
            kula_id: String(v.kula_id),
            name_ta: v.our_gen_name_tamil || v.vagaiyara_name_tamil || '',
            name_en: v.our_gen_name_english || v.vagaiyara_name_english || '',
            sontha_uru: v.native_place || '',
            epo_uru: v.current_place || ''
          }));
          setVagaiyaras(mappedV);
          localStorage.setItem('local_vagaiyaras', JSON.stringify(mappedV));
        }
      } catch (e) {
        console.error("Error fetching vagaiyaras:", e);
      }

      try {
        const resFD = await fetch(BASE_API + '/community-selections');
        const dataFD = await resFD.json();
        if (resFD.ok && dataFD.data && dataFD.data.code === 200) {
          setSelections(dataFD.data.data);
          localStorage.setItem('local_selections', JSON.stringify(dataFD.data.data));
        }
      } catch (e) {
        console.error("Error fetching community selections:", e);
      }
    };
    fetchAllData();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('local_communities', JSON.stringify(communities));
  }, [communities]);

  useEffect(() => {
    localStorage.setItem('local_sub_communities', JSON.stringify(subCommunities));
  }, [subCommunities]);

  useEffect(() => {
    localStorage.setItem('local_kula_deivams', JSON.stringify(kulaDeivams));
  }, [kulaDeivams]);

  useEffect(() => {
    localStorage.setItem('local_vagaiyaras', JSON.stringify(vagaiyaras));
  }, [vagaiyaras]);

  useEffect(() => {
    localStorage.setItem('local_kulams', JSON.stringify(kulams));
  }, [kulams]);

  useEffect(() => {
    localStorage.setItem('local_selections', JSON.stringify(selections));
  }, [selections]);

  // Derived filter options
  const availableSubCommunities = subCommunities.filter(
    sub => sub.community_id === selectedCommunityId
  );

  const availableKulaDeivams = kulaDeivams.filter(kd => {
    const matchComm = String(kd.community_id) === String(selectedCommunityId);
    const matchSub = !selectedSubCommunityId || String(kd.sub_community_id) === String(selectedSubCommunityId);
    let matchKula = true;
    if (kulam) {
      const foundKulam = kulams.find(k => `${k.name_ta} (${k.name_en})` === kulam);
      if (foundKulam) {
        matchKula = String(kd.kula_id) === String(foundKulam.id);
      }
    }
    return matchComm && matchSub && matchKula;
  });

  const availableVagaiyaras = vagaiyaras.filter(v => {
    const matchComm = String(v.community_id) === String(selectedCommunityId);
    const matchSub = !selectedSubCommunityId || String(v.sub_community_id) === String(selectedSubCommunityId);
    let matchKula = true;
    if (kulam) {
      const foundKulam = kulams.find(k => `${k.name_ta} (${k.name_en})` === kulam);
      if (foundKulam) {
        matchKula = String(v.kula_id) === String(foundKulam.id);
      }
    }
    return matchComm && matchSub && matchKula;
  });

  const availableKulams = kulams.filter(
    k => k.community_id === selectedCommunityId
  );

  // Selected details
  const currentVagaiyaraDetails = vagaiyaras.find(v => v.id === selectedVagaiyaraId);


  // Handle adding new Vagaiyara
  const handleAddVagaiyara = async (e) => {
    e.preventDefault();
    if (!selectedCommunityId) {
      showWarning('தேர்வு தேவை', 'தயவுசெய்து முதலில் சமூகத்தை தேர்ந்தெடுக்கவும் (Please select community first)');
      return;
    }
    if (!newVagaiyaraTa.trim() || !newVagaiyaraEn.trim() || !newVagaiyaraSonthaUru.trim() || !newVagaiyaraEpoUru.trim()) {
      showWarning('விவரம் தேவை', 'அனைத்து விவரங்களையும் உள்ளிடவும் (Please fill all fields)');
      return;
    }

    let kula_id = 0;
    if (kulam) {
      const foundKulam = kulams.find(k => `${k.name_ta} (${k.name_en})` === kulam);
      if (foundKulam) {
        kula_id = Number(foundKulam.id);
      }
    }

    const payload = {
      community_id: Number(selectedCommunityId),
      sub_community_id: Number(selectedSubCommunityId),
      kula_id: Number(kula_id),
      our_gen_name_tamil: newVagaiyaraTa.trim(),
      our_gen_name_english: newVagaiyaraEn.trim(),
      ancestor_gen_name_tamil: newVagaiyaraTa.trim(),
      ancestor_gen_name_english: newVagaiyaraEn.trim(),
      native_place: newVagaiyaraSonthaUru.trim(),
      current_place: newVagaiyaraEpoUru.trim(),
      status: 'active'
    };

    try {
      const response = await fetch(BASE_API + '/vagaiyara/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (response.ok && result.data && result.data.code === 200) {
        const insertedId = String(result.data.id);
        const newVag = {
          id: insertedId,
          community_id: String(selectedCommunityId),
          sub_community_id: String(selectedSubCommunityId),
          kula_id: String(kula_id),
          name_ta: newVagaiyaraTa.trim(),
          name_en: newVagaiyaraEn.trim(),
          sontha_uru: newVagaiyaraSonthaUru.trim(),
          epo_uru: newVagaiyaraEpoUru.trim()
        };

        setVagaiyaras(prev => [...prev, newVag]);
        setSelectedVagaiyaraId(insertedId);
        setNewVagaiyaraTa('');
        setNewVagaiyaraEn('');
        setNewVagaiyaraSonthaUru('');
        setNewVagaiyaraEpoUru('');
        setShowAddVagaiyaraModal(false);
        showSuccess('வெற்றி', 'வகைரா மற்றும் ஊர் விவரங்கள் சேர்க்கப்பட்டன (Vagaiyara & places added successfully!)');
      } else {
        showError('பிழை', result.data?.message || 'சேமிக்க முடியவில்லை');
      }
    } catch (err) {
      showError('பிழை', 'சேவையகத்தை இணைக்க முடியவில்லை (Unable to connect to server)');
    }
  };

  // Toggle multiple Kula Deivams (changed to single-select)
  const handleToggleKulaDeivam = (id) => {
    setSelectedKulaDeivamIds([id]);
  };

  // Save the entire form selection
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (availableKulams.length > 0 && !kulam) {
      showWarning('பிழை', 'குலத்தை தேர்ந்தெடுக்கவும் (Please select Kulam)');
      return;
    }

    if (selectedKulaDeivamIds.length === 0) {
      showWarning('பிழை', 'குலதெய்வத்தை தேர்ந்தெடுக்கவும் (Please select Kula Deivam)');
      return;
    }

    let kula_id = 0;
    if (kulam) {
      const foundKulam = kulams.find(k => String(k.id) === String(kulam) || `${k.name_ta} (${k.name_en})` === kulam);
      if (foundKulam) {
        kula_id = Number(foundKulam.id);
      }
    }

    let spouse_kula_deivam_id = null;
    if (maritalStatus === 'married' && wifeKulaDeivam) {
      const cleanWifeDeity = wifeKulaDeivam.trim().toLowerCase();
      const foundDeity = kulaDeivams.find(kd => 
        cleanWifeDeity.includes(kd.name_ta.toLowerCase()) || 
        cleanWifeDeity.includes(kd.name_en.toLowerCase())
      );
      if (foundDeity) {
        spouse_kula_deivam_id = Number(foundDeity.id);
      }
    }

    const payload = {
      community_id: Number(selectedCommunityId),
      sub_community_id: Number(selectedSubCommunityId),
      kula_id: Number(kula_id),
      kula_deivam_id: Number(selectedKulaDeivamIds[0]),
      vagaiyara_id: Number(selectedVagaiyaraId),
      tharpothaiya_vagaiyara: tharpothaiyaVagaiyara.trim(),
      generation_no: generation ? Number(generation) : null,
      marital_status: maritalStatus,
      spouse_name: maritalStatus === 'married' ? wifeName.trim() : null,
      spouse_kula_deivam_id: spouse_kula_deivam_id
    };

    try {
      const response = await fetch(BASE_API + '/community-selection/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (response.ok && result.data && result.data.code === 200) {
        const newSel = {
          id: result.data.id,
          community_id: Number(selectedCommunityId),
          sub_community_id: Number(selectedSubCommunityId),
          kula_id: Number(kula_id),
          kula_deivam_id: Number(selectedKulaDeivamIds[0]),
          vagaiyara_id: Number(selectedVagaiyaraId),
          tharpothaiya_vagaiyara: tharpothaiyaVagaiyara.trim(),
          generation_no: generation ? Number(generation) : null,
          marital_status: maritalStatus,
          spouse_name: maritalStatus === 'married' ? wifeName.trim() : null,
          spouse_kula_deivam_id: spouse_kula_deivam_id,
          created_at: new Date().toISOString()
        };

        setSelections(prev => [newSel, ...prev]);
        showSuccess('பதிவு செய்யப்பட்டது!', 'விவரங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன (Details saved successfully!)');

        // Reset Form
        setSelectedCommunityId('');
        setSelectedSubCommunityId('');
        setSelectedKulaDeivamIds([]);
        setSelectedVagaiyaraId('');
        setTharpothaiyaVagaiyara('');
        setCurrentPlace('');
        setKulam('');
        setGeneration('');
        setMaritalStatus('');
        setWifeName('');
        setWifeKulaDeivam('');
        setActiveStep(1);
      } else {
        showError('பிழை', result.data?.message || 'சேமிக்க முடியவில்லை');
      }
    } catch (err) {
      showError('பிழை', 'சேவையகத்தை இணைக்க முடியவில்லை (Unable to connect to server)');
    }
  };

  // Delete an entry
  const handleDeleteEntry = async (id) => {
    const confirm = await showConfirm('நிச்சயமாக நீக்க வேண்டுமா?', 'இந்த பதிவை நீக்க விரும்புகிறீர்களா? (Delete this record?)');
    if (confirm.isConfirmed) {
      try {
        const response = await fetch(`${BASE_API}/community-selection/delete/${id}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (response.ok && result.data && result.data.code === 200) {
          setSelections(prev => prev.filter(entry => String(entry.id) !== String(id)));
          showSuccess('நீக்கப்பட்டது!', 'பதிவு நீக்கப்பட்டது (Record deleted successfully)');
        } else {
          showError('பிழை', result.data?.message || 'நீக்க முடியவில்லை');
        }
      } catch (err) {
        showError('பிழை', 'சேவையகத்தை இணைக்க முடியவில்லை (Unable to connect to server)');
      }
    }
  };

  // Compile registered entries dynamically
  const registeredEntries = selections.map(sel => {
    const comm = communities.find(c => String(c.id) === String(sel.community_id));
    const subComm = subCommunities.find(s => String(s.id) === String(sel.sub_community_id));
    const kula = kulams.find(k => String(k.id) === String(sel.kula_id));
    const primaryDeity = kulaDeivams.find(kd => String(kd.id) === String(sel.kula_deivam_id));
    const vag = vagaiyaras.find(v => String(v.id) === String(sel.vagaiyara_id)) || {};
    
    let spouseDeityName = '--';
    if (sel.spouse_kula_deivam_id) {
      const foundDeity = kulaDeivams.find(kd => String(kd.id) === String(sel.spouse_kula_deivam_id));
      if (foundDeity) {
        spouseDeityName = `${foundDeity.name_ta} (${foundDeity.name_en})`;
      }
    }

    const genLabel = GENERATIONS.find(g => g.value === String(sel.generation_no))?.label || (sel.generation_no ? `${sel.generation_no}வது தலைமுறை` : '--');

    return {
      id: String(sel.id),
      community_name: comm ? `${comm.name_ta} (${comm.name_en})` : 'Unknown',
      sub_community_name: subComm ? `${subComm.name_ta} (${subComm.name_en})` : '--',
      kulam: kula ? `${kula.name_ta} (${kula.name_en})` : '--',
      kula_deivam_name: primaryDeity ? `${primaryDeity.name_ta} (${primaryDeity.name_en})` : 'Unknown',
      kula_deivam_image: primaryDeity ? getKulaDeivamImageUrl(primaryDeity) : '',
      kula_deivam_images: primaryDeity ? [getKulaDeivamImageUrl(primaryDeity)] : [],
      vagaiyara_name: vag.name_ta ? `${vag.name_ta} (${vag.name_en})` : 'Unknown',
      tharpothaiya_vagaiyara: sel.tharpothaiya_vagaiyara || '--',
      sontha_uru: vag.sontha_uru || '',
      epo_uru: vag.epo_uru || '',
      generation_label: genLabel,
      marital_status: sel.marital_status === 'married' ? 'Married (திருமணமானவர்)' : 'Unmarried (திருமணமாகாதவர்)',
      wife_name: sel.spouse_name || '--',
      wife_kula_deivam: spouseDeityName,
      created_at: sel.created_at ? new Date(sel.created_at).toLocaleString() : new Date().toLocaleString()
    };
  });

  // Filter registered entries
  const filteredEntries = registeredEntries.filter(entry => {
    const term = searchQuery.toLowerCase();
    return (
      entry.community_name.toLowerCase().includes(term) ||
      entry.sub_community_name.toLowerCase().includes(term) ||
      (entry.kulam && entry.kulam.toLowerCase().includes(term)) ||
      entry.kula_deivam_name.toLowerCase().includes(term) ||
      entry.vagaiyara_name.toLowerCase().includes(term) ||
      entry.tharpothaiya_vagaiyara.toLowerCase().includes(term) ||
      entry.sontha_uru.toLowerCase().includes(term) ||
      entry.epo_uru.toLowerCase().includes(term) ||
      entry.wife_name.toLowerCase().includes(term)
    );
  });

  // Calculate form validation steps dynamically
  const isSection1Done = selectedCommunityId && selectedKulaDeivamIds.length > 0 && (availableKulams.length === 0 || kulam);
  const isSection2Done = isSection1Done && selectedVagaiyaraId && tharpothaiyaVagaiyara.trim() && generation;
  const isSection3Done = isSection2Done && maritalStatus && (maritalStatus === 'unmarried' || (wifeName.trim() && wifeKulaDeivam.trim()));

  return (
    <div className="form-card" style={{ maxWidth: '1440px', margin: '0 auto', padding: '10px' }}>

      {/* Title Header */}
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Users size={24} color="#6366f1" />
          <h2 style={{ margin: 0, fontSize: '20px' }}>குலதெய்வம் வழிபாடு</h2>
        </div>
        <p style={{ fontSize: '13px' }}>சமூகம், உட்பிரிவு, குலதெய்வம், வகைரா மற்றும் குடும்ப திருமண விவரங்களை உள்ளிடும் படிவம்.</p>
      </div>

      {/* Stepper Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: '#f8fafc', padding: '16px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '16px' }}>
        {[
          { step: 1, label: 'சமூகம் & குலதெய்வம்', sub: 'Step 1: Community & Deity' },
          { step: 2, label: 'வகைரா & உறைவிடம்', sub: 'Step 2: Vagaiyara & Places' },
          { step: 3, label: 'குடும்ப விவரங்கள்', sub: 'Step 3: Family Details' }
        ].map((item, idx) => {
          const isActive = activeStep === item.step;
          const isDone = activeStep > item.step;
          const isAccessible = item.step === 1 || (item.step === 2 && isSection1Done) || (item.step === 3 && isSection2Done);
          return (
            <React.Fragment key={item.step}>
              <div 
                onClick={() => {
                  if (isAccessible) {
                    setActiveStep(item.step);
                  }
                }}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  cursor: isAccessible ? 'pointer' : 'not-allowed',
                  opacity: isActive || isDone ? 1 : 0.5,
                  flexShrink: 0
                }}
              >
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: isDone ? '#10b981' : isActive ? '#4f46e5' : '#cbd5e1', 
                  color: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '14px', 
                  fontWeight: '800' 
                }}>
                  {isDone ? '✓' : item.step}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: isActive ? '#1e1b4b' : '#475569' }}>{item.label}</div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '1px' }}>{item.sub}</div>
                </div>
              </div>
              {idx < 2 && (
                <div style={{ flex: 1, height: '2px', background: activeStep > item.step ? '#10b981' : '#cbd5e1', minWidth: '40px' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Main Content Layout: Form Container */}
      <div style={{ marginBottom: '40px' }}>
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* SECTION 1: Community & Deity (Always Active) */}
          {activeStep === 1 && (
            <>
              <div className="card" style={{
              padding: '24px',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
              background: '#ffffff',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800' }}>1</div>
              <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: '800', color: '#1e293b' }}>
                சமூகம் & குலதெய்வம் (Community & Deity Details)
              </h3>
              {isSection1Done ? (
                <span style={{ marginLeft: 'auto', background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '30px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={12} /> பூர்த்தி செய்யப்பட்டது
                </span>
              ) : (
                <span style={{ marginLeft: 'auto', background: '#fef3c7', color: '#d97706', padding: '3px 10px', borderRadius: '30px', fontSize: '11px', fontWeight: '700' }}>
                  தேவை
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                {/* Select Community */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155', margin: 0 }}>சமூகம் (Select Community) <span style={{ color: '#ef4444' }}>*</span></label>
                    <button
                      type="button"
                      onClick={() => navigate('/community-manage')}
                      style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', fontWeight: '700', padding: 0 }}
                    >
                      <Plus size={12} /> சேர்க்க
                    </button>
                  </div>
                  <select
                    className="form-control"
                    value={selectedCommunityId}
                    onChange={(e) => {
                      setSelectedCommunityId(e.target.value);
                      setSelectedSubCommunityId('');
                      setSelectedKulaDeivamIds([]);
                      setSelectedVagaiyaraId('');
                      setCurrentPlace('');
                      setKulam('');
                    }}
                    required
                    style={{ height: '44px', borderRadius: '10px', border: '1.5px solid #cbd5e1', appearance: 'auto', paddingLeft: '12px', fontSize: '13.5px', fontWeight: '500' }}
                  >
                    <option value="">-- சமூகம்  தேர்ந்தெடுக்கவும் (Select Community) --</option>
                    {communities.map(c => (
                      <option key={c.id} value={c.id}>{c.name_ta} ({c.name_en})</option>
                    ))}
                  </select>
                </div>

                {/* Select Sub-Community */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155', margin: 0 }}>உட்பிரிவு (Select Sub-Community)</label>
                    <button
                      type="button"
                      onClick={() => navigate('/subcommunity-manage')}
                      style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', fontWeight: '700', padding: 0 }}
                    >
                      <Plus size={12} /> சேர்க்க
                    </button>
                  </div>
                  <select
                    className="form-control"
                    value={selectedSubCommunityId}
                    onChange={(e) => {
                      setSelectedSubCommunityId(e.target.value);
                      setSelectedKulaDeivamIds([]);
                    }}
                    disabled={!selectedCommunityId}
                    style={{ height: '44px', borderRadius: '10px', border: '1.5px solid #cbd5e1', appearance: 'auto', paddingLeft: '12px', fontSize: '13.5px', fontWeight: '500', background: !selectedCommunityId ? '#f8fafc' : '#fff' }}
                  >
                    <option value="">-- உட்பிரிவு தேர்ந்தெடுக்கவும் (Select Sub-Community) --</option>
                    {availableSubCommunities.map(sc => (
                      <option key={sc.id} value={sc.id}>{sc.name_ta} ({sc.name_en})</option>
                    ))}
                  </select>
                </div>

                {/* Kulam (Caste Clan) */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155', margin: 0 }}>
                      குலம் (Kulam) {availableKulams.length > 0 && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate('/kulam-manage')}
                      style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', fontWeight: '700', padding: 0 }}
                    >
                      <Plus size={12} /> சேர்க்க
                    </button>
                  </div>
                  {availableKulams.length > 0 ? (
                    <select
                      className="form-control"
                      value={kulam}
                      onChange={(e) => setKulam(e.target.value)}
                      required
                      style={{ height: '44px', borderRadius: '10px', border: '1.5px solid #cbd5e1', appearance: 'auto', paddingLeft: '12px', fontSize: '13.5px', fontWeight: '500' }}
                    >
                      <option value="">-- குலம் தேர்ந்தெடுக்கவும் (Select Kulam) --</option>
                      {availableKulams.map(k => (
                        <option key={k.id} value={`${k.name_ta} (${k.name_en})`}>
                          {k.name_ta} ({k.name_en})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder={selectedCommunityId ? "குலத்தின் பெயரை உள்ளிடவும்" : "-- முதலில் சமூகத்தை தேர்ந்தெடுக்கவும் --"}
                      value={kulam}
                      onChange={(e) => setKulam(e.target.value)}
                      disabled={!selectedCommunityId}
                      style={{ height: '44px', borderRadius: '10px', border: '1.5px solid #cbd5e1', paddingLeft: '12px', fontSize: '13.5px', background: !selectedCommunityId ? '#f8fafc' : '#fff' }}
                    />
                  )}
                </div>
              </div>

              {/* List Kula Deivam & Option to Add */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: '750', fontSize: '13.5px', color: '#1e293b', marginBottom: '2px', display: 'block' }}>
                      குல தெய்வம் பட்டியல் (Kula Deivam List) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>தங்கள் உட்பிரிவிற்குரிய குல தெய்வத்தை தேர்வு செய்யவும்.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/kula-deivam')}
                    className="btn"
                    style={{ height: '28px', fontSize: '11px', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}
                  >
                    <Plus size={12} /> தெய்வம் சேர்க்க
                  </button>
                </div>

                {!selectedCommunityId ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '24px', background: '#fff', border: '1.5px dashed #cbd5e1', borderRadius: '10px', color: '#64748b', fontSize: '12.5px', justifyContent: 'center' }}>
                    <AlertCircle size={16} color="#64748b" />
                    சமூகம் தேர்ந்தெடுத்தவுடன் குலதெய்வம் பட்டியல் காட்டப்படும். (Please select community first)
                  </div>
                ) : availableKulaDeivams.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px', background: '#fff', border: '1.5px dashed #cbd5e1', borderRadius: '10px', color: '#64748b', fontSize: '12.5px', textAlign: 'center' }}>
                    <span>தற்போது குல தெய்வங்கள் எதுவும் இல்லை. புதிய குலதெய்வம் சேர்க்க மேலே உள்ள பட்டனை அழுத்தவும்.</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>(No deities matched. Click "தெய்வம் சேர்க்க" to add one)</span>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                    {availableKulaDeivams.map(kd => {
                      const isSelected = selectedKulaDeivamIds.includes(kd.id);
                      return (
                        <div
                          key={kd.id}
                          onClick={() => handleToggleKulaDeivam(kd.id)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '12px',
                            border: `2px solid ${isSelected ? '#4f46e5' : '#e2e8f0'}`,
                            background: isSelected ? '#eef2ff' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.2s ease',
                            boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.12)' : '0 2px 4px rgba(0,0,0,0.02)'
                          }}
                        >
                          <img
                            src={getKulaDeivamImageUrl(kd)}
                            alt={kd.name_en}
                            onError={(e) => {
                              e.target.src = BASE_API + '/files/default_god.svg';
                              e.target.onerror = null;
                            }}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '1.5px solid #e2e8f0',
                              background: '#f8fafc',
                              flexShrink: 0
                            }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? '#1e1b4b' : '#334155' }}>{kd.name_ta}</span>
                            <span style={{ fontSize: '11px', color: isSelected ? '#4f46e5' : '#64748b', marginTop: '2px' }}>{kd.name_en}</span>
                          </div>
                          {isSelected && (
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
            {/* Step 1 Action Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                disabled={!isSection1Done}
                onClick={() => setActiveStep(2)}
                className="btn btn-primary"
                style={{
                  height: '44px',
                  padding: '0 28px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: isSection1Done ? '#4f46e5' : '#cbd5e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSection1Done ? 'pointer' : 'not-allowed',
                  fontWeight: '700',
                  fontSize: '13.5px'
                }}
              >
                அடுத்தது (Next) <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

          {/* SECTION 2: Vagaiyara & Locations (Active once Section 1 is filled) */}
          {activeStep === 2 && (
            <div className="card" style={{
              padding: '24px',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
              background: '#ffffff',
              transition: 'all 0.3s ease'
            }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800' }}>2</div>
                <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: '800', color: '#1e293b' }}>
                  வகைரா & உறைவிடம் (Vagaiyara & Places)
                </h3>
                {isSection2Done ? (
                  <span style={{ marginLeft: 'auto', background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '30px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={12} /> பூர்த்தி செய்யப்பட்டது
                  </span>
                ) : (
                  <span style={{ marginLeft: 'auto', background: '#fef3c7', color: '#d97706', padding: '3px 10px', borderRadius: '30px', fontSize: '11px', fontWeight: '700' }}>
                    தேவை
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155', marginBottom: '2px' }}>
                      வகைரா தேர்வு (Select Vagaiyara) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>தங்கள் கூட்டமைப்பின் கிளை அல்லது வகைராவை தேர்ந்தெடுக்கவும்.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/vagaiyara-manage')}
                    className="btn"
                    style={{ height: '32px', fontSize: '11.5px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}
                  >
                    <Plus size={14} /> வகைரா சேர்க்க
                  </button>
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  {/* Select Vagaiyara */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155', whiteSpace: 'nowrap' }}>முத்தையா வகையரா (Muthaiya Vagaiyara) <span style={{ color: '#ef4444' }}>*</span></label>
                    <select
                      className="form-control"
                      value={selectedVagaiyaraId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedVagaiyaraId(val);
                        const vag = vagaiyaras.find(v => v.id === val);
                        if (vag) {
                          setCurrentPlace(vag.epo_uru);
                        } else {
                          setCurrentPlace('');
                        }
                      }}
                      required
                      style={{ height: '44px', borderRadius: '10px', border: '1.5px solid #cbd5e1', appearance: 'auto', paddingLeft: '12px', fontSize: '13.5px' }}
                    >
                      <option value="">-- வகைரா தேர்ந்தெடுக்கவும் (Select Vagaiyara) --</option>
                      {availableVagaiyaras.map(v => (
                        <option key={v.id} value={v.id}>{v.name_ta} ({v.name_en})</option>
                      ))}
                    </select>
                  </div>

                  {/* Input Tharpothaiya Vagaiyara */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155', whiteSpace: 'nowrap' }}>தற்போதைய வகையரா (Tharpothaiya Vagaiyara) <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="தற்போதைய வகையராவை உள்ளிடவும்"
                      value={tharpothaiyaVagaiyara}
                      onChange={(e) => setTharpothaiyaVagaiyara(e.target.value)}
                      required
                      style={{ height: '44px', borderRadius: '10px', border: '1.5px solid #cbd5e1', paddingLeft: '12px', fontSize: '13.5px' }}
                    />
                  </div>

                  {/* Generation Select */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155', whiteSpace: 'nowrap' }}>எந்த தலைமுறை (Select Generation) <span style={{ color: '#ef4444' }}>*</span></label>
                    <select
                      className="form-control"
                      value={generation}
                      onChange={(e) => setGeneration(e.target.value)}
                      required
                      style={{ height: '44px', borderRadius: '10px', border: '1.5px solid #cbd5e1', appearance: 'auto', paddingLeft: '12px', fontSize: '13.5px' }}
                    >
                      <option value="">-- தலைமுறையை தேர்ந்தெடுக்கவும் --</option>
                      {GENERATIONS.map(g => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location details removed as they are loaded directly from vagaiyara-manage */}
              </div>

              {/* Step 2 Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="btn"
                  style={{
                    height: '44px',
                    padding: '0 24px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '13.5px'
                  }}
                >
                  முந்தையது (Back)
                </button>
                <button
                  type="button"
                  disabled={!isSection2Done}
                  onClick={() => setActiveStep(3)}
                  className="btn btn-primary"
                  style={{
                    height: '44px',
                    padding: '0 28px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: isSection2Done ? '#4f46e5' : '#cbd5e1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isSection2Done ? 'pointer' : 'not-allowed',
                    fontWeight: '700',
                    fontSize: '13.5px'
                  }}
                >
                  அடுத்தது (Next) <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* SECTION 3: Married / Unmarried & Husband Details (Active once Section 2 is filled) */}
          {activeStep === 3 && (
            <>
              <div className="card" style={{
                padding: '24px',
                borderRadius: '16px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
                background: '#ffffff',
                transition: 'all 0.3s ease'
              }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800' }}>3</div>
                  <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: '800', color: '#1e293b' }}>
                    திருமணம் நிலை & குடும்ப விவரம் (Marital Status & Family)
                  </h3>
                  {isSection3Done ? (
                    <span style={{ marginLeft: 'auto', background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '30px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={12} /> பூர்த்தி செய்யப்பட்டது
                    </span>
                  ) : (
                    <span style={{ marginLeft: 'auto', background: '#fef3c7', color: '#d97706', padding: '3px 10px', borderRadius: '30px', fontSize: '11px', fontWeight: '700' }}>
                      தேவை
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '750', fontSize: '13.5px', color: '#1e293b', marginBottom: '12px', display: 'block' }}>
                      திருமண நிலை (Select Marital Status) <span style={{ color: '#ef4444' }}>*</span>
                    </label>

                    <div style={{ display: 'flex', gap: '20px' }}>
                      {/* Married Option Card */}
                      <div
                        onClick={() => setMaritalStatus('married')}
                        style={{
                          flex: 1,
                          padding: '20px',
                          borderRadius: '12px',
                          border: `2px solid ${maritalStatus === 'married' ? '#4f46e5' : '#e2e8f0'}`,
                          background: maritalStatus === 'married' ? '#eef2ff' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all 0.2s ease',
                          boxShadow: maritalStatus === 'married' ? '0 6px 16px rgba(79, 70, 229, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                      >
                        <Heart size={26} color={maritalStatus === 'married' ? '#4f46e5' : '#94a3b8'} fill={maritalStatus === 'married' ? '#4f46e5' : 'transparent'} />
                        <span style={{ fontSize: '14px', fontWeight: '800', color: maritalStatus === 'married' ? '#1e1b4b' : '#475569' }}>திருமணமானவர் (Married)</span>
                        <p style={{ margin: 0, fontSize: '11px', color: '#64748b', textAlign: 'center' }}>மனைவி மற்றும் மனைவி வீட்டு குலதெய்வம் விவரங்களை வழங்கவும்.</p>
                      </div>

                      {/* Unmarried Option Card */}
                      <div
                        onClick={() => {
                          setMaritalStatus('unmarried');
                          setWifeName('');
                          setWifeKulaDeivam('');
                        }}
                        style={{
                          flex: 1,
                          padding: '20px',
                          borderRadius: '12px',
                          border: `2px solid ${maritalStatus === 'unmarried' ? '#4f46e5' : '#e2e8f0'}`,
                          background: maritalStatus === 'unmarried' ? '#eef2ff' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all 0.2s ease',
                          boxShadow: maritalStatus === 'unmarried' ? '0 6px 16px rgba(79, 70, 229, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                      >
                        <Bookmark size={26} color={maritalStatus === 'unmarried' ? '#4f46e5' : '#94a3b8'} />
                        <span style={{ fontSize: '14px', fontWeight: '800', color: maritalStatus === 'unmarried' ? '#1e1b4b' : '#475569' }}>திருமணமாகாதவர் (Unmarried)</span>
                        <p style={{ margin: 0, fontSize: '11px', color: '#64748b', textAlign: 'center' }}>தங்கள் பிறப்பு வழியிலான சொந்த குடும்ப குலதெய்வத்துடன் தொடரும்.</p>
                      </div>
                    </div>
                  </div>

                   {/* If Married, show Wife Details */}
                   {maritalStatus === 'married' && (
                     <div className="animate-fade-in" style={{ background: '#f8fafc', padding: '22px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '5px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1.5px solid #cbd5e1', paddingBottom: '10px' }}>
                         <Award size={20} color="#4f46e5" />
                         <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e1b4b' }}>மனைவி & அவர் குலதெய்வம் விவரங்கள் (Wife Details)</span>
                       </div>
    
                       <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                         {/* Wife Name Input */}
                         <div className="form-group">
                           <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>மனைவி பெயர் (Wife's Name) <span style={{ color: '#ef4444' }}>*</span></label>
                           <div style={{ position: 'relative' }}>
                             <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                             <input
                               type="text"
                               className="form-control"
                               placeholder="மனைவி பெயரை உள்ளிடவும்"
                               value={wifeName}
                               onChange={(e) => setWifeName(e.target.value)}
                               required
                               style={{ height: '42px', borderRadius: '10px', border: '1.5px solid #cbd5e1', paddingLeft: '36px', fontSize: '13.5px' }}
                             />
                           </div>
                         </div>
    
                         {/* Wife Kula Deivam selection or input */}
                         <div className="form-group">
                           <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>மனைவியின் குலதெய்வம் (Wife's Kula Deivam) <span style={{ color: '#ef4444' }}>*</span></label>
                           <input
                             type="text"
                             className="form-control"
                             placeholder="எ.கா: முனீஸ்வரன் / காளியம்மன்"
                             value={wifeKulaDeivam}
                             onChange={(e) => setWifeKulaDeivam(e.target.value)}
                             list="kulaDeivamsList"
                             required
                             style={{ height: '42px', borderRadius: '10px', border: '1.5px solid #cbd5e1', paddingLeft: '12px', fontSize: '13.5px' }}
                           />
                           <datalist id="kulaDeivamsList">
                             {kulaDeivams.map(kd => (
                               <option key={kd.id} value={`${kd.name_ta} (${kd.name_en})`} />
                             ))}
                           </datalist>
                           <span style={{ fontSize: '10.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>* நீங்கள் புதிய பெயரை தட்டச்சு செய்யலாம் அல்லது பட்டியலிலிருந்து தேர்வு செய்யலாம்</span>
                         </div>
                       </div>
                     </div>
                   )}
                </div>
              </div>

              {/* Submit Action Container */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="btn"
                  style={{
                    height: '44px',
                    padding: '0 24px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '13.5px'
                  }}
                >
                  முந்தையது (Back)
                </button>
                <button
                  type="submit"
                  disabled={!isSection3Done}
                  className="btn btn-primary"
                  style={{
                    height: '48px',
                    padding: '0 36px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: isSection3Done ? '#4f46e5' : '#cbd5e1',
                    borderColor: isSection3Done ? '#4f46e5' : '#cbd5e1',
                    color: isSection3Done ? 'white' : '#64748b',
                    fontSize: '15px',
                    fontWeight: '800',
                    borderRadius: '12px',
                    boxShadow: isSection3Done ? '0 10px 20px -5px rgba(79, 70, 229, 0.4)' : 'none',
                    cursor: isSection3Done ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease'
                  }}
                >
                  பதிவுகளைச் சேமிக்கவும் (Save All Details) <Save size={18} />
                </button>
              </div>
            </>
          )}

        </form>
      </div>

      {/* Database Registered List View */}
      <div className="card" style={{ padding: 0, borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(148, 163, 184, 0.12)' }}>

        {/* Table Header Controls */}
        <div style={{ padding: '20px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={18} color="#2563eb" style={{ background: '#dbeafe', padding: '2px', borderRadius: '4px' }} />
              பதிவு செய்யப்பட்ட பட்டியல்கள் (Registered Submissions - Database)
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
              தரவுத்தளத்தில் சேமிக்கப்பட்ட படிவங்களின் பதிவுகள். (Saved dynamically in Database)
            </p>
          </div>

          <div className="input-wrapper" style={{ width: '320px', margin: 0, position: 'relative' }}>
            <Search className="input-icon" size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="தேடல் (சமூகம், குலதெய்வம், வகைரா, மனைவி பெயர்)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: '38px', fontSize: '13px', paddingLeft: '36px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="table-container" style={{ border: 'none', margin: 0 }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>சமூகம் மற்றும் உட்பிரிவு</th>
                <th>குலம் (Kulam)</th>
                <th>குல தெய்வம்</th>
                <th>வகைரா</th>
                <th>சொந்த ஊர் / இப்போதைய ஊர்</th>
                <th>தலைமுறை</th>
                <th>திருமண நிலை & மனைவி விவரம்</th>
                <th style={{ textAlign: 'center', width: '100px' }}>செயல்பாடு (Actions)</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <AlertCircle size={32} color="#94a3b8" />
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>பதிவுகள் ஏதும் இல்லை (No submissions found)</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>விவரங்களை பூர்த்தி செய்து சமர்ப்பித்தால் இந்த அட்டவணையில் காட்டப்படும்.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry, index) => (
                  <tr key={entry.id} style={{ transition: 'background-color 0.2s' }}>
                    <td style={{ fontWeight: '700', color: '#64748b' }}>{index + 1}</td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{entry.community_name.split(' ')[0]}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>உட்பிரிவு: {entry.sub_community_name}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', color: '#475569' }}>{entry.kulam || '--'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {entry.kula_deivam_images && entry.kula_deivam_images.length > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '-8px' }}>
                            {entry.kula_deivam_images.map((imgUrl, idx) => (
                              <img
                                key={idx}
                                src={imgUrl}
                                alt="Deity"
                                onError={(e) => {
                                  e.target.src = BASE_API + '/files/default_god.svg';
                                  e.target.onerror = null;
                                }}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  border: '1.5px solid #e2e8f0',
                                  background: '#f8fafc',
                                  flexShrink: 0,
                                  marginLeft: idx > 0 ? '-10px' : '0',
                                  zIndex: 10 - idx,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                              />
                            ))}
                          </div>
                        ) : entry.kula_deivam_image ? (
                          <img
                            src={entry.kula_deivam_image}
                            alt="Deity"
                            onError={(e) => {
                              e.target.src = BASE_API + '/files/default_god.svg';
                              e.target.onerror = null;
                            }}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1.5px solid #e2e8f0',
                              background: '#f8fafc',
                              flexShrink: 0
                            }}
                          />
                        ) : null}
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', display: 'inline-block' }}>
                          {entry.kula_deivam_name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{entry.vagaiyara_name}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                        <span style={{ fontWeight: '600', color: '#475569' }}>தற்போதைய:</span> {entry.tharpothaiya_vagaiyara}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px', color: '#0f172a', fontWeight: '500' }}>
                        <span style={{ color: '#059669', fontWeight: '600' }}>சொந்தம்:</span> {entry.sontha_uru}
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#3b82f6', fontWeight: '500', marginTop: '2px' }}>
                        <span style={{ color: '#2563eb', fontWeight: '600' }}>இப்போது:</span> {entry.epo_uru}
                      </div>
                    </td>
                    <td>
                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                        {entry.generation_label}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px', fontWeight: '700', color: entry.marital_status.includes('Married') ? '#e11d48' : '#64748b' }}>
                        {entry.marital_status}
                      </div>
                      {entry.marital_status.includes('Married') && (
                        <div style={{ background: '#fef2f2', padding: '6px 8px', borderRadius: '6px', border: '1px solid #fee2e2', marginTop: '4px', fontSize: '11.5px', color: '#991b1b' }}>
                          <div><strong>மனைவி:</strong> {entry.wife_name}</div>
                          <div style={{ marginTop: '2px' }}><strong>மனைவி கு.தெய்வம்:</strong> {entry.wife_kula_deivam}</div>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="btn"
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', padding: '8px', cursor: 'pointer', borderRadius: '50%' }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}


      {/* 2. Add Vagaiyara Modal */}
      {showAddVagaiyaraModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card animate-fade-in" style={{ width: '500px', padding: '24px', borderRadius: '16px', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e3a8a' }}>புதிய வகைரா மற்றும் ஊர் சேர்க்க</h3>
              <button onClick={() => setShowAddVagaiyaraModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleAddVagaiyara} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '600', fontSize: '12.5px' }}>தமிழ் பெயர் (Vagaiyara Tamil) *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="எ.கா: பெரியசாமி வகைரா"
                    value={newVagaiyaraTa}
                    onChange={(e) => setNewVagaiyaraTa(e.target.value)}
                    required
                    style={{ height: '40px', borderRadius: '8px', border: '1px solid #cbd5e1', paddingLeft: '12px' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '600', fontSize: '12.5px' }}>ஆங்கில பெயர் (Vagaiyara English) *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="எ.கா: Periyasamy Vagaiyara"
                    value={newVagaiyaraEn}
                    onChange={(e) => setNewVagaiyaraEn(e.target.value)}
                    required
                    style={{ height: '40px', borderRadius: '8px', border: '1px solid #cbd5e1', paddingLeft: '12px' }}
                  />
                </div>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '600', fontSize: '12.5px' }}>சொந்த ஊர் (Native Place) *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="எ.கா: பொள்ளாச்சி (Pollachi)"
                    value={newVagaiyaraSonthaUru}
                    onChange={(e) => setNewVagaiyaraSonthaUru(e.target.value)}
                    required
                    style={{ height: '40px', borderRadius: '8px', border: '1px solid #cbd5e1', paddingLeft: '12px' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '600', fontSize: '12.5px' }}>இப்போ இருக்குற ஊர் (Current Place) *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="எ.கா: திருப்பூர் (Tiruppur)"
                    value={newVagaiyaraEpoUru}
                    onChange={(e) => setNewVagaiyaraEpoUru(e.target.value)}
                    required
                    style={{ height: '40px', borderRadius: '8px', border: '1px solid #cbd5e1', paddingLeft: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddVagaiyaraModal(false)}
                  className="btn"
                  style={{ height: '38px', padding: '0 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ height: '38px', padding: '0 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '750' }}
                >
                  Save Vagaiyara
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CommunitySelect;

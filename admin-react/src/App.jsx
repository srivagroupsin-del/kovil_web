import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import KovilJoin from './pages/KovilJoin';
import Kovil from './pages/Kovil';
import TempleList from './pages/TempleList';
import Varalaru from './pages/Varalaru';
import Mullavar from './pages/Mullavar';
import Utanurai from './pages/Utanurai';
import Mullavar1 from './pages/Mullavar1';
import TrustLogin from './pages/TrustLogin';
import TrustOverview from './pages/TrustOverview';
import DonorsVolunteers from './pages/DonorsVolunteers';

import Pujaikal from './pages/Pujaikal';
import TotarPujai from './pages/TotarPujai';
import VisucamNeram from './pages/VisucamNeram';
import KuraiNivarthi from './pages/KuraiNivarthi';
import Aranilaiyatturai from './pages/Aranilaiyatturai';
import Tharumakatha from './pages/Tharumakatha';
import Porulatar from './pages/Porulatar';
import Annatanam from './pages/Annatanam';
import Visucam from './pages/Visucam';
import NerttiKatan from './pages/NerttiKatan';
import Address from './pages/Address';
import Takaval from './pages/Takaval';
import Kattali from './pages/Kattali';
import KullamPeople from './pages/KullamPeople';
import Community from './pages/Community';
import CommunitySelect from './pages/CommunitySelect';
import KulaDeivam from './pages/KulaDeivam';
import CommunityManage from './pages/CommunityManage';
import SubCommunityManage from './pages/SubCommunityManage';
import KulamManage from './pages/KulamManage';
import VagaiyaraManage from './pages/VagaiyaraManage';
import NityaPooja from './pages/NityaPooja';
import WeekPooja from './pages/WeekPooja';
import SpecialPooja from './pages/SpecialPooja';
import ParivaraTeyvankal from './pages/ParivaraTeyvankal';
import PikaraTeyvankal from './pages/PikaraTeyvankal';
import BaliTeyvankal from './pages/BaliTeyvankal';
import KavalTeyvankal from './pages/KavalTeyvankal';
import { ParivaraDeities, PigaraDeities, UpaDeities } from './pages/UpaTeyvankal';
import Ancestors from './pages/Ancestors';



import './index.css';

// Placeholder component for routes that aren't fully built yet (Trigger HMR)
const Placeholder = ({ title }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center' }}>
    <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>{title}</h2>
    <p style={{ color: '#718096' }}>This module goes here. You can implement the full functionality later.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/trust-login" element={<TrustLogin />} />
        <Route path="/trust-overview" element={<TrustOverview />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          
          {/* Temple Routes */}
          <Route path="koviljoin" element={<KovilJoin />} />
          <Route path="kovil" element={<Kovil />} />
          <Route path="temple-list" element={<TempleList />} />
          <Route path="varalaru" element={<Varalaru />} />

          
          {/* Deities Routes */}
          <Route path="mullavar" element={<Mullavar />} />
          <Route path="utanurai" element={<Utanurai />} />
          <Route path="mullavar1" element={<Mullavar1 />} />
          <Route path="parivara-teyvankal" element={<ParivaraTeyvankal />} />
          <Route path="pikara-teyvankal" element={<PikaraTeyvankal />} />

          <Route path="parivara-deities" element={<ParivaraDeities />} />
          <Route path="pikara-deities" element={<PigaraDeities />} />
          <Route path="upa-deities" element={<UpaDeities />} />
          <Route path="bali-deities" element={<BaliTeyvankal />} />
          <Route path="kaval-deities" element={<KavalTeyvankal />} />
          
          {/* Poojas & Festivals Routes */}
          <Route path="pujaikal" element={<Pujaikal />} />
          <Route path="nitya_pooja" element={<NityaPooja />} />
          <Route path="week_pooja" element={<WeekPooja />} />
          <Route path="special_pooja" element={<SpecialPooja />} />

          <Route path="totar_pujai" element={<TotarPujai />} />
          <Route path="visucam_neram" element={<VisucamNeram />} />
          
          {/* Administration Routes */}
          <Route path="aranilaiyatturai" element={<Aranilaiyatturai />} />
          <Route path="tharumakatha" element={<Tharumakatha />} />
          <Route path="donors-volunteers" element={<DonorsVolunteers />} />
          <Route path="porulatar" element={<Porulatar />} />
          <Route path="annatanam" element={<Annatanam />} />
          <Route path="visucam" element={<Visucam />} />
          
          {/* Devotees Routes */}
          <Route path="nertti_katan" element={<NerttiKatan />} />
          <Route path="kurai_nivarthi" element={<KuraiNivarthi />} />
          <Route path="community" element={<Community />} />
          <Route path="community-select" element={<CommunitySelect />} />
          <Route path="kula-deivam" element={<KulaDeivam />} />
          <Route path="community-manage" element={<CommunityManage />} />
          <Route path="subcommunity-manage" element={<SubCommunityManage />} />
          <Route path="kulam-manage" element={<KulamManage />} />
          <Route path="vagaiyara-manage" element={<VagaiyaraManage />} />
          
          <Route path="address" element={<Address />} />
          <Route path="takaval" element={<Takaval />} />
          <Route path="kattali" element={<Kattali />} />
          <Route path="kullam_people" element={<KullamPeople />} />
          <Route path="ancestors" element={<Ancestors />} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

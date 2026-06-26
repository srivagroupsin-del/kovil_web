import { BASE_API } from '../api/api_list';
import React from 'react';
import DeityModule from '../components/DeityModule';

export const ParivaraDeities = () => (
  <DeityModule 
    title="பரிவார தெய்வங்கள் (Parivara Deities)" 
    apiEndpoint={BASE_API + "/parivara_deivangal"} 
  />
);

export const PigaraDeities = () => (
  <DeityModule 
    title="பிகாரா தெய்வங்கள் (Pigara Deities)" 
    apiEndpoint={BASE_API + "/pigara_deivangal"} 
  />
);

export const UpaDeities = () => (
  <DeityModule 
    title="உப தெய்வங்கள் (Upa Deities)" 
    apiEndpoint={BASE_API + "/uba_deivangal"} 
  />
);

const UpaTeyvankal = UpaDeities;
export default UpaTeyvankal;

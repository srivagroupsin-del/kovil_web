import { BASE_API } from '../api/api_list';
import React from 'react';
import DeityModule from '../components/DeityModule';

const ParivaraTeyvankal = () => {
  return (
    <DeityModule 
      title="பரிவார தெய்வங்கள் (Parivara Deities)" 
      apiEndpoint={BASE_API + "/parivara_deivangal"} 
    />
  );
};

export default ParivaraTeyvankal;

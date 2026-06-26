import { BASE_API } from '../api/api_list';
import React from 'react';
import DeityModule from '../components/DeityModule';

const PikaraTeyvankal = () => {
  return (
    <DeityModule 
      title="பிகாரா தெய்வங்கள் (Pikara Deities)" 
      apiEndpoint={BASE_API + "/pigara_deivangal"} 
    />
  );
};

export default PikaraTeyvankal;

import { BASE_API } from '../api/api_list';
import React from 'react';
import DeityModule from '../components/DeityModule';

const BaliTeyvankal = () => {
  return (
    <DeityModule 
      title="பாலி தெய்வங்கள் (Bali Deities)" 
      apiEndpoint={BASE_API + "/bali_deivangal"} 
    />
  );
};

export default BaliTeyvankal;

import { BASE_API } from '../api/api_list';
import React from 'react';
import DeityModule from '../components/DeityModule';

const KavalTeyvankal = () => {
  return (
    <DeityModule 
      title="காவல் தெய்வங்கள் (Kaval Deities)" 
      apiEndpoint={BASE_API + "/kaval_deivangal"} 
    />
  );
};

export default KavalTeyvankal;

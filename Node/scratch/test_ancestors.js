const axios = require('axios');

const payload = {
  name: "சிவராமகிருஷ்ண முதலியார்",
  description: "கோவிலை நிறுவிய மூத்த முன்னோர்களில் ஒருவர்.",
  gender: "male",
  generation: "1",
  photo_path: "",
  year_from: 1885,
  year_to: 1962
};

axios.post('http://localhost:3002/ancestor/create', payload)
  .then(res => {
    console.log('Create Response:', res.data);
    return axios.get('http://localhost:3002/ancestors');
  })
  .then(res => {
    console.log('Get List Response:', res.data);
  })
  .catch(err => {
    console.error('Error:', err.response ? err.response.data : err.message);
  });

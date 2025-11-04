import React,{useEffect ,useState} from 'react';
import { API_URL } from './api';
function App(){
  const [dbStatus, setDbStatus] = useState('Checking database connection...');
  
  useEffect(() => {
    fetch(`${API_URL}/test`)
      .then(response => response.json())
      .then(data =>
        setDbStatus(data.message));
      },[]);
      return <h1>{dbStatus}</h1>
}

export default App;

import { useState, useEffect } from 'react';
import { fetchPatients, type Patient } from '../../Api/PatientsApi';
import downloadBtn from '../../assets/download.svg';

export const LabResults = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const patients = await fetchPatients();
        const jessicaTaylor = patients.find(p => p.name === 'Jessica Taylor');
        if (jessicaTaylor) {
          setPatient(jessicaTaylor);
        } else {
          setError('Jessica Taylor not found');
        }
      } catch (err) {
        setError('Error fetching patients');
      } finally {
        setLoading(false);
      }
    };
    loadPatients();
  }, []);

  if (loading) {
    return <div style={{ padding: '10px' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: '10px', color: 'red' }}>{error}</div>;
  }

  if (!patient) {
    return <div style={{ padding: '10px' }}>No patient data available</div>;
  }

  const labResults = patient.lab_results || [];
return (
  <div className="p-2.5 bg-white rounded-[5px] shadow-sm max-w-[367px] w-full h-[296px] px-5 py-5">
    <h2 className="text-[24px] font-bold text-gray-800 mb-2.5">Lab Results</h2>
    {labResults.length > 0 ? (
      <ul className="list-none p-0 max-h-[200px] overflow-y-auto flex flex-col justify-center gap-[5px]">
        {labResults.map((result, index) => (
          <li 
            key={index}
            className="flex justify-between items-center py-1.25 text-gray-600 text-[13px] border-b border-gray-200 hover:bg-[#F6F7F8]"
          >
            <span>{result}</span>
            <button className="cursor-pointer text-gray-600 text-base"><img src={downloadBtn} alt="Download"/></button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-600 text-sm">No lab results available.</p>
    )}
  </div>
);
};